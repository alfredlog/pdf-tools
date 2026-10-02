/**
 * PDF Libre – Server
 *
 * Statische Seiten liegen in /public (erzeugt mit `npm run build`).
 * Tools, die im Browser laufen (Teilen, Drehen, Wasserzeichen …), brauchen den Server nicht.
 * Dieser Server übernimmt nur die Tools, für die externe Programme nötig sind:
 *   Ghostscript  → komprimieren, zusammenfügen, schützen, entsperren
 *   LibreOffice  → Word / PowerPoint / Excel → PDF
 *   Python + pdf2docx → PDF → Word
 *   Python + PyMuPDF  → PDF-Editor (Pro, mit Konto)
 */
require("dotenv").config({ quiet: true });
const express = require("express");
const multer = require("multer");
const compression = require("compression");
const { rateLimit } = require("express-rate-limit");
const fs = require("fs");
const fsp = require("fs/promises");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { execFile } = require("child_process");
const db = require("./server/db");
const auth = require("./server/auth");
const billing = require("./server/billing");
const editorRouter = require("./server/editor");

// ---------------------------------------------------------------------------
// Konfiguration (über Umgebungsvariablen anpassbar)
// ---------------------------------------------------------------------------
const PORT = Number(process.env.PORT) || 3000;
const MAX_FILE_MB = Number(process.env.MAX_FILE_MB) || 50;
const MAX_FILES = Number(process.env.MAX_FILES) || 20;
const TMP_ROOT = path.join(os.tmpdir(), "pdf-libre");
const JOB_TIMEOUT_MS = 3 * 60 * 1000;

function findBinary(envName, candidates) {
  if (process.env[envName]) return process.env[envName];
  const isPlainName = (c) => !c.includes("/") && !c.includes("\\");
  for (const c of candidates) {
    if (!isPlainName(c) && fs.existsSync(c)) return c;
  }
  // Fallback: Programmname ohne Pfad, wird im PATH gesucht
  return candidates.find(isPlainName);
}

const GS = findBinary("GS_PATH", [
  process.platform === "win32" ? "gswin64c" : "gs",
  "/opt/homebrew/bin/gs",
  "/usr/local/bin/gs",
]);
const SOFFICE = findBinary("SOFFICE_PATH", [
  "/Applications/LibreOffice.app/Contents/MacOS/soffice",
  "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
  "soffice",
]);
const PYTHON = process.env.PYTHON_PATH || (process.platform === "win32" ? "python" : "python3");

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------
class UserError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

/** Führt ein Programm OHNE Shell aus – Dateinamen können so nichts einschleusen. */
function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { timeout: JOB_TIMEOUT_MS, maxBuffer: 10 * 1024 * 1024, ...opts }, (err, stdout, stderr) => {
      if (err) {
        err.stderr = String(stderr || "");
        return reject(err);
      }
      resolve({ stdout: String(stdout), stderr: String(stderr) });
    });
  });
}

/** Lesbarer Dateiname für den Download, z. B. "Rechnung_komprimiert.pdf" */
function outName(originalName, suffix, ext) {
  const base = path
    .parse(Buffer.from(originalName || "datei", "latin1").toString("utf8"))
    .name.replace(/[^\p{L}\p{N}._ -]+/gu, "_")
    .trim()
    .slice(0, 80) || "datei";
  return `${base}${suffix}${ext}`;
}

function formatError(err) {
  if (err && err.code === "ENOENT") {
    return new UserError("Dieses Werkzeug ist auf dem Server gerade nicht verfügbar.", 503);
  }
  if (err && err.killed) {
    return new UserError("Die Verarbeitung hat zu lange gedauert. Versuche es mit einer kleineren Datei.", 504);
  }
  return err;
}

// Temporärer Ordner pro Anfrage – wird nach dem Download immer gelöscht
function jobDir(req, res, next) {
  const dir = path.join(TMP_ROOT, crypto.randomUUID());
  fs.mkdirSync(dir, { recursive: true });
  req.jobDir = dir;
  const cleanup = () => fsp.rm(dir, { recursive: true, force: true }).catch(() => {});
  res.on("finish", cleanup);
  res.on("close", cleanup);
  next();
}

const EXT = {
  pdf: [".pdf"],
  word: [".doc", ".docx", ".odt", ".rtf"],
  powerpoint: [".ppt", ".pptx", ".odp"],
  excel: [".xls", ".xlsx", ".ods", ".csv"],
};

function uploader(kind, { multiple = false } = {}) {
  const allowed = EXT[kind];
  const m = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, req.jobDir),
      filename: (req, file, cb) => cb(null, `in-${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
    }),
    limits: { fileSize: MAX_FILE_MB * 1024 * 1024, files: MAX_FILES },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (!allowed.includes(ext)) {
        return cb(new UserError(`Dateityp ${ext || "unbekannt"} wird hier nicht unterstützt. Erlaubt: ${allowed.join(", ")}`));
      }
      cb(null, true);
    },
  });
  const handler = multiple ? m.array("file", MAX_FILES) : m.single("file");
  return (req, res, next) =>
    handler(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") return next(new UserError(`Die Datei ist größer als ${MAX_FILE_MB} MB.`, 413));
        if (err.code === "LIMIT_FILE_COUNT") return next(new UserError(`Maximal ${MAX_FILES} Dateien auf einmal.`, 413));
        return next(new UserError("Upload fehlgeschlagen."));
      }
      next(err);
    });
}

function requireFiles(req) {
  const files = req.files || (req.file ? [req.file] : []);
  if (!files.length) throw new UserError("Bitte lade zuerst eine Datei hoch.");
  return files;
}

async function sendFile(res, filePath, downloadName, extraHeaders = {}) {
  for (const [k, v] of Object.entries(extraHeaders)) res.setHeader(k, String(v));
  await new Promise((resolve, reject) =>
    res.download(filePath, downloadName, (err) => (err && !res.headersSent ? reject(err) : resolve()))
  );
}

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch((e) => next(formatError(e)));

// ---------------------------------------------------------------------------
// Ghostscript
// ---------------------------------------------------------------------------
const COMPRESSION_LEVELS = {
  low: "/printer", // wenig Kompression, sehr gute Qualität
  recommended: "/ebook", // guter Kompromiss
  strong: "/screen", // maximale Kompression
};

function gsCompress(input, output, level = "recommended") {
  const setting = COMPRESSION_LEVELS[level] || COMPRESSION_LEVELS.recommended;
  return run(GS, [
    "-sDEVICE=pdfwrite",
    "-dCompatibilityLevel=1.5",
    `-dPDFSETTINGS=${setting}`,
    "-dDetectDuplicateImages=true",
    "-dNOPAUSE",
    "-dQUIET",
    "-dBATCH",
    "-dSAFER",
    "-dAutoRotatePages=/None", // Seiten nie automatisch drehen
    `-sOutputFile=${output}`,
    input,
  ]);
}

function gsMerge(inputs, output) {
  return run(GS, [
    "-dBATCH",
    "-dNOPAUSE",
    "-dQUIET",
    "-dSAFER",
    "-dAutoRotatePages=/None", // Seiten nie automatisch drehen
    "-sDEVICE=pdfwrite",
    `-sOutputFile=${output}`,
    ...inputs,
  ]);
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
const app = express();
app.disable("x-powered-by");
// Hinter einem Reverse Proxy (Caddy, nginx) die echte Besucher-IP verwenden.
// Ohne TRUST_PROXY wird nur ein Proxy auf demselben Server (127.0.0.1) vertraut – das ist immer sicher.
app.set("trust proxy", process.env.TRUST_PROXY ? Number(process.env.TRUST_PROXY) || 1 : "loopback");
app.use(compression());

// Stripe-Webhook braucht den unveränderten Rohtext – deshalb ganz vorne
app.post("/api/stripe/webhook", ...billing.webhook());
app.use("/api", auth.loadUser);

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// /index.html → / (eine URL pro Seite ist besser für Google)
app.get("/index.html", (req, res) => res.redirect(301, "/"));

// /compress.html/ → /compress.html (Google hat alte Links mit Schrägstrich am Ende gefunden)
app.use((req, res, next) => {
  if ((req.method === "GET" || req.method === "HEAD") && /\.html\/+$/.test(req.path)) {
    const q = req.originalUrl.indexOf("?");
    return res.redirect(301, req.path.replace(/\/+$/, "") + (q >= 0 ? req.originalUrl.slice(q) : ""));
  }
  next();
});

app.use(
  express.static(path.join(__dirname, "public"), {
    extensions: ["html"],
    setHeaders(res, filePath) {
      if (/\.(woff2|png|svg|ico)$/.test(filePath) || filePath.includes(`${path.sep}vendor${path.sep}`)) {
        res.setHeader("Cache-Control", "public, max-age=2592000"); // 30 Tage
      } else if (/\.(css|js)$/.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=86400"); // 1 Tag
      }
    },
  })
);

const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT) || 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Zu viele Anfragen. Bitte warte ein paar Minuten." },
});

const api = express.Router();
api.use(apiLimiter, jobDir);

// PDF komprimieren -----------------------------------------------------------
api.post(
  "/compress",
  uploader("pdf"),
  wrap(async (req, res) => {
    const [file] = requireFiles(req);
    const out = path.join(req.jobDir, "out.pdf");
    await gsCompress(file.path, out, req.body.level);
    const before = file.size;
    let after = (await fsp.stat(out)).size;
    let result = out;
    // Wenn die Datei nicht kleiner wird, geben wir das Original zurück
    if (after >= before) {
      result = file.path;
      after = before;
    }
    await sendFile(res, result, outName(file.originalname, "_komprimiert", ".pdf"), {
      "X-Original-Size": before,
      "X-Result-Size": after,
    });
  })
);

// PDFs zusammenfügen ----------------------------------------------------------
api.post(
  "/merge",
  uploader("pdf", { multiple: true }),
  wrap(async (req, res) => {
    const files = requireFiles(req);
    if (files.length < 2) throw new UserError("Bitte wähle mindestens zwei PDF-Dateien aus.");
    const out = path.join(req.jobDir, "merged.pdf");
    await gsMerge(files.map((f) => f.path), out);
    await sendFile(res, out, outName(files[0].originalname, "_zusammengefuegt", ".pdf"));
  })
);

// Zusammenfügen + komprimieren ----------------------------------------------
api.post(
  "/merge-compress",
  uploader("pdf", { multiple: true }),
  wrap(async (req, res) => {
    const files = requireFiles(req);
    const merged = path.join(req.jobDir, "merged.pdf");
    const out = path.join(req.jobDir, "out.pdf");
    await gsMerge(files.map((f) => f.path), merged);
    await gsCompress(merged, out, req.body.level);
    const before = files.reduce((s, f) => s + f.size, 0);
    const after = (await fsp.stat(out)).size;
    await sendFile(res, out, outName(files[0].originalname, "_zusammengefuegt_komprimiert", ".pdf"), {
      "X-Original-Size": before,
      "X-Result-Size": after,
    });
  })
);

// PDF schützen ------------------------------------------------------------------
api.post(
  "/protect",
  uploader("pdf"),
  wrap(async (req, res) => {
    const [file] = requireFiles(req);
    const password = String(req.body.password || "");
    if (password.length < 4) throw new UserError("Das Passwort muss mindestens 4 Zeichen lang sein.");
    if (password.length > 64) throw new UserError("Das Passwort darf höchstens 64 Zeichen lang sein.");
    const out = path.join(req.jobDir, "out.pdf");
    const ownerPassword = crypto.randomBytes(16).toString("hex");
    await run(GS, [
      "-sDEVICE=pdfwrite",
      "-dNOPAUSE",
      "-dQUIET",
      "-dBATCH",
      "-dSAFER",
    "-dAutoRotatePages=/None", // Seiten nie automatisch drehen
      "-dEncryptionR=3",
      "-dKeyLength=128",
      `-sOwnerPassword=${ownerPassword}`,
      `-sUserPassword=${password}`,
      `-sOutputFile=${out}`,
      file.path,
    ]);
    await sendFile(res, out, outName(file.originalname, "_geschuetzt", ".pdf"));
  })
);

// PDF entsperren --------------------------------------------------------------
api.post(
  "/unlock",
  uploader("pdf"),
  wrap(async (req, res) => {
    const [file] = requireFiles(req);
    const password = String(req.body.password || "");
    const out = path.join(req.jobDir, "out.pdf");
    try {
      await run(GS, [
        "-sDEVICE=pdfwrite",
        "-dNOPAUSE",
        "-dQUIET",
        "-dBATCH",
        "-dSAFER",
    "-dAutoRotatePages=/None", // Seiten nie automatisch drehen
        `-sPDFPassword=${password}`,
        `-sOutputFile=${out}`,
        file.path,
      ]);
    } catch (e) {
      if (/password/i.test(e.stderr || "")) throw new UserError("Das Passwort ist falsch.");
      throw e;
    }
    await sendFile(res, out, outName(file.originalname, "_entsperrt", ".pdf"));
  })
);

// Office → PDF (LibreOffice) ------------------------------------------------------
function officeToPdf(kind) {
  return [
    uploader(kind),
    wrap(async (req, res) => {
      const [upload] = requireFiles(req);
      // Datei unter ihrem echten Namen ablegen: LibreOffice druckt den Dateinamen z. B. in Excel-Kopfzeilen
      const niceName = outName(upload.originalname, "", path.extname(upload.filename));
      const file = { ...upload, filename: niceName, path: path.join(req.jobDir, niceName) };
      await fsp.rename(upload.path, file.path);
      // Eigenes LibreOffice-Profil pro Auftrag: parallele Konvertierungen blockieren sich nicht
      const profile = "file://" + path.join(req.jobDir, "lo-profile").split(path.sep).join("/");
      await run(SOFFICE, [
        `-env:UserInstallation=${profile}`,
        "--headless",
        "--norestore",
        "--convert-to",
        "pdf",
        "--outdir",
        req.jobDir,
        file.path,
      ]);
      const out = path.join(req.jobDir, path.parse(file.filename).name + ".pdf");
      if (!fs.existsSync(out)) throw new UserError("Die Datei konnte nicht umgewandelt werden. Ist sie beschädigt?", 422);
      await sendFile(res, out, outName(file.originalname, "", ".pdf"));
    }),
  ];
}
api.post("/word-to-pdf", ...officeToPdf("word"));
api.post("/powerpoint-to-pdf", ...officeToPdf("powerpoint"));
api.post("/excel-to-pdf", ...officeToPdf("excel"));

// PDF → Word (Python pdf2docx) ------------------------------------------------------
api.post(
  "/pdf-to-word",
  uploader("pdf"),
  wrap(async (req, res) => {
    const [file] = requireFiles(req);
    const out = path.join(req.jobDir, "out.docx");
    await run(PYTHON, [path.join(__dirname, "convert_pdf2docx.py"), file.path, out]);
    await sendFile(res, out, outName(file.originalname, "", ".docx"));
  })
);

// Health-Check: zeigt, welche Programme installiert sind --------------------------------
app.get("/api/health", async (req, res) => {
  const check = async (cmd, args) => {
    try {
      await run(cmd, args, { timeout: 20000 });
      return true;
    } catch {
      return false;
    }
  };
  const [ghostscript, libreoffice, pdf2docx] = await Promise.all([
    check(GS, ["--version"]),
    check(SOFFICE, ["--version"]),
    check(PYTHON, ["-c", "import pdf2docx"]),
  ]);
  const pymupdf = await check(PYTHON, ["-c", "import pymupdf"]);
  res.json({ ok: true, ghostscript, libreoffice, pdf2docx, pymupdf, database: db.enabled, stripe: billing.enabled });
});

app.use("/api/auth", auth.router());
app.use("/api/billing", billing.router());
app.use("/api/pro", apiLimiter, editorRouter({ run, jobDir, PYTHON, outName, MAX_FILE_MB }));
app.use("/api", api);

// Alte URLs der ersten Version weiter unterstützen
const legacy = {
  "/compress": "/api/compress",
  "/merge": "/api/merge",
  "/merge-compress": "/api/merge-compress",
  "/pdf-to-docx": "/api/pdf-to-word",
  "/docx-to-pdf": "/api/word-to-pdf",
};
for (const [from, to] of Object.entries(legacy)) {
  app.post(from, (req, res) => res.redirect(307, to));
}

// Fehlerbehandlung -----------------------------------------------------------
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}:`, err.stderr || err);
  if (res.headersSent) return;
  const known = err instanceof UserError || err instanceof auth.ApiError;
  const message = status >= 500 && !known ? "Bei der Verarbeitung ist ein Fehler aufgetreten. Bitte versuche es erneut." : err.message;
  if (req.path.startsWith("/api/")) return res.status(status).json({ error: message, code: err instanceof auth.ApiError ? err.code : undefined });
  res.status(status).send(message);
});

// 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

// Liegengebliebene Dateien (z. B. nach Absturz) regelmäßig aufräumen
async function sweep() {
  try {
    const entries = await fsp.readdir(TMP_ROOT, { withFileTypes: true });
    const cutoff = Date.now() - 30 * 60 * 1000;
    await Promise.all(
      entries.map(async (e) => {
        const p = path.join(TMP_ROOT, e.name);
        const st = await fsp.stat(p).catch(() => null);
        if (st && st.mtimeMs < cutoff) await fsp.rm(p, { recursive: true, force: true });
      })
    );
  } catch {
    /* Ordner existiert noch nicht */
  }
}
fs.mkdirSync(TMP_ROOT, { recursive: true });
setInterval(sweep, 10 * 60 * 1000).unref();
sweep();

db.init()
  .catch((e) => {
    console.error("Datenbank konnte nicht initialisiert werden:", e.message);
    process.exit(1);
  })
  .then(() => app.listen(PORT, () => {
  console.log(`PDF Libre läuft auf http://localhost:${PORT}`);
  console.log(`Prüfe die installierten Programme: http://localhost:${PORT}/api/health`);
  console.log(`Konten: ${db.enabled ? "an" : "aus (DATABASE_URL fehlt)"} · Stripe: ${billing.enabled ? "an" : "aus (STRIPE_* fehlt)"}`);
}));

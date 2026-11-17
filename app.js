/**
 * PDF Libre – Server
 *
 * Statische Seiten liegen in /public (erzeugt mit `npm run build`).
 * Tools, die im Browser laufen (Teilen, Drehen, Wasserzeichen …), brauchen den Server nicht.
 * Dieser Server übernimmt nur die Tools, für die externe Programme nötig sind:
 *   Ghostscript  → komprimieren, zusammenfügen, schützen, entsperren
 *   LibreOffice  → Word / PowerPoint / Excel → PDF
 *   Python + pdf2docx → PDF → Word
 *   Python + PyMuPDF  → PDF-Editor (kostenlos oder Pro – siehe PAYMENTS_ENABLED)
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
const payments = require("./server/payments");
const editorRouter = require("./server/editor");
const aiRouter = require("./server/ai");
const agentApi = require("./server/agent-api");

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
  mappe: [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx", ".odt", ".rtf"],
  einvoice: [".xml", ".pdf"],
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

// Ohne Bezahlung: Preisseite gibt es nicht, und die kostenlose Fassung der Seiten
// (public/_free, erzeugt mit `npm run build`) hat Vorrang vor den Pro-Seiten.
const FREE_DIR = path.join(__dirname, "public", "_free");
app.use((req, res, next) => {
  if (/^\/_free(\/|$)/.test(req.path)) return res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
  next();
});
if (!payments.enabled) {
  app.get(["/preise", "/preise.html"], (req, res) => res.redirect(302, "/"));
  if (!fs.existsSync(FREE_DIR)) console.warn("public/_free fehlt – bitte `npm run build` ausführen.");
  app.use(express.static(FREE_DIR, { extensions: ["html"], index: "index.html" }));
}

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
  // Schriftdateien für die Editor-Vorschau zählen nicht mit (werden vom Browser zwischengespeichert)
  skip: (req) => req.method === "GET" && (req.path.startsWith("/sysfont/") || req.originalUrl.startsWith("/api/slides/")),
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

/** Datei mit LibreOffice umwandeln (eigenes Profil pro Auftrag, damit Aufträge sich nicht blockieren) */
async function sofficeConvert(filePath, jobDirPath, format, infilter) {
  const profile = "file://" + path.join(jobDirPath, "lo-profile").split(path.sep).join("/");
  const outDir = path.join(jobDirPath, "lo-out");
  await fsp.mkdir(outDir, { recursive: true });
  await run(SOFFICE, [
    `-env:UserInstallation=${profile}`,
    "--headless",
    "--norestore",
    ...(infilter ? [`--infilter=${infilter}`] : []),
    "--convert-to",
    format,
    "--outdir",
    outDir,
    filePath,
  ]);
  const out = path.join(outDir, path.parse(filePath).name + "." + format.split(":")[0]);
  if (!fs.existsSync(out)) throw new UserError("Die Datei konnte nicht umgewandelt werden. Ist sie beschädigt?", 422);
  return out;
}

// PDF → Excel (Tabellen erkennen) ---------------------------------------------------
api.post(
  "/pdf-to-excel",
  uploader("pdf"),
  wrap(async (req, res) => {
    const [file] = requireFiles(req);
    const out = path.join(req.jobDir, "out.xlsx");
    try {
      await run(PYTHON, [path.join(__dirname, "pdf_to_excel.py"), file.path, out]);
    } catch (e) {
      if (/password/.test(e.stderr || "")) throw new UserError("Diese PDF ist passwortgeschützt. Entsperre sie zuerst mit „PDF entsperren“.");
      throw e;
    }
    await sendFile(res, out, outName(file.originalname, "", ".xlsx"));
  })
);

// PDF → PowerPoint (LibreOffice: Text bleibt bearbeitbar) ---------------------------
api.post(
  "/pdf-to-powerpoint",
  uploader("pdf"),
  wrap(async (req, res) => {
    const [file] = requireFiles(req);
    const out = await sofficeConvert(file.path, req.jobDir, "pptx", "impress_pdf_import");
    // Weißer Hintergrund, sonst zeigt Keynote Folien aus LaTeX/Beamer-PDFs schwarz an
    await run(PYTHON, [path.join(__dirname, "pptx_white_bg.py"), out]);
    await sendFile(res, out, outName(file.originalname, "", ".pptx"));
  })
);

// PDF → Folien mit Design-Auswahl ----------------------------------------------------
// 1) /api/slides/analyze zerlegt die PDF (Bild ohne Text + Textfelder) und hebt das Ergebnis
//    bis zu 30 Minuten auf, damit die Vorschau im Browser live umgestellt werden kann.
// 2) /api/slides/:token/build erzeugt erst beim Herunterladen die PPTX mit den gewählten Optionen.
const SLIDES_TOKEN = /^[0-9a-f-]{36}$/;
const slidesDir = (token) => path.join(TMP_ROOT, "slides-" + token);

api.post(
  "/slides/analyze",
  uploader("pdf"),
  wrap(async (req, res) => {
    const [file] = requireFiles(req);
    const token = crypto.randomUUID();
    const dir = slidesDir(token);
    await fsp.mkdir(dir, { recursive: true });
    try {
      await run(PYTHON, [path.join(__dirname, "pdf_slides.py"), "analyze", file.path, dir]);
    } catch (e) {
      await fsp.rm(dir, { recursive: true, force: true });
      if (/password/.test(e.stderr || "")) throw new UserError("Diese PDF ist passwortgeschützt. Entsperre sie zuerst mit „PDF entsperren“.");
      if (/missing-module:|ModuleNotFoundError/.test(e.stderr || "")) throw new UserError("PowerPoint-Umwandlung ist auf dem Server noch nicht eingerichtet (Python-Pakete fehlen).", 503);
      const many = /zu viele Seiten:(\d+)/.exec(e.stderr || "");
      if (many) throw new UserError(`Die PDF hat zu viele Seiten (höchstens ${many[1]}). Teile sie zuerst mit „PDF teilen“.`, 413);
      throw e;
    }
    const name = outName(file.originalname, "", ".pptx");
    await fsp.writeFile(path.join(dir, "meta.json"), JSON.stringify({ name }));
    const data = JSON.parse(await fsp.readFile(path.join(dir, "slides.json"), "utf8"));
    res.json({ token, name, ...data });
  })
);

api.post(
  "/slides/:token/build",
  express.json({ limit: "20kb" }),
  wrap(async (req, res) => {
    const { token } = req.params;
    const dir = slidesDir(token);
    if (!SLIDES_TOKEN.test(token) || !fs.existsSync(path.join(dir, "slides.json"))) {
      throw new UserError("Die Vorschau ist abgelaufen. Bitte lade die PDF noch einmal hoch.", 410);
    }
    const b = req.body || {};
    const hex = (v) => (typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) ? v : null);
    const opts = {
      pages: Array.isArray(b.pages) ? b.pages.filter((n) => Number.isInteger(n) && n >= 0 && n < 1000).slice(0, 1000) : undefined,
      format: ["4:3", "16:9", "orig"].includes(b.format) ? b.format : "orig",
      bg: hex(b.bg) || "#ffffff",
      accent: hex(b.accent),
      font: typeof b.font === "string" && /^[\p{L}\p{N} -]{1,40}$/u.test(b.font) ? b.font : "orig",
      hideRepeat: b.hideRepeat === true,
    };
    const optsFile = path.join(req.jobDir, "options.json");
    const out = path.join(req.jobDir, "out.pptx");
    await fsp.writeFile(optsFile, JSON.stringify(opts));
    await fsp.utimes(dir, new Date(), new Date()).catch(() => {});
    try {
      await run(PYTHON, [path.join(__dirname, "pdf_slides.py"), "build", dir, optsFile, out]);
    } catch (e) {
      if (/missing-module:|ModuleNotFoundError/.test(e.stderr || "")) throw new UserError("PowerPoint-Umwandlung ist auf dem Server noch nicht eingerichtet (Python-Pakete fehlen).", 503);
      throw e;
    }
    const meta = JSON.parse(await fsp.readFile(path.join(dir, "meta.json"), "utf8"));
    await sendFile(res, out, meta.name);
  })
);

// Bewerbungsmappe: Dokumente, Bilder und Word-Dateien zu einer PDF ------------------
api.post(
  "/bewerbungsmappe",
  uploader("mappe", { multiple: true }),
  wrap(async (req, res) => {
    const files = requireFiles(req);
    const parts = [];
    let originalBytes = 0;
    for (const f of files) {
      const ext = path.extname(f.originalname).toLowerCase();
      const label = path.parse(Buffer.from(f.originalname, "latin1").toString("utf8")).name.replace(/[_-]+/g, " ").trim();
      originalBytes += f.size;
      if ([".jpg", ".jpeg", ".png"].includes(ext)) parts.push({ path: f.path, kind: "image", label });
      else if (ext === ".pdf") parts.push({ path: f.path, kind: "pdf", label });
      else parts.push({ path: await sofficeConvert(f.path, req.jobDir, "pdf"), kind: "pdf", label });
    }
    const b = req.body || {};
    const cover = b.cover === "yes" ? { name: b.name, position: b.position, company: b.company, email: b.email, phone: b.phone, address: b.address } : null;
    for (const [k, v] of Object.entries(cover || {})) cover[k] = String(v || "").slice(0, 120);
    const spec = path.join(req.jobDir, "mappe.json");
    const out = path.join(req.jobDir, "Bewerbung.pdf");
    await fsp.writeFile(spec, JSON.stringify({ files: parts, cover, pageNumbers: b.pageNumbers === "yes", maxMb: Number(b.maxMb) || 0 }));
    try {
      await run(PYTHON, [path.join(__dirname, "bewerbungsmappe.py"), spec, out]);
    } catch (e) {
      if (/password/.test(e.stderr || "")) throw new UserError("Eine der PDFs ist passwortgeschützt. Entsperre sie zuerst mit „PDF entsperren“.");
      throw e;
    }
    const name = cover && cover.name ? `Bewerbung_${cover.name}` : "Bewerbung";
    await sendFile(res, out, outName(name, "", ".pdf"), { "X-Original-Size": originalBytes, "X-Result-Size": (await fsp.stat(out)).size });
  })
);

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

// E-Rechnung anzeigen / prüfen ---------------------------------------------------
// Die Verarbeitung macht der separate E-Rechnung-Dienst (Python, gleicher Server).
// Er liefert eine lesbare PDF mit Prüfergebnis zurück.
const ERECHNUNG_API_URL = (process.env.ERECHNUNG_API_URL || "").replace(/\/$/, "");

api.post(
  "/e-rechnung",
  uploader("einvoice"),
  wrap(async (req, res) => {
    const [file] = requireFiles(req);
    if (!ERECHNUNG_API_URL) throw new UserError("Dieses Werkzeug ist gerade nicht verfügbar.", 503);

    const form = new FormData();
    form.append("file", new Blob([await fsp.readFile(file.path)]), file.originalname);
    let upstream;
    try {
      upstream = await fetch(`${ERECHNUNG_API_URL}/api/v1/render`, {
        method: "POST",
        body: form,
        signal: AbortSignal.timeout(60_000),
      });
    } catch {
      throw new UserError("Der Prüfdienst antwortet gerade nicht. Bitte versuche es gleich noch einmal.", 503);
    }
    if (!upstream.ok) {
      let msg = "Die Datei konnte nicht gelesen werden.";
      try {
        msg = (await upstream.json()).error || msg;
      } catch {
        /* keine JSON-Antwort */
      }
      throw new UserError(
        upstream.status === 422 ? `${msg} Erwartet wird eine XRechnung (XML) oder eine ZUGFeRD-PDF.` : msg,
        upstream.status === 422 ? 422 : 502
      );
    }
    for (const h of ["Content-Disposition", "X-Result-Info", "X-Check-Ok"]) {
      const v = upstream.headers.get(h);
      if (v) res.setHeader(h, v);
    }
    res.setHeader("Content-Type", "application/pdf");
    res.send(Buffer.from(await upstream.arrayBuffer()));
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
  let erechnung = false;
  if (ERECHNUNG_API_URL) {
    try {
      erechnung = (await fetch(`${ERECHNUNG_API_URL}/health`, { signal: AbortSignal.timeout(5000) })).ok;
    } catch {
      erechnung = false;
    }
  }
  res.json({ ok: true, ghostscript, libreoffice, pdf2docx, pymupdf, ai: aiRouter.enabled, erechnung, database: db.enabled, stripe: billing.enabled, payments: payments.enabled });
});

app.use("/api/auth", auth.router());
app.use("/api/billing", billing.router());
app.use("/api/pro", apiLimiter, editorRouter({ run, jobDir, PYTHON, outName, MAX_FILE_MB }));
app.use("/api/ai", aiRouter({ run, jobDir, PYTHON, outName, uploader, requireFiles, sendFile }));

// Agenten-API (Bezahlung pro Aufruf in BSV, siehe server/agent-api.js) – nur wenn AGENT_API_ENABLED=true
if (agentApi.enabled) {
  try {
    app.use("/agent/v1", apiLimiter, agentApi.router({ gsCompress, gsMerge, jobDir, outName, MAX_FILE_MB }));
  } catch (e) {
    console.error("Agenten-API nicht gestartet:", e.message);
  }
}
// Folienbilder für die Vorschau (ohne jobDir: der Ordner bleibt bis zum Aufräumen bestehen)
app.get("/api/slides/:token/:img", (req, res) => {
  const { token, img } = req.params;
  if (!SLIDES_TOKEN.test(token) || !/^((dark-)?page|thumb)-\d{3}\.png$/.test(img)) return res.status(404).end();
  const file = path.join(slidesDir(token), img);
  if (!fs.existsSync(file)) return res.status(404).end();
  fsp.utimes(slidesDir(token), new Date(), new Date()).catch(() => {});
  res.setHeader("Cache-Control", "private, max-age=1800");
  res.sendFile(file);
});
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
  const free404 = path.join(FREE_DIR, "404.html");
  res.status(404).sendFile(!payments.enabled && fs.existsSync(free404) ? free404 : path.join(__dirname, "public", "404.html"));
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
  console.log(`Bezahlung: ${payments.enabled ? "an (PDF-Editor mit Pro)" : "aus – alle Werkzeuge kostenlos"}`);
  console.log(`Konten: ${db.enabled ? "an" : "aus (DATABASE_URL fehlt)"} · Stripe: ${billing.enabled ? "an" : "aus (STRIPE_* fehlt)"}`);
  if (agentApi.enabled) console.log(`Agenten-API: http://localhost:${PORT}/agent/v1 (Bezahlung in BSV)`);
}));

/**
 * PDF-Editor (Pro): Export der im Browser erstellten Änderungen.
 * Die eigentliche Arbeit macht pdf_edit.py (PyMuPDF): Inhalte echt entfernen, neue Elemente zeichnen.
 */
const express = require("express");
const multer = require("multer");
const path = require("path");
const fsp = require("fs/promises");
const crypto = require("crypto");
const { requireAccess, requireDb, ApiError } = require("./auth");
const payments = require("./payments");

module.exports = function editorRouter({ run, jobDir, PYTHON, outName, MAX_FILE_MB }) {
  const r = express.Router();

  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, req.jobDir),
      filename: (req, file, cb) => {
        if (file.fieldname === "file") return cb(null, "source.pdf");
        const ext = file.mimetype === "image/png" ? ".png" : ".jpg";
        cb(null, `img-${crypto.randomUUID()}${ext}`);
      },
    }),
    limits: { fileSize: MAX_FILE_MB * 1024 * 1024, files: 41, fieldSize: 8 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.fieldname === "file" && path.extname(file.originalname).toLowerCase() === ".pdf") return cb(null, true);
      if (file.fieldname === "images" && ["image/png", "image/jpeg"].includes(file.mimetype)) return cb(null, true);
      cb(new ApiError("Ungültige Datei im Upload."));
    },
  }).fields([
    { name: "file", maxCount: 1 },
    { name: "images", maxCount: 40 },
  ]);

  // Mit Bezahlung: Konto + Zugang prüfen. Ohne: kostenlos für alle, auch ohne Datenbank.
  const access = payments.enabled ? [requireDb, requireAccess] : [];

  r.post("/export", ...access, jobDir, (req, res, next) =>
    upload(req, res, async (err) => {
      try {
        if (err) {
          if (err.code === "LIMIT_FILE_SIZE") throw new ApiError(`Eine Datei ist größer als ${MAX_FILE_MB} MB.`, 413);
          throw err instanceof ApiError ? err : new ApiError("Upload fehlgeschlagen.");
        }
        let spec;
        try {
          spec = JSON.parse(req.body.spec || "");
        } catch {
          throw new ApiError("Die Bearbeitung konnte nicht gelesen werden.");
        }
        if (!Array.isArray(spec.pages) || !spec.pages.length) throw new ApiError("Das Dokument hat keine Seiten.");

        // Bild-Platzhalter ("images[3]") auf die gespeicherten Dateinamen abbilden
        const images = (req.files && req.files.images) || [];
        for (const page of spec.pages) {
          for (const item of page.items || []) {
            if (item.type === "image") {
              const f = images[Number(item.image)];
              item.file = f ? f.filename : "";
            }
          }
        }
        const specPath = path.join(req.jobDir, "spec.json");
        await fsp.writeFile(specPath, JSON.stringify(spec));

        const source = req.files && req.files.file && req.files.file[0];
        const out = path.join(req.jobDir, "out.pdf");
        try {
          await run(PYTHON, [path.join(__dirname, "..", "pdf_edit.py"), specPath, source ? source.path : "-", out, req.jobDir]);
        } catch (e) {
          if (/password/.test(e.stderr || "")) throw new ApiError("Diese PDF ist passwortgeschützt. Entsperre sie zuerst.");
          throw e;
        }
        const name = source ? outName(source.originalname, "_bearbeitet", ".pdf") : "Neues_Dokument.pdf";
        res.download(out, name);
      } catch (e) {
        next(e);
      }
    })
  );

  // ---------------------------------------------------------------------------
  // Schriften für die Editor-Vorschau: dieselben Schriften wie beim Export,
  // damit die Vorschau auf jedem Gerät gleich aussieht (unabhängig von installierten Schriften).
  // ---------------------------------------------------------------------------
  const sysFonts = new Map(); // id → Pfad einer Systemschrift (nur von fc-match gelieferte Dateien)
  const FONT_DIRS = ["/usr/share/fonts/", "/usr/local/share/fonts/", "/usr/share/texmf/fonts/", "/usr/share/texlive/"];

  const uploadPdf = multer({
    storage: multer.diskStorage({ destination: (req, file, cb) => cb(null, req.jobDir), filename: (req, file, cb) => cb(null, "source.pdf") }),
    limits: { fileSize: MAX_FILE_MB * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => (file.fieldname === "file" ? cb(null, true) : cb(new ApiError("Ungültige Datei im Upload."))),
  }).single("file");

  r.post("/fonts", jobDir, (req, res, next) =>
    uploadPdf(req, res, async (err) => {
      try {
        if (err) throw err instanceof ApiError ? err : new ApiError("Upload fehlgeschlagen.");
        if (!req.file) throw new ApiError("Keine PDF erhalten.");
        const out = path.join(req.jobDir, "fonts.json");
        await run(PYTHON, [path.join(__dirname, "..", "pdf_fonts.py"), req.file.path, out]);
        const data = JSON.parse(await fsp.readFile(out, "utf8"));
        for (const info of Object.values(data.fonts || {})) {
          for (const [variant, file] of Object.entries(info.fallback || {})) {
            if (!FONT_DIRS.some((d) => file.startsWith(d))) {
              delete info.fallback[variant];
              continue;
            }
            const id = crypto.createHash("sha1").update(file).digest("hex").slice(0, 16);
            sysFonts.set(id, file);
            info.fallback[variant] = `/api/pro/sysfont/${id}${path.extname(file).toLowerCase()}`;
          }
        }
        res.json(data);
      } catch (e) {
        next(e);
      }
    })
  );

  r.get("/sysfont/:id", (req, res) => {
    const file = sysFonts.get(String(req.params.id).replace(/\.(ttf|otf)$/i, ""));
    if (!file) return res.status(404).end();
    res.set("Cache-Control", "public, max-age=2592000, immutable");
    res.sendFile(file);
  });

  return r;
};

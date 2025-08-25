const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { PDFDocument } = require("pdf-lib");
const sharp = require("sharp");
const path = require("path");
const cors = require("cors");
const { exec } = require("child_process")
const libre = require("libreoffice-convert");
const convertDocx = require("docx-pdf");
//process.env.LIBREOFFICE_PATH = "/Applications/LibreOffice.app/Contents/MacOS/soffice";


const UPLOAD_DIR = "uploads";
const CONVERTED_DIR = "converted";

// Ordner erstellen, falls sie fehlen
[UPLOAD_DIR, CONVERTED_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const app = express();
app.use(cors())
const port = 3005;
app.use(express.static(path.join(__dirname, 'public')));

// Speicher für hochgeladene PDFs
const upload = multer({ dest: "uploads/" });
const safeName = (name, ext) => path.parse(name).name.replace(/[^a-zA-Z0-9._-]+/g,"_") + ext;

// Ghostscript-Komprimierung
function compressPDF(inputPath, outputPath, quality = "/ebook") {
  return new Promise((resolve, reject) => {
    const cmd = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${quality} -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`;

    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// API-Route
app.post("/compress", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).send("Keine PDF hochgeladen");

    const outputFile = path.join("uploads", "compressed-" + file.originalname);

    // Ghostscript ausführen
    await compressPDF(file.path, outputFile, "/ebook"); // Optionen: /screen, /ebook, /printer, /prepress

    // Datei zum Download senden
    res.download(outputFile, (err) => {
      // temporäre Dateien löschen
      fs.unlinkSync(file.path);
      fs.unlinkSync(outputFile);
    });
  } catch (err) {
    console.error(err);
    console.log(err)
    res.status(500).send("Fehler beim Komprimieren");
  }
})

// DOCX → PDF (Node-Modul)
/*app.post("/docx-to-pdf", upload.single("file"), (req, res) => {
  const inputPath = req.file.path;
  const outputPath = path.join("converted", req.file.originalname + ".pdf");

  convertDocx(inputPath, outputPath, (err) => {
    if (err) {
      return res.status(500).send("Fehler bei der DOCX → PDF Konvertierung");
    }
    res.download(outputPath, () => {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  });
});
*/
app.post("/docx-to-pdf", upload.single("file"), (req, res) => {
  const input = fs.readFileSync(req.file.path);
  const outputPath = path.join("converted", safeName(req.file.originalname, ".pdf"));

  libre.convert(input, ".pdf", undefined, (err, done) => {
    if (err) return res.status(500).send("Konvertierungsfehler");

    fs.writeFileSync(outputPath, done);
    res.download(outputPath, () => {
      fs.unlinkSync(req.file.path);
      fs.unlinkSync(outputPath);
    });
  });
});


// PDF → DOCX
const uploadd = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
app.post("/pdf-to-docx", uploadd.single("fille"), (req, res) => {
  const pdfBuffer = req.file.buffer;

  // PDF → DOCX konvertieren
  libre.convert(pdfBuffer, ".docx", undefined, (err, done) => {
    if (err) {
      console.error("Konvertierungsfehler:", err);
      return res.status(500).send("Konvertierung fehlgeschlagen");
    }

    // Download erzwingen
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", "attachment; filename=output.docx");
    res.end(done); // sendet direkt den DOCX-Buffer an den Browser
  })
});


//Merge


function compressPDF(inputPath, outputPath, quality = "/ebook") {
  return new Promise((resolve, reject) => {
    const cmd = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${quality} -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`;
    exec(cmd, (err) => (err ? reject(err) : resolve()));
  });
}

function mergePDFs(inputPaths, outputPath) {
  return new Promise((resolve, reject) => {
    const cmd = `gs -dBATCH -dNOPAUSE -q -sDEVICE=pdfwrite -sOutputFile="${outputPath}" ${inputPaths.map(p => `"${p}"`).join(" ")}`;
    exec(cmd, (err) => (err ? reject(err) : resolve()));
  });
}

app.post("/merge-compress", upload.array("pdfs"), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) return res.status(400).send("Keine PDFs hochgeladen");

    const mergedFile = path.join("uploads", "merged.pdf");
    const compressedFile = path.join("uploads", "compressed-merged.pdf");

    await mergePDFs(files.map(f => f.path), mergedFile);
    await compressPDF(mergedFile, compressedFile, "/ebook");

    res.download(compressedFile, (err) => {
      files.forEach(f => fs.unlinkSync(f.path));
      fs.unlinkSync(mergedFile);
      fs.unlinkSync(compressedFile);
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Fehler beim Mergen oder Komprimieren");
  }
})
app.post("/merge", upload.array("pdfs"), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) return res.status(400).send("Keine PDFs hochgeladen");

    const mergedFile = path.join("uploads", "merged.pdf");

    await mergePDFs(files.map(f => f.path), mergedFile);
    await compressPDF(mergedFile, compressedFile, "/ebook");

    res.download(mergedFile, (err) => {
      files.forEach(f => fs.unlinkSync(f.path));
      fs.unlinkSync(mergedFile);
      fs.unlinkSync(compressedFile);
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Fehler beim Mergen");
  }
})

app.listen(port, () => {
  console.log(`PDF-Komprimierungs-API läuft auf http://localhost:${port}`);
});

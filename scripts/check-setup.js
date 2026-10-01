require("dotenv").config({ quiet: true });
// Prüft, ob alle Programme für die Server-Werkzeuge installiert sind: npm run check
const { execFileSync } = require("child_process");
const fs = require("fs");
const win = process.platform === "win32";
const checks = [
  ["Ghostscript", process.env.GS_PATH || (win ? "gswin64c" : "gs"), ["--version"], "komprimieren, zusammenfügen, schützen, entsperren"],
  ["LibreOffice", process.env.SOFFICE_PATH || (fs.existsSync("/Applications/LibreOffice.app/Contents/MacOS/soffice") ? "/Applications/LibreOffice.app/Contents/MacOS/soffice" : "soffice"), ["--version"], "Word/PowerPoint/Excel → PDF"],
  ["Python + pdf2docx", process.env.PYTHON_PATH || (win ? "python" : "python3"), ["-c", "import pdf2docx"], "PDF → Word"],
  ["Python + PyMuPDF", process.env.PYTHON_PATH || (win ? "python" : "python3"), ["-c", "import pymupdf"], "PDF-Editor (Pro)"],
];
let ok = true;
for (const [name, cmd, args, tools] of checks) {
  try {
    execFileSync(cmd, args, { stdio: "ignore", timeout: 30000 });
    console.log(`✓ ${name}`);
  } catch {
    ok = false;
    console.log(`✗ ${name} fehlt → betrifft: ${tools}`);
  }
}
console.log(process.env.DATABASE_URL ? "✓ DATABASE_URL gesetzt" : "✗ DATABASE_URL fehlt → Konten und PDF-Editor-Export aus");
console.log(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_PRO && process.env.STRIPE_PRICE_DAYPASS ? "✓ Stripe eingerichtet" : "✗ Stripe fehlt → keine Zahlungen (Testphase funktioniert trotzdem)");
console.log(ok ? "\nAlles bereit." : "\nDie Browser-Werkzeuge funktionieren trotzdem. Installationshilfe: siehe README.md");

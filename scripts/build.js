/**
 * Erzeugt alle HTML-Seiten, sitemap.xml und robots.txt in /public
 * und kopiert Bibliotheken und Schriften aus node_modules.
 *
 *   npm run build
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const config = require("../site/config");
const T = require("../site/templates");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const NM = path.join(ROOT, "node_modules");

function write(rel, content) {
  const file = path.join(PUBLIC, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  console.log("  ✓", rel);
}

function copy(from, toRel) {
  const src = path.join(NM, from);
  if (!fs.existsSync(src)) {
    console.error(`  ✗ ${from} fehlt – bitte zuerst "npm install" ausführen.`);
    process.exitCode = 1;
    return;
  }
  const dest = path.join(PUBLIC, toRel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log("  ✓", toRel);
}

// Cache-Busting: Hash über CSS und JS, damit Browser nach Änderungen neu laden
const assetHash = crypto.createHash("sha1");
for (const f of ["assets/style.css", "assets/site.js", "assets/tool.js", "assets/editor.js", "assets/account.js"]) {
  const p = path.join(PUBLIC, f);
  if (fs.existsSync(p)) assetHash.update(fs.readFileSync(p));
}
T.setBuildId(assetHash.digest("hex").slice(0, 8));

console.log("Seiten:");
write("index.html", T.homePage());
for (const tool of T.tools) write(`${tool.slug}.html`, T.toolPage(tool));
write("impressum.html", T.impressum());
write("Datenschutz.html", T.datenschutz());
write("404.html", T.notFound());
write("preise.html", T.pricingPage());
write("agb.html", T.agbPage());
write("anmelden.html", T.loginPage());
write("konto.html", T.accountPage());
write("passwort-vergessen.html", T.forgotPage());

console.log("SEO:");
const today = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: T.absUrl(""), priority: "1.0" },
  ...T.tools.map((t) => ({ loc: T.absUrl(t.slug), priority: "0.9" })),
  { loc: T.absUrl("preise"), priority: "0.6" },
  { loc: T.absUrl("impressum"), priority: "0.2" },
  { loc: T.absUrl("agb"), priority: "0.2" },
  { loc: T.absUrl("Datenschutz"), priority: "0.2" },
];
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`).join("\n")}
</urlset>
`
);
// sw.js: Der alte Push-Werbe-Service-Worker meldet sich bei Besuchern, die ihn noch haben, selbst ab
write("sw.js", `self.addEventListener("install", () => self.skipWaiting());\nself.addEventListener("activate", () => self.registration.unregister());\n`);
// ads.txt: Pflicht für AdSense
write("ads.txt", config.adsenseClient ? `google.com, ${config.adsenseClient.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0\n` : "");
write("robots.txt", `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${config.domain}/sitemap.xml\n`);

console.log("Bibliotheken:");
copy("pdf-lib/dist/pdf-lib.min.js", "vendor/pdf-lib.min.js");
copy("pdfjs-dist/build/pdf.min.js", "vendor/pdf.min.js");
copy("pdfjs-dist/build/pdf.worker.min.js", "vendor/pdf.worker.min.js");
copy("jszip/dist/jszip.min.js", "vendor/jszip.min.js");
copy("sortablejs/Sortable.min.js", "vendor/Sortable.min.js");
copy("fabric/dist/fabric.min.js", "vendor/fabric.min.js");

console.log("Schriften:");
for (const w of [600, 700, 800]) copy(`@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-${w}-normal.woff2`, `fonts/bricolage-grotesque-latin-${w}-normal.woff2`);
for (const w of [400, 600, 700]) copy(`@fontsource/source-sans-3/files/source-sans-3-latin-${w}-normal.woff2`, `fonts/source-sans-3-latin-${w}-normal.woff2`);

console.log("\nFertig. Starte den Server mit: npm start");

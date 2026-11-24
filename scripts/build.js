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

// Inhalts-Fingerabdruck jeder HTML-Seite → echtes „lastmod“ in der Sitemap (siehe pageDate)
const PAGE_HASH = new Map();
function contentHash(html) {
  // Was sich bei jedem Build ändert, ohne dass sich der Inhalt ändert, zählt nicht:
  // Versionsnummern der CSS/JS-Dateien (?v=…)
  const norm = html.replace(/\?v=[0-9a-f]+/g, "");
  return crypto.createHash("sha1").update(norm).digest("hex");
}

function write(rel, content, base = PUBLIC) {
  const file = path.join(base, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  if (file.endsWith(".html")) PAGE_HASH.set(path.relative(PUBLIC, file), contentHash(String(content)));
  console.log("  ✓", path.relative(PUBLIC, file));
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
for (const f of ["assets/style.css", "assets/site.js", "assets/tool.js", "assets/editor.js", "assets/account.js", "assets/slides.js", "assets/cv.js", "assets/form.js", "assets/form-detect.js", "assets/invoice.js", "assets/letter.js"]) {
  const p = path.join(PUBLIC, f);
  if (fs.existsSync(p)) assetHash.update(fs.readFileSync(p));
}
T.setBuildId(assetHash.digest("hex").slice(0, 8));

// Seiten für jede Sprache und jede Fassung erzeugen:
//   public/        Pro-Fassung Deutsch      public/en/, public/fr/        Pro-Fassung Englisch/Französisch
//   public/_free/  kostenlose Fassung       public/_free/en/, _free/fr/   (der Server liefert _free zuerst, wenn PAYMENTS_ENABLED=false)
const FREE = path.join(PUBLIC, "_free");
fs.rmSync(FREE, { recursive: true, force: true });
for (const l of ["en", "fr"]) fs.rmSync(path.join(PUBLIC, l), { recursive: true, force: true });
const today = new Date().toISOString().slice(0, 10);

function buildLang(lang, free) {
  T.prepare({ lang, free });
  const base = free ? FREE : PUBLIC;
  const dir = lang === "de" ? "" : lang + "/";
  const out = (rel, html) => write(dir + rel, html, base);
  out("index.html", T.homePage());
  for (const tool of T.tools) if (lang === "de" || T.availableIn(tool.slug, lang)) out(`${tool.slug}.html`, T.toolPage(tool));
  out("404.html", T.notFound());
  for (const tool of T.landingPages) if (T.availableIn(tool.slug, lang)) out(`${tool.slug}.html`, T.toolPage(tool));
  out("bewerbung.html", T.bewerbungHub());
  if (lang !== "de") return;
  out("impressum.html", T.impressum());
  out("ueber-uns.html", T.ueberUns());
  out("Datenschutz.html", T.datenschutz());
  out("passwort-vergessen.html", T.forgotPage());
  if (!free) {
    out("preise.html", T.pricingPage());
    out("agb.html", T.agbPage());
    out("anmelden.html", T.loginPage());
    out("konto.html", T.accountPage());
  }
}

// Echtes Änderungsdatum je Seite. .lastmod.json (nicht in git, bleibt auf dem Server liegen) merkt sich
// Fingerabdruck und Datum: Ändert sich der Inhalt, gilt heute – sonst bleibt das alte Datum stehen.
// So sieht Google nur bei wirklich geänderten Seiten ein neues Datum und vertraut den Angaben.
const LASTMOD_FILE = path.join(ROOT, ".lastmod.json");
let lastmod = {};
try {
  lastmod = JSON.parse(fs.readFileSync(LASTMOD_FILE, "utf8"));
} catch {
  /* erster Build: Datum aus der git-Geschichte der Seite */
}
const { execFileSync } = require("child_process");
function gitDate(rel) {
  try {
    const d = execFileSync("git", ["log", "-1", "--format=%cs", "--", path.join("public", rel)], { cwd: ROOT, encoding: "utf8" }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : today;
  } catch {
    return today;
  }
}
function pageDate(rel) {
  const hash = PAGE_HASH.get(rel);
  const old = lastmod[rel];
  if (!hash) return (old && old.date) || today;
  if (old && old.hash === hash) return old.date;
  const date = old ? today : gitDate(rel);
  lastmod[rel] = { hash, date };
  return date;
}
// Datei zu einer URL: „/“ → index.html, „/fr/merge.html“ → fr/merge.html (bzw. in _free/)
const fileOf = (slug, lang, free) => {
  const u = T.url(slug, lang).replace(/^\//, "");
  return path.join(free ? "_free" : "", u === "" || u.endsWith("/") ? u + "index.html" : u);
};

// Sitemap mit allen Sprachfassungen (hreflang), damit Google jedem Besucher die passende Sprache zeigt
function sitemap(free) {
  T.prepare({ lang: "de", free });
  const slugs = [
    ["", "1.0"],
    ...T.tools.map((t) => [t.slug, "0.9"]),
    ["bewerbung", "0.9"],
    ...T.landingPages.map((t) => [t.slug, "0.8"]),
    ...(free ? [] : [["preise", "0.6"], ["agb", "0.2"]]),
    ["ueber-uns", "0.4"],
    ["impressum", "0.2"],
    ["Datenschutz", "0.2"],
  ];
  const entries = [];
  for (const [slug, priority] of slugs) {
    const langs = T.LANGS.filter((l) => T.availableIn(slug, l) && (l === "de" || !["preise", "agb", "impressum", "Datenschutz", "ueber-uns"].includes(slug)));
    const alt = langs.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${T.absUrl(slug, l)}"/>`).join("\n");
    for (const l of langs) entries.push(`  <url>\n    <loc>${T.absUrl(slug, l)}</loc>\n${langs.length > 1 ? alt + "\n" : ""}    <lastmod>${pageDate(fileOf(slug, l, free))}</lastmod>\n    <priority>${priority}</priority>\n  </url>`);
  }
  write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join("\n")}\n</urlset>\n`, free ? FREE : PUBLIC);
}

console.log("Seiten:");
for (const lang of ["de", "en", "fr"]) buildLang(lang, false);
console.log("Kostenlose Fassung (public/_free):");
for (const lang of ["de", "en", "fr"]) buildLang(lang, true);

console.log("SEO:");
sitemap(false);
sitemap(true);
fs.writeFileSync(LASTMOD_FILE, JSON.stringify(lastmod, null, 1) + "\n");
// sw.js: Der alte Push-Werbe-Service-Worker meldet sich bei Besuchern, die ihn noch haben, selbst ab
write("sw.js", `self.addEventListener("install", () => self.skipWaiting());\nself.addEventListener("activate", () => self.registration.unregister());\n`);
// ads.txt: Pflicht für AdSense
write("ads.txt", config.adsenseClient ? `google.com, ${config.adsenseClient.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0\n` : "");
write("robots.txt", `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${config.domain}/sitemap.xml\n`);
if (process.env.I18N_DUMP) require("fs").writeFileSync(process.env.I18N_DUMP, JSON.stringify([...T.MISSING], null, 1));
if (T.MISSING.size) console.log(`\n⚠ ${T.MISSING.size} Oberflächentexte ohne Übersetzung (werden auf Deutsch angezeigt):\n  ` + [...T.MISSING].slice(0, 40).join("\n  "));

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
// Handschrift-Schriften für die getippte Unterschrift (werden nur geladen, wenn der Dialog sie braucht)
for (const f of ["caveat-latin-700", "dancing-script-latin-600", "great-vibes-latin-400", "homemade-apple-latin-400"]) copy(`@fontsource/${f.replace(/-latin-\d+$/, "")}/files/${f}-normal.woff2`, `fonts/${f}-normal.woff2`);

console.log("\nFertig. Starte den Server mit: npm start");

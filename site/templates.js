const config = require("./config");
const { tools, categories } = require("./tools");

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const url = (slug) => (slug === "" ? "/" : `/${slug}.html`);
const absUrl = (slug) => config.domain + url(slug);
const bySlug = Object.fromEntries(tools.map((t) => [t.slug, t]));

// Ratgeber-Seiten (site/landings.js): gleiche Oberfläche wie das Basis-Werkzeug, eigene Texte für Google
const landingPages = require("./landings").landings.map((l) => {
  const base = bySlug[l.base];
  if (!base) throw new Error(`Ratgeber ${l.slug}: Werkzeug ${l.base} fehlt`);
  const ui = { ...base.ui };
  if (base.ui.options && l.defaults) {
    // vorausgewählte Option nach vorne, damit sie beim Laden aktiv ist
    ui.options = base.ui.options.map((o) => {
      const want = l.defaults[o.name];
      if (!want || !o.choices) return o;
      return { ...o, choices: [...o.choices.filter((c) => c.value === want), ...o.choices.filter((c) => c.value !== want)] };
    });
  }
  return { ...base, ...l, ui, short: l.guide, isNew: false, landingOf: base.slug, promo: base.promo };
});
for (const l of landingPages) bySlug[l.slug] = l;
const catById = Object.fromEntries(categories.map((c) => [c.id, c]));

/** „A“, „B“ und „C“ – die Namen aller Pro-Werkzeuge (für Texte) */
function proNames() {
  const names = tools.filter((t) => t.pro).map((t) => `„${t.name}“`);
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} und ${names[names.length - 1]}` : names[0] || "";
}

// Kostenlose Fassung (ohne Bezahlung): wird von scripts/build.js nach den Pro-Seiten eingeschaltet
let FREE = false;
function setFreeMode() {
  FREE = true;
  for (const t of tools) {
    if (!t.pro) continue;
    t.pro = false;
    const f = t.free || {};
    if (f.short) t.short = f.short;
    if (f.description) t.description = f.description;
    t.steps = t.steps.map((st, i) => (f.steps && f.steps[i]) || st);
    t.faq = t.faq.map((q, i) => (f.faq && f.faq[i]) || q);
  }
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------
const GLYPHS = {
  cv: '<circle cx="9" cy="8.5" r="2.5"/><path d="M5 14.5c.6-1.8 2.1-2.8 4-2.8s3.4 1 4 2.8M15 7h4M15 10.5h4M5 18h14"/>',
  ocr: '<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><path d="M8 9h8M8 12h8M8 15h5"/>',
  redact: '<path d="M5 6h9M5 18h11"/><rect x="5" y="9.5" width="14" height="5" rx="1" fill="#fff"/>',
  archive: '<rect x="4" y="5" width="16" height="4" rx="1"/><path d="M5.5 9v9.5A1.5 1.5 0 0 0 7 20h10a1.5 1.5 0 0 0 1.5-1.5V9M10 13h4"/>',
  phone: '<rect x="7" y="3.5" width="10" height="17" rx="2"/><circle cx="12" cy="10.5" r="2.5"/><path d="M11 17.5h2"/>',
  einvoiceView: '<path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><circle cx="12" cy="12" r="2.5"/>',
  einvoiceCheck: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="m9 12 2 2 4-4"/>',
  merge: '<path d="M7 5v4a3 3 0 0 0 3 3h4a3 3 0 0 1 3 3v4M17 5v4a3 3 0 0 1-3 3"/><path d="m14 16 3 3 3-3"/>',
  split: '<path d="M12 5v6m0 0-5 5v3m5-8 5 5v3"/><path d="m4 16 3 3 3-3M14 16l3 3 3-3"/>',
  remove: '<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/><path d="M10.5 11v5M13.5 11v5"/>',
  extract: '<rect x="4" y="4" width="10" height="13" rx="1.5"/><path d="M12 13h8m0 0-3-3m3 3-3 3"/>',
  organize: '<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/>',
  rotate: '<path d="M19 12a7 7 0 1 1-2.05-4.95"/><path d="M19 4v4h-4"/>',
  compress: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
  mergecompress: '<path d="M7 4v3a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V4"/><path d="M8 20v-4h8v4M12 10v6"/>',
  word: '<path d="m5 6 2.5 12L12 9l4.5 9L19 6"/>',
  powerpoint: '<path d="M8 19V5h5a4 4 0 0 1 0 8H8"/>',
  excel: '<path d="m6 5 12 14M18 5 6 19"/>',
  image: '<rect x="4" y="5" width="16" height="14" rx="1.5"/><circle cx="9" cy="10" r="1.6"/><path d="m5 18 5-5 3 3 2-2 4 4"/>',
  numbers: '<path d="M9 4 7 20M17 4l-2 16M4.5 9h15M4 15h15"/>',
  watermark: '<path d="M12 3.5s6 6.6 6 10.5a6 6 0 0 1-12 0c0-3.9 6-10.5 6-10.5Z"/>',
  lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="1.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><path d="M12 14.5v2"/>',
  edit: '<path d="M14.5 5.5l4 4L9 19H5v-4Z"/><path d="m12.5 7.5 4 4"/>',
  create: '<path d="M12 6v12M6 12h12"/>',
  unlock: '<rect x="5" y="10.5" width="14" height="9.5" rx="1.5"/><path d="M8 10.5V8a4 4 0 0 1 7.7-1.5"/><path d="M12 14.5v2"/>',
  sign: '<path d="M4 16c2-5 4-8 5.5-8S9 16 11 16s2.5-4 4-4 1 4 3 4"/><path d="M4 20h16"/>',
  mappe: '<rect x="4" y="8" width="16" height="11" rx="1.5"/><path d="M9 8V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v2M4 13h16"/>',
  table: '<rect x="4" y="5" width="16" height="14" rx="1.5"/><path d="M4 10h16M4 14.5h16M10 5v14"/>',
  slides: '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M12 16v3M9 19h6M8 9h5M8 12h8"/>',
  summary: '<path d="M5 7h9M5 11h14M5 15h10M5 19h6"/><path d="m18 3 .9 2.1L21 6l-2.1.9L18 9l-.9-2.1L15 6l2.1-.9Z"/>',
  translate: '<path d="M4 6h8M8 4v2c0 4-2 7-4.5 8.5M6 10c1 2 3 3.5 5 4"/><path d="m13 20 4-9 4 9M14.5 17h5"/>',
};

/** Datei-Symbol mit umgeknickter Ecke – die Farbe kommt aus der Kategorie */
function toolIcon(tool, size = 44) {
  const c = catById[tool.cat].color;
  return `<svg class="ficon ficon--${c}" width="${size}" height="${Math.round(size * 1.18)}" viewBox="0 0 44 52" aria-hidden="true" focusable="false">
<path class="ficon__sheet" d="M4 3h26l11 11v34a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/>
<path class="ficon__fold" d="M30 3v10a1 1 0 0 0 1 1h10Z"/>
<g transform="translate(10 17) scale(1)" class="ficon__glyph">${GLYPHS[tool.glyph] || ""}</g>
</svg>`;
}

const ICON = {
  upload: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0-4.5 4.5M12 4l4.5 4.5M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15"/></svg>',
  shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6Z"/><path d="m9 12 2 2 4-4"/></svg>',
  device: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>',
  logo: `<svg class="brand__mark" viewBox="0 0 32 36" aria-hidden="true"><path d="M3 2h17l9 9v22a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" fill="currentColor"/><path d="M20 2v8a1 1 0 0 0 1 1h8Z" fill="#fff" opacity=".45"/><path d="M9 25V14h4.5a3.5 3.5 0 0 1 0 7H9" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

// ---------------------------------------------------------------------------
// Kopf, Kopfzeile, Fußzeile
// ---------------------------------------------------------------------------
function trackingScripts(ads = true) {
  if (!config.analyticsId && !config.adsenseClient) return "";
  // Consent Mode v2: Alles ist verboten, bis der Besucher im Cookie-Banner (Google CMP) zustimmt
  let s = `
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
  gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
  gtag('set','ads_data_redaction',true);gtag('set','url_passthrough',true);</script>`;
  if (config.analyticsId) {
    s += `
  <script async src="https://www.googletagmanager.com/gtag/js?id=${config.analyticsId}"></script>
  <script>gtag('js',new Date());gtag('config','${config.analyticsId}');</script>`;
  }
  if (config.adsenseClient) {
    s += `
  <meta name="google-adsense-account" content="${config.adsenseClient}">`;
    // Werbung nur auf Inhaltsseiten und nicht für Nutzer mit Pro, Tagespass oder Testphase
    // (der Server setzt dafür das Cookie pl_noads=1, siehe server/auth.js)
    if (ads) {
      s += FREE
        ? `
  <script async crossorigin="anonymous" src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.adsenseClient}"></script>`
        : `
  <script>if(!/(?:^|;\\s*)pl_noads=1/.test(document.cookie)){var a=document.createElement("script");a.async=true;a.crossOrigin="anonymous";a.src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.adsenseClient}";document.head.appendChild(a);}</script>`;
    }
  }
  return s;
}

function head({ title, description, slug, jsonLd = [], noindex = false, extraHead = "", ads = true }) {
  const canonical = absUrl(slug);
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  ${noindex ? '<meta name="robots" content="noindex, follow">' : `<link rel="canonical" href="${canonical}">`}
  <meta name="theme-color" content="#2b4bdb">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${config.name}">
  <meta property="og:locale" content="de_DE">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${config.domain}/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="preload" href="/fonts/bricolage-grotesque-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/source-sans-3-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/style.css?v=${BUILD_ID}">
${jsonLd.map((j) => `  <script type="application/ld+json">${JSON.stringify(j)}</script>`).join("\n")}${trackingScripts(ads)}${extraHead}
</head>`;
}

function megaMenu() {
  return categories
    .map(
      (c) => `<div class="mega__col">
          <p class="mega__cat mega__cat--${c.color}">${esc(c.name)}</p>
          <ul>${tools
            .filter((t) => t.cat === c.id)
            .map((t) => `<li><a href="${url(t.slug)}">${esc(t.name)}</a></li>`)
            .join("")}</ul>
        </div>`
    )
    .join("\n        ");
}

function header(activeSlug) {
  const quick = ["merge", "compress", "pdf-to-docx", "docx-to-pdf"];
  return `<a class="skip" href="#inhalt">Zum Inhalt springen</a>
<header class="site-header">
  <div class="wrap site-header__bar">
    <a href="/" class="brand" aria-label="${config.name} – Startseite">${ICON.logo}<span>PDF Libre</span></a>
    <nav class="nav" aria-label="Hauptnavigation">
      <button class="nav__all" type="button" aria-expanded="false" aria-controls="mega">Alle Werkzeuge ${ICON.chevron}</button>
      ${quick
        .map((s) => `<a href="${url(s)}"${s === activeSlug ? ' aria-current="page"' : ""}>${esc(bySlug[s].name)}</a>`)
        .join("\n      ")}
    </nav>
    ${FREE ? "" : `<a href="/preise.html" class="nav__pricing">Preise</a>
    <a href="/anmelden.html" class="nav__account" data-account>Anmelden</a>`}
    <button class="nav__burger" type="button" aria-expanded="false" aria-controls="mega" aria-label="Menü öffnen">${ICON.menu}</button>
  </div>
  <div class="mega" id="mega" hidden>
    <div class="wrap mega__grid">
        ${megaMenu()}
    </div>
  </div>
</header>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="site-footer__grid">
      <div class="site-footer__about">
        <a href="/" class="brand brand--footer">${ICON.logo}<span>PDF Libre</span></a>
        <p>${tools.filter((t) => !t.pro).length} kostenlose PDF-Werkzeuge ohne Anmeldung${FREE ? "" : ", dazu PDF Libre Pro mit PDF-Editor und KI-Werkzeugen"}. Hochgeladene Dateien werden nach der Verarbeitung gelöscht.</p>
      </div>
      ${categories
        .map(
          (c) => `<div>
        <p class="site-footer__head">${esc(c.name)}</p>
        <ul>${tools
          .filter((t) => t.cat === c.id)
          .map((t) => `<li><a href="${url(t.slug)}">${esc(t.name)}</a></li>`)
          .join("")}</ul>
      </div>`
        )
        .join("\n      ")}
    </div>
    <div class="site-footer__legal">
      <p>© <span data-year>2026</span> ${config.name} · Entwickelt von <a href="https://alfredlog.github.io" rel="author">Alfred Mushagalusa Munganga</a> · <a href="https://github.com/alfredlog" rel="me">GitHub</a></p>
      <p>${FREE ? "" : '<a href="/preise.html">Preise</a>'}<a href="/impressum.html">Impressum</a><a href="/Datenschutz.html">Datenschutz</a>${FREE ? "" : '<a href="/agb.html">AGB</a>'}<a href="#" data-consent-settings>Datenschutzeinstellungen</a></p>
    </div>
  </div>
</footer>`;
}

function page({ title, description, slug, body, jsonLd, activeSlug, noindex, scripts = "", ads = true }) {
  return `${head({ title, description, slug, jsonLd, noindex, ads })}
<body>
${header(activeSlug)}
<main id="inhalt">
${body}
</main>
${footer()}
<script src="/assets/site.js?v=${BUILD_ID}" defer></script>${scripts}
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Startseite
// ---------------------------------------------------------------------------
function toolCard(t) {
  return `<li class="tcard" data-cat="${t.cat}">
        <a href="${url(t.slug)}">
          ${toolIcon(t)}
          <span class="tcard__name">${esc(t.name)}${t.pro ? ' <span class="pro-badge">Pro</span>' : t.isNew ? ' <span class="new-badge">Neu</span>' : ""}</span>
          <span class="tcard__text">${esc(t.short)}</span>
        </a>
      </li>`;
}

function homePage() {
  const faq = [
    FREE
      ? [
          "Ist PDF Libre kostenlos?",
          `Ja. Alle ${tools.length} Werkzeuge – auch der PDF-Editor und die KI-Werkzeuge – sind kostenlos und ohne Anmeldung nutzbar. In deine Dateien wird nie Werbung oder ein Wasserzeichen eingefügt.`,
        ]
      : [
      "Ist PDF Libre kostenlos?",
      `Fast alles: ${tools.filter((t) => !t.pro).length} Werkzeuge wie Zusammenfügen, Komprimieren, Unterschreiben und Umwandeln sind kostenlos und ohne Anmeldung nutzbar. Nur ${proNames()} gehören zu PDF Libre Pro: ${config.pricing.trialDays} Tage kostenlos testen, danach ${config.pricing.pro} im Monat oder ${config.pricing.daypass} für einen Tagespass. In deine Dateien wird nie Werbung oder ein Wasserzeichen eingefügt.`,
    ],
    ["Was passiert mit meinen Dateien?", "Werkzeuge mit dem Hinweis „Im Browser“ verarbeiten deine Datei direkt auf deinem Gerät, sie wird gar nicht hochgeladen. Bei allen anderen Werkzeugen wird die Datei verschlüsselt übertragen und direkt nach der Verarbeitung automatisch gelöscht."],
    ["Brauche ich ein Programm oder eine App?", "Nein. PDF Libre läuft in jedem aktuellen Browser – auf Windows, Mac, Linux, Android und iPhone."],
    ["Wie groß dürfen meine Dateien sein?", "Bei Werkzeugen, die auf dem Server laufen, bis zu 50 MB pro Datei. Browser-Werkzeuge sind nur durch den Arbeitsspeicher deines Geräts begrenzt."],
  ];
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: config.name,
      url: config.domain + "/",
      inLanguage: "de-DE",
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: config.name,
      url: config.domain + "/",
      logo: config.domain + "/apple-touch-icon.png",
    },
    faqLd(faq),
  ];

  const body = `<section class="home-hero">
  <div class="wrap">
    <h1>Jedes PDF-Werkzeug, das du im Alltag brauchst.</h1>
    <p class="home-hero__lead">Zusammenfügen, verkleinern, umwandeln, unterschreiben und schützen – kostenlos, ohne Anmeldung und ohne Wasserzeichen. ${FREE ? 'Text in PDFs ändern kannst du mit dem <a href="/edit.html">PDF-Editor</a> – ebenfalls kostenlos.' : 'Text in PDFs ändern kannst du mit <a href="/preise.html">PDF Libre Pro</a>.'}</p>
    <ul class="facts">
      <li>${ICON.device}<span><strong>${tools.filter((t) => t.ui.mode === "client").length} Werkzeuge</strong> laufen komplett in deinem Browser</span></li>
      <li>${ICON.shield}<span><strong>Automatisch gelöscht</strong> nach der Verarbeitung</span></li>
    </ul>
  </div>
</section>

<section class="wrap tools-index" aria-labelledby="alle-werkzeuge">
  <h2 id="alle-werkzeuge" class="visually-hidden">Alle Werkzeuge</h2>
  <div class="filters" role="toolbar" aria-label="Werkzeuge filtern">
    <button type="button" class="chip" aria-pressed="true" data-filter="all">Alle</button>
    ${categories.map((c) => `<button type="button" class="chip chip--${c.color}" aria-pressed="false" data-filter="${c.id}">${esc(c.short || c.name)}</button>`).join("\n    ")}
  </div>
  ${categories
    .map(
      (c) => `<div class="tgroup" data-group="${c.id}">
    <h3 class="tgroup__title tgroup__title--${c.color}">${esc(c.name)}</h3>
    <ul class="tgrid">
      ${tools.filter((t) => t.cat === c.id).map(toolCard).join("\n      ")}
    </ul>
  </div>`
    )
    .join("\n  ")}
</section>

${FREE ? `<section class="wrap pro-band" aria-labelledby="pro-title">
  <div class="pro-band__text">
    <p class="pro-band__tag">PDF-Editor</p>
    <h2 id="pro-title">Text in PDFs ändern, Inhalte endgültig löschen, eigene PDFs gestalten.</h2>
    <p>Mit dem PDF-Editor änderst du vorhandenen Text, fügst Bilder, Formen und deine Unterschrift ein oder gestaltest eine neue PDF. Kostenlos und ohne Konto.</p>
  </div>
  <div class="pro-band__actions">
    <a class="btn btn--primary btn--lg" href="/edit.html">PDF bearbeiten</a>
    <a class="btn btn--link" href="/create.html">PDF erstellen</a>
  </div>
</section>` : `<section class="wrap pro-band" aria-labelledby="pro-title">
  <div class="pro-band__text">
    <p class="pro-band__tag">PDF Libre Pro</p>
    <h2 id="pro-title">Text in PDFs ändern, Inhalte endgültig löschen, eigene PDFs gestalten.</h2>
    <p>PDF-Editor, PDF zusammenfassen und PDF übersetzen gehören zu Pro: ${config.pricing.trialDays} Tage kostenlos testen, ohne Zahlungsdaten. Danach ${config.pricing.pro} im Monat (monatlich kündbar) oder ${config.pricing.daypass} für einen Tagespass. Alle anderen Werkzeuge bleiben kostenlos.</p>
  </div>
  <div class="pro-band__actions">
    <a class="btn btn--primary btn--lg" href="/edit.html">PDF-Editor ausprobieren</a>
    <a class="btn btn--link" href="/preise.html">Preise ansehen</a>
  </div>
</section>`}

<section class="wrap why">
  <h2>Warum PDF Libre?</h2>
  <div class="why__grid">
    <div>
      <h3>Deine Dateien bleiben deine</h3>
      <p>Teilen, drehen, sortieren, Wasserzeichen, Bilder in PDF und mehr passieren direkt in deinem Browser. Für die übrigen Werkzeuge wird die Datei verschlüsselt übertragen und sofort nach dem Download gelöscht.</p>
    </div>
    <div>
      <h3>Ohne Konto, ohne Limits pro Tag</h3>
      <p>Für die kostenlosen Werkzeuge brauchst du weder Konto noch E-Mail-Adresse, und es gibt keine Tageskontingente. Seite öffnen, Datei auswählen, fertig.${FREE ? "" : " Ein Konto brauchst du nur für Pro."}</p>
    </div>
    <div>
      <h3>Saubere Ergebnisse</h3>
      <p>Keine Wasserzeichen, keine Werbung in deinen Dokumenten. Texte bleiben durchsuchbar, Seiten behalten ihr Format.</p>
    </div>
  </div>
</section>

<section class="wrap faq" aria-labelledby="faq-title">
  <h2 id="faq-title">Häufige Fragen</h2>
  ${faqHtml(faq)}
</section>`;

  return page({
    title: "PDF Libre – Kostenlose PDF-Tools online | Ohne Anmeldung",
    description:
      `Kostenlose PDF-Werkzeuge: PDF zusammenfügen, komprimieren, teilen, in Word umwandeln, drehen, schützen und mehr – ohne Anmeldung. ${FREE ? "Dazu ein kostenloser PDF-Editor." : "Dazu PDF-Editor mit Pro."}`,
    slug: "",
    body,
    jsonLd,
  });
}

// ---------------------------------------------------------------------------
// Werkzeug-Seiten
// ---------------------------------------------------------------------------
function faqHtml(faq) {
  return faq
    .map(
      ([q, a]) => `<details>
    <summary>${esc(q)}</summary>
    <p>${esc(a)}</p>
  </details>`
    )
    .join("\n  ");
}

function faqLd(faq) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

function optionHtml(o) {
  const id = `opt-${o.name}`;
  const showIf = o.showIf ? ` data-show-if="${esc(o.showIf)}"` : "";
  const noSend = o.noSend ? " data-no-send" : "";
  const hint = o.hint ? `<small class="field__hint">${esc(o.hint)}</small>` : "";
  switch (o.type) {
    case "radio":
      return `<fieldset class="field field--choices"${showIf}>
          <legend>${esc(o.label)}</legend>
          ${o.choices
            .map(
              (c, i) => `<label class="choice">
            <input type="radio" name="${o.name}" value="${esc(c.value)}"${i === 0 ? " checked" : ""}>
            <span class="choice__body"><span class="choice__label">${esc(c.label)}</span>${c.hint ? `<span class="choice__hint">${esc(c.hint)}</span>` : ""}</span>
          </label>`
            )
            .join("\n          ")}
        </fieldset>`;
    case "select":
      return `<div class="field"${showIf}>
          <label for="${id}">${esc(o.label)}</label>
          <select id="${id}" name="${o.name}">
            ${o.choices.map((c) => `<option value="${esc(c.value)}">${esc(c.label)}</option>`).join("")}
          </select>${hint}
        </div>`;
    case "range":
      return `<div class="field"${showIf}>
          <label for="${id}">${esc(o.label)} <output for="${id}" data-unit="${esc(o.unit || "")}">${o.value}${esc(o.unit || "")}</output></label>
          <input type="range" id="${id}" name="${o.name}" min="${o.min}" max="${o.max}" value="${o.value}">
        </div>`;
    default: {
      const attrs = [
        `type="${o.type}"`,
        `id="${id}"`,
        `name="${o.name}"`,
        o.value !== undefined ? `value="${esc(o.value)}"` : "",
        o.placeholder ? `placeholder="${esc(o.placeholder)}"` : "",
        o.min !== undefined ? `min="${o.min}"` : "",
        o.maxlength ? `maxlength="${o.maxlength}"` : "",
        o.required ? "required" : "",
        o.autocomplete ? `autocomplete="${o.autocomplete}"` : "",
        o.type === "number" ? 'inputmode="numeric"' : "",
      ]
        .filter(Boolean)
        .join(" ");
      return `<div class="field"${showIf}${noSend}>
          <label for="${id}">${esc(o.label)}</label>
          <input ${attrs}>${hint}
        </div>`;
    }
  }
}

function workspace(t) {
  if (t.ui.mode === "editor") return editorWorkspace(t);
  if (t.ui.mode === "slides") return slidesWorkspace(t);
  if (t.ui.mode === "cv") return cvWorkspace(t);
  const ui = t.ui;
  const c = catById[t.cat].color;
  const data = {
    tool: t.slug,
    mode: ui.mode,
    endpoint: ui.endpoint,
    accept: ui.input.accept,
    kind: ui.input.label,
    multiple: ui.multiple ? "true" : undefined,
    min: ui.min,
    sortable: ui.sortable ? "true" : undefined,
    preview: ui.preview,
    select: ui.select,
    savings: ui.showSavings ? "true" : undefined,
    pro: t.pro ? "true" : undefined,
  };
  const dataAttrs = Object.entries(data)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `data-${k}="${esc(v)}"`)
    .join(" ");

  const P = config.pricing;
  const privacy = t.pro
    ? `${ICON.shield}<span><strong>Pro-Werkzeug:</strong> Mit Konto ${P.trialDays} Tage gratis, danach ${P.pro}/Monat oder ${P.daypass} Tagespass. <a href="/preise.html">Preise</a> · <a href="/anmelden.html?next=/${t.slug}.html">Anmelden</a></span>`
    : ui.mode === "client"
      ? `${ICON.device}<span><strong>Im Browser:</strong> Deine Datei wird nicht hochgeladen.</span>`
      : `${ICON.shield}<span><strong>Sicher:</strong> Verschlüsselte Übertragung, automatische Löschung nach der Verarbeitung.</span>`;

  const toolbar = ui.toolbar
    ? `<div class="pages-toolbar">${ui.toolbar.map((b) => `<button type="button" class="btn btn--ghost btn--sm" data-action="${b.action}">${esc(b.label)}</button>`).join("")}</div>`
    : "";

  const selectHelp = {
    remove: "Klicke auf die Seiten, die entfernt werden sollen.",
    keep: "Klicke auf die Seiten, die du behalten möchtest.",
    organize: "Ziehe Seiten an eine neue Position. Mit den Symbolen drehst oder löschst du eine Seite.",
    rotate: "Klicke auf eine Seite, um sie um 90° zu drehen.",
  }[ui.select];

  return `<section class="tool tool--${c}" ${dataAttrs} aria-label="${esc(t.name)}">
    <form class="tool__form" novalidate>
      <div class="stage stage--pick">
        <div class="drop" data-drop>
          ${toolIcon(t, 56)}
          <label class="btn btn--primary btn--lg drop__btn">
            ${ICON.upload}<span>${ui.multiple ? "Dateien auswählen" : "Datei auswählen"}</span>
            <input type="file" class="visually-hidden" accept="${esc(ui.input.accept)}"${ui.multiple ? " multiple" : ""}>
          </label>
          <p class="drop__or">oder ${ui.multiple ? "Dateien" : "Datei"} hierher ziehen</p>
          <p class="drop__hint">${esc(ui.dropHint || (ui.mode === "client" ? "PDF-Datei" : "PDF-Datei, bis zu 50 MB"))}</p>
        </div>
        <p class="privacy">${privacy}</p>
      </div>

      <div class="stage stage--work" hidden>
        <div class="work">
          <div class="work__main">
            ${ui.preview === "pages" ? `${selectHelp ? `<p class="work__help">${selectHelp}</p>` : ""}${toolbar}<div class="pages" data-pages aria-live="polite"></div>` : `<ul class="files" data-files></ul>`}
            ${ui.multiple ? `<label class="btn btn--ghost btn--sm add-more">+ Weitere hinzufügen<input type="file" class="visually-hidden" accept="${esc(ui.input.accept)}" multiple></label>` : ""}
          </div>
          <aside class="work__side">
            <p class="work__summary" data-summary></p>
            ${(ui.options || []).map(optionHtml).join("\n        ")}
            <p class="form-error" data-error role="alert" hidden></p>
            <button type="submit" class="btn btn--primary btn--lg btn--block">${esc(ui.action)}</button>
            <button type="button" class="btn btn--link" data-action="reset">Andere Datei wählen</button>
          </aside>
        </div>
      </div>

      <div class="stage stage--busy" hidden aria-live="polite">
        <div class="busy">
          <div class="busy__bar"><span data-progress></span></div>
          <p data-busy-text>Wird verarbeitet …</p>
        </div>
      </div>

      <div class="stage stage--done" hidden>
        <div class="done">
          <h2 class="done__title" tabindex="-1">Fertig!</h2>
          <p class="done__info" data-done-info></p>
          <div class="done__preview" data-done-preview hidden></div>
          <a class="btn btn--primary btn--lg" data-download href="#">Herunterladen</a>
          <button type="button" class="btn btn--link" data-action="reset">Noch eine Datei bearbeiten</button>
          <div class="done__next">
            <p>Weiter mit:</p>
            <ul>${t.related
              .slice(0, 4)
              .map((s) => `<li><a href="${url(s)}">${esc(bySlug[s].name)}</a></li>`)
              .join("")}</ul>
          </div>
        </div>
      </div>
    </form>
  </section>`;
}

// Lebenslauf erstellen: Formular links, Live-Vorschau rechts (Logik: public/assets/cv.js)
function cvWorkspace(t) {
  const c = catById[t.cat].color;
  const tpls = [
    ["modern", "Modern", "Klar und farbig"],
    ["klassisch", "Klassisch", "Seriös, Serifenschrift"],
    ["akademisch", "Akademisch", "LaTeX-Stil"],
    ["kompakt", "Kompakt", "Viel Inhalt, eine Seite"],
  ];
  return `<section class="tool tool--${c} cv" data-cv data-default-template="${esc((t.defaults && t.defaults.template) || "modern")}" aria-label="${esc(t.name)}">
    <div class="cv-bar">
      <div class="cv-tpls" role="group" aria-label="Vorlage">
        ${tpls.map(([id, n, d]) => `<button type="button" class="cv-tpl cv-tpl--${id}" data-tpl="${id}"><span class="cv-tpl__mini" aria-hidden="true"><i></i><i></i><i></i></span><b>${n}</b><small>${d}</small></button>`).join("")}
      </div>
      <div class="cv-bar__opts">
        <label class="cv-inline">Farbe <input type="color" data-accent value="#1f4fa3"></label>
        <label class="cv-inline">Sprache
          <select data-lang><option value="de">Deutsch</option><option value="en">Englisch</option></select>
        </label>
        <button type="button" class="btn btn--link" data-sample>Beispiel laden</button>
        <label class="btn btn--link">Entwurf öffnen<input type="file" accept=".json,application/json,.pdf,application/pdf" class="visually-hidden" data-import></label>
        <button type="button" class="btn btn--link" data-new>Neu beginnen</button>
      </div>
    </div>
    <div class="cv-work">
      <div class="cv-form" data-form></div>
      <aside class="cv-side">
        <div class="cv-preview" data-preview aria-live="polite"><p class="cv-preview__empty">Vorschau wird geladen …</p></div>
        <p class="cv-info" data-info></p>
        <p class="form-error" data-error role="alert" hidden></p>
        <button type="button" class="btn btn--primary btn--lg btn--block" data-download>PDF herunterladen</button>
        <button type="button" class="btn btn--ghost btn--block" data-save-draft>Entwurf speichern (zum späteren Bearbeiten)</button>
        <div class="cv-ats">
          <p><strong>ATS-Check</strong> <span data-ats-score></span></p>
          <ul data-ats></ul>
        </div>
        <p class="privacy">${ICON.shield}<span>Deine Angaben werden nur zum Erstellen der PDF übertragen und nicht gespeichert. Der Entwurf bleibt in deinem Browser.</span></p>
      </aside>
    </div>
  </section>`;
}

// PDF → PowerPoint mit Design-Auswahl und Live-Vorschau (Logik: public/assets/slides.js)
function slidesWorkspace(t) {
  const c = catById[t.cat].color;
  const presets = [
    ["orig", "Original", "#ffffff", "#002776"],
    ["modern", "Modern", "#f8fafc", "#4f46e5"],
    ["dark", "Dunkel", "#0f172a", "#f59e0b"],
    ["soft", "Sanft", "#fdf6ec", "#b45309"],
  ];
  const fonts = ["Calibri", "Arial", "Helvetica", "Verdana", "Georgia", "Times New Roman"];
  return `<section class="tool tool--${c}" data-slides aria-label="${esc(t.name)}">
    <div class="stage stage--pick">
      <div class="drop" data-drop>
        ${toolIcon(t, 56)}
        <label class="btn btn--primary btn--lg drop__btn">
          ${ICON.upload}<span>Datei auswählen</span>
          <input type="file" class="visually-hidden" accept=".pdf,application/pdf">
        </label>
        <p class="drop__or">oder Datei hierher ziehen</p>
        <p class="drop__hint">PDF-Datei, bis zu 50 MB und 80 Seiten</p>
      </div>
      <p class="privacy">${ICON.shield}<span><strong>Sicher:</strong> Verschlüsselte Übertragung, die Dateien werden spätestens nach 30 Minuten gelöscht.</span></p>
    </div>

    <div class="stage stage--busy" hidden aria-live="polite">
      <div class="busy">
        <div class="busy__bar"><span data-progress></span></div>
        <p data-busy-text>Folien werden vorbereitet …</p>
      </div>
    </div>

    <div class="stage stage--work" hidden>
      <div class="work">
        <div class="work__main">
          <p class="work__help">So sieht deine Präsentation aus. Texte bleiben in PowerPoint und Keynote bearbeitbar, Formeln und Bilder stehen an ihrem Platz.</p>
          <div class="sl-stage"><div class="sl-slide" data-slide></div></div>
          <div class="sl-nav">
            <button type="button" class="btn btn--ghost btn--sm" data-prev aria-label="Vorherige Folie">‹</button>
            <span data-counter></span>
            <button type="button" class="btn btn--ghost btn--sm" data-next aria-label="Nächste Folie">›</button>
            <span class="sl-nav__sel">
              <button type="button" class="btn btn--link" data-all>Alle</button>
              <button type="button" class="btn btn--link" data-none>Keine</button>
            </span>
          </div>
          <ol class="sl-thumbs" data-thumbs></ol>
        </div>
        <aside class="work__side">
          <p class="work__summary" data-summary></p>
          <fieldset class="sl-presets">
            <legend>Design</legend>
            ${presets
              .map(
                ([id, label, bg, ac], i) =>
                  `<button type="button" class="sl-preset${i === 0 ? " is-on" : ""}" data-preset="${id}" aria-pressed="${i === 0}"><span class="sl-preset__sw" style="background:${bg}"><i style="background:${ac}"></i></span>${label}</button>`
              )
              .join("")}
          </fieldset>
          <div class="sl-row">
            <div class="field"><label for="sl-bg">Hintergrund</label><input type="color" id="sl-bg" data-opt="bg" value="#ffffff"></div>
            <div class="field"><label for="sl-accent">Akzentfarbe</label><input type="color" id="sl-accent" data-opt="accent" value="#002776"></div>
          </div>
          <div class="field">
            <label for="sl-font">Schrift</label>
            <select id="sl-font" data-opt="font">
              <option value="orig">Wie im Original</option>
              ${fonts.map((f) => `<option>${f}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label for="sl-format">Folienformat</label>
            <select id="sl-format" data-opt="format">
              <option value="orig">Wie die PDF</option>
              <option value="4:3">4:3</option>
              <option value="16:9">16:9 (Breitbild)</option>
            </select>
          </div>
          <label class="check"><input type="checkbox" data-opt="hideRepeat"> Kopf- und Fußzeile entfernen</label>
          <p class="form-error" data-error role="alert" hidden></p>
          <button type="button" class="btn btn--primary btn--lg btn--block" data-build>PowerPoint herunterladen</button>
          <button type="button" class="btn btn--link" data-reset>Andere Datei wählen</button>
        </aside>
      </div>
    </div>
  </section>`;
}

// Hinweis auf ein Partnerprodukt unter dem Werkzeug (z. B. E-Rechnung Agent bei den E-Rechnung-Werkzeugen)
function promoBox(p) {
  return `<aside class="wrap promo" aria-label="${esc(p.title)}">
  <div class="promo__box">
    <div><strong>${esc(p.title)}</strong><p>${esc(p.text)}</p></div>
    <a class="promo__btn" href="${esc(p.url)}" rel="noopener">${esc(p.button)}</a>
  </div>
</aside>`;
}

function toolPage(t) {
  const cat = catById[t.cat];
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: `${t.name} – ${config.name}`,
      url: absUrl(t.slug),
      description: t.description,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Alle (Webbrowser)",
      inLanguage: "de-DE",
      isAccessibleForFree: true,
      offers: t.pro
        ? [
            { "@type": "Offer", name: "Pro monatlich", price: priceNum(config.pricing.pro), priceCurrency: "EUR" },
            { "@type": "Offer", name: "Tagespass", price: priceNum(config.pricing.daypass), priceCurrency: "EUR" },
          ]
        : { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: config.name, item: config.domain + "/" },
        ...(t.landingOf ? [{ "@type": "ListItem", position: 2, name: bySlug[t.landingOf].name, item: absUrl(t.landingOf) }] : []),
        { "@type": "ListItem", position: t.landingOf ? 3 : 2, name: t.name, item: absUrl(t.slug) },
      ],
    },
    faqLd(t.faq),
  ];

  const related = t.related.map((s) => bySlug[s]).filter(Boolean);
  // Ratgeber zum selben Werkzeug verlinken (auf der Werkzeugseite und auf den Ratgeberseiten untereinander)
  const home = t.landingOf || t.slug;
  const guides = landingPages.filter((g) => (g.landingOf === home || g.related.includes(home)) && g.slug !== t.slug && !t.related.includes(g.slug));

  const body = `<div class="tool-head wrap">
  <nav class="crumbs" aria-label="Brotkrümelnavigation"><a href="/">Startseite</a><span aria-hidden="true">/</span>${
    t.landingOf ? `<a href="${url(t.landingOf)}">${esc(bySlug[t.landingOf].name)}</a><span aria-hidden="true">/</span><span>${esc(t.name)}</span>` : `<span>${esc(cat.name)}</span>`
  }</nav>
  <h1>${esc(t.h1)}</h1>
  <p class="tool-head__lead">${esc(t.lead)}</p>
</div>

<div class="wrap">
  ${workspace(t)}
</div>
${t.promo ? promoBox(t.promo) : ""}

<section class="wrap howto" aria-labelledby="so-gehts">
  <h2 id="so-gehts">So geht's: ${esc(t.name)}</h2>
  <ol class="steps">
    ${t.steps.map(([h, p]) => `<li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join("\n    ")}
  </ol>
</section>

<section class="wrap article">
  ${t.article.map((a) => `<h2>${esc(a.h)}</h2>\n  ${a.p.map((p) => `<p>${esc(p)}</p>`).join("\n  ")}`).join("\n  ")}
</section>

<section class="wrap faq" aria-labelledby="faq-title">
  <h2 id="faq-title">Häufige Fragen</h2>
  ${faqHtml(t.faq)}
</section>

${
  guides.length
    ? `<section class="wrap article guides" aria-labelledby="guides-title">
  <h2 id="guides-title">Ratgeber</h2>
  <ul>
    ${guides.map((g) => `<li><a href="${url(g.slug)}">${esc(g.guide)}</a></li>`).join("\n    ")}
  </ul>
</section>
`
    : ""
}<section class="wrap related" aria-labelledby="related-title">
  <h2 id="related-title">Passende Werkzeuge</h2>
  <ul class="tgrid tgrid--compact">
      ${related.map(toolCard).join("\n      ")}
  </ul>
</section>`;

  if (t.ui.mode === "editor") {
    const scripts = ["/vendor/pdf.min.js", "/vendor/fabric.min.js", t.ui.sign && "/vendor/pdf-lib.min.js", `/assets/account.js?v=${BUILD_ID}`, `/assets/editor.js?v=${BUILD_ID}`]
      .filter(Boolean)
      .map((s) => `\n<script src="${s}" defer></script>`)
      .join("");
    return page({ title: t.title, description: t.description, slug: t.slug, body, jsonLd, activeSlug: t.slug, scripts, ads: false });
  }
  if (t.ui.mode === "cv") {
    return page({ title: t.title, description: t.description, slug: t.slug, body, jsonLd, activeSlug: t.slug, scripts: `\n<script src="/assets/cv.js?v=${BUILD_ID}" defer></script>` });
  }
  if (t.ui.mode === "slides") {
    return page({ title: t.title, description: t.description, slug: t.slug, body, jsonLd, activeSlug: t.slug, scripts: `\n<script src="/assets/slides.js?v=${BUILD_ID}" defer></script>` });
  }
  const needsPdfJs = t.ui.preview === "pages";
  const needsPdfLib = t.ui.mode === "client";
  const needsZip = ["split", "extract-pages", "pdf-to-jpg"].includes(t.slug);
  const needsSortable = t.ui.sortable || t.ui.select === "organize";
  const scripts = [
    needsPdfLib && "/vendor/pdf-lib.min.js",
    needsPdfJs && "/vendor/pdf.min.js",
    needsZip && "/vendor/jszip.min.js",
    needsSortable && "/vendor/Sortable.min.js",
    `/assets/tool.js?v=${BUILD_ID}`,
  ]
    .filter(Boolean)
    .map((s) => `\n<script src="${s}" defer></script>`)
    .join("");

  return page({ title: t.title, description: t.description, slug: t.slug, body, jsonLd, activeSlug: t.slug, scripts });
}

// ---------------------------------------------------------------------------
// PDF-Editor (Pro)
// ---------------------------------------------------------------------------
const priceNum = (label) => label.replace(/[^\d,]/g, "").replace(",", ".");

const ED_ICON = {
  select: '<path d="M6 4l12 7-5.5 1.5L10 18Z"/>',
  edittext: '<path d="M5 6h10M10 6v12"/><path d="m14 18 5-5 1.5 1.5-5 5H14Z"/>',
  text: '<path d="M5 6h14M12 6v13"/>',
  image: '<rect x="4" y="5" width="16" height="14" rx="1.5"/><circle cx="9" cy="10" r="1.6"/><path d="m5 18 5-5 3 3 2-2 4 4"/>',
  rect: '<rect x="4.5" y="6" width="15" height="12" rx="1"/>',
  ellipse: '<ellipse cx="12" cy="12" rx="8" ry="6"/>',
  line: '<path d="M5 19 19 5"/>',
  draw: '<path d="M4 17c3-6 5-9 7-9s0 8 2 8 3-5 7-7"/>',
  highlight: '<path d="M4 20h16"/><path d="m7 15 8.5-8.5 3 3L10 18H7Z"/>',
  whiteout: '<rect x="4" y="6" width="16" height="12" rx="1" stroke-dasharray="3 2"/><path d="M8 12h8"/>',
  redact: '<rect x="4" y="6" width="16" height="12" rx="1"/><path d="m9 9 6 6M15 9l-6 6"/>',
  undo: '<path d="M9 7 4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 0 12"/>',
  trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/>',
  download: '<path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M4 17v1.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V17"/>',
  sign: '<path d="M4 16c2-5 4-8 5.5-8S9 16 11 16s2.5-4 4-4 1 4 3 4"/><path d="M4 20h16"/>',
};
const edIcon = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ED_ICON[k]}</svg>`;

function edTool(key, label, extra = "") {
  return `<button type="button" class="ed-tool" data-ed-tool="${key}" aria-pressed="false" title="${esc(label)}"${extra}>${edIcon(key)}<span>${esc(label)}</span></button>`;
}

function editorWorkspace(t) {
  const blank = t.ui.start === "blank";
  const sign = Boolean(t.ui.sign);
  const P = config.pricing;
  const notice = sign
    ? `<p class="privacy">${ICON.device}<span><strong>Im Browser:</strong> Deine PDF wird nicht hochgeladen. Kostenlos und ohne Konto.</span></p>`
    : FREE
      ? `<p class="privacy">${ICON.device}<span><strong>Kostenlos:</strong> Bearbeiten und Herunterladen ohne Konto und ohne Wasserzeichen.</span></p>`
      : `<p class="privacy">${ICON.device}<span><strong>Pro-Werkzeug:</strong> Bearbeiten geht ohne Konto. Zum Herunterladen brauchst du ein Konto: ${P.trialDays} Tage gratis, danach ${P.pro}/Monat oder ${P.daypass} Tagespass. <a href="/preise.html">Preise</a></span></p>`;
  const toolButtons = sign
    ? `${edTool("select", "Auswählen")}
          ${edTool("sign", "Unterschrift")}
          ${edTool("text", "Text / Datum")}
          ${edTool("image", "Bild")}`
    : `${edTool("select", "Auswählen")}
          ${edTool("edittext", "Text ändern", " data-needs-source hidden")}
          ${edTool("text", "Text")}
          ${edTool("image", "Bild")}
          ${edTool("rect", "Rechteck")}
          ${edTool("ellipse", "Kreis")}
          ${edTool("line", "Linie")}
          ${edTool("draw", "Zeichnen")}
          ${edTool("highlight", "Markieren")}
          ${edTool("whiteout", "Überdecken")}
          ${edTool("redact", "Entfernen")}`;
  return `<section class="editor tool tool--edit" data-editor data-start="${t.ui.start}"${sign ? " data-sign" : ""} aria-label="${esc(t.name)}">
    <div class="stage stage--pick"${blank ? " hidden" : ""}>
      <div class="drop" data-drop>
        ${toolIcon(t, 56)}
        <label class="btn btn--primary btn--lg drop__btn">
          ${ICON.upload}<span>PDF auswählen</span>
          <input type="file" class="visually-hidden" accept=".pdf,application/pdf" data-ed-open>
        </label>
        <p class="drop__or">oder PDF hierher ziehen</p>
        ${sign ? "" : `<p class="drop__hint">Oder <button type="button" class="btn--inline" data-ed-blank>mit einer leeren Seite beginnen</button></p>`}
      </div>
      ${notice}
    </div>

    <div class="stage stage--editor"${blank ? "" : " hidden"}>
      <div class="ed-bar" role="toolbar" aria-label="Werkzeuge">
        <div class="ed-tools">
          ${toolButtons}
        </div>
        <div class="ed-actions">
          <button type="button" class="ed-tool ed-tool--icon" data-ed-undo title="Rückgängig (Strg+Z)" disabled>${edIcon("undo")}<span class="visually-hidden">Rückgängig</span></button>
          <button type="button" class="btn btn--primary" data-ed-download>${edIcon("download")}<span>Herunterladen</span></button>
        </div>
      </div>

      <div class="ed-props" data-ed-props>
        <p class="ed-hint" data-ed-hint>Wähle ein Werkzeug oder klicke ein Element an.</p>
        <div class="ed-group" data-group="text" hidden>
          <label>Schrift <select data-prop="font">
            <option value="helv">Helvetica</option><option value="tiro">Times</option><option value="cour">Courier</option>
          </select></label>
          <label>Größe <input type="number" data-prop="size" min="4" max="200" value="16"></label>
          <label class="ed-color">Farbe <input type="color" data-prop="color" value="#16213d"></label>
          <button type="button" class="ed-toggle" data-prop="bold" aria-pressed="false" title="Fett"><b>F</b></button>
          <button type="button" class="ed-toggle" data-prop="italic" aria-pressed="false" title="Kursiv"><i>K</i></button>
        </div>
        <div class="ed-group" data-group="shape" hidden>
          <label class="ed-color">Linie <input type="color" data-prop="stroke" value="#2b4bdb"></label>
          <label class="ed-color" data-fill-wrap>Füllung <input type="color" data-prop="fill" value="#ffffff"></label>
          <label class="ed-check" data-fill-wrap><input type="checkbox" data-prop="nofill" checked> ohne Füllung</label>
          <label>Stärke <input type="number" data-prop="strokeWidth" min="0" max="40" value="2"></label>
        </div>
        <div class="ed-group" data-group="opacity" hidden>
          <label>Deckkraft <input type="range" data-prop="opacity" min="10" max="100" value="100"></label>
        </div>
        <button type="button" class="ed-tool ed-tool--icon ed-delete" data-ed-delete hidden title="Löschen (Entf)">${edIcon("trash")}<span>Löschen</span></button>
      </div>

      <div class="ed-canvas" data-ed-scroll>
        <div class="ed-pages" data-ed-pages></div>
        <div class="ed-add">
          <select data-ed-size aria-label="Seitenformat">
            <option value="a4p">A4 hoch</option><option value="a4l">A4 quer</option>
            <option value="a5p">A5 hoch</option><option value="letterp">US Letter hoch</option>
          </select>
          <button type="button" class="btn btn--ghost btn--sm" data-ed-addpage>+ Leere Seite hinzufügen</button>
        </div>
      </div>
      <input type="file" class="visually-hidden" accept="image/png,image/jpeg" data-ed-image>
    </div>

    <div class="stage stage--busy" hidden aria-live="polite">
      <div class="busy"><div class="busy__bar is-indeterminate"><span></span></div><p data-busy-text>PDF wird erstellt …</p></div>
    </div>

    ${sign ? signatureDialog() : ""}
    <dialog class="modal" data-modal aria-labelledby="modal-title">
      <button type="button" class="modal__close" data-modal-close aria-label="Schließen">${ICON.close}</button>
      <div data-modal-view="auth">
        <h2 id="modal-title">Konto anlegen und herunterladen</h2>
        <p class="modal__lead">${P.trialDays} Tage kostenlos, ohne Zahlungsdaten. Deine Bearbeitung bleibt erhalten.</p>
        ${authForms("modal")}
      </div>
      <div data-modal-view="plans" hidden>
        <h2>Deine Testphase ist abgelaufen</h2>
        <p class="modal__lead">Wähle einen Tarif, um deine PDF herunterzuladen. Deine Bearbeitung bleibt erhalten.</p>
        ${planCards("modal")}
      </div>
    </dialog>
  </section>`;
}

function signatureDialog() {
  return `<dialog class="modal sig" data-sig aria-labelledby="sig-title">
      <button type="button" class="modal__close" data-sig-close aria-label="Schließen">${ICON.close}</button>
      <h2 id="sig-title">Unterschrift erstellen</h2>
      <div class="sig__tabs" role="tablist">
        <button type="button" role="tab" aria-selected="true" data-sig-tab="draw">Zeichnen</button>
        <button type="button" role="tab" aria-selected="false" data-sig-tab="upload">Foto hochladen</button>
      </div>
      <div class="sig__panel" data-sig-panel="draw">
        <canvas class="sig__pad" data-sig-pad width="900" height="300" aria-label="Feld zum Unterschreiben"></canvas>
        <div class="sig__row">
          <span class="sig__colors" role="radiogroup" aria-label="Farbe">
            <button type="button" class="sig__color" data-sig-color="#111827" aria-pressed="true" aria-label="Schwarz" style="--c:#111827"></button>
            <button type="button" class="sig__color" data-sig-color="#1d3fb8" aria-pressed="false" aria-label="Blau" style="--c:#1d3fb8"></button>
          </span>
          <button type="button" class="btn btn--link" data-sig-clear>Löschen</button>
        </div>
        <p class="sig__hint">Mit Maus, Touchpad oder Finger unterschreiben.</p>
      </div>
      <div class="sig__panel" data-sig-panel="upload" hidden>
        <label class="btn btn--ghost btn--block">Foto der Unterschrift auswählen<input type="file" class="visually-hidden" accept="image/png,image/jpeg" data-sig-file></label>
        <p class="sig__hint">Unterschrift auf weißem Papier fotografieren – der weiße Hintergrund wird automatisch entfernt.</p>
        <img class="sig__preview" data-sig-preview alt="Vorschau der Unterschrift" hidden>
      </div>
      <label class="check"><input type="checkbox" data-sig-remember> <span>Unterschrift auf diesem Gerät merken</span></label>
      <div class="sig__actions">
        <button type="button" class="btn btn--ghost" data-sig-saved hidden>Gespeicherte Unterschrift verwenden</button>
        <button type="button" class="btn btn--primary" data-sig-insert>Einfügen</button>
      </div>
    </dialog>`;
}

function authForms(prefix) {
  return `<div class="auth" data-auth>
          <div class="auth__tabs" role="tablist">
            <button type="button" role="tab" aria-selected="true" data-auth-tab="register">Registrieren</button>
            <button type="button" role="tab" aria-selected="false" data-auth-tab="login">Anmelden</button>
          </div>
          <form class="auth__form" data-auth-form="register" novalidate>
            <div class="field"><label for="${prefix}-reg-email">E-Mail</label><input id="${prefix}-reg-email" type="email" name="email" autocomplete="email" required></div>
            <div class="field"><label for="${prefix}-reg-pw">Passwort</label><input id="${prefix}-reg-pw" type="password" name="password" autocomplete="new-password" minlength="8" required><small class="field__hint">Mindestens 8 Zeichen</small></div>
            <label class="check"><input type="checkbox" name="acceptTerms" required> <span>Ich akzeptiere die <a href="/agb.html" target="_blank">AGB</a> und habe die <a href="/Datenschutz.html" target="_blank">Datenschutzerklärung</a> gelesen.</span></label>
            <p class="form-error" data-auth-error role="alert" hidden></p>
            <button type="submit" class="btn btn--primary btn--block">Kostenlos registrieren</button>
          </form>
          <form class="auth__form" data-auth-form="login" hidden novalidate>
            <div class="field"><label for="${prefix}-login-email">E-Mail</label><input id="${prefix}-login-email" type="email" name="email" autocomplete="email" required></div>
            <div class="field"><label for="${prefix}-login-pw">Passwort</label><input id="${prefix}-login-pw" type="password" name="password" autocomplete="current-password" required></div>
            <p class="form-error" data-auth-error role="alert" hidden></p>
            <button type="submit" class="btn btn--primary btn--block">Anmelden</button>
            <a class="auth__forgot" href="/passwort-vergessen.html">Passwort vergessen?</a>
          </form>
        </div>`;
}

function planCards(prefix) {
  const P = config.pricing;
  return `<div class="plans" data-plans>
          <div class="plan plan--main">
            <h3>Pro</h3>
            <p class="plan__price"><strong>${P.pro}</strong> / Monat</p>
            <ul><li>PDF-Editor und KI-Werkzeuge ohne Limit</li><li>Monatlich kündbar</li></ul>
            <button type="button" class="btn btn--primary btn--block" data-checkout="pro">Pro wählen</button>
          </div>
          <div class="plan">
            <h3>Tagespass</h3>
            <p class="plan__price"><strong>${P.daypass}</strong> einmalig</p>
            <ul><li>${P.daypassHours} Stunden voller Zugang</li><li>Kein Abo, keine Kündigung nötig</li></ul>
            <button type="button" class="btn btn--ghost btn--block" data-checkout="daypass">Tagespass kaufen</button>
          </div>
          <label class="check plans__waiver"><input type="checkbox" data-waiver> <span>Ich möchte, dass der Zugang sofort freigeschaltet wird, und weiß, dass mein Widerrufsrecht damit erlischt (<a href="/agb.html#widerruf" target="_blank">Details</a>).</span></label>
          <p class="form-error" data-plans-error role="alert" hidden></p>
          <p class="plans__note">Sichere Zahlung über Stripe: Karte, PayPal, SEPA, Apple Pay und Google Pay – je nach Stripe-Einstellung.</p>
        </div>`;
}

function accountScripts() {
  return `\n<script src="/assets/account.js?v=${BUILD_ID}" defer></script>`;
}

function pricingPage() {
  const P = config.pricing;
  const faq = [
    ["Muss ich für die Testphase Zahlungsdaten angeben?", `Nein. Du registrierst dich nur mit E-Mail und Passwort und kannst ${P.trialDays} Tage lang alle Pro-Funktionen nutzen. Danach entscheidest du, ob du weitermachen willst.`],
    ["Wie kündige ich Pro?", "Jederzeit in deinem Konto über „Abo verwalten oder kündigen“. Du behältst den Zugang bis zum Ende des bezahlten Monats."],
    ["Was ist der Unterschied zum Tagespass?", `Der Tagespass kostet einmalig ${P.daypass} und gibt dir ${P.daypassHours} Stunden vollen Zugang – ideal, wenn du nur ein Dokument bearbeiten musst. Er verlängert sich nicht.`],
    ["Bleiben die anderen Werkzeuge kostenlos?", "Ja. Zusammenfügen, Komprimieren, Unterschreiben, Umwandeln und alle anderen Werkzeuge bleiben kostenlos und ohne Konto nutzbar."],
    ["Was ist in Pro enthalten?", `${proNames()}. Alles ohne Wasserzeichen und ohne Tageslimit.`],
  ];
  return page({
    title: "Preise – PDF Libre Pro | PDF-Editor & KI-Werkzeuge",
    description: `PDF Libre Pro: PDF bearbeiten, erstellen, mit KI zusammenfassen und übersetzen. ${P.trialDays} Tage kostenlos testen, danach ${P.pro} im Monat oder Tagespass für ${P.daypass}. Alle anderen Werkzeuge bleiben gratis.`,
    slug: "preise",
    ads: false,
    jsonLd: [faqLd(faq)],
    body: `<div class="tool-head wrap">
  <h1>Einfache Preise</h1>
  <p class="tool-head__lead">Fast alle Werkzeuge sind kostenlos. Nur der PDF-Editor und die KI-Werkzeuge gehören zu Pro – und die testest du ${P.trialDays} Tage gratis.</p>
</div>
<section class="wrap pricing">
  <div class="plans plans--page">
    <div class="plan">
      <h2>Kostenlos</h2>
      <p class="plan__price"><strong>0 €</strong></p>
      <ul><li>Alle ${tools.filter((x) => !x.pro).length} Werkzeuge</li><li>Ohne Konto</li><li>Keine Wasserzeichen</li></ul>
      <a class="btn btn--ghost btn--block" href="/">Zu den Werkzeugen</a>
    </div>
    <div class="plan plan--main">
      <h2>Pro</h2>
      <p class="plan__price"><strong>${P.pro}</strong> / Monat</p>
      <ul><li>PDF bearbeiten: Text ändern, einfügen, entfernen</li><li>PDF erstellen</li><li>PDF mit KI zusammenfassen</li><li>PDF mit KI übersetzen</li><li>${P.trialDays} Tage kostenlos testen</li><li>Monatlich kündbar</li></ul>
      <a class="btn btn--primary btn--block" href="/anmelden.html?next=/edit.html">${P.trialDays} Tage gratis testen</a>
    </div>
    <div class="plan">
      <h2>Tagespass</h2>
      <p class="plan__price"><strong>${P.daypass}</strong> einmalig</p>
      <ul><li>Alle Pro-Funktionen</li><li>${P.daypassHours} Stunden gültig</li><li>Kein Abo</li></ul>
      <a class="btn btn--ghost btn--block" href="/konto.html">Tagespass kaufen</a>
    </div>
  </div>
  <p class="pricing__note">Alle Preise inkl. gesetzlicher Umsatzsteuer, sofern anfallend.</p>
</section>
<section class="wrap faq" aria-labelledby="faq-title">
  <h2 id="faq-title">Häufige Fragen</h2>
  ${faqHtml(faq)}
</section>`,
  });
}

function loginPage() {
  return page({
    title: "Anmelden | PDF Libre",
    description: "Bei PDF Libre anmelden oder kostenlos registrieren.",
    slug: "anmelden",
    ads: false,
    noindex: true,
    scripts: accountScripts(),
    body: `<section class="wrap narrow" data-page="login">
  <h1>Anmelden</h1>
  <p class="tool-head__lead">Neu hier? Registriere dich und teste Pro ${config.pricing.trialDays} Tage kostenlos.</p>
  ${authForms("page")}
</section>`,
  });
}

function accountPage() {
  return page({
    title: "Mein Konto | PDF Libre",
    description: "Dein PDF Libre Konto.",
    slug: "konto",
    ads: false,
    noindex: true,
    scripts: accountScripts(),
    body: `<section class="wrap narrow" data-page="account">
  <h1>Mein Konto</h1>
  <div class="account" data-account-view hidden>
    <div class="account__card">
      <p class="account__email" data-acc-email></p>
      <p class="account__status" data-acc-status></p>
      <div class="account__actions">
        <a class="btn btn--primary" href="/edit.html">PDF bearbeiten</a>
        <button type="button" class="btn btn--ghost" data-portal hidden>Abo verwalten oder kündigen</button>
        <button type="button" class="btn btn--link" data-logout>Abmelden</button>
      </div>
    </div>
    <div data-acc-plans hidden>
      <h2>Tarif wählen</h2>
      ${planCards("account")}
    </div>
  </div>
  <p data-acc-loading>Wird geladen …</p>
</section>`,
  });
}

function forgotPage() {
  return page({
    title: "Passwort vergessen | PDF Libre",
    description: "Passwort für dein PDF Libre Konto zurücksetzen.",
    slug: "passwort-vergessen",
    ads: false,
    noindex: true,
    scripts: accountScripts(),
    body: `<section class="wrap narrow" data-page="forgot">
  <h1>Passwort zurücksetzen</h1>
  <form class="auth__form" data-forgot novalidate>
    <p class="tool-head__lead">Gib deine E-Mail-Adresse ein. Wir schicken dir einen Link, mit dem du ein neues Passwort festlegst.</p>
    <div class="field"><label for="fg-email">E-Mail</label><input id="fg-email" type="email" name="email" autocomplete="email" required></div>
    <p class="form-error" data-auth-error role="alert" hidden></p>
    <button type="submit" class="btn btn--primary btn--block">Link senden</button>
  </form>
  <form class="auth__form" data-reset hidden novalidate>
    <div class="field"><label for="rs-pw">Neues Passwort</label><input id="rs-pw" type="password" name="password" autocomplete="new-password" minlength="8" required><small class="field__hint">Mindestens 8 Zeichen</small></div>
    <p class="form-error" data-auth-error role="alert" hidden></p>
    <button type="submit" class="btn btn--primary btn--block">Passwort speichern</button>
  </form>
  <p class="notice" data-done hidden></p>
</section>`,
  });
}

function agbPage() {
  const P = config.pricing;
  return legalPage({
    slug: "agb",
    title: "AGB & Widerrufsbelehrung | PDF Libre",
    h1: "Allgemeine Geschäftsbedingungen",
    description: "AGB und Widerrufsbelehrung für PDF Libre Pro.",
    html: `<p class="notice">Stand: ${new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" })}</p>
  <h2>§ 1 Geltungsbereich</h2>
  <p>Diese AGB gelten für die Nutzung der kostenpflichtigen Funktionen („Pro“) von PDF Libre (${config.domain}), angeboten von ${esc(config.owner)}, ${config.address.map(esc).join(", ")} („Anbieter“). Die kostenlosen Werkzeuge können ohne Konto genutzt werden.</p>
  <h2>§ 2 Konto und Testphase</h2>
  <p>Für Pro ist ein Konto erforderlich. Nach der Registrierung kannst du Pro ${P.trialDays} Tage kostenlos nutzen. Die Testphase endet automatisch und geht nicht in ein kostenpflichtiges Abo über.</p>
  <h2>§ 3 Leistungen und Preise</h2>
  <p>Pro kostet ${P.pro} pro Monat, der Tagespass ${P.daypass} einmalig für ${P.daypassHours} Stunden Zugang. Die Zahlung erfolgt im Voraus über den Zahlungsdienstleister Stripe.</p>
  <h2>§ 4 Laufzeit und Kündigung</h2>
  <p>Das Pro-Abo verlängert sich monatlich und kann jederzeit zum Ende des laufenden Monats gekündigt werden – im Konto über „Abo verwalten oder kündigen“. Der Tagespass endet automatisch.</p>
  <h2>§ 5 Verfügbarkeit und Haftung</h2>
  <p>Der Anbieter bemüht sich um eine hohe Verfügbarkeit, schuldet aber keine ununterbrochene Erreichbarkeit. Bitte bewahre deine Originaldateien auf. Der Anbieter haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper und Gesundheit; im Übrigen nur bei Verletzung wesentlicher Vertragspflichten und begrenzt auf den vorhersehbaren, vertragstypischen Schaden.</p>
  <h2>§ 6 Pflichten der Nutzer</h2>
  <p>Du darfst nur Dateien verarbeiten, zu deren Nutzung du berechtigt bist, und PDF Libre nicht für rechtswidrige Zwecke verwenden.</p>
  <h2 id="widerruf">Widerrufsbelehrung</h2>
  <p><strong>Widerrufsrecht:</strong> Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsschlusses. Um dein Widerrufsrecht auszuüben, musst du uns (${esc(config.owner)}, ${config.address.map(esc).join(", ")}, E-Mail: ${config.email}) mittels einer eindeutigen Erklärung (z. B. E-Mail) über deinen Entschluss informieren.</p>
  <p><strong>Folgen des Widerrufs:</strong> Wenn du diesen Vertrag widerrufst, erstatten wir dir alle Zahlungen unverzüglich und spätestens binnen vierzehn Tagen über dasselbe Zahlungsmittel. Hast du verlangt, dass die Leistung während der Widerrufsfrist beginnt, zahlst du einen angemessenen Betrag für die bis zum Widerruf erbrachten Leistungen.</p>
  <p><strong>Vorzeitiges Erlöschen:</strong> Das Widerrufsrecht erlischt, wenn wir mit der Ausführung des Vertrags begonnen haben, nachdem du ausdrücklich zugestimmt hast, dass wir vor Ablauf der Widerrufsfrist beginnen, und du deine Kenntnis davon bestätigt hast, dass du dadurch dein Widerrufsrecht verlierst.</p>
  <h2>Streitbeilegung</h2>
  <p>Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>`,
  });
}

// ---------------------------------------------------------------------------
// Rechtliches & 404
// ---------------------------------------------------------------------------
function legalPage({ slug, title, h1, html, description }) {
  return page({
    title,
    description,
    slug,
    body: `<article class="wrap legal">
  <h1>${h1}</h1>
  ${html}
</article>`,
  });
}

function impressum() {
  return legalPage({
    slug: "impressum",
    title: "Impressum | PDF Libre",
    h1: "Impressum",
    description: "Impressum von PDF Libre – Angaben gemäß § 5 DDG.",
    html: `<h2>Angaben gemäß § 5 DDG</h2>
  <p>${esc(config.owner)}<br>${config.address.map(esc).join("<br>")}</p>
  <h2>Kontakt</h2>
  <p>E-Mail: <a href="mailto:${config.email}">${config.email}</a></p>
  <h2>Verantwortlich für den Inhalt</h2>
  <p>${esc(config.owner)}, Anschrift wie oben.</p>
  <h2>Haftung für Links</h2>
  <p>Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte ich keinen Einfluss habe. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter verantwortlich.</p>`,
  });
}

function datenschutz() {
  const ga = config.analyticsId
    ? `<h2 id="einwilligung">Einwilligung (Cookie-Banner)</h2>
  <p>Google Analytics und Google AdSense werden erst aktiv, wenn du im Cookie-Banner zustimmst. Ohne Zustimmung setzen sie keine Cookies. Deine Auswahl kannst du jederzeit über „Datenschutzeinstellungen“ unten auf jeder Seite ändern. Rechtsgrundlage ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG).</p>
  <p>Öffnet sich beim Klick auf „Datenschutzeinstellungen“ kein Fenster, blockiert dein Browser oder ein Werbeblocker den Cookie-Banner. Dann werden auch keine Analyse- oder Werbe-Cookies gesetzt. Bereits gespeicherte Cookies kannst du jederzeit in den Einstellungen deines Browsers löschen.</p>
  <h2>Google Analytics</h2>
  <p>Diese Website nutzt Google Analytics 4 der Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland, um die Nutzung der Website statistisch auszuwerten. Dabei werden Cookies gesetzt und Nutzungsdaten (z. B. aufgerufene Seiten, ungefährer Standort, Gerätetyp) an Google übermittelt. IP-Adressen werden gekürzt. Weitere Informationen: <a href="https://policies.google.com/privacy" rel="noopener">Datenschutzerklärung von Google</a>.</p>`
    : "";
  const ads = config.adsenseClient
    ? `<h2>Google AdSense</h2>
  <p>Zur Finanzierung des kostenlosen Angebots wird Werbung über Google AdSense (Google Ireland Limited) angezeigt. Google kann dabei Cookies und ähnliche Technologien einsetzen, um Anzeigen auszuliefern und deren Wirksamkeit zu messen. Weitere Informationen und Widerspruchsmöglichkeiten: <a href="https://adssettings.google.com" rel="noopener">Google Anzeigeneinstellungen</a>.</p>`
    : "";
  return legalPage({
    slug: "Datenschutz",
    title: "Datenschutzerklärung | PDF Libre",
    h1: "Datenschutzerklärung",
    description: "Datenschutzerklärung von PDF Libre: Wie deine Dateien und Daten verarbeitet werden.",
    html: `<h2>Verantwortlicher</h2>
  <p>${esc(config.owner)}, ${config.address.map(esc).join(", ")}<br>E-Mail: <a href="mailto:${config.email}">${config.email}</a></p>

  <h2>Verarbeitung deiner Dateien</h2>
  <h3>Werkzeuge, die im Browser laufen</h3>
  <p>Bei den Werkzeugen, die mit „Im Browser“ gekennzeichnet sind (z. B. PDF teilen, Seiten entfernen, PDF drehen, Bilder in PDF, PDF in JPG, Seitenzahlen, Wasserzeichen), wird deine Datei ausschließlich auf deinem Gerät verarbeitet. Sie wird nicht an unseren Server übertragen.</p>
  <h3>Werkzeuge, die auf dem Server laufen</h3>
  <p>Bei allen anderen Werkzeugen wird deine Datei über eine verschlüsselte Verbindung (HTTPS) an unseren Server übertragen, dort verarbeitet und unmittelbar nach dem Download automatisch gelöscht. Nicht abgeschlossene Aufträge werden spätestens nach 30 Minuten gelöscht. Wir sehen uns deine Dateien nicht an, werten sie nicht aus und geben sie nicht weiter. Passwörter, die du bei „PDF schützen“ oder „PDF entsperren“ eingibst, werden nur für diesen Vorgang verwendet und nicht gespeichert.</p>
  <p>Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Bereitstellung des von dir angefragten Dienstes).</p>

  <h2>Server-Logdateien</h2>
  <p>Beim Aufruf der Website werden technisch notwendige Daten wie IP-Adresse, Datum und Uhrzeit, aufgerufene Seite und Browsertyp verarbeitet, um die Website auszuliefern und vor Missbrauch zu schützen (Art. 6 Abs. 1 lit. f DSGVO).</p>

  <h2>Kundenkonto (Pro)</h2>
  <p>Wenn du ein Konto anlegst, speichern wir deine E-Mail-Adresse, ein verschlüsseltes (gehashtes) Passwort, den Zeitpunkt der Registrierung und deinen Tarifstatus. Für die Anmeldung wird ein technisch notwendiges Cookie gesetzt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Du kannst die Löschung deines Kontos jederzeit per E-Mail verlangen.</p>
  <p>Beim PDF-Editor wird deine Datei erst beim Herunterladen verschlüsselt an den Server übertragen, dort verarbeitet und sofort danach gelöscht.</p>

  <h2>Zahlungsabwicklung über Stripe</h2>
  <p>Zahlungen wickeln wir über Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Dublin, Irland, ab. Zahlungsdaten gibst du direkt bei Stripe ein; wir erhalten sie nicht. Wir speichern nur eine Kunden- und Abo-Kennung von Stripe. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Weitere Informationen: <a href="https://stripe.com/de/privacy" rel="noopener">Datenschutzerklärung von Stripe</a>.</p>

  <h2>Schriftarten</h2>
  <p>Alle Schriftarten werden von unserem eigenen Server geladen. Es findet keine Verbindung zu Google Fonts oder anderen Schriftanbietern statt.</p>
  ${ga}
  ${ads}

  <h2>Deine Rechte</h2>
  <p>Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch sowie das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren, z. B. beim Hessischen Beauftragten für Datenschutz und Informationsfreiheit.</p>`,
  });
}

function notFound() {
  return page({
    title: "Seite nicht gefunden | PDF Libre",
    description: "Diese Seite gibt es nicht.",
    slug: "404",
    ads: false,
    noindex: true,
    body: `<section class="wrap notfound">
  <h1>Diese Seite gibt es nicht.</h1>
  <p>Vielleicht findest du hier, was du gesucht hast:</p>
  <ul class="tgrid tgrid--compact">
      ${["merge", "compress", "pdf-to-docx", "docx-to-pdf"].map((s) => toolCard(bySlug[s])).join("\n      ")}
  </ul>
</section>`,
  });
}

let BUILD_ID = Date.now().toString(36);
function setBuildId(id) {
  BUILD_ID = id;
}

module.exports = { setFreeMode, homePage, toolPage, impressum, datenschutz, notFound, pricingPage, loginPage, accountPage, forgotPage, agbPage, setBuildId, tools, landingPages, url, absUrl };

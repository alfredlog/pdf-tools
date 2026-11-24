// PDF Libre – Navigation & Startseiten-Filter
(() => {
  const mega = document.getElementById("mega");
  const toggles = document.querySelectorAll('[aria-controls="mega"]');

  function setMenu(open) {
    mega.hidden = !open;
    toggles.forEach((t) => t.setAttribute("aria-expanded", String(open)));
  }
  toggles.forEach((t) =>
    t.addEventListener("click", (e) => {
      e.stopPropagation();
      setMenu(mega.hidden);
    })
  );
  document.addEventListener("click", (e) => {
    if (!mega.hidden && !mega.contains(e.target)) setMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !mega.hidden) {
      setMenu(false);
      toggles[0].focus();
    }
  });

  // Kopfzeile: „Mein Konto“ statt „Anmelden“, wenn angemeldet
  if (/(?:^|;\s*)pl_in=1/.test(document.cookie)) {
    document.querySelectorAll("[data-account]").forEach((a) => {
      a.textContent = (window.PL_T && window.PL_T["Mein Konto"]) || "Mein Konto";
      a.href = "/konto.html";
    });
  }

  // „Datenschutzeinstellungen“: öffnet den Google-Cookie-Banner (Google CMP) erneut.
  // Ist der Banner nicht geladen (noch nicht in AdSense veröffentlicht, Werbeblocker …),
  // geht es zur Erklärung in der Datenschutzerklärung.
  document.querySelectorAll("[data-consent-settings]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const fc = window.googlefc;
      if (fc && typeof fc.showRevocationMessage === "function") {
        fc.showRevocationMessage();
        return;
      }
      let opened = false;
      window.googlefc = window.googlefc || {};
      window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
      window.googlefc.callbackQueue.push(() => {
        if (typeof window.googlefc.showRevocationMessage === "function") {
          opened = true;
          window.googlefc.showRevocationMessage();
        }
      });
      setTimeout(() => {
        if (!opened) location.href = "/Datenschutz.html#einwilligung";
      }, 1200);
    })
  );

  // Sprachwahl: Menü auf- und zuklappen
  document.querySelectorAll(".langsw").forEach((sw) => {
    const btn = sw.querySelector(".langsw__btn");
    const menu = sw.querySelector(".langsw__menu");
    const set = (open) => { menu.hidden = !open; btn.setAttribute("aria-expanded", String(open)); };
    btn.addEventListener("click", (e) => { e.stopPropagation(); set(menu.hidden); });
    document.addEventListener("click", (e) => { if (!sw.contains(e.target)) set(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { set(false); btn.focus(); } });
    // Wer selbst eine Sprache wählt, bekommt keinen Hinweis mehr
    menu.querySelectorAll("[data-lang-link]").forEach((a) => a.addEventListener("click", () => { try { localStorage.setItem("pl_lang", a.dataset.langLink); } catch (_) {} }));
  });

  // Hinweis: Browser-Sprache passt nicht zur Seite, es gibt aber eine Fassung in dieser Sprache.
  // Kein automatisches Umleiten (Google soll jede Fassung sehen), nur ein Angebot.
  (() => {
    const page = document.documentElement.lang || "de";
    let chosen = null;
    try { chosen = localStorage.getItem("pl_lang"); } catch (_) {}
    if (chosen) return; // Besucher hat schon entschieden (Wahl oder „×“)
    const want = (navigator.languages || [navigator.language || ""]).map((l) => l.slice(0, 2).toLowerCase()).find((l) => ["de", "en", "fr"].includes(l));
    if (!want || want === page) return;
    const alt = document.querySelector(`link[rel="alternate"][hreflang="${want}"]`);
    if (!alt) return;
    const TXT = {
      en: ["This page is also available in English.", "Switch to English"],
      fr: ["Cette page existe aussi en français.", "Passer au français"],
      de: ["Diese Seite gibt es auch auf Deutsch.", "Zur deutschen Seite"],
    }[want];
    const bar = document.createElement("div");
    bar.className = "langhint";
    bar.lang = want;
    bar.innerHTML = `<div class="wrap"><span></span><a></a><button type="button" aria-label="×">×</button></div>`;
    bar.querySelector("span").textContent = TXT[0];
    const a = bar.querySelector("a");
    a.textContent = TXT[1];
    a.href = new URL(alt.href).pathname;
    a.addEventListener("click", () => { try { localStorage.setItem("pl_lang", want); } catch (_) {} });
    bar.querySelector("button").addEventListener("click", () => { try { localStorage.setItem("pl_lang", page); } catch (_) {} bar.remove(); });
    document.body.prepend(bar);
  })();

  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  // Filter auf der Startseite
  const chips = document.querySelectorAll(".filters .chip");
  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      const f = chip.dataset.filter;
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      document.querySelectorAll(".tools-index .tgroup").forEach((group) => {
        group.hidden = f !== "all" && group.dataset.group !== f;
      });
    })
  );

  // ================================================================== Bedienkomfort
  const tr = (text, vars) => {
    const d = window.PL_T || {};
    const out = d[text] != null ? d[text] : text;
    return vars ? out.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m)) : out;
  };
  const lang = window.PL_LANG || "de";
  const norm = (x) => String(x || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  // ------------------------------------------------------------------ Datei an ein anderes Werkzeug weitergeben
  // Die Datei wird kurz im Browser (IndexedDB) abgelegt, die nächste Seite holt sie ab. Nichts geht an den Server.
  const db = () => new Promise((ok, fail) => {
    const r = indexedDB.open("pdflibre", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("handoff");
    r.onsuccess = () => ok(r.result);
    r.onerror = () => fail(r.error);
  });
  async function handoffPut(blob, name) {
    const d = await db();
    await new Promise((ok, fail) => { const tx = d.transaction("handoff", "readwrite"); tx.objectStore("handoff").put({ blob, name, type: blob.type, ts: Date.now() }, "file"); tx.oncomplete = ok; tx.onerror = () => fail(tx.error); });
  }
  async function handoffTake() {
    const d = await db();
    return new Promise((ok) => {
      const tx = d.transaction("handoff", "readwrite");
      const st = tx.objectStore("handoff");
      const g = st.get("file");
      g.onsuccess = () => { st.delete("file"); const v = g.result; ok(v && Date.now() - v.ts < 10 * 60 * 1000 ? v : null); };
      g.onerror = () => ok(null);
    });
  }
  async function goWithFile(href, blob, name) {
    try { await handoffPut(blob, name); } catch (_) {}
    location.href = href;
  }
  // Auf Werkzeugseiten: übergebene Datei in das Dateifeld legen, als hätte man sie ausgewählt
  const toolSection = document.querySelector("section.tool");
  if (toolSection && window.indexedDB) {
    document.addEventListener("DOMContentLoaded", async () => {
      let v = null;
      try { v = await handoffTake(); } catch (_) {}
      if (!v) return;
      const input = toolSection.querySelector('input[type="file"]');
      if (!input) return;
      const file = new File([v.blob], v.name, { type: v.type || v.blob.type });
      const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
      const accept = (input.accept || "").toLowerCase();
      if (accept && !accept.split(",").some((a) => a.trim() === ext || (a.includes("/") && file.type && (a.trim() === file.type || (a.endsWith("/*") && file.type.startsWith(a.slice(0, -1))))))) {
        toast(tr("Die Datei „{name}“ passt nicht zu diesem Werkzeug.", { name: file.name }));
        return;
      }
      try {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
        toast(tr("Datei übernommen: {name}", { name: file.name }));
      } catch (_) {}
    });
  }
  // „Weiter mit …“: liegt schon ein Ergebnis zum Herunterladen vor, nimmt der Link es mit
  document.addEventListener("click", async (e) => {
    const link = e.target.closest(".done__next a[href], .related a[href]");
    if (!link || !toolSection || e.metaKey || e.ctrlKey) return;
    const result = [...toolSection.querySelectorAll('a[download][href^="blob:"]')].find((a) => a.offsetParent !== null);
    if (!result) return;
    e.preventDefault();
    try {
      const blob = await (await fetch(result.href)).blob();
      await goWithFile(link.href, blob, result.download || "dokument.pdf");
    } catch (_) { location.href = link.href; }
  });
  function toast(text) {
    const t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add("is-out"), 3500);
    setTimeout(() => t.remove(), 4200);
  }

  // ------------------------------------------------------------------ zuletzt benutzte Werkzeuge
  const RECENT = "pl_recent";
  const slugOf = (path) => (path.split("/").pop() || "").replace(/\.html$/, "");
  if (toolSection) {
    try {
      const slug = slugOf(location.pathname);
      const list = JSON.parse(localStorage.getItem(RECENT) || "[]").filter((x) => x !== slug);
      localStorage.setItem(RECENT, JSON.stringify([slug, ...list].slice(0, 6)));
    } catch (_) {}
  }
  const recentBox = document.querySelector("[data-recent]");
  if (recentBox) {
    try {
      const slugs = JSON.parse(localStorage.getItem(RECENT) || "[]");
      const ul = recentBox.querySelector("[data-recent-list]");
      for (const sl of slugs) {
        const card = document.querySelector(`.tools-index .tcard[data-slug="${CSS.escape(sl)}"]`);
        if (card) ul.appendChild(card.cloneNode(true));
      }
      recentBox.hidden = !ul.children.length;
    } catch (_) {}
  }

  // ------------------------------------------------------------------ Suche „Was möchtest du tun?“
  const search = document.querySelector("[data-search]");
  if (search) {
    const cards = [...document.querySelectorAll(".tools-index .tcard")];
    const groups = [...document.querySelectorAll(".tools-index .tgroup")];
    const empty = document.querySelector("[data-search-empty]");
    const run = () => {
      const words = norm(search.value).split(/\s+/).filter((w) => w.length > 1);
      if (words.length) chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.filter === "all")));
      let hits = 0;
      for (const c of cards) {
        const hay = norm(c.dataset.kw);
        const ok = !words.length || words.every((w) => hay.includes(w) || hay.includes(w.replace(/(en|e|n|s)$/, "")));
        c.hidden = !ok;
        if (ok) hits++;
      }
      groups.forEach((g) => (g.hidden = ![...g.querySelectorAll(".tcard")].some((c) => !c.hidden)));
      empty.hidden = hits > 0;
    };
    search.addEventListener("input", run);
    search.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const first = cards.find((c) => !c.hidden);
      if (first && search.value.trim()) location.href = first.querySelector("a").href;
    });
  }

  // ------------------------------------------------------------------ Datei ablegen → passende Werkzeuge
  const smartDrop = document.querySelector("[data-smart-drop]");
  if (smartDrop && window.PL_TOOLS) {
    const byslug = Object.fromEntries(window.PL_TOOLS.map((t) => [t.s, t]));
    const out = document.querySelector("[data-smart-result]");
    const fileInput = smartDrop.querySelector("input");
    ["dragover", "dragenter"].forEach((ev) => document.addEventListener(ev, (e) => { if (e.dataTransfer && [...e.dataTransfer.types].includes("Files")) { e.preventDefault(); smartDrop.classList.add("is-over"); } }));
    ["dragleave", "drop"].forEach((ev) => smartDrop.addEventListener(ev, () => smartDrop.classList.remove("is-over")));
    document.addEventListener("drop", (e) => { if (e.dataTransfer && e.dataTransfer.files[0]) { e.preventDefault(); smartDrop.classList.remove("is-over"); analyse(e.dataTransfer.files[0]); } });
    fileInput.addEventListener("change", () => fileInput.files[0] && analyse(fileInput.files[0]));
    // Über „Teilen → PDF Libre“ angekommen (Service Worker hat die Datei abgelegt)
    if (/[?&]shared=1/.test(location.search)) {
      handoffTake().then((v) => {
        history.replaceState(null, "", location.pathname);
        if (v) analyse(new File([v.blob], v.name, { type: v.type || v.blob.type }));
      }).catch(() => {});
    }

    async function analyse(file) {
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      const head = async (n) => new TextDecoder("latin1").decode(await file.slice(0, n).arrayBuffer());
      const tail = async (n) => new TextDecoder("latin1").decode(await file.slice(Math.max(0, file.size - n)).arrayBuffer());
      const sug = []; // [slug, Grund]
      const add = (slug, why) => { if (byslug[slug] && !sug.some((x) => x[0] === slug)) sug.push([slug, why]); };
      let what = "";
      if (ext === "pdf") {
        // Rohdaten (schnell) + pdf.js (genau – wird erst jetzt nachgeladen, damit die Startseite leicht bleibt)
        const txt = (await head(3_000_000)) + (file.size > 3_000_000 ? await tail(1_000_000) : "");
        let facturx = /factur-x\.xml|zugferd-invoice\.xml|xrechnung\.xml|ZUGFeRD/i.test(txt);
        let encrypted = /\/Encrypt\s/.test(txt);
        let xfa = /\/XFA[\s[(<]/.test(txt);
        let fields = /\/AcroForm/.test(txt) && /\/Widget/.test(txt);
        let hasText = /\/Font\b/.test(txt);
        let hasImage = /\/Subtype\s*\/Image/.test(txt);
        let pages = Math.max(1, (txt.match(/\/Type\s*\/Page[^s]/g) || []).length);
        try {
          await loadScript("/vendor/pdf.min.js");
          pdfjsLib.GlobalWorkerOptions.workerSrc = "/vendor/pdf.worker.min.js";
          const doc = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false }).promise;
          pages = doc.numPages;
          const att = (await doc.getAttachments()) || {};
          facturx = facturx || Object.keys(att).some((n) => /factur-x|zugferd|xrechnung/i.test(n));
          fields = !!(await doc.getFieldObjects());
          let chars = 0;
          for (let n = 1; n <= Math.min(pages, 3); n++) {
            const tc = await (await doc.getPage(n)).getTextContent();
            const t = tc.items.map((i) => i.str).join("");
            chars += t.replace(/\s/g, "").length;
            if (/please wait|later version of (the )?(adobe|pdf)/i.test(t)) xfa = true;
          }
          hasText = chars > 30;
          if (!hasText) hasImage = true;
        } catch (err) {
          if (err && err.name === "PasswordException") encrypted = true;
        }
        what = tr("PDF, {n} Seite(n), {mb} MB", { n: pages, mb: (file.size / 1048576).toFixed(1).replace(".", lang === "de" || lang === "fr" ? "," : ".") });
        if (facturx) { add("xrechnung-anzeigen", tr("Das ist eine E-Rechnung (ZUGFeRD/Factur-X).")); add("e-rechnung-pruefen", tr("Beträge und Pflichtangaben prüfen.")); }
        if (encrypted) add("unlock", tr("Die PDF ist geschützt."));
        if (xfa && !fields) add("cerfa-ausfuellen", tr("Dynamisches Formular (XFA) – so füllst du es trotzdem aus."));
        if (fields) { add("pdf-formular-ausfuellen", tr("Die PDF hat Formularfelder.")); add("sign", tr("Danach unterschreiben.")); }
        if (!hasText && hasImage) { add("ocr", tr("Sieht gescannt aus – Text durchsuchbar machen.")); add("pdf-ausfuellbar-machen", tr("Gescanntes Formular? Felder automatisch erkennen.")); }
        if (file.size > 4 * 1048576) add("compress", tr("Die Datei ist ziemlich groß – für E-Mail verkleinern."));
        if (pages > 1) { add("split", tr("Mehrere Seiten aufteilen.")); add("organize", tr("Seiten sortieren oder löschen.")); }
        if (hasText && !facturx && !xfa) { add("pdf-to-docx", tr("In Word bearbeiten.")); add("pdf-in-e-rechnung-umwandeln", tr("Ist es eine Rechnung? In eine E-Rechnung umwandeln.")); }
        ["sign", "compress", "merge", "edit", "summarize"].forEach((s) => add(s, ""));
      } else if (ext === "xml") {
        const txt = await head(200_000);
        what = tr("XML-Datei");
        if (/CrossIndustryInvoice|urn:oasis:names:specification:ubl|<Invoice[\s>]|<CreditNote[\s>]/.test(txt)) { what = tr("E-Rechnung (XML)"); add("xrechnung-anzeigen", tr("Rechnung lesbar anzeigen.")); add("e-rechnung-pruefen", tr("Beträge und Pflichtangaben prüfen.")); }
      } else if (["doc", "docx", "odt", "rtf"].includes(ext)) { what = "Word"; add("docx-to-pdf", tr("In PDF umwandeln.")); }
      else if (["xls", "xlsx", "ods"].includes(ext)) { what = "Excel"; add("excel-to-pdf", tr("In PDF umwandeln.")); }
      else if (["ppt", "pptx", "odp"].includes(ext)) { what = "PowerPoint"; add("ppt-to-pdf", tr("In PDF umwandeln.")); }
      else if (["heic", "heif"].includes(ext)) { what = tr("iPhone-Foto"); add("heic-to-pdf", tr("In PDF umwandeln.")); }
      else if (["jpg", "jpeg", "png", "webp"].includes(ext)) { what = tr("Bild"); add("jpg-to-pdf", tr("In PDF umwandeln.")); add("pdf-in-e-rechnung-umwandeln", tr("Foto einer Rechnung? In eine E-Rechnung umwandeln.")); }
      if (!sug.length) { out.hidden = false; out.innerHTML = `<p>${esc(tr("Für diesen Dateityp haben wir leider noch kein Werkzeug."))}</p>`; return; }
      out.hidden = false;
      out.innerHTML = `<p class="smart__what"><b>${esc(file.name)}</b> · ${esc(what)}</p><ul class="smart__list">${sug.slice(0, 6).map(([sl, why], i) => `<li><button type="button" class="smart__opt${i === 0 ? " is-first" : ""}" data-go="${sl}"><b>${esc(byslug[sl].n)}</b>${why ? `<span>${esc(why)}</span>` : ""}</button></li>`).join("")}</ul>`;
      out.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => goWithFile(byslug[b.dataset.go].u, file, file.name)));
      out.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }
  function loadScript(src) {
    return new Promise((ok, fail) => {
      if (document.querySelector(`script[src="${src}"]`) && window.pdfjsLib) return ok();
      const sc = document.createElement("script");
      sc.src = src; sc.onload = ok; sc.onerror = fail;
      document.head.appendChild(sc);
    });
  }
  function esc(x) { return String(x).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]); }

  // ------------------------------------------------------------------ App (PWA): Service Worker, Installieren
  if ("serviceWorker" in navigator) {
    // sofort registrieren (nicht erst bei „load“ – das kann sich durch langsame Werbe-/Statistik-Skripte stark verzögern)
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
  let installEvent = null;
  const installBtns = document.querySelectorAll("[data-install]");
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // eigenen Knopf zeigen statt der Browser-Leiste
    installEvent = e;
    installBtns.forEach((b) => (b.hidden = false));
  });
  installBtns.forEach((b) => b.addEventListener("click", async () => {
    if (!installEvent) return;
    installEvent.prompt();
    await installEvent.userChoice.catch(() => {});
    installEvent = null;
    installBtns.forEach((x) => (x.hidden = true));
  }));
  window.addEventListener("appinstalled", () => installBtns.forEach((b) => (b.hidden = true)));

  // ------------------------------------------------------------------ Design: Automatisch → Hell → Dunkel
  const themeBtn = document.querySelector("[data-theme-toggle]");
  if (themeBtn) {
    const label = { "": tr("Design: Automatisch"), light: tr("Design: Hell"), dark: tr("Design: Dunkel") };
    const cur = () => document.documentElement.dataset.theme || "";
    themeBtn.textContent = label[cur()];
    themeBtn.addEventListener("click", () => {
      const next = { "": "light", light: "dark", dark: "" }[cur()];
      if (next) document.documentElement.dataset.theme = next; else delete document.documentElement.dataset.theme;
      try { next ? localStorage.setItem("pl_theme", next) : localStorage.removeItem("pl_theme"); } catch (_) {}
      themeBtn.textContent = label[next];
    });
  }

  // ------------------------------------------------------------------ Handy: Hauptknopf unten fixieren
  // Der wichtigste Knopf des aktuellen Schritts (z. B. „Komprimieren“, „Herunterladen“) erscheint als Leiste
  // am unteren Rand, sobald er aus dem Bild gescrollt ist. Ein Tipp darauf löst den echten Knopf aus.
  if (toolSection && window.matchMedia("(max-width: 760px)").matches && "IntersectionObserver" in window) {
    const bar = document.createElement("div");
    bar.className = "mbar";
    bar.hidden = true;
    const proxy = document.createElement("button");
    proxy.type = "button";
    proxy.className = "btn btn--primary btn--lg btn--block";
    bar.appendChild(proxy);
    document.body.appendChild(bar);
    let target = null, inView = true;
    const io = new IntersectionObserver(([en]) => { inView = en.isIntersecting; update(); }, { threshold: 0.6 });
    const update = () => { bar.hidden = !target || inView || target.disabled; document.body.classList.toggle("has-mbar", !bar.hidden); };
    const pick = () => {
      const c = [...toolSection.querySelectorAll(".btn--primary")].find((b) => b.tagName !== "LABEL" && b.offsetParent !== null && !b.closest("[hidden]"));
      if (c !== target) {
        if (target) io.unobserve(target);
        target = c || null;
        inView = true;
        if (target) io.observe(target);
      }
      if (target) proxy.innerHTML = target.innerHTML;
      update();
    };
    proxy.addEventListener("click", () => {
      if (!target) return;
      target.click();
      // Fehlermeldung oder fehlende Angaben stehen meist beim echten Knopf → dorthin scrollen, damit man sie sieht
      setTimeout(() => {
        const msg = [...toolSection.querySelectorAll('[role="alert"], [data-missing], .is-missing')].find((el) => el.offsetParent !== null && el.textContent.trim() !== "" || el.classList.contains("is-missing"));
        if (msg) msg.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 250);
    });
    let queued = false;
    new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; pick(); }); } })
      .observe(toolSection, { subtree: true, childList: true, attributes: true, attributeFilter: ["hidden", "disabled"] });
    pick();
  }
})();

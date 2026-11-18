/* Lebenslauf erstellen: Formular → Live-Vorschau (vom Server gesetzte PDF) → Download.
   Die Daten bleiben im Browser (localStorage) und stecken zusätzlich in der fertigen PDF,
   damit man den Lebenslauf später wieder hochladen und weiterbearbeiten kann. */
(() => {
  "use strict";
  const root = document.querySelector("[data-cv]");
  if (!root) return;
  const $ = (s, el = root) => el.querySelector(s);
  const KEY = "pdflibre-cv-v1";

  const SECTION_NAMES = {
    summary: "Profil",
    experience: "Berufserfahrung",
    education: "Ausbildung",
    projects: "Projekte",
    skills: "Kenntnisse",
    languages: "Sprachen",
    extra: "Weitere Angaben",
  };
  const ENTRY_LABELS = {
    experience: { title: "Position", org: "Unternehmen", place: "Ort", text: "Aufgaben und Erfolge (eine Zeile pro Stichpunkt)" },
    education: { title: "Abschluss / Studiengang", org: "Schule / Hochschule", place: "Ort", text: "Schwerpunkte, Note, Abschlussarbeit (optional)" },
    projects: { title: "Projekt", org: "Link oder Rahmen (z. B. GitHub, Uni-Projekt)", place: "", text: "Was hast du gemacht? (eine Zeile pro Stichpunkt)" },
  };
  const PAIR_LABELS = {
    skills: ["Bereich (z. B. Programmierung)", "Kenntnisse (z. B. Python, SQL, Git)"],
    languages: ["Sprache", "Niveau (z. B. Muttersprache, C1, fließend)"],
  };

  const empty = () => ({
    v: 1,
    template: "modern",
    accent: "#1f4fa3",
    lang: "de",
    photo: null,
    person: { name: "", headline: "", email: "", phone: "", location: "", links: "" },
    sections: [
      { type: "summary", text: "" },
      { type: "experience", items: [{}] },
      { type: "education", items: [{}] },
      { type: "projects", items: [] },
      { type: "skills", items: [{}, {}] },
      { type: "languages", items: [{}, {}] },
      { type: "extra", title: "", text: "" },
    ],
  });

  const SAMPLE = {
    v: 1, template: "modern", accent: "#1f4fa3", lang: "de", photo: null,
    person: { name: "Max Mustermann", headline: "Werkstudent Data Science", email: "max.mustermann@example.de", phone: "+49 170 1234567", location: "Darmstadt", links: "linkedin.com/in/max-mustermann\ngithub.com/maxmustermann" },
    sections: [
      { type: "summary", text: "Informatikstudent im 3. Semester mit Schwerpunkt Machine Learning. Erfahrung mit Python, SQL und Datenvisualisierung aus Praktikum und eigenen Projekten. Suche eine Werkstudentenstelle (15–20 Std./Woche) im Bereich Data Science." },
      { type: "experience", items: [
        { title: "Werkstudent Data Analytics", org: "Muster GmbH", place: "Frankfurt am Main", from: "10/2024", current: true, text: "- Dashboards in Power BI für das Vertriebsteam aufgebaut\n- Monatliche Berichte mit Python (pandas) automatisiert – spart 6 Stunden pro Woche\n- Datenqualität geprüft und SQL-Abfragen auf PostgreSQL geschrieben" },
        { title: "Praktikum IT & Datenanalyse", org: "Beispiel AG", place: "München", from: "03/2023", to: "08/2023", text: "- Kundendaten analysiert und monatliche Reports erstellt\n- Excel-Prozesse in Python-Skripte überführt" },
      ] },
      { type: "education", items: [
        { title: "B.Sc. Informatik", org: "Technische Universität Darmstadt", place: "Darmstadt", from: "10/2023", current: true, text: "Schwerpunkt: Maschinelles Lernen, Datenbanken" },
        { title: "Abitur (Note 1,8)", org: "Goethe-Gymnasium", place: "Frankfurt am Main", from: "2015", to: "2023" },
      ] },
      { type: "projects", items: [{ title: "Chatbot für Kundenanfragen", org: "github.com/maxmustermann/chatbot", text: "- RAG-Chatbot mit OpenAI und pgvector entwickelt\n- Antwortet auf Basis hochgeladener PDF-Dokumente" }] },
      { type: "skills", items: [{ label: "Programmierung", value: "Python, SQL, JavaScript, Java" }, { label: "Data Science", value: "pandas, scikit-learn, Power BI" }, { label: "Tools", value: "Git, Docker, Linux" }] },
      { type: "languages", items: [{ label: "Deutsch", value: "Muttersprache" }, { label: "Englisch", value: "C1 (fließend)" }, { label: "Französisch", value: "B1" }] },
      { type: "extra", title: "Ehrenamt & Interessen", text: "Jugendtrainer im Fußballverein (seit 2021) · Hackathons · Fotografie" },
    ],
  };

  let data = load() || { ...empty(), template: root.dataset.defaultTemplate || "modern" };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* Speicher voll oder gesperrt – dann eben ohne Zwischenspeichern */
    }
  }

  // ---------------------------------------------------------------- Formular aufbauen
  const h = (tag, attrs = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") el.className = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat()) if (kid != null) el.append(kid);
    return el;
  };

  // Datumsangaben vereinheitlichen: „2.2025“, „02-2025“, „Feb. 2025“, „2025-02“ → „02/2025“
  const MONTHS = { jan: 1, feb: 2, mär: 3, mar: 3, maer: 3, apr: 4, mai: 5, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, okt: 10, oct: 10, nov: 11, dez: 12, dec: 12 };
  const DATE_OK = /^((0[1-9]|1[0-2])\/)?(19|20)\d{2}$/;
  function normalizeDate(v) {
    const t = String(v || "").trim();
    if (!t || DATE_OK.test(t)) return t;
    let m;
    const mm = (n) => String(n).padStart(2, "0");
    if ((m = t.match(/^(\d{1,2})\s*[./-]\s*((?:19|20)\d{2})$/)) && +m[1] >= 1 && +m[1] <= 12) return `${mm(m[1])}/${m[2]}`;
    if ((m = t.match(/^((?:19|20)\d{2})\s*[./-]\s*(\d{1,2})$/)) && +m[2] >= 1 && +m[2] <= 12) return `${mm(m[2])}/${m[1]}`;
    if ((m = t.toLowerCase().match(/^([a-zäöü]{3,})\.?\s*((?:19|20)\d{2})$/))) {
      const n = MONTHS[m[1].slice(0, 3).replace("ä", "ä")] || MONTHS[m[1].slice(0, 4)];
      if (n) return `${mm(n)}/${m[2]}`;
    }
    if ((m = t.match(/^(?:seit|ab|since)\s+(.+)$/i))) return normalizeDate(m[1]);
    return t;
  }
  const isNow = (v) => /^(heute|aktuell|jetzt|bis heute|present|today|now|current)$/i.test(String(v || "").trim());

  function field(label, obj, key, { textarea = false, placeholder = "", type = "text", rows = 3, wide = false } = {}) {
    const id = "cv-" + Math.random().toString(36).slice(2, 9);
    const input = textarea ? h("textarea", { id, rows, placeholder }) : h("input", { id, type, placeholder });
    input.value = obj[key] || "";
    input.addEventListener("input", () => {
      obj[key] = input.value;
      changed();
    });
    return h("div", { class: "cv-field" + (wide ? " cv-field--wide" : "") }, h("label", { for: id }, label), input);
  }

  function iconBtn(label, text, onclick, extra = "") {
    return h("button", { type: "button", class: "cv-ibtn " + extra, "aria-label": label, title: label, onclick }, text);
  }

  function move(list, i, dir) {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    renderForm();
    changed();
  }

  // bekannte Datumsformate in allen Stationen vereinheitlichen (z. B. nach Import oder aus älteren Entwürfen)
  function normalizeAll() {
    for (const sec of data.sections || [])
      for (const it of sec.items || []) {
        if (it.from) it.from = normalizeDate(it.from);
        if (isNow(it.to)) { it.to = ""; it.current = true; }
        else if (it.to) it.to = normalizeDate(it.to);
      }
  }

  // ---------------------------------------------------------------- Karten einklappen + Sprungleiste
  // Nur die Karten, an denen man gerade arbeitet, sind offen – so bleibt das Formular kurz und übersichtlich.
  let open = new Set(["person"]);
  try {
    const o = JSON.parse(sessionStorage.getItem(KEY + "-open") || "null");
    if (Array.isArray(o)) open = new Set(o);
  } catch {
    /* egal */
  }
  const keepOpen = () => {
    try {
      sessionStorage.setItem(KEY + "-open", JSON.stringify([...open]));
    } catch {
      /* egal */
    }
  };
  function sectionStatus(key) {
    if (key === "person") return data.person.name && data.person.email ? "✓" : "";
    const sec = data.sections[+key.replace(/^\D+/, "")];
    if (!sec) return "";
    if (sec.hidden) return "ausgeblendet";
    if (sec.type === "summary" || sec.type === "extra") return (sec.text || "").trim() ? "✓" : "";
    const n = (sec.items || []).filter((i) => i.title || i.org || i.label || i.value).length;
    return n ? String(n) : "";
  }
  function decorateCards() {
    const jump = $("[data-jump]");
    jump.textContent = "";
    $("[data-form]").querySelectorAll(".cv-card").forEach((c) => {
      const key = c.dataset.key;
      const head = c.querySelector(".cv-card__head");
      const title = key === "person" ? "Persönliche Daten" : head.querySelector(".cv-title").value || head.querySelector(".cv-title").placeholder;
      const st = sectionStatus(key);
      const isOpen = open.has(key);
      c.classList.toggle("is-collapsed", !isOpen);
      const tog = h("button", { type: "button", class: "cv-card__toggle", "aria-expanded": String(isOpen), "aria-label": (isOpen ? "Zuklappen: " : "Aufklappen: ") + title, onclick: () => toggleCard(key) }, isOpen ? "▾" : "▸");
      head.prepend(tog);
      const h3 = head.querySelector("h3");
      if (h3) h3.addEventListener("click", () => toggleCard(key));
      if (st) head.append(h("span", { class: "cv-card__status" + (st === "✓" ? " is-done" : "") }, st));
      jump.append(h("button", { type: "button", class: "cv-chip" + (st ? " is-done" : ""), onclick: () => openCard(key) }, title, st ? h("small", {}, st) : null));
    });
  }
  function toggleCard(key) {
    open.has(key) ? open.delete(key) : open.add(key);
    keepOpen();
    renderForm();
  }
  function openCard(key, focusSel) {
    setStep("content");
    open.add(key);
    keepOpen();
    renderForm();
    const c = $(`[data-key="${key}"]`);
    if (c) {
      c.scrollIntoView({ behavior: "smooth", block: "start" });
      const f = focusSel ? c.querySelector(focusSel) : c.querySelector("input:not([type=checkbox]):not([type=file]), textarea");
      if (f) setTimeout(() => f.focus({ preventScroll: true }), 350);
    }
  }

  function renderForm() {
    normalizeAll();
    const form = $("[data-form]");
    form.textContent = "";
    const p = data.person;

    // Persönliche Daten
    const photoBox = h("div", { class: "cv-photo" });
    const drawPhoto = () => {
      photoBox.textContent = "";
      if (data.photo) {
        photoBox.append(
          h("img", { src: data.photo, alt: "Bewerbungsfoto" }),
          h("button", { type: "button", class: "btn btn--link", onclick: () => { data.photo = null; drawPhoto(); changed(); } }, "Foto entfernen")
        );
      } else {
        const inp = h("input", { type: "file", accept: "image/jpeg,image/png,image/webp", class: "visually-hidden" });
        inp.addEventListener("change", () => inp.files[0] && readPhoto(inp.files[0]).then((url) => { data.photo = url; drawPhoto(); changed(); }));
        photoBox.append(h("label", { class: "btn btn--ghost btn--sm" }, "Foto hinzufügen (optional)", inp));
      }
    };
    drawPhoto();
    form.append(
      h("section", { class: "cv-card", "data-key": "person" },
        h("div", { class: "cv-card__head" }, h("h3", {}, "Persönliche Daten")),
        h("div", { class: "cv-grid" },
          field("Vor- und Nachname", p, "name", { placeholder: "Max Mustermann" }),
          field("Wunschposition / Titel", p, "headline", { placeholder: "z. B. Werkstudent Data Science" }),
          field("E-Mail", p, "email", { type: "email", placeholder: "vorname.nachname@…" }),
          field("Telefon", p, "phone", { type: "tel", placeholder: "+49 …" }),
          field("Wohnort", p, "location", { placeholder: "z. B. Darmstadt" }),
          field("Links (eine pro Zeile)", p, "links", { textarea: true, rows: 2, placeholder: "linkedin.com/in/…\ngithub.com/…" })
        ),
        photoBox
      )
    );

    // Abschnitte
    data.sections.forEach((sec, si) => {
      const name = SECTION_NAMES[sec.type];
      const head = h("div", { class: "cv-card__head" },
        h("input", { class: "cv-title", value: sec.title || "", placeholder: name, "aria-label": "Überschrift des Abschnitts", oninput: (e) => { sec.title = e.target.value; changed(); } }),
        iconBtn("Abschnitt nach oben", "↑", () => move(data.sections, si, -1)),
        iconBtn("Abschnitt nach unten", "↓", () => move(data.sections, si, 1)),
        iconBtn(sec.hidden ? "Abschnitt einblenden" : "Abschnitt ausblenden", sec.hidden ? "Einblenden" : "Ausblenden", () => { sec.hidden = !sec.hidden; renderForm(); changed(); }, "cv-ibtn--text")
      );
      const card = h("section", { class: "cv-card" + (sec.hidden ? " is-hidden" : ""), "data-key": sec.type + si }, head);
      if (sec.type === "summary" || sec.type === "extra") {
        card.append(field(sec.type === "summary" ? "2–4 Sätze: Wer bist du, was kannst du, was suchst du?" : "Ehrenamt, Interessen, Führerschein …", sec, "text", { textarea: true, rows: 4, wide: true }));
      } else if (sec.type === "skills" || sec.type === "languages") {
        const [l1, l2] = PAIR_LABELS[sec.type];
        sec.items.forEach((it, ii) => {
          card.append(h("div", { class: "cv-pair" }, field(l1, it, "label"), field(l2, it, "value"), iconBtn("Zeile löschen", "×", () => { sec.items.splice(ii, 1); renderForm(); changed(); }, "cv-ibtn--del")));
        });
        card.append(h("button", { type: "button", class: "btn btn--link", onclick: () => { sec.items.push({}); renderForm(); } }, "+ Zeile hinzufügen"));
      } else {
        const L = ENTRY_LABELS[sec.type];
        sec.items.forEach((it, ii) => {
          const current = h("input", { type: "checkbox" });
          current.checked = !!it.current;
          current.addEventListener("change", () => { it.current = current.checked; to.querySelector("input").disabled = current.checked; changed(); });
          const to = field("Bis", it, "to", { placeholder: "MM/JJJJ" });
          const from = field("Von", it, "from", { placeholder: "MM/JJJJ" });
          // beim Verlassen des Feldes: Datum vereinheitlichen, „heute“ → Häkchen „bis heute“
          for (const [box, key] of [[from, "from"], [to, "to"]]) {
            const inp = box.querySelector("input");
            inp.addEventListener("change", () => {
              if (key === "to" && isNow(inp.value)) {
                it.to = "";
                it.current = true;
                current.checked = true;
                inp.value = "";
                inp.disabled = true;
              } else {
                it[key] = normalizeDate(inp.value);
                inp.value = it[key];
              }
              inp.classList.toggle("is-bad", !!it[key] && !DATE_OK.test(it[key]));
              changed();
            });
            inp.classList.toggle("is-bad", !!it[key] && !DATE_OK.test(it[key]));
          }
          to.querySelector("input").disabled = !!it.current;
          card.append(
            h("div", { class: "cv-entry" },
              h("div", { class: "cv-entry__tools" },
                iconBtn("Eintrag nach oben", "↑", () => move(sec.items, ii, -1)),
                iconBtn("Eintrag nach unten", "↓", () => move(sec.items, ii, 1)),
                iconBtn("Eintrag löschen", "×", () => { sec.items.splice(ii, 1); renderForm(); changed(); }, "cv-ibtn--del")
              ),
              h("div", { class: "cv-grid" },
                field(L.title, it, "title"),
                field(L.org, it, "org"),
                L.place ? field(L.place, it, "place") : null,
                h("div", { class: "cv-dates" }, from, to, h("label", { class: "cv-check" }, current, " bis heute")),
                field(L.text, it, "text", { textarea: true, rows: 3, wide: true, placeholder: sec.type === "education" ? "" : "- Was hast du erreicht? Mit Zahlen, wenn möglich" })
              )
            )
          );
        });
        card.append(h("button", { type: "button", class: "btn btn--link", onclick: () => { sec.items.push({}); renderForm(); } }, "+ Eintrag hinzufügen"));
      }
      form.append(card);
    });

    decorateCards();

    // Steuerung
    root.querySelectorAll("[data-tpl]").forEach((b) => b.classList.toggle("is-on", b.dataset.tpl === data.template));
    root.querySelectorAll("[data-swatch]").forEach((b) => b.classList.toggle("is-on", b.dataset.swatch.toLowerCase() === (data.accent || "").toLowerCase()));
    $("[data-accent]").value = data.accent || "#1f4fa3";
    $("[data-lang]").value = data.lang || "de";
  }

  function readPhoto(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, 600 / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * s);
        c.height = Math.round(img.height * s);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(img.src);
        resolve(c.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  // ---------------------------------------------------------------- ATS-Check (im Browser, ohne KI)
  function atsCheck(pages) {
    const p = data.person;
    const exp = data.sections.find((s) => s.type === "experience");
    const edu = data.sections.find((s) => s.type === "education");
    const sum = data.sections.find((s) => s.type === "summary");
    const filled = (s) => s && !s.hidden && (s.items || []).some((i) => i.title || i.org);
    const entries = data.sections
      .filter((s) => !s.hidden && ["experience", "education", "projects"].includes(s.type))
      .flatMap((s) => s.items || [])
      .filter((i) => i.title || i.org);
    const bad = entries.find((i) => (i.from && !DATE_OK.test(normalizeDate(i.from))) || (!i.current && i.to && !DATE_OK.test(normalizeDate(i.to))));
    const badDate = !!bad;
    const badLabel = bad ? `Datum bei „${bad.title || bad.org}“ prüfen: „${!DATE_OK.test(normalizeDate(bad.from)) && bad.from ? bad.from : bad.to}“ → bitte MM/JJJJ (z. B. 10/2025) oder JJJJ` : "";
    const bullets = (exp?.items || []).filter((i) => (i.text || "").trim()).length;
    const keyOf = (type) => {
      const i = data.sections.findIndex((x) => x.type === type);
      return i >= 0 ? type + i : "person";
    };
    const badSec = bad ? data.sections.findIndex((x) => (x.items || []).includes(bad)) : -1;
    const checks = [
      [!!p.name.trim(), "Name angegeben", () => openCard("person")],
      [/@/.test(p.email) && !!p.phone.trim(), "E-Mail und Telefon als Text im Lebenslauf", () => openCard("person", 'input[type="email"]')],
      [!!(sum && !sum.hidden && (sum.text || "").trim().length >= 80), "Kurzprofil mit 2–4 Sätzen", () => openCard(keyOf("summary"))],
      [filled(exp) || filled(edu), "Berufserfahrung oder Ausbildung eingetragen", () => openCard(keyOf("experience"))],
      [!badDate, badDate ? badLabel : "Einheitliches Datumsformat (MM/JJJJ oder JJJJ)", () => openCard(badSec >= 0 ? data.sections[badSec].type + badSec : keyOf("experience"), "input.is-bad")],
      [!filled(exp) || bullets >= Math.min(2, (exp.items || []).length), "Aufgaben und Erfolge bei den Stationen beschrieben", () => openCard(keyOf("experience"), "textarea")],
      [pages > 0 && pages <= 2, "Höchstens zwei Seiten – tipp: Vorlage „Kompakt“ oder kürzere Stichpunkte", () => setStep("design")],
    ];
    const list = $("[data-ats]");
    list.textContent = "";
    for (const [ok, label, go] of checks)
      list.append(ok ? h("li", { class: "ok" }, label) : h("li", { class: "todo" }, h("button", { type: "button", onclick: go }, label)));
    const score = checks.filter((c) => c[0]).length;
    $("[data-ats-score]").textContent = `${score} von ${checks.length}`;
    const badge = $("[data-ats-badge]");
    badge.textContent = `${score}/${checks.length}`;
    badge.classList.toggle("is-ok", score === checks.length);
  }

  // ---------------------------------------------------------------- Vorschau
  let timer, seq = 0;
  function changed() {
    save();
    clearTimeout(timer);
    timer = setTimeout(preview, 600);
  }

  async function preview(retry = true) {
    const my = ++seq;
    const box = $("[data-preview]");
    box.classList.add("is-busy");
    try {
      const res = await fetch("/api/cv/preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Vorschau fehlgeschlagen.");
      if (my !== seq) return; // eine neuere Anfrage ist schon unterwegs
      box.textContent = "";
      j.pages.forEach((src, i) => box.append(h("img", { src, alt: `Vorschau Seite ${i + 1}`, class: "cv-page" })));
      $("[data-info]").textContent = `${j.pages.length} ${j.pages.length === 1 ? "Seite" : "Seiten"} · ${Math.max(1, Math.round(j.size / 1024))} KB`;
      atsCheck(j.pages.length);
      showError("");
    } catch (e) {
      if (my !== seq) return;
      if (retry) return void setTimeout(() => preview(false), 1200); // kurzer Aussetzer: einmal still wiederholen
      showError(e.message);
    } finally {
      if (my === seq) box.classList.remove("is-busy");
    }
  }

  const showError = (msg) => {
    const el = $("[data-error]");
    el.textContent = msg;
    el.hidden = !msg;
  };

  // ---------------------------------------------------------------- Bedienelemente
  root.querySelectorAll("[data-tpl]").forEach((b) =>
    b.addEventListener("click", () => {
      data.template = b.dataset.tpl;
      renderForm();
      changed();
    })
  );
  $("[data-accent]").addEventListener("input", (e) => { data.accent = e.target.value; changed(); });
  $("[data-lang]").addEventListener("change", (e) => { data.lang = e.target.value; changed(); });
  root.querySelectorAll("[data-sample]").forEach((b) =>
    b.addEventListener("click", () => {
      if (hasContent() && !confirm("Dein aktueller Lebenslauf wird durch das Beispiel ersetzt. Fortfahren?")) return;
      data = JSON.parse(JSON.stringify({ ...SAMPLE, template: data.template, accent: data.accent }));
      open = new Set(["person", "summary0", "experience1"]);
      keepOpen();
      startApp();
      renderForm();
      changed();
    })
  );
  $("[data-new]").addEventListener("click", () => {
    if (hasContent() && !confirm("Alle Eingaben löschen und neu beginnen?")) return;
    data = empty();
    open = new Set(["person"]);
    keepOpen();
    renderForm();
    changed();
    showWelcome(true);
  });
  const hasContent = () => !!(data.person.name || data.sections.some((s) => (s.text || "").trim() || (s.items || []).some((i) => i.title || i.label)));

  // Lebenslauf-PDF von PDF Libre wieder öffnen
  root.querySelectorAll("[data-import]").forEach((imp) =>
    imp.addEventListener("change", () => {
      const f = imp.files[0];
      imp.value = "";
      if (f) importFile(f);
    })
  );
  async function importFile(f) {
    showError("");
    if (/\.json$/i.test(f.name)) {
      // Entwurfsdatei: direkt im Browser lesen, nichts wird hochgeladen
      try {
        const j = JSON.parse(await f.text());
        if (!j || !j.person || !Array.isArray(j.sections)) throw new Error();
        data = { ...empty(), ...j };
        startApp();
        renderForm();
        changed();
      } catch {
        showError("Diese Datei ist kein Lebenslauf-Entwurf von PDF Libre.");
      }
      return;
    }
    startApp();
    if (hasContent() && !confirm("Dein aktueller Lebenslauf im Formular wird durch den importierten ersetzt. Fortfahren?")) return;
    const fd = new FormData();
    fd.append("file", f);
    notice("Dein Lebenslauf wird gelesen … das dauert etwa 10–30 Sekunden.", "busy");
    try {
      const res = await fetch("/api/ai/cv-import", { method: "POST", body: fd });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Die Datei konnte nicht gelesen werden.");
      // Design, Farbe und Foto bleiben wie eingestellt – nur die Inhalte kommen aus der Datei
      data = { ...empty(), ...j.data, template: data.template, accent: data.accent, photo: j.data.photo || data.photo };
      open = new Set(["person", "summary0", "experience1"]);
      keepOpen();
      renderForm();
      changed();
      notice(j.source === "ai" ? "Import fertig. Bitte prüfe alle Angaben – die KI überträgt nur, was im Lebenslauf steht, kann sich aber beim Zuordnen irren." : "Entwurf geöffnet.", "ok");
    } catch (e) {
      notice("", "");
      showError(e.message);
    }
  }

  root.querySelectorAll("[data-download]").forEach((b) => b.addEventListener("click", download));
  async function download(ev) {
    const btn = ev.currentTarget;
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Wird erstellt …";
    try {
      const res = await fetch("/api/cv/pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data }) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Die PDF konnte nicht erstellt werden.");
      const n = (data.person.name || "").trim().replace(/\s+/g, "_").replace(/[^\p{L}\p{N}_-]/gu, "");
      const a = h("a", { href: URL.createObjectURL(await res.blob()), download: n ? `Lebenslauf_${n}.pdf` : "Lebenslauf.pdf" });
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 60000);
    } catch (e) {
      showError(e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  }

  // ---------------------------------------------------------------- Hinweise
  function notice(msg, kind) {
    const el = $("[data-notice]");
    el.textContent = msg;
    el.className = "cv-notice" + (kind ? " cv-notice--" + kind : "");
    el.hidden = !msg;
  }

  // ---------------------------------------------------------------- Rechtschreibprüfung (KI)
  // Alle Fließtexte mit einer ID sammeln, korrigieren lassen, Änderungen einzeln bestätigen
  function textFields() {
    const out = [];
    const add = (id, obj, key) => (obj[key] || "").trim() && out.push({ id, obj, key, text: obj[key] });
    add("p.headline", data.person, "headline");
    data.sections.forEach((sec, si) => {
      if (sec.hidden) return;
      if (sec.type === "summary" || sec.type === "extra") add(`s${si}.text`, sec, "text");
      if (["experience", "education", "projects"].includes(sec.type))
        (sec.items || []).forEach((it, ii) => {
          add(`s${si}.i${ii}.title`, it, "title");
          add(`s${si}.i${ii}.text`, it, "text");
        });
    });
    return out;
  }

  function diffHtml(a, b) {
    // Wort-Diff (LCS): entfernte Wörter rot, neue grün
    const A = a.split(/(\s+)/), B = b.split(/(\s+)/);
    const n = A.length, m = B.length;
    const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>");
    let i = 0, j = 0, out = "";
    while (i < n && j < m) {
      if (A[i] === B[j]) { out += esc(A[i]); i++; j++; }
      else if (L[i + 1][j] >= L[i][j + 1]) out += `<del>${esc(A[i++])}</del>`;
      else out += `<ins>${esc(B[j++])}</ins>`;
    }
    while (i < n) out += `<del>${esc(A[i++])}</del>`;
    while (j < m) out += `<ins>${esc(B[j++])}</ins>`;
    return out;
  }

  // Fehler von der KI-API; bei Pro-Funktionen (401/402) mit Link zu Anmeldung bzw. Preisen
  async function aiPost(url, body) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await res.json().catch(() => ({}));
    if (res.ok) return j;
    const err = new Error(j.error || "Die KI-Anfrage ist fehlgeschlagen.");
    if (res.status === 401) err.link = { href: `/anmelden.html?next=${encodeURIComponent(location.pathname)}`, label: "Anmelden" };
    if (res.status === 402) err.link = { href: "/preise.html", label: "Tarife ansehen" };
    throw err;
  }
  function fail(e, el = $("[data-error]")) {
    el.textContent = e.message + " ";
    if (e.link) el.append(h("a", { href: e.link.href }, e.link.label));
    el.hidden = false;
  }
  // gesamter sichtbarer Lebenslauf als Text (für Abgleich, Zahlenschutz und Anschreiben)
  function cvText() {
    const p = data.person;
    const lines = [p.name, p.headline, p.location];
    for (const sec of data.sections) {
      if (sec.hidden) continue;
      lines.push(`## ${sec.title || SECTION_NAMES[sec.type]}`);
      if (sec.text) lines.push(sec.text);
      for (const it of sec.items || []) lines.push([it.title, it.org, it.place, [it.from, it.current ? "heute" : it.to].filter(Boolean).join(" – "), it.label, it.value, it.text].filter(Boolean).join(" | "));
    }
    return lines.filter(Boolean).join("\n");
  }

  // Liste von Änderungen mit Häkchen anzeigen; gibt die angehakten zurück
  function changeList(container, changes) {
    container.textContent = "";
    changes.forEach((c, k) => {
      const box = h("div", { class: "cv-change__diff" });
      box.innerHTML = diffHtml(c.before, c.after);
      container.append(h("label", { class: "cv-change" }, h("input", { type: "checkbox", checked: true, "data-k": k }), box));
    });
    return () => [...container.querySelectorAll("input[data-k]")].filter((cb) => cb.checked).map((cb) => changes[+cb.dataset.k]);
  }
  function applyChanges(fields, chosen) {
    const byId = new Map(fields.map((f) => [f.id, f]));
    let n = 0;
    for (const c of chosen) {
      const f = byId.get(c.id);
      if (f) { f.obj[f.key] = c.after; n++; }
    }
    if (n) { renderForm(); changed(); notice(`${n} ${n === 1 ? "Änderung" : "Änderungen"} übernommen.`, "ok"); }
  }

  // Rechtschreibung prüfen / Formulierungen verbessern: gleicher Ablauf, anderer Endpunkt
  async function review(btn, url, title, emptyMsg) {
    const fields = textFields();
    if (!fields.length) return showError("Es gibt noch keinen Text zum Prüfen.");
    const label = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = "Einen Moment …";
    showError("");
    try {
      const j = await aiPost(url, { items: fields.map(({ id, text }) => ({ id, text })), cvText: cvText() });
      if (!j.changes.length) return notice(emptyMsg, "ok");
      $("[data-review-title]").textContent = title;
      const chosen = changeList($("[data-changes]"), j.changes);
      const dlg = $("[data-review]");
      dlg.onclose = () => dlg.returnValue === "ok" && applyChanges(fields, chosen());
      dlg.showModal();
    } catch (e) {
      fail(e);
    } finally {
      btn.disabled = false;
      btn.innerHTML = label;
    }
  }
  $("[data-proofread]").addEventListener("click", (ev) => review(ev.currentTarget, "/api/ai/cv-proofread", "Vorschläge der Rechtschreibprüfung", "Keine Fehler gefunden – sehr gut!"));
  $("[data-improve]").addEventListener("click", (ev) => review(ev.currentTarget, "/api/ai/cv-improve", "Bessere Formulierungen", "Deine Formulierungen sind schon gut – keine Vorschläge."));

  // ---------------------------------------------------------------- An Stellenanzeige anpassen
  // Die KI liefert die Anforderungen der Anzeige; ob sie im Lebenslauf vorkommen, rechnet der Browser selbst –
  // so aktualisiert sich die Trefferquote sofort, wenn du Änderungen übernimmst oder selbst ergänzt.
  let match = null;
  const matchDlg = $("[data-match]");
  const adBox = $("[data-ad]");
  function scoreOf(keywords) {
    const low = cvText().toLowerCase();
    let got = 0, all = 0;
    const list = keywords.map((k) => {
      const found = [k.term, ...(k.aliases || [])].some((t) => low.includes(t.toLowerCase()));
      const w = k.must ? 2 : 1;
      all += w;
      if (found) got += w;
      return { ...k, found };
    });
    return { list, score: all ? Math.round((100 * got) / all) : 0 };
  }
  function drawMatch() {
    if (!match) return;
    const { list, score } = scoreOf(match.keywords);
    $("[data-score]").textContent = `${score} % Übereinstimmung`;
    $("[data-score-bar]").style.width = score + "%";
    $("[data-score-bar]").style.background = score >= 70 ? "#16a34a" : score >= 45 ? "#d97706" : "#dc2626";
    $("[data-role]").textContent = [match.role, match.company].filter(Boolean).join(" · ");
    const ul = $("[data-kws]");
    ul.textContent = "";
    for (const k of list) {
      const li = h("li", { class: "cv-kw" + (k.found ? " is-found" : "") + (k.must ? " is-must" : ""), title: k.must ? "Gefordert" : "Wünschenswert" }, (k.found ? "✓ " : "") + k.term);
      if (!k.found)
        li.append(h("button", { type: "button", class: "cv-kw__add", title: "Zu den Kenntnissen hinzufügen", onclick: () => addSkill(k.term) }, "+"));
      ul.append(li);
    }
  }
  function addSkill(term) {
    if (!confirm(`„${term}“ zu deinen Kenntnissen hinzufügen?\n\nBitte nur, wenn du das wirklich kannst – im Vorstellungsgespräch wird danach gefragt.`)) return;
    let sec = data.sections.find((x) => x.type === "skills");
    if (!sec) data.sections.push((sec = { type: "skills", items: [] }));
    let row = sec.items.find((i) => /^(weitere|sonstige|other)/i.test(i.label || "")) || sec.items.find((i) => !i.label && !i.value);
    if (!row) sec.items.push((row = { label: data.lang === "en" ? "Other" : "Weitere", value: "" }));
    if (!row.label && !row.value) row.label = data.lang === "en" ? "Other" : "Weitere";
    row.value = [row.value, term].filter(Boolean).join(", ");
    renderForm();
    changed();
    drawMatch();
  }
  $("[data-open-match]").addEventListener("click", () => {
    adBox.value = data.jobAd || "";
    showError("");
    matchDlg.showModal();
  });
  adBox.addEventListener("input", () => { data.jobAd = adBox.value; save(); });
  let pickMatch = () => [];
  let matchFields = [];
  $("[data-run-match]").addEventListener("click", async (ev) => {
    const btn = ev.currentTarget;
    const status = $("[data-match-status]");
    btn.disabled = true;
    status.textContent = "Die Anzeige wird analysiert … (ca. 20 Sekunden)";
    try {
      matchFields = textFields();
      const j = await aiPost("/api/ai/cv-match", { ad: adBox.value, items: matchFields.map(({ id, text }) => ({ id, text })), cvText: cvText() });
      match = j;
      $("[data-match-result]").hidden = false;
      drawMatch();
      const tips = $("[data-tips]");
      tips.textContent = "";
      j.tips.forEach((t) => tips.append(h("li", {}, t)));
      $("[data-changes-title]").textContent = j.changes.length ? "Vorgeschlagene Änderungen" : "Keine Textänderungen nötig";
      pickMatch = changeList($("[data-match-changes]"), j.changes);
      $("[data-apply-match]").hidden = !j.changes.length;
      status.textContent = "";
    } catch (e) {
      status.textContent = "";
      fail(e, status);
      status.hidden = false;
    } finally {
      btn.disabled = false;
    }
  });
  matchDlg.addEventListener("close", () => {
    if (matchDlg.returnValue === "ok") applyChanges(matchFields, pickMatch());
    matchDlg.returnValue = "";
  });

  // ---------------------------------------------------------------- Anschreiben
  const letterDlg = $("[data-letter]");
  const L = () => (data.letter = data.letter || {});
  const lf = (k) => letterDlg.querySelector(`[data-l="${k}"]`);
  function letterData() {
    const l = L();
    return {
      template: data.template,
      accent: data.accent,
      person: data.person,
      letter: { recipient: l.recipient, date: l.date, subject: l.subject, salutation: l.salutation, closing: l.closing, paragraphs: String(l.body || "").split(/\n\s*\n/).map((x) => x.replace(/\s*\n\s*/g, " ").trim()).filter(Boolean) },
    };
  }
  let lTimer;
  async function letterPreview() {
    try {
      const res = await fetch("/api/cv/letter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: letterData(), preview: true }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);
      const box = $("[data-letter-preview]");
      box.textContent = "";
      j.pages.forEach((src) => box.append(h("img", { src, alt: "Vorschau Anschreiben", class: "cv-page" })));
    } catch {
      /* Vorschau ist nur Komfort */
    }
  }
  letterDlg.querySelectorAll("[data-l]").forEach((el) =>
    el.addEventListener("input", () => {
      L()[el.dataset.l] = el.value;
      save();
      clearTimeout(lTimer);
      lTimer = setTimeout(letterPreview, 600);
    })
  );
  root.querySelectorAll("[data-open-letter]").forEach((b) => b.addEventListener("click", openLetter));
  function openLetter() {
    const l = L();
    if (!l.date) l.date = `${data.person.location || ""}${data.person.location ? ", " : ""}${new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}`;
    if (!l.closing) l.closing = data.lang === "en" ? "Kind regards" : "Mit freundlichen Grüßen";
    for (const k of ["recipient", "notes", "date", "subject", "salutation", "body", "closing"]) lf(k).value = l[k] || "";
    $("[data-letter-error]").hidden = true;
    letterDlg.showModal();
    letterPreview();
  }
  $("[data-run-letter]").addEventListener("click", async (ev) => {
    const btn = ev.currentTarget;
    const status = $("[data-letter-status]");
    if (!(data.jobAd || "").trim()) {
      status.textContent = "Füge zuerst unter „An Stellenanzeige anpassen“ die Stellenanzeige ein.";
      return;
    }
    if ((lf("body").value || "").trim() && !confirm("Der bisherige Text des Anschreibens wird ersetzt. Fortfahren?")) return;
    btn.disabled = true;
    status.textContent = "Das Anschreiben wird geschrieben … (ca. 20 Sekunden)";
    try {
      const rec = (L().recipient || "").split("\n").map((x) => x.trim()).filter(Boolean);
      const contact = rec.find((x) => /^(frau|herr|mr|ms|mrs)\b/i.test(x)) || "";
      const j = await aiPost("/api/ai/cv-letter", { ad: data.jobAd, cvText: cvText(), notes: L().notes || "", contact });
      Object.assign(L(), { subject: j.subject, salutation: j.salutation, body: j.paragraphs.join("\n\n"), closing: j.closing });
      for (const k of ["subject", "salutation", "body", "closing"]) lf(k).value = L()[k] || "";
      save();
      letterPreview();
      status.textContent = "Entwurf fertig – lies ihn in Ruhe durch und passe ihn an dich an.";
    } catch (e) {
      status.textContent = "";
      fail(e, status);
    } finally {
      btn.disabled = false;
    }
  });
  $("[data-letter-pdf]").addEventListener("click", async () => {
    const err = $("[data-letter-error]");
    err.hidden = true;
    try {
      const res = await fetch("/api/cv/letter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: letterData() }) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Die PDF konnte nicht erstellt werden.");
      const n = (data.person.name || "").trim().replace(/\s+/g, "_").replace(/[^\p{L}\p{N}_-]/gu, "");
      const a = h("a", { href: URL.createObjectURL(await res.blob()), download: n ? `Anschreiben_${n}.pdf` : "Anschreiben.pdf" });
      document.body.append(a);
      a.click();
      a.remove();
    } catch (e) {
      fail(e, err);
    }
  });

  // ---------------------------------------------------------------- Übersetzen
  function translateLabel() {
    $("[data-translate] b").firstChild.textContent = data.lang === "en" ? "Auf Deutsch übersetzen" : "Auf Englisch übersetzen";
  }
  $("[data-translate]").addEventListener("click", async (ev) => {
    const target = data.lang === "en" ? "de" : "en";
    const fields = textFields();
    // auch Kenntnisse/Sprachen und Überschriften übersetzen
    data.sections.forEach((sec, si) => {
      if (sec.hidden) return;
      if (sec.title) fields.push({ id: `s${si}.title`, obj: sec, key: "title", text: sec.title });
      if (sec.type === "skills" || sec.type === "languages")
        (sec.items || []).forEach((it, ii) => {
          if (it.label) fields.push({ id: `s${si}.i${ii}.label`, obj: it, key: "label", text: it.label });
          if (it.value) fields.push({ id: `s${si}.i${ii}.value`, obj: it, key: "value", text: it.value });
        });
      if (["experience", "education", "projects"].includes(sec.type)) (sec.items || []).forEach((it, ii) => it.place && fields.push({ id: `s${si}.i${ii}.place`, obj: it, key: "place", text: it.place }));
    });
    if (!fields.length) return showError("Es gibt noch keinen Text zum Übersetzen.");
    if (!confirm(`Lebenslauf ${target === "en" ? "ins Englische" : "ins Deutsche"} übersetzen?\n\nTipp: Speichere vorher mit „Entwurf speichern“ die aktuelle Fassung, damit du beide Versionen hast.`)) return;
    const btn = ev.currentTarget;
    btn.disabled = true;
    notice("Der Lebenslauf wird übersetzt … (ca. 20–40 Sekunden)", "busy");
    try {
      const j = await aiPost("/api/ai/cv-translate", { items: fields.map(({ id, text }) => ({ id, text })), lang: target });
      const byId = new Map(fields.map((f) => [f.id, f]));
      for (const it of j.items) {
        const f = byId.get(it.id);
        if (f && it.text.trim()) f.obj[f.key] = it.text.trim();
      }
      data.lang = target;
      renderForm();
      changed();
      translateLabel();
      notice("Übersetzt. Bitte lies den Lebenslauf einmal komplett durch.", "ok");
    } catch (e) {
      notice("", "");
      fail(e);
    } finally {
      btn.disabled = false;
    }
  });
  $("[data-lang]").addEventListener("change", translateLabel);
  translateLabel();

  // Entwurf als eigene Datei speichern – getrennt vom Lebenslauf, der an Firmen geht
  $("[data-save-draft]").addEventListener("click", () => {
    const n = (data.person.name || "").trim().replace(/\s+/g, "_").replace(/[^\p{L}\p{N}_-]/gu, "");
    const a = h("a", { href: URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: "application/json" })), download: `Lebenslauf-Entwurf${n ? "_" + n : ""}.json` });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 60000);
  });

  // ---------------------------------------------------------------- Schritte
  const steps = ["content", "design", "optimize", "download"];
  function setStep(name) {
    if (!steps.includes(name)) name = "content";
    root.querySelectorAll("[data-step]").forEach((b) => {
      b.classList.toggle("is-on", b.dataset.step === name);
      b.setAttribute("aria-current", b.dataset.step === name ? "step" : "false");
    });
    root.querySelectorAll("[data-pane]").forEach((p) => (p.hidden = p.dataset.pane !== name));
    try {
      sessionStorage.setItem(KEY + "-step", name);
    } catch {
      /* egal */
    }
    if (name === "design") thumbs();
  }
  const toApp = () => {
    const top = $("[data-app]").getBoundingClientRect().top;
    if (top < 0 || top > innerHeight * 0.6) $("[data-app]").scrollIntoView({ behavior: "smooth", block: "start" });
  };
  root.querySelectorAll("[data-step]").forEach((b) =>
    b.addEventListener("click", () => {
      setStep(b.dataset.step);
      toApp();
    })
  );
  root.querySelectorAll("[data-goto]").forEach((b) =>
    b.addEventListener("click", () => {
      setStep(b.dataset.goto);
      $("[data-app]").scrollIntoView({ behavior: "smooth", block: "start" });
    })
  );

  // Vorlagen als echte Miniaturen deines Lebenslaufs (nur neu, wenn sich der Inhalt geändert hat)
  let thumbKey = "";
  async function thumbs() {
    const { template, ...rest } = data;
    const key = JSON.stringify(rest);
    if (key === thumbKey) return;
    thumbKey = key;
    for (const tpl of ["modern", "klassisch", "akademisch", "kompakt"]) {
      const box = $(`[data-thumb="${tpl}"]`);
      box.classList.add("is-busy");
      fetch("/api/cv/preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: { ...data, template: tpl } }) })
        .then((r) => r.json())
        .then((j) => {
          if (key !== thumbKey || !j.pages) return;
          box.textContent = "";
          box.append(h("img", { src: j.pages[0], alt: "" }));
        })
        .catch(() => {})
        .finally(() => box.classList.remove("is-busy"));
    }
  }
  root.querySelectorAll("[data-swatch]").forEach((b) =>
    b.addEventListener("click", () => {
      data.accent = b.dataset.swatch;
      $("[data-accent]").value = data.accent;
      renderForm();
      changed();
    })
  );

  // ---------------------------------------------------------------- Start: Willkommen oder direkt weiter
  function showWelcome(on) {
    $("[data-welcome]").hidden = !on;
    $("[data-app]").hidden = on;
  }
  let pendingStart = root.dataset.start; // „letter“ oder „match“ auf den Seiten Anschreiben / Stellenanzeige
  function startApp() {
    showWelcome(false);
    if (pendingStart) {
      const what = pendingStart;
      pendingStart = "";
      setStep("optimize");
      setTimeout(() => (what === "letter" ? openLetter() : $("[data-open-match]").click()), 300);
    }
  }
  $("[data-empty]").addEventListener("click", () => {
    open = new Set(["person"]);
    keepOpen();
    startApp();
    renderForm();
  });

  // Handy: zwischen Formular und Vorschau umschalten
  $("[data-toggle-preview]").addEventListener("click", (ev) => {
    const on = root.classList.toggle("show-preview");
    ev.currentTarget.textContent = on ? "Bearbeiten" : "Vorschau";
    if (on) $(".cv-side").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  renderForm();
  let savedStep = "content";
  try {
    savedStep = sessionStorage.getItem(KEY + "-step") || "content";
  } catch {
    /* egal */
  }
  setStep(savedStep);
  if (hasContent()) startApp();
  else showWelcome(true);
  preview();
})();

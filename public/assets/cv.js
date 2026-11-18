/* Lebenslauf erstellen: Formular → Live-Vorschau (vom Server gesetzte PDF) → Download.
   Die Daten bleiben im Browser (localStorage) und stecken zusätzlich in der fertigen PDF,
   damit man den Lebenslauf später wieder hochladen und weiterbearbeiten kann. */
(() => {
  "use strict";
  const root = document.querySelector("[data-cv]");
  if (!root) return;
  const $ = (s, el = root) => el.querySelector(s);
  const KEY = "pdflibre-cv-v1";
  // tr(): Oberfläche auf /en/ und /fr/ übersetzen – Schlüssel ist der deutsche Text, {name} wird ersetzt
  const tr = (text, vars) => {
    const d = window.PL_T || {};
    const out = d[text] != null ? d[text] : text;
    return vars ? out.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m)) : out;
  };
  const UI = window.PL_LANG || "de"; // Sprache der Seite (die Sprache des Lebenslaufs ist data.lang)

  // Standard-Überschriften in der Sprache des Lebenslaufs (so stehen sie auch in der PDF, siehe cv_pdf.py)
  const SECTION_NAMES_BY_LANG = {
    de: { summary: "Profil", experience: "Berufserfahrung", education: "Ausbildung", projects: "Projekte", skills: "Kenntnisse", languages: "Sprachen", extra: "Weitere Angaben" },
    en: { summary: "Profile", experience: "Experience", education: "Education", projects: "Projects", skills: "Skills", languages: "Languages", extra: "Additional information" },
    fr: { summary: "Profil", experience: "Expérience professionnelle", education: "Formation", projects: "Projets", skills: "Compétences", languages: "Langues", extra: "Informations complémentaires" },
  };
  const secName = (type) => (SECTION_NAMES_BY_LANG[data.lang] || SECTION_NAMES_BY_LANG.de)[type];
  const ENTRY_LABELS = {
    experience: { title: tr("Position"), org: tr("Unternehmen"), place: tr("Ort"), text: tr("Aufgaben und Erfolge (eine Zeile pro Stichpunkt)") },
    education: { title: tr("Abschluss / Studiengang"), org: tr("Schule / Hochschule"), place: tr("Ort"), text: tr("Schwerpunkte, Note, Abschlussarbeit (optional)") },
    projects: { title: tr("Projekt"), org: tr("Link oder Rahmen (z. B. GitHub, Uni-Projekt)"), place: "", text: tr("Was hast du gemacht? (eine Zeile pro Stichpunkt)") },
  };
  const PAIR_LABELS = {
    skills: [tr("Bereich (z. B. Programmierung)"), tr("Kenntnisse (z. B. Python, SQL, Git)")],
    languages: [tr("Sprache"), tr("Niveau (z. B. Muttersprache, C1, fließend)")],
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

  // Beispiel-Lebenslauf in der Sprache der Seite
  const SAMPLES = {
    de: {
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
    },
    en: {
      v: 1, template: "modern", accent: "#1f4fa3", lang: "en", photo: null,
      person: { name: "Jane Doe", headline: "Data Science Intern", email: "jane.doe@example.com", phone: "+44 7700 900123", location: "London", links: "linkedin.com/in/jane-doe\ngithub.com/janedoe" },
      sections: [
        { type: "summary", text: "Third-year computer science student specializing in machine learning. Hands-on experience with Python, SQL and data visualization from an internship and personal projects. Looking for a part-time data science role (15–20 hours/week)." },
        { type: "experience", items: [
          { title: "Data Analytics Intern", org: "Example Ltd", place: "London", from: "10/2024", current: true, text: "- Built Power BI dashboards for the sales team\n- Automated monthly reports with Python (pandas), saving 6 hours a week\n- Checked data quality and wrote SQL queries on PostgreSQL" },
          { title: "IT & Data Analysis Intern", org: "Sample Corp", place: "Manchester", from: "03/2023", to: "08/2023", text: "- Analyzed customer data and produced monthly reports\n- Moved Excel processes to Python scripts" },
        ] },
        { type: "education", items: [
          { title: "BSc Computer Science", org: "University of London", place: "London", from: "09/2023", current: true, text: "Focus: machine learning, databases" },
          { title: "A-levels (Maths A*, Physics A, Computing A)", org: "City Sixth Form College", place: "London", from: "2021", to: "2023" },
        ] },
        { type: "projects", items: [{ title: "Customer support chatbot", org: "github.com/janedoe/chatbot", text: "- Developed a RAG chatbot with OpenAI and pgvector\n- Answers questions based on uploaded PDF documents" }] },
        { type: "skills", items: [{ label: "Programming", value: "Python, SQL, JavaScript, Java" }, { label: "Data science", value: "pandas, scikit-learn, Power BI" }, { label: "Tools", value: "Git, Docker, Linux" }] },
        { type: "languages", items: [{ label: "English", value: "Native" }, { label: "French", value: "B2" }, { label: "German", value: "A2" }] },
        { type: "extra", title: "Volunteering & interests", text: "Youth football coach (since 2021) · Hackathons · Photography" },
      ],
    },
    fr: {
      v: 1, template: "modern", accent: "#1f4fa3", lang: "fr", photo: null,
      person: { name: "Marie Dupont", headline: "Stagiaire Data Science", email: "marie.dupont@example.fr", phone: "+33 6 12 34 56 78", location: "Lyon", links: "linkedin.com/in/marie-dupont\ngithub.com/mariedupont" },
      sections: [
        { type: "summary", text: "Étudiante en 3e année d’informatique, spécialisée en machine learning. Expérience de Python, SQL et de la visualisation de données acquise en stage et sur des projets personnels. Recherche un stage ou une alternance en data science." },
        { type: "experience", items: [
          { title: "Alternante Data Analytics", org: "Exemple SAS", place: "Lyon", from: "10/2024", current: true, text: "- Création de tableaux de bord Power BI pour l’équipe commerciale\n- Automatisation des rapports mensuels avec Python (pandas) – 6 heures gagnées par semaine\n- Contrôle de la qualité des données et requêtes SQL sur PostgreSQL" },
          { title: "Stage IT & analyse de données", org: "Modèle SA", place: "Paris", from: "03/2023", to: "08/2023", text: "- Analyse des données clients et reporting mensuel\n- Migration de processus Excel vers des scripts Python" },
        ] },
        { type: "education", items: [
          { title: "Licence Informatique", org: "Université Claude Bernard Lyon 1", place: "Lyon", from: "09/2023", current: true, text: "Spécialité : apprentissage automatique, bases de données" },
          { title: "Baccalauréat général, mention bien", org: "Lycée du Parc", place: "Lyon", from: "2020", to: "2023" },
        ] },
        { type: "projects", items: [{ title: "Chatbot pour le service client", org: "github.com/mariedupont/chatbot", text: "- Développement d’un chatbot RAG avec OpenAI et pgvector\n- Réponses fondées sur des documents PDF importés" }] },
        { type: "skills", items: [{ label: "Programmation", value: "Python, SQL, JavaScript, Java" }, { label: "Data science", value: "pandas, scikit-learn, Power BI" }, { label: "Outils", value: "Git, Docker, Linux" }] },
        { type: "languages", items: [{ label: "Français", value: "Langue maternelle" }, { label: "Anglais", value: "C1 (courant)" }, { label: "Allemand", value: "B1" }] },
        { type: "extra", title: "Engagement & centres d’intérêt", text: "Entraîneuse de football jeunes (depuis 2021) · Hackathons · Photographie" },
      ],
    },
  };
  const SAMPLE = SAMPLES[UI] || SAMPLES.de;

  let data = load() || { ...empty(), template: root.dataset.defaultTemplate || "modern", lang: root.dataset.defaultLang || "de" };

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
  const MONTHS = { jan: 1, feb: 2, fév: 2, fev: 2, mär: 3, mar: 3, maer: 3, apr: 4, avr: 4, mai: 5, may: 5, jun: 6, juin: 6, jul: 7, juil: 7, aug: 8, aoû: 8, aou: 8, sep: 9, okt: 10, oct: 10, nov: 11, dez: 12, dec: 12, déc: 12 };
  const DATE_OK = /^((0[1-9]|1[0-2])\/)?(19|20)\d{2}$/;
  const MONTH_RE = "[a-zäöüéèêûôîç]{3,}";
  const fullYear = (y) => {
    if (y.length === 4) return y;
    const n = +y, now = new Date().getFullYear() % 100;
    return String(n <= now + 1 ? 2000 + n : 1900 + n); // „23“ → 2023, „98“ → 1998
  };
  const monthOf = (w) => MONTHS[w.toLowerCase().slice(0, 4)] || MONTHS[w.toLowerCase().slice(0, 3)];
  function normalizeDate(v) {
    // aufräumen: Leerzeichen, Punkt am Ende, verschiedene Striche und Schrägstriche
    let t = String(v || "").replace(/[   ]/g, " ").replace(/[⁄∕／]/g, "/").replace(/\s+/g, " ").trim().replace(/[.,;:]+$/, "");
    if (!t || DATE_OK.test(t)) return t;
    let m;
    const mm = (n) => String(n).padStart(2, "0");
    // 10/2023, 10.2023, 10-2023, 10 / 2023, 10/23
    if ((m = t.match(/^(\d{1,2})\s*[./-]\s*(\d{4}|\d{2})$/)) && +m[1] >= 1 && +m[1] <= 12) return `${mm(m[1])}/${fullYear(m[2])}`;
    // 2023-10, 2023/10
    if ((m = t.match(/^((?:19|20)\d{2})\s*[./-]\s*(\d{1,2})$/)) && +m[2] >= 1 && +m[2] <= 12) return `${mm(m[2])}/${m[1]}`;
    // 01.10.2023 (mit Tag) → 10/2023
    if ((m = t.match(/^\d{1,2}\s*[./-]\s*(\d{1,2})\s*[./-]\s*(\d{4}|\d{2})$/)) && +m[1] >= 1 && +m[1] <= 12) return `${mm(m[1])}/${fullYear(m[2])}`;
    // Okt. 2023, Oktober 2023, Okt 23, févr. 2024
    if ((m = t.match(new RegExp(`^(${MONTH_RE})\\.?\\s*'?(\\d{4}|\\d{2})$`, "i"))) && monthOf(m[1])) return `${mm(monthOf(m[1]))}/${fullYear(m[2])}`;
    // Semester: WS 2025/26, WiSe 2025, SS 2025, SoSe 25
    if ((m = t.match(/^(WS|WiSe|Wintersemester)\s*(\d{4}|\d{2})/i))) return `10/${fullYear(m[2])}`;
    if ((m = t.match(/^(SS|SoSe|Sommersemester)\s*(\d{4}|\d{2})/i))) return `04/${fullYear(m[2])}`;
    // „seit 10/2025“, „ab Oktober 2025“, „depuis 2024“
    if ((m = t.match(/^(?:seit|ab|since|from|depuis|von)\s+(.+)$/i))) return normalizeDate(m[1]);
    return t;
  }
  // „10/2023 – 04/2024“ oder „2016-2019“ in einem Feld → [von, bis]
  function splitRange(v) {
    const t = String(v || "").trim();
    const m = t.match(/^(.+?)\s*(?:–|—|-|bis|to|until|à|au)\s*(.+)$/i);
    if (!m) return null;
    const a = normalizeDate(m[1]);
    if (!DATE_OK.test(a)) return null;
    if (isNow(m[2])) return [a, "", true];
    const b = normalizeDate(m[2]);
    return DATE_OK.test(b) ? [a, b, false] : null;
  }
  const isNow = (v) => /^(heute|aktuell|jetzt|bis heute|present|today|now|current|aujourd.hui|actuel|actuellement|en cours)$/i.test(String(v || "").trim());

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
    const before = JSON.stringify(data.sections);
    for (const sec of data.sections || [])
      for (const it of sec.items || []) {
        const range = splitRange(it.from);
        if (range && !it.to) [it.from, it.to, it.current] = range;
        if (it.from) it.from = normalizeDate(it.from);
        if (isNow(it.to)) { it.to = ""; it.current = true; }
        else if (it.to) it.to = normalizeDate(it.to);
      }
    if (JSON.stringify(data.sections) !== before) save(); // korrigierte Daten sofort merken
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
      const title = key === "person" ? tr("Persönliche Daten") : head.querySelector(".cv-title").value || head.querySelector(".cv-title").placeholder;
      const st = sectionStatus(key);
      const isOpen = open.has(key);
      c.classList.toggle("is-collapsed", !isOpen);
      const tog = h("button", { type: "button", class: "cv-card__toggle", "aria-expanded": String(isOpen), "aria-label": (isOpen ? tr("Zuklappen: ") : tr("Aufklappen: ")) + title, onclick: () => toggleCard(key) }, isOpen ? "▾" : "▸");
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
          h("img", { src: data.photo, alt: tr("Bewerbungsfoto") }),
          h("button", { type: "button", class: "btn btn--link", onclick: () => { data.photo = null; drawPhoto(); changed(); } }, tr("Foto entfernen"))
        );
      } else {
        const inp = h("input", { type: "file", accept: "image/jpeg,image/png,image/webp", class: "visually-hidden" });
        inp.addEventListener("change", () => inp.files[0] && readPhoto(inp.files[0]).then((url) => { data.photo = url; drawPhoto(); changed(); }));
        photoBox.append(h("label", { class: "btn btn--ghost btn--sm" }, tr("Foto hinzufügen (optional)"), inp));
      }
    };
    drawPhoto();
    form.append(
      h("section", { class: "cv-card", "data-key": "person" },
        h("div", { class: "cv-card__head" }, h("h3", {}, tr("Persönliche Daten"))),
        h("div", { class: "cv-grid" },
          field(tr("Vor- und Nachname"), p, "name", { placeholder: "Max Mustermann" }),
          field(tr("Wunschposition / Titel"), p, "headline", { placeholder: tr("z. B. Werkstudent Data Science") }),
          field(tr("E-Mail"), p, "email", { type: "email", placeholder: "vorname.nachname@…" }),
          field(tr("Telefon"), p, "phone", { type: "tel", placeholder: "+49 …" }),
          field(tr("Wohnort"), p, "location", { placeholder: tr("z. B. Darmstadt") }),
          field(tr("Links (eine pro Zeile)"), p, "links", { textarea: true, rows: 2, placeholder: "linkedin.com/in/…\ngithub.com/…" })
        ),
        photoBox
      )
    );

    // Abschnitte
    data.sections.forEach((sec, si) => {
      const name = secName(sec.type);
      const head = h("div", { class: "cv-card__head" },
        h("input", { class: "cv-title", value: sec.title || "", placeholder: name, "aria-label": tr("Überschrift des Abschnitts"), oninput: (e) => { sec.title = e.target.value; changed(); } }),
        iconBtn(tr("Abschnitt nach oben"), "↑", () => move(data.sections, si, -1)),
        iconBtn(tr("Abschnitt nach unten"), "↓", () => move(data.sections, si, 1)),
        iconBtn(sec.hidden ? tr("Abschnitt einblenden") : tr("Abschnitt ausblenden"), sec.hidden ? tr("Einblenden") : tr("Ausblenden"), () => { sec.hidden = !sec.hidden; renderForm(); changed(); }, "cv-ibtn--text")
      );
      const card = h("section", { class: "cv-card" + (sec.hidden ? " is-hidden" : ""), "data-key": sec.type + si }, head);
      if (sec.type === "summary" || sec.type === "extra") {
        card.append(field(sec.type === "summary" ? tr("2–4 Sätze: Wer bist du, was kannst du, was suchst du?") : tr("Ehrenamt, Interessen, Führerschein …"), sec, "text", { textarea: true, rows: 4, wide: true }));
      } else if (sec.type === "skills" || sec.type === "languages") {
        const [l1, l2] = PAIR_LABELS[sec.type];
        sec.items.forEach((it, ii) => {
          card.append(h("div", { class: "cv-pair" }, field(l1, it, "label"), field(l2, it, "value"), iconBtn(tr("Zeile löschen"), "×", () => { sec.items.splice(ii, 1); renderForm(); changed(); }, "cv-ibtn--del")));
        });
        card.append(h("button", { type: "button", class: "btn btn--link", onclick: () => { sec.items.push({}); renderForm(); } }, tr("+ Zeile hinzufügen")));
      } else {
        const L = ENTRY_LABELS[sec.type];
        sec.items.forEach((it, ii) => {
          const current = h("input", { type: "checkbox" });
          current.checked = !!it.current;
          current.addEventListener("change", () => { it.current = current.checked; to.querySelector("input").disabled = current.checked; changed(); });
          const to = field(tr("Bis"), it, "to", { placeholder: tr("MM/JJJJ") });
          const from = field(tr("Von"), it, "from", { placeholder: tr("MM/JJJJ") });
          // beim Verlassen des Feldes: Datum vereinheitlichen, „heute“ → Häkchen „bis heute“
          for (const [box, key] of [[from, "from"], [to, "to"]]) {
            const inp = box.querySelector("input");
            inp.addEventListener("change", () => {
              const range = splitRange(inp.value);
              if (range) {
                // beide Daten in ein Feld geschrieben → auf „Von“ und „Bis“ verteilen
                [it.from, it.to, it.current] = range;
                renderForm();
                changed();
                return;
              }
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
                iconBtn(tr("Eintrag nach oben"), "↑", () => move(sec.items, ii, -1)),
                iconBtn(tr("Eintrag nach unten"), "↓", () => move(sec.items, ii, 1)),
                iconBtn(tr("Eintrag löschen"), "×", () => { sec.items.splice(ii, 1); renderForm(); changed(); }, "cv-ibtn--del")
              ),
              h("div", { class: "cv-grid" },
                field(L.title, it, "title"),
                field(L.org, it, "org"),
                L.place ? field(L.place, it, "place") : null,
                h("div", { class: "cv-dates" }, from, to, h("label", { class: "cv-check" }, current, tr(" bis heute"))),
                field(L.text, it, "text", { textarea: true, rows: 3, wide: true, placeholder: sec.type === "education" ? "" : tr("- Was hast du erreicht? Mit Zahlen, wenn möglich") })
              )
            )
          );
        });
        card.append(h("button", { type: "button", class: "btn btn--link", onclick: () => { sec.items.push({}); renderForm(); } }, tr("+ Eintrag hinzufügen")));
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
  // Jeder Punkt: erfüllt? Wenn nicht: warum wichtig, was genau fehlt, und Knöpfe, die es beheben
  let lastPages = 0;
  function atsCheck(pages) {
    lastPages = pages;
    const p = data.person;
    const secIdx = (type) => data.sections.findIndex((x) => x.type === type);
    const keyOf = (type) => (secIdx(type) >= 0 ? type + secIdx(type) : "person");
    const sec = (type) => data.sections[secIdx(type)];
    const exp = sec("experience"), edu = sec("education"), sum = sec("summary");
    const filled = (s) => s && !s.hidden && (s.items || []).some((i) => i.title || i.org);
    const name = (i) => i.title || i.org || tr("Eintrag");
    const stations = data.sections.flatMap((s, si) => (!s.hidden && ["experience", "education", "projects"].includes(s.type) ? (s.items || []).map((it) => ({ it, key: s.type + si })) : [])).filter((x) => x.it.title || x.it.org);
    const badDates = [];
    for (const { it, key } of stations) {
      if (it.from && !DATE_OK.test(normalizeDate(it.from))) badDates.push({ it, key, val: it.from });
      if (!it.current && it.to && !DATE_OK.test(normalizeDate(it.to))) badDates.push({ it, key, val: it.to });
    }
    const expItems = (exp && !exp.hidden ? exp.items || [] : []).map((it) => ({ it, key: keyOf("experience") })).filter((x) => x.it.title || x.it.org);
    const noText = expItems.filter((x) => !(x.it.text || "").trim());
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((p.email || "").trim());
    const missing = [!emailOk && (p.email ? tr("gültige E-Mail-Adresse") : tr("E-Mail-Adresse")), !(p.phone || "").trim() && tr("Telefonnummer")].filter(Boolean);
    const sumLen = sum && !sum.hidden ? (sum.text || "").trim().length : 0;
    const go = (key, sel) => () => openCard(key, sel);

    const checks = [
      {
        ok: !!p.name.trim(),
        title: tr("Name angegeben"),
        help: tr("Dein vollständiger Name gehört ganz oben in den Lebenslauf – als Text, nicht als Bild."),
        actions: [[tr("Name eintragen"), go("person")]],
      },
      {
        ok: !missing.length,
        title: tr("E-Mail und Telefon als Text im Lebenslauf"),
        help: tr("Ein ATS liest Kontaktdaten nur, wenn sie als Text dastehen. Es fehlt: {list}.", { list: missing.join(tr(" und ")) }),
        actions: [[tr("{what} eintragen", { what: (missing[0] || tr("Kontaktdaten")).replace(/^./, (c) => c.toUpperCase()) }), go("person", !emailOk ? 'input[type="email"]' : 'input[type="tel"]')]],
      },
      {
        ok: sumLen >= 80,
        title: tr("Kurzprofil mit 2–4 Sätzen"),
        help: sum && sum.hidden
          ? tr("Dein Profil ist ausgeblendet. Ein kurzes Profil oben im Lebenslauf zeigt Personalern und ATS sofort, wer du bist und was du suchst.")
          : tr("Schreibe 2–4 Sätze: Wer bist du, was kannst du, was suchst du?") + " " + (sumLen ? tr("Bisher sind es nur {n} Zeichen.", { n: sumLen }) : tr("Bisher ist das Profil leer.")),
        actions: [
          ...(sum && sum.hidden ? [[tr("Profil einblenden"), () => { sum.hidden = false; openCard(keyOf("summary")); changed(); }]] : [[tr("Selbst schreiben"), go(keyOf("summary"), "textarea")]]),
          ...(stations.length ? [[tr("Vorschlag mit KI"), suggestSummary, true]] : []),
        ],
      },
      {
        ok: filled(exp) || filled(edu),
        title: tr("Berufserfahrung oder Ausbildung eingetragen"),
        help: tr("Ohne Stationen kann ein ATS deinen Werdegang nicht erkennen. Trage mindestens deine Ausbildung oder dein Studium ein – Praktika und Nebenjobs zählen als Berufserfahrung."),
        actions: [[tr("Berufserfahrung eintragen"), go(keyOf("experience"))], [tr("Ausbildung eintragen"), go(keyOf("education"))]],
      },
      {
        ok: !badDates.length,
        title: tr("Einheitliches Datumsformat (MM/JJJJ oder JJJJ)"),
        help: tr(badDates.length === 1 ? "Diese Angabe konnte nicht automatisch umgewandelt werden. Schreibe Monat und Jahr, z. B. „10/2025“, oder nur das Jahr, z. B. „2025“. Für eine laufende Station setze das Häkchen „bis heute“." : "Diese Angaben konnten nicht automatisch umgewandelt werden. Schreibe Monat und Jahr, z. B. „10/2025“, oder nur das Jahr, z. B. „2025“. Für eine laufende Station setze das Häkchen „bis heute“."),
        actions: badDates.map((b) => [tr("„{val}“ bei {name} ändern", { val: b.val, name: name(b.it) }), go(b.key, "input.is-bad")]),
      },
      {
        ok: !expItems.length || expItems.length - noText.length >= Math.min(2, expItems.length),
        title: tr("Aufgaben und Erfolge bei den Stationen beschrieben"),
        help: tr("Beschreibe bei jeder Station in 2–4 Stichpunkten, was du gemacht und erreicht hast – am besten mit Ergebnis, z. B. „- Monatsberichte mit Python automatisiert“. Das sind die Stellen, an denen ein ATS deine Keywords findet."),
        actions: noText.map((x) => [tr("{name} beschreiben", { name: name(x.it) }), () => openCard(x.key, "textarea")]),
      },
      {
        ok: pages > 0 && pages <= 2,
        title: tr("Höchstens zwei Seiten"),
        help: tr("Dein Lebenslauf hat {n} Seiten. Personaler lesen meist nur ein bis zwei Seiten – kürze ältere Stationen oder wähle eine kompaktere Vorlage.", { n: pages }),
        actions: [
          ...(data.template !== "kompakt" ? [[tr("Vorlage „Kompakt“ verwenden"), () => { data.template = "kompakt"; renderForm(); changed(); }, true]] : []),
          ...(data.photo ? [[tr("Foto entfernen"), () => { data.photo = null; renderForm(); changed(); }]] : []),
          ...data.sections.map((s, si) => (["projects", "extra"].includes(s.type) && !s.hidden && ((s.items || []).length || (s.text || "").trim()) ? [tr("„{name}“ ausblenden", { name: s.title || secName(s.type) }), () => { s.hidden = true; renderForm(); changed(); }] : null)).filter(Boolean),
        ],
      },
    ];

    const list = $("[data-ats]");
    list.textContent = "";
    const open = checks.filter((c) => !c.ok);
    for (const c of checks) {
      if (c.ok) {
        list.append(h("li", { class: "ok" }, c.title));
        continue;
      }
      list.append(
        h("li", { class: "todo" },
          h("b", {}, c.title),
          h("p", { class: "cv-fix__help" }, c.help),
          c.actions.length ? h("div", { class: "cv-fix__actions" }, c.actions.map(([label, fn, main]) => h("button", { type: "button", class: "btn btn--sm " + (main ? "btn--primary" : "btn--ghost"), onclick: fn }, label))) : null
        )
      );
    }
    const score = checks.length - open.length;
    $("[data-ats-score]").textContent = tr("{a} von {b}", { a: score, b: checks.length });
    $("[data-ats-hint]").textContent = open.length ? (open.length === 1 ? tr("Noch 1 Punkt offen – so behebst du ihn:") : tr("Noch {n} Punkte offen – so behebst du sie:", { n: open.length })) : tr("Alles erfüllt – dein Lebenslauf ist gut für ATS lesbar.");
    const badge = $("[data-ats-badge]");
    badge.textContent = `${score}/${checks.length}`;
    badge.classList.toggle("is-ok", score === checks.length);
    if (afterImport) {
      afterImport = false;
      if (open.length)
        notice((open.length === 1 ? tr("Import fertig. 1 Punkt ist im ATS-Check noch offen – bitte prüfe außerdem alle Angaben, die KI kann sich beim Zuordnen irren.") : tr("Import fertig. {n} Punkte sind im ATS-Check noch offen – bitte prüfe außerdem alle Angaben, die KI kann sich beim Zuordnen irren.", { n: open.length })), "ok", [tr("Offene Punkte beheben"), () => setStep("optimize")]);
    }
  }
  let afterImport = false;

  // Kurzprofil-Vorschlag aus dem Lebenslauf (KI, nur vorhandene Angaben)
  async function suggestSummary(ev) {
    const btn = ev.currentTarget;
    const s = data.sections.find((x) => x.type === "summary");
    if (!s) return;
    btn.disabled = true;
    btn.textContent = tr("Wird geschrieben …");
    try {
      const j = await aiPost("/api/ai/cv-summary", { cvText: cvText(), lang: data.lang || "de" });
      const fields = [{ id: "summary", obj: s, key: "text", text: s.text || "" }];
      $("[data-review-title]").textContent = tr("Vorschlag für dein Kurzprofil");
      const chosen = changeList($("[data-changes]"), [{ id: "summary", before: s.text || "", after: j.text }]);
      const dlg = $("[data-review]");
      dlg.onclose = () => {
        if (dlg.returnValue !== "ok") return;
        s.hidden = false;
        applyChanges(fields, chosen());
      };
      dlg.showModal();
    } catch (e) {
      fail(e);
    } finally {
      btn.disabled = false;
      btn.textContent = tr("Vorschlag mit KI");
    }
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
      if (!res.ok) throw new Error(j.error || tr("Vorschau fehlgeschlagen."));
      if (my !== seq) return; // eine neuere Anfrage ist schon unterwegs
      box.textContent = "";
      j.pages.forEach((src, i) => box.append(h("img", { src, alt: tr("Vorschau Seite {n}", { n: i + 1 }), class: "cv-page" })));
      $("[data-info]").textContent = (j.pages.length === 1 ? tr("1 Seite") : tr("{n} Seiten", { n: j.pages.length })) + ` · ${Math.max(1, Math.round(j.size / 1024))} KB`;
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
      if (hasContent() && !confirm(tr("Dein aktueller Lebenslauf wird durch das Beispiel ersetzt. Fortfahren?"))) return;
      data = JSON.parse(JSON.stringify({ ...SAMPLE, template: data.template, accent: data.accent }));
      open = new Set(["person", "summary0", "experience1"]);
      keepOpen();
      startApp();
      renderForm();
      changed();
    })
  );
  $("[data-new]").addEventListener("click", () => {
    if (hasContent() && !confirm(tr("Alle Eingaben löschen und neu beginnen?"))) return;
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
        showError(tr("Diese Datei ist kein Lebenslauf-Entwurf von PDF Libre."));
      }
      return;
    }
    startApp();
    if (hasContent() && !confirm(tr("Dein aktueller Lebenslauf im Formular wird durch den importierten ersetzt. Fortfahren?"))) return;
    const fd = new FormData();
    fd.append("file", f);
    notice(tr("Dein Lebenslauf wird gelesen … das dauert etwa 10–30 Sekunden."), "busy");
    try {
      const res = await fetch("/api/ai/cv-import", { method: "POST", body: fd });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || tr("Die Datei konnte nicht gelesen werden."));
      // Design, Farbe und Foto bleiben wie eingestellt – nur die Inhalte kommen aus der Datei
      data = { ...empty(), ...j.data, template: data.template, accent: data.accent, photo: j.data.photo || data.photo };
      open = new Set(["person", "summary0", "experience1"]);
      keepOpen();
      renderForm();
      changed();
      notice(j.source === "ai" ? tr("Import fertig. Bitte prüfe alle Angaben – die KI überträgt nur, was im Lebenslauf steht, kann sich aber beim Zuordnen irren.") : tr("Entwurf geöffnet."), "ok");
      afterImport = true; // nach der nächsten Vorschau: offene ATS-Punkte nennen
      letterInfo();
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
    btn.textContent = tr("Wird erstellt …");
    try {
      const res = await fetch("/api/cv/pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data }) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || tr("Die PDF konnte nicht erstellt werden."));
      const n = (data.person.name || "").trim().replace(/\s+/g, "_").replace(/[^\p{L}\p{N}_-]/gu, "");
      const a = h("a", { href: URL.createObjectURL(await res.blob()), download: `${{ en: "CV", fr: "CV" }[data.lang] || "Lebenslauf"}${n ? "_" + n : ""}.pdf` });
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
  function notice(msg, kind, action) {
    const el = $("[data-notice]");
    el.textContent = msg;
    if (action) el.append(" ", h("button", { type: "button", class: "btn btn--sm btn--primary", onclick: action[1] }, action[0]));
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
    const err = new Error(j.error || tr("Die KI-Anfrage ist fehlgeschlagen."));
    if (res.status === 401) err.link = { href: `/anmelden.html?next=${encodeURIComponent(location.pathname)}`, label: tr("Anmelden") };
    if (res.status === 402) err.link = { href: "/preise.html", label: tr("Tarife ansehen") };
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
      lines.push(`## ${sec.title || secName(sec.type)}`);
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
    if (n) { renderForm(); changed(); notice((n === 1 ? tr("1 Änderung übernommen.") : tr("{n} Änderungen übernommen.", { n })), "ok"); }
  }

  // Rechtschreibung prüfen / Formulierungen verbessern: gleicher Ablauf, anderer Endpunkt
  async function review(btn, url, title, emptyMsg) {
    const fields = textFields();
    if (!fields.length) return showError(tr("Es gibt noch keinen Text zum Prüfen."));
    const label = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = tr("Einen Moment …");
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
  $("[data-proofread]").addEventListener("click", (ev) => review(ev.currentTarget, "/api/ai/cv-proofread", tr("Vorschläge der Rechtschreibprüfung"), tr("Keine Fehler gefunden – sehr gut!")));
  $("[data-improve]").addEventListener("click", (ev) => review(ev.currentTarget, "/api/ai/cv-improve", tr("Bessere Formulierungen"), tr("Deine Formulierungen sind schon gut – keine Vorschläge.")));

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
    $("[data-score]").textContent = tr("{p} % Übereinstimmung", { p: score });
    $("[data-score-bar]").style.width = score + "%";
    $("[data-score-bar]").style.background = score >= 70 ? "#16a34a" : score >= 45 ? "#d97706" : "#dc2626";
    $("[data-role]").textContent = [match.role, match.company].filter(Boolean).join(" · ");
    const ul = $("[data-kws]");
    ul.textContent = "";
    for (const k of list) {
      const li = h("li", { class: "cv-kw" + (k.found ? " is-found" : "") + (k.must ? " is-must" : ""), title: k.must ? tr("Gefordert") : tr("Wünschenswert") }, (k.found ? "✓ " : "") + k.term);
      if (!k.found)
        li.append(h("button", { type: "button", class: "cv-kw__add", title: tr("Zu den Kenntnissen hinzufügen"), onclick: () => addSkill(k.term) }, "+"));
      ul.append(li);
    }
  }
  function addSkill(term) {
    if (!confirm(tr("„{term}“ zu deinen Kenntnissen hinzufügen?\n\nBitte nur, wenn du das wirklich kannst – im Vorstellungsgespräch wird danach gefragt.", { term }))) return;
    let sec = data.sections.find((x) => x.type === "skills");
    if (!sec) data.sections.push((sec = { type: "skills", items: [] }));
    let row = sec.items.find((i) => /^(weitere|sonstige|other|autres)/i.test(i.label || "")) || sec.items.find((i) => !i.label && !i.value);
    const other = { en: "Other", fr: "Autres" }[data.lang] || "Weitere";
    if (!row) sec.items.push((row = { label: other, value: "" }));
    if (!row.label && !row.value) row.label = other;
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
    status.textContent = tr("Die Anzeige wird analysiert … (ca. 20 Sekunden)");
    try {
      matchFields = textFields();
      const j = await aiPost("/api/ai/cv-match", { ad: adBox.value, items: matchFields.map(({ id, text }) => ({ id, text })), cvText: cvText() });
      match = j;
      $("[data-match-result]").hidden = false;
      drawMatch();
      const tips = $("[data-tips]");
      tips.textContent = "";
      j.tips.forEach((t) => tips.append(h("li", {}, t)));
      $("[data-changes-title]").textContent = j.changes.length ? tr("Vorgeschlagene Änderungen") : tr("Keine Textänderungen nötig");
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
      j.pages.forEach((src) => box.append(h("img", { src, alt: tr("Vorschau Anschreiben"), class: "cv-page" })));
    } catch {
      /* Vorschau ist nur Komfort */
    }
  }
  $("[data-letter-ad]").addEventListener("input", (e) => { data.jobAd = e.target.value; save(); });
  letterDlg.querySelectorAll("[data-l]").forEach((el) =>
    el.addEventListener("input", () => {
      L()[el.dataset.l] = el.value;
      save();
      clearTimeout(lTimer);
      lTimer = setTimeout(letterPreview, 600);
    })
  );
  root.querySelectorAll("[data-open-letter]").forEach((b) => b.addEventListener("click", openLetter));
  // Zeigt im Anschreiben-Dialog, ob die KI einen Lebenslauf als Grundlage hat
  function letterInfo() {
    const box = $("[data-letter-cv]");
    if (!box) return;
    const n = data.sections.filter((s) => !s.hidden && ["experience", "education", "projects"].includes(s.type)).reduce((k, s) => k + (s.items || []).filter((i) => i.title || i.org).length, 0);
    const ok = hasContent() && n > 0;
    box.className = "cv-letter__cv " + (ok ? "is-ok" : "is-missing");
    box.textContent = ok
      ? "✓ " + (data.person.name ? (n === 1 ? tr("Lebenslauf von {name} mit 1 Station – daraus schreibt die KI.", { name: data.person.name }) : tr("Lebenslauf von {name} mit {n} Stationen – daraus schreibt die KI.", { name: data.person.name, n })) : (n === 1 ? tr("Lebenslauf mit 1 Station – daraus schreibt die KI.") : tr("Lebenslauf mit {n} Stationen – daraus schreibt die KI.", { n })))
      : tr("Noch kein Lebenslauf: Importiere deinen Lebenslauf, damit die KI deine echten Erfahrungen verwenden kann.");
    $("[data-letter-import]").hidden = ok && !!data.person.name;
    // Ort nachtragen, wenn er erst durch den Import bekannt wurde
    const l = data.letter;
    if (l && l.date && data.person.location && !l.date.includes(",")) {
      l.date = `${data.person.location}, ${data.lang === "fr" ? "le " : ""}${l.date}`;
      const f = letterDlg.querySelector('[data-l="date"]');
      if (f) f.value = l.date;
    }
  }

  function openLetter() {
    letterInfo();
    $("[data-letter-ad]").value = data.jobAd || "";
    const l = L();
    const loc = { de: "de-DE", en: "en-GB", fr: "fr-FR" }[data.lang] || "de-DE";
    const today = new Date().toLocaleDateString(loc, data.lang === "de" ? { day: "2-digit", month: "2-digit", year: "numeric" } : { day: "numeric", month: "long", year: "numeric" });
    if (!l.date) l.date = data.person.location ? `${data.person.location}, ${data.lang === "fr" ? "le " : ""}${today}` : today;
    if (!l.closing) l.closing = { en: "Kind regards", fr: "Je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées." }[data.lang] || "Mit freundlichen Grüßen";
    for (const k of ["recipient", "notes", "date", "subject", "salutation", "body", "closing"]) lf(k).value = l[k] || "";
    $("[data-letter-error]").hidden = true;
    letterDlg.showModal();
    letterPreview();
  }
  $("[data-run-letter]").addEventListener("click", async (ev) => {
    const btn = ev.currentTarget;
    const status = $("[data-letter-status]");
    const cvOk = data.sections.some((s) => !s.hidden && (s.items || []).some((i) => i.title || i.org));
    if (!cvOk) {
      status.textContent = tr("Importiere zuerst deinen Lebenslauf (oben) oder fülle das Formular aus – sonst hat die KI nichts, worauf sie sich stützen kann.");
      $("[data-letter-import]").hidden = false;
      return;
    }
    if (!(data.jobAd || "").trim()) {
      status.textContent = tr("Füge oben den Text der Stellenanzeige ein.");
      $("[data-letter-ad]").focus();
      return;
    }
    if ((lf("body").value || "").trim() && !confirm(tr("Der bisherige Text des Anschreibens wird ersetzt. Fortfahren?"))) return;
    btn.disabled = true;
    status.textContent = tr("Das Anschreiben wird geschrieben … (ca. 20 Sekunden)");
    try {
      const rec = (L().recipient || "").split("\n").map((x) => x.trim()).filter(Boolean);
      const contact = rec.find((x) => /^(frau|herr|mr|ms|mrs)\b/i.test(x)) || "";
      const j = await aiPost("/api/ai/cv-letter", { ad: data.jobAd, cvText: cvText(), notes: L().notes || "", contact });
      Object.assign(L(), { subject: j.subject, salutation: j.salutation, body: j.paragraphs.join("\n\n"), closing: j.closing });
      for (const k of ["subject", "salutation", "body", "closing"]) lf(k).value = L()[k] || "";
      save();
      letterPreview();
      status.textContent = tr("Entwurf fertig – lies ihn in Ruhe durch und passe ihn an dich an.");
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
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || tr("Die PDF konnte nicht erstellt werden."));
      const n = (data.person.name || "").trim().replace(/\s+/g, "_").replace(/[^\p{L}\p{N}_-]/gu, "");
      const a = h("a", { href: URL.createObjectURL(await res.blob()), download: `${{ en: "Cover_letter", fr: "Lettre_de_motivation" }[data.lang] || "Anschreiben"}${n ? "_" + n : ""}.pdf` });
      document.body.append(a);
      a.click();
      a.remove();
    } catch (e) {
      fail(e, err);
    }
  });

  // ---------------------------------------------------------------- Übersetzen
  function translateLabel() {
    /* Beschriftung bleibt „Übersetzen“ – die Zielsprache wird im Dialog gewählt */
  }
  const trDlg = $("[data-trdlg]");
  $("[data-translate]").addEventListener("click", () => {
    trDlg.querySelectorAll("[data-tr]").forEach((b) => (b.disabled = b.dataset.tr === (data.lang || "de")));
    trDlg.returnValue = "";
    trDlg.showModal();
  });
  trDlg.addEventListener("close", () => {
    if (["de", "en", "fr"].includes(trDlg.returnValue)) translateTo(trDlg.returnValue, $("[data-translate]"));
  });
  async function translateTo(target, btn) {
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
    if (!fields.length) return showError(tr("Es gibt noch keinen Text zum Übersetzen."));
    btn.disabled = true;
    notice(tr("Der Lebenslauf wird übersetzt … (ca. 20–40 Sekunden)"), "busy");
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
      notice(tr("Übersetzt. Bitte lies den Lebenslauf einmal komplett durch."), "ok");
    } catch (e) {
      notice("", "");
      fail(e);
    } finally {
      btn.disabled = false;
    }
  }
  $("[data-lang]").addEventListener("change", translateLabel);
  translateLabel();

  // Entwurf als eigene Datei speichern – getrennt vom Lebenslauf, der an Firmen geht
  $("[data-save-draft]").addEventListener("click", () => {
    const n = (data.person.name || "").trim().replace(/\s+/g, "_").replace(/[^\p{L}\p{N}_-]/gu, "");
    const a = h("a", { href: URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: "application/json" })), download: `${tr("Lebenslauf-Entwurf")}${n ? "_" + n : ""}.json` });
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
    ev.currentTarget.textContent = on ? tr("Bearbeiten") : tr("Vorschau");
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

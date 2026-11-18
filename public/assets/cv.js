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

  function renderForm() {
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
      h("section", { class: "cv-card" },
        h("h3", {}, "Persönliche Daten"),
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
      const card = h("section", { class: "cv-card" + (sec.hidden ? " is-hidden" : "") }, head);
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
                h("div", { class: "cv-dates" }, field("Von", it, "from", { placeholder: "MM/JJJJ" }), to, h("label", { class: "cv-check" }, current, " bis heute")),
                field(L.text, it, "text", { textarea: true, rows: 3, wide: true, placeholder: sec.type === "education" ? "" : "- Was hast du erreicht? Mit Zahlen, wenn möglich" })
              )
            )
          );
        });
        card.append(h("button", { type: "button", class: "btn btn--link", onclick: () => { sec.items.push({}); renderForm(); } }, "+ Eintrag hinzufügen"));
      }
      form.append(card);
    });

    // Steuerung oben
    root.querySelectorAll("[data-tpl]").forEach((b) => b.classList.toggle("is-on", b.dataset.tpl === data.template));
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
    const entries = [...(exp?.items || []), ...(edu?.items || [])].filter((i) => i.title || i.org);
    const badDate = entries.some((i) => (i.from && !/^(\d{2}\/)?\d{4}$/.test(i.from.trim())) || (!i.current && i.to && !/^(\d{2}\/)?\d{4}$/.test(i.to.trim())));
    const bullets = (exp?.items || []).filter((i) => (i.text || "").trim()).length;
    const checks = [
      [!!p.name.trim(), "Name angegeben"],
      [/@/.test(p.email) && !!p.phone.trim(), "E-Mail und Telefon als Text im Lebenslauf"],
      [!!(sum && !sum.hidden && (sum.text || "").trim().length >= 80), "Kurzprofil mit 2–4 Sätzen"],
      [filled(exp) || filled(edu), "Berufserfahrung oder Ausbildung eingetragen"],
      [!badDate, "Einheitliches Datumsformat (MM/JJJJ oder JJJJ)"],
      [!filled(exp) || bullets >= Math.min(2, (exp.items || []).length), "Aufgaben und Erfolge bei den Stationen beschrieben"],
      [pages > 0 && pages <= 2, "Höchstens zwei Seiten"],
    ];
    const list = $("[data-ats]");
    list.textContent = "";
    for (const [ok, label] of checks) list.append(h("li", { class: ok ? "ok" : "todo" }, label));
    const score = checks.filter((c) => c[0]).length;
    $("[data-ats-score]").textContent = `${score} von ${checks.length}`;
  }

  // ---------------------------------------------------------------- Vorschau
  let timer, seq = 0;
  function changed() {
    save();
    clearTimeout(timer);
    timer = setTimeout(preview, 600);
  }

  async function preview() {
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
      if (my === seq) showError(e.message);
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
  $("[data-sample]").addEventListener("click", () => {
    if (hasContent() && !confirm("Dein aktueller Lebenslauf wird durch das Beispiel ersetzt. Fortfahren?")) return;
    data = JSON.parse(JSON.stringify({ ...SAMPLE, template: data.template, accent: data.accent }));
    renderForm();
    changed();
  });
  $("[data-new]").addEventListener("click", () => {
    if (hasContent() && !confirm("Alle Eingaben löschen und neu beginnen?")) return;
    data = empty();
    renderForm();
    changed();
  });
  const hasContent = () => !!(data.person.name || data.sections.some((s) => (s.text || "").trim() || (s.items || []).some((i) => i.title || i.label)));

  // Lebenslauf-PDF von PDF Libre wieder öffnen
  const imp = $("[data-import]");
  imp.addEventListener("change", async () => {
    const f = imp.files[0];
    imp.value = "";
    if (!f) return;
    showError("");
    if (/\.json$/i.test(f.name)) {
      // Entwurfsdatei: direkt im Browser lesen, nichts wird hochgeladen
      try {
        const j = JSON.parse(await f.text());
        if (!j || !j.person || !Array.isArray(j.sections)) throw new Error();
        data = { ...empty(), ...j };
        renderForm();
        changed();
      } catch {
        showError("Diese Datei ist kein Lebenslauf-Entwurf von PDF Libre.");
      }
      return;
    }
    const fd = new FormData();
    fd.append("file", f);
    try {
      const res = await fetch("/api/cv/import", { method: "POST", body: fd });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Die Datei konnte nicht gelesen werden.");
      data = { ...empty(), ...j.data };
      renderForm();
      changed();
    } catch (e) {
      showError(e.message);
    }
  });

  $("[data-download]").addEventListener("click", async (ev) => {
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
  });

  // Entwurf als eigene Datei speichern – getrennt vom Lebenslauf, der an Firmen geht
  $("[data-save-draft]").addEventListener("click", () => {
    const n = (data.person.name || "").trim().replace(/\s+/g, "_").replace(/[^\p{L}\p{N}_-]/gu, "");
    const a = h("a", { href: URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: "application/json" })), download: `Lebenslauf-Entwurf${n ? "_" + n : ""}.json` });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 60000);
  });

  renderForm();
  preview();
})();

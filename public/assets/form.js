/* PDF-Formular ausfüllen – komplett im Browser.
 *
 * 1. pdf.js zeichnet jede Seite und liefert die Formularfelder (Widgets) mit ihrer genauen Lage.
 * 2. Über jedes Feld legen wir ein echtes HTML-Eingabefeld (Text, Häkchen, Optionsfeld, Auswahlliste).
 * 3. pdf-lib schreibt die Werte in die PDF-Felder; auf Wunsch wird das Formular „fixiert“ (flatten).
 *
 * Felder mit gleichem Namen (z. B. der Name oben auf jeder Seite) sind dasselbe Feld und bleiben gleich.
 * Hybride XFA-Formulare (Behördenformulare aus Adobe LiveCycle) werden über ihren AcroForm-Teil ausgefüllt.
 */
(() => {
  "use strict";
  const root = document.querySelector("[data-form]");
  if (!root || !window.pdfjsLib || !window.PDFLib) return;
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/vendor/pdf.worker.min.js";

  // tr(): Texte für /en/ und /fr/ (Schlüssel = deutscher Text)
  const tr = (text, vars) => {
    const d = window.PL_T || {};
    const out = d[text] != null ? d[text] : text;
    return vars ? out.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m)) : out;
  };
  const $ = (s) => root.querySelector(s);
  const stages = { pick: $(".stage--pick"), busy: $(".stage--busy"), work: $(".stage--work"), done: $(".stage--done") };
  const show = (name) => Object.entries(stages).forEach(([k, el]) => (el.hidden = k !== name));
  const input = root.querySelector('input[type="file"]');
  const pagesEl = $("[data-pages]");

  let bytes = null; // Original-PDF
  let fileName = "formular.pdf";
  let fields = new Map(); // Feldname → { type, value, options, widgets: [HTML-Elemente], detected? }
  let pages = []; // pro Seite: { page (pdf.js), vp (Anzeige), vp1 (Maßstab 1), wrap }
  let adding = null; // "text" | "check" während „Feld hinzufügen“
  let counter = 0;
  let downloadUrl = null;

  // ------------------------------------------------------------------ Datei laden
  const drop = $("[data-drop]");
  ["dragover", "dragenter"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("is-over"); }));
  ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, () => drop.classList.remove("is-over")));
  drop.addEventListener("drop", (e) => { e.preventDefault(); if (e.dataTransfer.files[0]) open(e.dataTransfer.files[0]); });
  input.addEventListener("change", () => input.files[0] && open(input.files[0]));

  async function open(file) {
    if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") return alert(tr("Bitte wähle eine PDF-Datei aus."));
    if (file.size > 100 * 1024 * 1024) return alert(tr("Die Datei ist größer als 100 MB."));
    fileName = file.name;
    show("busy");
    try {
      bytes = new Uint8Array(await file.arrayBuffer());
      await render();
      show("work");
    } catch (e) {
      console.error(e);
      show("pick");
      alert(/password/i.test(e && e.name + e.message)
        ? tr("Diese PDF ist passwortgeschützt. Entsperre sie zuerst mit „PDF entsperren“.")
        : tr("Die PDF konnte nicht geöffnet werden. Ist die Datei beschädigt?"));
    }
  }

  // ------------------------------------------------------------------ Seiten und Felder zeichnen
  async function render() {
    pagesEl.innerHTML = "";
    fields = new Map();
    pages = [];
    counter = 0;
    setAdding(null);
    const doc = await pdfjsLib.getDocument({ data: bytes.slice(), isEvalSupported: false }).promise;
    // Breite der sichtbaren Werkzeug-Box (die Arbeitsfläche ist beim Laden noch versteckt → clientWidth wäre 0)
    const width = Math.min((root.clientWidth || window.innerWidth) - 4, 1000);
    let count = 0;
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      const base = page.getViewport({ scale: 1 });
      const vp = page.getViewport({ scale: width / base.width });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const wrap = document.createElement("div");
      wrap.className = "fm-page";
      wrap.style.width = vp.width + "px";
      wrap.style.height = vp.height + "px";
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(vp.width * dpr);
      canvas.height = Math.floor(vp.height * dpr);
      canvas.style.width = vp.width + "px";
      canvas.style.height = vp.height + "px";
      wrap.appendChild(canvas);
      const label = document.createElement("span");
      label.className = "fm-page__no";
      label.textContent = tr("Seite {n}", { n });
      wrap.appendChild(label);
      pagesEl.appendChild(wrap);
      pages.push({ page, vp, vp1: base, wrap });
      wrap.addEventListener("click", (e) => addAt(n, e));
      // annotationMode DISABLE: die Felder zeichnen wir selbst (sonst stünden alte Werte doppelt da)
      await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null, annotationMode: pdfjsLib.AnnotationMode.DISABLE }).promise;

      const annots = await page.getAnnotations({ intent: "display" });
      for (const a of annots) {
        if (a.subtype !== "Widget" || !a.fieldName || a.fieldType === undefined) continue;
        if (a.fieldType === "Sig") continue; // Unterschriftsfelder: dafür gibt es „PDF unterschreiben“
        if (a.fieldType === "Btn" && a.pushButton) continue;
        const el = makeInput(a, vp);
        if (!el) continue;
        const [x1, y1, x2, y2] = vp.convertToViewportRectangle(a.rect);
        Object.assign(el.style, { left: Math.min(x1, x2) + "px", top: Math.min(y1, y2) + "px", width: Math.abs(x2 - x1) + "px", height: Math.abs(y2 - y1) + "px" });
        wrap.appendChild(el);
        count++;
      }
    }
    // Keine echten Formularfelder → Felder im Bild der Seiten suchen (Linien, Kästchen, Punktlinien)
    let detectedCount = 0;
    // Reines XFA-Formular (dynamisch, z. B. CERFA): keine Felder, die Seite zeigt nur „Please wait…“ → erklären statt raten
    const xfa = fields.size === 0 && (await isXfa());
    $("[data-xfa]").hidden = !xfa;
    $("[data-empty-detect]").hidden = xfa;
    if (fields.size === 0 && !xfa && window.PLFormDetect) {
      const busy = root.querySelector("[data-busy-text]");
      for (const pg of pages) {
        busy.textContent = tr("Felder werden erkannt … Seite {n} von {total}", { n: pages.indexOf(pg) + 1, total: pages.length });
        let found = [];
        try { found = await PLFormDetect.detect(pg.page); } catch (e) { console.warn(e); }
        for (const d of found) { addDetected(pages.indexOf(pg) + 1, d); detectedCount++; }
      }
    }
    root.classList.toggle("is-detected", detectedCount > 0);
    const names = fields.size;
    $("[data-empty]").hidden = names > 0;
    $("[data-save]").hidden = names === 0;
    if (!xfa) $("[data-empty]").querySelector("[data-empty-detect]").hidden = !window.PLFormDetect;
    $("[data-flatten]").closest("label").hidden = names === 0;
    $("[data-highlight]").closest("label").hidden = names === 0;
    $("[data-reset]").hidden = names === 0;
    $("[data-info]").textContent = detectedCount
      ? tr("{n} Felder automatisch erkannt. Prüfe sie: Überflüssige mit × löschen, fehlende mit „+ Textfeld“ ergänzen.", { n: detectedCount })
      : names
      ? (names === 1 ? tr("1 Feld gefunden – klicke hinein und tippe los.") : tr("{n} Felder gefunden – klicke hinein und tippe los.", { n: names }))
      : "";
    $("[data-save-empty]").hidden = detectedCount === 0;
    const note = $("[data-note]");
    note.hidden = true;
    if (names && doc.isPureXfa) {
      note.hidden = false;
      note.textContent = tr("Hinweis: Dieses Formular ist ein XFA-Formular. Die Felder werden ausgefüllt, das Aussehen kann aber in Adobe Reader etwas anders sein.");
    }
    pagesEl.classList.toggle("is-highlight", $("[data-highlight]").checked);
    void count;
  }

  async function isXfa() {
    try {
      const d = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
      const af = d.catalog.lookup(PDFLib.PDFName.of("AcroForm"));
      return !!(af && af.get(PDFLib.PDFName.of("XFA")));
    } catch (_) { return false; }
  }

  // ------------------------------------------------------------------ erkannte und selbst hinzugefügte Felder
  // Sie existieren noch nicht in der PDF: Wir bauen ein „Annotation“-Objekt wie von pdf.js,
  // damit makeInput() sie genauso anzeigt. Beim Speichern legt pdf-lib echte Formularfelder an.
  function uniqueName(label) {
    let base = (label || "").replace(/\./g, " ").replace(/\s+/g, " ").trim();
    if (!base) base = tr("Feld {n}", { n: ++counter });
    let name = base, i = 2;
    while (fields.has(name)) name = `${base} ${i++}`;
    return name;
  }
  function addDetected(pageNo, d) {
    const pg = pages[pageNo - 1];
    // Seitenkoordinaten (oben links) → PDF-Koordinaten (unten links, berücksichtigt Drehung und Beschnitt)
    const [ax, ay] = pg.vp1.convertToPdfPoint(d.rect[0], d.rect[1]);
    const [bx, by] = pg.vp1.convertToPdfPoint(d.rect[2], d.rect[3]);
    const rect = [Math.min(ax, bx), Math.min(ay, by), Math.max(ax, bx), Math.max(ay, by)];
    const name = uniqueName(d.label);
    const a = d.kind === "check"
      ? { fieldName: name, fieldType: "Btn", checkBox: true, exportValue: "Yes", fieldValue: "Off", rect }
      : { fieldName: name, fieldType: "Tx", multiLine: d.multiline, fieldValue: "", rect };
    const el = makeInput(a, pg.vp);
    const f = fields.get(name);
    f.detected = { page: pageNo, rect, kind: d.kind, multiline: !!d.multiline };
    // Hülle mit Löschknopf
    const box = document.createElement("div");
    box.className = "fm-det";
    const [x1, y1, x2, y2] = pg.vp.convertToViewportRectangle(rect);
    Object.assign(box.style, { left: Math.min(x1, x2) + "px", top: Math.min(y1, y2) + "px", width: Math.abs(x2 - x1) + "px", height: Math.abs(y2 - y1) + "px" });
    const del = document.createElement("button");
    del.type = "button";
    del.className = "fm-del";
    del.textContent = "×";
    del.title = tr("Feld löschen");
    del.setAttribute("aria-label", tr("Feld löschen") + ": " + name);
    del.addEventListener("click", (e) => { e.stopPropagation(); fields.delete(name); box.remove(); });
    box.append(el, del);
    pg.wrap.appendChild(box);
    return el;
  }
  function setAdding(kind) {
    adding = kind;
    pagesEl.classList.toggle("is-adding", !!kind);
    root.querySelectorAll("[data-add]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.add === kind)));
  }
  function addAt(pageNo, e) {
    if (!adding || e.target.closest(".fm-field, .fm-det")) return;
    const pg = pages[pageNo - 1];
    const r = pg.wrap.getBoundingClientRect();
    const k = pg.vp.scale; // Anzeige-Pixel pro PDF-Punkt
    const x = (e.clientX - r.left) / k, y = (e.clientY - r.top) / k;
    const d = adding === "check"
      ? { kind: "check", rect: [x - 6, y - 6, x + 6, y + 6] }
      : { kind: "text", rect: [x, y - 9, Math.min(x + 160, pg.vp1.width - 4), y + 9] };
    const el = addDetected(pageNo, { ...d, label: "" });
    setAdding(null);
    // erste Felder in einer PDF ohne Felder → Speichern-Knöpfe einblenden
    for (const sel of ["[data-save]", "[data-save-empty]", "[data-reset]"]) $(sel).hidden = false;
    for (const sel of ["[data-flatten]", "[data-highlight]"]) $(sel).closest("label").hidden = false;
    $("[data-empty]").hidden = true;
    el.focus();
  }

  // ------------------------------------------------------------------ Eingabefeld für ein PDF-Feld
  function field(a, type, extra) {
    if (!fields.has(a.fieldName)) fields.set(a.fieldName, { type, value: extra.value, options: extra.options || null, widgets: [] });
    return fields.get(a.fieldName);
  }
  function sync(name, value, except) {
    const f = fields.get(name);
    f.value = value;
    for (const w of f.widgets) {
      if (w === except) continue;
      if (w.type === "checkbox") w.checked = value === true || value === w.dataset.on;
      else if (w.type === "radio") w.checked = value === w.value;
      else w.value = value == null ? "" : value;
    }
  }

  function makeInput(a, vp) {
    const h = Math.abs(a.rect[3] - a.rect[1]) * vp.scale;
    let el;
    if (a.fieldType === "Tx") {
      const multi = !!a.multiLine;
      el = document.createElement(multi ? "textarea" : "input");
      if (!multi) el.type = a.password ? "password" : "text";
      if (a.maxLen) el.maxLength = a.maxLen;
      const f = field(a, "text", { value: a.fieldValue || "" });
      el.value = f.value || "";
      // Schriftgröße wie im PDF (0 = automatisch → an die Feldhöhe anpassen)
      const fs = a.textFormat?.fontSize || a.defaultAppearanceData?.fontSize || 0;
      // Mehrzeilig + automatisch: wie beim Speichern 10 pt (sonst wäre der Text riesig)
      const pt = multi && (!fs || fs > 16) ? 10 : fs;
      el.style.fontSize = (pt ? Math.min(pt * vp.scale, h * 0.8) : Math.max(9, Math.min(h * 0.62, 18))) + "px";
      if (a.comb && a.maxLen) el.classList.add("fm-comb"), (el.style.letterSpacing = `calc(${(Math.abs(a.rect[2] - a.rect[0]) * vp.scale) / a.maxLen}px - 0.6em)`);
      if (a.textAlignment === 1) el.style.textAlign = "center";
      if (a.textAlignment === 2) el.style.textAlign = "right";
      el.addEventListener("input", () => sync(a.fieldName, el.value, el));
      f.widgets.push(el);
    } else if (a.fieldType === "Btn" && a.checkBox) {
      el = document.createElement("input");
      el.type = "checkbox";
      el.dataset.on = a.exportValue || a.buttonValue || "Yes";
      const f = field(a, "check", { value: a.fieldValue && a.fieldValue !== "Off" ? a.fieldValue : false });
      el.checked = f.value === true || f.value === el.dataset.on;
      el.addEventListener("change", () => sync(a.fieldName, el.checked ? el.dataset.on : false, el));
      f.widgets.push(el);
    } else if (a.fieldType === "Btn" && a.radioButton) {
      el = document.createElement("input");
      el.type = "radio";
      el.name = "fm-" + a.fieldName;
      el.value = a.buttonValue;
      const f = field(a, "radio", { value: a.fieldValue && a.fieldValue !== "Off" ? a.fieldValue : null });
      el.checked = f.value === el.value;
      el.addEventListener("change", () => el.checked && sync(a.fieldName, el.value, el));
      f.widgets.push(el);
    } else if (a.fieldType === "Ch") {
      el = document.createElement("select");
      const list = !a.combo;
      if (list && a.multiSelect) el.multiple = true;
      const opts = (a.options || []).map((o) => ({ value: o.exportValue ?? o.displayValue, label: o.displayValue ?? o.exportValue }));
      if (!list) el.appendChild(new Option("", ""));
      for (const o of opts) el.appendChild(new Option(o.label, o.value));
      const cur = Array.isArray(a.fieldValue) ? a.fieldValue[0] : a.fieldValue;
      const f = field(a, "choice", { value: cur || "", options: opts });
      el.value = f.value || "";
      el.style.fontSize = Math.max(9, Math.min(h * 0.6, 16)) + "px";
      el.addEventListener("change", () => sync(a.fieldName, el.value, el));
      f.widgets.push(el);
    } else return null;
    el.classList.add("fm-field");
    if (a.readOnly) el.disabled = true;
    el.title = a.alternativeText || a.fieldName;
    el.setAttribute("aria-label", a.alternativeText || a.fieldName);
    return el;
  }

  // ------------------------------------------------------------------ Speichern
  async function save(empty) {
    const btn = $("[data-save]");
    btn.disabled = true;
    try {
      const { PDFDocument, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown, PDFOptionList, StandardFonts, PDFName, PDFBool } = PDFLib;
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const form = doc.getForm();
      // Hybrides XFA-Formular: XFA-Teil entfernen, sonst zeigt Adobe Reader die alten (leeren) XFA-Daten
      try { form.deleteXFA(); } catch (_) {}
      let filled = 0;
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const noFrame = { borderWidth: 0, borderColor: undefined, backgroundColor: undefined };
      for (const [name, f] of fields) {
        if (f.detected) {
          // neues Formularfeld genau an der erkannten Stelle anlegen (ohne Rahmen/Hintergrund, die Linien sind ja schon da)
          const d = f.detected;
          const page = doc.getPage(d.page - 1);
          const box = { x: d.rect[0], y: d.rect[1], width: d.rect[2] - d.rect[0], height: d.rect[3] - d.rect[1], ...noFrame };
          try {
            if (d.kind === "check") {
              const cb = form.createCheckBox(name);
              cb.addToPage(page, { ...box, textColor: undefined });
              if (f.value && !empty) { cb.check(); filled++; }
            } else {
              const tf = form.createTextField(name);
              if (d.multiline) tf.enableMultiline();
              tf.addToPage(page, { ...box, font });
              tf.setFontSize(d.multiline ? 10 : Math.max(7, Math.min(11, box.height * 0.62)));
              if (f.value && !empty) { tf.setText(String(f.value)); filled++; }
            }
          } catch (e) { console.warn("Feld", name, e); }
          continue;
        }
        let pf;
        try { pf = form.getField(name); } catch (_) { continue; }
        try {
          if (pf instanceof PDFTextField) {
            // Mehrzeilig mit Größe „automatisch“ (0) oder riesig: pdf-lib würde den Text so groß wie möglich machen → 10 pt
            const m = /([\d.]+)\s+Tf/.exec(pf.acroField.getDefaultAppearance() || "");
            const size = m ? parseFloat(m[1]) : 0;
            if (pf.isMultiline() && (!size || size > 16)) pf.setFontSize(10);
            pf.setText(f.value ? String(f.value) : undefined);
            if (f.value) filled++;
          }
          else if (pf instanceof PDFCheckBox) { f.value ? pf.check() : pf.uncheck(); if (f.value) filled++; }
          else if (pf instanceof PDFRadioGroup) {
            // pdf.js liefert den Zustand des Widgets („0“, „1“ …), pdf-lib erwartet den Optionsnamen (/Opt) → über den Widget-Index zuordnen
            const opts = pf.getOptions();
            let opt = opts.includes(f.value) ? f.value : null;
            if (!opt && f.value) {
              const i = pf.acroField.getWidgets().findIndex((w) => { const on = w.getOnValue(); return on && on.decodeText() === f.value; });
              if (i >= 0) opt = opts[i];
            }
            if (opt) { pf.select(opt); filled++; } else pf.clear();
          }
          else if (pf instanceof PDFDropdown) { if (f.value) { pf.select(f.value, true); filled++; } else pf.clear(); }
          else if (pf instanceof PDFOptionList) { if (f.value) { pf.select(f.value); filled++; } else pf.clear(); }
        } catch (e) {
          console.warn("Feld", name, e);
        }
      }
      // Aussehen der Felder neu erzeugen. Zeichen außerhalb von Helvetica (z. B. ğ, ł, Kyrillisch)
      // kann pdf-lib nicht zeichnen – dann übernimmt der PDF-Viewer das (NeedAppearances).
      let appearancesOk = true;
      try { form.updateFieldAppearances(font); } catch (e) {
        appearancesOk = false;
        form.acroForm.dict.set(PDFName.of("NeedAppearances"), PDFBool.True);
      }
      const flatten = !empty && $("[data-flatten]").checked;
      if (flatten) {
        if (!appearancesOk) throw new Error("chars");
        form.flatten();
        // pdf-lib lässt beim Fixieren manchmal Verweise auf gelöschte Widgets in /Annots stehen → entfernen
        const { PDFArray, PDFRef } = PDFLib;
        for (const page of doc.getPages()) {
          const annots = page.node.lookupMaybe(PDFName.of("Annots"), PDFArray);
          if (!annots) continue;
          for (let i = annots.size() - 1; i >= 0; i--) {
            const ref = annots.get(i);
            if (ref instanceof PDFRef && !doc.context.lookup(ref)) annots.remove(i);
          }
          if (annots.size() === 0) page.node.delete(PDFName.of("Annots"));
        }
      }
      const out = await doc.save();
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      downloadUrl = URL.createObjectURL(new Blob([out], { type: "application/pdf" }));
      const a = $("[data-download]");
      a.href = downloadUrl;
      a.download = fileName.replace(/\.pdf$/i, "") + tr(empty ? "_ausfuellbar.pdf" : flatten ? "_fixiert.pdf" : "_ausgefuellt.pdf");
      $("[data-done-info]").textContent = empty
        ? tr("Deine PDF ist jetzt ein ausfüllbares Formular mit {n} Feldern – in jedem PDF-Programm und auch hier ausfüllbar.", { n: fields.size })
        : (filled === 1 ? tr("1 Feld ausgefüllt.") : tr("{n} Felder ausgefüllt.", { n: filled })) + (flatten ? " " + tr("Das Formular ist fixiert und kann nicht mehr geändert werden.") : " " + tr("Die Felder bleiben bearbeitbar."));
      show("done");
    } catch (e) {
      console.error(e);
      alert(e.message === "chars"
        ? tr("Einige Zeichen können in einem fixierten Formular nicht dargestellt werden. Speichere ohne „Formular fixieren“.")
        : tr("Die PDF konnte nicht gespeichert werden. Bitte versuche es erneut."));
    } finally {
      btn.disabled = false;
    }
  }

  $("[data-save]").addEventListener("click", () => save(false));
  $("[data-save-empty]").addEventListener("click", () => save(true));
  root.querySelectorAll("[data-add]").forEach((b) => b.addEventListener("click", () => setAdding(adding === b.dataset.add ? null : b.dataset.add)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && adding && setAdding(null));
  $("[data-back]").addEventListener("click", () => show("work"));
  $("[data-other]").addEventListener("click", () => { input.value = ""; show("pick"); });
  $("[data-highlight]").addEventListener("change", (e) => pagesEl.classList.toggle("is-highlight", e.target.checked));
  $("[data-reset]").addEventListener("click", () => {
    if (!confirm(tr("Alle Eingaben löschen?"))) return;
    for (const [name, f] of fields) sync(name, f.type === "check" ? false : f.type === "radio" ? null : "", null);
  });
})();

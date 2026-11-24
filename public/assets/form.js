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
  let fields = new Map(); // Feldname → { type, value, options, widgets: [HTML-Elemente] }
  let downloadUrl = null;

  // ------------------------------------------------------------------ Datei laden
  const drop = $("[data-drop]");
  ["dragover", "dragenter"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("is-over"); }));
  ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, () => drop.classList.remove("is-over")));
  drop.addEventListener("drop", (e) => { e.preventDefault(); if (e.dataTransfer.files[0]) open(e.dataTransfer.files[0]); });
  input.addEventListener("change", () => input.files[0] && open(input.files[0]));

  async function open(file) {
    if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") return alert(tr("Bitte wähle eine PDF-Datei aus."));
    if (file.size > 50 * 1024 * 1024) return alert(tr("Die Datei ist größer als 50 MB."));
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
    const names = fields.size;
    $("[data-empty]").hidden = names > 0;
    $("[data-save]").hidden = names === 0;
    $("[data-flatten]").closest("label").hidden = names === 0;
    $("[data-highlight]").closest("label").hidden = names === 0;
    $("[data-reset]").hidden = names === 0;
    $("[data-info]").textContent = names
      ? (names === 1 ? tr("1 Feld gefunden – klicke hinein und tippe los.") : tr("{n} Felder gefunden – klicke hinein und tippe los.", { n: names }))
      : "";
    const note = $("[data-note]");
    note.hidden = true;
    if (names && doc.isPureXfa) {
      note.hidden = false;
      note.textContent = tr("Hinweis: Dieses Formular ist ein XFA-Formular. Die Felder werden ausgefüllt, das Aussehen kann aber in Adobe Reader etwas anders sein.");
    }
    pagesEl.classList.toggle("is-highlight", $("[data-highlight]").checked);
    void count;
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
  async function save() {
    const btn = $("[data-save]");
    btn.disabled = true;
    try {
      const { PDFDocument, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown, PDFOptionList, StandardFonts, PDFName, PDFBool } = PDFLib;
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const form = doc.getForm();
      // Hybrides XFA-Formular: XFA-Teil entfernen, sonst zeigt Adobe Reader die alten (leeren) XFA-Daten
      try { form.deleteXFA(); } catch (_) {}
      let filled = 0;
      for (const [name, f] of fields) {
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
      const font = await doc.embedFont(StandardFonts.Helvetica);
      let appearancesOk = true;
      try { form.updateFieldAppearances(font); } catch (e) {
        appearancesOk = false;
        form.acroForm.dict.set(PDFName.of("NeedAppearances"), PDFBool.True);
      }
      const flatten = $("[data-flatten]").checked;
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
      a.download = fileName.replace(/\.pdf$/i, "") + tr(flatten ? "_fixiert.pdf" : "_ausgefuellt.pdf");
      $("[data-done-info]").textContent = (filled === 1 ? tr("1 Feld ausgefüllt.") : tr("{n} Felder ausgefüllt.", { n: filled })) + (flatten ? " " + tr("Das Formular ist fixiert und kann nicht mehr geändert werden.") : " " + tr("Die Felder bleiben bearbeitbar."));
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

  $("[data-save]").addEventListener("click", save);
  $("[data-back]").addEventListener("click", () => show("work"));
  $("[data-other]").addEventListener("click", () => { input.value = ""; show("pick"); });
  $("[data-highlight]").addEventListener("change", (e) => pagesEl.classList.toggle("is-highlight", e.target.checked));
  $("[data-reset]").addEventListener("click", () => {
    if (!confirm(tr("Alle Eingaben löschen?"))) return;
    for (const [name, f] of fields) sync(name, f.type === "check" ? false : f.type === "radio" ? null : "", null);
  });
})();

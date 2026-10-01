/* PDF Libre – Werkzeug-Logik
 *
 * Ein Skript für alle Werkzeug-Seiten. Die Seite beschreibt über data-Attribute,
 * was das Werkzeug kann (siehe site/templates.js → workspace()).
 * Browser-Werkzeuge nutzen pdf-lib (bearbeiten) und pdf.js (Vorschau/Rendern).
 */
(() => {
  "use strict";

  const root = document.querySelector(".tool");
  if (!root) return;

  const cfg = root.dataset;
  const form = root.querySelector("form");
  const $ = (sel) => root.querySelector(sel);
  const $$ = (sel) => Array.from(root.querySelectorAll(sel));

  const stages = {
    pick: $(".stage--pick"),
    work: $(".stage--work"),
    busy: $(".stage--busy"),
    done: $(".stage--done"),
  };

  const state = {
    files: [], // { id, file }
    pages: [], // { index, rotation, selected, el }
    pdfBytes: null,
    pdfDoc: null, // pdf.js-Dokument
    pageCount: 0,
    resultUrl: null,
  };

  let uid = 0;

  // -------------------------------------------------------------------------
  // Hilfsfunktionen
  // -------------------------------------------------------------------------
  const SVG = {
    handle: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>',
    rotate: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12a7 7 0 1 1-2.05-4.95"/><path d="M19 4v4h-4"/></svg>',
    trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg>',
  };

  function show(name) {
    for (const [k, el] of Object.entries(stages)) el.hidden = k !== name;
  }

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
  }

  function baseName(name) {
    return name.replace(/\.[^.]+$/, "") || "datei";
  }

  function showError(msg) {
    const el = $("[data-error]");
    el.textContent = msg;
    el.hidden = !msg;
  }

  function fail(msg) {
    show("work");
    showError(msg);
  }

  function acceptList() {
    return cfg.accept.split(",").map((s) => s.trim().toLowerCase());
  }

  function isAccepted(file) {
    const list = acceptList();
    const ext = "." + file.name.split(".").pop().toLowerCase();
    return list.includes(ext) || (file.type && list.includes(file.type.toLowerCase()));
  }

  /** "1-3, 5" → [0,1,2,4] (0-basiert). Wirft Fehler mit verständlicher Meldung. */
  function parsePages(text, max) {
    const out = [];
    for (const part of text.split(/[,;\s]+/).filter(Boolean)) {
      const m = part.match(/^(\d+)(?:-(\d*))?$/);
      if (!m) throw new Error(`„${part}“ ist keine gültige Seitenangabe.`);
      const a = Number(m[1]);
      const b = m[2] === undefined ? a : m[2] === "" ? max : Number(m[2]);
      if (a < 1 || b < 1 || a > max || b > max) throw new Error(`Die PDF hat nur ${max} Seiten – „${part}“ liegt außerhalb.`);
      if (a > b) throw new Error(`Im Bereich „${part}“ muss die erste Zahl kleiner sein.`);
      for (let i = a; i <= b; i++) out.push(i - 1);
    }
    return out;
  }

  function parseRanges(text, max) {
    const ranges = text
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((part) => parsePages(part.replace(/\s+/g, ""), max));
    if (!ranges.length) throw new Error("Bitte gib mindestens einen Seitenbereich an, z. B. 1-3.");
    return ranges;
  }

  function values() {
    const data = {};
    for (const el of form.elements) {
      if (!el.name || el.closest("[hidden]")) continue;
      if (el.type === "radio" && !el.checked) continue;
      data[el.name] = el.value;
    }
    return data;
  }

  // -------------------------------------------------------------------------
  // Optionen: abhängige Felder und Regler
  // -------------------------------------------------------------------------
  function updateConditional() {
    const v = values();
    // Werte versteckter Felder separat lesen, damit Bedingungen stimmen
    for (const el of form.elements) {
      if (el.name && !(el.name in v) && (el.type !== "radio" || el.checked)) v[el.name] = el.value;
    }
    $$("[data-show-if]").forEach((el) => {
      const [, key, op, val] = el.dataset.showIf.match(/^(\w+)(!?=)(.*)$/);
      const match = op === "=" ? v[key] === val : v[key] !== val;
      el.hidden = !match;
    });
  }
  form.addEventListener("change", updateConditional);
  form.addEventListener("input", (e) => {
    if (e.target.type === "range") {
      const out = form.querySelector(`output[for="${e.target.id}"]`);
      if (out) out.textContent = e.target.value + (out.dataset.unit || "");
    }
    if (e.target.getAttribute("aria-invalid")) e.target.removeAttribute("aria-invalid");
    if (e.target.name === "pages") syncPagesFromInput();
  });
  updateConditional();

  // -------------------------------------------------------------------------
  // Datei-Auswahl & Drag and Drop
  // -------------------------------------------------------------------------
  root.querySelectorAll('input[type="file"]').forEach((input) =>
    input.addEventListener("change", () => {
      addFiles(Array.from(input.files));
      input.value = "";
    })
  );

  const drop = $("[data-drop]");
  ["dragenter", "dragover"].forEach((t) =>
    root.addEventListener(t, (e) => {
      if (!e.dataTransfer || !Array.from(e.dataTransfer.types).includes("Files")) return;
      e.preventDefault();
      drop.classList.add("is-over");
    })
  );
  ["dragleave", "drop"].forEach((t) =>
    root.addEventListener(t, (e) => {
      if (t === "dragleave" && root.contains(e.relatedTarget)) return;
      drop.classList.remove("is-over");
    })
  );
  root.addEventListener("drop", (e) => {
    if (!e.dataTransfer || !e.dataTransfer.files.length) return;
    e.preventDefault();
    addFiles(Array.from(e.dataTransfer.files));
  });

  async function addFiles(list) {
    showError("");
    const ok = list.filter(isAccepted);
    const rejected = list.length - ok.length;
    if (!ok.length) {
      alertInline(`Dieser Dateityp wird hier nicht unterstützt. Erlaubt: ${cfg.accept.split(",").filter((s) => s.startsWith(".")).join(", ")}`);
      return;
    }
    if (cfg.multiple !== "true") {
      state.files = [];
      ok.splice(1);
    }
    for (const file of ok) state.files.push({ id: ++uid, file });
    show("work");
    if (rejected) showError(`${rejected} Datei(en) wurden übersprungen, weil der Dateityp nicht passt.`);

    if (cfg.preview === "pages") await loadPages(state.files[0].file);
    else renderFileList();
    updateSummary();
  }

  function alertInline(msg) {
    let el = stages.pick.querySelector(".form-error");
    if (!el) {
      el = document.createElement("p");
      el.className = "form-error";
      el.setAttribute("role", "alert");
      stages.pick.appendChild(el);
    }
    el.textContent = msg;
    setTimeout(() => el.remove(), 6000);
  }

  // -------------------------------------------------------------------------
  // Dateiliste (Server-Werkzeuge, Bilder in PDF, Seitenzahlen, Wasserzeichen)
  // -------------------------------------------------------------------------
  function renderFileList() {
    const ul = $("[data-files]");
    ul.innerHTML = "";
    if (cfg.sortable === "true" && state.files.length > 1) ul.setAttribute("data-sortable", "");
    else ul.removeAttribute("data-sortable");

    for (const { id, file } of state.files) {
      const li = document.createElement("li");
      li.className = "file";
      li.dataset.id = id;
      const isImage = /^image\//.test(file.type);
      const thumb = isImage ? `<img class="file__thumb" alt="" src="${URL.createObjectURL(file)}">` : `<span class="file__thumb" aria-hidden="true">${escapeHtml(file.name.split(".").pop().toUpperCase().slice(0, 4))}</span>`;
      li.innerHTML = `<span class="file__handle">${SVG.handle}</span>${thumb}
        <span class="file__meta"><span class="file__name"></span><span class="file__size">${formatSize(file.size)}</span></span>
        <button type="button" class="icon-btn" aria-label="Entfernen">${SVG.x}</button>`;
      li.querySelector(".file__name").textContent = file.name;
      li.querySelector(".icon-btn").addEventListener("click", () => {
        state.files = state.files.filter((f) => f.id !== id);
        if (!state.files.length) return reset();
        renderFileList();
        updateSummary();
      });
      ul.appendChild(li);
    }

    if (cfg.sortable === "true" && window.Sortable && !ul._sortable) {
      ul._sortable = Sortable.create(ul, {
        animation: 150,
        ghostClass: "sortable-ghost",
        onEnd: () => {
          const order = Array.from(ul.children).map((li) => Number(li.dataset.id));
          state.files.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
        },
      });
    }
  }

  // -------------------------------------------------------------------------
  // Seitenvorschau mit pdf.js
  // -------------------------------------------------------------------------
  if (window.pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc = "/vendor/pdf.worker.min.js";

  async function loadPages(file) {
    const grid = $("[data-pages]");
    grid.innerHTML = '<p class="pages__loading">Seiten werden geladen …</p>';
    state.pages = [];
    try {
      state.pdfBytes = new Uint8Array(await file.arrayBuffer());
      // Kopie übergeben: pdf.js übernimmt den Puffer
      state.pdfDoc = await pdfjsLib.getDocument({ data: state.pdfBytes.slice(), isEvalSupported: false }).promise;
    } catch (e) {
      grid.innerHTML = "";
      if (e && e.name === "PasswordException") return fail("Diese PDF ist passwortgeschützt. Entsperre sie zuerst mit „PDF entsperren“.");
      return fail("Die PDF konnte nicht geöffnet werden. Ist die Datei beschädigt?");
    }
    state.pageCount = state.pdfDoc.numPages;
    grid.innerHTML = "";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            queueThumb(entry.target);
          }
        }
      },
      { rootMargin: "300px" }
    );

    for (let i = 0; i < state.pageCount; i++) {
      const p = { index: i, rotation: 0, selected: false, el: null };
      const el = document.createElement("div");
      el.className = "page";
      el.dataset.index = i;
      el.tabIndex = 0;
      el.setAttribute("role", cfg.select === "organize" ? "listitem" : "button");
      el.innerHTML = `<span class="page__mark">${SVG.check}</span><div class="page__canvas"></div><span class="page__num">${i + 1}</span>`;
      if (cfg.select === "organize") {
        const tools = document.createElement("div");
        tools.className = "page__tools";
        tools.innerHTML = `<button type="button" class="icon-btn" data-page-action="rotate" aria-label="Seite ${i + 1} drehen">${SVG.rotate}</button><button type="button" class="icon-btn" data-page-action="delete" aria-label="Seite ${i + 1} löschen">${SVG.trash}</button>`;
        el.appendChild(tools);
      }
      p.el = el;
      state.pages.push(p);
      grid.appendChild(el);
      observer.observe(el);
    }

    if (cfg.select === "organize" && window.Sortable) {
      Sortable.create(grid, { animation: 150, ghostClass: "sortable-ghost", filter: ".icon-btn", preventOnFilter: false });
    }
  }

  const thumbQueue = [];
  let thumbBusy = false;
  function queueThumb(el) {
    thumbQueue.push(el);
    if (!thumbBusy) drainThumbs();
  }
  async function drainThumbs() {
    thumbBusy = true;
    while (thumbQueue.length) {
      const el = thumbQueue.shift();
      const doc = state.pdfDoc;
      if (!doc || !el.isConnected) continue;
      try {
        const page = await doc.getPage(Number(el.dataset.index) + 1);
        const base = page.getViewport({ scale: 1 });
        const scale = (150 * (window.devicePixelRatio || 1)) / Math.max(base.width, base.height);
        const vp = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(vp.width);
        canvas.height = Math.ceil(vp.height);
        await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
        if (doc !== state.pdfDoc) continue;
        el.querySelector(".page__canvas").replaceChildren(canvas);
        applyRotationStyle(state.pages[Number(el.dataset.index)]);
      } catch {
        /* Vorschau ist optional */
      }
    }
    thumbBusy = false;
  }

  function applyRotationStyle(p) {
    const c = p.el.querySelector("canvas");
    if (c) c.style.transform = `rotate(${p.rotation}deg) scale(${p.rotation % 180 ? 0.77 : 1})`;
  }

  // Klick auf Seiten
  root.addEventListener("click", (e) => {
    const pageEl = e.target.closest(".page");
    if (!pageEl) return;
    const p = state.pages[Number(pageEl.dataset.index)];
    const action = e.target.closest("[data-page-action]")?.dataset.pageAction;

    if (cfg.select === "organize") {
      if (action === "rotate") {
        p.rotation = (p.rotation + 90) % 360;
        applyRotationStyle(p);
      } else if (action === "delete") {
        p.deleted = true;
        pageEl.remove();
        if (!visiblePages().length) return reset();
      }
    } else if (cfg.select === "rotate") {
      p.rotation = (p.rotation + 90) % 360;
      applyRotationStyle(p);
    } else if (cfg.select === "remove" || cfg.select === "keep") {
      p.selected = !p.selected;
      pageEl.classList.toggle("is-selected", p.selected);
      pageEl.setAttribute("aria-pressed", String(p.selected));
    }
    updateSummary();
  });
  root.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("page")) {
      e.preventDefault();
      e.target.click();
    }
  });

  function visiblePages() {
    return Array.from(root.querySelectorAll("[data-pages] .page")).map((el) => state.pages[Number(el.dataset.index)]);
  }

  // Seitenzahlen-Eingabe → Auswahl in der Vorschau
  function syncPagesFromInput() {
    const input = form.elements.pages;
    if (!input || !state.pageCount) return;
    let idx = [];
    try {
      idx = parsePages(input.value, state.pageCount);
    } catch {
      return; // noch unvollständige Eingabe
    }
    const set = new Set(idx);
    state.pages.forEach((p) => {
      p.selected = set.has(p.index);
      p.el.classList.toggle("is-selected", p.selected);
    });
    updateSummary();
  }

  // Werkzeugleiste (PDF drehen)
  root.addEventListener("click", (e) => {
    const a = e.target.closest("[data-action]")?.dataset.action;
    if (!a) return;
    if (a === "reset") return reset();
    if (a.startsWith("rotate-")) {
      const delta = { "rotate-all-left": 270, "rotate-all-right": 90, "rotate-reset": null }[a];
      state.pages.forEach((p) => {
        p.rotation = delta === null ? 0 : (p.rotation + delta) % 360;
        applyRotationStyle(p);
      });
      updateSummary();
    }
  });

  function updateSummary() {
    const el = $("[data-summary]");
    if (cfg.preview === "pages") {
      const n = state.pageCount;
      let text = `${n} ${n === 1 ? "Seite" : "Seiten"}`;
      if (cfg.select === "remove" || cfg.select === "keep") {
        const s = state.pages.filter((p) => p.selected).length;
        if (s) text += ` · ${s} ausgewählt`;
      }
      if (cfg.select === "rotate") {
        const r = state.pages.filter((p) => p.rotation).length;
        if (r) text += ` · ${r} gedreht`;
      }
      if (cfg.select === "organize") {
        const left = visiblePages().length;
        if (left !== n) text = `${left} von ${n} Seiten`;
      }
      el.textContent = text;
    } else {
      const total = state.files.reduce((s, f) => s + f.file.size, 0);
      el.textContent = `${state.files.length} ${state.files.length === 1 ? "Datei" : "Dateien"} · ${formatSize(total)}`;
    }
  }

  // -------------------------------------------------------------------------
  // Absenden
  // -------------------------------------------------------------------------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    showError("");
    const min = Number(cfg.min || 1);
    if (state.files.length < min) return showError(`Bitte wähle mindestens ${min} Dateien aus.`);

    const v = values();
    if (form.elements.password2 && v.password !== v.password2) {
      form.elements.password2.setAttribute("aria-invalid", "true");
      return showError("Die Passwörter stimmen nicht überein.");
    }
    for (const el of form.elements) {
      if (el.required && !el.closest("[hidden]") && !el.value) {
        el.setAttribute("aria-invalid", "true");
        el.focus();
        return showError("Bitte fülle alle Pflichtfelder aus.");
      }
    }

    try {
      if (cfg.mode === "server") await runServer(v);
      else {
        startBusy("Wird in deinem Browser verarbeitet …");
        await nextFrame();
        const handler = HANDLERS[cfg.tool];
        const result = await handler(v);
        finish(result);
      }
    } catch (err) {
      console.error(err);
      fail(err && err.userMessage ? err.userMessage : err && err.message && !/^[A-Z][a-zA-Z]+Error/.test(err.name || "") ? err.message : "Das hat leider nicht geklappt. Ist die Datei beschädigt?");
    }
  });

  const nextFrame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));

  function startBusy(text, determinate = false) {
    show("busy");
    $("[data-busy-text]").textContent = text;
    const bar = $(".busy__bar");
    bar.classList.toggle("is-indeterminate", !determinate);
    $("[data-progress]").style.width = determinate ? "0%" : "";
  }

  function setProgress(pct, text) {
    $(".busy__bar").classList.remove("is-indeterminate");
    $("[data-progress]").style.width = pct + "%";
    if (text) $("[data-busy-text]").textContent = text;
  }

  function runServer(v) {
    return new Promise((resolve, reject) => {
      const fd = new FormData();
      // Textfelder zuerst, damit der Server sie vor den Dateien kennt
      for (const [k, val] of Object.entries(v)) {
        const el = form.elements[k];
        if (el && (el.closest?.("[data-no-send]") || el.type === "file")) continue;
        fd.append(k, val);
      }
      for (const { file } of state.files) fd.append("file", file, file.name);

      startBusy("Wird hochgeladen …", true);
      const xhr = new XMLHttpRequest();
      xhr.open("POST", cfg.endpoint);
      xhr.responseType = "blob";
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100), `Wird hochgeladen … ${Math.round((e.loaded / e.total) * 100)} %`);
      };
      xhr.upload.onload = () => startBusy("Wird verarbeitet …");
      xhr.onerror = () => reject(Object.assign(new Error(), { userMessage: "Keine Verbindung zum Server. Prüfe deine Internetverbindung." }));
      xhr.onload = async () => {
        if (xhr.status !== 200) {
          let msg = "Bei der Verarbeitung ist ein Fehler aufgetreten.";
          try {
            msg = JSON.parse(await xhr.response.text()).error || msg;
          } catch {
            /* keine JSON-Antwort */
          }
          return reject(Object.assign(new Error(), { userMessage: msg }));
        }
        const filename = filenameFromHeader(xhr.getResponseHeader("Content-Disposition")) || "ergebnis.pdf";
        const before = Number(xhr.getResponseHeader("X-Original-Size"));
        const after = Number(xhr.getResponseHeader("X-Result-Size"));
        let info = "";
        if (cfg.savings === "true" && before && after) {
          const saved = Math.round((1 - after / before) * 100);
          info =
            saved > 0
              ? `Von ${formatSize(before)} auf ${formatSize(after)} verkleinert – <strong>${saved} % gespart</strong>.`
              : `Diese PDF ist bereits gut optimiert (${formatSize(after)}). Eine stärkere Stufe kann noch etwas bringen.`;
        }
        finish({ blob: xhr.response, filename, info });
        resolve();
      };
      xhr.send(fd);
    });
  }

  function filenameFromHeader(h) {
    if (!h) return null;
    const star = h.match(/filename\*=UTF-8''([^;]+)/i);
    if (star) return decodeURIComponent(star[1]);
    const plain = h.match(/filename="?([^";]+)"?/i);
    return plain ? plain[1] : null;
  }

  function finish({ blob, filename, info = "" }) {
    if (state.resultUrl) URL.revokeObjectURL(state.resultUrl);
    state.resultUrl = URL.createObjectURL(blob);
    const a = $("[data-download]");
    a.href = state.resultUrl;
    a.download = filename;
    a.textContent = `${filename.toLowerCase().endsWith(".zip") ? "ZIP" : "Datei"} herunterladen (${formatSize(blob.size)})`;
    $("[data-done-info]").innerHTML = info || escapeHtml(filename);
    show("done");
    $(".done__title").focus();
    a.click(); // Download direkt starten
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  }

  function reset() {
    state.files = [];
    state.pages = [];
    state.pdfBytes = null;
    if (state.pdfDoc) state.pdfDoc.destroy();
    state.pdfDoc = null;
    state.pageCount = 0;
    thumbQueue.length = 0;
    const pages = $("[data-pages]");
    if (pages) pages.innerHTML = "";
    const files = $("[data-files]");
    if (files) files.innerHTML = "";
    showError("");
    show("pick");
  }

  // -------------------------------------------------------------------------
  // Browser-Werkzeuge
  // -------------------------------------------------------------------------
  const PDFLib = window.PDFLib;

  async function loadPdfLib(bytes) {
    try {
      return await PDFLib.PDFDocument.load(bytes);
    } catch (e) {
      if (/encrypt/i.test(e.message)) {
        throw Object.assign(new Error(), { userMessage: "Diese PDF ist verschlüsselt. Entsperre sie zuerst mit „PDF entsperren“." });
      }
      throw Object.assign(new Error(), { userMessage: "Die PDF konnte nicht gelesen werden. Ist die Datei beschädigt?" });
    }
  }

  async function sourceBytes() {
    return state.pdfBytes || new Uint8Array(await state.files[0].file.arrayBuffer());
  }

  async function pagesToPdf(src, indices, rotations = {}) {
    const out = await PDFLib.PDFDocument.create();
    const copied = await out.copyPages(src, indices);
    copied.forEach((p, i) => {
      const extra = rotations[indices[i]] || 0;
      if (extra) p.setRotation(PDFLib.degrees((p.getRotation().angle + extra) % 360));
      out.addPage(p);
    });
    return out.save();
  }

  function pdfBlob(bytes) {
    return new Blob([bytes], { type: "application/pdf" });
  }

  async function zipResult(files, zipName) {
    if (files.length === 1) return { blob: files[0].blob, filename: files[0].name };
    const zip = new JSZip();
    files.forEach((f) => zip.file(f.name, f.blob));
    const blob = await zip.generateAsync({ type: "blob" }, (m) => setProgress(Math.round(m.percent), "ZIP wird erstellt …"));
    return { blob, filename: zipName };
  }

  function selectedIndices(v) {
    const set = new Set(state.pages.filter((p) => p.selected).map((p) => p.index));
    if (v.pages) parsePages(v.pages, state.pageCount).forEach((i) => set.add(i));
    return Array.from(set).sort((a, b) => a - b);
  }

  /** Wandelt eine sichtbare Position (auch bei gedrehten Seiten) in PDF-Koordinaten um. */
  function placer(page) {
    const { width: w, height: h } = page.getSize();
    const box = page.getMediaBox();
    const r = ((page.getRotation().angle % 360) + 360) % 360;
    const vw = r % 180 ? h : w;
    const vh = r % 180 ? w : h;
    function map(vx, vy) {
      let x, y;
      if (r === 90) { x = w - vy; y = vx; }
      else if (r === 180) { x = w - vx; y = h - vy; }
      else if (r === 270) { x = vy; y = h - vx; }
      else { x = vx; y = vy; }
      return { x: x + box.x, y: y + box.y };
    }
    return { vw, vh, rot: r, map };
  }

  const PAGE_SIZES = { a4: [595.28, 841.89], letter: [612, 792] };

  async function imageToEmbeddable(file) {
    // JPGs über ein Canvas normalisieren: berücksichtigt die EXIF-Drehung von Handyfotos
    if (/png$/i.test(file.type) || /\.png$/i.test(file.name)) {
      return { type: "png", bytes: new Uint8Array(await file.arrayBuffer()) };
    }
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const canvas = document.createElement("canvas");
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bmp, 0, 0);
    bmp.close?.();
    const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.92));
    return { type: "jpg", bytes: new Uint8Array(await blob.arrayBuffer()) };
  }

  const COLORS = { gray: [0.45, 0.47, 0.52], red: [0.78, 0.2, 0.17], blue: [0.17, 0.29, 0.86] };

  const HANDLERS = {
    // ----- PDF teilen
    async split(v) {
      const src = await loadPdfLib(await sourceBytes());
      const n = src.getPageCount();
      let groups;
      if (v.mode === "every") groups = Array.from({ length: n }, (_, i) => [i]);
      else if (v.mode === "chunks") {
        const size = Math.max(1, parseInt(v.chunk, 10) || 1);
        groups = [];
        for (let i = 0; i < n; i += size) groups.push(Array.from({ length: Math.min(size, n - i) }, (_, k) => i + k));
      } else groups = parseRanges(v.ranges || "", n);

      const base = baseName(state.files[0].file.name);
      const files = [];
      for (let g = 0; g < groups.length; g++) {
        setProgress(Math.round((g / groups.length) * 100), `Teil ${g + 1} von ${groups.length} …`);
        const idx = groups[g];
        const label = idx.length === 1 ? `${idx[0] + 1}` : `${idx[0] + 1}-${idx[idx.length - 1] + 1}`;
        files.push({ name: `${base}_Seite_${label}.pdf`, blob: pdfBlob(await pagesToPdf(src, idx)) });
      }
      const res = await zipResult(files, `${base}_geteilt.zip`);
      return { ...res, info: `${files.length} ${files.length === 1 ? "Datei" : "Dateien"} erstellt.` };
    },

    // ----- Seiten entfernen
    async "remove-pages"(v) {
      const remove = new Set(selectedIndices(v));
      if (!remove.size) throw Object.assign(new Error(), { userMessage: "Wähle mindestens eine Seite zum Entfernen aus." });
      if (remove.size >= state.pageCount) throw Object.assign(new Error(), { userMessage: "Du kannst nicht alle Seiten entfernen." });
      const src = await loadPdfLib(await sourceBytes());
      const keep = [...Array(state.pageCount).keys()].filter((i) => !remove.has(i));
      const bytes = await pagesToPdf(src, keep);
      return {
        blob: pdfBlob(bytes),
        filename: `${baseName(state.files[0].file.name)}_bearbeitet.pdf`,
        info: `${remove.size} ${remove.size === 1 ? "Seite" : "Seiten"} entfernt, ${keep.length} übrig.`,
      };
    },

    // ----- Seiten extrahieren
    async "extract-pages"(v) {
      const idx = selectedIndices(v);
      if (!idx.length) throw Object.assign(new Error(), { userMessage: "Wähle mindestens eine Seite aus." });
      const src = await loadPdfLib(await sourceBytes());
      const base = baseName(state.files[0].file.name);
      if (v.output === "separate") {
        const files = [];
        for (const i of idx) files.push({ name: `${base}_Seite_${i + 1}.pdf`, blob: pdfBlob(await pagesToPdf(src, [i])) });
        return { ...(await zipResult(files, `${base}_Seiten.zip`)), info: `${idx.length} Seiten extrahiert.` };
      }
      return { blob: pdfBlob(await pagesToPdf(src, idx)), filename: `${base}_Auszug.pdf`, info: `${idx.length} ${idx.length === 1 ? "Seite" : "Seiten"} extrahiert.` };
    },

    // ----- Organisieren
    async organize() {
      const order = visiblePages();
      const src = await loadPdfLib(await sourceBytes());
      const rotations = Object.fromEntries(order.map((p) => [p.index, p.rotation]));
      const bytes = await pagesToPdf(src, order.map((p) => p.index), rotations);
      return { blob: pdfBlob(bytes), filename: `${baseName(state.files[0].file.name)}_organisiert.pdf`, info: `${order.length} Seiten gespeichert.` };
    },

    // ----- Drehen
    async rotate() {
      const rotated = state.pages.filter((p) => p.rotation);
      if (!rotated.length) throw Object.assign(new Error(), { userMessage: "Klicke zuerst auf die Seiten, die gedreht werden sollen, oder nutze „Alle nach rechts“." });
      const src = await loadPdfLib(await sourceBytes());
      src.getPages().forEach((page, i) => {
        const extra = state.pages[i].rotation;
        if (extra) page.setRotation(PDFLib.degrees((page.getRotation().angle + extra) % 360));
      });
      return { blob: pdfBlob(await src.save()), filename: `${baseName(state.files[0].file.name)}_gedreht.pdf`, info: `${rotated.length} ${rotated.length === 1 ? "Seite" : "Seiten"} gedreht.` };
    },

    // ----- Bilder in PDF
    async "jpg-to-pdf"(v) {
      const doc = await PDFLib.PDFDocument.create();
      const margin = Number(v.margin || 0);
      for (let i = 0; i < state.files.length; i++) {
        setProgress(Math.round((i / state.files.length) * 100), `Bild ${i + 1} von ${state.files.length} …`);
        const { file } = state.files[i];
        let img;
        try {
          const e = await imageToEmbeddable(file);
          img = e.type === "png" ? await doc.embedPng(e.bytes) : await doc.embedJpg(e.bytes);
        } catch {
          throw Object.assign(new Error(), { userMessage: `„${file.name}“ konnte nicht gelesen werden.` });
        }
        let pw, ph;
        if (v.pageSize === "fit") {
          pw = img.width * 0.75;
          ph = img.height * 0.75;
          doc.addPage([pw, ph]).drawImage(img, { x: 0, y: 0, width: pw, height: ph });
          continue;
        }
        [pw, ph] = PAGE_SIZES[v.pageSize] || PAGE_SIZES.a4;
        const landscape = v.orientation === "landscape" || (v.orientation === "auto" && img.width > img.height);
        if (landscape) [pw, ph] = [ph, pw];
        const page = doc.addPage([pw, ph]);
        const maxW = pw - 2 * margin;
        const maxH = ph - 2 * margin;
        const s = Math.min(maxW / img.width, maxH / img.height);
        const w = img.width * s;
        const h = img.height * s;
        page.drawImage(img, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
      }
      const name = state.files.length === 1 ? baseName(state.files[0].file.name) : "Bilder";
      return { blob: pdfBlob(await doc.save()), filename: `${name}.pdf`, info: `${state.files.length} ${state.files.length === 1 ? "Bild" : "Bilder"} in eine PDF umgewandelt.` };
    },

    // ----- PDF in Bilder
    async "pdf-to-jpg"(v) {
      const doc = state.pdfDoc;
      const dpi = Number(v.quality || 150);
      const type = v.format === "png" ? "image/png" : "image/jpeg";
      const ext = v.format === "png" ? "png" : "jpg";
      const base = baseName(state.files[0].file.name);
      const files = [];
      for (let i = 1; i <= doc.numPages; i++) {
        setProgress(Math.round(((i - 1) / doc.numPages) * 100), `Seite ${i} von ${doc.numPages} …`);
        const page = await doc.getPage(i);
        const base1 = page.getViewport({ scale: 1 });
        let scale = dpi / 72;
        const maxPixels = 16_000_000; // Grenze für Mobilgeräte
        if (base1.width * base1.height * scale * scale > maxPixels) scale = Math.sqrt(maxPixels / (base1.width * base1.height));
        const vp = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(vp.width);
        canvas.height = Math.floor(vp.height);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        const blob = await new Promise((r) => canvas.toBlob(r, type, 0.9));
        canvas.width = canvas.height = 0; // Speicher freigeben
        files.push({ name: `${base}_Seite_${String(i).padStart(String(doc.numPages).length, "0")}.${ext}`, blob });
      }
      return { ...(await zipResult(files, `${base}_Bilder.zip`)), info: `${files.length} ${files.length === 1 ? "Bild" : "Bilder"} erstellt.` };
    },

    // ----- Seitenzahlen
    async "page-numbers"(v) {
      const doc = await loadPdfLib(await sourceBytes());
      const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
      const size = Number(v.size || 12);
      const start = parseInt(v.start, 10) || 0;
      const skip = Math.max(0, parseInt(v.skip, 10) || 0);
      const pages = doc.getPages();
      if (skip >= pages.length) throw Object.assign(new Error(), { userMessage: "Es werden alle Seiten übersprungen – verringere „Erste Seiten ohne Zahl“." });
      const last = start + (pages.length - skip) - 1;
      const [vert, horiz] = v.position.split("-");
      const margin = 28;

      pages.forEach((page, i) => {
        if (i < skip) return;
        const n = start + (i - skip);
        const text = { n: `${n}`, "page-n": `Seite ${n}`, "n-of-total": `${n} / ${last}`, "page-n-of-total": `Seite ${n} von ${last}` }[v.format];
        const tw = font.widthOfTextAtSize(text, size);
        const P = placer(page);
        const vx = horiz === "left" ? margin : horiz === "right" ? P.vw - margin - tw : (P.vw - tw) / 2;
        const vy = vert === "top" ? P.vh - margin - size * 0.75 : margin;
        const { x, y } = P.map(vx, vy);
        page.drawText(text, { x, y, size, font, color: PDFLib.rgb(0.2, 0.22, 0.28), rotate: PDFLib.degrees(P.rot) });
      });
      return { blob: pdfBlob(await doc.save()), filename: `${baseName(state.files[0].file.name)}_nummeriert.pdf`, info: `Seitenzahlen auf ${pages.length - skip} Seiten eingefügt.` };
    },

    // ----- Wasserzeichen
    async watermark(v) {
      const text = (v.text || "").trim();
      if (!text) throw Object.assign(new Error(), { userMessage: "Bitte gib einen Text für das Wasserzeichen ein." });
      const doc = await loadPdfLib(await sourceBytes());
      const font = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
      let size = Number(v.size || 56);
      try {
        font.encodeText(text);
      } catch {
        throw Object.assign(new Error(), { userMessage: "Der Text enthält Zeichen, die nicht unterstützt werden (z. B. Emojis). Erlaubt sind lateinische Buchstaben inkl. Umlaute." });
      }
      const [r, g, b] = COLORS[v.color] || COLORS.gray;
      const opacity = Number(v.opacity || 20) / 100;
      const pages = doc.getPages();

      for (const page of pages) {
        const P = placer(page);
        const angle = v.position === "center" ? 0 : 45;
        let s = size;
        let tw = font.widthOfTextAtSize(text, s);
        // Text passt nicht auf die Seite → verkleinern
        const maxLen = angle ? Math.hypot(P.vw, P.vh) * 0.8 : P.vw * 0.85;
        if (tw > maxLen) {
          s = (s * maxLen) / tw;
          tw = font.widthOfTextAtSize(text, s);
        }
        const th = s * 0.7;
        const rad = (angle * Math.PI) / 180;
        const drawAt = (cx, cy) => {
          // Startpunkt so wählen, dass der Text um (cx, cy) zentriert ist
          const vx = cx - (tw / 2) * Math.cos(rad) + (th / 2) * Math.sin(rad);
          const vy = cy - (tw / 2) * Math.sin(rad) - (th / 2) * Math.cos(rad);
          const { x, y } = P.map(vx, vy);
          page.drawText(text, { x, y, size: s, font, color: PDFLib.rgb(r, g, b), opacity, rotate: PDFLib.degrees(P.rot + angle) });
        };
        if (v.position === "tile") {
          const stepX = tw * Math.cos(rad) + s * 3;
          const stepY = s * 5;
          for (let cy = stepY / 2; cy < P.vh + stepY; cy += stepY) {
            const offset = (Math.round(cy / stepY) % 2) * (stepX / 2);
            for (let cx = -stepX / 2 + offset; cx < P.vw + stepX; cx += stepX) drawAt(cx, cy);
          }
        } else {
          drawAt(P.vw / 2, P.vh / 2);
        }
      }
      return { blob: pdfBlob(await doc.save()), filename: `${baseName(state.files[0].file.name)}_Wasserzeichen.pdf`, info: `Wasserzeichen auf ${pages.length} ${pages.length === 1 ? "Seite" : "Seiten"} eingefügt.` };
    },
  };
})();

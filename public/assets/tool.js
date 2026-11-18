/* PDF Libre – Werkzeug-Logik
 *
 * Ein Skript für alle Werkzeug-Seiten. Die Seite beschreibt über data-Attribute,
 * was das Werkzeug kann (siehe site/templates.js → workspace()).
 * Browser-Werkzeuge nutzen pdf-lib (bearbeiten) und pdf.js (Vorschau/Rendern).
 */
(() => {
  "use strict";
  // L(): Übersetzung für /en/ und /fr/ – Schlüssel ist der deutsche Text, {name} wird ersetzt
  const L = (text, vars) => {
    const d = window.PL_T || {};
    const out = d[text] != null ? d[text] : text;
    return vars ? out.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m)) : out;
  };

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
    return `${(bytes / 1024 / 1024).toFixed(1).replace(".", window.PL_LANG === "en" ? "." : ",")} MB`;
  }

  function baseName(name) {
    return name.replace(/\.[^.]+$/, "") || "datei";
  }

  function showError(msg, link) {
    const el = $("[data-error]");
    el.textContent = msg;
    if (link) {
      el.append(" ");
      const a = document.createElement("a");
      a.href = link.href;
      a.textContent = link.label;
      el.append(a);
    }
    el.hidden = !msg;
  }

  function fail(msg, link) {
    show("work");
    showError(msg, link);
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
      if (!m) throw new Error(L("„{part}“ ist keine gültige Seitenangabe.", { part }));
      const a = Number(m[1]);
      const b = m[2] === undefined ? a : m[2] === "" ? max : Number(m[2]);
      if (a < 1 || b < 1 || a > max || b > max) throw new Error(L("Die PDF hat nur {max} Seiten – „{part}“ liegt außerhalb.", { max, part }));
      if (a > b) throw new Error(L("Im Bereich „{part}“ muss die erste Zahl kleiner sein.", { part }));
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
    if (!ranges.length) throw new Error(L("Bitte gib mindestens einen Seitenbereich an, z. B. 1-3."));
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
      alertInline(L("Dieser Dateityp wird hier nicht unterstützt. Erlaubt: {list}", { list: cfg.accept.split(",").filter((s) => s.startsWith(".")).join(", ") }));
      return;
    }
    if (cfg.multiple !== "true") {
      state.files = [];
      ok.splice(1);
    }
    for (const file of ok) state.files.push({ id: ++uid, file });
    show("work");
    if (rejected) showError(L("{n} Datei(en) wurden übersprungen, weil der Dateityp nicht passt.", { n: rejected }));

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
        <button type="button" class="icon-btn" aria-label="${L("Entfernen")}">${SVG.x}</button>`;
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
      if (e && e.name === "PasswordException") return fail(L("Diese PDF ist passwortgeschützt. Entsperre sie zuerst mit „PDF entsperren“."));
      return fail(L("Die PDF konnte nicht geöffnet werden. Ist die Datei beschädigt?"));
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
        tools.innerHTML = `<button type="button" class="icon-btn" data-page-action="rotate" aria-label="${L("Seite {n} drehen", { n: i + 1 })}">${SVG.rotate}</button><button type="button" class="icon-btn" data-page-action="delete" aria-label="${L("Seite {n} löschen", { n: i + 1 })}">${SVG.trash}</button>`;
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
      let text = n === 1 ? L("1 Seite") : L("{n} Seiten", { n });
      if (cfg.select === "remove" || cfg.select === "keep") {
        const s = state.pages.filter((p) => p.selected).length;
        if (s) text += ` · ${s} ausgewählt`;
      }
      if (cfg.select === "rotate") {
        const r = state.pages.filter((p) => p.rotation).length;
        if (r) text += " · " + L("{n} gedreht", { n: r });
      }
      if (cfg.select === "organize") {
        const left = visiblePages().length;
        if (left !== n) text = L("{a} von {b} Seiten", { a: left, b: n });
      }
      el.textContent = text;
    } else {
      const total = state.files.reduce((s, f) => s + f.file.size, 0);
      el.textContent = (state.files.length === 1 ? L("1 Datei") : L("{n} Dateien", { n: state.files.length })) + " · " + formatSize(total);
    }
  }

  // -------------------------------------------------------------------------
  // Absenden
  // -------------------------------------------------------------------------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    showError("");
    const min = Number(cfg.min || 1);
    if (state.files.length < min) return showError(L("Bitte wähle mindestens {n} Dateien aus.", { n: min }));

    const v = values();
    if (form.elements.password2 && v.password !== v.password2) {
      form.elements.password2.setAttribute("aria-invalid", "true");
      return showError(L("Die Passwörter stimmen nicht überein."));
    }
    for (const el of form.elements) {
      if (el.required && !el.closest("[hidden]") && !el.value) {
        el.setAttribute("aria-invalid", "true");
        el.focus();
        return showError(L("Bitte fülle alle Pflichtfelder aus."));
      }
    }

    try {
      if (cfg.mode === "server") await runServer(v);
      else {
        startBusy(L("Wird in deinem Browser verarbeitet …"));
        await nextFrame();
        const handler = HANDLERS[cfg.tool];
        const result = await handler(v);
        finish(result);
      }
    } catch (err) {
      console.error(err);
      if (err && err.userMessage) return fail(err.userMessage, err.link);
      fail(err && err.message && !/^[A-Z][a-zA-Z]+Error/.test(err.name || "") ? err.message : L("Das hat leider nicht geklappt. Ist die Datei beschädigt?"));
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

      startBusy(L("Wird hochgeladen …"), true);
      const xhr = new XMLHttpRequest();
      xhr.open("POST", cfg.endpoint);
      xhr.responseType = "blob";
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100), L("Wird hochgeladen … {p} %", { p: Math.round((e.loaded / e.total) * 100) }));
      };
      xhr.upload.onload = () => startBusy(L("Wird verarbeitet …"));
      xhr.onerror = () => reject(Object.assign(new Error(), { userMessage: L("Keine Verbindung zum Server. Prüfe deine Internetverbindung.") }));
      xhr.onload = async () => {
        if (xhr.status !== 200) {
          let msg = L("Bei der Verarbeitung ist ein Fehler aufgetreten.");
          try {
            msg = JSON.parse(await xhr.response.text()).error || msg;
          } catch {
            /* keine JSON-Antwort */
          }
          // Pro-Werkzeug: Anmelden bzw. Tarif wählen
          let link = null;
          if (xhr.status === 401) link = { href: `/anmelden.html?next=${encodeURIComponent(location.pathname)}`, label: L("Anmelden oder kostenlos registrieren") };
          if (xhr.status === 402) link = { href: "/preise.html", label: L("Tarife ansehen") };
          return reject(Object.assign(new Error(), { userMessage: msg, link }));
        }
        // Ergebnis mit Vorschau (z. B. KI-Zusammenfassung): JSON mit Datei als Base64
        if (/json/.test(xhr.getResponseHeader("Content-Type") || "")) {
          try {
            const data = JSON.parse(await xhr.response.text());
            const bin = atob(data.file);
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            finish({
              blob: new Blob([bytes], { type: data.mime || "application/pdf" }),
              filename: data.filename || "ergebnis.pdf",
              preview: data.preview,
              info: data.truncated ? L("Das Dokument war sehr lang – zusammengefasst wurden die ersten rund 60 Seiten.") : "",
            });
            return resolve();
          } catch {
            return reject(Object.assign(new Error(), { userMessage: L("Das Ergebnis konnte nicht gelesen werden. Bitte versuche es erneut.") }));
          }
        }
        const filename = filenameFromHeader(xhr.getResponseHeader("Content-Disposition")) || "ergebnis.pdf";
        const before = Number(xhr.getResponseHeader("X-Original-Size"));
        const after = Number(xhr.getResponseHeader("X-Result-Size"));
        let info = "";
        if (cfg.savings === "true" && before && after) {
          const saved = Math.round((1 - after / before) * 100);
          info =
            saved > 0
              ? L("Von {a} auf {b} verkleinert – <strong>{p} % gespart</strong>.", { a: formatSize(before), b: formatSize(after), p: saved })
              : L("Diese PDF ist bereits gut optimiert ({b}). Eine stärkere Stufe kann noch etwas bringen.", { b: formatSize(after) });
        }
        const resultInfo = xhr.getResponseHeader("X-Result-Info");
        if (!info && resultInfo) {
          const ok = xhr.getResponseHeader("X-Check-Ok") !== "0";
          info = `<strong>${escapeHtml(decodeURIComponent(resultInfo))}</strong>${ok ? "" : L(" – Details stehen am Ende der PDF.")}`;
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

  function finish({ blob, filename, info = "", preview = "" }) {
    if (state.resultUrl) URL.revokeObjectURL(state.resultUrl);
    state.resultUrl = URL.createObjectURL(blob);
    const a = $("[data-download]");
    a.href = state.resultUrl;
    a.download = filename;
    a.textContent = filename.toLowerCase().endsWith(".zip") ? L("ZIP herunterladen ({s})", { s: formatSize(blob.size) }) : L("Datei herunterladen ({s})", { s: formatSize(blob.size) });
    $("[data-done-info]").innerHTML = info || escapeHtml(filename);
    const pv = $("[data-done-preview]");
    if (pv) {
      pv.innerHTML = preview || ""; // vom Server aus Markdown erzeugt und maskiert
      pv.hidden = !preview;
    }
    if (preview) a.textContent = L("Als PDF herunterladen ({s})", { s: formatSize(blob.size) });
    show("done");
    $(".done__title").focus();
    if (!preview) a.click(); // Download direkt starten (bei einer Vorschau liest man zuerst)
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
    const pv = $("[data-done-preview]");
    if (pv) {
      pv.innerHTML = "";
      pv.hidden = true;
    }
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
        throw Object.assign(new Error(), { userMessage: L("Diese PDF ist verschlüsselt. Entsperre sie zuerst mit „PDF entsperren“.") });
      }
      throw Object.assign(new Error(), { userMessage: L("Die PDF konnte nicht gelesen werden. Ist die Datei beschädigt?") });
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
    const blob = await zip.generateAsync({ type: "blob" }, (m) => setProgress(Math.round(m.percent), L("ZIP wird erstellt …")));
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
        setProgress(Math.round((g / groups.length) * 100), L("Teil {a} von {b} …", { a: g + 1, b: groups.length }));
        const idx = groups[g];
        const label = idx.length === 1 ? `${idx[0] + 1}` : `${idx[0] + 1}-${idx[idx.length - 1] + 1}`;
        files.push({ name: `${base}_Seite_${label}.pdf`, blob: pdfBlob(await pagesToPdf(src, idx)) });
      }
      const res = await zipResult(files, `${base}_geteilt.zip`);
      return { ...res, info: files.length === 1 ? L("1 Datei erstellt.") : L("{n} Dateien erstellt.", { n: files.length }) };
    },

    // ----- Seiten entfernen
    async "remove-pages"(v) {
      const remove = new Set(selectedIndices(v));
      if (!remove.size) throw Object.assign(new Error(), { userMessage: L("Wähle mindestens eine Seite zum Entfernen aus.") });
      if (remove.size >= state.pageCount) throw Object.assign(new Error(), { userMessage: L("Du kannst nicht alle Seiten entfernen.") });
      const src = await loadPdfLib(await sourceBytes());
      const keep = [...Array(state.pageCount).keys()].filter((i) => !remove.has(i));
      const bytes = await pagesToPdf(src, keep);
      return {
        blob: pdfBlob(bytes),
        filename: `${baseName(state.files[0].file.name)}_bearbeitet.pdf`,
        info: L(remove.size === 1 ? "1 Seite entfernt, {k} übrig." : "{n} Seiten entfernt, {k} übrig.", { n: remove.size, k: keep.length }),
      };
    },

    // ----- Seiten extrahieren
    async "extract-pages"(v) {
      const idx = selectedIndices(v);
      if (!idx.length) throw Object.assign(new Error(), { userMessage: L("Wähle mindestens eine Seite aus.") });
      const src = await loadPdfLib(await sourceBytes());
      const base = baseName(state.files[0].file.name);
      if (v.output === "separate") {
        const files = [];
        for (const i of idx) files.push({ name: `${base}_Seite_${i + 1}.pdf`, blob: pdfBlob(await pagesToPdf(src, [i])) });
        return { ...(await zipResult(files, `${base}_Seiten.zip`)), info: L("{n} Seiten extrahiert.", { n: idx.length }) };
      }
      return { blob: pdfBlob(await pagesToPdf(src, idx)), filename: `${base}_Auszug.pdf`, info: idx.length === 1 ? L("1 Seite extrahiert.") : L("{n} Seiten extrahiert.", { n: idx.length }) };
    },

    // ----- Organisieren
    async organize() {
      const order = visiblePages();
      const src = await loadPdfLib(await sourceBytes());
      const rotations = Object.fromEntries(order.map((p) => [p.index, p.rotation]));
      const bytes = await pagesToPdf(src, order.map((p) => p.index), rotations);
      return { blob: pdfBlob(bytes), filename: `${baseName(state.files[0].file.name)}_organisiert.pdf`, info: L("{n} Seiten gespeichert.", { n: order.length }) };
    },

    // ----- Drehen
    async rotate() {
      const rotated = state.pages.filter((p) => p.rotation);
      if (!rotated.length) throw Object.assign(new Error(), { userMessage: L("Klicke zuerst auf die Seiten, die gedreht werden sollen, oder nutze „Alle nach rechts“.") });
      const src = await loadPdfLib(await sourceBytes());
      src.getPages().forEach((page, i) => {
        const extra = state.pages[i].rotation;
        if (extra) page.setRotation(PDFLib.degrees((page.getRotation().angle + extra) % 360));
      });
      return { blob: pdfBlob(await src.save()), filename: `${baseName(state.files[0].file.name)}_gedreht.pdf`, info: rotated.length === 1 ? L("1 Seite gedreht.") : L("{n} Seiten gedreht.", { n: rotated.length }) };
    },

    // ----- Bilder in PDF
    async "jpg-to-pdf"(v) {
      const doc = await PDFLib.PDFDocument.create();
      const margin = Number(v.margin || 0);
      for (let i = 0; i < state.files.length; i++) {
        setProgress(Math.round((i / state.files.length) * 100), L("Bild {a} von {b} …", { a: i + 1, b: state.files.length }));
        const { file } = state.files[i];
        let img;
        try {
          const e = await imageToEmbeddable(file);
          img = e.type === "png" ? await doc.embedPng(e.bytes) : await doc.embedJpg(e.bytes);
        } catch {
          throw Object.assign(new Error(), { userMessage: L("„{name}“ konnte nicht gelesen werden.", { name: file.name }) });
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
      return { blob: pdfBlob(await doc.save()), filename: `${name}.pdf`, info: state.files.length === 1 ? L("1 Bild in eine PDF umgewandelt.") : L("{n} Bilder in eine PDF umgewandelt.", { n: state.files.length }) };
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
        setProgress(Math.round(((i - 1) / doc.numPages) * 100), L("Seite {a} von {b} …", { a: i, b: doc.numPages }));
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
      return { ...(await zipResult(files, `${base}_Bilder.zip`)), info: files.length === 1 ? L("1 Bild erstellt.") : L("{n} Bilder erstellt.", { n: files.length }) };
    },

    // ----- Seitenzahlen
    async "page-numbers"(v) {
      const doc = await loadPdfLib(await sourceBytes());
      const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
      const size = Number(v.size || 12);
      const start = parseInt(v.start, 10) || 0;
      const skip = Math.max(0, parseInt(v.skip, 10) || 0);
      const pages = doc.getPages();
      if (skip >= pages.length) throw Object.assign(new Error(), { userMessage: L("Es werden alle Seiten übersprungen – verringere „Erste Seiten ohne Zahl“.") });
      const last = start + (pages.length - skip) - 1;
      const [vert, horiz] = v.position.split("-");
      const margin = 28;

      pages.forEach((page, i) => {
        if (i < skip) return;
        const n = start + (i - skip);
        const text = { n: `${n}`, "page-n": L("Seite {n}", { n }), "n-of-total": `${n} / ${last}`, "page-n-of-total": L("Seite {n} von {t}", { n, t: last }) }[v.format];
        const tw = font.widthOfTextAtSize(text, size);
        const P = placer(page);
        const vx = horiz === "left" ? margin : horiz === "right" ? P.vw - margin - tw : (P.vw - tw) / 2;
        const vy = vert === "top" ? P.vh - margin - size * 0.75 : margin;
        const { x, y } = P.map(vx, vy);
        page.drawText(text, { x, y, size, font, color: PDFLib.rgb(0.2, 0.22, 0.28), rotate: PDFLib.degrees(P.rot) });
      });
      return { blob: pdfBlob(await doc.save()), filename: `${baseName(state.files[0].file.name)}_nummeriert.pdf`, info: L("Seitenzahlen auf {n} Seiten eingefügt.", { n: pages.length - skip }) };
    },

    // ----- Wasserzeichen
    async watermark(v) {
      const text = (v.text || "").trim();
      if (!text) throw Object.assign(new Error(), { userMessage: L("Bitte gib einen Text für das Wasserzeichen ein.") });
      const doc = await loadPdfLib(await sourceBytes());
      const font = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
      let size = Number(v.size || 56);
      try {
        font.encodeText(text);
      } catch {
        throw Object.assign(new Error(), { userMessage: L("Der Text enthält Zeichen, die nicht unterstützt werden (z. B. Emojis). Erlaubt sind lateinische Buchstaben inkl. Umlaute.") });
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
      return { blob: pdfBlob(await doc.save()), filename: `${baseName(state.files[0].file.name)}_Wasserzeichen.pdf`, info: pages.length === 1 ? L("Wasserzeichen auf 1 Seite eingefügt.") : L("Wasserzeichen auf {n} Seiten eingefügt.", { n: pages.length }) };
    },
  };
})();

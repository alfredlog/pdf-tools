/* PDF Libre – PDF-Editor (Pro)
 *
 * Aufbau jeder Seite:  Hintergrund (pdf.js-Rendering) + darüber ein Fabric.js-Canvas mit den neuen Elementen.
 * Alle Koordinaten der Elemente sind PDF-Punkte (Fabric-Zoom = Anzeigefaktor), Ursprung oben links.
 * Beim Herunterladen geht eine Beschreibung aller Änderungen an /api/pro/export (pdf_edit.py).
 */
(() => {
  "use strict";

  const root = document.querySelector("[data-editor]");
  if (!root || !window.fabric || !window.pdfjsLib) return;

  pdfjsLib.GlobalWorkerOptions.workerSrc = "/vendor/pdf.worker.min.js";

  const $ = (s) => root.querySelector(s);
  const $$ = (s) => Array.from(root.querySelectorAll(s));
  const stages = { pick: $(".stage--pick"), editor: $(".stage--editor"), busy: $(".stage--busy") };
  const pagesEl = $("[data-ed-pages]");
  const scrollEl = $("[data-ed-scroll]");

  const SIZES = { a4p: [595.28, 841.89], a4l: [841.89, 595.28], a5p: [419.53, 595.28], letterp: [612, 792] };
  const FONT_CSS = { helv: "Helvetica, Arial, sans-serif", tiro: '"Times New Roman", Times, serif', cour: '"Courier New", Courier, monospace' };
  const FABRIC_BASELINE = 1.13 * (1 - 0.222); // Fabric setzt die Grundlinie der ersten Zeile bei fontSize * 0,879
  const GENERIC_CSS = { helv: "Helvetica, Arial, sans-serif", tiro: '"Times New Roman", Times, serif', cour: '"Courier New", Courier, monospace' };

  /** Schriftname aus der PDF ("ABCDEF+Calibri-Bold") → Familienname ("Calibri") */
  function familyOf(name) {
    let base = String(name || "").replace(/^[A-Z]{6}\+/, "");
    base = base.split(/[-,]/)[0].replace(/(PSMT|PS|MT)$/, "").trim();
    return base.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\s+(Bold|Italic|Oblique|Regular|Book|Normal|Light|Medium|Semibold|Black)$/i, "").trim();
  }

  /** CSS-Schriftliste für Originalschrift: echte Familie, dann ähnliche Standardschrift */
  function origCss(orig) {
    const fam = orig.family ? `"${orig.family.replace(/"/g, "")}", ` : "";
    return fam + GENERIC_CSS[orig.generic || "helv"];
  }

  // --- Schriften vom Server: dieselben wie beim Export, unabhängig von den Schriften auf dem Gerät
  let fontInfoPromise = null;
  const faceLoads = new Map();

  function loadFontInfo() {
    if (!state.sourceBytes) return Promise.resolve(null);
    if (!fontInfoPromise) {
      const fd = new FormData();
      fd.append("file", new Blob([state.sourceBytes], { type: "application/pdf" }), "dokument.pdf");
      fontInfoPromise = fetch("/api/pro/fonts", { method: "POST", body: fd, credentials: "same-origin" })
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          const fonts = (j && j.fonts) || {};
          let n = 0;
          for (const info of Object.values(fonts)) {
            info.id = ++n + "_" + Math.random().toString(36).slice(2, 7);
            info.cps = new Set(info.codepoints || []);
          }
          state.fontInfo = fonts;
          return fonts;
        })
        .catch(() => null);
    }
    return fontInfoPromise;
  }

  function serverFont(orig) {
    return (orig && state.fontInfo && state.fontInfo[orig.name]) || null;
  }

  const variantOf = (bold, italic) => `${bold ? "bold" : "normal"}-${italic ? "italic" : "normal"}`;

  /** Gleiche Regel wie pdf_edit.py: Originalschrift nur bei gleichem Stil und wenn sie alle Zeichen hat, sonst Ersatzschrift */
  function usesEmbedded(info, orig, text, bold, italic) {
    if (!info.embedded || bold !== Boolean(orig.bold) || italic !== Boolean(orig.italic)) return false;
    for (const ch of text) if (!/\s/.test(ch) && !info.cps.has(ch.codePointAt(0))) return false;
    return true;
  }

  function b64ToBuffer(b64) {
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr.buffer;
  }

  function ensureFace(family, source, desc) {
    const key = `${family}|${desc.weight}|${desc.style}`;
    if (!faceLoads.has(key)) {
      const face = new FontFace(family, source, desc);
      document.fonts.add(face);
      faceLoads.set(key, face.load().catch(() => null));
    }
    return faceLoads.get(key);
  }

  function cssForText(o) {
    if (o.data?.font === "orig" && o.data.orig) {
      const info = serverFont(o.data.orig);
      if (!info) return origCss(o.data.orig);
      const bold = o.fontWeight === "bold";
      const italic = o.fontStyle === "italic";
      const fams = [];
      if (usesEmbedded(info, o.data.orig, o.text || "", bold, italic)) fams.push(`"plE${info.id}"`);
      if (info.fallback && info.fallback[variantOf(bold, italic)]) fams.push(`"plF${info.id}"`);
      return fams.concat(GENERIC_CSS[o.data.orig.generic || "helv"]).join(", ");
    }
    return FONT_CSS[o.data?.font] || FONT_CSS.helv;
  }

  const measureCtx = document.createElement("canvas").getContext("2d");

  /** Schrift laden, setzen und Breite wie beim Export an das Original anpassen */
  async function refreshTextFont(o, p) {
    const orig = o.data?.orig;
    const info = o.data?.font === "orig" && serverFont(orig);
    if (info) {
      const bold = o.fontWeight === "bold";
      const italic = o.fontStyle === "italic";
      const waits = [];
      if (info.embedded) waits.push(ensureFace(`plE${info.id}`, b64ToBuffer(info.embedded), { weight: orig.bold ? "bold" : "normal", style: orig.italic ? "italic" : "normal" }));
      const url = info.fallback && info.fallback[variantOf(bold, italic)];
      if (url) waits.push(ensureFace(`plF${info.id}`, `url(${url})`, { weight: bold ? "bold" : "normal", style: italic ? "italic" : "normal" }));
      await Promise.all(waits);
    }
    const fam = cssForText(o);
    o.set({ fontFamily: fam });
    if (orig && o.data.font === "orig" && orig.text && orig.w > 0) {
      measureCtx.font = `${o.fontStyle} ${o.fontWeight} ${orig.size || o.fontSize}px ${fam}`;
      const natural = measureCtx.measureText(orig.text).width;
      const sx = natural > 0 ? orig.w / natural : 1;
      o.set({ scaleX: sx > 0.5 && sx < 1.6 && Math.abs(sx - 1) > 0.02 ? sx * (o.scaleY || 1) : o.scaleY || 1 });
    }
    fabric.util.clearFabricFontCache();
    o.initDimensions();
    o.setCoords();
    p.canvas.requestRenderAll();
  }

  const state = {
    sourceBytes: null,
    sourceName: "",
    pdf: null,
    pages: [], // { id, src, width, height, canvas, el, bg, rendered, textLayer, lastJSON }
    tool: "select",
    undo: [],
    dirty: false,
    exporting: false,
  };

  const signMode = root.hasAttribute("data-sign"); // „PDF unterschreiben“: alles im Browser, kostenlos
  const defaults = { font: "helv", size: 16, color: "#16213d", bold: false, italic: false, stroke: "#2b4bdb", fill: "#ffffff", nofill: true, strokeWidth: 2, opacity: 100 };

  root.__editor = state; // für Tests und Fehlersuche in der Browser-Konsole

  let pageSeq = 0;
  let objSeq = 0;
  let suspendHistory = false;

  // ---------------------------------------------------------------------------
  // Fabric-Grundeinstellungen
  // ---------------------------------------------------------------------------
  Object.assign(fabric.Object.prototype, {
    transparentCorners: false,
    cornerColor: "#ffffff",
    cornerStrokeColor: "#2b4bdb",
    borderColor: "#2b4bdb",
    cornerStyle: "circle",
    cornerSize: 11,
    touchCornerSize: 28,
    padding: 3,
    lockRotation: true,
  });
  fabric.Object.prototype.setControlsVisibility({ mtr: false });
  const PROPS_TO_SAVE = ["data", "selectable", "evented", "strokeUniform", "lockScalingX", "lockScalingY", "hasControls"];

  // ---------------------------------------------------------------------------
  // Hilfsfunktionen
  // ---------------------------------------------------------------------------
  function show(name) {
    for (const [k, el] of Object.entries(stages)) el.hidden = k !== name;
  }

  function hexToRgb(hex) {
    const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex || "");
    return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : null;
  }

  function colorOf(value) {
    if (!value || value === "transparent") return null;
    if (value.startsWith("#")) return hexToRgb(value);
    const m = value.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a] = m[1].split(",").map((x) => parseFloat(x));
    if (a === 0) return null;
    return [r / 255, g / 255, b / 255];
  }

  function toast(msg, ms = 4000) {
    let el = document.querySelector(".ed-toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "ed-toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("is-visible");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("is-visible"), ms);
  }

  function pageById(id) {
    return state.pages.find((p) => p.id === id);
  }

  function activePage() {
    return state.pages.find((p) => p.canvas.getActiveObject()) || state.lastPage || state.pages[0];
  }

  function scaleFor(p) {
    const avail = Math.max(260, scrollEl.clientWidth - 32);
    return Math.min(1.6, avail / p.width);
  }

  // ---------------------------------------------------------------------------
  // Dokument öffnen / neu anlegen
  // ---------------------------------------------------------------------------
  async function openFile(file) {
    if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") return toast("Bitte wähle eine PDF-Datei aus.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    try {
      await loadDocument({ sourceBytes: bytes, sourceName: file.name });
    } catch (e) {
      console.error(e);
      show("pick");
      toast(e && e.name === "PasswordException" ? "Diese PDF ist passwortgeschützt. Entsperre sie zuerst mit „PDF entsperren“." : "Die PDF konnte nicht geöffnet werden.");
    }
  }

  /** Baut den Editor aus einem Zustand auf (neue Datei, leeres Dokument oder wiederhergestellter Entwurf). */
  async function loadDocument({ sourceBytes = null, sourceName = "", pages = null }) {
    clearDocument();
    state.sourceBytes = sourceBytes;
    state.sourceName = sourceName;
    show("editor");
    $$("[data-needs-source]").forEach((el) => (el.hidden = !sourceBytes));

    if (sourceBytes) {
      state.pdf = await pdfjsLib.getDocument({ data: sourceBytes.slice(), isEvalSupported: false }).promise;
    }
    let specs = pages;
    if (!specs) {
      if (state.pdf) {
        specs = [];
        for (let i = 0; i < state.pdf.numPages; i++) {
          const vp = (await state.pdf.getPage(i + 1)).getViewport({ scale: 1 });
          specs.push({ src: i, width: vp.width, height: vp.height });
        }
      } else {
        const [w, h] = SIZES.a4p;
        specs = [{ src: null, width: w, height: h }];
      }
    }
    for (const spec of specs) await addPage(spec);
    renumber();
    setTool("select");
    state.dirty = false;
  }

  function clearDocument() {
    fontInfoPromise = null;
    state.fontInfo = null;
    state.pages.forEach((p) => p.canvas.dispose());
    state.pages = [];
    state.undo = [];
    pagesEl.innerHTML = "";
    if (state.pdf) state.pdf.destroy();
    state.pdf = null;
    updateUndo();
  }

  // ---------------------------------------------------------------------------
  // Seiten
  // ---------------------------------------------------------------------------
  async function addPage(spec, afterPage = null) {
    const id = ++pageSeq;
    const el = document.createElement("div");
    el.className = "ed-page";
    el.dataset.id = id;
    el.innerHTML = `<div class="ed-page__head">
        <span class="ed-page__num"></span>
        <span class="ed-page__btns">
          <button type="button" class="btn btn--link btn--sm" data-page-add>+ Leere Seite danach</button>
          <button type="button" class="btn btn--link btn--sm" data-page-del>Seite löschen</button>
        </span>
      </div>
      <div class="ed-page__stage">
        <canvas class="ed-page__bg" aria-hidden="true"></canvas>
        <canvas class="ed-page__fab"></canvas>
        <div class="ed-textlayer" hidden></div>
      </div>`;
    if (afterPage) afterPage.el.after(el);
    else pagesEl.appendChild(el);

    const canvas = new fabric.Canvas(el.querySelector(".ed-page__fab"), {
      preserveObjectStacking: true,
      selectionColor: "rgba(43,75,219,.08)",
      selectionBorderColor: "#2b4bdb",
      enableRetinaScaling: true,
      stopContextMenu: true,
    });
    const page = { id, src: spec.src, width: spec.width, height: spec.height, canvas, el, bg: el.querySelector(".ed-page__bg"), rendered: 0, textLayer: el.querySelector(".ed-textlayer"), lastJSON: null };

    const index = afterPage ? state.pages.indexOf(afterPage) + 1 : state.pages.length;
    state.pages.splice(index, 0, page);

    wireCanvas(page);
    layoutPage(page);
    if (spec.json) {
      suspendHistory = true;
      await new Promise((r) => canvas.loadFromJSON(spec.json, r));
      canvas.getObjects().forEach(applyObjectDefaults);
      canvas.renderAll();
      suspendHistory = false;
    }
    page.lastJSON = serialize(page);
    observer.observe(el);
    return page;
  }

  function layoutPage(p) {
    const s = scaleFor(p);
    p.scale = s;
    const w = Math.round(p.width * s);
    const h = Math.round(p.height * s);
    const stage = p.el.querySelector(".ed-page__stage");
    stage.style.width = w + "px";
    stage.style.height = h + "px";
    p.canvas.setDimensions({ width: w, height: h });
    p.canvas.setZoom(s);
    p.bg.style.width = w + "px";
    p.bg.style.height = h + "px";
    if (p.rendered && p.rendered !== s) renderBackground(p);
    if (!p.textLayer.hidden) buildTextLayer(p, true);
  }

  // Hintergrund erst rendern, wenn die Seite sichtbar wird
  const observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const p = pageById(Number(e.target.dataset.id));
        if (p && !p.rendered) renderBackground(p);
      }
    },
    { rootMargin: "600px" }
  );

  function renderBackground(p) {
    p.renderPromise = doRenderBackground(p);
    return p.renderPromise;
  }

  async function doRenderBackground(p) {
    const s = p.scale;
    p.rendered = s;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const ctx = p.bg.getContext("2d");
    p.bg.width = Math.round(p.width * s * dpr);
    p.bg.height = Math.round(p.height * s * dpr);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, p.bg.width, p.bg.height);
    if (p.src === null || !state.pdf) return;
    try {
      const page = await state.pdf.getPage(p.src + 1);
      const vp = page.getViewport({ scale: s * dpr });
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
    } catch (e) {
      console.warn("Seite konnte nicht gerendert werden", e);
    }
  }

  function renumber() {
    state.pages.forEach((p, i) => {
      p.el.querySelector(".ed-page__num").textContent = `Seite ${i + 1} von ${state.pages.length}`;
      p.el.querySelector("[data-page-del]").hidden = state.pages.length === 1;
    });
  }

  pagesEl.addEventListener("click", async (e) => {
    const pageEl = e.target.closest(".ed-page");
    if (!pageEl) return;
    const p = pageById(Number(pageEl.dataset.id));
    if (e.target.closest("[data-page-add]")) {
      const np = await addPage({ src: null, width: p.width, height: p.height }, p);
      renumber();
      state.dirty = true;
      np.el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (e.target.closest("[data-page-del]")) {
      if (state.pages.length === 1) return;
      if (p.canvas.getObjects().length && !confirm("Diese Seite enthält Änderungen. Wirklich löschen?")) return;
      observer.unobserve(p.el);
      p.canvas.dispose();
      p.el.remove();
      state.pages.splice(state.pages.indexOf(p), 1);
      state.undo = state.undo.filter((u) => u.page !== p);
      updateUndo();
      renumber();
      state.dirty = true;
    }
  });

  $("[data-ed-addpage]").addEventListener("click", async () => {
    const [w, h] = SIZES[$("[data-ed-size]").value] || SIZES.a4p;
    const p = await addPage({ src: null, width: w, height: h });
    renumber();
    state.dirty = true;
    p.el.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => state.pages.forEach(layoutPage), 150);
  });

  // ---------------------------------------------------------------------------
  // Werkzeuge
  // ---------------------------------------------------------------------------
  const HINTS = {
    select: "Klicke ein Element an, um es zu verschieben, zu vergrößern oder zu ändern.",
    edittext: "Klicke auf eine Textzeile der PDF, um sie zu ändern. Der alte Text wird beim Speichern endgültig entfernt.",
    text: "Klicke auf die Seite, um Text einzufügen.",
    rect: "Ziehe ein Rechteck auf der Seite auf.",
    ellipse: "Ziehe einen Kreis oder eine Ellipse auf.",
    line: "Ziehe eine Linie.",
    draw: "Zeichne frei mit Maus oder Finger – z. B. deine Unterschrift.",
    highlight: "Ziehe über den Bereich, der markiert werden soll.",
    whiteout: "Ziehe über einen Bereich, um ihn weiß zu überdecken. Der Inhalt darunter bleibt in der Datei.",
    redact: "Ziehe über einen Bereich. Text, Bilder und Grafiken darin werden beim Speichern endgültig gelöscht.",
  };
  if (signMode) {
    HINTS.select = "Klicke auf „Unterschrift“, um zu unterschreiben. Ziehe Elemente an die richtige Stelle, die Ecken ändern die Größe.";
    HINTS.text = "Klicke auf die Seite, um Text einzufügen – z. B. Ort und Datum.";
  }

  function setTool(tool) {
    if (tool === "image") return $("[data-ed-image]").click();
    if (tool === "sign") return openSignature();
    state.tool = tool;
    $$("[data-ed-tool]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.edTool === tool)));
    const creating = !["select", "edittext"].includes(tool);
    for (const p of state.pages) {
      const c = p.canvas;
      c.isDrawingMode = tool === "draw";
      if (tool === "draw") {
        c.freeDrawingBrush = new fabric.PencilBrush(c);
        c.freeDrawingBrush.color = defaults.stroke;
        c.freeDrawingBrush.width = Math.max(1, Number(defaults.strokeWidth) || 2);
        c.freeDrawingBrush.decimate = 2;
      }
      c.selection = tool === "select";
      c.defaultCursor = creating ? "crosshair" : "default";
      c.getObjects().forEach((o) => {
        if (!o.data || !o.data.locked) o.selectable = isSelectableIn(o, tool);
      });
      if (tool !== "select" && !(tool === "edittext" && c.getActiveObject()?.data?.kind === "text")) c.discardActiveObject();
      c.requestRenderAll();
      if (tool === "edittext" && p.src !== null) {
        loadFontInfo();
        buildTextLayer(p);
      }
      p.textLayer.hidden = tool !== "edittext";
    }
    updateProps();
  }

  $$("[data-ed-tool]").forEach((b) => b.addEventListener("click", () => setTool(b.dataset.edTool)));

  /** Im Modus „Text ändern“ bleiben bereits geänderte und neue Texte anklickbar. */
  function isSelectableIn(o, tool) {
    return tool === "select" || (tool === "edittext" && o.data?.kind === "text");
  }

  function applyObjectDefaults(o) {
    if (!o.data) o.data = {};
    if (!o.data.id) o.data.id = `o${++objSeq}`;
    if (o.type === "i-text") o.setControlsVisibility({ ml: false, mr: false, mt: false, mb: false, mtr: false });
    else o.setControlsVisibility({ mtr: false });
    if (o.data.locked) {
      o.selectable = false;
      o.evented = false;
    }
  }

  function makeShape(kind, x, y) {
    const common = { left: x, top: y, strokeUniform: true, opacity: defaults.opacity / 100, data: { kind } };
    const stroke = defaults.stroke;
    const sw = Number(defaults.strokeWidth) || 0;
    const fill = defaults.nofill ? "transparent" : defaults.fill;
    switch (kind) {
      case "rect":
        return new fabric.Rect({ ...common, width: 1, height: 1, fill, stroke: sw ? stroke : null, strokeWidth: sw ? sw : 0 });
      case "ellipse":
        return new fabric.Ellipse({ ...common, rx: 0.5, ry: 0.5, fill, stroke: sw ? stroke : null, strokeWidth: sw ? sw : 0 });
      case "line":
        return new fabric.Line([x, y, x, y], { ...common, stroke, strokeWidth: Math.max(1, sw), fill: null });
      case "highlight":
        return new fabric.Rect({ ...common, width: 1, height: 1, fill: "#ffe066", opacity: 0.45, strokeWidth: 0 });
      case "whiteout":
        return new fabric.Rect({ ...common, width: 1, height: 1, fill: "#ffffff", opacity: 1, strokeWidth: 0 });
      case "redact":
        return new fabric.Rect({ ...common, width: 1, height: 1, fill: "#ffffff", opacity: 1, stroke: "#c7322b", strokeWidth: 1.2, strokeDashArray: [5, 3] });
      default:
        return null;
    }
  }

  function makeText(x, y, text = "Text eingeben", opts = {}) {
    const font = opts.font || defaults.font;
    return new fabric.IText(text, {
      left: x,
      top: y,
      fontFamily: opts.orig ? origCss(opts.orig) : FONT_CSS[font],
      fontSize: opts.size || Number(defaults.size) || 16,
      fill: opts.color || defaults.color,
      fontWeight: (opts.bold ?? defaults.bold) ? "bold" : "normal",
      fontStyle: (opts.italic ?? defaults.italic) ? "italic" : "normal",
      opacity: defaults.opacity / 100,
      strokeWidth: 0,
      lineHeight: 1.16,
      editingBorderColor: "#2b4bdb",
      cursorColor: "#2b4bdb",
      data: opts.orig ? { kind: "text", font: "orig", orig: opts.orig } : { kind: "text", font },
    });
  }

  let drawing = null;

  function wireCanvas(p) {
    const c = p.canvas;

    c.on("mouse:down", (opt) => {
      state.lastPage = p;
      const pt = c.getPointer(opt.e);
      const tool = state.tool;
      if (tool === "edittext" && opt.target && opt.target.type === "i-text") {
        const t = opt.target;
        if (!t.isEditing) {
          c.setActiveObject(t);
          t.enterEditing(opt.e);
          t.selectionStart = t.selectionEnd = t.getSelectionStartFromPointer(opt.e);
          c.requestRenderAll();
        }
        return;
      }
      if (tool === "text") {
        if (opt.target && opt.target.type === "i-text") return;
        const t = makeText(pt.x, pt.y - (Number(defaults.size) || 16) / 2, signMode ? new Date().toLocaleDateString("de-DE") : undefined);
        c.add(t);
        c.setActiveObject(t);
        t.enterEditing();
        t.selectAll();
        setTool("select");
        c.setActiveObject(t);
        return;
      }
      if (["rect", "ellipse", "line", "highlight", "whiteout", "redact"].includes(tool)) {
        const shape = makeShape(tool, pt.x, pt.y);
        shape.selectable = false;
        drawing = { page: p, shape, x: pt.x, y: pt.y };
        suspendHistory = true;
        c.add(shape);
      }
    });

    c.on("mouse:move", (opt) => {
      if (!drawing || drawing.page !== p) return;
      const pt = c.getPointer(opt.e);
      const { shape, x, y } = drawing;
      const left = Math.min(x, pt.x);
      const top = Math.min(y, pt.y);
      const w = Math.abs(pt.x - x);
      const h = Math.abs(pt.y - y);
      if (shape.type === "line") shape.set({ x2: pt.x, y2: pt.y });
      else if (shape.type === "ellipse") shape.set({ left, top, rx: w / 2, ry: h / 2 });
      else shape.set({ left, top, width: w, height: h });
      shape.setCoords();
      c.requestRenderAll();
    });

    c.on("mouse:up", () => {
      if (!drawing || drawing.page !== p) return;
      const { shape } = drawing;
      drawing = null;
      suspendHistory = false;
      // Nur geklickt statt gezogen → sinnvolle Standardgröße
      if (shape.type === "line") {
        if (Math.hypot(shape.x2 - shape.x1, shape.y2 - shape.y1) < 4) shape.set({ x2: shape.x1 + 120, y2: shape.y1 });
      } else if (shape.type === "ellipse") {
        if (shape.rx < 3 && shape.ry < 3) shape.set({ rx: 50, ry: 30 });
      } else if (shape.width < 4 && shape.height < 4) {
        shape.set({ width: 140, height: shape.data.kind === "highlight" ? 18 : 60 });
      }
      applyObjectDefaults(shape);
      shape.setCoords();
      setTool("select");
      c.setActiveObject(shape);
      c.requestRenderAll();
      recordChange(p);
    });

    // Vor dem Einfügen markieren, damit der Rückgängig-Verlauf das Element vollständig kennt
    c.on("before:path:created", (opt) => {
      opt.path.set({ strokeUniform: true, opacity: defaults.opacity / 100, data: { kind: "draw" } });
      applyObjectDefaults(opt.path);
    });

    const onChange = () => recordChange(p);
    c.on("object:added", onChange);
    c.on("object:modified", onChange);
    c.on("object:removed", onChange);
    c.on("text:changed", (opt) => {
      if (opt.target?.data?.orig) refreshTextFont(opt.target, p);
      if (opt.target?.data?.pending) {
        if (opt.target.text === opt.target.data.orig?.text) return;
        activateReplacement(p, opt.target);
      }
      state.dirty = true;
    });
    c.on("text:editing:exited", (opt) => {
      const t = opt.target;
      if (t && t.data?.pending) return setTimeout(() => cancelReplacement(p, t));
      // Leerer Text wird entfernt (bei geänderten Zeilen bleibt die Abdeckung: Zeile gelöscht)
      if (t && !t.text.trim()) c.remove(t);
      else recordChange(p);
    });

    c.on("selection:created", () => onSelect(p));
    c.on("selection:updated", () => onSelect(p));
    c.on("selection:cleared", () => updateProps());
  }

  function onSelect(p) {
    // Nur eine Seite hat eine aktive Auswahl
    state.pages.forEach((q) => {
      if (q !== p && q.canvas.getActiveObject()) {
        q.canvas.discardActiveObject();
        q.canvas.requestRenderAll();
      }
    });
    state.lastPage = p;
    updateProps();
  }

  // ---------------------------------------------------------------------------
  // Rückgängig
  // ---------------------------------------------------------------------------
  function serialize(p) {
    return JSON.stringify(p.canvas.toJSON(PROPS_TO_SAVE));
  }

  function recordChange(p) {
    if (suspendHistory || !p.lastJSON) return;
    const json = serialize(p);
    if (json === p.lastJSON) return;
    state.undo.push({ page: p, json: p.lastJSON });
    if (state.undo.length > 100) state.undo.shift();
    p.lastJSON = json;
    state.dirty = true;
    updateUndo();
  }

  function updateUndo() {
    $("[data-ed-undo]").disabled = !state.undo.length;
  }

  async function undo() {
    const step = state.undo.pop();
    updateUndo();
    if (!step || !state.pages.includes(step.page)) return;
    const p = step.page;
    suspendHistory = true;
    await new Promise((r) => p.canvas.loadFromJSON(step.json, r));
    p.canvas.getObjects().forEach((o) => {
      applyObjectDefaults(o);
      if (!o.data.locked) o.selectable = isSelectableIn(o, state.tool);
    });
    p.canvas.renderAll();
    suspendHistory = false;
    p.lastJSON = step.json;
    // Wiederhergestellte Textzeilen wieder anklickbar machen
    if (!p.textLayer.hidden) buildTextLayer(p, true);
    updateProps();
  }
  $("[data-ed-undo]").addEventListener("click", undo);

  document.addEventListener("keydown", (e) => {
    if (stages.editor.hidden) return;
    const active = activePage()?.canvas.getActiveObject();
    const typing = active && active.isEditing;
    const inField = /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !typing && !inField) {
      e.preventDefault();
      undo();
    }
    if ((e.key === "Delete" || e.key === "Backspace") && active && !typing && !inField) {
      e.preventDefault();
      deleteSelection();
    }
    if (e.key === "Escape" && state.tool !== "select") setTool("select");
  });

  function deleteSelection() {
    const p = activePage();
    if (!p) return;
    const objs = p.canvas.getActiveObjects();
    p.canvas.discardActiveObject();
    suspendHistory = true;
    objs.forEach((o) => p.canvas.remove(o));
    suspendHistory = false;
    recordChange(p);
    p.canvas.requestRenderAll();
    updateProps();
  }
  $("[data-ed-delete]").addEventListener("click", deleteSelection);

  // ---------------------------------------------------------------------------
  // Eigenschaften-Leiste
  // ---------------------------------------------------------------------------
  const propsEl = $("[data-ed-props]");
  const groups = Object.fromEntries($$("[data-group]").map((g) => [g.dataset.group, g]));

  function kindsInSelection() {
    const p = state.pages.find((q) => q.canvas.getActiveObject());
    if (!p) return { p: null, objs: [], kinds: new Set() };
    const objs = p.canvas.getActiveObjects();
    return { p, objs, kinds: new Set(objs.map((o) => o.data?.kind)) };
  }

  function updateProps() {
    const { objs, kinds } = kindsInSelection();
    let show = new Set();
    let showFill = true;
    const src = objs.length ? kinds : new Set([state.tool]);
    for (const k of src) {
      if (k === "text") show.add("text").add("opacity");
      if (k === "rect" || k === "ellipse") show.add("shape").add("opacity");
      if (k === "line" || k === "draw") {
        show.add("shape").add("opacity");
        showFill = false;
      }
      if (k === "highlight" || k === "image") show.add("opacity");
    }
    for (const [name, el] of Object.entries(groups)) el.hidden = !show.has(name);
    $$("[data-fill-wrap]").forEach((el) => (el.hidden = !showFill));
    $("[data-ed-delete]").hidden = !objs.length;
    $("[data-ed-hint]").hidden = show.size > 0 || objs.length > 0;
    $("[data-ed-hint]").textContent = HINTS[state.tool] || HINTS.select;

    // Werte der Auswahl in die Felder übernehmen
    const o = objs[0];
    if (!o || o.data?.kind !== "text") syncOrigOption(null);
    const values = { ...defaults };
    if (o) {
      if (o.data?.kind === "text") {
        syncOrigOption(o);
        Object.assign(values, { font: o.data.font || "helv", size: Math.round(o.fontSize * o.scaleY), color: o.fill, bold: o.fontWeight === "bold", italic: o.fontStyle === "italic" });
      }
      if (["rect", "ellipse", "line", "draw"].includes(o.data?.kind)) {
        Object.assign(values, { stroke: o.stroke || defaults.stroke, strokeWidth: o.strokeWidth, nofill: !o.fill || o.fill === "transparent", fill: o.fill && o.fill !== "transparent" ? o.fill : defaults.fill });
      }
      values.opacity = Math.round((o.opacity ?? 1) * 100);
    }
    propsEl.querySelectorAll("[data-prop]").forEach((el) => {
      const v = values[el.dataset.prop];
      if (el.type === "checkbox") el.checked = Boolean(v);
      else if (el.classList.contains("ed-toggle")) el.setAttribute("aria-pressed", String(Boolean(v)));
      else if (v !== undefined && typeof v === "string" && el.type === "color" && !v.startsWith("#")) return;
      else if (v !== undefined) el.value = v;
    });
  }

  /** Option „Original: Calibri“ im Schrift-Feld anzeigen, solange ein geänderter PDF-Text ausgewählt ist */
  function syncOrigOption(o) {
    const sel = propsEl.querySelector('[data-prop="font"]');
    let opt = sel.querySelector('option[value="orig"]');
    if (o && o.data?.orig) {
      if (!opt) {
        opt = document.createElement("option");
        opt.value = "orig";
        sel.prepend(opt);
      }
      opt.textContent = `Original: ${o.data.orig.family || "PDF-Schrift"}`;
    } else if (opt) {
      opt.remove();
    }
  }

  function applyProp(name, value) {
    defaults[name] = value;
    const { p, objs } = kindsInSelection();
    if (state.tool === "draw") setTool("draw");
    if (!p) return;
    for (const o of objs) {
      const kind = o.data?.kind;
      if (kind === "text" && o.data.pending) activateReplacement(p, o);
      if (kind === "text") {
        if (name === "font") {
          if (value === "orig" && !o.data.orig) continue;
          o.data.font = value;
          o.set({ fontFamily: cssForText(o) });
        }
        if (name === "color" && o.data.orig) o.data.colorChanged = true;
        if (name === "size") o.set({ fontSize: Number(value) / (o.scaleY || 1) });
        if (name === "color") o.set({ fill: value });
        if (name === "bold") o.set({ fontWeight: value ? "bold" : "normal" });
        if (name === "italic") o.set({ fontStyle: value ? "italic" : "normal" });
        if (o.data.orig && ["font", "bold", "italic", "size"].includes(name)) refreshTextFont(o, p);
      }
      if (["rect", "ellipse", "line", "draw"].includes(kind)) {
        if (name === "stroke") o.set({ stroke: value });
        if (name === "strokeWidth") o.set({ strokeWidth: Number(value), stroke: o.stroke || defaults.stroke });
        if (name === "fill" && o.type !== "line" && kind !== "draw") o.set({ fill: value });
        if (name === "nofill" && o.type !== "line" && kind !== "draw") o.set({ fill: value ? "transparent" : defaults.fill });
      }
      if (name === "opacity") o.set({ opacity: Number(value) / 100 });
      o.setCoords();
    }
    p.canvas.requestRenderAll();
    recordChange(p);
  }

  propsEl.addEventListener("input", (e) => {
    const el = e.target.closest("[data-prop]");
    if (!el || el.type === "checkbox") return;
    applyProp(el.dataset.prop, el.value);
  });
  propsEl.addEventListener("change", (e) => {
    const el = e.target.closest("[data-prop]");
    if (el && el.type === "checkbox") {
      applyProp(el.dataset.prop, el.checked);
      if (el.dataset.prop === "nofill") $('[data-prop="fill"]').closest("label").classList.toggle("is-off", el.checked);
    }
  });
  propsEl.addEventListener("click", (e) => {
    const el = e.target.closest(".ed-toggle");
    if (!el) return;
    const on = el.getAttribute("aria-pressed") !== "true";
    el.setAttribute("aria-pressed", String(on));
    applyProp(el.dataset.prop, on);
  });

  // ---------------------------------------------------------------------------
  // Bilder
  // ---------------------------------------------------------------------------
  $("[data-ed-image]").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const p = activePage();
    if (!p) return;
    const dataUrl = await downscaleImage(file, 2000);
    fabric.Image.fromURL(dataUrl, (img) => {
      const maxW = p.width * 0.5;
      const s = Math.min(1, maxW / img.width, (p.height * 0.5) / img.height);
      img.set({ left: (p.width - img.width * s) / 2, top: (p.height - img.height * s) / 3, scaleX: s, scaleY: s, strokeWidth: 0, data: { kind: "image" } });
      applyObjectDefaults(img);
      p.canvas.add(img);
      setTool("select");
      p.canvas.setActiveObject(img);
      p.canvas.requestRenderAll();
      p.el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });

  async function downscaleImage(file, maxSide) {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const s = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * s);
    c.height = Math.round(bmp.height * s);
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    bmp.close?.();
    const png = file.type === "image/png";
    return c.toDataURL(png ? "image/png" : "image/jpeg", 0.9);
  }

  // ---------------------------------------------------------------------------
  // Vorhandenen Text ändern (Textebene aus pdf.js)
  // ---------------------------------------------------------------------------
  async function buildTextLayer(p, force = false) {
    if (p.textLayerBuilt && !force) return;
    p.textLayerBuilt = true;
    if (!p.lines) p.lines = await extractLines(p);
    const replaced = new Set(p.canvas.getObjects().filter((o) => o.data?.replacesLine !== undefined).map((o) => o.data.replacesLine));
    p.textLayer.innerHTML = "";
    const s = p.scale;
    p.lines.forEach((ln, i) => {
      if (replaced.has(i)) return;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "ed-textbox";
      b.style.left = ln.x * s + "px";
      b.style.top = ln.top * s + "px";
      b.style.width = ln.w * s + "px";
      b.style.height = ln.h * s + "px";
      b.title = "Text ändern";
      b.setAttribute("aria-label", `Text ändern: ${ln.text}`);
      b.addEventListener("click", () => replaceLine(p, i));
      p.textLayer.appendChild(b);
    });
  }

  async function extractLines(p) {
    const page = await state.pdf.getPage(p.src + 1);
    const vp = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    await page.getOperatorList(); // lädt die Schriften, damit Name, fett und kursiv bekannt sind
    const styleOf = (fontName) => {
      let f = null;
      try {
        if (page.commonObjs.has(fontName)) f = page.commonObjs.get(fontName);
      } catch {
        f = null;
      }
      const name = String((f && f.name) || "").replace(/^[A-Z]{6}\+/, "");
      const cssFam = content.styles[fontName]?.fontFamily || "";
      const generic = /mono|courier|consol/i.test(name + cssFam) ? "cour" : (/serif/i.test(cssFam) && !/sans/i.test(cssFam)) || /times|roman|georgia|garamond|cambria|minion|serif/i.test(name.replace(/sans/i, "")) ? "tiro" : "helv";
      return {
        name,
        family: familyOf(name),
        generic,
        bold: Boolean(f && (f.bold || f.black)) || /bold|black|heavy|semibold|demi/i.test(name),
        italic: Boolean(f && f.italic) || /italic|oblique/i.test(name),
      };
    };
    const styles = {};
    const items = [];
    for (const it of content.items) {
      if (!it.str || !it.str.trim()) continue;
      const tx = pdfjsLib.Util.transform(vp.transform, it.transform);
      if (Math.abs(tx[1]) > 0.01 || Math.abs(tx[2]) > 0.01 || tx[0] <= 0) continue; // nur waagerechter Text
      const fh = Math.hypot(tx[2], tx[3]);
      const style = (styles[it.fontName] ||= styleOf(it.fontName));
      items.push({ str: it.str, x: tx[4], y: tx[5], w: it.width, fh, font: style.generic, style });
    }
    items.sort((a, b) => a.y - b.y || a.x - b.x);
    const lines = [];
    for (const it of items) {
      const last = lines[lines.length - 1];
      const gap = last ? it.x - (last.x + last.w) : Infinity;
      if (last && Math.abs(last.y - it.y) < it.fh * 0.3 && Math.abs(last.fh - it.fh) < it.fh * 0.25 && gap > -it.fh * 0.5 && gap < it.fh * 1.2) {
        const needsSpace = gap > it.fh * 0.12 && !/\s$/.test(last.text) && !/^\s/.test(it.str);
        last.text += (needsSpace ? " " : "") + it.str;
        last.w = it.x + it.w - last.x;
      } else {
        lines.push({ text: it.str, x: it.x, y: it.y, w: it.w, fh: it.fh, font: it.font, style: it.style });
      }
    }
    return lines.map((l) => ({ ...l, text: l.text.trim(), top: l.y - l.fh * 0.92, h: l.fh * 1.2 }));
  }

  /** Textfarbe der Zeile: dunkelstes Pixel im gerenderten Hintergrund (Kantenglättung ist heller) */
  function sampleColor(p, ln) {
    try {
      const k = p.bg.width / p.width;
      const x = Math.max(0, Math.floor(ln.x * k));
      const y = Math.max(0, Math.floor(ln.top * k));
      const w = Math.min(p.bg.width - x, Math.ceil(ln.w * k));
      const h = Math.min(p.bg.height - y, Math.ceil(ln.h * k));
      if (w < 1 || h < 1) return null;
      const d = p.bg.getContext("2d").getImageData(x, y, w, h).data;
      let best = null;
      let bestL = 250;
      for (let j = 0; j < d.length; j += 4) {
        const l = 0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2];
        if (l < bestL) {
          bestL = l;
          best = [d[j], d[j + 1], d[j + 2]];
        }
      }
      return best ? "#" + best.map((v) => v.toString(16).padStart(2, "0")).join("") : null;
    } catch {
      return null;
    }
  }

  async function replaceLine(p, i) {
    const ln = p.lines[i];
    const c = p.canvas;
    await loadFontInfo();
    p.replacing ||= new Set();
    if (p.replacing.has(i) || c.getObjects().some((o) => o.data?.replacesLine === i)) return;
    p.replacing.add(i);
    try {
      if (p.renderPromise) await p.renderPromise;
    } finally {
      p.replacing.delete(i);
    }
    const st = { ...(ln.style || { generic: ln.font, bold: false, italic: false }) };
    const srv = st.name && state.fontInfo && state.fontInfo[st.name];
    if (srv) Object.assign(st, { family: srv.family, generic: srv.generic, bold: srv.bold || st.bold, italic: srv.italic || st.italic });
    const color = sampleColor(p, ln) || "#000000";
    suspendHistory = true;
    const cover = new fabric.Rect({
      left: ln.x - 1,
      top: ln.top - 1,
      width: ln.w + 2,
      height: ln.h + 2,
      fill: "#ffffff",
      strokeWidth: 0,
      selectable: false,
      evented: false,
      visible: false, // erst sichtbar, wenn der Text wirklich geändert wird
      data: { kind: "redact", locked: true, replacesLine: i },
    });
    const size = Math.round(ln.fh * 10) / 10;
    const orig = { src: p.src, x: ln.x, top: ln.top, w: ln.w, h: ln.h, text: ln.text, size, name: st.name || "", family: st.family || "", generic: st.generic || ln.font, bold: st.bold, italic: st.italic, color };
    const t = makeText(ln.x, ln.y - size * FABRIC_BASELINE, ln.text, { font: ln.font, size, color, bold: st.bold, italic: st.italic, orig });
    t.data.replacesLine = i;
    // Schrift vom Server laden und gleiche Breite wie das Original (z. B. schmal gesetzte Adressen)
    await refreshTextFont(t, p);
    // Solange nichts geändert ist, bleibt der Originaltext sichtbar (neuer Text unsichtbar, nur Cursor/Auswahl)
    t.data.pending = true;
    t.data.origFill = color;
    t.set({ fill: "rgba(0,0,0,0)" });
    t.opacity = 1;
    applyObjectDefaults(cover);
    applyObjectDefaults(t);
    c.add(cover);
    c.add(t);
    suspendHistory = false;
    buildTextLayer(p, true);
    c.setActiveObject(t);
    t.enterEditing();
    t.selectAll();
    c.requestRenderAll();
  }

  /** Erste echte Änderung an einer PDF-Zeile: Original abdecken, neuen Text zeigen, Verlauf merken */
  function activateReplacement(p, t) {
    if (!t.data?.pending) return;
    t.data.pending = false;
    t.set({ fill: t.data.origFill || "#000000" });
    const cover = p.canvas.getObjects().find((o) => o.data?.kind === "redact" && o.data.replacesLine === t.data.replacesLine);
    if (cover) cover.set({ visible: true });
    p.canvas.requestRenderAll();
    state.dirty = true; // der Verlauf wird beim Beenden der Eingabe gespeichert → ein Schritt „Rückgängig“ stellt das Original her
  }

  /** Zeile angeklickt, aber nichts geändert: alles wieder wie vorher */
  function cancelReplacement(p, t) {
    const i = t.data.replacesLine;
    suspendHistory = true;
    p.canvas.getObjects().filter((o) => o.data?.replacesLine === i).forEach((o) => p.canvas.remove(o));
    suspendHistory = false;
    p.lastJSON = serialize(p);
    if (!p.textLayer.hidden) buildTextLayer(p, true);
    p.canvas.requestRenderAll();
    updateProps();
  }

  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------
  function buildSpec() {
    const images = [];
    const pages = state.pages.map((p) => {
      const redactions = [];
      const textRedactions = [];
      const items = [];
      for (const o of p.canvas.getObjects()) {
        const kind = o.data?.kind;
        const sw = o.stroke ? o.strokeWidth || 0 : 0;
        const box = () => ({ x: o.left + sw / 2, y: o.top + sw / 2, w: o.width * o.scaleX, h: o.height * o.scaleY });
        const opacity = o.opacity ?? 1;

        if (o.data?.pending) continue;
        if (kind === "redact" && o.data.replacesLine !== undefined) {
          if (!o.visible) continue;
          // Nur ein schmaler Streifen in der Zeilenmitte: trifft jedes Zeichen dieser Zeile, aber nie die Nachbarzeilen
          const fh = (o.height - 2) / 1.2;
          textRedactions.push({ x: o.left, y: o.top + 1 + 0.35 * fh, w: o.width, h: 0.35 * fh });
        } else if (kind === "redact") {
          const b = box();
          redactions.push({ x: o.left, y: o.top, w: b.w + sw, h: b.h + sw });
        } else if (kind === "text") {
          const fs = o.fontSize * o.scaleY;
          const lines = o.textLines.map((text, i) => ({
            text,
            x: o.left + o._getLineLeftOffset(i) * o.scaleX,
            y: o.top + fs * 1.13 * (i * o.lineHeight + (1 - 0.222)),
          }));
          const item = { type: "text", lines, size: fs, hscale: o.scaleX / (o.scaleY || 1), font: o.data.font || "helv", bold: o.fontWeight === "bold", italic: o.fontStyle === "italic", color: colorOf(o.fill), opacity };
          if (o.data.orig) item.orig = { ...o.data.orig, keepColor: !o.data.colorChanged };
          items.push(item);
        } else if (kind === "rect" || kind === "highlight" || kind === "whiteout") {
          items.push({ type: "rect", ...box(), fill: colorOf(o.fill), stroke: sw ? colorOf(o.stroke) : null, strokeWidth: sw, opacity });
        } else if (kind === "ellipse") {
          items.push({ type: "ellipse", ...box(), fill: colorOf(o.fill), stroke: sw ? colorOf(o.stroke) : null, strokeWidth: sw, opacity });
        } else if (kind === "line") {
          const pts = o.calcLinePoints();
          const m = o.calcTransformMatrix();
          const a = fabric.util.transformPoint(new fabric.Point(pts.x1, pts.y1), m);
          const b = fabric.util.transformPoint(new fabric.Point(pts.x2, pts.y2), m);
          items.push({ type: "line", x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: colorOf(o.stroke), strokeWidth: o.strokeWidth, opacity });
        } else if (kind === "draw") {
          const m = o.calcTransformMatrix();
          const points = [];
          for (const cmd of o.path) {
            if (cmd.length < 3) continue;
            const x = cmd[cmd.length - 2];
            const y = cmd[cmd.length - 1];
            const pt = fabric.util.transformPoint(new fabric.Point(x - o.pathOffset.x, y - o.pathOffset.y), m);
            points.push([Math.round(pt.x * 100) / 100, Math.round(pt.y * 100) / 100]);
          }
          items.push({ type: "path", points, stroke: colorOf(o.stroke), strokeWidth: o.strokeWidth, opacity });
        } else if (kind === "image") {
          images.push(o.getSrc());
          items.push({ type: "image", ...box(), image: images.length - 1, opacity });
        }
      }
      return { src: p.src, width: p.width, height: p.height, redactions, textRedactions, items };
    });
    return { spec: { pages }, images };
  }

  function dataUrlToBlob(url) {
    const [head, b64] = url.split(",");
    const mime = head.match(/data:([^;]+)/)[1];
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  async function exportPdf() {
    if (state.exporting) return;
    if (signMode) return exportInBrowser();
    // Laufende Texteingabe abschließen
    state.pages.forEach((p) => {
      const o = p.canvas.getActiveObject();
      if (o && o.isEditing) o.exitEditing();
    });
    const { spec, images } = buildSpec();
    const fd = new FormData();
    fd.append("spec", JSON.stringify(spec));
    if (state.sourceBytes) fd.append("file", new Blob([state.sourceBytes], { type: "application/pdf" }), state.sourceName || "dokument.pdf");
    images.forEach((src, i) => fd.append("images", dataUrlToBlob(src), `bild${i}`));

    state.exporting = true;
    const btn = $("[data-ed-download]");
    btn.disabled = true;
    btn.querySelector("span").textContent = "Wird erstellt …";
    try {
      const res = await fetch("/api/pro/export", { method: "POST", body: fd, credentials: "same-origin" });
      if (!res.ok) {
        let data = {};
        try {
          data = await res.json();
        } catch {
          /* leer */
        }
        if (res.status === 401) return openModal("auth");
        if (res.status === 402) return openModal("plans");
        throw new Error(data.error || "Die PDF konnte nicht erstellt werden.");
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition") || "";
      const star = cd.match(/filename\*=UTF-8''([^;]+)/i);
      const name = star ? decodeURIComponent(star[1]) : (cd.match(/filename="?([^";]+)"?/i) || [])[1] || "dokument.pdf";
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 60000);
      state.dirty = false;
      await clearDraft();
      toast("Fertig! Deine PDF wird heruntergeladen.");
    } catch (e) {
      toast(e.message || "Die PDF konnte nicht erstellt werden.");
    } finally {
      state.exporting = false;
      btn.disabled = false;
      btn.querySelector("span").textContent = "Herunterladen";
    }
  }
  $("[data-ed-download]").addEventListener("click", exportPdf);

  // ---------------------------------------------------------------------------
  // PDF unterschreiben: Export im Browser mit pdf-lib (die Datei verlässt das Gerät nicht)
  // ---------------------------------------------------------------------------
  const STD_FONTS = {
    helv: ["Helvetica", "HelveticaBold", "HelveticaOblique", "HelveticaBoldOblique"],
    tiro: ["TimesRoman", "TimesRomanBold", "TimesRomanItalic", "TimesRomanBoldItalic"],
    cour: ["Courier", "CourierBold", "CourierOblique", "CourierBoldOblique"],
  };

  async function exportInBrowser() {
    const L = window.PDFLib;
    if (!L) return toast("Die Seite ist noch nicht vollständig geladen. Bitte versuche es gleich noch einmal.");
    state.pages.forEach((p) => {
      const o = p.canvas.getActiveObject();
      if (o && o.isEditing) o.exitEditing();
    });
    state.exporting = true;
    const btn = $("[data-ed-download]");
    btn.disabled = true;
    btn.querySelector("span").textContent = "Wird erstellt …";
    try {
      const src = state.sourceBytes ? await L.PDFDocument.load(state.sourceBytes) : null;
      const out = await L.PDFDocument.create();
      const fonts = {};
      const fontFor = async (o) => {
        const variants = STD_FONTS[o.data?.font] || STD_FONTS.helv;
        const name = variants[(o.fontWeight === "bold" ? 1 : 0) + (o.fontStyle === "italic" ? 2 : 0)];
        return (fonts[name] ||= await out.embedFont(L.StandardFonts[name]));
      };
      let skipped = false;
      for (const p of state.pages) {
        let page;
        if (src && p.src !== null) {
          [page] = await out.copyPages(src, [p.src]);
          out.addPage(page);
        } else {
          page = out.addPage([p.width, p.height]);
        }
        // Sichtbare Koordinaten (oben links, wie im Editor) → PDF-Koordinaten, auch bei gedrehten Seiten
        const box = page.getCropBox();
        const rot = ((page.getRotation().angle % 360) + 360) % 360;
        const vh = rot % 180 ? box.width : box.height;
        const map = (vx, vyTop) => {
          const vy = vh - vyTop;
          let x, y;
          if (rot === 90) [x, y] = [box.width - vy, vx];
          else if (rot === 180) [x, y] = [box.width - vx, box.height - vy];
          else if (rot === 270) [x, y] = [vy, box.height - vx];
          else [x, y] = [vx, vy];
          return { x: x + box.x, y: y + box.y };
        };
        for (const o of p.canvas.getObjects()) {
          const opacity = o.opacity ?? 1;
          if (o.data?.kind === "image") {
            const w = o.width * o.scaleX;
            const h = o.height * o.scaleY;
            const srcUrl = o.getSrc();
            const img = /^data:image\/png/.test(srcUrl) ? await out.embedPng(srcUrl) : await out.embedJpg(srcUrl);
            page.drawImage(img, { ...map(o.left, o.top + h), width: w, height: h, rotate: L.degrees(rot), opacity });
          } else if (o.data?.kind === "text") {
            const font = await fontFor(o);
            const fs = o.fontSize * o.scaleY;
            const color = colorOf(o.fill) || [0, 0, 0];
            o.textLines.forEach((raw, i) => {
              // Standardschriften kennen nur westeuropäische Zeichen
              const text = Array.from(raw).filter((ch) => {
                try {
                  font.encodeText(ch);
                  return true;
                } catch {
                  skipped = true;
                  return false;
                }
              }).join("");
              if (!text.trim()) return;
              const x = o.left + o._getLineLeftOffset(i) * o.scaleX;
              const yTop = o.top + fs * 1.13 * (i * o.lineHeight + (1 - 0.222));
              page.drawText(text, { ...map(x, yTop), size: fs, font, color: L.rgb(...color), opacity, rotate: L.degrees(rot) });
            });
          }
        }
      }
      const bytes = await out.save();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      a.download = `${(state.sourceName || "Dokument").replace(/\.pdf$/i, "")}_unterschrieben.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 60000);
      state.dirty = false;
      toast(skipped ? "Fertig! Einige Sonderzeichen im Text wurden weggelassen." : "Fertig! Deine unterschriebene PDF wird heruntergeladen.");
    } catch (e) {
      console.error(e);
      toast(/encrypt/i.test(e.message || "") ? "Diese PDF ist verschlüsselt. Entsperre sie zuerst mit „PDF entsperren“." : "Die PDF konnte nicht erstellt werden.");
    } finally {
      state.exporting = false;
      btn.disabled = false;
      btn.querySelector("span").textContent = "Herunterladen";
    }
  }

  // ---------------------------------------------------------------------------
  // Unterschrift zeichnen oder als Foto einfügen
  // ---------------------------------------------------------------------------
  const sig = root.querySelector("[data-sig]");
  const SIG_KEY = "pl_signature";
  let openSignature = () => {};
  if (sig) {
    const pad = sig.querySelector("[data-sig-pad]");
    const ctx = pad.getContext("2d");
    let color = "#111827";
    let strokes = 0;
    let uploaded = null;
    let tab = "draw";
    let pts = [];

    const savedSig = () => {
      try {
        return localStorage.getItem(SIG_KEY);
      } catch {
        return null;
      }
    };
    const clearPad = () => {
      ctx.clearRect(0, 0, pad.width, pad.height);
      strokes = 0;
    };
    const pos = (e) => {
      const r = pad.getBoundingClientRect();
      return { x: ((e.clientX - r.left) * pad.width) / r.width, y: ((e.clientY - r.top) * pad.height) / r.height };
    };
    // Zwei Arten zu zeichnen:
    //  • Ziehen (Finger, Stift, gedrückte Maustaste) – wie bisher
    //  • Klick-Modus für die Maus: ein kurzer Klick setzt den Stift auf, danach zeichnet einfaches
    //    Bewegen der Maus; der nächste Klick hebt den Stift wieder ab. Kein Gedrückthalten nötig.
    let penDown = false; // Klick-Modus aktiv
    let downAt = null; // Position beim Drücken (um Klick und Ziehen zu unterscheiden)
    const dot = (p) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.6 * inkScale(), 0, Math.PI * 2);
      ctx.fill();
    };
    const setPen = (on) => {
      penDown = on;
      pad.classList.toggle("is-pen", on);
      if (!on) pts = [];
    };
    pad.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      if (penDown) {
        // zweiter Klick: Stift absetzen
        setPen(false);
        downAt = null;
        return;
      }
      pad.setPointerCapture(e.pointerId);
      downAt = { x: e.clientX, y: e.clientY, mouse: e.pointerType === "mouse" };
      pts = [pos(e)];
      dot(pts[0]);
      strokes++;
    });
    pad.addEventListener("pointermove", (e) => {
      if (!pts.length) return;
      const p = pos(e);
      pts.push(p);
      if (pts.length < 3) return;
      // geglättete Linie durch die Mittelpunkte
      const [a, b, c] = pts.slice(-3);
      ctx.strokeStyle = color;
      ctx.lineWidth = 5.2 * inkScale();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo((a.x + b.x) / 2, (a.y + b.y) / 2);
      ctx.quadraticCurveTo(b.x, b.y, (b.x + c.x) / 2, (b.y + c.y) / 2);
      ctx.stroke();
    });
    pad.addEventListener("pointerup", (e) => {
      if (!downAt) return;
      const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
      // kurzer Mausklick ohne Bewegung → Klick-Modus: weiter zeichnen beim Bewegen
      if (downAt.mouse && moved < 4) {
        pad.releasePointerCapture?.(e.pointerId);
        setPen(true);
        pts = [pos(e)];
      } else pts = [];
      downAt = null;
    });
    pad.addEventListener("pointercancel", () => { setPen(false); downAt = null; });
    // Maus verlässt das Feld: Linie unterbrechen, beim Zurückkommen geht es im Klick-Modus weiter
    pad.addEventListener("pointerleave", () => { if (penDown) pts = []; });
    pad.addEventListener("pointerenter", (e) => { if (penDown) pts = [pos(e)]; });
    // Leertaste oder Esc hebt den Stift ebenfalls ab
    sig.addEventListener("keydown", (e) => {
      if (penDown && (e.key === "Escape" || e.key === " ")) { e.preventDefault(); setPen(false); }
    });

    // Großes Feld: das Zeichenfeld füllt den ganzen Bildschirm (Handy). Die Leinwand bekommt dabei
    // die neue Größe in echten Pixeln; was schon gezeichnet ist, wird mitskaliert (Seitenverhältnis bleibt).
    const NORMAL = { w: 900, h: 300 };
    const inkScale = () => pad.width / NORMAL.w; // Strichstärke wächst mit der Leinwand → gleiches Ergebnis
    const fullBtn = sig.querySelector("[data-sig-full]");
    const turnHint = sig.querySelector("[data-sig-turn]");
    let full = false;
    function resizePad(w, h) {
      w = Math.round(w);
      h = Math.round(h);
      if (w < 10 || h < 10 || (w === pad.width && h === pad.height)) return;
      const old = document.createElement("canvas");
      old.width = pad.width;
      old.height = pad.height;
      old.getContext("2d").drawImage(pad, 0, 0);
      pad.width = w;
      pad.height = h;
      if (strokes) {
        const k = Math.min(w / old.width, h / old.height);
        ctx.drawImage(old, (w - old.width * k) / 2, (h - old.height * k) / 2, old.width * k, old.height * k);
      }
      pts = [];
    }
    function fitFull() {
      if (!full) return;
      const r = pad.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      let w = r.width * dpr, h = r.height * dpr;
      const cap = 2000 / Math.max(w, h); // nicht unnötig riesig
      if (cap < 1) { w *= cap; h *= cap; }
      // gleiche Strichstärke wie im normalen Feld, bezogen auf die Breite
      resizePad(w, h);
      turnHint.hidden = !(window.innerHeight > window.innerWidth);
    }
    async function setFull(on) {
      full = on;
      setPen(false);
      sig.classList.toggle("sig--full", on);
      fullBtn.setAttribute("aria-pressed", String(on));
      sig.querySelector("[data-sig-full-label]").textContent = on ? "Fertig" : "Großes Feld";
      if (on) {
        // Echtes Vollbild + Querformat, wo der Browser es erlaubt (Android). iPhone: nur das große Feld.
        try { if (sig.requestFullscreen && !document.fullscreenElement) await sig.requestFullscreen({ navigationUI: "hide" }); } catch (_) {}
        try { await screen.orientation.lock("landscape"); } catch (_) {}
        requestAnimationFrame(fitFull);
      } else {
        try { screen.orientation.unlock(); } catch (_) {}
        try { if (document.fullscreenElement) await document.exitFullscreen(); } catch (_) {}
        turnHint.hidden = true;
        resizePad(NORMAL.w, NORMAL.h);
      }
    }
    fullBtn.addEventListener("click", () => setFull(!full));
    window.addEventListener("resize", () => full && requestAnimationFrame(fitFull));
    document.addEventListener("fullscreenchange", () => { if (full && !document.fullscreenElement) requestAnimationFrame(fitFull); });
    sig.addEventListener("close", () => { if (full) setFull(false); });

    // Getippte Unterschrift: Name in einer Handschrift auf eine Leinwand schreiben
    const nameInput = sig.querySelector("[data-sig-name]");
    let typedFont = { family: "Caveat", weight: 700 };
    const fontBtns = sig.querySelectorAll("[data-sig-font]");
    const refreshFonts = () => {
      const txt = nameInput.value.trim() || nameInput.placeholder;
      fontBtns.forEach((b) => { b.textContent = txt; b.style.setProperty("--sigc", color); });
    };
    nameInput.addEventListener("input", refreshFonts);
    fontBtns.forEach((b) =>
      b.addEventListener("click", () => {
        typedFont = { family: b.dataset.sigFont, weight: b.dataset.sigWeight };
        fontBtns.forEach((x) => x.setAttribute("aria-checked", String(x === b)));
      })
    );
    async function typedSignature() {
      const txt = nameInput.value.trim();
      if (!txt) return null;
      const font = `${typedFont.weight} 120px "${typedFont.family}"`;
      await document.fonts.load(font, txt); // Schrift muss geladen sein, sonst malt die Leinwand eine Ersatzschrift
      const c = document.createElement("canvas");
      const cx = c.getContext("2d");
      cx.font = font;
      c.width = Math.ceil(cx.measureText(txt).width + 120);
      c.height = 260;
      cx.font = font; // nach Größenänderung zurückgesetzt
      cx.fillStyle = color;
      cx.textBaseline = "middle";
      cx.fillText(txt, 60, 130);
      return trimmed(c, false);
    }

    /** Leerraum abschneiden; optional weißen Hintergrund entfernen (Fotos) */
    function trimmed(source, removeWhite) {
      const c = document.createElement("canvas");
      c.width = source.width;
      c.height = source.height;
      const cx = c.getContext("2d");
      cx.drawImage(source, 0, 0);
      const img = cx.getImageData(0, 0, c.width, c.height);
      const d = img.data;
      let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
      for (let y = 0; y < c.height; y++) {
        for (let x = 0; x < c.width; x++) {
          const i = (y * c.width + x) * 4;
          if (removeWhite) {
            const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            // hell → durchsichtig, dunkel → kräftig (weicher Übergang an den Kanten)
            d[i + 3] = l > 205 ? 0 : Math.min(255, Math.round(((205 - l) / 90) * 255));
          }
          if (d[i + 3] > 20) {
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
        }
      }
      if (x1 < 0) return null;
      cx.putImageData(img, 0, 0);
      const m = 6;
      const out = document.createElement("canvas");
      out.width = Math.min(c.width, x1 - x0 + 1 + 2 * m);
      out.height = Math.min(c.height, y1 - y0 + 1 + 2 * m);
      out.getContext("2d").drawImage(c, Math.max(0, x0 - m), Math.max(0, y0 - m), out.width, out.height, 0, 0, out.width, out.height);
      return out.toDataURL("image/png");
    }

    function setTab(name) {
      tab = name;
      if (typeof setPen === "function") setPen(false);
      if (name !== "draw" && typeof setFull === "function" && full) setFull(false);
      sig.querySelectorAll("[data-sig-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.sigTab === name)));
      sig.querySelectorAll("[data-sig-panel]").forEach((p) => (p.hidden = p.dataset.sigPanel !== name));
    }
    sig.querySelectorAll("[data-sig-tab]").forEach((b) => b.addEventListener("click", () => setTab(b.dataset.sigTab)));
    sig.querySelectorAll("[data-sig-color]").forEach((b) =>
      b.addEventListener("click", () => {
        color = b.dataset.sigColor;
        sig.querySelectorAll("[data-sig-color]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        refreshFonts();
      })
    );
    sig.querySelector("[data-sig-clear]").addEventListener("click", () => { setPen(false); clearPad(); });
    sig.querySelector("[data-sig-close]").addEventListener("click", () => sig.close());
    sig.querySelector("[data-sig-file]").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      e.target.value = "";
      if (!file) return;
      const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
      const s = Math.min(1, 1400 / Math.max(bmp.width, bmp.height));
      const c = document.createElement("canvas");
      c.width = Math.round(bmp.width * s);
      c.height = Math.round(bmp.height * s);
      c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
      uploaded = trimmed(c, true);
      const pv = sig.querySelector("[data-sig-preview]");
      pv.hidden = !uploaded;
      if (uploaded) pv.src = uploaded;
      else toast("Auf dem Foto wurde keine Unterschrift erkannt.");
    });

    function insertSignature(url) {
      // Seite, die gerade am meisten zu sehen ist
      const mid = window.innerHeight / 2;
      const p =
        state.pages
          .map((q) => ({ q, r: q.el.querySelector(".ed-page__stage").getBoundingClientRect() }))
          .sort((a, b) => Math.abs((a.r.top + a.r.bottom) / 2 - mid) - Math.abs((b.r.top + b.r.bottom) / 2 - mid))[0]?.q || state.pages[0];
      if (!p) return;
      const r = p.el.querySelector(".ed-page__stage").getBoundingClientRect();
      fabric.Image.fromURL(url, (img) => {
        const w = Math.min(180, p.width * 0.32);
        const s = w / img.width;
        const cy = Math.min(p.height - img.height * s - 20, Math.max(20, (mid - r.top) / p.scale));
        img.set({ left: (p.width - w) / 2, top: cy, scaleX: s, scaleY: s, strokeWidth: 0, data: { kind: "image", signature: true } });
        applyObjectDefaults(img);
        p.canvas.add(img);
        setTool("select");
        p.canvas.setActiveObject(img);
        p.canvas.requestRenderAll();
        state.lastPage = p;
      });
    }

    sig.querySelector("[data-sig-insert]").addEventListener("click", async () => {
      setPen(false);
      const url = tab === "draw" ? (strokes ? trimmed(pad, false) : null) : tab === "type" ? await typedSignature() : uploaded;
      if (!url) return toast(tab === "draw" ? "Bitte unterschreibe zuerst im Feld." : tab === "type" ? "Bitte tippe zuerst deinen Namen ein." : "Bitte wähle zuerst ein Foto deiner Unterschrift aus.");
      if (sig.querySelector("[data-sig-remember]").checked) {
        try {
          localStorage.setItem(SIG_KEY, url);
        } catch {
          /* Speicher nicht verfügbar – egal */
        }
      }
      sig.close();
      insertSignature(url);
    });
    sig.querySelector("[data-sig-saved]").addEventListener("click", () => {
      const url = savedSig();
      sig.close();
      if (url) insertSignature(url);
    });

    openSignature = () => {
      if (!state.pages.length) return;
      clearPad();
      uploaded = null;
      sig.querySelector("[data-sig-preview]").hidden = true;
      sig.querySelector("[data-sig-saved]").hidden = !savedSig();
      setPen(false);
      if (full) setFull(false);
      refreshFonts();
      setTab("draw");
      sig.showModal();
    };
  }

  // ---------------------------------------------------------------------------
  // Anmelden / Bezahlen im Dialog
  // ---------------------------------------------------------------------------
  const modal = $("[data-modal]");
  function openModal(view) {
    modal.querySelectorAll("[data-modal-view]").forEach((v) => (v.hidden = v.dataset.modalView !== view));
    if (!modal.open) modal.showModal();
  }
  modal.querySelector("[data-modal-close]").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
  });

  if (window.PL) {
    PL.bindAuth(modal.querySelector('[data-modal-view="auth"]'), async (user) => {
      document.querySelectorAll("[data-account]").forEach((a) => {
        a.textContent = "Mein Konto";
        a.href = "/konto.html";
      });
      if (user.access.active) {
        modal.close();
        exportPdf();
      } else {
        openModal("plans");
      }
    });
    PL.bindPlans(modal.querySelector('[data-modal-view="plans"]'), {
      returnTo: `${location.pathname}?restore=1`,
      beforeRedirect: saveDraft,
    });
  }

  // ---------------------------------------------------------------------------
  // Entwurf sichern (für die Rückkehr von der Bezahlseite)
  // ---------------------------------------------------------------------------
  function idb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open("pdf-libre-editor", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("drafts");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function idbOp(mode, fn) {
    const db = await idb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("drafts", mode);
      const r = fn(tx.objectStore("drafts"));
      tx.oncomplete = () => resolve(r && r.result);
      tx.onerror = () => reject(tx.error);
    });
  }
  function saveDraft() {
    const draft = {
      path: location.pathname,
      sourceBytes: state.sourceBytes,
      sourceName: state.sourceName,
      pages: state.pages.map((p) => ({ src: p.src, width: p.width, height: p.height, json: p.canvas.toJSON(PROPS_TO_SAVE) })),
      savedAt: Date.now(),
    };
    return idbOp("readwrite", (s) => s.put(draft, "current")).catch((e) => console.warn("Entwurf nicht gespeichert", e));
  }
  function loadDraft() {
    return idbOp("readonly", (s) => s.get("current")).catch(() => null);
  }
  function clearDraft() {
    return idbOp("readwrite", (s) => s.delete("current")).catch(() => {});
  }

  // ---------------------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------------------
  $("[data-ed-open]").addEventListener("change", (e) => {
    const f = e.target.files[0];
    e.target.value = "";
    if (f) openFile(f);
  });
  const blankBtn = $("[data-ed-blank]");
  if (blankBtn) blankBtn.addEventListener("click", () => loadDocument({}));

  const drop = $("[data-drop]");
  ["dragenter", "dragover"].forEach((t) =>
    stages.pick.addEventListener(t, (e) => {
      e.preventDefault();
      drop.classList.add("is-over");
    })
  );
  ["dragleave", "drop"].forEach((t) => stages.pick.addEventListener(t, () => drop.classList.remove("is-over")));
  stages.pick.addEventListener("drop", (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) openFile(f);
  });

  window.addEventListener("beforeunload", (e) => {
    if (state.dirty && !state.redirecting) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
  // Bei Weiterleitung zu Stripe nicht nachfragen
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-checkout]")) state.redirecting = true;
  });

  (async () => {
    const params = new URLSearchParams(location.search);
    if (params.get("restore")) {
      const draft = await loadDraft();
      let user = null;
      if (params.get("checkout") === "success" && window.PL) user = await PL.confirmCheckoutFromUrl().catch(() => null);
      history.replaceState(null, "", location.pathname);
      if (draft && draft.path === location.pathname) {
        await loadDocument({ sourceBytes: draft.sourceBytes, sourceName: draft.sourceName, pages: draft.pages });
        state.dirty = true;
        if (user && user.access.active) {
          toast("Freigeschaltet! Deine PDF wird jetzt erstellt.");
          exportPdf();
        } else if (params.get("checkout") === "cancel") {
          toast("Zahlung abgebrochen. Deine Bearbeitung ist noch da.");
        }
        return;
      }
    }
    if (root.dataset.start === "blank") loadDocument({});
  })();
})();

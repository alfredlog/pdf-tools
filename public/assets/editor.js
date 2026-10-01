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

  async function renderBackground(p) {
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

  function setTool(tool) {
    if (tool === "image") return $("[data-ed-image]").click();
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
        if (!o.data || !o.data.locked) o.selectable = tool === "select";
      });
      if (tool !== "select") c.discardActiveObject();
      c.requestRenderAll();
      if (tool === "edittext" && p.src !== null) buildTextLayer(p);
      p.textLayer.hidden = tool !== "edittext";
    }
    updateProps();
  }

  $$("[data-ed-tool]").forEach((b) => b.addEventListener("click", () => setTool(b.dataset.edTool)));

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
      fontFamily: FONT_CSS[font],
      fontSize: opts.size || Number(defaults.size) || 16,
      fill: opts.color || defaults.color,
      fontWeight: (opts.bold ?? defaults.bold) ? "bold" : "normal",
      fontStyle: (opts.italic ?? defaults.italic) ? "italic" : "normal",
      opacity: defaults.opacity / 100,
      strokeWidth: 0,
      lineHeight: 1.16,
      editingBorderColor: "#2b4bdb",
      cursorColor: "#2b4bdb",
      data: { kind: "text", font },
    });
  }

  let drawing = null;

  function wireCanvas(p) {
    const c = p.canvas;

    c.on("mouse:down", (opt) => {
      state.lastPage = p;
      const pt = c.getPointer(opt.e);
      const tool = state.tool;
      if (tool === "text") {
        if (opt.target && opt.target.type === "i-text") return;
        const t = makeText(pt.x, pt.y - (Number(defaults.size) || 16) / 2);
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
    c.on("text:changed", () => (state.dirty = true));
    c.on("text:editing:exited", (opt) => {
      const t = opt.target;
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
      if (!o.data.locked) o.selectable = state.tool === "select";
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
    const values = { ...defaults };
    if (o) {
      if (o.data?.kind === "text") {
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

  function applyProp(name, value) {
    defaults[name] = value;
    const { p, objs } = kindsInSelection();
    if (state.tool === "draw") setTool("draw");
    if (!p) return;
    for (const o of objs) {
      const kind = o.data?.kind;
      if (kind === "text") {
        if (name === "font") {
          o.set({ fontFamily: FONT_CSS[value] });
          o.data.font = value;
        }
        if (name === "size") o.set({ fontSize: Number(value) / (o.scaleY || 1) });
        if (name === "color") o.set({ fill: value });
        if (name === "bold") o.set({ fontWeight: value ? "bold" : "normal" });
        if (name === "italic") o.set({ fontStyle: value ? "italic" : "normal" });
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
    const items = [];
    for (const it of content.items) {
      if (!it.str || !it.str.trim()) continue;
      const tx = pdfjsLib.Util.transform(vp.transform, it.transform);
      if (Math.abs(tx[1]) > 0.01 || Math.abs(tx[2]) > 0.01 || tx[0] <= 0) continue; // nur waagerechter Text
      const fh = Math.hypot(tx[2], tx[3]);
      const family = content.styles[it.fontName]?.fontFamily || "";
      const font = /mono|courier/i.test(family) ? "cour" : /serif/i.test(family) && !/sans/i.test(family) ? "tiro" : "helv";
      items.push({ str: it.str, x: tx[4], y: tx[5], w: it.width, fh, font });
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
        lines.push({ text: it.str, x: it.x, y: it.y, w: it.w, fh: it.fh, font: it.font });
      }
    }
    return lines.map((l) => ({ ...l, text: l.text.trim(), top: l.y - l.fh * 0.92, h: l.fh * 1.2 }));
  }

  function replaceLine(p, i) {
    const ln = p.lines[i];
    const c = p.canvas;
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
      data: { kind: "redact", locked: true, replacesLine: i },
    });
    const size = Math.round(ln.fh * 10) / 10;
    const t = makeText(ln.x, ln.y - size * FABRIC_BASELINE, ln.text, { font: ln.font, size, color: "#000000", bold: false, italic: false });
    t.data.replacesLine = i;
    t.opacity = 1;
    applyObjectDefaults(cover);
    applyObjectDefaults(t);
    c.add(cover);
    c.add(t);
    suspendHistory = false;
    recordChange(p);
    buildTextLayer(p, true);
    setTool("select");
    c.setActiveObject(t);
    t.enterEditing();
    t.selectAll();
    c.requestRenderAll();
  }

  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------
  function buildSpec() {
    const images = [];
    const pages = state.pages.map((p) => {
      const redactions = [];
      const items = [];
      for (const o of p.canvas.getObjects()) {
        const kind = o.data?.kind;
        const sw = o.stroke ? o.strokeWidth || 0 : 0;
        const box = () => ({ x: o.left + sw / 2, y: o.top + sw / 2, w: o.width * o.scaleX, h: o.height * o.scaleY });
        const opacity = o.opacity ?? 1;

        if (kind === "redact") {
          const b = box();
          redactions.push({ x: o.left, y: o.top, w: b.w + sw, h: b.h + sw });
        } else if (kind === "text") {
          const fs = o.fontSize * o.scaleY;
          const lines = o.textLines.map((text, i) => ({
            text,
            x: o.left + o._getLineLeftOffset(i) * o.scaleX,
            y: o.top + fs * 1.13 * (i * o.lineHeight + (1 - 0.222)),
          }));
          items.push({ type: "text", lines, size: fs, font: o.data.font || "helv", bold: o.fontWeight === "bold", italic: o.fontStyle === "italic", color: colorOf(o.fill), opacity });
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
      return { src: p.src, width: p.width, height: p.height, redactions, items };
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

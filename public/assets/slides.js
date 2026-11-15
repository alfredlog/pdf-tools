/* PDF → PowerPoint: Live-Vorschau mit Design-Auswahl.
   Die Farbregeln (adaptColor) entsprechen adapt_color() in pdf_slides.py – Vorschau und Datei sehen gleich aus. */
(() => {
  "use strict";
  const root = document.querySelector("[data-slides]");
  if (!root) return;
  const $ = (s) => root.querySelector(s);
  const $$ = (s) => [...root.querySelectorAll(s)];
  const stages = { pick: $(".stage--pick"), busy: $(".stage--busy"), work: $(".stage--work") };
  const show = (name) => Object.entries(stages).forEach(([k, el]) => (el.hidden = k !== name));

  const PRESETS = {
    orig: { bg: "#ffffff", accent: null, font: "orig" },
    modern: { bg: "#f8fafc", accent: "#4f46e5", font: "Calibri" },
    dark: { bg: "#0f172a", accent: "#f59e0b", font: "Calibri" },
    soft: { bg: "#fdf6ec", accent: "#b45309", font: "Georgia" },
  };
  // Ersatzschriften mit gleichen Maßen, falls die Schrift auf diesem Gerät fehlt
  const FALLBACK = {
    Calibri: "Calibri, Carlito, sans-serif",
    Arial: "Arial, 'Liberation Sans', Arimo, sans-serif",
    Helvetica: "Helvetica, Arial, 'Liberation Sans', sans-serif",
    Verdana: "Verdana, 'DejaVu Sans', sans-serif",
    Georgia: "Georgia, 'Gelasio', serif",
    "Times New Roman": "'Times New Roman', 'Liberation Serif', Tinos, serif",
  };

  let data = null; // Antwort von /api/slides/analyze
  let cur = 0;
  let selected = new Set();
  const opts = { bg: "#ffffff", accent: null, font: "orig", format: "orig", hideRepeat: false };

  // ------------------------------------------------------------------ Farben
  const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const rgbToHex = (c) => "#" + c.map((v) => Math.max(0, Math.min(255, Math.round(v * 255))).toString(16).padStart(2, "0")).join("");
  const lum = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  function rgbToHls([r, g, b]) {
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (mx === mn) return [0, l, 0];
    const d = mx - mn;
    const s = l <= 0.5 ? d / (mx + mn) : d / (2 - mx - mn);
    const rc = (mx - r) / d, gc = (mx - g) / d, bc = (mx - b) / d;
    let h = r === mx ? bc - gc : g === mx ? 2 + rc - bc : 4 + gc - rc;
    h = ((h / 6) % 1 + 1) % 1;
    return [h, l, s];
  }
  function hlsToRgb(h, l, s) {
    if (s === 0) return [l, l, l];
    const m2 = l <= 0.5 ? l * (1 + s) : l + s - l * s, m1 = 2 * l - m2;
    const v = (hue) => {
      hue = ((hue % 1) + 1) % 1;
      if (hue < 1 / 6) return m1 + (m2 - m1) * hue * 6;
      if (hue < 0.5) return m2;
      if (hue < 2 / 3) return m1 + (m2 - m1) * (2 / 3 - hue) * 6;
      return m1;
    };
    return [v(h + 1 / 3), v(h), v(h - 1 / 3)];
  }
  const isDark = () => lum(hexToRgb(opts.bg)) < 0.45;
  function adaptColor(color) {
    let rgb = hexToRgb(color);
    if (opts.accent && data.accent && dist(rgb, hexToRgb(data.accent)) < 0.12) rgb = hexToRgb(opts.accent);
    if (isDark()) {
      let [h, l, s] = rgbToHls(rgb);
      if (s < 0.2) l = Math.min(0.94, Math.max(0.12, 1 - l));
      else if (l < 0.55) l = 0.68;
      rgb = hlsToRgb(h, l, s);
    }
    return rgbToHex(rgb);
  }

  // ------------------------------------------------------------------ Vorschau
  const familyOf = (font) =>
    font
      .split(/[-,]/)[0]
      .replace(/(PSMT|PS|MT)$/, "")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
      .replace(/\s+(Bold|Italic|Regular|Caption|Narrow|Book|Light|Medium)$/, "")
      .trim() || "Arial";
  const cssFont = (r) => {
    const fam = opts.font === "orig" ? familyOf(r.font) : opts.font;
    return FALLBACK[fam] || `'${fam}', 'Liberation Sans', Arial, sans-serif`;
  };

  function slideBox(p) {
    if (opts.format === "16:9") return [16, 9];
    if (opts.format === "4:3") return [4, 3];
    return [p.w, p.h];
  }

  function renderSlide(el, i, width) {
    const p = data.pages[i];
    const [bw, bh] = slideBox(p);
    const W = width, H = (width * bh) / bw;
    const s = Math.min(W / p.w, H / p.h);
    const ox = (W - p.w * s) / 2, oy = (H - p.h * s) / 2;
    el.style.width = W + "px";
    el.style.height = H + "px";
    el.style.background = opts.bg;
    el.textContent = "";
    const img = new Image();
    img.alt = "";
    img.src = `/api/slides/${data.token}/${isDark() ? "dark-" : ""}${p.img}`;
    Object.assign(img.style, { left: ox + "px", top: oy + "px", width: p.w * s + "px", height: p.h * s + "px" });
    el.appendChild(img);
    if (opts.hideRepeat) {
      const lines = new Set(p.texts.filter((t) => t.repeat && t.line).map((t) => t.line.join(",")));
      for (const l of lines) {
        const [x0, y0, x1, y1] = l.split(",").map(Number);
        const c = document.createElement("i");
        Object.assign(c.style, { left: ox + (x0 - 1) * s + "px", top: oy + (y0 - 1) * s + "px", width: (x1 - x0 + 2) * s + "px", height: (y1 - y0 + 2) * s + "px", background: opts.bg });
        el.appendChild(c);
      }
    }
    const spans = [];
    for (const t of p.texts) {
      if (opts.hideRepeat && t.repeat) continue;
      const box = document.createElement("span");
      box.style.left = ox + t.x * s + "px";
      box.style.top = oy + t.y * s + "px";
      for (const r of t.runs) {
        const run = document.createElement("span");
        run.textContent = r.t;
        run.style.fontSize = r.size * s + "px";
        run.style.fontFamily = cssFont(r);
        run.style.fontWeight = r.bold ? "700" : "400";
        run.style.fontStyle = r.italic ? "italic" : "normal";
        run.style.color = adaptColor(r.color);
        box.appendChild(run);
      }
      el.appendChild(box);
      spans.push([box, t.w * s]);
    }
    // gleiche Breite wie im Original (PowerPoint bekommt dafür einen angepassten Zeichenabstand)
    for (const [box, w] of spans) {
      const real = box.getBoundingClientRect().width;
      if (real > 0) box.style.transform = `scaleX(${Math.max(0.8, Math.min(1.08, w / real))})`;
    }
  }

  function render() {
    const slide = $("[data-slide]");
    const width = Math.min($(".sl-stage").clientWidth, 900);
    renderSlide(slide, cur, width);
    $("[data-counter]").textContent = `Folie ${cur + 1} von ${data.pages.length}`;
    $$(".sl-thumb").forEach((li, i) => li.classList.toggle("is-cur", i === cur));
    $("[data-summary]").textContent = `${selected.size} von ${data.pages.length} Folien ausgewählt`;
    $("[data-build]").disabled = selected.size === 0;
  }

  function thumbs() {
    const ol = $("[data-thumbs]");
    ol.textContent = "";
    data.pages.forEach((p, i) => {
      const li = document.createElement("li");
      li.className = "sl-thumb";
      li.innerHTML = `<button type="button" class="sl-thumb__show" aria-label="Folie ${i + 1} anzeigen"><img alt="" loading="lazy" src="/api/slides/${data.token}/${p.thumb}"><b>${i + 1}</b></button>
        <label class="sl-thumb__pick"><input type="checkbox" ${selected.has(i) ? "checked" : ""}> übernehmen</label>`;
      li.querySelector("button").addEventListener("click", () => {
        cur = i;
        render();
      });
      li.querySelector("input").addEventListener("change", (e) => {
        e.target.checked ? selected.add(i) : selected.delete(i);
        li.classList.toggle("is-off", !e.target.checked);
        render();
      });
      ol.appendChild(li);
    });
  }

  // ------------------------------------------------------------------ Bedienung
  function setControls() {
    $('[data-opt="bg"]').value = opts.bg;
    $('[data-opt="accent"]').value = opts.accent || data.accent || "#000000";
    $('[data-opt="font"]').value = opts.font;
    $('[data-opt="format"]').value = opts.format;
    $('[data-opt="hideRepeat"]').checked = opts.hideRepeat;
    $('[data-opt="accent"]').disabled = !data.accent;
  }

  $$("[data-preset]").forEach((b) =>
    b.addEventListener("click", () => {
      Object.assign(opts, PRESETS[b.dataset.preset]);
      $$("[data-preset]").forEach((x) => {
        x.classList.toggle("is-on", x === b);
        x.setAttribute("aria-pressed", String(x === b));
      });
      setControls();
      render();
    })
  );
  $$("[data-opt]").forEach((el) =>
    el.addEventListener("input", () => {
      const k = el.dataset.opt;
      opts[k] = el.type === "checkbox" ? el.checked : el.value;
      if (k === "accent" && el.value.toLowerCase() === (data.accent || "").toLowerCase()) opts.accent = null;
      if (["bg", "accent", "font"].includes(k)) $$("[data-preset]").forEach((x) => x.classList.remove("is-on"));
      render();
    })
  );
  $("[data-prev]").addEventListener("click", () => {
    cur = (cur + data.pages.length - 1) % data.pages.length;
    render();
  });
  $("[data-next]").addEventListener("click", () => {
    cur = (cur + 1) % data.pages.length;
    render();
  });
  document.addEventListener("keydown", (e) => {
    if (stages.work.hidden || /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if (e.key === "ArrowRight") $("[data-next]").click();
    if (e.key === "ArrowLeft") $("[data-prev]").click();
  });
  const pickAll = (on) => {
    selected = new Set(on ? data.pages.map((_, i) => i) : []);
    $$(".sl-thumb input").forEach((c) => (c.checked = on));
    $$(".sl-thumb").forEach((li) => li.classList.toggle("is-off", !on));
    render();
  };
  $("[data-all]").addEventListener("click", () => pickAll(true));
  $("[data-none]").addEventListener("click", () => pickAll(false));
  let resizeT;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => data && !stages.work.hidden && render(), 120);
  });

  const errBox = $("[data-error]");
  const showError = (msg) => {
    errBox.textContent = msg;
    errBox.hidden = !msg;
  };

  // ------------------------------------------------------------------ Hochladen
  async function upload(file) {
    if (!/\.pdf$/i.test(file.name)) return alert("Bitte wähle eine PDF-Datei.");
    show("busy");
    const bar = $("[data-progress]");
    const text = $("[data-busy-text]");
    bar.style.width = "0%";
    text.textContent = "Wird hochgeladen …";
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/slides/analyze");
        xhr.responseType = "json";
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) bar.style.width = Math.round((e.loaded / e.total) * 60) + "%";
        };
        xhr.upload.onload = () => {
          bar.style.width = "70%";
          text.textContent = "Folien werden vorbereitet …";
        };
        xhr.onload = () => (xhr.status < 300 ? resolve(xhr.response) : reject(new Error((xhr.response && xhr.response.error) || "Die Datei konnte nicht verarbeitet werden.")));
        xhr.onerror = () => reject(new Error("Keine Verbindung zum Server."));
        xhr.send(fd);
      });
      bar.style.width = "100%";
      data = res;
      cur = 0;
      selected = new Set(data.pages.map((_, i) => i));
      Object.assign(opts, PRESETS.orig, { format: "orig", hideRepeat: false });
      $$("[data-preset]").forEach((x, i) => x.classList.toggle("is-on", i === 0));
      showError("");
      show("work");
      setControls();
      thumbs();
      render();
    } catch (e) {
      show("pick");
      alert(e.message);
    }
  }

  const input = $('.stage--pick input[type="file"]');
  input.addEventListener("change", () => input.files[0] && upload(input.files[0]));
  const drop = $("[data-drop]");
  ["dragenter", "dragover"].forEach((t) =>
    drop.addEventListener(t, (e) => {
      e.preventDefault();
      drop.classList.add("is-over");
    })
  );
  ["dragleave", "drop"].forEach((t) => drop.addEventListener(t, () => drop.classList.remove("is-over")));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) upload(f);
  });
  $("[data-reset]").addEventListener("click", () => {
    data = null;
    input.value = "";
    show("pick");
  });

  // ------------------------------------------------------------------ Herunterladen
  $("[data-build]").addEventListener("click", async () => {
    const btn = $("[data-build]");
    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = "Wird erstellt …";
    showError("");
    try {
      const res = await fetch(`/api/slides/${data.token}/build`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...opts, pages: [...selected].sort((a, b) => a - b) }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Die Präsentation konnte nicht erstellt werden.");
      }
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = data.name || "praesentation.pptx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 60000);
    } catch (e) {
      showError(e.message);
    } finally {
      btn.textContent = label;
      btn.disabled = selected.size === 0;
    }
  });
})();

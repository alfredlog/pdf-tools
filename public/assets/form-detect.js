/* Formularfelder in „flachen“ PDFs erkennen (gedruckt + gescannt oder ohne Formularfelder erstellt).
 * Läuft komplett im Browser: Die Seite wird auf ein Canvas gezeichnet und die Pixel werden analysiert.
 *
 * Was erkannt wird:
 *  1. Kästchen/Tabellenzellen: Flächen, die rundum von Linien eingeschlossen sind.
 *     – leer → ganzes Kästchen wird ein Textfeld (hoch → mehrzeilig)
 *     – mit Beschriftung („Name:“) → der freie Platz rechts daneben oder darunter
 *     – klein und quadratisch → Ankreuzfeld
 *  2. Schreiblinien („Name: ________“): waagerechte Linien ohne Kasten → Textfeld direkt darüber.
 *  3. In PDFs mit echtem Text zusätzlich: Punkt-/Unterstrich-Linien („........“) und ☐-Zeichen.
 *
 * Ergebnis: [{ kind: "text" | "check", rect: [x0, y0, x1, y1] (PDF-Punkte, Seite oben links = 0,0), label, multiline }]
 */
(() => {
  "use strict";
  const S = 2; // Analyse mit 2 Pixeln pro PDF-Punkt (≈ 144 dpi)

  async function detect(page) {
    const vp = page.getViewport({ scale: S });
    const W = Math.floor(vp.width), H = Math.floor(vp.height);
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, W, H);
    await page.render({ canvasContext: ctx, viewport: vp, annotationMode: pdfjsLib.AnnotationMode.DISABLE }).promise;

    // ---------------------------------------------------------------- 1. echter Text (fehlt bei Scans)
    const words = [];
    const leaders = [];
    try {
      const tc = await page.getTextContent();
      for (const it of tc.items) {
        if (!it.str || !it.str.trim()) continue;
        const [, b, , d, e, f] = pdfjsLib.Util.transform(vp.transform, it.transform);
        const fh = Math.hypot(b, d) || 10;
        const x = e, y1 = f, y0 = f - fh, x1 = e + it.width * S;
        words.push({ str: it.str, px: [x, y0, x1, y1] });
        const cw = (x1 - x) / it.str.length;
        // Punkt- oder Unterstrich-Linien als Platzhalter („Geburtsdatum: ..........“)
        const re = /[._…]{5,}/g;
        let m;
        while ((m = re.exec(it.str))) {
          const fx0 = x + m.index * cw, fx1 = x + (m.index + m[0].length) * cw;
          const before = it.str.slice(0, m.index).replace(/[._…]{3,}/g, " ").replace(/[:*\s]+$/, "").trim();
          if (fx1 - fx0 >= 30) leaders.push({ kind: "text", px: [fx0, y1 - fh * 1.3, fx1, y1 + 1], leader: true, label: before.slice(-60) });
        }
        const box = /[☐□❏❑]/g;
        while ((m = box.exec(it.str))) leaders.push({ kind: "check", px: [x + m.index * cw, y0, x + (m.index + 1) * cw, y1], leader: true, label: it.str.slice(m.index + 1).trim().slice(0, 60) });
      }
    } catch (_) {}
    const scanned = words.length < 3;

    // ---------------------------------------------------------------- 2. dunkle Pixel (gescannt: vorher gerade drehen)
    let theta = 0;
    let dark = binarize(ctx.getImageData(0, 0, W, H).data, W * H);
    if (scanned) {
      theta = skew(dark, W, H);
      if (Math.abs(theta) > 0.0008) {
        const c2 = document.createElement("canvas");
        c2.width = W; c2.height = H;
        const x2 = c2.getContext("2d", { willReadFrequently: true });
        x2.fillStyle = "#fff"; x2.fillRect(0, 0, W, H);
        x2.translate(W / 2, H / 2); x2.rotate(theta); x2.drawImage(canvas, -W / 2, -H / 2);
        dark = binarize(x2.getImageData(0, 0, W, H).data, W * H);
      } else theta = 0;
    }

    // ---------------------------------------------------------------- 2. Linien finden
    // Waagerechte Linien: lange dunkle Läufe in einer Pixelzeile (kleine Lücken ≤ 2 px, z. B. bei Scans, werden überbrückt)
    const hRuns = runs(dark, W, H, true, 16);
    const vRuns = runs(dark, W, H, false, 14);
    const hSegs = merge(hRuns), vSegs = merge(vRuns);

    const lines = new Uint8Array(W * H);
    // 1 px dicker zeichnen: so schließen auch leicht unterbrochene Linien die Kästchen
    for (const s of hSegs) for (let y = Math.max(0, s.a0 - 1); y <= Math.min(H - 1, s.a1 + 1); y++) lines.fill(1, y * W + Math.max(0, s.b0 - 1), y * W + Math.min(W, s.b1 + 2));
    for (const s of vSegs) for (let x = Math.max(0, s.a0 - 1); x <= Math.min(W - 1, s.a1 + 1); x++) for (let y = Math.max(0, s.b0 - 1); y <= Math.min(H - 1, s.b1 + 1); y++) lines[y * W + x] = 1;

    // ---------------------------------------------------------------- 3. eingeschlossene Flächen (Kästchen)
    const fields = [];
    const usedH = new Set();
    const cells = [];
    for (const c of regions(lines, W, H)) {
      const bw = c.x1 - c.x0 + 1, bh = c.y1 - c.y0 + 1;
      if (c.border || bw < 16 || bh < 12) continue;
      if (c.area < 0.85 * bw * bh) continue; // nicht rechteckig
      if (bw * bh > 0.25 * W * H || bh > 0.4 * H) continue; // Seitenrahmen o. Ä.
      // Linien am Rand dieses Kastens sind keine Schreiblinien
      hSegs.forEach((s, i) => { if ((Math.abs(s.a0 - c.y0) <= 4 || Math.abs(s.a1 - c.y1) <= 4) && s.b0 <= c.x0 + 4 && s.b1 >= c.x1 - 4) usedH.add(i); });
      hSegs.forEach((s, i) => { if ((Math.abs(s.a1 - (c.y0 - 1)) <= 4 || Math.abs(s.a0 - (c.y1 + 1)) <= 4) && overlap(s.b0, s.b1, c.x0, c.x1) > 0.5 * bw) usedH.add(i); });

      c.content = inkBox(dark, W, c.x0 + 2, c.y0 + 2, c.x1 - 2, c.y1 - 2);
      cells.push(c);
    }
    const ML = 72; // ab 36 pt Höhe: mehrzeiliges Feld
    for (const c of cells) {
      const bw = c.x1 - c.x0 + 1, bh = c.y1 - c.y0 + 1, content = c.content;
      const square = Math.abs(bw - bh) <= 0.25 * Math.max(bw, bh);
      if (square && bw >= 12 && bw <= 44) {
        if (!content || content.n < 0.04 * bw * bh) fields.push({ kind: "check", px: [c.x0, c.y0, c.x1, c.y1] });
        continue;
      }
      if (!content) {
        fields.push({ kind: "text", px: [c.x0 + 2, c.y0 + 2, c.x1 - 2, c.y1 - 2], multiline: bh > ML });
        continue;
      }
      if (content.y1 - content.y0 > 0.5 * bh && bh > ML) continue; // Kasten voller Text
      // Tabellenkopf: direkt darunter liegt eine leere Zelle gleicher Breite → keine Eingabe in den Kopf
      const header = cells.some((o) => o !== c && !o.content && Math.abs(o.x0 - c.x0) <= 6 && Math.abs(o.x1 - c.x1) <= 6 && o.y0 > c.y1 && o.y0 - c.y1 <= 8);
      if (header) continue;
      if (c.x1 - content.x1 >= Math.max(40, 0.35 * bw)) {
        fields.push({ kind: "text", px: [content.x1 + 8, c.y0 + 2, c.x1 - 2, c.y1 - 2], multiline: bh > ML });
      } else if (c.y1 - content.y1 >= 24) {
        fields.push({ kind: "text", px: [c.x0 + 2, content.y1 + 4, c.x1 - 2, c.y1 - 2], multiline: c.y1 - content.y1 > ML });
      }
    }

    // ---------------------------------------------------------------- 4. Schreiblinien
    hSegs.forEach((s, i) => {
      if (usedH.has(i) || s.a1 - s.a0 > 5) return;
      const len = s.b1 - s.b0;
      if (len < 40) return;
      // senkrechte Linie, die an einem Ende der Linie nach oben geht → Teil eines Kastens
      if (vSegs.some((v) => v.b1 >= s.a0 - 4 && v.b0 < s.a0 - 10 && (Math.abs(v.a0 - s.b0) <= 4 || Math.abs(v.a1 - s.b1) <= 4))) return;
      // freier Platz über der Linie (ohne Tinte)
      const x0 = s.b0 + 2, x1 = s.b1 - 2;
      let free = 0;
      for (let y = s.a0 - 2; y > 0 && free < 44; y--, free++) {
        let ink = 0;
        for (let x = x0; x <= x1; x++) ink += dark[y * W + x];
        if (ink > 1) break;
      }
      if (free < 14) return; // Text direkt auf der Linie → bereits ausgefüllt oder unterstrichener Text
      // direkt unter der „Linie“ Tinte → es ist die Oberkante von Buchstaben, keine Schreiblinie
      let below = 0;
      for (let y = s.a1 + 2; y <= Math.min(H - 1, s.a1 + 6); y++) for (let x = x0; x <= x1; x++) below += dark[y * W + x];
      if (below > 0.1 * (x1 - x0) * 5) return;
      const h = Math.min(free, 40);
      fields.push({ kind: "text", px: [s.b0, s.a0 - 1 - h, s.b1, s.a0 - 2], multiline: false });
    });

    fields.push(...leaders);

    // ---------------------------------------------------------------- 6. aufräumen
    const out = [];
    for (const f of fields.sort((p, q) => p.px[1] - q.px[1] || p.px[0] - q.px[0])) {
      // Felder, die echten Text überdecken (außer Platzhalter-Punkten), sind keine leeren Felder
      if (!f.leader && f.kind === "text" && words.some((w) => !/^[\s._…:]*$/.test(w.str) && inter(w.px, f.px) > 0.5 * area(w.px))) continue;
      if (out.some((o) => inter(o.px, f.px) > 0.4 * Math.min(area(o.px), area(f.px)))) continue;
      out.push(f);
    }
    for (const f of out) if (!f.label) f.label = labelFor(f, words);
    // zurück in die (schräge) Originalseite drehen
    const back = (x, y) => {
      const dx = x - W / 2, dy = y - H / 2, co = Math.cos(-theta), si = Math.sin(-theta);
      return [W / 2 + dx * co - dy * si, H / 2 + dx * si + dy * co];
    };
    return out.map((f) => {
      let [x0, y0, x1, y1] = f.px;
      if (theta) {
        const [cx, cy] = back((x0 + x1) / 2, (y0 + y1) / 2);
        const hw = (x1 - x0) / 2, hh = (y1 - y0) / 2;
        [x0, y0, x1, y1] = [cx - hw, cy - hh, cx + hw, cy + hh];
      }
      return { kind: f.kind, multiline: !!f.multiline, label: f.label || "", rect: [x0, y0, x1, y1].map((v) => v / S) };
    });
  }

  function binarize(rgba, n) {
    const dark = new Uint8Array(n);
    for (let i = 0, j = 0; j < n; i += 4, j++) dark[j] = 0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2] < 170 ? 1 : 0;
    return dark;
  }
  // Schräglage eines Scans schätzen: Bei welchem Drehwinkel liegen die dunklen Pixel am stärksten in Zeilen?
  // (Linien und Textzeilen ergeben dann scharfe Spitzen im Zeilen-Histogramm)
  function skew(dark, W, H) {
    const pts = [];
    for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (dark[y * W + x]) pts.push(x - W / 2, y - H / 2);
    if (pts.length < 200) return 0;
    let best = 0, bestScore = -1;
    const hist = new Float64Array(H + 200);
    for (let deg = -3; deg <= 3.0001; deg += 0.1) {
      const t = (deg * Math.PI) / 180, si = Math.sin(t), co = Math.cos(t);
      hist.fill(0);
      for (let i = 0; i < pts.length; i += 2) {
        const yy = Math.round(H / 2 + pts[i] * si + pts[i + 1] * co) + 100;
        if (yy >= 0 && yy < hist.length) hist[yy]++;
      }
      let score = 0;
      for (let i = 0; i < hist.length; i++) score += hist[i] * hist[i];
      if (score > bestScore) { bestScore = score; best = t; }
    }
    return best;
  }
  // Läufe dunkler Pixel (waagerecht: pro Zeile, senkrecht: pro Spalte), Lücken ≤ 2 px werden überbrückt
  function runs(dark, W, H, horizontal, minLen) {
    const out = [];
    const nA = horizontal ? H : W, nB = horizontal ? W : H;
    for (let a = 0; a < nA; a++) {
      let start = -1, gap = 0;
      for (let b = 0; b <= nB; b++) {
        const v = b < nB && (horizontal ? dark[a * W + b] : dark[b * W + a]);
        if (v) { if (start < 0) start = b; gap = 0; }
        else if (start >= 0 && ++gap > 2) {
          const end = b - gap;
          if (end - start + 1 >= minLen) out.push({ a, b0: start, b1: end });
          start = -1; gap = 0;
        }
      }
    }
    return out;
  }
  // benachbarte Läufe (Zeile für Zeile) zu einer dicken Linie zusammenfassen
  function merge(rs) {
    const segs = [];
    let open = [];
    let lastA = -2;
    for (const r of rs) {
      if (r.a !== lastA) { open = open.filter((s) => s.a1 >= r.a - 1); lastA = r.a; }
      const s = open.find((o) => o.a1 === r.a - 1 && overlap(o.b0, o.b1, r.b0, r.b1) > 0.7 * Math.min(o.b1 - o.b0, r.b1 - r.b0));
      if (s) { s.a1 = r.a; s.b0 = Math.min(s.b0, r.b0); s.b1 = Math.max(s.b1, r.b1); }
      else { const n = { a0: r.a, a1: r.a, b0: r.b0, b1: r.b1 }; segs.push(n); open.push(n); }
    }
    return segs.filter((s) => s.a1 - s.a0 <= 6); // dicker = Balken/Fläche, keine Linie
  }
  // zusammenhängende Flächen ohne Linien (4er-Nachbarschaft), mit Begrenzungsrahmen
  function regions(lines, W, H) {
    const seen = new Uint8Array(W * H);
    const stack = new Int32Array(W * H);
    const out = [];
    for (let i = 0; i < W * H; i++) {
      if (lines[i] || seen[i]) continue;
      let sp = 0, area = 0, x0 = W, y0 = H, x1 = 0, y1 = 0, border = false;
      stack[sp++] = i; seen[i] = 1;
      while (sp) {
        const p = stack[--sp];
        const x = p % W, y = (p - x) / W;
        area++;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        if (x === 0 || y === 0 || x === W - 1 || y === H - 1) border = true;
        if (x > 0 && !lines[p - 1] && !seen[p - 1]) { seen[p - 1] = 1; stack[sp++] = p - 1; }
        if (x < W - 1 && !lines[p + 1] && !seen[p + 1]) { seen[p + 1] = 1; stack[sp++] = p + 1; }
        if (y > 0 && !lines[p - W] && !seen[p - W]) { seen[p - W] = 1; stack[sp++] = p - W; }
        if (y < H - 1 && !lines[p + W] && !seen[p + W]) { seen[p + W] = 1; stack[sp++] = p + W; }
      }
      out.push({ x0, y0, x1, y1, area, border });
    }
    return out;
  }
  // Rahmen um die Tinte in einem Bereich (null = leer)
  function inkBox(dark, W, x0, y0, x1, y1) {
    let n = 0, a = Infinity, b = Infinity, c = -1, d = -1;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (dark[y * W + x]) { n++; if (x < a) a = x; if (x > c) c = x; if (y < b) b = y; if (y > d) d = y; }
    return n > 6 ? { n, x0: a, y0: b, x1: c, y1: d } : null;
  }
  // nächstgelegener Text links auf gleicher Höhe oder direkt darüber
  function labelFor(f, words) {
    const [x0, y0, , y1] = f.px;
    const cy = (y0 + y1) / 2;
    let best = null, bd = Infinity;
    if (f.kind === "check") {
      // Ankreuzfeld: Beschriftung steht meist rechts daneben („☐ Ja“)
      for (const w of words) {
        const [wx0, wy0, , wy1] = w.px;
        const d = wx0 - f.px[2];
        if (wy0 - 4 <= cy && cy <= wy1 + 4 && d > -4 && d < 20 * S && d < bd) { bd = d; best = w.str.trim(); }
      }
      if (best) return best.replace(/[:*]+$/, "").slice(0, 60);
    }
    for (const w of words) {
      const t = w.str.replace(/[._…]{3,}/g, "").trim();
      if (t.length < 2) continue;
      const [wx0, wy0, wx1, wy1] = w.px;
      let d = Infinity;
      if (wy0 - 4 <= cy && cy <= wy1 + 4 && wx1 <= x0 + 30 * S) d = x0 - wx1; // links daneben
      else if (wy1 <= y0 + 4 && y0 - wy1 < 90 * S && overlap(wx0, wx1, x0, f.px[2]) > 0.6 * (wx1 - wx0)) d = (y0 - wy1) * 1.5 + 40; // darüber (z. B. Spaltenkopf)
      if (d > -20 && d < bd) { bd = d; best = t; }
    }
    return best ? best.replace(/[:*]+$/, "").trim().slice(0, 60) : "";
  }
  const overlap = (a0, a1, b0, b1) => Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
  const area = (r) => Math.max(0, r[2] - r[0]) * Math.max(0, r[3] - r[1]);
  const inter = (p, q) => overlap(p[0], p[2], q[0], q[2]) * overlap(p[1], p[3], q[1], q[3]);

  window.PLFormDetect = { detect };
})();

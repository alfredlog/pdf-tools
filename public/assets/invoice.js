/* E-Rechnung erstellen – Formular im Browser, Erzeugung im E-Rechnung-Dienst.
 *
 * - Positionen hinzufügen/entfernen, Summen live berechnen (gleiche Rundung wie der Server:
 *   pro Position auf Cent, Umsatzsteuer pro Steuersatz auf die Summe der Positionen).
 * - Pflichtangaben vorab prüfen (EN 16931; bei XRechnung zusätzlich Kontakt, E-Mails, IBAN).
 * - Absenderdaten optional im Browser merken (localStorage) und nächste Rechnungsnummer vorschlagen.
 * - Senden als JSON an /api/e-rechnung-erstellen → ZUGFeRD-PDF oder XRechnung-XML zum Download.
 */
(() => {
  "use strict";
  const root = document.querySelector("[data-invoice]");
  if (!root) return;
  const tr = (text, vars) => {
    const d = window.PL_T || {};
    const out = d[text] != null ? d[text] : text;
    return vars ? out.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m)) : out;
  };
  const $ = (s) => root.querySelector(s);
  const form = $("form.iv");
  const done = $(".stage--done");
  const linesEl = $("[data-lines]");
  const tpl = $("[data-line-tpl]");
  const STORE = "pl_invoice_seller";
  const lang = window.PL_LANG || "de";
  const fmt = new Intl.NumberFormat(lang === "en" ? "en-GB" : lang === "fr" ? "fr-FR" : "de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  let downloadUrl = null;
  const fmt4 = new Intl.NumberFormat(lang === "en" ? "en-GB" : lang === "fr" ? "fr-FR" : "de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 4, useGrouping: false });

  // „1.234,56“, „1234,56“ und „1234.56“ verstehen
  function num(v) {
    let s = String(v || "").replace(/[\s€]/g, "");
    if (!s) return NaN;
    if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
    return /^-?\d*\.?\d+$/.test(s) ? Number(s) : NaN;
  }
  const cents = (x) => Math.round((x + Math.sign(x) * Number.EPSILON) * 100) / 100;
  const xml = () => form.querySelector('[name="iv-format"]:checked').value === "xml";
  const field = (k) => form.querySelector(`[data-k="${k}"]`);
  const val = (k) => { const el = field(k); return el.type === "checkbox" ? el.checked : el.value.trim(); };

  // ------------------------------------------------------------------ Positionen
  function addLine(data) {
    const row = tpl.content.firstElementChild.cloneNode(true);
    linesEl.appendChild(row);
    if (data) for (const [k, v] of Object.entries(data)) row.querySelector(`[data-l="${k}"]`).value = v;
    row.querySelector("[data-del]").addEventListener("click", () => {
      if (linesEl.querySelectorAll(".iv-line:not(.iv-line--head)").length > 1) row.remove();
      else row.querySelectorAll("input").forEach((i) => (i.value = i.dataset.l === "quantity" ? "1" : ""));
      update();
    });
    return row;
  }
  const rows = () => [...linesEl.querySelectorAll(".iv-line:not(.iv-line--head)")];

  function update() {
    const small = val("small_business");
    root.classList.toggle("is-small", small);
    const groups = new Map();
    let net = 0;
    for (const r of rows()) {
      const q = num(r.querySelector('[data-l="quantity"]').value), p = num(r.querySelector('[data-l="unit_price"]').value);
      const line = isNaN(q) || isNaN(p) ? 0 : cents(q * p);
      r.querySelector("[data-l-total]").textContent = fmt.format(line);
      const rate = small ? 0 : Number(r.querySelector('[data-l="vat_rate"]').value);
      groups.set(rate, (groups.get(rate) || 0) + line);
      net += line;
    }
    let vat = 0;
    let html = `<div><dt>${tr("Summe netto")}</dt><dd>${fmt.format(cents(net))} €</dd></div>`;
    for (const [rate, base] of [...groups].sort((a, b) => b[0] - a[0])) {
      const v = cents((base * rate) / 100);
      vat += v;
      if (rate > 0) html += `<div><dt>${tr("Umsatzsteuer {r} %", { r: rate })}</dt><dd>${fmt.format(v)} €</dd></div>`;
    }
    if (small) html += `<div><dt>${tr("Umsatzsteuer")}</dt><dd>${tr("entfällt (§ 19 UStG)")}</dd></div>`;
    html += `<div class="iv-sum__total"><dt>${tr("Gesamtbetrag")}</dt><dd>${fmt.format(cents(net + vat))} €</dd></div>`;
    $("[data-sum]").innerHTML = html;
    renderSheet();
  }

  // ------------------------------------------------------------------ Entwurf aus dem Formular (ohne Prüfung)
  function collect() {
    const d = {
      type_code: $("[data-credit]").checked ? "381" : "380",
      number: val("number"), issue_date: val("issue_date"), delivery_date: val("delivery_date") || null,
      due_days: Math.max(0, parseInt(val("due_days"), 10) || 0), buyer_reference: val("buyer_reference"),
      seller: {}, buyer: {}, lines: [], iban: val("iban"), bic: val("bic"), note: val("note"), small_business: val("small_business"),
    };
    for (const el of form.querySelectorAll("[data-k^='seller.'], [data-k^='buyer.']")) { const [who, k] = el.dataset.k.split("."); d[who][k] = el.value.trim(); }
    for (const r of rows()) {
      const g = (k) => r.querySelector(`[data-l="${k}"]`).value.trim();
      if (!g("name") && !g("unit_price")) continue;
      d.lines.push({ name: g("name"), quantity: String(num(g("quantity"))), unit_code: g("unit_code"), unit_price: String(num(g("unit_price"))), vat_rate: g("vat_rate") });
    }
    return d;
  }

  // ------------------------------------------------------------------ Vorschau wie eine gedruckte Rechnung (A4)
  const UNITS = { C62: "Stück", HUR: "Std.", DAY: "Tag", MON: "Monat", KGM: "kg", LS: "pauschal" };
  const dDE = (s) => (s ? s.split("-").reverse().join(".") : "");
  // Vorschau bleibt Deutsch – wie die erzeugte E-Rechnung selbst
  const de = (t, v) => (v ? t.replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? v[k] : m)) : t);
  function sheet(d, marks = new Set()) {
    const m = (key, html) => `<span class="${marks.has(key) ? "iv-mark" : ""}">${html || "<i>–</i>"}</span>`;
    const e = (x) => esc(x || "");
    const s = d.seller, b = d.buyer;
    const small = d.small_business;
    let net = 0;
    const groups = new Map();
    const rowsHtml = d.lines.map((l, i) => {
      const q = Number(l.quantity), p = Number(l.unit_price);
      const amount = isNaN(q) || isNaN(p) ? 0 : cents(q * p);
      net += amount;
      const rate = small ? 0 : Number(l.vat_rate);
      groups.set(rate, (groups.get(rate) || 0) + amount);
      const k = `lines.${i}`;
      return `<tr class="${[...marks].some((x) => x.startsWith(k)) ? "iv-markrow" : ""}"><td>${i + 1}</td><td>${e(l.name)}</td><td class="r">${isNaN(q) ? "" : fmt.format(q).replace(/[.,]00$/, "")} ${e(de(UNITS[l.unit_code] || ""))}</td><td class="r">${isNaN(p) ? "" : fmt.format(p)}</td><td class="r">${small ? "–" : rate + " %"}</td><td class="r">${fmt.format(amount)}</td></tr>`;
    }).join("");
    let vat = 0, vatRows = "";
    for (const [r, base] of [...groups].sort((a, c) => c[0] - a[0])) { const v = cents((base * r) / 100); vat += v; if (r) vatRows += `<tr><td>${de("zzgl. USt. {r} %", { r })}</td><td class="r">${fmt.format(v)} €</td></tr>`; }
    const title = d.type_code === "381" ? de("Gutschrift") : de("Rechnung");
    return `<div class="iv-page">
      <div class="iv-p-head">${m("seller.name", `<b>${e(s.name)}</b>`)}<br>${m("seller.street", e(s.street))}<br>${m("seller.city", `${e(s.postal_code)} ${e(s.city)}`)}</div>
      <div class="iv-p-addr"><small>${e([s.name, s.street, [s.postal_code, s.city].join(" ")].filter((x) => x && x.trim()).join(" · "))}</small>
        ${m("buyer.name", e(b.name))}<br>${m("buyer.street", e(b.street))}<br>${m("buyer.city", `${e(b.postal_code)} ${e(b.city)}`)}</div>
      <div class="iv-p-meta"><table>
        <tr><td>${de("Rechnungsnummer")}</td><td>${m("number", e(d.number))}</td></tr>
        <tr><td>${de("Rechnungsdatum")}</td><td>${m("issue_date", dDE(d.issue_date))}</td></tr>
        ${d.delivery_date ? `<tr><td>${de("Leistungsdatum")}</td><td>${dDE(d.delivery_date)}</td></tr>` : ""}
        ${d.buyer_reference ? `<tr><td>${de("Leitweg-ID / Bestellnr.")}</td><td>${m("buyer_reference", e(d.buyer_reference))}</td></tr>` : ""}
      </table></div>
      <h3>${title}</h3>
      <table class="iv-p-lines"><thead><tr><th>${de("Pos.")}</th><th>${de("Bezeichnung")}</th><th class="r">${de("Menge")}</th><th class="r">${de("Einzelpreis")}</th><th class="r">${de("USt.")}</th><th class="r">${de("Betrag")}</th></tr></thead><tbody>${rowsHtml || `<tr><td colspan="6"><i>${de("Noch keine Positionen")}</i></td></tr>`}</tbody></table>
      <table class="iv-p-sum ${marks.has("totals") ? "iv-markrow" : ""}"><tr><td>${de("Summe netto")}</td><td class="r">${fmt.format(cents(net))} €</td></tr>${vatRows}<tr class="t"><td>${de("Gesamtbetrag")}</td><td class="r">${fmt.format(cents(net + vat))} €</td></tr></table>
      ${small ? `<p class="iv-p-note">${de("Kein Ausweis von Umsatzsteuer, da Kleinunternehmer gemäß § 19 UStG.")}</p>` : ""}
      <p class="iv-p-note">${d.due_days ? de("Zahlbar innerhalb von {n} Tagen ohne Abzug.", { n: d.due_days }) : de("Zahlbar sofort.")} ${e(d.note)}</p>
      <div class="iv-p-foot">
        <div>${e(s.name)}<br>${e(s.street)}<br>${e(s.postal_code)} ${e(s.city)}</div>
        <div>${s.vat_id ? `${de("USt-IdNr.")} ${m("seller.vat_id", e(s.vat_id))}<br>` : ""}${s.tax_number ? `${de("Steuernr.")} ${m("seller.tax_number", e(s.tax_number))}<br>` : ""}${e(s.email)}<br>${e(s.phone)}</div>
        <div>${d.iban ? `IBAN ${m("iban", e(d.iban.replace(/(.{4})/g, "$1 ").trim()))}<br>` : ""}${d.bic ? `BIC ${e(d.bic)}` : ""}</div>
      </div>
      <span class="iv-p-badge">${xml() ? "XRechnung (XML)" : "ZUGFeRD · EN 16931"}</span>
    </div>`;
  }
  const sheetEl = $("[data-sheet]");
  const renderSheet = () => { sheetEl.innerHTML = sheet(collect()); };

  // ------------------------------------------------------------------ Pflichtangaben (wie im Dienst)
  function check() {
    form.querySelectorAll(".is-missing").forEach((el) => el.classList.remove("is-missing"));
    const missing = [];
    const need = (k, label) => { if (!val(k)) { missing.push(tr(label)); field(k).classList.add("is-missing"); } };
    need("number", "Rechnungsnummer");
    need("issue_date", "Rechnungsdatum");
    for (const [who, w] of [["seller", "Rechnungssteller"], ["buyer", "Empfänger"]]) {
      need(`${who}.name`, `Name (${w})`);
      need(`${who}.street`, `Straße (${w})`);
      need(`${who}.postal_code`, `PLZ (${w})`);
      need(`${who}.city`, `Ort (${w})`);
    }
    if (!val("seller.vat_id") && !val("seller.tax_number")) {
      missing.push(tr("USt-IdNr. oder Steuernummer"));
      field("seller.vat_id").classList.add("is-missing");
      field("seller.tax_number").classList.add("is-missing");
    }
    if (xml()) {
      need("seller.contact_name", "Ansprechpartner (Rechnungssteller)");
      need("seller.phone", "Telefon (Rechnungssteller)");
      need("seller.email", "E-Mail (Rechnungssteller)");
      need("buyer.email", "E-Mail (Empfänger)");
      need("iban", "IBAN");
    }
    const lines = [];
    rows().forEach((r, i) => {
      const name = r.querySelector('[data-l="name"]').value.trim();
      const q = num(r.querySelector('[data-l="quantity"]').value), p = num(r.querySelector('[data-l="unit_price"]').value);
      const priceRaw = r.querySelector('[data-l="unit_price"]').value.trim();
      if (!name && !priceRaw) return; // leere Zeile ignorieren
      if (!name) { missing.push(tr("Bezeichnung (Position {n})", { n: i + 1 })); r.querySelector('[data-l="name"]').classList.add("is-missing"); }
      if (isNaN(p)) { missing.push(tr("Einzelpreis (Position {n})", { n: i + 1 })); r.querySelector('[data-l="unit_price"]').classList.add("is-missing"); }
      if (isNaN(q) || q === 0) { missing.push(tr("Menge (Position {n})", { n: i + 1 })); r.querySelector('[data-l="quantity"]').classList.add("is-missing"); }
      lines.push({ name, quantity: String(q), unit_code: r.querySelector('[data-l="unit_code"]').value, unit_price: String(p), vat_rate: r.querySelector('[data-l="vat_rate"]').value });
    });
    if (!lines.length) missing.push(tr("mindestens eine Position"));
    return { missing, lines };
  }
  function showMissing(list) {
    const box = $("[data-missing]");
    box.hidden = !list.length;
    box.innerHTML = list.length ? `<strong>${tr("Bitte noch ausfüllen:")}</strong><ul>${list.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>` : "";
    if (list.length) box.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  // ------------------------------------------------------------------ Absender merken
  const SELLER_KEYS = ["seller.name", "seller.street", "seller.postal_code", "seller.city", "seller.country_code", "seller.vat_id", "seller.tax_number", "seller.contact_name", "seller.phone", "seller.email", "iban", "bic", "small_business"];
  function load() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE) || "null"); } catch (_) {}
    if (!saved) return;
    for (const k of SELLER_KEYS) if (saved[k] != null) { const el = field(k); if (el.type === "checkbox") el.checked = !!saved[k]; else el.value = saved[k]; }
    if (saved.lastNumber) field("number").value = nextNumber(saved.lastNumber);
  }
  function remember(number) {
    try {
      if (!$("[data-remember]").checked) return localStorage.removeItem(STORE);
      const data = { lastNumber: number };
      for (const k of SELLER_KEYS) data[k] = val(k);
      localStorage.setItem(STORE, JSON.stringify(data));
    } catch (_) {}
  }
  // „2026-007“ → „2026-008“, „RE12“ → „RE13“ (führende Nullen bleiben)
  function nextNumber(n) {
    const m = /^(.*?)(\d+)(\D*)$/.exec(n || "");
    if (!m) return "";
    const next = String(Number(m[2]) + 1).padStart(m[2].length, "0");
    return m[1] + next + m[3];
  }

  // ------------------------------------------------------------------ Absenden
  form.addEventListener("submit", (e) => { e.preventDefault(); create($("[data-submit]")); });
  async function create(btn) {
    const { missing, lines } = check();
    if (missing.length) { confirmEl.hidden = true; form.hidden = false; return showMissing(missing); }
    showMissing([]);
    const draft = { ...collect(), lines };
    btn.disabled = true;
    btn.classList.add("is-busy");
    try {
      const res = await fetch(`/api/e-rechnung-erstellen?format=${xml() ? "xml" : "pdf"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-PL-Lang": lang },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        let body = {};
        try { body = await res.json(); } catch (_) {}
        if (Array.isArray(body.missing)) return showMissing(body.missing.map((m) => tr(m)));
        throw new Error(body.error || tr("Die E-Rechnung konnte nicht erstellt werden. Bitte versuche es noch einmal."));
      }
      const blob = await res.blob();
      const name = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") || "");
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      downloadUrl = URL.createObjectURL(blob);
      const a = $("[data-download]");
      a.href = downloadUrl;
      a.download = name ? name[1] : xml() ? "XRechnung.xml" : "Rechnung.pdf";
      $("[data-done-info]").textContent = xml()
        ? tr("XRechnung 3.0 (XML). Lade sie im Rechnungsportal der Behörde hoch (z. B. ZRE oder OZG-RE) oder sende sie per E-Mail.")
        : tr("ZUGFeRD-PDF (Profil EN 16931): sieht aus wie eine normale Rechnung und enthält alle Daten maschinenlesbar – gültig als E-Rechnung.");
      remember(draft.number);
      form.hidden = true;
      confirmEl.hidden = true;
      done.hidden = false;
      showPdf(blob, !xml());
      done.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      showMissing([]);
      alert(err.message);
    } finally {
      btn.disabled = false;
      btn.classList.remove("is-busy");
    }
  }

  // ------------------------------------------------------------------ fertige PDF anzeigen (das echte Ergebnis)
  async function showPdf(blob, isPdf) {
    const box = $("[data-pdf]");
    box.innerHTML = "";
    if (!isPdf || !window.pdfjsLib) return;
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/vendor/pdf.worker.min.js";
      const doc = await pdfjsLib.getDocument({ data: new Uint8Array(await blob.arrayBuffer()), isEvalSupported: false }).promise;
      for (let n = 1; n <= Math.min(doc.numPages, 5); n++) {
        const pg = await doc.getPage(n);
        const w = Math.min(box.clientWidth || 640, 760);
        const vp = pg.getViewport({ scale: w / pg.getViewport({ scale: 1 }).width });
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const c = document.createElement("canvas");
        c.width = vp.width * dpr; c.height = vp.height * dpr; c.style.width = vp.width + "px";
        box.appendChild(c);
        await pg.render({ canvasContext: c.getContext("2d"), viewport: vp, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null }).promise;
      }
    } catch (e) { console.warn(e); }
  }

  // ------------------------------------------------------------------ Rechnung hochladen → auslesen → bestätigen
  const confirmEl = $("[data-confirm]");
  function fill(d) {
    const set = (k, v) => { const el = field(k); if (!el) return; if (el.type === "checkbox") el.checked = !!v; else el.value = v ?? ""; };
    for (const who of ["seller", "buyer"]) for (const [k, v] of Object.entries(d[who] || {})) set(`${who}.${k}`, v);
    for (const k of ["number", "issue_date", "delivery_date", "due_days", "buyer_reference", "iban", "bic", "note", "small_business"]) if (d[k] !== undefined) set(k, d[k]);
    $("[data-credit]").checked = d.type_code === "381";
    rows().forEach((r) => r.remove());
    for (const l of d.lines || []) addLine({ ...l, unit_price: l.unit_price === "" ? "" : fmt4.format(Number(l.unit_price)), quantity: String(l.quantity).replace(".", lang === "en" ? "." : ",") });
    if (!rows().length) addLine();
  }
  function markUncertain(paths) {
    form.querySelectorAll(".is-uncertain").forEach((el) => el.classList.remove("is-uncertain"));
    for (const p of paths) {
      const m = /^lines\.(\d+)\.?(\w*)/.exec(p);
      if (m) { const r = rows()[Number(m[1])]; if (r) (r.querySelector(`[data-l="${m[2]}"]`) || r.querySelector('[data-l="name"]')).classList.add("is-uncertain"); continue; }
      const el = field(p) || (p === "seller.city" && field("seller.city"));
      if (el) el.classList.add("is-uncertain");
    }
  }
  $("[data-import-file]").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) return alert(tr("Die Datei ist größer als 20 MB."));
    const busyEl = $("[data-import-busy]");
    busyEl.hidden = false;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/ai/invoice-import", { method: "POST", body: fd, headers: { "X-PL-Lang": lang } });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || tr("Die Rechnung konnte nicht gelesen werden. Bitte versuche es noch einmal."));
      fill(body.draft);
      update();
      const marks = new Set([...(body.uncertain || []), ...body.warnings.map((w) => w.field)]);
      markUncertain([...marks]);
      $("[data-warnings]").innerHTML = body.warnings.map((w) => `<li>${esc(tr(w.text, w.vars && { ...w.vars, what: tr(w.vars.what) }))}</li>`).join("") + (body.ocr ? `<li class="iv-warn--info">${esc(tr("Die Rechnung war gescannt – der Text wurde per Texterkennung gelesen. Prüfe Zahlen besonders genau."))}</li>` : "");
      $("[data-confirm-sheet]").innerHTML = sheet(collect(), marks);
      form.hidden = true;
      done.hidden = true;
      confirmEl.hidden = false;
      confirmEl.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      alert(err.message);
    } finally {
      busyEl.hidden = true;
    }
  });
  $("[data-edit]").addEventListener("click", () => {
    confirmEl.hidden = true;
    form.hidden = false;
    (form.querySelector(".is-uncertain") || form).scrollIntoView({ behavior: "smooth", block: "center" });
  });
  $("[data-confirm-ok]").addEventListener("click", (e) => create(e.currentTarget));

  // ------------------------------------------------------------------ Sonstiges
  $("[data-add-line]").addEventListener("click", () => { addLine().querySelector('[data-l="name"]').focus(); update(); });
  form.addEventListener("input", (e) => { e.target.classList.remove("is-missing", "is-uncertain"); update(); });
  form.addEventListener("change", (e) => {
    if (e.target.name === "iv-format") root.classList.toggle("is-xml", xml());
    update();
  });
  $("[data-back]").addEventListener("click", () => { done.hidden = true; form.hidden = false; renderSheet(); });
  $("[data-next]").addEventListener("click", () => {
    field("number").value = nextNumber(val("number"));
    for (const el of form.querySelectorAll("[data-k^='buyer.'], [data-k='buyer_reference'], [data-k='note'], [data-k='delivery_date']")) el.value = el.dataset.k === "buyer.country_code" ? "DE" : "";
    rows().forEach((r) => r.remove());
    addLine();
    update();
    done.hidden = true;
    form.hidden = false;
    field("buyer.name").focus();
  });
  $("[data-example]").addEventListener("click", () => {
    const ex = {
      "seller.name": "Muster Webdesign", "seller.street": "Hauptstraße 1", "seller.postal_code": "64283", "seller.city": "Darmstadt",
      "seller.tax_number": "007/123/45678", "seller.contact_name": "Max Muster", "seller.phone": "06151 123456", "seller.email": "rechnung@example.com",
      iban: "DE02120300000000202051", "buyer.name": "Beispiel GmbH", "buyer.street": "Bahnhofstraße 5", "buyer.postal_code": "60311",
      "buyer.city": "Frankfurt am Main", "buyer.email": "buchhaltung@example.org", number: field("number").value || "2026-001",
    };
    for (const [k, v] of Object.entries(ex)) field(k).value = v;
    rows().forEach((r) => r.remove());
    addLine({ name: tr("Webdesign Startseite"), quantity: "1", unit_code: "LS", unit_price: "850,00", vat_rate: "19" });
    addLine({ name: tr("Pflege und Updates"), quantity: "3,5", unit_code: "HUR", unit_price: "65,00", vat_rate: "19" });
    form.querySelectorAll(".is-missing").forEach((el) => el.classList.remove("is-missing"));
    showMissing([]);
    update();
  });

  field("issue_date").value = new Date().toISOString().slice(0, 10);
  load();
  addLine();
  update();
})();

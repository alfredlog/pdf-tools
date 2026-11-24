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
  }

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
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { missing, lines } = check();
    if (missing.length) return showMissing(missing);
    showMissing([]);
    const draft = {
      type_code: $("[data-credit]").checked ? "381" : "380",
      number: val("number"),
      issue_date: val("issue_date"),
      delivery_date: val("delivery_date") || null,
      due_days: Math.max(0, parseInt(val("due_days"), 10) || 0),
      buyer_reference: val("buyer_reference"),
      seller: {}, buyer: {},
      lines,
      iban: val("iban"), bic: val("bic"),
      note: val("note"),
      small_business: val("small_business"),
    };
    for (const el of form.querySelectorAll("[data-k^='seller.'], [data-k^='buyer.']")) {
      const [who, k] = el.dataset.k.split(".");
      draft[who][k] = el.value.trim();
    }
    const btn = $("[data-submit]");
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
      done.hidden = false;
      done.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
      showMissing([]);
      alert(err.message);
    } finally {
      btn.disabled = false;
      btn.classList.remove("is-busy");
    }
  });

  // ------------------------------------------------------------------ Sonstiges
  $("[data-add-line]").addEventListener("click", () => { addLine().querySelector('[data-l="name"]').focus(); update(); });
  form.addEventListener("input", (e) => { e.target.classList.remove("is-missing"); update(); });
  form.addEventListener("change", (e) => {
    if (e.target.name === "iv-format") root.classList.toggle("is-xml", xml());
    update();
  });
  $("[data-back]").addEventListener("click", () => { done.hidden = true; form.hidden = false; });
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

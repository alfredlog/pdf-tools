/* E-Rechnung im Browser anzeigen – XRechnung, Peppol-UBL (Belgien u. a.), CII, ZUGFeRD/Factur-X (Frankreich).
 *
 * Die Datei geht an /api/e-rechnung-daten (E-Rechnung-Dienst: lesen + nachrechnen) und kommt als JSON zurück.
 * Hier wird daraus eine lesbare Rechnung in der Sprache der Seite (DE/EN/FR) gebaut.
 * „Als PDF speichern“ nutzt den Druckdialog des Browsers (Druck-CSS zeigt nur die Rechnung).
 * Die offizielle KoSIT-Prüfung gilt nur für die deutsche XRechnung – bei anderen Formaten blenden wir sie aus.
 */
(() => {
  "use strict";
  const root = document.querySelector("[data-einvoice]");
  if (!root) return;
  const tr = (text, vars) => {
    const d = window.PL_T || {};
    const out = d[text] != null ? d[text] : text;
    return vars ? out.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m)) : out;
  };
  const $ = (s) => root.querySelector(s);
  const stages = { pick: $(".stage--pick"), busy: $(".stage--busy"), work: $(".stage--work") };
  const show = (n) => Object.entries(stages).forEach(([k, el]) => (el.hidden = k !== n));
  const lang = window.PL_LANG || "de";
  const locale = lang === "en" ? "en-GB" : lang === "fr" ? "fr-FR" : "de-DE";
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const input = root.querySelector('input[type="file"]');
  let lastFile = null;

  const UNITS = { C62: "Stück", H87: "Stück", EA: "Stück", XPP: "Packung", HUR: "Std.", MIN: "Min.", DAY: "Tag", WEE: "Woche", MON: "Monat", ANN: "Jahr", KGM: "kg", LTR: "l", MTR: "m", MTK: "m²", KWH: "kWh", LS: "pauschal" };
  const TYPES = { 380: "Rechnung", 381: "Gutschrift", 384: "Korrigierte Rechnung", 389: "Gutschrift (Selbstfakturierung)", 326: "Teilrechnung", 875: "Teilschlussrechnung", 877: "Schlussrechnung" };
  // Prüfergebnisse des Dienstes (deutsch) → kurze Texte in der Seitensprache (per Code)
  const FINDINGS = {
    "missing-number": "Die Rechnungsnummer fehlt.",
    "missing-issue_date": "Das Rechnungsdatum fehlt.",
    "missing-currency": "Die Währung fehlt.",
    "missing-seller": "Der Name des Rechnungsstellers fehlt.",
    "missing-seller-tax-id": "Der Rechnungssteller gibt weder USt-IdNr. noch Steuernummer an.",
    "line-sum": "Die Summe der Positionen passt nicht zum Rechnungsbetrag.",
    "net-total": "Der Nettobetrag passt nicht zu den Positionen, Abschlägen und Zuschlägen.",
    "gross-total": "Der Bruttobetrag ist nicht Netto + Umsatzsteuer.",
    "vat-sum": "Die Umsatzsteuer der einzelnen Steuersätze ergibt nicht die genannte Gesamtsteuer.",
    "vat-rate": "Bei einem Steuersatz passt der Steuerbetrag nicht zur Bemessungsgrundlage.",
    "amount-due": "Der Zahlbetrag passt nicht zum Bruttobetrag.",
    "iban-invalid": "Die IBAN ist ungültig (Prüfziffer stimmt nicht) – bitte beim Lieferanten nachfragen.",
  };

  // ------------------------------------------------------------------ Datei laden
  const drop = $("[data-drop]");
  ["dragover", "dragenter"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("is-over"); }));
  ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, () => drop.classList.remove("is-over")));
  drop.addEventListener("drop", (e) => { e.preventDefault(); if (e.dataTransfer.files[0]) open(e.dataTransfer.files[0]); });
  input.addEventListener("change", () => input.files[0] && open(input.files[0]));
  window.addEventListener("pl:file", (e) => open(e.detail)); // Datei von einem anderen Werkzeug übernommen

  async function open(file) {
    if (file.size > 15 * 1024 * 1024) return alert(tr("Die Datei ist größer als 15 MB."));
    lastFile = file;
    show("busy");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/e-rechnung-daten", { method: "POST", body: fd, headers: { "X-PL-Lang": lang } });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || tr("Die Datei konnte nicht gelesen werden."));
      render(body);
      show("work");
      root.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      show("pick");
      alert(e.message);
    }
  }

  // ------------------------------------------------------------------ Darstellung
  function render({ format, invoice: inv, findings, kosit }) {
    const cur = inv.currency || "EUR";
    const money = (v) => (v == null || v === "" ? "–" : new Intl.NumberFormat(locale, { style: "currency", currency: cur }).format(Number(v)));
    const num = (v) => (v == null ? "" : new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }).format(Number(v)));
    const date = (v) => (v ? new Date(v + "T12:00:00").toLocaleDateString(locale) : "");
    const spec = String(inv.specification || "").toLowerCase();
    const xr = spec.includes("xrechnung");
    const profile = xr ? "XRechnung" : spec.includes("peppol") ? "Peppol BIS Billing 3.0" : format === "zugferd_pdf" ? "ZUGFeRD / Factur-X" : "EN 16931";
    const syntax = { ubl: "UBL (XML)", cii: "CII (XML)", zugferd_pdf: "PDF + XML" }[format] || format;

    // Prüfergebnisse
    const items = (findings || []).map((f) => ({ sev: f.severity, text: lang === "de" ? f.message : tr(FINDINGS[f.code] || f.message), title: f.message }));
    if (xr && kosit && kosit.messages) for (const m of kosit.messages) if (m.level === "error" || m.level === "warning") items.push({ sev: m.level === "error" ? "error" : "warning", text: `${m.code || "KoSIT"}: ${m.text}`, title: "" });
    const errors = items.filter((i) => i.sev === "error").length;
    let status = errors ? tr("{n} Fehler gefunden", { n: errors }) : items.length ? tr("Keine Fehler gefunden, {n} Hinweis(e)", { n: items.length }) : tr("Keine Fehler gefunden – Summen und Steuer stimmen.");
    if (xr && kosit) status += kosit.acceptable ? " · " + tr("offiziell geprüft: konform zu XRechnung") : "";
    $("[data-status]").innerHTML = `<b class="${errors ? "is-bad" : "is-ok"}">${esc(status)}</b> <span>${esc(profile)} · ${esc(syntax)}</span>`;
    $("[data-findings]").innerHTML = items.map((i) => `<li class="ev-f--${i.sev === "error" ? "error" : "warn"}" title="${esc(i.title)}">${esc(i.text)}</li>`).join("");

    const party = (p, title) => {
      if (!p) return "";
      const a = p.address || {};
      return `<div class="ev-party"><h3>${esc(title)}</h3><p><b>${esc(p.name)}</b><br>${esc(a.street)}${a.street ? "<br>" : ""}${esc([a.postal_code, a.city].filter(Boolean).join(" "))}${a.country_code ? `<br>${esc(countryName(a.country_code))}` : ""}</p>
        <p class="ev-small">${p.vat_id ? `${tr("USt-IdNr.")}: ${esc(p.vat_id)}<br>` : ""}${p.tax_number ? `${tr("Steuernummer")}: ${esc(p.tax_number)}<br>` : ""}${p.contact_name ? `${esc(p.contact_name)}<br>` : ""}${p.email ? `${esc(p.email)}<br>` : ""}${p.phone ? esc(p.phone) : ""}</p></div>`;
    };
    const t = inv.totals || {};
    const pay = inv.payment || {};
    const meta = [
      [tr("Rechnungsnummer"), inv.number],
      [tr("Rechnungsdatum"), date(inv.issue_date)],
      [tr("Leistungsdatum"), date(inv.delivery_date)],
      [tr("Fällig am"), date(inv.due_date)],
      [tr("Käuferreferenz / Leitweg-ID"), inv.buyer_reference && inv.buyer_reference !== "n/a" ? inv.buyer_reference : ""],
    ].filter(([, v]) => v);
    const lines = (inv.lines || []).map((l, i) => `<tr><td>${esc(l.line_id || i + 1)}</td><td>${esc(l.name)}${l.description ? `<br><small>${esc(l.description)}</small>` : ""}</td><td class="r">${num(l.quantity)} ${esc(tr(UNITS[l.unit_code] || l.unit_code || ""))}</td><td class="r">${money(l.unit_price)}</td><td class="r">${l.vat_rate != null ? num(l.vat_rate) + " %" : ""}</td><td class="r">${money(l.net_amount)}</td></tr>`).join("");
    const vatRows = (inv.vat_breakdown || []).map((b) => `<tr><td>${tr("Umsatzsteuer {r} % auf {base}", { r: num(b.rate), base: money(b.taxable_amount) })}${b.exemption_reason ? `<br><small>${esc(b.exemption_reason)}</small>` : ""}</td><td class="r">${money(b.tax_amount)}</td></tr>`).join("");
    const sumRow = (label, v, cls = "") => (v == null ? "" : `<tr class="${cls}"><td>${esc(label)}</td><td class="r">${money(v)}</td></tr>`);
    $("[data-doc]").innerHTML = `
      <header class="ev-head"><h2>${esc(tr(TYPES[inv.type_code] || "Rechnung"))} ${esc(inv.number || "")}</h2><span class="ev-badge">${esc(profile)}</span></header>
      <div class="ev-parties">${party(inv.seller, tr("Rechnungssteller"))}${party(inv.buyer, tr("Rechnungsempfänger"))}</div>
      <table class="ev-meta">${meta.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</table>
      <table class="ev-lines"><thead><tr><th>${tr("Pos.")}</th><th>${tr("Bezeichnung")}</th><th class="r">${tr("Menge")}</th><th class="r">${tr("Einzelpreis")}</th><th class="r">${tr("USt.")}</th><th class="r">${tr("Netto")}</th></tr></thead><tbody>${lines}</tbody></table>
      <table class="ev-sum">
        ${sumRow(tr("Summe der Positionen"), t.line_total)}
        ${t.allowances && Number(t.allowances) ? sumRow(tr("Abschläge"), -Number(t.allowances)) : ""}
        ${t.charges && Number(t.charges) ? sumRow(tr("Zuschläge"), t.charges) : ""}
        ${sumRow(tr("Nettobetrag"), t.net_total)}
        ${vatRows}
        ${sumRow(tr("Bruttobetrag"), t.gross_total)}
        ${t.prepaid && Number(t.prepaid) ? sumRow(tr("Bereits bezahlt"), -Number(t.prepaid)) : ""}
        ${sumRow(tr("Zahlbetrag"), t.amount_due ?? t.gross_total, "t")}
      </table>
      ${pay.iban || pay.terms ? `<div class="ev-pay"><h3>${tr("Zahlung")}</h3><p>${pay.iban ? `IBAN ${esc(String(pay.iban).replace(/(.{4})/g, "$1 ").trim())}<br>` : ""}${pay.bic ? `BIC ${esc(pay.bic)}<br>` : ""}${pay.terms ? esc(pay.terms) : ""}</p></div>` : ""}
      ${inv.note ? `<div class="ev-pay"><h3>${tr("Hinweise")}</h3><p>${esc(inv.note).replace(/\n/g, "<br>")}</p></div>` : ""}`;
  }
  function countryName(code) {
    try { return new Intl.DisplayNames([locale], { type: "region" }).of(code) || code; } catch (_) { return code; }
  }

  $("[data-print]").addEventListener("click", () => window.print());
  $("[data-other]").addEventListener("click", () => { input.value = ""; show("pick"); });
  const pdfBtn = $("[data-pdf]");
  if (pdfBtn) pdfBtn.addEventListener("click", async () => {
    if (!lastFile) return;
    pdfBtn.disabled = true;
    try {
      const fd = new FormData();
      fd.append("file", lastFile);
      const res = await fetch("/api/e-rechnung", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Fehler");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(await res.blob());
      a.download = (/filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") || "") || [])[1] || "E-Rechnung.pdf";
      a.click();
    } catch (e) { alert(e.message); }
    pdfBtn.disabled = false;
  });
})();

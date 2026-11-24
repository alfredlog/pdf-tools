/* Musterbriefe: Kündigung, Widerspruch, Mahnung, Widerruf … als PDF nach DIN 5008 – komplett im Browser.
 *
 * Aufbau:
 *  TYPES     Vorlagen: eigene Eingabefelder, Betreff und Brieftext (immer Deutsch – der Brief geht an
 *            deutsche Firmen/Behörden; nur die Oberfläche wird übersetzt).
 *  build()   setzt den Brief mit pdf-lib: Absender, Anschriftfeld (passt ins Fenster eines DL-Umschlags),
 *            Ort/Datum, Betreff fett, Text mit Zeilenumbruch über mehrere Seiten, Unterschrift(en), Falzmarken.
 *  preview   dieselbe PDF wird mit pdf.js als Vorschau gezeichnet → Vorschau = Download.
 *  Der Brieftext ist frei bearbeitbar; „Vorlage wiederherstellen“ verwirft eigene Änderungen.
 */
(() => {
  "use strict";
  const root = document.querySelector("[data-letter]");
  if (!root || !window.PDFLib || !window.pdfjsLib) return;
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/vendor/pdf.worker.min.js";
  const tr = (text, vars) => {
    const d = window.PL_T || {};
    const out = d[text] != null ? d[text] : text;
    return vars ? out.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m)) : out;
  };
  const $ = (s) => root.querySelector(s);
  const STORE = "pl_letter_sender";

  // ------------------------------------------------------------------ Datum
  const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const de = (s) => { if (!s) return ""; const [y, m, d] = s.split("-"); return `${d}.${m}.${y}`; };
  const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
  const lastOfMonth = (y, m) => new Date(y, m + 1, 0);
  // Wohnung (Mieter, § 573c BGB): Zugang bis zum 3. Werktag (Mo–Fr) eines Monats → Ende des übernächsten Monats
  function rentEnd(from = new Date()) {
    let workdays = 0;
    for (let d = 1; d <= from.getDate(); d++) { const wd = new Date(from.getFullYear(), from.getMonth(), d).getDay(); if (wd >= 1 && wd <= 5) workdays++; }
    const extra = workdays <= 3 ? 2 : 3; // heute noch innerhalb der ersten drei Werktage?
    return iso(lastOfMonth(from.getFullYear(), from.getMonth() + extra));
  }
  // Arbeitnehmer, gesetzliche Grundfrist (§ 622 Abs. 1 BGB): vier Wochen zum 15. oder zum Monatsende
  function jobEnd(from = new Date()) {
    const min = new Date(from); min.setDate(min.getDate() + 28);
    const mid = new Date(min.getFullYear(), min.getMonth(), 15);
    return iso(min <= mid ? mid : lastOfMonth(min.getFullYear(), min.getMonth()));
  }

  // ------------------------------------------------------------------ Vorlagen
  // Feld: [Schlüssel, Beschriftung, Typ, Platzhalter/Optionen, Standardwert]
  const TYPES = {
    kuendigung: {
      label: "Kündigung eines Vertrags", file: "Kuendigung",
      fields: [
        ["vertrag", "Vertrag / Leistung", "text", "z. B. Mobilfunkvertrag, Fitnessstudio, Zeitschriften-Abo"],
        ["nummer", "Kunden- oder Vertragsnummer", "text", ""],
        ["zum", "Kündigung zum (leer = nächstmöglicher Termin)", "date", ""],
        ["lastschrift", "SEPA-Lastschrift zum Vertragsende widerrufen", "check", "", true],
        ["werbung", "Keine Werbung und keine Rückgewinnungsanrufe", "check", "", true],
      ],
      subject: (v) => `Kündigung ${v.vertrag ? "– " + v.vertrag : "meines Vertrags"}${v.nummer ? `, Kunden-/Vertragsnr. ${v.nummer}` : ""}`,
      body: (v) => [
        `hiermit kündige ich ${v.vertrag ? `meinen Vertrag (${v.vertrag})` : "den oben genannten Vertrag"}${v.nummer ? ` mit der Kunden-/Vertragsnummer ${v.nummer}` : ""} fristgerecht ${v.zum ? `zum ${de(v.zum)}, hilfsweise zum nächstmöglichen Zeitpunkt` : "zum nächstmöglichen Zeitpunkt"}.`,
        "Bitte bestätigen Sie mir den Eingang dieser Kündigung sowie das genaue Vertragsende schriftlich.",
        v.lastschrift && "Das von mir erteilte SEPA-Lastschriftmandat widerrufe ich mit Wirkung zum Vertragsende.",
        v.werbung && "Einer weiteren Nutzung meiner Daten zu Werbezwecken widerspreche ich. Bitte sehen Sie von Rückgewinnungsanrufen und -schreiben ab.",
      ],
      hint: "Viele Verträge lassen sich auch über den „Kündigungsbutton“ auf der Website des Anbieters kündigen. Mit Brief per Einschreiben kannst du den Zugang beweisen.",
    },
    wohnung: {
      label: "Kündigung der Wohnung (Mieter)", file: "Kuendigung_Wohnung",
      fields: [
        ["objekt", "Anschrift der Wohnung", "text", "z. B. Musterstraße 5, 64283 Darmstadt"],
        ["lage", "Lage der Wohnung (optional)", "text", "z. B. 2. OG links"],
        ["zum", "Kündigung zum", "date", "", () => rentEnd()],
        ["mieter", "Weitere Mieter laut Mietvertrag (Namen, mit Komma getrennt)", "text", ""],
        ["iban", "IBAN für die Rückzahlung der Kaution (optional)", "text", ""],
        ["uebergabe", "Termin für die Wohnungsübergabe anfragen", "check", "", true],
      ],
      subject: (v) => `Kündigung des Mietverhältnisses${v.objekt ? ` – ${v.objekt}` : ""}${v.lage ? `, ${v.lage}` : ""}`,
      body: (v, p) => {
        const wir = p.signers.length > 1;
        return [
          `hiermit kündige${wir ? "n wir" : " ich"} das Mietverhältnis über die Wohnung${v.objekt ? ` ${v.objekt}` : ""}${v.lage ? `, ${v.lage},` : ""} ordentlich und fristgerecht zum ${v.zum ? de(v.zum) : "nächstmöglichen Zeitpunkt"}${v.zum ? ", hilfsweise zum nächstmöglichen Zeitpunkt" : ""}.`,
          v.uebergabe && `Für die Übergabe der Wohnung und der Schlüssel bitte${wir ? "n wir" : " ich"} um einen Terminvorschlag.`,
          v.iban
            ? `Bitte überweisen Sie die Mietkaution nach Abrechnung auf folgendes Konto: IBAN ${v.iban}.`
            : `Bitte teilen Sie ${wir ? "uns" : "mir"} mit, wann mit der Abrechnung der Mietkaution zu rechnen ist.`,
          `Bitte bestätigen Sie ${wir ? "uns" : "mir"} den Eingang dieser Kündigung und das Ende des Mietverhältnisses schriftlich.`,
        ];
      },
      signers: (v, sender) => [sender, ...(v.mieter || "").split(",").map((s) => s.trim()).filter(Boolean)],
      hint: "Die Kündigung einer Wohnung muss eigenhändig unterschrieben werden – eine E-Mail reicht nicht (§ 568 BGB). Haben mehrere Personen den Mietvertrag unterschrieben, müssen alle unterschreiben. Das vorgeschlagene Datum gilt für die gesetzliche Frist von drei Monaten, wenn der Brief bis zum 3. Werktag des Monats ankommt (Feiertage nicht berücksichtigt). Prüfe deinen Mietvertrag.",
    },
    arbeit: {
      label: "Kündigung des Arbeitsvertrags (Arbeitnehmer)", file: "Kuendigung_Arbeitsvertrag",
      fields: [
        ["position", "Deine Tätigkeit (optional)", "text", "z. B. Werkstudent im Vertrieb"],
        ["zum", "Kündigung zum", "date", "", () => jobEnd()],
        ["zeugnis", "Qualifiziertes Arbeitszeugnis anfordern", "check", "", true],
        ["urlaub", "Resturlaub ansprechen", "check", "", false],
        ["dank", "Dank für die Zusammenarbeit", "check", "", true],
      ],
      subject: () => "Kündigung meines Arbeitsverhältnisses",
      body: (v) => [
        `hiermit kündige ich mein Arbeitsverhältnis${v.position ? ` als ${v.position}` : ""} ordentlich und fristgerecht zum ${v.zum ? de(v.zum) + ", hilfsweise zum nächstmöglichen Zeitpunkt" : "nächstmöglichen Zeitpunkt"}.`,
        v.urlaub && "Ich bitte darum, mir meinen verbleibenden Resturlaub bis zum Ende des Arbeitsverhältnisses zu gewähren oder – falls das nicht möglich ist – abzugelten.",
        v.zeugnis && "Bitte stellen Sie mir ein qualifiziertes Arbeitszeugnis aus und lassen Sie mir die Arbeitspapiere zum Ende des Arbeitsverhältnisses zukommen.",
        "Bitte bestätigen Sie mir den Erhalt dieser Kündigung und das Beendigungsdatum schriftlich.",
        v.dank && "Für die gute Zusammenarbeit bedanke ich mich und wünsche Ihnen und dem Team alles Gute.",
      ],
      hint: "Eine Kündigung des Arbeitsvertrags muss eigenhändig unterschrieben sein – per E-Mail ist sie unwirksam (§ 623 BGB). Das vorgeschlagene Datum entspricht der gesetzlichen Grundfrist (vier Wochen zum 15. oder Monatsende); im Arbeits- oder Tarifvertrag kann eine längere Frist stehen. Melde dich außerdem rechtzeitig bei der Agentur für Arbeit arbeitsuchend.",
    },
    widerspruch: {
      label: "Widerspruch gegen einen Bescheid", file: "Widerspruch",
      fields: [
        ["bescheid", "Welcher Bescheid?", "text", "z. B. den Wohngeldbescheid"],
        ["vom", "Datum des Bescheids", "date", ""],
        ["az", "Aktenzeichen / Kundennummer", "text", ""],
        ["begruendung", "Begründung (optional – kann nachgereicht werden)", "textarea", ""],
        ["akte", "Akteneinsicht beantragen", "check", "", false],
      ],
      subject: (v) => `Widerspruch gegen ${v.bescheid || "Ihren Bescheid"}${v.vom ? ` vom ${de(v.vom)}` : ""}${v.az ? ` – Aktenzeichen ${v.az}` : ""}`,
      body: (v) => [
        `hiermit lege ich gegen ${v.bescheid || "Ihren Bescheid"}${v.vom ? ` vom ${de(v.vom)}` : ""}${v.az ? ` (Aktenzeichen ${v.az})` : ""} Widerspruch ein.`,
        v.begruendung ? `Begründung:\n${v.begruendung}` : "Die Begründung reiche ich gesondert nach.",
        v.akte && "Zur Begründung beantrage ich Einsicht in die Verwaltungsakte bzw. die Übersendung von Kopien.",
        "Bitte bestätigen Sie mir den Eingang dieses Widerspruchs schriftlich.",
      ],
      hint: "Die Frist für einen Widerspruch beträgt meist einen Monat ab Bekanntgabe – sie steht in der Rechtsbehelfsbelehrung am Ende des Bescheids. Um die Frist zu wahren, reicht zunächst ein Widerspruch ohne Begründung.",
    },
    mahnung: {
      label: "Zahlungserinnerung / Mahnung", file: "Mahnung",
      fields: [
        ["stufe", "Stufe", "select", [["erinnerung", "Zahlungserinnerung"], ["mahnung", "Mahnung"], ["letzte", "Letzte Mahnung"]]],
        ["nr", "Rechnungsnummer", "text", ""],
        ["datum", "Rechnungsdatum", "date", ""],
        ["betrag", "Offener Betrag", "text", "z. B. 250,00 €"],
        ["frist", "Zahlen bis", "date", "", () => addDays(10)],
        ["iban", "Deine IBAN", "text", ""],
      ],
      subject: (v) => `${{ erinnerung: "Zahlungserinnerung", mahnung: "Mahnung", letzte: "Letzte Mahnung" }[v.stufe || "erinnerung"]}${v.nr ? ` – Rechnung Nr. ${v.nr}` : ""}${v.datum ? ` vom ${de(v.datum)}` : ""}`,
      body: (v) => {
        const r = `meine Rechnung${v.nr ? ` Nr. ${v.nr}` : ""}${v.datum ? ` vom ${de(v.datum)}` : ""}${v.betrag ? ` über ${v.betrag}` : ""}`;
        const first = {
          erinnerung: `sicher ist es Ihrer Aufmerksamkeit entgangen: ${r.charAt(0).toUpperCase() + r.slice(1)} ist noch offen.`,
          mahnung: `leider konnte ich bis heute keinen Zahlungseingang für ${r} feststellen.`,
          letzte: `trotz meiner bisherigen Erinnerungen ist ${r} weiterhin unbezahlt.`,
        }[v.stufe || "erinnerung"];
        return [
          first,
          `Bitte überweisen Sie den offenen Betrag bis spätestens ${v.frist ? de(v.frist) : "[Datum]"}${v.iban ? ` auf folgendes Konto: IBAN ${v.iban}` : ""}.`,
          v.stufe === "letzte"
            ? "Sollte der Betrag bis zu diesem Datum nicht eingegangen sein, werde ich ohne weitere Ankündigung ein gerichtliches Mahnverfahren einleiten."
            : "Sollten Sie die Zahlung bereits veranlasst haben, betrachten Sie dieses Schreiben bitte als gegenstandslos.",
        ];
      },
      hint: "Tipp: Hast du in der Rechnung ein festes Zahlungsdatum genannt, ist der Kunde ab dem Tag danach automatisch im Verzug – eine Mahnung ist dann nicht zwingend, aber üblich und freundlich.",
    },
    widerruf: {
      label: "Widerruf eines Online-Kaufs", file: "Widerruf",
      fields: [
        ["bestellnr", "Bestellnummer", "text", ""],
        ["bestellt", "Bestellt am", "date", ""],
        ["erhalten", "Erhalten am", "date", ""],
        ["waren", "Was widerrufst du? (eine Zeile pro Artikel)", "textarea", "z. B. Winterjacke, Größe M"],
        ["erstattung", "Erstattung und Rücksendeetikett anfordern", "check", "", true],
      ],
      subject: (v) => `Widerruf meiner Bestellung${v.bestellnr ? ` Nr. ${v.bestellnr}` : ""}`,
      body: (v) => [
        `hiermit widerrufe ich den von mir abgeschlossenen Vertrag über den Kauf der folgenden Waren:\n${(v.waren || "[Artikel]").split("\n").map((s) => s.trim()).filter(Boolean).map((s) => "– " + s).join("\n")}`,
        [v.bestellnr && `Bestellnummer: ${v.bestellnr}`, v.bestellt && `Bestellt am: ${de(v.bestellt)}`, v.erhalten && `Erhalten am: ${de(v.erhalten)}`].filter(Boolean).join("\n"),
        v.erstattung && "Bitte erstatten Sie mir den Kaufpreis einschließlich der Versandkosten für die Lieferung auf dem ursprünglichen Zahlungsweg und senden Sie mir für die Rücksendung ein Rücksendeetikett zu.",
        "Bitte bestätigen Sie mir den Eingang dieses Widerrufs.",
      ],
      hint: "Bei Online-Käufen hast du in der Regel 14 Tage ab Erhalt der Ware Zeit für den Widerruf. Er ist formlos möglich, auch per E-Mail – mit diesem Schreiben hast du ihn schriftlich und eindeutig erklärt.",
    },
  };

  // ------------------------------------------------------------------ Formular aufbauen
  const typeSel = $("[data-type]");
  const own = $("[data-own]");
  const textArea = $("[data-text]");
  let edited = false; // hat der Nutzer den Brieftext selbst geändert?
  for (const [k, t] of Object.entries(TYPES)) typeSel.appendChild(new Option(tr(t.label), k));
  typeSel.value = TYPES[root.dataset.default] ? root.dataset.default : "kuendigung";

  function renderFields() {
    const t = TYPES[typeSel.value];
    own.innerHTML = "";
    for (const [k, label, type, ph, def] of t.fields) {
      const id = "lt-" + k;
      const wrap = document.createElement("label");
      wrap.className = type === "check" ? "iv-check" : "iv-f iv-f--wide";
      let el;
      if (type === "textarea") { el = document.createElement("textarea"); el.rows = 3; }
      else if (type === "select") { el = document.createElement("select"); for (const [v, l] of ph) el.appendChild(new Option(tr(l), v)); }
      else { el = document.createElement("input"); el.type = type === "check" ? "checkbox" : type; }
      el.id = id;
      el.dataset.f = k;
      if (ph && typeof ph === "string") el.placeholder = tr(ph);
      if (type === "check") el.checked = !!def;
      else if (def) el.value = typeof def === "function" ? def() : def;
      if (type === "check") wrap.append(el, " " + tr(label));
      else { const s = document.createElement("span"); s.textContent = tr(label); wrap.append(s, el); }
      own.appendChild(wrap);
    }
    $("[data-hint]").textContent = tr(t.hint);
    edited = false;
    $("[data-restore]").hidden = true;
  }

  function values() {
    const v = {};
    for (const el of own.querySelectorAll("[data-f]")) v[el.dataset.f] = el.type === "checkbox" ? el.checked : el.value.trim();
    const g = (k) => (root.querySelector(`[data-g="${k}"]`).value || "").trim();
    const sender = { name: g("s_name"), street: g("s_street"), city: g("s_city"), contact: g("s_contact") };
    const to = { name: g("r_name"), extra: g("r_extra"), street: g("r_street"), city: g("r_city") };
    return { v, sender, to, place: g("place"), date: g("date"), salutation: g("salutation") || "Sehr geehrte Damen und Herren," };
  }

  // Text der Vorlage (Absätze, getrennt durch Leerzeile)
  function templateText() {
    const t = TYPES[typeSel.value];
    const d = values();
    const signers = t.signers ? t.signers(d.v, d.sender.name) : [d.sender.name];
    return t.body(d.v, { signers }).filter(Boolean).join("\n\n");
  }

  // ------------------------------------------------------------------ PDF setzen (DIN 5008, Form B)
  const MM = 72 / 25.4;
  async function build() {
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const t = TYPES[typeSel.value];
    const d = values();
    const doc = await PDFDocument.create();
    doc.setTitle(t.subject(d.v));
    doc.setCreator("PDF Libre");
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    // Zeichen, die Helvetica (WinAnsi) nicht kennt (z. B. ğ, ł), ohne Akzent schreiben statt abzustürzen
    const ok = new Map();
    const clean = (s) => [...String(s)].map((ch) => {
      if (!ok.has(ch)) { try { font.encodeText(ch); ok.set(ch, ch); } catch (_) { ok.set(ch, ch.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\x20-\x7e]/g, "?")); } }
      return ok.get(ch);
    }).join("");
    const W = 210 * MM, H = 297 * MM, L = 25 * MM, R = W - 20 * MM;
    let page = doc.addPage([W, H]);
    const text = (s, x, yTop, size = 11, f = font, color = rgb(0, 0, 0)) => page.drawText(clean(s), { x, y: H - yTop, size, font: f, color });
    const marks = () => {
      const c = rgb(0.6, 0.6, 0.6);
      for (const y of [105, 210]) page.drawLine({ start: { x: 3 * MM, y: H - y * MM }, end: { x: 8 * MM, y: H - y * MM }, thickness: 0.4, color: c }); // Falzmarken
      page.drawLine({ start: { x: 3 * MM, y: H - 148.5 * MM }, end: { x: 10 * MM, y: H - 148.5 * MM }, thickness: 0.4, color: c }); // Lochmarke
    };
    marks();

    // Briefkopf: Absender rechts oben
    const head = [d.sender.name, d.sender.street, d.sender.city, d.sender.contact].filter(Boolean);
    head.forEach((s, i) => { const w = (i === 0 ? bold : font).widthOfTextAtSize(clean(s), 10); text(s, R - w, 20 * MM + i * 13, 10, i === 0 ? bold : font); });

    // Anschriftfeld (Form B: ab 45 mm; Rücksendeangabe klein, darunter die Empfängeranschrift)
    const back = [d.sender.name, d.sender.street, d.sender.city].filter(Boolean).join(" · ");
    if (back) { text(back, L, 49 * MM, 7, font, rgb(0.35, 0.35, 0.35)); page.drawLine({ start: { x: L, y: H - 50 * MM }, end: { x: L + Math.min(font.widthOfTextAtSize(clean(back), 7), 80 * MM), y: H - 50 * MM }, thickness: 0.3, color: rgb(0.5, 0.5, 0.5) }); }
    [d.to.name, d.to.extra, d.to.street, d.to.city].filter(Boolean).forEach((s, i) => text(s, L, 63 * MM + i * 5 * MM, 11));

    // Ort, Datum rechtsbündig; Betreff fett
    const dateLine = [d.place, de(d.date)].filter(Boolean).join(", ");
    if (dateLine) text(dateLine, R - font.widthOfTextAtSize(clean(dateLine), 11), 98 * MM, 11);
    let y = 108 * MM;
    const LH = 15.5;
    const wrap = (s, f, size, width) => {
      const out = [];
      for (const para of clean(s).split("\n")) {
        let line = "";
        for (const word of para.split(/ +/)) {
          const tryLine = line ? line + " " + word : word;
          if (f.widthOfTextAtSize(tryLine, size) <= width || !line) line = tryLine;
          else { out.push(line); line = word; }
        }
        out.push(line);
      }
      return out;
    };
    const newPage = () => { page = doc.addPage([W, H]); marks(); y = 25 * MM; };
    const lines = (arr, f = font, size = 11) => { for (const ln of arr) { if (y > H - 25 * MM) newPage(); text(ln, L, y, size, f); y += LH; } };
    lines(wrap(t.subject(d.v), bold, 11, R - L), bold);
    y += LH;
    lines([d.salutation]);
    y += LH * 0.6;
    const body = (edited ? textArea.value : templateText()).trim();
    const paras = body.split(/\n\s*\n/);
    paras.forEach((p, i) => { lines(wrap(p, font, 11, R - L)); if (i < paras.length - 1) y += LH * 0.6; });
    y += LH * 0.6;
    lines(["Mit freundlichen Grüßen"]);
    // Platz für Unterschrift(en)
    const signers = (t.signers ? t.signers(d.v, d.sender.name) : [d.sender.name]).filter(Boolean);
    if (y + 20 * MM > H - 25 * MM) newPage();
    y += 16 * MM;
    const colW = (R - L) / Math.min(Math.max(signers.length, 1), 3);
    signers.forEach((n, i) => {
      const x = L + (i % 3) * colW;
      if (i && i % 3 === 0) y += 22 * MM;
      if (signers.length > 1) page.drawLine({ start: { x, y: H - y + 12 }, end: { x: x + colW - 10 * MM, y: H - y + 12 }, thickness: 0.5 });
      text(n, x, y, 11);
    });
    return doc.save();
  }

  // ------------------------------------------------------------------ Vorschau (pdf.js) und Download
  const canvas = $("[data-preview]");
  let timer = null, busy = false, again = false, lastUrl = null;
  async function preview() {
    if (busy) { again = true; return; }
    busy = true;
    try {
      const bytes = await build();
      const pdf = await pdfjsLib.getDocument({ data: bytes, isEvalSupported: false }).promise;
      const pg = await pdf.getPage(1);
      const box = canvas.parentElement.clientWidth || 420;
      const vp = pg.getViewport({ scale: box / pg.getViewport({ scale: 1 }).width });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = vp.width * dpr; canvas.height = vp.height * dpr;
      canvas.style.width = vp.width + "px"; canvas.style.height = vp.height + "px";
      await pg.render({ canvasContext: canvas.getContext("2d"), viewport: vp, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null }).promise;
      $("[data-pages]").textContent = pdf.numPages > 1 ? tr("Seite 1 von {n}", { n: pdf.numPages }) : "";
    } catch (e) { console.error(e); }
    busy = false;
    if (again) { again = false; preview(); }
  }
  const schedule = () => { clearTimeout(timer); timer = setTimeout(preview, 250); };

  function refreshText() { if (!edited) textArea.value = templateText(); }

  root.addEventListener("input", (e) => {
    if (e.target === textArea) { edited = true; $("[data-restore]").hidden = false; }
    else refreshText();
    schedule();
  });
  root.addEventListener("change", (e) => {
    if (e.target === typeSel) { renderFields(); history.replaceState(null, "", "#" + typeSel.value); }
    if (e.target !== textArea) refreshText();
    schedule();
  });
  $("[data-restore]").addEventListener("click", () => { edited = false; $("[data-restore]").hidden = true; refreshText(); schedule(); });
  $("[data-download]").addEventListener("click", async () => {
    const d = values();
    try {
      if ($("[data-remember]").checked) localStorage.setItem(STORE, JSON.stringify({ ...d.sender, place: d.place }));
      else localStorage.removeItem(STORE);
    } catch (_) {}
    const bytes = await build();
    if (lastUrl) URL.revokeObjectURL(lastUrl);
    lastUrl = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = lastUrl;
    a.download = `${TYPES[typeSel.value].file}_${(d.date || "").replace(/-/g, "")}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  // Start: gemerkter Absender, heutiges Datum, Vorlage aus der Adresse (#mahnung) oder der Ratgeberseite
  try {
    const s = JSON.parse(localStorage.getItem(STORE) || "null");
    if (s) for (const [k, g] of [["name", "s_name"], ["street", "s_street"], ["city", "s_city"], ["contact", "s_contact"], ["place", "place"]]) if (s[k]) root.querySelector(`[data-g="${g}"]`).value = s[k];
  } catch (_) {}
  root.querySelector('[data-g="date"]').value = iso(new Date());
  const hash = location.hash.slice(1);
  if (TYPES[hash]) typeSel.value = hash;
  renderFields();
  refreshText();
  preview();
  window.addEventListener("resize", schedule);
})();

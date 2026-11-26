/**
 * KI-Werkzeuge: PDF zusammenfassen und PDF übersetzen.
 *
 * Funktioniert mit jeder OpenAI-kompatiblen API (OpenAI, Mistral, OpenRouter, Groq, …).
 * Einstellungen in der .env:
 *   AI_API_KEY=…                         (Pflicht – ohne Schlüssel sind die KI-Werkzeuge aus)
 *   AI_BASE_URL=https://api.openai.com/v1 (optional)
 *   AI_MODEL=gpt-4o-mini                  (optional: günstiges Modell für alles Einfache)
 *   AI_MODEL_STRONG=…                     (optional: stärkeres Modell für Anschreiben, Formulierungen, Stellenanzeige;
 *                                          leer = AI_MODEL)
 *   AI_RATE_LIMIT=10                      (optional: KI-Aufträge pro Stunde und IP, schützt deine API-Kosten)
 *
 * Mit PAYMENTS_ENABLED=true sind die KI-Werkzeuge Pro-Werkzeuge (Konto + Pro/Tagespass nötig).
 */
const express = require("express");
const path = require("path");
const fsp = require("fs/promises");
const { rateLimit } = require("express-rate-limit");
const { requireAccess, requireDb, ApiError } = require("./auth");
const payments = require("./payments");

const KEY = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "";
const BASE = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
const MODEL = process.env.AI_MODEL || "gpt-4o-mini";
const MODEL_STRONG = process.env.AI_MODEL_STRONG || MODEL;
const enabled = Boolean(KEY);

const MAX_SUMMARY_CHARS = 180_000; // ca. 60 Seiten Fließtext
const CHUNK_CHARS = 30_000;
const MAX_TRANSLATE_CHARS = 60_000;

const LANGUAGES = {
  de: "Deutsch",
  en: "Englisch",
  fr: "Französisch",
  es: "Spanisch",
  it: "Italienisch",
  pt: "Portugiesisch",
  nl: "Niederländisch",
  pl: "Polnisch",
  tr: "Türkisch",
  ro: "Rumänisch",
  ru: "Russisch",
  uk: "Ukrainisch",
};

// Neuere OpenAI-Modelle (GPT-5 und später) erwarten „max_completion_tokens“ statt „max_tokens“
// und erlauben oft keine eigene „temperature“ – beim ersten 400-Fehler merken wir uns das pro Modell.
const NEW_STYLE = new Set();
async function chat(messages, { json = false, maxTokens = 1800, strong = false } = {}) {
  const model = strong ? MODEL_STRONG : MODEL;
  const send = (modern) =>
    fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        ...(modern ? { max_completion_tokens: maxTokens * 3 } : { temperature: 0.2, max_tokens: maxTokens }), // Denkmodelle brauchen Spielraum
        ...(json ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: AbortSignal.timeout(180_000),
    });
  let res;
  try {
    res = await send(NEW_STYLE.has(model));
    if (res.status === 400 && !NEW_STYLE.has(model)) {
      const text = await res.text().catch(() => "");
      if (/max_tokens|max_completion_tokens|temperature/.test(text)) {
        NEW_STYLE.add(model);
        res = await send(true);
      } else {
        console.error("KI-Fehler", 400, text.slice(0, 300));
        throw new ApiError("Der KI-Dienst ist gerade nicht erreichbar. Bitte versuche es später noch einmal.", 502);
      }
    }
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError("Der KI-Dienst antwortet gerade nicht. Bitte versuche es in ein paar Minuten noch einmal.", 502);
  }
  if (!res.ok) {
    console.error("KI-Fehler", res.status, (await res.text().catch(() => "")).slice(0, 300));
    throw new ApiError("Der KI-Dienst ist gerade nicht erreichbar. Bitte versuche es später noch einmal.", 502);
  }
  const data = await res.json();
  return String(data.choices?.[0]?.message?.content || "").trim();
}

/** Einfaches, sicheres Markdown → HTML (nur Überschriften, Listen, fett, Absätze) */
function markdownToHtml(md) {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  const out = [];
  let list = null;
  const close = () => {
    if (list) out.push(`</${list}>`);
    list = null;
  };
  for (const raw of md.split(/\r?\n/)) {
    const line = raw.trim();
    let m;
    if (!line) close();
    else if ((m = line.match(/^#{1,2}\s+(.*)/))) {
      close();
      out.push(`<h2>${inline(m[1])}</h2>`);
    } else if ((m = line.match(/^#{3,6}\s+(.*)/))) {
      close();
      out.push(`<h3>${inline(m[1])}</h3>`);
    } else if ((m = line.match(/^[-*•]\s+(.*)/))) {
      if (list !== "ul") {
        close();
        out.push("<ul>");
        list = "ul";
      }
      out.push(`<li>${inline(m[1])}</li>`);
    } else if ((m = line.match(/^\d+[.)]\s+(.*)/))) {
      if (list !== "ol") {
        close();
        out.push("<ol>");
        list = "ol";
      }
      out.push(`<li>${inline(m[1])}</li>`);
    } else {
      close();
      out.push(`<p>${inline(line)}</p>`);
    }
  }
  close();
  return out.join("\n");
}

const LENGTH = {
  short: "sehr knapp: höchstens 5 Stichpunkte",
  medium: "ein kurzer Überblick (2–3 Sätze) und danach die wichtigsten Punkte als Stichpunkte",
  long: "ausführlich: Überblick, dann Abschnitt für Abschnitt die wichtigsten Inhalte",
};

function summaryPrompt(length, lang) {
  const language = lang === "auto" ? "in der Sprache des Dokuments" : `auf ${LANGUAGES[lang] || "Deutsch"}`;
  return `Du fasst Dokumente für Privatpersonen und Studierende verständlich zusammen. Schreibe ${language}, sachlich und in einfachen Worten.
Umfang: ${LENGTH[length] || LENGTH.medium}.
Format: Markdown mit den Überschriften „## Überblick“ und „## Wichtigste Punkte“ (in der Zielsprache).
Wenn das Dokument Fristen, Termine, Beträge oder Aufgaben für den Leser enthält (z. B. ein Brief einer Behörde, ein Vertrag, eine Rechnung), füge „## Was ist zu tun?“ mit genau diesen Angaben hinzu.
Erfinde nichts, was nicht im Dokument steht.`;
}

// ------------------------------------------------------------------ Lebenslauf
const CV_IMPORT_PROMPT = `Du überträgst einen bestehenden Lebenslauf in ein Formular. Antworte nur mit JSON in genau diesem Format:
{"lang":"de"|"en"|"fr",
 "person":{"name":"","headline":"","email":"","phone":"","location":"","links":""},
 "summary":"",
 "experience":[{"title":"","org":"","place":"","from":"","to":"","current":false,"text":""}],
 "education":[{"title":"","org":"","place":"","from":"","to":"","current":false,"text":""}],
 "projects":[{"title":"","org":"","from":"","to":"","text":""}],
 "skills":[{"label":"","value":""}],
 "languages":[{"label":"","value":""}],
 "extra":{"title":"","text":""}}
Regeln:
- Übernimm ausschließlich, was im Lebenslauf steht. Erfinde, ergänze oder verbessere nichts. Lass Felder leer, wenn die Angabe fehlt.
- Übernimm Texte wörtlich; repariere nur Zeilenumbrüche und Silbentrennung, die durch das Auslesen der PDF entstanden sind.
- headline: Berufsbezeichnung oder Wunschposition unter dem Namen, falls vorhanden.
- links: LinkedIn, GitHub, Website – eine pro Zeile, ohne "https://".
- Daten im Format MM/JJJJ oder JJJJ. "heute", "bis jetzt", "present" → current: true und to leer.
- experience umfasst Berufserfahrung, Praktika, Werkstudenten- und Nebenjobs. title = Position, org = Unternehmen.
- education: title = Abschluss/Studiengang, org = Schule/Hochschule.
- text: Aufgaben und Erfolge als Stichpunkte, jede Zeile beginnt mit "- ".
- skills: Gruppen wie {"label":"Programmierung","value":"Python, SQL"}. Ohne Gruppen: label leer.
- languages: {"label":"Deutsch","value":"C1"}.
- extra: Ehrenamt, Interessen, Führerschein, Publikationen usw. – mit passender Überschrift.
- Reihenfolge der Einträge wie im Original (meist neueste zuerst).
- lang: Sprache des Lebenslaufs.`;

const CV_PROOFREAD_PROMPT = `Du bist Korrektor für Lebensläufe. Du bekommst eine Liste von Textfeldern eines Lebenslaufs.
Korrigiere NUR Rechtschreibung, Grammatik, Zeichensetzung und offensichtliche Tippfehler – in der Sprache des jeweiligen Textes.
Ändere NICHT den Inhalt, den Stil oder die Wortwahl, füge nichts hinzu und lass nichts weg. Behalte Zeilenumbrüche, Stichpunkte ("- "), Zahlen, Namen, Firmennamen, Fachbegriffe und Abkürzungen bei.
Antworte nur mit JSON: {"items":[{"id":"…","text":"…"}]} – für jedes Feld, auch wenn nichts zu korrigieren ist (dann unverändert).`;

const NO_INVENT = `Absolute Regel: Erfinde nichts. Keine neuen Tätigkeiten, Kenntnisse, Werkzeuge, Zahlen, Prozentangaben, Abschlüsse oder Erfolge, die nicht im Lebenslauf stehen. Du darfst nur umformulieren, gewichten und Begriffe aus der Stellenanzeige verwenden, wenn der Lebenslauf dieselbe Sache bereits belegt.`;

const CV_IMPROVE_PROMPT = `Du bist Bewerbungscoach und verbesserst die Formulierungen in einem Lebenslauf.
Ziele: klare, aktive Formulierungen mit starken Verben (z. B. „Entwickelt“, „Verantwortet“, „Automatisiert“, „Betreut“), knappe Stichpunkte, Ergebnis vor Tätigkeit, einheitlicher Stil, keine Füllwörter, keine Ich-Form in Stichpunkten.
${NO_INVENT}
Behalte die Sprache jedes Feldes, Stichpunkte ("- "), Namen, Firmen und Fachbegriffe bei. Felder, die schon gut sind, gibst du unverändert zurück.
Antworte nur mit JSON: {"items":[{"id":"…","text":"…"}]} – für jedes Feld.`;

const CV_KEYWORDS_PROMPT = `Du analysierst eine Stellenanzeige für einen ATS-Abgleich. Antworte nur mit JSON:
{"role":"Stellenbezeichnung","company":"Unternehmen oder leer","keywords":[{"term":"Python","aliases":["Python 3"],"must":true}]}
- 8 bis 20 konkrete Anforderungen: Fachkenntnisse, Werkzeuge, Methoden, Abschlüsse, Sprachen, wichtige Soft Skills. Keine Allgemeinplätze wie „Teamfähigkeit“, außer sie werden betont.
- term: so, wie es in der Anzeige steht. aliases: übliche andere Schreibweisen oder Übersetzungen (z. B. "Machine Learning" ↔ "maschinelles Lernen").
- must: true für ausdrücklich geforderte Punkte („setzen voraus“, „erforderlich“), false für „wünschenswert“, „von Vorteil“.`;

const CV_TAILOR_PROMPT = `Du passt einen Lebenslauf an eine Stellenanzeige an, damit Personaler und ATS die passenden Erfahrungen sofort sehen.
Du bekommst die Stellenanzeige, die Liste der Anforderungen (mit gefunden/fehlend) und die Textfelder des Lebenslaufs.
- Formuliere Felder so um, dass vorhandene, zur Stelle passende Erfahrung im Vordergrund steht, und verwende die Begriffe der Anzeige, WENN der Lebenslauf dieselbe Sache belegt.
- Schreibe das Feld "p.headline" passend zur Stelle (nur wenn der Lebenslauf das hergibt) und das Profil (Kurzprofil) mit Bezug auf die Stelle.
- Ändere Felder, die nichts mit der Stelle zu tun haben, nicht.
${NO_INVENT}
Antworte nur mit JSON: {"items":[{"id":"…","text":"…"}],"tips":["kurzer Hinweis", …]}
tips: höchstens 4 ehrliche Hinweise, z. B. welche fehlende Anforderung der Bewerber ergänzen sollte, FALLS er sie wirklich hat.`;

const CV_LETTER_PROMPT = `Du schreibst ein Bewerbungsanschreiben auf Grundlage eines Lebenslaufs und einer Stellenanzeige.
- Sprache: die Sprache der Stellenanzeige.
- Ton: professionell, konkret, freundlich, ohne Floskeln wie „hiermit bewerbe ich mich“. Etwa 250–350 Wörter, 3–4 Absätze: Einstieg mit Bezug zur Stelle/zum Unternehmen, passende Erfahrungen mit konkreten Beispielen aus dem Lebenslauf, Motivation und Mehrwert, Abschluss mit Verfügbarkeit/Gesprächswunsch.
- ${NO_INVENT} Nutze nur Angaben aus dem Lebenslauf und den Notizen des Bewerbers.
Antworte nur mit JSON: {"subject":"Bewerbung als …","salutation":"Sehr geehrte …,","paragraphs":["…","…"],"closing":"Mit freundlichen Grüßen"}
Ist ein Ansprechpartner bekannt, sprich ihn mit Namen an, sonst „Sehr geehrte Damen und Herren,“ (Englisch: „Dear Hiring Team,“, Französisch: „Madame, Monsieur,“). Grußformel auf Französisch: „Je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.“`;

const CV_TRANSLATE_PROMPT = (lang) => `Übersetze die Textfelder eines Lebenslaufs ins ${lang}. Natürlich und professionell, wie ein Muttersprachler einen Lebenslauf schreibt – nicht wörtlich.
Übersetze Positionen, Abschlüsse (z. B. „Abitur“ → „German university entrance qualification (Abitur)“ bzw. „Abitur (équivalent du baccalauréat)“) und Beschreibungen. Verwende die in der Zielsprache üblichen Begriffe für Lebensläufe. Lass Namen, Firmennamen, Hochschulnamen, Orte, E-Mail-Adressen, Links, Produkt- und Technologienamen unverändert. Behalte Stichpunkte ("- ") und Zeilenumbrüche.
Antworte nur mit JSON: {"items":[{"id":"…","text":"…"}]} – für jedes Feld.`;

const str = (v, max = 400) => (typeof v === "string" ? v.trim().slice(0, max) : "");
function normalizeCv(j) {
  const entry = (e) => ({
    title: str(e.title, 200),
    org: str(e.org, 200),
    place: str(e.place, 120),
    from: str(e.from, 20),
    to: e.current ? "" : str(e.to, 20),
    current: e.current === true,
    text: str(e.text, 3000),
  });
  const list = (a, fn, n = 30) => (Array.isArray(a) ? a.filter((x) => x && typeof x === "object").slice(0, n).map(fn) : []);
  const pair = (e) => ({ label: str(e.label, 120), value: str(e.value, 600) });
  const p = j.person || {};
  const extra = j.extra && typeof j.extra === "object" ? j.extra : {};
  return {
    v: 1,
    lang: ["en", "fr"].includes(j.lang) ? j.lang : "de",
    person: { name: str(p.name, 120), headline: str(p.headline, 200), email: str(p.email, 200), phone: str(p.phone, 60), location: str(p.location, 120), links: str(p.links, 600) },
    sections: [
      { type: "summary", text: str(j.summary, 3000) },
      { type: "experience", items: list(j.experience, entry) },
      { type: "education", items: list(j.education, entry) },
      { type: "projects", items: list(j.projects, entry) },
      { type: "skills", items: list(j.skills, pair) },
      { type: "languages", items: list(j.languages, pair) },
      { type: "extra", title: str(extra.title, 120), text: str(extra.text, 3000) },
    ],
  };
}


// ------------------------------------------------------------------ Rechnungs-Import
const INVOICE_IMPORT_PROMPT = `Du liest den Text einer Rechnung (evtl. aus Texterkennung, mit Fehlern) und gibst NUR die Daten zurück, die wirklich im Text stehen.
Erfinde nichts. Fehlt etwas, lass das Feld leer ("") bzw. null.
Rechnungssteller (seller) = wer die Rechnung schreibt und das Geld bekommt (meist Briefkopf, Fußzeile mit IBAN/Steuernummer).
Rechnungsempfänger (buyer) = an wen die Rechnung adressiert ist (Anschriftfeld).
Antworte als JSON:
{
 "type": "invoice" | "credit_note",
 "number": "", "issue_date": "YYYY-MM-DD", "delivery_date": "YYYY-MM-DD oder leer", "due_date": "YYYY-MM-DD oder leer", "due_days": Zahl oder null,
 "buyer_reference": "Leitweg-ID oder Bestellnummer, falls angegeben",
 "seller": {"name":"","street":"","postal_code":"","city":"","country_code":"DE","vat_id":"","tax_number":"","email":"","contact_name":"","phone":""},
 "buyer": {"name":"","street":"","postal_code":"","city":"","country_code":"DE","email":""},
 "iban": "", "bic": "",
 "small_business": true nur wenn die Rechnung auf § 19 UStG / Kleinunternehmer hinweist,
 "prices_are_gross": true wenn die Einzelpreise der Positionen INKLUSIVE Umsatzsteuer angegeben sind,
 "lines": [{"name":"", "quantity": Zahl, "unit": "Stück|Stunde|Tag|Monat|kg|Pauschale", "unit_price": Zahl (Preis pro Einheit wie im Dokument), "vat_rate": 19|7|0}],
 "totals": {"net": Zahl oder null, "vat": Zahl oder null, "gross": Zahl oder null},
 "note": "kurzer Hinweistext der Rechnung, falls vorhanden (z. B. Dank, Leistungszeitraum)",
 "uncertain": ["Liste der Felder, bei denen du unsicher bist, z. B. 'seller.street', 'lines.2.unit_price'"]
}
Zahlen als JSON-Zahlen mit Punkt (1234.5). Ländercodes nach ISO (DE, AT, FR …). Rechnungsnummer genau wie gedruckt.`;

const UNIT = { "stück": "C62", stk: "C62", stunde: "HUR", std: "HUR", h: "HUR", tag: "DAY", monat: "MON", kg: "KGM", pauschale: "LS", pauschal: "LS" };
const round2 = (x) => Math.round((x + Math.sign(x) * Number.EPSILON) * 100) / 100;
const numOf = (v) => {
  if (typeof v === "number") return isFinite(v) ? v : NaN;
  let s = String(v ?? "").replace(/[\s€]/g, "");
  if (s.includes(",")) s = s.replace(/\.(?=\d{3}\b)/g, "").replace(",", ".");
  return s ? Number(s) : NaN;
};
const istr = (v, n = 200) => (typeof v === "string" ? v.trim().slice(0, n) : typeof v === "number" ? String(v) : "");
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || "");

// KI-Ergebnis → Entwurf für das Formular + Warnungen für die Bestätigungsseite
function checkInvoice(raw, text) {
  const party = (p = {}, keys) => Object.fromEntries(keys.map((k) => [k, istr(p[k])]));
  const sellerKeys = ["name", "street", "postal_code", "city", "country_code", "vat_id", "tax_number", "email", "contact_name", "phone"];
  const draft = {
    type_code: raw.type === "credit_note" ? "381" : "380",
    number: istr(raw.number, 60),
    issue_date: isDate(raw.issue_date) ? raw.issue_date : "",
    delivery_date: isDate(raw.delivery_date) ? raw.delivery_date : "",
    due_days: 14,
    buyer_reference: istr(raw.buyer_reference, 80),
    seller: party(raw.seller, sellerKeys),
    buyer: party(raw.buyer, ["name", "street", "postal_code", "city", "country_code", "email"]),
    iban: istr(raw.iban, 40).replace(/\s+/g, ""),
    bic: istr(raw.bic, 20).replace(/\s+/g, ""),
    small_business: raw.small_business === true,
    note: istr(raw.note, 500),
    lines: [],
  };
  for (const p of [draft.seller, draft.buyer]) p.country_code = (p.country_code || "DE").toUpperCase().slice(0, 2);
  if (isDate(raw.due_date) && draft.issue_date) {
    const d = Math.round((new Date(raw.due_date) - new Date(draft.issue_date)) / 86400000);
    if (d >= 0 && d < 400) draft.due_days = d;
  } else if (Number.isInteger(raw.due_days) && raw.due_days >= 0 && raw.due_days < 400) draft.due_days = raw.due_days;

  const warnings = [];
  for (const l of (Array.isArray(raw.lines) ? raw.lines : []).slice(0, 100)) {
    const name = istr(l.name, 300);
    let q = numOf(l.quantity), price = numOf(l.unit_price);
    const rate = draft.small_business ? 0 : [19, 7, 0].includes(numOf(l.vat_rate)) ? numOf(l.vat_rate) : 19;
    if (!name && isNaN(price)) continue;
    if (isNaN(q) || q === 0) q = 1;
    if (raw.prices_are_gross === true && !isNaN(price) && rate) price = Math.round((price / (1 + rate / 100)) * 10000) / 10000; // Brutto → Netto
    draft.lines.push({ name, quantity: String(q), unit_code: UNIT[String(l.unit || "").toLowerCase()] || "C62", unit_price: isNaN(price) ? "" : String(price), vat_rate: String(rate) });
  }
  if (raw.prices_are_gross === true) warnings.push({ field: "lines", text: "Die Preise standen in der Rechnung inklusive Umsatzsteuer und wurden in Nettopreise umgerechnet. Bitte prüfe die Beträge." });

  // Summen nachrechnen (gleiche Rundung wie der E-Rechnung-Dienst) und mit der Rechnung vergleichen
  const groups = new Map();
  let net = 0;
  for (const l of draft.lines) {
    const n = round2(numOf(l.quantity) * (numOf(l.unit_price) || 0));
    net += n;
    groups.set(l.vat_rate, (groups.get(l.vat_rate) || 0) + n);
  }
  let vat = 0;
  for (const [r, b] of groups) vat += round2((b * Number(r)) / 100);
  const computed = { net: round2(net), vat: round2(vat), gross: round2(net + vat) };
  const found = { net: numOf(raw.totals?.net), vat: numOf(raw.totals?.vat), gross: numOf(raw.totals?.gross) };
  for (const k of ["gross", "net"]) {
    if (!isNaN(found[k]) && Math.abs(found[k] - computed[k]) > 0.02) {
      // Text mit Platzhaltern, damit der Browser ihn übersetzen kann
      warnings.push({ field: "totals", text: "{what}: In der Rechnung steht {found} €, aus den Positionen ergeben sich {computed} €. Bitte prüfe die Positionen.", vars: { what: k === "gross" ? "Gesamtbetrag" : "Nettobetrag", found: found[k].toFixed(2), computed: computed[k].toFixed(2) } });
      break;
    }
  }

  // Steht das wirklich im Dokument? (Ziffern/Buchstaben ohne Leerzeichen vergleichen)
  // Texterkennung verwechselt oft O/0 und I/l/1 → beide Seiten gleich vereinfachen
  const norm = (x) => String(x).replace(/[\s.\-/]/g, "").toUpperCase().replace(/O/g, "0").replace(/[IL]/g, "1");
  const flat = norm(text);
  const inText = (v) => !v || flat.includes(norm(v));
  if (draft.number && !inText(draft.number)) warnings.push({ field: "number", text: "Die Rechnungsnummer wurde so nicht im Dokument gefunden." });
  if (draft.iban && !inText(draft.iban)) warnings.push({ field: "iban", text: "Die IBAN wurde so nicht im Dokument gefunden." });
  if (draft.iban && !ibanOk(draft.iban)) warnings.push({ field: "iban", text: "Die IBAN hat eine ungültige Prüfziffer – bitte vergleiche sie mit der Rechnung." });
  if (!draft.lines.length) warnings.push({ field: "lines", text: "Es wurden keine Positionen erkannt. Bitte trage sie ein." });

  const uncertain = (Array.isArray(raw.uncertain) ? raw.uncertain : []).filter((u) => typeof u === "string").slice(0, 30);
  return { draft, computed, found: Object.fromEntries(Object.entries(found).map(([k, v]) => [k, isNaN(v) ? null : v])), warnings, uncertain };
}
function ibanOk(iban) {
  const s = iban.toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(s)) return false;
  const moved = (s.slice(4) + s.slice(0, 4)).replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let rest = 0;
  for (const ch of moved) rest = (rest * 10 + Number(ch)) % 97;
  return rest === 1;
}

module.exports = function aiRouter({ run, jobDir, PYTHON, outName, uploader, requireFiles, sendFile, sofficeConvert }) {
  const r = express.Router();
  const script = path.join(__dirname, "..", "pdf_ai.py");

  const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: Number(process.env.AI_RATE_LIMIT) || 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Du hast die KI-Werkzeuge in der letzten Stunde oft genutzt. Bitte warte etwas und versuche es dann erneut." },
  });

  const ready = (req, res, next) => (enabled ? next() : next(new ApiError("Die KI-Werkzeuge sind auf diesem Server gerade nicht eingerichtet.", 503)));
  const access = payments.enabled ? [requireDb, requireAccess] : [];
  const pre = [ready, ...access, limiter, jobDir, uploader("pdf")];

  async function pythonJson(args, outFile) {
    try {
      await run(PYTHON, [script, ...args]);
    } catch (e) {
      if (/password/.test(e.stderr || "")) throw new ApiError("Diese PDF ist passwortgeschützt. Entsperre sie zuerst mit „PDF entsperren“.");
      throw e;
    }
    return JSON.parse(await fsp.readFile(outFile, "utf8"));
  }

  // ------------------------------------------------------------------ Zusammenfassen
  r.post("/summarize", ...pre, async (req, res, next) => {
    try {
      const [file] = requireFiles(req);
      const textFile = path.join(req.jobDir, "text.json");
      const { pages } = await pythonJson(["text", file.path, textFile], textFile);
      const full = pages.map((t, i) => `[Seite ${i + 1}]\n${t.trim()}`).join("\n\n").replace(/[ \t]+/g, " ");
      if (full.replace(/\[Seite \d+\]|\s/g, "").length < 40) {
        throw new ApiError("In dieser PDF wurde kaum Text gefunden. Ist sie gescannt? Dann kann sie nicht zusammengefasst werden.", 422);
      }
      const text = full.slice(0, MAX_SUMMARY_CHARS);
      const system = summaryPrompt(req.body.length, req.body.lang || "de");
      let summary;
      if (text.length <= CHUNK_CHARS * 1.3) {
        summary = await chat([{ role: "system", content: system }, { role: "user", content: text }]);
      } else {
        // Lange Dokumente: erst Teile zusammenfassen, dann daraus die Gesamtzusammenfassung
        const parts = [];
        for (let i = 0; i < text.length; i += CHUNK_CHARS) parts.push(text.slice(i, i + CHUNK_CHARS));
        const notes = [];
        for (let i = 0; i < parts.length; i += 3) {
          const batch = await Promise.all(
            parts.slice(i, i + 3).map((p) => chat([{ role: "system", content: "Fasse diesen Teil eines längeren Dokuments in Stichpunkten zusammen. Behalte Fristen, Beträge und Namen." }, { role: "user", content: p }], { maxTokens: 900 }))
          );
          notes.push(...batch);
        }
        summary = await chat([{ role: "system", content: system }, { role: "user", content: `Zusammenfassungen der Teile eines Dokuments:\n\n${notes.join("\n\n---\n\n")}` }]);
      }
      const html = markdownToHtml(summary);
      const htmlFile = path.join(req.jobDir, "summary.html");
      const out = path.join(req.jobDir, "summary.pdf");
      await fsp.writeFile(htmlFile, html);
      await run(PYTHON, [script, "report", htmlFile, file.originalname ? Buffer.from(file.originalname, "latin1").toString("utf8") : "Dokument", out]);
      const pdf = await fsp.readFile(out);
      res.json({
        filename: outName(file.originalname, "_Zusammenfassung", ".pdf"),
        mime: "application/pdf",
        file: pdf.toString("base64"),
        preview: html,
        truncated: full.length > MAX_SUMMARY_CHARS,
      });
    } catch (e) {
      next(e);
    }
  });

  // ------------------------------------------------------------------ Übersetzen
  r.post("/translate", ...pre, async (req, res, next) => {
    try {
      const [file] = requireFiles(req);
      const target = LANGUAGES[req.body.lang] ? req.body.lang : "en";
      const blocksFile = path.join(req.jobDir, "blocks.json");
      const data = await pythonJson(["blocks", file.path, blocksFile], blocksFile);
      if (data.pageCount > data.maxPages) throw new ApiError(`Bitte übersetze höchstens ${data.maxPages} Seiten auf einmal. Teile die PDF vorher mit „PDF teilen“.`, 413);
      const blocks = data.blocks;
      if (!blocks.length) throw new ApiError("In dieser PDF wurde kein übersetzbarer Text gefunden. Ist sie gescannt?", 422);
      const total = blocks.reduce((s, b) => s + b.text.length, 0);
      if (total > MAX_TRANSLATE_CHARS) throw new ApiError("Diese PDF enthält sehr viel Text. Bitte teile sie mit „PDF teilen“ in kleinere Teile auf (bis ca. 20 Seiten Fließtext).", 413);

      // In Paketen übersetzen; die KI gibt dieselbe Anzahl Einträge zurück
      const system = `Übersetze jeden Eintrag der Liste ins ${LANGUAGES[target]}. Antworte nur mit JSON im Format {"items": ["…", …]} – gleiche Anzahl und Reihenfolge wie die Eingabe. Behalte Zahlen, Namen, E-Mail-Adressen und Abkürzungen bei. Übersetze natürlich und vollständig, nicht wörtlich. Ist ein Eintrag schon in der Zielsprache, gib ihn unverändert zurück.`;
      const batches = [];
      let cur = [];
      let size = 0;
      for (const b of blocks) {
        if (cur.length && (size + b.text.length > 4000 || cur.length >= 60)) {
          batches.push(cur);
          cur = [];
          size = 0;
        }
        cur.push(b);
        size += b.text.length;
      }
      if (cur.length) batches.push(cur);

      async function translateBatch(batch) {
        const content = await chat([{ role: "system", content: system }, { role: "user", content: JSON.stringify({ items: batch.map((b) => b.text) }) }], { json: true, maxTokens: 4000 });
        let items = null;
        try {
          items = JSON.parse(content).items;
        } catch {
          items = null;
        }
        if (Array.isArray(items) && items.length === batch.length) {
          batch.forEach((b, i) => (b.translation = String(items[i] ?? b.text)));
          return;
        }
        // Antwort passt nicht: kleiner aufteilen
        if (batch.length === 1) {
          batch[0].translation = batch[0].text;
          return;
        }
        const mid = Math.ceil(batch.length / 2);
        await translateBatch(batch.slice(0, mid));
        await translateBatch(batch.slice(mid));
      }
      for (let i = 0; i < batches.length; i += 3) await Promise.all(batches.slice(i, i + 3).map(translateBatch));

      const trFile = path.join(req.jobDir, "translated.json");
      const out = path.join(req.jobDir, "translated.pdf");
      await fsp.writeFile(trFile, JSON.stringify({ blocks }));
      await run(PYTHON, [script, "apply", file.path, trFile, out]);
      await sendFile(res, out, outName(file.originalname, `_${target.toUpperCase()}`, ".pdf"));
    } catch (e) {
      next(e);
    }
  });

  // ------------------------------------------------------------------ Lebenslauf importieren
  // Bestehenden Lebenslauf (PDF oder Word) lesen und von der KI ins Formular übertragen lassen
  const cvLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: Number(process.env.AI_CV_RATE_LIMIT) || 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Du hast die KI in der letzten Stunde oft genutzt. Bitte warte etwas und versuche es dann erneut." },
  });
  const cvScript = path.join(__dirname, "..", "cv_pdf.py");
  const moreScript = path.join(__dirname, "..", "pdf_more.py");

  // Schritt 1: Datei annehmen, Word → PDF; ältere PDF-Libre-Lebensläufe enthalten ihre Daten selbst (ohne KI)
  async function cvFile(req, res, next) {
    try {
      const [file] = requireFiles(req);
      req.cvPdf = /\.pdf$/i.test(file.path) ? file.path : await sofficeConvert(file.path, req.jobDir, "pdf");
      try {
        const { stdout } = await run(PYTHON, [cvScript, "extract", req.cvPdf], { maxBuffer: 10 * 1024 * 1024 });
        return res.json({ data: JSON.parse(stdout), source: "pdflibre" });
      } catch {
        next(); // keine eingebetteten Daten – weiter mit der KI
      }
    } catch (e) {
      next(e);
    }
  }
  const cvReady = (req, res, next) => (enabled ? next() : next(new ApiError("Das Importieren mit KI ist auf diesem Server gerade nicht eingerichtet.", 503)));

  r.post("/cv-import", jobDir, uploader("cvdoc"), cvFile, cvReady, cvLimiter, async (req, res, next) => {
    try {
      const pdf = req.cvPdf;
      // 2) Text auslesen – bei gescannten Lebensläufen vorher Texterkennung
      const textFile = path.join(req.jobDir, "text.json");
      let { pages } = await pythonJson(["text", pdf, textFile], textFile);
      let text = pages.slice(0, 5).join("\n\n").replace(/[ \t]+/g, " ").trim();
      if (text.replace(/\s/g, "").length < 80) {
        const ocr = path.join(req.jobDir, "ocr.pdf");
        try {
          await run(PYTHON, [moreScript, "ocr", pdf, ocr, "deu+eng"]);
          ({ pages } = await pythonJson(["text", ocr, textFile], textFile));
          text = pages.slice(0, 5).join("\n\n").replace(/[ \t]+/g, " ").trim();
        } catch {
          /* OCR nicht möglich */
        }
      }
      if (text.replace(/\s/g, "").length < 80) throw new ApiError("In dieser Datei wurde kaum Text gefunden. Ist der Lebenslauf ein Foto oder Scan in schlechter Qualität?", 422);
      const content = await chat([{ role: "system", content: CV_IMPORT_PROMPT }, { role: "user", content: text.slice(0, 20000) }], { json: true, maxTokens: 4000 });
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        throw new ApiError("Der Lebenslauf konnte nicht gelesen werden. Bitte versuche es noch einmal.", 502);
      }
      res.json({ data: normalizeCv(parsed), source: "ai" });
    } catch (e) {
      next(e);
    }
  });

  // ------------------------------------------------------------------ Stellenanzeige als Datei → Text
  // Für „An Stellenanzeige anpassen“ und das Anschreiben: Anzeige als PDF, Word, Text oder Foto
  // statt Kopieren & Einfügen. Ohne KI: Text auslesen, bei Scans/Fotos per Texterkennung.
  r.post("/ad-text", jobDir, uploader("addoc"), async (req, res, next) => {
    try {
      const [file] = requireFiles(req);
      const tidy = (t) => t.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, 20000);
      if (/\.txt$/i.test(file.path)) return res.json({ text: tidy(await fsp.readFile(file.path, "utf8")) });
      let pdf = file.path;
      if (/\.(jpe?g|png)$/i.test(file.path)) {
        pdf = path.join(req.jobDir, "foto.pdf");
        await run(PYTHON, [moreScript, "images", pdf, file.path]);
      } else if (!/\.pdf$/i.test(file.path)) {
        pdf = await sofficeConvert(file.path, req.jobDir, "pdf");
      }
      const textFile = path.join(req.jobDir, "text.json");
      let { pages } = await pythonJson(["text", pdf, textFile], textFile);
      let text = tidy(pages.slice(0, 6).join("\n\n"));
      if (text.replace(/\s/g, "").length < 80) {
        try {
          const ocr = path.join(req.jobDir, "ocr.pdf");
          await run(PYTHON, [moreScript, "ocr", pdf, ocr, "deu+eng+fra"]);
          ({ pages } = await pythonJson(["text", ocr, textFile], textFile));
          text = tidy(pages.slice(0, 6).join("\n\n"));
        } catch {
          /* Texterkennung nicht möglich */
        }
      }
      if (text.replace(/\s/g, "").length < 40) throw new ApiError("In dieser Datei wurde kein Text der Stellenanzeige gefunden. Kopiere den Text bitte direkt hinein.", 422);
      res.json({ text });
    } catch (e) {
      next(e);
    }
  });

  // ------------------------------------------------------------------ Rechnung (PDF/Foto) → Daten für „E-Rechnung erstellen“
  // Text auslesen (gescannt/Foto → Texterkennung), KI liest die Rechnungsdaten als JSON.
  // Danach prüfen wir selbst: Summen nachrechnen, Rechnungsnummer/IBAN/Beträge im Originaltext suchen.
  // Ergebnis geht zur Bestätigung an den Nutzer – erzeugt wird die E-Rechnung erst nach seinem OK.
  r.post("/invoice-import", jobDir, uploader("invoicedoc"), cvReady, cvLimiter, async (req, res, next) => {
    try {
      const [file] = requireFiles(req);
      let pdf = file.path;
      if (!/\.pdf$/i.test(file.path)) {
        pdf = path.join(req.jobDir, "photo.pdf");
        await run(PYTHON, [moreScript, "images", pdf, file.path]);
      }
      const textFile = path.join(req.jobDir, "text.json");
      let { pages } = await pythonJson(["text", pdf, textFile], textFile);
      let text = pages.slice(0, 6).join("\n\n").replace(/[ \t]+/g, " ").trim();
      let ocr = false;
      if (text.replace(/\s/g, "").length < 80) {
        const out = path.join(req.jobDir, "ocr.pdf");
        try {
          await run(PYTHON, [moreScript, "ocr", pdf, out, "deu+eng"], { timeout: 4 * 60 * 1000 });
          ({ pages } = await pythonJson(["text", out, textFile], textFile));
          text = pages.slice(0, 6).join("\n\n").replace(/[ \t]+/g, " ").trim();
          ocr = true;
        } catch {
          /* Texterkennung nicht möglich */
        }
      }
      if (text.replace(/\s/g, "").length < 60) throw new ApiError("In dieser Datei wurde kaum Text gefunden. Ist die Rechnung ein unscharfes Foto? Versuche einen Scan oder eine bessere Aufnahme.", 422);
      const content = await chat([{ role: "system", content: INVOICE_IMPORT_PROMPT }, { role: "user", content: text.slice(0, 24000) }], { json: true, maxTokens: 3000, strong: true });
      let raw;
      try {
        raw = JSON.parse(content);
      } catch {
        throw new ApiError("Die Rechnung konnte nicht gelesen werden. Bitte versuche es noch einmal.", 502);
      }
      res.json({ ...checkInvoice(raw, text), ocr });
    } catch (e) {
      next(e);
    }
  });

  // ------------------------------------------------------------------ Lebenslauf korrigieren
  r.post("/cv-proofread", ready, cvLimiter, express.json({ limit: "300kb" }), async (req, res, next) => {
    try {
      const items = (Array.isArray(req.body.items) ? req.body.items : [])
        .filter((i) => i && typeof i.id === "string" && typeof i.text === "string" && i.text.trim())
        .slice(0, 120)
        .map((i) => ({ id: i.id.slice(0, 40), text: i.text.slice(0, 3000) }));
      if (!items.length) throw new ApiError("Es gibt noch keinen Text zum Prüfen.");
      if (items.reduce((n, i) => n + i.text.length, 0) > 30000) throw new ApiError("Der Lebenslauf ist zu lang für eine Prüfung auf einmal.", 413);
      const content = await chat([{ role: "system", content: CV_PROOFREAD_PROMPT }, { role: "user", content: JSON.stringify({ items }) }], { json: true, maxTokens: 6000 });
      let out = [];
      try {
        out = JSON.parse(content).items || [];
      } catch {
        throw new ApiError("Die Prüfung ist fehlgeschlagen. Bitte versuche es noch einmal.", 502);
      }
      const byId = new Map(items.map((i) => [i.id, i.text]));
      const changes = out
        .filter((o) => o && byId.has(o.id) && typeof o.text === "string" && o.text.trim() && o.text.trim() !== byId.get(o.id).trim())
        .map((o) => ({ id: o.id, before: byId.get(o.id), after: o.text.trim() }));
      res.json({ changes });
    } catch (e) {
      next(e);
    }
  });

  // ------------------------------------------------------------------ Lebenslauf: Pro-Funktionen
  // Mit PAYMENTS_ENABLED=true nur mit Konto + Pro/Tagespass; sonst kostenlos (mit Stundenlimit)
  const pro = payments.enabled ? [requireDb, requireAccess] : [];
  const cvJson = express.json({ limit: "400kb" });

  const cleanItems = (raw) =>
    (Array.isArray(raw) ? raw : [])
      .filter((i) => i && typeof i.id === "string" && typeof i.text === "string" && i.text.trim())
      .slice(0, 120)
      .map((i) => ({ id: i.id.slice(0, 40), text: i.text.slice(0, 3000) }));
  const checkSize = (items, extra = "") => {
    if (!items.length) throw new ApiError("Es gibt noch keinen Text im Lebenslauf.");
    if (items.reduce((n, i) => n + i.text.length, 0) + extra.length > 40000) throw new ApiError("Der Text ist zu lang für eine Anfrage.", 413);
  };
  const parseJson = (content) => {
    try {
      return JSON.parse(content);
    } catch {
      throw new ApiError("Die KI-Antwort war unvollständig. Bitte versuche es noch einmal.", 502);
    }
  };
  // Schutz gegen erfundene Zahlen: Vorschläge mit Zahlen, die nirgends im Lebenslauf stehen, werden verworfen
  const numbersOf = (t) => (String(t).match(/\d+(?:[.,]\d+)?/g) || []).map((n) => n.replace(",", "."));
  function changesFrom(items, out, allText) {
    const known = new Set(numbersOf(allText));
    const byId = new Map(items.map((i) => [i.id, i.text]));
    return (Array.isArray(out) ? out : [])
      .filter((o) => o && byId.has(o.id) && typeof o.text === "string" && o.text.trim() && o.text.trim() !== byId.get(o.id).trim())
      .filter((o) => numbersOf(o.text).every((n) => known.has(n)))
      .map((o) => ({ id: o.id, before: byId.get(o.id), after: o.text.trim().slice(0, 3000) }));
  }
  const allTextOf = (items, cvText) => items.map((i) => i.text).join("\n") + "\n" + String(cvText || "").slice(0, 40000);

  // Formulierungen verbessern
  r.post("/cv-improve", ready, ...pro, cvLimiter, cvJson, async (req, res, next) => {
    try {
      const items = cleanItems(req.body.items);
      checkSize(items);
      const out = parseJson(await chat([{ role: "system", content: CV_IMPROVE_PROMPT }, { role: "user", content: JSON.stringify({ items }) }], { json: true, maxTokens: 6000, strong: true }));
      res.json({ changes: changesFrom(items, out.items, allTextOf(items, req.body.cvText)) });
    } catch (e) {
      next(e);
    }
  });

  // An Stellenanzeige anpassen: Anforderungen + Vorschläge (die Trefferquote rechnet der Browser selbst)
  r.post("/cv-match", ready, ...pro, cvLimiter, cvJson, async (req, res, next) => {
    try {
      const ad = String(req.body.ad || "").trim().slice(0, 15000);
      if (ad.length < 150) throw new ApiError("Bitte füge den vollständigen Text der Stellenanzeige ein (Aufgaben und Anforderungen).");
      const items = cleanItems(req.body.items);
      checkSize(items, ad);
      const cvText = String(req.body.cvText || "").slice(0, 40000);
      const kw = parseJson(await chat([{ role: "system", content: CV_KEYWORDS_PROMPT }, { role: "user", content: ad }], { json: true, maxTokens: 1500 }));
      const keywords = (Array.isArray(kw.keywords) ? kw.keywords : [])
        .filter((k) => k && typeof k.term === "string" && k.term.trim())
        .slice(0, 25)
        .map((k) => ({ term: str(k.term, 80), aliases: (Array.isArray(k.aliases) ? k.aliases : []).map((a) => str(a, 80)).filter(Boolean).slice(0, 5), must: k.must === true }));
      const low = cvText.toLowerCase();
      const status = keywords.map((k) => ({ term: k.term, must: k.must, found: [k.term, ...k.aliases].some((t) => low.includes(t.toLowerCase())) }));
      const out = parseJson(
        await chat(
          [
            { role: "system", content: CV_TAILOR_PROMPT + `\nSchreibe die tips auf ${{ en: "Englisch", fr: "Französisch" }[req.lang] || "Deutsch"}.` },
            { role: "user", content: JSON.stringify({ stellenanzeige: ad, anforderungen: status, items }) },
          ],
          { json: true, maxTokens: 6000, strong: true }
        )
      );
      res.json({
        role: str(kw.role, 150),
        company: str(kw.company, 150),
        keywords,
        changes: changesFrom(items, out.items, allTextOf(items, cvText)),
        tips: (Array.isArray(out.tips) ? out.tips : []).map((t) => str(t, 300)).filter(Boolean).slice(0, 4),
      });
    } catch (e) {
      next(e);
    }
  });

  // Anschreiben schreiben
  r.post("/cv-letter", ready, ...pro, cvLimiter, cvJson, async (req, res, next) => {
    try {
      const ad = String(req.body.ad || "").trim().slice(0, 15000);
      if (ad.length < 150) throw new ApiError("Bitte füge den vollständigen Text der Stellenanzeige ein.");
      const cvText = String(req.body.cvText || "").trim().slice(0, 30000);
      if (cvText.length < 100) throw new ApiError("Fülle zuerst deinen Lebenslauf aus – das Anschreiben wird daraus erstellt.");
      const notes = String(req.body.notes || "").slice(0, 2000);
      const contact = String(req.body.contact || "").slice(0, 120);
      const out = parseJson(
        await chat(
          [
            { role: "system", content: CV_LETTER_PROMPT },
            { role: "user", content: JSON.stringify({ stellenanzeige: ad, lebenslauf: cvText, ansprechpartner: contact, notizen_des_bewerbers: notes }) },
          ],
          { json: true, maxTokens: 2500, strong: true }
        )
      );
      res.json({
        subject: str(out.subject, 200),
        salutation: str(out.salutation, 150),
        paragraphs: (Array.isArray(out.paragraphs) ? out.paragraphs : []).map((p) => str(p, 2500)).filter(Boolean).slice(0, 6),
        closing: str(out.closing, 80) || "Mit freundlichen Grüßen",
      });
    } catch (e) {
      next(e);
    }
  });

  // Kurzprofil aus dem Lebenslauf vorschlagen (kostenlos wie die Rechtschreibprüfung, mit Stundenlimit)
  r.post("/cv-summary", ready, cvLimiter, cvJson, async (req, res, next) => {
    try {
      const cvText = String(req.body.cvText || "").trim().slice(0, 30000);
      if (cvText.length < 80) throw new ApiError("Trage zuerst ein paar Stationen ein – das Profil wird daraus geschrieben.");
      const lang = { de: "Deutsch", en: "Englisch", fr: "Französisch" }[req.body.lang] || "Deutsch";
      const out = parseJson(
        await chat(
          [
            { role: "system", content: `Schreibe für diesen Lebenslauf ein Kurzprofil auf ${lang}: 2 bis 4 Sätze, 250 bis 450 Zeichen, ohne Ich-Floskeln wie „Ich bin ein motivierter …“. Inhalt: aktuelle Rolle oder Studium, wichtigste Erfahrungen und Kenntnisse, was gesucht wird (nur falls aus dem Lebenslauf erkennbar). ${NO_INVENT} Antworte nur mit JSON: {"text":"…"}` },
            { role: "user", content: cvText },
          ],
          { json: true, maxTokens: 600 }
        )
      );
      const text = str(out.text, 900);
      const known = new Set(numbersOf(cvText));
      if (!text || !numbersOf(text).every((n) => known.has(n))) throw new ApiError("Der Vorschlag war nicht verwendbar. Bitte versuche es noch einmal.", 502);
      res.json({ text });
    } catch (e) {
      next(e);
    }
  });

  // Lebenslauf übersetzen (Deutsch ↔ Englisch)
  r.post("/cv-translate", ready, ...pro, cvLimiter, cvJson, async (req, res, next) => {
    try {
      const items = cleanItems(req.body.items);
      checkSize(items);
      const lang = { de: "Deutsche", en: "Englische", fr: "Französische" }[req.body.lang] || "Englische";
      const out = parseJson(await chat([{ role: "system", content: CV_TRANSLATE_PROMPT(lang) }, { role: "user", content: JSON.stringify({ items }) }], { json: true, maxTokens: 8000 }));
      const ids = new Set(items.map((i) => i.id));
      res.json({ items: (Array.isArray(out.items) ? out.items : []).filter((o) => o && ids.has(o.id) && typeof o.text === "string").map((o) => ({ id: o.id, text: o.text.slice(0, 3000) })) });
    } catch (e) {
      next(e);
    }
  });

  return r;
};

module.exports.enabled = enabled;
module.exports.LANGUAGES = LANGUAGES;

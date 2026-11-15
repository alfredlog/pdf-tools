/**
 * KI-Werkzeuge: PDF zusammenfassen und PDF übersetzen.
 *
 * Funktioniert mit jeder OpenAI-kompatiblen API (OpenAI, Mistral, OpenRouter, Groq, …).
 * Einstellungen in der .env:
 *   AI_API_KEY=…                         (Pflicht – ohne Schlüssel sind die KI-Werkzeuge aus)
 *   AI_BASE_URL=https://api.openai.com/v1 (optional)
 *   AI_MODEL=gpt-4o-mini                  (optional)
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

async function chat(messages, { json = false, maxTokens = 1800 } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, messages, temperature: 0.2, max_tokens: maxTokens, ...(json ? { response_format: { type: "json_object" } } : {}) }),
      signal: AbortSignal.timeout(180_000),
    });
  } catch {
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

module.exports = function aiRouter({ run, jobDir, PYTHON, outName, uploader, requireFiles, sendFile }) {
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

  return r;
};

module.exports.enabled = enabled;
module.exports.LANGUAGES = LANGUAGES;

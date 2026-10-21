/**
 * Agenten-API: KI-Agenten bezahlen pro Aufruf in Satoshis (BSV), ohne Konto.
 *
 * Protokoll: HTTP 402 nach BRC-166 (x402 auf BSV, P2PKH-Profil)
 *   1. Agent ruft z. B. POST /agent/v1/compress ohne Zahlung auf
 *   2. Server antwortet 402 + Rechnung im Header PAYMENT-REQUIRED (eigene Adresse pro Rechnung)
 *   3. Agent sendet dieselbe Anfrage erneut, mit signierter Transaktion im Header PAYMENT-SIGNATURE
 *   4. Server prüft den Betrag, verarbeitet die PDF, sendet die Transaktion ins BSV-Netz
 *      und antwortet mit Ergebnis + Quittung im Header PAYMENT-RESPONSE
 *
 * Schlägt die Verarbeitung fehl (z. B. kaputte PDF), wird die Transaktion NICHT gesendet:
 * der Agent zahlt nichts.
 *
 * Einschalten in der .env (Standard: aus, die Website bleibt unverändert):
 *   AGENT_API_ENABLED=true
 *   AGENT_PAY_SECRET=<lange Zufallszeichenkette>   → daraus werden die Zahlungsadressen abgeleitet
 *   AGENT_BSV_NETWORK=test                         → test (Testnet, Standard) oder main
 *   AGENT_SKIP_BROADCAST=1                         → nur für Tests ohne Netz: Transaktion nicht senden
 */
const express = require("express");
const path = require("path");
const fsp = require("fs/promises");
const crypto = require("crypto");
const { PDFDocument } = require("pdf-lib");

const truthy = (v) => ["true", "1", "on", "ja", "yes"].includes(String(v || "").trim().toLowerCase());
const enabled = truthy(process.env.AGENT_API_ENABLED);

// Preise in Satoshis pro Aufruf
const PRICES = { compress: 20, merge: 30 };

module.exports = { enabled, router };

function router({ gsCompress, gsMerge, jobDir, outName, MAX_FILE_MB }) {
  // Erst hier laden: ist @bsv/sdk nicht installiert, läuft der Rest der Website trotzdem
  const { PrivateKey, Hash, Utils, P2PKH, Transaction, WhatsOnChainBroadcaster } = require("@bsv/sdk");

  const SECRET = process.env.AGENT_PAY_SECRET;
  if (!SECRET || SECRET.length < 16) throw new Error("AGENT_PAY_SECRET fehlt oder ist zu kurz (mind. 16 Zeichen)");
  const NET = process.env.AGENT_BSV_NETWORK === "main" ? "main" : "test";
  const NETWORK_ID = NET === "main" ? "bsv:mainnet" : "bsv:testnet";
  const SKIP_BROADCAST = truthy(process.env.AGENT_SKIP_BROADCAST);

  const enc = (obj) => Buffer.from(JSON.stringify(obj), "utf8").toString("base64");
  const dec = (b64) => JSON.parse(Buffer.from(b64, "base64").toString("utf8"));

  // Rechnungen im Speicher (nach Neustart weg – für die Demo ausreichend)
  const invoices = new Map(); // lockingScriptHex → Rechnung
  const locks = new Map(); // Rechnungs-ID → Promise (eine Zahlung pro Rechnung gleichzeitig)

  function createInvoice(resource, amount) {
    const id = crypto.randomBytes(12).toString("hex");
    const key = new PrivateKey(Hash.sha256(Utils.toArray(`${SECRET}:${id}`, "utf8")));
    const payTo = key.toAddress(NET === "main" ? "mainnet" : "testnet");
    const lockingScriptHex = new P2PKH().lock(payTo).toHex().toLowerCase();
    const inv = { id, resource, amount, payTo, lockingScriptHex, expiresAt: new Date(Date.now() + 15 * 60_000) };
    invoices.set(lockingScriptHex, inv);
    // Alte, unbezahlte Rechnungen aufräumen
    for (const [k, v] of invoices) if (!v.settledTxid && v.expiresAt < new Date(Date.now() - 60 * 60_000)) invoices.delete(k);
    return inv;
  }

  const requirements = (inv) => ({
    scheme: "exact",
    network: NETWORK_ID,
    amount: String(inv.amount),
    asset: "BSV",
    payTo: inv.payTo,
    maxTimeoutSeconds: 900,
    extra: {
      chain: "bsv",
      unit: "satoshi",
      invoiceId: inv.id,
      lockingScriptHex: inv.lockingScriptHex,
      expiresAt: inv.expiresAt.toISOString(),
      payloadFormat: { kind: "p2pkh-rawtx" },
    },
  });

  function fail(res, status, reason, extra = {}) {
    res.status(status).set("PAYMENT-RESPONSE", enc({ success: false, network: NETWORK_ID, errorReason: reason }));
    res.json({ error: reason, ...extra });
  }

  /**
   * Middleware: Zahlung verlangen und prüfen. Die Transaktion wird erst gesendet,
   * wenn der Handler über req.settle() meldet, dass das Ergebnis fertig ist.
   */
  function requirePayment(tool, description) {
    const amount = PRICES[tool];
    return async (req, res, next) => {
      const resource = `${req.method} ${req.baseUrl}${req.path}`;
      const header = req.get("PAYMENT-SIGNATURE");

      // 1. Keine Zahlung → 402 mit neuer Rechnung
      if (!header) {
        const inv = createInvoice(resource, amount);
        const body = { x402Version: 2, resource: { url: req.originalUrl, method: req.method, description }, accepts: [requirements(inv)] };
        return res.status(402).set("PAYMENT-REQUIRED", enc(body)).json(body);
      }

      // 2. Zahlung lesen und prüfen
      let p;
      try {
        p = dec(header);
      } catch {
        return fail(res, 400, "malformed_payment");
      }
      const script = String(p?.payload?.lockingScriptHex || p?.accepted?.extra?.lockingScriptHex || "").toLowerCase();
      if (p?.accepted?.scheme !== "exact" || !script || !p?.payload?.rawtx) return fail(res, 400, "malformed_payment");

      const inv = invoices.get(script);
      if (!inv) return fail(res, 402, "invoice_not_found");
      if (inv.resource !== resource) return fail(res, 402, "resource_mismatch");

      // Gleichzeitige Versuche für dieselbe Rechnung nacheinander abarbeiten
      const previous = locks.get(inv.id) || Promise.resolve();
      let release;
      locks.set(inv.id, new Promise((r) => (release = r)));
      await previous;
      res.on("finish", release);
      res.on("close", release);

      const receipt = (txid) =>
        res.set("PAYMENT-RESPONSE", enc({ success: true, transaction: txid, network: NETWORK_ID, extensions: { status: "mempool" } }));

      // Schon bezahlt: Ergebnis erneut liefern, ohne nochmal zu kassieren
      if (inv.settledTxid) {
        req.settle = async () => receipt(inv.settledTxid);
        return next();
      }
      if (inv.expiresAt < new Date()) return fail(res, 402, "invoice_expired");

      let tx;
      try {
        tx = Transaction.fromHex(p.payload.rawtx);
      } catch {
        return fail(res, 400, "malformed_payment");
      }
      const paid = tx.outputs
        .filter((o) => o.lockingScript.toHex().toLowerCase() === script)
        .reduce((s, o) => s + (o.satoshis || 0), 0);
      if (paid < inv.amount) return fail(res, 402, "insufficient_funds", { required: inv.amount, paid });

      // 3. Wird erst aufgerufen, wenn die PDF fertig ist: jetzt Transaktion senden
      req.settle = async () => {
        const txid = tx.id("hex");
        if (!SKIP_BROADCAST) {
          const r = await tx.broadcast(new WhatsOnChainBroadcaster(NET));
          const known = r.status !== "success" && /already|known|txn-already/i.test(JSON.stringify(r));
          if (r.status !== "success" && !known) {
            const err = new Error("broadcast_rejected");
            err.paymentFailure = true;
            throw err;
          }
        }
        inv.settledTxid = txid;
        console.log(`[agent-api] ${inv.amount} sats für ${resource} – tx ${txid}`);
        receipt(txid);
      };
      next();
    };
  }

  // Base64-PDF aus dem JSON lesen und prüfen
  async function readPdf(b64, dir, name) {
    if (typeof b64 !== "string" || !b64) throw httpError(400, "Expected a PDF as base64 string");
    const buf = Buffer.from(b64, "base64");
    if (buf.length > MAX_FILE_MB * 1024 * 1024) throw httpError(413, `File larger than ${MAX_FILE_MB} MB`);
    if (buf.subarray(0, 5).toString("latin1") !== "%PDF-") throw httpError(400, "Not a PDF file");
    // Wirklich lesbar? Sonst würde der Agent für eine kaputte Datei bezahlen
    let pages = 0;
    try {
      pages = (await PDFDocument.load(buf, { ignoreEncryption: true, updateMetadata: false })).getPageCount();
    } catch {
      /* unlesbar */
    }
    if (!pages) throw httpError(422, "The PDF is damaged or has no pages");
    const file = path.join(dir, name);
    await fsp.writeFile(file, buf);
    return { file, size: buf.length };
  }

  function httpError(status, message) {
    const e = new Error(message);
    e.status = status;
    return e;
  }

  // Ergebnis fertig → bezahlen lassen → antworten
  async function deliver(req, res, outFile, filename, extra) {
    const data = await fsp.readFile(outFile);
    try {
      await req.settle();
    } catch (e) {
      if (e.paymentFailure) return fail(res, 402, "broadcast_rejected", { retryable: false });
      throw e;
    }
    res.json({ filename, size: data.length, ...extra, pdf: data.toString("base64") });
  }

  const handle = (fn) => (req, res) =>
    Promise.resolve(fn(req, res)).catch((e) => {
      if (res.headersSent) return;
      const status = e.status || 500;
      if (status >= 500) console.error("[agent-api]", e.stderr || e);
      res.status(status).json({ error: status >= 500 ? "Processing failed, you were not charged" : e.message });
    });

  const r = express.Router();
  const json = express.json({ limit: `${Math.ceil(MAX_FILE_MB * 1.4) * 4}mb` });

  // Für Agenten: was gibt es, was kostet es?
  r.get("/", (req, res) =>
    res.json({
      service: "PDF Libre agent API",
      payment: { protocol: "x402 / BRC-166 (HTTP 402, P2PKH raw transaction)", network: NETWORK_ID, unit: "satoshi" },
      tools: [
        { method: "POST", path: "/agent/v1/compress", price: PRICES.compress, body: { pdf: "<base64>", level: "low | recommended | strong", filename: "optional" } },
        { method: "POST", path: "/agent/v1/merge", price: PRICES.merge, body: { pdfs: ["<base64>", "<base64>"], filename: "optional" } },
      ],
    })
  );

  r.post(
    "/compress",
    requirePayment("compress", "Compress a PDF"),
    jobDir,
    json,
    handle(async (req, res) => {
      const { file, size } = await readPdf(req.body?.pdf, req.jobDir, "in.pdf");
      const out = path.join(req.jobDir, "out.pdf");
      await gsCompress(file, out, req.body?.level);
      let result = out;
      let after = (await fsp.stat(out)).size;
      if (after >= size) {
        result = file; // nicht kleiner geworden → Original zurück
        after = size;
      }
      await deliver(req, res, result, outName(req.body?.filename || "document.pdf", "_komprimiert", ".pdf"), {
        originalSize: size,
        resultSize: after,
      });
    })
  );

  r.post(
    "/merge",
    requirePayment("merge", "Merge PDFs"),
    jobDir,
    json,
    handle(async (req, res) => {
      const list = req.body?.pdfs;
      if (!Array.isArray(list) || list.length < 2) throw httpError(400, "Expected at least two PDFs in 'pdfs'");
      if (list.length > 20) throw httpError(413, "At most 20 PDFs");
      const files = [];
      for (const [i, b64] of list.entries()) files.push((await readPdf(b64, req.jobDir, `in-${i}.pdf`)).file);
      const out = path.join(req.jobDir, "merged.pdf");
      await gsMerge(files, out);
      await deliver(req, res, out, outName(req.body?.filename || "document.pdf", "_zusammengefuegt", ".pdf"), {
        inputs: files.length,
      });
    })
  );

  return r;
}

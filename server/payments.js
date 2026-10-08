/**
 * Schalter für die Bezahlung (in der .env):
 *
 *   PAYMENTS_ENABLED=true   → PDF-Editor nur mit Konto/Pro/Tagespass (wie bisher)
 *   PAYMENTS_ENABLED=false  → alles kostenlos, kein Konto nötig (Standard, wenn nicht gesetzt)
 *
 * Nach einer Änderung den Server neu starten.
 */
const enabled = ["true", "1", "on", "ja", "yes"].includes(String(process.env.PAYMENTS_ENABLED || "").trim().toLowerCase());

module.exports = { enabled };

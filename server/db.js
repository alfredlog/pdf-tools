/**
 * PostgreSQL-Verbindung und Tabellen.
 * Die Tabellen werden beim Start automatisch angelegt (CREATE TABLE IF NOT EXISTS).
 */
const { Pool } = require("pg");

const enabled = Boolean(process.env.DATABASE_URL);

const pool = enabled
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
      max: 10,
    })
  : null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id                    BIGSERIAL PRIMARY KEY,
  email                 TEXT NOT NULL UNIQUE,
  password_hash         TEXT NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  trial_ends_at         TIMESTAMPTZ NOT NULL,
  pass_until            TIMESTAMPTZ,
  stripe_customer_id    TEXT UNIQUE,
  subscription_id       TEXT,
  subscription_status   TEXT,
  subscription_period_end TIMESTAMPTZ,
  cancel_at_period_end  BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash  TEXT PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);

CREATE TABLE IF NOT EXISTS password_resets (
  token_hash  TEXT PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL
);

-- Verarbeitete Stripe-Ereignisse (damit ein Webhook nie doppelt zählt)
CREATE TABLE IF NOT EXISTS stripe_events (
  id          TEXT PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tagespässe, die schon gutgeschrieben wurden
CREATE TABLE IF NOT EXISTS day_passes (
  checkout_session_id TEXT PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

async function init() {
  if (!enabled) {
    console.warn("⚠  DATABASE_URL fehlt – Konten und der PDF-Editor-Export sind deaktiviert. Die kostenlosen Werkzeuge laufen normal.");
    return false;
  }
  await pool.query(SCHEMA);
  // Abgelaufene Sitzungen und Reset-Links regelmäßig löschen
  setInterval(() => {
    pool.query("DELETE FROM sessions WHERE expires_at < now()").catch(() => {});
    pool.query("DELETE FROM password_resets WHERE expires_at < now()").catch(() => {});
  }, 60 * 60 * 1000).unref();
  return true;
}

const query = (text, params) => pool.query(text, params);

module.exports = { enabled, init, query, pool };

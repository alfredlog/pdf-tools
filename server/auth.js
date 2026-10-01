/**
 * Konten: Registrierung, Anmeldung, Sitzungen, Passwort zurücksetzen.
 * Sitzungen liegen in der Datenbank; im Browser steht nur ein zufälliges Token (httpOnly-Cookie).
 */
const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { rateLimit } = require("express-rate-limit");
const db = require("./db");
const mail = require("./mail");

const COOKIE = "pl_session";
const SESSION_DAYS = 30;
const TRIAL_DAYS = Number(process.env.TRIAL_DAYS) || 14;
const secureCookie = process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "true" : process.env.NODE_ENV === "production";

// Hash für nicht existierende Nutzer: Anmeldung dauert gleich lang, egal ob es das Konto gibt
const DUMMY_HASH = bcrypt.hashSync("kein-konto", 11);

const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

class ApiError extends Error {
  constructor(message, status = 400, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function readCookie(req, name) {
  const header = req.headers.cookie || "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

function setSessionCookie(res, token, maxAgeSec) {
  const parts = [`${COOKIE}=${token}`, "Path=/", "HttpOnly", "SameSite=Lax", `Max-Age=${maxAgeSec}`];
  if (secureCookie) parts.push("Secure");
  res.append("Set-Cookie", parts.join("; "));
  // Lesbarer Hinweis für die Kopfzeile („Mein Konto“ statt „Anmelden“) – enthält keine Geheimnisse
  const hint = [`pl_in=${maxAgeSec ? 1 : ""}`, "Path=/", "SameSite=Lax", `Max-Age=${maxAgeSec}`];
  if (secureCookie) hint.push("Secure");
  res.append("Set-Cookie", hint.join("; "));
}

async function createSession(res, userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  await db.query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now() + $3::interval)", [
    sha256(token),
    userId,
    `${SESSION_DAYS} days`,
  ]);
  setSessionCookie(res, token, SESSION_DAYS * 86400);
}

/** Hängt req.user an, wenn eine gültige Sitzung besteht. */
async function loadUser(req, res, next) {
  req.user = null;
  if (!db.enabled) return next();
  const token = readCookie(req, COOKIE);
  if (!token) return next();
  try {
    const { rows } = await db.query(
      `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = $1 AND s.expires_at > now()`,
      [sha256(token)]
    );
    req.user = rows[0] || null;
  } catch (e) {
    console.error("Sitzung konnte nicht geladen werden:", e.message);
  }
  next();
}

/** Welchen Zugang hat der Nutzer gerade? */
function accessOf(user) {
  if (!user) return { active: false, plan: null };
  const now = Date.now();
  if (["active", "trialing"].includes(user.subscription_status)) {
    return { active: true, plan: "pro", until: user.subscription_period_end, cancelAtPeriodEnd: user.cancel_at_period_end };
  }
  if (user.pass_until && new Date(user.pass_until).getTime() > now) {
    return { active: true, plan: "daypass", until: user.pass_until };
  }
  if (new Date(user.trial_ends_at).getTime() > now) {
    return { active: true, plan: "trial", until: user.trial_ends_at };
  }
  return { active: false, plan: null, trialEnded: user.trial_ends_at };
}

function publicUser(user) {
  if (!user) return null;
  return { email: user.email, createdAt: user.created_at, access: accessOf(user), hasSubscription: Boolean(user.subscription_id) };
}

function requireDb(req, res, next) {
  if (!db.enabled) return next(new ApiError("Konten sind auf diesem Server nicht eingerichtet (DATABASE_URL fehlt).", 503));
  next();
}

function requireUser(req, res, next) {
  if (!req.user) return next(new ApiError("Bitte melde dich an.", 401, "login"));
  next();
}

function requireAccess(req, res, next) {
  if (!req.user) return next(new ApiError("Bitte melde dich an, um die Datei herunterzuladen.", 401, "login"));
  if (!accessOf(req.user).active) return next(new ApiError("Deine Testphase ist abgelaufen. Wähle einen Tarif, um weiterzumachen.", 402, "payment"));
  next();
}

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function validEmail(e) {
  return typeof e === "string" && e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}

function router() {
  const r = express.Router();
  r.use(express.json({ limit: "20kb" }));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Zu viele Versuche. Bitte warte 15 Minuten." },
  });

  r.get("/me", (req, res) => res.json({ enabled: db.enabled, user: publicUser(req.user) }));

  r.post(
    "/register",
    requireDb,
    authLimiter,
    wrap(async (req, res) => {
      const email = String(req.body.email || "").trim().toLowerCase();
      const password = String(req.body.password || "");
      if (!validEmail(email)) throw new ApiError("Bitte gib eine gültige E-Mail-Adresse ein.");
      if (password.length < 8) throw new ApiError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      if (password.length > 200) throw new ApiError("Das Passwort ist zu lang.");
      if (!req.body.acceptTerms) throw new ApiError("Bitte akzeptiere die AGB und die Datenschutzerklärung.");
      const hash = await bcrypt.hash(password, 11);
      let user;
      try {
        const { rows } = await db.query(
          "INSERT INTO users (email, password_hash, trial_ends_at) VALUES ($1, $2, now() + $3::interval) RETURNING *",
          [email, hash, `${TRIAL_DAYS} days`]
        );
        user = rows[0];
      } catch (e) {
        if (e.code === "23505") throw new ApiError("Für diese E-Mail-Adresse gibt es schon ein Konto. Melde dich an.", 409);
        throw e;
      }
      await createSession(res, user.id);
      res.status(201).json({ user: publicUser(user) });
    })
  );

  r.post(
    "/login",
    requireDb,
    authLimiter,
    wrap(async (req, res) => {
      const email = String(req.body.email || "").trim().toLowerCase();
      const password = String(req.body.password || "");
      const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
      const user = rows[0];
      // Vergleich auch ohne Nutzer ausführen, damit die Antwortzeit nichts verrät
      const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
      if (!user || !ok) throw new ApiError("E-Mail-Adresse oder Passwort ist falsch.", 401);
      await createSession(res, user.id);
      res.json({ user: publicUser(user) });
    })
  );

  r.post(
    "/logout",
    wrap(async (req, res) => {
      const token = readCookie(req, COOKIE);
      if (token && db.enabled) await db.query("DELETE FROM sessions WHERE token_hash = $1", [sha256(token)]);
      setSessionCookie(res, "", 0);
      res.json({ ok: true });
    })
  );

  r.post(
    "/forgot",
    requireDb,
    authLimiter,
    wrap(async (req, res) => {
      const email = String(req.body.email || "").trim().toLowerCase();
      const { rows } = await db.query("SELECT id, email FROM users WHERE email = $1", [email]);
      if (rows[0]) {
        const token = crypto.randomBytes(32).toString("base64url");
        await db.query("INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES ($1, $2, now() + interval '1 hour')", [
          sha256(token),
          rows[0].id,
        ]);
        const link = `${appUrl(req)}/passwort-vergessen.html?token=${token}`;
        await mail.send({
          to: rows[0].email,
          subject: "PDF Libre: Passwort zurücksetzen",
          text: `Hallo,\n\nüber diesen Link kannst du ein neues Passwort festlegen (gültig für 1 Stunde):\n\n${link}\n\nWenn du das nicht angefordert hast, ignoriere diese E-Mail einfach.\n\nPDF Libre`,
        });
      }
      // Immer dieselbe Antwort: verrät nicht, ob es das Konto gibt
      res.json({ ok: true });
    })
  );

  r.post(
    "/reset",
    requireDb,
    authLimiter,
    wrap(async (req, res) => {
      const token = String(req.body.token || "");
      const password = String(req.body.password || "");
      if (password.length < 8) throw new ApiError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      const { rows } = await db.query("DELETE FROM password_resets WHERE token_hash = $1 AND expires_at > now() RETURNING user_id", [sha256(token)]);
      if (!rows[0]) throw new ApiError("Der Link ist ungültig oder abgelaufen. Fordere einen neuen an.");
      const userId = rows[0].user_id;
      await db.query("UPDATE users SET password_hash = $1 WHERE id = $2", [await bcrypt.hash(password, 11), userId]);
      await db.query("DELETE FROM sessions WHERE user_id = $1", [userId]); // alle Geräte abmelden
      await createSession(res, userId);
      res.json({ ok: true });
    })
  );

  return r;
}

function appUrl(req) {
  return (process.env.APP_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
}

module.exports = { router, loadUser, requireUser, requireAccess, requireDb, accessOf, publicUser, ApiError, appUrl };

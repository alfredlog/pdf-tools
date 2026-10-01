/**
 * Abrechnung mit Stripe: Pro-Abo und Tagespass.
 *
 * Benötigte Umgebungsvariablen (siehe .env.example):
 *   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_PRO, STRIPE_PRICE_DAYPASS
 */
const express = require("express");
const Stripe = require("stripe");
const db = require("./db");
const { requireUser, requireDb, publicUser, ApiError, appUrl } = require("./auth");

const PASS_HOURS = Number(process.env.DAYPASS_HOURS) || 24;

const enabled = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_PRO && process.env.STRIPE_PRICE_DAYPASS);

// STRIPE_API_HOST/PORT/PROTOCOL nur für automatisierte Tests mit einem Stripe-Mock
const stripe = enabled
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      ...(process.env.STRIPE_API_HOST
        ? { host: process.env.STRIPE_API_HOST, port: Number(process.env.STRIPE_API_PORT || 443), protocol: process.env.STRIPE_API_PROTOCOL || "https" }
        : {}),
      appInfo: { name: "PDF Libre" },
    })
  : null;

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function requireStripe(req, res, next) {
  if (!enabled) return next(new ApiError("Zahlungen sind auf diesem Server noch nicht eingerichtet.", 503));
  next();
}

function safeReturnPath(p) {
  return typeof p === "string" && /^\/(?!\/)[\w\-./?=&%]*$/.test(p) ? p : "/konto.html";
}

async function ensureCustomer(user) {
  if (user.stripe_customer_id) {
    // Gespeicherte Kunden-ID prüfen: Nach einem Wechsel des Stripe-Kontos oder von Test auf Live
    // gibt es sie dort nicht mehr – dann einen neuen Kunden anlegen.
    try {
      const existing = await stripe.customers.retrieve(user.stripe_customer_id);
      if (!existing.deleted) return existing.id;
    } catch (err) {
      if (err.code !== "resource_missing") throw err;
    }
  }
  const customer = await stripe.customers.create({ email: user.email, metadata: { user_id: String(user.id) } });
  await db.query("UPDATE users SET stripe_customer_id = $1 WHERE id = $2", [customer.id, user.id]);
  return customer.id;
}

function periodEnd(sub) {
  // Neuere Stripe-API-Versionen führen das Periodenende pro Abo-Position
  const ts = sub.items?.data?.[0]?.current_period_end ?? sub.current_period_end;
  return ts ? new Date(ts * 1000) : null;
}

async function syncSubscription(sub) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  await db.query(
    `UPDATE users SET subscription_id = $1, subscription_status = $2, subscription_period_end = $3, cancel_at_period_end = $4
     WHERE stripe_customer_id = $5`,
    [sub.id, sub.status, periodEnd(sub), Boolean(sub.cancel_at_period_end || sub.cancel_at), customerId]
  );
}

/** Wertet eine abgeschlossene Checkout-Sitzung aus. Mehrfacher Aufruf ist unschädlich. */
async function applyCheckout(session) {
  if (session.status !== "complete") return;
  const userId = Number(session.client_reference_id);
  if (!userId) return;

  if (session.mode === "payment" && session.metadata?.plan === "daypass" && session.payment_status === "paid") {
    const { rowCount } = await db.query("INSERT INTO day_passes (checkout_session_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [session.id, userId]);
    if (rowCount) {
      await db.query(
        `UPDATE users SET pass_until = GREATEST(now(), COALESCE(pass_until, now())) + $1::interval WHERE id = $2`,
        [`${PASS_HOURS} hours`, userId]
      );
    }
  }
  if (session.mode === "subscription" && session.subscription) {
    const sub = typeof session.subscription === "string" ? await stripe.subscriptions.retrieve(session.subscription) : session.subscription;
    await syncSubscription(sub);
  }
}

function router() {
  const r = express.Router();
  r.use(express.json({ limit: "10kb" }));

  r.get("/config", (req, res) => res.json({ enabled }));

  // Weiterleitung zu Stripe Checkout
  r.post(
    "/checkout",
    requireDb,
    requireStripe,
    requireUser,
    wrap(async (req, res) => {
      const plan = req.body.plan === "daypass" ? "daypass" : "pro";
      if (!req.body.waiver) {
        throw new ApiError("Bitte bestätige, dass die Leistung sofort beginnen soll.");
      }
      if (plan === "pro" && ["active", "trialing", "past_due"].includes(req.user.subscription_status)) {
        throw new ApiError("Du hast bereits ein aktives Pro-Abo. Du kannst es im Kundenportal verwalten.", 409);
      }
      const customer = await ensureCustomer(req.user);
      const base = appUrl(req);
      const back = safeReturnPath(req.body.returnTo);
      const sep = back.includes("?") ? "&" : "?";
      const metadata = { plan, user_id: String(req.user.id), widerruf_verzicht: new Date().toISOString() };

      const session = await stripe.checkout.sessions.create({
        mode: plan === "pro" ? "subscription" : "payment",
        customer,
        client_reference_id: String(req.user.id),
        line_items: [{ price: plan === "pro" ? process.env.STRIPE_PRICE_PRO : process.env.STRIPE_PRICE_DAYPASS, quantity: 1 }],
        locale: "de",
        allow_promotion_codes: true,
        metadata,
        ...(plan === "pro" ? { subscription_data: { metadata } } : { payment_intent_data: { metadata } }),
        success_url: `${base}${back}${sep}checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}${back}${sep}checkout=cancel`,
      });
      res.json({ url: session.url });
    })
  );

  // Nach der Rückkehr von Stripe sofort freischalten (wartet nicht auf den Webhook)
  r.post(
    "/confirm",
    requireDb,
    requireStripe,
    requireUser,
    wrap(async (req, res) => {
      const id = String(req.body.sessionId || "");
      if (!/^cs_[\w]+$/.test(id)) throw new ApiError("Ungültige Sitzung.");
      const session = await stripe.checkout.sessions.retrieve(id);
      if (Number(session.client_reference_id) !== Number(req.user.id)) throw new ApiError("Diese Zahlung gehört zu einem anderen Konto.", 403);
      await applyCheckout(session);
      const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
      res.json({ user: publicUser(rows[0]) });
    })
  );

  // Kundenportal: Rechnungen, Zahlungsmethode, Kündigung
  r.post(
    "/portal",
    requireDb,
    requireStripe,
    requireUser,
    wrap(async (req, res) => {
      if (!req.user.stripe_customer_id) throw new ApiError("Für dieses Konto gibt es noch keine Zahlungen.");
      const session = await stripe.billingPortal.sessions.create({
        customer: req.user.stripe_customer_id,
        return_url: `${appUrl(req)}/konto.html`,
        locale: "de",
      });
      res.json({ url: session.url });
    })
  );

  return r;
}

/** Webhook: muss VOR express.json() mit dem Rohtext der Anfrage eingebunden werden. */
function webhook() {
  return [
    express.raw({ type: "application/json", limit: "1mb" }),
    wrap(async (req, res) => {
      if (!enabled || !db.enabled) return res.status(503).end();
      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
      } catch (e) {
        console.warn("Stripe-Webhook mit ungültiger Signatur abgelehnt:", e.message);
        return res.status(400).send("Ungültige Signatur");
      }
      const { rowCount } = await db.query("INSERT INTO stripe_events (id) VALUES ($1) ON CONFLICT DO NOTHING", [event.id]);
      if (!rowCount) return res.json({ received: true, duplicate: true });

      try {
        switch (event.type) {
          case "checkout.session.completed":
          case "checkout.session.async_payment_succeeded":
            await applyCheckout(event.data.object);
            break;
          case "customer.subscription.created":
          case "customer.subscription.updated":
          case "customer.subscription.deleted":
            await syncSubscription(event.data.object);
            break;
          default:
            break;
        }
      } catch (e) {
        // Ereignis wieder freigeben, damit Stripe es erneut zustellt
        await db.query("DELETE FROM stripe_events WHERE id = $1", [event.id]);
        throw e;
      }
      res.json({ received: true });
    }),
  ];
}

module.exports = { router, webhook, enabled };

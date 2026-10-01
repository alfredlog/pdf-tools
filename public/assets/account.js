/* PDF Libre – Konto, Anmeldung und Tarifwahl (wird auch vom PDF-Editor genutzt) */
(() => {
  "use strict";

  async function api(path, body) {
    const res = await fetch(path, {
      method: body === undefined ? "GET" : "POST",
      headers: body === undefined ? {} : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
    });
    let data = {};
    try {
      data = await res.json();
    } catch {
      /* keine JSON-Antwort */
    }
    if (!res.ok) {
      const err = new Error(data.error || "Das hat nicht geklappt. Bitte versuche es erneut.");
      err.status = res.status;
      err.code = data.code;
      throw err;
    }
    return data;
  }

  const me = () => api("/api/auth/me");

  function setError(el, msg) {
    if (!el) return;
    el.textContent = msg || "";
    el.hidden = !msg;
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" });
  }
  function formatDateTime(d) {
    return new Date(d).toLocaleString("de-DE", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  }

  function describeAccess(a) {
    if (!a || !a.active) return "Kein aktiver Tarif – deine Testphase ist abgelaufen.";
    if (a.plan === "trial") return `Kostenlose Testphase bis ${formatDate(a.until)}.`;
    if (a.plan === "daypass") return `Tagespass aktiv bis ${formatDateTime(a.until)}.`;
    if (a.plan === "pro")
      return a.cancelAtPeriodEnd && a.until ? `Pro ist gekündigt und läuft am ${formatDate(a.until)} aus.` : `Pro ist aktiv${a.until ? ` – nächste Verlängerung am ${formatDate(a.until)}` : ""}.`;
    return "";
  }

  /** Registrieren/Anmelden-Formulare aktivieren. onSuccess(user) wird nach Erfolg aufgerufen. */
  function bindAuth(root, onSuccess) {
    const tabs = root.querySelectorAll("[data-auth-tab]");
    const forms = root.querySelectorAll("[data-auth-form]");
    function selectTab(name) {
      tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.authTab === name)));
      forms.forEach((f) => (f.hidden = f.dataset.authForm !== name));
    }
    tabs.forEach((t) => t.addEventListener("click", () => selectTab(t.dataset.authTab)));

    forms.forEach((form) =>
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const err = form.querySelector("[data-auth-error]");
        setError(err, "");
        const btn = form.querySelector("button[type=submit]");
        const data = {
          email: form.elements.email.value,
          password: form.elements.password.value,
          acceptTerms: form.elements.acceptTerms ? form.elements.acceptTerms.checked : undefined,
        };
        if (form.dataset.authForm === "register" && !data.acceptTerms) return setError(err, "Bitte akzeptiere die AGB und die Datenschutzerklärung.");
        btn.disabled = true;
        try {
          const res = await api(`/api/auth/${form.dataset.authForm}`, data);
          await onSuccess(res.user);
        } catch (ex) {
          setError(err, ex.message);
          if (ex.status === 409) selectTab("login");
        } finally {
          btn.disabled = false;
        }
      })
    );
    return { selectTab };
  }

  /** Tarif-Buttons aktivieren. beforeRedirect() kann den Zustand sichern (z. B. den Editor). */
  function bindPlans(root, { returnTo, beforeRedirect } = {}) {
    const err = root.querySelector("[data-plans-error]");
    root.querySelectorAll("[data-checkout]").forEach((btn) =>
      btn.addEventListener("click", async () => {
        setError(err, "");
        const waiver = root.querySelector("[data-waiver]");
        if (waiver && !waiver.checked) {
          waiver.focus();
          return setError(err, "Bitte bestätige zuerst das Häkchen oben.");
        }
        btn.disabled = true;
        try {
          if (beforeRedirect) await beforeRedirect();
          const { url } = await api("/api/billing/checkout", { plan: btn.dataset.checkout, returnTo: returnTo || location.pathname, waiver: true });
          location.href = url;
        } catch (ex) {
          setError(err, ex.message);
          btn.disabled = false;
        }
      })
    );
  }

  /** Nach der Rückkehr von Stripe: Zahlung bestätigen. Gibt den aktualisierten Nutzer zurück oder null. */
  async function confirmCheckoutFromUrl() {
    const params = new URLSearchParams(location.search);
    if (params.get("checkout") !== "success" || !params.get("session_id")) return null;
    try {
      const { user } = await api("/api/billing/confirm", { sessionId: params.get("session_id") });
      return user;
    } finally {
      params.delete("checkout");
      params.delete("session_id");
      const qs = params.toString();
      history.replaceState(null, "", location.pathname + (qs ? `?${qs}` : ""));
    }
  }

  window.PL = { api, me, bindAuth, bindPlans, describeAccess, confirmCheckoutFromUrl, setError };

  // ---------------------------------------------------------------------------
  // Eigene Seiten
  // ---------------------------------------------------------------------------
  const pageEl = document.querySelector("[data-page]");
  if (!pageEl) return;
  const kind = pageEl.dataset.page;

  if (kind === "login") {
    const next = new URLSearchParams(location.search).get("next");
    const target = next && /^\/(?!\/)/.test(next) ? next : "/konto.html";
    bindAuth(pageEl, () => (location.href = target));
    if (location.hash === "#login") pageEl.querySelector('[data-auth-tab="login"]').click();
  }

  if (kind === "account") {
    const view = pageEl.querySelector("[data-account-view]");
    const loading = pageEl.querySelector("[data-acc-loading]");
    const render = (user) => {
      pageEl.querySelector("[data-acc-email]").textContent = user.email;
      pageEl.querySelector("[data-acc-status]").textContent = describeAccess(user.access);
      pageEl.querySelector("[data-portal]").hidden = !user.hasSubscription;
      pageEl.querySelector("[data-acc-plans]").hidden = user.access.active && user.access.plan === "pro";
      loading.hidden = true;
      view.hidden = false;
    };
    (async () => {
      try {
        const confirmed = await confirmCheckoutFromUrl().catch(() => null);
        const { user } = confirmed ? { user: confirmed } : await me();
        if (!user) return (location.href = "/anmelden.html?next=/konto.html#login");
        render(user);
      } catch (e) {
        loading.textContent = e.message;
      }
    })();
    bindPlans(pageEl, { returnTo: "/konto.html" });
    pageEl.querySelector("[data-portal]").addEventListener("click", async (e) => {
      e.target.disabled = true;
      try {
        location.href = (await api("/api/billing/portal", {})).url;
      } catch (ex) {
        alert(ex.message);
        e.target.disabled = false;
      }
    });
    pageEl.querySelector("[data-logout]").addEventListener("click", async () => {
      await api("/api/auth/logout", {}).catch(() => {});
      location.href = "/";
    });
  }

  if (kind === "forgot") {
    const token = new URLSearchParams(location.search).get("token");
    const forgot = pageEl.querySelector("[data-forgot]");
    const reset = pageEl.querySelector("[data-reset]");
    const done = pageEl.querySelector("[data-done]");
    if (token) {
      forgot.hidden = true;
      reset.hidden = false;
    }
    forgot.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        await api("/api/auth/forgot", { email: forgot.elements.email.value });
        forgot.hidden = true;
        done.hidden = false;
        done.textContent = "Wenn es ein Konto mit dieser Adresse gibt, haben wir dir einen Link geschickt. Schau auch im Spam-Ordner nach.";
      } catch (ex) {
        setError(forgot.querySelector("[data-auth-error]"), ex.message);
      }
    });
    reset.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        await api("/api/auth/reset", { token, password: reset.elements.password.value });
        location.href = "/konto.html";
      } catch (ex) {
        setError(reset.querySelector("[data-auth-error]"), ex.message);
      }
    });
  }
})();

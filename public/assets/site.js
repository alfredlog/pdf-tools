// PDF Libre – Navigation & Startseiten-Filter
(() => {
  const mega = document.getElementById("mega");
  const toggles = document.querySelectorAll('[aria-controls="mega"]');

  function setMenu(open) {
    mega.hidden = !open;
    toggles.forEach((t) => t.setAttribute("aria-expanded", String(open)));
  }
  toggles.forEach((t) =>
    t.addEventListener("click", (e) => {
      e.stopPropagation();
      setMenu(mega.hidden);
    })
  );
  document.addEventListener("click", (e) => {
    if (!mega.hidden && !mega.contains(e.target)) setMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !mega.hidden) {
      setMenu(false);
      toggles[0].focus();
    }
  });

  // Kopfzeile: „Mein Konto“ statt „Anmelden“, wenn angemeldet
  if (/(?:^|;\s*)pl_in=1/.test(document.cookie)) {
    document.querySelectorAll("[data-account]").forEach((a) => {
      a.textContent = (window.PL_T && window.PL_T["Mein Konto"]) || "Mein Konto";
      a.href = "/konto.html";
    });
  }

  // „Datenschutzeinstellungen“: öffnet den Google-Cookie-Banner (Google CMP) erneut.
  // Ist der Banner nicht geladen (noch nicht in AdSense veröffentlicht, Werbeblocker …),
  // geht es zur Erklärung in der Datenschutzerklärung.
  document.querySelectorAll("[data-consent-settings]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const fc = window.googlefc;
      if (fc && typeof fc.showRevocationMessage === "function") {
        fc.showRevocationMessage();
        return;
      }
      let opened = false;
      window.googlefc = window.googlefc || {};
      window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
      window.googlefc.callbackQueue.push(() => {
        if (typeof window.googlefc.showRevocationMessage === "function") {
          opened = true;
          window.googlefc.showRevocationMessage();
        }
      });
      setTimeout(() => {
        if (!opened) location.href = "/Datenschutz.html#einwilligung";
      }, 1200);
    })
  );

  // Sprachwahl: Menü auf- und zuklappen
  document.querySelectorAll(".langsw").forEach((sw) => {
    const btn = sw.querySelector(".langsw__btn");
    const menu = sw.querySelector(".langsw__menu");
    const set = (open) => { menu.hidden = !open; btn.setAttribute("aria-expanded", String(open)); };
    btn.addEventListener("click", (e) => { e.stopPropagation(); set(menu.hidden); });
    document.addEventListener("click", (e) => { if (!sw.contains(e.target)) set(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { set(false); btn.focus(); } });
    // Wer selbst eine Sprache wählt, bekommt keinen Hinweis mehr
    menu.querySelectorAll("[data-lang-link]").forEach((a) => a.addEventListener("click", () => { try { localStorage.setItem("pl_lang", a.dataset.langLink); } catch (_) {} }));
  });

  // Hinweis: Browser-Sprache passt nicht zur Seite, es gibt aber eine Fassung in dieser Sprache.
  // Kein automatisches Umleiten (Google soll jede Fassung sehen), nur ein Angebot.
  (() => {
    const page = document.documentElement.lang || "de";
    let chosen = null;
    try { chosen = localStorage.getItem("pl_lang"); } catch (_) {}
    if (chosen) return; // Besucher hat schon entschieden (Wahl oder „×“)
    const want = (navigator.languages || [navigator.language || ""]).map((l) => l.slice(0, 2).toLowerCase()).find((l) => ["de", "en", "fr"].includes(l));
    if (!want || want === page) return;
    const alt = document.querySelector(`link[rel="alternate"][hreflang="${want}"]`);
    if (!alt) return;
    const TXT = {
      en: ["This page is also available in English.", "Switch to English"],
      fr: ["Cette page existe aussi en français.", "Passer au français"],
      de: ["Diese Seite gibt es auch auf Deutsch.", "Zur deutschen Seite"],
    }[want];
    const bar = document.createElement("div");
    bar.className = "langhint";
    bar.lang = want;
    bar.innerHTML = `<div class="wrap"><span></span><a></a><button type="button" aria-label="×">×</button></div>`;
    bar.querySelector("span").textContent = TXT[0];
    const a = bar.querySelector("a");
    a.textContent = TXT[1];
    a.href = new URL(alt.href).pathname;
    a.addEventListener("click", () => { try { localStorage.setItem("pl_lang", want); } catch (_) {} });
    bar.querySelector("button").addEventListener("click", () => { try { localStorage.setItem("pl_lang", page); } catch (_) {} bar.remove(); });
    document.body.prepend(bar);
  })();

  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  // Filter auf der Startseite
  const chips = document.querySelectorAll(".filters .chip");
  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      const f = chip.dataset.filter;
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      document.querySelectorAll(".tools-index .tgroup").forEach((group) => {
        group.hidden = f !== "all" && group.dataset.group !== f;
      });
    })
  );
})();

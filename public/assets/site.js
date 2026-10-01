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
      a.textContent = "Mein Konto";
      a.href = "/konto.html";
    });
  }

  // „Datenschutzeinstellungen“: öffnet den Google-Cookie-Banner erneut
  document.querySelectorAll("[data-consent-settings]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      window.googlefc = window.googlefc || {};
      window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
      window.googlefc.callbackQueue.push(() => window.googlefc.showRevocationMessage && window.googlefc.showRevocationMessage());
    })
  );

  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  // Filter auf der Startseite
  const chips = document.querySelectorAll(".filters .chip");
  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      const f = chip.dataset.filter;
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      document.querySelectorAll(".tools-index .tcard").forEach((card) => {
        card.hidden = f !== "all" && card.dataset.cat !== f;
      });
    })
  );
})();

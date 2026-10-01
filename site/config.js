/**
 * Zentrale Einstellungen für die Website.
 * Nach Änderungen: `npm run build`
 */
module.exports = {
  name: "PDF Libre",
  domain: "https://pdf-libre.de", // ohne Slash am Ende
  owner: "Alfred Mushagalusa Munganga",
  email: "alfred_mus@pdflibre.de",
  address: ["Am Kiefernwald 4", "64297 Darmstadt", "Deutschland"],

  // Google Analytics (leer lassen zum Deaktivieren)
  analyticsId: "G-MD8R6SK1YW",

  // Google AdSense (leer lassen zum Deaktivieren)
  adsenseClient: "ca-pub-3689729622700252",


  // Pro-Tarife (nur Anzeige – die echten Preise legst du in Stripe fest)
  pricing: {
    trialDays: 14,
    pro: "4,99 €",
    daypass: "2,99 €",
    daypassHours: 24,
  },
};

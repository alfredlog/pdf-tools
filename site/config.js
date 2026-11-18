/**
 * Zentrale Einstellungen für die Website.
 * Nach Änderungen: `npm run build`
 */
module.exports = {
  name: "PDF Libre",
  domain: "https://pdf-libre.de", // ohne Slash am Ende
  owner: "Alfred Mushagalusa Munganga",
  email: "info@pdf-libre.de",
  address: ["Am Kiefernwald 4", "64297 Darmstadt", "Deutschland"],

  // KI-Anbieter (für die Datenschutzerklärung) – muss zu AI_BASE_URL in der .env passen
  aiProvider: "OpenAI Ireland Ltd., 1st Floor, The Liffey Trust Centre, 117–126 Sheriff Street Upper, Dublin 1, Irland",

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

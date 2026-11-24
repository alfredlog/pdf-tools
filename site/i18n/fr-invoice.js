// E-Rechnung erstellen (e-rechnung-erstellen) – français
module.exports = {
 "tool": {
  "name": "Créer une facture électronique",
  "short": "Créer gratuitement un PDF ZUGFeRD ou une XRechnung – totaux et TVA calculés.",
  "title": "Créer une facture électronique gratuite – ZUGFeRD & XRechnung en ligne | PDF Libre",
  "description": "Créer une facture électronique allemande en ligne : PDF ZUGFeRD (Factur-X) pour les entreprises ou XML XRechnung pour les administrations. Saisissez les lignes, totaux et TVA sont calculés, les mentions obligatoires vérifiées. Gratuit, sans inscription.",
  "h1": "Créer une facture électronique",
  "lead": "Rédigez votre facture comme d’habitude – vous obtenez une facture électronique valable selon la norme EN 16931 : en PDF ZUGFeRD pour les clients professionnels ou en XRechnung pour les administrations allemandes. Sans logiciel, sans compte.",
  "steps": [
   [
    "Choisir le format",
    "PDF ZUGFeRD pour les entreprises et particuliers (un PDF normal avec les données intégrées) ou XRechnung (XML) pour les administrations allemandes."
   ],
   [
    "Saisir les informations",
    "Vos coordonnées, le destinataire et les lignes. Total HT, TVA et total TTC sont calculés en direct. Votre navigateur peut mémoriser vos propres informations."
   ],
   [
    "Télécharger la facture",
    "Cliquez sur « Créer la facture électronique ». S’il manque une mention obligatoire, vous voyez exactement laquelle. Vous pouvez envoyer le fichier immédiatement."
   ]
  ],
  "faq": [
   [
    "La création de la facture électronique est-elle gratuite ?",
    "Oui, gratuite et sans inscription, même pour plusieurs factures."
   ],
   [
    "Est-ce une facture électronique valable ?",
    "Oui. ZUGFeRD est créé dans le profil EN 16931 en PDF/A-3, la XRechnung en version 3.0 – les deux sont conformes à la norme européenne EN 16931."
   ],
   [
    "Les micro-entreprises (§ 19 UStG) doivent-elles émettre des factures électroniques ?",
    "Non, en Allemagne les entreprises en franchise de TVA (§ 19 UStG) sont exemptées. Elles peuvent quand même en émettre si un client le demande."
   ],
   [
    "Où obtenir la Leitweg-ID ?",
    "L’administration vous la communique, en général dans la commande. Sans Leitweg-ID, indiquez un numéro de commande."
   ],
   [
    "Puis-je créer un avoir ?",
    "Oui. Cochez « Avoir au lieu de facture »."
   ],
   [
    "Comment envoyer la facture électronique ?",
    "Simplement en pièce jointe par e-mail. Les administrations ont souvent leur propre portail (ex. ZRE ou OZG-RE) où déposer la XRechnung."
   ],
   [
    "Mes factures sont-elles enregistrées ?",
    "Non. Les données servent uniquement à créer le fichier. Seul votre navigateur mémorise vos propres informations, si vous le souhaitez."
   ]
  ]
 },
 "article": [
  [
   "Qu’est-ce qu’une facture électronique – un PDF ne suffit-il pas ?",
   "Une facture électronique est une facture dans un format structuré, lisible par machine, selon la norme européenne EN 16931. Un PDF normal issu de Word ou un scan est une « autre facture » : il a l’air correct, mais le logiciel comptable du destinataire ne peut pas lire les montants automatiquement.",
   "En Allemagne, deux formats sont courants : la XRechnung est un simple fichier XML, obligatoire surtout pour les administrations. ZUGFeRD (Factur-X en France) est un PDF contenant les mêmes données en XML – l’humain lit le PDF, le logiciel lit les données. Les deux répondent aux exigences légales."
  ],
  [
   "Quand la facture électronique devient-elle obligatoire en Allemagne ?",
   "Depuis le 1er janvier 2025, toutes les entreprises en Allemagne doivent pouvoir recevoir des factures électroniques. Les entreprises réalisant plus de 800 000 € de chiffre d’affaires l’année précédente doivent en émettre à partir du 1er janvier 2027 pour les factures à d’autres entreprises allemandes ; à partir du 1er janvier 2028, l’obligation s’applique à toutes les autres.",
   "Restent exemptées les entreprises en franchise de TVA (§ 19 UStG) et les factures de moins de 250 €. Les factures aux particuliers peuvent toujours être envoyées en PDF normal. Pour les acheteurs publics, la XRechnung est déjà obligatoire – généralement avec une Leitweg-ID fournie par l’administration."
  ],
  [
   "ZUGFeRD ou XRechnung – que choisir ?",
   "Pour les clients professionnels, le PDF ZUGFeRD est généralement le meilleur choix : le destinataire l’ouvre et l’imprime comme n’importe quel PDF, et sa comptabilité lit tout de même les données automatiquement. Nous créons ZUGFeRD dans le profil EN 16931 en PDF/A-3 – la variante qui vaut facture électronique complète.",
   "Pour les administrations, écoles, universités ou entreprises municipales, choisissez la XRechnung et saisissez la Leitweg-ID dans « Leitweg-ID ou numéro de commande ». La XRechnung exige en plus une personne de contact avec téléphone et e-mail ainsi que votre IBAN – ces champs sont alors marqués d’une étoile orange."
  ],
  [
   "Totaux et TVA calculés automatiquement",
   "Vous saisissez seulement la quantité, le prix unitaire et le taux de TVA. Les montants par ligne, la TVA par taux (19 %, 7 % ou 0 %) et le total sont calculés selon les règles de la norme – les chiffres concordent toujours, et la vérification chez le destinataire n’échoue jamais à cause d’un arrondi.",
   "En franchise de TVA, cochez simplement « § 19 UStG » : aucune TVA n’est calculée et la mention obligatoire est ajoutée automatiquement. Vous pouvez contrôler le fichier avec « Vérifier une facture électronique » ou l’afficher en PDF lisible avec « Afficher une XRechnung »."
  ],
  [
   "Vos données",
   "Les données de facture sont envoyées à notre serveur uniquement pour créer le fichier et ne sont pas enregistrées ensuite. Pour ne pas retaper vos propres informations, votre navigateur peut les garder localement (« Mémoriser mes informations ») – elles ne quittent pas votre appareil. Le numéro de facture suivant est proposé automatiquement."
  ]
 ],
 "ui": {
  "Format": "Format",
  "ZUGFeRD-PDF": "PDF ZUGFeRD",
  "– für Firmen und Privatkunden: normale PDF mit eingebetteten Rechnungsdaten": "– pour les entreprises et les particuliers : un PDF normal avec les données de facture intégrées",
  "XRechnung (XML)": "XRechnung (XML)",
  "– für Behörden und öffentliche Auftraggeber (Leitweg-ID)": "– pour les administrations et acheteurs publics allemands (Leitweg-ID)",
  "Rechnungssteller (du)": "Émetteur (vous)",
  "Name / Firma": "Nom / entreprise",
  "Pflichtangabe": "Obligatoire",
  "Straße und Hausnummer": "Rue et numéro",
  "PLZ": "Code postal",
  "Ort": "Ville",
  "Land (Code)": "Pays (code)",
  "DE": "DE",
  "USt-IdNr.": "N° de TVA intracommunautaire",
  "DE123456789": "DE123456789",
  "oder Steuernummer": "ou numéro fiscal",
  "z. B. 007/123/45678": "ex. 007/123/45678",
  "Ansprechpartner": "Personne de contact",
  "Pflicht bei XRechnung": "Obligatoire pour XRechnung",
  "Telefon": "Téléphone",
  "E-Mail": "E-mail",
  "IBAN": "IBAN",
  "DE00 0000 0000 0000 0000 00": "DE00 0000 0000 0000 0000 00",
  "BIC (optional)": "BIC (facultatif)",
  "Kleinunternehmer nach § 19 UStG (keine Umsatzsteuer)": "Franchise en base de TVA (§ 19 UStG, sans TVA)",
  "Meine Angaben in diesem Browser merken": "Mémoriser mes informations dans ce navigateur",
  "Rechnungsempfänger": "Destinataire",
  "Leitweg-ID oder Bestellnummer": "Leitweg-ID ou numéro de commande",
  "z. B. 991-12345-67": "ex. 991-12345-67",
  "Rechnung": "Facture",
  "Rechnungsnummer": "Numéro de facture",
  "z. B. 2026-001": "ex. 2026-001",
  "Rechnungsdatum": "Date de facture",
  "Leistungsdatum": "Date de livraison / prestation",
  "Zahlungsziel (Tage)": "Délai de paiement (jours)",
  "Gutschrift statt Rechnung": "Avoir au lieu de facture",
  "Positionen": "Lignes",
  "Bezeichnung": "Désignation",
  "Menge": "Qté",
  "Einheit": "Unité",
  "Einzelpreis netto (€)": "Prix unitaire HT (€)",
  "USt.": "TVA",
  "Betrag netto": "Montant HT",
  "z. B. Webdesign Startseite": "ex. Création de la page d’accueil",
  "Stück": "Pièce",
  "Stunde": "Heure",
  "Tag": "Jour",
  "Monat": "Mois",
  "Pauschale": "Forfait",
  "Position entfernen": "Supprimer la ligne",
  "+ Position hinzufügen": "+ Ajouter une ligne",
  "Bemerkung (optional)": "Remarque (facultatif)",
  "z. B. Vielen Dank für Ihren Auftrag!": "ex. Merci pour votre commande !",
  "Mit Beispieldaten ausfüllen": "Remplir avec un exemple",
  "E-Rechnung erstellen": "Créer la facture électronique",
  "Deine Angaben werden nur zum Erstellen an unseren Server geschickt und nicht gespeichert. „Merken“ speichert sie nur in deinem Browser.": "Vos données sont envoyées à notre serveur uniquement pour créer le fichier et ne sont pas enregistrées. « Mémoriser » les garde seulement dans votre navigateur.",
  "Deine E-Rechnung ist fertig!": "Votre facture électronique est prête !",
  "Zurück zur Rechnung": "Retour à la facture",
  "Nächste Rechnung": "Facture suivante"
 },
 "js": {
  "Summe netto": "Total HT",
  "Umsatzsteuer {r} %": "TVA {r} %",
  "Umsatzsteuer": "TVA",
  "entfällt (§ 19 UStG)": "non applicable (§ 19 UStG)",
  "Gesamtbetrag": "Total TTC",
  "Rechnungsnummer": "Numéro de facture",
  "Rechnungsdatum": "Date de facture",
  "Name (Rechnungssteller)": "Nom (émetteur)",
  "Straße (Rechnungssteller)": "Rue (émetteur)",
  "PLZ (Rechnungssteller)": "Code postal (émetteur)",
  "Ort (Rechnungssteller)": "Ville (émetteur)",
  "Name (Empfänger)": "Nom (destinataire)",
  "Straße (Empfänger)": "Rue (destinataire)",
  "PLZ (Empfänger)": "Code postal (destinataire)",
  "Ort (Empfänger)": "Ville (destinataire)",
  "USt-IdNr. oder Steuernummer": "N° de TVA ou numéro fiscal",
  "Ansprechpartner (Rechnungssteller)": "Personne de contact (émetteur)",
  "Telefon (Rechnungssteller)": "Téléphone (émetteur)",
  "E-Mail (Rechnungssteller)": "E-mail (émetteur)",
  "E-Mail (Empfänger)": "E-mail (destinataire)",
  "IBAN": "IBAN",
  "Bezeichnung (Position {n})": "Désignation (ligne {n})",
  "Einzelpreis (Position {n})": "Prix unitaire (ligne {n})",
  "Menge (Position {n})": "Quantité (ligne {n})",
  "mindestens eine Position": "au moins une ligne",
  "Bitte noch ausfüllen:": "Veuillez encore remplir :",
  "Die E-Rechnung konnte nicht erstellt werden. Bitte versuche es noch einmal.": "La facture électronique n’a pas pu être créée. Veuillez réessayer.",
  "XRechnung 3.0 (XML). Lade sie im Rechnungsportal der Behörde hoch (z. B. ZRE oder OZG-RE) oder sende sie per E-Mail.": "XRechnung 3.0 (XML). Déposez-la sur le portail de facturation de l’administration (ex. ZRE ou OZG-RE) ou envoyez-la par e-mail.",
  "ZUGFeRD-PDF (Profil EN 16931): sieht aus wie eine normale Rechnung und enthält alle Daten maschinenlesbar – gültig als E-Rechnung.": "PDF ZUGFeRD (profil EN 16931) : ressemble à une facture normale et contient toutes les données sous forme lisible par machine – valable comme facture électronique.",
  "Webdesign Startseite": "Création de la page d’accueil",
  "Pflege und Updates": "Maintenance et mises à jour",
  "Name des Rechnungsstellers": "Nom de l’émetteur",
  "Straße des Rechnungsstellers": "Rue de l’émetteur",
  "PLZ des Rechnungsstellers": "Code postal de l’émetteur",
  "Ort des Rechnungsstellers": "Ville de l’émetteur",
  "Name des Empfängers": "Nom du destinataire",
  "Straße des Empfängers": "Rue du destinataire",
  "PLZ des Empfängers": "Code postal du destinataire",
  "Ort des Empfängers": "Ville du destinataire",
  "USt-IdNr. oder Steuernummer des Rechnungsstellers": "N° de TVA ou numéro fiscal de l’émetteur",
  "E-Mail des Empfängers": "E-mail du destinataire"
 }
};

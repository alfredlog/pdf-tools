// E-Rechnung erstellen (e-rechnung-erstellen) – English
module.exports = {
 "tool": {
  "name": "Create e-invoice",
  "short": "Create a ZUGFeRD PDF or XRechnung for free – totals and VAT are calculated.",
  "title": "Create an e-invoice for free – ZUGFeRD & XRechnung online | PDF Libre",
  "description": "Create German e-invoices online: ZUGFeRD PDF for businesses or XRechnung XML for public authorities. Enter items, totals and VAT are calculated automatically, required fields are checked. Free, no sign-up.",
  "h1": "Create an e-invoice",
  "lead": "Write your invoice as usual – and get a valid e-invoice according to EN 16931: as a ZUGFeRD PDF for business customers or as an XRechnung for public authorities. No software, no account.",
  "steps": [
   [
    "Choose the format",
    "ZUGFeRD PDF for businesses and private customers (a normal PDF with embedded data) or XRechnung (XML) for German public authorities."
   ],
   [
    "Enter the details",
    "Your details, the recipient and the items. Net amount, VAT and total are calculated live. Your browser can remember your own details."
   ],
   [
    "Download the e-invoice",
    "Click “Create e-invoice”. If a required field is missing, you see exactly which one. You can send the finished file right away."
   ]
  ],
  "faq": [
   [
    "Is creating the e-invoice free?",
    "Yes, free and without sign-up, also for several invoices."
   ],
   [
    "Is it a valid e-invoice?",
    "Yes. ZUGFeRD is created in the EN 16931 profile as PDF/A-3, XRechnung in version 3.0 – both comply with the European standard EN 16931."
   ],
   [
    "Do small businesses (§ 19 UStG) have to issue e-invoices?",
    "No, small businesses under § 19 UStG are exempt. You may still issue e-invoices – some customers ask for them."
   ],
   [
    "Where do I get the Leitweg-ID?",
    "The authority gives you the Leitweg-ID, usually in the order. Without one you can enter an order number."
   ],
   [
    "Can I create a credit note?",
    "Yes. Tick “Credit note instead of invoice”."
   ],
   [
    "How do I send the e-invoice?",
    "Simply as an email attachment. Authorities often have their own invoice portal (e.g. ZRE or OZG-RE) where you upload the XRechnung."
   ],
   [
    "Are my invoices stored?",
    "No. The data is only used to create the file. Only your browser remembers your own details, if you want."
   ]
  ]
 },
 "article": [
  [
   "What is an e-invoice – isn’t a PDF enough?",
   "An e-invoice is an invoice in a structured, machine-readable format according to the European standard EN 16931. A normal PDF from Word or a scan is an “other invoice” – it looks fine, but the recipient’s accounting software can’t read the amounts automatically.",
   "Germany uses two common formats: XRechnung is a pure XML file and mandatory above all for public authorities. ZUGFeRD (Factur-X in France) is a PDF with the same data embedded as XML – people read the PDF, software reads the data. Both meet the legal requirements."
  ],
  [
   "When does the e-invoice become mandatory in Germany?",
   "Since 1 January 2025, all businesses in Germany must be able to receive e-invoices. Businesses with more than €800,000 turnover in the previous year must issue them from 1 January 2027 for invoices to other domestic businesses; from 1 January 2028 the obligation applies to all other businesses.",
   "Small businesses under § 19 UStG and small-amount invoices up to €250 remain exempt. Invoices to private customers may still be sent as a normal PDF. For public-sector clients XRechnung is already mandatory today – usually with a Leitweg-ID the authority gives you."
  ],
  [
   "ZUGFeRD or XRechnung – which should I choose?",
   "For business customers, a ZUGFeRD PDF is usually the best choice: the recipient opens and prints it like any PDF, while their accounting reads the data automatically. We create ZUGFeRD in the EN 16931 profile as PDF/A-3 – the variant that counts as a full e-invoice.",
   "For authorities, schools, universities or municipal companies use XRechnung and enter the Leitweg-ID in “Leitweg-ID or order number”. XRechnung also requires a contact person with phone and email as well as your IBAN – these fields are then marked with an orange star."
  ],
  [
   "Totals and VAT are calculated automatically",
   "You only enter quantity, unit price and VAT rate. Item amounts, VAT per rate (19 %, 7 % or 0 %) and the total are calculated according to the rules of the standard – so the figures always add up, and the recipient’s check never fails because of a rounding error.",
   "As a small business, just tick “§ 19 UStG”: no VAT is calculated and the required note is added to the invoice automatically. You can double-check the finished file with “Check e-invoice” or view it as a readable PDF with “View XRechnung”."
  ],
  [
   "Your data",
   "Your invoice data is only sent to our server to create the file and is not stored afterwards. So you don’t have to type your own details every time, your browser can save them locally (“Remember my details”) – they don’t leave your device. The next invoice number is suggested automatically."
  ]
 ],
 "ui": {
  "Format": "Format",
  "ZUGFeRD-PDF": "ZUGFeRD PDF",
  "– für Firmen und Privatkunden: normale PDF mit eingebetteten Rechnungsdaten": "– for companies and private customers: a normal PDF with embedded invoice data",
  "XRechnung (XML)": "XRechnung (XML)",
  "– für Behörden und öffentliche Auftraggeber (Leitweg-ID)": "– for public authorities and public-sector clients (Leitweg-ID)",
  "Rechnungssteller (du)": "Invoice issuer (you)",
  "Name / Firma": "Name / company",
  "Pflichtangabe": "Required",
  "Straße und Hausnummer": "Street and number",
  "PLZ": "Postcode",
  "Ort": "City",
  "Land (Code)": "Country (code)",
  "DE": "DE",
  "USt-IdNr.": "VAT ID",
  "DE123456789": "DE123456789",
  "oder Steuernummer": "or tax number",
  "z. B. 007/123/45678": "e.g. 007/123/45678",
  "Ansprechpartner": "Contact person",
  "Pflicht bei XRechnung": "Required for XRechnung",
  "Telefon": "Phone",
  "E-Mail": "Email",
  "IBAN": "IBAN",
  "DE00 0000 0000 0000 0000 00": "DE00 0000 0000 0000 0000 00",
  "BIC (optional)": "BIC (optional)",
  "Kleinunternehmer nach § 19 UStG (keine Umsatzsteuer)": "Small business under § 19 UStG (no VAT)",
  "Meine Angaben in diesem Browser merken": "Remember my details in this browser",
  "Rechnungsempfänger": "Recipient",
  "Leitweg-ID oder Bestellnummer": "Leitweg-ID or order number",
  "z. B. 991-12345-67": "e.g. 991-12345-67",
  "Rechnung": "Invoice",
  "Rechnungsnummer": "Invoice number",
  "z. B. 2026-001": "e.g. 2026-001",
  "Rechnungsdatum": "Invoice date",
  "Leistungsdatum": "Delivery / service date",
  "Zahlungsziel (Tage)": "Payment term (days)",
  "Gutschrift statt Rechnung": "Credit note instead of invoice",
  "Positionen": "Items",
  "Bezeichnung": "Description",
  "Menge": "Qty",
  "Einheit": "Unit",
  "Einzelpreis netto (€)": "Unit price net (€)",
  "USt.": "VAT",
  "Betrag netto": "Net amount",
  "z. B. Webdesign Startseite": "e.g. Website homepage design",
  "Stück": "Piece",
  "Stunde": "Hour",
  "Tag": "Day",
  "Monat": "Month",
  "Pauschale": "Lump sum",
  "Position entfernen": "Remove item",
  "+ Position hinzufügen": "+ Add item",
  "Bemerkung (optional)": "Note (optional)",
  "z. B. Vielen Dank für Ihren Auftrag!": "e.g. Thank you for your order!",
  "Mit Beispieldaten ausfüllen": "Fill in with sample data",
  "E-Rechnung erstellen": "Create e-invoice",
  "Deine Angaben werden nur zum Erstellen an unseren Server geschickt und nicht gespeichert. „Merken“ speichert sie nur in deinem Browser.": "Your details are only sent to our server to create the file and are not stored. “Remember” saves them only in your browser.",
  "Deine E-Rechnung ist fertig!": "Your e-invoice is ready!",
  "Zurück zur Rechnung": "Back to the invoice",
  "Nächste Rechnung": "Next invoice"
 },
 "js": {
  "Summe netto": "Net total",
  "Umsatzsteuer {r} %": "VAT {r} %",
  "Umsatzsteuer": "VAT",
  "entfällt (§ 19 UStG)": "none (§ 19 UStG)",
  "Gesamtbetrag": "Total",
  "Rechnungsnummer": "Invoice number",
  "Rechnungsdatum": "Invoice date",
  "Name (Rechnungssteller)": "Name (issuer)",
  "Straße (Rechnungssteller)": "Street (issuer)",
  "PLZ (Rechnungssteller)": "Postcode (issuer)",
  "Ort (Rechnungssteller)": "City (issuer)",
  "Name (Empfänger)": "Name (recipient)",
  "Straße (Empfänger)": "Street (recipient)",
  "PLZ (Empfänger)": "Postcode (recipient)",
  "Ort (Empfänger)": "City (recipient)",
  "USt-IdNr. oder Steuernummer": "VAT ID or tax number",
  "Ansprechpartner (Rechnungssteller)": "Contact person (issuer)",
  "Telefon (Rechnungssteller)": "Phone (issuer)",
  "E-Mail (Rechnungssteller)": "Email (issuer)",
  "E-Mail (Empfänger)": "Email (recipient)",
  "IBAN": "IBAN",
  "Bezeichnung (Position {n})": "Description (item {n})",
  "Einzelpreis (Position {n})": "Unit price (item {n})",
  "Menge (Position {n})": "Quantity (item {n})",
  "mindestens eine Position": "at least one item",
  "Bitte noch ausfüllen:": "Please fill in:",
  "Die E-Rechnung konnte nicht erstellt werden. Bitte versuche es noch einmal.": "The e-invoice could not be created. Please try again.",
  "XRechnung 3.0 (XML). Lade sie im Rechnungsportal der Behörde hoch (z. B. ZRE oder OZG-RE) oder sende sie per E-Mail.": "XRechnung 3.0 (XML). Upload it to the authority’s invoice portal (e.g. ZRE or OZG-RE) or send it by email.",
  "ZUGFeRD-PDF (Profil EN 16931): sieht aus wie eine normale Rechnung und enthält alle Daten maschinenlesbar – gültig als E-Rechnung.": "ZUGFeRD PDF (EN 16931 profile): looks like a normal invoice and contains all data in machine-readable form – valid as an e-invoice.",
  "Webdesign Startseite": "Website homepage design",
  "Pflege und Updates": "Maintenance and updates",
  "Name des Rechnungsstellers": "Issuer name",
  "Straße des Rechnungsstellers": "Issuer street",
  "PLZ des Rechnungsstellers": "Issuer postcode",
  "Ort des Rechnungsstellers": "Issuer city",
  "Name des Empfängers": "Recipient name",
  "Straße des Empfängers": "Recipient street",
  "PLZ des Empfängers": "Recipient postcode",
  "Ort des Empfängers": "Recipient city",
  "USt-IdNr. oder Steuernummer des Rechnungsstellers": "Issuer VAT ID or tax number",
  "E-Mail des Empfängers": "Recipient email"
 }
};

/**
 * Serverseitige Übersetzung der Fehlermeldungen und Dateinamen für /en/ und /fr/.
 *
 * Die Sprache kommt aus dem Header „X-PL-Lang“ (falls gesetzt) oder aus der Seite, von der die
 * Anfrage kommt (Referer /en/… oder /fr/…). So müssen die Routen selbst nicht geändert werden:
 * Ein Middleware übersetzt jedes { error: "…" }, bevor es an den Browser geht.
 * Schlüssel = deutscher Originaltext. Fehlt eine Übersetzung, bleibt die Meldung deutsch.
 */
const MSG = {
  en: {
    "Bitte füge den vollständigen Text der Stellenanzeige ein (Aufgaben und Anforderungen).": "Please paste the full text of the job ad (tasks and requirements).",
    "Bitte füge den vollständigen Text der Stellenanzeige ein.": "Please paste the full text of the job ad.",
    "Bitte lade zuerst eine Datei hoch.": "Please upload a file first.",
    "Bitte wähle mindestens zwei PDF-Dateien aus.": "Please select at least two PDF files.",
    "Das Importieren mit KI ist auf diesem Server gerade nicht eingerichtet.": "AI import is not set up on this server at the moment.",
    "Das Passwort darf höchstens 64 Zeichen lang sein.": "The password may be at most 64 characters long.",
    "Das Passwort ist falsch.": "The password is wrong.",
    "Das Passwort muss mindestens 4 Zeichen lang sein.": "The password must be at least 4 characters long.",
    "Der KI-Dienst antwortet gerade nicht. Bitte versuche es in ein paar Minuten noch einmal.": "The AI service isn’t responding right now. Please try again in a few minutes.",
    "Der KI-Dienst ist gerade nicht erreichbar. Bitte versuche es später noch einmal.": "The AI service can’t be reached right now. Please try again later.",
    "Der Lebenslauf ist zu lang für eine Prüfung auf einmal.": "The CV is too long to check in one go.",
    "Der Lebenslauf konnte nicht gelesen werden. Bitte versuche es noch einmal.": "The CV could not be read. Please try again.",
    "In dieser Datei wurde kaum Text gefunden. Ist die Rechnung ein unscharfes Foto? Versuche einen Scan oder eine bessere Aufnahme.": "Hardly any text was found in this file. Is the invoice a blurry photo? Try a scan or a better picture.",
    "Die Rechnung konnte nicht gelesen werden. Bitte versuche es noch einmal.": "The invoice could not be read. Please try again.",
    "Die Datei konnte nicht gelesen werden. Erwartet wird eine E-Rechnung: XRechnung, Peppol-UBL (XML) oder eine ZUGFeRD-/Factur-X-PDF.": "The file could not be read. An e-invoice is expected: XRechnung, Peppol UBL (XML) or a ZUGFeRD/Factur-X PDF.",
    "Die Rechnungsdaten sind unvollständig.": "The invoice data is incomplete.",
    "Der E-Rechnung-Dienst antwortet gerade nicht. Bitte versuche es gleich noch einmal.": "The e-invoice service isn’t responding. Please try again in a moment.",
    "Es fehlen noch Angaben.": "Some details are still missing.",
    "Bitte prüfe deine Eingaben: Zahlen, Datum und mindestens eine Position mit Bezeichnung und Preis.": "Please check your entries: numbers, date and at least one item with description and price.",
    "Die E-Rechnung konnte nicht erstellt werden. Bitte versuche es noch einmal.": "The e-invoice could not be created. Please try again.",
    "Der Prüfdienst antwortet gerade nicht. Bitte versuche es gleich noch einmal.": "The validation service isn’t responding. Please try again in a moment.",
    "Der Text ist zu lang für eine Anfrage.": "The text is too long for one request.",
    "Der Vorschlag war nicht verwendbar. Bitte versuche es noch einmal.": "The suggestion wasn’t usable. Please try again.",
    "Die Datei konnte nicht umgewandelt werden. Ist sie beschädigt?": "The file could not be converted. Is it damaged?",
    "Die KI-Antwort war unvollständig. Bitte versuche es noch einmal.": "The AI response was incomplete. Please try again.",
    "Die KI-Werkzeuge sind auf diesem Server gerade nicht eingerichtet.": "The AI tools are not set up on this server at the moment.",
    "Die Prüfung ist fehlgeschlagen. Bitte versuche es noch einmal.": "The check failed. Please try again.",
    "Die Texterkennung ist auf dem Server gerade nicht eingerichtet.": "Text recognition is not set up on the server at the moment.",
    "Die Verarbeitung hat zu lange gedauert. Versuche es mit einer kleineren Datei.": "Processing took too long. Try a smaller file.",
    "Die Vorschau ist abgelaufen. Bitte lade die PDF noch einmal hoch.": "The preview has expired. Please upload the PDF again.",
    "Diese PDF enthält bereits Text – sie ist schon durchsuchbar. Texterkennung ist nur für gescannte Seiten nötig.": "This PDF already contains text – it is already searchable. Text recognition is only needed for scanned pages.",
    "Diese PDF enthält sehr viel Text. Bitte teile sie mit „PDF teilen“ in kleinere Teile auf (bis ca. 20 Seiten Fließtext).": "This PDF contains a lot of text. Please split it into smaller parts with “Split PDF” (up to about 20 pages of running text).",
    "Diese PDF ist passwortgeschützt. Entsperre sie zuerst mit „PDF entsperren“.": "This PDF is password-protected. Unlock it first with “Unlock PDF”.",
    "Diese PDF wurde nicht mit dem Lebenslauf-Generator von PDF Libre erstellt. Bald kannst du auch andere Lebensläufe importieren.": "This PDF was not created with the PDF Libre CV builder.",
    "Dieses Werkzeug ist auf dem Server gerade nicht verfügbar.": "This tool is not available on the server right now.",
    "Dieses Werkzeug ist gerade nicht verfügbar.": "This tool is not available right now.",
    "Eine der PDFs ist passwortgeschützt. Entsperre sie zuerst mit „PDF entsperren“.": "One of the PDFs is password-protected. Unlock it first with “Unlock PDF”.",
    "Eines der Bilder konnte nicht gelesen werden.": "One of the images could not be read.",
    "Es gibt noch keinen Text im Lebenslauf.": "There is no text in the CV yet.",
    "Es gibt noch keinen Text zum Prüfen.": "There is no text to check yet.",
    "Fülle zuerst deinen Lebenslauf aus – das Anschreiben wird daraus erstellt.": "Fill in your CV first – the cover letter is written from it.",
    "Gib mindestens einen Begriff ein, der geschwärzt werden soll.": "Enter at least one term to redact.",
    "HEIC-Fotos werden auf dem Server gerade nicht unterstützt.": "HEIC photos are not supported on the server right now.",
    "In dieser Datei wurde kaum Text gefunden. Ist der Lebenslauf ein Foto oder Scan in schlechter Qualität?": "Hardly any text was found in this file. Is the CV a photo or a low-quality scan?",
    "In dieser PDF wurde kaum Text gefunden. Ist sie gescannt? Dann kann sie nicht zusammengefasst werden.": "Hardly any text was found in this PDF. Is it scanned? Then it can’t be summarized.",
    "In dieser PDF wurde kein übersetzbarer Text gefunden. Ist sie gescannt?": "No translatable text was found in this PDF. Is it scanned?",
    "Keine Daten erhalten.": "No data received.",
    "Keine Lebenslauf-Daten erhalten.": "No CV data received.",
    "Nichts gefunden: Keiner der Begriffe kommt als Text in der PDF vor. Bei gescannten Dokumenten zuerst „PDF durchsuchbar machen“ (OCR) verwenden.": "Nothing found: none of the terms appears as text in the PDF. For scanned documents, use “Make PDF searchable (OCR)” first.",
    "PowerPoint-Umwandlung ist auf dem Server noch nicht eingerichtet (Python-Pakete fehlen).": "PowerPoint conversion is not set up on the server yet.",
    "Trage zuerst ein paar Stationen ein – das Profil wird daraus geschrieben.": "Add a few entries first – the profile is written from them.",
    "Upload fehlgeschlagen.": "Upload failed.",
    "Bei der Verarbeitung ist ein Fehler aufgetreten. Bitte versuche es erneut.": "An error occurred during processing. Please try again.",
    "Zu viele Anfragen. Bitte warte ein paar Minuten.": "Too many requests. Please wait a few minutes.",
    "Zu viele Vorschau-Anfragen. Bitte warte kurz.": "Too many preview requests. Please wait a moment.",
    "Zu viele Versuche. Bitte warte 15 Minuten.": "Too many attempts. Please wait 15 minutes.",
    "Du hast die KI-Werkzeuge in der letzten Stunde oft genutzt. Bitte warte etwas und versuche es dann erneut.": "You’ve used the AI tools a lot in the last hour. Please wait a bit and try again.",
    "Du hast die KI in der letzten Stunde oft genutzt. Bitte warte etwas und versuche es dann erneut.": "You’ve used the AI a lot in the last hour. Please wait a bit and try again.",
  },
  fr: {
    "Bitte füge den vollständigen Text der Stellenanzeige ein (Aufgaben und Anforderungen).": "Collez le texte complet de l’offre d’emploi (missions et profil recherché).",
    "Bitte füge den vollständigen Text der Stellenanzeige ein.": "Collez le texte complet de l’offre d’emploi.",
    "Bitte lade zuerst eine Datei hoch.": "Importez d’abord un fichier.",
    "Bitte wähle mindestens zwei PDF-Dateien aus.": "Choisissez au moins deux fichiers PDF.",
    "Das Importieren mit KI ist auf diesem Server gerade nicht eingerichtet.": "L’import par IA n’est pas configuré sur ce serveur pour le moment.",
    "Das Passwort darf höchstens 64 Zeichen lang sein.": "Le mot de passe ne doit pas dépasser 64 caractères.",
    "Das Passwort ist falsch.": "Le mot de passe est incorrect.",
    "Das Passwort muss mindestens 4 Zeichen lang sein.": "Le mot de passe doit contenir au moins 4 caractères.",
    "Der KI-Dienst antwortet gerade nicht. Bitte versuche es in ein paar Minuten noch einmal.": "Le service d’IA ne répond pas pour le moment. Réessayez dans quelques minutes.",
    "Der KI-Dienst ist gerade nicht erreichbar. Bitte versuche es später noch einmal.": "Le service d’IA est injoignable pour le moment. Réessayez plus tard.",
    "Der Lebenslauf ist zu lang für eine Prüfung auf einmal.": "Le CV est trop long pour être vérifié en une fois.",
    "Der Lebenslauf konnte nicht gelesen werden. Bitte versuche es noch einmal.": "Le CV n’a pas pu être lu. Veuillez réessayer.",
    "In dieser Datei wurde kaum Text gefunden. Ist die Rechnung ein unscharfes Foto? Versuche einen Scan oder eine bessere Aufnahme.": "Presque aucun texte n’a été trouvé dans ce fichier. La facture est-elle une photo floue ? Essayez un scan ou une meilleure photo.",
    "Die Rechnung konnte nicht gelesen werden. Bitte versuche es noch einmal.": "La facture n’a pas pu être lue. Veuillez réessayer.",
    "Die Datei konnte nicht gelesen werden. Erwartet wird eine E-Rechnung: XRechnung, Peppol-UBL (XML) oder eine ZUGFeRD-/Factur-X-PDF.": "Le fichier n’a pas pu être lu. Une facture électronique est attendue : XRechnung, UBL Peppol (XML) ou PDF ZUGFeRD/Factur-X.",
    "Die Rechnungsdaten sind unvollständig.": "Les données de la facture sont incomplètes.",
    "Der E-Rechnung-Dienst antwortet gerade nicht. Bitte versuche es gleich noch einmal.": "Le service de facture électronique ne répond pas. Réessayez dans un instant.",
    "Es fehlen noch Angaben.": "Il manque encore des informations.",
    "Bitte prüfe deine Eingaben: Zahlen, Datum und mindestens eine Position mit Bezeichnung und Preis.": "Vérifiez vos saisies : nombres, date et au moins une ligne avec désignation et prix.",
    "Die E-Rechnung konnte nicht erstellt werden. Bitte versuche es noch einmal.": "La facture électronique n’a pas pu être créée. Veuillez réessayer.",
    "Der Prüfdienst antwortet gerade nicht. Bitte versuche es gleich noch einmal.": "Le service de vérification ne répond pas. Réessayez dans un instant.",
    "Der Text ist zu lang für eine Anfrage.": "Le texte est trop long pour une seule requête.",
    "Der Vorschlag war nicht verwendbar. Bitte versuche es noch einmal.": "La proposition n’était pas exploitable. Veuillez réessayer.",
    "Die Datei konnte nicht umgewandelt werden. Ist sie beschädigt?": "Le fichier n’a pas pu être converti. Est-il endommagé ?",
    "Die KI-Antwort war unvollständig. Bitte versuche es noch einmal.": "La réponse de l’IA était incomplète. Veuillez réessayer.",
    "Die KI-Werkzeuge sind auf diesem Server gerade nicht eingerichtet.": "Les outils d’IA ne sont pas configurés sur ce serveur pour le moment.",
    "Die Prüfung ist fehlgeschlagen. Bitte versuche es noch einmal.": "La vérification a échoué. Veuillez réessayer.",
    "Die Texterkennung ist auf dem Server gerade nicht eingerichtet.": "La reconnaissance de texte n’est pas configurée sur le serveur pour le moment.",
    "Die Verarbeitung hat zu lange gedauert. Versuche es mit einer kleineren Datei.": "Le traitement a pris trop de temps. Essayez avec un fichier plus petit.",
    "Die Vorschau ist abgelaufen. Bitte lade die PDF noch einmal hoch.": "L’aperçu a expiré. Importez à nouveau le PDF.",
    "Diese PDF enthält bereits Text – sie ist schon durchsuchbar. Texterkennung ist nur für gescannte Seiten nötig.": "Ce PDF contient déjà du texte – il est déjà cherchable. La reconnaissance de texte ne sert que pour les pages scannées.",
    "Diese PDF enthält sehr viel Text. Bitte teile sie mit „PDF teilen“ in kleinere Teile auf (bis ca. 20 Seiten Fließtext).": "Ce PDF contient beaucoup de texte. Divisez-le avec « Diviser PDF » en parties plus petites (environ 20 pages de texte maximum).",
    "Diese PDF ist passwortgeschützt. Entsperre sie zuerst mit „PDF entsperren“.": "Ce PDF est protégé par mot de passe. Déverrouillez-le d’abord avec « Déverrouiller PDF ».",
    "Diese PDF wurde nicht mit dem Lebenslauf-Generator von PDF Libre erstellt. Bald kannst du auch andere Lebensläufe importieren.": "Ce PDF n’a pas été créé avec le générateur de CV de PDF Libre.",
    "Dieses Werkzeug ist auf dem Server gerade nicht verfügbar.": "Cet outil n’est pas disponible sur le serveur pour le moment.",
    "Dieses Werkzeug ist gerade nicht verfügbar.": "Cet outil n’est pas disponible pour le moment.",
    "Eine der PDFs ist passwortgeschützt. Entsperre sie zuerst mit „PDF entsperren“.": "L’un des PDF est protégé par mot de passe. Déverrouillez-le d’abord avec « Déverrouiller PDF ».",
    "Eines der Bilder konnte nicht gelesen werden.": "L’une des images n’a pas pu être lue.",
    "Es gibt noch keinen Text im Lebenslauf.": "Le CV ne contient pas encore de texte.",
    "Es gibt noch keinen Text zum Prüfen.": "Il n’y a pas encore de texte à vérifier.",
    "Fülle zuerst deinen Lebenslauf aus – das Anschreiben wird daraus erstellt.": "Remplissez d’abord votre CV – la lettre de motivation est rédigée à partir de celui-ci.",
    "Gib mindestens einen Begriff ein, der geschwärzt werden soll.": "Saisissez au moins un terme à caviarder.",
    "HEIC-Fotos werden auf dem Server gerade nicht unterstützt.": "Les photos HEIC ne sont pas prises en charge sur le serveur pour le moment.",
    "In dieser Datei wurde kaum Text gefunden. Ist der Lebenslauf ein Foto oder Scan in schlechter Qualität?": "Presque aucun texte n’a été trouvé dans ce fichier. Le CV est-il une photo ou un scan de mauvaise qualité ?",
    "In dieser PDF wurde kaum Text gefunden. Ist sie gescannt? Dann kann sie nicht zusammengefasst werden.": "Presque aucun texte n’a été trouvé dans ce PDF. Est-il scanné ? Il ne peut alors pas être résumé.",
    "In dieser PDF wurde kein übersetzbarer Text gefunden. Ist sie gescannt?": "Aucun texte à traduire n’a été trouvé dans ce PDF. Est-il scanné ?",
    "Keine Daten erhalten.": "Aucune donnée reçue.",
    "Keine Lebenslauf-Daten erhalten.": "Aucune donnée de CV reçue.",
    "Nichts gefunden: Keiner der Begriffe kommt als Text in der PDF vor. Bei gescannten Dokumenten zuerst „PDF durchsuchbar machen“ (OCR) verwenden.": "Rien trouvé : aucun des termes n’apparaît comme texte dans le PDF. Pour un document scanné, utilisez d’abord « Rendre un PDF cherchable (OCR) ».",
    "PowerPoint-Umwandlung ist auf dem Server noch nicht eingerichtet (Python-Pakete fehlen).": "La conversion PowerPoint n’est pas encore configurée sur le serveur.",
    "Trage zuerst ein paar Stationen ein – das Profil wird daraus geschrieben.": "Ajoutez d’abord quelques expériences – le profil est rédigé à partir de celles-ci.",
    "Upload fehlgeschlagen.": "L’envoi a échoué.",
    "Bei der Verarbeitung ist ein Fehler aufgetreten. Bitte versuche es erneut.": "Une erreur s’est produite pendant le traitement. Veuillez réessayer.",
    "Zu viele Anfragen. Bitte warte ein paar Minuten.": "Trop de requêtes. Patientez quelques minutes.",
    "Zu viele Vorschau-Anfragen. Bitte warte kurz.": "Trop de demandes d’aperçu. Patientez un instant.",
    "Zu viele Versuche. Bitte warte 15 Minuten.": "Trop de tentatives. Patientez 15 minutes.",
    "Du hast die KI-Werkzeuge in der letzten Stunde oft genutzt. Bitte warte etwas und versuche es dann erneut.": "Vous avez beaucoup utilisé les outils d’IA ces dernières heures. Patientez un peu puis réessayez.",
    "Du hast die KI in der letzten Stunde oft genutzt. Bitte warte etwas und versuche es dann erneut.": "Vous avez beaucoup utilisé l’IA ces dernières heures. Patientez un peu puis réessayez.",
  },
};

// Meldungen mit Zahlen oder Namen darin: Muster → Übersetzung ($1, $2 = eingesetzte Werte)
const PATTERNS = [
  [/^Bitte übersetze höchstens (\d+) Seiten auf einmal\. Teile die PDF vorher mit „PDF teilen“\.$/, { en: "Please translate at most $1 pages at once. Split the PDF first with “Split PDF”.", fr: "Traduisez au maximum $1 pages à la fois. Divisez d’abord le PDF avec « Diviser PDF »." }],
  [/^Dateityp (.+) wird hier nicht unterstützt\. Erlaubt: (.+)$/, { en: "File type $1 isn’t supported here. Allowed: $2", fr: "Le type de fichier $1 n’est pas pris en charge ici. Autorisés : $2" }],
  [/^Die Datei ist größer als (\d+) MB\.$/, { en: "The file is larger than $1 MB.", fr: "Le fichier dépasse $1 Mo." }],
  [/^Die PDF hat zu viele Seiten \(höchstens (\d+)\)\. Teile sie zuerst mit „PDF teilen“\.$/, { en: "The PDF has too many pages (at most $1). Split it first with “Split PDF”.", fr: "Le PDF a trop de pages ($1 au maximum). Divisez-le d’abord avec « Diviser PDF »." }],
  [/^Maximal (\d+) Dateien auf einmal\.$/, { en: "At most $1 files at once.", fr: "$1 fichiers au maximum à la fois." }],
];

/** Endungen der Download-Dateinamen, z. B. „Vertrag_komprimiert.pdf“ */
const SUFFIX = {
  en: { _komprimiert: "_compressed", _zusammengefuegt: "_merged", _zusammengefuegt_komprimiert: "_merged_compressed", _geschuetzt: "_protected", _entsperrt: "_unlocked", _durchsuchbar: "_searchable", _geschwaerzt: "_redacted", Bewerbung: "Application", Lebenslauf: "CV", Anschreiben: "Cover_letter" },
  fr: { _komprimiert: "_compresse", _zusammengefuegt: "_fusionne", _zusammengefuegt_komprimiert: "_fusionne_compresse", _geschuetzt: "_protege", _entsperrt: "_deverrouille", _durchsuchbar: "_cherchable", _geschwaerzt: "_caviarde", Bewerbung: "Candidature", Lebenslauf: "CV", Anschreiben: "Lettre_de_motivation" },
};

const LANGS = ["en", "fr"];
function langOf(req) {
  const h = String(req.get("x-pl-lang") || "").toLowerCase();
  if (LANGS.includes(h)) return h;
  try {
    const p = new URL(req.get("referer") || "", "http://x").pathname;
    const m = p.match(/^\/(?:_free\/)?(en|fr)\//);
    if (m) return m[1];
  } catch {
    /* kein gültiger Referer */
  }
  return "de";
}

function tr(lang, msg) {
  if (lang === "de" || typeof msg !== "string") return msg;
  const d = MSG[lang] || {};
  if (d[msg]) return d[msg];
  for (const [re, t] of PATTERNS) if (re.test(msg)) return msg.replace(re, t[lang]);
  return msg;
}

/** Download-Namen übersetzen: deutsche Endung bzw. deutsches Wort am Anfang ersetzen */
function fileName(lang, name) {
  if (lang === "de") return name;
  const map = SUFFIX[lang];
  const ext = name.match(/\.[a-z0-9]+$/i)?.[0] || "";
  let base = name.slice(0, name.length - ext.length);
  for (const k of Object.keys(map).sort((a, b) => b.length - a.length)) {
    if (k.startsWith("_") && base.endsWith(k)) { base = base.slice(0, -k.length) + map[k]; break; }
    if (!k.startsWith("_") && (base === k || base.startsWith(k + "_"))) { base = map[k] + base.slice(k.length); break; }
  }
  return base + ext;
}

/** Middleware: Sprache merken, JSON-Fehler übersetzen */
function middleware(req, res, next) {
  req.lang = langOf(req);
  if (req.lang !== "de") {
    const json = res.json.bind(res);
    res.json = (body) => {
      if (body && typeof body.error === "string") body = { ...body, error: tr(req.lang, body.error) };
      return json(body);
    };
  }
  next();
}

module.exports = { langOf, tr, fileName, middleware };

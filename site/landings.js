/**
 * Ratgeber-Seiten für Suchanfragen rund um ein Werkzeug (SEO).
 * Jede Seite nutzt das Werkzeug von `base` (gleiche Oberfläche, gleicher Server-Endpunkt),
 * hat aber eigenen Titel, eigene Überschrift, eigene Texte und Fragen – zugeschnitten auf eine Suchanfrage.
 *
 *   base      Werkzeug, dessen Oberfläche verwendet wird
 *   defaults  vorausgewählte Optionen, z. B. { maxMb: "2" }
 *   guide     Linktext im Abschnitt „Ratgeber“ auf der Werkzeugseite
 */
const landings = [
  // ------------------------------------------------------------------ E-RECHNUNG
  {
    slug: "pdf-in-e-rechnung-umwandeln",
    base: "e-rechnung-erstellen",
    guide: "PDF-Rechnung in E-Rechnung umwandeln",
    name: "PDF in E-Rechnung umwandeln",
    title: "PDF in E-Rechnung umwandeln – ZUGFeRD & XRechnung aus PDF, kostenlos | PDF Libre",
    description: "PDF-Rechnung in eine E-Rechnung umwandeln: PDF, Scan oder Foto hochladen, Daten prüfen und bestätigen, ZUGFeRD-PDF oder XRechnung herunterladen. Mit Summenprüfung. Kostenlos, ohne Anmeldung.",
    h1: "PDF-Rechnung in E-Rechnung umwandeln",
    lead: "Aus deiner bisherigen Rechnung – als PDF, Scan oder Handyfoto – wird eine gültige E-Rechnung nach EN 16931. Du siehst vorher alle erkannten Daten und bestätigst sie.",
    steps: [
      ["Rechnung hochladen", "Klicke oben auf „Rechnung hochladen“ und wähle die PDF, den Scan oder ein Foto der Rechnung."],
      ["Daten bestätigen", "Du siehst Absender, Empfänger, Positionen, Steuer und Summe als Vorschau. Unsichere Stellen sind orange markiert – korrigiere sie bei Bedarf."],
      ["E-Rechnung herunterladen", "Nach „Alles korrekt“ bekommst du die ZUGFeRD-PDF oder die XRechnung (XML) und siehst sie vor dem Download."],
    ],
    article: [
      { h: "Warum eine normale PDF keine E-Rechnung ist", p: ["Eine PDF aus Word oder Excel enthält die Rechnungsdaten nur als Text auf einer Seite. Eine E-Rechnung enthält sie zusätzlich strukturiert als XML nach der Norm EN 16931 – so kann die Buchhaltungssoftware des Empfängers Betrag, Steuer, IBAN und Rechnungsnummer automatisch übernehmen. Ab 2027 (mehr als 800.000 € Vorjahresumsatz) bzw. 2028 müssen Unternehmen Rechnungen an andere Unternehmen in Deutschland als E-Rechnung ausstellen."] },
      { h: "So funktioniert die Umwandlung", p: ["Der Text deiner Rechnung wird ausgelesen – bei Scans und Fotos per Texterkennung. Eine KI ordnet die Angaben zu: Wer stellt die Rechnung, wer bekommt sie, welche Positionen, welche Steuersätze. Danach prüfen wir selbst nach: Ergeben die Positionen die Summe, die auf deiner Rechnung steht? Steht die Rechnungsnummer wirklich im Dokument? Ist die IBAN gültig?", "Alles, was nicht eindeutig ist, wird markiert. Erzeugt wird die E-Rechnung erst nach deiner Bestätigung – die Verantwortung für den Inhalt bleibt bei dir, aber du musst nichts abtippen."] },
      { h: "Tipps für ein gutes Ergebnis", p: ["Am besten funktionieren PDFs, die direkt aus einem Programm erzeugt wurden. Bei Fotos: Rechnung flach hinlegen, gutes Licht, ganze Seite im Bild. Prüfe auf der Bestätigungsseite besonders die Steuersätze und die Einzelpreise – vor allem, wenn deine Rechnung Bruttopreise enthält."] },
    ],
    faq: [
      ["Kann ich auch ein Foto einer Rechnung umwandeln?", "Ja. JPG, PNG oder HEIC vom Handy werden per Texterkennung gelesen. Prüfe die Zahlen dann besonders genau."],
      ["Wird meine Rechnung gespeichert?", "Nein. Der Text wird nur zum Auslesen an unseren Server und den KI-Dienst geschickt und danach nicht gespeichert."],
      ["Was, wenn etwas falsch erkannt wurde?", "Klicke auf „Angaben korrigieren“ und ändere die Felder. Die Vorschau zeigt dir sofort das Ergebnis."],
      ["ZUGFeRD oder XRechnung?", "Für Geschäftskunden ZUGFeRD (PDF mit eingebetteten Daten), für Behörden die XRechnung."],
    ],
    related: ["e-rechnung-erstellen", "e-rechnung-pruefen", "xrechnung-anzeigen", "mahnung-schreiben"],
  },
  // ------------------------------------------------------------------ INTERNATIONAL (Frankreich, Belgien)
  {
    slug: "factur-x-oeffnen",
    base: "xrechnung-anzeigen",
    guide: "Factur-X-Rechnung öffnen (Frankreich)",
    name: "Factur-X öffnen",
    title: "Factur-X öffnen – französische E-Rechnung lesen und prüfen, kostenlos | PDF Libre",
    description: "Factur-X-Rechnung aus Frankreich öffnen: eingebettete Rechnungsdaten auslesen, Summen und Steuer prüfen, als PDF speichern. Auf Deutsch, Englisch oder Französisch. Kostenlos.",
    h1: "Factur-X-Rechnung öffnen und prüfen",
    lead: "Factur-X ist das französische Gegenstück zu ZUGFeRD: eine PDF mit eingebetteten Rechnungsdaten. Hier siehst du genau die Daten, die die Buchhaltung verarbeitet – und ob die Beträge stimmen.",
    steps: [["Factur-X-PDF auswählen", "Die PDF, die du von einem Lieferanten aus Frankreich bekommen hast."], ["Daten ansehen", "Rechnungssteller, Empfänger, Positionen, Steuer und Zahlbetrag erscheinen auf Deutsch – nachgerechnet."], ["Speichern", "Mit „Als PDF speichern“ legst du die lesbare Fassung ab. Aufbewahren musst du das Original."]],
    article: [
      { h: "Factur-X und ZUGFeRD – fast dasselbe", p: ["Factur-X wurde von Frankreich und Deutschland gemeinsam entwickelt und ist technisch mit ZUGFeRD 2.x identisch. Deshalb kannst du eine Factur-X-Rechnung auch in Deutschland problemlos verbuchen. Seit dem 1. September 2026 müssen alle Unternehmen in Frankreich E-Rechnungen empfangen können; viele französische Lieferanten verschicken jetzt Factur-X."] },
      { h: "Warum die eingebetteten Daten zählen", p: ["Die sichtbare PDF und die eingebetteten XML-Daten sollten übereinstimmen – tun es aber nicht immer. Dieses Werkzeug zeigt die eingebetteten Daten und rechnet Summen und Steuer nach, damit du Fehler vor dem Bezahlen bemerkst."] }
    ],
    faq: [["Kann ich Factur-X in Deutschland verwenden?", "Ja. Factur-X entspricht ZUGFeRD 2.x und der Norm EN 16931 und ist damit eine gültige E-Rechnung."], ["Wird die Rechnung gespeichert?", "Nein. Sie wird nur zum Auslesen verarbeitet und danach gelöscht."]],
    related: ["xrechnung-anzeigen", "e-rechnung-pruefen", "e-rechnung-erstellen", "peppol-rechnung-oeffnen"],
  },
  {
    slug: "peppol-rechnung-oeffnen",
    base: "xrechnung-anzeigen",
    guide: "Peppol-Rechnung (UBL) öffnen – z. B. aus Belgien",
    name: "Peppol-Rechnung öffnen",
    title: "Peppol-Rechnung öffnen – UBL-XML lesbar anzeigen, kostenlos | PDF Libre",
    description: "Peppol-Rechnung (UBL-XML, Peppol BIS Billing 3.0) online öffnen: lesbar anzeigen, Summen und Steuer prüfen, als PDF speichern. Für Rechnungen aus Belgien und anderen Peppol-Ländern. Kostenlos.",
    h1: "Peppol-Rechnung (UBL) öffnen",
    lead: "Eine XML-Datei von einem Lieferanten aus Belgien oder einem anderen Peppol-Land? Lade sie hoch und lies sie als normale Rechnung – mit automatischer Prüfung.",
    steps: [["XML-Datei auswählen", "Die Peppol-Rechnung im UBL-Format (.xml)."], ["Rechnung ansehen", "Alle Angaben erscheinen übersichtlich, Summen und Steuer werden nachgerechnet."], ["Als PDF speichern", "Für deine Ablage oder zum Weiterleiten an die Buchhaltung."]],
    article: [
      { h: "Was ist eine Peppol-Rechnung?", p: ["Peppol ist ein europäisches Netzwerk für den Austausch von E-Rechnungen. Die Rechnungen sind XML-Dateien im UBL-Format nach der Norm EN 16931 (Peppol BIS Billing 3.0). In Belgien ist die E-Rechnung über Peppol seit dem 1. Januar 2026 zwischen Unternehmen Pflicht – auch für kleine Selbständige."] },
      { h: "XML lesen ohne Spezialsoftware", p: ["Öffnest du eine UBL-Datei im Browser, siehst du nur Code. Dieses Werkzeug macht daraus eine lesbare Rechnung und zeigt, ob Positionen, Steuer und Zahlbetrag zusammenpassen."] }
    ],
    faq: [["Brauche ich einen Peppol-Zugang?", "Zum Lesen nicht. Zum Senden und Empfangen über das Peppol-Netz brauchst du einen Anbieter (Access Point)."], ["Ist die PDF eine gültige Rechnung?", "Nein, sie ist eine lesbare Darstellung. Maßgeblich ist die XML-Datei."]],
    related: ["xrechnung-anzeigen", "factur-x-oeffnen", "e-rechnung-pruefen", "e-rechnung-erstellen"],
  },
  {
    slug: "cerfa-ausfuellen",
    base: "pdf-formular-ausfuellen",
    guide: "CERFA-Formular online ausfüllen (Frankreich)",
    name: "CERFA ausfüllen",
    title: "CERFA online ausfüllen – französische Formulare im Browser ausfüllen | PDF Libre",
    description: "Französische CERFA-Formulare online ausfüllen: ausfüllbare Felder direkt im Browser, nicht ausfüllbare Fassungen werden automatisch erkannt. Ohne Adobe, ohne Upload, kostenlos.",
    h1: "CERFA-Formular online ausfüllen",
    lead: "Französische Behördenformulare (CERFA) lassen sich im Browser oft nicht ausfüllen. Hier schon – auch die „statische“ Fassung, die eigentlich nur zum Ausdrucken gedacht ist.",
    steps: [["CERFA öffnen", "Lade das Formular als PDF. Zeigt es nur „Please wait…“, lade die statische Version von service-public.fr."], ["Felder ausfüllen", "Vorhandene Felder werden angezeigt; bei der statischen Version werden Linien und Kästchen automatisch zu Feldern."], ["Speichern", "Ausgefüllte PDF herunterladen, ausdrucken oder per E-Mail schicken."]],
    article: [
      { h: "Warum CERFA-Formulare im Browser nicht funktionieren", p: ["Viele CERFA-Formulare sind „dynamische“ XFA-Formulare. Die PDF-Anzeige von Chrome, Edge, Safari und auch Adobe Reader auf dem iPhone kann XFA nicht darstellen – man sieht nur einen Hinweis, man brauche eine neuere Adobe-Version. Die statische Fassung lässt sich zwar öffnen, hat aber keine Felder."] },
      { h: "So geht es trotzdem", p: ["Öffne hier die statische Fassung: PDF Libre erkennt Linien und Kästchen und macht daraus Eingabefelder. Alles passiert im Browser, deine Angaben werden nicht hochgeladen."] }
    ],
    faq: [["Akzeptiert die Behörde das ausgefüllte Formular?", "Ja, solange der Inhalt unverändert ist und du nur die Felder ausfüllst. Unterschreibe es danach wie gewohnt."], ["Wird mein Formular hochgeladen?", "Nein. Ausfüllen und Speichern passieren in deinem Browser."]],
    related: ["pdf-formular-ausfuellen", "pdf-ausfuellbar-machen", "sign", "merge"],
  },
  // ------------------------------------------------------------------ BRIEFE
  {
    slug: "kuendigung-schreiben",
    base: "musterbrief",
    defaults: { type: "kuendigung" },
    guide: "Kündigung schreiben (Handy, Fitnessstudio, Abo …)",
    name: "Kündigung schreiben",
    title: "Kündigung schreiben – Vorlage für Handyvertrag, Fitnessstudio & Abo als PDF | PDF Libre",
    description: "Kündigung online schreiben: Vorlage für Handyvertrag, Internet, Strom, Fitnessstudio, Versicherung oder Abo. Fristgerecht zum nächstmöglichen Termin, mit Bitte um Bestätigung. Kostenlos als PDF.",
    h1: "Kündigung schreiben – kostenlose Vorlage",
    lead: "Ob Handyvertrag, Fitnessstudio, Streaming-Abo oder Versicherung: Trage Anbieter und Vertragsnummer ein und lade eine eindeutige Kündigung als PDF herunter.",
    steps: [["Angaben eintragen", "Anbieter, Vertrag und Kunden- oder Vertragsnummer. Lässt du das Datum leer, wird „zum nächstmöglichen Zeitpunkt“ gekündigt."], ["Vorschau prüfen", "Rechts siehst du den fertigen Brief. Den Text kannst du frei anpassen."], ["Herunterladen und verschicken", "PDF ausdrucken, unterschreiben und am besten per Einschreiben verschicken."]],
    article: [
      { h: "Was in eine Kündigung gehört", p: ["Eine wirksame Kündigung braucht nicht viel: deinen Namen und deine Anschrift, die Kunden- oder Vertragsnummer, die eindeutige Erklärung „hiermit kündige ich“ und den Zeitpunkt. Die Formulierung „fristgerecht zum nächstmöglichen Zeitpunkt“ sorgt dafür, dass die Kündigung auch dann gilt, wenn du dich beim Datum verrechnet hast.", "Sinnvoll sind außerdem die Bitte um eine schriftliche Bestätigung mit dem genauen Vertragsende und der Widerruf des Lastschriftmandats – so wird nach dem Ende nichts mehr abgebucht."] },
      { h: "Kündigungsfristen bei Handy, Internet und Fitnessstudio", p: ["Für Verträge, die ab dem 1. März 2022 geschlossen wurden, gilt in vielen Fällen: Nach der Mindestlaufzeit verlängern sie sich nur noch auf unbestimmte Zeit und sind dann mit einer Frist von einem Monat kündbar. Das betrifft zum Beispiel Handy- und Internetverträge, Fitnessstudios und Zeitschriften-Abos. Die genaue Frist steht in deinem Vertrag oder den AGB."] },
      { h: "Brief, E-Mail oder Kündigungsbutton?", p: ["Die meisten Verbraucherverträge kannst du in Textform kündigen, also auch per E-Mail. Online-Anbieter müssen zudem einen Kündigungsbutton auf ihrer Website haben. Ein Brief per Einschreiben hat den Vorteil, dass du den Zugang sicher nachweisen kannst – gerade kurz vor Ablauf der Frist."] }
    ],
    faq: [["Muss ich einen Grund für die Kündigung angeben?", "Nein. Bei einer ordentlichen Kündigung ist kein Grund nötig."], ["Was bedeutet „hilfsweise zum nächstmöglichen Zeitpunkt“?", "Ist das von dir genannte Datum zu früh, gilt die Kündigung automatisch zum nächsten möglichen Termin – sie ist also nicht unwirksam."], ["Wie beweise ich, dass die Kündigung angekommen ist?", "Am sichersten mit Einwurf-Einschreiben oder per Fax mit Sendebericht. Bewahre den Beleg bis zum Vertragsende auf."]],
    related: ["wohnung-kuendigen", "arbeitsvertrag-kuendigen", "musterbrief", "sign"],
  },
  {
    slug: "wohnung-kuendigen",
    base: "musterbrief",
    defaults: { type: "wohnung" },
    guide: "Wohnung kündigen (Mieter)",
    name: "Wohnung kündigen",
    title: "Wohnung kündigen – Vorlage für Mieter mit Fristberechnung, als PDF | PDF Libre",
    description: "Mietwohnung kündigen: Kündigungsschreiben für Mieter mit automatisch berechneter Frist (3 Monate), Wohnungsübergabe und Kaution. Kostenlos als PDF zum Unterschreiben.",
    h1: "Wohnung kündigen – Vorlage für Mieter",
    lead: "Das Kündigungsdatum wird nach der gesetzlichen Frist berechnet, alle Mieter bekommen eine Unterschriftszeile – du musst nur noch ausdrucken und unterschreiben.",
    steps: [["Angaben eintragen", "Anschrift der Wohnung, weitere Mieter laut Mietvertrag und auf Wunsch deine IBAN für die Kaution. Das Kündigungsdatum wird vorgeschlagen."], ["Vorschau prüfen", "Rechts siehst du den fertigen Brief. Den Text kannst du frei anpassen."], ["Herunterladen und verschicken", "PDF ausdrucken, unterschreiben und am besten per Einschreiben verschicken."]],
    article: [
      { h: "Kündigungsfrist für Mieter: drei Monate", p: ["Als Mieter kannst du eine unbefristete Wohnung mit einer Frist von drei Monaten kündigen (§ 573c BGB), ohne Grund. Entscheidend ist, wann die Kündigung beim Vermieter ankommt: Erreicht sie ihn spätestens am dritten Werktag eines Monats, zählt dieser Monat schon mit. Beispiel: Kommt die Kündigung bis zum 3. Werktag im März an, endet das Mietverhältnis am 31. Mai.", "Das Werkzeug schlägt das Datum nach dieser Regel vor (Feiertage sind nicht berücksichtigt). Hast du einen Zeitmietvertrag oder einen Kündigungsverzicht vereinbart, gelten andere Regeln – schau in deinen Mietvertrag."] },
      { h: "Alle Mieter müssen unterschreiben", p: ["Die Kündigung muss schriftlich erfolgen und eigenhändig unterschrieben sein – E-Mail, Fax oder WhatsApp reichen nicht. Haben mehrere Personen den Mietvertrag unterschrieben, zum Beispiel Paare oder eine WG mit gemeinsamem Vertrag, müssen alle kündigen und unterschreiben. Trage dafür die weiteren Mieter ein, das Schreiben bekommt dann automatisch für jeden eine Unterschriftszeile."] },
      { h: "Übergabe und Kaution", p: ["Im Brief kannst du gleich um einen Termin für die Wohnungsübergabe bitten und eine Kontoverbindung für die Rückzahlung der Kaution angeben. Der Vermieter darf die Kaution erst nach einer angemessenen Prüfzeit abrechnen – oft einige Monate, wenn noch eine Nebenkostenabrechnung aussteht."] }
    ],
    faq: [["Kann ich die Wohnung per E-Mail kündigen?", "Nein. Die Kündigung eines Wohnraummietvertrags braucht die Schriftform mit eigenhändiger Unterschrift (§ 568 BGB)."], ["Zählt der Samstag als Werktag?", "Für die Kündigungsfrist im Mietrecht zählt der Samstag nach der Rechtsprechung des BGH nicht als Werktag. Das Werkzeug zählt deshalb nur Montag bis Freitag."], ["Wie verschicke ich die Kündigung am besten?", "Per Einwurf-Einschreiben oder persönlich mit einem Zeugen übergeben, der den Inhalt kennt – so kannst du den rechtzeitigen Zugang beweisen."]],
    related: ["kuendigung-schreiben", "musterbrief", "sign", "pdf-formular-ausfuellen"],
  },
  {
    slug: "arbeitsvertrag-kuendigen",
    base: "musterbrief",
    defaults: { type: "arbeit" },
    guide: "Arbeitsvertrag kündigen (Arbeitnehmer)",
    name: "Arbeitsvertrag kündigen",
    title: "Arbeitsvertrag kündigen – Kündigungsschreiben für Arbeitnehmer als PDF | PDF Libre",
    description: "Kündigungsschreiben für Arbeitnehmer: Arbeitsvertrag fristgerecht kündigen, mit Bitte um Arbeitszeugnis und Resturlaub. Frist wird vorgeschlagen. Kostenlos als PDF.",
    h1: "Arbeitsvertrag kündigen – Vorlage für Arbeitnehmer",
    lead: "Ein klares, höfliches Kündigungsschreiben mit Fristvorschlag, Bitte um ein qualifiziertes Arbeitszeugnis und auf Wunsch einem Dank an das Team.",
    steps: [["Angaben eintragen", "Deine Tätigkeit und das Kündigungsdatum (wird nach der gesetzlichen Frist vorgeschlagen). Wähle, ob Arbeitszeugnis und Resturlaub erwähnt werden."], ["Vorschau prüfen", "Rechts siehst du den fertigen Brief. Den Text kannst du frei anpassen."], ["Herunterladen und verschicken", "PDF ausdrucken, unterschreiben und am besten per Einschreiben verschicken."]],
    article: [
      { h: "Welche Kündigungsfrist gilt?", p: ["Für Arbeitnehmer gilt gesetzlich eine Grundfrist von vier Wochen zum 15. oder zum Ende eines Kalendermonats (§ 622 Abs. 1 BGB) – auch nach vielen Jahren im Betrieb. Die längeren Fristen nach Betriebszugehörigkeit gelten nur für Kündigungen durch den Arbeitgeber, außer der Arbeitsvertrag sieht etwas anderes vor. In der Probezeit sind es meist zwei Wochen.", "Arbeits- und Tarifverträge können längere Fristen festlegen. Das Werkzeug schlägt die gesetzliche Grundfrist vor; prüfe deinen Vertrag und passe das Datum bei Bedarf an."] },
      { h: "Schriftform: ausdrucken und unterschreiben", p: ["Eine Kündigung des Arbeitsverhältnisses ist nur in Schriftform wirksam (§ 623 BGB). Eine E-Mail, eine eingescannte Unterschrift oder eine Nachricht im Chat reichen nicht. Drucke das PDF aus, unterschreibe eigenhändig und übergib es persönlich (am besten gegen Empfangsbestätigung) oder schicke es per Einschreiben."] },
      { h: "Danach: Zeugnis und Arbeitsagentur", p: ["Du hast Anspruch auf ein qualifiziertes Arbeitszeugnis – es ist sinnvoll, es gleich in der Kündigung anzufordern. Wenn du noch keine neue Stelle hast, melde dich bei der Agentur für Arbeit arbeitsuchend: spätestens drei Monate vor dem Ende, oder innerhalb von drei Tagen, wenn die Frist kürzer ist."] }
    ],
    faq: [["Muss ich meine Kündigung begründen?", "Nein, als Arbeitnehmer musst du bei einer ordentlichen Kündigung keinen Grund nennen."], ["Kann ich per E-Mail kündigen?", "Nein. Die Kündigung muss eigenhändig unterschrieben auf Papier vorliegen."], ["Was passiert mit meinem Resturlaub?", "Resturlaub wird in der Regel bis zum Ende gewährt; ist das nicht möglich, muss er ausgezahlt werden. Du kannst das im Schreiben ansprechen."]],
    related: ["kuendigung-schreiben", "lebenslauf-erstellen", "anschreiben-erstellen", "musterbrief"],
  },
  {
    slug: "widerspruch-schreiben",
    base: "musterbrief",
    defaults: { type: "widerspruch" },
    guide: "Widerspruch gegen einen Bescheid",
    name: "Widerspruch schreiben",
    title: "Widerspruch schreiben – Vorlage gegen Bescheid (Jobcenter, Wohngeld, Steuer) | PDF Libre",
    description: "Widerspruch gegen einen Bescheid schreiben: Vorlage für Jobcenter, Wohngeld, BAföG, Krankenkasse und andere Behörden. Fristwahrend, Begründung kann nachgereicht werden. Kostenlos als PDF.",
    h1: "Widerspruch gegen einen Bescheid schreiben",
    lead: "Fristwahrend Widerspruch einlegen – auch ohne Begründung. Aktenzeichen und Datum des Bescheids eintragen, PDF herunterladen, unterschreiben, abschicken.",
    steps: [["Angaben eintragen", "Welcher Bescheid, sein Datum und das Aktenzeichen. Eine Begründung kannst du gleich schreiben oder nachreichen."], ["Vorschau prüfen", "Rechts siehst du den fertigen Brief. Den Text kannst du frei anpassen."], ["Herunterladen und verschicken", "PDF ausdrucken, unterschreiben und am besten per Einschreiben verschicken."]],
    article: [
      { h: "Die Frist ist das Wichtigste", p: ["Gegen einen Bescheid einer Behörde – zum Beispiel vom Jobcenter, der Wohngeldstelle, dem BAföG-Amt, der Krankenkasse oder der Familienkasse – kannst du in der Regel innerhalb eines Monats nach Bekanntgabe Widerspruch einlegen. Die genaue Frist und die Stelle, an die du den Widerspruch schicken musst, stehen in der Rechtsbehelfsbelehrung am Ende des Bescheids.", "Gegen Steuerbescheide heißt das Rechtsmittel übrigens „Einspruch“ – die Vorlage kannst du dafür anpassen, indem du den Text änderst."] },
      { h: "Erst Widerspruch einlegen, dann begründen", p: ["Um die Frist zu wahren, reicht ein kurzer Widerspruch ohne Begründung. Du kannst schreiben, dass du die Begründung nachreichst, und gleichzeitig Akteneinsicht beantragen. So hast du Zeit, den Bescheid in Ruhe zu prüfen oder dir Hilfe zu holen – etwa bei einer Beratungsstelle, einem Sozialverband oder der Verbraucherzentrale."] },
      { h: "So verschickst du den Widerspruch", p: ["Der Widerspruch muss schriftlich (unterschrieben) oder zur Niederschrift bei der Behörde eingelegt werden. Schicke ihn per Post, am besten per Einschreiben, oder gib ihn persönlich ab und lass dir den Eingang auf einer Kopie bestätigen."] }
    ],
    faq: [["Muss der Widerspruch begründet werden?", "Für die Frist nicht. Eine Begründung erhöht aber die Chancen und kann nachgereicht werden."], ["Kann ich per E-Mail Widerspruch einlegen?", "Eine einfache E-Mail reicht meist nicht. Nutze den Brief mit Unterschrift oder – falls die Behörde es anbietet – ein Online-Formular mit sicherer Anmeldung."], ["Was ist, wenn die Frist abgelaufen ist?", "Dann ist der Bescheid meist bestandskräftig. Bei Sozialleistungen gibt es aber oft einen Überprüfungsantrag (§ 44 SGB X) – lass dich dazu beraten."]],
    related: ["musterbrief", "sign", "pdf-formular-ausfuellen", "merge"],
  },
  {
    slug: "mahnung-schreiben",
    base: "musterbrief",
    defaults: { type: "mahnung" },
    guide: "Mahnung schreiben (Zahlungserinnerung)",
    name: "Mahnung schreiben",
    title: "Mahnung schreiben – Vorlage für Zahlungserinnerung, Mahnung & letzte Mahnung | PDF Libre",
    description: "Mahnung online schreiben: Zahlungserinnerung, 1. Mahnung oder letzte Mahnung mit Rechnungsnummer, Betrag, Frist und IBAN. Kostenlos als PDF – für Freelancer, Vermieter und kleine Betriebe.",
    h1: "Mahnung schreiben – Vorlage in drei Stufen",
    lead: "Vom freundlichen Hinweis bis zur letzten Mahnung: Rechnungsdaten eintragen, Stufe wählen, PDF herunterladen. Die Zahlungsfrist wird vorgeschlagen.",
    steps: [["Angaben eintragen", "Stufe (Zahlungserinnerung, Mahnung, letzte Mahnung), Rechnungsnummer, Datum, offener Betrag und deine IBAN."], ["Vorschau prüfen", "Rechts siehst du den fertigen Brief. Den Text kannst du frei anpassen."], ["Herunterladen und verschicken", "PDF ausdrucken, unterschreiben und am besten per Einschreiben verschicken."]],
    article: [
      { h: "Zahlungserinnerung, Mahnung, letzte Mahnung", p: ["Üblich sind drei Stufen: Zuerst eine freundliche Zahlungserinnerung („sicher ist es Ihrer Aufmerksamkeit entgangen“), dann eine Mahnung mit neuer Frist und zum Schluss eine letzte Mahnung, in der du rechtliche Schritte wie das gerichtliche Mahnverfahren ankündigst. Gesetzlich vorgeschrieben ist diese Reihenfolge nicht – sie hat sich aber bewährt und hält die Kundenbeziehung freundlich."] },
      { h: "Wann ist der Kunde in Verzug?", p: ["Steht auf der Rechnung ein konkretes Zahlungsdatum, ist der Kunde ab dem Tag danach im Verzug. Fehlt ein Datum, tritt Verzug bei Unternehmen spätestens 30 Tage nach Zugang der Rechnung ein, bei Verbrauchern nur, wenn auf der Rechnung auf diese Folge hingewiesen wurde – sonst durch die erste Mahnung. Ab Verzug kannst du Verzugszinsen verlangen; gegenüber Unternehmen zusätzlich eine Pauschale von 40 €."] },
      { h: "Und wenn trotzdem nicht gezahlt wird?", p: ["Nach der letzten Mahnung kannst du online einen gerichtlichen Mahnbescheid beantragen (online-mahnantrag.de). Das ist günstig und geht ohne Anwalt. Bei Geschäftskunden lohnt sich außerdem ein Blick auf die E-Rechnung: Rechnungen, die direkt in der Buchhaltung des Kunden landen, werden oft schneller bezahlt."] }
    ],
    faq: [["Wie lang sollte die Zahlungsfrist sein?", "Üblich sind 7 bis 14 Tage. Das Werkzeug schlägt 10 Tage vor."], ["Darf ich Mahngebühren verlangen?", "Ab Verzug darfst du den tatsächlichen Schaden verlangen, z. B. Porto. Pauschale Mahngebühren sind nur in angemessener Höhe zulässig; gegenüber Unternehmen gibt es die gesetzliche Pauschale von 40 €."], ["Kann ich die Mahnung per E-Mail schicken?", "Ja, eine Mahnung ist formfrei. Ein Brief oder PDF-Anhang wirkt aber verbindlicher und lässt sich besser nachweisen."]],
    related: ["e-rechnung-erstellen", "musterbrief", "e-rechnung-pruefen", "sign"],
  },
  {
    slug: "widerruf-schreiben",
    base: "musterbrief",
    defaults: { type: "widerruf" },
    guide: "Widerruf einer Online-Bestellung",
    name: "Widerruf schreiben",
    title: "Widerruf schreiben – Muster-Widerrufsformular für Online-Bestellungen als PDF | PDF Libre",
    description: "Widerruf einer Online-Bestellung schreiben: Vorlage nach dem gesetzlichen Muster-Widerrufsformular mit Bestellnummer, Bestell- und Lieferdatum und Bitte um Erstattung. Kostenlos als PDF.",
    h1: "Widerruf einer Online-Bestellung schreiben",
    lead: "Ware zurückschicken und Geld zurück: Bestellnummer und Artikel eintragen, PDF herunterladen und per Post oder als Anhang an den Händler schicken.",
    steps: [["Angaben eintragen", "Bestellnummer, Bestell- und Lieferdatum und die Artikel, die du zurückgeben möchtest."], ["Vorschau prüfen", "Rechts siehst du den fertigen Brief. Den Text kannst du frei anpassen."], ["Herunterladen und verschicken", "PDF ausdrucken, unterschreiben und am besten per Einschreiben verschicken."]],
    article: [
      { h: "14 Tage Widerrufsrecht", p: ["Bei Käufen im Internet, per Telefon oder Katalog hast du als Verbraucher ein Widerrufsrecht von 14 Tagen. Die Frist beginnt in der Regel mit Erhalt der Ware. Hat der Händler nicht richtig über das Widerrufsrecht belehrt, verlängert sich die Frist auf bis zu zwölf Monate und 14 Tage.", "Ausnahmen gibt es zum Beispiel bei individuell angefertigten Waren, schnell verderblichen Lebensmitteln oder entsiegelter Software."] },
      { h: "Den Widerruf ausdrücklich erklären", p: ["Die Ware einfach zurückzuschicken reicht nicht immer – der Widerruf muss eindeutig erklärt werden. Die Vorlage orientiert sich am gesetzlichen Muster-Widerrufsformular und enthält alle wichtigen Angaben: Bestellung, Datum, Artikel, Name und Anschrift."] },
      { h: "Erstattung", p: ["Nach dem Widerruf muss der Händler den Kaufpreis und die Kosten für den Standardversand innerhalb von 14 Tagen erstatten, in der Regel über dasselbe Zahlungsmittel. Er darf die Zahlung zurückhalten, bis die Ware wieder bei ihm ist oder du die Rücksendung nachgewiesen hast."] }
    ],
    faq: [["Muss ich den Widerruf begründen?", "Nein, ein Grund ist nicht nötig."], ["Reicht eine E-Mail?", "Ja, der Widerruf ist formfrei. Du kannst das PDF auch als Anhang per E-Mail schicken."], ["Wer zahlt die Rücksendung?", "Das hängt von den Bedingungen des Händlers ab. Viele übernehmen die Kosten freiwillig; sonst trägst du sie, wenn der Händler vorher darauf hingewiesen hat."]],
    related: ["musterbrief", "kuendigung-schreiben", "sign", "merge"],
  },
  // ------------------------------------------------------------------ FORMULARE
  {
    slug: "pdf-ausfuellbar-machen",
    base: "pdf-formular-ausfuellen",
    guide: "PDF ausfüllbar machen (auch gescannte Formulare)",
    name: "PDF ausfüllbar machen",
    title: "PDF ausfüllbar machen – Formularfelder automatisch erkennen, kostenlos | PDF Libre",
    description:
      "PDF ausfüllbar machen: Linien, Kästchen und Tabellen in gescannten oder flachen Formularen werden automatisch zu Formularfeldern. Online, kostenlos, ohne Adobe Acrobat und ohne Upload.",
    h1: "PDF ausfüllbar machen",
    lead: "Aus einem gedruckten, eingescannten oder „flachen“ Formular wird ein echtes ausfüllbares PDF: Schreiblinien, Kästchen und Tabellenzellen werden automatisch zu Formularfeldern.",
    steps: [
      ["PDF öffnen", "Wähle das Formular aus – egal ob eingescannt, als Foto in PDF umgewandelt oder aus Word exportiert."],
      ["Felder prüfen", "Erkannte Felder sind blau markiert. Lösche überflüssige mit ×, ergänze fehlende mit „+ Textfeld“ oder „+ Kästchen“."],
      ["Speichern", "„Als leeres ausfüllbares PDF speichern“ erstellt ein Formular, das jeder in Adobe Reader, im Browser oder am Handy ausfüllen kann. Oder fülle es direkt hier aus."],
    ],
    article: [
      {
        h: "Wie wird aus einem Scan ein ausfüllbares Formular?",
        p: [
          "Ein eingescanntes Formular ist für den Computer nur ein Bild: Es gibt keine Felder, in die man klicken könnte. PDF Libre analysiert das Bild jeder Seite und sucht nach den typischen Bestandteilen eines Formulars – waagerechte Schreiblinien („Name: ______“), eingerahmte Kästchen, Tabellenzellen, kleine Ankreuzkästchen und Punktlinien. An genau diesen Stellen werden echte PDF-Formularfelder angelegt.",
          "Leicht schief eingescannte Seiten werden vorher automatisch gerade ausgerichtet. Bei PDFs mit echtem Text (zum Beispiel aus Word exportiert) bekommen die Felder außerdem gleich sinnvolle Namen wie „Name“, „Geburtsdatum“ oder „IBAN“ – praktisch, wenn die Daten später ausgewertet werden.",
        ],
      },
      {
        h: "Für wen ist das praktisch?",
        p: [
          "Vereine, Schulen, Arztpraxen, Hausverwaltungen und kleine Firmen haben oft Formulare, die nur als Ausdruck oder Scan existieren: Anmeldungen, Mitgliedsanträge, Einverständniserklärungen, Stundenzettel. Mit PDF Libre machst du daraus in einer Minute ein Formular, das du per E-Mail verschicken oder auf deine Website stellen kannst – und die Empfänger füllen es am Computer aus, statt es auszudrucken.",
          "Bisher brauchte man dafür Adobe Acrobat Pro oder ähnliche Programme. Hier läuft alles kostenlos im Browser.",
        ],
      },
      {
        h: "Tipps für ein gutes Ergebnis",
        p: [
          "Am besten funktioniert die Erkennung mit gerade eingescannten Formularen mit klaren, durchgehenden Linien. Fotografierte Formulare mit Schatten oder gebogenem Papier sind schwieriger – scanne sie, wenn möglich, mit einer Scanner-App. Punktlinien werden bei PDFs mit echtem Text erkannt; in reinen Scans ergänzt du solche Felder schnell mit „+ Textfeld“.",
        ],
      },
    ],
    faq: [
      ["Wie mache ich eine PDF ausfüllbar?", "PDF auswählen – die Felder werden automatisch erkannt. Prüfen, ggf. ergänzen und auf „Als leeres ausfüllbares PDF speichern“ klicken."],
      ["Geht das auch mit eingescannten Formularen?", "Ja. Linien und Kästchen werden auch in Scans erkannt, leicht schiefe Seiten werden automatisch ausgerichtet."],
      ["Brauche ich Adobe Acrobat?", "Nein. Das ausfüllbare PDF wird direkt im Browser erstellt und funktioniert in Adobe Reader, in Chrome, Firefox, Edge, Safari und am Handy."],
      ["Wird meine PDF hochgeladen?", "Nein. Erkennung und Speichern laufen vollständig in deinem Browser."],
      ["Kann ich Felder selbst hinzufügen?", "Ja. Mit „+ Textfeld“ oder „+ Kästchen“ und einem Klick auf die gewünschte Stelle. Falsche Felder löschst du mit dem × am Feld."],
    ],
    related: ["pdf-formular-ausfuellen", "sign", "edit", "ocr"],
  },
  // ------------------------------------------------------------------ BEWERBUNG
  {
    slug: "bewerbung-pdf-zusammenfuegen",
    base: "bewerbungsmappe",
    guide: "Bewerbungsunterlagen zu einer PDF zusammenfügen",
    name: "Bewerbung als PDF zusammenfügen",
    title: "Bewerbung als PDF zusammenfügen – Anschreiben, Lebenslauf & Zeugnisse | PDF Libre",
    description:
      "Bewerbungsunterlagen online zu einer PDF zusammenfügen: Anschreiben, Lebenslauf und Zeugnisse in der richtigen Reihenfolge, mit Deckblatt und unter 5 MB. Kostenlos und ohne Anmeldung.",
    h1: "Bewerbungsunterlagen zu einer PDF zusammenfügen",
    lead: "Anschreiben, Lebenslauf, Arbeitszeugnisse und Zertifikate in einer einzigen PDF – sortiert, mit Inhaltsverzeichnis und klein genug für jedes Bewerbungsportal und jede E-Mail.",
    steps: [
      ["Alle Unterlagen hochladen", "Wähle Anschreiben, Lebenslauf, Zeugnisse und Zertifikate aus – als PDF, Word-Datei oder Foto vom Handy."],
      ["Reihenfolge sortieren", "Ziehe die Dateien in die richtige Reihenfolge: Anschreiben, Lebenslauf, Arbeitszeugnisse, Abschlusszeugnisse, Zertifikate."],
      ["Bewerbungs-PDF herunterladen", "Klicke auf „Bewerbungsmappe erstellen“. Du bekommst eine PDF-Datei, die du direkt hochladen oder per E-Mail versenden kannst."],
    ],
    article: [
      {
        h: "Warum Personaler eine einzige PDF-Datei bevorzugen",
        p: [
          "Wer sich online bewirbt, verschickt am besten eine einzige PDF statt zehn einzelner Anhänge. Personalabteilungen können die Bewerbung so mit einem Klick öffnen, weiterleiten und ausdrucken – und nichts geht verloren. Viele Unternehmen schreiben in der Stellenanzeige ausdrücklich: „Bitte senden Sie Ihre Unterlagen in einer PDF-Datei.“",
          "Mit PDF Libre fügst du deine Bewerbungsunterlagen kostenlos zusammen, ohne Programm zu installieren und ohne Konto. Word-Dateien wie dein Anschreiben oder dein Lebenslauf werden dabei automatisch in PDF umgewandelt, Fotos von Zeugnissen werden auf A4-Seiten gesetzt.",
        ],
      },
      {
        h: "Die richtige Reihenfolge der Bewerbungsunterlagen",
        p: [
          "Üblich ist in Deutschland: Deckblatt (optional), Anschreiben, Lebenslauf, Arbeitszeugnisse (das neueste zuerst), Hochschul- oder Ausbildungszeugnis, Schulzeugnis und zum Schluss Zertifikate, Weiterbildungen und Arbeitsproben. Bei einer Bewerbung für eine Ausbildung oder ein Praktikum kommen nach dem Lebenslauf die letzten Schulzeugnisse und Praktikumsbescheinigungen.",
        ],
      },
      {
        h: "Bewerbung zusammenfügen – auch für Werkstudent, Ausbildung und Initiativbewerbung",
        p: [
          "Ob Bewerbung um einen Ausbildungsplatz, ein Praktikum, eine Werkstudentenstelle, einen Minijob oder eine Initiativbewerbung: Das Prinzip ist immer gleich. Alle Unterlagen gehören in eine übersichtliche Datei mit sinnvollem Dateinamen, zum Beispiel „Bewerbung_Max_Mustermann.pdf“.",
        ],
      },
    ],
    faq: [
      ["Kann ich Word und PDF gemischt zusammenfügen?", "Ja. Du kannst PDF, Word (DOC, DOCX), ODT und Fotos (JPG, PNG) gemischt hochladen. Alles wird automatisch in eine PDF umgewandelt und zusammengefügt."],
      ["Wie benenne ich die Bewerbungs-PDF?", "Am besten mit Inhalt und Namen, zum Beispiel „Bewerbung_Max_Mustermann.pdf“ oder „Bewerbung_Werkstudent_Max_Mustermann.pdf“. Vermeide Umlaute und Leerzeichen, damit jedes Portal die Datei annimmt."],
      ["Muss die Bewerbung in einer Datei sein?", "Nicht immer, aber meistens ist es besser. Wenn ein Portal getrennte Felder für Anschreiben und Lebenslauf hat, lade die Dokumente dort einzeln hoch – sonst eine einzige PDF."],
      ["Ist das Zusammenfügen kostenlos?", "Ja, komplett kostenlos, ohne Anmeldung und ohne Wasserzeichen. Deine Dateien werden direkt nach dem Erstellen gelöscht."],
    ],
    related: ["bewerbung-pdf-verkleinern", "bewerbung-deckblatt", "merge", "docx-to-pdf"],
  },
  {
    slug: "bewerbung-pdf-verkleinern",
    base: "bewerbungsmappe",
    defaults: { maxMb: "2", cover: "no" },
    guide: "Bewerbung PDF verkleinern (unter 2 oder 5 MB)",
    name: "Bewerbung PDF verkleinern",
    title: "Bewerbung PDF verkleinern – unter 2 MB oder 5 MB, kostenlos | PDF Libre",
    description:
      "Bewerbungs-PDF zu groß? Verkleinere deine Bewerbung online auf unter 2 MB oder 5 MB für Bewerbungsportale und E-Mail – Text bleibt scharf. Kostenlos, ohne Anmeldung.",
    h1: "Bewerbung PDF verkleinern – unter 2 MB oder 5 MB",
    lead: "Das Bewerbungsportal meldet „Datei zu groß“? Lade deine Bewerbung hoch und wähle die Zielgröße. Bilder und Scans werden verkleinert, der Text bleibt gestochen scharf.",
    steps: [
      ["Bewerbung hochladen", "Lade deine fertige Bewerbungs-PDF hoch – oder gleich alle einzelnen Unterlagen."],
      ["Zielgröße wählen", "Wähle „Unter 2 MB“ oder „Unter 5 MB“, je nachdem, was das Bewerbungsportal oder die Stellenanzeige verlangt."],
      ["Kleine PDF herunterladen", "Die Datei wird schrittweise verkleinert, bis sie unter die Grenze passt, und ist bereit zum Hochladen."],
    ],
    article: [
      {
        h: "Wie groß darf eine Bewerbung als PDF sein?",
        p: [
          "Die meisten Bewerbungsportale erlauben 2 bis 5 MB pro Datei, manche nur 1 MB. Für eine Bewerbung per E-Mail gelten etwa 3 bis 5 MB als höflich – größere Anhänge landen schneller im Spam oder werden vom Mailserver abgelehnt. Eine vollständige Bewerbung mit Anschreiben, Lebenslauf und Zeugnissen kommt normalerweise problemlos mit 1 bis 3 MB aus.",
        ],
      },
      {
        h: "Warum ist meine Bewerbung so groß?",
        p: [
          "Fast immer liegt es an gescannten Zeugnissen oder Handyfotos mit sehr hoher Auflösung und an großen Bewerbungsfotos. Ein einziges Foto vom Smartphone kann 5 MB haben. PDF Libre verkleinert genau diese Bilder, bis die Datei unter deine Grenze passt – Schrift und Linien bleiben scharf und durchsuchbar.",
        ],
      },
      {
        h: "Bewerbung verkleinern, ohne dass sie schlecht aussieht",
        p: [
          "Die Bilder werden nur so weit verkleinert wie nötig. Für Zeugnisse und Zertifikate reichen 150 dpi völlig aus – auf dem Bildschirm und beim Ausdrucken sieht man keinen Unterschied. Prüfe zum Schluss trotzdem kurz, ob Stempel und Unterschriften gut lesbar sind.",
        ],
      },
    ],
    faq: [
      ["Wie bekomme ich meine Bewerbung unter 2 MB?", "Lade die Bewerbung hoch, wähle „Unter 2 MB“ und klicke auf „Bewerbungsmappe erstellen“. Die Bilder in der PDF werden automatisch so weit verkleinert, bis die Datei kleiner als 2 MB ist."],
      ["Leidet die Qualität beim Verkleinern?", "Text, Linien und Schriften bleiben unverändert scharf. Nur Fotos und Scans werden in der Auflösung reduziert – so weit, dass es beim Lesen nicht auffällt."],
      ["Kann ich auch eine ganz normale PDF verkleinern?", "Ja. Für jede andere PDF nutzt du am besten „PDF komprimieren“."],
      ["Was mache ich, wenn das Portal nur 1 MB erlaubt?", "Wähle „Unter 2 MB“ und prüfe die Größe. Reicht das nicht, lade Zeugnisse lieber als Schwarz-Weiß-Scan statt als Farbfoto hoch – das spart am meisten Platz."],
    ],
    related: ["compress", "bewerbung-pdf-zusammenfuegen", "bewerbung-per-email", "jpg-to-pdf"],
  },
  {
    slug: "bewerbung-deckblatt",
    base: "bewerbungsmappe",
    defaults: { cover: "yes" },
    guide: "Deckblatt für die Bewerbung erstellen",
    name: "Deckblatt für die Bewerbung",
    title: "Deckblatt für die Bewerbung erstellen – kostenlos als PDF | PDF Libre",
    description:
      "Deckblatt für deine Bewerbung online erstellen: mit Name, Stelle, Unternehmen, Kontaktdaten und automatischem Inhaltsverzeichnis – direkt in deine Bewerbungsmappe als PDF. Kostenlos.",
    h1: "Deckblatt für die Bewerbung erstellen",
    lead: "Trage Name, Stelle und Unternehmen ein – PDF Libre setzt ein schlichtes, professionelles Deckblatt mit Inhaltsverzeichnis vor deine Unterlagen.",
    steps: [
      ["Unterlagen hochladen", "Lade Anschreiben, Lebenslauf und Zeugnisse hoch und bringe sie in die richtige Reihenfolge."],
      ["Deckblatt ausfüllen", "Trage deinen Namen, die Stelle und das Unternehmen ein, optional auch E-Mail, Telefon und Wohnort."],
      ["Mappe mit Deckblatt herunterladen", "Das Deckblatt kommt automatisch an den Anfang, inklusive Inhaltsverzeichnis aus deinen Dateinamen."],
    ],
    article: [
      {
        h: "Braucht eine Bewerbung ein Deckblatt?",
        p: [
          "Ein Deckblatt ist in Deutschland keine Pflicht, wirkt aber ordentlich und gibt dem Personaler auf einen Blick, wer sich auf welche Stelle bewirbt. Besonders bei einer Bewerbungsmappe als PDF mit vielen Anlagen hilft es, weil das Inhaltsverzeichnis zeigt, was alles enthalten ist. Bei sehr kurzen Bewerbungen – zum Beispiel nur Anschreiben und Lebenslauf – kannst du es auch weglassen.",
        ],
      },
      {
        h: "Was gehört auf das Deckblatt einer Bewerbung?",
        p: [
          "Üblich sind: das Wort „Bewerbung“, die Stelle (z. B. „als Werkstudent Data Science“ oder „um einen Ausbildungsplatz als Kauffrau für Büromanagement“), das Unternehmen, dein vollständiger Name und deine Kontaktdaten. Ein Bewerbungsfoto ist freiwillig. Das Inhaltsverzeichnis listet Anschreiben, Lebenslauf und alle Anlagen auf.",
        ],
      },
      {
        h: "Schlicht statt bunt",
        p: [
          "Ein gutes Deckblatt ist ruhig und gut lesbar: viel Weißraum, eine klare Schrift, keine bunten Rahmen. Genau so ist das Deckblatt von PDF Libre gestaltet – es passt zu jedem Lebenslauf-Design und zu jeder Branche.",
        ],
      },
    ],
    faq: [
      ["Wird das Inhaltsverzeichnis automatisch erstellt?", "Ja, aus den Dateinamen deiner Unterlagen. Aus „Arbeitszeugnis_Muster_GmbH.pdf“ wird „Arbeitszeugnis Muster GmbH“. Benenne deine Dateien also vorher sinnvoll."],
      ["Muss ich Telefon und Adresse angeben?", "Nein, diese Felder sind optional. Name, Stelle und Unternehmen reichen für ein vollständiges Deckblatt."],
      ["Kann ich ein Bewerbungsfoto auf das Deckblatt setzen?", "Im Moment nicht. Lade das Foto als eigene Seite hoch oder setze es in deinen Lebenslauf – in Deutschland ist ein Bewerbungsfoto ohnehin freiwillig."],
      ["Kostet das Deckblatt etwas?", "Nein. Das Deckblatt und die ganze Bewerbungsmappe sind kostenlos und ohne Anmeldung."],
    ],
    related: ["bewerbung-pdf-zusammenfuegen", "lebenslauf-pdf", "bewerbung-per-email", "merge"],
  },
  {
    slug: "bewerbung-per-email",
    base: "bewerbungsmappe",
    guide: "Bewerbung per E-Mail: den PDF-Anhang richtig vorbereiten",
    name: "Bewerbung per E-Mail",
    title: "Bewerbung per E-Mail: PDF-Anhang richtig erstellen | PDF Libre",
    description:
      "Bewerbung per E-Mail verschicken: Alle Unterlagen in einen PDF-Anhang unter 5 MB, richtiger Dateiname und Betreff. Bewerbungs-PDF kostenlos online erstellen.",
    h1: "Bewerbung per E-Mail: den PDF-Anhang richtig erstellen",
    lead: "Für eine E-Mail-Bewerbung brauchst du einen einzigen, kleinen PDF-Anhang. Lade deine Unterlagen hoch – PDF Libre fügt sie zusammen und bringt sie unter 5 MB.",
    steps: [
      ["Unterlagen auswählen", "Lade Anschreiben, Lebenslauf und Zeugnisse hoch – PDF, Word oder Foto."],
      ["Größe festlegen", "Wähle „Unter 5 MB“ (Standard) oder „Unter 2 MB“, wenn die Anzeige eine Grenze nennt."],
      ["Als Anhang verschicken", "Lade die fertige PDF herunter und hänge sie an deine E-Mail an."],
    ],
    article: [
      {
        h: "So sieht eine gute E-Mail-Bewerbung aus",
        p: [
          "Betreff: „Bewerbung als [Stelle] – [Referenznummer]“. Im E-Mail-Text stehen nur wenige Sätze: wer du bist, auf welche Stelle du dich bewirbst und dass deine Unterlagen im Anhang sind. Das eigentliche Anschreiben gehört in die PDF – nicht doppelt in die E-Mail. Am Ende eine vollständige Signatur mit Telefonnummer.",
        ],
      },
      {
        h: "Ein Anhang statt vieler: Dateiname und Größe",
        p: [
          "Schicke einen einzigen PDF-Anhang mit klarem Namen, etwa „Bewerbung_Max_Mustermann.pdf“. Bleib unter 5 MB, besser unter 3 MB – manche Firmen-Postfächer lehnen größere Anhänge ab, ohne dass du davon erfährst. Word-Dateien solltest du nie direkt anhängen: Sie sehen auf anderen Rechnern oft anders aus und lassen sich verändern.",
        ],
      },
      {
        h: "Checkliste vor dem Absenden",
        p: [
          "Richtiger Ansprechpartner im Anschreiben? Stelle und Firma überall korrekt? Alle Seiten in der richtigen Reihenfolge und lesbar? Datei unter der Größengrenze? Seriöse Absender-Adresse (vorname.nachname@…)? Dann kann die Bewerbung raus.",
        ],
      },
    ],
    faq: [
      ["Welches Format für eine E-Mail-Bewerbung?", "PDF. Es sieht auf jedem Gerät gleich aus und kann nicht versehentlich verändert werden. Word-Dateien, ZIP-Archive oder Bilder einzeln anzuhängen, wirkt unprofessionell."],
      ["Wie groß darf der Anhang einer Bewerbung sein?", "Faustregel: unter 5 MB, idealerweise unter 3 MB. Wenn die Stellenanzeige eine Grenze nennt, halte dich genau daran."],
      ["Gehört das Anschreiben in die E-Mail oder in die PDF?", "In die PDF. Die E-Mail selbst ist nur ein kurzer Begleittext mit Verweis auf den Anhang."],
      ["Werden meine Bewerbungsunterlagen gespeichert?", "Nein. Alle Dateien werden direkt nach dem Erstellen vom Server gelöscht."],
    ],
    related: ["bewerbung-pdf-verkleinern", "bewerbung-pdf-zusammenfuegen", "lebenslauf-pdf", "compress"],
  },
  {
    slug: "lebenslauf-pdf",
    base: "docx-to-pdf",
    guide: "Lebenslauf als PDF speichern (Word zu PDF)",
    name: "Lebenslauf in PDF umwandeln",
    title: "Lebenslauf als PDF – Word-Lebenslauf kostenlos in PDF umwandeln | PDF Libre",
    description:
      "Lebenslauf von Word (DOCX) in PDF umwandeln: Layout, Schriften und Foto bleiben erhalten. Lebenslauf als PDF für Bewerbung und Bewerbungsportal – kostenlos, ohne Anmeldung.",
    h1: "Lebenslauf als PDF speichern",
    lead: "Lade deinen Lebenslauf als Word-Datei hoch und bekomme eine PDF, die auf jedem Gerät genau gleich aussieht – mit Foto, Tabellen und Schriften.",
    steps: [
      ["Lebenslauf hochladen", "Wähle deinen Lebenslauf als DOCX, DOC oder ODT aus."],
      ["Umwandeln", "Klicke auf „In PDF umwandeln“. Layout, Foto und Formatierung werden übernommen."],
      ["PDF prüfen und verwenden", "Lade die PDF herunter, prüfe kurz Seitenumbrüche und füge sie dann mit „Bewerbungsmappe erstellen“ zu deiner Bewerbung hinzu."],
    ],
    article: [
      {
        h: "Warum der Lebenslauf als PDF verschickt werden sollte",
        p: [
          "Ein Lebenslauf in Word sieht auf jedem Computer anders aus: Fehlt eine Schrift, verrutschen Tabellen, Linien und das Bewerbungsfoto. Als PDF bleibt dein tabellarischer Lebenslauf genau so, wie du ihn gestaltet hast – egal ob der Personaler am PC, Mac oder Handy liest. Außerdem kann eine PDF nicht aus Versehen verändert werden.",
        ],
      },
      {
        h: "Lebenslauf-Vorlage aus Word oder Canva?",
        p: [
          "Egal ob du deinen Lebenslauf mit einer Word-Vorlage, in LibreOffice oder in Google Docs geschrieben hast: Speichere ihn als DOCX und wandle ihn hier in PDF um. Aus Canva oder Pages exportierst du am besten direkt als PDF – danach kannst du die Datei mit unserer Bewerbungsmappe mit Anschreiben und Zeugnissen zusammenfügen.",
        ],
      },
      {
        h: "Tipps für einen guten Lebenslauf als PDF",
        p: [
          "Ein bis zwei Seiten, umgekehrt chronologisch (neueste Station zuerst), klare Überschriften wie „Berufserfahrung“, „Ausbildung“, „Kenntnisse“ und „Sprachen“. Speichere die Datei mit deinem Namen, zum Beispiel „Lebenslauf_Max_Mustermann.pdf“ – so findet der Personaler sie sofort wieder.",
        ],
      },
    ],
    faq: [
      ["Bleibt mein Bewerbungsfoto in der PDF erhalten?", "Ja. Fotos, Tabellen, Linien und Spalten werden in die PDF übernommen."],
      ["Mein Lebenslauf verwendet eine besondere Schrift – bleibt sie erhalten?", "Gängige Schriften werden korrekt dargestellt. Bei sehr seltenen Schriften kann eine ähnliche Schrift eingesetzt werden. Prüfe die PDF deshalb kurz vor dem Versenden."],
      ["Wie füge ich den Lebenslauf mit dem Anschreiben zusammen?", "Nutze „Bewerbungsmappe erstellen“: Dort kannst du Word- und PDF-Dateien gemischt hochladen und alles zu einer Bewerbungs-PDF zusammenfügen."],
      ["Ist die Umwandlung kostenlos?", "Ja, kostenlos und ohne Anmeldung. Die Datei wird direkt nach der Umwandlung gelöscht."],
    ],
    related: ["bewerbungsmappe", "bewerbung-pdf-zusammenfuegen", "bewerbung-deckblatt", "pdf-to-docx"],
  },
  {
    slug: "zeugnisse-als-pdf",
    base: "jpg-to-pdf",
    guide: "Zeugnisse und Zertifikate vom Handy als PDF",
    name: "Zeugnisse als PDF",
    title: "Zeugnisse als PDF – Fotos und Scans vom Handy in eine PDF | PDF Libre",
    description:
      "Zeugnisse, Zertifikate und Nachweise als PDF: Fotos vom Handy oder Scans (JPG, PNG) in eine PDF umwandeln – für Bewerbung, Uni und Behörde. Kostenlos, ohne Anmeldung.",
    h1: "Zeugnisse als PDF – vom Handyfoto zur PDF",
    lead: "Fotografiere deine Zeugnisse mit dem Handy oder scanne sie ein und mach daraus eine saubere PDF – für die Bewerbung, die Uni-Einschreibung oder das Amt.",
    steps: [
      ["Fotos auswählen", "Wähle die Fotos oder Scans deiner Zeugnisse und Zertifikate aus (JPG oder PNG)."],
      ["Reihenfolge festlegen", "Sortiere die Seiten – zum Beispiel neuestes Zeugnis zuerst."],
      ["PDF herunterladen", "Alle Bilder kommen in eine PDF, die du hochladen, per E-Mail verschicken oder in deine Bewerbungsmappe einfügen kannst."],
    ],
    article: [
      {
        h: "So fotografierst du Zeugnisse richtig",
        p: [
          "Lege das Zeugnis auf einen dunklen, ruhigen Untergrund, fotografiere es gerade von oben bei Tageslicht und ohne Blitz. Achte darauf, dass alle vier Ecken zu sehen sind und keine Schatten über dem Text liegen. So sind Noten, Stempel und Unterschrift später gut lesbar.",
        ],
      },
      {
        h: "Zeugnisse für Bewerbung, Uni-Bewerbung und Anerkennung",
        p: [
          "Ob Arbeitszeugnis, Abiturzeugnis, Bachelorzeugnis, Sprachzertifikat (z. B. Goethe, TestDaF, DSH) oder Praktikumsnachweis: Viele Portale – von Unternehmen über uni-assist bis zu Behörden – verlangen die Nachweise als PDF. Mehrere Zeugnisse kannst du in einer Datei bündeln oder für jedes Dokument eine eigene PDF anlegen.",
        ],
      },
      {
        h: "Zeugnisse in die Bewerbungsmappe einfügen",
        p: [
          "Die fertige Zeugnis-PDF kannst du direkt mit Anschreiben und Lebenslauf zu einer Bewerbungsmappe zusammenfügen. Dort wird die Datei auch automatisch auf unter 5 MB verkleinert, falls die Fotos sehr groß sind.",
        ],
      },
    ],
    faq: [
      ["Reicht ein Handyfoto statt eines Scans?", "Für die meisten Online-Bewerbungen ja, wenn das Foto gerade, scharf und gut ausgeleuchtet ist. Für amtliche Zwecke kann eine beglaubigte Kopie nötig sein – das hängt von der Stelle ab."],
      ["Wie viele Zeugnisse kann ich in eine PDF packen?", "So viele du möchtest. Jedes Bild wird eine eigene Seite."],
      ["Die PDF ist zu groß – was tun?", "Füge sie in die Bewerbungsmappe ein und wähle eine Zielgröße, oder nutze „PDF komprimieren“."],
      ["Werden meine Zeugnisse gespeichert?", "Nein. Die Umwandlung läuft direkt in deinem Browser, die Fotos verlassen dein Gerät nicht."],
    ],
    related: ["bewerbungsmappe", "bewerbung-pdf-verkleinern", "compress", "merge"],
  },
  // ------------------------------------------------------------------ LEBENSLAUF
  {
    slug: "lebenslauf-vorlage",
    base: "lebenslauf-erstellen",
    guide: "Lebenslauf-Vorlage kostenlos (Word-Alternative als PDF)",
    name: "Lebenslauf-Vorlage",
    title: "Lebenslauf-Vorlage kostenlos – modern, klassisch & als PDF | PDF Libre",
    description:
      "Kostenlose Lebenslauf-Vorlagen: Modern, Klassisch, LaTeX-Stil und Kompakt. Online ausfüllen statt Word-Vorlage anpassen – als ATS-freundliche PDF herunterladen. Ohne Anmeldung.",
    h1: "Lebenslauf-Vorlage kostenlos – ausfüllen und als PDF speichern",
    lead: "Keine Lust, in Word mit Tabellen und Tabstopps zu kämpfen? Wähle eine Vorlage, trage deine Daten ein – das Layout passt sich automatisch an.",
    article: [
      {
        h: "Vorlage online ausfüllen statt Word-Datei anpassen",
        p: [
          "Klassische Lebenslauf-Vorlagen für Word oder Google Docs verrutschen schnell: Eine Zeile mehr, und die Tabelle springt auf die nächste Seite. Hier trägst du nur Inhalte ein – Abstände, Schriften und Seitenumbrüche setzt PDF Libre automatisch. Überschriften, die allein unten auf einer Seite stehen würden, rutschen von selbst auf die nächste Seite.",
        ],
      },
      {
        h: "Welche Lebenslauf-Vorlage passt zu mir?",
        p: [
          "Für IT, Marketing, Start-ups, Werkstudenten- und Praktikumsstellen: „Modern“. Für Banken, Behörden, Versicherungen, Kanzleien und die Industrie: „Klassisch“. Für Forschung, Promotion, Stipendien und technische Fächer: „Akademisch“ im LaTeX-Stil. Für viel Berufserfahrung auf einer Seite: „Kompakt“. Du kannst jederzeit wechseln, ohne etwas neu einzugeben.",
        ],
      },
    ],
    faq: [
      ["Kostet die Lebenslauf-Vorlage etwas?", "Nein. Alle Vorlagen sind kostenlos und ohne Wasserzeichen."],
      ["Kann ich die Vorlage als Word-Datei bekommen?", "Der Lebenslauf wird als PDF erstellt – das Format, das Personaler und Bewerbungsportale erwarten. Wenn du trotzdem Word brauchst, wandle die PDF mit „PDF in Word“ um."],
      ["Kann ich zwischen Vorlagen wechseln?", "Ja, jederzeit. Deine Angaben bleiben erhalten, nur das Design ändert sich."],
    ],
    related: ["lebenslauf-erstellen", "lebenslauf-ats", "lebenslauf-latex", "bewerbungsmappe"],
  },
  {
    slug: "lebenslauf-ats",
    base: "lebenslauf-erstellen",
    guide: "ATS-freundlicher Lebenslauf: so lesen Bewerbermanagementsysteme richtig",
    name: "ATS-Lebenslauf",
    title: "ATS-Lebenslauf erstellen – ATS-freundliche Vorlage kostenlos | PDF Libre",
    description:
      "ATS-freundlichen Lebenslauf erstellen: einspaltig, echter Text, Standard-Überschriften und ATS-Check mit Hinweisen. So kommt deine Bewerbung durch Bewerbermanagementsysteme. Kostenlos als PDF.",
    h1: "ATS-freundlichen Lebenslauf erstellen",
    lead: "Damit deine Bewerbung nicht schon an der Software scheitert: Vorlagen, die jedes Bewerbermanagementsystem lesen kann – mit ATS-Check direkt neben der Vorschau.",
    article: [
      {
        h: "Woran Lebensläufe im ATS scheitern",
        p: [
          "Mehrspaltige Layouts, bei denen die Software Spalten vermischt; Kontaktdaten in der Kopfzeile oder als Bild; Icons statt Wörtern („📞“ statt „Telefon“); kreative Überschriften wie „Meine Reise“ statt „Berufserfahrung“; Diagramme für Sprachkenntnisse; Schriften ohne saubere Unicode-Zuordnung, bei denen das ATS Zeichensalat liest. All das vermeiden die Vorlagen von PDF Libre.",
        ],
      },
      {
        h: "Keywords aus der Stellenanzeige übernehmen",
        p: [
          "Ein ATS vergleicht deinen Lebenslauf mit den Anforderungen der Stelle. Verwende deshalb die Begriffe aus der Anzeige, sofern sie auf dich zutreffen – zum Beispiel „Python“, „SQL“, „Projektmanagement“ oder „Kundenservice“ – in deinen Kenntnissen und in der Beschreibung deiner Stationen. Schreibe Abkürzungen einmal aus („Customer Relationship Management (CRM)“). Erfinde aber nichts: Im Gespräch wird jede Angabe geprüft.",
        ],
      },
      {
        h: "Der ATS-Check von PDF Libre",
        p: [
          "Neben der Vorschau prüft PDF Libre, ob Name und Kontaktdaten als Text vorhanden sind, ob es ein Kurzprofil gibt, ob alle Daten im gleichen Format stehen, ob deine Stationen beschrieben sind und ob der Lebenslauf höchstens zwei Seiten lang ist.",
        ],
      },
    ],
    faq: [
      ["Was ist ein ATS?", "Ein Applicant Tracking System (Bewerbermanagementsystem) ist eine Software, mit der Unternehmen Bewerbungen sammeln, auslesen und sortieren – zum Beispiel Workday, SAP SuccessFactors, Personio oder Softgarden."],
      ["Darf ein ATS-Lebenslauf ein Foto haben?", "Ja, das Foto stört das Auslesen nicht. Es ist in Deutschland aber freiwillig."],
      ["Ist eine PDF für ein ATS geeignet?", "Ja, wenn sie echten Text enthält – wie die PDFs von PDF Libre. Eingescannte Lebensläufe oder Bilder als PDF kann ein ATS dagegen nicht lesen."],
    ],
    related: ["lebenslauf-erstellen", "lebenslauf-vorlage", "bewerbung-pdf-zusammenfuegen", "ocr"],
  },
  {
    slug: "lebenslauf-latex",
    base: "lebenslauf-erstellen",
    defaults: { template: "akademisch" },
    guide: "Lebenslauf im LaTeX-Stil – ohne LaTeX",
    name: "Lebenslauf im LaTeX-Stil",
    title: "LaTeX-Lebenslauf ohne LaTeX – moderncv-Stil online erstellen | PDF Libre",
    description:
      "Lebenslauf im LaTeX-Look erstellen, ganz ohne LaTeX: Latin-Modern-Schrift, klare Struktur wie moderncv, Live-Vorschau und PDF-Download. Ideal für Studium, Wissenschaft und Promotion. Kostenlos.",
    h1: "Lebenslauf im LaTeX-Stil – ganz ohne LaTeX",
    lead: "Der typische LaTeX-Look mit Latin-Modern-Schrift, ohne Overleaf, ohne Pakete und ohne Kompilierfehler. Wähle oben die Vorlage „Akademisch“ und fülle das Formular aus.",
    article: [
      {
        h: "Warum ein Lebenslauf im LaTeX-Stil?",
        p: [
          "In Mathematik, Informatik, Physik und der Forschung sind Lebensläufe aus LaTeX (zum Beispiel mit moderncv oder altacv) weit verbreitet: ruhige Typografie, perfekte Abstände, seriöse Wirkung. Der Nachteil: Man muss LaTeX beherrschen, und jede Änderung heißt neu kompilieren. Die Vorlage „Akademisch“ setzt deinen Lebenslauf in Latin Modern – der Standardschrift von LaTeX – mit derselben klaren Struktur.",
        ],
      },
      {
        h: "Für Bewerbungen an Uni, Institut und Forschung",
        p: [
          "Ob HiWi-Stelle, Werkstudentenjob am Institut, Masterbewerbung, Promotion, Stipendium oder Bewerbung bei einem Forschungsinstitut wie Fraunhofer oder Max-Planck: Ein akademischer Lebenslauf zeigt neben Ausbildung und Berufserfahrung auch Projekte, Abschlussarbeit, Lehrerfahrung und Publikationen. Lege dafür einfach eigene Abschnitte über „Projekte“ oder „Weitere Angaben“ an und benenne sie um.",
        ],
      },
    ],
    faq: [
      ["Brauche ich LaTeX oder Overleaf?", "Nein. Du füllst nur das Formular aus, die PDF wird automatisch gesetzt."],
      ["Ist der LaTeX-Stil ATS-freundlich?", "Ja. Anders als manche LaTeX-Vorlagen mit Spalten und Icons ist die Vorlage einspaltig und enthält sauber auslesbaren Text."],
      ["Kann ich Publikationen angeben?", "Ja. Benenne den Abschnitt „Weitere Angaben“ in „Publikationen“ um und trage sie dort ein – eine pro Zeile."],
    ],
    related: ["lebenslauf-erstellen", "lebenslauf-vorlage", "lebenslauf-ats", "bewerbungsmappe"],
  },
  {
    slug: "lebenslauf-werkstudent",
    base: "lebenslauf-erstellen",
    guide: "Lebenslauf für Werkstudenten, Praktikum und Ausbildung",
    name: "Lebenslauf für Werkstudenten",
    title: "Lebenslauf Werkstudent & Praktikum – Muster und Vorlage kostenlos | PDF Libre",
    description:
      "Lebenslauf für Werkstudentenstelle, Praktikum oder Ausbildung erstellen: Muster mit Studium, Projekten und Kenntnissen, ATS-freundlich als PDF. Kostenlos und ohne Anmeldung.",
    h1: "Lebenslauf für Werkstudenten, Praktikum und Ausbildung",
    lead: "Wenig Berufserfahrung? Kein Problem: Mit Studium, Projekten, Nebenjobs und Kenntnissen wird dein Lebenslauf trotzdem stark. Klicke auf „Beispiel laden“, um ein Muster zu sehen.",
    article: [
      {
        h: "Was gehört in einen Lebenslauf für Studierende?",
        p: [
          "Ein kurzes Profil (welches Studium, welche Stärken, wie viele Stunden pro Woche), das Studium mit Schwerpunkten, Praktika, Nebenjobs und Werkstudententätigkeiten, Uni- und eigene Projekte (zum Beispiel auf GitHub), Kenntnisse wie Programmiersprachen, Tools und Software, Sprachen mit Niveau (A1–C2) sowie Ehrenamt. Auch Nebenjobs außerhalb deines Fachs zeigen Zuverlässigkeit und gehören hinein.",
        ],
      },
      {
        h: "Projekte statt Berufserfahrung",
        p: [
          "Gerade für Werkstudentenstellen in IT, Data Science und Ingenieurwesen sind Projekte oft wichtiger als lange Berufserfahrung. Beschreibe kurz, was du gebaut hast, mit welchen Technologien und was dabei herauskam – und verlinke es, wenn möglich.",
        ],
      },
    ],
    faq: [
      ["Wie lang darf der Lebenslauf eines Studenten sein?", "Eine Seite ist ideal, zwei Seiten sind in Ordnung, wenn du viele relevante Projekte oder Jobs hast."],
      ["Gehört das Abitur in den Lebenslauf?", "Ja, mit Note, solange du noch studierst oder gerade erst fertig bist."],
      ["Sollte ich die Wochenstunden angeben?", "Für Werkstudentenstellen ja – zum Beispiel im Profil: „verfügbar für 15–20 Stunden pro Woche“."],
    ],
    related: ["lebenslauf-erstellen", "bewerbungsmappe", "bewerbung-per-email", "lebenslauf-ats"],
  },
  {
    slug: "lebenslauf-franzoesisch",
    base: "lebenslauf-erstellen",
    defaults: { lang: "fr" },
    guide: "Lebenslauf auf Französisch (CV français) – für Frankreich, Belgien, Schweiz, Luxemburg",
    name: "Lebenslauf auf Französisch",
    title: "Lebenslauf auf Französisch erstellen – CV en français kostenlos | PDF Libre",
    description:
      "Französischen Lebenslauf (CV) erstellen: Überschriften auf Französisch, Datumsformat und Anschreiben (lettre de motivation) – oder deinen deutschen Lebenslauf per KI übersetzen. Für Bewerbungen in Frankreich, Belgien, der Schweiz und Luxemburg.",
    h1: "Lebenslauf auf Französisch – CV en français",
    lead: "Bewirbst du dich in Frankreich, Belgien, der Westschweiz, Luxemburg oder bei einem französischen Unternehmen? Hier bekommst du einen CV mit französischen Überschriften – oder übersetzt deinen bestehenden Lebenslauf mit einem Klick.",
    article: [
      {
        h: "Der französische CV: was anders ist",
        p: [
          "Ein CV in Frankreich ist meist eine Seite lang (bei Berufserfahrenen höchstens zwei) und beginnt oft mit einer kurzen Zielzeile, dem „titre du CV“, zum Beispiel „Stagiaire en Data Science“ oder „Ingénieur logiciel“. Danach folgen „Expérience professionnelle“, „Formation“, „Compétences“, „Langues“ und „Centres d’intérêt“. Ein Foto ist in Frankreich freiwillig.",
          "Deutsche Abschlüsse solltest du kurz erklären, zum Beispiel „Abitur (équivalent du baccalauréat)“ oder „Bachelor of Science en informatique, TU Darmstadt“. Die Übersetzungsfunktion von PDF Libre macht das automatisch.",
        ],
      },
      {
        h: "Lebenslauf übersetzen statt neu schreiben",
        p: [
          "Du hast schon einen deutschen oder englischen Lebenslauf? Importiere ihn, gehe zu „Prüfen & KI“ und wähle „Übersetzen → Französisch“. Positionen, Abschlüsse und Beschreibungen werden natürlich übersetzt, Namen, Firmen, Orte und Technologien bleiben unverändert. Speichere vorher den Entwurf, dann hast du beide Sprachversionen.",
        ],
      },
      {
        h: "Lettre de motivation im selben Design",
        p: [
          "Auch das Anschreiben – die „lettre de motivation“ – erstellst du hier im gleichen Design, mit französischer Anrede „Madame, Monsieur,“ und der üblichen Grußformel. Der KI-Entwurf richtet sich nach der Sprache der Stellenanzeige.",
        ],
      },
    ],
    faq: [
      ["Kann ich zwischen Deutsch, Englisch und Französisch wechseln?", "Ja. Die Überschriften stellst du im Schritt „Design“ um; die Texte übersetzt die KI im Schritt „Prüfen & KI“."],
      ["Wie schreibe ich Daten im französischen CV?", "Üblich ist MM/AAAA, zum Beispiel 09/2024 – also dasselbe Format wie im deutschen Lebenslauf. „aujourd’hui“ steht für „heute“."],
      ["Wie heißen die Abschnitte auf Französisch?", "Profil, Expérience professionnelle, Formation, Projets, Compétences, Langues und Informations complémentaires."],
    ],
    related: ["lebenslauf-erstellen", "anschreiben-erstellen", "lebenslauf-ats", "bewerbungsmappe"],
  },
  // ------------------------------------------------------------------ GROSSE DATEIEN (bis 500 MB pro Datei, 1 GB pro Upload)
  {
    slug: "grosse-pdf-verkleinern",
    base: "compress",
    guide: "Große PDF verkleinern (bis 500 MB)",
    name: "Große PDF verkleinern",
    title: "Große PDF verkleinern – bis 500 MB pro Datei, kostenlos | PDF Libre",
    description: "Große PDF online verkleinern: Dateien bis 500 MB komprimieren, auch lange Scans und Kataloge. Ohne Anmeldung, ohne Tageslimit, Dateien werden sofort gelöscht. Kostenlos.",
    h1: "Große PDF verkleinern – auch Dateien bis 500 MB",
    lead: "Viele kostenlose Dienste brechen bei großen Dateien ab. Hier kannst du PDFs bis 500 MB komprimieren – Kataloge, Baupläne, Präsentationen oder gescannte Akten mit Hunderten Seiten.",
    steps: [
      ["Große PDF auswählen", "Ziehe die Datei in das Feld. Bei sehr großen Dateien siehst du den Fortschritt des Uploads in Prozent."],
      ["Stufe wählen", "„Empfohlen“ passt fast immer. Soll die Datei so klein wie möglich werden, wähle „Stark“."],
      ["Kleinere PDF herunterladen", "Nach dem Komprimieren siehst du, wie viel Speicher gespart wurde. Große Dateien brauchen dafür etwas länger – lass das Fenster einfach geöffnet."],
    ],
    article: [
      { h: "Warum ist meine PDF so groß?", p: ["Fast immer sind es die Bilder: Fotos in voller Kamera-Auflösung, Scans mit 600 dpi in Farbe oder eingebettete Grafiken aus Präsentationen. Text selbst braucht kaum Platz – 500 Seiten reiner Text sind oft kleiner als ein einziges Handyfoto. Beim Komprimieren werden genau diese Bilder auf eine sinnvolle Auflösung gebracht und effizienter gespeichert."] },
      { h: "Wie groß darf die Datei sein?", p: ["Bis zu 500 MB pro Datei und bis zu 1 GB pro Upload. Das ist deutlich mehr als bei vielen kostenlosen PDF-Diensten, die oft schon bei 100 oder 200 MB aufhören. Ein Tageslimit gibt es nicht: Du kannst so viele Dateien verkleinern, wie du brauchst."] },
      { h: "Was passiert mit meiner Datei?", p: ["Die PDF wird verschlüsselt übertragen, auf unserem Server in Deutschland verarbeitet und direkt nach dem Download gelöscht. Wir sehen uns den Inhalt nicht an und speichern nichts dauerhaft."] },
    ],
    faq: [
      ["Kann ich eine PDF mit 300 MB verkleinern?", "Ja. Dateien bis 500 MB werden angenommen. Rechne bei so großen Dateien mit ein bis wenigen Minuten für Upload und Komprimierung."],
      ["Wie stark wird die Datei kleiner?", "Das hängt vom Inhalt ab. Gescannte und bildreiche PDFs schrumpfen oft auf 10 bis 30 % der ursprünglichen Größe, reine Text-PDFs kaum – sie sind meist schon klein."],
      ["Gibt es ein Tageslimit?", "Nein. Die Werkzeuge sind kostenlos und ohne Anmeldung nutzbar, so oft du willst."],
      ["Was, wenn meine Datei größer als 500 MB ist?", "Teile sie zuerst mit „PDF teilen“ in kleinere Teile – das passiert direkt in deinem Browser, ohne Größenlimit – und komprimiere die Teile einzeln."],
    ],
    related: ["compress", "pdf-zu-gross-fuer-email", "gescanntes-pdf-verkleinern", "split"],
  },
  {
    slug: "pdf-zu-gross-fuer-email",
    base: "compress",
    defaults: { level: "strong" },
    guide: "PDF zu groß für die E-Mail? So wird sie kleiner",
    name: "PDF zu groß für E-Mail",
    title: "PDF zu groß für E-Mail? Unter 25 MB (Gmail) oder 20 MB (Outlook) bringen | PDF Libre",
    description: "PDF zu groß zum Verschicken? Komprimiere sie unter die Grenze von Gmail (25 MB), Outlook (20 MB) oder GMX/Web.de. Dateien bis 500 MB, kostenlos, ohne Anmeldung.",
    h1: "PDF zu groß für die E-Mail? So bekommst du sie klein",
    lead: "Die E-Mail kommt zurück oder lässt sich gar nicht erst senden, weil der Anhang zu groß ist? Komprimiere die PDF hier – auch wenn sie ursprünglich mehrere hundert MB hat.",
    steps: [
      ["PDF hochladen", "Wähle die PDF, die zu groß ist – bis zu 500 MB."],
      ["„Stark“ komprimieren", "Die Stufe „Stark“ ist schon vorausgewählt. Sie macht die Datei so klein wie möglich, Text bleibt scharf."],
      ["Größe prüfen und senden", "Du siehst die neue Größe sofort. Liegt sie unter der Grenze deines E-Mail-Anbieters, kannst du sie direkt anhängen."],
    ],
    article: [
      { h: "Wie groß darf ein E-Mail-Anhang sein?", p: ["Gmail erlaubt 25 MB pro E-Mail, Outlook 20 MB. Bei GMX und Web.de liegt die Grenze je nach Tarif meist zwischen 20 und 50 MB. Wichtig: Gemeint ist die gesamte E-Mail – mehrere Anhänge zählen zusammen, und durch die Kodierung beim Versand wird jeder Anhang noch etwa ein Drittel größer. Plane also lieber etwas Luft ein und bleib z. B. bei Gmail unter 18 MB."] },
      { h: "Wenn es trotzdem nicht passt", p: ["Reicht die Komprimierung nicht, hilft fast immer einer dieser Schritte: Seiten entfernen, die der Empfänger nicht braucht; die PDF mit „PDF teilen“ in zwei Teile aufteilen und in zwei E-Mails schicken; oder Scans in Schwarz-Weiß statt in Farbe erstellen. Für sehr große Dateien ist außerdem ein Cloud-Link (z. B. aus OneDrive oder Google Drive) die bessere Wahl."] },
    ],
    faq: [
      ["Wie verkleinere ich eine PDF für Gmail?", "Lade sie hier hoch, wähle „Stark“ und lade das Ergebnis herunter. Liegt es unter etwa 18 MB, passt es sicher in eine Gmail-Nachricht (Grenze 25 MB)."],
      ["Meine PDF hat 200 MB – geht das?", "Ja, Dateien bis 500 MB werden angenommen. Ob sie danach unter 25 MB passt, hängt vom Inhalt ab. Bei Scans klappt das oft, bei sehr vielen Fotos musst du die Datei eventuell zusätzlich teilen."],
      ["Wird die Schrift unscharf?", "Nein. Text und Linien bleiben unverändert scharf, nur Bilder werden verkleinert."],
    ],
    related: ["compress", "grosse-pdf-verkleinern", "split", "bewerbung-per-email"],
  },
  {
    slug: "grosse-pdf-zusammenfuegen",
    base: "merge",
    guide: "Große PDFs zusammenfügen (bis 1 GB)",
    name: "Große PDFs zusammenfügen",
    title: "Große PDFs zusammenfügen – bis 500 MB pro Datei, 1 GB gesamt, kostenlos | PDF Libre",
    description: "Große PDF-Dateien online zusammenfügen: bis zu 20 Dateien mit je 500 MB, zusammen bis 1 GB. Ideal für Scans, Akten und Berichte. Kostenlos, ohne Anmeldung.",
    h1: "Große PDFs zusammenfügen – bis zu 1 GB auf einmal",
    lead: "Akten, Scans, Baupläne oder Jahresberichte sind schnell mehrere hundert MB groß. Hier fügst du bis zu 20 PDFs mit jeweils bis zu 500 MB zu einer Datei zusammen – zusammen bis 1 GB.",
    steps: [
      ["PDFs auswählen", "Ziehe alle Dateien auf einmal in das Feld oder füge sie nacheinander hinzu."],
      ["Reihenfolge festlegen", "Sortiere die Dateien per Ziehen oder mit den Pfeilen."],
      ["Zusammenfügen", "Klicke auf „PDFs zusammenfügen“. Bei großen Dateien dauert das etwas länger – das Fenster bitte geöffnet lassen."],
    ],
    article: [
      { h: "Wie viel geht auf einmal?", p: ["Bis zu 20 Dateien pro Durchgang, jede bis 500 MB, zusammen bis 1 GB pro Upload. Viele kostenlose Dienste begrenzen das Zusammenfügen auf 100 MB. Brauchst du mehr, füge die Dateien in mehreren Durchgängen zusammen und verbinde die Ergebnisse am Ende."] },
      { h: "Die fertige Datei ist zu groß?", p: ["Beim Zusammenfügen addieren sich die Größen. Soll das Ergebnis per E-Mail oder in ein Portal, nutze „Zusammenfügen & komprimieren“ – das erledigt beides in einem Schritt."] },
    ],
    faq: [
      ["Kann ich zwei PDFs mit je 400 MB zusammenfügen?", "Ja. Jede Datei darf bis 500 MB groß sein, zusammen bis 1 GB."],
      ["Werden meine Dateien gespeichert?", "Nein. Sie werden nach dem Download sofort gelöscht."],
    ],
    related: ["merge", "merge-compress", "grosse-pdf-verkleinern", "organize"],
  },
  {
    slug: "grosse-word-datei-in-pdf",
    base: "docx-to-pdf",
    guide: "Große Word-Datei in PDF umwandeln",
    name: "Große Word-Datei in PDF",
    title: "Große Word-Datei in PDF umwandeln – bis 500 MB, kostenlos | PDF Libre",
    description: "Große Word-Dokumente (DOCX, DOC) mit vielen Bildern in PDF umwandeln: bis 500 MB pro Datei statt der üblichen 15 MB. Kostenlos, ohne Anmeldung, Layout bleibt erhalten.",
    h1: "Große Word-Datei in PDF umwandeln",
    lead: "Abschlussarbeit mit vielen Abbildungen, Handbuch, Fotodokumentation? Viele kostenlose Konverter lehnen Word-Dateien schon ab 15 MB ab. Hier werden Dokumente bis 500 MB umgewandelt.",
    steps: [
      ["Word-Datei auswählen", "DOCX, DOC, ODT oder RTF – bis 500 MB."],
      ["Umwandeln", "Klicke auf „In PDF umwandeln“. Seitenumbrüche, Schriften und Bilder bleiben erhalten."],
      ["PDF herunterladen", "Ist die PDF zu groß zum Verschicken, komprimiere sie danach mit einem Klick."],
    ],
    article: [
      { h: "Warum ist meine Word-Datei so groß?", p: ["Word speichert eingefügte Fotos oft in voller Auflösung – ein Dokument mit 50 Handyfotos hat schnell 150 MB. Beim Umwandeln in PDF bleibt die Qualität erhalten. Möchtest du eine kleinere Datei, komprimiere die fertige PDF anschließend."] },
      { h: "Für Abschlussarbeiten und Berichte", p: ["Hochschulen und Ämter verlangen oft eine PDF. Prüfe nach der Umwandlung kurz Inhaltsverzeichnis, Seitenzahlen und Abbildungen. Wenn eine besondere Schrift fehlt, wird sie durch eine ähnliche ersetzt – bettest du die Schrift in Word ein („Schriftarten in der Datei einbetten“), sieht die PDF exakt aus wie das Original."] },
    ],
    faq: [
      ["Wie groß darf die Word-Datei sein?", "Bis 500 MB pro Datei."],
      ["Bleibt das Layout gleich?", "Ja, in den allermeisten Fällen. Nur Schriften, die nicht eingebettet und auf dem Server nicht vorhanden sind, werden durch ähnliche ersetzt."],
      ["Geht auch eine alte DOC-Datei?", "Ja. DOC, DOCX, ODT und RTF werden unterstützt."],
    ],
    related: ["docx-to-pdf", "compress", "grosse-pdf-verkleinern", "merge"],
  },
  {
    slug: "gescanntes-pdf-verkleinern",
    base: "compress",
    guide: "Gescannte PDF verkleinern",
    name: "Gescannte PDF verkleinern",
    title: "Gescannte PDF verkleinern – Scans bis 500 MB komprimieren, kostenlos | PDF Libre",
    description: "Gescannte PDF zu groß? Scans und Akten mit Hunderten Seiten bis 500 MB komprimieren – oft auf ein Zehntel. Kostenlos, ohne Anmeldung, Dateien werden sofort gelöscht.",
    h1: "Gescannte PDF verkleinern",
    lead: "Scanner speichern oft in Farbe und mit hoher Auflösung – eine Akte mit 200 Seiten hat dann schnell 300 MB. Hier verkleinerst du Scans bis 500 MB, oft auf einen Bruchteil.",
    steps: [
      ["Scan auswählen", "Ziehe die gescannte PDF in das Feld – bis 500 MB."],
      ["Stufe wählen", "„Empfohlen“ hält Stempel und Unterschriften gut lesbar. „Stark“ macht die Datei noch kleiner."],
      ["Herunterladen", "Du siehst sofort, wie viel kleiner die Datei geworden ist."],
    ],
    article: [
      { h: "Warum Scans so groß sind", p: ["Ein Scan ist für den Computer ein Foto jeder Seite. Bei 600 dpi in Farbe braucht eine einzige A4-Seite mehrere MB. Für das Lesen am Bildschirm und für Ausdrucke reichen 150 bis 200 dpi völlig aus – genau darauf werden die Seiten beim Komprimieren gebracht."] },
      { h: "Tipp: durchsuchbar machen", p: ["Nach dem Verkleinern kannst du die Datei mit „PDF durchsuchbar machen (OCR)“ zusätzlich mit Text hinterlegen. Dann findest du Namen und Beträge mit der Suche und kannst Text kopieren."] },
    ],
    faq: [
      ["Wie klein wird mein Scan?", "Farbige Scans mit hoher Auflösung schrumpfen oft auf 10 bis 20 % der ursprünglichen Größe."],
      ["Bleiben Unterschriften lesbar?", "Ja, mit der Stufe „Empfohlen“. Prüfe bei „Stark“ kurz, ob feine Stempel noch gut zu erkennen sind."],
      ["Wie groß darf der Scan sein?", "Bis 500 MB pro Datei."],
    ],
    related: ["compress", "ocr", "grosse-pdf-verkleinern", "pdf-zu-gross-fuer-email"],
  },
  {
    slug: "ilovepdf-alternative",
    base: "compress",
    guide: "Kostenlose Alternative zu iLovePDF – mit größeren Dateien",
    name: "iLovePDF-Alternative",
    title: "iLovePDF-Alternative – kostenlos bis 500 MB pro Datei | PDF Libre",
    description: "Kostenlose Alternative zu iLovePDF und Smallpdf: Dateien bis 500 MB, 1 GB pro Upload, kein Tageslimit, ohne Anmeldung, Server in Deutschland. Ehrlicher Vergleich der Grenzen.",
    h1: "Kostenlose Alternative zu iLovePDF – mit größeren Dateien",
    lead: "Die bekannten PDF-Dienste sind gut – bis eine Datei zu groß ist oder das Tageslimit erreicht ist. PDF Libre verarbeitet kostenlos Dateien bis 500 MB, ohne Anmeldung und ohne Tageslimit.",
    steps: [
      ["Datei auswählen", "Probiere es direkt hier mit „PDF komprimieren“ aus – oder wähle ein anderes Werkzeug aus der Liste."],
      ["Bearbeiten", "Kein Konto, keine Wartezeit, kein Wasserzeichen."],
      ["Herunterladen", "Die Datei wird nach dem Download sofort gelöscht."],
    ],
    article: [
      {
        h: "Dateigrößen im Vergleich (kostenlose Versionen)",
        p: ["Die Werte für iLovePDF stammen von der öffentlichen Preisseite von iLovePDF (Stand: November 2026) und können sich ändern. Mit einem bezahlten Premium-Konto erlaubt iLovePDF bis zu 4 GB."],
        table: {
          head: ["Werkzeug", "PDF Libre (kostenlos)", "iLovePDF (kostenlos)"],
          rows: [
            ["PDF komprimieren", "500 MB", "200 MB"],
            ["PDFs zusammenfügen", "500 MB pro Datei, 1 GB gesamt", "100 MB"],
            ["PDF teilen", "im Browser, ohne Grenze", "100 MB"],
            ["Word in PDF", "500 MB", "15 MB"],
            ["PDF in Word", "500 MB", "15 MB"],
            ["OCR (Texterkennung)", "500 MB", "15 MB"],
            ["Bilder in PDF", "im Browser, ohne Grenze", "40 MB"],
          ],
        },
      },
      { h: "Was PDF Libre anders macht", p: ["Kein Tageslimit und keine Anmeldung für die normalen Werkzeuge. Viele Werkzeuge – Teilen, Drehen, Seiten ordnen, Bilder in PDF, Formulare ausfüllen – laufen komplett in deinem Browser, die Datei verlässt dein Gerät also gar nicht. Alles andere wird auf einem Server in Deutschland verarbeitet und sofort gelöscht. Dazu kommen Werkzeuge speziell für Deutschland: E-Rechnung (ZUGFeRD, XRechnung) erstellen und prüfen, Musterbriefe nach DIN 5008 und Bewerbungsmappen."] },
      { h: "Was die anderen besser können", p: ["iLovePDF und Smallpdf bieten mehr Werkzeuge, eigene Apps für Computer und Handy und mit einem bezahlten Konto auch Dateien von mehreren GB. Wenn du regelmäßig Dateien über 500 MB bearbeitest, ist ein Premium-Konto dort oder ein Desktop-Programm die bessere Wahl."] },
    ],
    faq: [
      ["Ist PDF Libre wirklich kostenlos?", "Ja. Die Werkzeuge sind kostenlos und ohne Anmeldung nutzbar. Die Seite wird über Werbung finanziert – in deine Dateien kommt nie Werbung oder ein Wasserzeichen."],
      ["Gibt es ein Tageslimit?", "Nein. Es gibt nur einen Schutz gegen automatisierten Missbrauch, den man bei normaler Nutzung nicht bemerkt. Bei den KI-Werkzeugen (z. B. Übersetzen, Zusammenfassen) gilt eine Grenze pro Stunde, weil sie Kosten verursachen."],
      ["Wo werden meine Dateien verarbeitet?", "Browser-Werkzeuge direkt auf deinem Gerät, alle anderen auf unserem Server in Deutschland. Die Dateien werden nach dem Download gelöscht."],
      ["Ist PDF Libre mit iLovePDF verbunden?", "Nein. PDF Libre ist ein unabhängiges Projekt. iLovePDF und Smallpdf sind Marken ihrer jeweiligen Inhaber."],
    ],
    related: ["compress", "merge", "docx-to-pdf", "grosse-pdf-verkleinern"],
  },
];

module.exports = { landings };
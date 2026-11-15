/**
 * Neue Werkzeuge (Unterschreiben, Bewerbungsmappe, PDF → Excel/PowerPoint, KI).
 * Aufbau wie in tools.js. Werkzeuge mit `pro: true` sind kostenpflichtig, wenn PAYMENTS_ENABLED=true;
 * `free` enthält die Texte für die kostenlose Fassung (PAYMENTS_ENABLED=false).
 */
const PDF = { accept: ".pdf,application/pdf", label: "PDF" };

const LANG_CHOICES = [
  { value: "en", label: "Englisch" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Französisch" },
  { value: "es", label: "Spanisch" },
  { value: "it", label: "Italienisch" },
  { value: "pt", label: "Portugiesisch" },
  { value: "nl", label: "Niederländisch" },
  { value: "pl", label: "Polnisch" },
  { value: "tr", label: "Türkisch" },
  { value: "ro", label: "Rumänisch" },
  { value: "ru", label: "Russisch" },
  { value: "uk", label: "Ukrainisch" },
];

module.exports = [
  // ------------------------------------------------------------------ PDF UNTERSCHREIBEN
  {
    slug: "sign",
    name: "PDF unterschreiben",
    short: "Unterschrift zeichnen oder als Bild einfügen und an die richtige Stelle setzen.",
    cat: "edit",
    isNew: true,
    badge: "PDF",
    glyph: "sign",
    title: "PDF unterschreiben – kostenlos online, ohne Anmeldung | PDF Libre",
    description:
      "PDF online unterschreiben: Unterschrift mit Maus oder Finger zeichnen oder als Foto einfügen, Datum ergänzen und speichern. Kostenlos, die Datei verlässt dein Gerät nicht.",
    h1: "PDF unterschreiben",
    lead: "Unterschreibe Verträge, Formulare und Mietunterlagen direkt im Browser – ohne Drucken und Scannen.",
    ui: { mode: "editor", start: "upload", sign: true, input: PDF },
    steps: [
      ["PDF öffnen", "Wähle die PDF aus, die du unterschreiben möchtest. Sie wird nur in deinem Browser geöffnet."],
      ["Unterschrift erstellen", "Klicke auf „Unterschrift“ und zeichne mit Maus, Touchpad oder Finger – oder lade ein Foto deiner Unterschrift hoch."],
      ["Platzieren", "Ziehe die Unterschrift an die richtige Stelle und passe die Größe an. Mit „Text“ ergänzt du Ort und Datum."],
      ["Herunterladen", "Klicke auf „Herunterladen“. Die unterschriebene PDF wird direkt auf deinem Gerät erstellt."],
    ],
    article: [
      {
        h: "Unterschreiben ohne Drucker",
        p: [
          "Mietvertrag, Arbeitsvertrag, Einverständniserklärung oder Formular vom Amt: Oft reicht es, die PDF mit einer eingefügten Unterschrift zurückzuschicken. Statt auszudrucken, zu unterschreiben und wieder einzuscannen, setzt du deine Unterschrift hier in wenigen Sekunden in das Dokument.",
          "Auf dem Handy oder Tablet zeichnest du einfach mit dem Finger. Ein Foto deiner Unterschrift auf weißem Papier funktioniert auch – der weiße Hintergrund wird automatisch entfernt.",
        ],
      },
      {
        h: "Ist eine eingefügte Unterschrift rechtsgültig?",
        p: [
          "Eine eingefügte Unterschrift ist eine „einfache elektronische Signatur“. Sie genügt für die meisten Alltagsfälle, etwa Formulare, Einwilligungen, Angebote oder viele Verträge ohne Formvorschrift. Für Dokumente, bei denen das Gesetz die Schriftform verlangt (z. B. Kündigung eines Arbeitsvertrags oder Bürgschaft), brauchst du weiterhin eine handschriftliche Unterschrift auf Papier oder eine qualifizierte elektronische Signatur.",
        ],
      },
    ],
    faq: [
      ["Wird meine PDF hochgeladen?", "Nein. Unterschreiben und Speichern passieren komplett in deinem Browser – die Datei verlässt dein Gerät nicht."],
      ["Kann ich meine Unterschrift speichern?", "Ja, auf Wunsch merkt sich dein Browser die Unterschrift für das nächste Mal. Sie wird nur auf deinem Gerät gespeichert."],
      ["Kann ich mehrere Seiten unterschreiben?", "Ja. Füge die Unterschrift auf jeder Seite ein, auf der sie gebraucht wird – zum Beispiel auch als Paraphe unten auf jeder Seite."],
      ["Was kostet das?", "Nichts. PDF unterschreiben ist kostenlos und ohne Anmeldung."],
    ],
    related: ["edit", "merge", "compress", "jpg-to-pdf"],
  },

  // ------------------------------------------------------------------ BEWERBUNGSMAPPE
  {
    slug: "bewerbungsmappe",
    name: "Bewerbungsmappe erstellen",
    short: "Anschreiben, Lebenslauf und Zeugnisse zu einer PDF – mit Deckblatt und unter 5 MB.",
    cat: "organize",
    isNew: true,
    badge: "PDF",
    glyph: "mappe",
    title: "Bewerbungsmappe als PDF erstellen – kostenlos | PDF Libre",
    description:
      "Bewerbungsmappe online erstellen: Anschreiben, Lebenslauf und Zeugnisse (PDF, Word, JPG) zu einer PDF zusammenfügen, mit Deckblatt und automatisch unter 5 MB. Kostenlos, ohne Anmeldung.",
    h1: "Bewerbungsmappe als PDF erstellen",
    lead: "Lade Anschreiben, Lebenslauf und Zeugnisse hoch – als PDF, Word oder Foto. Du bekommst eine saubere PDF in der richtigen Reihenfolge, klein genug für jedes Bewerbungsportal.",
    ui: {
      mode: "server",
      endpoint: "/api/bewerbungsmappe",
      input: { accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx,.odt,.rtf", label: "Dokumente" },
      multiple: true,
      min: 1,
      sortable: true,
      showSavings: false,
      action: "Bewerbungsmappe erstellen",
      dropHint: "PDF, Word (DOCX), JPG oder PNG – bis zu 50 MB pro Datei",
      options: [
        {
          type: "select",
          name: "cover",
          label: "Deckblatt",
          choices: [
            { value: "yes", label: "Mit Deckblatt" },
            { value: "no", label: "Ohne Deckblatt" },
          ],
        },
        { type: "text", name: "name", label: "Dein Name", placeholder: "Max Mustermann", maxlength: 80, showIf: "cover=yes" },
        { type: "text", name: "position", label: "Stelle", placeholder: "z. B. Werkstudent Data Science", maxlength: 100, showIf: "cover=yes" },
        { type: "text", name: "company", label: "Unternehmen", placeholder: "z. B. Muster GmbH", maxlength: 100, showIf: "cover=yes" },
        { type: "text", name: "email", label: "E-Mail (optional)", maxlength: 100, showIf: "cover=yes" },
        { type: "text", name: "phone", label: "Telefon (optional)", maxlength: 40, showIf: "cover=yes" },
        { type: "text", name: "address", label: "Wohnort (optional)", maxlength: 100, showIf: "cover=yes" },
        {
          type: "select",
          name: "maxMb",
          label: "Maximale Dateigröße",
          choices: [
            { value: "5", label: "Unter 5 MB (empfohlen)" },
            { value: "2", label: "Unter 2 MB" },
            { value: "10", label: "Unter 10 MB" },
            { value: "0", label: "Keine Begrenzung" },
          ],
        },
        {
          type: "select",
          name: "pageNumbers",
          label: "Seitenzahlen",
          choices: [
            { value: "yes", label: "Seitenzahlen einfügen" },
            { value: "no", label: "Keine Seitenzahlen" },
          ],
        },
      ],
    },
    steps: [
      ["Dokumente auswählen", "Lade Anschreiben, Lebenslauf, Zeugnisse und Zertifikate hoch. Word-Dateien und Fotos werden automatisch in PDF umgewandelt."],
      ["Reihenfolge festlegen", "Ziehe die Dateien in die richtige Reihenfolge – üblich ist: Anschreiben, Lebenslauf, Arbeitszeugnisse, Abschlusszeugnisse, Zertifikate."],
      ["Deckblatt ausfüllen", "Trage Name, Stelle und Unternehmen ein. Das Deckblatt enthält automatisch ein Inhaltsverzeichnis. Du kannst es auch weglassen."],
      ["Erstellen und herunterladen", "Klicke auf „Bewerbungsmappe erstellen“. Die PDF wird auf die gewählte Größe verkleinert und ist bereit zum Hochladen."],
    ],
    article: [
      {
        h: "Warum eine einzige PDF?",
        p: [
          "Personalabteilungen und Bewerbungsportale erwarten meist eine einzige PDF-Datei. Viele Portale erlauben nur 2 oder 5 MB. Mit diesem Werkzeug musst du nicht zwischen Word, Scanner-App und Kompressionsseite wechseln: Alles wird in einem Schritt zusammengefügt, sortiert und verkleinert.",
        ],
      },
      {
        h: "Die richtige Reihenfolge der Bewerbungsunterlagen",
        p: [
          "Bewährt hat sich: Deckblatt (optional), Anschreiben, Lebenslauf, dann die Zeugnisse – das neueste Arbeitszeugnis zuerst, danach Abschluss- und Schulzeugnisse – und am Ende Zertifikate und Nachweise. Benenne deine Dateien sinnvoll (z. B. „Lebenslauf“ statt „Scan_0042“), denn die Dateinamen erscheinen im Inhaltsverzeichnis des Deckblatts.",
        ],
      },
    ],
    faq: [
      ["Welche Dateien kann ich hochladen?", "PDF, Word (DOC, DOCX, ODT, RTF) sowie Fotos und Scans als JPG oder PNG. Fotos werden auf A4-Seiten gesetzt."],
      ["Wie wird die Datei unter 5 MB gebracht?", "Bilder in den Dokumenten werden schrittweise verkleinert, bis die gewünschte Größe erreicht ist. Text bleibt scharf und durchsuchbar."],
      ["Woher kommt das Inhaltsverzeichnis?", "Aus den Dateinamen. „Lebenslauf_Max_Mustermann.pdf“ erscheint als „Lebenslauf Max Mustermann“."],
      ["Werden meine Unterlagen gespeichert?", "Nein. Alle Dateien werden direkt nach dem Erstellen gelöscht."],
    ],
    related: ["merge", "compress", "jpg-to-pdf", "docx-to-pdf"],
  },

  // ------------------------------------------------------------------ PDF → EXCEL
  {
    slug: "pdf-to-excel",
    name: "PDF in Excel",
    short: "Tabellen aus PDFs in bearbeitbare Excel-Tabellen umwandeln.",
    cat: "from-pdf",
    isNew: true,
    badge: "XLS",
    glyph: "table",
    title: "PDF in Excel umwandeln – Tabellen kostenlos konvertieren | PDF Libre",
    description:
      "PDF in Excel umwandeln: Tabellen aus Kontoauszügen, Rechnungen und Berichten als XLSX mit echten Zahlen. Kostenlos, ohne Anmeldung, Datei wird sofort gelöscht.",
    h1: "PDF in Excel umwandeln",
    lead: "Hol Tabellen aus deiner PDF heraus – mit echten Zahlen, mit denen du in Excel, LibreOffice oder Google Tabellen weiterrechnen kannst.",
    ui: {
      mode: "server",
      endpoint: "/api/pdf-to-excel",
      input: PDF,
      action: "In Excel umwandeln",
      dropHint: "PDF-Datei mit Text (keine Scans), bis zu 50 MB",
    },
    steps: [
      ["PDF auswählen", "Wähle die PDF mit den Tabellen aus, z. B. einen Kontoauszug, eine Rechnung oder einen Bericht."],
      ["Umwandeln", "Klicke auf „In Excel umwandeln“. Tabellen werden erkannt – auch ohne sichtbare Linien."],
      ["Excel-Datei öffnen", "Jede Tabelle landet auf einem eigenen Blatt. Zahlen sind echte Zahlen, mit denen du direkt rechnen kannst."],
    ],
    article: [
      {
        h: "Wofür ist PDF in Excel praktisch?",
        p: [
          "Kontoauszüge für die Haushaltsplanung, Preislisten von Lieferanten, Tabellen aus Studien oder Berichten: Abtippen kostet Zeit und erzeugt Fehler. Das Werkzeug erkennt Zeilen und Spalten und wandelt deutsche Zahlenformate wie „1.234,56“ in echte Zahlen um.",
        ],
      },
      {
        h: "Grenzen",
        p: [
          "Am besten klappt es mit PDFs, die aus einem Programm erstellt wurden (z. B. Online-Banking, Word, Excel). Gescannte Seiten sind Bilder ohne Text und können nicht umgewandelt werden. Bei sehr komplexen Tabellen mit verbundenen Zellen lohnt sich ein kurzer Blick auf das Ergebnis.",
        ],
      },
    ],
    faq: [
      ["Werden Tabellen ohne Linien erkannt?", "Ja. Spalten werden auch an den Abständen zwischen den Wörtern erkannt."],
      ["Was passiert mit Text außerhalb von Tabellen?", "Er landet zeilenweise auf einem eigenen Blatt, damit nichts verloren geht."],
      ["Funktioniert das mit gescannten PDFs?", "Nein, gescannte Seiten enthalten keinen Text, sondern nur ein Bild."],
      ["Wird meine Datei gespeichert?", "Nein, sie wird direkt nach der Umwandlung gelöscht."],
    ],
    related: ["pdf-to-docx", "excel-to-pdf", "pdf-to-powerpoint", "split"],
  },

  // ------------------------------------------------------------------ PDF → POWERPOINT
  {
    slug: "pdf-to-powerpoint",
    name: "PDF in PowerPoint",
    short: "PDF in eine PowerPoint-Präsentation mit bearbeitbarem Text umwandeln.",
    cat: "from-pdf",
    isNew: true,
    badge: "PPT",
    glyph: "slides",
    title: "PDF in PowerPoint umwandeln – PDF zu PPTX kostenlos | PDF Libre",
    description:
      "PDF in PowerPoint umwandeln: Jede Seite wird eine Folie, Text bleibt bearbeitbar. PDF zu PPTX kostenlos, ohne Anmeldung, Datei wird sofort gelöscht.",
    h1: "PDF in PowerPoint umwandeln",
    lead: "Mach aus einer PDF wieder eine bearbeitbare Präsentation – jede Seite wird eine Folie.",
    ui: {
      mode: "server",
      endpoint: "/api/pdf-to-powerpoint",
      input: PDF,
      action: "In PowerPoint umwandeln",
      dropHint: "PDF-Datei, bis zu 50 MB",
    },
    steps: [
      ["PDF auswählen", "Wähle die PDF aus, z. B. eine als PDF gespeicherte Präsentation."],
      ["Umwandeln", "Klicke auf „In PowerPoint umwandeln“."],
      ["Bearbeiten", "Öffne die PPTX-Datei in PowerPoint, Keynote, LibreOffice oder Google Präsentationen und ändere Texte direkt."],
    ],
    article: [
      {
        h: "Präsentation verloren, nur die PDF übrig?",
        p: [
          "Oft gibt es von einem Vortrag nur noch die PDF-Version. Mit diesem Werkzeug bekommst du wieder Folien, auf denen du Texte ändern, Folien löschen oder ergänzen kannst. Texte werden als echte Textfelder übernommen, Bilder und Formen bleiben an ihrem Platz.",
        ],
      },
    ],
    faq: [
      ["Bleibt der Text bearbeitbar?", "Ja. Texte werden als Textfelder übernommen. Schriften, die nicht installiert sind, ersetzt PowerPoint durch eine ähnliche Schrift."],
      ["Welche Programme öffnen die Datei?", "PowerPoint, Keynote, LibreOffice Impress und Google Präsentationen."],
      ["Wird meine Datei gespeichert?", "Nein, sie wird direkt nach der Umwandlung gelöscht."],
    ],
    related: ["ppt-to-pdf", "pdf-to-docx", "pdf-to-excel", "pdf-to-jpg"],
  },

  // ------------------------------------------------------------------ KI: ZUSAMMENFASSEN
  {
    slug: "summarize",
    name: "PDF zusammenfassen",
    short: "Lange Dokumente und Behördenbriefe in Sekunden verstehen – mit KI.",
    cat: "ai",
    pro: true,
    isNew: true,
    badge: "KI",
    glyph: "summary",
    title: "PDF zusammenfassen mit KI – online | PDF Libre",
    description:
      "PDF mit KI zusammenfassen: Kernaussagen, Fristen und To-dos aus Verträgen, Behördenbriefen, Studien und Skripten in Sekunden. Zusammenfassung auf Deutsch oder in anderen Sprachen.",
    h1: "PDF zusammenfassen mit KI",
    lead: "Lade eine PDF hoch und lies in Sekunden, worum es geht – mit Fristen, Beträgen und dem, was du tun musst.",
    ui: {
      mode: "server",
      endpoint: "/api/ai/summarize",
      input: PDF,
      action: "Zusammenfassen",
      dropHint: "PDF mit Text, bis zu 50 MB",
      options: [
        {
          type: "select",
          name: "length",
          label: "Länge",
          choices: [
            { value: "medium", label: "Normal – Überblick und Kernpunkte" },
            { value: "short", label: "Kurz – höchstens 5 Punkte" },
            { value: "long", label: "Ausführlich – Abschnitt für Abschnitt" },
          ],
        },
        {
          type: "select",
          name: "lang",
          label: "Sprache der Zusammenfassung",
          choices: [{ value: "de", label: "Deutsch" }, { value: "auto", label: "Wie das Dokument" }, ...LANG_CHOICES.filter((l) => l.value !== "de")],
        },
      ],
    },
    steps: [
      ["PDF auswählen", "Wähle das Dokument aus – zum Beispiel einen Brief vom Amt, einen Vertrag, ein Vorlesungsskript oder eine Studie."],
      ["Länge und Sprache wählen", "Kurz für den schnellen Überblick, ausführlich zum Lernen. Die Zusammenfassung kann auch in einer anderen Sprache erstellt werden."],
      ["Zusammenfassen", "Die KI liest das Dokument und schreibt eine Zusammenfassung mit den wichtigsten Punkten, Fristen und To-dos."],
      ["Lesen und speichern", "Lies die Zusammenfassung direkt auf der Seite oder lade sie als PDF herunter. Mit Pro: unbegrenzt."],
    ],
    article: [
      {
        h: "Behördenbriefe und Verträge verstehen",
        p: [
          "Bescheide, Mahnungen, Mietverträge oder Versicherungsbedingungen sind oft lang und kompliziert. Die Zusammenfassung zeigt in einfachen Worten, worum es geht – und listet unter „Was ist zu tun?“ Fristen, Beträge und nötige Schritte auf. Gerade wenn Deutsch nicht deine Muttersprache ist, kannst du die Zusammenfassung direkt auf Englisch, Französisch oder Türkisch erstellen lassen.",
        ],
      },
      {
        h: "Lernen mit Skripten und Studien",
        p: [
          "Für Studium und Schule fasst „Ausführlich“ ein Skript Abschnitt für Abschnitt zusammen – ideal zum Wiederholen vor der Prüfung. Sehr lange Dokumente werden in Teilen gelesen und danach zu einer Gesamtzusammenfassung verbunden.",
        ],
      },
    ],
    faq: [
      ["Was kostet die Zusammenfassung?", "PDF zusammenfassen gehört zu PDF Libre Pro: 14 Tage kostenlos testen, danach im Abo oder mit Tagespass."],
      ["Wie genau ist die Zusammenfassung?", "Die KI gibt nur wieder, was im Dokument steht. Bei wichtigen Entscheidungen prüfe Fristen und Beträge trotzdem im Original."],
      ["Funktioniert das mit gescannten PDFs?", "Nein, gescannte Seiten sind Bilder ohne Text."],
      ["Was passiert mit meinem Dokument?", "Der Text wird verschlüsselt an den KI-Dienst übertragen, nur für die Zusammenfassung verwendet und nicht gespeichert. Die Datei wird direkt danach gelöscht."],
    ],
    related: ["translate", "pdf-to-docx", "split", "compress"],
    free: {
      short: "Lange Dokumente und Behördenbriefe in Sekunden verstehen – mit KI. Kostenlos.",
      steps: { 3: ["Lesen und speichern", "Lies die Zusammenfassung direkt auf der Seite oder lade sie als PDF herunter."] },
      faq: { 0: ["Was kostet die Zusammenfassung?", "Nichts. PDF zusammenfassen ist kostenlos und ohne Anmeldung nutzbar (mit einer fairen Begrenzung pro Stunde)."] },
    },
  },

  // ------------------------------------------------------------------ KI: ÜBERSETZEN
  {
    slug: "translate",
    name: "PDF übersetzen",
    short: "PDF in eine andere Sprache übersetzen – Layout, Bilder und Tabellen bleiben.",
    cat: "ai",
    pro: true,
    isNew: true,
    badge: "KI",
    glyph: "translate",
    title: "PDF übersetzen mit KI – Layout bleibt erhalten | PDF Libre",
    description:
      "PDF online übersetzen: Deutsch, Englisch, Französisch, Spanisch, Türkisch und mehr. Der übersetzte Text steht an derselben Stelle, Bilder und Tabellen bleiben erhalten.",
    h1: "PDF übersetzen",
    lead: "Übersetze Dokumente mit KI in eine andere Sprache. Der neue Text steht dort, wo der alte stand – Bilder, Tabellen und Layout bleiben.",
    ui: {
      mode: "server",
      endpoint: "/api/ai/translate",
      input: PDF,
      action: "Übersetzen",
      dropHint: "PDF mit Text, bis zu 30 Seiten",
      options: [{ type: "select", name: "lang", label: "Übersetzen nach", choices: LANG_CHOICES }],
    },
    steps: [
      ["PDF auswählen", "Wähle das Dokument aus, das du übersetzen möchtest – bis zu 30 Seiten."],
      ["Sprache wählen", "Wähle die Zielsprache. Die Ausgangssprache wird automatisch erkannt."],
      ["Übersetzen", "Die KI übersetzt jeden Textabschnitt und setzt ihn an dieselbe Stelle. Längere Übersetzungen werden automatisch etwas kleiner gesetzt."],
      ["Herunterladen", "Lade die übersetzte PDF herunter. Mit Pro: unbegrenzt."],
    ],
    article: [
      {
        h: "Übersetzen, ohne das Layout zu zerstören",
        p: [
          "Wer eine PDF in ein Übersetzungsprogramm kopiert, verliert Tabellen, Bilder und Formatierung. Hier bleibt die Seite, wie sie ist: Nur der Text wird ausgetauscht. Das eignet sich für Briefe, Formulare, Anleitungen, Zeugnisse zum Verstehen und Unterlagen für Familie oder Kollegen.",
          "Hinweis: Für Behörden brauchst du bei offiziellen Dokumenten meist eine beglaubigte Übersetzung. Die KI-Übersetzung hilft beim Verstehen, ersetzt diese aber nicht.",
        ],
      },
    ],
    faq: [
      ["Was kostet die Übersetzung?", "PDF übersetzen gehört zu PDF Libre Pro: 14 Tage kostenlos testen, danach im Abo oder mit Tagespass."],
      ["Welche Sprachen gibt es?", "Deutsch, Englisch, Französisch, Spanisch, Italienisch, Portugiesisch, Niederländisch, Polnisch, Türkisch, Rumänisch, Russisch und Ukrainisch."],
      ["Wie viele Seiten kann ich übersetzen?", "Bis zu 30 Seiten auf einmal. Größere Dokumente teilst du vorher mit „PDF teilen“."],
      ["Was passiert mit meinem Dokument?", "Der Text wird verschlüsselt an den KI-Dienst übertragen, nur für die Übersetzung verwendet und nicht gespeichert. Die Datei wird direkt danach gelöscht."],
    ],
    related: ["summarize", "split", "pdf-to-docx", "edit"],
    free: {
      short: "PDF in eine andere Sprache übersetzen – Layout, Bilder und Tabellen bleiben. Kostenlos.",
      steps: { 3: ["Herunterladen", "Lade die übersetzte PDF herunter."] },
      faq: { 0: ["Was kostet die Übersetzung?", "Nichts. PDF übersetzen ist kostenlos und ohne Anmeldung nutzbar (mit einer fairen Begrenzung pro Stunde)."] },
    },
  },
];

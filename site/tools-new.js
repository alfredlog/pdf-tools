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

      {
        h: "Bewerbungsmappe online erstellen – für jede Art von Bewerbung",
        p: [
          "Ob Bewerbung für eine Ausbildung, ein Praktikum, einen Werkstudentenjob, einen Nebenjob, ein duales Studium oder eine Festanstellung: Eine vollständige Bewerbungsmappe als PDF ist heute der Standard. Auch für die Initiativbewerbung, die Bewerbung um einen Studienplatz oder ein Stipendium brauchst du meist eine einzige, übersichtliche PDF-Datei.",
          "Die Bewerbungsmappe von PDF Libre läuft komplett online im Browser – am PC, am Mac, auf dem Tablet und auf dem Handy. Du musst kein Programm installieren und kein Konto anlegen.",
        ],
      },
      {
        h: "Was gehört in eine Bewerbungsmappe?",
        p: [
          "Pflicht sind Anschreiben und Lebenslauf. Dazu kommen die Nachweise, die zur Stelle passen: Arbeitszeugnisse, Ausbildungs- oder Hochschulzeugnis, das letzte Schulzeugnis (vor allem bei Bewerbungen für eine Ausbildung), Sprachzertifikate, Weiterbildungen und Praktikumsbescheinigungen. Ein Deckblatt und ein Motivationsschreiben („dritte Seite“) sind optional.",
        ],
      },
    ],
    faq: [
      ["Welche Dateien kann ich hochladen?", "PDF, Word (DOC, DOCX, ODT, RTF) sowie Fotos und Scans als JPG oder PNG. Fotos werden auf A4-Seiten gesetzt."],
      ["Wie wird die Datei unter 5 MB gebracht?", "Bilder in den Dokumenten werden schrittweise verkleinert, bis die gewünschte Größe erreicht ist. Text bleibt scharf und durchsuchbar."],
      ["Woher kommt das Inhaltsverzeichnis?", "Aus den Dateinamen. „Lebenslauf_Max_Mustermann.pdf“ erscheint als „Lebenslauf Max Mustermann“."],
      ["Wie groß darf eine Bewerbungsmappe als PDF sein?", "Die meisten Bewerbungsportale erlauben 2 bis 5 MB. Wähle einfach die passende Grenze – die Mappe wird automatisch verkleinert."],
      ["Kann ich die Bewerbungsmappe auf dem Handy erstellen?", "Ja. Die Seite funktioniert auch auf dem Smartphone: Fotos von Zeugnissen direkt aus der Galerie auswählen, Reihenfolge festlegen, fertig."],
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
      mode: "slides",
      endpoint: "/api/slides/analyze",
      input: PDF,
      action: "PowerPoint herunterladen",
    },
    steps: [
      ["PDF auswählen", "Wähle die PDF aus, z. B. Vorlesungsfolien oder eine als PDF gespeicherte Präsentation."],
      ["Design wählen", "Sieh dir die Folien in der Vorschau an und wähle Design, Hintergrund, Akzentfarbe, Schrift und Format."],
      ["Herunterladen", "Lade die PPTX-Datei herunter und ändere Texte direkt in PowerPoint, Keynote, LibreOffice oder Google Präsentationen."],
    ],
    article: [
      {
        h: "Präsentation verloren, nur die PDF übrig?",
        p: [
          "Oft gibt es von einem Vortrag nur noch die PDF-Version. Mit diesem Werkzeug bekommst du wieder Folien, auf denen du Texte ändern, Folien löschen oder ergänzen kannst. Texte werden als echte Textfelder übernommen, Bilder und Formen bleiben an ihrem Platz.",
        ],
      },
      {
        h: "Neues Design mit einem Klick",
        p: [
          "Vor dem Herunterladen siehst du alle Folien in einer Vorschau. Wähle ein fertiges Design (Original, Modern, Dunkel, Sanft) oder stelle Hintergrund, Akzentfarbe und Schrift selbst ein. Auf Wunsch wird das Format auf 16:9 umgestellt und die wiederkehrende Kopf- und Fußzeile entfernt.",
          "Auch LaTeX-/Beamer-Folien funktionieren: Der Text wird bearbeitbar, Formeln bleiben gestochen scharf als Bild erhalten.",
        ],
      },
    ],
    faq: [
      ["Bleibt der Text bearbeitbar?", "Ja. Texte werden als Textfelder übernommen. Mathematische Formeln bleiben als Bild erhalten. Schriften, die nicht installiert sind, ersetzt PowerPoint durch eine ähnliche Schrift – oder du wählst vorher selbst eine Standardschrift wie Calibri oder Arial."],
      ["Kann ich das Design ändern?", "Ja. Vor dem Herunterladen wählst du Hintergrund, Akzentfarbe, Schrift und Folienformat und siehst das Ergebnis sofort in der Vorschau."],
      ["Welche Programme öffnen die Datei?", "PowerPoint, Keynote, LibreOffice Impress und Google Präsentationen."],
      ["Wird meine Datei gespeichert?", "Nein. Für die Vorschau bleibt sie höchstens 30 Minuten auf dem Server und wird danach automatisch gelöscht."],
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
  // ------------------------------------------------------------------ OCR
  {
    slug: "ocr",
    name: "PDF durchsuchbar machen (OCR)",
    short: "Gescannte PDFs mit Texterkennung durchsuchbar und kopierbar machen.",
    cat: "edit",
    isNew: true,
    badge: "OCR",
    glyph: "ocr",
    title: "OCR online: PDF durchsuchbar machen – Texterkennung kostenlos | PDF Libre",
    description:
      "Gescannte PDF durchsuchbar machen: Die OCR-Texterkennung erkennt den Text in Scans und Fotos – danach kannst du suchen, markieren und kopieren. Deutsch, Englisch, Französisch. Kostenlos, ohne Anmeldung.",
    h1: "PDF durchsuchbar machen – OCR-Texterkennung",
    lead: "Aus einem Scan wird eine PDF, in der du mit Strg+F suchen und Text kopieren kannst. Das Aussehen der Seiten bleibt genau gleich.",
    ui: {
      mode: "server",
      endpoint: "/api/ocr",
      input: PDF,
      action: "Text erkennen",
      dropHint: "Gescannte PDF, bis zu 50 MB",
      options: [
        {
          type: "select",
          name: "lang",
          label: "Sprache des Dokuments",
          choices: [
            { value: "deu", label: "Deutsch (und Englisch)" },
            { value: "eng", label: "Englisch" },
            { value: "fra", label: "Französisch (und Englisch)" },
            { value: "mix", label: "Gemischt: Deutsch, Englisch, Französisch" },
          ],
        },
      ],
    },
    steps: [
      ["Scan hochladen", "Wähle die gescannte PDF aus – zum Beispiel einen Vertrag, ein Zeugnis, einen Brief oder eine Rechnung."],
      ["Sprache wählen", "Wähle die Sprache des Dokuments. So erkennt die Texterkennung Umlaute und Sonderzeichen richtig."],
      ["Durchsuchbare PDF herunterladen", "Die Seiten sehen genauso aus wie vorher, enthalten jetzt aber eine unsichtbare Textebene zum Suchen und Kopieren."],
    ],
    article: [
      {
        h: "Was ist OCR?",
        p: [
          "OCR steht für „Optical Character Recognition“, auf Deutsch Texterkennung. Ein Scan oder ein Handyfoto ist für den Computer nur ein Bild – man kann darin nicht suchen und keinen Text kopieren. Die OCR erkennt die Buchstaben im Bild und legt den erkannten Text unsichtbar über die Seite. So bleibt das Original unverändert, und trotzdem funktionieren Suche, Markieren und Kopieren.",
        ],
      },
      {
        h: "Wofür braucht man eine durchsuchbare PDF?",
        p: [
          "Für das papierlose Büro und die digitale Ablage, um in alten Verträgen, Kontoauszügen und Briefen schnell eine Stelle zu finden, um Text aus einem Scan in Word zu übernehmen, und weil viele Behörden, Steuerberater und Bewerbungsportale durchsuchbare PDFs bevorzugen. Auch Screenreader können nur PDFs mit Textebene vorlesen – OCR macht Dokumente also barrierefreier.",
        ],
      },
      {
        h: "Tipps für eine gute Texterkennung",
        p: [
          "Scanne mit mindestens 300 dpi, gerade und ohne Schatten. Bei Handyfotos hilft gutes Tageslicht. Handschrift wird nur eingeschränkt erkannt; gedruckter Text in Deutsch, Englisch und Französisch funktioniert sehr zuverlässig. Seiten, die schon Text enthalten, werden nicht verändert.",
        ],
      },
    ],
    faq: [
      ["Verändert die OCR das Aussehen meiner PDF?", "Nein. Die Seiten bleiben Bild für Bild gleich. Es kommt nur eine unsichtbare Textebene dazu."],
      ["Kann ich danach Text in Word kopieren?", "Ja. Markiere den Text in deinem PDF-Programm und kopiere ihn, oder wandle die durchsuchbare PDF mit „PDF in Word“ um."],
      ["Welche Sprachen werden erkannt?", "Deutsch, Englisch und Französisch – auch gemischt in einem Dokument."],
      ["Wird Handschrift erkannt?", "Nur eingeschränkt. Die Texterkennung ist für gedruckten Text gemacht."],
      ["Was passiert mit meinem Dokument?", "Es wird verschlüsselt übertragen, verarbeitet und direkt danach gelöscht."],
    ],
    related: ["redact", "pdf-to-docx", "compress", "pdfa"],
  },

  // ------------------------------------------------------------------ SCHWÄRZEN
  {
    slug: "redact",
    name: "PDF schwärzen",
    short: "Namen, IBAN, E-Mail und Telefonnummern endgültig unkenntlich machen.",
    cat: "security",
    isNew: true,
    badge: "PDF",
    glyph: "redact",
    title: "PDF schwärzen – Namen, IBAN & Daten endgültig entfernen, kostenlos | PDF Libre",
    description:
      "PDF schwärzen online: Namen, Adressen, IBAN, E-Mail-Adressen und Telefonnummern endgültig aus der PDF entfernen – DSGVO-konform anonymisieren. Kostenlos, ohne Anmeldung.",
    h1: "PDF schwärzen – Daten endgültig entfernen",
    lead: "Gib die Begriffe ein, die verschwinden sollen. E-Mail-Adressen, Telefonnummern und IBANs werden auf Wunsch automatisch gefunden. Der Text wird nicht nur überdeckt, sondern wirklich gelöscht.",
    ui: {
      mode: "server",
      endpoint: "/api/redact",
      input: PDF,
      action: "PDF schwärzen",
      options: [
        { type: "text", name: "terms", label: "Zu schwärzende Begriffe", placeholder: "z. B. Max Mustermann, Musterstraße 1", maxlength: 1000, hint: "Mehrere Begriffe mit Komma trennen." },
        {
          type: "select",
          name: "auto",
          label: "Automatisch finden",
          choices: [
            { value: "yes", label: "E-Mail, Telefonnummern und IBAN mitschwärzen" },
            { value: "no", label: "Nur meine Begriffe" },
          ],
        },
      ],
    },
    steps: [
      ["PDF hochladen", "Wähle das Dokument aus, das du weitergeben möchtest – etwa einen Vertrag, eine Rechnung oder einen Kontoauszug."],
      ["Begriffe eingeben", "Trage Namen, Adressen oder Kundennummern ein. E-Mail-Adressen, Telefonnummern und IBANs werden automatisch erkannt."],
      ["Geschwärzte PDF herunterladen", "Alle Fundstellen sind schwarz und der Text darunter ist endgültig gelöscht. Auch die Dokumenteigenschaften (Autor, Titel) werden geleert."],
    ],
    article: [
      {
        h: "Richtig schwärzen statt nur übermalen",
        p: [
          "Ein schwarzer Balken, den man in einem PDF-Programm einfach über den Text legt, ist keine echte Schwärzung: Der Text darunter bleibt erhalten und lässt sich kopieren oder herauslösen. PDF Libre löscht den Text an den geschwärzten Stellen tatsächlich aus der Datei und färbt auch betroffene Bildbereiche schwarz. Danach ist die Information nicht mehr wiederherstellbar.",
        ],
      },
      {
        h: "Wann sollte man eine PDF schwärzen?",
        p: [
          "Bevor du Unterlagen weitergibst, die Daten anderer Personen enthalten: Kontoauszüge für den Mietantrag oder die Wohnungsbewerbung, Gehaltsnachweise, Verträge, Arztbriefe, Gerichtsunterlagen oder Dokumente für eine Veröffentlichung. Schwärzen hilft dabei, nur das Nötigste zu zeigen – im Sinne der Datensparsamkeit nach DSGVO.",
        ],
      },
      {
        h: "Gescannte Dokumente schwärzen",
        p: [
          "Die Suche funktioniert nur, wenn die PDF echten Text enthält. Bei einem Scan wandelst du die Datei deshalb zuerst mit „PDF durchsuchbar machen (OCR)“ um und schwärzt sie danach.",
        ],
      },
    ],
    faq: [
      ["Kann man die Schwärzung rückgängig machen?", "Nein. Der Text unter den schwarzen Balken wird gelöscht, nicht nur verdeckt. Bewahre deshalb dein Original auf."],
      ["Welche Daten werden automatisch erkannt?", "E-Mail-Adressen, Telefonnummern und IBANs. Namen, Adressen und andere Angaben gibst du selbst als Begriffe ein."],
      ["Warum wurde nichts gefunden?", "Wahrscheinlich ist die PDF ein Scan ohne Textebene. Mache sie zuerst mit der OCR durchsuchbar."],
      ["Wird meine Datei gespeichert?", "Nein. Sie wird direkt nach dem Schwärzen gelöscht."],
    ],
    related: ["ocr", "protect", "edit", "remove-pages"],
  },

  // ------------------------------------------------------------------ PDF/A
  {
    slug: "pdfa",
    name: "PDF in PDF/A umwandeln",
    short: "Archivtaugliche PDF/A für Behörden, Gerichte und die digitale Ablage.",
    cat: "to-pdf",
    isNew: true,
    badge: "PDF/A",
    glyph: "archive",
    title: "PDF in PDF/A umwandeln – online & kostenlos (PDF/A-1b, 2b, 3b) | PDF Libre",
    description:
      "PDF in PDF/A konvertieren: archivierbare PDF/A-2b, PDF/A-1b oder PDF/A-3b für Behörden, Gerichte, Elster, Bewerbungen und die revisionssichere Ablage. Kostenlos, ohne Anmeldung.",
    h1: "PDF in PDF/A umwandeln",
    lead: "Behörde, Gericht oder Archiv verlangen PDF/A? Lade deine PDF hoch und bekomme eine archivtaugliche Datei mit eingebetteten Schriften und festem Farbprofil.",
    ui: {
      mode: "server",
      endpoint: "/api/pdfa",
      input: PDF,
      action: "In PDF/A umwandeln",
      options: [
        {
          type: "select",
          name: "level",
          label: "PDF/A-Version",
          choices: [
            { value: "2", label: "PDF/A-2b (empfohlen)" },
            { value: "1", label: "PDF/A-1b (ältere Vorgabe)" },
            { value: "3", label: "PDF/A-3b" },
          ],
        },
      ],
    },
    steps: [
      ["PDF auswählen", "Lade die PDF hoch, die archiviert oder bei einer Stelle eingereicht werden soll."],
      ["Version wählen", "PDF/A-2b passt für fast alle Fälle. Nur wenn ausdrücklich PDF/A-1 verlangt wird, wähle diese Version."],
      ["PDF/A herunterladen", "Schriften werden eingebettet, Farben auf ein festes Profil gebracht und die Datei als PDF/A gekennzeichnet."],
    ],
    article: [
      {
        h: "Was ist PDF/A?",
        p: [
          "PDF/A ist eine genormte Form von PDF (ISO 19005) für die Langzeitarchivierung. Eine PDF/A-Datei enthält alles, was sie zum Anzeigen braucht – Schriften, Farbprofil, Bilder – und verzichtet auf Dinge, die später Probleme machen könnten, etwa externe Inhalte oder Verschlüsselung. So sieht das Dokument auch in 20 Jahren noch genauso aus wie heute.",
        ],
      },
      {
        h: "Wo wird PDF/A verlangt?",
        p: [
          "Bei Gerichten und im elektronischen Rechtsverkehr (beA), bei vielen Behörden und Ämtern, bei Ausschreibungen, Förderanträgen und Abschlussarbeiten an Hochschulen sowie für die revisionssichere Archivierung von Geschäftsunterlagen nach GoBD. Auch die E-Rechnung im ZUGFeRD-Format basiert auf PDF/A-3.",
        ],
      },
      {
        h: "PDF/A-1b, 2b oder 3b?",
        p: [
          "PDF/A-2b ist heute der Standard und unterstützt Transparenzen und moderne Kompression. PDF/A-1b ist die älteste und strengste Version – nur wählen, wenn sie ausdrücklich gefordert ist. PDF/A-3b erlaubt zusätzlich eingebettete Dateien. Das „b“ steht für „basic“: Das Aussehen des Dokuments ist dauerhaft gesichert.",
        ],
      },
    ],
    faq: [
      ["Ist meine Datei danach wirklich PDF/A-konform?", "Die Umwandlung erzeugt eine PDF/A-Datei mit eingebetteten Schriften und Farbprofil. Bei ungewöhnlichen Dateien (z. B. mit Formularen oder Anhängen) empfiehlt sich eine Prüfung mit einem Validator wie veraPDF."],
      ["Kann ich eine passwortgeschützte PDF umwandeln?", "Nein, PDF/A erlaubt keine Verschlüsselung. Entsperre die Datei zuerst mit „PDF entsperren“."],
      ["Wird die Datei größer?", "Oft etwas, weil alle Schriften vollständig eingebettet werden. Das ist gewollt."],
      ["Was passiert mit meiner Datei?", "Sie wird nach der Umwandlung sofort gelöscht."],
    ],
    related: ["compress", "ocr", "merge", "e-rechnung-pruefen"],
  },

  // ------------------------------------------------------------------ FOTOS / HEIC → PDF
  {
    slug: "heic-to-pdf",
    name: "HEIC in PDF",
    short: "iPhone-Fotos (HEIC) und andere Bilder in eine PDF umwandeln.",
    cat: "to-pdf",
    isNew: true,
    badge: "HEIC",
    glyph: "phone",
    title: "HEIC in PDF umwandeln – iPhone-Fotos zu PDF, kostenlos | PDF Libre",
    description:
      "HEIC in PDF umwandeln: iPhone-Fotos (HEIC/HEIF) sowie JPG, PNG und WebP zu einer PDF zusammenfassen – richtig gedreht, auf A4 und klein genug zum Versenden. Kostenlos, ohne Anmeldung.",
    h1: "HEIC in PDF umwandeln",
    lead: "Dein iPhone speichert Fotos als HEIC – viele Portale nehmen das nicht an. Lade die Fotos hoch und bekomme eine saubere PDF mit A4-Seiten.",
    ui: {
      mode: "server",
      endpoint: "/api/photos-to-pdf",
      input: { accept: ".heic,.heif,.jpg,.jpeg,.png,.webp,image/heic,image/heif,image/jpeg,image/png,image/webp", label: "Foto" },
      multiple: true,
      sortable: true,
      min: 1,
      action: "In PDF umwandeln",
      dropHint: "HEIC, JPG, PNG oder WebP – bis zu 50 MB pro Datei",
    },
    steps: [
      ["Fotos auswählen", "Wähle die Fotos vom iPhone oder aus deinem Ordner aus – HEIC, JPG, PNG und WebP gehen gemischt."],
      ["Reihenfolge festlegen", "Ziehe die Fotos in die gewünschte Reihenfolge. Jedes Foto wird eine Seite."],
      ["PDF herunterladen", "Die Fotos werden automatisch richtig gedreht, auf A4 gesetzt und verkleinert."],
    ],
    article: [
      {
        h: "Was ist HEIC?",
        p: [
          "HEIC (High Efficiency Image Container) ist das Standard-Fotoformat auf iPhone und iPad. Es spart viel Speicherplatz, wird aber von vielen Webseiten, Behördenportalen und Windows-Programmen nicht unterstützt. Wenn du ein Dokument, einen Ausweis, eine Quittung oder ein Zeugnis mit dem iPhone fotografiert hast, ist eine PDF meist die einfachste Lösung.",
        ],
      },
      {
        h: "iPhone-Fotos als PDF für Bewerbung, Uni und Amt",
        p: [
          "Ob Krankmeldung für den Arbeitgeber, Nachweis für die Uni, Belege für die Steuererklärung oder Unterlagen für das Bürgeramt: Mit diesem Werkzeug wandelst du mehrere Fotos in einem Schritt in eine einzige PDF um. Querformat-Fotos bekommen eine Querformat-Seite, alles andere wird auf A4 hochkant gesetzt.",
        ],
      },
    ],
    faq: [
      ["Kann ich HEIC und JPG mischen?", "Ja. HEIC, HEIF, JPG, PNG und WebP können gemischt hochgeladen werden."],
      ["Werden die Fotos richtig herum gedreht?", "Ja. Die Ausrichtung aus den Kameradaten wird berücksichtigt."],
      ["Wie groß wird die PDF?", "Die Fotos werden auf eine für A4 passende Auflösung verkleinert. Ist die PDF trotzdem zu groß, nutze danach „PDF komprimieren“."],
      ["Werden meine Fotos gespeichert?", "Nein. Sie werden direkt nach der Umwandlung gelöscht."],
    ],
    related: ["jpg-to-pdf", "zeugnisse-als-pdf", "compress", "merge"],
  },
  // ------------------------------------------------------------------ LEBENSLAUF ERSTELLEN
  {
    slug: "lebenslauf-erstellen",
    name: "Lebenslauf erstellen",
    short: "ATS-freundlicher Lebenslauf als PDF – mit Vorlagen und Live-Vorschau.",
    cat: "organize",
    isNew: true,
    badge: "CV",
    glyph: "cv",
    title: "Lebenslauf erstellen – kostenlos, ATS-freundlich, als PDF | PDF Libre",
    description:
      "Lebenslauf online erstellen: Formular ausfüllen, Vorlage wählen (Modern, Klassisch, LaTeX-Stil, Kompakt) und als ATS-freundliche PDF herunterladen. Mit Live-Vorschau und ATS-Check. Kostenlos, ohne Anmeldung.",
    h1: "Lebenslauf erstellen – ATS-freundlich und kostenlos",
    lead: "Fülle das Formular aus, wähle eine Vorlage und sieh sofort, wie dein Lebenslauf aussieht. Die PDF ist so aufgebaut, dass Bewerbermanagementsysteme (ATS) jede Angabe richtig lesen.",
    ui: { mode: "cv", endpoint: "/api/cv/pdf" },
    steps: [
      ["Angaben eintragen oder importieren", "Fülle das Formular aus, lade ein Beispiel – oder importiere deinen bisherigen Lebenslauf als PDF oder Word-Datei. Die KI überträgt alle Angaben automatisch ins Formular."],
      ["Vorlage wählen", "Modern, Klassisch, Akademisch im LaTeX-Stil oder Kompakt. Farbe und Sprache (Deutsch/Englisch) stellst du oben ein."],
      ["Vorschau prüfen", "Rechts siehst du live die fertige PDF und einen ATS-Check mit Hinweisen, was noch fehlt."],
      ["PDF herunterladen", "Lade den Lebenslauf herunter. Mit „Entwurf speichern“ bekommst du zusätzlich eine kleine Datei, mit der du ihn später weiterbearbeitest."],
    ],
    article: [
      {
        h: "Was bedeutet ATS-freundlich?",
        p: [
          "Viele Unternehmen – vom Konzern bis zum Mittelständler – lesen Bewerbungen zuerst mit einem Bewerbermanagementsystem (Applicant Tracking System, ATS) ein. Die Software zieht Name, Kontaktdaten, Stationen und Kenntnisse aus der PDF und sortiert nach Stichworten. Lebensläufe mit mehreren Spalten, Text in Grafiken, Icons statt Wörtern oder exotischen Schriften werden dabei oft falsch oder gar nicht gelesen.",
          "Die Vorlagen von PDF Libre sind deshalb einspaltig, verwenden echten, markierbaren Text mit sauber eingebetteten Schriften, übliche Überschriften wie „Berufserfahrung“, „Ausbildung“ und „Kenntnisse“ und ein einheitliches Datumsformat. So sieht dein Lebenslauf für Menschen gut aus und ist für Maschinen eindeutig lesbar.",
        ],
      },
      {
        h: "Lebenslauf-Vorlagen: Modern, Klassisch, LaTeX-Stil und Kompakt",
        p: [
          "„Modern“ wirkt frisch mit einer Akzentfarbe deiner Wahl – gut für IT, Marketing, Start-ups und Werkstudentenstellen. „Klassisch“ mit Serifenschrift passt zu Banken, Verwaltung, Recht und Industrie. „Akademisch“ setzt deinen Lebenslauf in der Schrift Latin Modern, die man aus LaTeX kennt – ideal für Wissenschaft, Promotion, Stipendien und technische Studiengänge, ganz ohne LaTeX-Kenntnisse. „Kompakt“ bringt viel Inhalt auf eine Seite.",
        ],
      },
      {
        h: "Tabellarischer Lebenslauf: Aufbau und Reihenfolge",
        p: [
          "In Deutschland ist der tabellarische Lebenslauf in umgekehrt chronologischer Reihenfolge üblich: die aktuellste Station zuerst. Ein guter Aufbau: Kontaktdaten, kurzes Profil, Berufserfahrung (inklusive Praktika und Werkstudentenjobs), Ausbildung und Studium, Projekte, Kenntnisse, Sprachen, Ehrenamt und Interessen. Für Berufseinsteiger, Schüler und Studierende darf die Ausbildung auch vor der Berufserfahrung stehen – die Reihenfolge der Abschnitte kannst du mit den Pfeilen ändern.",
          "Beschreibe bei jeder Station kurz, was du gemacht und erreicht hast – am besten mit Zahlen („Berichte automatisiert, spart 6 Stunden pro Woche“). Ein bis zwei Seiten reichen fast immer.",
        ],
      },
      {
        h: "Alten Lebenslauf importieren und mit KI korrigieren",
        p: [
          "Du hast schon einen Lebenslauf in Word, als PDF oder aus einem anderen Generator? Klicke auf „Lebenslauf importieren“: Der Text wird ausgelesen – bei Scans sogar per Texterkennung – und von der KI in die richtigen Felder übertragen. Die KI übernimmt dabei nur, was in deinem Lebenslauf steht, und erfindet nichts dazu. So bringst du einen alten Lebenslauf in wenigen Minuten in ein modernes, ATS-freundliches Design.",
          "Mit „Rechtschreibung prüfen (KI)“ findet die KI Tipp-, Rechtschreib- und Grammatikfehler. Jede Korrektur wird dir vorher angezeigt – rot das Original, grün der Vorschlag – und du entscheidest einzeln, was übernommen wird.",
        ],
      },
      {
        h: "Lebenslauf mit oder ohne Foto?",
        p: [
          "Ein Bewerbungsfoto ist in Deutschland freiwillig. Viele Arbeitgeber und ATS-Systeme bevorzugen Lebensläufe ohne Foto, um fair auszuwählen; in manchen Branchen ist ein professionelles Foto aber weiterhin üblich. Mit PDF Libre entscheidest du selbst: Foto hinzufügen oder einfach weglassen.",
        ],
      },
      {
        h: "Lebenslauf später bearbeiten – ohne Konto",
        p: [
          "Dein Entwurf wird automatisch in deinem Browser gespeichert. Mit „Entwurf speichern“ lädst du zusätzlich eine kleine Entwurfsdatei herunter. Öffne sie später über „Entwurf öffnen“ – alle Felder sind sofort ausgefüllt, auch auf einem anderen Gerät. So passt du deinen Lebenslauf schnell an jede neue Bewerbung an.",
          "Die PDF, die du an Unternehmen schickst, enthält dagegen nur das, was man sieht: keine versteckten Daten, keine Anhänge, keine ausgeblendeten Abschnitte.",
        ],
      },
    ],
    faq: [
      ["Ist der Lebenslauf-Generator kostenlos?", "Ja. Alle Vorlagen, die Live-Vorschau, der ATS-Check und der PDF-Download sind kostenlos, ohne Anmeldung und ohne Wasserzeichen."],
      ["Ist der Lebenslauf ATS-freundlich?", "Ja. Er ist einspaltig, enthält echten Text mit eingebetteten Schriften und verwendet übliche Überschriften. Bewerbermanagementsysteme können Name, Kontaktdaten, Stationen und Kenntnisse zuverlässig auslesen."],
      ["Kann ich den Lebenslauf auf Englisch erstellen?", "Ja. Stelle oben die Sprache auf Englisch – Überschriften wie „Experience“, „Education“ und „Skills“ werden automatisch angepasst. Deine Texte schreibst du selbst in der gewünschten Sprache."],
      ["Wie bearbeite ich meinen Lebenslauf später?", "Speichere mit „Entwurf speichern“ die Entwurfsdatei und öffne sie später über „Entwurf öffnen“. Alle Angaben werden wieder ins Formular übernommen. Im selben Browser bleibt dein Entwurf auch so erhalten."],
      ["Enthält die PDF versteckte Daten?", "Nein. Die PDF für deine Bewerbung enthält nur den sichtbaren Lebenslauf – keine Anhänge und keine ausgeblendeten Abschnitte."],
      ["Werden meine Daten gespeichert?", "Nein. Deine Angaben werden nur zum Erstellen der PDF an den Server geschickt und sofort wieder gelöscht. Der Entwurf liegt ausschließlich in deinem Browser."],
      ["Kann ich meinen alten Lebenslauf übernehmen?", "Ja. Über „Lebenslauf importieren“ lädst du eine PDF oder Word-Datei hoch; die KI überträgt alle Angaben ins Formular. Prüfe danach kurz, ob alles richtig zugeordnet ist."],
      ["Verändert die Rechtschreibprüfung meine Inhalte?", "Nein. Sie korrigiert nur Rechtschreibung, Grammatik und Zeichensetzung. Du siehst jede Änderung vorher und entscheidest selbst."],
      ["Wie füge ich Anschreiben und Zeugnisse hinzu?", "Lade den fertigen Lebenslauf zusammen mit Anschreiben und Zeugnissen in „Bewerbungsmappe erstellen“ – dort wird alles zu einer PDF zusammengefügt."],
    ],
    related: ["bewerbungsmappe", "bewerbung-pdf-zusammenfuegen", "lebenslauf-pdf", "bewerbung-deckblatt"],
  },
];

/**
 * Alle Werkzeuge von PDF Libre an einem Ort.
 * Texte hier ändern → `npm run build` → die HTML-Seiten in /public werden neu erzeugt.
 *
 * mode: "server" = Datei wird hochgeladen und auf dem Server verarbeitet (Ghostscript/LibreOffice/Python)
 *       "client" = läuft komplett im Browser, die Datei verlässt das Gerät nicht
 */

const categories = [
  { id: "organize", name: "Organisieren", color: "organize" },
  { id: "optimize", name: "Optimieren", color: "optimize" },
  { id: "to-pdf", name: "In PDF umwandeln", color: "topdf" },
  { id: "from-pdf", name: "PDF umwandeln", color: "frompdf" },
  { id: "edit", name: "Bearbeiten", color: "edit" },
  { id: "security", name: "Sicherheit", color: "security" },
];

const PDF = { accept: ".pdf,application/pdf", label: "PDF" };

const tools = [
  // ------------------------------------------------------------------ ORGANISIEREN
  {
    slug: "merge",
    name: "PDF zusammenfügen",
    short: "Mehrere PDFs in der gewünschten Reihenfolge zu einer Datei kombinieren.",
    cat: "organize",
    badge: "PDF",
    glyph: "merge",
    title: "PDF zusammenfügen – kostenlos & online | PDF Libre",
    description:
      "PDFs online zusammenfügen: mehrere PDF-Dateien per Drag & Drop sortieren und zu einer PDF kombinieren. Kostenlos, ohne Anmeldung, sofort gelöscht.",
    h1: "PDF zusammenfügen",
    lead: "Kombiniere mehrere PDF-Dateien zu einem Dokument. Reihenfolge per Drag & Drop festlegen, fertig.",
    ui: {
      mode: "server",
      endpoint: "/api/merge",
      input: PDF,
      multiple: true,
      min: 2,
      sortable: true,
      action: "PDFs zusammenfügen",
      dropHint: "Mindestens 2 PDF-Dateien, bis zu 50 MB pro Datei",
    },
    steps: [
      ["PDFs auswählen", "Klicke auf „Dateien auswählen“ oder ziehe mehrere PDF-Dateien in das Feld."],
      ["Reihenfolge festlegen", "Ziehe die Dateien in der Liste an die richtige Position. Die oberste Datei kommt zuerst."],
      ["Zusammenfügen", "Klicke auf „PDFs zusammenfügen“. Nach wenigen Sekunden ist die neue Datei fertig."],
      ["Herunterladen", "Lade die kombinierte PDF herunter. Deine Originaldateien bleiben unverändert."],
    ],
    article: [
      {
        h: "Wann lohnt es sich, PDFs zusammenzufügen?",
        p: [
          "Bewerbungen, Steuerunterlagen, Rechnungen oder Scans bestehen oft aus vielen einzelnen Dateien. Eine einzige PDF ist leichter zu verschicken, lässt sich in einem Rutsch ausdrucken und geht im E-Mail-Anhang nicht verloren. Viele Online-Portale akzeptieren außerdem nur eine Datei pro Upload.",
          "Typisch ist zum Beispiel die Bewerbungsmappe: Anschreiben, Lebenslauf und Zeugnisse werden als einzelne PDFs erstellt und am Ende zu einem Dokument verbunden.",
        ],
      },
      {
        h: "Was passiert mit Inhalt und Qualität?",
        p: [
          "Beim Zusammenfügen werden die Seiten nur neu angeordnet, nicht neu gerendert. Texte bleiben durchsuchbar, Bilder behalten ihre Auflösung und Links funktionieren weiter. Die Seitengröße jedes Dokuments bleibt erhalten – ein Querformat-Blatt bleibt also quer.",
          "Wird die fertige Datei zu groß für den E-Mail-Versand, nutze danach „PDF komprimieren“ oder gleich das Werkzeug „Zusammenfügen & komprimieren“.",
        ],
      },
    ],
    faq: [
      ["Wie viele PDFs kann ich auf einmal zusammenfügen?", "Bis zu 20 Dateien mit jeweils maximal 50 MB. Für größere Mengen fügst du die Dateien in mehreren Durchgängen zusammen."],
      ["Kann ich einzelne Seiten statt ganzer Dateien kombinieren?", "Ja: Füge zuerst die Dateien zusammen und entferne danach mit „Seiten entfernen“ oder „PDF organisieren“ die Seiten, die du nicht brauchst."],
      ["Funktioniert das auch mit passwortgeschützten PDFs?", "Nein. Entsperre die Datei zuerst mit „PDF entsperren“ – dafür brauchst du das Passwort."],
      ["Werden meine Dateien gespeichert?", "Nein. Die Dateien werden nur für die Verarbeitung auf dem Server abgelegt und direkt nach dem Download automatisch gelöscht."],
    ],
    related: ["merge-compress", "organize", "split", "compress"],
  },
  {
    slug: "split",
    name: "PDF teilen",
    short: "Eine PDF in einzelne Seiten oder eigene Seitenbereiche aufteilen.",
    cat: "organize",
    badge: "PDF",
    glyph: "split",
    title: "PDF teilen – Seiten online trennen, kostenlos | PDF Libre",
    description:
      "PDF online teilen: jede Seite als eigene Datei speichern oder eigene Seitenbereiche festlegen. Läuft im Browser – deine PDF wird nicht hochgeladen.",
    h1: "PDF teilen",
    lead: "Trenne eine PDF in einzelne Seiten oder in Bereiche wie „1-3, 4-10“. Die Verarbeitung passiert direkt in deinem Browser.",
    ui: {
      mode: "client",
      input: PDF,
      preview: "pages",
      action: "PDF teilen",
      options: [
        {
          type: "radio",
          name: "mode",
          label: "Aufteilen nach",
          choices: [
            { value: "ranges", label: "Seitenbereichen", hint: "z. B. 1-3, 4-6, 7" },
            { value: "every", label: "Jeder Seite", hint: "Jede Seite wird eine eigene PDF" },
            { value: "chunks", label: "Festen Abständen", hint: "z. B. alle 2 Seiten" },
          ],
        },
        { type: "text", name: "ranges", label: "Seitenbereiche", placeholder: "1-3, 4-6, 7", showIf: "mode=ranges" },
        { type: "number", name: "chunk", label: "Seiten pro Datei", value: 2, min: 1, showIf: "mode=chunks" },
      ],
    },
    steps: [
      ["PDF auswählen", "Wähle die PDF aus, die du teilen möchtest. Du siehst sofort eine Vorschau aller Seiten."],
      ["Art der Teilung wählen", "Gib Seitenbereiche an (z. B. „1-3, 4-6“), teile nach jeder Seite oder in feste Blöcke."],
      ["Teilen", "Klicke auf „PDF teilen“. Die neuen Dateien werden in deinem Browser erstellt."],
      ["Herunterladen", "Bei mehreren Dateien erhältst du ein ZIP-Archiv mit allen Teilen."],
    ],
    article: [
      {
        h: "Seitenbereiche richtig angeben",
        p: [
          "Trenne Bereiche mit Kommas. „1-3“ bedeutet Seite 1 bis 3, eine einzelne Zahl steht für genau eine Seite. Aus „1-3, 4-6, 7“ entstehen also drei Dateien. Bereiche dürfen sich auch überschneiden, wenn eine Seite in mehreren Teilen vorkommen soll.",
          "Wenn du nur einzelne Seiten herauslösen willst, ist „Seiten extrahieren“ oft schneller: Dort klickst du die Seiten einfach in der Vorschau an.",
        ],
      },
      {
        h: "Warum im Browser?",
        p: [
          "Das Teilen erfordert keine Umrechnung der Inhalte, deshalb kann dein Browser das selbst erledigen. Die PDF wird dabei nicht an unseren Server geschickt. Das ist schneller und für vertrauliche Unterlagen wie Verträge oder Kontoauszüge die sicherste Variante.",
        ],
      },
    ],
    faq: [
      ["Verliere ich beim Teilen Qualität?", "Nein. Die Seiten werden unverändert in neue Dateien kopiert. Texte, Bilder und Schriften bleiben exakt wie im Original."],
      ["Wie groß darf die PDF sein?", "Das hängt vom Arbeitsspeicher deines Geräts ab. Dateien mit mehreren hundert Seiten sind auf einem normalen Laptop kein Problem."],
      ["Warum bekomme ich eine ZIP-Datei?", "Browser laden mehrere Dateien nur ungern gleichzeitig herunter. Im ZIP-Archiv sind alle Teile gebündelt – ein Doppelklick entpackt sie."],
      ["Funktioniert das auf dem Smartphone?", "Ja, alle Browser-Werkzeuge laufen auch auf aktuellen Smartphones und Tablets."],
    ],
    related: ["extract-pages", "remove-pages", "merge", "organize"],
  },
  {
    slug: "remove-pages",
    name: "Seiten entfernen",
    short: "Unnötige Seiten aus einer PDF löschen – per Klick in der Vorschau.",
    cat: "organize",
    badge: "PDF",
    glyph: "remove",
    title: "PDF-Seiten entfernen – online & kostenlos | PDF Libre",
    description:
      "Seiten aus PDF löschen: Seiten in der Vorschau anklicken und mit einem Klick entfernen. Kostenlos, ohne Anmeldung, direkt im Browser.",
    h1: "Seiten aus PDF entfernen",
    lead: "Klicke die Seiten an, die weg sollen – leere Seiten, Werbung oder veraltete Abschnitte. Der Rest bleibt unverändert.",
    ui: {
      mode: "client",
      input: PDF,
      preview: "pages",
      select: "remove",
      action: "Seiten entfernen",
      options: [{ type: "text", name: "pages", label: "Oder Seitenzahlen eingeben", placeholder: "z. B. 2, 5-7" }],
    },
    steps: [
      ["PDF auswählen", "Lade die PDF in das Feld. Alle Seiten erscheinen als Vorschaubilder."],
      ["Seiten markieren", "Klicke auf die Seiten, die du löschen willst, oder gib die Seitenzahlen ein."],
      ["Entfernen", "Klicke auf „Seiten entfernen“. Die neue PDF entsteht in deinem Browser."],
      ["Herunterladen", "Speichere die bereinigte PDF. Das Original auf deinem Gerät bleibt unverändert."],
    ],
    article: [
      {
        h: "Typische Einsatzfälle",
        p: [
          "Eingescannte Dokumente enthalten oft leere Rückseiten, Präsentationen haben Folien, die für einen bestimmten Empfänger nicht relevant sind, und Kontoauszüge Seiten mit Werbung. Statt die Datei neu zu erstellen, entfernst du hier gezielt einzelne Seiten.",
        ],
      },
      {
        h: "Seiten per Klick oder per Zahl",
        p: [
          "Markierte Seiten werden rot umrandet. Bei langen Dokumenten geht es mit der Eingabe schneller: „2, 5-7“ entfernt die Seiten 2, 5, 6 und 7. Beide Wege lassen sich kombinieren.",
        ],
      },
    ],
    faq: [
      ["Kann ich das Entfernen rückgängig machen?", "Deine Originaldatei wird nie verändert. Wenn du dich verklickt hast, lädst du einfach das Original erneut."],
      ["Bleiben Lesezeichen und Links erhalten?", "Die Seiteninhalte bleiben vollständig erhalten. Inhaltsverzeichnis-Lesezeichen, die auf gelöschte Seiten zeigen, funktionieren naturgemäß nicht mehr."],
      ["Wird meine PDF hochgeladen?", "Nein. Das Entfernen passiert vollständig in deinem Browser."],
    ],
    related: ["extract-pages", "organize", "split", "rotate"],
  },
  {
    slug: "extract-pages",
    name: "Seiten extrahieren",
    short: "Ausgewählte Seiten als neue PDF speichern.",
    cat: "organize",
    badge: "PDF",
    glyph: "extract",
    title: "PDF-Seiten extrahieren – kostenlos online | PDF Libre",
    description:
      "Einzelne Seiten aus einer PDF extrahieren und als neue PDF speichern. Seiten per Klick auswählen – kostenlos und direkt im Browser.",
    h1: "Seiten aus PDF extrahieren",
    lead: "Wähle genau die Seiten aus, die du brauchst, und speichere sie als neue PDF.",
    ui: {
      mode: "client",
      input: PDF,
      preview: "pages",
      select: "keep",
      action: "Seiten extrahieren",
      options: [
        { type: "text", name: "pages", label: "Oder Seitenzahlen eingeben", placeholder: "z. B. 1, 3-4" },
        {
          type: "radio",
          name: "output",
          label: "Ergebnis",
          choices: [
            { value: "one", label: "Eine PDF", hint: "Alle ausgewählten Seiten in einer Datei" },
            { value: "separate", label: "Einzelne PDFs", hint: "Jede Seite als eigene Datei (ZIP)" },
          ],
        },
      ],
    },
    steps: [
      ["PDF auswählen", "Lade die PDF hoch – die Seiten werden als Vorschau angezeigt."],
      ["Seiten anklicken", "Markiere die gewünschten Seiten oder tippe die Seitenzahlen ein."],
      ["Extrahieren", "Entscheide, ob du eine gemeinsame PDF oder einzelne Dateien möchtest, und klicke auf „Seiten extrahieren“."],
      ["Herunterladen", "Speichere das Ergebnis auf deinem Gerät."],
    ],
    article: [
      {
        h: "Extrahieren oder Teilen?",
        p: [
          "Beim Extrahieren wählst du einzelne Seiten gezielt aus, zum Beispiel die Unterschriftenseite eines Vertrags oder ein bestimmtes Kapitel. Beim Teilen wird dagegen das ganze Dokument in mehrere Stücke zerlegt. Für „ich brauche nur Seite 4 und 12“ ist Extrahieren der kürzere Weg.",
        ],
      },
    ],
    faq: [
      ["In welcher Reihenfolge landen die Seiten in der neuen PDF?", "In der Reihenfolge des Originals. Wenn du sie umsortieren möchtest, nutze danach „PDF organisieren“."],
      ["Verändert sich die Qualität?", "Nein, die Seiten werden 1:1 übernommen."],
      ["Wird meine Datei auf einen Server geladen?", "Nein, das Extrahieren läuft komplett in deinem Browser."],
    ],
    related: ["split", "remove-pages", "organize", "merge"],
  },
  {
    slug: "organize",
    name: "PDF organisieren",
    short: "Seiten per Drag & Drop sortieren, drehen und löschen.",
    cat: "organize",
    badge: "PDF",
    glyph: "organize",
    title: "PDF-Seiten sortieren & organisieren – online | PDF Libre",
    description:
      "PDF-Seiten neu anordnen: Seiten per Drag & Drop verschieben, einzeln drehen oder löschen. Kostenlos, ohne Anmeldung, direkt im Browser.",
    h1: "PDF organisieren",
    lead: "Bring Ordnung in deine PDF: Seiten verschieben, einzeln drehen und überflüssige Seiten löschen – alles in einer Ansicht.",
    ui: {
      mode: "client",
      input: PDF,
      preview: "pages",
      select: "organize",
      action: "Änderungen übernehmen",
    },
    steps: [
      ["PDF auswählen", "Öffne die PDF. Alle Seiten erscheinen als Vorschaubilder."],
      ["Seiten verschieben", "Ziehe eine Seite mit der Maus oder dem Finger an ihre neue Position."],
      ["Drehen oder löschen", "Über die Symbole an jeder Seite drehst du sie um 90° oder entfernst sie."],
      ["Speichern", "Klicke auf „Änderungen übernehmen“ und lade die neu sortierte PDF herunter."],
    ],
    article: [
      {
        h: "Gescannte Dokumente in Ordnung bringen",
        p: [
          "Beim Scannen mit einem Einzugsscanner landen Seiten schnell in falscher Reihenfolge oder stehen auf dem Kopf. In der Seitenansicht siehst du auf einen Blick, was nicht passt, und korrigierst es direkt, ohne die Datei neu scannen zu müssen.",
        ],
      },
      {
        h: "Tipps für lange Dokumente",
        p: [
          "Bei vielen Seiten hilft es, erst zu löschen und dann zu sortieren. Wenn du Seiten aus mehreren Dateien kombinieren willst, füge die Dateien zuerst mit „PDF zusammenfügen“ zusammen und organisiere danach das Ergebnis.",
        ],
      },
    ],
    faq: [
      ["Kann ich Seiten aus mehreren PDFs sortieren?", "Füge die PDFs zuerst zusammen und öffne das Ergebnis dann hier."],
      ["Wird die Qualität verändert?", "Nein. Die Seiten werden nur neu angeordnet oder gedreht, der Inhalt bleibt unverändert."],
      ["Wird meine PDF hochgeladen?", "Nein, alles passiert lokal in deinem Browser."],
    ],
    related: ["rotate", "remove-pages", "merge", "split"],
  },
  {
    slug: "rotate",
    name: "PDF drehen",
    short: "Alle oder einzelne Seiten um 90° oder 180° drehen.",
    cat: "organize",
    badge: "PDF",
    glyph: "rotate",
    title: "PDF drehen – Seiten dauerhaft drehen, kostenlos | PDF Libre",
    description:
      "PDF online drehen: alle Seiten oder nur einzelne Seiten dauerhaft um 90°, 180° oder 270° drehen und speichern. Kostenlos und direkt im Browser.",
    h1: "PDF drehen",
    lead: "Drehe quer eingescannte oder kopfstehende Seiten dauerhaft – für das ganze Dokument oder nur für einzelne Seiten.",
    ui: {
      mode: "client",
      input: PDF,
      preview: "pages",
      select: "rotate",
      action: "PDF speichern",
      toolbar: [
        { action: "rotate-all-left", label: "Alle nach links" },
        { action: "rotate-all-right", label: "Alle nach rechts" },
        { action: "rotate-reset", label: "Zurücksetzen" },
      ],
    },
    steps: [
      ["PDF auswählen", "Wähle die PDF aus, deren Seiten falsch ausgerichtet sind."],
      ["Seiten drehen", "Klicke auf eine Seite, um sie um 90° im Uhrzeigersinn zu drehen, oder drehe alle Seiten gleichzeitig."],
      ["Speichern", "Klicke auf „PDF speichern“. Die Drehung wird fest in der Datei gespeichert."],
    ],
    article: [
      {
        h: "Dauerhaft drehen statt nur in der Ansicht",
        p: [
          "Viele PDF-Betrachter können Seiten nur in der Ansicht drehen – beim nächsten Öffnen oder beim Empfänger steht die Seite wieder quer. Hier wird die Ausrichtung in der Datei gespeichert und gilt überall: am Bildschirm, beim Drucken und auf dem Handy.",
        ],
      },
    ],
    faq: [
      ["Kann ich nur einzelne Seiten drehen?", "Ja. Klicke in der Vorschau einfach auf die Seiten, die gedreht werden sollen. Jeder Klick dreht um weitere 90°."],
      ["Verliert die PDF beim Drehen an Qualität?", "Nein. Es wird nur die Ausrichtung der Seite geändert, der Inhalt wird nicht neu berechnet."],
      ["Wird meine PDF hochgeladen?", "Nein, das Drehen erfolgt komplett in deinem Browser."],
    ],
    related: ["organize", "remove-pages", "compress", "merge"],
  },

  // ------------------------------------------------------------------ OPTIMIEREN
  {
    slug: "compress",
    name: "PDF komprimieren",
    short: "Dateigröße reduzieren – ideal für E-Mail und Upload-Portale.",
    cat: "optimize",
    badge: "PDF",
    glyph: "compress",
    title: "PDF komprimieren – Dateigröße online verkleinern | PDF Libre",
    description:
      "PDF verkleinern in Sekunden: drei Stufen, ideal für E-Mail und Upload-Portale. Kostenlos, ohne Anmeldung und ohne Wasserzeichen.",
    h1: "PDF komprimieren",
    lead: "Verkleinere deine PDF für E-Mail, Bewerbungsportale oder Behörden-Uploads. Du wählst, wie stark komprimiert wird.",
    ui: {
      mode: "server",
      endpoint: "/api/compress",
      input: PDF,
      action: "PDF komprimieren",
      showSavings: true,
      options: [
        {
          type: "radio",
          name: "level",
          label: "Kompression",
          choices: [
            { value: "recommended", label: "Empfohlen", hint: "Gute Qualität, deutlich kleiner" },
            { value: "strong", label: "Stark", hint: "Kleinste Datei, Bilder weniger scharf" },
            { value: "low", label: "Gering", hint: "Druckqualität, etwas kleiner" },
          ],
        },
      ],
    },
    steps: [
      ["PDF auswählen", "Ziehe deine PDF in das Feld oder klicke auf „Datei auswählen“."],
      ["Stufe wählen", "„Empfohlen“ passt für die meisten Fälle. Muss die Datei unter ein Upload-Limit, wähle „Stark“."],
      ["Komprimieren", "Klicke auf „PDF komprimieren“. Du siehst danach, wie viel Speicherplatz gespart wurde."],
      ["Herunterladen", "Lade die verkleinerte PDF herunter."],
    ],
    article: [
      {
        h: "Wie funktioniert das Komprimieren?",
        p: [
          "Die meisten großen PDFs sind groß, weil sie hochauflösende Bilder oder Scans enthalten. Beim Komprimieren werden diese Bilder auf eine sinnvolle Auflösung gebracht, doppelt eingebettete Inhalte zusammengefasst und die Datei neu aufgebaut. Text bleibt dabei Text – er wird nicht in ein Bild umgewandelt und bleibt scharf und durchsuchbar.",
        ],
      },
      {
        h: "Welche Stufe ist die richtige?",
        p: [
          "„Empfohlen“ reduziert Bilder auf rund 150 dpi. Das reicht für die Ansicht am Bildschirm und für normale Ausdrucke. „Stark“ geht auf etwa 72 dpi und eignet sich, wenn ein Portal zum Beispiel maximal 2 MB erlaubt. „Gering“ behält Druckqualität (300 dpi) und spart vor allem bei unnötig groß gespeicherten Dateien.",
          "Enthält eine PDF fast nur Text, ist sie meist schon klein. In diesem Fall bekommst du dein Original zurück, statt einer Datei, die kaum kleiner oder sogar größer wäre.",
        ],
      },
    ],
    faq: [
      ["Wie stark wird meine PDF verkleinert?", "Bei Scans und bildlastigen Dokumenten sind 50–90 % üblich. Reine Textdokumente lassen sich kaum weiter verkleinern."],
      ["Bleibt der Text durchsuchbar?", "Ja. Text wird nicht in Bilder umgewandelt und bleibt kopierbar und durchsuchbar."],
      ["Gibt es ein Wasserzeichen?", "Nein. PDF Libre fügt nie Wasserzeichen oder Werbung in deine Dateien ein."],
      ["Was passiert mit meiner Datei?", "Sie wird verschlüsselt übertragen, auf dem Server verarbeitet und direkt nach dem Download gelöscht."],
    ],
    related: ["merge-compress", "merge", "pdf-to-jpg", "protect"],
  },
  {
    slug: "merge-compress",
    name: "Zusammenfügen & komprimieren",
    short: "Mehrere PDFs kombinieren und in einem Schritt verkleinern.",
    cat: "optimize",
    badge: "PDF",
    glyph: "mergecompress",
    title: "PDFs zusammenfügen & komprimieren | PDF Libre",
    description:
      "Mehrere PDFs zu einer Datei zusammenfügen und gleichzeitig verkleinern – perfekt für Bewerbungen und Upload-Portale. Kostenlos und ohne Anmeldung.",
    h1: "PDFs zusammenfügen & komprimieren",
    lead: "Die Abkürzung für Bewerbungsmappen und Uploads: Dateien kombinieren und direkt auf eine versandfertige Größe bringen.",
    ui: {
      mode: "server",
      endpoint: "/api/merge-compress",
      input: PDF,
      multiple: true,
      min: 1,
      sortable: true,
      action: "Zusammenfügen & komprimieren",
      showSavings: true,
      dropHint: "Mehrere PDF-Dateien, bis zu 50 MB pro Datei",
      options: [
        {
          type: "radio",
          name: "level",
          label: "Kompression",
          choices: [
            { value: "recommended", label: "Empfohlen", hint: "Gute Qualität, deutlich kleiner" },
            { value: "strong", label: "Stark", hint: "Kleinste Datei" },
            { value: "low", label: "Gering", hint: "Druckqualität" },
          ],
        },
      ],
    },
    steps: [
      ["PDFs auswählen", "Wähle alle Dateien aus, die in das Dokument sollen."],
      ["Sortieren", "Bring die Dateien per Drag & Drop in die richtige Reihenfolge."],
      ["Stufe wählen", "Wähle, wie stark die fertige PDF verkleinert werden soll."],
      ["Herunterladen", "Klicke auf „Zusammenfügen & komprimieren“ und speichere das Ergebnis."],
    ],
    article: [
      {
        h: "Ideal für Bewerbungen",
        p: [
          "Viele Unternehmen und Bewerbungsportale wünschen eine einzige PDF mit Anschreiben, Lebenslauf und Zeugnissen – und begrenzen die Größe oft auf 5 oder 10 MB. Eingescannte Zeugnisse sprengen dieses Limit schnell. Mit diesem Werkzeug erledigst du beides in einem Schritt.",
        ],
      },
    ],
    faq: [
      ["Kann ich auch nur eine Datei hochladen?", "Ja, dann wird sie nur komprimiert – genau wie bei „PDF komprimieren“."],
      ["Wie viele Dateien sind möglich?", "Bis zu 20 PDFs mit jeweils maximal 50 MB."],
      ["Werden die Dateien gespeichert?", "Nein, sie werden direkt nach der Verarbeitung gelöscht."],
    ],
    related: ["merge", "compress", "organize", "jpg-to-pdf"],
  },

  // ------------------------------------------------------------------ IN PDF
  {
    slug: "docx-to-pdf",
    name: "Word in PDF",
    short: "DOC- und DOCX-Dateien in saubere PDFs umwandeln.",
    cat: "to-pdf",
    badge: "DOC",
    glyph: "word",
    title: "Word in PDF umwandeln – DOCX zu PDF kostenlos | PDF Libre",
    description:
      "Word in PDF umwandeln: DOC, DOCX, ODT und RTF online in PDF konvertieren – Layout, Schriften und Bilder bleiben erhalten. Kostenlos, ohne Anmeldung.",
    h1: "Word in PDF umwandeln",
    lead: "Wandle Word-Dokumente in PDFs um, die auf jedem Gerät gleich aussehen – ideal für Bewerbungen, Rechnungen und Verträge.",
    ui: {
      mode: "server",
      endpoint: "/api/word-to-pdf",
      input: { accept: ".doc,.docx,.odt,.rtf", label: "Word" },
      action: "In PDF umwandeln",
      dropHint: "DOC, DOCX, ODT oder RTF, bis zu 50 MB",
    },
    steps: [
      ["Word-Datei auswählen", "Wähle eine DOCX-, DOC-, ODT- oder RTF-Datei aus."],
      ["Umwandeln", "Klicke auf „In PDF umwandeln“. Die Umwandlung dauert meist nur ein paar Sekunden."],
      ["Herunterladen", "Speichere die fertige PDF."],
    ],
    article: [
      {
        h: "Warum PDF statt Word verschicken?",
        p: [
          "Ein Word-Dokument sieht auf jedem Rechner etwas anders aus – je nach Word-Version und installierten Schriften verrutschen Zeilenumbrüche, Tabellen oder Bilder. Eine PDF sieht dagegen überall gleich aus. Außerdem kann der Empfänger den Inhalt nicht versehentlich ändern.",
        ],
      },
      {
        h: "Tipps für ein perfektes Ergebnis",
        p: [
          "Verwende möglichst verbreitete Schriften wie Arial, Calibri oder Times New Roman. Seltene Schriften, die nicht in die Datei eingebettet sind, werden bei der Umwandlung durch eine ähnliche Schrift ersetzt. Prüfe die PDF daher kurz, bevor du sie verschickst.",
        ],
      },
    ],
    faq: [
      ["Welche Formate werden unterstützt?", "DOCX, DOC, ODT (LibreOffice/OpenOffice) und RTF."],
      ["Bleiben Links und Inhaltsverzeichnis erhalten?", "Ja, Hyperlinks und Überschriften werden in die PDF übernommen."],
      ["Warum sieht meine PDF leicht anders aus als in Word?", "Meist liegt es an einer Schrift, die auf dem Server nicht installiert ist. Mit einer Standardschrift oder mit in Word eingebetteten Schriften passiert das nicht."],
      ["Wird meine Datei gespeichert?", "Nein, sie wird direkt nach der Umwandlung gelöscht."],
    ],
    related: ["pdf-to-docx", "ppt-to-pdf", "excel-to-pdf", "merge"],
  },
  {
    slug: "ppt-to-pdf",
    name: "PowerPoint in PDF",
    short: "Präsentationen als PDF speichern und teilen.",
    cat: "to-pdf",
    badge: "PPT",
    glyph: "powerpoint",
    title: "PowerPoint in PDF umwandeln – PPTX zu PDF | PDF Libre",
    description:
      "PowerPoint in PDF umwandeln: PPT, PPTX und ODP online in PDF konvertieren. Jede Folie wird eine Seite. Kostenlos und ohne Anmeldung.",
    h1: "PowerPoint in PDF umwandeln",
    lead: "Mach aus deiner Präsentation eine PDF, die jeder öffnen kann – auch ohne PowerPoint.",
    ui: {
      mode: "server",
      endpoint: "/api/powerpoint-to-pdf",
      input: { accept: ".ppt,.pptx,.odp", label: "PowerPoint" },
      action: "In PDF umwandeln",
      dropHint: "PPT, PPTX oder ODP, bis zu 50 MB",
    },
    steps: [
      ["Präsentation auswählen", "Wähle eine PPTX-, PPT- oder ODP-Datei aus."],
      ["Umwandeln", "Klicke auf „In PDF umwandeln“. Jede Folie wird zu einer PDF-Seite."],
      ["Herunterladen", "Speichere die PDF und teile sie per E-Mail oder als Handout."],
    ],
    article: [
      {
        h: "Präsentationen sicher teilen",
        p: [
          "Als PDF lässt sich eine Präsentation auf jedem Gerät öffnen, ist deutlich kleiner als die Originaldatei und kann nicht versehentlich bearbeitet werden. Das ist praktisch für Handouts nach einem Vortrag, für Uni-Abgaben oder wenn der Empfänger kein PowerPoint hat.",
          "Animationen und Übergänge werden in einer PDF nicht abgespielt – jede Folie erscheint im Endzustand. Eingebettete Videos werden als Standbild übernommen.",
        ],
      },
    ],
    faq: [
      ["Werden Notizen übernommen?", "Nein, die PDF enthält nur die Folien selbst."],
      ["Bleiben Animationen erhalten?", "Nein. PDFs sind statisch, jede Folie wird im fertigen Zustand dargestellt."],
      ["Wird meine Datei gespeichert?", "Nein, sie wird direkt nach der Umwandlung gelöscht."],
    ],
    related: ["docx-to-pdf", "excel-to-pdf", "compress", "merge"],
  },
  {
    slug: "excel-to-pdf",
    name: "Excel in PDF",
    short: "Tabellen aus XLSX und CSV als PDF speichern.",
    cat: "to-pdf",
    badge: "XLS",
    glyph: "excel",
    title: "Excel in PDF umwandeln – XLSX zu PDF kostenlos | PDF Libre",
    description:
      "Excel in PDF umwandeln: XLS, XLSX, ODS und CSV online als PDF speichern. Kostenlos, ohne Anmeldung, Dateien werden sofort gelöscht.",
    h1: "Excel in PDF umwandeln",
    lead: "Wandle Tabellen, Rechnungen und Auswertungen aus Excel in eine PDF um, die sich gut lesen und drucken lässt.",
    ui: {
      mode: "server",
      endpoint: "/api/excel-to-pdf",
      input: { accept: ".xls,.xlsx,.ods,.csv", label: "Excel" },
      action: "In PDF umwandeln",
      dropHint: "XLS, XLSX, ODS oder CSV, bis zu 50 MB",
    },
    steps: [
      ["Tabelle auswählen", "Wähle eine XLSX-, XLS-, ODS- oder CSV-Datei aus."],
      ["Umwandeln", "Klicke auf „In PDF umwandeln“. Alle Tabellenblätter werden übernommen."],
      ["Herunterladen", "Speichere die PDF."],
    ],
    article: [
      {
        h: "So wird deine Tabelle gut lesbar",
        p: [
          "Die Umwandlung nutzt die Druckeinstellungen deiner Excel-Datei. Breite Tabellen werden sonst auf mehrere Seiten verteilt. Lege deshalb vorher in Excel unter „Seitenlayout“ das Querformat fest oder wähle „Blatt auf einer Seite darstellen“ – dann sieht die PDF genau so aus, wie du es erwartest.",
          "Ist ein Druckbereich definiert, wird nur dieser Bereich umgewandelt.",
        ],
      },
    ],
    faq: [
      ["Werden alle Tabellenblätter umgewandelt?", "Ja, jedes Blatt mit Inhalt landet in der PDF."],
      ["Warum ist meine Tabelle auf mehrere Seiten verteilt?", "Die Tabelle ist breiter als eine Seite. Stelle in Excel das Querformat oder „An Seite anpassen“ ein und wandle erneut um."],
      ["Bleiben Formeln erhalten?", "In der PDF stehen die berechneten Werte. Formeln selbst sind in einer PDF nicht enthalten."],
    ],
    related: ["docx-to-pdf", "ppt-to-pdf", "merge", "compress"],
  },
  {
    slug: "jpg-to-pdf",
    name: "Bilder in PDF",
    short: "JPG- und PNG-Bilder zu einer PDF zusammenfassen.",
    cat: "to-pdf",
    badge: "JPG",
    glyph: "image",
    title: "JPG in PDF umwandeln – Bilder zu PDF, kostenlos | PDF Libre",
    description:
      "JPG und PNG in PDF umwandeln: mehrere Bilder sortieren und zu einer PDF zusammenfassen. Direkt im Browser – deine Fotos werden nicht hochgeladen.",
    h1: "Bilder in PDF umwandeln",
    lead: "Fotos von Dokumenten, Quittungen oder Screenshots: Fasse JPG- und PNG-Bilder zu einer ordentlichen PDF zusammen.",
    ui: {
      mode: "client",
      input: { accept: ".jpg,.jpeg,.png,image/jpeg,image/png", label: "Bild" },
      multiple: true,
      sortable: true,
      action: "PDF erstellen",
      dropHint: "JPG oder PNG, mehrere Bilder möglich",
      options: [
        {
          type: "select",
          name: "pageSize",
          label: "Seitengröße",
          choices: [
            { value: "a4", label: "A4" },
            { value: "letter", label: "US Letter" },
            { value: "fit", label: "Wie das Bild" },
          ],
        },
        {
          type: "select",
          name: "orientation",
          label: "Ausrichtung",
          choices: [
            { value: "auto", label: "Automatisch" },
            { value: "portrait", label: "Hochformat" },
            { value: "landscape", label: "Querformat" },
          ],
          showIf: "pageSize!=fit",
        },
        {
          type: "select",
          name: "margin",
          label: "Rand",
          choices: [
            { value: "0", label: "Kein Rand" },
            { value: "20", label: "Schmal" },
            { value: "40", label: "Normal" },
          ],
          showIf: "pageSize!=fit",
        },
      ],
    },
    steps: [
      ["Bilder auswählen", "Wähle ein oder mehrere JPG- oder PNG-Bilder aus – auch direkt aus der Handy-Galerie."],
      ["Reihenfolge festlegen", "Sortiere die Bilder per Drag & Drop. Jedes Bild wird eine Seite."],
      ["Format wählen", "Wähle Seitengröße, Ausrichtung und Rand."],
      ["PDF erstellen", "Klicke auf „PDF erstellen“ und lade die fertige Datei herunter."],
    ],
    article: [
      {
        h: "Handyfotos in ein richtiges Dokument verwandeln",
        p: [
          "Kassenbons für die Steuererklärung, Arbeitsblätter oder unterschriebene Formulare werden heute oft einfach mit dem Handy fotografiert. Als lose Bilder sind sie aber unpraktisch. In einer PDF sind alle Seiten in der richtigen Reihenfolge beisammen und lassen sich wie ein Dokument verschicken und ausdrucken.",
          "Mit „Automatisch“ wird jede Seite so ausgerichtet, wie das Bild aufgenommen wurde – Querformat-Fotos bekommen also eine Querformat-Seite.",
        ],
      },
    ],
    faq: [
      ["Welche Bildformate werden unterstützt?", "JPG/JPEG und PNG. HEIC-Fotos vom iPhone kannst du in den Kameraeinstellungen auf „Maximale Kompatibilität“ umstellen, dann speichert das iPhone JPG."],
      ["Werden meine Bilder hochgeladen?", "Nein. Die PDF wird direkt in deinem Browser erzeugt."],
      ["Wird die Bildqualität verringert?", "Nein, die Bilder werden in Originalqualität eingebettet. Wenn die PDF zu groß wird, kannst du sie danach komprimieren."],
    ],
    related: ["pdf-to-jpg", "compress", "merge", "organize"],
  },

  // ------------------------------------------------------------------ AUS PDF
  {
    slug: "pdf-to-docx",
    name: "PDF in Word",
    short: "PDFs in bearbeitbare DOCX-Dateien umwandeln.",
    cat: "from-pdf",
    badge: "DOC",
    glyph: "word",
    title: "PDF in Word umwandeln – PDF zu DOCX kostenlos | PDF Libre",
    description:
      "PDF in Word umwandeln: PDF online in ein bearbeitbares DOCX-Dokument konvertieren – mit Tabellen, Bildern und Formatierung. Kostenlos, ohne Anmeldung.",
    h1: "PDF in Word umwandeln",
    lead: "Mach aus einer PDF wieder ein bearbeitbares Word-Dokument – mit Absätzen, Tabellen und Bildern.",
    ui: {
      mode: "server",
      endpoint: "/api/pdf-to-word",
      input: PDF,
      action: "In Word umwandeln",
      dropHint: "PDF-Datei, bis zu 50 MB",
    },
    steps: [
      ["PDF auswählen", "Wähle die PDF aus, die du bearbeiten möchtest."],
      ["Umwandeln", "Klicke auf „In Word umwandeln“. Je nach Seitenzahl dauert das einige Sekunden."],
      ["Herunterladen", "Öffne die DOCX-Datei in Word, LibreOffice oder Google Docs und bearbeite sie."],
    ],
    article: [
      {
        h: "Was wird übernommen?",
        p: [
          "Die Umwandlung erkennt Absätze, Überschriften, Tabellen und Bilder und baut daraus ein Word-Dokument mit echtem Fließtext auf. Schriftgrößen, Fettdruck und Farben werden übernommen. Bei aufwendigen Layouts mit vielen Spalten oder Textfeldern kann Nacharbeit nötig sein.",
        ],
      },
      {
        h: "Wichtig bei gescannten PDFs",
        p: [
          "Eine eingescannte Seite ist für den Computer nur ein Foto. Ohne Texterkennung (OCR) landet sie als Bild im Word-Dokument und der Text ist nicht bearbeitbar. Ob deine PDF echten Text enthält, erkennst du daran, ob du darin Text markieren und kopieren kannst.",
        ],
      },
    ],
    faq: [
      ["Kann ich gescannte PDFs umwandeln?", "Die Umwandlung funktioniert, aber gescannte Seiten erscheinen als Bild. Für bearbeitbaren Text braucht die PDF vorher eine Texterkennung (OCR)."],
      ["Funktioniert es mit Google Docs?", "Ja. Lade die DOCX-Datei in Google Drive hoch und öffne sie mit Google Docs."],
      ["Warum ist das Layout nicht 100 % identisch?", "PDFs speichern die genaue Position jedes Zeichens, Word arbeitet mit Fließtext. Bei komplexen Layouts muss die Umwandlung deshalb Kompromisse machen."],
      ["Wird meine PDF gespeichert?", "Nein, sie wird direkt nach der Umwandlung gelöscht."],
    ],
    related: ["docx-to-pdf", "pdf-to-jpg", "unlock", "compress"],
  },
  {
    slug: "pdf-to-jpg",
    name: "PDF in JPG",
    short: "Jede PDF-Seite als JPG- oder PNG-Bild speichern.",
    cat: "from-pdf",
    badge: "JPG",
    glyph: "image",
    title: "PDF in JPG umwandeln – Seiten als Bild speichern | PDF Libre",
    description:
      "PDF in JPG oder PNG umwandeln: jede Seite als hochwertiges Bild speichern. Kostenlos, direkt im Browser – deine PDF wird nicht hochgeladen.",
    h1: "PDF in JPG umwandeln",
    lead: "Speichere jede Seite deiner PDF als Bild – für Social Media, Präsentationen oder Webseiten.",
    ui: {
      mode: "client",
      input: PDF,
      preview: "pages",
      action: "In Bilder umwandeln",
      options: [
        {
          type: "select",
          name: "format",
          label: "Bildformat",
          choices: [
            { value: "jpeg", label: "JPG" },
            { value: "png", label: "PNG" },
          ],
        },
        {
          type: "select",
          name: "quality",
          label: "Auflösung",
          choices: [
            { value: "150", label: "Normal (150 dpi)" },
            { value: "300", label: "Hoch (300 dpi)" },
            { value: "72", label: "Bildschirm (72 dpi)" },
          ],
        },
      ],
    },
    steps: [
      ["PDF auswählen", "Wähle die PDF aus. Du siehst eine Vorschau aller Seiten."],
      ["Format und Auflösung wählen", "JPG ist kleiner, PNG ist verlustfrei. 300 dpi eignen sich für Druck."],
      ["Umwandeln", "Klicke auf „In Bilder umwandeln“. Mehrere Seiten erhältst du als ZIP-Archiv."],
    ],
    article: [
      {
        h: "JPG oder PNG?",
        p: [
          "JPG eignet sich für Fotos und gemischte Inhalte und erzeugt kleine Dateien. PNG ist verlustfrei und die bessere Wahl für Grafiken, Diagramme und Seiten mit viel Text, weil Kanten scharf bleiben. Für Instagram oder LinkedIn reicht JPG in normaler Auflösung.",
        ],
      },
    ],
    faq: [
      ["Welche Auflösung soll ich wählen?", "150 dpi für Bildschirm und Präsentationen, 300 dpi, wenn du die Bilder drucken möchtest."],
      ["Wird meine PDF hochgeladen?", "Nein, die Bilder werden direkt in deinem Browser berechnet."],
      ["Kann ich nur eine Seite umwandeln?", "Extrahiere die Seite zuerst mit „Seiten extrahieren“ und wandle danach nur diese Datei um."],
    ],
    related: ["jpg-to-pdf", "extract-pages", "pdf-to-docx", "compress"],
  },

  // ------------------------------------------------------------------ BEARBEITEN
  {
    slug: "edit",
    name: "PDF bearbeiten",
    short: "Text ändern, hinzufügen oder löschen, Bilder und Formen einfügen.",
    cat: "edit",
    badge: "PDF",
    glyph: "edit",
    pro: true,
    title: "PDF bearbeiten – Text ändern & einfügen, online | PDF Libre",
    description:
      "PDF online bearbeiten: vorhandenen Text ändern, neuen Text, Bilder, Formen und Unterschriften einfügen, Inhalte endgültig löschen. 14 Tage kostenlos testen.",
    h1: "PDF bearbeiten",
    lead: "Ändere Text direkt in der PDF, füge Bilder, Formen und deine Unterschrift hinzu oder lösche Inhalte endgültig.",
    ui: { mode: "editor", start: "upload", input: PDF },
    steps: [
      ["PDF öffnen", "Wähle die PDF aus. Alle Seiten erscheinen im Editor – bearbeiten kannst du ohne Konto."],
      ["Bearbeiten", "Wähle oben ein Werkzeug: „Text ändern“ und auf vorhandenen Text klicken, „Text“ für neuen Text, dazu Bild, Formen, Zeichnen, Markieren oder Entfernen."],
      ["Anpassen", "Verschiebe Elemente mit der Maus, ändere Größe, Schrift und Farbe. Mit Strg+Z machst du Schritte rückgängig."],
      ["Herunterladen", "Klicke auf „Herunterladen“. Beim ersten Mal legst du ein Konto an – die ersten 14 Tage sind kostenlos."],
    ],
    article: [
      {
        h: "Text in einer PDF ändern",
        p: [
          "Mit „Text ändern“ werden alle Textzeilen der PDF anklickbar. Klickst du eine Zeile an, wird der alte Text beim Speichern wirklich aus der Datei entfernt und durch deinen neuen Text ersetzt. So korrigierst du Tippfehler, Daten oder Beträge, ohne das Dokument neu erstellen zu müssen.",
          "Der neue Text wird in Helvetica, Times oder Courier gesetzt. Nutzt die PDF eine besondere Schrift, sieht die geänderte Zeile deshalb leicht anders aus – bei den meisten Geschäftsdokumenten fällt das kaum auf.",
        ],
      },
      {
        h: "Überdecken oder endgültig entfernen?",
        p: [
          "„Überdecken“ legt eine weiße Fläche über einen Bereich. Das ist schnell, aber der Inhalt darunter steckt noch in der Datei und lässt sich mit etwas Aufwand wieder sichtbar machen.",
          "„Entfernen“ löscht Text, Bilder und Grafiken im markierten Bereich tatsächlich aus der PDF. Nutze das immer für vertrauliche Angaben wie Kontonummern, Adressen oder Gehälter, bevor du ein Dokument weitergibst.",
        ],
      },
    ],
    faq: [
      ["Was kostet der PDF-Editor?", "Die ersten 14 Tage sind kostenlos, ohne Zahlungsdaten. Danach kostet Pro 4,99 € im Monat (monatlich kündbar) oder du kaufst einen Tagespass für 2,99 €."],
      ["Kann ich vorhandenen Text wirklich löschen?", "Ja. Mit „Entfernen“ oder „Text ändern“ wird der Originaltext beim Speichern tatsächlich aus der Datei gelöscht – nicht nur überdeckt."],
      ["Kann ich meine Unterschrift einfügen?", "Ja. Zeichne sie mit „Zeichnen“ direkt mit Maus oder Finger oder füge ein Foto deiner Unterschrift als Bild ein."],
      ["Werden meine Dateien gespeichert?", "Nein. Beim Herunterladen wird die PDF verschlüsselt an den Server geschickt, verarbeitet und direkt danach gelöscht."],
    ],
    related: ["create", "watermark", "page-numbers", "protect"],
  },
  {
    slug: "create",
    name: "PDF erstellen",
    short: "Eigene PDF von Grund auf gestalten – mit Text, Bildern und Formen.",
    cat: "edit",
    badge: "PDF",
    glyph: "create",
    pro: true,
    title: "PDF erstellen – eigene PDF online gestalten | PDF Libre",
    description:
      "Neue PDF online erstellen: leere Seiten in A4, A5 oder US Letter mit Text, Bildern, Formen und Zeichnungen gestalten. 14 Tage kostenlos testen.",
    h1: "PDF erstellen",
    lead: "Gestalte eine PDF von Grund auf: Aushänge, Formulare, einfache Rechnungen oder Notizen – mit Text, Bildern, Formen und Zeichnungen.",
    ui: { mode: "editor", start: "blank", input: PDF },
    steps: [
      ["Format wählen", "Du startest mit einer leeren A4-Seite. Weitere Seiten fügst du über „Seite hinzufügen“ ein."],
      ["Inhalte hinzufügen", "Setze Text, Bilder, Rechtecke, Kreise, Linien oder freie Zeichnungen auf die Seite."],
      ["Gestalten", "Verschiebe und skaliere Elemente, ändere Schrift, Größe und Farben."],
      ["Herunterladen", "Klicke auf „Herunterladen“ – die ersten 14 Tage sind kostenlos."],
    ],
    article: [
      {
        h: "Schnell ein Dokument gestalten – ohne Word",
        p: [
          "Für einen Aushang im Treppenhaus, ein Deckblatt oder ein kurzes Informationsblatt braucht es kein Textprogramm. Du platzierst Texte und Bilder frei auf der Seite, genau dort, wo sie hin sollen, und erhältst eine PDF, die überall gleich aussieht.",
        ],
      },
    ],
    faq: [
      ["Welche Seitenformate gibt es?", "A4, A5 und US Letter, jeweils hoch oder quer."],
      ["Kann ich eine bestehende PDF weiterbearbeiten?", "Ja, dafür gibt es „PDF bearbeiten“."],
      ["Was kostet das?", "14 Tage kostenlos, danach 4,99 € im Monat oder 2,99 € für einen Tagespass."],
    ],
    related: ["edit", "jpg-to-pdf", "merge", "page-numbers"],
  },
  {
    slug: "page-numbers",
    name: "Seitenzahlen einfügen",
    short: "Seitenzahlen an der gewünschten Position hinzufügen.",
    cat: "edit",
    badge: "123",
    glyph: "numbers",
    title: "Seitenzahlen in PDF einfügen – kostenlos | PDF Libre",
    description:
      "PDF-Seitenzahlen hinzufügen: Position, Format und Startnummer frei wählen. Kostenlos, ohne Anmeldung, direkt im Browser.",
    h1: "Seitenzahlen in PDF einfügen",
    lead: "Nummeriere die Seiten deiner PDF – ideal für Hausarbeiten, Berichte und Verträge.",
    ui: {
      mode: "client",
      input: PDF,
      action: "Seitenzahlen einfügen",
      options: [
        {
          type: "select",
          name: "position",
          label: "Position",
          choices: [
            { value: "bottom-center", label: "Unten Mitte" },
            { value: "bottom-right", label: "Unten rechts" },
            { value: "bottom-left", label: "Unten links" },
            { value: "top-center", label: "Oben Mitte" },
            { value: "top-right", label: "Oben rechts" },
            { value: "top-left", label: "Oben links" },
          ],
        },
        {
          type: "select",
          name: "format",
          label: "Format",
          choices: [
            { value: "n", label: "1" },
            { value: "page-n", label: "Seite 1" },
            { value: "n-of-total", label: "1 / 10" },
            { value: "page-n-of-total", label: "Seite 1 von 10" },
          ],
        },
        { type: "number", name: "start", label: "Erste Zahl", value: 1, min: 0 },
        { type: "number", name: "skip", label: "Erste Seiten ohne Zahl", value: 0, min: 0, hint: "z. B. 1 für ein Deckblatt" },
        {
          type: "select",
          name: "size",
          label: "Schriftgröße",
          choices: [
            { value: "10", label: "Klein" },
            { value: "12", label: "Normal" },
            { value: "14", label: "Groß" },
          ],
        },
      ],
    },
    steps: [
      ["PDF auswählen", "Wähle die PDF aus, die nummeriert werden soll."],
      ["Position und Format wählen", "Lege fest, wo die Zahl stehen soll und wie sie aussieht – z. B. „Seite 1 von 10“."],
      ["Deckblatt überspringen", "Soll das Deckblatt keine Nummer bekommen, trage bei „Erste Seiten ohne Zahl“ eine 1 ein."],
      ["Speichern", "Klicke auf „Seitenzahlen einfügen“ und lade die PDF herunter."],
    ],
    article: [
      {
        h: "Seitenzahlen für Haus- und Abschlussarbeiten",
        p: [
          "Viele Hochschulen verlangen, dass Deckblatt und Inhaltsverzeichnis keine sichtbare Seitenzahl tragen. Mit „Erste Seiten ohne Zahl“ überspringst du diese Seiten. Über „Erste Zahl“ legst du fest, bei welcher Nummer die Zählung beginnt – so kann die Einleitung zum Beispiel mit Seite 1 starten, obwohl sie die dritte Seite der Datei ist.",
        ],
      },
    ],
    faq: [
      ["Werden bestehende Inhalte überdeckt?", "Die Zahl wird in den Seitenrand gesetzt. Reicht der Inhalt bis ganz an den Rand, kann es zu Überschneidungen kommen – wähle dann eine andere Position."],
      ["Kann ich die Schrift ändern?", "Die Zahlen werden in Helvetica gesetzt, die auf allen Geräten gleich aussieht. Größe und Position sind frei wählbar."],
      ["Wird meine PDF hochgeladen?", "Nein, alles passiert in deinem Browser."],
    ],
    related: ["watermark", "merge", "organize", "compress"],
  },
  {
    slug: "watermark",
    name: "Wasserzeichen",
    short: "Text wie „Entwurf“ oder „Vertraulich“ auf jede Seite setzen.",
    cat: "edit",
    badge: "PDF",
    glyph: "watermark",
    title: "Wasserzeichen in PDF einfügen – kostenlos online | PDF Libre",
    description:
      "Text-Wasserzeichen in PDF einfügen, z. B. „Vertraulich“ oder „Entwurf“. Deckkraft, Größe und Drehung frei wählbar. Kostenlos, direkt im Browser.",
    h1: "Wasserzeichen in PDF einfügen",
    lead: "Kennzeichne Dokumente als Entwurf, Kopie oder vertraulich – oder schütze deine Unterlagen vor Missbrauch mit einem persönlichen Hinweis.",
    ui: {
      mode: "client",
      input: PDF,
      action: "Wasserzeichen einfügen",
      options: [
        { type: "text", name: "text", label: "Text", value: "VERTRAULICH", maxlength: 60 },
        {
          type: "select",
          name: "position",
          label: "Anordnung",
          choices: [
            { value: "diagonal", label: "Diagonal, Mitte" },
            { value: "center", label: "Waagerecht, Mitte" },
            { value: "tile", label: "Über die ganze Seite" },
          ],
        },
        { type: "range", name: "opacity", label: "Deckkraft", value: 20, min: 5, max: 80, unit: "%" },
        { type: "range", name: "size", label: "Schriftgröße", value: 56, min: 16, max: 120, unit: " pt" },
        {
          type: "select",
          name: "color",
          label: "Farbe",
          choices: [
            { value: "gray", label: "Grau" },
            { value: "red", label: "Rot" },
            { value: "blue", label: "Blau" },
          ],
        },
      ],
    },
    steps: [
      ["PDF auswählen", "Wähle die PDF aus, die ein Wasserzeichen bekommen soll."],
      ["Text eingeben", "Gib den Text ein, z. B. „ENTWURF“ oder „Nur für Bewerbung bei Firma X“."],
      ["Aussehen anpassen", "Wähle Anordnung, Deckkraft, Größe und Farbe."],
      ["Speichern", "Klicke auf „Wasserzeichen einfügen“ und lade die PDF herunter."],
    ],
    article: [
      {
        h: "Ausweiskopien und Unterlagen schützen",
        p: [
          "Wenn du Kopien von Ausweisen, Zeugnissen oder Verträgen verschicken musst, hilft ein Wasserzeichen mit Zweck und Empfänger, etwa „Kopie für Wohnungsbewerbung bei Muster GmbH“. Falls die Kopie in falsche Hände gerät, ist sie für andere Zwecke deutlich schwerer zu missbrauchen.",
          "Die Option „Über die ganze Seite“ wiederholt den Text mehrfach, sodass er nicht einfach abgeschnitten werden kann.",
        ],
      },
    ],
    faq: [
      ["Kann man das Wasserzeichen wieder entfernen?", "Das Wasserzeichen wird als Text in die Seite geschrieben. Mit spezieller Software ließe es sich entfernen – für echten Schutz kombiniere es mit „PDF schützen“."],
      ["Werden Umlaute unterstützt?", "Ja, Umlaute wie ä, ö, ü und ß werden korrekt dargestellt."],
      ["Wird meine PDF hochgeladen?", "Nein, das Wasserzeichen wird in deinem Browser eingefügt."],
    ],
    related: ["protect", "page-numbers", "compress", "merge"],
  },

  // ------------------------------------------------------------------ SICHERHEIT
  {
    slug: "protect",
    name: "PDF schützen",
    short: "PDF mit einem Passwort verschlüsseln.",
    cat: "security",
    badge: "PDF",
    glyph: "lock",
    title: "PDF mit Passwort schützen – kostenlos online | PDF Libre",
    description:
      "PDF verschlüsseln: Lege ein Passwort fest, damit nur berechtigte Personen deine PDF öffnen können. Kostenlos, ohne Anmeldung, Datei wird sofort gelöscht.",
    h1: "PDF mit Passwort schützen",
    lead: "Verschlüssele deine PDF mit einem Passwort. Ohne das Passwort lässt sich die Datei nicht öffnen.",
    ui: {
      mode: "server",
      endpoint: "/api/protect",
      input: PDF,
      action: "PDF schützen",
      options: [
        { type: "password", name: "password", label: "Passwort", placeholder: "Mindestens 4 Zeichen", required: true, autocomplete: "new-password" },
        { type: "password", name: "password2", label: "Passwort wiederholen", required: true, autocomplete: "new-password", noSend: true },
      ],
    },
    steps: [
      ["PDF auswählen", "Wähle die PDF aus, die du schützen möchtest."],
      ["Passwort festlegen", "Gib ein sicheres Passwort ein und wiederhole es."],
      ["Schützen", "Klicke auf „PDF schützen“. Die Datei wird verschlüsselt."],
      ["Passwort getrennt teilen", "Schick dem Empfänger das Passwort auf einem anderen Weg als die Datei, z. B. per SMS."],
    ],
    article: [
      {
        h: "So wählst du ein gutes Passwort",
        p: [
          "Je länger, desto besser: Ein Satz aus mehreren Wörtern wie „Blauer-Hafen-Kaffee-42“ ist schwerer zu knacken als ein kurzes Passwort mit Sonderzeichen und trotzdem leicht zu merken. Verwende kein Passwort, das du schon für E-Mail oder Onlinebanking nutzt.",
          "Wichtig: Wir speichern dein Passwort nicht. Wenn du es vergisst, kann niemand die Datei wieder öffnen – bewahre also das ungeschützte Original auf.",
        ],
      },
      {
        h: "Wie sicher ist der Schutz?",
        p: [
          "Die Datei wird mit dem 128-Bit-Standard verschlüsselt, den alle gängigen PDF-Programme öffnen können – Adobe Reader, Browser, Vorschau auf dem Mac und Smartphones. Das reicht für den Versand von Rechnungen, Gehaltsnachweisen oder Bewerbungsunterlagen.",
        ],
      },
    ],
    faq: [
      ["Speichert ihr mein Passwort?", "Nein. Das Passwort wird nur für die Verschlüsselung verwendet und danach zusammen mit der Datei gelöscht."],
      ["Kann ich das Passwort später wieder entfernen?", "Ja, mit „PDF entsperren“ – dafür brauchst du das Passwort."],
      ["Ich habe das Passwort vergessen. Was jetzt?", "Ohne Passwort lässt sich die Datei nicht öffnen. Verwende deine ungeschützte Originaldatei und schütze sie neu."],
    ],
    related: ["unlock", "watermark", "compress", "merge"],
  },
  {
    slug: "unlock",
    name: "PDF entsperren",
    short: "Passwortschutz aus einer PDF entfernen.",
    cat: "security",
    badge: "PDF",
    glyph: "unlock",
    title: "PDF entsperren – Passwort entfernen, kostenlos | PDF Libre",
    description:
      "Passwortschutz von PDF entfernen: Gib das bekannte Passwort einmal ein und speichere die PDF ohne Schutz. Kostenlos, Datei wird sofort gelöscht.",
    h1: "PDF entsperren",
    lead: "Entferne den Passwortschutz aus einer PDF, deren Passwort du kennst – damit du sie nicht bei jedem Öffnen eingeben musst.",
    ui: {
      mode: "server",
      endpoint: "/api/unlock",
      input: PDF,
      action: "PDF entsperren",
      options: [{ type: "password", name: "password", label: "Aktuelles Passwort", autocomplete: "off", hint: "Leer lassen, wenn die PDF nur Drucken oder Kopieren sperrt" }],
    },
    steps: [
      ["PDF auswählen", "Wähle die passwortgeschützte PDF aus."],
      ["Passwort eingeben", "Gib das Passwort ein, mit dem die PDF geöffnet wird."],
      ["Entsperren", "Klicke auf „PDF entsperren“ und lade die Datei ohne Passwortschutz herunter."],
    ],
    article: [
      {
        h: "Wofür ist das gedacht?",
        p: [
          "Kontoauszüge, Gehaltsabrechnungen oder Steuerbescheide kommen oft passwortgeschützt. Wenn du sie archivieren, zusammenfügen oder an deinen Steuerberater weitergeben willst, ist das Passwort lästig. Mit diesem Werkzeug speicherst du eine Kopie ohne Schutz.",
          "Das Werkzeug knackt keine Passwörter. Du musst das Passwort kennen – entsperre nur Dateien, die dir gehören oder für die du berechtigt bist.",
        ],
      },
    ],
    faq: [
      ["Kann ich eine PDF ohne Passwort entsperren?", "Nein. Das Werkzeug entfernt nur einen Schutz, dessen Passwort du kennst."],
      ["Was, wenn die PDF nur Drucken oder Kopieren verbietet?", "Solche Dateien lassen sich ohne Passwort öffnen. Lade sie einfach hoch und lass das Passwortfeld leer."],
      ["Wird mein Passwort gespeichert?", "Nein. Passwort und Datei werden direkt nach der Verarbeitung gelöscht."],
    ],
    related: ["protect", "merge", "pdf-to-docx", "compress"],
  },
];

module.exports = { tools, categories };

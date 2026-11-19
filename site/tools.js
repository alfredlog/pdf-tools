/**
 * Alle Werkzeuge von PDF Libre an einem Ort.
 * Texte hier ändern → `npm run build` → die HTML-Seiten in /public werden neu erzeugt.
 *
 * mode: "server" = Datei wird hochgeladen und auf dem Server verarbeitet (Ghostscript/LibreOffice/Python)
 *       "client" = läuft komplett im Browser, die Datei verlässt das Gerät nicht
 */

// Reihenfolge = Reihenfolge auf der Startseite, im Menü und in den Filtern
const categories = [
  { id: "bewerbung", name: "Bewerbung & Lebenslauf", short: "Bewerbung", color: "career", hub: "bewerbung" },
  { id: "organize", name: "Zusammenfügen & Organisieren", short: "Organisieren", color: "organize" },
  { id: "optimize", name: "Komprimieren", short: "Komprimieren", color: "optimize" },
  { id: "edit", name: "Bearbeiten & Unterschreiben", short: "Bearbeiten", color: "edit" },
  { id: "to-pdf", name: "In PDF umwandeln", short: "In PDF", color: "topdf" },
  { id: "from-pdf", name: "Aus PDF umwandeln", short: "Aus PDF", color: "frompdf" },
  { id: "ai", name: "KI-Werkzeuge", short: "KI", color: "ai" },
  { id: "security", name: "Sicherheit", short: "Sicherheit", color: "security" },
  { id: "erechnung", name: "E-Rechnung", short: "E-Rechnung", color: "erechnung" },
];

// Reihenfolge der Werkzeuge innerhalb der Kategorien (beliebteste zuerst)
const ORDER = [
  "lebenslauf-erstellen", "lebenslauf-anpassen", "anschreiben-erstellen", "bewerbungsmappe", "merge", "split", "organize", "rotate", "remove-pages", "extract-pages",
  "compress", "merge-compress",
  "edit", "sign", "ocr", "create", "page-numbers", "watermark",
  "docx-to-pdf", "jpg-to-pdf", "heic-to-pdf", "excel-to-pdf", "ppt-to-pdf", "pdfa",
  "pdf-to-docx", "pdf-to-excel", "pdf-to-powerpoint", "pdf-to-jpg",
  "summarize", "translate",
  "protect", "redact", "unlock",
  "xrechnung-anzeigen", "e-rechnung-pruefen",
];

const PDF = { accept: ".pdf,application/pdf", label: "PDF" };
const EINVOICE = { accept: ".xml,.pdf,application/xml,text/xml,application/pdf", label: "XML oder PDF" };

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
    related: ["bewerbungsmappe", "merge-compress", "organize", "compress"],
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
    short: "Einzelne Seiten aus einer PDF herauslösen und als neue PDF speichern.",
    cat: "organize",
    badge: "PDF",
    glyph: "extract",
    title: "PDF-Seiten extrahieren – einzelne Seiten als neue PDF speichern | PDF Libre",
    description:
      "Seiten aus PDF extrahieren: einzelne Seiten per Klick auswählen und als neue PDF oder als einzelne Dateien speichern – z. B. die Unterschriftenseite oder ein Kapitel. Kostenlos, im Browser, ohne Upload.",
    h1: "Seiten aus PDF extrahieren",
    lead: "Brauchst du aus einer langen PDF nur ein paar Seiten? Klicke sie an und speichere sie als neue PDF – das Original bleibt unverändert, die Datei verlässt dein Gerät nicht.",
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
      ["PDF auswählen", "Lade die PDF hoch – alle Seiten werden als kleine Vorschau angezeigt."],
      ["Seiten anklicken", "Markiere die gewünschten Seiten in der Vorschau oder tippe die Seitenzahlen ein, zum Beispiel „1, 3-5, 12“."],
      ["Ergebnis wählen", "Eine gemeinsame PDF mit allen ausgewählten Seiten – oder jede Seite als eigene PDF (als ZIP-Archiv)."],
      ["Herunterladen", "Klicke auf „Seiten extrahieren“ und speichere die neue PDF. Deine Original-PDF bleibt unverändert."],
    ],
    article: [
      {
        h: "Wann ist Seiten extrahieren sinnvoll?",
        p: [
          "Oft braucht man aus einem langen Dokument nur einen kleinen Teil: die Unterschriftenseite eines Mietvertrags für den Vermieter, die eine Seite mit dem Kontoauszug für den Antrag beim Amt, das Zeugnis aus einer gescannten Bewerbungsmappe, ein Kapitel aus einem Skript für die Lerngruppe oder die Rechnung aus einem mehrseitigen Bestellbeleg.",
          "Statt die ganze Datei zu verschicken – mit Informationen, die den Empfänger nichts angehen –, extrahierst du genau die Seiten, die gebraucht werden. Das ist übersichtlicher, die Datei ist kleiner und du gibst weniger persönliche Daten weiter.",
        ],
      },
      {
        h: "Extrahieren, Teilen oder Seiten entfernen – was ist der Unterschied?",
        p: [
          "„Seiten extrahieren“ (diese Seite): Du wählst die Seiten aus, die du behalten willst, und bekommst nur diese als neue PDF. Ideal, wenn du wenige Seiten aus einem langen Dokument brauchst.",
          "„PDF teilen“: Das ganze Dokument wird in mehrere Teile zerlegt, zum Beispiel nach Seitenbereichen oder alle 10 Seiten. Ideal, wenn eine große PDF für ein Upload-Portal in Stücke muss.",
          "„Seiten entfernen“: Du wählst die Seiten aus, die weg sollen, und behältst den Rest. Ideal für leere Rückseiten, Werbung oder veraltete Abschnitte.",
        ],
      },
      {
        h: "Sicher und ohne Qualitätsverlust",
        p: [
          "Die Seiten werden 1:1 übernommen: Text bleibt durchsuchbar, Bilder behalten ihre Auflösung, Links funktionieren weiter. Weil alles direkt in deinem Browser passiert, wird die PDF nicht auf einen Server hochgeladen – auch bei vertraulichen Dokumenten wie Verträgen, Kontoauszügen oder Arztbriefen.",
          "Tipp: Willst du die extrahierten Seiten in eine andere Reihenfolge bringen oder mit einer anderen Datei kombinieren, nutze danach „PDF organisieren“ oder „PDF zusammenfügen“.",
        ],
      },
    ],
    faq: [
      ["Wie extrahiere ich eine einzelne Seite aus einer PDF?", "PDF auswählen, die Seite in der Vorschau anklicken und auf „Seiten extrahieren“ klicken. Du erhältst eine neue PDF, die nur diese Seite enthält."],
      ["Kann ich mehrere nicht zusammenhängende Seiten extrahieren?", "Ja. Klicke einfach alle gewünschten Seiten an oder tippe z. B. „2, 5, 9-11“ ein."],
      ["Kann ich jede Seite als eigene PDF speichern?", "Ja. Wähle unter „Ergebnis“ die Option „Einzelne PDFs“ – du bekommst ein ZIP-Archiv mit einer Datei pro Seite."],
      ["In welcher Reihenfolge landen die Seiten in der neuen PDF?", "In der Reihenfolge des Originals. Wenn du sie umsortieren möchtest, nutze danach „PDF organisieren“."],
      ["Verändert sich die Qualität?", "Nein, die Seiten werden 1:1 übernommen."],
      ["Wird meine Datei auf einen Server geladen?", "Nein, das Extrahieren läuft komplett in deinem Browser."],
      ["Funktioniert das auch auf dem Handy?", "Ja, auf allen aktuellen Smartphones und Tablets – Seiten antippen, extrahieren, fertig."],
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
    related: ["bewerbungsmappe", "merge", "organize", "jpg-to-pdf"],
  },

  // ------------------------------------------------------------------ IN PDF
  {
    slug: "docx-to-pdf",
    name: "Word in PDF",
    short: "DOC- und DOCX-Dateien in saubere PDFs umwandeln.",
    cat: "to-pdf",
    badge: "DOC",
    glyph: "word",
    title: "DOCX in PDF umwandeln – Word zu PDF, kostenlos online | PDF Libre",
    description:
      "DOCX in PDF umwandeln (docx to pdf): Word-Dateien online in PDF konvertieren – ohne Word, ohne Anmeldung, ohne Wasserzeichen. Auch DOC, ODT und RTF. Kostenlos.",
    h1: "DOCX in PDF umwandeln – Word zu PDF",
    lead: "Wandle DOCX- und DOC-Dateien kostenlos in PDFs um, die auf jedem Gerät gleich aussehen – ideal für Bewerbungen, Rechnungen, Hausarbeiten und Verträge.",
    ui: {
      mode: "server",
      endpoint: "/api/word-to-pdf",
      input: { accept: ".doc,.docx,.odt,.rtf", label: "Word" },
      action: "In PDF umwandeln",
      dropHint: "DOC, DOCX, ODT oder RTF, bis zu 50 MB",
    },
    steps: [
      ["DOCX-Datei auswählen", "Klicke auf „Datei auswählen“ oder ziehe deine DOCX-Datei in das Feld. Auch DOC, ODT und RTF funktionieren."],
      ["In PDF umwandeln", "Klicke auf „In PDF umwandeln“. Die Umwandlung von DOCX zu PDF dauert meist nur ein paar Sekunden."],
      ["PDF herunterladen", "Speichere die fertige PDF. Deine DOCX-Datei wird danach automatisch vom Server gelöscht."],
    ],
    article: [
      {
        h: "DOCX zu PDF – ohne Word, auf jedem Gerät",
        p: [
          "Du brauchst kein Microsoft Word, um eine DOCX-Datei in PDF umzuwandeln. PDF Libre erledigt die Umwandlung im Browser – auf Windows, Mac, Linux, Chromebook, Android und iPhone. Das ist praktisch, wenn du eine DOCX-Datei per E-Mail bekommen hast und sie als PDF weiterleiten, ausdrucken oder in ein Bewerbungsportal hochladen musst.",
          "Seitenränder, Kopf- und Fußzeilen, Tabellen, Bilder und Seitenumbrüche aus der DOCX-Datei werden in die PDF übernommen. Überschriften und Links bleiben erhalten, der Text bleibt durchsuchbar und kopierbar.",
        ],
      },
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
      {
        h: "Word in PDF für Bewerbung, Uni und Behörden",
        p: [
          "Bewerbungsportale, Hochschulen und Ämter verlangen fast immer PDF statt Word: Anschreiben und Lebenslauf sehen dann bei jedem Personaler gleich aus, Hausarbeiten lassen sich nicht versehentlich ändern, Anträge kommen vollständig an. Wandle deine DOCX-Datei hier um und füge sie danach mit „Bewerbungsmappe erstellen“ oder „PDF zusammenfügen“ zu einer Datei zusammen.",
          "Verlangt eine Behörde oder ein Gericht ausdrücklich PDF/A, wandle die fertige PDF anschließend mit „PDF in PDF/A umwandeln“ um. Ist die Datei zu groß für ein Upload-Portal, hilft „PDF komprimieren“.",
        ],
      },
    ],
    faq: [
      ["Wie wandle ich DOCX in PDF um?", "DOCX-Datei oben auswählen, auf „In PDF umwandeln“ klicken und die PDF herunterladen. Kostenlos, ohne Anmeldung und ohne Wasserzeichen."],
      ["Kann ich DOCX in PDF umwandeln, ohne Word zu haben?", "Ja. Die Umwandlung läuft auf unserem Server, du brauchst nur einen Browser – auch am Handy."],
      ["Welche Formate werden unterstützt?", "DOCX, DOC, ODT (LibreOffice/OpenOffice) und RTF."],
      ["Bleiben Links und Inhaltsverzeichnis erhalten?", "Ja, Hyperlinks und Überschriften werden in die PDF übernommen."],
      ["Warum sieht meine PDF leicht anders aus als in Word?", "Meist liegt es an einer Schrift, die auf dem Server nicht installiert ist. Mit einer Standardschrift oder mit in Word eingebetteten Schriften passiert das nicht."],
      ["Wird meine Datei gespeichert?", "Nein, sie wird direkt nach der Umwandlung gelöscht."],
      ["Kann ich mehrere Word-Dateien in eine PDF umwandeln?", "Wandle die Dateien nacheinander um und füge die PDFs dann mit „PDF zusammenfügen“ zusammen – oder nutze „Bewerbungsmappe erstellen“, das Word-Dateien direkt annimmt."],
      ["Funktioniert die Umwandlung auf dem Handy?", "Ja. Wähle die DOCX-Datei auf dem Smartphone aus, zum Beispiel aus der Mail-App oder aus Google Drive, und lade die PDF herunter."],
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
    related: ["pdf-to-powerpoint", "docx-to-pdf", "excel-to-pdf", "compress"],
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
    related: ["pdf-to-excel", "docx-to-pdf", "ppt-to-pdf", "merge"],
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
    related: ["pdf-to-excel", "pdf-to-powerpoint", "pdf-to-jpg", "compress"],
  },

  // ------------------------------------------------------------------ AUS PDF
  {
    slug: "pdf-to-docx",
    name: "PDF in Word",
    short: "PDFs in bearbeitbare DOCX-Dateien umwandeln – auch gescannte (OCR).",
    cat: "from-pdf",
    badge: "DOC",
    glyph: "word",
    title: "PDF in Word umwandeln – auch Scans mit OCR, Layout bleibt | PDF Libre",
    description:
      "PDF in Word umwandeln: PDF online in ein bearbeitbares DOCX konvertieren – Tabellen, Bilder und Layout bleiben erhalten. Gescannte PDFs werden per Texterkennung (OCR) bearbeitbar. Kostenlos, ohne Anmeldung.",
    h1: "PDF in Word umwandeln – auch gescannte PDFs",
    lead: "Mach aus einer PDF wieder ein bearbeitbares Word-Dokument – mit Absätzen, Tabellen und Bildern. Gescannte Seiten werden automatisch per Texterkennung (OCR) in echten Text umgewandelt.",
    ui: {
      mode: "server",
      endpoint: "/api/pdf-to-word",
      input: PDF,
      action: "In Word umwandeln",
      dropHint: "PDF-Datei, bis zu 50 MB – auch Scans",
      options: [
        {
          type: "radio",
          name: "mode",
          label: "Layout",
          choices: [
            { value: "flow", label: "Bearbeitbar", hint: "Echte Absätze und Tabellen – zum Weiterschreiben (empfohlen)" },
            { value: "exact", label: "Wie im Original", hint: "Jeder Textblock an seiner genauen Stelle – ideal für Formulare und Flyer" },
          ],
        },
        {
          type: "select",
          name: "ocr",
          label: "Texterkennung für gescannte Seiten",
          choices: [
            { value: "deu", label: "Automatisch – Deutsch und Englisch" },
            { value: "fra", label: "Automatisch – Französisch und Englisch" },
            { value: "mix", label: "Automatisch – Deutsch, Englisch, Französisch" },
            { value: "eng", label: "Automatisch – nur Englisch" },
            { value: "off", label: "Aus – Scans als Bild übernehmen" },
          ],
        },
      ],
    },
    steps: [
      ["PDF auswählen", "Wähle die PDF aus, die du bearbeiten möchtest – digital erstellt oder eingescannt."],
      ["Layout wählen", "„Bearbeitbar“ baut echte Absätze und Tabellen, „Wie im Original“ setzt jeden Textblock an seine genaue Stelle."],
      ["Umwandeln", "Klicke auf „In Word umwandeln“. Gescannte Seiten werden automatisch erkannt, gerade gerichtet und per OCR in Text umgewandelt."],
      ["Herunterladen", "Öffne die DOCX-Datei in Word, LibreOffice oder Google Docs und bearbeite sie."],
    ],
    article: [
      {
        h: "PDF in Word umwandeln – ohne Word, ohne Software",
        p: [
          "Du hast einen Vertrag, eine Rechnung, eine Hausarbeit oder einen Lebenslauf nur noch als PDF und musst etwas ändern? Mit PDF Libre wandelst du die PDF kostenlos in ein bearbeitbares Word-Dokument (DOCX) um – direkt im Browser, am PC, am Mac und auf dem Handy. Das Ergebnis öffnest du in Microsoft Word, LibreOffice, Google Docs oder Pages.",
          "Die Umwandlung erkennt Absätze, Überschriften, Aufzählungen, Tabellen und Bilder und baut daraus ein Word-Dokument mit echtem Fließtext. Schriftgrößen, Fettdruck, Farben und mehrspaltige Bereiche werden übernommen. Schriftnamen werden so angepasst, dass Word sie kennt – aus „ArialMT“ wird zum Beispiel wieder „Arial“.",
        ],
      },
      {
        h: "Gescannte PDF in Word umwandeln – mit Texterkennung (OCR)",
        p: [
          "Eine eingescannte Seite oder ein Handyfoto ist für den Computer nur ein Bild. Viele Umwandler legen dieses Bild einfach in das Word-Dokument – bearbeiten kannst du dann nichts. PDF Libre erkennt gescannte Seiten automatisch und baut sie neu auf: Das Bild wird gerade gerichtet, der Text per OCR erkannt und als echter Text an dieselbe Stelle gesetzt, in passender Größe und Farbe.",
          "Tabellenlinien werden nachgezeichnet, damit Word daraus richtige Tabellen mit Zellen macht. Logos, Fotos, Stempel und Unterschriften bleiben als Bilder an ihrem Platz. So wird aus einem gescannten Angebot, Brief oder Formular ein Dokument, in dem du Text und Zahlen direkt ändern kannst. Unterstützt werden Deutsch, Englisch und Französisch – auch gemischt.",
        ],
      },
      {
        h: "Layout behalten: „Bearbeitbar“ oder „Wie im Original“?",
        p: [
          "„Bearbeitbar“ (empfohlen) erzeugt echten Fließtext: Wenn du einen Satz ergänzt, rutscht der Rest automatisch weiter, Tabellen wachsen mit. Das ist ideal für Briefe, Verträge, Hausarbeiten und Berichte, die du weiterschreiben möchtest.",
          "„Wie im Original“ setzt jeden Textblock genau an seine Stelle – das Word-Dokument sieht dann aus wie die PDF. Das passt zu Flyern, Formularen, Präsentationen und Dokumenten mit freiem Layout, in denen du nur einzelne Wörter austauschen willst. Dafür ist der Text in Textfelder aufgeteilt und längeres Weiterschreiben mühsamer.",
        ],
      },
      {
        h: "Tipps für das beste Ergebnis",
        p: [
          "Scanne mit mindestens 200 dpi, möglichst gerade und ohne Schatten. Bei Handyfotos hilft gutes Tageslicht. Handschrift wird nur eingeschränkt erkannt. Passwortgeschützte PDFs entsperrst du vorher mit „PDF entsperren“. Brauchst du keinen Word-Text, sondern nur eine durchsuchbare PDF, ist „PDF durchsuchbar machen (OCR)“ der schnellere Weg.",
        ],
      },
    ],
    faq: [
      ["Kann ich gescannte PDFs in Word umwandeln?", "Ja. Gescannte Seiten werden automatisch erkannt und per Texterkennung (OCR) in echten, bearbeitbaren Text umgewandelt – mit Tabellen und Bildern an ihrem Platz."],
      ["Bleibt das Layout erhalten?", "Ja, so weit wie möglich. Mit „Bearbeitbar“ entstehen echte Absätze und Tabellen, mit „Wie im Original“ steht jeder Textblock genau an seiner Stelle."],
      ["Funktioniert es mit Google Docs und LibreOffice?", "Ja. Die DOCX-Datei öffnet sich in Word, LibreOffice, Google Docs und Pages."],
      ["Welche Sprachen erkennt die Texterkennung?", "Deutsch, Englisch und Französisch – auch gemischt in einem Dokument. Umlaute, Akzente und das €-Zeichen werden richtig erkannt."],
      ["Warum ist das Layout nicht 100 % identisch?", "PDFs speichern die genaue Position jedes Zeichens, Word arbeitet mit Fließtext. Bei sehr komplexen Layouts muss die Umwandlung Kompromisse machen – dann hilft „Wie im Original“."],
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
    short: "Text ändern, hinzufügen oder löschen, Bilder und Formen einfügen. 14 Tage gratis testen.",
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
    related: ["sign", "create", "watermark", "page-numbers"],
    // Texte, wenn die Bezahlung ausgeschaltet ist (PAYMENTS_ENABLED=false)
    free: {
      short: "Text ändern, hinzufügen oder löschen, Bilder und Formen einfügen. Kostenlos.",
      description:
        "PDF kostenlos online bearbeiten: vorhandenen Text ändern, neuen Text, Bilder, Formen und Unterschriften einfügen, Inhalte endgültig löschen. Ohne Anmeldung.",
      steps: { 3: ["Herunterladen", "Klicke auf „Herunterladen“ – deine bearbeitete PDF wird sofort gespeichert. Kostenlos und ohne Konto."] },
      faq: { 0: ["Was kostet der PDF-Editor?", "Nichts. Der PDF-Editor ist kostenlos und ohne Anmeldung nutzbar – ohne Wasserzeichen."] },
    },
  },
  {
    slug: "create",
    name: "PDF erstellen",
    short: "Eigene PDF von Grund auf gestalten – mit Text, Bildern und Formen. 14 Tage gratis testen.",
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
    free: {
      short: "Eigene PDF von Grund auf gestalten – mit Text, Bildern und Formen. Kostenlos.",
      description:
        "Neue PDF kostenlos online erstellen: leere Seiten in A4, A5 oder US Letter mit Text, Bildern, Formen und Zeichnungen gestalten. Ohne Anmeldung.",
      steps: { 3: ["Herunterladen", "Klicke auf „Herunterladen“ – kostenlos und ohne Konto."] },
      faq: { 2: ["Was kostet das?", "Nichts. PDF erstellen ist kostenlos und ohne Anmeldung nutzbar."] },
    },
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
  // ------------------------------------------------------------------ E-RECHNUNG
  {
    slug: "xrechnung-anzeigen",
    name: "XRechnung anzeigen",
    short: "XRechnung (XML) oder ZUGFeRD-PDF als lesbare PDF anzeigen und speichern.",
    cat: "erechnung",
    badge: "XML",
    glyph: "einvoiceView",
    promo: {
      title: "Bekommst du regelmäßig E-Rechnungen?",
      text: "E-Rechnung Agent nimmt sie automatisch an, prüft sie und bereitet sie für deinen Steuerberater (DATEV) vor – mit eigener E-Mail-Adresse für Rechnungen. 30 Tage kostenlos testen.",
      url: "https://erechnungagent.de/?utm_source=pdf-libre&utm_medium=tool&utm_campaign=xrechnung-anzeigen",
      button: "E-Rechnung Agent ansehen",
    },
    title: "XRechnung anzeigen – XML lesbar als PDF, kostenlos | PDF Libre",
    description:
      "XRechnung online anzeigen: XML-Datei hochladen und als übersichtliche PDF mit Positionen, Summen und Steuer erhalten. Auch für ZUGFeRD. Kostenlos, ohne Anmeldung.",
    h1: "XRechnung anzeigen",
    lead: "Lade eine XRechnung (XML) oder eine ZUGFeRD-PDF hoch und erhalte eine lesbare PDF mit allen Angaben – inklusive automatischer Prüfung der Beträge.",
    ui: {
      mode: "server",
      endpoint: "/api/e-rechnung",
      input: EINVOICE,
      action: "Rechnung anzeigen",
      dropHint: "XRechnung (.xml, UBL oder CII) oder ZUGFeRD-/Factur-X-PDF, bis zu 15 MB",
    },
    steps: [
      ["Datei auswählen", "Wähle die XRechnung (.xml) oder die ZUGFeRD-PDF aus, die du erhalten hast."],
      ["Anzeigen", "Klicke auf „Rechnung anzeigen“. Die Daten werden ausgelesen und nachgerechnet."],
      ["PDF speichern", "Lade die lesbare PDF herunter – zum Ablegen, Weiterleiten oder Ausdrucken."],
    ],
    article: [
      {
        h: "Warum kann ich eine XRechnung nicht einfach öffnen?",
        p: [
          "Eine XRechnung ist keine Bild-Datei, sondern ein strukturierter Datensatz im XML-Format. Programme wie die Buchhaltungssoftware lesen ihn automatisch; im Browser oder Texteditor sieht man dagegen nur Code. Seit 2025 müssen alle Unternehmen in Deutschland solche E-Rechnungen empfangen können – viele kleine Betriebe haben dafür aber noch kein passendes Programm.",
          "Dieses Werkzeug liest die Daten aus und stellt sie als normale Rechnung dar: Rechnungssteller, Empfänger, Positionen, Umsatzsteuer, Zahlbetrag und Bankverbindung.",
        ],
      },
      {
        h: "Was ist mit ZUGFeRD und Factur-X?",
        p: [
          "ZUGFeRD- und Factur-X-Rechnungen sind PDFs, in denen zusätzlich eine XML-Datei steckt. Die sichtbare PDF und die Daten können sich in seltenen Fällen unterscheiden. Das Werkzeug liest die eingebetteten Daten aus, also genau das, was auch die Buchhaltung verarbeitet.",
        ],
      },
    ],
    faq: [
      ["Ist die erzeugte PDF eine gültige Rechnung?", "Nein. Sie ist eine lesbare Darstellung. Rechtlich maßgeblich und aufzubewahren ist die Original-Datei (XML bzw. ZUGFeRD-PDF)."],
      ["Welche Formate werden unterstützt?", "XRechnung in UBL- und CII-Syntax sowie ZUGFeRD 2.x und Factur-X. Normale PDFs ohne eingebettete Daten und Scans werden nicht erkannt."],
      ["Werden die Beträge geprüft?", "Ja. Summen, Umsatzsteuer und Zahlbetrag werden nachgerechnet, Pflichtangaben und die IBAN geprüft. Das Ergebnis steht in der PDF."],
      ["Werden meine Rechnungen gespeichert?", "Nein. Die Datei wird nur für die Verarbeitung auf unserem Server in Deutschland verwendet und danach sofort gelöscht."],
    ],
    related: ["e-rechnung-pruefen", "merge", "compress", "protect"],
  },
  {
    slug: "e-rechnung-pruefen",
    name: "E-Rechnung prüfen",
    short: "XRechnung oder ZUGFeRD auf Fehler prüfen: Beträge, Steuer, Pflichtangaben.",
    cat: "erechnung",
    badge: "XML",
    glyph: "einvoiceCheck",
    promo: {
      title: "Bekommst du regelmäßig E-Rechnungen?",
      text: "E-Rechnung Agent nimmt sie automatisch an, prüft sie und bereitet sie für deinen Steuerberater (DATEV) vor – mit eigener E-Mail-Adresse für Rechnungen. 30 Tage kostenlos testen.",
      url: "https://erechnungagent.de/?utm_source=pdf-libre&utm_medium=tool&utm_campaign=e-rechnung-pruefen",
      button: "E-Rechnung Agent ansehen",
    },
    title: "E-Rechnung prüfen – XRechnung & ZUGFeRD validieren, kostenlos | PDF Libre",
    description:
      "E-Rechnung online prüfen: XRechnung oder ZUGFeRD hochladen, Beträge, Umsatzsteuer, Pflichtangaben und IBAN werden kontrolliert. Prüfbericht als PDF. Kostenlos.",
    h1: "E-Rechnung prüfen",
    lead: "Prüfe eine XRechnung oder ZUGFeRD-Rechnung, bevor du sie bezahlst oder verschickst. Du erhältst einen Prüfbericht als PDF.",
    ui: {
      mode: "server",
      endpoint: "/api/e-rechnung",
      input: EINVOICE,
      action: "Rechnung prüfen",
      dropHint: "XRechnung (.xml, UBL oder CII) oder ZUGFeRD-/Factur-X-PDF, bis zu 15 MB",
    },
    steps: [
      ["Datei auswählen", "Wähle die E-Rechnung aus – egal ob erhalten oder selbst erstellt."],
      ["Prüfen", "Klicke auf „Rechnung prüfen“. Beträge und Pflichtangaben werden kontrolliert."],
      ["Bericht lesen", "Das Ergebnis siehst du sofort, die Details stehen in der heruntergeladenen PDF."],
    ],
    article: [
      {
        h: "Was wird geprüft?",
        p: [
          "Das Werkzeug rechnet die Rechnung nach: Stimmen die Positionen mit der Gesamtsumme überein, passt die Umsatzsteuer zum Steuersatz, ergibt Netto plus Steuer den Bruttobetrag und ist der Zahlbetrag korrekt? Außerdem werden Pflichtangaben wie Rechnungsnummer, Datum und Steuernummer des Rechnungsstellers kontrolliert und die IBAN auf Tippfehler geprüft.",
          "Die vollständige Prüfung gegen die offiziellen XRechnung-Regeln erfolgt mit dem Prüfwerkzeug der KoSIT, wenn es auf dem Server verfügbar ist. Der Bericht zeigt an, ob diese Prüfung durchgeführt wurde.",
        ],
      },
      {
        h: "Ab wann muss ich E-Rechnungen verschicken?",
        p: [
          "Empfangen müssen alle Unternehmen in Deutschland E-Rechnungen schon seit dem 1. Januar 2025. Für das Verschicken gilt: Unternehmen mit mehr als 800.000 Euro Vorjahresumsatz ab dem 1. Januar 2027, alle anderen ab dem 1. Januar 2028. Ausgenommen sind unter anderem Kleinbetragsrechnungen bis 250 Euro und Rechnungen an Privatpersonen. Im Zweifel klärt das dein Steuerberater.",
        ],
      },
    ],
    faq: [
      ["Ersetzt das die Prüfung durch meinen Steuerberater?", "Nein. Das Werkzeug findet formale und rechnerische Fehler. Ob eine Rechnung steuerlich korrekt ist, beurteilt dein Steuerberater."],
      ["Kann ich auch eine normale PDF-Rechnung prüfen?", "Nein. Eine normale PDF enthält keine strukturierten Daten. Unterstützt werden XRechnung (XML) und ZUGFeRD-/Factur-X-PDFs."],
      ["Was bedeutet „Hinweis“ im Bericht?", "Ein Hinweis ist kein Fehler, sollte aber angeschaut werden – zum Beispiel eine fehlende Steuernummer oder eine Rundungsdifferenz."],
      ["Werden meine Rechnungen gespeichert?", "Nein. Die Datei wird nur für die Prüfung auf unserem Server in Deutschland verwendet und danach sofort gelöscht."],
    ],
    related: ["xrechnung-anzeigen", "merge", "compress", "protect"],
  },
];

tools.push(...require("./tools-new"));

// Nach Kategorie und Beliebtheit sortieren
const catIndex = Object.fromEntries(categories.map((c, i) => [c.id, i]));
tools.sort((a, b) => catIndex[a.cat] - catIndex[b.cat] || ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug));

module.exports = { tools, categories };

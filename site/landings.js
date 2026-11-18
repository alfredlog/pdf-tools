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
];

module.exports = { landings };
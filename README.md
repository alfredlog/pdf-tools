# PDF Libre

Kostenlose PDF-Werkzeuge online – [pdf-libre.de](https://pdf-libre.de)

20 Werkzeuge – 18 kostenlos, dazu **PDF bearbeiten** und **PDF erstellen** als Pro (14 Tage gratis, dann 4,99 €/Monat oder Tagespass 2,99 €): zusammenfügen, komprimieren, teilen, Seiten entfernen/extrahieren, organisieren, drehen, Word/PowerPoint/Excel/Bilder → PDF, PDF → Word/JPG, Seitenzahlen, Wasserzeichen, schützen, entsperren.

## Lokal testen

### 1. Voraussetzungen

| Programm | Wofür | macOS | Windows | Ubuntu/Debian |
|---|---|---|---|---|
| Node.js ≥ 18 | Server | `brew install node` | [nodejs.org](https://nodejs.org) | `sudo apt install nodejs npm` |
| Ghostscript | Komprimieren, Zusammenfügen, Schützen, Entsperren | `brew install ghostscript` | [ghostscript.com](https://ghostscript.com/releases/gsdnld.html) | `sudo apt install ghostscript` |
| LibreOffice | Word/PowerPoint/Excel → PDF | `brew install --cask libreoffice` | [libreoffice.org](https://de.libreoffice.org/download/) | `sudo apt install libreoffice` |
| Python 3 + pdf2docx + PyMuPDF | PDF → Word, PDF-Editor | `pip3 install -r requirements.txt` | `pip install -r requirements.txt` | `pip3 install -r requirements.txt` |

Die 9 Browser-Werkzeuge (Teilen, Drehen, Organisieren, Wasserzeichen …) brauchen davon nichts außer Node.

### 2. Starten

```bash
npm install
cp .env.example .env      # Werte eintragen (siehe unten)
docker compose up -d      # lokale PostgreSQL-Datenbank (oder eigene Datenbank in DATABASE_URL)
npm run check             # zeigt, was installiert und eingerichtet ist
npm start                 # → http://localhost:3000
```

Ohne `DATABASE_URL` laufen alle kostenlosen Werkzeuge trotzdem – nur Konten und der Editor-Download sind dann aus.

## Pro einrichten (Konten + Stripe)

**Datenbank:** Die Tabellen legt der Server beim Start selbst an. Lokal reicht `docker compose up -d`. Für den Livebetrieb eignet sich jede PostgreSQL-Datenbank (z. B. Neon, Supabase, Render); dann `DATABASE_SSL=true`.

**Stripe** (erst im Testmodus ausprobieren):
1. Dashboard → Produktkatalog → Produkt „PDF Libre Pro“ mit Preis **4,99 € monatlich (wiederkehrend)** anlegen → Preis-ID in `STRIPE_PRICE_PRO`.
2. Produkt „Tagespass“ mit Preis **2,99 € einmalig** → Preis-ID in `STRIPE_PRICE_DAYPASS`.
3. Entwickler → API-Schlüssel → Secret Key in `STRIPE_SECRET_KEY`.
4. Webhook auf `https://pdf-libre.de/api/stripe/webhook` mit den Ereignissen
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted` → Signatur-Secret in `STRIPE_WEBHOOK_SECRET`.
   Lokal: `stripe listen --forward-to localhost:3000/api/stripe/webhook` (Stripe CLI) und das angezeigte `whsec_…` eintragen.
5. Einstellungen → Billing → Kundenportal aktivieren (Kündigung, Zahlungsmethode, Rechnungen).
6. Testkarte: `4242 4242 4242 4242`, beliebiges Datum in der Zukunft, beliebige Prüfziffer.

Der Zugang wird direkt nach der Rückkehr von Stripe freigeschaltet; der Webhook hält Verlängerungen und Kündigungen aktuell.

**Passwort vergessen:** Mit `SMTP_URL` werden echte E-Mails verschickt, ohne erscheint der Link im Terminal.

Während der Entwicklung: `npm run dev` (startet bei Änderungen an `app.js` neu).

## Projektstruktur

```
app.js               Server (Express): API für die Server-Werkzeuge unter /api/*
server/              Konten (auth.js), Stripe (billing.js), Editor-Export (editor.js), Datenbank (db.js)
convert_pdf2docx.py  PDF → Word (wird von app.js aufgerufen)
pdf_edit.py          PDF-Editor: Inhalte echt entfernen, neue Elemente zeichnen (PyMuPDF)
site/config.js       Domain, Analytics, AdSense, Impressum-Daten
site/tools.js        ALLE Texte der Werkzeuge (Titel, SEO, Anleitung, FAQ)
site/templates.js    HTML-Vorlagen
scripts/build.js     erzeugt die HTML-Seiten, sitemap.xml, robots.txt
public/              fertige Website (wird vom Server ausgeliefert)
  assets/style.css   Design
  assets/tool.js     Logik aller Werkzeuge
  assets/editor.js   PDF-Editor (Fabric.js + pdf.js)
  assets/account.js  Anmeldung, Konto, Tarifwahl
```

**Texte oder Werkzeuge ändern:** `site/tools.js` bearbeiten → `npm run build`. Die HTML-Dateien in `public/` nie direkt bearbeiten, sie werden beim Build überschrieben.

## Einstellungen (Umgebungsvariablen)

| Variable | Standard | Bedeutung |
|---|---|---|
| `PORT` | 3000 | Port |
| `MAX_FILE_MB` | 50 | max. Größe pro Datei |
| `RATE_LIMIT` | 60 | Anfragen pro IP in 10 Minuten |
| `TRUST_PROXY` | – | auf `1` setzen, wenn der Server hinter nginx/Cloudflare läuft |
| `GS_PATH`, `SOFFICE_PATH`, `PYTHON_PATH` | automatisch | Pfade, falls die Programme nicht gefunden werden |

## Nach dem Deployment (Google)

1. In der [Google Search Console](https://search.google.com/search-console) die Domain bestätigen.
2. Unter „Sitemaps“ `https://pdf-libre.de/sitemap.xml` einreichen.
3. Die neuen Seiten über „URL-Prüfung“ → „Indexierung beantragen“ anstoßen.

## Rechtliches – vor dem Livegang

- **AGB & Widerrufsbelehrung** (`agb.html`) sind ein Entwurf. Lass sie prüfen (z. B. IT-Recht Kanzlei oder eRecht24), bevor du Geld verlangst.
- **Umsatzsteuer:** Als Kleinunternehmer (§ 19 UStG) keine USt ausweisen; sonst in Stripe Tax oder den Preisen berücksichtigen. Frag im Zweifel eine Steuerberatung.
- **Cookie-Banner:** Google Analytics und AdSense brauchen in der EU eine Einwilligung (zertifizierte CMP, z. B. die kostenlose in AdSense unter „Datenschutz & Mitteilungen“).
- **Lizenzen:** Ghostscript und PyMuPDF stehen unter der AGPL. Für einen öffentlichen Webdienst heißt das: Der Quellcode deines Servers muss öffentlich zugänglich sein (dein GitHub-Repo erfüllt das), oder du kaufst eine kommerzielle Lizenz bei Artifex.

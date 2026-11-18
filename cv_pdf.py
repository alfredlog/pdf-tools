"""
Lebenslauf-Generator: Formulardaten (JSON) → ATS-freundliche PDF.

  python3 cv_pdf.py render daten.json ausgabe.pdf [--preview]
      Erzeugt die PDF. Mit --preview zusätzlich PNG-Vorschaubilder aller Seiten als JSON auf stdout.
  python3 cv_pdf.py extract eingabe.pdf
      Liest die Formulardaten aus einer mit PDF Libre erstellten Lebenslauf-PDF (zum erneuten Bearbeiten).

ATS-freundlich heißt: eine Spalte, echter auswählbarer Text, eingebettete Schriften mit Unicode-Zuordnung,
übliche Überschriften („Berufserfahrung“, „Ausbildung“ …), keine Textgrafiken, Kontaktdaten als Text.

Die Formulardaten werden als eingebettete Datei (pdf-libre-lebenslauf.json) in der PDF gespeichert.
So kann der Lebenslauf später wieder hochgeladen und weiterbearbeitet werden – ohne Konto.
"""
import base64
import html
import io
import json
import os
import re
import sys

import pymupdf

pymupdf.TOOLS.mupdf_display_errors(False)  # MuPDF-Warnungen nicht auf stdout (dort steht das JSON-Ergebnis)
pymupdf.TOOLS.mupdf_display_warnings(False)

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.join(HERE, "fonts", "cv")
DATA_NAME = "pdf-libre-lebenslauf.json"

FONTS = {
    "klassisch": ("Caladea-Regular.ttf", "Caladea-Bold.ttf", "Caladea-Italic.ttf", "Caladea-BoldItalic.ttf"),
    "modern": ("Inter-Regular.otf", "Inter-Bold.otf", "Inter-Italic.otf", "Inter-BoldItalic.otf"),
    "akademisch": ("lmroman10-regular.otf", "lmroman10-bold.otf", "lmroman10-italic.otf", "lmroman10-bolditalic.otf"),
    "kompakt": ("Carlito-Regular.ttf", "Carlito-Bold.ttf", "Carlito-Italic.ttf", "Carlito-BoldItalic.ttf"),
}

LABELS = {
    "de": {
        "summary": "Profil", "experience": "Berufserfahrung", "education": "Ausbildung", "projects": "Projekte",
        "skills": "Kenntnisse", "languages": "Sprachen", "extra": "Weitere Angaben", "present": "heute",
        "cv": "Lebenslauf",
    },
    "en": {
        "summary": "Profile", "experience": "Experience", "education": "Education", "projects": "Projects",
        "skills": "Skills", "languages": "Languages", "extra": "Additional Information", "present": "present",
        "cv": "Curriculum Vitae",
    },
}
SECTION_TYPES = ("summary", "experience", "education", "projects", "skills", "languages", "extra")


def e(s):
    return html.escape(str(s or "").strip())


def color(c, fallback):
    return c if isinstance(c, str) and re.fullmatch(r"#[0-9a-fA-F]{6}", c) else fallback


# ---------------------------------------------------------------------------
# HTML
# ---------------------------------------------------------------------------
def dates(it, L):
    a, b = e(it.get("from")), e(it.get("to"))
    if it.get("current"):
        b = L["present"]
    if a and b:
        return f"{a} – {b}"
    return a or b


def bullets(text):
    lines = [re.sub(r"^\s*[-•*–]\s*", "", l).strip() for l in str(text or "").splitlines()]
    lines = [l for l in lines if l]
    if not lines:
        return ""
    if len(lines) == 1 and not re.match(r"^\s*[-•*–]", str(text or "")):
        return f'<p class="desc">{e(lines[0])}</p>'
    return '<ul>' + "".join(f"<li>{e(l)}</li>" for l in lines) + "</ul>"


def entry_html(it, L, side_dates):
    title = e(it.get("title"))
    org = e(it.get("org"))
    place = e(it.get("place"))
    d = dates(it, L)
    where = " · ".join(x for x in (org, place) if x)
    body = f'<p class="etitle"><b>{title}</b></p>' if title else ""
    if side_dates:
        # Datum rechtsbündig in der Titelzeile (eine Tabellenzeile: Text bleibt für ATS in Lesereihenfolge)
        top = f'<table><tr><td><p class="etitle"><b>{title}</b></p></td><td class="d">{d}</td></tr></table>'
        top += f'<p class="org">{where}</p>' if where else ""
        return f'<div class="entry">{top}{bullets(it.get("text"))}</div>'
    meta = " · ".join(x for x in (where, d) if x)
    body += f'<p class="org">{meta}</p>' if meta else ""
    body += bullets(it.get("text"))
    return f'<div class="entry">{body}</div>'


def pairs_html(items, side):
    rows = [(e(i.get("label")), e(i.get("value"))) for i in items if (i.get("label") or i.get("value"))]
    if not rows:
        return ""
    if side:
        return "".join(f'<table class="entry"><tr><td class="d" width="24%">{a}</td><td class="c" width="76%"><p>{b}</p></td></tr></table>' for a, b in rows)
    return "".join(f'<p class="pair"><b>{a}:</b> {b}</p>' if a else f'<p class="pair">{b}</p>' for a, b in rows)


def build_html(d, breaks=()):
    tpl = d.get("template") if d.get("template") in FONTS else "modern"
    L = LABELS.get(d.get("lang"), LABELS["de"])
    side = tpl != "kompakt"
    p = d.get("person") or {}
    contact = [e(p.get(k)) for k in ("email", "phone", "location")]
    contact += [e(l) for l in str(p.get("links") or "").splitlines()]
    contact = [c for c in contact if c]
    photo = '<td class="photo" width="18%"><img src="photo.jpg" width="80"/></td>' if d.get("_photo") else ""
    out = [
        f'<table class="head"><tr><td class="who" width="{"82%" if d.get("_photo") else "100%"}"><h1>{e(p.get("name")) or "&nbsp;"}</h1>'
        + (f'<p class="headline">{e(p.get("headline"))}</p>' if p.get("headline") else "")
        + (f'<p class="contact">{" &nbsp;·&nbsp; ".join(contact)}</p>' if contact else "")
        + f"</td>{photo}</tr></table>"
    ]
    for sec in d.get("sections") or []:
        typ = sec.get("type")
        if typ not in SECTION_TYPES or sec.get("hidden"):
            continue
        title = e(sec.get("title")) or L[typ]
        if typ in ("summary", "extra"):
            text = str(sec.get("text") or "").strip()
            if not text:
                continue
            content = bullets(text) if re.search(r"^\s*[-•*–]", text, re.M) else "".join(f'<p class="desc">{e(t)}</p>' for t in text.split("\n\n") if t.strip())
        elif typ in ("skills", "languages"):
            content = pairs_html(sec.get("items") or [], False)
        else:
            items = [i for i in sec.get("items") or [] if any(str(i.get(k) or "").strip() for k in ("title", "org", "text"))]
            content = "".join(entry_html(i, L, side) for i in items)
        if content:
            n = len(d.setdefault("_headings", []))
            d["_headings"].append(html.unescape(title))
            pb = ' style="page-break-before: always"' if n in breaks else ""
            out.append(f"<h2{pb}>{title}</h2>{content}")
    return tpl, "\n".join(out)


def build_css(tpl, accent):
    reg, bold, it, boldit = FONTS[tpl]
    faces = "".join(
        f"@font-face {{font-family: cvf; src: url({f}); font-weight: {w}; font-style: {s};}}"
        for f, w, s in ((reg, "normal", "normal"), (bold, "bold", "normal"), (it, "normal", "italic"), (boldit, "bold", "italic"))
    )
    base = {
        "klassisch": dict(size=10.5, name=24, h2=12.5, gap=12, lead=1.32),
        "modern": dict(size=9.6, name=24, h2=11, gap=11, lead=1.38),
        "akademisch": dict(size=10.8, name=27, h2=14, gap=12, lead=1.3),
        "kompakt": dict(size=10, name=20, h2=11.5, gap=8, lead=1.25),
    }[tpl]
    head_color = {"klassisch": "#1a1a1a", "modern": accent, "akademisch": "#1a1a1a", "kompakt": "#1a1a1a"}[tpl]
    h2_color = {"klassisch": "#1a1a1a", "modern": accent, "akademisch": accent, "kompakt": accent}[tpl]
    h2_extra = {
        "klassisch": "border-bottom: 0.8px solid #444; padding-bottom: 2px; text-transform: uppercase; letter-spacing: 1px;",
        "modern": "text-transform: uppercase; letter-spacing: 1.2px; border-bottom: 1.2px solid " + accent + "; padding-bottom: 2px;",
        "akademisch": "font-weight: normal; border-bottom: 0.6px solid " + accent + "; padding-bottom: 1px;",
        "kompakt": "border-bottom: 0.6px solid #999; padding-bottom: 1px;",
    }[tpl]
    date_color = accent if tpl == "akademisch" else "#555"
    return f"""{faces}
* {{ font-family: cvf; }}
body {{ font-size: {base['size']}pt; color: #222; line-height: {base['lead']}; }}
p {{ margin: 0; }}
table {{ width: 100%; border-collapse: collapse; }}
td {{ vertical-align: top; padding: 0; }}
.head {{ margin-bottom: {base['gap'] + 2}px; }}
.photo {{ width: 100px; text-align: right; }}
h1 {{ font-size: {base['name']}pt; color: {head_color}; margin: 0 0 2px 0; font-weight: bold; {'font-weight: normal;' if tpl == 'akademisch' else ''} }}
.headline {{ font-size: {base['size'] + 2}pt; color: {'#444' if tpl != 'akademisch' else accent}; margin-bottom: 4px; {'font-style: italic;' if tpl == 'akademisch' else ''} }}
.contact {{ font-size: {base['size'] - 0.6}pt; color: #444; }}
h2 {{ font-size: {base['h2']}pt; color: {h2_color}; margin: {base['gap']}px 0 {max(4, base['gap'] - 5)}px 0; font-weight: bold; {h2_extra} }}
.entry {{ margin-bottom: {max(4, base['gap'] - 4)}px; }}
.d {{ color: {date_color}; text-align: right; white-space: nowrap; padding-left: 10px; {'font-style: italic;' if tpl == 'akademisch' else ''} }}

.org {{ color: #555; {'font-style: italic;' if tpl in ('klassisch', 'akademisch') else ''} }}
.desc {{ margin-top: 2px; }}
.pair {{ margin-bottom: 2px; }}
ul {{ margin: 2px 0 0 0; padding-left: 14px; }}
li {{ margin-bottom: 1px; }}
"""


# ---------------------------------------------------------------------------
# PDF
# ---------------------------------------------------------------------------
def render(d):
    archive = pymupdf.Archive(FONT_DIR)
    photo = d.get("photo")
    if isinstance(photo, str) and photo.startswith("data:image/"):
        try:
            raw = base64.b64decode(photo.split(",", 1)[1])
            from PIL import Image

            im = Image.open(io.BytesIO(raw)).convert("RGB")
            im.thumbnail((600, 600))
            buf = io.BytesIO()
            im.save(buf, "JPEG", quality=88)
            archive.add(buf.getvalue(), "photo.jpg")
            d["_photo"] = True
        except Exception:
            d["_photo"] = False
    breaks = set()
    for _ in range(4):  # Überschriften, die allein unten auf einer Seite stehen, auf die nächste Seite schieben
        d["_headings"] = []
        tpl, body = build_html(d, breaks)
        doc = layout(tpl, body, d, archive)
        lonely = orphan_headings(doc, d["_headings"])
        if not lonely - breaks:
            break
        breaks |= lonely
    name = str((d.get("person") or {}).get("name") or "").strip()
    L = LABELS.get(d.get("lang"), LABELS["de"])
    doc.set_metadata({"title": f"{L['cv']} {name}".strip(), "author": name, "creator": "PDF Libre – Lebenslauf erstellen", "producer": "PDF Libre"})
    if d.get("embed"):
        # nur auf Wunsch – und nur, was auch sichtbar im Lebenslauf steht (ausgeblendete Abschnitte bleiben draußen)
        data = {k: v for k, v in d.items() if not k.startswith("_")}
        data["sections"] = [sec for sec in data.get("sections") or [] if not sec.get("hidden")]
        doc.embfile_add(DATA_NAME, json.dumps(data, ensure_ascii=False).encode("utf-8"), filename=DATA_NAME, desc="Lebenslauf-Daten zum erneuten Bearbeiten auf pdf-libre.de")
    # Schriften auf die benutzten Zeichen verkleinern – aber nur, wenn der Text danach exakt gleich lesbar bleibt
    # (bei manchen OTF-Schriften geht sonst die Unicode-Zuordnung verloren und ein ATS liest falsche Zeichen)
    before = [pg.get_text() for pg in doc]
    raw = doc.tobytes(garbage=3, deflate=True)
    try:
        doc.subset_fonts()
        small = pymupdf.open("pdf", doc.tobytes(garbage=3, deflate=True))
        if [pg.get_text() for pg in small] == before:
            return small
    except Exception:
        pass
    return pymupdf.open("pdf", raw)


def layout(tpl, body, d, archive):
    css = build_css(tpl, color(d.get("accent"), {"modern": "#1f4fa3", "akademisch": "#2b4c7e"}.get(tpl, "#2b4c7e")))
    story = pymupdf.Story(html=f"<body>{body}</body>", user_css=css, archive=archive)
    out = io.BytesIO()
    writer = pymupdf.DocumentWriter(out)
    page = pymupdf.paper_rect("a4")
    m = {"kompakt": 42, "akademisch": 56}.get(tpl, 50)
    where = page + (m, m - 6, -m, -m)
    more, pages = 1, 0
    while more and pages < 6:
        dev = writer.begin_page(page)
        more, _ = story.place(where)
        story.draw(dev)
        writer.end_page()
        pages += 1
    writer.close()
    return pymupdf.open("pdf", out.getvalue())


def orphan_headings(doc, headings):
    """Nummern der Überschriften, die als letzter Block einer Seite stehen (ihr Inhalt beginnt erst auf der nächsten)."""
    found, start = set(), 0
    for pg in doc:
        if pg.number == doc.page_count - 1:
            break
        blocks = [b for b in pg.get_text("blocks") if b[4].strip()]
        if not blocks:
            continue
        last = max(blocks, key=lambda b: b[3])[4].strip()
        for i in range(start, len(headings)):
            if headings[i] == last:
                found.add(i)
                start = i + 1
                break
    return found


def cmd_render(src, dst, preview=False):
    with open(src, encoding="utf-8") as fh:
        d = json.load(fh)
    doc = render(d)
    doc.save(dst, garbage=3, deflate=True)
    if preview:
        imgs = []
        for pg in doc:
            pix = pg.get_pixmap(dpi=96)
            imgs.append("data:image/png;base64," + base64.b64encode(pix.tobytes("png")).decode())
        print(json.dumps({"pages": imgs}))
    return 0


def letter_html(d):
    """Anschreiben im Stil des Lebenslaufs (gleiche Schrift, Farbe und Kopfzeile)."""
    p = d.get("person") or {}
    contact = [e(p.get(k)) for k in ("email", "phone", "location")]
    contact = [c for c in contact if c]
    L = d.get("letter") or {}
    rec = "<br/>".join(e(l) for l in str(L.get("recipient") or "").splitlines() if l.strip())
    paras = "".join(f'<p class="lp">{e(x)}</p>' for x in (L.get("paragraphs") or []) if str(x).strip())
    return (
        f'<h1>{e(p.get("name")) or "&nbsp;"}</h1>'
        + (f'<p class="contact">{" &nbsp;·&nbsp; ".join(contact)}</p>' if contact else "")
        + f'<div class="rec">{rec or "&nbsp;"}</div>'
        + f'<p class="date">{e(L.get("date"))}</p>'
        + (f'<p class="subject"><b>{e(L.get("subject"))}</b></p>' if L.get("subject") else "")
        + f'<p class="lp">{e(L.get("salutation"))}</p>{paras}'
        + f'<p class="lp">{e(L.get("closing") or "Mit freundlichen Grüßen")}</p>'
        + f'<p class="sign">{e(p.get("name"))}</p>'
    )


def cmd_letter(src, dst, preview=False):
    with open(src, encoding="utf-8") as fh:
        d = json.load(fh)
    tpl = d.get("template") if d.get("template") in FONTS else "modern"
    accent = color(d.get("accent"), {"modern": "#1f4fa3", "akademisch": "#2b4c7e"}.get(tpl, "#2b4c7e"))
    css = build_css(tpl, accent) + """
.contact { border-bottom: 0.6px solid #bbb; padding-bottom: 6px; }
.rec { margin: 36px 0 26px 0; min-height: 60px; }
.date { text-align: right; margin-bottom: 18px; }
.subject { margin-bottom: 16px; }
.lp { margin-bottom: 10px; }
.sign { margin-top: 28px; }
"""
    story = pymupdf.Story(html=f"<body>{letter_html(d)}</body>", user_css=css, archive=pymupdf.Archive(FONT_DIR))
    out = io.BytesIO()
    writer = pymupdf.DocumentWriter(out)
    page = pymupdf.paper_rect("a4")
    where = page + (64, 50, -64, -56)
    more, n = 1, 0
    while more and n < 3:
        dev = writer.begin_page(page)
        more, _ = story.place(where)
        story.draw(dev)
        writer.end_page()
        n += 1
    writer.close()
    doc = pymupdf.open("pdf", out.getvalue())
    name = str((d.get("person") or {}).get("name") or "").strip()
    doc.set_metadata({"title": f"Anschreiben {name}".strip(), "author": name, "creator": "PDF Libre – Anschreiben", "producer": "PDF Libre"})
    doc.save(dst, garbage=3, deflate=True)
    if preview:
        print(json.dumps({"pages": ["data:image/png;base64," + base64.b64encode(pg.get_pixmap(dpi=96).tobytes("png")).decode() for pg in doc]}))
    return 0


def cmd_extract(src):
    doc = pymupdf.open(src)
    if DATA_NAME in doc.embfile_names():
        sys.stdout.write(doc.embfile_get(DATA_NAME).decode("utf-8"))
        return 0
    print("no-data", file=sys.stderr)
    return 6


if __name__ == "__main__":
    c = sys.argv[1]
    if c == "render":
        sys.exit(cmd_render(sys.argv[2], sys.argv[3], "--preview" in sys.argv))
    if c == "letter":
        sys.exit(cmd_letter(sys.argv[2], sys.argv[3], "--preview" in sys.argv))
    if c == "extract":
        sys.exit(cmd_extract(sys.argv[2]))
    sys.exit(2)

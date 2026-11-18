"""
Weitere PDF-Werkzeuge (vom Server mit `run(PYTHON, …)` aufgerufen).

  python3 pdf_more.py ocr      eingabe.pdf ausgabe.pdf deu+eng
      Gescannte Seiten bekommen eine unsichtbare Textebene (Tesseract) → Text durchsuchbar und kopierbar.
      Seiten, die schon Text haben, bleiben unverändert. Das Bild selbst wird nicht verändert.

  python3 pdf_more.py redact   eingabe.pdf ausgabe.pdf optionen.json
      optionen.json: {"terms": ["Max Mustermann", …], "presets": ["email", "phone", "iban"]}
      Fundstellen werden endgültig entfernt (nicht nur überdeckt) und schwarz gefüllt.

  python3 pdf_more.py images   ausgabe.pdf bild1.heic bild2.jpg …
      Fotos (auch HEIC/HEIF vom iPhone) als A4-Seiten in eine PDF.

Fehler werden als Schlüsselwort auf stderr gemeldet (z. B. "nothing-found"), der Server übersetzt sie in Klartext.
"""
import json
import re
import sys

import pymupdf

# ---------------------------------------------------------------------------
# OCR
# ---------------------------------------------------------------------------
def has_text(page):
    return len(page.get_text().strip()) > 25


def cmd_ocr(src, dst, lang):
    if not re.fullmatch(r"[a-z_]{3,8}(\+[a-z_]{3,8}){0,3}", lang or ""):
        lang = "deu+eng"
    doc = pymupdf.open(src)
    if doc.needs_pass:
        print("password", file=sys.stderr)
        return 3
    done = 0
    for page in doc:
        if has_text(page):
            continue
        try:
            tp = page.get_textpage_ocr(dpi=300, full=True, language=lang)
        except Exception as e:  # Tesseract fehlt oder Sprache nicht installiert
            print(f"ocr-missing:{e}", file=sys.stderr)
            return 5
        words = page.get_text("words", textpage=tp)
        for x0, y0, x1, y1, word, *_ in words:
            w, h = x1 - x0, y1 - y0
            if w <= 0 or h <= 0 or not word.strip():
                continue
            fs = h * 0.9
            natural = pymupdf.get_text_length(word, fontname="helv", fontsize=fs) or 1
            point = pymupdf.Point(x0, y1 - h * 0.18)
            # unsichtbarer Text (render_mode=3), auf die Wortbreite gestreckt → Markieren trifft das Wort im Bild
            page.insert_text(point, word + " ", fontsize=fs, fontname="helv", render_mode=3, morph=(point, pymupdf.Matrix(w / natural, 1)))
        done += 1
    if done == 0:
        print("already-text", file=sys.stderr)
        return 6
    doc.save(dst, garbage=3, deflate=True)
    print(json.dumps({"pages": done, "total": doc.page_count}))
    return 0


# ---------------------------------------------------------------------------
# Schwärzen
# ---------------------------------------------------------------------------
PRESETS = {
    "email": r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+",
    "iban": r"\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]{4}){3,7}(?: ?[A-Z0-9]{1,3})?\b",
    "phone": r"(?<![\w/])(?:\+\d{1,3}[ \-/]?|0)(?:\(?\d{2,5}\)?[ \-/]?){1,3}\d{3,}(?![\w/])",
}


def cmd_redact(src, dst, opts_path):
    with open(opts_path, encoding="utf-8") as fh:
        opts = json.load(fh)
    terms = [t.strip() for t in opts.get("terms", []) if t and t.strip()][:50]
    patterns = [re.compile(PRESETS[p]) for p in opts.get("presets", []) if p in PRESETS]
    doc = pymupdf.open(src)
    if doc.needs_pass:
        print("password", file=sys.stderr)
        return 3
    found = 0
    for page in doc:
        hits = set(terms)
        if patterns:
            text = page.get_text()
            for pat in patterns:
                for m in pat.finditer(text):
                    for line in m.group(0).splitlines():  # Treffer über Zeilenumbrüche hinweg zeilenweise suchen
                        if len(line.strip()) >= 4:
                            hits.add(line.strip())
        rects = []
        for h in hits:
            rects += page.search_for(h)
        for r in rects:
            page.add_redact_annot(r, fill=(0, 0, 0))
        if rects:
            # Text darunter wird gelöscht, Bildteile werden geschwärzt, Linien bleiben
            page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_PIXELS, graphics=pymupdf.PDF_REDACT_LINE_ART_NONE)
            found += len(rects)
    if found == 0:
        print("nothing-found", file=sys.stderr)
        return 6
    doc.set_metadata({})  # Autor, Titel usw. können ebenfalls Namen enthalten
    doc.del_xml_metadata()
    doc.save(dst, garbage=4, deflate=True, clean=True)
    print(json.dumps({"redactions": found}))
    return 0


# ---------------------------------------------------------------------------
# Fotos (HEIC/JPG/PNG) → PDF
# ---------------------------------------------------------------------------
def cmd_images(dst, *images):
    import io

    from PIL import Image, ImageOps

    try:
        import pillow_heif

        pillow_heif.register_heif_opener()
    except ImportError:
        if any(re.search(r"\.hei[cf]$", p, re.I) for p in images):
            print("missing-module:pillow_heif", file=sys.stderr)
            return 5
    A4 = (595.28, 841.89)
    margin = 24
    out = pymupdf.open()
    for path in images:
        im = ImageOps.exif_transpose(Image.open(path))  # Handyfotos richtig herum drehen
        im = im.convert("RGB")
        im.thumbnail((2480, 2480))  # höchstens ~300 dpi auf A4
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=85, optimize=True)
        pw, ph = A4 if im.height >= im.width else (A4[1], A4[0])
        page = out.new_page(width=pw, height=ph)
        scale = min((pw - 2 * margin) / im.width, (ph - 2 * margin) / im.height)
        w, h = im.width * scale, im.height * scale
        rect = pymupdf.Rect((pw - w) / 2, (ph - h) / 2, (pw + w) / 2, (ph + h) / 2)
        page.insert_image(rect, stream=buf.getvalue())
    out.save(dst, garbage=3, deflate=True)
    return 0


def main():
    cmd, args = sys.argv[1], sys.argv[2:]
    if cmd == "ocr":
        return cmd_ocr(*args[:3])
    if cmd == "redact":
        return cmd_redact(*args[:3])
    if cmd == "images":
        return cmd_images(args[0], *args[1:])
    print("unbekannter Befehl", file=sys.stderr)
    return 2


if __name__ == "__main__":
    sys.exit(main())

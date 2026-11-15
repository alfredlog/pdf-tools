"""
PDF-Editor: wendet die Änderungen aus dem Browser-Editor auf eine PDF an.

Aufruf: python3 pdf_edit.py spec.json eingabe.pdf|- ausgabe.pdf bilder_ordner

spec.json:
{
  "pages": [
    {
      "src": 0 | null,          # Seite aus der Original-PDF (0-basiert) oder null für eine leere Seite
      "width": 595, "height": 842,
      "redactions": [{"x":..,"y":..,"w":..,"h":..}],   # Bereiche, deren Inhalt wirklich gelöscht wird
      "items": [ ... ]          # neue Elemente, siehe draw_item()
    }
  ]
}
Alle Koordinaten sind PDF-Punkte, Ursprung oben links, so wie die Seite angezeigt wird.
"""
import json
import os
import re
import shutil
import subprocess
import sys

import pymupdf

FONTS = {
    ("helv", False, False): "helv", ("helv", True, False): "hebo", ("helv", False, True): "heit", ("helv", True, True): "hebi",
    ("tiro", False, False): "tiro", ("tiro", True, False): "tibo", ("tiro", False, True): "tiit", ("tiro", True, True): "tibi",
    ("cour", False, False): "cour", ("cour", True, False): "cobo", ("cour", False, True): "coit", ("cour", True, True): "cobi",
}

MAX_PAGES = 500
GENERIC_FC = {"helv": "sans-serif", "tiro": "serif", "cour": "monospace"}
_font_cache = {}


def strip_subset(name):
    return re.sub(r"^[A-Z]{6}\+", "", str(name or ""))


def covers(font, text):
    """True, wenn die Schrift für jedes Zeichen eine Glyphe hat."""
    try:
        return all(c.isspace() or font.has_glyph(ord(c)) for c in text)
    except Exception:
        return False


def original_style(doc, page, orig):
    """Liest Schrift, Farbe und Stil der Originalzeile – vor dem Schwärzen, solange der Text noch da ist."""
    rect = pymupdf.Rect(num(orig.get("x")), num(orig.get("top")), num(orig.get("x")) + num(orig.get("w")), num(orig.get("top")) + num(orig.get("h")))
    best = None
    try:
        for block in page.get_text("dict", clip=rect)["blocks"]:
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    if span.get("text", "").strip() and (best is None or len(span["text"]) > len(best["text"])):
                        best = span
    except Exception:
        best = None
    if not best:
        return None
    c = int(best.get("color", 0))
    style = {"font": best.get("font", ""), "color": ((c >> 16 & 255) / 255, (c >> 8 & 255) / 255, (c & 255) / 255), "buffer": None}
    wanted = strip_subset(style["font"])
    try:
        for xref, ext, _type, basefont, *_ in page.get_fonts(full=True):
            if strip_subset(basefont) == wanted and ext not in ("n/a", ""):
                buf = doc.extract_font(xref)[3]
                if buf:
                    style["buffer"] = buf
                break
    except Exception:
        pass
    return style


def system_font(family, generic, bold, italic):
    """Ähnlichste installierte Schrift über fontconfig (z. B. Calibri → Carlito, Arial → Liberation Sans)."""
    key = (family, generic, bold, italic)
    if key in _font_cache:
        return _font_cache[key]
    font = None
    if shutil.which("fc-match"):
        fams = ",".join(x for x in (re.sub(r"[:,\\]", " ", family or "").strip(), GENERIC_FC.get(generic, "sans-serif")) if x)
        pattern = fams + (":weight=bold" if bold else "") + (":slant=italic" if italic else "")
        try:
            path = subprocess.run(["fc-match", "-f", "%{file}", pattern], capture_output=True, text=True, timeout=5).stdout.strip()
            if path and os.path.isfile(path):
                font = pymupdf.Font(fontfile=path)
        except Exception:
            font = None
    _font_cache[key] = font
    return font


def text_hscale(item, font):
    """Horizontale Skalierung: bei geänderten PDF-Zeilen so, dass der Originaltext genau seine alte Breite hätte."""
    orig = item.get("orig") or {}
    scale = num(item.get("hscale"), 1.0)
    if item.get("font") == "orig" and orig.get("text") and num(orig.get("w")) > 0:
        try:
            natural = font.text_length(str(orig["text"]), fontsize=num(orig.get("size"), num(item.get("size"), 12)))
            if natural > 0:
                scale = num(orig["w"]) / natural
        except Exception:
            pass
    return scale if 0.5 < scale < 1.6 else 1.0


def text_font(item, text):
    """Schrift für einen Text: Original aus der PDF, sonst ähnliche Systemschrift, sonst Standardschrift."""
    orig = item.get("orig") or {}
    style = item.get("_orig_style") or {}
    bold, italic = bool(item.get("bold")), bool(item.get("italic"))
    if item.get("font") == "orig" and orig:
        same_style = bold == bool(orig.get("bold")) and italic == bool(orig.get("italic"))
        if same_style and style.get("buffer"):
            try:
                f = pymupdf.Font(fontbuffer=style["buffer"])
                if covers(f, text):
                    return f
            except Exception:
                pass
        f = system_font(orig.get("family", ""), orig.get("generic", "helv"), bold, italic)
        if f and covers(f, text):
            return f
        generic = orig.get("generic", "helv")
    else:
        generic = item.get("font", "helv")
    return pymupdf.Font(FONTS.get((generic, bold, italic), "helv"))


def rgb(value, default=None):
    if not value:
        return default
    return tuple(max(0.0, min(1.0, float(c))) for c in value[:3])


def num(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def draw_item(page, item, image_dir):
    kind = item.get("type")
    opacity = max(0.0, min(1.0, num(item.get("opacity"), 1.0)))

    if kind == "text":
        size = max(1.0, min(400.0, num(item.get("size"), 12)))
        color = rgb(item.get("color"), (0, 0, 0))
        style = item.get("_orig_style")
        if style and (item.get("orig") or {}).get("keepColor"):
            color = style["color"]
        lines = [(line, str(line.get("text", ""))[:2000]) for line in item.get("lines", [])[:500]]
        all_text = "".join(t for _, t in lines)
        font = text_font(item, all_text)
        hscale = text_hscale(item, font)
        for line, text in lines:
            if not text.strip():
                continue
            point = pymupdf.Point(num(line.get("x")), num(line.get("y")))
            writer = pymupdf.TextWriter(page.rect, opacity=opacity, color=color)
            writer.append(point, text, font=font, fontsize=size)
            writer.write_text(page, morph=(point, pymupdf.Matrix(hscale, 1)) if abs(hscale - 1) > 0.02 else None)
        return

    if kind in ("rect", "ellipse"):
        rect = pymupdf.Rect(num(item["x"]), num(item["y"]), num(item["x"]) + num(item["w"]), num(item["y"]) + num(item["h"]))
        stroke = rgb(item.get("stroke"))
        fill = rgb(item.get("fill"))
        width = num(item.get("strokeWidth"), 1) if stroke else 0
        draw = page.draw_rect if kind == "rect" else page.draw_oval
        draw(rect, color=stroke, fill=fill, width=width, fill_opacity=opacity, stroke_opacity=opacity, overlay=True)
        return

    if kind == "line":
        page.draw_line(
            pymupdf.Point(num(item["x1"]), num(item["y1"])),
            pymupdf.Point(num(item["x2"]), num(item["y2"])),
            color=rgb(item.get("stroke"), (0, 0, 0)),
            width=num(item.get("strokeWidth"), 2),
            stroke_opacity=opacity,
            lineCap=1,
        )
        return

    if kind == "path":
        points = [pymupdf.Point(num(p[0]), num(p[1])) for p in item.get("points", [])[:20000]]
        if len(points) >= 2:
            page.draw_polyline(
                points,
                color=rgb(item.get("stroke"), (0, 0, 0)),
                width=num(item.get("strokeWidth"), 2),
                stroke_opacity=opacity,
                lineCap=1,
                lineJoin=1,
                closePath=False,
            )
        return

    if kind == "image":
        name = os.path.basename(str(item.get("file", "")))
        path = os.path.join(image_dir, name)
        if not name or not os.path.isfile(path):
            return
        rect = pymupdf.Rect(num(item["x"]), num(item["y"]), num(item["x"]) + num(item["w"]), num(item["y"]) + num(item["h"]))
        with open(path, "rb") as fh:
            page.insert_image(rect, stream=fh.read(), keep_proportion=False, overlay=True)
        return


def main():
    spec_path, in_path, out_path, image_dir = sys.argv[1:5]
    with open(spec_path, encoding="utf-8") as fh:
        spec = json.load(fh)
    pages = spec.get("pages", [])[:MAX_PAGES]
    if not pages:
        print("Keine Seiten", file=sys.stderr)
        return 2

    src = pymupdf.open(in_path) if in_path != "-" else None
    if src is not None and src.needs_pass:
        print("password", file=sys.stderr)
        return 3

    # 1) Drehung der Originalseiten „einbrennen“, damit angezeigte und echte Koordinaten übereinstimmen
    if src is not None:
        for page in src:
            if page.rotation:
                page.remove_rotation()

        # 2a) Schrift und Farbe geänderter Zeilen lesen, solange der Originaltext noch da ist
        for p in pages:
            index = p.get("src")
            if index is None or not (0 <= int(index) < src.page_count):
                continue
            for item in p.get("items", [])[:5000]:
                if item.get("type") == "text" and isinstance(item.get("orig"), dict):
                    item["_orig_style"] = original_style(src, src[int(index)], item["orig"])

        # 2b) Inhalte in den markierten Bereichen wirklich löschen
        redact_by_src = {}
        for p in pages:
            if p.get("src") is not None:
                redact_by_src.setdefault(int(p["src"]), []).extend(p.get("redactions", []))
        for index, rects in redact_by_src.items():
            if not rects or index < 0 or index >= src.page_count:
                continue
            page = src[index]
            for r in rects:
                rect = pymupdf.Rect(num(r["x"]), num(r["y"]), num(r["x"]) + num(r["w"]), num(r["y"]) + num(r["h"]))
                page.add_redact_annot(rect, fill=(1, 1, 1))
            page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_PIXELS)

    # 3) Neue PDF in der gewünschten Seitenreihenfolge aufbauen
    out = pymupdf.open()
    for p in pages:
        index = p.get("src")
        if src is not None and index is not None and 0 <= int(index) < src.page_count:
            out.insert_pdf(src, from_page=int(index), to_page=int(index))
            page = out[-1]
        else:
            width = max(72.0, min(5000.0, num(p.get("width"), 595.28)))
            height = max(72.0, min(5000.0, num(p.get("height"), 841.89)))
            page = out.new_page(width=width, height=height)
        # PyMuPDF rechnet bereits im sichtbaren Bereich (CropBox) – keine Umrechnung nötig
        for item in p.get("items", [])[:5000]:
            draw_item(page, item, image_dir)

    out.save(out_path, garbage=3, deflate=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())

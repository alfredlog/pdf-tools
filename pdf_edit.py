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
import sys

import pymupdf

FONTS = {
    ("helv", False, False): "helv", ("helv", True, False): "hebo", ("helv", False, True): "heit", ("helv", True, True): "hebi",
    ("tiro", False, False): "tiro", ("tiro", True, False): "tibo", ("tiro", False, True): "tiit", ("tiro", True, True): "tibi",
    ("cour", False, False): "cour", ("cour", True, False): "cobo", ("cour", False, True): "coit", ("cour", True, True): "cobi",
}

MAX_PAGES = 500


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
        font = FONTS.get((item.get("font", "helv"), bool(item.get("bold")), bool(item.get("italic"))), "helv")
        size = max(1.0, min(400.0, num(item.get("size"), 12)))
        color = rgb(item.get("color"), (0, 0, 0))
        for line in item.get("lines", [])[:500]:
            text = str(line.get("text", ""))[:2000]
            if text.strip():
                page.insert_text(
                    pymupdf.Point(num(line.get("x")), num(line.get("y"))),
                    text,
                    fontsize=size,
                    fontname=font,
                    color=color,
                    fill_opacity=opacity,
                    stroke_opacity=opacity,
                )
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

        # 2) Inhalte in den markierten Bereichen wirklich löschen
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

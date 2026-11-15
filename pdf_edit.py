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
import io
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
                usable = usable_font(doc, xref, basefont)
                if usable:
                    style["buffer"] = usable[0]
                break
    except Exception:
        pass
    return style


_path_cache = {}


def system_font_path(family, generic, bold, italic):
    """Ähnlichste installierte Schrift über fontconfig (z. B. Calibri → Carlito, Arial → Liberation Sans)."""
    key = (family, generic, bool(bold), bool(italic))
    if key in _path_cache:
        return _path_cache[key]
    path = None
    if shutil.which("fc-match"):
        fams = ",".join(x for x in (re.sub(r"[:,\\]", " ", family or "").strip(), GENERIC_FC.get(generic, "sans-serif")) if x)
        pattern = fams + (":weight=bold" if bold else "") + (":slant=italic" if italic else "")
        try:
            found = subprocess.run(["fc-match", "-f", "%{file}", pattern], capture_output=True, text=True, timeout=5).stdout.strip()
            if found and os.path.isfile(found) and found.lower().endswith((".ttf", ".otf")):
                path = found
        except Exception:
            path = None
    _path_cache[key] = path
    return path


def system_font(family, generic, bold, italic):
    key = (family, generic, bool(bold), bool(italic))
    if key not in _font_cache:
        path = system_font_path(family, generic, bold, italic)
        try:
            _font_cache[key] = pymupdf.Font(fontfile=path) if path else None
        except Exception:
            _font_cache[key] = None
    return _font_cache[key]


def browser_usable(buf):
    """Eingebettete Schrift, die auch der Browser mit Unicode-Zeichen benutzen kann (TrueType/OpenType mit Unicode-cmap).
    Nur solche Schriften werden verwendet – so sehen Vorschau im Editor und fertige PDF gleich aus."""
    try:
        if not buf or buf[:4] not in (b"\x00\x01\x00\x00", b"true", b"OTTO"):
            return False
        num_tables = int.from_bytes(buf[4:6], "big")
        for i in range(num_tables):
            rec = buf[12 + 16 * i: 28 + 16 * i]
            if rec[:4] == b"cmap":
                off = int.from_bytes(rec[8:12], "big")
                count = int.from_bytes(buf[off + 2: off + 4], "big")
                for j in range(count):
                    e = buf[off + 4 + 8 * j: off + 12 + 8 * j]
                    platform, encoding = int.from_bytes(e[:2], "big"), int.from_bytes(e[2:4], "big")
                    if platform == 0 or (platform == 3 and encoding in (1, 10)):
                        return True
        return False
    except Exception:
        return False


_usable_cache = {}


def usable_font(doc, xref, name):
    """Eingebettete TrueType-Schrift so aufbereiten, dass Browser und PyMuPDF sie mit Unicode-Zeichen nutzen können.

    PDF-Teilschriften haben oft keine Zeichentabelle (cmap). Sie wird aus dem Text der PDF rekonstruiert
    (welches Zeichen welche Glyphe benutzt). Rückgabe: (Schriftdatei, Liste der verfügbaren Zeichen) oder None.
    Editor-Vorschau und Export verwenden genau diese Datei – deshalb sehen beide gleich aus."""
    key = (id(doc), xref)
    if key in _usable_cache:
        return _usable_cache[key]
    result = None
    try:
        from fontTools.ttLib import TTFont, newTable
        from fontTools.ttLib.tables._c_m_a_p import CmapSubtable

        buf = doc.extract_font(xref)[3]
        if buf and buf[:4] in (b"\x00\x01\x00\x00", b"true") and len(buf) <= 8 * 1024 * 1024:
            tt = TTFont(io.BytesIO(buf))
            needed = ("head", "hhea", "hmtx", "maxp", "glyf", "loca")
            if all(t in tt for t in needed):
                order = tt.getGlyphOrder()
                cmap = {}
                if browser_usable(buf) and "cmap" in tt:
                    best = tt["cmap"].getBestCmap() or {}
                    cmap = dict(best)
                if not cmap:
                    want = strip_subset(name)
                    for page in doc.pages(0, min(doc.page_count, MAX_PAGES)):
                        for span in page.get_texttrace():
                            if strip_subset(span.get("font", "")) != want:
                                continue
                            for ch in span["chars"]:
                                u, gid = ch[0], ch[1]
                                if u and u != 0xFFFD and 0 < gid < len(order) and u not in cmap:
                                    cmap[u] = order[gid]
                if cmap:
                    big = any(u > 0xFFFF for u in cmap)
                    sub = CmapSubtable.newSubtable(12 if big else 4)
                    sub.platformID, sub.platEncID, sub.language = 3, (10 if big else 1), 0
                    sub.cmap = cmap
                    table = newTable("cmap")
                    table.tableVersion = 0
                    table.tables = [sub]
                    tt["cmap"] = table
                    family = family_of(name) or "PDF Font"
                    if "name" not in tt or not tt["name"].names:
                        tt["name"] = newTable("name")
                        tt["name"].names = []
                    for nid, val in ((1, family), (2, "Regular"), (3, family), (4, family), (6, re.sub(r"[^A-Za-z0-9-]", "", family) or "PDFFont")):
                        tt["name"].setName(val, nid, 3, 1, 0x409)
                    if "post" not in tt:
                        post = newTable("post")
                        post.formatType, post.italicAngle, post.underlinePosition, post.underlineThickness = 3.0, 0, -100, 50
                        post.isFixedPitch = post.minMemType42 = post.maxMemType42 = post.minMemType1 = post.maxMemType1 = 0
                        tt["post"] = post
                    else:
                        tt["post"].formatType = 3.0
                    if "OS/2" not in tt:
                        from fontTools.ttLib.tables.O_S_2f_2 import Panose

                        hhea = tt["hhea"]
                        os2 = newTable("OS/2")
                        os2.version = 4
                        for attr, val in dict(xAvgCharWidth=0, usWeightClass=400, usWidthClass=5, fsType=0, ySubscriptXSize=0, ySubscriptYSize=0, ySubscriptXOffset=0, ySubscriptYOffset=0, ySuperscriptXSize=0, ySuperscriptYSize=0, ySuperscriptXOffset=0, ySuperscriptYOffset=0, yStrikeoutSize=0, yStrikeoutPosition=0, sFamilyClass=0, ulUnicodeRange1=1, ulUnicodeRange2=0, ulUnicodeRange3=0, ulUnicodeRange4=0, achVendID="PLIB", fsSelection=64, usFirstCharIndex=min(cmap), usLastCharIndex=min(0xFFFF, max(cmap)), sTypoAscender=hhea.ascent, sTypoDescender=hhea.descent, sTypoLineGap=hhea.lineGap, usWinAscent=max(0, hhea.ascent), usWinDescent=max(0, -hhea.descent), ulCodePageRange1=1, ulCodePageRange2=0, sxHeight=0, sCapHeight=0, usDefaultChar=0, usBreakChar=32, usMaxContext=0).items():
                            setattr(os2, attr, val)
                        os2.panose = Panose()
                        tt["OS/2"] = os2
                    out = io.BytesIO()
                    tt.save(out)
                    result = (out.getvalue(), sorted(cmap))
    except Exception:
        result = None
    _usable_cache[key] = result
    return result


def family_of(name):
    """"ABCDEF+TimesNewRomanPS-BoldMT" → "Times New Roman" (wie familyOf() im Editor)"""
    base = re.split(r"[-,]", strip_subset(name))[0]
    base = re.sub(r"(PSMT|PS|MT)$", "", base).strip()
    base = re.sub(r"([a-z])([A-Z])", r"\1 \2", base)
    return re.sub(r"\s+(Bold|Italic|Oblique|Regular|Book|Normal|Light|Medium|Semibold|Black)$", "", base, flags=re.I).strip()


def style_of(name):
    """Allgemeine Art (helv/tiro/cour), fett und kursiv aus dem Schriftnamen"""
    n = strip_subset(name)
    generic = "cour" if re.search(r"mono|courier|consol", n, re.I) else "tiro" if re.search(r"times|roman|georgia|garamond|cambria|minion|serif", re.sub(r"sans", "", n, flags=re.I), re.I) else "helv"
    bold = bool(re.search(r"bold|black|heavy|semibold|demi", n, re.I))
    italic = bool(re.search(r"italic|oblique", n, re.I))
    return generic, bold, italic


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
        # Geänderte Zeilen: nur den Text entfernen (Bilder, Linien und Nachbarzeilen bleiben unberührt)
        text_by_src = {}
        redact_by_src = {}
        for p in pages:
            if p.get("src") is not None:
                text_by_src.setdefault(int(p["src"]), []).extend(p.get("textRedactions", []))
                redact_by_src.setdefault(int(p["src"]), []).extend(p.get("redactions", []))
        for index, rects in text_by_src.items():
            if not rects or index < 0 or index >= src.page_count:
                continue
            page = src[index]
            for r in rects:
                rect = pymupdf.Rect(num(r["x"]), num(r["y"]), num(r["x"]) + num(r["w"]), num(r["y"]) + num(r["h"]))
                page.add_redact_annot(rect, fill=False, cross_out=False)
            page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE, graphics=pymupdf.PDF_REDACT_LINE_ART_NONE)
        # Werkzeug „Entfernen“: alles im Bereich endgültig löschen
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

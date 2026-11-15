"""
PDF → PowerPoint mit bearbeitbarem Text und wählbarem Design.

  python3 pdf_slides.py analyze eingabe.pdf ordner
      → ordner/slides.json und ordner/page-001.png …
        Jede Seite wird zerlegt in
          • ein Bild mit transparentem Hintergrund OHNE den normalen Text (Formen, Bilder, Formeln, Logos)
          • Textabschnitte mit Position, Größe, Farbe, fett/kursiv
        Formeln (LaTeX-Schriften wie CMSY10, MSBM10) bleiben im Bild – sie lassen sich in PowerPoint nicht
        als Text darstellen.

  python3 pdf_slides.py build ordner optionen.json ausgabe.pptx
      optionen.json: {"pages": [0, 1, …], "format": "4:3" | "16:9" | "orig", "bg": "#ffffff",
                      "accent": "#2b4bdb" | null, "font": "orig" | "Calibri" | …, "hideRepeat": false}

Die Farbregeln (adapt_color) gibt es genauso in public/assets/slides.js – Vorschau und Datei sehen gleich aus.
"""
import colorsys
import json
import os
import re
import sys

import pymupdf

MAX_PAGES = 80
TARGET_PX = 1600  # Breite der Hintergrundbilder
MATH_FONT = re.compile(r"^(CM|MSAM|MSBM|LMMath|Latin Modern Math|STIX|Cambria Math|Asana|XITS|rsfs|eufm|wasy|stmary|esint)", re.I)


# ---------------------------------------------------------------------------
# Farben
# ---------------------------------------------------------------------------
def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def rgb_to_hex(rgb):
    return "#" + "".join(f"{max(0, min(255, round(c * 255))):02x}" for c in rgb)


def luminance(rgb):
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]


def color_dist(a, b):
    return sum((x - y) ** 2 for x, y in zip(a, b)) ** 0.5


def adapt_color(color, original_accent, opts):
    """Textfarbe für das gewählte Design: Akzentfarbe tauschen, auf dunklem Hintergrund aufhellen."""
    rgb = hex_to_rgb(color)
    accent = opts.get("accent")
    if accent and original_accent and color_dist(rgb, hex_to_rgb(original_accent)) < 0.12:
        rgb = hex_to_rgb(accent)
    if luminance(hex_to_rgb(opts.get("bg") or "#ffffff")) < 0.45:
        h, l, s = colorsys.rgb_to_hls(*rgb)
        if s < 0.2:
            l = min(0.94, max(0.12, 1 - l))  # Schwarz → fast Weiß, Grau bleibt Grau
        elif l < 0.55:
            l = 0.68  # dunkle Farben (z. B. Dunkelblau) aufhellen, damit sie lesbar bleiben
        rgb = colorsys.hls_to_rgb(h, l, s)
    return rgb_to_hex(rgb)


# ---------------------------------------------------------------------------
# Analyse
# ---------------------------------------------------------------------------
def segments_of_line(line):
    """Teilt eine Zeile in Textabschnitte; Formel-Schriften trennen die Abschnitte und bleiben im Bild."""
    segs, cur = [], None
    for s in line["spans"]:
        text = "".join(c["c"] for c in s["chars"])
        is_math = bool(MATH_FONT.match(re.sub(r"^[A-Z]{6}\+", "", s["font"])))
        if is_math or not text.strip():
            if is_math and cur:
                segs.append(cur)
                cur = None
            if not is_math and cur and text:  # Leerzeichen zwischen normalen Spans
                cur["runs"].append(span_run(s, text))
                cur["chars"].extend(s["chars"])
            continue
        if cur is None:
            cur = {"runs": [], "chars": []}
        cur["runs"].append(span_run(s, text))
        cur["chars"].extend(s["chars"])
    if cur:
        segs.append(cur)
    out = []
    for seg in segs:
        chars = [c for c in seg["chars"] if c["c"].strip()]
        if not chars:
            continue
        # führende/folgende Leerzeichen entfernen
        runs = seg["runs"]
        runs[0]["t"] = runs[0]["t"].lstrip()
        runs[-1]["t"] = runs[-1]["t"].rstrip()
        runs = [r for r in runs if r["t"]]
        x0 = min(c["bbox"][0] for c in chars)
        x1 = max(c["bbox"][2] for c in chars)
        out.append({"x0": x0, "x1": x1, "chars": seg["chars"], "runs": merge_runs(runs)})
    return out


def span_run(s, text):
    name = re.sub(r"^[A-Z]{6}\+", "", s["font"])
    return {
        "t": text,
        "size": round(s["size"], 2),
        "color": "#%06x" % s["color"],
        "bold": bool(s["flags"] & 16) or bool(re.search(r"bold|black|heavy|semibold", name, re.I)),
        "italic": bool(s["flags"] & 2) or bool(re.search(r"italic|oblique", name, re.I)),
        "font": name,
    }


def merge_runs(runs):
    out = []
    for r in runs:
        if out and all(out[-1][k] == r[k] for k in ("size", "color", "bold", "italic", "font")):
            out[-1]["t"] += r["t"]
        else:
            out.append(dict(r))
    return out


def family_of(font):
    base = re.split(r"[-,]", font)[0]
    base = re.sub(r"(PSMT|PS|MT)$", "", base)
    base = re.sub(r"([a-z])([A-Z])", r"\1 \2", base)
    base = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1 \2", base)
    return re.sub(r"\s+(Bold|Italic|Regular|Caption|Narrow|Book|Light|Medium)$", "", base).strip() or "Arial"


def cmd_analyze(in_path, out_dir):
    doc = pymupdf.open(in_path)
    if doc.needs_pass:
        print("password", file=sys.stderr)
        return 3
    if doc.page_count > MAX_PAGES:
        print(f"zu viele Seiten:{MAX_PAGES}", file=sys.stderr)
        return 4
    os.makedirs(out_dir, exist_ok=True)
    pages, color_count, font_count = [], {}, {}
    for pno, page in enumerate(doc):
        page.remove_rotation()
        w, h = page.rect.width, page.rect.height
        # kleines Vorschaubild der Originalseite (vor dem Entfernen des Textes)
        page.get_pixmap(matrix=pymupdf.Matrix(240 / w, 240 / w)).save(os.path.join(out_dir, f"thumb-{pno + 1:03d}.png"))
        texts = []
        redact = []
        raw = page.get_text("rawdict", flags=pymupdf.TEXTFLAGS_TEXT)
        for b in raw["blocks"]:
            for line in b.get("lines", []):
                if abs(line.get("dir", (1, 0))[1]) > 0.01:
                    continue  # gedrehter Text bleibt im Bild
                for seg in segments_of_line(line):
                    ys = [c["bbox"][1] for c in seg["chars"] if c["c"].strip()] + [c["bbox"][3] for c in seg["chars"] if c["c"].strip()]
                    size = max(r["size"] for r in seg["runs"])
                    baseline = max(c["origin"][1] for c in seg["chars"] if c["c"].strip())
                    texts.append({
                        "x": round(seg["x0"], 2),
                        "y": round(min(ys), 2),
                        "w": round(seg["x1"] - seg["x0"], 2),
                        "h": round(max(ys) - min(ys), 2),
                        "base": round(baseline, 2),
                        "size": size,
                        "runs": seg["runs"],
                    })
                    for r in seg["runs"]:
                        rgb = hex_to_rgb(r["color"])
                        if colorsys.rgb_to_hls(*rgb)[2] > 0.25:
                            color_count[r["color"]] = color_count.get(r["color"], 0) + len(r["t"])
                        font_count[family_of(r["font"])] = font_count.get(family_of(r["font"]), 0) + len(r["t"])
                    # Mittlerer Streifen des Abschnitts: trifft alle seine Zeichen, aber keine Nachbarn (z. B. Formeln)
                    vis = [c for c in seg["chars"] if c["c"].strip()]
                    a, z = pymupdf.Rect(vis[0]["bbox"]), pymupdf.Rect(vis[-1]["bbox"])
                    y0 = min(pymupdf.Rect(c["bbox"]).y0 for c in vis)
                    y1 = max(pymupdf.Rect(c["bbox"]).y1 for c in vis)
                    hgt = y1 - y0
                    redact.append(pymupdf.Rect(a.x0 + a.width * 0.3, y0 + hgt * 0.35, z.x1 - z.width * 0.3, y1 - hgt * 0.35))
                    texts[-1]["line"] = [round(v, 2) for v in line["bbox"]]
        for r in redact:
            page.add_redact_annot(r, fill=False, cross_out=False)
        if redact:
            page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE, graphics=pymupdf.PDF_REDACT_LINE_ART_NONE)
        zoom = min(4.0, TARGET_PX / w)
        name = f"page-{pno + 1:03d}.png"
        page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=True).save(os.path.join(out_dir, name))
        recolor_dark(os.path.join(out_dir, name), os.path.join(out_dir, "dark-" + name))  # für dunkle Designs
        pages.append({"w": round(w, 2), "h": round(h, 2), "img": name, "thumb": f"thumb-{pno + 1:03d}.png", "texts": texts})

    # Kopf- und Fußzeilen: Text am oberen/unteren Rand, der auf vielen Seiten wiederkehrt (Zahlen ignoriert)
    def key(t):
        return re.sub(r"\d+", "#", "".join(r["t"] for r in t["runs"])).strip()

    seen = {}
    for p in pages:
        for k in {key(t) for t in p["texts"] if t["y"] < p["h"] * 0.08 or t["y"] + t["h"] > p["h"] * 0.9}:
            seen[k] = seen.get(k, 0) + 1
    limit = max(2, len(pages) * 0.4)
    for p in pages:
        for t in p["texts"]:
            edge = t["y"] < p["h"] * 0.08 or t["y"] + t["h"] > p["h"] * 0.9
            t["repeat"] = edge and seen.get(key(t), 0) >= limit
    accent = max(color_count, key=color_count.get) if color_count else None
    font = max(font_count, key=font_count.get) if font_count else "Arial"
    with open(os.path.join(out_dir, "slides.json"), "w", encoding="utf-8") as fh:
        json.dump({"pages": pages, "accent": accent, "font": font}, fh, ensure_ascii=False)
    return 0


# ---------------------------------------------------------------------------
# PowerPoint erzeugen
# ---------------------------------------------------------------------------
def recolor_dark(src, dst):
    """Für dunkle Hintergründe: schwarze/graue Linien und Formeln hell machen, farbige Bilder unverändert lassen."""
    import numpy as np
    from PIL import Image

    a = np.asarray(Image.open(src).convert("RGBA")).astype(np.int16)
    rgb = a[..., :3]
    grey = (rgb.max(axis=2) - rgb.min(axis=2) < 40) & (a[..., 3] > 0)
    v = np.clip(255 - rgb.mean(axis=2), 30, 240).astype(np.int16)
    for k in range(3):
        rgb[..., k] = np.where(grey, v, rgb[..., k])
    Image.fromarray(a.astype(np.uint8), "RGBA").save(dst)


_metric_cache = {}


def metric_font(family, bold, italic):
    """Schrift mit den Maßen der Zielschrift (über fontconfig, z. B. Calibri → Carlito, Arial → Liberation Sans)."""
    key = (family, bold, italic)
    if key not in _metric_cache:
        font = None
        try:
            import subprocess

            pattern = family + (":weight=bold" if bold else "") + (":slant=italic" if italic else "")
            path = subprocess.run(["fc-match", "-f", "%{file}", pattern], capture_output=True, text=True, timeout=5).stdout.strip()
            if path.lower().endswith((".ttf", ".otf")):
                font = pymupdf.Font(fontfile=path)
        except Exception:
            font = None
        _metric_cache[key] = font or pymupdf.Font("helv")
    return _metric_cache[key]


def spacing_for(t, family_for):
    """Zeichenabstand (in Punkt der PDF-Seite), damit der Text mit der Zielschrift so breit ist wie im Original."""
    width, chars = 0.0, 0
    for r in t["runs"]:
        width += metric_font(family_for(r), r["bold"], r["italic"]).text_length(r["t"], fontsize=r["size"])
        chars += len(r["t"])
    if chars < 2 or width <= 0:
        return 0.0
    diff = (t["w"] - width) / (chars - 1)
    return max(-t["size"] * 0.12, min(t["size"] * 0.05, diff))


def cmd_build(in_dir, opts_path, out_path):
    from pptx import Presentation
    from pptx.dml.color import RGBColor
    from pptx.enum.text import MSO_ANCHOR, MSO_AUTO_SIZE
    from pptx.util import Emu, Pt

    with open(os.path.join(in_dir, "slides.json"), encoding="utf-8") as fh:
        data = json.load(fh)
    with open(opts_path, encoding="utf-8") as fh:
        opts = json.load(fh)
    pages = data["pages"]
    chosen = [i for i in opts.get("pages", range(len(pages))) if 0 <= i < len(pages)] or list(range(len(pages)))
    bg = opts.get("bg") or "#ffffff"
    dark = luminance(hex_to_rgb(bg)) < 0.45
    font_choice = opts.get("font") or "orig"
    original_font = data.get("font") or "Arial"

    first = pages[chosen[0]]
    fmt = opts.get("format") or "orig"
    EMU_IN = 914400
    if fmt == "16:9":
        sw, sh = int(13.333 * EMU_IN), int(7.5 * EMU_IN)
    elif fmt == "4:3":
        sw, sh = 10 * EMU_IN, int(7.5 * EMU_IN)
    else:
        sw, sh = 10 * EMU_IN, int(10 * EMU_IN * first["h"] / first["w"])

    prs = Presentation()
    prs.slide_width, prs.slide_height = Emu(sw), Emu(sh)
    blank = prs.slide_layouts[6]
    # Auch der Folienmaster bekommt den Hintergrund (für neue Folien in Keynote/PowerPoint)
    try:
        prs.slide_master.background.fill.solid()
        prs.slide_master.background.fill.fore_color.rgb = RGBColor.from_string(bg.lstrip("#").upper())
    except Exception:
        pass

    for i in chosen:
        p = pages[i]
        s = min(sw / p["w"], sh / p["h"])  # EMU pro PDF-Punkt
        ox, oy = (sw - p["w"] * s) / 2, (sh - p["h"] * s) / 2
        slide = prs.slides.add_slide(blank)
        slide.background.fill.solid()
        slide.background.fill.fore_color.rgb = RGBColor.from_string(bg.lstrip("#").upper())
        img = os.path.join(in_dir, p["img"])
        if dark:
            dimg = os.path.join(in_dir, "dark-" + p["img"])
            if not os.path.exists(dimg):
                recolor_dark(img, dimg)
            img = dimg
        slide.shapes.add_picture(img, Emu(int(ox)), Emu(int(oy)), Emu(int(p["w"] * s)), Emu(int(p["h"] * s)))
        family_for = (lambda r: family_of(r["font"])) if font_choice == "orig" else (lambda r: font_choice)
        if opts.get("hideRepeat"):
            # ganze Kopf-/Fußzeile abdecken – auch Trennzeichen aus Formel-Schriften, die im Bild stehen
            for line in {tuple(t["line"]) for t in p["texts"] if t.get("repeat") and t.get("line")}:
                x0, y0, x1, y1 = line
                cover = slide.shapes.add_shape(1, Emu(int(ox + (x0 - 1) * s)), Emu(int(oy + (y0 - 1) * s)), Emu(int((x1 - x0 + 2) * s)), Emu(int((y1 - y0 + 2) * s)))
                cover.fill.solid()
                cover.fill.fore_color.rgb = RGBColor.from_string(bg.lstrip("#").upper())
                cover.line.fill.background()
                cover.shadow.inherit = False
        for t in p["texts"]:
            if opts.get("hideRepeat") and t.get("repeat"):
                continue
            spc = spacing_for(t, family_for)
            box = slide.shapes.add_textbox(
                Emu(int(ox + t["x"] * s)), Emu(int(oy + t["y"] * s)), Emu(int(t["w"] * s * 1.08 + s * 2)), Emu(int(max(t["h"], t["size"]) * s))
            )
            tf = box.text_frame
            tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
            tf.word_wrap = False
            tf.auto_size = MSO_AUTO_SIZE.NONE
            tf.vertical_anchor = MSO_ANCHOR.TOP
            para = tf.paragraphs[0]
            para.line_spacing = 1.0
            for r in t["runs"]:
                run = para.add_run()
                run.text = r["t"]
                f = run.font
                f.size = Pt(r["size"] * s / 12700)
                f.bold = r["bold"]
                f.italic = r["italic"]
                f.name = family_of(r["font"]) if font_choice == "orig" else font_choice
                f.color.rgb = RGBColor.from_string(adapt_color(r["color"], data.get("accent"), opts).lstrip("#").upper())
                if abs(spc) > 0.01:
                    run._r.get_or_add_rPr().set("spc", str(int(round(spc * s / 12700 * 100))))  # Hundertstel Punkt
    prs.save(out_path)
    return 0


def main():
    cmd = sys.argv[1]
    if cmd == "analyze":
        return cmd_analyze(*sys.argv[2:4])
    if cmd == "build":
        return cmd_build(*sys.argv[2:5])
    print("unbekannter Befehl", file=sys.stderr)
    return 2


if __name__ == "__main__":
    sys.exit(main())

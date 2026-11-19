"""PDF → Word (DOCX) mit Texterkennung für gescannte Seiten.

Aufruf:
    python3 pdf_to_word.py eingabe.pdf ausgabe.docx [--mode flow|exact] [--ocr auto|off] [--lang deu+eng]

Zwei Modi:
  flow  (Standard) – pdf2docx baut echte Absätze, Tabellen und Listen: gut zum Weiterschreiben.
  exact            – LibreOffice setzt jeden Textblock an seine genaue Position (Textfelder):
                     sieht aus wie das Original, ist aber mühsamer zu bearbeiten.

Gescannte Seiten (kein Text, nur ein Bild) werden vorher neu aufgebaut:
  1. Bild gerade richten (kleine Schräglage vom Scanner oder Handy)
  2. Texterkennung (Tesseract über PyMuPDF) – mit Position und Größe jeder Zeile
  3. Linien (z. B. Tabellenrahmen) als echte Vektorlinien nachzeichnen → Word-Tabellen
  4. Logos, Fotos, Unterschriften als Bilder an ihrer Stelle behalten
  5. Text als echten, unsichtbar-freien Text an dieselbe Stelle setzen
Die neu aufgebaute Seite sieht dann für pdf2docx aus wie eine „normale“ digitale PDF.

Am Ende werden Schriftnamen und Aufzählungszeichen im DOCX aufgeräumt (Carlito → Calibri,
„ArialMT“ → Arial, Symbolschrift-Punkte → „•“), damit Word das Dokument richtig anzeigt.

Fehlercodes auf stderr (für app.js): password, ocr-missing
"""
import argparse
import io
import logging
import os
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile

import numpy as np
import pymupdf

logging.disable(logging.WARNING)
pymupdf.TOOLS.mupdf_display_errors(False)

HERE = os.path.dirname(os.path.abspath(__file__))
# Carlito: frei, gleiche Maße wie Calibri (Word zeigt sie als Calibri an) – enthält €, „“ und Akzente
FONT_R = os.path.join(HERE, "fonts", "cv", "Carlito-Regular.ttf")
FONT_B = os.path.join(HERE, "fonts", "cv", "Carlito-Bold.ttf")
MAX_SCANNED = 40  # mehr gescannte Seiten pro Auftrag dauern zu lange (~3–4 s pro Seite)
DPI = 300  # Auflösung für Texterkennung und Bildausschnitte
PT = 72 / DPI  # 1 Pixel in PDF-Punkten


# --------------------------------------------------------------------------- Seitentyp
def is_scanned(page):
    """Seite ohne nennenswerten Text, aber mit einem großen Bild = Scan oder Foto."""
    if len(page.get_text("text").strip()) >= 25:
        return False
    area = abs(page.rect)
    covered = 0
    for info in page.get_image_info():
        r = pymupdf.Rect(info["bbox"]) & page.rect
        covered += abs(r)
    return covered > 0.5 * area


# --------------------------------------------------------------------------- Bildhilfen
def render(page, gray=True):
    pix = page.get_pixmap(dpi=DPI, colorspace=pymupdf.csGRAY if gray else pymupdf.csRGB, alpha=False)
    arr = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
    return arr[:, :, 0].copy() if gray else arr.copy()


def deskew_angle(gray):
    """Schräglage über Projektionsprofil schätzen (−5° … +5°): bei richtigem Winkel sind die
    Textzeilen genau waagerecht, dann schwanken die Zeilensummen am stärksten."""
    from PIL import Image

    small = Image.fromarray(gray).resize((gray.shape[1] // 4, gray.shape[0] // 4))
    ink = (np.asarray(small) < 140).astype(np.uint8)
    if ink.sum() < 500:
        return 0.0
    best, best_score = 0.0, -1.0
    img = Image.fromarray(ink * 255)
    for a in np.arange(-5, 5.01, 0.25):
        rot = np.asarray(img.rotate(a, resample=Image.NEAREST, fillcolor=0)) > 0
        prof = rot.sum(axis=1).astype(np.float64)
        score = float(np.square(np.diff(prof)).sum())
        if score > best_score:
            best, best_score = float(a), score
    # fein nachjustieren
    for a in np.arange(best - 0.25, best + 0.251, 0.05):
        rot = np.asarray(img.rotate(a, resample=Image.NEAREST, fillcolor=0)) > 0
        prof = rot.sum(axis=1).astype(np.float64)
        score = float(np.square(np.diff(prof)).sum())
        if score > best_score:
            best, best_score = float(a), score
    return best if abs(best) >= 0.1 else 0.0


def rotate(arr, angle, fill):
    from PIL import Image

    if not angle:
        return arr
    return np.asarray(Image.fromarray(arr).rotate(angle, resample=Image.BICUBIC, fillcolor=fill)).copy()


def runs_mask(binary, min_len):
    """Markiert in jeder Zeile alle zusammenhängenden dunklen Läufe ≥ min_len Pixel (= waagerechte Linien)."""
    h, w = binary.shape
    out = np.zeros_like(binary, dtype=bool)
    pad = np.zeros((h, 1), dtype=np.int8)
    b = np.concatenate([pad, binary.astype(np.int8), pad], axis=1)
    d = np.diff(b, axis=1)
    for y in np.nonzero((binary.sum(axis=1) >= min_len))[0]:
        starts = np.nonzero(d[y] == 1)[0]
        ends = np.nonzero(d[y] == -1)[0]
        for s, e in zip(starts, ends):
            if e - s >= min_len:
                out[y, s:e] = True
    return out


def segments(mask, horizontal):
    """Linienpixel zu Segmenten zusammenfassen: (x0, y0, x1, y1, dicke) in Pixeln."""
    m = mask if horizontal else mask.T
    segs = []
    rows = np.nonzero(m.any(axis=1))[0]
    used = set()
    for y in rows:
        if y in used:
            continue
        # benachbarte Zeilen gehören zur selben (dicken) Linie
        y1 = y
        while y1 + 1 < m.shape[0] and m[y1 + 1].any():
            y1 += 1
        band = m[y : y1 + 1].any(axis=0)
        xs = np.nonzero(band)[0]
        if len(xs):
            # Lücken > 6 px trennen Segmente
            splits = np.nonzero(np.diff(xs) > 6)[0]
            starts = np.concatenate([[xs[0]], xs[splits + 1]])
            ends = np.concatenate([xs[splits], [xs[-1]]])
            for s, e in zip(starts, ends):
                # genaue Lage dieses Segments: nur die Zeilen des Bandes, die es an seiner Stelle wirklich bedeckt
                # (sonst „erbt“ z. B. ein Tabellenstrich die Breite eines Logos weiter oben)
                hit = np.nonzero(m[y : y1 + 1, s : e + 1].any(axis=1))[0]
                r0, r1 = y + int(hit.min()), y + int(hit.max())
                segs.append((int(s), r0, int(e), r1, r1 - r0 + 1))
        used.update(range(y, y1 + 1))
    if not horizontal:
        segs = [(y0, x0, y1, x1, t) for (x0, y0, x1, y1, t) in segs]
    return segs


def components(mask, min_area):
    """Zusammenhängende Flächen in einem (verkleinerten) Raster finden – einfache Flutfüllung."""
    h, w = mask.shape
    seen = np.zeros_like(mask, dtype=bool)
    boxes = []
    ys, xs = np.nonzero(mask)
    for y0, x0 in zip(ys, xs):
        if seen[y0, x0]:
            continue
        stack = [(y0, x0)]
        seen[y0, x0] = True
        minx = maxx = x0
        miny = maxy = y0
        n = 0
        while stack:
            y, x = stack.pop()
            n += 1
            minx, maxx, miny, maxy = min(minx, x), max(maxx, x), min(miny, y), max(maxy, y)
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                yy, xx = y + dy, x + dx
                if 0 <= yy < h and 0 <= xx < w and mask[yy, xx] and not seen[yy, xx]:
                    seen[yy, xx] = True
                    stack.append((yy, xx))
        if n >= min_area:
            boxes.append((minx, miny, maxx + 1, maxy + 1, n))
    return boxes


# --------------------------------------------------------------------------- Scan neu aufbauen
def ocr_words(gray, page_rect, lang):
    """Texterkennung auf dem (geraden) Seitenbild. Liefert Zeilen mit Wörtern in PDF-Koordinaten."""
    from PIL import Image

    tmp = pymupdf.open()
    p = tmp.new_page(width=page_rect.width, height=page_rect.height)
    buf = io.BytesIO()
    Image.fromarray(gray).save(buf, "PNG")
    p.insert_image(p.rect, stream=buf.getvalue())
    try:
        tp = p.get_textpage_ocr(dpi=DPI, full=True, language=lang)
    except Exception as e:  # Tesseract fehlt
        if "tesseract" in str(e).lower() or "OCR" in str(e):
            print("ocr-missing", file=sys.stderr)
            sys.exit(3)
        raise
    words = p.get_text("words", textpage=tp)  # (x0, y0, x1, y1, wort, block, zeile, wortnr)
    lines = {}
    for w in words:
        if not w[4].strip():
            continue
        lines.setdefault((w[5], w[6]), []).append(w)
    out = []
    for key in sorted(lines):
        ws = sorted(lines[key], key=lambda w: w[0])
        out.append({"block": key[0], "words": ws, "bbox": pymupdf.Rect(min(w[0] for w in ws), min(w[1] for w in ws), max(w[2] for w in ws), max(w[3] for w in ws))})
    return out


def word_style(gray, rgb, w, med_density):
    """Fett und Farbe eines Wortes aus den Pixeln schätzen."""
    x0, y0, x1, y1 = (int(v / PT) for v in w[:4])
    x0, y0 = max(x0, 0), max(y0, 0)
    g = gray[y0:y1, x0:x1]
    if g.size == 0:
        return False, (0, 0, 0)
    ink = g < 128
    density = ink.mean()
    bold = med_density > 0 and density > med_density * 1.45
    color = (0, 0, 0)
    if ink.sum() > 15:
        px = rgb[y0:y1, x0:x1][ink].astype(np.float64)
        r, gg, b = px.mean(axis=0)
        if max(r, gg, b) - min(r, gg, b) > 45:  # deutlich farbig (nicht grau/schwarz)
            color = (r / 255, gg / 255, b / 255)
    return bold, color


def line_masks(dark):
    """Lange, dünne Linien (Tabellenrahmen, Trennstriche) finden. Dicke Läufe (z. B. eine farbige
    Fläche im Logo) zählen nicht als Linie und bleiben für die Bilderkennung erhalten."""
    h_raw = runs_mask(dark, int(18 / 25.4 * DPI))  # waagerecht ab 18 mm
    v_raw = runs_mask(dark.T, int(8 / 25.4 * DPI)).T  # senkrecht ab 8 mm (Tabellenzeilen sind niedrig)
    hseg = [s for s in segments(h_raw, True) if s[4] <= 12]
    vseg = [s for s in segments(v_raw, False) if s[4] <= 12]
    mask = np.zeros_like(dark, dtype=bool)
    for (x0, y0, x1, y1, t) in hseg + vseg:
        mask[y0 : y1 + 1, x0 : x1 + 1] = True
    return hseg, vseg, mask & dark


ASC = set("bdfhklt0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜßäöü!?%&/()[]{}|€$§#'\"") | set("àâéèêëîïôùûüçÉÈÀ")
DESC = set("gjpqyQ,;()[]{}|@")
BULLETS = {"e", "o", "°", "•", "·", "*", "«", "»", "-", "–", "—", "©", "®", "®", "¢", "e@", "»»", "»>", ">"}


def font_size(text, height):
    """Schriftgröße aus der Höhe einer Zeile. Tesseract misst die Tinte der ganzen Zeile (PyMuPDF gibt
    jedem Wort diese Zeilenhöhe): Eine Zeile mit Unterlängen („Lieferung“) ist ~0,87 × Schriftgröße
    hoch, ohne Unterlängen („Kostenlose Hotline“) ~0,71 ×, nur x-Höhe („neue arme“) ~0,48 ×.
    Gemessen an Scans mit 11-pt- und 14-pt-Text."""
    asc = any(c in ASC for c in text)
    desc = any(c in DESC for c in text)
    ratio = (0.87 if desc else 0.71) if asc else (0.66 if desc else 0.48)
    return height / ratio


def line_size(ln):
    words = [w for w in ln["words"] if w[4] not in BULLETS]
    return font_size(" ".join(w[4] for w in words) or "x", ln["bbox"].height)


def rebuild_scanned(src_page, out_doc, lang):
    from PIL import Image

    rect = src_page.rect
    gray = render(src_page, gray=True)
    rgb = render(src_page, gray=False)
    angle = deskew_angle(gray)
    gray = rotate(gray, angle, 255)
    rgb = rotate(rgb, angle, (255, 255, 255))
    page = out_doc.new_page(width=rect.width, height=rect.height)

    # 1) Linien finden und für die Texterkennung entfernen (sonst liest Tesseract „|“ und zerreißt Tabellenzeilen)
    dark = gray < 150
    hseg, vseg, lmask = line_masks(dark)
    clean = gray.copy()
    clean[np.pad(lmask, 2, mode="edge")[2:-2, 2:-2] | lmask] = 255
    # Linienpixel etwas breiter entfernen (Kantenglättung)
    lm = lmask.copy()
    lm[1:] |= lmask[:-1]
    lm[:-1] |= lmask[1:]
    lm[:, 1:] |= lmask[:, :-1]
    lm[:, :-1] |= lmask[:, 1:]
    clean[lm] = 255

    if os.environ.get("PDF2WORD_DEBUG"):
        Image.fromarray(clean).save(os.environ["PDF2WORD_DEBUG"] + ".clean.png")
    # 2) Texterkennung auf dem sauberen Bild
    lines = ocr_words(clean, rect, lang)

    # 3) Grafiken: was nach Entfernen von Text und Linien übrig bleibt (Logo, Foto, Unterschrift, Stempel)
    rest = clean.copy()
    for ln in lines:
        for w in ln["words"]:
            x0, y0, x1, y1 = (int(v / PT) for v in w[:4])
            rest[max(0, y0 - 3) : y1 + 3, max(0, x0 - 3) : x1 + 3] = 255
    f = 8  # Raster 8 × 8 px
    rdark = rest < 150
    hh, ww = rdark.shape[0] // f, rdark.shape[1] // f
    grid = rdark[: hh * f, : ww * f].reshape(hh, f, ww, f).mean(axis=(1, 3)) > 0.04
    # Flächen im Originalbild (vor dem Ausradieren), damit Schrift in einem Logo dazugehört
    full = (gray < 200)[: hh * f, : ww * f].reshape(hh, f, ww, f).mean(axis=(1, 3))
    images = []
    min_cells = int((8 / 25.4 * DPI / f) ** 2)  # mindestens ~0,6 cm²
    for (x0, y0, x1, y1, n) in components(grid, min_cells):
        if (x1 - x0) * f < 0.006 * DPI * 25.4 or (y1 - y0) * f < 0.004 * DPI * 25.4:
            continue
        density = full[y0:y1, x0:x1].mean()
        bx = pymupdf.Rect(x0 * f * PT, y0 * f * PT, x1 * f * PT, y1 * f * PT) + (-2, -2, 2, 2)
        images.append((bx & page.rect, density))
        if os.environ.get("PDF2WORD_DEBUG"):
            print("image", [round(v) for v in bx], round(float(density), 2), file=sys.stderr)
    for bx, _ in images:
        crop = rgb[int(bx.y0 / PT) : int(bx.y1 / PT), int(bx.x0 / PT) : int(bx.x1 / PT)]
        if crop.size == 0:
            continue
        buf = io.BytesIO()
        Image.fromarray(crop).save(buf, "JPEG", quality=88)
        page.insert_image(bx, stream=buf.getvalue())

    # 4) Linien als Vektoren – daraus baut pdf2docx echte Word-Tabellen
    if hseg or vseg:
        shape = page.new_shape()
        for (x0, y0, x1, y1, t) in hseg:
            y = (y0 + y1) / 2 * PT
            shape.draw_line((x0 * PT, y), (x1 * PT, y))
        for (x0, y0, x1, y1, t) in vseg:
            x = (x0 + x1) / 2 * PT
            shape.draw_line((x, y0 * PT), (x, y1 * PT))
        shape.finish(color=(0, 0, 0), width=0.6)
        shape.commit()

    # 5) Text an dieselbe Stelle setzen
    dens = []
    for ln in lines:
        for w in ln["words"]:
            x0, y0, x1, y1 = (int(v / PT) for v in w[:4])
            g = clean[max(0, y0) : y1, max(0, x0) : x1]
            if g.size:
                dens.append((g < 128).mean())
    med = float(np.median(dens)) if dens else 0
    font_r = pymupdf.Font(fontfile=FONT_R)
    font_b = pymupdf.Font(fontfile=FONT_B)
    page.insert_font(fontname="F-R", fontfile=FONT_R)
    page.insert_font(fontname="F-B", fontfile=FONT_B)

    # Aufzählungspunkte, die Tesseract als eigene Zeile liest („e“, „o“, „®“ …), an die Textzeile daneben hängen
    merged = set()
    for i, ln in enumerate(lines):
        if len(ln["words"]) != 1 or ln["words"][0][4] not in BULLETS:
            continue
        b = ln["bbox"]
        for j, other in enumerate(lines):
            o = other["bbox"]
            if j == i or j in merged:
                continue
            overlap = min(b.y1, o.y1) - max(b.y0, o.y0)
            if overlap > 0.4 * b.height and 0 < o.x0 - b.x1 < 40:
                w = ln["words"][0]
                other["words"] = [(w[0], w[1], w[2], w[3], "•") + tuple(w[5:])] + other["words"]
                other["bullet"] = True
                merged.add(i)
                break
    lines = [ln for i, ln in enumerate(lines) if i not in merged]

    # Schriftgröße je Zeile, dann innerhalb eines Blocks vereinheitlichen (ein Absatz = eine Größe)
    for ln in lines:
        ln["size"] = line_size(ln)
        # Plausibilität über die Breite: Wenn Tesseract zwei Spalten oder Tabellenzellen zu einer Zeile
        # zusammenfasst, stimmt die Höhe nicht mehr. Die Breite des Textes (in Carlito gemessen) ist dann
        # die bessere Schätzung.
        ws = [w for w in ln["words"] if w[4] not in BULLETS]
        chars = sum(len(w[4]) for w in ws)
        if chars >= 3:
            ink = sum(w[2] - w[0] for w in ws)  # nur die Wörter, ohne Lücken
            per_pt = sum(font_r.text_length(w[4], fontsize=1) for w in ws)
            if per_pt > 0:
                by_width = ink / per_pt
                if ln["size"] > by_width * 1.2:
                    ln["size"] = by_width
    by_block = {}
    for ln in lines:
        by_block.setdefault(ln["block"], []).append(ln["size"])
    for ln in lines:
        m = float(np.median(by_block[ln["block"]]))
        if abs(ln["size"] - m) <= 0.18 * m:
            ln["size"] = m
    # Fließtext einheitlich: alles in der Nähe der häufigsten Größe bekommt genau diese Größe
    # (Überschriften sind deutlich größer und bleiben erhalten)
    if lines:
        weights = {}
        for ln in lines:
            k = round(ln["size"] * 2) / 2
            weights[k] = weights.get(k, 0) + len(" ".join(w[4] for w in ln["words"]))
        body = max(weights, key=weights.get)
        for ln in lines:
            if 0.8 * body <= ln["size"] <= 1.22 * body:
                ln["size"] = body
    for ln in lines:
        ln["size"] = max(5.0, min(48.0, round(ln["size"] * 2) / 2))

    for ln in lines:
        # Wörter in einem dichten Bild (Logo, Foto) gehören zum Bild
        ws = [w for w in ln["words"] if not any(d > 0.25 and pymupdf.Rect(w[:4]).intersect(bx).get_area() > 0.6 * pymupdf.Rect(w[:4]).get_area() for bx, d in images)]
        if not ws:
            continue
        size = ln["size"]
        # Aufzählungspunkt, den die Texterkennung als „e“, „o“ oder „«“ liest
        first = ws[0]
        if len(ws) > 1 and first[4] in BULLETS and first[4] != "•" and (first[3] - first[1]) < 0.75 * ln["bbox"].height and ws[1][0] - first[2] > size * 0.4:
            ws = [(first[0], first[1], first[2], first[3], "•") + tuple(first[5:])] + ws[1:]
        # Zeile an großen Lücken teilen (Tabellenspalten, Tabstopps)
        groups, cur = [], [ws[0]]
        for k, (a, b) in enumerate(zip(ws, ws[1:])):
            if k == 0 and ws[0][4] == "•":  # Punkt und Text bleiben zusammen (sonst entsteht eine Tabelle)
                cur.append(b)
                continue
            if b[0] - a[2] > max(size * 1.6, 9):
                groups.append(cur)
                cur = [b]
            else:
                cur.append(b)
        groups.append(cur)
        for g in groups:
            styles = [word_style(clean, rgb, w, med) for w in g]
            bold = sum(s[0] for s in styles) > len(styles) / 2
            cols = [s[1] for s in styles if s[1] != (0, 0, 0)]
            color = tuple(float(c) for c in np.mean(cols, axis=0)) if len(cols) > len(styles) / 2 else (0, 0, 0)
            text = " ".join(w[4] for w in g)
            font = font_b if bold else font_r
            x0 = g[0][0]
            width = max(g[-1][2] - x0, 1)
            fs = size
            tw = font.text_length(text, fontsize=fs)
            if tw > width * 1.25:  # nur stark zu breite Zeilen verkleinern (Helvetica ist breiter als z. B. Calibri)
                fs = max(4.5, fs * width * 1.25 / tw)
            base = max(w[3] for w in g) - (fs * 0.21 if any(c in DESC for c in text) else 0)
            page.insert_text((x0, base), text, fontsize=fs, fontname="F-B" if bold else "F-R", color=color)
    return page


def prepare(src, lang, ocr):
    """Neue PDF, in der gescannte Seiten durch neu aufgebaute ersetzt sind. None, wenn nichts zu tun ist."""
    scanned = [i for i, p in enumerate(src) if is_scanned(p)] if ocr != "off" else []
    if not scanned:
        return None, 0
    if len(scanned) > MAX_SCANNED:
        print("too-many-scans", file=sys.stderr)
        sys.exit(4)
    out = pymupdf.open()
    for i, p in enumerate(src):
        if i in scanned:
            rebuild_scanned(p, out, lang)
        else:
            out.insert_pdf(src, from_page=i, to_page=i)
    return out, len(scanned)


# --------------------------------------------------------------------------- Umwandeln
def convert_flow(pdf_path, out_path):
    from pdf2docx import Converter

    cv = Converter(pdf_path)
    try:
        cv.convert(out_path, start=0, end=None)
    finally:
        cv.close()


def convert_exact(pdf_path, out_path):
    office = shutil.which("soffice") or shutil.which("libreoffice")
    if not office:
        raise RuntimeError("libreoffice missing")
    with tempfile.TemporaryDirectory() as d:
        env = dict(os.environ, HOME=d)  # eigenes Profil: parallele Aufrufe stören sich nicht
        subprocess.run([office, "--headless", f"-env:UserInstallation=file://{d}/profile", "--infilter=writer_pdf_import", "--convert-to", "docx:MS Word 2007 XML", "--outdir", d, pdf_path], check=True, capture_output=True, timeout=240, env=env)
        res = os.path.join(d, os.path.splitext(os.path.basename(pdf_path))[0] + ".docx")
        shutil.move(res, out_path)


# --------------------------------------------------------------------------- DOCX aufräumen
FONT_MAP = {
    "carlito": "Calibri", "caladea": "Cambria", "liberation sans": "Arial", "liberation serif": "Times New Roman",
    "liberation mono": "Courier New", "arimo": "Arial", "tinos": "Times New Roman", "cousine": "Courier New",
    "helvetica": "Arial", "helv": "Arial", "hebo": "Arial", "times": "Times New Roman", "times-roman": "Times New Roman",
    "timesnewromanpsmt": "Times New Roman", "timesnewroman": "Times New Roman", "arialmt": "Arial", "courier": "Courier New",
    "couriernewpsmt": "Courier New", "dejavu sans": "Arial", "glyphlessfont": "Arial",
}
BULLET_FONTS = ("opensymbol", "symbol", "wingdings", "zapfdingbats")


def clean_font(name):
    n = re.sub(r"^[A-Z]{6}\+", "", name)  # Teilmengen-Präfix „ABCDEF+“
    base = re.sub(r"[-,](bold|italic|oblique|regular|semibold|light|medium|black|bolditalic|boldoblique|roman|book)+$", "", n, flags=re.I)
    base = re.sub(r"(PSMT|PS|MT)$", "", base)
    key = base.lower().strip()
    if key in FONT_MAP:
        return FONT_MAP[key]
    if n.lower() in FONT_MAP:
        return FONT_MAP[n.lower()]
    # „OpenSans“ → „Open Sans“
    return re.sub(r"(?<=[a-z])(?=[A-Z])", " ", base) if base else name


def postprocess(path):
    """Schriftnamen und Aufzählungszeichen direkt im DOCX-XML korrigieren."""
    with zipfile.ZipFile(path) as z:
        files = {n: z.read(n) for n in z.namelist()}

    def fix_xml(xml):
        # Aufzählungszeichen aus Symbolschriften (Private-Use-Zeichen) → normaler Punkt
        def bullet(m):
            run = m.group(0)
            if any(f in run.lower() for f in BULLET_FONTS):
                run = re.sub(r'w:(ascii|hAnsi|cs|eastAsia)="[^"]*"', r'w:\1="Arial"', run)
                run = re.sub(r"(<w:t[^>]*>)[\ue000-\uf8ff\u2022\u25cf\u00b7\uf0b7\uf06e\uf0a7]+(</w:t>)", "\\1•\\2", run)
            return run

        xml = re.sub(r"<w:r>.*?</w:r>|<w:r [^>]*>.*?</w:r>", bullet, xml, flags=re.S)
        xml = re.sub(r"[\ue000-\uf8ff]", "•", xml)  # verbliebene Private-Use-Zeichen
        xml = re.sub(r'(w:(?:ascii|hAnsi|cs|eastAsia)=")([^"]+)(")', lambda m: m.group(1) + clean_font(m.group(2)) + m.group(3), xml)
        return xml

    def fix_columns(xml):
        """pdf2docx trennt zwei Spalten mit einem Abschnittswechsel „nextColumn“ – Word kann das,
        LibreOffice und Google Docs zeigen die zweite Spalte dann oft nicht. Umbau: ein einziger
        zweispaltiger Abschnitt mit einem normalen Spaltenumbruch, den alle Programme verstehen."""
        secs = list(re.finditer(r"<w:sectPr\b.*?</w:sectPr>", xml, flags=re.S))
        cuts = []
        for a, b in zip(secs, secs[1:]):
            if 'w:num="2"' in a.group(0) and 'w:val="nextColumn"' in b.group(0) and 'w:val="nextColumn"' not in a.group(0):
                cuts.append((a, b))
        for a, b in reversed(cuts):
            # b: Typ auf „continuous“ – er schließt jetzt den gemeinsamen Abschnitt beider Spalten
            nb = b.group(0).replace('w:val="nextColumn"', 'w:val="continuous"')
            xml = xml[: b.start()] + nb + xml[b.end() :]
            # a: Abschnittsende entfernen, dafür Spaltenumbruch am Ende dieses Absatzes
            end_p = xml.find("</w:p>", a.end())
            xml = xml[:end_p] + '<w:r><w:br w:type="column"/></w:r>' + xml[end_p:]
            xml = xml[: a.start()] + xml[a.end() :]
        return xml

    files["word/document.xml"] = fix_columns(files["word/document.xml"].decode("utf-8")).encode("utf-8")
    for n in list(files):
        if n.startswith("word/") and n.endswith(".xml") and (n.startswith("word/document") or "header" in n or "footer" in n or n.endswith("styles.xml") or n.endswith("fontTable.xml") or n.endswith("numbering.xml")):
            files[n] = fix_xml(files[n].decode("utf-8")).encode("utf-8")
    tmp = path + ".tmp"
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as z:
        for n, data in files.items():
            z.writestr(n, data)
    os.replace(tmp, path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--mode", choices=["flow", "exact"], default="flow")
    ap.add_argument("--ocr", choices=["auto", "off"], default="auto")
    ap.add_argument("--lang", default="deu+eng")
    a = ap.parse_args()

    src = pymupdf.open(a.src)
    if src.needs_pass:
        print("password", file=sys.stderr)
        return 2
    with tempfile.TemporaryDirectory() as d:
        rebuilt, nscan = prepare(src, a.lang, a.ocr)
        pdf = a.src
        if rebuilt is not None:
            pdf = os.path.join(d, "rebuilt.pdf")
            rebuilt.save(pdf, garbage=3, deflate=True)
            if os.environ.get("PDF2WORD_DEBUG"):  # neu aufgebaute PDF zum Prüfen behalten
                shutil.copy(pdf, os.environ["PDF2WORD_DEBUG"])
        (convert_exact if a.mode == "exact" else convert_flow)(pdf, a.dst)
    postprocess(a.dst)
    print(f"scanned={nscan} pages={len(src)}")  # letzte Zeile: Info für app.js
    return 0


if __name__ == "__main__":
    sys.exit(main())

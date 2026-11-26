"""
Hilfsschritte für die KI-Werkzeuge (Zusammenfassen, Übersetzen). Die KI selbst ruft server/ai.js auf.

  python3 pdf_ai.py text    eingabe.pdf text.json           → {"pages": ["…", …]}
  python3 pdf_ai.py blocks  eingabe.pdf blocks.json         → Textblöcke mit Position und Stil (für die Übersetzung)
  python3 pdf_ai.py apply   eingabe.pdf blocks.json aus.pdf → übersetzte Blöcke an derselben Stelle einsetzen
  python3 pdf_ai.py report  inhalt.html titel aus.pdf       → Zusammenfassung als PDF
"""
import html
import json
import os
import re
import subprocess
import sys

import pymupdf

MAX_TEXT_PAGES = 200
MAX_TRANSLATE_PAGES = 30


def open_pdf(path):
    doc = pymupdf.open(path)
    if doc.needs_pass:
        print("password", file=sys.stderr)
        sys.exit(3)
    return doc


def cmd_text(in_path, out_path):
    doc = open_pdf(in_path)
    pages = [p.get_text("text") for p in doc.pages(0, min(doc.page_count, MAX_TEXT_PAGES))]
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump({"pages": pages, "pageCount": doc.page_count}, fh, ensure_ascii=False)


def _span_text(s):
    return "".join(ch["c"] for ch in s.get("chars", [])) if "chars" in s else s.get("text", "")


# ---------------------------------------------------------------------------- Schrift & Stil eines Textstücks
SUBSET = re.compile(r"^[A-Z]{6}\+")


def _is_bold(span):
    return bool(span["flags"] & 16) or bool(re.search(r"bold|black|heavy|semibold|demi", span.get("font", ""), re.I))


def _is_italic(span):
    return bool(span["flags"] & 2) or bool(re.search(r"italic|oblique", span.get("font", ""), re.I))


def _family(fontname):
    """„ABCDEF+TimesNewRomanPS-BoldMT“ → „Times New Roman“ (für die Suche nach einer passenden Schrift)."""
    name = SUBSET.sub("", fontname or "")
    name = re.split(r"[-,]", name)[0]
    name = re.sub(r"(PSMT|PS|MT)$", "", name)
    name = re.sub(r"(?<=[a-z])(?=[A-Z])", " ", name)  # CamelCase → Wörter
    return name.strip() or "Helvetica"


# ---------------------------------------------------------------------------- Unterstreichen / Durchstreichen
LINE_COLOR = {}  # Linie → Farbe (für farbige Unterstreichungen)


def _hex(rgb):
    if not rgb:
        return None
    return "#%02x%02x%02x" % tuple(max(0, min(255, round(c * 255))) for c in rgb[:3])


def _page_lines(page):
    """Dünne Linien der Seite: waagerechte (Unterstreichung, Durchstreichung, Tabellenrahmen) und senkrechte (Zellgrenzen)."""
    horiz, vert = [], []
    try:
        drawings = page.get_drawings()
    except Exception:
        return horiz, vert
    for d in drawings:
        r = d.get("rect")
        if r is None:
            continue
        if r.width >= 2 and r.height <= 2.5:
            rr = pymupdf.Rect(r)
            LINE_COLOR[tuple(round(v, 2) for v in rr)] = d.get("color") or d.get("fill")
            horiz.append(rr)
        elif r.height >= 2 and r.width <= 2.5:
            vert.append(pymupdf.Rect(r))
    return horiz, vert


def _span_deco(span, lines):
    """Liegt eine Linie unter (Unterstreichung) oder mitten durch (Durchstreichung) dieses Textstücks?"""
    x0, y0, x1, y1 = span["bbox"]
    size = span["size"]
    width = max(x1 - x0, 1)
    under = strike = None
    for r in lines:
        overlap = min(r.x1, x1) - max(r.x0, x0)
        if overlap < width * 0.5:
            continue
        y = (r.y0 + r.y1) / 2
        if y1 - size * 0.35 <= y <= y1 + size * 0.3:
            under = r
        elif y0 + (y1 - y0) * 0.35 <= y <= y0 + (y1 - y0) * 0.75:
            strike = r
    return under, strike


def _style(run):
    _t, span, u, st, rects = run
    return {"b": _is_bold(span), "i": _is_italic(span), "u": u, "s": st, "_lines": rects}


# ---------------------------------------------------------------------------- Textblöcke
def _unit(pno, rect, runs, lines, page_rect, line_boxes, margins=None):
    """runs: [text, span, unterstrichen, durchgestrichen, linien] in Lesereihenfolge. Erzeugt einen Übersetzungsblock mit Stil, Ausrichtung und Markierungen."""
    text = re.sub(r"\s+", " ", "".join(r[0] for r in runs)).strip()
    flat = [(r[0], r[1]) for r in runs if r[0].strip()]
    if not flat or not re.search(r"[^\W\d_]{2,}", text):
        return None  # nur Blöcke mit Wörtern übersetzen (Zahlen, Datumsangaben usw. bleiben)
    styled = [(r[0], r[1], _style(r)) for r in runs]
    # vorherrschender Stil (nach Anzahl Zeichen)
    def major(key):
        yes = sum(len(t) for t, _, st in styled if st[key] and t.strip())
        return yes * 2 > sum(len(t) for t, _, _ in styled if t.strip())
    dom = {k: major(k) for k in "bius"}
    sizes, fonts, colors = {}, {}, {}
    for t, sp in flat:
        n = len(t)
        sizes[round(sp["size"], 1)] = sizes.get(round(sp["size"], 1), 0) + n
        fonts[sp.get("font", "")] = fonts.get(sp.get("font", ""), 0) + n
        colors[int(sp.get("color", 0))] = colors.get(int(sp.get("color", 0)), 0) + n
    # Abweichende Stellen als Tags markieren – die KI behält sie bei
    parts = []
    for t, sp, st in styled:
        piece = html.escape(t, quote=False)
        if piece.strip():
            core = piece.strip()
            lead, trail = piece[: len(piece) - len(piece.lstrip())], piece[len(piece.rstrip()):]
            for k in "bius":
                if st[k] and not dom[k]:
                    core = f"<{k}>{core}</{k}>"
            piece = lead + core + trail  # Leerzeichen außerhalb der Tags – sonst wird der Abstand mit unterstrichen
        parts.append(piece)
    markup = re.sub(r"\s+", " ", "".join(parts)).strip()
    for k in "bius":  # benachbarte gleiche Tags zusammenfassen: </b> <b> → Leerzeichen
        markup = re.sub(rf"</{k}>(\s*)<{k}>", r"\1", markup)
    # Linien, die wir mit dem Text verschieben (nur so breit wie der Block – Tabellenrahmen bleiben)
    decos = []
    for _, _, st in styled:
        for r in st["_lines"]:
            if r.width <= (rect[2] - rect[0]) + 4 and list(r) not in decos:
                decos.append([round(v, 2) for v in r])
    # Farbe der Unter-/Durchstreichung, falls sie sich von der Textfarbe unterscheidet (z. B. roter Strich unter schwarzem Text)
    deco_color = None
    for r in decos:
        c = _hex(LINE_COLOR.get(tuple(round(v, 2) for v in r)))
        if c and c != "#%06x" % max(colors, key=colors.get):
            deco_color = c
            break
    # Ausrichtung aus den Zeilen ablesen
    size = max(sizes, key=sizes.get)
    align = "left"
    if len(line_boxes) >= 2:
        tol = size * 0.6
        lefts = [b[0] for b in line_boxes]
        rights = [b[2] for b in line_boxes]
        centers = [(b[0] + b[2]) / 2 for b in line_boxes]
        if max(lefts) - min(lefts) < tol:
            align = "justify" if len(line_boxes) >= 3 and max(rights[:-1]) - min(rights[:-1]) < tol else "left"
        elif max(rights) - min(rights) < tol:
            align = "right"
        elif max(centers) - min(centers) < tol:
            align = "center"
    elif line_boxes and margins:
        # einzelne Zeile: mit den Rändern des Textbereichs der Seite vergleichen
        b = line_boxes[0]
        lm, rm = margins
        tol = max(3, size * 0.5)
        if b[0] > lm + tol and abs(b[2] - rm) < tol:
            align = "right"
        elif b[0] > lm + tol and abs((b[0] + b[2]) / 2 - (lm + rm) / 2) < tol:
            align = "center"
    return {
        "page": pno,
        "bbox": [round(v, 2) for v in rect],
        "text": text,
        "markup": markup,
        "size": size,
        "color": "#%06x" % max(colors, key=colors.get),
        "font": max(fonts, key=fonts.get),
        "bold": dom["b"],
        "italic": dom["i"],
        "underline": dom["u"],
        "strike": dom["s"],
        "serif": bool(flat[0][1]["flags"] & 4),
        "mono": bool(flat[0][1]["flags"] & 8) or bool(re.search(r"mono|courier|consol", max(fonts, key=fonts.get), re.I)),
        "align": align,
        "single": len(line_boxes) <= 1,
        "decos": decos,
        "deco_color": deco_color,
    }


def _segments(line, lines_art=(), vlines=()):
    """Teile einer Zeile, die durch große Lücken getrennt sind (z. B. Tabellenzellen) – zeichengenau, mit Textstücken je Schrift."""
    segs = []
    prev_x1 = None
    for span in line["spans"]:
        for ch in span.get("chars", []):
            c = ch["c"]
            if c.isspace():
                if segs and segs[-1]["runs"] and not segs[-1]["runs"][-1][0].endswith(" "):
                    segs[-1]["runs"][-1][0] += " "
                continue
            x0, x1 = ch["bbox"][0], ch["bbox"][2]
            cy = (ch["bbox"][1] + ch["bbox"][3]) / 2
            border = prev_x1 is not None and any(prev_x1 - 0.5 <= v.x0 <= x0 + 0.5 and v.y0 <= cy <= v.y1 for v in vlines)
            if not segs or prev_x1 is None or x0 - prev_x1 > span["size"] * 0.9 or border:
                segs.append({"runs": [], "bbox": list(ch["bbox"])})
            seg = segs[-1]
            u, st = _span_deco({"bbox": ch["bbox"], "size": span["size"]}, lines_art) if lines_art else (None, None)
            last = seg["runs"][-1] if seg["runs"] else None
            if last and last[1] is span and last[2] == bool(u) and last[3] == bool(st):
                last[0] += c
            else:
                last = [c, span, bool(u), bool(st), []]
                seg["runs"].append(last)
            for r in (u, st):
                if r is not None and r not in last[4]:
                    last[4].append(r)
            seg["bbox"] = [min(seg["bbox"][0], ch["bbox"][0]), min(seg["bbox"][1], ch["bbox"][1]), max(seg["bbox"][2], ch["bbox"][2]), max(seg["bbox"][3], ch["bbox"][3])]
            prev_x1 = x1
    for seg in segs:
        seg["text"] = "".join(r[0] for r in seg["runs"]).strip()
    return segs


def _room_below(bbox, others, size, page_rect):
    """Freier Platz unter einem Block (bis zum nächsten Text darunter), damit längere Übersetzungen umbrechen statt zu schrumpfen."""
    x0, _, x1, y1 = bbox
    limit = page_rect.y1 - 20
    for o in others:
        if o[1] >= y1 - 0.5 and min(o[2], x1) - max(o[0], x0) > 1:
            limit = min(limit, o[1])
    return max(size * 0.3, min(limit - y1 - 1, size * 2.6))


def _room_side(bbox, others, vlines, margins, page_rect):
    """Freier Platz links und rechts einer einzelnen Zeile (bis zum nächsten Text, einer Zellgrenze oder dem Textrand)."""
    x0, y0, x1, y1 = bbox
    lm, rm = margins if margins else (page_rect.x0 + 20, page_rect.x1 - 20)
    left_lim = lm if x0 >= lm - 1 else page_rect.x0 + 20
    right_lim = rm if x1 <= rm + 1 else page_rect.x1 - 20
    for o in list(others) + [list(v) for v in vlines]:
        if min(o[3], y1) - max(o[1], y0) <= 1:
            continue  # nicht auf gleicher Höhe
        if o[0] >= x1 - 0.5:
            right_lim = min(right_lim, o[0])
        elif o[2] <= x0 + 0.5:
            left_lim = max(left_lim, o[2])
    return [round(max(0, x0 - left_lim - 2), 2), round(max(0, right_lim - x1 - 2), 2)]


def cmd_blocks(in_path, out_path):
    doc = open_pdf(in_path)
    blocks = []
    for pno, page in enumerate(doc.pages(0, min(doc.page_count, MAX_TRANSLATE_PAGES))):
        lines_art, vlines = _page_lines(page)
        raw = [b for b in page.get_text("rawdict", flags=pymupdf.TEXTFLAGS_TEXT)["blocks"] if b.get("type") == 0]
        all_boxes = [b["bbox"] for b in raw]
        margins = (min(b[0] for b in all_boxes), max(b[2] for b in all_boxes)) if all_boxes else None
        page_blocks = []
        for b in raw:
            lines = [l for l in b["lines"] if abs(l.get("dir", (1, 0))[1]) <= 0.01]
            segs = [_segments(l, lines_art, vlines) for l in lines]
            # Zeilen nebeneinander auf gleicher Höhe = Tabellenzellen oder Spalten
            side_by_side = any(
                abs((a["bbox"][1] + a["bbox"][3]) / 2 - (c["bbox"][1] + c["bbox"][3]) / 2) < (a["bbox"][3] - a["bbox"][1]) * 0.5
                for i, a in enumerate(lines) for c in lines[i + 1:]
            )
            if not side_by_side and all(len(s) <= 1 for s in segs):
                # Absatz: alle Zeilen gemeinsam übersetzen, damit der Satz zusammenhängt
                runs = []
                for s in segs:
                    if s:
                        if runs:
                            runs.append([" ", s[0]["runs"][0][1], False, False, []])
                        runs.extend(s[0]["runs"])
                unit = _unit(pno, b["bbox"], runs, lines_art, page.rect, [s[0]["bbox"] for s in segs if s], margins)
                if unit:
                    page_blocks.append(unit)
                continue
            # Tabelle oder Spalten: jede Zelle einzeln
            for line_segs in segs:
                for seg in line_segs:
                    unit = _unit(pno, seg["bbox"], seg["runs"], lines_art, page.rect, [])
                    if unit:
                        page_blocks.append(unit)
        for u in page_blocks:
            own = [pymupdf.Rect(r) for r in u["decos"]]
            rules = [list(r) for r in lines_art if not any(abs(r.y0 - o.y0) < 0.6 and abs(r.x0 - o.x0) < 0.6 for o in own)]
            others = [o for o in all_boxes if o != u["bbox"]] + [o["bbox"] for o in page_blocks if o is not u] + rules
            u["room"] = round(_room_below(u["bbox"], others, u["size"], page.rect), 2)
            if u.get("single"):
                u["side"] = _room_side(u["bbox"], [o for o in all_boxes if o != u["bbox"]] + [o["bbox"] for o in page_blocks if o is not u], vlines, margins, page.rect)
        blocks.extend(page_blocks)
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump({"blocks": blocks, "pageCount": doc.page_count, "maxPages": MAX_TRANSLATE_PAGES}, fh, ensure_ascii=False)


# ---------------------------------------------------------------------------- Schriften für die Übersetzung
def _fc_match(pattern):
    try:
        out = subprocess.run(["fc-match", "-f", "%{file}", pattern], capture_output=True, text=True, timeout=10).stdout.strip()
        return out if out and os.path.exists(out) else None
    except Exception:
        return None


def _covers(buf, chars):
    try:
        f = pymupdf.Font(fontbuffer=buf)
        return all(f.has_glyph(ord(c)) for c in chars)
    except Exception:
        return False


class Fonts:
    """Wählt je Schriftfamilie und Schnitt (normal/fett/kursiv) eine Schriftdatei:
    1. die im PDF eingebettete Schrift – wenn sie alle Zeichen der Übersetzung enthält (oft nur Teilmengen!),
    2. sonst eine metrisch gleiche Schrift vom Server (Arial → Liberation Sans, Calibri → Carlito, …)."""

    VARIANTS = {(False, False): "", (True, False): ":weight=200", (False, True): ":slant=100", (True, True): ":weight=200:slant=100"}

    def __init__(self, doc):
        self.doc = doc
        self.embedded = {}  # (Familie, fett, kursiv) → xref
        for pno in range(min(doc.page_count, MAX_TRANSLATE_PAGES)):
            for xref, ext, _type, basefont, *_ in doc.get_page_fonts(pno):
                if ext not in ("ttf", "otf", "cff"):
                    continue
                name = SUBSET.sub("", basefont)
                key = (_family(name), bool(re.search(r"bold|black|heavy|semibold|demi", name, re.I)), bool(re.search(r"italic|oblique", name, re.I)))
                self.embedded.setdefault(key, xref)
        self.archive = pymupdf.Archive()
        self.css = []
        self.families = {}

    def family_for(self, block, chars):
        fam = _family(block.get("font"))
        generic = "monospace" if block.get("mono") else ("serif" if block.get("serif") else "sans-serif")
        key = (fam, generic)
        if key in self.families:
            return self.families[key]
        css_name = f"F{len(self.families) + 1}"
        for (bold, italic), suffix in self.VARIANTS.items():
            buf, ext = None, "ttf"
            xref = self.embedded.get((fam, bold, italic))
            if xref:
                try:
                    _n, ext, _t, content = self.doc.extract_font(xref)
                    if content and _covers(content, chars):
                        buf = content
                except Exception:
                    buf = None
            if buf is None:
                path = _fc_match(f"{fam},{generic}{suffix}") or _fc_match(f"{generic}{suffix}")
                if not path:
                    continue
                with open(path, "rb") as fh:
                    content = fh.read()
                if not _covers(content, chars):
                    path = _fc_match(f"DejaVu {'Serif' if generic == 'serif' else 'Sans'}{suffix}")
                    if not path:
                        continue
                    with open(path, "rb") as fh:
                        content = fh.read()
                buf, ext = content, os.path.splitext(path)[1].lstrip(".") or "ttf"
            fname = f"{css_name}-{int(bold)}{int(italic)}.{ext}"
            self.archive.add(buf, fname)
            self.css.append(f"@font-face {{ font-family: {css_name}; src: url({fname}); font-weight: {'bold' if bold else 'normal'}; font-style: {'italic' if italic else 'normal'}; }}")
        self.families[key] = f"{css_name}, {generic}"
        return self.families[key]


ALLOWED = re.compile(r"&lt;(/?)([bius])&gt;")


def _html(translation):
    """Übersetzung sicher als HTML: alles maskieren, nur <b> <i> <u> <s> wieder erlauben – und zwar ausbalanciert:
    Ein vergessenes </u> der KI darf nicht den ganzen Rest unterstreichen, ein loses </b> wird ignoriert."""
    t = html.escape(html.unescape(translation), quote=False)
    out, pos, open_tags = [], 0, []
    for m in ALLOWED.finditer(t):
        out.append(t[pos:m.start()])
        pos = m.end()
        closing, tag = m.group(1) == "/", m.group(2)
        if not closing:
            if tag not in open_tags:
                open_tags.append(tag)
                out.append(f"<{tag}>")
        elif tag in open_tags:
            # innere Tags schließen, den gesuchten schließen, innere wieder öffnen
            idx = open_tags.index(tag)
            inner = open_tags[idx + 1:]
            out.append("".join(f"</{x}>" for x in reversed(inner)) + f"</{tag}>" + "".join(f"<{x}>" for x in inner))
            open_tags.pop(idx)
    out.append(t[pos:])
    out.append("".join(f"</{x}>" for x in reversed(open_tags)))
    return "".join(out)


def cmd_apply(in_path, blocks_path, out_path):
    doc = open_pdf(in_path)
    with open(blocks_path, encoding="utf-8") as fh:
        blocks = json.load(fh)["blocks"]
    by_page = {}
    for b in blocks:
        if b.get("translation"):
            by_page.setdefault(b["page"], []).append(b)
    fonts = Fonts(doc)
    # Alle Zeichen je Schriftfamilie sammeln, damit die gewählte Schrift sie sicher enthält
    chars = {}
    for b in blocks:
        if b.get("translation"):
            key = (_family(b.get("font")), b.get("mono"), b.get("serif"))
            chars.setdefault(key, set()).update(c for c in re.sub(r"<[^>]*>", "", html.unescape(b["translation"])) if not c.isspace())
    for pno, items in by_page.items():
        page = doc[pno]
        # 1) Originaltext entfernen (nur Text – Bilder, Linien und Hintergründe bleiben)
        for b in items:
            page.add_redact_annot(pymupdf.Rect(b["bbox"]), fill=False, cross_out=False)
        page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE, graphics=pymupdf.PDF_REDACT_LINE_ART_NONE)
        # 2) Unter-/Durchstreichungen entfernen – sie werden mit dem neuen Text neu gezeichnet
        decos = [r for b in items for r in b.get("decos", [])]
        if decos:
            for r in decos:
                page.add_redact_annot(pymupdf.Rect(r) + (-0.5, -0.5, 0.5, 0.5), fill=False, cross_out=False)
            page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE, graphics=pymupdf.PDF_REDACT_LINE_ART_REMOVE_IF_COVERED, text=pymupdf.PDF_REDACT_TEXT_NONE)
        # 3) Übersetzung in denselben Bereich setzen (plus freien Platz darunter); zu lange Texte werden verkleinert
        for b in items:
            rect = pymupdf.Rect(b["bbox"])
            rect.x1 += 2
            rect.y1 += b.get("room", max(1.0, b["size"] * 0.3))
            # einzelne Zeilen (Überschrift, Tabellenzelle): erst seitlich Platz nutzen, passend zur Ausrichtung
            left, right = b.get("side", [0, 0])
            align = b.get("align", "left")
            if align == "center":
                rect.x0 -= min(left, right)
                rect.x1 += min(left, right)
            elif align == "right":
                rect.x0 -= left
            else:
                rect.x1 += right
            family = fonts.family_for(b, chars.get((_family(b.get("font")), b.get("mono"), b.get("serif")), set()))
            deco = " ".join(x for x, on in (("underline", b.get("underline")), ("line-through", b.get("strike"))) if on) or "none"
            style = (
                f"font-family: {family}; font-size: {b['size']}px; color: {b.get('color', '#000000')}; text-align: {b.get('align', 'left')};"
                f" font-weight: {'bold' if b.get('bold') else 'normal'}; font-style: {'italic' if b.get('italic') else 'normal'};"
                f" text-decoration: {deco}; line-height: 1.15;"
            )
            def flat_lines():
                # alle waagerechten Linienstücke der Seite (MuPDF fasst Unterstreichungen zu einem Pfad zusammen)
                out = []
                for d in page.get_drawings():
                    for item in d["items"]:
                        if item[0] == "l" and abs(item[1].y - item[2].y) < 0.3:
                            out.append((round(item[1].x, 1), round(item[1].y, 1), round(item[2].x, 1), round(item[2].y, 1), d.get("width") or 0.7))
                        elif item[0] == "re" and item[1].height <= 2.5:
                            r = item[1]
                            out.append((round(r.x0, 1), round(r.y0, 1), round(r.x1, 1), round(r.y1, 1), -1))
                return out

            before = set(flat_lines()) if b.get("deco_color") else None
            page.insert_htmlbox(rect, f'<div style="{style}">{_html(b["translation"])}</div>', css="\n".join(fonts.css), archive=fonts.archive)
            if before is not None:
                # Die neue Unterstreichung hat die Textfarbe – in der Originalfarbe exakt darüber zeichnen
                col = tuple(int(b["deco_color"][i:i + 2], 16) / 255 for i in (1, 3, 5))
                for x0, y0, x1, y1, w in flat_lines():
                    if (x0, y0, x1, y1, w) in before or not rect.intersects(pymupdf.Rect(min(x0, x1), y0 - 1, max(x0, x1), y1 + 1)):
                        continue
                    if w < 0:
                        page.draw_rect(pymupdf.Rect(x0, y0, x1, y1), color=None, fill=col, width=0)
                    else:
                        page.draw_line((x0, y0), (x1, y1), color=col, width=w + 0.05)
    # Eingebettete Schriften auf die verwendeten Zeichen verkleinern – sonst wird aus 30 KB schnell mehrere MB
    try:
        doc.subset_fonts()
    except Exception:
        pass
    doc.save(out_path, garbage=4, deflate=True, deflate_fonts=True)


def cmd_report(html_path, title, out_path):
    with open(html_path, encoding="utf-8") as fh:
        body = fh.read()
    css = """
      * { font-family: sans-serif; color: #16213d; font-size: 11pt; line-height: 1.45; }
      h1 { font-size: 18pt; margin: 0 0 4pt 0; }
      .src { font-size: 9pt; color: #6b7389; margin: 0 0 16pt 0; }
      h2 { font-size: 13pt; margin: 14pt 0 4pt 0; color: #2b4bdb; }
      h3 { font-size: 11.5pt; margin: 10pt 0 3pt 0; }
      p { margin: 0 0 6pt 0; }
      li { margin: 0 0 3pt 0; }
      .note { font-size: 8.5pt; color: #6b7389; margin-top: 18pt; }
    """
    full = (
        f"<h1>Zusammenfassung</h1><p class='src'>{html.escape(title)}</p>{body}"
        "<p class='note'>Automatisch mit KI erstellt – wichtige Angaben bitte im Originaldokument prüfen.</p>"
    )
    story = pymupdf.Story(html=full, user_css=css)
    writer = pymupdf.DocumentWriter(out_path)
    mediabox = pymupdf.paper_rect("a4")
    where = mediabox + (56, 56, -56, -56)
    more = 1
    while more:
        dev = writer.begin_page(mediabox)
        more, _ = story.place(where)
        story.draw(dev)
        writer.end_page()
    writer.close()


def main():
    cmd = sys.argv[1]
    if cmd == "text":
        cmd_text(*sys.argv[2:4])
    elif cmd == "blocks":
        cmd_blocks(*sys.argv[2:4])
    elif cmd == "apply":
        cmd_apply(*sys.argv[2:5])
    elif cmd == "report":
        cmd_report(*sys.argv[2:5])
    else:
        print("unbekannter Befehl", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())

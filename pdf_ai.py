"""
Hilfsschritte für die KI-Werkzeuge (Zusammenfassen, Übersetzen). Die KI selbst ruft server/ai.js auf.

  python3 pdf_ai.py text    eingabe.pdf text.json           → {"pages": ["…", …]}
  python3 pdf_ai.py blocks  eingabe.pdf blocks.json         → Textblöcke mit Position und Stil (für die Übersetzung)
  python3 pdf_ai.py apply   eingabe.pdf blocks.json aus.pdf → übersetzte Blöcke an derselben Stelle einsetzen
  python3 pdf_ai.py report  inhalt.html titel aus.pdf       → Zusammenfassung als PDF
"""
import html
import json
import re
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


def _unit(pno, rect, texts, spans):
    text = " ".join(t.strip() for t in texts if t.strip())
    flat = [s for s in spans if _span_text(s).strip()]
    if not flat or not re.search(r"[^\W\d_]{2,}", text):
        return None  # nur Blöcke mit Wörtern übersetzen (Zahlen, Datumsangaben usw. bleiben)
    sizes = {}
    for s in flat:
        sizes[round(s["size"], 1)] = sizes.get(round(s["size"], 1), 0) + len(_span_text(s))
    best = max(flat, key=lambda s: len(_span_text(s)))
    return {
        "page": pno,
        "bbox": [round(v, 2) for v in rect],
        "text": text,
        "size": max(sizes, key=sizes.get),
        "color": "#%06x" % int(best.get("color", 0)),
        "bold": bool(best["flags"] & 16),
        "italic": bool(best["flags"] & 2),
        "serif": bool(best["flags"] & 4),
    }


def _segments(line):
    """Teile einer Zeile, die durch große Lücken getrennt sind (z. B. Tabellenzellen) – zeichengenau."""
    segs = []
    prev_x1 = None
    for span in line["spans"]:
        for ch in span.get("chars", []):
            c = ch["c"]
            if c.isspace():
                if segs and segs[-1]["text"] and not segs[-1]["text"].endswith(" "):
                    segs[-1]["text"] += " "
                continue
            x0, x1 = ch["bbox"][0], ch["bbox"][2]
            if not segs or prev_x1 is None or x0 - prev_x1 > span["size"] * 0.9:
                segs.append({"text": "", "bbox": list(ch["bbox"]), "spans": []})
            seg = segs[-1]
            seg["text"] += c
            seg["bbox"] = [min(seg["bbox"][0], ch["bbox"][0]), min(seg["bbox"][1], ch["bbox"][1]), max(seg["bbox"][2], ch["bbox"][2]), max(seg["bbox"][3], ch["bbox"][3])]
            if not seg["spans"] or seg["spans"][-1] is not span:
                seg["spans"].append(span)
            prev_x1 = x1
    for seg in segs:
        seg["text"] = seg["text"].strip()
    return segs


def cmd_blocks(in_path, out_path):
    doc = open_pdf(in_path)
    blocks = []
    for pno, page in enumerate(doc.pages(0, min(doc.page_count, MAX_TRANSLATE_PAGES))):
        for b in page.get_text("rawdict", flags=pymupdf.TEXTFLAGS_TEXT)["blocks"]:
            if b.get("type") != 0:
                continue
            lines = [l for l in b["lines"] if abs(l.get("dir", (1, 0))[1]) <= 0.01]
            segs = [_segments(l) for l in lines]
            # Zeilen nebeneinander auf gleicher Höhe = Tabellenzellen oder Spalten
            side_by_side = any(
                abs((a["bbox"][1] + a["bbox"][3]) / 2 - (b["bbox"][1] + b["bbox"][3]) / 2) < (a["bbox"][3] - a["bbox"][1]) * 0.5
                for i, a in enumerate(lines) for b in lines[i + 1:]
            )
            if not side_by_side and all(len(s) <= 1 for s in segs):
                # Absatz: alle Zeilen gemeinsam übersetzen, damit der Satz zusammenhängt
                unit = _unit(pno, b["bbox"], [s[0]["text"] for s in segs if s], [sp for s in segs if s for sp in s[0]["spans"]])
                if unit:
                    blocks.append(unit)
                continue
            # Tabelle oder Spalten: jede Zelle einzeln
            for line_segs in segs:
                for seg in line_segs:
                    unit = _unit(pno, seg["bbox"], [seg["text"]], seg["spans"])
                    if unit:
                        blocks.append(unit)
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump({"blocks": blocks, "pageCount": doc.page_count, "maxPages": MAX_TRANSLATE_PAGES}, fh, ensure_ascii=False)


def cmd_apply(in_path, blocks_path, out_path):
    doc = open_pdf(in_path)
    with open(blocks_path, encoding="utf-8") as fh:
        blocks = json.load(fh)["blocks"]
    by_page = {}
    for b in blocks:
        if b.get("translation"):
            by_page.setdefault(b["page"], []).append(b)
    for pno, items in by_page.items():
        page = doc[pno]
        # 1) Originaltext entfernen (nur Text – Bilder, Linien und Hintergründe bleiben)
        for b in items:
            page.add_redact_annot(pymupdf.Rect(b["bbox"]), fill=False, cross_out=False)
        page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE, graphics=pymupdf.PDF_REDACT_LINE_ART_NONE)
        # 2) Übersetzung in denselben Bereich setzen; zu lange Texte werden automatisch verkleinert
        for b in items:
            rect = pymupdf.Rect(b["bbox"])
            rect.x1 += 2
            rect.y1 += max(1.0, b["size"] * 0.3)
            style = (
                f"font-family: {'serif' if b.get('serif') else 'sans-serif'}; font-size: {b['size']}px; color: {b.get('color', '#000000')};"
                f" font-weight: {'bold' if b.get('bold') else 'normal'}; font-style: {'italic' if b.get('italic') else 'normal'}; line-height: 1.15;"
            )
            page.insert_htmlbox(rect, f'<div style="{style}">{html.escape(b["translation"])}</div>')
    doc.save(out_path, garbage=3, deflate=True)


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

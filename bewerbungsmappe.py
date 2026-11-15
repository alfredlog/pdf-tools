"""
Bewerbungsmappe: Deckblatt (optional), Dokumente in der gewählten Reihenfolge, Seitenzahlen (optional),
und eine Dateigröße unter der gewünschten Grenze.

Aufruf: python3 bewerbungsmappe.py spec.json ausgabe.pdf

spec.json:
{
  "files": [{"path": "...", "kind": "pdf" | "image", "label": "Lebenslauf"}],
  "cover": {"name": "...", "position": "...", "company": "...", "email": "...", "phone": "...", "address": "..."} | null,
  "pageNumbers": true,
  "maxMb": 5            # 0 = keine Grenze
}
"""
import html
import json
import os
import sys

import pymupdf

A4 = pymupdf.paper_rect("a4")
MARGIN = 36


def add_image(out, path):
    page = out.new_page(width=A4.width, height=A4.height)
    page.insert_image(A4 + (MARGIN, MARGIN, -MARGIN, -MARGIN), filename=path, keep_proportion=True)


def add_cover(out, cover, labels):
    page = out.new_page(width=A4.width, height=A4.height)
    e = lambda key: html.escape(str(cover.get(key) or "").strip())
    contact = " · ".join(x for x in (e("address"), e("email"), e("phone")) if x)
    content = "".join(f"<li>{html.escape(label)}</li>" for label in labels if label)
    position = f"<p class='pos'>als {e('position')}</p>" if e("position") else ""
    company = f"<p class='company'>bei {e('company')}</p>" if e("company") else ""
    top = f"""<p class="kicker">BEWERBUNG</p>{position}{company}"""
    bottom = f"""
      <p class="name">{e('name')}</p>
      <p class="contact">{contact}</p>
      {'<p class="toc-title">INHALT</p><ol>' + content + '</ol>' if content else ''}
    """
    css = """
      * { font-family: sans-serif; color: #16213d; }
      .kicker { font-size: 12px; color: #2b4bdb; margin: 0 0 12px 0; font-weight: bold; }
      .pos { font-size: 28px; font-weight: bold; margin: 0 0 6px 0; }
      .company { font-size: 18px; margin: 0; color: #4a5470; }
      .name { font-size: 22px; font-weight: bold; margin: 0 0 6px 0; }
      .contact { font-size: 12px; color: #4a5470; margin: 0 0 56px 0; }
      .toc-title { font-size: 11px; font-weight: bold; margin: 0 0 6px 0; color: #4a5470; }
      ol { font-size: 13px; margin: 0; padding-left: 18px; }
      li { margin: 0 0 4px 0; }
    """
    x0, x1 = 72, A4.width - 72
    spare, _ = page.insert_htmlbox(pymupdf.Rect(x0, 190, x1, 400), top, css=css)
    y = 400 - max(0, spare) + 26
    page.draw_line((x0, y), (x0 + 70, y), color=(0.17, 0.29, 0.86), width=2)
    page.insert_htmlbox(pymupdf.Rect(x0, y + 26, x1, A4.height - 72), bottom, css=css)


def number_pages(out, skip):
    total = out.page_count - skip
    for i, page in enumerate(out):
        if i < skip:
            continue
        text = f"Seite {i - skip + 1} von {total}"
        r = page.rect
        width = pymupdf.get_text_length(text, fontname="helv", fontsize=9)
        page.insert_text((r.width - 36 - width, r.height - 22), text, fontname="helv", fontsize=9, color=(0.42, 0.45, 0.52))


def save_under(out, path, max_mb):
    """Speichern; ist die Datei zu groß, Bilder schrittweise verkleinern."""
    out.save(path, garbage=3, deflate=True)
    if not max_mb or os.path.getsize(path) <= max_mb * 1024 * 1024:
        return
    for threshold, target, quality in ((220, 150, 82), (160, 120, 70), (120, 96, 60)):
        try:
            out.rewrite_images(dpi_threshold=threshold, dpi_target=target, quality=quality)
        except Exception:
            break
        out.save(path, garbage=4, deflate=True)
        if os.path.getsize(path) <= max_mb * 1024 * 1024:
            return


def main():
    spec_path, out_path = sys.argv[1:3]
    with open(spec_path, encoding="utf-8") as fh:
        spec = json.load(fh)
    files = spec.get("files", [])[:40]
    out = pymupdf.open()
    cover = spec.get("cover")
    if cover and any(str(v or "").strip() for v in cover.values()):
        add_cover(out, cover, [f.get("label", "") for f in files])
    skip = out.page_count
    for f in files:
        path = f.get("path", "")
        if not os.path.isfile(path):
            continue
        if f.get("kind") == "image":
            add_image(out, path)
        else:
            src = pymupdf.open(path)
            if src.needs_pass:
                print("password", file=sys.stderr)
                return 3
            out.insert_pdf(src)
    if out.page_count == skip:
        print("Keine Seiten", file=sys.stderr)
        return 2
    if spec.get("pageNumbers"):
        number_pages(out, skip)
    out.set_metadata({"title": "Bewerbung" + (f" – {cover.get('name')}" if cover and cover.get("name") else ""), "producer": "PDF Libre"})
    save_under(out, out_path, float(spec.get("maxMb") or 0))
    return 0


if __name__ == "__main__":
    sys.exit(main())

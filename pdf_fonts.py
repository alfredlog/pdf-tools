"""
Schriften einer PDF für die Vorschau im Editor.

Aufruf: python3 pdf_fonts.py eingabe.pdf ausgabe.json

Für jede Schrift: eingebettete Schrift (falls der Browser sie nutzen kann) mit ihren Zeichen,
und die Ersatzschriften (normal/fett/kursiv), die auch der Export verwendet. So sieht die Vorschau
auf jedem Gerät so aus wie die fertige PDF – unabhängig von den Schriften auf dem Computer.
"""
import base64
import json
import sys

import pymupdf

from pdf_edit import family_of, strip_subset, style_of, system_font_path, usable_font

MAX_PAGES = 500
MAX_EMBED = 3 * 1024 * 1024  # größere eingebettete Schriften nicht an den Browser schicken


def main():
    in_path, out_path = sys.argv[1:3]
    doc = pymupdf.open(in_path)
    if doc.needs_pass:
        print("password", file=sys.stderr)
        return 3
    fonts = {}
    for page in doc.pages(0, min(doc.page_count, MAX_PAGES)):
        for xref, ext, _type, basefont, *_ in page.get_fonts(full=True):
            name = strip_subset(basefont)
            if not name or name in fonts:
                continue
            generic, bold, italic = style_of(name)
            family = family_of(name)
            info = {"family": family, "generic": generic, "bold": bold, "italic": italic, "embedded": None, "codepoints": [], "fallback": {}}
            usable = usable_font(doc, xref, basefont) if ext not in ("n/a", "") else None
            if usable and len(usable[0]) <= MAX_EMBED:
                info["embedded"] = base64.b64encode(usable[0]).decode("ascii")
                info["codepoints"] = usable[1]
            for b in (False, True):
                for i in (False, True):
                    path = system_font_path(family, generic, b, i)
                    if path:
                        info["fallback"][f"{'bold' if b else 'normal'}-{'italic' if i else 'normal'}"] = path
            fonts[name] = info
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump({"fonts": fonts}, fh)
    return 0


if __name__ == "__main__":
    sys.exit(main())

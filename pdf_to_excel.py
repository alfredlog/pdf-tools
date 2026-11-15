"""
PDF → Excel: Tabellen aus der PDF als Tabellenblätter, Seiten ohne Tabelle als Text.

Aufruf: python3 pdf_to_excel.py eingabe.pdf ausgabe.xlsx
"""
import re
import sys

import pymupdf
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

MAX_PAGES = 200

DE_THOUSANDS = re.compile(r"^-?\d{1,3}(\.\d{3})+(,\d+)?$")
DE_DECIMAL = re.compile(r"^-?\d+,\d+$")
EN_THOUSANDS = re.compile(r"^-?\d{1,3}(,\d{3})+(\.\d+)?$")
PLAIN = re.compile(r"^-?\d+(\.\d+)?$")


def to_value(cell):
    """Zahlen als echte Zahlen speichern (deutsches Format zuerst), alles andere als Text."""
    if cell is None:
        return None
    text = str(cell).replace("\n", " ").strip()
    if not text:
        return None
    s = text.replace(" ", "").replace(" ", "")
    try:
        if DE_THOUSANDS.match(s):
            return float(s.replace(".", "").replace(",", "."))
        if DE_DECIMAL.match(s):
            return float(s.replace(",", "."))
        if EN_THOUSANDS.match(s):
            return float(s.replace(",", ""))
        if PLAIN.match(s) and not (len(s) > 1 and s.startswith("0") and "." not in s):  # 0049… bleibt Text
            return int(s) if "." not in s else float(s)
    except ValueError:
        pass
    return text


def write_rows(ws, rows, header=True):
    for r, row in enumerate(rows, start=1):
        for c, cell in enumerate(row, start=1):
            value = to_value(cell)
            if value is None:
                continue
            target = ws.cell(row=r, column=c, value=value)
            if isinstance(value, float) and not value.is_integer():
                target.number_format = "#,##0.00"
            if header and r == 1:
                target.font = Font(bold=True)
                target.fill = PatternFill("solid", fgColor="E8EDFB")
            target.alignment = Alignment(vertical="top", wrap_text=isinstance(value, str) and len(value) > 40)
    # Spaltenbreite an den Inhalt anpassen
    for col in ws.columns:
        width = max((len(str(c.value)) for c in col if c.value is not None), default=8)
        ws.column_dimensions[get_column_letter(col[0].column)].width = min(60, max(8, width + 2))
    ws.freeze_panes = "A2" if header and ws.max_row > 1 else None


def page_tables(page):
    """Tabellen mit Linien (zuverlässig erkannt von PyMuPDF)."""
    try:
        return [t for t in page.find_tables().tables if t.row_count >= 2 and t.col_count >= 2]
    except Exception:
        return []


def text_grid(page, skip_rects=()):
    """Text ohne Tabellenlinien als Raster: Zeilen nach Höhe; Spaltengrenzen sind senkrechte Lücken,
    die in allen Zeilen frei sind und in mehreren Zeilen Wörter voneinander trennen."""
    words = [w for w in page.get_text("words") if not any(pymupdf.Rect(w[:4]).intersects(r) for r in skip_rects)]
    if not words:
        return []
    rows = []
    for w in sorted(words, key=lambda w: (w[3], w[0])):
        h = w[3] - w[1]
        if rows and abs(rows[-1]["y"] - w[3]) < h * 0.5:
            rows[-1]["words"].append(w)
        else:
            rows.append({"y": w[3], "words": [w]})
    for r in rows:
        r["words"].sort(key=lambda w: w[0])

    # Lücken in der Vereinigung aller Wortbereiche
    spans = sorted((w[0], w[2]) for w in words)
    gaps, end = [], spans[0][1]
    for x0, x1 in spans[1:]:
        if x0 - end >= 1.5:
            gaps.append((end, x0))
        end = max(end, x1)
    multi = [r for r in rows if len(r["words"]) >= 2]
    need = max(2, int(len(multi) * 0.3))
    bounds = []
    for g0, g1 in gaps:
        support = 0
        for r in multi:
            left = any(g0 - 40 <= w[2] <= g0 + 0.1 for w in r["words"])
            right = any(g1 - 0.1 <= w[0] <= g1 + 40 for w in r["words"])
            support += left and right
        if support >= need:
            bounds.append((g0 + g1) / 2)

    out = []
    for r in rows:
        line = [None] * (len(bounds) + 1)
        for w in r["words"]:
            idx = sum(1 for b in bounds if (w[0] + w[2]) / 2 > b)
            line[idx] = w[4] if line[idx] is None else line[idx] + " " + w[4]
        out.append(line)
    keep = [i for i in range(len(bounds) + 1) if any(r[i] for r in out)]
    return [[r[i] for i in keep] for r in out]


def main():
    in_path, out_path = sys.argv[1:3]
    doc = pymupdf.open(in_path)
    if doc.needs_pass:
        print("password", file=sys.stderr)
        return 3
    wb = Workbook()
    wb.remove(wb.active)
    for i, page in enumerate(doc.pages(0, min(doc.page_count, MAX_PAGES)), start=1):
        tables = page_tables(page)
        for j, t in enumerate(tables, start=1):
            rows = [[page.get_textbox(pymupdf.Rect(c)).strip() if c else None for c in row.cells] for row in t.rows]
            rows = [row for row in rows if any(c not in (None, "") for c in row)]
            if rows:
                name = f"Seite {i}" if len(tables) == 1 else f"Seite {i} Tabelle {j}"
                write_rows(wb.create_sheet(title=name[:31]), rows)
        # übriger Text der Seite (oder Tabellen ohne Linien) als Raster
        rest = text_grid(page, [t.bbox and pymupdf.Rect(t.bbox) for t in tables])
        if rest:
            name = f"Seite {i}" if not tables else f"Seite {i} Text"
            write_rows(wb.create_sheet(title=name[:31]), rest, header=not tables and len(rest[0]) > 1)
    if not wb.sheetnames:
        write_rows(wb.create_sheet(title="Leer"), [["In dieser PDF wurde kein Text gefunden (gescannte Seiten?)."]], header=False)
    wb.save(out_path)
    return 0


if __name__ == "__main__":
    sys.exit(main())

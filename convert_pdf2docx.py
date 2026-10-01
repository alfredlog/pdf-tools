"""PDF -> DOCX. Aufruf: python3 convert_pdf2docx.py eingabe.pdf ausgabe.docx"""
import logging
import sys

from pdf2docx import Converter

logging.disable(logging.WARNING)  # pdf2docx ist sonst sehr gesprächig


def main() -> int:
    if len(sys.argv) != 3:
        print("Aufruf: convert_pdf2docx.py <eingabe.pdf> <ausgabe.docx>", file=sys.stderr)
        return 2
    cv = Converter(sys.argv[1])
    try:
        cv.convert(sys.argv[2], start=0, end=None)
    finally:
        cv.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())

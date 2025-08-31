import sys
from pdf2docx import Converter

pdf_file = sys.argv[1]
docx_file = sys.argv[2]

cv = Converter(pdf_file)
cv.convert(docx_file, start=0, end=None)
cv.close()

"""
Setzt in einer PPTX-Datei überall einen weißen Hintergrund, wo keiner definiert ist (Folienmaster, Layouts, Folien).

Hintergrund: PDFs aus LaTeX/Beamer zeichnen keinen weißen Seitenhintergrund. Nach der Umwandlung haben die Folien
dann gar keinen Hintergrund – PowerPoint zeigt Weiß, Keynote aber Schwarz.

Aufruf: python3 pptx_white_bg.py datei.pptx   (wird direkt geändert)
"""
import re
import shutil
import sys
import zipfile

BG = '<p:bg><p:bgPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>'
TARGET = re.compile(r"^ppt/(slideMasters/slideMaster|slideLayouts/slideLayout|slides/slide)\d+\.xml$")


def fix(xml):
    if "<p:bg>" in xml:
        return xml
    # <p:bg> muss das erste Element innerhalb von <p:cSld> sein
    return re.sub(r"(<p:cSld(?:\s[^>]*)?>)", r"\1" + BG, xml, count=1)


def main():
    path = sys.argv[1]
    tmp = path + ".tmp"
    with zipfile.ZipFile(path) as src, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as out:
        for item in src.infolist():
            data = src.read(item.filename)
            if TARGET.match(item.filename):
                data = fix(data.decode("utf-8")).encode("utf-8")
            out.writestr(item, data)
    shutil.move(tmp, path)
    return 0


if __name__ == "__main__":
    sys.exit(main())

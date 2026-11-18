// English SEO articles below each tool: slug -> [[heading, paragraph, paragraph …], …]
module.exports = {
  bewerbungsmappe: [
    ["Why a single PDF?", "HR departments and application portals usually expect one single PDF file, and many portals only allow 2 or 5 MB. With this tool you don’t have to jump between Word, a scanner app and a compression website: everything is merged, sorted and reduced in one step."],
    ["The right order of your application documents", "A proven order is: cover page (optional), cover letter, CV, then references – the most recent job reference first, followed by university and school certificates – and finally certificates and proof of qualifications. Give your files meaningful names (e.g. “CV” instead of “Scan_0042”), because the file names appear in the table of contents on the cover page."],
    ["Create your application PDF online – for any kind of application", "Whether you apply for an apprenticeship, an internship, a working student job, a part-time job, a dual study programme or a permanent position: a complete application as one PDF is the standard today. For unsolicited applications, university admissions or scholarships you usually need one clear PDF file as well.", "The application PDF tool from PDF Libre runs entirely online in your browser – on PC, Mac, tablet and phone. No software to install and no account to create."],
    ["What belongs in a job application?", "A cover letter and a CV are required. Add the proof that fits the position: job references, degree or vocational certificates, your last school report (especially for apprenticeships), language certificates, further training and internship confirmations. A cover page and an extra motivation page are optional."],
  ],
  merge: [
    ["When does merging PDFs make sense?", "Job applications, tax documents, invoices or scans often consist of many separate files. One single PDF is easier to send, can be printed in one go and doesn’t get lost among email attachments. Many online portals also accept only one file per upload.", "A typical example is a job application: cover letter, CV and certificates are created as separate PDFs and combined into one document at the end."],
    ["What happens to content and quality?", "When merging, pages are only rearranged, not re-rendered. Text stays searchable, images keep their resolution and links keep working. The page size of each document is preserved – a landscape page stays landscape.", "If the finished file is too large for email, use “Compress PDF” afterwards, or go straight to “Merge & compress”."],
  ],
  split: [
    ["How to enter page ranges", "Separate ranges with commas. “1-3” means pages 1 to 3, a single number stands for exactly one page. So “1-3, 4-6, 7” creates three files. Ranges may overlap if a page should appear in several parts.", "If you only want to pull out a few pages, “Extract pages” is often faster: there you simply click the pages in the preview."],
    ["Why in the browser?", "Splitting doesn’t require re-processing the content, so your browser can do it by itself. The PDF is never sent to our server. That is faster – and the safest option for confidential documents such as contracts or bank statements."],
  ],
  organize: [
    ["Put scanned documents in order", "With a sheet-feed scanner, pages easily end up in the wrong order or upside down. In the page view you see at a glance what’s wrong and fix it right away, without scanning the document again."],
    ["Tips for long documents", "With many pages it helps to delete first and sort afterwards. If you want to combine pages from several files, merge them first with “Merge PDF” and then organize the result."],
  ],
  rotate: [
    ["Rotate permanently, not just in the viewer", "Many PDF viewers only rotate pages in the current view – the next time you open the file, or on the recipient’s screen, the page is sideways again. Here the orientation is saved in the file and applies everywhere: on screen, when printing and on a phone."],
  ],
  "remove-pages": [
    ["Typical use cases", "Scanned documents often contain blank back pages, presentations have slides that aren’t relevant for a particular recipient, and bank statements include pages with ads. Instead of recreating the file, you remove exactly the pages you don’t need."],
    ["Select pages by click or by number", "Marked pages get a red frame. For long documents typing is faster: “2, 5-7” removes pages 2, 5, 6 and 7. You can combine both ways."],
  ],
  "extract-pages": [
    ["Extract or split?", "When extracting, you pick specific pages – for example the signature page of a contract or a particular chapter. Splitting, on the other hand, cuts the whole document into several pieces. For “I only need pages 4 and 12”, extracting is the shorter way."],
  ],
  compress: [
    ["How does compression work?", "Most large PDFs are large because they contain high-resolution images or scans. Compression brings these images to a sensible resolution, merges duplicate embedded content and rebuilds the file. Text stays text – it is not turned into an image and stays sharp and searchable."],
    ["Which level is right?", "“Recommended” reduces images to about 150 dpi. That is enough for screen viewing and normal printing. “Strong” goes to about 72 dpi and is useful when a portal allows, say, 2 MB at most. “Low” keeps print quality (300 dpi) and mainly helps with files that were saved unnecessarily large.", "If a PDF contains almost only text, it is usually small already. In that case you get your original back instead of a file that would hardly be smaller – or even larger."],
  ],
  "merge-compress": [
    ["Ideal for job applications", "Many companies and application portals want one PDF with cover letter, CV and certificates – and often limit the size to 5 or 10 MB. Scanned certificates quickly exceed that limit. With this tool you handle both in one step."],
  ],
  ocr: [
    ["What is OCR?", "OCR stands for “optical character recognition”. To a computer, a scan or a phone photo is just an image – you can’t search it or copy text from it. OCR recognizes the letters in the image and places the recognized text invisibly over the page. The original stays unchanged, yet search, selection and copying work."],
    ["Why do you need a searchable PDF?", "For a paperless office and digital filing, to quickly find a passage in old contracts, bank statements and letters, to reuse text from a scan in Word – and because many authorities, accountants and application portals prefer searchable PDFs. Screen readers can also only read PDFs that have a text layer, so OCR makes documents more accessible."],
    ["Tips for good text recognition", "Scan at 300 dpi or more, straight and without shadows. For phone photos, good daylight helps. Handwriting is only recognized to a limited extent; printed text in German, English and French works very reliably. Pages that already contain text are left unchanged."],
  ],
  "page-numbers": [
    ["Page numbers for essays and theses", "Many universities require the title page and table of contents to have no visible page number. “First pages without number” skips these pages. With “First number” you set where counting begins – so the introduction can start at page 1 even though it is the third page of the file."],
  ],
  watermark: [
    ["Protect ID copies and documents", "If you have to send copies of your ID, certificates or contracts, a watermark stating the purpose and recipient helps – for example “Copy for flat application at Example Ltd.”. If the copy ends up in the wrong hands, it is much harder to misuse for other purposes.", "The option “Across the whole page” repeats the text several times so it can’t simply be cropped away."],
  ],
  "docx-to-pdf": [
    ["DOCX to PDF – without Word, on any device", "You don’t need Microsoft Word to convert a DOCX file to PDF. PDF Libre does the conversion in your browser – on Windows, Mac, Linux, Chromebook, Android and iPhone. That’s handy when you received a DOCX by email and need to forward it as a PDF, print it or upload it to an application portal.", "Margins, headers and footers, tables, images and page breaks from the DOCX file are carried over into the PDF. Headings and links are kept, and the text stays searchable and copyable."],
    ["Why send a PDF instead of Word?", "A Word document looks slightly different on every computer – depending on the Word version and installed fonts, line breaks, tables or images shift. A PDF looks the same everywhere. The recipient also can’t change the content by accident."],
    ["Tips for a perfect result", "Use common fonts such as Arial, Calibri or Times New Roman. Rare fonts that aren’t embedded in the file are replaced by a similar font during conversion. So take a quick look at the PDF before sending it."],
  ],
  "jpg-to-pdf": [
    ["Turn phone photos into a real document", "Receipts for your tax return, worksheets or signed forms are often just photographed with a phone. As loose images, though, they are impractical. In a PDF all pages are together in the right order and can be sent and printed like a document.", "With “Automatic”, every page is oriented the way the image was taken – landscape photos get a landscape page."],
  ],
  "heic-to-pdf": [
    ["What is HEIC?", "HEIC (High Efficiency Image Container) is the default photo format on iPhone and iPad. It saves a lot of storage, but many websites, government portals and Windows programs don’t support it. If you photographed a document, an ID, a receipt or a certificate with your iPhone, a PDF is usually the easiest solution."],
    ["iPhone photos as PDF for jobs, university and authorities", "Whether it’s a sick note for your employer, proof for your university, receipts for your tax return or documents for the town hall: this tool converts several photos into one single PDF in one step. Landscape photos get a landscape page, everything else is placed on portrait A4."],
  ],
  "excel-to-pdf": [
    ["How to make your spreadsheet easy to read", "The conversion uses the print settings of your Excel file. Otherwise wide tables are spread over several pages. So set landscape orientation in Excel under “Page Layout” beforehand, or choose “Fit sheet on one page” – then the PDF looks exactly as you expect.", "If a print area is defined, only that area is converted."],
  ],
  "ppt-to-pdf": [
    ["Share presentations safely", "As a PDF, a presentation opens on any device, is much smaller than the original file and can’t be edited by accident. That’s useful for handouts after a talk, for university submissions or when the recipient doesn’t have PowerPoint.", "Animations and transitions don’t play in a PDF – every slide appears in its final state. Embedded videos are shown as a still image."],
  ],
  pdfa: [
    ["What is PDF/A?", "PDF/A is a standardized form of PDF (ISO 19005) for long-term archiving. A PDF/A file contains everything it needs to be displayed – fonts, color profile, images – and avoids things that could cause problems later, such as external content or encryption. That way the document will still look exactly the same in 20 years."],
    ["Where is PDF/A required?", "At courts and in electronic legal communication, at many authorities and public offices, for tenders, grant applications and university theses, and for audit-proof archiving of business records (in Germany under GoBD). The German ZUGFeRD e-invoice format is also based on PDF/A-3."],
    ["PDF/A-1b, 2b or 3b?", "PDF/A-2b is the standard today and supports transparency and modern compression. PDF/A-1b is the oldest and strictest version – only choose it if it is explicitly required. PDF/A-3b additionally allows embedded files. The “b” stands for “basic”: the visual appearance of the document is permanently preserved."],
  ],
  "pdf-to-docx": [
    ["What is carried over?", "The conversion detects paragraphs, headings, tables and images and builds a Word document with real flowing text. Font sizes, bold text and colors are kept. Elaborate layouts with many columns or text boxes may need some touching up."],
    ["Important for scanned PDFs", "To a computer, a scanned page is just a photo. Without text recognition (OCR) it ends up as an image in the Word document and the text can’t be edited. You can tell whether your PDF contains real text by trying to select and copy text in it."],
  ],
  "pdf-to-excel": [
    ["What is PDF to Excel useful for?", "Bank statements for budgeting, supplier price lists, tables from studies or reports: retyping takes time and causes errors. The tool detects rows and columns and turns number formats such as “1,234.56” or the German “1.234,56” into real numbers."],
    ["Limits", "It works best with PDFs created by a program (e.g. online banking, Word, Excel). Scanned pages are images without text and can’t be converted. For very complex tables with merged cells, a quick check of the result is worthwhile."],
  ],
  "pdf-to-jpg": [
    ["JPG or PNG?", "JPG suits photos and mixed content and produces small files. PNG is lossless and the better choice for graphics, charts and text-heavy pages, because edges stay sharp. For Instagram or LinkedIn, JPG at normal resolution is enough."],
  ],
  summarize: [
    ["Understand official letters and contracts", "Official notices, reminders, rental contracts or insurance terms are often long and complicated – especially if they aren’t written in your first language. The summary explains in plain words what it’s about and lists deadlines, amounts and required steps under “What do I need to do?”. You can have the summary written directly in English, French, Turkish and other languages."],
    ["Study with lecture notes and papers", "For university and school, “Detailed” summarizes a script section by section – ideal for revising before an exam. Very long documents are read in parts and then combined into one overall summary."],
  ],
  translate: [
    ["Translate without destroying the layout", "If you copy a PDF into a translation program, you lose tables, images and formatting. Here the page stays as it is: only the text is replaced. That works well for letters, forms, manuals, certificates you want to understand and documents for family or colleagues.", "Note: for official documents, authorities usually require a certified translation. The AI translation helps you understand a document but doesn’t replace one."],
  ],
  protect: [
    ["How to choose a good password", "The longer, the better: a phrase made of several words like “Blue-Harbour-Coffee-42” is harder to crack than a short password with special characters – and still easy to remember. Don’t use a password you already use for email or online banking.", "Important: we don’t store your password. If you forget it, nobody can open the file again – so keep the unprotected original."],
    ["How secure is the protection?", "The file is encrypted with the 128-bit standard that all common PDF programs can open – Adobe Reader, browsers, Preview on Mac and smartphones. That is sufficient for sending invoices, payslips or application documents."],
  ],
  redact: [
    ["Real redaction instead of just painting over", "A black box simply placed over text in a PDF program is not real redaction: the text underneath remains and can be copied or extracted. PDF Libre actually deletes the text in the redacted areas from the file and also blacks out affected image areas. After that, the information can’t be recovered."],
    ["When should you redact a PDF?", "Before passing on documents that contain other people’s data or more than necessary: bank statements for a flat application, payslips, contracts, medical letters, court documents or documents for publication. Redacting helps you show only what is needed – in line with the data minimization principle of the GDPR."],
    ["Redact scanned documents", "The search only works if the PDF contains real text. For a scan, convert the file first with “Make PDF searchable (OCR)” and redact it afterwards."],
  ],
  unlock: [
    ["What is this for?", "Bank statements, payslips or tax notices often arrive password-protected. If you want to archive them, merge them or pass them on to your accountant, the password is a nuisance. With this tool you save a copy without protection.", "The tool doesn’t crack passwords. You must know the password – only unlock files that belong to you or that you are authorized to use."],
  ],
  "xrechnung-anzeigen": [
    ["Why can’t I simply open an XRechnung?", "An XRechnung (the German standard for e-invoices) is not an image file but a structured data record in XML format. Accounting software reads it automatically; in a browser or text editor you only see code. Since 2025 all companies in Germany must be able to receive such e-invoices – but many small businesses don’t have suitable software yet.", "This tool reads the data and displays it as a normal invoice: issuer, recipient, line items, VAT, amount due and bank details."],
    ["What about ZUGFeRD and Factur-X?", "ZUGFeRD and Factur-X invoices are PDFs that also contain an embedded XML file. In rare cases the visible PDF and the data can differ. The tool reads the embedded data – exactly what accounting software processes."],
  ],
  "e-rechnung-pruefen": [
    ["What is checked?", "The tool recalculates the invoice: do the line items add up to the total, does the VAT match the tax rate, does net plus tax give the gross amount, and is the amount due correct? It also checks mandatory details such as invoice number, date and the issuer’s tax number, and verifies the IBAN for typos.", "The full check against the official XRechnung rules is done with the KoSIT validator when it is available on the server. The report shows whether this check was carried out."],
    ["When do I have to send e-invoices in Germany?", "All companies in Germany have had to be able to receive e-invoices since 1 January 2025. For sending: companies with more than €800,000 turnover in the previous year from 1 January 2027, all others from 1 January 2028. Exceptions include small invoices up to €250 and invoices to private individuals. If in doubt, ask your tax advisor."],
  ],
};

// English versions of the job application guides (same slugs as German, so hreflang links match)
module.exports = {
  "factur-x-oeffnen": {
    "guide": "Open a Factur-X invoice (France)",
    "name": "Open Factur-X",
    "title": "Open Factur-X – read and check French e-invoices, free | PDF Libre",
    "description": "Open a Factur-X invoice: read the embedded invoice data, check totals and VAT, save as PDF. In English, French or German. Free.",
    "h1": "Open and check a Factur-X invoice",
    "lead": "Factur-X is the French counterpart of ZUGFeRD: a PDF with embedded invoice data. Here you see exactly the data accounting software processes – and whether the amounts add up.",
    "steps": [
      [
        "Choose the Factur-X PDF",
        "The invoice PDF you received."
      ],
      [
        "View the data",
        "Seller, buyer, items, VAT and amount due are shown clearly – recalculated."
      ],
      [
        "Save",
        "“Save as PDF” stores the readable version. Keep the original for your records."
      ]
    ],
    "article": [
      [
        "Factur-X in France: mandatory to receive",
        "Since 1 September 2026, all businesses in France must be able to receive e-invoices; large and mid-sized companies already issue them, and small businesses and micro-entrepreneurs follow on 1 September 2027. Factur-X is one of the three accepted formats, next to UBL and CII.",
        "Factur-X was developed jointly by France and Germany and is technically identical to ZUGFeRD 2.x, so it is valid in both countries."
      ],
      [
        "Why the embedded data matters",
        "The visible PDF and the embedded XML should match – but don’t always. This tool shows the embedded data and recalculates totals and VAT so you spot mistakes before paying."
      ]
    ],
    "faq": [
      [
        "Is my invoice stored?",
        "No. It is only processed to read it and deleted afterwards."
      ],
      [
        "Is the saved PDF a valid invoice?",
        "No, it’s a readable view. The original Factur-X file is the one to keep."
      ]
    ]
  },
  "peppol-rechnung-oeffnen": {
    "guide": "Open a Peppol invoice (UBL), e.g. from Belgium",
    "name": "Open Peppol invoice",
    "title": "Open a Peppol invoice – view UBL XML as a readable invoice, free | PDF Libre",
    "description": "Open a Peppol invoice (UBL XML, Peppol BIS Billing 3.0) online: view it clearly, check totals and VAT, save as PDF. For Belgium and other Peppol countries. Free.",
    "h1": "Open a Peppol invoice (UBL)",
    "lead": "Got an XML file through Peppol that you can’t read? Upload it and see it as a normal invoice – with an automatic check.",
    "steps": [
      [
        "Choose the XML file",
        "The Peppol invoice in UBL format (.xml)."
      ],
      [
        "View the invoice",
        "All details appear clearly, totals and VAT are recalculated."
      ],
      [
        "Save as PDF",
        "For your records or to forward to your accountant."
      ]
    ],
    "article": [
      [
        "Peppol e-invoicing in Belgium",
        "Since 1 January 2026, e-invoicing via Peppol is mandatory between businesses in Belgium – for all VAT-registered businesses, including self-employed people working on the side. Peppol invoices are XML files in UBL format according to EN 16931 (Peppol BIS Billing 3.0)."
      ],
      [
        "Read XML without special software",
        "Opening a UBL file in the browser only shows code. This tool turns it into a readable invoice and shows whether items, VAT and amount due match."
      ]
    ],
    "faq": [
      [
        "Do I need a Peppol access point?",
        "Not to read invoices. To send and receive through the Peppol network you need a provider (access point)."
      ],
      [
        "Is the PDF a valid invoice?",
        "No, it’s a readable view. The XML file is the legal original."
      ]
    ]
  },
  "cerfa-ausfuellen": {
    "guide": "Fill in a French CERFA form online",
    "name": "Fill in CERFA",
    "title": "Fill in a CERFA online – French official forms in your browser | PDF Libre",
    "description": "Fill in French CERFA forms online: fillable fields right in your browser, and non-fillable static versions are turned into forms automatically. No Adobe, no upload, free.",
    "h1": "Fill in a CERFA form online",
    "lead": "French official forms (CERFA) often can’t be filled in in the browser. Here they can – even the “static” version meant only for printing.",
    "steps": [
      [
        "Open the CERFA",
        "Load the form as PDF. If it only shows “Please wait…”, download the static version from service-public.fr."
      ],
      [
        "Fill in the fields",
        "Existing fields are shown; for the static version, lines and boxes automatically become fields."
      ],
      [
        "Save",
        "Download the filled PDF, print it or send it by email."
      ]
    ],
    "article": [
      [
        "Why CERFA forms don’t work in the browser",
        "Many CERFA forms are “dynamic” XFA forms. The PDF viewers in Chrome, Edge and Safari and Adobe Reader on iPhone can’t display XFA – you only see a message asking for a newer Adobe version. The static version opens, but has no fields."
      ],
      [
        "How to do it anyway",
        "Open the static version here: PDF Libre detects lines and boxes and turns them into input fields. Everything happens in your browser; your details are not uploaded."
      ]
    ],
    "faq": [
      [
        "Will the authority accept the filled form?",
        "Yes, as long as you only fill in the fields and don’t change the form. Sign it afterwards as usual."
      ],
      [
        "Is my form uploaded?",
        "No. Filling in and saving happen in your browser."
      ]
    ]
  },
  "pdf-in-e-rechnung-umwandeln": {
    "guide": "Convert a PDF invoice into an e-invoice",
    "name": "Convert PDF to e-invoice",
    "title": "Convert PDF to e-invoice – ZUGFeRD & XRechnung from PDF, free | PDF Libre",
    "description": "Convert a PDF invoice into a German e-invoice: upload a PDF, scan or photo, check and confirm the data, download ZUGFeRD PDF or XRechnung. With total check. Free, no sign-up.",
    "h1": "Convert a PDF invoice into an e-invoice",
    "lead": "Your existing invoice – as PDF, scan or phone photo – becomes a valid e-invoice according to EN 16931. You see all detected data first and confirm it.",
    "steps": [
      [
        "Upload the invoice",
        "Click “Upload invoice” above and choose the PDF, scan or photo."
      ],
      [
        "Confirm the data",
        "You see sender, recipient, items, VAT and total as a preview. Uncertain parts are marked orange – correct them if needed."
      ],
      [
        "Download the e-invoice",
        "After “All correct” you get the ZUGFeRD PDF or XRechnung (XML) and see it before downloading."
      ]
    ],
    "article": [
      [
        "Why a normal PDF is not an e-invoice",
        "A PDF from Word or Excel only contains the invoice data as text on a page. An e-invoice additionally contains it as structured XML according to EN 16931 – so the recipient’s accounting software can take over amount, VAT, IBAN and invoice number automatically. From 2027 (over €800,000 prior-year turnover) or 2028, businesses in Germany must issue invoices to other domestic businesses as e-invoices."
      ],
      [
        "How the conversion works",
        "The text of your invoice is read – with OCR for scans and photos. An AI assigns the details: who issues the invoice, who receives it, which items, which VAT rates. Then we check ourselves: do the items add up to the total on your invoice? Is the invoice number really in the document? Is the IBAN valid?",
        "Anything unclear is highlighted. The e-invoice is only created after your confirmation – you stay responsible for the content, but you don’t have to retype anything."
      ],
      [
        "Tips for a good result",
        "PDFs created directly by a program work best. For photos: lay the invoice flat, good light, whole page in the picture. On the confirmation page, check the VAT rates and unit prices especially – above all if your invoice shows gross prices."
      ]
    ],
    "faq": [
      [
        "Can I convert a photo of an invoice?",
        "Yes. JPG, PNG or HEIC from your phone are read with OCR. Check the numbers especially carefully."
      ],
      [
        "Is my invoice stored?",
        "No. The text is only sent to our server and the AI service to read it, and not stored afterwards."
      ],
      [
        "What if something was detected wrongly?",
        "Click “Correct details” and change the fields. The preview shows the result immediately."
      ],
      [
        "ZUGFeRD or XRechnung?",
        "ZUGFeRD (PDF with embedded data) for business customers, XRechnung for public authorities."
      ]
    ]
  },
  "pdf-ausfuellbar-machen": {
    guide: "Make a PDF fillable (scanned forms too)",
    name: "Make PDF fillable",
    title: "Make a PDF fillable – detect form fields automatically, free | PDF Libre",
    description: "Make a PDF fillable: lines, boxes and tables in scanned or flat forms are turned into form fields automatically. Online, free, without Adobe Acrobat and without upload.",
    h1: "Make a PDF fillable",
    lead: "Turn a printed, scanned or “flat” form into a real fillable PDF: writing lines, boxes and table cells automatically become form fields.",
    steps: [
      ["Open the PDF", "Select the form – scanned, converted from a photo or exported from Word."],
      ["Check the fields", "Detected fields are highlighted in blue. Delete extra ones with ×, add missing ones with “+ Text field” or “+ Checkbox”."],
      ["Save", "“Save as blank fillable PDF” creates a form anyone can fill in with Adobe Reader, a browser or a phone. Or fill it in right here."],
    ],
    article: [
      ["How does a scan become a fillable form?", "To a computer, a scanned form is just an image: there are no fields to click into. PDF Libre analyses the image of every page and looks for the typical parts of a form – horizontal writing lines (“Name: ______”), framed boxes, table cells, small checkboxes and dotted lines. Real PDF form fields are created exactly at those spots.", "Slightly skewed scans are straightened automatically first. For PDFs with real text (for example exported from Word), the fields also get meaningful names such as “Name”, “Date of birth” or “IBAN” – handy if the data is processed later."],
      ["Who is it useful for?", "Clubs, schools, medical practices, property managers and small businesses often have forms that only exist as a printout or scan: registrations, membership applications, consent forms, timesheets. With PDF Libre you turn them into a form you can email or put on your website in a minute – and recipients fill it in on their computer instead of printing it.", "Until now you needed Adobe Acrobat Pro or similar software for this. Here everything runs for free in your browser."],
      ["Tips for a good result", "Detection works best with straight scans with clear, continuous lines. Photographed forms with shadows or curved paper are harder – if possible, scan them with a scanner app. Dotted lines are detected in PDFs with real text; in pure scans you quickly add such fields with “+ Text field”."],
    ],
    faq: [
      ["How do I make a PDF fillable?", "Select the PDF – fields are detected automatically. Check them, add any missing ones and click “Save as blank fillable PDF”."],
      ["Does it work with scanned forms?", "Yes. Lines and boxes are detected in scans too, and slightly skewed pages are straightened automatically."],
      ["Do I need Adobe Acrobat?", "No. The fillable PDF is created right in your browser and works in Adobe Reader, Chrome, Firefox, Edge, Safari and on phones."],
      ["Is my PDF uploaded?", "No. Detection and saving run entirely in your browser."],
      ["Can I add fields myself?", "Yes. Click “+ Text field” or “+ Checkbox” and then the spot you want. Delete wrong fields with the × on the field."],
    ],
  },
  "bewerbung-pdf-zusammenfuegen": {
    guide: "Combine your application documents into one PDF",
    name: "Combine job application into one PDF",
    title: "Combine your job application into one PDF – cover letter, CV & certificates | PDF Libre",
    description: "Merge your application documents into one PDF online: cover letter, CV and certificates in the right order, with cover page and under 5 MB – as recruiters expect. Free, no sign-up.",
    h1: "Combine your application documents into one PDF",
    lead: "Cover letter, CV, job references and certificates in one single PDF – sorted, with a table of contents and small enough for any application portal and any email.",
    steps: [
      ["Upload all documents", "Select your cover letter, CV, references and certificates – as PDF, Word file or phone photo."],
      ["Sort the order", "Drag the files into the right order: cover letter, CV, job references, degree certificates, other certificates."],
      ["Download the application PDF", "Click “Create application PDF”. You get one PDF file you can upload directly or send by email."],
    ],
    article: [
      ["Why recruiters prefer one single PDF file", "When you apply online, it’s best to send one PDF instead of ten separate attachments. HR can open, forward and print your application with one click – and nothing gets lost. Many companies explicitly write in the job ad: “Please send your documents in one PDF file.”", "With PDF Libre you combine your application documents for free, without installing software and without an account. Word files such as your cover letter or CV are converted to PDF automatically, and photos of certificates are placed on A4 pages."],
      ["The right order of application documents", "A proven order is: cover page (optional), cover letter, CV, references (most recent first), university or vocational certificate, school certificate and finally certificates, further training and work samples. For an apprenticeship or internship, your latest school reports and internship confirmations come right after the CV."],
      ["For working student jobs, apprenticeships and unsolicited applications", "Whether you apply for an apprenticeship, an internship, a student job, a part-time job or send an unsolicited application: the principle is always the same. All documents belong in one clear file with a meaningful name, for example “Application_Jane_Doe.pdf”."],
    ],
    faq: [
      ["Can I combine Word and PDF files?", "Yes. You can upload PDF, Word (DOC, DOCX), ODT and photos (JPG, PNG) together. Everything is converted to PDF automatically and merged."],
      ["How should I name my application PDF?", "With content and name, for example “Application_Jane_Doe.pdf” or “Application_Working_Student_Jane_Doe.pdf”. Avoid special characters and spaces so every portal accepts the file."],
      ["Does the application have to be one file?", "Not always, but usually it’s better. If a portal has separate fields for cover letter and CV, upload the documents there individually – otherwise send one PDF."],
      ["Is combining free?", "Yes, completely free, without sign-up and without watermark. Your files are deleted right after the PDF is created."],
    ],
  },
  "bewerbung-pdf-verkleinern": {
    guide: "Reduce your application PDF (under 2 or 5 MB)",
    name: "Reduce application PDF size",
    title: "Reduce your job application PDF – under 2 MB or 5 MB, free | PDF Libre",
    description: "Application PDF too large? Reduce your job application online to under 2 MB or 5 MB for application portals and email – text stays sharp. Free, no sign-up.",
    h1: "Reduce your application PDF – under 2 MB or 5 MB",
    lead: "The application portal says “file too large”? Upload your application and choose the target size. Images and scans are reduced, the text stays crisp.",
    steps: [
      ["Upload your application", "Upload your finished application PDF – or all the individual documents at once."],
      ["Choose the target size", "Choose “Under 2 MB” or “Under 5 MB”, depending on what the portal or job ad requires."],
      ["Download the small PDF", "The file is reduced step by step until it fits under the limit and is ready to upload."],
    ],
    article: [
      ["How large may an application PDF be?", "Most application portals allow 2 to 5 MB per file, some only 1 MB. For an application by email, about 3 to 5 MB is considered polite – larger attachments end up in spam more often or are rejected by the mail server. A complete application with cover letter, CV and certificates normally fits easily into 1 to 3 MB."],
      ["Why is my application so large?", "Almost always because of scanned certificates or very high-resolution phone photos, and large application photos. A single smartphone photo can be 5 MB. PDF Libre reduces exactly these images until the file fits your limit – fonts and lines stay sharp and searchable."],
      ["Reduce the size without it looking bad", "Images are only reduced as much as necessary. For certificates, 150 dpi is completely sufficient – you can’t see a difference on screen or in print. Still, take a quick look at the end to check that stamps and signatures are easy to read."],
    ],
    faq: [
      ["How do I get my application under 2 MB?", "Upload the application, choose “Under 2 MB” and click “Create application PDF”. The images in the PDF are reduced automatically until the file is smaller than 2 MB."],
      ["Does quality suffer?", "Text, lines and fonts stay perfectly sharp. Only photos and scans are reduced in resolution – just enough that you won’t notice it when reading."],
      ["Can I also reduce a normal PDF?", "Yes. For any other PDF, “Compress PDF” is the best choice."],
      ["What if the portal only allows 1 MB?", "Choose “Under 2 MB” and check the size. If that’s not enough, upload certificates as black-and-white scans instead of color photos – that saves the most space."],
    ],
  },
  "bewerbung-deckblatt": {
    guide: "Create a cover page for your application",
    name: "Application cover page",
    title: "Create a cover page for your job application – free as PDF | PDF Libre",
    description: "Create a cover page for your job application online: with name, position, company, contact details and automatic table of contents – straight into your application PDF. Free.",
    h1: "Create a cover page for your application",
    lead: "Enter your name, the position and the company – PDF Libre places a simple, professional cover page with a table of contents in front of your documents.",
    steps: [
      ["Upload your documents", "Upload your cover letter, CV and certificates and put them in the right order."],
      ["Fill in the cover page", "Enter your name, the position and the company, optionally also email, phone and city."],
      ["Download with cover page", "The cover page is placed at the beginning automatically, including a table of contents from your file names."],
    ],
    article: [
      ["Does an application need a cover page?", "A cover page is not mandatory, but it looks tidy and shows the recruiter at a glance who is applying for which position. It is especially helpful for an application PDF with many attachments, because the table of contents shows what is included. For very short applications – for example just cover letter and CV – you can leave it out."],
      ["What goes on the cover page of an application?", "Usually: the word “Application”, the position (e.g. “Data Science Intern” or “Apprentice Office Manager”), the company, your full name and your contact details. An application photo is optional. The table of contents lists the cover letter, CV and all attachments."],
      ["Simple rather than colorful", "A good cover page is calm and easy to read: lots of white space, a clear font, no colorful frames. That’s exactly how the PDF Libre cover page is designed – it fits any CV design and any industry."],
    ],
    faq: [
      ["Is the table of contents created automatically?", "Yes, from the file names of your documents. “Reference_Example_Ltd.pdf” becomes “Reference Example Ltd”. So give your files meaningful names beforehand."],
      ["Do I have to add phone and address?", "No, these fields are optional. Name, position and company are enough for a complete cover page."],
      ["Can I put an application photo on the cover page?", "Not at the moment. Upload the photo as its own page or put it in your CV – in many countries an application photo is optional or even discouraged."],
      ["Does the cover page cost anything?", "No. The cover page and the whole application PDF are free and work without sign-up."],
    ],
  },
  "bewerbung-per-email": {
    guide: "Applying by email: prepare the PDF attachment",
    name: "Job application by email",
    title: "Job application by email: create the right PDF attachment | PDF Libre",
    description: "Send your job application by email: all documents in one PDF attachment under 5 MB, the right file name and subject line. Create your application PDF online for free.",
    h1: "Applying by email: create the right PDF attachment",
    lead: "For an email application you need one single, small PDF attachment. Upload your documents – PDF Libre merges them and brings them under 5 MB.",
    steps: [
      ["Select your documents", "Upload your cover letter, CV and certificates – PDF, Word or photo."],
      ["Set the size", "Choose “Under 5 MB” (default) or “Under 2 MB” if the job ad mentions a limit."],
      ["Send as attachment", "Download the finished PDF and attach it to your email."],
    ],
    article: [
      ["What a good email application looks like", "Subject: “Application as [position] – [reference number]”. The email itself contains only a few sentences: who you are, which position you are applying for and that your documents are attached. The actual cover letter belongs in the PDF – not repeated in the email. End with a complete signature including your phone number."],
      ["One attachment instead of many: file name and size", "Send one single PDF attachment with a clear name, such as “Application_Jane_Doe.pdf”. Stay under 5 MB, ideally under 3 MB – some company mailboxes reject larger attachments without you ever finding out. Never attach Word files directly: they often look different on other computers and can be edited."],
      ["Checklist before sending", "Right contact person in the cover letter? Position and company correct everywhere? All pages in the right order and readable? File under the size limit? A professional sender address (firstname.lastname@…)? Then your application is ready to go."],
    ],
    faq: [
      ["Which format for an email application?", "PDF. It looks the same on every device and can’t be changed by accident. Attaching Word files, ZIP archives or separate images looks unprofessional."],
      ["How large may an application attachment be?", "Rule of thumb: under 5 MB, ideally under 3 MB. If the job ad mentions a limit, stick to it exactly."],
      ["Does the cover letter go in the email or in the PDF?", "In the PDF. The email itself is just a short accompanying text referring to the attachment."],
      ["Are my application documents stored?", "No. All files are deleted from the server right after the PDF is created."],
    ],
  },
  "lebenslauf-pdf": {
    guide: "Save your CV as PDF (Word to PDF)",
    name: "Convert CV to PDF",
    title: "Save your CV as PDF – convert a Word CV to PDF for free | PDF Libre",
    description: "Convert your CV (resume) from Word (DOCX) to PDF: layout, fonts and photo are kept. CV as PDF for job applications and application portals – free, no sign-up.",
    h1: "Save your CV as PDF",
    lead: "Upload your CV as a Word file and get a PDF that looks exactly the same on every device – with photo, tables and fonts.",
    steps: [
      ["Upload your CV", "Choose your CV as DOCX, DOC or ODT."],
      ["Convert", "Click “Convert to PDF”. Layout, photo and formatting are carried over."],
      ["Check and use the PDF", "Download the PDF, quickly check the page breaks and then add it to your application with “Create application PDF”."],
    ],
    article: [
      ["Why your CV should be sent as PDF", "A CV in Word looks different on every computer: if a font is missing, tables, lines and the photo shift. As a PDF, your CV stays exactly as you designed it – whether the recruiter reads it on PC, Mac or phone. A PDF also can’t be changed by accident."],
      ["CV template from Word or Canva?", "Whether you wrote your CV with a Word template, in LibreOffice or in Google Docs: save it as DOCX and convert it to PDF here. From Canva or Pages, it’s best to export directly as PDF – then you can combine the file with your cover letter and certificates using our application PDF tool."],
      ["Tips for a good CV as PDF", "One to two pages, reverse chronological (most recent first), clear headings such as “Work experience”, “Education”, “Skills” and “Languages”. Save the file with your name, for example “CV_Jane_Doe.pdf” – so the recruiter finds it again right away."],
    ],
    faq: [
      ["Is my application photo kept in the PDF?", "Yes. Photos, tables, lines and columns are carried over into the PDF."],
      ["My CV uses a special font – is it kept?", "Common fonts are displayed correctly. With very rare fonts, a similar font may be used. So check the PDF briefly before sending it."],
      ["How do I combine my CV with the cover letter?", "Use “Create application PDF”: there you can upload Word and PDF files together and merge everything into one application PDF."],
      ["Is the conversion free?", "Yes, free and without sign-up. The file is deleted right after the conversion."],
    ],
  },
  "zeugnisse-als-pdf": {
    guide: "Certificates from your phone as PDF",
    name: "Certificates as PDF",
    title: "Certificates as PDF – phone photos and scans into one PDF | PDF Libre",
    description: "Certificates, diplomas and proof documents as PDF: convert phone photos or scans (JPG, PNG) into one PDF – for job applications, university and authorities. Free, no sign-up.",
    h1: "Certificates as PDF – from phone photo to PDF",
    lead: "Photograph your certificates with your phone or scan them and turn them into a clean PDF – for your job application, university enrollment or the authorities.",
    steps: [
      ["Select photos", "Choose the photos or scans of your certificates and diplomas (JPG or PNG)."],
      ["Set the order", "Sort the pages – for example, the most recent certificate first."],
      ["Download the PDF", "All images go into one PDF that you can upload, send by email or add to your application PDF."],
    ],
    article: [
      ["How to photograph certificates properly", "Place the certificate on a dark, plain surface and photograph it straight from above in daylight, without flash. Make sure all four corners are visible and no shadows fall across the text. That way grades, stamps and signatures stay easy to read."],
      ["Certificates for job, university applications and recognition", "Whether job reference, school leaving certificate, bachelor’s degree, language certificate (e.g. IELTS, TOEFL, Cambridge) or internship confirmation: many portals – from companies to universities and authorities – require proof as PDF. You can bundle several certificates in one file or create a separate PDF for each document."],
      ["Add certificates to your application PDF", "You can combine the finished certificate PDF directly with your cover letter and CV into one application PDF. There the file is also reduced automatically to under 5 MB if the photos are very large."],
    ],
    faq: [
      ["Is a phone photo enough instead of a scan?", "For most online applications, yes, if the photo is straight, sharp and well lit. For official purposes a certified copy may be required – that depends on the institution."],
      ["How many certificates can I put into one PDF?", "As many as you like. Each image becomes its own page."],
      ["The PDF is too large – what now?", "Add it to the application PDF tool and choose a target size, or use “Compress PDF”."],
      ["Are my certificates stored?", "No. The conversion runs directly in your browser, your photos never leave your device."],
    ],
  },
  "lebenslauf-vorlage": {
    guide: "Free CV template (Word alternative, as PDF)",
    name: "CV template",
    title: "Free CV template – modern, classic & as PDF | PDF Libre",
    description: "Free CV templates: Modern, Classic, LaTeX style and Compact. Fill them in online instead of fighting with a Word template – download an ATS-friendly PDF. No sign-up.",
    h1: "Free CV template – fill it in and save as PDF",
    lead: "Tired of fighting with tables and tab stops in Word? Pick a template, enter your details – the layout adapts automatically.",
    article: [
      ["Fill in a template online instead of editing a Word file", "Classic CV templates for Word or Google Docs shift easily: one more line and the table jumps to the next page. Here you only enter content – spacing, fonts and page breaks are handled by PDF Libre. Headings that would end up alone at the bottom of a page move to the next page automatically."],
      ["Which CV template suits me?", "For IT, marketing, start-ups, student jobs and internships: “Modern”. For banks, public sector, insurance, law firms and industry: “Classic”. For research, PhD positions, scholarships and technical subjects: “Academic” in LaTeX style. For lots of experience on one page: “Compact”. You can switch at any time without re-entering anything."],
    ],
    faq: [
      ["Does the CV template cost anything?", "No. All templates are free and without watermark."],
      ["Can I get the template as a Word file?", "The CV is created as a PDF – the format recruiters and application portals expect. If you still need Word, convert the PDF with “PDF to Word”."],
      ["Can I switch between templates?", "Yes, at any time. Your details stay, only the design changes."],
    ],
  },
  "lebenslauf-ats": {
    guide: "ATS-friendly CV: how applicant tracking systems read it correctly",
    name: "ATS CV",
    title: "ATS-friendly CV – free ATS resume template | PDF Libre",
    description: "Create an ATS-friendly CV: single column, real text, standard headings and an ATS check with tips. Get your application through applicant tracking systems. Free as PDF.",
    h1: "Create an ATS-friendly CV",
    lead: "So your application doesn’t fail at the software stage: templates every applicant tracking system can read – with an ATS check right next to the preview.",
    article: [
      ["Why CVs fail in an ATS", "Multi-column layouts where the software mixes up columns; contact details in the header or as an image; icons instead of words (“📞” instead of “Phone”); creative headings like “My journey” instead of “Experience”; charts for language skills; fonts without proper Unicode mapping, so the ATS reads gibberish. PDF Libre templates avoid all of this."],
      ["Use keywords from the job ad", "An ATS compares your CV with the job requirements. So use the terms from the ad where they apply to you – for example “Python”, “SQL”, “project management” or “customer service” – in your skills and in the description of your positions. Spell out abbreviations once (“Customer Relationship Management (CRM)”). But don’t invent anything: every detail is checked in the interview."],
      ["The PDF Libre ATS check", "Next to the preview, PDF Libre checks whether your name and contact details are present as text, whether there is a short profile, whether all dates use the same format, whether your positions are described and whether the CV is two pages at most."],
    ],
    faq: [
      ["What is an ATS?", "An applicant tracking system is software companies use to collect, parse and rank applications – for example Workday, Greenhouse, Lever, SAP SuccessFactors or Personio."],
      ["Can an ATS CV have a photo?", "Yes, a photo doesn’t disturb parsing. Whether to include one depends on the country – in the UK and the US it is usually left out."],
      ["Is a PDF suitable for an ATS?", "Yes, as long as it contains real text – like PDF Libre PDFs. Scanned CVs or images saved as PDF can’t be read by an ATS."],
    ],
  },
  "lebenslauf-latex": {
    guide: "CV in LaTeX style – without LaTeX",
    name: "LaTeX-style CV",
    title: "LaTeX CV without LaTeX – create a moderncv-style resume online | PDF Libre",
    description: "Create a CV with the LaTeX look, no LaTeX needed: Latin Modern font, clean moderncv-like structure, live preview and PDF download. Ideal for university, research and PhD applications. Free.",
    h1: "CV in LaTeX style – no LaTeX needed",
    lead: "The typical LaTeX look with the Latin Modern font, without Overleaf, packages or compile errors. Choose the “Academic” template and fill in the form.",
    article: [
      ["Why a CV in LaTeX style?", "In mathematics, computer science, physics and research, CVs made with LaTeX (for example moderncv or altacv) are widespread: calm typography, perfect spacing, a serious look. The downside: you need to know LaTeX, and every change means recompiling. The “Academic” template sets your CV in Latin Modern – LaTeX’s default font – with the same clear structure."],
      ["For applications to universities, institutes and research", "Research assistant job, student job at an institute, master’s application, PhD, scholarship or research institute: an academic CV shows projects, thesis, teaching experience and publications alongside education and experience. Simply add your own sections via “Projects” or “Additional information” and rename them."],
    ],
    faq: [
      ["Do I need LaTeX or Overleaf?", "No. You only fill in the form, the PDF is typeset automatically."],
      ["Is the LaTeX style ATS-friendly?", "Yes. Unlike some LaTeX templates with columns and icons, this template uses a single column and contains cleanly readable text."],
      ["Can I list publications?", "Yes. Rename the “Additional information” section to “Publications” and enter them there – one per line."],
    ],
  },
  "lebenslauf-werkstudent": {
    guide: "CV for student jobs, internships and apprenticeships",
    name: "Student CV",
    title: "Student CV for internships & part-time jobs – free example & template | PDF Libre",
    description: "Create a CV for an internship, student job or apprenticeship: example with degree, projects and skills, ATS-friendly as PDF. Free and without sign-up.",
    h1: "CV for student jobs, internships and apprenticeships",
    lead: "Little work experience? No problem: with your studies, projects, side jobs and skills your CV can still be strong. Click “Load example” to see a sample.",
    article: [
      ["What goes into a student CV?", "A short profile (what you study, your strengths, how many hours a week you’re available), your degree with focus areas, internships, side jobs and student jobs, university and personal projects (for example on GitHub), skills such as programming languages, tools and software, languages with level (A1–C2) and volunteering. Side jobs outside your field also show reliability and belong in it."],
      ["Projects instead of work experience", "Especially for student jobs in IT, data science and engineering, projects are often more important than long work experience. Briefly describe what you built, with which technologies and what came out of it – and link to it if possible."],
    ],
    faq: [
      ["How long may a student CV be?", "One page is ideal; two pages are fine if you have many relevant projects or jobs."],
      ["Should I include my school leaving exams?", "Yes, with your grade, as long as you are still studying or have just graduated."],
      ["Should I state my weekly hours?", "For part-time student jobs, yes – for example in your profile: “available 15–20 hours a week”."],
    ],
  },
  "lebenslauf-franzoesisch": {
    guide: "CV in French (CV français) – for France, Belgium, Switzerland, Luxembourg",
    name: "CV in French",
    title: "Create a CV in French – free French CV template | PDF Libre",
    description: "Create a French CV: headings in French, the usual date format and a cover letter (lettre de motivation) – or translate your English CV with AI. For applications in France, Belgium, Switzerland and Luxembourg.",
    h1: "CV in French – CV en français",
    lead: "Applying in France, Belgium, French-speaking Switzerland, Luxembourg or to a French company? Get a CV with French headings – or translate your existing CV with one click.",
    article: [
      ["The French CV: what’s different", "A CV in France is usually one page long (two at most for experienced professionals) and often starts with a short target line, the “titre du CV”, for example “Stagiaire en Data Science” or “Ingénieur logiciel”. Then come “Expérience professionnelle”, “Formation”, “Compétences”, “Langues” and “Centres d’intérêt”. A photo is optional in France.", "Explain foreign degrees briefly, for example “A-levels (équivalent du baccalauréat)” or “Bachelor of Science en informatique”. PDF Libre’s translation feature does this automatically."],
      ["Translate your CV instead of rewriting it", "Already have an English or German CV? Import it, go to “Check & AI” and choose “Translate → French”. Job titles, degrees and descriptions are translated naturally; names, companies, places and technologies stay unchanged. Save your draft first so you keep both language versions."],
      ["Lettre de motivation in the same design", "You can also create the cover letter – the “lettre de motivation” – here in the same design, with the French salutation “Madame, Monsieur,” and the usual closing formula. The AI draft follows the language of the job ad."],
    ],
    faq: [
      ["Can I switch between English, French and German?", "Yes. You change the headings in the “Design” step; the AI translates the texts in the “Check & AI” step."],
      ["How do I write dates in a French CV?", "MM/YYYY is common, for example 09/2024. “aujourd’hui” means “present”."],
      ["What are the sections called in French?", "Profil, Expérience professionnelle, Formation, Projets, Compétences, Langues and Informations complémentaires."],
    ],
  },
};

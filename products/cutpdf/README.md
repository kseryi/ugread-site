uCutPDF - Lightweight PDF cutter (archive)

What is included:
- index.html — main single-page UI
- style.css — styles
- app.js — application logic (vanilla JS)
- pdfjs/pdf.js — small loader which loads pdf.js from CDN at runtime
- libs/pdf-lib.min.js — small loader which loads pdf-lib from CDN at runtime

Notes:
- For offline usage, replace pdfjs/pdf.js with a local build of PDF.js and libs/pdf-lib.min.js with a local copy of pdf-lib.
- The app supports:
  - Viewing the PDF with natural scrolling
  - Zoom in / out
  - Cut Page — create a new PDF from selected page numbers/ranges (e.g. 1,3,5-7)
  - Cut Image — drag a rectangle on any rendered page to extract that area into a new PDF
  - Download the generated PDF

How to run:
1. Unzip the archive.
2. Open index.html in a modern browser (Chrome, Edge, Firefox).
3. For full functionality the app loads pdf.js and pdf-lib from CDNs. If you need offline use, include local builds.

Security:
- All processing happens in the browser. No files are uploaded to a server.

If you want, I can:
- produce a single-file HTML (all-in-one),
- build a React version,
- or include local copies of pdf.js and pdf-lib in the archive for true offline use.

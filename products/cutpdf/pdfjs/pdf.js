// pdfjs loader shim
// This file is a small loader that injects PDF.js from a CDN at runtime,
// so the archive doesn't need to carry the entire pdf.js library binary.
// If you prefer to include pdf.js locally, replace this file with the full build.

(function(){
  const cdn = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js";
  // Create script tag for pdf.js
  const s = document.createElement('script');
  s.src = cdn;
  s.onload = function(){
    // pdfjs gets exposed as window.pdfjsLib in the CDN bundle
    if (!window.pdfjsLib && window.pdfjsLib === undefined) {
      console.warn("pdf.js loaded but pdfjsLib not found on window. Check CDN availability.");
    } else {
      // You can set workerSrc if needed to a CDN worker file
      try {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
      } catch(e){}
    }
  };
  s.onerror = function(){
    console.error("Failed to load pdf.js from CDN. If you need offline usage, replace pdfjs/pdf.js with a local pdf.js build.");
  };
  document.head.appendChild(s);
})();
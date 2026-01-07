// uCutPDF - core application (vanilla JS)
// Requires pdfjsLib (window.pdfjsLib) and PDFLib (window.PDFLib) loaded (shims load them from CDN).

const fileInput = document.getElementById('fileInput');
const viewer = document.getElementById('viewer');
const scaleLabel = document.getElementById('scaleLabel');
const zoomSlider = document.getElementById('zoomSlider');
const cutBtn = document.getElementById('cutBtn');
const cutPagesInput = document.getElementById('cutPages');
const selectToPdfBtn = document.getElementById('selectToPdf');
const selectToPngBtn = document.getElementById('selectToPng');
const downloadBtn = document.getElementById('downloadBtn');
const infoEl = document.getElementById('info');
const thumbnailsContainer = document.getElementById('thumbnailsContainer');

let pdfDoc = null;
let scale = 1.0;
let lastGeneratedBytes = null;

let selectionMode = null; // 'pdf' or 'png'
let selectionDiv = null;
let startPos = null;
let currentCanvas = null;
let renderInProgress = false;
let zoomTimeout = null;

// Helpers
function setInfo(text){
  infoEl.textContent = text;
}

function formatPercent(s){ return Math.round(s*100) + '%'; }

// Zoom
function setScale(newScale, instant = false){
  scale = Math.max(0.25, Math.min(4, newScale));
  scaleLabel.textContent = formatPercent(scale);
  zoomSlider.value = scale * 100;
  
  if (pdfDoc && !renderInProgress) {
    if (instant) {
      // Миттєвий рендер для першого налаштування
      renderAllPages();
    } else {
      // Відкладеный рендер для плавності
      scheduleRender();
    }
  }
}

function scheduleRender() {
  if (zoomTimeout) {
    clearTimeout(zoomTimeout);
  }
  zoomTimeout = setTimeout(() => {
    renderAllPages();
    zoomTimeout = null;
  }, 300); // Невелика затримка для плавності
}

zoomSlider.addEventListener('input', ()=> {
  const newScale = parseInt(zoomSlider.value) / 100;
  setScale(newScale, false); // Не миттєво для плавності
});

// File loading
fileInput.addEventListener('change', async (e)=>{
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  await loadPdfFile(file);
});

async function loadPdfFile(file){
  setInfo('Завантаження...');
  const array = await file.arrayBuffer();
  try{
    // pdfjs must be ready
    if (!window.pdfjsLib) {
      setInfo('Error: pdf.js не завантажено.');
      console.error('pdfjsLib missing');
      return;
    }
    pdfDoc = await window.pdfjsLib.getDocument({data: array}).promise;
    viewer.innerHTML = '';
    thumbnailsContainer.innerHTML = '';
    
    // Спочатку рендеримо мініатюри, потім основні сторінки
    await renderThumbnails();
    await renderAllPages();
    
    setInfo('Завантажено: ' + file.name + ' — ' + pdfDoc.numPages + ' сторінок');
  } catch(err){
    console.error(err);
    setInfo('Помилка при завантаженні PDF');
  }
}

// Render thumbnails
async function renderThumbnails(){
  if (!pdfDoc) return;
  
  thumbnailsContainer.innerHTML = '';
  const thumbnailScale = 0.15;
  
  // Створюємо масив промісів для паралельного рендерингу
  const thumbnailPromises = [];
  
  for (let i=1; i<=pdfDoc.numPages; i++){
    thumbnailPromises.push(createThumbnail(i, thumbnailScale));
  }
  
  // Чекаємо завершення всіх промісів
  await Promise.all(thumbnailPromises);
}

async function createThumbnail(pageNumber, thumbnailScale) {
  try {
    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: thumbnailScale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    
    const thumbnail = document.createElement('div');
    thumbnail.className = 'thumbnail';
    thumbnail.dataset.pageNumber = pageNumber;
    
    const pageNumberElement = document.createElement('span');
    pageNumberElement.className = 'page-number';
    pageNumberElement.textContent = pageNumber;
    
    thumbnail.appendChild(canvas);
    thumbnail.appendChild(pageNumberElement);
    
    // Add click event to scroll to page
    thumbnail.addEventListener('click', () => {
      document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
      thumbnail.classList.add('active');
      
      const pageCanvas = document.querySelector(`.page-canvas[data-page-number="${pageNumber}"]`);
      if (pageCanvas) {
        pageCanvas.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    
    thumbnailsContainer.appendChild(thumbnail);
  } catch (error) {
    console.error('Помилка при створенні мініатюри сторінки', pageNumber, error);
  }
}

// Render pages sequentially
async function renderAllPages(){
  if (!pdfDoc || renderInProgress) return;
  
  renderInProgress = true;
  setInfo('Масштабування...');
  
  // Зберігаємо позицію прокрутки
  const scrollTop = viewer.scrollTop;
  
  viewer.innerHTML = '';
  
  try {
    // Використовуємо послідовний рендеринг для уникнення навантаження
    for (let i=1; i<=pdfDoc.numPages; i++){
      await renderPage(i);
    }
    
    // Відновлюємо позицію прокрутки після рендеру
    setTimeout(() => {
      viewer.scrollTop = scrollTop;
    }, 0);
    
    setInfo('Масштабування завершено');
  } catch (error) {
    console.error('Помилка при рендерингу сторінок', error);
    setInfo('Помилка при масштабуванні');
  } finally {
    // attach events after rendering
    attachCanvasSelectionEvents();
    renderInProgress = false;
  }
}

async function renderPage(pageNumber) {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  canvas.dataset.pageNumber = pageNumber;
  canvas.classList.add('page-canvas');

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  viewer.appendChild(canvas);
}

// Parse pages input like "1,3,5-7" into array of ints
function parsePageList(str){
  if (!str) return [];
  const parts = str.split(',').map(p=>p.trim()).filter(Boolean);
  const pages = new Set();
  for (const p of parts){
    if (p.includes('-')){
      const [a,b] = p.split('-').map(x=>parseInt(x,10)).map(n=>isNaN(n)?null:n);
      if (a && b){
        for (let i=a;i<=b;i++) pages.add(i);
      }
    } else {
      const n = parseInt(p,10);
      if (!isNaN(n)) pages.add(n);
    }
  }
  // Keep valid range
  return Array.from(pages).filter(n=>n>=1 && pdfDoc && n<=pdfDoc.numPages).sort((a,b)=>a-b);
}

// Download helper
function downloadBytes(bytes, filename){
  const blob = new Blob([bytes], {type: 'application/pdf'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'result.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Cut pages handler
cutBtn.addEventListener('click', async ()=>{
  if (!pdfDoc){
    alert('Спочатку завантаж PDF');
    return;
  }
  const list = cutPagesInput.value.trim();
  const pages = parsePageList(list);
  if (!pages.length){
    alert('Вкажіть номери сторінок (наприклад: 1,3,5-7)');
    return;
  }
  setInfo('Формування нового PDF з вказаних сторінок...');
  try{
    const file = fileInput.files && fileInput.files[0];
    if (!file) throw new Error('Original file not found');
    const bytes = await file.arrayBuffer();

    const srcDoc = await PDFLib.PDFDocument.load(bytes);
    const newDoc = await PDFLib.PDFDocument.create();

    // copy pages (note: pdf-lib uses zero-based indices)
    const indices = pages.map(p=>p-1);
    const copied = await newDoc.copyPages(srcDoc, indices);
    copied.forEach(pg => newDoc.addPage(pg));

    const out = await newDoc.save();
    lastGeneratedBytes = out;
    downloadBtn.disabled = false;
    downloadBytes(out, 'uCutPDF_cut_pages.pdf');
    setInfo('Готово — створено PDF з ' + pages.length + ' сторінок');
  } catch(err){
    console.error(err);
    setInfo('Помилка при формуванні PDF');
    alert('Error: ' + err.message);
  }
});

// --- Cut Image (select a rect on a canvas) ---
selectToPdfBtn.addEventListener('click', ()=>{
  if (!pdfDoc){
    alert('Спочатку завантаж PDF');
    return;
  }
  selectionMode = 'pdf';
  setInfo('Режим Select to PDF: виділи область на сторінці');
});

selectToPngBtn.addEventListener('click', ()=>{
  if (!pdfDoc){
    alert('Спочатку завантаж PDF');
    return;
  }
  selectionMode = 'png';
  setInfo('Режим Select to PNG: виділи область на сторінці');
});

// Attach mouse handlers to canvases
function attachCanvasSelectionEvents(){
  const canvases = document.querySelectorAll('canvas.page-canvas');
  canvases.forEach(c => {
    c.style.cursor = 'crosshair';
    // Видаляємо старі обробники перед додаванням нових
    c.removeEventListener('mousedown', canvasMouseDown);
    c.addEventListener('mousedown', canvasMouseDown);
  });
}

function canvasMouseDown(e){
  if (!selectionMode) return;
  const canvas = e.currentTarget;
  currentCanvas = canvas;
  startPos = {x: e.pageX, y: e.pageY};

  selectionDiv = document.createElement('div');
  selectionDiv.className = 'selection';
  document.body.appendChild(selectionDiv);

  function onMove(ev){
    const x = Math.min(ev.pageX, startPos.x);
    const y = Math.min(ev.pageY, startPos.y);
    const w = Math.abs(ev.pageX - startPos.x);
    const h = Math.abs(ev.pageY - startPos.y);
    selectionDiv.style.left = x + 'px';
    selectionDiv.style.top = y + 'px';
    selectionDiv.style.width = w + 'px';
    selectionDiv.style.height = h + 'px';
  }
  
  function onUp(ev){
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    
    // compute selection relative to canvas
    const rect = selectionDiv.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    // convert to canvas coordinate system
    const sx = (rect.left - canvasRect.left) * (canvas.width / canvasRect.width);
    const sy = (rect.top - canvasRect.top) * (canvas.height / canvasRect.height);
    const sw = rect.width * (canvas.width / canvasRect.width);
    const sh = rect.height * (canvas.height / canvasRect.height);

    selectionDiv.remove();
    selectionDiv = null;

    if (sw < 2 || sh < 2){
      setInfo('Виділена область занадто мала');
      selectionMode = null;
      return;
    }
    
    // create temporary canvas and draw the selection
    const tmp = document.createElement('canvas');
    tmp.width = Math.max(1, Math.floor(sw));
    tmp.height = Math.max(1, Math.floor(sh));
    const tctx = tmp.getContext('2d');
    tctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, tmp.width, tmp.height);

    if (selectionMode === 'pdf') {
      // Convert to PDF
      tmp.toBlob(async function(blob){
        const array = await blob.arrayBuffer();
        const newDoc = await PDFLib.PDFDocument.create();
        let img;
        // try png first, if fail try jpeg
        try{
          img = await newDoc.embedPng(array);
        } catch(err){
          img = await newDoc.embedJpg(array);
        }
        const page = newDoc.addPage([tmp.width, tmp.height]);
        page.drawImage(img, {x:0,y:0,width:tmp.width,height:tmp.height});
        const out = await newDoc.save();
        lastGeneratedBytes = out;
        downloadBtn.disabled = false;
        downloadBytes(out, 'uCutPDF_cut_image.pdf');
        setInfo('Результат Select to PDF готовий');
        selectionMode = null;
      }, 'image/png');
    } else if (selectionMode === 'png') {
      // Convert to PNG and download directly
      tmp.toBlob(function(blob){
        downloadBlob(blob, 'uCutPDF_cut_image.png');
        setInfo('Результат Select to PNG готовий');
        selectionMode = null;
      }, 'image/png');
    }
  }

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp, {once:true});
}

// Download last-generated PDF
downloadBtn.addEventListener('click', ()=>{
  if (!lastGeneratedBytes){
    alert('Немає згенерованого файлу');
    return;
  }
  downloadBytes(lastGeneratedBytes, 'uCutPDF_result.pdf');
});

// Small UX: support drag & drop
const dropBtn = document.getElementById('dropAreaBtn');
dropBtn.addEventListener('click', ()=> {
  alert('Можеш перетягнути PDF-файл у вікно браузера, або скористайся полем вибору файлу.');
});

window.addEventListener('dragover', (e)=>{ e.preventDefault(); });
window.addEventListener('drop', async (e)=>{
  e.preventDefault();
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length){
    const f = e.dataTransfer.files[0];
    if (f.type !== 'application/pdf') {
      alert('Будь ласка, скинь PDF-файл');
      return;
    }
    // assign file to file input for later reference
    const dt = new DataTransfer();
    dt.items.add(f);
    fileInput.files = dt.files;
    await loadPdfFile(f);
  }
});

// Додамо кнопки швидкого масштабування для зручності
document.addEventListener('DOMContentLoaded', function() {
  // Додамо кнопки швидкого масштабування
  const zoomControls = document.querySelector('.zoom-controls');
  if (zoomControls) {
    const quickZoomButtons = document.createElement('div');
    quickZoomButtons.className = 'quick-zoom';
    quickZoomButtons.style.cssText = 'display: flex; gap: 8px; margin-top: 8px;';
    quickZoomButtons.innerHTML = `
      <button data-scale="0.5" style="padding: 4px 8px; font-size: 12px;">50%</button>
      <button data-scale="1" style="padding: 4px 8px; font-size: 12px;">100%</button>
      <button data-scale="1.5" style="padding: 4px 8px; font-size: 12px;">150%</button>
      <button data-scale="2" style="padding: 4px 8px; font-size: 12px;">200%</button>
      <button data-scale="3" style="padding: 4px 8px; font-size: 12px;">300%</button>
    `;
    zoomControls.appendChild(quickZoomButtons);
    
    // Додаємо обробники подій для кнопок швидкого масштабу
    quickZoomButtons.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', function() {
        const newScale = parseFloat(this.dataset.scale);
        setScale(newScale, true);
      });
    });
  }
});

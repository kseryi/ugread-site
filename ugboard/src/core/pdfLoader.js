/**
 * UGREAD Whiteboard - Advanced PDF Document Loader & Multi-Page Selector
 * Fast, crisp PDF rendering to board objects using PDF.js.
 */

import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { insertImage } from './board.js';
import { state, events, getCurrentSlide } from './state.js';

// Worker configuration - local bundled asset for full offline capability
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
  } catch (e) {
    console.warn('PDF Worker setup warning:', e);
  }
}

/**
 * Завантажує PDF документ з File або ArrayBuffer
 */
export async function loadPdfDocument(fileOrBuffer) {
  let data;
  if (fileOrBuffer instanceof ArrayBuffer) {
    data = new Uint8Array(fileOrBuffer);
  } else if (fileOrBuffer instanceof Uint8Array) {
    data = fileOrBuffer;
  } else if (fileOrBuffer instanceof Blob || fileOrBuffer instanceof File) {
    const ab = await fileOrBuffer.arrayBuffer();
    data = new Uint8Array(ab);
  } else {
    throw new Error('Unsupported PDF file format');
  }

  const loadingTask = pdfjsLib.getDocument({
    data,
    cMapPacked: true,
  });

  return await loadingTask.promise;
}

/**
 * Рендерить конкретну сторінку PDF у високій чіткості (PNG DataURL)
 */
export async function renderPdfPageToDataUrl(pdf, pageNum, renderScale = 2.0) {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale: renderScale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d', { alpha: false });

  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    await page.render(renderContext).promise;
  }

  const unscaledViewport = page.getViewport({ scale: 1.0 });

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: unscaledViewport.width,
    height: unscaledViewport.height,
    pageNumber: pageNum,
    totalPages: pdf.numPages
  };
}

/**
 * Головна точка входу для обробки файлу (PDF або Зображення)
 */
export async function handlePdfOrImageFile(file, options = {}) {
  if (!file) return;

  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (!isPdf) {
    // Звичайне зображення
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        insertImage(e.target.result, options.x || 120, options.y || 100, options.width || 600);
      }
    };
    reader.readAsDataURL(file);
    return;
  }

  // Обробка PDF
  try {
    showPdfLoadingIndicator(true, 'Завантаження PDF документа...');
    const pdf = await loadPdfDocument(file);
    showPdfLoadingIndicator(false);

    if (pdf.numPages === 1) {
      // Односторінковий документ — рендеримо одразу
      showPdfLoadingIndicator(true, 'Рендеринг сторінки...');
      const rendered = await renderPdfPageToDataUrl(pdf, 1, 2.0);
      showPdfLoadingIndicator(false);
      insertImage(rendered.dataUrl, options.x || 120, options.y || 80, options.width || 650);
    } else {
      // Багатосторінковий документ — відкриваємо селектор сторінок
      openPdfPageSelectorModal(pdf, file.name || 'Документ.pdf', (chosenPageNum) => {
        renderPdfPageToDataUrl(pdf, chosenPageNum, 2.0).then(rendered => {
          insertImage(rendered.dataUrl, options.x || 120, options.y || 80, options.width || 650);
        });
      });
    }
  } catch (err) {
    showPdfLoadingIndicator(false);
    console.error('Помилка читання PDF:', err);
    alert('Не вдалося відкрити PDF файл. Перевірте цілісність документа або спробуйте інший файл.');
  }
}

/**
 * Індикатор завантаження PDF
 */
function showPdfLoadingIndicator(show, text = 'Обробка PDF...') {
  let loader = document.getElementById('pdfGlobalLoader');
  if (!loader && show) {
    loader = document.createElement('div');
    loader.id = 'pdfGlobalLoader';
    loader.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(15, 23, 42, 0.9);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      backdrop-filter: blur(8px);
    `;
    loader.innerHTML = `
      <div class="pdf-spinner" style="width:20px; height:20px; border:2.5px solid rgba(255,255,255,0.3); border-top-color:#38bdf8; border-radius:50%; animation:pdfSpin 0.8s linear infinite;"></div>
      <span id="pdfGlobalLoaderText">${text}</span>
      <style>@keyframes pdfSpin { to { transform: rotate(360deg); } }</style>
    `;
    document.body.appendChild(loader);
  } else if (loader) {
    const textEl = loader.querySelector('#pdfGlobalLoaderText');
    if (textEl) textEl.textContent = text;
    loader.style.display = show ? 'flex' : 'none';
  }
}

/**
 * Модальне вікно для вибору сторінки з багатосторінкового PDF
 */
export function openPdfPageSelectorModal(pdf, filename, onSelectPage) {
  // Закриваємо попередні якщо є
  const oldModal = document.getElementById('pdfPageSelectorModal');
  if (oldModal) oldModal.remove();

  let currentPage = 1;
  const totalPages = pdf.numPages;

  const modal = document.createElement('div');
  modal.id = 'pdfPageSelectorModal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.65);
    backdrop-filter: blur(6px);
    z-index: 9990;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    font-family: var(--font-main, sans-serif);
  `;

  modal.innerHTML = `
    <div style="background: white; width: 850px; max-width: 96vw; max-height: 90vh; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.25); display: flex; flex-direction: column; overflow: hidden; border: 1px solid #cbd5e1;">
      
      <!-- Шапка -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 22px;">📄</span>
          <div>
            <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #0f172a;">Оберіть сторінку PDF для вставки</h3>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">${escapeHtml(filename)} • Всього сторінок: <b>${totalPages}</b></p>
          </div>
        </div>
        <button id="pdfModalCloseBtn" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #64748b; padding: 4px 8px; border-radius: 6px; line-height: 1;">✕</button>
      </div>

      <!-- Основний контент (Прев'ю + Навігація) -->
      <div style="flex: 1; display: flex; overflow: hidden;">
        
        <!-- Ліва колонка: стрічка мініатюр -->
        <div id="pdfThumbnailsStrip" style="width: 170px; background: #f1f5f9; border-right: 1px solid #e2e8f0; overflow-y: auto; padding: 12px 8px; display: flex; flex-direction: column; gap: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; padding: 0 4px;">Сторінки (1 - ${totalPages})</div>
          <!-- Мініатюри генеруються динамічно -->
          <div id="pdfThumbsList" style="display: flex; flex-direction: column; gap: 8px;"></div>
        </div>

        <!-- Права колонка: Велике прев'ю обраної сторінки -->
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px; background: #e2e8f0; overflow: auto; position: relative;">
          
          <div id="pdfPageLoadingSpinner" style="display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.7); color: white; padding: 10px 18px; border-radius: 8px; font-size: 13px; z-index: 10;">
            ⏳ Рендеринг...
          </div>

          <div style="background: white; box-shadow: 0 4px 16px rgba(0,0,0,0.15); border-radius: 6px; overflow: hidden; max-height: calc(90vh - 200px); display: flex; align-items: center; justify-content: center;">
            <canvas id="pdfMainPreviewCanvas" style="max-width: 100%; max-height: calc(90vh - 210px); display: block; object-fit: contain;"></canvas>
          </div>
        </div>
      </div>

      <!-- Футер з кнопками дій -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
        
        <!-- Навігація сторінками -->
        <div style="display: flex; align-items: center; gap: 8px;">
          <button id="pdfPrevPageBtn" class="module-btn" style="padding: 6px 12px; font-size: 13px;">⬅ Попередня</button>
          <span style="font-size: 13px; color: #334155; font-weight: 600;">
            Стор. <input type="number" id="pdfPageNumInput" value="1" min="1" max="${totalPages}" style="width: 50px; text-align: center; padding: 4px; border: 1px solid #cbd5e1; border-radius: 4px; font-weight: 700;" /> з ${totalPages}
          </span>
          <button id="pdfNextPageBtn" class="module-btn" style="padding: 6px 12px; font-size: 13px;">Наступна ➡</button>
        </div>

        <!-- Кнопки вставки -->
        <div style="display: flex; align-items: center; gap: 10px;">
          <button id="pdfCancelBtn" style="padding: 8px 16px; background: white; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; color: #475569;">
            Скасувати
          </button>
          <button id="pdfInsertChosenBtn" style="padding: 8px 18px; background: #2563eb; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(37,99,235,0.3);">
            ➕ Вставити сторінку на дошку
          </button>
        </div>

      </div>

    </div>
  `;

  document.body.appendChild(modal);

  const mainCanvas = modal.querySelector('#pdfMainPreviewCanvas');
  const thumbsList = modal.querySelector('#pdfThumbsList');
  const pageInput = modal.querySelector('#pdfPageNumInput');
  const prevBtn = modal.querySelector('#pdfPrevPageBtn');
  const nextBtn = modal.querySelector('#pdfNextPageBtn');
  const closeBtn = modal.querySelector('#pdfModalCloseBtn');
  const cancelBtn = modal.querySelector('#pdfCancelBtn');
  const insertBtn = modal.querySelector('#pdfInsertChosenBtn');
  const spinner = modal.querySelector('#pdfPageLoadingSpinner');

  function closeModal() {
    modal.remove();
  }

  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Рендер головного прев'ю
  async function renderMainPreview(pageNum) {
    if (pageNum < 1 || pageNum > totalPages) return;
    currentPage = pageNum;
    pageInput.value = currentPage;

    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;

    // Підсвічуємо активну мініатюру
    modal.querySelectorAll('.pdf-thumb-card').forEach(c => {
      c.classList.toggle('active', parseInt(c.dataset.page, 10) === currentPage);
    });

    if (spinner) spinner.style.display = 'block';

    try {
      const page = await pdf.getPage(currentPage);
      const viewport = page.getViewport({ scale: 1.5 });

      mainCanvas.width = viewport.width;
      mainCanvas.height = viewport.height;
      const ctx = mainCanvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

      await page.render({ canvasContext: ctx, viewport }).promise;
    } catch (e) {
      console.error('Помилка рендеру сторінки:', e);
    } finally {
      if (spinner) spinner.style.display = 'none';
    }
  }

  // Генерація мініатюр
  async function renderThumbnails() {
    thumbsList.innerHTML = '';
    const maxThumbs = Math.min(totalPages, 50);

    for (let i = 1; i <= maxThumbs; i++) {
      const thumbCard = document.createElement('div');
      thumbCard.className = 'pdf-thumb-card' + (i === 1 ? ' active' : '');
      thumbCard.dataset.page = i.toString();
      thumbCard.style.cssText = `
        background: white;
        border: 2px solid ${i === 1 ? '#2563eb' : '#cbd5e1'};
        border-radius: 6px;
        padding: 4px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        transition: all 0.15s ease;
      `;

      thumbCard.innerHTML = `
        <div style="font-size: 11px; font-weight: 700; color: #475569;">Стор. ${i}</div>
        <canvas class="pdf-thumb-canvas" width="120" height="160" style="width:100%; height:auto; background:#f8fafc; border-radius:3px; display:block;"></canvas>
      `;

      thumbCard.addEventListener('click', () => {
        renderMainPreview(i);
      });

      thumbsList.appendChild(thumbCard);

      // Фоновий рендер мініатюри
      pdf.getPage(i).then(page => {
        const thumbViewport = page.getViewport({ scale: 0.25 });
        const tCanvas = thumbCard.querySelector('.pdf-thumb-canvas');
        if (tCanvas) {
          tCanvas.width = thumbViewport.width;
          tCanvas.height = thumbViewport.height;
          const tCtx = tCanvas.getContext('2d');
          tCtx.fillStyle = '#ffffff';
          tCtx.fillRect(0, 0, tCanvas.width, tCanvas.height);
          page.render({ canvasContext: tCtx, viewport: thumbViewport });
        }
      });
    }
  }

  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) renderMainPreview(currentPage - 1);
  });

  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) renderMainPreview(currentPage + 1);
  });

  pageInput.addEventListener('change', () => {
    let p = parseInt(pageInput.value, 10);
    if (isNaN(p)) p = 1;
    p = Math.max(1, Math.min(totalPages, p));
    renderMainPreview(p);
  });

  insertBtn.addEventListener('click', () => {
    closeModal();
    if (onSelectPage) {
      onSelectPage(currentPage);
    }
  });

  // Перший рендер
  renderMainPreview(1);
  renderThumbnails();
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

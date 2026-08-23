/**
 * UGREAD Whiteboard - Storage & Comprehensive Export Engine
 * Features:
 * 1. Export as high-res PNG image (All visible layers: ruling, background, vectors, raster)
 * 2. Export as vector SVG (Fully scalable with embedded raster layers & markers)
 * 3. Print (Dedicated clean print stylesheet)
 * 4. Save as PDF document (Client-side jsPDF in landscape format)
 * 5. Save project to JSON (Complete state, all slides, drawings, visibility, simulations)
 * 6. Open project from JSON (Seamless restore of full workspace and element visibility)
 */

import { jsPDF } from 'jspdf';
import { state, getCurrentSlide, events, setTool, setStrokeColor, setStrokeWidth } from './state.js';
import { renderRuling } from './rulings.js';
import { saveSlideRasterData, clearRasterCanvas } from './rasterEngine.js';
import {
  getAllSimulationDrawingsCache,
  setAllSimulationDrawingsCache,
  getActiveSimulationData,
  restoreActiveSimulationData
} from './simulations.js';

export function initStorage() {
  const btnExportPNG = document.getElementById('exportPNG');
  const btnExportSVG = document.getElementById('exportSVG');
  const btnExportPrint = document.getElementById('exportPrint');
  const btnExportPDF = document.getElementById('exportPDF');
  const btnSaveCurrentPage = document.getElementById('saveCurrentPage');
  const btnSaveProject = document.getElementById('saveProject');
  const inputLoadProject = document.getElementById('loadProjectInput');

  if (btnExportPNG) btnExportPNG.addEventListener('click', () => { closeExportMenu(); exportAsPNG(); });
  if (btnExportSVG) btnExportSVG.addEventListener('click', () => { closeExportMenu(); exportAsSVG(); });
  if (btnExportPrint) btnExportPrint.addEventListener('click', () => { closeExportMenu(); printBoard(); });
  if (btnExportPDF) btnExportPDF.addEventListener('click', () => { closeExportMenu(); exportAsPDF(); });
  if (btnSaveCurrentPage) btnSaveCurrentPage.addEventListener('click', () => { closeExportMenu(); saveCurrentPageToFile(); });
  if (btnSaveProject) btnSaveProject.addEventListener('click', () => { closeExportMenu(); saveProjectToFile(); });
  if (inputLoadProject) inputLoadProject.addEventListener('change', (e) => { closeExportMenu(); loadProjectFromFile(e); });

  // Автозбереження кожні 15 секунд в LocalStorage
  setInterval(autoSaveToLocalStorage, 15000);
  restoreFromLocalStorage();
}

function closeExportMenu() {
  const exportDropdown = document.getElementById('exportDropdownWrap');
  if (exportDropdown) exportDropdown.classList.remove('open');
  const exportMenu = document.getElementById('exportMenu');
  if (exportMenu) exportMenu.classList.remove('show');
}

/**
 * Елегантне спливаюче сповіщення (Toast Notification)
 */
export function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-notification ${type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : ''}`;
  toast.innerHTML = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px) scale(0.95)';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3500);
}

/**
 * 1. Експорт у формат PNG зображення (Усе видиме на поточній дошці)
 */
export function exportAsPNG() {
  saveSlideRasterData();

  const svg = document.getElementById('boardSvg');
  const rasterCanvas = document.getElementById('rasterCanvas');
  const backdrop = document.getElementById('boardBackdrop');
  if (!svg) return;

  const exportW = svg.clientWidth || 1920;
  const exportH = svg.clientHeight || 1080;
  const scaleDPI = 2; // Висока якість (Hi-DPI)

  const canvas = document.createElement('canvas');
  canvas.width = exportW * scaleDPI;
  canvas.height = exportH * scaleDPI;
  const ctx = canvas.getContext('2d');
  ctx.scale(scaleDPI, scaleDPI);

  // 1. Фон дошки (за замовчуванням або колір розліновки)
  const bgColor = backdrop ? backdrop.getAttribute('fill') || '#ffffff' : '#ffffff';
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, exportW, exportH);

  // Створюємо клон SVG для рендеру лише ВИДИМИХ елементів
  const cloneSvg = svg.cloneNode(true);
  cloneSvg.setAttribute('width', exportW.toString());
  cloneSvg.setAttribute('height', exportH.toString());

  // Видаляємо допоміжні інтерактивні шари (курсорне кільце, рамку виділення, тощо)
  const cursorRings = cloneSvg.querySelectorAll('#cursorRing, .selection-box, .sel-handle, .sel-rotate-knob');
  cursorRings.forEach(el => el.remove());

  const svgData = new XMLSerializer().serializeToString(cloneSvg);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();

  img.onload = () => {
    ctx.drawImage(img, 0, 0, exportW, exportH);
    URL.revokeObjectURL(url);

    // Додаємо видимий растровий шар з урахуванням поточного трансформу
    if (rasterCanvas && rasterCanvas.style.display !== 'none') {
      ctx.save();
      const { scale, tx, ty } = state.view;
      ctx.translate(tx, ty);
      ctx.scale(scale, scale);
      ctx.drawImage(rasterCanvas, 0, 0);
      ctx.restore();
    }

    // Завантаження PNG
    try {
      const pngUrl = canvas.toDataURL('image/png');
      const dateStr = new Date().toISOString().slice(0, 10);
      const a = document.createElement('a');
      a.download = `ugread-board-${dateStr}.png`;
      a.href = pngUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('🖼️ Зображення PNG успішно завантажено!', 'success');
    } catch (err) {
      showToast('Помилка при збереженні PNG: ' + err.message, 'error');
    }
  };

  img.onerror = () => {
    URL.revokeObjectURL(url);
    showToast('Не вдалося сформувати PNG зображення', 'error');
  };

  img.src = url;
}

/**
 * 2. Експорт у векторний формат SVG (Векторне масштабування без втрати якості)
 */
export function exportAsSVG() {
  saveSlideRasterData();

  const svg = document.getElementById('boardSvg');
  const rasterCanvas = document.getElementById('rasterCanvas');
  const backdrop = document.getElementById('boardBackdrop');
  if (!svg) return;

  const exportW = svg.clientWidth || 1920;
  const exportH = svg.clientHeight || 1080;

  const cloneSvg = svg.cloneNode(true);
  cloneSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  cloneSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  cloneSvg.setAttribute('viewBox', `0 0 ${exportW} ${exportH}`);
  cloneSvg.setAttribute('width', exportW.toString());
  cloneSvg.setAttribute('height', exportH.toString());

  // Видаляємо інтерактивні елементи інтерфейсу
  const uiElements = cloneSvg.querySelectorAll('#cursorRing, .selection-box, .sel-handle, .sel-rotate-knob');
  uiElements.forEach(el => el.remove());

  // Інтегруємо растровий шар як вбудоване base64 зображення всередину векторного SVG
  if (rasterCanvas && rasterCanvas.style.display !== 'none') {
    try {
      const rasterDataUrl = rasterCanvas.toDataURL('image/png');
      const vp = cloneSvg.querySelector('#viewportGroup') || cloneSvg;
      const imgEl = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      imgEl.setAttribute('href', rasterDataUrl);
      imgEl.setAttribute('x', '0');
      imgEl.setAttribute('y', '0');
      imgEl.setAttribute('width', rasterCanvas.width.toString());
      imgEl.setAttribute('height', rasterCanvas.height.toString());
      imgEl.setAttribute('style', 'pointer-events:none;');
      vp.appendChild(imgEl);
    } catch (e) {}
  }

  const svgData = new XMLSerializer().serializeToString(cloneSvg);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);

  const a = document.createElement('a');
  a.download = `ugread-board-${dateStr}.svg`;
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('📐 Векторний файл SVG успішно збережено!', 'success');
}

/**
 * 3. Друкувати (Виклик вікна друку з чистими стилями)
 */
export function printBoard() {
  saveSlideRasterData();
  showToast('🖨️ Відкриваємо вікно друку...', 'info');
  setTimeout(() => {
    window.print();
  }, 100);
}

/**
 * 4. Зберегти як PDF документ (через бібліотеку jsPDF у високій якості)
 */
export function exportAsPDF() {
  saveSlideRasterData();

  const svg = document.getElementById('boardSvg');
  const rasterCanvas = document.getElementById('rasterCanvas');
  const backdrop = document.getElementById('boardBackdrop');
  if (!svg) return;

  const exportW = svg.clientWidth || 1920;
  const exportH = svg.clientHeight || 1080;
  const scaleDPI = 2;

  const canvas = document.createElement('canvas');
  canvas.width = exportW * scaleDPI;
  canvas.height = exportH * scaleDPI;
  const ctx = canvas.getContext('2d');
  ctx.scale(scaleDPI, scaleDPI);

  const bgColor = backdrop ? backdrop.getAttribute('fill') || '#ffffff' : '#ffffff';
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, exportW, exportH);

  const cloneSvg = svg.cloneNode(true);
  cloneSvg.setAttribute('width', exportW.toString());
  cloneSvg.setAttribute('height', exportH.toString());

  const uiElements = cloneSvg.querySelectorAll('#cursorRing, .selection-box, .sel-handle, .sel-rotate-knob');
  uiElements.forEach(el => el.remove());

  const svgData = new XMLSerializer().serializeToString(cloneSvg);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();

  img.onload = () => {
    ctx.drawImage(img, 0, 0, exportW, exportH);
    URL.revokeObjectURL(url);

    if (rasterCanvas && rasterCanvas.style.display !== 'none') {
      ctx.save();
      const { scale, tx, ty } = state.view;
      ctx.translate(tx, ty);
      ctx.scale(scale, scale);
      ctx.drawImage(rasterCanvas, 0, 0);
      ctx.restore();
    }

    try {
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      // Створюємо альбомний PDF (A4)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Масштабуємо з дотриманням пропорцій
      const aspect = exportW / exportH;
      let renderW = pageWidth;
      let renderH = pageWidth / aspect;
      let offsetX = 0;
      let offsetY = (pageHeight - renderH) / 2;

      if (renderH > pageHeight) {
        renderH = pageHeight;
        renderW = pageHeight * aspect;
        offsetX = (pageWidth - renderW) / 2;
        offsetY = 0;
      }

      pdf.addImage(imgData, 'JPEG', offsetX, offsetY, renderW, renderH);

      const dateStr = new Date().toISOString().slice(0, 10);
      pdf.save(`ugread-lesson-${dateStr}.pdf`);
      showToast('📑 Документ PDF успішно збережено!', 'success');
    } catch (err) {
      showToast('Помилка при створенні PDF: ' + err.message, 'error');
    }
  };

  img.onerror = () => {
    URL.revokeObjectURL(url);
    showToast('Не вдалося згенерувати PDF', 'error');
  };

  img.src = url;
}

/**
 * 5. Збереження ТІЛЬКИ поточної сторінки у файл JSON
 */
export function saveCurrentPageToFile() {
  saveSlideRasterData();

  const currentSlide = getCurrentSlide();
  const drawLayer = document.getElementById('drawingLayer');
  const bgLayer = document.getElementById('backgroundLayer');
  const rulingLayer = document.getElementById('rulingLayer');

  if (drawLayer) {
    currentSlide.drawingsHtml = drawLayer.innerHTML;
  }

  const activeSim = getActiveSimulationData();
  const simDrawingsCache = getAllSimulationDrawingsCache();

  const pageData = {
    app: 'UGREAD Whiteboard',
    type: 'single_page',
    version: '2.1',
    timestamp: new Date().toISOString(),
    pageIndex: state.currentSlideIndex,
    view: { ...state.view },
    settings: {
      tool: state.tool,
      shapeType: state.shapeType,
      strokeColor: state.strokeColor,
      strokeWidth: state.strokeWidth,
      strokeStyle: state.strokeStyle,
      fillEnabled: state.fillEnabled,
      fillColor: state.fillColor,
      opacity: state.opacity,
      drawMode: state.drawMode,
      multitouch: state.multitouch
    },
    activeSimulation: activeSim,
    simulationDrawingsCache: simDrawingsCache,
    slide: {
      id: currentSlide.id || (state.currentSlideIndex + 1),
      title: currentSlide.title || `Сторінка ${state.currentSlideIndex + 1}`,
      ruling: currentSlide.ruling || 'white',
      rulingScale: currentSlide.rulingScale || 32,
      marginMode: currentSlide.marginMode || 'none',
      drawingsHtml: drawLayer ? drawLayer.innerHTML : (currentSlide.drawingsHtml || ''),
      rasterData: currentSlide.rasterData || null,
      layerVisibility: {
        drawings: drawLayer ? drawLayer.style.display !== 'none' : true,
        background: bgLayer ? bgLayer.style.display !== 'none' : true,
        ruling: rulingLayer ? rulingLayer.style.display !== 'none' : true
      },
      simulation: currentSlide.simulation || null
    }
  };

  const jsonStr = JSON.stringify(pageData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);
  const pageNum = state.currentSlideIndex + 1;

  const a = document.createElement('a');
  a.download = `ugread-page-${pageNum}-${dateStr}.json`;
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`📄 Поточну сторінку (${pageNum}) збережено до JSON!`, 'success');
}

/**
 * 6. Збереження повного проєкту дошки у файл JSON (Всі слайди, видимість, симуляції)
 */
export function saveProjectToFile() {
  saveSlideRasterData();

  const currentSlide = getCurrentSlide();
  const drawLayer = document.getElementById('drawingLayer');
  const bgLayer = document.getElementById('backgroundLayer');
  const rulingLayer = document.getElementById('rulingLayer');

  if (drawLayer) {
    currentSlide.drawingsHtml = drawLayer.innerHTML;
  }

  const activeSim = getActiveSimulationData();
  const simDrawingsCache = getAllSimulationDrawingsCache();

  const projectData = {
    app: 'UGREAD Whiteboard',
    type: 'project',
    version: '2.1',
    timestamp: new Date().toISOString(),
    currentSlideIndex: state.currentSlideIndex,
    activeSubject: state.activeSubject,
    view: { ...state.view },
    settings: {
      tool: state.tool,
      shapeType: state.shapeType,
      strokeColor: state.strokeColor,
      strokeWidth: state.strokeWidth,
      strokeStyle: state.strokeStyle,
      fillEnabled: state.fillEnabled,
      fillColor: state.fillColor,
      opacity: state.opacity,
      drawMode: state.drawMode,
      multitouch: state.multitouch
    },
    activeSimulation: activeSim,
    simulationDrawingsCache: simDrawingsCache,
    slides: state.slides.map((s, idx) => {
      const isCurrent = idx === state.currentSlideIndex;
      return {
        id: s.id,
        title: s.title,
        ruling: s.ruling,
        rulingScale: s.rulingScale,
        marginMode: s.marginMode || 'none',
        drawingsHtml: isCurrent && drawLayer ? drawLayer.innerHTML : (s.drawingsHtml || ''),
        rasterData: s.rasterData || null,
        layerVisibility: {
          drawings: drawLayer ? drawLayer.style.display !== 'none' : true,
          background: bgLayer ? bgLayer.style.display !== 'none' : true,
          ruling: rulingLayer ? rulingLayer.style.display !== 'none' : true
        },
        simulation: s.simulation || null
      };
    })
  };

  const jsonStr = JSON.stringify(projectData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);

  const a = document.createElement('a');
  a.download = `ugread-project-${dateStr}.json`;
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`💾 Весь проєкт збережено! Кількість слайдів: ${state.slides.length}`, 'success');
}

/**
 * 7. Відкрити проєкт або окрему сторінку до дошки з файлу JSON
 */
export function loadProjectFromFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const project = JSON.parse(event.target.result);

      // Варіант A: Імпорт окремої сторінки (single_page)
      if (project.type === 'single_page' || (project.slide && !project.slides)) {
        const s = project.slide;
        if (!s) throw new Error('Не знайдено даних сторінки');

        const currentSlide = getCurrentSlide();
        currentSlide.title = s.title || `Сторінка ${state.currentSlideIndex + 1}`;
        currentSlide.ruling = s.ruling || 'white';
        currentSlide.rulingScale = s.rulingScale || 32;
        currentSlide.marginMode = s.marginMode || 'none';
        currentSlide.drawingsHtml = s.drawingsHtml || '';
        currentSlide.rasterData = s.rasterData || null;
        currentSlide.layerVisibility = s.layerVisibility || { drawings: true, background: true, ruling: true };
        currentSlide.simulation = s.simulation || null;
        currentSlide.undoStack = [];
        currentSlide.redoStack = [];

        if (project.view) {
          state.view = {
            scale: project.view.scale || 1.0,
            tx: project.view.tx || 0,
            ty: project.view.ty || 0
          };
        }

        if (project.settings) {
          if (project.settings.tool) setTool(project.settings.tool);
          if (project.settings.strokeColor) setStrokeColor(project.settings.strokeColor);
          if (project.settings.strokeWidth) setStrokeWidth(project.settings.strokeWidth);
          if (project.settings.drawMode) state.drawMode = project.settings.drawMode;
          if (project.settings.shapeType) state.shapeType = project.settings.shapeType;
        }

        if (project.simulationDrawingsCache) {
          setAllSimulationDrawingsCache(project.simulationDrawingsCache);
        }
        if (project.activeSimulation) {
          restoreActiveSimulationData(project.activeSimulation);
        }

        renderCurrentSlideState();
        showToast(`✅ Окрему сторінку успішно завантажено на дошку!`, 'success');
        return;
      }

      // Варіант B: Імпорт повного проєкту з багатьма слайдами
      if (!project.slides || !Array.isArray(project.slides) || project.slides.length === 0) {
        throw new Error('Невірний формат файлу проєкту');
      }

      // 1. Відновлення слайдів
      state.slides = project.slides.map(s => ({
        id: s.id,
        title: s.title || `Сторінка ${s.id}`,
        ruling: s.ruling || 'white',
        rulingScale: s.rulingScale || 32,
        marginMode: s.marginMode || 'none',
        drawingsHtml: s.drawingsHtml || '',
        rasterData: s.rasterData || null,
        layerVisibility: s.layerVisibility || { drawings: true, background: true, ruling: true },
        simulation: s.simulation || null,
        undoStack: [],
        redoStack: []
      }));

      // 2. Відновлення активного слайду та огляду
      state.currentSlideIndex = Math.min(
        Math.max(0, project.currentSlideIndex || 0),
        state.slides.length - 1
      );

      if (project.view) {
        state.view = {
          scale: project.view.scale || 1.0,
          tx: project.view.tx || 0,
          ty: project.view.ty || 0
        };
      }

      // 3. Відновлення налаштувань інструментів
      if (project.settings) {
        if (project.settings.tool) setTool(project.settings.tool);
        if (project.settings.strokeColor) setStrokeColor(project.settings.strokeColor);
        if (project.settings.strokeWidth) setStrokeWidth(project.settings.strokeWidth);
        if (project.settings.drawMode) state.drawMode = project.settings.drawMode;
        if (project.settings.shapeType) state.shapeType = project.settings.shapeType;
      }

      // 4. Відновлення кешу симуляцій
      if (project.simulationDrawingsCache) {
        setAllSimulationDrawingsCache(project.simulationDrawingsCache);
      }

      // 5. Відновлення активної симуляції
      if (project.activeSimulation) {
        restoreActiveSimulationData(project.activeSimulation);
      }

      // 6. Відновлення графічного вмісту поточної сторінки
      renderCurrentSlideState();

      // 7. Відновлення видимості шарів
      const currentSlide = getCurrentSlide();
      if (currentSlide.layerVisibility) {
        const drawLayer = document.getElementById('drawingLayer');
        const bgLayer = document.getElementById('backgroundLayer');
        const rulingLayer = document.getElementById('rulingLayer');

        if (drawLayer && currentSlide.layerVisibility.drawings !== undefined) {
          drawLayer.style.display = currentSlide.layerVisibility.drawings ? 'block' : 'none';
        }
        if (bgLayer && currentSlide.layerVisibility.background !== undefined) {
          bgLayer.style.display = currentSlide.layerVisibility.background ? 'block' : 'none';
        }
        if (rulingLayer && currentSlide.layerVisibility.ruling !== undefined) {
          rulingLayer.style.display = currentSlide.layerVisibility.ruling ? 'block' : 'none';
        }
      }

      // 8. Оновлення індикатора слайдів
      events.emit('slide:change', { index: state.currentSlideIndex, total: state.slides.length });

      showToast(`✅ Проєкт успішно відкрито! Відновлено ${state.slides.length} сторінок.`, 'success');
    } catch (err) {
      showToast('Помилка при читанні проєкту: ' + err.message, 'error');
    } finally {
      e.target.value = '';
    }
  };

  reader.readAsText(file);
}

/**
 * Відображення стану поточного слайду на полотні
 */
export function renderCurrentSlideState() {
  const slide = getCurrentSlide();
  const drawLayer = document.getElementById('drawingLayer');
  if (drawLayer) {
    drawLayer.innerHTML = slide.drawingsHtml || '';
  }

  // Оновлюємо розліновку
  renderRuling();

  // Оновлюємо растровий шар
  events.emit('slide:change', { index: state.currentSlideIndex, total: state.slides.length });

  // Синхронізуємо елементи керування розліновкою
  const rulingSel = document.getElementById('rulingSelect');
  const scaleInput = document.getElementById('rulingScaleInput');
  const scaleVal = document.getElementById('rulingScaleVal');

  if (rulingSel) rulingSel.value = slide.ruling || 'white';
  if (scaleInput) scaleInput.value = slide.rulingScale || 32;
  if (scaleVal) scaleVal.textContent = `${slide.rulingScale || 32}px`;
}

function autoSaveToLocalStorage() {
  try {
    saveSlideRasterData();
    const currentSlide = getCurrentSlide();
    const drawLayer = document.getElementById('drawingLayer');
    if (drawLayer) {
      currentSlide.drawingsHtml = drawLayer.innerHTML;
    }
    const data = {
      slides: state.slides.map(s => ({
        id: s.id,
        title: s.title,
        ruling: s.ruling,
        rulingScale: s.rulingScale,
        marginMode: s.marginMode || 'none',
        drawingsHtml: s.drawingsHtml || '',
        rasterData: s.rasterData || null,
        simulation: s.simulation || null
      })),
      currentIndex: state.currentSlideIndex,
      activeSubject: state.activeSubject
    };
    localStorage.setItem('ugread_board_autosave', JSON.stringify(data));
  } catch (e) {
    // LocalStorage quota full or private mode
  }
}

function restoreFromLocalStorage() {
  try {
    const saved = localStorage.getItem('ugread_board_autosave');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.slides && data.slides.length > 0) {
        state.slides = data.slides.map(s => ({
          ...s,
          undoStack: [],
          redoStack: []
        }));
        state.currentSlideIndex = data.currentIndex || 0;
        if (data.activeSubject) state.activeSubject = data.activeSubject;
      }
    }
  } catch (e) {
    // ignore
  }
}

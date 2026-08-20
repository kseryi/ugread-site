/**
 * UGREAD Whiteboard - Storage & Export Engine
 * Export to high-res PNG, SVG, PDF/Print, and full project JSON save/load with offline localStorage
 */

import { state, getCurrentSlide, events } from './state.js';
import { renderRuling } from './rulings.js';

export function initStorage() {
  const btnExportPNG = document.getElementById('exportPNG');
  const btnExportSVG = document.getElementById('exportSVG');
  const btnExportPrint = document.getElementById('exportPrint');
  const btnSaveProject = document.getElementById('saveProject');
  const inputLoadProject = document.getElementById('loadProjectInput');

  if (btnExportPNG) btnExportPNG.addEventListener('click', exportAsPNG);
  if (btnExportSVG) btnExportSVG.addEventListener('click', exportAsSVG);
  if (btnExportPrint) btnExportPrint.addEventListener('click', () => window.print());
  if (btnSaveProject) btnSaveProject.addEventListener('click', saveProjectToFile);
  if (inputLoadProject) inputLoadProject.addEventListener('change', loadProjectFromFile);

  // Автозбереження в LocalStorage кожні 15 секунд
  setInterval(autoSaveToLocalStorage, 15000);
  // Відновлення при завантаженні якщо є
  restoreFromLocalStorage();
}

/**
 * Експорт у формат PNG зображення
 */
export function exportAsPNG() {
  const svg = document.getElementById('boardSvg');
  if (!svg) return;

  const svgData = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = svg.clientWidth || 1920;
    canvas.height = svg.clientHeight || 1080;
    const ctx = canvas.getContext('2d');

    // Білий фон
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    URL.revokeObjectURL(url);
    const pngUrl = canvas.toDataURL('image/png');

    const a = document.createElement('a');
    a.download = `ugread-board-${new Date().toISOString().slice(0, 10)}.png`;
    a.href = pngUrl;
    a.click();
  };
  img.src = url;
}

/**
 * Експорт у векторний формат SVG
 */
export function exportAsSVG() {
  const svg = document.getElementById('boardSvg');
  if (!svg) return;

  const svgData = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.download = `ugread-board-${new Date().toISOString().slice(0, 10)}.svg`;
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Збереження всього проєкту дошки у файл JSON
 */
export function saveProjectToFile() {
  // Зберігаємо поточний стан малюнків для всіх слайдів
  const currentSlide = getCurrentSlide();
  const drawLayer = document.getElementById('drawingLayer');
  if (drawLayer) {
    currentSlide.drawingsHtml = drawLayer.innerHTML;
  }

  const projectData = {
    version: '2.0',
    timestamp: new Date().toISOString(),
    slides: state.slides.map(s => ({
      id: s.id,
      title: s.title,
      ruling: s.ruling,
      rulingScale: s.rulingScale,
      marginMode: s.marginMode || 'right',
      drawingsHtml: s.drawingsHtml || ''
    }))
  };

  const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.download = `ugread-lesson-${new Date().toISOString().slice(0, 10)}.json`;
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Завантаження проєкту дошки з файлу JSON
 */
export function loadProjectFromFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const project = JSON.parse(event.target.result);
      if (project.slides && Array.isArray(project.slides)) {
        state.slides = project.slides.map(s => ({
          ...s,
          undoStack: [],
          redoStack: []
        }));
        state.currentSlideIndex = 0;
        events.emit('slide:change', { index: 0, total: state.slides.length });
        renderCurrentSlideState();
      }
    } catch (err) {
      alert('Помилка при зчитуванні файлу проєкту: ' + err.message);
    }
  };
  reader.readAsText(file);
}

export function renderCurrentSlideState() {
  const slide = getCurrentSlide();
  const drawLayer = document.getElementById('drawingLayer');
  if (drawLayer) {
    drawLayer.innerHTML = slide.drawingsHtml || '';
  }

  // Оновлюємо розліновку
  renderRuling();

  const rulingSel = document.getElementById('rulingSelect');
  const marginSel = document.getElementById('marginSelect');
  const scaleInput = document.getElementById('rulingScaleInput');
  const scaleVal = document.getElementById('rulingScaleVal');

  if (rulingSel) rulingSel.value = slide.ruling || 'white';
  if (marginSel) marginSel.value = slide.marginMode || 'none';
  if (scaleInput) scaleInput.value = slide.rulingScale || 32;
  if (scaleVal) scaleVal.textContent = `${slide.rulingScale || 32}px`;
}

function autoSaveToLocalStorage() {
  try {
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
        marginMode: s.marginMode || 'right',
        drawingsHtml: s.drawingsHtml || ''
      })),
      currentIndex: state.currentSlideIndex
    };
    localStorage.setItem('ugread_board_autosave', JSON.stringify(data));
  } catch (e) {
    // quota exceeded or private mode
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
      }
    }
  } catch (e) {
    // ignore
  }
}

/**
 * UGREAD Whiteboard - Main Application Bootstrapper
 * Pure Vanilla JavaScript ES6 (No TS/TSX, 100% Offline Autonomy)
 */

import {
  state,
  events,
  setTool,
  setShapeType,
  setStrokeColor,
  setStrokeWidth,
  setStrokeStyle,
  setFillEnabled,
  setOpacity,
  setRuling,
  setRulingScale,
  setMarginMode,
  addSlide,
  deleteCurrentSlide,
  prevSlide,
  nextSlide,
  getCurrentSlide
} from './core/state.js';

import { renderRuling } from './core/rulings.js';
import { initMultiTouchEngine, undo, redo, clearBoard } from './core/multitouch.js';
import { initBoardViewport, setZoom, resetZoom, insertImage, deselectObject } from './core/board.js';
import { initRasterEngine, saveSlideRasterData } from './core/rasterEngine.js';
import { initInstruments } from './core/instruments.js';
import { initSimulationSystem } from './core/simulations.js';
import { initStorage, renderCurrentSlideState, showToast } from './core/storage.js';
import { initCursorRing } from './core/cursorRing.js';
import { handlePdfOrImageFile } from './core/pdfLoader.js';

// Імпорт предметних модулів
import { renderInformaticsPanel } from './modules/informatics.js';
import { renderPrimarySchoolPanel } from './modules/primary.js';
import { renderUkrainianPanel } from './modules/ukrainian.js';
import { renderMathPanel } from './modules/math.js';
import { renderGeographyPanel } from './modules/geography.js';
import { renderPhysicsPanel } from './modules/physics.js';
import { renderChemistryPanel } from './modules/chemistry.js';
import { renderHistoryPanel } from './modules/history.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Ініціалізація підсистем полотна
  const svgBoard = document.getElementById('boardSvg');
  initMultiTouchEngine(svgBoard);
  initBoardViewport();
  initRasterEngine();
  initInstruments();
  initSimulationSystem();
  initStorage();
  initCursorRing();

  // 2. Рендер початкової розліновки (Чиста біла дошка)
  renderRuling();

  // 3. Зв'язування подій інтерфейсу
  bindToolbarEvents();
  bindSlideNavEvents();
  bindSubjectModuleEvents();
  bindFullscreenFab();
  bindModalDialog();

  // 4. Завантаження початкового предметного модуля (Інформатика з полем URL)
  // На планшетах та менших екранах (<= 1200px) тримаємо панель згорнутою за замовчуванням,
  // щоб вся дошка одразу займала повну ширину екрану
  const shouldAutoOpenSidebar = window.innerWidth > 1200;
  loadSubjectModule('informatics', shouldAutoOpenSidebar);

  // 5. Оновлення стану при зміні розміру вікна
  window.addEventListener('resize', () => {
    renderRuling();
  });
});

/**
 * Зв'язування кнопок головної панелі інструментів (малювання, кольори, товщина)
 */
function bindToolbarEvents() {
  const shapesPaletteWrap = document.querySelector('#btnShapesMenu')?.closest('.dropdown-wrap-side');
  const shapeMenuBtn = document.getElementById('btnShapesMenu');

  const rasterShapesPaletteWrap = document.querySelector('#btnRasterShapesMenu')?.closest('.dropdown-wrap-side');
  const rasterShapeMenuBtn = document.getElementById('btnRasterShapesMenu');

  const vectorToolsSection = document.getElementById('vectorToolsSection');
  const rasterToolsSection = document.getElementById('rasterToolsSection');

  // Перемикач режиму Вектор / Растр (Segmented Switch)
  const btnVector = document.getElementById('btnModeVector');
  const btnRaster = document.getElementById('btnModeRaster');
  const toggleSwitch = document.getElementById('drawModeToggleSwitch');

  function setDrawMode(mode) {
    state.drawMode = mode;
    if (mode === 'raster') {
      btnVector?.classList.remove('active');
      btnRaster?.classList.add('active');
      toggleSwitch?.classList.add('is-raster');

      if (vectorToolsSection) vectorToolsSection.style.display = 'none';
      if (rasterToolsSection) rasterToolsSection.style.display = 'block';

      // Активуємо активний растровий інструмент
      const activeRasterBtn = rasterToolsSection?.querySelector('.tool-btn.active');
      if (activeRasterBtn) {
        setTool(activeRasterBtn.dataset.rasterTool || 'pencil');
      } else {
        setTool('pencil');
      }
    } else {
      btnRaster?.classList.remove('active');
      btnVector?.classList.add('active');
      toggleSwitch?.classList.remove('is-raster');

      if (rasterToolsSection) rasterToolsSection.style.display = 'none';
      if (vectorToolsSection) vectorToolsSection.style.display = 'block';

      // Активуємо активний векторний інструмент
      const activeVectorBtn = vectorToolsSection?.querySelector('.tool-btn.active');
      if (activeVectorBtn) {
        setTool(activeVectorBtn.dataset.tool || 'pencil');
      } else {
        setTool('pencil');
      }
    }
    events.emit('drawMode:change', mode);
  }

  if (btnVector) {
    btnVector.addEventListener('click', (e) => {
      e.stopPropagation();
      setDrawMode('vector');
    });
  }

  if (btnRaster) {
    btnRaster.addEventListener('click', (e) => {
      e.stopPropagation();
      setDrawMode('raster');
    });
  }

  if (toggleSwitch) {
    toggleSwitch.addEventListener('click', (e) => {
      if (e.target === toggleSwitch || e.target.id === 'modeToggleSlider') {
        setDrawMode(state.drawMode === 'vector' ? 'raster' : 'vector');
      }
    });
  }

  // Синхронізація класу курсору при будь-якій зміні інструменту
  events.on('tool:change', (tool) => {
    const svg = document.getElementById('boardSvg');
    if (svg) svg.setAttribute('class', `board-svg tool-${tool}`);
  });

  // 1. Векторні інструменти малювання
  document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tool = btn.dataset.tool;

      // Якщо це кнопка меню фігур - перемикаємо відкриття палітри
      if (btn.id === 'btnShapesMenu') {
        if (shapesPaletteWrap) {
          const wasOpen = shapesPaletteWrap.classList.contains('open');
          document.querySelectorAll('.dropdown-wrap-side').forEach(w => w.classList.remove('open'));
          if (!wasOpen) {
            shapesPaletteWrap.classList.add('open');
          }
        }
      } else {
        // Закриваємо всі відкриті палітри при виборі іншого інструменту
        document.querySelectorAll('.dropdown-wrap-side').forEach(w => w.classList.remove('open'));
      }

      document.querySelectorAll('#vectorToolsSection .tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setTool(tool);

      // Оновлюємо курсор SVG
      const svg = document.getElementById('boardSvg');
      if (svg) svg.setAttribute('class', `board-svg tool-${tool}`);
    });
  });

  // 2. Растрові інструменти малювання
  document.querySelectorAll('.tool-btn[data-raster-tool]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tool = btn.dataset.rasterTool;

      if (btn.id === 'btnRasterShapesMenu') {
        if (rasterShapesPaletteWrap) {
          const wasOpen = rasterShapesPaletteWrap.classList.contains('open');
          document.querySelectorAll('.dropdown-wrap-side').forEach(w => w.classList.remove('open'));
          if (!wasOpen) {
            rasterShapesPaletteWrap.classList.add('open');
          }
        }
      } else {
        document.querySelectorAll('.dropdown-wrap-side').forEach(w => w.classList.remove('open'));
      }

      document.querySelectorAll('#rasterToolsSection .tool-btn[data-raster-tool]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setTool(tool);

      const svg = document.getElementById('boardSvg');
      if (svg) svg.setAttribute('class', `board-svg tool-${tool}`);
    });
  });

  // Растрові фігури (вибір лінія, прямокутник, коло)
  document.querySelectorAll('.shape-opt[data-raster-shape]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const shape = btn.dataset.rasterShape;
      document.querySelectorAll('#rasterShapesPalette .shape-opt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setShapeType(shape);
      setTool('shape');

      if (rasterShapeMenuBtn) {
        document.querySelectorAll('#rasterToolsSection .tool-btn[data-raster-tool]').forEach(b => b.classList.remove('active'));
        rasterShapeMenuBtn.classList.add('active');
      }

      if (rasterShapesPaletteWrap) rasterShapesPaletteWrap.classList.remove('open');

      const svg = document.getElementById('boardSvg');
      if (svg) svg.setAttribute('class', 'board-svg tool-shape');
    });
  });

  // Меню вимірювальних лінійок (клік-перемикач)
  const btnRulerTools = document.getElementById('btnRulerTools');
  if (btnRulerTools) {
    btnRulerTools.addEventListener('click', (e) => {
      e.stopPropagation();
      const wrap = btnRulerTools.closest('.dropdown-wrap-side');
      if (wrap) {
        const wasOpen = wrap.classList.contains('open');
        document.querySelectorAll('.dropdown-wrap-side').forEach(w => w.classList.remove('open'));
        document.querySelectorAll('.dropdown-wrap').forEach(w => w.classList.remove('open'));
        if (!wasOpen) wrap.classList.add('open');
      }
    });
  }

  // Меню Експорту / Збереження (клік-перемикач та надійне відкриття)
  const btnExportMenu = document.getElementById('btnExportMenu');
  const exportDropdownWrap = document.getElementById('exportDropdownWrap');
  if (btnExportMenu && exportDropdownWrap) {
    btnExportMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasOpen = exportDropdownWrap.classList.contains('open');
      document.querySelectorAll('.dropdown-wrap').forEach(w => w.classList.remove('open'));
      document.querySelectorAll('.dropdown-wrap-side').forEach(w => w.classList.remove('open'));
      if (!wasOpen) {
        exportDropdownWrap.classList.add('open');
      }
    });
  }

  // Закриття випадних меню при кліку будь-де поза ними
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-wrap-side') && !e.target.closest('.dropdown-wrap')) {
      document.querySelectorAll('.dropdown-wrap-side').forEach(w => w.classList.remove('open'));
      document.querySelectorAll('.dropdown-wrap').forEach(w => w.classList.remove('open'));
      document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
    }
  });

  // Векторні фігури (вибір конкретної геометричної фігури)
  document.querySelectorAll('#shapesPalette .shape-opt[data-shape]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const shape = btn.dataset.shape;
      document.querySelectorAll('#shapesPalette .shape-opt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setShapeType(shape);
      setTool('shape');

      // Активуємо кнопку меню фігур та оновлюємо її іконку
      if (shapeMenuBtn) {
        document.querySelectorAll('#vectorToolsSection .tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
        shapeMenuBtn.classList.add('active');
        
        // Підставляємо SVG обраної фігури в іконку меню
        const iconSvg = btn.querySelector('svg');
        if (iconSvg) {
          shapeMenuBtn.innerHTML = iconSvg.outerHTML;
        }
      }

      // Закриваємо палітру після вибору
      if (shapesPaletteWrap) shapesPaletteWrap.classList.remove('open');

      const svg = document.getElementById('boardSvg');
      if (svg) svg.setAttribute('class', 'board-svg tool-shape');
    });
  });

  // Мультитач перемикач
  const btnMultitouch = document.getElementById('btnMultitouch');
  if (btnMultitouch) {
    btnMultitouch.addEventListener('click', () => {
      state.multitouch = !state.multitouch;
      btnMultitouch.classList.toggle('active', state.multitouch);
    });
  }

  // Відміна / Повтор
  const btnUndo = document.getElementById('btnUndo');
  const btnRedo = document.getElementById('btnRedo');
  if (btnUndo) btnUndo.addEventListener('click', undo);
  if (btnRedo) btnRedo.addEventListener('click', redo);

  // Очистити дошку (Миттєва та надійна дія з можливістю скасування)
  const btnClear = document.getElementById('btnClearBoard');
  if (btnClear) {
    btnClear.addEventListener('click', (e) => {
      e.stopPropagation();
      clearBoard();
    });
  }

  // Кольори
  const nativeColor = document.getElementById('strokeColorInput');
  const colorPreview = document.getElementById('colorPreview');

  if (nativeColor) {
    nativeColor.addEventListener('input', (e) => {
      const col = e.target.value;
      setStrokeColor(col);
      if (colorPreview) colorPreview.style.background = col;
      document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
    });
  }

  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const col = dot.dataset.color;
      document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      setStrokeColor(col);
      if (colorPreview) colorPreview.style.background = col;
      if (nativeColor) nativeColor.value = col;
    });
  });

  // Синхронізація кольору після піпетки (Eyedropper)
  events.on('stroke:color', (col) => {
    if (colorPreview) colorPreview.style.background = col;
    if (nativeColor) nativeColor.value = col;
    document.querySelectorAll('.color-dot').forEach(d => {
      d.classList.toggle('active', d.dataset.color.toLowerCase() === col.toLowerCase());
    });
  });

  // Товщина лінії / пензля
  const widthInput = document.getElementById('strokeWidthInput');
  const widthVal = document.getElementById('strokeWidthVal');
  if (widthInput) {
    widthInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      setStrokeWidth(val);
      if (widthVal) widthVal.textContent = `${val}px`;
    });
  }

  // Непрозорість (Opacity)
  const opacityInput = document.getElementById('opacityInput');
  const opacityVal = document.getElementById('opacityVal');
  if (opacityInput) {
    opacityInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      setOpacity(val / 100);
      if (opacityVal) opacityVal.textContent = `${val}%`;
    });
  }

  // Стиль лінії (solid, dashed, dotted)
  document.querySelectorAll('.style-btn[data-style]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setStrokeStyle(btn.dataset.style);
    });
  });

  // Заливка фігури
  const fillCheckbox = document.getElementById('fillCheckbox');
  if (fillCheckbox) {
    fillCheckbox.addEventListener('change', (e) => {
      setFillEnabled(e.target.checked);
    });
  }

  // Розліновка зошита / Фон
  const rulingSelect = document.getElementById('rulingSelect');
  const rulingScaleInput = document.getElementById('rulingScaleInput');
  const rulingScaleVal = document.getElementById('rulingScaleVal');

  if (rulingSelect) {
    rulingSelect.addEventListener('change', (e) => {
      setRuling(e.target.value);
      renderRuling();
    });
  }

  if (rulingScaleInput) {
    rulingScaleInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      setRulingScale(val);
      if (rulingScaleVal) rulingScaleVal.textContent = `${val}px`;
      renderRuling();
    });
  }

  // Вставка зображення або PDF документа через файл-інпут
  const imgInput = document.getElementById('imageUploadInput');
  if (imgInput) {
    imgInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      handlePdfOrImageFile(file, { x: 160, y: 140, width: 650 });
      e.target.value = '';
    });
  }

  // Зум HUD кнопки
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnFitScreen = document.getElementById('btnFitScreen');
  const hudZoomVal = document.getElementById('hudZoomValue');

  if (btnZoomIn) btnZoomIn.addEventListener('click', () => setZoom(state.view.scale * 1.2));
  if (btnZoomOut) btnZoomOut.addEventListener('click', () => setZoom(state.view.scale * 0.8));
  if (btnFitScreen) btnFitScreen.addEventListener('click', resetZoom);
  if (hudZoomVal) hudZoomVal.addEventListener('click', resetZoom);

  // Перемикач лівої панелі
  const btnToggleLeft = document.getElementById('btnToggleLeft');
  const leftToolbar = document.getElementById('leftToolbar');
  if (btnToggleLeft && leftToolbar) {
    btnToggleLeft.addEventListener('click', () => {
      leftToolbar.classList.toggle('collapsed');
    });
  }

  // Перемикач правої панелі
  const btnToggleRight = document.getElementById('btnToggleRight');
  const btnCloseRight = document.getElementById('btnCloseRightSidebar');
  const rightSidebar = document.getElementById('rightSidebar');

  if (btnToggleRight && rightSidebar) {
    btnToggleRight.addEventListener('click', () => {
      rightSidebar.classList.toggle('collapsed');
    });
  }
  if (btnCloseRight && rightSidebar) {
    btnCloseRight.addEventListener('click', () => {
      rightSidebar.classList.add('collapsed');
    });
  }
}

/**
 * Навігація по слайдах уроку
 */
function bindSlideNavEvents() {
  const btnPrev = document.getElementById('btnPrevSlide');
  const btnNext = document.getElementById('btnNextSlide');
  const btnAdd = document.getElementById('btnAddSlide');
  const btnDelete = document.getElementById('btnDeleteSlide');
  const indicator = document.getElementById('slideIndicator');

  function saveCurrentSlideContent() {
    saveSlideRasterData();
    const currentSlide = getCurrentSlide();
    const drawLayer = document.getElementById('drawingLayer');
    if (drawLayer && currentSlide) {
      currentSlide.drawingsHtml = drawLayer.innerHTML;
    }
  }

  function updateIndicator() {
    if (indicator) {
      indicator.textContent = `${state.currentSlideIndex + 1} / ${state.slides.length}`;
    }
  }

  let isNavigating = false;
  function debounceNav(action) {
    if (isNavigating) return;
    isNavigating = true;
    try {
      saveCurrentSlideContent();
      action();
      renderCurrentSlideState();
      updateIndicator();
    } finally {
      setTimeout(() => {
        isNavigating = false;
      }, 150);
    }
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      debounceNav(() => {
        prevSlide();
      });
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      debounceNav(() => {
        nextSlide();
      });
    });
  }

  if (btnAdd) {
    btnAdd.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      debounceNav(() => {
        addSlide();
        showToast(`➕ Створено нову сторінку (${state.slides.length})`, 'info');
      });
    });
  }

  if (btnDelete) {
    btnDelete.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      debounceNav(() => {
        const wasDeleted = deleteCurrentSlide();
        if (wasDeleted) {
          showToast(`🗑️ Сторінку видалено. Поточна: ${state.currentSlideIndex + 1} / ${state.slides.length}`, 'info');
        } else {
          showToast(`🧹 Сторінку очищено`, 'info');
        }
      });
    });
  }

  events.on('slide:change', () => {
    updateIndicator();
  });
}

/**
 * Перемикання предметних модулів
 */
function bindSubjectModuleEvents() {
  const select = document.getElementById('subjectSelect');
  if (!select) return;

  select.addEventListener('change', (e) => {
    loadSubjectModule(e.target.value);
  });

  // Обробка активації будь-якого інструменту/кнопки з правої панелі
  const rightSidebar = document.getElementById('rightSidebar');
  if (rightSidebar) {
    rightSidebar.addEventListener('click', (e) => {
      const btn = e.target.closest('button, .module-btn, .syntax-btn, .sound-chip, .calligraphy-btn, .chem-el-btn, .quick-sentence-btn');
      if (btn) {
        // 1. Деактивуємо всі інструменти лівої панелі доти, доки користувач сам на них не натисне
        document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.shape-opt').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.dropdown-wrap-side').forEach(w => w.classList.remove('open'));
        
        // 2. Скидаємо виділення та забороняємо hover-підсвічування
        deselectObject();
        if (state.tool === 'select') {
          state.tool = 'shape';
          const svg = document.getElementById('boardSvg');
          if (svg) svg.setAttribute('class', 'board-svg');
        }
      }
    });
  }
}

function loadSubjectModule(subjectKey, autoOpen = true) {
  state.activeSubject = subjectKey;
  const title = document.getElementById('subjectPanelTitle');
  const content = document.getElementById('subjectPanelContent');
  const rightSidebar = document.getElementById('rightSidebar');

  // Розгортаємо праву панель при явному виборі або на великих екранах
  if (rightSidebar) {
    if (autoOpen) {
      rightSidebar.classList.remove('collapsed');
    } else {
      rightSidebar.classList.add('collapsed');
    }
  }

  switch (subjectKey) {
    case 'informatics':
      if (title) title.textContent = '💻 Інформатика & Веб (URL)';
      renderInformaticsPanel(content);
      break;
    case 'primary':
      if (title) title.textContent = '🎒 Початкова школа';
      renderPrimarySchoolPanel(content);
      break;
    case 'ukr':
      if (title) title.textContent = '📖 Українська мова';
      renderUkrainianPanel(content);
      break;
    case 'math':
      if (title) title.textContent = '📐 Математика & Геометрія';
      renderMathPanel(content);
      break;
    case 'geography':
      if (title) title.textContent = '🌍 Географія & Карти';
      renderGeographyPanel(content);
      break;
    case 'physics':
      if (title) title.textContent = '⚡ Фізика & Схеми';
      renderPhysicsPanel(content);
      break;
    case 'chemistry':
      if (title) title.textContent = '🧪 Хімія & Елементи';
      renderChemistryPanel(content);
      break;
    case 'history':
    case 'simulations':
    default:
      if (title) title.textContent = '⏳ Історія & Симуляції';
      renderHistoryPanel(content);
      break;
  }
}

/**
 * Плаваюча кнопка Fullscreen з можливістю перетягування
 */
function bindFullscreenFab() {
  const fab = document.getElementById('fabFullscreen');
  const iconExpand = document.getElementById('fabIconExpand');
  const iconCompress = document.getElementById('fabIconCompress');

  if (!fab) return;

  function toggleFS() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  function syncIcon() {
    const isFS = !!document.fullscreenElement;
    if (iconExpand) iconExpand.style.display = isFS ? 'none' : 'block';
    if (iconCompress) iconCompress.style.display = isFS ? 'block' : 'none';
  }

  fab.addEventListener('click', toggleFS);
  document.addEventListener('fullscreenchange', syncIcon);
}

/**
 * Модальні діалогові вікна
 */
function bindModalDialog() {
  const backdrop = document.getElementById('appModalBackdrop');
  const closeBtn = document.getElementById('btnModalClose');

  if (closeBtn && backdrop) {
    closeBtn.addEventListener('click', () => {
      backdrop.style.display = 'none';
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.style.display = 'none';
      }
    });
  }
}

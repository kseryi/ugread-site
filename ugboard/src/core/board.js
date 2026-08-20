/**
 * UGREAD Whiteboard - Board Viewport, Pan/Zoom & Selection / Transformation System
 * Advanced Shape Transformation: Resize (8 handles), Free Rotate (knob & degree presets),
 * Drag/Move, Delete, Stroke Color, Fill Color & Floating Quick Toolbar.
 * Zero-glitch, smooth hardware-accelerated SVG transformation synchronization.
 */

import { state, events } from './state.js';
import { getBoardPoint, registerUndoAction } from './multitouch.js';

let isPanning = false;
let panStart = { x: 0, y: 0 };

// Selection & Transformation state
export let selectedElement = null;
let isDraggingElement = false;
let isRotatingElement = false;
let activeTransformHandle = null;
let transformStartPt = { x: 0, y: 0 };
let transformInitialState = null;

export function initBoardViewport() {
  const container = document.getElementById('boardContainer');
  const svg = document.getElementById('boardSvg');

  // Зум колесом миші
  container.addEventListener('wheel', handleWheel, { passive: false });

  // Події дошки (панорамування, клік по фігурах, вибір та трансформація)
  svg.addEventListener('pointerdown', handleBoardPointerDown);
  window.addEventListener('pointermove', handleBoardPointerMove);
  window.addEventListener('pointerup', handleBoardPointerUp);
  window.addEventListener('pointercancel', handleBoardPointerUp);

  // Клавіатурні скорочення (Delete, Backspace, Ctrl+D, Ctrl+Z, Escape)
  window.addEventListener('keydown', handleKeyDown);

  // Вставка картинок з буфера обміну (Ctrl+V)
  window.addEventListener('paste', handleClipboardPaste);

  // Слухаємо зміну кольору або заливки на глобальній панелі
  events.on('stroke:color', (color) => {
    if (selectedElement) updateSelectedElementStroke(color);
  });
  events.on('stroke:width', (width) => {
    if (selectedElement) updateSelectedElementStrokeWidth(width);
  });
  events.on('fill:change', ({ enabled, color }) => {
    if (selectedElement) updateSelectedElementFill(color, enabled);
  });

  applyViewTransform();
}

export function applyViewTransform() {
  const vp = document.getElementById('viewportGroup');
  if (!vp) return;
  const { scale, tx, ty } = state.view;
  vp.setAttribute('transform', `translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${scale.toFixed(3)})`);

  const hudVal = document.getElementById('hudZoomValue');
  if (hudVal) {
    hudVal.textContent = `${Math.round(scale * 100)}%`;
  }
}

export function setZoom(newScale, focalX, focalY) {
  const svg = document.getElementById('boardSvg');
  const rect = svg.getBoundingClientRect();
  const cx = focalX !== undefined ? focalX : rect.width / 2;
  const cy = focalY !== undefined ? focalY : rect.height / 2;

  const currentScale = state.view.scale;
  const clampedScale = Math.min(5.0, Math.max(0.2, newScale));

  const dx = (cx - state.view.tx) * (clampedScale / currentScale - 1);
  const dy = (cy - state.view.ty) * (clampedScale / currentScale - 1);

  state.view.tx -= dx;
  state.view.ty -= dy;
  state.view.scale = clampedScale;

  applyViewTransform();
  updateFloatingToolbarPosition();
}

export function resetZoom() {
  state.view.scale = 1.0;
  state.view.tx = 0;
  state.view.ty = 0;
  applyViewTransform();
  updateFloatingToolbarPosition();
}

function handleWheel(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(state.view.scale * factor, e.clientX, e.clientY);
  } else {
    e.preventDefault();
    state.view.tx -= e.deltaX;
    state.view.ty -= e.deltaY;
    applyViewTransform();
    updateFloatingToolbarPosition();
  }
}

function handleBoardPointerDown(e) {
  // Панорамування (середня кнопка миші або пробіл)
  if (e.button === 1 || e.spaceKey) {
    isPanning = true;
    panStart = { x: e.clientX, y: e.clientY };
    return;
  }

  const svg = document.getElementById('boardSvg');
  const pt = getBoardPoint(e, svg);

  // Вставка тексту
  if (state.tool === 'text') {
    insertTextBox(pt);
    return;
  }

  // Якщо активний інструмент "Гумка" — дозволяємо стирання без вибору
  if (state.tool === 'eraser') {
    return;
  }

  // 1. Клік на ручку обертання фігури
  const rotKnob = e.target.closest('.sel-rotate-knob');
  if (rotKnob && selectedElement) {
    e.stopPropagation();
    isRotatingElement = true;
    const { cx, cy, tx, ty, rot } = getElementTransformData(selectedElement);
    const centerBoard = { x: cx + tx, y: cy + ty };
    transformInitialState = {
      rot,
      center: centerBoard,
      startAngle: Math.atan2(pt.y - centerBoard.y, pt.x - centerBoard.x) * (180 / Math.PI)
    };
    hideFloatingToolbar();
    return;
  }

  // 2. Клік на маркер зміни розміру
  const handle = e.target.closest('.selection-handle');
  if (handle && selectedElement) {
    e.stopPropagation();
    activeTransformHandle = handle.dataset.handle;
    const { cx, cy, tx, ty, sx, sy } = getElementTransformData(selectedElement);
    const centerBoard = { x: cx + tx, y: cy + ty };
    transformInitialState = {
      sx,
      sy,
      center: centerBoard,
      startDist: Math.hypot(pt.x - centerBoard.x, pt.y - centerBoard.y)
    };
    hideFloatingToolbar();
    return;
  }

  // 3. Клік на вже виділений об'єкт або його рамку виділення (перетягування)
  const selGroup = e.target.closest('#activeSelectionGroup');
  const drawItem = e.target.closest('#drawingLayer > *');

  if (selGroup && selectedElement) {
    e.stopPropagation();
    isDraggingElement = true;
    transformStartPt = { x: pt.x, y: pt.y };
    const { tx, ty } = getElementTransformData(selectedElement);
    transformInitialState = { tx, ty };
    hideFloatingToolbar();
    return;
  }

  // 4. Клік на будь-який інший об'єкт на дошці — миттєвий вибір та поява маркерів редагування
  if (drawItem) {
    e.stopPropagation();
    if (selectedElement !== drawItem) {
      selectObject(drawItem);
    }
    isDraggingElement = true;
    transformStartPt = { x: pt.x, y: pt.y };
    const { tx, ty } = getElementTransformData(selectedElement);
    transformInitialState = { tx, ty };
    hideFloatingToolbar();
    return;
  }

  // 5. Клік на порожнє місце полотна (скидання виділення, якщо активний режим Select)
  if (state.tool === 'select') {
    deselectObject();
  }
}

function handleBoardPointerMove(e) {
  if (isPanning) {
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    state.view.tx += dx;
    state.view.ty += dy;
    panStart = { x: e.clientX, y: e.clientY };
    applyViewTransform();
    updateFloatingToolbarPosition();
    return;
  }

  if (!selectedElement) return;

  const svg = document.getElementById('boardSvg');
  const pt = getBoardPoint(e, svg);
  const selGroup = document.getElementById('activeSelectionGroup');

  // А. Плавне обертання без перестворення DOM
  if (isRotatingElement) {
    const { center, startAngle, rot } = transformInitialState;
    const curAngle = Math.atan2(pt.y - center.y, pt.x - center.x) * (180 / Math.PI);
    const angleDiff = curAngle - startAngle;
    const newRot = Math.round((rot + angleDiff) % 360);

    selectedElement.dataset.rot = newRot.toString();
    applyElementTransform(selectedElement);
    if (selGroup) applyElementTransform(selGroup);
    return;
  }

  // Б. Плавне масштабування / зміна розміру
  if (activeTransformHandle) {
    const { center, startDist, sx, sy } = transformInitialState;
    const curDist = Math.hypot(pt.x - center.x, pt.y - center.y);
    const scaleFactor = Math.max(0.08, curDist / Math.max(8, startDist));

    const newSx = Math.max(0.08, sx * scaleFactor);
    const newSy = Math.max(0.08, sy * scaleFactor);

    selectedElement.dataset.sx = newSx.toFixed(3);
    selectedElement.dataset.sy = newSy.toFixed(3);
    applyElementTransform(selectedElement);
    if (selGroup) applyElementTransform(selGroup);
    return;
  }

  // В. Плавне переміщення
  if (isDraggingElement) {
    const dx = pt.x - transformStartPt.x;
    const dy = pt.y - transformStartPt.y;
    const newTx = transformInitialState.tx + dx;
    const newTy = transformInitialState.ty + dy;

    selectedElement.dataset.tx = newTx.toFixed(1);
    selectedElement.dataset.ty = newTy.toFixed(1);
    applyElementTransform(selectedElement);
    if (selGroup) applyElementTransform(selGroup);
    return;
  }
}

function handleBoardPointerUp() {
  isPanning = false;

  const wasTransforming = isDraggingElement || isRotatingElement || activeTransformHandle;
  isDraggingElement = false;
  isRotatingElement = false;
  activeTransformHandle = null;

  if (wasTransforming && selectedElement) {
    showFloatingToolbar();
  }
}

/**
 * Ініціалізація локальних даних геометрії елемента
 */
function initElementTransformData(el) {
  if (!el.dataset.cx || !el.dataset.cy) {
    try {
      const bbox = el.getBBox();
      el.dataset.x0 = bbox.x.toFixed(1);
      el.dataset.y0 = bbox.y.toFixed(1);
      el.dataset.cx = (bbox.x + bbox.width / 2).toFixed(1);
      el.dataset.cy = (bbox.y + bbox.height / 2).toFixed(1);
      el.dataset.width = bbox.width.toFixed(1);
      el.dataset.height = bbox.height.toFixed(1);
    } catch (e) {
      el.dataset.x0 = '0';
      el.dataset.y0 = '0';
      el.dataset.cx = '50';
      el.dataset.cy = '50';
      el.dataset.width = '100';
      el.dataset.height = '100';
    }
  }

  if (el.dataset.tx === undefined) el.dataset.tx = '0';
  if (el.dataset.ty === undefined) el.dataset.ty = '0';
  if (el.dataset.rot === undefined) el.dataset.rot = '0';
  if (el.dataset.sx === undefined) el.dataset.sx = '1';
  if (el.dataset.sy === undefined) el.dataset.sy = '1';
}

function getElementTransformData(el) {
  initElementTransformData(el);
  return {
    x0: parseFloat(el.dataset.x0 || '0'),
    y0: parseFloat(el.dataset.y0 || '0'),
    cx: parseFloat(el.dataset.cx || '0'),
    cy: parseFloat(el.dataset.cy || '0'),
    width: parseFloat(el.dataset.width || '100'),
    height: parseFloat(el.dataset.height || '100'),
    tx: parseFloat(el.dataset.tx || '0'),
    ty: parseFloat(el.dataset.ty || '0'),
    rot: parseFloat(el.dataset.rot || '0'),
    sx: parseFloat(el.dataset.sx || '1'),
    sy: parseFloat(el.dataset.sy || '1')
  };
}

function applyElementTransform(el) {
  const { cx, cy, tx, ty, rot, sx, sy } = getElementTransformData(selectedElement || el);
  el.setAttribute(
    'transform',
    `translate(${tx} ${ty}) translate(${cx} ${cy}) rotate(${rot}) scale(${sx} ${sy}) translate(${-cx} ${-cy})`
  );
}

/**
 * Виділення об'єкта та створення SVG-рамки з маркерами та плаваючою панеллю
 */
export function selectObject(el) {
  if (!el || !el.parentNode) return;

  deselectObject();
  selectedElement = el;
  el.classList.add('selected-element');

  // Активуємо інструмент "Вибір" на панелі
  state.tool = 'select';
  document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
  const selectBtn = document.querySelector('.tool-btn[data-tool="select"]');
  if (selectBtn) selectBtn.classList.add('active');

  const svg = document.getElementById('boardSvg');
  if (svg) svg.className = 'board-svg tool-select';

  createSelectionGroup();
  showFloatingToolbar();
}

export function deselectObject() {
  if (selectedElement) {
    selectedElement.classList.remove('selected-element');
    selectedElement = null;
  }
  const selLayer = document.getElementById('selectionLayer');
  if (selLayer) selLayer.innerHTML = '';
  removeFloatingToolbar();
}

/**
 * Створення стабільної SVG-групи виділення з 8 маркерами та ручкою обертання
 */
function createSelectionGroup() {
  if (!selectedElement) return;

  const selLayer = document.getElementById('selectionLayer');
  if (!selLayer) return;
  selLayer.innerHTML = '';

  const { x0, y0, cx, cy, width, height } = getElementTransformData(selectedElement);

  const pad = 6;
  const bx = x0 - pad;
  const by = y0 - pad;
  const bw = Math.max(16, width) + pad * 2;
  const bh = Math.max(16, height) + pad * 2;

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.id = 'activeSelectionGroup';

  // 1. Пунктирна контурна рамка
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', bx.toString());
  rect.setAttribute('y', by.toString());
  rect.setAttribute('width', bw.toString());
  rect.setAttribute('height', bh.toString());
  rect.setAttribute('fill', 'rgba(37, 99, 235, 0.04)');
  rect.setAttribute('stroke', '#2563eb');
  rect.setAttribute('stroke-width', '1.8');
  rect.setAttribute('stroke-dasharray', '5 4');
  rect.style.cursor = 'move';
  g.appendChild(rect);

  // 2. Лінія до ручки повороту
  const rotLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  rotLine.setAttribute('x1', cx.toString());
  rotLine.setAttribute('y1', by.toString());
  rotLine.setAttribute('x2', cx.toString());
  rotLine.setAttribute('y2', (by - 28).toString());
  rotLine.setAttribute('stroke', '#2563eb');
  rotLine.setAttribute('stroke-width', '1.5');
  rotLine.setAttribute('stroke-dasharray', '2 2');
  g.appendChild(rotLine);

  // 3. Ручка повороту (🔄)
  const rotGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  rotGroup.classList.add('sel-rotate-knob');
  rotGroup.style.cursor = 'grab';

  const rotCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  rotCircle.setAttribute('cx', cx.toString());
  rotCircle.setAttribute('cy', (by - 28).toString());
  rotCircle.setAttribute('r', '13');
  rotCircle.setAttribute('fill', '#2563eb');
  rotCircle.setAttribute('stroke', '#ffffff');
  rotCircle.setAttribute('stroke-width', '2');
  rotCircle.style.filter = 'drop-shadow(0 2px 5px rgba(0,0,0,0.3))';

  const rotIcon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  rotIcon.setAttribute('x', cx.toString());
  rotIcon.setAttribute('y', (by - 24).toString());
  rotIcon.setAttribute('text-anchor', 'middle');
  rotIcon.setAttribute('font-size', '12');
  rotIcon.setAttribute('fill', '#ffffff');
  rotIcon.style.userSelect = 'none';
  rotIcon.style.pointerEvents = 'none';
  rotIcon.textContent = '🔄';

  rotGroup.appendChild(rotCircle);
  rotGroup.appendChild(rotIcon);
  g.appendChild(rotGroup);

  // 4. Маркери масштабування (8 точок)
  const handles = [
    { x: bx, y: by, id: 'nw', cursor: 'nwse-resize' },
    { x: bx + bw, y: by, id: 'ne', cursor: 'nesw-resize' },
    { x: bx + bw, y: by + bh, id: 'se', cursor: 'nwse-resize' },
    { x: bx, y: by + bh, id: 'sw', cursor: 'nesw-resize' },
    { x: cx, y: by, id: 'n', cursor: 'ns-resize' },
    { x: cx, y: by + bh, id: 's', cursor: 'ns-resize' },
    { x: bx + bw, y: cy, id: 'e', cursor: 'ew-resize' },
    { x: bx, y: cy, id: 'w', cursor: 'ew-resize' }
  ];

  handles.forEach(h => {
    const handleRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    handleRect.classList.add('selection-handle');
    handleRect.dataset.handle = h.id;
    handleRect.setAttribute('x', (h.x - 5.5).toString());
    handleRect.setAttribute('y', (h.y - 5.5).toString());
    handleRect.setAttribute('width', '11');
    handleRect.setAttribute('height', '11');
    handleRect.setAttribute('rx', '2');
    handleRect.setAttribute('fill', '#ffffff');
    handleRect.setAttribute('stroke', '#2563eb');
    handleRect.setAttribute('stroke-width', '2');
    handleRect.style.cursor = h.cursor;
    g.appendChild(handleRect);
  });

  selLayer.appendChild(g);
  applyElementTransform(g);
}

/**
 * Плаваюча панель швидких дій над фігурою
 */
function showFloatingToolbar() {
  if (!selectedElement) return;

  let tb = document.getElementById('floatingShapeToolbar');
  if (!tb) {
    tb = document.createElement('div');
    tb.id = 'floatingShapeToolbar';
    tb.className = 'floating-shape-toolbar';
    document.body.appendChild(tb);
  }

  tb.style.display = 'flex';

  const curStroke = selectedElement.getAttribute('stroke') || '#1e3a8a';
  const curFill = selectedElement.getAttribute('fill') || 'none';
  const hasFill = curFill !== 'none' && curFill !== 'transparent';

  tb.innerHTML = `
    <!-- Колір контуру -->
    <div class="fl-tool-group" title="Колір лінії">
      <span class="fl-label">Лінія:</span>
      <input type="color" class="fl-color-pick" id="flStrokeColorPick" value="${curStroke.startsWith('#') ? curStroke : '#1e3a8a'}" />
      <div class="fl-color-presets">
        <button class="fl-dot" data-col="#2563eb" style="background:#2563eb;" title="Синій"></button>
        <button class="fl-dot" data-col="#dc2626" style="background:#dc2626;" title="Червоний"></button>
        <button class="fl-dot" data-col="#16a34a" style="background:#16a34a;" title="Зелений"></button>
        <button class="fl-dot" data-col="#0f172a" style="background:#0f172a;" title="Чорний"></button>
        <button class="fl-dot" data-col="#d97706" style="background:#d97706;" title="Жовтий"></button>
      </div>
    </div>

    <div class="fl-divider"></div>

    <!-- Заливка кольором -->
    <div class="fl-tool-group" title="Заливка кольором">
      <button class="fl-btn ${hasFill ? 'active' : ''}" id="flToggleFillBtn" title="${hasFill ? 'Вимкнути заливку' : 'Увімкнути заливку'}">
        🪣 ${hasFill ? 'Заливка: ВКЛ' : 'Заливка: НІ'}
      </button>
      <input type="color" class="fl-color-pick" id="flFillColorPick" value="${hasFill && curFill.startsWith('#') ? curFill : '#93c5fd'}" style="${hasFill ? '' : 'display:none;'}" />
    </div>

    <div class="fl-divider"></div>

    <!-- Товщина лінії -->
    <div class="fl-tool-group">
      <span class="fl-label">Товщина:</span>
      <button class="fl-btn fl-w-btn" data-w="2">2px</button>
      <button class="fl-btn fl-w-btn" data-w="4">4px</button>
      <button class="fl-btn fl-w-btn" data-w="8">8px</button>
    </div>

    <div class="fl-divider"></div>

    <!-- Поворот 90° -->
    <button class="fl-btn" id="flRotate90Btn" title="Повернути на 90°">🔄 90°</button>

    <!-- Дублювати -->
    <button class="fl-btn" id="flDuplicateBtn" title="Дублювати фігуру">📋 Копія</button>

    <!-- Видалити -->
    <button class="fl-btn fl-btn-danger" id="flDeleteBtn" title="Видалити фігуру">🗑️</button>
  `;

  // Зв'язування подій
  tb.querySelectorAll('.fl-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      updateSelectedElementStroke(dot.dataset.col);
    });
  });

  const strokePick = tb.querySelector('#flStrokeColorPick');
  if (strokePick) {
    strokePick.addEventListener('input', (e) => {
      e.stopPropagation();
      updateSelectedElementStroke(e.target.value);
    });
  }

  const toggleFill = tb.querySelector('#flToggleFillBtn');
  const fillPick = tb.querySelector('#flFillColorPick');
  if (toggleFill) {
    toggleFill.addEventListener('click', (e) => {
      e.stopPropagation();
      const willFill = !hasFill;
      const fCol = fillPick ? fillPick.value : '#93c5fd';
      updateSelectedElementFill(fCol, willFill);
    });
  }
  if (fillPick) {
    fillPick.addEventListener('input', (e) => {
      e.stopPropagation();
      updateSelectedElementFill(e.target.value, true);
    });
  }

  tb.querySelectorAll('.fl-w-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateSelectedElementStrokeWidth(parseInt(btn.dataset.w, 10));
    });
  });

  const rot90 = tb.querySelector('#flRotate90Btn');
  if (rot90) {
    rot90.addEventListener('click', (e) => {
      e.stopPropagation();
      rotateSelectedObject(90);
    });
  }

  const dupBtn = tb.querySelector('#flDuplicateBtn');
  if (dupBtn) {
    dupBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      duplicateSelectedObject();
    });
  }

  const delBtn = tb.querySelector('#flDeleteBtn');
  if (delBtn) {
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteSelectedObject();
    });
  }

  updateFloatingToolbarPosition();
}

function updateFloatingToolbarPosition() {
  const tb = document.getElementById('floatingShapeToolbar');
  const selGroup = document.getElementById('activeSelectionGroup');
  if (!tb || !selGroup || tb.style.display === 'none') return;

  try {
    const boxRect = selGroup.getBoundingClientRect();
    const tbWidth = tb.offsetWidth || 380;
    const posX = Math.max(20, Math.min(window.innerWidth - tbWidth - 20, boxRect.left + boxRect.width / 2 - tbWidth / 2));
    let posY = boxRect.top - 56;

    if (posY < 60) {
      posY = boxRect.bottom + 14;
    }

    tb.style.left = `${posX}px`;
    tb.style.top = `${posY}px`;
  } catch (err) {}
}

function hideFloatingToolbar() {
  const tb = document.getElementById('floatingShapeToolbar');
  if (tb) tb.style.display = 'none';
}

function removeFloatingToolbar() {
  const tb = document.getElementById('floatingShapeToolbar');
  if (tb) tb.remove();
}

/**
 * Оновлення кольору контуру
 */
export function updateSelectedElementStroke(color) {
  if (!selectedElement) return;

  if (selectedElement.tagName === 'g') {
    selectedElement.querySelectorAll('*').forEach(child => {
      if (child.getAttribute('stroke') && child.getAttribute('stroke') !== 'none') {
        child.setAttribute('stroke', color);
      }
    });
  } else {
    selectedElement.setAttribute('stroke', color);
  }

  state.strokeColor = color;
  const nativeCol = document.getElementById('strokeColorInput');
  const preview = document.getElementById('colorPreview');
  if (nativeCol) nativeCol.value = color;
  if (preview) preview.style.background = color;

  showFloatingToolbar();
}

/**
 * Оновлення заливки
 */
export function updateSelectedElementFill(color, enabled = true) {
  if (!selectedElement) return;

  const fillVal = enabled ? (color || '#93c5fd') : 'none';
  if (selectedElement.tagName === 'g') {
    selectedElement.querySelectorAll('polygon, rect, circle, ellipse, path').forEach(child => {
      child.setAttribute('fill', fillVal);
    });
  } else {
    selectedElement.setAttribute('fill', fillVal);
  }

  state.fillEnabled = enabled;
  if (enabled && color) state.fillColor = color;

  showFloatingToolbar();
}

/**
 * Оновлення товщини лінії
 */
export function updateSelectedElementStrokeWidth(width) {
  if (!selectedElement) return;

  if (selectedElement.tagName === 'g') {
    selectedElement.querySelectorAll('*').forEach(child => {
      if (child.getAttribute('stroke-width')) {
        child.setAttribute('stroke-width', width.toString());
      }
    });
  } else {
    selectedElement.setAttribute('stroke-width', width.toString());
  }

  state.strokeWidth = width;
  const wInput = document.getElementById('strokeWidthInput');
  const wVal = document.getElementById('strokeWidthVal');
  if (wInput) wInput.value = width;
  if (wVal) wVal.textContent = `${width}px`;

  showFloatingToolbar();
}

/**
 * Поворот на фіксовану кількість градусів
 */
export function rotateSelectedObject(deltaDeg) {
  if (!selectedElement) return;
  const { rot } = getElementTransformData(selectedElement);
  const newRot = Math.round((rot + deltaDeg) % 360);
  selectedElement.dataset.rot = newRot.toString();
  applyElementTransform(selectedElement);
  const selGroup = document.getElementById('activeSelectionGroup');
  if (selGroup) applyElementTransform(selGroup);
  updateFloatingToolbarPosition();
}

/**
 * Дублювання виділеного об'єкта
 */
export function duplicateSelectedObject() {
  if (!selectedElement || !selectedElement.parentNode) return;

  const clone = selectedElement.cloneNode(true);
  const drawLayer = document.getElementById('drawingLayer');

  const { tx, ty } = getElementTransformData(selectedElement);
  clone.dataset.tx = (tx + 30).toFixed(1);
  clone.dataset.ty = (ty + 30).toFixed(1);
  applyElementTransform(clone);

  drawLayer.appendChild(clone);
  registerUndoAction('add', clone);
  selectObject(clone);
}

/**
 * Видалення виділеного об'єкта
 */
export function deleteSelectedObject() {
  if (selectedElement) {
    const el = selectedElement;
    registerUndoAction('remove', el);
    deselectObject();
    el.remove();
  }
}

/**
 * Вставка інтерактивного текстового блоку
 */
export function insertTextBox(pt) {
  const drawLayer = document.getElementById('drawingLayer');
  const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
  fo.setAttribute('x', pt.x.toFixed(1));
  fo.setAttribute('y', pt.y.toFixed(1));
  fo.setAttribute('width', '280');
  fo.setAttribute('height', '120');

  const div = document.createElement('div');
  div.contentEditable = 'true';
  div.style.cssText = `
    width: 100%;
    height: 100%;
    min-height: 40px;
    font-family: var(--font-main);
    font-size: 22px;
    color: ${state.strokeColor};
    outline: 2px dashed #93c5fd;
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    word-break: break-word;
  `;
  div.textContent = 'Введіть текст...';

  div.addEventListener('blur', () => {
    div.style.outline = 'none';
    if (!div.textContent.trim()) {
      fo.remove();
    }
  });

  fo.appendChild(div);
  drawLayer.appendChild(fo);
  registerUndoAction('add', fo);

  setTimeout(() => {
    div.focus();
    const range = document.createRange();
    range.selectNodeContents(div);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }, 50);
}

/**
 * Вставка зображення
 */
export function insertImage(src, x = 100, y = 100, width = 300) {
  const drawLayer = document.getElementById('drawingLayer');
  const img = new Image();
  img.onload = () => {
    const ratio = img.height / img.width;
    const height = width * ratio;

    const svgImg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    svgImg.setAttributeNS('http://www.w3.org/1999/xlink', 'href', src);
    svgImg.setAttribute('href', src);
    svgImg.setAttribute('x', x);
    svgImg.setAttribute('y', y);
    svgImg.setAttribute('width', width);
    svgImg.setAttribute('height', height);

    drawLayer.appendChild(svgImg);
    registerUndoAction('add', svgImg);
    selectObject(svgImg);
  };
  img.src = src;
}

function handleClipboardPaste(e) {
  const items = (e.clipboardData || e.originalEvent.clipboardData).items;
  for (const item of items) {
    if (item.type.indexOf('image') === 0) {
      const blob = item.getAsFile();
      const reader = new FileReader();
      reader.onload = (event) => {
        insertImage(event.target.result, 150, 150);
      };
      reader.readAsDataURL(blob);
    }
  }
}

function handleKeyDown(e) {
  if (e.target.isContentEditable || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
    return;
  }

  if (e.key === 'Delete' || e.key === 'Backspace') {
    deleteSelectedObject();
  } else if (e.key === 'Escape') {
    deselectObject();
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
    e.preventDefault();
    duplicateSelectedObject();
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    if (e.shiftKey) {
      import('./multitouch.js').then(m => m.redo());
    } else {
      import('./multitouch.js').then(m => m.undo());
    }
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
    e.preventDefault();
    import('./multitouch.js').then(m => m.redo());
  }
}

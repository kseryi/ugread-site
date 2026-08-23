/**
 * UGREAD Whiteboard - Real-Time Brush & Eraser Cursor Size Ring & Tooltip
 * High-performance, hardware-accelerated visual feedback for vector and raster drawing/erasing.
 */

import { state, events } from './state.js';

let ringEl = null;
let sizeBadgeEl = null;
let isPointerOverBoard = false;
let lastPointerPos = { x: -100, y: -100 };
let badgeFadeTimeout = null;

export function initCursorRing() {
  const container = document.getElementById('boardContainer');
  if (!container) return;

  // Створюємо елемент кільця курсору якщо ще немає
  ringEl = document.getElementById('brushCursorRing');
  if (!ringEl) {
    ringEl = document.createElement('div');
    ringEl.id = 'brushCursorRing';
    ringEl.className = 'brush-cursor-ring';
    container.appendChild(ringEl);
  }

  // Створюємо бейдж із розміром (px)
  sizeBadgeEl = document.getElementById('brushSizeBadge');
  if (!sizeBadgeEl) {
    sizeBadgeEl = document.createElement('div');
    sizeBadgeEl.id = 'brushSizeBadge';
    sizeBadgeEl.className = 'brush-size-badge';
    container.appendChild(sizeBadgeEl);
  }

  // Відстежуємо рух вказівника над дошкою
  container.addEventListener('pointerenter', handlePointerEnter);
  container.addEventListener('pointerleave', handlePointerLeave);
  container.addEventListener('pointermove', handlePointerMove, { passive: true });
  container.addEventListener('pointerdown', handlePointerDown, { passive: true });
  container.addEventListener('pointerup', handlePointerUp, { passive: true });

  // Слухаємо реактивні зміни стану
  events.on('tool:change', updateCursorAppearance);
  events.on('style:change', (change) => {
    updateCursorAppearance();
    if (change && change.strokeWidth !== undefined) {
      showSizeBadge(change.strokeWidth);
    }
  });
  events.on('view:transform', updateCursorAppearance);
  events.on('drawMode:change', updateCursorAppearance);

  updateCursorAppearance();
}

function handlePointerEnter(e) {
  isPointerOverBoard = true;
  updatePosition(e.clientX, e.clientY);
  updateCursorAppearance();
}

function handlePointerLeave() {
  isPointerOverBoard = false;
  if (ringEl) ringEl.style.opacity = '0';
  if (sizeBadgeEl) sizeBadgeEl.style.opacity = '0';
}

function handlePointerMove(e) {
  isPointerOverBoard = true;
  lastPointerPos = { x: e.clientX, y: e.clientY };
  updatePosition(e.clientX, e.clientY);
}

function handlePointerDown(e) {
  lastPointerPos = { x: e.clientX, y: e.clientY };
  updatePosition(e.clientX, e.clientY);
}

function handlePointerUp(e) {
  lastPointerPos = { x: e.clientX, y: e.clientY };
  updatePosition(e.clientX, e.clientY);
}

function updatePosition(clientX, clientY) {
  if (!ringEl) return;
  const container = document.getElementById('boardContainer');
  if (!container) return;

  const rect = container.getBoundingClientRect();
  const relX = clientX - rect.left;
  const relY = clientY - rect.top;

  ringEl.style.transform = `translate3d(${relX}px, ${relY}px, 0) translate(-50%, -50%)`;

  if (sizeBadgeEl) {
    sizeBadgeEl.style.transform = `translate3d(${relX + 16}px, ${relY + 16}px, 0)`;
  }
}

/**
 * Розраховує точний діаметр кільця в екранних пікселях з урахуванням зуму
 */
export function getActiveCursorDiameter() {
  const tool = state.tool;
  const isRaster = state.drawMode === 'raster';
  const scale = state.view.scale;
  const sw = state.strokeWidth;

  let baseDiameter = sw;

  if (tool === 'eraser') {
    if (isRaster) {
      // Растрова піксельна гумка: radius = Math.max(10, sw * 2.8) -> diameter = radius * 2
      baseDiameter = Math.max(20, sw * 5.6);
    } else {
      // Векторна гумка: radius = Math.max(15, sw * 2) -> diameter = radius * 2
      baseDiameter = Math.max(30, sw * 4);
    }
  } else if (tool === 'highlighter') {
    baseDiameter = Math.max(18, sw * 3);
  } else if (tool === 'brush') {
    // Художній растровий пензель: radius = Math.max(4, sw * 1.5)
    baseDiameter = Math.max(8, sw * 3);
  } else if (tool === 'spray') {
    // Аерограф / спрей: radius = Math.max(12, sw * 2.8)
    baseDiameter = Math.max(24, sw * 5.6);
  } else if (tool === 'calligraphy') {
    baseDiameter = Math.max(6, sw * 3.6);
  } else if (tool === 'pencil') {
    baseDiameter = isRaster ? Math.max(2, sw) : Math.max(3, sw);
  } else if (tool === 'shape' || tool === 'raster_shape') {
    baseDiameter = Math.max(4, sw);
  } else {
    baseDiameter = sw;
  }

  // Екранний діаметр з урахуванням поточного масштабу
  const screenDiameter = Math.max(4, baseDiameter * scale);
  return { baseDiameter, screenDiameter };
}

/**
 * Оновлює вигляд та розмір кільця курсору
 */
export function updateCursorAppearance() {
  if (!ringEl) return;

  const tool = state.tool;
  const hideTools = ['select', 'text', 'eyedropper', 'laser'];

  // Якщо інструмент не потребує кільця або курсор за межами дошки
  if (hideTools.includes(tool) || !isPointerOverBoard) {
    ringEl.style.opacity = '0';
    ringEl.style.pointerEvents = 'none';
    return;
  }

  const { screenDiameter } = getActiveCursorDiameter();
  const diam = Math.round(screenDiameter);
  const radius = diam / 2;

  ringEl.style.width = `${diam}px`;
  ringEl.style.height = `${diam}px`;
  ringEl.style.borderRadius = '50%';
  ringEl.style.opacity = '1';
  ringEl.style.pointerEvents = 'none';

  // Стилізація для різних інструментів
  if (tool === 'eraser') {
    ringEl.className = 'brush-cursor-ring cursor-eraser';
    ringEl.style.borderColor = '#ef4444';
    ringEl.style.backgroundColor = 'rgba(239, 68, 68, 0.12)';
    ringEl.style.borderWidth = '1.8px';
    ringEl.style.borderStyle = 'dashed';
    ringEl.style.boxShadow = '0 0 0 1px rgba(255, 255, 255, 0.9), inset 0 0 4px rgba(239, 68, 68, 0.2)';
  } else if (tool === 'highlighter') {
    ringEl.className = 'brush-cursor-ring cursor-highlighter';
    ringEl.style.borderColor = state.strokeColor;
    ringEl.style.backgroundColor = hexToRgba(state.strokeColor, 0.35);
    ringEl.style.borderWidth = '1.5px';
    ringEl.style.borderStyle = 'solid';
    ringEl.style.boxShadow = '0 0 0 1px rgba(255, 255, 255, 0.8), 0 0 6px rgba(0, 0, 0, 0.15)';
  } else if (tool === 'spray') {
    ringEl.className = 'brush-cursor-ring cursor-spray';
    ringEl.style.borderColor = state.strokeColor;
    ringEl.style.backgroundColor = 'transparent';
    ringEl.style.borderWidth = '1.5px';
    ringEl.style.borderStyle = 'dotted';
    ringEl.style.boxShadow = '0 0 0 1px rgba(255, 255, 255, 0.8)';
  } else if (tool === 'brush') {
    ringEl.className = 'brush-cursor-ring cursor-brush';
    ringEl.style.borderColor = state.strokeColor;
    ringEl.style.backgroundColor = hexToRgba(state.strokeColor, 0.2);
    ringEl.style.borderWidth = '1.5px';
    ringEl.style.borderStyle = 'solid';
    ringEl.style.boxShadow = '0 0 0 1px rgba(255, 255, 255, 0.8), 0 0 4px rgba(0, 0, 0, 0.15)';
  } else {
    // Pencil / Pen / Default Drawing
    ringEl.className = 'brush-cursor-ring cursor-pen';
    ringEl.style.borderColor = state.strokeColor;
    ringEl.style.backgroundColor = diam < 8 ? state.strokeColor : 'rgba(0, 0, 0, 0.05)';
    ringEl.style.borderWidth = '1.5px';
    ringEl.style.borderStyle = 'solid';
    ringEl.style.boxShadow = '0 0 0 1px rgba(255, 255, 255, 0.9), 0 0 3px rgba(0, 0, 0, 0.2)';
  }
}

/**
 * Показує бейдж із числовим розміром (наприклад при зміні слайдера або виборі)
 */
export function showSizeBadge(sizePx) {
  if (!sizeBadgeEl || !isPointerOverBoard) return;

  const toolName = state.tool === 'eraser' ? 'Гумка' : (state.tool === 'highlighter' ? 'Маркер' : 'Перо');
  sizeBadgeEl.textContent = `${toolName}: ${Math.round(sizePx)}px`;
  sizeBadgeEl.style.opacity = '1';

  if (badgeFadeTimeout) clearTimeout(badgeFadeTimeout);
  badgeFadeTimeout = setTimeout(() => {
    if (sizeBadgeEl) sizeBadgeEl.style.opacity = '0';
  }, 1200);
}

function hexToRgba(hex, alpha = 1.0) {
  if (!hex) return `rgba(37, 99, 235, ${alpha})`;
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * UGREAD Whiteboard - Advanced Raster Canvas & Pixel Engine (Mode: Raster / R)
 * Provides authentic pixel-level drawing, soft painterly brushes, airbrush/spray,
 * pixel-accurate destination-out eraser, fast Uint32Array flood fill (bucket), eyedropper,
 * and high-fidelity multi-level Undo/Redo state snapshots (GPU-accelerated).
 */

import { state, events, getCurrentSlide } from './state.js';
import { registerUndoAction } from './multitouch.js';

let canvas = null;
let ctx = null;
let container = null;
let isDrawing = false;
let lastPt = null;
let strokeStartSnapshot = null;
let activeRasterShape = null;

// Temporary canvas for crisp live shape previews without affecting base canvas
let previewCanvas = null;
let previewCtx = null;

export function initRasterEngine() {
  canvas = document.getElementById('rasterCanvas');
  container = document.getElementById('rasterCanvasContainer');
  if (!canvas || !container) return;

  ctx = canvas.getContext('2d', { willReadFrequently: true });

  // Розмір растрового полотна (4000x3000px для чіткості при зумі)
  canvas.width = 4000;
  canvas.height = 3000;

  // Створюємо допоміжний шар для прев'ю растрових фігур
  if (!previewCanvas) {
    previewCanvas = document.createElement('canvas');
    previewCanvas.id = 'rasterPreviewCanvas';
    previewCanvas.width = 4000;
    previewCanvas.height = 3000;
    previewCanvas.style.position = 'absolute';
    previewCanvas.style.top = '0';
    previewCanvas.style.left = '0';
    previewCanvas.style.width = '4000px';
    previewCanvas.style.height = '3000px';
    previewCanvas.style.pointerEvents = 'none';
    previewCanvas.style.zIndex = '31';
    container.appendChild(previewCanvas);
    previewCtx = previewCanvas.getContext('2d');
  }

  syncRasterViewTransform();

  events.on('view:transform', syncRasterViewTransform);
  events.on('board:clear', clearRasterCanvas);
  events.on('slide:change', loadSlideRasterData);
}

export function syncRasterViewTransform() {
  if (!container) return;
  const { scale, tx, ty } = state.view;
  // Синхронізація з SVG viewportGroup
  container.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  container.style.transformOrigin = '0 0';
}

export function clearRasterCanvas() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (previewCtx && previewCanvas) {
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  }
}

/**
 * Отримує швидку GPU-копію поточного стану растрового полотна (HTMLCanvasElement)
 */
export function getRasterSnapshot() {
  if (!ctx || !canvas) return null;
  const snap = document.createElement('canvas');
  snap.width = canvas.width;
  snap.height = canvas.height;
  const snapCtx = snap.getContext('2d');
  if (snapCtx) {
    snapCtx.drawImage(canvas, 0, 0);
  }
  return snap;
}

/**
 * Відновлює растрове полотно зі знімка (HTMLCanvasElement або ImageData)
 */
export function restoreRasterSnapshot(snapshot) {
  if (!ctx || !canvas || !snapshot) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (snapshot instanceof HTMLCanvasElement || snapshot instanceof OffscreenCanvas || snapshot instanceof ImageBitmap || snapshot instanceof HTMLImageElement) {
    ctx.drawImage(snapshot, 0, 0);
  } else if (snapshot instanceof ImageData) {
    ctx.putImageData(snapshot, 0, 0);
  }
}

/**
 * Початок растрового малювання
 */
export function startRasterStroke(pt) {
  if (!ctx || !canvas) return;
  
  // 1. Інструмент: Піпетка кольору (Eyedropper)
  if (state.tool === 'eyedropper') {
    pickRasterColorAtPoint(pt);
    return;
  }

  // 2. Інструмент: Заливка замкнених ділянок (Bucket / Flood Fill)
  if (state.tool === 'bucket') {
    const beforeSnap = getRasterSnapshot();
    performFloodFill(Math.round(pt.x), Math.round(pt.y), state.strokeColor);
    const afterSnap = getRasterSnapshot();
    if (beforeSnap && afterSnap) {
      registerUndoAction('raster_snapshot', { before: beforeSnap, after: afterSnap });
    }
    saveSlideRasterDataDebounced();
    return;
  }

  isDrawing = true;
  lastPt = { ...pt };

  // Зберігаємо початковий знімок для Undo (миттєвий GPU clone)
  strokeStartSnapshot = getRasterSnapshot();

  // 3. Інструмент: Растрові фігури (Лінія, Прямокутник, Коло)
  if (state.tool === 'shape' || state.tool === 'raster_shape') {
    activeRasterShape = { start: { ...pt }, current: { ...pt } };
    renderRasterShapePreview();
    return;
  }

  // 4. Малювання початкової точки
  if (state.tool === 'eraser') {
    eraseRasterPixels(pt);
  } else if (state.tool === 'spray') {
    drawRasterSpray(pt);
  } else if (state.tool === 'brush') {
    drawRasterBrushDot(pt);
  } else {
    drawRasterDot(pt);
  }
}

/**
 * Продовження растрового малювання
 */
export function moveRasterStroke(pt) {
  if (!isDrawing || !ctx || !lastPt) return;

  if (state.tool === 'shape' || state.tool === 'raster_shape') {
    if (activeRasterShape) {
      activeRasterShape.current = { ...pt };
      renderRasterShapePreview();
    }
    return;
  }

  if (state.tool === 'eraser') {
    eraseRasterPixels(pt, lastPt);
  } else if (state.tool === 'spray') {
    drawRasterSpray(pt, lastPt);
  } else if (state.tool === 'brush') {
    drawRasterBrushLine(lastPt, pt);
  } else {
    drawRasterLine(lastPt, pt);
  }
  lastPt = { ...pt };
}

/**
 * Завершення растрового малювання
 */
export function endRasterStroke() {
  if (!isDrawing) return;
  isDrawing = false;

  // Якщо малювали растрову фігуру — запікаємо її на основний канвас
  if ((state.tool === 'shape' || state.tool === 'raster_shape') && activeRasterShape) {
    bakeRasterShape(activeRasterShape.start, activeRasterShape.current);
    if (previewCtx && previewCanvas) {
      previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    }
    activeRasterShape = null;
  }

  lastPt = null;

  // Реєструємо знімок у системі Undo/Redo
  const afterSnap = getRasterSnapshot();
  if (strokeStartSnapshot && afterSnap) {
    registerUndoAction('raster_snapshot', { before: strokeStartSnapshot, after: afterSnap });
  }
  strokeStartSnapshot = null;

  saveSlideRasterDataDebounced();
}

/**
 * Звичайний растровий олівець / маркер (Pencil & Highlighter)
 */
function drawRasterDot(pt) {
  if (!ctx) return;
  ctx.save();
  const alpha = state.tool === 'highlighter' ? 0.4 : (state.opacity !== undefined ? state.opacity : 1.0);
  ctx.fillStyle = hexToRgba(state.strokeColor, alpha);
  ctx.beginPath();
  const radius = state.tool === 'highlighter' ? Math.max(12, state.strokeWidth * 2) : Math.max(1, state.strokeWidth / 2);
  ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawRasterLine(p1, p2) {
  if (!ctx) return;
  ctx.save();
  ctx.beginPath();

  const alpha = state.tool === 'highlighter' ? 0.4 : (state.opacity !== undefined ? state.opacity : 1.0);
  ctx.strokeStyle = hexToRgba(state.strokeColor, alpha);
  ctx.lineWidth = state.tool === 'highlighter' ? Math.max(18, state.strokeWidth * 3) : state.strokeWidth;
  ctx.lineCap = state.tool === 'highlighter' ? 'square' : 'round';
  ctx.lineJoin = 'round';

  if (state.strokeStyle === 'dashed') {
    ctx.setLineDash([state.strokeWidth * 3, state.strokeWidth * 2]);
  } else if (state.strokeStyle === 'dotted') {
    ctx.setLineDash([1, state.strokeWidth * 2]);
  } else {
    ctx.setLineDash([]);
  }

  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
  ctx.restore();
}

/**
 * Художній м'який пензель (Artistic Brush / Watercolor)
 */
function drawRasterBrushDot(pt) {
  if (!ctx) return;
  ctx.save();
  const radius = Math.max(4, state.strokeWidth * 1.5);
  const alpha = (state.opacity !== undefined ? state.opacity : 1.0) * 0.7;

  const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, radius);
  grad.addColorStop(0, hexToRgba(state.strokeColor, alpha));
  grad.addColorStop(0.7, hexToRgba(state.strokeColor, alpha * 0.6));
  grad.addColorStop(1, hexToRgba(state.strokeColor, 0));

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawRasterBrushLine(p1, p2) {
  if (!ctx) return;
  const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const step = Math.max(2, state.strokeWidth / 3);
  const count = Math.ceil(dist / step);

  for (let i = 0; i <= count; i++) {
    const t = count === 0 ? 0 : i / count;
    const x = p1.x + (p2.x - p1.x) * t;
    const y = p1.y + (p2.y - p1.y) * t;
    drawRasterBrushDot({ x, y });
  }
}

/**
 * Аерограф / Спрей (Airbrush / Spray)
 */
function drawRasterSpray(pt, prevPt = null) {
  if (!ctx) return;
  ctx.save();
  const radius = Math.max(12, state.strokeWidth * 2.8);
  const density = Math.min(60, Math.max(15, state.strokeWidth * 4));
  const alpha = (state.opacity !== undefined ? state.opacity : 1.0) * 0.45;
  ctx.fillStyle = hexToRgba(state.strokeColor, alpha);

  const pts = prevPt ? [{ x: (pt.x + prevPt.x) / 2, y: (pt.y + prevPt.y) / 2 }, pt] : [pt];

  pts.forEach(p => {
    for (let i = 0; i < density; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      const x = p.x + Math.cos(angle) * r;
      const y = p.y + Math.sin(angle) * r;
      const dotSize = Math.random() * 1.5 + 0.5;

      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  ctx.restore();
}

/**
 * Точна піксельна гумка (Pixel-Level Destination-Out Eraser)
 */
export function eraseRasterPixels(pt, prevPt = null) {
  if (!ctx) return;
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';

  const radius = Math.max(10, state.strokeWidth * 2.8);

  if (prevPt) {
    ctx.beginPath();
    ctx.lineWidth = radius * 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(prevPt.x, prevPt.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Прев'ю растрової фігури (пряма, прямокутник, коло)
 */
function renderRasterShapePreview() {
  if (!previewCtx || !previewCanvas || !activeRasterShape) return;
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

  const { start, current } = activeRasterShape;
  const shape = state.shapeType || 'line';

  previewCtx.save();
  previewCtx.strokeStyle = hexToRgba(state.strokeColor, state.opacity !== undefined ? state.opacity : 1.0);
  previewCtx.lineWidth = state.strokeWidth;
  previewCtx.fillStyle = hexToRgba(state.fillColor, 0.4);
  previewCtx.lineCap = 'round';
  previewCtx.lineJoin = 'round';

  if (state.strokeStyle === 'dashed') {
    previewCtx.setLineDash([state.strokeWidth * 3, state.strokeWidth * 2]);
  } else if (state.strokeStyle === 'dotted') {
    previewCtx.setLineDash([1, state.strokeWidth * 2]);
  }

  drawShapeToContext(previewCtx, shape, start, current, state.fillEnabled);
  previewCtx.restore();
}

/**
 * Запікання растрової фігури на основне полотно
 */
function bakeRasterShape(start, end) {
  if (!ctx) return;
  ctx.save();
  ctx.strokeStyle = hexToRgba(state.strokeColor, state.opacity !== undefined ? state.opacity : 1.0);
  ctx.lineWidth = state.strokeWidth;
  ctx.fillStyle = hexToRgba(state.fillColor, state.opacity !== undefined ? state.opacity : 1.0);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (state.strokeStyle === 'dashed') {
    ctx.setLineDash([state.strokeWidth * 3, state.strokeWidth * 2]);
  } else if (state.strokeStyle === 'dotted') {
    ctx.setLineDash([1, state.strokeWidth * 2]);
  }

  const shape = state.shapeType || 'line';
  drawShapeToContext(ctx, shape, start, end, state.fillEnabled);
  ctx.restore();
}

function drawShapeToContext(targetCtx, shape, start, end, fillEnabled) {
  targetCtx.beginPath();
  const minX = Math.min(start.x, end.x);
  const minY = Math.min(start.y, end.y);
  const w = Math.abs(end.x - start.x);
  const h = Math.abs(end.y - start.y);

  if (shape === 'line') {
    targetCtx.moveTo(start.x, start.y);
    targetCtx.lineTo(end.x, end.y);
    targetCtx.stroke();
  } else if (shape === 'rect') {
    if (fillEnabled) targetCtx.fillRect(minX, minY, w, h);
    targetCtx.strokeRect(minX, minY, w, h);
  } else if (shape === 'circle' || shape === 'ellipse') {
    const rx = w / 2;
    const ry = h / 2;
    const cx = minX + rx;
    const cy = minY + ry;
    targetCtx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
    if (fillEnabled) targetCtx.fill();
    targetCtx.stroke();
  } else {
    // Default rect
    if (fillEnabled) targetCtx.fillRect(minX, minY, w, h);
    targetCtx.strokeRect(minX, minY, w, h);
  }
}

/**
 * Піпетка кольору (Eyedropper)
 */
export function pickRasterColorAtPoint(pt) {
  if (!ctx || !canvas) return;
  const x = Math.max(0, Math.min(canvas.width - 1, Math.round(pt.x)));
  const y = Math.max(0, Math.min(canvas.height - 1, Math.round(pt.y)));

  try {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    if (pixel[3] > 10) {
      const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
      state.strokeColor = hex;
      events.emit('stroke:color', hex);

      const colorInp = document.getElementById('strokeColorInput');
      const colorPrev = document.getElementById('colorPreview');
      if (colorInp) colorInp.value = hex;
      if (colorPrev) colorPrev.style.background = hex;
    }
  } catch (e) {
    console.error('Eyedropper read error:', e);
  }
}

/**
 * Заливка замкнених контурів кольором (Fast Uint32 Scanline Flood Fill)
 */
export function performFloodFill(startX, startY, fillColorHex) {
  if (!ctx || !canvas) return;
  const x0 = Math.floor(startX);
  const y0 = Math.floor(startY);
  if (x0 < 0 || x0 >= canvas.width || y0 < 0 || y0 >= canvas.height) return;

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = new Uint32Array(imgData.data.buffer);
  const width = canvas.width;
  const height = canvas.height;

  const targetColor = data[y0 * width + x0];
  const rgbArr = hexToRgbaArray(fillColorHex, state.opacity !== undefined ? state.opacity : 1.0);
  const fillInt = (rgbArr[3] << 24) | (rgbArr[2] << 16) | (rgbArr[1] << 8) | rgbArr[0];

  if (targetColor === fillInt) return;

  const queue = [x0 + y0 * width];
  const visited = new Uint8Array(width * height);
  visited[queue[0]] = 1;

  while (queue.length > 0) {
    const idx = queue.pop();
    const x = idx % width;
    const y = Math.floor(idx / width);

    if (data[idx] !== targetColor) continue;
    data[idx] = fillInt;

    if (x > 0 && !visited[idx - 1] && data[idx - 1] === targetColor) {
      visited[idx - 1] = 1;
      queue.push(idx - 1);
    }
    if (x < width - 1 && !visited[idx + 1] && data[idx + 1] === targetColor) {
      visited[idx + 1] = 1;
      queue.push(idx + 1);
    }
    if (y > 0 && !visited[idx - width] && data[idx - width] === targetColor) {
      visited[idx - width] = 1;
      queue.push(idx - width);
    }
    if (y < height - 1 && !visited[idx + width] && data[idx + width] === targetColor) {
      visited[idx + width] = 1;
      queue.push(idx + width);
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

function hexToRgbaArray(hex, alpha = 1) {
  if (!hex || typeof hex !== 'string') return [30, 58, 138, Math.round(alpha * 255)];
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return [30, 58, 138, Math.round(alpha * 255)];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255, Math.round(alpha * 255)];
}

function hexToRgba(hex, alpha = 1) {
  if (!hex || typeof hex !== 'string') return `rgba(30, 58, 138, ${alpha})`;
  if (hex.startsWith('rgba')) return hex;
  if (hex.startsWith('rgb')) {
    return hex.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
  }
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(30, 58, 138, ${alpha})`;
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}

let saveTimeout = null;
function saveSlideRasterDataDebounced() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveSlideRasterData();
  }, 400);
}

export function saveSlideRasterData() {
  const slide = getCurrentSlide();
  if (!slide || !canvas) return;
  try {
    slide.rasterData = canvas.toDataURL('image/png');
  } catch (e) {}
}

function loadSlideRasterData() {
  const slide = getCurrentSlide();
  clearRasterCanvas();
  if (!slide || !slide.rasterData || !ctx) return;

  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0);
  };
  img.src = slide.rasterData;
}

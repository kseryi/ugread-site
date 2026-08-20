/**
 * UGREAD Whiteboard - Multi-Touch & Multi-Pointer Stroke Engine
 * Allows multiple students / fingers / styluses to write simultaneously on interactive screens
 */

import { state, getCurrentSlide, events } from './state.js';

// Map of active pointer tracks: pointerId -> TrackObject
const activePointers = new Map();

// Laser trails with auto-fade
const laserTrails = [];

export function initMultiTouchEngine(svgElement) {
  svgElement.addEventListener('pointerdown', handlePointerDown);
  svgElement.addEventListener('pointermove', handlePointerMove);
  svgElement.addEventListener('pointerup', handlePointerUp);
  svgElement.addEventListener('pointercancel', handlePointerCancel);
  svgElement.addEventListener('pointerleave', handlePointerUp);
}

/**
 * Перетворює координати події у координати viewBox полотна з урахуванням Zoom та Pan
 */
export function getBoardPoint(evt, svgElement) {
  const rect = svgElement.getBoundingClientRect();
  const clientX = evt.clientX;
  const clientY = evt.clientY;

  const { scale, tx, ty } = state.view;
  const x = (clientX - rect.left - tx) / scale;
  const y = (clientY - rect.top - ty) / scale;

  return { x, y, pressure: evt.pressure || 0.5 };
}

function handlePointerDown(e) {
  // Ігноруємо кліки по шару виділення, маркерах, плаваючих панелях, інструментах
  // та по фігурах на дошці для вибору та редагування (якщо це не гумка)
  if (
    state.tool === 'select' ||
    e.target.closest('#selectionLayer') ||
    e.target.closest('.floating-shape-toolbar') ||
    e.target.closest('.instrument-widget') ||
    (state.tool !== 'eraser' && e.target.closest('#drawingLayer > *'))
  ) {
    return;
  }

  // Якщо мультитач вимкнено користувачем і вже є активний вказівник
  if (!state.multitouch && activePointers.size > 0) {
    return;
  }

  const svg = document.getElementById('boardSvg');
  const pt = getBoardPoint(e, svg);
  const pointerId = e.pointerId;

  // Створюємо трек для цього пальця/стилуса
  const track = {
    id: pointerId,
    tool: state.tool,
    shape: state.shapeType,
    strokeColor: state.strokeColor,
    strokeWidth: state.strokeWidth,
    strokeStyle: state.strokeStyle,
    fillEnabled: state.fillEnabled,
    fillColor: state.fillColor,
    startPoint: { ...pt },
    points: [pt],
    element: null,
    previewEl: null
  };

  activePointers.set(pointerId, track);

  // Створюємо відповідний SVG елемент для малювання
  const activeLayer = document.getElementById('activeStrokesLayer');
  
  if (track.tool === 'pencil' || track.tool === 'highlighter' || track.tool === 'calligraphy') {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`);
    applyStrokeStyles(path, track);
    activeLayer.appendChild(path);
    track.element = path;
  } else if (track.tool === 'laser') {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', pt.x);
    circle.setAttribute('cy', pt.y);
    circle.setAttribute('r', '8');
    circle.setAttribute('fill', '#ef4444');
    circle.setAttribute('filter', 'drop-shadow(0 0 6px #ef4444)');
    activeLayer.appendChild(circle);
    track.element = circle;
  } else if (track.tool === 'eraser') {
    performErase(pt);
  } else if (track.tool === 'shape') {
    track.previewEl = createShapePreview(track, pt);
    if (track.previewEl) {
      activeLayer.appendChild(track.previewEl);
    }
  }
}

function handlePointerMove(e) {
  const pointerId = e.pointerId;
  if (!activePointers.has(pointerId)) return;

  const track = activePointers.get(pointerId);
  const svg = document.getElementById('boardSvg');
  const pt = getBoardPoint(e, svg);

  track.points.push(pt);

  if (track.tool === 'pencil' || track.tool === 'highlighter') {
    if (track.element) {
      const d = computeSmoothPath(track.points);
      track.element.setAttribute('d', d);
    }
  } else if (track.tool === 'calligraphy') {
    if (track.element) {
      const d = computeCalligraphyRibbon(track.points, track.strokeWidth);
      track.element.setAttribute('d', d);
    }
  } else if (track.tool === 'laser') {
    if (track.element) {
      track.element.setAttribute('cx', pt.x);
      track.element.setAttribute('cy', pt.y);
      spawnLaserTrail(pt);
    }
  } else if (track.tool === 'eraser') {
    performErase(pt);
  } else if (track.tool === 'shape' && track.previewEl) {
    updateShapePreview(track.previewEl, track.shape, track.startPoint, pt);
  }
}

function handlePointerUp(e) {
  const pointerId = e.pointerId;
  if (!activePointers.has(pointerId)) return;

  const track = activePointers.get(pointerId);
  activePointers.delete(pointerId);

  const drawLayer = document.getElementById('drawingLayer');

  if (track.tool === 'pencil' || track.tool === 'highlighter' || track.tool === 'calligraphy') {
    if (track.element && track.element.parentNode) {
      track.element.remove();
      if (track.points.length > 1) {
        const finalEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        if (track.tool === 'calligraphy') {
          finalEl.setAttribute('d', computeCalligraphyRibbon(track.points, track.strokeWidth));
          finalEl.setAttribute('fill', track.strokeColor);
          finalEl.setAttribute('stroke', 'none');
        } else {
          finalEl.setAttribute('d', computeSmoothPath(track.points));
          applyStrokeStyles(finalEl, track);
        }
        drawLayer.appendChild(finalEl);
        registerUndoAction('add', finalEl);
      }
    }
  } else if (track.tool === 'shape' && track.previewEl) {
    track.previewEl.remove();
    const finalShape = createFinalShape(track, track.points[track.points.length - 1]);
    if (finalShape) {
      drawLayer.appendChild(finalShape);
      registerUndoAction('add', finalShape);

      // Миттєвий вибір створеної фігури (зміна розміру, поворот, колір, заливка, видалення)
      import('./board.js').then(m => {
        if (m.selectObject) {
          m.selectObject(finalShape);
        }
      });
    }
  } else if (track.tool === 'laser') {
    if (track.element) track.element.remove();
  }
}

function handlePointerCancel(e) {
  handlePointerUp(e);
}

/**
 * Плавне згладжування ліній рукописного тексту (Catmull-Rom / Quadratic Bezier)
 */
function computeSmoothPath(points) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.1} ${points[0].y + 0.1}`;

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midX = ((p0.x + p1.x) / 2).toFixed(1);
    const midY = ((p0.y + p1.y) / 2).toFixed(1);
    d += ` Q ${p0.x.toFixed(1)} ${p0.y.toFixed(1)}, ${midX} ${midY}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
  return d;
}

/**
 * Каліграфічне перо з кутом нахилу пера 45°
 */
function computeCalligraphyRibbon(points, width) {
  if (points.length < 2) return '';
  const nibAngle = (45 * Math.PI) / 180;
  const halfW = width * 1.8;
  const dx = Math.cos(nibAngle) * halfW;
  const dy = Math.sin(nibAngle) * halfW;

  const leftPoints = [];
  const rightPoints = [];

  points.forEach(p => {
    leftPoints.push({ x: p.x - dx, y: p.y - dy });
    rightPoints.push({ x: p.x + dx, y: p.y + dy });
  });

  let d = `M ${leftPoints[0].x.toFixed(1)} ${leftPoints[0].y.toFixed(1)}`;
  for (let i = 1; i < leftPoints.length; i++) {
    d += ` L ${leftPoints[i].x.toFixed(1)} ${leftPoints[i].y.toFixed(1)}`;
  }
  for (let i = rightPoints.length - 1; i >= 0; i--) {
    d += ` L ${rightPoints[i].x.toFixed(1)} ${rightPoints[i].y.toFixed(1)}`;
  }
  d += ' Z';
  return d;
}

function applyStrokeStyles(el, track) {
  el.setAttribute('fill', 'none');
  el.setAttribute('stroke', track.strokeColor);
  el.setAttribute('stroke-width', track.strokeWidth);
  el.setAttribute('stroke-linecap', 'round');
  el.setAttribute('stroke-linejoin', 'round');

  if (track.tool === 'highlighter') {
    el.setAttribute('stroke-width', Math.max(16, track.strokeWidth * 3));
    el.setAttribute('stroke-opacity', '0.35');
    el.setAttribute('stroke-linecap', 'square');
  }

  if (track.strokeStyle === 'dashed') {
    el.setAttribute('stroke-dasharray', `${track.strokeWidth * 3} ${track.strokeWidth * 2}`);
  } else if (track.strokeStyle === 'dotted') {
    el.setAttribute('stroke-dasharray', `1 ${track.strokeWidth * 2}`);
  }
}

/**
 * Гумка: стирання векторних ліній чи об'єктів при дотику
 */
function performErase(pt) {
  const drawLayer = document.getElementById('drawingLayer');
  if (!drawLayer) return;

  const radius = Math.max(15, state.strokeWidth * 2);
  const elements = Array.from(drawLayer.children);

  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    try {
      const bbox = el.getBBox();
      if (
        pt.x >= bbox.x - radius &&
        pt.x <= bbox.x + bbox.width + radius &&
        pt.y >= bbox.y - radius &&
        pt.y <= bbox.y + bbox.height + radius
      ) {
        registerUndoAction('remove', el);
        el.remove();
      }
    } catch (err) {
      // bbox may fail on empty paths
    }
  }
}

/**
 * Генератор синусоїдальної хвилястої лінії (Означення 〰)
 */
export function generateWavyPath(x1, y1, x2, y2, waveLength = 14, waveAmplitude = 4.5) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) return `M ${x1} ${y1} L ${x2} ${y2}`;

  const angle = Math.atan2(dy, dx);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const numWaves = Math.max(1, Math.round(dist / waveLength));
  const actualWaveLen = dist / numWaves;
  const halfWave = actualWaveLen / 2;

  let d = `M ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  
  for (let i = 0; i < numWaves; i++) {
    const startX = i * actualWaveLen;
    // first half wave (up arc)
    const mid1X = startX + halfWave / 2;
    const mid1Y = waveAmplitude;
    const end1X = startX + halfWave;
    
    // second half wave (down arc)
    const mid2X = startX + halfWave + halfWave / 2;
    const mid2Y = -waveAmplitude;
    const end2X = startX + actualWaveLen;

    const c1x = x1 + mid1X * cos - mid1Y * sin;
    const c1y = y1 + mid1X * sin + mid1Y * cos;
    const p1x = x1 + end1X * cos;
    const p1y = y1 + end1X * sin;

    const c2x = x1 + mid2X * cos - mid2Y * sin;
    const c2y = y1 + mid2X * sin + mid2Y * cos;
    const p2x = x1 + end2X * cos;
    const p2y = y1 + end2X * sin;

    d += ` Q ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${p1x.toFixed(1)} ${p1y.toFixed(1)}`;
    d += ` Q ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2x.toFixed(1)} ${p2y.toFixed(1)}`;
  }

  return d;
}

/**
 * Створення попереднього перегляду фігури під час протягування
 */
function createShapePreview(track, pt) {
  const shape = track.shape;
  let el;

  if (shape === 'line' || shape === 'arrow' || shape === 'double_arrow' || 
      shape === 'syntax_subject' || shape === 'syntax_object' || shape === 'syntax_adverbial' ||
      shape === 'dashed_line' || shape === 'dash_dot_line') {
    el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    el.setAttribute('x1', pt.x);
    el.setAttribute('y1', pt.y);
    el.setAttribute('x2', pt.x);
    el.setAttribute('y2', pt.y);
  } else if (shape === 'wavy_line' || shape === 'syntax_attribute') {
    el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    el.setAttribute('d', `M ${pt.x} ${pt.y}`);
  } else if (shape === 'double_line' || shape === 'syntax_predicate') {
    el = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const l1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const l2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    el.appendChild(l1);
    el.appendChild(l2);
  } else if (shape === 'rect' || shape === 'round_rect') {
    el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    el.setAttribute('x', pt.x);
    el.setAttribute('y', pt.y);
    el.setAttribute('width', 0);
    el.setAttribute('height', 0);
    if (shape === 'round_rect') {
      el.setAttribute('rx', 12);
      el.setAttribute('ry', 12);
    }
  } else if (shape === 'circle' || shape === 'ellipse' || shape === 'syntax_conjunction') {
    el = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    el.setAttribute('cx', pt.x);
    el.setAttribute('cy', pt.y);
    el.setAttribute('rx', 0);
    el.setAttribute('ry', 0);
  } else {
    el = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    el.setAttribute('points', `${pt.x},${pt.y}`);
  }

  applyStrokeStyles(el, track);
  if (track.fillEnabled && !['line','arrow','double_arrow','wavy_line','double_line','dash_dot_line','dashed_line','syntax_subject','syntax_predicate','syntax_attribute','syntax_object','syntax_adverbial'].includes(shape)) {
    el.setAttribute('fill', track.fillColor);
  }
  return el;
}

function updateShapePreview(el, shape, start, current) {
  const x = Math.min(start.x, current.x);
  const y = Math.min(start.y, current.y);
  const w = Math.abs(current.x - start.x);
  const h = Math.abs(current.y - start.y);

  if (shape === 'line' || shape === 'arrow' || shape === 'double_arrow') {
    el.setAttribute('x1', start.x);
    el.setAttribute('y1', start.y);
    el.setAttribute('x2', current.x);
    el.setAttribute('y2', current.y);
    if (shape === 'arrow') el.setAttribute('marker-end', 'url(#markerArrow)');
    if (shape === 'double_arrow') {
      el.setAttribute('marker-end', 'url(#markerArrow)');
      el.setAttribute('marker-start', 'url(#markerArrowStart)');
    }
  } else if (shape === 'syntax_subject') {
    el.setAttribute('x1', start.x);
    el.setAttribute('y1', start.y);
    el.setAttribute('x2', current.x);
    el.setAttribute('y2', current.y);
    el.setAttribute('stroke', '#2563eb');
    el.setAttribute('stroke-width', '3.5');
    el.setAttribute('stroke-linecap', 'round');
  } else if (shape === 'syntax_object' || shape === 'dashed_line') {
    el.setAttribute('x1', start.x);
    el.setAttribute('y1', start.y);
    el.setAttribute('x2', current.x);
    el.setAttribute('y2', current.y);
    el.setAttribute('stroke', shape === 'syntax_object' ? '#0f172a' : (el.getAttribute('stroke') || '#0f172a'));
    el.setAttribute('stroke-width', '3');
    el.setAttribute('stroke-dasharray', '8 5');
    el.setAttribute('stroke-linecap', 'round');
  } else if (shape === 'syntax_adverbial' || shape === 'dash_dot_line') {
    el.setAttribute('x1', start.x);
    el.setAttribute('y1', start.y);
    el.setAttribute('x2', current.x);
    el.setAttribute('y2', current.y);
    el.setAttribute('stroke', shape === 'syntax_adverbial' ? '#d97706' : (el.getAttribute('stroke') || '#d97706'));
    el.setAttribute('stroke-width', '3');
    el.setAttribute('stroke-dasharray', '10 4 3 4');
    el.setAttribute('stroke-linecap', 'round');
  } else if (shape === 'wavy_line' || shape === 'syntax_attribute') {
    const strokeCol = shape === 'syntax_attribute' ? '#16a34a' : (el.getAttribute('stroke') || '#16a34a');
    el.setAttribute('d', generateWavyPath(start.x, start.y, current.x, current.y, 14, 4.5));
    el.setAttribute('fill', 'none');
    el.setAttribute('stroke', strokeCol);
    el.setAttribute('stroke-width', '3');
    el.setAttribute('stroke-linecap', 'round');
  } else if (shape === 'double_line' || shape === 'syntax_predicate') {
    const strokeCol = shape === 'syntax_predicate' ? '#dc2626' : (el.getAttribute('stroke') || '#dc2626');
    const strokeW = '2.5';
    const dx = current.x - start.x;
    const dy = current.y - start.y;
    const dist = Math.hypot(dx, dy);
    let nx = 0, ny = 1;
    if (dist > 0.001) {
      nx = -dy / dist;
      ny = dx / dist;
    }
    const half = 3.5;
    const lines = el.querySelectorAll('line');
    if (lines.length >= 2) {
      lines[0].setAttribute('x1', (start.x + nx * half).toFixed(1));
      lines[0].setAttribute('y1', (start.y + ny * half).toFixed(1));
      lines[0].setAttribute('x2', (current.x + nx * half).toFixed(1));
      lines[0].setAttribute('y2', (current.y + ny * half).toFixed(1));
      lines[0].setAttribute('stroke', strokeCol);
      lines[0].setAttribute('stroke-width', strokeW);
      lines[0].setAttribute('stroke-linecap', 'round');

      lines[1].setAttribute('x1', (start.x - nx * half).toFixed(1));
      lines[1].setAttribute('y1', (start.y - ny * half).toFixed(1));
      lines[1].setAttribute('x2', (current.x - nx * half).toFixed(1));
      lines[1].setAttribute('y2', (current.y - ny * half).toFixed(1));
      lines[1].setAttribute('stroke', strokeCol);
      lines[1].setAttribute('stroke-width', strokeW);
      lines[1].setAttribute('stroke-linecap', 'round');
    }
  } else if (shape === 'syntax_conjunction') {
    el.setAttribute('cx', ((start.x + current.x) / 2).toFixed(1));
    el.setAttribute('cy', ((start.y + current.y) / 2).toFixed(1));
    el.setAttribute('rx', Math.max(10, w / 2).toFixed(1));
    el.setAttribute('ry', Math.max(10, h / 2).toFixed(1));
    el.setAttribute('stroke', '#7c3aed');
    el.setAttribute('stroke-width', '2.5');
    el.setAttribute('fill', 'none');
  } else if (shape === 'rect' || shape === 'round_rect') {
    el.setAttribute('x', x);
    el.setAttribute('y', y);
    el.setAttribute('width', Math.max(1, w));
    el.setAttribute('height', Math.max(1, h));
  } else if (shape === 'circle') {
    const r = Math.hypot(current.x - start.x, current.y - start.y);
    el.setAttribute('cx', start.x);
    el.setAttribute('cy', start.y);
    el.setAttribute('rx', r);
    el.setAttribute('ry', r);
  } else if (shape === 'ellipse') {
    el.setAttribute('cx', (start.x + current.x) / 2);
    el.setAttribute('cy', (start.y + current.y) / 2);
    el.setAttribute('rx', Math.max(1, w / 2));
    el.setAttribute('ry', Math.max(1, h / 2));
  } else if (shape === 'triangle') {
    const pts = `${start.x + (current.x - start.x) / 2},${start.y} ${start.x},${current.y} ${current.x},${current.y}`;
    el.setAttribute('points', pts);
  } else if (shape === 'right_triangle') {
    const pts = `${start.x},${start.y} ${start.x},${current.y} ${current.x},${current.y}`;
    el.setAttribute('points', pts);
  } else if (shape === 'rhombus') {
    const midX = (start.x + current.x) / 2;
    const midY = (start.y + current.y) / 2;
    const pts = `${midX},${start.y} ${current.x},${midY} ${midX},${current.y} ${start.x},${midY}`;
    el.setAttribute('points', pts);
  } else if (shape === 'trapezoid') {
    const topW = w * 0.5;
    const pts = `${start.x + (w - topW) / 2},${start.y} ${start.x + (w + topW) / 2},${start.y} ${current.x},${current.y} ${start.x},${current.y}`;
    el.setAttribute('points', pts);
  } else if (shape === 'pentagon' || shape === 'hexagon' || shape === 'star') {
    const sides = shape === 'pentagon' ? 5 : shape === 'hexagon' ? 6 : 5;
    const isStar = shape === 'star';
    const radius = Math.hypot(current.x - start.x, current.y - start.y);
    const pts = generatePolygonPoints(start.x, start.y, radius, sides, isStar);
    el.setAttribute('points', pts);
  }
}

function createFinalShape(track, endPt) {
  const shape = track.shape;
  const start = track.startPoint;
  const end = endPt;

  if (shape === 'coordinate_system') {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const w = Math.max(60, Math.abs(end.x - start.x));
    const h = Math.max(60, Math.abs(end.y - start.y));
    const cx = x + w / 2;
    const cy = y + h / 2;

    const lineX = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lineX.setAttribute('x1', x);
    lineX.setAttribute('y1', cy);
    lineX.setAttribute('x2', x + w);
    lineX.setAttribute('y2', cy);
    lineX.setAttribute('stroke', track.strokeColor);
    lineX.setAttribute('stroke-width', track.strokeWidth);
    lineX.setAttribute('marker-end', 'url(#markerArrow)');

    const lineY = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lineY.setAttribute('x1', cx);
    lineY.setAttribute('y1', y + h);
    lineY.setAttribute('x2', cx);
    lineY.setAttribute('y2', y);
    lineY.setAttribute('stroke', track.strokeColor);
    lineY.setAttribute('stroke-width', track.strokeWidth);
    lineY.setAttribute('marker-end', 'url(#markerArrow)');

    g.appendChild(lineX);
    g.appendChild(lineY);
    return g;
  }

  const preview = track.previewEl;
  if (!preview) return null;
  const clone = preview.cloneNode(true);
  return clone;
}

function generatePolygonPoints(cx, cy, r, sides, isStar) {
  const points = [];
  if (!isStar) {
    const step = (Math.PI * 2) / sides;
    const startAngle = -Math.PI / 2;
    for (let i = 0; i < sides; i++) {
      const a = startAngle + i * step;
      points.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
    }
  } else {
    const startAngle = -Math.PI / 2;
    const innerR = r * 0.45;
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? r : innerR;
      const a = startAngle + (Math.PI / 5) * i;
      points.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
    }
  }
  return points.join(' ');
}

/**
 * Лазерний слід з авто-згасанням
 */
function spawnLaserTrail(pt) {
  const activeLayer = document.getElementById('activeStrokesLayer');
  const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  dot.setAttribute('cx', pt.x);
  dot.setAttribute('cy', pt.y);
  dot.setAttribute('r', '4');
  dot.setAttribute('fill', '#ef4444');
  dot.setAttribute('opacity', '0.8');
  activeLayer.appendChild(dot);

  let op = 0.8;
  const interval = setInterval(() => {
    op -= 0.1;
    if (op <= 0) {
      clearInterval(interval);
      dot.remove();
    } else {
      dot.setAttribute('opacity', op.toString());
    }
  }, 100);
}

/**
 * Реєстрація дій для Undo/Redo
 */
export function registerUndoAction(type, element) {
  const slide = getCurrentSlide();
  slide.undoStack.push({ type, element, parent: element.parentNode });
  slide.redoStack = []; // очищаємо redo
  updateUndoRedoButtons();
}

export function undo() {
  const slide = getCurrentSlide();
  if (slide.undoStack.length === 0) return;

  const action = slide.undoStack.pop();
  if (action.type === 'add') {
    action.element.remove();
    slide.redoStack.push(action);
  } else if (action.type === 'remove') {
    const layer = document.getElementById('drawingLayer');
    if (layer) layer.appendChild(action.element);
    slide.redoStack.push(action);
  }
  updateUndoRedoButtons();
}

export function redo() {
  const slide = getCurrentSlide();
  if (slide.redoStack.length === 0) return;

  const action = slide.redoStack.pop();
  if (action.type === 'add') {
    const layer = document.getElementById('drawingLayer');
    if (layer) layer.appendChild(action.element);
    slide.undoStack.push(action);
  } else if (action.type === 'remove') {
    action.element.remove();
    slide.undoStack.push(action);
  }
  updateUndoRedoButtons();
}

/**
 * Миттєве та надійне очищення дошки з підтримкою скасування (Ctrl+Z)
 */
export function clearBoard() {
  const drawLayer = document.getElementById('drawingLayer');
  const activeLayer = document.getElementById('activeStrokesLayer');
  const selLayer = document.getElementById('selectionLayer');

  if (activeLayer) activeLayer.innerHTML = '';
  if (selLayer) selLayer.innerHTML = '';

  // Знімаємо виділення з об'єктів
  import('./board.js').then(m => {
    if (m.deselectObject) m.deselectObject();
  });

  if (drawLayer) {
    const elements = Array.from(drawLayer.children);
    if (elements.length > 0) {
      elements.forEach(el => {
        registerUndoAction('remove', el);
        el.remove();
      });
    }
  }

  const slide = getCurrentSlide();
  if (slide) {
    slide.drawings = [];
    slide.drawingsHtml = '';
  }

  events.emit('board:clear');
}

function updateUndoRedoButtons() {
  const slide = getCurrentSlide();
  const btnUndo = document.getElementById('btnUndo');
  const btnRedo = document.getElementById('btnRedo');
  if (btnUndo) btnUndo.disabled = slide.undoStack.length === 0;
  if (btnRedo) btnRedo.disabled = slide.redoStack.length === 0;
}

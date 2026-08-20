/**
 * UGREAD Whiteboard - School Notebook Rulings & Grid Generator
 * Точна відповідність українським стандартам зошитів для школи (ДСТУ / МОН):
 * - Зошит у косу лінію з додатковою лінією (1 клас, як на зразку А5)
 * - Зошит у часту косу лінію (прописи/каліграфія)
 * - Зошит у косу лінію без додаткової (2 клас)
 * - Зошит у клітинку (5x5 мм)
 * - Зошит у лінію (звичайну та вузьку)
 * - Нотний стан, координатні сітки, крейдові дошки
 */

import { state, getCurrentSlide } from './state.js';

export function renderRuling() {
  const slide = getCurrentSlide();
  const rulingType = slide.ruling || 'white';
  const scale = slide.rulingScale || 32;
  const marginMode = slide.marginMode || 'none'; // 'right' | 'left' | 'both' | 'none'
  
  const backdrop = document.getElementById('boardBackdrop');
  const rulingLayer = document.getElementById('rulingLayer');
  const marginLayer = document.getElementById('marginLinesLayer');
  
  if (!rulingLayer || !marginLayer || !backdrop) return;
  
  rulingLayer.innerHTML = '';
  marginLayer.innerHTML = '';

  // 1. Колір фону полотна
  let bgColor = '#ffffff';
  if (rulingType === 'chalkboard_green') {
    bgColor = '#1e3f20';
  } else if (rulingType === 'chalkboard_black') {
    bgColor = '#18181b';
  } else if (rulingType.startsWith('slanted') || rulingType.startsWith('squared') || rulingType.startsWith('lined')) {
    bgColor = '#ffffff'; // чистий білий папір як у зошиті
  }
  backdrop.setAttribute('fill', bgColor);

  const W = 8000;
  const H = 6000;
  const startX = -2000;
  const startY = -1500;

  // 2. Генерація розліновки відповідно до стандарту
  switch (rulingType) {
    case 'slanted_primary':
    case 'slanted_primary_aux':
      // Стандартний зошит у косу лінію з додатковою верхньою лінією (1 клас - в точності як на фото зразка)
      renderSlantedWithAuxNotebook(rulingLayer, marginLayer, startX, startY, W, H, scale, marginMode);
      break;

    case 'slanted_primary_dense':
      // Прописи / Часта коса лінія
      renderSlantedDenseNotebook(rulingLayer, marginLayer, startX, startY, W, H, scale, marginMode);
      break;

    case 'slanted_primary_simple':
      // Зошит у косу лінію без додаткової лінії (2 клас)
      renderSlantedSimpleNotebook(rulingLayer, marginLayer, startX, startY, W, H, scale, marginMode);
      break;

    case 'squared_math':
      renderSquaredNotebook(rulingLayer, marginLayer, startX, startY, W, H, scale, marginMode);
      break;

    case 'lined_regular':
      renderLinedNotebook(rulingLayer, marginLayer, startX, startY, W, H, scale, marginMode, false);
      break;

    case 'lined_narrow':
      renderLinedNotebook(rulingLayer, marginLayer, startX, startY, W, H, scale, marginMode, true);
      break;

    case 'music_stave':
      renderMusicStave(rulingLayer, startX, startY, W, H, scale);
      break;

    case 'cartesian_grid':
      renderCartesianGrid(rulingLayer, startX, startY, W, H, scale);
      break;

    case 'dot_grid':
      renderDotGrid(rulingLayer, startX, startY, W, H, scale);
      break;

    case 'isometric_grid':
      renderIsometricGrid(rulingLayer, startX, startY, W, H, scale);
      break;

    case 'white':
    case 'chalkboard_green':
    case 'chalkboard_black':
    default:
      break;
  }
}

/**
 * 📝 Справжній зошит у косу лінію з додатковою лінією (1 клас А5 - як на фото)
 * Будова за стандартом МОН України:
 * - Робочий рядок висотою h (для малих літер а, о, е, и, н...)
 * - Верхня додаткова лінія на відстані h вище (для великих літер А, Б, В... і виносних елементів б, в, ї)
 * - Нижня базова лінія (опорна лінія рядка)
 * - Міжряддя висотою 2*h до наступного робочого рядка (куди опускаються петельки р, у, ц, щ)
 * - Похилі лінії під кутом 65° з кроком ~3.2*h
 * - Яскраво-малинове/червоне поле праворуч/ліворуч
 */
function renderSlantedWithAuxNotebook(layer, marginLayer, x0, y0, w, h, baseScale, marginMode) {
  const hWork = Math.max(16, baseScale); // висота робочого рядка (за стандартом 4мм ~ 32px)
  const hAux = hWork; // висота верхньої додаткової зони
  const hInter = hWork * 2; // міжрядковий простір (8мм ~ 64px)
  const blockHeight = hAux + hWork + hInter; // повний крок повторення = 4 * hWork

  // Насичений фірмовий блакитний колір поліграфічного зошита
  const lineColorBase = '#0ea5e9';   // основні лінії робочого рядка (верхня і нижня)
  const lineColorAux = '#38bdf8';    // додаткова верхня горизонтальна лінія
  const lineColorSlant = '#38bdf8';  // похилі лінії нахилу

  const slantAngleDeg = 65;
  const slantRad = (slantAngleDeg * Math.PI) / 180;
  const cotSlant = 1 / Math.tan(slantRad); // ~0.4663

  // 1. Похилі лінії нахилу (65° праворуч за стандартом МОН - лінія "/")
  const gSlant = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  gSlant.setAttribute('id', 'slantedNotebookGuides');

  const slantStep = hWork * 3.2; // природний крок між косими лініями (~25мм у зошиті А5)
  const totalYSpan = h;
  const xOffset = totalYSpan * cotSlant;

  for (let x = x0 - xOffset; x < x0 + w + xOffset * 2; x += slantStep) {
    const x1 = x + xOffset; // вгорі праворуч
    const y1 = y0;
    const x2 = x;           // внизу ліворуч (утворює правильний каліграфічний нахил "/")
    const y2 = y0 + totalYSpan;

    const slantLine = createSvgLine(x1, y1, x2, y2, lineColorSlant, 1.0);
    gSlant.appendChild(slantLine);
  }
  layer.appendChild(gSlant);

  // 2. Горизонтальні лінії (Трійка ліній: додаткова + верхня рядка + базова нижня)
  const gHoriz = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  gHoriz.setAttribute('id', 'slantedNotebookHorizLines');

  for (let y = y0; y < y0 + h; y += blockHeight) {
    const yAuxTop = y;                  // 1. Верхня додаткова лінія
    const yWorkTop = y + hAux;           // 2. Верхня лінія робочого рядка
    const yWorkBottom = y + hAux + hWork;// 3. Нижня (базова) лінія робочого рядка

    const lineAuxTop = createSvgLine(x0, yAuxTop, x0 + w, yAuxTop, lineColorAux, 1.1);
    const lineWorkTop = createSvgLine(x0, yWorkTop, x0 + w, yWorkTop, lineColorBase, 1.3);
    const lineWorkBottom = createSvgLine(x0, yWorkBottom, x0 + w, yWorkBottom, lineColorBase, 1.4);

    gHoriz.appendChild(lineAuxTop);
    gHoriz.appendChild(lineWorkTop);
    gHoriz.appendChild(lineWorkBottom);
  }
  layer.appendChild(gHoriz);

  // 3. Червоні поля зошита (класичне малиново-червоне поле)
  renderConfiguredMargins(marginLayer, marginMode, y0, h);
}

/**
 * ✍️ Зошит у часту косу лінію (Прописи для постановки почерку)
 */
function renderSlantedDenseNotebook(layer, marginLayer, x0, y0, w, h, baseScale, marginMode) {
  const hWork = Math.max(16, baseScale);
  const hAux = hWork;
  const hInter = hWork * 2;
  const blockHeight = hAux + hWork + hInter;

  const lineColorBase = '#0ea5e9';
  const lineColorAux = '#38bdf8';
  const lineColorSlant = '#7dd3fc';

  const slantAngleDeg = 65;
  const slantRad = (slantAngleDeg * Math.PI) / 180;
  const cotSlant = 1 / Math.tan(slantRad);

  // Часті похилі лінії (крок дорівнює ширині однієї літери ~1 * hWork)
  const gSlant = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const slantStep = hWork * 1.0;
  const totalYSpan = h;
  const xOffset = totalYSpan * cotSlant;

  for (let x = x0 - xOffset; x < x0 + w + xOffset * 2; x += slantStep) {
    const slantLine = createSvgLine(x + xOffset, y0, x, y0 + totalYSpan, lineColorSlant, 0.85);
    gSlant.appendChild(slantLine);
  }
  layer.appendChild(gSlant);

  // Горизонтальні лінії
  const gHoriz = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  for (let y = y0; y < y0 + h; y += blockHeight) {
    gHoriz.appendChild(createSvgLine(x0, y, x0 + w, y, lineColorAux, 1.0));
    gHoriz.appendChild(createSvgLine(x0, y + hAux, x0 + w, y + hAux, lineColorBase, 1.3));
    gHoriz.appendChild(createSvgLine(x0, y + hAux + hWork, x0 + w, y + hAux + hWork, lineColorBase, 1.4));
  }
  layer.appendChild(gHoriz);

  renderConfiguredMargins(marginLayer, marginMode, y0, h);
}

/**
 * 📄 Зошит у косу лінію без додаткової (2 клас)
 */
function renderSlantedSimpleNotebook(layer, marginLayer, x0, y0, w, h, baseScale, marginMode) {
  const hWork = Math.max(16, baseScale);
  const hInter = hWork * 2;
  const blockHeight = hWork + hInter;

  const lineColorBase = '#0ea5e9';
  const lineColorSlant = '#38bdf8';

  const slantAngleDeg = 65;
  const slantRad = (slantAngleDeg * Math.PI) / 180;
  const cotSlant = 1 / Math.tan(slantRad);

  const gSlant = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const slantStep = hWork * 3.2;
  const totalYSpan = h;
  const xOffset = totalYSpan * cotSlant;

  for (let x = x0 - xOffset; x < x0 + w + xOffset * 2; x += slantStep) {
    const slantLine = createSvgLine(x + xOffset, y0, x, y0 + totalYSpan, lineColorSlant, 0.9);
    gSlant.appendChild(slantLine);
  }
  layer.appendChild(gSlant);

  const gHoriz = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  for (let y = y0; y < y0 + h; y += blockHeight) {
    gHoriz.appendChild(createSvgLine(x0, y, x0 + w, y, lineColorBase, 1.3));
    gHoriz.appendChild(createSvgLine(x0, y + hWork, x0 + w, y + hWork, lineColorBase, 1.4));
  }
  layer.appendChild(gHoriz);

  renderConfiguredMargins(marginLayer, marginMode, y0, h);
}

/**
 * 📐 Зошит у клітинку (Математика 5х5 мм)
 */
function renderSquaredNotebook(layer, marginLayer, x0, y0, w, h, cellSize, marginMode) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const lineCol = '#bae6fd';
  const majorCol = '#7dd3fc';

  const step = Math.max(12, cellSize);

  // Вертикальні лінії
  let count = 0;
  for (let x = x0; x < x0 + w; x += step) {
    const isMajor = (count % 5 === 0);
    const line = createSvgLine(x, y0, x, y0 + h, isMajor ? majorCol : lineCol, isMajor ? 1.2 : 0.85);
    g.appendChild(line);
    count++;
  }

  // Горизонтальні лінії
  count = 0;
  for (let y = y0; y < y0 + h; y += step) {
    const isMajor = (count % 5 === 0);
    const line = createSvgLine(x0, y, x0 + w, y, isMajor ? majorCol : lineCol, isMajor ? 1.2 : 0.85);
    g.appendChild(line);
    count++;
  }

  layer.appendChild(g);
  renderConfiguredMargins(marginLayer, marginMode, y0, h);
}

/**
 * 📖 Зошит у широку/звичайну або вузьку лінію
 */
function renderLinedNotebook(layer, marginLayer, x0, y0, w, h, step, isNarrow, marginMode) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const lineCol = '#0ea5e9';
  const s = isNarrow ? Math.max(16, step * 0.7) : Math.max(22, step * 1.3);

  for (let y = y0; y < y0 + h; y += s) {
    const line = createSvgLine(x0, y, x0 + w, y, lineCol, 1.2);
    g.appendChild(line);
  }
  layer.appendChild(g);

  renderConfiguredMargins(marginLayer, marginMode, y0, h);
}

/**
 * 🎵 Нотний стан (5 лінійок)
 */
function renderMusicStave(layer, x0, y0, w, h, baseScale) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const lineCol = '#334155';
  const lineGap = Math.max(8, baseScale * 0.35);
  const staveGap = lineGap * 6;

  for (let y = y0; y < y0 + h; y += (lineGap * 4 + staveGap)) {
    for (let i = 0; i < 5; i++) {
      const lineY = y + i * lineGap;
      const line = createSvgLine(x0, lineY, x0 + w, lineY, lineCol, 1.3);
      g.appendChild(line);
    }
  }
  layer.appendChild(g);
}

/**
 * 📈 Декартова координатна сітка
 */
function renderCartesianGrid(layer, x0, y0, w, h, size) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const step = Math.max(20, size);
  const gridCol = '#e2e8f0';
  const axisCol = '#0f172a';

  for (let x = x0; x < x0 + w; x += step) {
    g.appendChild(createSvgLine(x, y0, x, y0 + h, gridCol, 1));
  }
  for (let y = y0; y < y0 + h; y += step) {
    g.appendChild(createSvgLine(x0, y, x0 + w, y, gridCol, 1));
  }

  const axisX = createSvgLine(x0, 0, x0 + w, 0, axisCol, 2.5);
  axisX.setAttribute('marker-end', 'url(#markerArrow)');
  const axisY = createSvgLine(0, y0 + h, 0, y0, axisCol, 2.5);
  axisY.setAttribute('marker-end', 'url(#markerArrow)');
  g.appendChild(axisX);
  g.appendChild(axisY);

  const tickLen = 6;
  const tickStep = step * 2;
  for (let x = -1000; x <= 2500; x += tickStep) {
    if (x === 0) continue;
    g.appendChild(createSvgLine(x, -tickLen, x, tickLen, axisCol, 1.5));
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', 18);
    text.setAttribute('font-size', '12');
    text.setAttribute('font-family', 'sans-serif');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#475569');
    text.textContent = (x / step).toString();
    g.appendChild(text);
  }

  for (let y = -1000; y <= 2000; y += tickStep) {
    if (y === 0) continue;
    g.appendChild(createSvgLine(-tickLen, y, tickLen, y, axisCol, 1.5));
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', -14);
    text.setAttribute('y', y + 4);
    text.setAttribute('font-size', '12');
    text.setAttribute('font-family', 'sans-serif');
    text.setAttribute('text-anchor', 'end');
    text.setAttribute('fill', '#475569');
    text.textContent = (-y / step).toString();
    g.appendChild(text);
  }

  const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xLabel.setAttribute('x', x0 + w - 40);
  xLabel.setAttribute('y', -12);
  xLabel.setAttribute('font-size', '16');
  xLabel.setAttribute('font-weight', 'bold');
  xLabel.setAttribute('fill', '#0f172a');
  xLabel.textContent = 'X';
  g.appendChild(xLabel);

  const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yLabel.setAttribute('x', 14);
  yLabel.setAttribute('y', y0 + 30);
  yLabel.setAttribute('font-size', '16');
  yLabel.setAttribute('font-weight', 'bold');
  yLabel.setAttribute('fill', '#0f172a');
  yLabel.textContent = 'Y';
  g.appendChild(yLabel);

  layer.appendChild(g);
}

/**
 * ▫ Точкова сітка
 */
function renderDotGrid(layer, x0, y0, w, h, size) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const step = Math.max(16, size);
  for (let x = x0; x < x0 + w; x += step) {
    for (let y = y0; y < y0 + h; y += step) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', '1.5');
      circle.setAttribute('fill', '#94a3b8');
      g.appendChild(circle);
    }
  }
  layer.appendChild(g);
}

/**
 * 🔺 Ізометрична сітка
 */
function renderIsometricGrid(layer, x0, y0, w, h, size) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const s = Math.max(20, size);
  const tan30 = Math.tan((30 * Math.PI) / 180);
  const lineCol = '#e2e8f0';

  for (let x = x0; x < x0 + w; x += s) {
    g.appendChild(createSvgLine(x, y0, x, y0 + h, lineCol, 0.8));
  }
  for (let y = y0 - w * tan30; y < y0 + h + w * tan30; y += s) {
    g.appendChild(createSvgLine(x0, y, x0 + w, y + w * tan30, lineCol, 0.8));
  }
  for (let y = y0 - w * tan30; y < y0 + h + w * tan30; y += s) {
    g.appendChild(createSvgLine(x0, y + w * tan30, x0 + w, y, lineCol, 0.8));
  }
  layer.appendChild(g);
}

/**
 * 🔴 Червоні поля зошита (Поля згідно з фотографією зразка та стандартами)
 */
function renderConfiguredMargins(marginLayer, marginMode, y0, h) {
  if (marginMode === 'none') return;

  // Малиново-червоний колір друкованих полів зошита
  const marginColor = '#f43f5e';
  const marginWidth = 2.0;

  // Поле праворуч (як на фотографії лінійка-А5.jpg)
  if (marginMode === 'right' || marginMode === 'both' || !marginMode) {
    const rightMarginX = 1100;
    const lineRight = createSvgLine(rightMarginX, y0, rightMarginX, y0 + h, marginColor, marginWidth);
    lineRight.setAttribute('stroke-linecap', 'square');
    marginLayer.appendChild(lineRight);
  }

  // Поле ліворуч (для лівих сторінок)
  if (marginMode === 'left' || marginMode === 'both') {
    const leftMarginX = 140;
    const lineLeft = createSvgLine(leftMarginX, y0, leftMarginX, y0 + h, marginColor, marginWidth);
    lineLeft.setAttribute('stroke-linecap', 'square');
    marginLayer.appendChild(lineLeft);
  }
}

function createSvgLine(x1, y1, x2, y2, stroke, width) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  line.setAttribute('stroke', stroke);
  line.setAttribute('stroke-width', width);
  line.setAttribute('shape-rendering', 'geometricPrecision');
  return line;
}

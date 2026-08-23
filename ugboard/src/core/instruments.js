/**
 * UGREAD Whiteboard - On-Screen Physical Math Instruments
 * Interactive Ruler (30cm), Protractor (180°), and Triangle Square (90°-45°)
 * Clean, lightweight design without obstructive top bars.
 */

import { state } from './state.js';

export function initInstruments() {
  const toggleRuler = document.getElementById('toggleScreenRuler');
  const toggleProtractor = document.getElementById('toggleScreenProtractor');
  const toggleTriangle = document.getElementById('toggleScreenTriangle');

  const closePalettes = () => {
    document.querySelectorAll('.dropdown-wrap-side').forEach(w => w.classList.remove('open'));
  };

  if (toggleRuler) {
    toggleRuler.addEventListener('click', () => {
      toggleInstrument('ruler');
      closePalettes();
    });
  }
  if (toggleProtractor) {
    toggleProtractor.addEventListener('click', () => {
      toggleInstrument('protractor');
      closePalettes();
    });
  }
  if (toggleTriangle) {
    toggleTriangle.addEventListener('click', () => {
      toggleInstrument('triangle');
      closePalettes();
    });
  }
}

export function toggleInstrument(type) {
  const overlay = document.getElementById('screenInstrumentsOverlay');
  if (!overlay) return;

  const existing = document.getElementById(`instrument_${type}`);
  if (existing) {
    existing.remove();
    if (state.instruments) state.instruments[type] = false;
    return;
  }

  if (state.instruments) state.instruments[type] = true;
  let widget = null;

  switch (type) {
    case 'ruler':
      widget = createRulerWidget();
      break;
    case 'protractor':
      widget = createProtractorWidget();
      break;
    case 'triangle':
      widget = createTriangleWidget();
      break;
  }

  if (widget) {
    widget.id = `instrument_${type}`;
    overlay.appendChild(widget);
    makeDraggableAndRotatable(widget, type);
  }
}

/**
 * Екранна лінійка 30 см (чистий вигляд без верхніх перешкод)
 */
function createRulerWidget() {
  const div = document.createElement('div');
  div.className = 'instrument-widget';
  div.style.cssText = `
    position: absolute;
    left: 180px;
    top: 160px;
    width: 520px;
    height: 75px;
    background: rgba(254, 249, 195, 0.95);
    backdrop-filter: blur(8px);
    border: 2px solid #ca8a04;
    border-radius: 6px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.18);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    user-select: none;
    touch-action: none;
    z-index: 250;
    transform-origin: center center;
    cursor: move;
  `;

  // Шкала міліметрів та сантиметрів
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.pointerEvents = 'none';

  const pxPerCm = 16; // масштаб поділок
  const startOffset = 20;

  for (let cm = 0; cm <= 30; cm++) {
    const x = startOffset + cm * pxPerCm;
    if (x > 505) break;

    // Сантиметрова позначка
    const cmLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    cmLine.setAttribute('x1', x); cmLine.setAttribute('y1', 0);
    cmLine.setAttribute('x2', x); cmLine.setAttribute('y2', 22);
    cmLine.setAttribute('stroke', '#713f12');
    cmLine.setAttribute('stroke-width', '1.6');
    svg.appendChild(cmLine);

    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', x);
    txt.setAttribute('y', 38);
    txt.setAttribute('font-size', '11');
    txt.setAttribute('font-weight', 'bold');
    txt.setAttribute('fill', '#713f12');
    txt.setAttribute('text-anchor', 'middle');
    txt.textContent = cm.toString();
    svg.appendChild(txt);

    // Міліметрові позначки (між сантиметрами)
    if (cm < 30) {
      for (let mm = 1; mm < 10; mm++) {
        const mmX = x + (mm * pxPerCm) / 10;
        const mmLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        mmLine.setAttribute('x1', mmX); mmLine.setAttribute('y1', 0);
        mmLine.setAttribute('x2', mmX); mmLine.setAttribute('y2', mm === 5 ? 14 : 8);
        mmLine.setAttribute('stroke', '#854d0e');
        mmLine.setAttribute('stroke-width', '1');
        svg.appendChild(mmLine);
      }
    }
  }

  div.appendChild(svg);
  attachInstrumentButtons(div, 'ruler');
  return div;
}

/**
 * Екранний транспортир 180°
 */
function createProtractorWidget() {
  const div = document.createElement('div');
  div.className = 'instrument-widget';
  div.style.cssText = `
    position: absolute;
    left: 240px;
    top: 140px;
    width: 360px;
    height: 190px;
    background: rgba(186, 230, 253, 0.90);
    backdrop-filter: blur(8px);
    border: 2px solid #0284c7;
    border-radius: 180px 180px 0 0;
    box-shadow: 0 12px 28px rgba(0,0,0,0.18);
    user-select: none;
    touch-action: none;
    z-index: 250;
    transform-origin: center center;
    cursor: move;
  `;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('viewBox', '0 0 360 190');
  svg.style.pointerEvents = 'none';

  const cx = 180, cy = 180, R = 170;

  // Поділки по градусах від 0 до 180
  for (let deg = 0; deg <= 180; deg += 2) {
    const rad = ((180 - deg) * Math.PI) / 180;
    const isMajor10 = deg % 10 === 0;
    const isMajor5 = deg % 5 === 0;
    const len = isMajor10 ? 18 : (isMajor5 ? 12 : 7);

    const x1 = cx + R * Math.cos(rad);
    const y1 = cy - R * Math.sin(rad);
    const x2 = cx + (R - len) * Math.cos(rad);
    const y2 = cy - (R - len) * Math.sin(rad);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    line.setAttribute('stroke', '#0369a1');
    line.setAttribute('stroke-width', isMajor10 ? '1.8' : '1');
    svg.appendChild(line);

    if (isMajor10) {
      const tx = cx + (R - 28) * Math.cos(rad);
      const ty = cy - (R - 28) * Math.sin(rad) + 4;
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', tx); text.setAttribute('y', ty);
      text.setAttribute('font-size', '10');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('fill', '#075985');
      text.setAttribute('text-anchor', 'middle');
      text.textContent = deg.toString();
      svg.appendChild(text);
    }
  }

  // Центральний хрестик та базова лінія
  const baseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  baseLine.setAttribute('x1', '10'); baseLine.setAttribute('y1', '180');
  baseLine.setAttribute('x2', '350'); baseLine.setAttribute('y2', '180');
  baseLine.setAttribute('stroke', '#0284c7');
  baseLine.setAttribute('stroke-width', '2');
  svg.appendChild(baseLine);

  const cross = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  cross.setAttribute('d', `M ${cx - 15} ${cy} L ${cx + 15} ${cy} M ${cx} ${cy - 15} L ${cx} ${cy}`);
  cross.setAttribute('stroke', '#0369a1');
  cross.setAttribute('stroke-width', '2.5');
  svg.appendChild(cross);

  div.appendChild(svg);
  attachInstrumentButtons(div, 'protractor');
  return div;
}

/**
 * Екранний косинець (90°-45°-45°)
 */
function createTriangleWidget() {
  const div = document.createElement('div');
  div.className = 'instrument-widget';
  div.style.cssText = `
    position: absolute;
    left: 220px;
    top: 180px;
    width: 260px;
    height: 260px;
    user-select: none;
    touch-action: none;
    z-index: 250;
    transform-origin: center center;
    cursor: move;
  `;

  div.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 260 260" style="pointer-events:none; filter: drop-shadow(0 10px 24px rgba(0,0,0,0.18));">
      <polygon points="12,12 12,248 248,248" fill="rgba(220, 252, 231, 0.92)" stroke="#16a34a" stroke-width="2.5"/>
      <polygon points="50,165 50,215 100,215" fill="rgba(255,255,255,0.9)" stroke="#16a34a" stroke-width="1.5"/>
      <!-- Прямий кут 90° -->
      <line x1="12" y1="225" x2="35" y2="225" stroke="#15803d" stroke-width="2"/>
      <line x1="35" y1="225" x2="35" y2="248" stroke="#15803d" stroke-width="2"/>
      <!-- Позначка 90° -->
      <text x="25" y="240" font-size="10" font-weight="bold" fill="#15803d">90°</text>
      <text x="18" y="55" font-size="11" font-weight="bold" fill="#15803d">45°</text>
      <text x="195" y="242" font-size="11" font-weight="bold" fill="#15803d">45°</text>
    </svg>
  `;

  attachInstrumentButtons(div, 'triangle');
  return div;
}

/**
 * Додавання компактних кнопок закриття та повороту безпосередньо на кути самого інструмента
 */
function attachInstrumentButtons(widget, type) {
  // Кнопка закриття (компактний кружечок ✖)
  const closeBtn = document.createElement('button');
  closeBtn.className = 'inst-corner-btn inst-close-btn';
  closeBtn.style.cssText = `
    position: absolute;
    top: 6px;
    right: 6px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #ef4444;
    color: white;
    border: 1.5px solid #ffffff;
    box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: bold;
    cursor: pointer;
    z-index: 260;
    padding: 0;
    transition: transform 0.1s, background 0.1s;
  `;
  closeBtn.title = 'Закрити інструмент';
  closeBtn.innerHTML = '✖';

  closeBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleInstrument(type);
  });

  // Кругла ручка повороту (🔄)
  const knob = document.createElement('div');
  knob.className = 'instrument-rotate-knob';
  knob.style.cssText = `
    position: absolute;
    bottom: 6px;
    right: 6px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #2563eb;
    color: white;
    border: 1.5px solid #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    cursor: grab;
    box-shadow: 0 2px 8px rgba(0,0,0,0.28);
    z-index: 260;
    user-select: none;
    touch-action: none;
    transition: transform 0.1s;
  `;
  knob.title = 'Потягніть для вільного повороту (подвійний клік - 0°)';
  knob.innerHTML = '🔄';

  // Подвійний клік для скидання кута до 0°
  knob.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    widget.dataset.rotation = '0';
    widget.style.transform = 'rotate(0deg)';
  });

  widget.appendChild(closeBtn);
  widget.appendChild(knob);
}

function makeDraggableAndRotatable(widget, type) {
  let isDragging = false;
  let isRotating = false;
  let startX = 0, startY = 0;
  let initialLeft = 0, initialTop = 0;
  let currentRotation = 0;
  let centerPt = { x: 0, y: 0 };
  let startAngle = 0;

  widget.dataset.rotation = '0';

  widget.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.inst-close-btn')) {
      return;
    }

    const knob = e.target.closest('.instrument-rotate-knob');
    const rect = widget.getBoundingClientRect();
    centerPt = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };

    if (knob) {
      isRotating = true;
      startAngle = Math.atan2(e.clientY - centerPt.y, e.clientX - centerPt.x) * (180 / Math.PI);
      currentRotation = parseFloat(widget.dataset.rotation || '0');
      try { knob.setPointerCapture(e.pointerId); } catch(err){}
      e.stopPropagation();
      return;
    }

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    initialLeft = widget.offsetLeft;
    initialTop = widget.offsetTop;
    try { widget.setPointerCapture(e.pointerId); } catch(err){}
    e.stopPropagation();
  });

  widget.addEventListener('pointermove', (e) => {
    if (isDragging) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      widget.style.left = `${initialLeft + dx}px`;
      widget.style.top = `${initialTop + dy}px`;
    } else if (isRotating) {
      const curAngle = Math.atan2(e.clientY - centerPt.y, e.clientX - centerPt.x) * (180 / Math.PI);
      const angleDiff = curAngle - startAngle;
      const finalAngle = Math.round((currentRotation + angleDiff) % 360);
      widget.dataset.rotation = finalAngle.toString();
      widget.style.transform = `rotate(${finalAngle}deg)`;
    }
  });

  const onPointerEnd = (e) => {
    if (isDragging) {
      isDragging = false;
      try { widget.releasePointerCapture(e.pointerId); } catch(err){}
    }
    if (isRotating) {
      isRotating = false;
      const knob = widget.querySelector('.instrument-rotate-knob');
      if (knob) {
        try { knob.releasePointerCapture(e.pointerId); } catch(err){}
      }
    }
  };

  widget.addEventListener('pointerup', onPointerEnd);
  widget.addEventListener('pointercancel', onPointerEnd);
}

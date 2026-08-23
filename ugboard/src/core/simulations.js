/**
 * UGREAD Whiteboard - Interactive Simulation & External Embed Manager
 * Implements the 2 Required Interaction Modes:
 * Mode 1: Control & interact with the simulation / website
 * Mode 2: Draw annotations directly on top of the simulation
 * Layer management: toggle visibility, save per session, clear
 */

import { state, getCurrentSlide, events } from './state.js';

// Кеш збережених малюнків для кожної симуляції або URL
const simulationDrawingsCache = new Map();

// Каталог готових вбудованих офлайн симуляцій (без потреби в інтернеті!)
export const BUILTIN_SIMULATIONS = [
  {
    id: 'circuit',
    title: 'Електричне коло (Струм & Лампочка)',
    subject: 'physics',
    description: 'Збирання електричних кіл: джерело живлення, ключ, резистор, лампочка, вимірювальні прилади.',
    renderHtml: renderCircuitSimulationHtml
  },
  {
    id: 'optics',
    title: 'Геометрична Оптика (Лінзи & Промені)',
    subject: 'physics',
    description: 'Збиральна та розсіювальна лінзи, плоске дзеркало, хід світлових променів.',
    renderHtml: renderOpticsSimulationHtml
  },
  {
    id: 'pendulum',
    title: 'Маятник (Гармонічні коливання)',
    subject: 'physics',
    description: 'Математичний маятник із графіком кінетичної та потенціальної енергії в реальному часі.',
    renderHtml: renderPendulumSimulationHtml
  },
  {
    id: 'plotter',
    title: 'Графічний калькулятор функцій f(x)',
    subject: 'math',
    description: 'Побудова та дослідження графіків sin(x), cos(x), x^2, ax+b, коренів.',
    renderHtml: renderFunctionPlotterHtml
  },
  {
    id: 'globe',
    title: 'Інтерактивний 3D Глобус Землі',
    subject: 'geography',
    description: 'Обертання моделі земної кулі, паралелі, меридіани, материки та океани.',
    renderHtml: renderGlobeSimulationHtml
  }
];

export function initSimulationSystem() {
  const btnInteract = document.getElementById('btnSimModeInteract');
  const btnDrawOver = document.getElementById('btnSimModeDrawOver');
  const btnToggleLayer = document.getElementById('btnToggleSimDrawingLayer');
  const btnClearLayer = document.getElementById('btnClearSimDrawingLayer');
  const btnClose = document.getElementById('btnCloseSimulation');

  if (btnInteract) btnInteract.addEventListener('click', () => setSimulationMode('interact'));
  if (btnDrawOver) btnDrawOver.addEventListener('click', () => setSimulationMode('draw_over'));
  if (btnToggleLayer) btnToggleLayer.addEventListener('click', toggleDrawingLayerVisibility);
  if (btnClearLayer) btnClearLayer.addEventListener('click', clearSimulationDrawings);
  if (btnClose) btnClose.addEventListener('click', closeSimulation);

  // Автоматичне перемикання в режим малювання коли вчитель обирає інструмент малювання
  events.on('tool:change', (toolName) => {
    if (state.activeSimulation) {
      if (toolName === 'select') {
        setSimulationMode('interact');
      } else {
        setSimulationMode('draw_over');
      }
    }
  });
}

/**
 * Відкриття симуляції (за id зі списку або за зовнішнім URL)
 */
export function openSimulation(simIdOrUrl, title = 'Симуляція', isExternalUrl = false) {
  const container = document.getElementById('simulationContainer');
  const iframe = document.getElementById('simulationIframe');
  const localHost = document.getElementById('simulationLocalHost');
  const titleBadge = document.getElementById('simTitleBadge');
  const btnNewTab = document.getElementById('btnSimOpenNewTab');

  container.style.display = 'flex';
  titleBadge.textContent = title;

  state.activeSimulation = {
    id: simIdOrUrl,
    title,
    mode: 'interact', // за замовчуванням починаємо з режиму взаємодії
    overlayVisible: true
  };

  // Зберігаємо посилання на симуляцію в поточному слайді
  const slide = getCurrentSlide();
  slide.simulation = { ...state.activeSimulation };

  if (isExternalUrl || simIdOrUrl.startsWith('http://') || simIdOrUrl.startsWith('https://')) {
    localHost.style.display = 'none';
    iframe.style.display = 'block';
    iframe.src = simIdOrUrl;

    if (btnNewTab) {
      btnNewTab.href = simIdOrUrl;
      btnNewTab.style.display = 'inline-flex';
    }
  } else {
    if (btnNewTab) {
      btnNewTab.style.display = 'none';
    }
    // Вбудована локальна HTML5 симуляція
    const sim = BUILTIN_SIMULATIONS.find(s => s.id === simIdOrUrl);
    if (sim) {
      iframe.style.display = 'none';
      localHost.style.display = 'block';
      localHost.innerHTML = sim.renderHtml();
      // Ініціалізація логіки симуляції після вставки
      if (sim.initLogic) sim.initLogic(localHost);
    }
  }

  // Встановлюємо Режим 1: Керування
  setSimulationMode('interact');

  // Відновлюємо малюнки над цією симуляцією якщо є
  restoreSimulationDrawings(simIdOrUrl);
}

/**
 * Перемикання між 2 режимами взаємодії (За ТЗ):
 * 1. 'interact' - Керування симуляцією/сайтом (пропускаємо кліки)
 * 2. 'draw_over' - Малювання поверх симуляції
 */
export function setSimulationMode(mode) {
  if (!state.activeSimulation) return;
  state.activeSimulation.mode = mode;

  const btnInteract = document.getElementById('btnSimModeInteract');
  const btnDrawOver = document.getElementById('btnSimModeDrawOver');
  const boardSvg = document.getElementById('boardSvg');
  const container = document.getElementById('boardContainer');

  if (mode === 'interact') {
    if (btnInteract) btnInteract.classList.add('active');
    if (btnDrawOver) btnDrawOver.classList.remove('active');
    if (container) {
      container.classList.add('sim-mode-interact');
      container.classList.remove('sim-mode-draw-over');
    }
    if (boardSvg) {
      boardSvg.style.pointerEvents = 'none';
    }
  } else {
    if (btnDrawOver) btnDrawOver.classList.add('active');
    if (btnInteract) btnInteract.classList.remove('active');
    if (container) {
      container.classList.add('sim-mode-draw-over');
      container.classList.remove('sim-mode-interact');
    }
    if (boardSvg) {
      boardSvg.style.pointerEvents = 'auto';
    }
    // Якщо поточний інструмент 'select' (курсор), автоматично активуємо олівець
    if (state.tool === 'select') {
      state.tool = 'pencil';
      document.querySelectorAll('.tool-btn[data-tool]').forEach(b => {
        b.classList.toggle('active', b.dataset.tool === 'pencil');
      });
      if (boardSvg) boardSvg.setAttribute('class', 'board-svg tool-pencil');
    }
  }
}

/**
 * Увімкнення / вимкнення видимості шару малюнків поверх симуляції
 */
export function toggleDrawingLayerVisibility() {
  const drawLayer = document.getElementById('drawingLayer');
  const statusSpan = document.getElementById('simLayerStatus');
  if (!drawLayer) return;

  const isVisible = drawLayer.style.display !== 'none';
  if (isVisible) {
    drawLayer.style.display = 'none';
    if (statusSpan) statusSpan.textContent = 'Вимкн.';
  } else {
    drawLayer.style.display = 'block';
    if (statusSpan) statusSpan.textContent = 'Увімкн.';
  }
}

/**
 * Очистити малюнки над поточною симуляцією
 */
export function clearSimulationDrawings() {
  const drawLayer = document.getElementById('drawingLayer');
  if (drawLayer) {
    drawLayer.innerHTML = '';
  }
  if (state.activeSimulation) {
    simulationDrawingsCache.delete(state.activeSimulation.id);
  }
}

/**
 * Закриття симуляції
 */
export function closeSimulation() {
  const container = document.getElementById('simulationContainer');
  const iframe = document.getElementById('simulationIframe');
  const boardSvg = document.getElementById('boardSvg');
  const boardContainer = document.getElementById('boardContainer');

  if (state.activeSimulation) {
    saveCurrentSimulationDrawings(state.activeSimulation.id);
  }

  container.style.display = 'none';
  iframe.src = 'about:blank';
  state.activeSimulation = null;

  boardContainer.classList.remove('sim-mode-interact', 'sim-mode-draw-over');
  boardSvg.style.pointerEvents = 'auto';
}

export function saveCurrentSimulationDrawings(simId) {
  const drawLayer = document.getElementById('drawingLayer');
  if (drawLayer) {
    simulationDrawingsCache.set(simId, drawLayer.innerHTML);
  }
}

export function restoreSimulationDrawings(simId) {
  const drawLayer = document.getElementById('drawingLayer');
  if (drawLayer && simulationDrawingsCache.has(simId)) {
    drawLayer.innerHTML = simulationDrawingsCache.get(simId);
  }
}

export function getAllSimulationDrawingsCache() {
  const obj = {};
  simulationDrawingsCache.forEach((val, key) => {
    obj[key] = val;
  });
  return obj;
}

export function setAllSimulationDrawingsCache(cacheObj) {
  simulationDrawingsCache.clear();
  if (cacheObj && typeof cacheObj === 'object') {
    Object.entries(cacheObj).forEach(([key, val]) => {
      simulationDrawingsCache.set(key, val);
    });
  }
}

export function getActiveSimulationData() {
  if (!state.activeSimulation) return null;
  const container = document.getElementById('simulationContainer');
  const iframe = document.getElementById('simulationIframe');
  const isOpen = container && container.style.display !== 'none';
  const drawLayer = document.getElementById('drawingLayer');
  const overlayVisible = drawLayer ? drawLayer.style.display !== 'none' : true;

  return {
    ...state.activeSimulation,
    isOpen,
    overlayVisible,
    iframeSrc: iframe ? iframe.src : ''
  };
}

export function restoreActiveSimulationData(simData) {
  if (!simData || !simData.id || simData.isOpen === false) {
    closeSimulation();
    return;
  }

  const isExternal = simData.id.startsWith('http://') || simData.id.startsWith('https://');
  openSimulation(simData.id, simData.title || 'Симуляція', isExternal);

  if (simData.mode) {
    setSimulationMode(simData.mode);
  }

  if (simData.overlayVisible === false) {
    const drawLayer = document.getElementById('drawingLayer');
    const statusSpan = document.getElementById('simLayerStatus');
    if (drawLayer) drawLayer.style.display = 'none';
    if (statusSpan) statusSpan.textContent = 'Вимкн.';
  } else {
    const drawLayer = document.getElementById('drawingLayer');
    const statusSpan = document.getElementById('simLayerStatus');
    if (drawLayer) drawLayer.style.display = 'block';
    if (statusSpan) statusSpan.textContent = 'Увімкн.';
  }
}

/* =========================================================
   ВБУДОВАНІ ОФЛАЙН HTML5 СИМУЛЯЦІЇ
   ========================================================= */

function renderCircuitSimulationHtml() {
  setTimeout(() => initCircuitLogic(), 50);
  return `
    <div style="padding:20px; font-family:sans-serif; max-width:800px; margin:0 auto; background:white; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
      <h3 style="margin-bottom:12px; color:#1e3a8a;">⚡ Інтерактивна електрична схема</h3>
      <p style="color:#64748b; font-size:14px; margin-bottom:16px;">Натисніть на вимикач (ключ) або змінюйте напругу батареї, щоб спостерігати за струмом і яскравістю лампи.</p>
      
      <div style="display:flex; gap:20px; align-items:center; margin-bottom:20px;">
        <label style="font-weight:600;">Напруга джерела (U): 
          <input type="range" id="simVoltageRange" min="1" max="24" value="12" style="vertical-align:middle;">
          <span id="simVoltageVal" style="color:#2563eb; font-weight:bold;">12 В</span>
        </label>
        <label style="font-weight:600;">Опір лампи (R): 
          <input type="range" id="simResistanceRange" min="2" max="50" value="10" style="vertical-align:middle;">
          <span id="simResistanceVal" style="color:#2563eb; font-weight:bold;">10 Ом</span>
        </label>
      </div>

      <div style="position:relative; width:100%; height:320px; border:2px dashed #cbd5e1; border-radius:8px; background:#f8fafc; display:flex; align-items:center; justify-content:center;">
        <svg id="circuitSvg" width="500" height="260" viewBox="0 0 500 260">
          <!-- Провідники кола -->
          <rect x="50" y="40" width="400" height="180" fill="none" stroke="#334155" stroke-width="4" rx="10"/>
          
          <!-- Джерело живлення (Батарея) -->
          <rect x="35" y="110" width="30" height="40" fill="#ffffff"/>
          <line x1="40" y1="115" x2="60" y2="115" stroke="#dc2626" stroke-width="4"/>
          <line x1="46" y1="135" x2="54" y2="135" stroke="#0f172a" stroke-width="4"/>
          <text x="15" y="130" font-size="14" font-weight="bold" fill="#dc2626">+ U -</text>

          <!-- Лампочка -->
          <rect x="380" y="110" width="40" height="40" fill="#ffffff"/>
          <circle id="simBulb" cx="400" cy="130" r="18" fill="#fef08a" stroke="#ca8a04" stroke-width="3"/>
          <path d="M392 136 L408 124 M392 124 L408 136" stroke="#ca8a04" stroke-width="2"/>
          <text x="425" y="135" font-size="13" font-weight="bold" fill="#475569">Лампа</text>

          <!-- Ключ / Вимикач (інтерактивний) -->
          <rect x="210" y="25" width="80" height="30" fill="#ffffff"/>
          <circle cx="220" cy="40" r="4" fill="#334155"/>
          <circle cx="280" cy="40" r="4" fill="#334155"/>
          <line id="simSwitchLever" x1="220" y1="40" x2="275" y2="20" stroke="#2563eb" stroke-width="4" stroke-linecap="round" style="cursor:pointer;"/>
          <text x="235" y="18" font-size="12" font-weight="bold" fill="#2563eb">Ключ [Клік]</text>

          <!-- Амперметр -->
          <circle cx="250" cy="220" r="20" fill="#ffffff" stroke="#2563eb" stroke-width="3"/>
          <text x="250" y="226" font-size="16" font-weight="bold" text-anchor="middle" fill="#2563eb">A</text>
        </svg>
      </div>

      <div style="margin-top:16px; display:flex; justify-content:space-around; background:#f1f5f9; padding:12px; border-radius:8px; font-weight:600;">
        <div>Сила струму (I = U / R): <span id="simCurrentVal" style="color:#16a34a; font-size:18px;">0.00 А</span></div>
        <div>Потужність (P = U · I): <span id="simPowerVal" style="color:#d97706; font-size:18px;">0.00 Вт</span></div>
      </div>
    </div>
  `;
}

function initCircuitLogic() {
  let isClosed = false;
  const lever = document.getElementById('simSwitchLever');
  const bulb = document.getElementById('simBulb');
  const vRange = document.getElementById('simVoltageRange');
  const rRange = document.getElementById('simResistanceRange');
  const vVal = document.getElementById('simVoltageVal');
  const rVal = document.getElementById('simResistanceVal');
  const iVal = document.getElementById('simCurrentVal');
  const pVal = document.getElementById('simPowerVal');

  function update() {
    const u = parseFloat(vRange.value);
    const r = parseFloat(rRange.value);
    vVal.textContent = `${u} В`;
    rVal.textContent = `${r} Ом`;

    if (isClosed) {
      lever.setAttribute('x2', '280');
      lever.setAttribute('y2', '40');
      lever.setAttribute('stroke', '#16a34a');

      const i = u / r;
      const p = u * i;
      iVal.textContent = `${i.toFixed(2)} А`;
      pVal.textContent = `${p.toFixed(2)} Вт`;

      const brightness = Math.min(1, i / 2.0);
      bulb.setAttribute('fill', `rgba(250, 204, 21, ${0.3 + brightness * 0.7})`);
      bulb.style.filter = `drop-shadow(0 0 ${brightness * 20}px #facc15)`;
    } else {
      lever.setAttribute('x2', '275');
      lever.setAttribute('y2', '20');
      lever.setAttribute('stroke', '#2563eb');
      iVal.textContent = '0.00 А';
      pVal.textContent = '0.00 Вт';
      bulb.setAttribute('fill', '#f1f5f9');
      bulb.style.filter = 'none';
    }
  }

  if (lever) {
    lever.addEventListener('click', () => {
      isClosed = !isClosed;
      update();
    });
  }
  if (vRange) vRange.addEventListener('input', update);
  if (rRange) rRange.addEventListener('input', update);
  update();
}

function renderOpticsSimulationHtml() {
  setTimeout(() => initOpticsLogic(), 50);
  return `
    <div style="padding:20px; font-family:sans-serif; background:white; border-radius:12px; max-width:800px; margin:0 auto;">
      <h3 style="color:#1e3a8a; margin-bottom:8px;">🔍 Геометрична Оптика — Хід променів у збиральній лінзі</h3>
      <p style="color:#64748b; font-size:14px; margin-bottom:12px;">Переміщуйте предмет (стрілку зліва) або змінюйте фокусну відстань (F).</p>
      
      <div style="display:flex; gap:20px; margin-bottom:12px;">
        <label style="font-weight:600;">Фокусна відстань F: 
          <input type="range" id="optFocal" min="40" max="140" value="80">
          <span id="optFocalVal">80 px</span>
        </label>
        <label style="font-weight:600;">Відстань до предмета d: 
          <input type="range" id="optObjDist" min="60" max="240" value="160">
          <span id="optObjDistVal">160 px</span>
        </label>
      </div>

      <div style="width:100%; height:300px; background:#0f172a; border-radius:8px; overflow:hidden; position:relative;">
        <svg id="opticsSvg" width="100%" height="100%" viewBox="-300 -150 600 300">
          <!-- Головна оптична вісь -->
          <line x1="-300" y1="0" x2="300" y2="0" stroke="#475569" stroke-width="1.5" stroke-dasharray="4 4"/>
          <!-- Лінза -->
          <line x1="0" y1="-120" x2="0" y2="120" stroke="#38bdf8" stroke-width="3"/>
          <path d="M-6 -115 L0 -120 L6 -115 M-6 115 L0 120 L6 115" stroke="#38bdf8" stroke-width="3" fill="none"/>
          
          <!-- Фокуси -->
          <circle id="optF1" cx="-80" cy="0" r="4" fill="#f43f5e"/>
          <circle id="optF2" cx="80" cy="0" r="4" fill="#f43f5e"/>
          <text id="optTxtF1" x="-80" y="20" fill="#f43f5e" font-size="12" text-anchor="middle">F</text>
          <text id="optTxtF2" x="80" y="20" fill="#f43f5e" font-size="12" text-anchor="middle">F</text>

          <!-- Предмет (стрілка) -->
          <line id="optArrow" x1="-160" y1="0" x2="-160" y2="-60" stroke="#22c55e" stroke-width="4" marker-end="url(#markerArrow)"/>
          
          <!-- Промені світла -->
          <line id="optRay1" x1="-160" y1="-60" x2="0" y2="-60" stroke="#fbbf24" stroke-width="2"/>
          <line id="optRay1After" x1="0" y1="-60" x2="300" y2="60" stroke="#fbbf24" stroke-width="2"/>
          <line id="optRay2" x1="-160" y1="-60" x2="300" y2="112" stroke="#fbbf24" stroke-width="2"/>

          <!-- Зображення предмета -->
          <line id="optImage" x1="160" y1="0" x2="160" y2="60" stroke="#a855f7" stroke-width="4"/>
        </svg>
      </div>
    </div>
  `;
}

function initOpticsLogic() {
  const fInput = document.getElementById('optFocal');
  const dInput = document.getElementById('optObjDist');
  const fVal = document.getElementById('optFocalVal');
  const dVal = document.getElementById('optObjDistVal');

  const f1 = document.getElementById('optF1');
  const f2 = document.getElementById('optF2');
  const txtF1 = document.getElementById('optTxtF1');
  const txtF2 = document.getElementById('optTxtF2');
  const arrow = document.getElementById('optArrow');
  const ray1 = document.getElementById('optRay1');
  const ray1After = document.getElementById('optRay1After');
  const ray2 = document.getElementById('optRay2');
  const imgLine = document.getElementById('optImage');

  function update() {
    const F = parseFloat(fInput.value);
    const d = parseFloat(dInput.value);
    fVal.textContent = `${F} px`;
    dVal.textContent = `${d} px`;

    f1.setAttribute('cx', -F);
    f2.setAttribute('cx', F);
    txtF1.setAttribute('x', -F);
    txtF2.setAttribute('x', F);

    const h = 60; // висота предмета
    arrow.setAttribute('x1', -d);
    arrow.setAttribute('x2', -d);

    ray1.setAttribute('x1', -d);
    ray1.setAttribute('y1', -h);

    // Формула тонкої лінзи: 1/f = 1/d + 1/f_img => f_img = (d*F)/(d-F)
    if (Math.abs(d - F) > 2) {
      const fImg = (d * F) / (d - F);
      const hImg = -(h * fImg) / d;

      ray1After.setAttribute('x1', 0);
      ray1After.setAttribute('y1', -h);
      ray1After.setAttribute('x2', fImg);
      ray1After.setAttribute('y2', hImg);

      ray2.setAttribute('x1', -d);
      ray2.setAttribute('y1', -h);
      ray2.setAttribute('x2', fImg);
      ray2.setAttribute('y2', hImg);

      imgLine.setAttribute('x1', fImg);
      imgLine.setAttribute('y1', 0);
      imgLine.setAttribute('x2', fImg);
      imgLine.setAttribute('y2', hImg);
      imgLine.style.display = 'block';
    } else {
      imgLine.style.display = 'none';
    }
  }

  if (fInput) fInput.addEventListener('input', update);
  if (dInput) dInput.addEventListener('input', update);
  update();
}

function renderPendulumSimulationHtml() {
  setTimeout(() => initPendulumLogic(), 50);
  return `
    <div style="padding:20px; font-family:sans-serif; background:white; border-radius:12px; max-width:800px; margin:0 auto;">
      <h3 style="color:#1e3a8a;">⏱️ Математичний Маятник (Коливання)</h3>
      <div style="display:flex; gap:16px; margin:12px 0;">
        <label>Довжина нитки (L): <input type="range" id="penLength" min="80" max="220" value="160"></label>
        <label>Початковий кут (θ): <input type="range" id="penAngle" min="10" max="60" value="35"></label>
        <button id="penReset" style="padding:4px 10px; background:#2563eb; color:white; border:none; border-radius:4px; cursor:pointer;">Перезапуск</button>
      </div>
      <canvas id="penCanvas" width="700" height="280" style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px;"></canvas>
    </div>
  `;
}

function initPendulumLogic() {
  const canvas = document.getElementById('penCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let L = 160;
  let angle = (35 * Math.PI) / 180;
  let aVel = 0;
  let aAcc = 0;
  const g = 0.4;

  function loop() {
    if (!document.getElementById('penCanvas')) return;
    aAcc = (-1 * g / L) * Math.sin(angle);
    aVel += aAcc;
    aVel *= 0.995; // згасання
    angle += aVel;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const originX = canvas.width / 2;
    const originY = 30;
    const bobX = originX + L * Math.sin(angle);
    const bobY = originY + L * Math.cos(angle);

    // Стельове кріплення
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(originX - 30, originY);
    ctx.lineTo(originX + 30, originY);
    ctx.stroke();

    // Нитка
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    // Кулька (вантаж)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(bobX, bobY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

function renderFunctionPlotterHtml() {
  setTimeout(() => initPlotterLogic(), 50);
  return `
    <div style="padding:20px; font-family:sans-serif; background:white; border-radius:12px; max-width:800px; margin:0 auto;">
      <h3 style="color:#1e3a8a; margin-bottom:8px;">📈 Графічний плотер функцій f(x)</h3>
      <div style="display:flex; gap:10px; margin-bottom:12px;">
        <span style="font-weight:bold; font-size:18px; line-height:36px;">f(x) =</span>
        <input type="text" id="plotterFuncInput" value="Math.sin(x)" style="flex:1; padding:6px 12px; font-size:16px; border:1px solid #cbd5e1; border-radius:6px;">
        <button id="plotterBtn" style="padding:8px 16px; background:#2563eb; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">Побудувати</button>
      </div>
      <div style="display:flex; gap:6px; margin-bottom:10px;">
        <button class="plot-preset" data-fn="Math.sin(x)" style="padding:4px 8px; border:1px solid #cbd5e1; border-radius:4px; background:#f1f5f9; cursor:pointer;">sin(x)</button>
        <button class="plot-preset" data-fn="Math.cos(x)" style="padding:4px 8px; border:1px solid #cbd5e1; border-radius:4px; background:#f1f5f9; cursor:pointer;">cos(x)</button>
        <button class="plot-preset" data-fn="x * x - 4" style="padding:4px 8px; border:1px solid #cbd5e1; border-radius:4px; background:#f1f5f9; cursor:pointer;">x² - 4</button>
        <button class="plot-preset" data-fn="2 * x + 1" style="padding:4px 8px; border:1px solid #cbd5e1; border-radius:4px; background:#f1f5f9; cursor:pointer;">2x + 1</button>
        <button class="plot-preset" data-fn="Math.sqrt(Math.max(0, x))" style="padding:4px 8px; border:1px solid #cbd5e1; border-radius:4px; background:#f1f5f9; cursor:pointer;">√x</button>
      </div>
      <canvas id="plotterCanvas" width="700" height="300" style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px;"></canvas>
    </div>
  `;
}

function initPlotterLogic() {
  const canvas = document.getElementById('plotterCanvas');
  const input = document.getElementById('plotterFuncInput');
  const btn = document.getElementById('plotterBtn');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const scale = 30; // 30 px = 1 unit

    // Осі координат
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(canvas.width, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, canvas.height);
    ctx.stroke();

    // Графік
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    let isFirst = true;
    for (let px = 0; px < canvas.width; px++) {
      const x = (px - cx) / scale;
      try {
        const y = eval(input.value);
        const py = cy - y * scale;
        if (!isNaN(py) && isFinite(py)) {
          if (isFirst) {
            ctx.moveTo(px, py);
            isFirst = false;
          } else {
            ctx.lineTo(px, py);
          }
        }
      } catch (e) {
        // error in formula
      }
    }
    ctx.stroke();
  }

  if (btn) btn.addEventListener('click', draw);
  if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') draw(); });
  document.querySelectorAll('.plot-preset').forEach(b => {
    b.addEventListener('click', () => {
      input.value = b.dataset.fn;
      draw();
    });
  });
  draw();
}

function renderGlobeSimulationHtml() {
  setTimeout(() => initGlobeLogic(), 50);
  return `
    <div style="padding:20px; font-family:sans-serif; background:#0f172a; color:white; border-radius:12px; max-width:800px; margin:0 auto; text-align:center;">
      <h3 style="color:#60a5fa; margin-bottom:6px;">🌍 Інтерактивна 3D Модель Земної Кулі</h3>
      <p style="color:#94a3b8; font-size:14px; margin-bottom:12px;">Тягніть мишкою або пальцем, щоб обертати глобус у будь-якому напрямку.</p>
      <canvas id="globeCanvas" width="400" height="340" style="background:#0f172a; cursor:grab;"></canvas>
    </div>
  `;
}

function initGlobeLogic() {
  const canvas = document.getElementById('globeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let rotX = 0.2;
  let rotY = 0;
  let dragging = false;
  let lastX = 0, lastY = 0;

  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    rotY += dx * 0.01;
    rotX -= dy * 0.01;
    lastX = e.clientX;
    lastY = e.clientY;
    draw();
  });
  window.addEventListener('pointerup', () => { dragging = false; });

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const R = 130;

    // Океан (фон сфери)
    const grad = ctx.createRadialGradient(cx - 30, cy - 30, 10, cx, cy, R);
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(0.8, '#0284c7');
    grad.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();

    // Паралелі та меридіани
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;

    for (let lat = -60; lat <= 60; lat += 30) {
      const phi = (lat * Math.PI) / 180;
      const rLat = R * Math.cos(phi);
      const yLat = cy - R * Math.sin(phi) * Math.cos(rotX);
      ctx.beginPath();
      ctx.ellipse(cx, yLat, rLat, rLat * Math.sin(rotX), 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Світіння атмосфери
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();
  }
  draw();
}

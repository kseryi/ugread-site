/**
 * UGREAD Whiteboard - Mathematics & Geometry Module
 * Geometric shapes, 3D solids stamps, mathematical formula symbols, and plotter launcher
 */

import { state, setRuling } from '../core/state.js';
import { openSimulation } from '../core/simulations.js';

export function renderMathPanel(container) {
  container.innerHTML = `
    <!-- Математичні інструменти -->
    <div class="module-card">
      <div class="module-card-title">
        <span>📐 Геометричні Інструменти</span>
      </div>
      <div class="btn-group-grid">
        <button class="module-btn" id="btnMathRuler">📏 Лінійка (30 см)</button>
        <button class="module-btn" id="btnMathProtractor">📐 Транспортир (180°)</button>
        <button class="module-btn" id="btnMathTriangle">📐 Косинець (90°-45°)</button>
        <button class="module-btn" id="btnMathCompass">🧭 Циркуль</button>
      </div>
    </div>

    <!-- Просторові 3D та 2D фігури (Штампи) -->
    <div class="module-card">
      <div class="module-card-title">
        <span>📦 Геометричні тіла (3D/2D)</span>
      </div>
      <div class="btn-group-grid-3">
        <button class="module-btn" data-geo="cube">🎲 Куб</button>
        <button class="module-btn" data-geo="pyramid">🔺 Піраміда</button>
        <button class="module-btn" data-geo="cylinder">🛢 Циліндр</button>
        <button class="module-btn" data-geo="cone">🍦 Конус</button>
        <button class="module-btn" data-geo="sphere">🔮 Сфера</button>
        <button class="module-btn" data-geo="parallelogram">▱ Паралелограм</button>
      </div>
    </div>

    <!-- Графіки функцій -->
    <div class="module-card">
      <div class="module-card-title">
        <span>📈 Дослідження функцій</span>
      </div>
      <button class="module-btn btn-accent" id="btnOpenGraphPlotter" style="width:100%; padding:10px; background:#2563eb; color:white;">
        🚀 Відкрити графічний калькулятор f(x)
      </button>
      <button class="module-btn" id="btnApplyCartesianGrid" style="width:100%; margin-top:6px;">
        🎯 Увімкнути координатну сітку Декарта
      </button>
    </div>

    <!-- Математичні формули та символи -->
    <div class="module-card">
      <div class="module-card-title">
        <span>🔣 Символи & Формули</span>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:4px;">
        ${['√x', 'x²', 'π', 'α', 'β', 'γ', 'Δ', '∑', '∫', '≠', '≤', '≥', '≈', '∞', 'sin', 'cos', 'tg', 'ctg', 'a²+b²=c²', '(a+b)²']
          .map(sym => `<button class="math-sym-btn" data-sym="${sym}" style="padding:4px 8px; font-family:serif; font-size:14px; background:#f1f5f9; border:1px solid #cbd5e1; border-radius:4px; cursor:pointer;">${sym}</button>`)
          .join('')}
      </div>
    </div>
  `;

  // Інструменти
  const rBtn = container.querySelector('#btnMathRuler');
  const pBtn = container.querySelector('#btnMathProtractor');
  const tBtn = container.querySelector('#btnMathTriangle');
  const cBtn = container.querySelector('#btnMathCompass');

  if (rBtn) rBtn.addEventListener('click', () => import('../core/instruments.js').then(m => m.toggleInstrument('ruler')));
  if (pBtn) pBtn.addEventListener('click', () => import('../core/instruments.js').then(m => m.toggleInstrument('protractor')));
  if (tBtn) tBtn.addEventListener('click', () => import('../core/instruments.js').then(m => m.toggleInstrument('triangle')));
  if (cBtn) cBtn.addEventListener('click', () => import('../core/instruments.js').then(m => m.toggleInstrument('compass')));

  // Фігури
  container.querySelectorAll('[data-geo]').forEach(btn => {
    btn.addEventListener('click', () => {
      insertGeometricSolid(btn.dataset.geo);
    });
  });

  // Плотер
  const plotBtn = container.querySelector('#btnOpenGraphPlotter');
  if (plotBtn) {
    plotBtn.addEventListener('click', () => {
      openSimulation('plotter', 'Графічний калькулятор f(x)');
    });
  }

  // Координатна сітка
  const gridBtn = container.querySelector('#btnApplyCartesianGrid');
  if (gridBtn) {
    gridBtn.addEventListener('click', () => {
      setRuling('cartesian_grid');
      const sel = document.getElementById('rulingSelect');
      if (sel) sel.value = 'cartesian_grid';
    });
  }

  // Символи
  container.querySelectorAll('.math-sym-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      insertMathSymbol(btn.dataset.sym);
    });
  });
}

function insertGeometricSolid(type) {
  const drawLayer = document.getElementById('drawingLayer');
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', 'translate(180, 160)');

  const stroke = state.strokeColor || '#1e3a8a';
  const width = '2.5';

  if (type === 'cube') {
    g.innerHTML = `
      <!-- Передня грань -->
      <rect x="0" y="40" width="100" height="100" fill="none" stroke="${stroke}" stroke-width="${width}"/>
      <!-- Задня грань -->
      <rect x="40" y="0" width="100" height="100" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-dasharray="4 4"/>
      <!-- З'єднувальні ребра -->
      <line x1="0" y1="40" x2="40" y2="0" stroke="${stroke}" stroke-width="${width}"/>
      <line x1="100" y1="40" x2="140" y2="0" stroke="${stroke}" stroke-width="${width}"/>
      <line x1="100" y1="140" x2="140" y2="100" stroke="${stroke}" stroke-width="${width}"/>
      <line x1="0" y1="140" x2="40" y2="100" stroke="${stroke}" stroke-width="${width}" stroke-dasharray="4 4"/>
    `;
  } else if (type === 'pyramid') {
    g.innerHTML = `
      <!-- Основа -->
      <polygon points="20,120 120,120 160,80 60,80" fill="none" stroke="${stroke}" stroke-width="${width}"/>
      <!-- Вершина -->
      <line x1="90" y1="10" x2="20" y2="120" stroke="${stroke}" stroke-width="${width}"/>
      <line x1="90" y1="10" x2="120" y2="120" stroke="${stroke}" stroke-width="${width}"/>
      <line x1="90" y1="10" x2="160" y2="80" stroke="${stroke}" stroke-width="${width}"/>
      <line x1="90" y1="10" x2="60" y2="80" stroke="${stroke}" stroke-width="${width}" stroke-dasharray="4 4"/>
      <!-- Висота H -->
      <line x1="90" y1="10" x2="90" y2="100" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="3 3"/>
    `;
  } else if (type === 'cylinder') {
    g.innerHTML = `
      <ellipse cx="60" cy="25" rx="50" ry="18" fill="none" stroke="${stroke}" stroke-width="${width}"/>
      <line x1="10" y1="25" x2="10" y2="130" stroke="${stroke}" stroke-width="${width}"/>
      <line x1="110" y1="25" x2="110" y2="130" stroke="${stroke}" stroke-width="${width}"/>
      <path d="M 10 130 A 50 18 0 0 0 110 130" fill="none" stroke="${stroke}" stroke-width="${width}"/>
      <path d="M 10 130 A 50 18 0 0 1 110 130" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-dasharray="4 4"/>
    `;
  } else if (type === 'cone') {
    g.innerHTML = `
      <line x1="60" y1="10" x2="10" y2="120" stroke="${stroke}" stroke-width="${width}"/>
      <line x1="60" y1="10" x2="110" y2="120" stroke="${stroke}" stroke-width="${width}"/>
      <path d="M 10 120 A 50 18 0 0 0 110 120" fill="none" stroke="${stroke}" stroke-width="${width}"/>
      <path d="M 10 120 A 50 18 0 0 1 110 120" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-dasharray="4 4"/>
      <!-- Висота H -->
      <line x1="60" y1="10" x2="60" y2="120" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="3 3"/>
    `;
  } else if (type === 'sphere') {
    g.innerHTML = `
      <circle cx="70" cy="70" r="60" fill="none" stroke="${stroke}" stroke-width="${width}"/>
      <ellipse cx="70" cy="70" rx="60" ry="20" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-dasharray="4 4"/>
      <path d="M 10 70 A 60 20 0 0 0 130 70" fill="none" stroke="${stroke}" stroke-width="${width}"/>
    `;
  } else if (type === 'parallelogram') {
    g.innerHTML = `
      <polygon points="40,20 150,20 110,90 0,90" fill="none" stroke="${stroke}" stroke-width="${width}"/>
      <line x1="40" y1="20" x2="40" y2="90" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="3 3"/>
      <text x="44" y="60" font-size="12" fill="#dc2626">h</text>
      <text x="50" y="105" font-size="12" fill="${stroke}">a</text>
    `;
  }

  drawLayer.appendChild(g);
}

function insertMathSymbol(sym) {
  const drawLayer = document.getElementById('drawingLayer');
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${200 + Math.random() * 60}, ${180 + Math.random() * 60})`);

  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('font-family', 'Georgia, "Times New Roman", serif');
  text.setAttribute('font-size', '30');
  text.setAttribute('fill', state.strokeColor || '#1e3a8a');
  text.textContent = sym;

  g.appendChild(text);
  drawLayer.appendChild(g);
}

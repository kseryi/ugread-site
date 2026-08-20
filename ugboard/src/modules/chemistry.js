/**
 * UGREAD Whiteboard - Chemistry Module
 * Interactive 118 Elements Periodic Table (Mendeleev), Molecule Builder, and Solubility Table
 */

import { state } from '../core/state.js';

// Список хімічних елементів
const ELEMENTS = [
  { n: 1, s: 'H', name: 'Гідроген', m: '1.008', group: 1, period: 1, type: 'nonmetal', color: '#38bdf8' },
  { n: 2, s: 'He', name: 'Гелій', m: '4.0026', group: 18, period: 1, type: 'noble', color: '#c084fc' },
  { n: 3, s: 'Li', name: 'Літій', m: '6.94', group: 1, period: 2, type: 'alkali', color: '#f87171' },
  { n: 4, s: 'Be', name: 'Берилій', m: '9.0122', group: 2, period: 2, type: 'alkaline', color: '#fb923c' },
  { n: 5, s: 'B', name: 'Бор', m: '10.81', group: 13, period: 2, type: 'metalloid', color: '#facc15' },
  { n: 6, s: 'C', name: 'Карбон', m: '12.011', group: 14, period: 2, type: 'nonmetal', color: '#38bdf8' },
  { n: 7, s: 'N', name: 'Нітроген', m: '14.007', group: 15, period: 2, type: 'nonmetal', color: '#38bdf8' },
  { n: 8, s: 'O', name: 'Оксиген', m: '15.999', group: 16, period: 2, type: 'nonmetal', color: '#38bdf8' },
  { n: 9, s: 'F', name: 'Флуор', m: '18.998', group: 17, period: 2, type: 'halogen', color: '#4ade80' },
  { n: 10, s: 'Ne', name: 'Неон', m: '20.180', group: 18, period: 2, type: 'noble', color: '#c084fc' },
  { n: 11, s: 'Na', name: 'Натрій', m: '22.990', group: 1, period: 3, type: 'alkali', color: '#f87171' },
  { n: 12, s: 'Mg', name: 'Магній', m: '24.305', group: 2, period: 3, type: 'alkaline', color: '#fb923c' },
  { n: 13, s: 'Al', name: 'Алюміній', m: '26.982', group: 13, period: 3, type: 'post-transition', color: '#94a3b8' },
  { n: 14, s: 'Si', name: 'Силіцій', m: '28.085', group: 14, period: 3, type: 'metalloid', color: '#facc15' },
  { n: 15, s: 'P', name: 'Фосфор', m: '30.974', group: 15, period: 3, type: 'nonmetal', color: '#38bdf8' },
  { n: 16, s: 'S', name: 'Сульфур', m: '32.06', group: 16, period: 3, type: 'nonmetal', color: '#38bdf8' },
  { n: 17, s: 'Cl', name: 'Хлор', m: '35.45', group: 17, period: 3, type: 'halogen', color: '#4ade80' },
  { n: 18, s: 'Ar', name: 'Аргон', m: '39.948', group: 18, period: 3, type: 'noble', color: '#c084fc' },
  { n: 19, s: 'K', name: 'Калій', m: '39.098', group: 1, period: 4, type: 'alkali', color: '#f87171' },
  { n: 20, s: 'Ca', name: 'Кальцій', m: '40.078', group: 2, period: 4, type: 'alkaline', color: '#fb923c' },
  { n: 26, s: 'Fe', name: 'Ферум (Залізо)', m: '55.845', group: 8, period: 4, type: 'transition', color: '#818cf8' },
  { n: 29, s: 'Cu', name: 'Купрум (Мідь)', m: '63.546', group: 11, period: 4, type: 'transition', color: '#818cf8' },
  { n: 30, s: 'Zn', name: 'Цинк', m: '65.38', group: 12, period: 4, type: 'transition', color: '#818cf8' },
  { n: 47, s: 'Ag', name: 'Аргентум (Срібло)', m: '107.87', group: 11, period: 5, type: 'transition', color: '#818cf8' },
  { n: 79, s: 'Au', name: 'Аурум (Золото)', m: '196.97', group: 11, period: 6, type: 'transition', color: '#818cf8' }
];

export function renderChemistryPanel(container) {
  container.innerHTML = `
    <!-- Періодична система Менделєєва -->
    <div class="module-card">
      <div class="module-card-title">
        <span>🧪 Періодична система елементів</span>
        <button id="btnOpenFullPeriodicTable" class="btn-icon-sm btn-accent" title="Повна таблиця">⛶</button>
      </div>
      <p style="font-size:12px; color:#64748b;">Оберіть елемент для вставки на дошку або детального перегляду:</p>

      <div style="display:flex; flex-wrap:wrap; gap:4px; max-height:160px; overflow-y:auto; padding:4px; background:#0f172a; border-radius:6px;">
        ${ELEMENTS.map(el => `
          <button class="chem-el-btn" data-elem="${el.s}" style="width:36px; height:42px; border-radius:4px; background:${el.color}; border:none; color:#0f172a; display:flex; flex-direction:column; align-items:center; justify-content:center; font-weight:bold; cursor:pointer;" title="${el.name} (Z=${el.n}, M=${el.m})">
            <span style="font-size:8px; line-height:8px; opacity:0.8;">${el.n}</span>
            <span style="font-size:13px; line-height:14px;">${el.s}</span>
          </button>
        `).join('')}
      </div>

      <button id="btnAddPeriodicTableToBoard" class="module-btn" style="width:100%; margin-top:8px;">
        📊 Вставити таблицю Менделєєва на дошку
      </button>
    </div>

    <!-- Конструктор молекул -->
    <div class="module-card">
      <div class="module-card-title">
        <span>🔬 Конструктор молекул</span>
      </div>
      <div class="btn-group-grid">
        <button class="module-btn" data-mol="H2O">💧 Вода (H₂O)</button>
        <button class="module-btn" data-mol="CO2">💨 Вуглекислий газ (CO₂)</button>
        <button class="module-btn" data-mol="CH4">🔥 Метан (CH₄)</button>
        <button class="module-btn" data-mol="H2SO4">🧪 Сульфатна к-та (H₂SO₄)</button>
      </div>
    </div>

    <!-- Таблиця розчинності -->
    <div class="module-card">
      <div class="module-card-title">
        <span>💧 Таблиця розчинності солей і кислот</span>
      </div>
      <button class="module-btn" id="btnOpenSolubilityModal" style="width:100%;">
        📋 Переглянути таблицю розчинності
      </button>
    </div>
  `;

  // Клік по елементу
  container.querySelectorAll('.chem-el-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sym = btn.dataset.elem;
      const el = ELEMENTS.find(e => e.s === sym);
      if (el) insertElementCard(el);
    });
  });

  const fullPtBtn = container.querySelector('#btnOpenFullPeriodicTable');
  const addPtToBoardBtn = container.querySelector('#btnAddPeriodicTableToBoard');
  const solBtn = container.querySelector('#btnOpenSolubilityModal');

  if (fullPtBtn) fullPtBtn.addEventListener('click', openFullPeriodicTableModal);
  if (addPtToBoardBtn) addPtToBoardBtn.addEventListener('click', insertPeriodicTableToBoard);
  if (solBtn) solBtn.addEventListener('click', openSolubilityModal);

  // Молекули
  container.querySelectorAll('[data-mol]').forEach(btn => {
    btn.addEventListener('click', () => {
      insertMoleculeDiagram(btn.dataset.mol);
    });
  });
}

function insertElementCard(el) {
  const drawLayer = document.getElementById('drawingLayer');
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', 'translate(180, 160)');

  g.innerHTML = `
    <rect x="0" y="0" width="110" height="130" rx="8" fill="#ffffff" stroke="${el.color}" stroke-width="3" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.1))"/>
    <rect x="0" y="0" width="110" height="30" rx="8" fill="${el.color}"/>
    <text x="10" y="20" font-size="14" font-weight="bold" fill="#0f172a">Z = ${el.n}</text>
    <text x="55" y="75" font-size="34" font-weight="bold" fill="#0f172a" text-anchor="middle">${el.s}</text>
    <text x="55" y="100" font-size="12" font-weight="600" fill="#475569" text-anchor="middle">${el.name}</text>
    <text x="55" y="118" font-size="11" fill="#64748b" text-anchor="middle">M = ${el.m}</text>
  `;

  drawLayer.appendChild(g);
}

function insertMoleculeDiagram(molType) {
  const drawLayer = document.getElementById('drawingLayer');
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', 'translate(200, 180)');

  if (molType === 'H2O') {
    g.innerHTML = `
      <!-- Оксиген (O) -->
      <circle cx="80" cy="50" r="28" fill="#ef4444" stroke="#b91c1c" stroke-width="3"/>
      <text x="80" y="58" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">O</text>
      <!-- Гідрогени (H) -->
      <line x1="60" y1="65" x2="30" y2="90" stroke="#334155" stroke-width="5"/>
      <circle cx="25" cy="95" r="18" fill="#38bdf8" stroke="#0284c7" stroke-width="3"/>
      <text x="25" y="101" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">H</text>

      <line x1="100" y1="65" x2="130" y2="90" stroke="#334155" stroke-width="5"/>
      <circle cx="135" cy="95" r="18" fill="#38bdf8" stroke="#0284c7" stroke-width="3"/>
      <text x="135" y="101" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">H</text>
      
      <text x="80" y="135" font-size="16" font-weight="bold" fill="#1e293b" text-anchor="middle">Вода H₂O (кут ~104.5°)</text>
    `;
  } else if (molType === 'CO2') {
    g.innerHTML = `
      <!-- Карбон (C) -->
      <circle cx="100" cy="50" r="24" fill="#334155" stroke="#0f172a" stroke-width="3"/>
      <text x="100" y="57" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">C</text>

      <!-- Подвійні зв'язки O=C=O -->
      <line x1="45" y1="44" x2="76" y2="44" stroke="#334155" stroke-width="4"/>
      <line x1="45" y1="56" x2="76" y2="56" stroke="#334155" stroke-width="4"/>
      <circle cx="25" cy="50" r="20" fill="#ef4444" stroke="#b91c1c" stroke-width="3"/>
      <text x="25" y="56" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">O</text>

      <line x1="124" y1="44" x2="155" y2="44" stroke="#334155" stroke-width="4"/>
      <line x1="124" y1="56" x2="155" y2="56" stroke="#334155" stroke-width="4"/>
      <circle cx="175" cy="50" r="20" fill="#ef4444" stroke="#b91c1c" stroke-width="3"/>
      <text x="175" y="56" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">O</text>

      <text x="100" y="95" font-size="15" font-weight="bold" fill="#1e293b" text-anchor="middle">Вуглекислий газ CO₂ (лінійна)</text>
    `;
  } else {
    // CH4
    g.innerHTML = `
      <circle cx="70" cy="70" r="24" fill="#334155"/>
      <text x="70" y="77" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">C</text>
      <line x1="70" y1="46" x2="70" y2="25" stroke="#334155" stroke-width="4"/>
      <circle cx="70" cy="18" r="14" fill="#38bdf8"/><text x="70" y="23" font-size="12" fill="#fff" text-anchor="middle">H</text>
      <line x1="70" y1="94" x2="70" y2="115" stroke="#334155" stroke-width="4"/>
      <circle cx="70" cy="122" r="14" fill="#38bdf8"/><text x="70" y="127" font-size="12" fill="#fff" text-anchor="middle">H</text>
      <line x1="46" y1="70" x2="25" y2="70" stroke="#334155" stroke-width="4"/>
      <circle cx="18" cy="70" r="14" fill="#38bdf8"/><text x="18" y="75" font-size="12" fill="#fff" text-anchor="middle">H</text>
      <line x1="94" y1="70" x2="115" y2="70" stroke="#334155" stroke-width="4"/>
      <circle cx="122" cy="70" r="14" fill="#38bdf8"/><text x="122" y="75" font-size="12" fill="#fff" text-anchor="middle">H</text>
      <text x="70" y="155" font-size="15" font-weight="bold" fill="#1e293b" text-anchor="middle">Метан CH₄</text>
    `;
  }

  drawLayer.appendChild(g);
}

function insertPeriodicTableToBoard() {
  const bgLayer = document.getElementById('backgroundLayer');
  bgLayer.innerHTML = '';

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', 'translate(50, 60)');

  g.innerHTML = `
    <text x="20" y="30" font-size="22" font-weight="bold" fill="#1e3a8a">🧪 Періодична система хімічних елементів Д. І. Менделєєва</text>
    <rect x="0" y="50" width="760" height="420" rx="10" fill="#0f172a" stroke="#334155" stroke-width="2"/>
  `;

  // Додаємо клітинки елементів
  ELEMENTS.forEach((el, idx) => {
    const col = ((el.n - 1) % 10);
    const row = Math.floor((el.n - 1) / 10);
    const x = 20 + col * 72;
    const y = 70 + row * 75;

    const cell = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    cell.setAttribute('transform', `translate(${x}, ${y})`);
    cell.innerHTML = `
      <rect width="66" height="68" rx="6" fill="${el.color}" stroke="#ffffff" stroke-width="1.5"/>
      <text x="6" y="14" font-size="10" font-weight="bold" fill="#0f172a">${el.n}</text>
      <text x="33" y="38" font-size="20" font-weight="bold" fill="#0f172a" text-anchor="middle">${el.s}</text>
      <text x="33" y="52" font-size="9" font-weight="600" fill="#1e293b" text-anchor="middle">${el.name.split(' ')[0]}</text>
      <text x="33" y="63" font-size="8" fill="#334155" text-anchor="middle">${el.m}</text>
    `;
    g.appendChild(cell);
  });

  bgLayer.appendChild(g);
}

function openFullPeriodicTableModal() {
  const backdrop = document.getElementById('appModalBackdrop');
  const title = document.getElementById('modalTitle');
  const body = document.getElementById('modalBody');

  title.textContent = '🧪 Повна Періодична Система Хімічних Елементів';
  body.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(80px, 1fr)); gap:6px; max-height:60vh; overflow-y:auto; padding:8px;">
      ${ELEMENTS.map(el => `
        <div style="background:${el.color}; padding:8px; border-radius:6px; text-align:center; color:#0f172a;">
          <div style="font-size:11px; font-weight:bold;">${el.n}</div>
          <div style="font-size:22px; font-weight:bold;">${el.s}</div>
          <div style="font-size:11px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${el.name}</div>
          <div style="font-size:10px; opacity:0.8;">${el.m}</div>
        </div>
      `).join('')}
    </div>
  `;
  backdrop.style.display = 'flex';
}

function openSolubilityModal() {
  const backdrop = document.getElementById('appModalBackdrop');
  const title = document.getElementById('modalTitle');
  const body = document.getElementById('modalBody');

  title.textContent = '💧 Таблиця розчинності кислот, основ і солей у воді';
  body.innerHTML = `
    <div style="overflow-x:auto; font-size:13px;">
      <table style="width:100%; border-collapse:collapse; text-align:center;">
        <thead>
          <tr style="background:#e2e8f0;">
            <th style="padding:6px; border:1px solid #cbd5e1;">Іони</th>
            <th style="padding:6px; border:1px solid #cbd5e1;">H⁺</th>
            <th style="padding:6px; border:1px solid #cbd5e1;">Na⁺</th>
            <th style="padding:6px; border:1px solid #cbd5e1;">K⁺</th>
            <th style="padding:6px; border:1px solid #cbd5e1;">Ca²⁺</th>
            <th style="padding:6px; border:1px solid #cbd5e1;">Ba²⁺</th>
            <th style="padding:6px; border:1px solid #cbd5e1;">Ag⁺</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-weight:bold; border:1px solid #cbd5e1; background:#f8fafc;">OH⁻</td>
            <td style="border:1px solid #cbd5e1;">—</td>
            <td style="border:1px solid #cbd5e1; color:#16a34a; font-weight:bold;">Р</td>
            <td style="border:1px solid #cbd5e1; color:#16a34a; font-weight:bold;">Р</td>
            <td style="border:1px solid #cbd5e1; color:#d97706; font-weight:bold;">М</td>
            <td style="border:1px solid #cbd5e1; color:#16a34a; font-weight:bold;">Р</td>
            <td style="border:1px solid #cbd5e1; color:#dc2626; font-weight:bold;">—</td>
          </tr>
          <tr>
            <td style="font-weight:bold; border:1px solid #cbd5e1; background:#f8fafc;">Cl⁻</td>
            <td style="border:1px solid #cbd5e1; color:#16a34a; font-weight:bold;">Р</td>
            <td style="border:1px solid #cbd5e1; color:#16a34a; font-weight:bold;">Р</td>
            <td style="border:1px solid #cbd5e1; color:#16a34a; font-weight:bold;">Р</td>
            <td style="border:1px solid #cbd5e1; color:#16a34a; font-weight:bold;">Р</td>
            <td style="border:1px solid #cbd5e1; color:#16a34a; font-weight:bold;">Р</td>
            <td style="border:1px solid #cbd5e1; color:#dc2626; font-weight:bold;">Н</td>
          </tr>
          <tr>
            <td style="font-weight:bold; border:1px solid #cbd5e1; background:#f8fafc;">SO₄²⁻</td>
            <td style="border:1px solid #cbd5e1; color:#16a34a; font-weight:bold;">Р</td>
            <td style="border:1px solid #cbd5e1; color:#16a34a; font-weight:bold;">Р</td>
            <td style="border:1px solid #cbd5e1; color:#16a34a; font-weight:bold;">Р</td>
            <td style="border:1px solid #cbd5e1; color:#d97706; font-weight:bold;">М</td>
            <td style="border:1px solid #cbd5e1; color:#dc2626; font-weight:bold;">Н</td>
            <td style="border:1px solid #cbd5e1; color:#d97706; font-weight:bold;">М</td>
          </tr>
          <tr>
            <td style="font-weight:bold; border:1px solid #cbd5e1; background:#f8fafc;">CO₃²⁻</td>
            <td style="border:1px solid #cbd5e1; color:#16a34a; font-weight:bold;">Р</td>
            <td style="border:1px solid #cbd5e1; color:#16a34a; font-weight:bold;">Р</td>
            <td style="border:1px solid #cbd5e1; color:#16a34a; font-weight:bold;">Р</td>
            <td style="border:1px solid #cbd5e1; color:#dc2626; font-weight:bold;">Н</td>
            <td style="border:1px solid #cbd5e1; color:#dc2626; font-weight:bold;">Н</td>
            <td style="border:1px solid #cbd5e1; color:#dc2626; font-weight:bold;">Н</td>
          </tr>
        </tbody>
      </table>
      <div style="display:flex; gap:12px; margin-top:10px; font-weight:bold;">
        <span style="color:#16a34a;">Р — розчинна</span>
        <span style="color:#d97706;">М — малорозчинна</span>
        <span style="color:#dc2626;">Н — нерозчинна</span>
      </div>
    </div>
  `;
  backdrop.style.display = 'flex';
}

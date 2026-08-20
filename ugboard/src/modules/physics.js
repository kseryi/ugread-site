/**
 * UGREAD Whiteboard - Physics & Electrical Circuit Simulator Module
 */

import { state } from '../core/state.js';
import { openSimulation } from '../core/simulations.js';

export function renderPhysicsPanel(container) {
  container.innerHTML = `
    <!-- Готові симуляції фізичних явищ -->
    <div class="module-card">
      <div class="module-card-title">
        <span>⚡ Фізичні Лабораторії & Симуляції</span>
      </div>
      <div class="btn-group-grid">
        <button class="module-btn btn-accent" id="btnPhysCircuit" style="background:#2563eb; color:white;">
          ⚡ Електричне коло
        </button>
        <button class="module-btn btn-accent" id="btnPhysOptics" style="background:#0284c7; color:white;">
          🔍 Оптика & Лінзи
        </button>
        <button class="module-btn" id="btnPhysPendulum">
          ⏱️ Маятник (Коливання)
        </button>
        <button class="module-btn" id="btnPhysForces">
          🏹 Додавання сил (Вектори)
        </button>
      </div>
    </div>

    <!-- Елементи електричних схем (Штампи) -->
    <div class="module-card">
      <div class="module-card-title">
        <span>🔌 Елементи електричних схем</span>
      </div>
      <div class="btn-group-grid-3">
        <button class="module-btn" data-circuit="battery">🔋 Батарея</button>
        <button class="module-btn" data-circuit="resistor">⚡ Резистор</button>
        <button class="module-btn" data-circuit="lamp">💡 Лампа</button>
        <button class="module-btn" data-circuit="switch">🔘 Ключ</button>
        <button class="module-btn" data-circuit="ammeter">🅰 Амперметр</button>
        <button class="module-btn" data-circuit="voltmeter">🆅 Вольтметр</button>
        <button class="module-btn" data-circuit="capacitor">⏸ Конденсатор</button>
        <button class="module-btn" data-circuit="diode">▶| Діод</button>
        <button class="module-btn" data-circuit="ground">⏚ Заземлення</button>
      </div>
    </div>

    <!-- Вектори сил та механіка -->
    <div class="module-card">
      <div class="module-card-title">
        <span>🏹 Вектори сил</span>
      </div>
      <div class="btn-group-grid">
        <button class="module-btn" id="btnAddForceVector">➡️ Вектор F</button>
        <button class="module-btn" id="btnAddGravityVector">⬇️ Сила тяжіння mg</button>
        <button class="module-btn" id="btnAddFrictionVector">⬅️ Сила тертя Fтер</button>
        <button class="module-btn" id="btnAddReactionVector">⬆️ Реакція опори N</button>
      </div>
    </div>
  `;

  // Симуляції
  const cBtn = container.querySelector('#btnPhysCircuit');
  const oBtn = container.querySelector('#btnPhysOptics');
  const pBtn = container.querySelector('#btnPhysPendulum');
  const fBtn = container.querySelector('#btnPhysForces');

  if (cBtn) cBtn.addEventListener('click', () => openSimulation('circuit', 'Електричне коло (Струм & Лампочка)'));
  if (oBtn) oBtn.addEventListener('click', () => openSimulation('optics', 'Геометрична Оптика (Лінзи & Промені)'));
  if (pBtn) pBtn.addEventListener('click', () => openSimulation('pendulum', 'Математичний Маятник (Коливання)'));
  if (fBtn) fBtn.addEventListener('click', insertForceDiagram);

  // Схеми
  container.querySelectorAll('[data-circuit]').forEach(btn => {
    btn.addEventListener('click', () => {
      insertCircuitElement(btn.dataset.circuit);
    });
  });

  // Вектори
  const fV = container.querySelector('#btnAddForceVector');
  const gV = container.querySelector('#btnAddGravityVector');
  const frV = container.querySelector('#btnAddFrictionVector');
  const rV = container.querySelector('#btnAddReactionVector');

  if (fV) fV.addEventListener('click', () => insertSingleVector('F', 80, 0, '#2563eb'));
  if (gV) gV.addEventListener('click', () => insertSingleVector('mg', 0, 80, '#dc2626'));
  if (frV) frV.addEventListener('click', () => insertSingleVector('Fтер', -80, 0, '#d97706'));
  if (rV) rV.addEventListener('click', () => insertSingleVector('N', 0, -80, '#16a34a'));
}

function insertCircuitElement(type) {
  const drawLayer = document.getElementById('drawingLayer');
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', 'translate(180, 180)');

  const stroke = state.strokeColor || '#1e293b';
  const sw = '2.5';

  if (type === 'battery') {
    g.innerHTML = `
      <line x1="0" y1="20" x2="30" y2="20" stroke="${stroke}" stroke-width="${sw}"/>
      <line x1="30" y1="5" x2="30" y2="35" stroke="#dc2626" stroke-width="4"/>
      <line x1="42" y1="12" x2="42" y2="28" stroke="#1e293b" stroke-width="4"/>
      <line x1="42" y1="20" x2="72" y2="20" stroke="${stroke}" stroke-width="${sw}"/>
      <text x="22" y="48" font-size="12" font-weight="bold" fill="#dc2626">+ U -</text>
    `;
  } else if (type === 'resistor') {
    g.innerHTML = `
      <line x1="0" y1="20" x2="20" y2="20" stroke="${stroke}" stroke-width="${sw}"/>
      <rect x="20" y="10" width="50" height="20" fill="none" stroke="${stroke}" stroke-width="${sw}"/>
      <line x1="70" y1="20" x2="90" y2="20" stroke="${stroke}" stroke-width="${sw}"/>
      <text x="40" y="25" font-size="12" font-weight="bold" fill="${stroke}">R</text>
    `;
  } else if (type === 'lamp') {
    g.innerHTML = `
      <line x1="0" y1="20" x2="20" y2="20" stroke="${stroke}" stroke-width="${sw}"/>
      <circle cx="36" cy="20" r="16" fill="none" stroke="${stroke}" stroke-width="${sw}"/>
      <path d="M25 31 L47 9 M25 9 L47 31" stroke="${stroke}" stroke-width="2"/>
      <line x1="52" y1="20" x2="72" y2="20" stroke="${stroke}" stroke-width="${sw}"/>
    `;
  } else if (type === 'switch') {
    g.innerHTML = `
      <line x1="0" y1="20" x2="20" y2="20" stroke="${stroke}" stroke-width="${sw}"/>
      <circle cx="24" cy="20" r="4" fill="${stroke}"/>
      <circle cx="56" cy="20" r="4" fill="${stroke}"/>
      <line x1="24" y1="20" x2="52" y2="5" stroke="${stroke}" stroke-width="3"/>
      <line x1="60" y1="20" x2="80" y2="20" stroke="${stroke}" stroke-width="${sw}"/>
    `;
  } else if (type === 'ammeter' || type === 'voltmeter') {
    const char = type === 'ammeter' ? 'A' : 'V';
    g.innerHTML = `
      <line x1="0" y1="20" x2="20" y2="20" stroke="${stroke}" stroke-width="${sw}"/>
      <circle cx="40" cy="20" r="20" fill="#ffffff" stroke="${stroke}" stroke-width="${sw}"/>
      <text x="40" y="27" font-size="18" font-weight="bold" text-anchor="middle" fill="${stroke}">${char}</text>
      <line x1="60" y1="20" x2="80" y2="20" stroke="${stroke}" stroke-width="${sw}"/>
    `;
  } else if (type === 'capacitor') {
    g.innerHTML = `
      <line x1="0" y1="20" x2="25" y2="20" stroke="${stroke}" stroke-width="${sw}"/>
      <line x1="25" y1="6" x2="25" y2="34" stroke="${stroke}" stroke-width="3"/>
      <line x1="35" y1="6" x2="35" y2="34" stroke="${stroke}" stroke-width="3"/>
      <line x1="35" y1="20" x2="60" y2="20" stroke="${stroke}" stroke-width="${sw}"/>
      <text x="26" y="46" font-size="12" font-weight="bold" fill="${stroke}">C</text>
    `;
  } else if (type === 'diode') {
    g.innerHTML = `
      <line x1="0" y1="20" x2="20" y2="20" stroke="${stroke}" stroke-width="${sw}"/>
      <polygon points="20,10 40,20 20,30" fill="${stroke}" stroke="${stroke}" stroke-width="${sw}"/>
      <line x1="40" y1="10" x2="40" y2="30" stroke="${stroke}" stroke-width="3"/>
      <line x1="40" y1="20" x2="60" y2="20" stroke="${stroke}" stroke-width="${sw}"/>
    `;
  } else if (type === 'ground') {
    g.innerHTML = `
      <line x1="20" y1="0" x2="20" y2="20" stroke="${stroke}" stroke-width="${sw}"/>
      <line x1="5" y1="20" x2="35" y2="20" stroke="${stroke}" stroke-width="3"/>
      <line x1="10" y1="26" x2="30" y2="26" stroke="${stroke}" stroke-width="2.5"/>
      <line x1="15" y1="32" x2="25" y2="32" stroke="${stroke}" stroke-width="2"/>
    `;
  }

  drawLayer.appendChild(g);
}

function insertSingleVector(label, dx, dy, color) {
  const drawLayer = document.getElementById('drawingLayer');
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', 'translate(200, 200)');

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', '0'); line.setAttribute('y1', '0');
  line.setAttribute('x2', dx.toString()); line.setAttribute('y2', dy.toString());
  line.setAttribute('stroke', color);
  line.setAttribute('stroke-width', '4');
  line.setAttribute('marker-end', 'url(#markerArrow)');

  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', (dx + 12).toString());
  text.setAttribute('y', (dy + 4).toString());
  text.setAttribute('font-size', '16');
  text.setAttribute('font-weight', 'bold');
  text.setAttribute('fill', color);
  text.textContent = label + ' →';

  g.appendChild(line);
  g.appendChild(text);
  drawLayer.appendChild(g);
}

function insertForceDiagram() {
  const drawLayer = document.getElementById('drawingLayer');
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', 'translate(200, 180)');

  g.innerHTML = `
    <!-- Тіло на похилій площині -->
    <polygon points="0,120 180,120 180,30" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
    <rect x="70" y="55" width="40" height="30" rx="3" transform="rotate(-26, 70, 55)" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2"/>
    <!-- Вектори сил -->
    <line x1="85" y1="70" x2="85" y2="130" stroke="#dc2626" stroke-width="3" marker-end="url(#markerArrow)"/>
    <text x="92" y="110" font-size="12" font-weight="bold" fill="#dc2626">mg</text>
    <line x1="85" y1="70" x2="65" y2="20" stroke="#16a34a" stroke-width="3" marker-end="url(#markerArrow)"/>
    <text x="50" y="24" font-size="12" font-weight="bold" fill="#16a34a">N</text>
  `;
  drawLayer.appendChild(g);
}

/**
 * UGREAD Whiteboard - History Module & Simulation Hub
 * Interactive Historical Timeline generator, artifacts, and simulation launcher
 */

import { state } from '../core/state.js';
import { openSimulation, BUILTIN_SIMULATIONS } from '../core/simulations.js';

export function renderHistoryPanel(container) {
  container.innerHTML = `
    <!-- Історична Стрічка Часу (Timeline) -->
    <div class="module-card">
      <div class="module-card-title">
        <span>⏳ Стрічка Часу (Timeline)</span>
      </div>
      <p style="font-size:12px; color:#64748b;">Додайте хронологічну шкалу основних епох історії України:</p>
      
      <div class="btn-group-grid">
        <button class="module-btn" id="btnTimelineUkraine">🇺🇦 Епохи України</button>
        <button class="module-btn" id="btnTimelineCustom">➕ Додати власну дату</button>
      </div>
    </div>

    <!-- Історичні символи та клейноди -->
    <div class="module-card">
      <div class="module-card-title">
        <span>🏛️ Історичні Символи</span>
      </div>
      <div class="btn-group-grid-3">
        <button class="module-btn" data-hist="tryzub">🔱 Тризуб</button>
        <button class="module-btn" data-hist="cossack_flag">🚩 Козацький стяг</button>
        <button class="module-btn" data-hist="bulava">👑 Булава</button>
      </div>
    </div>

    <!-- Каталог інтерактивних симуляцій -->
    <div class="module-card">
      <div class="module-card-title">
        <span>🕹️ Каталог Симуляцій</span>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        ${BUILTIN_SIMULATIONS.map(sim => `
          <button class="menu-action-btn" data-sim-id="${sim.id}">
            <strong>${sim.title}</strong>
            <div style="font-size:11px; color:#64748b;">${sim.description}</div>
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Підвантажити сторонній сайт чи симуляцію (URL) -->
    <div class="module-card">
      <div class="module-card-title">
        <span>🌐 Завантажити сторонній сайт / симуляцію</span>
      </div>
      <p style="font-size:12px; color:#64748b;">Введіть посилання на онлайн-симуляцію (PhET, GeoGebra, Wikipedia тощо):</p>
      <div style="display:flex; gap:6px;">
        <input type="url" id="customSimUrlInput" placeholder="https://..." style="flex:1; padding:6px 8px; font-size:13px; border:1px solid #cbd5e1; border-radius:6px;">
        <button id="btnLoadCustomUrl" class="module-btn btn-accent" style="background:#2563eb; color:white;">Відкрити</button>
      </div>
    </div>
  `;

  // Стрічка часу
  const tlBtn = container.querySelector('#btnTimelineUkraine');
  const customDateBtn = container.querySelector('#btnTimelineCustom');

  if (tlBtn) tlBtn.addEventListener('click', insertUkraineTimeline);
  if (customDateBtn) customDateBtn.addEventListener('click', promptAndInsertTimelineEvent);

  // Символи
  container.querySelectorAll('[data-hist]').forEach(btn => {
    btn.addEventListener('click', () => {
      insertHistorySymbol(btn.dataset.hist);
    });
  });

  // Симуляції
  container.querySelectorAll('[data-sim-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const simId = btn.dataset.simId;
      const sim = BUILTIN_SIMULATIONS.find(s => s.id === simId);
      if (sim) openSimulation(sim.id, sim.title);
    });
  });

  // Власний URL
  const loadUrlBtn = container.querySelector('#btnLoadCustomUrl');
  const urlInput = container.querySelector('#customSimUrlInput');
  if (loadUrlBtn && urlInput) {
    loadUrlBtn.addEventListener('click', () => {
      const url = urlInput.value.trim();
      if (url) {
        openSimulation(url, 'Веб-ресурс: ' + url, true);
      }
    });
  }
}

function insertUkraineTimeline() {
  const drawLayer = document.getElementById('drawingLayer');
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', 'translate(80, 150)');

  const epochs = [
    { year: 'IX-XIII ст.', name: 'Київська Русь', color: '#2563eb' },
    { year: '1199-1349', name: 'Галицько-Волинська', color: '#7c3aed' },
    { year: 'XVI-XVIII ст.', name: 'Козацька доба', color: '#dc2626' },
    { year: '1917-1921', name: 'УНР та ЗУНР', color: '#d97706' },
    { year: '1991', name: 'Відновлення Незалежності', color: '#16a34a' }
  ];

  let d = `
    <!-- Головна горизонтальна стрілка часу -->
    <line x1="0" y1="80" x2="720" y2="80" stroke="#1e293b" stroke-width="4" marker-end="url(#markerArrow)"/>
    <text x="735" y="85" font-size="14" font-weight="bold" fill="#1e293b">Час →</text>
  `;

  epochs.forEach((ep, idx) => {
    const x = 30 + idx * 140;
    const isTop = idx % 2 === 0;
    const yTick = isTop ? 40 : 120;
    const yText = isTop ? 25 : 145;

    d += `
      <circle cx="${x}" cy="80" r="7" fill="${ep.color}" stroke="#ffffff" stroke-width="2"/>
      <line x1="${x}" y1="80" x2="${x}" y2="${yTick}" stroke="${ep.color}" stroke-width="2" stroke-dasharray="3 3"/>
      <rect x="${x - 60}" y="${yText - 18}" width="120" height="38" rx="6" fill="#ffffff" stroke="${ep.color}" stroke-width="1.5"/>
      <text x="${x}" y="${yText - 4}" font-size="11" font-weight="bold" fill="${ep.color}" text-anchor="middle">${ep.year}</text>
      <text x="${x}" y="${yText + 12}" font-size="11" font-weight="600" fill="#1e293b" text-anchor="middle">${ep.name}</text>
    `;
  });

  g.innerHTML = d;
  drawLayer.appendChild(g);
}

function promptAndInsertTimelineEvent() {
  const year = prompt('Введіть рік або століття (наприклад 988 р.):', '988 р.');
  if (!year) return;
  const eventName = prompt('Введіть назву події:', 'Хрещення Русі');
  if (!eventName) return;

  const drawLayer = document.getElementById('drawingLayer');
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', 'translate(200, 200)');

  g.innerHTML = `
    <circle cx="20" cy="20" r="10" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
    <rect x="35" y="0" width="180" height="42" rx="6" fill="#ffffff" stroke="#2563eb" stroke-width="2"/>
    <text x="45" y="18" font-size="13" font-weight="bold" fill="#2563eb">${year}</text>
    <text x="45" y="34" font-size="12" fill="#0f172a">${eventName}</text>
  `;

  drawLayer.appendChild(g);
}

function insertHistorySymbol(type) {
  const drawLayer = document.getElementById('drawingLayer');
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', 'translate(200, 180)');

  if (type === 'tryzub') {
    g.innerHTML = `
      <polygon points="50,10 60,35 70,35 60,60 50,45 40,60 30,35 40,35" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
      <line x1="50" y1="10" x2="50" y2="85" stroke="#ca8a04" stroke-width="5" stroke-linecap="round"/>
      <path d="M 25 35 Q 20 70 50 85 Q 80 70 75 35" fill="none" stroke="#ca8a04" stroke-width="4"/>
      <text x="50" y="105" font-size="13" font-weight="bold" fill="#1e3a8a" text-anchor="middle">Знак Княжої Держави</text>
    `;
  } else if (type === 'cossack_flag') {
    g.innerHTML = `
      <line x1="10" y1="10" x2="10" y2="120" stroke="#78350f" stroke-width="4" stroke-linecap="round"/>
      <polygon points="10,15 90,30 10,60" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>
      <circle cx="45" cy="35" r="8" fill="#facc15"/>
    `;
  } else if (type === 'bulava') {
    g.innerHTML = `
      <circle cx="70" cy="30" r="22" fill="#ca8a04" stroke="#78350f" stroke-width="3"/>
      <line x1="55" y1="45" x2="15" y2="105" stroke="#78350f" stroke-width="6" stroke-linecap="round"/>
    `;
  }

  drawLayer.appendChild(g);
}

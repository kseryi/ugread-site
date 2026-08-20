/**
 * UGREAD Whiteboard - Geography & Maps Module
 * Vector interactive map of Ukraine (regions, capitals, info), world continents, contour maps, and 3D globe launcher
 */

import { state } from '../core/state.js';
import { openSimulation } from '../core/simulations.js';

export function renderGeographyPanel(container) {
  container.innerHTML = `
    <!-- Карти України -->
    <div class="module-card">
      <div class="module-card-title">
        <span>🇺🇦 Карта України</span>
      </div>
      <div class="btn-group-grid">
        <button class="module-btn" id="btnLoadUkraineAdminMap">🗺️ Політико-адміністративна</button>
        <button class="module-btn" id="btnLoadUkraineContourMap">📝 Контурна карта</button>
        <button class="module-btn" id="btnLoadUkraineRivers">🌊 Річки та водойми</button>
        <button class="module-btn" id="btnLoadUkraineRelief">⛰️ Фізичний рельєф</button>
      </div>
    </div>

    <!-- 3D Глобус та Світ -->
    <div class="module-card">
      <div class="module-card-title">
        <span>🌍 Моделі Землі & Світ</span>
      </div>
      <button class="module-btn btn-accent" id="btnOpen3DGlobe" style="width:100%; padding:10px; background:#0284c7; color:white;">
        🌐 Відкрити інтерактивний 3D Глобус
      </button>
      <button class="module-btn" id="btnLoadWorldContinents" style="width:100%; margin-top:6px;">
        🗺️ Карта континентів світу
      </button>
    </div>

    <!-- Географічні позначки та символи -->
    <div class="module-card">
      <div class="module-card-title">
        <span>📍 Географічні позначки</span>
      </div>
      <div class="btn-group-grid">
        <button class="module-btn" data-marker="compass">🧭 Роза вітрів (Компас)</button>
        <button class="module-btn" data-marker="city_pin">📍 Пін столиці / міста</button>
        <button class="module-btn" data-marker="mountain">▲ Гора / Вершина</button>
        <button class="module-btn" data-marker="minerals">⛏️ Корисні копалини</button>
      </div>
    </div>

    <!-- Власна карта -->
    <div class="module-card">
      <div class="module-card-title">
        <span>📁 Власна карта</span>
      </div>
      <label class="module-btn" style="width:100%; cursor:pointer;">
        Завантажити зображення карти (JPG/PNG/SVG)
        <input type="file" id="customMapUpload" accept="image/*" style="display:none;" />
      </label>
    </div>
  `;

  // Карти України
  const adminBtn = container.querySelector('#btnLoadUkraineAdminMap');
  const contourBtn = container.querySelector('#btnLoadUkraineContourMap');
  const globeBtn = container.querySelector('#btnOpen3DGlobe');
  const worldBtn = container.querySelector('#btnLoadWorldContinents');

  if (adminBtn) adminBtn.addEventListener('click', () => renderUkraineMapOnBoard(false));
  if (contourBtn) contourBtn.addEventListener('click', () => renderUkraineMapOnBoard(true));
  if (globeBtn) globeBtn.addEventListener('click', () => openSimulation('globe', 'Інтерактивний 3D Глобус Землі'));
  if (worldBtn) worldBtn.addEventListener('click', renderWorldContinentsOnBoard);

  // Маркери
  container.querySelectorAll('[data-marker]').forEach(btn => {
    btn.addEventListener('click', () => {
      insertGeoMarker(btn.dataset.marker);
    });
  });

  const mapUpload = container.querySelector('#customMapUpload');
  if (mapUpload) {
    mapUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        import('../core/board.js').then(m => m.insertImage(event.target.result, 100, 80, 700));
      };
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Векторна інтерактивна карта України
 */
function renderUkraineMapOnBoard(isContour = false) {
  const bgLayer = document.getElementById('backgroundLayer');
  bgLayer.innerHTML = '';

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', 'translate(80, 60)');

  // Дані областей України (спрощені полігони для швидкого офлайн-рендеру)
  const regions = [
    { name: 'Київська область', center: 'Київ', fill: '#dbeafe', d: 'M 320,110 L 370,120 L 380,180 L 330,190 L 300,150 Z' },
    { name: 'Львівська область', center: 'Львів', fill: '#fef08a', d: 'M 100,120 L 160,110 L 150,180 L 90,170 Z' },
    { name: 'Одеська область', center: 'Одеса', fill: '#fed7aa', d: 'M 280,260 L 350,260 L 340,350 L 260,330 Z' },
    { name: 'Харківська область', center: 'Харків', fill: '#bbf7d0', d: 'M 500,120 L 570,130 L 560,200 L 490,190 Z' },
    { name: 'Дніпропетровська область', center: 'Дніпро', fill: '#e9d5ff', d: 'M 430,200 L 510,210 L 500,280 L 420,260 Z' },
    { name: 'АР Крим', center: 'Сімферополь', fill: '#fbcfe8', d: 'M 420,350 L 500,340 L 480,410 L 410,390 Z' },
    { name: 'Донецька область', center: 'Донецьк', fill: '#fecdd3', d: 'M 570,210 L 630,220 L 610,300 L 550,280 Z' },
    { name: 'Луганська область', center: 'Луганськ', fill: '#fef9c3', d: 'M 620,150 L 680,160 L 660,230 L 600,210 Z' },
    { name: 'Закарпатська область', center: 'Ужгород', fill: '#cffafe', d: 'M 60,180 L 110,180 L 90,230 L 40,220 Z' },
    { name: 'Івано-Франківська область', center: 'Івано-Франківськ', fill: '#fae8ff', d: 'M 110,180 L 160,180 L 140,240 L 90,230 Z' }
  ];

  // Рамка та заголовок
  const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  title.setAttribute('x', '20'); title.setAttribute('y', '30');
  title.setAttribute('font-size', '22'); title.setAttribute('font-weight', 'bold');
  title.setAttribute('fill', '#1e40af');
  title.textContent = isContour ? '🇺🇦 Контурна карта України' : '🇺🇦 Політико-адміністративна карта України';
  g.appendChild(title);

  // Контур України (спільна межа)
  const baseBorder = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  baseBorder.setAttribute('d', 'M 80,100 L 220,70 L 380,80 L 550,90 L 680,140 L 640,320 L 510,330 L 480,420 L 390,360 L 340,360 L 260,340 L 220,270 L 130,260 L 40,220 L 70,140 Z');
  baseBorder.setAttribute('fill', isContour ? '#ffffff' : '#f8fafc');
  baseBorder.setAttribute('stroke', '#1e3a8a');
  baseBorder.setAttribute('stroke-width', '3');
  g.appendChild(baseBorder);

  // Області
  regions.forEach(reg => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', reg.d);
    path.setAttribute('fill', isContour ? '#ffffff' : reg.fill);
    path.setAttribute('stroke', '#64748b');
    path.setAttribute('stroke-width', '1.5');
    path.style.cursor = 'pointer';
    path.style.transition = 'all 0.15s ease';

    path.addEventListener('pointerenter', () => {
      path.setAttribute('stroke', '#2563eb');
      path.setAttribute('stroke-width', '3');
    });
    path.addEventListener('pointerleave', () => {
      path.setAttribute('stroke', '#64748b');
      path.setAttribute('stroke-width', '1.5');
    });

    path.addEventListener('click', () => {
      showRegionModal(reg.name, reg.center);
    });

    g.appendChild(path);
  });

  // Головні річки (Дніпро, Дністер)
  const dnipro = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  dnipro.setAttribute('d', 'M 360,85 Q 340,160 380,210 Q 420,240 440,280 L 340,350');
  dnipro.setAttribute('fill', 'none');
  dnipro.setAttribute('stroke', '#0284c7');
  dnipro.setAttribute('stroke-width', '4');
  g.appendChild(dnipro);

  // Столиця Київ
  const capital = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  capital.setAttribute('cx', '350'); capital.setAttribute('cy', '140');
  capital.setAttribute('r', '7'); capital.setAttribute('fill', '#dc2626');
  capital.setAttribute('stroke', '#ffffff'); capital.setAttribute('stroke-width', '2');
  g.appendChild(capital);

  const capTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  capTxt.setAttribute('x', '362'); capTxt.setAttribute('y', '145');
  capTxt.setAttribute('font-size', '14'); capTxt.setAttribute('font-weight', 'bold');
  capTxt.setAttribute('fill', '#1e293b');
  capTxt.textContent = 'Київ ★';
  g.appendChild(capTxt);

  bgLayer.appendChild(g);
}

function renderWorldContinentsOnBoard() {
  const bgLayer = document.getElementById('backgroundLayer');
  bgLayer.innerHTML = '';

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', 'translate(60, 60)');

  g.innerHTML = `
    <text x="20" y="30" font-size="22" font-weight="bold" fill="#0369a1">🌍 Карта континентів світу</text>
    <rect x="0" y="50" width="760" height="420" rx="12" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>
    
    <!-- Євразія -->
    <path d="M 380,90 Q 520,70 660,110 L 680,200 L 520,240 L 380,180 Z" fill="#bbf7d0" stroke="#16a34a" stroke-width="2"/>
    <text x="520" y="150" font-size="16" font-weight="bold" fill="#15803d">Євразія</text>

    <!-- Африка -->
    <path d="M 370,190 L 460,200 L 440,320 L 380,330 L 350,230 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
    <text x="390" y="260" font-size="16" font-weight="bold" fill="#854d0e">Африка</text>

    <!-- Північна Америка -->
    <path d="M 80,80 L 240,90 L 220,190 L 140,210 L 60,140 Z" fill="#fed7aa" stroke="#ea580c" stroke-width="2"/>
    <text x="110" y="140" font-size="15" font-weight="bold" fill="#9a3412">Пн. Америка</text>

    <!-- Південна Америка -->
    <path d="M 170,230 L 260,250 L 230,370 L 170,350 Z" fill="#fbcfe8" stroke="#db2777" stroke-width="2"/>
    <text x="180" y="300" font-size="15" font-weight="bold" fill="#9d174d">Пд. Америка</text>

    <!-- Австралія -->
    <path d="M 580,280 L 680,290 L 660,360 L 570,350 Z" fill="#ddd6fe" stroke="#7c3aed" stroke-width="2"/>
    <text x="600" y="325" font-size="14" font-weight="bold" fill="#5b21b6">Австралія</text>

    <!-- Антарктида -->
    <rect x="150" y="420" width="500" height="35" rx="8" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5"/>
    <text x="360" y="442" font-size="14" font-weight="bold" fill="#475569">Антарктида</text>
  `;

  bgLayer.appendChild(g);
}

function insertGeoMarker(type) {
  const drawLayer = document.getElementById('drawingLayer');
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(200, 180)`);

  if (type === 'compass') {
    g.innerHTML = `
      <circle cx="40" cy="40" r="36" fill="rgba(255,255,255,0.9)" stroke="#1e293b" stroke-width="2"/>
      <polygon points="40,10 46,38 40,34 34,38" fill="#dc2626"/>
      <polygon points="40,70 46,42 40,46 34,42" fill="#1e293b"/>
      <polygon points="10,40 38,46 34,40 38,34" fill="#64748b"/>
      <polygon points="70,40 42,46 46,40 42,34" fill="#64748b"/>
      <text x="40" y="8" font-size="11" font-weight="bold" text-anchor="middle" fill="#dc2626">Пн (N)</text>
      <text x="40" y="82" font-size="10" font-weight="bold" text-anchor="middle" fill="#1e293b">Пд (S)</text>
      <text x="74" y="43" font-size="10" font-weight="bold" fill="#1e293b">Сх</text>
      <text x="0" y="43" font-size="10" font-weight="bold" fill="#1e293b">Зх</text>
    `;
  } else if (type === 'city_pin') {
    g.innerHTML = `
      <path d="M 20 0 C 9 0 0 9 0 20 C 0 35 20 50 20 50 C 20 50 40 35 40 20 C 40 9 31 0 20 0 Z" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>
      <circle cx="20" cy="18" r="7" fill="#ffffff"/>
    `;
  } else if (type === 'mountain') {
    g.innerHTML = `
      <polygon points="0,50 30,10 60,50" fill="#78716c" stroke="#44403c" stroke-width="2"/>
      <polygon points="30,10 20,24 28,20 34,25 40,24" fill="#ffffff"/>
      <text x="30" y="64" font-size="12" font-weight="bold" fill="#44403c" text-anchor="middle">Гора (▲)</text>
    `;
  } else if (type === 'minerals') {
    g.innerHTML = `
      <rect x="0" y="0" width="30" height="30" fill="#0f172a" stroke="#334155" stroke-width="2"/>
      <polygon points="5,25 15,5 25,25" fill="#facc15"/>
    `;
  }

  drawLayer.appendChild(g);
}

function showRegionModal(name, center) {
  const backdrop = document.getElementById('appModalBackdrop');
  const title = document.getElementById('modalTitle');
  const body = document.getElementById('modalBody');

  title.textContent = `📍 ${name}`;
  body.innerHTML = `
    <div style="font-size:15px; line-height:1.6;">
      <p><strong>Адміністративний центр:</strong> місто ${center}</p>
      <p><strong>Держава:</strong> Україна 🇺🇦</p>
      <p style="margin-top:12px; color:#475569;">Ви можете малювати та наносити географічні мітки поверх цієї області на інтерактивній дошці.</p>
    </div>
  `;
  backdrop.style.display = 'flex';
}

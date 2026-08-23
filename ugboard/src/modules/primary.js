/**
 * UGREAD Whiteboard - Primary School & Calligraphy Module (Початкова школа)
 * - Написання рукописних літер (каліграфія за стандартом МОН України)
 * - Звуковий аналіз слів (звукові моделі: голосні, тверді/м'які приголосні)
 * - Інтерактивна рахівниця (Абак) та лічильні палички
 * - Складові таблиці
 */

import { state, setRuling } from '../core/state.js';
import { insertTextBox } from '../core/board.js';
import { renderSimulationCatalog } from '../core/simulationCatalog.js';

export function renderPrimarySchoolPanel(container) {
  container.innerHTML = `
    <!-- ===================================================================== -->
    <!-- 📦 [БЛОК 1] Каліграфічні зразки літер (Абетка МОН та коса лінія)       -->
    <!-- ===================================================================== -->
    <div class="module-card">
      <div class="module-card-title">
        <span>✍️ Каліграфія (Абетка МОН)</span>
        <button id="btnApplySlantedGrid" class="btn-icon-sm btn-accent" title="Увімкнути зошит у косу лінію">📝</button>
      </div>
      <p style="font-size:12px; color:#64748b;">Оберіть літеру для додавання рукописного зразка у зошит:</p>
      
      <div class="calligraphy-char-grid" id="calligraphyGrid">
        ${'Аа,Бб,Вв,Гг,Ґґ,Дд,Ее,Єє,Жж,Зз,Ии,Іі,Її,Йй,Кк,Лл,Мм,Нн,Оо,Пп,Рр,Сс,Тт,Уу,Фф,Хх,Цц,Чч,Шш,Щщ,Ьь,Юю,Яя'
          .split(',')
          .map(pair => `<button class="calligraphy-btn" data-letter="${pair}">${pair}</button>`)
          .join('')}
      </div>
    </div>
    <!-- ====== [КІНЕЦЬ БЛОКУ 1: Каліграфія] ====== -->

    <!-- ===================================================================== -->
    <!-- 📦 [БЛОК 2] Звуковий аналіз слів (Голосний, твердий, м'який приголосний)-->
    <!-- ===================================================================== -->
    <div class="module-card">
      <div class="module-card-title">
        <span>🔊 Звуковий аналіз слів</span>
      </div>
      <p style="font-size:12px; color:#64748b;">Натисніть фішку, щоб додати звукову схему на дошку:</p>
      
      <div class="sound-chips">
        <button class="sound-chip" data-sound="vowel" title="Голосний звук">
          <span style="font-size:20px;">[ ○ ]</span>
        </button>
        <button class="sound-chip" data-sound="consonant_hard" title="Твердий приголосний">
          <span style="font-size:20px;">[ ━ ]</span>
        </button>
        <button class="sound-chip" data-sound="consonant_soft" title="М'який приголосний">
          <span style="font-size:20px;">[ ═ ]</span>
        </button>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:11px; color:#64748b; margin-top:4px;">
        <span style="color:#dc2626; font-weight:bold;">Голосний</span>
        <span style="color:#2563eb; font-weight:bold;">Твердий</span>
        <span style="color:#16a34a; font-weight:bold;">М'який</span>
      </div>
    </div>
    <!-- ====== [КІНЕЦЬ БЛОКУ 2: Звуковий аналіз] ====== -->

    <!-- ===================================================================== -->
    <!-- 📦 [БЛОК 3] Інтерактивна шкільна рахівниця (Абак)                      -->
    <!-- ===================================================================== -->
    <div class="module-card">
      <div class="module-card-title">
        <span>🧮 Шкільна рахівниця (Абак)</span>
      </div>
      <div style="background:#f1f5f9; padding:10px; border-radius:8px;">
        <div id="abacusHost" style="display:flex; flex-direction:column; gap:8px;">
          <!-- 3 ряди намистин для десятків і одиниць -->
          ${[10, 10, 10].map((count, rIdx) => `
            <div class="abacus-row" style="display:flex; align-items:center; background:#cbd5e1; height:18px; border-radius:9px; position:relative; padding:0 4px;">
              <div style="position:absolute; left:0; width:100%; height:3px; background:#475569; z-index:1;"></div>
              <div class="abacus-beads-left" style="display:flex; gap:2px; z-index:2; margin-right:auto;">
                ${Array(5).fill(0).map(() => `<span class="abacus-bead" style="width:14px; height:14px; border-radius:50%; background:${rIdx===0?'#ef4444':rIdx===1?'#3b82f6':'#10b981'}; box-shadow:0 1px 3px rgba(0,0,0,0.3); cursor:pointer; display:inline-block;"></span>`).join('')}
              </div>
              <div class="abacus-beads-right" style="display:flex; gap:2px; z-index:2; margin-left:auto;">
                ${Array(5).fill(0).map(() => `<span class="abacus-bead" style="width:14px; height:14px; border-radius:50%; background:${rIdx===0?'#ef4444':rIdx===1?'#3b82f6':'#10b981'}; box-shadow:0 1px 3px rgba(0,0,0,0.3); cursor:pointer; display:inline-block;"></span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        <button id="btnAddAbacusToBoard" class="module-btn" style="width:100%; margin-top:8px;">➕ Додати рахівницю на дошку</button>
      </div>
    </div>
    <!-- ====== [КІНЕЦЬ БЛОКУ 3: Рахівниця] ====== -->

    <!-- ===================================================================== -->
    <!-- 📦 [БЛОК 4] Лічильні палички та математичні знаки                      -->
    <!-- ===================================================================== -->
    <div class="module-card">
      <div class="module-card-title">
        <span>🥢 Лічильні палички</span>
      </div>
      <div class="btn-group-grid">
        <button class="module-btn" id="addStick1">🥢 1 паличка</button>
        <button class="module-btn" id="addStick5">🥢🥢 5 паличок</button>
        <button class="module-btn" id="addStick10">📦 Десяток (10)</button>
        <button class="module-btn" id="addMathSigns">➕ ➖ ✖ ➗ 🟰</button>
      </div>
    </div>
    <!-- ====== [КІНЕЦЬ БЛОКУ 4: Лічильні палички] ====== -->

    <!-- ===================================================================== -->
    <!-- 📦 [БЛОК 5] Каталог інтерактивних симуляцій для початкової школи       -->
    <!-- ===================================================================== -->
    <div id="primarySimCatalogContainer"></div>
    <!-- ====== [КІНЕЦЬ БЛОКУ 5: Симуляції початкової школи] ====== -->
  `;

  // ==========================================================================
  // ⚙️ ОБРОБНИКИ ПОДІЙ (EVENT LISTENERS)
  // ==========================================================================

  // --------------------------------------------------------------------------
  // [БЛОК 5 - Логіка] Ініціалізація каталогу симуляцій для початкової школи
  // --------------------------------------------------------------------------
  const simWrap = container.querySelector('#primarySimCatalogContainer');
  if (simWrap) {
    renderSimulationCatalog(simWrap, 'primary');
  }

  // --------------------------------------------------------------------------
  // [БЛОК 1 - Логіка] Обробники подій каліграфії та сітки в косу лінію
  // --------------------------------------------------------------------------
  container.querySelectorAll('.calligraphy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const letter = btn.dataset.letter;
      insertCalligraphySample(letter);
    });
  });

  const btnSlanted = container.querySelector('#btnApplySlantedGrid');
  if (btnSlanted) {
    btnSlanted.addEventListener('click', () => {
      setRuling('slanted_primary');
      const sel = document.getElementById('rulingSelect');
      if (sel) sel.value = 'slanted_primary';
    });
  }

  // --------------------------------------------------------------------------
  // [БЛОК 2 - Логіка] Обробники звукових схем
  // --------------------------------------------------------------------------
  container.querySelectorAll('.sound-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.sound;
      insertSoundScheme(type);
    });
  });

  // --------------------------------------------------------------------------
  // [БЛОК 4 - Логіка] Лічильні палички та знаки
  // --------------------------------------------------------------------------
  const add1 = container.querySelector('#addStick1');
  const add5 = container.querySelector('#addStick5');
  const add10 = container.querySelector('#addStick10');
  const addSigns = container.querySelector('#addMathSigns');

  if (add1) add1.addEventListener('click', () => insertSticks(1));
  if (add5) add5.addEventListener('click', () => insertSticks(5));
  if (add10) add10.addEventListener('click', () => insertSticks(10));
  if (addSigns) addSigns.addEventListener('click', insertMathSigns);
}

// ============================================================================
// 🛠️ ДОПОМІЖНІ ФУНКЦІЇ ДЛЯ ПОЧАТКОВОЇ ШКОЛИ
// ============================================================================

/**
 * [БЛОК 1 - Функція] Вставка рукописного зразка літери МОН на дошку
 */
function insertCalligraphySample(letterPair) {
  const drawLayer = document.getElementById('drawingLayer');
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(150, 150)`);

  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', '0');
  text.setAttribute('y', '0');
  text.setAttribute('font-family', 'Georgia, "Times New Roman", cursive');
  text.setAttribute('font-size', '64');
  text.setAttribute('font-style', 'italic');
  text.setAttribute('fill', state.strokeColor || '#1e3a8a');
  text.setAttribute('font-weight', '500');
  text.textContent = letterPair;

  g.appendChild(text);
  drawLayer.appendChild(g);
}

/**
 * [БЛОК 2 - Функція] Вставка фішки звукового аналізу слів
 */
function insertSoundScheme(type) {
  const drawLayer = document.getElementById('drawingLayer');
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${200 + Math.random() * 80}, ${200 + Math.random() * 80})`);

  // Рамка звукової фішки
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', '0');
  rect.setAttribute('y', '0');
  rect.setAttribute('width', '50');
  rect.setAttribute('height', '50');
  rect.setAttribute('rx', '8');
  rect.setAttribute('fill', '#ffffff');
  rect.setAttribute('stroke', '#cbd5e1');
  rect.setAttribute('stroke-width', '2');
  g.appendChild(rect);

  if (type === 'vowel') {
    // Голосний [○]
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '25');
    circle.setAttribute('cy', '25');
    circle.setAttribute('r', '14');
    circle.setAttribute('fill', '#fee2e2');
    circle.setAttribute('stroke', '#dc2626');
    circle.setAttribute('stroke-width', '3');
    g.appendChild(circle);
  } else if (type === 'consonant_hard') {
    // Твердий приголосний [━]
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', '12');
    line.setAttribute('y1', '25');
    line.setAttribute('x2', '38');
    line.setAttribute('y2', '25');
    line.setAttribute('stroke', '#2563eb');
    line.setAttribute('stroke-width', '5');
    line.setAttribute('stroke-linecap', 'round');
    g.appendChild(line);
  } else if (type === 'consonant_soft') {
    // М'який приголосний [═]
    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('x1', '12'); line1.setAttribute('y1', '19');
    line1.setAttribute('x2', '38'); line1.setAttribute('y2', '19');
    line1.setAttribute('stroke', '#16a34a');
    line1.setAttribute('stroke-width', '4');
    line1.setAttribute('stroke-linecap', 'round');

    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('x1', '12'); line2.setAttribute('y1', '31');
    line2.setAttribute('x2', '38'); line2.setAttribute('y2', '31');
    line2.setAttribute('stroke', '#16a34a');
    line2.setAttribute('stroke-width', '4');
    line2.setAttribute('stroke-linecap', 'round');

    g.appendChild(line1);
    g.appendChild(line2);
  }

  drawLayer.appendChild(g);
}

/**
 * [БЛОК 4 - Функція] Вставка лічильних паличок на дошку
 */
function insertSticks(count) {
  const drawLayer = document.getElementById('drawingLayer');
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(180, 200)`);

  const colors = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#9333ea'];
  for (let i = 0; i < count; i++) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', (i * 18).toString());
    rect.setAttribute('y', '0');
    rect.setAttribute('width', '6');
    rect.setAttribute('height', '60');
    rect.setAttribute('rx', '3');
    rect.setAttribute('fill', colors[i % colors.length]);
    rect.setAttribute('stroke', '#1e293b');
    rect.setAttribute('stroke-width', '1');
    g.appendChild(rect);
  }
  drawLayer.appendChild(g);
}

/**
 * [БЛОК 4 - Функція] Вставка математичних знаків для початкової школи
 */
function insertMathSigns() {
  const drawLayer = document.getElementById('drawingLayer');
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(160, 220)`);

  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('font-size', '36');
  text.setAttribute('font-weight', 'bold');
  text.setAttribute('fill', '#1e293b');
  text.textContent = '+  −  ×  ÷  =  <  >';
  g.appendChild(text);
  drawLayer.appendChild(g);
}

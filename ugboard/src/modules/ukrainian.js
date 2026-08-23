/**
 * UGREAD Whiteboard - Ukrainian Language & Literature Module
 * - Синтаксичний розбір речень (Підмет ―, Присудок ═, Означення 〰, Додаток - - -, Обставина _._._, Сполучник ○)
 * - Морфемний розбір слів (Префікс ¬, Корінь ⌒, Суфікс ∧, Закінчення ▢, Основа)
 * - Конструктор навчальних речень та вправ
 * - PDF читач / підручник з посторінковим шаром малюнків
 */

import { state, setTool, setShapeType, setStrokeColor, setStrokeWidth } from '../core/state.js';
import { registerUndoAction } from '../core/multitouch.js';
import { renderSimulationCatalog } from '../core/simulationCatalog.js';
import { handlePdfOrImageFile } from '../core/pdfLoader.js';

let activeSyntaxTool = null;

export function renderUkrainianPanel(container) {
  container.innerHTML = `
    <!-- ===================================================================== -->
    <!-- 📦 [БЛОК 1] Синтаксичний розбір речення (Підмет, присудок, означення)  -->
    <!-- ===================================================================== -->
    <div class="module-card">
      <div class="module-card-title">
        <span>📝 Синтаксичний розбір речення</span>
      </div>
      <p style="font-size:12px; color:#64748b; margin-bottom:8px;">
        Оберіть інструмент та протягніть під словом на дошці:
      </p>

      <div class="btn-group-grid" style="grid-template-columns: repeat(2, 1fr); gap:8px;">
        <!-- Підмет -->
        <button class="module-btn syntax-btn" data-syntax="subject" title="Підмет (одна суцільна лінія)">
          <svg viewBox="0 0 100 24" width="70" height="18">
            <line x1="5" y1="12" x2="95" y2="12" stroke="#2563eb" stroke-width="3.5" stroke-linecap="round"/>
          </svg>
          <span style="font-weight:700; color:#1e40af;">Підмет (―)</span>
        </button>

        <!-- Присудок -->
        <button class="module-btn syntax-btn" data-syntax="predicate" title="Присудок (дві паралельні лінії)">
          <svg viewBox="0 0 100 24" width="70" height="18">
            <line x1="5" y1="8" x2="95" y2="8" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="5" y1="16" x2="95" y2="16" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <span style="font-weight:700; color:#b91c1c;">Присудок (═)</span>
        </button>

        <!-- Означення -->
        <button class="module-btn syntax-btn" data-syntax="attribute" title="Означення (хвиляста синусоїда)">
          <svg viewBox="0 0 100 24" width="70" height="18">
            <path d="M 5 12 Q 16.25 4 27.5 12 T 50 12 T 72.5 12 T 95 12" fill="none" stroke="#16a34a" stroke-width="2.8" stroke-linecap="round"/>
          </svg>
          <span style="font-weight:700; color:#15803d;">Означення (〰)</span>
        </button>

        <!-- Додаток -->
        <button class="module-btn syntax-btn" data-syntax="object" title="Додаток (пунктирна лінія)">
          <svg viewBox="0 0 100 24" width="70" height="18">
            <line x1="5" y1="12" x2="95" y2="12" stroke="#0f172a" stroke-width="3" stroke-dasharray="8 5" stroke-linecap="round"/>
          </svg>
          <span style="font-weight:700; color:#334155;">Додаток (- - -)</span>
        </button>

        <!-- Обставина -->
        <button class="module-btn syntax-btn" data-syntax="adverbial" title="Обставина (пунктир з крапкою)">
          <svg viewBox="0 0 100 24" width="70" height="18">
            <line x1="5" y1="12" x2="95" y2="12" stroke="#d97706" stroke-width="3" stroke-dasharray="10 4 3 4" stroke-linecap="round"/>
          </svg>
          <span style="font-weight:700; color:#b45309;">Обставина (_._.)</span>
        </button>

        <!-- Сполучник -->
        <button class="module-btn syntax-btn" data-syntax="conjunction" title="Сполучник (обведення в коло)">
          <svg viewBox="0 0 100 24" width="70" height="18">
            <ellipse cx="50" cy="12" rx="16" ry="8" fill="none" stroke="#7c3aed" stroke-width="2.5"/>
          </svg>
          <span style="font-weight:700; color:#6d28d9;">Сполучник (○)</span>
        </button>
      </div>

      <div id="syntaxStatusHint" style="display:none; margin-top:8px; padding:6px 10px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; font-size:11px; color:#1e40af;">
        ✏️ <b>Обрано:</b> <span id="syntaxStatusLabel"></span>. Протягніть мишею або пальцем під потрібним словом.
      </div>
    </div>
    <!-- ====== [КІНЕЦЬ БЛОКУ 1: Синтаксичний розбір] ====== -->

    <!-- ===================================================================== -->
    <!-- 📦 [БЛОК 2] Робота з підручником / PDF вправою (Зразок картки)         -->
    <!-- ===================================================================== -->
    <div class="module-card">
      <div class="module-card-title">
        <span>📄 Підручник / Картка вправи</span>
      </div>
      <p style="font-size:12px; color:#64748b; margin-bottom:8px;">Завантажте сторінку підручника або відкрийте готову картку:</p>

      <button id="btnLoadSampleExercise" class="module-btn" style="width:100%; margin-bottom:6px; justify-content:center; background:#f8fafc; border:1px solid #cbd5e1;">
        ✨ Відкрити картку з вправами (Зразок)
      </button>

      <label class="module-btn" style="width:100%; cursor:pointer; justify-content:center;">
        📂 Завантажити сторінку (PDF / Фото)
        <input type="file" id="pdfExerciseUpload" accept="application/pdf,image/*" style="display:none;" />
      </label>
    </div>
    <!-- ====== [КІНЕЦЬ БЛОКУ 2: Підручник / PDF] ====== -->

    <!-- ===================================================================== -->
    <!-- 📦 [БЛОК 3] Конструктор та вставка речень для розбору (Власні та готові) -->
    <!-- ===================================================================== -->
    <div class="module-card">
      <div class="module-card-title">
        <span>📖 Додати речення для розбору</span>
      </div>
      
      <div style="display:flex; flex-direction:column; gap:6px;">
        <textarea id="customSentenceInput" rows="2" placeholder="Введіть речення для аналізу на дошці..." style="width:100%; font-family:Georgia, serif; font-size:13px; padding:6px 8px; border:1px solid #cbd5e1; border-radius:6px; resize:vertical;"></textarea>
        <button id="btnInsertCustomSentence" class="module-btn" style="background:#2563eb; color:white; font-weight:600; justify-content:center;">
          ➕ Додати власне речення
        </button>
      </div>

      <div style="margin-top:10px;">
        <span style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase;">Зразки навчальних речень:</span>
        <div style="display:flex; flex-direction:column; gap:4px; margin-top:4px;">
          <button class="menu-action-btn quick-sentence-btn" data-text="Золота осінь щедро прикрасила рідний ліс.">
            🍂 Золота осінь щедро прикрасила рідний ліс.
          </button>
          <button class="menu-action-btn quick-sentence-btn" data-text="Соловейко весело щебече у квітучому саду.">
            🐦 Соловейко весело щебече у квітучому саду.
          </button>
          <button class="menu-action-btn quick-sentence-btn" data-text="Могутній Дніпро несе свої чисті води до моря.">
            🌊 Могутній Дніпро несе свої чисті води до моря.
          </button>
          <button class="menu-action-btn quick-sentence-btn" data-text="Учні старанно пишуть диктант у зошитах.">
            ✍️ Учні старанно пишуть диктант у зошитах.
          </button>
        </div>
      </div>
    </div>
    <!-- ====== [КІНЕЦЬ БЛОКУ 3: Конструктор речень] ====== -->

    <!-- ===================================================================== -->
    <!-- 📦 [БЛОК 4] Каталог інтерактивних симуляцій та тренажерів з мови       -->
    <!-- ===================================================================== -->
    <div id="ukrSimCatalogContainer"></div>
    <!-- ====== [КІНЕЦЬ БЛОКУ 4: Симуляції мови] ====== -->
  `;

  // ==========================================================================
  // ⚙️ ОБРОБНИКИ ПОДІЙ (EVENT LISTENERS)
  // ==========================================================================

  // --------------------------------------------------------------------------
  // [БЛОК 4 - Логіка] Ініціалізація каталогу мовних симуляцій
  // --------------------------------------------------------------------------
  const simWrap = container.querySelector('#ukrSimCatalogContainer');
  if (simWrap) {
    renderSimulationCatalog(simWrap, 'ukrainian');
  }

  // --------------------------------------------------------------------------
  // [БЛОК 1 - Логіка] Зв'язування кнопок синтаксичних підкреслень
  // --------------------------------------------------------------------------
  container.querySelectorAll('.syntax-btn[data-syntax]').forEach(btn => {
    btn.addEventListener('click', () => {
      const syntaxType = btn.dataset.syntax;
      container.querySelectorAll('.syntax-btn').forEach(b => b.classList.remove('active'));
      
      const statusBox = container.querySelector('#syntaxStatusHint');
      const statusLabel = container.querySelector('#syntaxStatusLabel');

      if (activeSyntaxTool === syntaxType) {
        activeSyntaxTool = null;
        if (statusBox) statusBox.style.display = 'none';
        setTool('pencil');
      } else {
        activeSyntaxTool = syntaxType;
        btn.classList.add('active');
        activateSyntaxUnderlineMode(syntaxType);

        if (statusBox && statusLabel) {
          const names = {
            subject: 'Підмет (―)',
            predicate: 'Присудок (═)',
            attribute: 'Означення (〰)',
            object: 'Додаток (- - -)',
            adverbial: 'Обставина (_._.)',
            conjunction: 'Сполучник (○)'
          };
          statusLabel.textContent = names[syntaxType] || syntaxType;
          statusBox.style.display = 'block';
        }
      }
    });
  });

  // --------------------------------------------------------------------------
  // [БЛОК 3 - Логіка] Вставка власного або готового речення
  // --------------------------------------------------------------------------
  const btnCustomSentence = container.querySelector('#btnInsertCustomSentence');
  const inputCustom = container.querySelector('#customSentenceInput');
  if (btnCustomSentence && inputCustom) {
    btnCustomSentence.addEventListener('click', () => {
      const text = inputCustom.value.trim();
      if (text) {
        insertSentenceToBoard(text);
        inputCustom.value = '';
      }
    });
  }

  // Швидкі готові речення
  container.querySelectorAll('.quick-sentence-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.text;
      if (text) insertSentenceToBoard(text);
    });
  });

  // --------------------------------------------------------------------------
  // [БЛОК 2 - Логіка] Відкрити картку з вправою або завантажити PDF
  // --------------------------------------------------------------------------
  const btnSampleExercise = container.querySelector('#btnLoadSampleExercise');
  if (btnSampleExercise) {
    btnSampleExercise.addEventListener('click', loadSampleExercisePage);
  }

  const fileInput = container.querySelector('#pdfExerciseUpload');
  if (fileInput) {
    fileInput.addEventListener('change', handlePdfOrImageUpload);
  }
}

// ============================================================================
// 🛠️ ДОПОМІЖНІ ФУНКЦІЇ ДЛЯ СИНТАКСИЧНОГО РОЗБОРУ ТА НАВЧАЛЬНИХ КАРТОК
// ============================================================================

/**
 * [БЛОК 1 - Функція] Активація конкретного типу підкреслення члена речення
 */
function activateSyntaxUnderlineMode(syntaxType) {
  state.tool = 'shape';
  state.shapeType = 'syntax_' + syntaxType;

  // Оновлюємо стилі
  if (syntaxType === 'subject') {
    state.strokeColor = '#2563eb';
    state.strokeWidth = 3.5;
    state.strokeStyle = 'solid';
  } else if (syntaxType === 'predicate') {
    state.strokeColor = '#dc2626';
    state.strokeWidth = 2.5;
    state.strokeStyle = 'solid';
  } else if (syntaxType === 'attribute') {
    state.strokeColor = '#16a34a';
    state.strokeWidth = 3;
    state.strokeStyle = 'solid';
  } else if (syntaxType === 'object') {
    state.strokeColor = '#0f172a';
    state.strokeWidth = 3;
    state.strokeStyle = 'dashed';
  } else if (syntaxType === 'adverbial') {
    state.strokeColor = '#d97706';
    state.strokeWidth = 3;
    state.strokeStyle = 'dotted';
  } else if (syntaxType === 'conjunction') {
    state.strokeColor = '#7c3aed';
    state.strokeWidth = 2.5;
    state.fillEnabled = false;
  }

  // Деактивуємо всі кнопки лівої панелі інструментів
  document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
  state.activeSubjectTool = 'syntax_' + syntaxType;

  const svg = document.getElementById('boardSvg');
  if (svg) svg.setAttribute('class', 'board-svg tool-shape');
}

/**
 * [БЛОК 3 - Функція] Вставка речення з великим шрифтом та інтервалом для зручного підкреслення
 */
function insertSentenceToBoard(sentenceText) {
  const drawLayer = document.getElementById('drawingLayer');
  if (!drawLayer) return;

  // Вираховуємо позицію
  const existingSentences = drawLayer.querySelectorAll('.syntax-sentence-card').length;
  const startY = 140 + (existingSentences % 4) * 120;
  const startX = 100 + (Math.floor(existingSentences / 4) * 30);
  const cardWidth = Math.max(500, sentenceText.length * 19 + 60);

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'syntax-sentence-card');
  g.setAttribute('transform', `translate(${startX}, ${startY})`);

  // Підкладка-картка для чіткості
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('x', '-20');
  bg.setAttribute('y', '-45');
  bg.setAttribute('width', cardWidth.toString());
  bg.setAttribute('height', '80');
  bg.setAttribute('rx', '10');
  bg.setAttribute('fill', 'rgba(255, 255, 255, 0.96)');
  bg.setAttribute('stroke', '#e2e8f0');
  bg.setAttribute('stroke-width', '1.5');
  bg.setAttribute('filter', 'drop-shadow(0 2px 8px rgba(0,0,0,0.06))');
  g.appendChild(bg);

  // Текст речення
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', '0');
  text.setAttribute('y', '0');
  text.setAttribute('font-family', 'Georgia, "Times New Roman", serif');
  text.setAttribute('font-size', '30');
  text.setAttribute('font-weight', '500');
  text.setAttribute('fill', '#0f172a');
  text.setAttribute('letter-spacing', '0.5px');
  text.textContent = sentenceText;
  g.appendChild(text);

  // Кнопка закриття картки (✖)
  const closeBtn = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  closeBtn.setAttribute('transform', `translate(${cardWidth - 40}, -35)`);
  closeBtn.style.cursor = 'pointer';

  const closeCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  closeCircle.setAttribute('cx', '10');
  closeCircle.setAttribute('cy', '10');
  closeCircle.setAttribute('r', '10');
  closeCircle.setAttribute('fill', '#f1f5f9');
  closeCircle.setAttribute('stroke', '#cbd5e1');
  closeCircle.setAttribute('stroke-width', '1');
  closeBtn.appendChild(closeCircle);

  const closeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  closeText.setAttribute('x', '10');
  closeText.setAttribute('y', '14');
  closeText.setAttribute('text-anchor', 'middle');
  closeText.setAttribute('font-size', '12');
  closeText.setAttribute('font-weight', 'bold');
  closeText.setAttribute('fill', '#64748b');
  closeText.textContent = '✕';
  closeBtn.appendChild(closeText);

  closeBtn.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    registerUndoAction('remove', g);
    g.remove();
  });
  g.appendChild(closeBtn);

  drawLayer.appendChild(g);
  registerUndoAction('add', g);
}

/**
 * [БЛОК 2 - Функція] Завантаження повноцінної навчальної картки-вправи на дошку
 */
function loadSampleExercisePage() {
  const drawLayer = document.getElementById('drawingLayer');
  if (!drawLayer) return;

  // Видаляємо попередні зразки якщо вони вже є
  const oldCards = drawLayer.querySelectorAll('.syntax-exercise-card');
  oldCards.forEach(c => c.remove());

  // Також очищаємо фоновий шар якщо там раніше щось було
  const bgLayer = document.getElementById('backgroundLayer');
  if (bgLayer) bgLayer.innerHTML = '';

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'syntax-exercise-card');
  g.setAttribute('transform', 'translate(80, 60)');

  const cardW = 820;
  const cardH = 490;

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('width', cardW.toString());
  rect.setAttribute('height', cardH.toString());
  rect.setAttribute('rx', '14');
  rect.setAttribute('fill', '#ffffff');
  rect.setAttribute('stroke', '#94a3b8');
  rect.setAttribute('stroke-width', '2');
  rect.setAttribute('filter', 'drop-shadow(0 8px 24px rgba(0,0,0,0.12))');
  g.appendChild(rect);

  // Шапка картки
  const headerBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  headerBg.setAttribute('width', cardW.toString());
  headerBg.setAttribute('height', '60');
  headerBg.setAttribute('rx', '14');
  headerBg.setAttribute('fill', '#f8fafc');
  headerBg.setAttribute('stroke', '#e2e8f0');
  headerBg.setAttribute('stroke-width', '1');
  g.appendChild(headerBg);

  const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  title.setAttribute('x', '35'); title.setAttribute('y', '38');
  title.setAttribute('font-size', '18'); title.setAttribute('font-weight', 'bold');
  title.setAttribute('font-family', 'var(--font-main)');
  title.setAttribute('fill', '#1e40af');
  title.textContent = '📖 Вправа 36. Синтаксичний розбір простих речень';
  g.appendChild(title);

  // Кнопка закриття картки (✖)
  const closeBtn = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  closeBtn.setAttribute('transform', `translate(${cardW - 45}, 16)`);
  closeBtn.style.cursor = 'pointer';

  const closeCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  closeCircle.setAttribute('cx', '14');
  closeCircle.setAttribute('cy', '14');
  closeCircle.setAttribute('r', '14');
  closeCircle.setAttribute('fill', '#fee2e2');
  closeCircle.setAttribute('stroke', '#fca5a5');
  closeCircle.setAttribute('stroke-width', '1.5');
  closeBtn.appendChild(closeCircle);

  const closeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  closeText.setAttribute('x', '14');
  closeText.setAttribute('y', '19');
  closeText.setAttribute('text-anchor', 'middle');
  closeText.setAttribute('font-size', '15');
  closeText.setAttribute('font-weight', 'bold');
  closeText.setAttribute('fill', '#dc2626');
  closeText.textContent = '✕';
  closeBtn.appendChild(closeText);

  closeBtn.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    registerUndoAction('remove', g);
    g.remove();
  });
  g.appendChild(closeBtn);

  const desc = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  desc.setAttribute('x', '35'); desc.setAttribute('y', '95');
  desc.setAttribute('font-size', '14'); desc.setAttribute('fill', '#475569');
  desc.setAttribute('font-family', 'var(--font-main)');
  desc.textContent = 'Завдання: Визначте та підкресліть головні (підмет, присудок) та другорядні члени речення.';
  g.appendChild(desc);

  const sentences = [
    '1. Лагідний весняний вітерець колише молоду травичку.',
    '2. Соловейко дзвінко щебече у квітучому вишневому саду.',
    '3. Могутній Дніпро тихо несе свої чисті води до Чорного моря.',
    '4. Маленькі діти радісно біжать до рідної школи.'
  ];

  sentences.forEach((s, idx) => {
    const st = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    st.setAttribute('x', '35');
    st.setAttribute('y', (160 + idx * 80).toString());
    st.setAttribute('font-family', 'Georgia, serif');
    st.setAttribute('font-size', '24');
    st.setAttribute('fill', '#0f172a');
    st.textContent = s;
    g.appendChild(st);
  });

  drawLayer.appendChild(g);
  registerUndoAction('add', g);
}

/**
 * [БЛОК 2 - Функція] Завантаження користувацького PDF або зображення
 */
function handlePdfOrImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  handlePdfOrImageFile(file, { x: 100, y: 80, width: 700 });
  e.target.value = '';
}

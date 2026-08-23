/**
 * UGREAD Whiteboard - Informatics & Computer Science Module
 * Вбудований інтернет-браузер / вбудовування веб-сайтів та веб-сервісів,
 * комп'ютерні схеми, блоксхеми алгоритмів, кодування (двійковий/шістнадцятковий код),
 * клавіатурні тренажери, Scratch / Python / HTML симулятори.
 */

import { state } from '../core/state.js';
import { openSimulation } from '../core/simulations.js';
import { renderSimulationCatalog } from '../core/simulationCatalog.js';

export function renderInformaticsPanel(container) {
  container.innerHTML = `
    <!-- ===================================================================== -->
    <!-- 📦 [БЛОК 1] Відобразити сайт на дошці за URL (Web Browser & закладки) -->
    <!-- ===================================================================== -->
    <div class="module-card" style="border: 2px solid #3b82f6; background: #f0f7ff;">
      <div class="module-card-title" style="color: #1d4ed8;">
        <span>🌐 Відобразити сайт на дошці (URL)</span>
      </div>
      <p style="font-size:12px; color:#475569; margin-bottom: 8px;">
        Введіть повну або коротку адресу сайту, веб-інструменту (Scratch, Replit, Wikipedia, навчальний портал тощо):
      </p>
      
      <form id="informaticsUrlForm" style="display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; gap:6px;">
          <input 
            type="text" 
            id="informaticsSiteUrl" 
            placeholder="https://ua.wikipedia.org або scratch.mit.edu" 
            value="" 
            style="flex:1; padding:8px 10px; font-size:13px; border:1px solid #93c5fd; border-radius:8px; outline:none; background:white; color:#0f172a; font-family: monospace;"
            required
          />
          <button 
            type="submit" 
            id="btnLoadInformaticsSite" 
            class="module-btn" 
            style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color:white; font-weight:bold; padding:8px 14px; border:none; border-radius:8px; cursor:pointer;"
          >
            Відкрити
          </button>
        </div>
      </form>

      <!-- Швидкі закладки корисних ресурсів для уроків інформатики -->
      <div style="margin-top:10px;">
        <span style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase;">Швидкі посилання:</span>
        <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:4px;">
          <button class="quick-url-btn" data-url="https://snap.berkeley.edu/snap/snap.html" style="padding:4px 8px; font-size:11px; background:white; border:1px solid #bfdbfe; border-radius:6px; cursor:pointer; color:#1e40af; font-weight:600;">🐱 Snap!</button>
          <button class="quick-url-btn" data-url="https://code.org" style="padding:4px 8px; font-size:11px; background:white; border:1px solid #bfdbfe; border-radius:6px; cursor:pointer; color:#1e40af; font-weight:600;">💻 Code.org</button>
          <button class="quick-url-btn" data-url="https://www.w3schools.com/html/tryit.asp?filename=tryhtml_default" style="padding:4px 8px; font-size:11px; background:white; border:1px solid #bfdbfe; border-radius:6px; cursor:pointer; color:#1e40af; font-weight:600;">🌐 HTML Editor</button>
          <button class="quick-url-btn" data-url="https://e-olymp.com" style="padding:4px 8px; font-size:11px; background:white; border:1px solid #bfdbfe; border-radius:6px; cursor:pointer; color:#1e40af; font-weight:600;">🏆 E-Olymp</button>
          <button class="quick-url-btn" data-url="https://ua.wikipedia.org" style="padding:4px 8px; font-size:11px; background:white; border:1px solid #bfdbfe; border-radius:6px; cursor:pointer; color:#1e40af; font-weight:600;">📚 Вікіпедія</button>
        </div>
      </div>

      <div style="margin-top:10px; padding:6px 10px; background:#e0f2fe; border-radius:6px; font-size:11px; color:#0369a1; line-height:1.4;">
        ✏️ <b>Як малювати на сайті:</b> Оберіть <i>Олівець</i>, <i>Маркер</i> або натисніть синю кнопку зверху <b>«Режим 2: Малювання поверх»</b>. Щоб знову клікати по сторінці сайту — натисніть зелену кнопку <b>«Режим 1: Керування»</b>.<br/>
        💡 <i>Примітка:</i> Деякі зовнішні веб-сервери (наприклад, окремі комерційні сайти) забороняють вбудовування у фрейм з міркувань безпеки (заголовок <code>X-Frame-Options: SAMEORIGIN</code>). Для таких ресурсів у верхній панелі з'являється кнопка <b>«↗️ Відкрити в новій вкладці»</b>.
      </div>
    </div>
    <!-- ====== [КІНЕЦЬ БЛОКУ 1: Web Browser] ====== -->

    <!-- ===================================================================== -->
    <!-- 📦 [БЛОК 2] Блок-схеми алгоритмів (Flowcharts)                         -->
    <!-- ===================================================================== -->
    <div class="module-card">
      <div class="module-card-title">
        <span>🔄 Блок-схеми алгоритмів</span>
      </div>
      <p style="font-size:12px; color:#64748b;">Вставка стандартних блоків алгоритмів на дошку:</p>
      <div class="btn-group-grid-3">
        <button class="module-btn" data-flowchart="start_end">⬭ Початок/Кінець</button>
        <button class="module-btn" data-flowchart="process">▭ Дія / Процес</button>
        <button class="module-btn" data-flowchart="decision">◇ Умова (Розгалуження)</button>
        <button class="module-btn" data-flowchart="input_output">▱ Введення / Виведення</button>
        <button class="module-btn" data-flowchart="loop">⎔ Цикл</button>
        <button class="module-btn" data-flowchart="arrow">➔ Стрілка потоку</button>
      </div>
    </div>
    <!-- ====== [КІНЕЦЬ БЛОКУ 2: Блок-схеми] ====== -->

    <!-- ===================================================================== -->
    <!-- 📦 [БЛОК 3] Двійковий та шістнадцятковий конвертер (Binary & Hex)       -->
    <!-- ===================================================================== -->
    <div class="module-card">
      <div class="module-card-title">
        <span>🔢 Двійковий & Шістнадцятковий конвертер</span>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        <input 
          type="text" 
          id="infoConvertInput" 
          placeholder="Введіть текст або число..." 
          style="padding:6px 8px; font-size:12px; border:1px solid #cbd5e1; border-radius:6px;" 
        />
        <div style="display:flex; gap:4px;">
          <button id="btnConvertToBin" class="module-btn" style="flex:1;">0101 Двійковий (Bin)</button>
          <button id="btnConvertToHex" class="module-btn" style="flex:1;">#HEX Шістнадцятковий</button>
        </div>
        <div id="infoConvertResult" style="display:none; padding:8px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:6px; font-family:monospace; font-size:12px; word-break:break-all; color:#0f172a;"></div>
        <button id="btnInsertCodeToBoard" class="module-btn btn-accent" style="display:none; background:#2563eb; color:white;">➕ Додати код на дошку</button>
      </div>
    </div>
    <!-- ====== [КІНЕЦЬ БЛОКУ 3: Конвертер Bin/Hex] ====== -->

    <!-- ===================================================================== -->
    <!-- 📦 [БЛОК 4] Складові комп'ютера та мережі (Hardware / Networks)        -->
    <!-- ===================================================================== -->
    <div class="module-card">
      <div class="module-card-title">
        <span>🖥️ Складові комп'ютера & Мережі</span>
      </div>
      <div class="btn-group-grid-3">
        <button class="module-btn" data-cs-icon="cpu">🔲 Процесор (CPU)</button>
        <button class="module-btn" data-cs-icon="ram">💾 Пам'ять (RAM/SSD)</button>
        <button class="module-btn" data-cs-icon="server">🗄️ Сервер</button>
        <button class="module-btn" data-cs-icon="cloud">☁️ Хмара</button>
        <button class="module-btn" data-cs-icon="router">📡 Роутер</button>
        <button class="module-btn" data-cs-icon="user">👤 Користувач (Клієнт)</button>
      </div>
    </div>
    <!-- ====== [КІНЕЦЬ БЛОКУ 4: Складові ПК] ====== -->

    <!-- ===================================================================== -->
    <!-- 📦 [БЛОК 5] Каталог симуляцій та онлайн-ресурсів з інформатики         -->
    <!-- ===================================================================== -->
    <div id="infoSimCatalogContainer"></div>
    <!-- ====== [КІНЕЦЬ БЛОКУ 5: Каталог симуляцій] ====== -->
  `;

  // ==========================================================================
  // ⚙️ ОБРОБНИКИ ПОДІЙ (EVENT LISTENERS)
  // ==========================================================================

  // --------------------------------------------------------------------------
  // [БЛОК 5 - Логіка] Ініціалізація каталогу симуляцій
  // --------------------------------------------------------------------------
  const simWrap = container.querySelector('#infoSimCatalogContainer');
  if (simWrap) {
    renderSimulationCatalog(simWrap, 'informatics');
  }

  // --------------------------------------------------------------------------
  // [БЛОК 1 - Логіка] Завантаження сайту за введеним URL
  // --------------------------------------------------------------------------
  const form = container.querySelector('#informaticsUrlForm');
  const inputUrl = container.querySelector('#informaticsSiteUrl');

  if (form && inputUrl) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let rawUrl = inputUrl.value.trim();
      if (!rawUrl) return;

      // Автоматичне додавання протоколу якщо користувач написав google.com чи scratch.mit.edu
      if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
        rawUrl = 'https://' + rawUrl;
      }

      let siteTitle = 'Веб-сайт';
      try {
        const parsed = new URL(rawUrl);
        siteTitle = parsed.hostname;
      } catch (err) {
        siteTitle = rawUrl;
      }

      openSimulation(rawUrl, `🌐 ${siteTitle}`, true);
    });
  }

  // [БЛОК 1 - Логіка] Швидкі кнопки закладів популярних сайтів
  container.querySelectorAll('.quick-url-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.dataset.url;
      if (inputUrl) inputUrl.value = url;
      openSimulation(url, `🌐 ${btn.textContent.trim()}`, true);
    });
  });

  // --------------------------------------------------------------------------
  // [БЛОК 2 - Логіка] Клік по кнопках блок-схем алгоритмів
  // --------------------------------------------------------------------------
  container.querySelectorAll('[data-flowchart]').forEach(btn => {
    btn.addEventListener('click', () => {
      insertFlowchartBlock(btn.dataset.flowchart);
    });
  });

  // --------------------------------------------------------------------------
  // [БЛОК 3 - Логіка] Конвертер тексту/чисел у двійковий та HEX код
  // --------------------------------------------------------------------------
  const convertInput = container.querySelector('#infoConvertInput');
  const btnBin = container.querySelector('#btnConvertToBin');
  const btnHex = container.querySelector('#btnConvertToHex');
  const resultDiv = container.querySelector('#infoConvertResult');
  const btnInsertBoard = container.querySelector('#btnInsertCodeToBoard');

  let currentConvertedText = '';

  if (btnBin && convertInput && resultDiv && btnInsertBoard) {
    btnBin.addEventListener('click', () => {
      const val = convertInput.value;
      if (!val) return;
      let bin = '';
      if (!isNaN(val) && val.trim() !== '') {
        bin = Number(val).toString(2);
      } else {
        bin = Array.from(val).map(ch => ch.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
      }
      currentConvertedText = `Bin: ${bin}`;
      resultDiv.textContent = currentConvertedText;
      resultDiv.style.display = 'block';
      btnInsertBoard.style.display = 'block';
    });

    btnHex.addEventListener('click', () => {
      const val = convertInput.value;
      if (!val) return;
      let hex = '';
      if (!isNaN(val) && val.trim() !== '') {
        hex = '0x' + Number(val).toString(16).toUpperCase();
      } else {
        hex = Array.from(val).map(ch => ch.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join(' ');
      }
      currentConvertedText = `Hex: ${hex}`;
      resultDiv.textContent = currentConvertedText;
      resultDiv.style.display = 'block';
      btnInsertBoard.style.display = 'block';
    });

    btnInsertBoard.addEventListener('click', () => {
      if (!currentConvertedText) return;
      insertTextToBoard(currentConvertedText);
    });
  }

  // --------------------------------------------------------------------------
  // [БЛОК 4 - Логіка] Вставка піктограм складових ПК і мереж
  // --------------------------------------------------------------------------
  container.querySelectorAll('[data-cs-icon]').forEach(btn => {
    btn.addEventListener('click', () => {
      insertCsIcon(btn.dataset.csIcon);
    });
  });
}

// ============================================================================
// 🛠️ ДОПОМІЖНІ ФУНКЦІЇ ДЛЯ СТВОРЕННЯ ВЕКТОРНИХ ОБ'ЄКТІВ НА ДОШЦІ
// ============================================================================

/**
 * [БЛОК 2 - Функція] Вставка елемента блок-схеми (початок, процес, умова, введення, стрілка, цикл)
 */
function insertFlowchartBlock(type) {
  const drawingLayer = document.getElementById('drawingLayer');
  if (!drawingLayer) return;

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'board-element');
  const cx = 500, cy = 350;

  switch (type) {
    case 'start_end': {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', cx - 90);
      rect.setAttribute('y', cy - 30);
      rect.setAttribute('width', 180);
      rect.setAttribute('height', 60);
      rect.setAttribute('rx', 30);
      rect.setAttribute('fill', '#e0f2fe');
      rect.setAttribute('stroke', '#0284c7');
      rect.setAttribute('stroke-width', '3');
      g.appendChild(rect);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', cx);
      text.setAttribute('y', cy + 6);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '16');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('fill', '#0369a1');
      text.textContent = 'Початок / Кінець';
      g.appendChild(text);
      break;
    }
    case 'process': {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', cx - 90);
      rect.setAttribute('y', cy - 35);
      rect.setAttribute('width', 180);
      rect.setAttribute('height', 70);
      rect.setAttribute('fill', '#f0fdf4');
      rect.setAttribute('stroke', '#16a34a');
      rect.setAttribute('stroke-width', '3');
      g.appendChild(rect);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', cx);
      text.setAttribute('y', cy + 6);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '16');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('fill', '#15803d');
      text.textContent = 'Дія (Процес)';
      g.appendChild(text);
      break;
    }
    case 'decision': {
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.setAttribute('points', `${cx},${cy - 50} ${cx + 100},${cy} ${cx},${cy + 50} ${cx - 100},${cy}`);
      poly.setAttribute('fill', '#fffbeb');
      poly.setAttribute('stroke', '#d97706');
      poly.setAttribute('stroke-width', '3');
      g.appendChild(poly);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', cx);
      text.setAttribute('y', cy + 6);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '15');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('fill', '#b45309');
      text.textContent = 'Умова ?';
      g.appendChild(text);
      break;
    }
    case 'input_output': {
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.setAttribute('points', `${cx - 80},${cy + 30} ${cx - 100},${cy - 30} ${cx + 80},${cy - 30} ${cx + 100},${cy + 30}`);
      poly.setAttribute('fill', '#faf5ff');
      poly.setAttribute('stroke', '#9333ea');
      poly.setAttribute('stroke-width', '3');
      g.appendChild(poly);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', cx);
      text.setAttribute('y', cy + 6);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '15');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('fill', '#7e22ce');
      text.textContent = 'Введення / Друк';
      g.appendChild(text);
      break;
    }
    case 'arrow': {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', cx);
      line.setAttribute('y1', cy - 50);
      line.setAttribute('x2', cx);
      line.setAttribute('y2', cy + 50);
      line.setAttribute('stroke', '#0f172a');
      line.setAttribute('stroke-width', '3');
      line.setAttribute('marker-end', 'url(#markerArrow)');
      g.appendChild(line);
      break;
    }
    case 'loop': {
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.setAttribute('points', `${cx - 90},${cy} ${cx - 60},${cy - 35} ${cx + 60},${cy - 35} ${cx + 90},${cy} ${cx + 60},${cy + 35} ${cx - 60},${cy + 35}`);
      poly.setAttribute('fill', '#fef2f2');
      poly.setAttribute('stroke', '#dc2626');
      poly.setAttribute('stroke-width', '3');
      g.appendChild(poly);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', cx);
      text.setAttribute('y', cy + 5);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '15');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('fill', '#b91c1c');
      text.textContent = 'Цикл (i = 1..N)';
      g.appendChild(text);
      break;
    }
  }

  drawingLayer.appendChild(g);
}

/**
 * [БЛОК 3 - Функція] Вставка тексту результату конвертації коду (двійкового/HEX) на дошку
 */
function insertTextToBoard(textString) {
  const drawingLayer = document.getElementById('drawingLayer');
  if (!drawingLayer) return;

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'board-element');

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', 300);
  rect.setAttribute('y', 250);
  rect.setAttribute('width', Math.max(200, textString.length * 10));
  rect.setAttribute('height', 48);
  rect.setAttribute('rx', 8);
  rect.setAttribute('fill', '#0f172a');
  rect.setAttribute('stroke', '#3b82f6');
  rect.setAttribute('stroke-width', '2');
  g.appendChild(rect);

  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', 315);
  text.setAttribute('y', 280);
  text.setAttribute('font-family', 'monospace');
  text.setAttribute('font-size', '16');
  text.setAttribute('fill', '#38bdf8');
  text.textContent = textString;
  g.appendChild(text);

  drawingLayer.appendChild(g);
}

/**
 * [БЛОК 4 - Функція] Вставка піктограм комп'ютерних пристроїв та мереж
 */
function insertCsIcon(type) {
  const drawingLayer = document.getElementById('drawingLayer');
  if (!drawingLayer) return;

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'board-element');
  const cx = 500, cy = 300;

  let emoji = '💻';
  let label = 'Пристрій';

  if (type === 'cpu') { emoji = '🔲'; label = 'Процесор (CPU)'; }
  else if (type === 'ram') { emoji = '💾'; label = 'Пам\'ять (RAM)'; }
  else if (type === 'server') { emoji = '🗄️'; label = 'Сервер'; }
  else if (type === 'cloud') { emoji = '☁️'; label = 'Хмарне сховище'; }
  else if (type === 'router') { emoji = '📡'; label = 'Роутер / Wi-Fi'; }
  else if (type === 'user') { emoji = '👤'; label = 'Користувач'; }

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', cx - 75);
  rect.setAttribute('y', cy - 45);
  rect.setAttribute('width', 150);
  rect.setAttribute('height', 90);
  rect.setAttribute('rx', 12);
  rect.setAttribute('fill', '#ffffff');
  rect.setAttribute('stroke', '#6366f1');
  rect.setAttribute('stroke-width', '2.5');
  g.appendChild(rect);

  const textEmoji = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  textEmoji.setAttribute('x', cx);
  textEmoji.setAttribute('y', cy - 5);
  textEmoji.setAttribute('font-size', '30');
  textEmoji.setAttribute('text-anchor', 'middle');
  textEmoji.textContent = emoji;
  g.appendChild(textEmoji);

  const textLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  textLabel.setAttribute('x', cx);
  textLabel.setAttribute('y', cy + 28);
  textLabel.setAttribute('font-size', '12');
  textLabel.setAttribute('font-weight', 'bold');
  textLabel.setAttribute('font-family', 'sans-serif');
  textLabel.setAttribute('text-anchor', 'middle');
  textLabel.setAttribute('fill', '#334155');
  textLabel.textContent = label;
  g.appendChild(textLabel);

  drawingLayer.appendChild(g);
}

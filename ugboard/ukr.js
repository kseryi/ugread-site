// ukr.js — модуль "Українська мова з PDF" (оновлений)

let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;
let pdfImage = null;

let canvasGroup = null;
let isMoveCanvasActive = false;
let currentScale = 1;
let currentTranslate = { x: 0, y: 0 };
let isDragging = false;
let dragStart = { x: 0, y: 0 };

let activeTool = null; // інструмент панелі української мови
window.mainPanelActiveTool = null; // інструмент основної панелі

let currentElement = null;
let startPoint = { x: 0, y: 0 };

// Зберігаємо всі малюнки/фігури для кожної сторінки
let pageDrawings = {};

// ==================== Ініціалізація панелі ====================
function initUkrPanel() {
  const subjectPanel = document.getElementById("subjectPanel");
  subjectPanel.innerHTML = `
    <h3>Українська мова</h3>
    <div class="setting-row">
      <input type="file" id="pdfUpload" accept="application/pdf"/>
      <button id="moveCanvasBtn" class="ghost-btn">Перемістити полотно</button>
    </div>
    <div class="setting-row" id="pdfControls" style="display:none;">
      <button id="prevPage">◀ Назад</button>
      <span id="pageInfo">Сторінка 0 / 0</span>
      <button id="nextPage">Далі ▶</button>
    </div>
    <div class="setting-row" id="canvasScaleRow" style="display:none;">
      <label for="canvasScale">Масштаб:</label>
      <input type="range" id="canvasScale" min="0.5" max="3" step="0.1" value="1"/>
      <span id="canvasScaleVal">100%</span>
    </div>
    <div class="setting-row" id="underlinePanel">
      <ul>
        <li><button data-tool="subject">Підмет</button></li>
        <li><button data-tool="predicate">Присудок</button></li>
        <li><button data-tool="attribute">Означення</button></li>
        <li><button data-tool="object">Додаток</button></li>
        <li><button data-tool="adverbial">Обставина</button></li>
        <li><button data-tool="conjunction">Сполучник</button></li>
      </ul>
    </div>
  `;

  // Події завантаження PDF та переміщення полотна
  document.getElementById("pdfUpload").addEventListener("change", handlePdfUpload);
  document.getElementById("moveCanvasBtn").addEventListener("click", toggleMoveCanvas);

  const board = document.getElementById("board");
  const bgLayer = document.getElementById("bgLayer");
  const drawLayer = document.getElementById("drawLayer");

  // Група для трансформацій
  if (!canvasGroup) {
    canvasGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    canvasGroup.appendChild(bgLayer);
    canvasGroup.appendChild(drawLayer);
    board.appendChild(canvasGroup);
  }

  // Масштабування
  document.getElementById("canvasScale").addEventListener("input", (e) => {
    const newScale = parseFloat(e.target.value);
    const boardRect = board.getBoundingClientRect();
    const centerX = boardRect.width / 2;
    const centerY = boardRect.height / 2;

    const dx = (centerX - currentTranslate.x) * (newScale / currentScale - 1);
    const dy = (centerY - currentTranslate.y) * (newScale / currentScale - 1);

    currentTranslate.x -= dx;
    currentTranslate.y -= dy;
    currentScale = newScale;

    applyTransform();
    document.getElementById("canvasScaleVal").textContent = `${Math.round(currentScale * 100)}%`;
  });

  // ==================== Події миші ====================
  board.addEventListener("mousedown", (e) => {
    if (isMoveCanvasActive) {
      isDragging = true;
      dragStart = { x: e.clientX, y: e.clientY };
      return;
    }

    const tool = activeTool || window.mainPanelActiveTool;
    if (!tool) return;

    const svgPoint = getSVGPoint(e, board);
    startPoint = { x: svgPoint.x, y: svgPoint.y };
    currentElement = createDragElement(tool, startPoint.x, startPoint.y);
    drawLayer.appendChild(currentElement);
  });

  board.addEventListener("mousemove", (e) => {
    if (isMoveCanvasActive && isDragging) {
      const dx = (e.clientX - dragStart.x) / currentScale;
      const dy = (e.clientY - dragStart.y) / currentScale;
      currentTranslate.x += dx;
      currentTranslate.y += dy;
      applyTransform();
      dragStart = { x: e.clientX, y: e.clientY };
      return;
    }

    if (currentElement) {
      const svgPoint = getSVGPoint(e, board);
      const tool = activeTool || window.mainPanelActiveTool;
      updateDragElement(currentElement, startPoint, svgPoint, tool);
    }
  });

  board.addEventListener("mouseup", (e) => {
    if (isMoveCanvasActive) { isDragging = false; return; }
    if (!currentElement) return;

    const svgPoint = getSVGPoint(e, board);
    const tool = activeTool || window.mainPanelActiveTool;
    saveDrawing(currentPage, tool, startPoint, svgPoint, currentElement.outerHTML);

    if (tool === "predicate") {
      const secondLine = createParallelLine(currentElement);
      drawLayer.appendChild(secondLine);
      saveDrawing(currentPage, tool, startPoint, svgPoint, secondLine.outerHTML);
    }

    currentElement = null;
  });

  board.addEventListener("mouseleave", () => { isDragging = false; currentElement = null; });

  // ==================== Інструменти підкреслень ====================
  const underlinePanel = document.getElementById("underlinePanel");
  underlinePanel.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const tool = btn.getAttribute("data-tool");
      setActiveTool(activeTool === tool ? null : tool, 'ukr');

      underlinePanel.querySelectorAll("button").forEach(b => b.style.backgroundColor = "");
      if (activeTool) btn.style.backgroundColor = "#ddd";
    });
  });
}

// ==================== Активний інструмент ====================
function setActiveTool(tool, panelType) {
  if (panelType === 'ukr') {
    if (window.mainPanelActiveTool) window.mainPanelActiveTool = null;
    activeTool = tool;
  } else if (panelType === 'main') {
    if (activeTool) activeTool = null;
    document.querySelectorAll('#subjectPanel button[data-tool]').forEach(b => b.style.backgroundColor = "");
    window.mainPanelActiveTool = tool;
  }
}

// ==================== PDF завантаження ====================
async function handlePdfUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  pdfDoc = await pdfjsLib.getDocument(url).promise;
  totalPages = pdfDoc.numPages;

  document.getElementById("pdfControls").style.display = "flex";
  document.getElementById("canvasScaleRow").style.display = "flex";

  renderPage(1);
}

// ==================== Рендер сторінки ====================
async function renderPage(num) {
  currentPage = num;
  const page = await pdfDoc.getPage(num);
  const viewport = page.getViewport({ scale: 1.5 });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  await page.render({ canvasContext: ctx, viewport }).promise;
  const imgUrl = canvas.toDataURL("image/png");

  if (pdfImage) pdfImage.remove();
  pdfImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
  pdfImage.setAttributeNS(null, "href", imgUrl);
  pdfImage.setAttribute("x", 0);
  pdfImage.setAttribute("y", 0);
  pdfImage.setAttribute("width", viewport.width);
  pdfImage.setAttribute("height", viewport.height);
  document.getElementById("bgLayer").appendChild(pdfImage);

  loadPageDrawings(num);

  document.getElementById("pageInfo").textContent = `Сторінка ${num} / ${totalPages}`;
  document.getElementById("prevPage").onclick = () => { if (currentPage > 1) renderPage(currentPage - 1); };
  document.getElementById("nextPage").onclick = () => { if (currentPage < totalPages) renderPage(currentPage + 1); };
}

// ==================== Допоміжні функції ====================
function toggleMoveCanvas() { 
  isMoveCanvasActive = !isMoveCanvasActive; 
  document.getElementById("moveCanvasBtn").style.backgroundColor = isMoveCanvasActive ? "#ddd" : "";
}

function applyTransform() {
  if (canvasGroup) canvasGroup.setAttribute("transform", `translate(${currentTranslate.x},${currentTranslate.y}) scale(${currentScale})`);
}

function getSVGPoint(evt, svg) {
  const pt = svg.createSVGPoint();
  const rect = svg.getBoundingClientRect();
  pt.x = (evt.clientX - rect.left - currentTranslate.x) / currentScale;
  pt.y = (evt.clientY - rect.top - currentTranslate.y) / currentScale;
  return pt;
}

function createDragElement(type, x, y) {
  let el;
  switch(type) {
    case "subject":
      el = document.createElementNS("http://www.w3.org/2000/svg", "line");
      el.setAttribute("stroke", "blue"); break;
    case "predicate":
      el = document.createElementNS("http://www.w3.org/2000/svg", "line");
      el.setAttribute("stroke", "red"); break;
    case "attribute":
      el = document.createElementNS("http://www.w3.org/2000/svg", "path");
      el.setAttribute("stroke", "green"); el.setAttribute("fill", "none"); break;
    case "object":
      el = document.createElementNS("http://www.w3.org/2000/svg", "line");
      el.setAttribute("stroke", "black"); el.setAttribute("stroke-dasharray", "4,4"); break;
    case "adverbial":
    const waveLength = 10; // довжина однієї хвильки по x
    const waveHeight = 5;  // амплітуда хвильки по y
    const dx = current.x - start.x;
    const dy = current.y - start.y;
    const steps = Math.max(1, Math.floor(Math.abs(dx) / waveLength));
    let path = `M${start.x},${start.y}`;
    for (let i = 0; i < steps; i++) {
        const x1 = start.x + i * waveLength;
        const y1 = start.y + (i % 2 === 0 ? -waveHeight : waveHeight);
        const x2 = start.x + (i + 1) * waveLength;
        const y2 = start.y + ((i + 1) % 2 === 0 ? -waveHeight : waveHeight);
        path += ` Q${x1},${y1} ${x2},${y2}`;
    }
    el.setAttribute("d", path);
    break;

    case "conjunction":
      el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      el.setAttribute("stroke", "black"); el.setAttribute("fill", "none"); el.setAttribute("r", 10); break;
  }

  if (type === "line" || type === "subject" || type === "predicate" || type === "object" || type === "adverbial") {
    el.setAttribute("x1", x); el.setAttribute("y1", y); el.setAttribute("x2", x); el.setAttribute("y2", y);
    el.setAttribute("stroke-width", 2);
  } else if (type === "attribute") {
    el.setAttribute("d", `M${x},${y}`);
    el.setAttribute("stroke-width", 2);
  } else if (type === "conjunction") {
    el.setAttribute("cx", x); el.setAttribute("cy", y);
    el.setAttribute("stroke-width", 2);
  }
  return el;
}

function updateDragElement(el, start, current, type) {
  switch(type) {
    case "subject":
    case "predicate":
    case "object":
    case "adverbial":
      el.setAttribute("x2", current.x);
      el.setAttribute("y2", current.y);
      break;
    case "attribute":
      el.setAttribute("d", `M${start.x},${start.y} q${(current.x-start.x)/2},5 ${current.x-start.x},0 q${(current.x-start.x)/2},-5 ${current.x-start.x},0`);
      break;
    case "conjunction":
      el.setAttribute("cx", current.x);
      el.setAttribute("cy", current.y);
      break;
  }
}

function createParallelLine(el) {
  const x1 = +el.getAttribute("x1");
  const y1 = +el.getAttribute("y1");
  const x2 = +el.getAttribute("x2");
  const y2 = +el.getAttribute("y2");

  const dx = y2 - y1;
  const dy = x1 - x2;
  const len = Math.sqrt(dx*dx + dy*dy) || 1;
  const offset = 4;
  const ox = (dx / len) * offset;
  const oy = (dy / len) * offset;

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1+ox); line.setAttribute("y1", y1+oy);
  line.setAttribute("x2", x2+ox); line.setAttribute("y2", y2+oy);
  line.setAttribute("stroke", "red"); line.setAttribute("stroke-width", 4);
  return line;
}

function saveDrawing(page, type, start, end, html) {
  if (!pageDrawings[page]) pageDrawings[page] = [];
  pageDrawings[page].push({ type, start, end, html });
}

function loadPageDrawings(page) {
  const drawLayer = document.getElementById("drawLayer");
  drawLayer.innerHTML = "";
  const drawings = pageDrawings[page];
  if (!drawings) return;
  drawings.forEach(d => drawLayer.insertAdjacentHTML("beforeend", d.html));
}

// ==================== Запуск ====================
initUkrPanel();


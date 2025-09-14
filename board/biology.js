function initGeographyPanel() {
  const subjectPanel = document.getElementById('subjectPanel');
  const board = document.getElementById('board');
  const drawLayer = document.getElementById('drawLayer');
  const bgLayer = document.getElementById('bgLayer');

  subjectPanel.innerHTML = `
    <h3>Географія</h3>
    <div class="setting-row">
      <button id="loadGLBBtn" class="ghost-btn">Завантажити GLB модель</button>
      <button id="loadMapBtn" class="ghost-btn">Завантажити карту</button>
      <button id="moveCanvasBtn" class="ghost-btn">Перемістити полотно</button>
    </div>
    <div class="setting-row" id="canvasScaleRow" style="display:none;">
      <label for="canvasScale">Масштаб полотна:</label>
      <input type="range" id="canvasScale" min="0.1" max="3" step="0.05" value="1"/>
      <span id="canvasScaleVal">100%</span>
    </div>
  `;

  const loadMapBtn = document.getElementById('loadMapBtn');
  const moveCanvasBtn = document.getElementById('moveCanvasBtn');
  const loadGLBBtn = document.getElementById('loadGLBBtn');
  const canvasScaleRow = document.getElementById('canvasScaleRow');
  const canvasScale = document.getElementById('canvasScale');
  const canvasScaleVal = document.getElementById('canvasScaleVal');

  // Група для всього полотна
  let canvasGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  canvasGroup.appendChild(bgLayer);
  canvasGroup.appendChild(drawLayer);
  board.appendChild(canvasGroup);

  let mapImage = null;
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };
  let activeTool = null;
  let currentScale = 1;
  let currentTranslate = { x: 0, y: 0 };

  // --- Завантаження карти ---
  loadMapBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = ev => {
        if (mapImage) mapImage.remove();

        mapImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
        mapImage.setAttributeNS(null, 'href', ev.target.result);

        const img = new Image();
        img.onload = () => {
          const boardRect = board.getBoundingClientRect();
          const scaleX = boardRect.width / img.width;
          const scaleY = boardRect.height / img.height;
          const scale = Math.min(scaleX, scaleY) * 0.9;

          const width = img.width * scale;
          const height = img.height * scale;

          mapImage.setAttribute('width', width);
          mapImage.setAttribute('height', height);
          mapImage.setAttribute('x', (boardRect.width - width) / 2);
          mapImage.setAttribute('y', (boardRect.height - height) / 2);

          bgLayer.appendChild(mapImage);

          canvasScaleRow.style.display = 'flex';
          canvasScale.value = 1;
          canvasScaleVal.textContent = '100%';
          currentScale = 1;
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  });

  // --- Завантаження GLB моделі ---
  loadGLBBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.glb,.gltf';
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);

      if (window.ModelLoader) {
        ModelLoader.loadGLB(url, file.name, obj => {
          console.log('GLB модель додана:', obj.name);
          URL.revokeObjectURL(url);
        });
      } else {
        alert('ModelLoader не підключений або не готовий');
      }
    };
    input.click();
  });

  // --- Масштабування полотна ---
  canvasScale.addEventListener('input', () => {
    const newScale = parseFloat(canvasScale.value);

    const boardRect = board.getBoundingClientRect();
    const centerX = boardRect.width / 2;
    const centerY = boardRect.height / 2;

    const dx = (centerX - currentTranslate.x) * (newScale / currentScale - 1);
    const dy = (centerY - currentTranslate.y) * (newScale / currentScale - 1);

    currentTranslate.x -= dx;
    currentTranslate.y -= dy;

    currentScale = newScale;
    canvasGroup.setAttribute('transform', `translate(${currentTranslate.x},${currentTranslate.y}) scale(${currentScale})`);
    canvasScaleVal.textContent = `${Math.round(currentScale * 100)}%`;
  });

  // --- Переміщення полотна ---
  moveCanvasBtn.addEventListener('click', () => {
    activeTool = activeTool === 'moveCanvas' ? null : 'moveCanvas';
    moveCanvasBtn.style.backgroundColor = activeTool === 'moveCanvas' ? '#ddd' : '';
  });

  board.addEventListener('mousedown', e => {
    if (activeTool !== 'moveCanvas') return;
    isDragging = true;
    dragStart = { x: e.clientX, y: e.clientY };
  });

  board.addEventListener('mousemove', e => {
    if (!isDragging || activeTool !== 'moveCanvas') return;
    const dx = (e.clientX - dragStart.x) / currentScale;
    const dy = (e.clientY - dragStart.y) / currentScale;

    currentTranslate.x += dx;
    currentTranslate.y += dy;

    canvasGroup.setAttribute('transform', `translate(${currentTranslate.x},${currentTranslate.y}) scale(${currentScale})`);
    dragStart = { x: e.clientX, y: e.clientY };
  });

  board.addEventListener('mouseup', () => { isDragging = false; });
  board.addEventListener('mouseleave', () => { isDragging = false; });
}

// Виклик функції
initGeographyPanel();

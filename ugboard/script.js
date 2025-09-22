// === script.js — оновлена версія з незалежним масштабуванням (повна інтеграція) ===
const state = {
  tool: 'select',
  strokeColor: '#000000',
  strokeWidth: 2,
  strokeStyle: 'solid',
  fillColor: '#ff0000',
  noFill: false,
  drawing: false,
  currentEl: null,
  startPoint: null,
  selectedEl: null,
  dragOffset: { x: 0, y: 0 },
  polyPoints: [],
  resizeHandle: null,
  elementPoints: new WeakMap(), // оригінальні точки polygon/star/polyline
  loadedSubjects: new Set(),

  // Масштаби/зсуви
  view: {
    all:  { scale: 1, tx: 0, ty: 0 },  // масштабує ВСЕ разом (фон + малюнки)
    bg:   { scale: 1, tx: 0, ty: 0 },  // тільки фон
    draw: { scale: 1, tx: 0, ty: 0 }   // тільки малюнки
  },

  // Налаштування фону / координатної сітки
  grid: {
    size: 50,
    showGrid: false,
    showAxes: false,
    // origin: if null -> центр полотна, else {x,y} в SVG координатах фону
    origin: null,
    setOriginMode: false
  }
};

// === Утиліти ===
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

/* ВАЖЛИВО:
   РАНІШЕ тут була рекурсивна помилка getTransformedPoint().
   Нижче — коректні функції перетворення координат миші в локальні координати конкретного <g>.
*/

// Повертає локальні координати podGroup (наприклад, #drawLayer) з події миші/пальця
function localPointFromEvent(evt, podGroup){
  const svg = $('#board');
  const p = svg.createSVGPoint();
  // Використовуємо clientX/clientY, щоб не залежати від скролів контейнера
  const e = evt.touches ? evt.touches[0] : evt;
  p.x = e.clientX;
  p.y = e.clientY;
  const m = podGroup.getScreenCTM();
  if(!m) return {x:0,y:0};
  const inv = m.inverse();
  const pt = p.matrixTransform(inv);
  return { x: pt.x, y: pt.y };
}

// Безпечний парсер translate з атрибута transform елемента
function readTranslate(el){
  const t = el.getAttribute('transform') || '';
  const m = /translate\(\s*([-\d.]+)[ ,]([-\d.]+)\s*\)/.exec(t);
  return { tx: m ? parseFloat(m[1]) : 0, ty: m ? parseFloat(m[2]) : 0 };
}

function writeTranslate(el, tx, ty){
  el.setAttribute('transform', `translate(${tx} ${ty})`);
}

/* applyAttrs: застосовує стиль до елементів
   ПРИМІТКА: якщо потрібна товщина, що НЕ масштабується, можна додати:
   el.setAttribute('vector-effect','non-scaling-stroke');
*/
function applyAttrs(el, forceNoFill=false){
  el.setAttribute('stroke', state.strokeColor);
  el.setAttribute('stroke-width', state.strokeWidth);
  if(state.strokeStyle==='dashed') el.setAttribute('stroke-dasharray','8 6');
  else if(state.strokeStyle==='dotted') el.setAttribute('stroke-dasharray','2 6');
  else el.removeAttribute('stroke-dasharray');
  if(forceNoFill || state.noFill) el.setAttribute('fill','none');
  else el.setAttribute('fill',state.fillColor);
}

function deselect(){
  if(state.selectedEl){
    state.selectedEl.classList.remove('selected');
    removeResizeHandles();
    state.selectedEl = null;
  }
}

function selectElement(el){
  deselect();
  state.selectedEl = el;
  el.classList.add('selected');
  createResizeHandles(el);

  // синхронізація панелі
  if(el.hasAttribute('stroke')) state.strokeColor = el.getAttribute('stroke');
  if(el.hasAttribute('stroke-width')) state.strokeWidth = +el.getAttribute('stroke-width');
  if(el.hasAttribute('stroke-dasharray')){
    const dash = el.getAttribute('stroke-dasharray');
    state.strokeStyle = dash==='8 6'?'dashed':dash==='2 6'?'dotted':'solid';
  } else state.strokeStyle='solid';
  const fill = el.getAttribute('fill');
  if(fill && fill!=='none'){ state.fillColor=fill; state.noFill=false; }
  else state.noFill=true;

  if($('#strokeColor')) $('#strokeColor').value = state.strokeColor;
  if($('#strokeWidth')) $('#strokeWidth').value = state.strokeWidth;
  if($('#strokeStyle')) $('#strokeStyle').value = state.strokeStyle;
  if($('#fillColor')) $('#fillColor').value = state.fillColor;
  if($('#noFill')) $('#noFill').checked = state.noFill;
}

// ===============================
//  БЛОК РЕСАЙЗУ (оновлений)
// ===============================

function createResizeHandles(el){
  removeResizeHandles();
  const svg = $('#board');
  const bbox = el.getBBox();
  const positions = ['nw','ne','sw','se'];
  positions.forEach(pos=>{
    const handle = document.createElementNS('http://www.w3.org/2000/svg','rect');
    handle.classList.add('resize-handle');
    handle.setAttribute('width',8);
    handle.setAttribute('height',8);
    handle.setAttribute('fill','#00f');
    handle.setAttribute('cursor', pos+'-resize');
    handle.setAttribute('data-cursor', pos);
    positionHandle(handle,bbox,pos);
    svg.appendChild(handle);
    handle.addEventListener('pointerdown', startResize);
  });
}

function removeResizeHandles(){ 
  $$('.resize-handle').forEach(h=>h.remove()); 
}

function positionHandle(handle, bbox, pos){
  let x=bbox.x, y=bbox.y;
  if(pos.includes('e')) x += bbox.width - 4;
  if(pos.includes('s')) y += bbox.height - 4;
  if(pos.includes('w')) x -= 4;
  if(pos.includes('n')) y -= 4;
  handle.setAttribute('x', x);
  handle.setAttribute('y', y);
}

function startResize(e){
  e.stopPropagation();
  state.resizeHandle = e.target.getAttribute('data-cursor');
  state.drawing = true;
  document.addEventListener('pointermove', resizeMove);
  document.addEventListener('pointerup', resizeEnd);
}

function resizeMove(e){
  if(!state.selectedEl || !state.resizeHandle) return;
  const el = state.selectedEl;
  const bbox = el.getBBox();
  const pt = localPointFromEvent(e, $('#drawLayer'));

  let x=bbox.x, y=bbox.y, w=bbox.width, h=bbox.height;

  if(state.resizeHandle.includes('e')) w = pt.x - x;
  if(state.resizeHandle.includes('s')) h = pt.y - y;
  if(state.resizeHandle.includes('w')) { w += x - pt.x; x = pt.x; }
  if(state.resizeHandle.includes('n')) { h += y - pt.y; y = pt.y; }

  switch(el.tagName){
    case 'rect':
      el.setAttribute('x', x);
      el.setAttribute('y', y);
      el.setAttribute('width', Math.max(1,w));
      el.setAttribute('height', Math.max(1,h));
      break;
    case 'circle':
      el.setAttribute('cx', x + w/2);
      el.setAttribute('cy', y + h/2);
      el.setAttribute('r', Math.max(w,h)/2);
      break;
    case 'ellipse':
      el.setAttribute('cx', x + w/2);
      el.setAttribute('cy', y + h/2);
      el.setAttribute('rx', w/2);
      el.setAttribute('ry', h/2);
      break;
    case 'polygon': case 'polyline':
      const origPoints = state.elementPoints.get(el);
      if(!origPoints) break;
      const cx = bbox.x + bbox.width/2;
      const cy = bbox.y + bbox.height/2;
      const scaleX = w / (bbox.width || 1);
      const scaleY = h / (bbox.height || 1);
      const newPts = origPoints.map(p=>({x: cx + (p.x-cx)*scaleX, y: cy + (p.y-cy)*scaleY}));
      el.setAttribute('points', newPts.map(p=>`${p.x},${p.y}`).join(' '));
      state.elementPoints.set(el, newPts);
      break;
  }

  // Оновлюємо положення ручок
  const newBBox = el.getBBox();
  $$('.resize-handle').forEach(h=>positionHandle(h,newBBox,h.getAttribute('data-cursor')));
}

function resizeEnd(){
  state.drawing=false;
  state.resizeHandle=null;
  document.removeEventListener('pointermove', resizeMove);
  document.removeEventListener('pointerup', resizeEnd);
}


// === Геометрія ===
function regularPolygonPoints(cx, cy, r, sides, star=false){
  const points=[];
  if(!star){
    const step=(Math.PI*2)/sides, start=-Math.PI/2;
    for(let i=0;i<sides;i++){
      const a=start+i*step;
      points.push({x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)});
    }
  } else {
    const start=-Math.PI/2, inner=r*0.5;
    for(let i=0;i<10;i++){
      const rr=i%2===0?r:inner;
      const a=start+(Math.PI/5)*i;
      points.push({x:cx+rr*Math.cos(a),y:cy+rr*Math.sin(a)});
    }
  }
  return points;
}

// ===============================
//  ФОН: сітка та осі
// ===============================
function ensureBgLayers(){
  const bg = $('#bgLayer');
  if(!bg) return;
  if(!$('#gridLayer')) {
    const g = document.createElementNS('http://www.w3.org/2000/svg','g');
    g.setAttribute('id','gridLayer');
    bg.appendChild(g);
  }
  if(!$('#axesLayer')) {
    const g = document.createElementNS('http://www.w3.org/2000/svg','g');
    g.setAttribute('id','axesLayer');
    bg.appendChild(g);
  }
}

function clearGridLayer(){ const g=$('#gridLayer'); if(g) g.innerHTML=''; }
function clearAxesLayer(){ const g=$('#axesLayer'); if(g) g.innerHTML=''; }

function getBoardSize(){
  const board = $('#board');
  return { width: board.clientWidth || 800, height: board.clientHeight || 600 };
}

function getGridOrigin(){
  const { width, height } = getBoardSize();
  if(state.grid.origin) return { x: state.grid.origin.x, y: state.grid.origin.y };
  return { x: width / 2, y: height / 2 };
}

function drawGrid(size = 50){
  ensureBgLayers();
  clearGridLayer();
  const g = $('#gridLayer');
  const { width, height } = getBoardSize();
  const origin = getGridOrigin();

  const stroke = '#e6e6e6';
  const strokeWidth = 1;

  let nStart = Math.floor((0 - origin.x) / size) - 1;
  for(let n = nStart; ; n++){
    const x = origin.x + n * size;
    if(x < -size) continue;
    if(x > width + size) break;
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', x);
    line.setAttribute('y1', 0);
    line.setAttribute('x2', x);
    line.setAttribute('y2', height);
    line.setAttribute('stroke', stroke);
    line.setAttribute('stroke-width', strokeWidth);
    g.appendChild(line);
  }

  nStart = Math.floor((0 - origin.y) / size) - 1;
  for(let n = nStart; ; n++){
    const y = origin.y + n * size;
    if(y < -size) continue;
    if(y > height + size) break;
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', 0);
    line.setAttribute('y1', y);
    line.setAttribute('x2', width);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', stroke);
    line.setAttribute('stroke-width', strokeWidth);
    g.appendChild(line);
  }
}

function drawAxes(){
  ensureBgLayers();
  clearAxesLayer();
  const g = $('#axesLayer');
  const { width, height } = getBoardSize();
  const origin = getGridOrigin();
  const size = Math.max(5, state.grid.size);

  const axStroke = '#333';
  const axWidth = 2;
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg','line');
  xAxis.setAttribute('x1', 0);
  xAxis.setAttribute('y1', origin.y);
  xAxis.setAttribute('x2', width);
  xAxis.setAttribute('y2', origin.y);
  xAxis.setAttribute('stroke', axStroke);
  xAxis.setAttribute('stroke-width', axWidth);
  g.appendChild(xAxis);

  const yAxis = document.createElementNS('http://www.w3.org/2000/svg','line');
  yAxis.setAttribute('x1', origin.x);
  yAxis.setAttribute('y1', 0);
  yAxis.setAttribute('x2', origin.x);
  yAxis.setAttribute('y2', height);
  yAxis.setAttribute('stroke', axStroke);
  yAxis.setAttribute('stroke-width', axWidth);
  g.appendChild(yAxis);

  const tickLen = 6;
  const tickStroke = '#333';
  for(let n = -Math.ceil(width/size)-1; n <= Math.ceil(width/size)+1; n++){
    const x = origin.x + n * size;
    if(x < -size || x > width + size) continue;
    const t = document.createElementNS('http://www.w3.org/2000/svg','line');
    t.setAttribute('x1', x);
    t.setAttribute('y1', origin.y - tickLen/2);
    t.setAttribute('x2', x);
    t.setAttribute('y2', origin.y + tickLen/2);
    t.setAttribute('stroke', tickStroke);
    t.setAttribute('stroke-width', 1);
    g.appendChild(t);
  }
  for(let n = -Math.ceil(height/size)-1; n <= Math.ceil(height/size)+1; n++){
    const y = origin.y + n * size;
    if(y < -size || y > height + size) continue;
    const t = document.createElementNS('http://www.w3.org/2000/svg','line');
    t.setAttribute('x1', origin.x - tickLen/2);
    t.setAttribute('y1', y);
    t.setAttribute('x2', origin.x + tickLen/2);
    t.setAttribute('y2', y);
    t.setAttribute('stroke', tickStroke);
    t.setAttribute('stroke-width', 1);
    g.appendChild(t);
  }

  const xLabel = document.createElementNS('http://www.w3.org/2000/svg','text');
  xLabel.setAttribute('x', width - 18);
  xLabel.setAttribute('y', origin.y - 6);
  xLabel.setAttribute('font-size', 14);
  xLabel.textContent = 'X';
  g.appendChild(xLabel);

  const yLabel = document.createElementNS('http://www.w3.org/2000/svg','text');
  yLabel.setAttribute('x', origin.x + 6);
  yLabel.setAttribute('y', 16);
  yLabel.setAttribute('font-size', 14);
  yLabel.textContent = 'Y';
  g.appendChild(yLabel);
}

function updateBackground(){
  ensureBgLayers();
  if(state.grid.showGrid) drawGrid(state.grid.size);
  else clearGridLayer();
  if(state.grid.showAxes) drawAxes();
  else clearAxesLayer();
}

function clearBackground(){
  state.grid.origin = null;
  clearGridLayer();
  clearAxesLayer();
  state.grid.showGrid = false;
  state.grid.showAxes = false;
  if($('#gridToggle')) $('#gridToggle').checked = false;
  if($('#axesToggle')) $('#axesToggle').checked = false;
}

// ===============================
//  МАСШТАБУВАННЯ ТА ГРУПИ ШАРІВ
// ===============================

/* Ми НЕ чіпаємо HTML.
   На ініціалізації створюємо <g id="rootView"> і
   переносимо всередину існуючі #bgLayer, #drawLayer, #selectionLayer.
   Далі застосовуємо трансформації так:
   <svg id="board">
     <g id="rootView" transform="translate(all.tx,all.ty) scale(all.scale)">
       <g id="bgLayer"   transform="translate(bg.tx,bg.ty) scale(bg.scale)">...</g>
       <g id="drawLayer" transform="translate(draw.tx,draw.ty) scale(draw.scale)">...</g>
       <g id="selectionLayer">...</g>
     </g>
   </svg>
*/

function ensureViewGroups(){
  const svg = $('#board');
  if(!svg) return;

  let root = $('#rootView');
  let bg = $('#bgLayer');
  let draw = $('#drawLayer');
  let sel = $('#selectionLayer');

  // Якщо шарів немає — створюємо
  if(!bg){
    bg = document.createElementNS('http://www.w3.org/2000/svg','g');
    bg.id = 'bgLayer';
    svg.appendChild(bg);
  }
  if(!draw){
    draw = document.createElementNS('http://www.w3.org/2000/svg','g');
    draw.id = 'drawLayer';
    svg.appendChild(draw);
  }
  if(!sel){
    sel = document.createElementNS('http://www.w3.org/2000/svg','g');
    sel.id = 'selectionLayer';
    svg.appendChild(sel);
  }

  // Створюємо root і переносимо всередину існуючі групи
  if(!root){
    root = document.createElementNS('http://www.w3.org/2000/svg','g');
    root.id = 'rootView';
    // Вставляємо root у кінець SVG
    svg.appendChild(root);
    // Переносимо групи (appendChild перемістить вузол)
    root.appendChild(bg);
    root.appendChild(draw);
    root.appendChild(sel);
  } else {
    // Переконаємось, що порядок всередині root правильний
    if(bg.parentNode !== root) root.appendChild(bg);
    if(draw.parentNode !== root) root.appendChild(draw);
    if(sel.parentNode !== root) root.appendChild(sel);
  }

  applyViewTransforms();
}

function applyViewTransforms(){
  const root = $('#rootView');
  const bg = $('#bgLayer');
  const draw = $('#drawLayer');
  if(root){
    const { scale, tx, ty } = state.view.all;
    root.setAttribute('transform', `translate(${tx} ${ty}) scale(${scale})`);
  }
  if(bg){
    const v = state.view.bg;
    bg.setAttribute('transform', `translate(${v.tx} ${v.ty}) scale(${v.scale})`);
  }
  if(draw){
    const v = state.view.draw;
    draw.setAttribute('transform', `translate(${v.tx} ${v.ty}) scale(${v.scale})`);
  }
}

// Публічні API для масштабування (можеш дергати ззовні або прив’язати до кнопок)
function zoomAll(f){ state.view.all.scale *= f; applyViewTransforms(); }
function panAll(dx,dy){ state.view.all.tx += dx; state.view.all.ty += dy; applyViewTransforms(); }

function zoomBg(f){ state.view.bg.scale *= f; applyViewTransforms(); updateBackground(); }
function panBg(dx,dy){ state.view.bg.tx += dx; state.view.bg.ty += dy; applyViewTransforms(); updateBackground(); }

function zoomDraw(f){ state.view.draw.scale *= f; applyViewTransforms(); }
function panDraw(dx,dy){ state.view.draw.tx += dx; state.view.draw.ty += dy; applyViewTransforms(); }

// Винесемо в window, щоб можна було керувати з інших модулів/кнопок
window.zoomAll = zoomAll; window.panAll = panAll;
window.zoomBg = zoomBg; window.panBg = panBg;
window.zoomDraw = zoomDraw; window.panDraw = panDraw;

// ===============================
//  Малювання (твой оригінальний код, але з правильними координатами)
// ===============================

function onPointerDown(e){
  // Режим встановлення початку координат для фону — беремо координати у СИСТЕМІ ФОНУ
  if(state.grid.setOriginMode){
    const pt = localPointFromEvent(e, $('#bgLayer'));
    state.grid.origin = { x: pt.x, y: pt.y };
    state.grid.setOriginMode = false;
    updateBackground();
    const btn = $('#setOriginBtn');
    if(btn) btn.classList.remove('active');
    return;
  }

  // УВАГА: всі фігури малюємо в drawLayer, тому координати беремо в його локальній системі
  const drawLayer = $('#drawLayer');
  const pt = localPointFromEvent(e, drawLayer);
  state.startPoint = pt;
  state.drawing = true;

  if(state.tool==='select'){
    const target = e.target.closest('#drawLayer > *'); // обираємо тільки з шару малюнків
    if(target){
      selectElement(target);
      const t = readTranslate(target);
      // Зберігаємо точку старту в координатах drawLayer й початкову трансляцію елемента
      state.dragOffset.x = pt.x - t.tx;
      state.dragOffset.y = pt.y - t.ty;
    } else {
      deselect();
    }
    return;
  }

  deselect();

  let el=null;
  const draw = drawLayer;

  if(state.tool==='polyline'){
    if(!state.currentEl){
      el = document.createElementNS('http://www.w3.org/2000/svg','polyline');
      state.polyPoints = [pt];
      el.setAttribute('points',`${pt.x},${pt.y}`);
      applyAttrs(el,true);
      el.setAttribute('pointer-events','stroke');
      draw.appendChild(el);
      state.currentEl = el;
      state.elementPoints.set(el,[pt]);
      return;
    } else {
      state.polyPoints.push(pt);
      const ptsStr = state.polyPoints.map(p=>`${p.x},${p.y}`).join(' ');
      state.currentEl.setAttribute('points',ptsStr);
      state.elementPoints.set(state.currentEl,[...state.polyPoints]);
      return;
    }
  }

  switch(state.tool){
    case 'pencil':
      el=document.createElementNS('http://www.w3.org/2000/svg','path');
      el.setAttribute('d',`M ${pt.x} ${pt.y}`);
      applyAttrs(el,true);
      el.setAttribute('pointer-events','stroke');
      break;
    case 'line':
      el=document.createElementNS('http://www.w3.org/2000/svg','line');
      el.setAttribute('x1',pt.x); el.setAttribute('y1',pt.y);
      el.setAttribute('x2',pt.x); el.setAttribute('y2',pt.y);
      applyAttrs(el,true);
      el.setAttribute('pointer-events','stroke');
      break;
    case 'rect':
      el=document.createElementNS('http://www.w3.org/2000/svg','rect');
      el.setAttribute('x',pt.x); el.setAttribute('y',pt.y);
      el.setAttribute('width',0); el.setAttribute('height',0);
      applyAttrs(el);
      break;
    case 'circle':
      el=document.createElementNS('http://www.w3.org/2000/svg','circle');
      el.setAttribute('cx',pt.x); el.setAttribute('cy',pt.y);
      el.setAttribute('r',0); applyAttrs(el); break;
    case 'ellipse':
      el=document.createElementNS('http://www.w3.org/2000/svg','ellipse');
      el.setAttribute('cx',pt.x); el.setAttribute('cy',pt.y);
      el.setAttribute('rx',0); el.setAttribute('ry',0);
      applyAttrs(el); break;
    case 'triangle': case 'pentagon': case 'hexagon': case 'star':
      el=document.createElementNS('http://www.w3.org/2000/svg','polygon');
      el.setAttribute('points',`${pt.x},${pt.y}`);
      applyAttrs(el); break;
  }

  if(el){
    draw.appendChild(el);
    state.currentEl=el;
    if(el.tagName==='polygon') state.elementPoints.set(el,[{x:pt.x,y:pt.y}]);
  }
}

function onPointerMove(e){
  if(!state.drawing) return;

  const drawLayer = $('#drawLayer');
  const pt = localPointFromEvent(e, drawLayer);

  // Перетягування виділеного елемента в локальних координатах drawLayer
  if(!state.currentEl && state.tool==='select' && state.selectedEl){
    const tx = pt.x - state.dragOffset.x;
    const ty = pt.y - state.dragOffset.y;
    writeTranslate(state.selectedEl, tx, ty);
    return;
  }

  const el = state.currentEl;
  if(!el) return;

  switch(state.tool){
    case 'pencil':
      el.setAttribute('d',el.getAttribute('d')+` L ${pt.x} ${pt.y}`);
      break;
    case 'line':
      el.setAttribute('x2',pt.x); el.setAttribute('y2',pt.y);
      break;
    case 'rect':
      el.setAttribute('x',Math.min(pt.x,state.startPoint.x));
      el.setAttribute('y',Math.min(pt.y,state.startPoint.y));
      el.setAttribute('width',Math.abs(pt.x-state.startPoint.x));
      el.setAttribute('height',Math.abs(pt.y-state.startPoint.y));
      break;
    case 'circle':
      el.setAttribute('r',Math.hypot(pt.x-state.startPoint.x,pt.y-state.startPoint.y));
      break;
    case 'ellipse':
      el.setAttribute('cx',(pt.x+state.startPoint.x)/2);
      el.setAttribute('cy',(pt.y+state.startPoint.y)/2);
      el.setAttribute('rx',Math.abs(pt.x-state.startPoint.x)/2);
      el.setAttribute('ry',Math.abs(pt.y-state.startPoint.y)/2);
      break;
    case 'triangle': case 'pentagon': case 'hexagon': {
      const sides = state.tool==='triangle'?3:state.tool==='pentagon'?5:6;
      const r=Math.hypot(pt.x-state.startPoint.x,pt.y-state.startPoint.y);
      const pts = regularPolygonPoints(state.startPoint.x,state.startPoint.y,r,sides,false);
      el.setAttribute('points', pts.map(p=>`${p.x},${p.y}`).join(' '));
      state.elementPoints.set(el, pts);
      break;
    }
    case 'star': {
      const r=Math.hypot(pt.x-state.startPoint.x,pt.y-state.startPoint.y);
      const pts = regularPolygonPoints(state.startPoint.x,state.startPoint.y,r,5,true);
      el.setAttribute('points', pts.map(p=>`${p.x},${p.y}`).join(' '));
      state.elementPoints.set(el, pts);
      break;
    }
    case 'polyline': {
      const pts = [...state.polyPoints, pt];
      el.setAttribute('points', pts.map(p=>`${p.x},${p.y}`).join(' '));
      state.elementPoints.set(el, pts);
      break;
    }
  }
}

function onPointerUp(){ 
  state.drawing=false; 
  if(state.tool!=='polyline'){ state.currentEl=null; state.polyPoints=[]; } 
}

function finishPolyline(){ 
  if(state.tool==='polyline' && state.currentEl){ 
    if(state.polyPoints.length>=2)
      state.currentEl.setAttribute('points',state.polyPoints.map(p=>`${p.x},${p.y}`).join(' ')); 
    state.currentEl=null; state.polyPoints=[]; state.drawing=false; 
  } 
}

// Викликати після зміни будь-якого інпута
function applyPanelChangesToSelected(){
  const el = state.selectedEl;
  if(!el) return;

  el.setAttribute('stroke', state.strokeColor);
  el.setAttribute('stroke-width', state.strokeWidth);
  if(state.strokeStyle==='dashed') el.setAttribute('stroke-dasharray','8 6');
  else if(state.strokeStyle==='dotted') el.setAttribute('stroke-dasharray','2 6');
  else el.removeAttribute('stroke-dasharray');

  if(state.noFill) el.setAttribute('fill','none');
  else el.setAttribute('fill', state.fillColor);
}

// Додаємо слухачів на інпути
;['strokeColor','strokeWidth','strokeStyle','fillColor','noFill'].forEach(id=>{
  const inp = $('#'+id);
  if(inp){
    inp.addEventListener('input', ()=>{
      switch(id){
        case 'strokeColor': state.strokeColor=inp.value; break;
        case 'strokeWidth': state.strokeWidth=+inp.value; break;
        case 'strokeStyle': state.strokeStyle=inp.value; break;
        case 'fillColor': state.fillColor=inp.value; break;
        case 'noFill': state.noFill=inp.checked; break;
      }
      applyPanelChangesToSelected();
    });
  }
});

// === UI ===
function bindUI(){
  $$('[data-tool]').forEach(btn=>btn.addEventListener('click',()=>{ 
    state.tool=btn.getAttribute('data-tool'); 
    $$('[data-tool]').forEach(b=>b.classList.remove('active')); 
    btn.classList.add('active'); 
    if(state.currentEl && state.tool!=='polyline' && state.currentEl.tagName==='polyline') finishPolyline(); 
    if(state.tool!=='select') deselect(); 
  }));

  [
    [$('#deleteSelected'),()=>{ if(state.selectedEl){ state.selectedEl.remove(); state.selectedEl=null; removeResizeHandles(); } }],
    [$('#clearAll'),()=>{ ['#drawLayer','#bgLayer','#selectionLayer'].forEach(id=>{ const el=$(id); if(el) el.innerHTML=''; }); deselect(); }]
  ].forEach(([btn,fn])=>{ if(btn) btn.addEventListener('click',fn); });

  const board = $('#board');
  if(board){
    board.addEventListener('pointerdown', onPointerDown);
    board.addEventListener('pointermove', onPointerMove);
    board.addEventListener('pointerup', onPointerUp);
    board.addEventListener('pointerleave', onPointerUp);
  }

  // приховування панелей
  const leftPanel = $('#leftPanel');
  const rightPanel = $('#rightPanel');
  const toggleLeft = $('#toggleLeft');
  const toggleRight = $('#toggleRight');
  if(toggleLeft && leftPanel){
    toggleLeft.addEventListener('click',()=>{ leftPanel.classList.toggle('hidden'); });
  }
  if(toggleRight && rightPanel){
    toggleRight.addEventListener('click',()=>{ rightPanel.classList.toggle('hidden'); });
  }

  // завантаження предметів
  const subjectSelect = $('#subjectSelect');
  const subjectPanel = $('#subjectPanel');
  if(subjectSelect){
    subjectSelect.addEventListener('change', (e)=>{
      const val = e.target.value;
      if(subjectPanel) subjectPanel.innerHTML = '';
      if(!val){
        renderDefaultRightPanel();
        return;
      }
      if(!state.loadedSubjects.has(val)){
        const s = document.createElement('script');
        s.src = `subjects/${val}.js`;
        s.onload = () => {
          if(window.loadSubjectTools && typeof window.loadSubjectTools === 'function'){
            window.loadSubjectTools(subjectPanel);
          }
        };
        s.onerror = ()=> console.warn('Не вдалося завантажити модуль предмета:', val);
        document.body.appendChild(s);
        state.loadedSubjects.add(val);
      } else {
        if(window.loadSubjectTools && typeof window.loadSubjectTools === 'function'){
          window.loadSubjectTools(subjectPanel);
        }
      }
    });
    if(!subjectSelect.value) renderDefaultRightPanel();
  }

  // перерис фон при ресайзі
  window.addEventListener('resize', ()=> {
    updateBackground();
  });

  $$('#subjects button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const subj = btn.dataset.subject;
      if(!subj || state.loadedSubjects.has(subj)) return;
      const s = document.createElement('script');
      s.src = `subjects/${subj}.js`;
      s.onload = ()=> {
        if(window.loadSubjectTools && typeof window.loadSubjectTools === 'function'){
          window.loadSubjectTools($('#subjectPanel'));
        }
      }
      document.body.appendChild(s);
      state.loadedSubjects.add(subj);
    });
  });
}

/* --- Права панель (коли предмет не обраний) --- */
function renderDefaultRightPanel(){
  const panel = $('#subjectPanel');
  if(!panel) return;
  panel.innerHTML = `
    <div class="muted" style="margin-bottom:8px">Немає обраного предмета — керування координатною сіткою та осями:</div>
    <div class="setting-row" style="display:flex;flex-direction:column;gap:8px">
      <label><input type="checkbox" id="gridToggle"> Показати сітку</label>
      <label><input type="checkbox" id="axesToggle"> Показати осі X/Y</label>
      <label>Розмір клітинки: <input type="number" id="gridSize" value="${state.grid.size}" min="5" max="500" style="width:80px"></label>
      <label><input type="checkbox" id="snapToAxes" checked> Сітка вирівняна від осей (обов'язково)</label>
      <div style="display:flex;gap:8px;align-items:center">
        <button id="setOriginBtn" class="ghost-btn" title="Встановити початок координат натисканням на полотно">Встановити початок (клік по полотну)</button>
        <button id="clearBgBtn" class="ghost-btn" title="Очистити фон">Очистити фон</button>
      </div>
      <div class="muted" style="font-size:12px;margin-top:6px">
        Порада: натисни «Встановити початок», а потім клікни по полотну, щоб задати осі в іншій позиції.
      </div>
    </div>
  `;

  const gridToggle = $('#gridToggle', panel);
  const axesToggle = $('#axesToggle', panel);
  const gridSize = $('#gridSize', panel);
  const setOriginBtn = $('#setOriginBtn', panel);
  const clearBgBtn = $('#clearBgBtn', panel);
  const snapToAxes = $('#snapToAxes', panel);

  if(gridToggle){
    gridToggle.checked = state.grid.showGrid;
    gridToggle.addEventListener('change', e=>{
      state.grid.showGrid = !!e.target.checked;
      updateBackground();
    });
  }
  if(axesToggle){
    axesToggle.checked = state.grid.showAxes;
    axesToggle.addEventListener('change', e=>{
      state.grid.showAxes = !!e.target.checked;
      updateBackground();
    });
  }
  if(gridSize){
    gridSize.addEventListener('change', e=>{
      const val = parseInt(e.target.value,10) || 50;
      state.grid.size = Math.max(5, val);
      updateBackground();
    });
  }
  if(setOriginBtn){
    setOriginBtn.addEventListener('click', ()=>{
      state.grid.setOriginMode = !state.grid.setOriginMode;
      setOriginBtn.classList.toggle('active', state.grid.setOriginMode);
      state.drawing = false;
      state.currentEl = null;
    });
  }
  if(clearBgBtn){
    clearBgBtn.addEventListener('click', ()=>{
      clearBackground();
    });
  }
  if(snapToAxes){
    snapToAxes.checked = true;
    snapToAxes.addEventListener('change', ()=>{
      updateBackground();
    });
  }

  updateBackground();
}

// (друга частина вибору предмета з твого коду — залишаю як є)
const subjectSelect = document.getElementById('subjectSelect');
const subjectPanel = document.getElementById('subjectPanel');
let currentSubjectScript = null;

if(subjectSelect){
  subjectSelect.addEventListener('change', () => {
    const value = subjectSelect.value;
    subjectPanel.innerHTML = '<p class="muted">Оберіть предмет у верхньому правому куті, щоб завантажити додаткові інструменти.</p>';
    if (currentSubjectScript) {
      document.body.removeChild(currentSubjectScript);
      currentSubjectScript = null;
    }
    if (!value) return;
    currentSubjectScript = document.createElement('script');
    currentSubjectScript.src = `${value}.js`; // наприклад geography.js
    currentSubjectScript.defer = true;
    document.body.appendChild(currentSubjectScript);
  });
}

// ===============================
//  Кінець інтеграції нових функцій
// ===============================

// Ініціалізація
document.addEventListener('DOMContentLoaded', ()=>{
  // створюємо rootView і вкладаємо шари (без змін HTML)
  ensureViewGroups();

  // переконаємось, що в DOM є необхідні групи під grid/axes
  ensureBgLayers();

  bindUI();
  
  // === Додатково: активація тачскріну ===
const board = $('#board');
if(board){
  // Забезпечуємо, що тачскрін працює коректно
  board.style.touchAction = 'none'; // блокує стандартне скролювання/зум при малюванні

  // На випадок старих браузерів: додаткові слухачі
  ['touchstart','touchmove','touchend','touchcancel'].forEach(evtName=>{
    board.addEventListener(evtName, e=>{
      // Перетворюємо touch у pointer для вже існуючого коду
      const t = e.changedTouches[0];
      const pe = new PointerEvent(evtName.replace('touch','pointer'), {
        pointerId: t.identifier,
        bubbles: true,
        cancelable: true,
        clientX: t.clientX,
        clientY: t.clientY,
        pointerType: 'touch',
      });
      e.target.dispatchEvent(pe);
      e.preventDefault();
    }, {passive:false});
  });
}






  // фонове оновлення
  updateBackground();

  // початкові трансформації (масштаби/панорамування)
  applyViewTransforms();
});

// Експортуємо корисні хелпери (фон)
window.updateBackground = updateBackground;
window.clearBackground = clearBackground;


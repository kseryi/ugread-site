
// bez-modulya.js — модуль "Без модуля", автоматично підвантажується. Додає кілька інструментів (стрілка, текст).
(function(){
  // add simple arrow and text tools to left panel
  const toolGroup = document.querySelector('#leftPanel .tool-group');
  if(!toolGroup) return;

  function createButton(dataTool, title, svgInner){
    const btn = document.createElement('button');
    btn.className = 'tool-btn';
    btn.setAttribute('data-tool', dataTool);
    btn.title = title;
    btn.setAttribute('aria-label', title);
    btn.innerHTML = svgInner;
    toolGroup.appendChild(btn);
    // ensure clicking behaves similarly to other tool buttons
    btn.addEventListener('click', ()=>{
      const ev = new Event('click');
      btn.dispatchEvent(ev);
    });
    return btn;
  }

  // arrow tool (creates an SVG group where user can draw a line — we let existing polyline tool serve,
  // but add a convenience button that switches to polyline)
  createButton('polyline','Стрілка','<svg viewBox="0 0 24 24"><path d="M2 12h18"/></svg>');

  // text tool (basic): when selected, clicking on canvas creates editable text element
  const textBtn = createButton('text','Текст','<svg viewBox="0 0 24 24"><path d="M4 6h16v2H4zM6 10h12v8H6z"/></svg>');
  textBtn.addEventListener('click', ()=>{
    // switch state.tool to 'text' (script.js listens to data-tool buttons)
    window.state = window.state || {};
    window.state.tool = 'text';
    // ensure UI highlights (simulate click behavior)
    document.querySelectorAll('[data-tool]').forEach(b=>b.classList.remove('active'));
    textBtn.classList.add('active');
  });

  // handle placing text on svg canvas
  document.addEventListener('click', (e)=>{
    if(!window.state || window.state.tool !== 'text') return;
    const board = document.getElementById('drawLayer');
    if(!board) return;
    const svg = document.getElementById('board');
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const inv = board.getScreenCTM().inverse();
    const p = pt.matrixTransform(inv);
    const text = document.createElementNS('http://www.w3.org/2000/svg','text');
    text.setAttribute('x', p.x);
    text.setAttribute('y', p.y);
    text.setAttribute('fill', window.state ? window.state.strokeColor || '#000' : '#000');
    text.setAttribute('font-size', '18');
    text.textContent = 'Нова підпис';
    board.appendChild(text);
    // exit text tool
    window.state.tool = 'select';
    document.querySelectorAll('[data-tool]').forEach(b=>b.classList.remove('active'));
  });

  // ensure default behavior: figures drawn have no fill by default
  if(window.state) window.state.noFill = true;

  console.log('bez-modulya loaded — додано інструменти: polyline, text');
})();

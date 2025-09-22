// Модуль Математики
window.SubjectModules = window.SubjectModules || {};
window.SubjectModules.math = function MathModule(ctx) {
  const { panel, svg, layers } = ctx;
  panel.innerHTML = `
    <h3>Математика</h3>
    <div class="block">
      <label>Формули:</label>
      <div class="btns">
        <button class="ghost-btn" data-eq="a^2 + b^2 = c^2">Теорема Піфагора</button>
        <button class="ghost-btn" data-eq="(a+b)^2 = a^2 + 2ab + b^2">(a+b)^2</button>
        <button class="ghost-btn" data-eq="sin^2 x + cos^2 x = 1">Тригонометрія</button>
      </div>
    </div>
    <div class="block">
      <label>Додати на дошку:</label>
      <div class="btns">
        <button id="addGrid" class="ghost-btn">Координатна сітка</button>
        <button id="addAxes" class="ghost-btn">Вісі OX/OY</button>
      </div>
    </div>
    <div class="block">
      <em class="muted">Формули додаються як текст (SVG &lt;text&gt;). Пізніше можна підключити MathJax/KaTeX локально.</em>
    </div>
  `;

  panel.querySelectorAll('[data-eq]').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = document.createElementNS('http://www.w3.org/2000/svg','text');
      text.setAttribute('x', 40);
      text.setAttribute('y', 60 + Math.random()*200);
      text.setAttribute('font-size', '20');
      text.setAttribute('fill', '#111');
      text.textContent = btn.dataset.eq;
      layers.draw.appendChild(text);
    });
  });

  panel.querySelector('#addGrid').addEventListener('click', () => addGrid(layers.bg));
  panel.querySelector('#addAxes').addEventListener('click', () => addAxes(layers.bg));

  function addGrid(bgLayer) {
    const w = svg.clientWidth || 1200;
    const h = svg.clientHeight || 800;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('opacity', '0.25');
    const step = 40;
    for (let x=0; x<w; x+=step) {
      const line = document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('x1', x); line.setAttribute('y1', 0);
      line.setAttribute('x2', x); line.setAttribute('y2', h);
      line.setAttribute('stroke', '#9ca3af'); line.setAttribute('stroke-width', '1');
      g.appendChild(line);
    }
    for (let y=0; y<h; y+=step) {
      const line = document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('x1', 0); line.setAttribute('y1', y);
      line.setAttribute('x2', w); line.setAttribute('y2', y);
      line.setAttribute('stroke', '#9ca3af'); line.setAttribute('stroke-width', '1');
      g.appendChild(line);
    }
    bgLayer.appendChild(g);
  }
  function addAxes(bgLayer) {
    const w = svg.clientWidth || 1200;
    const h = svg.clientHeight || 800;
    const cx = Math.floor(w/2), cy = Math.floor(h/2);
    const axeX = document.createElementNS('http://www.w3.org/2000/svg','line');
    axeX.setAttribute('x1', 0); axeX.setAttribute('y1', cy);
    axeX.setAttribute('x2', w); axeX.setAttribute('y2', cy);
    axeX.setAttribute('stroke', '#111'); axeX.setAttribute('stroke-width', '2');
    const axeY = document.createElementNS('http://www.w3.org/2000/svg','line');
    axeY.setAttribute('x1', cx); axeY.setAttribute('y1', 0);
    axeY.setAttribute('x2', cx); axeY.setAttribute('y2', h);
    axeY.setAttribute('stroke', '#111'); axeY.setAttribute('stroke-width', '2');
    bgLayer.appendChild(axeX); bgLayer.appendChild(axeY);
  }

  return { destroy() { panel.innerHTML = ''; } };
};

// Модуль Фізики
window.SubjectModules = window.SubjectModules || {};
window.SubjectModules.physics = function PhysicsModule(ctx) {
  const { panel, layers } = ctx;
  panel.innerHTML = `
    <h3>Фізика</h3>
    <div class="block">
      <label>Готові схеми:</label>
      <div class="btns">
        <button class="ghost-btn" data-s="circuit">Електричне коло</button>
        <button class="ghost-btn" data-s="vector">Вектори</button>
      </div>
    </div>
  `;

  panel.querySelectorAll('[data-s]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.s === 'circuit') addCircuit();
      if (btn.dataset.s === 'vector') addVectors();
    });
  });

  function addCircuit() {
    const g = document.createElementNS('http://www.w3.org/2000/svg','g');
    g.innerHTML = `
      <rect x="80" y="80" width="240" height="140" fill="none" stroke="#111" stroke-width="2"/>
      <circle cx="100" cy="150" r="12" fill="none" stroke="#111" stroke-width="2"/>
      <rect x="190" y="140" width="40" height="20" fill="none" stroke="#111" stroke-width="2"/>
      <line x1="240" y1="120" x2="240" y2="180" stroke="#111" stroke-width="2"/>
      <line x1="245" y1="120" x2="245" y2="180" stroke="#111" stroke-width="2"/>
    `;
    layers.draw.appendChild(g);
  }

  function addVectors() {
    const g = document.createElementNS('http://www.w3.org/2000/svg','g');
    g.innerHTML = `
      <line x1="100" y1="220" x2="200" y2="150" stroke="#111" stroke-width="2" marker-end="url(#arrow)"/>
      <line x1="200" y1="150" x2="300" y2="120" stroke="#111" stroke-width="2" marker-end="url(#arrow)"/>
    `;
    // додаємо маркер стрілки якщо відсутній
    ensureArrowMarker();
    layers.draw.appendChild(g);
  }

  function ensureArrowMarker() {
    const svg = document.querySelector('#board');
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
      svg.insertBefore(defs, svg.firstChild);
    }
    if (!svg.querySelector('#arrow')) {
      const marker = document.createElementNS('http://www.w3.org/2000/svg','marker');
      marker.setAttribute('id','arrow');
      marker.setAttribute('markerWidth','10');
      marker.setAttribute('markerHeight','10');
      marker.setAttribute('refX','6');
      marker.setAttribute('refY','3');
      marker.setAttribute('orient','auto');
      const path = document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d','M0,0 L0,6 L6,3 z');
      path.setAttribute('fill','#111');
      marker.appendChild(path);
      defs.appendChild(marker);
    }
  }

  return { destroy(){ panel.innerHTML = ''; } };
};

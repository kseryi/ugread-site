// Модуль Історії
window.SubjectModules = window.SubjectModules || {};
window.SubjectModules.history = function HistoryModule(ctx) {
  const { panel, layers } = ctx;
  panel.innerHTML = `
    <h3>Історія</h3>
    <div class="block">
      <div class="btns">
        <label class="ghost-btn">
          Історична карта (SVG)
          <input id="histSvg" type="file" accept=".svg" style="display:none">
        </label>
        <label class="ghost-btn">
          3D карта (GLB)
          <input id="histGlb" type="file" accept=".glb,.gltf" style="display:none">
        </label>
      </div>
      <p class="muted">SVG буде фоном. GLB поки додається як мітка (3D), повноцінний перегляд додамо пізніше.</p>
    </div>
  `;

  panel.querySelector('#histSvg').addEventListener('change', async (e) => {
    const f = e.target.files[0]; if (!f) return;
    const text = await f.text();
    const wrapper = document.createElementNS('http://www.w3.org/2000/svg','g');
    wrapper.innerHTML = text;
    layers.bg.innerHTML = '';
    layers.bg.appendChild(wrapper);
  });

  panel.querySelector('#histGlb').addEventListener('change', async (e) => {
    const f = e.target.files[0]; if (!f) return;
    const t = document.createElementNS('http://www.w3.org/2000/svg','text');
    t.setAttribute('x', 120); t.setAttribute('y', 120);
    t.setAttribute('font-size', '22'); t.setAttribute('fill', '#7c3aed');
    t.textContent = `3D карта: ${f.name}`;
    layers.draw.appendChild(t);
  });

  return { destroy(){ panel.innerHTML = ''; } };
};

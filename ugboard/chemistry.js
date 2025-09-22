// Модуль Хімії
window.SubjectModules = window.SubjectModules || {};
window.SubjectModules.chemistry = function ChemistryModule(ctx) {
  const { panel, layers } = ctx;
  panel.innerHTML = `
    <h3>Хімія</h3>
    <div class="block">
      <div class="btns">
        <label class="ghost-btn">
          Завантажити модель (GLB)
          <input id="glbFile" type="file" accept=".glb,.gltf" style="display:none">
        </label>
        <button id="addTable" class="ghost-btn">Таблиця елементів</button>
      </div>
      <p class="muted">Для повноцінного 3D-перегляду підключимо локально three.js пізніше. Поки що модель додається як "іконка" на дошку.</p>
    </div>
  `;

  panel.querySelector('#glbFile').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    // Тимчасовий плейсхолдер: додаємо значок "3D" на дошку
    const text = document.createElementNS('http://www.w3.org/2000/svg','text');
    text.setAttribute('x', 80 + Math.random()*200);
    text.setAttribute('y', 100 + Math.random()*200);
    text.setAttribute('font-size', '22');
    text.setAttribute('fill', '#0f766e');
    text.textContent = `3D: ${f.name}`;
    layers.draw.appendChild(text);
  });

  panel.querySelector('#addTable').addEventListener('click', () => {
    // Мінімальний інформаційний блок про елемент (заглушка)
    const group = document.createElementNS('http://www.w3.org/2000/svg','g');
    const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute('x', 60); rect.setAttribute('y', 60);
    rect.setAttribute('width', 200); rect.setAttribute('height', 100);
    rect.setAttribute('fill', '#ffffff'); rect.setAttribute('stroke', '#3b82f6');
    const t1 = document.createElementNS('http://www.w3.org/2000/svg','text');
    t1.setAttribute('x', 70); t1.setAttribute('y', 90);
    t1.textContent = 'H — Гідроген';
    const t2 = document.createElementNS('http://www.w3.org/2000/svg','text');
    t2.setAttribute('x', 70); t2.setAttribute('y', 115);
    t2.textContent = 'A=1, Z=1, e-: 1';
    group.appendChild(rect); group.appendChild(t1); group.appendChild(t2);
    layers.draw.appendChild(group);
  });

  return { destroy(){ panel.innerHTML = ''; } };
};

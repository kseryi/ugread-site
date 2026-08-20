window.addEventListener('error', (event) => {
  let banner = document.getElementById('fatalErrorBanner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'fatalErrorBanner';
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#e74c3c;color:#fff;padding:12px 16px;font-family:sans-serif;font-size:0.9rem;';
    document.body.appendChild(banner);
  }
  banner.textContent = `Помилка скрипта: ${event.message} (${event.filename ? event.filename.split('/').pop() : ''}:${event.lineno})`;
});

window.addEventListener('DOMContentLoaded', () => {
  if (typeof AFRAME === 'undefined') {
    const banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#e74c3c;color:#fff;padding:12px 16px;font-family:sans-serif;font-size:0.9rem;';
    banner.textContent = 'Бібліотека A-Frame не завантажилась (https://aframe.io) — перевірте інтернет-з’єднання та відкрийте index.html через реальний браузер, а не в пісочниці без доступу до мережі.';
    document.body.appendChild(banner);
    return;
  }

  const MAX_ATOMIC_NUMBER = 20;
  const NUCLEUS_TARGET = { x: 0, y: 1.6, z: -3 };

  let atomicNumber = 3;
  let trailsEnabled = true;
  let nucleusDetailedView = true;
  let viewMode = 'classic'; // 'classic' | 'shell'

  const nucleusEl = document.querySelector('#nucleus');
  const orbitsEl = document.querySelector('#orbits');
  const protonCountEl = document.getElementById('protonCount');
  const neutronCountEl = document.getElementById('neutronCount');
  const electronCountEl = document.getElementById('electronCount');
  const elementNameEl = document.getElementById('elementName');
  const atomicNumberEl = document.getElementById('atomicNumber');
  const toggleTrailsCheckbox = document.getElementById('toggleTrails');
  const toggleThemeCheckbox = document.getElementById('toggleTheme');
  const toggleNucleusViewCheckbox = document.getElementById('toggleNucleusView');
  const mainSceneEl = document.getElementById('mainScene');
  const mainCameraEl = document.getElementById('mainCamera');
  const shellLegendEl = document.getElementById('shellLegend');

  const sceneContainer = document.getElementById('sceneContainer');
  const constructorView = document.getElementById('constructorView');
  const tabButtons = document.querySelectorAll('.tabBtn');

  // ---------- Дані про елементи (Z 1-20) ----------
  const elementsData = {
    1: { symbol: 'H', name: 'Гідроген' },
    2: { symbol: 'He', name: 'Гелій' },
    3: { symbol: 'Li', name: 'Літій' },
    4: { symbol: 'Be', name: 'Берилій' },
    5: { symbol: 'B', name: 'Бор' },
    6: { symbol: 'C', name: 'Карбон' },
    7: { symbol: 'N', name: 'Нітроген' },
    8: { symbol: 'O', name: 'Оксиген' },
    9: { symbol: 'F', name: 'Флуор' },
    10: { symbol: 'Ne', name: 'Неон' },
    11: { symbol: 'Na', name: 'Натрій' },
    12: { symbol: 'Mg', name: 'Магній' },
    13: { symbol: 'Al', name: 'Алюміній' },
    14: { symbol: 'Si', name: 'Силіцій' },
    15: { symbol: 'P', name: 'Фосфор' },
    16: { symbol: 'S', name: 'Сульфур' },
    17: { symbol: 'Cl', name: 'Хлор' },
    18: { symbol: 'Ar', name: 'Аргон' },
    19: { symbol: 'K', name: 'Калій' },
    20: { symbol: 'Ca', name: 'Кальцій' },
  };

  function getElementLabel(Z) {
    const el = elementsData[Z];
    return el ? `${el.name} (${el.symbol})` : '-';
  }

  const exceptions = {
    1: { neutrons: 0 },
    3: { neutrons: 4 },
    4: { neutrons: 5 },
    9: { neutrons: 10 },
  };

  function getElementData(Z) {
    const protons = Z;
    const electrons = Z;
    if (exceptions[Z]) {
      return { protons, neutrons: exceptions[Z].neutrons, electrons };
    }
    return { protons, neutrons: Z, electrons };
  }

  // Ємності енергетичних оболонок K, L, M, N (спрощена модель, коректна для Z 1-20)
  const SHELL_CAPACITIES = [2, 8, 8, 2];
  const SHELL_COLORS = ['#4eaaff', '#7ee787', '#ffb454', '#ff6b9d'];
  const SHELL_LABELS = ['K', 'L', 'M', 'N'];

  function getShellConfiguration(eCount) {
    let remaining = eCount;
    const shells = [];
    for (const cap of SHELL_CAPACITIES) {
      if (remaining <= 0) break;
      const c = Math.min(cap, remaining);
      shells.push(c);
      remaining -= c;
    }
    return shells;
  }

  function updateShellLegend(shells) {
    if (viewMode !== 'shell') {
      shellLegendEl.classList.add('hidden');
      return;
    }
    shellLegendEl.classList.remove('hidden');
    shellLegendEl.innerHTML = shells.map((count, i) => `
      <div class="shellLegendItem">
        <span class="shellLegendDot" style="background-color:${SHELL_COLORS[i]}"></span>
        <span>Оболонка ${SHELL_LABELS[i]}: ${count} е⁻</span>
      </div>
    `).join('');
  }

  // Кути нахилу орбітальних площин — використовуються і класичною, і сферичною
  // енергетичною моделлю, щоб електрони вкривали всю сферу, а не одну площину.
  const tiltAngles = [
    { x: 0, z: 0 },
    { x: 45, z: 20 },
    { x: 30, z: 60 },
    { x: 60, z: 120 },
    { x: 75, z: 45 },
    { x: 15, z: 90 },
    { x: 50, z: 30 },
    { x: 35, z: 75 },
    { x: 90, z: 10 },
    { x: 20, z: 150 },
  ];

  function randomPointInSphere(R) {
    let u = Math.random();
    let v = Math.random();
    let theta = 2 * Math.PI * u;
    let phi = Math.acos(2 * v - 1);
    let r = R * Math.cbrt(Math.random());
    let x = r * Math.sin(phi) * Math.cos(theta);
    let y = r * Math.sin(phi) * Math.sin(theta);
    let z = r * Math.cos(phi);
    return `${x.toFixed(3)} ${y.toFixed(3)} ${z.toFixed(3)}`;
  }

  function createSphere(color, radius, position) {
    const sphere = document.createElement('a-sphere');
    sphere.setAttribute('color', color);
    sphere.setAttribute('radius', radius);
    sphere.setAttribute('position', position);
    sphere.setAttribute('material', 'opacity', 1);
    return sphere;
  }

  // =========================================================
  // ---------- Обертання камери навколо атома (орбіта) ----------
  // ---------- Реалізовано через "риг": батьківський елемент стоїть -----------
  // ---------- у центрі атома і обертається; камера — його дитина на -----------
  // ---------- фіксованій відстані вздовж локальної осі Z, тому вона -----------
  // ---------- завжди автоматично дивиться в центр рига без ручних -----------
  // ---------- обчислень напрямку погляду. -----------
  // =========================================================
  function initOrbitCamera(sceneEl, rigEl, cameraEl, initialRadius) {
    let radius = initialRadius;
    let yawDeg = 0;
    let pitchDeg = 0;
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    const minRadius = 1.4;
    const maxRadius = 9;
    const maxPitch = 85;

    function updateRig() {
      rigEl.setAttribute('rotation', `${pitchDeg} ${yawDeg} 0`);
    }

    function updateZoom() {
      cameraEl.setAttribute('position', `0 0 ${radius.toFixed(3)}`);
    }

    function getPoint(e) {
      return e.touches && e.touches.length ? e.touches[0] : e;
    }

    function onPointerDown(e) {
      isDragging = true;
      const p = getPoint(e);
      lastX = p.clientX;
      lastY = p.clientY;
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      const p = getPoint(e);
      const dx = p.clientX - lastX;
      const dy = p.clientY - lastY;
      lastX = p.clientX;
      lastY = p.clientY;
      yawDeg -= dx * 0.3;
      pitchDeg -= dy * 0.3;
      pitchDeg = Math.max(-maxPitch, Math.min(maxPitch, pitchDeg));
      updateRig();
      if (e.cancelable) e.preventDefault();
    }

    function onPointerUp() {
      isDragging = false;
    }

    function onWheel(e) {
      e.preventDefault();
      radius += e.deltaY * 0.0025 * radius;
      radius = Math.max(minRadius, Math.min(maxRadius, radius));
      updateZoom();
    }

    sceneEl.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    sceneEl.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
    sceneEl.addEventListener('wheel', onWheel, { passive: false });
    sceneEl.style.cursor = 'grab';
    sceneEl.addEventListener('mousedown', () => { sceneEl.style.cursor = 'grabbing'; });
    window.addEventListener('mouseup', () => { sceneEl.style.cursor = 'grab'; });

    updateRig();
    updateZoom();
  }

  const mainCameraRigEl = document.getElementById('mainCameraRig');

  function setupMainCamera() {
    initOrbitCamera(mainSceneEl, mainCameraRigEl, mainCameraEl, 3);
  }
  if (mainSceneEl.hasLoaded) {
    setupMainCamera();
  } else {
    mainSceneEl.addEventListener('loaded', setupMainCamera);
  }

  // =========================================================
  // ---------- Ядро ----------
  // =========================================================
  let simplifiedNucleusSphere = null;

  function createNucleus(protonCount, neutronCount) {
    const totalParticles = protonCount + neutronCount;
    const nucleusRadius = 0.1 * Math.cbrt(totalParticles);
    nucleusEl.innerHTML = '';

    if (nucleusDetailedView) {
      simplifiedNucleusSphere?.remove();
      simplifiedNucleusSphere = null;

      for (let i = 0; i < totalParticles; i++) {
        const pos = randomPointInSphere(nucleusRadius);
        const color = i < protonCount ? '#ff4444' : '#888888';
        const sphere = createSphere(color, 0.1, pos);
        nucleusEl.appendChild(sphere);
      }
    } else {
      nucleusEl.innerHTML = '';
      if (!simplifiedNucleusSphere) {
        simplifiedNucleusSphere = document.createElement('a-sphere');
        simplifiedNucleusSphere.setAttribute('color', '#ff6600');
        simplifiedNucleusSphere.setAttribute('radius', nucleusRadius);
        simplifiedNucleusSphere.setAttribute('position', '0 0 0');
        simplifiedNucleusSphere.setAttribute('material', 'opacity', 1);
        nucleusEl.appendChild(simplifiedNucleusSphere);
      }
    }
  }

  let nucleusRotationAngle = 0;
  function toRad(angle) {
    return angle * Math.PI / 180;
  }

  function rotateNucleus() {
    nucleusRotationAngle += 0.1;
    if (nucleusEl.object3D) {
      nucleusEl.object3D.rotation.y = toRad(nucleusRotationAngle);
    }
    requestAnimationFrame(rotateNucleus);
  }

  // =========================================================
  // ---------- Електрони ----------
  // =========================================================
  let electronsData = [];
  let orbitRotationAngle = 0;

  function addTrailSpheres(orbitRadius, color) {
    const trailCount = 10;
    const trailSpheres = [];
    if (trailsEnabled) {
      for (let t = 0; t < trailCount; t++) {
        const trailSphere = createSphere(color, 0.07, `${orbitRadius} 0 0`);
        trailSphere.setAttribute('material', 'opacity', 0);
        trailSphere.setAttribute('material', 'transparent', true);
        orbitsEl.appendChild(trailSphere);
        trailSpheres.push(trailSphere);
      }
    }
    return trailSpheres;
  }

  // ---------- Класична (орбітальна) модель ----------
  function createElectronsClassic(eCount) {
    for (let i = 0; i < eCount; i++) {
      const orbitRadius = 0.6 + 0.15 * Math.floor(i / 2);
      const tilt = tiltAngles[i % tiltAngles.length];

      const orbit = document.createElement('a-entity');
      orbit.setAttribute('position', '0 1.6 -3');
      orbit.setAttribute('rotation', `${tilt.x} 0 ${tilt.z}`);

      const electron = createSphere('#3399ff', 0.07, `${orbitRadius} 0 0`);
      orbit.appendChild(electron);
      orbitsEl.appendChild(orbit);

      const trailSpheres = addTrailSpheres(orbitRadius, '#3399ff');

      electronsData.push({
        orbit,
        electron,
        trailSpheres,
        orbitRadius,
        angle: Math.random() * 2 * Math.PI,
        angularSpeed: -(0.0015 + 0.0003 * i),
        positions: [],
        orbitIndex: i,
        driftEnabled: true,
      });
    }
    updateShellLegend([]);
  }

  // ---------- Енергетична модель (сферичні оболонки Бора) ----------
  // Кожна оболонка — це сферична "хмара" з кількох нахилених кругових орбіт
  // однакового радіуса, що разом вкривають поверхню сфери навколо ядра.
  function createElectronsShell(eCount) {
    const shells = getShellConfiguration(eCount);
    updateShellLegend(shells);

    let globalIndex = 0;
    shells.forEach((count, shellIndex) => {
      const orbitRadius = 0.55 + shellIndex * 0.42;
      const color = SHELL_COLORS[shellIndex % SHELL_COLORS.length];

      // Суцільна сфера з прозорістю 80% — межа енергетичної оболонки;
      // електрони рухаються по її поверхні.
      const shellSphere = document.createElement('a-sphere');
      shellSphere.setAttribute('position', '0 1.6 -3');
      shellSphere.setAttribute('radius', orbitRadius);
      shellSphere.setAttribute('color', color);
      shellSphere.setAttribute('segments-width', 24);
      shellSphere.setAttribute('segments-height', 18);
      shellSphere.setAttribute('material', 'opacity', 0.2);
      shellSphere.setAttribute('material', 'transparent', true);
      shellSphere.setAttribute('material', 'side', 'double');
      shellSphere.setAttribute('material', 'shader', 'flat');
      orbitsEl.appendChild(shellSphere);

      for (let i = 0; i < count; i++) {
        // Розподіляємо орбіти цієї оболонки по різних нахилених площинах,
        // а також зсуваємо стартовий кут — так електрони вкривають всю сферу.
        const tilt = tiltAngles[i % tiltAngles.length];
        const yawOffset = (360 / count) * i;

        const orbit = document.createElement('a-entity');
        orbit.setAttribute('position', '0 1.6 -3');
        orbit.setAttribute('rotation', `${tilt.x} ${yawOffset} ${tilt.z}`);

        const electron = createSphere(color, 0.075, `${orbitRadius} 0 0`);
        orbit.appendChild(electron);
        orbitsEl.appendChild(orbit);

        const trailSpheres = addTrailSpheres(orbitRadius, color);

        electronsData.push({
          orbit,
          electron,
          trailSpheres,
          orbitRadius,
          angle: Math.random() * 2 * Math.PI,
          angularSpeed: -(0.0012 + 0.0002 * shellIndex),
          positions: [],
          orbitIndex: globalIndex,
          driftEnabled: false,
        });
        globalIndex++;
      }
    });
  }

  function createElectrons(eCount) {
    orbitsEl.innerHTML = '';
    electronsData = [];

    if (viewMode === 'shell') {
      createElectronsShell(eCount);
    } else {
      createElectronsClassic(eCount);
    }
  }

  function animateElectrons() {
    orbitRotationAngle -= 0.15;

    electronsData.forEach((e) => {
      e.angle += e.angularSpeed * 16;
      if (e.angle < 0) e.angle += 2 * Math.PI;

      if (e.driftEnabled) {
        const orbitRotation = orbitRotationAngle + e.orbitIndex * 15;
        e.orbit.object3D.rotation.y = THREE.MathUtils.degToRad(orbitRotation);
      }

      const x = e.orbitRadius * Math.cos(e.angle);
      const z = e.orbitRadius * Math.sin(e.angle);
      e.electron.setAttribute('position', `${x.toFixed(3)} 0 ${z.toFixed(3)}`);

      const posVec = new AFRAME.THREE.Vector3();
      e.electron.object3D.getWorldPosition(posVec);

      e.positions.unshift(posVec.clone());
      if (e.positions.length > e.trailSpheres.length) {
        e.positions.pop();
      }

      e.trailSpheres.forEach((sphere, idx) => {
        if (trailsEnabled && e.positions[idx]) {
          sphere.object3D.position.copy(e.positions[idx]);
          const opacity = 1 - idx / e.trailSpheres.length;
          sphere.setAttribute('material', 'opacity', opacity);
          sphere.setAttribute('visible', true);
        } else {
          sphere.setAttribute('material', 'opacity', 0);
          sphere.setAttribute('visible', false);
        }
      });
    });

    requestAnimationFrame(animateElectrons);
  }

  function clearAtom() {
    nucleusEl.innerHTML = '';
    orbitsEl.innerHTML = '';
    electronsData = [];
    simplifiedNucleusSphere = null;
  }

  function updateAtom() {
    clearAtom();
    if (atomicNumber < 1) atomicNumber = 1;
    if (atomicNumber > MAX_ATOMIC_NUMBER) atomicNumber = MAX_ATOMIC_NUMBER;

    const { protons, neutrons, electrons } = getElementData(atomicNumber);
    createNucleus(protons, neutrons);
    createElectrons(electrons);

    protonCountEl.textContent = protons;
    neutronCountEl.textContent = neutrons;
    electronCountEl.textContent = electrons;
    elementNameEl.textContent = getElementLabel(atomicNumber);
    atomicNumberEl.textContent = `Z = ${atomicNumber}`;
  }

  toggleTrailsCheckbox.addEventListener('change', (e) => {
    trailsEnabled = e.target.checked;
    updateAtom();
  });

  toggleThemeCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      document.body.classList.add('light-theme');
      mainSceneEl.setAttribute('background', 'color: #f0f8ff');
      document.getElementById('ctorScene').setAttribute('background', 'color: #f0f8ff');
    } else {
      document.body.classList.remove('light-theme');
      mainSceneEl.setAttribute('background', 'color: #222');
      document.getElementById('ctorScene').setAttribute('background', 'color: #222');
    }
  });

  toggleNucleusViewCheckbox.addEventListener('change', (e) => {
    nucleusDetailedView = e.target.checked;
    updateAtom();
  });

  document.getElementById('increase').addEventListener('click', () => {
    if (atomicNumber < MAX_ATOMIC_NUMBER) {
      atomicNumber++;
      updateAtom();
    }
  });

  document.getElementById('decrease').addEventListener('click', () => {
    if (atomicNumber > 1) {
      atomicNumber--;
      updateAtom();
    }
  });

  // ---------- Перемикання вкладок ----------
  const dragHintEl = document.getElementById('dragHint');
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      tabButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      if (tab === 'constructor') {
        sceneContainer.classList.add('hidden');
        constructorView.classList.remove('hidden');
        // Сцена конструктора могла ініціалізуватись, поки вкладка була
        // прихована (display:none), через що WebGL-канвас отримав розмір
        // 0x0. Примусово перераховуємо розмір тепер, коли вкладка видима.
        requestAnimationFrame(() => {
          if (ctorSceneEl.resize) ctorSceneEl.resize();
          window.dispatchEvent(new Event('resize'));
        });
      } else {
        constructorView.classList.add('hidden');
        sceneContainer.classList.remove('hidden');
        viewMode = tab; // 'classic' | 'shell'
        dragHintEl.textContent = viewMode === 'shell'
          ? 'Затисніть та тягніть — обертання навколо атома. Колесо миші — наближення.'
          : 'Затисніть та тягніть — обертання. Колесо миші — наближення.';
        updateAtom();
        requestAnimationFrame(() => {
          if (mainSceneEl.resize) mainSceneEl.resize();
          window.dispatchEvent(new Event('resize'));
        });
      }
    });
  });

  // Початкові налаштування
  toggleTrailsCheckbox.checked = true;
  toggleThemeCheckbox.checked = false;
  toggleNucleusViewCheckbox.checked = true;
  mainSceneEl.setAttribute('background', 'color: #222');

  updateAtom();
  rotateNucleus();
  animateElectrons();

  // =========================================================
  // ---------- Конструктор атома (3D, drag & drop) ----------
  // =========================================================
  const ctorSceneEl = document.getElementById('ctorScene');
  const ctorCameraEl = document.getElementById('ctorCamera');
  const ctorNucleusEl = document.getElementById('ctorNucleus');
  const ctorOrbitsEl = document.getElementById('ctorOrbits');
  const ctorSceneWrap = document.getElementById('constructorSceneWrap');
  const ctorDragHint = document.getElementById('ctorDragHint');

  const protonChip = document.getElementById('protonChip');
  const neutronChip = document.getElementById('neutronChip');
  const electronChip = document.getElementById('electronChip');
  const minusButtons = document.querySelectorAll('.minusBtn');
  const clearNucleusBtn = document.getElementById('clearNucleusBtn');

  const ctorProtonsEl = document.getElementById('ctorProtons');
  const ctorNeutronsEl = document.getElementById('ctorNeutrons');
  const ctorMassEl = document.getElementById('ctorMass');
  const ctorElectronsEl = document.getElementById('ctorElectrons');
  const ctorChargeEl = document.getElementById('ctorCharge');
  const ctorElementEl = document.getElementById('ctorElement');
  const stabilityBox = document.getElementById('stabilityBox');

  const ctorCameraRigEl = document.getElementById('ctorCameraRig');

  function setupCtorCamera() {
    initOrbitCamera(ctorSceneEl, ctorCameraRigEl, ctorCameraEl, 3.4);
  }
  if (ctorSceneEl.hasLoaded) {
    setupCtorCamera();
  } else {
    ctorSceneEl.addEventListener('loaded', setupCtorCamera);
  }

  const MAX_CTOR_PROTONS = MAX_ATOMIC_NUMBER;
  const MAX_CTOR_NEUTRONS = 30;
  const MAX_CTOR_ELECTRONS = 20;

  let ctorProtons = 0;
  let ctorNeutrons = 0;
  let ctorElectronCount = 0;
  let ctorElectronsData = [];
  let ctorNucleusRotationAngle = 0;
  let ctorOrbitRotationAngle = 0;

  // Стабільні ізотопи (кількість нейтронів) для Z 1-20 — спрощена таблиця
  const stableIsotopes = {
    1: [0, 1],
    2: [1, 2],
    3: [3, 4],
    4: [5],
    5: [5, 6],
    6: [6, 7],
    7: [7, 8],
    8: [8, 9, 10],
    9: [10],
    10: [10, 11, 12],
    11: [12],
    12: [12, 13, 14],
    13: [14],
    14: [14, 15, 16],
    15: [16],
    16: [16, 17, 18, 20],
    17: [18, 20],
    18: [18, 20, 22],
    19: [20, 22],
    20: [20, 22, 23, 24, 26],
  };

  function checkStability(protons, neutrons) {
    const mass = protons + neutrons;

    if (protons === 0 && neutrons === 0) {
      return { status: 'empty', text: 'Додайте протони та нейтрони, щоб побачити результат' };
    }
    if (protons === 0) {
      return { status: 'unstable', text: 'Це ще не атом: вільні нейтрони нестабільні і розпадаються приблизно за 15 хвилин (немає жодного протона)' };
    }
    if (protons > MAX_ATOMIC_NUMBER) {
      return { status: 'unknown', text: `Поза межами таблиці цього конструктора (Z ≤ ${MAX_ATOMIC_NUMBER})` };
    }

    const elem = elementsData[protons];
    const symbol = elem ? elem.symbol : '?';
    const name = elem ? elem.name : 'Невідомий елемент';
    const stableList = stableIsotopes[protons] || [];

    if (stableList.includes(neutrons)) {
      return { status: 'stable', text: `Стабільний ізотоп: ${symbol}-${mass} (${name}). Це ядро існує в природі і не розпадається.` };
    }

    const ratio = neutrons / protons;

    if (protons > 2 && neutrons === 0) {
      return { status: 'impossible', text: `${name} без жодного нейтрона: сили відштовхування протонів руйнують ядро миттєво.` };
    }
    if (ratio > 2.2 || ratio < 0.4) {
      return { status: 'impossible', text: 'Занадто велика невідповідність протонів і нейтронів — таке ядро миттєво розпадається (не існує).' };
    }

    return { status: 'radioactive', text: `Радіоактивний ізотоп: ${symbol}-${mass} (${name}). Таке ядро може існувати, але воно нестабільне і з часом розпадається.` };
  }

  function ctorRebuildNucleus() {
    ctorNucleusEl.innerHTML = '';
    const total = ctorProtons + ctorNeutrons;
    if (total === 0) return;
    const nucleusRadius = 0.1 * Math.cbrt(total);
    for (let i = 0; i < total; i++) {
      const pos = randomPointInSphere(nucleusRadius);
      const color = i < ctorProtons ? '#ff4444' : '#888888';
      const sphere = createSphere(color, 0.1, pos);
      ctorNucleusEl.appendChild(sphere);
    }
  }

  function ctorRebuildElectrons() {
    ctorOrbitsEl.innerHTML = '';
    ctorElectronsData = [];
    for (let i = 0; i < ctorElectronCount; i++) {
      const orbitRadius = 0.6 + 0.15 * Math.floor(i / 2);
      const tilt = tiltAngles[i % tiltAngles.length];

      const orbit = document.createElement('a-entity');
      orbit.setAttribute('position', '0 1.6 -3');
      orbit.setAttribute('rotation', `${tilt.x} 0 ${tilt.z}`);

      const electron = createSphere('#3399ff', 0.075, `${orbitRadius} 0 0`);
      orbit.appendChild(electron);
      ctorOrbitsEl.appendChild(orbit);

      ctorElectronsData.push({
        orbit,
        electron,
        orbitRadius,
        angle: Math.random() * 2 * Math.PI,
        angularSpeed: -(0.0015 + 0.0003 * i),
        orbitIndex: i,
      });
    }
  }

  function animateCtorElectrons() {
    ctorOrbitRotationAngle -= 0.15;
    ctorElectronsData.forEach((e) => {
      e.angle += e.angularSpeed * 16;
      if (e.angle < 0) e.angle += 2 * Math.PI;

      if (e.orbit.object3D) {
        const orbitRotation = ctorOrbitRotationAngle + e.orbitIndex * 15;
        e.orbit.object3D.rotation.y = THREE.MathUtils.degToRad(orbitRotation);
      }

      const x = e.orbitRadius * Math.cos(e.angle);
      const z = e.orbitRadius * Math.sin(e.angle);
      e.electron.setAttribute('position', `${x.toFixed(3)} 0 ${z.toFixed(3)}`);
    });
    requestAnimationFrame(animateCtorElectrons);
  }

  function rotateCtorNucleus() {
    ctorNucleusRotationAngle += 0.1;
    if (ctorNucleusEl.object3D) {
      ctorNucleusEl.object3D.rotation.y = toRad(ctorNucleusRotationAngle);
    }
    requestAnimationFrame(rotateCtorNucleus);
  }

  function updateConstructorInfo() {
    ctorDragHint.style.display = (ctorProtons + ctorNeutrons + ctorElectronCount) === 0 ? 'block' : 'none';

    ctorProtonsEl.textContent = ctorProtons;
    ctorNeutronsEl.textContent = ctorNeutrons;
    ctorMassEl.textContent = ctorProtons + ctorNeutrons;
    ctorElectronsEl.textContent = ctorElectronCount;

    const charge = ctorProtons - ctorElectronCount;
    ctorChargeEl.textContent = charge > 0 ? `+${charge}` : `${charge}`;
    ctorElementEl.textContent = ctorProtons > 0 ? getElementLabel(ctorProtons) : '-';

    const result = checkStability(ctorProtons, ctorNeutrons);
    stabilityBox.textContent = result.text;
    stabilityBox.className = `stability-${result.status}`;
  }

  function ctorAddParticle(type) {
    if (type === 'proton') {
      if (ctorProtons >= MAX_CTOR_PROTONS) return;
      ctorProtons++;
      ctorRebuildNucleus();
    } else if (type === 'neutron') {
      if (ctorNeutrons >= MAX_CTOR_NEUTRONS) return;
      ctorNeutrons++;
      ctorRebuildNucleus();
    } else if (type === 'electron') {
      if (ctorElectronCount >= MAX_CTOR_ELECTRONS) return;
      ctorElectronCount++;
      ctorRebuildElectrons();
    }
    updateConstructorInfo();
  }

  function ctorRemoveParticle(type) {
    if (type === 'proton' && ctorProtons > 0) {
      ctorProtons--;
      ctorRebuildNucleus();
    } else if (type === 'neutron' && ctorNeutrons > 0) {
      ctorNeutrons--;
      ctorRebuildNucleus();
    } else if (type === 'electron' && ctorElectronCount > 0) {
      ctorElectronCount--;
      ctorRebuildElectrons();
    }
    updateConstructorInfo();
  }

  function ctorClearAll() {
    ctorProtons = 0;
    ctorNeutrons = 0;
    ctorElectronCount = 0;
    ctorRebuildNucleus();
    ctorRebuildElectrons();
    updateConstructorInfo();
  }

  // Клік по частинці в палітрі одразу додає її
  protonChip.addEventListener('click', () => ctorAddParticle('proton'));
  neutronChip.addEventListener('click', () => ctorAddParticle('neutron'));
  electronChip.addEventListener('click', () => ctorAddParticle('electron'));

  minusButtons.forEach((btn) => {
    btn.addEventListener('click', () => ctorRemoveParticle(btn.dataset.type));
  });

  // Drag & drop у 3D-сцену конструктора
  [protonChip, neutronChip, electronChip].forEach((chip) => {
    chip.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', chip.dataset.type);
      e.dataTransfer.effectAllowed = 'copy';
    });
  });

  ctorSceneWrap.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    ctorSceneWrap.classList.add('dragOver');
  });

  ctorSceneWrap.addEventListener('dragleave', () => {
    ctorSceneWrap.classList.remove('dragOver');
  });

  ctorSceneWrap.addEventListener('drop', (e) => {
    e.preventDefault();
    ctorSceneWrap.classList.remove('dragOver');
    const type = e.dataTransfer.getData('text/plain');
    if (type === 'proton' || type === 'neutron' || type === 'electron') {
      ctorAddParticle(type);
    }
  });

  clearNucleusBtn.addEventListener('click', ctorClearAll);

  updateConstructorInfo();
  rotateCtorNucleus();
  animateCtorElectrons();
});

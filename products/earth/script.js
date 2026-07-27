// ==========================================================================
// 3D-модель внутрішньої будови Землі — Three.js
// Глобус складається з двох частин: "Основне тіло" (270°) та "Сектор" (90°),
// які разом утворюють цілісну сферу. Сектор можна від'єднати анімацією,
// щоб побачити кольорові шари: кора, мантія, зовнішнє та внутрішнє ядро.
// ==========================================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ---------------------------------------------------------------------
// 1. КОНСТАНТИ: радіуси шарів та кольори
// ---------------------------------------------------------------------
const CRUST_R = 5.0;        // Земна кора (зовнішня поверхня з текстурою)
const MANTLE_R = 4.55;      // Мантія
const OUTER_CORE_R = 3.0;   // Зовнішнє ядро (рідке)
const INNER_CORE_R = 1.3;   // Внутрішнє ядро (тверде)

const COLOR_MANTLE = 0xe0431a;      // магмовий червоно-помаранчевий
const COLOR_OUTER_CORE = 0xff8c1a;  // помаранчевий (рідкий метал)
const COLOR_INNER_CORE = 0xfff2a0;  // яскраво-жовтий/білий (тверде ядро)

const TWO_PI = Math.PI * 2;

// Кутовий розмір "сектора" (шматок торта) — чверть сфери
const SECTOR_PHI_LENGTH = Math.PI * 0.5;          // 90°
const SECTOR_PHI_START = Math.PI * 1.5;           // починається там, де закінчується основне тіло
const MAIN_PHI_START = 0;
const MAIN_PHI_LENGTH = Math.PI * 1.5;            // 270°

// ---------------------------------------------------------------------
// 2. БАЗОВЕ НАЛАШТУВАННЯ СЦЕНИ, КАМЕРИ, РЕНДЕРЕРА
// ---------------------------------------------------------------------
const container = document.getElementById('scene-container');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // повністю чорний космічний фон

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 3, 14);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

// ---------------------------------------------------------------------
// 3. КЕРУВАННЯ КАМЕРОЮ (OrbitControls)
// ---------------------------------------------------------------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 6;
controls.maxDistance = 30;
controls.enablePan = false;

// ---------------------------------------------------------------------
// 4. ОСВІТЛЕННЯ
// ---------------------------------------------------------------------
const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
dirLight.position.set(8, 6, 10);
scene.add(dirLight);

// Слабке "тепле" підсвічування знизу, що імітує світіння розплавленого ядра
const coreGlow = new THREE.PointLight(0xff7a33, 1.2, 25);
coreGlow.position.set(0, 0, 0);
scene.add(coreGlow);

// ---------------------------------------------------------------------
// 5. ЗІРКОВЕ НЕБО (декоративні частинки на фоні)
// ---------------------------------------------------------------------
function createStarField() {
  const starCount = 3000;
  const positions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const radius = 80 + Math.random() * 400;
    const theta = Math.random() * TWO_PI;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.7,
    sizeAttenuation: true,
  });

  return new THREE.Points(geometry, material);
}
scene.add(createStarField());

// ---------------------------------------------------------------------
// 6. ЗАВАНТАЖЕННЯ ТЕКСТУРИ ЗЕМЛІ
// ---------------------------------------------------------------------
const loadingOverlay = document.getElementById('loading-overlay');
const textureLoader = new THREE.TextureLoader();
const EARTH_TEXTURE_URL = 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg';

let baseEarthTexture = null;

// ---------------------------------------------------------------------
// 7. ДОПОМІЖНА ФУНКЦІЯ: побудова "клину" глобуса (частини сфери)
//
// phiStart/phiLength визначають, яку горизонтальну дугу сфери займає клин.
// Для кожного клину будуються 4 напівсферичні оболонки (кора, мантія,
// зовнішнє та внутрішнє ядро) та дві плоскі "торцеві" грані у місцях
// розрізу, складені з кілець кожного кольору — це і є видимий "переріз".
// ---------------------------------------------------------------------
function buildWedge(phiStart, phiLength) {
  const group = new THREE.Group();

  // Кількість сегментів пропорційна кутовому розміру клину (для якості)
  const angleFraction = phiLength / TWO_PI;
  const widthSegments = Math.max(8, Math.round(64 * angleFraction));
  const heightSegments = 48;

  // --- Земна кора (зовнішня текстурована оболонка) ---
  const texFraction = phiLength / TWO_PI;
  const texOffset = phiStart / TWO_PI;

  const crustTexture = baseEarthTexture.clone();
  crustTexture.needsUpdate = true;
  crustTexture.wrapS = THREE.RepeatWrapping;
  crustTexture.repeat.set(texFraction, 1);
  crustTexture.offset.set(texOffset, 0);

  const crustGeometry = new THREE.SphereGeometry(
    CRUST_R, widthSegments, heightSegments, phiStart, phiLength, 0, Math.PI
  );
  const crustMaterial = new THREE.MeshStandardMaterial({
    map: crustTexture,
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
  group.add(new THREE.Mesh(crustGeometry, crustMaterial));

  // --- Мантія ---
  const mantleGeometry = new THREE.SphereGeometry(
    MANTLE_R, widthSegments, heightSegments, phiStart, phiLength, 0, Math.PI
  );
  const mantleMaterial = new THREE.MeshStandardMaterial({
    color: COLOR_MANTLE,
    roughness: 0.75,
    emissive: COLOR_MANTLE,
    emissiveIntensity: 0.12,
    side: THREE.DoubleSide,
  });
  group.add(new THREE.Mesh(mantleGeometry, mantleMaterial));

  // --- Зовнішнє ядро ---
  const outerCoreGeometry = new THREE.SphereGeometry(
    OUTER_CORE_R, widthSegments, heightSegments, phiStart, phiLength, 0, Math.PI
  );
  const outerCoreMaterial = new THREE.MeshStandardMaterial({
    color: COLOR_OUTER_CORE,
    roughness: 0.4,
    emissive: COLOR_OUTER_CORE,
    emissiveIntensity: 0.25,
    side: THREE.DoubleSide,
  });
  group.add(new THREE.Mesh(outerCoreGeometry, outerCoreMaterial));

  // --- Внутрішнє ядро ---
  const innerCoreGeometry = new THREE.SphereGeometry(
    INNER_CORE_R, widthSegments, heightSegments, phiStart, phiLength, 0, Math.PI
  );
  const innerCoreMaterial = new THREE.MeshStandardMaterial({
    color: COLOR_INNER_CORE,
    roughness: 0.3,
    emissive: COLOR_INNER_CORE,
    emissiveIntensity: 0.6,
    side: THREE.DoubleSide,
  });
  group.add(new THREE.Mesh(innerCoreGeometry, innerCoreMaterial));

  // --- Торцеві грані розрізу (видно лише у місцях, де сфера "розрізана") ---
  // Площина розрізу під кутом phi проходить через вісь Y; щоб плоский диск
  // (який за замовчуванням лежить у площині XY) співпав із цією площиною,
  // повертаємо групу навколо осі Y на кут (phi + π).
  [phiStart, phiStart + phiLength].forEach((angle) => {
    const faceGroup = new THREE.Group();
    faceGroup.rotation.y = angle + Math.PI;

    const ringSegments = 64;

    // Внутрішнє ядро — суцільний круг у центрі
    const innerCoreCircle = new THREE.Mesh(
      new THREE.CircleGeometry(INNER_CORE_R, ringSegments),
      new THREE.MeshBasicMaterial({ color: COLOR_INNER_CORE, side: THREE.DoubleSide })
    );
    faceGroup.add(innerCoreCircle);

    // Зовнішнє ядро — кільце навколо внутрішнього ядра
    const outerCoreRing = new THREE.Mesh(
      new THREE.RingGeometry(INNER_CORE_R, OUTER_CORE_R, ringSegments),
      new THREE.MeshBasicMaterial({ color: COLOR_OUTER_CORE, side: THREE.DoubleSide })
    );
    faceGroup.add(outerCoreRing);

    // Мантія — кільце навколо зовнішнього ядра
    const mantleRing = new THREE.Mesh(
      new THREE.RingGeometry(OUTER_CORE_R, MANTLE_R, ringSegments),
      new THREE.MeshBasicMaterial({ color: COLOR_MANTLE, side: THREE.DoubleSide })
    );
    faceGroup.add(mantleRing);

    // Кора — тонке зовнішнє кільце
    const crustRing = new THREE.Mesh(
      new THREE.RingGeometry(MANTLE_R, CRUST_R, ringSegments),
      new THREE.MeshBasicMaterial({ color: 0x8a6a52, side: THREE.DoubleSide })
    );
    faceGroup.add(crustRing);

    group.add(faceGroup);
  });

  return group;
}

// ---------------------------------------------------------------------
// 8. ЗБІРКА ГЛОБУСА: група для основного тіла + група для сектора
// ---------------------------------------------------------------------
const earthGroup = new THREE.Group();
let mainBodyGroup = null;
let sectorGroup = null;

// Напрямок, у якому сектор "від'їжджає" при розкритті.
// Обчислюється як радіальний напрям у горизонтальній площині для
// бісектриси кута сектора (та сама формула, що й для позиції точок сфери).
const sectorBisector = SECTOR_PHI_START + SECTOR_PHI_LENGTH / 2;
const openDirection = new THREE.Vector3(
  -Math.cos(sectorBisector),
  0,
  Math.sin(sectorBisector)
).normalize();

const CLOSED_POSITION = new THREE.Vector3(0, 0, 0);
const OPEN_POSITION = openDirection.clone().multiplyScalar(3.6).add(new THREE.Vector3(0, 1.4, 0));
const OPEN_ROTATION_Y = 0.55; // додаткове дообертання сектора при розкритті "назовні"
const OPEN_ROTATION_X = -0.18; // легкий нахил, щоб було видно внутрішні шари

textureLoader.load(
  EARTH_TEXTURE_URL,
  (texture) => {
    baseEarthTexture = texture;
    baseEarthTexture.colorSpace = THREE.SRGBColorSpace;

    mainBodyGroup = buildWedge(MAIN_PHI_START, MAIN_PHI_LENGTH);
    sectorGroup = buildWedge(SECTOR_PHI_START, SECTOR_PHI_LENGTH);

    earthGroup.add(mainBodyGroup);
    earthGroup.add(sectorGroup);
    scene.add(earthGroup);

    loadingOverlay.classList.add('hidden');
    setTimeout(() => { loadingOverlay.style.display = 'none'; }, 700);
  },
  undefined,
  (error) => {
    console.error('Помилка завантаження текстури Землі:', error);
    loadingOverlay.querySelector('.loading-text').textContent =
      'Не вдалося завантажити текстуру. Перевірте з’єднання з інтернетом.';
  }
);

// ---------------------------------------------------------------------
// 9. АНІМАЦІЯ РОЗКРИТТЯ / ЗАКРИТТЯ
// ---------------------------------------------------------------------
let isOpen = false;
let openProgress = 0; // 0 = закрито, 1 = повністю розкрито
let targetProgress = 0;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function toggleEarth() {
  if (!sectorGroup) return; // ще не завантажено текстуру
  isOpen = !isOpen;
  targetProgress = isOpen ? 1 : 0;

  const btnText = document.querySelector('.btn-text');
  btnText.textContent = isOpen ? 'Зібрати Землю' : 'Розкрити Землю';
}

function updateSectorAnimation(delta) {
  if (!sectorGroup) return;

  // Плавне наближення поточного прогресу до цільового (frame-rate незалежне)
  const smoothing = 1 - Math.pow(0.001, delta);
  openProgress += (targetProgress - openProgress) * smoothing;

  const eased = easeInOutCubic(THREE.MathUtils.clamp(openProgress, 0, 1));

  sectorGroup.position.lerpVectors(CLOSED_POSITION, OPEN_POSITION, eased);
  sectorGroup.rotation.y = OPEN_ROTATION_Y * eased;
  sectorGroup.rotation.x = OPEN_ROTATION_X * eased;
}

// ---------------------------------------------------------------------
// 10. ОБРОБКА КЛІКІВ (кнопка + клік по самому глобусу)
// ---------------------------------------------------------------------
const toggleButton = document.getElementById('toggle-btn');
toggleButton.addEventListener('click', toggleEarth);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerDownPos = { x: 0, y: 0 };

renderer.domElement.addEventListener('pointerdown', (event) => {
  pointerDownPos = { x: event.clientX, y: event.clientY };
});

renderer.domElement.addEventListener('pointerup', (event) => {
  // Ігноруємо клік, якщо це було перетягування камери (OrbitControls)
  const dx = event.clientX - pointerDownPos.x;
  const dy = event.clientY - pointerDownPos.y;
  if (Math.sqrt(dx * dx + dy * dy) > 6) return;
  if (!earthGroup.children.length) return;

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObject(earthGroup, true);

  if (intersects.length > 0) {
    toggleEarth();
  }
});

// ---------------------------------------------------------------------
// 11. АДАПТИВНІСТЬ: оновлення розмірів при зміні вікна
// ---------------------------------------------------------------------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------------------------------------------------------------------
// 12. ГОЛОВНИЙ ЦИКЛ АНІМАЦІЇ
// ---------------------------------------------------------------------
const clock = new THREE.Clock();
const IDLE_ROTATION_SPEED = 0.12; // рад/сек, коли глобус закритий

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.1);

  // Повільне обертання цілого глобуса, що сповільнюється при розкритті
  const rotationDamp = 1 - easeInOutCubic(THREE.MathUtils.clamp(openProgress, 0, 1));
  earthGroup.rotation.y += IDLE_ROTATION_SPEED * delta * rotationDamp;

  updateSectorAnimation(delta);

  controls.update();
  renderer.render(scene, camera);
}

animate();

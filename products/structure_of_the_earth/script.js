// ==========================================================================
// 3D-модель внутрішньої будови Землі — Three.js
//
// ВІД'ЄМНИЙ ШМАТОК — 1/8 КУЛІ (ОКТАНТ).
// Реалізовано пошарове розділення 1/8 частини Землі на окремі шари
// (внутрішнє ядро, зовнішнє ядро, мантія, земна кора) з детальним
// науково-освітнім описом та повноцінним керуванням камерою (обертання,
// переміщення та масштабування коліщатком).
// ==========================================================================

// ---------------------------------------------------------------------
// 1. РЕАЛЬНІ ПРОПОРЦІЇ ШАРІВ ТА ДЕТАЛЬНА ІНФОРМАЦІЯ
// ---------------------------------------------------------------------
const CRUST_R = 6.37;
const MANTLE_R = 6.25;
const OUTER_CORE_R = 3.48;
const INNER_CORE_R = 1.22;

const COLOR_MANTLE = 0xcc3300;
const COLOR_OUTER_CORE = 0xffaa00;
const COLOR_INNER_CORE = 0xffffff;

const EARTH_TEXTURE_URL =
  'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg';

const LAYER_INFO = {
  crust: {
    title: 'Земна кора (Crust)',
    className: 'crust',
    depth: '5–70 км',
    temperature: 'до 600–900 °C',
    state: 'Твердий, крихкий',
    massShare: '< 1% маси Землі',
    composition: 'Силікати, оксиди алюмінію, заліза, кальцію, натрію (граніти, базальти, осадові породи).',
    description: 'Зовнішня тверда оболонка планети. Поділяється на тонку океанічну кору (5–10 км, базальтова) та потужну континентальну кору (30–70 км, тришарова: осадовий, гранітний та базальтовий шари).',
    facts: [
      'Разом із верхнім шаром мантії утворює літосферу, розділену на рухомі тектонічні плити.',
      'Найглибша свердловина людства (Кольська надглибока) досягла 12 262 м — лише близько третини континентальної кори.',
      'Єдиний геосферний шар, де виникла та існує біосфера й життя.',
    ],
  },
  mantle: {
    title: 'Мантія (Mantle)',
    className: 'mantle',
    depth: '30 – 2900 км',
    temperature: '1000 – 3700 °C',
    state: 'В’язко-пластичний',
    massShare: '~67% маси, 84% об’єму',
    composition: 'Перидотити, олівін, піроксени, силікати заліза та магнію.',
    description: 'Найбільша за об’ємом геосфера Землі. Поділяється на верхню мантію (з астеносферою — частково розплавленим шаром, по якому ковзають плити) та нижню мантію, де речовина ущільнена колосальним тиском.',
    facts: [
      'Теплова конвекція в мантії є головним рушієм руху тектонічних плит, утворення гір, землетрусів і вивержень вулканів.',
      'Речовина мантії тверда на коротких часових відрізках, але поводиться як надв’язка рідина у масштабах мільйонів років.',
      'Алмази утворюються саме в глибинах верхньої мантії при тиску понад 50 000 атмосфер і виносяться магмою на поверхню.',
    ],
  },
  outerCore: {
    title: 'Зовнішнє ядро (Outer Core)',
    className: 'outerCore',
    depth: '2900 – 5150 км',
    temperature: '4000 – 5000 °C',
    state: 'Рідкий металевий розплав',
    massShare: '~30% маси Землі',
    composition: 'Розплавлене залізо (~85%), нікель (~10%), домішки сірки, кремнію та кисню.',
    description: 'Шар розпеченого рідкого металу товщиною близько 2250 км. Висока температура підтримує метал у рідкому стані, незважаючи на тиск від 1,3 до 3,3 мільйонів атмосфер.',
    facts: [
      'Турбулентні конвективні потоки рідкого заліза під дією обертання Землі (сила Коріоліса) працюють як планетарне «геодинамо».',
      'Саме зовнішнє ядро генерує магнітне поле Землі (магнітосферу), що захищає все живе від сонячного вітру та радіації.',
      'Сейсмічні поперечні S-хвилі не здатні проходити крізь зовнішнє ядро, що й довело його рідкий стан.',
    ],
  },
  innerCore: {
    title: 'Внутрішнє ядро (Inner Core)',
    className: 'innerCore',
    depth: '5150 – 6371 км (центр)',
    temperature: '5400 – 6000 °C',
    state: 'Твердий кристал металу',
    massShare: '~1.7% маси Землі',
    composition: 'Сплав заліза та нікелю (кристалічний феронікель) із незначною кількістю легких елементів.',
    description: 'Металева куля радіусом близько 1220 км (близько 70% радіуса Місяця). Температура тут порівнянна з поверхнею Сонця, але через тиск понад 3,6 млн атмосфер атоми металу стиснені у тверду кристалічну гратку.',
    facts: [
      'Внутрішнє ядро обертається навколо своєї осі трохи з іншою швидкістю, ніж поверхня планети (явище суперротації).',
      'Ядро поступово кристалізується зі швидкістю близько 1 мм на рік у міру повільного охолодження Землі.',
      'Виділення прихованого тепла під час кристалізації ядра підтримує циркуляцію в зовнішньому ядрі та роботу магнітного динамо.',
    ],
  },
};

// ---------------------------------------------------------------------
// 2. СЦЕНА, КАМЕРА, РЕНДЕРЕР
// ---------------------------------------------------------------------
const container = document.getElementById('scene-container');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(4, 3.5, 17);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.localClippingEnabled = true;
container.appendChild(renderer.domElement);

// ---------------------------------------------------------------------
// 3. ORBITCONTROLS (Обертання, Панорамування та Масштабування)
// ---------------------------------------------------------------------
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 5;
controls.maxDistance = 45;
controls.enableZoom = true;
controls.zoomSpeed = 1.1;
controls.enablePan = true;
controls.panSpeed = 1.0;
controls.screenSpacePanning = true; // переміщення паралельно площині екрана

// Налаштування кнопок миші:
// ЛКМ (LEFT) - обертання навколо об'єкта
// СКМ (MIDDLE, натискання коліщатка) - переміщення/панорамування камери
// ПКМ (RIGHT) - переміщення/панорамування камери
controls.mouseButtons = {
  LEFT: THREE.MOUSE.ROTATE,
  MIDDLE: THREE.MOUSE.PAN,
  RIGHT: THREE.MOUSE.PAN,
};

// ---------------------------------------------------------------------
// 4. ОСВІТЛЕННЯ
// ---------------------------------------------------------------------
scene.add(new THREE.AmbientLight(0xffffff, 0.45));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
dirLight.position.set(9, 7, 11);
scene.add(dirLight);
const coreGlow = new THREE.PointLight(0xff7a33, 1.0, 25);
scene.add(coreGlow);

// ---------------------------------------------------------------------
// 5. ЗІРКОВЕ НЕБО
// ---------------------------------------------------------------------
(function addStarField() {
  const starCount = 3000;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const radius = 90 + Math.random() * 400;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, sizeAttenuation: true });
  scene.add(new THREE.Points(geometry, material));
})();

// ---------------------------------------------------------------------
// 6. ПЛОЩИНИ ВІДСІКАННЯ ДЛЯ 1/8 ЧАСТИНИ (ОКТАНТА)
// ---------------------------------------------------------------------
const mainPlaneA_local = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0); // осн. тіло ховає x>0
const mainPlaneB_local = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0); // осн. тіло ховає y>0
const mainPlaneZ_local = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0); // осн. тіло ховає z>0

const sectorPlaneC_local = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0); // сектор лишає x>=0
const sectorPlaneD_local = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // сектор лишає y>=0
const sectorPlaneE_local = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // сектор лишає z>=0

const mainPlaneA = mainPlaneA_local.clone();
const mainPlaneB = mainPlaneB_local.clone();
const mainPlaneZ = mainPlaneZ_local.clone();

// ---------------------------------------------------------------------
// 7. РЕЄСТР МЕШІВ ПО ШАРАХ (для підсвічування)
// ---------------------------------------------------------------------
const layerRegistry = { crust: [], mantle: [], outerCore: [], innerCore: [] };
const materialBaseEmissive = new Map();

function registerMesh(layerKey, mesh) {
  mesh.userData.layer = layerKey;
  layerRegistry[layerKey].push(mesh);
  if (mesh.material && 'emissiveIntensity' in mesh.material) {
    materialBaseEmissive.set(mesh.material, mesh.material.emissiveIntensity);
  }
}

// ---------------------------------------------------------------------
// 8. СТВОРЕННЯ ОСНОВНОГО ТІЛА ЗЕМЛІ (7/8)
// ---------------------------------------------------------------------
function createMainBodyShells(crustTexture) {
  const group = new THREE.Group();
  const segW = 64, segH = 48;
  const clippingPlanes = [mainPlaneA, mainPlaneB, mainPlaneZ];
  const common = { side: THREE.DoubleSide, clippingPlanes, clipIntersection: true, clipShadows: true };

  const innerCoreMat = new THREE.MeshPhongMaterial({
    ...common, color: COLOR_INNER_CORE, emissive: COLOR_INNER_CORE, emissiveIntensity: 0.35, shininess: 40,
  });
  const innerCoreMesh = new THREE.Mesh(new THREE.SphereGeometry(INNER_CORE_R, segW, segH), innerCoreMat);
  registerMesh('innerCore', innerCoreMesh);
  group.add(innerCoreMesh);

  const outerCoreMat = new THREE.MeshPhongMaterial({
    ...common, color: COLOR_OUTER_CORE, emissive: COLOR_OUTER_CORE, emissiveIntensity: 0.2, shininess: 60,
  });
  const outerCoreMesh = new THREE.Mesh(new THREE.SphereGeometry(OUTER_CORE_R, segW, segH), outerCoreMat);
  registerMesh('outerCore', outerCoreMesh);
  group.add(outerCoreMesh);

  const mantleMat = new THREE.MeshPhongMaterial({
    ...common, color: COLOR_MANTLE, emissive: COLOR_MANTLE, emissiveIntensity: 0.1, shininess: 15,
  });
  const mantleMesh = new THREE.Mesh(new THREE.SphereGeometry(MANTLE_R, segW, segH), mantleMat);
  registerMesh('mantle', mantleMesh);
  group.add(mantleMesh);

  const crustMat = new THREE.MeshPhongMaterial({
    ...common, map: crustTexture, emissive: 0xffffff, emissiveIntensity: 0, shininess: 8,
  });
  const crustMesh = new THREE.Mesh(new THREE.SphereGeometry(CRUST_R, segW, segH), crustMat);
  registerMesh('crust', crustMesh);
  group.add(crustMesh);

  return group;
}

function addMainBodyRingsToFace(faceGroup, thetaStart, thetaLength) {
  const segments = 48;

  const innerCoreMat = new THREE.MeshStandardMaterial({
    color: COLOR_INNER_CORE, side: THREE.DoubleSide, roughness: 0.5,
    emissive: COLOR_INNER_CORE, emissiveIntensity: 0.3,
  });
  const innerCoreCap = new THREE.Mesh(new THREE.CircleGeometry(INNER_CORE_R, segments, thetaStart, thetaLength), innerCoreMat);
  registerMesh('innerCore', innerCoreCap);
  faceGroup.add(innerCoreCap);

  const outerCoreMat = new THREE.MeshStandardMaterial({
    color: COLOR_OUTER_CORE, side: THREE.DoubleSide, roughness: 0.45,
    emissive: COLOR_OUTER_CORE, emissiveIntensity: 0.18,
  });
  const outerCoreCap = new THREE.Mesh(new THREE.RingGeometry(INNER_CORE_R, OUTER_CORE_R, segments, 1, thetaStart, thetaLength), outerCoreMat);
  registerMesh('outerCore', outerCoreCap);
  faceGroup.add(outerCoreCap);

  const mantleMat = new THREE.MeshStandardMaterial({
    color: COLOR_MANTLE, side: THREE.DoubleSide, roughness: 0.8,
    emissive: COLOR_MANTLE, emissiveIntensity: 0.08,
  });
  const mantleCap = new THREE.Mesh(new THREE.RingGeometry(OUTER_CORE_R, MANTLE_R, segments, 1, thetaStart, thetaLength), mantleMat);
  registerMesh('mantle', mantleCap);
  faceGroup.add(mantleCap);

  const crustMat = new THREE.MeshStandardMaterial({
    color: 0x8a6a52, side: THREE.DoubleSide, roughness: 0.9,
    emissive: 0xffffff, emissiveIntensity: 0,
  });
  const crustCap = new THREE.Mesh(new THREE.RingGeometry(MANTLE_R, CRUST_R, segments, 1, thetaStart, thetaLength), crustMat);
  registerMesh('crust', crustCap);
  faceGroup.add(crustCap);
}

function buildMainBodyCutFaces() {
  const group = new THREE.Group();
  const QUARTER = Math.PI / 2;

  const faceX = new THREE.Group();
  faceX.rotation.set(0, Math.PI / 2, 0);
  addMainBodyRingsToFace(faceX, Math.PI / 2, QUARTER);
  group.add(faceX);

  const faceY = new THREE.Group();
  faceY.rotation.set(-Math.PI / 2, 0, 0);
  addMainBodyRingsToFace(faceY, -Math.PI / 2, QUARTER);
  group.add(faceY);

  const faceZ = new THREE.Group();
  addMainBodyRingsToFace(faceZ, 0, QUARTER);
  group.add(faceZ);

  return group;
}

// ---------------------------------------------------------------------
// 9. СТВОРЕННЯ ПОШАРОВОГО СЕКТОРА 1/8 ЗЕМЛІ
// ---------------------------------------------------------------------
const sectorLayers = {
  innerCore: {
    group: new THREE.Group(),
    planes: [sectorPlaneC_local.clone(), sectorPlaneD_local.clone(), sectorPlaneE_local.clone()],
  },
  outerCore: {
    group: new THREE.Group(),
    planes: [sectorPlaneC_local.clone(), sectorPlaneD_local.clone(), sectorPlaneE_local.clone()],
  },
  mantle: {
    group: new THREE.Group(),
    planes: [sectorPlaneC_local.clone(), sectorPlaneD_local.clone(), sectorPlaneE_local.clone()],
  },
  crust: {
    group: new THREE.Group(),
    planes: [sectorPlaneC_local.clone(), sectorPlaneD_local.clone(), sectorPlaneE_local.clone()],
  },
};

function addSectorLayerCaps(targetGroup, layerKey, rInner, rOuter) {
  const QUARTER = Math.PI / 2;
  const segments = 48;
  const faces = [
    { rot: [0, Math.PI / 2, 0], thetaStart: Math.PI / 2 },
    { rot: [-Math.PI / 2, 0, 0], thetaStart: -Math.PI / 2 },
    { rot: [0, 0, 0], thetaStart: 0 },
  ];

  let mat;
  if (layerKey === 'innerCore') {
    mat = new THREE.MeshStandardMaterial({
      color: COLOR_INNER_CORE, side: THREE.DoubleSide, roughness: 0.5,
      emissive: COLOR_INNER_CORE, emissiveIntensity: 0.3,
    });
  } else if (layerKey === 'outerCore') {
    mat = new THREE.MeshStandardMaterial({
      color: COLOR_OUTER_CORE, side: THREE.DoubleSide, roughness: 0.45,
      emissive: COLOR_OUTER_CORE, emissiveIntensity: 0.18,
    });
  } else if (layerKey === 'mantle') {
    mat = new THREE.MeshStandardMaterial({
      color: COLOR_MANTLE, side: THREE.DoubleSide, roughness: 0.8,
      emissive: COLOR_MANTLE, emissiveIntensity: 0.08,
    });
  } else {
    mat = new THREE.MeshStandardMaterial({
      color: 0x8a6a52, side: THREE.DoubleSide, roughness: 0.9,
      emissive: 0xffffff, emissiveIntensity: 0,
    });
  }

  faces.forEach((f) => {
    const fGroup = new THREE.Group();
    fGroup.rotation.set(f.rot[0], f.rot[1], f.rot[2]);

    let capMesh;
    if (rInner === 0) {
      capMesh = new THREE.Mesh(new THREE.CircleGeometry(rOuter, segments, f.thetaStart, QUARTER), mat);
    } else {
      capMesh = new THREE.Mesh(new THREE.RingGeometry(rInner, rOuter, segments, 1, f.thetaStart, QUARTER), mat);
    }
    registerMesh(layerKey, capMesh);
    fGroup.add(capMesh);
    targetGroup.add(fGroup);
  });
}

function buildSeparableSector(crustTexture) {
  const rootSectorGroup = new THREE.Group();
  const segW = 64, segH = 48;

  // 1. Внутрішнє ядро
  const icPlanes = sectorLayers.innerCore.planes;
  const icMat = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide, clippingPlanes: icPlanes, clipIntersection: false, clipShadows: true,
    color: COLOR_INNER_CORE, emissive: COLOR_INNER_CORE, emissiveIntensity: 0.35, shininess: 40,
  });
  const icMesh = new THREE.Mesh(new THREE.SphereGeometry(INNER_CORE_R, segW, segH), icMat);
  registerMesh('innerCore', icMesh);
  sectorLayers.innerCore.group.add(icMesh);
  addSectorLayerCaps(sectorLayers.innerCore.group, 'innerCore', 0, INNER_CORE_R);
  rootSectorGroup.add(sectorLayers.innerCore.group);

  // 2. Зовнішнє ядро
  const ocPlanes = sectorLayers.outerCore.planes;
  const ocMat = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide, clippingPlanes: ocPlanes, clipIntersection: false, clipShadows: true,
    color: COLOR_OUTER_CORE, emissive: COLOR_OUTER_CORE, emissiveIntensity: 0.2, shininess: 60,
  });
  const ocOuterMesh = new THREE.Mesh(new THREE.SphereGeometry(OUTER_CORE_R, segW, segH), ocMat);
  const ocInnerMesh = new THREE.Mesh(new THREE.SphereGeometry(INNER_CORE_R, segW, segH), ocMat);
  registerMesh('outerCore', ocOuterMesh);
  registerMesh('outerCore', ocInnerMesh);
  sectorLayers.outerCore.group.add(ocOuterMesh);
  sectorLayers.outerCore.group.add(ocInnerMesh);
  addSectorLayerCaps(sectorLayers.outerCore.group, 'outerCore', INNER_CORE_R, OUTER_CORE_R);
  rootSectorGroup.add(sectorLayers.outerCore.group);

  // 3. Мантія
  const mPlanes = sectorLayers.mantle.planes;
  const mMat = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide, clippingPlanes: mPlanes, clipIntersection: false, clipShadows: true,
    color: COLOR_MANTLE, emissive: COLOR_MANTLE, emissiveIntensity: 0.1, shininess: 15,
  });
  const mOuterMesh = new THREE.Mesh(new THREE.SphereGeometry(MANTLE_R, segW, segH), mMat);
  const mInnerMesh = new THREE.Mesh(new THREE.SphereGeometry(OUTER_CORE_R, segW, segH), mMat);
  registerMesh('mantle', mOuterMesh);
  registerMesh('mantle', mInnerMesh);
  sectorLayers.mantle.group.add(mOuterMesh);
  sectorLayers.mantle.group.add(mInnerMesh);
  addSectorLayerCaps(sectorLayers.mantle.group, 'mantle', OUTER_CORE_R, MANTLE_R);
  rootSectorGroup.add(sectorLayers.mantle.group);

  // 4. Земна кора
  const cPlanes = sectorLayers.crust.planes;
  const cMat = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide, clippingPlanes: cPlanes, clipIntersection: false, clipShadows: true,
    map: crustTexture, emissive: 0xffffff, emissiveIntensity: 0, shininess: 8,
  });
  const cInnerMat = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide, clippingPlanes: cPlanes, clipIntersection: false, clipShadows: true,
    color: 0x8a6a52, emissive: 0xffffff, emissiveIntensity: 0, shininess: 8,
  });
  const cOuterMesh = new THREE.Mesh(new THREE.SphereGeometry(CRUST_R, segW, segH), cMat);
  const cInnerMesh = new THREE.Mesh(new THREE.SphereGeometry(MANTLE_R, segW, segH), cInnerMat);
  registerMesh('crust', cOuterMesh);
  registerMesh('crust', cInnerMesh);
  sectorLayers.crust.group.add(cOuterMesh);
  sectorLayers.crust.group.add(cInnerMesh);
  addSectorLayerCaps(sectorLayers.crust.group, 'crust', MANTLE_R, CRUST_R);
  rootSectorGroup.add(sectorLayers.crust.group);

  return rootSectorGroup;
}

// ---------------------------------------------------------------------
// 10. ЗБІРКА СЦЕНИ
// ---------------------------------------------------------------------
const earthGroup = new THREE.Group();
scene.add(earthGroup);

const loadingOverlay = document.getElementById('loading-overlay');
const textureLoader = new THREE.TextureLoader();

let mainBodyGroup = null;
let sectorGroup = null;

textureLoader.load(
  EARTH_TEXTURE_URL,
  (texture) => {
    texture.encoding = THREE.sRGBEncoding;

    mainBodyGroup = new THREE.Group();
    mainBodyGroup.add(createMainBodyShells(texture));
    mainBodyGroup.add(buildMainBodyCutFaces());

    sectorGroup = buildSeparableSector(texture);

    earthGroup.add(mainBodyGroup);
    earthGroup.add(sectorGroup);

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
// 11. КЕРУВАННЯ РОЗКРИТТЯМ ТА РОЗДІЛЕННЯМ ШАРІВ
// ---------------------------------------------------------------------
let progress = 0;
let targetProgress = 0;
let isOpen = false;

let layersProgress = 0;
let targetLayersProgress = 0;

const CLOSED_POSITION = new THREE.Vector3(0, 0, 0);
const OPEN_POSITION = new THREE.Vector3(4.6, 3.2, 4.2);
const LAYER_SEPARATION_DIR = new THREE.Vector3(0.55, 0.45, 0.70).normalize();

const distanceSlider = document.getElementById('distance-slider');
const layersSlider = document.getElementById('layers-slider');
const btnText = document.querySelector('.btn-text');

function updateToggleButtonLabel() {
  btnText.textContent = isOpen ? 'Зібрати Землю' : 'Розкрити Землю';
}

document.getElementById('toggle-btn').addEventListener('click', () => {
  if (!sectorGroup) return;
  isOpen = !isOpen;
  targetProgress = isOpen ? 1 : 0;
  if (!isOpen) {
    targetLayersProgress = 0;
    layersSlider.value = 0;
  }
  updateToggleButtonLabel();
  if (!isOpen) hideInfoPanel();
});

distanceSlider.addEventListener('input', (event) => {
  if (!sectorGroup) return;
  const value = Number(event.target.value) / 100;
  progress = value;
  targetProgress = value;
  isOpen = value > 0.5;
  updateToggleButtonLabel();
  if (value < 0.02 && layersProgress < 0.02) hideInfoPanel();
});

layersSlider.addEventListener('input', (event) => {
  if (!sectorGroup) return;
  const value = Number(event.target.value) / 100;
  layersProgress = value;
  targetLayersProgress = value;

  if (value > 0.05 && targetProgress < 0.5) {
    targetProgress = 1;
    isOpen = true;
    updateToggleButtonLabel();
  }
});

function updatePositions(delta) {
  if (!sectorGroup) return;

  const smoothing = 1 - Math.pow(0.001, delta);

  // 1. Позиція 1/8 сектора
  progress += (targetProgress - progress) * smoothing;
  sectorGroup.position.lerpVectors(CLOSED_POSITION, OPEN_POSITION, progress);
  distanceSlider.value = Math.round(progress * 100);

  // 2. Розділення шарів 1/8 частини (відділення від ядра)
  layersProgress += (targetLayersProgress - layersProgress) * smoothing;
  layersSlider.value = Math.round(layersProgress * 100);

  const lp = layersProgress;
  sectorLayers.innerCore.group.position.set(0, 0, 0);
  sectorLayers.outerCore.group.position.copy(LAYER_SEPARATION_DIR).multiplyScalar(lp * 2.2);
  sectorLayers.mantle.group.position.copy(LAYER_SEPARATION_DIR).multiplyScalar(lp * 4.8);
  sectorLayers.crust.group.position.copy(LAYER_SEPARATION_DIR).multiplyScalar(lp * 7.2);
}

// ---------------------------------------------------------------------
// 12. ОНОВЛЕННЯ ПЛОЩИН ВІДСІКАННЯ
// ---------------------------------------------------------------------
function updateClippingPlanes() {
  earthGroup.updateMatrixWorld(true);

  if (mainBodyGroup) {
    mainPlaneA.copy(mainPlaneA_local).applyMatrix4(mainBodyGroup.matrixWorld);
    mainPlaneB.copy(mainPlaneB_local).applyMatrix4(mainBodyGroup.matrixWorld);
    mainPlaneZ.copy(mainPlaneZ_local).applyMatrix4(mainBodyGroup.matrixWorld);
  }

  Object.keys(sectorLayers).forEach((layerKey) => {
    const layer = sectorLayers[layerKey];
    layer.planes[0].copy(sectorPlaneC_local).applyMatrix4(layer.group.matrixWorld);
    layer.planes[1].copy(sectorPlaneD_local).applyMatrix4(layer.group.matrixWorld);
    layer.planes[2].copy(sectorPlaneE_local).applyMatrix4(layer.group.matrixWorld);
  });
}

// ---------------------------------------------------------------------
// 13. ІНФОРМАЦІЙНА ПАНЕЛЬ ТА ПІДСВІЧУВАННЯ ШАРІВ
// ---------------------------------------------------------------------
const infoPanel = document.getElementById('info-panel');
const infoTitle = document.getElementById('info-title');
const infoDescription = document.getElementById('info-description');

function showInfoPanel(layerKey) {
  const info = LAYER_INFO[layerKey];
  if (!info) return;

  infoTitle.textContent = info.title;
  infoTitle.className = info.className;

  infoDescription.innerHTML = `
    <div class="info-stats-grid">
      <div class="stat-card">
        <div class="stat-label">Глибина</div>
        <div class="stat-value">${info.depth}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Температура</div>
        <div class="stat-value">${info.temperature}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Стан речовини</div>
        <div class="stat-value">${info.state}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Частка маси</div>
        <div class="stat-value">${info.massShare}</div>
      </div>
    </div>

    <div class="info-section">
      <div class="info-section-heading">Хімічний склад</div>
      <div class="info-section-body">${info.composition}</div>
    </div>

    <div class="info-section">
      <div class="info-section-heading">Будова та процеси</div>
      <div class="info-section-body">${info.description}</div>
    </div>

    <div class="info-section">
      <div class="info-section-heading">Цікаві факти</div>
      <ul class="info-list">
        ${info.facts.map((fact) => `<li>${fact}</li>`).join('')}
      </ul>
    </div>
  `;

  infoPanel.classList.add('visible');
}

function hideInfoPanel() {
  infoPanel.classList.remove('visible');
}

document.getElementById('info-close-btn').addEventListener('click', hideInfoPanel);

function highlightLayer(layerKey) {
  const meshes = layerRegistry[layerKey];
  meshes.forEach((mesh) => {
    if (!mesh.material || !('emissiveIntensity' in mesh.material)) return;
    mesh.material.emissiveIntensity = 0.9;
  });
  setTimeout(() => {
    meshes.forEach((mesh) => {
      const base = materialBaseEmissive.get(mesh.material);
      if (base !== undefined) mesh.material.emissiveIntensity = base;
    });
  }, 350);
}

// ---------------------------------------------------------------------
// 14. RAYCASTER — КЛІК НА ШАРИ З ПЕРЕВІРКОЮ ВІДСІКАННЯ
// ---------------------------------------------------------------------
function isPointClipped(material, worldPoint) {
  const planes = material.clippingPlanes;
  if (!planes || planes.length === 0) return false;

  if (material.clipIntersection) {
    return planes.every((p) => p.distanceToPoint(worldPoint) < 0);
  }
  return planes.some((p) => p.distanceToPoint(worldPoint) < 0);
}

function findFirstVisibleHit(intersects) {
  for (const hit of intersects) {
    const material = hit.object.material;
    if (!material) continue;
    if (isPointClipped(material, hit.point)) continue;
    return hit;
  }
  return null;
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerDownPos = { x: 0, y: 0 };

renderer.domElement.addEventListener('pointerdown', (event) => {
  pointerDownPos = { x: event.clientX, y: event.clientY };
});

renderer.domElement.addEventListener('pointerup', (event) => {
  if (event.button !== 0) return; // Реагуємо тільки на ліву кнопку миші для вибору шару
  const dx = event.clientX - pointerDownPos.x;
  const dy = event.clientY - pointerDownPos.y;
  if (Math.sqrt(dx * dx + dy * dy) > 6) return;
  if (!mainBodyGroup || !sectorGroup) return;

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(earthGroup.children, true);
  const visibleHit = findFirstVisibleHit(intersects);

  if (visibleHit) {
    const layerKey = visibleHit.object.userData.layer;
    if (layerKey) {
      highlightLayer(layerKey);
      showInfoPanel(layerKey);
    }
  }
});

// ---------------------------------------------------------------------
// 15. АДАПТИВНІСТЬ
// ---------------------------------------------------------------------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------------------------------------------------------------------
// 16. ГОЛОВНИЙ ЦИКЛ АНІМАЦІЇ
// ---------------------------------------------------------------------
const clock = new THREE.Clock();
const IDLE_ROTATION_SPEED = 0.12;

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.1);

  const rotationDamp = 1 - THREE.MathUtils.clamp(Math.max(progress, layersProgress), 0, 1);
  earthGroup.rotation.y += IDLE_ROTATION_SPEED * delta * rotationDamp;

  updatePositions(delta);
  updateClippingPlanes();

  controls.update();
  renderer.render(scene, camera);
}

animate();

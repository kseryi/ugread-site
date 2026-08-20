/**
 * Модуль 3D-візуалізації Землі з текстурою континентів та океанів,
 * надійним сонячним освітленням дня і ночі, лініями широт, нахилом осі 23.44° та полярними шапками.
 */
import * as THREE from 'three';
import { CONSTANTS } from '../constants.js';
import { getOrbitPosition } from '../math/astronomy.js';
import { getLanguage, TRANSLATIONS } from '../i18n.js';

function safeRoundRect(ctx, x, y, w, h, r) {
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export class Earth {
  constructor(scene) {
    this.scene = scene;
    this.currentTiltDeg = CONSTANTS.DEFAULT_AXIAL_TILT_DEG;
    this.showLatitudes = true;
    this.showAtmosphere = true;
    this.showAxis = true;

    // Головний орбітальний вузол (рухається по еліптичній/круговій орбіті навколо Сонця)
    this.orbitPivot = new THREE.Group();
    this.scene.add(this.orbitPivot);

    // Вузол нахилу осі (23.44° у світовому просторі)
    this.tiltGroup = new THREE.Group();
    this.orbitPivot.add(this.tiltGroup);
    this.updateAxialTilt(this.currentTiltDeg);

    // Складові Землі
    this.initEarthBody();
    this.initAtmosphereGlow();
    this.initPolarAxisAndLabels();
    this.initLatitudeLines();
    this.initMarkerPin();
  }

  /**
   * Генерація чіткої, контрастної та барвистої карти поверхні Землі
   */
  generateDayTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // 1. Океани (глибокий океанічний лазурний градієнт)
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    oceanGrad.addColorStop(0.0, '#103760');
    oceanGrad.addColorStop(0.2, '#184f88');
    oceanGrad.addColorStop(0.5, '#1d5e9f');
    oceanGrad.addColorStop(0.8, '#184f88');
    oceanGrad.addColorStop(1.0, '#103760');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    const drawPolygon = (pts, fillStyle, strokeStyle = null, lineWidth = 1) => {
      if (!pts || pts.length < 3) return;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i][0], pts[i][1]);
      }
      ctx.closePath();
      ctx.fillStyle = fillStyle;
      ctx.fill();
      if (strokeStyle) {
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }
    };

    // Палітра поверхні
    const shelfColor = '#38bdf8';     // Прибережний бірюзовий шельф
    const landColor = '#2e8b57';      // Соковита зелень лісів
    const landHighColor = '#48bb78';  // Світло-зелені рівнини
    const desertColor = '#e2be6c';    // Золотистий пісок Сахари
    const savannahColor = '#84cc16';  // Савана
    const mountainColor = '#8d785a';  // Гірські масиви
    const iceColor = '#f8fafc';       // Льодовики

    // 2. Континенти
    // ЄВРАЗІЯ
    const eurasiaShelf = [
      [830, 220], [930, 180], [1060, 160], [1220, 140], [1460, 150], [1710, 190],
      [1820, 250], [1760, 390], [1690, 490], [1570, 570], [1430, 590], [1310, 590],
      [1190, 530], [1070, 550], [940, 540], [850, 470], [790, 370], [810, 270]
    ];
    drawPolygon(eurasiaShelf, shelfColor);

    const eurasia = [
      [860, 260], [940, 220], [1030, 200], [1160, 180], [1310, 170], [1490, 190],
      [1650, 220], [1750, 280], [1720, 370], [1630, 440], [1530, 490], [1440, 510],
      [1370, 480], [1290, 460], [1220, 450], [1150, 480], [1070, 490], [980, 470],
      [920, 430], [860, 380], [840, 320]
    ];
    drawPolygon(eurasia, landColor, '#34d399', 2);

    // Європа, Скандинавія, Велика Британія
    drawPolygon([[870, 250], [910, 180], [940, 210], [890, 270]], landHighColor);
    drawPolygon([[820, 270], [850, 260], [840, 310], [810, 300]], landHighColor);
    drawPolygon([[790, 280], [810, 270], [805, 300], [785, 300]], landHighColor);

    // Україна та Східна Європа
    drawPolygon([[980, 320], [1090, 310], [1120, 380], [1000, 390]], landHighColor, '#86efac', 1.5);

    // Гімалаї
    drawPolygon([[1320, 420], [1450, 410], [1480, 460], [1340, 470]], mountainColor);

    // Індія
    drawPolygon([[1240, 460], [1290, 560], [1340, 530], [1320, 460]], savannahColor, '#a3e635', 1.5);

    // Східна Азія та Японія
    drawPolygon([[1430, 480], [1480, 570], [1530, 540], [1480, 470]], landHighColor);
    drawPolygon([[1660, 330], [1720, 380], [1690, 430], [1640, 360]], landHighColor);

    // АФРИКА
    const africaShelf = [
      [900, 430], [1080, 410], [1190, 450], [1230, 560], [1190, 710], [1120, 840],
      [1040, 870], [970, 810], [920, 690], [870, 560], [880, 470]
    ];
    drawPolygon(africaShelf, shelfColor);

    const africa = [
      [930, 450], [1060, 430], [1160, 470], [1200, 570], [1160, 690], [1100, 800],
      [1040, 830], [980, 770], [940, 660], [895, 560], [910, 480]
    ];
    drawPolygon(africa, savannahColor, '#facc15', 2);

    // Сахара та Аравія (золотистий пісок)
    ctx.fillStyle = desertColor;
    ctx.beginPath();
    ctx.ellipse(1040, 490, 120, 45, -0.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(1190, 485, 60, 40, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Мадагаскар
    drawPolygon([[1200, 680], [1230, 720], [1210, 770], [1190, 720]], landHighColor);

    // ПІВНІЧНА АМЕРИКА
    const naShelf = [
      [190, 150], [380, 150], [550, 180], [630, 250], [590, 400], [520, 460],
      [440, 520], [370, 560], [310, 490], [240, 420], [160, 330], [130, 220]
    ];
    drawPolygon(naShelf, shelfColor);

    const northAmerica = [
      [230, 180], [370, 180], [520, 210], [600, 270], [560, 390], [500, 440],
      [430, 490], [370, 530], [330, 470], [270, 400], [200, 330], [160, 240]
    ];
    drawPolygon(northAmerica, landColor, '#34d399', 2);

    // Скелясті гори
    drawPolygon([[280, 240], [350, 230], [420, 410], [360, 420]], mountainColor);

    // Гренландія
    drawPolygon([[620, 110], [740, 130], [710, 220], [610, 190]], iceColor, '#e2e8f0', 2);

    // ПІВДЕННА АМЕРИКА
    const saShelf = [
      [410, 510], [520, 530], [640, 590], [650, 690], [600, 810], [530, 930],
      [460, 970], [430, 870], [400, 750], [370, 630], [380, 540]
    ];
    drawPolygon(saShelf, shelfColor);

    const southAmerica = [
      [430, 530], [530, 550], [620, 600], [630, 680], [580, 790], [520, 900],
      [470, 940], [450, 850], [420, 740], [390, 640], [400, 560]
    ];
    drawPolygon(southAmerica, '#1e7b48', '#34d399', 2);

    // Анди
    drawPolygon([[420, 560], [440, 550], [460, 850], [440, 860]], mountainColor);

    // АВСТРАЛІЯ
    const ausShelf = [
      [1500, 630], [1690, 620], [1760, 690], [1740, 830], [1630, 870], [1500, 810], [1460, 690]
    ];
    drawPolygon(ausShelf, shelfColor);

    const australia = [
      [1530, 650], [1670, 640], [1730, 700], [1710, 800], [1620, 830], [1520, 780], [1490, 700]
    ];
    drawPolygon(australia, desertColor, '#f59e0b', 2);
    drawPolygon([[1670, 660], [1720, 720], [1690, 810]], landHighColor);

    // Нова Зеландія
    drawPolygon([[1780, 810], [1810, 850], [1770, 870]], landHighColor);

    // АНТАРКТИДА
    const antarctica = [
      [0, 920], [250, 900], [600, 880], [1000, 870], [1400, 890], [1800, 880], [2048, 920],
      [2048, 1024], [0, 1024]
    ];
    drawPolygon(antarctica, iceColor, '#ffffff', 2);

    // Внутрішні моря
    drawPolygon([[910, 410], [1040, 400], [1110, 420], [1030, 430], [920, 425]], '#184f88');
    drawPolygon([[1010, 360], [1070, 355], [1080, 380], [1020, 385]], '#184f88');
    drawPolygon([[1130, 340], [1160, 330], [1170, 400], [1135, 400]], '#184f88');

    // Полярна шапка Арктики
    const arcticGrad = ctx.createLinearGradient(0, 0, 0, 140);
    arcticGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    arcticGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.85)');
    arcticGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = arcticGrad;
    ctx.fillRect(0, 0, 2048, 140);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    return tex;
  }

  /**
   * Генерація карти нічних вогнів міст
   */
  generateNightTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Чорний фон ночі
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 2048, 1024);

    const cityClusters = [
      { cx: 950, cy: 330, rx: 90, ry: 50, count: 160 },
      { cx: 1040, cy: 350, rx: 50, ry: 35, count: 90 }, // Київ / Україна
      { cx: 850, cy: 300, rx: 35, ry: 35, count: 70 },
      { cx: 480, cy: 360, rx: 80, ry: 60, count: 180 },
      { cx: 280, cy: 380, rx: 40, ry: 60, count: 90 },
      { cx: 1540, cy: 400, rx: 80, ry: 60, count: 200 },
      { cx: 1680, cy: 370, rx: 35, ry: 35, count: 110 },
      { cx: 1280, cy: 500, rx: 50, ry: 45, count: 140 },
      { cx: 580, cy: 750, rx: 45, ry: 55, count: 70 },
      { cx: 1680, cy: 790, rx: 30, ry: 30, count: 40 }
    ];

    cityClusters.forEach(cluster => {
      for (let i = 0; i < cluster.count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const rad = Math.sqrt(Math.random());
        const x = cluster.cx + Math.cos(angle) * rad * cluster.rx;
        const y = cluster.cy + Math.sin(angle) * rad * cluster.ry;
        const r = 1.0 + Math.random() * 2.0;

        const glow = ctx.createRadialGradient(x, y, 0.2, x, y, r * 2.2);
        glow.addColorStop(0, 'rgba(255, 235, 160, 1.0)');
        glow.addColorStop(0.4, 'rgba(255, 170, 50, 0.7)');
        glow.addColorStop(1, 'rgba(255, 100, 0, 0)');

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    return tex;
  }

  /**
   * Створення тіла Землі з використанням надійного стандарту Three.js
   */
  initEarthBody() {
    const radius = CONSTANTS.EARTH_RADIUS;
    const geometry = new THREE.SphereGeometry(radius, 64, 64);

    this.dayTexture = this.generateDayTexture();
    this.nightTexture = this.generateNightTexture();

    // Використовуємо MeshStandardMaterial з чітким розділенням дня і глибокої ночі
    this.earthMaterial = new THREE.MeshStandardMaterial({
      map: this.dayTexture,
      roughness: 0.85,
      metalness: 0.05,
      emissive: new THREE.Color(0xffbf47),
      emissiveMap: this.nightTexture,
      emissiveIntensity: 0.65
    });

    this.earthMesh = new THREE.Mesh(geometry, this.earthMaterial);
    this.tiltGroup.add(this.earthMesh);

    this.initSeasonalIceCaps();
  }

  initSeasonalIceCaps() {
    const radius = CONSTANTS.EARTH_RADIUS * 1.004;
    // MeshStandardMaterial для полярних шапок, щоб вони теж поринали в темряву на нічному боці
    const iceMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.0,
      transparent: true,
      opacity: 0.95
    });

    // Північна полярна шапка
    const northGeo = new THREE.SphereGeometry(radius, 32, 12, 0, Math.PI * 2, 0, 0.36);
    this.northIceMesh = new THREE.Mesh(northGeo, iceMat);
    this.earthMesh.add(this.northIceMesh);

    // Південна полярна шапка
    const southGeo = new THREE.SphereGeometry(radius, 32, 12, 0, Math.PI * 2, Math.PI - 0.42, 0.42);
    this.southIceMesh = new THREE.Mesh(southGeo, iceMat);
    this.earthMesh.add(this.southIceMesh);
  }

  initAtmosphereGlow() {
    const radius = CONSTANTS.EARTH_RADIUS * 1.12;
    const atmoGeo = new THREE.SphereGeometry(radius, 32, 32);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false // Запобігає блокуванню рендерингу сфери Землі
    });

    this.atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    this.tiltGroup.add(this.atmoMesh);
  }

  initPolarAxisAndLabels() {
    this.axisGroup = new THREE.Group();
    const radius = CONSTANTS.EARTH_RADIUS;
    const axisLen = radius * 2.3;

    // Лінія полярної осі
    const axisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -axisLen, 0),
      new THREE.Vector3(0, axisLen, 0)
    ]);
    const axisMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 2,
      transparent: true,
      opacity: 0.9
    });
    this.axisLine = new THREE.Line(axisGeo, axisMat);
    this.axisGroup.add(this.axisLine);

    const lang = getLanguage();
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.uk;

    // Маркери N та S
    this.nLabel = this.createPoleSprite(dict.northPoleLabel, '#38bdf8');
    this.nLabel.position.set(0, axisLen + 0.45, 0);
    this.axisGroup.add(this.nLabel);

    this.sLabel = this.createPoleSprite(dict.southPoleLabel, '#f472b6');
    this.sLabel.position.set(0, -axisLen - 0.45, 0);
    this.axisGroup.add(this.sLabel);

    // Кільце на Північному полюсі
    const ringGeo = new THREE.RingGeometry(0.3, 0.45, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, axisLen, 0);
    this.axisGroup.add(ring);

    this.tiltGroup.add(this.axisGroup);
  }

  updateLanguage(lang) {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.uk;
    if (this.nLabel && dict.northPoleLabel) {
      const newN = this.createPoleSprite(dict.northPoleLabel, '#38bdf8');
      this.nLabel.material.map.dispose();
      this.nLabel.material.map = newN.material.map;
      this.nLabel.material.needsUpdate = true;
    }
    if (this.sLabel && dict.southPoleLabel) {
      const newS = this.createPoleSprite(dict.southPoleLabel, '#f472b6');
      this.sLabel.material.map.dispose();
      this.sLabel.material.map = newS.material.map;
      this.sLabel.material.needsUpdate = true;
    }
  }

  createPoleSprite(text, color = '#ffffff') {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(10, 19, 36, 0.85)';
    safeRoundRect(ctx, 10, 10, 140, 44, 12);
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 80, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.0, 0.8, 1);
    return sprite;
  }

  initLatitudeLines() {
    this.latitudesGroup = new THREE.Group();
    const r = CONSTANTS.EARTH_RADIUS * 1.01;

    const createLatitudeRing = (latDeg, color, isDashed = false) => {
      const latRad = (latDeg * Math.PI) / 180;
      const y = r * Math.sin(latRad);
      const ringRadius = r * Math.cos(latRad);

      const segments = 64;
      const points = [];
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(
          ringRadius * Math.cos(theta),
          y,
          ringRadius * Math.sin(theta)
        ));
      }

      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: isDashed ? 0.75 : 0.95,
        linewidth: isDashed ? 1.5 : 2.5
      });

      return new THREE.Line(geo, mat);
    };

    // Екватор (0°) - Золотистий
    this.equatorRing = createLatitudeRing(0, CONSTANTS.COLORS.EQUATOR_LINE, false);
    this.latitudesGroup.add(this.equatorRing);

    // Тропік Рака (+23.44°) - Оранжевий
    this.cancerRing = createLatitudeRing(23.44, CONSTANTS.COLORS.TROPIC_LINE, true);
    this.latitudesGroup.add(this.cancerRing);

    // Тропік Козорога (-23.44°) - Оранжевий
    this.capricornRing = createLatitudeRing(-23.44, CONSTANTS.COLORS.TROPIC_LINE, true);
    this.latitudesGroup.add(this.capricornRing);

    // Північне полярне коло (+66.56°) - Блакитний
    this.arcticRing = createLatitudeRing(66.56, CONSTANTS.COLORS.POLAR_CIRCLE, true);
    this.latitudesGroup.add(this.arcticRing);

    // Південне полярне коло (-66.56°) - Блакитний
    this.antarcticRing = createLatitudeRing(-66.56, CONSTANTS.COLORS.POLAR_CIRCLE, true);
    this.latitudesGroup.add(this.antarcticRing);

    this.earthMesh.add(this.latitudesGroup);
  }

  initMarkerPin() {
    this.pinGroup = new THREE.Group();
    const pinGeo = new THREE.ConeGeometry(0.12, 0.4, 16);
    pinGeo.rotateX(Math.PI);
    const pinMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const pinMesh = new THREE.Mesh(pinGeo, pinMat);
    pinMesh.position.y = 0.2;
    this.pinGroup.add(pinMesh);

    this.earthMesh.add(this.pinGroup);
    this.setMarkerLatitude(50.45); // Київ за замовчуванням
  }

  setMarkerLatitude(latDeg) {
    const latRad = (latDeg * Math.PI) / 180;
    const r = CONSTANTS.EARTH_RADIUS * 1.02;
    const y = r * Math.sin(latRad);
    const ringRadius = r * Math.cos(latRad);

    this.pinGroup.position.set(ringRadius, y, 0);
    this.pinGroup.rotation.z = -latRad + Math.PI / 2;
  }

  updateAxialTilt(tiltDeg) {
    this.currentTiltDeg = tiltDeg;
    const tiltRad = (tiltDeg * Math.PI) / 180;
    this.tiltGroup.rotation.z = tiltRad;
  }

  setPositionOnOrbit(deg) {
    const pos = getOrbitPosition(deg, CONSTANTS.ORBIT_RADIUS_X);
    this.orbitPivot.position.set(pos.x, 0, pos.z);
  }

  updateSeasonalIceCaps(northFactor) {
    const northScale = Math.max(0.65, Math.min(1.35, 1.0 - northFactor * 0.35));
    const southScale = Math.max(0.65, Math.min(1.35, 1.0 + northFactor * 0.35));

    if (this.northIceMesh) {
      this.northIceMesh.scale.set(northScale, 1.0, northScale);
    }
    if (this.southIceMesh) {
      this.southIceMesh.scale.set(southScale, 1.0, southScale);
    }
  }

  setLayerVisibility({ showLatitudes, showAtmosphere, showAxis }) {
    if (showLatitudes !== undefined) {
      this.showLatitudes = showLatitudes;
      this.latitudesGroup.visible = showLatitudes;
    }
    if (showAtmosphere !== undefined) {
      this.showAtmosphere = showAtmosphere;
      this.atmoMesh.visible = showAtmosphere;
    }
    if (showAxis !== undefined) {
      this.showAxis = showAxis;
      this.axisGroup.visible = showAxis;
    }
  }

  update(deltaTime) {
    // Добове обертання Землі навколо своєї осі
    if (this.earthMesh) {
      this.earthMesh.rotation.y += CONSTANTS.EARTH_SELF_ROTATION_SPEED * deltaTime;
    }
  }
}

/**
 * Модуль 3D-візуалізації орбіти Землі, сезонних дуг та маркерів рівнодень/сонцестоянь
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

export class OrbitVisualizer {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.showOrbitArcs = true;
    this.showMarkers = true;
    this.markerSprites = [];

    this.initOrbitArcs();
    this.initSolsticeEquinoxMarkers();
  }

  /**
   * Створення 4 дуг орбіти, що відповідають порам року
   */
  initOrbitArcs() {
    this.arcsGroup = new THREE.Group();
    const radius = CONSTANTS.ORBIT_RADIUS_X;

    const seasonArcsConfig = [
      { fromDeg: 0, toDeg: 90, color: CONSTANTS.COLORS.SEASONS.SUMMER },
      { fromDeg: 90, toDeg: 180, color: CONSTANTS.COLORS.SEASONS.AUTUMN },
      { fromDeg: 180, toDeg: 270, color: CONSTANTS.COLORS.SEASONS.WINTER },
      { fromDeg: 270, toDeg: 360, color: CONSTANTS.COLORS.SEASONS.SPRING }
    ];

    seasonArcsConfig.forEach(arc => {
      const steps = 36;
      const points = [];
      const span = arc.toDeg - arc.fromDeg;

      for (let i = 0; i <= steps; i++) {
        const deg = arc.fromDeg + (span * i) / steps;
        const pos = getOrbitPosition(deg, radius);
        points.push(new THREE.Vector3(pos.x, 0, pos.z));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: arc.color,
        linewidth: 2.5,
        transparent: true,
        opacity: 0.85
      });

      const line = new THREE.Line(geometry, material);
      this.arcsGroup.add(line);
    });

    // Тонке зовнішнє базове кільце орбіти
    const baseOrbitGeo = new THREE.BufferGeometry();
    const basePts = [];
    for (let i = 0; i <= 128; i++) {
      const deg = (i / 128) * 360;
      const pos = getOrbitPosition(deg, radius);
      basePts.push(new THREE.Vector3(pos.x, -0.02, pos.z));
    }
    baseOrbitGeo.setFromPoints(basePts);
    const baseOrbitMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.15
    });
    this.arcsGroup.add(new THREE.Line(baseOrbitGeo, baseOrbitMat));

    this.group.add(this.arcsGroup);
  }

  /**
   * Створення маркерів сонцестоянь та рівнодень (кулі + текстові білборди)
   */
  initSolsticeEquinoxMarkers() {
    this.markersGroup = new THREE.Group();
    const radius = CONSTANTS.ORBIT_RADIUS_X;
    const lang = getLanguage();
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.uk;

    const pointsList = [
      { key: 'summer', angle: 0 },
      { key: 'autumn', angle: 90 },
      { key: 'winter', angle: 180 },
      { key: 'spring', angle: 270 }
    ];

    pointsList.forEach(pt => {
      const pos = getOrbitPosition(pt.angle, radius);

      // Світиться сфера-вузол
      const dotGeo = new THREE.SphereGeometry(0.35, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({
        color: 0xffffff
      });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(pos.x, 0, pos.z);
      this.markersGroup.add(dot);

      // Ореол навколо вузла
      const ringGeo = new THREE.RingGeometry(0.5, 0.7, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(pos.x, 0, pos.z);
      this.markersGroup.add(ring);

      // Текстовий білборд з назвою та датою
      const ptInfo = dict.points[pt.key];
      const sprite = this.createMarkerSprite(ptInfo.name, ptInfo.date);
      const labelPos = getOrbitPosition(pt.angle, radius + 4.6);
      sprite.position.set(labelPos.x, 1.8, labelPos.z);
      sprite.userData = { key: pt.key, angle: pt.angle };
      this.markerSprites.push(sprite);
      this.markersGroup.add(sprite);
    });

    this.group.add(this.markersGroup);
  }

  createMarkerSprite(title, dateStr) {
    const canvas = document.createElement('canvas');
    canvas.width = 380;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');

    // Frosted glass background pill
    ctx.fillStyle = 'rgba(10, 19, 36, 0.78)';
    safeRoundRect(ctx, 8, 8, 364, 104, 16);
    ctx.fill();

    // Subtle glass border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Top highlight line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(24, 10);
    ctx.lineTo(356, 10);
    ctx.stroke();

    // Заголовок
    ctx.font = '700 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, 190, 44);

    // Дата
    ctx.font = '600 18px ui-monospace, SFMono-Regular, monospace';
    ctx.fillStyle = '#f2a623';
    ctx.fillText(dateStr, 190, 80);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(5.8, 1.8, 1);
    return sprite;
  }

  updateLanguage(lang) {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.uk;
    this.markerSprites.forEach(sprite => {
      const key = sprite.userData?.key;
      if (key && dict.points[key]) {
        const ptInfo = dict.points[key];
        const newSprite = this.createMarkerSprite(ptInfo.name, ptInfo.date);
        sprite.material.map.dispose();
        sprite.material.map = newSprite.material.map;
        sprite.material.needsUpdate = true;
      }
    });
  }

  setLayerVisibility({ showOrbitArcs, showMarkers }) {
    if (showOrbitArcs !== undefined) {
      this.showOrbitArcs = showOrbitArcs;
      this.arcsGroup.visible = showOrbitArcs;
    }
    if (showMarkers !== undefined) {
      this.showMarkers = showMarkers;
      this.markersGroup.visible = showMarkers;
    }
  }

  update(earthWorldPos, deltaTime) {}
}

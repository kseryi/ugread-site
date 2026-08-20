/**
 * Модуль 3D-візуалізації Сонця, сонячної корони та освітлення
 */
import * as THREE from 'three';
import { CONSTANTS } from '../constants.js';

export class Sun {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.initSunPhotosphere();
    this.initSolarCorona();
    this.initSolarLighting();
  }

  /**
   * Створення гладкої фотосфери Сонця
   */
  initSunPhotosphere() {
    const sunRadius = CONSTANTS.SUN_RADIUS;
    const geometry = new THREE.SphereGeometry(sunRadius, 64, 64);

    const material = new THREE.MeshBasicMaterial({
      color: 0xffe259
    });

    this.photosphere = new THREE.Mesh(geometry, material);
    this.group.add(this.photosphere);
  }

  initSolarCorona() {
    const sunRadius = CONSTANTS.SUN_RADIUS;

    // Внутрішній шар сонячного світіння
    const innerGeo = new THREE.SphereGeometry(sunRadius * 1.1, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xffbe1a,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false
    });
    this.innerCorona = new THREE.Mesh(innerGeo, innerMat);
    this.group.add(this.innerCorona);

    // Зовнішнє м'яке сяйво корони
    const midGeo = new THREE.SphereGeometry(sunRadius * 1.3, 32, 32);
    const midMat = new THREE.MeshBasicMaterial({
      color: 0xff9900,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false
    });
    this.midCorona = new THREE.Mesh(midGeo, midMat);
    this.group.add(this.midCorona);

    // Зовнішній дифузний ореол (Corona Halo Sprite)
    const haloCanvas = document.createElement('canvas');
    haloCanvas.width = 256;
    haloCanvas.height = 256;
    const ctx = haloCanvas.getContext('2d');

    const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
    grad.addColorStop(0, 'rgba(255, 245, 180, 0.95)');
    grad.addColorStop(0.25, 'rgba(255, 190, 40, 0.5)');
    grad.addColorStop(0.6, 'rgba(255, 120, 10, 0.15)');
    grad.addColorStop(1, 'rgba(255, 60, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const haloTexture = new THREE.CanvasTexture(haloCanvas);
    const haloMat = new THREE.SpriteMaterial({
      map: haloTexture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.9,
      depthWrite: false
    });

    this.haloSprite = new THREE.Sprite(haloMat);
    const haloScale = sunRadius * 4.5;
    this.haloSprite.scale.set(haloScale, haloScale, 1);
    this.group.add(this.haloSprite);
  }

  initSolarLighting() {
    // Потужне сонячне світло (point light із джерела Сонця)
    this.pointLight = new THREE.PointLight(0xffffff, 4.0, 0, 0);
    this.pointLight.position.set(0, 0, 0);
    this.group.add(this.pointLight);
  }

  update(deltaTime) {
    const time = performance.now() * 0.002;
    if (this.innerCorona) {
      const scale = 1.1 + Math.sin(time * 1.5) * 0.015;
      this.innerCorona.scale.set(scale, scale, scale);
    }
    if (this.midCorona) {
      const scale = 1.3 + Math.cos(time * 1.2) * 0.025;
      this.midCorona.scale.set(scale, scale, scale);
    }
  }
}

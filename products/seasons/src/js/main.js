/**
 * Головний вхідний модуль симуляції руху Землі навколо Сонця
 * Модульна архітектура на чистому JavaScript ES Modules
 */
import * as THREE from 'three';
import { CONSTANTS } from './constants.js';
import { SceneManager } from './graphics/sceneManager.js';
import { Sun } from './graphics/sun.js';
import { Earth } from './graphics/earth.js';
import { OrbitVisualizer } from './graphics/orbit.js';
import { CameraController, CAMERA_MODES } from './graphics/cameraController.js';
import { UIManager } from './ui/uiManager.js';
import { dayOfYearToOrbitAngle, getNorthExposureFactor } from './math/astronomy.js';

class App {
  constructor() {
    this.container = document.getElementById('scene-container');
    if (!this.container) {
      console.error('Контейнер #scene-container не знайдено!');
      return;
    }

    // Стан додатку
    this.state = {
      orbitAngleDeg: 0, // 0° = Літнє сонцестояння (21 червня)
      isPlaying: true,
      speedMultiplier: 1.0,
      axialTiltDeg: CONSTANTS.DEFAULT_AXIAL_TILT_DEG,
      selectedLatitude: 50.45, // Київ
      cameraMode: CAMERA_MODES.FREE,
      layers: {
        showOrbitArcs: true,
        showMarkers: true,
        showSolarRays: true,
        showLatitudes: true,
        showClouds: true,
        showAtmosphere: true,
        showAxis: true
      }
    };

    // Ініціалізація підсистем
    this.initGraphics();
    this.initUI();
    this.setupInitialState();

    // Головний цикл анімації
    this.clock = new THREE.Clock();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initGraphics() {
    // 1. Сцена, камера, рендерер, космос
    this.sceneManager = new SceneManager(this.container);

    // 2. Сонце та його світло
    this.sun = new Sun(this.sceneManager.scene);

    // 3. Земля, атмосфера, хмари, осі
    this.earth = new Earth(this.sceneManager.scene);

    // 4. Орбітальні дуги, маркери, сонячні промені
    this.orbitVisualizer = new OrbitVisualizer(this.sceneManager.scene);

    // 5. Керування камерою
    this.cameraController = new CameraController(
      this.sceneManager.camera,
      this.sceneManager.controls
    );
  }

  initUI() {
    this.uiManager = new UIManager(this.state, {
      onTogglePlay: () => {
        this.state.isPlaying = !this.state.isPlaying;
        this.uiManager.update(this.state);
      },
      onSetSpeed: (speed) => {
        this.state.speedMultiplier = speed;
      },
      onSetOrbitAngle: (deg) => {
        this.state.orbitAngleDeg = ((deg % 360) + 360) % 360;
        this.updateSimulationPositions();
        this.uiManager.update(this.state);
      },
      onStep: (degStep) => {
        this.state.orbitAngleDeg = ((this.state.orbitAngleDeg + degStep) % 360 + 360) % 360;
        this.updateSimulationPositions();
        this.uiManager.update(this.state);
      },
      onSelectMonth: (monthIndex) => {
        const month = CONSTANTS.MONTHS[monthIndex];
        const dayOfYear = month.startDay + 14; // середини місяця
        this.state.orbitAngleDeg = dayOfYearToOrbitAngle(dayOfYear);
        this.updateSimulationPositions();
        this.uiManager.update(this.state);
      },
      onSelectLatitude: (latDeg) => {
        this.state.selectedLatitude = latDeg;
        this.earth.setMarkerLatitude(latDeg);
        this.uiManager.update(this.state);
      },
      onSetTilt: (tiltDeg) => {
        this.state.axialTiltDeg = Math.max(0, Math.min(90, tiltDeg));
        this.earth.updateAxialTilt(this.state.axialTiltDeg);
        this.updateSimulationPositions();
        this.uiManager.update(this.state);
      },
      onSetCameraMode: (mode) => {
        this.state.cameraMode = mode;
        const earthPos = this.earth.orbitPivot.position;
        this.cameraController.setMode(mode, earthPos);
      },
      onToggleLayer: (layerName, isVisible) => {
        this.state.layers[layerName] = isVisible;

        this.earth.setLayerVisibility({
          showLatitudes: this.state.layers.showLatitudes,
          showAtmosphere: this.state.layers.showAtmosphere,
          showAxis: this.state.layers.showAxis
        });

        this.orbitVisualizer.setLayerVisibility({
          showOrbitArcs: this.state.layers.showOrbitArcs,
          showMarkers: this.state.layers.showMarkers
        });
      },
      onLanguageChange: (lang) => {
        this.orbitVisualizer.updateLanguage(lang);
        this.earth.updateLanguage(lang);
      }
    });
  }

  setupInitialState() {
    this.updateSimulationPositions();
    this.uiManager.update(this.state);
  }

  updateSimulationPositions() {
    // 1. Позиція Землі на орбіті
    this.earth.setPositionOnOrbit(this.state.orbitAngleDeg);

    // 2. Сезонне танення/наростання полярних шапок
    const northFactor = getNorthExposureFactor(this.state.orbitAngleDeg, this.state.axialTiltDeg);
    this.earth.updateSeasonalIceCaps(northFactor);
  }

  animate() {
    requestAnimationFrame(this.animate);

    const deltaTime = this.clock.getDelta();

    // Оновлення орбітального руху при відтворенні
    if (this.state.isPlaying) {
      const step = CONSTANTS.DEFAULT_ORBIT_SPEED_DEG_PER_SEC * this.state.speedMultiplier * deltaTime;
      this.state.orbitAngleDeg = (this.state.orbitAngleDeg + step) % 360;
      this.updateSimulationPositions();
      this.uiManager.update(this.state);
    }

    // Оновлення графічних підсистем
    this.sun.update(deltaTime);
    this.earth.update(deltaTime);

    const earthWorldPos = this.earth.orbitPivot.position;
    this.orbitVisualizer.update(earthWorldPos, deltaTime);
    this.cameraController.update(earthWorldPos, deltaTime);
    this.sceneManager.update();

    // Фінальний рендеринг кадру
    this.sceneManager.render();
  }
}

// Надійний запуск додатку як при DOMContentLoaded, так і якщо DOM вже готовий
function startSimulation() {
  if (!window.__earthSimApp) {
    window.__earthSimApp = new App();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startSimulation);
} else {
  startSimulation();
}


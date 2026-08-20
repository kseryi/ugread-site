/**
 * Модуль керування положенням камери та переходами між ракурсами
 * Підтримує вільне переміщення (панорамування) середньою кнопкою миші у будь-якому ракурсі.
 */
import * as THREE from 'three';

export const CAMERA_MODES = {
  FREE: 'free',                 // Вільне обертання та переміщення
  FOLLOW_EARTH: 'follow',       // Слідування за Землею крупним планом
  NORTH_POLE: 'north_pole',     // Вигляд згори (з Північного полюса орбіти)
  ECLIPTIC_PLANE: 'ecliptic',   // Вигляд у площині екліптики (чіткий нахил осі)
  SUN_VIEW: 'sun_view'          // Вигляд від Сонця на Землю
};

export class CameraController {
  constructor(camera, controls) {
    this.camera = camera;
    this.controls = controls;
    this.currentMode = CAMERA_MODES.FREE;

    // Цільові параметри для плавної інтерполяції
    this.targetCameraPos = camera.position.clone();
    this.targetControlsTarget = controls.target.clone();
    this.isTransitioning = false;
    this.transitionSpeed = 0.07;

    // Зберігання відносного зміщення для режиму Follow
    this.lastEarthPos = new THREE.Vector3();
    this.followOffset = new THREE.Vector3(5.5, 3.5, 5.5);

    // Слухаємо взаємодію користувача (рух миші/панорамування)
    this.controls.addEventListener('start', () => {
      // Якщо користувач почав маніпуляцію мишею під час анімації переходу — передаємо керування користувачеві
      if (this.isTransitioning) {
        this.isTransitioning = false;
      }
    });
  }

  setMode(mode, earthPos = new THREE.Vector3()) {
    this.currentMode = mode;
    this.isTransitioning = true;
    this.lastEarthPos.copy(earthPos);

    switch (mode) {
      case CAMERA_MODES.FREE:
        this.targetControlsTarget.set(0, 0, 0);
        break;

      case CAMERA_MODES.FOLLOW_EARTH:
        // Центруємося на Землі зі збереженням зручної відстані
        this.targetControlsTarget.copy(earthPos);
        this.targetCameraPos.copy(earthPos).add(this.followOffset);
        break;

      case CAMERA_MODES.NORTH_POLE:
        // Прямо згори (погляд на орбіту)
        this.targetControlsTarget.set(0, 0, 0);
        this.targetCameraPos.set(0, 52, 0.1);
        break;

      case CAMERA_MODES.ECLIPTIC_PLANE:
        // Збоку в площині екліптики
        this.targetControlsTarget.set(0, 0, 0);
        this.targetCameraPos.set(0, 3, 50);
        break;

      case CAMERA_MODES.SUN_VIEW:
        // Вигляд з центру сонячної системи на Землю
        this.targetControlsTarget.copy(earthPos);
        this.targetCameraPos.set(0, 1.5, 0);
        break;
    }
  }

  update(earthPos, deltaTime) {
    if (this.currentMode === CAMERA_MODES.FOLLOW_EARTH && !this.isTransitioning) {
      // Обчислюємо зміщення руху Землі орбітою та додаємо його до камери і цілі контролів,
      // що дозволяє користувачеві вільно переміщатися (панорамувати) середньою кнопкою
      const earthDelta = earthPos.clone().sub(this.lastEarthPos);
      this.controls.target.add(earthDelta);
      this.camera.position.add(earthDelta);
      this.lastEarthPos.copy(earthPos);
    } else if (this.isTransitioning) {
      this.camera.position.lerp(this.targetCameraPos, this.transitionSpeed);
      this.controls.target.lerp(this.targetControlsTarget, this.transitionSpeed);

      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.1) {
        this.isTransitioning = false;
        this.lastEarthPos.copy(earthPos);
      }
    }
  }
}

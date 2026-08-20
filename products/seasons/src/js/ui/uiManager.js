/**
 * Модуль керування інтерфейсом користувача (UI) та взаємодією з підтримкою локалізації (UK / EN)
 */
import { CONSTANTS } from '../constants.js';
import {
  getSeasonsInfo,
  getSolarDeclination,
  calculateNoonSunAltitude,
  calculateDayLengthHours,
  orbitAngleToDate,
  getNorthExposureFactor
} from '../math/astronomy.js';
import { CAMERA_MODES } from '../graphics/cameraController.js';
import { getLanguage, setLanguage, initLanguage, t, TRANSLATIONS } from '../i18n.js';

export class UIManager {
  constructor(appState, callbacks) {
    this.state = appState;
    this.callbacks = callbacks;

    initLanguage();
    this.cacheDOMElements();
    this.bindEvents();
    this.updateAllStaticTexts();
    this.populateLatitudePresets();
    this.populateMonthButtons();
  }

  cacheDOMElements() {
    // Елементи перемикача мов
    this.langBtns = document.querySelectorAll('.lang-btn');

    // Тексти заголовка
    this.metaTitle = document.getElementById('meta-title');
    this.metaDesc = document.getElementById('meta-desc');
    this.brandTitle = document.getElementById('brand-title');
    this.brandSubtitle = document.getElementById('brand-subtitle');
    this.theoryBtnText = document.getElementById('theory-btn-text');

    // Кнопки швидкого переходу
    this.jumpSummerBtn = document.getElementById('jump-summer-btn');
    this.jumpAutumnBtn = document.getElementById('jump-autumn-btn');
    this.jumpWinterBtn = document.getElementById('jump-winter-btn');
    this.jumpSpringBtn = document.getElementById('jump-spring-btn');
    this.solsticeEquinoxBtns = document.querySelectorAll('.astro-jump-btn');

    // Елементи керування відтворенням
    this.playBtn = document.getElementById('play-btn');
    this.playIcon = document.getElementById('play-icon');
    this.pauseIcon = document.getElementById('pause-icon');
    this.stepPrevBtn = document.getElementById('step-prev-btn');
    this.stepNextBtn = document.getElementById('step-next-btn');
    this.orbitSlider = document.getElementById('orbit-slider');
    this.orbitAngleOut = document.getElementById('orbit-angle-out');
    this.dateDisplay = document.getElementById('current-date-display');
    this.astronomyTag = document.getElementById('astronomy-event-tag');

    // Швидкість
    this.speedBtns = document.querySelectorAll('.speed-btn');

    // Інформаційні плашки пір року
    this.titleCurrentSeasons = document.getElementById('title-current-seasons');
    this.northHemisphereLabel = document.getElementById('north-hemisphere-label');
    this.southHemisphereLabel = document.getElementById('south-hemisphere-label');

    this.northSeasonBadge = document.getElementById('north-season-badge');
    this.northSeasonTitle = document.getElementById('north-season-title');
    this.northSeasonDesc = document.getElementById('north-season-desc');
    this.northSeasonIcon = document.getElementById('north-season-icon');

    this.southSeasonBadge = document.getElementById('south-season-badge');
    this.southSeasonTitle = document.getElementById('south-season-title');
    this.southSeasonDesc = document.getElementById('south-season-desc');
    this.southSeasonIcon = document.getElementById('south-season-icon');

    // Астрономічні метрики
    this.titleInsolation = document.getElementById('title-insolation');
    this.labelDeclination = document.getElementById('label-declination');
    this.labelSunAltitude = document.getElementById('label-sun-altitude');
    this.labelDayLength = document.getElementById('label-day-length');
    this.labelSelectLatitude = document.getElementById('label-select-latitude');

    this.declinationValue = document.getElementById('declination-value');
    this.sunAltitudeValue = document.getElementById('sun-altitude-value');
    this.dayLengthValue = document.getElementById('day-length-value');
    this.latitudeSelect = document.getElementById('latitude-select');

    // Керування камерою
    this.titleCameraView = document.getElementById('title-camera-view');
    this.camBtnFree = document.getElementById('cam-btn-free');
    this.camBtnFollow = document.getElementById('cam-btn-follow');
    this.camBtnNorth = document.getElementById('cam-btn-north');
    this.camBtnEcliptic = document.getElementById('cam-btn-ecliptic');
    this.cameraBtns = document.querySelectorAll('.camera-btn');

    // Експеримент з нахилом осі
    this.titleAxialTilt = document.getElementById('title-axial-tilt');
    this.tiltSlider = document.getElementById('tilt-slider');
    this.tiltValueOut = document.getElementById('tilt-val-out');
    this.resetTiltBtn = document.getElementById('reset-tilt-btn');
    this.zeroTiltBtn = document.getElementById('zero-tilt-btn');

    // Перемикачі шарів
    this.titleVisualLayers = document.getElementById('title-visual-layers');
    this.labelLayerOrbit = document.getElementById('label-layer-orbit');
    this.labelLayerLatitudes = document.getElementById('label-layer-latitudes');
    this.labelLayerMarkers = document.getElementById('label-layer-markers');
    this.labelLayerAtmosphere = document.getElementById('label-layer-atmosphere');

    this.toggleOrbit = document.getElementById('toggle-orbit');
    this.toggleLatitudes = document.getElementById('toggle-latitudes');
    this.toggleMarkers = document.getElementById('toggle-markers');
    this.toggleAtmosphere = document.getElementById('toggle-atmosphere');

    // Контейнер місяців
    this.monthsBar = document.getElementById('months-bar');

    // Модальне вікно теорії
    this.theoryModal = document.getElementById('theory-modal');
    this.openTheoryBtn = document.getElementById('open-theory-btn');
    this.closeTheoryBtn = document.getElementById('close-theory-btn');
    this.theoryModalTitle = document.getElementById('theory-modal-title');
    this.theoryMythBox = document.getElementById('theory-myth-box');
    this.theorySec1Title = document.getElementById('theory-sec1-title');
    this.theorySec1Text = document.getElementById('theory-sec1-text');
    this.theorySec2Title = document.getElementById('theory-sec2-title');
    this.theorySec2Text = document.getElementById('theory-sec2-text');
    this.theorySec3Title = document.getElementById('theory-sec3-title');
    this.theorySec3Text = document.getElementById('theory-sec3-text');
    this.theorySec4Title = document.getElementById('theory-sec4-title');
    this.theorySec4Text = document.getElementById('theory-sec4-text');
  }

  updateAllStaticTexts() {
    const lang = getLanguage();
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.uk;

    document.documentElement.lang = lang;
    if (this.metaTitle) this.metaTitle.textContent = dict.metaTitle;
    if (this.metaDesc) this.metaDesc.setAttribute('content', dict.metaDescription);

    if (this.brandTitle) this.brandTitle.textContent = dict.appTitle;
    if (this.brandSubtitle) this.brandSubtitle.textContent = dict.appSubtitle;
    if (this.theoryBtnText) this.theoryBtnText.textContent = dict.theoryBtn;
    if (this.openTheoryBtn) this.openTheoryBtn.title = dict.theoryBtnTitle;

    // Quick jump buttons
    if (this.jumpSummerBtn) {
      this.jumpSummerBtn.textContent = dict.jumpSummer;
      this.jumpSummerBtn.title = dict.jumpSummerTitle;
    }
    if (this.jumpAutumnBtn) {
      this.jumpAutumnBtn.textContent = dict.jumpAutumn;
      this.jumpAutumnBtn.title = dict.jumpAutumnTitle;
    }
    if (this.jumpWinterBtn) {
      this.jumpWinterBtn.textContent = dict.jumpWinter;
      this.jumpWinterBtn.title = dict.jumpWinterTitle;
    }
    if (this.jumpSpringBtn) {
      this.jumpSpringBtn.textContent = dict.jumpSpring;
      this.jumpSpringBtn.title = dict.jumpSpringTitle;
    }

    // Panels
    if (this.titleCurrentSeasons) this.titleCurrentSeasons.textContent = dict.currentSeasonsTitle;
    if (this.northHemisphereLabel) this.northHemisphereLabel.textContent = dict.northHemisphere;
    if (this.southHemisphereLabel) this.southHemisphereLabel.textContent = dict.southHemisphere;

    if (this.titleInsolation) this.titleInsolation.textContent = dict.insolationTitle;
    if (this.labelDeclination) this.labelDeclination.textContent = dict.declinationLabel;
    if (this.labelSunAltitude) this.labelSunAltitude.textContent = dict.sunAltitudeLabel;
    if (this.labelDayLength) this.labelDayLength.textContent = dict.dayLengthLabel;
    if (this.labelSelectLatitude) this.labelSelectLatitude.textContent = dict.selectLatitudeLabel;

    if (this.titleCameraView) this.titleCameraView.textContent = dict.cameraTitle;
    if (this.camBtnFree) this.camBtnFree.textContent = dict.camFree;
    if (this.camBtnFollow) this.camBtnFollow.textContent = dict.camFollow;
    if (this.camBtnNorth) this.camBtnNorth.textContent = dict.camNorthPole;
    if (this.camBtnEcliptic) this.camBtnEcliptic.textContent = dict.camEcliptic;

    if (this.titleAxialTilt) this.titleAxialTilt.textContent = dict.axialTiltTitle;
    if (this.resetTiltBtn) {
      this.resetTiltBtn.textContent = dict.tiltRealBtn;
      this.resetTiltBtn.title = dict.tiltRealBtnTitle;
    }
    if (this.zeroTiltBtn) {
      this.zeroTiltBtn.textContent = dict.tiltZeroBtn;
      this.zeroTiltBtn.title = dict.tiltZeroBtnTitle;
    }

    if (this.titleVisualLayers) this.titleVisualLayers.textContent = dict.visualLayersTitle;
    if (this.labelLayerOrbit) this.labelLayerOrbit.textContent = dict.layerOrbitArcs;
    if (this.labelLayerLatitudes) this.labelLayerLatitudes.textContent = dict.layerLatitudes;
    if (this.labelLayerMarkers) this.labelLayerMarkers.textContent = dict.layerMarkers;
    if (this.labelLayerAtmosphere) this.labelLayerAtmosphere.textContent = dict.layerAtmosphere;

    if (this.stepPrevBtn) this.stepPrevBtn.title = dict.stepBackTitle;
    if (this.playBtn) this.playBtn.title = dict.playPauseTitle;
    if (this.stepNextBtn) this.stepNextBtn.title = dict.stepForwardTitle;

    // Theory modal
    if (this.theoryModalTitle) this.theoryModalTitle.textContent = dict.theoryModalTitle;
    if (this.theoryMythBox) this.theoryMythBox.innerHTML = dict.theoryMyth;
    if (this.theorySec1Title) this.theorySec1Title.textContent = dict.theorySection1Title;
    if (this.theorySec1Text) this.theorySec1Text.innerHTML = dict.theorySection1Text;
    if (this.theorySec2Title) this.theorySec2Title.textContent = dict.theorySection2Title;
    if (this.theorySec2Text) this.theorySec2Text.innerHTML = dict.theorySection2Text;
    if (this.theorySec3Title) this.theorySec3Title.textContent = dict.theorySection3Title;
    if (this.theorySec3Text) this.theorySec3Text.innerHTML = dict.theorySection3Text;
    if (this.theorySec4Title) this.theorySec4Title.textContent = dict.theorySection4Title;
    if (this.theorySec4Text) this.theorySec4Text.innerHTML = dict.theorySection4Text;

    // Update active lang buttons
    this.langBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  populateLatitudePresets() {
    if (!this.latitudeSelect) return;
    const currentVal = this.latitudeSelect.value ? parseFloat(this.latitudeSelect.value) : this.state.selectedLatitude;
    this.latitudeSelect.innerHTML = '';

    const lang = getLanguage();
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.uk;

    dict.latitudePresets.forEach(preset => {
      const opt = document.createElement('option');
      opt.value = preset.lat;
      opt.textContent = `${preset.icon} ${preset.name} (${preset.lat > 0 ? preset.lat + '° N' : preset.lat < 0 ? Math.abs(preset.lat) + '° S' : '0°'})`;
      if (Math.abs(preset.lat - currentVal) < 0.01) {
        opt.selected = true;
      }
      this.latitudeSelect.appendChild(opt);
    });
  }

  populateMonthButtons() {
    if (!this.monthsBar) return;
    this.monthsBar.innerHTML = '';

    const lang = getLanguage();
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.uk;

    dict.months.forEach((m, idx) => {
      const btn = document.createElement('button');
      btn.className = 'month-chip';
      btn.textContent = m.short;
      btn.title = m.name;
      btn.dataset.monthIndex = idx;
      btn.addEventListener('click', () => {
        this.callbacks.onSelectMonth(idx);
      });
      this.monthsBar.appendChild(btn);
    });
  }

  bindEvents() {
    // Перемикання мов
    this.langBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selectedLang = e.currentTarget.dataset.lang;
        if (selectedLang && selectedLang !== getLanguage()) {
          setLanguage(selectedLang);
          this.updateAllStaticTexts();
          this.populateLatitudePresets();
          this.populateMonthButtons();
          if (this.callbacks.onLanguageChange) {
            this.callbacks.onLanguageChange(selectedLang);
          }
          this.update(this.state);
        }
      });
    });

    // Відтворення / Пауза
    this.playBtn?.addEventListener('click', () => {
      this.callbacks.onTogglePlay();
    });

    // Кроки вперед/назад на 5 днів (приблизно 4.93 градуси)
    const FIVE_DAYS_DEG = (5 / 365) * 360;
    this.stepPrevBtn?.addEventListener('click', () => {
      this.callbacks.onStep(-FIVE_DAYS_DEG);
    });
    this.stepNextBtn?.addEventListener('click', () => {
      this.callbacks.onStep(FIVE_DAYS_DEG);
    });

    // Повзунок орбіти
    this.orbitSlider?.addEventListener('input', (e) => {
      const deg = parseFloat(e.target.value);
      this.callbacks.onSetOrbitAngle(deg);
    });

    // Кнопки швидкості
    this.speedBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.speedBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const speed = parseFloat(e.currentTarget.dataset.speed);
        this.callbacks.onSetSpeed(speed);
      });
    });

    // Вибір широти
    this.latitudeSelect?.addEventListener('change', (e) => {
      const lat = parseFloat(e.target.value);
      this.callbacks.onSelectLatitude(lat);
    });

    // Повзунок нахилу осі
    this.tiltSlider?.addEventListener('input', (e) => {
      const tilt = parseFloat(e.target.value);
      this.callbacks.onSetTilt(tilt);
    });

    // Швидкі кнопки нахилу осі
    this.resetTiltBtn?.addEventListener('click', () => {
      if (this.tiltSlider) this.tiltSlider.value = CONSTANTS.DEFAULT_AXIAL_TILT_DEG;
      this.callbacks.onSetTilt(CONSTANTS.DEFAULT_AXIAL_TILT_DEG);
    });
    this.zeroTiltBtn?.addEventListener('click', () => {
      if (this.tiltSlider) this.tiltSlider.value = 0;
      this.callbacks.onSetTilt(0);
    });

    // Вибір ракурсів камери
    this.cameraBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.cameraBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const mode = e.currentTarget.dataset.cameraMode;
        this.callbacks.onSetCameraMode(mode);
      });
    });

    // Перемикання шарів
    const setupToggle = (el, layerName) => {
      el?.addEventListener('change', (e) => {
        this.callbacks.onToggleLayer(layerName, e.target.checked);
      });
    };

    setupToggle(this.toggleOrbit, 'showOrbitArcs');
    setupToggle(this.toggleLatitudes, 'showLatitudes');
    setupToggle(this.toggleMarkers, 'showMarkers');
    setupToggle(this.toggleAtmosphere, 'showAtmosphere');

    // Кнопки переходу до рівнодень та сонцестоянь
    this.solsticeEquinoxBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const angle = parseFloat(e.currentTarget.dataset.angle);
        this.callbacks.onSetOrbitAngle(angle);
      });
    });

    // Модальне вікно теорії
    this.openTheoryBtn?.addEventListener('click', () => {
      this.theoryModal?.classList.add('active');
    });

    this.closeTheoryBtn?.addEventListener('click', () => {
      this.theoryModal?.classList.remove('active');
    });

    this.theoryModal?.addEventListener('click', (e) => {
      if (e.target === this.theoryModal) {
        this.theoryModal.classList.remove('active');
      }
    });

    // Закриття клавішею Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.theoryModal?.classList.contains('active')) {
        this.theoryModal.classList.remove('active');
      }
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') {
        e.preventDefault();
        this.callbacks.onTogglePlay();
      }
    });
  }

  update(state) {
    const { orbitAngleDeg, isPlaying, axialTiltDeg, selectedLatitude } = state;
    const lang = getLanguage();
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.uk;

    // 1. Кнопка відтворення / паузи
    if (this.playIcon && this.pauseIcon) {
      if (isPlaying) {
        this.playIcon.style.display = 'none';
        this.pauseIcon.style.display = 'block';
      } else {
        this.playIcon.style.display = 'block';
        this.pauseIcon.style.display = 'none';
      }
    }

    // 2. Синхронізація повзунка орбіти
    if (this.orbitSlider && document.activeElement !== this.orbitSlider) {
      this.orbitSlider.value = orbitAngleDeg.toFixed(1);
    }
    if (this.orbitAngleOut) {
      this.orbitAngleOut.textContent = `${Math.round(orbitAngleDeg)}°`;
    }

    // 3. Дата та астрономічні маркери
    const dateInfo = orbitAngleToDate(orbitAngleDeg, lang);
    if (this.dateDisplay) {
      this.dateDisplay.textContent = dateInfo.fullDateStr;
    }

    // Підсвічування активного місяця
    const monthChips = document.querySelectorAll('.month-chip');
    monthChips.forEach(chip => {
      const idx = parseInt(chip.dataset.monthIndex, 10);
      chip.classList.toggle('active', idx === dateInfo.monthIndex);
    });

    // Перевірка близькості до сонцестоянь чи рівнодень (± 4 градуси)
    let eventName = '';
    const pointsList = [
      { key: 'summer', angle: 0 },
      { key: 'autumn', angle: 90 },
      { key: 'winter', angle: 180 },
      { key: 'spring', angle: 270 }
    ];

    for (const pt of pointsList) {
      const diff = Math.abs(orbitAngleDeg - pt.angle);
      if (diff <= 4 || diff >= 356) {
        const ptData = dict.points[pt.key];
        eventName = `✨ ${ptData.name} (${ptData.date})`;
        break;
      }
    }

    if (this.astronomyTag) {
      if (eventName) {
        this.astronomyTag.textContent = eventName;
        this.astronomyTag.style.opacity = '1';
      } else {
        this.astronomyTag.textContent = dict.dayOfYearTag.replace('{day}', dateInfo.dayOfYear);
        this.astronomyTag.style.opacity = '0.7';
      }
    }

    // 4. Пори року
    const seasons = getSeasonsInfo(orbitAngleDeg);
    this.renderSeasonCard(
      'north',
      seasons.northSeason,
      this.northSeasonBadge,
      this.northSeasonTitle,
      this.northSeasonDesc,
      this.northSeasonIcon,
      axialTiltDeg,
      dict
    );
    this.renderSeasonCard(
      'south',
      seasons.southSeason,
      this.southSeasonBadge,
      this.southSeasonTitle,
      this.southSeasonDesc,
      this.southSeasonIcon,
      axialTiltDeg,
      dict
    );

    // 5. Розрахунки для обраної широти
    const declination = getSolarDeclination(orbitAngleDeg, axialTiltDeg);
    const sunAltitude = calculateNoonSunAltitude(selectedLatitude, declination);
    const dayLength = calculateDayLengthHours(selectedLatitude, declination);

    if (this.declinationValue) {
      this.declinationValue.textContent = `${declination >= 0 ? '+' : ''}${declination.toFixed(1)}°`;
    }
    if (this.sunAltitudeValue) {
      this.sunAltitudeValue.textContent = `${sunAltitude.toFixed(1)}° ${dict.aboveHorizon}`;
    }
    if (this.dayLengthValue) {
      const hours = Math.floor(dayLength);
      const minutes = Math.round((dayLength - hours) * 60);
      if (dayLength >= 23.95) {
        this.dayLengthValue.textContent = dict.polarDay;
      } else if (dayLength <= 0.05) {
        this.dayLengthValue.textContent = dict.polarNight;
      } else {
        this.dayLengthValue.textContent = dict.hoursFormat
          .replace('{h}', hours)
          .replace('{m}', minutes < 10 ? '0' + minutes : minutes);
      }
    }

    // 6. Відображення нахилу осі
    if (this.tiltValueOut) {
      this.tiltValueOut.textContent = `${axialTiltDeg.toFixed(1)}°`;
    }
  }

  renderSeasonCard(hemisphere, seasonKey, badgeEl, titleEl, descEl, iconEl, tiltDeg, dict) {
    if (!badgeEl || !titleEl || !descEl) return;

    if (tiltDeg === 0) {
      badgeEl.className = 'season-badge badge-neutral';
      badgeEl.textContent = dict.seasonNeutral;
      titleEl.textContent = dict.noSeasonsTitle;
      descEl.textContent = dict.noSeasonsDesc;
      if (iconEl) iconEl.textContent = '⚖️';
      return;
    }

    const configs = {
      spring: {
        name: dict.seasonSpring,
        badgeClass: 'badge-spring',
        icon: '🌱',
        desc: hemisphere === 'north' ? dict.northSpringDesc : dict.southSpringDesc
      },
      summer: {
        name: dict.seasonSummer,
        badgeClass: 'badge-summer',
        icon: '☀️',
        desc: hemisphere === 'north' ? dict.northSummerDesc : dict.southSummerDesc
      },
      autumn: {
        name: dict.seasonAutumn,
        badgeClass: 'badge-autumn',
        icon: '🍂',
        desc: hemisphere === 'north' ? dict.northAutumnDesc : dict.southAutumnDesc
      },
      winter: {
        name: dict.seasonWinter,
        badgeClass: 'badge-winter',
        icon: '❄️',
        desc: hemisphere === 'north' ? dict.northWinterDesc : dict.southWinterDesc
      }
    };

    const cfg = configs[seasonKey] || configs.summer;
    badgeEl.className = `season-badge ${cfg.badgeClass}`;
    badgeEl.textContent = cfg.name;
    const hemiLabel = hemisphere === 'north' ? dict.northHemisphere : dict.southHemisphere;
    titleEl.textContent = `${hemiLabel}: ${cfg.name}`;
    descEl.textContent = cfg.desc;
    if (iconEl) iconEl.textContent = cfg.icon;
  }
}

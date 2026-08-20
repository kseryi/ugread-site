/**
 * HydroPhysics Laboratory — Fluid Submersion & Archimedes Simulation
 * Advanced multi-layer liquid physics, flotation condition visualizer,
 * critically-damped stable integration, rich materials and liquids palette.
 */

(function () {
  'use strict';

  // 1. DICTIONARY & LOCALIZATION
  const I18N = {
    uk: {
      appTitle: 'ГідроФізика',
      appSubtitle: 'Симулятор закону Архімеда та гідростатики',
      presetsLabel: 'Сценарії:',
      presetWood: 'Дерево у воді',
      presetDiver: '🤿 Водолаз Декарта',
      presetSteel: 'Сталь (тоне)',
      presetIce: 'Айсберг',
      presetMulti2: '2 шари: Олія + Вода',
      presetMulti3: '3 шари: Олія + Вода + Ртуть',
      presetSuction: 'Притискання до дна',
      presetBoat: 'Човен',
      presetMercury: 'Залізо в ртуті',
      theoryBtn: 'Теорія',
      pause: 'Пауза',
      resume: 'Запуск',
      reset: 'Скидання',
      drop: 'Кинути',
      speedLabel: 'Швидкість:',
      wavesToggle: 'Хвилі',
      flotationBannerToggle: 'Умова плавання',
      overflowBeaker: "Витіснений об'єм",
      dragHint: 'Перетягуйте тіло мишкою або пальцем. Спробуйте опустити на саме дно!',
      suctionActiveTitle: 'Ефект притискання до дна активовано!',
      suctionActiveDesc: 'Рідини під дном немає: Архімедова сила Fa = 0! Тіло утримується тиском зверху.',
      suctionStatusActive: 'Притиснуто! Сила реакції дна N =',
      stateLabel: 'Стан тіла',
      stateFloating: 'Плавання на поверхні',
      stateFloatingLayer: 'Плавання на межі шарів',
      stateAscending: 'Спливання вгору',
      stateSinking: 'Занурення / Тоне',
      stateSuspended: 'Нейтральна плавучість',
      stateSealed: 'Притиснуто до дна (Seal)',
      stateResting: 'Лежить на дні',
      stateIn_air: 'У повітрі',
      gravityForceLabel: 'Сила тяжіння (Fg)',
      archimedesForceLabel: 'Архімедова сила (Fa)',
      netForceLabel: 'Рівнодійна сила (Fрез)',
      submergedPercentLabel: 'Занурено',
      liquidLevelRiseLabel: 'Підйом рівня (Δh)',
      tabBody: 'Тіло',
      tabLiquid: 'Рідина',
      tabForces: 'Вектори й Тиск',
      tabAnalysis: 'Аналітика',
      shapeTitle: 'Форма тіла',
      shapeBox: 'Куб / Брусок',
      shapeSphere: 'Сфера / Овал',
      shapeBoat: 'Човен',
      shapeDiver: 'Водолаз Декарта',
      diverPressureTitle: 'Тиск на ємність (Водолаз)',
      diverDesc: 'Збільшуйте зовнішній тиск (стискання ємності): повітря всередині водолаза стискається, у порожнину заходить вода, середня густина зростає і він тоне. При зниженні тиску повітря розширюється і виштовхує воду — водолаз спливає і плаває з зануренням на 2/3.',
      diverPressureLabel: 'Зовнішній тиск (P):',
      diverFloat: '🟢 1.0 атм (Спливання 2/3)',
      diverNeutral: '🟡 2.25 атм (Зависання)',
      diverSink: '🔴 2.90 атм (Занурення)',
      diverAirVol: "Об'єм повітря:",
      diverWaterVol: 'Вода всередині:',
      diverDensity: 'Густина:',
      diverTheoryHead: '5. Картезіанський водолаз (Закон Бойля-Маріотта і плавучість)',
      diverTheoryP1: 'Водолаз Декарта — класичний прилад, що наочно поєднує закон Архімеда та закон Бойля-Маріотта (P · V = const):',
      materialTitle: 'Матеріал тіла',
      matStyrofoam: 'Пінопласт (50)',
      matBalsa: 'Бальса (130)',
      matCork: 'Корок (240)',
      matPine: 'Сосна (550)',
      matOak: 'Дуб (800)',
      matWax: 'Парафін/Віск (900)',
      matIce: 'Лід (917)',
      matPlastic: 'Пластик (950)',
      matRubber: 'Гума (1100)',
      matEbony: 'Чорне дерево (1200)',
      matGlass: 'Скло (2500)',
      matAluminum: 'Алюміній (2700)',
      matIron: 'Сталь (7850)',
      matCopper: 'Мідь (8900)',
      matLead: 'Свинець (11340)',
      matGold: 'Золото (19300)',
      matCustom: 'Власний',
      bodyPropsTitle: 'Характеристики тіла (m = ρ · V)',
      densityLabel: 'Густина тіла (ρ):',
      volumeLabel: "Об'єм тіла (V):",
      massLabel: 'Маса тіла (m = ρ·V):',
      cargoTitle: 'Додатковий вантаж зверху:',
      clearCargo: 'Зняти',
      tankLayersModeTitle: 'Модель рідин у колбі',
      mode1Layer: '1 Рідина',
      mode2Layers: '2 Рідини (Шари)',
      mode3Layers: '3 Рідини (Шари)',
      liquidTypeTitle: 'Вибір рідини',
      liqGasoline: 'Бензин / Гас',
      liqAlcohol: 'Спирт етиловий',
      liqOil: 'Олія рослинна',
      liqWater: 'Чиста вода',
      liqSeaWater: 'Морська вода',
      liqMilk: 'Молоко',
      liqGlycerin: 'Гліцерин',
      liqHoney: 'Мед / Сироп',
      liqMercury: 'Ртуть',
      liqCustom: 'Власна',
      multiLayersConfigTitle: 'Налаштування шарів рідин',
      layerTop: '1. Верхній шар:',
      layerMid: '2. Середній шар:',
      layerBot: 'Нижній шар (Дно):',
      multiLayerHint: '💡 Рідини автоматично розташовуються за густиною: легші спливають нагору, важчі осідають на дно. Тіло плаватиме на межі того шару, де його густина менша за нижню рідину!',
      customLiquidTitle: 'Параметри середовища',
      liquidDensityLabel: 'Густина рідини (ρ_р):',
      tankLevelLabel: 'Початковий рівень рідини:',
      gravityParamLabel: 'Прискорення вільного падіння (g):',
      viscosityLabel: "В'язкість / Затухання:",
      vectorsTitle: 'Відображення векторів сил',
      showFg: 'Сила тяжіння (Fg = m·g)',
      showFgDesc: 'Спрямована вниз із центра мас',
      showFa: 'Архімедова виштовхувальна сила (Fa)',
      showFaDesc: "Спрямована вгору із центра зануреного об'єму",
      showFnet: 'Рівнодійна сила (Fрез = Fa + Fg)',
      showFnetDesc: 'Вектор суми всіх діючих сил',
      showPatm: 'Атмосферний тиск (P_атм)',
      showPatmDesc: 'Рівномірні стрілочки тиску повітря зверху',
      showPhydro: 'Гідростатичний тиск рідини (P_гідро)',
      showPhydroDesc: 'Стрілочки по контуру тіла (ρ·g·h)',
      showN: 'Сила реакції дна (N)',
      showNDesc: 'Виникає при контакті з дном резервуару',
      suctionModeTitle: 'Ідеальне притискання до дна (Лише плоскі тіла)',
      suctionModeDesc: 'Ефект притискання спостерігається ТІЛЬКИ у тіл з абсолютно плоскою нижньою гранню (Куб/Брусок). При ідеальному контакті рідина не потрапляє під дно (Fa = 0), а гідростатичний і атмосферний тиск зверху притискають тіло до дна. Для криволінійних тіл (сфера, конус, чаша) рідина завжди підтікає знизу, створюючи виштовхувальну силу Fa.',
      suctionToggleLabel: 'Увімкнути режим притискання (Bottom Seal)',
      suctionStatusReady: 'Готово. Опустіть плоске тіло (Куб/Брусок) на дно.',
      suctionStatusNonFlat: '⚠️ Ця форма не має абсолютно плоского дна (рідина підтікає знизу) → притискання неможливе, діє сила Архімеда Fa.',
      suctionStatusDisabled: 'Вимкнено. Увімкніть тумблер для дослідження притискання.',
      suctionStatusActive: '🔒 Тіло з плоским дном герметично притиснуте до дна (Fa = 0)! N =',
      breakSealBtn: '⚡ Зірвати тіло з дна (Порушити герметичність)',
      detailedCalcTitle: 'Покроковий фізичний розрахунок',
      step1Title: "Об'єм та маса тіла:",
      step2Title: 'Сила тяжіння:',
      step3Title: "Витіснений об'єм і Архімедова сила:",
      step4Title: 'Гідростатичний тиск на гранях:',
      step5Title: 'Умова плавання тіл:',
      bodiesManagementTitle: 'Тіла в експерименті',
      addBodyBtn: 'Додати тіло',
      removeBodyBtn: 'Видалити',
      addBodyQuick: '+ Тіло',
      removeBodyQuick: '− Тіло',
      bodyChipPrefix: 'Тіло'
    },
    en: {
      appTitle: 'HydroPhysics',
      appSubtitle: 'Archimedes Law & Hydrostatics Simulator',
      presetsLabel: 'Scenarios:',
      presetWood: 'Wood in Water',
      presetDiver: '🤿 Cartesian Diver',
      presetSteel: 'Steel (Sinks)',
      presetIce: 'Iceberg',
      presetMulti2: '2 Layers: Oil + Water',
      presetMulti3: '3 Layers: Oil + Water + Mercury',
      presetSuction: 'Bottom Suction',
      presetBoat: 'Boat Hull',
      presetMercury: 'Iron in Mercury',
      theoryBtn: 'Theory',
      pause: 'Pause',
      resume: 'Play',
      reset: 'Reset',
      drop: 'Drop',
      speedLabel: 'Speed:',
      wavesToggle: 'Waves',
      flotationBannerToggle: 'Flotation Rule',
      overflowBeaker: 'Displaced Volume',
      dragHint: 'Drag the body using mouse or touch. Try placing it flat against the bottom!',
      suctionActiveTitle: 'Bottom Suction Seal Activated!',
      suctionActiveDesc: 'Zero liquid under the flat bottom: Buoyant force Fa = 0! Fluid column above holds it down.',
      suctionStatusActive: 'Sealed! Floor reaction force N =',
      stateLabel: 'Body State',
      stateFloating: 'Floating on Surface',
      stateFloatingLayer: 'Floating at Layer Interface',
      stateAscending: 'Rising Upward',
      stateSinking: 'Sinking',
      stateSuspended: 'Neutral Equilibrium',
      stateSealed: 'Bottom Sealed (Suction)',
      stateResting: 'Resting on Bottom',
      stateIn_air: 'In Air',
      gravityForceLabel: 'Gravity Force (Fg)',
      archimedesForceLabel: 'Archimedes Force (Fa)',
      netForceLabel: 'Net Force (Fnet)',
      submergedPercentLabel: 'Submerged',
      liquidLevelRiseLabel: 'Level Rise (Δh)',
      tabBody: 'Body',
      tabLiquid: 'Liquid',
      tabForces: 'Vectors & Pressure',
      tabAnalysis: 'Analysis',
      shapeTitle: 'Body Shape',
      shapeBox: 'Cube / Block',
      shapeSphere: 'Sphere / Oval',
      shapeBoat: 'Boat',
      shapeDiver: 'Cartesian Diver',
      diverPressureTitle: 'Chamber Pressure (Diver)',
      diverDesc: 'Increase external pressure (squeezing the bottle): air inside the diver compresses, water enters the cavity, raising average density and causing it to sink. Decreasing pressure lets trapped air expand, expelling water — the diver ascends and floats with 2/3 submersion.',
      diverPressureLabel: 'External Pressure (P):',
      diverFloat: '🟢 1.0 atm (Surface 2/3)',
      diverNeutral: '🟡 2.25 atm (Hover)',
      diverSink: '🔴 2.90 atm (Sink)',
      diverAirVol: 'Air Volume:',
      diverWaterVol: 'Internal Water:',
      diverDensity: 'Density:',
      diverTheoryHead: "5. Cartesian Diver (Boyle's Law & Buoyancy)",
      diverTheoryP1: "The Cartesian Diver is a classical physics demonstration connecting Archimedes' Principle with Boyle's Law (P · V = const):",
      materialTitle: 'Body Material',
      matStyrofoam: 'Styrofoam (50)',
      matBalsa: 'Balsa (130)',
      matCork: 'Cork (240)',
      matPine: 'Pine Wood (550)',
      matOak: 'Oak (800)',
      matWax: 'Wax (900)',
      matIce: 'Ice (917)',
      matPlastic: 'Plastic (950)',
      matRubber: 'Rubber (1100)',
      matEbony: 'Ebony Wood (1200)',
      matGlass: 'Glass (2500)',
      matAluminum: 'Aluminum (2700)',
      matIron: 'Steel (7850)',
      matCopper: 'Copper (8900)',
      matLead: 'Lead (11340)',
      matGold: 'Gold (19300)',
      matCustom: 'Custom',
      bodyPropsTitle: 'Body Properties (m = ρ · V)',
      densityLabel: 'Body Density (ρ):',
      volumeLabel: 'Body Volume (V):',
      massLabel: 'Body Mass (m = ρ·V):',
      cargoTitle: 'Additional Cargo on Top:',
      clearCargo: 'Clear',
      tankLayersModeTitle: 'Liquid Layers Model',
      mode1Layer: '1 Liquid',
      mode2Layers: '2 Liquids (Layers)',
      mode3Layers: '3 Liquids (Layers)',
      liquidTypeTitle: 'Select Liquid',
      liqGasoline: 'Gasoline / Kerosene',
      liqAlcohol: 'Ethanol / Alcohol',
      liqOil: 'Vegetable Oil',
      liqWater: 'Pure Water',
      liqSeaWater: 'Sea Water',
      liqMilk: 'Milk',
      liqGlycerin: 'Glycerin',
      liqHoney: 'Honey / Syrup',
      liqMercury: 'Mercury',
      liqCustom: 'Custom',
      multiLayersConfigTitle: 'Liquid Layers Configuration',
      layerTop: '1. Top Layer:',
      layerMid: '2. Middle Layer:',
      layerBot: 'Bottom Layer (Floor):',
      multiLayerHint: '💡 Liquids automatically stratify by density: lighter liquids float, denser liquids sink. The body will float stably at the boundary where its density is lower than the bottom liquid!',
      customLiquidTitle: 'Environment Parameters',
      liquidDensityLabel: 'Liquid Density (ρ_L):',
      tankLevelLabel: 'Initial Liquid Level:',
      gravityParamLabel: 'Gravitational Accel. (g):',
      viscosityLabel: 'Viscosity / Damping:',
      vectorsTitle: 'Force Vector Displays',
      showFg: 'Gravity Force (Fg = m·g)',
      showFgDesc: 'Downward from center of mass',
      showFa: 'Buoyant / Archimedes Force (Fa)',
      showFaDesc: 'Upward from center of submerged volume',
      showFnet: 'Net Resultant Force (Fnet)',
      showFnetDesc: 'Vector sum of all applied forces',
      showPatm: 'Atmospheric Pressure (P_atm)',
      showPatmDesc: 'Downward uniform arrows on top surface',
      showPhydro: 'Hydrostatic Pressure (P_hydro)',
      showPhydroDesc: 'Perpendicular contour arrows proportional to depth (ρ·g·h)',
      showN: 'Floor Reaction Force (N)',
      showNDesc: 'Contact normal force from tank base',
      suctionModeTitle: 'Ideal Bottom Suction Seal (Flat Surfaces Only)',
      suctionModeDesc: 'The bottom suction effect occurs ONLY for bodies with an absolutely flat bottom surface (Cube / Block), where fluid cannot penetrate beneath. The buoyant force vanishes (Fa = 0), and hydrostatic plus atmospheric pressure push strongly downward. For bodies with curved or pointed contact (sphere, cone, boat, bowl), fluid always seeps underneath, sustaining Archimedes buoyancy Fa.',
      suctionToggleLabel: 'Enable Bottom Seal Mode',
      suctionStatusReady: 'Ready. Lower a flat-bottom body (Cube / Block) to the bottom.',
      suctionStatusNonFlat: '⚠️ This shape has a curved/sloped base (liquid penetrates underneath) → suction impossible, Archimedes Fa acts.',
      suctionStatusDisabled: 'Disabled. Enable the toggle to test bottom suction.',
      suctionStatusActive: '🔒 Flat-bottom body sealed to bottom (Fa = 0)! N =',
      breakSealBtn: '⚡ Break Seal (Rupture Fluid Film)',
      detailedCalcTitle: 'Step-by-Step Physics Calculation',
      step1Title: 'Volume & Body Mass:',
      step2Title: 'Gravity Force:',
      step3Title: 'Displaced Volume & Buoyant Force:',
      step4Title: 'Hydrostatic Pressure on Faces:',
      step5Title: 'Flotation Condition:',
      bodiesManagementTitle: 'Bodies in Experiment',
      addBodyBtn: 'Add Body',
      removeBodyBtn: 'Remove',
      addBodyQuick: '+ Body',
      removeBodyQuick: '− Body',
      bodyChipPrefix: 'Body'
    }
  };

  let currentLang = localStorage.getItem('hydro_lang') || 'uk';
  let currentTheme = localStorage.getItem('hydro_theme') || 'dark';

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('hydro_lang', lang);
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (I18N[lang] && I18N[lang][key]) {
        el.textContent = I18N[lang][key];
      }
    });
    const langBtn = document.getElementById('btn-lang');
    if (langBtn) {
      langBtn.querySelector('.lang-flag').textContent = lang === 'uk' ? '🇺🇦' : '🇬🇧';
      langBtn.querySelector('.lang-text').textContent = lang === 'uk' ? 'UA' : 'EN';
    }
    updateTelemetryUI();
  }

  function applyTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('hydro_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  // 2. MATERIALS PALETTE (17 Materials)
  const MATERIALS = {
    styrofoam: { density: 50, color: '#ffffff', type: 'styrofoam' },
    balsa: { density: 130, color: '#fed7aa', type: 'wood' },
    cork: { density: 240, color: '#92400e', type: 'cork' },
    pine: { density: 550, color: '#d97706', type: 'wood' },
    oak: { density: 800, color: '#78350f', type: 'wood' },
    wax: { density: 900, color: '#fef08a', type: 'wax' },
    ice: { density: 917, color: '#a5f3fc', type: 'ice' },
    plastic: { density: 950, color: '#ec4899', type: 'plastic' },
    rubber: { density: 1100, color: '#334155', type: 'rubber' },
    ebony: { density: 1200, color: '#18181b', type: 'wood' },
    glass: { density: 2500, color: '#bae6fd', type: 'glass' },
    aluminum: { density: 2700, color: '#94a3b8', type: 'aluminum' },
    iron: { density: 7850, color: '#475569', type: 'steel' },
    copper: { density: 8900, color: '#ea580c', type: 'copper' },
    lead: { density: 11340, color: '#334155', type: 'lead' },
    gold: { density: 19300, color: '#facc15', type: 'gold' },
    custom: { density: 600, color: '#3b82f6', type: 'custom' }
  };

  // 3. LIQUIDS PALETTE (10 Liquids)
  const LIQUIDS = {
    gasoline: { density: 710, nameUk: 'Бензин', nameEn: 'Gasoline', color: 'rgba(251, 146, 60, 0.45)', surfaceColor: '#fdba74' },
    alcohol: { density: 790, nameUk: 'Спирт', nameEn: 'Ethanol', color: 'rgba(192, 132, 252, 0.4)', surfaceColor: '#c084fc' },
    oil: { density: 920, nameUk: 'Олія', nameEn: 'Oil', color: 'rgba(234, 179, 8, 0.6)', surfaceColor: '#fde047' },
    water: { density: 1000, nameUk: 'Вода', nameEn: 'Water', color: 'rgba(14, 165, 233, 0.45)', surfaceColor: '#38bdf8' },
    seawater: { density: 1030, nameUk: 'Морська вода', nameEn: 'Sea Water', color: 'rgba(3, 105, 161, 0.55)', surfaceColor: '#0ea5e9' },
    milk: { density: 1030, nameUk: 'Молоко', nameEn: 'Milk', color: 'rgba(241, 245, 249, 0.85)', surfaceColor: '#ffffff' },
    glycerin: { density: 1260, nameUk: 'Гліцерин', nameEn: 'Glycerin', color: 'rgba(249, 115, 22, 0.55)', surfaceColor: '#fed7aa' },
    honey: { density: 1420, nameUk: 'Мед / Сироп', nameEn: 'Honey', color: 'rgba(180, 83, 9, 0.75)', surfaceColor: '#fbbf24' },
    mercury: { density: 13600, nameUk: 'Ртуть', nameEn: 'Mercury', color: 'rgba(148, 163, 184, 0.95)', surfaceColor: '#f1f5f9' },
    custom: { density: 1000, nameUk: 'Власна', nameEn: 'Custom', color: 'rgba(56, 189, 248, 0.5)', surfaceColor: '#38bdf8' }
  };

  // 4. GLOBAL STATE
  const State = {
    running: true,
    speed: 1.0,
    g: 9.81,
    atmPressure: 101325,
    time: 0,
    
    // Tank & Layer Configuration
    tank: {
      widthM: 0.6,
      heightM: 0.8,
      areaM2: 0.24,
      totalLiquidHeightM: 0.40,
      currentTotalLiquidHeightM: 0.40,
      deltaHeightM: 0,
      layerMode: 1, // 1, 2, or 3
      layers: [
        { type: 'water', density: 1000, color: LIQUIDS.water.color, surfaceColor: LIQUIDS.water.surfaceColor, heightRatio: 1.0 }
      ],
      x: 0, y: 0, w: 0, h: 0,
      floorY: 0
    },

    // Multi-body collection
    bodies: [
      createBody(1, 'box', 'pine', 550, 2.5, 0.30, 0.52)
    ],
    selectedBodyIndex: 0,

    get body() {
      if (!this.bodies || this.bodies.length === 0) {
        this.bodies = [createBody(1, 'box', 'pine', 550, 2.5, 0.30, 0.52)];
      }
      if (this.selectedBodyIndex < 0 || this.selectedBodyIndex >= this.bodies.length) {
        this.selectedBodyIndex = 0;
      }
      return this.bodies[this.selectedBodyIndex];
    },

    liquid: {
      type: 'water',
      density: 1000,
      viscosityDamping: 0.98
    },

    showVectors: {
      fg: true,
      fa: true,
      fnet: true,
      patm: true,
      phydro: true,
      n: true
    },
    suctionModeEnabled: false,
    showOverflowBeaker: true,
    showFlotationRule: true,
    bannerPos: { x: null, y: null },
    diverPressure: 1.00,

    drag: {
      isDragging: false,
      pointerId: null,
      bodyIndex: 0,
      offsetY: 0,
      offsetX: 0
    },

    waves: {
      enabled: true,
      points: 80,
      heights: new Float32Array(80),
      velocities: new Float32Array(80),
      wasInWater: false
    }
  };

  function createBody(id, shape = 'box', material = 'pine', density = 550, volumeL = 2.5, x = 0.30, y = 0.52) {
    const mat = MATERIALS[material] || MATERIALS.pine;
    const finalDensity = density || mat.density;
    const vM3 = volumeL / 1000;
    const massKg = finalDensity * vM3;
    const side = Math.cbrt(vM3);
    const body = {
      id: id,
      shape: shape,
      material: material,
      density: finalDensity,
      volumeL: volumeL,
      massKg: massKg,
      cargoMassKg: 0,
      airVolumeL: 1.50,
      waterVolumeL: 0.00,
      widthM: side * 1.1,
      heightM: side * 0.9,
      radiusM: Math.cbrt((3 * vM3) / (4 * Math.PI)),
      y: y,
      x: x,
      vy: 0,
      submergedRatio: 0,
      submergedVolumeL: 0,
      fg: 0,
      fa: 0,
      fnet: 0,
      nForce: 0,
      dragForce: 0,
      isSealedToBottom: false,
      flotationState: 'in_air',
      flotationRuleText: '',
      flotationRuleMath: '',
      flotationRuleClass: 'banner-float',
      wasInWater: false
    };
    if (shape === 'diver') {
      updateDiverPhysics(body);
    }
    return body;
  }

  /**
   * Updates Cartesian Diver (Водолаз Декарта) physics based on vessel pressure.
   * At P = 1.0 atm: rho = 2/3 * rho_liquid -> floats with 2/3 submerged on surface.
   * At P > 1.0 atm: Boyle's law compresses trapped air, water enters, rho increases -> sinks!
   * At P < 2.0 atm: trapped air expands, expels water -> surfaces with 2/3 submersion.
   */
  function updateDiverPhysics(body) {
    if (!body || body.shape !== 'diver') return;
    const P = Math.max(1.0, State.diverPressure || 1.0);
    const rhoLiq = State.tank.layers[0]?.density || State.liquid.density || 1000;
    const V0 = body.volumeL;
    const Vair0 = 0.60 * V0;
    const Vair = Vair0 / P;
    const VwaterIn = Vair0 - Vair;
    // Exactly 2/3 submersion at P = 1.0 atm
    const baseRho = (2 / 3) * rhoLiq;
    const effRho = baseRho + rhoLiq * (VwaterIn / V0);
    body.density = effRho;
    body.airVolumeL = Vair;
    body.waterVolumeL = VwaterIn;
    const vM3 = body.volumeL / 1000;
    body.massKg = body.density * vM3;
  }

  /**
   * Identifies whether a shape has an absolutely flat horizontal bottom face
   * Only bodies with a flat surface can exclude fluid film and seal to the tank floor.
   */
  function hasFlatBottomSurface(shape) {
    return shape === 'box';
  }

  // 5. RECALCULATE LAYERS
  function refreshTankLayers() {
    const mode = State.tank.layerMode;
    if (mode === 1) {
      const liq = LIQUIDS[State.liquid.type] || LIQUIDS.water;
      State.tank.layers = [
        { type: State.liquid.type, density: State.liquid.density, color: liq.color, surfaceColor: liq.surfaceColor, heightRatio: 1.0 }
      ];
    } else if (mode === 2) {
      const topKey = document.getElementById('select-layer-top')?.value || 'oil';
      const botKey = document.getElementById('select-layer-bot')?.value || 'water';
      const topLiq = LIQUIDS[topKey] || LIQUIDS.oil;
      const botLiq = LIQUIDS[botKey] || LIQUIDS.water;
      
      State.tank.layers = [
        { type: topKey, density: topLiq.density, color: topLiq.color, surfaceColor: topLiq.surfaceColor, heightRatio: 0.5 },
        { type: botKey, density: botLiq.density, color: botLiq.color, surfaceColor: botLiq.surfaceColor, heightRatio: 0.5 }
      ];
    } else if (mode === 3) {
      const topKey = document.getElementById('select-layer-top')?.value || 'oil';
      const midKey = document.getElementById('select-layer-mid')?.value || 'water';
      const botKey = document.getElementById('select-layer-bot')?.value || 'mercury';
      const topLiq = LIQUIDS[topKey] || LIQUIDS.oil;
      const midLiq = LIQUIDS[midKey] || LIQUIDS.water;
      const botLiq = LIQUIDS[botKey] || LIQUIDS.mercury;

      State.tank.layers = [
        { type: topKey, density: topLiq.density, color: topLiq.color, surfaceColor: topLiq.surfaceColor, heightRatio: 0.333 },
        { type: midKey, density: midLiq.density, color: midLiq.color, surfaceColor: midLiq.surfaceColor, heightRatio: 0.333 },
        { type: botKey, density: botLiq.density, color: botLiq.color, surfaceColor: botLiq.surfaceColor, heightRatio: 0.334 }
      ];
    }
  }

  // 6. PHYSICS COMPUTATIONS
  function updateBodyPropertiesFromDensityAndVolume() {
    const curBody = State.body;
    const vM3 = curBody.volumeL / 1000;
    curBody.massKg = curBody.density * vM3;
    const side = Math.cbrt(vM3);
    curBody.widthM = side * 1.1;
    curBody.heightM = side * 0.9;
    curBody.radiusM = Math.cbrt((3 * vM3) / (4 * Math.PI));
    updateUIInputs();
    renderBodyChips();
  }

  function updateBodyPropertiesFromMass() {
    const curBody = State.body;
    const vM3 = curBody.massKg / curBody.density;
    curBody.volumeL = Math.max(0.2, vM3 * 1000);
    const side = Math.cbrt(vM3);
    curBody.widthM = side * 1.1;
    curBody.heightM = side * 0.9;
    curBody.radiusM = Math.cbrt((3 * vM3) / (4 * Math.PI));
    updateUIInputs();
    renderBodyChips();
  }

  /**
   * Calculates submersion across multiple liquid layers for any body
   * Returns: total submerged volume, submerged ratio, total buoyant force Fa
   */
  function calculateMultiLayerSubmersion(body, totalWaterHeight) {
    const bodyH = body.heightM;
    const bodyY = body.y;
    const bodyBottom = bodyY - bodyH / 2;
    const bodyTop = bodyY + bodyH / 2;
    const totalVolL = body.volumeL;

    if (totalWaterHeight <= bodyBottom) {
      return { totalSubVolumeL: 0, submergedRatio: 0, totalFa: 0, layerSubmersions: [] };
    }

    const layers = State.tank.layers;
    let accumulatedH = 0;
    let totalFa = 0;
    let totalSubVolumeL = 0;
    const layerSubmersions = [];

    const numLayers = layers.length;
    const reversedLayers = [...layers].reverse(); // bottom to top

    for (let i = 0; i < numLayers; i++) {
      const layer = reversedLayers[i];
      const layerThickness = totalWaterHeight * layer.heightRatio;
      const layerBottom = accumulatedH;
      const layerTop = accumulatedH + layerThickness;
      accumulatedH = layerTop;

      const overlapBottom = Math.max(bodyBottom, layerBottom);
      const overlapTop = Math.min(bodyTop, layerTop);
      const overlapHeight = Math.max(0, overlapTop - overlapBottom);

      if (overlapHeight > 0) {
        let linearSubRatio = overlapHeight / bodyH;
        let layerSubRatio = linearSubRatio;

        if (body.shape === 'sphere') {
          layerSubRatio = linearSubRatio * (1.0 - 0.2 * Math.abs(0.5 - (overlapBottom + overlapTop) / (2 * bodyH)));
        } else if (body.shape === 'cone') {
          layerSubRatio = Math.pow(overlapTop / bodyH, 2.5) - Math.pow(overlapBottom / bodyH, 2.5);
        } else if (body.shape === 'boat') {
          layerSubRatio = linearSubRatio * 0.9;
        }

        layerSubRatio = Math.min(1.0, Math.max(0.0, layerSubRatio));
        const layerSubVolL = layerSubRatio * totalVolL;
        const layerFa = layer.density * (layerSubVolL / 1000) * State.g;

        totalSubVolumeL += layerSubVolL;
        totalFa += layerFa;
        layerSubmersions.push({
          type: layer.type,
          density: layer.density,
          overlapHeight,
          layerSubVolL,
          layerFa
        });
      }
    }

    totalSubVolumeL = Math.min(totalVolL, totalSubVolumeL);
    const submergedRatio = Math.min(1.0, Math.max(0.0, totalSubVolumeL / totalVolL));

    return {
      totalSubVolumeL,
      submergedRatio,
      totalFa,
      layerSubmersions
    };
  }

  function updateWaves() {
    if (!State.waves.enabled) return;
    const n = State.waves.points;
    const heights = State.waves.heights;
    const velocities = State.waves.velocities;
    
    // Physical spring constants
    const tension = 0.032;
    const baseDamp = State.liquid.viscosityDamping || 0.98;
    const damping = Math.max(0.93, Math.min(0.985, baseDamp));
    const spread = 0.20;

    // 1. Update spring displacement & acceleration
    for (let i = 0; i < n; i++) {
      const displacement = heights[i];
      const acceleration = -tension * displacement;
      velocities[i] = (velocities[i] + acceleration) * damping;
      heights[i] += velocities[i];
    }

    // 2. Symmetric multi-pass neighbor wave propagation
    const leftDeltas = new Float32Array(n);
    const rightDeltas = new Float32Array(n);

    for (let pass = 0; pass < 4; pass++) {
      for (let i = 0; i < n; i++) {
        if (i > 0) {
          leftDeltas[i] = spread * (heights[i] - heights[i - 1]);
          velocities[i - 1] += leftDeltas[i];
        }
        if (i < n - 1) {
          rightDeltas[i] = spread * (heights[i] - heights[i + 1]);
          velocities[i + 1] += rightDeltas[i];
        }
      }
      for (let i = 0; i < n; i++) {
        if (i > 0) heights[i - 1] += leftDeltas[i];
        if (i < n - 1) heights[i + 1] += rightDeltas[i];
        // Clamping to prevent numerical explosion or visual distortion
        heights[i] = Math.max(-0.04, Math.min(0.04, heights[i]));
      }
    }
  }

  function splashWave(relX, intensity, width = 6) {
    if (!State.waves.enabled) return;
    const n = State.waves.points;
    const centerIdx = Math.round(Math.max(0, Math.min(1, relX)) * (n - 1));
    const radius = Math.max(2, Math.min(12, Math.round(width)));
    const clampedIntensity = Math.max(-0.06, Math.min(0.06, intensity));

    for (let i = -radius; i <= radius; i++) {
      const idx = centerIdx + i;
      if (idx >= 0 && idx < n) {
        const factor = Math.cos((i / radius) * (Math.PI / 2));
        State.waves.velocities[idx] += clampedIntensity * factor;
      }
    }
  }

  /**
   * Evaluates and updates the Flotation Rule explanation based on densities & forces
   */
  function evaluateFlotationCondition(body, totalMass, maxFa) {
    const mode = State.tank.layerMode;
    const isUk = currentLang === 'uk';

    if (body.isSealedToBottom) {
      body.flotationRuleText = isUk
        ? '⚡ Ефект притискання: Рідина відсутня під дном тіла → Fa = 0. Атмосферний і гідростатичний тиск зверху притискають тіло до дна.'
        : '⚡ Bottom Suction: Zero liquid film below → Fa = 0. Downward fluid column & atmosphere pin the body down.';
      body.flotationRuleMath = 'Fa = 0 | N = Fg + F_тиску';
      body.flotationRuleClass = 'banner-sealed';
      return;
    }

    if (mode === 1) {
      const rhoLiq = State.liquid.density;
      const rhoBody = body.density;
      const subPct = Math.min(100, (rhoBody / rhoLiq) * 100);

      if (rhoBody < rhoLiq - 5) {
        body.flotationRuleText = isUk
          ? `🟢 Густина тіла (${rhoBody} кг/м³) < густини рідини (${rhoLiq} кг/м³) → Тіло спливає і плаває на поверхні, занурившись на ${subPct.toFixed(1)}%.`
          : `🟢 Body density (${rhoBody} kg/m³) < liquid (${rhoLiq} kg/m³) → Floats on surface with ${subPct.toFixed(1)}% submerged.`;
        body.flotationRuleMath = `ρ_тіла < ρ_р ⟹ Fg < Fa,max ⟹ Плаває (${subPct.toFixed(0)}%)`;
        body.flotationRuleClass = 'banner-float';
      } else if (Math.abs(rhoBody - rhoLiq) <= 5) {
        body.flotationRuleText = isUk
          ? `🟡 Густина тіла (${rhoBody} кг/м³) ≈ густині рідини (${rhoLiq} кг/м³) → Нейтральна плавучість (тіло зависає в товщі рідини на будь-якій глибині).`
          : `🟡 Body density (${rhoBody} kg/m³) ≈ liquid (${rhoLiq} kg/m³) → Neutral buoyancy (stays suspended at depth).`;
        body.flotationRuleMath = 'ρ_тіла = ρ_р ⟹ Fg = Fa,max ⟹ Зависання';
        body.flotationRuleClass = 'banner-neutral';
      } else {
        const netDown = (totalMass * State.g - maxFa).toFixed(1);
        body.flotationRuleText = isUk
          ? `🔴 Густина тіла (${rhoBody} кг/м³) > густини рідини (${rhoLiq} кг/м³) → Тіло тоне і лягає на дно (тиск на дно N = ${netDown} Н).`
          : `🔴 Body density (${rhoBody} kg/m³) > liquid (${rhoLiq} kg/m³) → Body sinks to bottom (floor normal force N = ${netDown} N).`;
        body.flotationRuleMath = `ρ_тіла > ρ_р ⟹ Fg > Fa,max ⟹ Тоне (N = ${netDown} Н)`;
        body.flotationRuleClass = 'banner-sink';
      }
    } else {
      // Multi-layer condition
      const topLiq = State.tank.layers[0];
      const botLiq = State.tank.layers[State.tank.layers.length - 1];
      const rhoBody = body.density;

      if (rhoBody < topLiq.density) {
        const subPct = ((rhoBody / topLiq.density) * 100).toFixed(1);
        body.flotationRuleText = isUk
          ? `🟢 Тіло легше за верхній шар (${topLiq.density} кг/м³) → Плаває на поверхні найлегшої рідини (занурено на ${subPct}%).`
          : `🟢 Body is lighter than top layer (${topLiq.density} kg/m³) → Floats on top surface (${subPct}% submerged).`;
        body.flotationRuleMath = `ρ_тіла < ρ_верх ⟹ Плаває на поверхні`;
        body.flotationRuleClass = 'banner-float';
      } else if (rhoBody > botLiq.density) {
        body.flotationRuleText = isUk
          ? `🔴 Тіло важче за найгустіший нижній шар (${botLiq.density} кг/м³) → Тоне крізь усі шари й лягає на дно колби.`
          : `🔴 Body is denser than bottom layer (${botLiq.density} kg/m³) → Sinks through all layers to the floor.`;
        body.flotationRuleMath = `ρ_тіла > ρ_дно ⟹ Тоне на дно`;
        body.flotationRuleClass = 'banner-sink';
      } else {
        body.flotationRuleText = isUk
          ? `🌈 Тіло тоне у верхньому шарі, але плаває на межі розділу нижнього шару! (Стабільна рівновага між шарами).`
          : `🌈 Body sinks through upper fluid but floats at the layer interface! (Stable boundary flotation).`;
        body.flotationRuleMath = `ρ_верх < ρ_тіла < ρ_ниж ⟹ Плаває на межі шарів`;
        body.flotationRuleClass = 'banner-neutral';
      }
    }
  }

  /**
   * Physics step with 4 sub-steps and critical equilibrium damping for all bodies in experiment
   */
  function physicsStep(dt) {
    if (!State.running) return;

    const clampedDt = Math.min(dt * State.speed, 0.033);
    const subSteps = 4;
    const subDt = clampedDt / subSteps;

    const tank = State.tank;
    const bodies = State.bodies;

    for (let s = 0; s < subSteps; s++) {
      // 0. Update Diver physics for any Cartesian Divers
      for (let i = 0; i < bodies.length; i++) {
        if (bodies[i].shape === 'diver') {
          updateDiverPhysics(bodies[i]);
        }
      }

      // 1. Calculate total initial displaced volume across ALL bodies to compute liquid level rise (Δh)
      let totalAllSubVolumeL = 0;
      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        const initSub = calculateMultiLayerSubmersion(b, tank.totalLiquidHeightM);
        totalAllSubVolumeL += initSub.totalSubVolumeL;
      }

      const deltaH = (totalAllSubVolumeL / 1000) / tank.areaM2;
      tank.deltaHeightM = deltaH;
      tank.currentTotalLiquidHeightM = tank.totalLiquidHeightM + deltaH;

      // 2. Submersion and force integration for each body
      for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];
        const totalMass = body.massKg + body.cargoMassKg;
        const halfH = body.heightM / 2;

        const sub = calculateMultiLayerSubmersion(body, tank.currentTotalLiquidHeightM);
        body.submergedRatio = sub.submergedRatio;
        body.submergedVolumeL = sub.totalSubVolumeL;
        body.fg = totalMass * State.g;

        const touchingBottom = body.y - halfH <= 0.002;
        const isFlat = hasFlatBottomSurface(body.shape);
        if (State.suctionModeEnabled && touchingBottom && isFlat) {
          body.isSealedToBottom = true;
        } else if (!isFlat && body.isSealedToBottom) {
          body.isSealedToBottom = false;
        }

        if (body.isSealedToBottom) {
          body.fa = 0; // Buoyancy vanishes!
          const botDensity = tank.layers[tank.layers.length - 1].density;
          const topDepth = Math.max(0, tank.currentTotalLiquidHeightM - (body.y + halfH));
          const areaTop = (body.volumeL / 1000) / body.heightM;
          const pTopHydro = botDensity * State.g * topDepth;
          const fHoldDown = (pTopHydro + State.atmPressure * 0.05) * areaTop;
          body.nForce = body.fg + fHoldDown;
          body.fnet = 0;
          body.vy = 0;
          body.y = halfH;
          body.flotationState = 'sealed';
        } else {
          body.fa = sub.totalFa;
          
          // Fluid drag & Hydrodynamic critical damping
          const topLayerDensity = State.tank.layers[0].density;
          const effectiveDensity = sub.submergedRatio > 0.05 ? (topLayerDensity * sub.submergedRatio) : 1.225;
          const area = body.widthM * (sub.submergedRatio > 0 ? body.heightM * sub.submergedRatio : body.heightM);
          
          // Quadratic form drag
          const formDrag = 0.5 * effectiveDensity * 0.85 * area * body.vy * Math.abs(body.vy);

          // Hydrodynamic buoyancy oscillation damping (scales with sqrt(k_eff * m))
          const crossArea = (body.volumeL / 1000) / body.heightM;
          const kEff = topLayerDensity * State.g * crossArea;
          const cCrit = 2 * Math.sqrt(Math.max(1, kEff * totalMass));
          const viscousDrag = body.vy * cCrit * 0.72 * Math.min(1.0, sub.submergedRatio * 1.5);
          body.dragForce = formDrag + viscousDrag;

          body.fnet = body.fa - body.fg - body.dragForce;

          const isBeingDragged = State.drag.isDragging && State.drag.bodyIndex === i;

          if (!isBeingDragged) {
            const ay = body.fnet / totalMass;
            body.vy += ay * subDt;
            body.y += body.vy * subDt;

            // Surface Entry / Exit Splash & Slamming Impact Dissipation
            const isSubmerged = sub.submergedRatio > 0.005;
            if (!body.wasInWater && isSubmerged) {
              const entrySpeed = Math.abs(body.vy);
              const splashIntensity = -Math.min(0.045, Math.max(0.008, entrySpeed * 0.015));
              splashWave(body.x / tank.widthM, splashIntensity, 7);
              body.wasInWater = true;

              // Liquid entry hydrodynamic slamming dissipation
              if (body.vy < 0) {
                const densityRatio = Math.min(15, topLayerDensity / Math.max(50, body.density));
                const impactFactor = Math.max(0.18, 0.45 - (densityRatio - 1) * 0.02);
                body.vy *= impactFactor;
              }
            } else if (body.wasInWater && !isSubmerged) {
              body.wasInWater = false;
            }

            // Equilibrium damping snap (eliminates endless micro-oscillations)
            if (sub.submergedRatio > 0.01 && sub.submergedRatio < 0.99) {
              if (Math.abs(body.vy) < 0.015 && Math.abs(ay) < 0.20) {
                body.vy = 0;
              }
            }

            // Bottom Tank Collision
            if (body.y - halfH <= 0) {
              body.y = halfH;
              if (body.vy < -0.08) {
                splashWave(body.x / tank.widthM, Math.max(-0.025, body.vy * 0.01), 6);
                body.vy = -body.vy * 0.15;
              } else {
                body.vy = 0;
                body.nForce = Math.max(0, body.fg - body.fa);
              }
            } else {
              body.nForce = 0;
            }

            // Top Tank Clamping
            if (body.y + halfH > tank.heightM) {
              body.y = tank.heightM - halfH;
              body.vy = 0;
            }

            // Gentle surface ripples when body moves rapidly through the waterline
            if (Math.abs(body.vy) > 0.12 && sub.submergedRatio > 0.02 && sub.submergedRatio < 0.98) {
              splashWave(body.x / tank.widthM, body.vy * 0.0015, 5);
            }
          }

          // Flotation state classification
          if (body.y - halfH <= 0.004 && body.fg > body.fa) {
            body.flotationState = 'resting';
          } else if (sub.submergedRatio <= 0.001) {
            body.flotationState = 'in_air';
          } else if (Math.abs(body.fa - body.fg) < 0.08 && sub.submergedRatio < 0.99) {
            body.flotationState = State.tank.layerMode > 1 ? 'floatingLayer' : 'floating';
          } else if (sub.submergedRatio >= 0.99 && Math.abs(body.fa - body.fg) < 0.1) {
            body.flotationState = 'suspended';
          } else if (body.vy > 0.04) {
            body.flotationState = 'ascending';
          } else if (body.vy < -0.04 || body.fg > body.fa) {
            body.flotationState = 'sinking';
          } else {
            body.flotationState = 'floating';
          }
        }
      }

      // 3. Body-to-body collision separation (gentle horizontal repulsion so bodies do not overlap)
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const b1 = bodies[i];
          const b2 = bodies[j];
          const minW = (b1.widthM + b2.widthM) / 2 + 0.012;
          const minH = (b1.heightM + b2.heightM) / 2;
          const dx = b1.x - b2.x;
          const dy = b1.y - b2.y;

          if (Math.abs(dx) < minW && Math.abs(dy) < minH) {
            const overlapX = minW - Math.abs(dx);
            const dir = (dx >= 0 ? 1 : -1);
            const isB1Drag = State.drag.isDragging && State.drag.bodyIndex === i;
            const isB2Drag = State.drag.isDragging && State.drag.bodyIndex === j;

            if (isB1Drag && !isB2Drag) {
              b2.x -= dir * overlapX;
            } else if (isB2Drag && !isB1Drag) {
              b1.x += dir * overlapX;
            } else {
              b1.x += dir * overlapX * 0.5;
              b2.x -= dir * overlapX * 0.5;
            }
          }
        }
      }

      // Keep bodies within horizontal boundaries of tank
      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        const halfW = b.widthM / 2;
        b.x = Math.max(halfW + 0.02, Math.min(tank.widthM - halfW - 0.02, b.x));
      }
    }

    // Evaluate Flotation Condition for all bodies
    for (let i = 0; i < bodies.length; i++) {
      const b = bodies[i];
      const m = b.massKg + b.cargoMassKg;
      const maxFa = State.tank.layers[State.tank.layers.length - 1].density * (b.volumeL / 1000) * State.g;
      evaluateFlotationCondition(b, m, maxFa);
    }

    updateWaves();
    State.time += clampedDt;
    updateTelemetryUI();
  }

  // 7. CANVAS RENDERING
  const canvas = document.getElementById('sim-canvas');
  const ctx = canvas.getContext('2d');
  let dpr = window.devicePixelRatio || 1;

  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    
    const marginX = Math.max(30, rect.width * 0.12);
    const marginY = 30;
    const availableW = rect.width - marginX * 2 - (State.showOverflowBeaker ? 90 : 0);
    const availableH = rect.height - marginY * 2 - 80;

    const tankAspect = State.tank.widthM / State.tank.heightM;
    let tw = availableW;
    let th = tw / tankAspect;

    if (th > availableH) {
      th = availableH;
      tw = th * tankAspect;
    }

    State.tank.x = marginX;
    State.tank.y = marginY + 15;
    State.tank.w = tw;
    State.tank.h = th;
    State.tank.floorY = State.tank.y + th;
  }

  window.addEventListener('resize', resizeCanvas);

  function worldToScreen(wx, wy) {
    const tank = State.tank;
    return {
      x: tank.x + (wx / tank.widthM) * tank.w,
      y: tank.floorY - (wy / tank.heightM) * tank.h
    };
  }

  function screenToWorld(px, py) {
    const tank = State.tank;
    return {
      x: ((px - tank.x) / tank.w) * tank.widthM,
      y: ((tank.floorY - py) / tank.h) * tank.heightM
    };
  }

  function drawVector(startX, startY, endX, endY, color, label, valueText, isDotted) {
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.hypot(dx, dy);
    if (length < 2) return;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;
    if (isDotted) ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.setLineDash([]);

    const headLength = Math.min(14, Math.max(8, length * 0.25));
    const angle = Math.atan2(dy, dx);

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6), endY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6), endY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    if (label || valueText) {
      const midX = (startX + endX) / 2 + Math.sin(angle) * 16;
      const midY = (startY + endY) / 2 - Math.cos(angle) * 16;
      const fullText = valueText ? `${label}: ${valueText}` : label;
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      const textMetrics = ctx.measureText(fullText);

      ctx.fillStyle = currentTheme === 'dark' ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      
      const bgX = midX - textMetrics.width / 2 - 4;
      const bgY = midY - 9;
      ctx.beginPath();
      ctx.roundRect(bgX, bgY, textMetrics.width + 8, 16, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(fullText, midX, midY);
    }
    ctx.restore();
  }

  function renderBodyMaterial(bx, by, bw, bh, shape, materialKey, bodyObj) {
    const curBody = bodyObj || State.body;
    const mat = MATERIALS[materialKey] || MATERIALS.pine;
    ctx.save();
    ctx.beginPath();

    if (shape === 'box') {
      ctx.roundRect(bx - bw / 2, by - bh / 2, bw, bh, 6);
    } else if (shape === 'sphere') {
      ctx.ellipse(bx, by, bw / 2, bh / 2, 0, 0, Math.PI * 2);
    } else if (shape === 'cone') {
      ctx.moveTo(bx, by + bh / 2);
      ctx.lineTo(bx - bw / 2, by - bh / 2);
      ctx.lineTo(bx + bw / 2, by - bh / 2);
      ctx.closePath();
    } else if (shape === 'cone-up') {
      ctx.moveTo(bx, by - bh / 2);
      ctx.lineTo(bx - bw / 2, by + bh / 2);
      ctx.lineTo(bx + bw / 2, by + bh / 2);
      ctx.closePath();
    } else if (shape === 'boat') {
      ctx.moveTo(bx - bw / 2, by - bh / 2);
      ctx.lineTo(bx + bw / 2, by - bh / 2);
      ctx.lineTo(bx + bw * 0.35, by + bh / 2);
      ctx.lineTo(bx - bw * 0.35, by + bh / 2);
      ctx.closePath();
    } else if (shape === 'diver') {
      // Cartesian Diver ampoule (dome head, cylindrical body, open bottom tail)
      const r = bw * 0.42;
      const tailW = bw * 0.34;
      const tailH = bh * 0.16;
      ctx.moveTo(bx - r, by - bh / 2 + r);
      ctx.arc(bx, by - bh / 2 + r, r, Math.PI, 0);
      ctx.lineTo(bx + r, by + bh / 2 - tailH);
      ctx.lineTo(bx + tailW / 2, by + bh / 2);
      ctx.lineTo(bx - tailW / 2, by + bh / 2);
      ctx.lineTo(bx - r, by + bh / 2 - tailH);
      ctx.closePath();
    } else if (shape === 'hollow') {
      ctx.arc(bx, by, bw / 2, 0, Math.PI);
      ctx.lineTo(bx - bw / 2, by);
      ctx.closePath();
    }
    ctx.clip();

    ctx.fillStyle = mat.color;
    ctx.fillRect(bx - bw / 2 - 10, by - bh / 2 - 10, bw + 20, bh + 20);

    // If shape is Cartesian Diver, render the internal fluid, trapped air bubble, and meniscus
    if (shape === 'diver') {
      const P = Math.max(1.0, State.diverPressure || 1.0);
      const airRatio = Math.max(0.12, 1.0 / P);
      const chamberTop = by - bh / 2 + 4;
      const chamberBot = by + bh / 2;
      const chamberH = chamberBot - chamberTop;
      const airH = chamberH * 0.60 * airRatio;
      const meniscusY = chamberTop + airH;

      // Internal air bubble (upper portion)
      const airGrad = ctx.createLinearGradient(bx, chamberTop, bx, meniscusY);
      airGrad.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
      airGrad.addColorStop(0.7, 'rgba(224, 242, 254, 0.75)');
      airGrad.addColorStop(1, 'rgba(186, 230, 253, 0.60)');
      ctx.fillStyle = airGrad;
      ctx.fillRect(bx - bw / 2, chamberTop, bw, airH);

      // Trapped water inside diver (lower portion)
      const waterGrad = ctx.createLinearGradient(bx, meniscusY, bx, chamberBot);
      const liqColor = State.tank.layers[0]?.color || '#0284c7';
      waterGrad.addColorStop(0, liqColor);
      waterGrad.addColorStop(1, 'rgba(14, 116, 144, 0.95)');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(bx - bw / 2, meniscusY, bw, chamberBot - meniscusY);

      // Meniscus curved boundary line between air and water
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(bx - bw * 0.38, meniscusY);
      ctx.quadraticCurveTo(bx, meniscusY + 3.5, bx + bw * 0.38, meniscusY);
      ctx.stroke();

      // Measurement tick marks along the side
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      for (let ty = chamberTop + 10; ty < chamberBot - 6; ty += 8) {
        ctx.beginPath();
        ctx.moveTo(bx - bw * 0.34, ty);
        ctx.lineTo(bx - bw * 0.22, ty);
        ctx.stroke();
      }

      // Air label badge
      ctx.fillStyle = '#0369a1';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('AIR', bx, chamberTop + airH * 0.5);
    }

    // Procedural material textures
    if (mat.type === 'wood') {
      ctx.strokeStyle = materialKey === 'oak' ? '#451a03' : (materialKey === 'ebony' ? '#27272a' : '#b45309');
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.4;
      for (let y = by - bh / 2; y <= by + bh / 2; y += 7) {
        ctx.beginPath();
        ctx.moveTo(bx - bw / 2, y);
        ctx.bezierCurveTo(bx - bw / 4, y + 4, bx + bw / 4, y - 4, bx + bw / 2, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;
    } else if (mat.type === 'cork') {
      ctx.fillStyle = '#b45309';
      ctx.globalAlpha = 0.3;
      for (let x = bx - bw / 2; x < bx + bw / 2; x += 6) {
        for (let y = by - bh / 2; y < by + bh / 2; y += 6) {
          ctx.fillRect(x + ((y % 12 === 0) ? 3 : 0), y, 2, 2);
        }
      }
      ctx.globalAlpha = 1.0;
    } else if (mat.type === 'steel' || mat.type === 'aluminum' || mat.type === 'copper' || mat.type === 'lead') {
      const metalGrad = ctx.createLinearGradient(bx - bw / 2, by - bh / 2, bx + bw / 2, by + bh / 2);
      if (mat.type === 'copper') {
        metalGrad.addColorStop(0, '#ea580c');
        metalGrad.addColorStop(0.5, '#fed7aa');
        metalGrad.addColorStop(1, '#9a3412');
      } else {
        metalGrad.addColorStop(0, '#94a3b8');
        metalGrad.addColorStop(0.5, '#f1f5f9');
        metalGrad.addColorStop(1, '#475569');
      }
      ctx.fillStyle = metalGrad;
      ctx.fillRect(bx - bw / 2, by - bh / 2, bw, bh);
    } else if (mat.type === 'ice') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.7;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(bx - bw / 3 + i * 8, by - bh / 2);
        ctx.lineTo(bx - bw / 4 + i * 7, by + bh / 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;
    } else if (mat.type === 'glass') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(bx - bw / 4, by - bh / 2, bw / 5, bh);
    }

    ctx.restore();
    ctx.save();
    ctx.strokeStyle = currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;

    if (shape === 'box') {
      ctx.beginPath();
      ctx.roundRect(bx - bw / 2, by - bh / 2, bw, bh, 6);
      ctx.stroke();
    } else if (shape === 'sphere') {
      ctx.beginPath();
      ctx.ellipse(bx, by, bw / 2, bh / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (shape === 'cone') {
      ctx.beginPath();
      ctx.moveTo(bx, by + bh / 2);
      ctx.lineTo(bx - bw / 2, by - bh / 2);
      ctx.lineTo(bx + bw / 2, by - bh / 2);
      ctx.closePath();
      ctx.stroke();
    } else if (shape === 'cone-up') {
      ctx.beginPath();
      ctx.moveTo(bx, by - bh / 2);
      ctx.lineTo(bx - bw / 2, by + bh / 2);
      ctx.lineTo(bx + bw / 2, by + bh / 2);
      ctx.closePath();
      ctx.stroke();
    } else if (shape === 'boat') {
      ctx.beginPath();
      ctx.moveTo(bx - bw / 2, by - bh / 2);
      ctx.lineTo(bx + bw / 2, by - bh / 2);
      ctx.lineTo(bx + bw * 0.35, by + bh / 2);
      ctx.lineTo(bx - bw * 0.35, by + bh / 2);
      ctx.closePath();
      ctx.stroke();
    } else if (shape === 'diver') {
      const r = bw * 0.42;
      const tailW = bw * 0.34;
      const tailH = bh * 0.16;
      ctx.beginPath();
      ctx.moveTo(bx - r, by - bh / 2 + r);
      ctx.arc(bx, by - bh / 2 + r, r, Math.PI, 0);
      ctx.lineTo(bx + r, by + bh / 2 - tailH);
      ctx.lineTo(bx + tailW / 2, by + bh / 2);
      ctx.lineTo(bx - tailW / 2, by + bh / 2);
      ctx.lineTo(bx - r, by + bh / 2 - tailH);
      ctx.closePath();
      ctx.stroke();

      // Draw glass glare reflex along left rim
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bx - r * 0.7, by - bh / 2 + r * 0.8);
      ctx.lineTo(bx - r * 0.7, by + bh / 2 - tailH - 5);
      ctx.stroke();
      ctx.restore();
    } else if (shape === 'hollow') {
      ctx.beginPath();
      ctx.arc(bx, by, bw / 2, 0, Math.PI);
      ctx.lineTo(bx - bw / 2, by);
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();

    // Equilibrium Waterline on the Body
    if (curBody.density < State.tank.layers[State.tank.layers.length - 1].density && !curBody.isSealedToBottom) {
      const eqRatio = Math.min(1.0, curBody.density / State.tank.layers[0].density);
      const eqLineY = by + bh / 2 - eqRatio * bh;
      ctx.save();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(bx - bw / 2 - 6, eqLineY);
      ctx.lineTo(bx + bw / 2 + 6, eqLineY);
      ctx.stroke();
      ctx.restore();
    }

    // Additional cargo weight on top
    if (curBody.cargoMassKg > 0) {
      ctx.save();
      const cargoW = bw * 0.5;
      const cargoH = 14;
      const cargoX = bx - cargoW / 2;
      const cargoY = by - bh / 2 - cargoH;
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cargoX, cargoY, cargoW, cargoH, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 9px "JetBrains Mono", Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`+${curBody.cargoMassKg}kg`, bx, cargoY + cargoH / 2);
      ctx.restore();
    }
  }

  function renderMultiLayerFluids() {
    const tank = State.tank;
    const layers = tank.layers;
    const numLayers = layers.length;
    const totalLiquidH = tank.currentTotalLiquidHeightM;

    let currentBottomM = 0;
    const reversed = [...layers].reverse(); // from floor up

    for (let i = 0; i < numLayers; i++) {
      const layer = reversed[i];
      const layerH_M = totalLiquidH * layer.heightRatio;
      const layerTopM = currentBottomM + layerH_M;

      const botScreenY = worldToScreen(0, currentBottomM).y;
      const topScreenY = worldToScreen(0, layerTopM).y;
      const isTopLayer = (i === numLayers - 1);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(tank.x, botScreenY);

      if (isTopLayer && State.waves.enabled) {
        // Waves on the uppermost liquid surface with smooth spline interpolation
        const n = State.waves.points;
        const pts = [];
        for (let pt = 0; pt < n; pt++) {
          const wx = tank.x + (pt / (n - 1)) * tank.w;
          const wavePx = (State.waves.heights[pt] / State.tank.heightM) * tank.h;
          const wy = topScreenY - wavePx;
          pts.push({ x: wx, y: wy });
        }

        ctx.lineTo(pts[0].x, pts[0].y);
        for (let pt = 0; pt < n - 1; pt++) {
          const p0 = pts[pt];
          const p1 = pts[pt + 1];
          const midX = (p0.x + p1.x) / 2;
          const midY = (p0.y + p1.y) / 2;
          ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
        }
        ctx.lineTo(pts[n - 1].x, pts[n - 1].y);
      } else {
        ctx.lineTo(tank.x, topScreenY);
        ctx.lineTo(tank.x + tank.w, topScreenY);
      }

      ctx.lineTo(tank.x + tank.w, botScreenY);
      ctx.closePath();
      ctx.fillStyle = layer.color;
      ctx.fill();

      // Interface line between layers
      ctx.strokeStyle = layer.surfaceColor;
      ctx.lineWidth = isTopLayer ? 3 : 2;
      ctx.beginPath();
      if (isTopLayer && State.waves.enabled) {
        const n = State.waves.points;
        const pts = [];
        for (let pt = 0; pt < n; pt++) {
          const wx = tank.x + (pt / (n - 1)) * tank.w;
          const wavePx = (State.waves.heights[pt] / State.tank.heightM) * tank.h;
          const wy = topScreenY - wavePx;
          pts.push({ x: wx, y: wy });
        }
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let pt = 0; pt < n - 1; pt++) {
          const p0 = pts[pt];
          const p1 = pts[pt + 1];
          const midX = (p0.x + p1.x) / 2;
          const midY = (p0.y + p1.y) / 2;
          ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
        }
        ctx.lineTo(pts[n - 1].x, pts[n - 1].y);
      } else {
        ctx.moveTo(tank.x, topScreenY);
        ctx.lineTo(tank.x + tank.w, topScreenY);
      }
      ctx.stroke();

      // Density badge for multi-layer tanks
      if (numLayers > 1) {
        const midY = (botScreenY + topScreenY) / 2;
        const liqInfo = LIQUIDS[layer.type] || LIQUIDS.water;
        const labelName = currentLang === 'uk' ? (liqInfo.nameUk || layer.type) : (liqInfo.nameEn || layer.type);
        const tagText = `${labelName} (${layer.density} кг/м³)`;

        ctx.font = 'bold 9px "JetBrains Mono", Inter, sans-serif';
        const tagW = ctx.measureText(tagText).width;
        ctx.fillStyle = currentTheme === 'dark' ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.85)';
        ctx.strokeStyle = layer.surfaceColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(tank.x + tank.w - tagW - 14, midY - 9, tagW + 10, 16, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = currentTheme === 'dark' ? '#f8fafc' : '#0f172a';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(tagText, tank.x + tank.w - 9, midY);
      }

      ctx.restore();
      currentBottomM = layerTopM;
    }
  }

  function renderHydrostaticPressureProfile(bodyPos, bodyPxW, bodyPxH, bodyObj) {
    const body = bodyObj || State.body;
    const tank = State.tank;
    const waterScreenY = worldToScreen(0, tank.currentTotalLiquidHeightM).y;

    const leftX = bodyPos.x - bodyPxW / 2;
    const rightX = bodyPos.x + bodyPxW / 2;
    const topY = bodyPos.y - bodyPxH / 2;
    const botY = bodyPos.y + bodyPxH / 2;

    const subTopY = Math.max(topY, waterScreenY);
    const subBotY = botY;

    if (subBotY <= waterScreenY) return;

    const pScale = 0.0065;
    const baseDensity = tank.layers[0].density;

    // Lateral Pressure Vectors (Sides)
    for (let i = 0; i <= 4; i++) {
      const curY = subTopY + (i / 4) * (subBotY - subTopY);
      const depthM = screenToWorld(0, curY).y;
      const actualDepth = Math.max(0, tank.currentTotalLiquidHeightM - depthM);
      const pHydro = baseDensity * State.g * actualDepth;
      const arrowLen = Math.min(45, pHydro * pScale);
      if (arrowLen > 2) {
        drawVector(leftX - arrowLen, curY, leftX, curY, '#38bdf8', '', '');
        drawVector(rightX + arrowLen, curY, rightX, curY, '#38bdf8', '', '');
      }
    }

    // Bottom Upward Pressure Vectors
    if (!body.isSealedToBottom) {
      const botDepthM = Math.max(0, tank.currentTotalLiquidHeightM - screenToWorld(0, botY).y);
      const pBotHydro = baseDensity * State.g * botDepthM;
      const botArrowLen = Math.min(50, pBotHydro * pScale * 1.2);
      if (botArrowLen > 2) {
        for (let i = 0; i <= 4; i++) {
          const curX = leftX + (i / 4) * (rightX - leftX);
          drawVector(curX, botY + botArrowLen, curX, botY, '#06b6d4', '', '');
        }
      }
    }
  }

  function renderAtmosphericPressure(bodyPos, bodyPxW, bodyPxH) {
    const topY = bodyPos.y - bodyPxH / 2;
    const leftX = bodyPos.x - bodyPxW / 2;
    const rightX = bodyPos.x + bodyPxW / 2;
    const arrowLen = 22;

    for (let i = 0; i <= 4; i++) {
      const curX = leftX + (i / 4) * (rightX - leftX);
      drawVector(curX, topY - arrowLen, curX, topY, '#f97316', '', '');
    }
  }

  function renderOverflowBeaker() {
    if (!State.showOverflowBeaker) return;

    const tank = State.tank;
    const bx = tank.x + tank.w + 30;
    const bw = 44;
    const bh = 140;
    const by = tank.floorY - bh;

    ctx.save();
    ctx.fillStyle = currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';
    ctx.strokeStyle = currentTheme === 'dark' ? 'rgba(148, 163, 184, 0.4)' : 'rgba(100, 116, 139, 0.4)';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx, by + bh);
    ctx.lineTo(bx + bw, by + bh);
    ctx.lineTo(bx + bw, by);
    ctx.stroke();

    const spoutY = worldToScreen(0, State.tank.totalLiquidHeightM).y;
    ctx.beginPath();
    ctx.moveTo(tank.x + tank.w, spoutY);
    ctx.lineTo(bx, spoutY + 15);
    ctx.stroke();

    let totalSubVolL = 0;
    for (let i = 0; i < State.bodies.length; i++) {
      totalSubVolL += State.bodies[i].submergedVolumeL;
    }

    const maxBeakerV = 6.0;
    const fillFrac = Math.min(1.0, totalSubVolL / maxBeakerV);
    const fillH = fillFrac * (bh - 10);
    const liquidColor = State.tank.layers[0].color;

    if (fillH > 2) {
      ctx.fillStyle = liquidColor;
      ctx.fillRect(bx + 2, by + bh - fillH, bw - 4, fillH);
    }

    ctx.fillStyle = '#475569';
    ctx.fillRect(bx - 5, by + bh + 2, bw + 10, 8);
    
    const dispMassKg = (totalSubVolL * State.tank.layers[0].density) / 1000;
    ctx.fillStyle = currentTheme === 'dark' ? '#60a5fa' : '#3b82f6';
    ctx.font = 'bold 9px "JetBrains Mono", Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${dispMassKg.toFixed(2)} кг`, bx + bw / 2, by + bh + 20);
    ctx.fillText(`ΔV=${totalSubVolL.toFixed(2)}л`, bx + bw / 2, by + bh + 32);
    ctx.restore();
  }

  function render() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    const tank = State.tank;
    const bodies = State.bodies;

    // 1. Tank Wall & Frame
    ctx.save();
    ctx.fillStyle = currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
    ctx.fillRect(tank.x, tank.y, tank.w, tank.h);

    ctx.strokeStyle = currentTheme === 'dark' ? 'rgba(148, 163, 184, 0.35)' : 'rgba(100, 116, 139, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(tank.x, tank.y);
    ctx.lineTo(tank.x, tank.floorY);
    ctx.lineTo(tank.x + tank.w, tank.floorY);
    ctx.lineTo(tank.x + tank.w, tank.y);
    ctx.stroke();

    ctx.fillStyle = currentTheme === 'dark' ? '#1e293b' : '#cbd5e1';
    ctx.fillRect(tank.x - 8, tank.floorY, tank.w + 16, 12);

    ctx.fillStyle = currentTheme === 'dark' ? '#64748b' : '#94a3b8';
    ctx.font = '9px "JetBrains Mono", Inter, sans-serif';
    ctx.textAlign = 'right';
    for (let cm = 0; cm <= 80; cm += 10) {
      const markY = worldToScreen(0, cm / 100).y;
      ctx.beginPath();
      ctx.moveTo(tank.x - 6, markY);
      ctx.lineTo(tank.x, markY);
      ctx.stroke();
      ctx.fillText(`${cm}`, tank.x - 10, markY + 3);
    }
    ctx.fillText('cm', tank.x - 10, tank.y - 6);
    ctx.restore();

    // 2. Liquid Mass & Multi-layer Fluids
    renderMultiLayerFluids();

    // Initial Water Level Baseline (h0)
    const baseWaterScreenY = worldToScreen(0, tank.totalLiquidHeightM).y;
    if (Math.abs(tank.deltaHeightM) > 0.002) {
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(tank.x, baseWaterScreenY);
      ctx.lineTo(tank.x + tank.w, baseWaterScreenY);
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`h0`, tank.x + tank.w - 5, baseWaterScreenY - 4);
      ctx.restore();
    }

    // 3. Render All Bodies
    const forceScale = 2.8;

    for (let i = 0; i < bodies.length; i++) {
      const b = bodies[i];
      const isSelected = (i === State.selectedBodyIndex);
      const bodyPos = worldToScreen(b.x, b.y);
      const bodyPxW = (b.widthM / tank.widthM) * tank.w;
      const bodyPxH = (b.heightM / tank.heightM) * tank.h;

      renderBodyMaterial(bodyPos.x, bodyPos.y, bodyPxW, bodyPxH, b.shape, b.material, b);

      // Selected body bounding box indicator
      if (isSelected) {
        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([4, 3]);
        const pad = 4;
        ctx.strokeRect(bodyPos.x - bodyPxW / 2 - pad, bodyPos.y - bodyPxH / 2 - pad, bodyPxW + pad * 2, bodyPxH + pad * 2);
        ctx.restore();
      }

      // Floating body identification badge on canvas
      ctx.save();
      const matInfo = MATERIALS[b.material] || MATERIALS.pine;
      const matName = currentLang === 'uk' ? (matInfo.nameUk || b.material) : (matInfo.nameEn || b.material);
      const badgeText = `#${i + 1} ${matName}`;
      ctx.font = 'bold 9px "JetBrains Mono", Inter, sans-serif';
      const textW = ctx.measureText(badgeText).width;
      const badgeW = textW + 10;
      const badgeH = 15;
      const badgeY = bodyPos.y - bodyPxH / 2 - (b.cargoMassKg > 0 ? 26 : 14);

      ctx.fillStyle = isSelected 
        ? (currentTheme === 'dark' ? 'rgba(14, 165, 233, 0.9)' : 'rgba(2, 132, 199, 0.9)') 
        : (currentTheme === 'dark' ? 'rgba(30, 41, 59, 0.75)' : 'rgba(241, 245, 249, 0.85)');
      ctx.strokeStyle = isSelected ? '#38bdf8' : (currentTheme === 'dark' ? 'rgba(148, 163, 184, 0.4)' : 'rgba(100, 116, 139, 0.4)');
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bodyPos.x - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isSelected ? '#ffffff' : (currentTheme === 'dark' ? '#cbd5e1' : '#334155');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, bodyPos.x, badgeY);
      ctx.restore();

      if (b.isSealedToBottom) {
        ctx.save();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(bodyPos.x - bodyPxW / 2, tank.floorY);
        ctx.lineTo(bodyPos.x + bodyPxW / 2, tank.floorY);
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 10px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ SEALED (Fa = 0) ⚡', bodyPos.x, tank.floorY - 6);
        ctx.restore();
      }

      // Detailed Force Vectors for selected body
      if (isSelected) {
        if (State.showVectors.patm) {
          renderAtmosphericPressure(bodyPos, bodyPxW, bodyPxH);
        }
        if (State.showVectors.phydro) {
          renderHydrostaticPressureProfile(bodyPos, bodyPxW, bodyPxH, b);
        }

        // Gravity Vector (Fg)
        if (State.showVectors.fg && b.fg > 0.01) {
          const arrowLen = Math.min(130, Math.max(15, b.fg * forceScale));
          drawVector(bodyPos.x, bodyPos.y, bodyPos.x, bodyPos.y + arrowLen, '#ef4444', 'Fg', `${b.fg.toFixed(1)} N`);
        }

        // Buoyant Vector (Fa)
        if (State.showVectors.fa && b.fa > 0.01 && !b.isSealedToBottom) {
          const arrowLen = Math.min(130, Math.max(15, b.fa * forceScale));
          const subCenterY = bodyPos.y + (bodyPxH / 2) * (1 - b.submergedRatio);
          drawVector(bodyPos.x, subCenterY, bodyPos.x, subCenterY - arrowLen, '#06b6d4', 'Fa', `${b.fa.toFixed(1)} N`);
        }

        // Floor Reaction (N)
        if (State.showVectors.n && b.nForce > 0.01) {
          const arrowLen = Math.min(110, Math.max(15, b.nForce * forceScale));
          drawVector(bodyPos.x + 18, bodyPos.y + bodyPxH / 2, bodyPos.x + 18, bodyPos.y + bodyPxH / 2 - arrowLen, '#a855f7', 'N', `${b.nForce.toFixed(1)} N`);
        }

        // Net Resultant Vector (Fnet)
        if (State.showVectors.fnet && Math.abs(b.fnet) > 0.2 && !State.drag.isDragging && !b.isSealedToBottom) {
          const arrowLen = Math.min(90, Math.max(12, Math.abs(b.fnet) * forceScale));
          const dirY = b.fnet > 0 ? -1 : 1;
          drawVector(bodyPos.x - 22, bodyPos.y, bodyPos.x - 22, bodyPos.y + dirY * arrowLen, '#f59e0b', 'F_рез', `${Math.abs(b.fnet).toFixed(1)} N`, true);
        }
      } else if (bodies.length > 1) {
        // Compact force vectors for non-selected bodies
        if (State.showVectors.fg && b.fg > 0.01) {
          const arrowLen = Math.min(60, Math.max(12, b.fg * 1.4));
          drawVector(bodyPos.x + 10, bodyPos.y, bodyPos.x + 10, bodyPos.y + arrowLen, '#ef4444', '', '', false);
        }
        if (State.showVectors.fa && b.fa > 0.01 && !b.isSealedToBottom) {
          const arrowLen = Math.min(60, Math.max(12, b.fa * 1.4));
          drawVector(bodyPos.x - 10, bodyPos.y, bodyPos.x - 10, bodyPos.y - arrowLen, '#06b6d4', '', '', false);
        }
      }
    }

    // 4. Overflow Beaker
    renderOverflowBeaker();
  }

  // 8. TELEMETRY & UI UPDATES
  function updateTelemetryUI() {
    const body = State.body;
    const tank = State.tank;

    document.getElementById('val-fg').textContent = body.fg.toFixed(2);
    document.getElementById('val-fa').textContent = body.fa.toFixed(2);
    document.getElementById('val-fnet').textContent = Math.abs(body.fnet).toFixed(2);
    
    const fnetWrap = document.getElementById('val-fnet-wrap');
    const fnetDir = document.getElementById('val-fnet-dir');
    if (body.isSealedToBottom) {
      fnetWrap.className = 'telemetry-value highlight-red';
      fnetDir.textContent = currentLang === 'uk' ? 'Притиснуто до дна' : 'Sealed Down';
    } else if (Math.abs(body.fnet) < 0.1) {
      fnetWrap.className = 'telemetry-value highlight-green';
      fnetDir.textContent = currentLang === 'uk' ? 'Врівноважено' : 'Equilibrium';
    } else if (body.fnet > 0) {
      fnetWrap.className = 'telemetry-value highlight-cyan';
      fnetDir.textContent = currentLang === 'uk' ? 'Вгору (Fa > Fg)' : 'Upward (Fa > Fg)';
    } else {
      fnetWrap.className = 'telemetry-value highlight-red';
      fnetDir.textContent = currentLang === 'uk' ? 'Вниз (Fg > Fa)' : 'Downward (Fg > Fa)';
    }

    document.getElementById('val-submerged-percent').textContent = (body.submergedRatio * 100).toFixed(0);
    document.getElementById('val-vsub').textContent = body.submergedVolumeL.toFixed(2);
    document.getElementById('val-vtotal').textContent = body.volumeL.toFixed(2);
    document.getElementById('val-deltah').textContent = `+${(tank.deltaHeightM * 100).toFixed(1)}`;
    document.getElementById('val-displaced-v').textContent = body.submergedVolumeL.toFixed(2);

    const stateBadge = document.getElementById('telemetry-state-badge');
    const stateKey = 'state' + body.flotationState.charAt(0).toUpperCase() + body.flotationState.slice(1);
    stateBadge.textContent = I18N[currentLang][stateKey] || body.flotationState;
    stateBadge.className = 'badge-status ' + (body.isSealedToBottom ? 'badge-suction' : (body.fg > body.fa ? 'badge-sink' : 'badge-float'));

    // Flotation Rule Banner on Viewport
    const banner = document.getElementById('flotation-rule-banner');
    const badgeState = document.getElementById('rule-badge-state');
    const mathCond = document.getElementById('rule-math-condition');
    const bannerBody = document.getElementById('rule-banner-body');

    if (banner) {
      const hiddenClass = State.showFlotationRule ? '' : ' is-hidden';
      banner.className = `flotation-rule-banner ${body.flotationRuleClass}${hiddenClass}`;
      if (badgeState) badgeState.textContent = I18N[currentLang][stateKey] || body.flotationState;
      if (mathCond) mathCond.textContent = body.flotationRuleMath;
      if (bannerBody) bannerBody.textContent = body.flotationRuleText;
    }

    // Suction Alert Box
    const suctionAlert = document.getElementById('suction-alert');
    const suctionDot = document.getElementById('suction-dot');
    const suctionStatusText = document.getElementById('suction-status-text');
    const suctionPullArea = document.getElementById('suction-pull-area');
    const isFlat = hasFlatBottomSurface(body.shape);

    if (body.isSealedToBottom) {
      suctionAlert.classList.add('show');
      suctionDot.classList.add('active');
      suctionStatusText.textContent = `${I18N[currentLang].suctionStatusActive} ${body.nForce.toFixed(1)} N`;
      suctionPullArea.style.display = 'block';
    } else {
      suctionAlert.classList.remove('show');
      suctionDot.classList.remove('active');
      suctionPullArea.style.display = 'none';
      if (State.suctionModeEnabled) {
        suctionStatusText.textContent = isFlat ? I18N[currentLang].suctionStatusReady : I18N[currentLang].suctionStatusNonFlat;
      } else {
        suctionStatusText.textContent = I18N[currentLang].suctionStatusDisabled;
      }
    }

    // Step-by-Step Analysis Card
    const vTotalM3 = body.volumeL / 1000;
    const vSubM3 = body.submergedVolumeL / 1000;
    const totalMass = body.massKg + body.cargoMassKg;

    document.getElementById('calc-vtotal').textContent = body.volumeL.toFixed(2);
    document.getElementById('calc-vtotal-m3').textContent = vTotalM3.toFixed(4);
    document.getElementById('calc-rho-body').textContent = Math.round(body.density);
    document.getElementById('calc-v-m3').textContent = vTotalM3.toFixed(4);
    document.getElementById('calc-mass').textContent = totalMass.toFixed(3);
    document.getElementById('calc-m2').textContent = totalMass.toFixed(3);
    document.getElementById('calc-g2').textContent = State.g.toFixed(2);
    document.getElementById('calc-fg-res').textContent = `${body.fg.toFixed(2)} N`;
    document.getElementById('calc-vsub-l').textContent = body.submergedVolumeL.toFixed(2);
    document.getElementById('calc-sub-pct').textContent = (body.submergedRatio * 100).toFixed(1);
    document.getElementById('calc-rholiq').textContent = Math.round(State.tank.layers[0].density);
    document.getElementById('calc-vsub-m3').textContent = vSubM3.toFixed(4);
    document.getElementById('calc-g3').textContent = State.g.toFixed(2);
    document.getElementById('calc-fa-res').textContent = `${body.fa.toFixed(2)} N`;

    const topDepthM = Math.max(0, tank.currentTotalLiquidHeightM - (body.y + body.heightM / 2));
    const botDepthM = Math.max(0, tank.currentTotalLiquidHeightM - (body.y - body.heightM / 2));

    document.getElementById('calc-h-top').textContent = (topDepthM * 100).toFixed(1);
    document.getElementById('calc-p-top').textContent = ((State.atmPressure + State.tank.layers[0].density * State.g * topDepthM) / 1000).toFixed(2);
    document.getElementById('calc-h-bot').textContent = (botDepthM * 100).toFixed(1);
    document.getElementById('calc-p-bot').textContent = ((State.atmPressure + State.tank.layers[0].density * State.g * botDepthM) / 1000).toFixed(2);
    document.getElementById('calc-press-diff').textContent = `${body.fa.toFixed(2)} N`;

    const condDesc = document.getElementById('calc-condition-desc');
    condDesc.textContent = body.flotationRuleText;

    // Diver telemetry update
    if (body.shape === 'diver') {
      const airVolEl = document.getElementById('diver-air-vol');
      const waterVolEl = document.getElementById('diver-water-vol');
      const densValEl = document.getElementById('diver-density-val');
      if (airVolEl) airVolEl.textContent = `${(body.airVolumeL || 0).toFixed(2)} л`;
      if (waterVolEl) waterVolEl.textContent = `+${(body.waterVolumeL || 0).toFixed(2)} л`;
      if (densValEl) densValEl.textContent = `${Math.round(body.density)} кг/м³`;
    }
  }

  function updateUIInputs() {
    document.getElementById('range-density').value = State.body.density;
    document.getElementById('num-density').value = State.body.density;
    document.getElementById('range-volume').value = State.body.volumeL.toFixed(1);
    document.getElementById('num-volume').value = State.body.volumeL.toFixed(1);
    document.getElementById('range-mass').value = State.body.massKg.toFixed(3);
    document.getElementById('num-mass').value = State.body.massKg.toFixed(3);
  }

  function syncUIForSelectedBody() {
    const curBody = State.body;
    updateUIInputs();

    // Toggle Cartesian Diver Pressure Section
    const diverSec = document.getElementById('diver-pressure-section');
    if (diverSec) {
      if (curBody.shape === 'diver') {
        diverSec.style.display = 'block';
        const rangeP = document.getElementById('range-diver-pressure');
        const txtP = document.getElementById('txt-diver-pressure');
        const txtKpa = document.getElementById('txt-diver-kpa');
        const pVal = State.diverPressure || 1.0;
        if (rangeP) rangeP.value = pVal.toFixed(2);
        if (txtP) txtP.textContent = pVal.toFixed(2);
        if (txtKpa) txtKpa.textContent = Math.round(pVal * 101.325);
        document.querySelectorAll('.btn-diver-preset').forEach(b => {
          b.classList.toggle('active', Math.abs(parseFloat(b.dataset.p) - pVal) < 0.05);
        });
      } else {
        diverSec.style.display = 'none';
      }
    }

    // Sync shape cards
    document.querySelectorAll('.shape-card').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.shape === curBody.shape);
    });

    // Sync material chips
    document.querySelectorAll('.material-chip').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.material === curBody.material);
    });

    // Sync cargo display
    const cargoVal = document.getElementById('cargo-val');
    if (cargoVal) {
      cargoVal.textContent = `${curBody.cargoMassKg.toFixed(2)} kg`;
    }

    renderBodyChips();
  }

  function renderBodyChips() {
    const container = document.getElementById('body-chips-container');
    const badgeCount = document.getElementById('bodies-count-badge');
    const btnRemove = document.getElementById('btn-remove-body');
    const btnRemoveQuick = document.getElementById('btn-remove-body-quick');
    const btnAdd = document.getElementById('btn-add-body');
    const btnAddQuick = document.getElementById('btn-add-body-quick');

    if (badgeCount) {
      badgeCount.textContent = `${State.bodies.length} / 4`;
    }

    const canRemove = State.bodies.length > 1;
    if (btnRemove) btnRemove.disabled = !canRemove;
    if (btnRemoveQuick) btnRemoveQuick.disabled = !canRemove;

    const canAdd = State.bodies.length < 4;
    if (btnAdd) btnAdd.disabled = !canAdd;
    if (btnAddQuick) btnAddQuick.disabled = !canAdd;

    if (!container) return;
    container.innerHTML = '';

    State.bodies.forEach((b, idx) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `body-select-chip ${idx === State.selectedBodyIndex ? 'active' : ''}`;
      chip.dataset.bodyIdx = idx;

      const matInfo = MATERIALS[b.material] || MATERIALS.pine;
      const matName = currentLang === 'uk' ? (matInfo.nameUk || b.material) : (matInfo.nameEn || b.material);
      const dotColor = matInfo.color || '#38bdf8';

      chip.innerHTML = `
        <div class="body-chip-info">
          <div class="body-chip-title">
            <span class="body-chip-dot" style="background:${dotColor}"></span>
            <span>${I18N[currentLang].bodyChipPrefix || 'Тіло'} #${idx + 1}: ${matName}</span>
          </div>
          <div class="body-chip-meta">${Math.round(b.density)} кг/м³ | ${b.volumeL.toFixed(1)} л</div>
        </div>
      `;

      chip.addEventListener('click', () => {
        State.selectedBodyIndex = idx;
        syncUIForSelectedBody();
      });

      container.appendChild(chip);
    });
  }

  function addBody() {
    if (State.bodies.length >= 4) return;

    const idx = State.bodies.length;
    let newShape = 'sphere';
    let newMat = 'iron';
    let newDensity = 7850;
    let newVol = 1.8;
    let newX = 0.45;

    if (idx === 1) {
      newShape = 'sphere';
      newMat = 'iron';
      newDensity = 7850;
      newVol = 1.8;
      newX = 0.45;
    } else if (idx === 2) {
      newShape = 'cone';
      newMat = 'ice';
      newDensity = 917;
      newVol = 2.0;
      newX = 0.15;
    } else if (idx === 3) {
      newShape = 'boat';
      newMat = 'aluminum';
      newDensity = 600;
      newVol = 3.0;
      newX = 0.30;
    }

    const newBody = createBody(idx + 1, newShape, newMat, newDensity, newVol, newX, 0.58);
    State.bodies.push(newBody);
    State.selectedBodyIndex = State.bodies.length - 1;

    splashWave(newX / State.tank.widthM, -0.025, 6);
    syncUIForSelectedBody();
  }

  function removeBody() {
    if (State.bodies.length <= 1) return;

    State.bodies.splice(State.selectedBodyIndex, 1);
    State.bodies.forEach((b, i) => { b.id = i + 1; });
    State.selectedBodyIndex = Math.max(0, State.selectedBodyIndex - 1);
    syncUIForSelectedBody();
  }

  // 9. TOUCH, MOUSE, & PEN DRAGGING
  function handlePointerDown(e) {
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left);
    const py = (e.clientY - rect.top);
    const worldPt = screenToWorld(px, py);

    // Hit-test bodies from top (last drawn) to bottom
    for (let i = State.bodies.length - 1; i >= 0; i--) {
      const b = State.bodies[i];
      const halfW = b.widthM / 2;
      const halfH = b.heightM / 2;

      if (
        worldPt.x >= b.x - halfW * 1.3 &&
        worldPt.x <= b.x + halfW * 1.3 &&
        worldPt.y >= b.y - halfH * 1.3 &&
        worldPt.y <= b.y + halfH * 1.3
      ) {
        State.selectedBodyIndex = i;
        syncUIForSelectedBody();

        State.drag.isDragging = true;
        State.drag.pointerId = e.pointerId;
        State.drag.bodyIndex = i;
        State.drag.offsetY = worldPt.y - b.y;
        State.drag.offsetX = worldPt.x - b.x;
        b.vy = 0;
        canvas.parentElement.classList.add('dragging');
        canvas.setPointerCapture(e.pointerId);

        const hint = document.getElementById('canvas-hint');
        if (hint) hint.style.opacity = '0';
        break;
      }
    }
  }

  function handlePointerMove(e) {
    if (!State.drag.isDragging || e.pointerId !== State.drag.pointerId) return;

    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left);
    const py = (e.clientY - rect.top);
    const worldPt = screenToWorld(px, py);

    const b = State.bodies[State.drag.bodyIndex];
    if (!b) return;

    const halfH = b.heightM / 2;
    const halfW = b.widthM / 2;
    let targetY = worldPt.y - State.drag.offsetY;
    let targetX = worldPt.x - State.drag.offsetX;

    // Boundary clamps
    targetY = Math.max(halfH, Math.min(State.tank.heightM - halfH, targetY));
    targetX = Math.max(halfW + 0.02, Math.min(State.tank.widthM - halfW - 0.02, targetX));

    if (b.isSealedToBottom && targetY > halfH + 0.04) {
      b.isSealedToBottom = false;
      splashWave(b.x / State.tank.widthM, -0.035, 8);
    }

    if (!b.isSealedToBottom) {
      b.vy = (targetY - b.y) * 15;
      b.y = targetY;
      b.x = targetX;

      // Surface penetration detection while dragging
      const isSubmerged = (State.tank.currentTotalLiquidHeightM - (targetY - halfH)) > 0.005;
      if (!b.wasInWater && isSubmerged) {
        splashWave(b.x / State.tank.widthM, -0.025, 6);
        b.wasInWater = true;
      } else if (b.wasInWater && !isSubmerged) {
        b.wasInWater = false;
      }
    }
  }

  function handlePointerUp(e) {
    if (State.drag.isDragging && e.pointerId === State.drag.pointerId) {
      State.drag.isDragging = false;
      State.drag.pointerId = null;
      canvas.parentElement.classList.remove('dragging');
    }
  }

  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerup', handlePointerUp);
  canvas.addEventListener('pointercancel', handlePointerUp);

  // 10. CONTROLS & EVENT BINDINGS
  function setupEvents() {
    // Multi-body Buttons
    const btnAddBody = document.getElementById('btn-add-body');
    const btnAddQuick = document.getElementById('btn-add-body-quick');
    const btnRemoveBody = document.getElementById('btn-remove-body');
    const btnRemoveQuick = document.getElementById('btn-remove-body-quick');

    if (btnAddBody) btnAddBody.addEventListener('click', addBody);
    if (btnAddQuick) btnAddQuick.addEventListener('click', addBody);
    if (btnRemoveBody) btnRemoveBody.addEventListener('click', removeBody);
    if (btnRemoveQuick) btnRemoveQuick.addEventListener('click', removeBody);

    // Language & Theme
    document.getElementById('btn-lang').addEventListener('click', () => {
      applyLanguage(currentLang === 'uk' ? 'en' : 'uk');
    });

    document.getElementById('btn-theme').addEventListener('click', () => {
      applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    // Play / Pause / Reset / Drop
    const btnPlay = document.getElementById('btn-play-pause');
    btnPlay.addEventListener('click', () => {
      State.running = !State.running;
      btnPlay.querySelector('.icon-pause').style.display = State.running ? 'block' : 'none';
      btnPlay.querySelector('.icon-play').style.display = State.running ? 'none' : 'block';
      document.getElementById('play-pause-text').textContent = State.running ? I18N[currentLang].pause : I18N[currentLang].resume;
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
      State.bodies.forEach((b, idx) => {
        b.y = 0.52;
        b.vy = 0;
        b.isSealedToBottom = false;
        b.x = 0.15 + (idx % 3) * 0.15;
      });
      State.waves.heights.fill(0);
      State.waves.velocities.fill(0);
      State.waves.wasInWater = false;
    });

    document.getElementById('btn-drop').addEventListener('click', () => {
      State.bodies.forEach((b, idx) => {
        b.y = State.tank.heightM - b.heightM / 2 - 0.04;
        b.vy = 0;
        b.isSealedToBottom = false;
        b.x = 0.15 + (idx % 3) * 0.15;
      });
      State.waves.heights.fill(0);
      State.waves.velocities.fill(0);
      State.waves.wasInWater = false;
    });

    // Speed buttons
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        State.speed = parseFloat(btn.dataset.speed);
      });
    });

    // Waves checkbox
    const chkWaves = document.getElementById('chk-waves');
    if (chkWaves) {
      chkWaves.addEventListener('change', (e) => {
        State.waves.enabled = e.target.checked;
        if (!e.target.checked) {
          State.waves.heights.fill(0);
          State.waves.velocities.fill(0);
        }
      });
    }

    // Flotation Rule Banner Checkbox & Draggable Logic
    const chkFlotationRule = document.getElementById('chk-flotation-rule');
    const flotationBanner = document.getElementById('flotation-rule-banner');
    const btnCloseBanner = document.getElementById('btn-close-flotation-banner');

    function syncFlotationBannerVisibility(show) {
      State.showFlotationRule = show;
      if (chkFlotationRule) chkFlotationRule.checked = show;
      if (flotationBanner) {
        if (show) flotationBanner.classList.remove('is-hidden');
        else flotationBanner.classList.add('is-hidden');
      }
    }

    if (chkFlotationRule) {
      chkFlotationRule.addEventListener('change', (e) => {
        syncFlotationBannerVisibility(e.target.checked);
      });
    }

    if (btnCloseBanner) {
      btnCloseBanner.addEventListener('click', (e) => {
        e.stopPropagation();
        syncFlotationBannerVisibility(false);
      });
    }

    // Draggable Flotation Banner
    if (flotationBanner) {
      let isDraggingBanner = false;
      let dragStartX = 0;
      let dragStartY = 0;
      let initialLeft = 0;
      let initialTop = 0;

      flotationBanner.addEventListener('pointerdown', (e) => {
        if (e.target.closest('#btn-close-flotation-banner')) return;
        
        isDraggingBanner = true;
        flotationBanner.classList.add('is-dragging');
        try {
          flotationBanner.setPointerCapture(e.pointerId);
        } catch (err) {}

        const container = document.getElementById('canvas-wrapper') || flotationBanner.parentElement;
        const contRect = container.getBoundingClientRect();
        const bannerRect = flotationBanner.getBoundingClientRect();

        dragStartX = e.clientX;
        dragStartY = e.clientY;
        initialLeft = bannerRect.left - contRect.left;
        initialTop = bannerRect.top - contRect.top;
      });

      flotationBanner.addEventListener('pointermove', (e) => {
        if (!isDraggingBanner) return;

        const container = document.getElementById('canvas-wrapper') || flotationBanner.parentElement;
        const contRect = container.getBoundingClientRect();
        const bannerRect = flotationBanner.getBoundingClientRect();

        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;

        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;

        // Clamp securely within canvas container viewport
        const maxLeft = Math.max(0, contRect.width - bannerRect.width - 8);
        const maxTop = Math.max(0, contRect.height - bannerRect.height - 8);

        newLeft = Math.max(8, Math.min(maxLeft, newLeft));
        newTop = Math.max(8, Math.min(maxTop, newTop));

        flotationBanner.style.left = `${newLeft}px`;
        flotationBanner.style.top = `${newTop}px`;
        flotationBanner.style.right = 'auto';
        flotationBanner.style.bottom = 'auto';

        State.bannerPos.x = newLeft;
        State.bannerPos.y = newTop;
      });

      const stopBannerDrag = (e) => {
        if (isDraggingBanner) {
          isDraggingBanner = false;
          flotationBanner.classList.remove('is-dragging');
          try {
            flotationBanner.releasePointerCapture(e.pointerId);
          } catch (err) {}
        }
      };

      flotationBanner.addEventListener('pointerup', stopBannerDrag);
      flotationBanner.addEventListener('pointercancel', stopBannerDrag);
    }

    // Beaker checkbox
    document.getElementById('chk-overflow-beaker').addEventListener('change', (e) => {
      State.showOverflowBeaker = e.target.checked;
      resizeCanvas();
    });

    // Sidebar Tabs
    document.querySelectorAll('.sidebar-tabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.sidebar-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`pane-${btn.dataset.tab}`).classList.add('active');
      });
    });

    // Shape Selection
    document.querySelectorAll('.shape-card').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.shape-card').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        State.body.shape = btn.dataset.shape;
        if (State.body.shape === 'diver') {
          State.body.material = 'glass';
          State.diverPressure = 1.00;
          updateDiverPhysics(State.body);
        }
        if (!hasFlatBottomSurface(State.body.shape)) {
          State.body.isSealedToBottom = false;
        }
        updateBodyPropertiesFromDensityAndVolume();
        syncUIForSelectedBody();
      });
    });

    // Cartesian Diver Pressure Slider
    const rangeDiverP = document.getElementById('range-diver-pressure');
    if (rangeDiverP) {
      rangeDiverP.addEventListener('input', (e) => {
        const pVal = parseFloat(e.target.value);
        State.diverPressure = pVal;
        const txtP = document.getElementById('txt-diver-pressure');
        const txtKpa = document.getElementById('txt-diver-kpa');
        if (txtP) txtP.textContent = pVal.toFixed(2);
        if (txtKpa) txtKpa.textContent = Math.round(pVal * 101.325);
        document.querySelectorAll('.btn-diver-preset').forEach(b => {
          b.classList.toggle('active', Math.abs(parseFloat(b.dataset.p) - pVal) < 0.08);
        });
        if (State.body.shape === 'diver') {
          updateDiverPhysics(State.body);
          updateBodyPropertiesFromDensityAndVolume();
        }
      });
    }

    // Cartesian Diver Quick Preset Buttons (Float, Neutral, Sink)
    document.querySelectorAll('.btn-diver-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-diver-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const pVal = parseFloat(btn.dataset.p);
        State.diverPressure = pVal;
        if (rangeDiverP) rangeDiverP.value = pVal.toFixed(2);
        const txtP = document.getElementById('txt-diver-pressure');
        const txtKpa = document.getElementById('txt-diver-kpa');
        if (txtP) txtP.textContent = pVal.toFixed(2);
        if (txtKpa) txtKpa.textContent = Math.round(pVal * 101.325);
        if (State.body.shape === 'diver') {
          updateDiverPhysics(State.body);
          updateBodyPropertiesFromDensityAndVolume();
        }
      });
    });

    // Material Selection
    document.querySelectorAll('.material-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.material-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const matKey = btn.dataset.material;
        State.body.material = matKey;
        State.body.density = MATERIALS[matKey].density;
        updateBodyPropertiesFromDensityAndVolume();
      });
    });

    // Layer Mode Buttons (1, 2, or 3 Liquids)
    document.querySelectorAll('.btn-layer-mode').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-layer-mode').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = parseInt(btn.dataset.layers, 10);
        State.tank.layerMode = mode;

        const secSingle = document.getElementById('section-single-liquid');
        const secMulti = document.getElementById('section-multi-liquid');
        const rowMid = document.getElementById('layer-row-mid');

        if (mode === 1) {
          secSingle.style.display = 'flex';
          secMulti.style.display = 'none';
        } else {
          secSingle.style.display = 'none';
          secMulti.style.display = 'flex';
          rowMid.style.display = mode === 3 ? 'flex' : 'none';
        }

        refreshTankLayers();
      });
    });

    // Single Liquid Selection
    document.querySelectorAll('.liquid-card').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.liquid-card').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const liqKey = btn.dataset.liquid;
        State.liquid.type = liqKey;
        State.liquid.density = LIQUIDS[liqKey].density;
        document.getElementById('range-liq-density').value = State.liquid.density;
        document.getElementById('num-liq-density').value = State.liquid.density;
        refreshTankLayers();
      });
    });

    // Multi-Layer Selects
    ['select-layer-top', 'select-layer-mid', 'select-layer-bot'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', () => {
          refreshTankLayers();
        });
      }
    });

    // Presets in Header
    document.querySelectorAll('.btn-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const preset = btn.dataset.preset;

        if (preset === 'wood') {
          State.tank.layerMode = 1;
          State.body.shape = 'box';
          State.body.material = 'pine';
          State.body.density = 550;
          State.body.volumeL = 2.5;
          State.body.cargoMassKg = 0;
          State.liquid.type = 'water';
          State.liquid.density = 1000;
          State.suctionModeEnabled = false;
          State.body.isSealedToBottom = false;
        } else if (preset === 'diver') {
          State.tank.layerMode = 1;
          State.body.shape = 'diver';
          State.body.material = 'glass';
          State.diverPressure = 1.00;
          State.body.volumeL = 2.5;
          State.body.cargoMassKg = 0;
          State.liquid.type = 'water';
          State.liquid.density = 1000;
          State.suctionModeEnabled = false;
          State.body.isSealedToBottom = false;
          updateDiverPhysics(State.body);
          if (rangeDiverP) rangeDiverP.value = "1.00";
        } else if (preset === 'steel') {
          State.tank.layerMode = 1;
          State.body.shape = 'sphere';
          State.body.material = 'iron';
          State.body.density = 7850;
          State.body.volumeL = 1.5;
          State.body.cargoMassKg = 0;
          State.liquid.type = 'water';
          State.liquid.density = 1000;
          State.suctionModeEnabled = false;
          State.body.isSealedToBottom = false;
        } else if (preset === 'ice') {
          State.tank.layerMode = 1;
          State.body.shape = 'cone';
          State.body.material = 'ice';
          State.body.density = 917;
          State.body.volumeL = 3.0;
          State.liquid.type = 'seawater';
          State.liquid.density = 1030;
          State.suctionModeEnabled = false;
          State.body.isSealedToBottom = false;
        } else if (preset === 'multi2') {
          State.tank.layerMode = 2;
          State.body.shape = 'box';
          State.body.material = 'plastic';
          State.body.density = 950;
          State.body.volumeL = 2.5;
          State.body.cargoMassKg = 0;
          document.getElementById('select-layer-top').value = 'oil';
          document.getElementById('select-layer-bot').value = 'water';
          State.suctionModeEnabled = false;
          State.body.isSealedToBottom = false;
        } else if (preset === 'multi3') {
          State.tank.layerMode = 3;
          State.body.shape = 'box';
          State.body.material = 'iron';
          State.body.density = 7850;
          State.body.volumeL = 2.0;
          State.body.cargoMassKg = 0;
          document.getElementById('select-layer-top').value = 'oil';
          document.getElementById('select-layer-mid').value = 'water';
          document.getElementById('select-layer-bot').value = 'mercury';
          State.suctionModeEnabled = false;
          State.body.isSealedToBottom = false;
        } else if (preset === 'boat') {
          State.tank.layerMode = 1;
          State.body.shape = 'boat';
          State.body.material = 'aluminum';
          State.body.density = 600;
          State.body.volumeL = 3.5;
          State.liquid.type = 'water';
          State.liquid.density = 1000;
          State.suctionModeEnabled = false;
          State.body.isSealedToBottom = false;
        } else if (preset === 'mercury') {
          State.tank.layerMode = 1;
          State.body.shape = 'box';
          State.body.material = 'iron';
          State.body.density = 7850;
          State.body.volumeL = 2.0;
          State.liquid.type = 'mercury';
          State.liquid.density = 13600;
          State.suctionModeEnabled = false;
          State.body.isSealedToBottom = false;
        } else if (preset === 'suction') {
          State.tank.layerMode = 1;
          State.body.shape = 'box';
          State.body.material = 'pine';
          State.body.density = 550;
          State.body.volumeL = 2.5;
          State.body.y = State.body.heightM / 2;
          State.body.vy = 0;
          State.liquid.type = 'water';
          State.liquid.density = 1000;
          State.suctionModeEnabled = true;
          State.body.isSealedToBottom = true;
          document.getElementById('chk-suction-mode').checked = true;
        }

        // Sync Layer Mode UI
        document.querySelectorAll('.btn-layer-mode').forEach(b => {
          b.classList.toggle('active', parseInt(b.dataset.layers, 10) === State.tank.layerMode);
        });
        const secSingle = document.getElementById('section-single-liquid');
        const secMulti = document.getElementById('section-multi-liquid');
        const rowMid = document.getElementById('layer-row-mid');
        if (State.tank.layerMode === 1) {
          secSingle.style.display = 'flex';
          secMulti.style.display = 'none';
        } else {
          secSingle.style.display = 'none';
          secMulti.style.display = 'flex';
          rowMid.style.display = State.tank.layerMode === 3 ? 'flex' : 'none';
        }

        refreshTankLayers();
        updateBodyPropertiesFromDensityAndVolume();
        syncUIForSelectedBody();
        document.getElementById('range-liq-density').value = State.liquid.density;
        document.getElementById('num-liq-density').value = State.liquid.density;
      });
    });

    // Body property sliders
    const rangeDensity = document.getElementById('range-density');
    const numDensity = document.getElementById('num-density');
    rangeDensity.addEventListener('input', (e) => {
      State.body.density = parseFloat(e.target.value);
      State.body.material = 'custom';
      updateBodyPropertiesFromDensityAndVolume();
    });
    numDensity.addEventListener('change', (e) => {
      State.body.density = parseFloat(e.target.value);
      State.body.material = 'custom';
      updateBodyPropertiesFromDensityAndVolume();
    });

    const rangeVolume = document.getElementById('range-volume');
    const numVolume = document.getElementById('num-volume');
    rangeVolume.addEventListener('input', (e) => {
      State.body.volumeL = parseFloat(e.target.value);
      updateBodyPropertiesFromDensityAndVolume();
    });
    numVolume.addEventListener('change', (e) => {
      State.body.volumeL = parseFloat(e.target.value);
      updateBodyPropertiesFromDensityAndVolume();
    });

    const rangeMass = document.getElementById('range-mass');
    const numMass = document.getElementById('num-mass');
    rangeMass.addEventListener('input', (e) => {
      State.body.massKg = parseFloat(e.target.value);
      updateBodyPropertiesFromMass();
    });
    numMass.addEventListener('change', (e) => {
      State.body.massKg = parseFloat(e.target.value);
      updateBodyPropertiesFromMass();
    });

    // Cargo weights
    document.querySelectorAll('.btn-cargo').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseFloat(btn.dataset.add);
        if (val === 0) State.body.cargoMassKg = 0;
        else State.body.cargoMassKg = Math.max(0, State.body.cargoMassKg + val);
        document.getElementById('cargo-val').textContent = `${State.body.cargoMassKg.toFixed(2)} kg`;
      });
    });

    // Single Liquid density slider
    const rangeLiqDensity = document.getElementById('range-liq-density');
    const numLiqDensity = document.getElementById('num-liq-density');
    rangeLiqDensity.addEventListener('input', (e) => {
      State.liquid.density = parseFloat(e.target.value);
      State.liquid.type = 'custom';
      numLiqDensity.value = State.liquid.density;
      refreshTankLayers();
    });
    numLiqDensity.addEventListener('change', (e) => {
      State.liquid.density = parseFloat(e.target.value);
      State.liquid.type = 'custom';
      rangeLiqDensity.value = State.liquid.density;
      refreshTankLayers();
    });

    // Tank Depth slider
    document.getElementById('range-tank-depth').addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) / 100;
      State.tank.totalLiquidHeightM = val;
      document.getElementById('txt-tank-depth').textContent = e.target.value;
    });

    // Gravity slider
    const rangeGravity = document.getElementById('range-gravity');
    const numGravity = document.getElementById('num-gravity');
    rangeGravity.addEventListener('input', (e) => {
      State.g = parseFloat(e.target.value);
      numGravity.value = State.g;
    });
    numGravity.addEventListener('change', (e) => {
      State.g = parseFloat(e.target.value);
      rangeGravity.value = State.g;
    });

    // Viscosity slider
    document.getElementById('range-viscosity').addEventListener('input', (e) => {
      State.liquid.viscosityDamping = parseFloat(e.target.value);
      const val = parseFloat(e.target.value);
      const label = val > 0.985 ? 'Низька' : (val < 0.965 ? 'Висока' : 'Середня');
      document.getElementById('txt-viscosity').textContent = label;
    });

    // Vector checkboxes
    ['fg', 'fa', 'fnet', 'patm', 'phydro', 'n'].forEach(k => {
      const chk = document.getElementById(`chk-${k}`);
      if (chk) {
        chk.addEventListener('change', (e) => {
          State.showVectors[k] = e.target.checked;
        });
      }
    });

    // Bottom Suction Seal checkbox & Break button
    const chkSuction = document.getElementById('chk-suction-mode');
    chkSuction.addEventListener('change', (e) => {
      State.suctionModeEnabled = e.target.checked;
      if (!e.target.checked) State.body.isSealedToBottom = false;
    });

    document.getElementById('btn-break-seal').addEventListener('click', () => {
      State.body.isSealedToBottom = false;
      State.body.vy = 1.8;
      splashWave(State.body.x / State.tank.widthM, -0.035, 8);
    });

    // Theory Modal
    const modal = document.getElementById('theory-modal');
    document.getElementById('btn-theory').addEventListener('click', () => {
      modal.classList.add('open');
    });
    document.getElementById('btn-close-theory').addEventListener('click', () => {
      modal.classList.remove('open');
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  }

  // 11. ANIMATION LOOP
  let lastTime = performance.now();

  function loop(currentTime) {
    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    physicsStep(dt);
    render();

    requestAnimationFrame(loop);
  }

  // INITIALIZATION
  applyLanguage(currentLang);
  applyTheme(currentTheme);
  refreshTankLayers();
  resizeCanvas();
  updateBodyPropertiesFromDensityAndVolume();
  syncUIForSelectedBody();
  setupEvents();
  requestAnimationFrame(loop);
})();

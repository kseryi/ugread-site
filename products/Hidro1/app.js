/**
 * HydroPhysics Laboratory — Pure JavaScript Physical Engine & UI Controller
 * Features:
 * - Realistic Wooden Laboratory Tabletop with perspective, grain, fascia & heavy metal legs
 * - Communicating Vessels (2, 3, 4 tubes of customizable widths & shapes)
 *   * Crystal-clear Glassware with visible glass body tint, outer walls, flared top rims, and graduation ticks even when empty
 *   * Seamless bottom connecting manifold with continuous fluid fill & dynamic flow particles
 *   * Interconnecting valves with realistic open/closed gate rendering & flow physics
 *   * Interactive pouring (funnel stream, direct canvas click/drag, quick buttons)
 * - Hydraulic Press & Automotive Floor Jack (Pascal's Law)
 *   * Kinematically correct Floor Jack lever: FIXED static fulcrum pillar on base frame, hinge pin on lever pushing small piston rod down
 *   * Real conservation of displaced volume: Δy2 = Δy1 * (S1/S2)
 *   * Direct canvas dragging of small piston, interactive pump handle, and release valve
 *   * Live Hydraulic Pressure Manometer (кПа / bar)
 * - Modern Language Segmented Switch in Header (UA / EN)
 * - Dark & Light Themes
 * - Step-by-step Mathematical Formulas & Guided Lab Tasks
 */

(function () {
  'use strict';

  // --- Localization Dictionary ---
  const I18N = {
    uk: {
      app_title: 'HydroPhysics',
      app_subtitle: 'Лабораторія Гідростатики & Сполучених Посудин',
      mode_vessels: 'Сполучені посудини',
      mode_press: 'Гідравлічний прес / Домкрат',
      presets_label: 'Сценарії:',
      preset_equal: 'Рівні трубки',
      preset_steps: 'Різна ширина',
      preset_valves: 'Закриті крани',
      preset_heavy: 'Ртуть / Важка рідина',
      preset_press_lift: 'Підйом авто',
      preset_jack_lever: 'Ручний домкрат',
      theory_btn: 'Теорія',
      reset_btn: 'Скинути',
      pause_btn: 'Пауза',
      play_btn: 'Пуск',
      step_btn: 'Крок',
      speed_label: 'Швидкість:',
      pour_mode_btn: 'Долити воду',
      pouring_active_btn: 'Лійка активна',
      drain_btn: 'Злити все',
      toggle_ruler: 'Лінійка',
      toggle_level_line: 'Рівень h',
      toggle_forces: 'Сили / Тиск',
      canvas_hint_vessels: '💡 Клікніть або затисніть мишу над будь-якою посудиною, щоб доливати рідину!',
      canvas_hint_press: '💡 Тягніть малий поршень мишею вниз або натискайте «Качати важіль»!',
      
      rule_badge_vessels: 'ЗАКОН СПОЛУЧЕНИХ ПОСУДИН',
      rule_formula_vessels: 'h₁ = h₂ = h₃ = h₄ (P₁ = P₂)',
      rule_desc_vessels: 'У відкритих сполучених посудинах будь-якої форми вільні поверхні однорідної нерухомої рідини завжди встановлюються на одному горизонтальному рівні.',
      
      rule_badge_press: 'ЗАКОН ПАСКАЛЯ В ГІДРАВЛІЦІ',
      rule_formula_press: 'F₂ / F₁ = S₂ / S₁ = (d₂ / d₁)² = k',
      rule_desc_press: 'Тиск, створюваний на малий поршень, без змін передається в кожну точку рідини, створюючи виграш у силі в S₂/S₁ разів. При цьому h₁·S₁ = h₂·S₂.',

      standard_press_action_title: 'Керування пресуванням',
      standard_press_desc: 'Тягніть малий поршень мишкою або натискайте кнопку для стискання об\'єкта під верхньою платформою.',
      press_down_btn: 'Стиснути пресом',
      press_reset_btn: 'Відпустити прес',

      telem_h_mean: 'Рівень рідини (h)',
      telem_volume: 'Загальний об\'єм (V)',
      telem_pressure: 'Гідростатичний тиск (P)',
      telem_density: 'Густина рідини (ρ)',
      telem_delta_h: 'Перепад рівнів (Δh)',
      telem_status: 'Стан системи',
      status_stable: 'РІВНОВАГА',
      status_flowing: 'ПЕРЕТІКАННЯ',
      status_press_lifted: 'ВАНТАЖ ПІДНЯТО',
      status_press_clamped: 'ОБ\'ЄКТ СТИСНЕНО (РІДИНА НЕСТИСЛИВА)',
      status_jack_draining: 'ПЛАВНИЙ СПУСК В РЕЗЕРВУАР',
      status_jack_max_stroke: 'МАКСИМАЛЬНИЙ ХІД ШТОКА (РІДИНА НЕСТИСЛИВА)',
      status_press_idle: 'ПРЕС В СПОКОЇ',

      tab_params: 'Параметри',
      tab_liquids: 'Рідини',
      tab_calcs: 'Розрахунки',
      tab_tasks: 'Завдання',

      vessel_count_title: 'Кількість посудин',
      tubes_unit: 'посудини',
      valves_title: 'Сполучні крани / Клапани',
      open_all_btn: 'Відкрити всі',
      valve_between: 'Кран між посудинами',
      valve_open: 'ВІДКРИТО',
      valve_closed: 'ЗАКРИТО',
      vessels_geometry_title: 'Геометрія та доливання',
      vessel_label: 'Посудина',
      width_label: 'Ширина (діаметр):',
      shape_straight: 'Пряма',
      shape_cone: 'Конічна',
      shape_zigzag: 'Звивиста',
      shape_stepped: 'Східчаста',
      add_water_btn: '+30 мл',
      add_water_lot: '+100 мл',
      drain_vessel_btn: '-30 мл',
      hydrodynamics_title: 'Гідродинаміка та перетікання',
      flow_rate_label: 'Швидкість перетікання',
      damping_label: 'В\'язкість / Згасання коливань',

      press_type_title: 'Тип механізму',
      press_type_standard: 'Гідравлічний прес',
      press_type_jack: 'Автомобільний домкрат',
      jack_action_title: 'Керування домкратом',
      jack_desc: 'Натискайте «Качати важіль» для подачі масла з резервуара в робочий циліндр або тягніть важіль мишкою. Відкриття клапана плавно повертає масло в резервуар.',
      jack_pump_btn: 'Качати важіль',
      jack_release_btn: 'Спуск (Клапан)',
      pistons_title: 'Розміри циліндрів і поршнів',
      piston1_dia: 'Діаметр малого поршня (d₁)',
      piston2_dia: 'Діаметр великого поршня (d₂)',
      lever_ratio_label: 'Плече важеля (L / l)',
      applied_force_title: 'Прикладена сила до малого поршня (F₁)',
      force1_label: 'Сила F₁ на поршень/важіль',
      load_title: 'Об\'єкт для підйому або стискання',
      load_spring: 'Сталева пружина (120 кг)',
      load_barrel: 'Металева бочка (220 кг)',
      load_car: 'Автомобіль (1500 кг)',
      load_anvil: 'Ковадло (250 кг)',
      load_block: 'Бетонний блок (600 кг)',
      load_elephant: 'Слон (4000 кг)',
      load_none: 'Без навантаження (0 кг)',

      liquids_library_title: 'Бібліотека рідин та густина (ρ)',
      liquids_hint: 'Виберіть робочу рідину. Густина визначає гідростатичний тиск за формулою P = ρgh.',
      liq_water: 'Вода (чиста)',
      liq_oil: 'Гідравлічне масло',
      liq_mercury: 'Ртуть (Hg)',
      liq_alcohol: 'Етиловий спирт',
      liq_gasoline: 'Бензин',
      liq_glycerin: 'Гліцерин',
      custom_liquid_title: 'Власні фізичні константи',
      custom_density_label: 'Густина рідини (ρ)',
      gravity_label: 'Гравітаційне поле (g)',

      live_calcs_title: 'Фізичні розрахунки в реальному часі',
      tasks_title: 'Лабораторні дослідження',

      theory_modal_title: 'Теоретичні відомості: Гідростатика та Закон Паскаля'
    },
    en: {
      app_title: 'HydroPhysics',
      app_subtitle: 'Hydrostatics & Communicating Vessels Lab',
      mode_vessels: 'Communicating Vessels',
      mode_press: 'Hydraulic Press / Jack',
      presets_label: 'Presets:',
      preset_equal: 'Equal Tubes',
      preset_steps: 'Varied Widths',
      preset_valves: 'Closed Valves',
      preset_heavy: 'Mercury / Heavy',
      preset_press_lift: 'Car Lift',
      preset_jack_lever: 'Hand Jack',
      theory_btn: 'Theory',
      reset_btn: 'Reset',
      pause_btn: 'Pause',
      play_btn: 'Run',
      step_btn: 'Step',
      speed_label: 'Speed:',
      pour_mode_btn: 'Add Liquid',
      pouring_active_btn: 'Funnel Active',
      drain_btn: 'Drain All',
      toggle_ruler: 'Ruler',
      toggle_level_line: 'Level h',
      toggle_forces: 'Forces / Pressure',
      canvas_hint_vessels: '💡 Click or drag over any vessel to pour liquid directly!',
      canvas_hint_press: '💡 Drag the small piston/handle with mouse or click "Pump Handle"!',
      
      rule_badge_vessels: 'LAW OF COMMUNICATING VESSELS',
      rule_formula_vessels: 'h₁ = h₂ = h₃ = h₄ (P₁ = P₂)',
      rule_desc_vessels: 'In open communicating vessels of any shape, homogeneous liquid at rest settles at the exact same horizontal level.',
      
      rule_badge_press: 'PASCAL\'S PRINCIPLE IN HYDRAULICS',
      rule_formula_press: 'F₂ / F₁ = S₂ / S₁ = (d₂ / d₁)² = k',
      rule_desc_press: 'Pressure applied to an enclosed fluid is transmitted undiminished in all directions, yielding a mechanical force advantage of S₂ / S₁.',

      standard_press_action_title: 'Press Operation',
      standard_press_desc: 'Drag the small piston or click the button to compress the workpiece against the top anvil platform.',
      press_down_btn: 'Press Down',
      press_reset_btn: 'Release Press',

      telem_h_mean: 'Liquid Level (h)',
      telem_volume: 'Total Volume (V)',
      telem_pressure: 'Hydrostatic Pressure (P)',
      telem_density: 'Fluid Density (ρ)',
      telem_delta_h: 'Level Difference (Δh)',
      telem_status: 'System Status',
      status_stable: 'EQUILIBRIUM',
      status_flowing: 'FLOW EQUALIZING',
      status_press_lifted: 'LOAD LIFTED',
      status_press_clamped: 'WORKPIECE CLAMPED (INCOMPRESSIBLE FLUID)',
      status_jack_draining: 'DRAINING TO RESERVOIR',
      status_jack_max_stroke: 'MAX STROKE REACHED (FLUID INCOMPRESSIBLE)',
      status_press_idle: 'PRESS AT REST',

      tab_params: 'Parameters',
      tab_liquids: 'Liquids',
      tab_calcs: 'Calculations',
      tab_tasks: 'Guided Tasks',

      vessel_count_title: 'Vessel Count',
      tubes_unit: 'tubes',
      valves_title: 'Connecting Valves / Stops',
      open_all_btn: 'Open All',
      valve_between: 'Valve between tubes',
      valve_open: 'OPEN',
      valve_closed: 'CLOSED',
      vessels_geometry_title: 'Geometry & Pouring',
      vessel_label: 'Vessel',
      width_label: 'Width (diameter):',
      shape_straight: 'Straight',
      shape_cone: 'Conical',
      shape_zigzag: 'Zigzag',
      shape_stepped: 'Stepped',
      add_water_btn: '+30 mL',
      add_water_lot: '+100 mL',
      drain_vessel_btn: '-30 mL',
      hydrodynamics_title: 'Hydrodynamics & Flow',
      flow_rate_label: 'Flow rate (permeability)',
      damping_label: 'Viscosity / Oscillation Damping',

      press_type_title: 'Mechanism Type',
      press_type_standard: 'Hydraulic Press',
      press_type_jack: 'Automotive Floor Jack',
      jack_action_title: 'Jack Operation',
      jack_desc: 'Pump the handle to transfer oil from reservoir into the lifting ram. Opening the valve smoothly drains oil back to reservoir.',
      jack_pump_btn: 'Pump Handle',
      jack_release_btn: 'Release Valve',
      pistons_title: 'Cylinder & Piston Dimensions',
      piston1_dia: 'Small Piston Diameter (d₁)',
      piston2_dia: 'Large Piston Diameter (d₂)',
      lever_ratio_label: 'Lever Ratio (L / l)',
      applied_force_title: 'Force on Small Piston (F₁)',
      force1_label: 'Applied Force F₁',
      load_title: 'Load to Lift / Compress',
      load_spring: 'Steel Spring (120 kg)',
      load_barrel: 'Metal Drum (220 kg)',
      load_car: 'Sedan Car (1500 kg)',
      load_anvil: 'Steel Anvil (250 kg)',
      load_block: 'Concrete Block (600 kg)',
      load_elephant: 'Elephant (4000 kg)',
      load_none: 'No Load (0 kg)',

      liquids_library_title: 'Liquid Library & Density (ρ)',
      liquids_hint: 'Select the working fluid. Density determines hydrostatic base pressure via P = ρgh.',
      liq_water: 'Water (Pure)',
      liq_oil: 'Hydraulic Oil',
      liq_mercury: 'Mercury (Hg)',
      liq_alcohol: 'Ethanol Alcohol',
      liq_gasoline: 'Gasoline',
      liq_glycerin: 'Glycerin',
      custom_liquid_title: 'Custom Physical Constants',
      custom_density_label: 'Fluid Density (ρ)',
      gravity_label: 'Gravity Field (g)',

      live_calcs_title: 'Real-Time Physics Breakdown',
      tasks_title: 'Laboratory Investigations',

      theory_modal_title: 'Theory: Hydrostatics & Pascal\'s Law'
    }
  };

  // --- Liquid Presets ---
  const LIQUIDS_DB = [
    { id: 'water', nameKey: 'liq_water', density: 1000, color: '#38bdf8', fillGrad: ['#38bdf8', '#1d4ed8'], viscosity: 0.94 },
    { id: 'oil', nameKey: 'liq_oil', density: 880, color: '#f59e0b', fillGrad: ['#fbbf24', '#b45309'], viscosity: 0.88 },
    { id: 'mercury', nameKey: 'liq_mercury', density: 13600, color: '#94a3b8', fillGrad: ['#cbd5e1', '#475569'], viscosity: 0.96 },
    { id: 'alcohol', nameKey: 'liq_alcohol', density: 789, color: '#ec4899', fillGrad: ['#f472b6', '#be185d'], viscosity: 0.97 },
    { id: 'gasoline', nameKey: 'liq_gasoline', density: 720, color: '#a855f7', fillGrad: ['#c084fc', '#7e22ce'], viscosity: 0.98 },
    { id: 'glycerin', nameKey: 'liq_glycerin', density: 1260, color: '#10b981', fillGrad: ['#34d399', '#047857'], viscosity: 0.82 }
  ];

  // --- Loads for Hydraulic Press ---
  const LOADS_DB = [
    { id: 'spring', nameKey: 'load_spring', mass: 120, icon: '🌀', color: '#38bdf8' },
    { id: 'barrel', nameKey: 'load_barrel', mass: 220, icon: '🛢️', color: '#f59e0b' },
    { id: 'car', nameKey: 'load_car', mass: 1500, icon: '🚗', color: '#38bdf8' },
    { id: 'anvil', nameKey: 'load_anvil', mass: 250, icon: '🔨', color: '#94a3b8' },
    { id: 'block', nameKey: 'load_block', mass: 600, icon: '🧱', color: '#f59e0b' },
    { id: 'elephant', nameKey: 'load_elephant', mass: 4000, icon: '🐘', color: '#a855f7' },
    { id: 'none', nameKey: 'load_none', mass: 0, icon: '⚪', color: '#64748b' }
  ];

  // --- Simulation Global State ---
  const state = {
    lang: 'uk',
    theme: 'dark',
    mode: 'vessels', // 'vessels' | 'press'
    isPlaying: true,
    simSpeed: 1.0,
    showRuler: true,
    showLevelLine: true,
    showForces: true,
    isPourMode: false,
    gravity: 9.81,

    // Communicating vessels state
    vesselsCount: 3,
    selectedVesselIdx: 0,
    flowRate: 5,
    damping: 0.94,
    vessels: [
      { width: 45, height: 140, targetHeight: 140, velocity: 0, shape: 'straight' },
      { width: 85, height: 140, targetHeight: 140, velocity: 0, shape: 'cone' },
      { width: 55, height: 140, targetHeight: 140, velocity: 0, shape: 'zigzag' },
      { width: 70, height: 140, targetHeight: 140, velocity: 0, shape: 'stepped' }
    ],
    valves: [true, true, true], // valve between 0-1, 1-2, 2-3
    currentLiquid: LIQUIDS_DB[0],

    // Flow particles animation in connecting manifold
    flowParticles: [],

    // Hydraulic press / jack state
    pressSubmode: 'standard', // 'standard' | 'jack'
    piston1Dia: 15, // mm
    piston2Dia: 120, // mm
    force1: 100, // N
    leverRatio: 6, // for jack
    selectedLoad: LOADS_DB[0],
    
    // Dynamic piston heights (mm from bottom of cylinder)
    piston1Height: 90, // mm (height of fluid column in cylinder 1)
    piston2Height: 90, // mm (height of fluid column in cylinder 2)
    targetPiston1Height: 90,
    targetPiston2Height: 90,
    manometerAngle: -135 * (Math.PI / 180),
    pressManifoldParticles: [],

    // Standard Press compression state
    pressCompression: 0, // 0 to 1 amount of squash
    isPressClamped: false,
    isHoldingPressButton: false,

    // Jack reservoir and ratchet pumping state
    jackReservoirMaxVolume: 600, // ml
    jackReservoirVolume: 500, // ml in storage tank
    jackOilVolumeInRam: 0, // ml displaced to lifting ram
    isJackAtMaxStroke: false, // Incompressible limit reached (stroke = 175mm max)
    jackBypassReliefActive: false, // Overpressure safety bypass active
    jackPendingStrokeVol: 0,
    jackActualTransferredVol: 0,
    jackHandleAngle: 0, // degrees rotation around FIXED fulcrum
    targetJackHandleAngle: 0,
    jackPumpProgress: 0, // 0 to 1 continuous stroke progress
    jackPumpPhase: 'idle', // 'idle' | 'downstroke' | 'upstroke'
    suctionValveOpen: false,
    dischargeValveOpen: false,
    isJackDraining: false,
    jackDrainProgress: 0,
    jackReturnParticles: [],

    isDraggingPiston1: false,
    isDraggingJackLever: false,

    // Active particle pouring stream animation
    pouringStream: {
      active: false,
      vesselIdx: null,
      targetX: 0,
      flowAmount: 0.5
    },

    // Interactive Lab Tasks tracking
    tasks: [
      { id: 'task_pour_unequal', uk: 'Долийте воду в найвужчу посудину і перевірте, чи стануть рівні однаковими', en: 'Pour water into the narrowest vessel and observe if levels equalize', done: false },
      { id: 'task_close_valves', uk: 'Закрийте один із кранів і створіть різницю рівнів між посудинами', en: 'Close one of the valves and create a height difference between sections', done: false },
      { id: 'task_lift_car', uk: 'Перейдіть у режим Преса і підніміть автомобіль силою менше 100 Н', en: 'Switch to Press mode and lift the car with force under 100 N', done: false },
      { id: 'task_heavy_liquid', uk: 'Виберіть ртуть (Hg) та зверніть увагу на зміну гідростатичного тиску P', en: 'Select Mercury (Hg) and notice the huge jump in hydrostatic pressure P', done: false }
    ]
  };

  // --- Canvas references ---
  let canvas, ctx, animFrameId;
  let isPointerDownOnCanvas = false;
  let lastPointerPos = { x: 0, y: 0 };
  let dragStartY = 0;
  let dragStartPiston1H = 0;

  // --- Initialization ---
  function init() {
    canvas = document.getElementById('sim-canvas');
    ctx = canvas.getContext('2d');

    setupResizeObserver();
    setupEventListeners();
    populateUI();
    updateLocalization();
    applyTheme(state.theme);

    // Initialize flow particles
    initFlowParticles();

    // Initial equilibrium calculation
    computeVesselsEquilibrium();
    updatePressPhysics(true);

    // Start Animation Loop
    lastTimestamp = performance.now();
    animFrameId = requestAnimationFrame(renderLoop);
  }

  // --- DOM Element Reference helper ---
  function $(id) {
    return document.getElementById(id);
  }

  // --- Dynamic High-DPI Canvas Resizing ---
  function setupResizeObserver() {
    const wrapper = $('canvas-wrapper');
    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener('resize', resize);
    resize();
  }

  // --- Setup Flow Particles ---
  function initFlowParticles() {
    state.flowParticles = [];
    for (let i = 0; i < 40; i++) {
      state.flowParticles.push({
        x: Math.random() * 800,
        y: Math.random() * 20,
        speed: (Math.random() - 0.5) * 2,
        size: Math.random() * 2 + 1.5,
        alpha: Math.random() * 0.6 + 0.2
      });
    }

    state.pressManifoldParticles = [];
    for (let i = 0; i < 28; i++) {
      state.pressManifoldParticles.push({
        progress: Math.random(),
        offsetY: (Math.random() - 0.5) * 14,
        size: Math.random() * 2.2 + 1.8,
        alpha: Math.random() * 0.5 + 0.35
      });
    }
  }

  // --- Setup Event Listeners ---
  function setupEventListeners() {
    // Mode switcher buttons
    $('btn-mode-vessels').addEventListener('click', () => setMode('vessels'));
    $('btn-mode-press').addEventListener('click', () => setMode('press'));

    // Language Segmented Switcher in Header (UA / EN)
    $('btn-lang-uk').addEventListener('click', () => setLanguage('uk'));
    $('btn-lang-en').addEventListener('click', () => setLanguage('en'));

    // Theme Toggle
    $('btn-theme-toggle').addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(state.theme);
    });

    // Playback Controls
    $('btn-play-pause').addEventListener('click', togglePlayPause);
    $('btn-step').addEventListener('click', stepPhysics);

    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.simSpeed = parseFloat(btn.dataset.speed);
      });
    });

    // Pour Mode Toggle
    $('btn-pour-mode').addEventListener('click', () => {
      state.isPourMode = !state.isPourMode;
      $('btn-pour-mode').classList.toggle('active', state.isPourMode);
      $('btn-pour-mode').querySelector('span:last-child').textContent =
        state.isPourMode ? I18N[state.lang].pouring_active_btn : I18N[state.lang].pour_mode_btn;
      $('canvas-wrapper').classList.toggle('pouring-mode', state.isPourMode);
    });

    // Drain all
    $('btn-drain-all').addEventListener('click', drainAllLiquid);

    // Overlays toggles
    $('toggle-ruler').addEventListener('change', (e) => { state.showRuler = e.target.checked; });
    $('toggle-level-line').addEventListener('change', (e) => { state.showLevelLine = e.target.checked; });
    $('toggle-forces').addEventListener('change', (e) => { state.showForces = e.target.checked; });

    // Reset button
    $('btn-reset-all').addEventListener('click', resetAll);

    // Theory Modal
    $('btn-theory').addEventListener('click', openTheoryModal);
    $('btn-close-theory').addEventListener('click', closeTheoryModal);
    $('theory-modal').addEventListener('click', (e) => {
      if (e.target === $('theory-modal')) closeTheoryModal();
    });

    // Close Banner
    $('btn-close-banner').addEventListener('click', () => {
      $('physics-rule-banner').style.display = 'none';
    });

    // Make Banner Draggable
    setupDraggableBanner();

    // Tab Switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        $(btn.dataset.tab).classList.add('active');
      });
    });

    // Vessel Count Selector
    document.querySelectorAll('.btn-count-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-count-choice').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setVesselsCount(parseInt(btn.dataset.count, 10));
      });
    });

    // Open All Valves Button
    $('btn-open-all-valves').addEventListener('click', () => {
      state.valves = [true, true, true];
      populateValvesUI();
      computeVesselsEquilibrium();
    });

    // Hydrodynamics Sliders
    bindSliderWithInput('flow-rate-slider', 'flow-rate-input', (val) => {
      state.flowRate = parseFloat(val);
    });
    bindSliderWithInput('damping-slider', 'damping-input', (val) => {
      state.damping = parseFloat(val);
    });

    // Hydraulic Press Submodes
    $('btn-press-type-standard').addEventListener('click', () => setPressSubmode('standard'));
    $('btn-press-type-jack').addEventListener('click', () => setPressSubmode('jack'));

    // Standard Press Action Buttons
    const pressDownBtn = $('btn-press-down');
    if (pressDownBtn) {
      pressDownBtn.addEventListener('mousedown', () => {
        state.isHoldingPressButton = true;
      });
      pressDownBtn.addEventListener('mouseup', () => {
        state.isHoldingPressButton = false;
      });
      pressDownBtn.addEventListener('mouseleave', () => {
        state.isHoldingPressButton = false;
      });
      pressDownBtn.addEventListener('touchstart', () => {
        state.isHoldingPressButton = true;
      }, { passive: true });
      pressDownBtn.addEventListener('touchend', () => {
        state.isHoldingPressButton = false;
      });
      pressDownBtn.addEventListener('click', triggerStandardPressStep);
    }

    const pressResetBtn = $('btn-press-reset');
    if (pressResetBtn) {
      pressResetBtn.addEventListener('click', resetStandardPress);
    }

    // Jack lever pumping & release
    $('btn-jack-pump').addEventListener('click', pumpJackHandle);
    $('btn-jack-release').addEventListener('click', releaseJackValve);

    // Press Piston Sliders
    bindSliderWithInput('piston1-dia-slider', 'piston1-dia-input', (val) => {
      state.piston1Dia = parseFloat(val);
      updatePressPhysics();
    });
    bindSliderWithInput('piston2-dia-slider', 'piston2-dia-input', (val) => {
      state.piston2Dia = parseFloat(val);
      updatePressPhysics();
    });
    bindSliderWithInput('lever-ratio-slider', 'lever-ratio-input', (val) => {
      state.leverRatio = parseFloat(val);
      updatePressPhysics();
    });
    bindSliderWithInput('force1-slider', 'force1-input', (val) => {
      state.force1 = parseFloat(val);
      updatePressPhysics();
    });

    // Custom Liquid Sliders
    bindSliderWithInput('custom-density-slider', 'custom-density-input', (val) => {
      state.currentLiquid = {
        id: 'custom',
        nameKey: 'custom_liquid_title',
        density: parseFloat(val),
        color: '#6366f1',
        fillGrad: ['#818cf8', '#4338ca'],
        viscosity: 0.94
      };
      populateLiquidsUI();
    });
    bindSliderWithInput('gravity-slider', 'gravity-input', (val) => {
      state.gravity = parseFloat(val);
      updatePressPhysics();
    });

    // Canvas Pointer Events for interactive pouring & piston dragging
    setupCanvasInteractions();
  }

  // --- Language Switcher ---
  function setLanguage(lang) {
    state.lang = lang;
    $('btn-lang-uk').classList.toggle('active', lang === 'uk');
    $('btn-lang-en').classList.toggle('active', lang === 'en');
    updateLocalization();
    populateUI();
  }

  // --- Theme Controller ---
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  // --- Helper: Double-bound Sliders with Number inputs ---
  function bindSliderWithInput(sliderId, inputId, onChange) {
    const slider = $(sliderId);
    const input = $(inputId);
    if (!slider || !input) return;

    slider.addEventListener('input', (e) => {
      input.value = e.target.value;
      onChange(e.target.value);
    });
    input.addEventListener('change', (e) => {
      let val = parseFloat(e.target.value);
      const min = parseFloat(slider.min);
      const max = parseFloat(slider.max);
      if (isNaN(val)) val = min;
      val = Math.max(min, Math.min(max, val));
      input.value = val;
      slider.value = val;
      onChange(val);
    });
  }

  // --- Setup Canvas Direct Interactions ---
  function setupCanvasInteractions() {
    const getCanvasPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const handlePointerStart = (e) => {
      isPointerDownOnCanvas = true;
      const pos = getCanvasPos(e);
      lastPointerPos = pos;
      dragStartY = pos.y;

      if (state.mode === 'vessels') {
        const vIdx = getVesselAtPos(pos.x, pos.y);
        if (vIdx !== null) {
          state.selectedVesselIdx = vIdx;
          pourLiquidIntoVessel(vIdx, 10);
          state.pouringStream.active = true;
          state.pouringStream.vesselIdx = vIdx;
          state.pouringStream.targetX = pos.x;
          populateVesselsControlsUI();
        }
      } else {
        // Press mode: Check grab on small piston, jack handle, or release valve
        const pressGeom = getPressGeometry();
        if (pressGeom) {
          const { piston1Center, w1, piston1Y, piston1Left, bottomY } = pressGeom;

          // Check if clicking near the manual release valve knob (Jack bypass valve or manifold valve)
          const jackValveX = piston1Left + w1 + 75;
          const jackValveY = bottomY - 35;
          const stdValveX = piston1Left + w1 + 35;
          const stdValveY = bottomY - 18;

          if (
            (Math.abs(pos.x - jackValveX) <= 26 && Math.abs(pos.y - jackValveY) <= 26) ||
            (Math.abs(pos.x - stdValveX) <= 26 && Math.abs(pos.y - stdValveY) <= 26)
          ) {
            if (state.pressSubmode === 'jack') {
              releaseJackValve();
            } else {
              resetStandardPress();
            }
            return;
          }

          if (state.pressSubmode === 'jack') {
            // Fulcrum is to the RIGHT of the small cylinder (piston1Center + 55)
            // Handle extends to the LEFT (piston1Center - 145)
            const fulcrumX = piston1Center + 55;
            const fulcrumY = bottomY - 195;
            if (pos.x <= fulcrumX + 25 && pos.x >= piston1Center - 165 && Math.abs(pos.y - fulcrumY) <= 130) {
              state.isDraggingJackLever = true;
              pumpJackHandle();
            } else if (Math.abs(pos.x - piston1Center) <= w1 / 2 + 25) {
              state.isDraggingPiston1 = true;
              dragStartPiston1H = state.piston1Height;
              pumpJackHandle();
            }
          } else {
            // Standard Press: small piston grab / direct pressing
            if (Math.abs(pos.x - piston1Center) <= w1 / 2 + 35) {
              state.isDraggingPiston1 = true;
              dragStartPiston1H = state.piston1Height;
              canvas.style.cursor = 'ns-resize';

              // Apply immediate responsive step right away on click (zero lag)
              applyDirectPistonDisplacement(pos.y);
            }
          }
        }
      }
    };

    const handlePointerMove = (e) => {
      if (!isPointerDownOnCanvas) return;
      const pos = getCanvasPos(e);
      lastPointerPos = pos;

      if (state.mode === 'vessels') {
        const vIdx = getVesselAtPos(pos.x, pos.y);
        if (vIdx !== null) {
          state.selectedVesselIdx = vIdx;
          pourLiquidIntoVessel(vIdx, 3);
          state.pouringStream.active = true;
          state.pouringStream.vesselIdx = vIdx;
          state.pouringStream.targetX = pos.x;
        } else {
          state.pouringStream.active = false;
        }
      } else if (state.isDraggingPiston1 && state.pressSubmode === 'standard') {
        // Dragging small piston in real-time
        applyDirectPistonDisplacement(pos.y);
      }
    };

    const handlePointerEnd = () => {
      isPointerDownOnCanvas = false;
      state.isDraggingPiston1 = false;
      state.isDraggingJackLever = false;
      state.pouringStream.active = false;
      canvas.style.cursor = 'crosshair';
    };

    canvas.addEventListener('mousedown', handlePointerStart);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerEnd);

    canvas.addEventListener('touchstart', handlePointerStart, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerEnd);
  }

  // Calculate real-time instantaneous piston tracking and incompressible clamping
  function applyDirectPistonDisplacement(mouseY) {
    const pressGeom = getPressGeometry();
    if (!pressGeom) return;

    const dy = mouseY - dragStartY; // positive downward displacement
    const targetH1 = Math.max(20, Math.min(160, dragStartPiston1H - dy));
    const deltaH1 = 90 - targetH1; // mm pushed down from neutral 90

    const S1 = Math.PI * Math.pow(state.piston1Dia / 2, 2);
    const S2 = Math.PI * Math.pow(state.piston2Dia / 2, 2);
    const deltaVol = S1 * Math.max(0, deltaH1); // mm³ displaced

    // Height of large piston without clamp (amplified visually for clarity)
    const idealDeltaH2 = (deltaVol / S2) * 2.2;
    const idealH2 = 90 + idealDeltaH2;

    // Rigid reaction beam contact at contactH2 = 134 mm, full squash at 148 mm
    const contactH2 = 134;
    const maxSquash = 14; // mm of allowable workpiece compression before hard stop

    let finalH2 = idealH2;
    let compression = 0;
    let clamped = false;

    if (idealH2 >= contactH2) {
      const overTravel = idealH2 - contactH2;
      // Smooth non-linear elastoplastic compression curve
      const normalizedOver = Math.min(1.0, overTravel / maxSquash);
      compression = Math.min(1.0, Math.pow(normalizedOver, 0.85));
      finalH2 = contactH2 + compression * maxSquash;
      clamped = compression >= 0.98;

      // Incompressible fluid constraint: lock piston 1 from descending beyond allowable limit
      const maxAllowedVol = ((finalH2 - 90) / 2.2) * S2;
      const maxAllowedDeltaH1 = maxAllowedVol / S1;
      const minH1 = Math.max(20, 90 - maxAllowedDeltaH1);

      state.targetPiston1Height = Math.max(minH1, targetH1);
    } else {
      clamped = false;
      compression = 0;
      state.targetPiston1Height = targetH1;
    }

    state.targetPiston2Height = finalH2;
    state.isPressClamped = clamped;
    state.pressCompression = compression;

    // Smoothly synchronize immediate heights on active drag for zero latency
    state.piston1Height = state.targetPiston1Height;
    state.piston2Height = state.targetPiston2Height;

    // Simulate applied force dynamically
    const simulatedF1 = Math.min(500, Math.max(0, (90 - state.piston1Height) * 5 + (clamped ? 220 : 0)));
    state.force1 = Math.round(simulatedF1);
    $('force1-slider').value = state.force1;
    $('force1-input').value = state.force1;

    updateTelemetry();
    renderCalculations();
  }

  // Find which vessel column contains x, y
  function getVesselAtPos(x, y) {
    const geom = getVesselsGeometry();
    if (!geom) return null;
    for (let i = 0; i < state.vesselsCount; i++) {
      const v = geom.tubes[i];
      if (x >= v.x - 20 && x <= v.x + v.w + 20 && y <= geom.bottomY + 40) {
        return i;
      }
    }
    return null;
  }

  // --- Draggable Physics Rule Banner ---
  function setupDraggableBanner() {
    const banner = $('physics-rule-banner');
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    banner.addEventListener('mousedown', (e) => {
      if (e.target === $('btn-close-banner')) return;
      isDragging = true;
      banner.classList.add('is-dragging');
      startX = e.clientX;
      startY = e.clientY;
      const rect = banner.getBoundingClientRect();
      const parentRect = banner.parentElement.getBoundingClientRect();
      initialLeft = rect.left - parentRect.left;
      initialTop = rect.top - parentRect.top;
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      banner.style.left = `${Math.max(10, initialLeft + dx)}px`;
      banner.style.top = `${Math.max(10, initialTop + dy)}px`;
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        banner.classList.remove('is-dragging');
      }
    });
  }

  // --- Mode Switching ---
  function setMode(mode) {
    state.mode = mode;
    $('btn-mode-vessels').classList.toggle('active', mode === 'vessels');
    $('btn-mode-press').classList.toggle('active', mode === 'press');

    $('vessels-controls-container').style.display = mode === 'vessels' ? 'block' : 'none';
    $('press-controls-container').style.display = mode === 'press' ? 'block' : 'none';

    $('canvas-hint-text').textContent = mode === 'vessels'
      ? I18N[state.lang].canvas_hint_vessels
      : I18N[state.lang].canvas_hint_press;

    updateRuleBanner();
    populatePresetsUI();
    updateTelemetry();
    renderCalculations();
  }

  function setPressSubmode(submode) {
    state.pressSubmode = submode;
    $('btn-press-type-standard').classList.toggle('active', submode === 'standard');
    $('btn-press-type-jack').classList.toggle('active', submode === 'jack');
    const stdCard = $('standard-press-action-section');
    if (stdCard) stdCard.style.display = submode === 'standard' ? 'flex' : 'none';
    $('jack-pumping-section').style.display = submode === 'jack' ? 'flex' : 'none';
    $('lever-ratio-control').style.display = submode === 'jack' ? 'flex' : 'none';
    updatePressPhysics(true);
    renderCalculations();
  }

  function updateRuleBanner() {
    const isVessels = state.mode === 'vessels';
    $('rule-badge-text').textContent = isVessels
      ? I18N[state.lang].rule_badge_vessels
      : I18N[state.lang].rule_badge_press;
    $('rule-math-formula').textContent = isVessels
      ? I18N[state.lang].rule_formula_vessels
      : I18N[state.lang].rule_formula_press;
    $('rule-banner-desc').textContent = isVessels
      ? I18N[state.lang].rule_desc_vessels
      : I18N[state.lang].rule_desc_press;
  }

  // --- Populate UI Components ---
  function populateUI() {
    populatePresetsUI();
    populateValvesUI();
    populateVesselsControlsUI();
    populateLiquidsUI();
    populateLoadsUI();
    populateTasksUI();
    updateRuleBanner();
    renderCalculations();
  }

  // --- Presets List ---
  function populatePresetsUI() {
    const container = $('presets-container');
    container.innerHTML = '';

    const presets = state.mode === 'vessels'
      ? [
          { id: 'equal', title: I18N[state.lang].preset_equal, action: () => applyPreset('equal') },
          { id: 'steps', title: I18N[state.lang].preset_steps, action: () => applyPreset('steps') },
          { id: 'valves', title: I18N[state.lang].preset_valves, action: () => applyPreset('valves') },
          { id: 'heavy', title: I18N[state.lang].preset_heavy, action: () => applyPreset('heavy') }
        ]
      : [
          { id: 'lift', title: I18N[state.lang].preset_press_lift, action: () => applyPreset('press_lift') },
          { id: 'jack', title: I18N[state.lang].preset_jack_lever, action: () => applyPreset('jack_lever') }
        ];

    presets.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'btn-preset';
      btn.textContent = p.title;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        p.action();
      });
      container.appendChild(btn);
    });
  }

  function applyPreset(id) {
    if (id === 'equal') {
      state.vesselsCount = 3;
      state.valves = [true, true, true];
      state.vessels.forEach(v => { v.width = 60; v.shape = 'straight'; v.height = 140; });
      setVesselsCount(3);
    } else if (id === 'steps') {
      state.vesselsCount = 4;
      state.valves = [true, true, true];
      state.vessels[0] = { width: 35, height: 160, targetHeight: 160, velocity: 0, shape: 'straight' };
      state.vessels[1] = { width: 95, height: 160, targetHeight: 160, velocity: 0, shape: 'cone' };
      state.vessels[2] = { width: 50, height: 160, targetHeight: 160, velocity: 0, shape: 'zigzag' };
      state.vessels[3] = { width: 80, height: 160, targetHeight: 160, velocity: 0, shape: 'stepped' };
      setVesselsCount(4);
    } else if (id === 'valves') {
      state.vesselsCount = 3;
      state.valves = [false, true, true];
      state.vessels[0].height = 230;
      state.vessels[1].height = 80;
      state.vessels[2].height = 80;
      setVesselsCount(3);
      populateValvesUI();
      checkTaskCompletion('task_close_valves');
    } else if (id === 'heavy') {
      state.currentLiquid = LIQUIDS_DB.find(l => l.id === 'mercury');
      populateLiquidsUI();
      checkTaskCompletion('task_heavy_liquid');
    } else if (id === 'press_lift') {
      setMode('press');
      setPressSubmode('standard');
      state.piston1Dia = 15;
      state.piston2Dia = 150;
      state.force1 = 90;
      state.selectedLoad = LOADS_DB.find(l => l.id === 'car');
      $('piston1-dia-slider').value = 15;
      $('piston1-dia-input').value = 15;
      $('piston2-dia-slider').value = 150;
      $('piston2-dia-input').value = 150;
      $('force1-slider').value = 90;
      $('force1-input').value = 90;
      populateLoadsUI();
      updatePressPhysics();
      checkTaskCompletion('task_lift_car');
    } else if (id === 'jack_lever') {
      setMode('press');
      setPressSubmode('jack');
      state.piston1Dia = 12;
      state.piston2Dia = 120;
      state.leverRatio = 8;
      state.force1 = 120;
      state.selectedLoad = LOADS_DB.find(l => l.id === 'car');
      $('piston1-dia-slider').value = 12;
      $('piston1-dia-input').value = 12;
      $('piston2-dia-slider').value = 120;
      $('piston2-dia-input').value = 120;
      $('lever-ratio-slider').value = 8;
      $('lever-ratio-input').value = 8;
      populateLoadsUI();
      updatePressPhysics();
    }
    computeVesselsEquilibrium();
  }

  // --- Connecting Valves UI ---
  function populateValvesUI() {
    const container = $('valves-control-group');
    container.innerHTML = '';

    for (let i = 0; i < state.vesselsCount - 1; i++) {
      const row = document.createElement('div');
      row.className = 'valve-toggle-row';

      const label = document.createElement('span');
      label.className = 'valve-label';
      label.innerHTML = `<span>🚪</span> ${I18N[state.lang].valve_between} <strong>#${i + 1} ↔ #${i + 2}</strong>`;

      const btn = document.createElement('button');
      btn.className = `btn-valve-state ${state.valves[i] ? 'open' : 'closed'}`;
      btn.textContent = state.valves[i] ? I18N[state.lang].valve_open : I18N[state.lang].valve_closed;

      btn.addEventListener('click', () => {
        state.valves[i] = !state.valves[i];
        btn.className = `btn-valve-state ${state.valves[i] ? 'open' : 'closed'}`;
        btn.textContent = state.valves[i] ? I18N[state.lang].valve_open : I18N[state.lang].valve_closed;
        computeVesselsEquilibrium();
        checkTaskCompletion('task_close_valves');
      });

      row.appendChild(label);
      row.appendChild(btn);
      container.appendChild(row);
    }
  }

  // --- Vessel Count Switcher ---
  function setVesselsCount(count) {
    state.vesselsCount = count;
    document.querySelectorAll('.btn-count-choice').forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.count, 10) === count);
    });
    populateValvesUI();
    populateVesselsControlsUI();
    computeVesselsEquilibrium();
  }

  // --- Individual Vessel Controls in Sidebar ---
  function populateVesselsControlsUI() {
    const container = $('individual-vessels-list');
    container.innerHTML = '';
    const mmUnit = state.lang === 'uk' ? 'мм' : 'mm';
    const mlUnit = state.lang === 'uk' ? 'мл' : 'mL';

    for (let i = 0; i < state.vesselsCount; i++) {
      const v = state.vessels[i];
      const card = document.createElement('div');
      card.className = `vessel-control-card ${state.selectedVesselIdx === i ? 'selected' : ''}`;

      // Header
      const header = document.createElement('div');
      header.className = 'vessel-card-header';
      header.innerHTML = `
        <div class="vessel-badge-title">
          <span class="vessel-tag">#${i + 1}</span>
          <span>${I18N[state.lang].vessel_label} ${i + 1}</span>
        </div>
        <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--accent-light); font-weight:700;">
          h: ${v.height.toFixed(1)} ${mmUnit} | d: ${v.width} ${mmUnit}
        </span>
      `;

      // Width Slider
      const sliderWrap = document.createElement('div');
      sliderWrap.className = 'slider-control';
      sliderWrap.innerHTML = `
        <div class="slider-header">
          <label>${I18N[state.lang].width_label}</label>
          <span style="font-family: var(--font-mono); font-size: 0.72rem; font-weight:700;">${v.width} ${mmUnit}</span>
        </div>
        <input type="range" class="range-input" min="25" max="110" step="5" value="${v.width}">
      `;

      sliderWrap.querySelector('input').addEventListener('input', (e) => {
        v.width = parseInt(e.target.value, 10);
        sliderWrap.querySelector('.slider-header span').textContent = `${v.width} ${mmUnit}`;
        computeVesselsEquilibrium();
      });

      // Shapes Choice
      const shapesWrap = document.createElement('div');
      shapesWrap.className = 'shape-pills';
      const shapes = [
        { id: 'straight', name: I18N[state.lang].shape_straight },
        { id: 'cone', name: I18N[state.lang].shape_cone },
        { id: 'zigzag', name: I18N[state.lang].shape_zigzag },
        { id: 'stepped', name: I18N[state.lang].shape_stepped }
      ];

      shapes.forEach(s => {
        const pill = document.createElement('button');
        pill.className = `shape-pill ${v.shape === s.id ? 'active' : ''}`;
        pill.textContent = s.name;
        pill.addEventListener('click', () => {
          v.shape = s.id;
          shapesWrap.querySelectorAll('.shape-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
        });
        shapesWrap.appendChild(pill);
      });

      // Pour actions
      const pourRow = document.createElement('div');
      pourRow.className = 'pour-actions-row';
      pourRow.innerHTML = `
        <button class="btn-pour-amount btn-pour-30">+30 ${mlUnit}</button>
        <button class="btn-pour-amount btn-pour-100">+100 ${mlUnit}</button>
        <button class="btn-drain-amount btn-drain-30">-30 ${mlUnit}</button>
      `;

      pourRow.querySelector('.btn-pour-30').addEventListener('click', () => {
        state.selectedVesselIdx = i;
        pourLiquidIntoVessel(i, 30);
      });
      pourRow.querySelector('.btn-pour-100').addEventListener('click', () => {
        state.selectedVesselIdx = i;
        pourLiquidIntoVessel(i, 100);
      });
      pourRow.querySelector('.btn-drain-30').addEventListener('click', () => {
        state.selectedVesselIdx = i;
        drainLiquidFromVessel(i, 30);
      });

      card.appendChild(header);
      card.appendChild(sliderWrap);
      card.appendChild(shapesWrap);
      card.appendChild(pourRow);
      container.appendChild(card);
    }
  }

  // --- Liquids Palette UI ---
  function populateLiquidsUI() {
    const container = $('liquids-palette-grid');
    container.innerHTML = '';

    LIQUIDS_DB.forEach(l => {
      const card = document.createElement('div');
      card.className = `liquid-card ${state.currentLiquid.id === l.id ? 'active' : ''}`;
      card.innerHTML = `
        <div class="liquid-swatch" style="background: linear-gradient(135deg, ${l.fillGrad[0]}, ${l.fillGrad[1]}); border: 1px solid ${l.color};"></div>
        <div class="liquid-meta">
          <span class="liq-name">${I18N[state.lang][l.nameKey] || l.nameKey}</span>
          <span class="liq-density">${l.density} кг/м³</span>
        </div>
      `;
      card.addEventListener('click', () => {
        state.currentLiquid = l;
        $('custom-density-slider').value = l.density;
        $('custom-density-input').value = l.density;
        populateLiquidsUI();
        updateTelemetry();
        renderCalculations();
        if (l.id === 'mercury') {
          checkTaskCompletion('task_heavy_liquid');
        }
      });
      container.appendChild(card);
    });
  }

  // --- Loads Palette UI for Hydraulic Press ---
  function populateLoadsUI() {
    const container = $('load-selector-grid');
    container.innerHTML = '';

    LOADS_DB.forEach(load => {
      const card = document.createElement('div');
      card.className = `load-card ${state.selectedLoad.id === load.id ? 'active' : ''}`;
      card.innerHTML = `
        <span class="load-icon">${load.icon}</span>
        <div class="liquid-meta">
          <span class="liq-name">${I18N[state.lang][load.nameKey] || load.nameKey}</span>
          <span class="liq-density">${load.mass > 0 ? load.mass + ' кг' : '0 кг'}</span>
        </div>
      `;
      card.addEventListener('click', () => {
        state.selectedLoad = load;
        populateLoadsUI();
        updatePressPhysics();
        renderCalculations();
      });
      container.appendChild(card);
    });
  }

  // --- Guided Lab Tasks UI ---
  function populateTasksUI() {
    const container = $('tasks-list-container');
    container.innerHTML = '';

    state.tasks.forEach((task, idx) => {
      const item = document.createElement('div');
      item.className = `task-item ${task.done ? 'completed' : ''}`;
      item.innerHTML = `
        <div class="task-header">
          <span class="task-title">#${idx + 1}. ${task[state.lang]}</span>
          <span class="task-status ${task.done ? 'done' : 'pending'}">${task.done ? '✓ ВИКОНАНО' : 'В ПРОЦЕСІ'}</span>
        </div>
      `;
      container.appendChild(item);
    });
  }

  function checkTaskCompletion(taskId) {
    const t = state.tasks.find(x => x.id === taskId);
    if (t && !t.done) {
      t.done = true;
      populateTasksUI();
    }
  }

  // --- Pouring & Draining Actions ---
  function pourLiquidIntoVessel(vIdx, amount) {
    if (vIdx < 0 || vIdx >= state.vesselsCount) return;
    const v = state.vessels[vIdx];
    v.height = Math.min(265, v.height + amount);
    computeVesselsEquilibrium();

    // Check task: pour into narrowest
    let minW = Infinity;
    let minWIdx = 0;
    for (let i = 0; i < state.vesselsCount; i++) {
      if (state.vessels[i].width < minW) {
        minW = state.vessels[i].width;
        minWIdx = i;
      }
    }
    if (vIdx === minWIdx && amount > 10) {
      checkTaskCompletion('task_pour_unequal');
    }
  }

  function drainLiquidFromVessel(vIdx, amount) {
    if (vIdx < 0 || vIdx >= state.vesselsCount) return;
    const v = state.vessels[vIdx];
    v.height = Math.max(15, v.height - amount);
    computeVesselsEquilibrium();
  }

  function drainAllLiquid() {
    for (let i = 0; i < state.vesselsCount; i++) {
      state.vessels[i].height = 20;
      state.vessels[i].targetHeight = 20;
      state.vessels[i].velocity = 0;
    }
    state.jackOilVolumeInRam = 0;
    state.piston1Height = 90;
    state.piston2Height = 90;
    state.targetPiston1Height = 90;
    state.targetPiston2Height = 90;
    computeVesselsEquilibrium();
    updatePressPhysics();
  }

  // --- Communicating Vessels Equilibrium Mathematics ---
  function computeVesselsEquilibrium() {
    const groups = [];
    let currentGroup = [0];

    for (let i = 0; i < state.vesselsCount - 1; i++) {
      if (state.valves[i]) {
        currentGroup.push(i + 1);
      } else {
        groups.push(currentGroup);
        currentGroup = [i + 1];
      }
    }
    groups.push(currentGroup);

    groups.forEach(group => {
      let groupVolume = 0;
      let groupTotalArea = 0;

      group.forEach(idx => {
        const v = state.vessels[idx];
        groupVolume += v.width * v.height;
        groupTotalArea += v.width;
      });

      const eqHeight = groupVolume / groupTotalArea;
      group.forEach(idx => {
        state.vessels[idx].targetHeight = Math.min(270, Math.max(15, eqHeight));
      });
    });
  }

  // --- Hydraulic Press & Jack Mechanics ---
  function updatePressPhysics(forceDirect = false) {
    const S1 = Math.PI * Math.pow(state.piston1Dia / 2, 2); // mm²
    const S2 = Math.PI * Math.pow(state.piston2Dia / 2, 2); // mm²
    const areaRatio = S2 / S1;

    // Total mechanical advantage including lever if Jack mode
    const totalRatio = state.pressSubmode === 'jack' ? areaRatio * state.leverRatio : areaRatio;

    // Output force on large piston
    const F2 = state.force1 * totalRatio; // N

    // Gravity force of load
    const loadWeight = state.selectedLoad.mass * state.gravity; // N

    // Net lifting force
    const netForce = F2 - loadWeight;

    if (state.pressSubmode === 'standard') {
      if (!state.isDraggingPiston1) {
        if (state.force1 > 0 && netForce >= 0) {
          // Large piston rises proportionally, small piston goes down
          const liftProportion = Math.min(58, (F2 / (loadWeight + 60)) * 36 + 14);
          const rawTargetP2H = 90 + liftProportion;

          // Reaction beam contact check: contact at 134 mm, full squash at 148 mm
          const contactH2 = 134;
          const maxSquash = 14;
          let clampedH2 = rawTargetP2H;
          let compression = 0;
          let clamped = false;

          if (rawTargetP2H >= contactH2) {
            const overTravel = rawTargetP2H - contactH2;
            const norm = Math.min(1.0, overTravel / maxSquash);
            compression = Math.min(1.0, Math.pow(norm, 0.85));
            clampedH2 = contactH2 + compression * maxSquash;
            clamped = compression >= 0.98;
          }

          state.targetPiston2Height = clampedH2;
          state.isPressClamped = clamped;
          state.pressCompression = compression;

          // Conservation of volume: dh1 = dh2 * (S2 / S1) scaled visually
          const dropAmount = (clampedH2 - 90) * (S2 / S1);
          state.targetPiston1Height = Math.max(20, 90 - Math.min(70, dropAmount * 0.12));
        } else if (state.force1 > 0 && netForce < 0) {
          // Weight is too heavy: large piston stays at bottom, small piston resisted
          state.targetPiston2Height = 90;
          state.targetPiston1Height = 90;
          state.isPressClamped = false;
          state.pressCompression = 0;
        } else {
          // Idle rest state
          state.targetPiston1Height = 90;
          state.targetPiston2Height = 90;
          state.isPressClamped = false;
          state.pressCompression = 0;
        }
      }
    } else {
      // Jack Mode: Piston 2 height determined by displaced oil in Ram
      const liftFromJack = (state.jackOilVolumeInRam * 1000) / S2 * 7.5;
      state.targetPiston2Height = Math.min(175, 90 + liftFromJack);
    }

    if (forceDirect) {
      state.piston1Height = state.targetPiston1Height;
      state.piston2Height = state.targetPiston2Height;
    }

    const isLifted = state.pressSubmode === 'jack' ? (state.piston2Height > 94) : (F2 >= loadWeight && state.force1 > 0);
    if (state.selectedLoad.id === 'car' && isLifted) {
      checkTaskCompletion('task_lift_car');
    }

    updateTelemetry();
    renderCalculations();
  }

  // Quick Action for Standard Press button
  function triggerStandardPressStep() {
    if (state.isPressClamped && state.pressCompression >= 0.95) return;
    state.force1 = Math.min(500, state.force1 + 35);
    $('force1-slider').value = state.force1;
    $('force1-input').value = state.force1;
    updatePressPhysics();
  }

  function resetStandardPress() {
    state.force1 = 0;
    $('force1-slider').value = 0;
    $('force1-input').value = 0;
    state.targetPiston1Height = 90;
    state.targetPiston2Height = 90;
    state.isPressClamped = false;
    state.pressCompression = 0;
    state.isHoldingPressButton = false;
    state.isDraggingPiston1 = false;
    updatePressPhysics();
  }

  // Jack lever action: continuous time-based mechanical pumping cycle
  function pumpJackHandle() {
    if (state.jackPumpPhase !== 'idle' || state.isJackDraining) return;
    if (state.jackReservoirVolume <= 5) return; // empty reservoir

    const S1 = Math.PI * Math.pow(state.piston1Dia / 2, 2);
    const strokeVol = Math.min(state.jackReservoirVolume, ((S1 * 55) / 1000) * 1.7); // ml per full stroke

    state.jackPumpPhase = 'pumping';
    state.jackPumpTimer = 0;
    state.jackPumpDuration = 0.52; // 0.52s full stroke cycle
    state.jackPendingStrokeVol = strokeVol;

    // Spawn initial cyan forward flow particles
    spawnJackFlowParticles('pump_forward');
  }

  // Jack release valve: Smoothly drains oil back from ram into storage reservoir
  function releaseJackValve() {
    if (state.isJackDraining || state.jackOilVolumeInRam <= 0.1) return;
    state.isJackDraining = true;
    state.jackDrainProgress = 0;
    state.jackHandleAngle = 0;
    state.jackPumpPhase = 'idle';
    state.dischargeValveOpen = false;
    state.suctionValveOpen = false;
    state.isDraggingPiston1 = false;
    state.isDraggingJackLever = false;
  }

  // Spawn flow particles for Jack mode
  function spawnJackFlowParticles(type) {
    const pressGeom = getPressGeometry();
    if (!pressGeom) return;
    const { piston1Left, piston1Center, piston2Center, bottomY } = pressGeom;
    const resX = piston1Left - 50;

    if (type === 'pump_forward') {
      for (let i = 0; i < 7; i++) {
        state.jackReturnParticles.push({
          x: piston1Center + Math.random() * 20,
          y: bottomY + 5 + (Math.random() - 0.5) * 6,
          vx: 4.0 + Math.random() * 2,
          vy: 0,
          targetX: piston2Center,
          life: 1.0,
          type: 'forward'
        });
      }
    } else if (type === 'pump_suction') {
      for (let i = 0; i < 6; i++) {
        state.jackReturnParticles.push({
          x: resX + Math.random() * 15,
          y: bottomY + 3 + (Math.random() - 0.5) * 5,
          vx: 3.5 + Math.random() * 1.5,
          vy: 0,
          targetX: piston1Center,
          life: 1.0,
          type: 'suction'
        });
      }
    } else if (type === 'drain') {
      for (let i = 0; i < 5; i++) {
        state.jackReturnParticles.push({
          x: piston2Center - Math.random() * 20,
          y: bottomY - 35 + (Math.random() - 0.5) * 6,
          vx: -(4.5 + Math.random() * 2),
          vy: 0,
          targetX: resX,
          life: 1.0,
          type: 'return'
        });
      }
    }
  }

  // --- Physics Tick Updates ---
  let lastTimestamp = 0;
  function updatePhysics(dt) {
    if (!state.isPlaying) return;

    const effectiveDt = dt * state.simSpeed;

    if (state.mode === 'vessels') {
      const flowCoeff = 0.02 * state.flowRate;
      let totalDiff = 0;

      for (let i = 0; i < state.vesselsCount; i++) {
        const v = state.vessels[i];
        const diff = v.targetHeight - v.height;
        totalDiff += Math.abs(diff);

        // Spring-damper hydrodynamic equation for liquid level equalisation
        const acceleration = diff * flowCoeff * 16;
        v.velocity = (v.velocity + acceleration * effectiveDt) * state.damping;
        v.height += v.velocity * effectiveDt * 60;
      }

      // Update manifold flow particles
      state.flowParticles.forEach(p => {
        p.x += (totalDiff > 1 ? p.speed * 3 : p.speed * 0.4) * effectiveDt * 60;
        if (p.x > 800) p.x = 0;
        if (p.x < 0) p.x = 800;
      });

      updateTelemetry(totalDiff);
    } else {
      // Hydraulic Press & Jack Simulation Tick
      if (state.pressSubmode === 'standard') {
        if (state.isHoldingPressButton) {
          const forceIncrement = (95 + state.force1 * 0.55) * effectiveDt;
          state.force1 = Math.min(500, state.force1 + forceIncrement);
          $('force1-slider').value = Math.round(state.force1);
          $('force1-input').value = Math.round(state.force1);
          updatePressPhysics();
        }

        if (!state.isDraggingPiston1) {
          const smoothFactor = 1 - Math.exp(-16 * effectiveDt);
          state.piston1Height += (state.targetPiston1Height - state.piston1Height) * smoothFactor;
          state.piston2Height += (state.targetPiston2Height - state.piston2Height) * smoothFactor;
        }

        // Animate particles in the bottom hydraulic connecting manifold
        const flowVelocity = (state.targetPiston2Height - state.piston2Height) * 0.06 + (state.force1 > 0 && !state.isPressClamped ? 0.025 : 0);
        state.pressManifoldParticles.forEach(p => {
          p.progress = (p.progress + flowVelocity * effectiveDt * 18 + 1) % 1;
        });

      } else {
        // Jack Mode Updates: Continuous smooth mechanical pump cycle
        if (state.jackPumpPhase === 'pumping') {
          state.jackPumpTimer += effectiveDt;
          const progress = Math.min(1.0, state.jackPumpTimer / state.jackPumpDuration);

          if (progress <= 0.46) {
            // Downstroke: Lever handle goes down, plunger descends
            const t = progress / 0.46;
            const ease = (1 - Math.cos(t * Math.PI)) / 2;
            state.jackHandleAngle = -24 * ease;
            state.targetPiston1Height = 90 - 55 * ease;
            state.dischargeValveOpen = true;
            state.suctionValveOpen = false;

            if (!state.jackStrokeOilTransferred && progress >= 0.44) {
              state.jackOilVolumeInRam += state.jackPendingStrokeVol;
              state.jackStrokeOilTransferred = true;
              spawnJackFlowParticles('pump_suction');
            }
          } else {
            // Upstroke: Lever handle returns up, fresh oil drawn from reservoir
            const t = (progress - 0.46) / 0.54;
            const ease = (1 - Math.cos(t * Math.PI)) / 2;
            state.jackHandleAngle = -24 * (1 - ease);
            state.targetPiston1Height = 35 + 55 * ease;
            state.dischargeValveOpen = false;
            state.suctionValveOpen = true;

            if (!state.jackReservoirDeducted && progress >= 0.7) {
              state.jackReservoirVolume = Math.max(0, state.jackReservoirVolume - state.jackPendingStrokeVol);
              state.jackReservoirDeducted = true;
            }
          }

          if (progress >= 1.0) {
            state.jackPumpPhase = 'idle';
            state.jackHandleAngle = 0;
            state.targetPiston1Height = 90;
            state.dischargeValveOpen = false;
            state.suctionValveOpen = false;
            state.jackStrokeOilTransferred = false;
            state.jackReservoirDeducted = false;
          }
        }

        if (state.isJackDraining) {
          // Smooth return flow to storage reservoir
          const drainRate = 85 * effectiveDt; // ml per sec
          const drained = Math.min(state.jackOilVolumeInRam, drainRate);
          state.jackOilVolumeInRam -= drained;
          state.jackReservoirVolume = Math.min(state.jackReservoirMaxVolume, state.jackReservoirVolume + drained);

          spawnJackFlowParticles('drain');

          if (state.jackOilVolumeInRam <= 0.2) {
            state.jackOilVolumeInRam = 0;
            state.isJackDraining = false;
            state.targetPiston2Height = 90;
            state.targetPiston1Height = 90;
          }
        }

        const smoothFactor = 1 - Math.exp(-15 * effectiveDt);
        state.piston1Height += (state.targetPiston1Height - state.piston1Height) * smoothFactor;
        state.piston2Height += (state.targetPiston2Height - state.piston2Height) * smoothFactor;
      }

      // Smooth Analog Glycerin-Damped Manometer Needle Angle
      const pressFraction = state.isPressClamped ? 0.95 : Math.min(1.0, state.force1 / 500);
      const targetNeedleAngle = (-135 + pressFraction * 270) * (Math.PI / 180);
      state.manometerAngle += (targetNeedleAngle - state.manometerAngle) * (1 - Math.exp(-14 * effectiveDt));

      // Update Jack Return Flow Particles
      for (let i = state.jackReturnParticles.length - 1; i >= 0; i--) {
        const p = state.jackReturnParticles[i];
        p.x += p.vx * effectiveDt * 60;
        p.life -= effectiveDt * 1.5;
        if (p.life <= 0 || (p.type === 'return' && p.x <= p.targetX) || (p.type === 'forward' && p.x >= p.targetX)) {
          state.jackReturnParticles.splice(i, 1);
        }
      }

      updatePressPhysics();
    }
  }

  // --- Telemetry Dashboard Updates ---
  function updateTelemetry(totalDiff = 0) {
    if (state.mode === 'vessels') {
      let avgH = 0;
      let totalVol = 0;
      let minH = Infinity;
      let maxH = -Infinity;

      for (let i = 0; i < state.vesselsCount; i++) {
        const v = state.vessels[i];
        avgH += v.height;
        totalVol += v.width * v.height;
        if (v.height < minH) minH = v.height;
        if (v.height > maxH) maxH = v.height;
      }
      avgH /= state.vesselsCount;
      const deltaH = maxH - minH;

      // Hydrostatic pressure P = rho * g * h
      const pressureKPa = (state.currentLiquid.density * state.gravity * (avgH / 1000)) / 1000;

      // Card 1: Mean Height (h) [mm]
      $('telem-label-1').textContent = I18N[state.lang].telem_h_mean;
      $('telem-val-1').textContent = avgH.toFixed(1);
      $('telem-unit-1').textContent = state.lang === 'uk' ? 'мм' : 'mm';
      $('telem-sub-1').textContent = `${state.vesselsCount} ${I18N[state.lang].tubes_unit}`;

      // Card 2: Total Fluid Volume (V) [mL]
      $('telem-label-2').textContent = I18N[state.lang].telem_volume;
      $('telem-val-2').textContent = (totalVol / 10).toFixed(0);
      $('telem-unit-2').textContent = state.lang === 'uk' ? 'мл' : 'mL';
      $('telem-sub-2').textContent = 'V = Σ(S · h)';

      // Card 3: Hydrostatic Base Pressure (P) [kPa]
      $('telem-label-3').textContent = I18N[state.lang].telem_pressure;
      $('telem-val-3').textContent = pressureKPa.toFixed(2);
      $('telem-unit-3').textContent = state.lang === 'uk' ? 'кПа' : 'kPa';
      $('telem-sub-3').textContent = 'P = ρ · g · h';

      // Card 4: Liquid Density (ρ) [kg/m³]
      $('telem-label-4').textContent = I18N[state.lang].telem_density;
      $('telem-val-4').textContent = state.currentLiquid.density;
      $('telem-unit-4').textContent = state.lang === 'uk' ? 'кг/м³' : 'kg/m³';
      $('telem-sub-4').textContent = I18N[state.lang][state.currentLiquid.nameKey] || 'Custom';

      // Card 5: Level Difference (Δh) [mm]
      $('telem-label-5').textContent = I18N[state.lang].telem_delta_h;
      $('telem-val-5').textContent = deltaH.toFixed(1);
      $('telem-unit-5').textContent = state.lang === 'uk' ? 'мм' : 'mm';
      $('telem-sub-5').textContent = deltaH < 1.0 ? 'h₁ = h₂' : 'Δh ≠ 0';

      // Card 6: Equilibrium System Status
      $('telem-label-6').textContent = I18N[state.lang].telem_status;
      $('telem-val-6').textContent = deltaH < 1.5 ? I18N[state.lang].status_stable : I18N[state.lang].status_flowing;
      $('telem-val-6').className = `telemetry-value ${deltaH < 1.5 ? 'highlight-emerald' : 'highlight-amber'}`;
      $('telem-sub-6').textContent = deltaH < 1.5 ? 'Q = 0' : 'Q > 0 (потік)';
    } else {
      // Press Mode Telemetry
      const S1 = Math.PI * Math.pow(state.piston1Dia / 2, 2);
      const S2 = Math.PI * Math.pow(state.piston2Dia / 2, 2);
      const k = S2 / S1;
      const totalRatio = state.pressSubmode === 'jack' ? k * state.leverRatio : k;
      const F2 = state.force1 * totalRatio;
      const pressurePistonKPa = (state.force1 / (S1 / 1e6)) / 1000;
      const effectivePressureKPa = state.isPressClamped ? pressurePistonKPa * 3.5 : pressurePistonKPa;
      const loadWeight = state.selectedLoad.mass * state.gravity;

      // Card 1: Input Force F₁ [N]
      $('telem-label-1').textContent = state.lang === 'uk' ? 'Сила F₁ (малий поршень)' : 'Force F₁ (Small)';
      $('telem-val-1').textContent = state.force1.toFixed(0);
      $('telem-unit-1').textContent = state.lang === 'uk' ? 'Н' : 'N';
      $('telem-sub-1').textContent = `S₁ = ${S1.toFixed(0)} мм²`;

      // Card 2: Output Ram Force F₂ [N / kN]
      $('telem-label-2').textContent = state.lang === 'uk' ? 'Сила F₂ (робочий поршень)' : 'Force F₂ (Ram)';
      if (F2 >= 10000) {
        $('telem-val-2').textContent = (F2 / 1000).toFixed(2);
        $('telem-unit-2').textContent = state.lang === 'uk' ? 'кН' : 'kN';
      } else {
        $('telem-val-2').textContent = F2.toFixed(0);
        $('telem-unit-2').textContent = state.lang === 'uk' ? 'Н' : 'N';
      }
      $('telem-sub-2').textContent = `S₂ = ${S2.toFixed(0)} мм²`;

      // Card 3: Hydraulic Pressure (P) [kPa / MPa]
      $('telem-label-3').textContent = state.lang === 'uk' ? 'Гідравлічний тиск (P)' : 'Hydraulic Pressure (P)';
      if (effectivePressureKPa >= 1000) {
        $('telem-val-3').textContent = (effectivePressureKPa / 1000).toFixed(2);
        $('telem-unit-3').textContent = state.lang === 'uk' ? 'МПа' : 'MPa';
      } else {
        $('telem-val-3').textContent = effectivePressureKPa.toFixed(1);
        $('telem-unit-3').textContent = state.lang === 'uk' ? 'кПа' : 'kPa';
      }
      $('telem-sub-3').textContent = state.isPressClamped ? 'P_max (Затиснуто)' : 'P = F₁ / S₁';

      // Card 4: Force Amplification Advantage (k) [x]
      $('telem-label-4').textContent = state.lang === 'uk' ? 'Виграш у силі (k)' : 'Force Advantage (k)';
      $('telem-val-4').textContent = totalRatio.toFixed(1);
      $('telem-unit-4').textContent = 'x';
      $('telem-sub-4').textContent = state.pressSubmode === 'jack' ? `k_гідр=${k.toFixed(0)} · k_важ=${state.leverRatio}` : `k = S₂/S₁ = ${k.toFixed(1)}`;

      // Card 5: Load Gravity Weight (F_тяж) [N / kN]
      $('telem-label-5').textContent = state.lang === 'uk' ? 'Вага вантажу (F_тяж)' : 'Load Weight (F_g)';
      if (loadWeight >= 10000) {
        $('telem-val-5').textContent = (loadWeight / 1000).toFixed(2);
        $('telem-unit-5').textContent = state.lang === 'uk' ? 'кН' : 'kN';
      } else {
        $('telem-val-5').textContent = loadWeight.toFixed(0);
        $('telem-unit-5').textContent = state.lang === 'uk' ? 'Н' : 'N';
      }
      $('telem-sub-5').textContent = `m = ${state.selectedLoad.mass} кг`;

      // Card 6: Operating Status
      $('telem-label-6').textContent = I18N[state.lang].telem_status;
      if (state.isJackDraining) {
        $('telem-val-6').textContent = I18N[state.lang].status_jack_draining;
        $('telem-val-6').className = 'telemetry-value highlight-amber';
        $('telem-sub-6').textContent = `V_резерв = ${state.jackReservoirVolume.toFixed(0)} мл`;
      } else if (state.isPressClamped) {
        $('telem-val-6').textContent = I18N[state.lang].status_press_clamped;
        $('telem-val-6').className = 'telemetry-value highlight-emerald';
        $('telem-sub-6').textContent = `Стиснення: ${(state.pressCompression * 100).toFixed(0)}% (Рідина нестислива)`;
      } else {
        const isLifted = state.pressSubmode === 'jack' ? (state.piston2Height > 93) : (F2 >= loadWeight && state.force1 > 0);
        $('telem-val-6').textContent = isLifted ? I18N[state.lang].status_press_lifted : I18N[state.lang].status_press_idle;
        $('telem-val-6').className = `telemetry-value ${isLifted ? 'highlight-emerald' : 'highlight-indigo'}`;
        $('telem-sub-6').textContent = isLifted ? `Δh = +${(state.piston2Height - 90).toFixed(1)} мм` : (state.pressSubmode === 'jack' ? `V_масла = ${state.jackOilVolumeInRam.toFixed(0)} мл` : 'F₂ < F_тяж');
      }
    }
  }

  // --- Step-by-Step Mathematical Calculations Breakdown ---
  function renderCalculations() {
    const container = $('calculations-breakdown');
    if (!container) return;

    if (state.mode === 'vessels') {
      let avgH = 0;
      let totalVol = 0;
      for (let i = 0; i < state.vesselsCount; i++) {
        avgH += state.vessels[i].height;
        totalVol += state.vessels[i].width * state.vessels[i].height;
      }
      avgH /= state.vesselsCount;
      const P_hydro = (state.currentLiquid.density * state.gravity * (avgH / 1000));

      container.innerHTML = `
        <div class="calc-step-item highlight-calc-step">
          <div class="calc-step-header">
            <span class="step-num">1</span>
            <strong>${state.lang === 'uk' ? 'Закон сполучених посудин' : 'Law of Communicating Vessels'}</strong>
          </div>
          <div class="calc-step-body">
            ${state.lang === 'uk' ? 'Рівновага на дні посудин настає тоді, коли тиск на рівні сполучення однаковий:' : 'Equilibrium occurs when pressure at the connecting base level is identical:'}<br>
            <span class="formula-highlight">P₁ = P₂ = ... = Pₙ = ρ · g · h</span><br>
            ${state.lang === 'uk' ? `Оскільки густина рідини <span class="formula-highlight">ρ = ${state.currentLiquid.density} кг/м³</span> однакова в усіх колінах, висоти стовпів рідини рівні: <span class="formula-highlight">h₁ = h₂ = ${avgH.toFixed(1)} мм</span>.` : `Since density <span class="formula-highlight">ρ = ${state.currentLiquid.density} kg/m³</span> is uniform, fluid columns reach equal height: <span class="formula-highlight">h = ${avgH.toFixed(1)} mm</span>.`}
          </div>
        </div>

        <div class="calc-step-item">
          <div class="calc-step-header">
            <span class="step-num">2</span>
            <strong>${state.lang === 'uk' ? 'Гідростатичний тиск на дні сполучення' : 'Hydrostatic Base Pressure'}</strong>
          </div>
          <div class="calc-step-body">
            P = ρ · g · h = ${state.currentLiquid.density} кг/м³ · ${state.gravity} м/с² · ${(avgH / 1000).toFixed(3)} м = <strong style="color:var(--accent-light)">${(P_hydro / 1000).toFixed(3)} кПа</strong> (${P_hydro.toFixed(0)} Па).
          </div>
        </div>

        <div class="calc-step-item">
          <div class="calc-step-header">
            <span class="step-num">3</span>
            <strong>${state.lang === 'uk' ? 'Збереження об\'єму рідини' : 'Volume Conservation'}</strong>
          </div>
          <div class="calc-step-body">
            V = Σ (Sᵢ · hᵢ) = <span class="formula-highlight">${(totalVol / 10).toFixed(0)} мл</span> (${(totalVol / 10000).toFixed(3)} л).<br>
            ${state.lang === 'uk' ? 'При доливанні додатковий об\'єм автоматично перерозподіляється через сполучну трубку.' : 'Any added fluid automatically redistributes across the connecting tube.'}
          </div>
        </div>
      `;
    } else {
      // Hydraulic Press calculations
      const S1 = Math.PI * Math.pow(state.piston1Dia / 2, 2); // mm²
      const S2 = Math.PI * Math.pow(state.piston2Dia / 2, 2); // mm²
      const k = S2 / S1;
      const F1 = state.force1;
      const leverK = state.pressSubmode === 'jack' ? state.leverRatio : 1;
      const F_piston1 = F1 * leverK;
      const F2 = F_piston1 * k;
      const P_fluid_kPa = (F_piston1 / (S1 / 1e6)) / 1000;
      const loadF = state.selectedLoad.mass * state.gravity;

      container.innerHTML = `
        <div class="calc-step-item highlight-calc-step">
          <div class="calc-step-header">
            <span class="step-num">1</span>
            <strong>${state.lang === 'uk' ? 'Площі циліндрів і виграш у силі' : 'Piston Surface Areas & Force Advantage'}</strong>
          </div>
          <div class="calc-step-body">
            S₁ = π · (d₁/2)² = π · (${state.piston1Dia} мм / 2)² = <span class="formula-highlight">${S1.toFixed(1)} мм²</span> (${(S1 * 1e-6).toExponential(3)} м²)<br>
            S₂ = π · (d₂/2)² = π · (${state.piston2Dia} мм / 2)² = <span class="formula-highlight">${S2.toFixed(1)} мм²</span> (${(S2 * 1e-6).toExponential(3)} м²)<br>
            k = S₂ / S₁ = ${(k).toFixed(1)}x ${state.pressSubmode === 'jack' ? `· (L/l = ${state.leverRatio}x) = <strong>${(k * state.leverRatio).toFixed(1)}x</strong>` : ''}
          </div>
        </div>

        <div class="calc-step-item">
          <div class="calc-step-header">
            <span class="step-num">2</span>
            <strong>${state.lang === 'uk' ? 'Закон Паскаля та тиск у рідині' : 'Pascal\'s Law & Fluid Pressure'}</strong>
          </div>
          <div class="calc-step-body">
            P = F₁ / S₁ = ${F_piston1.toFixed(0)} Н / ${(S1 * 1e-6).toFixed(6)} м² = <span class="formula-highlight">${(P_fluid_kPa).toFixed(1)} кПа</span> (${(P_fluid_kPa / 1000).toFixed(3)} МПа).<br>
            ${state.lang === 'uk' ? 'Рідини практично нестисливі (ΔV = const). При затисканні об\'єкта між платформами рух зупиняється, а гідравлічний тиск P стрімко зростає.' : 'Liquids are incompressible (ΔV = const). When clamped between platens, piston travel stops and hydraulic pressure spikes.'}
          </div>
        </div>

        <div class="calc-step-item">
          <div class="calc-step-header">
            <span class="step-num">3</span>
            <strong>${state.lang === 'uk' ? 'Результуюча сила F₂ та стан вантажу' : 'Output Force F₂ & Load Status'}</strong>
          </div>
          <div class="calc-step-body">
            F₂ = k · F₁ = ${(k * leverK).toFixed(1)} · ${state.force1} Н = <strong style="color:var(--accent-light)">${F2 >= 10000 ? (F2/1000).toFixed(2) + ' кН (' + F2.toFixed(0) + ' Н)' : F2.toFixed(0) + ' Н'}</strong>.<br>
            F_тяж = m · g = ${state.selectedLoad.mass} кг · ${state.gravity} м/с² = <strong style="color:#ef4444">${loadF >= 10000 ? (loadF/1000).toFixed(2) + ' кН (' + loadF.toFixed(0) + ' Н)' : loadF.toFixed(0) + ' Н'}</strong>.<br>
            ${F2 >= loadF ? (state.lang === 'uk' ? '<span style="color:#10b981; font-weight:700;">✓ F₂ ≥ F_тяж: Сила достатня для підйому/пресування!</span>' : '<span style="color:#10b981; font-weight:700;">✓ F₂ ≥ F_g: Force is sufficient to lift / press!</span>') : (state.lang === 'uk' ? '<span style="color:#f59e0b;">⚠ F₂ < F_тяж: Збільшіть прикладену силу F₁ або діаметр d₂.</span>' : '<span style="color:#f59e0b;">⚠ F₂ < F_g: Increase applied force F₁ or diameter d₂.</span>')}
          </div>
        </div>
      `;
    }
  }

  // --- Geometry Calculation for Rendering ---
  function getVesselsGeometry() {
    if (!canvas) return null;
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);

    const count = state.vesselsCount;
    const spacing = Math.min(65, (w - 200) / (count + 1));
    let totalTubesW = 0;
    for (let i = 0; i < count; i++) {
      totalTubesW += state.vessels[i].width;
    }
    const totalSpan = totalTubesW + (count - 1) * spacing;
    const startX = (w - totalSpan) / 2;
    // Elevate table and vessels comfortably above the bottom dock
    const tableTopY = Math.max(260, h - 170);
    const bottomY = tableTopY - 22;
    const manifoldH = 30;

    const tubes = [];
    let curX = startX;
    for (let i = 0; i < count; i++) {
      const v = state.vessels[i];
      tubes.push({
        idx: i,
        x: curX,
        w: v.width,
        h: v.height,
        shape: v.shape
      });
      curX += v.width + spacing;
    }

    return {
      canvasW: w,
      canvasH: h,
      startX,
      tableTopY,
      bottomY,
      manifoldH,
      totalSpan,
      tubes
    };
  }

  function getPressGeometry() {
    if (!canvas) return null;
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);

    // Elevate press table comfortably above the bottom dock
    const tableTopY = Math.max(260, h - 170);
    const bottomY = tableTopY - 22;
    const w1 = Math.max(38, state.piston1Dia * 1.6);
    const w2 = Math.max(90, Math.min(230, state.piston2Dia * 0.95));
    const gap = 160;
    const totalW = w1 + w2 + gap;
    const startX = (w - totalW) / 2;

    const p1Top = bottomY - state.piston1Height;
    const p2Top = bottomY - state.piston2Height;

    return {
      canvasW: w,
      canvasH: h,
      tableTopY,
      bottomY,
      piston1Left: startX,
      piston1Center: startX + w1 / 2,
      piston1Y: p1Top,
      w1,
      piston2Left: startX + w1 + gap,
      piston2Center: startX + w1 + gap + w2 / 2,
      piston2Y: p2Top,
      w2,
      gap
    };
  }

  // --- Rendering Loop ---
  function renderLoop(timestamp) {
    const dt = Math.min(0.1, (timestamp - lastTimestamp) / 1000);
    lastTimestamp = timestamp;

    updatePhysics(dt);

    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Realistic Wooden Laboratory Table
    const tableTopY = Math.max(260, (canvas.height / (window.devicePixelRatio || 1)) - 170);
    drawWoodenTable(ctx, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1), tableTopY);

    // 2. Render Mode Specific Geometry
    if (state.mode === 'vessels') {
      renderCommunicatingVessels();
    } else {
      renderHydraulicPress();
    }

    // 3. Render interactive pouring stream if active
    renderPouringStream();

    animFrameId = requestAnimationFrame(renderLoop);
  }

  // --- Draw Realistic Wooden Tabletop ---
  function drawWoodenTable(c, w, h, tableY) {
    c.save();
    const tableDepth = 24;
    const frontFasciaH = 65;

    // 1. Top Beveled Surface (Polished Oak Wood Grain Gradient)
    const topGrad = c.createLinearGradient(0, tableY - tableDepth, 0, tableY);
    topGrad.addColorStop(0, '#5c2d16');
    topGrad.addColorStop(0.3, '#78350f');
    topGrad.addColorStop(0.7, '#92400e');
    topGrad.addColorStop(1, '#b45309');

    c.fillStyle = topGrad;
    c.beginPath();
    c.moveTo(0, tableY - tableDepth);
    c.lineTo(w, tableY - tableDepth);
    c.lineTo(w, tableY);
    c.lineTo(0, tableY);
    c.closePath();
    c.fill();

    // Wood grain lines on top plane
    c.strokeStyle = 'rgba(67, 20, 7, 0.25)';
    c.lineWidth = 1;
    for (let x = 40; x < w; x += 90) {
      c.beginPath();
      c.moveTo(x, tableY - tableDepth);
      c.bezierCurveTo(x + 15, tableY - tableDepth * 0.5, x - 10, tableY - tableDepth * 0.2, x + 5, tableY);
      c.stroke();
    }

    // Top surface shine reflection line
    c.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(0, tableY);
    c.lineTo(w, tableY);
    c.stroke();

    // 2. Front Table Edge / Fascia (Darker Solid Wood Slab)
    const frontGrad = c.createLinearGradient(0, tableY, 0, tableY + frontFasciaH);
    frontGrad.addColorStop(0, '#78350f');
    frontGrad.addColorStop(0.15, '#5c2d16');
    frontGrad.addColorStop(0.85, '#3b1807');
    frontGrad.addColorStop(1, '#240d04');

    c.fillStyle = frontGrad;
    c.fillRect(0, tableY, w, frontFasciaH);

    // Front wood grain planks
    c.strokeStyle = 'rgba(20, 6, 2, 0.4)';
    c.lineWidth = 1.5;
    for (let px = 120; px < w; px += 180) {
      c.beginPath();
      c.moveTo(px, tableY);
      c.lineTo(px, tableY + frontFasciaH);
      c.stroke();
    }

    // Front bottom shadow & metal table legs
    c.fillStyle = 'rgba(0, 0, 0, 0.4)';
    c.fillRect(0, tableY + frontFasciaH, w, h - (tableY + frontFasciaH));

    // Heavy steel legs on left and right
    c.fillStyle = '#1e293b';
    c.fillRect(60, tableY + frontFasciaH, 30, h - (tableY + frontFasciaH));
    c.fillRect(w - 90, tableY + frontFasciaH, 30, h - (tableY + frontFasciaH));

    c.restore();
  }

  // --- Render Communicating Vessels View ---
  function renderCommunicatingVessels() {
    const geom = getVesselsGeometry();
    if (!geom) return;

    const { tubes, bottomY, tableTopY, manifoldH, startX, totalSpan } = geom;
    const maxTubeH = 220;

    // 1. Draw Heavy Metal Mounting Base Stands on the Wooden Table
    ctx.save();
    tubes.forEach(t => {
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(t.x - 8, tableTopY - 14, t.w + 16, 14, 3);
      ctx.fill();
      ctx.stroke();

      // Steel vertical support brackets
      ctx.fillStyle = '#475569';
      ctx.fillRect(t.x - 4, bottomY, 6, tableTopY - bottomY);
      ctx.fillRect(t.x + t.w - 2, bottomY, 6, tableTopY - bottomY);
    });
    ctx.restore();

    // 2. Liquid inside connecting manifold & vertical tubes (ONE CONTINUOUS FLUID PATH)
    const fluidGrad = ctx.createLinearGradient(0, bottomY - maxTubeH, 0, bottomY + manifoldH);
    fluidGrad.addColorStop(0, state.currentLiquid.fillGrad[0]);
    fluidGrad.addColorStop(1, state.currentLiquid.fillGrad[1]);

    // Draw Bottom Connecting Pipe (Clear Glass Manifold with Fluid inside)
    ctx.save();
    // Glass Pipe Outer Background Tint (Glass Wall Body)
    ctx.fillStyle = state.theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(224, 242, 254, 0.7)';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(startX - 12, bottomY - 2, totalSpan + 24, manifoldH + 4, 8);
    ctx.fill();
    ctx.stroke();

    // Liquid filling the horizontal manifold completely
    ctx.fillStyle = fluidGrad;
    ctx.fillRect(startX - 8, bottomY, totalSpan + 16, manifoldH);

    // Flow particles inside connecting pipe
    state.flowParticles.forEach(p => {
      if (p.x >= startX - 8 && p.x <= startX + totalSpan + 8) {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, bottomY + manifoldH / 2 + (p.y % 14 - 7), p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Glass shine highlight on horizontal pipe
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(startX - 8, bottomY + 3);
    ctx.lineTo(startX + totalSpan + 8, bottomY + 3);
    ctx.stroke();
    ctx.restore();

    // 3. Draw Valves with physical gate inside connecting manifold
    for (let i = 0; i < state.vesselsCount - 1; i++) {
      const t1 = tubes[i];
      const t2 = tubes[i + 1];
      const valveX = (t1.x + t1.w + t2.x) / 2;
      const isOpen = state.valves[i];

      ctx.save();
      // Physical gate inside pipe
      if (!isOpen) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(valveX - 4, bottomY, 8, manifoldH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(valveX - 4, bottomY, 8, manifoldH);
      }

      // Valve rotary handle housing
      ctx.fillStyle = isOpen ? '#10b981' : '#ef4444';
      ctx.beginPath();
      ctx.arc(valveX, bottomY + manifoldH / 2, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Valve wheel / spindle
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(valveX - 2, bottomY - 16, 4, 12);
      ctx.fillRect(valveX - 8, bottomY - 18, 16, 4);

      // Valve state tag
      ctx.font = '700 9px Inter';
      ctx.fillStyle = isOpen ? '#10b981' : '#ef4444';
      ctx.textAlign = 'center';
      ctx.fillText(isOpen ? 'OPEN' : 'CLOSED', valveX, bottomY + manifoldH + 16);
      ctx.restore();
    }

    // 4. Draw Individual Vertical Tubes with CLEAR VISIBLE GLASS WALLS EVEN WHEN EMPTY
    tubes.forEach((t) => {
      const isSelected = state.selectedVesselIdx === t.idx;
      const tubeTopY = bottomY - maxTubeH;
      const liquidY = bottomY - t.h;

      ctx.save();

      // (A) Draw Glass Body Background (tinted volume so empty part is clearly visible)
      buildTubePath(ctx, t, bottomY, maxTubeH);
      ctx.fillStyle = state.theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(14, 165, 233, 0.08)';
      ctx.fill();

      // (B) Draw Fluid inside Tube (Clipped to Vessel shape)
      ctx.save();
      buildTubePath(ctx, t, bottomY, maxTubeH);
      ctx.clip();

      ctx.fillStyle = fluidGrad;
      ctx.fillRect(t.x - 30, liquidY, t.w + 60, t.h + manifoldH + 20);

      // Fluid meniscus wave / surface ellipse gloss
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.ellipse(t.x + t.w / 2, liquidY, t.w / 2, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fluid bubbles
      drawFluidBubbles(t.x, liquidY, t.w, t.h);
      ctx.restore();

      // (C) Draw Etched Measurement Graduation Ticks on Glass Wall (0mm to 250mm)
      ctx.save();
      ctx.strokeStyle = state.theme === 'dark' ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)';
      ctx.lineWidth = 1;
      ctx.fillStyle = state.theme === 'dark' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.5)';
      ctx.font = '600 7px JetBrains Mono';
      ctx.textAlign = 'right';

      for (let mm = 20; mm <= maxTubeH - 20; mm += 30) {
        const tickY = bottomY - mm;
        ctx.beginPath();
        ctx.moveTo(t.x + 2, tickY);
        ctx.lineTo(t.x + 7, tickY);
        ctx.stroke();
        if (mm % 60 === 0) {
          ctx.fillText(`${mm}`, t.x - 3, tickY + 2.5);
        }
      }
      ctx.restore();

      // (D) Draw Thick, Crystal Clear Glass Walls (Outer Outline)
      ctx.save();
      buildTubePath(ctx, t, bottomY, maxTubeH);
      ctx.strokeStyle = isSelected ? '#818cf8' : (state.theme === 'dark' ? '#94a3b8' : '#475569');
      ctx.lineWidth = isSelected ? 3.5 : 2.5;
      ctx.stroke();

      // (E) Glass Top Flared Rim (Lip of the Glassware)
      ctx.strokeStyle = isSelected ? '#818cf8' : (state.theme === 'dark' ? '#cbd5e1' : '#334155');
      ctx.lineWidth = 2.5;
      ctx.fillStyle = state.theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
      ctx.beginPath();
      const rimExtra = t.shape === 'cone' ? 18 : 6;
      ctx.ellipse(t.x + t.w / 2, tubeTopY, (t.w / 2) + rimExtra, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // (F) Glass Specular Highlight Streak (White reflection running down the side)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(t.x + 3, tubeTopY + 8);
      ctx.lineTo(t.x + 3, bottomY - 6);
      ctx.stroke();

      ctx.restore();

      // (G) Vessel Labels & Height Readouts
      ctx.font = '700 11px JetBrains Mono, monospace';
      ctx.fillStyle = isSelected ? '#818cf8' : (state.theme === 'dark' ? '#cbd5e1' : '#1e293b');
      ctx.textAlign = 'center';
      ctx.fillText(`#${t.idx + 1} (${t.w}mm)`, t.x + t.w / 2, tubeTopY - 16);

      ctx.font = '600 10px JetBrains Mono';
      ctx.fillStyle = 'var(--accent-light)';
      ctx.fillText(`h=${t.h.toFixed(1)} мм`, t.x + t.w / 2, tubeTopY - 5);

      ctx.restore();
    });

    // 5. Draw Horizontal Level Equilibrium Line
    if (state.showLevelLine) {
      let avgH = 0;
      tubes.forEach(t => { avgH += t.h; });
      avgH /= tubes.length;
      const lineY = bottomY - avgH;

      ctx.save();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX - 40, lineY);
      ctx.lineTo(startX + totalSpan + 40, lineY);
      ctx.stroke();

      // Tag on right
      ctx.fillStyle = '#f59e0b';
      ctx.font = '700 10px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText(`h_рівноваги = ${avgH.toFixed(1)} мм`, startX + totalSpan + 45, lineY + 3);
      ctx.restore();
    }

    // 6. Draw Ruler overlay
    if (state.showRuler) {
      drawVerticalRuler(startX - 60, bottomY, maxTubeH);
    }
  }

  // Draw tube contours based on shape (straight, cone, zigzag, stepped)
  function buildTubePath(c, t, bottomY, maxTubeH) {
    const topY = bottomY - maxTubeH;
    c.beginPath();

    if (t.shape === 'straight') {
      c.moveTo(t.x, topY);
      c.lineTo(t.x, bottomY);
      c.lineTo(t.x + t.w, bottomY);
      c.lineTo(t.x + t.w, topY);
    } else if (t.shape === 'cone') {
      const topExtra = 18;
      c.moveTo(t.x - topExtra, topY);
      c.lineTo(t.x, bottomY);
      c.lineTo(t.x + t.w, bottomY);
      c.lineTo(t.x + t.w + topExtra, topY);
    } else if (t.shape === 'zigzag') {
      const segs = 6;
      const segH = maxTubeH / segs;
      c.moveTo(t.x, topY);
      for (let i = 1; i <= segs; i++) {
        const zigX = (i % 2 === 1) ? t.x + 10 : t.x - 10;
        c.lineTo(zigX, topY + i * segH);
      }
      c.lineTo(t.x + t.w, bottomY);
      for (let i = segs - 1; i >= 0; i--) {
        const zigX = (i % 2 === 1) ? t.x + t.w + 10 : t.x + t.w - 10;
        c.lineTo(zigX, topY + i * segH);
      }
    } else if (t.shape === 'stepped') {
      const midY = bottomY - maxTubeH * 0.5;
      c.moveTo(t.x - 12, topY);
      c.lineTo(t.x - 12, midY);
      c.lineTo(t.x, midY);
      c.lineTo(t.x, bottomY);
      c.lineTo(t.x + t.w, bottomY);
      c.lineTo(t.x + t.w, midY);
      c.lineTo(t.x + t.w + 12, midY);
      c.lineTo(t.x + t.w + 12, topY);
    }
  }

  // Fluid bubble particle aesthetics
  function drawFluidBubbles(x, y, w, h) {
    if (h < 15) return;
    const time = performance.now() / 1000;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 3; i++) {
      const bx = x + ((Math.sin(time + i * 2) * 0.5 + 0.5) * (w - 8)) + 4;
      const by = y + h - (((time * 30 + i * 40) % h));
      ctx.beginPath();
      ctx.arc(bx, by, 1.5 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Vertical Ruler
  function drawVerticalRuler(x, bottomY, maxH) {
    ctx.save();
    ctx.strokeStyle = 'var(--text-muted)';
    ctx.fillStyle = 'var(--text-muted)';
    ctx.font = '600 8px JetBrains Mono';
    ctx.textAlign = 'right';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(x, bottomY);
    ctx.lineTo(x, bottomY - maxH);
    ctx.stroke();

    for (let mm = 0; mm <= maxH; mm += 20) {
      const ry = bottomY - mm;
      const tickW = mm % 50 === 0 ? 8 : 4;
      ctx.beginPath();
      ctx.moveTo(x, ry);
      ctx.lineTo(x - tickW, ry);
      ctx.stroke();

      if (mm % 50 === 0) {
        ctx.fillText(`${mm}`, x - 10, ry + 3);
      }
    }
    ctx.restore();
  }

  // --- Render Hydraulic Press & Jack Main View Router ---
  function renderHydraulicPress() {
    const geom = getPressGeometry();
    if (!geom) return;

    if (state.pressSubmode === 'standard') {
      renderStandardIndustrialPress(geom);
    } else {
      renderAutomotiveJackWithReservoir(geom);
    }
  }

  // --- 1. RENDER STANDARD INDUSTRIAL HYDRAULIC PRESS ---
  function renderStandardIndustrialPress(geom) {
    const { bottomY, tableTopY, piston1Left, piston1Center, w1, piston2Left, piston2Center, w2 } = geom;
    const cylinderH = 190;

    // 1. Heavy Metal Bed Supports on Wooden Table
    ctx.save();
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(piston1Left - 18, tableTopY - 14, (piston2Left + w2) - piston1Left + 36, 14, 4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 2. Hydraulic Oil Gradient Fill
    const fluidGrad = ctx.createLinearGradient(0, bottomY - cylinderH, 0, bottomY + 26);
    fluidGrad.addColorStop(0, '#fbbf24');
    fluidGrad.addColorStop(1, '#b45309');

    // 3. Bottom Connecting Hydraulic Manifold Pipe
    ctx.save();
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(piston1Left - 8, bottomY - 4, (piston2Left + w2) - piston1Left + 16, 32, 6);
    ctx.fill();
    ctx.stroke();

    // Oil inside connecting pipe
    ctx.fillStyle = fluidGrad;
    ctx.fillRect(piston1Left, bottomY, (piston2Left + w2) - piston1Left, 24);

    // Dynamic flowing oil streamline particles inside manifold pipe
    const pipeStartX = piston1Left + 4;
    const pipeLength = (piston2Left + w2) - piston1Left - 8;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    state.pressManifoldParticles.forEach(p => {
      const px = pipeStartX + p.progress * pipeLength;
      const py = bottomY + 12 + p.offsetY;
      ctx.beginPath();
      ctx.arc(px, py, p.size * 0.75, 0, Math.PI * 2);
      ctx.fill();
    });

    // Live Pressure Gauge (Manometer) connected to the pipe
    const gaugeX = (piston1Left + w1 + piston2Left) / 2;
    drawManometer(gaugeX, bottomY - 12);
    ctx.restore();

    // 4. Small Cylinder (Piston 1 - Input)
    const p1H = state.piston1Height;
    const p1Top = bottomY - p1H;

    // Small Chamber
    ctx.fillStyle = state.theme === 'dark' ? 'rgba(30, 41, 59, 0.75)' : 'rgba(241, 245, 249, 0.85)';
    ctx.fillRect(piston1Left, bottomY - cylinderH, w1, cylinderH);

    // Oil inside Cylinder 1
    ctx.fillStyle = fluidGrad;
    ctx.fillRect(piston1Left + 2, p1Top, w1 - 4, p1H);

    // Steel Wall
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.strokeRect(piston1Left, bottomY - cylinderH, w1, cylinderH);

    // Small Piston Head
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.fillRect(piston1Left + 2, p1Top - 12, w1 - 4, 12);
    ctx.strokeRect(piston1Left + 2, p1Top - 12, w1 - 4, 12);

    // Small Piston Rod
    const rodH = 95;
    const rodTopY = p1Top - rodH;
    ctx.fillStyle = '#475569';
    ctx.fillRect(piston1Center - 5, rodTopY, 10, rodH - 12);

    // Small Piston Top Press Knob Handle (Interactive)
    ctx.fillStyle = state.isDraggingPiston1 ? '#10b981' : '#ef4444';
    ctx.beginPath();
    ctx.roundRect(piston1Center - 18, rodTopY - 10, 36, 12, 4);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 8px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText('PRESS', piston1Center, rodTopY - 1);

    // Force arrow on small piston
    if (state.showForces && state.force1 > 0) {
      drawForceArrow(piston1Center, rodTopY - 14, 45, '#ef4444', `F₁ = ${state.force1} Н`);
    }

    // 5. Heavy Press Portal Frame & Rigid Upper Crossbeam (Reaction Anvil)
    const upperBeamY = bottomY - cylinderH - 65; // Fixed upper reaction platform
    const colW = 16;
    const colLeftX = piston2Left - 22;
    const colRightX = piston2Left + w2 + 6;

    // Vertical Frame Steel Columns
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;

    // Left Column
    ctx.fillRect(colLeftX, upperBeamY, colW, (bottomY + 24) - upperBeamY);
    ctx.strokeRect(colLeftX, upperBeamY, colW, (bottomY + 24) - upperBeamY);

    // Right Column
    ctx.fillRect(colRightX, upperBeamY, colW, (bottomY + 24) - upperBeamY);
    ctx.strokeRect(colRightX, upperBeamY, colW, (bottomY + 24) - upperBeamY);

    // Solid Heavy Steel Upper Crossbeam / Reaction Anvil
    const upperBeamW = (colRightX + colW) - colLeftX + 16;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(colLeftX - 8, upperBeamY - 18, upperBeamW, 26, 4);
    ctx.fill();
    ctx.stroke();

    // Top beam mounting bolts
    ctx.fillStyle = '#cbd5e1';
    for (let bx = colLeftX - 2; bx <= colRightX + colW + 2; bx += 24) {
      ctx.beginPath();
      ctx.arc(bx, upperBeamY - 5, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Rigid reaction upper anvil block
    const anvilW = w2 + 8;
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.fillRect(piston2Center - anvilW / 2, upperBeamY + 8, anvilW, 14);
    ctx.strokeRect(piston2Center - anvilW / 2, upperBeamY + 8, anvilW, 14);

    // Anvil label
    ctx.font = '700 8px JetBrains Mono';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText(state.lang === 'uk' ? 'ВЕРХНІЙ НЕРУХОМИЙ УПОР' : 'UPPER RIGID ANVIL', piston2Center, upperBeamY - 22);

    // 6. Large Ram Cylinder (Piston 2)
    const p2H = state.piston2Height;
    const p2Top = bottomY - p2H;

    // Chamber 2
    ctx.fillStyle = state.theme === 'dark' ? 'rgba(30, 41, 59, 0.75)' : 'rgba(241, 245, 249, 0.85)';
    ctx.fillRect(piston2Left, bottomY - cylinderH, w2, cylinderH);

    // Oil in Cylinder 2
    ctx.fillStyle = fluidGrad;
    ctx.fillRect(piston2Left + 2, p2Top, w2 - 4, p2H);

    // Cylinder 2 Wall
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(piston2Left, bottomY - cylinderH, w2, cylinderH);

    // Large Piston Head
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.fillRect(piston2Left + 2, p2Top - 16, w2 - 4, 16);
    ctx.strokeRect(piston2Left + 2, p2Top - 16, w2 - 4, 16);

    // 7. Lower Moving Press Platen with YELLOW-AND-BLACK HAZARD STRIPES
    const platenW = w2 + 24;
    const platenH = 16;
    const platenX = piston2Center - platenW / 2;
    const platenY = p2Top - 24;

    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(platenX, platenY, platenW, platenH);

    // Yellow and black warning stripes pattern
    ctx.save();
    ctx.beginPath();
    ctx.rect(platenX, platenY, platenW, platenH);
    ctx.clip();

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(platenX, platenY, platenW, platenH);

    ctx.fillStyle = '#000000';
    for (let sx = platenX - 20; sx < platenX + platenW + 20; sx += 18) {
      ctx.beginPath();
      ctx.moveTo(sx, platenY + platenH);
      ctx.lineTo(sx + 10, platenY + platenH);
      ctx.lineTo(sx + 20, platenY);
      ctx.lineTo(sx + 10, platenY);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(platenX, platenY, platenW, platenH);
    ctx.restore();

    // 8. Draw Compressible Load / Workpiece between lower platen and upper beam
    drawCompressiblePressObject(piston2Center, platenY, upperBeamY + 22, w2);

    // 9. Force Arrow on Large Piston
    if (state.showForces) {
      const S1 = Math.PI * Math.pow(state.piston1Dia / 2, 2);
      const S2 = Math.PI * Math.pow(state.piston2Dia / 2, 2);
      const k = S2 / S1;
      const F2 = state.force1 * k;
      drawUpwardForceArrow(piston2Center, platenY - 6, 45, '#10b981', `F₂ = ${F2.toFixed(0)} Н`);
    }

    // Incompressible Clamping Notification Banner over press
    if (state.isPressClamped) {
      ctx.save();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      const bannerW = 260;
      ctx.beginPath();
      ctx.roundRect(piston2Center - bannerW / 2, upperBeamY - 48, bannerW, 20, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 9px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(state.lang === 'uk' ? '🔒 ЗАТИСНЕНО • РІДИНА НЕСТИСЛИВА' : '🔒 CLAMPED • FLUID INCOMPRESSIBLE', piston2Center, upperBeamY - 35);
      ctx.restore();
    }

    // Labels
    ctx.font = '700 11px JetBrains Mono';
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.textAlign = 'center';
    ctx.fillText(`d₁ = ${state.piston1Dia} мм (S₁)`, piston1Center, bottomY - cylinderH - 12);
    ctx.fillText(`d₂ = ${state.piston2Dia} мм (S₂)`, piston2Center, bottomY - cylinderH - 12);
  }

  // Draw Compressible Load between Platens
  function drawCompressiblePressObject(centerX, lowerPlatenY, upperAnvilBottomY, w2) {
    const load = state.selectedLoad;
    if (!load || load.id === 'none') return;

    const availableHeight = Math.max(8, lowerPlatenY - upperAnvilBottomY);
    const nominalHeight = 75; // Nominal uncompressed height in pixels
    const isTouching = availableHeight <= nominalHeight + 1;
    const currentH = Math.min(nominalHeight, availableHeight);
    const topY = lowerPlatenY - currentH;
    const compressionRatio = Math.max(0, (nominalHeight - currentH) / (nominalHeight - 50));

    ctx.save();

    if (load.id === 'spring') {
      // 1. High-Strength Industrial Spring (Compressible)
      const coils = 6;
      const springW = Math.min(65, w2 * 0.55);
      ctx.strokeStyle = state.isPressClamped ? '#ef4444' : isTouching ? '#f59e0b' : '#38bdf8';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(centerX - springW / 2, lowerPlatenY - 4);
      const dy = (currentH - 8) / coils;
      for (let i = 0; i <= coils; i++) {
        const y = lowerPlatenY - 4 - i * dy;
        const x = (i % 2 === 0) ? centerX - springW / 2 : centerX + springW / 2;
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Top & bottom steel spring seats (ensures crisp contact with platen and upper anvil)
      ctx.fillStyle = isTouching ? '#f59e0b' : '#64748b';
      ctx.fillRect(centerX - springW / 2 - 8, lowerPlatenY - 4, springW + 16, 4);
      ctx.fillRect(centerX - springW / 2 - 8, topY, springW + 16, 4);

    } else if (load.id === 'barrel') {
      // 2. Steel Drum / Oil Barrel (Squashes laterally when pressed)
      const bulge = isTouching ? compressionRatio * 18 : 0;
      const barrelW = Math.min(65, w2 * 0.52) + bulge;
      const barrelH = currentH;

      ctx.fillStyle = state.isPressClamped ? '#f87171' : isTouching ? '#fbbf24' : '#f59e0b';
      ctx.strokeStyle = state.isPressClamped ? '#ef4444' : '#b45309';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(centerX - barrelW / 2, topY, barrelW, barrelH, 4);
      ctx.fill();
      ctx.stroke();

      // Barrel reinforcing ribs & hoops
      ctx.strokeStyle = state.isPressClamped ? '#ef4444' : '#b45309';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - barrelW / 2, topY + barrelH * 0.33);
      ctx.lineTo(centerX + barrelW / 2, topY + barrelH * 0.33);
      ctx.moveTo(centerX - barrelW / 2, topY + barrelH * 0.66);
      ctx.lineTo(centerX + barrelW / 2, topY + barrelH * 0.66);
      ctx.stroke();

      // Top and bottom chime flanges
      ctx.fillStyle = '#92400e';
      ctx.fillRect(centerX - barrelW / 2 - 2, topY, barrelW + 4, 3);
      ctx.fillRect(centerX - barrelW / 2 - 2, lowerPlatenY - 3, barrelW + 4, 3);

      // Warning hazard symbol
      ctx.fillStyle = '#000000';
      ctx.font = `${Math.max(10, Math.min(16, barrelH * 0.28))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('☣️', centerX, topY + barrelH / 2 + 5);

    } else if (load.id === 'block') {
      // 3. Heavy Concrete / Steel Billet (Spans full height from platen to anvil)
      const blockW = Math.min(75, w2 * 0.65) + (isTouching ? compressionRatio * 10 : 0);
      const blockH = currentH;

      // Solid billet body
      const grad = ctx.createLinearGradient(centerX - blockW / 2, topY, centerX + blockW / 2, lowerPlatenY);
      grad.addColorStop(0, state.isPressClamped ? '#fca5a5' : '#e2e8f0');
      grad.addColorStop(0.5, state.isPressClamped ? '#f87171' : '#94a3b8');
      grad.addColorStop(1, state.isPressClamped ? '#ef4444' : '#475569');

      ctx.fillStyle = grad;
      ctx.strokeStyle = state.isPressClamped ? '#b91c1c' : '#334155';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(centerX - blockW / 2, topY, blockW, blockH, 3);
      ctx.fill();
      ctx.stroke();

      // Hardened Top & Bottom Pressure Bearing Plates (precise anvil contact)
      ctx.fillStyle = isTouching ? '#f59e0b' : '#1e293b';
      ctx.fillRect(centerX - blockW / 2, topY, blockW, 4);
      ctx.fillRect(centerX - blockW / 2, lowerPlatenY - 4, blockW, 4);

      // Industrial Chamfer Lines & Brick/Billet texture
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX - blockW / 2, topY + blockH * 0.5);
      ctx.lineTo(centerX + blockW / 2, topY + blockH * 0.5);
      ctx.moveTo(centerX, topY + 4);
      ctx.lineTo(centerX, topY + blockH * 0.5);
      ctx.stroke();

      // Compression Stress Cracks when strongly clamped
      if (compressionRatio > 0.3) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - blockW * 0.2, topY + 4);
        ctx.lineTo(centerX - blockW * 0.05, topY + blockH * 0.45);
        ctx.lineTo(centerX + blockW * 0.15, topY + blockH * 0.85);
        ctx.stroke();
      }

      ctx.font = '800 10px JetBrains Mono';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText(`${load.mass} kg`, centerX, topY + blockH / 2 + 3);

    } else if (load.id === 'anvil') {
      // 4. Heavy Forged Steel Tooling Anvil (Spans from platen to upper anvil)
      const anvilW = Math.min(80, w2 * 0.7);
      const anvilH = currentH;

      // Anvil Face (Top flat contact horn)
      ctx.fillStyle = isTouching ? '#f59e0b' : '#cbd5e1';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(centerX - anvilW / 2, topY, anvilW, 6, 2);
      ctx.fill();
      ctx.stroke();

      // Anvil Central Waist & Body
      ctx.fillStyle = state.isPressClamped ? '#ef4444' : '#475569';
      ctx.beginPath();
      ctx.moveTo(centerX - anvilW * 0.38, topY + 6);
      ctx.lineTo(centerX - anvilW * 0.22, topY + anvilH * 0.5);
      ctx.lineTo(centerX - anvilW * 0.45, lowerPlatenY - 6);
      ctx.lineTo(centerX + anvilW * 0.45, lowerPlatenY - 6);
      ctx.lineTo(centerX + anvilW * 0.22, topY + anvilH * 0.5);
      ctx.lineTo(centerX + anvilW * 0.38, topY + 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Anvil Heavy Base Footing on Platen
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(centerX - anvilW / 2 - 4, lowerPlatenY - 6, anvilW + 8, 6);
      ctx.strokeRect(centerX - anvilW / 2 - 4, lowerPlatenY - 6, anvilW + 8, 6);

      ctx.font = '800 9px JetBrains Mono';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('🔨 250 kg', centerX, lowerPlatenY - anvilH * 0.35);

    } else if (load.id === 'car') {
      // 5. Automobile / Vehicle (Chassis on lower platen, Roof pad touching upper anvil)
      const carW = Math.min(88, w2 * 0.78);
      const carH = currentH;
      const wheelR = Math.min(9, carH * 0.16);

      // Top Roof / Roof-rack Press Contact Pad (ensures solid contact with upper anvil)
      ctx.fillStyle = isTouching ? '#f59e0b' : '#334155';
      ctx.fillRect(centerX - carW * 0.25, topY, carW * 0.5, 4);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(centerX - carW * 0.25, topY, carW * 0.5, 4);

      // Car Cabin / Roof
      ctx.fillStyle = state.isPressClamped ? '#f87171' : '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(centerX - carW * 0.25, topY + 4);
      ctx.lineTo(centerX - carW * 0.42, topY + carH * 0.48);
      ctx.lineTo(centerX + carW * 0.42, topY + carH * 0.48);
      ctx.lineTo(centerX + carW * 0.25, topY + 4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.stroke();

      // Windshield & Windows
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(centerX - carW * 0.2, topY + 7);
      ctx.lineTo(centerX - carW * 0.35, topY + carH * 0.44);
      ctx.lineTo(centerX + carW * 0.35, topY + carH * 0.44);
      ctx.lineTo(centerX + carW * 0.2, topY + 7);
      ctx.closePath();
      ctx.fill();

      // Lower Car Body
      ctx.fillStyle = state.isPressClamped ? '#ef4444' : '#0284c7';
      ctx.beginPath();
      ctx.roundRect(centerX - carW / 2, topY + carH * 0.46, carW, carH * 0.36, 4);
      ctx.fill();
      ctx.stroke();

      // Headlights & Tail Lights
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(centerX - carW / 2 + 1, topY + carH * 0.52, 3, 5);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(centerX + carW / 2 - 4, topY + carH * 0.52, 3, 5);

      // Wheels on Lower Platen
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;

      // Left wheel
      ctx.beginPath();
      ctx.arc(centerX - carW * 0.28, lowerPlatenY - wheelR, wheelR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Right wheel
      ctx.beginPath();
      ctx.arc(centerX + carW * 0.28, lowerPlatenY - wheelR, wheelR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = '800 9px JetBrains Mono';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(`${load.mass} ${state.lang === 'uk' ? 'кг' : 'kg'}`, centerX, topY + carH * 0.72);

    } else if (load.id === 'elephant') {
      // 6. Heavy Calibrated Test Container / Massive Load (Spans full height)
      const boxW = Math.min(84, w2 * 0.74);
      const boxH = currentH;

      // Heavy Container Steel Casing
      const grad = ctx.createLinearGradient(0, topY, 0, lowerPlatenY);
      grad.addColorStop(0, state.isPressClamped ? '#fca5a5' : '#c084fc');
      grad.addColorStop(1, state.isPressClamped ? '#ef4444' : '#6b21a8');

      ctx.fillStyle = grad;
      ctx.strokeStyle = '#4c1d95';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(centerX - boxW / 2, topY, boxW, boxH, 4);
      ctx.fill();
      ctx.stroke();

      // Top Anvil Contact Beam & Heavy Shackle
      ctx.fillStyle = isTouching ? '#f59e0b' : '#334155';
      ctx.fillRect(centerX - boxW / 2, topY, boxW, 5);

      // Cross Steel Bracing
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - boxW / 2 + 4, topY + 7);
      ctx.lineTo(centerX + boxW / 2 - 4, lowerPlatenY - 7);
      ctx.moveTo(centerX + boxW / 2 - 4, topY + 7);
      ctx.lineTo(centerX - boxW / 2 + 4, lowerPlatenY - 7);
      ctx.stroke();

      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🐘', centerX, topY + boxH * 0.48);

      ctx.font = '800 10px JetBrains Mono';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${load.mass} ${state.lang === 'uk' ? 'кг' : 'kg'}`, centerX, lowerPlatenY - 8);

    } else {
      // 7. Generic Standard Workpiece Billet (Spans full height from platen to anvil)
      const itemW = Math.min(70, w2 * 0.6);
      const itemH = currentH;

      ctx.fillStyle = isTouching ? '#fbbf24' : '#64748b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(centerX - itemW / 2, topY, itemW, itemH, 4);
      ctx.fill();
      ctx.stroke();

      // Top Anvil Contact Plate
      ctx.fillStyle = isTouching ? '#f59e0b' : '#1e293b';
      ctx.fillRect(centerX - itemW / 2, topY, itemW, 4);

      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(load.icon, centerX, topY + itemH * 0.55);

      ctx.font = '700 9px JetBrains Mono';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${load.mass} ${state.lang === 'uk' ? 'кг' : 'kg'}`, centerX, lowerPlatenY - 6);
    }

    // Reaction Contact Glow / Spark Indicator at the top anvil interface
    if (isTouching) {
      ctx.fillStyle = state.isPressClamped ? '#ef4444' : '#f59e0b';
      ctx.shadowColor = state.isPressClamped ? '#ef4444' : '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(centerX - 18, topY, 2.5, 0, Math.PI * 2);
      ctx.arc(centerX, topY, 3, 0, Math.PI * 2);
      ctx.arc(centerX + 18, topY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // --- 2. RENDER AUTOMOTIVE JACK WITH STORAGE RESERVOIR ---
  function renderAutomotiveJackWithReservoir(geom) {
    const { bottomY, tableTopY, piston1Left, piston1Center, w1, piston2Left, piston2Center, w2 } = geom;
    const cylinderH = 190;

    // Bed Support
    ctx.save();
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(piston1Left - 100, tableTopY - 14, (piston2Left + w2) - (piston1Left - 100) + 20, 14, 4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Fluid Gradient
    const fluidGrad = ctx.createLinearGradient(0, bottomY - cylinderH, 0, bottomY + 26);
    fluidGrad.addColorStop(0, '#fbbf24');
    fluidGrad.addColorStop(1, '#b45309');

    // 1. Storage Reservoir (Ємність для оливи на лівому боці)
    const resW = 65;
    const resH = 160;
    const resLeft = piston1Left - 85;
    const resBottom = bottomY;
    const resTop = bottomY - resH;

    // Reservoir Chamber Wall
    ctx.fillStyle = state.theme === 'dark' ? 'rgba(30, 41, 59, 0.85)' : 'rgba(241, 245, 249, 0.9)';
    ctx.fillRect(resLeft, resTop, resW, resH);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.strokeRect(resLeft, resTop, resW, resH);

    // Live Oil Level in Reservoir
    const resOilFraction = Math.max(0.02, Math.min(1.0, state.jackReservoirVolume / state.jackReservoirMaxVolume));
    const resOilH = resH * resOilFraction;
    const resOilTop = resBottom - resOilH;

    ctx.fillStyle = fluidGrad;
    ctx.fillRect(resLeft + 2, resOilTop, resW - 4, resOilH);

    // Reservoir Sight Glass / Level Markings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '600 7px JetBrains Mono';
    ctx.textAlign = 'right';

    for (let v = 100; v <= 500; v += 100) {
      const y = resBottom - (resH * (v / state.jackReservoirMaxVolume));
      ctx.beginPath();
      ctx.moveTo(resLeft + 4, y);
      ctx.lineTo(resLeft + 12, y);
      ctx.stroke();
      ctx.fillText(`${v}`, resLeft + 26, y + 2.5);
    }

    // Reservoir Cap & Label
    ctx.fillStyle = '#475569';
    ctx.fillRect(resLeft + resW / 2 - 12, resTop - 8, 24, 8);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 8px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(state.lang === 'uk' ? 'РЕЗЕРВУАР' : 'RESERVOIR', resLeft + resW / 2, resTop - 12);
    ctx.fillText(`${state.jackReservoirVolume.toFixed(0)} мл`, resLeft + resW / 2, resTop + 14);

    // 2. Suction Pipe connecting Reservoir to Small Plunger Chamber (Bottom)
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.5;
    ctx.fillRect(resLeft + resW - 2, bottomY - 6, piston1Left - (resLeft + resW) + 4, 18);
    ctx.strokeRect(resLeft + resW - 2, bottomY - 6, piston1Left - (resLeft + resW) + 4, 18);

    // Oil inside suction pipe
    ctx.fillStyle = fluidGrad;
    ctx.fillRect(resLeft + resW, bottomY - 4, piston1Left - (resLeft + resW), 14);

    // Suction Check Valve ▷ (Green active glow when open)
    const suctionValveX = (resLeft + resW + piston1Left) / 2;
    ctx.save();
    if (state.suctionValveOpen) {
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#10b981';
    } else {
      ctx.fillStyle = '#475569';
    }
    ctx.beginPath();
    ctx.arc(suctionValveX, bottomY + 3, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('▶', suctionValveX, bottomY + 6.5);
    ctx.restore();

    // 3. Discharge Pipe connecting Plunger to Main Cylinder with Discharge Check Valve
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.fillRect(piston1Left + w1, bottomY - 6, piston2Left - (piston1Left + w1), 22);
    ctx.strokeRect(piston1Left + w1, bottomY - 6, piston2Left - (piston1Left + w1), 22);

    ctx.fillStyle = fluidGrad;
    ctx.fillRect(piston1Left + w1, bottomY - 4, piston2Left - (piston1Left + w1), 18);

    // Discharge Check Valve ▷ (Cyan active glow when open)
    const dischargeValveX = piston1Left + w1 + 35;
    ctx.save();
    if (state.dischargeValveOpen) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#38bdf8';
    } else {
      ctx.fillStyle = '#475569';
    }
    ctx.beginPath();
    ctx.arc(dischargeValveX, bottomY + 5, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('▶', dischargeValveX, bottomY + 8.5);
    ctx.restore();

    // 4. Return Bypass Pipe (from Main Ram back to Reservoir) with Red Release Valve
    const bypassY = bottomY - 35;
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(piston2Left, bypassY);
    ctx.lineTo(resLeft + resW / 2, bypassY);
    ctx.lineTo(resLeft + resW / 2, resTop + 25);
    ctx.stroke();

    // Interactive Manual Release Valve Knob on Return Pipe
    const releaseValveX = piston1Left + w1 + 75;
    ctx.save();
    if (state.isJackDraining) {
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#ef4444';
    } else {
      ctx.fillStyle = '#dc2626';
    }
    ctx.beginPath();
    ctx.arc(releaseValveX, bypassY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Valve cross handle
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const rot = state.isJackDraining ? (Date.now() / 150) % (Math.PI * 2) : 0;
    ctx.moveTo(releaseValveX + Math.cos(rot) * 5, bypassY + Math.sin(rot) * 5);
    ctx.lineTo(releaseValveX - Math.cos(rot) * 5, bypassY - Math.sin(rot) * 5);
    ctx.moveTo(releaseValveX + Math.cos(rot + Math.PI / 2) * 5, bypassY + Math.sin(rot + Math.PI / 2) * 5);
    ctx.lineTo(releaseValveX - Math.cos(rot + Math.PI / 2) * 5, bypassY - Math.sin(rot + Math.PI / 2) * 5);
    ctx.stroke();
    ctx.restore();

    ctx.font = '700 8px JetBrains Mono';
    ctx.fillStyle = state.isJackDraining ? '#ef4444' : '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText(state.isJackDraining ? (state.lang === 'uk' ? 'СПУСК [ВІДКРИТО]' : 'RELEASE [OPEN]') : (state.lang === 'uk' ? 'КЛАПАН СПУСКУ' : 'RELEASE VALVE'), releaseValveX, bypassY - 13);

    // Live Manometer Gauge
    drawManometer(piston2Left - 30, bottomY - 12);

    // 5. Small Plunger Pump Cylinder
    const p1H = state.piston1Height;
    const p1Top = bottomY - p1H;

    ctx.fillStyle = state.theme === 'dark' ? 'rgba(30, 41, 59, 0.75)' : 'rgba(241, 245, 249, 0.85)';
    ctx.fillRect(piston1Left, bottomY - cylinderH, w1, cylinderH);

    ctx.fillStyle = fluidGrad;
    ctx.fillRect(piston1Left + 2, p1Top, w1 - 4, p1H);

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.strokeRect(piston1Left, bottomY - cylinderH, w1, cylinderH);

    // Plunger head
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.fillRect(piston1Left + 2, p1Top - 12, w1 - 4, 12);
    ctx.strokeRect(piston1Left + 2, p1Top - 12, w1 - 4, 12);

    // Plunger rod
    const rodH = 90;
    const rodTopY = p1Top - rodH;
    ctx.fillStyle = '#475569';
    ctx.fillRect(piston1Center - 5, rodTopY, 10, rodH - 12);

    // 6. Draw Kinematically Correct Jack Lever with STATIONARY FULCRUM ON THE RIGHT
    drawCorrectJackLeverMechanism(piston1Center, rodTopY, bottomY, cylinderH);

    // 7. Large Main Lifting Ram Cylinder
    const p2H = state.piston2Height;
    const p2Top = bottomY - p2H;

    ctx.fillStyle = state.theme === 'dark' ? 'rgba(30, 41, 59, 0.75)' : 'rgba(241, 245, 249, 0.85)';
    ctx.fillRect(piston2Left, bottomY - cylinderH, w2, cylinderH);

    ctx.fillStyle = fluidGrad;
    ctx.fillRect(piston2Left + 2, p2Top, w2 - 4, p2H);

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(piston2Left, bottomY - cylinderH, w2, cylinderH);

    // Ram Piston Head
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.fillRect(piston2Left + 2, p2Top - 16, w2 - 4, 16);
    ctx.strokeRect(piston2Left + 2, p2Top - 16, w2 - 4, 16);

    // Lifting Ram Pad / Platform under Vehicle
    const ramPadW = w2 + 20;
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(piston2Center - ramPadW / 2, p2Top - 24, ramPadW, 10, 3);
    ctx.fill();
    ctx.stroke();

    // Rubber Grip Pad
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(piston2Center - ramPadW / 2 + 6, p2Top - 28, ramPadW - 12, 4);

    // Draw Vehicle / Load on Top
    drawPressLoad(piston2Center, p2Top - 28, w2);

    // 8. Draw Jack Return/Forward Flow Animated Particles
    state.jackReturnParticles.forEach(p => {
      ctx.fillStyle = p.type === 'return' ? '#ef4444' : p.type === 'suction' ? '#10b981' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // 9. Dimension Labels
    ctx.font = '700 11px JetBrains Mono';
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.textAlign = 'center';
    ctx.fillText(`d₁ = ${state.piston1Dia} мм (S₁)`, piston1Center, bottomY - cylinderH - 12);
    ctx.fillText(`d₂ = ${state.piston2Dia} мм (S₂)`, piston2Center, bottomY - cylinderH - 12);
  }

  // --- Kinematically Correct Jack Lever Mechanism with STATIONARY FULCRUM PILLAR ON THE RIGHT ---
  function drawCorrectJackLeverMechanism(pistonCenter, rodTopY, bottomY, cylinderH) {
    ctx.save();

    // 1. Static Frame Fulcrum Pillar positioned on the RIGHT of the small cylinder
    const fulcrumX = pistonCenter + 55;
    const fulcrumY = bottomY - 195; // STATIONARY fixed pivot point!

    // Draw Static Vertical Steel Pillar Support from base up to fulcrum
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.fillRect(fulcrumX - 5, fulcrumY, 10, bottomY - fulcrumY);
    ctx.strokeRect(fulcrumX - 5, fulcrumY, 10, bottomY - fulcrumY);

    // Pillar mounting base brackets & bolts
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(fulcrumX - 8, bottomY - 6, 16, 8);
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(fulcrumX, bottomY - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 2. Fixed Fulcrum Pivot Joint Pin (Stationary, on the RIGHT)
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(fulcrumX, fulcrumY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Fulcrum label
    ctx.font = '700 9px JetBrains Mono';
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'left';
    ctx.fillText(state.lang === 'uk' ? 'ТОЧКА ОПОРИ (ПРАВОРУЧ)' : 'FIXED PIVOT (RIGHT)', fulcrumX + 12, fulcrumY + 3);

    // 3. Calculate Lever Angle to match current plunger rod height
    // Plunger is at (pistonCenter, rodTopY), which is to the LEFT of fulcrumX (pistonCenter < fulcrumX).
    const dx = pistonCenter - fulcrumX; // e.g. -55
    const dy = rodTopY - fulcrumY;
    const leverAngle = Math.atan2(dy, dx); // Angle of lever extending to the left

    // 4. Draw Rotating Lever Bar
    const totalLeverLength = 190; // Long handle extending to the left
    const handleX = fulcrumX + totalLeverLength * Math.cos(leverAngle);
    const handleY = fulcrumY + totalLeverLength * Math.sin(leverAngle);

    ctx.save();
    ctx.translate(fulcrumX, fulcrumY);
    ctx.rotate(leverAngle);

    // Main steel lever bar extending from fulcrum (0,0) leftwards to handle (totalLeverLength, 0)
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-8, -5, totalLeverLength + 8, 10, 3);
    ctx.fill();
    ctx.stroke();

    // Operator Rubber Handle Grip on left end
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(totalLeverLength - 28, -7, 30, 14);
    ctx.strokeStyle = '#64748b';
    ctx.strokeRect(totalLeverLength - 28, -7, 30, 14);

    // Grip texture rings
    ctx.fillStyle = '#475569';
    for (let gx = totalLeverLength - 22; gx < totalLeverLength; gx += 5) {
      ctx.fillRect(gx, -6, 2, 12);
    }

    ctx.restore();

    // 5. Connecting Link Pin between Rotating Lever and Plunger Rod Top
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pistonCenter, rodTopY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Link pin label
    ctx.font = '600 8px JetBrains Mono';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText(state.lang === 'uk' ? 'Шарнір штока' : 'Plunger Pin', pistonCenter, rodTopY - 10);

    // 6. Draw Operator Push Arrow on Lever Handle
    if (state.showForces) {
      drawForceArrow(handleX, handleY - 6, 40, '#ef4444', `F_рук = ${state.force1} Н`);
    }

    ctx.restore();
  }

  // Draw Pressure Manometer Gauge
  function drawManometer(x, y) {
    ctx.save();
    // Stem
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x - 3, y - 10, 6, 10);

    // Dial face
    ctx.beginPath();
    ctx.arc(x, y - 28, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Scale ticks
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    for (let a = -135; a <= 135; a += 45) {
      const rad = (a * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(rad) * 12, (y - 28) + Math.sin(rad) * 12);
      ctx.lineTo(x + Math.cos(rad) * 16, (y - 28) + Math.sin(rad) * 16);
      ctx.stroke();
    }

    // Smoothly interpolated needle angle
    const needleAngle = state.manometerAngle;

    ctx.strokeStyle = state.isPressClamped ? '#ef4444' : '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - 28);
    ctx.lineTo(x + Math.cos(needleAngle) * 13, (y - 28) + Math.sin(needleAngle) * 13);
    ctx.stroke();

    // Center brass cap
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(x, y - 28, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Manometer text label
    ctx.font = '700 8px JetBrains Mono';
    ctx.fillStyle = state.isPressClamped ? '#ef4444' : 'var(--text-muted)';
    ctx.textAlign = 'center';
    ctx.fillText('MANOMETER', x, y - 48);
    ctx.restore();
  }

  // Draw Load icon & mass
  function drawPressLoad(centerX, topY, w) {
    const load = state.selectedLoad;
    if (!load || load.id === 'none') return;

    ctx.save();
    ctx.font = '38px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(load.icon, centerX, topY - 14);

    ctx.font = '700 11px JetBrains Mono';
    ctx.fillStyle = state.theme === 'dark' ? '#f8fafc' : '#0f172a';
    ctx.fillText(`${load.mass} ${state.lang === 'uk' ? 'кг' : 'kg'}`, centerX, topY - 4);
    ctx.restore();
  }

  // Vector Arrows helpers
  function drawForceArrow(x, y, len, color, text) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y - len);
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - 6, y - 10);
    ctx.lineTo(x + 6, y - 10);
    ctx.lineTo(x, y);
    ctx.fill();

    ctx.font = '700 11px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y - len - 6);
    ctx.restore();
  }

  function drawUpwardForceArrow(x, y, len, color, text) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - len);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - 6, y - len + 10);
    ctx.lineTo(x + 6, y - len + 10);
    ctx.lineTo(x, y - len);
    ctx.fill();

    ctx.font = '700 11px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y - len - 8);
    ctx.restore();
  }

  // Draw Pouring Stream particles when pouring
  function renderPouringStream() {
    if (!state.pouringStream.active || state.pouringStream.vesselIdx === null) return;
    const geom = getVesselsGeometry();
    if (!geom) return;

    const t = geom.tubes[state.pouringStream.vesselIdx];
    if (!t) return;

    const startX = t.x + t.w / 2;
    const topY = geom.bottomY - 260;
    const fluidY = geom.bottomY - t.h;

    ctx.save();
    ctx.strokeStyle = state.currentLiquid.color;
    ctx.fillStyle = state.currentLiquid.color;
    ctx.lineWidth = 4;

    // Funnel / Spout Icon at top
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🫗', startX + 15, topY - 10);

    // Falling water stream
    ctx.beginPath();
    ctx.moveTo(startX, topY);
    ctx.lineTo(startX, fluidY);
    ctx.stroke();

    // Splash drops
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      const splashX = startX + (Math.random() - 0.5) * 16;
      const splashY = fluidY - Math.random() * 8;
      ctx.arc(splashX, splashY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // --- Step Physics (One tick) ---
  function stepPhysics() {
    state.isPlaying = false;
    $('play-pause-icon').textContent = '▶️';
    $('play-pause-text').textContent = I18N[state.lang].play_btn;
    updatePhysics(0.05);
  }

  function togglePlayPause() {
    state.isPlaying = !state.isPlaying;
    $('play-pause-icon').textContent = state.isPlaying ? '⏸️' : '▶️';
    $('play-pause-text').textContent = state.isPlaying ? I18N[state.lang].pause_btn : I18N[state.lang].play_btn;
  }

  function resetAll() {
    state.vesselsCount = 3;
    state.valves = [true, true, true];
    state.vessels = [
      { width: 45, height: 140, targetHeight: 140, velocity: 0, shape: 'straight' },
      { width: 85, height: 140, targetHeight: 140, velocity: 0, shape: 'cone' },
      { width: 55, height: 140, targetHeight: 140, velocity: 0, shape: 'zigzag' },
      { width: 70, height: 140, targetHeight: 140, velocity: 0, shape: 'stepped' }
    ];
    state.currentLiquid = LIQUIDS_DB[0];
    state.piston1Dia = 15;
    state.piston2Dia = 120;
    state.force1 = 0;
    state.piston1Height = 90;
    state.piston2Height = 90;
    state.targetPiston1Height = 90;
    state.targetPiston2Height = 90;
    state.jackOilVolumeInRam = 0;
    state.jackReservoirVolume = 500;
    state.pressCompression = 0;
    state.isPressClamped = false;
    state.isJackDraining = false;
    state.jackHandleAngle = 0;
    state.jackIsPumping = false;
    setVesselsCount(3);
    populateUI();
    updatePressPhysics(true);
  }

  // --- Theory Modal Content in UA and EN ---
  function openTheoryModal() {
    const content = $('theory-modal-content');
    if (state.lang === 'uk') {
      content.innerHTML = `
        <article class="theory-article">
          <h3>1. Закон сполучених посудин</h3>
          <p>
            <strong>Сполученими посудинами</strong> називають дві або більше посудин, з'єднаних між собою в нижній частині так, що рідина може вільно перетікати з однієї в іншу.
          </p>
          <div class="formula-card">
            <code>h₁ = h₂ = h₃ = ... = hₙ &nbsp;&nbsp;(для однорідної рідини)</code>
          </div>
          <p>
            <strong>Фізичне обґрунтування:</strong> Рідина перебуває в спокої тоді, коли тиск на будь-якому горизонтальному рівні сполучення є однаковим (P₁ = P₂). Оскільки гідростатичний тиск стовпа рідини визначається формулою <code>P = ρ · g · h</code>, а густина <code>ρ</code> та прискорення <code>g</code> однакові в усіх колінах, то і висоти <code>h</code> вільних поверхонь над рівнем сполучення обов'язково однакові, <em>незалежно від форми та ширини посудин</em>.
          </p>
        </article>

        <article class="theory-article">
          <h3>2. Закон Паскаля та Гідравлічний прес</h3>
          <p>
            <strong>Закон Паскаля:</strong> Тиск, створюваний на нерухому рідину або газ, передається в кожну точку без змін в усіх напрямках.
          </p>
          <div class="formula-card">
            <code>P = F₁ / S₁ = F₂ / S₂ &nbsp;⟹&nbsp; F₂ / F₁ = S₂ / S₁ = (d₂ / d₁)² = k</code>
          </div>
          <p>
            <strong>Гідравлічний прес</strong> та <strong>домкрат</strong> є простими машинами, що дають виграш у силі в стільки разів, у скільки площа великого поршня <code>S₂</code> більша за площу малого <code>S₁</code>.
          </p>
          <ul class="theory-list">
            <li><strong>Золоте правило механіки:</strong> Виграючи в силі в <code>k</code> разів, ми в стільки ж разів програємо у відстані (переміщенні): <code>h₁ · S₁ = h₂ · S₂</code>.</li>
            <li><strong>Гідравлічний домкрат:</strong> Поєднує гідравлічний виграш <code>S₂/S₁</code> з важільним виграшем <code>L/l</code>, що дозволяє людині зусиллям у 100 Н легко підняти автомобіль масою 1.5–2 тонни.</li>
          </ul>
        </article>
      `;
    } else {
      content.innerHTML = `
        <article class="theory-article">
          <h3>1. Law of Communicating Vessels</h3>
          <p>
            <strong>Communicating vessels</strong> are a set of containers connected at their bottoms such that fluid can move freely between them.
          </p>
          <div class="formula-card">
            <code>h₁ = h₂ = h₃ = ... = hₙ &nbsp;&nbsp;(for homogeneous fluid)</code>
          </div>
          <p>
            <strong>Physical Mechanism:</strong> Fluid remains in static equilibrium when pressure at any horizontal baseline is equal (P₁ = P₂). Since hydrostatic pressure is <code>P = ρ · g · h</code>, and density <code>ρ</code> and gravity <code>g</code> are uniform, the vertical heights <code>h</code> must be equal, <em>regardless of tube shape, slant, or width</em>.
          </p>
        </article>

        <article class="theory-article">
          <h3>2. Pascal's Principle & Hydraulic Machines</h3>
          <p>
            <strong>Pascal's Principle:</strong> Pressure exerted anywhere in a confined incompressible fluid is transmitted equally in all directions throughout the fluid.
          </p>
          <div class="formula-card">
            <code>P = F₁ / S₁ = F₂ / S₂ &nbsp;⟹&nbsp; F₂ / F₁ = S₂ / S₁ = (d₂ / d₁)² = k</code>
          </div>
          <p>
            <strong>Hydraulic Press & Jack:</strong> Provide a mechanical force advantage directly equal to the area ratio <code>S₂ / S₁</code>.
          </p>
        </article>
      `;
    }
    $('theory-modal').classList.add('open');
  }

  function closeTheoryModal() {
    $('theory-modal').classList.remove('open');
  }

  // --- Dynamic Localization Update on all DOM nodes ---
  function updateLocalization() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (I18N[state.lang] && I18N[state.lang][key]) {
        el.textContent = I18N[state.lang][key];
      }
    });
  }

  // --- Run on DOM Ready ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

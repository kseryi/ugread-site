/* =============================================================================
   G-CODE 3D VISUALIZER — APP.JS
   CNC toolpath parser + Three.js renderer + playback engine
   + i18n (language files in /lang) + light/dark theme + machine presets.
   Pure vanilla JS. No build step. Three.js loaded globally via CDN in index.html.
   ============================================================================= */

(() => {
  'use strict';

  /* ---------------------------------------------------------------------
     0. CONSTANTS
     --------------------------------------------------------------------- */
  // Mutable machine/bed configuration — changed live by the Machine Setup panel.
  const CNC = {
    BED_X: 300,          // mm, current work-area travel in X
    BED_Y: 180,          // mm, current work-area travel in Y
    GRID_STEP: 10,       // mm between minor grid lines
    GRID_MAJOR_EVERY: 5, // every Nth line is a "major" brighter line (50mm)
  };

  // Preset CNC router bed sizes. 'custom' lets the user type any size.
  const MACHINE_PRESETS = [
    { id: '1610',  label: 'CNC 1610', x: 160, y: 100 },
    { id: '2418',  label: 'CNC 2418', x: 240, y: 180 },
    { id: '3018',  label: 'CNC 3018', x: 300, y: 180 },
    { id: '3040',  label: 'CNC 3040', x: 300, y: 400 },
    { id: '6040',  label: 'CNC 6040', x: 600, y: 400 },
    { id: 'custom', label: null, x: null, y: null },
  ];

  const RAPID_FEED_MM_MIN = 2500;      // assumed rapid traverse speed (G0)
  const DEFAULT_CUT_FEED_MM_MIN = 500; // fallback feed if a cut move has no F yet
  const PARSE_CHUNK_SIZE = 4000;       // lines parsed per tick, keeps UI responsive

  const SPEED_STEPS = [1, 2, 5, 10];

  // Toolpath colors stay constant across themes (always readable neon accents).
  const COLOR = {
    cut: 0x29e6ff,
    rapid: 0xffb833,
    bit: 0xe6f7ff,
    bitEmissive: 0x29e6ff,
  };

  // Scene colors that DO change with the light/dark theme.
  const THEMES = {
    dark: {
      fog: 0x05080c, fogDensity: 0.0016,
      grid: 0x18384a, gridMajor: 0x1f5570,
      frame: 0x2fa9c9,
      stock: 0x1c3a52, stockOpacity: 0.28,
    },
    light: {
      fog: 0xeef2f6, fogDensity: 0.0022,
      grid: 0xc7d6de, gridMajor: 0x8fb0c2,
      frame: 0x0f6f8c,
      stock: 0x9fb7c4, stockOpacity: 0.35,
    },
  };

  const STORAGE_KEYS = {
    lang: 'gcv_lang',
    theme: 'gcv_theme',
    themeExplicit: 'gcv_theme_explicit', // did the user ever pick a theme manually?
    machine: 'gcv_machine',
    customX: 'gcv_custom_x',
    customY: 'gcv_custom_y',
  };

  /* ---------------------------------------------------------------------
     1. DOM REFERENCES
     --------------------------------------------------------------------- */
  const dom = {
    langSelect: document.getElementById('langSelect'),
    themeToggle: document.getElementById('themeToggle'),

    machineSelect: document.getElementById('machineSelect'),
    customSizeRow: document.getElementById('customSizeRow'),
    customX: document.getElementById('customX'),
    customY: document.getElementById('customY'),
    btnApplyMachine: document.getElementById('btnApplyMachine'),

    dropzone: document.getElementById('dropzone'),
    fileInput: document.getElementById('fileInput'),
    fileMetaMsg: document.getElementById('fileMetaMsg'),
    fileMetaName: document.getElementById('fileMetaName'),
    fileMetaDetails: document.getElementById('fileMetaDetails'),
    fileMetaWarning: document.getElementById('fileMetaWarning'),

    btnPlay: document.getElementById('btnPlay'),
    btnPause: document.getElementById('btnPause'),
    btnReset: document.getElementById('btnReset'),
    speedSlider: document.getElementById('speedSlider'),
    speedValue: document.getElementById('speedValue'),
    toggleRapids: document.getElementById('toggleRapids'),
    toggleStock: document.getElementById('toggleStock'),

    progressTrack: document.getElementById('progressTrack'),
    progressFill: document.getElementById('progressFill'),
    progressHandle: document.getElementById('progressHandle'),
    progressLabel: document.getElementById('progressLabel'),
    teleLine: document.getElementById('teleLine'),
    teleCmd: document.getElementById('teleCmd'),
    teleX: document.getElementById('teleX'),
    teleY: document.getElementById('teleY'),
    teleZ: document.getElementById('teleZ'),
    teleFeed: document.getElementById('teleFeed'),
    teleElapsed: document.getElementById('teleElapsed'),
    teleTotal: document.getElementById('teleTotal'),
    teleCutLen: document.getElementById('teleCutLen'),
    teleRapidLen: document.getElementById('teleRapidLen'),
    teleBounds: document.getElementById('teleBounds'),

    statusPill: document.getElementById('statusPill'),
    statusDot: document.getElementById('statusDot'),
    statusText: document.getElementById('statusText'),

    canvasHost: document.getElementById('canvasHost'),
    emptyState: document.getElementById('emptyState'),
    wasteboardHudSpan: document.querySelector('#wasteboardHud span'),
  };

  /* ---------------------------------------------------------------------
     2. APP STATE
     --------------------------------------------------------------------- */
  const state = {
    moves: [],
    totalLines: 0,
    totalTimeSec: 0,
    cutLengthMm: 0,
    rapidLengthMm: 0,
    bounds: null,
    malformedLines: 0,

    playing: false,
    wasPlayingBeforeScrub: false,
    scrubbing: false,
    simTime: 0,
    speedMultiplier: 1,
    cursor: 0,
    lastFrameTs: null,
    loaded: false,

    theme: 'dark',
    statusCls: 'ready',
    statusKey: 'status.noFile',
  };

  let currentLang = (window.APP_DEFAULT_LANGUAGE || 'en');
  let selectedMachineId = '3018';

  /* ---------------------------------------------------------------------
     3. i18n HELPERS
     --------------------------------------------------------------------- */
  function t(key, params) {
    const dict = (window.APP_I18N && window.APP_I18N[currentLang]) || {};
    let str = dict[key];
    if (str === undefined) {
      const fallback = (window.APP_I18N && window.APP_I18N.en) || {};
      str = fallback[key] !== undefined ? fallback[key] : key;
    }
    if (params) {
      Object.keys(params).forEach((k) => { str = str.split('{' + k + '}').join(params[k]); });
    }
    return str;
  }

  function applyLanguage(code) {
    if (!window.APP_I18N || !window.APP_I18N[code]) code = 'en';
    currentLang = code;
    document.documentElement.lang = code;
    saveSetting(STORAGE_KEYS.lang, code);

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      el.title = t(el.getAttribute('data-i18n-title'));
    });

    // Dynamic strings not covered by the simple textContent swap above:
    refreshStatusText();
    updateWasteboardHud();
    refreshMachineCustomLabel();
    if (dom.langSelect) dom.langSelect.value = currentLang;
  }

  function populateLangSelect() {
    dom.langSelect.innerHTML = '';
    (window.APP_LANGUAGES || []).forEach((l) => {
      const opt = document.createElement('option');
      opt.value = l.code;
      opt.textContent = `${l.short} — ${l.label}`;
      dom.langSelect.appendChild(opt);
    });
    dom.langSelect.value = currentLang;
  }

  /* ---------------------------------------------------------------------
     4. PERSISTED SETTINGS (localStorage — this is a real hosted page,
        not a sandboxed preview, so persisting user prefs is safe here)
     --------------------------------------------------------------------- */
  function loadSetting(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v !== null ? v : fallback;
    } catch (e) { return fallback; }
  }
  function saveSetting(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* storage unavailable — ignore */ }
  }

  function restoreSettings() {
    const themeExplicit = loadSetting(STORAGE_KEYS.themeExplicit, null);
    let initialTheme;
    if (themeExplicit === '1') {
      initialTheme = loadSetting(STORAGE_KEYS.theme, 'dark');
    } else {
      // No manual choice yet — honor the OS/browser color-scheme preference.
      const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
      initialTheme = prefersLight ? 'light' : 'dark';
    }
    state.theme = initialTheme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);

    const browserLang = (navigator.language || '').slice(0, 2);
    const savedLang = loadSetting(STORAGE_KEYS.lang, (window.APP_I18N && window.APP_I18N[browserLang]) ? browserLang : (window.APP_DEFAULT_LANGUAGE || 'en'));
    currentLang = (window.APP_I18N && window.APP_I18N[savedLang]) ? savedLang : (window.APP_DEFAULT_LANGUAGE || 'en');

    const savedMachine = loadSetting(STORAGE_KEYS.machine, '3018');
    const savedCustomX = parseFloat(loadSetting(STORAGE_KEYS.customX, '300')) || 300;
    const savedCustomY = parseFloat(loadSetting(STORAGE_KEYS.customY, '180')) || 180;

    const preset = MACHINE_PRESETS.find((p) => p.id === savedMachine);
    selectedMachineId = savedMachine;
    if (preset && preset.id !== 'custom') {
      CNC.BED_X = preset.x; CNC.BED_Y = preset.y;
    } else {
      selectedMachineId = 'custom';
      CNC.BED_X = savedCustomX; CNC.BED_Y = savedCustomY;
    }
  }

  /* ---------------------------------------------------------------------
     5. MACHINE SETUP UI
     --------------------------------------------------------------------- */
  function populateMachineSelect() {
    dom.machineSelect.innerHTML = '';
    MACHINE_PRESETS.forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.id === 'custom' ? t('machine.custom') : `${p.label} (${p.x}×${p.y} mm)`;
      dom.machineSelect.appendChild(opt);
    });
    dom.machineSelect.value = selectedMachineId;
    syncCustomRowVisibility();
  }

  function refreshMachineCustomLabel() {
    if (!dom.machineSelect) return;
    const opt = Array.from(dom.machineSelect.options).find((o) => o.value === 'custom');
    if (opt) opt.textContent = t('machine.custom');
  }

  function syncCustomRowVisibility() {
    const isCustom = selectedMachineId === 'custom';
    dom.customSizeRow.hidden = !isCustom;
    dom.btnApplyMachine.hidden = !isCustom;
    if (isCustom) {
      dom.customX.value = CNC.BED_X;
      dom.customY.value = CNC.BED_Y;
    }
  }

  /* ---------------------------------------------------------------------
     6. WEBGL AVAILABILITY CHECK
     Three.js's WebGLRenderer throws synchronously if it can't get a WebGL
     context (disabled/blocklisted GPU, locked-down school PC, remote
     desktop/VDI session, etc). Since initThree() runs before the language
     selector, machine selector, and all event wiring are set up, letting
     that exception propagate would silently abort the ENTIRE UI with zero
     explanation to the user. So we feature-detect first, with a plain
     <canvas> — no Three.js involved yet — and branch accordingly.
     --------------------------------------------------------------------- */
  function isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  }

  // Swaps the whole 3D workspace out for a friendly, translated explanation.
  // The top bar (language switcher + theme toggle) is left fully functional
  // so the message can still be read in either language and the theme can
  // still be switched — neither of those touches Three.js at all.
  function showWebglFallback() {
    const mainGrid = document.getElementById('mainGrid');
    const fallback = document.getElementById('webglFallback');
    if (mainGrid) mainGrid.classList.add('hidden');
    if (fallback) fallback.classList.remove('hidden');
    setStatus('error', 'status.webglUnavailable');
    wireMinimalFallbackEvents();
  }

  // Only the two controls that make sense with no 3D scene at all: language
  // and theme. Both applyLanguage() and applyTheme() already guard every
  // Three.js-object access with `if (obj) ...`, so they're safe to call even
  // though initThree() never ran and scene/camera/toolBit are all still null.
  function wireMinimalFallbackEvents() {
    dom.langSelect.addEventListener('change', () => applyLanguage(dom.langSelect.value));
    dom.themeToggle.addEventListener('click', () => applyTheme(state.theme === 'dark' ? 'light' : 'dark'));
  }


  let renderer, scene, camera, controls;
  let cutLineObj = null, rapidLineObj = null, stockMesh = null, toolBit = null;
  let gridGroup = null, frameObj = null;
  let gridMinorMat = null, gridMajorMat = null, frameMat = null;
  let bedBuiltForX = null, bedBuiltForY = null; // dimensions the current grid geometry matches

  function initThree() {
    scene = new THREE.Scene();
    const theme = THEMES[state.theme];
    scene.fog = new THREE.FogExp2(theme.fog, theme.fogDensity);

    const host = dom.canvasHost;
    const w = host.clientWidth, h = host.clientHeight;

    camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 6000);
    camera.position.set(CNC.BED_X * 0.65, Math.max(CNC.BED_X, CNC.BED_Y) * 0.62, CNC.BED_Y * 1.55);
    camera.lookAt(CNC.BED_X / 2, 0, CNC.BED_Y / 2);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0); // transparent — CSS background shows through, themed automatically
    host.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(CNC.BED_X / 2, 0, CNC.BED_Y / 2);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 20;
    controls.maxDistance = 2200;
    controls.maxPolarAngle = Math.PI * 0.49; // keep from flipping under the bed
    controls.update();

    // --- Lighting ---
    const hemi = new THREE.HemisphereLight(0x6fd8ff, 0x03060a, 0.75);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xbfeaff, 0.9);
    key.position.set(CNC.BED_X * 0.4, 260, CNC.BED_Y * 1.2);
    scene.add(key);
    const rim = new THREE.PointLight(0x29e6ff, 0.6, 900);
    rim.position.set(-100, 150, -50);
    scene.add(rim);

    // --- Wasteboard grid + bed frame (sized from current CNC config) ---
    rebuildBed({ recenterCamera: false }); // camera already positioned above

    // --- Router bit (cone tip + cylindrical shank) ---
    toolBit = buildToolBit();
    toolBit.position.set(0, 20, 0);
    scene.add(toolBit);

    window.addEventListener('resize', onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(host);

    animateFrame();
  }

  function disposeObject3D(obj) {
    if (!obj) return;
    obj.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
        else o.material.dispose();
      }
    });
  }

  // Builds (or rebuilds) the wasteboard grid + boundary frame for the current
  // CNC.BED_X / CNC.BED_Y. Geometry only needs to be regenerated when the bed
  // SIZE changes (machine preset / custom apply) — a pure theme switch reuses
  // the existing geometry and just recolors the materials (see applyTheme()).
  function rebuildBed(opts) {
    const recenterCamera = !opts || opts.recenterCamera !== false;
    const theme = THEMES[state.theme];

    if (gridGroup) { scene.remove(gridGroup); disposeObject3D(gridGroup); gridGroup = null; }
    if (frameObj) { scene.remove(frameObj); disposeObject3D(frameObj); frameObj = null; }

    const built = buildRectGrid(CNC.BED_X, CNC.BED_Y, CNC.GRID_STEP, theme);
    gridGroup = built.group;
    gridMinorMat = built.minorMat;
    gridMajorMat = built.majorMat;
    scene.add(gridGroup);

    const frameBuilt = buildBedFrame(CNC.BED_X, CNC.BED_Y, theme);
    frameObj = frameBuilt.obj;
    frameMat = frameBuilt.mat;
    scene.add(frameObj);

    bedBuiltForX = CNC.BED_X;
    bedBuiltForY = CNC.BED_Y;

    updateWasteboardHud();

    // Only re-center the camera on the bed if no part is currently loaded —
    // otherwise keep the user's current view of the loaded toolpath.
    if (recenterCamera && !state.loaded && controls) {
      controls.target.set(CNC.BED_X / 2, 0, CNC.BED_Y / 2);
      camera.position.set(CNC.BED_X * 0.65, Math.max(CNC.BED_X, CNC.BED_Y) * 0.62, CNC.BED_Y * 1.55);
      controls.update();
    }
  }

  // Cheap re-theme: recolors existing materials instead of rebuilding geometry.
  function updateSceneColorsForTheme() {
    const theme = THEMES[state.theme];
    if (scene && scene.fog) {
      scene.fog.color.setHex(theme.fog);
      scene.fog.density = theme.fogDensity;
    }
    if (gridMinorMat) gridMinorMat.color.setHex(theme.grid);
    if (gridMajorMat) gridMajorMat.color.setHex(theme.gridMajor);
    if (frameMat) frameMat.color.setHex(theme.frame);
    if (stockMesh) {
      stockMesh.material.color.setHex(theme.stock);
      stockMesh.material.opacity = theme.stockOpacity;
    }
  }

  function buildRectGrid(width, depth, step, theme) {
    const group = new THREE.Group();
    const minorMat = new THREE.LineBasicMaterial({ color: theme.grid, transparent: true, opacity: 0.55 });
    const majorMat = new THREE.LineBasicMaterial({ color: theme.gridMajor, transparent: true, opacity: 0.9 });

    const minorPts = [];
    const majorPts = [];

    const nx = Math.round(width / step);
    const nz = Math.round(depth / step);

    for (let i = 0; i <= nx; i++) {
      const x = i * step;
      const isMajor = i % CNC.GRID_MAJOR_EVERY === 0;
      (isMajor ? majorPts : minorPts).push(x, 0, 0, x, 0, depth);
    }
    for (let j = 0; j <= nz; j++) {
      const z = j * step;
      const isMajor = j % CNC.GRID_MAJOR_EVERY === 0;
      (isMajor ? majorPts : minorPts).push(0, 0, z, width, 0, z);
    }

    const minorGeo = new THREE.BufferGeometry();
    minorGeo.setAttribute('position', new THREE.Float32BufferAttribute(minorPts, 3));
    group.add(new THREE.LineSegments(minorGeo, minorMat));

    const majorGeo = new THREE.BufferGeometry();
    majorGeo.setAttribute('position', new THREE.Float32BufferAttribute(majorPts, 3));
    group.add(new THREE.LineSegments(majorGeo, majorMat));

    return { group, minorMat, majorMat };
  }

  function buildBedFrame(width, depth, theme) {
    const pts = [
      0, 0.05, 0,   width, 0.05, 0,
      width, 0.05, 0,   width, 0.05, depth,
      width, 0.05, depth,   0, 0.05, depth,
      0, 0.05, depth,   0, 0.05, 0,
    ];
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const mat = new THREE.LineBasicMaterial({ color: theme.frame });
    return { obj: new THREE.LineSegments(geo, mat), mat };
  }

  function buildToolBit() {
    const group = new THREE.Group();

    const shankMat = new THREE.MeshStandardMaterial({
      color: COLOR.bit, metalness: 0.7, roughness: 0.25,
      emissive: COLOR.bitEmissive, emissiveIntensity: 0.15,
    });
    const tipMat = new THREE.MeshStandardMaterial({
      color: COLOR.bitEmissive, metalness: 0.4, roughness: 0.15,
      emissive: COLOR.bitEmissive, emissiveIntensity: 0.6,
    });

    const shank = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 16, 20), shankMat);
    shank.position.y = 8;
    group.add(shank);

    const tip = new THREE.Mesh(new THREE.ConeGeometry(2.2, 6, 20), tipMat);
    tip.position.y = -3;
    tip.rotation.x = Math.PI; // point downward
    group.add(tip);

    // faint glow ring at the cutting point
    const ringGeo = new THREE.RingGeometry(2.4, 3.4, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: COLOR.bitEmissive, transparent: true, opacity: 0.55, side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -5.9;
    group.add(ring);

    const light = new THREE.PointLight(COLOR.bitEmissive, 0.8, 40);
    light.position.y = -4;
    group.add(light);

    return group;
  }

  function onResize() {
    const host = dom.canvasHost;
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function animateFrame() {
    requestAnimationFrame(animateFrame);
    if (state.playing) stepSimulation();
    if (controls) controls.update();
    if (toolBit) toolBit.rotation.y += 0.12; // spin the bit for visual feedback
    renderer.render(scene, camera);
  }

  /* ---------------------------------------------------------------------
     7. THEME SWITCHING
     --------------------------------------------------------------------- */
  function applyTheme(name) {
    state.theme = name === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    saveSetting(STORAGE_KEYS.theme, state.theme);
    saveSetting(STORAGE_KEYS.themeExplicit, '1'); // user made a deliberate choice now

    // Recolor only — geometry is untouched, so this is cheap regardless of
    // toolpath size or bed size.
    updateSceneColorsForTheme();
  }

  /* ---------------------------------------------------------------------
     8. G-CODE COORDINATE MAPPING
     G-code:  X (left/right), Y (front/back), Z (up/down, negative = into stock)
     Three.js world:  x = gcode X, y = gcode Z (up), z = gcode Y
     --------------------------------------------------------------------- */
  function toWorld(p) {
    return new THREE.Vector3(p.x, p.z, p.y);
  }

  /* ---------------------------------------------------------------------
     9. G-CODE PARSER
     Supports G0/G1/G2/G3, G20/G21 (units), G90/G91 (absolute/relative),
     G92 (set current position — coordinate system offset), I/J arc center
     offsets (R fallback), F feed rate. Ignores M-codes, comments in () or
     after ;, and unsupported words gracefully. Lines that would produce
     non-finite (NaN/Infinity) coordinates are skipped and counted so the
     user is warned instead of silently getting a corrupted toolpath.
     --------------------------------------------------------------------- */
  function parseGcodeAsync(text, onProgress, onDone) {
    const rawLines = text.split(/\r\n|\r|\n/);
    const totalLines = rawLines.length;

    const posState = { x: 0, y: 0, z: 0 };
    let absoluteMode = true;
    let unitScale = 1;
    let currentFeed = 0;
    let malformedLines = 0;

    const moves = [];
    let cutLengthMm = 0;
    let rapidLengthMm = 0;
    let totalTimeSec = 0;

    const bounds = {
      minX: Infinity, maxX: -Infinity,
      minY: Infinity, maxY: -Infinity,
      minZ: Infinity, maxZ: -Infinity,
    };
    function growBounds(p) {
      bounds.minX = Math.min(bounds.minX, p.x); bounds.maxX = Math.max(bounds.maxX, p.x);
      bounds.minY = Math.min(bounds.minY, p.y); bounds.maxY = Math.max(bounds.maxY, p.y);
      bounds.minZ = Math.min(bounds.minZ, p.z); bounds.maxZ = Math.max(bounds.maxZ, p.z);
    }
    growBounds(posState);

    function isFinitePoint(p) {
      return Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z);
    }

    const WORD_RE = /([A-Za-z])\s*(-?\d*\.?\d+)/g;

    function stripComments(line) {
      let out = line.replace(/\(.*?\)/g, ' ');
      const semi = out.indexOf(';');
      if (semi >= 0) out = out.slice(0, semi);
      out = out.replace(/\*\d+\s*$/, ''); // strip a trailing checksum, e.g. "...X10*71"
      return out;
    }

    // WORD_RE only ever matches well-formed "letter + number" pairs, so a
    // garbled word like "XABC" is simply never captured — it silently
    // vanishes instead of raising a NaN anywhere. This validator walks the
    // line character-by-character (independent of WORD_RE, and independent
    // of whether words are space-separated) and returns false the moment it
    // finds a letter that isn't followed by a valid number, or a stray
    // character that isn't part of any recognized word. That result is used
    // purely to flag the line as suspicious for the user — it does not
    // change what WORD_RE itself extracts.
    function validateLineTokens(line) {
      const len = line.length;
      let idx = 0;
      while (idx < len) {
        const ch = line[idx];
        if (/\s/.test(ch)) { idx++; continue; }
        if (ch === '%') { idx++; continue; } // program start/end marker
        if (/[A-Za-z]/.test(ch)) {
          let j = idx + 1;
          while (j < len && /\s/.test(line[j])) j++; // allow (rare) space between letter and value
          let k = j;
          if (line[k] === '-' || line[k] === '+') k++;
          let sawDigit = false;
          while (k < len && (/\d/.test(line[k]) || line[k] === '.')) {
            if (/\d/.test(line[k])) sawDigit = true;
            k++;
          }
          if (!sawDigit) return false; // a letter with no valid number attached
          idx = k;
          continue;
        }
        return false; // a stray digit/symbol not attached to any letter word
      }
      return true;
    }

    function pushArc(fromP, toP, iOff, jOff, clockwise, lineNo, feed) {
      const cx = fromP.x + (iOff || 0);
      const cy = fromP.y + (jOff || 0);
      const radius = Math.hypot(fromP.x - cx, fromP.y - cy);

      // Guard against a degenerate/invalid arc (zero or non-finite radius) —
      // fall back to a straight line rather than emitting NaN geometry.
      if (!Number.isFinite(radius) || radius < 1e-6) {
        addMove(clockwise ? 'G2' : 'G3', fromP, toP, feed, lineNo);
        return;
      }

      let startAngle = Math.atan2(fromP.y - cy, fromP.x - cx);
      let endAngle = Math.atan2(toP.y - cy, toP.x - cx);

      let deltaAngle = endAngle - startAngle;
      if (clockwise) { if (deltaAngle > 0) deltaAngle -= 2 * Math.PI; }
      else { if (deltaAngle < 0) deltaAngle += 2 * Math.PI; }
      if (Math.abs(deltaAngle) < 1e-6) deltaAngle = clockwise ? -2 * Math.PI : 2 * Math.PI;

      const segCount = Math.max(6, Math.min(120, Math.ceil(Math.abs(deltaAngle) / (Math.PI / 24))));

      let prev = { x: fromP.x, y: fromP.y, z: fromP.z };
      for (let s = 1; s <= segCount; s++) {
        const tt = s / segCount;
        const ang = startAngle + deltaAngle * tt;
        const next = {
          x: cx + radius * Math.cos(ang),
          y: cy + radius * Math.sin(ang),
          z: fromP.z + (toP.z - fromP.z) * tt,
        };
        addMove('G' + (clockwise ? '2' : '3'), prev, next, feed, lineNo);
        prev = next;
      }
    }

    function addMove(type, fromP, toP, feed, lineNo) {
      if (!isFinitePoint(toP)) { malformedLines++; return; }
      const length = Math.hypot(toP.x - fromP.x, toP.y - fromP.y, toP.z - fromP.z);
      if (length < 1e-7) return;
      const isRapid = type === 'G0';
      const effFeed = isRapid ? RAPID_FEED_MM_MIN : (feed > 0 ? feed : DEFAULT_CUT_FEED_MM_MIN);
      const duration = (length / effFeed) * 60;

      moves.push({
        type,
        from: { x: fromP.x, y: fromP.y, z: fromP.z },
        to: { x: toP.x, y: toP.y, z: toP.z },
        feed: effFeed,
        length,
        duration,
        lineNo,
        startTime: totalTimeSec,
      });

      totalTimeSec += duration;
      if (isRapid) rapidLengthMm += length; else cutLengthMm += length;
      growBounds(toP);
    }

    let i = 0;
    function processChunk() {
      const end = Math.min(i + PARSE_CHUNK_SIZE, totalLines);

      for (; i < end; i++) {
        const raw = rawLines[i];
        const line = stripComments(raw).trim();
        if (!line) continue;

        if (!validateLineTokens(line)) {
          // A word like "XABC" or a stray unattached character was found.
          // WORD_RE below will simply skip over it silently, so we count
          // it here — this is the only place that catches that class of
          // problem, since it never produces a NaN anywhere downstream.
          malformedLines++;
        }

        let gWord = null;
        const params = {};
        WORD_RE.lastIndex = 0;
        let m;
        while ((m = WORD_RE.exec(line)) !== null) {
          const letter = m[1].toUpperCase();
          const value = parseFloat(m[2]);
          if (!Number.isFinite(value)) continue; // ignore an unparsable numeric token
          if (letter === 'G') gWord = value;
          else if (letter === 'M') { /* ignored for motion purposes */ }
          else params[letter] = value;
        }

        if (params.F !== undefined) currentFeed = params.F * unitScale;

        if (gWord === 20) { unitScale = 25.4; continue; }
        if (gWord === 21) { unitScale = 1; continue; }
        if (gWord === 90) { absoluteMode = true; continue; }
        if (gWord === 91) { absoluteMode = false; continue; }

        if (gWord === 92) {
          // Set current position (coordinate system shift) — no motion happens.
          const gp = { x: posState.x, y: posState.y, z: posState.z };
          if (params.X !== undefined) gp.x = params.X * unitScale;
          if (params.Y !== undefined) gp.y = params.Y * unitScale;
          if (params.Z !== undefined) gp.z = params.Z * unitScale;
          if (isFinitePoint(gp)) {
            posState.x = gp.x; posState.y = gp.y; posState.z = gp.z;
            growBounds(posState);
          } else {
            malformedLines++;
          }
          continue;
        }

        if (gWord === null) continue; // no motion command on this line
        if (![0, 1, 2, 3].includes(gWord)) continue; // ignore other G-codes (G4, G28, etc.)

        const from = { x: posState.x, y: posState.y, z: posState.z };
        const to = { x: from.x, y: from.y, z: from.z };

        if (params.X !== undefined) to.x = absoluteMode ? params.X * unitScale : from.x + params.X * unitScale;
        if (params.Y !== undefined) to.y = absoluteMode ? params.Y * unitScale : from.y + params.Y * unitScale;
        if (params.Z !== undefined) to.z = absoluteMode ? params.Z * unitScale : from.z + params.Z * unitScale;

        if (!isFinitePoint(to)) {
          malformedLines++;
          continue; // skip this line entirely rather than propagate NaN forward
        }

        const lineNo = i + 1;

        if (gWord === 0) {
          addMove('G0', from, to, 0, lineNo);
        } else if (gWord === 1) {
          addMove('G1', from, to, currentFeed, lineNo);
        } else if (gWord === 2 || gWord === 3) {
          const clockwise = gWord === 2;
          if (params.I !== undefined || params.J !== undefined) {
            pushArc(from, to, (params.I || 0) * unitScale, (params.J || 0) * unitScale, clockwise, lineNo, currentFeed);
          } else if (params.R !== undefined) {
            const r = params.R * unitScale;
            const dx = to.x - from.x, dy = to.y - from.y;
            const chord = Math.hypot(dx, dy);
            const midX = (from.x + to.x) / 2, midY = (from.y + to.y) / 2;
            const hh = Math.sqrt(Math.max(0, r * r - (chord / 2) * (chord / 2)));
            const nx = -dy / (chord || 1), ny = dx / (chord || 1);
            const sign = (clockwise ? 1 : -1) * (r >= 0 ? 1 : -1);
            const cx = midX + nx * hh * sign, cy = midY + ny * hh * sign;
            if (Number.isFinite(cx) && Number.isFinite(cy)) {
              pushArc(from, to, cx - from.x, cy - from.y, clockwise, lineNo, currentFeed);
            } else {
              addMove(gWord === 2 ? 'G2' : 'G3', from, to, currentFeed, lineNo);
            }
          } else {
            // Degenerate arc with no center info — treat as a straight cut
            addMove(gWord === 2 ? 'G2' : 'G3', from, to, currentFeed, lineNo);
          }
        }

        posState.x = to.x; posState.y = to.y; posState.z = to.z;
      }

      onProgress(Math.round((i / totalLines) * 100));

      if (i < totalLines) {
        setTimeout(processChunk, 0); // yield to the browser between chunks
      } else {
        if (!isFinite(bounds.minX)) {
          bounds.minX = bounds.maxX = bounds.minY = bounds.maxY = bounds.minZ = bounds.maxZ = 0;
        }
        onDone({ moves, totalLines, cutLengthMm, rapidLengthMm, totalTimeSec, bounds, malformedLines });
      }
    }

    processChunk();
  }

  /* ---------------------------------------------------------------------
     10. BUILD 3D TOOLPATH GEOMETRY FROM PARSED MOVES
     --------------------------------------------------------------------- */
  function rebuildSceneFromMoves(result) {
    [cutLineObj, rapidLineObj, stockMesh].forEach((obj) => {
      if (obj) { scene.remove(obj); disposeObject3D(obj); }
    });
    cutLineObj = rapidLineObj = stockMesh = null;

    const cutPts = [];
    const rapidPts = [];

    for (const mv of result.moves) {
      const a = toWorld(mv.from), b = toWorld(mv.to);
      if (mv.type === 'G0') {
        rapidPts.push(a.x, a.y, a.z, b.x, b.y, b.z);
      } else {
        cutPts.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }

    // --- Cutting path: solid neon-blue line ---
    const cutGeo = new THREE.BufferGeometry();
    cutGeo.setAttribute('position', new THREE.Float32BufferAttribute(cutPts, 3));
    const cutMat = new THREE.LineBasicMaterial({ color: COLOR.cut, linewidth: 2 });
    cutLineObj = new THREE.LineSegments(cutGeo, cutMat);
    scene.add(cutLineObj);

    // --- Rapid path: dashed amber line ---
    const rapidGeo = new THREE.BufferGeometry();
    rapidGeo.setAttribute('position', new THREE.Float32BufferAttribute(rapidPts, 3));
    const rapidMat = new THREE.LineDashedMaterial({ color: COLOR.rapid, dashSize: 3, gapSize: 2, linewidth: 1 });
    rapidLineObj = new THREE.LineSegments(rapidGeo, rapidMat);
    rapidLineObj.computeLineDistances(); // required for dashed materials
    rapidLineObj.visible = dom.toggleRapids.checked;
    scene.add(rapidLineObj);

    // --- Stock material block (visual context for the workpiece) ---
    const theme = THEMES[state.theme];
    const b = result.bounds;
    const stockW = Math.max(10, b.maxX - b.minX);
    const stockD = Math.max(10, b.maxY - b.minY);
    const topZ = Math.max(0, b.maxZ);
    const bottomZ = Math.min(-1, b.minZ);
    const stockH = topZ - bottomZ;

    const stockGeo = new THREE.BoxGeometry(stockW + 6, stockH, stockD + 6);
    const stockMat = new THREE.MeshStandardMaterial({
      color: theme.stock, transparent: true, opacity: theme.stockOpacity,
      roughness: 0.8, metalness: 0.1, side: THREE.DoubleSide,
    });
    stockMesh = new THREE.Mesh(stockGeo, stockMat);
    stockMesh.position.set((b.minX + b.maxX) / 2, bottomZ + stockH / 2, (b.minY + b.maxY) / 2);
    stockMesh.visible = dom.toggleStock.checked;
    scene.add(stockMesh);

    // Re-aim camera/controls at the freshly loaded part
    const center = new THREE.Vector3((b.minX + b.maxX) / 2, 0, (b.minY + b.maxY) / 2);
    controls.target.copy(center);
    const span = Math.max(stockW, stockD, 60);
    camera.position.set(center.x + span * 0.55, span * 0.7, center.z + span * 1.0);
    controls.update();
  }

  /* ---------------------------------------------------------------------
     11. PLAYBACK / SIMULATION ENGINE
     --------------------------------------------------------------------- */
  function stepSimulation() {
    const now = performance.now();
    if (state.lastFrameTs === null) state.lastFrameTs = now;
    const dt = (now - state.lastFrameTs) / 1000;
    state.lastFrameTs = now;

    state.simTime += dt * state.speedMultiplier;

    if (state.simTime >= state.totalTimeSec) {
      state.simTime = state.totalTimeSec;
      applyTimeToScene(state.simTime);
      pauseSimulation();
      return;
    }
    applyTimeToScene(state.simTime);
  }

  function applyTimeToScene(t) {
    const moves = state.moves;
    if (!moves.length) return;

    // Clamp cursor into range, then scan forward/backward to find the move
    // that contains time t. Works for both normal forward playback and
    // arbitrary seeks (progress-bar scrubbing) in either direction.
    if (state.cursor >= moves.length) state.cursor = moves.length - 1;
    if (state.cursor < 0) state.cursor = 0;

    while (state.cursor < moves.length - 1 && moves[state.cursor].startTime + moves[state.cursor].duration < t) {
      state.cursor++;
    }
    while (state.cursor > 0 && moves[state.cursor].startTime > t) {
      state.cursor--;
    }

    const mv = moves[state.cursor];
    const localT = mv.duration > 0 ? Math.min(1, Math.max(0, (t - mv.startTime) / mv.duration)) : 1;

    const pos = {
      x: mv.from.x + (mv.to.x - mv.from.x) * localT,
      y: mv.from.y + (mv.to.y - mv.from.y) * localT,
      z: mv.from.z + (mv.to.z - mv.from.z) * localT,
    };

    const world = toWorld(pos);
    if (toolBit) toolBit.position.set(world.x, world.y, world.z);

    updateTelemetry(mv, pos, t);
  }

  function playSimulation() {
    if (!state.loaded || state.moves.length === 0) return;
    if (state.simTime >= state.totalTimeSec) { state.simTime = 0; state.cursor = 0; }
    state.playing = true;
    state.lastFrameTs = null;
    setStatus('running', 'status.running');
    dom.btnPlay.classList.add('active');
    dom.btnPause.classList.remove('active');
  }

  function pauseSimulation() {
    state.playing = false;
    setStatus('paused', 'status.paused');
    dom.btnPlay.classList.remove('active');
  }

  function resetSimulation() {
    state.playing = false;
    state.simTime = 0;
    state.cursor = 0;
    state.lastFrameTs = null;
    if (state.moves.length) applyTimeToScene(0);
    setStatus('ready', 'status.readyToSimulate');
    dom.btnPlay.classList.remove('active');
    dom.btnPause.classList.remove('active');
  }

  // Jump the simulation clock to an arbitrary fraction (0..1) of total time —
  // used by the seekable progress bar.
  function seekToFraction(frac) {
    if (!state.loaded || state.moves.length === 0) return;
    frac = Math.min(1, Math.max(0, frac));
    state.simTime = frac * state.totalTimeSec;
    state.lastFrameTs = null;
    applyTimeToScene(state.simTime);
  }

  /* ---------------------------------------------------------------------
     12. TELEMETRY / UI UPDATES
     --------------------------------------------------------------------- */
  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    const mnt = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(mnt).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function updateTelemetry(mv, pos, t) {
    const total = state.totalLines;
    dom.teleLine.textContent = `${mv.lineNo} / ${total}`;
    dom.teleCmd.textContent = mv.type;
    dom.teleX.textContent = pos.x.toFixed(3);
    dom.teleY.textContent = pos.y.toFixed(3);
    dom.teleZ.textContent = pos.z.toFixed(3);
    dom.teleFeed.textContent = `${Math.round(mv.feed)} mm/min`;
    dom.teleElapsed.textContent = formatTime(t);

    const pct = state.totalTimeSec > 0 ? (t / state.totalTimeSec) * 100 : 0;
    dom.progressFill.style.width = `${pct.toFixed(1)}%`;
    dom.progressHandle.style.left = `${pct.toFixed(2)}%`;
    dom.progressLabel.textContent = `${pct.toFixed(1)}%`;
    dom.progressTrack.setAttribute('aria-valuenow', pct.toFixed(0));
  }

  function setStatus(cls, key) {
    state.statusCls = cls;
    state.statusKey = key;
    dom.statusPill.classList.remove('ready', 'running', 'paused');
    dom.statusPill.classList.add(cls);
    dom.statusText.textContent = t(key);
  }

  function refreshStatusText() {
    dom.statusText.textContent = t(state.statusKey);
  }

  function updateWasteboardHud() {
    if (dom.wasteboardHudSpan) {
      dom.wasteboardHudSpan.textContent = t('hud.wasteboard', { w: CNC.BED_X, h: CNC.BED_Y });
    }
  }

  /* ---------------------------------------------------------------------
     13. FILE-META PANEL (all user-controlled strings go through textContent
     only — never innerHTML — so a maliciously named file can't inject markup)
     --------------------------------------------------------------------- */
  function showFileMetaMessage(text, isError) {
    dom.fileMetaMsg.textContent = text;
    dom.fileMetaMsg.classList.toggle('error', !!isError);
    dom.fileMetaName.textContent = '';
    dom.fileMetaDetails.textContent = '';
    dom.fileMetaWarning.hidden = true;
    dom.fileMetaWarning.textContent = '';
  }

  function showFileMetaSummary(file, result) {
    const sizeKb = (file.size / 1024).toFixed(1);
    dom.fileMetaMsg.textContent = '';
    dom.fileMetaMsg.classList.remove('error');
    dom.fileMetaName.textContent = file.name; // textContent — safe even with a crafted filename
    dom.fileMetaDetails.textContent =
      `${t('file.summaryLine1', { lines: result.totalLines.toLocaleString(), size: sizeKb })}\n` +
      `${t('file.summaryLine2', { moves: result.moves.length.toLocaleString() })}`;

    if (result.malformedLines > 0) {
      dom.fileMetaWarning.hidden = false;
      dom.fileMetaWarning.textContent = t('file.warnings', { count: result.malformedLines });
    } else {
      dom.fileMetaWarning.hidden = true;
      dom.fileMetaWarning.textContent = '';
    }
  }

  /* ---------------------------------------------------------------------
     14. FILE LOADING (drag & drop + click-to-browse)
     --------------------------------------------------------------------- */
  function handleFile(file) {
    if (!file) return;
    const validExt = /\.(gcode|nc|txt|tap|cnc)$/i.test(file.name);
    if (!validExt) {
      showFileMetaMessage(t('file.unsupported'), true);
      return;
    }

    setStatus('paused', 'status.parsing');
    showFileMetaMessage(t('file.reading', { name: file.name }), false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      parseGcodeAsync(
        text,
        (pct) => { showFileMetaMessage(t('file.parsing', { name: file.name, pct }), false); },
        (result) => onParseComplete(file, result)
      );
    };
    reader.onerror = () => {
      showFileMetaMessage(t('file.error'), true);
      setStatus('ready', 'status.error');
    };
    reader.readAsText(file);
  }

  // Fully clears any previously loaded toolpath — 3D objects, telemetry,
  // and playback state — without touching the wasteboard/bed geometry
  // (bed size is a machine-setup concern, unrelated to toolpath content).
  // Used when a newly loaded file turns out to contain no motion, so stale
  // visuals from a *previous* successful load can't linger on screen next
  // to a "no toolpath found" status.
  function clearToolpathVisuals() {
    [cutLineObj, rapidLineObj, stockMesh].forEach((obj) => {
      if (obj) { scene.remove(obj); disposeObject3D(obj); }
    });
    cutLineObj = null; rapidLineObj = null; stockMesh = null;

    state.moves = [];
    state.totalLines = 0;
    state.totalTimeSec = 0;
    state.cutLengthMm = 0;
    state.rapidLengthMm = 0;
    state.bounds = null;
    state.simTime = 0;
    state.cursor = 0;
    state.playing = false;
    state.loaded = false;

    dom.teleLine.textContent = '0 / 0';
    dom.teleCmd.textContent = '--';
    dom.teleX.textContent = '0.000';
    dom.teleY.textContent = '0.000';
    dom.teleZ.textContent = '0.000';
    dom.teleFeed.textContent = '0';
    dom.teleElapsed.textContent = '00:00';
    dom.teleTotal.textContent = '00:00';
    dom.teleCutLen.textContent = '0 mm';
    dom.teleRapidLen.textContent = '0 mm';
    dom.teleBounds.textContent = '--';
    dom.progressFill.style.width = '0%';
    dom.progressHandle.style.left = '0%';
    dom.progressLabel.textContent = '0.0%';
    dom.progressTrack.setAttribute('aria-valuenow', '0');

    dom.btnPlay.disabled = true;
    dom.btnPause.disabled = true;
    dom.btnReset.disabled = true;
    dom.btnPlay.classList.remove('active');
    dom.btnPause.classList.remove('active');

    dom.emptyState.classList.remove('hidden');

    if (toolBit) toolBit.position.set(0, 20, 0);
  }

  function onParseComplete(file, result) {
    state.malformedLines = result.malformedLines;

    if (result.moves.length === 0) {
      // Nothing to simulate — clear any stale toolpath from a previous
      // load so the 3D view and telemetry can't contradict the status
      // message, then tell the user plainly instead of leaving Play
      // enabled but a no-op. The bed/grid itself is untouched.
      clearToolpathVisuals();
      showFileMetaMessage(t('file.noMoves'), true);
      setStatus('ready', 'status.noMoves');
      return;
    }

    state.moves = result.moves;
    state.totalLines = result.totalLines;
    state.totalTimeSec = result.totalTimeSec;
    state.cutLengthMm = result.cutLengthMm;
    state.rapidLengthMm = result.rapidLengthMm;
    state.bounds = result.bounds;
    state.simTime = 0;
    state.cursor = 0;
    state.playing = false;
    state.loaded = true;

    rebuildSceneFromMoves(result);
    showFileMetaSummary(file, result);

    const b = result.bounds;
    dom.teleBounds.textContent =
      `${(b.maxX - b.minX).toFixed(0)}×${(b.maxY - b.minY).toFixed(0)}×${(b.maxZ - b.minZ).toFixed(0)} mm`;
    dom.teleCutLen.textContent = `${result.cutLengthMm.toFixed(0)} mm`;
    dom.teleRapidLen.textContent = `${result.rapidLengthMm.toFixed(0)} mm`;
    dom.teleTotal.textContent = formatTime(result.totalTimeSec);
    dom.teleLine.textContent = `0 / ${result.totalLines}`;
    dom.teleElapsed.textContent = '00:00';
    dom.progressFill.style.width = '0%';
    dom.progressHandle.style.left = '0%';
    dom.progressLabel.textContent = '0.0%';

    applyTimeToScene(0);

    dom.btnPlay.disabled = false;
    dom.btnPause.disabled = false;
    dom.btnReset.disabled = false;
    dom.emptyState.classList.add('hidden');
    setStatus('ready', 'status.readyToSimulate');
  }

  /* ---------------------------------------------------------------------
     15. EVENT WIRING
     --------------------------------------------------------------------- */
  function initEvents() {
    // File load
    dom.dropzone.addEventListener('click', () => dom.fileInput.click());
    dom.fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
    });
    ['dragenter', 'dragover'].forEach((evt) => {
      dom.dropzone.addEventListener(evt, (e) => {
        e.preventDefault(); e.stopPropagation();
        dom.dropzone.classList.add('dragover');
      });
    });
    ['dragleave', 'drop'].forEach((evt) => {
      dom.dropzone.addEventListener(evt, (e) => {
        e.preventDefault(); e.stopPropagation();
        dom.dropzone.classList.remove('dragover');
      });
    });
    dom.dropzone.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) handleFile(file);
    });
    ['dragover', 'drop'].forEach((evt) => window.addEventListener(evt, (e) => e.preventDefault()));

    // Playback controls
    dom.btnPlay.addEventListener('click', playSimulation);
    dom.btnPause.addEventListener('click', pauseSimulation);
    dom.btnReset.addEventListener('click', resetSimulation);

    dom.speedSlider.addEventListener('input', () => {
      const idx = parseInt(dom.speedSlider.value, 10);
      state.speedMultiplier = SPEED_STEPS[idx];
      dom.speedValue.textContent = `${SPEED_STEPS[idx]}x`;
    });

    dom.toggleRapids.addEventListener('change', () => {
      if (rapidLineObj) rapidLineObj.visible = dom.toggleRapids.checked;
    });
    dom.toggleStock.addEventListener('change', () => {
      if (stockMesh) stockMesh.visible = dom.toggleStock.checked;
    });

    // Seekable progress bar — click or drag to scrub through the toolpath.
    function fractionFromPointerEvent(e) {
      const rect = dom.progressTrack.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      return (clientX - rect.left) / rect.width;
    }
    function beginScrub(e) {
      if (!state.loaded || state.moves.length === 0) return;
      state.scrubbing = true;
      state.wasPlayingBeforeScrub = state.playing;
      state.playing = false;
      seekToFraction(fractionFromPointerEvent(e));
      window.addEventListener('pointermove', duringScrub);
      window.addEventListener('pointerup', endScrub, { once: true });
    }
    function duringScrub(e) {
      if (!state.scrubbing) return;
      seekToFraction(fractionFromPointerEvent(e));
    }
    function endScrub() {
      state.scrubbing = false;
      window.removeEventListener('pointermove', duringScrub);
      if (state.wasPlayingBeforeScrub && state.simTime < state.totalTimeSec) {
        playSimulation();
      } else {
        setStatus('paused', 'status.paused');
      }
    }
    dom.progressTrack.addEventListener('pointerdown', beginScrub);
    dom.progressTrack.addEventListener('keydown', (e) => {
      if (!state.loaded || state.moves.length === 0) return;
      const step = 0.02;
      if (e.key === 'ArrowRight') { seekToFraction(state.simTime / state.totalTimeSec + step); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { seekToFraction(state.simTime / state.totalTimeSec - step); e.preventDefault(); }
    });

    // Keyboard shortcuts: space = play/pause, r = reset
    window.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'SELECT') return; // don't hijack typing in fields
      if (e.code === 'Space' && state.loaded) {
        e.preventDefault();
        state.playing ? pauseSimulation() : playSimulation();
      } else if (e.key.toLowerCase() === 'r' && state.loaded) {
        resetSimulation();
      }
    });

    // Language switcher
    dom.langSelect.addEventListener('change', () => applyLanguage(dom.langSelect.value));

    // Theme toggle
    dom.themeToggle.addEventListener('click', () => applyTheme(state.theme === 'dark' ? 'light' : 'dark'));

    // Machine setup
    dom.machineSelect.addEventListener('change', () => {
      selectedMachineId = dom.machineSelect.value;
      if (selectedMachineId === 'custom') {
        syncCustomRowVisibility();
        return; // wait for the user to press Apply
      }
      dom.customSizeRow.hidden = true;
      dom.btnApplyMachine.hidden = true;
      const preset = MACHINE_PRESETS.find((p) => p.id === selectedMachineId);
      if (preset) {
        CNC.BED_X = preset.x; CNC.BED_Y = preset.y;
        saveSetting(STORAGE_KEYS.machine, selectedMachineId);
        rebuildBed();
      }
    });

    dom.btnApplyMachine.addEventListener('click', () => {
      const x = parseFloat(dom.customX.value);
      const y = parseFloat(dom.customY.value);
      if (!(x > 0) || !(y > 0)) return;
      CNC.BED_X = x; CNC.BED_Y = y;
      saveSetting(STORAGE_KEYS.machine, 'custom');
      saveSetting(STORAGE_KEYS.customX, String(x));
      saveSetting(STORAGE_KEYS.customY, String(y));
      rebuildBed();
    });
  }

  /* ---------------------------------------------------------------------
     16. BOOTSTRAP
     --------------------------------------------------------------------- */
  function init() {
    restoreSettings();          // theme / language / machine size — no Three.js involved
    populateLangSelect();
    applyLanguage(currentLang); // paint all static + dynamic strings (incl. the hidden fallback panel)

    if (!isWebGLAvailable()) {
      // Stop here — do NOT call initThree() or wire up file/machine/playback
      // controls, since every one of them ultimately touches scene/camera/
      // controls/toolBit, none of which can exist without a WebGL context.
      showWebglFallback();
      return;
    }

    initThree();                // build the 3D scene using the restored bed size + theme
    populateMachineSelect();
    initEvents();
    setStatus('ready', 'status.noFile');
  }

  document.addEventListener('DOMContentLoaded', init);
})();

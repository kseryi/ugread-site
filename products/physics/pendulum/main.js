/**
 * Mathematical Pendulum Simulator - Main JavaScript Engine (main.js)
 * Standalone, zero external runtime dependencies, full physics simulation
 */

(function () {
  'use strict';

  // 1. Translations Dictionary (Ukrainian & English)
  const i18n = {
    en: {
      appTitle: "Mathematical Pendulum Simulator",
      appSubtitle: "Interactive Physics Simulation & Analytics (Autonomous Local App)",
      btnReset: "Reset",
      btnGuide: "Physics Guide",
      presetsHeader: "Experiment Presets",
      paramsHeader: "Physics Parameters",
      lblLength: "String Length (l)",
      lblAngle: "Initial Angle (αₘ / θ₀)",
      lblMass: "Bob Mass (m)",
      lblDamping: "Air Resistance (c)",
      gravityHeader: "Gravity (g)",
      visualsHeader: "Visual Overlays",
      btnStart: "Start",
      btnPause: "Pause",
      speedLabel: "Speed:",
      dragTip: "💡 Tip: Click & drag the pendulum bob directly on canvas to set any angle!",
      titleLengthAmp: "Length & Amplitude",
      badgeLengthAmp: "l, αₘ, A",
      lblL: "Length (l):",
      lblAmp: "Angle (αₘ):",
      lblLinearAmp: "Amplitude (A):",
      lblControlAmpFormula: "Amplitude A = l · αₘ:",
      titlePeriod: "Period (T)",
      titleFreq: "Frequency (f)",
      titleEnergy: "Energy (Eₜₒₜ)",
      lblTExact: "Exact:",
      lblTTheoretical: "Theoretical:",
      lblFreq: "Frequency:",
      lblVel: "Speed v:",
      stopwatchTitle: "⏱ Virtual Lab Stopwatch",
      stopwatchDesc: "Time 10 full oscillations to compute empirical period and relative error",
      swElapsed: "Elapsed Time",
      swOscLabel: "Oscillations Counted",
      swMeasuredT: "Measured Period:",
      swError: "Error vs Theory:",
      tabWave: "Waveforms (θ, ω)",
      tabEnergy: "Energy Balance",
      tabPhase: "Phase Space Orbit",
      btnClear: "Clear",
      btnExport: "Export CSV",
      guideTitle: "Mathematical Pendulum Theory & Lab Manual",
      meters: "m",
      degrees: "°",
      kg: "kg",
      radUnit: "rad"
    },
    ua: {
      appTitle: "Симулятор Математичного Маятника",
      appSubtitle: "Інтерактивне моделювання та фізична аналітика (Autonomous Local App)",
      btnReset: "Скинути",
      btnGuide: "Довідник Фізики",
      presetsHeader: "Шаблони Експериментів",
      paramsHeader: "Параметри Фізики",
      lblLength: "Довжина нитки (l)",
      lblAngle: "Початковий кут (αₘ / θ₀)",
      lblMass: "Маса тягарця (m)",
      lblDamping: "Опір повітря (c)",
      gravityHeader: "Гравітація (g)",
      visualsHeader: "Візуалізація",
      btnStart: "Запустити",
      btnPause: "Пауза",
      speedLabel: "Швидкість:",
      dragTip: "💡 Порада: Перетягуйте тягарець мишею/пальцем на полотні, щоб встановити кут!",
      titleLengthAmp: "Довжина & Амплітуда",
      badgeLengthAmp: "l, αₘ, A",
      lblL: "Довжина (l):",
      lblAmp: "Кут (αₘ):",
      lblLinearAmp: "Амплітуда (A):",
      lblControlAmpFormula: "Амплітуда A = l · αₘ:",
      titlePeriod: "Період (T)",
      titleFreq: "Частота (f)",
      titleEnergy: "Енергія (Eₜₒₜ)",
      lblTExact: "Точний:",
      lblTTheoretical: "Теоретичний:",
      lblFreq: "Частота:",
      lblVel: "Швидкість v:",
      stopwatchTitle: "⏱ Віртуальний Секундомір Лабораторної",
      stopwatchDesc: "Виміряйте час 10 повних коливань для розрахунку періоду та похибки",
      swElapsed: "Пройдений час",
      swOscLabel: "Відраховано коливань",
      swMeasuredT: "Виміряний період:",
      swError: "Похибка до теорії:",
      tabWave: "Хвильові графіки (θ, ω)",
      tabEnergy: "Баланс Енергій",
      tabPhase: "Фазовий портрет",
      btnClear: "Очистити",
      btnExport: "Експорт CSV",
      guideTitle: "Теорія Математичного Маятника та Методичні Вказівки",
      meters: "м",
      degrees: "°",
      kg: "кг",
      radUnit: "рад"
    }
  };

  // Presets
  const presets = [
    { id: 'small', nameEn: 'Small Angle (~5°)', nameUa: 'Малі кути (~5°)', p: { length: 1.0, mass: 1.0, gravity: 9.81, damping: 0.0, initialAngle: 5 } },
    { id: 'large', nameEn: 'Large Angle (~80°)', nameUa: 'Великі кути (~80°)', p: { length: 1.0, mass: 1.0, gravity: 9.81, damping: 0.0, initialAngle: 80 } },
    { id: 'lunar', nameEn: 'Moon Gravity', nameUa: 'Місяць (1.62 м/с²)', p: { length: 1.5, mass: 1.0, gravity: 1.62, damping: 0.0, initialAngle: 30 } },
    { id: 'damped', nameEn: 'Air Damping', nameUa: 'Опір повітря', p: { length: 1.2, mass: 0.8, gravity: 9.81, damping: 0.12, initialAngle: 45 } },
    { id: 'foucault', nameEn: 'Long Pendulum (4m)', nameUa: 'Довгий маятник (4м)', p: { length: 4.0, mass: 2.0, gravity: 9.81, damping: 0.0, initialAngle: 25 } },
    { id: 'inverted', nameEn: 'Inverted (170°)', nameUa: 'Розмах (170°)', p: { length: 1.0, mass: 1.0, gravity: 9.81, damping: 0.0, initialAngle: 170 } },
  ];

  const gravityPresets = [
    { id: 'earth', name: 'Earth', val: 9.81, icon: '🌍' },
    { id: 'moon', name: 'Moon', val: 1.62, icon: '🌕' },
    { id: 'mars', name: 'Mars', val: 3.71, icon: '🔴' },
    { id: 'jupiter', name: 'Jupiter', val: 24.79, icon: '🪐' },
    { id: 'sun', name: 'Sun', val: 274.0, icon: '☀️' },
    { id: 'zeroG', name: 'Zero G', val: 0.0, icon: '🚀' },
  ];

  // Application State
  let lang = 'ua';
  let theme = 'dark';

  let params = {
    length: 1.0,
    mass: 1.0,
    gravity: 9.81,
    damping: 0.0,
    initialAngle: 30.0
  };

  let state = {
    angle: (30.0 * Math.PI) / 180,
    angularVelocity: 0,
    angularAcceleration: 0,
    time: 0,
    isRunning: true,
    speedMultiplier: 1.0
  };

  let displayOpts = {
    showVectors: true,
    showProtractor: true,
    showRuler: true,
    showTrail: true,
    showGrid: true
  };

  let history = [];
  let trail = [];
  let activePlotTab = 'wave';

  // Stopwatch state
  let swTime = 0;
  let swRunning = false;
  let swCount = 0;
  let swInterval = null;

  // Interaction flags
  let isDragging = false;
  let animFrameId = null;
  let lastFrameTime = null;

  // 2. Physics Integrator (RK4 - Runge-Kutta 4th Order)
  function derivatives(angle, omega, p) {
    if (p.length <= 0) return [0, 0];
    const dTheta = omega;
    const dOmega = -(p.gravity / p.length) * Math.sin(angle) - (p.damping / Math.max(0.01, p.mass)) * omega;
    return [dTheta, dOmega];
  }

  function rk4Step(s, p, dt) {
    const { angle, angularVelocity } = s;
    const [d1, w1] = derivatives(angle, angularVelocity, p);

    const a2 = angle + 0.5 * dt * d1;
    const o2 = angularVelocity + 0.5 * dt * w1;
    const [d2, w2] = derivatives(a2, o2, p);

    const a3 = angle + 0.5 * dt * d2;
    const o3 = angularVelocity + 0.5 * dt * w2;
    const [d3, w3] = derivatives(a3, o3, p);

    const a4 = angle + dt * d3;
    const o4 = angularVelocity + dt * w3;
    const [d4, w4] = derivatives(a4, o4, p);

    let nextAngle = angle + (dt / 6) * (d1 + 2 * d2 + 2 * d3 + d4);
    let nextOmega = angularVelocity + (dt / 6) * (w1 + 2 * w2 + 2 * w3 + w4);

    while (nextAngle > Math.PI) nextAngle -= 2 * Math.PI;
    while (nextAngle < -Math.PI) nextAngle += 2 * Math.PI;

    const [_, nextAlpha] = derivatives(nextAngle, nextOmega, p);

    return { angle: nextAngle, angularVelocity: nextOmega, angularAcceleration: nextAlpha };
  }

  function calculateMetrics(s, p) {
    const { length, mass, gravity, initialAngle } = p;
    const { angle, angularVelocity } = s;
    const initRad = (Math.abs(initialAngle) * Math.PI) / 180;
    const linearAmp = length * initRad; // A = l · αₘ (в системі СІ: метри)

    let periodTheo = 0;
    if (gravity > 0 && length > 0) {
      periodTheo = 2 * Math.PI * Math.sqrt(length / gravity);
    }

    let periodExact = periodTheo;
    if (periodTheo > 0) {
      const a2 = initRad * initRad;
      const a4 = a2 * a2;
      const a6 = a4 * a2;
      const corr = 1 + (1 / 16) * a2 + (11 / 3072) * a4 + (173 / 737280) * a6;
      periodExact = periodTheo * corr;
    }

    const freq = periodExact > 0 ? 1 / periodExact : 0;
    const tangVel = length * angularVelocity;
    const ek = 0.5 * mass * tangVel * tangVel;
    const ep = mass * gravity * length * (1 - Math.cos(angle));
    const eTot = ek + ep;
    const tension = mass * gravity * Math.cos(angle) + mass * length * angularVelocity * angularVelocity;

    return {
      periodTheo, periodExact, freq, tangVel, ek, ep, eTot, tension, initRad, linearAmp
    };
  }

  // 3. Render Helpers
  function degToRad(d) { return (d * Math.PI) / 180; }
  function radToDeg(r) { return (r * 180) / Math.PI; }

  // DOM Elements
  const canvas = document.getElementById('pendulumCanvas');
  const ctx = canvas.getContext('2d');
  const plotCanvas = document.getElementById('plotCanvas');
  const plotCtx = plotCanvas.getContext('2d');

  // Initialize UI buttons
  function initPresetsUI() {
    const container = document.getElementById('containerPresetButtons');
    if (!container) return;
    container.innerHTML = '';
    presets.forEach(pr => {
      const btn = document.createElement('button');
      btn.className = "p-3 rounded-xl border text-left flex flex-col justify-between transition-all hover:scale-[1.02] bg-slate-800/90 border-slate-700 hover:border-indigo-500/60";
      btn.innerHTML = `<div class="text-xs font-bold text-indigo-400">${lang === 'ua' ? pr.nameUa : pr.nameEn}</div>`;
      btn.onclick = () => {
        params = { ...params, ...pr.p };
        resetSimulation();
        syncControlsToParams();
      };
      container.appendChild(btn);
    });

    const gContainer = document.getElementById('containerGravityButtons');
    if (!gContainer) return;
    gContainer.innerHTML = '';
    gravityPresets.forEach(gp => {
      const btn = document.createElement('button');
      btn.className = "p-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center transition bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700";
      btn.innerHTML = `<span>${gp.icon}</span><span>${gp.name}</span><span class="text-[10px] opacity-80">${gp.val}</span>`;
      btn.onclick = () => {
        params.gravity = gp.val;
        document.getElementById('numGravity').value = gp.val;
        resetSimulation();
      };
      gContainer.appendChild(btn);
    });
  }

  function syncControlsToParams() {
    document.getElementById('numLength').value = params.length;
    document.getElementById('rangeLength').value = params.length;
    document.getElementById('numAngle').value = params.initialAngle;
    document.getElementById('rangeAngle').value = params.initialAngle;
    document.getElementById('numMass').value = params.mass;
    document.getElementById('rangeMass').value = params.mass;
    document.getElementById('rangeDamping').value = params.damping;
    document.getElementById('txtDampingVal').innerText = params.damping.toFixed(2);
    document.getElementById('numGravity').value = params.gravity;

    const curLinearAmp = params.length * ((Math.abs(params.initialAngle) * Math.PI) / 180);
    const elLin = document.getElementById('numLinearAmp');
    if (elLin) elLin.value = curLinearAmp.toFixed(3);
  }

  function updateI18n() {
    const dict = i18n[lang];
    document.getElementById('txtAppTitle').innerText = dict.appTitle;
    document.getElementById('txtAppSubtitle').innerText = dict.appSubtitle;
    document.getElementById('txtBtnReset').innerText = dict.btnReset;
    document.getElementById('txtBtnGuide').innerText = dict.btnGuide;
    document.getElementById('txtHeaderPresets').innerText = dict.presetsHeader;
    document.getElementById('txtHeaderParams').innerText = dict.paramsHeader;
    document.getElementById('lblLength').innerText = dict.lblLength;
    document.getElementById('lblAngle').innerText = dict.lblAngle;
    document.getElementById('lblMass').innerText = dict.lblMass;
    document.getElementById('lblDamping').innerText = dict.lblDamping;
    document.getElementById('txtHeaderGravity').innerText = dict.gravityHeader;
    document.getElementById('txtHeaderVisuals').innerText = dict.visualsHeader;
    document.getElementById('txtDragTip').innerText = dict.dragTip;
    document.getElementById('txtLabelSpeed').innerText = dict.speedLabel;
    document.getElementById('txtBtnPlay').innerText = state.isRunning ? dict.btnPause : dict.btnStart;

    document.getElementById('cardTitleLengthAmp').innerText = dict.titleLengthAmp;
    const badge = document.getElementById('badgeLengthAmp');
    if (badge) badge.innerText = dict.badgeLengthAmp;
    document.getElementById('txtLabelL').innerText = dict.lblL;
    document.getElementById('txtLabelAmp').innerText = dict.lblAmp;
    const lblLinAmp = document.getElementById('txtLabelLinearAmp');
    if (lblLinAmp) lblLinAmp.innerText = dict.lblLinearAmp;
    const lblFormula = document.getElementById('lblControlAmpFormula');
    if (lblFormula) lblFormula.innerText = dict.lblControlAmpFormula;

    document.getElementById('cardTitlePeriod').innerText = dict.titlePeriod;
    document.getElementById('cardTitleFrequency').innerText = dict.titleFreq;
    document.getElementById('cardTitleEnergy').innerText = dict.titleEnergy;

    document.getElementById('txtLabelTExact').innerText = dict.lblTExact;
    document.getElementById('txtLabelTTheory').innerText = dict.lblTTheoretical;
    document.getElementById('txtLabelFreq').innerText = dict.lblFreq;
    document.getElementById('txtLabelVel').innerText = dict.lblVel;

    document.getElementById('txtHeaderStopwatch').innerText = dict.stopwatchTitle;
    document.getElementById('txtStopwatchDesc').innerText = dict.stopwatchDesc;
    document.getElementById('txtSwElapsed').innerText = dict.swElapsed;
    document.getElementById('txtSwOscLabel').innerText = dict.swOscLabel;
    document.getElementById('txtSwMeasuredTLabel').innerText = dict.swMeasuredT;
    document.getElementById('txtSwErrorLabel').innerText = dict.swError;

    document.getElementById('btnTabWave').innerText = dict.tabWave;
    document.getElementById('btnTabEnergy').innerText = dict.tabEnergy;
    document.getElementById('btnTabPhase').innerText = dict.tabPhase;
    document.getElementById('btnClearPlotData').innerText = dict.btnClear;
    document.getElementById('btnExportCsv').innerText = dict.btnExport;

    initPresetsUI();
  }

  function resetSimulation() {
    const rad = degToRad(params.initialAngle);
    state = {
      angle: rad,
      angularVelocity: 0,
      angularAcceleration: 0,
      time: 0,
      isRunning: false,
      speedMultiplier: state.speedMultiplier
    };
    history = [];
    trail = [];
    document.getElementById('iconPlay').classList.remove('hidden');
    document.getElementById('iconPause').classList.add('hidden');
    document.getElementById('txtBtnPlay').innerText = i18n[lang].btnStart;
    updateMetricsDisplay();
  }

  // Simulation Loop
  function loop(timestamp) {
    if (lastFrameTime === null) lastFrameTime = timestamp;
    let frameDt = (timestamp - lastFrameTime) / 1000;
    lastFrameTime = timestamp;

    if (frameDt <= 0 || isNaN(frameDt)) frameDt = 0.016;
    if (frameDt > 0.05) frameDt = 0.05;

    if (state.isRunning && !isDragging) {
      const effDt = frameDt * state.speedMultiplier;
      const subSteps = 10;
      const subDt = effDt / subSteps;

      for (let i = 0; i < subSteps; i++) {
        const stepRes = rk4Step(state, params, subDt);
        state.angle = stepRes.angle;
        state.angularVelocity = stepRes.angularVelocity;
        state.angularAcceleration = stepRes.angularAcceleration;
        state.time += subDt;
      }

      // Buffer plot data
      if (history.length === 0 || state.time - history[history.length - 1].time >= 0.04) {
        const m = calculateMetrics(state, params);
        history.push({
          time: state.time,
          angleDeg: radToDeg(state.angle),
          angularVelocity: state.angularVelocity,
          ek: m.ek, ep: m.ep, eTot: m.eTot
        });
        if (history.length > 300) history.shift();
      }
    }

    drawPendulum();
    drawPlots();
    updateMetricsDisplay();

    animFrameId = requestAnimationFrame(loop);
  }

  // Render Pendulum Canvas
  function drawPendulum() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;
    const isDarkTheme = theme === 'dark';

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = isDarkTheme ? '#0f172a' : '#f8fafc';
    ctx.fillRect(0, 0, w, h);

    // Grid
    if (displayOpts.showGrid) {
      ctx.strokeStyle = isDarkTheme ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= w; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y <= h; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    }

    const pivotX = w / 2;
    const pivotY = h * 0.18;
    const maxLenPx = h * 0.65;
    const pxPerMeter = Math.min(180, maxLenPx / Math.max(0.5, params.length));
    const stringPx = params.length * pxPerMeter;

    const bobX = pivotX + stringPx * Math.sin(state.angle);
    const bobY = pivotY + stringPx * Math.cos(state.angle);
    const bobRadius = Math.max(12, Math.min(28, 12 + params.mass * 1.6));

    // Trail
    if (displayOpts.showTrail) {
      trail.push({ x: bobX, y: bobY });
      if (trail.length > 60) trail.shift();
      if (trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);
        for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    } else {
      trail = [];
    }

    // Protractor Arc
    if (displayOpts.showProtractor) {
      const arcR = Math.min(100, stringPx * 0.45);
      ctx.save();
      ctx.translate(pivotX, pivotY);
      ctx.beginPath();
      ctx.arc(0, 0, arcR, 0, Math.PI);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = '10px sans-serif';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
      ctx.textAlign = 'center';
      for (let deg = -90; deg <= 90; deg += 30) {
        const rad = (deg * Math.PI) / 180 + Math.PI / 2;
        const tx = (arcR + 14) * Math.cos(rad);
        const ty = (arcR + 14) * Math.sin(rad);
        ctx.fillText(`${Math.abs(deg)}°`, tx, ty);
      }
      ctx.restore();
    }

    // String
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.strokeStyle = isDarkTheme ? '#cbd5e1' : '#475569';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Pivot Mount
    ctx.fillStyle = isDarkTheme ? '#334155' : '#94a3b8';
    ctx.fillRect(pivotX - 50, pivotY - 10, 100, 8);
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#6366f1';
    ctx.fill();

    // Forces & Velocity Vectors
    if (displayOpts.showVectors) {
      // Gravity Fg
      const fgLen = Math.min(80, params.mass * params.gravity * 3);
      drawArrow(ctx, bobX, bobY, bobX, bobY + fgLen, '#f59e0b', 'Fg');

      // Tension Ft
      const m = calculateMetrics(state, params);
      const ftLen = Math.min(90, Math.abs(m.tension) * 3);
      const ftX = bobX - ftLen * Math.sin(state.angle);
      const ftY = bobY - ftLen * Math.cos(state.angle);
      drawArrow(ctx, bobX, bobY, ftX, ftY, '#06b6d4', 'Ft');

      // Velocity v
      if (Math.abs(m.tangVel) > 0.02) {
        const vLen = m.tangVel * 30;
        const vx = bobX + vLen * Math.cos(state.angle);
        const vy = bobY - vLen * Math.sin(state.angle);
        drawArrow(ctx, bobX, bobY, vx, vy, '#10b981', 'v');
      }
    }

    // Bob Circle
    ctx.beginPath();
    ctx.arc(bobX, bobY, bobRadius, 0, 2 * Math.PI);
    const grad = ctx.createRadialGradient(bobX - bobRadius * 0.3, bobY - bobRadius * 0.3, bobRadius * 0.1, bobX, bobY, bobRadius);
    grad.addColorStop(0, '#818cf8');
    grad.addColorStop(1, '#3730a3');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Angle Badge
    const angleDeg = radToDeg(state.angle);
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = isDarkTheme ? '#0f172a' : '#ffffff';
    ctx.fillRect(bobX + 15, bobY - 10, 50, 20);
    ctx.fillStyle = isDarkTheme ? '#e2e8f0' : '#1e293b';
    ctx.fillText(`${angleDeg.toFixed(1)}°`, bobX + 20, bobY + 4);

    ctx.restore();
  }

  function drawArrow(ctx, fromX, fromY, toX, toY, color, label) {
    const headLen = 8;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.fill();

    ctx.font = '10px sans-serif';
    ctx.fillText(label, toX + 5, toY + 5);
    ctx.restore();
  }

  // Render Plots
  function drawPlots() {
    const rect = plotCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    if (plotCanvas.width !== rect.width * dpr || plotCanvas.height !== rect.height * dpr) {
      plotCanvas.width = rect.width * dpr;
      plotCanvas.height = rect.height * dpr;
    }

    plotCtx.save();
    plotCtx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;
    const isDarkTheme = theme === 'dark';

    plotCtx.clearRect(0, 0, w, h);
    plotCtx.fillStyle = isDarkTheme ? '#0f172a' : '#ffffff';
    plotCtx.fillRect(0, 0, w, h);

    const pad = 30;
    const plotW = w - 2 * pad;
    const plotH = h - 2 * pad;

    plotCtx.strokeStyle = isDarkTheme ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)';
    plotCtx.strokeRect(pad, pad, plotW, plotH);

    if (history.length < 2) {
      plotCtx.fillStyle = '#64748b';
      plotCtx.font = '12px sans-serif';
      plotCtx.textAlign = 'center';
      plotCtx.fillText('Start simulation to view real-time plots', w / 2, h / 2);
      plotCtx.restore();
      return;
    }

    if (activePlotTab === 'wave') {
      const tMin = history[0].time;
      const tMax = history[history.length - 1].time;
      const tRange = Math.max(0.1, tMax - tMin);
      let maxA = 10;
      history.forEach(d => { if (Math.abs(d.angleDeg) > maxA) maxA = Math.abs(d.angleDeg); });

      const zeroY = pad + plotH / 2;
      plotCtx.beginPath();
      plotCtx.moveTo(pad, zeroY); plotCtx.lineTo(pad + plotW, zeroY);
      plotCtx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      plotCtx.stroke();

      plotCtx.beginPath();
      history.forEach((d, i) => {
        const x = pad + ((d.time - tMin) / tRange) * plotW;
        const y = zeroY - (d.angleDeg / maxA) * (plotH / 2);
        if (i === 0) plotCtx.moveTo(x, y); else plotCtx.lineTo(x, y);
      });
      plotCtx.strokeStyle = '#6366f1';
      plotCtx.lineWidth = 2;
      plotCtx.stroke();

    } else if (activePlotTab === 'energy') {
      const tMin = history[0].time;
      const tMax = history[history.length - 1].time;
      const tRange = Math.max(0.1, tMax - tMin);
      let maxE = 0.001;
      history.forEach(d => { if (d.eTot > maxE) maxE = d.eTot; });

      // Ek (Emerald)
      plotCtx.beginPath();
      history.forEach((d, i) => {
        const x = pad + ((d.time - tMin) / tRange) * plotW;
        const y = pad + plotH - (d.ek / maxE) * plotH;
        if (i === 0) plotCtx.moveTo(x, y); else plotCtx.lineTo(x, y);
      });
      plotCtx.strokeStyle = '#10b981'; plotCtx.lineWidth = 2; plotCtx.stroke();

      // Ep (Sky)
      plotCtx.beginPath();
      history.forEach((d, i) => {
        const x = pad + ((d.time - tMin) / tRange) * plotW;
        const y = pad + plotH - (d.ep / maxE) * plotH;
        if (i === 0) plotCtx.moveTo(x, y); else plotCtx.lineTo(x, y);
      });
      plotCtx.strokeStyle = '#0284c7'; plotCtx.lineWidth = 2; plotCtx.stroke();

    } else if (activePlotTab === 'phase') {
      let maxA = 10, maxV = 1;
      history.forEach(d => {
        if (Math.abs(d.angleDeg) > maxA) maxA = Math.abs(d.angleDeg);
        if (Math.abs(d.angularVelocity) > maxV) maxV = Math.abs(d.angularVelocity);
      });

      const cx = pad + plotW / 2;
      const cy = pad + plotH / 2;

      plotCtx.beginPath();
      history.forEach((d, i) => {
        const x = cx + (d.angleDeg / maxA) * (plotW / 2);
        const y = cy - (d.angularVelocity / maxV) * (plotH / 2);
        if (i === 0) plotCtx.moveTo(x, y); else plotCtx.lineTo(x, y);
      });
      plotCtx.strokeStyle = '#8b5cf6'; plotCtx.lineWidth = 2; plotCtx.stroke();
    }

    plotCtx.restore();
  }

  // Update Live UI Cards
  function updateMetricsDisplay() {
    const m = calculateMetrics(state, params);
    const radUnit = i18n[lang].radUnit || (lang === 'ua' ? 'рад' : 'rad');

    document.getElementById('metricLength').innerText = `${params.length.toFixed(2)} ${i18n[lang].meters}`;
    document.getElementById('metricAmplitude').innerText = `${Math.abs(params.initialAngle).toFixed(1)}° (${m.initRad.toFixed(3)} ${radUnit})`;
    const elLinAmp = document.getElementById('metricLinearAmp');
    if (elLinAmp) elLinAmp.innerText = `${m.linearAmp.toFixed(3)} ${i18n[lang].meters}`;

    document.getElementById('metricPeriodExact').innerText = `${m.periodExact.toFixed(3)} с`;
    document.getElementById('metricPeriodTheoretical').innerText = `${m.periodTheo.toFixed(3)} с`;
    document.getElementById('metricFrequency').innerText = `${m.freq.toFixed(3)} Гц`;
    document.getElementById('metricVelocity').innerText = `${Math.abs(m.tangVel).toFixed(2)} м/с`;
    document.getElementById('metricTotalEnergy').innerText = `${m.eTot.toFixed(3)} Дж`;
    document.getElementById('metricTension').innerText = `Fₜ: ${m.tension.toFixed(2)} Н`;

    const maxE = Math.max(0.0001, m.eTot);
    const ekPct = Math.min(100, Math.max(0, (m.ek / maxE) * 100));
    const epPct = Math.min(100, Math.max(0, (m.ep / maxE) * 100));

    document.getElementById('barEk').style.width = `${ekPct}%`;
    document.getElementById('barEp').style.width = `${epPct}%`;
    document.getElementById('metricEkText').innerText = `Eₖ: ${m.ek.toFixed(3)} J`;
    document.getElementById('metricEpText').innerText = `Eₚ: ${m.ep.toFixed(3)} J`;
  }

  // Event Listeners Setup
  function bindEvents() {
    // Transport
    document.getElementById('btnPlayPause').onclick = () => {
      state.isRunning = !state.isRunning;
      if (state.isRunning) {
        document.getElementById('iconPlay').classList.add('hidden');
        document.getElementById('iconPause').classList.remove('hidden');
        document.getElementById('txtBtnPlay').innerText = i18n[lang].btnPause;
      } else {
        document.getElementById('iconPlay').classList.remove('hidden');
        document.getElementById('iconPause').classList.add('hidden');
        document.getElementById('txtBtnPlay').innerText = i18n[lang].btnStart;
      }
    };

    document.getElementById('btnStep').onclick = () => {
      if (state.isRunning) return;
      const res = rk4Step(state, params, 0.01);
      state.angle = res.angle;
      state.angularVelocity = res.angularVelocity;
      state.time += 0.01;
    };

    document.getElementById('btnResetPhysics').onclick = resetSimulation;
    document.getElementById('btnNavReset').onclick = resetSimulation;

    // Speed Buttons
    document.querySelectorAll('.btn-speed').forEach(btn => {
      btn.onclick = () => {
        state.speedMultiplier = parseFloat(btn.dataset.speed);
        document.querySelectorAll('.btn-speed').forEach(b => {
          b.classList.remove('bg-indigo-600', 'text-white');
          b.classList.add('bg-slate-800', 'text-slate-300');
        });
        btn.classList.add('bg-indigo-600', 'text-white');
        btn.classList.remove('bg-slate-800', 'text-slate-300');
      };
    });

    // Sliders & Inputs
    document.getElementById('rangeLength').oninput = (e) => {
      params.length = parseFloat(e.target.value);
      document.getElementById('numLength').value = params.length;
      syncControlsToParams();
    };
    document.getElementById('numLength').onchange = (e) => {
      params.length = Math.max(0.1, Math.min(5.0, parseFloat(e.target.value) || 0.1));
      document.getElementById('rangeLength').value = params.length;
      syncControlsToParams();
    };

    document.getElementById('rangeAngle').oninput = (e) => {
      params.initialAngle = parseFloat(e.target.value);
      document.getElementById('numAngle').value = params.initialAngle;
      if (!state.isRunning) state.angle = degToRad(params.initialAngle);
      syncControlsToParams();
    };
    document.getElementById('numAngle').onchange = (e) => {
      params.initialAngle = Math.max(-179, Math.min(179, parseFloat(e.target.value) || 0));
      document.getElementById('rangeAngle').value = params.initialAngle;
      if (!state.isRunning) state.angle = degToRad(params.initialAngle);
      syncControlsToParams();
    };

    const inputLinAmp = document.getElementById('numLinearAmp');
    if (inputLinAmp) {
      inputLinAmp.oninput = (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val) && val >= 0 && params.length > 0) {
          const rad = val / params.length;
          let deg = radToDeg(rad);
          if (deg > 179) deg = 179;
          const sign = params.initialAngle < 0 ? -1 : 1;
          params.initialAngle = sign * (Math.round(deg * 10) / 10);
          document.getElementById('numAngle').value = params.initialAngle;
          document.getElementById('rangeAngle').value = params.initialAngle;
          if (!state.isRunning) state.angle = degToRad(params.initialAngle);
          updateMetricsDisplay();
        }
      };
    }

    document.getElementById('rangeMass').oninput = (e) => {
      params.mass = parseFloat(e.target.value);
      document.getElementById('numMass').value = params.mass;
    };
    document.getElementById('numMass').onchange = (e) => {
      params.mass = Math.max(0.1, Math.min(10.0, parseFloat(e.target.value) || 0.1));
      document.getElementById('rangeMass').value = params.mass;
    };

    document.getElementById('rangeDamping').oninput = (e) => {
      params.damping = parseFloat(e.target.value);
      document.getElementById('txtDampingVal').innerText = params.damping.toFixed(2);
    };

    document.getElementById('numGravity').onchange = (e) => {
      params.gravity = Math.max(0, parseFloat(e.target.value) || 0);
    };

    // Toggles
    document.getElementById('toggleVectors').onclick = function () { displayOpts.showVectors = !displayOpts.showVectors; this.classList.toggle('bg-indigo-600'); };
    document.getElementById('toggleProtractor').onclick = function () { displayOpts.showProtractor = !displayOpts.showProtractor; this.classList.toggle('bg-indigo-600'); };
    document.getElementById('toggleRuler').onclick = function () { displayOpts.showRuler = !displayOpts.showRuler; this.classList.toggle('bg-indigo-600'); };
    document.getElementById('toggleTrail').onclick = function () { displayOpts.showTrail = !displayOpts.showTrail; this.classList.toggle('bg-indigo-600'); };
    document.getElementById('toggleGrid').onclick = function () { displayOpts.showGrid = !displayOpts.showGrid; this.classList.toggle('bg-indigo-600'); };

    // Language
    document.getElementById('btnLangEN').onclick = () => { lang = 'en'; updateI18n(); document.getElementById('btnLangEN').classList.add('bg-indigo-600', 'text-white'); document.getElementById('btnLangUA').classList.remove('bg-indigo-600', 'text-white'); };
    document.getElementById('btnLangUA').onclick = () => { lang = 'ua'; updateI18n(); document.getElementById('btnLangUA').classList.add('bg-indigo-600', 'text-white'); document.getElementById('btnLangEN').classList.remove('bg-indigo-600', 'text-white'); };

    // Theme
    document.getElementById('btnThemeToggle').onclick = () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.getElementById('iconSun').classList.toggle('hidden', theme === 'light');
      document.getElementById('iconMoon').classList.toggle('hidden', theme === 'dark');
    };

    // Modal
    document.getElementById('btnOpenGuide').onclick = () => document.getElementById('modalGuide').classList.remove('hidden');
    document.getElementById('btnCloseGuide').onclick = () => document.getElementById('modalGuide').classList.add('hidden');
    document.getElementById('btnCloseGuideBtn').onclick = () => document.getElementById('modalGuide').classList.add('hidden');

    // Stopwatch
    document.getElementById('btnSwStart').onclick = () => {
      swRunning = !swRunning;
      document.getElementById('btnSwStart').innerText = swRunning ? 'Пауза' : 'Старт';
      if (swRunning) {
        swInterval = setInterval(() => {
          swTime += 0.05;
          document.getElementById('swTimeDisplay').innerText = swTime.toFixed(2);
        }, 50);
      } else {
        clearInterval(swInterval);
      }
    };

    document.getElementById('btnSwLap').onclick = () => {
      swCount++;
      document.getElementById('swOscCountDisplay').innerText = `${swCount} / 10`;
      document.getElementById('swProgressBar').style.width = `${Math.min(100, (swCount / 10) * 100)}%`;
      if (swCount > 0) {
        const T = swTime / swCount;
        document.getElementById('swMeasuredTVal').innerText = `${T.toFixed(3)} с`;
        const m = calculateMetrics(state, params);
        const err = (Math.abs(T - m.periodExact) / m.periodExact) * 100;
        document.getElementById('swErrorVal').innerText = `${err.toFixed(2)}%`;
      }
    };

    document.getElementById('btnSwReset').onclick = () => {
      swTime = 0; swCount = 0; swRunning = false;
      clearInterval(swInterval);
      document.getElementById('swTimeDisplay').innerText = '0.00';
      document.getElementById('swOscCountDisplay').innerText = '0 / 10';
      document.getElementById('swProgressBar').style.width = '0%';
      document.getElementById('swMeasuredTVal').innerText = '—';
      document.getElementById('swErrorVal').innerText = '—';
      document.getElementById('btnSwStart').innerText = 'Старт';
    };

    // Plot Tabs
    document.getElementById('btnTabWave').onclick = () => activePlotTab = 'wave';
    document.getElementById('btnTabEnergy').onclick = () => activePlotTab = 'energy';
    document.getElementById('btnTabPhase').onclick = () => activePlotTab = 'phase';
    document.getElementById('btnClearPlotData').onclick = () => history = [];
    document.getElementById('btnExportCsv').onclick = () => {
      if (history.length === 0) return;
      let csv = 'Time(s),Angle(deg),AngularVelocity(rad/s),KineticEnergy(J),PotentialEnergy(J),TotalEnergy(J)\n';
      history.forEach(r => csv += `${r.time.toFixed(4)},${r.angleDeg.toFixed(4)},${r.angularVelocity.toFixed(4)},${r.ek.toFixed(6)},${r.ep.toFixed(6)},${r.eTot.toFixed(6)}\n`);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'pendulum_data.csv'; a.click();
    };

    // Canvas Bob Dragging
    canvas.onpointerdown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const pivotX = rect.width / 2;
      const pivotY = rect.height * 0.18;
      const maxLenPx = rect.height * 0.65;
      const pxPerMeter = Math.min(180, maxLenPx / Math.max(0.5, params.length));
      const stringPx = params.length * pxPerMeter;

      const bobX = pivotX + stringPx * Math.sin(state.angle);
      const bobY = pivotY + stringPx * Math.cos(state.angle);

      if (Math.hypot(clickX - bobX, clickY - bobY) <= 45) {
        isDragging = true;
        canvas.setPointerCapture(e.pointerId);
      }
    };

    canvas.onpointermove = (e) => {
      if (!isDragging) return;
      const rect = canvas.getBoundingClientRect();
      const dx = (e.clientX - rect.left) - (rect.width / 2);
      const dy = (e.clientY - rect.top) - (rect.height * 0.18);
      let newAngleRad = Math.atan2(dx, dy);
      let newAngleDeg = radToDeg(newAngleRad);
      if (newAngleDeg > 179) newAngleDeg = 179;
      if (newAngleDeg < -179) newAngleDeg = -179;

      params.initialAngle = newAngleDeg;
      document.getElementById('numAngle').value = newAngleDeg;
      document.getElementById('rangeAngle').value = newAngleDeg;
      const curLinA = params.length * ((Math.abs(newAngleDeg) * Math.PI) / 180);
      const elLin = document.getElementById('numLinearAmp');
      if (elLin) elLin.value = curLinA.toFixed(3);
      state.angle = degToRad(newAngleDeg);
      state.angularVelocity = 0;
      state.time = 0;
    };

    canvas.onpointerup = (e) => {
      if (isDragging) {
        isDragging = false;
        if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      }
    };
  }

  // Initialize Application on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    bindEvents();
    updateI18n();
    syncControlsToParams();
    requestAnimationFrame(loop);
  }

})();

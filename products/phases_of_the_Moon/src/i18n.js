/**
 * Localization dictionary for Moon Simulation
 * Ukrainian (uk) & English (en)
 */
(function(global) {
  const translations = {
    uk: {
      appTitle: "🌙 Фази Місяця та Обертання",
      appDesc: "3D-симуляція системи Земля–Місяць–Сонце з синхронізованими періодами обертання та спостереженням із довільної широти.",
      badgeSynodic: "🗓 29.53 доби",
      badgeRatio: "⚙️ 1 : 29.53",
      journalBtn: "📔 Журнал дій",
      
      // Top Quick Touch bar
      touchCamFree: "🌐 3D Огляд",
      touchCamEarth: "🌍 Земля",
      touchCamSurface: "🔭 Поверхня",
      touchZoomIn: "🔍+",
      touchZoomOut: "🔍−",

      // Phase Panel
      illumText: "Освітленість",
      horizonText: "Горизонт",
      aboveHorizon: "🟢 Над горизонтом",
      belowHorizon: "🔴 Під горизонтом",
      saveObsBtn: "💾 Зафіксувати в базі",
      savedNotice: "✓ Збережено!",

      // Controls
      ctrlPanelTitle: "🎛 Панель керування симуляцією",
      dayCycleLabel: "🗓 День циклу",
      daysUnit: "діб",
      stepMinus1d: "-1д",
      stepPlus1d: "+1д",
      stepMinus1h: "-1г",
      stepPlus1h: "+1г",
      stepMinus1dTitle: "Назад на 1 день",
      stepPlus1dTitle: "Вперед на 1 день",
      stepMinus1hTitle: "Назад на 1 годину",
      stepPlus1hTitle: "Вперед на 1 годину",

      latLabel: "🌐 Широта спостереження",
      northHemisphere: "Пн. ш.",
      southHemisphere: "Пд. ш.",
      presetKyiv: "Київ",
      presetEquator: "Екватор",
      presetLondon: "Лондон",
      presetSydney: "Сідней",
      presetNorthPole: "Пн. полюс",

      speedLabel: "⚡ Швидкість часу",
      earthRotationLabel: "⏳ Обертання Землі",
      rotationsCount: "обертів",
      timeLabel: "Час",
      nightLabel: "🌙 Ніч",
      dayLabel: "☀️ День",

      syncAstronomical: "Синхронізація: Астрономічна (1:29.53)",
      syncSlow: "Синхронізація: Оглядова",
      syncAstronomicalTitle: "Реальне астрономічне співвідношення: 29.53 обертів Землі за 1 синодичний місяць",
      syncSlowTitle: "Уповільнене обертання Землі для детального огляду карти",

      playStart: "▶ Старт",
      playPause: "⏸ Пауза",
      camEarthBtn: "Вид з Землі (полюс)",
      camSurfaceBtn: "Вид з поверхні",
      camFreeBtn: "Вільна камера",

      // Legend
      legendSun: "<b>Сонце</b> — джерело світла (+X), завжди освітлює 50% сфери Місяця.",
      legendEarth: "<b>Земля</b> — обертається навколо нахиленої осі (23.44°) зі швидкістю 1 оберт/добу.",
      legendMoon: "<b>Місяць</b> — орбітальний період ≈29.53 доби (синодичний місяць) з нахилом орбіти 5.14°.",
      legendObserver: "<b>Точка спостереження</b> — розташована на вибраній широті (від -90° до +90°).",
      legendOfflineNotice: "💾 Усі налаштування та журнали зберігаються локально в IndexedDB без потреби в інтернеті.",
      helpTitle: "Пояснення",

      // Phase names
      phaseNewMoon: "Новий місяць (Молодик)",
      phaseWaxingCrescent: "Молодий місяць (зростаючий серп)",
      phaseFirstQuarter: "Перша чверть",
      phaseWaxingGibbous: "Зростаючий Місяць (опуклий)",
      phaseFullMoon: "Повний місяць (Повня)",
      phaseWaningGibbous: "Спадний Місяць (опуклий)",
      phaseLastQuarter: "Остання чверть",
      phaseWaningCrescent: "Старий місяць (спадний серп)",

      // Journal Modal
      journalTitle: "📔 Локальний журнал астрономічних спостережень",
      journalThDate: "Дата запису",
      journalThPhase: "Фаза Місяця",
      journalThIllum: "Освітленість",
      journalThDay: "День циклу",
      journalThLat: "Широта (висота)",
      journalThActions: "Дії",
      journalEmpty: "Немає збережених спостережень. Натисніть «💾 Зафіксувати в базі», щоб зберегти поточний стан Місяця та Землі.",
      journalExportBtn: "📥 Експорт у JSON",
      journalClearBtn: "🗑 Очистити базу",
      journalDbFooter: "Автономна база даних: IndexedDB",
      journalRestoreBtn: "Відкрити",
      journalConfirmClear: "Очистити всі збережені астрономічні спостереження з локальної бази даних?",
      obsNotePrefix: "Спостереження на широті",
      
      // Toggle controls panel
      hidePanelBtn: "⬇ Сховати панель",
      showPanelBtn: "⬆ Панель керування",
      togglePanelTitle: "Приховати або показати нижню панель керування"
    },

    en: {
      appTitle: "🌙 Moon Phases & Earth Rotation",
      appDesc: "3D simulation of the Earth–Moon–Sun system with synchronized orbital cycles and surface observer viewpoint from any latitude.",
      badgeSynodic: "🗓 29.53 days",
      badgeRatio: "⚙️ 1 : 29.53",
      journalBtn: "📔 Observation Log",

      // Top Quick Touch bar
      touchCamFree: "🌐 3D View",
      touchCamEarth: "🌍 Earth Pole",
      touchCamSurface: "🔭 Surface",
      touchZoomIn: "🔍+",
      touchZoomOut: "🔍−",

      // Phase Panel
      illumText: "Illumination",
      horizonText: "Horizon",
      aboveHorizon: "🟢 Above horizon",
      belowHorizon: "🔴 Below horizon",
      saveObsBtn: "💾 Save to Database",
      savedNotice: "✓ Saved!",

      // Controls
      ctrlPanelTitle: "🎛 Simulation Controls Panel",
      dayCycleLabel: "🗓 Cycle Day",
      daysUnit: "days",
      stepMinus1d: "-1d",
      stepPlus1d: "+1d",
      stepMinus1h: "-1h",
      stepPlus1h: "+1h",
      stepMinus1dTitle: "Step back 1 day",
      stepPlus1dTitle: "Step forward 1 day",
      stepMinus1hTitle: "Step back 1 hour",
      stepPlus1hTitle: "Step forward 1 hour",

      latLabel: "🌐 Observer Latitude",
      northHemisphere: "N",
      southHemisphere: "S",
      presetKyiv: "Kyiv",
      presetEquator: "Equator",
      presetLondon: "London",
      presetSydney: "Sydney",
      presetNorthPole: "North Pole",

      speedLabel: "⚡ Time Speed",
      earthRotationLabel: "⏳ Earth Rotation",
      rotationsCount: "rotations",
      timeLabel: "Time",
      nightLabel: "🌙 Night",
      dayLabel: "☀️ Day",

      syncAstronomical: "Sync: Astronomical (1:29.53)",
      syncSlow: "Sync: Visual / Slow",
      syncAstronomicalTitle: "True astronomical ratio: 29.53 Earth rotations per 1 synodic month",
      syncSlowTitle: "Relaxed Earth rotation for detailed map inspection",

      playStart: "▶ Start",
      playPause: "⏸ Pause",
      camEarthBtn: "Earth View (Pole)",
      camSurfaceBtn: "Surface View",
      camFreeBtn: "Free 3D Camera",

      // Legend
      legendSun: "<b>Sun</b> — Light source (+X), always illuminates 50% of the Moon's sphere.",
      legendEarth: "<b>Earth</b> — Rotates around its tilted axis (23.44°) at 1 rotation/solar day.",
      legendMoon: "<b>Moon</b> — Orbital period ≈29.53 days (synodic month) with 5.14° orbit inclination.",
      legendObserver: "<b>Observer marker</b> — Located at the selected latitude (-90° to +90°).",
      legendOfflineNotice: "💾 All settings and observations are stored locally in IndexedDB without internet.",
      helpTitle: "Help & Legend",

      // Phase names
      phaseNewMoon: "New Moon",
      phaseWaxingCrescent: "Waxing Crescent",
      phaseFirstQuarter: "First Quarter",
      phaseWaxingGibbous: "Waxing Gibbous",
      phaseFullMoon: "Full Moon",
      phaseWaningGibbous: "Waning Gibbous",
      phaseLastQuarter: "Last Quarter",
      phaseWaningCrescent: "Waning Crescent",

      // Journal Modal
      journalTitle: "📔 Local Astronomical Observation Journal",
      journalThDate: "Recorded Date",
      journalThPhase: "Lunar Phase",
      journalThIllum: "Illumination",
      journalThDay: "Cycle Day",
      journalThLat: "Latitude (Altitude)",
      journalThActions: "Actions",
      journalEmpty: "No observations saved yet. Click «💾 Save to Database» to record current Moon and Earth state.",
      journalExportBtn: "📥 Export to JSON",
      journalClearBtn: "🗑 Clear Database",
      journalDbFooter: "Autonomous database: IndexedDB",
      journalRestoreBtn: "View",
      journalConfirmClear: "Clear all saved astronomical observations from local database?",
      obsNotePrefix: "Observation at latitude",

      // Toggle controls panel
      hidePanelBtn: "⬇ Hide Panel",
      showPanelBtn: "⬆ Control Panel",
      togglePanelTitle: "Hide or show the bottom control panel"
    }
  };

  let currentLang = 'uk';

  function setLanguage(lang) {
    if (lang === 'en' || lang === 'uk') {
      currentLang = lang;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('moonsim_lang', lang);
      }
      applyTranslations();
      if (typeof global.onLanguageChanged === 'function') {
        global.onLanguageChanged(currentLang);
      }
    }
  }

  function getLanguage() {
    return currentLang;
  }

  function t(key) {
    return (translations[currentLang] && translations[currentLang][key]) || 
           (translations['uk'] && translations['uk'][key]) || 
           key;
  }

  function applyTranslations() {
    const lang = currentLang;
    const tr = translations[lang] || translations.uk;

    // Document Title
    document.title = lang === 'en' ? "Moon Phases — 3D Simulation" : "Фази Місяця — 3D симуляція";

    // Text & HTML elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      if (tr[k] !== undefined) {
        el.textContent = tr[k];
      }
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const k = el.getAttribute('data-i18n-html');
      if (tr[k] !== undefined) {
        el.innerHTML = tr[k];
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const k = el.getAttribute('data-i18n-title');
      if (tr[k] !== undefined) {
        el.setAttribute('title', tr[k]);
      }
    });

    // Language buttons active state
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const bLang = btn.getAttribute('data-lang');
      btn.classList.toggle('active', bLang === lang);
    });
  }

  // Load saved language on startup
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('moonsim_lang');
    if (saved === 'en' || saved === 'uk') {
      currentLang = saved;
    }
  }

  const MoonI18n = {
    translations,
    setLanguage,
    getLanguage,
    t,
    applyTranslations
  };

  global.MoonI18n = MoonI18n;
})(typeof window !== 'undefined' ? window : this);

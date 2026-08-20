/**
 * Модуль інтернаціоналізації (i18n) — Українська (uk) та Англійська (en) мови
 */

export const TRANSLATIONS = {
  uk: {
    appTitle: 'Земля навколо Сонця',
    appSubtitle: '3D-модель орбіти, нахилу осі та зміни пір року',
    metaTitle: 'Земля навколо Сонця — 3D-модель та зміна пір року',
    metaDescription: 'Інтерактивна 3D-модель руху Землі навколо Сонця, нахилу осі 23.44°, рівнодень, сонцестоянь та зміни пір року.',

    // Швидкі кнопки сонцестоянь/рівнодень
    jumpSummer: '☀️ Літнє сонцестояння',
    jumpAutumn: '🍂 Осіннє рівнодення',
    jumpWinter: '❄️ Зимове сонцестояння',
    jumpSpring: '🌱 Весняне рівнодення',
    jumpSummerTitle: '21 червня',
    jumpAutumnTitle: '23 вересня',
    jumpWinterTitle: '21 грудня',
    jumpSpringTitle: '20 березня',

    // Теорія
    theoryBtn: 'Теорія та пояснення',
    theoryBtnTitle: 'Дізнатися чому насправді змінюються пори року',

    // Панель пір року
    currentSeasonsTitle: 'Поточні пори року',
    northHemisphere: 'Північна півкуля',
    southHemisphere: 'Південна півкуля',
    seasonSpring: 'Весна',
    seasonSummer: 'Літо',
    seasonAutumn: 'Осінь',
    seasonWinter: 'Зима',
    seasonNeutral: 'Вічне рівнодення',
    noSeasonsTitle: 'Без змін пір року',
    noSeasonsDesc: 'При нульовому нахилі осі день завжди дорівнює ночі, а клімат незмінний увесь рік.',

    northSpringDesc: 'Збільшення тривалості дня, підвищення кута падіння сонячних променів, пробудження природи.',
    northSummerDesc: 'Максимальний кут падіння променів, найдовші дні та максимальне нагрівання поверхні.',
    northAutumnDesc: 'Скорочення світлового дня, зниження висоти Сонця та поступове охолодження.',
    northWinterDesc: 'Промені падають під косим кутом, найкоротші дні, мінімальна кількість тепла.',

    southSpringDesc: 'Початок астрономічної весни у Південній півкулі, подовження світлового дня.',
    southSummerDesc: 'Південь повернутий до Сонця: тривалий світловий день та висока інсоляція.',
    southAutumnDesc: 'Зниження кута падіння променів та настання прохолоди на Півдні.',
    southWinterDesc: 'Південна зима: косі промені Сонця, короткі дні та низькі температури.',

    // Інспектор інсоляції
    insolationTitle: 'Сонячна інсоляція',
    declinationLabel: 'Схилення Сонця (δ):',
    sunAltitudeLabel: 'Висота Сонця опівдні:',
    dayLengthLabel: 'Тривалість дня:',
    aboveHorizon: 'над горизонтом',
    polarDay: '24 год (Полярний день ☀️)',
    polarNight: '0 год (Полярна ніч 🌙)',
    hoursFormat: '{h} год {m} хв',
    dayOfYearTag: 'День року: {day} / 365',
    selectLatitudeLabel: 'Обрати широту спостереження:',

    // Ракурси камери
    cameraTitle: 'Ракурс камери',
    camFree: 'Вільний огляд',
    camFollow: 'Крупно Земля',
    camNorthPole: 'З Півночі (згори)',
    camEcliptic: 'Площина орбіти',

    // Нахил осі
    axialTiltTitle: 'Нахил осі Землі',
    tiltRealBtn: '23.44° (Реальна)',
    tiltRealBtnTitle: 'Справжній нахил осі Землі',
    tiltZeroBtn: '0° (Без сезонів)',
    tiltZeroBtnTitle: 'Подивитися що буде якщо нахил 0°',

    // Шари
    visualLayersTitle: 'Візуальні шари',
    layerOrbitArcs: 'Орбітальні дуги пір року',
    layerLatitudes: 'Екватор, тропіки та полярні кола',
    layerMarkers: 'Маркери сонцестоянь',
    layerAtmosphere: 'Блакитне сяйво атмосфери',

    // Таймлайн та керування
    stepBackTitle: 'Крок назад на 5 днів',
    playPauseTitle: 'Старт / Пауза',
    stepForwardTitle: 'Крок вперед на 5 днів',

    // Модальне вікно теорії
    theoryModalTitle: 'Чому насправді змінюються пори року?',
    theoryMyth: '❌ Головний міф: Багато хто вважає, що літо настає через те, що Земля стає ближчою до Сонця. Це хибно! Насправді орбіта Землі майже ідеально кругла, а в січні (під час зими в Україні) Земля перебуває у перигелії — найближчій точці до Сонця!',
    theorySection1Title: '🌍 1. Нахил осі обертання (23.44°)',
    theorySection1Text: 'Вісь обертання Землі нахилена відносно перпендикуляра до площини її орбіти (екліптики) під кутом приблизно <strong>23.44°</strong>. Цей напрямок залишається постійним у просторі протягом року (орієнтований на Полярну зірку).',
    theorySection2Title: '📐 2. Кут падіння сонячних променів',
    theorySection2Text: 'Коли півкуля нахилена <em>до</em> Сонця (як Північна в червні), промені падають під прямим або майже прямим кутом. Енергія концентрується на меншій площі, викликаючи інтенсивне нагрівання — настає <strong>літо</strong>. Коли півкуля нахилена <em>від</em> Сонця (у грудні), промені падають косо, розсіюються на більшу площу і проходять довший шлях крізь атмосферу — настає <strong>зима</strong>.',
    theorySection3Title: '⏳ 3. Тривалість світлового дня',
    theorySection3Text: 'Влітку через нахил осі Сонце довше перебуває над горизонтом (у Києві до 16.5 годин), що дає поверхні більше часу для нагрівання. Взимку день триває лише ~8 годин, і нічне охолодження переважає денне прогрівання.',
    theorySection4Title: '⚖️ 4. Рівнодення та сонцестояння',
    theorySection4Text: '<strong>21 червня (Літнє сонцестояння):</strong> Сонце в зеніті над Тропіком Рака (23.44° N).<br><strong>23 вересня (Осіннє рівнодення):</strong> Сонце в зеніті над Екватором (день = ніч = 12 год).<br><strong>21 грудня (Зимове сонцестояння):</strong> Сонце в зеніті над Тропіком Козорога (23.44° S).<br><strong>20 березня (Весняне рівнодення):</strong> Сонце знову в зеніті над Екватором.',

    // Астрономічні точки (для 3D білбордів)
    points: {
      summer: { name: 'Літнє сонцестояння', date: '21 червня' },
      autumn: { name: 'Осіннє рівнодення', date: '22–23 вересня' },
      winter: { name: 'Зимове сонцестояння', date: '21–22 грудня' },
      spring: { name: 'Весняне рівнодення', date: '20–21 березня' }
    },

    // Полюси
    northPoleLabel: 'N (Пн)',
    southPoleLabel: 'S (Пд)',

    // Місяці
    months: [
      { name: 'Січень', short: 'Січ', genitive: 'січня' },
      { name: 'Лютий', short: 'Лют', genitive: 'лютого' },
      { name: 'Березень', short: 'Бер', genitive: 'березня' },
      { name: 'Квітень', short: 'Кві', genitive: 'квітня' },
      { name: 'Травень', short: 'Тра', genitive: 'травня' },
      { name: 'Червень', short: 'Чер', genitive: 'червня' },
      { name: 'Липень', short: 'Лип', genitive: 'липня' },
      { name: 'Серпень', short: 'Сер', genitive: 'серпня' },
      { name: 'Вересень', short: 'Вер', genitive: 'вересня' },
      { name: 'Жовтень', short: 'Жов', genitive: 'жовтня' },
      { name: 'Листопад', short: 'Лис', genitive: 'листопада' },
      { name: 'Грудень', short: 'Гру', genitive: 'грудня' }
    ],

    // Пресети широт
    latitudePresets: [
      { name: 'Київ (Україна)', lat: 50.45, icon: '🇺🇦' },
      { name: 'Північне полярне коло', lat: 66.56, icon: '❄️' },
      { name: 'Тропік Рака (Північний)', lat: 23.44, icon: '☀️' },
      { name: 'Екватор', lat: 0.0, icon: '🌴' },
      { name: 'Тропік Козорога (Південний)', lat: -23.44, icon: '🏝️' },
      { name: 'Сідней (Австралія)', lat: -33.86, icon: '🦘' },
      { name: 'Південне полярне коло', lat: -66.56, icon: '🐧' }
    ]
  },

  en: {
    appTitle: 'Earth Around the Sun',
    appSubtitle: '3D Model of Orbit, Axial Tilt & Seasons',
    metaTitle: 'Earth Around the Sun — 3D Model & Seasons Simulation',
    metaDescription: 'Interactive 3D simulation of Earth orbiting the Sun, 23.44° axial tilt, equinoxes, solstices and the cause of seasons.',

    // Solstices & Equinoxes Jump Buttons
    jumpSummer: '☀️ Summer Solstice',
    jumpAutumn: '🍂 Autumnal Equinox',
    jumpWinter: '❄️ Winter Solstice',
    jumpSpring: '🌱 Vernal Equinox',
    jumpSummerTitle: 'June 21',
    jumpAutumnTitle: 'September 23',
    jumpWinterTitle: 'December 21',
    jumpSpringTitle: 'March 20',

    // Theory
    theoryBtn: 'Theory & Guide',
    theoryBtnTitle: 'Learn why seasons actually change',

    // Seasons panel
    currentSeasonsTitle: 'Current Seasons',
    northHemisphere: 'Northern Hemisphere',
    southHemisphere: 'Southern Hemisphere',
    seasonSpring: 'Spring',
    seasonSummer: 'Summer',
    seasonAutumn: 'Autumn',
    seasonWinter: 'Winter',
    seasonNeutral: 'Perpetual Equinox',
    noSeasonsTitle: 'No Season Variations',
    noSeasonsDesc: 'With a 0° axial tilt, day and night are always equal (12h), and climate remains uniform all year round.',

    northSpringDesc: 'Increasing day length, steeper solar ray angle, warming temperature and awakening nature.',
    northSummerDesc: 'Maximum sun elevation, longest daylight hours, and peak surface heating.',
    northAutumnDesc: 'Shortening daylight, decreasing sun elevation, and gradual cooling.',
    northWinterDesc: 'Rays strike obliquely, shortest days of the year, minimum solar energy received.',

    southSpringDesc: 'Astronomical spring arrives in the Southern Hemisphere, increasing day length.',
    southSummerDesc: 'South is tilted toward the Sun: prolonged daylight and peak solar radiation.',
    southAutumnDesc: 'Sun angle declines, bringing cooler temperatures and shorter days to the South.',
    southWinterDesc: 'Southern winter: oblique sun rays, short days, and colder temperatures.',

    // Insolation Inspector
    insolationTitle: 'Solar Insolation',
    declinationLabel: 'Solar Declination (δ):',
    sunAltitudeLabel: 'Noon Sun Altitude:',
    dayLengthLabel: 'Day Length:',
    aboveHorizon: 'above horizon',
    polarDay: '24h (Polar Day ☀️)',
    polarNight: '0h (Polar Night 🌙)',
    hoursFormat: '{h}h {m}m',
    dayOfYearTag: 'Day of year: {day} / 365',
    selectLatitudeLabel: 'Select observation latitude:',

    // Camera views
    cameraTitle: 'Camera View',
    camFree: 'Free Orbit',
    camFollow: 'Follow Earth',
    camNorthPole: 'North Pole (Top)',
    camEcliptic: 'Ecliptic Plane',

    // Axial tilt
    axialTiltTitle: "Earth's Axial Tilt",
    tiltRealBtn: '23.44° (Real Earth)',
    tiltRealBtnTitle: "Earth's actual axial tilt",
    tiltZeroBtn: '0° (No Seasons)',
    tiltZeroBtnTitle: 'Simulate zero axial tilt',

    // Visual layers
    visualLayersTitle: 'Visual Layers',
    layerOrbitArcs: 'Orbital Season Arcs',
    layerLatitudes: 'Equator, Tropics & Polar Circles',
    layerMarkers: 'Solstice & Equinox Markers',
    layerAtmosphere: 'Atmosphere Glow',

    // Timeline & playback
    stepBackTitle: 'Step back 5 days',
    playPauseTitle: 'Play / Pause',
    stepForwardTitle: 'Step forward 5 days',

    // Theory Modal
    theoryModalTitle: 'Why Do Seasons Actually Change?',
    theoryMyth: "❌ Common Myth: Many people believe summer occurs because Earth gets closer to the Sun. That is incorrect! Earth's orbit is nearly a perfect circle, and in January (during winter in Ukraine and Europe), Earth is actually at perihelion — its closest point to the Sun!",
    theorySection1Title: '🌍 1. Axial Tilt (23.44°)',
    theorySection1Text: "Earth's rotational axis is tilted relative to the perpendicular of its orbital plane (ecliptic) at an angle of approximately <strong>23.44°</strong>. This spatial orientation remains fixed throughout the year (pointing toward Polaris).",
    theorySection2Title: '📐 2. Angle of Sunlight',
    theorySection2Text: 'When a hemisphere is tilted <em>toward</em> the Sun (like the Northern Hemisphere in June), rays strike at a direct or steep angle. Energy concentrates on a smaller surface area, causing intense warming — creating <strong>summer</strong>. When tilted <em>away</em> (in December), rays hit obliquely, spreading over a larger area and passing through more atmosphere — creating <strong>winter</strong>.',
    theorySection3Title: '⏳ 3. Day Length Duration',
    theorySection3Text: 'In summer, axial tilt causes the Sun to stay above the horizon longer (up to 16.5 hours in Kyiv/London), providing more time to heat the surface. In winter, daylight lasts only ~8 hours, and nocturnal cooling dominates daytime warming.',
    theorySection4Title: '⚖️ 4. Solstices and Equinoxes',
    theorySection4Text: '<strong>June 21 (Summer Solstice):</strong> Sun is directly overhead at the Tropic of Cancer (23.44° N).<br><strong>September 23 (Autumnal Equinox):</strong> Sun is directly overhead at the Equator (day = night = 12h everywhere).<br><strong>December 21 (Winter Solstice):</strong> Sun is directly overhead at the Tropic of Capricorn (23.44° S).<br><strong>March 20 (Vernal Equinox):</strong> Sun is again directly overhead at the Equator.',

    // Astronomical Points
    points: {
      summer: { name: 'Summer Solstice', date: 'June 21' },
      autumn: { name: 'Autumnal Equinox', date: 'Sept 22–23' },
      winter: { name: 'Winter Solstice', date: 'Dec 21–22' },
      spring: { name: 'Vernal Equinox', date: 'March 20–21' }
    },

    // Poles
    northPoleLabel: 'N (North)',
    southPoleLabel: 'S (South)',

    // Months
    months: [
      { name: 'January', short: 'Jan', genitive: 'January' },
      { name: 'February', short: 'Feb', genitive: 'February' },
      { name: 'March', short: 'Mar', genitive: 'March' },
      { name: 'April', short: 'Apr', genitive: 'April' },
      { name: 'May', short: 'May', genitive: 'May' },
      { name: 'June', short: 'Jun', genitive: 'June' },
      { name: 'July', short: 'Jul', genitive: 'July' },
      { name: 'August', short: 'Aug', genitive: 'August' },
      { name: 'September', short: 'Sep', genitive: 'September' },
      { name: 'October', short: 'Oct', genitive: 'October' },
      { name: 'November', short: 'Nov', genitive: 'November' },
      { name: 'December', short: 'Dec', genitive: 'December' }
    ],

    // Latitude presets
    latitudePresets: [
      { name: 'Kyiv (Ukraine)', lat: 50.45, icon: '🇺🇦' },
      { name: 'Arctic Circle', lat: 66.56, icon: '❄️' },
      { name: 'Tropic of Cancer (North)', lat: 23.44, icon: '☀️' },
      { name: 'Equator', lat: 0.0, icon: '🌴' },
      { name: 'Tropic of Capricorn (South)', lat: -23.44, icon: '🏝️' },
      { name: 'Sydney (Australia)', lat: -33.86, icon: '🦘' },
      { name: 'Antarctic Circle', lat: -66.56, icon: '🐧' }
    ]
  }
};

let currentLang = 'uk';

export function getLanguage() {
  return currentLang;
}

export function setLanguage(lang) {
  if (lang === 'en' || lang === 'uk') {
    currentLang = lang;
    try {
      localStorage.setItem('earth_seasons_lang', lang);
    } catch (e) {}
  }
}

export function initLanguage() {
  try {
    const saved = localStorage.getItem('earth_seasons_lang');
    if (saved === 'en' || saved === 'uk') {
      currentLang = saved;
    }
  } catch (e) {}
  return currentLang;
}

export function t(key) {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.uk;
  return dict[key] !== undefined ? dict[key] : (TRANSLATIONS.uk[key] || key);
}

/**
 * Астрономічні та геометричні константи для 3D-симуляції
 */

export const CONSTANTS = {
  // Розміри небесних тіл
  SUN_RADIUS: 3.2,
  EARTH_RADIUS: 1.6,
  MOON_RADIUS: 0.43,
  
  // Орбітальні параметри (масштабовані для наочної візуалізації)
  ORBIT_RADIUS_X: 20.0,
  ORBIT_RADIUS_Z: 20.0, // Квазі-кругова орбіта (ексцентриситет Землі в реальності малий: 0.0167)
  
  // Реальний нахил осі обертання Землі (23.44 градуси)
  DEFAULT_AXIAL_TILT_DEG: 23.44,
  get DEFAULT_AXIAL_TILT_RAD() {
    return (this.DEFAULT_AXIAL_TILT_DEG * Math.PI) / 180;
  },

  // Швидкості анімації за замовчуванням
  DEFAULT_ORBIT_SPEED_DEG_PER_SEC: 12.0, // градусів на секунду при швидкості 1x
  EARTH_SELF_ROTATION_SPEED: 1.5, // радіан на секунду (обертання навколо власної осі)
  SUN_SELF_ROTATION_SPEED: 0.15,

  // Кольори
  COLORS: {
    BACKGROUND: 0x02040a,
    SUN_CORE: 0xffdd44,
    SUN_GLOW: 0xff9900,
    SPACE_STARS: 0xffffff,
    EARTH_OCEAN: 0x1a4b8c,
    EARTH_LAND: 0x2e7d32,
    EARTH_ICE: 0xf0f6fc,
    AXIS_LINE: 0xffffff,
    EQUATOR_LINE: 0xfacc15,
    TROPIC_LINE: 0xf97316,
    POLAR_CIRCLE: 0x38bdf8,
    SOLAR_RAY: 0xffe066,
    SEASONS: {
      SPRING: 0x4ade80, // Зелений
      SUMMER: 0xfbbf24, // Золотистий
      AUTUMN: 0xf97316, // Оранжевий
      WINTER: 0x38bdf8  // Небесно-блакитний
    }
  },

  // Кардинальні астрономічні точки орбіти (у градусах кута θ)
  // Кут 0° відповідає літньому сонцестоянню (Північний полюс максимальне нахилений до Сонця)
  ASTRONOMICAL_POINTS: {
    SUMMER_SOLSTICE: {
      angle: 0,
      nameUk: 'Літнє сонцестояння',
      dateUk: '21 червня',
      dayOfYear: 172,
      descriptionUk: 'Найдовший день у Північній півкулі. Сонце в зеніті над Північним тропіком (23.44° N).'
    },
    AUTUMN_EQUINOX: {
      angle: 90,
      nameUk: 'Осіннє рівнодення',
      dateUk: '22–23 вересня',
      dayOfYear: 265,
      descriptionUk: 'День дорівнює ночі по всій планеті (по 12 годин). Сонце в зеніті над екватором.'
    },
    WINTER_SOLSTICE: {
      angle: 180,
      nameUk: 'Зимове сонцестояння',
      dateUk: '21–22 грудня',
      dayOfYear: 355,
      descriptionUk: 'Найкоротший день у Північній півкулі. Сонце в зеніті над Південним тропіком (23.44° S).'
    },
    SPRING_EQUINOX: {
      angle: 270,
      nameUk: 'Весняне рівнодення',
      dateUk: '20–21 березня',
      dayOfYear: 79,
      descriptionUk: 'День дорівнює ночі по всій планеті. Початок астрономічної весни на Півночі.'
    }
  },

  // Місяці року (365 днів)
  MONTHS: [
    { name: 'Січень', days: 31, startDay: 1 },
    { name: 'Лютий', days: 28, startDay: 32 },
    { name: 'Березень', days: 31, startDay: 60 },
    { name: 'Квітень', days: 30, startDay: 91 },
    { name: 'Травень', days: 31, startDay: 121 },
    { name: 'Червень', days: 30, startDay: 152 },
    { name: 'Липень', days: 31, startDay: 182 },
    { name: 'Серпень', days: 31, startDay: 213 },
    { name: 'Вересень', days: 30, startDay: 244 },
    { name: 'Жовтень', days: 31, startDay: 274 },
    { name: 'Листопад', days: 30, startDay: 305 },
    { name: 'Грудень', days: 31, startDay: 335 }
  ],

  // Пресети широт для демонстрації освітленості
  LATITUDE_PRESETS: [
    { name: 'Київ (Україна)', lat: 50.45, icon: '🇺🇦' },
    { name: 'Північне полярне коло', lat: 66.56, icon: '❄️' },
    { name: 'Тропік Рака (Північний)', lat: 23.44, icon: '☀️' },
    { name: 'Екватор', lat: 0.0, icon: '🌴' },
    { name: 'Тропік Козорога (Південний)', lat: -23.44, icon: '🏝️' },
    { name: 'Сідней (Австралія)', lat: -33.86, icon: '🦘' },
    { name: 'Південне полярне коло', lat: -66.56, icon: '🐧' }
  ]
};

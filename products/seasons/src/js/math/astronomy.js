/**
 * Астрономічні та тригонометричні обчислення
 */
import { CONSTANTS } from '../constants.js';
import { getLanguage, TRANSLATIONS } from '../i18n.js';

/**
 * Розрахунок 3D-координат Землі на орбіті
 * @param {number} deg - Кут орбіти у градусах (0° = літнє сонцестояння)
 * @param {number} radius - Радіус орбіти
 * @returns {{x: number, y: number, z: number}}
 */
export function getOrbitPosition(deg, radius = CONSTANTS.ORBIT_RADIUS_X) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: radius * Math.cos(rad),
    y: 0,
    z: -radius * Math.sin(rad)
  };
}

/**
 * Одиничний вектор осі обертання Землі у світових координатах
 * @param {number} tiltDeg - Кут нахилу осі в градусах
 * @returns {{x: number, y: number, z: number}}
 */
export function getNorthAxisVector(tiltDeg = CONSTANTS.DEFAULT_AXIAL_TILT_DEG) {
  const tiltRad = (tiltDeg * Math.PI) / 180;
  return {
    x: -Math.sin(tiltRad),
    y: Math.cos(tiltRad),
    z: 0
  };
}

/**
 * Розрахунок сонячного схилення (Solar Declination δ) в градусах
 * @param {number} orbitDeg - Орбітальний кут (0° = 21 червня)
 * @param {number} tiltDeg - Нахил осі
 * @returns {number} Схилення від -tiltDeg до +tiltDeg
 */
export function getSolarDeclination(orbitDeg, tiltDeg = CONSTANTS.DEFAULT_AXIAL_TILT_DEG) {
  const rad = (orbitDeg * Math.PI) / 180;
  return tiltDeg * Math.cos(rad);
}

/**
 * Коефіцієнт експозиції Північної півкулі до Сонця
 * @param {number} orbitDeg
 * @param {number} tiltDeg
 * @returns {number} [-1.0 .. +1.0]
 */
export function getNorthExposureFactor(orbitDeg, tiltDeg = CONSTANTS.DEFAULT_AXIAL_TILT_DEG) {
  if (tiltDeg === 0) return 0;
  const declination = getSolarDeclination(orbitDeg, tiltDeg);
  return Math.max(-1, Math.min(1, declination / tiltDeg));
}

/**
 * Визначення пір року для обох півкуль
 * @param {number} orbitDeg - Орбітальний кут
 * @returns {{
 *   northSeason: 'spring' | 'summer' | 'autumn' | 'winter',
 *   southSeason: 'spring' | 'summer' | 'autumn' | 'winter',
 *   progress: number
 * }}
 */
export function getSeasonsInfo(orbitDeg) {
  const normDeg = ((orbitDeg % 360) + 360) % 360;

  let northSeason, southSeason;
  let seasonProgress = 0;

  if (normDeg >= 0 && normDeg < 90) {
    northSeason = 'summer';
    southSeason = 'winter';
    seasonProgress = normDeg / 90;
  } else if (normDeg >= 90 && normDeg < 180) {
    northSeason = 'autumn';
    southSeason = 'spring';
    seasonProgress = (normDeg - 90) / 90;
  } else if (normDeg >= 180 && normDeg < 270) {
    northSeason = 'winter';
    southSeason = 'summer';
    seasonProgress = (normDeg - 180) / 90;
  } else {
    northSeason = 'spring';
    southSeason = 'autumn';
    seasonProgress = (normDeg - 270) / 90;
  }

  return { northSeason, southSeason, progress: seasonProgress };
}

/**
 * Розрахунок максимальної висоти Сонця над горизонтом опівдні
 * @param {number} latitudeDeg - Широта (від -90° до +90°)
 * @param {number} declinationDeg - Сонячне схилення
 * @returns {number} Висота Сонця в градусах
 */
export function calculateNoonSunAltitude(latitudeDeg, declinationDeg) {
  const altitude = 90 - Math.abs(latitudeDeg - declinationDeg);
  return Math.max(0, altitude);
}

/**
 * Розрахунок тривалості світлового дня (в годинах)
 * @param {number} latitudeDeg - Широта точки
 * @param {number} declinationDeg - Сонячне схилення
 * @returns {number} Тривалість дня в годинах (0 - 24)
 */
export function calculateDayLengthHours(latitudeDeg, declinationDeg) {
  const latRad = (latitudeDeg * Math.PI) / 180;
  const decRad = (declinationDeg * Math.PI) / 180;

  const tanVal = Math.tan(latRad) * Math.tan(decRad);

  if (tanVal >= 1.0) {
    return 24.0; // Полярний день
  }
  if (tanVal <= -1.0) {
    return 0.0; // Полярна ніч
  }

  const omega0 = Math.acos(-tanVal);
  const hours = (24 * omega0) / Math.PI;
  return Math.max(0, Math.min(24, hours));
}

/**
 * Перетворення орбітального кута θ в календарну дату
 * 0° = 21 червня (172-й день року)
 * @param {number} orbitDeg
 * @param {string} [lang]
 * @returns {{ day: number, monthIndex: number, monthName: string, fullDateStr: string, dayOfYear: number }}
 */
export function orbitAngleToDate(orbitDeg, lang = getLanguage()) {
  const normDeg = ((orbitDeg % 360) + 360) % 360;
  let dayOfYear = Math.round(172 + (normDeg / 360) * 365);
  if (dayOfYear > 365) {
    dayOfYear -= 365;
  }

  let accumulated = 0;
  let monthIndex = 0;
  let dayInMonth = 1;

  for (let i = 0; i < CONSTANTS.MONTHS.length; i++) {
    const m = CONSTANTS.MONTHS[i];
    if (dayOfYear <= accumulated + m.days) {
      monthIndex = i;
      dayInMonth = dayOfYear - accumulated;
      break;
    }
    accumulated += m.days;
  }

  const dict = TRANSLATIONS[lang] || TRANSLATIONS.uk;
  const monthData = dict.months[monthIndex];

  let fullDateStr = '';
  if (lang === 'en') {
    fullDateStr = `${monthData.name} ${dayInMonth}`;
  } else {
    fullDateStr = `${dayInMonth} ${monthData.genitive}`;
  }

  return {
    day: dayInMonth,
    monthIndex,
    monthName: monthData.name,
    fullDateStr,
    dayOfYear
  };
}

/**
 * Перетворення дня року (1-365) або дати в орбітальний кут
 * @param {number} dayOfYear
 * @returns {number} Орбітальний кут у градусах (0..360)
 */
export function dayOfYearToOrbitAngle(dayOfYear) {
  let diff = dayOfYear - 172;
  if (diff < 0) diff += 365;
  return (diff / 365) * 360;
}

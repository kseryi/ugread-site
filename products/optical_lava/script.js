'use strict';

/* =========================================================================
   ОПТИЧНА ЛАВА — симулятор геометричної оптики (лінзи + дзеркала)
   Класи: Ray, OpticalPowerElement -> Lens/Mirror, ObjectArrow,
          PointSource, ParallelBeam, Simulator
   ========================================================================= */

const WORLD_W    = 260;             // видима ширина сцени, см
const DRAG_LIM   = 125;             // межа переміщення елементів по осі, см
const LEFT_EDGE  = -WORLD_W / 2 - 20;
const RIGHT_EDGE =  WORLD_W / 2 + 20;

let uid = 1;
const nextId = () => uid++;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- перетин двох ліній (продовжень променів) ------- */
function intersectRays(x1, y1, s1, x2, y2, s2) {
  if (Math.abs(s1 - s2) < 1e-7) return null; // паралельні — зображення в нескінченності
  const x = ((y2 - y1) - s2 * x2 + s1 * x1) / (s1 - s2);
  const y = y1 + s1 * (x - x1);
  return { x, y };
}

/* =========================== клас Ray =================================== */
class Ray {
  constructor(x, y, slope) {
    this.x0 = x; this.y0 = y; this.slope = slope;
  }
  /**
   * Послідовне заломлення/відбиття променя через набір оптичних елементів
   * (лінзи та дзеркала). На дзеркалі напрям поширення розвертається.
   * elements: масив Lens/Mirror (порядок не важливий — на кожному кроці
   * шукається найближчий елемент у поточному напрямку руху).
   */
  traceThrough(elements) {
    const MAX_BOUNCES = 3; // запобіжник від нескінченних відбиттів у крайніх випадках
    const points = [{ x: this.x0, y: this.y0 }];
    let cx = this.x0, cy = this.y0, cs = this.slope, dir = 1;
    let guard = 0, bounces = 0, absorbed = false;
    while (guard++ < 40) {
      let candidates = elements.filter(e => (dir > 0 ? e.x > cx + 1e-6 : e.x < cx - 1e-6));
      if (bounces >= MAX_BOUNCES) candidates = candidates.filter(e => e.type !== 'mirror');
      if (candidates.length === 0) break;
      candidates.sort((a, b) => (dir > 0 ? a.x - b.x : b.x - a.x));

      // шукаємо перший елемент, у фізичну апертуру (висоту) якого промінь дійсно влучає —
      // усі елементи, повз які промінь проходить вище/нижче їхнього краю, ігноруються
      // (він проминає їх без заломлення чи відбиття).
      let el = null, y = null;
      for (const c of candidates) {
        const yc = cy + cs * (c.x - cx);
        if (Math.abs(yc) <= c.effectiveHeight() / 2) { el = c; y = yc; break; }
      }
      if (!el) break; // промінь не влучає в жоден наступний елемент — летить прямо до краю сцени

      points.push({ x: el.x, y });
      if (el.type === 'mirror') {
        // дзеркало відбиває лише зі свого відбивного (вигнутого) боку — той, що зліва
        // (звідки на нього "дивиться" вісь). Якщо промінь підходить ззаду (з боку
        // непрозорої підкладки, dir<0), він поглинається й далі не поширюється.
        if (dir < 0) { cx = el.x; cy = y; absorbed = true; break; }
        let ns = cs - y / el.f;
        ns = -ns; dir = -dir; bounces++;
        cx = el.x; cy = y; cs = ns;
      } else {
        const ns = cs - y / el.f;
        cx = el.x; cy = y; cs = ns;
      }
    }
    if (!absorbed) {
      const edge = dir > 0 ? RIGHT_EDGE : LEFT_EDGE;
      const yEnd = cy + cs * (edge - cx);
      points.push({ x: edge, y: yEnd });
    }
    return { points, exitX: cx, exitY: cy, exitSlope: cs, exitDir: dir, absorbed };
  }
}

/* =================== базовий клас для лінз і дзеркал =================== */
class OpticalPowerElement {
  constructor(x, f, kind, type) {
    this.id = nextId();
    this.locked = false;           // true, якщо елемент зафіксовано як умова задачі
    this.type = type;             // 'lens' | 'mirror'
    this.kind = kind;              // lens: 'convex'|'concave'; mirror: 'concave'|'convex'
    this.x = x;
    this.f = f;                    // зі знаком: + збиральна/увігнута, - розсіювальна/опукла
    this.baseHeight = 76;          // фіксована візуальна висота, см
    this.sizeScalesWithF = false;  // опція: розмір елемента залежить від |F|
  }
  get positiveKind() { return this.type === 'lens' ? 'convex' : 'concave'; }
  effectiveHeight() {
    if (!this.sizeScalesWithF) return this.baseHeight;
    return clamp(Math.abs(this.f) * 2.1, 30, 150);
  }
  setKind(kind) {
    this.kind = kind;
    const mag = Math.abs(this.f) || 30;
    this.f = kind === this.positiveKind ? mag : -mag;
  }
}
class Lens extends OpticalPowerElement {
  constructor(x, f, kind) { super(x, f, kind, 'lens'); }
}
class Mirror extends OpticalPowerElement {
  constructor(x, f, kind) { super(x, f, kind, 'mirror'); }
}

/* ======================== клас ObjectArrow ================================ */
class ObjectArrow {
  constructor(x, height) {
    this.id = nextId();
    this.locked = false;
    this.type = 'object';
    this.x = x;
    this.height = height;
    this.shape = 'arrow'; // 'arrow' | 'candle' | 'person' | 'tree' | 'letter-f'
  }
}

/* ======================== клас PointSource ================================ */
class PointSource {
  constructor(x, y) {
    this.id = nextId();
    this.locked = false;
    this.type = 'point';
    this.x = x; this.y = y;
    this.rayCount = 9;
    this.fanDeg = 36;
  }
}

/* ======================== клас ParallelBeam ================================ */
class ParallelBeam {
  constructor(x) {
    this.id = nextId();
    this.locked = false;
    this.type = 'beam';
    this.x = x;
    this.rayCount = 7;
    this.span = 80;
  }
}

/* =============================================================================
   PROP_CONFIG — опис слайдерів властивостей для кожного числового параметра
   ============================================================================= */
const PROP_CONFIG = {
  x:        { min: -DRAG_LIM, max: DRAG_LIM, step: 1, label: 'Позиція вздовж осі, см' },
  f:        { min: 5,   max: 130, step: 1, label: 'Фокусна відстань |F|, см' },
  height:   { min: 5,   max: 95,  step: 1, label: 'Висота предмета, см' },
  y:        { min: -70, max: 70,  step: 1, label: 'Зміщення від осі, см' },
  rayCount: { min: 3,   max: 19,  step: 2, label: 'Кількість променів' },
  fanDeg:   { min: 5,   max: 80,  step: 1, label: 'Кут розхилу пучка, °' },
  span:     { min: 20,  max: 160, step: 5, label: 'Ширина пучка, см' },
};

const TYPE_LABEL = { object: 'Предмет', point: 'Точкове джерело', beam: 'Паралельний пучок' };
const OBJECT_SHAPES = [
  { id: 'arrow', label: 'Стрілка',
    icon: '<svg viewBox="0 0 24 24" width="16" height="16"><line x1="12" y1="21" x2="12" y2="4" stroke="currentColor" stroke-width="1.8"/><path d="M8 8 L12 3 L16 8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>' },
  { id: 'candle', label: 'Свічка',
    icon: '<svg viewBox="0 0 24 24" width="16" height="16"><rect x="9" y="10" width="6" height="11" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 3 L14.5 8 L12 10.5 L9.5 8 Z" fill="currentColor"/></svg>' },
  { id: 'person', label: 'Людина',
    icon: '<svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="6" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/><line x1="12" y1="8.5" x2="12" y2="16" stroke="currentColor" stroke-width="1.6"/><line x1="12" y1="10" x2="7" y2="14" stroke="currentColor" stroke-width="1.6"/><line x1="12" y1="10" x2="17" y2="14" stroke="currentColor" stroke-width="1.6"/><line x1="12" y1="16" x2="8" y2="21" stroke="currentColor" stroke-width="1.6"/><line x1="12" y1="16" x2="16" y2="21" stroke="currentColor" stroke-width="1.6"/></svg>' },
  { id: 'tree', label: 'Дерево',
    icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2 L18 11 L14.5 11 L18.5 16 L14.5 16 L18 21 L6 21 L9.5 16 L5.5 16 L9.5 11 L6 11 Z" fill="currentColor"/></svg>' },
  { id: 'letter-f', label: 'Літера F',
    icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M7 3 L7 21 L11 21 L11 14 L16 14 L16 10 L11 10 L11 7 L18 7 L18 3 Z" fill="currentColor"/></svg>' },
];
const objectShapeLabel = (shape) => (OBJECT_SHAPES.find((s) => s.id === shape) || OBJECT_SHAPES[0]).label;
const TYPE_COLOR = {
  'lens-convex': '#5fd4e0', 'lens-concave': '#c98cf0',
  'mirror-concave': '#8fd6ff', 'mirror-convex': '#ffb37a',
  object: '#ffcf6b', point: '#ffcf6b', beam: '#ffcf6b',
};
function elementName(el) {
  if (el.type === 'lens') return el.kind === 'convex' ? 'Збиральна лінза' : 'Розсіювальна лінза';
  if (el.type === 'mirror') return el.kind === 'concave' ? 'Увігнуте дзеркало' : 'Опукле дзеркало';
  if (el.type === 'object') return `Предмет (${objectShapeLabel(el.shape)})`;
  return TYPE_LABEL[el.type];
}
function elementColorKey(el) {
  return (el.type === 'lens' || el.type === 'mirror') ? `${el.type}-${el.kind}` : el.type;
}

/* =============================================================================
   РЕЖИМ ЗАДАЧІ: серіалізація елементів, кодування/декодування, оцінювання
   ============================================================================= */
function serializeElement(el) {
  const base = { type: el.type, x: el.x };
  if (el.type === 'lens' || el.type === 'mirror') {
    Object.assign(base, { kind: el.kind, f: el.f, baseHeight: el.baseHeight, sizeScalesWithF: el.sizeScalesWithF });
  } else if (el.type === 'object') {
    Object.assign(base, { height: el.height, shape: el.shape });
  } else if (el.type === 'point') {
    Object.assign(base, { y: el.y, rayCount: el.rayCount, fanDeg: el.fanDeg });
  } else if (el.type === 'beam') {
    Object.assign(base, { rayCount: el.rayCount, span: el.span });
  }
  return base;
}
function deserializeElement(data, locked) {
  let el;
  if (data.type === 'lens') el = new Lens(data.x, data.f, data.kind);
  else if (data.type === 'mirror') el = new Mirror(data.x, data.f, data.kind);
  else if (data.type === 'object') el = new ObjectArrow(data.x, data.height);
  else if (data.type === 'point') el = new PointSource(data.x, data.y);
  else if (data.type === 'beam') el = new ParallelBeam(data.x);
  else return null;
  if (data.baseHeight !== undefined) el.baseHeight = data.baseHeight;
  if (data.sizeScalesWithF !== undefined) el.sizeScalesWithF = data.sizeScalesWithF;
  if (data.shape !== undefined) el.shape = data.shape;
  if (data.rayCount !== undefined) el.rayCount = data.rayCount;
  if (data.fanDeg !== undefined) el.fanDeg = data.fanDeg;
  if (data.span !== undefined) el.span = data.span;
  el.locked = !!locked;
  return el;
}
function encodeTaskCode(payload) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}
function decodeTaskCode(code) {
  return JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
}
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : str;
  return div.innerHTML;
}
function composeTaskDescription(criteria, instructions) {
  const active = Object.keys(criteria).filter((k) => criteria[k] !== null && criteria[k] !== undefined);
  let text;
  if (active.length === 0) {
    text = "Розташуйте предмет (і за потреби інші елементи) так, щоб отримати зображення.";
  } else {
    const parts = active.map((k) => {
      if (k === 'real') return criteria.real === 'real' ? 'дійсним' : 'уявним';
      if (k === 'orientation') return criteria.orientation === 'upright' ? 'прямим' : 'перевернутим';
      if (k === 'size') return criteria.size === 'enlarged' ? 'збільшеним' : criteria.size === 'reduced' ? 'зменшеним' : 'рівним за розміром';
      if (k === 'mag') return `зі значенням модуля збільшення |Γ| у межах [${criteria.mag[0]}, ${criteria.mag[1]}]`;
      return '';
    });
    text = `Використовуючи задані елементи, розташуйте предмет (додайте його з панелі інструментів) так, щоб отримане зображення було: ${parts.join(', ')}.`;
  }
  if (instructions && instructions.trim()) text += '\n\n' + instructions.trim();
  return text;
}
/** Будує друковану HTML-версію аркуша завдання (для рендеру в PDF через html2canvas —
 *  це забезпечує коректне відображення кирилиці, на відміну від вбудованих шрифтів jsPDF). */
function buildWorksheetHTML(payload, code) {
  const criteria = payload.criteria;
  const active = Object.keys(criteria).filter((k) => criteria[k] !== null && criteria[k] !== undefined);
  const per = active.length ? (payload.maxScore / active.length).toFixed(1) : payload.maxScore;
  const rubricItems = active.length
    ? active.map((k) => `<li>${escapeHtml(CRITERION_LABELS[k](criteria[k]))} — <b>${per}</b> балів</li>`).join('')
    : `<li>Зображення успішно побудовано — <b>${payload.maxScore}</b> балів</li>`;

  const xs = payload.given.map((g) => g.x);
  const minX = Math.min(-60, ...xs), maxX = Math.max(60, ...xs);
  const svgW = 700, svgH = 150, pad = 34;
  const span = (maxX - minX) || 1;
  const mapX = (x) => pad + ((x - minX) / span) * (svgW - 2 * pad);
  const scalePx = (svgW - 2 * pad) / span;
  const axisY = svgH / 2;
  let svgInner = `<line x1="${pad}" y1="${axisY}" x2="${svgW - pad}" y2="${axisY}" stroke="#333" stroke-width="1.5"/>`;
  payload.given.forEach((g) => {
    const px = mapX(g.x);
    if (g.type === 'lens' || g.type === 'mirror') {
      const label = g.type === 'lens'
        ? (g.kind === 'convex' ? 'Збиральна лінза' : 'Розсіювальна лінза')
        : (g.kind === 'concave' ? 'Увігнуте дзеркало' : 'Опукле дзеркало');
      svgInner += `<line x1="${px}" y1="${axisY - 42}" x2="${px}" y2="${axisY + 42}" stroke="#1878a0" stroke-width="3"/>`;
      const F = Math.abs(g.f) * scalePx;
      [-1, 1].forEach((s) => {
        svgInner += `<line x1="${px + s * F}" y1="${axisY - 5}" x2="${px + s * F}" y2="${axisY + 5}" stroke="#777" stroke-width="1"/>`;
        svgInner += `<text x="${px + s * F}" y="${axisY + 18}" font-size="10" text-anchor="middle" fill="#555">F</text>`;
      });
      svgInner += `<text x="${px}" y="${axisY - 50}" font-size="11" text-anchor="middle" fill="#1878a0">${escapeHtml(label)}, F=${Math.abs(g.f)} см</text>`;
    } else if (g.type === 'object') {
      svgInner += `<line x1="${px}" y1="${axisY}" x2="${px}" y2="${axisY - 30}" stroke="#b8860b" stroke-width="2"/>`;
      svgInner += `<text x="${px}" y="${axisY - 34}" font-size="10" text-anchor="middle" fill="#b8860b">предмет</text>`;
    } else if (g.type === 'point') {
      svgInner += `<circle cx="${px}" cy="${axisY}" r="3.5" fill="#b8860b"/>`;
      svgInner += `<text x="${px}" y="${axisY - 8}" font-size="10" text-anchor="middle" fill="#b8860b">джерело</text>`;
    } else if (g.type === 'beam') {
      svgInner += `<line x1="${px}" y1="${axisY - 26}" x2="${px}" y2="${axisY + 26}" stroke="#b8860b" stroke-width="3"/>`;
      svgInner += `<text x="${px}" y="${axisY - 30}" font-size="10" text-anchor="middle" fill="#b8860b">пучок</text>`;
    }
  });

  const ruledLines = Array.from({ length: 7 })
    .map(() => `<div style="border-bottom:1px solid #999; height:28px;"></div>`).join('');

  return `
    <div style="font-family:Arial, sans-serif; color:#111; font-size:13px; line-height:1.55;">
      <h1 style="font-size:20px; margin:0 0 6px 0;">Задача з геометричної оптики</h1>
      <div style="font-size:12px; color:#444; margin-bottom:14px;">
        Прізвище, ім'я: ____________________________&nbsp;&nbsp;&nbsp; Клас: _______&nbsp;&nbsp;&nbsp; Дата: ____________
      </div>
      <div style="font-weight:bold; margin-bottom:10px;">Максимальний бал: ${payload.maxScore}</div>
      <div style="white-space:pre-wrap; margin-bottom:18px;">${escapeHtml(payload.description)}</div>

      <div style="font-weight:bold; margin-bottom:6px;">Задана схема:</div>
      <svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" style="margin-bottom:16px;">${svgInner}</svg>

      <div style="font-weight:bold; margin-bottom:6px;">Критерії оцінювання:</div>
      <ul style="margin:0 0 18px 20px; padding:0;">${rubricItems}</ul>

      <div style="font-weight:bold; margin-bottom:10px;">Розв'язання (розрахунки, хід променів):</div>
      <div style="margin-bottom:22px;">${ruledLines}</div>

      <div style="font-size:9px; color:#888; word-break:break-all; border-top:1px solid #ccc; padding-top:8px;">
        Код задачі для перевірки в застосунку «Оптична лава»:<br>
        <span style="font-family:'Courier New',monospace;">${escapeHtml(code)}</span>
      </div>
    </div>`;
}
/** Рендерить друковану версію аркуша в прихованому DOM-контейнері та зберігає як PDF (html2canvas
 *  забезпечує коректний рендер кирилиці, на відміну від стандартних шрифтів jsPDF). */
async function generateTaskPDF(payload, code) {
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed; top:0; left:-4000px; width:760px; background:#ffffff; padding:32px; box-sizing:border-box;';
  container.innerHTML = buildWorksheetHTML(payload, code);
  document.body.appendChild(container);
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt', 'a4');
    await doc.html(container, { x: 20, y: 20, width: 555, windowWidth: 760 });
    doc.save('zavdannya-optyka.pdf');
  } finally {
    document.body.removeChild(container);
  }
}
const CRITERION_LABELS = {
  real: (v) => `Зображення має бути ${v === 'real' ? 'дійсним' : 'уявним'}`,
  orientation: (v) => `Зображення має бути ${v === 'upright' ? 'прямим' : 'перевернутим'}`,
  size: (v) => `Зображення має бути ${v === 'enlarged' ? 'збільшеним' : v === 'reduced' ? 'зменшеним' : 'рівним за розміром'}`,
  mag: (v) => `Модуль збільшення Γ у межах [${v[0]}, ${v[1]}]`,
};
/** Оцінює побудоване учнем зображення предмета за критеріями вчителя. Повертає {score,maxScore,breakdown,message}. */
function evaluateImage(img, obj, criteria, maxScore) {
  const active = Object.keys(criteria).filter((k) => criteria[k] !== null && criteria[k] !== undefined);
  if (active.length === 0) {
    const formed = img && !img.none && !img.blocked;
    return {
      score: formed ? maxScore : 0, maxScore,
      breakdown: [{ label: 'Зображення успішно побудовано', ok: formed }],
      message: formed ? 'Зображення побудовано — задачу зараховано.' : 'Зображення не утворюється — перевірте розташування елементів.',
    };
  }
  if (!img || img.none || img.blocked || img.infinite) {
    const breakdown = active.map((k) => ({ label: CRITERION_LABELS[k](criteria[k]), ok: false }));
    return {
      score: 0, maxScore, breakdown,
      message: img && img.infinite
        ? 'Промені виходять паралельно (зображення в нескінченності) — критерії не виконано.'
        : 'Зображення не утворюється в поточній конфігурації.',
    };
  }
  const per = maxScore / active.length;
  let score = 0;
  const breakdown = [];
  const upright = Math.sign(img.y) === Math.sign(obj.height) || Math.abs(img.y) < 0.5;
  const mag = img.y / obj.height;
  const sizeTag = Math.abs(Math.abs(mag) - 1) < 0.03 ? 'equal' : (Math.abs(mag) > 1 ? 'enlarged' : 'reduced');
  if (active.includes('real')) {
    const ok = (criteria.real === 'real') === img.real;
    breakdown.push({ label: CRITERION_LABELS.real(criteria.real), ok }); if (ok) score += per;
  }
  if (active.includes('orientation')) {
    const ok = (criteria.orientation === 'upright') === upright;
    breakdown.push({ label: CRITERION_LABELS.orientation(criteria.orientation), ok }); if (ok) score += per;
  }
  if (active.includes('size')) {
    const ok = criteria.size === sizeTag;
    breakdown.push({ label: CRITERION_LABELS.size(criteria.size), ok }); if (ok) score += per;
  }
  if (active.includes('mag')) {
    const [lo, hi] = criteria.mag;
    const ok = Math.abs(mag) >= lo && Math.abs(mag) <= hi;
    breakdown.push({ label: CRITERION_LABELS.mag(criteria.mag), ok }); if (ok) score += per;
  }
  score = Math.round(score);
  const message = score === maxScore ? 'Чудово! Усі критерії виконано.'
    : score === 0 ? 'Жоден критерій не виконано — спробуйте ще раз.'
    : 'Частково правильно — перевірте позначені критерії.';
  return { score, maxScore, breakdown, message };
}

/* ================================================================================
   Simulator — керує сценою, елементами, малюванням та взаємодією користувача
   ================================================================================ */
class Simulator {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.opticalLayer = document.getElementById('lens-layer');
    this._opticalDom = new Map();
    this.elements = [];
    this.selectedId = null;
    this.drag = null;
    this.zoom = 1;
    this._propsBuiltFor = null;
    this._refreshPending = false;
    this.loadedTask = null;   // задача, завантажена учнем: {title,description,maxScore,criteria}
    this.lastCheck = null;    // результат останньої перевірки

    this.elements.push(new Lens(0, 36, 'convex'));
    this.elements.push(new ObjectArrow(-88, 34));

    this._bindEvents();
    this._resize();
    window.addEventListener('resize', () => this._resize());
    requestAnimationFrame(() => this._loop());

    this._updateZoomUI();
    this.refreshAll();
  }

  /* --------------------------- координатні перетворення --------------------------- */
  _resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.cssW = rect.width; this.cssH = rect.height;
    this.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.round(rect.height * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._updateScale();
  }
  _updateScale() { this.scale = (this.cssW / WORLD_W) * this.zoom; }
  toPx(x, y) { return { x: this.cssW / 2 + x * this.scale, y: this.cssH / 2 - y * this.scale }; }
  toWorld(px, py) { return { x: (px - this.cssW / 2) / this.scale, y: (this.cssH / 2 - py) / this.scale }; }

  /* --------------------------------- масштабування (зум) --------------------------------- */
  setZoom(z) {
    this.zoom = clamp(z, 0.5, 2.5);
    this._updateScale();
    this._updateZoomUI();
  }
  zoomBy(factor) { this.setZoom(this.zoom * factor); }
  _updateZoomUI() {
    const el = document.getElementById('zoom-level');
    if (el) el.textContent = Math.round(this.zoom * 100) + '%';
  }

  /* --------------------------------- пакетне оновлення DOM --------------------------------- */
  _scheduleRefresh() {
    if (this._refreshPending) return;
    this._refreshPending = true;
    requestAnimationFrame(() => { this._refreshPending = false; this.refreshAll(); });
  }

  /* --------------------------------- дані елементів --------------------------------- */
  allOptical() { return this.elements.filter(e => e.type === 'lens' || e.type === 'mirror'); }
  opticsRightOf(x) { return this.allOptical().filter(e => e.x > x).sort((a, b) => a.x - b.x); }
  getById(id) { return this.elements.find(e => e.id === id); }

  addElement(kind) {
    let el;
    const lensCount   = this.elements.filter(e => e.type === 'lens').length;
    const mirrorCount = this.elements.filter(e => e.type === 'mirror').length;
    const objCount    = this.elements.filter(e => e.type === 'object').length;
    switch (kind) {
      case 'lens-convex':    el = new Lens(-60 + 70 * lensCount, 36, 'convex'); break;
      case 'lens-concave':   el = new Lens(-60 + 70 * lensCount, -36, 'concave'); break;
      case 'mirror-concave': el = new Mirror(95 - 40 * mirrorCount, 40, 'concave'); break;
      case 'mirror-convex':  el = new Mirror(95 - 40 * mirrorCount, -40, 'convex'); break;
      case 'object-arrow':   el = new ObjectArrow(-100 - 20 * objCount, 30); break;
      case 'point-source':   el = new PointSource(-105, 0); break;
      case 'parallel-beam':  el = new ParallelBeam(-115); break;
      default: return;
    }
    this.elements.push(el);
    this.selectedId = el.id;
    this.refreshAll();
  }

  removeElement(id) {
    const el = this.getById(id);
    if (el && el.locked) return; // умову задачі учень видалити не може
    this.elements = this.elements.filter(e => e.id !== id);
    if (this.selectedId === id) this.selectedId = null;
    this.refreshAll();
  }

  clearAll() {
    this.elements = this.elements.filter(e => e.locked);
    this.selectedId = null;
    this.refreshAll();
  }

  select(id) { this.selectedId = id; this.refreshAll(); }

  /* --------------------------------- фізика зображення --------------------------------- */
  computeImage(obj) {
    const rightOptics = this.opticsRightOf(obj.x);
    if (rightOptics.length === 0) return { none: true };
    const optics = this.allOptical();
    const firstEl = rightOptics[0];

    const ray1 = new Ray(obj.x, obj.height, 0);                                   // паралельний до осі
    const slope2 = (0 - obj.height) / (firstEl.x - obj.x);
    const ray2 = new Ray(obj.x, obj.height, slope2);                              // крізь центр першого елемента

    const t1 = ray1.traceThrough(optics);
    const t2 = ray2.traceThrough(optics);
    if (t1.absorbed || t2.absorbed) return { blocked: true, t1, t2 };
    const inter = intersectRays(t1.exitX, t1.exitY, t1.exitSlope, t2.exitX, t2.exitY, t2.exitSlope);

    if (!inter) return { infinite: true, t1, t2 };
    const dir = t1.exitDir;
    const real = dir > 0 ? inter.x > t1.exitX + 1e-6 : inter.x < t1.exitX - 1e-6;
    return { x: inter.x, y: inter.y, real, t1, t2 };
  }

  /* ------------------------------------ пресети ------------------------------------ */
  activeOpticForPreset() {
    const sel = this.getById(this.selectedId);
    if (sel && (sel.type === 'lens' || sel.type === 'mirror')) return sel;
    return this.allOptical()[0] || null;
  }
  activeObjectForPreset() {
    const sel = this.getById(this.selectedId);
    if (sel && sel.type === 'object') return sel;
    return this.elements.find(e => e.type === 'object') || null;
  }
  applyPreset(name) {
    const optic = this.activeOpticForPreset();
    const obj = this.activeObjectForPreset();
    if (!optic || !obj) return;
    const F = Math.abs(optic.f);
    const factors = { beyond2f: 2.6, at2f: 2.0, between: 1.5, atf: 1.0, belowf: 0.5 };
    const d = factors[name] * F;
    obj.x = clamp(optic.x - d, -DRAG_LIM, DRAG_LIM);
    this.selectedId = obj.id;
    this.refreshAll();
  }

  /* -------------------------------------- малювання -------------------------------------- */
  _loop() {
    this._draw();
    requestAnimationFrame(() => this._loop());
  }

  _draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.cssW, this.cssH);
    this._drawAxis();

    const optics = this.allOptical();
    for (const el of optics) this._drawFocalMarkers(el);
    this._syncOpticalLayer(optics);

    for (const el of this.elements) {
      if (el.type === 'point') this._drawPointSource(el);
      if (el.type === 'beam') this._drawParallelBeam(el);
    }
    for (const el of this.elements) {
      if (el.type === 'object') this._drawObjectAndImage(el);
    }
    this._drawSelectionMarker();
  }

  _drawAxis() {
    const ctx = this.ctx;
    const yc = this.toPx(0, 0).y;
    ctx.strokeStyle = 'rgba(90,105,140,0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, yc); ctx.lineTo(this.cssW, yc); ctx.stroke();
    ctx.fillStyle = 'rgba(90,105,140,0.7)';
    ctx.beginPath();
    ctx.moveTo(this.cssW - 6, yc - 5);
    ctx.lineTo(this.cssW - 6, yc + 5);
    ctx.lineTo(this.cssW + 2, yc);
    ctx.closePath(); ctx.fill();
  }

  _drawFocalMarkers(el) {
    const ctx = this.ctx;
    const F = Math.abs(el.f);
    const yAxis = this.toPx(0, 0).y;
    const marks = [[el.x - F, 'F'], [el.x + F, 'F'], [el.x - 2 * F, '2F'], [el.x + 2 * F, '2F']];
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (const [wx, label] of marks) {
      if (Math.abs(wx) > WORLD_W / 2) continue;
      const p = this.toPx(wx, 0);
      ctx.strokeStyle = 'rgba(150,165,200,0.55)';
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(p.x, yAxis - 5); ctx.lineTo(p.x, yAxis + 5); ctx.stroke();
      ctx.fillStyle = 'rgba(170,182,210,0.75)';
      ctx.fillText(label, p.x, yAxis + 18);
    }
  }

  _triangle(cx, cy, angle, len) {
    const ctx = this.ctx;
    const a1 = angle + 2.5, a2 = angle - 2.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
    ctx.lineTo(cx + Math.cos(a1) * (len * 0.45), cy + Math.sin(a1) * (len * 0.45));
    ctx.lineTo(cx + Math.cos(a2) * (len * 0.45), cy + Math.sin(a2) * (len * 0.45));
    ctx.closePath(); ctx.fill();
  }

  _drawPolyline(points, color, dashed, glow = true) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash(dashed ? [6, 5] : []);
    if (glow) { ctx.shadowColor = color; ctx.shadowBlur = 5; }
    ctx.beginPath();
    points.forEach((p, i) => {
      const px = this.toPx(p.x, p.y);
      if (i === 0) ctx.moveTo(px.x, px.y); else ctx.lineTo(px.x, px.y);
    });
    ctx.stroke();
    ctx.restore();
  }

  _drawArrowWorld(x, y0, y1, color, dashed) {
    const ctx = this.ctx;
    const p0 = this.toPx(x, y0), p1 = this.toPx(x, y1);
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = 2.4;
    ctx.setLineDash(dashed ? [7, 5] : []);
    ctx.shadowColor = color; ctx.shadowBlur = 7;
    ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
    ctx.setLineDash([]);
    const angle = y1 >= y0 ? -Math.PI / 2 : Math.PI / 2;
    ctx.fillStyle = color;
    this._triangle(p1.x, p1.y, angle, 11);
    ctx.restore();
  }

  /** Малює предмет (чи його зображення) обраної форми між точками (x,y0) і (x,y1).
   *  y1 — характеристична точка форми (вершина стрілки/полум'я/голова/верхівка дерева/верх F),
   *  саме вона використовується фізикою для побудови зображення. */
  _drawObjectShape(shape, x, y0, y1, color, dashed) {
    if (!shape || shape === 'arrow') { this._drawArrowWorld(x, y0, y1, color, dashed); return; }
    const ctx = this.ctx;
    const base = this.toPx(x, y0), tip = this.toPx(x, y1);
    const dy = tip.y - base.y;
    const w = Math.abs(dy) * 0.4;
    const pt = (xf, tf) => ({ x: base.x + xf * w, y: base.y + tf * dy });

    ctx.save();
    ctx.setLineDash(dashed ? [6, 5] : []);
    ctx.shadowColor = color; ctx.shadowBlur = 6;
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.fillStyle = color + '33';

    const line = (a, b) => { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); };
    const poly = (pts) => {
      ctx.beginPath();
      pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    };

    if (shape === 'candle') {
      poly([pt(-0.22, 0), pt(-0.22, 0.72), pt(0.22, 0.72), pt(0.22, 0)]);
      line(pt(0, 0.72), pt(0, 0.8));
      poly([pt(0, 1), pt(0.14, 0.8), pt(0, 0.68), pt(-0.14, 0.8)]);
    } else if (shape === 'person') {
      const headC = pt(0, 0.86), headR = Math.abs(dy) * 0.14;
      ctx.beginPath(); ctx.arc(headC.x, headC.y, headR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      line(pt(0, 0.72), pt(0, 0.28));
      line(pt(0, 0.62), pt(-0.28, 0.42));
      line(pt(0, 0.62), pt(0.28, 0.42));
      line(pt(0, 0.28), pt(-0.22, 0));
      line(pt(0, 0.28), pt(0.22, 0));
    } else if (shape === 'tree') {
      poly([pt(-0.08, 0.18), pt(-0.08, 0), pt(0.08, 0), pt(0.08, 0.18)]);
      poly([pt(-0.3, 0.18), pt(0.3, 0.18), pt(0, 0.5)]);
      poly([pt(-0.24, 0.42), pt(0.24, 0.42), pt(0, 0.75)]);
      poly([pt(-0.16, 0.66), pt(0.16, 0.66), pt(0, 1)]);
    } else if (shape === 'letter-f') {
      poly([
        pt(-0.18, 0), pt(-0.18, 1), pt(0.4, 1), pt(0.4, 0.82), pt(0.05, 0.82),
        pt(0.05, 0.6), pt(0.3, 0.6), pt(0.3, 0.45), pt(0.05, 0.45), pt(0.05, 0),
      ]);
    }
    ctx.restore();
  }

  _drawObjectAndImage(obj) {
    const selected = obj.id === this.selectedId;
    const objColor = selected ? '#fff2cc' : '#ffcf6b';
    this._drawObjectShape(obj.shape, obj.x, 0, obj.height, objColor, false);

    const rightOptics = this.opticsRightOf(obj.x);
    if (rightOptics.length === 0) {
      for (const s of [-0.35, 0, 0.35]) {
        const r = new Ray(obj.x, obj.height, s).traceThrough([]);
        this._drawPolyline(r.points, 'rgba(255,207,107,0.35)', false, false);
      }
      return;
    }

    const img = this.computeImage(obj);
    this._drawPolyline(img.t1.points, 'rgba(255,207,107,0.85)', false);
    this._drawPolyline(img.t2.points, 'rgba(255,207,107,0.85)', false);

    if (img.infinite || img.blocked) return;

    if (!img.real) {
      this._drawPolyline([{ x: img.t1.exitX, y: img.t1.exitY }, { x: img.x, y: img.y }], 'rgba(111,208,255,0.6)', true, false);
      this._drawPolyline([{ x: img.t2.exitX, y: img.t2.exitY }, { x: img.x, y: img.y }], 'rgba(111,208,255,0.6)', true, false);
    }
    const imgColor = img.real ? '#ffe08a' : '#6fd0ff';
    this._drawObjectShape(obj.shape, img.x, 0, img.y, imgColor, !img.real);
  }

  _drawPointSource(src) {
    const optics = this.allOptical();
    const n = src.rayCount, fan = (src.fanDeg * Math.PI) / 180;
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0 : (i / (n - 1)) * 2 - 1;
      const slope = Math.tan(t * fan);
      const r = new Ray(src.x, src.y, slope).traceThrough(optics);
      this._drawPolyline(r.points, 'rgba(255,207,107,0.55)', false, false);
    }
    const p = this.toPx(src.x, src.y);
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = '#ffcf6b'; ctx.shadowColor = '#ffcf6b'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(p.x, p.y, this.selectedId === src.id ? 6.5 : 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  _drawParallelBeam(beam) {
    const optics = this.allOptical();
    const n = beam.rayCount;
    for (let i = 0; i < n; i++) {
      const y = n === 1 ? 0 : -beam.span / 2 + (i / (n - 1)) * beam.span;
      const r = new Ray(beam.x, y, 0).traceThrough(optics);
      this._drawPolyline(r.points, 'rgba(255,207,107,0.55)', false, false);
    }
    if (optics.length > 0) {
      const rA = new Ray(beam.x, -beam.span / 2, 0).traceThrough(optics);
      const rB = new Ray(beam.x, beam.span / 2, 0).traceThrough(optics);
      const inter = (!rA.absorbed && !rB.absorbed)
        ? intersectRays(rA.exitX, rA.exitY, rA.exitSlope, rB.exitX, rB.exitY, rB.exitSlope)
        : null;
      if (inter) {
        const dir = rA.exitDir;
        const real = dir > 0 ? inter.x > rA.exitX + 1e-6 : inter.x < rA.exitX - 1e-6;
        if (!real) {
          this._drawPolyline([{ x: rA.exitX, y: rA.exitY }, { x: inter.x, y: inter.y }], 'rgba(111,208,255,0.5)', true, false);
          this._drawPolyline([{ x: rB.exitX, y: rB.exitY }, { x: inter.x, y: inter.y }], 'rgba(111,208,255,0.5)', true, false);
        }
        const p = this.toPx(inter.x, inter.y);
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = real ? '#ffe08a' : '#6fd0ff';
        ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
        ctx.font = '10px JetBrains Mono, monospace'; ctx.shadowBlur = 0;
        ctx.fillText(real ? "F'" : "F' (уявний)", p.x + 7, p.y - 7);
        ctx.restore();
      }
    }
    const p0 = this.toPx(beam.x - 5, beam.span / 2);
    const p1 = this.toPx(beam.x - 5, -beam.span / 2);
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = this.selectedId === beam.id ? '#fff2cc' : '#ffcf6b';
    ctx.lineWidth = 3; ctx.shadowColor = '#ffcf6b'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
    ctx.restore();
  }

  _drawSelectionMarker() {
    const el = this.getById(this.selectedId);
    if (!el || el.type !== 'object') return;
    const p = this.toPx(el.x, 0);
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,242,204,0.6)'; ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(p.x, 0); ctx.lineTo(p.x, this.cssH); ctx.stroke();
    ctx.restore();
  }

  /* ---- реалістичні лінзи/дзеркала як SVG-об'єкти:
         () — збиральна лінза, )( — розсіювальна лінза,
         ) — угнуте дзеркало (опукле до світла), ( — опукле дзеркало ---- */
  _syncOpticalLayer(optics) {
    const seen = new Set();
    for (const el of optics) {
      seen.add(el.id);
      let dom = this._opticalDom.get(el.id);
      if (!dom) {
        dom = this._createOpticalDom(el);
        this._opticalDom.set(el.id, dom);
        this.opticalLayer.appendChild(dom.g);
      }
      this._updateOpticalDom(dom, el);
    }
    for (const [id, dom] of this._opticalDom) {
      if (!seen.has(id)) { dom.g.remove(); this._opticalDom.delete(id); }
    }
  }

  _createOpticalDom(el) {
    const NS = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(NS, 'g');
    g.classList.add('lens-glyph');

    const plane = document.createElementNS(NS, 'line');
    plane.setAttribute('stroke', 'rgba(150,165,200,0.35)');
    plane.setAttribute('stroke-width', '1');
    plane.setAttribute('stroke-dasharray', '3 6');
    plane.setAttribute('pointer-events', 'none');

    const body = document.createElementNS(NS, 'path');
    body.setAttribute('class', 'lens-body');
    body.setAttribute('pointer-events', 'all');

    const hatch = document.createElementNS(NS, 'path');
    hatch.setAttribute('fill', 'none');
    hatch.setAttribute('pointer-events', 'none');

    const hit = document.createElementNS(NS, 'rect');
    hit.setAttribute('class', 'lens-hit');
    hit.setAttribute('fill', 'transparent');
    hit.setAttribute('pointer-events', 'all');

    g.appendChild(plane); g.appendChild(hit); g.appendChild(body); g.appendChild(hatch);

    const startDrag = (e) => {
      this.select(el.id);
      if (el.locked) { e.preventDefault(); return; }
      g.setPointerCapture(e.pointerId);
      this.drag = { el, mode: 'move-x' };
      e.preventDefault();
    };
    hit.addEventListener('pointerdown', startDrag);
    body.addEventListener('pointerdown', startDrag);
    g.addEventListener('pointermove', (e) => {
      if (!this.drag || this.drag.el !== el) return;
      const rect = this.canvas.getBoundingClientRect();
      const w = this.toWorld(e.clientX - rect.left, 0);
      el.x = clamp(w.x, -DRAG_LIM, DRAG_LIM);
      this._scheduleRefresh();
    });
    g.addEventListener('pointerup', () => { this.drag = null; });
    g.addEventListener('pointercancel', () => { this.drag = null; });

    return { g, plane, body, hatch, hit };
  }

  _updateOpticalDom(dom, el) {
    const p = this.toPx(el.x, 0);
    dom.g.setAttribute('transform', `translate(${p.x},0)`);

    dom.plane.setAttribute('x1', 0); dom.plane.setAttribute('y1', 0);
    dom.plane.setAttribute('x2', 0); dom.plane.setAttribute('y2', this.cssH);

    const hitW = window.matchMedia('(pointer: coarse)').matches ? 30 : 22;
    dom.hit.setAttribute('x', -hitW / 2); dom.hit.setAttribute('y', 0);
    dom.hit.setAttribute('width', hitW); dom.hit.setAttribute('height', this.cssH);

    const halfH = (el.effectiveHeight() / 2) * this.scale;
    const topY = p.y - halfH, botY = p.y + halfH;
    const selected = el.id === this.selectedId;
    const color = TYPE_COLOR[elementColorKey(el)];

    if (el.type === 'lens') {
      dom.body.setAttribute('d', this._lensPathD(el.kind, topY, botY, halfH));
      dom.hatch.setAttribute('d', '');
    } else {
      dom.body.setAttribute('d', this._mirrorPathD(el.kind, topY, botY, halfH));
      dom.hatch.setAttribute('d', this._mirrorHatchD(topY, botY, el.kind));
      dom.hatch.setAttribute('stroke', color);
      dom.hatch.setAttribute('stroke-width', 1.3);
      dom.hatch.setAttribute('opacity', 0.55);
    }
    dom.body.setAttribute('fill', el.type === 'mirror' ? color + '18' : color + (selected ? '3d' : '22'));
    dom.body.setAttribute('stroke', color);
    dom.body.setAttribute('stroke-width', selected ? 2.6 : 1.8);
    dom.body.style.filter = `drop-shadow(0 0 ${selected ? 7 : 3}px ${color})`;
    dom.plane.setAttribute('stroke', selected ? 'rgba(255,242,204,0.5)' : 'rgba(150,165,200,0.35)');
    dom.body.style.cursor = el.locked ? 'not-allowed' : 'grab';
    dom.hit.style.cursor = el.locked ? 'not-allowed' : 'grab';
    dom.g.setAttribute('opacity', el.locked ? '0.85' : '1');
    if (el.locked) {
      if (!dom.lockBadge) {
        dom.lockBadge = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        dom.lockBadge.setAttribute('font-size', '13');
        dom.lockBadge.setAttribute('text-anchor', 'middle');
        dom.lockBadge.setAttribute('pointer-events', 'none');
        dom.g.appendChild(dom.lockBadge);
      }
      dom.lockBadge.setAttribute('x', 0);
      dom.lockBadge.setAttribute('y', topY - 10);
      dom.lockBadge.setAttribute('fill', 'rgba(255,242,204,0.85)');
      dom.lockBadge.textContent = '🔒';
    } else if (dom.lockBadge) {
      dom.lockBadge.remove();
      dom.lockBadge = null;
    }
  }

  /** Контур лінзи: '()' — збиральна (опукла назовні), ')(' — розсіювальна (угнута всередину). */
  _lensPathD(kind, topY, botY, halfH) {
    const q1 = topY + (botY - topY) * 0.3;
    const q2 = topY + (botY - topY) * 0.7;
    if (kind === 'convex') {
      const bulge = Math.max(9, halfH * 0.26);
      return `M0,${topY} C${bulge},${q1} ${bulge},${q2} 0,${botY} C${-bulge},${q2} ${-bulge},${q1} 0,${topY} Z`;
    }
    const cap = Math.max(7, halfH * 0.16);
    const thin = cap * 0.3;
    return `M${cap},${topY} C${thin},${q1} ${thin},${q2} ${cap},${botY} L${-cap},${botY} C${-thin},${q2} ${-thin},${q1} ${-cap},${topY} Z`;
  }

  /** Контур дзеркала: одна дуга. Угнуте — випукла у бік світла (кут.дужка "( )" відкрита ліворуч),
   *  опукле — випукла назустріч світлу. Товщина підкладки (пласка задня грань) — праворуч. */
  _mirrorPathD(kind, topY, botY, halfH) {
    const bulge = Math.max(10, halfH * 0.3);
    const back = kind === 'concave' ? Math.max(20, halfH * 0.5) : Math.max(6, halfH * 0.12);
    const surfaceBulge = kind === 'concave' ? bulge : -bulge;
    const mid = topY + (botY - topY) * 0.5;
    // передня (відбивна) поверхня — квадратична дуга; задня грань — пласка вертикаль праворуч
    return `M0,${topY} Q${surfaceBulge},${mid} 0,${botY} L${back},${botY} L${back},${topY} Z`;
  }

  _mirrorHatchD(topY, botY, kind) {
    const back = kind === 'concave' ? Math.max(20, (botY - topY) * 0.25) : Math.max(6, (botY - topY) * 0.06);
    const n = Math.max(3, Math.round((botY - topY) / 14));
    let d = '';
    for (let i = 0; i <= n; i++) {
      const y = topY + (i / n) * (botY - topY);
      d += `M${back + 2},${y} L${back + 9},${y + 7} `;
    }
    return d;
  }

  /* --------------------------------- drag & drop (canvas-елементи) --------------------------------- */
  _hitTest(px, py) {
    const touch = window.matchMedia('(pointer: coarse)').matches;
    const tolBase = touch ? 15 : 9;
    const tolTip = touch ? 18 : 12;
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const el = this.elements[i];
      if (el.locked) continue; // елементи-умову задачі не можна перетягувати
      if (el.type === 'lens' || el.type === 'mirror') { continue; } // керуються SVG-шаром
      else if (el.type === 'object') {
        const tip = this.toPx(el.x, el.height);
        const base = this.toPx(el.x, 0);
        if (Math.hypot(px - tip.x, py - tip.y) < tolTip) return { el, mode: 'resize-h' };
        const top = Math.min(tip.y, base.y) - 6, bot = Math.max(tip.y, base.y) + 6;
        if (Math.abs(px - base.x) < tolBase && py > top && py < bot) return { el, mode: 'move-x' };
      } else if (el.type === 'point') {
        const p = this.toPx(el.x, el.y);
        if (Math.hypot(px - p.x, py - p.y) < tolTip) return { el, mode: 'move-xy' };
      } else if (el.type === 'beam') {
        const p = this.toPx(el.x, 0);
        if (Math.abs(px - p.x) < tolTip) return { el, mode: 'move-x' };
      }
    }
    return null;
  }

  _bindEvents() {
    const c = this.canvas;
    c.addEventListener('pointerdown', (e) => {
      const rect = c.getBoundingClientRect();
      const px = e.clientX - rect.left, py = e.clientY - rect.top;
      const hit = this._hitTest(px, py);
      if (hit) {
        c.setPointerCapture(e.pointerId);
        this.drag = hit;
        this.select(hit.el.id);
      } else {
        this.select(null);
      }
    });
    c.addEventListener('pointermove', (e) => {
      if (!this.drag) return;
      const rect = c.getBoundingClientRect();
      const px = e.clientX - rect.left, py = e.clientY - rect.top;
      const w = this.toWorld(px, py);
      const el = this.drag.el;
      const clampedX = clamp(w.x, -DRAG_LIM, DRAG_LIM);
      if (this.drag.mode === 'move-x') {
        el.x = clampedX;
      } else if (this.drag.mode === 'move-xy') {
        el.x = clampedX;
        el.y = clamp(w.y, -70, 70);
      } else if (this.drag.mode === 'resize-h') {
        const h = clamp(Math.abs(w.y), 5, 95);
        el.height = w.y >= 0 ? h : -h;
      }
      this._scheduleRefresh();
    });
    const endDrag = () => { this.drag = null; };
    c.addEventListener('pointerup', endDrag);
    c.addEventListener('pointercancel', endDrag);

    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoomBy(e.deltaY < 0 ? 1.08 : 1 / 1.08);
    }, { passive: false });

    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedId != null) {
        const tag = document.activeElement.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        this.removeElement(this.selectedId);
      }
    });
  }

  /* --------------------------------------- UI-панелі --------------------------------------- */
  refreshAll() {
    this._renderElementsList();
    this._renderProperties();
    this._renderImageInfo();
    this._renderPresetState();
    this._renderTaskPanel();
  }

  _renderElementsList() {
    const ul = document.getElementById('elements-ul');
    const count = document.getElementById('count');
    count.textContent = this.elements.length;
    if (this.elements.length === 0) {
      ul.innerHTML = '<li class="empty">Додайте елемент з панелі зверху</li>';
      return;
    }
    ul.innerHTML = '';
    this.elements.forEach((el, idx) => {
      const li = document.createElement('li');
      li.className = 'el-row' + (el.id === this.selectedId ? ' selected' : '') + (el.locked ? ' locked' : '');
      li.innerHTML = `
        <span class="el-dot" style="background:${TYPE_COLOR[elementColorKey(el)]}"></span>
        <span class="el-name">${el.locked ? '🔒 ' : ''}${elementName(el)} ${idx + 1}</span>
        <span class="el-x">x=${el.x.toFixed(0)}</span>
        ${el.locked ? '' : '<button class="el-del" title="Видалити">✕</button>'}`;
      li.addEventListener('click', (e) => {
        if (e.target.classList.contains('el-del')) return;
        this.select(el.id);
      });
      const delBtn = li.querySelector('.el-del');
      if (delBtn) delBtn.addEventListener('click', () => this.removeElement(el.id));
      ul.appendChild(li);
    });
  }

  _sliderRow(prop, value) {
    const cfg = PROP_CONFIG[prop];
    return `
      <div class="prop-row">
        <label>${cfg.label} <b data-val="${prop}">${value}</b></label>
        <div class="row-inline">
          <input type="range" data-prop="${prop}" min="${cfg.min}" max="${cfg.max}" step="${cfg.step}" value="${value}">
          <input type="number" data-prop="${prop}" min="${cfg.min}" max="${cfg.max}" step="${cfg.step}" value="${value}">
        </div>
      </div>`;
  }

  _renderProperties() {
    const el = this.getById(this.selectedId);
    const key = el ? `${el.type}:${el.id}:${el.locked}` : null;
    if (key !== this._propsBuiltFor) {
      this._propsBuiltFor = key;
      this._buildPropertiesDOM(el);
    } else if (el) {
      this._syncPropertiesValues(el);
    }
  }

  _buildPropertiesDOM(el) {
    const body = document.getElementById('properties-body');
    if (!el) {
      body.innerHTML = '<p class="muted">Оберіть елемент на схемі або у списку.</p>';
      return;
    }
    if (el.locked) {
      const facts = [`x = ${el.x.toFixed(0)} см`];
      if (el.f !== undefined) facts.push(`|F| = ${Math.abs(el.f).toFixed(0)} см (${el.kind === el.positiveKind ? (el.type === 'lens' ? 'збиральна' : 'увігнуте') : (el.type === 'lens' ? 'розсіювальна' : 'опукле')})`);
      if (el.height !== undefined) facts.push(`h = ${Math.abs(el.height).toFixed(0)} см`);
      body.innerHTML = `
        <p class="muted">🔒 ${elementName(el)} — зафіксовано вчителем як умова задачі. Позицію та параметри змінити не можна.</p>
        <div class="img-data">${facts.map((f) => `<div>${f}</div>`).join('')}</div>`;
      return;
    }
    let html = '';
    if (el.type === 'lens' || el.type === 'mirror') {
      const isLens = el.type === 'lens';
      const kindA = isLens ? 'convex' : 'concave';
      const kindB = isLens ? 'concave' : 'convex';
      const labelA = isLens ? 'Збиральна' : 'Увігнуте';
      const labelB = isLens ? 'Розсіювальна' : 'Опукле';
      html += `
        <div class="prop-row">
          <label>Тип ${isLens ? 'лінзи' : 'дзеркала'}</label>
          <div class="seg">
            <button data-action="set-kind" data-kind="${kindA}" class="${el.kind === kindA ? 'active' : ''}">${labelA}</button>
            <button data-action="set-kind" data-kind="${kindB}" class="${el.kind === kindB ? 'active' : ''}">${labelB}</button>
          </div>
        </div>`;
      html += this._sliderRow('x', Math.round(el.x));
      html += this._sliderRow('f', Math.round(Math.abs(el.f)));
      html += `
        <label class="check-row">
          <input type="checkbox" data-action="toggle-size-scale" ${el.sizeScalesWithF ? 'checked' : ''}>
          Розмір ${isLens ? 'лінзи' : 'дзеркала'} залежить від F
        </label>`;
    } else if (el.type === 'object') {
      html += `
        <div class="prop-row">
          <label>Тип предмета</label>
          <div class="shape-grid">
            ${OBJECT_SHAPES.map((s) => `
              <button data-action="set-shape" data-shape="${s.id}" class="shape-btn ${el.shape === s.id ? 'active' : ''}" title="${s.label}">
                ${s.icon}<span>${s.label}</span>
              </button>`).join('')}
          </div>
        </div>`;
      html += this._sliderRow('x', Math.round(el.x));
      html += this._sliderRow('height', Math.round(Math.abs(el.height)));
    } else if (el.type === 'point') {
      html += this._sliderRow('x', Math.round(el.x));
      html += this._sliderRow('y', Math.round(el.y));
      html += this._sliderRow('rayCount', el.rayCount);
      html += this._sliderRow('fanDeg', el.fanDeg);
    } else if (el.type === 'beam') {
      html += this._sliderRow('x', Math.round(el.x));
      html += this._sliderRow('rayCount', el.rayCount);
      html += this._sliderRow('span', el.span);
    }
    html += `
      <label class="check-row task-lock-row">
        <input type="checkbox" data-action="toggle-locked">
        🎓 Зробити умовою задачі (учень не зможе змінювати)
      </label>`;
    html += `<button class="delete-el-btn" data-action="delete">Видалити елемент</button>`;
    body.innerHTML = html;

    body.querySelectorAll('input[data-prop]').forEach((input) => {
      input.addEventListener('input', () => {
        const prop = input.dataset.prop;
        const val = parseFloat(input.value);
        if (Number.isNaN(val)) return;
        if (prop === 'f') {
          el.f = el.kind === el.positiveKind ? val : -val;
        } else if (prop === 'height') {
          el.height = el.height >= 0 ? val : -val;
        } else {
          el[prop] = val;
        }
        this._syncPairedInputs(input, prop, val);
        this._scheduleRefresh();
      });
    });
    body.querySelectorAll('[data-action="set-kind"]').forEach((btn) => {
      btn.addEventListener('click', () => { el.setKind(btn.dataset.kind); this.refreshAll(); });
    });
    body.querySelectorAll('[data-action="set-shape"]').forEach((btn) => {
      btn.addEventListener('click', () => { el.shape = btn.dataset.shape; this.refreshAll(); });
    });
    const scaleChk = body.querySelector('[data-action="toggle-size-scale"]');
    if (scaleChk) scaleChk.addEventListener('change', (e) => { el.sizeScalesWithF = e.target.checked; this._scheduleRefresh(); });
    const lockChk = body.querySelector('[data-action="toggle-locked"]');
    if (lockChk) lockChk.addEventListener('change', (e) => { el.locked = e.target.checked; this.refreshAll(); });
    const delBtn = body.querySelector('[data-action="delete"]');
    if (delBtn) delBtn.addEventListener('click', () => this.removeElement(el.id));
  }

  /** Оновлює лише текстові значення повзунків без перебудови DOM — не перериває активне перетягування. */
  _syncPropertiesValues(el) {
    const body = document.getElementById('properties-body');
    const values = {
      x: Math.round(el.x),
      f: el.f !== undefined ? Math.round(Math.abs(el.f)) : undefined,
      height: el.height !== undefined ? Math.round(Math.abs(el.height)) : undefined,
      y: el.y, rayCount: el.rayCount, fanDeg: el.fanDeg, span: el.span,
    };
    Object.entries(values).forEach(([prop, val]) => {
      if (val === undefined) return;
      body.querySelectorAll(`[data-prop="${prop}"]`).forEach((inp) => {
        if (document.activeElement !== inp) inp.value = val;
      });
      const label = body.querySelector(`[data-val="${prop}"]`);
      if (label) label.textContent = val;
    });
    const scaleChk = body.querySelector('[data-action="toggle-size-scale"]');
    if (scaleChk) scaleChk.checked = !!el.sizeScalesWithF;
    body.querySelectorAll('[data-action="set-kind"]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.kind === el.kind);
    });
    body.querySelectorAll('[data-action="set-shape"]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.shape === el.shape);
    });
  }

  _syncPairedInputs(sourceInput, prop, val) {
    const body = document.getElementById('properties-body');
    body.querySelectorAll(`[data-prop="${prop}"]`).forEach((inp) => {
      if (inp !== sourceInput) inp.value = val;
    });
    const label = body.querySelector(`[data-val="${prop}"]`);
    if (label) label.textContent = Math.round(val);
  }

  _renderImageInfo() {
    const body = document.getElementById('image-info-body');
    const objects = this.elements.filter((e) => e.type === 'object');
    if (objects.length === 0) {
      body.innerHTML = '<p class="muted">Додайте предмет і лінзу/дзеркало, щоб побачити побудову.</p>';
      return;
    }
    let html = '';
    objects.forEach((obj, idx) => {
      const img = this.computeImage(obj);
      html += `<div class="img-card"><div class="title">Предмет ${idx + 1} (x=${obj.x.toFixed(0)} см, h=${obj.height.toFixed(0)} см)</div>`;
      if (img.none) {
        html += `<p class="muted">Праворуч немає жодного оптичного елемента — зображення не утворюється.</p>`;
      } else if (img.infinite) {
        html += `<p class="muted">Промені виходять паралельно — зображення в нескінченності (предмет у фокусі системи).</p>`;
      } else if (img.blocked) {
        html += `<p class="muted">Промінь потрапляє на непрозору (задню) сторону дзеркала — зображення не утворюється з цього боку.</p>`;
      } else {
        const upright = Math.sign(img.y) === Math.sign(obj.height) || Math.abs(img.y) < 0.5;
        const mag = img.y / obj.height;
        const sizeTag = Math.abs(Math.abs(mag) - 1) < 0.03 ? 'рівне за розміром'
          : (Math.abs(mag) > 1 ? 'збільшене' : 'зменшене');
        html += `<div class="img-tags">
          <span class="tag ${img.real ? 'real' : 'virtual'}">${img.real ? 'Дійсне' : 'Уявне'}</span>
          <span class="tag ${upright ? 'upright' : 'inverted'}">${upright ? 'Пряме' : 'Перевернуте'}</span>
          <span class="tag">${sizeTag}</span>
        </div>
        <div class="img-data">
          <div><span>позиція x:</span> ${img.x.toFixed(1)} см</div>
          <div><span>висота h:</span> ${img.y.toFixed(1)} см</div>
          <div><span>збільшення Γ:</span> ${mag.toFixed(2)}×</div>
        </div>`;
      }
      html += `</div>`;
    });
    body.innerHTML = html;
  }

  _renderPresetState() {
    const optic = this.activeOpticForPreset();
    const obj = this.activeObjectForPreset();
    const disabled = !optic || !obj;
    document.querySelectorAll('.preset-btn').forEach((b) => { b.disabled = disabled; });
  }

  /* --------------------------------------- Режим задачі --------------------------------------- */
  getGivenElements() { return this.elements.filter((e) => e.locked); }

  buildTaskPayload({ instructions, criteria, maxScore }) {
    const given = this.getGivenElements().map(serializeElement);
    const description = composeTaskDescription(criteria, instructions);
    return { v: 1, maxScore, criteria, description, given };
  }

  loadTaskFromPayload(payload) {
    this.elements = payload.given.map((d) => deserializeElement(d, true));
    this.selectedId = null;
    this.loadedTask = { description: payload.description, criteria: payload.criteria, maxScore: payload.maxScore };
    this.lastCheck = null;
    this.refreshAll();
  }

  checkSolution() {
    if (!this.loadedTask) return;
    const { criteria, maxScore } = this.loadedTask;
    const studentObjects = this.elements.filter((e) => e.type === 'object' && !e.locked);
    if (studentObjects.length === 0) {
      this.lastCheck = { score: 0, maxScore, breakdown: [], message: 'Додайте предмет, щоб побудувати зображення.' };
    } else {
      let best = null;
      for (const obj of studentObjects) {
        const img = this.computeImage(obj);
        const res = evaluateImage(img, obj, criteria, maxScore);
        if (!best || res.score > best.score) best = res;
      }
      this.lastCheck = best;
    }
    this._renderTaskPanel();
  }

  _renderTaskPanel() {
    const panel = document.getElementById('task-panel');
    if (!this.loadedTask) { panel.classList.add('hidden'); return; }
    panel.classList.remove('hidden');
    document.getElementById('task-max-score').textContent = this.loadedTask.maxScore;
    const body = document.getElementById('task-panel-body');
    let html = `<p class="desc">${escapeHtml(this.loadedTask.description)}</p>`;
    html += `<button class="delete-el-btn primary-btn" data-action="check-solution">Перевірити розв'язання</button>`;
    if (this.lastCheck) {
      const c = this.lastCheck;
      html += `<div class="score-badge"><span class="num">${c.score}</span><span class="of">/ ${c.maxScore} балів</span></div>`;
      html += `<p class="score-msg">${escapeHtml(c.message)}</p>`;
      if (c.breakdown.length) {
        html += `<ul class="crit-list">${c.breakdown.map((b) => `<li class="${b.ok ? 'ok' : 'fail'}"><span class="crit-icon">${b.ok ? '✓' : '✗'}</span>${escapeHtml(b.label)}</li>`).join('')}</ul>`;
      }
    }
    body.innerHTML = html;
  }
}

/* ================================== ІНІЦІАЛІЗАЦІЯ ================================== */
let sim;
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('scene');
  sim = new Simulator(canvas);

  document.querySelectorAll('[data-add]').forEach((btn) => {
    btn.addEventListener('click', () => sim.addElement(btn.dataset.add));
  });
  document.getElementById('clear-all').addEventListener('click', () => {
    if (sim.elements.length === 0) return;
    if (confirm('Очистити всю сцену?')) sim.clearAll();
  });
  document.querySelectorAll('.preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => sim.applyPreset(btn.dataset.preset));
  });

  document.getElementById('zoom-in').addEventListener('click', () => sim.zoomBy(1.15));
  document.getElementById('zoom-out').addEventListener('click', () => sim.zoomBy(1 / 1.15));
  document.getElementById('zoom-reset').addEventListener('click', () => sim.setZoom(1));

  /* ------------------------------- Режим задачі: модальне вікно ------------------------------- */
  const modal = document.getElementById('task-modal');
  const openModal = () => modal.classList.remove('hidden');
  const closeModal = () => modal.classList.add('hidden');
  document.getElementById('open-task-modal').addEventListener('click', openModal);
  document.getElementById('task-modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  document.querySelectorAll('.modal-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.modal-tab').forEach((t) => t.classList.toggle('active', t === tab));
      document.querySelectorAll('.modal-pane').forEach((p) => p.classList.toggle('hidden', p.dataset.pane !== tab.dataset.tab));
    });
  });

  const magEnable = document.getElementById('crit-mag-enable');
  const magRange = document.getElementById('task-mag-range');
  const syncMagRange = () => { magRange.style.display = magEnable.checked ? 'flex' : 'none'; };
  syncMagRange();
  magEnable.addEventListener('change', syncMagRange);

  document.getElementById('generate-task-btn').addEventListener('click', async () => {
    const instructions = document.getElementById('task-instructions').value;
    const maxScore = parseInt(document.getElementById('task-max-score-input').value, 10) || 12;
    const criteria = {
      real: document.getElementById('crit-real').value || null,
      orientation: document.getElementById('crit-orientation').value || null,
      size: document.getElementById('crit-size').value || null,
      mag: magEnable.checked
        ? [parseFloat(document.getElementById('crit-mag-min').value) || 0, parseFloat(document.getElementById('crit-mag-max').value) || 999]
        : null,
    };
    if (sim.getGivenElements().length === 0) {
      alert('Спершу позначте хоча б один елемент як "умову задачі" у його властивостях.');
      return;
    }
    const payload = sim.buildTaskPayload({ instructions, criteria, maxScore });
    const code = encodeTaskCode(payload);
    const btn = document.getElementById('generate-task-btn');
    const oldText = btn.textContent;
    btn.textContent = 'Генерування PDF…'; btn.disabled = true;
    try {
      await generateTaskPDF(payload, code);
    } catch (err) {
      alert('Не вдалося згенерувати PDF: ' + err.message);
    } finally {
      btn.textContent = oldText; btn.disabled = false;
    }
    document.getElementById('task-code-text').value = code;
    document.getElementById('task-code-output').classList.remove('hidden');
  });

  document.getElementById('copy-task-code').addEventListener('click', () => {
    const ta = document.getElementById('task-code-text');
    ta.select();
    navigator.clipboard?.writeText(ta.value).catch(() => document.execCommand('copy'));
  });

  document.getElementById('load-task-btn').addEventListener('click', () => {
    const raw = document.getElementById('student-task-code').value;
    const errEl = document.getElementById('load-task-error');
    errEl.textContent = '';
    if (!raw.trim()) { errEl.textContent = 'Вставте код задачі.'; return; }
    try {
      const payload = decodeTaskCode(raw);
      if (!payload.given) throw new Error('невірний формат');
      sim.loadTaskFromPayload(payload);
      closeModal();
    } catch (err) {
      errEl.textContent = 'Не вдалося прочитати код задачі. Перевірте, чи скопійовано його повністю.';
    }
  });

  document.getElementById('task-panel-body').addEventListener('click', (e) => {
    if (e.target.closest('[data-action="check-solution"]')) sim.checkSolution();
  });
});

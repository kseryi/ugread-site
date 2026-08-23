/**
 * UGREAD Whiteboard - Global Reactive State Manager
 */

class EventEmitter {
  constructor() {
    this.listeners = {};
  }
  on(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
    return () => this.off(event, fn);
  }
  off(event, fn) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(f => f !== fn);
  }
  emit(event, payload) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(fn => fn(payload));
    }
  }
}

export const events = new EventEmitter();

function createDefaultSlide(id = 1) {
  return {
    id,
    title: `Сторінка ${id}`,
    ruling: 'white', // Чиста біла дошка при старті
    rulingScale: 32,
    marginMode: 'none', // Без полів для чистої білої дошки
    drawings: [], // serialized SVG elements / objects
    undoStack: [],
    redoStack: [],
    simulation: null, // { url, type, title, drawOverlayData, overlayVisible: true }
    pdf: null, // { fileData, page, totalPages }
    bgImage: null
  };
}

export const state = {
  // Поточний інструмент
  tool: 'pencil', // pencil | calligraphy | highlighter | laser | eraser | select | shape | text
  shapeType: 'rect', // line | arrow | double_arrow | rect | round_rect | circle | ellipse | triangle | right_triangle | rhombus | trapezoid | pentagon | hexagon | star | coordinate_system
  
  // Властивості лінії та заливки
  strokeColor: '#1e3a8a',
  strokeWidth: 3,
  strokeStyle: 'solid', // solid | dashed | dotted
  fillEnabled: false,
  fillColor: '#60a5fa',
  opacity: 1.0,

  // Режим малювання: 'vector' (Векторний - фігури, вибір, трансформації) або 'raster' (Растровий - піксельне малювання і піксельна гумка)
  drawMode: 'vector',

  // Мультитач (одночасне письмо декількома пальцями / учнями)
  multitouch: true,

  // Активний предметний модуль
  activeSubject: 'math', // primary | ukr | math | geography | physics | chemistry | history | simulations

  // Слайди / Багатосторінковий урок
  currentSlideIndex: 0,
  slides: [createDefaultSlide(1)],

  // Виділені об'єкти
  selectedElements: [],
  clipboard: null,

  // Огляд / Камера (Зум та Панорамування)
  view: {
    scale: 1.0,
    tx: 0,
    ty: 0
  },

  // Стан симуляції
  activeSimulation: null, // { id, name, type, mode: 'interact' | 'draw_over', overlayVisible: true }

  // Екранні інструменти
  instruments: {
    ruler: false,
    protractor: false,
    triangle: false,
    compass: false
  }
};

// Хелпери доступу до поточного слайду
export function getCurrentSlide() {
  if (!state.slides[state.currentSlideIndex]) {
    state.slides[state.currentSlideIndex] = createDefaultSlide(state.currentSlideIndex + 1);
  }
  return state.slides[state.currentSlideIndex];
}

export function setTool(toolName) {
  state.tool = toolName;
  events.emit('tool:change', toolName);
}

export function setShapeType(shape) {
  state.shapeType = shape;
  state.tool = 'shape';
  events.emit('tool:change', 'shape');
  events.emit('shape:change', shape);
}

export function setStrokeColor(color) {
  state.strokeColor = color;
  events.emit('style:change', { strokeColor: color });
}

export function setStrokeWidth(width) {
  state.strokeWidth = width;
  events.emit('style:change', { strokeWidth: width });
}

export function setStrokeStyle(style) {
  state.strokeStyle = style;
  events.emit('style:change', { strokeStyle: style });
}

export function setFillEnabled(enabled) {
  state.fillEnabled = enabled;
  events.emit('style:change', { fillEnabled: enabled });
}

export function setOpacity(opacity) {
  state.opacity = opacity;
  events.emit('style:change', { opacity });
}

export function setRuling(rulingType) {
  const slide = getCurrentSlide();
  slide.ruling = rulingType;
  events.emit('ruling:change', { ruling: rulingType, scale: slide.rulingScale });
}

export function setRulingScale(scale) {
  const slide = getCurrentSlide();
  slide.rulingScale = scale;
  events.emit('ruling:change', { ruling: slide.ruling, scale });
}

export function setMarginMode(mode) {
  const slide = getCurrentSlide();
  slide.marginMode = mode;
  events.emit('ruling:change', { ruling: slide.ruling, scale: slide.rulingScale, marginMode: mode });
}

export function addSlide() {
  const newId = state.slides.length + 1;
  const newSlide = createDefaultSlide(newId);
  // Копіюємо налаштування розліновки з попереднього слайду для зручності вчителя
  const prev = getCurrentSlide();
  if (prev) {
    newSlide.ruling = prev.ruling;
    newSlide.rulingScale = prev.rulingScale;
    newSlide.marginMode = prev.marginMode || 'none';
  }
  state.slides.push(newSlide);
  state.currentSlideIndex = state.slides.length - 1;
  events.emit('slide:change', { index: state.currentSlideIndex, total: state.slides.length });
}

export function deleteCurrentSlide() {
  if (state.slides.length <= 1) {
    // Якщо лише 1 сторінка — очищаємо її малюнки та скидаємо
    const slide = state.slides[0];
    slide.drawingsHtml = '';
    slide.rasterData = null;
    slide.undoStack = [];
    slide.redoStack = [];
    events.emit('slide:change', { index: 0, total: 1 });
    return false; // Позначка що сторінку не видалено, а очищено
  }

  // Видаляємо поточну відкриту сторінку
  state.slides.splice(state.currentSlideIndex, 1);
  if (state.currentSlideIndex >= state.slides.length) {
    state.currentSlideIndex = state.slides.length - 1;
  }
  events.emit('slide:change', { index: state.currentSlideIndex, total: state.slides.length });
  return true; // Сторінку успішно видалено
}

export function switchSlide(index) {
  if (index >= 0 && index < state.slides.length) {
    state.currentSlideIndex = index;
    events.emit('slide:change', { index: state.currentSlideIndex, total: state.slides.length });
  }
}

export function prevSlide() {
  if (state.currentSlideIndex > 0) {
    switchSlide(state.currentSlideIndex - 1);
  }
}

export function nextSlide() {
  if (state.currentSlideIndex < state.slides.length - 1) {
    switchSlide(state.currentSlideIndex + 1);
  }
}

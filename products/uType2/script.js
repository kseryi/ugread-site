/* ════════════════════════════════════════════════════════════════════
   ⚙️ НАЛАШТУВАННЯ ГРИ
   ════════════════════════════════════════════════════════════════════ */
const CONFIG = {
    MAX_LIVES: 5,
    BOSS_SPEED: 3000,
    COIN_SIZE: 24,
    COIN_INTERVAL: 14,
    BOSS_DISTANCE: 4,
    VOLUME: 0.3,
    TILE_SIZE: 80,
    QUEST_PORTAL_FROM: 0.30,   // портал зʼявляється між 30%
    QUEST_PORTAL_TO: 0.40,     // ...і 40% шляху рівня
    QUEST_COINS_MIN: 20,       // мінімум монет у міні-квесті
    QUEST_COINS_MAX: 30,       // максимум монет у міні-квесті
    QUEST_COINS_PER_LIFE: 3,   // обмін: 3 монети = 1 життя
    QUEST_MAX_CONCURRENT: 3,   // скільки монет падає одночасно
    QUEST_SPAWN_MS: 850,       // інтервал появи нової монети
};

const MAX_LIVES = CONFIG.MAX_LIVES;
const COIN_EVERY = CONFIG.COIN_INTERVAL;
const BOSS_DIST = CONFIG.BOSS_DISTANCE;
const LH = 64;
const TW = CONFIG.TILE_SIZE;
const MF = 4; // Максимальна висота підйому

/* ════════════════════════════════════════════════════════════════════
   ЗМІННІ ТА СТАН
   ════════════════════════════════════════════════════════════════════ */
const $ = id => document.getElementById(id);
const mk = (t, c) => { const e = document.createElement(t); if (c) e.className = c; return e; };

let G = { 
    lang: null, 
    grade: null, 
    lessonId: null,
    lessonFile: null, 
    lessonTitle: '', 
    data: null, 
    index: null, 
    bg: 'space', 
    difficulty: 3,
    hero: 'panda',
    studentId: 'default',
    questEnabled: false,   // чи увімкнув учитель міні-квест для цього посилання
    questCoins: 0          // "банк" монет міні-квесту (обмінюється на життя поточного рівня)
};
let eng = null, inp = null, rnd = null, bossTmrs = [];
let soundCtx = null;
let studentProgress = null;
let questState = null;   // стан порталу/пропозиції для поточного рівня
let quest = null;        // активний екземпляр QuestGame (якщо квест триває)

/* ════════════════════════════════════════════════════════════════════
   ГЕРОЇ - SVG ПЕРСОНАЖІВ
   ════════════════════════════════════════════════════════════════════ */
var HEROES = (typeof window !== 'undefined' && window.HEROES) ? window.HEROES : {};

/* ════════════════════════════════════════════════════════════════════
   ТИПИ ХРОБАКІВ ТА ШВИДКІСТЬ (0..5)
   ════════════════════════════════════════════════════════════════════
   0: Нерухомий (швидкість 0, абсолютно стоїть на місці)
   1: Дуже повільний (швидкість 1, інтервал 9500мс)
   2: Повільний (швидкість 2, інтервал 6500мс)
   3: Середній (швидкість 3, інтервал 4200мс)
   4: Швидкий (швидкість 4, інтервал 2600мс)
   5: Максимальний (швидкість 5, інтервал 1500мс)
   ════════════════════════════════════════════════════════════════════ */
function getWormType(difficulty) {
    const num = (difficulty !== undefined && difficulty !== null && !isNaN(Number(difficulty))) ? Number(difficulty) : 3;
    const diff = Math.max(0, Math.min(5, num));
    switch(diff) {
        case 0:
            return { 
                type: 0, 
                name: 'Нерухомий', 
                color: '#757575',
                speed: 0,
                interval: 0,
                emoji: '🛑'
            };
        case 1:
            return { 
                type: 1, 
                name: 'Дуже повільний', 
                color: '#8bc34a',
                speed: 1,
                interval: 9500,
                emoji: '🐢'
            };
        case 2:
            return { 
                type: 2, 
                name: 'Повільний', 
                color: '#4caf50',
                speed: 2,
                interval: 6500,
                emoji: '🐛'
            };
        case 3:
            return { 
                type: 3, 
                name: 'Середній', 
                color: '#ff9800',
                speed: 3,
                interval: 4200,
                emoji: '⚡'
            };
        case 4:
            return { 
                type: 4, 
                name: 'Швидкий', 
                color: '#ff5722',
                speed: 4,
                interval: 2600,
                emoji: '🔥'
            };
        case 5:
        default:
            return { 
                type: 5, 
                name: 'Максимальний', 
                color: '#e91e63',
                speed: 5,
                interval: 1500,
                emoji: '🚀'
            };
    }
}

/* ════════════════════════════════════════════════════════════════════
   СКОУПІНГ ID В SVG (ЗАПОБІГАННЯ КОНФЛІКТІВ ПРИ DISPLAY:NONE ТА ДУБЛЮВАННЯХ)
   ════════════════════════════════════════════════════════════════════ */
function scopeSvg(svgStr, prefix) {
    if (!svgStr || !prefix) return svgStr || '';
    const idRegex = /\bid="([^"]+)"/g;
    const ids = [];
    let m;
    while ((m = idRegex.exec(svgStr)) !== null) {
        if (!ids.includes(m[1])) ids.push(m[1]);
    }
    ids.sort((a, b) => b.length - a.length);
    
    let result = svgStr;
    for (const id of ids) {
        result = result.replaceAll(`id="${id}"`, `id="${prefix}${id}"`);
        result = result.replaceAll(`url(#${id})`, `url(#${prefix}${id})`);
        result = result.replaceAll(`url('#${id}')`, `url('#${prefix}${id}')`);
        result = result.replaceAll(`url(&quot;#${id}&quot;)`, `url(&quot;#${prefix}${id}&quot;)`);
        result = result.replaceAll(`href="#${id}"`, `href="#${prefix}${id}"`);
        result = result.replaceAll(`xlink:href="#${id}"`, `xlink:href="#${prefix}${id}"`);
    }
    return result;
}

/* ════════════════════════════════════════════════════════════════════
   ВСТАНОВЛЕННЯ ГЕРОЯ (ІНТЕГРАЦІЯ SVG ПЕРСОНАЖІВ)
   ════════════════════════════════════════════════════════════════════ */
function setHero(heroId) {
    if (typeof window === 'undefined' || !window.HEROES) return;
    const hero = HEROES[heroId] || HEROES.panda;
    const actualId = hero.id || heroId || 'panda';
    
    // 1. Оновлення персонажа у грі (#playerSvg) з унікальним скоупом 'game_'
    const svgEl = document.getElementById('playerSvg');
    if (svgEl && hero) {
        svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgEl.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
        
        let scopedContent = scopeSvg(hero.svg, 'game_');
        const m = scopedContent.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
        svgEl.innerHTML = m ? m[1] : scopedContent;
    }
    
    // 2. Оновлення аватара та імені в HUD під час бігу з префіксом 'hud_'
    const hudAv = document.getElementById('hudHeroAvatar');
    if (hudAv && hero) {
        hudAv.innerHTML = scopeSvg(hero.svg, 'hud_');
    }
    const hudNm = document.getElementById('hudHeroName');
    if (hudNm && hero) {
        hudNm.textContent = hero.name;
    }
    
    // 3. Оновлення бірки поточного вибору в меню учня
    const tag = document.getElementById('heroSelectedTag');
    if (tag && hero) {
        tag.innerHTML = `${hero.icon} <strong>${hero.name}</strong> • ${hero.title || ''}`;
    }
    
    // 4. Оновлення активної картки у сітці героїв
    const heroGrid = document.getElementById('heroGrid');
    if (heroGrid) {
        heroGrid.querySelectorAll('.hero-opt').forEach(el => {
            el.classList.toggle('active', el.dataset.hero === actualId);
        });
    }
    
    // 5. Оновлення картки на екрані результатів з префіксом 'res_'
    const resAv = document.getElementById('resHeroAvatar');
    if (resAv && hero) {
        resAv.innerHTML = scopeSvg(hero.svg, 'res_');
    }
    const resNm = document.getElementById('resHeroName');
    if (resNm && hero) {
        resNm.textContent = hero.name;
    }
    
    G.hero = actualId;
    localStorage.setItem('selected_hero', actualId);
}

/* ════════════════════════════════════════════════════════════════════
   ЗБЕРІГАННЯ ПРОГРЕСУ УЧНЯ
   ════════════════════════════════════════════════════════════════════ */
class StudentProgress {
    constructor(studentId) {
        this.studentId = studentId || 'default';
        this.storageKey = `keyboard_progress_${this.studentId}`;
        this.data = this.load();
    }
    
    load() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') {
                    // Міграція зі старого формату (один stats-об'єкт -> масив attempts)
                    if (parsed.lessons) {
                        Object.values(parsed.lessons).forEach(l => {
                            if (l.stats && !l.attempts) {
                                l.attempts = [l.stats];
                                delete l.stats;
                            }
                            if (!l.attempts) l.attempts = [];
                        });
                    }
                    if (!parsed.mistakes) parsed.mistakes = {};
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('Помилка завантаження прогресу:', e);
        }
        return {
            lessons: {},
            lastLesson: null,
            totalCompleted: 0,
            mistakes: {}   // { 'а': 5, 'SPACE': 2, ... } — глобальна агрегація по всіх уроках
        };
    }
    
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.warn('Помилка збереження прогресу:', e);
        }
    }
    
    /** Зберігає нову спробу проходження уроку (не перезаписує попередні!) */
    completeLesson(lessonId, stats) {
        if (!this.data.lessons[lessonId]) {
            this.data.lessons[lessonId] = { completed: false, attempts: [] };
        }
        const entry = this.data.lessons[lessonId];
        const prevAttempt = entry.attempts.length ? entry.attempts[entry.attempts.length - 1] : null;
        const attemptNumber = entry.attempts.length + 1;
        const record = { ...stats, attemptNumber };
        entry.attempts.push(record);
        entry.completed = true;
        this.data.lastLesson = lessonId;
        this.data.totalCompleted = Object.values(this.data.lessons).filter(l => l.completed).length;
        this.save();
        return { attemptNumber, prevAttempt, record };
    }
    
    /** Додає помилки поточного проходження до глобальної статистики символів */
    recordMistakes(mistakeLog) {
        if (!mistakeLog) return;
        for (const [ch, count] of Object.entries(mistakeLog)) {
            this.data.mistakes[ch] = (this.data.mistakes[ch] || 0) + count;
        }
        this.save();
    }
    
    getLesson(lessonId) {
        return this.data.lessons[lessonId] || null;
    }
    
    getAttempts(lessonId) {
        return this.data.lessons[lessonId]?.attempts || [];
    }
    
    isCompleted(lessonId) {
        return this.data.lessons[lessonId]?.completed || false;
    }
    
    getStats() {
        const total = Object.keys(this.data.lessons).length;
        const completed = this.data.totalCompleted;
        return { total, completed, percent: total > 0 ? Math.round(completed / total * 100) : 0 };
    }
    
    /** Топ проблемних символів, відсортовано за кількістю помилок */
    getTopMistakes(limit = 15) {
        return Object.entries(this.data.mistakes)
            .sort((a,b) => b[1] - a[1])
            .slice(0, limit)
            .map(([ch, count]) => ({ ch, count }));
    }
    
    /** Агрегація помилок по пальцях (на основі FM-карти розкладки) */
    getFingerMistakes(lang) {
        const map = FM[lang] || FM.en;
        const byFinger = {};
        for (const [ch, count] of Object.entries(this.data.mistakes)) {
            const info = map[ch] || map[ch.toLowerCase()];
            if (!info) continue;
            const key = `${info.h}-${info.f}`;
            byFinger[key] = (byFinger[key] || 0) + count;
        }
        return Object.entries(byFinger)
            .sort((a,b) => b[1] - a[1])
            .map(([key, count]) => {
                const [h, f] = key.split('-');
                return { hand: h, finger: f, count };
            });
    }
    
    /** Список усіх пройдених уроків з останньою спробою, для екрану історії */
    getAllLessonHistory() {
        return Object.entries(this.data.lessons)
            .filter(([,l]) => l.attempts && l.attempts.length)
            .map(([id, l]) => ({ id, attempts: l.attempts }));
    }
}

/* ════════════════════════════════════════════════════════════════════
   👤 ПРОФІЛІ УЧНІВ (ім'я -> локальне збереження прогресу)
   ════════════════════════════════════════════════════════════════════ */
const PROFILES_KEY = 'utype_profiles';

function slugifyName(name) {
    return name.trim().toLowerCase().replace(/\s+/g,'_').replace(/[^a-zа-яїієґ0-9_]/gi,'') || 'учень';
}

function getProfiles() {
    try {
        const raw = localStorage.getItem(PROFILES_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function saveProfile(name) {
    const id = slugifyName(name);
    let profiles = getProfiles();
    const existing = profiles.find(p => p.id === id);
    if (existing) {
        existing.lastUsed = Date.now();
        existing.name = name.trim(); // оновлюємо відображуване ім'я (регістр міг змінитись)
    } else {
        profiles.push({ id, name: name.trim(), lastUsed: Date.now(), createdAt: Date.now() });
    }
    profiles.sort((a,b) => b.lastUsed - a.lastUsed);
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    return id;
}

/* ════════════════════════════════════════════════════════════════════
   🔊 ОЗВУЧЕННЯ СЛІВ СЛОВНИЧКА (Покращений український TTS + Web Audio фолбек)
   ════════════════════════════════════════════════════════════════════ */
let _voicesCache = null;
let _ttsEnabled = (localStorage.getItem('keyboard-tts-enabled') !== '0');

function _loadVoices() {
    if (!('speechSynthesis' in window)) return [];
    const v = window.speechSynthesis.getVoices();
    if (v && v.length) _voicesCache = v;
    return v || [];
}
if ('speechSynthesis' in window) {
    _loadVoices();
    window.speechSynthesis.onvoiceschanged = _loadVoices;
}

// Пошук найбільш якісного та автентичного українського голосу
function getBestVoice(lang) {
    const voices = _voicesCache || _loadVoices();
    if (!voices || !voices.length) return null;
    
    if (lang === 'ua') {
        // Пріоритет: чистий uk-UA / ukr голос
        const uaVoices = voices.filter(v => {
            const l = (v.lang || '').toLowerCase().replace('_', '-');
            return l.startsWith('uk') || l.includes('ua') || (v.name && v.name.toLowerCase().includes('ukrain'));
        });

        if (uaVoices.length > 0) {
            // Пріоритет природним сучасним голосам (Google українська, Microsoft Polina/Ostap, Apple Леся/Тарас)
            const naturalVoice = uaVoices.find(v => {
                const n = (v.name || '').toLowerCase();
                return n.includes('natural') || n.includes('online') || n.includes('polina') || 
                       n.includes('ostap') || n.includes('lesya') || n.includes('taras') || 
                       n.includes('google');
            });
            if (naturalVoice) return naturalVoice;
            
            // Якщо немає преміум, будь-який український голос
            return uaVoices[0];
        }
        return null;
    } else {
        // Англійська мова
        const enVoices = voices.filter(v => (v.lang || '').toLowerCase().startsWith('en'));
        const bestEn = enVoices.find(v => {
            const n = (v.name || '').toLowerCase();
            return n.includes('natural') || n.includes('google') || n.includes('samantha') || n.includes('daniel');
        });
        return bestEn || enVoices[0] || null;
    }
}

function setTtsEnabled(enabled) {
    _ttsEnabled = !!enabled;
    try {
        localStorage.setItem('keyboard-tts-enabled', _ttsEnabled ? '1' : '0');
    } catch (e) {}
    const btn = $('hudSoundToggle');
    if (btn) {
        btn.textContent = _ttsEnabled ? '🔊' : '🔇';
        btn.classList.toggle('off', !_ttsEnabled);
        btn.title = _ttsEnabled ? 'Озвучення слів увімкнено (клікніть щоб вимкнути)' : 'Озвучення слів вимкнено (клікніть щоб увімкнути)';
    }
}

function speakWord(word, lang) {
    if (!word || !_ttsEnabled) return;
    const isUa = (lang === 'ua');

    // 1. Спроба через Web Speech API з вивіреними параметрами
    if ('speechSynthesis' in window) {
        try {
            window.speechSynthesis.cancel(); // не накопичуємо чергу

            const u = new SpeechSynthesisUtterance(word);
            u.lang = isUa ? 'uk-UA' : 'en-US';

            // Підбір найкращого голосу
            const voice = getBestVoice(lang);
            if (voice) {
                u.voice = voice;
            }

            if (isUa) {
                // Для української мови швидкість 0.85 звучала штучно та тягуче,
                // а pitch 1.05 давав неприємний писклявий акцент.
                // Темп 0.96 та висота 1.0 дають природне, чисте та виразне звучання рідною мовою.
                u.rate = 0.96;
                u.pitch = 1.0;
                u.volume = Math.min(1.0, CONFIG.VOLUME + 0.5);
            } else {
                u.rate = 0.90;
                u.pitch = 1.0;
                u.volume = Math.min(1.0, CONFIG.VOLUME + 0.4);
            }

            window.speechSynthesis.speak(u);
            return;
        } catch (e) {
            console.warn('TTS помилка speechSynthesis:', e);
        }
    }
}

/* ════════════════════════════════════════════════════════════════════
   🎵 ЗВУКОВІ ЕФЕКТИ
   ════════════════════════════════════════════════════════════════════ */
class SoundFX {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } 
        catch (e) { this.enabled = false; }
    }
    play(freq, duration = 0.15, type = 'sine', volume = CONFIG.VOLUME) {
        if (!this.enabled || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(this.ctx.currentTime);
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) { /* ігноруємо */ }
    }
    correct() { this.play(523, 0.1, 'sine'); }
    wrong() { this.play(200, 0.3, 'sawtooth'); }
    coin() { this.play(880, 0.08, 'sine'); setTimeout(() => this.play(1100, 0.08, 'sine'), 100); }
    loseLife() { this.play(300, 0.4, 'square'); }
    wormDefeat() { this.play(523, 0.12, 'sine'); setTimeout(() => this.play(659, 0.12, 'sine'), 120); setTimeout(() => this.play(784, 0.15, 'sine'), 240); }
    wormAppear() { this.play(400, 0.3, 'sawtooth'); setTimeout(() => this.play(600, 0.3, 'sawtooth'), 200); }
    wormMiss() { this.play(150, 0.3, 'square'); }
    levelComplete() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.play(f, 0.15, 'sine'), i * 150)); }
    gameOver() { [400, 300, 200].forEach((f, i) => setTimeout(() => this.play(f, 0.4, 'sawtooth'), i * 250)); }
    heroSelect(id) {
        if (!this.enabled || !this.ctx) return;
        try {
            if (id === 'panda') {
                this.play(523, 0.12, 'sine');
                setTimeout(() => this.play(659, 0.16, 'sine'), 90);
            } else if (id === 'knight') {
                this.play(392, 0.1, 'sawtooth');
                setTimeout(() => this.play(523, 0.12, 'sawtooth'), 80);
                setTimeout(() => this.play(784, 0.2, 'sine'), 160);
            } else if (id === 'elf') {
                this.play(659, 0.1, 'sine');
                setTimeout(() => this.play(880, 0.1, 'sine'), 80);
                setTimeout(() => this.play(1318, 0.2, 'triangle'), 160);
            } else if (id === 'viking') {
                this.play(180, 0.22, 'sawtooth');
                setTimeout(() => this.play(270, 0.2, 'triangle'), 100);
            } else if (id === 'princess') {
                [659, 830, 987, 1318].forEach((f, i) => {
                    setTimeout(() => this.play(f, 0.1, 'triangle'), i * 50);
                });
            } else {
                this.play(587, 0.15, 'sine');
            }
        } catch(e) {}
    }
}
const sounds = new SoundFX();

/* ════════════════════════════════════════════════════════════════════
   РОЗКЛАДКИ КЛАВІАТУРИ ТА ПАЛЬЦІ
   ════════════════════════════════════════════════════════════════════ */
const UA_KEYS = {
    // Літери (ряд 2)
    'й':{h:'L',f:'pinky',key:'й'}, 'ц':{h:'L',f:'ring',key:'ц'}, 'у':{h:'L',f:'mid',key:'у'}, 'к':{h:'L',f:'idx',key:'к'}, 'е':{h:'L',f:'idx',key:'е'},
    'н':{h:'R',f:'idx',key:'н'}, 'г':{h:'R',f:'idx',key:'г'}, 'ш':{h:'R',f:'mid',key:'ш'}, 'щ':{h:'R',f:'ring',key:'щ'}, 'з':{h:'R',f:'pinky',key:'з'}, 'х':{h:'R',f:'pinky',key:'х'}, 'ї':{h:'R',f:'pinky',key:'ї'},
    // Літери (ряд 3 - домашній ряд)
    'ф':{h:'L',f:'pinky',key:'ф'}, 'і':{h:'L',f:'ring',key:'і'}, 'в':{h:'L',f:'mid',key:'в'}, 'а':{h:'L',f:'idx',key:'а'}, 'п':{h:'L',f:'idx',key:'п'},
    'р':{h:'R',f:'idx',key:'р'}, 'о':{h:'R',f:'idx',key:'о'}, 'л':{h:'R',f:'mid',key:'л'}, 'д':{h:'R',f:'ring',key:'д'}, 'ж':{h:'R',f:'pinky',key:'ж'}, 'є':{h:'R',f:'pinky',key:'є'},
    // Літери (ряд 4)
    'я':{h:'L',f:'pinky',key:'я'}, 'ч':{h:'L',f:'ring',key:'ч'}, 'с':{h:'L',f:'mid',key:'с'}, 'м':{h:'L',f:'idx',key:'м'}, 'и':{h:'L',f:'idx',key:'и'},
    'т':{h:'R',f:'idx',key:'т'}, 'ь':{h:'R',f:'idx',key:'ь'}, 'б':{h:'R',f:'mid',key:'б'}, 'ю':{h:'R',f:'ring',key:'ю'},
    'ґ':{h:'L',f:'pinky',key:'ґ'},
    // Цифри (ряд 1)
    '1':{h:'L',f:'pinky',key:'1'}, '2':{h:'L',f:'ring',key:'2'}, '3':{h:'L',f:'mid',key:'3'}, '4':{h:'L',f:'idx',key:'4'}, '5':{h:'L',f:'idx',key:'5'},
    '6':{h:'R',f:'idx',key:'6'}, '7':{h:'R',f:'idx',key:'7'}, '8':{h:'R',f:'mid',key:'8'}, '9':{h:'R',f:'ring',key:'9'}, '0':{h:'R',f:'pinky',key:'0'},
    '-':{h:'R',f:'pinky',key:'-'}, '=':{h:'R',f:'pinky',key:'='},
    // Розділові знаки
    '.':{h:'R',f:'pinky',key:'.',shift:false},
    ',':{h:'R',f:'pinky',key:'.',shift:true,shiftKey:'L'},
    '!':{h:'L',f:'pinky',key:'1',shift:true,shiftKey:'R'},
    '?':{h:'R',f:'idx',key:'7',shift:true,shiftKey:'L'},
    ':':{h:'R',f:'idx',key:'6',shift:true,shiftKey:'L'},
    ';':{h:'L',f:'idx',key:'4',shift:true,shiftKey:'R'},
    '"':{h:'L',f:'ring',key:'2',shift:true,shiftKey:'R'},
    '«':{h:'L',f:'ring',key:'2',shift:true,shiftKey:'R'},
    '»':{h:'L',f:'ring',key:'2',shift:true,shiftKey:'R'},
    '\'':{h:'R',f:'pinky',key:'\'',shift:false},
    '’':{h:'R',f:'pinky',key:'\'',shift:false},
    '—':{h:'R',f:'pinky',key:'-',shift:false},
    '–':{h:'R',f:'pinky',key:'-',shift:false},
    '№':{h:'L',f:'mid',key:'3',shift:true,shiftKey:'R'},
    '(':{h:'R',f:'ring',key:'9',shift:true,shiftKey:'L'},
    ')':{h:'R',f:'pinky',key:'0',shift:true,shiftKey:'L'},
    ' ':{h:'both',f:'thumb',key:' ',shift:false},
    '\n':{h:'R',f:'pinky',key:'enter',shift:false}
};

const EN_KEYS = {
    // Row 2
    'q':{h:'L',f:'pinky',key:'q'}, 'w':{h:'L',f:'ring',key:'w'}, 'e':{h:'L',f:'mid',key:'e'}, 'r':{h:'L',f:'idx',key:'r'}, 't':{h:'L',f:'idx',key:'t'},
    'y':{h:'R',f:'idx',key:'y'}, 'u':{h:'R',f:'idx',key:'u'}, 'i':{h:'R',f:'mid',key:'i'}, 'o':{h:'R',f:'ring',key:'o'}, 'p':{h:'R',f:'pinky',key:'p'},
    '[':{h:'R',f:'pinky',key:'['}, ']':{h:'R',f:'pinky',key:']'},
    // Row 3
    'a':{h:'L',f:'pinky',key:'a'}, 's':{h:'L',f:'ring',key:'s'}, 'd':{h:'L',f:'mid',key:'d'}, 'f':{h:'L',f:'idx',key:'f'}, 'g':{h:'L',f:'idx',key:'g'},
    'h':{h:'R',f:'idx',key:'h'}, 'j':{h:'R',f:'idx',key:'j'}, 'k':{h:'R',f:'mid',key:'k'}, 'l':{h:'R',f:'ring',key:'l'},
    ';':{h:'R',f:'pinky',key:';',shift:false},
    '\'':{h:'R',f:'pinky',key:'\'',shift:false},
    '’':{h:'R',f:'pinky',key:'\'',shift:false},
    // Row 4
    'z':{h:'L',f:'pinky',key:'z'}, 'x':{h:'L',f:'ring',key:'x'}, 'c':{h:'L',f:'mid',key:'c'}, 'v':{h:'L',f:'idx',key:'v'}, 'b':{h:'L',f:'idx',key:'b'},
    'n':{h:'R',f:'idx',key:'n'}, 'm':{h:'R',f:'idx',key:'m'},
    ',':{h:'R',f:'mid',key:',',shift:false},
    '.':{h:'R',f:'ring',key:'.',shift:false},
    '/':{h:'R',f:'pinky',key:'/',shift:false},
    // Row 1
    '`':{h:'L',f:'pinky',key:'`'}, '1':{h:'L',f:'pinky',key:'1'}, '2':{h:'L',f:'ring',key:'2'}, '3':{h:'L',f:'mid',key:'3'}, '4':{h:'L',f:'idx',key:'4'}, '5':{h:'L',f:'idx',key:'5'},
    '6':{h:'R',f:'idx',key:'6'}, '7':{h:'R',f:'idx',key:'7'}, '8':{h:'R',f:'mid',key:'8'}, '9':{h:'R',f:'ring',key:'9'}, '0':{h:'R',f:'pinky',key:'0'},
    '-':{h:'R',f:'pinky',key:'-'}, '=':{h:'R',f:'pinky',key:'='},
    // Punctuation
    '!':{h:'L',f:'pinky',key:'1',shift:true,shiftKey:'R'},
    '?':{h:'R',f:'pinky',key:'/',shift:true,shiftKey:'L'},
    ':':{h:'R',f:'pinky',key:';',shift:true,shiftKey:'L'},
    '"':{h:'R',f:'pinky',key:'\'',shift:true,shiftKey:'L'},
    '—':{h:'R',f:'pinky',key:'-',shift:false},
    '–':{h:'R',f:'pinky',key:'-',shift:false},
    '(':{h:'R',f:'ring',key:'9',shift:true,shiftKey:'L'},
    ')':{h:'R',f:'pinky',key:'0',shift:true,shiftKey:'L'},
    ' ':{h:'both',f:'thumb',key:' ',shift:false},
    '\n':{h:'R',f:'pinky',key:'enter',shift:false}
};

const FM = { ua: UA_KEYS, en: EN_KEYS };

const KEYBOARDS = {
    ua: {
        rows: [
            [
                { c: '1', s: '!' }, { c: '2', s: '"' }, { c: '3', s: '№' }, { c: '4', s: ';' }, { c: '5', s: '%' },
                { c: '6', s: ':' }, { c: '7', s: '?' }, { c: '8', s: '*' }, { c: '9', s: '(' }, { c: '0', s: ')' },
                { c: '-', s: '_' }, { c: '=', s: '+' }
            ],
            [
                { c: 'й' }, { c: 'ц' }, { c: 'у' }, { c: 'к' }, { c: 'е' },
                { c: 'н' }, { c: 'г' }, { c: 'ш' }, { c: 'щ' }, { c: 'з' }, { c: 'х' }, { c: 'ї' }
            ],
            [
                { c: 'ф' }, { c: 'і' }, { c: 'в' }, { c: 'а' }, { c: 'п' },
                { c: 'р' }, { c: 'о' }, { c: 'л' }, { c: 'д' }, { c: 'ж' }, { c: 'є' }, { c: '\'', s: '’' }
            ],
            [
                { c: 'я' }, { c: 'ч' }, { c: 'с' }, { c: 'м' }, { c: 'и' },
                { c: 'т' }, { c: 'ь' }, { c: 'б' }, { c: 'ю' }, { c: '.', s: ',' }
            ],
            [
                { type: 'shift', label: '⇧ Shift', hand: 'L', wide: 'shift-l' },
                { type: 'space', label: 'ПРОБІЛ (SPACE)', wide: 'space' },
                { type: 'shift', label: '⇧ Shift', hand: 'R', wide: 'shift-r' },
                { type: 'enter', label: '↵ Enter', hand: 'R', wide: 'enter' }
            ]
        ]
    },
    en: {
        rows: [
            [
                { c: '1', s: '!' }, { c: '2', s: '@' }, { c: '3', s: '#' }, { c: '4', s: '$' }, { c: '5', s: '%' },
                { c: '6', s: '^' }, { c: '7', s: '&' }, { c: '8', s: '*' }, { c: '9', s: '(' }, { c: '0', s: ')' },
                { c: '-', s: '_' }, { c: '=', s: '+' }
            ],
            [
                { c: 'q' }, { c: 'w' }, { c: 'e' }, { c: 'r' }, { c: 't' },
                { c: 'y' }, { c: 'u' }, { c: 'i' }, { c: 'o' }, { c: 'p' }, { c: '[', s: '{' }, { c: ']', s: '}' }
            ],
            [
                { c: 'a' }, { c: 's' }, { c: 'd' }, { c: 'f' }, { c: 'g' },
                { c: 'h' }, { c: 'j' }, { c: 'k' }, { c: 'l' }, { c: ';', s: ':' }, { c: '\'', s: '"' }
            ],
            [
                { c: 'z' }, { c: 'x' }, { c: 'c' }, { c: 'v' }, { c: 'b' },
                { c: 'n' }, { c: 'm' }, { c: ',', s: '<' }, { c: '.', s: '>' }, { c: '/', s: '?' }
            ],
            [
                { type: 'shift', label: '⇧ Shift', hand: 'L', wide: 'shift-l' },
                { type: 'space', label: 'SPACE (ПРОБІЛ)', wide: 'space' },
                { type: 'shift', label: '⇧ Shift', hand: 'R', wide: 'shift-r' },
                { type: 'enter', label: '↵ Enter', hand: 'R', wide: 'enter' }
            ]
        ]
    }
};
const LAYOUTS = KEYBOARDS;

/* ════════════════════════════════════════════════════════════════════
   ДОПОМІЖНІ ФУНКЦІЇ
   ════════════════════════════════════════════════════════════════════ */
function show(id) { document.querySelectorAll('.scr').forEach(s => s.classList.remove('on')); $(id).classList.add('on'); }
function toast(msg) { const t = $('toastEl'); t.textContent = msg; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 1200); }
function parseLesson(data) {
    // data — вже розпарсований об'єкт (з index.json або завантаженого .json файлу)
    if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch(e) { toast('⚠️ Помилка читання файлу!'); return null; }
    }
    return {
        title: data.title || 'Урок',
        text:  data.text  || '',
        words: (data.words || []).map(w => String(w).trim().toLowerCase()).filter(Boolean)
    };
}

/* ════════════════════════════════════════════════════════════════════
   ПАРСЕР РІВНЯ
   ════════════════════════════════════════════════════════════════════
   ЛОГІКА РІВНІВ:
   ⬆️ Великі літери (A-Z, А-Я) -> підйом на 1 рівень
   ⬆️ Розділові знаки (.,!?) -> підйом на 1 рівень
   ⬇️ Перехід на новий рядок (\n, \r) -> спуск на 1 рівень
   ➡️ Малі літери -> залишаються на поточному рівні
   ════════════════════════════════════════════════════════════════════ */
class LP {
    static parse(text) {
        const o = [];
        let fl = 0; // поточний рівень (floor)
        
        for (const ch of text) {
            // ⬇️ ПЕРЕХІД НА НОВИЙ РЯДОК - СПУСК (Enter = ігровий елемент!)
            if (ch === '\n' || ch === '\r') {
                const old = fl;
                fl = Math.max(0, fl - 1);
                o.push({ 
                    char: '\n',
                    type: 'checkpoint',
                    req: true,       // ← гравець МУСИТЬ натиснути Enter
                    floor: old, 
                    nf: fl 
                });
            } 
            // ПРОБІЛ - РОЗРИВ
            else if (ch === ' ') {
                o.push({ char: ch, type: 'gap', req: false, floor: fl });
                o.push({ char: '', type: 'rest', req: false, floor: fl });
            } 
            // ⬆️ РОЗДІЛОВІ ЗНАКИ ТА СПЕЦСИМВОЛИ - ПІДЙОМ
            else if (/[.,!?—–\-':;"«»()№]/.test(ch)) {
                const old = fl;
                fl = Math.min(MF, fl + 1); // Підйом на 1 рівень (не вище MF)
                o.push({ 
                    char: ch, 
                    type: 'hit', 
                    req: /[!?":;()№]/.test(ch) || (G.lang === 'ua' && ch === ','), 
                    floor: old, 
                    rise: fl 
                });
            } 
            // ⬆️ ВЕЛИКІ ЛІТЕРИ - ПІДЙОМ
            else if (/[A-ZА-ЯЇІЄҐ]/.test(ch)) {
                const land = Math.min(MF, fl + 1); // Підйом на 1 рівень
                o.push({ 
                    char: ch, 
                    type: 'step', 
                    req: true, 
                    base: fl, 
                    floor: land 
                });
                fl = land; // Оновлюємо поточний рівень
            } 
            // МАЛІ ЛІТЕРИ - ЗАЛИШАЮТЬСЯ НА МІСЦІ
            else {
                o.push({ 
                    char: ch, 
                    type: 'run', 
                    req: false, 
                    floor: fl 
                });
            }
        }
        return o;
    }
}

/* ════════════════════════════════════════════════════════════════════
   КЛАС ХРОБАКА
   ════════════════════════════════════════════════════════════════════ */
class Worm {
    constructor(word, ti, difficulty) {
        this.word = word;
        this.ti = ti;
        this.typed = 0;
        this.alive = true;
        this.fighting = false;
        this.el = null;
        this.difficulty = difficulty;
        this.wormType = getWormType(difficulty);
    }
    get cur() { return this.word[this.typed]; }
    get pct() { return this.typed / this.word.length; }
    hit() { this.typed++; if (this.typed >= this.word.length) this.alive = false; }
    miss() { this.typed = 0; }
    getSpeed() { return this.wormType.speed; }
    getInterval() { return this.wormType.interval; }
}

/* ════════════════════════════════════════════════════════════════════
   ІГРОВИЙ РУШІЙ
   ════════════════════════════════════════════════════════════════════ */
class GE {
    constructor(obs, worms, coins, cb) {
        this.obs = [{char:'',type:'start',req:false,floor:0}, ...obs];
        this.worms = worms;
        this.coins = coins;
        this.cb = cb;
        this.i = 1;
        this.lives = MAX_LIVES;
        this.err = 0;
        this.ok = 0;
        this.ctotal = 0;
        this.cbank = 0;
        this.bk = 0;
        this.t0 = Date.now();
        this.tEnd = null;
        this.done = false;
        this.dead = false;
        this.aw = null;
        this.mistakeLog = {}; // { 'а': 3, 'SPACE': 1, 'ENTER': 2, ... }
        while (this.cur && this.cur.type === 'rest') this.i++;
    }
    get cur() { return this.obs[this.i]; }
    get elapsed() { return Math.max(((this.tEnd||Date.now())-this.t0)/60000,1/3600); }
    get cpm() { return Math.round(this.ok/this.elapsed); }
    
    key(ch, shift, space, isEnter=false) {
        if (this.done || this.dead) return;
        if (this.aw) {
            const w = this.aw;
            if (ch === w.cur) { w.hit(); this.cb('wh',{w}); if(!w.alive){ this.bk++; this.aw=null; sounds.wormDefeat(); this.cb('wd',{w}); } }
            else {
                this.mistakeLog[w.cur] = (this.mistakeLog[w.cur] || 0) + 1;
                w.miss(); sounds.wormMiss(); this.cb('wm',{w});
            }
            return;
        }
        const t = this.cur;
        if (!t || t.type === 'rest') return;  // checkpoint тепер інтерактивний
        const nw = this.worms.find(w => w.alive && !w.fighting && w.ti > this.i && w.ti - this.i <= BOSS_DIST);
        if (nw) { nw.fighting=true; this.aw=nw; sounds.wormAppear(); this.cb('ws',{w:nw}); return; }
        const good = this.validate(t,ch,shift,space,isEnter);
        if (good) { this.ok++; sounds.correct(); this.cb('cor',{t}); this.chkCoin(this.i); this.adv(); }
        else {
            this.err++; this.lives--; sounds.wrong();
            const logKey = t.type === 'gap' ? 'SPACE' : t.type === 'checkpoint' ? 'ENTER' : t.char;
            this.mistakeLog[logKey] = (this.mistakeLog[logKey] || 0) + 1;
            this.cb('wrg',{t});
            questTryRefundLife(this);
            if(this.lives<=0){ this.dead=true; this.tEnd=Date.now(); sounds.gameOver(); this.cb('over',{}); }
        }
    }
    
    validate(t,ch,sh,sp,isEnter=false) {
        switch(t.type) {
            case 'gap':        return sp;
            case 'step':       return sh && ch === t.char;
            case 'run':        
                return (!sh && ch === t.char)
                    || (t.char === '’' && (ch === '\'' || ch === '’'))
                    || (t.char === '\'' && (ch === '\'' || ch === '’'))
                    || ((t.char === '—' || t.char === '–') && ch === '-');
            case 'hit':        
                return ch === t.char
                    || (t.char === '’' && (ch === '\'' || ch === '’'))
                    || (t.char === '\'' && (ch === '\'' || ch === '’'))
                    || ((t.char === '—' || t.char === '–') && ch === '-');
            case 'checkpoint': return isEnter;   // Enter = спуск
            default:           return ch === t.char;
        }
    }
    
    chkCoin(i) {
        if (!this.coins.has(i)) return;
        this.coins.delete(i);
        this.ctotal++;
        this.cbank++;
        sounds.coin();
        if (this.cbank >= 3) { this.cbank=0; this.lives=Math.min(this.lives+1,MAX_LIVES); this.cb('lu',{}); }
        else this.cb('coin',{});
    }
    
    adv() {
        this.i++;
        while (this.cur && this.cur.type === 'rest') { this.i++; }
        if (this.i >= this.obs.length) { this.done=true; this.tEnd=Date.now(); sounds.levelComplete(); this.cb('fin',{}); }
        else this.cb('adv',{t:this.cur});
    }
    
    wormTouch() { this.dead=true; this.tEnd=Date.now(); sounds.gameOver(); this.cb('over',{worm:true}); }
}

/* ════════════════════════════════════════════════════════════════════
   🌀 МІНІ-КВЕСТ: портал, пропозиція, ловля монет
   ════════════════════════════════════════════════════════════════════
   - Портал зʼявляється один раз на рівні, між 30% і 40% шляху.
   - Учень може прийняти квест або відмовитись і продовжити рівень.
   - У квесті падають ~20-30 монет з літерами слів поточного уроку;
     гравець натискає відповідну літеру, щоб зловити монету.
   - Пропущена монета (торкнулась платформи) → квест завершується.
   - Усі зловлені монети лишаються "в банку" (G.questCoins) і не
     зникають; коли гравець втрачає життя на ПОТОЧНОМУ рівні, банк
     автоматично обмінюється: 3 монети = 1 життя, доки не заповнене.
   ════════════════════════════════════════════════════════════════════ */

/** Обмін монет квесту на життя. Викликається одразу після втрати життя. */
function questTryRefundLife(engine) {
    if (!G.questEnabled) return;
    let refunded = false;
    while (G.questCoins >= CONFIG.QUEST_COINS_PER_LIFE && engine.lives < MAX_LIVES) {
        G.questCoins -= CONFIG.QUEST_COINS_PER_LIFE;
        engine.lives++;
        refunded = true;
    }
    if (refunded) {
        updateQuestBankUI();
        engine.cb('questRefund', {});
    }
}

function updateQuestBankUI() {
    const el = $('questCoinsEl');
    if (!el) return;
    el.style.display = G.questEnabled ? 'flex' : 'none';
    el.textContent = `🪙 ${G.questCoins}`;
}

/** Швидкість падіння монет (px за тік), невелика, трохи росте зі складністю уроку. */
function questFallSpeed(difficulty) {
    const map = { 0: 0.6, 1: 0.8, 2: 1.0, 3: 1.3, 4: 1.7, 5: 2.1 };
    const d = (difficulty !== undefined && difficulty !== null) ? Number(difficulty) : 3;
    return map[d] !== undefined ? map[d] : 1.3;
}

/** Будує чергу літер для монет виключно зі слів поточного уроку. */
function buildQuestLetterQueue(words) {
    const min = CONFIG.QUEST_COINS_MIN, max = CONFIG.QUEST_COINS_MAX;
    const count = min + Math.floor(Math.random() * (max - min + 1));
    const clean = (words || []).map(w => String(w || '').trim()).filter(Boolean);
    const letters = [];
    if (!clean.length) return letters; // немає слів — квест не будуємо
    let wi = 0, guard = 0;
    while (letters.length < count && guard < 2000) {
        const word = clean[wi % clean.length];
        for (const ch of word) {
            if (/\s/.test(ch)) continue;
            letters.push(ch);
            if (letters.length >= count) break;
        }
        wi++; guard++;
    }
    return letters;
}

class QuestGame {
    constructor(words, onEnd) {
        this.queue = buildQuestLetterQueue(words);
        this.total = this.queue.length;
        this.collected = 0;
        this.onEnd = onEnd;
        this.active = [];
        this.ended = false;
        this.spawnTimer = null;
        this.loopTimer = null;
        this.fallSpeed = questFallSpeed(G.difficulty);
        this._key = this._key.bind(this);
    }

    start() {
        if (!this.total) { this.ended = true; this.onEnd(false, 0, 0); return; }
        updateQuestProgressUI(this);
        this._spawnNext();
        this.spawnTimer = setInterval(() => this._spawnNext(), CONFIG.QUEST_SPAWN_MS);
        this.loopTimer = setInterval(() => this._tick(), 40);
        document.addEventListener('keydown', this._key);
    }

    stop() {
        clearInterval(this.spawnTimer);
        clearInterval(this.loopTimer);
        document.removeEventListener('keydown', this._key);
        this.active.forEach(c => c.el.remove());
        this.active = [];
    }

    _spawnNext() {
        if (this.ended) return;
        if (this.active.length >= CONFIG.QUEST_MAX_CONCURRENT) return;
        if (!this.queue.length) { clearInterval(this.spawnTimer); return; }
        const ch = this.queue.shift();
        const area = $('questArea');
        if (!area) return;
        const areaWidth = area.offsetWidth || 500;
        const el = mk('div', 'quest-coin');
        el.textContent = ch.toUpperCase();
        const x = 16 + Math.random() * Math.max(10, areaWidth - 16 - 42 - 16);
        el.style.left = x + 'px';
        el.style.top = '-46px';
        area.appendChild(el);
        this.active.push({ char: ch, el, y: -46 });
    }

    _tick() {
        if (this.ended) return;
        const area = $('questArea');
        if (!area) return;
        const floorY = (area.offsetHeight || 360) - 56;
        for (const c of this.active) {
            c.y += this.fallSpeed;
            c.el.style.top = c.y + 'px';
            if (c.y >= floorY) { this._fail(); return; }
        }
    }

    _key(ev) {
        if (this.ended) return;
        if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(ev.key)) return;
        ev.preventDefault();
        const pressed = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key;
        let best = null;
        for (const c of this.active) {
            if (c.char.toLowerCase() === pressed && (!best || c.y > best.y)) best = c;
        }
        if (!best) return;
        best.el.classList.add('caught');
        setTimeout(() => best.el.remove(), 150);
        this.active = this.active.filter(c => c !== best);
        this.collected++;
        G.questCoins++;
        updateQuestBankUI();
        updateQuestProgressUI(this);
        sounds.coin?.();
        if (!this.active.length && !this.queue.length) this._success();
        else this._spawnNext();
    }

    _fail() {
        if (this.ended) return;
        this.ended = true;
        this.stop();
        this.onEnd(false, this.collected, this.total);
    }

    _success() {
        if (this.ended) return;
        this.ended = true;
        this.stop();
        this.onEnd(true, this.collected, this.total);
    }
}

function updateQuestProgressUI(q) {
    const el = $('questProgressText');
    if (el) el.textContent = `${q.collected}/${q.total}`;
}

/** Викликається на кожен прогрес рівня — перевіряє, чи час показати портал. */
function checkQuestPortal() {
    if (!questState || !questState.enabled || questState.offered) return;
    if (questState.portalIndex == null) return;
    if (eng.aw) return; // не заважаємо бою з хробаком — спробуємо на наступному кроці
    if (eng.i < questState.portalIndex) return;
    questState.offered = true;
    inp?.off();
    $('questOffer')?.classList.add('on');
}

function declineQuestOffer() {
    $('questOffer')?.classList.remove('on');
    rnd?.removePortal?.();
    inp?.on();
}

function acceptQuestOffer() {
    $('questOffer')?.classList.remove('on');
    rnd?.removePortal?.();
    startQuestScene();
}

function startQuestScene() {
    const words = (questState && questState.words) || [];
    $('questScene')?.classList.add('on');
    quest = new QuestGame(words, onQuestEnd);
    quest.start();
}

function onQuestEnd(success, collected, total) {
    $('questScene')?.classList.remove('on');
    quest = null;
    if (questState) questState.completed = true;
    const ua = G.lang === 'ua';
    if (!total) {
        toast(ua ? '🌀 Портал зник...' : '🌀 The portal fades...');
    } else if (success) {
        toast(ua ? `🎉 Квест пройдено! Зловлено ${collected}/${total} монет` : `🎉 Quest complete! Caught ${collected}/${total} coins`);
    } else {
        toast(ua ? `🌀 Квест завершено. Зловлено ${collected}/${total} монет` : `🌀 Quest ended. Caught ${collected}/${total} coins`);
    }
    inp?.on();
    rnd?.running(true);
}

/* ════════════════════════════════════════════════════════════════════
   ВВІД З КЛАВІАТУРИ
   ════════════════════════════════════════════════════════════════════ */
class IC {
    constructor(e) {
        this.e = e;
        this.fn = ev => {
            if (['Shift','Control','Alt','Meta','CapsLock','Tab'].includes(ev.key)) return;
            ev.preventDefault();
            const sp      = ev.code === 'Space';
            const isEnter = ev.key === 'Enter';
            const ch      = sp ? ' ' : isEnter ? '\n' : ev.key;
            this.e.key(ch, ev.shiftKey, sp, isEnter);
        };
    }
    on() { document.addEventListener('keydown', this.fn); }
    off() { document.removeEventListener('keydown', this.fn); }
}

/* ════════════════════════════════════════════════════════════════════
   SVG БУДІВНИКИ
   ════════════════════════════════════════════════════════════════════ */
function handSVG(side = 'L') {
    const isL = side === 'L';
    if (isL) {
        return `<svg viewBox="0 0 120 140" class="hand-svg hand-l-svg">
            <path class="palm" d="M 16,68 C 14,102 24,128 54,128 C 78,128 92,106 88,72 C 84,66 76,66 70,68 C 62,68 54,68 46,68 C 38,68 30,68 22,68 Z"/>
            <rect class="fg" data-f="pinky" x="14" y="38" width="13" height="42" rx="6.5"/>
            <rect class="fg" data-f="ring" x="32" y="20" width="14" height="60" rx="7"/>
            <rect class="fg" data-f="mid" x="51" y="10" width="14.5" height="70" rx="7.25"/>
            <rect class="fg" data-f="idx" x="70" y="22" width="14" height="58" rx="7"/>
            <g class="thumb-wrap" transform="rotate(30 78 86)">
                <rect class="fg" data-f="thumb" x="72" y="78" width="34" height="15" rx="7.5"/>
            </g>
            <path class="wrist" d="M 28 124 Q 54 132 80 124"/>
            <text class="hand-lbl" x="52" y="106" text-anchor="middle">ЛІВА</text>
        </svg>`;
    } else {
        return `<svg viewBox="0 0 120 140" class="hand-svg hand-r-svg">
            <path class="palm" d="M 32,72 C 28,106 42,128 66,128 C 96,128 106,102 104,68 C 98,68 90,68 82,68 C 74,68 66,68 58,68 C 52,66 44,66 40,72 Z"/>
            <g class="thumb-wrap" transform="rotate(-30 42 86)">
                <rect class="fg" data-f="thumb" x="14" y="78" width="34" height="15" rx="7.5"/>
            </g>
            <rect class="fg" data-f="idx" x="36" y="22" width="14" height="58" rx="7"/>
            <rect class="fg" data-f="mid" x="54.5" y="10" width="14.5" height="70" rx="7.25"/>
            <rect class="fg" data-f="ring" x="74" y="20" width="14" height="60" rx="7"/>
            <rect class="fg" data-f="pinky" x="93" y="38" width="13" height="42" rx="6.5"/>
            <path class="wrist" d="M 40 124 Q 66 132 92 124"/>
            <text class="hand-lbl" x="68" y="106" text-anchor="middle">ПРАВА</text>
        </svg>`;
    }
}

/* ════════════════════════════════════════════════════════════════════
   РЕНДЕРИНГ
   ════════════════════════════════════════════════════════════════════ */
class Rnd {
    constructor(lang, bg) {
        this.lang = lang;
        this.bg = (bg === 'castle' || bg === 'kingdom') ? 'kingdom' : (bg || 'space');
        this.difficulty = (G.difficulty !== undefined && G.difficulty !== null) ? Number(G.difficulty) : 3;
        this._applyBg();
        this._setupScenery();
        this._kb();
        $('hL').innerHTML = handSVG('L');
        $('hR').innerHTML = handSVG('R');
        this._initParallax();
        const heroId = G.hero || localStorage.getItem('selected_hero') || 'panda';
        this._setHero(heroId);
    }
    
    _setHero(heroId) {
        setHero(heroId);
    }
    
    _setupScenery() {
        const stage = $('stage');
        if (typeof window !== 'undefined' && window.Scenery && window.Scenery.apply) {
            window.Scenery.apply(this.bg, stage);
        } else {
            this._clouds();
            this._ridge($('rfar'), 150, 14);
            this._ridge($('rnear'), 110, 10);
            this._trees();
        }
    }

    _applyBg() {
        const stage = $('stage');
        stage.className = 'stage';
        if (this.bg) stage.classList.add('bg-' + this.bg);
        const playBtn = $('teacherPlay');
        if (playBtn) {
            const colors = { 
                space: '#0a0a3e', 
                dungeon: '#22110c', 
                forest: '#0f331e', 
                underwater: '#003a6a', 
                kingdom: '#111322',
                castle: '#111322'
            };
            const color = colors[this.bg] || '#0a0a3e';
            playBtn.style.background = color;
            playBtn.style.borderColor = color;
            playBtn.style.color = '#fff';
        }
    }
    
    _initParallax() {
        const stage = $('stage');
        stage.addEventListener('mousemove', (e) => {
            const rect = stage.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            const p1 = $('parallax1');
            const p2 = $('parallax2');
            const p3 = $('parallax3');
            if (p1) p1.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
            if (p2) p2.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
            if (p3) p3.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
        });
    }
    
    _clouds() {
        const cl = $('clouds');
        cl.innerHTML = '';
        [{t:'10%',l:'5%',w:90,h:28,d:'24s'},{t:'20%',l:'42%',w:72,h:22,d:'30s'},{t:'7%',l:'68%',w:100,h:30,d:'20s'},{t:'28%',l:'84%',w:60,h:20,d:'26s'}].forEach((c,i)=>{
            const e=mk('div','cloud');
            Object.assign(e.style,{top:c.t,left:c.l,width:c.w+'px',height:c.h+'px',borderRadius:'50px',animation:`cdrift ${c.d} linear ${i*-4}s infinite`});
            cl.appendChild(e);
        });
    }
    
    _ridge(el,h,amp) {
        el.style.height = h + 'px';
        const pts = [`0 ${h}`];
        let y = h*.55, d=1;
        for (let x=0; x<=5000; x+=110) {
            y += d*(amp+(x%233<110?amp*.4:0));
            y = Math.max(8, Math.min(h-6, y));
            pts.push(`${x} ${h-y}`);
            d *= -1;
        }
        pts.push(`5000 ${h}`);
        el.style.clipPath = `polygon(${pts.join(',')})`;
    }
    
    _trees() {
        const t = $('trees');
        t.innerHTML = '';
        let x = 10;
        while (x < 5000) {
            const h = 36 + (x%90);
            const e = mk('div');
            Object.assign(e.style,{position:'absolute',bottom:'0',left:x+'px',width:'0',height:'0',borderLeft:'8px solid transparent',borderRight:'8px solid transparent',borderBottom:h+'px solid var(--tree)'});
            t.appendChild(e);
            x += 46 + (x%53);
        }
    }
    
    _kb() {
        const p = $('kbrows');
        p.innerHTML = '';
        const kb = KEYBOARDS[this.lang] || KEYBOARDS.ua;
        kb.rows.forEach(row => {
            const r = mk('div', 'kbrow');
            row.forEach(item => {
                if (item.type === 'shift') {
                    const k = mk('div', 'kk ' + item.wide);
                    k.dataset.sh = item.hand;
                    k.textContent = item.label;
                    r.appendChild(k);
                } else if (item.type === 'space') {
                    const k = mk('div', 'kk ' + item.wide);
                    k.dataset.c = ' ';
                    k.textContent = item.label;
                    r.appendChild(k);
                } else if (item.type === 'enter') {
                    const k = mk('div', 'kk ' + item.wide);
                    k.dataset.enter = '1';
                    k.textContent = item.label;
                    r.appendChild(k);
                } else {
                    const hasSub = !!item.s;
                    const k = mk('div', 'kk' + (hasSub ? ' kk-dual' : ''));
                    k.dataset.c = item.c;
                    if (item.s) k.dataset.s = item.s;
                    
                    if (hasSub) {
                        const sub = mk('span', 'kk-sub');
                        sub.textContent = item.s;
                        const main = mk('span', 'kk-main');
                        main.textContent = item.c;
                        k.append(sub, main);
                    } else {
                        const main = mk('span', 'kk-main');
                        main.textContent = item.c;
                        k.appendChild(main);
                    }
                    r.appendChild(k);
                }
            });
            p.appendChild(r);
        });
    }
    
    buildTrack(obs, coins) {
        const track = $('track');
        track.innerHTML = '';
        obs.forEach((o,i) => {
            const t = mk('div','tile '+o.type);
            t.dataset.i = i;
            let w = TW * 0.75, h = 32, bot = 0;
            if (o.type === 'step') { w = TW * 0.5; bot = o.base * LH; h = (o.floor - o.base) * LH + 32; }
            else if (o.type === 'gap') { w = TW * 0.4; h = 12; bot = o.floor * LH; }
            else if (o.type === 'hit') { w = TW * 0.65; bot = o.floor * LH; h = o.rise > o.floor ? (o.rise - o.floor) * LH + 36 : 32; }
            else if (o.type === 'checkpoint') { w = TW * 0.75; bot = o.floor * LH; h = 32; }
            else { w = o.type === 'rest' ? TW * 0.6 : TW * 0.75; h = o.type === 'rest' ? 30 : 32; bot = (o.floor||0) * LH; }
            Object.assign(t.style, { left: i * TW + 'px', bottom: bot + 'px', width: w + 'px', height: h + 'px' });
            if (o.type === 'checkpoint') { t.textContent = '↵'; t.title = 'Enter'; }
            else if (!['gap','start','rest'].includes(o.type)) t.textContent = o.char;
            const lbl = mk('span','tlbl');
            lbl.textContent = { run:'', step:'Shift↑', gap:'Space', hit:'↑', checkpoint:'', start:'', rest:'' } [o.type] || '';
            t.appendChild(lbl);
            if (coins.has(i)) { const c = mk('div','coin-s'); t.appendChild(c); }
            track.appendChild(t);
        });
    }
    
    spawnWorm(worm, obs) {
        const o = obs[worm.ti], fl = o ? o.floor||0 : 0;
        const wrap = mk('div','worm-wrap');
        wrap.id = 'ww'+worm.ti;
        wrap.classList.add('worm-type-' + worm.wormType.type);
        
        const hp = mk('div','worm-hp'), hpf = mk('div','worm-hp-fill');
        hpf.id = 'whp'+worm.ti;
        hp.appendChild(hpf);
        wrap.appendChild(hp);
        
        this._buildWormBody(wrap, worm);
        wrap.style.bottom = (90 + 28 + fl * LH) + 'px';
        worm.el = wrap;
        $('stage').appendChild(wrap);
        this.moveWorm(worm, 1);
    }
    
    _buildWormBody(wrap, worm) {
        [...wrap.children].forEach(c => { if(!c.classList.contains('worm-hp')) c.remove(); });
        
        const head = mk('div','w-head');
        const el = mk('div','w-eye el'), er = mk('div','w-eye er');
        el.innerHTML = '<div class="w-pupil"></div>';
        er.innerHTML = '<div class="w-pupil"></div>';
        head.append(el, er, mk('div','w-mouth'));
        wrap.appendChild(head);
        
        worm.word.split('').forEach((ch, i) => {
            const seg = mk('div', 'w-seg' + (i < worm.typed ? ' eaten' : ''));
            seg.textContent = ch.toUpperCase();
            seg.style.animationDelay = (i * 0.07) + 's';
            wrap.appendChild(seg);
        });
        wrap.appendChild(mk('div','w-tail'));
    }
    
    refreshWorm(worm) {
        if (!worm.el) return;
        worm.el.querySelectorAll('.w-seg').forEach((s, i) => {
            i < worm.typed ? s.classList.add('eaten') : s.classList.remove('eaten');
        });
        const f = $('whp'+worm.ti);
        if (f) f.style.width = (worm.pct * 100) + '%';
        this.bossPanel(worm);
    }
    
    moveWorm(worm, si) {
        if (!worm.el) return;
        const stageWidth = $('stage').offsetWidth;
        const pos = (stageWidth/2 - 32 + (worm.ti - si) * TW);
        worm.el.style.left = pos + 'px';
    }
    
    removeWorm(worm) { worm.el?.remove(); $('bpanel').classList.remove('on'); }
    
    lock(from, n, on) { for (let i=from; i<from+n; i++) { $('track').querySelector(`[data-i="${i}"]`)?.classList.toggle('locked', on); } }
    
    bossPanel(worm) {
        const pan = $('bpanel'), lts = $('blets');
        if (!worm || !worm.alive) { pan.classList.remove('on'); return; }
        pan.classList.add('on');
        lts.innerHTML = '';
        for (let i = 0; i < worm.word.length; i++) {
            const b = mk('div', 'bl' + (i < worm.typed ? ' ok' : ''));
            b.textContent = i < worm.typed ? worm.word[i].toUpperCase() : '?';
            lts.appendChild(b);
        }
    }
    
    flashMiss() {
        $('blets').querySelectorAll('.bl').forEach(b => {
            b.classList.add('bad');
            setTimeout(() => b.classList.remove('bad'), 420);
        });
    }
    
    parallax(si) {
        const s = si * TW;
        $('rfar').style.transform = `translateX(-${s*.18}px)`;
        $('rnear').style.transform = `translateX(-${s*.38}px)`;
        $('trees').style.transform = `translateX(-${s*.65}px)`;
    }
    
    flOf(o) { if(!o) return 0; if(o.type==='hit') return o.rise||o.floor||0; if(o.type==='checkpoint') return o.nf||0; return o.floor||0; }
    
    cam(e) {
        const si = e.i - 1;
        $('track').style.transform = `translateX(-${si * TW}px)`;
        this.parallax(si);
        $('pwrap').style.transform = `translate(-50%,-${this.flOf(e.obs[si]) * LH}px)`;
        e.worms.forEach(w => { if (w.alive) this.moveWorm(w, si); });
    }
    
    hi(i) { $('track').querySelectorAll('.tile').forEach(t => t.classList.remove('cur')); $('track').querySelector(`[data-i="${i}"]`)?.classList.add('cur'); }
    done(i) { $('track').querySelector(`[data-i="${i}"]`)?.classList.add('done'); }
    rmCoin(i) { $('track').querySelector(`[data-i="${i}"] .coin-s`)?.remove(); }

    /** Малює портал міні-квесту на позиції i треку (та ж система координат, що й тайли). */
    showPortal(i, floor) {
        this.removePortal();
        const track = $('track');
        if (!track) return;
        const el = mk('div', 'portal');
        el.id = 'questPortal';
        Object.assign(el.style, { left: (i * TW + TW / 2 - 28) + 'px', bottom: ((floor || 0) * LH + 28) + 'px' });
        track.appendChild(el);
    }
    removePortal() { $('questPortal')?.remove(); }
    
    prompt(obs, bm, bch) {
        if (bm) { 
            $('pkeyEl').textContent = '⚔️ ХРОБАК'; 
            this.kb(null, bch); 
            this.hands(null, bch); 
            return; 
        }
        if (!obs) { 
            $('pkeyEl').textContent = '—'; 
            this.kb(null); 
            this.hands(null); 
            return; 
        }
        if (obs.type === 'checkpoint') { 
            $('pkeyEl').textContent = '↵ ENTER'; 
            this.kb(obs); 
            this.hands(obs); 
            return; 
        }
        if (obs.type === 'gap') { 
            $('pkeyEl').textContent = '␣ ПРОБІЛ'; 
            this.kb(obs); 
            this.hands(obs); 
            return; 
        }
        
        const ch = obs.char;
        const map = (this.lang === 'en' ? EN_KEYS : UA_KEYS);
        const inf = map[ch] || map[ch.toLowerCase()];
        const isLetterUpper = /[A-ZА-ЯЇІЄҐ]/.test(ch);
        const needsShift = (inf && inf.shift) || (obs.req && isLetterUpper);
        
        if (needsShift) {
            if (inf && inf.key && inf.key !== ch.toLowerCase()) {
                $('pkeyEl').textContent = `Shift + ${inf.key} ( ${ch} )`;
            } else {
                $('pkeyEl').textContent = `Shift + ${ch}`;
            }
        } else {
            if (ch === '\'' || ch === '’') $('pkeyEl').textContent = '\' (апостроф)';
            else if (ch === '-' || ch === '—' || ch === '–') $('pkeyEl').textContent = '- (дефіс)';
            else if (ch === '.') $('pkeyEl').textContent = '. (крапка)';
            else $('pkeyEl').textContent = ch;
        }
        
        this.kb(obs); 
        this.hands(obs);
    }
    
    warn(on) { $('promptEl').classList.toggle('warn', on); }
    running(on) { $('player').classList.toggle('run', on); }
    
    anim(type, ok) {
        const p = $('player');
        p.classList.remove('js','jg','jd','fail');
        this.running(false);
        if (!ok) { p.classList.add('fail'); setTimeout(()=>{ p.classList.remove('fail'); this.running(true); },280); return; }
        if (type === 'step') p.classList.add('js');
        else if (type === 'gap') p.classList.add('jg');
        else if (type === 'checkpoint') p.classList.add('jd');
        else this.running(true);
        setTimeout(()=>{ p.classList.remove('js','jg','jd'); this.running(true); setTimeout(()=>this.running(false),160); },170);
    }
    
    kb(obs, bch) {
        const p = $('kbrows');
        p.querySelectorAll('.kk').forEach(k => { 
            k.classList.remove('a', 'kr', 'ks', 'kg', 'kh', 'kb', 'sub-active'); 
        });
        
        if (bch) {
            const lower = bch.toLowerCase();
            const keyEl = p.querySelector(`.kk[data-c="${lower}"], .kk[data-s="${bch}"]`);
            if (keyEl) keyEl.classList.add('a', 'kb');
            return;
        }
        if (!obs) return;
        
        if (obs.type === 'checkpoint') {
            p.querySelector('[data-enter]')?.classList.add('a', 'kg');
            return;
        }
        if (obs.type === 'gap') {
            p.querySelector('[data-c=" "]')?.classList.add('a', 'kg');
            return;
        }
        
        const cl = { run: 'kr', step: 'ks', gap: 'kg', hit: 'kh' }[obs.type] || 'kr';
        const ch = obs.char;
        const lower = ch.toLowerCase();
        const map = (this.lang === 'en' ? EN_KEYS : UA_KEYS);
        const info = map[ch] || map[lower];
        
        let keyEl = null;
        let isSub = false;
        
        if (info && info.key) {
            keyEl = p.querySelector(`.kk[data-c="${info.key}"]`);
            if (info.shift) isSub = true;
        }
        if (!keyEl) keyEl = p.querySelector(`.kk[data-c="${ch}"]`);
        if (!keyEl) keyEl = p.querySelector(`.kk[data-c="${lower}"]`);
        if (!keyEl) {
            keyEl = p.querySelector(`.kk[data-s="${ch}"]`);
            if (keyEl) isSub = true;
        }
        
        if (keyEl) {
            keyEl.classList.add('a', cl);
            if (isSub) keyEl.classList.add('sub-active');
        }
        
        const isLetterUpper = /[A-ZА-ЯЇІЄҐ]/.test(ch);
        const needsShift = (info && info.shift) || (obs.req && isLetterUpper);
        if (needsShift) {
            const shiftHand = (info && info.shiftKey) ? info.shiftKey : (info?.h === 'L' ? 'R' : 'L');
            const shiftEl = p.querySelector(`[data-sh="${shiftHand}"]`) || p.querySelector('[data-sh]');
            if (shiftEl) shiftEl.classList.add('a', 'ks');
        }
    }
    
    hands(obs, bch) {
        [$('hL'), $('hR')].forEach(h => {
            h.querySelectorAll('.fg').forEach(f => {
                f.classList.remove('a', 'fr', 'fs', 'fg2', 'fh', 'fb');
            });
        });
        
        const map = (this.lang === 'en' ? EN_KEYS : UA_KEYS);
        
        if (bch) {
            const inf = map[bch] || map[bch.toLowerCase()];
            if (inf) {
                const h = inf.h === 'L' ? $('hL') : $('hR');
                h.querySelector(`[data-f="${inf.f}"]`)?.classList.add('a', 'fb');
            }
            return;
        }
        if (!obs) return;
        
        if (obs.type === 'gap') {
            [$('hL'), $('hR')].forEach(h => {
                h.querySelector('[data-f="thumb"]')?.classList.add('a', 'fg2');
            });
            return;
        }
        
        if (obs.type === 'checkpoint') {
            $('hR').querySelector('[data-f="pinky"]')?.classList.add('a', 'fg2');
            return;
        }
        
        const cl = { run: 'fr', step: 'fs', gap: 'fg2', hit: 'fh' }[obs.type] || 'fr';
        const ch = obs.char;
        const lower = ch.toLowerCase();
        const inf = map[ch] || map[lower];
        
        if (inf) {
            const h = inf.h === 'L' ? $('hL') : $('hR');
            h.querySelector(`[data-f="${inf.f}"]`)?.classList.add('a', cl);
        }
        
        const isLetterUpper = /[A-ZА-ЯЇІЄҐ]/.test(ch);
        const needsShift = (inf && inf.shift) || (obs.req && isLetterUpper);
        if (needsShift) {
            const shiftHand = (inf && inf.shiftKey) ? inf.shiftKey : (inf?.h === 'L' ? 'R' : 'L');
            const shHandEl = shiftHand === 'L' ? $('hL') : $('hR');
            shHandEl.querySelector('[data-f="pinky"]')?.classList.add('a', 'fs');
        }
    }
    
    coinsUI(bank, tot) {
        const el = $('coinsEl');
        el.innerHTML = '';
        for (let i=0; i<3; i++) { const d = mk('div','cdot'+(i<bank?'':' off')); el.appendChild(d); }
        const s = mk('span'); s.textContent = ` × ${tot}`; el.appendChild(s);
    }
    
    hud(e) {
        const hb = $('heartsEl');
        hb.innerHTML = '';
        for (let i=0; i<MAX_LIVES; i++) { const h = mk('div','heart'+(i<e.lives?'':' off')); hb.appendChild(h); }
        $('progEl').textContent = `${Math.min(e.i,e.obs.length)}/${e.obs.length}`;
        $('errEl').textContent = `Помилки: ${e.err}`;
    }
}

/* ════════════════════════════════════════════════════════════════════
   🎨 УПРАВЛІННЯ ТЕМАМИ
   ════════════════════════════════════════════════════════════════════ */
const THEMES = [
    { id: 'light', name: '🌞 Світла' },
    { id: 'dark', name: '🌙 Темна' },
    { id: 'space', name: '🚀 Космічна' },
    { id: 'forest', name: '🌲 Лісова' },
    { id: 'retro', name: '🕹️ Ретро' }
];
let currentTheme = 0;

function applyTheme(index) {
    currentTheme = (index + THEMES.length) % THEMES.length;
    const themeId = THEMES[currentTheme].id;
    document.body.className = 'theme-' + themeId;
    localStorage.setItem('keyboard-theme', themeId);
}

function toggleTheme() { applyTheme(currentTheme + 1); toast(`🎨 Тема: ${THEMES[currentTheme].name}`); }

const savedTheme = localStorage.getItem('keyboard-theme');
if (savedTheme) { const idx = THEMES.findIndex(t => t.id === savedTheme); if (idx >= 0) applyTheme(idx); }
document.querySelectorAll('.theme-toggle').forEach(btn => { btn.addEventListener('click', toggleTheme); });

/* ════════════════════════════════════════════════════════════════════
   УПРАВЛІННЯ ФОНАМИ
   ════════════════════════════════════════════════════════════════════ */
const BGS = ['space', 'dungeon', 'forest', 'underwater', 'kingdom'];
const BG_NAMES = { 
    space: '🚀 Космос', 
    dungeon: '🏰 Підземелля', 
    forest: '🌲 Таємничий ліс', 
    underwater: '🌊 Підводне царство', 
    kingdom: '👑 Королівство',
    castle: '👑 Королівство'
};
const BG_COLORS = { 
    space: '#0a0a3e', 
    dungeon: '#22110c', 
    forest: '#0f331e', 
    underwater: '#003a6a', 
    kingdom: '#111322',
    castle: '#111322'
};

function selectBg(bgId) {
    const norm = (bgId === 'castle' || bgId === 'kingdom') ? 'kingdom' : (bgId || 'space');
    G.bg = norm;
    localStorage.setItem('keyboard-bg', norm);
    document.querySelectorAll('.bg-opt').forEach(b => {
        const bNorm = (b.dataset.bg === 'castle' || b.dataset.bg === 'kingdom') ? 'kingdom' : b.dataset.bg;
        b.classList.toggle('active', bNorm === norm);
    });
    const preview = $('bgPreviewInner');
    if (preview) {
        preview.style.background = _getBgStyle(norm);
        preview.style.minHeight = '120px';
        preview.style.borderRadius = '8px';
        preview.style.transition = 'background .5s';
    }
    const color = BG_COLORS[norm] || '#0a0a3e';
    const playBtn = $('teacherPlay');
    if (playBtn) {
        playBtn.style.background = color;
        playBtn.style.borderColor = color;
        playBtn.style.color = '#fff';
    }
    const studentPlayBtn = $('studentPlay');
    if (studentPlayBtn) {
        studentPlayBtn.style.background = color;
        studentPlayBtn.style.borderColor = color;
        studentPlayBtn.style.color = '#fff';
    }
    const lessonCurrentBg = $('lessonCurrentBg');
    if (lessonCurrentBg) {
        lessonCurrentBg.textContent = BG_NAMES[norm] || '🚀 Космос';
    }
    const studentBgName = $('studentBgName');
    if (studentBgName) {
        studentBgName.textContent = BG_NAMES[norm] || '🚀 Космос';
    }
    updateStudentLink();
}

function setDifficulty(val) {
    const num = (val !== null && val !== undefined && !isNaN(parseInt(val, 10)))
        ? Math.max(0, Math.min(5, parseInt(val, 10)))
        : 3;
    G.difficulty = num;
    localStorage.setItem('keyboard-diff', String(num));

    // Синхронізація повзунка в s-grade
    const diffSlider = document.getElementById('difficultySlider');
    if (diffSlider && diffSlider.value !== String(num)) {
        diffSlider.value = String(num);
    }
    const diffValue = document.getElementById('diffValue');
    if (diffValue) diffValue.textContent = String(num);

    // Синхронізація повзунка в s-lesson
    const lessonDiffSlider = document.getElementById('lessonDiffSlider');
    if (lessonDiffSlider && lessonDiffSlider.value !== String(num)) {
        lessonDiffSlider.value = String(num);
    }
    const lessonDiffVal = document.getElementById('lessonDiffVal');
    if (lessonDiffVal) lessonDiffVal.textContent = String(num);

    const wt = getWormType(num);
    const diffType = document.getElementById('diffType');
    if (diffType) {
        diffType.innerHTML = `🐛 Швидкість: <strong>${num} — ${wt.name}</strong> ${wt.emoji}`;
    }

    const lessonCurrentDiff = document.getElementById('lessonCurrentDiff');
    if (lessonCurrentDiff) {
        lessonCurrentDiff.innerHTML = `${num} — ${wt.name} ${wt.emoji}`;
    }

    updateStudentLink();
}

function updateStudentLink() {
    if (!G.lessonId) return;
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('role', 'student');
    url.searchParams.set('lang', G.lang || 'ua');
    if (G.grade) url.searchParams.set('grade', G.grade);
    url.searchParams.set('lid', G.lessonId);
    url.searchParams.set('diff', (G.difficulty !== undefined && G.difficulty !== null) ? G.difficulty : 3);
    url.searchParams.set('bg', G.bg || 'space');
    const questChecked = !!$('questToggle')?.checked;
    G.questEnabled = questChecked;
    if (questChecked) url.searchParams.set('quest', '1');
    else url.searchParams.delete('quest');
    
    const linkEl = $('linkText');
    if (linkEl) linkEl.textContent = url.toString();

    const lessonCurrentBg = $('lessonCurrentBg');
    if (lessonCurrentBg) {
        lessonCurrentBg.textContent = BG_NAMES[G.bg] || '🚀 Космос';
    }
    const lessonCurrentDiff = $('lessonCurrentDiff');
    if (lessonCurrentDiff) {
        const wt = getWormType(G.difficulty);
        lessonCurrentDiff.innerHTML = `${G.difficulty} — ${wt.name} ${wt.emoji}`;
    }
}

function _getBgStyle(bgId) {
    const norm = (bgId === 'castle' || bgId === 'kingdom') ? 'kingdom' : bgId;
    const styles = {
        space: 'radial-gradient(ellipse at center, #0a0a3e 0%, #1a1a5e 40%, #0a0a2e 100%)',
        dungeon: 'linear-gradient(180deg, #1b0e0c 0%, #2e1611 40%, #120807 100%)',
        forest: 'linear-gradient(180deg, #092014 0%, #123d24 40%, #06160e 100%)',
        underwater: 'linear-gradient(180deg, #001f3f 0%, #004080 40%, #001933 100%)',
        kingdom: 'linear-gradient(180deg, #090a16 0%, #111425 40%, #0e0d18 100%)'
    };
    return styles[norm] || styles.space;
}

/* ════════════════════════════════════════════════════════════════════
   ІНІЦІАЛІЗАЦІЯ СТОРІНКИ УЧНЯ ТА ВІДОБРАЖЕННЯ ГЕРОЇВ
   ════════════════════════════════════════════════════════════════════ */
function renderHeroGrid() {
    const heroGrid = document.getElementById('heroGrid');
    if (!heroGrid || typeof window === 'undefined' || !window.HEROES) return;
    
    const savedHero = localStorage.getItem('selected_hero') || G.hero || 'panda';
    heroGrid.innerHTML = '';
    
    const heroOrder = ['panda', 'knight', 'elf', 'viking', 'princess'];
    const keys = Object.keys(HEROES);
    const sortedKeys = heroOrder.filter(k => keys.includes(k)).concat(keys.filter(k => !heroOrder.includes(k)));
    
    sortedKeys.forEach(heroId => {
        const hero = HEROES[heroId];
        const opt = document.createElement('div');
        opt.className = `hero-opt ${heroId === savedHero ? 'active' : ''}`;
        opt.dataset.hero = heroId;
        opt.setAttribute('role', 'button');
        opt.setAttribute('tabindex', '0');
        opt.setAttribute('title', `${hero.name} — ${hero.title || ''}`);
        
        // Скоупимо ID градієнтів персонажа для картки сітки
        const cardSvg = scopeSvg(hero.svg, `card_${heroId}_`);
        
        opt.innerHTML = `
            <div class="hero-badge-active">✓</div>
            <div class="hero-avatar">${cardSvg}</div>
            <div class="hero-info">
                <span class="hero-name">${hero.name}</span>
                <span class="hero-title">${hero.title || ''}</span>
            </div>
        `;
        
        const selectAction = () => {
            setHero(heroId);
            if (sounds && sounds.heroSelect) sounds.heroSelect(heroId);
            if (rnd) rnd._setHero(heroId);
        };
        
        opt.addEventListener('click', selectAction);
        opt.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectAction();
            }
        });
        
        heroGrid.appendChild(opt);
    });
}

function initStudentPage() {
    const savedHero = localStorage.getItem('selected_hero') || 'panda';
    
    renderHeroGrid();
    G.hero = savedHero;
    setHero(savedHero);

    // Оновлюємо інформацію про локацію та складність для учня
    const currentBg = G.bg || 'space';
    const stBgEl = $('studentBgName');
    if (stBgEl) stBgEl.textContent = BG_NAMES[currentBg] || '🚀 Космос';
    const stPlay = $('studentPlay');
    if (stPlay) {
        stPlay.style.background = BG_COLORS[currentBg] || '#0a0a3e';
        stPlay.style.borderColor = BG_COLORS[currentBg] || '#0a0a3e';
        stPlay.style.color = '#fff';
    }
    const stDiff = $('studentDiff');
    if (stDiff) stDiff.textContent = G.difficulty;
    const wt = getWormType(G.difficulty);
    const stDiffType = $('studentDiffType');
    if (stDiffType) stDiffType.textContent = `(${wt.name})`;
    
    studentProgress = new StudentProgress(G.studentId);
    updateProgressDisplay();
}

function updateProgressDisplay() {
    const grid = document.getElementById('progressGrid');
    if (!grid) return;
    
    const stats = studentProgress.getStats();
    document.getElementById('progressStats').textContent = `${stats.completed}/${stats.total || 0}`;
    
    const lessons = G.index?.[G.lang]?.[G.grade] || [];
    const totalLessons = lessons.length;
    
    if (totalLessons === 0) {
        grid.innerHTML = '<span style="color:var(--dim);font-size:12px;grid-column:span 10;">Немає уроків для відображення</span>';
        return;
    }
    
    grid.innerHTML = '';
    lessons.forEach((lesson, index) => {
        const item = document.createElement('div');
        item.className = 'progress-item';
        const completed = studentProgress.isCompleted(lesson.id);
        const isCurrent = lesson.id === studentProgress.data.lastLesson;
        
        if (completed) item.classList.add('completed');
        if (isCurrent) item.classList.add('current');
        if (!completed) item.classList.add('locked');
        
        item.textContent = index + 1;
        
        if (completed) {
            const lessonData = studentProgress.getLesson(lesson.id);
            const attempts = lessonData?.attempts || [];
            const s = attempts[attempts.length - 1]; // остання спроба
            if (s) {
                const tip = document.createElement('div');
                tip.className = 'tooltip';
                tip.innerHTML = `
                    <div class="tip-row"><span class="tip-label">📚 Урок</span><span class="tip-value">${lesson.title}</span></div>
                    <div class="tip-row"><span class="tip-label">🔁 Спроба</span><span class="tip-value">№${attempts.length}</span></div>
                    <div class="tip-row"><span class="tip-label">✅ Правильних</span><span class="tip-value good">${s.ok || 0}</span></div>
                    <div class="tip-row"><span class="tip-label">❌ Помилок</span><span class="tip-value ${s.err > 5 ? 'bad' : 'good'}">${s.err || 0}</span></div>
                    <div class="tip-row"><span class="tip-label">⚡ CPM</span><span class="tip-value">${s.cpm || 0}</span></div>
                    <div class="tip-row"><span class="tip-label">🪙 Монет</span><span class="tip-value">${s.coins || 0}</span></div>
                    <div class="tip-row"><span class="tip-label">🐛 Хробаків</span><span class="tip-value">${s.bosses || 0}</span></div>
                    <div class="tip-row"><span class="tip-label">❤️ Життів</span><span class="tip-value">${s.lives || 0}</span></div>
                `;
                item.appendChild(tip);
            }
            item.addEventListener('click', () => showHistoryFor(lesson.id, lesson.title));
        }
        grid.appendChild(item);
    });
}

/* ════════════════════════════════════════════════════════════════════
   UI ПОТІК
   ════════════════════════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════════════════════
   👤 ЕКРАН ВИБОРУ ПРОФІЛЮ (ІМ'Я УЧНЯ)
   ════════════════════════════════════════════════════════════════════ */
function showNameScreen() {
    const list = $('nameList');
    const profiles = getProfiles();
    list.innerHTML = '';
    if (profiles.length) {
        profiles.forEach(p => {
            const btn = mk('div','name-chip');
            btn.innerHTML = `<span class="name-chip-icon">👤</span><span>${p.name}</span>`;
            btn.onclick = () => confirmProfile(p.name);
            list.appendChild(btn);
        });
    } else {
        const hint = mk('p','sub');
        hint.textContent = G.lang === 'ua' ? 'Ще немає збережених імен — введи своє нижче 👇' : 'No saved names yet — enter yours below 👇';
        list.appendChild(hint);
    }
    $('nameInput').value = '';
    show('s-name');
    setTimeout(() => $('nameInput').focus(), 100);
}

function confirmProfile(name) {
    name = (name || '').trim();
    if (!name) { toast(G.lang === 'ua' ? '⚠️ Введи імʼя!' : '⚠️ Enter a name!'); return; }
    const id = saveProfile(name);
    G.studentId = id;
    G.studentName = name;
    localStorage.setItem('utype_active_profile', id);
    const badge = $('studentNameBadge');
    if (badge) badge.textContent = `👤 ${name}`;
    initStudentPage();
    show('s-student');
}

function initNameScreen() {
    $('nameConfirm').onclick = () => confirmProfile($('nameInput').value);
    $('nameInput').addEventListener('keydown', e => { if (e.key === 'Enter') confirmProfile($('nameInput').value); });
    $('changeProfileBtn')?.addEventListener('click', showNameScreen);
}

/* ════════════════════════════════════════════════════════════════════
   📊 ЕКРАН ДЕТАЛЬНОЇ СТАТИСТИКИ (помилки по літерах / пальцях)
   ════════════════════════════════════════════════════════════════════ */
const FINGER_NAMES = {
    'L-pinky': '🖐️ Лівий мізинець', 'L-ring': '🖐️ Лівий безіменний', 'L-mid': '🖐️ Лівий середній', 'L-idx': '🖐️ Лівий вказівний',
    'R-pinky': '🖐️ Правий мізинець', 'R-ring': '🖐️ Правий безіменний', 'R-mid': '🖐️ Правий середній', 'R-idx': '🖐️ Правий вказівний'
};

function showStatsScreen() {
    if (!studentProgress) return;
    const ua = G.lang === 'ua';
    const top = studentProgress.getTopMistakes(15);
    const byFinger = studentProgress.getFingerMistakes(G.lang);
    
    const letterBox = $('statsLetters');
    const fingerBox = $('statsFingers');
    letterBox.innerHTML = '';
    fingerBox.innerHTML = '';
    
    if (!top.length) {
        letterBox.innerHTML = `<p class="sub">${ua ? 'Поки немає даних про помилки. Пройди урок!' : 'No mistake data yet. Play a lesson!'}</p>`;
    } else {
        const maxCount = top[0].count;
        top.forEach(({ch,count}) => {
            const row = mk('div','stat-row');
            const label = ch === 'SPACE' ? '␣ SPACE' : ch === 'ENTER' ? '↵ ENTER' : ch;
            const pct = Math.max(8, Math.round(count / maxCount * 100));
            row.innerHTML = `
                <span class="stat-label">${label}</span>
                <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${pct}%"></div></div>
                <span class="stat-count">${count}</span>
            `;
            letterBox.appendChild(row);
        });
    }
    
    if (!byFinger.length) {
        fingerBox.innerHTML = `<p class="sub">${ua ? 'Немає даних по пальцях.' : 'No finger data yet.'}</p>`;
    } else {
        const maxF = byFinger[0].count;
        byFinger.forEach(({hand,finger,count}) => {
            const row = mk('div','stat-row');
            const name = FINGER_NAMES[`${hand}-${finger}`] || `${hand}-${finger}`;
            const pct = Math.max(8, Math.round(count / maxF * 100));
            row.innerHTML = `
                <span class="stat-label">${name}</span>
                <div class="stat-bar-track"><div class="stat-bar-fill finger" style="width:${pct}%"></div></div>
                <span class="stat-count">${count}</span>
            `;
            fingerBox.appendChild(row);
        });
    }
    
    show('s-stats');
}

/* ════════════════════════════════════════════════════════════════════
   📜 ЕКРАН ІСТОРІЇ СПРОБ
   ════════════════════════════════════════════════════════════════════ */
function showHistoryScreen() {
    if (!studentProgress) return;
    const ua = G.lang === 'ua';
    const history = studentProgress.getAllLessonHistory();
    const box = $('historyList');
    box.innerHTML = '';
    
    if (!history.length) {
        box.innerHTML = `<p class="sub">${ua ? 'Ще немає пройдених уроків.' : 'No completed lessons yet.'}</p>`;
        show('s-history');
        return;
    }
    
    history.forEach(({id, attempts}) => {
        const lessonMeta = findLessonMetaById(id);
        const title = lessonMeta?.title || id;
        const section = mk('div','history-lesson');
        const head = mk('div','history-lesson-title');
        head.textContent = `📚 ${title} (${attempts.length} ${ua ? (attempts.length===1?'спроба':'спроб') : (attempts.length===1?'attempt':'attempts')})`;
        section.appendChild(head);
        
        attempts.slice().reverse().forEach((a, ridx) => {
            const idx = attempts.length - ridx; // реальний номер спроби
            const prev = attempts[idx - 2]; // попередня (в хронології) спроба
            const row = mk('div','history-attempt');
            const d = a.date ? new Date(a.date) : null;
            const dateStr = d ? d.toLocaleString(ua ? 'uk-UA' : 'en-US', {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) : '';
            let deltaHtml = '';
            if (prev) {
                const cd = a.cpm - (prev.cpm||0);
                const ed = a.err - (prev.err||0);
                const cArrow = cd>0?'🔼':cd<0?'🔽':'➖';
                const eArrow = ed<0?'🔼':ed>0?'🔽':'➖';
                deltaHtml = `<span class="history-delta ${cd>0?'good':cd<0?'bad':''}">${cArrow}CPM</span> <span class="history-delta ${ed<0?'good':ed>0?'bad':''}">${eArrow}${ua?'Помилки':'Err'}</span>`;
            }
            row.innerHTML = `
                <span class="history-num">№${idx}</span>
                <span class="history-date">${dateStr}</span>
                <span class="history-stat">⚡${a.cpm||0}</span>
                <span class="history-stat">❌${a.err||0}</span>
                <span class="history-stat">🐛${a.bosses||0}</span>
                ${deltaHtml}
            `;
            section.appendChild(row);
        });
        box.appendChild(section);
    });
    
    show('s-history');
}

function showHistoryFor(lessonId, title) {
    showHistoryScreen();
    // прокручуємо до потрібного уроку, якщо є кілька
    setTimeout(() => {
        const el = [...document.querySelectorAll('.history-lesson-title')].find(e => e.textContent.includes(title));
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
}

function findLessonMetaById(lessonId) {
    for (const lang of Object.keys(G.index || {})) {
        for (const grade of Object.keys(G.index[lang] || {})) {
            const found = G.index[lang][grade].find(l => l.id === lessonId);
            if (found) return found;
        }
    }
    return null;
}

window.addEventListener('DOMContentLoaded', async () => {
    try { 
        const r = await fetch('index.json'); 
        G.index = await r.json(); 
    } catch { 
        G.index = null; 
    }
    
    const p = new URLSearchParams(window.location.search);
    if (p.get('role') === 'student') {
        G.lang = p.get('lang') || 'ua';
        G.grade = p.get('grade');
        const pDiff = p.get('diff');
        if (pDiff !== null && pDiff !== undefined && !isNaN(parseInt(pDiff, 10))) {
            G.difficulty = Math.max(0, Math.min(5, parseInt(pDiff, 10)));
        } else {
            G.difficulty = 3;
        }
        const pBg = p.get('bg');
        if (pBg) {
            G.bg = (pBg === 'castle' || pBg === 'kingdom') ? 'kingdom' : pBg;
        } else {
            G.bg = 'space';
        }
        G.questEnabled = p.get('quest') === '1';
        const lid = p.get('lid');
        G.lessonId = lid;
        const lesson = G.index?.[G.lang]?.[G.grade]?.find(l => l.id === lid);
        G.lessonFile = lesson?.file || null;
        G.lessonData = null;
        G.lessonTitle = lesson?.title || 'Урок';
        const gradeLabel = G.grade === '1'
            ? (G.lang === 'ua' ? '1 клас (Класичний тренажер)' : 'Grade 1 (Classic Touch Typing)')
            : (G.lang === 'ua' ? `${G.grade} клас` : `Grade ${G.grade}`);
        $('studentBadge').textContent = `${G.lang === 'ua' ? '🇺🇦' : '🇬🇧'} ${gradeLabel}`;
        $('studentTitle').textContent = G.lessonTitle;
        $('studentSub').textContent = lesson ? `Урок: ${lesson.title}` : 'Оберіть JSON файл';
        $('studentDiff').textContent = G.difficulty;
        const wt = getWormType(G.difficulty);
        $('studentDiffType').textContent = `(${wt.name})`;
        const stBgEl = $('studentBgName');
        if (stBgEl) stBgEl.textContent = BG_NAMES[G.bg] || '🚀 Космос';
        const stPlay = $('studentPlay');
        if (stPlay) {
            stPlay.style.background = BG_COLORS[G.bg] || '#0a0a3e';
            stPlay.style.borderColor = BG_COLORS[G.bg] || '#0a0a3e';
            stPlay.style.color = '#fff';
        }
        // Спершу показуємо вибір профілю (ім'я учня) — прогрес завжди привʼязаний до імені
        showNameScreen();
    } else {
        show('s-lang');
        // Підключаємо кліки по фонах на всіх екранах (окрім кнопок швидкості diff-btn)
        document.querySelectorAll('.bg-opt:not(.diff-btn)').forEach(btn => {
            btn.addEventListener('click', () => selectBg(btn.dataset.bg));
        });
        const savedBg = localStorage.getItem('keyboard-bg');
        const initialBg = savedBg ? ((savedBg === 'castle' || savedBg === 'kingdom') ? 'kingdom' : savedBg) : (G.bg || 'space');
        selectBg(initialBg);

        // Ініціалізація швидкості хробака для вчителя
        const savedDiff = localStorage.getItem('keyboard-diff');
        const initialDiff = (savedDiff !== null && !isNaN(parseInt(savedDiff, 10)))
            ? Math.max(0, Math.min(5, parseInt(savedDiff, 10)))
            : 3;
        setDifficulty(initialDiff);

        const diffSlider = document.getElementById('difficultySlider');
        if (diffSlider) {
            diffSlider.addEventListener('input', function() {
                const val = parseInt(this.value, 10);
                setDifficulty(isNaN(val) ? 3 : val);
            });
        }

        const lessonDiffSlider = document.getElementById('lessonDiffSlider');
        if (lessonDiffSlider) {
            lessonDiffSlider.addEventListener('input', function() {
                const val = parseInt(this.value, 10);
                setDifficulty(isNaN(val) ? 3 : val);
            });
        }
    }
    
    initNameScreen();
    $('openStats')?.addEventListener('click', showStatsScreen);
    $('openHistory')?.addEventListener('click', showHistoryScreen);
    $('backFromStats')?.addEventListener('click', () => show('s-student'));
    $('backFromHistory')?.addEventListener('click', () => show('s-student'));
    
    // Перемикач озвучення слів у грі
    const soundToggle = $('hudSoundToggle');
    if (soundToggle) {
        soundToggle.textContent = _ttsEnabled ? '🔊' : '🔇';
        soundToggle.classList.toggle('off', !_ttsEnabled);
        soundToggle.addEventListener('click', () => {
            setTtsEnabled(!_ttsEnabled);
        });
    }
});

// Кнопка відкриття редактора
document.getElementById('openCreator')?.addEventListener('click', () => {
    initCreator();
    show('s-creator');
});

['ua','en'].forEach(lang => {
    $('flag-'+lang).onclick = () => {
        G.lang = lang;
        document.querySelectorAll('.flag-btn').forEach(b => b.classList.remove('sel'));
        $('flag-'+lang).classList.add('sel');
        buildGradeGrid();
        show('s-grade');
    };
});

function buildGradeGrid() {
    const g = $('gradeGrid');
    g.innerHTML = '';
    $('gradeTitle').textContent = G.lang === 'ua' ? '🇺🇦 Оберіть клас' : '🇬🇧 Choose grade';

    // 1-й клас: велика широка кнопка на всю ширину над всіма класами 2-11
    const hasGrade1 = G.index?.[G.lang]?.['1']?.length > 0;
    const b1 = mk('button', 'btn grade-btn-1' + (hasGrade1 ? '' : ' disabled'));
    b1.innerHTML = G.lang === 'ua'
        ? `<div class="grade-1-badge">1</div>
           <div class="grade-1-content">
               <span class="grade-1-title">1 КЛАС — КЛАСИЧНІ УРОКИ СЛІПОГО НАБОРУ</span>
               <span class="grade-1-desc">40 класичних уроків: базовий ряд (А-О), верхній, нижній ряди, розділові знаки, Shift та цифри</span>
           </div>`
        : `<div class="grade-1-badge">1</div>
           <div class="grade-1-content">
               <span class="grade-1-title">GRADE 1 — CLASSIC TOUCH TYPING COURSE</span>
               <span class="grade-1-desc">40 classic drills: home row (F-J), top, bottom rows, punctuation, Shift & numbers</span>
           </div>`;
    b1.style.opacity = hasGrade1 ? '1' : '0.5';
    if (hasGrade1) b1.onclick = () => selectGrade(1);
    g.appendChild(b1);

    // Класи 2-11
    for (let n=2; n<=11; n++) {
        const hasLessons = G.index?.[G.lang]?.[String(n)]?.length > 0;
        const b = mk('button', 'btn' + (hasLessons ? '' : ' disabled'));
        b.textContent = n + (G.lang === 'ua' ? ' кл' : ' gr');
        b.style.opacity = hasLessons ? '1' : '0.4';
        if (hasLessons) b.onclick = () => selectGrade(n);
        g.appendChild(b);
    }
}

$('backToLang').onclick = () => show('s-lang');

function selectGrade(n) {
    G.grade = String(n);
    G.data = null;
    G.lessonFile = null;
    G.lessonId = null;
    if (Number(n) === 1) {
        $('lessonTitle').textContent = G.lang === 'ua' ? '1 клас — Класичні уроки сліпого набору (40 уроків)' : 'Grade 1 — Classic Touch Typing (40 lessons)';
    } else {
        $('lessonTitle').textContent = G.lang === 'ua' ? `${n} клас — оберіть урок` : `Grade ${n} — choose lesson`;
    }
    const list = $('lessonList');
    list.innerHTML = '';
    list.scrollTop = 0;
    list.scrollLeft = 0;
    $('lessonActions').style.display = 'none';
    selectBg(G.bg || 'space');
    setDifficulty(G.difficulty);
    const lessons = G.index?.[G.lang]?.[String(n)] || [];
    lessons.forEach(l => {
        const card = mk('div','lesson-card');
        card.innerHTML = `<div>${l.title}</div><small>${l.id}</small>`;
        card.onclick = () => {
            document.querySelectorAll('.lesson-card').forEach(c => c.classList.remove('sel'));
            card.classList.add('sel');
            G.lessonId = l.id;
            G.lessonFile = l.file; G.lessonData = null; G.data = null;
            G.lessonTitle = l.title;
            updateStudentLink();
            $('lessonActions').style.display = 'flex';
        };
        list.appendChild(card);
    });
    if (!lessons.length) { const p=mk('p','sub'); p.textContent=G.lang==='ua'?'Уроки для цього класу ще не додані.':'No lessons for this grade yet.'; list.appendChild(p); }
    show('s-lesson');
    const sLesson = $('s-lesson');
    if (sLesson) {
        sLesson.scrollTop = 0;
        sLesson.scrollLeft = 0;
    }
}

$('backToGrade').onclick = () => show('s-grade');

$('copyBtn').onclick = () => navigator.clipboard?.writeText($('linkText').textContent).then(() => toast('Посилання скопійовано!'));

$('questToggle')?.addEventListener('change', e => { G.questEnabled = !!e.target.checked; updateStudentLink(); });
$('questAcceptBtn')?.addEventListener('click', acceptQuestOffer);
$('questDeclineBtn')?.addEventListener('click', declineQuestOffer);

$('teacherPlay').onclick = loadAndPlay;
$('studentPlay').onclick = loadAndPlay;

$('fileTeacher').addEventListener('change', e => loadFromFile(e.target.files[0]));
$('fileStudent').addEventListener('change', e => loadFromFile(e.target.files[0]));

async function loadAndPlay() {
    if (G.data) { launchLevel(G.data); return; }
    if (G.lessonData) { G.data = parseLesson(G.lessonData); launchLevel(G.data); return; }
    if (!G.lessonFile) {
        const msg = G.lang === 'ua' ? 'Оберіть урок або JSON файл' : 'Select a lesson or JSON file';
        alert(msg);
        return;
    }
    try {
        const r = await fetch(G.lessonFile);
        if (!r.ok) throw 0;
        const raw = await r.json();
        G.data = parseLesson(raw);
        launchLevel(G.data);
    } catch {
        toast(G.lang === 'ua' ? '⚠️ Оберіть JSON файл через кнопку нижче' : '⚠️ Pick JSON file using the button below');
        const fNote = document.getElementById('lessonActions');
        if (fNote) fNote.style.display = 'flex';
    }
}

async function loadFromFile(f) {
    if (!f) return;
    const text = await f.text();
    let data;
    if (f.name.endsWith('.json')) {
        try { data = JSON.parse(text); } catch { toast('⚠️ Невалідний JSON'); return; }
    } else {
        // підтримка legacy XML  
        try {
            const doc = new DOMParser().parseFromString(text, 'text/xml');
            if (doc.querySelector('parsererror')) throw new Error('bad xml');
            data = {
                title: doc.querySelector('title')?.textContent?.trim() || 'Урок',
                text:  doc.querySelector('text')?.textContent || '',
                words: [...doc.querySelectorAll('word')].map(w => w.textContent.trim().toLowerCase()).filter(Boolean)
            };
        } catch { toast('⚠️ Помилка читання файлу'); return; }
    }
    // Автовизначення мови якщо не встановлена
    if (!G.lang) {
        const ua = (data.text.match(/[а-яїієґ]/gi) || []).length;
        const en = (data.text.match(/[a-z]/gi)      || []).length;
        G.lang = ua >= en ? 'ua' : 'en';
    }
    G.data = parseLesson(data);
    launchLevel(G.data);
}

/* ════════════════════════════════════════════════════════════════════
   ЗАПУСК РІВНЯ
   ════════════════════════════════════════════════════════════════════ */
function launchLevel(data) {
    bossTmrs.forEach(clearInterval);
    bossTmrs = [];
    $('stage').querySelectorAll('.worm-wrap').forEach(e => e.remove());
    
    const raw = LP.parse(data.text);
    const obs = [{char:'',type:'start',req:false,floor:0}, ...raw];
    
    const coins = new Set();
    let cnt = 0;
    obs.forEach((o,i) => {
        if (['run','rest','start'].includes(o.type)) {
            cnt++;
            if (cnt % COIN_EVERY === 0) coins.add(i);
        }
    });
    
    const ats = obs.map((o,i) => ({o,i})).filter(({o}) => o.type === 'run');
    const worms = (data.words||[]).map((w,wi) => {
        const slot = Math.floor((wi+1)*ats.length/((data.words.length||1)+1));
        const ti = ats[Math.min(slot,ats.length-1)]?.i || 10+wi*20;
        return new Worm(w, ti, G.difficulty);
    });
    
    eng = new GE(raw,worms,coins,onEv);
    eng.obs = obs;
    rnd = new Rnd(G.lang, G.bg);
    rnd.buildTrack(obs, coins);
    worms.forEach(w => rnd.spawnWorm(w, obs));
    rnd.hi(eng.i);
    rnd.prompt(eng.cur);
    rnd.cam(eng);
    rnd.running(true);
    rnd.coinsUI(0,0);
    if (inp) inp.off();
    inp = new IC(eng);
    inp.on();
    rnd.hud(eng);

    // 🌀 Ініціалізація міні-квесту для цього рівня
    $('questOffer')?.classList.remove('on');
    $('questScene')?.classList.remove('on');
    quest = null;
    questState = {
        enabled: !!G.questEnabled,
        offered: false,
        completed: false,
        portalIndex: null,
        words: (data.words && data.words.length) ? data.words : (data.text || '').split(/\s+/).filter(Boolean)
    };
    updateQuestBankUI();
    if (questState.enabled && questState.words.length && obs.length > 15) {
        const lo = Math.floor(obs.length * CONFIG.QUEST_PORTAL_FROM);
        const hi = Math.floor(obs.length * CONFIG.QUEST_PORTAL_TO);
        questState.portalIndex = lo + Math.floor(Math.random() * Math.max(1, hi - lo + 1));
        const o = obs[questState.portalIndex];
        rnd.showPortal(questState.portalIndex, o ? (o.floor || 0) : 0);
    }

    show('sg');
}

/* ════════════════════════════════════════════════════════════════════
   ІГРОВІ ПОДІЇ
   ════════════════════════════════════════════════════════════════════ */
function onEv(ev, pl) {
    const ua = G.lang === 'ua';
    switch(ev) {
        case 'cor':
            rnd.done(eng.i); rnd.anim(pl.t.type,true); rnd.warn(false); rnd.cam(eng);
            if (pl.t.type === 'checkpoint') toast(ua?'↵ Новий рядок':'↵ New line');
            break;
        case 'wrg':
            rnd.anim(pl.t.type,false); rnd.warn(true);
            toast(pl.t.type==='checkpoint' ? (ua?'❌ Натисни Enter!':'❌ Press Enter!') : (ua?'❌ Невірна клавіша!':'❌ Wrong key!'));
            break;
        case 'nl': toast(ua?'↓ Новий рядок':'↓ New line'); break;
        case 'adv':
            rnd.done(eng.i-1); rnd.hi(eng.i); rnd.cam(eng);
            const nw = eng.worms.find(w => w.alive && !w.fighting && w.ti > eng.i && w.ti - eng.i <= BOSS_DIST);
            if (nw) {
                nw.fighting=true;
                eng.aw=nw;
                rnd.lock(eng.i, BOSS_DIST, true);
                rnd.prompt(null, true, nw.cur);
                startWormTimer(nw);
                rnd.bossPanel(nw);
                rnd.refreshWorm(nw);
            } else {
                rnd.prompt(eng.cur, !!eng.aw, eng.aw?.cur);
            }
            break;
        case 'coin': rnd.rmCoin(eng.i-1); rnd.coinsUI(eng.cbank,eng.ctotal); toast(`🪙 ${ua?'Монета':'Coin'}! ${eng.cbank}/3`); break;
        case 'lu': rnd.coinsUI(eng.cbank,eng.ctotal); toast('❤️ +1 Життя!'); break;
        case 'ws':
            rnd.lock(eng.i, BOSS_DIST, true);
            rnd.prompt(null, true, pl.w.cur);
            startWormTimer(pl.w);
            rnd.bossPanel(pl.w);
            rnd.refreshWorm(pl.w);
            break;
        case 'wh':
            rnd.refreshWorm(pl.w);
            rnd.kb(null, pl.w.alive ? pl.w.cur : null);
            rnd.hands(null, pl.w.alive ? pl.w.cur : null);
            break;
        case 'wm':
            rnd.flashMiss();
            rnd.refreshWorm(pl.w);
            toast(ua?'💥 Промах! Починай спочатку!':'💥 Miss! Start over!');
            break;
        case 'wd':
            bossTmrs.forEach(clearInterval);
            bossTmrs = [];
            rnd.removeWorm(pl.w);
            rnd.lock(eng.i, BOSS_DIST, false);
            toast(ua?'🐛 Хробака переможено!':'🐛 Worm defeated!');
            speakWord(pl.w.word, G.lang);
            eng.aw = null;
            rnd.prompt(eng.cur);
            break;
        case 'fin': endGame(true); break;
        case 'over': endGame(false, pl.worm); break;
        case 'questRefund': toast(ua ? '🪙➜❤️ Обмін монет: +1 життя!' : '🪙➜❤️ Coins exchanged: +1 life!'); break;
    }
    rnd.hud(eng);
    if (ev === 'adv') checkQuestPortal();
}

/* ════════════════════════════════════════════════════════════════════
   ТАЙМЕР ХРОБАКА (З ВПЛИВОМ СКЛАДНОСТІ)
   ════════════════════════════════════════════════════════════════════ */
function startWormTimer(worm) {
    bossTmrs.forEach(clearInterval);
    bossTmrs = [];
    
    if (!worm) return;
    
    // Якщо швидкість 0 (Нерухомий) - хробак абсолютно не рухається!
    if (worm.difficulty === 0 || worm.wormType.speed === 0 || !worm.wormType.interval) {
        console.log(`🐛 Хробак "${worm.word}" — швидкість 0: нерухомий`);
        return;
    }
    
    const interval = worm.getInterval();
    console.log(`🐛 Хробак: ${worm.word}, швидкість: ${worm.wormType.speed}/5 (${worm.wormType.name}), інтервал: ${interval}мс`);
    
    const t = setInterval(() => {
        if (!worm.alive) { clearInterval(t); return; }
        worm.ti--;
        rnd.moveWorm(worm, eng.i - 1);
        if (worm.ti <= eng.i) {
            clearInterval(t);
            eng.wormTouch();
        }
    }, interval);
    bossTmrs.push(t);
}

/* ════════════════════════════════════════════════════════════════════
   ЗАВЕРШЕННЯ ГРИ
   ════════════════════════════════════════════════════════════════════ */
function endGame(ok, wormKill) {
    inp.off();
    rnd.running(false);
    bossTmrs.forEach(clearInterval);
    bossTmrs = [];
    
    let attemptInfo = null;
    if (G.lessonFile && studentProgress) {
        const lessonId = G.lessonFile.replace(/^.*\//,'').replace(/\.json$/,'');
        // Записуємо помилки цієї спроби в глобальну статистику незалежно від результату
        studentProgress.recordMistakes(eng.mistakeLog);
        if (ok) {
            attemptInfo = studentProgress.completeLesson(lessonId, {
                ok: eng.ok,
                err: eng.err,
                cpm: eng.cpm,
                coins: eng.ctotal,
                bosses: eng.bk,
                lives: Math.max(eng.lives, 0),
                date: new Date().toISOString()
            });
        }
        updateProgressDisplay();
    }
    
    const ua = G.lang === 'ua';
    $('resTitle').textContent = wormKill ?
        (ua ? '🐛 Хробак тебе з\'їв! 💀' : '🐛 The worm got you! 💀') :
        ok ?
        (ua ? '🎉 Рівень пройдено! 🎉' : '🎉 Level complete! 🎉') :
        (ua ? '💥 Гра закінчена 💥' : '💥 Game over 💥');
    $('rTotal').textContent = eng.ok;
    $('rCpm').textContent = eng.cpm;
    $('rErr').textContent = eng.err;
    $('rCoins').textContent = eng.ctotal;
    $('rLives').textContent = Math.max(eng.lives, 0);
    $('rBoss').textContent = eng.bk;
    
    // Номер спроби + порівняння з попередньою (прогрес/регрес)
    const attemptRow = $('rAttemptRow');
    const deltaRow = $('rDeltaRow');
    if (attemptInfo) {
        $('rAttempt').textContent = attemptInfo.attemptNumber;
        if (attemptRow) attemptRow.style.display = 'flex';
        if (attemptInfo.prevAttempt && deltaRow) {
            const prev = attemptInfo.prevAttempt;
            const cpmDelta = eng.cpm - (prev.cpm || 0);
            const errDelta = eng.err - (prev.err || 0);
            const cpmArrow = cpmDelta > 0 ? '🔼' : cpmDelta < 0 ? '🔽' : '➖';
            const errArrow = errDelta < 0 ? '🔼' : errDelta > 0 ? '🔽' : '➖'; // менше помилок = прогрес
            const cpmColor = cpmDelta > 0 ? 'good' : cpmDelta < 0 ? 'bad' : '';
            const errColor = errDelta < 0 ? 'good' : errDelta > 0 ? 'bad' : '';
            $('rDelta').innerHTML =
                `<span class="${cpmColor}">CPM ${cpmArrow} ${cpmDelta > 0 ? '+' : ''}${cpmDelta}</span>` +
                `&nbsp;&nbsp;` +
                `<span class="${errColor}">${ua?'Помилки':'Errors'} ${errArrow} ${errDelta > 0 ? '+' : ''}${errDelta}</span>`;
            deltaRow.style.display = 'flex';
        } else if (deltaRow) {
            deltaRow.style.display = 'none';
        }
    } else {
        if (attemptRow) attemptRow.style.display = 'none';
        if (deltaRow) deltaRow.style.display = 'none';
    }
    
    // Оновлення картки героя на екрані результатів
    const currentHeroId = G.hero || localStorage.getItem('selected_hero') || 'panda';
    const currentHero = (window.HEROES && window.HEROES[currentHeroId]) || (window.HEROES && window.HEROES.panda);
    if (currentHero) {
        const resAv = $('resHeroAvatar');
        if (resAv) resAv.innerHTML = currentHero.svg;
        const resNm = $('resHeroName');
        if (resNm) resNm.textContent = currentHero.name;
        const resSp = $('resHeroSpeech');
        if (resSp) {
            if (ok) {
                resSp.textContent = `«${currentHero.phrase || 'Чудова робота! Рівень підкорено!'}»`;
            } else if (wormKill) {
                resSp.textContent = `«Не засмучуйся! Наступного разу ми обов'язково здолаємо хробака!»`;
            } else {
                resSp.textContent = `«Гарна спроба! Твої пальчики з кожним забігом стають спритнішими!»`;
            }
        }
    }
    
    show('s-result');
}


/* ════════════════════════════════════════════════════════════════════
   ✏️ РЕДАКТОР УРОКІВ — ГЕНЕРАЦІЯ XML
   ════════════════════════════════════════════════════════════════════ */

function initCreator() {
    // Лічильник символів
    $('cr-text').addEventListener('input', updateCreatorStats);
    updateCreatorStats();

    // Перший порожній рядок для слова
    addCreatorWord('');

    $('cr-add-word').onclick = () => addCreatorWord('');
    $('cr-play').onclick = playCreatedLesson;
    $('cr-download').onclick = downloadCreatedXML;
    $('backFromCreator').onclick = () => show('s-lang');
}

function updateCreatorStats() {
    const t = $('cr-text').value;
    const chars = t.length;
    const words = t.trim() ? t.trim().split(/\s+/).length : 0;
    const lines = t.split('\n').length;
    $('cr-stats').textContent = `${chars} символів · ${words} слів · ${lines} рядків`;
}

function addCreatorWord(val) {
    const cont = $('cr-words');
    const row = mk('div', 'word-row');
    const inp = mk('input', 'creator-input word-input');
    inp.type = 'text';
    inp.placeholder = 'Введіть слово (наприклад: природа)...';
    inp.value = val || '';
    const del = mk('button', 'btn sm word-del');
    del.textContent = '✕';
    del.type = 'button';
    del.onclick = () => row.remove();
    row.append(inp, del);
    cont.appendChild(row);
    inp.focus();
}

function getCreatorData() {
    const title = $('cr-title').value.trim() || 'Власний урок';
    const text = $('cr-text').value;
    if (!text.trim()) { toast('⚠️ Введіть текст уроку!'); return null; }
    const words = [...$('cr-words').querySelectorAll('.word-input')]
        .map(i => i.value.trim().toLowerCase()).filter(Boolean);
    return { title, text, words };
}

function generateJSON(title, text, words) {
    // JSON.stringify надійно екранує \n, лапки та юнікод —
    // жодних проблем із нормалізацією переносів рядків, на відміну від XML.
    return JSON.stringify({ title, text, words }, null, 2);
}

function downloadCreatedXML() {
    const data = getCreatorData();
    if (!data) return;
    const json = generateJSON(data.title, data.text, data.words);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (data.title.replace(/[^a-zA-Zа-яА-ЯїієґЇІЄҐ0-9]/g, '_').toLowerCase() || 'lesson') + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    $('cr-file-note').classList.add('show');
    toast('📥 JSON файл завантажено!');
}

function playCreatedLesson() {
    const data = getCreatorData();
    if (!data) return;
    // Автовизначення мови: якщо переважають кириличні — ua
    const ua = (data.text.match(/[а-яїієґ]/gi) || []).length;
    const en = (data.text.match(/[a-z]/gi) || []).length;
    G.lang = G.lang || (ua >= en ? 'ua' : 'en');
    G.data = data;
    launchLevel(G.data);
}

$('retryBtn').onclick = () => launchLevel(G.data);
$('menuBtn').onclick = () => {
    if (new URLSearchParams(window.location.search).get('role') === 'student') show('s-student');
    else show('s-lang');
};

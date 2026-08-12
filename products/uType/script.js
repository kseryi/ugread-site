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
};

const MAX_LIVES = CONFIG.MAX_LIVES;
const COIN_EVERY = CONFIG.COIN_INTERVAL;
const BOSS_DIST = CONFIG.BOSS_DISTANCE;
const LH = 64;
const TW = CONFIG.TILE_SIZE;
const MF = 4;

/* ════════════════════════════════════════════════════════════════════
   ЗМІННІ ТА СТАН
   ════════════════════════════════════════════════════════════════════ */
const $ = id => document.getElementById(id);
const mk = (t, c) => { const e = document.createElement(t); if (c) e.className = c; return e; };

let G = { 
    lang: null, 
    grade: null, 
    lessonFile: null, 
    lessonTitle: '', 
    data: null, 
    index: null, 
    bg: 'space', 
    difficulty: 5,
    hero: 'panda',
    studentId: 'default'
};
let eng = null, inp = null, rnd = null, bossTmrs = [];
let soundCtx = null;
let studentProgress = null;

/* ════════════════════════════════════════════════════════════════════
   ГЕРОЇ - SVG ПЕРСОНАЖІВ
   ════════════════════════════════════════════════════════════════════ */
const HEROES = {
    panda: {
        name: 'Панда',
        icon: '🐼',
        svg: `<svg viewBox="0 0 80 100">
            <ellipse class="pb" cx="40" cy="55" rx="30" ry="35"/>
            <ellipse class="pbelly" cx="40" cy="60" rx="20" ry="22"/>
            <circle class="phead" cx="40" cy="20" r="25"/>
            <circle class="pear" cx="22" cy="4" r="12"/>
            <circle class="pear" cx="58" cy="4" r="12"/>
            <circle class="pear-inner" cx="22" cy="4" r="6"/>
            <circle class="pear-inner" cx="58" cy="4" r="6"/>
            <ellipse class="peye" cx="32" cy="18" rx="6" ry="7"/>
            <ellipse class="peye" cx="48" cy="18" rx="6" ry="7"/>
            <circle class="peye-pupil" cx="34" cy="17" r="3"/>
            <circle class="peye-pupil" cx="50" cy="17" r="3"/>
            <circle class="peye-shine" cx="35" cy="15" r="1.5"/>
            <circle class="peye-shine" cx="51" cy="15" r="1.5"/>
            <ellipse class="pnose" cx="40" cy="26" rx="5" ry="3.5"/>
            <path class="pmouth" d="M35 29 Q40 33 45 29"/>
            <ellipse class="pcheek" cx="26" cy="26" rx="6" ry="4"/>
            <ellipse class="pcheek" cx="54" cy="26" rx="6" ry="4"/>
            <g class="al"><ellipse class="parm" cx="10" cy="48" rx="8" ry="16"/></g>
            <g class="ar"><ellipse class="parm" cx="70" cy="48" rx="8" ry="16"/></g>
            <g class="ll"><ellipse class="pleg" cx="25" cy="88" rx="12" ry="10"/></g>
            <g class="lr"><ellipse class="pleg" cx="55" cy="88" rx="12" ry="10"/></g>
            <circle class="ptail" cx="40" cy="92" r="6"/>
        </svg>`
    },
    knight: {
        name: 'Лицар',
        icon: '⚔️',
        svg: `<svg viewBox="0 0 80 100">
            <rect class="pbody" x="18" y="40" width="44" height="40" rx="6"/>
            <rect class="parmor" x="14" y="42" width="52" height="32" rx="4" fill="#888" stroke="#555" stroke-width="2"/>
            <rect class="parmor" x="20" y="46" width="8" height="16" rx="2" fill="#aaa"/>
            <rect class="parmor" x="52" y="46" width="8" height="16" rx="2" fill="#aaa"/>
            <circle class="phead" cx="40" cy="24" r="20" fill="#f5d0b0"/>
            <rect class="phelmet" x="18" y="8" width="44" height="22" rx="8" fill="#888" stroke="#555" stroke-width="2"/>
            <rect class="pvisor" x="24" y="14" width="32" height="12" rx="2" fill="#444" stroke="#333" stroke-width="1.5"/>
            <rect class="pvisor" x="28" y="16" width="6" height="8" rx="1" fill="#222"/>
            <rect class="pvisor" x="46" y="16" width="6" height="8" rx="1" fill="#222"/>
            <rect class="pvisor" x="37" y="16" width="6" height="8" rx="1" fill="#222"/>
            <circle class="peye" cx="30" cy="18" r="2" fill="#ffd700"/>
            <circle class="peye" cx="50" cy="18" r="2" fill="#ffd700"/>
            <rect class="psword" x="68" y="34" width="4" height="40" rx="1" fill="#ccc" stroke="#999" stroke-width="1"/>
            <rect class="psword" x="66" y="30" width="8" height="8" rx="2" fill="#ffd700"/>
            <polygon class="psword" points="70,68 66,74 74,74" fill="#ccc" stroke="#999" stroke-width="1"/>
            <g class="al"><ellipse class="parm" cx="12" cy="50" rx="8" ry="16"/></g>
            <g class="ar"><ellipse class="parm" cx="68" cy="50" rx="8" ry="16"/></g>
            <g class="ll"><ellipse class="pleg" cx="24" cy="88" rx="12" ry="10"/></g>
            <g class="lr"><ellipse class="pleg" cx="56" cy="88" rx="12" ry="10"/></g>
        </svg>`
    },
    elf: {
        name: 'Ельф',
        icon: '🧝',
        svg: `<svg viewBox="0 0 80 100">
            <ellipse class="pbody" cx="40" cy="56" rx="26" ry="32" fill="#6ba36b"/>
            <circle class="phead" cx="40" cy="24" r="22" fill="#f5d0b0"/>
            <ellipse class="pear" cx="18" cy="6" rx="10" ry="16" fill="#6ba36b"/>
            <ellipse class="pear" cx="62" cy="6" rx="10" ry="16" fill="#6ba36b"/>
            <ellipse class="pear-inner" cx="18" cy="10" rx="6" ry="10" fill="#8bc88b"/>
            <ellipse class="pear-inner" cx="62" cy="10" rx="6" ry="10" fill="#8bc88b"/>
            <ellipse class="peye" cx="32" cy="22" rx="5" ry="6" fill="white"/>
            <ellipse class="peye" cx="48" cy="22" rx="5" ry="6" fill="white"/>
            <circle class="peye-pupil" cx="34" cy="21" r="3" fill="#2d5a2d"/>
            <circle class="peye-pupil" cx="50" cy="21" r="3" fill="#2d5a2d"/>
            <circle class="peye-shine" cx="35" cy="19" r="1.5" fill="white"/>
            <circle class="peye-shine" cx="51" cy="19" r="1.5" fill="white"/>
            <ellipse class="pnose" cx="40" cy="30" rx="4" ry="3" fill="#d4a080"/>
            <path class="pmouth" d="M35 34 Q40 38 45 34" stroke="#d4a080" stroke-width="1.5" fill="none"/>
            <ellipse class="pcheek" cx="26" cy="30" rx="5" ry="3" fill="rgba(255,150,150,0.3)"/>
            <ellipse class="pcheek" cx="54" cy="30" rx="5" ry="3" fill="rgba(255,150,150,0.3)"/>
            <ellipse class="pcape" cx="40" cy="50" rx="34" ry="30" fill="#4a7a4a" opacity="0.6"/>
            <g class="al"><ellipse class="parm" cx="12" cy="50" rx="7" ry="14" fill="#f5d0b0"/></g>
            <g class="ar"><ellipse class="parm" cx="68" cy="50" rx="7" ry="14" fill="#f5d0b0"/></g>
            <g class="ll"><ellipse class="pleg" cx="26" cy="88" rx="10" ry="10"/></g>
            <g class="lr"><ellipse class="pleg" cx="54" cy="88" rx="10" ry="10"/></g>
        </svg>`
    },
    viking: {
        name: 'Вікінг',
        icon: '⚔️',
        svg: `<svg viewBox="0 0 80 100">
            <ellipse class="pbody" cx="40" cy="56" rx="28" ry="34" fill="#c0392b"/>
            <rect class="parmor" x="14" y="44" width="52" height="28" rx="4" fill="#8B7355" stroke="#6B5335" stroke-width="2"/>
            <rect class="parmor" x="18" y="48" width="8" height="16" rx="2" fill="#a08060"/>
            <rect class="parmor" x="54" y="48" width="8" height="16" rx="2" fill="#a08060"/>
            <circle class="phead" cx="40" cy="22" r="20" fill="#f5d0b0"/>
            <rect class="phelmet" x="14" y="2" width="52" height="18" rx="8" fill="#888" stroke="#555" stroke-width="2"/>
            <rect class="phelmet" x="30" y="0" width="20" height="12" rx="4" fill="#888" stroke="#555" stroke-width="2"/>
            <circle class="peye" cx="32" cy="20" r="3" fill="#2d5a2d"/>
            <circle class="peye" cx="48" cy="20" r="3" fill="#2d5a2d"/>
            <ellipse class="pnose" cx="40" cy="26" rx="4" ry="3" fill="#d4a080"/>
            <path class="pmouth" d="M34 31 Q40 36 46 31" stroke="#d4a080" stroke-width="1.5" fill="none"/>
            <rect class="paxe" x="62" y="30" width="6" height="44" rx="2" fill="#8B7355"/>
            <path class="paxe" d="M58 30 L72 30 L72 22 L58 22 Z" fill="#ccc" stroke="#999" stroke-width="1.5"/>
            <g class="al"><ellipse class="parm" cx="12" cy="50" rx="8" ry="16"/></g>
            <g class="ar"><ellipse class="parm" cx="68" cy="50" rx="8" ry="16"/></g>
            <g class="ll"><ellipse class="pleg" cx="24" cy="88" rx="12" ry="10"/></g>
            <g class="lr"><ellipse class="pleg" cx="56" cy="88" rx="12" ry="10"/></g>
        </svg>`
    },
    princess: {
        name: 'Принцеса',
        icon: '👸',
        svg: `<svg viewBox="0 0 80 100">
            <ellipse class="pbody" cx="40" cy="56" rx="26" ry="32" fill="#ff6b9d"/>
            <circle class="phead" cx="40" cy="24" r="20" fill="#f5d0b0"/>
            <ellipse class="pcheek" cx="26" cy="28" rx="6" ry="4" fill="rgba(255,100,150,0.3)"/>
            <ellipse class="pcheek" cx="54" cy="28" rx="6" ry="4" fill="rgba(255,100,150,0.3)"/>
            <ellipse class="peye" cx="32" cy="22" rx="5" ry="6" fill="white"/>
            <ellipse class="peye" cx="48" cy="22" rx="5" ry="6" fill="white"/>
            <circle class="peye-pupil" cx="34" cy="21" r="3" fill="#4a1a6a"/>
            <circle class="peye-pupil" cx="50" cy="21" r="3" fill="#4a1a6a"/>
            <circle class="peye-shine" cx="35" cy="19" r="1.5" fill="white"/>
            <circle class="peye-shine" cx="51" cy="19" r="1.5" fill="white"/>
            <ellipse class="pnose" cx="40" cy="28" rx="4" ry="2.5" fill="#d4a080"/>
            <path class="pmouth" d="M35 32 Q40 37 45 32" stroke="#d4a080" stroke-width="1.5" fill="none"/>
            <ellipse class="pcrown" cx="40" cy="6" rx="24" ry="10" fill="#ffd700" stroke="#daa520" stroke-width="1.5"/>
            <ellipse class="pcrown" cx="40" cy="6" rx="18" ry="6" fill="#ffed4a"/>
            <circle class="pcrown" cx="28" cy="2" r="3" fill="#ff6b6b"/>
            <circle class="pcrown" cx="40" cy="0" r="4" fill="#4d96ff"/>
            <circle class="pcrown" cx="52" cy="2" r="3" fill="#ff6b6b"/>
            <g class="al"><ellipse class="parm" cx="12" cy="50" rx="7" ry="14" fill="#f5d0b0"/></g>
            <g class="ar"><ellipse class="parm" cx="68" cy="50" rx="7" ry="14" fill="#f5d0b0"/></g>
            <g class="ll"><ellipse class="pleg" cx="26" cy="88" rx="10" ry="10"/></g>
            <g class="lr"><ellipse class="pleg" cx="54" cy="88" rx="10" ry="10"/></g>
        </svg>`
    }
};

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
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('Помилка завантаження прогресу:', e);
        }
        return {
            lessons: {},
            lastLesson: null,
            totalCompleted: 0
        };
    }
    
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.warn('Помилка збереження прогресу:', e);
        }
    }
    
    completeLesson(lessonId, stats) {
        if (!this.data.lessons[lessonId]) {
            this.data.lessons[lessonId] = { completed: false, stats: {} };
        }
        this.data.lessons[lessonId].completed = true;
        this.data.lessons[lessonId].stats = stats;
        this.data.lastLesson = lessonId;
        this.data.totalCompleted = Object.values(this.data.lessons).filter(l => l.completed).length;
        this.save();
    }
    
    getLesson(lessonId) {
        return this.data.lessons[lessonId] || null;
    }
    
    isCompleted(lessonId) {
        return this.data.lessons[lessonId]?.completed || false;
    }
    
    getStats() {
        const total = Object.keys(this.data.lessons).length;
        const completed = this.data.totalCompleted;
        return { total, completed, percent: total > 0 ? Math.round(completed / total * 100) : 0 };
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
    bossDefeat() { this.play(523, 0.12, 'sine'); setTimeout(() => this.play(659, 0.12, 'sine'), 120); setTimeout(() => this.play(784, 0.15, 'sine'), 240); }
    bossAppear() { this.play(400, 0.3, 'sawtooth'); setTimeout(() => this.play(600, 0.3, 'sawtooth'), 200); }
    bossMiss() { this.play(150, 0.3, 'square'); }
    levelComplete() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.play(f, 0.15, 'sine'), i * 150)); }
    gameOver() { [400, 300, 200].forEach((f, i) => setTimeout(() => this.play(f, 0.4, 'sawtooth'), i * 250)); }
}
const sounds = new SoundFX();

/* ════════════════════════════════════════════════════════════════════
   РОЗКЛАДКИ КЛАВІАТУРИ
   ════════════════════════════════════════════════════════════════════ */
const LAYOUTS = {
    ua: { rows: [['й','ц','у','к','е','н','г','ш','щ','з','х'], ['ф','і','в','а','п','р','о','л','д','ж','є'], ['я','ч','с','м','и','т','ь','б','ю',',','.','!','?']] },
    en: { rows: [['q','w','e','r','t','y','u','i','o','p'], ['a','s','d','f','g','h','j','k','l'], ['z','x','c','v','b','n','m',',','.','!','?']] }
};

const FM = {
    en: { q:{h:'L',f:'pinky'}, a:{h:'L',f:'pinky'}, z:{h:'L',f:'pinky'}, w:{h:'L',f:'ring'}, s:{h:'L',f:'ring'}, x:{h:'L',f:'ring'}, e:{h:'L',f:'mid'}, d:{h:'L',f:'mid'}, c:{h:'L',f:'mid'}, r:{h:'L',f:'idx'}, f:{h:'L',f:'idx'}, v:{h:'L',f:'idx'}, t:{h:'L',f:'idx'}, g:{h:'L',f:'idx'}, b:{h:'L',f:'idx'}, y:{h:'R',f:'idx'}, h:{h:'R',f:'idx'}, n:{h:'R',f:'idx'}, u:{h:'R',f:'idx'}, j:{h:'R',f:'idx'}, m:{h:'R',f:'idx'}, i:{h:'R',f:'mid'}, k:{h:'R',f:'mid'}, ',' :{h:'R',f:'mid'}, o:{h:'R',f:'ring'}, l:{h:'R',f:'ring'}, '.' :{h:'R',f:'ring'}, p:{h:'R',f:'pinky'}, '?' :{h:'R',f:'pinky'}, '!' :{h:'L',f:'pinky'} },
    ua: { й:{h:'L',f:'pinky'}, ф:{h:'L',f:'pinky'}, я:{h:'L',f:'pinky'}, ц:{h:'L',f:'ring'}, і:{h:'L',f:'ring'}, ч:{h:'L',f:'ring'}, у:{h:'L',f:'mid'}, в:{h:'L',f:'mid'}, с:{h:'L',f:'mid'}, к:{h:'L',f:'idx'}, а:{h:'L',f:'idx'}, м:{h:'L',f:'idx'}, е:{h:'L',f:'idx'}, п:{h:'L',f:'idx'}, и:{h:'L',f:'idx'}, н:{h:'R',f:'idx'}, р:{h:'R',f:'idx'}, т:{h:'R',f:'idx'}, г:{h:'R',f:'idx'}, о:{h:'R',f:'idx'}, ь:{h:'R',f:'idx'}, ш:{h:'R',f:'mid'}, л:{h:'R',f:'mid'}, б:{h:'R',f:'mid'}, щ:{h:'R',f:'ring'}, д:{h:'R',f:'ring'}, ю:{h:'R',f:'ring'}, з:{h:'R',f:'pinky'}, х:{h:'R',f:'pinky'}, ж:{h:'R',f:'pinky'}, є:{h:'R',f:'pinky'}, ',' :{h:'R',f:'mid'}, '.' :{h:'R',f:'ring'}, '?' :{h:'R',f:'pinky'}, '!' :{h:'L',f:'pinky'} }
};

/* ════════════════════════════════════════════════════════════════════
   ДОПОМІЖНІ ФУНКЦІЇ
   ════════════════════════════════════════════════════════════════════ */
function show(id) { document.querySelectorAll('.scr').forEach(s => s.classList.remove('on')); $(id).classList.add('on'); }
function toast(msg) { const t = $('toastEl'); t.textContent = msg; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 1200); }
function parseXML(str) { const doc = new DOMParser().parseFromString(str,'text/xml'); return { title: doc.querySelector('title')?.textContent?.trim() || 'Урок', text: doc.querySelector('text')?.textContent || '', words: [...doc.querySelectorAll('word')].map(w => w.textContent.trim().toLowerCase()).filter(Boolean) }; }

/* ════════════════════════════════════════════════════════════════════
   ПАРСЕР РІВНЯ
   ════════════════════════════════════════════════════════════════════ */
class LP {
    static parse(text) {
        const o = [];
        let fl = 0;
        for (const ch of text) {
            if (ch === '\n' || ch === '\r') {
                const old = fl;
                fl = Math.max(0, fl - 1);
                o.push({ char: ch, type: 'checkpoint', req: false, floor: old, nf: fl });
            } else if (ch === ' ') {
                o.push({ char: ch, type: 'gap', req: false, floor: fl });
                o.push({ char: '', type: 'rest', req: false, floor: fl });
            } else if (/[.,!?]/.test(ch)) {
                const old = fl;
                fl = Math.min(MF, fl + 1);
                o.push({ char: ch, type: 'hit', req: false, floor: old, rise: fl });
            } else if (/[A-ZА-ЯЇІЄҐ]/.test(ch)) {
                const land = Math.min(MF, fl + 1);
                o.push({ char: ch, type: 'step', req: true, base: fl, floor: land });
                fl = land;
            } else {
                o.push({ char: ch, type: 'run', req: false, floor: fl });
            }
        }
        return o;
    }
}

/* ════════════════════════════════════════════════════════════════════
   КЛАС БОСА
   ════════════════════════════════════════════════════════════════════ */
class Boss {
    constructor(word, ti) {
        this.word = word;
        this.ti = ti;
        this.typed = 0;
        this.alive = true;
        this.fighting = false;
        this.el = null;
        this.color = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff6bff','#ff9f43'][Math.floor(Math.random()*6)];
    }
    get cur() { return this.word[this.typed]; }
    get pct() { return this.typed / this.word.length; }
    hit() { this.typed++; if (this.typed >= this.word.length) this.alive = false; }
    miss() { this.typed = 0; }
}

/* ════════════════════════════════════════════════════════════════════
   ІГРОВИЙ РУШІЙ
   ════════════════════════════════════════════════════════════════════ */
class GE {
    constructor(obs, bosses, coins, cb) {
        this.obs = [{char:'',type:'start',req:false,floor:0}, ...obs];
        this.bosses = bosses;
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
        this.aboss = null;
        while (this.cur && ['checkpoint','rest'].includes(this.cur.type)) this.i++;
    }
    get cur() { return this.obs[this.i]; }
    get elapsed() { return Math.max(((this.tEnd||Date.now())-this.t0)/60000,1/3600); }
    get cpm() { return Math.round(this.ok/this.elapsed); }
    
    key(ch, shift, space) {
        if (this.done || this.dead) return;
        if (this.aboss) {
            const b = this.aboss;
            if (ch === b.cur) { b.hit(); this.cb('bh',{b}); if(!b.alive){ this.bk++; this.aboss=null; sounds.bossDefeat(); this.cb('bd',{b}); } }
            else { b.miss(); sounds.bossMiss(); this.cb('bm',{b}); }
            return;
        }
        const t = this.cur;
        if (!t || ['checkpoint','rest'].includes(t.type)) return;
        const nb = this.bosses.find(b => b.alive && !b.fighting && b.ti > this.i && b.ti - this.i <= BOSS_DIST);
        if (nb) { nb.fighting=true; this.aboss=nb; sounds.bossAppear(); this.cb('bs',{b:nb}); return; }
        const good = this.validate(t,ch,shift,space);
        if (good) { this.ok++; sounds.correct(); this.cb('cor',{t}); this.chkCoin(this.i); this.adv(); }
        else { this.err++; this.lives--; sounds.wrong(); this.cb('wrg',{t}); if(this.lives<=0){ this.dead=true; this.tEnd=Date.now(); sounds.gameOver(); this.cb('over',{}); } }
    }
    
    validate(t,ch,shift,space) {
        switch(t.type) {
            case 'gap': return space;
            case 'step': return shift && ch === t.char;
            case 'run': return !shift && ch === t.char;
            case 'hit': return ch === t.char;
            default: return ch === t.char;
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
        while (this.cur && ['checkpoint','rest'].includes(this.cur.type)) { if (this.cur.type === 'checkpoint') this.cb('nl',{}); this.i++; }
        if (this.i >= this.obs.length) { this.done=true; this.tEnd=Date.now(); sounds.levelComplete(); this.cb('fin',{}); }
        else this.cb('adv',{t:this.cur});
    }
    
    bossTouch() { this.dead=true; this.tEnd=Date.now(); sounds.gameOver(); this.cb('over',{boss:true}); }
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
            const sp = ev.code === 'Space';
            this.e.key(sp ? ' ' : ev.key, ev.shiftKey, sp);
        };
    }
    on() { document.addEventListener('keydown', this.fn); }
    off() { document.removeEventListener('keydown', this.fn); }
}

/* ════════════════════════════════════════════════════════════════════
   SVG БУДІВНИКИ
   ════════════════════════════════════════════════════════════════════ */
function handSVG() {
    return `<svg viewBox="0 0 90 112"><rect class="fg" data-f="pinky" x="16" y="30" width="11" height="38" rx="5.5"/><rect class="fg" data-f="ring" x="29" y="14" width="12" height="54" rx="6"/><rect class="fg" data-f="mid" x="43" y="6" width="12" height="62" rx="6"/><rect class="fg" data-f="idx" x="57" y="16" width="12" height="52" rx="6"/><g transform="rotate(48 22 78)"><rect class="fg" data-f="thumb" x="2" y="71" width="34" height="15" rx="7.5"/></g><rect class="palm" x="14" y="58" width="62" height="46" rx="18"/></svg>`;
}

function bossSVG(color) {
    return `<svg width="60" height="80" viewBox="0 0 60 80"><ellipse cx="30" cy="44" rx="22" ry="28" fill="${color}" stroke="#2a1a1a" stroke-width="2"/><ellipse cx="30" cy="34" rx="18" ry="6" fill="rgba(255,255,255,0.2)" stroke="rgba(0,0,0,0.1)" stroke-width="1"/><ellipse cx="30" cy="44" rx="18" ry="6" fill="rgba(255,255,255,0.15)" stroke="rgba(0,0,0,0.1)" stroke-width="1"/><ellipse cx="30" cy="54" rx="16" ry="5" fill="rgba(255,255,255,0.1)" stroke="rgba(0,0,0,0.1)" stroke-width="1"/><circle cx="30" cy="20" r="18" fill="${color}" stroke="#2a1a1a" stroke-width="2"/><ellipse cx="24" cy="17" rx="5" ry="6" fill="white" stroke="#2a1a1a" stroke-width="1.5"/><ellipse cx="36" cy="17" rx="5" ry="6" fill="white" stroke="#2a1a1a" stroke-width="1.5"/><circle cx="25" cy="16" r="3" fill="#2a1a1a"/><circle cx="37" cy="16" r="3" fill="#2a1a1a"/><circle cx="26" cy="15" r="1.5" fill="white"/><circle cx="38" cy="15" r="1.5" fill="white"/><path d="M24 24 Q30 28 36 24" stroke="#2a1a1a" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M18 20 L8 16" stroke="#2a1a1a" stroke-width="1.5" stroke-linecap="round"/><path d="M18 22 L6 22" stroke="#2a1a1a" stroke-width="1.5" stroke-linecap="round"/><path d="M42 20 L52 16" stroke="#2a1a1a" stroke-width="1.5" stroke-linecap="round"/><path d="M42 22 L54 22" stroke="#2a1a1a" stroke-width="1.5" stroke-linecap="round"/><rect x="12" y="62" width="4" height="10" rx="2" fill="${color}" stroke="#2a1a1a" stroke-width="1"/><rect x="22" y="66" width="4" height="8" rx="2" fill="${color}" stroke="#2a1a1a" stroke-width="1"/><rect x="34" y="66" width="4" height="8" rx="2" fill="${color}" stroke="#2a1a1a" stroke-width="1"/><rect x="44" y="62" width="4" height="10" rx="2" fill="${color}" stroke="#2a1a1a" stroke-width="1"/></svg>`;
}

/* ════════════════════════════════════════════════════════════════════
   РЕНДЕРИНГ
   ════════════════════════════════════════════════════════════════════ */
class Rnd {
    constructor(lang, bg) {
        this.lang = lang;
        this.bg = bg || 'space';
        this._applyBg();
        this._clouds();
        this._ridge($('rfar'), 150, 14);
        this._ridge($('rnear'), 110, 10);
        this._trees();
        this._kb();
        $('hL').innerHTML = handSVG();
        $('hR').innerHTML = handSVG();
        this._initParallax();
        this._setHero(G.hero || 'panda');
    }
    
    _setHero(heroId) {
        const hero = HEROES[heroId] || HEROES.panda;
        const svgEl = document.getElementById('playerSvg');
        if (svgEl) {
            svgEl.innerHTML = hero.svg;
        }
    }
    
    _applyBg() {
        const stage = $('stage');
        stage.className = 'stage';
        if (this.bg) stage.classList.add('bg-' + this.bg);
        const playBtn = $('teacherPlay');
        if (playBtn) {
            const colors = { space: '#0a0a3e', dungeon: '#2a1a0a', forest: '#1a3a1a', underwater: '#003a6a', castle: '#2a1a4a' };
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
        (LAYOUTS[this.lang]?.rows||[]).forEach(row => {
            const r = mk('div','kbrow');
            row.forEach(ch => { const k = mk('div','kk'); k.dataset.c=ch; k.textContent=ch; r.appendChild(k); });
            p.appendChild(r);
        });
        const bot = mk('div','kbrow');
        const sl = mk('div','kk wide'); sl.dataset.sh='1'; sl.textContent='Shift';
        const sp = mk('div','kk sp'); sp.dataset.c=' '; sp.textContent='SPACE';
        const sr = mk('div','kk wide'); sr.dataset.sh='1'; sr.textContent='Shift';
        bot.append(sl,sp,sr); p.appendChild(bot);
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
            else if (o.type === 'checkpoint') { w = 18; bot = o.nf * LH; h = o.nf < o.floor ? (o.floor - o.nf) * LH + 14 : 14; }
            else { w = o.type === 'rest' ? TW * 0.6 : TW * 0.75; h = o.type === 'rest' ? 30 : 32; bot = (o.floor||0) * LH; }
            Object.assign(t.style, { left: i * TW + 'px', bottom: bot + 'px', width: w + 'px', height: h + 'px' });
            if (o.type === 'checkpoint') t.textContent = '↓';
            else if (!['gap','start','rest'].includes(o.type)) t.textContent = o.char;
            const lbl = mk('span','tlbl');
            lbl.textContent = { run:'', step:'Shift↑', gap:'Space', hit:'↑', checkpoint:'', start:'', rest:'' } [o.type] || '';
            t.appendChild(lbl);
            if (coins.has(i)) { const c = mk('div','coin-s'); t.appendChild(c); }
            track.appendChild(t);
        });
    }
    
    spawnBoss(b, obs) {
        const o = obs[b.ti], fl = o ? o.floor||0 : 0;
        const w = mk('div','boss-e');
        w.id = 'bw'+b.ti;
        w.style.bottom = (90 + 32 + fl * LH) + 'px';
        w.innerHTML = `
            <div class="bhpbar"><div class="bhpfill" id="bhp${b.ti}" style="width:100%"></div></div>
            ${bossSVG(b.color)}
        `;
        b.el = w;
        $('stage').appendChild(w);
        this.moveBoss(b, 1);
    }
    
    moveBoss(b, si) {
        if (!b.el) return;
        const sw = $('stage').offsetWidth;
        b.el.style.left = (sw/2 - 32 + (b.ti - si) * TW) + 'px';
    }
    
    updBossHP(b) {
        const f = $('bhp'+b.ti);
        if (f) f.style.width = (b.pct * 100) + '%';
        this.bossPanel(b);
        const hpFill = $('bossHpFill');
        if (hpFill) hpFill.style.width = (b.pct * 100) + '%';
    }
    
    bossPanel(b) {
        const pan = $('bpanel');
        if (!b || !b.alive) { pan.classList.remove('on'); return; }
        pan.classList.add('on');
        const wordEl = $('bossWord');
        if (wordEl) {
            let displayWord = '';
            for (let i = 0; i < b.word.length; i++) {
                const letter = b.word[i].toUpperCase();
                if (i < b.typed) {
                    displayWord += `<span class="letter-ok">${letter}</span>`;
                } else {
                    displayWord += `<span class="letter-wait">${letter}</span>`;
                }
            }
            wordEl.innerHTML = displayWord;
        }
    }
    
    flashMiss() { 
        const wordEl = $('bossWord');
        if (wordEl) {
            wordEl.style.animation = 'none';
            setTimeout(() => wordEl.style.animation = 'shake 0.3s', 10);
        }
    }
    
    removeBoss(b) { 
        b.el?.remove(); 
        $('bpanel').classList.remove('on'); 
    }
    
    lock(from, n, on) { for (let i=from; i<from+n; i++) { $('track').querySelector(`[data-i="${i}"]`)?.classList.toggle('locked', on); } }
    
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
        e.bosses.forEach(b => { if (b.alive) this.moveBoss(b, si); });
    }
    
    hi(i) { $('track').querySelectorAll('.tile').forEach(t => t.classList.remove('cur')); $('track').querySelector(`[data-i="${i}"]`)?.classList.add('cur'); }
    done(i) { $('track').querySelector(`[data-i="${i}"]`)?.classList.add('done'); }
    rmCoin(i) { $('track').querySelector(`[data-i="${i}"] .coin-s`)?.remove(); }
    
    prompt(obs, bossMode, bch) {
        if (bossMode) { $('pkeyEl').textContent = '⚔️ БОС!'; this.kb(null,bch); this.hands(null,bch); return; }
        if (!obs) { $('pkeyEl').textContent = '—'; this.kb(null); this.hands(null); return; }
        $('pkeyEl').textContent = obs.type==='gap' ? 'SPACE' : (obs.req ? 'Shift + ' : '') + obs.char;
        this.kb(obs); this.hands(obs);
    }
    
    warn(on) { $('promptEl').classList.toggle('warn', on); }
    running(on) { $('player').classList.toggle('run', on); }
    
    anim(type, ok) {
        const p = $('player');
        p.classList.remove('js','jg','fail');
        this.running(false);
        if (!ok) { p.classList.add('fail'); setTimeout(()=>{ p.classList.remove('fail'); this.running(true); },280); return; }
        if (type === 'step') p.classList.add('js');
        else if (type === 'gap') p.classList.add('jg');
        else this.running(true);
        setTimeout(()=>{ p.classList.remove('js','jg'); this.running(true); setTimeout(()=>this.running(false),160); },170);
    }
    
    kb(obs, bch) {
        $('kbrows').querySelectorAll('.kk').forEach(k => { k.classList.remove('a','kr','ks','kg','kh','kb'); });
        if (bch) { $('kbrows').querySelector(`.kk[data-c="${bch.toLowerCase()}"]`)?.classList.add('a','kb'); return; }
        if (!obs) return;
        const cl = { run:'kr', step:'ks', gap:'kg', hit:'kh' } [obs.type];
        if (obs.type === 'gap') { $('kbrows').querySelector('[data-c=" "]')?.classList.add('a','kg'); return; }
        $('kbrows').querySelector(`.kk[data-c="${obs.char.toLowerCase()}"]`)?.classList.add('a',cl);
        if (obs.req) $('kbrows').querySelectorAll('[data-sh]').forEach(s => s.classList.add('a','ks'));
    }
    
    hands(obs, bch) {
        [$('hL'),$('hR')].forEach(h => h.querySelectorAll('.fg').forEach(f => { f.classList.remove('a','fr','fs','fg2','fh','fb'); }));
        const map = FM[this.lang] || FM.en;
        if (bch) { const inf=map[bch.toLowerCase()]; if(inf){ const h=inf.h==='L'?$('hL'):$('hR'); h.querySelector(`[data-f="${inf.f}"]`)?.classList.add('a','fb'); } return; }
        if (!obs) return;
        const cl = { run:'fr', step:'fs', gap:'fg2', hit:'fh' } [obs.type];
        if (obs.type === 'gap') { [$('hL'),$('hR')].forEach(h => h.querySelector('[data-f="thumb"]')?.classList.add('a','fg2')); return; }
        const inf = map[obs.char.toLowerCase()];
        if (inf) { const h=inf.h==='L'?$('hL'):$('hR'); h.querySelector(`[data-f="${inf.f}"]`)?.classList.add('a',cl); }
        if (obs.req) { const op = inf?.h==='L'?$('hR'):$('hL'); op.querySelector('[data-f="pinky"]')?.classList.add('a','fs'); }
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
const BGS = ['space', 'dungeon', 'forest', 'underwater', 'castle'];
const BG_NAMES = { space: '🚀 Космос', dungeon: '🏰 Підземелля', forest: '🌲 Таємничий ліс', underwater: '🌊 Підводне царство', castle: '🏯 Замок' };
const BG_COLORS = { space: '#0a0a3e', dungeon: '#2a1a0a', forest: '#1a3a1a', underwater: '#003a6a', castle: '#2a1a4a' };

function selectBg(bgId) {
    G.bg = bgId;
    localStorage.setItem('keyboard-bg', bgId);
    document.querySelectorAll('.bg-opt').forEach(b => {
        b.classList.toggle('active', b.dataset.bg === bgId);
    });
    const preview = $('bgPreviewInner');
    if (preview) {
        preview.style.background = _getBgStyle(bgId);
        preview.style.minHeight = '120px';
        preview.style.borderRadius = '8px';
        preview.style.transition = 'background .5s';
    }
    const playBtn = $('teacherPlay');
    if (playBtn) {
        playBtn.style.background = BG_COLORS[bgId] || '#0a0a3e';
        playBtn.style.borderColor = BG_COLORS[bgId] || '#0a0a3e';
        playBtn.style.color = '#fff';
    }
}

function _getBgStyle(bgId) {
    const styles = {
        space: 'radial-gradient(ellipse at center, #0a0a3e 0%, #1a1a5e 40%, #0a0a2e 100%)',
        dungeon: 'linear-gradient(180deg, #1a0a0a 0%, #2a1a0a 40%, #1a0a0a 100%)',
        forest: 'linear-gradient(180deg, #0a2a0a 0%, #1a5a1a 40%, #0a3a0a 100%)',
        underwater: 'linear-gradient(180deg, #001a4a 0%, #003a7a 40%, #001a3a 100%)',
        castle: 'linear-gradient(180deg, #1a1a4a 0%, #2a2a6a 40%, #1a1a3a 100%)'
    };
    return styles[bgId] || styles.space;
}

/* ════════════════════════════════════════════════════════════════════
   ІНІЦІАЛІЗАЦІЯ СТОРІНКИ УЧНЯ
   ════════════════════════════════════════════════════════════════════ */
function initStudentPage() {
    const heroGrid = document.getElementById('heroGrid');
    if (heroGrid) {
        heroGrid.querySelectorAll('.hero-opt').forEach(el => {
            el.addEventListener('click', () => {
                heroGrid.querySelectorAll('.hero-opt').forEach(h => h.classList.remove('active'));
                el.classList.add('active');
                G.hero = el.dataset.hero;
                localStorage.setItem('selected_hero', G.hero);
            });
        });
        const savedHero = localStorage.getItem('selected_hero') || 'panda';
        const heroOpt = heroGrid.querySelector(`[data-hero="${savedHero}"]`);
        if (heroOpt) {
            heroOpt.classList.add('active');
            G.hero = savedHero;
        } else {
            heroGrid.querySelector('[data-hero="panda"]').classList.add('active');
            G.hero = 'panda';
        }
    }
    
    const studentId = G.studentId || 'default';
    studentProgress = new StudentProgress(studentId);
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
            if (lessonData && lessonData.stats) {
                const tip = document.createElement('div');
                tip.className = 'tooltip';
                const s = lessonData.stats;
                tip.innerHTML = `
                    <div class="tip-row"><span class="tip-label">📚 Урок</span><span class="tip-value">${lesson.title}</span></div>
                    <div class="tip-row"><span class="tip-label">✅ Правильних</span><span class="tip-value good">${s.ok || 0}</span></div>
                    <div class="tip-row"><span class="tip-label">❌ Помилок</span><span class="tip-value ${s.err > 5 ? 'bad' : 'good'}">${s.err || 0}</span></div>
                    <div class="tip-row"><span class="tip-label">⚡ CPM</span><span class="tip-value">${s.cpm || 0}</span></div>
                    <div class="tip-row"><span class="tip-label">🪙 Монет</span><span class="tip-value">${s.coins || 0}</span></div>
                    <div class="tip-row"><span class="tip-label">⚔️ Босів</span><span class="tip-value">${s.bosses || 0}</span></div>
                    <div class="tip-row"><span class="tip-label">❤️ Життів</span><span class="tip-value">${s.lives || 0}</span></div>
                `;
                item.appendChild(tip);
            }
        }
        grid.appendChild(item);
    });
}

/* ════════════════════════════════════════════════════════════════════
   UI ПОТІК
   ════════════════════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', async () => {
    try { const r = await fetch('index.json'); G.index = await r.json(); } catch { G.index = null; }
    const p = new URLSearchParams(window.location.search);
    if (p.get('role') === 'student') {
        G.lang = p.get('lang') || 'ua';
        G.grade = p.get('grade');
        G.difficulty = parseInt(p.get('diff')) || 5;
        const lid = p.get('lid');
        const lesson = G.index?.[G.lang]?.[G.grade]?.find(l => l.id === lid);
        G.lessonFile = lesson?.file || null;
        G.lessonTitle = lesson?.title || 'Урок';
        $('studentBadge').textContent = `${G.lang === 'ua' ? '🇺🇦' : '🇬🇧'} ${G.grade} клас`;
        $('studentTitle').textContent = G.lessonTitle;
        $('studentSub').textContent = lesson ? `Урок: ${lesson.title}` : 'Оберіть XML файл';
        $('studentDiff').textContent = G.difficulty;
        initStudentPage();
        show('s-student');
    } else {
        show('s-lang');
        const savedBg = localStorage.getItem('keyboard-bg');
        if (savedBg && BGS.includes(savedBg)) {
            G.bg = savedBg;
            selectBg(savedBg);
        }
    }
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
    for (let n=2; n<=11; n++) {
        const hasLessons = G.index?.[G.lang]?.[String(n)]?.length > 0;
        const b = mk('button', 'btn' + (hasLessons ? '' : ' '));
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
    $('lessonTitle').textContent = G.lang === 'ua' ? `${n} клас — оберіть урок` : `Grade ${n} — choose lesson`;
    const list = $('lessonList');
    list.innerHTML = '';
    $('lessonActions').style.display = 'none';
    const lessons = G.index?.[G.lang]?.[String(n)] || [];
    lessons.forEach(l => {
        const card = mk('div','lesson-card');
        card.innerHTML = `<div>${l.title}</div><small>${l.id}</small>`;
        card.onclick = () => {
            document.querySelectorAll('.lesson-card').forEach(c => c.classList.remove('sel'));
            card.classList.add('sel');
            G.lessonFile = l.file;
            G.lessonTitle = l.title;
            G.data = null;
            const url = new URL(window.location.href);
            url.searchParams.set('role','student');
            url.searchParams.set('lang',G.lang);
            url.searchParams.set('grade',G.grade);
            url.searchParams.set('lid',l.id);
            url.searchParams.set('diff', G.difficulty);
            $('linkText').textContent = url.toString();
            $('lessonActions').style.display = 'flex';
        };
        list.appendChild(card);
    });
    if (!lessons.length) { const p=mk('p','sub'); p.textContent=G.lang==='ua'?'Уроки для цього класу ще не додані.':'No lessons for this grade yet.'; list.appendChild(p); }
    show('s-lesson');
}

$('backToGrade').onclick = () => show('s-grade');

const diffSlider = $('difficultySlider');
const diffLabel = $('diffLabel');
if (diffSlider && diffLabel) {
    diffSlider.addEventListener('input', () => {
        G.difficulty = parseInt(diffSlider.value);
        diffLabel.textContent = G.difficulty;
        const linkText = $('linkText');
        if (linkText) {
            try {
                const url = new URL(linkText.textContent);
                url.searchParams.set('diff', G.difficulty);
                linkText.textContent = url.toString();
            } catch (e) {}
        }
    });
    G.difficulty = parseInt(diffSlider.value);
}

$('copyBtn').onclick = () => navigator.clipboard?.writeText($('linkText').textContent).then(() => toast('Посилання скопійовано!'));

$('teacherPlay').onclick = loadAndPlay;
$('studentPlay').onclick = loadAndPlay;

$('fileTeacher').addEventListener('change', e => loadFromFile(e.target.files[0]));
$('fileStudent').addEventListener('change', e => loadFromFile(e.target.files[0]));

async function loadAndPlay() {
    if (G.data) { launchLevel(G.data); return; }
    if (!G.lessonFile) {
        const msg = G.lang === 'ua' ? 'Оберіть урок або XML файл' : 'Select a lesson or XML file';
        alert(msg);
        return;
    }
    try {
        const r = await fetch(G.lessonFile);
        if (!r.ok) throw 0;
        G.data = parseXML(await r.text());
        launchLevel(G.data);
    } catch {
        toast(G.lang === 'ua' ? '⚠️ Оберіть XML файл через кнопку нижче' : '⚠️ Pick XML file using the button below');
    }
}

async function loadFromFile(f) {
    if (!f) return;
    G.data = parseXML(await f.text());
    launchLevel(G.data);
}

/* ════════════════════════════════════════════════════════════════════
   ЗАПУСК РІВНЯ ТА ІГРОВІ ПОДІЇ
   ════════════════════════════════════════════════════════════════════ */
function launchLevel(data) {
    bossTmrs.forEach(clearInterval);
    bossTmrs = [];
    $('stage').querySelectorAll('.boss-e').forEach(e => e.remove());
    
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
    const bosses = (data.words||[]).map((w,wi) => {
        const slot = Math.floor((wi+1)*ats.length/((data.words.length||1)+1));
        const ti = ats[Math.min(slot,ats.length-1)]?.i || 10+wi*20;
        return new Boss(w,ti);
    });
    
    eng = new GE(raw,bosses,coins,onEv);
    eng.obs = obs;
    rnd = new Rnd(G.lang, G.bg);
    rnd.buildTrack(obs, coins);
    bosses.forEach(b => rnd.spawnBoss(b, obs));
    rnd.hi(eng.i);
    rnd.prompt(eng.cur);
    rnd.cam(eng);
    rnd.running(true);
    rnd.coinsUI(0,0);
    if (inp) inp.off();
    inp = new IC(eng);
    inp.on();
    rnd.hud(eng);
    show('sg');
}

function onEv(ev, pl) {
    switch(ev) {
        case 'cor': rnd.done(eng.i); rnd.anim(pl.t.type,true); rnd.warn(false); rnd.cam(eng); break;
        case 'wrg': rnd.anim(pl.t.type,false); rnd.warn(true); toast('❌ Невірна клавіша!'); break;
        case 'nl': toast('↓ Новий рядок'); break;
        case 'adv':
            rnd.done(eng.i-1); rnd.hi(eng.i); rnd.cam(eng);
            const nb = eng.bosses.find(b => b.alive && !b.fighting && b.ti > eng.i && b.ti - eng.i <= BOSS_DIST);
            if (nb) {
                nb.fighting=true;
                eng.aboss=nb;
                rnd.lock(eng.i, BOSS_DIST, true);
                rnd.prompt(null, true, nb.cur);
                startBossTimer(nb);
                rnd.bossPanel(nb);
                rnd.updBossHP(nb);
            } else {
                rnd.prompt(eng.cur, !!eng.aboss, eng.aboss?.cur);
            }
            break;
        case 'coin': rnd.rmCoin(eng.i-1); rnd.coinsUI(eng.cbank,eng.ctotal); toast(`🪙 Монета! ${eng.cbank}/3`); break;
        case 'lu': rnd.coinsUI(eng.cbank,eng.ctotal); toast('❤️ +1 Життя!'); break;
        case 'bs':
            rnd.lock(eng.i, BOSS_DIST, true);
            rnd.prompt(null, true, pl.b.cur);
            startBossTimer(pl.b);
            rnd.bossPanel(pl.b);
            rnd.updBossHP(pl.b);
            break;
        case 'bh': rnd.updBossHP(pl.b); rnd.kb(null, pl.b.alive ? pl.b.cur : null); rnd.hands(null, pl.b.alive ? pl.b.cur : null); break;
        case 'bm': rnd.flashMiss(); rnd.updBossHP(pl.b); toast('💥 Промах! Починай спочатку!'); break;
        case 'bd':
            bossTmrs.forEach(clearInterval);
            bossTmrs = [];
            rnd.removeBoss(pl.b);
            rnd.lock(eng.i, BOSS_DIST, false);
            toast('⚔️ Бос переможений!');
            eng.aboss = null;
            rnd.prompt(eng.cur);
            break;
        case 'fin': endGame(true); break;
        case 'over': endGame(false, pl.boss); break;
    }
    rnd.hud(eng);
}

function startBossTimer(b) {
    bossTmrs.forEach(clearInterval);
    bossTmrs = [];
    const diff = G.difficulty || 5;
    const minInterval = 300;
    const maxInterval = BOSS_TICK;
    const normalizedDiff = (diff - 1) / 9;
    const interval = maxInterval - normalizedDiff * (maxInterval - minInterval);
    
    const t = setInterval(() => {
        if (!b.alive) { clearInterval(t); return; }
        if (diff > 1) {
            b.ti--;
            rnd.moveBoss(b, eng.i - 1);
            if (b.ti <= eng.i) {
                clearInterval(t);
                eng.bossTouch();
            }
        }
    }, interval);
    bossTmrs.push(t);
}

function endGame(ok, bossKill) {
    inp.off();
    rnd.running(false);
    bossTmrs.forEach(clearInterval);
    bossTmrs = [];
    
    if (ok && G.lessonFile && studentProgress) {
        const lessonId = G.lessonFile.replace(/\.xml$/, '').replace(/^.*[\\\/]/, '');
        studentProgress.completeLesson(lessonId, {
            ok: eng.ok,
            err: eng.err,
            cpm: eng.cpm,
            coins: eng.ctotal,
            bosses: eng.bk,
            lives: Math.max(eng.lives, 0),
            date: new Date().toISOString()
        });
        updateProgressDisplay();
    }
    
    const ua = G.lang === 'ua';
    $('resTitle').textContent = bossKill ?
        (ua ? '🐛 Бос дістав тебе! 💀' : '🐛 Boss got you! 💀') :
        ok ?
        (ua ? '🎉 Рівень пройдено! 🎉' : '🎉 Level complete! 🎉') :
        (ua ? '💥 Гра закінчена 💥' : '💥 Game over 💥');
    $('rTotal').textContent = eng.ok;
    $('rCpm').textContent = eng.cpm;
    $('rErr').textContent = eng.err;
    $('rCoins').textContent = eng.ctotal;
    $('rLives').textContent = Math.max(eng.lives, 0);
    $('rBoss').textContent = eng.bk;
    show('s-result');
}

$('retryBtn').onclick = () => launchLevel(G.data);
$('menuBtn').onclick = () => {
    if (new URLSearchParams(window.location.search).get('role') === 'student') show('s-student');
    else show('s-lang');
};

/**
 * Рівні та декорації для клавіатурного тренажера
 * 5 унікальних рівнів:
 * 1. space - Космос (планети, астероїди, літаючі комети, зірки)
 * 2. dungeon - Підземелля (сталактити, сталагміти, підземні замки, лава, кристали)
 * 3. forest - Таємничий ліс (магічні дерева, гігантські сяючі гриби, світлячки, туман)
 * 4. underwater - Підводне царство (корали, водорості, бульбашки, підводний палац, рибки)
 * 5. kingdom - Королівство (королівський замок, будиночки, таверна, вітряк, бруківка)
 */

(function() {
    'use strict';

    // Допоміжні функції для створення елементів
    function mk(tag, cls) {
        const el = document.createElement(tag);
        if (cls) el.className = cls;
        return el;
    }

    const Scenery = {
        /**
         * Ініціалізація та застосування декорацій для обраного фону
         */
        apply(bgId, stageEl) {
            const bg = (bgId === 'castle' || bgId === 'kingdom') ? 'kingdom' : (bgId || 'space');
            
            this.setupCelestial(bg);
            this.setupFloating(bg);
            this.setupFarScenery(bg);
            this.setupMidScenery(bg);
            this.setupNearScenery(bg);
            this.setupGround(bg);
        },

        /**
         * Небесне світило (.sun)
         */
        setupCelestial(bg) {
            const sunEl = document.querySelector('.sun');
            if (!sunEl) return;
            sunEl.className = 'sun celestial-' + bg;
            sunEl.innerHTML = '';

            if (bg === 'space') {
                // Сатурноподібна планета з сяючими кільцями
                sunEl.innerHTML = `
                    <svg viewBox="0 0 120 120" width="100%" height="100%">
                        <defs>
                            <radialGradient id="planetGrad" cx="35%" cy="35%" r="65%">
                                <stop offset="0%" stop-color="#ffd56b"/>
                                <stop offset="40%" stop-color="#ff884d"/>
                                <stop offset="80%" stop-color="#c43b5d"/>
                                <stop offset="100%" stop-color="#4a154b"/>
                            </radialGradient>
                            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="rgba(255,230,160,0.9)"/>
                                <stop offset="50%" stop-color="rgba(255,160,200,0.6)"/>
                                <stop offset="100%" stop-color="rgba(120,200,255,0.8)"/>
                            </linearGradient>
                            <filter id="spaceGlow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="blur"/>
                                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                            </filter>
                        </defs>
                        <!-- Задня дуга кілець -->
                        <path d="M 10 50 A 55 18 0 0 1 110 50" stroke="url(#ringGrad)" stroke-width="9" fill="none" opacity="0.5"/>
                        <!-- Тіло планети -->
                        <circle cx="60" cy="60" r="32" fill="url(#planetGrad)" filter="url(#spaceGlow)"/>
                        <!-- Смуги на планеті -->
                        <path d="M 32 52 Q 60 58 88 52" stroke="rgba(255,255,255,0.25)" stroke-width="3" fill="none"/>
                        <path d="M 30 64 Q 60 70 90 64" stroke="rgba(74,21,75,0.4)" stroke-width="4" fill="none"/>
                        <!-- Передня дуга кілець -->
                        <path d="M 110 50 A 55 18 0 0 1 10 50" stroke="url(#ringGrad)" stroke-width="9" fill="none"/>
                        <path d="M 116 50 A 60 20 0 0 1 4 50" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" fill="none"/>
                    </svg>
                `;
            } else if (bg === 'dungeon') {
                // Розлом у склепінні печери з палаючою магмою та іскрами
                sunEl.innerHTML = `
                    <svg viewBox="0 0 120 120" width="100%" height="100%">
                        <defs>
                            <radialGradient id="magmaGrad" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stop-color="#fffb99"/>
                                <stop offset="25%" stop-color="#ff7700"/>
                                <stop offset="65%" stop-color="#c91800"/>
                                <stop offset="100%" stop-color="transparent"/>
                            </radialGradient>
                        </defs>
                        <circle cx="60" cy="60" r="54" fill="url(#magmaGrad)"/>
                        <!-- Силует кам'яного склепіння навколо розлому -->
                        <path d="M 10 20 L 35 45 L 30 25 L 60 38 L 75 15 L 85 40 L 110 25 L 95 65 L 115 85 L 85 80 L 70 105 L 50 85 L 30 100 L 35 70 Z" fill="#120808" opacity="0.75"/>
                    </svg>
                `;
            } else if (bg === 'forest') {
                // Магічний величний повний місяць з рунами та туманним сяйвом
                sunEl.innerHTML = `
                    <svg viewBox="0 0 120 120" width="100%" height="100%">
                        <defs>
                            <radialGradient id="moonGrad" cx="40%" cy="38%" r="62%">
                                <stop offset="0%" stop-color="#ffffff"/>
                                <stop offset="45%" stop-color="#e0f7fa"/>
                                <stop offset="80%" stop-color="#80deea"/>
                                <stop offset="100%" stop-color="#26a69a"/>
                            </radialGradient>
                            <filter id="moonHalo">
                                <feGaussianBlur stdDeviation="4"/>
                            </filter>
                        </defs>
                        <!-- Ореол сяйва -->
                        <circle cx="60" cy="60" r="50" fill="#80deea" opacity="0.3" filter="url(#moonHalo)"/>
                        <!-- Диск місяця -->
                        <circle cx="60" cy="60" r="40" fill="url(#moonGrad)"/>
                        <!-- Місячні кратери / плями -->
                        <circle cx="48" cy="50" r="9" fill="#80deea" opacity="0.35"/>
                        <circle cx="72" cy="56" r="11" fill="#80deea" opacity="0.3"/>
                        <circle cx="58" cy="72" r="7" fill="#4db6ac" opacity="0.3"/>
                        <circle cx="42" cy="70" r="4" fill="#4db6ac" opacity="0.25"/>
                    </svg>
                `;
            } else if (bg === 'underwater') {
                // Промені світла крізь воду та відблиски
                sunEl.innerHTML = `
                    <svg viewBox="0 0 120 120" width="100%" height="100%">
                        <defs>
                            <radialGradient id="oceanSun" cx="50%" cy="40%" r="60%">
                                <stop offset="0%" stop-color="#e0ffff"/>
                                <stop offset="35%" stop-color="#80e5ff"/>
                                <stop offset="70%" stop-color="#0099cc"/>
                                <stop offset="100%" stop-color="transparent"/>
                            </radialGradient>
                        </defs>
                        <circle cx="60" cy="60" r="55" fill="url(#oceanSun)"/>
                        <!-- Промені світла -->
                        <polygon points="60,60 10,120 35,120" fill="rgba(224,255,255,0.25)"/>
                        <polygon points="60,60 50,120 80,120" fill="rgba(224,255,255,0.3)"/>
                        <polygon points="60,60 95,120 115,120" fill="rgba(224,255,255,0.2)"/>
                    </svg>
                `;
            } else {
                // Королівство: вечірнє золотаве сонце/місяць з м'яким теплим сяйвом
                sunEl.innerHTML = `
                    <svg viewBox="0 0 120 120" width="100%" height="100%">
                        <defs>
                            <radialGradient id="kingSun" cx="45%" cy="45%" r="55%">
                                <stop offset="0%" stop-color="#eed488"/>
                                <stop offset="45%" stop-color="#cf9438"/>
                                <stop offset="85%" stop-color="#8a531e"/>
                                <stop offset="100%" stop-color="#4a220b"/>
                            </radialGradient>
                        </defs>
                        <!-- М'які вечірні промені -->
                        <g stroke="#b88628" stroke-width="2.5" stroke-linecap="round" opacity="0.35">
                            <line x1="60" y1="12" x2="60" y2="2" />
                            <line x1="60" y1="108" x2="60" y2="118" />
                            <line x1="12" y1="60" x2="2" y2="60" />
                            <line x1="108" y1="60" x2="118" y2="60" />
                            <line x1="26" y1="26" x2="18" y2="18" />
                            <line x1="94" y1="94" x2="102" y2="102" />
                            <line x1="26" y1="94" x2="18" y2="102" />
                            <line x1="94" y1="26" x2="102" y2="18" />
                        </g>
                        <circle cx="60" cy="60" r="38" fill="url(#kingSun)"/>
                    </svg>
                `;
            }
        },

        /**
         * Літаючі об'єкти (.clouds container):
         * - Космос: комети, астероїди
         * - Підземелля: сталактити, що звисають зі стелі
         * - Ліс: світлячки
         * - Підводне: бульбашки, рибки, медузи
         * - Королівство: білі хмарки, ластівки
         */
        setupFloating(bg) {
            const cl = document.getElementById('clouds');
            if (!cl) return;
            cl.innerHTML = '';

            if (bg === 'space') {
                // Літаючі комети
                for (let i = 0; i < 3; i++) {
                    const comet = mk('div', 'flying-comet');
                    comet.style.top = (8 + i * 16) + '%';
                    comet.style.animationDelay = (i * 3.5) + 's';
                    comet.style.animationDuration = (7 + i * 2) + 's';
                    comet.innerHTML = `
                        <svg viewBox="0 0 160 50" width="160" height="50">
                            <defs>
                                <linearGradient id="cometTail${i}" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stop-color="rgba(100,220,255,0)"/>
                                    <stop offset="60%" stop-color="rgba(160,100,255,0.4)"/>
                                    <stop offset="90%" stop-color="rgba(100,240,255,0.85)"/>
                                    <stop offset="100%" stop-color="#ffffff"/>
                                </linearGradient>
                            </defs>
                            <polygon points="0,25 140,20 150,25 140,30" fill="url(#cometTail${i})"/>
                            <circle cx="148" cy="25" r="5" fill="#ffffff"/>
                            <circle cx="148" cy="25" r="9" fill="rgba(130,220,255,0.6)"/>
                        </svg>
                    `;
                    cl.appendChild(comet);
                }

                // Дрейфуючі астероїди
                const asteroids = [
                    { top: '15%', size: 48, dur: '28s', delay: '0s', rot: 45 },
                    { top: '28%', size: 36, dur: '34s', delay: '-12s', rot: 110 },
                    { top: '8%', size: 56, dur: '40s', delay: '-22s', rot: 210 },
                    { top: '38%', size: 30, dur: '24s', delay: '-6s', rot: 75 }
                ];
                asteroids.forEach((ast, idx) => {
                    const el = mk('div', 'floating-asteroid');
                    el.style.top = ast.top;
                    el.style.width = ast.size + 'px';
                    el.style.height = ast.size + 'px';
                    el.style.animationDuration = ast.dur;
                    el.style.animationDelay = ast.delay;
                    el.innerHTML = `
                        <svg viewBox="0 0 60 60" width="100%" height="100%">
                            <polygon points="12,18 25,6 45,10 54,26 48,48 28,56 10,44 6,28" fill="#5a4e66" stroke="#8c7d9e" stroke-width="2"/>
                            <circle cx="24" cy="22" r="5" fill="#443950"/>
                            <circle cx="38" cy="36" r="7" fill="#443950"/>
                            <circle cx="20" cy="40" r="4" fill="#3a3045"/>
                            <polygon points="34,14 42,16 38,22" fill="#756787"/>
                        </svg>
                    `;
                    cl.appendChild(el);
                });
            } else if (bg === 'dungeon') {
                // Сталактити, що звисають зі стелі по всій ширині!
                const stalContainer = mk('div', 'stalactites-row');
                stalContainer.innerHTML = `
                    <svg viewBox="0 0 1200 90" width="100%" height="90" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="stalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stop-color="#2a1610"/>
                                <stop offset="50%" stop-color="#3d2319"/>
                                <stop offset="90%" stop-color="#543325"/>
                                <stop offset="100%" stop-color="#804a35"/>
                            </linearGradient>
                            <linearGradient id="dripGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stop-color="#ff7700"/>
                                <stop offset="100%" stop-color="#ffdd66"/>
                            </linearGradient>
                        </defs>
                        <!-- Верхня кромка стелі -->
                        <path d="M 0 0 L 1200 0 L 1200 20 
                                 L 1160 55 L 1150 18 
                                 L 1100 70 L 1090 22 
                                 L 1040 45 L 1020 15 
                                 L 970 85 L 955 20 
                                 L 910 50 L 890 15 
                                 L 830 75 L 815 18 
                                 L 760 60 L 745 15 
                                 L 690 90 L 675 22 
                                 L 630 45 L 610 16 
                                 L 560 80 L 545 20 
                                 L 500 55 L 485 18 
                                 L 430 85 L 415 22 
                                 L 370 50 L 350 15 
                                 L 290 75 L 275 18 
                                 L 230 60 L 215 15 
                                 L 160 90 L 145 22 
                                 L 100 45 L 80 15 
                                 L 30 75 L 15 18 Z" fill="url(#stalGrad)"/>
                        <!-- Вогняні краплі, що капають зі сталактитів -->
                        <circle cx="160" cy="93" r="2.5" fill="url(#dripGrad)"/>
                        <circle cx="430" cy="88" r="2.5" fill="url(#dripGrad)"/>
                        <circle cx="690" cy="93" r="2.5" fill="url(#dripGrad)"/>
                        <circle cx="970" cy="88" r="2.5" fill="url(#dripGrad)"/>
                    </svg>
                `;
                cl.appendChild(stalContainer);

                // Парячі вогняні іскри
                for (let i = 0; i < 8; i++) {
                    const spark = mk('div', 'cave-spark');
                    spark.style.left = (10 + (i * 12)) + '%';
                    spark.style.bottom = (20 + (i * 8)) + '%';
                    spark.style.animationDelay = (i * 0.7) + 's';
                    cl.appendChild(spark);
                }
            } else if (bg === 'forest') {
                // Лісові світлячки (fireflies), що мерехтять і пурхають
                for (let i = 0; i < 14; i++) {
                    const f = mk('div', 'firefly');
                    f.style.left = (4 + i * 7) + '%';
                    f.style.top = (15 + (i % 5) * 12) + '%';
                    f.style.animationDelay = (i * 0.45) + 's';
                    f.style.animationDuration = (3.5 + (i % 4) * 0.8) + 's';
                    cl.appendChild(f);
                }

                // Магічні стрічки туману
                [{t:'20%', w:'220px', d:'22s'}, {t:'35%', w:'280px', d:'30s'}, {t:'12%', w:'250px', d:'26s'}].forEach((m, idx) => {
                    const fog = mk('div', 'forest-fog');
                    fog.style.top = m.t;
                    fog.style.width = m.w;
                    fog.style.animationDuration = m.d;
                    fog.style.animationDelay = (idx * -7) + 's';
                    cl.appendChild(fog);
                });
            } else if (bg === 'underwater') {
                // Бульбашки повітря, що піднімаються вгору
                for (let i = 0; i < 20; i++) {
                    const b = mk('div', 'ocean-bubble');
                    const size = 6 + (i % 5) * 4;
                    b.style.width = size + 'px';
                    b.style.height = size + 'px';
                    b.style.left = (3 + i * 5) + '%';
                    b.style.animationDuration = (5 + (i % 6) * 1.5) + 's';
                    b.style.animationDelay = (i * 0.4) + 's';
                    cl.appendChild(b);
                }

                // Плаваючі медузи та рибки
                for (let i = 0; i < 3; i++) {
                    const j = mk('div', 'ocean-jellyfish');
                    j.style.top = (15 + i * 18) + '%';
                    j.style.animationDuration = (18 + i * 6) + 's';
                    j.style.animationDelay = (i * -6) + 's';
                    j.innerHTML = `
                        <svg viewBox="0 0 50 60" width="40" height="48">
                            <path d="M 5 25 Q 25 5 45 25 Q 40 32 25 30 Q 10 32 5 25 Z" fill="rgba(200,160,255,0.55)" stroke="#e0b0ff" stroke-width="1.5"/>
                            <path d="M 12 30 Q 10 45 14 55" stroke="rgba(220,180,255,0.7)" stroke-width="1.5" fill="none"/>
                            <path d="M 20 30 Q 23 48 19 58" stroke="rgba(220,180,255,0.7)" stroke-width="1.5" fill="none"/>
                            <path d="M 28 30 Q 26 46 31 58" stroke="rgba(220,180,255,0.7)" stroke-width="1.5" fill="none"/>
                            <path d="M 37 30 Q 39 45 35 55" stroke="rgba(220,180,255,0.7)" stroke-width="1.5" fill="none"/>
                        </svg>
                    `;
                    cl.appendChild(j);
                }
            } else {
                // Королівство: пишні казкові хмари та зграйки птахів
                const cloudsData = [
                    { t:'10%', l:'5%', w:120, h:36, d:'28s' },
                    { t:'18%', l:'38%', w:95, h:30, d:'34s' },
                    { t:'8%', l:'65%', w:140, h:42, d:'25s' },
                    { t:'24%', l:'85%', w:85, h:28, d:'30s' }
                ];
                cloudsData.forEach((c, i) => {
                    const e = mk('div', 'kingdom-cloud');
                    Object.assign(e.style, {
                        top: c.t, left: c.l, width: c.w + 'px', height: c.h + 'px',
                        animation: `cdrift ${c.d} linear ${i * -6}s infinite`
                    });
                    cl.appendChild(e);
                });

                // Зграя птахів над королівством
                const flock = mk('div', 'bird-flock');
                flock.innerHTML = `
                    <svg viewBox="0 0 100 40" width="80" height="32">
                        <path d="M 5 20 Q 15 10 25 20 Q 35 10 45 20" stroke="#4a5568" stroke-width="2" fill="none"/>
                        <path d="M 40 10 Q 48 2 56 10 Q 64 2 72 10" stroke="#4a5568" stroke-width="1.8" fill="none"/>
                        <path d="M 65 24 Q 72 16 80 24 Q 87 16 95 24" stroke="#4a5568" stroke-width="1.6" fill="none"/>
                    </svg>
                `;
                cl.appendChild(flock);
            }
        },

        /**
         * Далекий горизонт (#rfar - 5000px ширини):
         * - Космос: далекі кільчасті планети, космічні хребти, туманності
         * - Підземелля: ПІДЗЕМНІ ЗАМКИ (величні фортеці, вирізані в скелях)
         * - Ліс: прадавній ліс велетнів, високі крони дерев
         * - Підводне: ПІДВОДНИЙ ПАЛАЦ (Атлантида)
         * - Королівство: ВЕЛИЧНИЙ КОРОЛІВСЬКИЙ ЗАМОК з баштами і прапорами
         */
        setupFarScenery(bg) {
            const rfar = document.getElementById('rfar');
            if (!rfar) return;
            rfar.innerHTML = '';
            rfar.style.clipPath = 'none';
            rfar.style.background = 'transparent';

            let content = '';
            if (bg === 'space') {
                // Космічний горизонт з далекими планетами та зоряними хребтами
                let units = '';
                for (let x = 0; x < 5200; x += 650) {
                    units += `
                        <g transform="translate(${x}, 0)">
                            <!-- Далека кільчаста планета -->
                            <circle cx="180" cy="40" r="28" fill="#4b2a6b" opacity="0.65"/>
                            <ellipse cx="180" cy="40" rx="46" ry="10" stroke="#795299" stroke-width="3" fill="none" opacity="0.6"/>
                            <!-- Місяць на горизонті -->
                            <circle cx="480" cy="30" r="16" fill="#32527b" opacity="0.6"/>
                            <!-- Зоряний хребет -->
                            <polygon points="0,150 70,60 140,95 220,50 310,105 400,55 490,90 580,45 650,150" fill="#151336" opacity="0.8"/>
                        </g>
                    `;
                }
                rfar.innerHTML = `<svg viewBox="0 0 5200 150" width="5200" height="150">${units}</svg>`;
            } else if (bg === 'dungeon') {
                // ПІДЗЕМНІ ЗАМКИ: колосальні кам'яні фортеці, вмонтовані у скелі печери
                let units = '';
                for (let x = 0; x < 5200; x += 700) {
                    units += `
                        <g transform="translate(${x}, 0)">
                            <!-- Силует підземного замку -->
                            <!-- Головна вежа -->
                            <rect x="220" y="20" width="70" height="130" fill="#1b0e0c"/>
                            <polygon points="215,20 255,0 295,20" fill="#2d1714"/>
                            <!-- Зубці вежі -->
                            <rect x="220" y="15" width="10" height="8" fill="#2d1714"/>
                            <rect x="240" y="15" width="10" height="8" fill="#2d1714"/>
                            <rect x="260" y="15" width="10" height="8" fill="#2d1714"/>
                            <rect x="280" y="15" width="10" height="8" fill="#2d1714"/>
                            <!-- Вікна зі смолоскипним сяйвом -->
                            <path d="M 245 40 Q 255 35 265 40 L 265 55 L 245 55 Z" fill="#ff7700" opacity="0.9"/>
                            <path d="M 245 70 Q 255 65 265 70 L 265 85 L 245 85 Z" fill="#ff5500" opacity="0.9"/>
                            <!-- Ліве крило замку -->
                            <rect x="140" y="50" width="80" height="100" fill="#160c0a"/>
                            <rect x="125" y="38" width="25" height="112" fill="#1a0e0c"/>
                            <polygon points="122,38 137,22 153,38" fill="#2d1714"/>
                            <rect x="155" y="70" width="12" height="18" rx="6" fill="#ff8800" opacity="0.8"/>
                            <rect x="185" y="70" width="12" height="18" rx="6" fill="#ff8800" opacity="0.8"/>
                            <!-- Праве крило замку зі шпилями -->
                            <rect x="290" y="55" width="85" height="95" fill="#160c0a"/>
                            <rect x="375" y="32" width="28" height="118" fill="#1a0e0c"/>
                            <polygon points="371,32 389,14 407,32" fill="#2d1714"/>
                            <rect x="315" y="72" width="12" height="18" rx="6" fill="#ff8800" opacity="0.8"/>
                            <!-- Скелясті стіни каньйону -->
                            <polygon points="0,150 40,75 130,110 200,65 340,90 470,55 580,105 700,150" fill="#110706" opacity="0.85"/>
                            <!-- Кам'яний підвісний міст над прірвою -->
                            <path d="M 403 60 Q 480 85 560 60" stroke="#2a1410" stroke-width="5" fill="none"/>
                            <line x1="403" y1="60" x2="403" y2="150" stroke="#1b0e0c" stroke-width="12"/>
                            <line x1="560" y1="60" x2="560" y2="150" stroke="#1b0e0c" stroke-width="12"/>
                        </g>
                    `;
                }
                rfar.innerHTML = `<svg viewBox="0 0 5200 150" width="5200" height="150">${units}</svg>`;
            } else if (bg === 'forest') {
                // Таємничий ліс: силуети велетенських стародавніх дерев з верхівками
                let units = '';
                for (let x = 0; x < 5200; x += 550) {
                    units += `
                        <g transform="translate(${x}, 0)">
                            <!-- Прадавні колосальні дерева -->
                            <path d="M 80 150 Q 100 80 70 30 Q 110 5 160 30 Q 140 80 160 150 Z" fill="#0b2416"/>
                            <path d="M 120 40 Q 180 10 240 40 Q 220 80 250 150 L 190 150 Z" fill="#081c11"/>
                            <circle cx="115" cy="35" r="45" fill="#0e2e1c" opacity="0.75"/>
                            <circle cx="210" cy="45" r="50" fill="#0b2416" opacity="0.75"/>
                            <circle cx="340" cy="50" r="55" fill="#0e2e1c" opacity="0.75"/>
                            <circle cx="460" cy="40" r="45" fill="#0b2416" opacity="0.75"/>
                            <!-- Сяючі магічні вогники у далеких кронах -->
                            <circle cx="120" cy="30" r="3" fill="#64ffda" opacity="0.8"/>
                            <circle cx="230" cy="40" r="2.5" fill="#b9f6ca" opacity="0.8"/>
                            <circle cx="335" cy="45" r="3" fill="#64ffda" opacity="0.8"/>
                        </g>
                    `;
                }
                rfar.innerHTML = `<svg viewBox="0 0 5200 150" width="5200" height="150">${units}</svg>`;
            } else if (bg === 'underwater') {
                // Підводний палац (Атлантида): бані-мушлі, колони, підводні арки
                let units = '';
                for (let x = 0; x < 5200; x += 650) {
                    units += `
                        <g transform="translate(${x}, 0)">
                            <!-- Силует затонулого королівського палацу -->
                            <!-- Центральний купол палацу -->
                            <path d="M 210 65 Q 260 20 310 65 Z" fill="#003554"/>
                            <rect x="220" y="65" width="80" height="85" fill="#002b45"/>
                            <!-- Колони палацу -->
                            <rect x="230" y="70" width="8" height="80" fill="#00466c"/>
                            <rect x="256" y="70" width="8" height="80" fill="#00466c"/>
                            <rect x="282" y="70" width="8" height="80" fill="#00466c"/>
                            <!-- Шпиль з тризубом -->
                            <line x1="260" y1="20" x2="260" y2="2" stroke="#00a896" stroke-width="2.5"/>
                            <path d="M 254 8 L 260 2 L 266 8 M 253 12 L 267 12" stroke="#00a896" stroke-width="2" fill="none"/>
                            <!-- Бічні башти з мушлями -->
                            <rect x="150" y="55" width="45" height="95" fill="#00253c"/>
                            <path d="M 145 55 Q 172 35 200 55 Z" fill="#003554"/>
                            <rect x="325" y="55" width="45" height="95" fill="#00253c"/>
                            <path d="M 320 55 Q 347 35 375 55 Z" fill="#003554"/>
                            <!-- Підводний рельєф -->
                            <polygon points="0,150 80,105 160,120 260,85 360,115 480,95 580,130 650,150" fill="#001d31" opacity="0.8"/>
                        </g>
                    `;
                }
                rfar.innerHTML = `<svg viewBox="0 0 5200 150" width="5200" height="150">${units}</svg>`;
            } else {
                // ВЕЛИЧНИЙ КОРОЛІВСЬКИЙ ЗАМОК: вечірні величні силуети веж та пагорбів
                let units = '';
                for (let x = 0; x < 5200; x += 750) {
                    units += `
                        <g transform="translate(${x}, 0)">
                            <!-- Замковий пагорб -->
                            <path d="M 0 150 Q 250 80 500 150 Z" fill="#132015"/>
                            <!-- Головна центральна цитадель -->
                            <rect x="230" y="30" width="80" height="120" fill="#2a303d"/>
                            <polygon points="220,30 270,0 320,30" fill="#1b283d"/>
                            <!-- Прапор на шпилі -->
                            <line x1="270" y1="0" x2="270" y2="-12" stroke="#8c732b" stroke-width="2"/>
                            <polygon points="270,-12 290,-7 270,-2" fill="#7a2027"/>
                            <!-- Зубці стіни -->
                            <rect x="180" y="65" width="180" height="12" fill="#242935"/>
                            <rect x="185" y="55" width="10" height="12" fill="#242935"/>
                            <rect x="205" y="55" width="10" height="12" fill="#242935"/>
                            <rect x="325" y="55" width="10" height="12" fill="#242935"/>
                            <rect x="345" y="55" width="10" height="12" fill="#242935"/>
                            <!-- Ліва башта -->
                            <rect x="160" y="45" width="35" height="105" fill="#222733"/>
                            <polygon points="155,45 177,18 200,45" fill="#521c22"/>
                            <line x1="177" y1="18" x2="177" y2="8" stroke="#8c732b" stroke-width="1.5"/>
                            <polygon points="177,8 190,12 177,16" fill="#7a2027"/>
                            <!-- Права башта -->
                            <rect x="345" y="45" width="35" height="105" fill="#222733"/>
                            <polygon points="340,45 362,18 385,45" fill="#521c22"/>
                            <line x1="362" y1="18" x2="362" y2="8" stroke="#8c732b" stroke-width="1.5"/>
                            <polygon points="362,8 375,12 362,16" fill="#7a2027"/>
                            <!-- Арочні вікна замку з приглушеним теплим світлом -->
                            <path d="M 255 50 Q 270 42 285 50 L 285 70 L 255 70 Z" fill="#8c6a28" opacity="0.6"/>
                            <path d="M 255 85 Q 270 78 285 85 L 285 105 L 255 105 Z" fill="#8c6a28" opacity="0.6"/>
                            <!-- Далекі пагорби королівства -->
                            <path d="M 450 150 Q 600 95 750 150 Z" fill="#0f1912"/>
                        </g>
                    `;
                }
                rfar.innerHTML = `<svg viewBox="0 0 5200 150" width="5200" height="150">${units}</svg>`;
            }
        },

        /**
         * Середній план (#rnear - 5000px):
         * - Космос: астероїдні хребти, метеорити, кристалічні виходи
         * - Підземелля: масивні сталагмітові арки, кам'яні мости, тріщини з магмою
         * - Ліс: покручені дерева, грибні галявини, звисаючі ліани
         * - Підводне: коралові рифи (мозкові та оленячі корали), водоростеві пагорби
         * - Королівство: БУДИНОЧКИ, ТАВЕРНИ, ВІТРЯК, ДИМАРИ З ДИМОМ
         */
        setupMidScenery(bg) {
            const rnear = document.getElementById('rnear');
            if (!rnear) return;
            rnear.innerHTML = '';
            rnear.style.clipPath = 'none';
            rnear.style.background = 'transparent';

            let content = '';
            if (bg === 'space') {
                // Астероїдний пояс та скелясті плато
                let units = '';
                for (let x = 0; x < 5200; x += 400) {
                    units += `
                        <g transform="translate(${x}, 0)">
                            <polygon points="0,110 35,45 80,70 140,25 190,65 260,35 320,80 400,110" fill="#2d223c" stroke="#46385b" stroke-width="1.5"/>
                            <!-- Сяючі космічні жили руди -->
                            <path d="M 140 28 L 155 55 L 148 85" stroke="#00f5d4" stroke-width="2" fill="none"/>
                            <path d="M 260 38 L 270 60" stroke="#7209b7" stroke-width="2.5" fill="none"/>
                        </g>
                    `;
                }
                rnear.innerHTML = `<svg viewBox="0 0 5200 110" width="5200" height="110">${units}</svg>`;
            } else if (bg === 'dungeon') {
                // Сталагмітові арки та лавові розколини
                let units = '';
                for (let x = 0; x < 5200; x += 450) {
                    units += `
                        <g transform="translate(${x}, 0)">
                            <!-- Масивні сталагміти та арка -->
                            <path d="M 10 110 L 45 20 L 75 110" fill="#2c1611"/>
                            <path d="M 60 110 L 85 35 L 115 110" fill="#3a1e17"/>
                            <path d="M 120 110 Q 180 30 240 110 L 220 110 Q 180 50 140 110 Z" fill="#2c1611"/>
                            <path d="M 270 110 L 300 15 L 330 110" fill="#3a1e17"/>
                            <path d="M 320 110 L 350 45 L 380 110" fill="#25120e"/>
                            <!-- Лавова тріщина -->
                            <polygon points="150,110 170,102 195,110 210,104 230,110" fill="#ff5500"/>
                        </g>
                    `;
                }
                rnear.innerHTML = `<svg viewBox="0 0 5200 110" width="5200" height="110">${units}</svg>`;
            } else if (bg === 'forest') {
                // Покручені чарівні дерева, мох, гриби
                let units = '';
                for (let x = 0; x < 5200; x += 420) {
                    units += `
                        <g transform="translate(${x}, 0)">
                            <!-- Покручене дерево з дуплом -->
                            <path d="M 40 110 Q 60 55 30 20 Q 70 35 65 110 Z" fill="#123524"/>
                            <path d="M 60 45 Q 110 25 125 5 Q 105 35 70 55 Z" fill="#123524"/>
                            <!-- Сяючі магічні гриби середнього плану -->
                            <ellipse cx="180" cy="85" rx="20" ry="12" fill="#9d4edd"/>
                            <path d="M 175 85 L 176 110 L 184 110 L 185 85" fill="#e0aaff"/>
                            <circle cx="172" cy="83" r="2.5" fill="#ffffff"/>
                            <circle cx="185" cy="81" r="3" fill="#ffffff"/>
                            <!-- Кущі папороті -->
                            <path d="M 260 110 Q 280 70 310 60 Q 295 85 290 110" fill="#1b4332"/>
                            <path d="M 270 110 Q 250 75 230 70 Q 245 90 255 110" fill="#1b4332"/>
                        </g>
                    `;
                }
                rnear.innerHTML = `<svg viewBox="0 0 5200 110" width="5200" height="110">${units}</svg>`;
            } else if (bg === 'underwater') {
                // Коралові рифи та підводні сади
                let units = '';
                for (let x = 0; x < 5200; x += 420) {
                    units += `
                        <g transform="translate(${x}, 0)">
                            <!-- Рожевий оленячий корал -->
                            <path d="M 50 110 L 50 75 L 30 50 L 35 45 L 55 68 L 65 40 L 72 42 L 62 72 L 80 55 L 85 60 L 60 85 L 60 110 Z" fill="#ff70a6"/>
                            <!-- Фіолетовий мозковий корал -->
                            <ellipse cx="160" cy="90" rx="35" ry="22" fill="#7b2cbf"/>
                            <path d="M 135 90 Q 160 80 185 90" stroke="#9d4edd" stroke-width="2.5" fill="none"/>
                            <!-- Помаранчеві морські губки -->
                            <rect x="230" y="60" width="14" height="50" rx="7" fill="#ff9f1c"/>
                            <rect x="246" y="45" width="16" height="65" rx="8" fill="#ffbf69"/>
                            <rect x="264" y="55" width="12" height="55" rx="6" fill="#ff9f1c"/>
                            <!-- Затонула гармата / якір -->
                            <circle cx="340" cy="80" r="14" fill="none" stroke="#2b4c7e" stroke-width="4"/>
                            <line x1="340" y1="94" x2="340" y2="110" stroke="#2b4c7e" stroke-width="5"/>
                        </g>
                    `;
                }
                rnear.innerHTML = `<svg viewBox="0 0 5200 110" width="5200" height="110">${units}</svg>`;
            } else {
                // КОРОЛІВСТВО: Затишні вечірні будиночки, таверна, млин і стіна в теплих сутінках
                let units = '';
                for (let x = 0; x < 5200; x += 600) {
                    units += `
                        <g transform="translate(${x}, 0)">
                            <!-- Фахверковий житловий будиночок у спокійних тонах -->
                            <rect x="30" y="40" width="75" height="70" fill="#2d2621" stroke="#1c1714" stroke-width="2"/>
                            <!-- Черепичний темний дах -->
                            <polygon points="20,40 67,10 115,40" fill="#4a2620"/>
                            <!-- Дерев'яні балки фахверку -->
                            <line x1="30" y1="75" x2="105" y2="75" stroke="#1c1714" stroke-width="2.5"/>
                            <line x1="67" y1="40" x2="67" y2="110" stroke="#1c1714" stroke-width="2.5"/>
                            <line x1="30" y1="40" x2="67" y2="75" stroke="#1c1714" stroke-width="2"/>
                            <line x1="105" y1="40" x2="67" y2="75" stroke="#1c1714" stroke-width="2"/>
                            <!-- Димар з напівпрозорим димком -->
                            <rect x="85" y="16" width="12" height="20" fill="#3a302a"/>
                            <circle cx="91" cy="8" r="4" fill="rgba(100,100,110,0.3)"/>
                            <circle cx="95" cy="0" r="6" fill="rgba(100,100,110,0.2)"/>
                            <!-- Віконця з м'яким сутінковим світлом -->
                            <rect x="42" y="50" width="16" height="16" fill="#755520" stroke="#1c1714" stroke-width="1.5"/>
                            <rect x="76" y="50" width="16" height="16" fill="#755520" stroke="#1c1714" stroke-width="1.5"/>

                            <!-- СТАРОДАВНІЙ ВІТРЯК З КРИЛАМИ -->
                            <polygon points="175,110 185,35 215,35 225,110" fill="#322c26" stroke="#201a15" stroke-width="2"/>
                            <polygon points="180,35 200,18 220,35" fill="#442520"/>
                            <!-- Крила вітряка -->
                            <g transform="translate(200, 35)">
                                <line x1="-35" y1="-35" x2="35" y2="35" stroke="#221b16" stroke-width="3"/>
                                <line x1="-35" y1="35" x2="35" y2="-35" stroke="#221b16" stroke-width="3"/>
                                <rect x="-35" y="-35" width="20" height="8" fill="#3d3731" opacity="0.65"/>
                                <rect x="15" y="27" width="20" height="8" fill="#3d3731" opacity="0.65"/>
                                <rect x="-35" y="27" width="8" height="20" fill="#3d3731" opacity="0.65"/>
                                <rect x="27" y="-35" width="8" height="20" fill="#3d3731" opacity="0.65"/>
                                <circle cx="0" cy="0" r="4" fill="#18130f"/>
                            </g>

                            <!-- БУДІВЛЯ СЕРЕДНЬОВІЧНОЇ ТАВЕРНИ -->
                            <rect x="280" y="30" width="110" height="80" fill="#2e2520" stroke="#1a1410" stroke-width="2"/>
                            <polygon points="270,30 335,5 400,30" fill="#48221d"/>
                            <!-- Мансардне віконце -->
                            <rect x="325" y="16" width="18" height="14" fill="#6e501e" stroke="#1a1410" stroke-width="1.5"/>
                            <!-- Вивіска ТАВЕРНИ на ланцюжках -->
                            <line x1="275" y1="48" x2="260" y2="48" stroke="#1a1410" stroke-width="2"/>
                            <rect x="250" y="52" width="24" height="15" rx="2" fill="#3d2716" stroke="#150e09" stroke-width="1"/>
                            <text x="262" y="62" font-size="6" font-family="sans-serif" font-weight="bold" fill="#bfa04e" text-anchor="middle">ТАВЕРНА</text>
                            <!-- Двері таверни з кованими петлями -->
                            <path d="M 325 80 Q 335 72 345 80 L 345 110 L 325 110 Z" fill="#24170e" stroke="#120c07" stroke-width="2"/>
                            <!-- Затишні вікна з приглушеним теплим світлом -->
                            <rect x="290" y="55" width="24" height="22" rx="3" fill="#6e501e" stroke="#221710" stroke-width="2"/>
                            <rect x="355" y="55" width="24" height="22" rx="3" fill="#6e501e" stroke="#221710" stroke-width="2"/>
                            <!-- Димар таверни -->
                            <rect x="370" y="10" width="14" height="22" fill="#332720"/>
                            <circle cx="377" cy="2" r="5" fill="rgba(100,100,110,0.3)"/>
                            <circle cx="382" cy="-6" r="7" fill="rgba(100,100,110,0.2)"/>

                            <!-- Маленька сторожова башта / міський мур -->
                            <rect x="440" y="50" width="40" height="60" fill="#282c35"/>
                            <polygon points="435,50 460,25 485,50" fill="#182230"/>
                            <rect x="490" y="65" width="70" height="45" fill="#22252c"/>
                            <rect x="495" y="58" width="12" height="7" fill="#22252c"/>
                            <rect x="520" y="58" width="12" height="7" fill="#22252c"/>
                            <rect x="545" y="58" width="12" height="7" fill="#22252c"/>
                        </g>
                    `;
                }
                rnear.innerHTML = `<svg viewBox="0 0 5200 110" width="5200" height="110">${units}</svg>`;
            }
        },

        /**
         * Ближній план (#trees - 5000px):
         * - Космос: супутники, радіоантени, космічні кристали
         * - Підземелля: СТАЛАГМІТИ (гострі кам'яні піки), смолоскипи з вогнем, магічні друзи кристалів
         * - Ліс: ГІГАНТСЬКІ МАГІЧНІ ГРИБИ, квіти, папороть, рунічні камені
         * - Підводне: ВОДОРОСТІ, що коливаються, морські зірки, мушлі з перлинами, анемони
         * - Королівство: ліхтарі на стовпах, вивіски, бочки, парканчики, клумби, квітучі дерева
         */
        setupNearScenery(bg) {
            const trees = document.getElementById('trees');
            if (!trees) return;
            trees.innerHTML = '';

            let units = '';
            if (bg === 'space') {
                // Космічні датчики, супутникові антени та сяючі кристали
                for (let x = 15; x < 5200; x += 180) {
                    const mod = (x % 3);
                    if (mod === 0) {
                        // Супутниковий маяк із сонячною панеллю
                        units += `
                            <g transform="translate(${x}, 15)">
                                <line x1="20" y1="75" x2="20" y2="20" stroke="#7b8794" stroke-width="3"/>
                                <circle cx="20" cy="18" r="5" fill="#00f5d4"/>
                                <line x1="20" y1="18" x2="20" y2="5" stroke="#00f5d4" stroke-width="1.5"/>
                                <!-- Сонячна панель -->
                                <rect x="5" y="30" width="30" height="14" rx="2" fill="#0d3b66" stroke="#48cae4" stroke-width="1.5"/>
                                <line x1="15" y1="30" x2="15" y2="44" stroke="#48cae4" stroke-width="1"/>
                                <line x1="25" y1="30" x2="25" y2="44" stroke="#48cae4" stroke-width="1"/>
                            </g>
                        `;
                    } else if (mod === 1) {
                        // Друза космічних кристалів
                        units += `
                            <g transform="translate(${x}, 35)">
                                <polygon points="12,55 18,15 26,55" fill="#f72585"/>
                                <polygon points="22,55 30,5 38,55" fill="#7209b7"/>
                                <polygon points="32,55 42,22 48,55" fill="#4cc9f0"/>
                                <circle cx="30" cy="8" r="2.5" fill="#ffffff"/>
                            </g>
                        `;
                    } else {
                        // Метеоритний камінь з кратером
                        units += `
                            <g transform="translate(${x}, 45)">
                                <polygon points="5,45 15,20 38,15 50,30 45,45" fill="#382947" stroke="#604b75" stroke-width="1.5"/>
                                <circle cx="24" cy="30" r="4" fill="#20152b"/>
                                <circle cx="36" cy="34" r="3" fill="#20152b"/>
                            </g>
                        `;
                    }
                }
                trees.innerHTML = `<svg viewBox="0 0 5200 90" width="5200" height="90">${units}</svg>`;
            } else if (bg === 'dungeon') {
                // СТАЛАГМІТИ, палаючі смолоскипи та підземні кристали!
                for (let x = 10; x < 5200; x += 140) {
                    const mod = (x % 4);
                    if (mod === 0) {
                        // Високий гострий сталагміт
                        units += `
                            <g transform="translate(${x}, 5)">
                                <polygon points="8,85 22,10 38,85" fill="#3d2018" stroke="#5e3326" stroke-width="1.5"/>
                                <polygon points="22,85 34,25 46,85" fill="#2c1611"/>
                            </g>
                        `;
                    } else if (mod === 1) {
                        // Смолоскип на залізному тримачі з вогнем
                        units += `
                            <g transform="translate(${x}, 20)">
                                <rect x="18" y="30" width="6" height="40" fill="#3a2312"/>
                                <polygon points="14,30 28,30 25,22 17,22" fill="#555"/>
                                <!-- Полум'я смолоскипа -->
                                <path d="M 16 22 Q 21 5 26 22 Z" fill="#ff3300"/>
                                <path d="M 18 22 Q 21 10 24 22 Z" fill="#ffcc00"/>
                            </g>
                        `;
                    } else if (mod === 2) {
                        // Група гострих сталагмітів різного розміру
                        units += `
                            <g transform="translate(${x}, 15)">
                                <polygon points="4,75 14,35 24,75" fill="#44251d"/>
                                <polygon points="18,75 30,12 44,75" fill="#543025" stroke="#774536" stroke-width="1"/>
                                <polygon points="36,75 48,28 60,75" fill="#351c15"/>
                            </g>
                        `;
                    } else {
                        // Сяючі магічні кристали (рубіни та смарагди)
                        units += `
                            <g transform="translate(${x}, 38)">
                                <polygon points="10,52 18,18 26,52" fill="#00e676"/>
                                <polygon points="22,52 30,8 38,52" fill="#ff1744"/>
                                <polygon points="34,52 42,24 50,52" fill="#00e676"/>
                                <circle cx="30" cy="10" r="2" fill="#ffffff"/>
                            </g>
                        `;
                    }
                }
                trees.innerHTML = `<svg viewBox="0 0 5200 90" width="5200" height="90">${units}</svg>`;
            } else if (bg === 'forest') {
                // ГІГАНТСЬКІ МАГІЧНІ ГРИБИ, папороть та чарівні дерева
                for (let x = 10; x < 5200; x += 150) {
                    const mod = (x % 3);
                    if (mod === 0) {
                        // Великий магічний гриб із сяючими цятками
                        units += `
                            <g transform="translate(${x}, 15)">
                                <path d="M 28 40 L 26 75 L 36 75 L 34 40 Z" fill="#e2d4c0"/>
                                <!-- Шапинка гриба -->
                                <path d="M 8 42 Q 31 10 54 42 Q 31 46 8 42 Z" fill="#e63946"/>
                                <circle cx="22" cy="28" r="3.5" fill="#ffffff"/>
                                <circle cx="36" cy="24" r="4" fill="#ffffff"/>
                                <circle cx="44" cy="34" r="2.5" fill="#ffffff"/>
                                <circle cx="16" cy="36" r="2.5" fill="#ffffff"/>
                            </g>
                        `;
                    } else if (mod === 1) {
                        // Сяючий фіолетовий кришталевий гриб
                        units += `
                            <g transform="translate(${x}, 25)">
                                <rect x="22" y="32" width="6" height="35" rx="3" fill="#d8bbff"/>
                                <ellipse cx="25" cy="30" rx="20" ry="12" fill="#7209b7"/>
                                <circle cx="16" cy="28" r="2.5" fill="#4cc9f0"/>
                                <circle cx="25" cy="25" r="3" fill="#4cc9f0"/>
                                <circle cx="34" cy="28" r="2.5" fill="#4cc9f0"/>
                            </g>
                        `;
                    } else {
                        // Кущ магічної папороті та квітів
                        units += `
                            <g transform="translate(${x}, 30)">
                                <path d="M 20 60 Q 5 35 2 20 Q 15 35 20 60" fill="#2d6a4f"/>
                                <path d="M 22 60 Q 24 25 30 10 Q 34 30 26 60" fill="#40916c"/>
                                <path d="M 26 60 Q 40 35 48 22 Q 38 40 28 60" fill="#2d6a4f"/>
                                <!-- Квітка, що світиться -->
                                <circle cx="30" cy="10" r="4" fill="#ffd166"/>
                            </g>
                        `;
                    }
                }
                trees.innerHTML = `<svg viewBox="0 0 5200 90" width="5200" height="90">${units}</svg>`;
            } else if (bg === 'underwater') {
                // МОРСЬКІ ВОДОРОСТІ (хвилястий ламінарій), актинії, перлини
                for (let x = 10; x < 5200; x += 130) {
                    const mod = (x % 3);
                    if (mod === 0) {
                        // Довгі морські водорості, що коливаються
                        units += `
                            <g transform="translate(${x}, 10)">
                                <path d="M 15 80 Q 25 55 10 35 Q 25 15 15 0 Q 30 20 20 40 Q 35 60 22 80 Z" fill="#2a9d8f"/>
                                <path d="M 30 80 Q 40 60 28 40 Q 45 20 35 5 Q 50 25 38 45 Q 50 65 37 80 Z" fill="#52b788"/>
                            </g>
                        `;
                    } else if (mod === 1) {
                        // Велика мушля з сяючою перлиною
                        units += `
                            <g transform="translate(${x}, 35)">
                                <path d="M 10 50 Q 25 20 40 50 Z" fill="#f4a261"/>
                                <path d="M 12 50 Q 25 35 38 50 Z" fill="#e76f51"/>
                                <circle cx="25" cy="42" r="5" fill="#ffffff"/>
                                <circle cx="25" cy="42" r="8" fill="rgba(255,255,255,0.45)"/>
                            </g>
                        `;
                    } else {
                        // Морська зірка та анемони на камені
                        units += `
                            <g transform="translate(${x}, 40)">
                                <ellipse cx="25" cy="42" rx="20" ry="8" fill="#457b9d"/>
                                <!-- Червона морська зірка -->
                                <polygon points="25,28 27,35 34,35 28,39 31,46 25,41 19,46 22,39 16,35 23,35" fill="#e63946"/>
                            </g>
                        `;
                    }
                }
                trees.innerHTML = `<svg viewBox="0 0 5200 90" width="5200" height="90">${units}</svg>`;
            } else {
                // КОРОЛІВСТВО: Вечірні ліхтарі з м'яким вогником, діжки, банери, квіти
                for (let x = 10; x < 5200; x += 160) {
                    const mod = (x % 4);
                    if (mod === 0) {
                        // Кований вуличний ліхтар з затишним теплим вогником
                        units += `
                            <g transform="translate(${x}, 15)">
                                <line x1="20" y1="75" x2="20" y2="15" stroke="#1c1d29" stroke-width="3"/>
                                <rect x="14" y="10" width="12" height="15" fill="#8c6823" stroke="#1c1d29" stroke-width="2"/>
                                <polygon points="11,10 20,2 29,10" fill="#1c1d29"/>
                                <circle cx="20" cy="18" r="3" fill="#ffd573" opacity="0.8"/>
                            </g>
                        `;
                    } else if (mod === 1) {
                        // Дерев'яна темна діжка
                        units += `
                            <g transform="translate(${x}, 40)">
                                <ellipse cx="20" cy="40" rx="14" ry="12" fill="#422915" stroke="#211309" stroke-width="1.5"/>
                                <line x1="8" y1="36" x2="32" y2="36" stroke="#170c06" stroke-width="1.5"/>
                                <line x1="8" y1="44" x2="32" y2="44" stroke="#170c06" stroke-width="1.5"/>
                            </g>
                        `;
                    } else if (mod === 2) {
                        // Королівський штандарт / прапор на темному стовпі
                        units += `
                            <g transform="translate(${x}, 10)">
                                <line x1="15" y1="80" x2="15" y2="5" stroke="#33241d" stroke-width="3"/>
                                <circle cx="15" cy="5" r="3" fill="#8f7228"/>
                                <polygon points="16,8 55,18 16,28" fill="#6e1c22"/>
                                <circle cx="28" cy="18" r="4" fill="#8f7228"/>
                            </g>
                        `;
                    } else {
                        // Клумба в спокійних вечірніх тонах
                        units += `
                            <g transform="translate(${x}, 45)">
                                <ellipse cx="25" cy="38" rx="22" ry="7" fill="#293d29"/>
                                <circle cx="15" cy="34" r="4" fill="#6e1c22"/>
                                <circle cx="25" cy="32" r="4" fill="#8f6c24"/>
                                <circle cx="35" cy="34" r="4" fill="#6e1c22"/>
                            </g>
                        `;
                    }
                }
                trees.innerHTML = `<svg viewBox="0 0 5200 90" width="5200" height="90">${units}</svg>`;
            }
        },

        /**
         * Лінія землі (.ground):
         */
        setupGround(bg) {
            const ground = document.querySelector('.ground');
            if (!ground) return;
            ground.className = 'ground ground-' + bg;
        }
    };

    window.Scenery = Scenery;
})();

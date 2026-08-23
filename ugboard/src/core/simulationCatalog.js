/**
 * UGREAD Whiteboard - Simulation Catalog Manager
 * 
 * 💡 ЯК ДОДАВАТИ ТА РОЗШИРЮВАТИ СИМУЛЯЦІЇ / ВЕБ-РЕСУРСИ:
 * 1. Для кожного предмету нижче визначено масив симуляцій.
 * 2. Кожен об'єкт містить `url: '#'` (або `href: '#'`).
 * 3. Щоб підключити вашу онлайн-симуляцію (PhET, Desmos, GeoGebra, MolView, Scratch, власні сайти тощо),
 *    просто замініть '#' на адресу симуляції.
 * 4. У модулі вся назва/картка симуляції є єдиною зручною кнопкою — клік одразу відкриває та інтегрує її на дошку!
 */

import { openSimulation } from './simulations.js';

export const SUBJECT_SIMULATION_CATALOGS = {
  // ==========================================
  // 1. ФІЗИКА (Physics)
  // ==========================================
  physics: [
    {
      id: 'circuit',
      title: '⚡ Електричне коло & Закон Ома',
      desc: 'Складання схем, джерела живлення, амперметр, вольтметр та лампа',
      // 🔗 Вставте посилання на симуляцію (наприклад PhET Circuit Construction Kit):
      url: '#',
      href: '#',
      defaultDemoUrl: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html'
    },
    {
      id: 'optics',
      title: '🔍 Геометрична оптика & Лінзи',
      desc: 'Заломлення променів, збиральні та розсіювальні лінзи, дзеркала',
      // 🔗 Вставте посилання на симуляцію (наприклад PhET Bending Light / Geometric Optics):
      url: '#',
      href: '#',
      defaultDemoUrl: 'https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_all.html'
    },
    {
      id: 'pendulum',
      title: '⏱️ Математичний маятник & Коливання',
      desc: 'Період коливань, довжина нитки, графік енергії та вільне падіння',
      // 🔗 Вставте посилання на симуляцію (наприклад PhET Pendulum Lab):
      url: '#',
      href: '#',
      defaultDemoUrl: 'https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab_all.html'
    },
    {
      id: 'phys_forces',
      title: '🏹 Додавання сил & Вектори (Ньютон)',
      desc: 'Рівнодійна сил, похила площина, тертя та прискорення',
      // 🔗 Вставте посилання на симуляцію (наприклад PhET Forces and Motion):
      url: '#',
      href: '#',
      defaultDemoUrl: 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html'
    },
    {
      id: 'phys_magnet',
      title: '🧲 Магнітне поле & Електромагнітна індукція',
      desc: 'Силові лінії магніту, правило свердлика, котушка індуктивності',
      // 🔗 Вставте посилання на симуляцію (наприклад PhET Faraday Law):
      url: '#',
      href: '#',
      defaultDemoUrl: 'https://phet.colorado.edu/sims/html/faradays-law/latest/faradays-law_all.html'
    },
    {
      id: 'phys_atom',
      title: '⚛️ Будова атома & Радіоактивний розпад',
      desc: 'Планетарна модель Резерфорда-Бора, протони, нейтрони, ізотопи',
      // 🔗 Вставте посилання на симуляцію (наприклад PhET Build an Atom):
      url: '#',
      href: '#',
      defaultDemoUrl: 'https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_all.html'
    }
  ],

  // ==========================================
  // 2. ХІМІЯ (Chemistry)
  // ==========================================
  chemistry: [
    {
      id: 'chem_periodic_3d',
      title: '⚗️ 3D Періодична система Менделєєва',
      desc: 'Електронні оболонки, радіуси атомів, енергії іонізації та групи',
      // 🔗 Вставте посилання на симуляцію (наприклад Ptable / Chemix / MolView):
      url: '#',
      href: '#',
      defaultDemoUrl: 'https://ptable.com/?lang=uk'
    },
    {
      id: 'chem_molecules',
      title: '🧬 Молекулярний конструктор 3D (MolView)',
      desc: 'Просторова будова молекул органічних та неорганічних сполук',
      // 🔗 Вставте посилання на симуляцію (наприклад MolView / PhET Molecule Shapes):
      url: '#',
      href: '#',
      defaultDemoUrl: 'https://molview.org/'
    },
    {
      id: 'chem_reactions',
      title: '🧪 Реакції нейтралізації & pH-шкала',
      desc: 'Кислотно-основне титрування, зміна кольору лакмусу та водневий показник',
      // 🔗 Вставте посилання на симуляцію (наприклад PhET pH Scale):
      url: '#',
      href: '#',
      defaultDemoUrl: 'https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_all.html'
    },
    {
      id: 'chem_solubility',
      title: '📊 Розчини, концентрація & Таблиця розчинності',
      desc: 'Утворення осаду, якісні реакції на катіони/аніони, молярність',
      // 🔗 Вставте посилання на симуляцію (наприклад PhET Concentration / Salts):
      url: '#',
      href: '#',
      defaultDemoUrl: 'https://phet.colorado.edu/sims/html/concentration/latest/concentration_all.html'
    }
  ],

  // ==========================================
  // 3. МАТЕМАТИКА (Mathematics & Geometry)
  // ==========================================
  math: [
    {
      id: 'plotter',
      title: '📈 Графічний калькулятор функцій (Desmos / f(x))',
      desc: 'Побудова та дослідження графіків sin(x), cos(x), парабол, експонент',
      // 🔗 Вставте посилання на симуляцію (наприклад Desmos Calculator):
      url: '#',
      href: '#',
      defaultDemoUrl: 'https://www.desmos.com/calculator'
    },
    {
      id: 'math_geogebra',
      title: '📐 Інтерактивна геометрія GeoGebra',
      desc: 'Побудова трикутників, кіл, дотичних, кутів та теореми Піфагора',
      // 🔗 Вставте посилання на симуляцію (наприклад GeoGebra Geometry):
      url: '#',
      href: '#',
      defaultDemoUrl: 'https://www.geogebra.org/geometry'
    },
    {
      id: 'math_3d_geom',
      title: '🧊 3D Стереометрія (Многогранники GeoGebra 3D)',
      desc: 'Призми, піраміди, перерізи многогранників та обчислення об\'ємів',
      // 🔗 Вставте посилання на симуляцію (наприклад GeoGebra 3D Calculator):
      url: '#',
      href: '#',
      defaultDemoUrl: 'https://www.geogebra.org/3d'
    },
    {
      id: 'math_probability',
      title: '🎲 Теорія ймовірностей & Кидання кубиків',
      desc: 'Статистика експериментів, закон великих чисел, розподіл Гауса',
      // 🔗 Вставте посилання на симуляцію (наприклад PhET Plinko Probability):
      url: '#',
      href: '#',
      defaultDemoUrl: 'https://phet.colorado.edu/sims/html/plinko-probability/latest/plinko-probability_all.html'
    }
  ],

  // ==========================================
  // 4. ГЕОГРАФІЯ (Geography & Maps)
  // ==========================================
  geography: [
    {
      id: 'globe',
      title: '🌍 3D Інтерактивний Глобус Землі',
      desc: 'Обертання моделі земної кулі, материки, океани, координати й часові пояси',
      // 🔗 Вставте посилання на симуляцію:
      url: 'https://ugread.com/products/globe/globe.html',
      href: 'https://ugread.com/products/globe/globe.html',
      defaultDemoUrl: 'https://ugread.com/products/globe/globe.html'
    },
    {
      id: 'geo_solar_system',
      title: '☀️ 3D Сонячна система & Зміна пір року (UGREAD)',
      desc: 'Орбіти планет, обертання Землі навколо Сонця, затемнення та фази Місяця',
      // 🔗 Вставлено симуляцію за вашим запитом:
      url: 'https://ugread.com/products/seasons/index.html',
      href: 'https://ugread.com/products/seasons/index.html',
      defaultDemoUrl: 'https://ugread.com/products/seasons/index.html'
    },
    {
      id: 'geo_volcano',
      title: '🌋 Будова вулкана & Тектоніка плит',
      desc: 'Сейсмічні пояси, магматичні осередки, рух літосферних плит',
      // 🔗 Вставте посилання на симуляцію (наприклад PhET Plate Tectonics):
      url: '#',
      href: '#',
      defaultDemoUrl: 'https://phet.colorado.edu/sims/html/plate-tectonics/latest/plate-tectonics_all.html'
    }
  ],

  // ==========================================
  // 5. ІСТОРІЯ (History)
  // ==========================================
  history: [
    {
      id: 'hist_sofia',
      title: '🏛️ 3D Реконструкція: Софія Київська XI ст.',
      desc: 'Архітектурна модель та фрески храму часів Ярослава Мудрого',
      // 🔗 Вставте посилання на 3D тур або історичну мапу:
      url: '#',
      href: '#'
    },
    {
      id: 'hist_cossack_map',
      title: '🗺️ Інтерактивна мапа: Битви Козацької доби',
      desc: 'Хронологія та тактика боїв на історичних картосхемах',
      // 🔗 Вставте посилання на історичну інтерактивну мапу:
      url: '#',
      href: '#'
    },
    {
      id: 'hist_baturyn',
      title: '🏰 План-схема: Гетьманська столиця Батурин',
      desc: 'Фортеця, цитадель та палац Кирила Розумовського',
      // 🔗 Вставте посилання:
      url: '#',
      href: '#'
    },
    {
      id: 'hist_world_civ',
      title: '⏳ Хронологія світових цивілізацій',
      desc: 'Порівняльна стрічка часу Давнього Світу та Середньовіччя',
      // 🔗 Вставте посилання:
      url: '#',
      href: '#'
    },
    {
      id: 'hist_trypillia',
      title: '🏺 Археологічні розкопки: Трипільська культура',
      desc: 'Інтерактивне дослідження трипільського протоміста та кераміки',
      // 🔗 Вставте посилання:
      url: '#',
      href: '#'
    }
  ],

  // ==========================================
  // 6. ІНФОРМАТИКА (Informatics)
  // ==========================================
  informatics: [
    {
      id: 'info_scratch',
      title: 'Snap! Project Editor',
      desc: 'Блочне візуальне програмування, анімації та ігри для учнів',
      // 🔗 Вставте посилання на середовище Scratch:
      url: 'https://snap.berkeley.edu/snap/snap.html',
      href: 'https://snap.berkeley.edu/snap/snap.html',
      defaultDemoUrl: 'https://snap.berkeley.edu/snap/snap.html'
    },
    {
      id: 'info_code_org',
      title: '💻 Code.org Навчальні курси',
      desc: 'Інтерактивні лабіринти та основи алгоритмізації для школярів',
      // 🔗 Вставте посилання:
      url: '#',
      href: '#',
      defaultDemoUrl: 'https://code.org'
    },
    {
      id: 'info_html_editor',
      title: '🌐 W3Schools HTML & CSS Online Editor',
      desc: 'Миттєве написання та тестування веб-сторінок у браузері',
      // 🔗 Вставте посилання:
      url: '#',
      href: '#',
      defaultDemoUrl: 'https://www.w3schools.com/html/tryit.asp?filename=tryhtml_default'
    },
    {
      id: 'info_logic_gates',
      title: '🔢 Логічні вентилі (AND, OR, NOT, XOR)',
      desc: 'Складання цифрових схем, двійкових суматорів та лічильників',
      // 🔗 Вставте посилання:
      url: '#',
      href: '#'
    }
  ],

  // ==========================================
  // 7. УКРАЇНСЬКА МОВА (Ukrainian Language)
  // ==========================================
  ukrainian: [
    {
      id: 'ukr_syntax',
      title: '📖 Синтаксичний розбір речень (Інтерактив)',
      desc: 'Інтерактивне визначення головних та другорядних членів',
      // 🔗 Вставте посилання на інтерактивний веб-тренажер або вправу:
      url: '#',
      href: '#'
    },
    {
      id: 'ukr_ortho',
      title: '🔤 Орфографічний тренажер (Правопис онлайн)',
      desc: 'Вправи на ненаголошені e/и, апостроф, подвоєння та м\'який знак (LearningApps)',
      // 🔗 Вставте посилання (наприклад LearningApps / Wordwall):
      url: '#',
      href: '#',
      defaultDemoUrl: 'https://learningapps.org'
    }
  ],

  // ==========================================
  // 8. ПОЧАТКОВА ШКОЛА (Primary School)
  // ==========================================
  primary: [
    {
      id: 'prim_abacus',
      title: '🔢 Інтерактивна рахівниця & Абакус',
      desc: 'Складання та віднімання в межах 10, 20, 100 для молодших класів',
      // 🔗 Вставте посилання на тренажер початкової школи:
      url: '#',
      href: '#'
    },
    {
      id: 'prim_tangram',
      title: '🧩 Геометричний Танграм онлайн',
      desc: 'Складання фігур тварин та предметів з 7 геометричних частин',
      // 🔗 Вставте посилання на інтерактивний танграм:
      url: '#',
      href: '#'
    },
    {
      id: 'prim_learning_games',
      title: '🎮 Навчальні ігрові вправи (LearningApps)',
      desc: 'Інтерактивні вікторини, класифікація предметів, пазли',
      // 🔗 Вставте посилання:
      url: '#',
      href: '#',
      defaultDemoUrl: 'https://learningapps.org'
    }
  ]
};

/**
 * Рендерить інтерактивну панель підключення симуляцій за посиланням
 * @param {HTMLElement} container - батьківський DOM елемент
 * @param {string} subjectKey - ключ предмету (physics, chemistry, math, geography, history, informatics, ukrainian, primary)
 */
export function renderSimulationCatalog(container, subjectKey) {
  const items = SUBJECT_SIMULATION_CATALOGS[subjectKey] || [];

  const wrapper = document.createElement('div');
  wrapper.className = 'sim-catalog-root-wrapper';

  wrapper.innerHTML = `
    <!-- Картка швидкого підключення за довільним URL -->
    <div class="module-card" style="border: 2px solid #3b82f6; background: #f0f7ff; margin-bottom: 12px;">
      <div class="module-card-title" style="color: #1d4ed8;">
        <span>🌐 Підключити симуляцію / сайт (URL)</span>
      </div>
      <p style="font-size:12px; color:#475569; margin-bottom: 8px;">
        Введіть посилання на онлайн-симуляцію (PhET, Desmos, GeoGebra, MolView, Scratch або веб-ресурс):
      </p>
      
      <form class="sim-url-direct-form" style="display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; gap:6px;">
          <input 
            type="text" 
            class="sim-direct-url-input" 
            placeholder="https://ugread.com/... або phet..." 
            value="" 
            style="flex:1; padding:8px 10px; font-size:12px; border:1px solid #93c5fd; border-radius:8px; outline:none; background:white; color:#0f172a; font-family: monospace;"
            required
          />
          <button 
            type="submit" 
            class="module-btn" 
            style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color:white; font-weight:bold; padding:8px 14px; border:none; border-radius:8px; cursor:pointer; white-space:nowrap;"
          >
            🔗 Відкрити
          </button>
        </div>
      </form>
    </div>

    <!-- Список готових симуляцій предметного каталогу -->
    <div class="module-card">
      <div class="module-card-title">
        <span>🕹️ Каталог Симуляцій (${items.length})</span>
      </div>
      <p style="font-size:11px; color:#64748b; margin-bottom:8px;">
        Натисніть на симуляцію нижче для миттєвого відкриття на дошці:
      </p>

      <div class="sim-catalog-interactive-list" style="display:flex; flex-direction:column; gap:8px;">
        ${items.map(item => {
          const hasCustomUrl = item.url && item.url !== '#';
          return `
            <a 
              href="${item.href || item.url || '#'}" 
              class="sim-launch-card-btn"
              data-sim-id="${item.id}"
              data-sim-title="${item.title}"
              data-sim-url="${item.url || '#'}"
              data-default-demo="${item.defaultDemoUrl || ''}"
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                padding: 10px 12px;
                border-radius: 8px;
                border: 1px solid ${hasCustomUrl ? '#93c5fd' : '#e2e8f0'};
                background: ${hasCustomUrl ? '#f8faff' : '#ffffff'};
                text-decoration: none;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
              "
              onmouseover="this.style.borderColor='#3b82f6'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 10px rgba(59,130,246,0.15)';"
              onmouseout="this.style.borderColor='${hasCustomUrl ? '#93c5fd' : '#e2e8f0'}'; this.style.transform='none'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.05)';"
            >
              <div style="flex:1;">
                <div style="font-size:13px; font-weight:700; color:#1e293b; line-height:1.3;">
                  ${item.title}
                </div>
                <div style="font-size:11px; color:#64748b; line-height:1.3; margin-top:2px;">
                  ${item.desc}
                </div>
              </div>
              <span style="font-size: 16px; color:#3b82f6; font-weight:bold; padding-left:4px;">➔</span>
            </a>
          `;
        }).join('')}
      </div>
    </div>
  `;

  container.appendChild(wrapper);

  // 1. Обробка прямих запитів форми URL
  const form = wrapper.querySelector('.sim-url-direct-form');
  const input = wrapper.querySelector('.sim-direct-url-input');

  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let rawUrl = input.value.trim();
      if (!rawUrl) return;

      if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
        rawUrl = 'https://' + rawUrl;
      }

      let siteTitle = 'Симуляція';
      try {
        const parsed = new URL(rawUrl);
        siteTitle = parsed.hostname;
      } catch (err) {
        siteTitle = rawUrl;
      }

      openSimulation(rawUrl, `🌐 ${siteTitle}`, true);
    });
  }

  // 2. Обробка кліків по самій назві / картці симуляції
  wrapper.querySelectorAll('.sim-launch-card-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const simId = btn.dataset.simId;
      const simTitle = btn.dataset.simTitle || 'Симуляція';
      let simUrl = btn.dataset.simUrl || '#';
      const defaultDemo = btn.dataset.defaultDemo || '';

      // Якщо посилання вже прописано у коді (http...)
      if (simUrl && simUrl !== '#' && (simUrl.startsWith('http://') || simUrl.startsWith('https://'))) {
        openSimulation(simUrl, simTitle, true);
        return;
      }

      // Якщо це вбудована офлайн-симуляція (circuit, optics, pendulum, plotter, globe)
      const isBuiltin = ['circuit', 'optics', 'pendulum', 'plotter', 'globe'].includes(simId);
      if (isBuiltin) {
        openSimulation(simId, simTitle, false);
        return;
      }

      // Якщо посилання пусте (href="#"), пропонуємо ввести або підтвердити URL
      const promptDefault = defaultDemo || (input ? input.value : '') || 'https://';
      const userEnteredUrl = window.prompt(
        `🔗 Інтеграція симуляції на дошку:\n\nВведіть або вставте URL-посилання для «${simTitle}»\n(наприклад https://ugread.com/..., PhET, GeoGebra, Desmos чи власний сайт):`,
        promptDefault
      );

      if (userEnteredUrl && userEnteredUrl.trim() && userEnteredUrl.trim() !== '#' && userEnteredUrl.trim() !== 'https://') {
        let finalUrl = userEnteredUrl.trim();
        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
          finalUrl = 'https://' + finalUrl;
        }
        openSimulation(finalUrl, simTitle, true);
      }
    });
  });
}

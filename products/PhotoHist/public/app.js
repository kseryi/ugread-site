// Історія України: ЗНО/НМТ - Основний скрипт (Vanilla JS)
// Повна офлайн-робота без компіляції та сторонніх бібліотек

(function() {
  'use strict';

  // Стан додатку
  const state = {
    figures: window.HISTORICAL_FIGURES || [],
    periods: window.HISTORICAL_PERIODS || [],
    activePeriod: 'all',
    searchQuery: '',
    onlyFavorites: false,
    favorites: JSON.parse(localStorage.getItem('ukr_history_favs') || '[]'),
    theme: localStorage.getItem('ukr_history_theme') || 'light',
    currentTab: 'part1',
    // Тренажер
    quiz: {
      currentIndex: 0,
      score: 0,
      total: 10,
      questions: [],
      answered: false
    }
  };

  // DOM-елементи
  const elements = {
    figuresGrid: document.getElementById('figuresGrid'),
    searchInput: document.getElementById('searchInput'),
    periodPills: document.getElementById('periodPills'),
    favToggleBtn: document.getElementById('favToggleBtn'),
    countBadge: document.getElementById('countBadge'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    modalOverlay: document.getElementById('modalOverlay'),
    modalContent: document.getElementById('modalContent'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    tabButtons: document.querySelectorAll('.section-btn'),
    tabPanes: document.querySelectorAll('.content-tab-pane'),
    // Вікторина
    quizContainer: document.getElementById('quizContainer')
  };

  // Ініціалізація теми
  document.documentElement.setAttribute('data-theme', state.theme);
  updateThemeIcon();

  // Генерація кнопок періодів
  function renderPeriodPills() {
    if (!elements.periodPills) return;
    elements.periodPills.innerHTML = '';

    state.periods.forEach(period => {
      const btn = document.createElement('button');
      btn.className = `period-pill ${state.activePeriod === period.id ? 'active' : ''}`;
      btn.textContent = period.name;
      btn.setAttribute('data-period', period.id);
      btn.addEventListener('click', () => {
        state.activePeriod = period.id;
        document.querySelectorAll('.period-pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        renderFigures();
      });
      elements.periodPills.appendChild(btn);
    });
  }

  // Фільтрація постатей
  function getFilteredFigures() {
    return state.figures.filter(fig => {
      // Фільтр за періодом
      if (state.activePeriod !== 'all' && fig.period !== state.activePeriod) {
        return false;
      }
      // Фільтр улюблених
      if (state.onlyFavorites && !state.favorites.includes(fig.id)) {
        return false;
      }
      // Пошуковий запит
      if (state.searchQuery.trim() !== '') {
        const q = state.searchQuery.toLowerCase();
        const inName = fig.name.toLowerCase().includes(q);
        const inYears = fig.years.toLowerCase().includes(q);
        const inRole = fig.role.toLowerCase().includes(q);
        const inClues = fig.visualClues.toLowerCase().includes(q);
        const inBio = fig.shortBio.toLowerCase().includes(q);
        const inFacts = fig.znoFacts.some(f => f.toLowerCase().includes(q));
        return inName || inYears || inRole || inClues || inBio || inFacts;
      }
      return true;
    });
  }

  // Відмалювання карток персоналій
  function renderFigures() {
    if (!elements.figuresGrid) return;
    const filtered = getFilteredFigures();

    // Оновлення лічильника
    if (elements.countBadge) {
      elements.countBadge.textContent = `Знайдено: ${filtered.length} з ${state.figures.length}`;
    }

    if (filtered.length === 0) {
      elements.figuresGrid.innerHTML = `
        <div class="empty-state">
          <h3>Нічого не знайдено</h3>
          <p>Спробуйте змінити пошуковий запит або скинути фільтри епох</p>
        </div>
      `;
      return;
    }

    elements.figuresGrid.innerHTML = filtered.map(fig => {
      const isFav = state.favorites.includes(fig.id);
      const initials = fig.name.split(' ').map(w => w[0]).join('').substring(0, 2);
      const galleryCount = (fig.gallery && fig.gallery.length) || 1;

      return `
        <div class="figure-card" data-id="${fig.id}">
          <div class="card-img-wrapper">
            <span class="card-period-badge">${fig.periodName}</span>
            <button class="card-fav-btn ${isFav ? 'active' : ''}" data-id="${fig.id}" title="${isFav ? 'Видалити з обраного' : 'Додати в обране для повторення'}">
              ★
            </button>
            ${galleryCount > 1 ? `
              <div class="card-gallery-badge" title="Усі доступні зображення та фотографії діяча до ЗНО">
                <span>📷</span> ${galleryCount} зображення ЗНО
              </div>
            ` : ''}
            <img 
              src="${fig.imageUrl}" 
              alt="${fig.name}" 
              class="card-img" 
              loading="lazy"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            />
            <div class="card-img-fallback">
              <div class="fallback-monogram">${initials}</div>
              <div class="fallback-period">${fig.periodName}</div>
            </div>
          </div>
          <div class="card-body">
            <h3 class="card-title">${fig.name}</h3>
            <div class="card-years">${fig.years}</div>
            <div class="card-role">${fig.role}</div>
            <div class="card-clue-box">
              <div class="card-clue-title">👁️ Візуальна ознака (ЗНО)</div>
              <div class="card-clue-text">${fig.visualClues}</div>
            </div>
            <div class="card-footer">
              <button class="btn-detail" data-id="${fig.id}">
                ${galleryCount > 1 ? `Детально + ${galleryCount} зображення ➔` : `Детально для ЗНО ➔`}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Прив'язка подій до кнопок карток
    elements.figuresGrid.querySelectorAll('.btn-detail').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openDetailModal(id);
      });
    });

    elements.figuresGrid.querySelectorAll('.card-fav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute('data-id');
        toggleFavorite(id);
      });
    });
  }

  // Робота з обраним
  function toggleFavorite(id) {
    if (state.favorites.includes(id)) {
      state.favorites = state.favorites.filter(item => item !== id);
    } else {
      state.favorites.push(id);
    }
    localStorage.setItem('ukr_history_favs', JSON.stringify(state.favorites));
    renderFigures();
  }

  // Відкриття модального вікна з інтерактивною галереєю зображень для ЗНО
  function openDetailModal(id) {
    const fig = state.figures.find(f => f.id === id);
    if (!fig || !elements.modalContent || !elements.modalOverlay) return;

    const initials = fig.name.split(' ').map(w => w[0]).join('').substring(0, 2);
    const gallery = (fig.gallery && fig.gallery.length > 0) ? fig.gallery : [
      {
        url: fig.imageUrl,
        label: 'Канонічний портрет ЗНО',
        type: 'Основне зображення',
        caption: 'Офіційний портрет програми УЦОЯО до ЗНО/НМТ з історії України. ' + (fig.visualClues || '')
      }
    ];

    let currentImgIdx = 0;

    elements.modalContent.innerHTML = `
      <div class="modal-header-hero">
        <div class="modal-gallery-col">
          <div class="modal-hero-img-wrap">
            <div class="modal-img-meta-badges">
              <span class="modal-img-type-badge" id="modalImgTypeBadge">
                ${gallery[0].type || 'Зображення ЗНО'}
              </span>
              ${gallery.length > 1 ? `
                <span class="modal-img-counter-badge" id="modalImgCounterBadge">
                  1 / ${gallery.length}
                </span>
              ` : ''}
            </div>

            <img 
              id="modalHeroImg"
              src="${gallery[0].url}" 
              alt="${gallery[0].label}" 
              class="modal-hero-img"
              loading="lazy"
              referrerpolicy="no-referrer"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            />
            <div class="card-img-fallback" style="height: 100%; display: none;">
              <div class="fallback-monogram">${initials}</div>
              <div class="fallback-period">${fig.periodName}</div>
            </div>

            ${gallery.length > 1 ? `
              <button class="modal-nav-arrow prev" id="modalGalleryPrev" title="Попереднє зображення (Стрілка вліво)">❮</button>
              <button class="modal-nav-arrow next" id="modalGalleryNext" title="Наступне зображення (Стрілка вправо)">❯</button>
            ` : ''}
          </div>

          ${gallery.length > 1 ? `
            <div class="modal-gallery-thumbs-box">
              <div class="modal-gallery-thumbs-label">
                <span>🖼️</span> Варіанти зображень до ЗНО (${gallery.length}):
              </div>
              <div class="modal-gallery-thumbs" id="modalThumbsStrip">
                ${gallery.map((item, idx) => `
                  <button class="modal-thumb-btn ${idx === 0 ? 'active' : ''}" data-idx="${idx}" title="${item.label} (${item.type || 'Зображення'})">
                    <img src="${item.url}" alt="${item.label}" class="modal-thumb-img" loading="lazy" referrerpolicy="no-referrer" />
                    <span class="modal-thumb-tag">${idx + 1}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div class="modal-active-caption-card" id="modalActiveCaptionCard">
            <div class="modal-active-title" id="modalActiveTitle">${gallery[0].label}</div>
            <div class="modal-active-desc" id="modalActiveDesc">${gallery[0].caption || ''}</div>
          </div>

          ${gallery.length > 1 ? `
            <div class="modal-zno-tip-box">
              <span>💡</span>
              <div>
                <strong>Порада для ЗНО:</strong> На офіційному тесті УЦОЯО можуть використати будь-яке із представлених зображень діяча (портрет, історичне фото, пам'ятник чи банкноту). Обов'язково перегляньте всі ${gallery.length} варіанти!
              </div>
            </div>
          ` : ''}
        </div>

        <div class="modal-header-info">
          <span class="modal-period-tag">${fig.periodName}</span>
          <h2>${fig.name}</h2>
          <div class="card-years" style="font-size: 15px;">${fig.years}</div>
          <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 12px;"><strong>Титул/Роль:</strong> ${fig.role}</div>
          <p style="font-size: 14px; line-height: 1.5;">${fig.shortBio}</p>
        </div>
      </div>
      <div class="modal-content-body">
        <div class="card-clue-box" style="margin-bottom: 20px;">
          <div class="card-clue-title" style="font-size: 13px;">👁️ Як розпізнати діяча на портреті або світлині у тесті ЗНО:</div>
          <div class="card-clue-text" style="font-size: 13px; line-height: 1.5;">${fig.visualClues}</div>
        </div>

        <div class="modal-section-title">📌 Ключові факти та події, які вимагаються на ЗНО/НМТ:</div>
        <ul class="modal-facts-list">
          ${fig.znoFacts.map(fact => `<li>${fact}</li>`).join('')}
        </ul>

        ${fig.quotes && fig.quotes.length > 0 ? `
          <div class="modal-section-title">📜 Цитати та уривки з історичних джерел ЗНО:</div>
          ${fig.quotes.map(q => `<div class="modal-quote-box">${q}</div>`).join('')}
        ` : ''}
      </div>
    `;

    // Інтерактивне перемикання зображень у галереї
    function updateActiveImage(idx) {
      if (idx < 0) idx = gallery.length - 1;
      if (idx >= gallery.length) idx = 0;
      currentImgIdx = idx;

      const item = gallery[idx];
      const heroImg = document.getElementById('modalHeroImg');
      const typeBadge = document.getElementById('modalImgTypeBadge');
      const counterBadge = document.getElementById('modalImgCounterBadge');
      const titleEl = document.getElementById('modalActiveTitle');
      const descEl = document.getElementById('modalActiveDesc');

      if (heroImg) {
        heroImg.style.opacity = '0.3';
        heroImg.src = item.url;
        heroImg.alt = item.label;
        setTimeout(() => { heroImg.style.opacity = '1'; }, 100);
      }
      if (typeBadge) {
        typeBadge.textContent = item.type || 'Зображення ЗНО';
      }
      if (counterBadge) {
        counterBadge.textContent = `${idx + 1} / ${gallery.length}`;
      }
      if (titleEl) {
        titleEl.textContent = item.label;
      }
      if (descEl) {
        descEl.textContent = item.caption || '';
      }

      // Оновлення активної мініатюри
      const thumbs = elements.modalContent.querySelectorAll('.modal-thumb-btn');
      thumbs.forEach((th, i) => {
        th.classList.toggle('active', i === idx);
      });
    }

    // Прив'язка подій до мініатюр та стрілок
    if (gallery.length > 1) {
      const thumbs = elements.modalContent.querySelectorAll('.modal-thumb-btn');
      thumbs.forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          updateActiveImage(idx);
        });
      });

      const prevBtn = document.getElementById('modalGalleryPrev');
      const nextBtn = document.getElementById('modalGalleryNext');

      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          updateActiveImage(currentImgIdx - 1);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          updateActiveImage(currentImgIdx + 1);
        });
      }
    }

    elements.modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  // Закриття модального вікна
  function closeModal() {
    if (!elements.modalOverlay) return;
    elements.modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Перемикання вкладок
  function switchTab(tabId) {
    state.currentTab = tabId;
    elements.tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });
    elements.tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === tabId);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (tabId === 'part4_quiz') {
      startQuiz();
    }
  }

  // Робимо доступним глобально для кнопок переходу
  window.switchTab = switchTab;

  // --- ІНТЕРАКТИВНИЙ ТРЕНАЖЕР ВІЗУАЛЬНОГО РОЗПІЗНАВАННЯ (ЗНО ТЕСТ) ---
  function startQuiz() {
    state.quiz.score = 0;
    state.quiz.currentIndex = 0;
    state.quiz.total = Math.min(10, state.figures.length);
    // Випадковий порядок
    const shuffled = [...state.figures].sort(() => 0.5 - Math.random());
    state.quiz.questions = shuffled.slice(0, state.quiz.total);
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    if (!elements.quizContainer) return;
    const qIndex = state.quiz.currentIndex;
    const currentFig = state.quiz.questions[qIndex];
    state.quiz.answered = false;

    if (!currentFig) {
      // Фінал тесту
      elements.quizContainer.innerHTML = `
        <div class="quiz-card" style="text-align: center;">
          <h2 style="font-size: 24px; margin-bottom: 12px;">🎉 Тестування завершено!</h2>
          <p style="font-size: 16px; margin-bottom: 20px;">
            Ваш результат: <strong>${state.quiz.score}</strong> з <strong>${state.quiz.total}</strong> правильних відповідей.
          </p>
          <button class="quiz-next-btn" id="restartQuizBtn">Спробувати ще раз</button>
        </div>
      `;
      document.getElementById('restartQuizBtn').addEventListener('click', startQuiz);
      return;
    }

    // 4 варіанти (1 правильний + 3 випадкових дистрактори)
    const options = [currentFig];
    const otherFigures = state.figures.filter(f => f.id !== currentFig.id).sort(() => 0.5 - Math.random());
    options.push(...otherFigures.slice(0, 3));
    options.sort(() => 0.5 - Math.random());

    // Обираємо випадковий варіант зображення з галереї діяча для тестування
    const figGallery = (currentFig.gallery && currentFig.gallery.length > 0) ? currentFig.gallery : [
      { url: currentFig.imageUrl, label: 'Канонічний портрет ЗНО', type: 'Основне зображення' }
    ];
    const chosenImg = figGallery[Math.floor(Math.random() * figGallery.length)];

    elements.quizContainer.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-header">
          <span style="font-weight: 700; color: var(--color-blue);">Питання ${qIndex + 1} з ${state.quiz.total}</span>
          <span style="font-size: 13px; color: var(--text-muted);">Рахунок: ${state.quiz.score}</span>
        </div>
        <div style="text-align: center; margin-bottom: 14px; font-weight: 600;">
          Упізнайте історичного діяча за зображенням:
        </div>
        <div class="quiz-img-wrap">
          <img 
            src="${chosenImg.url}" 
            alt="Портрет діяча" 
            class="quiz-img" 
            referrerpolicy="no-referrer" 
          />
        </div>
        <div class="quiz-img-variant-meta">
          <span class="quiz-img-type-pill">${chosenImg.type || 'Зображення ЗНО'}</span>
          <span class="quiz-img-variant-hint">${chosenImg.label}</span>
        </div>
        <div class="quiz-options">
          ${options.map(opt => `
            <button class="quiz-opt-btn" data-id="${opt.id}">${opt.name}</button>
          `).join('')}
        </div>
        <div class="quiz-feedback" id="quizFeedback"></div>
        <button class="quiz-next-btn" id="quizNextBtn" style="display: none;">Наступне запитання ➔</button>
      </div>
    `;

    const optButtons = elements.quizContainer.querySelectorAll('.quiz-opt-btn');
    const feedback = document.getElementById('quizFeedback');
    const nextBtn = document.getElementById('quizNextBtn');

    optButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (state.quiz.answered) return;
        state.quiz.answered = true;
        const selectedId = btn.getAttribute('data-id');

        optButtons.forEach(b => {
          b.disabled = true;
          if (b.getAttribute('data-id') === currentFig.id) {
            b.classList.add('correct');
          }
        });

        if (selectedId === currentFig.id) {
          btn.classList.add('correct');
          state.quiz.score++;
          feedback.className = 'quiz-feedback show';
          feedback.style.background = 'var(--color-success-bg)';
          feedback.style.color = 'var(--color-success)';
          feedback.innerHTML = `<strong>Правильно!</strong> Це дійсно ${currentFig.name}.<br><span style="font-size: 12px; margin-top: 4px; display: inline-block;">Зображення: <em>${chosenImg.label}</em> (${chosenImg.type || 'ЗНО'}). ${currentFig.visualClues}</span>`;
        } else {
          btn.classList.add('wrong');
          feedback.className = 'quiz-feedback show';
          feedback.style.background = 'var(--color-danger-bg)';
          feedback.style.color = 'var(--color-danger)';
          feedback.innerHTML = `<strong>Неправильно.</strong> Це <strong>${currentFig.name}</strong> (${currentFig.years}).<br><span style="font-size: 12px; margin-top: 4px; display: inline-block;">На знімку: <em>${chosenImg.label}</em>. Підказка: ${currentFig.visualClues}</span>`;
        }

        nextBtn.style.display = 'block';
      });
    });

    nextBtn.addEventListener('click', () => {
      state.quiz.currentIndex++;
      renderQuizQuestion();
    });
  }

  // Перемикання теми (світла / темна)
  function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('ukr_history_theme', state.theme);
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeIcon();
  }

  function updateThemeIcon() {
    if (elements.themeToggleBtn) {
      elements.themeToggleBtn.innerHTML = state.theme === 'dark' ? '☀️' : '🌙';
    }
  }

  // Слухачі подій
  if (elements.searchInput) {
    elements.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderFigures();
    });
  }

  if (elements.favToggleBtn) {
    elements.favToggleBtn.addEventListener('click', () => {
      state.onlyFavorites = !state.onlyFavorites;
      elements.favToggleBtn.classList.toggle('active', state.onlyFavorites);
      renderFigures();
    });
  }

  if (elements.themeToggleBtn) {
    elements.themeToggleBtn.addEventListener('click', toggleTheme);
  }

  if (elements.modalCloseBtn) {
    elements.modalCloseBtn.addEventListener('click', closeModal);
  }

  if (elements.modalOverlay) {
    elements.modalOverlay.addEventListener('click', (e) => {
      if (e.target === elements.modalOverlay) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (elements.modalOverlay && elements.modalOverlay.classList.contains('open')) {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'ArrowLeft') {
        const prevBtn = document.getElementById('modalGalleryPrev');
        if (prevBtn) prevBtn.click();
      } else if (e.key === 'ArrowRight') {
        const nextBtn = document.getElementById('modalGalleryNext');
        if (nextBtn) nextBtn.click();
      }
    }
  });

  elements.tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Запуск додатку
  renderPeriodPills();
  renderFigures();
})();

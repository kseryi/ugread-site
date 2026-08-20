/* ==========================================================================
   UGRead — Статичний скрипт (script.js)
   Працює автономно без сервера (просто відкрийте index.html у браузері)
   ========================================================================== */

/* ==========================================================================
   1. ДАНІ ПРЕДМЕТІВ ТА ПОСИЛАННЯ НА СИМУЛЯЦІЇ
   👉 Додавайте або змінюйте посилання на ваші симуляції в полі `link`: ""
   ========================================================================== */
const CATEGORIES_DATA = {
  math: {
    icon: '∑',
    name: 'Математика',
    desc: 'Алгебра, геометрія, функції, математичний аналіз та інтерактивні графіки.',
    topics: [
      { name: 'Додатки в розробці', link: '' },
     
    ]
  },
  physics: {
    icon: '⚛',
    name: 'Фізика',
    desc: 'Механіка, термодинаміка, оптика, електродинаміка та квантові явища.',
    topics: [
      { name: 'Оптична лава', link: '' },
      { name: 'Закон Архімеда', link: '' },
      { name: 'Сполучені посудини', link: '' },
      { name: 'Симулятор ГЕС', link: '' },
      { name: 'Математичний маятник', link: '' }
    ]
  },
  astronomy: {
    icon: '🪐',
    name: 'Астрономія',
    desc: 'Будова Всесвіту, планети Сонячної системи, зорі, галактики та космічні місії.',
    topics: [
      { name: 'Сонячна системи', link: './products/solar_system/solar_system.html' },
      { name: 'Будова Землі', link: './products/structure_of_the_earth/index.html' },
      { name: 'Зміна пір року', link: '' },
      { name: 'Фази Місяця та затемнення', link: '' }
    ]
  },
  stem: {
    icon: '🦾',
    name: 'STEM',
    desc: 'Інженерні проєкти, робототехніка, 3D-моделювання та наукові експерименти.',
    topics: [
      { name: 'Основи робототехніки та сенсори', link: '' },
      { name: '3D-моделювання та конструкції', link: '' },
      { name: 'Мікроконтролери Arduino', link: '' },
      { name: 'STEM-лабораторія винаходів', link: '' }
    ]
  },
  chemistry: {
    icon: '🧪',
    name: 'Хімія',
    desc: 'Періодичний закон, будова атомів, хімічні реакції, розчини та органічні сполуки.',
    topics: [
      { name: 'Періодична система хімічних елементів', link: './products/periodic/periodic.html' },
      
    ]
  },
  informatics: {
    icon: '💻',
    name: 'Інформатика',
    desc: 'Алгоритми, структури даних, програмування на Python, веб-розробка та бази даних.',
    topics: [
      { name: 'ЗD моделювання для дітей', link: './products/3Dcraft/index.html' },
      { name: 'Веб-технології: HTML, CSS та JS', link: '' },
      { name: 'Блочне програмування', link: '' }
    ]
  },
  geography: {
    icon: '🗺',
    name: 'Географія',
    desc: 'Фізична та економічна географія, інтерактивні карти, кліматичні пояси та геологія.',
    topics: [
      { name: 'Інтерактивний глобус', link: '' },
      
    ]
  },
  biology: {
    icon: '🌱',
    name: 'Біологія',
    desc: 'Цитологія, генетика, анатомія людини, ботаніка, зоологія та екологія.',
    topics: [
      { name: 'Додатки в розробці', link: '' },
     
    ]
  },
  history: {
    icon: '📜',
    name: 'Історія',
    desc: 'Історія України та всесвітня історія, хронологічні шкали, історичні карти та події.',
    topics: [
      { name: 'Додатки в розробці', link: '' },

    ]
  },
  language: {
    icon: '🌱',
    name: 'Пізнаємо природу',
    desc: 'Орфографія, синтаксис, стилістика та шедеври української класичної й сучасної літератури.',
    topics: [
      { name: 'Кругообіг води в природі', link: './products/watercycle/water_cycle_simulation.html' },
      
    ]
  }
};

/* ==========================================================================
   2. ІНІЦІАЛІЗАЦІЯ ПІСЛЯ ЗАВАНТАЖЕННЯ СТОРІНКИ
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {

  // --- 2.1 Мобільне меню навігації ---
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
    });

    // Закриття меню при кліку на посилання
    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('active');
      });
    });
  }

  // --- 2.2 Модальне вікно для категорій предметів ---
  const modal = document.getElementById('subjectModal');
  const modalIcon = document.getElementById('modalIcon');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalTopicsList = document.getElementById('modalTopicsList');
  const closeModalBtn1 = document.getElementById('closeModal');
  const closeModalBtn2 = document.getElementById('closeModalBtn');

  function openSubjectModal(categoryKey) {
    const data = CATEGORIES_DATA[categoryKey];
    if (!data) return;

    modalIcon.textContent = data.icon;
    modalTitle.textContent = data.name;
    modalDesc.textContent = data.desc;

    // Генерація списку тем з прямими посиланнями на симуляції
    modalTopicsList.innerHTML = '';
    data.topics.forEach((topic, index) => {
      const a = document.createElement('a');
      a.className = 'topic-link';
      a.href = topic.link || '#';
      a.innerHTML = `
        <div style="display:flex; align-items:center; min-width:0;">
          <span class="topic-num">${index + 1}</span>
          <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(topic.name)}</span>
        </div>
        <span class="topic-arrow">↗</span>
      `;
      modalTopicsList.appendChild(a);
    });

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeSubjectModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Підключення кліку до карток предметів
  document.querySelectorAll('.category-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      const catKey = btn.getAttribute('data-cat');
      openSubjectModal(catKey);
    });
  });

  if (closeModalBtn1) closeModalBtn1.addEventListener('click', closeSubjectModal);
  if (closeModalBtn2) closeModalBtn2.addEventListener('click', closeSubjectModal);

  // Закриття при кліку на фон (overlay)
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeSubjectModal();
      }
    });
  }

  // Закриття по клавіші Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeSubjectModal();
    }
  });

  // --- 2.3 Анімація частинок на Canvas у хедері ---
  initHeaderCanvas();
});

/* ==========================================================================
   3. АНІМАЦІЯ ХЕДЕРА (CANVAS NETWORK PARTICLES)
   ========================================================================== */
function initHeaderCanvas() {
  const canvas = document.getElementById('header-bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width, height, particles;

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
    particles = Array.from({ length: 65 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1.2
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Малювання та переміщення точок
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fill();
    });

    // З'єднання найближчих точок лініями
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < 105 * 105) {
          const opacity = 1 - Math.sqrt(distSq) / 105;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.35})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  resize();
  draw();

  window.addEventListener('resize', resize);

  // Реакція на рух миші
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    particles.forEach((p) => {
      const dx = mouseX - p.x;
      const dy = mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        p.vx += (dx / dist) * 0.02;
        p.vy += (dy / dist) * 0.02;
      }
    });
  });
}

// Допоміжна функція для безпечного виводу тексту
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

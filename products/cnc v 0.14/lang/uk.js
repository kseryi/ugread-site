/* =============================================================================
   UKRAINIAN (uk) INTERFACE STRINGS
   ============================================================================= */
window.APP_I18N = window.APP_I18N || {};
window.APP_I18N.uk = {
  // Top bar
  "app.title": "ВІЗУАЛІЗАТОР G-КОДУ",
  "app.subtitle": "СИМУЛЯТОР ТРАЄКТОРІЇ ІНСТРУМЕНТА ЧПК",
  "lang.select": "Мова інтерфейсу",
  "theme.toggle": "Перемкнути тему",
  "theme.light": "Світла",
  "theme.dark": "Темна",

  // Status pill
  "status.noFile": "ФАЙЛ НЕ ЗАВАНТАЖЕНО",
  "status.parsing": "ОБРОБКА ФАЙЛУ...",
  "status.readyToSimulate": "ГОТОВО ДО СИМУЛЯЦІЇ",
  "status.ready": "ГОТОВО",
  "status.running": "СИМУЛЯЦІЯ ТРИВАЄ",
  "status.paused": "ПАУЗА",
  "status.error": "ПОМИЛКА",
  "status.noMoves": "ТРАЄКТОРІЮ НЕ ЗНАЙДЕНО",
  "status.webglUnavailable": "3D НЕДОСТУПНО",

  // Panel titles
  "panel.machine": "НАЛАШТУВАННЯ ВЕРСТАТА",
  "panel.upload": "ЗАВАНТАЖИТИ ПРОГРАМУ",
  "panel.control": "КЕРУВАННЯ СИМУЛЯЦІЄЮ",
  "panel.telemetry": "ТЕЛЕМЕТРІЯ В РЕАЛЬНОМУ ЧАСІ",

  // Machine setup
  "machine.typeLabel": "ТИП ВЕРСТАТА",
  "machine.custom": "Власний розмір",
  "machine.widthLabel": "ШИРИНА X (мм)",
  "machine.heightLabel": "ГЛИБИНА Y (мм)",
  "machine.apply": "ЗАСТОСУВАТИ",
  "machine.appliedNote": "Робоче поле оновлено",

  // Upload
  "upload.dropTitle": "ПЕРЕТЯГНІТЬ ФАЙЛ .GCODE / .NC",
  "upload.dropSub": "або натисніть, щоб обрати файл",
  "file.unsupported": "Непідтримуваний тип файлу.",
  "file.reading": "Зчитування {name}...",
  "file.parsing": "Обробка {name} — {pct}%",
  "file.error": "Не вдалося прочитати файл.",
  "file.summaryLine1": "{lines} рядків · {size} КБ",
  "file.summaryLine2": "{moves} рухів розпізнано",
  "file.warnings": "⚠ Пропущено {count} рядків із некоректними даними",
  "file.noMoves": "У файлі не знайдено жодного руху G0/G1/G2/G3.",

  // Controls
  "controls.play": "ПУСК",
  "controls.pause": "ПАУЗА",
  "controls.reset": "СКИНУТИ",
  "controls.speed": "МНОЖНИК ШВИДКОСТІ",
  "controls.showRapids": "Показати холості ходи (G0)",
  "controls.showStock": "Показати заготовку",

  // Telemetry
  "tele.line": "РЯДОК",
  "tele.command": "КОМАНДА",
  "tele.x": "X (мм)",
  "tele.y": "Y (мм)",
  "tele.z": "Z (мм)",
  "tele.feed": "ПОДАЧА",
  "tele.elapsed": "МИНУЛО",
  "tele.total": "ОРІЄНТ. ЧАС",
  "tele.cutLen": "ДОВЖ. РІЗАННЯ",
  "tele.rapidLen": "ДОВЖ. ХОЛОСТИХ",
  "tele.bounds": "ГАБАРИТИ",

  // Viewport HUD
  "hud.wasteboard": "СТІЛ {w} × {h} мм",
  "hud.legendCut": "РІЗАННЯ (G1/G2/G3)",
  "hud.legendRapid": "ХОЛОСТИЙ ХІД (G0)",
  "hud.camHint": "ПЕРЕТЯГУВАННЯ — ОБЕРТАННЯ · КОЛЕСО — МАСШТАБ · ПРАВА КНОПКА — ПАНОРАМУВАННЯ",

  // Empty state
  "empty.title": "ОЧІКУВАННЯ ДАНИХ ТРАЄКТОРІЇ",
  "empty.sub": "Завантажте файл .gcode або .nc, щоб почати симуляцію",

  // WebGL unavailable fallback screen
  "webgl.title": "3D-ВІЗУАЛІЗАЦІЯ НЕДОСТУПНА",
  "webgl.message": "Цей браузер або пристрій не підтримує WebGL — технологію, необхідну для відображення 3D-траєкторії інструмента.",
  "webgl.suggestion": "Спробуйте: оновити браузер до останньої версії, увімкнути апаратне прискорення графіки в його налаштуваннях, або відкрити цю сторінку на іншому комп'ютері. Якщо це шкільний ПК — зверніться до вчителя або системного адміністратора.",
};

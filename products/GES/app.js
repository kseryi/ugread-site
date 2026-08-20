/**
 * ====================================================================
 * СИМУЛЯТОР ГІДРОЕЛЕКТРОСТАНЦІЇ (ГЕС) • HYDRO POWER DIGITAL TWIN
 * Повністю автономний чистий JavaScript (ES6+)
 * ====================================================================
 */

// -------------------------------------------------------------
// 1. ДОВІДНИК АВАРІЙНИХ СТАНІВ ТА ЛОКАЛІЗАЦІЯ (i18n & EMERGENCIES)
// -------------------------------------------------------------
const emergencyGuides = {
  uk: {
    blackout: {
      title: '🚨 БЛЕКАУТ ЕНЕРГОСИСТЕМИ',
      desc: 'Частота мережі вийшла за межі (46.5–54.0 Гц). Генератор аварійно відключено.',
      cause: 'Критичний дисбаланс між споживанням електроенергії містом (P_load) та генерацією ГЕС (P_gen).',
      risks: 'Повне знеструмлення споживачів, перевантаження обмоток статора, каскадні аварії в об\'єднаній енергосистемі.',
      steps: [
        'Натисніть зелену кнопку <strong>"🔄 Синхронізація 50 Гц"</strong> у правій панелі керування.',
        'Зменшіть повзунок <strong>"Споживання Мережі"</strong> до номінальних 140 МВт.',
        'Переконайтеся, що перемикач <strong>"AGC (Автоматичний регулятор)"</strong> увімкнено.',
        'Або натисніть <strong>"🎯 Автоналаштування та Скид"</strong> для миттєвого балансування.'
      ],
      fixLabel: '🔄 Синхронізувати 50 Гц та відновити мережу',
      action: (st) => {
        st.grid.blackout = false;
        st.generator.frequency = 50.00;
        st.penstock.targetGateOpen = 0.70;
        st.turbine.targetGuideVanes = 0.72;
        st.grid.targetDemandMW = 140.0;
        st.grid.autoGovernor = true;
        document.getElementById('sliderGate').value = 70;
        document.getElementById('sliderVanes').value = 72;
        document.getElementById('sliderDemand').value = 140;
        document.getElementById('toggleAutoGovernor').checked = true;
      }
    },
    overflow: {
      title: '⚠️ ЗАГРОЗА ПЕРЕЛИВУ ЧЕРЕЗ ГРЕБІНЬ ДАМБИ',
      desc: 'Рівень води перевищив критичні 90.0 м. Ризик затоплення машзалу та руйнування греблі.',
      cause: 'Надмірний приплив річки (паводок) перевищує сумарну пропускну здатність турбіни.',
      risks: 'Ерозія бетону, неконтрольоване затоплення прилеглих територій нижнього б\'єфу, пошкодження обладнання.',
      steps: [
        'Відкрийте повзунок <strong>"Холостий Водоскид"</strong> на 60–90% для скидання надлишкової води.',
        'Збільшіть відкриття <strong>"Головного Затвора Водоводу"</strong> до 85–95% для збільшення пропуску через турбіну.',
        'Якщо обрано погоду <em>"Паводок"</em> або <em>"Злива"</em>, перемкніть на <em>"Ясно"</em> для нормалізації припливу.'
      ],
      fixLabel: '🌊 Відкрити холостий водоскид на 70%',
      action: (st) => {
        st.spillway.targetGateOpen = 0.70;
        st.penstock.targetGateOpen = 0.85;
        document.getElementById('sliderSpillway').value = 70;
        document.getElementById('sliderGate').value = 85;
      }
    },
    cavitation: {
      title: '⚡ ВИЯВЛЕНО КАВІТАЦІЮ ТУРБІНИ',
      desc: 'Утворення парових бульбашок та гідравлічні мікроудари в проточній частині турбіни.',
      cause: 'Надмірне відкриття лопаток напрямного апарату (>88%) при недостатньому робочому напорі H_net (<40 м).',
      risks: 'Ерозійне руйнування металу робочого колеса, вібрація валу, різке падіння ККД.',
      steps: [
        'Зменшіть повзунок <strong>"Напрямний Апарат (Лопатки)"</strong> до безпечного діапазону 60–75%.',
        'Збільшіть рівень води у водосховищі для відновлення розрахункового напору H.',
        'Перевірте тип турбіни: для низьких напорів краще підходить турбіна Каплана.'
      ],
      fixLabel: '⚙️ Зменшити лопатки до 68%',
      action: (st) => {
        st.turbine.targetGuideVanes = 0.68;
        st.turbine.cavitation = false;
        document.getElementById('sliderVanes').value = 68;
      }
    },
    trash_clog: {
      title: '🍂 ЗАСМІЧЕННЯ СМІТТЄЗАХИСНОЇ РЕШІТКИ',
      desc: 'Решітка водозабору забита сміттям (>60%). Водопостачання турбіни заблоковано.',
      cause: 'Накопичення плавучого сміття, гілок та мулу перед вхідним отвором напірного водоводу.',
      risks: 'Падіння тиску у водоводі, виникнення вакууму, небезпека гідроударів та втрата потужності.',
      steps: [
        'Натисніть кнопку <strong>"🧹 Очистити решітку"</strong> на нижній панелі Canvas під розрізом станції.'
      ],
      fixLabel: '🧹 Очистити решітку водозабору',
      action: (st) => {
        st.penstock.trashRackClog = 0.0;
      }
    },
    freq_low: {
      title: '⚠️ ПРОСІДАННЯ ЧАСТОТИ (<48.8 Гц)',
      desc: 'Частота струму впала нижче норми. Генератор перевантажений.',
      cause: 'Споживання мережі перевищує поточну генерацію станції (P_load > P_gen).',
      risks: 'Збій у роботі промислових електродвигунів та автоматики, загроза аварійного відключення.',
      steps: [
        'Збільшіть відкриття <strong>"Напрямного Апарату"</strong> або затвора водоводу для нарощування потужності.',
        'Зменшіть <strong>"Споживання Мережі"</strong> до рівня генерації станції.',
        'Увімкніть тумблер <strong>"AGC (Автоматичний регулятор)"</strong>.'
      ],
      fixLabel: '⚡ Збільшити генерацію під навантаження',
      action: (st) => {
        st.turbine.targetGuideVanes = Math.min(0.95, st.turbine.targetGuideVanes + 0.15);
        st.grid.autoGovernor = true;
        document.getElementById('sliderVanes').value = Math.round(st.turbine.targetGuideVanes * 100);
        document.getElementById('toggleAutoGovernor').checked = true;
      }
    },
    freq_high: {
      title: '⚠️ ПЕРЕВИЩЕННЯ ЧАСТОТИ (>51.2 Гц)',
      desc: 'Частота струму перевищує норму. Генератор розганяється.',
      cause: 'Генерація станції значно перевищує споживання містом (P_gen > P_load).',
      risks: 'Перенапруга в електромережі, перегрів трансформаторів, пошкодження побутової техніки.',
      steps: [
        'Прикрийте <strong>"Напрямний Апарат"</strong> на 10–20% для зменшення надходження води.',
        'Збільшіть <strong>"Споживання Мережі"</strong> або увімкніть систему AGC.'
      ],
      fixLabel: '📉 Прикрити лопатки до балансу',
      action: (st) => {
        st.turbine.targetGuideVanes = Math.max(0.2, st.turbine.targetGuideVanes - 0.15);
        st.grid.autoGovernor = true;
        document.getElementById('sliderVanes').value = Math.round(st.turbine.targetGuideVanes * 100);
        document.getElementById('toggleAutoGovernor').checked = true;
      }
    },
    drought_low: {
      title: '🏜️ КРИТИЧНЕ ОБМІЛІННЯ ВОДОСХОВИЩА',
      desc: 'Рівень води впав нижче 30.0 м. Небезпека зриву потоку та зупинки станції.',
      cause: 'Тривалий низький приплив (посуха) при збереженні високої витрати води через турбіну.',
      risks: 'Повна втрата гідростатичного напору, потрапляння повітря у водовід, осушення рибоходу.',
      steps: [
        'Прикрийте <strong>"Головний Затвор"</strong> до 30–40% та зменшіть споживання мережі для економії води.',
        'Закрийте холостий водоскид (0%).',
        'Збільшіть приплив річки (оберіть погоду <em>"Дощ"</em> або <em>"Ясно"</em>).'
      ],
      fixLabel: '💧 Увімкнути режим економії води',
      action: (st) => {
        st.penstock.targetGateOpen = 0.40;
        st.spillway.targetGateOpen = 0.0;
        st.grid.targetDemandMW = 60.0;
        document.getElementById('sliderGate').value = 40;
        document.getElementById('sliderSpillway').value = 0;
        document.getElementById('sliderDemand').value = 60;
      }
    }
  },
  en: {
    blackout: {
      title: '🚨 CRITICAL GRID BLACKOUT',
      desc: 'Grid frequency destabilized outside 46.5–54.0 Hz. Generator tripped offline.',
      cause: 'Severe power imbalance between consumer electrical load (P_load) and turbine output (P_gen).',
      risks: 'Total consumer power loss, stator thermal overload, cascading regional grid trip.',
      steps: [
        'Click the green <strong>"🔄 Sync 50 Hz Grid"</strong> button in the right control panel.',
        'Reduce <strong>"Grid Load Demand"</strong> slider to nominal 140 MW.',
        'Ensure the <strong>"AGC (Automatic Governor)"</strong> toggle is switched ON.',
        'Or click <strong>"🎯 Auto-Tune & Reset"</strong> for instant equilibrium.'
      ],
      fixLabel: '🔄 Re-sync 50 Hz & Restore Grid',
      action: (st) => {
        st.grid.blackout = false;
        st.generator.frequency = 50.00;
        st.penstock.targetGateOpen = 0.70;
        st.turbine.targetGuideVanes = 0.72;
        st.grid.targetDemandMW = 140.0;
        st.grid.autoGovernor = true;
        document.getElementById('sliderGate').value = 70;
        document.getElementById('sliderVanes').value = 72;
        document.getElementById('sliderDemand').value = 140;
        document.getElementById('toggleAutoGovernor').checked = true;
      }
    },
    overflow: {
      title: '⚠️ DAM CREST OVERTOPPING RISK',
      desc: 'Reservoir level breached critical 90.0 m. Risk of powerhouse flooding and dam erosion.',
      cause: 'Heavy upstream river flood inflow exceeding powerhouse turbine capacity.',
      risks: 'Concrete hydraulic scour, unmitigated tailrace flooding, electrical equipment destruction.',
      steps: [
        'Open <strong>"Spillway Crest Gates"</strong> slider to 60–90% to dump excess flood surge.',
        'Open <strong>"Penstock Intake Gate"</strong> to 85–95% to maximize discharge through turbine.',
        'If weather is <em>"Flood"</em> or <em>"Storm"</em>, switch to <em>"Clear"</em>.'
      ],
      fixLabel: '🌊 Open Spillway Gates to 70%',
      action: (st) => {
        st.spillway.targetGateOpen = 0.70;
        st.penstock.targetGateOpen = 0.85;
        document.getElementById('sliderSpillway').value = 70;
        document.getElementById('sliderGate').value = 85;
      }
    },
    cavitation: {
      title: '⚡ TURBINE CAVITATION DETECTED',
      desc: 'Vapor bubble formation and micro-jet hydraulic shockwaves on runner blades.',
      cause: 'Wicket gate over-opening (>88%) combined with insufficient net water head H (<40 m).',
      risks: 'Blade metal pitting erosion, shaft vibration, severe efficiency loss.',
      steps: [
        'Throttle <strong>"Wicket Gates Opening"</strong> down to 60–75%.',
        'Allow upper reservoir head to recover.',
        'Consider switching turbine type to Kaplan for low head conditions.'
      ],
      fixLabel: '⚙️ Throttle Gates to 68%',
      action: (st) => {
        st.turbine.targetGuideVanes = 0.68;
        st.turbine.cavitation = false;
        document.getElementById('sliderVanes').value = 68;
      }
    },
    trash_clog: {
      title: '🍂 TRASH RACK SEVERELY CLOGGED',
      desc: 'Intake debris rack is blocked (>60%). Water suction into penstock is choked.',
      cause: 'River debris, foliage, and silt accumulating against intake trash rack bars.',
      risks: 'Severe head loss, intake vacuum vortex, hydraulic water hammer, and power drop.',
      steps: [
        'Click the <strong>"🧹 Clean Trash Rack"</strong> button on the canvas toolbar.'
      ],
      fixLabel: '🧹 Clean Intake Trash Rack',
      action: (st) => {
        st.penstock.trashRackClog = 0.0;
      }
    },
    freq_low: {
      title: '⚠️ SEVERE UNDER-FREQUENCY (<48.8 Hz)',
      desc: 'Grid frequency is dipping below statutory limits. Generator is overloaded.',
      cause: 'Consumer grid demand exceeds current turbine power generation (P_load > P_gen).',
      risks: 'Motor stalling, automatic load-shedding relays tripping, industrial shutdowns.',
      steps: [
        'Open <strong>"Wicket Gates"</strong> slider to admit more water and raise power output.',
        'Reduce <strong>"Grid Load Demand"</strong> slider to match available generation.',
        'Enable <strong>"AGC (Automatic Governor)"</strong>.'
      ],
      fixLabel: '⚡ Ramp Up Turbine Generation',
      action: (st) => {
        st.turbine.targetGuideVanes = Math.min(0.95, st.turbine.targetGuideVanes + 0.15);
        st.grid.autoGovernor = true;
        document.getElementById('sliderVanes').value = Math.round(st.turbine.targetGuideVanes * 100);
        document.getElementById('toggleAutoGovernor').checked = true;
      }
    },
    freq_high: {
      title: '⚠️ SEVERE OVER-FREQUENCY (>51.2 Hz)',
      desc: 'Grid frequency is too high. Generator rotor is overspeeding.',
      cause: 'Turbine generation exceeds consumer demand (P_gen > P_load).',
      risks: 'Over-voltage, transformer core saturation, equipment insulation stress.',
      steps: [
        'Throttle <strong>"Wicket Gates"</strong> down by 10–20%.',
        'Increase <strong>"Grid Load Demand"</strong> or enable AGC.'
      ],
      fixLabel: '📉 Throttle Wicket Gates to Balance',
      action: (st) => {
        st.turbine.targetGuideVanes = Math.max(0.2, st.turbine.targetGuideVanes - 0.15);
        st.grid.autoGovernor = true;
        document.getElementById('sliderVanes').value = Math.round(st.turbine.targetGuideVanes * 100);
        document.getElementById('toggleAutoGovernor').checked = true;
      }
    },
    drought_low: {
      title: '🏜️ CRITICAL RESERVOIR DEPLETION',
      desc: 'Water level plunged below 30.0 m. Risk of intake loss and air ingestion.',
      cause: 'Extended drought inflow while running full turbine discharge.',
      risks: 'Loss of generation head, vortex air entrainment, fish bypass dewatering.',
      steps: [
        'Throttle <strong>"Penstock Intake Gate"</strong> down to 30–40% and lower load demand.',
        'Ensure Spillway is at 0%.',
        'Select <em>"Rain"</em> or <em>"Clear"</em> weather to restore river inflow.'
      ],
      fixLabel: '💧 Activate Water Conservation Mode',
      action: (st) => {
        st.penstock.targetGateOpen = 0.40;
        st.spillway.targetGateOpen = 0.0;
        st.grid.targetDemandMW = 60.0;
        document.getElementById('sliderGate').value = 40;
        document.getElementById('sliderSpillway').value = 0;
        document.getElementById('sliderDemand').value = 60;
      }
    }
  }
};

const i18n = {
  uk: {
    appTitle: 'ГЕС-СИМУЛЯТОР • <span>АСУ ТП</span>',
    appBadge: 'HYDRO POWER DIGITAL TWIN • 50 Гц',
    statusGrid: 'МЕРЕЖА:',
    statusNormal: 'НОРМА',
    statusBlackout: 'БЛЕКАУТ',
    statusWarning: 'УВАГА',
    statusGen: 'ГЕНЕРАЦІЯ:',
    statusFreq: 'ЧАСТОТА:',
    statusHead: 'НАПІР H:',
    statusLevel: 'РІВЕНЬ:',
    statusClock: 'ЧАС:',
    soundOn: '🔊 Звук: Увімк',
    soundOff: '🔇 Звук: Вимк',
    btnHelp: '📖 Довідка & Гайд',
    canvasTitle: '2D Фізичний Розріз Гідроелектростанції',
    speedBadge: 'Швидкість:',
    canvasHint: '💡 Наведіть курсор на будь-яку частину станції (водосховище, затвор, турбіна, генератор, ЛЕП)',
    infoToggleOn: 'ℹ️ Підказки (i): Увімк',
    infoToggleOff: 'ℹ️ Підказки (i): Вимк',
    autoTuneBtn: '🎯 Автоналаштування та Скид',
    btnWhatToDo: 'ℹ️ Що робити?',
    btnQuickFix: '⚡ Виправити',
    emrgModalTitle: '🚨 Інструкція з Ліквідації Аварії',
    lblCause: '🔍 Причина виникнення:',
    lblRisks: '⚠️ Небезпека для станції:',
    lblSteps: '🛠️ Покрокові дії оператора:',
    btnClose: 'Закрити',
    btnFixNow: '⚡ Виправити Ситуацію',
    
    // Telemetry
    cardLevel: 'Рівень Водосховища',
    cardPower: 'Електрична Потужність',
    cardDemand: 'Споживання Мережі',
    cardFlow: 'Витрата через Турбіну',
    cardRpm: 'Швидкість Турбіни',
    cardHead: 'Корисний Напір & ККД',
    cardEnergy: 'Вироблена Енергія',
    unitMW: 'МВт',
    unitM3s: 'м³/с',
    unitRpm: 'об/хв',
    unitM: 'м',
    unitMWh: 'МВт·год',
    trendRising: '▲ Наповнення',
    trendFalling: '▼ Спрацювання',
    trendStable: '⏸️ Баланс',
    subLevelRate: 'Швидкість:',
    nominalLevel: 'Номінал 75м',
    subPower: 'Напруга: 15.75 / 330 кВ',
    subDemand: 'Цільовий баланс: f₀ = 50.00 Гц',
    subSpillway: 'Холостий скид:',
    subNominalRpm: 'Номінал: 150 об/хв',
    subPoles: '20 пар полюсів',
    subEfficiency: 'ККД:',
    subPressure: 'Тиск:',
    subCo2: 'Збережено CO₂:',
    tons: 'т',
    
    // Charts
    chart1Title: 'Потужність генерації vs Споживання мережі',
    legendGen: 'Генерація (МВт)',
    legendLoad: 'Споживання (МВт)',
    chart2Title: 'Витрата води (м³/с) та Частота мережі (Гц)',
    legendFlow: 'Витрата Q',
    legendFreq: 'Частота f (50 Гц)',
    
    // Controls
    ctrlPanelTitle: 'Панель Керування ГЕС',
    secHydraulics: '🌊 Гідравліка та Водозабір',
    labelSliderGate: 'Головний Затвор Водоводу:',
    labelSliderInflow: 'Приплив Річки (Q_in):',
    labelSliderSpillway: 'Холостий Водоскид:',
    labelWeather: 'Погода у басейні річки:',
    weatherSunny: '☀️ Ясно',
    weatherRain: '🌧️ Дощ',
    weatherStorm: '⛈️ Злива',
    weatherFlood: '🌊 Паводок',
    weatherDrought: '🏜️ Посуха',
    secTurbine: '⚙️ Гідротурбіна',
    labelTurbineType: 'Тип робочого колеса:',
    turbineFrancis: '🌀 Френсіса',
    turbineKaplan: '🌿 Каплана',
    turbinePelton: '🎯 Пельтона',
    labelSliderVanes: 'Напрямний Апарат (Лопатки):',
    secGrid: '⚡ Енергомережа & АСУ ТП',
    labelSliderDemand: 'Споживання Мережі (Попит):',
    labelAutoGovernor: '🤖 Автоматичний регулятор потужності (AGC)',
    btnEmergencyStop: '🛑 Аварійний Стоп',
    btnResetSystem: '🔄 Синхронізація 50 Гц',
    
    // Scenarios
    scenarioPanelTitle: 'Оперативні Сценарії',
    scenTitleSandbox: '🕹️ Вільне Регулювання (Sandbox)',
    scenDescSandbox: 'Вільне ознайомлення зі станцією без обмежень, часових рамок та аварійних умов.',
    scenTitleFlood: '🌊 1. Захист від Паводку (85 м)',
    scenDescFlood: 'Рівень води сягає 85 метрів! Терміново відкрийте водоскид (65–85%), скиньте паводок на 3 м нижче 82 м та збережіть світло в місті.',
    scenTitlePeak: '⚡ 2. Вечірній Пік Міста (320 МВт)',
    scenDescPeak: 'Стрибок споживання до 320 МВт! Відкрийте затвор водоводу та лопатки турбіни (90–95%), щоб витримати 50.00 Гц.',
    scenTitleBlackout: '🚨 3. Блекаут & Відновлення Системи',
    scenDescBlackout: 'Місто знеструмлене! Відкрийте затвор, розженіть турбіну до 150 об/хв та синхронізуйте 50 Гц для пуску.',
    scenTitleDrought: '🏜️ 4. Економія Води при Посусі',
    scenDescDrought: 'Приплив впав до 35 м³/с. Закрийте водоскид (0%), оптимізуйте лопатки та навантаження для збереження водойми.',
    
    sliderInfoPurposeLbl: '🎯 Призначення:',
    sliderInfoImpactLbl: '⚙️ Вплив на ГЕС:',
    sliderInfoOptimumLbl: '💡 Оптимальний режим:',
    btnGotIt: 'Зрозуміло',
    
    sliderInfos: {
      gate: {
        title: 'ℹ️ Головний Затвор Водоводу (Penstock Intake Gate)',
        purpose: 'Регулює впуск води з водосховища у напірний сталевий водовід або повністю перекриває його для ремонту та безпеки.',
        impact: 'Обмежує максимальну пропускну здатність гідротурбіни. При повному закритті (0%) турбіна зупиняється через відсутність води.',
        optimum: 'У звичайному робочому режимі тримайте відкритим на 65–85% для забезпечення розрахункового напору без зайвих втрат.'
      },
      inflow: {
        title: 'ℹ️ Приплив Річки у Водосховище (River Inflow Q_in)',
        purpose: 'Задає природний об\'єм води, що надходить у верхній б\'єф з гірського або річкового басейну (залежить від погоди й сезону).',
        impact: 'Якщо приплив перевищує витрату турбіни та водоскиду, рівень води H зростає. При нестачі води рівень поступово падає.',
        optimum: 'Номінальний баланс становить ~200–250 м³/с. Під час паводку може перевищувати 1000 м³/с, що вимагає відкриття водоскиду.'
      },
      spillway: {
        title: 'ℹ️ Холостий Водоскид Греблі (Spillway Crest Gates)',
        purpose: 'Слугує для скидання надлишкової або паводкової води повз машинний зал через трамплін-гаситель у нижній б\'єф.',
        impact: 'Запобігає катастрофічному переливу води через верхній гребінь греблі. Вода скидається без вироблення електроенергії.',
        optimum: 'У сухому режимі тримається закритим (0%). Під час паводку відкривається пропорційно надлишку води.'
      },
      vanes: {
        title: 'ℹ️ Напрямний Апарат / Лопатки Турбіни (Wicket Gates)',
        purpose: 'Точний робочий орган гідротурбіни, який змінює кут і площу подачі струменів води на робоче колесо.',
        impact: 'Прямо регулює обертальний момент, швидкість RPM та миттєву генерацію потужності P_gen для стабілізації 50.00 Гц.',
        optimum: 'Автоматично керується системою АСУ ТП (AGC) у діапазоні 40–90% відповідно до поточного споживання електроенергії.'
      },
      demand: {
        title: 'ℹ️ Споживання Мережі / Навантаження (Grid Power Demand)',
        purpose: 'Імітує зовнішнє електричне навантаження енергосистеми (міста, промислові підприємства, заводи).',
        impact: 'Якщо споживання P_load > P_gen, генератор гальмується і частота струму падає нижче 50 Гц. Якщо P_gen > P_load, частота зростає.',
        optimum: 'Номінальне навантаження станції 100–250 МВт. Для збереження 50.00 Гц генерація має точно дорівнювати попиту.'
      }
    },
    hotspots: {
      reservoir: { name: 'Верхнє водосховище', info: 'Акумулює потенційну енергію води. Визначає гідростатичний напір H.' },
      gate: { name: 'Водозабір та Затвор', info: 'Регулює подачу води у напірний водовід та захищає від сміття.' },
      penstock: { name: 'Напірний водовід', info: 'Сталевий трубопровід високого тиску. Перетворює потенційну енергію в кінетичну.' },
      spillway: { name: 'Холостий водоскид', info: 'Скидає паводкові та надлишкові води повз турбіну для безпеки дамби.' },
      turbine: { name: 'Гідротурбіна', info: 'Робоче колесо перетворює енергію потоку води в обертальний момент валу.' },
      generator: { name: 'Синхронний генератор', info: 'Перетворює механічну енергію в 3-фазний змінний струм 15.75 кВ, 50 Гц.' },
      transformer: { name: 'Трансформатор 330 кВ', info: 'Підвищує напругу до 330 кВ для передачі струму на великі відстані з мін. втратами.' },
      grid: { name: 'Енергосистема та споживачі', info: 'Місто, заводи та житлові квартали. Потребують стабільної частоти 50.00 Гц.' }
    },
    modalTitle: '📘 Довідник Оператора ГЕС: Фізика, Будова та Повний Гайд'
  },
  en: {
    appTitle: 'HYDRO-SIM • <span>SCADA CONTROL</span>',
    appBadge: 'HYDRO POWER DIGITAL TWIN • 50 Hz',
    statusGrid: 'GRID:',
    statusNormal: 'NORMAL',
    statusBlackout: 'BLACKOUT',
    statusWarning: 'WARNING',
    statusGen: 'GENERATION:',
    statusFreq: 'FREQUENCY:',
    statusHead: 'NET HEAD H:',
    statusLevel: 'LEVEL:',
    statusClock: 'TIME:',
    soundOn: '🔊 Sound: On',
    soundOff: '🔇 Sound: Off',
    btnHelp: '📖 Guide & Theory',
    canvasTitle: '2D Physical Cross-Section of Hydro Station',
    speedBadge: 'Speed:',
    canvasHint: '💡 Hover over any station element (reservoir, penstock, turbine, generator, grid)',
    infoToggleOn: 'ℹ️ Hints (i): ON',
    infoToggleOff: 'ℹ️ Hints (i): OFF',
    autoTuneBtn: '🎯 Auto-Tune & Reset',
    btnWhatToDo: 'ℹ️ What to do?',
    btnQuickFix: '⚡ Quick Fix',
    emrgModalTitle: '🚨 Emergency Troubleshooting Guide',
    lblCause: '🔍 Cause of Failure:',
    lblRisks: '⚠️ System Risk & Impact:',
    lblSteps: '🛠️ Operator Step-by-Step Actions:',
    btnClose: 'Close',
    btnFixNow: '⚡ Fix This Issue Now',
    
    // Telemetry
    cardLevel: 'Reservoir Water Level',
    cardPower: 'Electrical Power',
    cardDemand: 'Grid Load Demand',
    cardFlow: 'Turbine Discharge',
    cardRpm: 'Turbine Speed',
    cardHead: 'Net Head & Efficiency',
    cardEnergy: 'Generated Energy',
    unitMW: 'MW',
    unitM3s: 'm³/s',
    unitRpm: 'RPM',
    unitM: 'm',
    unitMWh: 'MWh',
    trendRising: '▲ Filling',
    trendFalling: '▼ Draining',
    trendStable: '⏸️ Balanced',
    subLevelRate: 'Rate:',
    nominalLevel: 'Nominal 75m',
    subPower: 'Voltage: 15.75 / 330 kV',
    subDemand: 'Target balance: f₀ = 50.00 Hz',
    subSpillway: 'Spillway flow:',
    subNominalRpm: 'Nominal: 150 RPM',
    subPoles: '20 pole pairs',
    subEfficiency: 'Efficiency:',
    subPressure: 'Pressure:',
    subCo2: 'CO₂ Saved:',
    tons: 't',
    
    // Charts
    chart1Title: 'Active Power Output vs Grid Demand',
    legendGen: 'Generation (MW)',
    legendLoad: 'Demand (MW)',
    chart2Title: 'Water Flow (m³/s) & Grid Frequency (Hz)',
    legendFlow: 'Flow Rate Q',
    legendFreq: 'Frequency f (50 Hz)',
    
    // Controls
    ctrlPanelTitle: 'Hydro Station Control Panel',
    secHydraulics: '🌊 Hydraulics & Intake',
    labelSliderGate: 'Penstock Sluice Gate:',
    labelSliderInflow: 'River Inflow (Q_in):',
    labelSliderSpillway: 'Spillway Crest Gates:',
    labelWeather: 'River Basin Weather:',
    weatherSunny: '☀️ Clear',
    weatherRain: '🌧️ Rain',
    weatherStorm: '⛈️ Storm',
    weatherFlood: '🌊 Flood',
    weatherDrought: '🏜️ Drought',
    secTurbine: '⚙️ Hydro Turbine',
    labelTurbineType: 'Turbine Runner Type:',
    turbineFrancis: '🌀 Francis',
    turbineKaplan: '🌿 Kaplan',
    turbinePelton: '🎯 Pelton',
    labelSliderVanes: 'Wicket Gates Opening:',
    secGrid: '⚡ Power Grid & Automation',
    labelSliderDemand: 'Grid Power Demand:',
    labelAutoGovernor: '🤖 Automatic Generation Control (AGC)',
    btnEmergencyStop: '🛑 Emergency SCRAM',
    btnResetSystem: '🔄 Sync 50 Hz Grid',
    
    // Scenarios
    scenarioPanelTitle: 'Operational Scenarios',
    scenTitleSandbox: '🕹️ Free Sandbox Mode',
    scenDescSandbox: 'Free station exploration without constraints, time pressure, or emergency fails.',
    scenTitleFlood: '🌊 1. Flood Defense (85m)',
    scenDescFlood: 'Water level surges to 85 meters! Open spillway gates (65–85%), bring flood down 3m below 82m, and keep city powered.',
    scenTitlePeak: '⚡ 2. Evening Peak Demand (320 MW)',
    scenDescPeak: 'City demand spikes to 320 MW! Open penstock & wicket gates to 90–95% to maintain 50.00 Hz.',
    scenTitleBlackout: '🚨 3. Blackout & Grid Restoration',
    scenDescBlackout: 'City is blacked out! Open penstock, spin turbine to 150 RPM, and sync 50 Hz to restore power.',
    scenTitleDrought: '🏜️ 4. Drought & Water Conservation',
    scenDescDrought: 'River inflow plunges to 35 m³/s. Close spillway (0%), optimize gates, and balance demand to protect reservoir.',
    
    sliderInfoPurposeLbl: '🎯 Purpose:',
    sliderInfoImpactLbl: '⚙️ Station Impact:',
    sliderInfoOptimumLbl: '💡 Optimal Setting:',
    btnGotIt: 'Got It',
    
    sliderInfos: {
      gate: {
        title: 'ℹ️ Penstock Sluice Gate',
        purpose: 'Controls water intake from the reservoir into the high-pressure steel penstock pipeline and allows emergency isolation.',
        impact: 'Restricts total maximum discharge available to the turbine. Closing it to 0% completely stops water flow and generation.',
        optimum: 'Under normal power production, maintain open at 65–85% to maximize head with minimal intake throttle losses.'
      },
      inflow: {
        title: 'ℹ️ Upstream River Inflow (Q_in)',
        purpose: 'Sets natural river flow entering the upper reservoir from the catchment basin based on season and precipitation.',
        impact: 'When inflow exceeds turbine and spillway discharge, water level H rises. When inflow is lower, reservoir slowly drains.',
        optimum: 'Nominal baseline inflow is ~200–250 m³/s. In heavy floods it exceeds 1000 m³/s, requiring spillway crest activation.'
      },
      spillway: {
        title: 'ℹ️ Dam Spillway Crest Gates',
        purpose: 'Discharges flood water directly from the reservoir crest over a flip-bucket ski jump into the tailrace bypass channel.',
        impact: 'Protects the dam from catastrophic overtopping. Discharged water bypasses the turbine without generating electric power.',
        optimum: 'Keep at 0% during dry and normal periods. Open gradually during flood scenarios to maintain safe water levels.'
      },
      vanes: {
        title: 'ℹ️ Turbine Wicket Gates / Guide Vanes',
        purpose: 'Fine control mechanism that adjusts the volume and angle of high-velocity water jets entering the runner blades.',
        impact: 'Directly governs turbine shaft torque, rotational RPM, and active power P_gen to keep electrical frequency at 50.00 Hz.',
        optimum: 'Automatically modulated by the AGC governor between 40% and 90% to match real-time city electrical consumption.'
      },
      demand: {
        title: 'ℹ️ Power Grid Electrical Load Demand',
        purpose: 'Simulates aggregate consumer electric load from cities, regional substations, factories, and residential grids.',
        impact: 'If P_load > P_gen, generator slows down and frequency drops below 50 Hz. If P_gen > P_load, frequency increases.',
        optimum: 'Nominal base load is 100–250 MW. Generator output must precisely match load demand to maintain strict 50.00 Hz grid sync.'
      }
    },
    hotspots: {
      reservoir: { name: 'Upper Reservoir', info: 'Stores gravitational potential water energy. Establishes hydrostatic head H.' },
      gate: { name: 'Intake & Sluice Gate', info: 'Regulates water entry to penstock and features debris trash rack protection.' },
      penstock: { name: 'High-Pressure Penstock', info: 'Heavy steel conduit converting potential water head into high kinetic flow velocity.' },
      spillway: { name: 'Crest Spillway', info: 'Discharges extreme flood surges over ski-jump flip bucket to safeguard dam.' },
      turbine: { name: 'Hydro Turbine', info: 'Runner blades convert water momentum into rotational mechanical shaft torque.' },
      generator: { name: 'Synchronous Generator', info: 'Transforms shaft rotation into 3-phase AC power at 15.75 kV and exact 50.00 Hz.' },
      transformer: { name: 'Step-up Transformer 330 kV', info: 'Steps voltage up to 330 kV for long-distance low-loss high-voltage transmission.' },
      grid: { name: 'Power Grid & City', info: 'City, factories, and domestic consumers requiring uninterrupted 50.00 Hz AC power.' }
    },
    modalTitle: '📘 Hydro Station Operator Handbook: Physics & Complete Operational Guide'
  }
};

// -------------------------------------------------------------
// 2. ГЛОБАЛЬНИЙ СТАН СИМУЛЯЦІЇ
// -------------------------------------------------------------
const state = {
  lang: 'uk',
  infoBadgesVisible: true,
  running: true,
  simSpeed: 1,
  time: 0,
  soundEnabled: false,
  activeHotspot: null,
  activeScenario: 'sandbox',
  currentEmergency: null, // 'blackout', 'overflow', 'cavitation', 'trash_clog', 'freq_low', 'freq_high', 'drought_low'
  
  reservoir: {
    waterLevel: 75.0,
    minLevel: 25.0,
    maxLevel: 96.0,
    crestLevel: 90.0,
    surfaceArea: 18.5,
    inflow: 220.0,
    targetInflow: 220.0,
    weather: 'sunny',
    levelRate: 0.0, // м/хв (+ наповнення, - спрацювання)
    waterBalance: 0.0, // м³/с
    levelTrend: 'stable', // 'rising', 'falling', 'stable'
  },
  penstock: {
    gateOpen: 0.70,
    targetGateOpen: 0.70,
    diameter: 6.2,
    length: 140,
    trashRackClog: 0.0,
    flowRate: 0,
    velocity: 0,
    headLoss: 0,
    pressureMPa: 0,
  },
  spillway: {
    gateOpen: 0.0,
    targetGateOpen: 0.0,
    flowRate: 0,
  },
  fishPassage: {
    enabled: true,
    flowRate: 15.0,
  },
  turbine: {
    type: 'francis',
    guideVanes: 0.72,
    targetGuideVanes: 0.72,
    rpm: 0,
    nominalRpm: 150.0,
    angle: 0,
    efficiency: 0.92,
    mechanicalPowerMW: 0,
    cavitation: false,
  },
  generator: {
    poles: 40,
    frequency: 50.00,
    voltageKV: 15.75,
    transformerKV: 330.0,
    efficiency: 0.98,
    activePowerMW: 0,
    cosPhi: 0.92,
    connectedToGrid: true,
    statorAngle: 0,
  },
  grid: {
    demandMW: 140.0,
    targetDemandMW: 140.0,
    autoGovernor: true,
    blackout: false,
  },
  energy: {
    totalMWh: 12450.0,
    co2SavedTons: 10582.5,
  },
  tailrace: {
    waterLevel: 12.0,
    totalOutflow: 0,
  },
  mission: {
    id: 'sandbox',
    active: false,
    timer: 0,
    goalSeconds: 8.0,
    won: false,
    startedAtLevel: 75.0,
    targetLevel: 82.0
  }
};

const MAX_HISTORY = 100;
const history = {
  powerGen: [],
  powerDemand: [],
  flowRate: [],
  frequency: []
};

const particles = {
  reservoir: [],
  penstock: [],
  gridPulses: [],
  rain: [],
  spillwayFoam: [],
  lightningFlash: 0
};

function initParticles() {
  particles.reservoir = [];
  for (let i = 0; i < 70; i++) {
    particles.reservoir.push({ x: Math.random(), y: Math.random(), size: 2 + Math.random() * 3, speed: 0.05 + Math.random() * 0.15 });
  }
  particles.penstock = [];
  for (let i = 0; i < 90; i++) {
    particles.penstock.push({ progress: Math.random(), offset: (Math.random() - 0.5) * 0.8, speedMult: 0.8 + Math.random() * 0.4, size: 2 + Math.random() * 3.5 });
  }
  particles.gridPulses = [];
  for (let i = 0; i < 24; i++) {
    particles.gridPulses.push({ progress: Math.random(), phase: i % 3, speed: 0.008 + Math.random() * 0.012, sparkSize: 1.5 + Math.random() * 2.0 });
  }
  particles.rain = [];
  for (let i = 0; i < 150; i++) {
    particles.rain.push({ x: Math.random(), y: Math.random(), speed: 15 + Math.random() * 20, length: 12 + Math.random() * 18 });
  }
  particles.spillwayFoam = [];
  for (let i = 0; i < 45; i++) {
    particles.spillwayFoam.push({ progress: Math.random(), lateral: (Math.random() - 0.5) * 16, size: 2 + Math.random() * 4, speedMult: 0.8 + Math.random() * 0.5 });
  }
}

// -------------------------------------------------------------
// 3. ЗВУКОВИЙ ДВИГУН
// -------------------------------------------------------------
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.waterNoise = null;
    this.waterGain = null;
    this.turbineOsc = null;
    this.turbineGain = null;
    this.elecGain = null;
    this.initialized = false;
  }
  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      const bSize = this.ctx.sampleRate * 2;
      const nBuf = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
      const out = nBuf.getChannelData(0);
      let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
      for (let i=0; i<bSize; i++) {
        const w = Math.random()*2 - 1;
        b0=0.99886*b0+w*0.0555; b1=0.99332*b1+w*0.075; b2=0.969*b2+w*0.153; b3=0.8665*b3+w*0.31; b4=0.55*b4+w*0.53; b5=-0.7616*b5-w*0.016;
        out[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.536)*0.11; b6=w*0.1159;
      }
      this.waterNoise = this.ctx.createBufferSource();
      this.waterNoise.buffer = nBuf;
      this.waterNoise.loop = true;
      this.waterFilter = this.ctx.createBiquadFilter();
      this.waterGain = this.ctx.createGain();
      this.waterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.waterNoise.connect(this.waterFilter);
      this.waterFilter.connect(this.waterGain);
      this.waterGain.connect(this.ctx.destination);
      this.waterNoise.start(0);

      this.turbineOsc = this.ctx.createOscillator();
      this.turbineGain = this.ctx.createGain();
      this.turbineGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.turbineOsc.connect(this.turbineGain);
      this.turbineGain.connect(this.ctx.destination);
      this.turbineOsc.start(0);

      this.initialized = true;
    } catch (e) {
      console.warn('Audio init:', e);
    }
  }
  update(st) {
    if (!this.initialized || !this.ctx) return;
    if (!st.soundEnabled) {
      this.waterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      this.turbineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      return;
    }
    const totW = (st.penstock.flowRate + st.spillway.flowRate) / 500;
    this.waterGain.gain.setTargetAtTime(Math.min(0.22, totW * 0.18), this.ctx.currentTime, 0.1);
    this.turbineGain.gain.setTargetAtTime(Math.min(0.12, (st.turbine.rpm / 200) * 0.1), this.ctx.currentTime, 0.1);
    this.turbineOsc.frequency.setTargetAtTime(Math.max(20, (st.turbine.rpm / 150) * 75), this.ctx.currentTime, 0.1);
  }
  playClick() {
    if (!this.initialized || !state.soundEnabled) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.04);
    g.gain.setValueAtTime(0.06, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
    osc.connect(g); g.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.04);
  }
  playChime() {
    if (!this.initialized || !state.soundEnabled) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.frequency.setValueAtTime(f, this.ctx.currentTime + i * 0.06);
      g.gain.setValueAtTime(0.08, this.ctx.currentTime + i * 0.06);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.06 + 0.25);
      osc.connect(g); g.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + i * 0.06);
      osc.stop(this.ctx.currentTime + i * 0.06 + 0.25);
    });
  }
  playVictory() {
    if (!this.initialized || !state.soundEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime + i * 0.1);
      g.gain.setValueAtTime(0.12, this.ctx.currentTime + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.1 + 0.45);
      osc.connect(g); g.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + i * 0.1);
      osc.stop(this.ctx.currentTime + i * 0.1 + 0.45);
    });
  }
  playAlarm() {
    if (!this.initialized || !state.soundEnabled) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(900, this.ctx.currentTime + 0.2);
    g.gain.setValueAtTime(0.1, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
    osc.connect(g); g.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.25);
  }
}
const audio = new SoundEngine();

// -------------------------------------------------------------
// 4. ФІЗИКА ТА РОЗРАХУНОК СТАНЦІЇ
// -------------------------------------------------------------
function updatePhysics(dt) {
  const sdt = dt * state.simSpeed;
  state.time += sdt;

  const spd = 0.25 * sdt;
  state.penstock.gateOpen += (state.penstock.targetGateOpen - state.penstock.gateOpen) * Math.min(1.0, spd);
  state.spillway.gateOpen += (state.spillway.targetGateOpen - state.spillway.gateOpen) * Math.min(1.0, spd);
  state.turbine.guideVanes += (state.turbine.targetGuideVanes - state.turbine.guideVanes) * Math.min(1.0, spd * 1.5);
  state.reservoir.inflow += (state.reservoir.targetInflow - state.reservoir.inflow) * Math.min(1.0, 0.1 * sdt);
  state.grid.demandMW += (state.grid.targetDemandMW - state.grid.demandMW) * Math.min(1.0, 0.4 * sdt);

  const grossHead = Math.max(0, state.reservoir.waterLevel - state.tailrace.waterLevel);
  const g = 9.81;
  const area = Math.PI * Math.pow(state.penstock.diameter / 2, 2);
  const effectiveIntake = state.penstock.gateOpen * (1.0 - state.penstock.trashRackClog * 0.7);

  const maxQ = area * Math.sqrt(2 * g * grossHead) * effectiveIntake;
  const targetFlow = maxQ * state.turbine.guideVanes;
  state.penstock.flowRate += (targetFlow - state.penstock.flowRate) * Math.min(1.0, 2.0 * sdt);
  state.penstock.velocity = state.penstock.flowRate / area;

  const frictionF = 0.018;
  state.penstock.headLoss = frictionF * (state.penstock.length / state.penstock.diameter) * (Math.pow(state.penstock.velocity, 2) / (2 * g));
  const netHead = Math.max(0, grossHead - state.penstock.headLoss);

  const rho = 1000;
  state.penstock.pressureMPa = (rho * g * netHead) / 1e6;

  if (state.spillway.gateOpen > 0.01) {
    const crestHead = Math.max(0, state.reservoir.waterLevel - (state.reservoir.crestLevel - 15));
    state.spillway.flowRate = 0.42 * 35 * Math.sqrt(2 * g) * Math.pow(crestHead, 1.5) * state.spillway.gateOpen;
  } else {
    state.spillway.flowRate = 0;
  }

  if (state.reservoir.waterLevel > state.reservoir.crestLevel) {
    state.spillway.flowRate += 1.8 * 80 * Math.pow(state.reservoir.waterLevel - state.reservoir.crestLevel, 1.5);
  }

  const totalDischarge = state.penstock.flowRate + state.spillway.flowRate + (state.fishPassage.enabled ? state.fishPassage.flowRate : 0);
  state.tailrace.totalOutflow = totalDischarge;

  const waterBalance = state.reservoir.inflow - totalDischarge;
  state.reservoir.waterBalance = waterBalance;

  const deltaV = waterBalance * sdt;
  state.reservoir.waterLevel += (deltaV / (state.reservoir.surfaceArea * 1e6)) * 20;
  state.reservoir.waterLevel = Math.max(state.reservoir.minLevel, Math.min(state.reservoir.maxLevel, state.reservoir.waterLevel));

  // Розрахунок швидкості зміни рівня (м/хв) та визначення тренду
  const instantaneousRate = (waterBalance / (state.reservoir.surfaceArea * 1e6)) * 20 * 60;
  state.reservoir.levelRate += (instantaneousRate - state.reservoir.levelRate) * Math.min(1.0, 3.0 * sdt);

  if (state.reservoir.levelRate > 0.015) {
    state.reservoir.levelTrend = 'rising';
  } else if (state.reservoir.levelRate < -0.015) {
    state.reservoir.levelTrend = 'falling';
  } else {
    state.reservoir.levelTrend = 'stable';
  }

  // -------------------------------------------------------------
  // Розрахунок гідроенергетичної потужності
  // -------------------------------------------------------------
  let typeEta = state.turbine.type === 'kaplan' ? 0.94 : (state.turbine.type === 'pelton' ? 0.89 : 0.92);
  const lf = Math.max(0.1, state.turbine.guideVanes);
  // Реалістична крива ККД робочого колеса
  state.turbine.efficiency = typeEta * Math.max(0.72, Math.min(0.96, 4 * lf * (1 - lf * 0.48)));
  state.turbine.mechanicalPowerMW = (state.turbine.efficiency * rho * g * state.penstock.flowRate * netHead) / 1e6;

  // -------------------------------------------------------------
  // Автоматичний регулятор потужності та частоти (AGC / Governor)
  // -------------------------------------------------------------
  if (state.grid.autoGovernor && !state.grid.blackout) {
    // Необхідна гідравлічна потужність для покриття попиту
    const targetGenMW = state.grid.demandMW;
    const maxPossibleMW = (typeEta * 0.95 * rho * g * maxQ * netHead) / 1e6;
    
    if (maxPossibleMW > 5) {
      const idealVanes = Math.max(0.1, Math.min(1.0, (targetGenMW / state.generator.efficiency) / maxPossibleMW));
      const fDiff = 50.00 - state.generator.frequency;
      // ПІД-коригування лопаток
      const correctedTarget = Math.max(0.08, Math.min(1.0, idealVanes + fDiff * 0.12));
      state.turbine.targetGuideVanes += (correctedTarget - state.turbine.targetGuideVanes) * Math.min(1.0, 3.0 * sdt);
    }
  }

  // -------------------------------------------------------------
  // Динаміка частоти генератора та захист від блекауту
  // -------------------------------------------------------------
  if (!state.grid.blackout) {
    state.generator.activePowerMW = state.turbine.mechanicalPowerMW * state.generator.efficiency;
    
    // Різниця потужностей (МВт)
    const pImbalance = state.generator.activePowerMW - state.grid.demandMW;
    
    // Інерція ротора (H = 5.5 сек) + саморегулювання навантаження енергосистеми (D = 2.5)
    // Усуває надмірну чутливість і симулює стабільну реальну енергосистему
    const inertiaAcc = (pImbalance / 650.0);
    const selfRegulation = (50.00 - state.generator.frequency) * 0.85;
    
    state.generator.frequency += (inertiaAcc + selfRegulation) * sdt;
    
    // Захист від збурень: витримка часу релейного захисту (Relay Trip Delay)
    if (state.generator.frequency < 45.0 || state.generator.frequency > 55.0) {
      state.grid.tripTimer = (state.grid.tripTimer || 0) + sdt;
      // Блекаут настає тільки якщо частота критично відхилена понад 2.5 секунди
      if (state.grid.tripTimer > 2.5) {
        state.grid.blackout = true;
        state.grid.tripTimer = 0;
        audio.playAlarm();
      }
    } else {
      state.grid.tripTimer = Math.max(0, (state.grid.tripTimer || 0) - sdt * 2);
    }
  } else {
    state.generator.activePowerMW = 0;
    state.generator.frequency += (0 - state.generator.frequency) * 0.2 * sdt;
  }

  const targetRpm = (60 * state.generator.frequency) / 20;
  state.turbine.rpm += (targetRpm - state.turbine.rpm) * Math.min(1.0, 3.0 * sdt);
  state.turbine.angle += (state.turbine.rpm / 60) * Math.PI * 2 * sdt;
  state.generator.statorAngle += (state.generator.frequency * Math.PI * 2) * sdt;
  state.turbine.cavitation = state.turbine.guideVanes > 0.88 && netHead < 40 && state.penstock.velocity > 14;

  const deltaHours = sdt / 3600;
  const genMWh = state.generator.activePowerMW * deltaHours;
  state.energy.totalMWh += genMWh;
  state.energy.co2SavedTons += genMWh * 0.85;

  if (Math.random() < 0.25) {
    history.powerGen.push(state.generator.activePowerMW);
    history.powerDemand.push(state.grid.demandMW);
    history.flowRate.push(state.penstock.flowRate);
    history.frequency.push(state.generator.frequency);
    if (history.powerGen.length > MAX_HISTORY) {
      history.powerGen.shift(); history.powerDemand.shift(); history.flowRate.shift(); history.frequency.shift();
    }
  }

  // -------------------------------------------------------------
  // Оновлення таймера активної місії та перевірка цілей
  // -------------------------------------------------------------
  if (state.mission && state.mission.active && !state.mission.won) {
    let conditionMet = false;
    if (state.mission.id === 'flood') {
      conditionMet = state.reservoir.waterLevel <= 82.0 && !state.grid.blackout && Math.abs(state.generator.frequency - 50.0) <= 0.25 && state.generator.activePowerMW > 35;
    } else if (state.mission.id === 'peak_demand') {
      conditionMet = state.generator.activePowerMW >= 310.0 && Math.abs(state.generator.frequency - 50.0) <= 0.15 && !state.grid.blackout;
    } else if (state.mission.id === 'blackout_drill') {
      conditionMet = !state.grid.blackout && state.generator.activePowerMW >= 120.0 && Math.abs(state.generator.frequency - 50.0) <= 0.15;
    } else if (state.mission.id === 'drought') {
      conditionMet = state.spillway.gateOpen < 0.02 && state.penstock.flowRate <= 115.0 && Math.abs(state.generator.frequency - 50.0) <= 0.15 && !state.grid.blackout && state.generator.activePowerMW >= 45;
    }

    if (conditionMet) {
      state.mission.timer += sdt;
      if (state.mission.timer >= state.mission.goalSeconds) {
        if (!state.mission.won) {
          state.mission.won = true;
          audio.playVictory();
        }
      }
    } else {
      state.mission.timer = Math.max(0, state.mission.timer - sdt * 0.4);
    }
  }

  // Визначення аварійного стану
  if (state.grid.blackout) {
    state.currentEmergency = 'blackout';
  } else if (state.reservoir.waterLevel > state.reservoir.crestLevel) {
    state.currentEmergency = 'overflow';
  } else if (state.turbine.cavitation) {
    state.currentEmergency = 'cavitation';
  } else if (state.generator.frequency < 48.8) {
    state.currentEmergency = 'freq_low';
  } else if (state.generator.frequency > 51.2) {
    state.currentEmergency = 'freq_high';
  } else if (state.reservoir.waterLevel < 30.0) {
    state.currentEmergency = 'drought_low';
  } else {
    state.currentEmergency = null;
  }
}

// -------------------------------------------------------------
// 5. ВІЗУАЛІЗАЦІЯ РОЗРІЗУ ГЕС ТА ЛЕП
// -------------------------------------------------------------
const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.resetTransform();
  ctx.scale(dpr, dpr);
}
window.addEventListener('resize', resizeCanvas);

function drawStationCrossSection(w, h) {
  ctx.clearRect(0, 0, w, h);

  // Небо & Гори
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  if (state.reservoir.weather === 'sunny') {
    skyGrad.addColorStop(0, '#0a192f'); skyGrad.addColorStop(1, '#1e3a5f');
  } else if (state.reservoir.weather === 'storm') {
    skyGrad.addColorStop(0, '#020617'); skyGrad.addColorStop(1, '#1e1b4b');
  } else {
    skyGrad.addColorStop(0, '#0f172a'); skyGrad.addColorStop(1, '#334155');
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  if (state.reservoir.weather === 'sunny') {
    ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
    ctx.beginPath(); ctx.arc(w * 0.15, h * 0.15, 20, 0, Math.PI * 2); ctx.fill();
  }

  ctx.fillStyle = '#0b1329';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.45); ctx.lineTo(w * 0.2, h * 0.28); ctx.lineTo(w * 0.45, h * 0.48); ctx.lineTo(w * 0.75, h * 0.22); ctx.lineTo(w, h * 0.38); ctx.lineTo(w, h); ctx.lineTo(0, h);
  ctx.closePath(); ctx.fill();

  // Водосховище
  const damStartX = w * 0.42;
  const levelRatio = (state.reservoir.waterLevel - 20) / (96 - 20);
  const waterTopY = h * 0.75 - levelRatio * (h * 0.52);

  const waterGrad = ctx.createLinearGradient(0, waterTopY, 0, h);
  waterGrad.addColorStop(0, 'rgba(34, 211, 238, 0.85)'); waterGrad.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
  ctx.fillStyle = waterGrad;
  ctx.beginPath();
  ctx.moveTo(0, waterTopY);
  for (let x = 0; x <= damStartX; x += 10) {
    ctx.lineTo(x, waterTopY + Math.sin(x * 0.04 + state.time * 3) * 1.5);
  }
  ctx.lineTo(damStartX, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  particles.reservoir.forEach(p => {
    p.x += (p.speed * 0.0008 + (state.reservoir.inflow / 1000) * 0.001);
    if (p.x > 1) p.x = 0;
    ctx.beginPath(); ctx.arc(p.x * damStartX, waterTopY + 10 + p.y * (h - waterTopY - 20), p.size, 0, Math.PI * 2); ctx.fill();
  });

  // -------------------------------------------------------------
  // Гідрологічна водомірна рейка-рівнемір (Depth Staff Gauge)
  // -------------------------------------------------------------
  const gaugeX = 36;
  const gaugeMinY = h * 0.75 - ((25 - 20) / (96 - 20)) * (h * 0.52);
  const gaugeMaxY = h * 0.75 - ((96 - 20) / (96 - 20)) * (h * 0.52);
  const gaugeCrestY = h * 0.75 - ((90 - 20) / (96 - 20)) * (h * 0.52);
  const gaugeNomY = h * 0.75 - ((75 - 20) / (96 - 20)) * (h * 0.52);

  // Стовпчик рейки
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(gaugeX - 12, gaugeMaxY - 10, 24, gaugeMinY - gaugeMaxY + 20);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(gaugeX - 12, gaugeMaxY - 10, 24, gaugeMinY - gaugeMaxY + 20);

  // Поділки шкали (30м, 50м, 75м, 90м)
  [30, 50, 75, 90].forEach(m => {
    const yPos = h * 0.75 - ((m - 20) / (96 - 20)) * (h * 0.52);
    ctx.beginPath();
    ctx.moveTo(gaugeX - 10, yPos);
    ctx.lineTo(gaugeX + 10, yPos);
    if (m === 90) {
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2;
    } else if (m === 75) {
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
    } else {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'; ctx.lineWidth = 1;
    }
    ctx.stroke();

    ctx.fillStyle = m === 90 ? '#fca5a5' : (m === 75 ? '#38bdf8' : '#94a3b8');
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${m}m`, gaugeX - 14, yPos + 3);
  });

  // Поплавковий покажчик поточного рівня на рейці
  ctx.fillStyle = state.reservoir.levelTrend === 'rising' ? '#38bdf8' : (state.reservoir.levelTrend === 'falling' ? '#f59e0b' : '#4ade80');
  ctx.beginPath();
  ctx.moveTo(gaugeX + 12, waterTopY);
  ctx.lineTo(gaugeX + 22, waterTopY - 5);
  ctx.lineTo(gaugeX + 22, waterTopY + 5);
  ctx.closePath();
  ctx.fill();

  // -------------------------------------------------------------
  // Плаваючий динамічний HUD-індикатор рівня та тренду
  // -------------------------------------------------------------
  const hudBadgeX = damStartX * 0.48;
  const hudBadgeY = Math.max(gaugeMaxY + 15, waterTopY - 18);
  const isRising = state.reservoir.levelTrend === 'rising';
  const isFalling = state.reservoir.levelTrend === 'falling';

  let trendIcon = '⏸️';
  let trendText = state.lang === 'uk' ? 'Баланс' : 'Balanced';
  let trendColor = '#4ade80';
  let trendSign = '+';

  if (isRising) {
    trendIcon = '▲';
    trendText = state.lang === 'uk' ? 'Наповнення' : 'Filling';
    trendColor = '#38bdf8';
    trendSign = '+';
  } else if (isFalling) {
    trendIcon = '▼';
    trendText = state.lang === 'uk' ? 'Спрацювання' : 'Draining';
    trendColor = '#fbbf24';
    trendSign = '';
  }

  const rateStr = `${trendSign}${state.reservoir.levelRate.toFixed(2)} ${state.lang === 'uk' ? 'м/хв' : 'm/min'}`;
  const badgeText = `${trendIcon} ${state.reservoir.waterLevel.toFixed(1)} m  (${rateStr})`;

  ctx.font = 'bold 11px monospace';
  const textWidth = ctx.measureText(badgeText).width;

  ctx.fillStyle = 'rgba(10, 15, 29, 0.9)';
  ctx.beginPath();
  ctx.roundRect(hudBadgeX - textWidth / 2 - 8, hudBadgeY - 12, textWidth + 16, 20, 4);
  ctx.fill();
  ctx.strokeStyle = trendColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = trendColor;
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, hudBadgeX, hudBadgeY + 2);
  ctx.textAlign = 'left';

  // Дамба
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(damStartX - 25, h); ctx.lineTo(damStartX - 10, h * 0.22); ctx.lineTo(damStartX + 30, h * 0.22); ctx.lineTo(w * 0.65, h * 0.92); ctx.lineTo(w, h * 0.92); ctx.lineTo(w, h); ctx.lineTo(damStartX - 25, h);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 2; ctx.stroke();

  // Напірний водовід
  const intakeX = w * 0.40, intakeY = h * 0.58;
  const phX = w * 0.57, phY = h * 0.82;

  ctx.strokeStyle = state.penstock.trashRackClog > 0.4 ? '#ef4444' : '#94a3b8';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(intakeX - 10, intakeY - 14); ctx.lineTo(intakeX - 10, intakeY + 14); ctx.stroke();

  ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 22;
  ctx.beginPath(); ctx.moveTo(intakeX, intakeY); ctx.lineTo(phX, phY); ctx.stroke();

  ctx.strokeStyle = 'rgba(6, 182, 212, 0.85)'; ctx.lineWidth = 16 * state.penstock.gateOpen;
  ctx.beginPath(); ctx.moveTo(intakeX, intakeY); ctx.lineTo(phX, phY); ctx.stroke();

  if (state.penstock.flowRate > 1) {
    const fSpd = (state.penstock.velocity / 12) * 0.02;
    particles.penstock.forEach(p => {
      p.progress += fSpd * p.speedMult;
      if (p.progress > 1) p.progress = 0;
      const px = intakeX + p.progress * (phX - intakeX);
      const py = intakeY + p.progress * (phY - intakeY) + p.offset * 6;
      ctx.fillStyle = '#e0f2fe'; ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI * 2); ctx.fill();
    });
  }

  // Машинний зал
  const roomX = w * 0.56, roomY = h * 0.68, roomW = w * 0.18, roomH = h * 0.22;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)'; ctx.fillRect(roomX, roomY, roomW, roomH);
  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.5; ctx.strokeRect(roomX, roomY, roomW, roomH);

  // Турбіна
  const tcX = roomX + roomW * 0.35, tcY = roomY + roomH * 0.72;
  ctx.fillStyle = '#0369a1'; ctx.beginPath(); ctx.arc(tcX, tcY, 24, 0, Math.PI * 2); ctx.fill();

  ctx.save();
  ctx.translate(tcX, tcY); ctx.rotate(state.turbine.angle);
  const bCount = state.turbine.type === 'pelton' ? 12 : (state.turbine.type === 'kaplan' ? 5 : 8);
  ctx.fillStyle = state.turbine.type === 'pelton' ? '#f59e0b' : '#38bdf8';
  for (let i = 0; i < bCount; i++) {
    ctx.rotate((Math.PI * 2) / bCount);
    ctx.beginPath();
    if (state.turbine.type === 'francis') {
      ctx.moveTo(0, 0); ctx.quadraticCurveTo(10, 8, 17, 0); ctx.lineTo(14, -4);
    } else if (state.turbine.type === 'kaplan') {
      ctx.ellipse(10, 0, 9, 6, 0.2, 0, Math.PI * 2);
    } else {
      ctx.arc(15, 0, 5, 0, Math.PI);
    }
    ctx.fill();
  }
  ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Генератор
  const genY = roomY + roomH * 0.28;
  ctx.fillStyle = '#1e293b'; ctx.fillRect(tcX - 22, genY - 14, 44, 28);
  ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.strokeRect(tcX - 22, genY - 14, 44, 28);
  ctx.fillStyle = state.turbine.rpm > 10 ? `rgba(245, 158, 11, ${0.4 + Math.sin(state.generator.statorAngle * 4) * 0.3})` : 'rgba(245, 158, 11, 0.1)';
  ctx.beginPath(); ctx.arc(tcX, genY, 12, 0, Math.PI * 2); ctx.fill();

  // Вал
  ctx.fillStyle = '#cbd5e1'; ctx.fillRect(tcX - 3, genY + 14, 6, tcY - genY - 20);

  // Трансформатор
  const transX = roomX + roomW + 16, transY = roomY + roomH * 0.4;
  ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(tcX + 22, genY); ctx.lineTo(roomX + roomW, genY); ctx.lineTo(transX - 10, transY); ctx.stroke();
  ctx.fillStyle = '#1e293b'; ctx.fillRect(transX - 10, transY - 14, 28, 32);
  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2; ctx.strokeRect(transX - 10, transY - 14, 28, 32);

  // Холостий водоскид (Реалістичний каскад паводкового скиду з піною та аерацією)
  if (state.spillway.flowRate > 0.5) {
    const spX = w * 0.43, spY = h * 0.22, toeX = w * 0.62, toeY = h * 0.82;
    
    // Водний потік по лотку водоскиду
    const spillGrad = ctx.createLinearGradient(spX, spY, toeX, toeY);
    spillGrad.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
    spillGrad.addColorStop(0.7, 'rgba(125, 211, 252, 0.95)');
    spillGrad.addColorStop(1, 'rgba(240, 249, 255, 1.0)');

    ctx.beginPath();
    ctx.moveTo(spX, spY);
    ctx.quadraticCurveTo(spX + 35, toeY - 40, toeX, toeY);
    ctx.lineTo(toeX + 28, toeY + 6);
    ctx.quadraticCurveTo(spX + 52, toeY - 30, spX + 22, spY);
    ctx.closePath();
    ctx.fillStyle = spillGrad;
    ctx.fill();

    // Білопінна аерація та бризки на трампліні водоскиду
    const fInt = Math.min(1.0, state.spillway.flowRate / 600);
    particles.spillwayFoam.forEach(p => {
      p.progress += (0.02 + fInt * 0.03) * p.speedMult;
      if (p.progress > 1) p.progress = 0;

      // Крива Безьє лотка
      const t = p.progress;
      const cpX = spX + 35, cpY = toeY - 35;
      const px = (1 - t) * (1 - t) * (spX + 10) + 2 * (1 - t) * t * cpX + t * t * (toeX + 14) + p.lateral * (1 - t);
      const py = (1 - t) * (1 - t) * spY + 2 * (1 - t) * t * cpY + t * t * toeY;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(px, py, p.size * (0.8 + fInt * 0.5), 0, Math.PI * 2);
      ctx.fill();
    });

    // Трамплін-гаситель: викид пінистого струменя у нижній б'єф (Ski-jump aeration jet)
    const jetGlow = ctx.createRadialGradient(toeX + 15, toeY, 2, toeX + 15, toeY, 35);
    jetGlow.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    jetGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = jetGlow;
    ctx.fillRect(toeX - 5, toeY - 20, 60, 45);
  }

  // Нижній б'єф
  const tailStartX = w * 0.62, tailY = h * 0.84;
  ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
  ctx.beginPath();
  ctx.moveTo(tailStartX, tailY);
  for (let x = tailStartX; x <= w; x += 15) {
    ctx.lineTo(x, tailY + Math.sin(x * 0.05 + state.time * 4) * 2.5);
  }
  ctx.lineTo(w, h); ctx.lineTo(tailStartX, h); ctx.closePath(); ctx.fill();

  // Лінії ЛЕП (струм рухається строго вздовж проводів за Безьє-кривими)
  const p1X = w * 0.82, p1Y = h * 0.42, p2X = w * 0.93, p2Y = h * 0.38;
  const drawPylon = (x, y) => {
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5; ctx.beginPath();
    ctx.moveTo(x - 8, y + 60); ctx.lineTo(x, y); ctx.lineTo(x + 8, y + 60);
    ctx.moveTo(x - 16, y + 14); ctx.lineTo(x + 16, y + 14);
    ctx.moveTo(x - 20, y + 28); ctx.lineTo(x + 20, y + 28);
    ctx.stroke();
  };
  drawPylon(p1X, p1Y); drawPylon(p2X, p2Y);

  function getWirePoint(progress, phase) {
    const yOff = (phase - 1) * 5;
    const p1 = { x: transX + 18, y: transY + yOff };
    const p2 = { x: p1X - 12 + phase * 12, y: p1Y + 14 + yOff };
    const p3 = { x: p2X - 12 + phase * 12, y: p2Y + 14 + yOff };
    const p4 = { x: w, y: p2Y + 22 + yOff };

    if (progress < 0.35) {
      const t = progress / 0.35;
      const cpX = (p1.x + p2.x) / 2, cpY = (p1.y + p2.y) / 2 + 14;
      return { x: (1-t)*(1-t)*p1.x + 2*(1-t)*t*cpX + t*t*p2.x, y: (1-t)*(1-t)*p1.y + 2*(1-t)*t*cpY + t*t*p2.y };
    } else if (progress < 0.75) {
      const t = (progress - 0.35) / 0.40;
      const cpX = (p2.x + p3.x) / 2, cpY = (p2.y + p3.y) / 2 + 12;
      return { x: (1-t)*(1-t)*p2.x + 2*(1-t)*t*cpX + t*t*p3.x, y: (1-t)*(1-t)*p2.y + 2*(1-t)*t*cpY + t*t*p3.y };
    } else {
      const t = (progress - 0.75) / 0.25;
      const cpX = (p3.x + p4.x) / 2, cpY = (p3.y + p4.y) / 2 + 8;
      return { x: (1-t)*(1-t)*p3.x + 2*(1-t)*t*cpX + t*t*p4.x, y: (1-t)*(1-t)*p3.y + 2*(1-t)*t*cpY + t*t*p4.y };
    }
  }

  for (let phase = 0; phase < 3; phase++) {
    ctx.strokeStyle = state.generator.activePowerMW > 5 ? 'rgba(245, 158, 11, 0.85)' : 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1.5; ctx.beginPath();
    for (let step = 0; step <= 40; step++) {
      const pt = getWirePoint(step / 40, phase);
      if (step === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
  }

  if (state.generator.activePowerMW > 2 && !state.grid.blackout) {
    const pSpd = (state.generator.activePowerMW / 250) * 0.015;
    particles.gridPulses.forEach(p => {
      p.progress += (p.speed + pSpd);
      if (p.progress > 1) p.progress = 0;
      const pt = getWirePoint(p.progress, p.phase);
      ctx.fillStyle = '#22d3ee'; ctx.beginPath(); ctx.arc(pt.x, pt.y, p.sparkSize, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(pt.x, pt.y, p.sparkSize * 0.6, 0, Math.PI * 2); ctx.fill();
    });
  }

  // Місто та споживачі (Високодеталізована візуалізація стану електропостачання)
  const cityX = w * 0.82, cityY = h * 0.36;
  const isBlackout = state.grid.blackout;
  const isCityLit = state.generator.activePowerMW > 15 && !isBlackout;

  // Будинки та хмарочоси міста
  const buildings = [
    { x: cityX, w: 14, h: 28, floors: 3 },
    { x: cityX + 16, w: 18, h: 46, floors: 5 },
    { x: cityX + 36, w: 15, h: 32, floors: 4 },
    { x: cityX + 53, w: 22, h: 54, floors: 6 },
    { x: cityX + 77, w: 16, h: 26, floors: 3 },
    { x: cityX + 95, w: 20, h: 40, floors: 4 },
  ];

  buildings.forEach(b => {
    ctx.fillStyle = isBlackout ? '#090d16' : '#0f172a';
    ctx.fillRect(b.x, cityY - b.h, b.w, b.h);
    ctx.strokeStyle = isBlackout ? '#1e293b' : 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(b.x, cityY - b.h, b.w, b.h);

    // Антена на даху
    ctx.strokeStyle = isBlackout ? '#ef4444' : '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(b.x + b.w / 2, cityY - b.h);
    ctx.lineTo(b.x + b.w / 2, cityY - b.h - 8);
    ctx.stroke();

    // Блимаючий червоний маячок аварійного стану при блекауті
    if (isBlackout) {
      const beaconAlpha = 0.5 + Math.sin(state.time * 6 + b.x) * 0.5;
      ctx.fillStyle = `rgba(239, 68, 68, ${beaconAlpha})`;
      ctx.beginPath();
      ctx.arc(b.x + b.w / 2, cityY - b.h - 8, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Вікна будинків
    for (let f = 0; f < b.floors; f++) {
      const winY = cityY - 8 - f * 8;
      for (let wx = 3; wx < b.w - 4; wx += 6) {
        if (isCityLit) {
          const warmGlow = (f + wx) % 3 === 0 ? '#fde047' : '#38bdf8';
          ctx.fillStyle = warmGlow;
        } else {
          ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
        }
        ctx.fillRect(b.x + wx, winY, 3, 4);
      }
    }
  });

  // Ліхтарі та сяйво міста при нормальному електропостачанні
  if (isCityLit) {
    const cityGlow = ctx.createRadialGradient(cityX + 55, cityY - 15, 5, cityX + 55, cityY - 15, 80);
    cityGlow.addColorStop(0, 'rgba(253, 224, 71, 0.25)');
    cityGlow.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = cityGlow;
    ctx.fillRect(cityX - 10, cityY - 65, 140, 75);

    // Індикатор "100% Світла в місті"
    const badgeTxt = state.lang === 'uk' ? `🏙️ МІСТО: 100% СВІТЛА (${Math.round(state.grid.demandMW)} МВт)` : `🏙️ CITY: 100% POWERED (${Math.round(state.grid.demandMW)} MW)`;
    ctx.font = 'bold 9px monospace';
    const bW = ctx.measureText(badgeTxt).width;
    ctx.fillStyle = 'rgba(10, 15, 29, 0.9)';
    ctx.beginPath(); ctx.roundRect(cityX + 55 - bW / 2 - 6, cityY - 68, bW + 12, 16, 4); ctx.fill();
    ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#4ade80'; ctx.textAlign = 'center';
    ctx.fillText(badgeTxt, cityX + 55, cityY - 56);
    ctx.textAlign = 'left';
  } else {
    // Яскравий червоний попереджувальний банер над містом при блекауті
    const badgeTxt = state.lang === 'uk' ? '🚨 МІСТО ЗНЕСТРУМЛЕНО! (БЛЕКАУТ)' : '🚨 CITY BLACKOUT! (NO POWER)';
    ctx.font = 'bold 10px monospace';
    const bW = ctx.measureText(badgeTxt).width;
    const pulseAlpha = 0.75 + Math.sin(state.time * 5) * 0.25;
    ctx.fillStyle = `rgba(185, 28, 28, ${pulseAlpha})`;
    ctx.beginPath(); ctx.roundRect(cityX + 55 - bW / 2 - 8, cityY - 72, bW + 16, 18, 4); ctx.fill();
    ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
    ctx.fillText(badgeTxt, cityX + 55, cityY - 59);
    ctx.textAlign = 'left';
  }

  // -------------------------------------------------------------
  // Попереджувальні індикатори на самій греблі та водосховищі
  // -------------------------------------------------------------
  if (state.reservoir.waterLevel > 88.0) {
    // Попередження про паводок / перелив на гребені дамби
    const crestAlertTxt = state.lang === 'uk' ? '🌊 ПАВОДОК! ВІДКРИЙТЕ ВОДОСКИД' : '🌊 FLOOD! OPEN SPILLWAY';
    ctx.font = 'bold 9px monospace';
    const alW = ctx.measureText(crestAlertTxt).width;
    const alX = damStartX + 20, alY = h * 0.18;
    ctx.fillStyle = 'rgba(220, 38, 38, 0.9)';
    ctx.beginPath(); ctx.roundRect(alX - alW / 2 - 6, alY - 12, alW + 12, 16, 4); ctx.fill();
    ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
    ctx.fillText(crestAlertTxt, alX, alY);
    ctx.textAlign = 'left';
  } else if (state.reservoir.waterLevel < 35.0) {
    // Попередження про посуху на водосховищі
    const droughtAlertTxt = state.lang === 'uk' ? '🏜️ ОБМІЛІННЯ! ЕКОНОМТЕ ВОДУ' : '🏜️ DROUGHT! CONSERVE WATER';
    ctx.font = 'bold 9px monospace';
    const drW = ctx.measureText(droughtAlertTxt).width;
    const drX = damStartX * 0.35, drY = h * 0.42;
    ctx.fillStyle = 'rgba(217, 119, 6, 0.9)';
    ctx.beginPath(); ctx.roundRect(drX - drW / 2 - 6, drY - 12, drW + 12, 16, 4); ctx.fill();
    ctx.strokeStyle = '#fcd34d'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
    ctx.fillText(droughtAlertTxt, drX, drY);
    ctx.textAlign = 'left';
  }

  // Дощ
  if (state.reservoir.weather === 'rain' || state.reservoir.weather === 'storm' || state.reservoir.weather === 'flood') {
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)'; ctx.lineWidth = 1.2;
    particles.rain.forEach(r => {
      r.y += r.speed * 0.01; if (r.y > 1) { r.y = 0; r.x = Math.random(); }
      ctx.beginPath(); ctx.moveTo(r.x * w, r.y * h); ctx.lineTo(r.x * w + 3, r.y * h + r.length); ctx.stroke();
    });
  }

  // -------------------------------------------------------------
  // Інтерактивний HUD Поточної Місії (Всі 4 сценарії + Sandbox)
  // -------------------------------------------------------------
  if (state.mission && state.mission.active) {
    const m = state.mission;
    const hudW = Math.min(320, w * 0.42);
    const hudH = 58;
    const hudX = 14;
    const hudY = 14;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.beginPath();
    ctx.roundRect(hudX, hudY, hudW, hudH, 8);
    ctx.fill();

    let isAlert = state.grid.blackout;
    if (m.id === 'flood') isAlert = isAlert || state.reservoir.waterLevel > 88.0;
    if (m.id === 'peak_demand') isAlert = isAlert || (state.generator.activePowerMW < 260 || Math.abs(state.generator.frequency - 50.0) > 0.4);

    ctx.strokeStyle = m.won ? '#22c55e' : (isAlert ? '#ef4444' : '#38bdf8');
    ctx.lineWidth = 1.5;
    ctx.stroke();

    let mTitle = '';
    let mSubText = '';
    let progress = 0;
    let isGoalMet = false;

    if (m.id === 'flood') {
      mTitle = state.lang === 'uk' ? '🌊 1. ЗАХИСТ ВІД ПАВОДКУ (85 м)' : '🌊 1. FLOOD DEFENSE (85m)';
      isGoalMet = state.reservoir.waterLevel <= 82.0 && !state.grid.blackout;
      mSubText = `Рівень: ${state.reservoir.waterLevel.toFixed(1)}м → ≤82.0м (-3м) | Скид: ${Math.round(state.spillway.flowRate)}м³/с`;
      progress = Math.max(0, Math.min(1.0, (85.0 - state.reservoir.waterLevel) / (85.0 - 82.0)));
    } else if (m.id === 'peak_demand') {
      mTitle = state.lang === 'uk' ? '⚡ 2. ВЕЧІРНІЙ ПІК (320 МВт)' : '⚡ 2. PEAK DEMAND (320 MW)';
      isGoalMet = state.generator.activePowerMW >= 310.0 && Math.abs(state.generator.frequency - 50.0) <= 0.15 && !state.grid.blackout;
      mSubText = `Генерація: ${state.generator.activePowerMW.toFixed(0)} / 320 МВт | ${state.generator.frequency.toFixed(2)} Гц`;
      progress = Math.max(0, Math.min(1.0, state.generator.activePowerMW / 320.0));
    } else if (m.id === 'blackout_drill') {
      mTitle = state.lang === 'uk' ? '🚨 3. ВІДНОВЛЕННЯ БЛЕКАУТУ' : '🚨 3. BLACKOUT RESTORATION';
      isGoalMet = !state.grid.blackout && state.generator.activePowerMW >= 120.0 && Math.abs(state.generator.frequency - 50.0) <= 0.15;
      mSubText = !state.grid.blackout
        ? `Частота: ${state.generator.frequency.toFixed(2)} Гц | Потужність: ${state.generator.activePowerMW.toFixed(0)} МВт`
        : `Блекаут: 0% | Оберти: ${Math.round(state.turbine.rpm)}/150 RPM`;
      progress = !state.grid.blackout ? Math.min(1.0, state.generator.activePowerMW / 140.0) : Math.min(0.5, (state.turbine.rpm / 150.0) * 0.5);
    } else if (m.id === 'drought') {
      mTitle = state.lang === 'uk' ? '🏜️ 4. ЕКОНОМІЯ ПРИ ПОСУСІ' : '🏜️ 4. DROUGHT CONSERVATION';
      isGoalMet = state.spillway.gateOpen < 0.02 && state.penstock.flowRate <= 115.0 && !state.grid.blackout && Math.abs(state.generator.frequency - 50.0) <= 0.15;
      mSubText = `Водоскид: ${Math.round(state.spillway.gateOpen * 100)}% (Ціль: 0%) | Q: ${Math.round(state.penstock.flowRate)}м³/с`;
      progress = Math.max(0, Math.min(1.0, (1.0 - state.spillway.gateOpen) * (state.penstock.flowRate <= 115 ? 1.0 : 0.5)));
    }

    // Заголовок
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.fillStyle = m.won ? '#4ade80' : (isAlert ? '#fca5a5' : '#38bdf8');
    ctx.fillText(mTitle, hudX + 10, hudY + 16);

    if (m.won) {
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(state.lang === 'uk' ? '✅ МІСІЮ УСПІШНО ВИКОНАНО! 50.00 Гц' : '✅ MISSION ACCOMPLISHED! 50.00 Hz', hudX + 10, hudY + 36);
    } else {
      ctx.font = '9px monospace';
      ctx.fillStyle = isGoalMet ? '#4ade80' : '#fde047';
      ctx.fillText(mSubText, hudX + 10, hudY + 32);

      // Смуга прогресу
      const barW = hudW - 20;
      const barH = 5;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.roundRect(hudX + 10, hudY + 40, barW, barH, 2.5);
      ctx.fill();

      ctx.fillStyle = isGoalMet ? '#4ade80' : '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(hudX + 10, hudY + 40, Math.max(4, barW * progress), barH, 2.5);
      ctx.fill();

      if (isGoalMet) {
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`⏱️ ${m.timer.toFixed(1)} / ${m.goalSeconds.toFixed(0)}с`, hudX + hudW - 55, hudY + 16);
      }
    }
    ctx.restore();
  }

  // Хотспоти
  hotspotsConfig.forEach(hs => {
    const hx = hs.xRatio * w, hy = hs.yRatio * h;
    const isHovered = state.activeHotspot === hs.id;
    ctx.save();
    ctx.beginPath(); ctx.arc(hx, hy, isHovered ? 13 : 8, 0, Math.PI * 2);
    ctx.fillStyle = isHovered ? 'rgba(56, 189, 248, 0.9)' : 'rgba(6, 182, 212, 0.45)'; ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
  });
}

const hotspotsConfig = [
  { id: 'reservoir', xRatio: 0.20, yRatio: 0.45, radius: 24 },
  { id: 'gate', xRatio: 0.39, yRatio: 0.58, radius: 20 },
  { id: 'penstock', xRatio: 0.48, yRatio: 0.69, radius: 22 },
  { id: 'spillway', xRatio: 0.52, yRatio: 0.48, radius: 22 },
  { id: 'turbine', xRatio: 0.62, yRatio: 0.82, radius: 24 },
  { id: 'generator', xRatio: 0.62, yRatio: 0.72, radius: 22 },
  { id: 'transformer', xRatio: 0.73, yRatio: 0.76, radius: 20 },
  { id: 'grid', xRatio: 0.88, yRatio: 0.42, radius: 24 },
];

// -------------------------------------------------------------
// 6. ПРЕВ'Ю ТУРБІНИ ТА ГРАФІКИ
// -------------------------------------------------------------
const turbCanvas = document.getElementById('turbinePreviewCanvas');
const turbCtx = turbCanvas.getContext('2d');

function drawTurbineDetailView() {
  const w = turbCanvas.width, h = turbCanvas.height;
  turbCtx.clearRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2, r = 36;

  turbCtx.strokeStyle = 'rgba(34, 211, 238, 0.2)'; turbCtx.lineWidth = 2;
  turbCtx.beginPath(); turbCtx.arc(cx, cy, r + 12, 0, Math.PI * 2); turbCtx.stroke();

  turbCtx.save();
  turbCtx.translate(cx, cy); turbCtx.rotate(state.turbine.angle);
  const bCount = state.turbine.type === 'pelton' ? 12 : (state.turbine.type === 'kaplan' ? 4 : 8);
  turbCtx.fillStyle = state.turbine.type === 'pelton' ? '#f59e0b' : '#22d3ee';
  for (let i = 0; i < bCount; i++) {
    turbCtx.rotate((Math.PI * 2) / bCount);
    turbCtx.beginPath();
    if (state.turbine.type === 'francis') {
      turbCtx.moveTo(0, 0); turbCtx.quadraticCurveTo(r * 0.5, r * 0.4, r, 0); turbCtx.lineTo(r * 0.8, -6);
    } else if (state.turbine.type === 'kaplan') {
      turbCtx.ellipse(r * 0.5, 0, r * 0.45, 8, 0.2, 0, Math.PI * 2);
    } else {
      turbCtx.arc(r * 0.75, 0, 7, 0, Math.PI);
    }
    turbCtx.fill();
  }
  turbCtx.fillStyle = '#0f172a'; turbCtx.beginPath(); turbCtx.arc(0, 0, 8, 0, Math.PI * 2); turbCtx.fill();
  turbCtx.restore();

  turbCtx.fillStyle = '#e2e8f0'; turbCtx.font = '10px monospace';
  turbCtx.fillText(`${Math.round(state.turbine.rpm)} RPM`, 10, 18);
  turbCtx.fillText(`η = ${(state.turbine.efficiency * 100).toFixed(1)}%`, w - 65, 18);
}

const canvasPower = document.getElementById('chartPower');
const ctx1 = canvasPower.getContext('2d');
const canvasHydraulics = document.getElementById('chartHydraulics');
const ctx2 = canvasHydraulics.getContext('2d');

function drawCharts() {
  const drawSeries = (c, data, minVal, maxVal, w, h, color, fillGrad) => {
    if (data.length < 2) return;
    c.save(); c.strokeStyle = color; c.lineWidth = 2;
    const step = w / (MAX_HISTORY - 1);
    c.beginPath();
    data.forEach((val, i) => {
      const y = h - Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal))) * (h - 10) - 5;
      if (i === 0) c.moveTo(i * step, y); else c.lineTo(i * step, y);
    });
    c.stroke();
    if (fillGrad) {
      c.lineTo((data.length - 1) * step, h); c.lineTo(0, h); c.closePath();
      c.fillStyle = fillGrad; c.fill();
    }
    c.restore();
  };

  const w1 = canvasPower.width, h1 = canvasPower.height;
  ctx1.clearRect(0, 0, w1, h1);
  drawSeries(ctx1, history.powerGen, 0, 400, w1, h1, '#22d3ee', 'rgba(34, 211, 238, 0.15)');
  drawSeries(ctx1, history.powerDemand, 0, 400, w1, h1, '#f59e0b', null);

  const w2 = canvasHydraulics.width, h2 = canvasHydraulics.height;
  ctx2.clearRect(0, 0, w2, h2);
  drawSeries(ctx2, history.flowRate, 0, 800, w2, h2, '#06b6d4', 'rgba(6, 182, 212, 0.15)');
  const fScaled = history.frequency.map(f => (f - 48.0) * 200);
  drawSeries(ctx2, fScaled, 0, 800, w2, h2, '#c084fc', null);
}

// -------------------------------------------------------------
// 7. СИНХРОНІЗАЦІЯ UI ТА ПЕРЕКЛАД
// -------------------------------------------------------------
function updateUI() {
  const dict = i18n[state.lang];

  document.getElementById('hudPower').textContent = `${state.generator.activePowerMW.toFixed(1)} ${dict.unitMW}`;
  document.getElementById('hudFrequency').textContent = `${state.generator.frequency.toFixed(2)} Hz`;
  document.getElementById('hudHead').textContent = `${(state.reservoir.waterLevel - state.tailrace.waterLevel).toFixed(1)} ${dict.unitM}`;
  document.getElementById('hudWaterLevel').textContent = `${state.reservoir.waterLevel.toFixed(1)} ${dict.unitM}`;
  
  // Оновлення тренду в шапці (Header Status Pill)
  const hudTrendEl = document.getElementById('hudLevelTrend');
  if (hudTrendEl) {
    hudTrendEl.className = `level-trend-badge ${state.reservoir.levelTrend}`;
    const sign = state.reservoir.levelTrend === 'rising' ? '+' : '';
    const trendTxt = state.reservoir.levelTrend === 'rising' ? dict.trendRising : (state.reservoir.levelTrend === 'falling' ? dict.trendFalling : dict.trendStable);
    hudTrendEl.textContent = `${trendTxt} (${sign}${state.reservoir.levelRate.toFixed(2)})`;
  }

  const clockEl = document.getElementById('hudClock');
  if (clockEl) clockEl.textContent = new Date().toLocaleTimeString(state.lang === 'uk' ? 'uk-UA' : 'en-GB');

  const statusDot = document.getElementById('gridStatusDot');
  const statusText = document.getElementById('gridStatusText');
  if (state.grid.blackout) {
    statusDot.className = 'status-indicator-dot danger'; statusText.textContent = dict.statusBlackout; statusText.style.color = '#f87171';
  } else if (Math.abs(state.generator.frequency - 50.00) > 0.4) {
    statusDot.className = 'status-indicator-dot warning'; statusText.textContent = dict.statusWarning; statusText.style.color = '#f59e0b';
  } else {
    statusDot.className = 'status-indicator-dot'; statusText.textContent = dict.statusNormal; statusText.style.color = '#4ade80';
  }

  // Оновлення телеметричної картки рівня
  const valLevelEl = document.getElementById('valWaterLevel');
  if (valLevelEl) valLevelEl.textContent = state.reservoir.waterLevel.toFixed(1);
  
  const valLevelTrendEl = document.getElementById('valLevelTrend');
  if (valLevelTrendEl) {
    valLevelTrendEl.className = `level-trend-badge ${state.reservoir.levelTrend}`;
    valLevelTrendEl.textContent = state.reservoir.levelTrend === 'rising' ? dict.trendRising : (state.reservoir.levelTrend === 'falling' ? dict.trendFalling : dict.trendStable);
  }

  const valLevelRateEl = document.getElementById('valLevelRate');
  if (valLevelRateEl) {
    const rateSign = state.reservoir.levelTrend === 'rising' ? '+' : '';
    valLevelRateEl.textContent = `${rateSign}${state.reservoir.levelRate.toFixed(2)}`;
  }

  const valBalanceEl = document.getElementById('valWaterBalance');
  if (valBalanceEl) {
    const balSign = state.reservoir.waterBalance > 0 ? '+' : '';
    valBalanceEl.textContent = `${balSign}${state.reservoir.waterBalance.toFixed(1)}`;
  }

  const levelBarEl = document.getElementById('levelBarFill');
  if (levelBarEl) {
    const pct = Math.max(0, Math.min(100, ((state.reservoir.waterLevel - state.reservoir.minLevel) / (state.reservoir.maxLevel - state.reservoir.minLevel)) * 100));
    levelBarEl.style.width = `${pct.toFixed(1)}%`;
    if (state.reservoir.waterLevel > 88.0 || state.reservoir.waterLevel < 32.0) {
      levelBarEl.className = 'level-bar-fill warning';
    } else {
      levelBarEl.className = 'level-bar-fill';
    }
  }

  document.getElementById('valPowerGen').textContent = state.generator.activePowerMW.toFixed(1);
  document.getElementById('valGridDemand').textContent = state.grid.demandMW.toFixed(1);
  document.getElementById('valFlowTurbine').textContent = state.penstock.flowRate.toFixed(1);
  document.getElementById('valFlowSpillway').textContent = state.spillway.flowRate.toFixed(1);
  document.getElementById('valTurbineRpm').textContent = Math.round(state.turbine.rpm);
  document.getElementById('valHeadNet').textContent = Math.max(0, state.reservoir.waterLevel - state.tailrace.waterLevel - state.penstock.headLoss).toFixed(1);
  document.getElementById('valEfficiency').textContent = (state.turbine.efficiency * state.generator.efficiency * 100).toFixed(1);
  document.getElementById('valPressure').textContent = state.penstock.pressureMPa.toFixed(2);
  document.getElementById('valTotalEnergy').textContent = state.energy.totalMWh.toFixed(0);
  document.getElementById('valCo2Saved').textContent = Math.round(state.energy.co2SavedTons);

  document.getElementById('readoutGate').textContent = `${Math.round(state.penstock.targetGateOpen * 100)}%`;
  document.getElementById('readoutInflow').textContent = `${Math.round(state.reservoir.targetInflow)} ${dict.unitM3s}`;
  document.getElementById('readoutSpillway').textContent = `${Math.round(state.spillway.targetGateOpen * 100)}%`;
  document.getElementById('readoutVanes').textContent = `${Math.round(state.turbine.targetGuideVanes * 100)}%`;
  document.getElementById('readoutDemand').textContent = `${Math.round(state.grid.targetDemandMW)} ${dict.unitMW}`;

  // -------------------------------------------------------------
  // Оновлення Навчального Диспетчера-Наставника та Стан Світла в Місті
  // -------------------------------------------------------------
  const coachPanel = document.getElementById('dispatcherCoachPanel');
  const coachAvatar = document.getElementById('coachAvatar');
  const coachTitle = document.getElementById('coachTitle');
  const coachBadge = document.getElementById('coachMissionBadge');
  const coachTip = document.getElementById('coachTipText');
  const cityPowerStatus = document.getElementById('cityPowerStatus');

  if (coachPanel) {
    if (state.mission && state.mission.active) {
      const m = state.mission;
      if (m.id === 'flood') {
        if (m.won) {
          coachPanel.className = 'dispatcher-coach-panel';
          coachAvatar.textContent = '🏆';
          if (cityPowerStatus) {
            cityPowerStatus.className = 'city-power-status';
            cityPowerStatus.innerHTML = `<span class="status-indicator-dot"></span> 100% ${state.lang === 'uk' ? 'Світло' : 'Power'}`;
          }
          coachTip.innerHTML = state.lang === 'uk'
            ? `🏆 <strong>МІСІЮ "ЗАХИСТ ВІД ПАВОДКУ" УСПІШНО ВИКОНАНО!</strong> Греблю захищено від паводку 85 м, рівень води безпечний (${state.reservoir.waterLevel.toFixed(1)} м ≤ 82 м), а місто безперебійно живиться струмом 50.00 Гц!`
            : `🏆 <strong>MISSION "FLOOD DEFENSE" ACCOMPLISHED!</strong> Dam protected from 85m surge, water stabilized (${state.reservoir.waterLevel.toFixed(1)} m ≤ 82 m), and city power grid is running smoothly at 50.00 Hz!`;
        } else if (state.grid.blackout) {
          coachPanel.className = 'dispatcher-coach-panel alert-mode';
          coachAvatar.textContent = '🚨';
          if (cityPowerStatus) {
            cityPowerStatus.className = 'city-power-status blackout';
            cityPowerStatus.innerHTML = `<span class="status-indicator-dot danger"></span> 0% ${state.lang === 'uk' ? 'БЛЕКАУТ' : 'BLACKOUT'}`;
          }
          coachTip.innerHTML = state.lang === 'uk'
            ? `🚨 <strong>БЛЕКАУТ ПІД ЧАС ПАВОДКУ!</strong> Місто знеструмлено! Терміново натисніть <span class="highlight-action">'🔄 Синхронізація 50 Гц'</span> та тримайте водоскид відкритим!`
            : `🚨 <strong>BLACKOUT DURING FLOOD SURGE!</strong> City disconnected! Click <span class="highlight-action">'🔄 Sync 50 Hz Grid'</span> immediately and keep spillway gates open!`;
        } else if (state.reservoir.waterLevel > 83.5) {
          coachPanel.className = 'dispatcher-coach-panel alert-mode';
          coachAvatar.textContent = '🌊';
          if (cityPowerStatus) {
            cityPowerStatus.className = 'city-power-status warning';
            cityPowerStatus.innerHTML = `<span class="status-indicator-dot warning"></span> 100% (${state.lang === 'uk' ? 'Паводок 85м' : 'Flood 85m'})`;
          }
          coachTip.innerHTML = state.lang === 'uk'
            ? `🌊 <strong>МІСІЯ 1: ЗАХИСТ ВІД ПАВОДКУ (Рівень ${state.reservoir.waterLevel.toFixed(1)} м)!</strong> <br>👉 <strong>Завдання:</strong> Відкрийте <span class="highlight-action">'Холостий Водоскид' (Spillway) на 65–80%</span>, щоб скинути рівень на 3 метри (нижче 82.0 м), зберігши живлення міста!`
            : `🌊 <strong>MISSION 1: FLOOD DEFENSE (Level ${state.reservoir.waterLevel.toFixed(1)} m)!</strong> <br>👉 <strong>Objective:</strong> Open <span class="highlight-action">'Spillway Crest' to 65–80%</span> to drain surge down 3m (below 82.0 m) while keeping city grid at 50 Hz!`;
        } else if (state.reservoir.waterLevel > 82.0) {
          coachPanel.className = 'dispatcher-coach-panel warning-mode';
          coachAvatar.textContent = '🌊';
          if (cityPowerStatus) {
            cityPowerStatus.className = 'city-power-status warning';
            cityPowerStatus.innerHTML = `<span class="status-indicator-dot warning"></span> 100% (${state.lang === 'uk' ? 'Скид води' : 'Draining'})`;
          }
          coachTip.innerHTML = state.lang === 'uk'
            ? `🌊 <strong>РІВЕНЬ ЗНИЖУЄТЬСЯ (${state.reservoir.waterLevel.toFixed(1)} м)!</strong> Чудова робота. Продовжуйте скидати воду до безпечного рівня ≤82.0 м.`
            : `🌊 <strong>LEVEL IS DROPPING (${state.reservoir.waterLevel.toFixed(1)} m)!</strong> Great work. Continue discharging water until safe level ≤82.0 m is reached.`;
        } else {
          coachPanel.className = 'dispatcher-coach-panel';
          coachAvatar.textContent = '⏱️';
          if (cityPowerStatus) {
            cityPowerStatus.className = 'city-power-status';
            cityPowerStatus.innerHTML = `<span class="status-indicator-dot"></span> 100% ${state.lang === 'uk' ? 'Світло' : 'Power'}`;
          }
          coachTip.innerHTML = state.lang === 'uk'
            ? `🟢 <strong>БЕЗПЕЧНИЙ РІВЕНЬ ДОСЯГНУТО (${state.reservoir.waterLevel.toFixed(1)} м)!</strong> Утримуйте станцію під контролем: <strong>${m.timer.toFixed(1)} / ${m.goalSeconds.toFixed(0)} с</strong>!`
            : `🟢 <strong>SAFE LEVEL REACHED (${state.reservoir.waterLevel.toFixed(1)} m)!</strong> Hold stability for victory: <strong>${m.timer.toFixed(1)} / ${m.goalSeconds.toFixed(0)} s</strong>!`;
        }
      } else if (m.id === 'peak_demand') {
        if (m.won) {
          coachPanel.className = 'dispatcher-coach-panel';
          coachAvatar.textContent = '🏆';
          if (cityPowerStatus) {
            cityPowerStatus.className = 'city-power-status';
            cityPowerStatus.innerHTML = `<span class="status-indicator-dot"></span> 100% ${state.lang === 'uk' ? 'Світло' : 'Power'}`;
          }
          coachTip.innerHTML = state.lang === 'uk'
            ? `🏆 <strong>МІСІЮ "ВЕЧІРНІЙ ПІК" УСПІШНО ВИКОНАНО!</strong> Потужність станції сягнула 320 МВт, частота 50.00 Гц зафіксована, а пікове навантаження міста повністю покрито!`
            : `🏆 <strong>MISSION "PEAK DEMAND" ACCOMPLISHED!</strong> Generation hit 320 MW, 50.00 Hz locked, and city evening consumption is fully satisfied!`;
        } else if (state.grid.blackout) {
          coachPanel.className = 'dispatcher-coach-panel alert-mode';
          coachAvatar.textContent = '🚨';
          if (cityPowerStatus) {
            cityPowerStatus.className = 'city-power-status blackout';
            cityPowerStatus.innerHTML = `<span class="status-indicator-dot danger"></span> 0% ${state.lang === 'uk' ? 'БЛЕКАУТ' : 'BLACKOUT'}`;
          }
          coachTip.innerHTML = state.lang === 'uk'
            ? `🚨 <strong>БЛЕКАУТ ЧЕРЕЗ ПЕРЕВАНТАЖЕННЯ!</strong> Натисніть <span class="highlight-action">'🔄 Синхронізація 50 Гц'</span>, відкрийте водовід на 95% та додайте лопатки турбіни!`
            : `🚨 <strong>OVERLOAD BLACKOUT!</strong> Click <span class="highlight-action">'🔄 Sync 50 Hz Grid'</span>, open penstock gate to 95%, and advance guide vanes!`;
        } else if (state.generator.activePowerMW < 305 || Math.abs(state.generator.frequency - 50.0) > 0.15) {
          coachPanel.className = 'dispatcher-coach-panel alert-mode';
          coachAvatar.textContent = '⚡';
          if (cityPowerStatus) {
            cityPowerStatus.className = 'city-power-status warning';
            cityPowerStatus.innerHTML = `<span class="status-indicator-dot warning"></span> ${state.generator.frequency.toFixed(2)} Hz`;
          }
          coachTip.innerHTML = state.lang === 'uk'
            ? `⚡ <strong>МІСІЯ 2: ВЕЧІРНІЙ ПІК МІСТА (320 МВт)!</strong> Місто увімкнуло все освітлення, частота просіла (${state.generator.frequency.toFixed(2)} Гц)! <br>👉 <strong>Завдання:</strong> 1) Відкрийте <span class="highlight-action">'Головний затвор водоводу' до 90–100%</span>; 2) Збільште <span class="highlight-action">'Напрямний апарат (лопатки)' до 90–95%</span>, щоб підняти генерацію до 320 МВт і повернути 50.00 Гц!`
            : `⚡ <strong>MISSION 2: PEAK DEMAND (320 MW)!</strong> City evening load surged, frequency dropped (${state.generator.frequency.toFixed(2)} Hz)! <br>👉 <strong>Objective:</strong> 1) Open <span class="highlight-action">'Penstock Gate' to 90–100%</span>; 2) Increase <span class="highlight-action">'Wicket Gates' to 90–95%</span> to reach 320 MW at 50.00 Hz!`;
        } else {
          coachPanel.className = 'dispatcher-coach-panel';
          coachAvatar.textContent = '⏱️';
          if (cityPowerStatus) {
            cityPowerStatus.className = 'city-power-status';
            cityPowerStatus.innerHTML = `<span class="status-indicator-dot"></span> 100% (320 MW)`;
          }
          coachTip.innerHTML = state.lang === 'uk'
            ? `🟢 <strong>ПІКОВЕ НАВАНТАЖЕННЯ ПОКРИТО (320 МВт, 50.00 Гц)!</strong> Утримуйте частоту в нормі: <strong>${m.timer.toFixed(1)} / ${m.goalSeconds.toFixed(0)} с</strong>!`
            : `🟢 <strong>PEAK DEMAND SATISFIED (320 MW, 50.00 Hz)!</strong> Maintain frequency stability: <strong>${m.timer.toFixed(1)} / ${m.goalSeconds.toFixed(0)} s</strong>!`;
        }
      } else if (m.id === 'blackout_drill') {
        if (m.won) {
          coachPanel.className = 'dispatcher-coach-panel';
          coachAvatar.textContent = '🏆';
          if (cityPowerStatus) {
            cityPowerStatus.className = 'city-power-status';
            cityPowerStatus.innerHTML = `<span class="status-indicator-dot"></span> 100% ${state.lang === 'uk' ? 'Світло' : 'Power'}`;
          }
          coachTip.innerHTML = state.lang === 'uk'
            ? `🏆 <strong>МІСІЮ "ВІДНОВЛЕННЯ ПІСЛЯ БЛЕКАУТУ" ВИКОНАНО!</strong> Гідроагрегат успішно розігнано, синхронізовано з енергосистемою 50.00 Гц, а місто повністю заживлено (100%)!`
            : `🏆 <strong>MISSION "BLACKOUT RESTORATION" ACCOMPLISHED!</strong> Turbine spun up, grid synced at 50.00 Hz, and city electricity is 100% restored!`;
        } else if (state.grid.blackout) {
          coachPanel.className = 'dispatcher-coach-panel alert-mode';
          coachAvatar.textContent = '🚨';
          if (cityPowerStatus) {
            cityPowerStatus.className = 'city-power-status blackout';
            cityPowerStatus.innerHTML = `<span class="status-indicator-dot danger"></span> 0% ${state.lang === 'uk' ? 'БЛЕКАУТ' : 'BLACKOUT'}`;
          }
          coachTip.innerHTML = state.lang === 'uk'
            ? `🚨 <strong>МІСІЯ 3: БЛЕКАУТ ТА ПОВНЕ ЗНЕСТРУМЛЕННЯ (0%)!</strong> <br>👉 <strong>Завдання:</strong> 1) Відкрийте <span class="highlight-action">'Головний затвор водоводу' (70–85%)</span>; 2) Відкрийте <span class="highlight-action">'Напрямний апарат' (65–75%)</span> для розгону турбіни до 150 об/хв; 3) Натисніть кнопку <span class="highlight-action">'🔄 Синхронізація 50 Гц'</span> для подачі струму!`
            : `🚨 <strong>MISSION 3: BLACKOUT RESTORATION (0% Power)!</strong> <br>👉 <strong>Objective:</strong> 1) Open <span class="highlight-action">'Penstock Sluice' (70–85%)</span>; 2) Open <span class="highlight-action">'Wicket Gates' (65–75%)</span> to spin turbine to 150 RPM; 3) Click <span class="highlight-action">'🔄 Sync 50 Hz Grid'</span> to reconnect city!`;
        } else if (state.generator.activePowerMW < 110 || Math.abs(state.generator.frequency - 50.0) > 0.15) {
          coachPanel.className = 'dispatcher-coach-panel warning-mode';
          coachAvatar.textContent = '⚙️';
          if (cityPowerStatus) {
            cityPowerStatus.className = 'city-power-status warning';
            cityPowerStatus.innerHTML = `<span class="status-indicator-dot warning"></span> ${state.generator.frequency.toFixed(2)} Hz`;
          }
          coachTip.innerHTML = state.lang === 'uk'
            ? `⚙️ <strong>НАБІР ПОТУЖНОСТІ ТА СТАБІЛІЗАЦІЯ (${state.generator.frequency.toFixed(2)} Гц)!</strong> Збільште лопатки турбіни до 70–75% для повного живлення споживачів.`
            : `⚙️ <strong>POWER RAMP-UP & STABILIZATION (${state.generator.frequency.toFixed(2)} Hz)!</strong> Adjust wicket gates to 70–75% to fully satisfy consumer load.`;
        } else {
          coachPanel.className = 'dispatcher-coach-panel';
          coachAvatar.textContent = '⏱️';
          if (cityPowerStatus) {
            cityPowerStatus.className = 'city-power-status';
            cityPowerStatus.innerHTML = `<span class="status-indicator-dot"></span> 100% ${state.lang === 'uk' ? 'Світло' : 'Power'}`;
          }
          coachTip.innerHTML = state.lang === 'uk'
            ? `🟢 <strong>ЕНЕРГОПОСТАЧАННЯ МІСТА ВІДНОВЛЕНО (100%, 50.00 Гц)!</strong> Утримуйте стабільність: <strong>${m.timer.toFixed(1)} / ${m.goalSeconds.toFixed(0)} с</strong>!`
            : `🟢 <strong>CITY POWER 100% RESTORED (50.00 Hz)!</strong> Maintain steady operation: <strong>${m.timer.toFixed(1)} / ${m.goalSeconds.toFixed(0)} s</strong>!`;
        }
      } else if (m.id === 'drought') {
        if (m.won) {
          coachPanel.className = 'dispatcher-coach-panel';
          coachAvatar.textContent = '🏆';
          if (cityPowerStatus) {
            cityPowerStatus.className = 'city-power-status';
            cityPowerStatus.innerHTML = `<span class="status-indicator-dot"></span> 100% ${state.lang === 'uk' ? 'Світло' : 'Power'}`;
          }
          coachTip.innerHTML = state.lang === 'uk'
            ? `🏆 <strong>МІСІЮ "ЕКОНОМІЯ ПРИ ПОСУСІ" ВИКОНАНО!</strong> Водоскид перекрито, витрату води збалансовано з припливом, а місто стабільно забезпечене енергією без втрати водойми!`
            : `🏆 <strong>MISSION "DROUGHT CONSERVATION" ACCOMPLISHED!</strong> Spillway closed, water outflow balanced with river inflow, and city is securely powered without depleting the reservoir!`;
        } else if (state.grid.blackout) {
          coachPanel.className = 'dispatcher-coach-panel alert-mode';
          coachAvatar.textContent = '🚨';
          if (cityPowerStatus) {
            cityPowerStatus.className = 'city-power-status blackout';
            cityPowerStatus.innerHTML = `<span class="status-indicator-dot danger"></span> 0% ${state.lang === 'uk' ? 'БЛЕКАУТ' : 'BLACKOUT'}`;
          }
          coachTip.innerHTML = state.lang === 'uk'
            ? `🚨 <strong>БЛЕКАУТ ПІД ЧАС ПОСУХИ!</strong> Натисніть <span class="highlight-action">'🔄 Синхронізація 50 Гц'</span> та встановіть попит на 60–70 МВт.`
            : `🚨 <strong>DROUGHT BLACKOUT!</strong> Click <span class="highlight-action">'🔄 Sync 50 Hz Grid'</span> and set load demand to 60–70 MW.`;
        } else if (state.spillway.gateOpen > 0.01) {
          coachPanel.className = 'dispatcher-coach-panel alert-mode';
          coachAvatar.textContent = '🏜️';
          if (cityPowerStatus) {
            cityPowerStatus.className = 'city-power-status warning';
            cityPowerStatus.innerHTML = `<span class="status-indicator-dot warning"></span> 100% (${state.lang === 'uk' ? 'Витік води' : 'Water Loss'})`;
          }
          coachTip.innerHTML = state.lang === 'uk'
            ? `🏜️ <strong>МІСІЯ 4: ПОСУХА (Приплив лише 35 м³/с)!</strong> Холостий водоскид відкритий — ми марно втрачаємо воду! <br>👉 <strong>Завдання:</strong> 1) Терміново <span class="highlight-action">закрийте Холостий водоскид (0%)</span>; 2) Зменшіть споживання мережі до 60–80 МВт; 3) Встановіть напрямний апарат на 35–45%!`
            : `🏜️ <strong>MISSION 4: DROUGHT (Inflow only 35 m³/s)!</strong> Spillway is discharging precious water! <br>👉 <strong>Objective:</strong> 1) Close <span class="highlight-action">'Spillway Gates' to 0%</span> immediately; 2) Lower grid demand to 60–80 MW; 3) Set wicket gates to 35–45%!`;
        } else if (state.penstock.flowRate > 115) {
          coachPanel.className = 'dispatcher-coach-panel warning-mode';
          coachAvatar.textContent = '🏜️';
          if (cityPowerStatus) {
            cityPowerStatus.className = 'city-power-status warning';
            cityPowerStatus.innerHTML = `<span class="status-indicator-dot warning"></span> 100% (${state.lang === 'uk' ? 'Посуха' : 'Drought'})`;
          }
          coachTip.innerHTML = state.lang === 'uk'
            ? `🏜️ <strong>ЗАНАДТО ВЕЛИКА ВИТРАТА ВОДИ (${state.penstock.flowRate.toFixed(0)} м³/с)!</strong> Зменшіть відкриття лопаток турбіни або попит міста для досягнення гідробалансу.`
            : `🏜️ <strong>HIGH WATER CONSUMPTION (${state.penstock.flowRate.toFixed(0)} m³/s)!</strong> Throttle wicket gates or city demand to maintain reservoir volume.`;
        } else {
          coachPanel.className = 'dispatcher-coach-panel';
          coachAvatar.textContent = '⏱️';
          if (cityPowerStatus) {
            cityPowerStatus.className = 'city-power-status';
            cityPowerStatus.innerHTML = `<span class="status-indicator-dot"></span> 100% ${state.lang === 'uk' ? 'Еко' : 'Eco'}`;
          }
          coachTip.innerHTML = state.lang === 'uk'
            ? `🟢 <strong>ЕКОНОМНИЙ РЕЖИМ СТАБІЛІЗОВАНО!</strong> Вода зберігається, частота 50.00 Гц: <strong>${m.timer.toFixed(1)} / ${m.goalSeconds.toFixed(0)} с</strong>!`
            : `🟢 <strong>ECO CONSERVATION MODE STABLE!</strong> Water saved, frequency 50.00 Hz: <strong>${m.timer.toFixed(1)} / ${m.goalSeconds.toFixed(0)} s</strong>!`;
        }
      }
    } else if (state.grid.blackout) {
      coachPanel.className = 'dispatcher-coach-panel alert-mode';
      coachAvatar.textContent = '🚨';
      if (cityPowerStatus) {
        cityPowerStatus.className = 'city-power-status blackout';
        cityPowerStatus.innerHTML = `<span class="status-indicator-dot danger"></span> 0% ${state.lang === 'uk' ? 'БЛЕКАУТ' : 'BLACKOUT'}`;
      }
      coachTip.innerHTML = state.lang === 'uk'
        ? `🚨 <strong>СТАВСЯ БЛЕКАУТ ЕНЕРГОСИСТЕМИ!</strong> Частота вийшла за межі (46.5–54.0 Гц) або генератор зупинено. Місто знеструмлене (0 МВт, 0 Гц). <br>👉 <strong>Як відновити світло:</strong> 1) Натисніть кнопку <span class="highlight-action">'🔄 Синхронізація 50 Гц'</span> або <span class="highlight-action">'⚡ Виправити'</span>, 2) Відкрийте затвор водоводу на 70–80%, 3) Встановіть лопатки турбіни на 70% та увімкніть AGC.`
        : `🚨 <strong>GRID BLACKOUT OCCURRED!</strong> Frequency breached limits (46.5–54.0 Hz) or generator tripped. City lost power (0 MW, 0 Hz). <br>👉 <strong>How to restore:</strong> 1) Click <span class="highlight-action">'🔄 Sync 50 Hz Grid'</span> or <span class="highlight-action">'⚡ Quick Fix'</span>, 2) Set Penstock gate to 70–80%, 3) Set Wicket gates to 70% and turn AGC ON.`;
    } else if (state.generator.frequency < 48.8) {
      coachPanel.className = 'dispatcher-coach-panel alert-mode';
      coachAvatar.textContent = '📉';
      if (cityPowerStatus) {
        cityPowerStatus.className = 'city-power-status blackout';
        cityPowerStatus.innerHTML = `<span class="status-indicator-dot danger"></span> ${state.generator.frequency.toFixed(2)} Hz`;
      }
      coachTip.innerHTML = state.lang === 'uk'
        ? `🚨 <strong>КРИТИЧНИЙ ДЕФІЦИТ ПОТУЖНОСТІ (${state.generator.frequency.toFixed(2)} Гц)!</strong> Споживання міста (${state.grid.demandMW.toFixed(0)} МВт) значно перевищує генерацію (${state.generator.activePowerMW.toFixed(0)} МВт). Генератор гальмується — загроза блекауту! <br>👉 <strong>Що робити:</strong> Терміново збільшіть відкриття <span class="highlight-action">'Лопаток напрямного апарату'</span> (зараз ${Math.round(state.turbine.guideVanes * 100)}%), зменшіть попит міста або <span class="highlight-action">увімкніть тумблер AGC</span>.`
        : `🚨 <strong>CRITICAL POWER DEFICIT (${state.generator.frequency.toFixed(2)} Hz)!</strong> City demand (${state.grid.demandMW.toFixed(0)} MW) strongly exceeds output (${state.generator.activePowerMW.toFixed(0)} MW). Rotor deceleration risks blackout! <br>👉 <strong>What to do:</strong> Open <span class="highlight-action">'Wicket Gates'</span> wider (currently ${Math.round(state.turbine.guideVanes * 100)}%), lower grid demand, or <span class="highlight-action">turn AGC ON</span>.`;
    } else if (state.generator.frequency > 51.2) {
      coachPanel.className = 'dispatcher-coach-panel alert-mode';
      coachAvatar.textContent = '📈';
      if (cityPowerStatus) {
        cityPowerStatus.className = 'city-power-status blackout';
        cityPowerStatus.innerHTML = `<span class="status-indicator-dot danger"></span> ${state.generator.frequency.toFixed(2)} Hz`;
      }
      coachTip.innerHTML = state.lang === 'uk'
        ? `🚨 <strong>НЕБЕЗПЕЧНИЙ РОЗГІН ГЕНЕРАТОРА (${state.generator.frequency.toFixed(2)} Гц)!</strong> Генерація (${state.generator.activePowerMW.toFixed(0)} МВт) надмірно перевищує попит міста (${state.grid.demandMW.toFixed(0)} МВт). Оберти ротора завеликі (${Math.round(state.turbine.rpm)} об/хв). Ризик аварійного відключення! <br>👉 <strong>Що робити:</strong> Терміново прикрийте <span class="highlight-action">'Лопатки напрямного апарату'</span> на 15–20% або увімкніть AGC.`
        : `🚨 <strong>DANGEROUS GENERATOR OVERSPEED (${state.generator.frequency.toFixed(2)} Hz)!</strong> Generation (${state.generator.activePowerMW.toFixed(0)} MW) strongly exceeds demand (${state.grid.demandMW.toFixed(0)} MW). Speed is ${Math.round(state.turbine.rpm)} RPM. Blackout trip risk! <br>👉 <strong>What to do:</strong> Throttle <span class="highlight-action">'Wicket Gates'</span> lower by 15–20% or enable AGC.`;
    } else if (state.generator.frequency < 49.85) {
      coachPanel.className = 'dispatcher-coach-panel warning-mode';
      coachAvatar.textContent = '⚠️';
      if (cityPowerStatus) {
        cityPowerStatus.className = 'city-power-status warning';
        cityPowerStatus.innerHTML = `<span class="status-indicator-dot warning"></span> ${state.generator.frequency.toFixed(2)} Hz`;
      }
      coachTip.innerHTML = state.lang === 'uk'
        ? `⚠️ <strong>ПРОСІДАННЯ ЧАСТОТИ СТРУМУ (${state.generator.frequency.toFixed(2)} Гц)!</strong> Генерація станції (${state.generator.activePowerMW.toFixed(0)} МВт) менша за попит міста (${state.grid.demandMW.toFixed(0)} МВт). <br>👉 <strong>Що робити:</strong> Збільшіть відкриття <span class="highlight-action">'Лопаток напрямного апарату'</span> на 5–15% або <span class="highlight-action">увімкніть автоматичний регулятор AGC</span>.`
        : `⚠️ <strong>GRID FREQUENCY UNDER-SPEED (${state.generator.frequency.toFixed(2)} Hz)!</strong> Generation (${state.generator.activePowerMW.toFixed(0)} MW) is less than city demand (${state.grid.demandMW.toFixed(0)} MW). <br>👉 <strong>What to do:</strong> Open <span class="highlight-action">'Wicket Gates'</span> wider by 5–15% or <span class="highlight-action">switch AGC ON</span>.`;
    } else if (state.generator.frequency > 50.15) {
      coachPanel.className = 'dispatcher-coach-panel warning-mode';
      coachAvatar.textContent = '⚙️';
      if (cityPowerStatus) {
        cityPowerStatus.className = 'city-power-status warning';
        cityPowerStatus.innerHTML = `<span class="status-indicator-dot warning"></span> ${state.generator.frequency.toFixed(2)} Hz`;
      }
      coachTip.innerHTML = state.lang === 'uk'
        ? `⚠️ <strong>ПІДВИЩЕННЯ ЧАСТОТИ СТРУМУ (${state.generator.frequency.toFixed(2)} Гц)!</strong> Станція виробляє надлишок енергії (${state.generator.activePowerMW.toFixed(0)} МВт проти ${state.grid.demandMW.toFixed(0)} МВт споживання). <br>👉 <strong>Що робити:</strong> Прикрийте <span class="highlight-action">'Лопатки напрямного апарату'</span> на кілька відсотків або збільшіть навантаження міста.`
        : `⚠️ <strong>GRID FREQUENCY OVER-SPEED (${state.generator.frequency.toFixed(2)} Hz)!</strong> Station produces excess power (${state.generator.activePowerMW.toFixed(0)} MW vs ${state.grid.demandMW.toFixed(0)} MW demand). <br>👉 <strong>What to do:</strong> Throttle <span class="highlight-action">'Wicket Gates'</span> lower or increase city grid load.`;
    } else if (state.penstock.gateOpen < 0.35) {
      coachPanel.className = 'dispatcher-coach-panel warning-mode';
      coachAvatar.textContent = '🚪';
      if (cityPowerStatus) {
        cityPowerStatus.className = 'city-power-status warning';
        cityPowerStatus.innerHTML = `<span class="status-indicator-dot warning"></span> 100% (${Math.round(state.penstock.gateOpen * 100)}%)`;
      }
      coachTip.innerHTML = state.lang === 'uk'
        ? `⚠️ <strong>ГОЛОВНИЙ ЗАТВОР ВОДОВОДУ ПРИКРИТО (${Math.round(state.penstock.gateOpen * 100)}%)!</strong> Воді важко надходити до турбіни, що обмежує максимальну потужність генератора. <br>👉 <strong>Що робити:</strong> Відкрийте <span class="highlight-action">'Головний затвор' до 70–85%</span> для забезпечення нормального гідравлічного напору.`
        : `⚠️ <strong>PENSTOCK INTAKE GATE RESTRICTED (${Math.round(state.penstock.gateOpen * 100)}%)!</strong> Water flow to turbine is throttled, limiting power capacity. <br>👉 <strong>What to do:</strong> Open <span class="highlight-action">'Penstock Gate' to 70–85%</span> for nominal hydraulic head.`;
    } else if (state.reservoir.waterLevel > 88.0) {
      coachPanel.className = 'dispatcher-coach-panel alert-mode';
      coachAvatar.textContent = '🌊';
      if (cityPowerStatus) {
        cityPowerStatus.className = 'city-power-status warning';
        cityPowerStatus.innerHTML = `<span class="status-indicator-dot warning"></span> 100% (${state.lang === 'uk' ? 'Паводок' : 'Flood'})`;
      }
      coachTip.innerHTML = state.lang === 'uk'
        ? `🌊 <strong>ВЕЛИКИЙ ПАВОДОК ТА ЗАГРОЗА ПЕРЕЛИВУ!</strong> Рівень води перевищив критичні 88 м. <br>👉 <strong>Що робити:</strong> Терміново відкрийте <span class="highlight-action">'Холостий Водоскид' (Spillway) на 60–80%</span>, щоб безпечно скинути надлишок річкового припливу та захистити дамбу!`
        : `🌊 <strong>SEVERE FLOOD & DAM OVERFLOW RISK!</strong> Reservoir level exceeded critical 88 m. <br>👉 <strong>What to do:</strong> Open <span class="highlight-action">'Spillway Crest Gates' to 60–80%</span> immediately to dump flood surge and protect powerhouse structures!`;
    } else if (state.reservoir.waterLevel < 35.0) {
      coachPanel.className = 'dispatcher-coach-panel warning-mode';
      coachAvatar.textContent = '🏜️';
      if (cityPowerStatus) {
        cityPowerStatus.className = 'city-power-status warning';
        cityPowerStatus.innerHTML = `<span class="status-indicator-dot warning"></span> 100% (${state.lang === 'uk' ? 'Посуха' : 'Drought'})`;
      }
      coachTip.innerHTML = state.lang === 'uk'
        ? `🏜️ <strong>КРИТИЧНЕ ОБМІЛІННЯ ТА ПОСУХА!</strong> Рівень води впав нижче 35 м. <br>👉 <strong>Що робити:</strong> Увімкніть режим економії: закрийте водоскид (0%), прикрийте <span class="highlight-action">'Головний затвор' до 35–40%</span> та зменшіть споживання міста до 60 МВт.`
        : `🏜️ <strong>RESERVOIR DEPLETION & DROUGHT!</strong> Water level dropped below 35 m. <br>👉 <strong>What to do:</strong> Activate water conservation: keep spillway closed (0%), throttle <span class="highlight-action">'Penstock Gate' to 35–40%</span>, and lower city load to 60 MW.`;
    } else if (state.turbine.cavitation) {
      coachPanel.className = 'dispatcher-coach-panel warning-mode';
      coachAvatar.textContent = '⚡';
      if (cityPowerStatus) {
        cityPowerStatus.className = 'city-power-status warning';
        cityPowerStatus.innerHTML = `<span class="status-indicator-dot warning"></span> 100% (${state.lang === 'uk' ? 'Кавітація' : 'Cavitation'})`;
      }
      coachTip.innerHTML = state.lang === 'uk'
        ? `⚡ <strong>ВИЯВЛЕНО КАВІТАЦІЮ ТУРБІНИ!</strong> Руйнівні гідроудари на лопатках. <br>👉 <strong>Що робити:</strong> Прикрийте <span class="highlight-action">'Напрямний апарат (лопатки)' до 65–70%</span> для захисту металу колеса.`
        : `⚡ <strong>TURBINE CAVITATION DETECTED!</strong> Runner blades are suffering micro-jet erosion. <br>👉 <strong>What to do:</strong> Throttle <span class="highlight-action">'Wicket Gates' down to 65–70%</span> to protect turbine runner.`;
    } else {
      coachPanel.className = 'dispatcher-coach-panel';
      coachAvatar.textContent = '🧑‍🏫';
      if (cityPowerStatus) {
        cityPowerStatus.className = 'city-power-status';
        cityPowerStatus.innerHTML = `<span class="status-indicator-dot"></span> 100% ${state.lang === 'uk' ? 'Світло' : 'Power'}`;
      }
      coachTip.innerHTML = state.lang === 'uk'
        ? `🟢 <strong>МІСТО ПОВНІСТЮ ЗІ СВІТЛОМ (100%)!</strong> Усі 50.00 Гц у нормі. Генерація (${state.generator.activePowerMW.toFixed(0)} МВт) покриває місто (${state.grid.demandMW.toFixed(0)} МВт). Станція в ідеальному балансі!`
        : `🟢 <strong>CITY IS FULLY POWERED (100%)!</strong> Frequency is locked at 50.00 Hz. Generation (${state.generator.activePowerMW.toFixed(0)} MW) matches city demand (${state.grid.demandMW.toFixed(0)} MW). Perfect equilibrium!`;
    }
  }

  // Оновлення інтерактивного банера аварій
  const alertBox = document.getElementById('alarmBanner');
  if (state.currentEmergency && emergencyGuides[state.lang][state.currentEmergency]) {
    const emrg = emergencyGuides[state.lang][state.currentEmergency];
    alertBox.style.display = 'flex';
    document.getElementById('alarmTitle').textContent = emrg.title;
    document.getElementById('alarmDesc').textContent = emrg.desc;
    document.getElementById('btnAlarmInfo').textContent = dict.btnWhatToDo;
    document.getElementById('btnAlarmQuickFix').textContent = dict.btnQuickFix;
  } else {
    alertBox.style.display = 'none';
  }
}

function applyLanguage(lang) {
  state.lang = lang;
  const dict = i18n[lang];

  document.getElementById('btnLangUA').classList.toggle('active', lang === 'uk');
  document.getElementById('btnLangEN').classList.toggle('active', lang === 'en');

  document.getElementById('appHeaderTitle').innerHTML = dict.appTitle;
  document.getElementById('appHeaderBadge').textContent = dict.appBadge;
  document.getElementById('lblStatusGrid').textContent = dict.statusGrid;
  document.getElementById('lblStatusGen').textContent = dict.statusGen;
  document.getElementById('lblStatusFreq').textContent = dict.statusFreq;
  document.getElementById('lblStatusHead').textContent = dict.statusHead;
  document.getElementById('lblStatusLevel').textContent = dict.statusLevel;
  document.getElementById('lblStatusClock').textContent = dict.statusClock;

  document.getElementById('btnToggleSound').textContent = state.soundEnabled ? dict.soundOn : dict.soundOff;
  document.getElementById('btnOpenTheory').textContent = dict.btnHelp;
  document.getElementById('canvasPanelTitle').innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg> ${dict.canvasTitle}`;
  document.getElementById('lblSpeedBadge').textContent = dict.speedBadge;
  document.getElementById('canvasHintText').textContent = dict.canvasHint;

  document.getElementById('btnAutoTune').textContent = dict.autoTuneBtn;
  document.getElementById('btnToggleInfoBadges').textContent = state.infoBadgesVisible ? dict.infoToggleOn : dict.infoToggleOff;

  const coachTitleEl = document.getElementById('coachTitle');
  if (coachTitleEl) coachTitleEl.textContent = dict.coachTitle || (lang === 'uk' ? 'Помічник Диспетчера ГЕС' : 'Hydro Dispatcher Coach');
  const cityPowerLabelEl = document.getElementById('cityPowerLabel');
  if (cityPowerLabelEl) cityPowerLabelEl.textContent = dict.cityPowerLabel || (lang === 'uk' ? 'Електропостачання міста' : 'City Power Supply');

  const cardTitleLevelEl = document.getElementById('cardTitleLevel');
  if (cardTitleLevelEl) cardTitleLevelEl.textContent = dict.cardLevel;
  const unitWaterLevelEl = document.getElementById('unitWaterLevel');
  if (unitWaterLevelEl) unitWaterLevelEl.textContent = dict.unitM;
  const lblNominalLevelEl = document.getElementById('lblNominalLevel');
  if (lblNominalLevelEl) lblNominalLevelEl.textContent = dict.nominalLevel;

  document.getElementById('cardTitlePower').textContent = dict.cardPower;
  document.getElementById('unitPowerGen').textContent = dict.unitMW;
  document.getElementById('cardSubPower1').textContent = dict.subPower;

  document.getElementById('cardTitleDemand').textContent = dict.cardDemand;
  document.getElementById('unitGridDemand').textContent = dict.unitMW;
  document.getElementById('cardSubDemand1').textContent = dict.subDemand;

  document.getElementById('cardTitleFlow').textContent = dict.cardFlow;
  document.getElementById('unitFlowTurbine').textContent = dict.unitM3s;

  document.getElementById('cardTitleRpm').textContent = dict.cardRpm;
  document.getElementById('unitTurbineRpm').textContent = dict.unitRpm;
  document.getElementById('cardSubRpm1').textContent = dict.subNominalRpm;
  document.getElementById('cardSubRpm2').textContent = dict.subPoles;

  document.getElementById('cardTitleHead').textContent = dict.cardHead;
  document.getElementById('unitHeadNet').textContent = dict.unitM;

  document.getElementById('cardTitleEnergy').textContent = dict.cardEnergy;
  document.getElementById('unitTotalEnergy').textContent = dict.unitMWh;

  document.getElementById('chartTitle1').textContent = dict.chart1Title;
  document.getElementById('legendGen').textContent = dict.legendGen;
  document.getElementById('legendLoad').textContent = dict.legendLoad;
  document.getElementById('chartTitle2').textContent = dict.chart2Title;
  document.getElementById('legendFlow').textContent = dict.legendFlow;
  document.getElementById('legendFreq').textContent = dict.legendFreq;

  document.getElementById('secTitleHydraulics').textContent = dict.secHydraulics;
  document.getElementById('labelSliderGate').textContent = dict.labelSliderGate;
  document.getElementById('labelSliderInflow').textContent = dict.labelSliderInflow;
  document.getElementById('labelSliderSpillway').textContent = dict.labelSliderSpillway;
  document.getElementById('labelWeather').textContent = dict.labelWeather;
  document.getElementById('btnWeatherSunny').textContent = dict.weatherSunny;
  document.getElementById('btnWeatherRain').textContent = dict.weatherRain;
  document.getElementById('btnWeatherStorm').textContent = dict.weatherStorm;
  document.getElementById('btnWeatherFlood').textContent = dict.weatherFlood;
  document.getElementById('btnWeatherDrought').textContent = dict.weatherDrought;

  document.getElementById('secTitleTurbine').textContent = dict.secTurbine;
  document.getElementById('labelTurbineType').textContent = dict.labelTurbineType;
  document.getElementById('btnTurbineFrancis').textContent = dict.turbineFrancis;
  document.getElementById('btnTurbineKaplan').textContent = dict.turbineKaplan;
  document.getElementById('btnTurbinePelton').textContent = dict.turbinePelton;
  document.getElementById('labelSliderVanes').textContent = dict.labelSliderVanes;

  document.getElementById('secTitleGrid').textContent = dict.secGrid;
  document.getElementById('labelSliderDemand').textContent = dict.labelSliderDemand;
  document.getElementById('labelAutoGovernor').textContent = dict.labelAutoGovernor;
  document.getElementById('btnEmergencyStop').textContent = dict.btnEmergencyStop;
  document.getElementById('btnResetSystem').textContent = dict.btnResetSystem;

  document.getElementById('scenTitleSandbox').textContent = dict.scenTitleSandbox;
  document.getElementById('scenDescSandbox').textContent = dict.scenDescSandbox;
  document.getElementById('scenTitleFlood').textContent = dict.scenTitleFlood;
  document.getElementById('scenDescFlood').textContent = dict.scenDescFlood;
  document.getElementById('scenTitlePeak').textContent = dict.scenTitlePeak;
  document.getElementById('scenDescPeak').textContent = dict.scenDescPeak;
  document.getElementById('scenTitleBlackout').textContent = dict.scenTitleBlackout;
  document.getElementById('scenDescBlackout').textContent = dict.scenDescBlackout;
  document.getElementById('scenTitleDrought').textContent = dict.scenTitleDrought;
  document.getElementById('scenDescDrought').textContent = dict.scenDescDrought;

  document.getElementById('modalHeaderTitle').textContent = dict.modalTitle;
  document.getElementById('sliderInfoPurposeLbl').textContent = dict.sliderInfoPurposeLbl;
  document.getElementById('sliderInfoImpactLbl').textContent = dict.sliderInfoImpactLbl;
  document.getElementById('sliderInfoOptimumLbl').textContent = dict.sliderInfoOptimumLbl;
  document.getElementById('btnGotSliderInfo').textContent = dict.btnGotIt;
  document.getElementById('btnCloseModalBottom').textContent = dict.btnClose;
  document.getElementById('btnCloseEmergencyBottom').textContent = dict.btnClose;

  renderTheoryModalContent(lang);
}

function renderTheoryModalContent(lang) {
  const container = document.getElementById('modalTheoryBody');
  if (lang === 'uk') {
    container.innerHTML = `
      <h4>1. Основна формула гідроенергетики</h4>
      <div class="formula-box">P = η_total · ρ · g · Q · H_net [Вт]<br>P [МВт] ≈ η_total · 9.81 · Q [м³/с] · H [м] / 1000</div>
      <h4>2. Регулювання частоти 50.00 Гц</h4>
      <div class="formula-box">f = (p · n) / 60 [Гц]</div>
      <h4>3. Повний покроковий гайд оператора</h4>
      <div class="guide-step-card"><h5>🕹️ Крок 1. Автоналаштування</h5><p>Натисніть <strong>"🎯 Автоналаштування та Скид"</strong> для миттєвого балансування.</p></div>
      <div class="guide-step-card"><h5>🌊 Крок 2. Баланс води</h5><p>Приплив = Витрата турбіни + Скид. При паводку відкривайте холостий водоскид.</p></div>
      <div class="guide-step-card"><h5>⚡ Крок 3. Регулювання 50.00 Гц</h5><p>Увімкніть AGC або вручну підлаштуйте лопатки напрямного апарату під навантаження.</p></div>
      <div class="guide-step-card"><h5>ℹ️ Крок 4. Підказки (i)</h5><p>Натискайте кнопки (i) біля кожного повзунка для перегляду призначення та оптимальних налаштувань.</p></div>
      <div class="guide-step-card"><h5>🚨 Крок 5. Ліквідація аварій</h5><p>При появі банера аварії натисніть <strong>"ℹ️ Що робити?"</strong> для перегляду покрокового посібника або <strong>"⚡ Виправити"</strong> для негайної ліквідації.</p></div>
    `;
  } else {
    container.innerHTML = `
      <h4>1. Fundamental Hydro Power Physics</h4>
      <div class="formula-box">P = η_total · ρ · g · Q · H_net [W]<br>P [MW] ≈ η_total · 9.81 · Q [m³/s] · H [m] / 1000</div>
      <h4>2. 50.00 Hz Frequency Governing</h4>
      <div class="formula-box">f = (p · n) / 60 [Hz]</div>
      <h4>3. Complete Step-by-Step Operator Guide</h4>
      <div class="guide-step-card"><h5>🕹️ Step 1. Auto-Tuning</h5><p>Click <strong>"🎯 Auto-Tune & Reset"</strong> to instantly balance the station.</p></div>
      <div class="guide-step-card"><h5>🌊 Step 2. Water Balance</h5><p>Inflow = Turbine flow + Spillway. Open spillway gates during floods.</p></div>
      <div class="guide-step-card"><h5>⚡ Step 3. 50.00 Hz Regulation</h5><p>Enable AGC or adjust wicket gates manually to track city load.</p></div>
      <div class="guide-step-card"><h5>ℹ️ Step 4. Slider Hints (i)</h5><p>Click the (i) badge next to any slider for purpose and optimum range.</p></div>
      <div class="guide-step-card"><h5>🚨 Step 5. Emergency Resolution</h5><p>When an alarm banner appears, click <strong>"ℹ️ What to do?"</strong> for steps or <strong>"⚡ Quick Fix"</strong> to resolve immediately.</p></div>
    `;
  }
}

// -------------------------------------------------------------
// 8. ВІДКРИТТЯ ІНСТРУКЦІЇ ТА ЛІКВІДАЦІЯ АВАРІЇ
// -------------------------------------------------------------
function showEmergencyTroubleshooting() {
  if (!state.currentEmergency) return;
  const dict = i18n[state.lang];
  const emrg = emergencyGuides[state.lang][state.currentEmergency];
  if (!emrg) return;

  const modal = document.getElementById('emergencyModal');
  document.getElementById('emrgModalTitle').textContent = emrg.title;

  let stepsHtml = emrg.steps.map((s, idx) => `<li><strong>${idx + 1}.</strong> ${s}</li>`).join('');

  document.getElementById('emergencyModalBody').innerHTML = `
    <div class="emergency-info-section danger">
      <h4>${dict.lblCause}</h4>
      <p>${emrg.cause}</p>
    </div>
    <div class="emergency-info-section">
      <h4>${dict.lblRisks}</h4>
      <p>${emrg.risks}</p>
    </div>
    <div class="emergency-info-section steps">
      <h4>${dict.lblSteps}</h4>
      <ol class="emergency-step-list">
        ${stepsHtml}
      </ol>
    </div>
  `;

  document.getElementById('btnEmergencyFixNow').textContent = emrg.fixLabel || dict.btnFixNow;
  modal.classList.add('show');
  audio.playClick();
}

function executeEmergencyFix() {
  if (!state.currentEmergency) return;
  const emrg = emergencyGuides[state.lang][state.currentEmergency];
  if (emrg && emrg.action) {
    emrg.action(state);
    audio.playChime();
  }
  document.getElementById('emergencyModal').classList.remove('show');
}

function autoTuneSystem() {
  audio.init();
  audio.playChime();

  const mId = state.mission && state.mission.active ? state.mission.id : (state.activeScenario || 'sandbox');

  if (mId === 'flood') {
    state.reservoir.targetInflow = 1250.0;
    state.reservoir.weather = 'flood';
    state.spillway.targetGateOpen = 0.78;
    state.spillway.gateOpen = 0.78;
    state.penstock.targetGateOpen = 0.85;
    state.penstock.gateOpen = 0.85;
    state.turbine.targetGuideVanes = 0.85;
    state.turbine.guideVanes = 0.85;
    state.turbine.cavitation = false;
    state.penstock.trashRackClog = 0.0;
    state.grid.targetDemandMW = 180.0;
    state.grid.demandMW = 180.0;
    state.grid.autoGovernor = true;
    state.grid.blackout = false;
    state.generator.frequency = 50.00;
    document.getElementById('sliderSpillway').value = 78;
    document.getElementById('sliderGate').value = 85;
    document.getElementById('sliderVanes').value = 85;
    document.getElementById('sliderDemand').value = 180;
  } else if (mId === 'peak_demand') {
    state.penstock.targetGateOpen = 0.95;
    state.penstock.gateOpen = 0.95;
    state.turbine.targetGuideVanes = 0.92;
    state.turbine.guideVanes = 0.92;
    state.grid.targetDemandMW = 320.0;
    state.grid.demandMW = 320.0;
    state.turbine.cavitation = false;
    state.penstock.trashRackClog = 0.0;
    state.grid.autoGovernor = true;
    state.grid.blackout = false;
    state.generator.frequency = 50.00;
    document.getElementById('sliderGate').value = 95;
    document.getElementById('sliderVanes').value = 92;
    document.getElementById('sliderDemand').value = 320;
  } else if (mId === 'blackout_drill') {
    state.penstock.targetGateOpen = 0.75;
    state.penstock.gateOpen = 0.75;
    state.turbine.targetGuideVanes = 0.72;
    state.turbine.guideVanes = 0.72;
    state.turbine.rpm = 150.0;
    state.turbine.cavitation = false;
    state.penstock.trashRackClog = 0.0;
    state.grid.targetDemandMW = 140.0;
    state.grid.demandMW = 140.0;
    state.grid.autoGovernor = true;
    state.grid.blackout = false;
    state.generator.frequency = 50.00;
    document.getElementById('sliderGate').value = 75;
    document.getElementById('sliderVanes').value = 72;
    document.getElementById('sliderDemand').value = 140;
  } else if (mId === 'drought') {
    state.reservoir.targetInflow = 35.0;
    state.reservoir.weather = 'drought';
    state.spillway.targetGateOpen = 0.0;
    state.spillway.gateOpen = 0.0;
    state.penstock.targetGateOpen = 0.55;
    state.penstock.gateOpen = 0.55;
    state.turbine.targetGuideVanes = 0.42;
    state.turbine.guideVanes = 0.42;
    state.grid.targetDemandMW = 65.0;
    state.grid.demandMW = 65.0;
    state.turbine.cavitation = false;
    state.penstock.trashRackClog = 0.0;
    state.grid.autoGovernor = true;
    state.grid.blackout = false;
    state.generator.frequency = 50.00;
    document.getElementById('sliderSpillway').value = 0;
    document.getElementById('sliderGate').value = 55;
    document.getElementById('sliderVanes').value = 42;
    document.getElementById('sliderDemand').value = 65;
  } else {
    // Sandbox
    state.reservoir.waterLevel = 75.0;
    state.reservoir.targetInflow = 220.0;
    state.reservoir.inflow = 220.0;
    state.reservoir.weather = 'sunny';
    state.penstock.targetGateOpen = 0.70;
    state.penstock.gateOpen = 0.70;
    state.penstock.trashRackClog = 0.0;
    state.spillway.targetGateOpen = 0.0;
    state.spillway.gateOpen = 0.0;
    state.turbine.type = 'francis';
    state.turbine.targetGuideVanes = 0.72;
    state.turbine.guideVanes = 0.72;
    state.turbine.cavitation = false;
    state.grid.targetDemandMW = 140.0;
    state.grid.demandMW = 140.0;
    state.grid.autoGovernor = true;
    state.grid.blackout = false;
    state.generator.frequency = 50.00;
    document.getElementById('sliderGate').value = 70;
    document.getElementById('sliderInflow').value = 220;
    document.getElementById('sliderSpillway').value = 0;
    document.getElementById('sliderVanes').value = 72;
    document.getElementById('sliderDemand').value = 140;
    document.querySelectorAll('.scenario-card').forEach(b => b.classList.remove('active'));
    document.querySelector('.scenario-card[data-scenario="sandbox"]')?.classList.add('active');
  }

  document.getElementById('toggleAutoGovernor').checked = state.grid.autoGovernor;
  state.currentEmergency = null;
}

// -------------------------------------------------------------
// 9. ОБРОБНИКИ ПОДІЙ
// -------------------------------------------------------------
function setupEventListeners() {
  document.getElementById('btnLangUA').addEventListener('click', () => { applyLanguage('uk'); audio.playClick(); });
  document.getElementById('btnLangEN').addEventListener('click', () => { applyLanguage('en'); audio.playClick(); });

  // Кнопки банера аварії
  document.getElementById('btnAlarmInfo').addEventListener('click', () => { showEmergencyTroubleshooting(); });
  document.getElementById('btnAlarmQuickFix').addEventListener('click', () => { executeEmergencyFix(); });
  document.getElementById('btnEmergencyFixNow').addEventListener('click', () => { executeEmergencyFix(); });
  document.getElementById('btnCloseEmergencyModal').addEventListener('click', () => document.getElementById('emergencyModal').classList.remove('show'));
  document.getElementById('btnCloseEmergencyBottom').addEventListener('click', () => document.getElementById('emergencyModal').classList.remove('show'));

  // Тогл підказок
  const btnToggleBadges = document.getElementById('btnToggleInfoBadges');
  btnToggleBadges.addEventListener('click', () => {
    state.infoBadgesVisible = !state.infoBadgesVisible;
    document.body.classList.toggle('hide-info-badges', !state.infoBadgesVisible);
    const dict = i18n[state.lang];
    btnToggleBadges.textContent = state.infoBadgesVisible ? dict.infoToggleOn : dict.infoToggleOff;
    btnToggleBadges.classList.toggle('active', state.infoBadgesVisible);
    audio.playClick();
  });

  document.getElementById('btnAutoTune').addEventListener('click', () => autoTuneSystem());

  // Slider info popups
  const sliderModal = document.getElementById('sliderInfoModal');
  document.querySelectorAll('.info-circle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const info = i18n[state.lang].sliderInfos[btn.dataset.sliderInfo];
      if (info) {
        document.getElementById('sliderInfoTitle').textContent = info.title;
        document.getElementById('sliderInfoPurpose').textContent = info.purpose;
        document.getElementById('sliderInfoImpact').textContent = info.impact;
        document.getElementById('sliderInfoOptimum').textContent = info.optimum;
        sliderModal.classList.add('show');
        audio.playClick();
      }
    });
  });

  document.getElementById('btnCloseSliderInfo').addEventListener('click', () => sliderModal.classList.remove('show'));
  document.getElementById('btnGotSliderInfo').addEventListener('click', () => sliderModal.classList.remove('show'));

  // Sliders
  document.getElementById('sliderGate').addEventListener('input', (e) => {
    state.penstock.targetGateOpen = parseFloat(e.target.value) / 100;
    audio.init(); audio.playClick();
  });
  document.getElementById('sliderInflow').addEventListener('input', (e) => {
    state.reservoir.targetInflow = parseFloat(e.target.value);
    audio.init();
  });
  document.getElementById('sliderSpillway').addEventListener('input', (e) => {
    state.spillway.targetGateOpen = parseFloat(e.target.value) / 100;
    audio.init(); audio.playClick();
  });
  document.getElementById('sliderVanes').addEventListener('input', (e) => {
    state.turbine.targetGuideVanes = parseFloat(e.target.value) / 100;
    audio.init(); audio.playClick();
  });
  document.getElementById('sliderDemand').addEventListener('input', (e) => {
    state.grid.targetDemandMW = parseFloat(e.target.value);
    audio.init();
  });

  document.getElementById('toggleAutoGovernor').addEventListener('change', (e) => {
    state.grid.autoGovernor = e.target.checked;
    audio.init(); audio.playClick();
  });

  const toggleSound = document.getElementById('btnToggleSound');
  toggleSound.addEventListener('click', () => {
    audio.init();
    state.soundEnabled = !state.soundEnabled;
    toggleSound.innerHTML = state.soundEnabled ? i18n[state.lang].soundOn : i18n[state.lang].soundOff;
    toggleSound.className = state.soundEnabled ? 'btn btn-primary' : 'btn';
  });

  document.getElementById('btnEmergencyStop').addEventListener('click', () => {
    state.penstock.targetGateOpen = 0; state.turbine.targetGuideVanes = 0;
    document.getElementById('sliderGate').value = 0; document.getElementById('sliderVanes').value = 0;
    audio.playAlarm();
  });

  document.getElementById('btnResetSystem').addEventListener('click', () => {
    state.grid.blackout = false; state.generator.frequency = 50.00;
    state.penstock.targetGateOpen = 0.70; state.turbine.targetGuideVanes = 0.72;
    document.getElementById('sliderGate').value = 70; document.getElementById('sliderVanes').value = 72;
    audio.playChime();
  });

  document.querySelectorAll('.turbine-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.turbine-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.turbine.type = btn.dataset.type;
      audio.playClick();
    });
  });

  document.querySelectorAll('.weather-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.weather-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const w = btn.dataset.weather;
      state.reservoir.weather = w;
      if (w === 'sunny') state.reservoir.targetInflow = 220;
      if (w === 'rain') state.reservoir.targetInflow = 450;
      if (w === 'storm') state.reservoir.targetInflow = 750;
      if (w === 'flood') state.reservoir.targetInflow = 1150;
      if (w === 'drought') state.reservoir.targetInflow = 40;
      document.getElementById('sliderInflow').value = state.reservoir.targetInflow;
      audio.playClick();
    });
  });

  document.querySelectorAll('.scenario-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.scenario-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      loadScenario(card.dataset.scenario);
      audio.playClick();
    });
  });

  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.simSpeed = parseFloat(btn.dataset.speed);
      audio.playClick();
    });
  });

  const tooltip = document.getElementById('infoTooltip');
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const w = rect.width, h = rect.height;

    let found = null;
    hotspotsConfig.forEach(hs => {
      if (Math.hypot(x - hs.xRatio * w, y - hs.yRatio * h) < hs.radius + 6) found = hs;
    });

    state.activeHotspot = found ? found.id : null;
    if (found) {
      const info = i18n[state.lang].hotspots[found.id];
      tooltip.style.display = 'block';
      tooltip.style.left = `${Math.min(w - 260, x + 15)}px`;
      tooltip.style.top = `${Math.min(h - 90, y + 15)}px`;
      tooltip.innerHTML = `<h4>🔍 ${info.name}</h4><p>${info.info}</p>`;
    } else {
      tooltip.style.display = 'none';
    }
  });

  canvas.addEventListener('mouseleave', () => {
    state.activeHotspot = null;
    tooltip.style.display = 'none';
  });

  const modal = document.getElementById('theoryModal');
  document.getElementById('btnOpenTheory').addEventListener('click', () => { modal.classList.add('show'); audio.playClick(); });
  document.getElementById('btnCloseModal').addEventListener('click', () => modal.classList.remove('show'));
  document.getElementById('btnCloseModalBottom').addEventListener('click', () => modal.classList.remove('show'));

}

function loadScenario(type) {
  state.activeScenario = type;
  const badgeEl = document.getElementById('coachMissionBadge');

  if (type === 'sandbox') {
    state.mission = {
      id: 'sandbox',
      active: false,
      timer: 0,
      goalSeconds: 8.0,
      won: false
    };
    state.reservoir.targetInflow = 220;
    state.reservoir.weather = 'sunny';
    state.grid.targetDemandMW = 140;
    state.penstock.targetGateOpen = 0.70;
    state.turbine.targetGuideVanes = 0.72;
    state.spillway.targetGateOpen = 0.0;
    state.spillway.gateOpen = 0.0;
    state.grid.autoGovernor = true;
    state.grid.blackout = false;
    state.generator.frequency = 50.00;

    document.querySelectorAll('.weather-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.weather === 'sunny');
    });
    if (badgeEl) badgeEl.textContent = state.lang === 'uk' ? '🎯 Вільне Регулювання' : '🎯 Free Sandbox';
  } else if (type === 'flood') {
    // Місія 1: Захист від Паводку (85 м)
    state.reservoir.waterLevel = 85.0;
    state.reservoir.inflow = 980;
    state.reservoir.targetInflow = 980;
    state.reservoir.weather = 'flood';
    state.spillway.gateOpen = 0.0;
    state.spillway.targetGateOpen = 0.0;
    state.penstock.targetGateOpen = 0.85;
    state.turbine.targetGuideVanes = 0.85;
    state.grid.targetDemandMW = 180;
    state.grid.autoGovernor = true;
    state.grid.blackout = false;
    state.generator.frequency = 50.00;
    state.mission = {
      id: 'flood',
      active: true,
      timer: 0,
      goalSeconds: 8.0,
      won: false,
      startedAtLevel: 85.0,
      targetLevel: 82.0
    };
    audio.playAlarm();

    document.querySelectorAll('.weather-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.weather === 'flood');
    });
    if (badgeEl) badgeEl.textContent = state.lang === 'uk' ? '🌊 1. Захист від Паводку (85 м)' : '🌊 1. Flood Defense (85m)';
  } else if (type === 'peak_demand') {
    // Місія 2: Вечірній Пік Міста (320 МВт)
    state.reservoir.waterLevel = 76.0;
    state.reservoir.inflow = 380;
    state.reservoir.targetInflow = 380;
    state.reservoir.weather = 'rain';
    state.spillway.gateOpen = 0.0;
    state.spillway.targetGateOpen = 0.0;
    state.penstock.targetGateOpen = 0.50;
    state.turbine.targetGuideVanes = 0.50;
    state.grid.targetDemandMW = 320;
    state.grid.autoGovernor = false;
    state.grid.blackout = false;
    state.generator.frequency = 48.20;
    state.mission = {
      id: 'peak_demand',
      active: true,
      timer: 0,
      goalSeconds: 8.0,
      won: false
    };
    audio.playAlarm();

    document.querySelectorAll('.weather-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.weather === 'rain');
    });
    if (badgeEl) badgeEl.textContent = state.lang === 'uk' ? '⚡ 2. Вечірній Пік (320 МВт)' : '⚡ 2. Peak Demand (320 MW)';
  } else if (type === 'blackout_drill') {
    // Місія 3: Блекаут & Відновлення Системи
    state.reservoir.waterLevel = 75.0;
    state.reservoir.inflow = 220;
    state.reservoir.targetInflow = 220;
    state.reservoir.weather = 'storm';
    state.spillway.gateOpen = 0.0;
    state.spillway.targetGateOpen = 0.0;
    state.penstock.targetGateOpen = 0.0;
    state.turbine.targetGuideVanes = 0.0;
    state.turbine.rpm = 0.0;
    state.grid.targetDemandMW = 140;
    state.grid.demandMW = 140;
    state.grid.autoGovernor = false;
    state.grid.blackout = true;
    state.generator.frequency = 0.0;
    state.mission = {
      id: 'blackout_drill',
      active: true,
      timer: 0,
      goalSeconds: 8.0,
      won: false
    };
    audio.playAlarm();

    document.querySelectorAll('.weather-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.weather === 'storm');
    });
    if (badgeEl) badgeEl.textContent = state.lang === 'uk' ? '🚨 3. Блекаут & Пуск' : '🚨 3. Blackout Recovery';
  } else if (type === 'drought') {
    // Місія 4: Економія Води при Посусі
    state.reservoir.waterLevel = 58.0;
    state.reservoir.inflow = 35;
    state.reservoir.targetInflow = 35;
    state.reservoir.weather = 'drought';
    state.spillway.gateOpen = 0.25;
    state.spillway.targetGateOpen = 0.25;
    state.penstock.targetGateOpen = 0.85;
    state.turbine.targetGuideVanes = 0.85;
    state.grid.targetDemandMW = 180;
    state.grid.demandMW = 180;
    state.grid.autoGovernor = false;
    state.grid.blackout = false;
    state.generator.frequency = 49.50;
    state.mission = {
      id: 'drought',
      active: true,
      timer: 0,
      goalSeconds: 8.0,
      won: false
    };
    audio.playAlarm();

    document.querySelectorAll('.weather-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.weather === 'drought');
    });
    if (badgeEl) badgeEl.textContent = state.lang === 'uk' ? '🏜️ 4. Економія при Посусі' : '🏜️ 4. Drought Conservation';
  }

  document.getElementById('sliderGate').value = Math.round(state.penstock.targetGateOpen * 100);
  document.getElementById('sliderInflow').value = Math.round(state.reservoir.targetInflow);
  document.getElementById('sliderSpillway').value = Math.round(state.spillway.targetGateOpen * 100);
  document.getElementById('sliderVanes').value = Math.round(state.turbine.targetGuideVanes * 100);
  document.getElementById('sliderDemand').value = Math.round(state.grid.targetDemandMW);
  document.getElementById('toggleAutoGovernor').checked = state.grid.autoGovernor;
}

// -------------------------------------------------------------
// 10. ГОЛОВНИЙ ЦИКЛ СИМУЛЯЦІЇ (60 FPS)
// -------------------------------------------------------------
let lastTimestamp = performance.now();

function mainLoop(timestamp) {
  const dt = Math.min(0.1, (timestamp - lastTimestamp) / 1000);
  lastTimestamp = timestamp;

  if (state.running) {
    updatePhysics(dt);
    audio.update(state);
  }

  const rect = canvas.getBoundingClientRect();
  drawStationCrossSection(rect.width, rect.height);
  drawTurbineDetailView();
  drawCharts();
  updateUI();

  requestAnimationFrame(mainLoop);
}

window.addEventListener('DOMContentLoaded', () => {
  initParticles();
  resizeCanvas();
  setupEventListeners();
  applyLanguage('uk');
  requestAnimationFrame(mainLoop);
});

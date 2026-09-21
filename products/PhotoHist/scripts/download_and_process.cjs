const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { downloadUrl, resolveCommonsImageUrl, resolveUkWikiImageUrl } = require('./download_assets.cjs');

const targets = [
  // 1. Кирило Розумовський
  { id: 'kyrylo_rozumovsky', commons: 'File:Kyrylo Rozumovsky (Engraved portrait, 1762, Georg Friedrich Schmidt) 3.jpg' },
  { id: 'kyrylo_rozumovsky_alt', commons: 'File:Kyrylo Rozumovsky (Portrait, 1766, Pompeo Batoni).jpg' },
  // 2. Ісмаїл Гаспринський
  { id: 'ismail_gasprinsky', commons: 'File:Ismail Gasprinskiy.jpg' },
  { id: 'ismail_gasprinsky_alt', commons: 'File:Ismail Gaspirali 3.jpg' },
  // 3. Агатангел Кримський
  { id: 'ahatanhel_krymsky', commons: 'File:Ahatanhel Krymsky (1871-1942).jpg' },
  { id: 'ahatanhel_krymsky_alt', commons: 'File:Agatangel Krymskyi.jpg' },
  // 4. Микола Міхновський
  { id: 'mykola_mikhnovsky', commons: 'File:Mihnovsky.jpg' },
  { id: 'mykola_mikhnovsky_alt', commons: 'File:Микола Міхновський 1.jpg' },
  // 5. Дмитро Вітовський
  { id: 'dmytro_vitovsky', commons: 'File:Vitovsky Dmytro.jpg' },
  { id: 'dmytro_vitovsky_alt', commons: 'File:Pamjatnyk Vitovskomu.jpg' },
  // 6. Християн Раковський
  { id: 'khrystyian_rakovsky', commons: 'File:Christian Rakovsky 1920s.jpg' },
  { id: 'khrystyian_rakovsky_alt', commons: 'File:Christian Rakovsky 1924.jpg' },
  // 7. Микола Скрипник
  { id: 'mykola_skrypnyk', commons: 'File:Скрипник Микола.jpg' },
  { id: 'mykola_skrypnyk_alt', commons: 'File:Skrypnyk Mykola.jpg' },
  // 8. Михайло Волобуєв
  { id: 'mykhailo_volobuyev', ukwiki: 'Файл:Volobuiev Artemov M.jpg' },
  // 9. Ярослав Стецько
  { id: 'yaroslav_stetsko', commons: 'File:Stecko.jpg' },
  { id: 'yaroslav_stetsko_alt', commons: 'File:Yaroslav Stetsko - Taiwan.png' },
  // 10. Іван Кожедуб
  { id: 'ivan_kozhedub', commons: 'File:Ivan Kozhedub 3.jpg' },
  { id: 'ivan_kozhedub_alt', commons: 'File:Ivan Kozhedub young.jpg' },
  // 11. Олексій Берест
  { id: 'oleksiy_berest', commons: 'File:Alexei Berest.jpg' },
  // 12. Кузьма Дерев'янко
  { id: 'kuzma_derevyanko', commons: 'File:Derevyanko signing 1945.jpg' },
  { id: 'kuzma_derevyanko_alt', commons: 'File:Lieutenant General Kuzma Derevyanko at the Japanese Surrender at Tokyo Bay, 2 September 1945 A30429 (cropped).jpg' },
  // 13. Йосип Сліпий
  { id: 'yosyf_slipyj', commons: 'File:Cardinal Josyp Slipyj.jpg' },
  { id: 'yosyf_slipyj_alt', commons: 'File:Rector of the Lviv Theological Academy o.doktor Josyf Slipyj..jpg' },
  // 14. Василь Симоненко
  { id: 'vasyl_symonenko', commons: 'File:Symoneneko Vasyl`.jpg' },
  { id: 'vasyl_symonenko_alt', commons: 'File:Stamp of Ukraine s1421 (cropped).jpg' },
  // 15. Микола Руденко
  { id: 'mykola_rudenko', commons: 'File:Mykola Rudenko close-up (cropped).jpg' },
  { id: 'mykola_rudenko_alt', commons: 'File:Post convert-2010 Rudenko (cropped).jpg' },
  // 16. Петро Григоренко
  { id: 'petro_hryhorenko', commons: 'File:Petro Hryhorenko (Ogród Sprawiedliwych w Warszawie).jpg' },
  { id: 'petro_hryhorenko_alt', commons: 'File:Coin of Ukraine Hryhorenko r.jpg' },
  // 17. Володимир Івасюк
  { id: 'volodymyr_ivasyuk', commons: 'File:Володимир Михайлович Івасюк.jpg' },
  { id: 'volodymyr_ivasyuk_alt', commons: 'File:Volodymyr Ivasyuk 08.jpg' },
  // Стус додаткові
  { id: 'vasyl_stus_young', ukwiki: 'Файл:Stus (before 1960ies).jpg' },
  { id: 'vasyl_stus_kgb', commons: 'File:Stus KGB photo 1980.jpg' }
];

(async () => {
  const figuresDir = path.join(process.cwd(), 'images/figures');
  const publicDir = path.join(process.cwd(), 'public/images/figures');
  if (!fs.existsSync(figuresDir)) fs.mkdirSync(figuresDir, { recursive: true });
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  console.log('Downloading', targets.length, 'images...');
  for (const t of targets) {
    const dest = path.join(figuresDir, `${t.id}.jpg`);
    let url = null;
    if (t.commons) url = await resolveCommonsImageUrl(t.commons);
    if (!url && t.ukwiki) url = await resolveUkWikiImageUrl(t.ukwiki);

    if (url) {
      try {
        await downloadUrl(url, dest);
        console.log(`Downloaded ${t.id} (${fs.statSync(dest).size} bytes)`);
      } catch(e) {
        console.error(`Error downloading ${t.id}:`, e.message);
      }
    } else {
      console.warn(`No URL for ${t.id}`);
    }
  }

  // Обробка пам'ятника Данилу Галицькому:
  // Маємо images/figures/danylo_romanovych_alt1.jpg (958x716)
  // Створюємо:
  // 1) danylo_romanovych_monument_closeup.jpg - великий чіткий план самого пам'ятника на площі
  // 2) danylo_romanovych_king_closeup.jpg - великий портретний план самого короля Данила на коні у короні
  try {
    const srcAlt = path.join(figuresDir, 'danylo_romanovych_alt1.jpg');
    if (fs.existsSync(srcAlt)) {
      // Крупний план самого пам'ятника (кроп по центру, де монумент займає 90% площі кадру)
      // Original 958x716: монумент розташований x=340..660, y=140..580
      const closeup1 = path.join(figuresDir, 'danylo_romanovych_monument_closeup.jpg');
      execSync(`convert "${srcAlt}" -crop 460x520+290+120 +repage -resize 650x735 -sharpen 0x1.0 "${closeup1}"`);
      console.log('Created danylo_romanovych_monument_closeup.jpg');

      // Крупний план фігури та обличчя короля у короні
      const closeup2 = path.join(figuresDir, 'danylo_romanovych_king_closeup.jpg');
      execSync(`convert "${srcAlt}" -crop 280x300+370+130 +repage -resize 560x600 -sharpen 0x1.2 "${closeup2}"`);
      console.log('Created danylo_romanovych_king_closeup.jpg');
    }
  } catch(err) {
    console.error('Error cropping Danylo monument:', err.message);
  }

  // Синхронізуємо все у public/images/figures
  execSync('cp -r images/figures/* public/images/figures/');
  console.log('All images synchronized to public/images/figures/');
})();

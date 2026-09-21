const { resolveCommonsImageUrl, resolveUkWikiImageUrl } = require('./download_assets.cjs');

const targets = [
  // Розумовський
  { id: 'kyrylo_rozumovsky', commons: 'File:Kyrylo Rozumovsky (Engraved portrait, 1762, Georg Friedrich Schmidt) 3.jpg' },
  { id: 'kyrylo_rozumovsky_alt', commons: 'File:Kyrylo Rozumovsky (Portrait, 1766, Pompeo Batoni).jpg' },
  // Гаспринський
  { id: 'ismail_gasprinsky', commons: 'File:Ismail Gasprinskiy.jpg' },
  { id: 'ismail_gasprinsky_alt', commons: 'File:Ismail Gaspirali 3.jpg' },
  // Кримський
  { id: 'ahatanhel_krymsky', commons: 'File:Ahatanhel Krymsky (1871-1942).jpg' },
  { id: 'ahatanhel_krymsky_alt', commons: 'File:Agatangel Krymskyi.jpg' },
  // Міхновський
  { id: 'mykola_mikhnovsky', commons: 'File:Mihnovsky.jpg' },
  { id: 'mykola_mikhnovsky_alt', commons: 'File:Микола Міхновський 1.jpg' },
  // Вітовський
  { id: 'dmytro_vitovsky', commons: 'File:Vitovsky Dmytro.jpg' },
  { id: 'dmytro_vitovsky_alt', commons: 'File:Pamjatnyk Vitovskomu.jpg' },
  // Раковський
  { id: 'khrystyian_rakovsky', commons: 'File:Christian Rakovsky 1920s.jpg' },
  { id: 'khrystyian_rakovsky_alt', commons: 'File:Christian Rakovsky 1924.jpg' },
  // Скрипник
  { id: 'mykola_skrypnyk', commons: 'File:Скрипник Микола.jpg' },
  { id: 'mykola_skrypnyk_alt', commons: 'File:Skrypnyk Mykola.jpg' },
  // Волобуєв
  { id: 'mykhailo_volobuyev', ukwiki: 'Файл:Volobuiev Artemov M.jpg' },
  // Стецько
  { id: 'yaroslav_stetsko', commons: 'File:Stecko.jpg' },
  { id: 'yaroslav_stetsko_alt', commons: 'File:Yaroslav Stetsko - Taiwan.png' },
  // Кожедуб
  { id: 'ivan_kozhedub', commons: 'File:Ivan Kozhedub 3.jpg' },
  { id: 'ivan_kozhedub_alt', commons: 'File:Ivan Kozhedub young.jpg' },
  // Берест
  { id: 'oleksiy_berest', commons: 'File:Alexei Berest.jpg' },
  // Дерев'янко
  { id: 'kuzma_derevyanko', commons: 'File:Derevyanko signing 1945.jpg' },
  { id: 'kuzma_derevyanko_alt', commons: 'File:Lieutenant General Kuzma Derevyanko at the Japanese Surrender at Tokyo Bay, 2 September 1945 A30429 (cropped).jpg' },
  // Йосип Сліпий
  { id: 'yosyf_slipyj', commons: 'File:Cardinal Josyp Slipyj.jpg' },
  { id: 'yosyf_slipyj_alt', commons: 'File:Rector of the Lviv Theological Academy o.doktor Josyf Slipyj..jpg' },
  // Симоненко
  { id: 'vasyl_symonenko', commons: 'File:Symoneneko Vasyl`.jpg' },
  { id: 'vasyl_symonenko_alt', commons: 'File:Stamp of Ukraine s1421 (cropped).jpg' },
  // Руденко
  { id: 'mykola_rudenko', commons: 'File:Mykola Rudenko close-up (cropped).jpg' },
  { id: 'mykola_rudenko_alt', commons: 'File:Post convert-2010 Rudenko (cropped).jpg' },
  // Григоренко
  { id: 'petro_hryhorenko', commons: 'File:Petro Hryhorenko (Ogród Sprawiedliwych w Warszawie).jpg' },
  { id: 'petro_hryhorenko_alt', commons: 'File:Coin of Ukraine Hryhorenko r.jpg' },
  // Івасюк
  { id: 'volodymyr_ivasyuk', commons: 'File:Володимир Михайлович Івасюк.jpg' },
  { id: 'volodymyr_ivasyuk_alt', commons: 'File:Volodymyr Ivasyuk 08.jpg' },
  // Стус додаткові
  { id: 'vasyl_stus_young', ukwiki: 'Файл:Stus (before 1960ies).jpg' },
  { id: 'vasyl_stus_alt2', commons: 'File:Stus KGB photo 1980.jpg' }
];

(async () => {
  for (const t of targets) {
    let url = null;
    if (t.commons) url = await resolveCommonsImageUrl(t.commons);
    if (!url && t.ukwiki) url = await resolveUkWikiImageUrl(t.ukwiki);
    console.log(t.id, '->', url ? 'OK: ' + url.substring(0, 60) : 'FAILED');
  }
})();

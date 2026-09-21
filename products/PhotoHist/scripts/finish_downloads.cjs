const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { downloadUrl, resolveCommonsImageUrl, resolveUkWikiImageUrl } = require('./download_assets.cjs');

const targets = [
  { id: 'vasyl_symonenko_alt', commons: 'File:Stamp of Ukraine s1421 (cropped).jpg' },
  { id: 'mykola_rudenko', commons: 'File:Mykola Rudenko close-up (cropped).jpg' },
  { id: 'yosyf_slipyj_alt', commons: 'File:Rector of the Lviv Theological Academy o.doktor Josyf Slipyj..jpg' },
  { id: 'vasyl_stus_kgb', commons: 'File:Stus KGB photo 1980.jpg' }
];

(async () => {
  const figuresDir = path.join(process.cwd(), 'images/figures');
  for (const t of targets) {
    const dest = path.join(figuresDir, `${t.id}.jpg`);
    if (!fs.existsSync(dest) || fs.statSync(dest).size === 0) {
      const url = await resolveCommonsImageUrl(t.commons);
      if (url) {
        await downloadUrl(url, dest);
        console.log('Downloaded missing:', t.id);
      }
    }
  }
  execSync('cp -r images/figures/* public/images/figures/');
  console.log('Sync complete');
})();

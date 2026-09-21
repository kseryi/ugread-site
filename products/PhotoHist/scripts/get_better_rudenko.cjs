const { downloadUrl, resolveCommonsImageUrl } = require('./download_assets.cjs');
const fs = require('fs');

(async () => {
  const url = await resolveCommonsImageUrl('File:Mykola Rudenko.jpg', 800);
  console.log('Rudenko main:', url);
  if (url) {
    await downloadUrl(url, 'images/figures/mykola_rudenko.jpg');
    console.log('Updated mykola_rudenko.jpg:', fs.statSync('images/figures/mykola_rudenko.jpg').size);
  }
  const stampUrl = await resolveCommonsImageUrl('File:Mykola Rudenko 2020 stamp of Ukraine.jpg', 800);
  console.log('Rudenko stamp:', stampUrl);
  if (stampUrl) {
    await downloadUrl(stampUrl, 'images/figures/mykola_rudenko_stamp.jpg');
    console.log('Downloaded stamp:', fs.statSync('images/figures/mykola_rudenko_stamp.jpg').size);
  }
  const { execSync } = require('child_process');
  execSync('cp -r images/figures/* public/images/figures/');
})();

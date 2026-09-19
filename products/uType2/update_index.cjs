const fs = require('fs');
const path = require('path');

const index = { ua: {}, en: {} };

for (const lang of ['ua', 'en']) {
  const langDir = path.join(__dirname, 'classes', lang);
  if (!fs.existsSync(langDir)) continue;

  const gradeDirs = fs.readdirSync(langDir).filter(d => {
    return fs.statSync(path.join(langDir, d)).isDirectory() && !isNaN(parseInt(d, 10));
  });

  gradeDirs.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  for (const grade of gradeDirs) {
    const gradePath = path.join(langDir, grade);
    const files = fs.readdirSync(gradePath).filter(f => f.startsWith('lesson') && f.endsWith('.json'));

    files.sort((a, b) => {
      const numA = parseInt(a.replace('lesson', '').replace('.json', ''), 10);
      const numB = parseInt(b.replace('lesson', '').replace('.json', ''), 10);
      return numA - numB;
    });

    index[lang][grade] = files.map(f => {
      const filePath = path.join(gradePath, f);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const id = f.replace('.json', '');
      return {
        id: id,
        title: content.title || id,
        file: 'classes/' + lang + '/' + grade + '/' + f
      };
    });
  }
}

fs.writeFileSync('index.json', JSON.stringify(index, null, 2), 'utf8');

// Синхронізуємо в public/
fs.mkdirSync(path.join(__dirname, 'public'), { recursive: true });
fs.copyFileSync('index.json', path.join(__dirname, 'public', 'index.json'));

console.log('UA grade 1 lessons count:', index.ua['1'].length);
console.log('EN grade 1 lessons count:', index.en['1'].length);
console.log('Total UA lessons:', Object.values(index.ua).reduce((a, b) => a + b.length, 0));
console.log('Total EN lessons:', Object.values(index.en).reduce((a, b) => a + b.length, 0));

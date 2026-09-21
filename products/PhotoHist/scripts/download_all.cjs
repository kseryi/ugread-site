const fs = require('fs');
const path = require('path');
const https = require('https');

const figuresMapping = [
  { id: 'sviatoslav', title: 'Святослав Ігорович' },
  { id: 'volodymyr_great', title: 'Володимир Святославич' },
  { id: 'yaroslav_mudryi', title: 'Ярослав Мудрий' },
  { id: 'volodymyr_monomakh', title: 'Володимир Мономах' },
  { id: 'roman_mstyslavych', title: 'Роман Мстиславич' },
  { id: 'danylo_romanovych', title: 'Данило Романович' },
  { id: 'lev_danylovych', title: 'Лев Данилович' },
  { id: 'vasyl_ostrozkyi', title: 'Василь-Костянтин Острозький' },
  { id: 'petro_sahaidachnyi', title: 'Петро Конашевич-Сагайдачний' },
  { id: 'petro_mohyla', title: 'Петро Могила' },
  { id: 'bohdan_khmelnytskyi', title: 'Богдан Хмельницький' },
  { id: 'ivan_vyhovskyi', title: 'Іван Виговський' },
  { id: 'yurii_khmelnytskyi', title: 'Юрій Хмельницький' },
  { id: 'petro_doroshenko', title: 'Петро Дорошенко' },
  { id: 'ivan_mazepa', title: 'Іван Мазепа' },
  { id: 'pylyp_orlyk', title: 'Пилип Орлик' },
  { id: 'ivan_sirko', title: 'Іван Сірко' },
  { id: 'feofan_prokopovych', title: 'Феофан (Прокопович)' },
  { id: 'hryhorii_skovoroda', title: 'Сковорода Григорій Савич' },
  { id: 'ivan_kotliarevskyi', title: 'Котляревський Іван Петрович' },
  { id: 'taras_shevchenko', title: 'Шевченко Тарас Григорович' },
  { id: 'mykola_kostomarov', title: 'Костомаров Микола Іванович' },
  { id: 'panteleimon_kulish', title: 'Куліш Пантелеймон Олександрович' },
  { id: 'markiian_shashkevych', title: 'Маркіян Шашкевич' },
  { id: 'volodymyr_antonovych', title: 'Антонович Володимир Боніфатійович' },
  { id: 'mykhailo_drahomanov', title: 'Драгоманов Михайло Петрович' },
  { id: 'pavlo_chubynskyi', title: 'Чубинський Павло Платонович' },
  { id: 'mykola_lysenko', title: 'Лисенко Микола Віталійович' },
  { id: 'ivan_franko', title: 'Франко Іван Якович' },
  { id: 'lesia_ukrainka', title: 'Леся Українка' },
  { id: 'mykhailo_hrushevskyi', title: 'Грушевський Михайло Сергійович' },
  { id: 'volodymyr_vynnychenko', title: 'Винниченко Володимир Кирилович' },
  { id: 'symon_petliura', title: 'Петлюра Симон Васильович' },
  { id: 'pavlo_skoropadskyi', title: 'Скоропадський Павло Петрович' },
  { id: 'yevhen_petrushevych', title: 'Петрушевич Євген Омелянович' },
  { id: 'nestor_makhno', title: 'Нестор Махно' },
  { id: 'andrei_sheptytskyi', title: 'Андрей (Шептицький)' },
  { id: 'oleksandr_dovzhenko', title: 'Довженко Олександр Петрович' },
  { id: 'yevhen_konovalets', title: 'Коновалець Євген Михайлович' },
  { id: 'avgustyn_voloshyn', title: 'Августин (Волошин)' },
  { id: 'stepan_bandera', title: 'Бандера Степан Андрійович' },
  { id: 'roman_shukhevych', title: 'Шухевич Роман Йосипович' },
  { id: 'vasyl_stus', title: 'Стус Василь Семенович' },
  { id: 'viacheslav_chornovil', title: 'Чорновіл В\'ячеслав Максимович' },
  { id: 'levko_lukianenko', title: 'Лук\'яненко Левко Григорович' },
  { id: 'ivan_dziuba', title: 'Дзюба Іван Михайлович' },
  { id: 'mustafa_dzhemilev', title: 'Мустафа Джемілєв' },
  { id: 'leonid_kravchuk', title: 'Кравчук Леонід Макарович' },
  { id: 'leonid_kuchma', title: 'Кучма Леонід Данилович' },
  { id: 'viktor_yushchenko', title: 'Ющенко Віктор Андрійович' },
  { id: 'lubomyr_huzar', title: 'Любомир (Гузар)' }
];

const USER_AGENT = 'HistoryZNOApp/1.0 (study@historyzno.org)';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': USER_AGENT } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': USER_AGENT } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status code ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function run() {
  const targetDir = path.join(__dirname, '../images/figures');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  console.log(`Starting download for ${figuresMapping.length} figures...`);

  for (let i = 0; i < figuresMapping.length; i++) {
    const item = figuresMapping[i];
    const destFile = path.join(targetDir, `${item.id}.jpg`);

    if (fs.existsSync(destFile) && fs.statSync(destFile).size > 5000) {
      console.log(`[${i+1}/${figuresMapping.length}] ${item.id} already exists (${fs.statSync(destFile).size} bytes). Skipping.`);
      continue;
    }

    try {
      const apiUrl = `https://uk.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(item.title)}&prop=pageimages&format=json&pithumbsize=600`;
      const data = await fetchJson(apiUrl);
      const pages = data.query && data.query.pages ? data.query.pages : {};
      const pageKey = Object.keys(pages)[0];
      const page = pages[pageKey];

      if (page && page.thumbnail && page.thumbnail.source) {
        let imgUrl = page.thumbnail.source;
        // If thumb.wikimedia.org has query params, keep or clean
        console.log(`[${i+1}/${figuresMapping.length}] Downloading ${item.id} from ${imgUrl.split('?')[0]}...`);
        await downloadFile(imgUrl, destFile);
        const size = fs.statSync(destFile).size;
        console.log(`  -> Saved ${item.id}.jpg (${size} bytes)`);
      } else {
        console.warn(`[${i+1}/${figuresMapping.length}] No thumbnail found for ${item.title} (${item.id})`);
      }
    } catch (err) {
      console.error(`[${i+1}/${figuresMapping.length}] Error for ${item.id}:`, err.message);
    }

    await sleep(250); // Be polite to Wikipedia API
  }

  console.log('All downloads completed!');
}

run();

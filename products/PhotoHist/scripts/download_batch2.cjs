const fs = require('fs');
const path = require('path');
const https = require('https');

const USER_AGENT = 'HistoryZNOApp/1.0 (study@historyzno.org)';

const BATCH2 = [
  { id: 'danylo_romanovych_alt1', figureId: 'danylo_romanovych', title: 'File:Danylo halytskyi monument.jpg', type: 'Монумент (ЗНО)', label: 'Пам\'ятник королю Данилу Галицькому у Львові (2001 р., В. Ярич, Р. Романович)', caption: 'Монументальна кінна скульптура першого короля Русі на площі Галицькій у Львові. Відображає коронацію 1253 року в Дорогичині.' },
  { id: 'hryhorii_skovoroda_alt1', figureId: 'hryhorii_skovoroda', title: 'File:500 hryvnia 2006 front.jpg', type: 'Банкнота НБУ', label: 'Григорій Сковорода на банкноті 500 гривень (з фонтаном «Нерівна всім рівність»)', caption: 'Портрет мандрівного філософа на банкноті 500 гривень із його знаменитим алегоричним малюнком божественного фонтану.' },
  { id: 'mykhailo_hrushevskyi_alt1', figureId: 'mykhailo_hrushevskyi', title: 'File:50 hryvnia 2004 front.jpg', type: 'Банкнота НБУ', label: 'Михайло Грушевський на банкноті 50 гривень', caption: 'Голова Української Центральної Ради 1917–1918 рр. на тлі Будинку Вчителя (Педагогічного музею), де засідала Центральна Рада.' },
  { id: 'pavlo_skoropadskyi_alt1', figureId: 'pavlo_skoropadskyi', title: 'File:Hetman Skoropadsky and Kaiser Wilhelm.JPG', type: 'Історичне фото (ЗНО)', label: 'Гетьман Павло Скоропадський та кайзер Вільгельм II (1918 р.)', caption: 'Історична хроніка доби Української Держави (Гетьманату 1918 р.). Свідчення зовнішньополітичних зв\'язків гетьманського уряду з країнами Четверного союзу.' },
  { id: 'nestor_makhno_alt1', figureId: 'nestor_makhno', title: 'File:NestorMakhno.jpeg', type: 'Історичне фото', label: 'Нестор Махно у папасі серед бійців Революційної повстанської армії (1919 р.)', caption: 'Колоритний фотопортрет «батька Махна» на південноукраїнських фронтах Громадянської війни та визвольних змагань.' },
  { id: 'andrei_sheptytskyi_alt1', figureId: 'andrei_sheptytskyi', title: 'File:Andriy sheptytskyi.jpg', type: 'Офіційний портрет', label: 'Митрополит Андрей Шептицький у патріаршому облаченні', caption: 'Один із найвеличніших духовних і моральних провідників України XX століття, митрополит УГКЦ, покровитель культури та освіти Галичини.' },
  { id: 'petro_mohyla_alt1', figureId: 'petro_mohyla', title: 'File:Mohyla Petro.jpg', type: 'Історична гравюра', label: 'Митрополит Петро Могила (гравюра з гербом Могил)', caption: 'Видатний церковний та культурний діяч, архімандрит Києво-Печерської лаври, засновник Києво-Могилянської колегії (1632 р.).' },
  { id: 'levko_lukianenko_alt1', figureId: 'levko_lukianenko', title: 'File:Levko Lukyanenko.JPG', type: 'Історичне фото', label: 'Левко Лук\'яненко на урочистостях відновлення Незалежності', caption: 'Співавтор Акта проголошення незалежності України 24 серпня 1991 р., засновник Української робітничо-селянської спілки (УРСС 1959 р.).' },
  { id: 'stepan_bandera_alt1', figureId: 'stepan_bandera', title: 'File:SBandera.jpg', type: 'Історичне фото (ЗНО)', label: 'Степан Бандера — студентське/судове фото (1930-ті рр.)', caption: 'Фото Степана Бандери періоду Варшавського та Львівського судових процесів ОУН 1935–1936 років. Дуже часто з\'являється у тестах ЗНО.' },
  { id: 'roman_shukhevych_alt1', figureId: 'roman_shukhevych', title: 'File:Roman Shukhevych.jpg', type: 'Історичне фото (ЗНО)', label: 'Роман Шухевич (Тарас Чупринка) у військовому строї УПА', caption: 'Головний командир УПА, голова Генерального секретаріату УГВР. Офіційне фото генерала-хорунжого Тараса Чупринки.' },
  { id: 'vasyl_stus_alt1', figureId: 'vasyl_stus', title: 'File:Stus KGB photo 1980 (cropped).jpg', type: 'Судове фото КДБ (ЗНО)', label: 'Василь Стус — табірне фото КДБ (1980 р.)', caption: 'Трагічний і незламний погляд великого поета-політв\'язня після другого арешту радянським КДБ 1980 року. Одне з найвідоміших фото теми дисидентського руху.' }
];

async function resolveUrl(title) {
  const api = 'https://commons.wikimedia.org/w/api.php?action=query&titles=' + encodeURIComponent(title) + '&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json';
  return new Promise(r => {
    https.get(api, { headers: { 'User-Agent': USER_AGENT } }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(d);
          const p = Object.values(json.query.pages)[0];
          r(p.imageinfo ? (p.imageinfo[0].thumburl || p.imageinfo[0].url) : null);
        } catch(e) { r(null); }
      });
    });
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': USER_AGENT } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => { stream.close(); resolve(); });
    }).on('error', reject);
  });
}

(async () => {
  for (const item of BATCH2) {
    const dest = path.join('images/figures', item.id + '.jpg');
    console.log(`Resolving ${item.title}...`);
    const directUrl = await resolveUrl(item.title);
    if (!directUrl) {
      console.log(`  Failed to resolve ${item.title}`);
      continue;
    }
    console.log(`  Downloading ${item.id} from ${directUrl.substring(0, 50)}...`);
    try {
      await download(directUrl, dest);
      const stat = fs.statSync(dest);
      console.log(`  -> Saved ${item.id}.jpg (${stat.size} bytes)`);
    } catch(e) {
      console.log(`  -> Error:`, e.message);
    }
  }
  console.log('Batch 2 finished.');
})();

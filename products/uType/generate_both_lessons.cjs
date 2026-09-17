const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const uaDir = path.join(rootDir, 'lessons-ua');
const enDir = path.join(rootDir, 'lessons-en');

fs.mkdirSync(uaDir, { recursive: true });
fs.mkdirSync(enDir, { recursive: true });

// Переносимо/копіюємо вже готові українські уроки з lessons в lessons-ua
const oldLessonsDir = path.join(rootDir, 'lessons');
if (fs.existsSync(oldLessonsDir)) {
  const files = fs.readdirSync(oldLessonsDir);
  files.forEach(f => {
    fs.copyFileSync(path.join(oldLessonsDir, f), path.join(uaDir, f));
  });
}

// 40 класичних англійських уроків для сліпого набору (QWERTY touch typing methodology)
const enLessons = [
  // ── STAGE 1: HOME ROW (INDEX & BASE FINGERS) ──
  {
    num: 1,
    title: "Lesson 01: Base Anchor Keys — F and J",
    text: "ff jj ff jj fj jf ff jj fj jf fjf jfj fff jjj fj jf jf fj fjj jff ffff jjjj fj fj jf jf",
    words: ["fj", "jf", "ff", "jj", "fjf"]
  },
  {
    num: 2,
    title: "Lesson 02: Home Row — D and K (Middle fingers)",
    text: "dd kk dd kk dk kd dd kk dk kd fd jk df kj kd fk dkk kdd fdk jkd kdf jdf ddd kkk",
    words: ["dk", "kd", "fd", "jk", "df"]
  },
  {
    num: 3,
    title: "Lesson 03: Home Row — S and L (Ring fingers)",
    text: "ss ll ss ll sl ls sf lj sd lk fs jl ask all fall sad lad flask salsa skill salad lass",
    words: ["ask", "all", "fall", "sad", "salad"]
  },
  {
    num: 4,
    title: "Lesson 04: Home Row — A and ; (Pinky fingers)",
    text: "aa ;; aa ;; a; ;a as ;l ad ;k af ;j a; alas fall flask salad jak glad alfa salsa",
    words: ["alas", "fall", "flask", "glad", "salad"]
  },
  {
    num: 5,
    title: "Lesson 05: Home Row Center — G and H (Index reach)",
    text: "gg hh gg hh gh hg fg jh gf hj had has half hall glad flag flash dash hash glass flash",
    words: ["had", "has", "half", "hall", "flag"]
  },
  {
    num: 6,
    title: "Lesson 06: Full Home Row Master Drill",
    text: "asdf jkl; asdf jkl; a s d f g h j k l ; flash shall glass salad flags kafka alfalfa",
    words: ["flash", "shall", "glass", "salad", "flags"]
  },

  // ── STAGE 2: TOP ROW KEYS ──
  {
    num: 7,
    title: "Lesson 07: Top Row — R and U (Index fingers)",
    text: "rr uu rr uu ru ur fr ju rf uj fur run jar rug far fur red rug jar fur radar user rush",
    words: ["fur", "run", "jar", "rug", "user"]
  },
  {
    num: 8,
    title: "Lesson 08: Top Row — E and I (Middle fingers)",
    text: "ee ii ee ii ei ie de ki ed ik see sea feed fill side life like fire file idea kid ride",
    words: ["see", "side", "life", "like", "fire"]
  },
  {
    num: 9,
    title: "Lesson 09: Top Row — W and O (Ring fingers)",
    text: "ww oo ww oo wo ow sw lo ws ol low slow wolf wood word work food good look book world",
    words: ["slow", "wolf", "wood", "word", "world"]
  },
  {
    num: 10,
    title: "Lesson 10: Top Row — Q and P (Pinky fingers)",
    text: "qq pp qq pp qp pq aq ;p qa p; quit page plan park play keep drop pull push quick quad",
    words: ["quit", "page", "plan", "play", "quick"]
  },
  {
    num: 11,
    title: "Lesson 11: Top Row Center — T and Y (Index reach)",
    text: "tt yy tt yy ty yt ft jy tf yj the they that this time year yet type city tree stay fly",
    words: ["they", "that", "this", "time", "year"]
  },
  {
    num: 12,
    title: "Lesson 12: Combined Home and Top Rows Drill",
    text: "qwerty uiop qwerty uiop write quiet people yesterday today water street report letter",
    words: ["write", "quiet", "people", "water", "street"]
  },

  // ── STAGE 3: BOTTOM ROW KEYS ──
  {
    num: 13,
    title: "Lesson 13: Bottom Row — V and M (Index fingers)",
    text: "vv mm vv mm vm mv fv jm vf mj view move save room make home live wave mail film calm",
    words: ["view", "move", "save", "room", "make"]
  },
  {
    num: 14,
    title: "Lesson 14: Bottom Row — C and , (Middle fingers)",
    text: "cc ,, cc ,, c, ,c dc k, cd ,k cat cold face car, ice, race, came city nice card cloud",
    words: ["cold", "face", "city", "nice", "cloud"]
  },
  {
    num: 15,
    title: "Lesson 15: Bottom Row — X and . (Ring fingers)",
    text: "xx .. xx .. x. .x sx l. xs .l box. fox. mix six next taxi text. exam axis relax pixel.",
    words: ["next", "taxi", "relax", "pixel", "exam"]
  },
  {
    num: 16,
    title: "Lesson 16: Bottom Row — Z and / (Pinky fingers)",
    text: "zz // zz // z/ /z az ;/ za /; zoo zero size zone maze jazz zoom lazy zip freeze zeal",
    words: ["zero", "size", "zone", "maze", "jazz"]
  },
  {
    num: 17,
    title: "Lesson 17: Bottom Row Center — B and N (Index reach)",
    text: "bb nn bb nn bn nb fb jn bf nj bean bone burn bank brown blue open learn night sun bin",
    words: ["bean", "bone", "bank", "brown", "night"]
  },
  {
    num: 18,
    title: "Lesson 18: Full Alphabet Across All Three Rows",
    text: "zxcvbnm zxcv bnm quick brown fox jumps over the lazy dog pack my box with five dozen",
    words: ["quick", "brown", "jumps", "dozen", "liquor"]
  },

  // ── STAGE 4: PUNCTUATION AND SPECIAL KEYS ──
  {
    num: 19,
    title: "Lesson 19: Punctuation — Period (.) and Comma (,)",
    text: "a. b. c. sun, moon, stars. day, night, sky. rain, wind, fire. cats, dogs, birds fly.",
    words: ["stars", "night", "wind", "birds", "fire"]
  },
  {
    num: 20,
    title: "Lesson 20: Punctuation — Apostrophe (') and Quotes (\")",
    text: "it's that's let's don't can't won't he said \"hello\" she answered \"welcome home friend\"",
    words: ["don't", "can't", "won't", "friend", "welcome"]
  },
  {
    num: 21,
    title: "Lesson 21: Question Mark (?) and Exclamation (!)",
    text: "who? what? where? when? why? how! stop! look! listen! are you ready? yes, let us go!",
    words: ["where", "ready", "listen", "welcome", "happy"]
  },
  {
    num: 22,
    title: "Lesson 22: Colon (:), Semicolon (;), and Hyphen (-)",
    text: "time: now; ready-to-go; step-by-step; notice: work hard; follow rules: be kind and true.",
    words: ["ready", "notice", "follow", "rules", "kind"]
  },

  // ── STAGE 5: SHIFT KEY & CAPITALIZATION ──
  {
    num: 23,
    title: "Lesson 23: Shift Keys — Left & Right Hand Capitals",
    text: "Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz",
    words: ["America", "London", "Paris", "Tokyo", "Kyiv"]
  },
  {
    num: 24,
    title: "Lesson 24: Proper Nouns and Cities (Capitalization)",
    text: "Kyiv London Paris New York Tokyo Sydney Toronto Berlin Rome Madrid Warsaw Vienna Prague",
    words: ["Kyiv", "London", "Berlin", "Tokyo", "Madrid"]
  },
  {
    num: 25,
    title: "Lesson 25: Names and Titles (Shift practice)",
    text: "Alice Bob Charlie David Emma Frank Grace Henry Ivy Jack Kate Leo Mia Noah Olivia Peter",
    words: ["Charlie", "David", "Grace", "Henry", "Olivia"]
  },

  // ── STAGE 6: NUMBERS (NUMBER ROW 0..9) ──
  {
    num: 26,
    title: "Lesson 26: Number Row Left Hand — 1, 2, 3, 4, 5",
    text: "1 2 3 4 5 12 23 34 45 54 43 32 21 11 22 33 44 55 123 234 345 543 211 1 room 2 keys 5 cats",
    words: ["room", "keys", "cats", "number", "level"]
  },
  {
    num: 27,
    title: "Lesson 27: Number Row Right Hand — 6, 7, 8, 9, 0",
    text: "6 7 8 9 0 67 78 89 90 09 87 76 66 77 88 99 00 678 789 890 100 200 500 year 2024 page 90",
    words: ["year", "page", "speed", "score", "total"]
  },
  {
    num: 28,
    title: "Lesson 28: Complete Number Row 0..9",
    text: "1 2 3 4 5 6 7 8 9 0 10 25 50 75 100 365 days 24 hours 60 minutes 100 percent speed",
    words: ["days", "hours", "minutes", "percent", "speed"]
  },

  // ── STAGE 7: FREQUENT DIGRAPHS & COMMON PATTERNS ──
  {
    num: 29,
    title: "Lesson 29: Common Bigrams — TH, ER, ON, AN",
    text: "the there them other another weather person season wonder condition action planet plant",
    words: ["there", "weather", "person", "wonder", "planet"]
  },
  {
    num: 30,
    title: "Lesson 30: Common Bigrams — IN, ED, TE, ES",
    text: "inside interest pointed started limited tested wishes houses notes creates writes shines",
    words: ["inside", "interest", "started", "limited", "creates"]
  },
  {
    num: 31,
    title: "Lesson 31: Common Trigrams — ION, ENT, FOR, TIO",
    text: "action nation mention silent moment movement distant forest forward uniform question station",
    words: ["action", "nation", "moment", "forest", "question"]
  },
  {
    num: 32,
    title: "Lesson 32: Double Letter Words Drill",
    text: "coffee green little letter middle summer apple yellow bottle rubber copper address success",
    words: ["coffee", "little", "letter", "middle", "summer"]
  },

  // ── STAGE 8: SPEED, RHYTHM & CONNECTED TEXT ──
  {
    num: 33,
    title: "Lesson 33: Short High-Frequency Words",
    text: "the and for are but not you all any can had her was one our out day get has him his how",
    words: ["about", "could", "would", "their", "which"]
  },
  {
    num: 34,
    title: "Lesson 34: Rhythm and Flow — Sentences 1",
    text: "The sun shines bright over the blue sea. A soft summer breeze dances through green trees.",
    words: ["shines", "bright", "summer", "breeze", "dances"]
  },
  {
    num: 35,
    title: "Lesson 35: Nature and Life — Sentences 2",
    text: "Birds sing sweet songs in the early morning. River water flows fast down the rocky hill.",
    words: ["morning", "spring", "water", "flows", "sweet"]
  },
  {
    num: 36,
    title: "Lesson 36: Technology and Coding — Sentences 3",
    text: "Computers help us solve complex problems, write clean code, and explore new digital worlds.",
    words: ["computer", "complex", "problems", "explore", "digital"]
  },
  {
    num: 37,
    title: "Lesson 37: Wisdom and Proverbs",
    text: "Practice makes perfect. A journey of a thousand miles begins with a single confident step.",
    words: ["practice", "perfect", "journey", "thousand", "confident"]
  },
  {
    num: 38,
    title: "Lesson 38: Dialogue and Direct Quotes",
    text: "The teacher asked: \"Who is ready to type?\" The students replied: \"We are ready and fast!\"",
    words: ["teacher", "students", "replied", "ready", "keyboard"]
  },
  {
    num: 39,
    title: "Lesson 39: Complete Keyboard Pangram & Numbers",
    text: "The quick brown fox jumps over 12 lazy dogs near 5 quiet rivers! \"Keep typing!\" he shouted.",
    words: ["quick", "jumps", "rivers", "typing", "shouted"]
  },
  {
    num: 40,
    title: "Lesson 40: Touch Typing Master Graduation",
    text: "Congratulations! You have mastered touch typing across all keys, numbers, and symbols without looking!",
    words: ["Congratulations", "mastered", "typing", "symbols", "looking"]
  }
];

// Записуємо англійські уроки
const enIndex = [];
enLessons.forEach(l => {
  const fileName = `lesson${l.num}.json`;
  const filePath = path.join(enDir, fileName);
  const data = {
    title: l.title,
    text: l.text,
    words: l.words
  };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  enIndex.push({
    id: `classic_en_${l.num}`,
    num: l.num,
    title: l.title,
    file: `lessons-en/${fileName}`
  });
});

fs.writeFileSync(path.join(enDir, 'index.json'), JSON.stringify(enIndex, null, 2), 'utf8');

// Додатковий README для lessons-en
const enReadme = `# Classic Touch Typing Lessons (English - QWERTY)

This directory contains ${enLessons.length} structured classical touch typing lessons from home-row anchor keys to complete speed tests.

## Stages:
1. Lessons 1–6: Home Row (F, J, D, K, S, L, A, ;, G, H)
2. Lessons 7–12: Top Row (R, U, E, I, W, O, Q, P, T, Y)
3. Lessons 13–18: Bottom Row (V, M, C, ,, X, ., Z, /, B, N)
4. Lessons 19–22: Punctuation (., ,, ', \", ?, !, :, ;, -)
5. Lessons 23–25: Shift & Capitalization
6. Lessons 26–28: Numbers 0–9
7. Lessons 29–32: Digraphs, trigrams & double letters
8. Lessons 33–40: Real sentences, wisdom, dialogue & graduation test
`;
fs.writeFileSync(path.join(enDir, 'README.md'), enReadme, 'utf8');

// Оновлюємо index.json для lessons-ua з правильними шляхами lessons-ua/
const uaFiles = fs.readdirSync(uaDir).filter(f => f.startsWith('lesson') && f.endsWith('.json'));
const uaIndex = [];
uaFiles.sort((a, b) => {
  const na = parseInt(a.replace('lesson', '').replace('.json', ''), 10);
  const nb = parseInt(b.replace('lesson', '').replace('.json', ''), 10);
  return na - nb;
}).forEach(f => {
  const content = JSON.parse(fs.readFileSync(path.join(uaDir, f), 'utf8'));
  const num = parseInt(f.replace('lesson', '').replace('.json', ''), 10);
  uaIndex.push({
    id: `classic_ua_${num}`,
    num: num,
    title: content.title,
    file: `lessons-ua/${f}`
  });
});
fs.writeFileSync(path.join(uaDir, 'index.json'), JSON.stringify(uaIndex, null, 2), 'utf8');

console.log(`Generated ${enLessons.length} lessons in lessons-en and verified ${uaIndex.length} lessons in lessons-ua`);

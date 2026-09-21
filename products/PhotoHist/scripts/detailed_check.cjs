const fs = require('fs');
const vm = require('vm');

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('data.js', 'utf8'), sandbox);
const appFigures = sandbox.window.HISTORICAL_FIGURES;

console.log("=== СПИСОК ВСІХ ПОСТАТЕЙ У ДОДАТКУ (Всього: " + appFigures.length + ") ===");
appFigures.forEach((f, idx) => {
  console.log(`${idx + 1}. [${f.period}] ${f.name}`);
});

// --- Константи і дані кольорів ---
const ionicOpacity = 0.2;
const bondColor = 0x888888;
const bondRadiusIonic = 0.1;
const bondRadiusCovalent = 0.05;
const bondOffsetAmount = 0.15; // синхронізовано зі старим кодом

const elementColors = {
  H: 0xFFFFFF, He: 0xD9FFFF, Li: 0xCC80FF, Be: 0xC2FF00,
  B: 0xFFB5B5, C: 0x909090, N: 0x3050F8, O: 0xFF0D0D,
  F: 0x90E050, Ne: 0xB3E3F5, Na: 0xAB5CF2, Mg: 0x8AFF00,
  Al: 0xBFA6A6, Si: 0xF0C8A0, P: 0xFF8000, S: 0xFFFF30,
  Cl: 0x1FF01F, Ar: 0x80D1E3, K: 0x8F40D4, Ca: 0x3DFF00,
  Fe: 0xE06633, Cu: 0xC88033, Zn: 0x7D80B0, Br: 0xA62929,
  I: 0x940094, Ag: 0xC0C0C0, Au: 0xFFD123
};

const elementRadii = {
  H: 0.15, C: 0.25, O: 0.3, N: 0.25, S: 0.35, P: 0.35, Cl: 0.3, Br: 0.3,
  F: 0.25, I: 0.35, He: 0.2, Ne: 0.2, Ar: 0.3, K: 0.4, Na: 0.4, Fe: 0.35
};

let scene, camera, renderer, moleculeGroup;
let atoms = [];
let rotation = 0;
let zoom = 1;

const formulaInput = document.getElementById('formulaInput');
const codeOutput = document.getElementById('codeOutput');
const rotationSlider = document.getElementById('rotationSlider');
const zoomSlider = document.getElementById('zoomSlider');

const subscriptMap = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
};

function formatFormula(formula) {
  return formula.replace(/(\d+)/g, (match) => [...match].map(d => subscriptMap[d] || d).join(''));
}

function initThree() {
  const canvas = document.getElementById('moleculeCanvas');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);

  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  const directional = new THREE.DirectionalLight(0xffffff, 1);
  directional.position.set(1, 1, 1);
  scene.add(ambient, directional);
}

function parseFormulaToAtoms(formula) {
  function parseSegment(segment, multiplier = 1) {
    const elementCounts = {};
    const regex = /([A-Z][a-z]?|\([^\)]+\))(\d*)/g;
    let match;

    while ((match = regex.exec(segment)) !== null) {
      let [_, token, countStr] = match;
      const count = countStr ? parseInt(countStr) : 1;

      if (token.startsWith('(')) {
        const inner = token.slice(1, -1);
        const innerCounts = parseSegment(inner, count * multiplier);
        for (const el in innerCounts) {
          elementCounts[el] = (elementCounts[el] || 0) + innerCounts[el];
        }
      } else {
        elementCounts[token] = (elementCounts[token] || 0) + count * multiplier;
      }
    }

    return elementCounts;
  }

  const atomCounts = parseSegment(formula);
  const list = [];

  for (const [element, count] of Object.entries(atomCounts)) {
    for (let i = 0; i < count; i++) {
      list.push({
        element,
        x: 0, y: 0, z: 0,
        radius: elementRadii[element] || 0.2,
        color: elementColors[element] || 0x888888,
        bondType: '1',
        bondTo: null
      });
    }
  }

  return list;
}

function updateAtomsTable() {
  const tbody = document.querySelector('#atomsTable tbody');
  tbody.innerHTML = '';
  atoms.forEach((atom, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${i}</td>
      <td>${atom.element}</td>
      <td><input type="number" value="${atom.x}" step="0.1" data-idx="${i}" data-prop="x"></td>
      <td><input type="number" value="${atom.y}" step="0.1" data-idx="${i}" data-prop="y"></td>
      <td><input type="number" value="${atom.z}" step="0.1" data-idx="${i}" data-prop="z"></td>
      <td><input type="number" value="${atom.radius}" step="0.01" data-idx="${i}" data-prop="radius"></td>
      <td><input type="color" value="${colorToHex(atom.color)}" data-idx="${i}" data-prop="color"></td>
      <td>
        <select data-idx="${i}" data-prop="bondType">
          <option value="1" ${atom.bondType === "1" ? "selected" : ""}>1</option>
          <option value="2" ${atom.bondType === "2" ? "selected" : ""}>2</option>
          <option value="3" ${atom.bondType === "3" ? "selected" : ""}>3</option>
          <option value="ionic" ${atom.bondType === "ionic" ? "selected" : ""}>іонний</option>
        </select>
      </td>
      <td>
        <select data-idx="${i}" data-prop="bondTo">
          <option value="">---</option>
          ${atoms.map((a, j) => `<option value="${j}" ${atom.bondTo === j ? "selected" : ""}>${j}</option>`).join('')}
        </select>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function updateAtomsFromTable() {
  document.querySelectorAll('#atomsTable input, #atomsTable select').forEach(input => {
    const i = +input.dataset.idx;
    const prop = input.dataset.prop;
    if (prop === "color") atoms[i][prop] = hexToColor(input.value);
    else if (prop === "bondTo") atoms[i][prop] = input.value === "" ? null : +input.value;
    else atoms[i][prop] = isNaN(input.value) ? input.value : parseFloat(input.value);
  });
}

function colorToHex(color) {
  return '#' + color.toString(16).padStart(6, '0');
}

function hexToColor(hex) {
  return parseInt(hex.replace('#', ''), 16);
}

function drawMolecule() {
  if (moleculeGroup) {
    scene.remove(moleculeGroup);
    moleculeGroup.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
  }

  moleculeGroup = new THREE.Group();
  const center = atoms.reduce((acc, a) => {
    acc.x += a.x; acc.y += a.y; acc.z += a.z;
    return acc;
  }, {x:0,y:0,z:0});
  const len = atoms.length;
  const centerVec = new THREE.Vector3(center.x/len, center.y/len, center.z/len);

  atoms.forEach(atom => {
    const geo = new THREE.SphereGeometry(atom.radius, 32, 32);
    const mat = new THREE.MeshPhongMaterial({ color: atom.color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(atom.x, atom.y, atom.z).sub(centerVec);
    moleculeGroup.add(mesh);
  });

  atoms.forEach((atom, i) => {
    if (atom.bondTo != null) {
      const from = new THREE.Vector3(atom.x, atom.y, atom.z).sub(centerVec);
      const to = new THREE.Vector3(atoms[atom.bondTo].x, atoms[atom.bondTo].y, atoms[atom.bondTo].z).sub(centerVec);
      const dir = new THREE.Vector3().subVectors(to, from).normalize();
      const dist = from.distanceTo(to);
      const count = atom.bondType === "ionic" ? 1 : +atom.bondType;
      const radius = atom.bondType === "ionic" ? bondRadiusIonic : bondRadiusCovalent;

      for (let j = 0; j < count; j++) {
        const offset = (j - (count - 1) / 2) * bondOffsetAmount;
        let perp = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 0, 1));
        if (perp.length() < 0.001) perp = new THREE.Vector3(1, 0, 0);
        perp.normalize().multiplyScalar(offset);
        const start = from.clone().add(perp);
        const end = to.clone().add(perp);

        const geometry = new THREE.CylinderGeometry(radius, radius, dist, 16);
        const material = atom.bondType === "ionic"
          ? new THREE.MeshBasicMaterial({ color: bondColor, transparent: true, opacity: ionicOpacity })
          : new THREE.MeshPhongMaterial({ color: bondColor });

        const bond = new THREE.Mesh(geometry, material);
        bond.position.copy(start.clone().add(end).multiplyScalar(0.5));
        bond.lookAt(end);
        bond.rotateX(Math.PI / 2);
        moleculeGroup.add(bond);
      }
    }
  });

  moleculeGroup.rotation.y = rotation * Math.PI / 180;
  moleculeGroup.scale.set(zoom, zoom, zoom);
  scene.add(moleculeGroup);
  renderer.render(scene, camera);
}

function generateCode() {
  const name = (formulaInput.value || 'molecule').replace(/[^A-Za-z0-9]/g, '');
  const atomsCode = atoms.map(a => ({ x: a.x, y: a.y, z: a.z, radius: a.radius, color: a.color }));
  const bonds = atoms.map((a, i) => a.bondTo !== null ? { from: i, to: a.bondTo, type: a.bondType } : null).filter(Boolean);
  return `window.molecules = window.molecules || {};
window.molecules.${name} = ${JSON.stringify({atoms: atomsCode, bonds}, null, 2)};`;
}

function downloadFile(name, content) {
  const blob = new Blob([content], {type: 'application/javascript'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

formulaInput.addEventListener('input', () => {
  const clean = formulaInput.value.replace(/[^a-zA-Z0-9()]/g, '').replace(/([A-Z])([a-z]*)/g, (_, cap, small) => cap + small);
  formulaInput.value = clean;
  atoms = parseFormulaToAtoms(clean);
  document.getElementById('prettyFormula').textContent = formatFormula(formulaInput.value);
  updateAtomsTable();
  drawMolecule();
});

document.querySelector('#atomsTable').addEventListener('input', () => {
  updateAtomsFromTable();
  drawMolecule();
});

document.querySelector('#atomsTable').addEventListener('change', () => {
  updateAtomsFromTable();
  drawMolecule();
});

document.getElementById('downloadBtn').addEventListener('click', () => {
  const code = generateCode();
  const filename = (formulaInput.value.replace(/[^A-Za-z0-9]/g, '') || 'molecule') + '.js';
  downloadFile(filename, code);
  codeOutput.textContent = code;
});

rotationSlider.addEventListener('input', () => {
  rotation = +rotationSlider.value;
  drawMolecule();
});

zoomSlider.addEventListener('input', () => {
  zoom = +zoomSlider.value;
  drawMolecule();
});

window.addEventListener('load', () => {
  initThree();
  atoms = [];
  drawMolecule();
});

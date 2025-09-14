// main.js — Three.js інтеграція та підтримка GLB/JS моделей
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/GLTFLoader.js';

document.addEventListener('DOMContentLoaded', () => {

  const canvas = document.getElementById('threeCanvas');
  const svg = document.getElementById('board');
  if (!canvas || !svg) {
    console.warn('Three.js canvas або SVG не знайдено');
    return;
  }

  // --- Renderer ---
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);

  // --- Scene ---
  const scene = new THREE.Scene();
  scene.background = null;

  // --- Camera ---
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.set(0, 0, 5);

  // --- Controls ---
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // --- Lights ---
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(3, 10, 5);
  scene.add(dir);

  // --- Models storage ---
  const models = new Map();

  // --- Helper: Resize renderer ---
  function resizeRenderer() {
    const rect = svg.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    if (renderer.domElement.width !== width * window.devicePixelRatio || renderer.domElement.height !== height * window.devicePixelRatio) {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    renderer.domElement.style.width = rect.width + 'px';
    renderer.domElement.style.height = rect.height + 'px';
  }

  // --- Project 3D to 2D ---
  function projectToScreen(position) {
    const width = renderer.domElement.width / (window.devicePixelRatio || 1);
    const height = renderer.domElement.height / (window.devicePixelRatio || 1);
    const pos = position.clone();
    pos.project(camera);
    return { x: (pos.x + 1) / 2 * width, y: (-pos.y + 1) / 2 * height };
  }

  // --- Update attached SVG ---
  function updateAttachedSVG() {
    const attached = svg.querySelectorAll('[data-attach]');
    attached.forEach(el => {
      const modelName = el.getAttribute('data-attach');
      const obj = models.get(modelName);
      if (!obj) return;
      const worldPos = new THREE.Vector3();
      obj.getWorldPosition(worldPos);
      const screen = projectToScreen(worldPos);

      let transformStr = `translate(${screen.x} ${screen.y})`;
      if (el.getAttribute('data-rotate') === 'true') {
        const p1 = worldPos.clone();
        const p2 = worldPos.clone().add(new THREE.Vector3(0.3, 0, 0));
        const s1 = projectToScreen(p1);
        const s2 = projectToScreen(p2);
        const angle = Math.atan2(s2.y - s1.y, s2.x - s1.x) * 180 / Math.PI;
        transformStr += ` rotate(${angle})`;
      }
      el.setAttribute('transform', transformStr);
    });
  }

  // --- THREE_APP глобальний API ---
  window.THREE_APP = {
    scene, camera, renderer, controls,
    models,
    addModel(name, obj) {
      models.set(name, obj);
      scene.add(obj);
      return obj;
    },
    removeModel(name) {
      const o = models.get(name);
      if (o) {
        scene.remove(o);
        models.delete(name);
      }
    },
    listModels() {
      return Array.from(models.keys());
    },
    projectToScreen,
    createAttachedSVG(modelName, svgTag = 'g', opts = {}) {
      const el = document.createElementNS('http://www.w3.org/2000/svg', svgTag);
      el.setAttribute('data-attach', modelName);
      if (opts.rotate) el.setAttribute('data-rotate', 'true');

      if (svgTag === 'g') {
        el.innerHTML = `<line x1="0" y1="0" x2="60" y2="0" stroke="#ff0000" stroke-width="2" marker-end="url(#arrow)" />`;
      }

      if (!svg.querySelector('#arrow')) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `<marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#ff0000" /></marker>`;
        svg.appendChild(defs);
      }

      svg.querySelector('#drawLayer').appendChild(el);
      return el;
    },

    // --- Завантаження GLB моделі ---
    async addModelFromGLB(url, name) {
      return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(url,
          gltf => {
            const obj = gltf.scene;
            obj.name = name || 'glb-model';
            this.addModel(obj.name, obj);
            // SVG маркер автоматично
            setTimeout(()=>{ this.createAttachedSVG(obj.name,'g',{rotate:true}); },200);
            resolve(obj);
          },
          xhr => {
            if(xhr.total) console.log(`${(xhr.loaded/xhr.total*100).toFixed(1)}% завантажено`);
          },
          err => reject(err)
        );
      });
    },

    // --- Завантаження JS моделі (функція повертає THREE.Object3D) ---
    addModelFromJS(fn, name) {
      try {
        const obj = fn();
        obj.name = name || 'js-model';
        this.addModel(obj.name, obj);
        setTimeout(()=>{ this.createAttachedSVG(obj.name,'g',{rotate:true}); },200);
        return obj;
      } catch(err) {
        console.error('Помилка при створенні JS моделі:', err);
      }
    }
  };

  // --- Анімація ---
  function animate() {
    resizeRenderer();
    controls.update();
    renderer.render(scene, camera);
    updateAttachedSVG();
    requestAnimationFrame(animate);
  }
  animate();

  // --- Експорт PNG/SVG (як раніше) ---
  window.exportBoardPNG = async function(filename='board.png') {
    const canvas3 = renderer.domElement;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blobSVG = new Blob([svgData], { type:'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blobSVG);
    const img = new Image();
    img.onload = () => {
      const off = document.createElement('canvas');
      off.width = canvas3.width;
      off.height = canvas3.height;
      const ctx = off.getContext('2d');
      ctx.drawImage(canvas3,0,0);
      ctx.drawImage(img,0,0,off.width,off.height);
      off.toBlob(b=>{
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
    };
    img.src = url;
  };

  document.getElementById('downloadPNG')?.addEventListener('click',()=>window.exportBoardPNG('board.png'));
  document.getElementById('downloadSVG')?.addEventListener('click',()=>{
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type:'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'board.svg';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

});

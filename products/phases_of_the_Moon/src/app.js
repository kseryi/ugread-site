/**
 * Offline Astronomical Simulator: Earth-Moon-Sun Dynamics
 * Pure JavaScript + HTML5 Canvas + Three.js + IndexedDB
 * Fully Offline & Autonomous - Zero Node.js Required
 */

(function(global) {
  const THREE = global.THREE || (typeof window !== 'undefined' ? window.THREE : null);

  // Storage API from MoonDB
  const MoonDB = global.MoonDB || (typeof window !== 'undefined' ? window.MoonDB : {}) || {};
  const saveObservation = MoonDB.saveObservation || (async () => null);
  const getObservations = MoonDB.getObservations || (async () => []);
  const deleteObservation = MoonDB.deleteObservation || (async () => true);
  const clearAllObservations = MoonDB.clearAllObservations || (async () => true);
  const saveSetting = MoonDB.saveSetting || (async () => true);
  const getSetting = MoonDB.getSetting || (async (k, d) => d);

  // ==================== CONSTANTS & ASTRONOMY ====================
  const SYNODIC_MONTH = 29.530588; // Mean synodic month (days)
  const SIDEREAL_MONTH = 27.321661; // Orbital period relative to stars
  const EARTH_AXIAL_TILT_DEG = 23.439; // Degrees
  const MOON_INCLINATION_DEG = 5.145; // Degrees to ecliptic
  const EARTH_RADIUS = 40;
  const MOON_RADIUS = 10.9;
  const MOON_ORBIT_RADIUS = 160;
  const SUN_DIST = 1400;

// ==================== PROCEDURAL TEXTURES (100% OFFLINE) ====================
function createEarthCanvasTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Deep Ocean Gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, '#0b1d3a');
  oceanGrad.addColorStop(0.5, '#10356c');
  oceanGrad.addColorStop(1, '#0b1d3a');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Ocean currents & shallow shelf highlights
  ctx.fillStyle = 'rgba(28, 90, 160, 0.4)';
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * canvas.width;
    const y = 150 + Math.random() * 724;
    ctx.beginPath();
    ctx.ellipse(x, y, 60 + Math.random() * 120, 20 + Math.random() * 50, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw landmasses (Continents approximation in equirectangular projection)
  ctx.fillStyle = '#2c5e3b'; // Main vegetation land
  const continents = [
    // Eurasia
    { x: 1100, y: 260, rx: 380, ry: 160, rot: -0.1 },
    { x: 1350, y: 360, rx: 240, ry: 140, rot: 0.2 },
    { x: 980, y: 280, rx: 140, ry: 90, rot: 0.1 }, // Europe
    // Africa
    { x: 1050, y: 520, rx: 180, ry: 200, rot: 0.05 },
    { x: 1100, y: 640, rx: 110, ry: 130, rot: 0 },
    // North America
    { x: 420, y: 270, rx: 250, ry: 150, rot: -0.15 },
    { x: 340, y: 220, rx: 160, ry: 100, rot: 0.1 }, // Canada/Alaska
    { x: 480, y: 390, rx: 90, ry: 120, rot: 0.3 }, // Central America
    // South America
    { x: 620, y: 620, rx: 130, ry: 220, rot: 0.25 },
    { x: 660, y: 540, rx: 150, ry: 120, rot: -0.1 },
    // Australia
    { x: 1620, y: 680, rx: 140, ry: 100, rot: 0 },
    // Greenland
    { x: 700, y: 140, rx: 90, ry: 70, rot: -0.2 },
    // Antarctica
    { x: 1024, y: 960, rx: 950, ry: 90, rot: 0 },
  ];

  continents.forEach(c => {
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.rx, c.ry, c.rot, 0, Math.PI * 2);
    ctx.fill();
    // Sub-regions / islands / details
    for (let j = 0; j < 12; j++) {
      const ox = c.x + (Math.random() - 0.5) * c.rx * 1.8;
      const oy = c.y + (Math.random() - 0.5) * c.ry * 1.6;
      ctx.beginPath();
      ctx.ellipse(ox, oy, c.rx * 0.25, c.ry * 0.25, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Mountains & Deserts (Sahara, Gobi, Andes, Rockies)
  ctx.fillStyle = '#9e8750';
  const deserts = [
    { x: 1060, y: 440, rx: 140, ry: 60 }, // Sahara
    { x: 1200, y: 420, rx: 90, ry: 50 },  // Arabian peninsula
    { x: 1380, y: 320, rx: 100, ry: 40 }, // Gobi
    { x: 1600, y: 660, rx: 90, ry: 60 },  // Australian outback
    { x: 420, y: 340, rx: 50, ry: 80 },   // SW US
  ];
  deserts.forEach(d => {
    ctx.beginPath();
    ctx.ellipse(d.x, d.y, d.rx, d.ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Polar Ice Caps (North and South)
  ctx.fillStyle = '#eaf3fa';
  // North Pole
  ctx.beginPath();
  ctx.ellipse(1024, 40, 1024, 70, 0, 0, Math.PI * 2);
  ctx.fill();
  // South Pole (Antarctica)
  ctx.beginPath();
  ctx.ellipse(1024, 980, 1024, 80, 0, 0, Math.PI * 2);
  ctx.fill();

  // Subtle Latitude / Longitude Guide grid on map (equator, tropics, polar circles)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  // Equator
  ctx.beginPath();
  ctx.moveTo(0, 512);
  ctx.lineTo(2048, 512);
  ctx.stroke();
  // Tropics (23.44°)
  const tropicOffset = (23.439 / 90) * 512;
  ctx.beginPath();
  ctx.moveTo(0, 512 - tropicOffset);
  ctx.lineTo(2048, 512 - tropicOffset);
  ctx.moveTo(0, 512 + tropicOffset);
  ctx.lineTo(2048, 512 + tropicOffset);
  ctx.stroke();

  // Swirling Clouds layer
  ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
  for (let k = 0; k < 60; k++) {
    const cx = Math.random() * canvas.width;
    const cy = 80 + Math.random() * 860;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 50 + Math.random() * 120, 12 + Math.random() * 30, Math.random() * 0.4 - 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

let realNearSideMoonCanvas = null;

function generateOrthographicLunarDisk(sourceImageOrCanvas) {
  const size = 320;
  const offCanvas = document.createElement('canvas');
  offCanvas.width = size;
  offCanvas.height = size;
  const offCtx = offCanvas.getContext('2d');

  const sw = sourceImageOrCanvas.width || (sourceImageOrCanvas.image ? sourceImageOrCanvas.image.width : 1024);
  const sh = sourceImageOrCanvas.height || (sourceImageOrCanvas.image ? sourceImageOrCanvas.image.height : 512);

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = sw;
  tempCanvas.height = sh;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(sourceImageOrCanvas.image || sourceImageOrCanvas, 0, 0, sw, sh);
  const srcData = tempCtx.getImageData(0, 0, sw, sh).data;

  const outImgData = offCtx.createImageData(size, size);
  const outData = outImgData.data;

  const R = size / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - cx) / R;
      const dy = (cy - y) / R; // y inverted so +dy is North
      const distSq = dx * dx + dy * dy;

      if (distSq <= 1.0) {
        const dz = Math.sqrt(1.0 - distSq);
        
        // Orthographic projection to spherical coordinates on the near side
        const lat = Math.asin(Math.max(-1, Math.min(1, dy)));
        const lon = Math.atan2(dx, dz);

        let u = (lon + Math.PI) / (2 * Math.PI);
        let v = (Math.PI / 2 - lat) / Math.PI;

        u = Math.max(0, Math.min(0.999, u));
        v = Math.max(0, Math.min(0.999, v));

        const sx = Math.floor(u * sw);
        const sy = Math.floor(v * sh);
        const srcIdx = (sy * sw + sx) * 4;

        const outIdx = (y * size + x) * 4;

        // Regolith scattering / subtle limb darkening
        const limbFactor = 0.86 + 0.14 * Math.pow(dz, 0.5);

        outData[outIdx] = Math.min(255, srcData[srcIdx] * limbFactor);
        outData[outIdx + 1] = Math.min(255, srcData[srcIdx + 1] * limbFactor);
        outData[outIdx + 2] = Math.min(255, srcData[srcIdx + 2] * limbFactor);
        outData[outIdx + 3] = 255;
      }
    }
  }

  offCtx.putImageData(outImgData, 0, 0);
  return offCanvas;
}

function createMoonCanvasTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Highlands baseline
  ctx.fillStyle = '#b8b8b8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Surface roughness variation
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = Math.random() * 3;
    const lum = 150 + Math.floor(Math.random() * 80);
    ctx.fillStyle = `rgb(${lum},${lum},${lum})`;
    ctx.fillRect(x, y, r, r);
  }

  // Lunar Maria (Dark basaltic plains on the near side: Oceanus Procellarum, Mare Imbrium, Mare Tranquillitatis, etc.)
  ctx.fillStyle = 'rgba(68, 70, 78, 0.75)';
  const maria = [
    { x: 380, y: 180, rx: 110, ry: 80 }, // Mare Imbrium
    { x: 280, y: 260, rx: 130, ry: 110 }, // Oceanus Procellarum
    { x: 440, y: 230, rx: 65, ry: 50 },  // Mare Serenitatis
    { x: 500, y: 260, rx: 70, ry: 55 },  // Mare Tranquillitatis
    { x: 550, y: 300, rx: 60, ry: 50 },  // Mare Fecunditatis
    { x: 430, y: 310, rx: 55, ry: 45 },  // Mare Nectaris
    { x: 360, y: 340, rx: 90, ry: 60 },  // Mare Nubium
    { x: 570, y: 210, rx: 45, ry: 40 },  // Mare Crisium
  ];
  maria.forEach(m => {
    ctx.beginPath();
    ctx.ellipse(m.x, m.y, m.rx, m.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    // feathered sub-blobs
    for (let k = 0; k < 8; k++) {
      ctx.beginPath();
      ctx.ellipse(m.x + (Math.random() - 0.5) * m.rx, m.y + (Math.random() - 0.5) * m.ry, m.rx * 0.4, m.ry * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Impact craters with bright rays (e.g. Tycho, Copernicus, Kepler)
  const craters = [
    { x: 360, y: 410, r: 14, rayCount: 16, rayLen: 180 }, // Tycho
    { x: 330, y: 230, r: 12, rayCount: 12, rayLen: 120 }, // Copernicus
    { x: 250, y: 240, r: 8, rayCount: 8, rayLen: 70 },    // Kepler
    { x: 490, y: 240, r: 7, rayCount: 6, rayLen: 50 },
    { x: 750, y: 220, r: 11, rayCount: 10, rayLen: 90 },  // Far side crater
  ];

  craters.forEach(c => {
    // Bright ray splatters
    ctx.strokeStyle = 'rgba(240, 240, 245, 0.45)';
    ctx.lineWidth = 1.2;
    for (let a = 0; a < c.rayCount; a++) {
      const angle = (a / c.rayCount) * Math.PI * 2 + (Math.random() * 0.1);
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(c.x + Math.cos(angle) * (c.rayLen * (0.6 + Math.random() * 0.5)), c.y + Math.sin(angle) * (c.rayLen * (0.6 + Math.random() * 0.5)));
      ctx.stroke();
    }
    // Crater rim
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
    // Crater inner shadow
    ctx.fillStyle = '#3a3a40';
    ctx.beginPath();
    ctx.arc(c.x + 1, c.y + 1, c.r * 0.65, 0, Math.PI * 2);
    ctx.fill();
    // Central peak
    ctx.fillStyle = '#d0d0d8';
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r * 0.2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Pre-generate initial orthographic lunar disk for phase window
  try {
    realNearSideMoonCanvas = generateOrthographicLunarDisk(canvas);
  } catch (e) {
    console.warn('Could not generate initial lunar disk', e);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// ==================== APP INITIALIZATION ====================
function initApp() {
  const container = document.getElementById('scene-container');
  if (!container) return;

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 6000);
  camera.position.set(0, 220, 480);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ---------- STARFIELD ----------
  function makeStarfield(count = 3500, radius = 2200) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const r = radius * (0.75 + Math.random() * 0.25);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Star temperature color variation (blue-white, white, warm yellow, subtle red)
      const colorType = Math.random();
      if (colorType > 0.85) {
        colors[i * 3] = 0.7; colors[i * 3 + 1] = 0.85; colors[i * 3 + 2] = 1.0; // Blueish
      } else if (colorType > 0.6) {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.92; colors[i * 3 + 2] = 0.75; // Yellowish
      } else {
        colors[i * 3] = 0.95; colors[i * 3 + 1] = 0.95; colors[i * 3 + 2] = 1.0; // Pure white
      }
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9
    });
    return new THREE.Points(geo, mat);
  }
  scene.add(makeStarfield());

  // ---------- SUN (Directional Light + Visual Glow) ----------
  const sunGroup = new THREE.Group();
  const sunGeo = new THREE.SphereGeometry(60, 32, 32);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xffdf78 });
  const sunMesh = new THREE.Mesh(sunGeo, sunMat);
  sunGroup.add(sunMesh);

  // Sun Corona Glow Sprite (Offline Canvas)
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = 256; glowCanvas.height = 256;
  const gctx = glowCanvas.getContext('2d');
  const grad = gctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255, 230, 160, 1)');
  grad.addColorStop(0.3, 'rgba(255, 185, 80, 0.45)');
  grad.addColorStop(0.7, 'rgba(255, 150, 50, 0.12)');
  grad.addColorStop(1, 'rgba(255, 120, 30, 0)');
  gctx.fillStyle = grad;
  gctx.fillRect(0, 0, 256, 256);

  const glowTex = new THREE.CanvasTexture(glowCanvas);
  const glowMat = new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const glowSprite = new THREE.Sprite(glowMat);
  glowSprite.scale.set(450, 450, 1);
  sunGroup.add(glowSprite);

  sunGroup.position.set(SUN_DIST, 0, 0);
  scene.add(sunGroup);

  const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.9);
  sunLight.position.copy(sunGroup.position);
  scene.add(sunLight);

  // Faint ambient light for space fill
  scene.add(new THREE.AmbientLight(0x282c40, 0.22));

  // ---------- REALISTIC TEXTURE LOADER WITH OFFLINE FALLBACK ----------
  const texLoader = new THREE.TextureLoader();
  texLoader.crossOrigin = 'anonymous';

  const TEX_BASE_CDN = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/';
  const TEX_BACKUP_CDN = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets/';

  // ---------- EARTH & AXIAL TILT ----------
  const earthMat = new THREE.MeshPhongMaterial({
    map: createEarthCanvasTexture(), // Initial fallback texture
    specular: new THREE.Color(0x333333),
    shininess: 15
  });
  const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS, 64, 64), earthMat);

  // Earth's Axial Tilt ~23.44°
  const earthAxisGroup = new THREE.Group();
  earthAxisGroup.rotation.z = THREE.MathUtils.degToRad(EARTH_AXIAL_TILT_DEG);
  earthAxisGroup.add(earthMesh);
  scene.add(earthAxisGroup);

  // Load Real High-Res Earth Maps
  texLoader.load(
    TEX_BASE_CDN + 'earth_atmos_2048.jpg',
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      earthMat.map = tex;
      earthMat.needsUpdate = true;
    },
    undefined,
    () => {
      texLoader.load(TEX_BACKUP_CDN + 'earth_atmos_2048.jpg', (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        earthMat.map = tex;
        earthMat.needsUpdate = true;
      });
    }
  );

  texLoader.load(TEX_BASE_CDN + 'earth_specular_2048.jpg', (tex) => {
    earthMat.specularMap = tex;
    earthMat.specular = new THREE.Color(0x555555);
    earthMat.shininess = 20;
    earthMat.needsUpdate = true;
  });

  texLoader.load(TEX_BASE_CDN + 'earth_normal_2048.jpg', (tex) => {
    earthMat.normalMap = tex;
    earthMat.normalScale.set(0.7, 0.7);
    earthMat.needsUpdate = true;
  });

  // Earth Realistic Clouds Layer
  const cloudsMat = new THREE.MeshPhongMaterial({
    transparent: true,
    opacity: 0.38,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const cloudsMesh = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS + 0.4, 64, 64), cloudsMat);
  earthMesh.add(cloudsMesh);

  texLoader.load(
    TEX_BASE_CDN + 'earth_clouds_2048.png',
    (tex) => {
      cloudsMat.map = tex;
      cloudsMat.needsUpdate = true;
    },
    undefined,
    () => {
      texLoader.load(TEX_BACKUP_CDN + 'earth_clouds_1024.png', (tex) => {
        cloudsMat.map = tex;
        cloudsMat.needsUpdate = true;
      });
    }
  );

  // ---------- OBSERVER POSITION TRACKER (NO VISIBLE MARKERS) ----------
  let currentLatitudeDeg = 50.45; // Default: Kyiv (50.45° N)
  let currentLongitudeDeg = 30.52; // Default: Kyiv (30.52° E)

  // Invisible coordinate tracking node on Earth's surface for camera and horizon calculation
  const observerMarkerGroup = new THREE.Group();
  earthMesh.add(observerMarkerGroup);

  const observerWorldPos = new THREE.Vector3();

  function updateObserverPosition(latDeg, lonDeg = currentLongitudeDeg) {
    currentLatitudeDeg = latDeg;
    currentLongitudeDeg = lonDeg;

    const latRad = THREE.MathUtils.degToRad(latDeg);
    const lonRad = THREE.MathUtils.degToRad(lonDeg);

    // Standard spherical coordinates on Earth (Y-up)
    const dir = new THREE.Vector3(
      Math.cos(latRad) * Math.sin(lonRad),
      Math.sin(latRad),
      Math.cos(latRad) * Math.cos(lonRad)
    ).normalize();

    const surfacePos = dir.clone().multiplyScalar(EARTH_RADIUS);
    observerMarkerGroup.position.copy(surfacePos);
    observerMarkerGroup.lookAt(surfacePos.clone().add(dir));
  }
  updateObserverPosition(currentLatitudeDeg, currentLongitudeDeg);

  // ---------- MOON & ORBIT ----------
  const moonMat = new THREE.MeshPhongMaterial({
    map: createMoonCanvasTexture(), // Initial fallback texture
    shininess: 2
  });
  const moonGroup = new THREE.Group();
  const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(MOON_RADIUS, 64, 64), moonMat);
  moonGroup.add(moonMesh);

  // Load Real High-Res Moon Map
  texLoader.load(
    TEX_BASE_CDN + 'moon_1024.jpg',
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      moonMat.map = tex;
      moonMat.needsUpdate = true;
      try {
        if (tex.image) {
          realNearSideMoonCanvas = generateOrthographicLunarDisk(tex.image);
          if (typeof updateScene === 'function') updateScene();
        }
      } catch (err) {
        console.warn('Real moon projection error:', err);
      }
    },
    undefined,
    () => {
      texLoader.load(TEX_BACKUP_CDN + 'moon_1024.jpg', (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        moonMat.map = tex;
        moonMat.needsUpdate = true;
        try {
          if (tex.image) {
            realNearSideMoonCanvas = generateOrthographicLunarDisk(tex.image);
            if (typeof updateScene === 'function') updateScene();
          }
        } catch (err) {
          console.warn('Backup real moon projection error:', err);
        }
      });
    }
  );

  // Moon's Orbital Inclination ~5.14°
  const moonOrbitPivot = new THREE.Group();
  moonOrbitPivot.rotation.x = THREE.MathUtils.degToRad(MOON_INCLINATION_DEG);
  moonOrbitPivot.add(moonGroup);
  scene.add(moonOrbitPivot);

  const moonWorldPos = new THREE.Vector3();

  // Orbit path line
  const orbitPts = [];
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    orbitPts.push(new THREE.Vector3(Math.cos(a) * MOON_ORBIT_RADIUS, 0, Math.sin(a) * MOON_ORBIT_RADIUS));
  }
  const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPts);
  const orbitLine = new THREE.Line(orbitGeo, new THREE.LineBasicMaterial({ color: 0x4a5578, transparent: true, opacity: 0.6 }));
  moonOrbitPivot.add(orbitLine);

  // Ecliptic plane guide line (faint)
  const eclipticGeo = new THREE.BufferGeometry().setFromPoints(orbitPts);
  const eclipticLine = new THREE.Line(eclipticGeo, new THREE.LineBasicMaterial({ color: 0x303548, transparent: true, opacity: 0.3 }));
  scene.add(eclipticLine);

  // Sun-Earth alignment vector line (faint guide)
  const sunLineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), sunGroup.position.clone()]);
  const sunLine = new THREE.Line(sunLineGeo, new THREE.LineBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.12 }));
  scene.add(sunLine);

  // ==================== 2D MOON PHASE VIEWER WITH REAL MOON IMAGE ====================
  const moonViewCanvas = document.getElementById('moon-view-canvas');
  const mvCtx = moonViewCanvas ? moonViewCanvas.getContext('2d') : null;

  function drawMoonPhase(phaseFraction) {
    if (!mvCtx) return 0;
    const w = moonViewCanvas.width;
    const h = moonViewCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = w / 2 - 8;

    mvCtx.clearRect(0, 0, w, h);

    const normFrac = ((phaseFraction % 1) + 1) % 1;
    const illum = (1 - Math.cos(normFrac * Math.PI * 2)) / 2;
    const rx = Math.abs(Math.cos(normFrac * Math.PI * 2)) * r;

    // 1. Draw Base Dark Lunar Disk (Earthshine night side)
    mvCtx.save();
    mvCtx.beginPath();
    mvCtx.arc(cx, cy, r, 0, Math.PI * 2);
    mvCtx.clip();

    // Dark lunar night background
    mvCtx.fillStyle = '#0b0d14';
    mvCtx.fillRect(0, 0, w, h);

    // Render faint real lunar maria details in Earthshine
    if (realNearSideMoonCanvas) {
      mvCtx.globalAlpha = 0.13;
      mvCtx.drawImage(realNearSideMoonCanvas, cx - r, cy - r, r * 2, r * 2);
      mvCtx.globalAlpha = 1.0;
    }

    // Faint earthshine subtle ambient glow
    mvCtx.fillStyle = 'rgba(70, 105, 160, 0.07)';
    mvCtx.fillRect(0, 0, w, h);

    mvCtx.restore();

    // 2. Draw Sunlit Portion with the High-Res Real Moon Texture
    if (illum > 0.003) {
      mvCtx.save();
      mvCtx.beginPath();
      mvCtx.arc(cx, cy, r, 0, Math.PI * 2);
      mvCtx.clip();

      // Mask to illuminated lunar phase shape
      mvCtx.beginPath();
      if (normFrac <= 0.5) {
        // Waxing (Зростаючий): right side illuminated
        mvCtx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, false);
        mvCtx.ellipse(cx, cy, rx, r, 0, Math.PI / 2, -Math.PI / 2, normFrac < 0.25);
      } else {
        // Waning (Спадний): left side illuminated
        mvCtx.arc(cx, cy, r, Math.PI / 2, -Math.PI / 2, false);
        mvCtx.ellipse(cx, cy, rx, r, 0, -Math.PI / 2, Math.PI / 2, normFrac > 0.75);
      }
      mvCtx.closePath();
      mvCtx.clip();

      // Render the true high-res lunar disk
      if (realNearSideMoonCanvas) {
        mvCtx.drawImage(realNearSideMoonCanvas, cx - r, cy - r, r * 2, r * 2);
      } else {
        mvCtx.fillStyle = '#e8e5dc';
        mvCtx.fillRect(0, 0, w, h);
      }

      // Warm sunlight tone
      mvCtx.globalCompositeOperation = 'multiply';
      mvCtx.fillStyle = '#fffaea';
      mvCtx.fillRect(0, 0, w, h);
      mvCtx.globalCompositeOperation = 'source-over';

      mvCtx.restore();
    }

    // 3. Subtle edge rim
    mvCtx.beginPath();
    mvCtx.arc(cx, cy, r, 0, Math.PI * 2);
    mvCtx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    mvCtx.lineWidth = 1.2;
    mvCtx.stroke();

    return illum;
  }

  function getPhaseName(frac) {
    const f = ((frac % 1) + 1) % 1;
    if (f < 0.02 || f > 0.98) return 'Новий місяць (Молодик)';
    if (f < 0.23) return 'Молодий місяць (зростаючий серп)';
    if (f <= 0.27) return 'Перша чверть';
    if (f < 0.48) return 'Зростаючий Місяць (опуклий)';
    if (f <= 0.52) return 'Повний місяць (Повня)';
    if (f < 0.73) return 'Спадний Місяць (опуклий)';
    if (f <= 0.77) return 'Остання чверть';
    return 'Старий місяць (спадний серп)';
  }

  // ==================== SIMULATION STATE & ROTATION SYNC ====================
  let dayValue = 0.0; // Current day in cycle: 0..29.530588
  let playing = false;
  let speed = 1.0;
  const speedOptions = [0.25, 0.5, 1, 2, 5, 10];
  let speedIdx = 2; // Default 1x

  // Rotation sync modes:
  // 'astronomical' -> Earth spins exactly 1 full rotation per 1 day (so 29.53 rotations per month)
  // 'slow' -> Earth spins at a relaxed visual rate
  // 'locked' -> Fixed solar noon for observation
  let syncMode = 'astronomical';

  let cameraMode = 'free'; // 'free' | 'earth' | 'surface'

  // Camera spherical angles for free camera
  let camAzimuth = Math.atan2(camera.position.x, camera.position.z);
  let camPolar = Math.acos(camera.position.y / camera.position.length());
  let camDist = camera.position.length();
  let isDragging = false;
  let lastX = 0, lastY = 0;

  function updateCameraFromSpherical() {
    camera.up.set(0, 1, 0);
    const x = camDist * Math.sin(camPolar) * Math.sin(camAzimuth);
    const y = camDist * Math.cos(camPolar);
    const z = camDist * Math.sin(camPolar) * Math.cos(camAzimuth);
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
  }
  updateCameraFromSpherical();

  // Mouse / Pointer Controls for 3D Scene
  renderer.domElement.addEventListener('pointerdown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });
  window.addEventListener('pointerup', () => isDragging = false);
  window.addEventListener('pointermove', (e) => {
    if (!isDragging || cameraMode !== 'free') return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    camAzimuth -= dx * 0.005;
    camPolar -= dy * 0.005;
    camPolar = Math.max(0.12, Math.min(Math.PI - 0.12, camPolar));
    updateCameraFromSpherical();
  });
  renderer.domElement.addEventListener('wheel', (e) => {
    e.preventDefault();
    camDist *= (1 + e.deltaY * 0.001);
    camDist = Math.max(80, Math.min(1400, camDist));
    if (cameraMode === 'free') updateCameraFromSpherical();
  }, { passive: false });

  // ---------- UI DOM ELEMENTS ----------
  const daySlider = document.getElementById('day-slider');
  const dayValEl = document.getElementById('day-val');
  const phaseNameEl = document.getElementById('phase-name');
  const illumTextEl = document.getElementById('illum-text');
  const moonAltitudeEl = document.getElementById('moon-altitude-text');
  const playBtn = document.getElementById('play-btn');
  const speedSlider = document.getElementById('speed-slider');
  const speedValEl = document.getElementById('speed-val');
  const camEarthBtn = document.getElementById('cam-earth-btn');
  const camSurfaceBtn = document.getElementById('cam-surface-btn');
  const camFreeBtn = document.getElementById('cam-free-btn');
  const syncModeBtn = document.getElementById('sync-mode-btn');
  const earthRotCountEl = document.getElementById('earth-rot-count');
  const timeOfDayEl = document.getElementById('time-of-day-val');
  const latSlider = document.getElementById('lat-slider');
  const latValEl = document.getElementById('lat-val');
  const helpToggle = document.getElementById('help-toggle');
  const legend = document.getElementById('legend');
  const saveObsBtn = document.getElementById('save-obs-btn');
  const openJournalBtn = document.getElementById('open-journal-btn');
  const journalModal = document.getElementById('journal-modal');
  const closeJournalBtn = document.getElementById('close-journal-btn');
  const journalTableBody = document.getElementById('journal-table-body');
  const clearDbBtn = document.getElementById('clear-db-btn');
  const exportJsonBtn = document.getElementById('export-json-btn');

  // Step buttons (+1d, -1d, +1h, -1h)
  document.getElementById('step-minus-day')?.addEventListener('click', () => stepTime(-1));
  document.getElementById('step-plus-day')?.addEventListener('click', () => stepTime(1));
  document.getElementById('step-minus-hour')?.addEventListener('click', () => stepTime(-1 / 24));
  document.getElementById('step-plus-hour')?.addEventListener('click', () => stepTime(1 / 24));

  function stepTime(deltaDays) {
    dayValue = (dayValue + deltaDays + SYNODIC_MONTH * 10) % SYNODIC_MONTH;
    syncSliderFromDay();
    updateScene();
  }

  // Preset Latitudes
  document.querySelectorAll('[data-lat]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const lat = parseFloat(e.currentTarget.getAttribute('data-lat'));
      if (latSlider) latSlider.value = lat;
      updateLatitudeFromUI(lat);
    });
  });

  function updateLatitudeFromUI(lat) {
    updateObserverPosition(lat, currentLongitudeDeg);
    if (latValEl) {
      const hemisphere = lat >= 0 ? 'Пн. ш.' : 'Пд. ш.';
      latValEl.textContent = `${Math.abs(lat).toFixed(1)}° ${hemisphere}`;
    }
    if (camSurfaceBtn) {
      camSurfaceBtn.textContent = `Вид з поверхні (${Math.abs(lat).toFixed(0)}° ${lat >= 0 ? 'N' : 'S'})`;
    }
    updateScene();
    saveSetting('last_latitude', lat);
  }

  if (latSlider) {
    latSlider.addEventListener('input', (e) => {
      updateLatitudeFromUI(parseFloat(e.target.value));
    });
  }

  function setDayFromSlider() {
    const t = parseFloat(daySlider.value) / 1000;
    dayValue = t * SYNODIC_MONTH;
    updateScene();
  }
  if (daySlider) daySlider.addEventListener('input', setDayFromSlider);

  function syncSliderFromDay() {
    if (!daySlider) return;
    const t = (dayValue / SYNODIC_MONTH) % 1;
    daySlider.value = Math.round(t * 1000);
  }

  // ---------- SCENE UPDATE & ASTRONOMICAL CALCULATIONS ----------
  function updateScene() {
    const phaseFrac = (dayValue / SYNODIC_MONTH) % 1;
    const moonAngle = phaseFrac * Math.PI * 2;

    // Moon Prograde Orbit (Counter-clockwise viewed from north)
    const mx = Math.cos(moonAngle) * MOON_ORBIT_RADIUS;
    const mz = -Math.sin(moonAngle) * MOON_ORBIT_RADIUS;
    moonMesh.position.set(mx, 0, mz);
    moonMesh.lookAt(0, 0, 0); // Tidally locked: same face always faces Earth

    // Earth's Axial Spin Synchronization
    if (syncMode === 'astronomical') {
      // 1 day = 1 full 360° (2*PI) rotation of Earth
      // For synodic cycle: exactly 29.530588 rotations per Moon orbit
      earthMesh.rotation.y = (dayValue * Math.PI * 2);
    }

    // Force matrix update to get fresh world coordinates for observer and moon
    scene.updateMatrixWorld(true);
    moonMesh.getWorldPosition(moonWorldPos);
    observerMarkerGroup.getWorldPosition(observerWorldPos);

    // Calculate Moon Phase & Illumination
    const illum = drawMoonPhase(phaseFrac);
    const phaseName = getPhaseName(phaseFrac);

    if (phaseNameEl) phaseNameEl.textContent = phaseName;
    if (illumTextEl) illumTextEl.textContent = `Освітленість: ${Math.round(illum * 100)}%`;
    if (dayValEl) dayValEl.textContent = `${dayValue.toFixed(2)} / ${SYNODIC_MONTH.toFixed(2)} діб`;

    // Rotation counter & Local time of day calculation
    const totalEarthRotations = dayValue; // Each day is 1 rotation
    if (earthRotCountEl) {
      earthRotCountEl.textContent = `${totalEarthRotations.toFixed(2)} обертів`;
    }

    // Local solar time calculation on the observer's meridian
    const hoursInDay = (dayValue % 1) * 24;
    const hh = Math.floor(hoursInDay).toString().padStart(2, '0');
    const mm = Math.floor((hoursInDay % 1) * 60).toString().padStart(2, '0');
    if (timeOfDayEl) {
      const isNight = hoursInDay < 6 || hoursInDay > 18;
      timeOfDayEl.textContent = `${hh}:${mm} (${isNight ? '🌙 Ніч' : '☀️ День'})`;
    }

    // Calculate whether Moon is above or below observer's local horizon
    const observerUp = observerWorldPos.clone().normalize();
    const toMoon = moonWorldPos.clone().sub(observerWorldPos).normalize();
    const dotHorizon = observerUp.dot(toMoon); // > 0 means above horizon, < 0 below
    const elevationDeg = Math.asin(Math.max(-1, Math.min(1, dotHorizon))) * (180 / Math.PI);

    if (moonAltitudeEl) {
      if (elevationDeg > 0) {
        moonAltitudeEl.innerHTML = `<span style="color:#70e000;">🟢 Над горизонтом</span> (+${elevationDeg.toFixed(1)}°)`;
      } else {
        moonAltitudeEl.innerHTML = `<span style="color:#f87171;">🔴 Під горизонтом</span> (${elevationDeg.toFixed(1)}°)`;
      }
    }

    // Camera views update
    if (cameraMode === 'earth') {
      updateEarthPoleCamera();
    } else if (cameraMode === 'surface') {
      updateSurfaceCamera();
    }
  }

  function updateEarthPoleCamera() {
    const obsPos = new THREE.Vector3(0, EARTH_RADIUS + 3, 0);
    camera.position.copy(obsPos).multiplyScalar(1.001);
    camera.position.y += 1.5;
    camera.up.set(0, 1, 0);
    camera.lookAt(moonWorldPos.x, moonWorldPos.y, moonWorldPos.z);
  }

  function updateSurfaceCamera() {
    // Surface View at the user-defined latitude!
    // Stands directly on Earth's surface at currentLatitudeDeg and looks at the Moon in the local sky
    const up = observerWorldPos.clone().normalize();
    const eyePos = observerWorldPos.clone().add(up.clone().multiplyScalar(3.2));
    camera.position.copy(eyePos);
    camera.up.copy(up);
    camera.lookAt(moonWorldPos.x, moonWorldPos.y, moonWorldPos.z);
  }

  function setCameraMode(mode) {
    cameraMode = mode;
    camFreeBtn?.classList.toggle('active', mode === 'free');
    camEarthBtn?.classList.toggle('active', mode === 'earth');
    camSurfaceBtn?.classList.toggle('active', mode === 'surface');

    if (mode === 'earth') {
      updateEarthPoleCamera();
    } else if (mode === 'surface') {
      updateSurfaceCamera();
    } else {
      updateCameraFromSpherical();
    }
  }

  camEarthBtn?.addEventListener('click', () => setCameraMode('earth'));
  camSurfaceBtn?.addEventListener('click', () => setCameraMode('surface'));
  camFreeBtn?.addEventListener('click', () => setCameraMode('free'));

  // ---------- ROTATION SYNCHRONIZATION CONTROLS ----------
  syncModeBtn?.addEventListener('click', () => {
    if (syncMode === 'astronomical') {
      syncMode = 'slow';
      syncModeBtn.textContent = 'Синхронізація: Оглядова';
      syncModeBtn.title = 'Уповільнене обертання Землі для детального огляду карти';
    } else {
      syncMode = 'astronomical';
      syncModeBtn.textContent = 'Синхронізація: Астрономічна (1:29.53)';
      syncModeBtn.title = 'Реальне астрономічне співвідношення: 29.53 обертів Землі за 1 синодичний місяць';
    }
    saveSetting('sync_mode', syncMode);
    updateScene();
  });

  // ---------- PLAYBACK & SPEED CONTROLS ----------
  playBtn?.addEventListener('click', () => {
    playing = !playing;
    playBtn.textContent = playing ? '⏸ Пауза' : '▶ Старт';
    playBtn.classList.toggle('active', playing);
  });

  function setSpeed(val) {
    speed = Math.max(0.05, Math.min(10, parseFloat(val)));
    if (speedSlider) speedSlider.value = speed;
    if (speedValEl) speedValEl.textContent = `${speed.toFixed(2)}×`;
    saveSetting('sim_speed', speed);
  }

  if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
      setSpeed(e.target.value);
    });
  }

  document.querySelectorAll('[data-speed]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sp = parseFloat(e.currentTarget.getAttribute('data-speed'));
      setSpeed(sp);
    });
  });

  helpToggle?.addEventListener('click', () => {
    if (legend) {
      legend.style.display = legend.style.display === 'block' ? 'none' : 'block';
    }
  });

  // ---------- ASTRONOMICAL DATABASE JOURNAL (OFFLINE) ----------
  saveObsBtn?.addEventListener('click', async () => {
    const phaseFrac = (dayValue / SYNODIC_MONTH) % 1;
    const phase = getPhaseName(phaseFrac);
    const illum = Math.round(((1 - Math.cos(phaseFrac * Math.PI * 2)) / 2) * 100);

    const observerUp = observerWorldPos.clone().normalize();
    const toMoon = moonWorldPos.clone().sub(observerWorldPos).normalize();
    const elev = (Math.asin(Math.max(-1, Math.min(1, observerUp.dot(toMoon)))) * (180 / Math.PI)).toFixed(1);

    const data = {
      dayValue: parseFloat(dayValue.toFixed(2)),
      phaseName: phase,
      illumination: illum,
      latitude: currentLatitudeDeg,
      elevation: parseFloat(elev),
      note: `Спостереження на широті ${Math.abs(currentLatitudeDeg).toFixed(1)}° (${currentLatitudeDeg >= 0 ? 'Пн' : 'Пд'})`
    };

    try {
      await saveObservation(data);
      saveObsBtn.textContent = '✓ Збережено!';
      setTimeout(() => {
        saveObsBtn.textContent = '💾 Зафіксувати в базі';
      }, 1500);
      loadJournalData();
    } catch (err) {
      console.error('Error saving observation:', err);
    }
  });

  openJournalBtn?.addEventListener('click', () => {
    if (journalModal) {
      journalModal.style.display = 'flex';
      loadJournalData();
    }
  });

  closeJournalBtn?.addEventListener('click', () => {
    if (journalModal) journalModal.style.display = 'none';
  });

  clearDbBtn?.addEventListener('click', async () => {
    if (confirm('Очистити всі збережені астрономічні спостереження з локальної бази даних?')) {
      await clearAllObservations();
      loadJournalData();
    }
  });

  exportJsonBtn?.addEventListener('click', async () => {
    const items = await getObservations();
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moon_observations_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  async function loadJournalData() {
    if (!journalTableBody) return;
    const items = await getObservations();

    if (!items || items.length === 0) {
      journalTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:24px; color:var(--muted);">
            Немає збережених спостережень. Натисніть «💾 Зафіксувати в базі», щоб зберегти поточний стан Місяця та Землі.
          </td>
        </tr>
      `;
      return;
    }

    journalTableBody.innerHTML = items.map(item => `
      <tr>
        <td style="padding:8px 10px; font-size:12px; color:var(--muted);">${item.dateStr || '—'}</td>
        <td style="padding:8px 10px; font-weight:600; color:var(--accent);">${item.phaseName}</td>
        <td style="padding:8px 10px;">${item.illumination}%</td>
        <td style="padding:8px 10px;">День ${item.dayValue}</td>
        <td style="padding:8px 10px;">${item.latitude >= 0 ? '+' : ''}${item.latitude}° (${item.elevation > 0 ? '🟢 +' + item.elevation + '°' : '🔴 ' + item.elevation + '°'})</td>
        <td style="padding:8px 10px; text-align:right;">
          <button class="btn btn-sm restore-btn" data-day="${item.dayValue}" data-lat="${item.latitude}" style="padding:3px 8px; font-size:11px; margin-right:4px;">Відкрити</button>
          <button class="btn btn-sm delete-btn" data-id="${item.id}" style="padding:3px 8px; font-size:11px; color:#f87171; border-color:#5c2424;">✕</button>
        </td>
      </tr>
    `).join('');

    // Restore state handler
    journalTableBody.querySelectorAll('.restore-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const d = parseFloat(e.currentTarget.getAttribute('data-day'));
        const l = parseFloat(e.currentTarget.getAttribute('data-lat'));
        dayValue = d;
        syncSliderFromDay();
        if (latSlider) latSlider.value = l;
        updateLatitudeFromUI(l);
        if (journalModal) journalModal.style.display = 'none';
      });
    });

    // Delete handler
    journalTableBody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        await deleteObservation(id);
        loadJournalData();
      });
    });
  }

  // Restore saved settings on startup
  async function restoreSettings() {
    const savedLat = await getSetting('last_latitude', 50.45);
    if (latSlider) latSlider.value = savedLat;
    updateLatitudeFromUI(savedLat);

    const savedSpeed = await getSetting('sim_speed', 1.0);
    setSpeed(savedSpeed);

    const savedSync = await getSetting('sync_mode', 'astronomical');
    syncMode = savedSync;
    if (syncModeBtn) {
      syncModeBtn.textContent = syncMode === 'astronomical' ? 'Синхронізація: Астрономічна (1:29.53)' : 'Синхронізація: Оглядова';
    }
  }
  restoreSettings();

  // ---------- ANIMATION LOOP ----------
  let lastTime = performance.now();
  function animate(now) {
    requestAnimationFrame(animate);
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    if (playing) {
      // Advance simulation time smoothly
      dayValue += dt * speed * 0.75;
      if (dayValue >= SYNODIC_MONTH) dayValue -= SYNODIC_MONTH;
      syncSliderFromDay();

      if (syncMode === 'slow') {
        // In slow visual mode, spin independently only when active/playing
        earthMesh.rotation.y += dt * 0.25 * speed;
      }
      if (cloudsMesh) {
        cloudsMesh.rotation.y += dt * 0.05 * speed;
      }
    }

    updateScene();
    renderer.render(scene, camera);
  }

  updateScene();
  requestAnimationFrame(animate);
}

  // Auto-run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

  global.initMoonSimApp = initApp;
})(typeof window !== 'undefined' ? window : this);




// Globe.gl demo page - dark background, even lighting
(function(){
  // контейнер для глобуса
  const container = document.getElementById('globeViz');

  // створюємо інстанс Globe (wrapper around three-globe)
  const Globe = window.Globe; // з CDN unpkg
  const globe = Globe()(container)
    // початкова текстура (фізична)
    .globeImageUrl('https://unpkg.com/three-globe@2.27.4/example/img/earth-day.jpg')
    .bumpImageUrl('https://unpkg.com/three-globe@2.27.4/example/img/earth-topology.png') // рельєф
    .showGraticules(true)   // Включаємо паралелі та меридіани
    .backgroundColor('#000000')
    .showAtmosphere(true)
    .atmosphereColor('#3a7bd5')
    .atmosphereAltitude(0.25);


  

  // Отримуємо доступ до внутрішньої сцени/рендерера Three.js для тонкої настройки освітлення та фону
  // NOTE: ці методи доступні, бо Globe() повертає об'єкт, що містить renderer(), scene(), camera(), controls()
  const renderer = globe.renderer();
  const scene = globe.scene();
  const camera = globe.camera();
  const controls = globe.controls();
  




  // Темний фон для WebGL
  renderer.setClearColor('#001021'); // темно-синій відповідно до стилю
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMappingExposure = 1.0;

  // Налаштуємо камеру трохи відсунуто
  camera.position.z = 350; // Globe.gl масштабує за пікселями, якщо використовуєш дефолтні розміри
  camera.far = 10000;
  camera.updateProjectionMatrix();

  // Рівномірне освітлення: сильний ambient + декілька directional lights з різних сторін
  const ambient = new THREE.AmbientLight(0xffffff, 0.95); // майже повне рівномірне освітлення
  scene.add(ambient);

  // Додаткові направлені світла для моделювання обʼєму та поступової тіні
  const dirs = [
    {x: 1, y: 1, z: 1},
    {x: -1, y: 1, z: 1},
    {x: 1, y: -1, z: 1},
    {x: -1, y: -1, z: -1}
  ];
  dirs.forEach((d, i) => {
    const L = new THREE.DirectionalLight(0xffffff, 0.15);
    L.position.set(d.x*1000, d.y*1000, d.z*1000);
    scene.add(L);
  });

  // Налаштуємо невелику атмосферу та легке окружне сяйво (як опція)
  // Globe.gl має вбудовані параметри showAtmosphere/atmosphereColor/atmosphereAltitude, які ми вже застосували.

  // Керування орбітою (трохи тоншою) - швидкість обертання можна змінити
  controls.enablePan = false;
  controls.minDistance = 150;
  controls.maxDistance = 800;
  controls.autoRotate = false;
  controls.rotateSpeed = 0.4;
  controls.zoomSpeed = 1.0;
  controls.enableDamping = true;

  // Зручні шари з прикладних зображень (валидація CORS: використовуємо картинки з example директорії three-globe на unpkg)
  const textures = {
    physical: 'https://unpkg.com/three-globe@2.27.4/example/img/earth-day.jpg',
    political: 'https://unpkg.com/three-globe@2.27.4/example/img/earth-blue-marble.jpg',
    economic: 'https://unpkg.com/three-globe@2.27.4/example/img/earth-dark.jpg'
  };

  // Кнопки UI
  const btnPhysical = document.getElementById('btn-physical');
  const btnPolitical = document.getElementById('btn-political');
  const btnEconomic = document.getElementById('btn-economic');
  const btns = [btnPhysical, btnPolitical, btnEconomic];

  function setActive(btn){
    btns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  }

  btnPhysical.addEventListener('click', ()=>{
    globe.globeImageUrl(textures.physical);
    globe.bumpImageUrl('https://unpkg.com/three-globe@2.27.4/example/img/earth-topology.png');
    setActive(btnPhysical);
  });
  btnPolitical.addEventListener('click', ()=>{
    globe.globeImageUrl(textures.political);
    globe.bumpImageUrl('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png');
    setActive(btnPolitical);
  });
  btnEconomic.addEventListener('click', ()=>{
    globe.globeImageUrl(textures.economic);
    globe.bumpImageUrl('https://unpkg.com/three-globe@2.27.4/example/img/earth-topology.png');
    setActive(btnEconomic);
  });

  // Початково активуємо фізичну
  setActive(btnPhysical);

  // Підлаштування розміру при resize
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  // Simple render loop is handled by globe.gl internally, але на всякий випадок додамо оновлення контролів
  (function animate(){
    requestAnimationFrame(animate);
    controls.update();
  })();

})();

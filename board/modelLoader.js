// modelLoader.js — завантаження GLB моделей
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/GLTFLoader.js';



(function(){
  const loader = new GLTFLoader();

  // Публічний API
  window.ModelLoader = {
    /**
     * Завантажує GLB/GLTF модель
     * @param {string} url - URL або об'єкт File
     * @param {string} name - Ім'я для моделі у сцені
     * @param {function} onLoaded - callback після завантаження
     */
    loadGLB(url, name, onLoaded){
      if(!window.THREE_APP){
        console.warn('THREE_APP не готовий. Створіть Three.js сцену перш ніж завантажувати моделі.');
        return;
      }

      loader.load(
        url,
        gltf => {
          const obj = gltf.scene;
          obj.name = name || 'glb-model';

          // Додаємо модель у сцену через THREE_APP
          if(window.THREE_APP.addModel){
            window.THREE_APP.addModel(obj.name, obj);
          } else {
            // якщо addModel не існує, додаємо прямо у сцену
            if(window.THREE_APP.scene){
              window.THREE_APP.scene.add(obj);
            }
          }

          // callback
          if(onLoaded) onLoaded(obj);

          // автоматично створимо прикріплений SVG-маркер, якщо є метод
          setTimeout(()=>{
            if(window.THREE_APP && window.THREE_APP.createAttachedSVG){
              window.THREE_APP.createAttachedSVG(obj.name,'g',{rotate:true});
            }
          }, 200);

          console.log('GLB модель додана:', obj.name);
        },
        xhr => {
          if(xhr.total) {
            console.log(`${(xhr.loaded / xhr.total * 100).toFixed(1)}% завантажено`);
          }
        },
        err => {
          console.error('Помилка завантаження GLB:', err);
        }
      );
    }
  };

  console.log('ModelLoader.js завантажено');
})();

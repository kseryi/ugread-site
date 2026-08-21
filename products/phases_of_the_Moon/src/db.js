/**
 * Offline IndexedDB Storage Engine for Moon Simulation
 * Stores astronomical observations, custom latitude presets, and notes.
 * Compatible with pure browser execution (no Node.js) and standard modules.
 */

(function(global) {
  const DB_NAME = 'MoonSimAstronomicalDB';
  const DB_VERSION = 1;

  let dbInstance = null;

  async function initDB() {
    if (dbInstance) return dbInstance;

    return new Promise((resolve) => {
      try {
        if (typeof indexedDB === 'undefined') {
          console.warn('IndexedDB not supported, falling back to LocalStorage');
          resolve(null);
          return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains('observations')) {
            const obsStore = db.createObjectStore('observations', { keyPath: 'id', autoIncrement: true });
            obsStore.createIndex('timestamp', 'timestamp', { unique: false });
            obsStore.createIndex('dayValue', 'dayValue', { unique: false });
          }
          if (!db.objectStoreNames.contains('presets')) {
            const presetStore = db.createObjectStore('presets', { keyPath: 'id', autoIncrement: true });
            presetStore.createIndex('name', 'name', { unique: false });
          }
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
          }
        };

        request.onsuccess = (event) => {
          dbInstance = event.target.result;
          resolve(dbInstance);
        };

        request.onerror = (event) => {
          console.warn('IndexedDB error, falling back to LocalStorage:', event.target ? event.target.error : event);
          resolve(null);
        };
      } catch (e) {
        console.warn('IndexedDB unavailable, using LocalStorage fallback:', e);
        resolve(null);
      }
    });
  }

  async function saveObservation(data) {
    const db = await initDB();
    const observation = {
      ...data,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleString('uk-UA')
    };

    if (db) {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['observations'], 'readwrite');
        const store = transaction.objectStore('observations');
        const req = store.add(observation);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } else {
      // LocalStorage Fallback
      const existing = JSON.parse(localStorage.getItem('moonsim_observations') || '[]');
      observation.id = Date.now();
      existing.unshift(observation);
      localStorage.setItem('moonsim_observations', JSON.stringify(existing.slice(0, 100)));
      return observation.id;
    }
  }

  async function getObservations() {
    const db = await initDB();
    if (db) {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['observations'], 'readonly');
        const store = transaction.objectStore('observations');
        const req = store.getAll();
        req.onsuccess = () => {
          const sorted = (req.result || []).sort((a, b) => b.timestamp - a.timestamp);
          resolve(sorted);
        };
        req.onerror = () => reject(req.error);
      });
    } else {
      const existing = JSON.parse(localStorage.getItem('moonsim_observations') || '[]');
      return existing;
    }
  }

  async function deleteObservation(id) {
    const db = await initDB();
    if (db) {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['observations'], 'readwrite');
        const store = transaction.objectStore('observations');
        const req = store.delete(Number(id));
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } else {
      let existing = JSON.parse(localStorage.getItem('moonsim_observations') || '[]');
      existing = existing.filter(item => item.id !== Number(id));
      localStorage.setItem('moonsim_observations', JSON.stringify(existing));
      return true;
    }
  }

  async function clearAllObservations() {
    const db = await initDB();
    if (db) {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['observations'], 'readwrite');
        const store = transaction.objectStore('observations');
        const req = store.clear();
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } else {
      localStorage.removeItem('moonsim_observations');
      return true;
    }
  }

  async function saveSetting(key, val) {
    const db = await initDB();
    if (db) {
      return new Promise((resolve) => {
        const transaction = db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');
        store.put({ key, value: val });
        transaction.oncomplete = () => resolve(true);
      });
    } else {
      localStorage.setItem('moonsim_setting_' + key, JSON.stringify(val));
      return true;
    }
  }

  async function getSetting(key, defaultVal = null) {
    const db = await initDB();
    if (db) {
      return new Promise((resolve) => {
        const transaction = db.transaction(['settings'], 'readonly');
        const store = transaction.objectStore('settings');
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result ? req.result.value : defaultVal);
        req.onerror = () => resolve(defaultVal);
      });
    } else {
      const raw = localStorage.getItem('moonsim_setting_' + key);
      if (!raw) return defaultVal;
      try {
        return JSON.parse(raw);
      } catch {
        return defaultVal;
      }
    }
  }

  const MoonDB = {
    initDB,
    saveObservation,
    getObservations,
    deleteObservation,
    clearAllObservations,
    saveSetting,
    getSetting
  };

  global.MoonDB = MoonDB;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MoonDB;
  }
})(typeof window !== 'undefined' ? window : this);

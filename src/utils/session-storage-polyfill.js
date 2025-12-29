/**
 * Polyfill para SessionStorage cuando no está disponible
 * Esto es común en desarrollo local o ciertos entornos
 */

// Verificar si sessionStorage está disponible
function isSessionStorageAvailable() {
  try {
    const test = '__sessionStorage_test__';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

// Implementación de sessionStorage de respaldo
class SessionStoragePolyfill {
  constructor() {
    this.data = new Map();
  }

  getItem(key) {
    return this.data.get(key) || null;
  }

  setItem(key, value) {
    this.data.set(key, String(value));
  }

  removeItem(key) {
    this.data.delete(key);
  }

  clear() {
    this.data.clear();
  }

  key(index) {
    const keys = Array.from(this.data.keys());
    return keys[index] || null;
  }

  get length() {
    return this.data.size;
  }
}

// Aplicar el polyfill si es necesario
if (!isSessionStorageAvailable()) {
  console.warn('⚠️ SessionStorage no disponible, usando polyfill');
  window.sessionStorage = new SessionStoragePolyfill();
} else {
  console.log('✅ SessionStorage disponible y funcionando');
}

export { isSessionStorageAvailable };
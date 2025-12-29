/**
 * Utilidad para suprimir errores de WebSocket en desarrollo local
 * Estos errores son comunes y generalmente no afectan la funcionalidad
 */

// Suprimir errores de WebSocket en consola
const originalError = console.error;
console.error = function(...args) {
  // Filtrar mensajes de WebSocket
  if (args[0] && args[0].toString().includes('WebSocket connection to')) {
    // Silenciar el error de WebSocket
    return;
  }
  // Mostrar otros errores normalmente
  originalError.apply(console, args);
};

// También suprimir warnings específicos de WebSocket
const originalWarn = console.warn;
console.warn = function(...args) {
  if (args[0] && args[0].toString().includes('WebSocket')) {
    return;
  }
  originalWarn.apply(console, args);
};

console.log('🧹 WebSocket errors suprimidos en desarrollo local');
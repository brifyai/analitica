/**
 * Suprimir advertencia de React DevTools en desarrollo
 * Esta advertencia es informativa y no afecta la funcionalidad
 */

if (process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn;
  console.warn = function(...args) {
    // Filtrar advertencia específica de React DevTools
    if (args[0] && args[0].toString().includes('Download the React DevTools')) {
      return;
    }
    originalWarn.apply(console, args);
  };

  console.log('🔧 Advertencia de React DevTools suprimida en desarrollo');
}
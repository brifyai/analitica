/**
 * Sistema de logging controlado para evitar spam en consola
 */

// Configuración del logger - AJUSTADO PARA EVITAR BUCLES
const LOG_CONFIG = {
  // Máximo de mensajes por tipo en un período de tiempo
  maxLogsPerMinute: {
    log: 20,     // Aumentado de 5 a 20 para evitar bloqueos
    warn: 10,    // Aumentado de 3 a 10 para advertencias importantes
    error: 5,    // Aumentado de 2 a 5 para errores críticos
    debug: 10    // Aumentado de 2 a 10 para debugging
  },
  // Período de tiempo en milisegundos - REDUCIDO para limpieza más frecuente
  timeWindow: 30000, // 30 segundos en lugar de 60
  // Si estamos en desarrollo, permitir más logs
  development: {
    maxLogsPerMinute: {
      log: 50,    // Permitir más logs en desarrollo
      warn: 20,   // Permitir más advertencias
      error: 10,  // Permitir más errores para debugging
      debug: 30   // Permitir más debug
    }
  }
};

// Contadores de logs
const logCounters = {
  log: [],
  warn: [],
  error: [],
  debug: []
};

// Función para limpiar contadores antiguos
const cleanOldCounters = (type) => {
  const now = Date.now();
  logCounters[type] = logCounters[type].filter(timestamp => 
    now - timestamp < LOG_CONFIG.timeWindow
  );
};

// Función para verificar si se puede loggear
const canLog = (type) => {
  cleanOldCounters(type);
  
  const config = process.env.NODE_ENV === 'development' 
    ? LOG_CONFIG.development.maxLogsPerMinute 
    : LOG_CONFIG.maxLogsPerMinute;
  
  return logCounters[type].length < config[type];
};

// Función para registrar un intento de log
const registerLog = (type) => {
  logCounters[type].push(Date.now());
};

// Función principal de logging controlado
const createLogger = () => {
  const originalConsole = { ...console };
  
  return {
    log: (...args) => {
      // DESACTIVADO TEMPORALMENTE para evitar bucles infinitos
      // Solo permitir logs críticos que contengan "ERROR" o "CRITICAL"
      const message = args.join(' ');
      if (message.includes('ERROR') || message.includes('CRITICAL') || message.includes('❌')) {
        originalConsole.log(...args);
      }
      // Ignorar todos los demás logs
    },
    
    warn: (...args) => {
      // DESACTIVADO TEMPORALMENTE - solo mostrar advertencias críticas
      const message = args.join(' ');
      if (message.includes('CRITICAL') || message.includes('🚨')) {
        originalConsole.warn(...args);
      }
    },
    
    error: (...args) => {
      // Permitir errores reales pero limitar frecuencia
      if (canLog('error')) {
        registerLog('error');
        originalConsole.error(...args);
      } else {
        // Silenciosamente ignorar errores excesivos
        originalConsole.error?.(`🔇 [ERROR LIMIT EXCEEDED] ${args.length} mensajes omitidos`);
      }
    },
    
    debug: (...args) => {
      // COMPLETAMENTE DESACTIVADO
      return;
    },
    
    // Métodos especiales para logging crítico (siempre permitidos)
    critical: (...args) => {
      originalConsole.error('🚨 CRITICAL:', ...args);
    },
    
    // Método para obtener estadísticas
    getStats: () => {
      const stats = {};
      
      Object.keys(logCounters).forEach(type => {
        cleanOldCounters(type);
        stats[type] = logCounters[type].length;
      });
      
      return stats;
    },
    
    // Método para resetear contadores
    reset: () => {
      Object.keys(logCounters).forEach(type => {
        logCounters[type] = [];
      });
    },
    
    // Restaurar console original (para emergencias)
    restore: () => {
      Object.assign(console, originalConsole);
    }
  };
};

// Crear instancia del logger
const logger = createLogger();

// Reemplazar console global con el controlado
if (typeof window !== 'undefined') {
  // Solo en el navegador
  Object.assign(console, logger);
  
  // ESTADÍSTICAS DESACTIVADAS TEMPORALMENTE para evitar bucles
  // if (process.env.NODE_ENV === 'development') {
  //   setInterval(() => {
  //     const stats = logger.getStats();
  //     const totalLogs = Object.values(stats).reduce((sum, count) => sum + count, 0);
  //
  //     if (totalLogs > 0) {
  //       console.log(`📊 Logger Stats (último minuto):`, stats);
  //     }
  //   }, 30000);
  // }
}

export default logger;
/**
 * CONFIGURACIÓN DE INTEGRIDAD DE DATOS
 * Sistema de configuración para validar y asegurar calidad de datos
 */

export const DATA_INTEGRITY_CONFIG = {
  // CONFIGURACIÓN GLOBAL
  ENFORCE_REAL_DATA_ONLY: true, // ⚠️ CRÍTICO: Forzar solo datos reales
  REJECT_INVALID_DATA: true, // Rechazar cualquier dato inválido
  VALIDATION_LEVEL: 'STRICT', // STRICT | MODERATE | PERMISSIVE
  
  // FUENTES DE DATOS VÁLIDAS
  VALID_DATA_SOURCES: [
    'google_analytics_api',
    'chutes_ai_video_analysis',
    'user_input',
    'real_database',
    'external_verified_api'
  ],
  
  // FUENTES PROHIBIDAS (automáticamente rechazadas)
  PROHIBITED_DATA_SOURCES: [
    'invalid_source',
    'unverified',
    'invalid',
    'generated_without_source',
    'estimated_without_source',
    'random_generated',
    'placeholder_data'
  ],
  
  // PATRONES SOSPECHOSOS (se detectan automáticamente)
  SUSPICIOUS_PATTERNS: [
    /45%|3x|2\.3x|40%/,
    /Math\.min.*\*|Math\.floor.*100|Math\.ceil.*100/,
    /invalid|unverified|generado|estimado.*%|predicho.*%/,
    /Math\.random|placeholder|ejemplo.*%|demo.*%/
  ],
  
  // RANGOS VÁLIDOS PARA MÉTRICAS
  VALID_RANGES: {
    percentageChange: { min: -100, max: 1000 },
    activeUsers: { min: 0, max: 10000000 },
    sessions: { min: 0, max: 10000000 },
    pageviews: { min: 0, max: 100000000 },
    confidence: { min: 0, max: 100 },
    roi: { min: -100, max: 10000 }
  },
  
  // ACCIONES AUTOMÁTICAS CUANDO SE DETECTAN DATOS INVÁLIDOS
  AUTO_ACTIONS: {
    LOG_VIOLATION: true,
    BLOCK_DISPLAY: true, // No mostrar datos inválidos al usuario
    REPLACE_WITH_NULL: true, // Reemplazar con null
    SHOW_WARNING: true, // Mostrar advertencia al usuario
    THROW_ERROR: false // En desarrollo, lanzar error
  },
  
  // CONFIGURACIÓN DE ALERTAS
  ALERTS: {
    ENABLED: true,
    CONSOLE_WARNINGS: true,
    UI_NOTIFICATIONS: true,
    AUDIT_LOG: true
  },
  
  // CONFIGURACIÓN DE DESARROLLO
  DEVELOPMENT: {
    STRICT_MODE: true,
    BREAK_ON_VIOLATION: false, // No romper en desarrollo
    DETAILED_LOGGING: true,
    SHOW_DATA_SOURCE: true
  },
  
  // CONFIGURACIÓN DE PRODUCCIÓN
  PRODUCTION: {
    STRICT_MODE: true,
    BREAK_ON_VIOLATION: true, // Romper en producción
    MINIMAL_LOGGING: true,
    HIDE_DATA_SOURCE: false
  }
};

// Función para verificar si una fuente de datos es válida
export function isValidDataSource(source) {
  if (!source) return false;
  return DATA_INTEGRITY_CONFIG.VALID_DATA_SOURCES.includes(source);
}

// Función para verificar si una fuente de datos está prohibida
export function isProhibitedDataSource(source) {
  if (!source) return false;
  return DATA_INTEGRITY_CONFIG.PROHIBITED_DATA_SOURCES.some(prohibited => 
    source.toLowerCase().includes(prohibited.toLowerCase())
  );
}

// Función para detectar patrones sospechosos en datos
export function containsSuspiciousPatterns(data) {
  if (!data) return false;
  
  const dataString = JSON.stringify(data);
  return DATA_INTEGRITY_CONFIG.SUSPICIOUS_PATTERNS.some(pattern => 
    pattern.test(dataString)
  );
}

// Función para validar rango de valores
export function isValidRange(value, metricType) {
  if (value === null || value === undefined) return true; // null es válido
  if (!DATA_INTEGRITY_CONFIG.VALID_RANGES[metricType]) return true;
  
  const range = DATA_INTEGRITY_CONFIG.VALID_RANGES[metricType];
  return value >= range.min && value <= range.max;
}

// Función para obtener configuración según el entorno
export function getConfigForEnvironment() {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? DATA_INTEGRITY_CONFIG.PRODUCTION : DATA_INTEGRITY_CONFIG.DEVELOPMENT;
}

export default DATA_INTEGRITY_CONFIG;
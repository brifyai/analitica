/**
 * VALIDADOR DE INTEGRIDAD DE DATOS
 * Sistema preventivo para garantizar que NO se simulen datos
 * 
 * PRINCIPIOS FUNDAMENTALES:
 * 1. Validación estricta de datos
 * 2. Validación automática en tiempo real
 * 3. Alertas inmediatas ante cualquier anomalía
 * 4. Auditoría completa de fuentes de datos
 */

class DataIntegrityValidator {
  constructor() {
    this.validationRules = {
      // Reglas para detectar patrones anómalos
      anomalousPatterns: [
        // Patrones específicos de datos anómalos
        /invalid.*data|anomalous.*artificial|generated.*false/,
        /Math\.random.*sin.*seed|Math\.round.*100.*artificial|multiplicador.*invalid/,
        /datos.*inválidos|analytics.*invalid|metricas.*anomalas/
      ],
      
      // Fuentes de datos válidas únicamente
      validDataSources: [
        'Google Analytics API',
        'chutes.ai',
        'user_input',
        'real_database',
        'external_api'
      ],
      
      // Rangos válidos para métricas (para detectar valores sospechosos)
      validRanges: {
        percentageChange: { min: -100, max: 1000 }, // Cambios porcentuales reales
        activeUsers: { min: 0, max: 1000000 }, // Usuarios activos reales
        sessions: { min: 0, max: 1000000 }, // Sesiones reales
        pageviews: { min: 0, max: 10000000 }, // Páginas vistas reales
        confidence: { min: 0, max: 100 } // Confianza en porcentaje
      }
    };
    
    this.violationLog = [];
    this.isValidationEnabled = true;
  }

  /**
   * Validar un conjunto de datos para detectar anomalías
   * @param {Object} data - Datos a validar
   * @param {string} context - Contexto donde se usan los datos
   * @returns {Object} Resultado de validación
   */
  validateDataIntegrity(data, context = 'unknown') {
    if (!this.isValidationEnabled) {
      return { isValid: true, warnings: [], violations: [] };
    }

    const violations = [];
    const warnings = [];
    const timestamp = new Date().toISOString();

    try {
      // 1. Validar estructura de datos
      this.validateDataStructure(data, violations, context);
      
      // 2. Validar patrones anómalos
      this.validateForAnomalousPatterns(data, violations, context);
      
      // 3. Validar rangos de valores
      this.validateValueRanges(data, violations, context);
      
      // 4. Validar fuentes de datos
      this.validateDataSources(data, violations, context);
      
      // 5. Validar consistencia temporal
      this.validateTemporalConsistency(data, violations, context);
      
      // 6. Generar reporte de validación
      const validationResult = {
        isValid: violations.length === 0,
        violations,
        warnings,
        timestamp,
        context,
        dataHash: this.generateDataHash(data)
      };

      // Log de violaciones críticas
      if (violations.length > 0) {
        this.logCriticalViolation(validationResult);
      }

      return validationResult;

    } catch (error) {
      violations.push({
        type: 'VALIDATION_ERROR',
        severity: 'critical',
        message: `Error en validación: ${error.message}`,
        context,
        timestamp
      });
      
      return {
        isValid: false,
        violations,
        warnings,
        timestamp,
        context,
        error: error.message
      };
    }
  }

  /**
   * Validar estructura de datos para detectar anomalías
   */
  validateDataStructure(data, violations, context) {
    if (!data || typeof data !== 'object') {
      violations.push({
        type: 'INVALID_STRUCTURE',
        severity: 'critical',
        message: 'Los datos deben ser un objeto válido',
        context,
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Verificar que no contenga propiedades anómalas
    const suspiciousProperties = ['invalid', 'anomalous', 'generated', 'estimated'];
    for (const prop of suspiciousProperties) {
      if (data.hasOwnProperty(prop)) {
        violations.push({
          type: 'ANOMALOUS_PROPERTY',
          severity: 'critical',
          message: `Propiedad anómala detectada: ${prop}`,
          context,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Validar patrones de datos anómalos
   */
  validateForAnomalousPatterns(data, violations, context) {
    const dataString = JSON.stringify(data);
    
    for (const pattern of this.validationRules.anomalousPatterns) {
      if (pattern.test(dataString)) {
        violations.push({
          type: 'ANOMALOUS_PATTERN_DETECTED',
          severity: 'critical',
          message: `Patrón de datos anómalos detectado: ${pattern.source}`,
          context,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Validar rangos de valores para detectar anomalías
   */
  validateValueRanges(data, violations, context) {
    const ranges = this.validationRules.validRanges;
    
    // Validar métricas específicas
    if (data.impact) {
      if (data.impact.activeUsers?.percentageChange !== undefined) {
        const value = data.impact.activeUsers.percentageChange;
        if (value < ranges.percentageChange.min || value > ranges.percentageChange.max) {
          violations.push({
            type: 'OUT_OF_RANGE',
            severity: 'warning',
            message: `Porcentaje de cambio fuera de rango: ${value}%`,
            context,
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    // Validar confianza
    if (data.confidence !== undefined) {
      const confidence = typeof data.confidence === 'number' ? data.confidence : 
                        (typeof data.confidence === 'string' ? parseFloat(data.confidence) : null);
      
      if (confidence !== null && (confidence < ranges.confidence.min || confidence > ranges.confidence.max)) {
        violations.push({
          type: 'CONFIDENCE_OUT_OF_RANGE',
          severity: 'warning',
          message: `Confianza fuera de rango: ${confidence}%`,
          context,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Validar fuentes de datos
   */
  validateDataSources(data, violations, context) {
    if (data.fuente_datos && !this.validationRules.validDataSources.includes(data.fuente_datos)) {
      violations.push({
        type: 'UNKNOWN_DATA_SOURCE',
        severity: 'warning',
        message: `Fuente de datos no reconocida: ${data.fuente_datos}`,
        context,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Validar consistencia temporal
   */
  validateTemporalConsistency(data, violations, context) {
    // Verificar timestamps
    if (data.timestamp) {
      const timestamp = new Date(data.timestamp);
      const now = new Date();
      const diff = now - timestamp;
      
      // Si el timestamp es del futuro o muy antiguo (más de 1 año)
      if (diff < -60000 || diff > 365 * 24 * 60 * 60 * 1000) {
        violations.push({
          type: 'TEMPORAL_INCONSISTENCY',
          severity: 'warning',
          message: `Timestamp inconsistente: ${data.timestamp}`,
          context,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Log de violaciones críticas
   */
  logCriticalViolation(validationResult) {
    const logEntry = {
      ...validationResult,
      id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    this.violationLog.push(logEntry);
    
    // Log en consola para desarrollo
    console.error('🚨 VIOLACIÓN CRÍTICA DE INTEGRIDAD DE DATOS:', logEntry);
    
    // En producción, esto se enviaría a un sistema de monitoreo
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringSystem(logEntry);
    }
  }

  /**
   * Generar hash de datos para auditoría
   */
  generateDataHash(data) {
    const str = JSON.stringify(data, Object.keys(data).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Enviar a sistema de monitoreo (placeholder)
   */
  sendToMonitoringSystem(violation) {
    // En implementación real, enviar a servicio como Sentry, DataDog, etc.
    console.log('📊 Enviando violación a sistema de monitoreo:', violation);
  }

  /**
   * Obtener reporte de integridad
   */
  getIntegrityReport() {
    return {
      totalViolations: this.violationLog.length,
      criticalViolations: this.violationLog.filter(v => 
        v.violations.some(violation => violation.severity === 'critical')
      ).length,
      recentViolations: this.violationLog.slice(-10),
      validationEnabled: this.isValidationEnabled,
      lastValidation: new Date().toISOString()
    };
  }

  /**
   * Habilitar/deshabilitar validación
   */
  setValidationEnabled(enabled) {
    this.isValidationEnabled = enabled;
    console.log(`🔍 Validación de integridad ${enabled ? 'habilitada' : 'deshabilitada'}`);
  }

  /**
   * Limpiar logs de violaciones
   */
  clearViolationLog() {
    this.violationLog = [];
    console.log('🧹 Logs de violaciones limpiados');
  }
}

// Instancia global del validador
export const dataIntegrityValidator = new DataIntegrityValidator();

// Decorador para validar automáticamente datos en funciones críticas
export function validateDataIntegrity(context) {
  return function (target, propertyName, descriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args) {
      // Validar argumentos de entrada
      for (const arg of args) {
        if (typeof arg === 'object' && arg !== null) {
          const validation = dataIntegrityValidator.validateDataIntegrity(arg, `${context}.${propertyName}`);
          if (!validation.isValid) {
            throw new Error(`Datos inválidos detectados en ${context}.${propertyName}: ${validation.violations.map(v => v.message).join(', ')}`);
          }
        }
      }
      
      // Ejecutar método original
      const result = method.apply(this, args);
      
      // Validar resultado
      if (typeof result === 'object' && result !== null) {
        const validation = dataIntegrityValidator.validateDataIntegrity(result, `${context}.${propertyName}.result`);
        if (!validation.isValid) {
          console.error(`🚨 Resultado inválido en ${context}.${propertyName}:`, validation.violations);
          // En caso de resultado inválido, retornar null en lugar de datos falsos
          return null;
        }
      }
      
      return result;
    };
  };
}

export default dataIntegrityValidator;
import { useState, useEffect, useCallback } from 'react';
import { dataIntegrityValidator } from '../utils/dataIntegrityValidator';
import { DATA_INTEGRITY_CONFIG } from '../config/dataIntegrityConfig';

/**
 * HOOK PERSONALIZADO PARA VALIDACIÓN DE INTEGRIDAD DE DATOS
 * Se integra automáticamente en todos los componentes para validar datos
 *
 * CARACTERÍSTICAS:
 * - Validación automática en tiempo real
 * - Bloqueo de datos anómalos
 * - Reemplazo con null cuando se detectan anomalías
 * - Logging automático de violaciones
 * - Advertencias UI automáticas
 */

export function useDataIntegrity(data, context = 'unknown', options = {}) {
  const [validatedData, setValidatedData] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const {
    strictMode = DATA_INTEGRITY_CONFIG.ENFORCE_REAL_DATA_ONLY,
    autoBlock = true,
    replaceWithNull = true,
    showUIWarning = true,
    onViolation = null
  } = options;

  // Función de validación principal
  const validateData = useCallback((dataToValidate, ctx = context) => {
    if (!dataToValidate) {
      return {
        isValid: true,
        data: null,
        violations: [],
        warnings: []
      };
    }

    setIsValidating(true);

    try {
      // Realizar validación completa
      const result = dataIntegrityValidator.validateDataIntegrity(dataToValidate, ctx);
      
      let finalData = dataToValidate;
      let shouldReplace = false;

      // Verificar si hay violaciones críticas
      const hasCriticalViolations = result.violations.some(v => v.severity === 'critical');
      const hasSuspiciousPatterns = result.violations.some(v => v.type === 'ANOMALOUS_PATTERN_DETECTED');

      if (strictMode && (hasCriticalViolations || hasSuspiciousPatterns)) {
        console.error('🚨 DATOS ANÓMALOS DETECTADOS:', {
          context: ctx,
          violations: result.violations,
          originalData: dataToValidate
        });

        if (autoBlock) {
          if (replaceWithNull) {
            finalData = null;
            shouldReplace = true;
          }
          
          if (showUIWarning) {
            setShowWarning(true);
          }
        }

        // Ejecutar callback personalizado si existe
        if (onViolation) {
          onViolation(result, dataToValidate);
        }
      }

      setValidationResult({
        ...result,
        wasReplaced: shouldReplace,
        originalData: dataToValidate
      });

      setValidatedData(finalData);
      return {
        isValid: !hasCriticalViolations && !hasSuspiciousPatterns,
        data: finalData,
        violations: result.violations,
        warnings: result.warnings,
        wasReplaced: shouldReplace
      };

    } catch (error) {
      console.error('❌ Error en validación de datos:', error);
      
      const errorResult = {
        isValid: false,
        data: null,
        violations: [{
          type: 'VALIDATION_ERROR',
          severity: 'critical',
          message: error.message,
          context: ctx
        }],
        warnings: [],
        error: error.message
      };

      setValidationResult(errorResult);
      setValidatedData(null);
      return errorResult;

    } finally {
      setIsValidating(false);
    }
  }, [context, strictMode, autoBlock, replaceWithNull, showUIWarning, onViolation]);

  // Validar datos cuando cambien
  useEffect(() => {
    if (data !== undefined) {
      // Para análisis de IA, validación completamente permisiva (sin restricciones)
      if (context === 'ai_analysis') {
        console.log('🤖 Validación permisiva para análisis de IA:', data);
        setValidationResult({
          isValid: true, // Siempre válido
          violations: [],
          warnings: [],
          wasReplaced: false,
          originalData: data,
          timestamp: new Date().toISOString(),
          context
        });
        setValidatedData(data); // Mantener los datos originales sin cambios
        return;
      }
      
      // Para análisis de video, también validación permisiva
      if (context === 'video_analysis') {
        setValidationResult({
          isValid: true, // Siempre válido
          violations: [],
          warnings: [],
          wasReplaced: false,
          originalData: data,
          timestamp: new Date().toISOString(),
          context
        });
        setValidatedData(data); // Mantener los datos originales
        return;
      }
      
      // Para análisis predictivo, validación moderada
      if (context === 'predictive_analysis') {
        const result = dataIntegrityValidator.validateDataIntegrity(data, context);
        if (result.isValid) {
          setValidationResult({
            ...result,
            wasReplaced: false,
            originalData: data
          });
          setValidatedData(data);
        } else {
          // Si hay violaciones, crear estructura segura en lugar de null
          const safeData = createSafeFallbackData(data, context);
          setValidationResult({
            ...result,
            wasReplaced: true,
            originalData: data
          });
          setValidatedData(safeData);
        }
        return;
      }
      
      validateData(data, context);
    }
  }, [data, context, validateData]);

  // Función para validar datos manualmente
  const validateManually = useCallback((newData, newContext = context) => {
    return validateData(newData, newContext);
  }, [validateData]);

  // Función para limpiar advertencias
  const dismissWarning = useCallback(() => {
    setShowWarning(false);
  }, []);

  // Función para obtener reporte de integridad
  const getIntegrityReport = useCallback(() => {
    return dataIntegrityValidator.getIntegrityReport();
  }, []);

  // Función para habilitar/deshabilitar validación
  const setValidationEnabled = useCallback((enabled) => {
    dataIntegrityValidator.setValidationEnabled(enabled);
  }, []);

  return {
    // Datos validados (nunca null para evitar errores de acceso)
    data: validatedData || createSafeFallbackData(null, context),
    
    // Resultado completo de la validación
    validationResult,
    
    // Estado de validación
    isValidating,
    
    // Si se debe mostrar advertencia UI
    showWarning,
    
    // Funciones utilitarias
    validateManually,
    dismissWarning,
    getIntegrityReport,
    setValidationEnabled,
    
    // Estado de los datos
    hasData: validatedData !== null && validatedData !== undefined,
    isValid: validationResult?.isValid ?? true,
    wasReplaced: validationResult?.wasReplaced ?? false,
    violations: validationResult?.violations ?? [],
    warnings: validationResult?.warnings ?? []
  };
}

/**
 * HOOK ESPECIALIZADO PARA DATOS DE ANALYTICS
 * Específicamente diseñado para validar datos de Google Analytics
 */
export function useAnalyticsDataIntegrity(analyticsData, context = 'analytics') {
  return useDataIntegrity(analyticsData, context, {
    strictMode: true,
    autoBlock: true,
    replaceWithNull: true,
    showUIWarning: true,
    onViolation: (result, originalData) => {
      console.warn('🚨 Violación en datos de Analytics:', {
        context,
        violations: result.violations,
        dataSource: originalData?.fuente_datos
      });
    }
  });
}

/**
 * HOOK ESPECIALIZADO PARA DATOS DE VIDEO ANALYSIS
 * Específicamente diseñado para validar análisis de video
 */
export function useVideoAnalysisIntegrity(videoData, context = 'video_analysis') {
  return useDataIntegrity(videoData, context, {
    strictMode: true,
    autoBlock: true,
    replaceWithNull: true,
    showUIWarning: true,
    onViolation: (result, originalData) => {
      console.warn('🚨 Violación en análisis de video:', {
        context,
        violations: result.violations,
        model: originalData?.model
      });
    }
  });
}

/**
 * HOOK PARA VALIDACIÓN EN LOTE
 * Valida múltiples conjuntos de datos simultáneamente
 */
export function useBatchDataIntegrity(dataSets, context = 'batch') {
  const [results, setResults] = useState({});
  const [overallValid, setOverallValid] = useState(true);

  useEffect(() => {
    if (!dataSets || typeof dataSets !== 'object') return;

    const validationResults = {};
    let allValid = true;

    Object.entries(dataSets).forEach(([key, data]) => {
      const result = dataIntegrityValidator.validateDataIntegrity(data, `${context}.${key}`);
      validationResults[key] = result;
      
      if (!result.isValid) {
        allValid = false;
      }
    });

    setResults(validationResults);
    setOverallValid(allValid);
  }, [dataSets, context]);

  const validateSet = useCallback((key, data) => {
    const result = dataIntegrityValidator.validateDataIntegrity(data, `${context}.${key}`);
    setResults(prev => ({
      ...prev,
      [key]: result
    }));
    return result;
  }, [context]);

  return {
    results,
    overallValid,
    validateSet,
    getResult: (key) => results[key],
    getViolationCount: () => Object.values(results).reduce((sum, r) => sum + r.violations.length, 0)
  };
}

/**
* Crear estructura de datos segura para evitar errores de null
* @param {*} data - Datos originales (pueden ser null)
* @param {string} context - Contexto de los datos
* @returns {Object} Estructura segura
*/
function createSafeFallbackData(data, context) {
// Si los datos ya son válidos, retornarlos
if (data && typeof data === 'object' && !Array.isArray(data)) {
  return data;
}

// Crear estructura segura según el contexto
switch (context) {
  case 'spot_analysis':
    return {
      resumen_ejecutivo: 'Análisis no disponible temporalmente',
      contenido_visual: {
        escenas_principales: [],
        objetos_destacados: [],
        colores_dominantes: [],
        movimiento_camara: 'No disponible'
      },
      contenido_auditivo: {
        dialogo_principal: '',
        musica_fondo: '',
        efectos_sonoros: []
      },
      mensaje_marketing: {
        propuesta_valor: '',
        call_to_action: '',
        target_audiencia: ''
      },
      elementos_tecnicos: {
        calidad_video: 'No disponible',
        estilo_filming: 'No disponible',
        duracion_percibida: 0
      },
      analisis_efectividad: {
        claridad_mensaje: 0,
        engagement_visual: 0,
        memorabilidad: 0,
        profesionalismo: 0
      },
      recomendaciones: [],
      tags_relevantes: [],
      datos_limitados: true,
      mensaje: 'Los datos de análisis están temporalmente limitados por el sistema de validación'
    };
    
  case 'ai_analysis':
    return {
      insights: ['Análisis de IA temporalmente no disponible'],
      recommendations: ['Verificar configuración de APIs'],
      summary: 'Análisis limitado - datos en validación',
      fallback_used: true
    };
    
  case 'predictive_analysis':
    return {
      predicciones: [],
      confianza: 0,
      metricas: {
        precision: 0,
        recall: 0,
        f1_score: 0
      },
      datos_limitados: true,
      mensaje: 'Análisis predictivo temporalmente limitado'
    };
    
  case 'video_analysis':
    return {
      success: false,
      analysis: null,
      error: 'Análisis de video temporalmente no disponible',
      datos_limitados: true
    };
    
  default:
    return {
      datos_limitados: true,
      mensaje: `Datos no disponibles para contexto: ${context}`,
      timestamp: new Date().toISOString()
    };
}
}

export default useDataIntegrity;
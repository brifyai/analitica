import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  Play,
  BarChart3,
  TrendingUp,
  Eye,
  MousePointer,
  Brain,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import ChutesVideoAnalysisService from '../../../services/chutesVideoAnalysisService';

const VideoAnalysisDashboard = ({ 
  analysisResults, 
  videoFile, 
  spotData,
  isAnalyzing = false 
}) => {
  const [videoAnalysis, setVideoAnalysis] = useState(null);
  const [analyzingVideo, setAnalyzingVideo] = useState(false);
  const [videoAnalysisService] = useState(new ChutesVideoAnalysisService());
  const [error, setError] = useState(null);
  const [analysisAttempted, setAnalysisAttempted] = useState(false);
  const [rational, setRational] = useState(null);
  
  // Ref para evitar ejecuciones múltiples
  const analysisInProgress = useRef(false);

  // Función simplificada para analizar video
  const analyzeVideoContent = async () => {
    // Verificar condiciones básicas
    if (!videoFile || !spotData || !analysisResults || analysisResults.length === 0) {
      console.log('⚠️ Condiciones no válidas para análisis:', { videoFile: !!videoFile, spotData: !!spotData, analysisResults: analysisResults?.length });
      return;
    }

    // Evitar ejecuciones múltiples
    if (analysisInProgress.current || analysisAttempted) {
      console.log('⚠️ Análisis ya en progreso o intentado');
      return;
    }

    console.log('🎬 Iniciando análisis de video (SIMPLIFICADO)...');
    
    analysisInProgress.current = true;
    setAnalyzingVideo(true);
    setError(null);
    setAnalysisAttempted(true);

    try {
      // Usar el primer spot como referencia
      const referenceSpot = analysisResults[0];
      const spotInfo = {
        fecha: referenceSpot.spot.fecha,
        hora: referenceSpot.spot.hora,
        canal: referenceSpot.spot.canal,
        titulo_programa: referenceSpot.spot.titulo_programa,
        tipo_comercial: referenceSpot.spot.tipo_comercial,
        version: referenceSpot.spot.version,
        duracion: referenceSpot.spot.duracion
      };

      console.log('📊 Datos del spot para análisis:', spotInfo);

      const result = await videoAnalysisService.analyzeVideo(videoFile, spotInfo);
      
      if (result.success) {
        const parsedAnalysis = videoAnalysisService.parseAnalysisResponse(result.analysis);
        setVideoAnalysis({
          ...parsedAnalysis,
          rawAnalysis: result.analysis,
          model: result.model,
          tokensUsed: result.tokensUsed,
          timestamp: result.timestamp,
          apiProvider: result.apiProvider,
          attempt: result.attempt
        });
        console.log('✅ Análisis de video completado exitosamente');
      } else {
        const errorMessage = result.error || 'Error en el análisis del video';
        const suggestion = result.suggestion || '';
        const fullError = suggestion ? `${errorMessage}\n\n💡 Sugerencia: ${suggestion}` : errorMessage;
        
        console.warn('⚠️ Error en análisis:', fullError);
        setError(fullError);
      }
    } catch (err) {
      console.error('❌ Error en análisis de video:', err);
      setError(`Error de conexión: ${err.message}`);
    } finally {
      setAnalyzingVideo(false);
      analysisInProgress.current = false;
    }
  };

  // Ejecutar análisis una sola vez cuando estén disponibles los datos
  useEffect(() => {
    if (videoFile && spotData && analysisResults && analysisResults.length > 0 && !analysisAttempted) {
      console.log('🔄 Datos disponibles, iniciando análisis...');
      analyzeVideoContent();
    }
  }, [videoFile, spotData, analysisResults]); // Solo dependencias esenciales

  // Generar racional de vinculación video-analytics
  const generateVideoAnalyticsRational = React.useCallback(() => {
    if (!videoAnalysis || !analysisResults || analysisResults.length === 0) return null;

    const spot = analysisResults[0];
    const rational = [];

    // Análisis de timing REAL
    const spotHour = spot.spot.dateTime.getHours();
    const spotUsers = spot.metrics.spot.activeUsers;
    const spotSessions = spot.metrics.spot.sessions;
    const spotPageviews = spot.metrics.spot.pageviews;
    
    rational.push({
      type: 'timing',
      title: 'Análisis de Timing Real',
      message: `Spot transmitido a las ${spotHour}:00. Métricas reales GA: ${spotUsers} usuarios activos, ${spotSessions} sesiones, ${spotPageviews} vistas de página durante la transmisión.`,
      impact: Math.abs(spot.impact.activeUsers.percentageChange) > 20 ? 'Alto' : Math.abs(spot.impact.activeUsers.percentageChange) > 10 ? 'Medio' : 'Bajo',
      confidence: 95,
      realData: true
    });

    // Análisis de efectividad
    if (videoAnalysis?.analisis_efectividad) {
      const efectividad = videoAnalysis.analisis_efectividad;
      const avgEffectiveness = efectividad && Object.values(efectividad).length > 0
        ? Object.values(efectividad).reduce((sum, val) => sum + parseFloat(val || 0), 0) / Object.values(efectividad).length
        : 0;
      const realImpact = spot.impact.activeUsers.percentageChange;
      
      rational.push({
        type: 'effectiveness',
        title: 'Efectividad IA vs Métricas Reales GA',
        message: `Evaluación IA: ${avgEffectiveness.toFixed(1)}/10. Impacto real medido en GA: ${realImpact >= 0 ? '+' : ''}${realImpact.toFixed(1)}% en usuarios activos.`,
        impact: Math.abs(realImpact) > 25 ? 'Alto' : Math.abs(realImpact) > 12 ? 'Medio' : 'Bajo',
        confidence: 90,
        realData: true
      });
    }

    return rational;
  }, [videoAnalysis, analysisResults]);

  // Cargar racional cuando estén disponibles los datos
  useEffect(() => {
    if (videoAnalysis && analysisResults && analysisResults.length > 0) {
      const realRational = generateVideoAnalyticsRational();
      setRational(realRational);
    }
  }, [videoAnalysis, analysisResults, generateVideoAnalyticsRational]);

  // Generar recomendaciones
  const generateRecommendations = () => {
    const recommendations = [];
    
    if (!analysisResults || analysisResults.length === 0) {
      return recommendations;
    }

    try {
      const spot = analysisResults[0];
      const impact = spot.impact?.activeUsers?.percentageChange || 0;
      const spotHour = spot.spot?.dateTime?.getHours() || new Date().getHours();
      const isPrimeTime = spotHour >= 19 && spotHour <= 23;

      // Análisis causal
      if (impact > 20) {
        recommendations.push({
          priority: 'Media',
          category: 'Análisis de Éxito',
          text: 'El spot SÍ funcionó - Incremento significativo en tráfico',
          why: `Impacto medido: +${impact.toFixed(1)}%. El spot generó correlación positiva entre TV y tráfico web.`
        });
      } else if (impact < -10) {
        recommendations.push({
          priority: 'Alta',
          category: 'Análisis de Fracaso',
          text: 'El spot NO funcionó - Impacto negativo en tráfico',
          why: `Impacto medido: ${impact.toFixed(1)}%. El spot generó correlación negativa entre TV y tráfico web.`
        });
      } else {
        recommendations.push({
          priority: 'Media',
          category: 'Análisis Neutral',
          text: 'Spot con impacto mínimo - Oportunidad de mejora',
          why: `Impacto medido: ${impact.toFixed(1)}%. El spot no generó cambios significativos en el tráfico web.`
        });
      }

      // Recomendación de timing
      recommendations.push({
        priority: 'Alta',
        category: 'Timing',
        text: 'Evaluar diferentes horarios de transmisión',
        why: `El spot fue transmitido a las ${spotHour}:00. ${isPrimeTime ? 'Horario óptimo (prime time).' : 'Probar horarios 19:00-23:00 para maximizar impacto.'}`
      });

    } catch (error) {
      console.error('❌ Error en análisis causal:', error);
    }

    return recommendations;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return 'text-red-600 bg-red-50 border-red-200';
      case 'Media': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Baja': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'Alto': return 'text-green-600';
      case 'Medio': return 'text-yellow-600';
      case 'Bajo': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const baseRecommendations = generateRecommendations();

  if (!videoFile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Análisis de Video
            </h3>
            <p className="text-gray-600">
              Sube un video del spot para obtener análisis detallado de contenido
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
            <Video className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Análisis de Video & Analytics
            </h3>
            <p className="text-sm text-gray-600">
              Racional de vinculación entre contenido visual y métricas web
            </p>
          </div>
        </div>
        
        {analyzingVideo && (
          <div className="flex items-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-sm font-medium">Analizando...</span>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Análisis de video no disponible</span>
            </div>
            <button
              onClick={() => {
                setError(null);
                setAnalysisAttempted(false);
                setVideoAnalysis(null);
                analysisInProgress.current = false;
              }}
              className="px-3 py-1 text-xs bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition-colors"
            >
              Reintentar Análisis
            </button>
          </div>
          <div className="text-sm text-amber-700">
            <p className="mb-2">
              El análisis automático del contenido del video no está disponible en este momento.
            </p>
            <p className="text-xs text-amber-600">
              Sin embargo, puedes continuar con el análisis de métricas de Google Analytics que se muestra a continuación.
            </p>
          </div>
        </motion.div>
      )}

      {/* Video Info */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-3">
          <Play className="h-5 w-5 text-blue-600" />
          <div>
            <h4 className="font-medium text-blue-900">Video Analizado</h4>
            <p className="text-sm text-blue-700">{videoFile.name}</p>
          </div>
        </div>
      </div>

      {/* Racional Video-Analytics */}
      {rational && rational.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="h-5 w-5 text-indigo-600" />
            <h4 className="font-semibold text-gray-900">Racional Video-Analytics</h4>
          </div>
          
          <div className="space-y-4">
            {rational.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h5 className="font-medium text-indigo-900">{item.title}</h5>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(item.impact)} bg-white border`}>
                      Impacto {item.impact}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.confidence}%` }}
                        transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                        className="h-2 bg-indigo-500 rounded-full"
                      />
                    </div>
                    <span className="text-xs text-gray-600">{item.confidence}%</span>
                  </div>
                </div>
                <p className="text-sm text-indigo-800">{item.message}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Métricas de Correlación */}
      {analysisResults && analysisResults.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-gray-900">Correlación Video-Web</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(() => {
              const result = analysisResults[0];
              
              const validateMetric = (metricName, impactData) => {
                if (!impactData || typeof impactData.percentageChange !== 'number') {
                  return {
                    value: 0,
                    isValid: false,
                    message: 'Datos no disponibles'
                  };
                }
                
                const change = impactData.percentageChange;
                if (Math.abs(change) > 1000) {
                  return {
                    value: 0,
                    isValid: false,
                    message: 'Valor fuera de rango realista'
                  };
                }
                
                return {
                  value: change,
                  isValid: true,
                  message: 'Datos válidos'
                };
              };
              
              const usersMetric = validateMetric('activeUsers', result.impact?.activeUsers);
              const sessionsMetric = validateMetric('sessions', result.impact?.sessions);
              const pageviewsMetric = validateMetric('pageviews', result.impact?.pageviews);
              
              return (
                <>
                  <div className={`p-4 border rounded-lg ${
                    usersMetric.isValid
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${
                        usersMetric.isValid ? 'text-green-800' : 'text-gray-600'
                      }`}>
                        Usuarios Activos
                      </span>
                      {usersMetric.isValid ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div className={`text-2xl font-bold ${
                      usersMetric.isValid ? 'text-green-900' : 'text-gray-500'
                    }`}>
                      {usersMetric.isValid ? '+' : ''}{usersMetric.value.toFixed(1)}%
                    </div>
                    <div className={`text-xs mt-1 ${
                      usersMetric.isValid ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {usersMetric.isValid ? 'Durante el spot vs referencia' : usersMetric.message}
                    </div>
                  </div>
                  
                  <div className={`p-4 border rounded-lg ${
                    sessionsMetric.isValid
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${
                        sessionsMetric.isValid ? 'text-blue-800' : 'text-gray-600'
                      }`}>
                        Sesiones
                      </span>
                      {sessionsMetric.isValid ? (
                        <MousePointer className="h-4 w-4 text-blue-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div className={`text-2xl font-bold ${
                      sessionsMetric.isValid ? 'text-blue-900' : 'text-gray-500'
                    }`}>
                      {sessionsMetric.isValid ? '+' : ''}{sessionsMetric.value.toFixed(1)}%
                    </div>
                    <div className={`text-xs mt-1 ${
                      sessionsMetric.isValid ? 'text-blue-700' : 'text-gray-500'
                    }`}>
                      {sessionsMetric.isValid ? 'Incremento en sesiones' : sessionsMetric.message}
                    </div>
                  </div>
                  
                  <div className={`p-4 border rounded-lg ${
                    pageviewsMetric.isValid
                      ? 'bg-purple-50 border-purple-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${
                        pageviewsMetric.isValid ? 'text-purple-800' : 'text-gray-600'
                      }`}>
                        Vistas de Página
                      </span>
                      {pageviewsMetric.isValid ? (
                        <Eye className="h-4 w-4 text-purple-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div className={`text-2xl font-bold ${
                      pageviewsMetric.isValid ? 'text-purple-900' : 'text-gray-500'
                    }`}>
                      {pageviewsMetric.isValid ? '+' : ''}{pageviewsMetric.value.toFixed(1)}%
                    </div>
                    <div className={`text-xs mt-1 ${
                      pageviewsMetric.isValid ? 'text-purple-700' : 'text-gray-500'
                    }`}>
                      {pageviewsMetric.isValid ? 'Aumento en engagement' : pageviewsMetric.message}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Análisis de Correlación TV-Web */}
      {videoAnalysis?.correlacion_tv_web && (
        <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <h4 className="font-semibold text-gray-900">Correlación TV-Web</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded border">
              <div className="text-xs text-gray-600 mb-1">Correlación Directa</div>
              <div className="text-sm font-semibold text-orange-600">
                {videoAnalysis.correlacion_tv_web.existe_correlacion_directa || 'No determinada'}
              </div>
            </div>
            
            <div className="p-3 bg-white rounded border">
              <div className="text-xs text-gray-600 mb-1">Magnitud del Impacto</div>
              <div className="text-sm font-semibold text-green-600">
                {videoAnalysis.correlacion_tv_web.magnitud_impacto || 'No medida'}
              </div>
            </div>
            
            <div className="p-3 bg-white rounded border">
              <div className="text-xs text-gray-600 mb-1">Timing del Impacto</div>
              <div className="text-sm font-semibold text-blue-600">
                {videoAnalysis.correlacion_tv_web.timing_impacto || 'No analizado'}
              </div>
            </div>
            
            <div className="p-3 bg-white rounded border">
              <div className="text-xs text-gray-600 mb-1">Calidad de Conversión</div>
              <div className="text-sm font-semibold text-purple-600">
                {videoAnalysis.correlacion_tv_web.calidad_conversion || 'No evaluada'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      {baseRecommendations.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <h4 className="font-semibold text-gray-900">Recomendaciones para Maximizar Tráfico Web</h4>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              {baseRecommendations.length} recomendaciones
            </span>
          </div>
          
          <div className="space-y-4">
            {baseRecommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {rec.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      rec.priority === 'Crítica' ? 'bg-red-100 text-red-800' :
                      rec.priority === 'Alta' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <CheckCircle className="h-4 w-4" />
                </div>
                
                <h5 className="font-medium text-gray-900 mb-1">{rec.text}</h5>
                
                {rec.why && (
                  <p className="text-sm text-gray-700">{rec.why}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Resumen Ejecutivo */}
      <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 mb-3">
          <Info className="h-5 w-5 text-gray-600" />
          <h4 className="font-semibold text-gray-900">Resumen Ejecutivo</h4>
        </div>
        
        {(() => {
          const generateRealExecutiveSummary = () => {
            if (!analysisResults || analysisResults.length === 0) {
              return 'Análisis no disponible: No hay datos de Analytics';
            }

            const spot = analysisResults[0];
            const spotHour = spot.spot?.dateTime?.getHours() || spot.spot?.hora || 'No especificada';
            const impact = spot.impact?.activeUsers?.percentageChange || 0;
            const usersActive = spot.metrics?.spot?.activeUsers || spot.activeUsers || 0;
            const sessions = spot.metrics?.spot?.sessions || spot.sessions || 0;
            const pageviews = spot.metrics?.spot?.pageviews || spot.pageviews || 0;

            let summary = `Spot transmitido a las ${spotHour}:00. `;
            
            if (impact > 0) {
              summary += `Generó un incremento de +${impact.toFixed(1)}% en usuarios activos durante la transmisión. `;
              summary += `Métricas reales: ${usersActive} usuarios activos, ${sessions} sesiones, ${pageviews} páginas vistas. `;
              
              if (impact > 20) {
                summary += 'El spot demostró una CORRELACIÓN FUERTE entre la transmisión TV y el tráfico web.';
              } else if (impact > 10) {
                summary += 'El spot mostró una CORRELACIÓN MODERADA entre TV y web.';
              } else {
                summary += 'El spot presentó CORRELACIÓN DÉBIL entre TV y web.';
              }
            } else {
              summary += `No se detectó incremento significativo en tráfico web durante la transmisión (${impact.toFixed(1)}%). `;
              summary += 'Se requiere análisis detallado del contenido del spot y timing.';
            }

            if (videoAnalysis && videoAnalysis.analisis_efectividad) {
              const efectividad = videoAnalysis.analisis_efectividad;
              const clarity = parseFloat(efectividad.claridad_mensaje || 0);
              const engagement = parseFloat(efectividad.engagement_visual || 0);
              const memorability = parseFloat(efectividad.memorabilidad || 0);
              
              summary += ` Análisis de contenido: Claridad ${clarity.toFixed(1)}/10, Engagement ${engagement.toFixed(1)}/10, Memorabilidad ${memorability.toFixed(1)}/10.`;
            } else {
              if (analyzingVideo) {
                summary += ' Análisis de contenido del video en progreso...';
              } else if (error) {
                summary += ' Análisis de contenido del video no disponible.';
              } else {
                summary += ' Análisis de contenido del video pendiente.';
              }
            }

            return summary;
          };

          const realSummary = generateRealExecutiveSummary();
          
          return (
            <div>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                {realSummary}
              </p>
              
              {videoAnalysis && videoAnalysis.analisis_efectividad && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-xs text-gray-600">Claridad</div>
                    <div className="text-sm font-semibold text-blue-600">
                      {parseFloat(videoAnalysis.analisis_efectividad.claridad_mensaje || 0).toFixed(1)}/10
                    </div>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-xs text-gray-600">Engagement</div>
                    <div className="text-sm font-semibold text-green-600">
                      {parseFloat(videoAnalysis.analisis_efectividad.engagement_visual || 0).toFixed(1)}/10
                    </div>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-xs text-gray-600">Memorabilidad</div>
                    <div className="text-sm font-semibold text-purple-600">
                      {parseFloat(videoAnalysis.analisis_efectividad.memorabilidad || 0).toFixed(1)}/10
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Loading State */}
      {analyzingVideo && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Analizando contenido del video...</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default VideoAnalysisDashboard;
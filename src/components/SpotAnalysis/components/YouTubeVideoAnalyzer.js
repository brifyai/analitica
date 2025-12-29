import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  Play,
  BarChart3,
  Brain,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  Eye,
  MousePointer,
  Users,
  Clock,
  Globe,
  Search,
  X,
  Loader2,
  Download,
  Share2,
  ExternalLink
} from 'lucide-react';
import GoogleGeminiVideoService from '../../../services/googleGeminiVideoService';

const YouTubeVideoAnalyzer = ({ 
  analysisResults, 
  spotData,
  isAnalyzing = false 
}) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoAnalysis, setVideoAnalysis] = useState(null);
  const [analyzingVideo, setAnalyzingVideo] = useState(false);
  const [videoAnalysisService] = useState(new GoogleGeminiVideoService());
  const [error, setError] = useState(null);
  const [analysisAttempted, setAnalysisAttempted] = useState(false);
  const [rational, setRational] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);

  // Validar URL de YouTube
  const validateYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  // Manejar cambio de URL
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setYoutubeUrl(url);
    
    // Si la URL es válida, extraer info del video
    if (validateYouTubeUrl(url)) {
      extractVideoInfo(url);
    } else {
      setVideoInfo(null);
      setShowPreview(false);
    }
  };

  // Extraer información del video de YouTube
  const extractVideoInfo = async (url) => {
    try {
      const videoId = videoAnalysisService.extractYouTubeVideoId(url);
      if (videoId) {
        const info = await videoAnalysisService.getYouTubeVideoInfo(videoId);
        setVideoInfo(info);
        setShowPreview(true);
        setError(null);
      }
    } catch (err) {
      console.error('Error extrayendo info del video:', err);
      setError('No se pudo obtener información del video. Verifica que el video sea público.');
      setVideoInfo(null);
      setShowPreview(false);
    }
  };

  // Analizar video con Google Gemini
  const analyzeYouTubeVideo = async () => {
    if (!youtubeUrl || !validateYouTubeUrl(youtubeUrl)) {
      setError('Por favor, ingresa una URL válida de YouTube');
      return;
    }

    if (!analysisResults || analysisResults.length === 0) {
      setError('Se requieren resultados de análisis para correlacionar con el video');
      return;
    }

    setAnalyzingVideo(true);
    setError(null);
    setAnalysisAttempted(true);

    try {
      const result = await videoAnalysisService.analyzeYouTubeVideo(
        youtubeUrl,
        spotData,
        analysisResults
      );

      if (result.success) {
        setVideoAnalysis(result);
        console.log('✅ Análisis de YouTube con Gemini completado');
      } else {
        setError(result.error || 'Error en el análisis del video');
      }
    } catch (err) {
      console.error('❌ Error en análisis de YouTube:', err);
      setError(`Error de conexión: ${err.message}`);
    } finally {
      setAnalyzingVideo(false);
    }
  };

  // Generar racional de vinculación video-analytics
  const generateVideoAnalyticsRational = () => {
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

    // Análisis de contenido publicitario
    if (videoAnalysis.geminiAnalysis?.analisis_contenido) {
      const contenido = videoAnalysis.geminiAnalysis.analisis_contenido;
      const realImpact = spot.impact.activeUsers.percentageChange;
      
      rational.push({
        type: 'content',
        title: 'Análisis de Contenido Publicitario',
        message: `Evaluación IA: Efectividad del mensaje ${contenido.efectividad_mensaje}. Claridad del CTA: ${contenido.claridad_cta}. Impacto real medido: ${realImpact >= 0 ? '+' : ''}${realImpact.toFixed(1)}% en usuarios activos.`,
        impact: Math.abs(realImpact) > 25 ? 'Alto' : Math.abs(realImpact) > 12 ? 'Medio' : 'Bajo',
        confidence: 90,
        realData: true
      });
    }

    // Análisis técnico
    if (videoAnalysis.geminiAnalysis?.analisis_tecnico) {
      const tecnico = videoAnalysis.geminiAnalysis.analisis_tecnico;
      const realImpact = spot.impact.activeUsers.percentageChange;
      
      rational.push({
        type: 'technical',
        title: 'Análisis Técnico y Creativo',
        message: `Calidad de producción: ${tecnico.calidad_produccion}/10. Ritmo y estructura: ${tecnico.ritmo_estructura}. Impacto real: ${realImpact >= 0 ? '+' : ''}${realImpact.toFixed(1)}%.`,
        impact: Math.abs(realImpact) > 20 ? 'Alto' : Math.abs(realImpact) > 10 ? 'Medio' : 'Bajo',
        confidence: 85,
        realData: true
      });
    }

    return rational;
  };

  // Cargar racional cuando estén disponibles los datos
  useEffect(() => {
    if (videoAnalysis && analysisResults && analysisResults.length > 0) {
      const realRational = generateVideoAnalyticsRational();
      setRational(realRational);
    }
  }, [videoAnalysis, analysisResults]);

  // Generar recomendaciones basadas en el análisis
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

      // Recomendaciones basadas en el análisis de Gemini
      if (videoAnalysis?.geminiAnalysis?.recomendaciones_estrategicas) {
        const recs = videoAnalysis.geminiAnalysis.recomendaciones_estrategicas;
        
        if (recs.cambios_mejora && recs.cambios_mejora.length > 0) {
          recommendations.push({
            priority: 'Alta',
            category: 'Optimización de Contenido',
            text: 'Implementar mejoras sugeridas por el análisis IA',
            why: `Basado en análisis de Gemini: ${recs.cambios_mejora.join('. ')}`
          });
        }

        if (recs.elementos_mantener && recs.elementos_mantener.length > 0) {
          recommendations.push({
            priority: 'Media',
            category: 'Conservación de Elementos',
            text: 'Mantener elementos identificados como efectivos',
            why: `Elementos exitosos identificados: ${recs.elementos_mantener.join('. ')}`
          });
        }
      }

      // Análisis causal con datos reales
      if (impact > 20) {
        recommendations.push({
          priority: 'Alta',
          category: 'Análisis de Éxito',
          text: 'El spot SÍ funcionó - Incremento significativo en tráfico',
          why: `Impacto medido: +${impact.toFixed(1)}%. El spot generó correlación positiva entre TV y tráfico web.`
        });
      } else if (impact < -10) {
        recommendations.push({
          priority: 'Crítica',
          category: 'Análisis de Fracaso',
          text: 'El spot NO funcionó - Impacto negativo en tráfico',
          why: `Impacto medido: ${impact.toFixed(1)}%. Revisar contenido y estrategia.`
        });
      } else {
        recommendations.push({
          priority: 'Media',
          category: 'Análisis Neutral',
          text: 'Spot con impacto mínimo - Oportunidad de mejora',
          why: `Impacto medido: ${impact.toFixed(1)}%. Optimizar contenido y timing.`
        });
      }

      // Recomendación de timing
      recommendations.push({
        priority: 'Alta',
        category: 'Timing y Programación',
        text: 'Evaluar horario de transmisión basado en el análisis',
        why: `Transmitido a las ${spotHour}:00. ${isPrimeTime ? 'Horario óptimo aprovechado.' : 'Considerar prime time (19:00-23:00) para mayor impacto.'}`
      });

      // Recomendaciones del análisis de contenido
      if (videoAnalysis?.geminiAnalysis?.analisis_contenido) {
        const contenido = videoAnalysis.geminiAnalysis.analisis_contenido;
        
        if (contenido.claridad_cta && contenido.claridad_cta.includes('baja')) {
          recommendations.push({
            priority: 'Alta',
            category: 'Optimización de CTA',
            text: 'Mejorar claridad del llamado a la acción',
            why: `El análisis IA detectó que el CTA no es suficientemente claro: "${contenido.claridad_cta}"`
          });
        }

        if (contenido.efectividad_mensaje && contenido.efectividad_mensaje.includes('baja')) {
          recommendations.push({
            priority: 'Media',
            category: 'Mensaje Publicitario',
            text: 'Refinar el mensaje principal del spot',
            why: `Análisis IA: "${contenido.efectividad_mensaje}"`
          });
        }
      }

    } catch (error) {
      console.error('❌ Error en generación de recomendaciones:', error);
    }

    return recommendations;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Crítica': return 'text-red-600 bg-red-50 border-red-200';
      case 'Alta': return 'text-orange-600 bg-orange-50 border-orange-200';
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

  // Formatear duración ISO 8601 a texto legible
  const formatDuration = (duration) => {
    if (!duration) return 'Desconocida';
    
    // PT#M#S format (ej: PT2M30S)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;
    
    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Formatear número de vistas
  const formatViewCount = (views) => {
    if (!views) return '0';
    const num = parseInt(views);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg">
            <Video className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Análisis de Video YouTube con IA
            </h3>
            <p className="text-sm text-gray-600">
              Inserta un video de YouTube para análisis experto con Google Gemini
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

      {/* Input de URL */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL del Video de YouTube
        </label>
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="url"
              value={youtubeUrl}
              onChange={handleUrlChange}
              placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              disabled={analyzingVideo}
            />
            <Globe className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
          </div>
          <button
            onClick={analyzeYouTubeVideo}
            disabled={!youtubeUrl || analyzingVideo || !validateYouTubeUrl(youtubeUrl)}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center space-x-2"
          >
            {analyzingVideo ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analizando...</span>
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                <span>Analizar con IA</span>
              </>
            )}
          </button>
        </div>
        
        {youtubeUrl && !validateYouTubeUrl(youtubeUrl) && (
          <p className="mt-2 text-sm text-red-600">Por favor, ingresa una URL válida de YouTube</p>
        )}
      </div>

      {/* Vista previa del video */}
      {showPreview && videoInfo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200"
        >
          <div className="flex items-start space-x-4">
            <img
              src={videoInfo.thumbnails?.medium?.url || videoInfo.thumbnails?.default?.url}
              alt={videoInfo.title}
              className="w-32 h-20 object-cover rounded-lg shadow-md"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">{videoInfo.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{videoInfo.channelTitle}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  {formatViewCount(videoInfo.viewCount)} vistas
                </span>
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDuration(videoInfo.duration)}
                </span>
                <span>{new Date(videoInfo.publishedAt).toLocaleDateString('es-CL')}</span>
              </div>
            </div>
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors"
              title="Ver en YouTube"
            >
              <ExternalLink className="h-4 w-4 text-gray-600" />
            </a>
          </div>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">Error en el análisis</span>
          </div>
          <p className="mt-2 text-sm text-red-700">{error}</p>
        </motion.div>
      )}

      {/* Resultados del análisis */}
      {videoAnalysis && videoAnalysis.geminiAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Racional Video-Analytics */}
          {rational && rational.length > 0 && (
            <div>
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

          {/* Análisis de Contenido Publicitario */}
          {videoAnalysis.geminiAnalysis.analisis_contenido && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-gray-900">Análisis de Contenido Publicitario</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h5 className="font-medium text-green-900 mb-2">Efectividad del Mensaje</h5>
                  <p className="text-sm text-green-800">{videoAnalysis.geminiAnalysis.analisis_contenido.efectividad_mensaje}</p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="font-medium text-blue-900 mb-2">Claridad del CTA</h5>
                  <p className="text-sm text-blue-800">{videoAnalysis.geminiAnalysis.analisis_contenido.claridad_cta}</p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h5 className="font-medium text-purple-900 mb-2">Coherencia con Marca</h5>
                  <p className="text-sm text-purple-800">{videoAnalysis.geminiAnalysis.analisis_contenido.coherencia_marca}</p>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h5 className="font-medium text-orange-900 mb-2">Elementos Clave</h5>
                  <ul className="text-sm text-orange-800 list-disc list-inside">
                    {videoAnalysis.geminiAnalysis.analisis_contenido.elementos_clave.map((elemento, i) => (
                      <li key={i}>{elemento}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Análisis Técnico */}
          {videoAnalysis.geminiAnalysis.analisis_tecnico && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Video className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900">Análisis Técnico y Creativo</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h5 className="font-medium text-purple-900 mb-2">Calidad de Producción</h5>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${parseInt(videoAnalysis.geminiAnalysis.analisis_tecnico.calidad_produccion) * 10}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-purple-900">
                      {videoAnalysis.geminiAnalysis.analisis_tecnico.calidad_produccion}/10
                    </span>
                  </div>
                  <p className="text-sm text-purple-700 mt-2">{videoAnalysis.geminiAnalysis.analisis_tecnico.efectividad_guion}</p>
                </div>
                
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <h5 className="font-medium text-indigo-900 mb-2">Uso Audio-Visual</h5>
                  <p className="text-sm text-indigo-800">{videoAnalysis.geminiAnalysis.analisis_tecnico.uso_audio_visual}</p>
                </div>
                
                <div className="p-4 bg-teal-50 rounded-lg border border-teal-200 md:col-span-2">
                  <h5 className="font-medium text-teal-900 mb-2">Ritmo y Estructura</h5>
                  <p className="text-sm text-teal-800">{videoAnalysis.geminiAnalysis.analisis_tecnico.ritmo_estructura}</p>
                </div>
              </div>
            </div>
          )}

          {/* Recomendaciones */}
          {baseRecommendations.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                <h4 className="font-semibold text-gray-900">Recomendaciones Estratégicas</h4>
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
          {videoAnalysis.geminiAnalysis.conclusiones && (
            <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <Info className="h-5 w-5 text-gray-600" />
                <h4 className="font-semibold text-gray-900">Resumen Ejecutivo del Análisis IA</h4>
              </div>
              
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                {videoAnalysis.geminiAnalysis.conclusiones.resumen_ejecutivo}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Potencial de Rendimiento:</span>
                <span className="font-medium text-gray-900">
                  {videoAnalysis.geminiAnalysis.conclusiones.potencial_rendimiento}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Loading State */}
      {analyzingVideo && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Analizando contenido del video con Google Gemini...</p>
            <p className="text-xs text-gray-500 mt-1">Esto puede tomar unos segundos</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default YouTubeVideoAnalyzer;
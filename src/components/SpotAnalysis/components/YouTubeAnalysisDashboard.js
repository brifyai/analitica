import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  BarChart3,
  TrendingUp,
  Eye,
  MousePointer,
  Brain,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Youtube,
  Clock,
  Calendar
} from 'lucide-react';
import { youtubeService } from '../../../services/youtubeService';
import { generateAIAnalysis } from '../../../services/aiAnalysisService';

const YouTubeAnalysisDashboard = ({ 
  youtubeUrl, 
  analysisResults, 
  isAnalyzing = false 
}) => {
  const [youtubeData, setYoutubeData] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [rational, setRational] = useState(null);

  // Análisis automático del video de YouTube
  const analyzeYouTubeVideo = async () => {
    if (!youtubeUrl || !youtubeService.isValidYouTubeUrl(youtubeUrl)) {
      setError('Por favor ingresa una URL válida de YouTube');
      return;
    }

    if (!analysisResults || analysisResults.length === 0) {
      setError('Se requieren datos de Google Analytics para el análisis completo');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      console.log('🎬 Iniciando análisis automático de YouTube...');

      // Paso 1: Extraer metadata de YouTube
      const youtubeAnalysis = await youtubeService.analyzeVideo(youtubeUrl);
      setYoutubeData(youtubeAnalysis);
      console.log('✅ Metadata de YouTube obtenida:', youtubeAnalysis.videoInfo.title);

      // Paso 2: Análisis con Google Gemini AI
      const spotData = analysisResults[0];
      const aiPrompt = generateAIAnalysisPrompt(youtubeAnalysis, spotData);
      
      const aiResult = await generateAIAnalysis(aiPrompt);
      setAiAnalysis(aiResult);
      console.log('✅ Análisis de IA completado');

      // Paso 3: Generar racional de correlación
      const correlationRational = generateCorrelationRational(youtubeAnalysis, aiResult, spotData);
      setRational(correlationRational);

    } catch (err) {
      console.error('❌ Error en análisis de YouTube:', err);
      setError(`Error en análisis: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  // Generar prompt para análisis de IA
  const generateAIAnalysisPrompt = (youtubeData, spotData) => {
    const videoInfo = youtubeData.videoInfo;
    const metadata = youtubeData.metadata;
    
    return `Analiza este video publicitario de YouTube como un experto en publicidad y marketing:

TÍTULO: ${videoInfo.title}
DESCRIPCIÓN: ${videoInfo.description}
CANAL: ${videoInfo.channel}
DURACIÓN: ${videoInfo.duration}
VISTAS: ${videoInfo.viewCount.toLocaleString()}
LIKES: ${videoInfo.likeCount.toLocaleString()}
ETIQUETAS: ${videoInfo.tags.join(', ')}
IDIOMA: ${metadata.language || 'Español'}
CATEGORÍA: ${metadata.categoryId}

CONTEXTO DEL SPOT TV:
- Fecha de transmisión: ${spotData.spot.fecha}
- Hora: ${spotData.spot.hora}
- Canal: ${spotData.spot.canal}
- Programa: ${spotData.spot.titulo_programa}
- Tipo comercial: ${spotData.spot.tipo_comercial}

MÉTRICAS REALES DE GOOGLE ANALYTICS:
- Usuarios activos durante el spot: ${spotData.metrics.spot.activeUsers}
- Cambio porcentual: ${spotData.impact.activeUsers.percentageChange}%
- Sesiones: ${spotData.metrics.spot.sessions}
- Vistas de página: ${spotData.metrics.spot.pageviews}

Por favor proporciona un análisis detallado que incluya:

1. **ANÁLISIS DE CONTENIDO PUBLICITARIO**
   - Evaluación del mensaje publicitario
   - Claridad del call-to-action
   - Calidad visual y técnica
   - Alineación con la marca

2. **ANÁLISIS DE EFECTIVIDAD**
   - Engagement visual (1-10)
   - Claridad del mensaje (1-10)
   - Memorabilidad (1-10)
   - Capacidad de conversión (1-10)

3. **CORRELACIÓN TV-WEB**
   - ¿Existe correlación entre el contenido del video y el impacto web medido?
   - ¿Qué elementos del video podrían haber generado el impacto de ${spotData.impact.activeUsers.percentageChange}%?
   - ¿El timing y contenido son coherentes con el comportamiento web observado?

4. **INSIGHTS Y RECOMENDACIONES**
   - ¿Qué funcionó bien?
   - ¿Qué se puede mejorar?
   - ¿Cómo optimizar para mejor correlación TV-Web?

Proporciona el análisis en formato JSON estructurado.`;
  };

  // Generar racional de correlación
  const generateCorrelationRational = (youtubeData, aiAnalysis, spotData) => {
    if (!aiAnalysis || !spotData) return [];

    const rational = [];
    const impact = spotData.impact.activeUsers.percentageChange;

    // Análisis de contenido vs impacto
    if (aiAnalysis.analisis_efectividad) {
      const efectividad = aiAnalysis.analisis_efectividad;
      const avgEffectiveness = (
        parseFloat(efectividad.engagement_visual || 0) +
        parseFloat(efectividad.claridad_mensaje || 0) +
        parseFloat(efectividad.memorabilidad || 0) +
        parseFloat(efectividad.capacidad_conversion || 0)
      ) / 4;

      rational.push({
        type: 'content_impact',
        title: 'Calidad del Contenido vs Impacto Web',
        message: `El video tiene una efectividad promedio de ${avgEffectiveness.toFixed(1)}/10. ${
          avgEffectiveness >= 7 ? 'Alta calidad que probablemente contribuyó al ' : 
          avgEffectiveness >= 5 ? 'Calidad media que podría explicar el ' : 'Baja calidad que podría relacionarse con el '
        }impacto de ${impact >= 0 ? '+' : ''}${impact.toFixed(1)}% observado en Analytics.`,
        impact: Math.abs(impact) > 20 ? 'Alto' : Math.abs(impact) > 10 ? 'Medio' : 'Bajo',
        confidence: Math.min(95, avgEffectiveness * 10),
        realData: true
      });
    }

    // Análisis de timing
    const spotHour = spotData.spot.dateTime.getHours();
    const isPrimeTime = spotHour >= 19 && spotHour <= 23;
    
    rational.push({
      type: 'timing',
      title: 'Timing de Transmisión',
      message: `Spot transmitido a las ${spotHour}:00${
        isPrimeTime ? ' (horario prime time)' : ' (fuera de prime time)'
      }. ${isPrimeTime ? 'Horario óptimo que maximiza' : 'Horario que podría limitar'} el impacto publicitario.`,
      impact: isPrimeTime ? 'Alto' : 'Medio',
      confidence: 85,
      realData: true
    });

    // Análisis de engagement
    if (youtubeData.videoInfo.viewCount > 0) {
      const engagementRate = (youtubeData.videoInfo.likeCount / youtubeData.videoInfo.viewCount) * 100;
      
      rational.push({
        type: 'engagement',
        title: 'Engagement del Video',
        message: `El video tiene ${engagementRate.toFixed(2)}% de engagement (likes/vistas). ${
          engagementRate > 2 ? 'Alto engagement que sugiere contenido efectivo' :
          engagementRate > 1 ? 'Engagement medio que indica contenido aceptable' :
          'Bajo engagement que podría correlacionarse con impacto limitado'
        }.`,
        impact: engagementRate > 2 ? 'Alto' : engagementRate > 1 ? 'Medio' : 'Bajo',
        confidence: Math.min(90, engagementRate * 30),
        realData: true
      });
    }

    return rational;
  };

  // Auto-análisis cuando cambia la URL
  useEffect(() => {
    if (youtubeUrl && youtubeService.isValidYouTubeUrl(youtubeUrl) && analysisResults?.length > 0) {
      analyzeYouTubeVideo();
    }
  }, [youtubeUrl, analysisResults]);

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'Alto': return 'text-green-600';
      case 'Medio': return 'text-yellow-600';
      case 'Bajo': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!youtubeUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Youtube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Análisis de Video de YouTube
            </h3>
            <p className="text-gray-600">
              Ingresa una URL de YouTube para obtener análisis automatizado con IA
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!youtubeService.isValidYouTubeUrl(youtubeUrl)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-red-200"
      >
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-medium text-red-900">URL de YouTube Inválida</h3>
        </div>
        <p className="text-red-700">Por favor ingresa una URL válida de YouTube</p>
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
          <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg">
            <Youtube className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Análisis de YouTube con IA
            </h3>
            <p className="text-sm text-gray-600">
              Análisis automatizado de contenido publicitario
            </p>
          </div>
        </div>
        
        {analyzing && (
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
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">Error en análisis</span>
          </div>
          <p className="text-sm text-red-700 mt-2">{error}</p>
        </motion.div>
      )}

      {/* YouTube Video Info */}
      {youtubeData && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
          <div className="flex items-center space-x-3 mb-4">
            <Play className="h-5 w-5 text-red-600" />
            <div>
              <h4 className="font-medium text-red-900">{youtubeData.videoInfo.title}</h4>
              <p className="text-sm text-red-700">por {youtubeData.videoInfo.channel}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Eye className="h-4 w-4 text-red-600" />
                <span className="text-xs text-gray-600">Vistas</span>
              </div>
              <div className="text-lg font-bold text-red-900">
                {youtubeData.videoInfo.viewCount.toLocaleString()}
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-xs text-gray-600">Likes</span>
              </div>
              <div className="text-lg font-bold text-green-900">
                {youtubeData.videoInfo.likeCount.toLocaleString()}
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-gray-600">Duración</span>
              </div>
              <div className="text-lg font-bold text-blue-900">
                {youtubeData.videoInfo.duration}
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="text-xs text-gray-600">Publicado</span>
              </div>
              <div className="text-sm font-bold text-purple-900">
                {new Date(youtubeData.videoInfo.publishedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Racional YouTube-Analytics */}
      {rational && rational.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="h-5 w-5 text-indigo-600" />
            <h4 className="font-semibold text-gray-900">Racional YouTube-Analytics</h4>
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

      {/* Análisis de IA */}
      {aiAnalysis && aiAnalysis.analisis_efectividad && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="h-5 w-5 text-purple-600" />
            <h4 className="font-semibold text-gray-900">Análisis de IA</h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 text-center">
              <div className="text-xs text-blue-600 mb-1">Claridad</div>
              <div className="text-lg font-bold text-blue-900">
                {parseFloat(aiAnalysis.analisis_efectividad.claridad_mensaje || 0).toFixed(1)}/10
              </div>
            </div>
            
            <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 text-center">
              <div className="text-xs text-green-600 mb-1">Engagement</div>
              <div className="text-lg font-bold text-green-900">
                {parseFloat(aiAnalysis.analisis_efectividad.engagement_visual || 0).toFixed(1)}/10
              </div>
            </div>
            
            <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200 text-center">
              <div className="text-xs text-purple-600 mb-1">Memorabilidad</div>
              <div className="text-lg font-bold text-purple-900">
                {parseFloat(aiAnalysis.analisis_efectividad.memorabilidad || 0).toFixed(1)}/10
              </div>
            </div>
            
            <div className="p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 text-center">
              <div className="text-xs text-orange-600 mb-1">Conversión</div>
              <div className="text-lg font-bold text-orange-900">
                {parseFloat(aiAnalysis.analisis_efectividad.capacidad_conversion || 0).toFixed(1)}/10
              </div>
            </div>
          </div>

          {aiAnalysis.analisis_contenido && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h5 className="font-medium text-gray-900 mb-2">Análisis de Contenido</h5>
              <p className="text-sm text-gray-700">{aiAnalysis.analisis_contenido}</p>
            </div>
          )}
        </div>
      )}

      {/* Correlación con Analytics */}
      {analysisResults && analysisResults.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-gray-900">Correlación con Google Analytics</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(() => {
              const result = analysisResults[0];
              const impact = result.impact.activeUsers.percentageChange;
              
              return (
                <>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800">Impacto en Usuarios</span>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      {impact >= 0 ? '+' : ''}{impact.toFixed(1)}%
                    </div>
                    <div className="text-xs text-green-700 mt-1">
                      Durante la transmisión del spot
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-800">Sesiones</span>
                      <MousePointer className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      +{result.impact.sessions.percentageChange.toFixed(1)}%
                    </div>
                    <div className="text-xs text-blue-700 mt-1">
                      Incremento en sesiones web
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-800">Vistas de Página</span>
                      <Eye className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      +{result.impact.pageviews.percentageChange.toFixed(1)}%
                    </div>
                    <div className="text-xs text-purple-700 mt-1">
                      Aumento en engagement
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      {aiAnalysis?.insights_y_recomendaciones && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <h4 className="font-semibold text-gray-900">Recomendaciones de IA</h4>
          </div>
          
          <div className="space-y-3">
            {aiAnalysis.insights_y_recomendaciones.que_funciono && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Lo que funcionó</span>
                </div>
                <p className="text-sm text-green-700">{aiAnalysis.insights_y_recomendaciones.que_funciono}</p>
              </div>
            )}
            
            {aiAnalysis.insights_y_recomendaciones.que_mejorar && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Oportunidades de mejora</span>
                </div>
                <p className="text-sm text-yellow-700">{aiAnalysis.insights_y_recomendaciones.que_mejorar}</p>
              </div>
            )}
            
            {aiAnalysis.insights_y_recomendaciones.optimizacion && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Optimización TV-Web</span>
                </div>
                <p className="text-sm text-blue-700">{aiAnalysis.insights_y_recomendaciones.optimizacion}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {analyzing && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Analizando video con YouTube API y Google Gemini...</p>
            <p className="text-xs text-gray-500 mt-2">Extrayendo metadata → Análisis con IA → Generando insights</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default YouTubeAnalysisDashboard;
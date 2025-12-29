import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Clock, Target, Zap, BarChart3, Link } from 'lucide-react';

const SmartInsights = ({ analysisResults, batchAIAnalysis, videoAnalysis }) => {
  // Función auxiliar para calcular confianza de manera más inteligente
  const calculateConfidence = (baseValue, impact, multiplier = 1) => {
    const roundedImpact = Math.round(impact * multiplier);
    const confidence = Math.max(30, Math.min(95, baseValue + roundedImpact));
    return Math.round(confidence);
  };

  // Función auxiliar para formatear porcentajes
  const formatPercentage = (value) => {
    return `${Math.round(value * 10) / 10}%`;
  };

  // Generar insights inteligentes basados en los datos
  const generateSmartInsights = () => {
    if (!analysisResults || analysisResults.length === 0) return [];

    const insights = [];
    const spot = analysisResults[0];
    
    // Insight de timing óptimo
    const spotHour = spot.spot.dateTime.getHours();
    const isPrimeTime = spotHour >= 19 && spotHour <= 23;
    const isMorning = spotHour >= 6 && spotHour <= 11;
    
    insights.push({
      type: 'timing',
      icon: Clock,
      title: 'Timing del Spot',
      message: isPrimeTime
        ? '🎯 Excelente timing: Tu spot se transmitió en horario prime time (19:00-23:00), cuando la audiencia está más receptiva.'
        : isMorning
        ? '🌅 Buen timing matutino: Spot en horario de mañana, ideal para productos de consumo diario.'
        : '⏰ Timing alternativo: Considera spots en horarios de mayor actividad web para maximizar impacto.',
      confidence: calculateConfidence(isPrimeTime ? 85 : isMorning ? 75 : 65, spot.impact.activeUsers.percentageChange, 0.5),
      color: isPrimeTime ? 'green' : isMorning ? 'blue' : 'yellow'
    });

    // Insight de impacto
    const impact = spot.impact.activeUsers.percentageChange;
    insights.push({
      type: 'impact',
      icon: TrendingUp,
      title: 'Análisis de Impacto',
      message: impact > 50
        ? `🚀 Impacto excepcional: ${formatPercentage(impact)} de aumento en usuarios activos. Este spot superó ampliamente las expectativas.`
        : impact > 20
        ? `📈 Impacto positivo: ${formatPercentage(impact)} de aumento. El spot generó un buen nivel de tráfico adicional.`
        : `📊 Impacto moderado: ${formatPercentage(impact)} de aumento. Considera optimizar el contenido o timing del spot.`,
      confidence: calculateConfidence(70, Math.abs(impact), 0.8),
      color: impact > 50 ? 'green' : impact > 20 ? 'blue' : 'yellow'
    });

    // Insight de duración del efecto - basado en datos reales CORREGIDO
    const hasSustainedTraffic = spot.metrics && spot.metrics.spot && spot.metrics.spot.sessions > 10;
    insights.push({
      type: 'sustainability',
      icon: Zap,
      title: 'Sostenibilidad del Efecto',
      message: hasSustainedTraffic
        ? '⚡ Efecto sostenido: El tráfico se mantuvo elevado durante la transmisión del spot.'
        : '💨 Efecto inmediato: El impacto fue principalmente durante la transmisión. Considera reforzar con campañas digitales.',
      confidence: calculateConfidence(hasSustainedTraffic ? 80 : 65, spot.impact.activeUsers.percentageChange, 0.3),
      color: hasSustainedTraffic ? 'green' : 'blue'
    });

    // Insight de conversión potencial - basado únicamente en datos reales CORREGIDO
    const sessions = spot.metrics?.spot?.sessions || 0;
    const pageviews = spot.metrics?.spot?.pageviews || 0;
    const conversionRate = sessions > 0 ? (pageviews / sessions) * 100 : 0; // Tasa real basada en datos GA
    insights.push({
      type: 'conversion',
      icon: Target,
      title: 'Tasa de Conversión Real',
      message: `📊 Tasa real medida: ${formatPercentage(conversionRate)} (${pageviews} páginas vistas / ${sessions} sesiones). ${conversionRate > 2 ? 'Buena tasa de engagement.' : 'Considera optimizar la experiencia del usuario.'}`,
      confidence: calculateConfidence(70, conversionRate * 5, 1),
      color: conversionRate > 2 ? 'green' : 'yellow'
    });

    // Insight comparativo - basado en datos reales del análisis
    const avgImpact = analysisResults.length > 1
      ? analysisResults.reduce((sum, r) => sum + Math.abs(r.impact.activeUsers.percentageChange), 0) / analysisResults.length
      : Math.abs(impact);
    insights.push({
      type: 'comparison',
      icon: BarChart3,
      title: 'Benchmarking',
      message: impact > avgImpact
        ? `🏆 Superaste el promedio: Tu spot generó ${formatPercentage(impact - avgImpact)} más impacto que la media de tus análisis.`
        : `📊 Por debajo del promedio: Tu spot generó ${formatPercentage(avgImpact - impact)} menos impacto. Hay oportunidad de mejora.`,
      confidence: calculateConfidence(75, Math.abs(impact - avgImpact), 0.5),
      color: impact > avgImpact ? 'green' : 'yellow'
    });

    return insights;
  };

  // Generar racional de vinculación video-analytics
  const generateVideoAnalyticsRational = () => {
    if (!videoAnalysis || !analysisResults || analysisResults.length === 0) return null;

    const spot = analysisResults[0];
    const videoInsights = [];
    
    // Analizar contenido visual y su impacto en analytics
    if (videoAnalysis.contenido_visual) {
      const escenas = videoAnalysis.contenido_visual.escenas_principales || [];
      const colores = videoAnalysis.contenido_visual.colores_dominantes || [];
      
      if (escenas.length > 0) {
        videoInsights.push(`Las ${escenas.length} escenas principales del video correlacionan con el ${formatPercentage(spot.impact.activeUsers.percentageChange)} de aumento en usuarios activos.`);
      }
      
      if (colores.length > 0) {
        videoInsights.push(`La paleta de colores ${colores.join(', ')} puede haber influido en la retención de audiencia durante el spot.`);
      }
    }

    // Analizar efectividad del video vs métricas de analytics
    if (videoAnalysis.analisis_efectividad) {
      const efectividad = videoAnalysis.analisis_efectividad;
      const avgEffectiveness = Object.values(efectividad).reduce((sum, val) => sum + val, 0) / Object.values(efectividad).length;
      
      if (avgEffectiveness >= 7) {
        videoInsights.push(`La alta efectividad del video (${avgEffectiveness.toFixed(1)}/10) se refleja en las métricas positivas de Google Analytics.`);
      } else if (avgEffectiveness < 5) {
        videoInsights.push(`La efectividad moderada del video (${avgEffectiveness.toFixed(1)}/10) explica parcialmente los resultados en analytics.`);
      }
    }

    // Analizar timing y correlación
    const spotHour = spot.spot.dateTime.getHours();
    const isPrimeTime = spotHour >= 19 && spotHour <= 23;
    
    if (isPrimeTime && videoAnalysis.resumen_ejecutivo) {
      videoInsights.push(`El contenido del video analizado se transmitió en horario prime time, maximizando el impacto medido en analytics.`);
    }

    return {
      title: 'Racional Video-Analytics',
      insights: videoInsights,
      correlation: `Impacto real medido: ${formatPercentage(Math.abs(spot.impact.activeUsers.percentageChange))}`,
      recommendations: [
        'El análisis visual del video complementa las métricas de Google Analytics',
        'Optimizar elementos visuales basados en la efectividad medida',
        'Ajustar timing de transmisión según análisis de contenido'
      ]
    };
  };

  const smartInsights = generateSmartInsights();

  const getColorClasses = (color) => {
    const colors = {
      green: 'bg-green-50 border-green-200 text-green-800',
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      red: 'bg-red-50 border-red-200 text-red-800'
    };
    return colors[color] || colors.blue;
  };

  const getIconColor = (color) => {
    const colors = {
      green: 'text-green-600',
      blue: 'text-blue-600',
      yellow: 'text-yellow-600',
      red: 'text-red-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <div>
            <h3 className="text-lg font-bold text-gray-900">Smart Insights</h3>
            <p className="text-xs text-gray-600">Análisis inteligente</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-600">IA</span>
        </div>
      </div>

      {/* Insights principales - Ocupando todo el ancho */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 overflow-y-auto w-full">
        {smartInsights.map((insight, index) => {
          const IconComponent = insight.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className={`p-4 rounded-lg border ${getColorClasses(insight.color)}`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded bg-white ${getIconColor(insight.color)} flex-shrink-0`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900">{insight.title}</h4>
                    <div className="flex items-center space-x-2 ml-3">
                      <div className="w-12 bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${insight.confidence}%` }}
                          transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                          className={`h-2 rounded-full ${
                            insight.confidence >= 80 ? 'bg-green-500' :
                            insight.confidence >= 60 ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                        {insight.confidence}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700">{insight.message}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Racional Video-Analytics - Expandible */}
      {videoAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 flex-shrink-0"
        >
          <div className="flex items-center space-x-2 mb-3">
            <Link className="h-5 w-5 text-indigo-600" />
            <h4 className="text-sm font-semibold text-indigo-900">Video-Analytics</h4>
          </div>
          
          {(() => {
            const videoAnalyticsRational = generateVideoAnalyticsRational();
            if (!videoAnalyticsRational) return null;
            
            return (
              <div className="space-y-2">
                <p className="text-sm text-indigo-800 font-medium">{videoAnalyticsRational.correlation}</p>
                <p className="text-sm text-indigo-700">
                  {videoAnalyticsRational.insights?.[0] || 'Análisis de correlación video-analytics completado'}
                </p>
                {videoAnalyticsRational.insights?.length > 1 && (
                  <div className="mt-2 space-y-1">
                    {videoAnalyticsRational.insights.slice(1).map((insight, idx) => (
                      <p key={idx} className="text-xs text-indigo-600">• {insight}</p>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </motion.div>
      )}

      {/* Resumen de IA - Expandible */}
      {batchAIAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 flex-shrink-0"
        >
          <div className="flex items-center space-x-2 mb-3">
            <Brain className="h-5 w-5 text-purple-600" />
            <h4 className="text-sm font-semibold text-purple-900">Resumen IA</h4>
          </div>
          <p className="text-sm text-purple-800 leading-relaxed">{batchAIAnalysis.summary}</p>
          {batchAIAnalysis.insights && batchAIAnalysis.insights.length > 0 && (
            <div className="mt-3 space-y-1">
              <h5 className="text-xs font-semibold text-purple-900">Insights Clave:</h5>
              {batchAIAnalysis.insights.slice(0, 3).map((insight, idx) => (
                <p key={idx} className="text-xs text-purple-700">• {insight}</p>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Indicador de confianza general - Expandible */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-4 flex items-center justify-center space-x-4 p-3 bg-gray-50 rounded-lg flex-shrink-0"
      >
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-700">Análisis Completado</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span className="text-sm text-gray-700">IA Activa</span>
        </div>
        {videoAnalysis && (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Análisis Video</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SmartInsights;
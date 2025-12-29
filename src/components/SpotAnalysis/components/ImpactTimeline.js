import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Users, BarChart3 } from 'lucide-react';

const ImpactTimeline = ({ spotData, analysisResults }) => {
  if (!analysisResults || analysisResults.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Timeline de Impacto</h3>
          <p className="text-gray-600">No hay datos de análisis disponibles</p>
        </div>
      </motion.div>
    );
  }

  // Calcular estadísticas del análisis
  const totalSpots = analysisResults.length;
  const avgImpact = analysisResults.reduce((sum, result) =>
    sum + (result.impact?.activeUsers?.percentageChange || 0), 0) / totalSpots;
  const positiveImpacts = analysisResults.filter(result =>
    (result.impact?.activeUsers?.percentageChange || 0) > 0).length;
  const maxImpact = Math.max(...analysisResults.map(result =>
    result.impact?.activeUsers?.percentageChange || 0));
  const minImpact = Math.min(...analysisResults.map(result =>
    result.impact?.activeUsers?.percentageChange || 0));

  // Obtener el mejor y peor spot
  const bestSpot = analysisResults.reduce((best, current) =>
    (current.impact?.activeUsers?.percentageChange || 0) > (best.impact?.activeUsers?.percentageChange || 0) ? current : best
  );
  const worstSpot = analysisResults.reduce((worst, current) =>
    (current.impact?.activeUsers?.percentageChange || 0) < (worst.impact?.activeUsers?.percentageChange || 0) ? current : worst
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Análisis de Impacto</h3>
          <p className="text-sm text-gray-600">Resultados de todos los spots analizados</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${avgImpact >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {avgImpact >= 0 ? 'Impacto Positivo' : 'Impacto Negativo'}
          </span>
        </div>
      </div>

      {/* Métricas Principales - Ocupando todo el ancho */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 flex-shrink-0 w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Total Spots</p>
              <p className="text-xl font-bold text-blue-900">{totalSpots}</p>
              <p className="text-xs text-blue-700 mt-1">Análisis completados</p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`p-4 rounded-lg border ${
            avgImpact >= 0
              ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'
              : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${avgImpact >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                Impacto Promedio
              </p>
              <p className={`text-xl font-bold ${avgImpact >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                {avgImpact >= 0 ? '+' : ''}{avgImpact.toFixed(1)}%
              </p>
              <p className={`text-xs mt-1 ${avgImpact >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {avgImpact >= 0 ? 'Incremento' : 'Decremento'} promedio
              </p>
            </div>
            {avgImpact >= 0 ? (
              <TrendingUp className="h-8 w-8 text-green-600" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-600" />
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">Spots Exitosos</p>
              <p className="text-xl font-bold text-purple-900">
                {positiveImpacts}
              </p>
              <p className="text-xs text-purple-700 mt-1">
                {((positiveImpacts / totalSpots) * 100).toFixed(0)}% del total
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-800">Mejor Resultado</p>
              <p className="text-xl font-bold text-orange-900">+{maxImpact.toFixed(1)}%</p>
              <p className="text-xs text-orange-700 mt-1">Máximo impacto</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </motion.div>
      </div>

      {/* Análisis Detallado - Ocupando todo el ancho */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 flex-1 w-full">
        {/* Mejor Spot */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
        >
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-green-900">Más Exitoso</h4>
          </div>
          <div className="space-y-2">
            <div className="bg-white p-3 rounded-lg border border-green-300">
              <p className="text-sm text-green-800">
                <span className="font-semibold">Impacto:</span> +{bestSpot.impact?.activeUsers?.percentageChange?.toFixed(1) || 0}%
              </p>
              <p className="text-xs text-green-700 mt-1">
                Usuarios activos durante el spot
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-green-300">
              <p className="text-sm font-medium text-green-900 mb-1">Programa:</p>
              <p className="text-sm text-green-800">
                {bestSpot.spot?.titulo_programa || bestSpot.spot?.nombre || 'N/A'}
              </p>
              {bestSpot.spot?.canal && (
                <p className="text-xs text-green-700 mt-1">
                  Canal: {bestSpot.spot.canal}
                </p>
              )}
              {bestSpot.spot?.fecha && bestSpot.spot?.hora && (
                <p className="text-xs text-green-700">
                  {bestSpot.spot.fecha} - {bestSpot.spot.hora}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Peor Spot */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="p-5 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200"
        >
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
              <TrendingDown className="h-4 w-4 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-red-900">Menor Impacto</h4>
          </div>
          <div className="space-y-2">
            <div className="bg-white p-3 rounded-lg border border-red-300">
              <p className="text-sm text-red-800">
                <span className="font-semibold">Impacto:</span> {minImpact.toFixed(1)}%
              </p>
              <p className="text-xs text-red-700 mt-1">
                Usuarios activos durante el spot
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-red-300">
              <p className="text-sm font-medium text-red-900 mb-1">Programa:</p>
              <p className="text-sm text-red-800">
                {worstSpot.spot?.titulo_programa || worstSpot.spot?.nombre || 'N/A'}
              </p>
              {worstSpot.spot?.canal && (
                <p className="text-xs text-red-700 mt-1">
                  Canal: {worstSpot.spot.canal}
                </p>
              )}
              {worstSpot.spot?.fecha && worstSpot.spot?.hora && (
                <p className="text-xs text-red-700">
                  {worstSpot.spot.fecha} - {worstSpot.spot.hora}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Conclusión - Expandible */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="p-5 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200 flex-shrink-0"
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Conclusión del Análisis</h4>
            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                {avgImpact > 10
                  ? "🎯 Impacto significativo y positivo: Los spots han generado un aumento considerable en el tráfico web, superando las expectativas iniciales."
                  : avgImpact > 0
                  ? "📈 Impacto moderado pero consistente: Los spots han generado un incremento positivo en el tráfico, aunque con resultados más conservadores."
                  : "⚠️ Impacto negativo detectado: Los resultados sugieren revisar la estrategia de spots o el timing de transmisión."}
              </p>
              <div className="bg-white p-3 rounded-lg border border-gray-300">
                <p className="text-sm text-gray-800">
                  <span className="font-semibold">Estadísticas clave:</span>
                </p>
                <ul className="text-xs text-gray-700 mt-1 space-y-1">
                  <li>• {positiveImpacts} de {totalSpots} spots con impacto positivo ({(positiveImpacts/totalSpots*100).toFixed(0)}%)</li>
                  <li>• Impacto promedio: {avgImpact >= 0 ? '+' : ''}{avgImpact.toFixed(1)}%</li>
                  <li>• Mejor resultado: +{maxImpact.toFixed(1)}% | Peor resultado: {minImpact.toFixed(1)}%</li>
                </ul>
              </div>
              {avgImpact > 0 && (
                <p className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200">
                  💡 <strong>Recomendación:</strong> Continuar con la estrategia actual, considerando optimizar los spots con menor rendimiento.
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ImpactTimeline;
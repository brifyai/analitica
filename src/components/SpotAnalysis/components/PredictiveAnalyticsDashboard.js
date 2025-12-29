/**
 * Dashboard de Análisis Predictivo con IA
 * Muestra predicciones, riesgos y recomendaciones inteligentes
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import {
  Brain,
  TrendingUp,
  CheckCircle,
  Target,
  Activity,
  Lightbulb,
  Shield,
  DollarSign,
  Eye
} from 'lucide-react';

const PredictiveAnalyticsDashboard = ({ predictiveAnalysis }) => {
  if (!predictiveAnalysis) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Análisis Predictivo con IA
            </h3>
            <p className="text-gray-500">
              Generando predicciones inteligentes...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { predictions, riskAnalysis, recommendations, confidence } = predictiveAnalysis;

  // Datos para gráficos de predicción de rendimiento
  const performanceData = [
    {
      window: 'Inmediato',
      predicted: predictions.performance.immediate,
      referencia: predictions.performance.immediate * 0.8,
      confidence: confidence.performance * 100
    },
    {
      window: 'Corto Plazo',
      predicted: predictions.performance.shortTerm,
      referencia: predictions.performance.shortTerm * 0.8,
      confidence: confidence.performance * 100
    },
    {
      window: 'Medio Plazo',
      predicted: predictions.performance.mediumTerm,
      referencia: predictions.performance.mediumTerm * 0.8,
      confidence: confidence.performance * 100
    },
    {
      window: 'Largo Plazo',
      predicted: predictions.performance.longTerm,
      referencia: predictions.performance.longTerm * 0.8,
      confidence: confidence.performance * 100
    }
  ];

  // Datos para gráfico de ROI
  const roiData = [
    {
      period: 'Inmediato',
      roi: predictions.roi.byWindow.immediate?.roi || 0,
      revenue: predictions.roi.byWindow.immediate?.revenue || 0,
      investment: predictions.roi.total.investment / 4
    },
    {
      period: 'Corto Plazo',
      roi: predictions.roi.byWindow.shortTerm?.roi || 0,
      revenue: predictions.roi.byWindow.shortTerm?.revenue || 0,
      investment: predictions.roi.total.investment / 4
    },
    {
      period: 'Medio Plazo',
      roi: predictions.roi.byWindow.mediumTerm?.roi || 0,
      revenue: predictions.roi.byWindow.mediumTerm?.revenue || 0,
      investment: predictions.roi.total.investment / 4
    },
    {
      period: 'Largo Plazo',
      roi: predictions.roi.byWindow.longTerm?.roi || 0,
      revenue: predictions.roi.byWindow.longTerm?.revenue || 0,
      investment: predictions.roi.total.investment / 4
    }
  ];

  // Datos para embudo de conversiones predichas
  const conversionFunnelData = [
    {
      stage: 'Impresiones',
      predicted: predictions.conversions.funnel.impressions.predicted,
      rate: predictions.conversions.funnel.impressions.conversionRate * 100
    },
    {
      stage: 'Clics',
      predicted: predictions.conversions.funnel.clicks.predicted,
      rate: predictions.conversions.funnel.clicks.conversionRate * 100
    },
    {
      stage: 'Landing',
      predicted: predictions.conversions.funnel.landing.predicted,
      rate: predictions.conversions.funnel.landing.conversionRate * 100
    },
    {
      stage: 'Engagement',
      predicted: predictions.conversions.funnel.engagement.predicted,
      rate: predictions.conversions.funnel.engagement.conversionRate * 100
    },
    {
      stage: 'Conversión',
      predicted: predictions.conversions.funnel.conversion.predicted,
      rate: predictions.conversions.funnel.conversion.conversionRate * 100
    }
  ];

  // Colores para gráficos
  const chartColors = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    gradient: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b']
  };

  return (
    <div className="space-y-8">
      {/* Header con confianza general */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center mb-4">
              <Brain className="w-8 h-8 mr-3" />
              <h2 className="text-3xl font-bold">Análisis Predictivo con IA</h2>
            </div>
            <p className="text-purple-100 text-lg">
              Predicciones inteligentes basadas en machine learning
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              {Math.round(confidence * 100)}%
            </div>
            <div className="text-purple-200">Confianza General</div>
            <div className="mt-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              <span className="text-sm">
                {riskAnalysis.overallRisk === 'low' ? 'Riesgo Bajo' : 
                 riskAnalysis.overallRisk === 'medium' ? 'Riesgo Medio' :
                 riskAnalysis.overallRisk === 'high' ? 'Riesgo Alto' : 'Riesgo Crítico'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid principal de predicciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Predicciones de Rendimiento */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <div className="flex items-center mb-6">
            <TrendingUp className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-800">Predicción de Rendimiento</h3>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="window" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  typeof value === 'number' ? value.toLocaleString() : value,
                  name === 'predicted' ? 'Predicho' : 'Referencia'
                ]}
              />
              <Area
                type="monotone"
                dataKey="referencia"
                stackId="1"
                stroke="#e5e7eb"
                fill="#f3f4f6"
                name="referencia"
              />
              <Area
                type="monotone"
                dataKey="predicted"
                stackId="2"
                stroke={chartColors.primary}
                fill={chartColors.primary}
                fillOpacity={0.6}
                name="predicted"
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <Eye className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">Alcance Predicho</span>
              </div>
              <div className="text-2xl font-bold text-blue-900 mt-1">
                {predictions.performance.metrics?.reach?.toLocaleString() || 'N/A'}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">Engagement</span>
              </div>
              <div className="text-2xl font-bold text-green-900 mt-1">
                {Math.round((predictions.performance.metrics?.engagement || 0) * 100)}%
              </div>
            </div>
          </div>
        </motion.div>

        {/* Predicciones de ROI */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <div className="flex items-center mb-6">
            <DollarSign className="w-6 h-6 text-green-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-800">ROI Proyectado</h3>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roiData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'roi' ? `${value.toFixed(1)}%` : `$${value.toLocaleString()}`,
                  name === 'roi' ? 'ROI' : name === 'revenue' ? 'Ingresos' : 'Inversión'
                ]}
              />
              <Bar dataKey="investment" fill="#e5e7eb" name="investment" />
              <Bar dataKey="revenue" fill={chartColors.success} name="revenue" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-green-800">ROI Total Proyectado</div>
                <div className="text-3xl font-bold text-green-900">
                  {predictions.roi.total.roi.toFixed(1)}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-green-800">Beneficio Neto</div>
                <div className="text-2xl font-bold text-green-900">
                  ${predictions.roi.total.profit.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Embudo de Conversiones Predicho */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <div className="flex items-center mb-6">
            <Target className="w-6 h-6 text-purple-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-800">Embudo de Conversiones</h3>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={conversionFunnelData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="stage" type="category" width={80} />
              <Tooltip
                formatter={(value, name) => [
                  name === 'predicted' ? value.toLocaleString() : `${value.toFixed(1)}%`,
                  name === 'predicted' ? 'Predicho' : 'Tasa'
                ]}
              />
              <Bar dataKey="predicted" fill={chartColors.secondary} name="predicted" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <div className="text-sm font-medium text-purple-800">Conversiones</div>
              <div className="text-xl font-bold text-purple-900">
                {predictions.conversions.totalConversions.toLocaleString()}
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-sm font-medium text-blue-800">Valor Total</div>
              <div className="text-xl font-bold text-blue-900">
                ${predictions.conversions.conversionValue.toLocaleString()}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-sm font-medium text-green-800">Confianza</div>
              <div className="text-xl font-bold text-green-900">
                {Math.round(predictions.conversions.confidence * 100)}%
              </div>
            </div>
          </div>
        </motion.div>

        {/* Análisis de Riesgo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <div className="flex items-center mb-6">
            <Shield className="w-6 h-6 text-red-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-800">Análisis de Riesgo</h3>
          </div>
          
          {riskAnalysis.risks.length > 0 ? (
            <div className="space-y-4">
              {riskAnalysis.risks.map((risk, index) => (
                <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800 capitalize">
                        {risk.type.replace('_', ' ')}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {risk.description}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      risk.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      risk.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      risk.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {risk.severity.toUpperCase()}
                    </div>
                  </div>
                  {risk.mitigation && (
                    <div className="text-sm text-blue-600 mt-2">
                      <strong>Mitigación:</strong> {risk.mitigation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <div className="text-green-700 font-medium">Sin Riesgos Identificados</div>
              <div className="text-green-600 text-sm">Las predicciones muestran un perfil de riesgo bajo</div>
            </div>
          )}

          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Puntuación de Riesgo</span>
              <span className="text-lg font-bold text-gray-900">
                {riskAnalysis.riskScore.toFixed(1)}/3.0
              </span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  riskAnalysis.overallRisk === 'low' ? 'bg-green-500' :
                  riskAnalysis.overallRisk === 'medium' ? 'bg-yellow-500' :
                  riskAnalysis.overallRisk === 'high' ? 'bg-orange-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${(riskAnalysis.riskScore / 3) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recomendaciones Inteligentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center mb-6">
          <Lightbulb className="w-6 h-6 text-yellow-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-800">Recomendaciones Inteligentes</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className={`border-l-4 p-4 rounded-r-lg ${
                rec.priority === 'critical' ? 'border-red-500 bg-red-50' :
                rec.priority === 'high' ? 'border-orange-500 bg-orange-50' :
                rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                'border-blue-500 bg-blue-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  rec.priority === 'critical' ? 'bg-red-200 text-red-800' :
                  rec.priority === 'high' ? 'bg-orange-200 text-orange-800' :
                  rec.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-blue-200 text-blue-800'
                }`}>
                  {rec.type.toUpperCase()}
                </div>
                <div className="text-xs text-gray-500">
                  {rec.impact} Impact • {rec.effort} Esfuerzo
                </div>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">{rec.title}</h4>
              <p className="text-sm text-gray-600">{rec.description}</p>
              {rec.mitigation && (
                <div className="mt-3 text-xs text-blue-600">
                  <strong>Acción:</strong> {rec.mitigation}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Métricas de Confianza por Predicción */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center mb-6">
          <Activity className="w-6 h-6 text-indigo-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-800">Confianza por Predicción</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${confidence.performance * 251.2} 251.2`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-800">
                  {Math.round(confidence.performance * 100)}%
                </span>
              </div>
            </div>
            <div className="font-medium text-gray-800">Rendimiento</div>
          </div>

          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#10b981"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${confidence.roi * 251.2} 251.2`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-800">
                  {Math.round(confidence.roi * 100)}%
                </span>
              </div>
            </div>
            <div className="font-medium text-gray-800">ROI</div>
          </div>

          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#8b5cf6"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${confidence.conversions * 251.2} 251.2`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-800">
                  {Math.round(confidence.conversions * 100)}%
                </span>
              </div>
            </div>
            <div className="font-medium text-gray-800">Conversiones</div>
          </div>

          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#f59e0b"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${confidence.timing * 251.2} 251.2`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-800">
                  {Math.round(confidence.timing * 100)}%
                </span>
              </div>
            </div>
            <div className="font-medium text-gray-800">Timing</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PredictiveAnalyticsDashboard;
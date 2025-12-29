import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Clock, TrendingUp, Target, Zap, AlertCircle, CheckCircle } from 'lucide-react';

const TemporalAnalysisDashboard = ({ temporalImpact, referencia, spotData }) => {
  // Generar datos para el gráfico de línea temporal
  const generateTemporalChartData = () => {
    if (!temporalImpact || typeof temporalImpact !== 'object') return [];
    
    return Object.entries(temporalImpact).map(([key, impact]) => {
      if (!impact || !impact.comparison) return null;
      
      const metrics = impact.comparison;
      return {
        window: impact.label || key,
        immediate: impact.name === 'Inmediato' ? (metrics.activeUsers?.percentageChange || 0) : 0,
        shortTerm: impact.name === 'Corto Plazo' ? (metrics.activeUsers?.percentageChange || 0) : 0,
        mediumTerm: impact.name === 'Medio Plazo' ? (metrics.activeUsers?.percentageChange || 0) : 0,
        longTerm: impact.name === 'Largo Plazo' ? (metrics.activeUsers?.percentageChange || 0) : 0,
        confidence: impact.confidence || 0,
        significance: impact.significance?.overall || 0
      };
    }).filter(Boolean);
  };

  // Datos para gráfico de barras de confianza
  const confidenceData = Object.entries(temporalImpact || {}).map(([key, impact]) => {
    if (!impact) return null;
    
    return {
      window: impact.label || key,
      confidence: impact.confidence || 0,
      significance: Math.round((impact.significance?.overall || 0) * 100),
      color: (impact.confidence || 0) >= 80 ? '#10B981' : (impact.confidence || 0) >= 60 ? '#F59E0B' : '#EF4444'
    };
  }).filter(Boolean);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-blue-600">
            <span className="font-medium">Impacto:</span> {payload[0].value?.toFixed(1) || 0}%
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-medium">Confianza:</span> {data?.confidence || 0}%
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-medium">Significancia:</span> {data?.significance || 0}%
          </p>
        </div>
      );
    }
    return null;
  };

  const getWindowIcon = (windowName) => {
    switch (windowName) {
      case 'Inmediato': return Zap;
      case 'Corto Plazo': return TrendingUp;
      case 'Medio Plazo': return Target;
      case 'Largo Plazo': return Clock;
      default: return Clock;
    }
  };

  const getWindowColor = (windowName) => {
    switch (windowName) {
      case 'Inmediato': return '#10B981';
      case 'Corto Plazo': return '#3B82F6';
      case 'Medio Plazo': return '#8B5CF6';
      case 'Largo Plazo': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  // Verificar que tenemos datos válidos
  if (!temporalImpact || Object.keys(temporalImpact).length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Análisis Temporal Digital</h3>
          <p className="text-gray-600">No hay datos de análisis temporal disponibles</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Análisis Temporal Digital</h3>
          <p className="text-sm text-gray-600">Impacto en 4 ventanas de tiempo con referencia robusta</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Análisis en tiempo real</span>
        </div>
      </div>

      {/* Timeline Visual de las 4 ventanas */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {Object.entries(temporalImpact || {}).map(([key, impact], index) => {
            if (!impact || !impact.name) return null;
            
            const IconComponent = getWindowIcon(impact.name);
            const color = getWindowColor(impact.name);
            
            return (
              <motion.div
                key={key}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="flex flex-col items-center relative z-10"
              >
                <div 
                  className="w-16 h-16 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 + 0.3 }}
                  className="mt-3 text-center"
                >
                  <p className="text-sm font-semibold text-gray-900">{impact.name}</p>
                  <p className="text-xs text-gray-500">{impact.label || ''}</p>
                  <p className="text-xs font-medium" style={{ color }}>
                    {impact.confidence || 0}% confianza
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
          
          {/* Línea conectora */}
          <div className="absolute top-8 left-8 right-8 h-1 bg-gradient-to-r from-green-500 via-blue-500 via-purple-500 to-yellow-500 rounded-full"></div>
        </div>
      </div>

      {/* Gráfico de Impacto Temporal */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Evolución del Impacto en el Tiempo</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={generateTemporalChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="window" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                label={{ value: 'Cambio (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="immediate" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                name="Inmediato"
              />
              <Line 
                type="monotone" 
                dataKey="shortTerm" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                name="Corto Plazo"
              />
              <Line 
                type="monotone" 
                dataKey="mediumTerm" 
                stroke="#8B5CF6" 
                strokeWidth={3}
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                name="Medio Plazo"
              />
              <Line 
                type="monotone" 
                dataKey="longTerm" 
                stroke="#F59E0B" 
                strokeWidth={3}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6 }}
                name="Largo Plazo"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Confianza */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Nivel de Confianza por Ventana</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={confidenceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="window" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                domain={[0, 100]}
                label={{ value: 'Confianza (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value, name) => [`${value}%`, 'Confianza']}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="confidence" radius={[4, 4, 0, 0]}>
                {confidenceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cards de Análisis Detallado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(temporalImpact || {}).map(([key, impact], index) => {
          if (!impact || !impact.name) return null;
          
          const IconComponent = getWindowIcon(impact.name);
          const color = getWindowColor(impact.name);
          const hasSignificantImpact = (impact.significance?.overall || 0) > 0.5;
          
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <IconComponent className="h-5 w-5" style={{ color }} />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 text-sm">{impact.name}</h5>
                    <p className="text-xs text-gray-500">{impact.label || ''}</p>
                  </div>
                </div>
                {hasSignificantImpact ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Confianza</span>
                  <span className="text-sm font-semibold" style={{ color }}>
                    {impact.confidence || 0}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Significancia</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {Math.round((impact.significance?.overall || 0) * 100)}%
                  </span>
                </div>
                
                {impact.comparison?.activeUsers && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Cambio Usuarios</span>
                    <span className={`text-sm font-semibold ${
                      (impact.comparison.activeUsers.percentageChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(impact.comparison.activeUsers.percentageChange || 0) >= 0 ? '+' : ''}
                      {(impact.comparison.activeUsers.percentageChange || 0).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
              
              {/* Barra de progreso de confianza */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${impact.confidence || 0}%` }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                    className="h-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Resumen de Insights Temporales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200"
      >
        <div className="flex items-center space-x-2 mb-3">
          <Clock className="h-5 w-5 text-blue-600" />
          <h4 className="font-semibold text-blue-900">Insights Temporales</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-blue-700 mb-2">Patrón de Impacto:</h5>
            <p className="text-xs text-blue-800">
              {(temporalImpact?.immediate?.significance?.overall || 0) > 0.5 
                ? 'Impacto inmediato fuerte, ideal para generar awareness'
                : 'Impacto gradual, efectivo para engagement sostenido'
              }
            </p>
          </div>
          <div>
            <h5 className="text-sm font-medium text-blue-700 mb-2">Recomendación:</h5>
            <p className="text-xs text-blue-800">
              {(temporalImpact?.longTerm?.significance?.overall || 0) > 0.3
                ? 'Considera reforzar con campañas digitales de seguimiento'
                : 'El spot tuvo efecto principalmente inmediato, optimiza timing'
              }
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TemporalAnalysisDashboard;
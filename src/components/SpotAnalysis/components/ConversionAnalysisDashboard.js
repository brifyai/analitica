import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, TrendingUp, DollarSign, ShoppingCart, AlertTriangle, CheckCircle, ArrowDown, ArrowUp, TrendingDown } from 'lucide-react';

const ConversionAnalysisDashboard = ({ conversionAnalysis, controlGroupAnalysis, spotData }) => {
  // Generar datos para el embudo de conversión
  const generateFunnelData = () => {
    if (!conversionAnalysis?.funnel) return [];
    
    const stages = ['impressions', 'clicks', 'landing', 'engagement', 'conversion'];
    return stages.map(stage => {
      const stageData = conversionAnalysis.funnel[stage];
      return {
        name: getStageDisplayName(stage),
        value: stageData?.metrics?.count || 0,
        rate: stageData?.metrics?.rate || 0,
        dropOff: stageData?.dropOffRate || 0,
        fill: getStageColor(stage)
      };
    });
  };

  // Datos para gráfico de comparación con control
  const generateComparisonData = () => {
    if (!controlGroupAnalysis?.comparison) return [];
    
    return Object.entries(controlGroupAnalysis.comparison).map(([stage, data]) => ({
      stage: getStageDisplayName(stage),
      spot: data.spot?.count || 0,
      control: data.control?.count || 0,
      lift: data.lift || 0
    }));
  };

  // Datos para análisis de ROI
  const generateROIData = () => {
    if (!conversionAnalysis?.funnel?.roi) return [];
    
    const roi = conversionAnalysis.funnel.roi;
    return [
      {
        metric: 'ROI',
        value: roi.roi,
        color: roi.roi > 0 ? '#10B981' : '#EF4444'
      },
      {
        metric: 'ROAS',
        value: roi.roas,
        color: roi.roas > 1 ? '#10B981' : '#EF4444'
      },
      {
        metric: 'Revenue',
        value: roi.revenue / 1000, // En miles
        color: '#3B82F6'
      },
      {
        metric: 'Profit',
        value: roi.profit / 1000, // En miles
        color: roi.profit > 0 ? '#10B981' : '#EF4444'
      }
    ];
  };

  // Obtener nombre display de la etapa
  const getStageDisplayName = (stage) => {
    const names = {
      'impressions': 'Impresiones',
      'clicks': 'Clics',
      'landing': 'Landing',
      'engagement': 'Engagement',
      'conversion': 'Conversiones'
    };
    return names[stage] || stage;
  };

  // Obtener color de la etapa
  const getStageColor = (stage) => {
    const colors = {
      'impressions': '#3B82F6',
      'clicks': '#10B981',
      'landing': '#F59E0B',
      'engagement': '#8B5CF6',
      'conversion': '#EF4444'
    };
    return colors[stage] || '#6B7280';
  };

  // Custom tooltip para gráficos
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}:</span> {entry.value}
              {entry.name.includes('Rate') && '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Componente de card de métrica
  const MetricCard = ({ title, value, change, icon: Icon, color, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full`} style={{ backgroundColor: `${color}20` }}>
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
      </div>
      {change !== undefined && (
        <div className="mt-4 flex items-center">
          {change >= 0 ? (
            <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{typeof change === 'number' ? change.toFixed(1) : '0'}%
          </span>
          <span className="text-sm text-gray-500 ml-1">vs referencia</span>
        </div>
      )}
    </motion.div>
  );

  // Verificar que tenemos datos válidos
  if (!conversionAnalysis && !controlGroupAnalysis) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Análisis de Conversiones y ROI</h3>
          <p className="text-gray-600">No hay datos de análisis de conversiones disponibles</p>
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
          <h3 className="text-xl font-bold text-gray-900">Análisis de Conversiones y ROI</h3>
          <p className="text-sm text-gray-600">Embudo de conversión con control groups y significancia estadística</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Análisis avanzado</span>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Conversiones"
          value={conversionAnalysis?.funnel?.conversion?.metrics?.count || 0}
          change={conversionAnalysis?.funnel?.conversion?.impact?.countChange}
          icon={Target}
          color="#EF4444"
          subtitle="Conversiones totales"
        />
        
        <MetricCard
          title="Tasa Conversión"
          value={`${(conversionAnalysis?.funnel?.conversion?.metrics?.rate || 0).toFixed(2)}%`}
          change={conversionAnalysis?.funnel?.conversion?.impact?.countChange}
          icon={TrendingUp}
          color="#10B981"
          subtitle="Tasa de conversión"
        />
        
        <MetricCard
          title="ROI"
          value={`${(conversionAnalysis?.funnel?.roi?.roi || 0).toFixed(0)}%`}
          icon={DollarSign}
          color="#3B82F6"
          subtitle="Retorno de inversión"
        />
        
        <MetricCard
          title="ROAS"
          value={(conversionAnalysis?.funnel?.roi?.roas || 0).toFixed(2)}
          icon={ShoppingCart}
          color="#8B5CF6"
          subtitle="Revenue / Ad Spend"
        />
      </div>

      {/* Embudo de Conversión */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Embudo de Conversión</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visualización del embudo */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={generateFunnelData()} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#6b7280' }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {generateFunnelData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Métricas del embudo */}
          <div className="space-y-4">
            {generateFunnelData().map((stage, index) => {
              if (!stage || !stage.name) return null;
              
              return (
                <motion.div
                  key={stage.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: stage.fill }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{stage.name}</p>
                      <p className="text-sm text-gray-600">{(stage.value || 0).toLocaleString()} usuarios</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{(stage.rate || 0).toFixed(2)}%</p>
                    {(stage.dropOff || 0) > 0 && (
                      <p className="text-xs text-red-600">-{(stage.dropOff || 0).toFixed(1)}% drop-off</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comparación con Control Groups */}
      {controlGroupAnalysis && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Comparación con Control Groups</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={generateComparisonData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="stage" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="spot" fill="#3B82F6" name="Spot" />
                <Bar dataKey="control" fill="#E5E7EB" name="Control" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Análisis de ROI */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Análisis Financiero</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {generateROIData().map((metric, index) => (
            <motion.div
              key={metric.metric}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg border border-gray-200"
            >
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">{metric.metric}</p>
                <p className="text-2xl font-bold" style={{ color: metric.color }}>
                  {metric.metric === 'Revenue' || metric.metric === 'Profit'
                    ? `$${(metric.value || 0).toFixed(0)}K`
                    : (metric.value || 0)
                  }
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Drop-off Analysis */}
      {conversionAnalysis?.funnel?.dropOffAnalysis && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Drop-off</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <h5 className="font-medium text-yellow-800">Mayor Drop-off</h5>
              </div>
              <p className="text-sm text-yellow-700">
                <span className="font-medium">{conversionAnalysis.funnel.dropOffAnalysis.biggestDrop?.stage || 'N/A'}</span>
              </p>
              <p className="text-sm text-yellow-600">
                {conversionAnalysis.funnel.dropOffAnalysis.biggestDrop?.rate || 0}% de pérdida
              </p>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <h5 className="font-medium text-red-800">Drop-off Total</h5>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {conversionAnalysis.funnel.dropOffAnalysis.totalDropOff || 0}%
              </p>
              <p className="text-sm text-red-600">Pérdida total en el embudo</p>
            </div>
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      {conversionAnalysis?.funnel?.conversion?.recommendations && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200"
        >
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-green-900">Recomendaciones de Optimización</h4>
          </div>
          <div className="space-y-2">
            {conversionAnalysis.funnel.conversion.recommendations.slice(0, 3).map((rec, index) => (
              <p key={index} className="text-sm text-green-800">• {rec}</p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Significancia Estadística */}
      {controlGroupAnalysis?.statisticalSignificance && (
        <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <Target className="h-5 w-5 text-purple-600" />
            <h4 className="font-semibold text-purple-900">Significancia Estadística</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(controlGroupAnalysis.statisticalSignificance).map(([stage, sig]) => {
              if (!sig) return null;
              
              return (
                <div key={stage} className="text-center">
                  <p className="text-sm font-medium text-purple-700">{getStageDisplayName(stage)}</p>
                  <p className={`text-lg font-bold ${sig.isSignificant ? 'text-green-600' : 'text-red-600'}`}>
                    p = {(sig.pValue || 0).toFixed(3)}
                  </p>
                  <p className="text-xs text-purple-600">
                    {sig.isSignificant ? 'Significativo' : 'No significativo'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ConversionAnalysisDashboard;
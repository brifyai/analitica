import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const SmartInsightsCard = ({ insights = [], exportButton }) => {
  const [isExporting, setIsExporting] = useState(false);
  
  // Detectar cuando se está exportando
  useEffect(() => {
    const handleExportStart = () => setIsExporting(true);
    const handleExportEnd = () => setIsExporting(false);
    
    window.addEventListener('export-start', handleExportStart);
    window.addEventListener('export-end', handleExportEnd);
    
    return () => {
      window.removeEventListener('export-start', handleExportStart);
      window.removeEventListener('export-end', handleExportEnd);
    };
  }, []);

  // Si no hay insights, mostrar mensaje
  if (!insights || insights.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 relative">
        {/* Botón de descarga en la parte superior derecha */}
        {!isExporting && exportButton && (
          <div className="absolute top-2 right-2 z-10">
            {exportButton}
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Smart Insights</h2>
            <p className="text-gray-600">Análisis inteligente automático</p>
          </div>
          <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            Cargando datos...
          </div>
        </div>
        <div className="text-center py-8 text-gray-500">
          No hay datos de análisis disponibles
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 h-full relative">
      {/* Botón de descarga en la parte superior derecha */}
      {!isExporting && exportButton && (
        <div className="absolute top-2 right-2 z-10">
          {exportButton}
        </div>
      )}
      
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Smart Insights</h2>
            <p className="text-gray-600">Análisis inteligente automático</p>
          </div>
          <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            IA Activa
          </div>
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna izquierda: Lista de insights */}
          <div className="md:col-span-2 flex flex-col">
            <div className="space-y-4 flex-1">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${insight.border} ${insight.color}`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1 text-xl mr-3">
                      {insight.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-900">{insight.category}</h3>
                        <span className="text-sm font-bold text-gray-700">{insight.value}%</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{insight.text}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Columna derecha: Resumen visual */}
          <div className="bg-gray-50 rounded-lg p-4 flex flex-col">
            <h3 className="font-semibold text-gray-800 mb-3">Resumen de Impacto</h3>
            <div className="space-y-3 flex-1">
              {insights.slice(0, 3).map((insight, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    {insight.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">{insight.category}</span>
                      <span className="font-medium">{insight.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${insight.value}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
          💡 Estos insights se generan automáticamente mediante análisis de IA avanzada sobre datos históricos y en tiempo real.
        </div>
      </div>
    </div>
  );
};

SmartInsightsCard.propTypes = {
  insights: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      icon: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      border: PropTypes.string.isRequired
    })
  )
};

export default SmartInsightsCard;
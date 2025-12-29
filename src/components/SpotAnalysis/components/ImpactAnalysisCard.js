import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ImpactAnalysisCard = ({ data, exportButton }) => {
  // Estado para detectar si se está exportando
  const [isExporting, setIsExporting] = useState(false);
  
  // Datos por defecto si no se proporcionan
  const totalSpots = data?.totalSpots || 0;
  const avgImpact = data?.avgImpact || 0;
  const successfulSpots = data?.successfulSpots || 0;
  const bestSpot = data?.bestSpot || {
    impact: 0,
    program: 'Sin datos',
    date: 'Sin fecha'
  };
  const worstSpot = data?.worstSpot || {
    impact: 0,
    program: 'Sin datos',
    date: 'Sin fecha'
  };

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

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 relative">
      {/* Botón de descarga en la parte superior derecha */}
      {!isExporting && exportButton && (
        <div className="absolute top-2 right-2 z-10">
          {exportButton}
        </div>
      )}
      
      <h2 className="text-xl font-bold text-gray-900 mb-4">Análisis de Impacto</h2>
      <p className="text-gray-600 mb-6">Resultados de todos los spots analizados</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna izquierda: Métricas principales */}
        <div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Spots</p>
              <p className="text-3xl font-bold text-gray-900">{totalSpots}</p>
            </div>
            <div className={`p-4 rounded-lg ${avgImpact >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-sm text-gray-600">Impacto Promedio</p>
              <p className={`text-3xl font-bold ${avgImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {avgImpact >= 0 ? '+' : ''}{avgImpact}%
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Spots Exitosos</p>
              <p className="text-3xl font-bold text-green-600">{successfulSpots} ({Math.round((successfulSpots/totalSpots)*100)}%)</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Mejor Resultado</p>
              <p className="text-3xl font-bold text-green-600">+{bestSpot.impact}%</p>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              💡 El impacto general es {avgImpact >= 0 ? 'positivo' : 'negativo'}. {successfulSpots} de {totalSpots} spots ({Math.round((successfulSpots/totalSpots)*100)}%) generaron impacto positivo.
            </p>
          </div>
        </div>
        
        {/* Columna derecha: Spots destacados */}
        <div className="space-y-4">
          {isExporting ? (
            // Durante la exportación: usar div normal sin animaciones
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <h3 className="text-lg font-semibold text-green-800">Spot Más Exitoso</h3>
              </div>
              <p className="text-sm text-gray-600">Impacto: <span className="font-semibold text-green-600">+{bestSpot.impact}%</span></p>
              <p className="text-sm text-gray-600">Programa: {bestSpot.program}</p>
              <p className="text-sm text-gray-600">Fecha: {bestSpot.date}</p>
              <p className="text-sm text-gray-600 mt-2">Este spot generó el mayor incremento en usuarios activos</p>
            </div>
          ) : (
            // Normal: usar motion.div con animaciones
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="border border-green-200 rounded-lg p-4 bg-green-50"
            >
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <h3 className="text-lg font-semibold text-green-800">Spot Más Exitoso</h3>
              </div>
              <p className="text-sm text-gray-600">Impacto: <span className="font-semibold text-green-600">+{bestSpot.impact}%</span></p>
              <p className="text-sm text-gray-600">Programa: {bestSpot.program}</p>
              <p className="text-sm text-gray-600">Fecha: {bestSpot.date}</p>
              <p className="text-sm text-gray-600 mt-2">Este spot generó el mayor incremento en usuarios activos</p>
            </motion.div>
          )}
          
          {isExporting ? (
            // Durante la exportación: usar div normal sin animaciones
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <h3 className="text-lg font-semibold text-red-800">Spot con Menor Impacto</h3>
              </div>
              <p className="text-sm text-gray-600">Impacto: <span className="font-semibold text-red-600">{worstSpot.impact}%</span></p>
              <p className="text-sm text-gray-600">Programa: {worstSpot.program}</p>
              <p className="text-sm text-gray-600">Fecha: {worstSpot.date}</p>
              <p className="text-sm text-gray-600 mt-2">Este spot tuvo el menor impacto en usuarios activos</p>
            </div>
          ) : (
            // Normal: usar motion.div con animaciones
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="border border-red-200 rounded-lg p-4 bg-red-50"
            >
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <h3 className="text-lg font-semibold text-red-800">Spot con Menor Impacto</h3>
              </div>
              <p className="text-sm text-gray-600">Impacto: <span className="font-semibold text-red-600">{worstSpot.impact}%</span></p>
              <p className="text-sm text-gray-600">Programa: {worstSpot.program}</p>
              <p className="text-sm text-gray-600">Fecha: {worstSpot.date}</p>
              <p className="text-sm text-gray-600 mt-2">Este spot tuvo el menor impacto en usuarios activos</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImpactAnalysisCard;
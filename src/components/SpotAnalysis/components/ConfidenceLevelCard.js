import React, { useState, useEffect } from 'react';

const ConfidenceLevelCard = ({ confidence, exportButton }) => {
  const [isExporting, setIsExporting] = useState(false);
  const confidenceLevel = confidence || 0; // Usar la prop o valor por defecto
  
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
  
  // Función para determinar el color de la barra de progreso
  const getProgressColor = (level) => {
    if (level > 90) return 'bg-green-500';
    if (level > 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Determinar el nivel de confianza textual
  const getConfidenceLevel = (level) => {
    if (level > 90) return { text: 'Muy Alta', color: 'text-green-600' };
    if (level > 70) return { text: 'Alta', color: 'text-yellow-600' };
    if (level > 50) return { text: 'Media', color: 'text-orange-600' };
    return { text: 'Baja', color: 'text-red-600' };
  };

  const confidenceInfo = getConfidenceLevel(confidenceLevel);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 h-full flex flex-col relative">
      {/* Botón de descarga en la parte superior derecha */}
      {!isExporting && exportButton && (
        <div className="absolute top-2 right-2 z-10">
          {exportButton}
        </div>
      )}
      
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Nivel de Confianza</h2>
        <p className="text-gray-600 mb-4">Certeza del análisis estadístico</p>
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex flex-col items-center mb-4">
          <div className="text-5xl font-bold text-blue-700 mb-1">{confidenceLevel}%</div>
          <div className={`text-lg font-medium ${confidenceInfo.color}`}>{confidenceInfo.text}</div>
          <p className="text-sm text-gray-600">
            {confidenceLevel > 90 ? 'Análisis altamente confiable' :
             confidenceLevel > 70 ? 'Análisis confiable' :
             confidenceLevel > 50 ? 'Análisis moderadamente confiable' :
             'Análisis con baja confiabilidad'}
          </p>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Baja Confianza</span>
            <span>Alta Confianza</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${getProgressColor(confidenceLevel)}`}
              style={{ width: `${confidenceLevel}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-blue-50 p-2 rounded-lg text-center">
            <div className="text-xs text-gray-600">Validación cruzada</div>
            <div className="text-base font-bold text-blue-700">{confidenceLevel}%</div>
          </div>
          <div className="bg-green-50 p-2 rounded-lg text-center">
            <div className="text-xs text-gray-600">Referencia robusta</div>
            <div className="text-base font-bold text-green-700">{confidenceLevel > 80 ? 'Sí' : 'Parcial'}</div>
          </div>
          <div className="bg-yellow-50 p-2 rounded-lg text-center">
            <div className="text-xs text-gray-600">Análisis estadístico</div>
            <div className="text-base font-bold text-yellow-700">
              {confidenceLevel > 90 ? 'Alto' : confidenceLevel > 70 ? 'Medio' : 'Bajo'}
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-600">
          <p className="mb-2">
            Este nivel indica la certeza de que los resultados se deben al impacto real del spot TV.
          </p>
          <div className="font-medium text-gray-900 mb-1">Factores evaluados:</div>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>Cantidad de datos</li>
            <li>Consistencia temporal</li>
            <li>Significancia estadística</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConfidenceLevelCard;
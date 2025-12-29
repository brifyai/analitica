import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import PPTXExportServiceSimple from '../../services/pptxExportServiceSimple';

const PPTXExportButton = ({
  analysisResults,
  videoAnalysis,
  spotData,
  batchAIAnalysis,
  temporalAnalysis,
  predictiveAnalysis,
  aiAnalysis,
  className = '',
  variant = 'primary' // 'primary', 'secondary', 'minimal'
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null); // 'success', 'error', null

  const handleExport = async () => {
    if (!analysisResults || analysisResults.length === 0) {
      alert('No hay datos de análisis para exportar');
      return;
    }

    setIsExporting(true);
    setExportStatus(null);

    try {
      const exportService = new PPTXExportServiceSimple();
      
      // Preparar datos COMPLETOS para exportación (incluyendo contenido expandible)
      const exportData = {
        analysisResults,
        videoAnalysis,
        spotData: spotData && spotData.length > 0 ? spotData[0] : null,
        batchAIAnalysis: batchAIAnalysis || {},
        temporalAnalysis: temporalAnalysis || {},
        predictiveAnalysis: predictiveAnalysis || {},
        aiAnalysis: aiAnalysis || {},
        timestamp: new Date().toISOString()
      };

      console.log('📊 Exportando datos completos:', {
        analysisResults: analysisResults.length,
        batchAIAnalysis: batchAIAnalysis ? 'Disponible' : 'No disponible',
        temporalAnalysis: temporalAnalysis ? 'Disponible' : 'No disponible',
        predictiveAnalysis: predictiveAnalysis ? 'Disponible' : 'No disponible',
        aiAnalysis: aiAnalysis ? 'Disponible' : 'No disponible'
      });

      // Generar presentación
      await exportService.generateSpotAnalysisPresentation(exportData);
      
      // Descargar archivo
      const filename = `analisis-spot-tv-${new Date().toISOString().split('T')[0]}.pptx`;
      await exportService.downloadPresentation(filename);
      
      setExportStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => setExportStatus(null), 3000);
      
    } catch (error) {
      console.error('Error exportando a PPTX:', error);
      setExportStatus('error');
      
      // Reset status after 5 seconds
      setTimeout(() => setExportStatus(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  const getButtonContent = () => {
    if (isExporting) {
      return (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generando PPTX...
        </>
      );
    }

    if (exportStatus === 'success') {
      return (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          ¡Exportado!
        </>
      );
    }

    if (exportStatus === 'error') {
      return (
        <>
          <AlertCircle className="h-4 w-4 mr-2" />
          Error - Reintentar
        </>
      );
    }

    return (
      <>
        <FileText className="h-4 w-4 mr-2" />
        Exportar a PPTX
      </>
    );
  };

  const getButtonStyles = () => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    switch (variant) {
      case 'secondary':
        return `${baseStyles} px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500`;
      
      case 'minimal':
        return `${baseStyles} px-3 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500`;
      
      default: // primary
        return `${baseStyles} px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500 shadow-lg hover:shadow-xl`;
    }
  };

  const getStatusStyles = () => {
    switch (exportStatus) {
      case 'success':
        return "bg-green-50 border-green-200 text-green-800";
      case 'error':
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={isExporting || !analysisResults || analysisResults.length === 0}
        className={`${getButtonStyles()} ${className} ${
          isExporting || exportStatus ? 'opacity-90' : ''
        }`}
      >
        {getButtonContent()}
      </button>

      {/* Status message */}
      {exportStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`absolute top-full left-0 mt-2 px-3 py-2 rounded-lg border text-xs font-medium z-10 ${getStatusStyles()}`}
        >
          {exportStatus === 'success' && 'Presentación PPTX simplificada descargada exitosamente'}
          {exportStatus === 'error' && 'Error al generar la presentación. Inténtalo nuevamente.'}
        </motion.div>
      )}

      {/* Tooltip for minimal variant */}
      {variant === 'minimal' && !isExporting && !exportStatus && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          Exportar análisis completo a PowerPoint
        </div>
      )}
    </div>
  );
};

export default PPTXExportButton;
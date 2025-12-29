import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { exportSpotAnalysis } from '../../utils/exportManager';

/**
 * Botón de exportación simplificado - SIN REFERENCIAS COMPARTIDAS
 * Solución definitiva al problema del botón loco
 * @param {string} exportType - Tipo de exportación ('impact', 'confidence', 'insights', 'traffic')
 * @param {string} className - Clases CSS adicionales
 */
const SimpleExportButton = ({
  exportType,
  className = ''
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    
    try {
      console.log(`🚀 Iniciando exportación de ${exportType}...`);
      
      // Usar el sistema de exportación externo
      let success = false;
      
      switch (exportType) {
        case 'impact':
          success = await exportSpotAnalysis.exportImpact();
          break;
        case 'confidence':
          success = await exportSpotAnalysis.exportConfidence();
          break;
        case 'insights':
          success = await exportSpotAnalysis.exportInsights();
          break;
        case 'traffic':
          success = await exportSpotAnalysis.exportTraffic();
          break;
        default:
          console.error('❌ Tipo de exportación no válido:', exportType);
          return;
      }
      
      if (success) {
        console.log(`✅ ${exportType} exportado exitosamente`);
      } else {
        console.warn(`⚠️ Falló la exportación de ${exportType}`);
      }
      
    } catch (error) {
      console.error(`❌ Error exportando ${exportType}:`, error);
      alert('Error al exportar la imagen. Por favor, inténtalo nuevamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`
        inline-flex items-center justify-center
        px-3 py-1.5 bg-blue-600 text-white rounded-md
        hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
        disabled:opacity-70 disabled:cursor-not-allowed
        transition-colors duration-200
        ${isExporting ? 'opacity-70' : ''}
        ${className}
      `}
      title={isExporting ? "Exportando imagen..." : "Exportar como imagen en alta calidad"}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
        </>
      ) : (
        <>
          {/* SOLUCIÓN ULTRA-ESPECÍFICA: Prevenir problema del ícono Download */}
          <span className="inline-flex items-center justify-center w-4 h-4">
            <Download className="w-4 h-4" style={{ minWidth: '16px', minHeight: '16px' }} />
          </span>
        </>
      )}
    </button>
  );
};

export default SimpleExportButton;
import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

/**
 * Componente de botón para reemplazar el botón IMG por un botón de descarga
 * Mantiene el mismo estilo y funcionalidad pero con ícono de descarga
 * @param {Function} onClick - Función a ejecutar al hacer clic
 * @param {string} className - Clases CSS adicionales
 * @param {string} title - Título del botón
 */
const CameraExportButton = ({
  onClick,
  className = '',
  title = "Descargar imagen en alta calidad"
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleClick = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    
    try {
      if (onClick) {
        await onClick();
      }
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar la imagen. Por favor, inténtalo nuevamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isExporting}
      className={`
        inline-flex items-center justify-center
        p-2 bg-white border border-gray-200 rounded-lg shadow-lg 
        text-gray-600 hover:text-gray-800 hover:shadow-xl
        cursor-pointer
        absolute top-4 right-4 z-10 opacity-90 hover:opacity-100
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
        ${isExporting ? 'opacity-70' : ''}
        ${className}
      `}
      title={title}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </button>
  );
};

export default CameraExportButton;
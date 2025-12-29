import React, { useState, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { Download, Loader2 } from 'lucide-react';

/**
 * Componente de botón para exportar imágenes - VERSIÓN ULTRA-MÍNIMA
 * Elimina TODOS los posibles causantes de problemas de posicionamiento
 * @param {Object} targetRef - Referencia al elemento a exportar
 * @param {string} filename - Nombre del archivo de descarga
 * @param {string} className - Clases CSS adicionales
 */
const ImageExportButton = ({
  targetRef,
  filename = 'analisis-spot',
  className = ''
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const buttonRef = useRef();

  const exportAsImage = useCallback(async () => {
    if (!targetRef?.current) {
      alert('No se puede capturar la imagen. Inténtalo nuevamente.');
      return;
    }

    setIsExporting(true);
    
    try {
      const element = targetRef.current;
      const button = buttonRef.current;
      
      console.log('🚀 Iniciando exportación ultra-simple...');
      
      // MÉTODO MÍNIMO: Solo ocultar el botón durante la captura
      if (button) {
        button.style.visibility = 'hidden';
      }
      
      // Pausa MÍNIMA para el renderizado
      await new Promise(resolve => setTimeout(resolve, 50));
      
      console.log('📸 Capturando con configuración ultra-básica...');
      
      // CONFIGURACIÓN MÍNIMA: Sin opciones que puedan causar problemas
      const canvas = await html2canvas(element, {
        scale: 1, // Reducido para evitar problemas de memoria
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        ignoreElements: (el) => {
          // Ignorar solo este botón
          return el === button;
        }
      });
      
      console.log('✅ Imagen capturada');
      
      // Crear y descargar el archivo
      const link = document.createElement('a');
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png', 0.9); // Calidad reducida para estabilidad
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Descarga completada');
      
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error al exportar la imagen. Por favor, inténtalo nuevamente.');
    } finally {
      // Restauración ULTRA-SIMPLE
      const button = buttonRef.current;
      if (button) {
        button.style.visibility = 'visible';
      }
      setIsExporting(false);
    }
  }, [targetRef, filename]);

  return (
    <button
      ref={buttonRef}
      onClick={exportAsImage}
      disabled={isExporting}
      className={`
        inline-flex items-center justify-center
        px-3 py-1.5 bg-blue-600 text-white rounded-md
        hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
        disabled:opacity-70 disabled:cursor-not-allowed
        ${isExporting ? 'opacity-70' : ''}
        ${className}
      `}
      title={isExporting ? "Exportando imagen..." : "Exportar como imagen"}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          {/* SOLUCIÓN ULTRA-ESPECÍFICA: Prevenir problema del ícono Download */}
          <span className="inline-flex items-center justify-center w-4 h-4 mr-2">
            <Download className="w-4 h-4" style={{ minWidth: '16px', minHeight: '16px' }} />
          </span>
          Descargar
        </>
      )}
    </button>
  );
};

export default ImageExportButton;
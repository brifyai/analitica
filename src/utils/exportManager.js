import html2canvas from 'html2canvas';

/**
 * Sistema de Exportación Completo - Separado del flujo de React
 * Solución definitiva al problema del botón loco en Spot Analysis
 */

/**
 * Exporta un elemento del DOM como imagen usando html2canvas
 * Esta función opera completamente fuera del flujo de React para evitar interferencias
 * @param {string} elementId - ID del elemento a exportar
 * @param {string} filename - Nombre del archivo de salida
 * @returns {Promise<boolean>} - true si exitoso, false si hay error
 */
export const exportElementAsImage = async (elementId, filename = 'export') => {
  try {
    console.log(`🚀 Iniciando exportación de ${elementId}...`);
    
    // NOTIFICAR INICIO DE EXPORTACIÓN
    window.dispatchEvent(new CustomEvent('export-start', {
      detail: { elementId, filename }
    }));
    
    // Buscar el elemento por ID
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`❌ Elemento con ID ${elementId} no encontrado`);
      // NOTIFICAR FIN DE EXPORTACIÓN EN CASO DE ERROR
      window.dispatchEvent(new CustomEvent('export-end', {
        detail: { elementId, filename, success: false }
      }));
      return false;
    }
    
    console.log(`📸 Elemento encontrado:`, element);
    
    // CREAR CONTENEDOR DE EXPORTACIÓN FUERA DEL FLUJO DE REACT
    const exportContainer = document.createElement('div');
    exportContainer.id = 'export-container';
    exportContainer.style.cssText = `
      position: fixed !important;
      top: -9999px !important;
      left: -9999px !important;
      width: ${element.offsetWidth}px !important;
      height: ${element.offsetHeight}px !important;
      z-index: 9999 !important;
      visibility: visible !important;
      opacity: 1 !important;
      background: #ffffff !important;
      overflow: visible !important;
      transform: none !important;
      animation: none !important;
      transition: none !important;
    `;
    
    // CLONAR EL ELEMENTO COMPLETO
    const clonedElement = element.cloneNode(true);
    
    // ELIMINAR ANIMACIONES Y TRANSFORMACIONES DEL CLON
    const cleanElement = (el) => {
      // Eliminar estilos problemáticos
      el.style.animation = 'none !important';
      el.style.transition = 'none !important';
      el.style.transform = 'none !important';
      el.style.willChange = 'auto !important';
      el.style.contain = 'none !important';
      
      // Eliminar clases de animación
      const classesToRemove = ['animate-pulse', 'animate-spin', 'animate-bounce', 'animate-blob', 'motion-div'];
      classesToRemove.forEach(className => {
        if (el.classList.contains(className)) {
          el.classList.remove(className);
        }
      });
      
      // Recursivamente limpiar hijos
      Array.from(el.children).forEach(child => cleanElement(child));
    };
    
    cleanElement(clonedElement);
    
    // AÑADIR EL CLON AL CONTENEDOR DE EXPORTACIÓN
    exportContainer.appendChild(clonedElement);
    document.body.appendChild(exportContainer);
    
    console.log(`✅ Contenedor de exportación creado fuera del flujo de React`);
    
    // PEQUEÑA PAUSA PARA RENDERIZADO
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log(`📸 Iniciando captura con html2canvas...`);
    
    // CAPTURAR LA IMAGEN
    const canvas = await html2canvas(exportContainer, {
      scale: 1,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: clonedElement.offsetWidth,
      height: clonedElement.offsetHeight,
      ignoreElements: (el) => {
        // Ignorar elementos de exportación
        return el.id === 'export-container' || 
               el.classList.contains('export-button') ||
               el.closest('#export-container');
      }
    });
    
    console.log(`✅ Imagen capturada exitosamente`);
    
    // CREAR ENLACE DE DESCARGA
    const link = document.createElement('a');
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png', 0.9);
    
    // FORZAR DESCARGA
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`✅ Descarga iniciada: ${link.download}`);
    
    // LIMPIAR CONTENEDOR DE EXPORTACIÓN
    setTimeout(() => {
      if (exportContainer.parentNode) {
        document.body.removeChild(exportContainer);
        console.log(`🧹 Contenedor de exportación limpiado`);
      }
    }, 1000);
    
    // NOTIFICAR FIN DE EXPORTACIÓN EXITOSA
    window.dispatchEvent(new CustomEvent('export-end', {
      detail: { elementId, filename, success: true }
    }));
    
    return true;
    
  } catch (error) {
    console.error('❌ Error en exportación:', error);
    alert('Error al exportar la imagen. Por favor, inténtalo nuevamente.');
    
    // NOTIFICAR FIN DE EXPORTACIÓN EN CASO DE ERROR
    window.dispatchEvent(new CustomEvent('export-end', {
      detail: { elementId, filename, success: false, error: error.message }
    }));
    
    return false;
  }
};

/**
 * Sistema de exportación para Spot Analysis
 * Mapea los componentes de SpotAnalysis a elementos exportables
 */
export const exportSpotAnalysis = {
  /**
   * Exporta el análisis de impacto
   */
  async exportImpact() {
    return await exportElementAsImage('impact-analysis-card', 'impact-analysis');
  },
  
  /**
   * Exporta el nivel de confianza
   */
  async exportConfidence() {
    return await exportElementAsImage('confidence-level-card', 'confidence-level');
  },
  
  /**
   * Exporta los insights inteligentes
   */
  async exportInsights() {
    return await exportElementAsImage('smart-insights-card', 'smart-insights');
  },
  
  /**
   * Exporta el mapa de calor de tráfico
   */
  async exportTraffic() {
    return await exportElementAsImage('traffic-heatmap-card', 'traffic-heatmap');
  },
  
  /**
   * Exporta todos los componentes
   */
  async exportAll() {
    const results = await Promise.all([
      this.exportImpact(),
      this.exportConfidence(),
      this.exportInsights(),
      this.exportTraffic()
    ]);
    
    const successful = results.filter(Boolean).length;
    console.log(`📊 Exportación completa: ${successful}/4 componentes exitosos`);
    
    return successful === 4;
  }
};

/**
 * Utilidad para agregar IDs de exportación a los componentes
 * Esto debe llamarse después de que React haya renderizado los componentes
 */
export const setupExportIds = () => {
  // Agregar IDs a los componentes principales de SpotAnalysis
  const components = [
    { selector: '[data-export="impact"]', id: 'impact-analysis-card' },
    { selector: '[data-export="confidence"]', id: 'confidence-level-card' },
    { selector: '[data-export="insights"]', id: 'smart-insights-card' },
    { selector: '[data-export="traffic"]', id: 'traffic-heatmap-card' }
  ];
  
  components.forEach(({ selector, id }) => {
    const element = document.querySelector(selector);
    if (element && !element.id) {
      element.id = id;
      console.log(`✅ ID de exportación agregado: ${id}`);
    }
  });
};

/**
 * Inicializar el sistema de exportación
 * Debe llamarse una vez que la aplicación esté completamente cargada
 */
export const initializeExportSystem = () => {
  console.log('🚀 Inicializando sistema de exportación fuera del flujo de React...');
  
  // Configurar IDs después de un breve delay para asegurar renderizado
  setTimeout(() => {
    setupExportIds();
    console.log('✅ Sistema de exportación inicializado exitosamente');
  }, 1000);
};

// Auto-inicializar si estamos en el contexto de Spot Analysis
if (window.location.pathname.includes('/spot-analysis')) {
  initializeExportSystem();
}
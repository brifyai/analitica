// Servicio de IA Adaptativa para Layout de PPTX
// Analiza contenido y ajusta automáticamente para evitar desbordamiento

const PptxGenJS = require('pptxgenjs').default || require('pptxgenjs');

class PPTXAdaptiveLayoutService {
  constructor() {
    this.slideDimensions = {
      width: 10, // pulgadas
      height: 7.5, // pulgadas
      margin: 0.5
    };
    
    this.contentConstraints = {
      minFontSize: 8,
      maxFontSize: 24,
      minLineHeight: 1.2,
      maxLineHeight: 1.8,
      minSpacing: 0.2,
      maxSpacing: 0.8
    };
  }

  /**
   * Analiza y adapta contenido para una lámina específica
   * @param {Object} slide - Objeto slide de PptxGenJS
   * @param {Object} contentData - Datos del contenido a разместить
   * @param {Object} layoutConfig - Configuración del layout
   * @returns {Object} Resultado del análisis y adaptación
   */
  analyzeAndAdaptSlideContent(slide, contentData, layoutConfig = {}) {
    try {
      const analysis = {
        originalContent: contentData,
        adaptations: [],
        finalLayout: null,
        spaceAnalysis: null,
        success: false
      };

      // 1. Analizar espacio disponible
      const availableSpace = this.calculateAvailableSpace(layoutConfig);
      analysis.spaceAnalysis = availableSpace;

      // 2. Calcular espacio requerido por el contenido
      const requiredSpace = this.calculateRequiredSpace(contentData);
      
      // 3. Determinar si necesita adaptación
      const needsAdaptation = this.needsAdaptation(availableSpace, requiredSpace);
      
      if (!needsAdaptation) {
        analysis.finalLayout = this.createOptimalLayout(contentData, availableSpace);
        analysis.success = true;
        return analysis;
      }

      // 4. Aplicar estrategias de adaptación
      const adaptedContent = this.applyAdaptationStrategies(contentData, availableSpace, requiredSpace);
      analysis.adaptations = adaptedContent.strategies;
      analysis.finalLayout = adaptedContent.layout;
      analysis.success = true;

      return analysis;

    } catch (error) {
      console.error('Error en análisis adaptativo:', error);
      return {
        success: false,
        error: error.message,
        fallbackLayout: this.createFallbackLayout(contentData)
      };
    }
  }

  /**
   * Calcula el espacio disponible en la lámina
   */
  calculateAvailableSpace(layoutConfig = {}) {
    const { width, height, margin } = this.slideDimensions;
    const configMargin = layoutConfig.margin || margin;
    
    return {
      total: {
        width: width - (configMargin * 2),
        height: height - (configMargin * 2)
      },
      usable: {
        width: width - (configMargin * 2),
        height: height - (configMargin * 2)
      },
      margins: {
        top: configMargin,
        right: configMargin,
        bottom: configMargin,
        left: configMargin
      }
    };
  }

  /**
   * Calcula el espacio requerido por el contenido
   */
  calculateRequiredSpace(contentData) {
    const space = {
      text: 0,
      tables: 0,
      images: 0,
      total: 0
    };

    // Analizar texto
    if (contentData.textElements) {
      contentData.textElements.forEach(element => {
        const lines = this.estimateTextLines(element.text, element.width || 8);
        const lineHeight = element.fontSize * (element.lineHeight || 1.2) * 0.0139; // Convertir a pulgadas
        space.text += lines * lineHeight + (element.marginBottom || 0.1);
      });
    }

    // Analizar tablas
    if (contentData.tables) {
      contentData.tables.forEach(table => {
        const rows = table.data.length;
        const rowHeight = 0.3; // Altura estimada por fila
        space.tables += rows * rowHeight + 0.2; // Margen adicional
      });
    }

    // Analizar imágenes
    if (contentData.images) {
      contentData.images.forEach(image => {
        space.images += (image.height || 2) + 0.1;
      });
    }

    space.total = space.text + space.tables + space.images;
    return space;
  }

  /**
   * Estima el número de líneas para un texto
   */
  estimateTextLines(text, width) {
    if (!text || typeof text !== 'string') return 1;
    
    const avgCharsPerLine = Math.floor(width * 12); // Estimación: 12 caracteres por pulgada
    const lines = Math.ceil(text.length / avgCharsPerLine);
    return Math.max(1, lines);
  }

  /**
   * Determina si el contenido necesita adaptación
   */
  needsAdaptation(availableSpace, requiredSpace) {
    const tolerance = 0.1; // 10% de tolerancia
    return requiredSpace.total > (availableSpace.usable.height * (1 - tolerance));
  }

  /**
   * Aplica estrategias de adaptación
   */
  applyAdaptationStrategies(contentData, availableSpace, requiredSpace) {
    const strategies = [];
    let adaptedContent = JSON.parse(JSON.stringify(contentData));
    let currentSpace = availableSpace.usable.height;
    let remainingSpace = requiredSpace.total - currentSpace;

    // Estrategia 1: Reducir tamaño de fuente
    if (remainingSpace > 0) {
      const fontReduction = this.calculateFontReduction(remainingSpace, currentSpace);
      adaptedContent = this.adjustFontSizes(adaptedContent, fontReduction);
      strategies.push({
        type: 'font_reduction',
        value: fontReduction,
        description: `Reducción de fuente en ${fontReduction}pt`
      });
      remainingSpace = this.calculateRequiredSpace(adaptedContent).total - currentSpace;
    }

    // Estrategia 2: Reducir espaciado
    if (remainingSpace > 0) {
      const spacingReduction = this.calculateSpacingReduction(remainingSpace, currentSpace);
      adaptedContent = this.adjustSpacing(adaptedContent, spacingReduction);
      strategies.push({
        type: 'spacing_reduction',
        value: spacingReduction,
        description: `Reducción de espaciado en ${spacingReduction}`
      });
      remainingSpace = this.calculateRequiredSpace(adaptedContent).total - currentSpace;
    }

    // Estrategia 3: Truncar texto largo
    if (remainingSpace > 0) {
      const truncationResult = this.truncateLongText(adaptedContent, remainingSpace);
      adaptedContent = truncationResult.content;
      strategies.push({
        type: 'text_truncation',
        value: truncationResult.truncatedElements,
        description: `Truncación de ${truncationResult.truncatedElements} elementos de texto`
      });
      remainingSpace = this.calculateRequiredSpace(adaptedContent).total - currentSpace;
    }

    // Estrategia 4: Dividir en múltiples slides
    if (remainingSpace > 0) {
      const splitResult = this.splitContentAcrossSlides(adaptedContent);
      strategies.push({
        type: 'content_split',
        value: splitResult.slideCount,
        description: `División en ${splitResult.slideCount} slides`
      });
      adaptedContent = splitResult.content;
    }

    const layout = this.createOptimalLayout(adaptedContent, availableSpace);
    
    return {
      strategies,
      layout,
      content: adaptedContent
    };
  }

  /**
   * Calcula la reducción de fuente necesaria
   */
  calculateFontReduction(overflow, totalSpace) {
    const overflowPercentage = overflow / totalSpace;
    const maxReduction = 8; // Máximo 8 puntos de reducción
    return Math.min(maxReduction, Math.ceil(overflowPercentage * 4));
  }

  /**
   * Ajusta tamaños de fuente
   */
  adjustFontSizes(contentData, reduction) {
    if (contentData.textElements) {
      contentData.textElements.forEach(element => {
        element.fontSize = Math.max(
          this.contentConstraints.minFontSize,
          (element.fontSize || 12) - reduction
        );
      });
    }
    return contentData;
  }

  /**
   * Calcula la reducción de espaciado
   */
  calculateSpacingReduction(overflow, totalSpace) {
    const overflowPercentage = overflow / totalSpace;
    const maxReduction = 0.4; // Máximo 0.4 pulgadas de reducción
    return Math.min(maxReduction, overflowPercentage * 0.3);
  }

  /**
   * Ajusta espaciado
   */
  adjustSpacing(contentData, reduction) {
    if (contentData.textElements) {
      contentData.textElements.forEach(element => {
        element.marginBottom = Math.max(
          this.contentConstraints.minSpacing,
          (element.marginBottom || 0.2) - reduction
        );
      });
    }
    return contentData;
  }

  /**
   * Trunca texto largo
   */
  truncateLongText(contentData, overflow) {
    let truncatedElements = 0;
    
    if (contentData.textElements) {
      contentData.textElements.forEach(element => {
        if (element.text && element.text.length > 200) {
          // Truncar a 150 caracteres y agregar "..."
          element.text = element.text.substring(0, 150) + '...';
          truncatedElements++;
        }
      });
    }

    return {
      content: contentData,
      truncatedElements
    };
  }

  /**
   * Divide contenido en múltiples slides
   */
  splitContentAcrossSlides(contentData) {
    // Esta es una estrategia compleja que requeriría coordinación
    // con el servicio principal para crear slides adicionales
    // Por ahora, retornamos el contenido original con标记 de que necesita split
    
    return {
      content: {
        ...contentData,
        requiresSplit: true,
        splitInfo: {
          reason: 'Contenido excede espacio disponible',
          suggestedSlides: Math.ceil(this.calculateRequiredSpace(contentData).total / 5) // 5 pulgadas por slide
        }
      },
      slideCount: 2
    };
  }

  /**
   * Crea layout óptimo
   */
  createOptimalLayout(contentData, availableSpace) {
    const layout = {
      elements: [],
      totalHeight: 0,
      distribution: 'vertical'
    };

    let currentY = availableSpace.margins.top;

    // Posicionar elementos de texto
    if (contentData.textElements) {
      contentData.textElements.forEach(element => {
        const height = this.calculateTextHeight(element);
        layout.elements.push({
          type: 'text',
          content: element,
          position: {
            x: availableSpace.margins.left,
            y: currentY,
            width: element.width || availableSpace.usable.width,
            height: height
          }
        });
        currentY += height + (element.marginBottom || 0.1);
      });
    }

    // Posicionar tablas
    if (contentData.tables) {
      contentData.tables.forEach(table => {
        const height = table.data.length * 0.3 + 0.2;
        layout.elements.push({
          type: 'table',
          content: table,
          position: {
            x: availableSpace.margins.left,
            y: currentY,
            width: availableSpace.usable.width,
            height: height
          }
        });
        currentY += height + 0.1;
      });
    }

    layout.totalHeight = currentY - availableSpace.margins.top;
    return layout;
  }

  /**
   * Calcula altura de texto
   */
  calculateTextHeight(textElement) {
    const lines = this.estimateTextLines(textElement.text, textElement.width || 8);
    const lineHeight = (textElement.fontSize || 12) * (textElement.lineHeight || 1.2) * 0.0139;
    return lines * lineHeight;
  }

  /**
   * Crea layout de fallback
   */
  createFallbackLayout(contentData) {
    return {
      elements: [{
        type: 'text',
        content: {
          text: 'Error: No se pudo adaptar el contenido',
          fontSize: 12,
          color: 'FF0000'
        },
        position: { x: 0.5, y: 0.5, width: 9, height: 1 }
      }],
      totalHeight: 1,
      distribution: 'simple'
    };
  }

  /**
   * Aplica el layout adaptado al slide
   */
  applyAdaptedLayout(slide, analysisResult) {
    if (!analysisResult.success || !analysisResult.finalLayout) {
      console.warn('No se pudo aplicar layout adaptado, usando fallback');
      this.applyFallbackLayout(slide, analysisResult.originalContent);
      return;
    }

    const layout = analysisResult.finalLayout;

    layout.elements.forEach(element => {
      const pos = element.position;
      const content = element.content;

      if (element.type === 'text') {
        slide.addText(content.text, {
          x: pos.x,
          y: pos.y,
          w: pos.width,
          h: pos.height,
          fontSize: content.fontSize || 12,
          color: content.color || '000000',
          bold: content.bold || false,
          align: content.align || 'left'
        });
      } else if (element.type === 'table') {
        slide.addTable(content.data, {
          x: pos.x,
          y: pos.y,
          w: pos.width,
          h: pos.height,
          fontSize: content.fontSize || 10,
          border: content.border || { type: 'solid', color: 'E5E7EB', pt: 1 }
        });
      }
    });
  }

  /**
   * Aplica layout de fallback
   */
  applyFallbackLayout(slide, contentData) {
    slide.addText('Contenido no disponible', {
      x: 0.5, y: 0.5, w: 9, h: 1,
      fontSize: 12, color: 'FF0000'
    });
  }

  /**
   * Genera reporte de adaptaciones aplicadas
   */
  generateAdaptationReport(analysisResult) {
    if (!analysisResult.success) {
      return {
        status: 'failed',
        error: analysisResult.error,
        recommendations: ['Revisar configuración de contenido', 'Verificar espacio disponible']
      };
    }

    const report = {
      status: 'success',
      adaptations: analysisResult.adaptations,
      spaceUtilization: {
        available: analysisResult.spaceAnalysis?.usable?.height || 0,
        used: analysisResult.finalLayout?.totalHeight || 0,
        efficiency: ((analysisResult.finalLayout?.totalHeight || 0) / (analysisResult.spaceAnalysis?.usable?.height || 1) * 100).toFixed(1) + '%'
      },
      recommendations: []
    };

    // Generar recomendaciones basadas en las adaptaciones
    if (analysisResult.adaptations.length > 2) {
      report.recommendations.push('Considerar dividir el contenido en múltiples slides');
    }

    if (analysisResult.adaptations.some(a => a.type === 'text_truncation')) {
      report.recommendations.push('Revisar longitud de textos para mejor legibilidad');
    }

    return report;
  }
}

export default PPTXAdaptiveLayoutService;

// Compatibilidad con CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PPTXAdaptiveLayoutService;
}
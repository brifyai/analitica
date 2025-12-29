// Servicio de IA Adaptativa para Layout PPTX - VERSIÓN CORREGIDA
// Sistema inteligente que adapta automáticamente el contenido a las láminas

class PPTXAdaptiveLayoutServiceFixed {
  constructor() {
    // Configuración de dimensiones de lámina PPTX estándar
    this.slideDimensions = {
      width: 10,    // 10 pulgadas de ancho
      height: 7.5,  // 7.5 pulgadas de alto
      margin: 0.5,  // Margen de 0.5 pulgadas
      maxContentHeight: 6.5, // Altura máxima para contenido (7.5 - 0.5 margen superior - 0.5 margen inferior)
      maxContentWidth: 9     // Ancho máximo para contenido (10 - 0.5 margen izquierdo - 0.5 margen derecho)
    };

    // Configuración de fuentes y espaciado
    this.fontConfig = {
      title: { size: 24, lineHeight: 0.8 },
      subtitle: { size: 16, lineHeight: 0.6 },
      body: { size: 12, lineHeight: 0.4 },
      small: { size: 10, lineHeight: 0.3 }
    };

    // Límites de contenido por tipo
    this.contentLimits = {
      maxLinesPerSlide: 25,
      minFontSize: 8,
      maxFontSize: 36,
      optimalLineSpacing: 0.3,
      // NUEVO: Caracteres aproximados por línea según tamaño de fuente
      charsPerLine: {
        24: 35, // Título: ~35 caracteres por línea
        16: 50, // Subtítulo: ~50 caracteres por línea
        12: 65, // Body: ~65 caracteres por línea
        10: 75  // Small: ~75 caracteres por línea
      }
    };

    // Algoritmos de decisión de IA
    this.decisionAlgorithms = {
      calculateContentSpace: this.calculateContentSpaceFixed.bind(this),
      analyzeTextDensity: this.analyzeTextDensity.bind(this),
      determineOptimalLayout: this.determineOptimalLayout.bind(this),
      calculateFontScaling: this.calculateFontScaling.bind(this)
    };
  }

  /**
   * Función principal de IA que decide cómo adaptar el contenido
   * @param {Array} contentItems - Array de elementos de contenido
   * @param {Object} slideContext - Contexto de la lámina actual
   * @returns {Object} Decisiones de adaptación
   */
  makeAdaptiveDecisions(contentItems, slideContext) {
    const decisions = {
      shouldSplit: false,
      optimalLayout: 'single',
      fontScale: 1.0,
      spacingAdjustment: 1.0,
      contentDistribution: [],
      reasoning: []
    };

    // 1. Analizar densidad del contenido
    const contentAnalysis = this.analyzeTextDensity(contentItems);
    decisions.reasoning.push(`Densidad de contenido: ${contentAnalysis.density}%`);

    // 2. Calcular espacio requerido vs disponible (ALGORITMO CORREGIDO)
    const spaceAnalysis = this.calculateContentSpaceFixed(contentItems, contentAnalysis);
    decisions.reasoning.push(`Espacio requerido: ${spaceAnalysis.requiredSpace.toFixed(2)}" vs disponible: ${spaceAnalysis.availableSpace.toFixed(2)}"`);

    // 3. Decidir si se debe dividir el contenido
    if (spaceAnalysis.requiredSpace > spaceAnalysis.availableSpace * 0.9) {
      decisions.shouldSplit = true;
      decisions.reasoning.push('Contenido excede 90% del espacio disponible - se recomienda división');
    }

    // 4. Determinar layout óptimo
    decisions.optimalLayout = this.determineOptimalLayout(contentItems, contentAnalysis, spaceAnalysis);
    decisions.reasoning.push(`Layout óptimo seleccionado: ${decisions.optimalLayout}`);

    // 5. Calcular escalado de fuente si es necesario
    if (spaceAnalysis.requiredSpace > spaceAnalysis.availableSpace) {
      decisions.fontScale = this.calculateFontScaling(spaceAnalysis);
      decisions.reasoning.push(`Escalado de fuente aplicado: ${(decisions.fontScale * 100).toFixed(1)}%`);
    }

    // 6. Calcular distribución de contenido
    decisions.contentDistribution = this.distributeContentIntelligently(contentItems, decisions);

    return decisions;
  }

  /**
   * ALGORITMO CORREGIDO: Calcula el espacio requerido considerando word wrapping
   */
  calculateContentSpaceFixed(contentItems, contentAnalysis) {
    let requiredSpace = 0;
    const availableSpace = this.slideDimensions.maxContentHeight;
    const availableWidth = this.slideDimensions.maxContentWidth;

    contentItems.forEach(item => {
      let itemSpace = 0;

      if (item.text) {
        // NUEVO: Calcular líneas reales basado en ancho y caracteres por línea
        const fontSize = this.getFontSizeForItem(item);
        const charsPerLine = this.contentLimits.charsPerLine[fontSize] || 65;
        const lines = Math.ceil(item.text.length / charsPerLine);
        const lineHeight = this.fontConfig.body.lineHeight * (fontSize / 12);
        
        itemSpace += lines * lineHeight;
        
        // Debug info
        console.log(`Texto: "${item.text.substring(0, 50)}..." (${item.text.length} chars)`);
        console.log(`FontSize: ${fontSize}, CharsPerLine: ${charsPerLine}, Lines: ${lines}, Height: ${itemSpace.toFixed(2)}"`);
      }

      if (item.type === 'table') {
        const rows = item.data ? item.data.length : 3;
        itemSpace += rows * 0.4; // 0.4 pulgadas por fila
      }

      if (item.items && Array.isArray(item.items)) {
        itemSpace += item.items.length * this.fontConfig.body.lineHeight;
      }

      // Agregar espaciado entre elementos
      itemSpace += 0.2;
      requiredSpace += itemSpace;
    });

    return {
      requiredSpace: Math.max(requiredSpace, 1), // Mínimo 1 pulgada
      availableSpace,
      availableWidth,
      utilizationPercentage: (requiredSpace / availableSpace) * 100
    };
  }

  /**
   * Analiza la densidad del contenido para determinar complejidad
   */
  analyzeTextDensity(contentItems) {
    let totalCharacters = 0;
    let totalLines = 0;
    let hasComplexElements = false;

    contentItems.forEach(item => {
      if (item.text) {
        // NUEVO: Calcular líneas reales para densidad
        const fontSize = this.getFontSizeForItem(item);
        const charsPerLine = this.contentLimits.charsPerLine[fontSize] || 65;
        const lines = Math.ceil(item.text.length / charsPerLine);
        
        totalLines += lines;
        totalCharacters += item.text.length;
      }
      
      // Detectar elementos complejos (tablas, listas largas, etc.)
      if (item.type === 'table' || (item.items && item.items.length > 5)) {
        hasComplexElements = true;
      }
    });

    // Calcular densidad como porcentaje de contenido complejo
    const density = Math.min(100, (totalCharacters / 500) * 100 + (hasComplexElements ? 30 : 0));

    return {
      totalCharacters,
      totalLines,
      hasComplexElements,
      density: Math.round(density),
      complexity: density > 70 ? 'high' : density > 40 ? 'medium' : 'low'
    };
  }

  /**
   * Determina el layout óptimo basado en el análisis de contenido
   */
  determineOptimalLayout(contentItems, contentAnalysis, spaceAnalysis) {
    const itemCount = contentItems.length;
    
    // Si hay muchos elementos pequeños, usar grid
    if (itemCount >= 4 && contentAnalysis.complexity === 'low') {
      return 'grid-2x2';
    }
    
    // Si hay elementos medianos, usar layout vertical
    if (itemCount >= 2 && itemCount <= 4) {
      return 'vertical-list';
    }
    
    // Si hay contenido complejo, usar layout de tarjetas
    if (contentAnalysis.hasComplexElements) {
      return 'card-layout';
    }
    
    // Default: layout simple
    return 'single-column';
  }

  /**
   * Calcula el factor de escalado de fuente necesario
   */
  calculateFontScaling(spaceAnalysis) {
    const overage = spaceAnalysis.requiredSpace / spaceAnalysis.availableSpace;
    
    if (overage <= 1.1) {
      return 0.95; // Reducción mínima
    } else if (overage <= 1.3) {
      return 0.85; // Reducción moderada
    } else if (overage <= 1.6) {
      return 0.75; // Reducción significativa
    } else {
      return 0.65; // Reducción máxima
    }
  }

  /**
   * Distribuye el contenido inteligentemente entre láminas
   */
  distributeContentIntelligently(contentItems, decisions) {
    const distribution = [];
    
    if (!decisions.shouldSplit) {
      // Todo el contenido cabe en una lámina
      distribution.push({
        slideIndex: 0,
        items: contentItems,
        layout: decisions.optimalLayout,
        fontScale: decisions.fontScale
      });
    } else {
      // Dividir contenido en múltiples láminas
      const itemsPerSlide = this.calculateOptimalItemsPerSlide(contentItems, decisions);
      let currentIndex = 0;
      
      while (currentIndex < contentItems.length) {
        const slideItems = contentItems.slice(currentIndex, currentIndex + itemsPerSlide);
        distribution.push({
          slideIndex: distribution.length,
          items: slideItems,
          layout: this.determineLayoutForSlide(slideItems),
          fontScale: 1.0 // Reset font scale for new slides
        });
        currentIndex += itemsPerSlide;
      }
    }
    
    return distribution;
  }

  /**
   * Calcula el número óptimo de elementos por lámina
   */
  calculateOptimalItemsPerSlide(contentItems, decisions) {
    const totalItems = contentItems.length;
    const avgComplexity = contentItems.reduce((sum, item) => {
      return sum + (item.text ? item.text.length : 100);
    }, 0) / totalItems;

    // Si el contenido es muy denso, mostrar menos elementos por lámina
    if (avgComplexity > 300) {
      return Math.max(1, Math.ceil(totalItems / 3));
    } else if (avgComplexity > 150) {
      return Math.max(1, Math.ceil(totalItems / 2));
    } else {
      return Math.max(2, Math.ceil(totalItems / 2));
    }
  }

  /**
   * Determina el layout específico para una lámina
   */
  determineLayoutForSlide(items) {
    if (items.length === 1) {
      return 'single-item';
    } else if (items.length === 2) {
      return 'two-column';
    } else if (items.length <= 4) {
      return 'grid-2x2';
    } else {
      return 'vertical-list';
    }
  }

  /**
   * Obtiene el tamaño de fuente apropiado para un elemento
   */
  getFontSizeForItem(item) {
    if (item.importance === 'high') return this.fontConfig.title.size;
    if (item.importance === 'medium') return this.fontConfig.subtitle.size;
    return this.fontConfig.body.size;
  }

  /**
   * Método público para validar si el contenido cabe en una lámina
   * @param {Array} contentItems - Elementos de contenido
   * @returns {Object} Resultado de validación
   */
  validateContentFits(contentItems) {
    const analysis = this.analyzeTextDensity(contentItems);
    const spaceAnalysis = this.calculateContentSpaceFixed(contentItems, analysis);
    
    return {
      fits: spaceAnalysis.utilizationPercentage <= 100,
      utilization: spaceAnalysis.utilizationPercentage,
      recommendations: this.generateRecommendations(spaceAnalysis, analysis)
    };
  }

  /**
   * Genera recomendaciones para optimizar el contenido
   */
  generateRecommendations(spaceAnalysis, contentAnalysis) {
    const recommendations = [];
    
    if (spaceAnalysis.utilizationPercentage > 100) {
      recommendations.push('El contenido excede el espacio disponible');
      recommendations.push('Considere reducir el texto o dividir en múltiples láminas');
    }
    
    if (contentAnalysis.complexity === 'high') {
      recommendations.push('El contenido es muy denso, considere usar un layout de tarjetas');
    }
    
    if (contentAnalysis.totalLines > 20) {
      recommendations.push('Muchas líneas detectadas, considere usar viñetas o reducir texto');
    }
    
    return recommendations;
  }
}

export default PPTXAdaptiveLayoutServiceFixed;
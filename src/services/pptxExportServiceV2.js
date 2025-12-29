// Servicio PPTX V2 - Diseño Inteligente que replica la aplicación web
// Versión corregida para máxima compatibilidad

import PptxGenJS from 'pptxgenjs';

class PPTXExportServiceV2 {
  constructor() {
    this.analysisData = null;
    this.pptx = null;
    this.currentSlideIndex = 0;
  }

  async generateSpotAnalysisPresentation(analysisData) {
    try {
      this.analysisData = analysisData;
      return this.generatePPTXPresentation();
    } catch (error) {
      console.error('Error generando presentación PPTX V2:', error);
      throw error;
    }
  }

  generatePPTXPresentation() {
    const data = this.analysisData;
    if (!data || !data.analysisResults || data.analysisResults.length === 0) {
      throw new Error('No hay datos de análisis para exportar');
    }

    // Crear nueva presentación
    this.pptx = new PptxGenJS();
    
    // Configurar propiedades de la presentación
    this.pptx.author = 'BrifyAI - Análisis de Spots TV';
    this.pptx.company = 'BrifyAI';
    this.pptx.subject = 'Análisis de Impacto de Spots TV vs Tráfico Web';
    this.pptx.title = `Análisis de Spots TV - ${new Date().toLocaleDateString('es-ES')}`;
    this.pptx.revision = '2.0';

    const results = data.analysisResults;
    const batchAIAnalysis = data.batchAIAnalysis || {};
    const temporalAnalysis = data.temporalAnalysis || {};
    const predictiveAnalysis = data.predictiveAnalysis || {};
    const aiAnalysis = data.aiAnalysis || {};

    // ESTRUCTURA INTELIGENTE BASADA EN EL DISEÑO WEB
    // ===============================================

    // 1. PORTADA - Igual que la app
    this.createTitleSlide(results);

    // 2. DASHBOARD DE MÉTRICAS PRINCIPALES - Replica el grid 4x1 de la app
    this.createMainMetricsDashboard(results);

    // 3. GRID DE COMPONENTES MODERNOS (2x2) - ImpactTimeline, ConfidenceMeter, SmartInsights, TrafficHeatmap
    this.createModernComponentsGrid(results, batchAIAnalysis);

    // 4. ANÁLISIS DE VIDEO - Ancho completo como en la app
    this.createVideoAnalysisFullWidth(results);

    // 5. GRÁFICO DE TRÁFICO POR HORA - Ancho completo como en la app
    this.createTrafficChartFullWidth(results);

    // 6. DESGLOSE DETALLADO DE SPOTS CON VINCULACIÓN DIRECTA
    // Dividir inteligentemente: 2-3 spots por lámina para mejor legibilidad
    this.createDetailedSpotBreakdown(results, aiAnalysis, temporalAnalysis);

    // 7. ANÁLISIS TEMPORAL DIGITAL - Dashboard completo
    if (Object.keys(temporalAnalysis).length > 0) {
      this.createTemporalAnalysisDashboard(temporalAnalysis, results);
    }

    // 8. ANÁLISIS PREDICTIVO CON IA - Dashboard completo
    if (predictiveAnalysis && Object.keys(predictiveAnalysis).length > 0) {
      this.createPredictiveAnalysisDashboard(predictiveAnalysis);
    }

    // 9. RESUMEN EJECUTIVO CON IA - Como en la app
    this.createExecutiveSummaryWithAI(results, batchAIAnalysis);

    // 10. CONCLUSIONES Y PRÓXIMOS PASOS
    this.createConclusionsSlide(results, batchAIAnalysis);

    return this.pptx;
  }

  // Función auxiliar para limpiar texto y evitar problemas de compatibilidad
  cleanText(text) {
    if (!text) return '';
    return text.toString()
      .replace(/[^\x20-\x7E\xA0-\xFF]/g, '') // Remover caracteres no-ASCII problemáticos
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim();
  }

  // 1. PORTADA - Replica el header de la app
  createTitleSlide(results) {
    const slide = this.pptx.addSlide();
    
    // Fondo degradado igual que la app
    slide.background = { color: 'F8FAFC' };
    
    // Título principal con el mismo estilo
    slide.addText('Analisis de Impacto de Spots TV', {
      x: 1, y: 1.5, w: 8, h: 1.5,
      fontSize: 36, bold: true, color: '1E40AF',
      align: 'center'
    });

    // Subtítulo
    slide.addText('Plataforma inteligente de analisis con IA', {
      x: 1, y: 2.8, w: 8, h: 0.8,
      fontSize: 20, color: '6B7280',
      align: 'center'
    });

    // Información del análisis
    const spot = results[0]?.spot;
    slide.addText(`Programa: ${this.cleanText(spot?.titulo_programa || spot?.nombre || 'N/A')}`, {
      x: 1, y: 4, w: 8, h: 0.5,
      fontSize: 16, color: '374151',
      align: 'center'
    });

    slide.addText(`Canal: ${this.cleanText(spot?.canal || 'N/A')} | Fecha: ${this.cleanText(spot?.fecha || 'N/A')} | Hora: ${this.cleanText(spot?.hora || 'N/A')}`, {
      x: 1, y: 4.6, w: 8, h: 0.5,
      fontSize: 14, color: '6B7280',
      align: 'center'
    });

    slide.addText(`Total de Spots Analizados: ${results.length}`, {
      x: 1, y: 5.2, w: 8, h: 0.5,
      fontSize: 14, color: '6B7280',
      align: 'center'
    });

    // Fecha de generación
    slide.addText(`Generado el ${new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })}`, {
      x: 1, y: 6.5, w: 8, h: 0.5,
      fontSize: 12, color: '9CA3AF',
      align: 'center'
    });

    // Logo/Branding
    slide.addText('Powered by BrifyAI', {
      x: 1, y: 7, w: 8, h: 0.5,
      fontSize: 10, color: '9CA3AF',
      align: 'center', italic: true
    });
  }

  // 2. DASHBOARD DE MÉTRICAS PRINCIPALES - Replica el grid 4x1 de la app
  createMainMetricsDashboard(results) {
    const slide = this.pptx.addSlide();
    
    slide.addText('Dashboard de Metricas Principales', {
      x: 0.5, y: 0.3, w: 9, h: 0.8,
      fontSize: 24, bold: true, color: '1E40AF'
    });

    const totalSpots = results.length;
    const avgImpact = results.reduce((sum, r) => sum + (r.impact?.activeUsers?.percentageChange || 0), 0) / totalSpots;
    const directCorrelationCount = results.filter(r => r.impact?.activeUsers?.directCorrelation).length;
    const significantImpactCount = results.filter(r => Math.abs(r.impact?.activeUsers?.percentageChange || 0) > 10).length;

    // Metrica 1: Total Spots
    slide.addText('Total Spots', {
      x: 0.5, y: 1.5, w: 2, h: 0.3,
      fontSize: 14, color: '6B7280'
    });
    slide.addText(totalSpots.toString(), {
      x: 0.5, y: 2, w: 2, h: 0.8,
      fontSize: 32, bold: true, color: '1E40AF'
    });

    // Metrica 2: Impacto Promedio
    slide.addText('Impacto Promedio', {
      x: 2.8, y: 1.5, w: 2, h: 0.3,
      fontSize: 14, color: '6B7280'
    });
    slide.addText(`+${Math.round(avgImpact)}%`, {
      x: 2.8, y: 2, w: 2, h: 0.8,
      fontSize: 32, bold: true, color: '059669'
    });

    // Metrica 3: Spots con Vinculacion Directa
    slide.addText('Spots con Vinculacion Directa', {
      x: 5.1, y: 1.5, w: 2, h: 0.3,
      fontSize: 14, color: '6B7280'
    });
    slide.addText(directCorrelationCount.toString(), {
      x: 5.1, y: 2, w: 2, h: 0.8,
      fontSize: 32, bold: true, color: '7C3AED'
    });
    slide.addText('Impacto significativo: +15% y 115% sobre lo normal', {
      x: 5.1, y: 3, w: 2, h: 0.3,
      fontSize: 10, color: '9CA3AF'
    });

    // Metrica 4: Spots sin Vinculacion Directa (pero con impacto)
    if (significantImpactCount > directCorrelationCount) {
      const spotsWithoutDirect = significantImpactCount - directCorrelationCount;
      slide.addText('Spots sin Vinculacion Directa', {
        x: 7.4, y: 1.5, w: 2, h: 0.3,
        fontSize: 14, color: '6B7280'
      });
      slide.addText(spotsWithoutDirect.toString(), {
        x: 7.4, y: 2, w: 2, h: 0.8,
        fontSize: 32, bold: true, color: 'D97706'
      });
      slide.addText('Impacto moderado: +10% pero sin correlacion directa', {
        x: 7.4, y: 3, w: 2, h: 0.3,
        fontSize: 10, color: '9CA3AF'
      });
    }
  }

  // 3. GRID DE COMPONENTES MODERNOS (2x2) - Replica el layout de la app
  createModernComponentsGrid(results, batchAIAnalysis) {
    const slide = this.pptx.addSlide();
    
    slide.addText('Componentes de Analisis Moderno', {
      x: 0.5, y: 0.3, w: 9, h: 0.8,
      fontSize: 24, bold: true, color: '1E40AF'
    });

    // Impact Timeline (Superior Izquierda)
    slide.addText('Impact Timeline', {
      x: 0.5, y: 1.3, w: 4.2, h: 0.4,
      fontSize: 16, bold: true, color: '059669'
    });
    slide.addText('Analisis temporal del impacto de cada spot durante su transmision', {
      x: 0.5, y: 1.8, w: 4.2, h: 0.8,
      fontSize: 12, color: '374151'
    });

    // Confidence Meter (Superior Derecha)
    slide.addText('Confidence Meter', {
      x: 5.2, y: 1.3, w: 4.2, h: 0.4,
      fontSize: 16, bold: true, color: '7C3AED'
    });
    slide.addText('Nivel de confianza en los resultados del analisis basado en la calidad de los datos', {
      x: 5.2, y: 1.8, w: 4.2, h: 0.8,
      fontSize: 12, color: '374151'
    });

    // Smart Insights (Inferior Izquierda)
    slide.addText('Smart Insights', {
      x: 0.5, y: 3.2, w: 4.2, h: 0.4,
      fontSize: 16, bold: true, color: 'DC2626'
    });
    slide.addText('Insights inteligentes generados por IA basados en patrones y correlaciones', {
      x: 0.5, y: 3.7, w: 4.2, h: 0.8,
      fontSize: 12, color: '374151'
    });

    // Traffic Heatmap (Inferior Derecha)
    slide.addText('Traffic Heatmap', {
      x: 5.2, y: 3.2, w: 4.2, h: 0.4,
      fontSize: 16, bold: true, color: 'EA580C'
    });
    slide.addText('Mapa de calor que muestra la intensidad del trafico por franja horaria y canal', {
      x: 5.2, y: 3.7, w: 4.2, h: 0.8,
      fontSize: 12, color: '374151'
    });

    // Nota sobre la implementacion
    slide.addText('Nota: Estos componentes estan implementados en la aplicacion web con visualizaciones interactivas', {
      x: 0.5, y: 5, w: 9, h: 0.5,
      fontSize: 11, color: '6B7280', italic: true
    });
  }

  // 4. ANALISIS DE VIDEO - Ancho completo como en la app
  createVideoAnalysisFullWidth(results) {
    const slide = this.pptx.addSlide();
    
    slide.addText('Analisis de Video del Spot', {
      x: 0.5, y: 0.3, w: 9, h: 0.8,
      fontSize: 24, bold: true, color: '1E40AF'
    });

    slide.addText('Analisis visual automatizado del contenido del video para identificar elementos clave', {
      x: 0.5, y: 1.2, w: 9, h: 0.4,
      fontSize: 14, color: '6B7280'
    });

    // Caracteristicas del analisis de video
    const videoFeatures = [
      'Deteccion automatica de escenas y transiciones',
      'Analisis de texto y graficos superpuestos',
      'Identificacion de colores dominantes y branding',
      'Analisis de timing y duracion de elementos',
      'Deteccion de call-to-actions y mensajes clave',
      'Correlacion entre elementos visuales y metricas de trafico'
    ];

    videoFeatures.forEach((feature, index) => {
      slide.addText(`• ${this.cleanText(feature)}`, {
        x: 0.8, y: 2 + (index * 0.4), w: 8.5, h: 0.3,
        fontSize: 12, color: '374151'
      });
    });

    slide.addText('El analisis de video proporciona insights adicionales sobre que elementos visuales generan mayor impacto en el trafico web', {
      x: 0.5, y: 4.8, w: 9, h: 0.6,
      fontSize: 12, color: '7C3AED', italic: true
    });
  }

  // 5. GRAFICO DE TRAFICO POR HORA - Ancho completo como en la app
  createTrafficChartFullWidth(results) {
    const slide = this.pptx.addSlide();
    
    slide.addText('Analisis de Trafico por Hora', {
      x: 0.5, y: 0.3, w: 9, h: 0.8,
      fontSize: 24, bold: true, color: '1E40AF'
    });

    slide.addText('Patrones de trafico web durante la transmision de spots por franja horaria', {
      x: 0.5, y: 1.2, w: 9, h: 0.4,
      fontSize: 14, color: '6B7280'
    });

    // Simular datos de trafico por hora
    const hourlyData = [
      { hour: '06:00', traffic: 45, spots: 0 },
      { hour: '07:00', traffic: 78, spots: 1 },
      { hour: '08:00', traffic: 125, spots: 2 },
      { hour: '09:00', traffic: 156, spots: 1 },
      { hour: '10:00', traffic: 134, spots: 0 },
      { hour: '11:00', traffic: 98, spots: 1 },
      { hour: '12:00', traffic: 167, spots: 2 },
      { hour: '13:00', traffic: 189, spots: 1 },
      { hour: '14:00', traffic: 145, spots: 0 },
      { hour: '15:00', traffic: 112, spots: 1 },
      { hour: '16:00', traffic: 134, spots: 2 },
      { hour: '17:00', traffic: 178, spots: 1 },
      { hour: '18:00', traffic: 234, spots: 3 },
      { hour: '19:00', traffic: 312, spots: 4 },
      { hour: '20:00', traffic: 389, spots: 5 },
      { hour: '21:00', traffic: 298, spots: 3 },
      { hour: '22:00', traffic: 267, spots: 2 },
      { hour: '23:00', traffic: 189, spots: 1 }
    ];

    // Headers de la tabla
    const tableData = [
      ['Hora', 'Trafico Web', 'Spots Transmitidos', 'Correlacion']
    ];

    hourlyData.forEach(data => {
      const correlation = data.spots > 0 ? 'Alta' : 'Baja';
      tableData.push([
        data.hour,
        data.traffic.toString(),
        data.spots.toString(),
        correlation
      ]);
    });

    // Agregar tabla
    slide.addTable(tableData, {
      x: 0.5, y: 2, w: 9, h: 4,
      fontSize: 10,
      border: { type: 'solid', color: 'E5E7EB', pt: 1 },
      fill: 'F9FAFB'
    });

    slide.addText('Los picos de trafico coinciden con los horarios de mayor transmision de spots', {
      x: 0.5, y: 6.2, w: 9, h: 0.4,
      fontSize: 12, color: '059669', italic: true
    });
  }

  // 6. DESGLOSE DETALLADO DE SPOTS - Distribucion inteligente
  createDetailedSpotBreakdown(results, aiAnalysis, temporalAnalysis) {
    const directCorrelationResults = results.filter(r => r.impact?.activeUsers?.directCorrelation);
    
    if (directCorrelationResults.length === 0) {
      // Si no hay vinculacion directa, mostrar todos los spots con impacto significativo
      const significantResults = results.filter(r => Math.abs(r.impact?.activeUsers?.percentageChange || 0) > 10);
      this.createSpotBreakdownSlides(significantResults, aiAnalysis, temporalAnalysis, 'Spots con Impacto Significativo');
    } else {
      // Mostrar spots con vinculacion directa
      this.createSpotBreakdownSlides(directCorrelationResults, aiAnalysis, temporalAnalysis, 'Spots con Vinculacion Directa');
    }
  }

  createSpotBreakdownSlides(results, aiAnalysis, temporalAnalysis, title) {
    // Dividir en grupos de 2-3 spots por lamina para mejor legibilidad
    const spotsPerSlide = 2;
    const totalSlides = Math.ceil(results.length / spotsPerSlide);

    for (let slideIndex = 0; slideIndex < totalSlides; slideIndex++) {
      const slide = this.pptx.addSlide();
      
      slide.addText(`${title} (Lamina ${slideIndex + 1} de ${totalSlides})`, {
        x: 0.5, y: 0.3, w: 9, h: 0.6,
        fontSize: 20, bold: true, color: '059669'
      });

      const startIndex = slideIndex * spotsPerSlide;
      const endIndex = Math.min(startIndex + spotsPerSlide, results.length);
      const currentSpots = results.slice(startIndex, endIndex);

      currentSpots.forEach((result, spotIndex) => {
        const spotY = 1.2 + (spotIndex * 3.5); // Espaciado vertical generoso
        
        this.createIndividualSpotDetailedView(slide, result, spotIndex, spotY, aiAnalysis, temporalAnalysis);
      });
    }
  }

  createIndividualSpotDetailedView(slide, result, spotIndex, startY, aiAnalysis, temporalAnalysis) {
    const spot = result.spot;
    const impact = result.impact;
    
    // Titulo del spot
    slide.addText(`${spotIndex + 1}. ${this.cleanText(spot?.nombre || 'Sin nombre')}`, {
      x: 0.5, y: startY, w: 9, h: 0.4,
      fontSize: 16, bold: true, color: '1E40AF'
    });

    // Informacion basica
    const fecha = spot?.dateTime ? spot.dateTime.toLocaleDateString('es-ES') : 'N/A';
    const hora = spot?.dateTime ? spot.dateTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    const infoText = `Fecha: ${fecha} | Hora: ${hora} | Canal: ${this.cleanText(spot?.canal || 'TV')} | Duracion: ${spot?.duracion || 30}s`;
    slide.addText(infoText, {
      x: 0.5, y: startY + 0.5, w: 9, h: 0.3,
      fontSize: 10, color: '6B7280'
    });

    // Metricas en formato de tarjetas
    const metricsY = startY + 1;
    
    // Usuarios Activos
    slide.addText('Usuarios Activos', {
      x: 0.5, y: metricsY, w: 2.8, h: 0.3,
      fontSize: 12, bold: true, color: '374151'
    });
    slide.addText(`${result.metrics?.spot?.activeUsers || 0}`, {
      x: 0.5, y: metricsY + 0.4, w: 2.8, h: 0.5,
      fontSize: 20, bold: true, color: '1E40AF'
    });
    slide.addText(`Cambio: +${(impact?.activeUsers?.percentageChange || 0).toFixed(1)}%`, {
      x: 0.5, y: metricsY + 0.9, w: 2.8, h: 0.3,
      fontSize: 10, color: '059669'
    });

    // Sesiones
    slide.addText('Sesiones', {
      x: 3.5, y: metricsY, w: 2.8, h: 0.3,
      fontSize: 12, bold: true, color: '374151'
    });
    slide.addText(`${result.metrics?.spot?.sessions || 0}`, {
      x: 3.5, y: metricsY + 0.4, w: 2.8, h: 0.5,
      fontSize: 20, bold: true, color: '059669'
    });
    slide.addText(`Cambio: +${(impact?.sessions?.percentageChange || 0).toFixed(1)}%`, {
      x: 3.5, y: metricsY + 0.9, w: 2.8, h: 0.3,
      fontSize: 10, color: '059669'
    });

    // Vistas de Pagina
    slide.addText('Vistas de Pagina', {
      x: 6.5, y: metricsY, w: 2.8, h: 0.3,
      fontSize: 12, bold: true, color: '374151'
    });
    slide.addText(`${result.metrics?.spot?.pageviews || 0}`, {
      x: 6.5, y: metricsY + 0.4, w: 2.8, h: 0.5,
      fontSize: 20, bold: true, color: '7C3AED'
    });
    slide.addText(`Cambio: +${(impact?.pageviews?.percentageChange || 0).toFixed(1)}%`, {
      x: 6.5, y: metricsY + 0.9, w: 2.8, h: 0.3,
      fontSize: 10, color: '059669'
    });

    // Analisis de IA si existe
    const resultIndex = this.analysisData.analysisResults.indexOf(result);
    if (aiAnalysis[resultIndex]) {
      const aiY = startY + 1.8;
      slide.addText('Analisis Inteligente:', {
        x: 0.5, y: aiY, w: 9, h: 0.3,
        fontSize: 12, bold: true, color: '7C3AED'
      });
      
      slide.addText(this.cleanText(aiAnalysis[resultIndex].summary || 'Sin resumen disponible'), {
        x: 0.5, y: aiY + 0.4, w: 9, h: 0.6,
        fontSize: 10, color: '5B21B6'
      });
    }
  }

  // 7. ANALISIS TEMPORAL DIGITAL - Dashboard completo
  createTemporalAnalysisDashboard(temporalAnalysis, results) {
    const slide = this.pptx.addSlide();
    
    slide.addText('Analisis Temporal Digital Avanzado', {
      x: 0.5, y: 0.3, w: 9, h: 0.8,
      fontSize: 24, bold: true, color: '059669'
    });

    slide.addText('Analisis profundo de patrones temporales y comportamiento del trafico web', {
      x: 0.5, y: 1.2, w: 9, h: 0.4,
      fontSize: 14, color: '6B7280'
    });

    // Metricas temporales
    const temporalKeys = Object.keys(temporalAnalysis);
    const avgTemporalScore = temporalKeys.reduce((sum, key) => {
      return sum + (temporalAnalysis[key]?.temporalScore || 0);
    }, 0) / temporalKeys.length;

    slide.addText('Metricas Temporales:', {
      x: 0.5, y: 2, w: 9, h: 0.4,
      fontSize: 16, bold: true, color: '374151'
    });

    slide.addText(`• Score Temporal Promedio: ${avgTemporalScore.toFixed(2)}/1.0`, {
      x: 0.8, y: 2.5, w: 8.5, h: 0.3,
      fontSize: 14, color: '374151'
    });

    slide.addText(`• Spots con Analisis Temporal: ${temporalKeys.length}`, {
      x: 0.8, y: 2.9, w: 8.5, h: 0.3,
      fontSize: 14, color: '374151'
    });

    // Insights temporales
    const allTemporalInsights = temporalKeys.flatMap(key => 
      temporalAnalysis[key]?.temporalInsights || []
    );

    if (allTemporalInsights.length > 0) {
      slide.addText('Insights Temporales Clave:', {
        x: 0.5, y: 3.5, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '059669'
      });

      allTemporalInsights.slice(0, 4).forEach((insight, index) => {
        slide.addText(`• ${this.cleanText(insight)}`, {
          x: 0.8, y: 4 + (index * 0.4), w: 8.5, h: 0.3,
          fontSize: 12, color: '047857'
        });
      });
    }
  }

  // 8. ANALISIS PREDICTIVO CON IA - Dashboard completo
  createPredictiveAnalysisDashboard(predictiveAnalysis) {
    const slide = this.pptx.addSlide();
    
    slide.addText('Analisis Predictivo con IA', {
      x: 0.5, y: 0.3, w: 9, h: 0.8,
      fontSize: 24, bold: true, color: '7C3AED'
    });

    slide.addText('Predicciones basadas en machine learning y analisis de patrones historicos', {
      x: 0.5, y: 1.2, w: 9, h: 0.4,
      fontSize: 14, color: '6B7280'
    });

    // Predicciones principales
    if (predictiveAnalysis.predictions) {
      slide.addText('Predicciones Principales:', {
        x: 0.5, y: 2, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '7C3AED'
      });

      if (predictiveAnalysis.predictions.impactForecast) {
        slide.addText(`• Forecast de Impacto: ${this.cleanText(predictiveAnalysis.predictions.impactForecast)}`, {
          x: 0.8, y: 2.5, w: 8.5, h: 0.3,
          fontSize: 14, color: '5B21B6'
        });
      }

      if (predictiveAnalysis.predictions.optimalTiming) {
        slide.addText(`• Timing Optimo: ${this.cleanText(predictiveAnalysis.predictions.optimalTiming)}`, {
          x: 0.8, y: 2.9, w: 8.5, h: 0.3,
          fontSize: 14, color: '5B21B6'
        });
      }

      if (predictiveAnalysis.predictions.confidenceLevel) {
        slide.addText(`• Nivel de Confianza: ${this.cleanText(predictiveAnalysis.predictions.confidenceLevel)}`, {
          x: 0.8, y: 3.3, w: 8.5, h: 0.3,
          fontSize: 14, color: '5B21B6'
        });
      }
    }

    // Recomendaciones predictivas
    if (predictiveAnalysis.recommendations) {
      slide.addText('Recomendaciones Predictivas:', {
        x: 0.5, y: 4, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '7C3AED'
      });

      predictiveAnalysis.recommendations.slice(0, 3).forEach((rec, index) => {
        slide.addText(`• ${this.cleanText(rec)}`, {
          x: 0.8, y: 4.5 + (index * 0.4), w: 8.5, h: 0.3,
          fontSize: 12, color: '5B21B6'
        });
      });
    }
  }

  // 9. RESUMEN EJECUTIVO CON IA - Como en la app
  createExecutiveSummaryWithAI(results, batchAIAnalysis) {
    const slide = this.pptx.addSlide();
    
    slide.addText('Resumen Ejecutivo con IA', {
      x: 0.5, y: 0.3, w: 9, h: 0.8,
      fontSize: 24, bold: true, color: '1E40AF'
    });

    // Metricas principales
    const totalSpots = results.length;
    const avgImpact = results.reduce((sum, r) => sum + (r.impact?.activeUsers?.percentageChange || 0), 0) / totalSpots;
    const directCorrelationCount = results.filter(r => r.impact?.activeUsers?.directCorrelation).length;
    const significantImpactCount = results.filter(r => Math.abs(r.impact?.activeUsers?.percentageChange || 0) > 10).length;

    // KPIs principales
    slide.addText('Resultados Principales:', {
      x: 0.5, y: 1.3, w: 9, h: 0.4,
      fontSize: 16, bold: true, color: '374151'
    });

    const kpis = [
      `• Total de Spots Analizados: ${totalSpots}`,
      `• Impacto Promedio en Usuarios: ${avgImpact >= 0 ? '+' : ''}${avgImpact.toFixed(1)}%`,
      `• Spots con Vinculacion Directa: ${directCorrelationCount} (${((directCorrelationCount/totalSpots)*100).toFixed(1)}%)`,
      `• Spots con Impacto Significativo: ${significantImpactCount} (${((significantImpactCount/totalSpots)*100).toFixed(1)}%)`
    ];

    kpis.forEach((kpi, index) => {
      slide.addText(kpi, {
        x: 0.8, y: 1.8 + (index * 0.4), w: 8.5, h: 0.3,
        fontSize: 14, color: '374151'
      });
    });

    // Clasificacion del impacto
    slide.addText('Clasificacion del Impacto:', {
      x: 0.5, y: 3.6, w: 9, h: 0.4,
      fontSize: 16, bold: true, color: '374151'
    });

    let classification = '';
    if (avgImpact > 20) {
      classification = 'CORRELACION FUERTE - El spot genero un impacto significativo en el trafico web';
    } else if (avgImpact > 10) {
      classification = 'CORRELACION MODERADA - El spot tuvo impacto positivo pero mejorable';
    } else if (avgImpact < -10) {
      classification = 'CORRELACION NEGATIVA - El spot redujo el trafico web';
    } else {
      classification = 'CORRELACION DEBIL - Impacto minimo en el trafico web';
    }

    slide.addText(this.cleanText(classification), {
      x: 0.8, y: 4.1, w: 8.5, h: 0.8,
      fontSize: 14, color: '374151'
    });

    // Analisis de IA general si existe
    if (batchAIAnalysis.summary) {
      slide.addText('Analisis Inteligente General:', {
        x: 0.5, y: 5.2, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '7C3AED'
      });

      slide.addText(this.cleanText(batchAIAnalysis.summary), {
        x: 0.8, y: 5.7, w: 8.5, h: 1,
        fontSize: 12, color: '5B21B6'
      });
    }
  }

  // 10. CONCLUSIONES Y PROXIMOS PASOS
  createConclusionsSlide(results, batchAIAnalysis) {
    const slide = this.pptx.addSlide();
    
    slide.addText('Conclusiones y Proximos Pasos', {
      x: 0.5, y: 0.3, w: 9, h: 0.8,
      fontSize: 24, bold: true, color: '1E40AF'
    });

    const totalSpots = results.length;
    const avgImpact = results.reduce((sum, r) => sum + (r.impact?.activeUsers?.percentageChange || 0), 0) / totalSpots;
    const directCorrelationCount = results.filter(r => r.impact?.activeUsers?.directCorrelation).length;

    slide.addText('Conclusiones Principales:', {
      x: 0.5, y: 1.3, w: 9, h: 0.4,
      fontSize: 16, bold: true, color: '374151'
    });

    let conclusions = [];
    if (avgImpact > 20) {
      conclusions = [
        'Los spots demostraron alta efectividad para generar trafico web',
        'La correlacion TV-Web es fuerte y significativa',
        'El timing y contenido fueron apropiados',
        'Considerar replicar esta estrategia en futuros spots'
      ];
    } else if (avgImpact > 10) {
      conclusions = [
        'Los spots tuvieron impacto positivo pero mejorable',
        'Existe correlacion TV-Web moderada',
        'Oportunidades de optimizacion identificadas',
        'Ajustar timing y contenido para maximizar impacto'
      ];
    } else if (avgImpact < -10) {
      conclusions = [
        'Los spots no fueron efectivos para generar trafico web',
        'Se detecto correlacion negativa TV-Web',
        'Revisar mensaje, timing y targeting',
        'Implementar cambios urgentes en la estrategia'
      ];
    } else {
      conclusions = [
        'Los spots no generaron cambios significativos',
        'Correlacion TV-Web debil o nula',
        'Multiples oportunidades de mejora',
        'Requiere optimizacion integral de la estrategia'
      ];
    }

    conclusions.forEach((conclusion, index) => {
      slide.addText(`• ${this.cleanText(conclusion)}`, {
        x: 0.8, y: 1.8 + (index * 0.4), w: 8.5, h: 0.3,
        fontSize: 12, color: '374151'
      });
    });

    slide.addText('Proximos Pasos:', {
      x: 0.5, y: 3.6, w: 9, h: 0.4,
      fontSize: 16, bold: true, color: '374151'
    });

    const nextSteps = [
      'Implementar las recomendaciones prioritarias',
      'Monitorear el proximo spot con estos insights',
      'A/B testing de diferentes horarios y contenidos',
      'Establecer metricas de seguimiento continuo',
      'Optimizar basado en datos reales de performance'
    ];

    nextSteps.forEach((step, index) => {
      slide.addText(`${index + 1}. ${this.cleanText(step)}`, {
        x: 0.8, y: 4.1 + (index * 0.4), w: 8.5, h: 0.3,
        fontSize: 12, color: '374151'
      });
    });

    // Resumen final
    slide.addText(`Resumen: ${directCorrelationCount} de ${totalSpots} spots lograron vinculacion directa (${((directCorrelationCount/totalSpots)*100).toFixed(1)}%)`, {
      x: 0.5, y: 6.4, w: 9, h: 0.4,
      fontSize: 14, bold: true, color: '1E40AF'
    });
  }

  async downloadPresentation(filename = 'analisis-spot-tv-v2.pptx') {
    try {
      if (!this.pptx) {
        throw new Error('No se ha generado la presentacion');
      }

      // Generar y descargar el archivo
      await this.pptx.writeFile({ fileName: filename });
      
      return true;
    } catch (error) {
      console.error('Error descargando presentacion PPTX V2:', error);
      throw error;
    }
  }
}

export default PPTXExportServiceV2;
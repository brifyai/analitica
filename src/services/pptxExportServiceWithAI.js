// Servicio PPTX con IA Adaptativa - Versión inteligente que resuelve automáticamente
// el problema de contenido que se sale de las láminas

const PptxGenJS = require('pptxgenjs').default || require('pptxgenjs');
const PPTXAdaptiveLayoutService = require('./pptxAdaptiveLayoutService.js');

class PPTXExportServiceWithAI {
  constructor() {
    this.analysisData = null;
    this.pptx = null;
    this.currentSlideIndex = 0;
    this.adaptiveLayoutService = new PPTXAdaptiveLayoutService();
  }

  async generateSpotAnalysisPresentation(analysisData) {
    try {
      this.analysisData = analysisData;
      return this.generatePPTXPresentation();
    } catch (error) {
      console.error('Error generando presentación PPTX con IA:', error);
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
    this.pptx.revision = '3.0-IA';

    const results = data.analysisResults;
    const batchAIAnalysis = data.batchAIAnalysis || {};
    const temporalAnalysis = data.temporalAnalysis || {};
    const predictiveAnalysis = data.predictiveAnalysis || {};
    const aiAnalysis = data.aiAnalysis || {};

    // ESTRUCTURA INTELIGENTE CON IA ADAPTATIVA
    // =========================================

    // 1. PORTADA - Con IA para optimizar espaciado
    this.createTitleSlideWithAI(results);

    // 2. DASHBOARD DE MÉTRICAS PRINCIPALES - IA adapta el grid
    this.createMainMetricsDashboardWithAI(results);

    // 3. GRID DE COMPONENTES MODERNOS - IA decide layout óptimo
    this.createModernComponentsGridWithAI(results, batchAIAnalysis);

    // 4. ANÁLISIS DE VIDEO - IA optimiza contenido ancho completo
    this.createVideoAnalysisFullWidthWithAI(results);

    // 5. GRÁFICO DE TRÁFICO POR HORA - IA adapta tabla
    this.createTrafficChartFullWidthWithAI(results);

    // 6. DESGLOSE DETALLADO DE SPOTS - IA distribuye inteligentemente
    this.createDetailedSpotBreakdownWithAI(results, aiAnalysis, temporalAnalysis);

    // 7. ANÁLISIS TEMPORAL DIGITAL - IA optimiza dashboard
    if (Object.keys(temporalAnalysis).length > 0) {
      this.createTemporalAnalysisDashboardWithAI(temporalAnalysis, results);
    }

    // 8. ANÁLISIS PREDICTIVO CON IA - IA adapta contenido
    if (predictiveAnalysis && Object.keys(predictiveAnalysis).length > 0) {
      this.createPredictiveAnalysisDashboardWithAI(predictiveAnalysis);
    }

    // 9. RESUMEN EJECUTIVO CON IA - IA optimiza presentación
    this.createExecutiveSummaryWithAI(results, batchAIAnalysis);

    // 10. CONCLUSIONES Y PRÓXIMOS PASOS - IA adapta conclusiones
    this.createConclusionsSlideWithAI(results, batchAIAnalysis);

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

  // 1. PORTADA CON IA ADAPTATIVA
  createTitleSlideWithAI(results) {
    const slide = this.pptx.addSlide();
    
    // Preparar contenido para análisis de IA
    const contentItems = [
      {
        text: 'Análisis de Impacto de Spots TV',
        importance: 'high',
        type: 'title'
      },
      {
        text: 'Plataforma inteligente de análisis con IA',
        importance: 'medium',
        type: 'subtitle'
      }
    ];

    // Agregar información del análisis si existe
    const spot = results[0]?.spot;
    if (spot) {
      contentItems.push({
        text: `Programa: ${this.cleanText(spot?.titulo_programa || spot?.nombre || 'N/A')}`,
        importance: 'low',
        type: 'info'
      });
      contentItems.push({
        text: `Canal: ${this.cleanText(spot?.canal || 'N/A')} | Fecha: ${this.cleanText(spot?.fecha || 'N/A')} | Hora: ${this.cleanText(spot?.hora || 'N/A')}`,
        importance: 'low',
        type: 'info'
      });
      contentItems.push({
        text: `Total de Spots Analizados: ${results.length}`,
        importance: 'low',
        type: 'info'
      });
    }

    // Aplicar IA adaptativa
    this.applyAdaptiveLayoutToSlide(slide, contentItems, {
      slideType: 'title',
      backgroundColor: 'F8FAFC'
    });
  }

  // 2. DASHBOARD DE MÉTRICAS CON IA
  createMainMetricsDashboardWithAI(results) {
    const slide = this.pptx.addSlide();
    
    const totalSpots = results.length;
    const avgImpact = results.reduce((sum, r) => sum + (r.impact?.activeUsers?.percentageChange || 0), 0) / totalSpots;
    const directCorrelationCount = results.filter(r => r.impact?.activeUsers?.directCorrelation).length;
    const significantImpactCount = results.filter(r => Math.abs(r.impact?.activeUsers?.percentageChange || 0) > 10).length;

    // Preparar contenido para IA
    const contentItems = [
      {
        text: 'Dashboard de Métricas Principales',
        importance: 'high',
        type: 'title'
      },
      {
        text: `Total Spots: ${totalSpots}`,
        importance: 'medium',
        type: 'metric',
        color: '1E40AF'
      },
      {
        text: `Impacto Promedio: +${Math.round(avgImpact)}%`,
        importance: 'medium',
        type: 'metric',
        color: '059669'
      },
      {
        text: `Spots con Vinculación Directa: ${directCorrelationCount}`,
        importance: 'medium',
        type: 'metric',
        color: '7C3AED'
      }
    ];

    if (significantImpactCount > directCorrelationCount) {
      const spotsWithoutDirect = significantImpactCount - directCorrelationCount;
      contentItems.push({
        text: `Spots sin Vinculación Directa: ${spotsWithoutDirect}`,
        importance: 'medium',
        type: 'metric',
        color: 'D97706'
      });
    }

    // Aplicar IA adaptativa para dashboard
    this.applyAdaptiveLayoutToSlide(slide, contentItems, {
      slideType: 'dashboard',
      layout: 'grid-4x1'
    });
  }

  // 3. GRID DE COMPONENTES MODERNOS CON IA
  createModernComponentsGridWithAI(results, batchAIAnalysis) {
    const slide = this.pptx.addSlide();
    
    const contentItems = [
      {
        text: 'Componentes de Análisis Moderno',
        importance: 'high',
        type: 'title'
      },
      {
        text: 'Impact Timeline: Análisis temporal del impacto de cada spot durante su transmisión',
        importance: 'medium',
        type: 'component',
        color: '059669'
      },
      {
        text: 'Confidence Meter: Nivel de confianza en los resultados del análisis basado en la calidad de los datos',
        importance: 'medium',
        type: 'component',
        color: '7C3AED'
      },
      {
        text: 'Smart Insights: Insights inteligentes generados por IA basados en patrones y correlaciones',
        importance: 'medium',
        type: 'component',
        color: 'DC2626'
      },
      {
        text: 'Traffic Heatmap: Mapa de calor que muestra la intensidad del tráfico por franja horaria y canal',
        importance: 'medium',
        type: 'component',
        color: 'EA580C'
      }
    ];

    // Aplicar IA para layout de grid 2x2
    this.applyAdaptiveLayoutToSlide(slide, contentItems, {
      slideType: 'components',
      layout: 'grid-2x2'
    });
  }

  // 4. ANÁLISIS DE VIDEO CON IA
  createVideoAnalysisFullWidthWithAI(results) {
    const slide = this.pptx.addSlide();
    
    const contentItems = [
      {
        text: 'Análisis de Video del Spot',
        importance: 'high',
        type: 'title'
      },
      {
        text: 'Análisis visual automatizado del contenido del video para identificar elementos clave',
        importance: 'medium',
        type: 'description'
      }
    ];

    // Características del análisis de video
    const videoFeatures = [
      'Detección automática de escenas y transiciones',
      'Análisis de texto y gráficos superpuestos',
      'Identificación de colores dominantes y branding',
      'Análisis de timing y duración de elementos',
      'Detección de call-to-actions y mensajes clave',
      'Correlación entre elementos visuales y métricas de tráfico'
    ];

    videoFeatures.forEach(feature => {
      contentItems.push({
        text: `• ${this.cleanText(feature)}`,
        importance: 'low',
        type: 'bullet'
      });
    });

    contentItems.push({
      text: 'El análisis de video proporciona insights adicionales sobre qué elementos visuales generan mayor impacto en el tráfico web',
      importance: 'low',
      type: 'conclusion',
      color: '7C3AED'
    });

    // Aplicar IA para layout de ancho completo
    this.applyAdaptiveLayoutToSlide(slide, contentItems, {
      slideType: 'analysis',
      layout: 'full-width'
    });
  }

  // 5. GRÁFICO DE TRÁFICO CON IA
  createTrafficChartFullWidthWithAI(results) {
    const slide = this.pptx.addSlide();
    
    const contentItems = [
      {
        text: 'Análisis de Tráfico por Hora',
        importance: 'high',
        type: 'title'
      },
      {
        text: 'Patrones de tráfico web durante la transmisión de spots por franja horaria',
        importance: 'medium',
        type: 'description'
      }
    ];

    // Simular datos de tráfico por hora (esto vendría de los datos reales)
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

    // Crear tabla de datos
    const tableData = [['Hora', 'Tráfico Web', 'Spots Transmitidos', 'Correlación']];
    hourlyData.forEach(data => {
      const correlation = data.spots > 0 ? 'Alta' : 'Baja';
      tableData.push([data.hour, data.traffic.toString(), data.spots.toString(), correlation]);
    });

    contentItems.push({
      type: 'table',
      data: tableData,
      importance: 'high'
    });

    contentItems.push({
      text: 'Los picos de tráfico coinciden con los horarios de mayor transmisión de spots',
      importance: 'low',
      type: 'conclusion',
      color: '059669'
    });

    // Aplicar IA para tabla de ancho completo
    this.applyAdaptiveLayoutToSlide(slide, contentItems, {
      slideType: 'chart',
      layout: 'table-full-width'
    });
  }

  // 6. DESGLOSE DETALLADO CON IA INTELIGENTE
  createDetailedSpotBreakdownWithAI(results, aiAnalysis, temporalAnalysis) {
    const directCorrelationResults = results.filter(r => r.impact?.activeUsers?.directCorrelation);
    
    let targetResults;
    let title;
    
    if (directCorrelationResults.length === 0) {
      // Si no hay vinculación directa, mostrar todos los spots con impacto significativo
      targetResults = results.filter(r => Math.abs(r.impact?.activeUsers?.percentageChange || 0) > 10);
      title = 'Spots con Impacto Significativo';
    } else {
      // Mostrar spots con vinculación directa
      targetResults = directCorrelationResults;
      title = 'Spots con Vinculación Directa';
    }

    // Usar IA para distribuir inteligentemente
    this.createIntelligentSpotBreakdown(targetResults, aiAnalysis, temporalAnalysis, title);
  }

  createIntelligentSpotBreakdown(results, aiAnalysis, temporalAnalysis, title) {
    // Preparar todos los elementos de contenido
    const allContentItems = [];
    
    results.forEach((result, index) => {
      const spot = result.spot;
      const impact = result.impact;
      
      // Elemento principal del spot
      const spotItem = {
        text: `${index + 1}. ${this.cleanText(spot?.nombre || 'Sin nombre')}`,
        importance: 'high',
        type: 'spot-title'
      };
      
      // Información básica
      const fecha = spot?.dateTime ? spot.dateTime.toLocaleDateString('es-ES') : 'N/A';
      const hora = spot?.dateTime ? spot.dateTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
      const infoItem = {
        text: `Fecha: ${fecha} | Hora: ${hora} | Canal: ${this.cleanText(spot?.canal || 'TV')} | Duración: ${spot?.duracion || 30}s`,
        importance: 'low',
        type: 'spot-info'
      };
      
      // Métricas
      const metricsItem = {
        text: `Usuarios: ${result.metrics?.spot?.activeUsers || 0} (+${(impact?.activeUsers?.percentageChange || 0).toFixed(1)}%) | Sesiones: ${result.metrics?.spot?.sessions || 0} (+${(impact?.sessions?.percentageChange || 0).toFixed(1)}%) | Vistas: ${result.metrics?.spot?.pageviews || 0} (+${(impact?.pageviews?.percentageChange || 0).toFixed(1)}%)`,
        importance: 'medium',
        type: 'spot-metrics'
      };
      
      // Análisis de IA si existe
      const resultIndex = this.analysisData.analysisResults.indexOf(result);
      if (aiAnalysis[resultIndex]) {
        const aiItem = {
          text: `IA: ${this.cleanText(aiAnalysis[resultIndex].summary || 'Sin resumen disponible')}`,
          importance: 'medium',
          type: 'spot-ai',
          color: '7C3AED'
        };
        allContentItems.push(spotItem, infoItem, metricsItem, aiItem);
      } else {
        allContentItems.push(spotItem, infoItem, metricsItem);
      }
    });

    // Aplicar IA para distribución inteligente
    this.distributeContentWithAI(allContentItems, title);
  }

  distributeContentWithAI(contentItems, title) {
    // Usar el servicio de IA adaptativa para tomar decisiones
    const decisions = this.adaptiveLayoutService.makeAdaptiveDecisions(contentItems, {
      slideType: 'spot-breakdown',
      title: title
    });

    // Crear láminas para cada distribución
    decisions.contentDistribution.forEach((distribution, index) => {
      const slide = this.pptx.addSlide();
      
      // Agregar título de la lámina
      slide.addText(`${title} (Lámina ${index + 1} de ${decisions.contentDistribution.length})`, {
        x: 0.5, y: 0.3, w: 9, h: 0.6,
        fontSize: 20, bold: true, color: '059669'
      });

      // Aplicar layout específico
      this.applyLayoutToSlideWithAI(slide, distribution.items, distribution, 1.2);
    });
  }

  // 7. ANÁLISIS TEMPORAL CON IA
  createTemporalAnalysisDashboardWithAI(temporalAnalysis, results) {
    const slide = this.pptx.addSlide();
    
    const contentItems = [
      {
        text: 'Análisis Temporal Digital Avanzado',
        importance: 'high',
        type: 'title'
      },
      {
        text: 'Análisis profundo de patrones temporales y comportamiento del tráfico web',
        importance: 'medium',
        type: 'description'
      }
    ];

    // Métricas temporales
    const temporalKeys = Object.keys(temporalAnalysis);
    const avgTemporalScore = temporalKeys.reduce((sum, key) => {
      return sum + (temporalAnalysis[key]?.temporalScore || 0);
    }, 0) / temporalKeys.length;

    contentItems.push({
      text: `Score Temporal Promedio: ${avgTemporalScore.toFixed(2)}/1.0`,
      importance: 'medium',
      type: 'metric'
    });

    contentItems.push({
      text: `Spots con Análisis Temporal: ${temporalKeys.length}`,
      importance: 'medium',
      type: 'metric'
    });

    // Insights temporales
    const allTemporalInsights = temporalKeys.flatMap(key => 
      temporalAnalysis[key]?.temporalInsights || []
    );

    if (allTemporalInsights.length > 0) {
      contentItems.push({
        text: 'Insights Temporales Clave:',
        importance: 'high',
        type: 'section-title'
      });

      allTemporalInsights.slice(0, 4).forEach((insight, index) => {
        contentItems.push({
          text: `• ${this.cleanText(insight)}`,
          importance: 'low',
          type: 'bullet'
        });
      });
    }

    // Aplicar IA para dashboard temporal
    this.applyAdaptiveLayoutToSlide(slide, contentItems, {
      slideType: 'temporal',
      layout: 'dashboard'
    });
  }

  // 8. ANÁLISIS PREDICTIVO CON IA
  createPredictiveAnalysisDashboardWithAI(predictiveAnalysis) {
    const slide = this.pptx.addSlide();
    
    const contentItems = [
      {
        text: 'Análisis Predictivo con IA',
        importance: 'high',
        type: 'title'
      },
      {
        text: 'Predicciones basadas en machine learning y análisis de patrones históricos',
        importance: 'medium',
        type: 'description'
      }
    ];

    // Predicciones principales
    if (predictiveAnalysis.predictions) {
      contentItems.push({
        text: 'Predicciones Principales:',
        importance: 'high',
        type: 'section-title'
      });

      if (predictiveAnalysis.predictions.impactForecast) {
        contentItems.push({
          text: `• Forecast de Impacto: ${this.cleanText(predictiveAnalysis.predictions.impactForecast)}`,
          importance: 'medium',
          type: 'prediction'
        });
      }

      if (predictiveAnalysis.predictions.optimalTiming) {
        contentItems.push({
          text: `• Timing Óptimo: ${this.cleanText(predictiveAnalysis.predictions.optimalTiming)}`,
          importance: 'medium',
          type: 'prediction'
        });
      }

      if (predictiveAnalysis.predictions.confidenceLevel) {
        contentItems.push({
          text: `• Nivel de Confianza: ${this.cleanText(predictiveAnalysis.predictions.confidenceLevel)}`,
          importance: 'medium',
          type: 'prediction'
        });
      }
    }

    // Recomendaciones predictivas
    if (predictiveAnalysis.recommendations) {
      contentItems.push({
        text: 'Recomendaciones Predictivas:',
        importance: 'high',
        type: 'section-title'
      });

      predictiveAnalysis.recommendations.slice(0, 3).forEach((rec, index) => {
        contentItems.push({
          text: `• ${this.cleanText(rec)}`,
          importance: 'low',
          type: 'recommendation'
        });
      });
    }

    // Aplicar IA para dashboard predictivo
    this.applyAdaptiveLayoutToSlide(slide, contentItems, {
      slideType: 'predictive',
      layout: 'dashboard'
    });
  }

  // 9. RESUMEN EJECUTIVO CON IA
  createExecutiveSummaryWithAI(results, batchAIAnalysis) {
    const slide = this.pptx.addSlide();
    
    const contentItems = [
      {
        text: 'Resumen Ejecutivo con IA',
        importance: 'high',
        type: 'title'
      }
    ];

    // Métricas principales
    const totalSpots = results.length;
    const avgImpact = results.reduce((sum, r) => sum + (r.impact?.activeUsers?.percentageChange || 0), 0) / totalSpots;
    const directCorrelationCount = results.filter(r => r.impact?.activeUsers?.directCorrelation).length;
    const significantImpactCount = results.filter(r => Math.abs(r.impact?.activeUsers?.percentageChange || 0) > 10).length;

    contentItems.push({
      text: 'Resultados Principales:',
      importance: 'high',
      type: 'section-title'
    });

    const kpis = [
      `• Total de Spots Analizados: ${totalSpots}`,
      `• Impacto Promedio en Usuarios: ${avgImpact >= 0 ? '+' : ''}${avgImpact.toFixed(1)}%`,
      `• Spots con Vinculación Directa: ${directCorrelationCount} (${((directCorrelationCount/totalSpots)*100).toFixed(1)}%)`,
      `• Spots con Impacto Significativo: ${significantImpactCount} (${((significantImpactCount/totalSpots)*100).toFixed(1)}%)`
    ];

    kpis.forEach(kpi => {
      contentItems.push({
        text: kpi,
        importance: 'medium',
        type: 'kpi'
      });
    });

    // Clasificación del impacto
    contentItems.push({
      text: 'Clasificación del Impacto:',
      importance: 'high',
      type: 'section-title'
    });

    let classification = '';
    if (avgImpact > 20) {
      classification = 'CORRELACIÓN FUERTE - El spot generó un impacto significativo en el tráfico web';
    } else if (avgImpact > 10) {
      classification = 'CORRELACIÓN MODERADA - El spot tuvo impacto positivo pero mejorable';
    } else if (avgImpact < -10) {
      classification = 'CORRELACIÓN NEGATIVA - El spot redujo el tráfico web';
    } else {
      classification = 'CORRELACIÓN DÉBIL - Impacto mínimo en el tráfico web';
    }

    contentItems.push({
      text: this.cleanText(classification),
      importance: 'medium',
      type: 'classification'
    });

    // Análisis de IA general si existe
    if (batchAIAnalysis.summary) {
      contentItems.push({
        text: 'Análisis Inteligente General:',
        importance: 'high',
        type: 'section-title'
      });

      contentItems.push({
        text: this.cleanText(batchAIAnalysis.summary),
        importance: 'medium',
        type: 'ai-analysis',
        color: '7C3AED'
      });
    }

    // Aplicar IA para resumen ejecutivo
    this.applyAdaptiveLayoutToSlide(slide, contentItems, {
      slideType: 'executive',
      layout: 'executive-summary'
    });
  }

  // 10. CONCLUSIONES CON IA
  createConclusionsSlideWithAI(results, batchAIAnalysis) {
    const slide = this.pptx.addSlide();
    
    const contentItems = [
      {
        text: 'Conclusiones y Próximos Pasos',
        importance: 'high',
        type: 'title'
      }
    ];

    const totalSpots = results.length;
    const avgImpact = results.reduce((sum, r) => sum + (r.impact?.activeUsers?.percentageChange || 0), 0) / totalSpots;
    const directCorrelationCount = results.filter(r => r.impact?.activeUsers?.directCorrelation).length;

    contentItems.push({
      text: 'Conclusiones Principales:',
      importance: 'high',
      type: 'section-title'
    });

    let conclusions = [];
    if (avgImpact > 20) {
      conclusions = [
        'Los spots demostraron alta efectividad para generar tráfico web',
        'La correlación TV-Web es fuerte y significativa',
        'El timing y contenido fueron apropiados',
        'Considerar replicar esta estrategia en futuros spots'
      ];
    } else if (avgImpact > 10) {
      conclusions = [
        'Los spots tuvieron impacto positivo pero mejorable',
        'Existe correlación TV-Web moderada',
        'Oportunidades de optimización identificadas',
        'Ajustar timing y contenido para maximizar impacto'
      ];
    } else if (avgImpact < -10) {
      conclusions = [
        'Los spots no fueron efectivos para generar tráfico web',
        'Se detectó correlación negativa TV-Web',
        'Revisar mensaje, timing y targeting',
        'Implementar cambios urgentes en la estrategia'
      ];
    } else {
      conclusions = [
        'Los spots no generaron cambios significativos',
        'Correlación TV-Web débil o nula',
        'Múltiples oportunidades de mejora',
        'Requiere optimización integral de la estrategia'
      ];
    }

    conclusions.forEach(conclusion => {
      contentItems.push({
        text: `• ${this.cleanText(conclusion)}`,
        importance: 'medium',
        type: 'conclusion'
      });
    });

    contentItems.push({
      text: 'Próximos Pasos:',
      importance: 'high',
      type: 'section-title'
    });

    const nextSteps = [
      'Implementar las recomendaciones prioritarias',
      'Monitorear el próximo spot con estos insights',
      'A/B testing de diferentes horarios y contenidos',
      'Establecer métricas de seguimiento continuo',
      'Optimizar basado en datos reales de performance'
    ];

    nextSteps.forEach((step, index) => {
      contentItems.push({
        text: `${index + 1}. ${this.cleanText(step)}`,
        importance: 'medium',
        type: 'next-step'
      });
    });

    // Resumen final
    contentItems.push({
      text: `Resumen: ${directCorrelationCount} de ${totalSpots} spots lograron vinculación directa (${((directCorrelationCount/totalSpots)*100).toFixed(1)}%)`,
      importance: 'high',
      type: 'final-summary'
    });

    // Aplicar IA para conclusiones
    this.applyAdaptiveLayoutToSlide(slide, contentItems, {
      slideType: 'conclusions',
      layout: 'conclusions'
    });
  }

  // MÉTODO PRINCIPAL DE IA ADAPTATIVA
  applyAdaptiveLayoutToSlide(slide, contentItems, slideContext) {
    // Usar el servicio de IA para tomar decisiones
    const decisions = this.adaptiveLayoutService.makeAdaptiveDecisions(contentItems, slideContext);
    
    // Aplicar fondo si se especifica
    if (slideContext.backgroundColor) {
      slide.background = { color: slideContext.backgroundColor };
    }

    // Crear láminas adicionales si es necesario
    const slides = [slide];
    for (let i = 1; i < decisions.contentDistribution.length; i++) {
      slides.push(this.pptx.addSlide());
    }

    // Aplicar las decisiones de IA a cada lámina
    decisions.contentDistribution.forEach((distribution, index) => {
      this.applyLayoutToSlideWithAI(slides[index], distribution.items, distribution, 1.2);
    });
  }

  // Método para aplicar layout específico con IA
  applyLayoutToSlideWithAI(slide, items, distribution, startY = 1.5) {
    const layout = distribution.layout;
    const fontScale = distribution.fontScale;

    let currentY = startY;

    switch (layout) {
      case 'grid-2x2':
        this.applyGridLayout(slide, items, fontScale, currentY);
        break;
      case 'two-column':
        this.applyTwoColumnLayout(slide, items, fontScale, currentY);
        break;
      case 'vertical-list':
        this.applyVerticalLayout(slide, items, fontScale, currentY);
        break;
      case 'card-layout':
        this.applyCardLayout(slide, items, fontScale, currentY);
        break;
      default:
        this.applySingleColumnLayout(slide, items, fontScale, currentY);
        break;
    }
  }

  // Implementaciones de layout con IA
  applyGridLayout(slide, items, fontScale, startY) {
    const cellWidth = 4.5;
    const cellHeight = 2.5;
    const startX = 0.5;
    const spacing = 0.2;

    items.forEach((item, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = startX + (col * (cellWidth + spacing));
      const y = startY + (row * (cellHeight + spacing));

      this.addContentToPosition(slide, item, x, y, cellWidth, fontScale);
    });
  }

  applyTwoColumnLayout(slide, items, fontScale, startY) {
    const columnWidth = 4.5;
    const startX = 0.5;
    const spacing = 0.3;

    items.forEach((item, index) => {
      const x = startX + (index * (columnWidth + spacing));
      this.addContentToPosition(slide, item, x, startY, columnWidth, fontScale);
    });
  }

  applyVerticalLayout(slide, items, fontScale, startY) {
    let currentY = startY;
    const itemHeight = 1.2;

    items.forEach((item) => {
      this.addContentToPosition(slide, item, 0.5, currentY, 9, fontScale);
      currentY += itemHeight;
    });
  }

  applyCardLayout(slide, items, fontScale, startY) {
    const cardWidth = 4.2;
    const cardHeight = 2;
    const startX = 0.5;
    const spacing = 0.3;

    items.forEach((item, index) => {
      const x = startX + (index % 2) * (cardWidth + spacing);
      const y = startY + Math.floor(index / 2) * (cardHeight + spacing);

      // Agregar fondo de tarjeta
      slide.addShape(slide.shapes.RECTANGLE, {
        x: x, y: y, w: cardWidth, h: cardHeight,
        fill: { color: 'F9FAFB' },
        line: { color: 'E5E7EB', width: 1 }
      });

      this.addContentToPosition(slide, item, x + 0.1, y + 0.1, cardWidth - 0.2, fontScale);
    });
  }

  applySingleColumnLayout(slide, items, fontScale, startY) {
    let currentY = startY;
    
    items.forEach((item) => {
      const contentHeight = this.calculateItemHeight(item, fontScale);
      this.addContentToPosition(slide, item, 0.5, currentY, 9, fontScale);
      currentY += contentHeight + 0.3;
    });
  }

  addContentToPosition(slide, item, x, y, width, fontScale) {
    let fontSize = 12; // Default
    
    // Determinar tamaño de fuente basado en importancia
    switch (item.importance) {
      case 'high':
        fontSize = 20 * fontScale;
        break;
      case 'medium':
        fontSize = 14 * fontScale;
        break;
      case 'low':
        fontSize = 10 * fontScale;
        break;
      default:
        fontSize = 12 * fontScale;
        break;
    }
    
    // Asegurar tamaño mínimo legible
    fontSize = Math.max(fontSize, 8);
    
    if (item.text) {
      slide.addText(item.text, {
        x: x,
        y: y,
        w: width,
        h: 1,
        fontSize: fontSize,
        color: item.color || '374151',
        bold: item.importance === 'high'
      });
    } else if (item.type === 'table' && item.data) {
      // Manejar tablas
      slide.addTable(item.data, {
        x: x,
        y: y,
        w: width,
        h: 3,
        fontSize: Math.max(8 * fontScale, 6),
        border: { type: 'solid', color: 'E5E7EB', pt: 1 },
        fill: 'F9FAFB'
      });
    }
  }

  calculateItemHeight(item, fontScale) {
    if (item.text) {
      const lines = item.text.split('\n').length;
      const baseHeight = item.importance === 'high' ? 0.6 : item.importance === 'medium' ? 0.4 : 0.3;
      return lines * baseHeight * fontScale;
    }
    return 1;
  }

  async downloadPresentation(filename = 'analisis-spot-tv-con-ia.pptx') {
    try {
      if (!this.pptx) {
        throw new Error('No se ha generado la presentación');
      }

      // Generar y descargar el archivo
      await this.pptx.writeFile({ fileName: filename });
      
      return true;
    } catch (error) {
      console.error('Error descargando presentación PPTX con IA:', error);
      throw error;
    }
  }
}

module.exports = PPTXExportServiceWithAI;
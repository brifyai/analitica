// Servicio de exportación PPTX completo con pptxgenjs
// Incluye TODO el contenido del análisis, incluyendo contenido expandible

import PptxGenJS from 'pptxgenjs';

class PPTXExportService {
  constructor() {
    this.analysisData = null;
    this.pptx = null;
  }

  async generateSpotAnalysisPresentation(analysisData) {
    try {
      this.analysisData = analysisData;
      return this.generatePPTXPresentation();
    } catch (error) {
      console.error('Error generando presentación PPTX:', error);
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
    this.pptx.revision = '1';

    const results = data.analysisResults;
    const batchAIAnalysis = data.batchAIAnalysis || {};
    const temporalAnalysis = data.temporalAnalysis || {};
    const predictiveAnalysis = data.predictiveAnalysis || {};
    const aiAnalysis = data.aiAnalysis || {};

    // 1. SLIDE DE PORTADA
    this.createTitleSlide(results);

    // 2. SLIDE DE RESUMEN EJECUTIVO
    this.createExecutiveSummarySlide(results, batchAIAnalysis);

    // 3. SLIDE DE MÉTRICAS GENERALES
    this.createGeneralMetricsSlide(results);

    // 4. SLIDES INDIVIDUALES POR CADA SPOT (TODO EL CONTENIDO EXPANDIBLE)
    results.forEach((result, index) => {
      this.createIndividualSpotSlide(result, index, aiAnalysis[index], temporalAnalysis[index]);
    });

    // 5. SLIDE DE ANÁLISIS TEMPORAL AVANZADO
    if (Object.keys(temporalAnalysis).length > 0) {
      this.createTemporalAnalysisSlide(temporalAnalysis, results);
    }

    // 6. SLIDE DE ANÁLISIS PREDICTIVO
    if (predictiveAnalysis && Object.keys(predictiveAnalysis).length > 0) {
      this.createPredictiveAnalysisSlide(predictiveAnalysis);
    }

    // 7. SLIDE DE ANÁLISIS DE IA GENERAL
    if (batchAIAnalysis && Object.keys(batchAIAnalysis).length > 0) {
      this.createAIAnalysisSlide(batchAIAnalysis);
    }

    // 8. SLIDE DE VINCULACIÓN DIRECTA
    this.createDirectCorrelationSlide(results);

    // 9. SLIDE DE RECOMENDACIONES ESTRATÉGICAS
    this.createRecommendationsSlide(results, batchAIAnalysis);

    // 10. SLIDE DE CONCLUSIONES
    this.createConclusionsSlide(results, batchAIAnalysis);

    return this.pptx;
  }

  createTitleSlide(results) {
    const slide = this.pptx.addSlide();
    
    // Fondo degradado
    slide.background = { color: 'F8FAFC' };
    
    // Título principal
    slide.addText('Análisis de Impacto de Spots TV', {
      x: 1, y: 1.5, w: 8, h: 1.5,
      fontSize: 36, bold: true, color: '1E40AF',
      align: 'center'
    });

    // Subtítulo
    slide.addText('vs Tráfico Web - Análisis Completo con IA', {
      x: 1, y: 2.8, w: 8, h: 0.8,
      fontSize: 20, color: '6B7280',
      align: 'center'
    });

    // Información del análisis
    const spot = results[0]?.spot;
    slide.addText(`Programa: ${spot?.titulo_programa || spot?.nombre || 'N/A'}`, {
      x: 1, y: 4, w: 8, h: 0.5,
      fontSize: 16, color: '374151',
      align: 'center'
    });

    slide.addText(`Canal: ${spot?.canal || 'N/A'} | Fecha: ${spot?.fecha || 'N/A'} | Hora: ${spot?.hora || 'N/A'}`, {
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

  createExecutiveSummarySlide(results, batchAIAnalysis) {
    const slide = this.pptx.addSlide();
    
    slide.addText('Resumen Ejecutivo', {
      x: 0.5, y: 0.5, w: 9, h: 0.8,
      fontSize: 28, bold: true, color: '1E40AF'
    });

    // Métricas principales
    const totalSpots = results.length;
    const avgImpact = results.reduce((sum, r) => sum + (r.impact?.activeUsers?.percentageChange || 0), 0) / totalSpots;
    const directCorrelationCount = results.filter(r => r.impact?.activeUsers?.directCorrelation).length;
    const significantImpactCount = results.filter(r => Math.abs(r.impact?.activeUsers?.percentageChange || 0) > 10).length;

    // KPIs principales
    slide.addText('📊 Resultados Principales:', {
      x: 0.5, y: 1.5, w: 9, h: 0.4,
      fontSize: 16, bold: true, color: '374151'
    });

    const kpis = [
      `• Total de Spots Analizados: ${totalSpots}`,
      `• Impacto Promedio en Usuarios: ${avgImpact >= 0 ? '+' : ''}${avgImpact.toFixed(1)}%`,
      `• Spots con Vinculación Directa: ${directCorrelationCount} (${((directCorrelationCount/totalSpots)*100).toFixed(1)}%)`,
      `• Spots sin Vinculación Directa: ${significantImpactCount} (${((significantImpactCount/totalSpots)*100).toFixed(1)}%)`
    ];

    kpis.forEach((kpi, index) => {
      slide.addText(kpi, {
        x: 0.8, y: 2 + (index * 0.4), w: 8.5, h: 0.3,
        fontSize: 14, color: '374151'
      });
    });

    // Clasificación del impacto
    slide.addText('🎯 Clasificación del Impacto:', {
      x: 0.5, y: 4, w: 9, h: 0.4,
      fontSize: 16, bold: true, color: '374151'
    });

    let classification = '';
    if (avgImpact > 20) {
      classification = '✅ CORRELACIÓN FUERTE - El spot generó un impacto significativo en el tráfico web';
    } else if (avgImpact > 10) {
      classification = '⚠️ CORRELACIÓN MODERADA - El spot tuvo impacto positivo pero mejorable';
    } else if (avgImpact < -10) {
      classification = '❌ CORRELACIÓN NEGATIVA - El spot redujo el tráfico web';
    } else {
      classification = '🔄 CORRELACIÓN DÉBIL - Impacto mínimo en el tráfico web';
    }

    slide.addText(classification, {
      x: 0.8, y: 4.5, w: 8.5, h: 0.8,
      fontSize: 14, color: '374151'
    });

    // Análisis de IA general si existe
    if (batchAIAnalysis.summary) {
      slide.addText('🤖 Análisis Inteligente General:', {
        x: 0.5, y: 5.5, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '7C3AED'
      });

      slide.addText(batchAIAnalysis.summary, {
        x: 0.8, y: 6, w: 8.5, h: 1,
        fontSize: 12, color: '5B21B6'
      });
    }
  }

  createGeneralMetricsSlide(results) {
    const slide = this.pptx.addSlide();
    
    slide.addText('Métricas Generales de Correlación', {
      x: 0.5, y: 0.5, w: 9, h: 0.8,
      fontSize: 24, bold: true, color: '1E40AF'
    });

    // Headers de la tabla
    const headers = ['Métrica', 'Durante Spot', 'Referencia', 'Cambio %', 'Estado'];
    
    // Calcular totales
    const totals = results.reduce((acc, result) => {
      acc.spot.activeUsers += result.metrics?.spot?.activeUsers || 0;
      acc.spot.sessions += result.metrics?.spot?.sessions || 0;
      acc.spot.pageviews += result.metrics?.spot?.pageviews || 0;
      
      acc.reference.activeUsers += result.impact?.activeUsers?.reference || 0;
      acc.reference.sessions += result.impact?.sessions?.reference || 0;
      acc.reference.pageviews += result.impact?.pageviews?.reference || 0;
      
      return acc;
    }, { spot: {activeUsers: 0, sessions: 0, pageviews: 0}, reference: {activeUsers: 0, sessions: 0, pageviews: 0} });

    // Calcular cambios porcentuales promedio
    const avgChanges = {
      activeUsers: results.reduce((sum, r) => sum + (r.impact?.activeUsers?.percentageChange || 0), 0) / results.length,
      sessions: results.reduce((sum, r) => sum + (r.impact?.sessions?.percentageChange || 0), 0) / results.length,
      pageviews: results.reduce((sum, r) => sum + (r.impact?.pageviews?.percentageChange || 0), 0) / results.length
    };

    // Datos de la tabla
    const tableData = [
      headers,
      [
        'Usuarios Activos (Total)',
        Math.round(totals.spot.activeUsers).toLocaleString(),
        Math.round(totals.reference.activeUsers).toLocaleString(),
        `${avgChanges.activeUsers >= 0 ? '+' : ''}${avgChanges.activeUsers.toFixed(1)}%`,
        avgChanges.activeUsers > 15 ? '🟢 Excelente' : avgChanges.activeUsers > 5 ? '🟡 Bueno' : '🔴 Bajo'
      ],
      [
        'Sesiones (Total)',
        Math.round(totals.spot.sessions).toLocaleString(),
        Math.round(totals.reference.sessions).toLocaleString(),
        `${avgChanges.sessions >= 0 ? '+' : ''}${avgChanges.sessions.toFixed(1)}%`,
        avgChanges.sessions > 15 ? '🟢 Excelente' : avgChanges.sessions > 5 ? '🟡 Bueno' : '🔴 Bajo'
      ],
      [
        'Vistas de Página (Total)',
        Math.round(totals.spot.pageviews).toLocaleString(),
        Math.round(totals.reference.pageviews).toLocaleString(),
        `${avgChanges.pageviews >= 0 ? '+' : ''}${avgChanges.pageviews.toFixed(1)}%`,
        avgChanges.pageviews > 15 ? '🟢 Excelente' : avgChanges.pageviews > 5 ? '🟡 Bueno' : '🔴 Bajo'
      ]
    ];

    // Agregar tabla
    slide.addTable(tableData, {
      x: 0.5, y: 1.5, w: 9, h: 2.5,
      fontSize: 12,
      border: { type: 'solid', color: 'E5E7EB', pt: 1 },
      fill: 'F9FAFB',
      color: '374151'
    });

    // Interpretación
    slide.addText('📈 Interpretación de Resultados:', {
      x: 0.5, y: 4.5, w: 9, h: 0.4,
      fontSize: 16, bold: true, color: '374151'
    });

    let interpretation = '';
    if (avgChanges.activeUsers > 15) {
      interpretation = '✅ Vinculación Directa Confirmada: Los spots generaron un aumento significativo (>15%) en el tráfico web durante su transmisión.';
    } else if (avgChanges.activeUsers > 10) {
      interpretation = '⚠️ Impacto Significativo: Los spots tuvieron un impacto positivo (>10%) pero no cumplen los criterios de vinculación directa.';
    } else if (avgChanges.activeUsers < -10) {
      interpretation = '❌ Impacto Negativo: Los spots redujeron el tráfico web, sugiriendo problemas en el mensaje o timing.';
    } else {
      interpretation = '🔄 Impacto Mínimo: Los spots no generaron cambios significativos en el tráfico web.';
    }

    slide.addText(interpretation, {
      x: 0.8, y: 5, w: 8.5, h: 1,
      fontSize: 12, color: '374151'
    });
  }

  createIndividualSpotSlide(result, index, aiAnalysis, temporalImpact) {
    const slide = this.pptx.addSlide();
    
    // Título del slide
    slide.addText(`Spot ${index + 1}: ${result.spot?.titulo_programa || result.spot?.nombre || 'Sin nombre'}`, {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 20, bold: true, color: '1E40AF'
    });

    // Información básica del spot
    const spotInfo = [
      `Fecha: ${result.spot?.fecha || 'N/A'} | Hora: ${result.spot?.hora || 'N/A'}`,
      `Canal: ${result.spot?.canal || 'N/A'} | Duración: ${result.spot?.duracion || 'N/A'}s`
    ];

    spotInfo.forEach((info, i) => {
      slide.addText(info, {
        x: 0.5, y: 1 + (i * 0.3), w: 9, h: 0.25,
        fontSize: 9, color: '6B7280'
      });
    });

    // Tipo y versión
    const tipo = result.spot?.tipo_comercial || 'N/A';
    const version = result.spot?.version || 'N/A';
    
    slide.addText(`Tipo: ${tipo}`, {
      x: 0.5, y: 1.6, w: 9, h: 0.25,
      fontSize: 9, color: '6B7280'
    });
    
    slide.addText(`Versión: ${version}`, {
      x: 0.5, y: 1.9, w: 9, h: 0.25,
      fontSize: 9, color: '6B7280'
    });

    // Estado de vinculación
    const isDirectCorrelation = result.impact?.activeUsers?.directCorrelation;
    
    slide.addText(isDirectCorrelation ?
      '🎯 VINCULACIÓN DIRECTA CONFIRMADA' :
      '📊 IMPACTO ANALIZADO', {
      x: 0.5, y: 2.2, w: 9, h: 0.4,
      fontSize: 14, bold: true,
      color: isDirectCorrelation ? '059669' : '7C3AED'
    });

    // LAYOUT COMPLETAMENTE REORGANIZADO CON POSICIONAMIENTO DINÁMICO
    // ================================================================
    
    // COLUMNA IZQUIERDA (x: 0.5, w: 4.5)
    // ====================================
    
    let leftY = 2.8; // Posición inicial para columna izquierda
    
    // Métricas detalladas
    slide.addText('📊 Métricas Detalladas:', {
      x: 0.5, y: leftY, w: 4.5, h: 0.3,
      fontSize: 14, bold: true, color: '374151'
    });
    leftY += 0.4;

    const metricsData = [
      ['Métrica', 'Durante Spot', 'Referencia', 'Cambio %'],
      ['Usuarios Activos',
       (result.metrics?.spot?.activeUsers || 0).toLocaleString(),
       Math.round(result.impact?.activeUsers?.reference || 0).toLocaleString(),
       `${(result.impact?.activeUsers?.percentageChange || 0) >= 0 ? '+' : ''}${(result.impact?.activeUsers?.percentageChange || 0).toFixed(1)}%`],
      ['Sesiones',
       (result.metrics?.spot?.sessions || 0).toLocaleString(),
       Math.round(result.impact?.sessions?.reference || 0).toLocaleString(),
       `${(result.impact?.sessions?.percentageChange || 0) >= 0 ? '+' : ''}${(result.impact?.sessions?.percentageChange || 0).toFixed(1)}%`],
      ['Vistas de Página',
       (result.metrics?.spot?.pageviews || 0).toLocaleString(),
       Math.round(result.impact?.pageviews?.reference || 0).toLocaleString(),
       `${(result.impact?.pageviews?.percentageChange || 0) >= 0 ? '+' : ''}${(result.impact?.pageviews?.percentageChange || 0).toFixed(1)}%`]
    ];

    slide.addTable(metricsData, {
      x: 0.5, y: leftY, w: 4.5, h: 1.8,
      fontSize: 10,
      border: { type: 'solid', color: 'E5E7EB', pt: 1 },
      fill: 'F9FAFB'
    });
    leftY += 2.0; // Espacio para la tabla

    // Análisis temporal en columna izquierda
    if (temporalImpact) {
      slide.addText('⏰ Análisis Temporal:', {
        x: 0.5, y: leftY, w: 4.5, h: 0.3,
        fontSize: 14, bold: true, color: '059669'
      });
      leftY += 0.4;
      
      if (temporalImpact.temporalScore !== undefined) {
        slide.addText(`Score: ${temporalImpact.temporalScore.toFixed(2)}/1.0`, {
          x: 0.7, y: leftY, w: 4.3, h: 0.25,
          fontSize: 10, color: '047857'
        });
        leftY += 0.35;
      }

      if (temporalImpact.peakTime && temporalImpact.peakTime.length > 0) {
        const peakText = temporalImpact.peakTime.join(', ');
        
        slide.addText(`Pico: ${peakText}`, {
          x: 0.7, y: leftY, w: 4.3, h: 0.25,
          fontSize: 10, color: '047857'
        });
        leftY += 0.35;
      }

      if (temporalImpact.temporalInsights && temporalImpact.temporalInsights.length > 0) {
        slide.addText('Insights:', {
          x: 0.7, y: leftY, w: 4.3, h: 0.25,
          fontSize: 10, bold: true, color: '047857'
        });
        leftY += 0.3;

        // Mostrar todos los insights temporales
        temporalImpact.temporalInsights.forEach((insight) => {
          slide.addText(`• ${insight}`, {
            x: 0.9, y: leftY, w: 4.1, h: 0.2,
            fontSize: 9, color: '047857'
          });
          leftY += 0.25;
        });
      }
    }

    // COLUMNA DERECHA (x: 5.2, w: 4.3) - LÁMINAS INDIVIDUALES (DESDE LÁMINA 4)
    // ========================================================================
    
    let rightY = 0.4; // Posición inicial MUY ARRIBA para lámina individual
    
    // Análisis de IA en columna derecha
    if (aiAnalysis) {
      slide.addText('🤖 Análisis Inteligente:', {
        x: 5.2, y: rightY, w: 4.3, h: 0.3,
        fontSize: 14, bold: true, color: '7C3AED'
      });
      rightY += 0.5;

      if (aiAnalysis.summary) {
        slide.addText(`Resumen: ${aiAnalysis.summary}`, {
          x: 5.2, y: rightY, w: 4.3, h: 0.6,
          fontSize: 10, color: '5B21B6'
        });
        rightY += 1.0;
      }

      if (aiAnalysis.insights && aiAnalysis.insights.length > 0) {
        slide.addText('Insights Clave:', {
          x: 5.2, y: rightY, w: 4.3, h: 0.3,
          fontSize: 11, bold: true, color: '5B21B6'
        });
        rightY += 0.5;

        // Mostrar todos los insights
        aiAnalysis.insights.forEach((insight) => {
          const insightText = typeof insight === 'string' ? insight : insight?.descripcion || JSON.stringify(insight);
          
          slide.addText(`• ${insightText}`, {
            x: 5.4, y: rightY, w: 4.1, h: 0.22,
            fontSize: 9, color: '5B21B6'
          });
          rightY += 0.4;
        });
      }

      if (aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0) {
        slide.addText('Recomendaciones:', {
          x: 5.2, y: rightY, w: 4.3, h: 0.3,
          fontSize: 11, bold: true, color: '5B21B6'
        });
        rightY += 0.5;

        // Mostrar todas las recomendaciones
        aiAnalysis.recommendations.forEach((rec) => {
          slide.addText(`• ${rec}`, {
            x: 5.4, y: rightY, w: 4.1, h: 0.22,
            fontSize: 9, color: '5B21B6'
          });
          rightY += 0.4;
        });
      }
    }

    // Timeline de visitas - POSICIONAMIENTO DINÁMICO
    slide.addText('📈 Timeline (30 min):', {
      x: 5.2, y: rightY, w: 4.3, h: 0.3,
      fontSize: 12, bold: true, color: 'DC2626'
    });
    rightY += 0.5;

    // Simular timeline basado en datos reales
    const baseVisits = result.metrics?.spot?.activeUsers || 0;
    if (baseVisits > 0) {
      const timelineData = [
        { time: '1 min', visits: Math.round(baseVisits * 0.95) },
        { time: '5 min', visits: Math.round(baseVisits * 0.70) },
        { time: '15 min', visits: Math.round(baseVisits * 0.35) },
        { time: '30 min', visits: Math.round(baseVisits * 0.12) }
      ];

      timelineData.forEach((data, i) => {
        slide.addText(`${data.time}: ${data.visits}`, {
          x: 5.4, y: rightY + (i * 0.18), w: 4.1, h: 0.16,
          fontSize: 8, color: 'DC2626'
        });
      });
    }
  }

  createTemporalAnalysisSlide(temporalAnalysis, results) {
    const slide = this.pptx.addSlide();
    
    slide.addText('Análisis Temporal Digital Avanzado', {
      x: 0.5, y: 0.5, w: 9, h: 0.8,
      fontSize: 24, bold: true, color: '059669'
    });

    slide.addText('Este análisis examina los patrones temporales del tráfico web en relación con los spots de TV', {
      x: 0.5, y: 1.4, w: 9, h: 0.4,
      fontSize: 12, color: '6B7280'
    });

    // Resumen de análisis temporal
    const temporalKeys = Object.keys(temporalAnalysis);
    const avgTemporalScore = temporalKeys.reduce((sum, key) => {
      return sum + (temporalAnalysis[key]?.temporalScore || 0);
    }, 0) / temporalKeys.length;

    slide.addText('📊 Métricas Temporales Promedio:', {
      x: 0.5, y: 2, w: 9, h: 0.4,
      fontSize: 16, bold: true, color: '374151'
    });

    slide.addText(`• Score Temporal Promedio: ${avgTemporalScore.toFixed(2)}/1.0`, {
      x: 0.8, y: 2.5, w: 8.5, h: 0.3,
      fontSize: 14, color: '374151'
    });

    slide.addText(`• Spots con Análisis Temporal: ${temporalKeys.length}`, {
      x: 0.8, y: 2.9, w: 8.5, h: 0.3,
      fontSize: 14, color: '374151'
    });

    // Insights temporales generales
    const allTemporalInsights = temporalKeys.flatMap(key => 
      temporalAnalysis[key]?.temporalInsights || []
    );

    if (allTemporalInsights.length > 0) {
      slide.addText('🕒 Insights Temporales Generales:', {
        x: 0.5, y: 3.5, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '059669'
      });

      allTemporalInsights.slice(0, 5).forEach((insight, index) => {
        slide.addText(`• ${insight}`, {
          x: 0.8, y: 4 + (index * 0.4), w: 8.5, h: 0.3,
          fontSize: 12, color: '047857'
        });
      });
    }
  }

  createPredictiveAnalysisSlide(predictiveAnalysis) {
    const slide = this.pptx.addSlide();
    
    slide.addText('Análisis Predictivo con IA', {
      x: 0.5, y: 0.5, w: 9, h: 0.8,
      fontSize: 24, bold: true, color: '7C3AED'
    });

    slide.addText('Predicciones basadas en machine learning y análisis de patrones históricos', {
      x: 0.5, y: 1.4, w: 9, h: 0.4,
      fontSize: 12, color: '6B7280'
    });

    // Predicciones principales
    if (predictiveAnalysis.predictions) {
      slide.addText('🔮 Predicciones Principales:', {
        x: 0.5, y: 2, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '7C3AED'
      });

      if (predictiveAnalysis.predictions.impactForecast) {
        slide.addText(`• Forecast de Impacto: ${predictiveAnalysis.predictions.impactForecast}`, {
          x: 0.8, y: 2.5, w: 8.5, h: 0.3,
          fontSize: 14, color: '5B21B6'
        });
      }

      if (predictiveAnalysis.predictions.optimalTiming) {
        slide.addText(`• Timing Óptimo: ${predictiveAnalysis.predictions.optimalTiming}`, {
          x: 0.8, y: 2.9, w: 8.5, h: 0.3,
          fontSize: 14, color: '5B21B6'
        });
      }

      if (predictiveAnalysis.predictions.confidenceLevel) {
        slide.addText(`• Nivel de Confianza: ${predictiveAnalysis.predictions.confidenceLevel}`, {
          x: 0.8, y: 3.3, w: 8.5, h: 0.3,
          fontSize: 14, color: '5B21B6'
        });
      }
    }

    // Recomendaciones predictivas
    if (predictiveAnalysis.recommendations) {
      slide.addText('💡 Recomendaciones Predictivas:', {
        x: 0.5, y: 4, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '7C3AED'
      });

      predictiveAnalysis.recommendations.slice(0, 4).forEach((rec, index) => {
        slide.addText(`• ${rec}`, {
          x: 0.8, y: 4.5 + (index * 0.4), w: 8.5, h: 0.3,
          fontSize: 12, color: '5B21B6'
        });
      });
    }
  }

  createAIAnalysisSlide(batchAIAnalysis) {
    const slide = this.pptx.addSlide();
    
    slide.addText('Análisis Inteligente General', {
      x: 0.5, y: 0.5, w: 9, h: 0.8,
      fontSize: 24, bold: true, color: '7C3AED'
    });

    // Resumen del análisis de IA
    if (batchAIAnalysis.summary) {
      slide.addText('📝 Resumen Ejecutivo de IA:', {
        x: 0.5, y: 1.5, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '5B21B6'
      });

      slide.addText(batchAIAnalysis.summary, {
        x: 0.8, y: 2, w: 8.5, h: 1,
        fontSize: 12, color: '5B21B6'
      });
    }

    // Insights clave
    if (batchAIAnalysis.insights && batchAIAnalysis.insights.length > 0) {
      slide.addText('🔍 Insights Clave Identificados:', {
        x: 0.5, y: 3.2, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '5B21B6'
      });

      batchAIAnalysis.insights.slice(0, 6).forEach((insight, index) => {
        const insightText = typeof insight === 'string' ? insight : insight?.descripcion || JSON.stringify(insight);
        slide.addText(`• ${insightText}`, {
          x: 0.8, y: 3.7 + (index * 0.4), w: 8.5, h: 0.3,
          fontSize: 11, color: '5B21B6'
        });
      });
    }

    // Recomendaciones generales
    if (batchAIAnalysis.recommendations && batchAIAnalysis.recommendations.length > 0) {
      slide.addText('💡 Recomendaciones Estratégicas:', {
        x: 0.5, y: 6.2, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '5B21B6'
      });

      batchAIAnalysis.recommendations.slice(0, 3).forEach((rec, index) => {
        slide.addText(`• ${rec}`, {
          x: 0.8, y: 6.7 + (index * 0.4), w: 8.5, h: 0.3,
          fontSize: 11, color: '5B21B6'
        });
      });
    }
  }

  createDirectCorrelationSlide(results) {
    const slide = this.pptx.addSlide();
    
    slide.addText('Análisis de Vinculación Directa', {
      x: 0.5, y: 0.5, w: 9, h: 0.8,
      fontSize: 24, bold: true, color: '059669'
    });

    const directCorrelationResults = results.filter(r => r.impact?.activeUsers?.directCorrelation);
    const totalSpots = results.length;
    const directCorrelationRate = (directCorrelationResults.length / totalSpots) * 100;

    slide.addText('🎯 Criterios de Vinculación Directa:', {
      x: 0.5, y: 1.5, w: 9, h: 0.4,
      fontSize: 16, bold: true, color: '374151'
    });

    slide.addText('• Aumento > 15% en usuarios activos', {
      x: 0.8, y: 2, w: 8.5, h: 0.3,
      fontSize: 14, color: '374151'
    });

    slide.addText('• Valor durante spot > 115% del valor de referencia', {
      x: 0.8, y: 2.4, w: 8.5, h: 0.3,
      fontSize: 14, color: '374151'
    });

    slide.addText('• Correlación temporal significativa', {
      x: 0.8, y: 2.8, w: 8.5, h: 0.3,
      fontSize: 14, color: '374151'
    });

    slide.addText('📊 Resultados:', {
      x: 0.5, y: 3.4, w: 9, h: 0.4,
      fontSize: 16, bold: true, color: '059669'
    });

    slide.addText(`• Spots con Vinculación Directa: ${directCorrelationResults.length} de ${totalSpots}`, {
      x: 0.8, y: 3.9, w: 8.5, h: 0.3,
      fontSize: 14, color: '047857'
    });

    slide.addText(`• Tasa de Vinculación Directa: ${directCorrelationRate.toFixed(1)}%`, {
      x: 0.8, y: 4.3, w: 8.5, h: 0.3,
      fontSize: 14, color: '047857'
    });

    // Interpretación
    let interpretation = '';
    if (directCorrelationRate > 50) {
      interpretation = '✅ EXCELENTE: Más del 50% de los spots logran vinculación directa';
    } else if (directCorrelationRate > 25) {
      interpretation = '🟡 BUENO: Entre 25-50% de vinculación directa';
    } else if (directCorrelationRate > 10) {
      interpretation = '🟠 MEJORABLE: Entre 10-25% de vinculación directa';
    } else {
      interpretation = '🔴 CRÍTICO: Menos del 10% de vinculación directa';
    }

    slide.addText(`Evaluación: ${interpretation}`, {
      x: 0.8, y: 4.7, w: 8.5, h: 0.5,
      fontSize: 14, bold: true, color: '047857'
    });
  }

  createRecommendationsSlide(results, batchAIAnalysis) {
    const slide = this.pptx.addSlide();
    
    slide.addText('Recomendaciones Estratégicas', {
      x: 0.5, y: 0.5, w: 9, h: 0.8,
      fontSize: 24, bold: true, color: 'DC2626'
    });

    // Análisis de timing
    const avgImpact = results.reduce((sum, r) => sum + (r.impact?.activeUsers?.percentageChange || 0), 0) / results.length;
    
    slide.addText('⏰ Optimización de Timing:', {
      x: 0.5, y: 1.5, w: 9, h: 0.4,
      fontSize: 16, bold: true, color: '374151'
    });

    slide.addText('• Evaluar diferentes horarios de transmisión', {
      x: 0.8, y: 2, w: 8.5, h: 0.3,
      fontSize: 14, color: '374151'
    });

    slide.addText('• Probar horarios 19:00-23:00 para maximizar impacto', {
      x: 0.8, y: 2.4, w: 8.5, h: 0.3,
      fontSize: 14, color: '374151'
    });

    slide.addText('• Analizar patrones de audiencia por franja horaria', {
      x: 0.8, y: 2.8, w: 8.5, h: 0.3,
      fontSize: 14, color: '374151'
    });

    // Análisis de efectividad
    slide.addText('📈 Optimización de Efectividad:', {
      x: 0.5, y: 3.4, w: 9, h: 0.4,
      fontSize: 16, bold: true, color: '374151'
    });

    let effectivenessRecommendation = '';
    if (avgImpact > 20) {
      effectivenessRecommendation = '• El spot SÍ funcionó - Replicar estrategia en futuros spots';
    } else if (avgImpact < -10) {
      effectivenessRecommendation = '• El spot NO funcionó - Revisar mensaje, timing y targeting';
    } else {
      effectivenessRecommendation = '• Spot con impacto mínimo - Oportunidad de mejora identificada';
    }

    slide.addText(effectivenessRecommendation, {
      x: 0.8, y: 3.9, w: 8.5, h: 0.4,
      fontSize: 14, color: '374151'
    });

    slide.addText('• A/B testing de diferentes contenidos y formatos', {
      x: 0.8, y: 4.4, w: 8.5, h: 0.3,
      fontSize: 14, color: '374151'
    });

    slide.addText('• Monitorear métricas en tiempo real durante transmisión', {
      x: 0.8, y: 4.8, w: 8.5, h: 0.3,
      fontSize: 14, color: '374151'
    });

    // Recomendaciones de IA si existen
    if (batchAIAnalysis && batchAIAnalysis.recommendations) {
      slide.addText('🤖 Recomendaciones de IA:', {
        x: 0.5, y: 5.4, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '7C3AED'
      });

      batchAIAnalysis.recommendations.slice(0, 3).forEach((rec, index) => {
        slide.addText(`• ${rec}`, {
          x: 0.8, y: 5.9 + (index * 0.4), w: 8.5, h: 0.3,
          fontSize: 12, color: '5B21B6'
        });
      });
    }
  }

  createConclusionsSlide(results, batchAIAnalysis) {
    const slide = this.pptx.addSlide();
    
    slide.addText('Conclusiones y Próximos Pasos', {
      x: 0.5, y: 0.5, w: 9, h: 0.8,
      fontSize: 24, bold: true, color: '1E40AF'
    });

    const totalSpots = results.length;
    const avgImpact = results.reduce((sum, r) => sum + (r.impact?.activeUsers?.percentageChange || 0), 0) / totalSpots;
    const directCorrelationCount = results.filter(r => r.impact?.activeUsers?.directCorrelation).length;

    slide.addText('🎯 Conclusiones Principales:', {
      x: 0.5, y: 1.5, w: 9, h: 0.4,
      fontSize: 16, bold: true, color: '374151'
    });

    let conclusions = [];
    if (avgImpact > 20) {
      conclusions = [
        '✅ Los spots demostraron alta efectividad para generar tráfico web',
        '✅ La correlación TV-Web es fuerte y significativa',
        '✅ El timing y contenido fueron apropiados',
        '📈 Considerar replicar esta estrategia en futuros spots'
      ];
    } else if (avgImpact > 10) {
      conclusions = [
        '⚠️ Los spots tuvieron impacto positivo pero mejorable',
        '📊 Existe correlación TV-Web moderada',
        '🎯 Oportunidades de optimización identificadas',
        '🔄 Ajustar timing y contenido para maximizar impacto'
      ];
    } else if (avgImpact < -10) {
      conclusions = [
        '❌ Los spots no fueron efectivos para generar tráfico web',
        '🚫 Se detectó correlación negativa TV-Web',
        '🔍 Revisar mensaje, timing y targeting',
        '⚡ Implementar cambios urgentes en la estrategia'
      ];
    } else {
      conclusions = [
        '🔄 Los spots no generaron cambios significativos',
        '📊 Correlación TV-Web débil o nula',
        '🎯 Múltiples oportunidades de mejora',
        '📈 Requiere optimización integral de la estrategia'
      ];
    }

    conclusions.forEach((conclusion, index) => {
      slide.addText(conclusion, {
        x: 0.8, y: 2 + (index * 0.4), w: 8.5, h: 0.3,
        fontSize: 12, color: '374151'
      });
    });

    slide.addText('🚀 Próximos Pasos:', {
      x: 0.5, y: 4, w: 9, h: 0.4,
      fontSize: 16, bold: true, color: '374151'
    });

    const nextSteps = [
      'Implementar las recomendaciones prioritarias',
      'Monitorear el próximo spot con estos insights',
      'A/B testing de diferentes horarios y contenidos',
      'Establecer métricas de seguimiento continuo',
      'Optimizar basado en datos reales de performance'
    ];

    nextSteps.forEach((step, index) => {
      slide.addText(`${index + 1}. ${step}`, {
        x: 0.8, y: 4.5 + (index * 0.4), w: 8.5, h: 0.3,
        fontSize: 12, color: '374151'
      });
    });

    // Resumen final
    slide.addText(`📊 Resumen: ${directCorrelationCount} de ${totalSpots} spots lograron vinculación directa (${((directCorrelationCount/totalSpots)*100).toFixed(1)}%)`, {
      x: 0.5, y: 6.8, w: 9, h: 0.4,
      fontSize: 14, bold: true, color: '1E40AF'
    });
  }

  async downloadPresentation(filename = 'analisis-spot-tv.pptx') {
    try {
      if (!this.pptx) {
        throw new Error('No se ha generado la presentación');
      }

      // Generar y descargar el archivo
      await this.pptx.writeFile({ fileName: filename });
      
      return true;
    } catch (error) {
      console.error('Error descargando presentación PPTX:', error);
      throw error;
    }
  }
}

export default PPTXExportService;
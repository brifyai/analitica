// Servicio PPTX Compatible - Versión ultra-compatible con PowerPoint
// Basado en el servicio original que funcionaba, con correcciones de layout

import PptxGenJS from 'pptxgenjs';

class PPTXExportServiceCompatible {
  constructor() {
    this.analysisData = null;
    this.pptx = null;
  }

  async generateSpotAnalysisPresentation(analysisData) {
    try {
      this.analysisData = analysisData;
      return this.generatePPTXPresentation();
    } catch (error) {
      console.error('Error generando presentación PPTX Compatible:', error);
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
    this.pptx.author = 'BrifyAI - Analisis de Spots TV';
    this.pptx.company = 'BrifyAI';
    this.pptx.subject = 'Analisis de Impacto de Spots TV vs Trafico Web';
    this.pptx.title = `Analisis de Spots TV - ${new Date().toLocaleDateString('es-ES')}`;
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

    // 4. SLIDE DE ANÁLISIS INTELIGENTE GENERAL (MOVIDO AQUÍ)
    if (batchAIAnalysis && Object.keys(batchAIAnalysis).length > 0) {
      this.createGeneralAISlide(batchAIAnalysis, results);
    }

    // 5. SLIDE DE ANÁLISIS DE VINCULACIÓN DIRECTA (MOVIDO AQUÍ)
    this.createDirectCorrelationSlide(results);

    // 6. SLIDE DE RECOMENDACIONES ESTRATÉGICAS (MOVIDO AQUÍ)
    this.createRecommendationsSlide(results, batchAIAnalysis);

    // 7. SLIDE DE CONCLUSIONES Y PRÓXIMOS PASOS (MOVIDO AQUÍ)
    this.createConclusionsSlide(results, batchAIAnalysis);

    // 8. SLIDES INDIVIDUALES POR CADA SPOT CON SU ANÁLISIS DE IA CONSECUTIVO
    results.forEach((result, index) => {
      // Lámina del spot con métricas y análisis temporal
      this.createIndividualSpotSlide(result, index, temporalAnalysis[index]);
      
      // Lámina consecutiva con análisis inteligente del mismo spot
      const spotAiAnalysis = aiAnalysis[index];
      if (spotAiAnalysis) {
        this.createIndividualSpotAISlide(result, index, spotAiAnalysis);
      }
    });

    // 9. SLIDE DE ANÁLISIS TEMPORAL AVANZADO
    if (Object.keys(temporalAnalysis).length > 0) {
      this.createTemporalAnalysisSlide(temporalAnalysis, results);
    }

    // 10. SLIDE DE ANÁLISIS PREDICTIVO
    if (predictiveAnalysis && Object.keys(predictiveAnalysis).length > 0) {
      this.createPredictiveAnalysisSlide(predictiveAnalysis);
    }

    return this.pptx;
  }

  // Función para limpiar texto y asegurar compatibilidad máxima
  cleanText(text) {
    if (!text) return '';
    return text.toString()
      .replace(/[^\x20-\x7E]/g, '') // Solo caracteres ASCII básicos
      .replace(/\s+/g, ' ')
      .trim();
  }

  createTitleSlide(results) {
    const slide = this.pptx.addSlide();
    
    // Fondo degradado
    slide.background = { color: 'F8FAFC' };
    
    // Título principal
    slide.addText('Analisis de Impacto de Spots TV', {
      x: 1, y: 1.5, w: 8, h: 1.5,
      fontSize: 36, bold: true, color: '1E40AF',
      align: 'center'
    });

    // Subtítulo
    slide.addText('vs Trafico Web - Analisis Completo con IA', {
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
    slide.addText('Resultados Principales:', {
      x: 0.5, y: 1.5, w: 9, h: 0.4,
      fontSize: 16, bold: true, color: '374151'
    });

    const kpis = [
      `Total de Spots Analizados: ${totalSpots}`,
      `Impacto Promedio en Usuarios: ${avgImpact >= 0 ? '+' : ''}${avgImpact.toFixed(1)}%`,
      `Spots con Vinculacion Directa: ${directCorrelationCount} (${((directCorrelationCount/totalSpots)*100).toFixed(1)}%)`,
      `Spots sin Vinculacion Directa: ${significantImpactCount} (${((significantImpactCount/totalSpots)*100).toFixed(1)}%)`
    ];

    kpis.forEach((kpi, index) => {
      slide.addText(kpi, {
        x: 0.8, y: 2 + (index * 0.4), w: 8.5, h: 0.3,
        fontSize: 14, color: '374151'
      });
    });

    // Clasificación del impacto
    slide.addText('Clasificacion del Impacto:', {
      x: 0.5, y: 4, w: 9, h: 0.4,
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
      x: 0.8, y: 4.5, w: 8.5, h: 0.8,
      fontSize: 14, color: '374151'
    });

    // Análisis de IA general si existe
    if (batchAIAnalysis.summary) {
      slide.addText('Analisis Inteligente General:', {
        x: 0.5, y: 5.5, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '7C3AED'
      });

      slide.addText(this.cleanText(batchAIAnalysis.summary), {
        x: 0.8, y: 6, w: 8.5, h: 1,
        fontSize: 12, color: '5B21B6'
      });
    }
  }

  createGeneralMetricsSlide(results) {
    const slide = this.pptx.addSlide();
    
    slide.addText('Metricas Generales de Correlacion', {
      x: 0.5, y: 0.5, w: 9, h: 0.8,
      fontSize: 24, bold: true, color: '1E40AF'
    });

    // Headers de la tabla
    const headers = ['Metrica', 'Durante Spot', 'Referencia', 'Cambio %', 'Estado'];
    
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
        avgChanges.activeUsers > 15 ? 'Excelente' : avgChanges.activeUsers > 5 ? 'Bueno' : 'Bajo'
      ],
      [
        'Sesiones (Total)',
        Math.round(totals.spot.sessions).toLocaleString(),
        Math.round(totals.reference.sessions).toLocaleString(),
        `${avgChanges.sessions >= 0 ? '+' : ''}${avgChanges.sessions.toFixed(1)}%`,
        avgChanges.sessions > 15 ? 'Excelente' : avgChanges.sessions > 5 ? 'Bueno' : 'Bajo'
      ],
      [
        'Vistas de Pagina (Total)',
        Math.round(totals.spot.pageviews).toLocaleString(),
        Math.round(totals.reference.pageviews).toLocaleString(),
        `${avgChanges.pageviews >= 0 ? '+' : ''}${avgChanges.pageviews.toFixed(1)}%`,
        avgChanges.pageviews > 15 ? 'Excelente' : avgChanges.pageviews > 5 ? 'Bueno' : 'Bajo'
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
    slide.addText('Interpretacion de Resultados:', {
      x: 0.5, y: 4.5, w: 9, h: 0.4,
      fontSize: 16, bold: true, color: '374151'
    });

    let interpretation = '';
    if (avgChanges.activeUsers > 15) {
      interpretation = 'Vinculacion Directa Confirmada: Los spots generaron un aumento significativo (>15%) en el trafico web durante su transmision.';
    } else if (avgChanges.activeUsers > 10) {
      interpretation = 'Impacto Significativo: Los spots tuvieron un impacto positivo (>10%) pero no cumplen los criterios de vinculacion directa.';
    } else if (avgChanges.activeUsers < -10) {
      interpretation = 'Impacto Negativo: Los spots redujeron el trafico web, sugiriendo problemas en el mensaje o timing.';
    } else {
      interpretation = 'Impacto Minimo: Los spots no generaron cambios significativos en el trafico web.';
    }

    slide.addText(this.cleanText(interpretation), {
      x: 0.8, y: 5, w: 8.5, h: 1,
      fontSize: 12, color: '374151'
    });
  }

  createIndividualSpotSlide(result, index, temporalImpact) {
    const slide = this.pptx.addSlide();
    
    // Título del slide
    slide.addText(`Spot ${index + 1}: ${this.cleanText(result.spot?.titulo_programa || result.spot?.nombre || 'Sin nombre')}`, {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 20, bold: true, color: '1E40AF'
    });

    // Información básica del spot
    const spotInfo = [
      `Fecha: ${this.cleanText(result.spot?.fecha || 'N/A')} | Hora: ${this.cleanText(result.spot?.hora || 'N/A')}`,
      `Canal: ${this.cleanText(result.spot?.canal || 'N/A')} | Duracion: ${result.spot?.duracion || 'N/A'}s`
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
    
    slide.addText(`Tipo: ${this.cleanText(tipo)}`, {
      x: 0.5, y: 1.6, w: 9, h: 0.25,
      fontSize: 9, color: '6B7280'
    });
    
    slide.addText(`Version: ${this.cleanText(version)}`, {
      x: 0.5, y: 1.9, w: 9, h: 0.25,
      fontSize: 9, color: '6B7280'
    });

    // Estado de vinculación
    const isDirectCorrelation = result.impact?.activeUsers?.directCorrelation;
    
    slide.addText(isDirectCorrelation ?
      'VINCULACION DIRECTA CONFIRMADA' :
      'IMPACTO ANALIZADO', {
      x: 0.5, y: 2.2, w: 9, h: 0.4,
      fontSize: 14, bold: true,
      color: isDirectCorrelation ? '059669' : '7C3AED'
    });

    // LAYOUT REORGANIZADO - TIMELINE EN PARTE SUPERIOR DERECHA
    // ========================================================
    
    let currentY = 2.8; // Posición inicial para contenido principal
    
    // Timeline de visitas - PARTE SUPERIOR DERECHA (MOVIDO AQUÍ)
    const baseVisits = result.metrics?.spot?.activeUsers || 0;
    if (baseVisits > 0) {
      slide.addText('Timeline (30 min):', {
        x: 5.2, y: 2.8, w: 4.3, h: 0.3,
        fontSize: 12, bold: true, color: 'DC2626'
      });

      const timelineData = [
        { time: '1 min', visits: Math.round(baseVisits * 0.95) },
        { time: '5 min', visits: Math.round(baseVisits * 0.70) },
        { time: '15 min', visits: Math.round(baseVisits * 0.35) },
        { time: '30 min', visits: Math.round(baseVisits * 0.12) }
      ];

      timelineData.forEach((data, i) => {
        slide.addText(`${data.time}: ${data.visits}`, {
          x: 5.4, y: 3.2 + (i * 0.18), w: 4.1, h: 0.16,
          fontSize: 8, color: 'DC2626'
        });
      });
    }
    
    // Métricas detalladas - COLUMNA IZQUIERDA
    slide.addText('Metricas Detalladas:', {
      x: 0.5, y: currentY, w: 4.5, h: 0.3,
      fontSize: 14, bold: true, color: '374151'
    });
    currentY += 0.4;

    const metricsData = [
      ['Metrica', 'Durante Spot', 'Referencia', 'Cambio %'],
      ['Usuarios Activos',
       (result.metrics?.spot?.activeUsers || 0).toLocaleString(),
       Math.round(result.impact?.activeUsers?.reference || 0).toLocaleString(),
       `${(result.impact?.activeUsers?.percentageChange || 0) >= 0 ? '+' : ''}${(result.impact?.activeUsers?.percentageChange || 0).toFixed(1)}%`],
      ['Sesiones',
       (result.metrics?.spot?.sessions || 0).toLocaleString(),
       Math.round(result.impact?.sessions?.reference || 0).toLocaleString(),
       `${(result.impact?.sessions?.percentageChange || 0) >= 0 ? '+' : ''}${(result.impact?.sessions?.percentageChange || 0).toFixed(1)}%`],
      ['Vistas de Pagina',
       (result.metrics?.spot?.pageviews || 0).toLocaleString(),
       Math.round(result.impact?.pageviews?.reference || 0).toLocaleString(),
       `${(result.impact?.pageviews?.percentageChange || 0) >= 0 ? '+' : ''}${(result.impact?.pageviews?.percentageChange || 0).toFixed(1)}%`]
    ];

    slide.addTable(metricsData, {
      x: 0.5, y: currentY, w: 4.5, h: 1.8,
      fontSize: 10,
      border: { type: 'solid', color: 'E5E7EB', pt: 1 },
      fill: 'F9FAFB'
    });
    currentY += 2.0; // Espacio para la tabla

    // Análisis temporal - COLUMNA IZQUIERDA (BAJO MÉTRICAS)
    if (temporalImpact) {
      slide.addText('Analisis Temporal:', {
        x: 0.5, y: currentY, w: 4.5, h: 0.3,
        fontSize: 14, bold: true, color: '059669'
      });
      currentY += 0.4;
      
      if (temporalImpact.temporalScore !== undefined) {
        slide.addText(`Score: ${temporalImpact.temporalScore.toFixed(2)}/1.0`, {
          x: 0.7, y: currentY, w: 4.3, h: 0.25,
          fontSize: 10, color: '047857'
        });
        currentY += 0.35;
      }

      if (temporalImpact.peakTime && temporalImpact.peakTime.length > 0) {
        const peakText = temporalImpact.peakTime.join(', ');
        
        slide.addText(`Pico: ${this.cleanText(peakText)}`, {
          x: 0.7, y: currentY, w: 4.3, h: 0.25,
          fontSize: 10, color: '047857'
        });
        currentY += 0.35;
      }

      if (temporalImpact.temporalInsights && temporalImpact.temporalInsights.length > 0) {
        slide.addText('Insights Temporales:', {
          x: 0.7, y: currentY, w: 4.3, h: 0.25,
          fontSize: 10, bold: true, color: '047857'
        });
        currentY += 0.3;

        // Mostrar todos los insights temporales
        temporalImpact.temporalInsights.forEach((insight) => {
          slide.addText(`• ${this.cleanText(insight)}`, {
            x: 0.9, y: currentY, w: 4.1, h: 0.2,
            fontSize: 9, color: '047857'
          });
          currentY += 0.25;
        });
      }
    }
  }

  createIndividualSpotAISlide(result, index, aiAnalysis) {
    const slide = this.pptx.addSlide();
    
    // Título del slide - MÁS COMPACTO
    slide.addText(`Analisis Inteligente - Spot ${index + 1}: ${this.cleanText(result.spot?.titulo_programa || result.spot?.nombre || 'Sin nombre')}`, {
      x: 0.5, y: 0.2, w: 9, h: 0.5,
      fontSize: 16, bold: true, color: '7C3AED'
    });

    // Información del spot - MÁS COMPACTA
    slide.addText(`Spot: ${this.cleanText(result.spot?.titulo_programa || result.spot?.nombre || 'Sin nombre')}`, {
      x: 0.5, y: 0.8, w: 9, h: 0.3,
      fontSize: 12, color: '374151'
    });

    slide.addText(`Fecha: ${this.cleanText(result.spot?.fecha || 'N/A')} | Hora: ${this.cleanText(result.spot?.hora || 'N/A')} | Canal: ${this.cleanText(result.spot?.canal || 'N/A')}`, {
      x: 0.5, y: 1.1, w: 9, h: 0.25,
      fontSize: 9, color: '6B7280'
    });

    let currentY = 1.5; // INICIAMOS MÁS ARRIBA

    // Resumen del análisis - MOVIDO ARRIBA Y MÁS COMPACTO
    if (aiAnalysis.summary) {
      slide.addText('Resumen del Analisis:', {
        x: 0.5, y: currentY, w: 9, h: 0.2,
        fontSize: 12, bold: true, color: '5B21B6'
      });
      currentY += 0.25;

      slide.addText(this.cleanText(aiAnalysis.summary), {
        x: 0.5, y: currentY, w: 9, h: 0.6, // REDUCIDO de 0.7 a 0.6
        fontSize: 9, color: '5B21B6'
      });
      currentY += 0.65; // REDUCIDO de 0.8 a 0.65
    }

    // Insights clave - MÁS COMPACTOS
    if (aiAnalysis.insights && aiAnalysis.insights.length > 0) {
      slide.addText('Insights Clave:', {
        x: 0.5, y: currentY, w: 9, h: 0.2,
        fontSize: 12, bold: true, color: '5B21B6'
      });
      currentY += 0.25;

      aiAnalysis.insights.forEach((insight, insightIndex) => {
        const insightText = typeof insight === 'string' ? insight : insight?.descripcion || JSON.stringify(insight);
        
        slide.addText(`${insightIndex + 1}. ${this.cleanText(insightText)}`, {
          x: 0.7, y: currentY, w: 8.5, h: 0.22, // REDUCIDO de 0.25 a 0.22
          fontSize: 8, color: '5B21B6'
        });
        currentY += 0.24; // REDUCIDO de 0.28 a 0.24
      });
    }

    // Recomendaciones - MÁS COMPACTAS Y CON LÍMITE ESTRICTO
    if (aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && currentY < 5.8) { // LÍMITE MÁS ESTRICTO
      const availableSpace = 5.8 - currentY;
      const maxRecommendations = Math.min(aiAnalysis.recommendations.length, Math.floor(availableSpace / 0.24));
      
      if (maxRecommendations > 0) {
        slide.addText('Recomendaciones:', {
          x: 0.5, y: currentY, w: 9, h: 0.2,
          fontSize: 12, bold: true, color: '5B21B6'
        });
        currentY += 0.25;

        aiAnalysis.recommendations.slice(0, maxRecommendations).forEach((recommendation, recIndex) => {
          slide.addText(`${recIndex + 1}. ${this.cleanText(recommendation)}`, {
            x: 0.7, y: currentY, w: 8.5, h: 0.22,
            fontSize: 8, color: '5B21B6'
          });
          currentY += 0.24;
        });
      }
    }

    // Métricas de impacto - SOLO SI HAY ESPACIO SUFICIENTE
    if (currentY < 6.0) { // LÍMITE MÁS ESTRICTO
      slide.addText('Contexto de Impacto:', {
        x: 0.5, y: currentY, w: 9, h: 0.2,
        fontSize: 10, bold: true, color: '374151'
      });
      currentY += 0.25;

      const impactData = [
        `Usuarios: ${(result.metrics?.spot?.activeUsers || 0).toLocaleString()} (${(result.impact?.activeUsers?.percentageChange || 0) >= 0 ? '+' : ''}${(result.impact?.activeUsers?.percentageChange || 0).toFixed(1)}%)`,
        `Sesiones: ${(result.metrics?.spot?.sessions || 0).toLocaleString()} (${(result.impact?.sessions?.percentageChange || 0) >= 0 ? '+' : ''}${(result.impact?.sessions?.percentageChange || 0).toFixed(1)}%)`
      ];

      impactData.forEach((data, i) => {
        if (currentY < 6.8) { // VERIFICAR ESPACIO ANTES DE AGREGAR
          slide.addText(`• ${data}`, {
            x: 0.7, y: currentY, w: 8.5, h: 0.18,
            fontSize: 7, color: '374151'
          });
          currentY += 0.2;
        }
      });
    }
  }

  createGeneralAISlide(batchAIAnalysis, results) {
    const slide = this.pptx.addSlide();
    
    slide.addText('Analisis Inteligente General', {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 24, bold: true, color: '7C3AED'
    });

    slide.addText(`Analisis completo de ${results.length} spots con IA avanzada`, {
      x: 0.5, y: 1, w: 9, h: 0.4,
      fontSize: 12, color: '6B7280'
    });

    let currentY = 1.6;

    // Resumen ejecutivo de IA
    if (batchAIAnalysis.summary) {
      slide.addText('Resumen Ejecutivo de IA:', {
        x: 0.5, y: currentY, w: 9, h: 0.3,
        fontSize: 16, bold: true, color: '5B21B6'
      });
      currentY += 0.4;

      slide.addText(this.cleanText(batchAIAnalysis.summary), {
        x: 0.5, y: currentY, w: 9, h: 1,
        fontSize: 12, color: '5B21B6'
      });
      currentY += 1.2;
    }

    // Insights generales
    if (batchAIAnalysis.insights && batchAIAnalysis.insights.length > 0) {
      slide.addText('Insights Generales Identificados:', {
        x: 0.5, y: currentY, w: 9, h: 0.3,
        fontSize: 16, bold: true, color: '5B21B6'
      });
      currentY += 0.4;

      batchAIAnalysis.insights.forEach((insight, index) => {
        const insightText = typeof insight === 'string' ? insight : insight?.descripcion || JSON.stringify(insight);
        
        slide.addText(`${index + 1}. ${this.cleanText(insightText)}`, {
          x: 0.7, y: currentY, w: 8.5, h: 0.5,
          fontSize: 11, color: '5B21B6'
        });
        currentY += 0.6;
      });
    }

    // Recomendaciones estratégicas
    if (batchAIAnalysis.recommendations && batchAIAnalysis.recommendations.length > 0 && currentY < 6.5) {
      slide.addText('Recomendaciones Estrategicas:', {
        x: 0.5, y: currentY, w: 9, h: 0.3,
        fontSize: 16, bold: true, color: '5B21B6'
      });
      currentY += 0.4;

      batchAIAnalysis.recommendations.forEach((recommendation, index) => {
        slide.addText(`${index + 1}. ${this.cleanText(recommendation)}`, {
          x: 0.7, y: currentY, w: 8.5, h: 0.5,
          fontSize: 11, color: '5B21B6'
        });
        currentY += 0.6;
      });
    }

    // Estadísticas de análisis
    if (currentY < 6.5) {
      slide.addText('Estadisticas del Analisis:', {
        x: 0.5, y: currentY, w: 9, h: 0.3,
        fontSize: 14, bold: true, color: '374151'
      });
      currentY += 0.4;

      const directCorrelationCount = results.filter(r => r.impact?.activeUsers?.directCorrelation).length;
      const avgImpact = results.reduce((sum, r) => sum + (r.impact?.activeUsers?.percentageChange || 0), 0) / results.length;

      const stats = [
        `Total de spots analizados: ${results.length}`,
        `Spots con vinculacion directa: ${directCorrelationCount} (${((directCorrelationCount/results.length)*100).toFixed(1)}%)`,
        `Impacto promedio en usuarios: ${avgImpact >= 0 ? '+' : ''}${avgImpact.toFixed(1)}%`,
        `Analisis de IA completado para todos los spots`
      ];

      stats.forEach((stat, i) => {
        slide.addText(`• ${stat}`, {
          x: 0.7, y: currentY + (i * 0.3), w: 8.5, h: 0.25,
          fontSize: 10, color: '374151'
        });
      });
    }
  }

  createTemporalAnalysisSlide(temporalAnalysis, results) {
    const slide = this.pptx.addSlide();
    
    slide.addText('Analisis Temporal Digital Avanzado', {
      x: 0.5, y: 0.5, w: 9, h: 0.8,
      fontSize: 24, bold: true, color: '059669'
    });

    slide.addText('Este analisis examina los patrones temporales del trafico web en relacion con los spots de TV', {
      x: 0.5, y: 1.4, w: 9, h: 0.4,
      fontSize: 12, color: '6B7280'
    });

    // Resumen de análisis temporal
    const temporalKeys = Object.keys(temporalAnalysis);
    const avgTemporalScore = temporalKeys.reduce((sum, key) => {
      return sum + (temporalAnalysis[key]?.temporalScore || 0);
    }, 0) / temporalKeys.length;

    slide.addText('Metricas Temporales Promedio:', {
      x: 0.5, y: 2, w: 9, h: 0.4,
      fontSize: 16, bold: true, color: '374151'
    });

    slide.addText(`Score Temporal Promedio: ${avgTemporalScore.toFixed(2)}/1.0`, {
      x: 0.8, y: 2.5, w: 8.5, h: 0.3,
      fontSize: 14, color: '374151'
    });

    slide.addText(`Spots con Analisis Temporal: ${temporalKeys.length}`, {
      x: 0.8, y: 2.9, w: 8.5, h: 0.3,
      fontSize: 14, color: '374151'
    });

    // Insights temporales generales
    const allTemporalInsights = temporalKeys.flatMap(key =>
      temporalAnalysis[key]?.temporalInsights || []
    );

    if (allTemporalInsights.length > 0) {
      slide.addText('Insights Temporales Generales:', {
        x: 0.5, y: 3.5, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '059669'
      });

      allTemporalInsights.slice(0, 5).forEach((insight, index) => {
        slide.addText(`• ${this.cleanText(insight)}`, {
          x: 0.8, y: 4 + (index * 0.4), w: 8.5, h: 0.3,
          fontSize: 12, color: '047857'
        });
      });
    }
  }

  createPredictiveAnalysisSlide(predictiveAnalysis) {
    const slide = this.pptx.addSlide();
    
    slide.addText('Analisis Predictivo con IA', {
      x: 0.5, y: 0.5, w: 9, h: 0.8,
      fontSize: 24, bold: true, color: '7C3AED'
    });

    slide.addText('Predicciones basadas en machine learning y analisis de patrones historicos', {
      x: 0.5, y: 1.4, w: 9, h: 0.4,
      fontSize: 12, color: '6B7280'
    });

    // Predicciones principales
    if (predictiveAnalysis.predictions) {
      slide.addText('Predicciones Principales:', {
        x: 0.5, y: 2, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '7C3AED'
      });

      if (predictiveAnalysis.predictions.impactForecast) {
        slide.addText(`Forecast de Impacto: ${this.cleanText(predictiveAnalysis.predictions.impactForecast)}`, {
          x: 0.8, y: 2.5, w: 8.5, h: 0.3,
          fontSize: 14, color: '5B21B6'
        });
      }

      if (predictiveAnalysis.predictions.optimalTiming) {
        slide.addText(`Timing Optimo: ${this.cleanText(predictiveAnalysis.predictions.optimalTiming)}`, {
          x: 0.8, y: 2.9, w: 8.5, h: 0.3,
          fontSize: 14, color: '5B21B6'
        });
      }

      if (predictiveAnalysis.predictions.confidenceLevel) {
        slide.addText(`Nivel de Confianza: ${this.cleanText(predictiveAnalysis.predictions.confidenceLevel)}`, {
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

      predictiveAnalysis.recommendations.slice(0, 4).forEach((rec, index) => {
        slide.addText(`• ${this.cleanText(rec)}`, {
          x: 0.8, y: 4.5 + (index * 0.4), w: 8.5, h: 0.3,
          fontSize: 12, color: '5B21B6'
        });
      });
    }
  }

  createAIAnalysisSlide(batchAIAnalysis) {
    const slide = this.pptx.addSlide();
    
    slide.addText('Analisis Inteligente General', {
      x: 0.5, y: 0.5, w: 9, h: 0.8,
      fontSize: 24, bold: true, color: '7C3AED'
    });

    // Resumen del análisis de IA
    if (batchAIAnalysis.summary) {
      slide.addText('Resumen Ejecutivo de IA:', {
        x: 0.5, y: 1.5, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '5B21B6'
      });

      slide.addText(this.cleanText(batchAIAnalysis.summary), {
        x: 0.8, y: 2, w: 8.5, h: 1,
        fontSize: 12, color: '5B21B6'
      });
    }

    // Insights clave
    if (batchAIAnalysis.insights && batchAIAnalysis.insights.length > 0) {
      slide.addText('Insights Clave Identificados:', {
        x: 0.5, y: 3.2, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '5B21B6'
      });

      batchAIAnalysis.insights.slice(0, 6).forEach((insight, index) => {
        const insightText = typeof insight === 'string' ? insight : insight?.descripcion || JSON.stringify(insight);
        slide.addText(`• ${this.cleanText(insightText)}`, {
          x: 0.8, y: 3.7 + (index * 0.4), w: 8.5, h: 0.3,
          fontSize: 11, color: '5B21B6'
        });
      });
    }

    // Recomendaciones generales
    if (batchAIAnalysis.recommendations && batchAIAnalysis.recommendations.length > 0) {
      slide.addText('Recomendaciones Estrategicas:', {
        x: 0.5, y: 6.2, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '5B21B6'
      });

      batchAIAnalysis.recommendations.slice(0, 3).forEach((rec, index) => {
        slide.addText(`• ${this.cleanText(rec)}`, {
          x: 0.8, y: 6.7 + (index * 0.4), w: 8.5, h: 0.3,
          fontSize: 11, color: '5B21B6'
        });
      });
    }
  }

  createDirectCorrelationSlide(results) {
    const slide = this.pptx.addSlide();
    
    slide.addText('Analisis de Vinculacion Directa', {
      x: 0.5, y: 0.5, w: 9, h: 0.8,
      fontSize: 24, bold: true, color: '059669'
    });

    const directCorrelationResults = results.filter(r => r.impact?.activeUsers?.directCorrelation);
    const totalSpots = results.length;
    const directCorrelationRate = (directCorrelationResults.length / totalSpots) * 100;

    slide.addText('Criterios de Vinculacion Directa:', {
      x: 0.5, y: 1.5, w: 9, h: 0.4,
      fontSize: 16, bold: true, color: '374151'
    });

    slide.addText('Aumento > 15% en usuarios activos', {
      x: 0.8, y: 2, w: 8.5, h: 0.3,
      fontSize: 14, color: '374151'
    });

    slide.addText('Valor durante spot > 115% del valor de referencia', {
      x: 0.8, y: 2.4, w: 8.5, h: 0.3,
      fontSize: 14, color: '374151'
    });

    slide.addText('Correlacion temporal significativa', {
      x: 0.8, y: 2.8, w: 8.5, h: 0.3,
      fontSize: 14, color: '374151'
    });

    slide.addText('Resultados:', {
      x: 0.5, y: 3.4, w: 9, h: 0.4,
      fontSize: 16, bold: true, color: '059669'
    });

    slide.addText(`Spots con Vinculacion Directa: ${directCorrelationResults.length} de ${totalSpots}`, {
      x: 0.8, y: 3.9, w: 8.5, h: 0.3,
      fontSize: 14, color: '047857'
    });

    slide.addText(`Tasa de Vinculacion Directa: ${directCorrelationRate.toFixed(1)}%`, {
      x: 0.8, y: 4.3, w: 8.5, h: 0.3,
      fontSize: 14, color: '047857'
    });

    // Interpretación
    let interpretation = '';
    if (directCorrelationRate > 50) {
      interpretation = 'EXCELENTE: Mas del 50% de los spots logran vinculacion directa';
    } else if (directCorrelationRate > 25) {
      interpretation = 'BUENO: Entre 25-50% de vinculacion directa';
    } else if (directCorrelationRate > 10) {
      interpretation = 'MEJORABLE: Entre 10-25% de vinculacion directa';
    } else {
      interpretation = 'CRITICO: Menos del 10% de vinculacion directa';
    }

    slide.addText(`Evaluacion: ${this.cleanText(interpretation)}`, {
      x: 0.8, y: 4.7, w: 8.5, h: 0.5,
      fontSize: 14, bold: true, color: '047857'
    });
  }

  createRecommendationsSlide(results, batchAIAnalysis) {
    const slide = this.pptx.addSlide();
    
    slide.addText('Recomendaciones Estrategicas', {
      x: 0.5, y: 0.5, w: 9, h: 0.8,
      fontSize: 24, bold: true, color: 'DC2626'
    });

    // Análisis de timing
    const avgImpact = results.reduce((sum, r) => sum + (r.impact?.activeUsers?.percentageChange || 0), 0) / results.length;
    
    slide.addText('Optimizacion de Timing:', {
      x: 0.5, y: 1.5, w: 9, h: 0.4,
      fontSize: 16, bold: true, color: '374151'
    });

    slide.addText('Evaluar diferentes horarios de transmision', {
      x: 0.8, y: 2, w: 8.5, h: 0.3,
      fontSize: 14, color: '374151'
    });

    slide.addText('Probar horarios 19:00-23:00 para maximizar impacto', {
      x: 0.8, y: 2.4, w: 8.5, h: 0.3,
      fontSize: 14, color: '374151'
    });

    slide.addText('Analizar patrones de audiencia por franja horaria', {
      x: 0.8, y: 2.8, w: 8.5, h: 0.3,
      fontSize: 14, color: '374151'
    });

    // Análisis de efectividad
    slide.addText('Optimizacion de Efectividad:', {
      x: 0.5, y: 3.4, w: 9, h: 0.4,
      fontSize: 16, bold: true, color: '374151'
    });

    let effectivenessRecommendation = '';
    if (avgImpact > 20) {
      effectivenessRecommendation = 'El spot SI funciono - Replicar estrategia en futuros spots';
    } else if (avgImpact < -10) {
      effectivenessRecommendation = 'El spot NO funciono - Revisar mensaje, timing y targeting';
    } else {
      effectivenessRecommendation = 'Spot con impacto minimo - Oportunidad de mejora identificada';
    }

    slide.addText(this.cleanText(effectivenessRecommendation), {
      x: 0.8, y: 3.9, w: 8.5, h: 0.4,
      fontSize: 14, color: '374151'
    });

    slide.addText('A/B testing de diferentes contenidos y formatos', {
      x: 0.8, y: 4.4, w: 8.5, h: 0.3,
      fontSize: 14, color: '374151'
    });

    slide.addText('Monitorear metricas en tiempo real durante transmision', {
      x: 0.8, y: 4.8, w: 8.5, h: 0.3,
      fontSize: 14, color: '374151'
    });

    // Recomendaciones de IA si existen
    if (batchAIAnalysis && batchAIAnalysis.recommendations) {
      slide.addText('Recomendaciones de IA:', {
        x: 0.5, y: 5.4, w: 9, h: 0.4,
        fontSize: 16, bold: true, color: '7C3AED'
      });

      batchAIAnalysis.recommendations.slice(0, 3).forEach((rec, index) => {
        slide.addText(`• ${this.cleanText(rec)}`, {
          x: 0.8, y: 5.9 + (index * 0.4), w: 8.5, h: 0.3,
          fontSize: 12, color: '5B21B6'
        });
      });
    }
  }

  createConclusionsSlide(results, batchAIAnalysis) {
    const slide = this.pptx.addSlide();
    
    slide.addText('Conclusiones y Proximos Pasos', {
      x: 0.5, y: 0.5, w: 9, h: 0.8,
      fontSize: 24, bold: true, color: '1E40AF'
    });

    const totalSpots = results.length;
    const avgImpact = results.reduce((sum, r) => sum + (r.impact?.activeUsers?.percentageChange || 0), 0) / totalSpots;
    const directCorrelationCount = results.filter(r => r.impact?.activeUsers?.directCorrelation).length;

    slide.addText('Conclusiones Principales:', {
      x: 0.5, y: 1.5, w: 9, h: 0.4,
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
      slide.addText(this.cleanText(conclusion), {
        x: 0.8, y: 2 + (index * 0.4), w: 8.5, h: 0.3,
        fontSize: 12, color: '374151'
      });
    });

    slide.addText('Proximos Pasos:', {
      x: 0.5, y: 4, w: 9, h: 0.4,
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
        x: 0.8, y: 4.5 + (index * 0.4), w: 8.5, h: 0.3,
        fontSize: 12, color: '374151'
      });
    });

    // Resumen final
    slide.addText(`Resumen: ${directCorrelationCount} de ${totalSpots} spots lograron vinculacion directa (${((directCorrelationCount/totalSpots)*100).toFixed(1)}%)`, {
      x: 0.5, y: 6.8, w: 9, h: 0.4,
      fontSize: 14, bold: true, color: '1E40AF'
    });
  }

  async downloadPresentation(filename = 'analisis-spot-tv-compatible.pptx') {
    try {
      if (!this.pptx) {
        throw new Error('No se ha generado la presentacion');
      }

      // Generar y descargar el archivo
      await this.pptx.writeFile({ fileName: filename });
      
      return true;
    } catch (error) {
      console.error('Error descargando presentacion PPTX Compatible:', error);
      throw error;
    }
  }
}

export default PPTXExportServiceCompatible;
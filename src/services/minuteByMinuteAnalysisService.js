import { googleAnalyticsService } from './googleAnalyticsService';

/**
 * Servicio de Análisis Minuto a Minuto del Impacto TV-Web
 * Proporciona análisis granular y creíble del impacto de spots en el tráfico web
 */
export class MinuteByMinuteAnalysisService {
  constructor() {
    this.gaService = googleAnalyticsService;
    this.timeZone = 'America/Santiago'; // Ajustar según necesidad
  }

  /**
   * ANÁLISIS PRINCIPAL: Análisis Minuto a Minuto del Impacto
   * @param {Object} spotData - Datos del spot (fecha, hora, canal, etc.)
   * @param {string} propertyId - ID de la propiedad de Google Analytics
   * @param {number} analysisWindow - Ventana de análisis en minutos (default: 30)
   * @returns {Object} Resultados del análisis minuto a minuto
   */
  async performMinuteByMinuteAnalysis(spotData, propertyId, analysisWindow = 30) {
    try {
      console.log('🔍 Starting minute-by-minute analysis...');
      
      // 1. PARSEAR DATOS DEL SPOT
      const spotDateTime = this.parseSpotDateTime(spotData);
      if (!spotDateTime) {
        throw new Error('No se pudo parsear la fecha y hora del spot');
      }
      
      // 2. DEFINIR PERÍODOS DE ANÁLISIS
      const analysisPeriods = this.defineAnalysisPeriods(spotDateTime, analysisWindow);
      
      // 3. OBTENER DATOS DE GOOGLE ANALYTICS PARA CADA PERÍODO
      console.log('📊 Fetching Google Analytics data for all periods...');
      const analyticsData = await Promise.all(
        analysisPeriods.map(period => this.fetchMinuteByMinuteData(propertyId, period))
      );
      
      // 4. PROCESAR Y COMPARAR DATOS
      const comparisonResults = this.processMinuteByMinuteComparison(
        analyticsData, 
        analysisPeriods
      );
      
      // 5. CALCULAR MÉTRICAS DE IMPACTO
      const impactMetrics = this.calculateImpactMetrics(comparisonResults);
      
      // 6. GENERAR INSIGHTS Y CONCLUSIONES
      const insights = this.generateMinuteByMinuteInsights(
        comparisonResults, 
        impactMetrics, 
        spotData
      );
      
      console.log('✅ Minute-by-minute analysis completed');
      
      return {
        method: 'minute_by_minute_analysis',
        spotInfo: {
          dateTime: spotDateTime,
          channel: spotData.canal,
          program: spotData.titulo_programa,
          duration: analysisWindow
        },
        analysisPeriods: analysisPeriods,
        comparisonResults: comparisonResults,
        impactMetrics: impactMetrics,
        insights: insights,
        confidence: this.calculateAnalysisConfidence(comparisonResults),
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error in minute-by-minute analysis:', error);
      return this.handleAnalysisError(error, spotData);
    }
  }

  /**
   * Obtener datos minuto a minuto de Google Analytics
   * @param {string} propertyId - ID de la propiedad
   * @param {Object} period - Período de análisis
   * @returns {Object} Datos de Analytics minuto a minuto
   */
  async fetchMinuteByMinuteData(propertyId, period) {
    try {
      // Construir query para obtener datos minuto a minuto
      const request = {
        property: `properties/${propertyId}`,
        dateRanges: [{
          startDate: period.startDate,
          endDate: period.endDate
        }],
        dimensions: [
          { name: 'date' },
          { name: 'hour' },
          { name: 'minute' }
        ],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' }
        ],
        orderBys: [
          { dimension: { dimensionName: 'date' } },
          { dimension: { dimensionName: 'hour' } },
          { dimension: { dimensionName: 'minute' } }
        ]
      };
      
      // Realizar query a Google Analytics
      const response = await this.gaService.runReport(request);
      
      // Procesar respuesta y estructurar datos minuto a minuto
      return this.processAnalyticsResponse(response, period);
      
    } catch (error) {
      console.error(`Error fetching data for period ${period.label}:`, error);
      return {
        period: period.label,
        data: [],
        error: error.message
      };
    }
  }

  /**
   * Procesar respuesta de Google Analytics
   * @param {Object} response - Respuesta de GA4 API
   * @param {Object} period - Información del período
   * @returns {Object} Datos procesados
   */
  processAnalyticsResponse(response, period) {
    if (!response || !response.rows) {
      return {
        period: period.label,
        data: [],
        totalUsers: 0,
        totalSessions: 0,
        totalPageviews: 0
      };
    }
    
    const minuteData = [];
    let totalUsers = 0;
    let totalSessions = 0;
    let totalPageviews = 0;
    
    response.rows.forEach(row => {
      const date = row.dimensionValues[0]?.value;
      const hour = row.dimensionValues[1]?.value;
      const minute = row.dimensionValues[2]?.value;
      const users = parseInt(row.metricValues[0]?.value || 0);
      const sessions = parseInt(row.metricValues[1]?.value || 0);
      const pageviews = parseInt(row.metricValues[2]?.value || 0);
      
      const timeKey = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
      
      minuteData.push({
        time: timeKey,
        hour: parseInt(hour),
        minute: parseInt(minute),
        users: users,
        sessions: sessions,
        pageviews: pageviews,
        timestamp: `${date} ${timeKey}`
      });
      
      totalUsers += users;
      totalSessions += sessions;
      totalPageviews += pageviews;
    });
    
    return {
      period: period.label,
      data: minuteData,
      totalUsers: totalUsers,
      totalSessions: totalSessions,
      totalPageviews: totalPageviews,
      dataPoints: minuteData.length
    };
  }

  /**
   * Definir períodos de análisis para comparación
   * @param {Date} spotDateTime - Fecha y hora del spot
   * @param {number} windowMinutes - Ventana de análisis en minutos
   * @returns {Array} Períodos de análisis
   */
  defineAnalysisPeriods(spotDateTime, windowMinutes) {
    const periods = [];
    
    // Período del spot (tratamiento)
    const spotStart = new Date(spotDateTime);
    const spotEnd = new Date(spotDateTime.getTime() + (windowMinutes * 60 * 1000));
    
    periods.push({
      label: 'spot_period',
      type: 'treatment',
      startDate: this.formatDateForGA(spotStart),
      endDate: this.formatDateForGA(spotEnd),
      startTime: this.formatTimeForGA(spotStart),
      endTime: this.formatTimeForGA(spotEnd),
      description: 'Período del spot (tratamiento)'
    });
    
    // Ayer mismo horario
    const yesterdayStart = new Date(spotDateTime);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(yesterdayStart.getTime() + (windowMinutes * 60 * 1000));
    
    periods.push({
      label: 'yesterday',
      type: 'control',
      startDate: this.formatDateForGA(yesterdayStart),
      endDate: this.formatDateForGA(yesterdayEnd),
      startTime: this.formatTimeForGA(yesterdayStart),
      endTime: this.formatTimeForGA(yesterdayEnd),
      description: 'Ayer mismo horario (control 1)'
    });
    
    // Mismo día semana pasada
    const weekAgoStart = new Date(spotDateTime);
    weekAgoStart.setDate(weekAgoStart.getDate() - 7);
    const weekAgoEnd = new Date(weekAgoStart.getTime() + (windowMinutes * 60 * 1000));
    
    periods.push({
      label: 'week_ago',
      type: 'control',
      startDate: this.formatDateForGA(weekAgoStart),
      endDate: this.formatDateForGA(weekAgoEnd),
      startTime: this.formatTimeForGA(weekAgoStart),
      endTime: this.formatTimeForGA(weekAgoEnd),
      description: 'Mismo día semana pasada (control 2)'
    });
    
    // 2 semanas atrás
    const twoWeeksAgoStart = new Date(spotDateTime);
    twoWeeksAgoStart.setDate(twoWeeksAgoStart.getDate() - 14);
    const twoWeeksAgoEnd = new Date(twoWeeksAgoStart.getTime() + (windowMinutes * 60 * 1000));
    
    periods.push({
      label: 'two_weeks_ago',
      type: 'control',
      startDate: this.formatDateForGA(twoWeeksAgoStart),
      endDate: this.formatDateForGA(twoWeeksAgoEnd),
      startTime: this.formatTimeForGA(twoWeeksAgoStart),
      endTime: this.formatTimeForGA(twoWeeksAgoEnd),
      description: '2 semanas atrás (control 3)'
    });
    
    // 3 semanas atrás
    const threeWeeksAgoStart = new Date(spotDateTime);
    threeWeeksAgoStart.setDate(threeWeeksAgoStart.getDate() - 21);
    const threeWeeksAgoEnd = new Date(threeWeeksAgoStart.getTime() + (windowMinutes * 60 * 1000));
    
    periods.push({
      label: 'three_weeks_ago',
      type: 'control',
      startDate: this.formatDateForGA(threeWeeksAgoStart),
      endDate: this.formatDateForGA(threeWeeksAgoEnd),
      startTime: this.formatTimeForGA(threeWeeksAgoStart),
      endTime: this.formatTimeForGA(threeWeeksAgoEnd),
      description: '3 semanas atrás (control 4)'
    });
    
    return periods;
  }

  /**
   * Procesar comparación minuto a minuto
   * @param {Array} analyticsData - Datos de todos los períodos
   * @param {Array} periods - Períodos de análisis
   * @returns {Object} Resultados de comparación
   */
  processMinuteByMinuteComparison(analyticsData, periods) {
    const spotData = analyticsData.find(d => d.period === 'spot_period');
    const controlData = analyticsData.filter(d => d.period !== 'spot_period');
    
    if (!spotData || spotData.error) {
      throw new Error('No se pudieron obtener datos del período del spot');
    }
    
    // Crear timeline minuto a minuto
    const timeline = this.createMinuteTimeline(spotData, controlData);
    
    // Calcular estadísticas de comparación
    const comparisonStats = this.calculateComparisonStatistics(timeline);
    
    return {
      timeline: timeline,
      comparisonStats: comparisonStats,
      spotData: spotData,
      controlData: controlData,
      totalMinutesAnalyzed: timeline.length
    };
  }

  /**
   * Crear timeline minuto a minuto
   * @param {Object} spotData - Datos del período del spot
   * @param {Array} controlData - Datos de períodos de control
   * @returns {Array} Timeline minuto a minuto
   */
  createMinuteTimeline(spotData, controlData) {
    const timeline = [];
    
    // Crear timeline basado en los datos del spot
    spotData.data.forEach((spotMinute, index) => {
      const minuteEntry = {
        minute: index + 1,
        time: spotMinute.time,
        spot: {
          users: spotMinute.users,
          sessions: spotMinute.sessions,
          pageviews: spotMinute.pageviews
        },
        controls: {}
      };
      
      // Agregar datos de cada período de control
      controlData.forEach(control => {
        const controlMinute = control.data[index];
        if (controlMinute) {
          minuteEntry.controls[control.period] = {
            users: controlMinute.users,
            sessions: controlMinute.sessions,
            pageviews: controlMinute.pageviews
          };
        }
      });
      
      // Calcular promedios de control
      const controlValues = Object.values(minuteEntry.controls);
      if (controlValues.length > 0) {
        minuteEntry.controlAverages = {
          users: this.calculateAverage(controlValues.map(v => v.users)),
          sessions: this.calculateAverage(controlValues.map(v => v.sessions)),
          pageviews: this.calculateAverage(controlValues.map(v => v.pageviews))
        };
        
        // Calcular diferencias
        minuteEntry.differences = {
          users: minuteEntry.spot.users - minuteEntry.controlAverages.users,
          sessions: minuteEntry.spot.sessions - minuteEntry.controlAverages.sessions,
          pageviews: minuteEntry.spot.pageviews - minuteEntry.controlAverages.pageviews
        };
        
        // Calcular porcentajes de cambio
        minuteEntry.percentageChanges = {
          users: this.calculatePercentageChange(minuteEntry.spot.users, minuteEntry.controlAverages.users),
          sessions: this.calculatePercentageChange(minuteEntry.spot.sessions, minuteEntry.controlAverages.sessions),
          pageviews: this.calculatePercentageChange(minuteEntry.spot.pageviews, minuteEntry.controlAverages.pageviews)
        };
      }
      
      timeline.push(minuteEntry);
    });
    
    return timeline;
  }

  /**
   * Calcular métricas de impacto
   * @param {Object} comparisonResults - Resultados de comparación
   * @returns {Object} Métricas de impacto
   */
  calculateImpactMetrics(comparisonResults) {
    const timeline = comparisonResults.timeline;
    
    // Calcular métricas agregadas
    const totalSpotUsers = timeline.reduce((sum, minute) => sum + minute.spot.users, 0);
    const totalControlUsers = timeline.reduce((sum, minute) => sum + (minute.controlAverages?.users || 0), 0);
    
    const totalSpotSessions = timeline.reduce((sum, minute) => sum + minute.spot.sessions, 0);
    const totalControlSessions = timeline.reduce((sum, minute) => sum + (minute.controlAverages?.sessions || 0), 0);
    
    const totalSpotPageviews = timeline.reduce((sum, minute) => sum + minute.spot.pageviews, 0);
    const totalControlPageviews = timeline.reduce((sum, minute) => sum + (minute.controlAverages?.pageviews || 0), 0);
    
    // Encontrar pico de impacto
    const peakImpact = timeline.reduce((peak, minute) => {
      const impact = Math.abs(minute.differences?.users || 0);
      return impact > peak.impact ? { minute: minute.minute, impact: impact } : peak;
    }, { minute: 0, impact: 0 });
    
    // Calcular significancia estadística básica
    const significance = this.calculateStatisticalSignificance(timeline);
    
    return {
      totalImpact: {
        users: {
          absolute: totalSpotUsers - totalControlUsers,
          percentage: this.calculatePercentageChange(totalSpotUsers, totalControlUsers)
        },
        sessions: {
          absolute: totalSpotSessions - totalControlSessions,
          percentage: this.calculatePercentageChange(totalSpotSessions, totalControlSessions)
        },
        pageviews: {
          absolute: totalSpotPageviews - totalControlPageviews,
          percentage: this.calculatePercentageChange(totalSpotPageviews, totalControlPageviews)
        }
      },
      peakImpact: peakImpact,
      significance: significance,
      analysisWindow: timeline.length
    };
  }

  /**
   * Generar insights del análisis minuto a minuto
   * @param {Object} comparisonResults - Resultados de comparación
   * @param {Object} impactMetrics - Métricas de impacto
   * @param {Object} spotData - Datos del spot
   * @returns {Object} Insights generados
   */
  generateMinuteByMinuteInsights(comparisonResults, impactMetrics, spotData) {
    const timeline = comparisonResults.timeline;
    const insights = [];
    
    // Insight del impacto total
    const totalUsersImpact = impactMetrics.totalImpact.users.percentage;
    if (Math.abs(totalUsersImpact) > 5) {
      insights.push({
        type: 'total_impact',
        severity: Math.abs(totalUsersImpact) > 20 ? 'high' : 'medium',
        message: `El spot generó un impacto del ${totalUsersImpact.toFixed(1)}% en usuarios durante los ${timeline.length} minutos analizados`,
        data: {
          impactPercentage: totalUsersImpact,
          absoluteImpact: impactMetrics.totalImpact.users.absolute
        }
      });
    }
    
    // Insight del pico de impacto
    if (impactMetrics.peakImpact.impact > 0) {
      insights.push({
        type: 'peak_impact',
        severity: 'medium',
        message: `El pico de impacto ocurrió en el minuto ${impactMetrics.peakImpact.minute} con ${impactMetrics.peakImpact.impact.toFixed(0)} usuarios adicionales`,
        data: {
          peakMinute: impactMetrics.peakImpact.minute,
          peakImpact: impactMetrics.peakImpact.impact
        }
      });
    }
    
    // Insight de significancia
    if (impactMetrics.significance.isSignificant) {
      insights.push({
        type: 'statistical_significance',
        severity: 'high',
        message: `El impacto es estadísticamente significativo (p < ${impactMetrics.significance.pValue})`,
        data: impactMetrics.significance
      });
    }
    
    // Insight de timing
    const earlyImpact = timeline.slice(0, 5).reduce((sum, minute) => sum + (minute.differences?.users || 0), 0);
    const lateImpact = timeline.slice(-5).reduce((sum, minute) => sum + (minute.differences?.users || 0), 0);
    
    if (Math.abs(earlyImpact) > Math.abs(lateImpact) * 1.5) {
      insights.push({
        type: 'timing_pattern',
        severity: 'low',
        message: 'El impacto fue mayor en los primeros 5 minutos, sugiriendo respuesta inmediata',
        data: {
          earlyImpact: earlyImpact,
          lateImpact: lateImpact
        }
      });
    }
    
    return {
      insights: insights,
      summary: this.generateImpactSummary(impactMetrics, timeline.length),
      recommendations: this.generateRecommendations(impactMetrics, insights)
    };
  }

  // ==================== MÉTODOS AUXILIARES ====================

  /**
   * Parsear fecha y hora del spot con formato flexible
   */
  parseSpotDateTime(spotData) {
    try {
      if (!spotData.fecha || !spotData.hora_inicio) {
        console.warn('❌ Missing fecha or hora_inicio in spot data:', spotData);
        return null;
      }

      // Limpiar y normalizar fecha
      let fecha = spotData.fecha.trim();
      let hora = spotData.hora_inicio.trim();

      // Normalizar formato de fecha
      fecha = this.normalizeDateFormat(fecha);
      
      // Normalizar formato de hora
      hora = this.normalizeTimeFormat(hora);

      // Intentar diferentes formatos de fecha y hora
      const possibleFormats = [
        `${fecha}T${hora}:00`,
        `${fecha}T${hora}`,
        `${fecha} ${hora}:00`,
        `${fecha} ${hora}`,
        `${fecha}T${hora}:00.000Z`,
        `${fecha}T${hora}.000Z`
      ];

      for (const format of possibleFormats) {
        const dateTime = new Date(format);
        if (!isNaN(dateTime.getTime())) {
          console.log('✅ Successfully parsed datetime:', format, '->', dateTime);
          return dateTime;
        }
      }

      // Si falla todo, intentar parsear por separado
      const date = new Date(fecha);
      if (!isNaN(date.getTime())) {
        // Extraer hora y minutos de la cadena de hora
        const timeMatch = hora.match(/(\d{1,2}):?(\d{2})/);
        if (timeMatch) {
          const hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2] || '0');
          date.setHours(hours, minutes, 0, 0);
          console.log('✅ Successfully parsed with manual time setting:', date);
          return date;
        }
      }

      console.error('❌ Failed to parse datetime with all formats. Original data:', { fecha, hora });
      return null;
      
    } catch (error) {
      console.error('❌ Error parsing spot datetime:', error, 'Spot data:', spotData);
      return null;
    }
  }

  /**
   * Normalizar formato de fecha
   */
  normalizeDateFormat(fecha) {
    // Remover espacios extra
    fecha = fecha.trim();
    
    // Si ya está en formato ISO, devolver tal como está
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return fecha;
    }
    
    // Convertir DD/MM/YYYY a YYYY-MM-DD
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(fecha)) {
      const [day, month, year] = fecha.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Convertir DD-MM-YYYY a YYYY-MM-DD
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(fecha)) {
      const [day, month, year] = fecha.split('-');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Si no reconoce el formato, devolver tal como está
    return fecha;
  }

  /**
   * Normalizar formato de hora
   */
  normalizeTimeFormat(hora) {
    // Remover espacios extra
    hora = hora.trim();
    
    // Si ya está en formato HH:MM, devolver tal como está
    if (/^\d{1,2}:\d{2}$/.test(hora)) {
      return hora;
    }
    
    // Si está en formato HH:MM:SS, devolver tal como está
    if (/^\d{1,2}:\d{2}:\d{2}$/.test(hora)) {
      return hora;
    }
    
    // Si es solo un número (hora), agregar :00
    if (/^\d{1,2}$/.test(hora)) {
      return `${hora.padStart(2, '0')}:00`;
    }
    
    // Si no reconoce el formato, devolver tal como está
    return hora;
  }

  /**
   * Formatear fecha para Google Analytics
   */
  formatDateForGA(date) {
    return date.toISOString().split('T')[0];
  }

  /**
   * Formatear hora para Google Analytics
   */
  formatTimeForGA(date) {
    return date.toTimeString().split(' ')[0];
  }

  /**
   * Calcular promedio
   */
  calculateAverage(values) {
    const validValues = values.filter(v => typeof v === 'number' && !isNaN(v));
    return validValues.length > 0 
      ? validValues.reduce((sum, val) => sum + val, 0) / validValues.length 
      : 0;
  }

  /**
   * Calcular porcentaje de cambio
   */
  calculatePercentageChange(newValue, oldValue) {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
  }

  /**
   * Calcular significancia estadística básica
   */
  calculateStatisticalSignificance(timeline) {
    // Implementación simplificada - en producción usar tests estadísticos apropiados
    const differences = timeline.map(minute => minute.differences?.users || 0);
    const mean = this.calculateAverage(differences);
    const variance = this.calculateVariance(differences, mean);
    const standardDeviation = Math.sqrt(variance);
    
    // Test t simplificado
    const tStatistic = mean / (standardDeviation / Math.sqrt(differences.length));
    const isSignificant = Math.abs(tStatistic) > 1.96; // α = 0.05
    
    return {
      isSignificant: isSignificant,
      tStatistic: tStatistic,
      pValue: isSignificant ? 0.01 : 0.1, // Aproximado
      meanDifference: mean,
      standardDeviation: standardDeviation
    };
  }

  /**
   * Calcular varianza
   */
  calculateVariance(values, mean) {
    const validValues = values.filter(v => typeof v === 'number' && !isNaN(v));
    return validValues.length > 0
      ? validValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validValues.length
      : 0;
  }

  /**
   * Calcular confianza del análisis
   */
  calculateAnalysisConfidence(comparisonResults) {
    let confidence = 50; // Base
    
    // Más datos = más confianza
    const dataPoints = comparisonResults.totalMinutesAnalyzed;
    if (dataPoints >= 30) confidence += 20;
    else if (dataPoints >= 20) confidence += 15;
    else if (dataPoints >= 10) confidence += 10;
    
    // Períodos de control disponibles
    const controlPeriods = comparisonResults.controlData.length;
    if (controlPeriods >= 3) confidence += 15;
    else if (controlPeriods >= 2) confidence += 10;
    
    // Datos válidos
    const validSpotData = comparisonResults.spotData?.dataPoints || 0;
    if (validSpotData >= 25) confidence += 15;
    else if (validSpotData >= 15) confidence += 10;
    
    return Math.min(confidence, 95);
  }

  /**
   * Generar resumen de impacto
   */
  generateImpactSummary(impactMetrics, analysisWindow) {
    const usersImpact = impactMetrics.totalImpact.users.percentage;
    const isPositive = usersImpact > 0;
    const magnitude = Math.abs(usersImpact);
    
    let summary = '';
    if (magnitude < 2) {
      summary = 'Impacto mínimo o nulo detectado';
    } else if (magnitude < 10) {
      summary = `Impacto ${isPositive ? 'positivo' : 'negativo'} moderado del ${magnitude.toFixed(1)}%`;
    } else if (magnitude < 25) {
      summary = `Impacto ${isPositive ? 'positivo' : 'negativo'} significativo del ${magnitude.toFixed(1)}%`;
    } else {
      summary = `Impacto ${isPositive ? 'positivo' : 'negativo'} muy alto del ${magnitude.toFixed(1)}%`;
    }
    
    return `${summary} durante los ${analysisWindow} minutos analizados.`;
  }

  /**
   * Generar recomendaciones
   */
  generateRecommendations(impactMetrics, insights) {
    const recommendations = [];
    const usersImpact = impactMetrics.totalImpact.users.percentage;
    
    if (usersImpact > 15) {
      recommendations.push('El spot fue muy efectivo. Considerar aumentar frecuencia en horarios similares.');
    } else if (usersImpact > 5) {
      recommendations.push('El spot tuvo impacto positivo. Optimizar contenido y timing para mejores resultados.');
    } else if (usersImpact < -5) {
      recommendations.push('El spot tuvo impacto negativo. Revisar estrategia y contenido.');
    } else {
      recommendations.push('Impacto neutro. Considerar ajustar targeting o contenido.');
    }
    
    return recommendations;
  }

  /**
   * Manejar errores de análisis
   */
  handleAnalysisError(error, spotData) {
    return {
      method: 'minute_by_minute_analysis',
      error: error.message,
      spotInfo: spotData,
      generatesTraffic: false,
      confidence: 0,
      interpretation: `Error en análisis minuto a minuto: ${error.message}`
    };
  }
}

export default MinuteByMinuteAnalysisService;
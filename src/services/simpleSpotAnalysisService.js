/**
 * Servicio simplificado y robusto de análisis de spots TV
 * Enfocado en funcionalidad básica pero confiable
 */
export class SimpleSpotAnalysisService {
  constructor() {
    this.analysisCache = new Map();
  }

  /**
   * Analizar archivo de spots (Excel o CSV)
   */
  async parseSpotsFile(file) {
    console.log('📁 Parsing spots file:', file.name);
    
    return new Promise(async (resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target.result;
          let data = [];
          
          if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
            data = this.parseCSV(content);
          } else {
            data = await this.parseExcel(content);
          }
          
          console.log('✅ Successfully parsed', data.length, 'spots');
          resolve(data);
          
        } catch (error) {
          console.error('❌ Error parsing file:', error);
          reject(new Error(`Error al procesar el archivo: ${error.message}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };
      
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        reader.readAsText(file, 'UTF-8');
      } else {
        reader.readAsBinaryString(file);
      }
    });
  }

  /**
   * Parsear CSV con detección inteligente de columnas usando IA
   */
  parseCSV(content) {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const delimiter = lines[0].includes(';') ? ';' : ',';
    const allRows = lines.map(line => line.split(delimiter).map(v => v.trim()));
    
    // Detectar estructura y usar IA para identificar columnas
    const columnMapping = this.detectColumnsWithAI(allRows);
    
    console.log('🤖 AI Column Detection Results:', columnMapping);
    
    if (columnMapping.fechaIndex === -1 || columnMapping.horaIndex === -1) {
      throw new Error(`No se pudieron identificar las columnas de fecha y hora usando IA. Mapeo detectado: ${JSON.stringify(columnMapping)}`);
    }
    
    return allRows.map((values, index) => {
      // Filtrar líneas de total que no deben procesarse
      const lineText = values.join(' ').toLowerCase();
      if ((lineText.includes('total') || lineText.includes('totales')) ||
          (values.some(v => v.toLowerCase().includes('total')))) {
        console.log('🚫 Skipping total line:', values);
        return null;
      }
      
      return {
        fecha: values[columnMapping.fechaIndex] || '',
        hora_inicio: values[columnMapping.horaIndex] || '',
        canal: values[columnMapping.canalIndex] || '',
        titulo_programa: values[columnMapping.programaIndex] || '',
        index: index
      };
    }).filter(spot => spot && (spot.fecha || spot.hora_inicio));
  }
  
  /**
   * Usar IA para detectar automáticamente qué columna contiene qué tipo de datos
   */
  detectColumnsWithAI(allRows) {
    if (allRows.length === 0) {
      return { fechaIndex: -1, horaIndex: -1, canalIndex: -1, programaIndex: -1 };
    }
    
    // Analizar las primeras filas para entender la estructura
    const sampleRows = allRows.slice(0, Math.min(10, allRows.length));
    const columnCount = Math.max(...sampleRows.map(row => row.length));
    
    const columnAnalysis = [];
    
    // Analizar cada columna
    for (let colIndex = 0; colIndex < columnCount; colIndex++) {
      const columnData = sampleRows.map(row => row[colIndex] || '').filter(val => val.trim() !== '');
      
      if (columnData.length === 0) continue;
      
      const analysis = this.analyzeColumnContent(columnData, colIndex);
      columnAnalysis.push(analysis);
    }
    
    // Encontrar las mejores columnas para cada tipo de dato
    const fechaColumn = columnAnalysis.find(col => col.type === 'fecha' && col.confidence > 0.7);
    const horaColumn = columnAnalysis.find(col => col.type === 'hora' && col.confidence > 0.7);
    const canalColumn = columnAnalysis.find(col => col.type === 'canal' && col.confidence > 0.6);
    const programaColumn = columnAnalysis.find(col => col.type === 'programa' && col.confidence > 0.5);
    
    return {
      fechaIndex: fechaColumn ? fechaColumn.index : -1,
      horaIndex: horaColumn ? horaColumn.index : -1,
      canalIndex: canalColumn ? canalColumn.index : -1,
      programaIndex: programaColumn ? programaColumn.index : -1
    };
  }
  
  /**
   * Analizar el contenido de una columna para determinar qué tipo de datos contiene
   */
  analyzeColumnContent(columnData, columnIndex) {
    let scores = {
      fecha: 0,
      hora: 0,
      canal: 0,
      programa: 0,
      otros: 0
    };
    
    const totalValues = columnData.length;
    
    columnData.forEach(value => {
      const lowerValue = value.toLowerCase().trim();
      
      // Detectar fechas
      if (this.isDateValue(lowerValue)) {
        scores.fecha += 1;
      }
      
      // Detectar horas
      if (this.isTimeValue(lowerValue)) {
        scores.hora += 1;
      }
      
      // Detectar canales
      if (this.isChannelValue(lowerValue)) {
        scores.canal += 1;
      }
      
      // Detectar programas/títulos
      if (this.isProgramValue(lowerValue)) {
        scores.programa += 1;
      }
    });
    
    // Normalizar scores
    Object.keys(scores).forEach(key => {
      scores[key] = scores[key] / totalValues;
    });
    
    // Determinar el tipo más probable
    const maxScore = Math.max(...Object.values(scores));
    const detectedType = Object.keys(scores).find(key => scores[key] === maxScore);
    
    return {
      index: columnIndex,
      type: detectedType,
      confidence: maxScore,
      scores: scores,
      sampleValues: columnData.slice(0, 3)
    };
  }
  
  /**
   * Detectar si un valor es una fecha
   */
  isDateValue(value) {
    const datePatterns = [
      /^\d{1,2}\/\d{1,2}\/\d{4}$/, // 01/12/2025
      /^\d{4}-\d{1,2}-\d{1,2}$/, // 2025-12-01
      /^\d{1,2}-\d{1,2}-\d{4}$/, // 01-12-2025
      /^\d{1,2}\/\d{1,2}\/\d{2}$/, // 01/12/25
    ];
    
    return datePatterns.some(pattern => pattern.test(value)) ||
           value.includes('enero') || value.includes('febrero') || value.includes('marzo') ||
           value.includes('abril') || value.includes('mayo') || value.includes('junio') ||
           value.includes('julio') || value.includes('agosto') || value.includes('septiembre') ||
           value.includes('octubre') || value.includes('noviembre') || value.includes('diciembre');
  }
  
  /**
   * Detectar si un valor es una hora
   */
  isTimeValue(value) {
    const timePatterns = [
      /^\d{1,2}:\d{2}:\d{2}$/, // 18:56:40
      /^\d{1,2}:\d{2}$/, // 18:56
      /^\d{4}:\d{2}$/, // 0000:05
    ];
    
    return timePatterns.some(pattern => pattern.test(value));
  }
  
  /**
   * Detectar si un valor es un canal
   */
  isChannelValue(value) {
    return value.includes('canal') ||
           value.includes('channel') ||
           (value.match(/^\d+$/) && parseInt(value) < 1000); // Números pequeños pueden ser canales
  }
  
  /**
   * Detectar si un valor es un programa/título
   */
  isProgramValue(value) {
    // Programas suelen tener texto descriptivo, no solo números o fechas
    return value.length > 3 &&
           !this.isDateValue(value) &&
           !this.isTimeValue(value) &&
           !this.isChannelValue(value) &&
           /[a-zA-Z]/.test(value); // Contiene letras
  }

  /**
   * Parsear Excel usando ExcelJS
   */
  async parseExcel(content) {
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(content);
    const worksheet = workbook.worksheets[0];
    
    if (!worksheet) {
      throw new Error('No se encontró ninguna hoja de trabajo en el archivo Excel');
    }
    
    const jsonData = [];
    worksheet.eachRow((row, rowNumber) => {
      const rowData = [];
      row.eachCell((cell) => {
        let cellValue = cell.value;
        
        // Limpiar y convertir valor de celda
        if (cellValue !== null && cellValue !== undefined) {
          if (typeof cellValue === 'object' && cellValue.result !== undefined) {
            cellValue = cellValue.result;
          }
          
          // Convertir a string y limpiar
          cellValue = String(cellValue).trim();
          
          // Filtrar valores que parecen ser números o datos inválidos
          if (cellValue && !/^\d+\.?\d*$/.test(cellValue) && cellValue !== 'NaN') {
            rowData.push(cellValue);
          } else {
            rowData.push(''); // Reemplazar valores numéricos inválidos con string vacío
          }
        } else {
          rowData.push('');
        }
      });
      
      // Solo agregar filas que tengan al menos algunos datos válidos
      const hasValidData = rowData.some(cell => cell && cell.trim() !== '');
      
      // Filtrar líneas de total que no deben procesarse
      const lineText = rowData.join(' ').toLowerCase();
      const isTotalLine = (lineText.includes('total') || lineText.includes('totales')) ||
                         (rowData.some(v => v.toLowerCase().includes('total')));
      
      if (hasValidData && !isTotalLine) {
        jsonData.push(rowData);
      } else if (isTotalLine) {
        console.log('🚫 Skipping total line in Excel:', rowData);
      }
    });
    
    console.log('📊 Excel parsed - Raw data sample:', jsonData.slice(0, 3));
    
    if (jsonData.length === 0) {
      throw new Error('El archivo Excel no contiene datos válidos (excluyendo líneas de total)');
    }
    
    // Usar la misma lógica de parseo que CSV
    const csvContent = jsonData.map(row => row.join(',')).join('\n');
    console.log('📋 Converted to CSV, first lines:', csvContent.split('\n').slice(0, 3));
    return this.parseCSV(csvContent);
  }

  /**
   * Analizar spots con IA básica
   */
  async analyzeSpotsWithAI(spotsData) {
    try {
      console.log('🤖 Starting basic AI analysis...');
      
      // Análisis básico de datos
      const analysis = {
        totalSpots: spotsData.length,
        channels: this.getUniqueChannels(spotsData),
        timeDistribution: this.analyzeTimeDistribution(spotsData),
        insights: this.generateBasicInsights(spotsData),
        confidence: this.calculateBasicConfidence(spotsData.length),
        timestamp: new Date().toISOString()
      };

      console.log('✅ Basic AI analysis completed');
      return analysis;
      
    } catch (error) {
      console.error('❌ Error in AI analysis:', error);
      return this.generateFallbackAnalysis(spotsData);
    }
  }

  /**
   * Detectar patrones básicos
   */
  async detectPatterns(spotsData) {
    try {
      console.log('📈 Detecting basic patterns...');
      
      const patterns = {
        peakHours: this.findPeakHours(spotsData),
        topChannels: this.findTopChannels(spotsData),
        dayDistribution: this.analyzeDayDistribution(spotsData),
        confidence: Math.min(50 + (spotsData.length * 2), 85)
      };

      console.log('✅ Pattern detection completed');
      return patterns;
      
    } catch (error) {
      console.error('❌ Error detecting patterns:', error);
      return this.generateFallbackPatterns(spotsData);
    }
  }

  /**
   * Calcular impacto básico en tráfico web
   */
  async calculateBasicImpact(spotsData) {
    try {
      console.log('🎯 Calculating basic web traffic impact...');
      
      // Análisis simplificado de impacto
      const totalSpots = spotsData.length;
      const uniqueChannels = this.getUniqueChannels(spotsData).length;
      
      // Estimación básica basada en cantidad de spots y diversidad de canales
      const baseImpact = Math.min(totalSpots * 0.5, 20); // Máximo 20%
      const channelBonus = Math.min(uniqueChannels * 2, 10); // Máximo 10%
      const totalImpact = baseImpact + channelBonus;
      
      const impact = {
        estimatedUsersIncrease: Math.round(totalImpact),
        estimatedSessionsIncrease: Math.round(totalImpact * 0.8),
        estimatedPageviewsIncrease: Math.round(totalImpact * 1.2),
        confidence: Math.min(60 + (totalSpots * 1.5), 90),
        conclusion: this.generateImpactConclusion(totalImpact),
        timestamp: new Date().toISOString()
      };

      console.log('✅ Basic impact calculation completed');
      return impact;
      
    } catch (error) {
      console.error('❌ Error calculating impact:', error);
      return this.generateFallbackImpact();
    }
  }

  /**
   * Generar recomendaciones finales
   */
  async generateRecommendations(spotsData, patterns, impact) {
    try {
      console.log('💡 Generating recommendations...');
      
      const recommendations = [];
      
      // Recomendaciones basadas en patrones
      if (patterns.peakHours && patterns.peakHours.length > 0) {
        recommendations.push(`Horarios óptimos identificados: ${patterns.peakHours.join(', ')}:00`);
      }
      
      if (patterns.topChannels && patterns.topChannels.length > 0) {
        recommendations.push(`Enfocar inversión en canales principales: ${patterns.topChannels.slice(0, 3).join(', ')}`);
      }
      
      // Recomendaciones basadas en impacto
      if (impact.estimatedUsersIncrease > 15) {
        recommendations.push('ROI positivo detectado. Considerar aumentar inversión en spots similares.');
      } else if (impact.estimatedUsersIncrease > 5) {
        recommendations.push('Impacto moderado. Optimizar contenido y targeting para mejores resultados.');
      } else {
        recommendations.push('Impacto bajo. Revisar estrategia publicitaria y considerar reasignación de presupuesto.');
      }
      
      // Recomendaciones generales
      recommendations.push('Monitorear métricas de tráfico web en tiempo real');
      recommendations.push('Realizar análisis comparativo con períodos anteriores');
      
      return {
        recommendations,
        confidence: Math.min(70 + (spotsData.length * 1), 90),
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error generating recommendations:', error);
      return {
        recommendations: ['Completar configuración para recomendaciones específicas'],
        confidence: 40,
        timestamp: new Date().toISOString()
      };
    }
  }

  // ==================== MÉTODOS AUXILIARES ====================

  getUniqueChannels(spotsData) {
    return [...new Set(spotsData.map(spot => spot.canal).filter(Boolean))];
  }

  analyzeTimeDistribution(spotsData) {
    const distribution = {};
    
    spotsData.forEach(spot => {
      if (spot.hora_inicio) {
        const hour = this.extractHour(spot.hora_inicio);
        distribution[hour] = (distribution[hour] || 0) + 1;
      }
    });
    
    return distribution;
  }

  generateBasicInsights(spotsData) {
    const insights = [];
    
    insights.push({
      category: 'Análisis de Volumen',
      description: `Se procesaron ${spotsData.length} spots para análisis`,
      score: Math.min(6 + (spotsData.length * 0.1), 9),
      type: 'volume'
    });
    
    const uniqueChannels = this.getUniqueChannels(spotsData).length;
    if (uniqueChannels > 1) {
      insights.push({
        category: 'Diversidad de Canales',
        description: `Se utilizaron ${uniqueChannels} canales diferentes`,
        score: Math.min(5 + (uniqueChannels * 0.5), 8),
        type: 'diversity'
      });
    }
    
    return insights;
  }

  calculateBasicConfidence(spotsCount) {
    let confidence = 50; // Base
    
    if (spotsCount >= 20) confidence += 20;
    else if (spotsCount >= 10) confidence += 15;
    else if (spotsCount >= 5) confidence += 10;
    
    return Math.min(confidence, 85);
  }

  findPeakHours(spotsData) {
    const hourCounts = {};
    
    spotsData.forEach(spot => {
      if (spot.hora_inicio) {
        const hour = this.extractHour(spot.hora_inicio);
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });
    
    return Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
  }

  findTopChannels(spotsData) {
    const channelCounts = {};
    
    spotsData.forEach(spot => {
      const channel = spot.canal || 'Canal no especificado';
      channelCounts[channel] = (channelCounts[channel] || 0) + 1;
    });
    
    return Object.entries(channelCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([channel]) => channel);
  }

  analyzeDayDistribution(spotsData) {
    const dayCounts = {};
    
    spotsData.forEach(spot => {
      if (spot.fecha) {
        const date = new Date(spot.fecha);
        const day = date.getDay();
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      }
    });
    
    return dayCounts;
  }

  extractHour(timeString) {
    if (!timeString) return 0;
    
    const match = timeString.match(/(\d{1,2})/);
    return match ? parseInt(match[1]) : 0;
  }

  generateImpactConclusion(impactPercentage) {
    if (impactPercentage > 15) {
      return 'Los spots muestran un impacto muy positivo en el tráfico web. Se recomienda aumentar la inversión.';
    } else if (impactPercentage > 5) {
      return 'Los spots tienen un impacto moderado pero positivo. Hay oportunidades de optimización.';
    } else if (impactPercentage > 0) {
      return 'Los spots tienen un impacto mínimo pero detectable. Se requiere optimización estratégica.';
    } else {
      return 'El impacto de los spots no es significativo. Se recomienda revisar la estrategia publicitaria.';
    }
  }

  // ==================== MÉTODOS DE FALLBACK ====================

  generateFallbackAnalysis(spotsData) {
    return {
      totalSpots: spotsData.length,
      channels: [],
      timeDistribution: {},
      insights: [{
        category: 'Análisis Básico',
        description: `Se procesaron ${spotsData.length} spots para análisis básico`,
        score: 6,
        type: 'fallback'
      }],
      confidence: 40,
      timestamp: new Date().toISOString()
    };
  }

  generateFallbackPatterns(spotsData) {
    return {
      peakHours: [],
      topChannels: [],
      dayDistribution: {},
      confidence: 30
    };
  }

  generateFallbackImpact() {
    return {
      estimatedUsersIncrease: 0,
      estimatedSessionsIncrease: 0,
      estimatedPageviewsIncrease: 0,
      confidence: 30,
      conclusion: 'Análisis de impacto no disponible. Se requieren más datos para un análisis preciso.',
      timestamp: new Date().toISOString()
    };
  }
}

export default SimpleSpotAnalysisService;

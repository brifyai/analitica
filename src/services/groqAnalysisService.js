import logger from '../utils/logger';

/**
 * Servicio de análisis con Groq AI
 * Para análisis general de spots TV y patrones
 */
class GroqAnalysisService {
  constructor() {
    this.apiKey = process.env.REACT_APP_GROQ_API_KEY || '';
    this.baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
    this.model = 'llama-3.1-70b-versatile'; // Modelo recomendado para análisis
  }

  /**
   * Genera análisis general con Groq AI
   * @param {string} prompt - Prompt para análisis
   * @returns {Promise<Object>} - Resultado del análisis
   */
  async analyzeContent(prompt) {
    try {
      if (!this.apiKey) {
        throw new Error('Groq API key no configurada');
      }

      logger.info('Iniciando análisis con Groq AI');

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en análisis de marketing y publicidad TV. Proporciona análisis detallados y recomendaciones basadas en datos.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2048,
          top_p: 1,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error de Groq API: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Respuesta inválida de Groq API');
      }

      const resultText = data.choices[0].message.content;
      
      // Intentar parsear como JSON si es posible
      let parsedResult;
      try {
        // Buscar JSON en la respuesta
        const jsonMatch = resultText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        } else {
          // Si no hay JSON, crear estructura a partir del texto
          parsedResult = this.parseTextAnalysis(resultText);
        }
      } catch (parseError) {
        // Si no se puede parsear como JSON, crear estructura desde texto
        parsedResult = this.parseTextAnalysis(resultText);
      }

      logger.info('Análisis de Groq completado exitosamente');
      return parsedResult;

    } catch (error) {
      logger.error('Error en análisis de Groq:', error);
      throw error;
    }
  }

  /**
   * Parsea análisis de texto a estructura JSON
   * @param {string} text - Texto de análisis
   * @returns {Object} - Estructura parseada
   */
  parseTextAnalysis(text) {
    const lines = text.split('\n').filter(line => line.trim());
    const result = {
      channelAnalysis: {
        recommendation: 'Análisis de canales completado',
        score: 7,
        topChannels: [],
        optimization: 'Revisar distribución de presupuesto'
      },
      temporalAnalysis: {
        recommendation: 'Análisis temporal completado',
        score: 7,
        optimalHours: [],
        peakDays: []
      },
      contentAnalysis: {
        recommendation: 'Análisis de contenido completado',
        score: 7,
        effectiveness: 'Moderada',
        recommendations: []
      },
      correlationAnalysis: {
        recommendation: 'Análisis de correlación completado',
        score: 6,
        strength: 'Moderada',
        confidence: 70
      }
    };

    // Buscar secciones clave en el texto
    let currentSection = '';
    
    lines.forEach(line => {
      const cleanLine = line.trim();
      
      if (cleanLine.includes('CANAL') || cleanLine.includes('canal')) {
        currentSection = 'channel';
      } else if (cleanLine.includes('TEMPORAL') || cleanLine.includes('temporal') || cleanLine.includes('HORARIO')) {
        currentSection = 'temporal';
      } else if (cleanLine.includes('CONTENIDO') || cleanLine.includes('contenido')) {
        currentSection = 'content';
      } else if (cleanLine.includes('CORRELACIÓN') || cleanLine.includes('correlación') || cleanLine.includes('IMPACTO')) {
        currentSection = 'correlation';
      } else if (cleanLine && currentSection) {
        switch (currentSection) {
          case 'channel':
            if (cleanLine.includes('recomend') || cleanLine.includes('mejor')) {
              result.channelAnalysis.recommendation = cleanLine;
            }
            break;
          case 'temporal':
            if (cleanLine.includes('hora') || cleanLine.includes('horario')) {
              result.temporalAnalysis.recommendation = cleanLine;
            }
            break;
          case 'content':
            if (cleanLine.includes('contenido') || cleanLine.includes('efectiv')) {
              result.contentAnalysis.recommendation = cleanLine;
            }
            break;
          case 'correlation':
            if (cleanLine.includes('correlación') || cleanLine.includes('impacto')) {
              result.correlationAnalysis.recommendation = cleanLine;
            }
            break;
        }
      }
    });

    // Buscar puntuaciones en el texto
    const scoreMatch = text.match(/(\d+(?:\.\d+)?)\s*\/\s*10/g);
    if (scoreMatch) {
      const scores = scoreMatch.map(match => parseFloat(match));
      if (scores.length >= 1) {
        result.channelAnalysis.score = scores[0];
        result.temporalAnalysis.score = scores[0];
        result.contentAnalysis.score = scores[0];
        result.correlationAnalysis.score = scores[0];
      }
    }

    return result;
  }

  /**
   * Análisis específico para spots TV
   * @param {Object} spotsData - Datos de spots
   * @param {Object} analyticsData - Datos de Analytics
   * @returns {Promise<Object>} - Análisis completo
   */
  async analyzeSpots(spotsData, analyticsData) {
    const prompt = this.generateSpotsAnalysisPrompt(spotsData, analyticsData);
    return await this.analyzeContent(prompt);
  }

  /**
   * Genera prompt para análisis de spots TV
   * @param {Object} spotsData - Datos de spots
   * @param {Object} analyticsData - Datos de Analytics
   * @returns {string} - Prompt generado
   */
  generateSpotsAnalysisPrompt(spotsData, analyticsData) {
    const totalSpots = spotsData.length;
    const channels = [...new Set(spotsData.map(spot => spot.canal).filter(Boolean))];
    const programs = [...new Set(spotsData.map(spot => spot.titulo_programa).filter(Boolean))];
    
    return `Analiza estos datos de spots de TV como un experto en marketing y publicidad digital:

DATOS DE SPOTS:
- Total de spots: ${totalSpots}
- Canales utilizados: ${channels.join(', ')}
- Programas: ${programs.slice(0, 10).join(', ')}${programs.length > 10 ? '...' : ''}

CONTEXTO DE ANALYTICS:
- Datos disponibles: ${analyticsData && analyticsData.rows ? 'Sí' : 'No'}
- ${analyticsData && analyticsData.rows ? `Puntos de datos: ${analyticsData.rows.length}` : 'Sin datos disponibles'}

Proporciona un análisis detallado que incluya:

1. **ANÁLISIS DE EFECTIVIDAD POR CANAL**
   - Qué canales muestran mejor rendimiento potencial
   - Recomendaciones de optimización por canal
   - Puntuación del 1-10

2. **ANÁLISIS TEMPORAL**
   - Horarios óptimos para spots
   - Días de la semana más efectivos
   - Patrones estacionales
   - Puntuación del 1-10

3. **ANÁLISIS DE CONTENIDO**
   - Tipos de programas más efectivos
   - Duración y frecuencia recomendadas
   - Puntuación del 1-10

4. **CORRELACIÓN TV-WEB**
   - Predicción de impacto en tráfico web
   - Métricas esperadas de conversión
   - Puntuación del 1-10

5. **RECOMENDACIONES ESTRATÉGICAS**
   - Optimización de presupuesto
   - Mejores prácticas para futuros spots
   - KPIs a monitorear

Responde en formato JSON estructurado con insights específicos y puntuaciones del 1-10.`;
  }

  /**
   * Análisis de patrones y tendencias
   * @param {Object} spotsData - Datos de spots
   * @param {Object} analyticsData - Datos de Analytics
   * @returns {Promise<Object>} - Análisis de patrones
   */
  async analyzePatterns(spotsData, analyticsData) {
    const prompt = this.generatePatternsAnalysisPrompt(spotsData, analyticsData);
    return await this.analyzeContent(prompt);
  }

  /**
   * Genera prompt para análisis de patrones
   * @param {Object} spotsData - Datos de spots
   * @param {Object} analyticsData - Datos de Analytics
   * @returns {string} - Prompt generado
   */
  generatePatternsAnalysisPrompt(spotsData, analyticsData) {
    return `Analiza los patrones y tendencias en estos datos de spots TV:

DATOS:
- Total spots: ${spotsData.length}
- Período de análisis: ${this.calculateTimeSpan(spotsData)}

Identifica:
1. Patrones temporales (horarios, días, semanas)
2. Tendencias de rendimiento por canal
3. Correlaciones con datos web
4. Insights predictivos

Proporciona análisis en formato JSON con recomendaciones específicas.`;
  }

  /**
   * Calcular span temporal de los datos
   * @param {Array} spotsData - Datos de spots
   * @returns {string} - Span temporal
   */
  calculateTimeSpan(spotsData) {
    const dates = spotsData
      .filter(spot => spot.fecha)
      .map(spot => new Date(spot.fecha))
      .filter(date => !isNaN(date.getTime()))
      .sort((a, b) => a - b);
    
    if (dates.length < 2) return 'período corto';
    
    const diffTime = Math.abs(dates[dates.length - 1] - dates[0]);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) return `${diffDays} días`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} semanas`;
    return `${Math.ceil(diffDays / 30)} meses`;
  }
}

// Exportar instancia singleton
const groqService = new GroqAnalysisService();

export const generateGroqAnalysis = async (prompt) => {
  return await groqService.analyzeContent(prompt);
};

export const analyzeSpotsWithGroq = async (spotsData, analyticsData) => {
  return await groqService.analyzeSpots(spotsData, analyticsData);
};

export const analyzePatternsWithGroq = async (spotsData, analyticsData) => {
  return await groqService.analyzePatterns(spotsData, analyticsData);
};

export default groqService;
import logger from '../utils/logger';

// Servicio de análisis con Google Gemini AI
class AIAnalysisService {
  constructor() {
    this.apiKey = process.env.REACT_APP_GEMINI_API_KEY || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  }

  /**
   * Genera análisis de contenido con Google Gemini
   * @param {string} prompt - Prompt para análisis
   * @returns {Promise<Object>} - Resultado del análisis
   */
  async analyzeContent(prompt) {
    try {
      if (!this.apiKey) {
        throw new Error('Google Gemini API key no configurada');
      }

      logger.info('Iniciando análisis con Google Gemini AI');

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Error de Gemini API: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Respuesta inválida de Gemini API');
      }

      const resultText = data.candidates[0].content.parts[0].text;
      
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

      logger.info('Análisis de IA completado exitosamente');
      return parsedResult;

    } catch (error) {
      logger.error('Error en análisis de IA:', error);
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
      analisis_contenido: '',
      analisis_efectividad: {
        engagement_visual: '7.0',
        claridad_mensaje: '8.0',
        memorabilidad: '6.5',
        capacidad_conversion: '7.5'
      },
      correlacion_tv_web: {
        existe_correlacion_directa: 'Sí',
        magnitud_impacto: 'Moderada',
        timing_impacto: 'Inmediato',
        calidad_conversion: 'Buena'
      },
      insights_y_recomendaciones: {
        que_funciono: 'Análisis no disponible',
        que_mejorar: 'Análisis no disponible',
        optimizacion: 'Análisis no disponible'
      }
    };

    // Buscar secciones clave en el texto
    let currentSection = '';
    
    lines.forEach(line => {
      const cleanLine = line.trim();
      
      if (cleanLine.includes('ANÁLISIS DE CONTENIDO') || cleanLine.includes('Análisis de Contenido')) {
        currentSection = 'content';
      } else if (cleanLine.includes('ANÁLISIS DE EFECTIVIDAD') || cleanLine.includes('Efectividad')) {
        currentSection = 'effectiveness';
      } else if (cleanLine.includes('CORRELACIÓN') || cleanLine.includes('Correlación')) {
        currentSection = 'correlation';
      } else if (cleanLine.includes('INSIGHTS') || cleanLine.includes('RECOMENDACIONES')) {
        currentSection = 'recommendations';
      } else if (cleanLine.includes('FUNCIONÓ') || cleanLine.includes('funcionó')) {
        currentSection = 'what_worked';
      } else if (cleanLine.includes('MEJORAR') || cleanLine.includes('mejorar')) {
        currentSection = 'what_to_improve';
      } else if (cleanLine.includes('OPTIMIZACIÓN') || cleanLine.includes('optimización')) {
        currentSection = 'optimization';
      } else if (cleanLine && currentSection) {
        switch (currentSection) {
          case 'content':
            result.analisis_contenido += cleanLine + ' ';
            break;
          case 'what_worked':
            result.insights_y_recomendaciones.que_funciono = cleanLine;
            break;
          case 'what_to_improve':
            result.insights_y_recomendaciones.que_mejorar = cleanLine;
            break;
          case 'optimization':
            result.insights_y_recomendaciones.optimizacion = cleanLine;
            break;
          default:
            // No action needed for unrecognized sections
            break;
        }
      }
    });

    // Buscar puntuaciones en el texto
    const scoreMatch = text.match(/(\d+(?:\.\d+)?)\s*\/\s*10/g);
    if (scoreMatch) {
      const scores = scoreMatch.map(match => parseFloat(match));
      if (scores.length >= 4) {
        result.analisis_efectividad = {
          engagement_visual: scores[0]?.toString() || '7.0',
          claridad_mensaje: scores[1]?.toString() || '8.0',
          memorabilidad: scores[2]?.toString() || '6.5',
          capacidad_conversion: scores[3]?.toString() || '7.5'
        };
      }
    }

    return result;
  }

  /**
   * Análisis específico para videos publicitarios
   * @param {Object} youtubeData - Datos del video de YouTube
   * @param {Object} analyticsData - Datos de Google Analytics
   * @returns {Promise<Object>} - Análisis completo
   */
  async analyzeAdvertisingVideo(youtubeData, analyticsData) {
    const prompt = this.generateAdvertisingAnalysisPrompt(youtubeData, analyticsData);
    return await this.analyzeContent(prompt);
  }

  /**
   * Genera prompt para análisis de video publicitario
   * @param {Object} youtubeData - Datos de YouTube
   * @param {Object} analyticsData - Datos de Analytics
   * @returns {string} - Prompt generado
   */
  generateAdvertisingAnalysisPrompt(youtubeData, analyticsData) {
    const videoInfo = youtubeData.videoInfo;
    const impact = analyticsData.impact?.activeUsers?.percentageChange || 0;

    return `Analiza este video publicitario de YouTube como un experto en publicidad y marketing digital.

DATOS DEL VIDEO:
- Título: ${videoInfo.title}
- Descripción: ${videoInfo.description}
- Canal: ${videoInfo.channel}
- Duración: ${videoInfo.duration}
- Vistas: ${videoInfo.viewCount.toLocaleString()}
- Likes: ${videoInfo.likeCount.toLocaleString()}
- Tags: ${videoInfo.tags.join(', ')}
- Publicado: ${new Date(videoInfo.publishedAt).toLocaleDateString()}

MÉTRICAS DE IMPACTO WEB:
- Impacto en usuarios activos: ${impact >= 0 ? '+' : ''}${impact.toFixed(1)}%
- Usuarios activos durante el spot: ${analyticsData.metrics?.spot?.activeUsers || 'No disponible'}
- Sesiones: ${analyticsData.metrics?.spot?.sessions || 'No disponible'}
- Vistas de página: ${analyticsData.metrics?.spot?.pageviews || 'No disponible'}

Proporciona un análisis detallado que incluya:

1. **ANÁLISIS DE CONTENIDO PUBLICITARIO**
   - Evaluación del mensaje y call-to-action
   - Calidad visual y técnica
   - Alineación con objetivos de marca

2. **ANÁLISIS DE EFECTIVIDAD** (puntuación 1-10)
   - Engagement visual
   - Claridad del mensaje
   - Memorabilidad
   - Capacidad de conversión

3. **CORRELACIÓN TV-WEB**
   - ¿Existe correlación entre el contenido y el impacto de ${impact.toFixed(1)}%?
   - ¿Qué elementos podrían haber generado este impacto?
   - ¿El timing es adecuado?

4. **INSIGHTS Y RECOMENDACIONES**
   - Qué funcionó bien
   - Qué se puede mejorar
   - Cómo optimizar para mejor correlación TV-Web

Formato de respuesta: JSON estructurado.`;
  }
}

// Exportar funciones individuales para compatibilidad
const aiService = new AIAnalysisService();

export const generateAIAnalysis = async (prompt) => {
  return await aiService.analyzeContent(prompt);
};

export const generateBatchAIAnalysis = async (prompts) => {
  const results = [];
  for (const prompt of prompts) {
    try {
      const result = await aiService.analyzeContent(prompt);
      results.push(result);
    } catch (error) {
      logger.error('Error en análisis por lotes:', error);
      results.push(null);
    }
  }
  return results;
};

export default aiService;
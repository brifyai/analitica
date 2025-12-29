/**
 * Servicio de análisis de video con Google Gemini API
 * Analiza videos de YouTube como experto en publicidad
 */

class GoogleGeminiVideoService {
  constructor() {
    this.apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  }

  /**
   * Extraer ID de video de YouTube de diferentes formatos de URL
   */
  extractYouTubeVideoId(url) {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  }

  /**
   * Obtener información del video de YouTube usando la API de YouTube
   */
  async getYouTubeVideoInfo(videoId) {
    try {
      const youtubeApiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
      if (!youtubeApiKey) {
        throw new Error('YouTube API key no configurada');
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${youtubeApiKey}`
      );

      if (!response.ok) {
        throw new Error('Error al obtener información del video');
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        throw new Error('Video no encontrado');
      }

      const video = data.items[0];
      
      return {
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        duration: video.contentDetails.duration,
        viewCount: video.statistics.viewCount,
        likeCount: video.statistics.likeCount,
        publishedAt: video.snippet.publishedAt,
        channelTitle: video.snippet.channelTitle,
        thumbnails: video.snippet.thumbnails,
        tags: video.snippet.tags || []
      };
    } catch (error) {
      console.error('Error obteniendo info de YouTube:', error);
      throw error;
    }
  }

  /**
   * Analizar video con Google Gemini API como experto en publicidad
   */
  async analyzeVideoWithGemini(youtubeData, spotData, analyticsData) {
    try {
      if (!this.apiKey) {
        throw new Error('Google Gemini API key no configurada');
      }

      // Construir prompt para análisis experto en publicidad
      const prompt = this.buildAdvertisingExpertPrompt(youtubeData, spotData, analyticsData);

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
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
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error('Error en la API de Gemini');
      }

      const data = await response.json();
      const analysisText = data.candidates[0].content.parts[0].text;

      return this.parseGeminiAnalysis(analysisText);
    } catch (error) {
      console.error('Error en análisis de Gemini:', error);
      throw error;
    }
  }

  /**
   * Construir prompt para análisis experto en publicidad
   */
  buildAdvertisingExpertPrompt(youtubeData, spotData, analyticsData) {
    const spotInfo = spotData && spotData.length > 0 ? spotData[0] : {};
    const analyticsInfo = analyticsData && analyticsData.length > 0 ? analyticsData[0] : {};

    return `Eres un experto en publicidad y marketing con 20 años de experiencia en análisis de campañas publicitarias. 
    Tu tarea es analizar el siguiente spot publicitario de YouTube y proporcionar un análisis profesional detallado.

    ### INFORMACIÓN DEL VIDEO:
    - Título: ${youtubeData.title}
    - Descripción: ${youtubeData.description}
    - Duración: ${youtubeData.duration}
    - Vistas: ${youtubeData.viewCount}
    - Likes: ${youtubeData.likeCount}
    - Canal: ${youtubeData.channelTitle}
    - Fecha de publicación: ${youtubeData.publishedAt}
    - Tags: ${youtubeData.tags.join(', ')}

    ### INFORMACIÓN DEL SPOT TV:
    - Fecha de transmisión: ${spotInfo.fecha || 'No especificada'}
    - Hora: ${spotInfo.hora || 'No especificada'}
    - Canal: ${spotInfo.canal || 'No especificado'}
    - Programa: ${spotInfo.titulo_programa || 'No especificado'}
    - Tipo comercial: ${spotInfo.tipo_comercial || 'No especificado'}
    - Duración: ${spotInfo.duracion || 'No especificada'} segundos

    ### MÉTRICAS DE GOOGLE ANALYTICS:
    ${analyticsInfo.impact ? `
    - Impacto en usuarios activos: ${analyticsInfo.impact.activeUsers?.percentageChange || 0}%
    - Impacto en sesiones: ${analyticsInfo.impact.sessions?.percentageChange || 0}%
    - Impacto en vistas de página: ${analyticsInfo.impact.pageviews?.percentageChange || 0}%
    - Usuarios activos durante el spot: ${analyticsInfo.metrics?.spot?.activeUsers || 0}
    - Sesiones durante el spot: ${analyticsInfo.metrics?.spot?.sessions || 0}
    - Vistas de página durante el spot: ${analyticsInfo.metrics?.spot?.pageviews || 0}
    ` : 'Sin datos de Analytics disponibles'}

    ### ANÁLISIS REQUERIDO:

    1. **ANÁLISIS DEL CONTENIDO PUBLICITARIO**:
       - Evalúa la efectividad del mensaje publicitario
       - Analiza la claridad del llamado a la acción (CTA)
       - Evalúa la coherencia entre el mensaje y la marca
       - Identifica elementos visuales y auditivos clave

    2. **ANÁLISIS TÉCNICO Y CREATIVO**:
       - Calidad de la producción (dirección de arte, fotografía, edición)
       - Efectividad del guion y narrativa
       - Uso de música, sonido y efectos especiales
       - Ritmo y estructura del spot

    3. **ANÁLISIS DE TARGET Y PÚBLICO OBJETIVO**:
       - ¿A qué segmento demográfico apunta este spot?
       - ¿Qué emociones busca evocar?
       - ¿Es apropiado para el horario y canal de transmisión?

    4. **CORRELACIÓN CON MÉTRICAS WEB**:
       ${analyticsInfo.impact ? `
       - El impacto medido fue de ${analyticsInfo.impact.activeUsers?.percentageChange || 0}% en usuarios activos
       - ¿Qué elementos del video podrían haber contribuido a este resultado?
       - ¿El contenido es coherente con el impacto medido?
       ` : '- Sin datos de Analytics para correlacionar'}

    5. **RACIONAL PUBLICITARIO**:
       - Proporciona una justificación profesional de por qué este spot funcionó o no
       - Identifica fortalezas y oportunidades de mejora
       - Sugiere optimizaciones específicas

    6. **RECOMENDACIONES ESTRATÉGICAS**:
       - ¿Qué cambios harías para mejorar el rendimiento?
       - ¿Qué elementos mantendrías?
       - ¿Cómo optimizarías para diferentes plataformas?

    ### FORMATO DE RESPUESTA (JSON):
    Proporciona tu análisis en el siguiente formato JSON:

    {
      "analisis_contenido": {
        "efectividad_mensaje": "Descripción de la efectividad del mensaje",
        "claridad_cta": "Evaluación de la claridad del llamado a la acción",
        "coherencia_marca": "Análisis de coherencia con la marca",
        "elementos_clave": ["elemento1", "elemento2", "elemento3"]
      },
      "analisis_tecnico": {
        "calidad_produccion": "Evaluación de la calidad técnica (1-10)",
        "efectividad_guion": "Análisis del guion y narrativa",
        "uso_audio_visual": "Evaluación de elementos audiovisuales",
        "ritmo_estructura": "Análisis de ritmo y estructura"
      },
      "analisis_target": {
        "segmento_demografico": "Descripción del público objetivo",
        "emociones_objetivo": ["emocion1", "emocion2"],
        "apropiacion_horario": "¿Es apropiado para el horario de transmisión?"
      },
      "correlacion_web": {
        "impacto_detectado": "Análisis del impacto medido",
        "elementos_contribuyentes": ["elemento1", "elemento2"],
        "coherencia_resultados": "¿Es coherente el contenido con los resultados?"
      },
      "racional_publicitario": {
        "justificacion_profesional": "Justificación detallada de por qué funcionó o no",
        "fortalezas": ["fortaleza1", "fortaleza2"],
        "oportunidades_mejora": ["mejora1", "mejora2"],
        "optimizaciones_sugeridas": ["optimizacion1", "optimizacion2"]
      },
      "recomendaciones_estrategicas": {
        "cambios_mejora": ["cambio1", "cambio2"],
        "elementos_mantener": ["elemento1", "elemento2"],
        "optimizacion_plataformas": "Sugerencias para diferentes plataformas"
      },
      "conclusiones": {
        "resumen_ejecutivo": "Resumen ejecutivo del análisis",
        "potencial_rendimiento": "Evaluación del potencial de rendimiento",
        "recomendacion_final": "Recomendación final profesional"
      }
    }

    ### NOTAS IMPORTANTES:
    - Sé objetivo y profesional en tu análisis
    - Proporciona insights accionables
    - Cita ejemplos específicos del video cuando sea posible
    - Adapta el análisis a la industria publicitaria chilena
    - Considera el contexto cultural y temporal del spot
    `;
  }

  /**
   * Parsear el análisis de Gemini a objeto estructurado
   */
  parseGeminiAnalysis(analysisText) {
    try {
      // Intentar extraer JSON del texto
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        const parsed = JSON.parse(jsonString);
        
        // Validar que tenga la estructura esperada
        if (parsed.analisis_contenido && parsed.racional_publicitario) {
          return parsed;
        }
      }
      
      // Si no se puede parsear JSON, crear estructura básica
      console.warn('No se pudo parsear JSON completo, creando estructura básica');
      
      return {
        analisis_contenido: {
          efectividad_mensaje: "Análisis detallado requiere visualización del video",
          claridad_cta: "No se puede evaluar sin acceso al contenido visual",
          coherencia_marca: "Requiere análisis del video",
          elementos_clave: ["Análisis pendiente"]
        },
        analisis_tecnico: {
          calidad_produccion: "5",
          efectividad_guion: "Información insuficiente",
          uso_audio_visual: "Requiere visualización",
          ritmo_estructura: "No se puede evaluar"
        },
        analisis_target: {
          segmento_demografico: "Basado en título y descripción: público general",
          emociones_objetivo: ["Información insuficiente"],
          apropiacion_horario: "Depende del contenido específico"
        },
        correlacion_web: {
          impacto_detectado: analysisText.includes("impacto") ? "Mencionado en el análisis" : "No especificado",
          elementos_contribuyentes: ["Requiere análisis visual"],
          coherencia_resultados: "Pendiente de evaluación"
        },
        racional_publicitario: {
          justificacion_profesional: analysisText,
          fortalezas: ["Análisis generado por IA"],
          oportunidades_mejora: ["Visualización del contenido recomendada"],
          optimizaciones_sugeridas: ["Análisis detallado con video"]
        },
        recomendaciones_estrategicas: {
          cambios_mejora: ["Obtener acceso al contenido visual"],
          elementos_mantener: ["Estructura de análisis"],
          optimizacion_plataformas: "Adaptar según el contenido real"
        },
        conclusiones: {
          resumen_ejecutivo: "Análisis generado con limitaciones por falta de acceso visual",
          potencial_rendimiento: "Requiere evaluación completa",
          recomendacion_final: "Se recomienda análisis con acceso al video completo"
        }
      };
      
    } catch (error) {
      console.error('Error parseando análisis de Gemini:', error);
      
      // Estructura de respaldo
      return {
        analisis_contenido: {
          efectividad_mensaje: "Error al procesar el análisis",
          claridad_cta: "Error en procesamiento",
          coherencia_marca: "Error al analizar",
          elementos_clave: ["Error en análisis"]
        },
        racional_publicitario: {
          justificacion_profesional: "Se produjo un error al procesar el análisis de Gemini",
          fortalezas: ["Sistema de análisis implementado"],
          oportunidades_mejora: ["Mejorar la calidad del análisis"],
          optimizaciones_sugeridas: ["Revisar el prompt y la respuesta"]
        },
        error: true,
        rawAnalysis: analysisText
      };
    }
  }

  /**
   * Análisis completo: YouTube + Gemini + Analytics
   */
  async analyzeYouTubeVideo(youtubeUrl, spotData, analyticsData) {
    try {
      console.log('🎬 Iniciando análisis completo de YouTube con Gemini...');
      
      // 1. Extraer ID del video
      const videoId = this.extractYouTubeVideoId(youtubeUrl);
      if (!videoId) {
        throw new Error('URL de YouTube inválida');
      }
      
      console.log('📺 Video ID extraído:', videoId);

      // 2. Obtener información del video
      const youtubeData = await this.getYouTubeVideoInfo(videoId);
      console.log('✅ Información de YouTube obtenida');

      // 3. Analizar con Gemini
      const geminiAnalysis = await this.analyzeVideoWithGemini(youtubeData, spotData, analyticsData);
      console.log('✅ Análisis de Gemini completado');

      return {
        success: true,
        youtubeData,
        geminiAnalysis,
        timestamp: new Date().toISOString(),
        videoId
      };

    } catch (error) {
      console.error('❌ Error en análisis completo:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export default GoogleGeminiVideoService;
import logger from '../utils/logger';

const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY || '';
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

class YouTubeService {
  constructor() {
    this.apiKey = YOUTUBE_API_KEY;
  }

  /**
   * Extrae el ID del video de una URL de YouTube
   * @param {string} url - URL de YouTube
   * @returns {string|null} - ID del video o null si no es válido
   */
  extractVideoId(url) {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
      /(?:youtube\.com\/shorts\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/ // ID directo
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
   * Obtiene información completa del video
   * @param {string} videoId - ID del video de YouTube
   * @returns {Promise<Object>} - Datos del video
   */
  async getVideoDetails(videoId) {
    try {
      if (!this.apiKey) {
        throw new Error('YouTube API key no configurada');
      }

      const response = await fetch(
        `${YOUTUBE_API_BASE}/videos?part=snippet,contentDetails,statistics,topicDetails&id=${videoId}&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Error de YouTube API: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        throw new Error('Video no encontrado');
      }

      const video = data.items[0];
      const snippet = video.snippet;
      const statistics = video.statistics;
      const contentDetails = video.contentDetails;

      return {
        id: videoId,
        title: snippet.title,
        description: snippet.description,
        channelTitle: snippet.channelTitle,
        channelId: snippet.channelId,
        publishedAt: snippet.publishedAt,
        thumbnails: snippet.thumbnails,
        duration: contentDetails.duration,
        viewCount: statistics.viewCount ? parseInt(statistics.viewCount) : 0,
        likeCount: statistics.likeCount ? parseInt(statistics.likeCount) : 0,
        commentCount: statistics.commentCount ? parseInt(statistics.commentCount) : 0,
        tags: snippet.tags || [],
        categoryId: snippet.categoryId,
        defaultLanguage: snippet.defaultLanguage,
        defaultAudioLanguage: snippet.defaultAudioLanguage,
        liveBroadcastContent: snippet.liveBroadcastContent,
        topicDetails: video.topicDetails
      };

    } catch (error) {
      logger.error('Error obteniendo detalles del video de YouTube:', error);
      throw error;
    }
  }

  /**
   * Obtiene la transcripción del video si está disponible
   * @param {string} videoId - ID del video de YouTube
   * @returns {Promise<string>} - Transcripción del video
   */
  async getVideoTranscript(videoId) {
    try {
      // Intentar obtener transcripción mediante el API de captions
      const response = await fetch(
        `${YOUTUBE_API_BASE}/captions?part=snippet&videoId=${videoId}&key=${this.apiKey}`
      );

      if (!response.ok) {
        logger.warn('No se pudieron obtener subtítulos del video');
        return '';
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        logger.info('No hay subtítulos disponibles para este video');
        return '';
      }

      // Buscar subtítulos en español o inglés
      const captionTrack = data.items.find(item => 
        item.snippet.language === 'es' || item.snippet.language === 'en'
      ) || data.items[0]; // Si no, tomar el primero disponible

      // Nota: Para obtener el contenido real de los subtítulos, necesitarías
      // descargar el archivo de subtítulos, lo cual requiere autenticación OAuth
      // Por ahora, devolvemos información básica
      return `Subtítulos disponibles en: ${captionTrack.snippet.language}`;

    } catch (error) {
      logger.error('Error obteniendo transcripción:', error);
      return '';
    }
  }

  /**
   * Analiza el video completo y prepara datos para IA
   * @param {string} youtubeUrl - URL de YouTube
   * @returns {Promise<Object>} - Análisis completo del video
   */
  async analyzeVideo(youtubeUrl) {
    try {
      logger.info('Iniciando análisis de video de YouTube:', youtubeUrl);

      // Extraer ID del video
      const videoId = this.extractVideoId(youtubeUrl);
      if (!videoId) {
        throw new Error('URL de YouTube inválida');
      }

      logger.info('ID del video extraído:', videoId);

      // Obtener información del video
      const videoDetails = await this.getVideoDetails(videoId);
      logger.info('Detalles del video obtenidos:', videoDetails.title);

      // Obtener transcripción si está disponible
      const transcript = await this.getVideoTranscript(videoId);

      // Preparar datos para análisis de IA
      const analysisData = {
        videoInfo: {
          title: videoDetails.title,
          description: videoDetails.description,
          channel: videoDetails.channelTitle,
          duration: videoDetails.duration,
          viewCount: videoDetails.viewCount,
          likeCount: videoDetails.likeCount,
          tags: videoDetails.tags,
          publishedAt: videoDetails.publishedAt,
          thumbnails: videoDetails.thumbnails
        },
        transcript: transcript,
        metadata: {
          categoryId: videoDetails.categoryId,
          language: videoDetails.defaultLanguage || videoDetails.defaultAudioLanguage,
          isLive: videoDetails.liveBroadcastContent === 'live',
          topics: videoDetails.topicDetails?.topicCategories || []
        }
      };

      logger.info('Análisis de video completado exitosamente');
      return analysisData;

    } catch (error) {
      logger.error('Error en análisis de video:', error);
      throw error;
    }
  }

  /**
   * Valida si una URL es de YouTube válida
   * @param {string} url - URL a validar
   * @returns {boolean} - true si es una URL válida de YouTube
   */
  isValidYouTubeUrl(url) {
    return this.extractVideoId(url) !== null;
  }

  /**
   * Obtiene sugerencias de búsqueda (útil para autocompletado)
   * @param {string} query - Término de búsqueda
   * @returns {Promise<Array>} - Sugerencias de búsqueda
   */
  async getSearchSuggestions(query) {
    try {
      const response = await fetch(
        `${YOUTUBE_API_BASE}/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=5&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error('Error obteniendo sugerencias');
      }

      const data = await response.json();
      
      return data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.default?.url
      }));

    } catch (error) {
      logger.error('Error obteniendo sugerencias:', error);
      return [];
    }
  }
}

export const youtubeService = new YouTubeService();
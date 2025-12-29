import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Youtube, Link, Brain, AlertCircle, CheckCircle } from 'lucide-react';

const YouTubeVideoInputSimple = ({ onAnalysisComplete, analysisResults, isAnalyzing = false }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);

  // Validar URL de YouTube
  const isValidYouTubeUrl = (url) => {
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
  };

  // Validar URL en tiempo real
  React.useEffect(() => {
    if (youtubeUrl.trim()) {
      const videoId = isValidYouTubeUrl(youtubeUrl);
      setIsValid(videoId !== null);
      setShowValidation(true);
    } else {
      setShowValidation(false);
      setIsValid(false);
    }
  }, [youtubeUrl]);

  // Manejar cambio de URL
  const handleUrlChange = (e) => {
    setYoutubeUrl(e.target.value);
    setError(null);
    setAnalysisData(null);
  };

  const performAnalysis = async () => {
    if (!isValid) return;

    setIsAnalyzingVideo(true);
    setError(null);

    try {
      console.log('🎬 Iniciando análisis de YouTube...');
      
      // Simular análisis por ahora
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const videoId = isValidYouTubeUrl(youtubeUrl);
      
      // Datos simulados del análisis
      const mockAnalysis = {
        videoTitle: `Video de YouTube - ${videoId}`,
        videoUrl: youtubeUrl,
        videoId: videoId,
        analysisResults: {
          contentAnalysis: {
            description: 'Análisis de contenido del video usando Google Gemini',
            tags: ['publicidad', 'marketing', 'análisis']
          },
          geminiAnalysis: {
            analisis_contenido: {
              efectividad_mensaje: 'El mensaje publicitario es claro y directo',
              claridad_cta: 'Llamado a la acción bien definido',
              coherencia_marca: 'Coherente con la identidad de marca',
              elementos_clave: ['mensaje claro', 'visual atractivo', 'música apropiada']
            },
            racional_publicitario: {
              justificacion_profesional: 'El spot muestra elementos que pueden generar impacto en la audiencia objetivo',
              fortalezas: ['Mensaje claro', 'Producción de calidad'],
              oportunidades_mejora: ['Optimizar timing', 'Mejorar CTA'],
              optimizaciones_sugeridas: ['Ajustar duración', 'Personalizar contenido']
            }
          }
        }
      };

      // Notificar al componente padre
      if (onAnalysisComplete) {
        onAnalysisComplete(mockAnalysis);
      }

      setAnalysisData(mockAnalysis);

    } catch (err) {
      console.error('❌ Error en análisis:', err);
      setError(err.message);
    } finally {
      setIsAnalyzingVideo(false);
    }
  };

  const getValidationIcon = () => {
    if (!showValidation) return null;
    return isValid ? 
      <CheckCircle className="h-5 w-5 text-green-500" /> : 
      <AlertCircle className="h-5 w-5 text-red-500" />;
  };

  const getValidationMessage = () => {
    if (!showValidation) return '';
    if (isValid) return '✅ URL válida de YouTube';
    if (youtubeUrl.trim()) return '❌ URL inválida. Ejemplos válidos: https://youtube.com/watch?v=VIDEO_ID o https://youtu.be/VIDEO_ID';
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Input de YouTube */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <div className="mb-4">
          {/* Campo de URL */}
          <div className="space-y-4">
            <div className="relative">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Link className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={handleUrlChange}
                    placeholder="https://youtube.com/watch?v=VIDEO_ID"
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                      showValidation
                        ? isValid
                          ? 'border-green-300 bg-green-50'
                          : 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    disabled={isAnalyzingVideo}
                  />
                  {showValidation && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {getValidationIcon()}
                    </div>
                  )}
                </div>
                
                {isValid && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={performAnalysis}
                    disabled={isAnalyzingVideo}
                    className="px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
                  >
                    {isAnalyzingVideo ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Analizando...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4" />
                        <span>Analizar con IA</span>
                      </>
                    )}
                  </motion.button>
                )}
              </div>
              
              {showValidation && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-sm mt-2 ${
                    isValid ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {getValidationMessage()}
                </motion.p>
              )}
            </div>

            {/* Ejemplos de URLs */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Formatos válidos:</p>
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <code>https://youtube.com/watch?v=dQw4w9WgXcQ</code>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <code>https://youtu.be/dQw4w9WgXcQ</code>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <code>https://youtube.com/embed/dQw4w9WgXcQ</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estado de análisis */}
        {isAnalyzingVideo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              <div>
                <p className="text-sm font-medium text-blue-900">Analizando video con IA...</p>
                <p className="text-xs text-blue-700">Extrayendo metadata de YouTube → Análisis con Google Gemini → Generando insights</p>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-800">Error en análisis</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Dashboard de análisis */}
      {analysisData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Youtube className="h-6 w-6 text-red-600 mr-2" />
              Análisis de Video de YouTube
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Youtube className="h-5 w-5 text-red-600 mr-2" />
                <h4 className="font-semibold text-red-900">Video Analizado</h4>
              </div>
              <p className="text-red-800 text-sm">
                {analysisData.videoTitle}
              </p>
              <a
                href={analysisData.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 text-xs underline mt-1 inline-block"
              >
                Ver video en YouTube
              </a>
            </div>
            
            {analysisData.analysisResults?.geminiAnalysis && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Análisis de Gemini</h4>
                <div className="space-y-2">
                  <p className="text-gray-700 text-sm">
                    <strong>Efectividad del mensaje:</strong> {analysisData.analysisResults.geminiAnalysis.analisis_contenido?.efectividad_mensaje}
                  </p>
                  <p className="text-gray-700 text-sm">
                    <strong>Claridad del CTA:</strong> {analysisData.analysisResults.geminiAnalysis.analisis_contenido?.claridad_cta}
                  </p>
                  <p className="text-gray-700 text-sm">
                    <strong>Racional:</strong> {analysisData.analysisResults.geminiAnalysis.racional_publicitario?.justificacion_profesional}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default YouTubeVideoInputSimple;
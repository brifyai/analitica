import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGoogleAnalytics } from '../../contexts/GoogleAnalyticsContext';
import { motion } from 'framer-motion';
import {
  Upload,
  BarChart3,
  Brain,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Info,
  Clock,
  Eye,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus,
  Play
} from 'lucide-react';
import { showError, showWarning, showSuccess } from '../../utils/swal';

// Servicios
import SimpleSpotAnalysisService from '../../services/simpleSpotAnalysisService';
import DatabaseSetupService from '../../services/databaseSetupService';
import MinuteByMinuteAnalysisService from '../../services/minuteByMinuteAnalysisService';

// Componentes
import LoadingSpinner from '../UI/LoadingSpinner';
import YouTubeVideoInputSimple from './components/YouTubeVideoInputSimple';

const SpotAnalysisMinuteByMinute = () => {
  const { user } = useAuth();
  const { accounts, properties, isConnected } = useGoogleAnalytics();
  
  // Estados principales
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [spotsFile, setSpotsFile] = useState(null);
  const [spotsData, setSpotsData] = useState([]);
  const [selectedSpots, setSelectedSpots] = useState([]); // Para selección múltiple
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('');
  const [youtubeAnalysis, setYoutubeAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [setupComplete, setSetupComplete] = useState(false);
  const [analysisWindow, setAnalysisWindow] = useState(30); // minutos
  const [showSpotDropdown, setShowSpotDropdown] = useState(false); // Para controlar el dropdown

  // Instancias de servicios con useMemo
  const spotAnalysisService = useMemo(() => new SimpleSpotAnalysisService(), []);
  const databaseService = useMemo(() => new DatabaseSetupService(), []);
  const minuteAnalysisService = useMemo(() => new MinuteByMinuteAnalysisService(), []);

  // Filtrar propiedades basadas en la cuenta seleccionada
  const filteredProperties = selectedAccount
    ? properties.filter(prop => prop.accountId === selectedAccount)
    : [];

  // Ordenar cuentas alfabéticamente
  const sortedAccounts = [...accounts].sort((a, b) =>
    (a.displayName || a.account_name || a.name).localeCompare(b.displayName || b.account_name || b.name)
  );

  // Configurar base de datos al cargar
  const setupDatabase = useCallback(async () => {
    try {
      console.log('🔧 Configurando base de datos...');
      const result = await databaseService.setupDatabaseStructure();
      
      if (result.success) {
        setSetupComplete(true);
        showSuccess('Base de datos configurada correctamente', 'Configuración completada');
      } else {
        console.warn('⚠️ Configuración de BD con advertencias:', result.message);
        setSetupComplete(true);
      }
    } catch (error) {
      console.error('❌ Error configurando base de datos:', error);
      setSetupComplete(true);
    }
  }, [databaseService]);

  // Configurar BD al montar el componente
  React.useEffect(() => {
    if (user && !setupComplete) {
      setupDatabase();
    }
  }, [user, setupComplete, setupDatabase]);

  // Cerrar dropdown al hacer clic fuera
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSpotDropdown && !event.target.closest('.spot-dropdown-container')) {
        setShowSpotDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSpotDropdown]);

  // Manejar subida de archivo
  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      showWarning('Por favor, sube un archivo Excel (.xlsx, .xls) o CSV', 'Tipo de archivo inválido');
      return;
    }

    // Validar tamaño (5MB máximo)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showWarning('El archivo excede el tamaño máximo permitido de 5MB', 'Archivo demasiado grande');
      return;
    }

    setSpotsFile(file);
    setError(null);
    
    try {
      console.log('📁 Procesando archivo de spots...');
      const data = await spotAnalysisService.parseSpotsFile(file);
      setSpotsData(data);
      showSuccess(`Archivo procesado exitosamente. ${data.length} spots cargados.`, 'Archivo cargado');
    } catch (error) {
      console.error('❌ Error processing file:', error);
      showError(`Error al procesar el archivo: ${error.message}`, 'Error de procesamiento');
      setSpotsFile(null);
      setSpotsData([]);
    }
  }, [spotAnalysisService]);

  // Funciones para selección múltiple de spots
  const toggleSpotSelection = (spot) => {
    const spotId = `${spot.fecha}-${spot.hora_inicio}-${spot.canal}`;
    console.log('🔄 Toggling spot selection:', spotId, 'Current selectedSpots:', selectedSpots.length);
    setSelectedSpots(prev => {
      const isSelected = prev.some(s => `${s.fecha}-${s.hora_inicio}-${s.canal}` === spotId);
      const newSelection = isSelected
        ? prev.filter(s => `${s.fecha}-${s.hora_inicio}-${s.canal}` !== spotId)
        : [...prev, spot];
      console.log('✅ Spot selection updated:', newSelection.length, 'spots selected');
      return newSelection;
    });
  };

  const selectAllSpots = () => {
    console.log('🔄 Selecting all spots. Current spotsData length:', spotsData.length);
    console.log('📊 Spots data sample:', spotsData.slice(0, 3));
    setSelectedSpots([...spotsData]);
  };

  const deselectAllSpots = () => {
    console.log('🔄 Deselecting all spots');
    setSelectedSpots([]);
  };

  // ANÁLISIS INTEGRADO (Google Analytics + Excel + YouTube)
  const performIntegratedAnalysis = useCallback(async () => {
    console.log('🚀 performIntegratedAnalysis called');
    console.log('📋 State check:', {
      selectedSpotsCount: selectedSpots.length,
      selectedProperty: !!selectedProperty,
      spotsDataLength: spotsData.length,
      analyzing,
      minuteAnalysisService: !!minuteAnalysisService,
      spotAnalysisService: !!spotAnalysisService
    });

    if (selectedSpots.length === 0) {
      console.log('❌ No spots selected');
      showWarning('Por favor, selecciona al menos un spot para analizar', 'Spots requeridos');
      return;
    }

    if (!selectedProperty) {
      console.log('❌ No property selected');
      showWarning('Por favor, selecciona una propiedad de Google Analytics', 'Propiedad requerida');
      return;
    }

    if (spotsData.length === 0) {
      console.log('❌ No spots data');
      showWarning('Por favor, sube un archivo Excel con datos de spots', 'Archivo Excel requerido');
      return;
    }

    console.log('✅ All validations passed, starting analysis...');
    setAnalyzing(true);
    setError(null);
    setAnalysisStage('Iniciando análisis integrado (Analytics + Excel + YouTube)...');

    try {
      console.log('🔍 Starting integrated analysis (Analytics + Excel + YouTube)...');
      
      // Verificar servicios
      if (!minuteAnalysisService) {
        throw new Error('Servicio de análisis minuto a minuto no disponible');
      }
      if (!spotAnalysisService) {
        throw new Error('Servicio de análisis de spots no disponible');
      }
      
      // Fase 1: Análisis de Google Analytics para todos los spots
      setAnalysisStage('📊 Obteniendo datos de Google Analytics...');
      console.log('📊 Calling minuteAnalysisService.performMinuteByMinuteAnalysis...');
      
      // Analizar cada spot seleccionado
      const allAnalyticsResults = [];
      for (let i = 0; i < selectedSpots.length; i++) {
        const spot = selectedSpots[i];
        setAnalysisStage(`📊 Analizando spot ${i + 1} de ${selectedSpots.length}...`);
        
        const analyticsResults = await minuteAnalysisService.performMinuteByMinuteAnalysis(
          spot,
          selectedProperty,
          analysisWindow
        );
        allAnalyticsResults.push({
          spot,
          results: analyticsResults
        });
      }
      console.log('✅ Analytics results received for all spots:', allAnalyticsResults.length);

      // Fase 2: Análisis del archivo Excel
      setAnalysisStage('📋 Analizando datos del archivo Excel...');
      console.log('📋 Calling spotAnalysisService.analyzeSpotsWithAI...');
      const excelAnalysis = await spotAnalysisService.analyzeSpotsWithAI(spotsData);
      console.log('✅ Excel analysis received:', !!excelAnalysis);

      // Fase 3: Análisis de YouTube (si hay video)
      let youtubeResults = null;
      if (youtubeAnalysis) {
        setAnalysisStage('🎥 Analizando video de YouTube...');
        console.log('🎥 YouTube analysis available');
        youtubeResults = youtubeAnalysis;
      } else {
        console.log('ℹ️ No YouTube analysis available');
      }

      // Fase 4: Combinar todos los análisis
      setAnalysisStage('🧠 Combinando análisis de todas las fuentes...');
      const integratedResults = {
        // Resultados de Google Analytics
        analyticsData: allAnalyticsResults,
        
        // Resultados del análisis Excel
        excelAnalysis: excelAnalysis,
        
        // Resultados de YouTube
        youtubeAnalysis: youtubeResults,
        
        // Análisis integrado
        integratedInsights: {
          trafficImpact: allAnalyticsResults.map(r => r.results?.impactMetrics).filter(Boolean),
          spotPerformance: excelAnalysis?.spotAnalysis || null,
          videoCorrelation: youtubeResults ? {
            hasVideo: true,
            videoTitle: youtubeResults.videoTitle,
            contentAnalysis: youtubeResults.contentAnalysis
          } : { hasVideo: false },
          
          // Insights combinados
          combinedInsights: [
            ...allAnalyticsResults.flatMap(r => r.results?.insights?.insights || []),
            ...(excelAnalysis?.insights || []),
            ...(youtubeResults ? [{
              severity: 'medium',
              message: `Video de YouTube analizado: ${youtubeResults.videoTitle || 'Contenido relacionado con el spot'}`,
              type: 'youtube'
            }] : [])
          ],
          
          // Resumen ejecutivo integrado
          executiveSummary: generateExecutiveSummary(allAnalyticsResults, excelAnalysis, youtubeResults),
          
          // Recomendaciones integradas
          integratedRecommendations: generateIntegratedRecommendations(allAnalyticsResults, excelAnalysis, youtubeResults)
        },
        
        // Metadatos del análisis
        analysisMetadata: {
          timestamp: new Date().toISOString(),
          sources: ['Google Analytics', 'Excel Data', ...(youtubeResults ? ['YouTube'] : [])],
          spotsAnalyzed: selectedSpots,
          analysisWindow: analysisWindow,
          totalSpots: selectedSpots.length
        }
      };
      
      console.log('✅ Integrated results created:', !!integratedResults);
      setAnalysisResults(integratedResults);
      console.log('✅ Integrated analysis completed');
      showSuccess(`Análisis integrado completado para ${selectedSpots.length} spot(s)`, 'Análisis terminado');
      
    } catch (error) {
      console.error('❌ Error in integrated analysis:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setError(error.message);
      showError(`Error durante el análisis integrado: ${error.message}`, 'Error de análisis');
    } finally {
      setAnalyzing(false);
      setAnalysisStage('');
    }
  }, [selectedSpots, selectedProperty, analysisWindow, minuteAnalysisService, spotAnalysisService, spotsData, youtubeAnalysis]);

  // Función auxiliar para generar resumen ejecutivo
  const generateExecutiveSummary = (allAnalyticsResults, excelAnalysis, youtubeResults) => {
    const parts = [];
    
    if (allAnalyticsResults && allAnalyticsResults.length > 0) {
      // Calcular promedio de impacto de todos los spots
      const avgImpact = allAnalyticsResults.reduce((acc, result) => {
        if (result.results?.impactMetrics?.totalImpact) {
          acc.users += result.results.impactMetrics.totalImpact.users.percentage;
          acc.sessions += result.results.impactMetrics.totalImpact.sessions.percentage;
          acc.count++;
        }
        return acc;
      }, { users: 0, sessions: 0, count: 0 });
      
      if (avgImpact.count > 0) {
        parts.push(`Los ${allAnalyticsResults.length} spot(s) analizados generaron un impacto promedio del ${(avgImpact.users / avgImpact.count).toFixed(1)}% en usuarios web`);
      }
    }
    
    if (excelAnalysis?.spotAnalysis) {
      parts.push(`Análisis del archivo Excel muestra patrones específicos de los spots`);
    }
    
    if (youtubeResults) {
      parts.push(`Video de YouTube relacionado: ${youtubeResults.videoTitle || 'contenido analizado'}`);
    }
    
    return parts.join('. ') + '.';
  };

  // Función auxiliar para generar recomendaciones integradas
  const generateIntegratedRecommendations = (allAnalyticsResults, excelAnalysis, youtubeResults) => {
    const recommendations = [];
    
    if (allAnalyticsResults && allAnalyticsResults.length > 0) {
      // Calcular promedio de impacto
      const avgImpact = allAnalyticsResults.reduce((acc, result) => {
        if (result.results?.impactMetrics?.totalImpact) {
          acc.users += result.results.impactMetrics.totalImpact.users.percentage;
          acc.count++;
        }
        return acc;
      }, { users: 0, count: 0 });
      
      if (avgImpact.count > 0 && (avgImpact.users / avgImpact.count) < 5) {
        recommendations.push('Considera optimizar el timing de los spots para mayor impacto web');
      }
    }
    
    if (excelAnalysis?.spotAnalysis?.recommendations) {
      recommendations.push(...excelAnalysis.spotAnalysis.recommendations);
    }
    
    if (youtubeResults) {
      recommendations.push('Aprovecha el contenido de YouTube para reforzar la campaña TV');
    }
    
    return recommendations;
  };

  // Renderizar timeline minuto a minuto
  const renderMinuteByMinuteTimeline = () => {
    if (!analysisResults?.comparisonResults?.timeline) return null;

    const timeline = analysisResults.comparisonResults.timeline;

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Clock className="h-6 w-6 mr-2 text-blue-600" />
          Timeline Minuto a Minuto ({analysisWindow} minutos)
        </h3>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {timeline.map((minute, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-gray-600 w-16">
                  Minuto {minute.minute}
                </div>
                <div className="text-sm text-gray-500 w-12">
                  {minute.time}
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                {/* Usuarios del spot */}
                <div className="text-center">
                  <div className="text-sm font-semibold text-blue-600">
                    {minute.spot.users}
                  </div>
                  <div className="text-xs text-gray-500">Spot</div>
                </div>
                
                {/* Promedio de controles */}
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-600">
                    {Math.round(minute.controlAverages?.users || 0)}
                  </div>
                  <div className="text-xs text-gray-500">Promedio</div>
                </div>
                
                {/* Diferencia */}
                <div className="text-center">
                  <div className={`text-sm font-semibold flex items-center ${
                    minute.differences?.users > 0 ? 'text-green-600' : 
                    minute.differences?.users < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {minute.differences?.users > 0 && <ArrowUp className="h-3 w-3 mr-1" />}
                    {minute.differences?.users < 0 && <ArrowDown className="h-3 w-3 mr-1" />}
                    {minute.differences?.users === 0 && <Minus className="h-3 w-3 mr-1" />}
                    {minute.differences?.users || 0}
                  </div>
                  <div className="text-xs text-gray-500">Diferencia</div>
                </div>
                
                {/* Porcentaje de cambio */}
                <div className="text-center">
                  <div className={`text-sm font-semibold ${
                    minute.percentageChanges?.users > 0 ? 'text-green-600' : 
                    minute.percentageChanges?.users < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {minute.percentageChanges?.users ? 
                      `${minute.percentageChanges.users > 0 ? '+' : ''}${minute.percentageChanges.users.toFixed(1)}%` : 
                      '0.0%'
                    }
                  </div>
                  <div className="text-xs text-gray-500">Cambio %</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar resumen de impacto
  const renderImpactSummary = () => {
    if (!analysisResults?.impactMetrics) return null;

    const impact = analysisResults.impactMetrics;

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Target className="h-6 w-6 mr-2 text-green-600" />
          Resumen de Impacto
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {impact.totalImpact.users.percentage.toFixed(1)}%
            </div>
            <div className="text-sm text-blue-800">Impacto en Usuarios</div>
            <div className="text-xs text-gray-600 mt-1">
              {impact.totalImpact.users.absolute > 0 ? '+' : ''}{impact.totalImpact.users.absolute} usuarios
            </div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {impact.totalImpact.sessions.percentage.toFixed(1)}%
            </div>
            <div className="text-sm text-green-800">Impacto en Sesiones</div>
            <div className="text-xs text-gray-600 mt-1">
              {impact.totalImpact.sessions.absolute > 0 ? '+' : ''}{impact.totalImpact.sessions.absolute} sesiones
            </div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {impact.totalImpact.pageviews.percentage.toFixed(1)}%
            </div>
            <div className="text-sm text-purple-800">Impacto en Vistas</div>
            <div className="text-xs text-gray-600 mt-1">
              {impact.totalImpact.pageviews.absolute > 0 ? '+' : ''}{impact.totalImpact.pageviews.absolute} vistas
            </div>
          </div>
        </div>
        
        {/* Pico de impacto */}
        {impact.peakImpact.impact > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-yellow-800">
                Pico de impacto: Minuto {impact.peakImpact.minute} con {impact.peakImpact.impact.toFixed(0)} usuarios adicionales
              </span>
            </div>
          </div>
        )}
        
        {/* Significancia estadística */}
        {impact.significance.isSignificant && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">
                Impacto estadísticamente significativo (p {'<'} {impact.significance.pValue})
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Renderizar insights
  const renderInsights = () => {
    if (!analysisResults?.insights?.insights) return null;

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Brain className="h-6 w-6 mr-2 text-purple-600" />
          Insights del Análisis
        </h3>
        
        <div className="space-y-3">
          {analysisResults.insights.insights.map((insight, index) => (
            <div key={index} className={`p-4 rounded-lg ${
              insight.severity === 'high' ? 'bg-red-50 border border-red-200' :
              insight.severity === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-start">
                <div className={`w-3 h-3 rounded-full mt-2 mr-3 ${
                  insight.severity === 'high' ? 'bg-red-500' :
                  insight.severity === 'medium' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-gray-800 text-sm">{insight.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Resumen */}
        {analysisResults.insights.summary && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Resumen</h4>
            <p className="text-gray-700 text-sm">{analysisResults.insights.summary}</p>
          </div>
        )}
        
        {/* Recomendaciones */}
        {analysisResults.insights.recommendations && analysisResults.insights.recommendations.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-gray-900 mb-2">Recomendaciones</h4>
            <ul className="space-y-1">
              {analysisResults.insights.recommendations.map((rec, index) => (
                <li key={index} className="text-gray-700 text-sm flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Renderizar estado de carga inicial
  if (!setupComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Configurando análisis minuto a minuto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Principal */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-700 via-blue-600 to-green-800 rounded-xl shadow-xl p-6 text-white mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Clock className="h-8 w-8 mr-3" />
              Análisis Minuto a Minuto
            </h1>
            <p className="text-green-100">
              Análisis granular del impacto de spots TV en el tráfico web minuto a minuto
            </p>
            <div className="mt-2 flex items-center space-x-4">
              <div className="px-3 py-1 bg-green-600 rounded-full text-xs">
                ⏱️ Análisis Granular
              </div>
              <div className="px-3 py-1 bg-blue-600 rounded-full text-xs">
                📊 Baseline Robusto
              </div>
              <div className="px-3 py-1 bg-indigo-600 rounded-full text-xs">
                🎯 Medible y Creíble
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{spotsData.length}</div>
            <div className="text-green-200 text-sm">Spots Cargados</div>
            {selectedSpots.length > 0 && (
              <div className="mt-2">
                <div className="text-lg font-semibold">
                  {selectedSpots.length === 1
                    ? selectedSpots[0].canal
                    : `${selectedSpots.length} spots seleccionados`
                  }
                </div>
                <div className="text-green-200 text-sm">
                  {selectedSpots.length === 1
                    ? `${selectedSpots[0].fecha} ${selectedSpots[0].hora_inicio}`
                    : 'Múltiples spots'
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Sección de Configuración */}
      <div className="p-6 -mb-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center mb-6">
            <div className="p-2 bg-green-500 rounded-lg mr-3">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Configuración del Análisis Minuto a Minuto</h2>
              <p className="text-gray-600">Selecciona spot, propiedad y configura ventana de análisis</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Selección de Cuenta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuenta de Google Analytics
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => {
                  setSelectedAccount(e.target.value);
                  setSelectedProperty('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Selecciona una cuenta</option>
                {sortedAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.displayName || account.account_name || account.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Selección de Propiedad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Propiedad de Analytics
              </label>
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                disabled={!selectedAccount}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Selecciona una propiedad</option>
                {filteredProperties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.displayName || property.property_name || property.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Archivo de Spots */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo de Spots TV
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="spots-file-upload"
              />
              <label
                htmlFor="spots-file-upload"
                className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-green-300 rounded-lg cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all bg-white"
              >
                <Upload className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-600 text-center">
                  {spotsFile ? (
                    <span className="text-green-600 font-medium">{spotsFile.name}</span>
                  ) : (
                    'Subir Excel o CSV'
                  )}
                </span>
              </label>
            </div>
            {spotsData.length > 0 && (
              <div className="mt-2 flex items-center text-sm text-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                {spotsData.length} spots cargados correctamente
              </div>
            )}
          </div>

          {/* Selección de Spots (Múltiple) - DESPUÉS del archivo */}
          <div className="mt-6 spot-dropdown-container">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Spots a Analizar
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSpotDropdown(!showSpotDropdown)}
                disabled={spotsData.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 text-left flex items-center justify-between bg-white hover:bg-gray-50"
              >
                <span className="text-gray-700">
                  {selectedSpots.length === 0
                    ? 'Selecciona spots...'
                    : `${selectedSpots.length} spot(s) seleccionado(s)`
                  }
                </span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showSpotDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
                  {/* Header con controles */}
                  <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {spotsData.length} spots disponibles
                      </span>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={selectAllSpots}
                          className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Seleccionar Todos
                        </button>
                        <button
                          type="button"
                          onClick={deselectAllSpots}
                          className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Deseleccionar Todos
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Lista de spots */}
                  <div className="max-h-48 overflow-y-auto">
                    {spotsData.map((spot, index) => {
                      const spotId = `${spot.fecha}-${spot.hora_inicio}-${spot.canal}`;
                      const isSelected = selectedSpots.some(s => `${s.fecha}-${s.hora_inicio}-${s.canal}` === spotId);
                      
                      return (
                        <label
                          key={index}
                          className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSpotSelection(spot)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <div className="ml-3 flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {spot.fecha} {spot.hora_inicio}
                            </div>
                            <div className="text-sm text-gray-500">
                              {spot.canal}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  
                  {/* Footer con resumen */}
                  {selectedSpots.length > 0 && (
                    <div className="p-3 border-t border-gray-200 bg-gray-50">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{selectedSpots.length}</span> spot(s) seleccionado(s)
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Mostrar spots seleccionados */}
            {selectedSpots.length > 0 && (
              <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                <div className="text-xs text-green-700 font-medium mb-1">Spots seleccionados:</div>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {selectedSpots.slice(0, 3).map((spot, index) => (
                    <div key={index} className="text-xs text-green-600">
                      {spot.fecha} {spot.hora_inicio} - {spot.canal}
                    </div>
                  ))}
                  {selectedSpots.length > 3 && (
                    <div className="text-xs text-green-500">
                      ... y {selectedSpots.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Ventana de Análisis */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ventana de Análisis (minutos)
            </label>
            <select
              value={analysisWindow}
              onChange={(e) => setAnalysisWindow(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>60 minutos</option>
            </select>
          </div>

          {/* Estado de conexión */}
          {!isConnected && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  Conecta tu cuenta de Google Analytics para análisis minuto a minuto con datos reales
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Sección de Análisis de Videos de YouTube */}
      <div className="p-6 pt-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6"
        >
          <div className="flex items-center mb-6">
            <div className="p-2 bg-red-500 rounded-lg mr-3">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Análisis de Videos de YouTube</h2>
              <p className="text-gray-600">Analiza videos de YouTube para detectar contenido y patrones</p>
            </div>
          </div>

          <YouTubeVideoInputSimple
            onAnalysisComplete={setYoutubeAnalysis}
            analysisResults={spotsData}
            isAnalyzing={analyzing}
          />

          {youtubeAnalysis && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm text-green-800">
                  Análisis de video completado - {youtubeAnalysis.videoTitle || 'Video procesado'}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Botón de Análisis */}
      <div className="p-6 pt-0">
        <div className="flex justify-center mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={performIntegratedAnalysis}
            disabled={selectedSpots.length === 0 || !selectedProperty || analyzing}
            className="inline-flex items-center px-12 py-4 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-green-600 via-blue-600 to-green-700 hover:from-green-700 hover:via-blue-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {analyzing ? (
              <>
                <RefreshCw className="h-6 w-6 mr-3 animate-spin" />
                {analysisStage || 'Analizando...'}
              </>
            ) : (
              <>
                <Play className="h-6 w-6 mr-3" />
                Ejecutar Análisis Integrado ({selectedSpots.length} spot{selectedSpots.length !== 1 ? 's' : ''})
              </>
            )}
          </motion.button>
        </div>

        {/* Progreso del análisis */}
        {analyzing && (
          <div className="text-center py-8">
            <div className="bg-green-50 rounded-xl p-6 border border-green-200 max-w-md mx-auto">
              <RefreshCw className="h-8 w-8 text-green-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-green-900 mb-2">
                Análisis Integrado en Progreso (Analytics + Excel + YouTube)
              </h3>
              <p className="text-green-700 text-sm mb-4">
                {analysisStage}
              </p>
              <div className="bg-green-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-8">
            <div className="bg-red-50 rounded-xl p-6 border border-red-200 max-w-md mx-auto">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-900 mb-2">
                Error en el análisis minuto a minuto
              </h3>
              <p className="text-red-700 text-sm">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Resultados del análisis */}
        {analysisResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Información del spot analizado */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Info className="h-6 w-6 mr-2 text-blue-600" />
                Spot Analizado
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {analysisResults.analysisMetadata?.spotsAnalyzed?.[0]?.canal || selectedSpots[0]?.canal || 'N/A'}
                  </div>
                  <div className="text-sm text-blue-800">Canal</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {analysisResults.analysisMetadata?.spotsAnalyzed?.[0]?.fecha || selectedSpots[0]?.fecha || 'N/A'}
                  </div>
                  <div className="text-sm text-green-800">Fecha</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">
                    {analysisResults.analysisMetadata?.spotsAnalyzed?.[0]?.hora_inicio || selectedSpots[0]?.hora_inicio || 'N/A'}
                  </div>
                  <div className="text-sm text-purple-800">Hora del Spot</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">
                    {analysisResults.analysisMetadata?.analysisWindow || analysisWindow} min
                  </div>
                  <div className="text-sm text-orange-800">Ventana Analizada</div>
                </div>
              </div>
            </div>

            {/* Resumen de impacto */}
            {renderImpactSummary()}

            {/* Timeline minuto a minuto */}
            {renderMinuteByMinuteTimeline()}

            {/* Insights */}
            {renderInsights()}

            {/* Análisis de YouTube */}
            {youtubeAnalysis && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Análisis de Video de YouTube</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Eye className="h-5 w-5 text-red-600 mr-2" />
                      <h4 className="font-semibold text-red-900">Video Analizado</h4>
                    </div>
                    <p className="text-red-800 text-sm">
                      {youtubeAnalysis.videoTitle || 'Video de YouTube procesado'}
                    </p>
                    {youtubeAnalysis.videoUrl && (
                      <a
                        href={youtubeAnalysis.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-600 text-xs underline mt-1 inline-block"
                      >
                        Ver video en YouTube
                      </a>
                    )}
                  </div>
                  
                  {youtubeAnalysis.contentAnalysis && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Análisis de Contenido</h4>
                      <p className="text-gray-700 text-sm">
                        {youtubeAnalysis.contentAnalysis.description || 'Contenido analizado'}
                      </p>
                      {youtubeAnalysis.contentAnalysis.tags && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">Tags: </span>
                          <span className="text-sm text-gray-700">
                            {youtubeAnalysis.contentAnalysis.tags.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Estado inicial - Sin análisis */}
        {!analysisResults && !analyzing && (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Listo para análisis integrado
              </h3>
              <p className="text-gray-600 mb-4">
                Selecciona un spot, sube un archivo Excel, agrega un video de YouTube y ejecuta el análisis integrado
              </p>
              <div className="text-sm text-gray-500">
                El sistema analizará Google Analytics, datos del Excel y contenido de YouTube para determinar el impacto del spot TV en el tráfico web
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotAnalysisMinuteByMinute;
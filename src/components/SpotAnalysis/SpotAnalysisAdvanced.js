import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGoogleAnalytics } from '../../contexts/GoogleAnalyticsContext';
import { motion } from 'framer-motion';
import {
  Upload,
  BarChart3,
  Brain,
  TrendingUp,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Info,
  Zap,
  Activity,
  Clock,
  DollarSign,
  Users,
  MousePointer,
  Eye,
  TrendingDown,
  Award,
  Calculator,
  GitBranch,
  Shield
} from 'lucide-react';
import { showError, showWarning, showSuccess } from '../../utils/swal';

// Servicios
import SimpleSpotAnalysisService from '../../services/simpleSpotAnalysisService';
import DatabaseSetupService from '../../services/databaseSetupService';
import AdvancedCausalAnalysisService from '../../services/advancedCausalAnalysisService';
import { CausalInferenceService } from '../../services/causalInferenceService';
import { EnhancedSpotAnalysisService } from '../../services/enhancedSpotAnalysisService';

// Componentes
import LoadingSpinner from '../UI/LoadingSpinner';

const SpotAnalysisAdvanced = () => {
  const { user } = useAuth();
  const { accounts, properties, isConnected, analyticsData } = useGoogleAnalytics();
  
  // Estados principales
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [spotsFile, setSpotsFile] = useState(null);
  const [spotsData, setSpotsData] = useState([]);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [causalResults, setCausalResults] = useState(null);
  const [temporalResults, setTemporalResults] = useState(null);
  const [roiResults, setRoiResults] = useState(null);
  const [attributionResults, setAttributionResults] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('');
  const [error, setError] = useState(null);
  const [setupComplete, setSetupComplete] = useState(false);

  // Instancias de servicios con useMemo
  const spotAnalysisService = useMemo(() => new SimpleSpotAnalysisService(), []);
  const databaseService = useMemo(() => new DatabaseSetupService(), []);
  const advancedCausalService = useMemo(() => new AdvancedCausalAnalysisService(), []);
  const causalService = useMemo(() => new CausalInferenceService(), []);
  const enhancedService = useMemo(() => new EnhancedSpotAnalysisService(), []);

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

  // ANÁLISIS CAUSAL AVANZADO COMPLETO
  const performAdvancedAnalysis = useCallback(async () => {
    if (spotsData.length === 0) {
      showWarning('Por favor, carga un archivo de spots válido', 'Archivo requerido');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setAnalysisStage('Iniciando análisis causal avanzado...');

    try {
      console.log('🔬 Starting comprehensive causal analysis...');
      
      // FASE 1: Análisis básico con IA
      setAnalysisStage('🤖 Ejecutando análisis con IA...');
      const aiAnalysis = await enhancedService.analyzeSpotsWithAI(spotsData, analyticsData);
      
      // FASE 2: Análisis de patrones
      setAnalysisStage('📊 Detectando patrones y tendencias...');
      const patternAnalysis = await enhancedService.detectPatternsAndTrends(spotsData, analyticsData);
      
      // FASE 3: Análisis causal principal
      setAnalysisStage('🧮 Realizando análisis causal riguroso...');
      const campaignData = {
        budget: 100000, // Ejemplo
        startDate: spotsData[0]?.fecha,
        endDate: spotsData[spotsData.length - 1]?.fecha
      };
      
      const causalAnalysis = await advancedCausalService.performComprehensiveCausalAnalysis(
        spotsData, 
        analyticsData, 
        campaignData
      );
      
      // FASE 4: Análisis temporal detallado
      setAnalysisStage('⏰ Analizando impacto temporal...');
      const temporalAnalysis = await advancedCausalService.performDetailedTemporalImpactAnalysis(
        spotsData, 
        analyticsData
      );
      
      // FASE 5: Análisis de ROI y conversiones
      setAnalysisStage('💰 Calculando ROI y conversiones...');
      const costData = {
        totalSpent: 50000,
        costPerSpot: 1000
      };
      
      const roiAnalysis = await advancedCausalService.performConversionROIAnalysis(
        spotsData, 
        analyticsData, 
        costData
      );
      
      // FASE 6: Análisis de atribución multi-touch
      setAnalysisStage('🛤️ Realizando análisis de atribución...');
      const customerJourneyData = {
        touchpoints: [],
        conversionPaths: []
      };
      
      const attributionAnalysis = await advancedCausalService.performMultiTouchAttributionAnalysis(
        spotsData, 
        analyticsData, 
        customerJourneyData
      );
      
      // FASE 7: Consolidación final
      setAnalysisStage('📋 Consolidando resultados finales...');
      
      const finalResults = {
        // Análisis básico
        aiAnalysis,
        patternAnalysis,
        
        // Análisis causal
        causalAnalysis,
        temporalAnalysis,
        roiAnalysis,
        attributionAnalysis,
        
        // Metadatos
        metadata: {
          totalSpots: spotsData.length,
          analysisDate: new Date().toISOString(),
          propertyId: selectedProperty || 'offline-analysis',
          accountId: selectedAccount || 'offline-analysis',
          hasAnalyticsData: !!(analyticsData && analyticsData.rows && analyticsData.rows.length > 0),
          analysisVersion: '2.0-advanced'
        },
        
        // Resumen ejecutivo
        executiveSummary: generateExecutiveSummary(causalAnalysis, temporalAnalysis, roiAnalysis),
        
        // Recomendaciones estratégicas
        strategicRecommendations: generateStrategicRecommendations(causalAnalysis, roiAnalysis),
        
        // Próximos pasos
        nextSteps: generateNextSteps(causalAnalysis, temporalAnalysis)
      };
      
      setAnalysisResults(finalResults);
      setCausalResults(causalAnalysis);
      setTemporalResults(temporalAnalysis);
      setRoiResults(roiAnalysis);
      setAttributionResults(attributionAnalysis);
      
      console.log('✅ Advanced causal analysis completed');
      showSuccess('Análisis causal avanzado completado exitosamente', 'Análisis terminado');
      
    } catch (error) {
      console.error('❌ Error in advanced analysis:', error);
      setError(error.message);
      showError(`Error durante el análisis: ${error.message}`, 'Error de análisis');
    } finally {
      setAnalyzing(false);
      setAnalysisStage('');
    }
  }, [spotsData, selectedProperty, selectedAccount, analyticsData, enhancedService, advancedCausalService]);

  // Generar resumen ejecutivo
  const generateExecutiveSummary = (causalAnalysis, temporalAnalysis, roiAnalysis) => {
    const hasCausalEffect = causalAnalysis?.interpretation?.causalEffect || false;
    const confidence = causalAnalysis?.confidence || 0;
    const roi = roiAnalysis?.roiMetrics?.overall?.roi || 0;
    
    return {
      title: hasCausalEffect ? 'Impacto Causal Confirmado' : 'Impacto No Concluyente',
      confidence: confidence,
      roi: roi,
      keyFinding: hasCausalEffect 
        ? `Los spots de TV tienen un impacto causal estadísticamente significativo en el tráfico web (confianza: ${confidence}%)`
        : 'Los resultados no muestran evidencia causal concluyente del impacto de los spots en el tráfico web',
      businessImpact: roi > 0 ? `ROI positivo del ${roi.toFixed(1)}%` : 'ROI no concluyente'
    };
  };

  // Generar recomendaciones estratégicas
  const generateStrategicRecommendations = (causalAnalysis, roiAnalysis) => {
    const recommendations = [];
    
    if (causalAnalysis?.interpretation?.causalEffect) {
      recommendations.push({
        priority: 'Alta',
        action: 'Escalar inversión',
        description: 'Los resultados confirman efectividad causal. Considerar aumentar presupuesto en spots similares.',
        expectedImpact: 'Alto'
      });
    }
    
    if (roiAnalysis?.roiMetrics?.byChannel) {
      const topChannel = Object.entries(roiAnalysis.roiMetrics.byChannel)
        .sort(([,a], [,b]) => (b.roi || 0) - (a.roi || 0))[0];
      
      if (topChannel && (topChannel[1].roi || 0) > 0) {
        recommendations.push({
          priority: 'Media',
          action: 'Optimizar mix de canales',
          description: `Enfocar ${topChannel[0]} que muestra mejor ROI`,
          expectedImpact: 'Medio'
        });
      }
    }
    
    return recommendations;
  };

  // Generar próximos pasos
  const generateNextSteps = (causalAnalysis, temporalAnalysis) => {
    const steps = [];
    
    if (causalAnalysis?.interpretation?.causalEffect) {
      steps.push('Implementar estrategia de escalamiento basada en resultados causales');
      steps.push('Monitorear métricas en tiempo real para validar hallazgos');
    }
    
    steps.push('Realizar análisis de sensibilidad con diferentes períodos');
    steps.push('Implementar tracking de conversiones más granular');
    
    return steps;
  };

  // Renderizar estado de carga inicial
  if (!setupComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Configurando sistema de análisis causal avanzado...</p>
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
        className="bg-gradient-to-r from-purple-700 via-blue-600 to-purple-800 rounded-xl shadow-xl p-6 text-white mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Brain className="h-8 w-8 mr-3" />
              Análisis Causal Avanzado TV-Web
            </h1>
            <p className="text-purple-100">
              Análisis estadístico riguroso del impacto causal de spots TV en tráfico web
            </p>
            <div className="mt-2 flex items-center space-x-4">
              <div className="px-3 py-1 bg-purple-600 rounded-full text-xs">
                🔬 Métodos Causal Inference
              </div>
              <div className="px-3 py-1 bg-blue-600 rounded-full text-xs">
                📊 Difference-in-Differences
              </div>
              <div className="px-3 py-1 bg-indigo-600 rounded-full text-xs">
                🎯 Synthetic Control
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{spotsData.length}</div>
            <div className="text-purple-200 text-sm">Spots Cargados</div>
            {causalResults && (
              <div className="mt-2">
                <div className="text-lg font-semibold">
                  {causalResults.interpretation?.causalEffect ? '✅ Efectivo' : '❓ Incierto'}
                </div>
                <div className="text-purple-200 text-sm">
                  Confianza: {causalResults.confidence || 0}%
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
            <div className="p-2 bg-purple-500 rounded-lg mr-3">
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Configuración del Análisis Causal</h2>
              <p className="text-gray-600">Selecciona cuenta, propiedad y carga datos para análisis estadístico riguroso</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Selecciona una propiedad</option>
                {filteredProperties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.displayName || property.property_name || property.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Archivo de Spots */}
            <div>
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
                  className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all bg-white"
                >
                  <Upload className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="text-sm text-gray-600 text-center">
                    {spotsFile ? (
                      <span className="text-purple-600 font-medium">{spotsFile.name}</span>
                    ) : (
                      'Subir Excel o CSV'
                    )}
                  </span>
                </label>
              </div>
              {spotsData.length > 0 && (
                <div className="mt-2 flex items-center text-sm text-purple-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {spotsData.length} spots cargados correctamente
                </div>
              )}
            </div>
          </div>

          {/* Estado de conexión */}
          {!isConnected && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  Conecta tu cuenta de Google Analytics para análisis causal con datos reales
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Botón de Análisis Causal */}
      <div className="p-6 pt-0">
        <div className="flex justify-center mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={performAdvancedAnalysis}
            disabled={spotsData.length === 0 || analyzing}
            className="inline-flex items-center px-12 py-4 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 hover:from-purple-700 hover:via-blue-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {analyzing ? (
              <>
                <RefreshCw className="h-6 w-6 mr-3 animate-spin" />
                {analysisStage || 'Analizando...'}
              </>
            ) : (
              <>
                <GitBranch className="h-6 w-6 mr-3" />
                Ejecutar Análisis Causal Avanzado
              </>
            )}
          </motion.button>
        </div>

        {/* Progreso del análisis */}
        {analyzing && (
          <div className="text-center py-8">
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200 max-w-md mx-auto">
              <RefreshCw className="h-8 w-8 text-purple-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-purple-900 mb-2">
                Análisis Causal en Progreso
              </h3>
              <p className="text-purple-700 text-sm mb-4">
                {analysisStage}
              </p>
              <div className="bg-purple-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
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
                Error en el análisis causal
              </h3>
              <p className="text-red-700 text-sm">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Resultados del análisis causal */}
        {analysisResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Resumen Ejecutivo Causal */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Award className="h-6 w-6 mr-2 text-purple-600" />
                Resumen Ejecutivo Causal
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {analysisResults.executiveSummary.confidence}%
                  </div>
                  <div className="text-sm text-purple-800">Confianza Causal</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analysisResults.executiveSummary.roi.toFixed(1)}%
                  </div>
                  <div className="text-sm text-green-800">ROI Estimado</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {causalResults?.interpretation?.causalEffect ? 'SÍ' : 'NO'}
                  </div>
                  <div className="text-sm text-blue-800">Efecto Causal</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {temporalResults?.optimalLag || 0}h
                  </div>
                  <div className="text-sm text-orange-800">Lag Óptimo</div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Conclusión Principal</h4>
                <p className="text-gray-700">{analysisResults.executiveSummary.keyFinding}</p>
              </div>
            </div>

            {/* Análisis Causal Detallado */}
            {causalResults && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-6 w-6 mr-2 text-blue-600" />
                  Análisis Causal Riguroso
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Métodos Aplicados</h4>
                    {causalResults.results?.methods?.map((method, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium text-blue-900">{method}</span>
                        <span className="text-xs text-blue-600">✓</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Validación de Robustez</h4>
                    {causalResults.robustness && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Placebo Tests</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            causalResults.robustness.checks?.placeboTests?.passed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {causalResults.robustness.checks?.placeboTests?.passed ? 'Pasó' : 'Falló'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Análisis de Sensibilidad</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            causalResults.robustness.checks?.sensitivityAnalysis?.robust 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {causalResults.robustness.checks?.sensitivityAnalysis?.robust ? 'Robusto' : 'Frágil'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Análisis Temporal */}
            {temporalResults && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-6 w-6 mr-2 text-green-600" />
                  Análisis Temporal Detallado
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {temporalResults.temporalWindows?.immediate?.impact?.toFixed(1) || 0}%
                    </div>
                    <div className="text-sm text-green-800">Impacto Inmediato</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {temporalResults.temporalWindows?.shortTerm?.impact?.toFixed(1) || 0}%
                    </div>
                    <div className="text-sm text-blue-800">Corto Plazo</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {temporalResults.temporalWindows?.mediumTerm?.impact?.toFixed(1) || 0}%
                    </div>
                    <div className="text-sm text-purple-800">Medio Plazo</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {temporalResults.temporalWindows?.longTerm?.impact?.toFixed(1) || 0}%
                    </div>
                    <div className="text-sm text-orange-800">Largo Plazo</div>
                  </div>
                </div>
              </div>
            )}

            {/* Análisis de ROI */}
            {roiResults && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="h-6 w-6 mr-2 text-yellow-600" />
                  Análisis de ROI y Conversiones
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {roiResults.roiMetrics?.overall?.roi?.toFixed(1) || 0}%
                    </div>
                    <div className="text-sm text-yellow-800">ROI Total</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {roiResults.attributableConversions?.total || 0}
                    </div>
                    <div className="text-sm text-green-800">Conversiones Atribuibles</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {roiResults.roiMetrics?.overall?.roas?.toFixed(1) || 0}x
                    </div>
                    <div className="text-sm text-blue-800">ROAS</div>
                  </div>
                </div>
              </div>
            )}

            {/* Recomendaciones Estratégicas */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Target className="h-6 w-6 mr-2 text-red-600" />
                Recomendaciones Estratégicas
              </h3>
              
              <div className="space-y-3">
                {analysisResults.strategicRecommendations?.map((rec, index) => (
                  <div key={index} className="flex items-start p-4 bg-red-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full mt-2 mr-3 ${
                      rec.priority === 'Alta' ? 'bg-red-500' : 
                      rec.priority === 'Media' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{rec.action}</h4>
                      <p className="text-gray-700 text-sm mt-1">{rec.description}</p>
                      <span className="text-xs text-gray-500 mt-1">Impacto esperado: {rec.expectedImpact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Próximos Pasos */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Zap className="h-6 w-6 mr-2 text-indigo-600" />
                Próximos Pasos
              </h3>
              
              <div className="space-y-2">
                {analysisResults.nextSteps?.map((step, index) => (
                  <div key={index} className="flex items-center p-3 bg-indigo-50 rounded-lg">
                    <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Estado inicial - Sin análisis */}
        {!analysisResults && !analyzing && (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Listo para análisis causal avanzado
              </h3>
              <p className="text-gray-600 mb-4">
                Configura tu cuenta de Google Analytics, carga el archivo de spots y ejecuta el análisis causal riguroso
              </p>
              <div className="text-sm text-gray-500">
                El sistema aplicará métodos estadísticos avanzados: Difference-in-Differences, Synthetic Control, 
                Propensity Score Matching y análisis de robustez
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotAnalysisAdvanced;
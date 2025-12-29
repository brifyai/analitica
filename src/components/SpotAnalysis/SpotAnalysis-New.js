import React, { useState, useCallback, useEffect } from 'react';
import { useGoogleAnalytics } from '../../contexts/GoogleAnalyticsContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase-new';
import ExcelJS from 'exceljs';
import { motion } from 'framer-motion';
import {
  Upload,
  BarChart3,
  TrendingUp,
  Eye,
  Users,
  MousePointer,
  AlertCircle,
  Download,
  RefreshCw,
  Brain,
  Zap,
  Target,
  Clock,
  TrendingDown,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { showError, showWarning, showSuccess } from '../../utils/swal';

// Componentes modernos
import LoadingSpinner from '../UI/LoadingSpinner';
import SimpleExportButton from '../UI/SimpleExportButton';

// Servicio de análisis de spots mejorado
import { EnhancedSpotAnalysisService } from '../../services/enhancedSpotAnalysisService';

const SpotAnalysisNew = () => {
  const { user } = useAuth();
  const { accounts, properties, getAnalyticsData, isConnected } = useGoogleAnalytics();
  
  // Estados principales
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [spotsFile, setSpotsFile] = useState(null);
  const [spotsData, setSpotsData] = useState([]);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Instancia del servicio de análisis mejorado
  const spotAnalysisService = new EnhancedSpotAnalysisService();

  // Filtrar propiedades basadas en la cuenta seleccionada
  const filteredProperties = selectedAccount
    ? properties.filter(prop => prop.accountId === selectedAccount)
    : [];

  // Ordenar cuentas alfabéticamente
  const sortedAccounts = [...accounts].sort((a, b) =>
    (a.displayName || a.account_name || a.name).localeCompare(b.displayName || b.account_name || b.name)
  );

  // Parsear archivo de spots (Excel o CSV)
  const parseSpotsFile = useCallback(async (file) => {
    console.log('📁 Parsing spots file:', file.name);
    
    return new Promise(async (resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target.result;
          let data = [];
          
          if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
            data = parseCSV(content);
          } else {
            data = await parseExcel(content);
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
  }, []);

  // Parsear CSV
  const parseCSV = (content) => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const delimiter = lines[0].includes(';') ? ';' : ',';
    const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
    
    const findColumnIndex = (possibleNames) => {
      for (const name of possibleNames) {
        const index = headers.findIndex(h => h === name.toLowerCase());
        if (index !== -1) return index;
      }
      return -1;
    };
    
    const fechaIndex = findColumnIndex(['fecha', 'date']);
    const horaIndex = findColumnIndex(['hora inicio', 'hora', 'time']);
    const canalIndex = findColumnIndex(['canal', 'channel']);
    const programaIndex = findColumnIndex(['titulo programa', 'programa', 'title']);
    
    if (fechaIndex === -1 || horaIndex === -1) {
      throw new Error('El archivo debe contener las columnas "fecha" y "hora inicio"');
    }
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(delimiter).map(v => v.trim());
      
      return {
        fecha: values[fechaIndex] || '',
        hora_inicio: values[horaIndex] || '',
        canal: values[canalIndex] || '',
        titulo_programa: values[programaIndex] || '',
        index: index
      };
    }).filter(spot => spot.fecha || spot.hora_inicio);
  };

  // Parsear Excel
  const parseExcel = async (content) => {
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
        if (cellValue && typeof cellValue === 'object' && cellValue.result !== undefined) {
          cellValue = cellValue.result;
        }
        rowData.push(cellValue);
      });
      jsonData.push(rowData);
    });
    
    if (jsonData.length === 0) {
      throw new Error('El archivo Excel está vacío');
    }
    
    // Usar la misma lógica de parseo que CSV
    const csvContent = jsonData.map(row => row.join(',')).join('\n');
    return parseCSV(csvContent);
  };

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
      const data = await parseSpotsFile(file);
      setSpotsData(data);
      showSuccess(`Archivo procesado exitosamente. ${data.length} spots cargados.`, 'Archivo cargado');
    } catch (error) {
      console.error('❌ Error processing file:', error);
      showError(`Error al procesar el archivo: ${error.message}`, 'Error de procesamiento');
      setSpotsFile(null);
      setSpotsData([]);
    }
  }, [parseSpotsFile]);

  // Obtener datos de Google Analytics
  const fetchAnalyticsData = useCallback(async () => {
    if (!selectedProperty || !isConnected) {
      throw new Error('Selecciona una propiedad y asegúrate de estar conectado a Google Analytics');
    }

    try {
      // Obtener accessToken
      const { data: { session } } = await supabase.auth.getSession();
      let accessToken;
      
      if (session?.provider_token) {
        accessToken = session.provider_token;
      } else {
        const { data: userProfile } = await supabase
          .from('users')
          .select('google_access_token')
          .eq('id', user.id)
          .single();
        
        if (!userProfile?.google_access_token) {
          throw new Error('No hay token de acceso disponible. Reconecta tu cuenta de Google Analytics.');
        }
        accessToken = userProfile.google_access_token;
      }

      // Obtener datos de los últimos 30 días
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const metrics = ['activeUsers', 'sessions', 'pageviews'];
      const dimensions = ['date', 'hour'];
      const dateRange = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };

      const analyticsData = await getAnalyticsData(accessToken, selectedProperty, metrics, dimensions, dateRange);
      
      if (!analyticsData || !analyticsData.rows || analyticsData.rows.length === 0) {
        throw new Error('No se encontraron datos en Google Analytics para el período seleccionado.');
      }

      return analyticsData;
    } catch (error) {
      console.error('❌ Error fetching analytics data:', error);
      throw error;
    }
  }, [selectedProperty, isConnected, user.id, getAnalyticsData]);

  // Realizar análisis completo de spots
  const performSpotAnalysis = useCallback(async () => {
    if (spotsData.length === 0) {
      showWarning('Por favor, carga un archivo de spots válido', 'Archivo requerido');
      return;
    }

    if (!selectedProperty) {
      showWarning('Por favor, selecciona una propiedad de Google Analytics', 'Propiedad requerida');
      return;
    }

    setAnalyzing(true);
    setAnalysisProgress(0);
    setError(null);

    try {
      console.log('🚀 Starting comprehensive spot analysis...');
      
      // Paso 1: Obtener datos de Analytics
      setAnalysisProgress(20);
      console.log('📊 Fetching Google Analytics data...');
      const analyticsData = await fetchAnalyticsData();
      
      // Paso 2: Analizar spots con IA
      setAnalysisProgress(40);
      console.log('🤖 Performing AI analysis...');
      const aiAnalysis = await spotAnalysisService.analyzeSpotsWithAI(spotsData, analyticsData);
      
      // Paso 3: Detectar patrones y tendencias
      setAnalysisProgress(60);
      console.log('📈 Detecting patterns and trends...');
      const patternAnalysis = await spotAnalysisService.detectPatternsAndTrends(spotsData, analyticsData);
      
      // Paso 4: Calcular impacto en tráfico web
      setAnalysisProgress(80);
      console.log('🎯 Calculating web traffic impact...');
      const impactAnalysis = await spotAnalysisService.calculateWebTrafficImpact(spotsData, analyticsData);
      
      // Paso 5: Generar insights finales
      setAnalysisProgress(90);
      console.log('💡 Generating final insights...');
      const finalInsights = await spotAnalysisService.generateFinalInsights(
        spotsData, 
        analyticsData, 
        aiAnalysis, 
        patternAnalysis, 
        impactAnalysis
      );
      
      // Compilar resultados
      const results = {
        spotsAnalyzed: spotsData.length,
        aiAnalysis,
        patternAnalysis,
        impactAnalysis,
        finalInsights,
        analyticsData,
        timestamp: new Date().toISOString(),
        propertyId: selectedProperty,
        accountId: selectedAccount
      };
      
      setAnalysisResults(results);
      setAnalysisProgress(100);
      
      console.log('✅ Spot analysis completed successfully');
      showSuccess('Análisis completado exitosamente', 'Análisis terminado');
      
    } catch (error) {
      console.error('❌ Error in spot analysis:', error);
      setError(error.message);
      showError(`Error durante el análisis: ${error.message}`, 'Error de análisis');
    } finally {
      setAnalyzing(false);
      setAnalysisProgress(0);
    }
  }, [spotsData, selectedProperty, selectedAccount, fetchAnalyticsData, spotAnalysisService]);

  // Renderizar estado de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Principal */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-xl shadow-xl p-6 text-white mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Análisis Inteligente de Spots TV
            </h1>
            <p className="text-blue-100">
              Plataforma avanzada con IA para analizar el impacto de spots en el tráfico web
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{spotsData.length}</div>
            <div className="text-blue-200 text-sm">Spots Cargados</div>
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
            <div className="p-2 bg-blue-500 rounded-lg mr-3">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Configuración del Análisis</h2>
              <p className="text-gray-600">Selecciona tu cuenta, propiedad y carga el archivo de spots</p>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
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
          </div>

          {/* Estado de conexión */}
          {!isConnected && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  Conecta tu cuenta de Google Analytics para acceder a datos reales
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Botón de Análisis Principal */}
      <div className="p-6 pt-0">
        <div className="flex justify-center mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={performSpotAnalysis}
            disabled={spotsData.length === 0 || !selectedProperty || analyzing}
            className="inline-flex items-center px-12 py-4 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {analyzing ? (
              <>
                <RefreshCw className="h-6 w-6 mr-3 animate-spin" />
                Analizando Spots...
              </>
            ) : (
              <>
                <Brain className="h-6 w-6 mr-3" />
                Analizar Impacto con IA
              </>
            )}
          </motion.button>
        </div>

        {/* Progreso del análisis */}
        {analyzing && (
          <div className="text-center py-8">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 max-w-md mx-auto">
              <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Analizando spots con inteligencia artificial
              </h3>
              <p className="text-blue-700 text-sm mb-4">
                Procesando datos, detectando patrones y calculando impacto
              </p>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              <p className="text-xs text-blue-600 mt-2">
                {analysisProgress}% completado
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-8">
            <div className="bg-red-50 rounded-xl p-6 border border-red-200 max-w-md mx-auto">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-900 mb-2">
                Error en el análisis
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
            {/* Resumen Ejecutivo */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Resumen Ejecutivo</h3>
                <SimpleExportButton exportType="summary" className="z-10" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{analysisResults.spotsAnalyzed}</div>
                  <div className="text-sm text-blue-800">Spots Analizados</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analysisResults.impactAnalysis?.totalImpact?.percentage || 0}%
                  </div>
                  <div className="text-sm text-green-800">Impacto Promedio</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {analysisResults.patternAnalysis?.successfulSpots || 0}
                  </div>
                  <div className="text-sm text-purple-800">Spots Exitosos</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {analysisResults.finalInsights?.confidenceLevel || 0}%
                  </div>
                  <div className="text-sm text-orange-800">Nivel de Confianza</div>
                </div>
              </div>
            </div>

            {/* Análisis de IA */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Análisis con Inteligencia Artificial</h3>
                <SimpleExportButton exportType="ai-analysis" className="z-10" />
              </div>
              
              <div className="space-y-4">
                {analysisResults.aiAnalysis?.insights?.map((insight, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <Brain className="h-5 w-5 text-blue-500 mr-3 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{insight.category}</h4>
                        <p className="text-gray-700 text-sm mt-1">{insight.description}</p>
                        {insight.score && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">Puntuación: </span>
                            <span className="text-sm font-medium text-blue-600">{insight.score}/10</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Patrones y Tendencias */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Patrones y Tendencias Detectados</h3>
                <SimpleExportButton exportType="patterns" className="z-10" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                    <h4 className="font-semibold text-blue-900">Horarios Óptimos</h4>
                  </div>
                  <p className="text-blue-800 text-sm">
                    {analysisResults.patternAnalysis?.optimalTimes?.join(', ') || 'No identificado'}
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Target className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-green-900">Canales Exitosos</h4>
                  </div>
                  <p className="text-green-800 text-sm">
                    {analysisResults.patternAnalysis?.topChannels?.join(', ') || 'No identificado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Impacto en Tráfico Web */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Impacto en Tráfico Web</h3>
                <SimpleExportButton exportType="traffic-impact" className="z-10" />
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {analysisResults.impactAnalysis?.usersIncrease || 0}%
                    </div>
                    <div className="text-sm text-gray-600">Aumento en Usuarios</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {analysisResults.impactAnalysis?.sessionsIncrease || 0}%
                    </div>
                    <div className="text-sm text-gray-600">Aumento en Sesiones</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {analysisResults.impactAnalysis?.pageviewsIncrease || 0}%
                    </div>
                    <div className="text-sm text-gray-600">Aumento en Vistas</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-500 mr-3 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Conclusión del Impacto</h4>
                      <p className="text-gray-700 text-sm mt-1">
                        {analysisResults.impactAnalysis?.conclusion || 'Análisis en proceso...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights Finales */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Recomendaciones Finales</h3>
                <SimpleExportButton exportType="recommendations" className="z-10" />
              </div>
              
              <div className="space-y-3">
                {analysisResults.finalInsights?.recommendations?.map((recommendation, index) => (
                  <div key={index} className="flex items-start">
                    <Zap className="h-5 w-5 text-yellow-500 mr-3 mt-1" />
                    <p className="text-gray-700 text-sm">{recommendation}</p>
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
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Listo para el análisis inteligente
              </h3>
              <p className="text-gray-600 mb-4">
                Configura tu cuenta de Google Analytics, carga el archivo de spots y deja que la IA analice el impacto
              </p>
              <div className="text-sm text-gray-500">
                La plataforma detectará patrones, tendencias y calculará el impacto real en tu tráfico web
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotAnalysisNew;
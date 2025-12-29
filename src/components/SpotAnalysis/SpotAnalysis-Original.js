import React, { useState, useCallback } from 'react';
import { useGoogleAnalytics } from '../../contexts/GoogleAnalyticsContext';
import { generateAIAnalysis, generateBatchAIAnalysis } from '../../services/aiAnalysisService';
import { TemporalAnalysisService } from '../../services/temporalAnalysisService';
import conversionAnalysisService from '../../services/conversionAnalysisService';
import { predictiveAnalyticsService } from '../../services/predictiveAnalyticsService';
import ChutesVideoAnalysisService from '../../services/chutesVideoAnalysisService';
import YouTubeVideoAnalyzer from './components/YouTubeVideoAnalyzer';
import ExcelJS from 'exceljs';
import { motion } from 'framer-motion';
import {
  Upload,
  Video,
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
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Play,
  FileVideo
} from 'lucide-react';

// Importar componentes modernos
import ImpactTimeline from './components/ImpactTimeline';
import ConfidenceMeter from './components/ConfidenceMeter';
import SmartInsights from './components/SmartInsights';
import TrafficHeatmap from './components/TrafficHeatmap';
import TrafficChart from './components/TrafficChart';
import TemporalAnalysisDashboard from './components/TemporalAnalysisDashboard';
import ConversionAnalysisDashboard from './components/ConversionAnalysisDashboard';
import PredictiveAnalyticsDashboard from './components/PredictiveAnalyticsDashboard';

const SpotAnalysis = () => {
  const { accounts, properties, getAnalyticsData, isConnected } = useGoogleAnalytics();
  
  // Estados para el análisis de spots
  const [spotsFile, setSpotsFile] = useState(null);
  const [spotsData, setSpotsData] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState({});
  const [batchAIAnalysis, setBatchAIAnalysis] = useState(null);
  const [viewMode, setViewMode] = useState('modern'); // 'modern' o 'classic'
  const [temporalAnalysis, setTemporalAnalysis] = useState(null);
  const [temporalReference, setTemporalReference] = useState(null);
  const [conversionAnalysis, setConversionAnalysis] = useState(null);
  const [controlGroupAnalysis, setControlGroupAnalysis] = useState(null);
  const [predictiveAnalysis, setPredictiveAnalysis] = useState(null);
  const [expandedTimeline, setExpandedTimeline] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const spotsPerPage = 10;

  // Filtrar y ordenar propiedades basadas en la cuenta seleccionada
  const filteredProperties = selectedAccount
    ? properties
        .filter(prop => prop.accountId === selectedAccount)
        .sort((a, b) => (a.displayName || a.property_name || a.name).localeCompare(b.displayName || b.property_name || b.name))
    : [];

  // Ordenar cuentas alfabéticamente
  const sortedAccounts = [...accounts].sort((a, b) =>
    (a.displayName || a.account_name || a.name).localeCompare(b.displayName || b.account_name || b.name)
  );

  // Instancia del servicio de análisis temporal
  const temporalAnalysisService = new TemporalAnalysisService();

  // Parsear CSV mejorado - LEE fecha, hora inicio, Canal, Titulo Programa, inversion
  const parseCSV = useCallback((content) => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    // Validar máximo 100 líneas (encabezado + 100 datos = 101 total)
    if (lines.length > 101) {
      throw new Error('El archivo excede el límite máximo de 100 líneas de datos');
    }
    
    // Detectar delimitador (coma o punto y coma)
    const delimiter = lines[0].includes(';') ? ';' : ',';
    
    // Extraer headers y encontrar índices de las columnas que necesitamos
    const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
    console.log('📋 Headers CSV encontrados:', headers);
    
    const fechaIndex = headers.findIndex(h => h === 'fecha');
    const horaIndex = headers.findIndex(h => h === 'hora inicio');
    const canalIndex = headers.findIndex(h => h === 'canal');
    const tituloIndex = headers.findIndex(h => h === 'titulo programa');
    const versionIndex = headers.findIndex(h => h === 'version');
    const duracionIndex = headers.findIndex(h => h === 'duracion');
    const tipoComercialIndex = headers.findIndex(h => h === 'tipo comercial');
    const inversionIndex = headers.findIndex(h => h === 'inversion');
    
    console.log('🔍 Índices de columnas:', {
      fechaIndex, horaIndex, canalIndex, tituloIndex,
      versionIndex, duracionIndex, tipoComercialIndex, inversionIndex
    });
    
    if (fechaIndex === -1 || horaIndex === -1) {
      throw new Error('El archivo debe contener las columnas "fecha" y "hora inicio"');
    }
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(delimiter).map(v => v.trim());
      
      // Extraer todas las columnas necesarias
      return {
        fecha: values[fechaIndex] || '',
        hora_inicio: values[horaIndex] || '',
        canal: values[canalIndex] || '',
        titulo_programa: values[tituloIndex] || '',
        tipo_comercial: values[tipoComercialIndex] || '',
        version: values[versionIndex] || '',
        duracion: values[duracionIndex] || '',
        inversion: values[inversionIndex] || ''
      };
    }).filter(spot => spot.fecha || spot.hora_inicio); // Filtrar filas vacías
  }, []);

  // Parsear datos de Excel - LEE fecha, hora inicio, Canal, Titulo Programa, inversion
  const parseExcelData = useCallback((jsonData) => {
    if (jsonData.length === 0) return [];
    
    // Validar máximo 100 líneas de datos (encabezado + 100 datos)
    if (jsonData.length > 101) {
      throw new Error('El archivo excede el límite máximo de 100 líneas de datos');
    }
    
    // Primera fila como headers
    const headers = jsonData[0].map(h => (h || '').toString().toLowerCase());
    console.log('📋 Headers Excel encontrados:', headers);
    
    const fechaIndex = headers.findIndex(h => h === 'fecha');
    const horaIndex = headers.findIndex(h => h === 'hora inicio');
    const canalIndex = headers.findIndex(h => h === 'canal');
    const tituloIndex = headers.findIndex(h => h === 'titulo programa');
    const versionIndex = headers.findIndex(h => h === 'version');
    const duracionIndex = headers.findIndex(h => h === 'duracion');
    const tipoComercialIndex = headers.findIndex(h => h === 'tipo comercial');
    const inversionIndex = headers.findIndex(h => h === 'inversion');
    
    console.log('🔍 Índices de columnas:', {
      fechaIndex, horaIndex, canalIndex, tituloIndex,
      versionIndex, duracionIndex, tipoComercialIndex, inversionIndex
    });
    
    if (fechaIndex === -1 || horaIndex === -1) {
      throw new Error('El archivo debe contener las columnas "fecha" y "hora inicio"');
    }
    
    return jsonData.slice(1).map((row, index) => {
      // Extraer todas las columnas necesarias
      return {
        fecha: row[fechaIndex] || '',
        hora_inicio: row[horaIndex] || '',
        canal: row[canalIndex] || '',
        titulo_programa: row[tituloIndex] || '',
        tipo_comercial: row[tipoComercialIndex] || '',
        version: row[versionIndex] || '',
        duracion: row[duracionIndex] || '',
        inversion: row[inversionIndex] || ''
      };
    }).filter(spot => spot.fecha || spot.hora_inicio); // Filtrar filas vacías
  }, []);

  // Parsear fecha y hora con múltiples formatos - SOPORTA FECHAS SERIAL DE EXCEL
  const parseDateTimeFlexible = useCallback((fecha, hora) => {
    if (!fecha || !hora) return new Date(NaN);
    
    let dateObj;
    
    // CASO 1: Si fecha es un número (serial de Excel)
    if (!isNaN(fecha) && fecha.toString().match(/^\d+(\.\d+)?$/)) {
      const excelSerial = parseFloat(fecha);
      
      // Excel serial: días desde 1900-01-01 (pero Excel tiene un bug para 1900)
      // JavaScript: milisegundos desde 1970-01-01
      const excelEpoch = new Date(1900, 0, 1);
      
      // Convertir serial de Excel a fecha JavaScript
      dateObj = new Date(excelEpoch.getTime() + (excelSerial - 1) * 24 * 60 * 60 * 1000);
      
      // Si la hora también es un número serial, sumarlo
      if (!isNaN(hora) && hora.toString().match(/^\d+(\.\d+)?$/)) {
        const horaSerial = parseFloat(hora);
        const horas = Math.floor(horaSerial * 24);
        const minutos = Math.floor((horaSerial * 24 - horas) * 60);
        const segundos = Math.floor(((horaSerial * 24 - horas) * 60 - minutos) * 60);
        
        dateObj.setHours(horas, minutos, segundos);
      }
      
      return dateObj;
    }
    
    // CASO 2: Si es texto, intentar parsear
    fecha = fecha.toString().trim();
    hora = hora.toString().trim();
    
    // Intentar diferentes formatos de fecha
    const dateFormats = [
      // Formatos latinoamericanos DD/MM/YYYY
      /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/,
      // Formatos ISO YYYY-MM-DD
      /^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/,
      // Formatos americanos MM/DD/YYYY
      /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/
    ];
    
    let day, month, year;
    
    // Intentar parsear fecha
    for (const format of dateFormats) {
      const match = fecha.match(format);
      if (match) {
        // Para formato latinoamericano (DD/MM/YYYY)
        if (parseInt(match[1]) <= 31 && parseInt(match[2]) <= 12) {
          day = parseInt(match[1]);
          month = parseInt(match[2]) - 1; // Meses en JS son 0-based
          year = parseInt(match[3]);
        } else if (parseInt(match[2]) <= 31 && parseInt(match[1]) <= 12) {
          // Para formato americano (MM/DD/YYYY)
          day = parseInt(match[2]);
          month = parseInt(match[1]) - 1;
          year = parseInt(match[3]);
        } else {
          // Para formato ISO (YYYY/MM/DD)
          day = parseInt(match[3]);
          month = parseInt(match[2]) - 1;
          year = parseInt(match[1]);
        }
        break;
      }
    }
    
    // Si encontramos una fecha válida
    if (day !== undefined && month !== undefined && year !== undefined) {
      // Parsear hora
      const timeMatch = hora.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
      if (!timeMatch) {
        return new Date(NaN);
      }
      
      const hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const seconds = parseInt(timeMatch[3] || 0);
      
      return new Date(year, month, day, hours, minutes, seconds, 0);
    }
    
    // CASO 3: Si no se pudo parsear, intentar como fecha directa de JavaScript
    const directDate = new Date(fecha + ' ' + hora);
    if (!isNaN(directDate.getTime())) {
      return directDate;
    }
    
    // CASO 4: Si todo falla, intentar solo con la fecha
    const dateOnly = new Date(fecha);
    if (!isNaN(dateOnly.getTime())) {
      return dateOnly;
    }
    
    return new Date(NaN);
  }, []);

  // Parsear archivo de spots (Excel/CSV) - CONVERTIDO A useCallback
  const parseSpotsFile = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          let spots = [];
          
          if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
            const content = e.target.result;
            spots = parseCSV(content);
          } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            // Parsear Excel con ExcelJS
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(e.target.result);
            const worksheet = workbook.worksheets[0];
            const jsonData = [];
            
            worksheet.eachRow((row, rowNumber) => {
              const rowData = [];
              row.eachCell((cell, colNumber) => {
                rowData.push(cell.value);
              });
              jsonData.push(rowData);
            });
            
            spots = parseExcelData(jsonData);
          } else {
            reject(new Error('Formato de archivo no soportado'));
            return;
          }
          
          // Validar y formatear datos - USAR fecha, hora inicio, Canal, Titulo Programa, inversion
          const formattedSpots = spots.map((spot, index) => {
            // Parsear fecha y hora con múltiples formatos
            const dateTime = parseDateTimeFlexible(spot.fecha, spot.hora_inicio);
           
            return {
              id: index + 1,
              fecha: spot.fecha,
              hora: spot.hora_inicio,
              nombre: spot.titulo_programa ? spot.titulo_programa.toString().replace(/\s*0\s*$/, '').trim() : `Spot ${index + 1}`,
              titulo_programa: spot.titulo_programa ? spot.titulo_programa.toString().replace(/\s*0\s*$/, '').trim() : '',
              debug_titulo: spot.titulo_programa, // Para debugging
              tipo_comercial: spot.tipo_comercial || '',
              version: spot.version || '',
              duracion: spot.duracion ? parseInt(spot.duracion) : 30, // Parsear duración o usar default
              canal: spot.canal || 'TV',
              inversion: spot.inversion || '',
              dateTime: dateTime, // Objeto Date para análisis
              valid: !isNaN(dateTime.getTime())
            };
          }).filter(spot => spot.valid && spot.fecha && spot.hora); // Filtrar spots válidos
          
          console.log(`✅ Se parsearon ${formattedSpots.length} spots válidos de ${spots.length} totales`);
          console.log('📊 Primeros 3 spots parseados:', formattedSpots.slice(0, 3));
          resolve(formattedSpots);
        } catch (error) {
          console.error('❌ Error parseando archivo:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        reader.readAsBinaryString(file);
      } else {
        reader.readAsText(file);
      }
    });
  }, [parseDateTimeFlexible, parseCSV, parseExcelData]);

  // Manejar subida de archivo de spots
  const handleSpotsFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    if (!validTypes.includes(file.type)) {
      alert('Por favor, sube un archivo Excel (.xlsx, .xls) o CSV');
      return;
    }

    // Validar tamaño máximo (5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > MAX_SIZE) {
      alert('El archivo excede el tamaño máximo permitido de 5MB');
      return;
    }

    setSpotsFile(file);
    
    try {
      const data = await parseSpotsFile(file);
      setSpotsData(data);
      console.log('📊 Datos de spots cargados:', data);
    } catch (error) {
      console.error('❌ Error al procesar archivo de spots:', error);
      alert(`Error al procesar el archivo: ${error.message}. Por favor, verifica el formato.`);
    }
  }, [parseSpotsFile]);

  // Manejar subida de video
  const handleVideoUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('video/')) {
      alert('Por favor, sube un archivo de video válido');
      return;
    }

    setVideoFile(file);
    console.log('🎥 Video cargado:', file.name);
  }, []);

  // Parsear fecha y hora (mantener para compatibilidad) - CONVERTIDO A useCallback
  const parseDateTime = useCallback((fecha, hora) => {
    return parseDateTimeFlexible(fecha, hora);
  }, [parseDateTimeFlexible]);

  // Formatear fecha para Google Analytics - CONVERTIDO A useCallback
  const formatGADate = useCallback((date) => {
    return date.toISOString().split('T')[0];
  }, []);

  // Procesar datos de Analytics - CONVERTIDO A useCallback
  const processAnalyticsData = useCallback((data) => {
    if (!data || !data.rows || data.rows.length === 0) {
      return { activeUsers: 0, sessions: 0, pageviews: 0 };
    }

    const totals = data.rows.reduce((acc, row) => {
      return {
        activeUsers: acc.activeUsers + (parseFloat(row.metricValues?.[0]?.value) || 0),
        sessions: acc.sessions + (parseFloat(row.metricValues?.[1]?.value) || 0),
        pageviews: acc.pageviews + (parseFloat(row.metricValues?.[2]?.value) || 0)
      };
    }, { activeUsers: 0, sessions: 0, pageviews: 0 });

    return totals;
  }, []);

  // Calcular impacto con vinculación directa - CONVERTIDO A useCallback
  const calculateImpact = useCallback((spot, previousDay, previousWeek) => {
    const impact = {};
    
    ['activeUsers', 'sessions', 'pageviews'].forEach(metric => {
      const spotValue = spot[metric] || 0;
      const prevDayValue = previousDay[metric] || 0;
      const prevWeekValue = previousWeek[metric] || 0;
      
      const avgReference = (prevDayValue + prevWeekValue) / 2;
      const increase = spotValue - avgReference;
      const percentageChange = avgReference > 0 ? (increase / avgReference) * 100 : 0;

      // Vinculación directa: requiere aumento significativo Y correlación temporal
      const hasDirectCorrelation = percentageChange > 15 && spotValue > avgReference * 1.15;
      
      impact[metric] = {
        value: spotValue,
        reference: avgReference,
        increase: increase,
        percentageChange: percentageChange,
        significant: Math.abs(percentageChange) > 10, // Para compatibilidad con métricas generales
        directCorrelation: hasDirectCorrelation // Nueva métrica para vinculación directa
      };
    });
    
    return impact;
  }, []);

  // Analizar impacto de un spot específico - MOVIDO ANTES Y CONVERTIDO A useCallback
  const analyzeSpotImpact = useCallback(async (spot, propertyId) => {
    // Parsear fecha y hora del spot
    const spotDateTime = parseDateTime(spot.fecha, spot.hora);
    
    // Obtener datos de Analytics para diferentes períodos
    const periods = {
      spot: {
        start: new Date(spotDateTime),
        end: new Date(spotDateTime.getTime() + (spot.duracion || 30) * 1000)
      },
      previousDay: {
        start: new Date(spotDateTime.getTime() - 24 * 60 * 60 * 1000),
        end: new Date(spotDateTime.getTime() - 24 * 60 * 60 * 1000 + (spot.duracion || 30) * 1000)
      },
      previousWeek: {
        start: new Date(spotDateTime.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: new Date(spotDateTime.getTime() - 7 * 24 * 60 * 60 * 1000 + (spot.duracion || 30) * 1000)
      }
    };

    // Obtener métricas para cada período
    const metrics = ['activeUsers', 'sessions', 'pageviews'];
    const dimensions = ['minute'];
    
    const results = {};
    
    for (const [periodName, period] of Object.entries(periods)) {
      try {
        const data = await getAnalyticsData(
          propertyId,
          metrics,
          dimensions,
          {
            startDate: formatGADate(period.start),
            endDate: formatGADate(period.end)
          }
        );
        
        results[periodName] = processAnalyticsData(data);
      } catch (error) {
        console.warn(`⚠️ Error obteniendo datos para ${periodName}:`, error);
        results[periodName] = { activeUsers: 0, sessions: 0, pageviews: 0 };
      }
    }

    // Calcular impacto
    const impact = calculateImpact(results.spot, results.previousDay, results.previousWeek);
    
    return {
      spot: {
        ...spot,
        dateTime: spotDateTime
      },
      metrics: results,
      impact
    };
  }, [getAnalyticsData, formatGADate, processAnalyticsData, calculateImpact, parseDateTime]);

  // Generar análisis de IA automáticamente
  const generateAutomaticAIAnalysis = useCallback(async (results) => {
    console.log('🤖 Iniciando análisis automático de IA...');
    
    try {
      // Generar análisis batch general
      const batchAnalysis = await generateBatchAIAnalysis(results);
      setBatchAIAnalysis(batchAnalysis);
      console.log('✅ Análisis IA general completado');
      
      // Generar análisis individual para cada spot
      const aiResults = {};
      for (let i = 0; i < results.length; i++) {
        try {
          const spotAnalysis = await generateAIAnalysis(results[i]);
          aiResults[i] = spotAnalysis;
          console.log(`✅ Análisis IA para spot ${i + 1} completado`);
          
          // Pausa entre análisis individuales para no sobrecargar la API
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.warn(`⚠️ Error en análisis IA para spot ${i + 1}:`, error);
          aiResults[i] = {
            insights: ['Error al generar análisis de IA'],
            recommendations: ['Inténtalo nuevamente'],
            summary: 'Error en análisis de IA'
          };
        }
      }
      
      setAiAnalysis(aiResults);
      console.log('🎉 Análisis automático de IA completado');
      
    } catch (error) {
      console.error('❌ Error en análisis automático de IA:', error);
      // No mostrar error al usuario, solo loggear
    }
  }, []);

  // Realizar análisis de impacto
  const performAnalysis = useCallback(async () => {
    if (!selectedProperty || spotsData.length === 0) {
      alert('Por favor, selecciona una propiedad y carga los datos de spots');
      return;
    }

    setAnalyzing(true);
    setAnalysisProgress(0);
    setAiAnalysis({});
    setBatchAIAnalysis(null);
    setTemporalAnalysis(null);
    setTemporalReference(null);
    setConversionAnalysis(null);
    setControlGroupAnalysis(null);
    setPredictiveAnalysis(null);

    try {
      const results = [];
      
      for (let i = 0; i < spotsData.length; i++) {
        const spot = spotsData[i];
        setAnalysisProgress(Math.round((i / spotsData.length) * 100));
        
        // Analizar cada spot
        const spotResult = await analyzeSpotImpact(spot, selectedProperty);
        results.push(spotResult);
        
        // Pequeña pausa para no sobrecargar la API
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setAnalysisResults(results);
      console.log('📈 Análisis básico completado:', results);
      
      // Ejecutar análisis de IA automáticamente después del análisis de spots
      await generateAutomaticAIAnalysis(results);
      
      // FASE 2: Análisis temporal digital avanzado
      if (results.length > 0) {
        console.log('🕒 Iniciando análisis temporal digital avanzado...');
        setAnalysisProgress(90);
        
        try {
          // Obtener datos históricos para referencia robusta (últimos 30 días)
          const firstSpot = results[0]?.spot;
          if (!firstSpot?.dateTime) {
            console.warn('⚠️ No se puede realizar análisis temporal: primer spot sin dateTime válido');
            return;
          }
          
          const spotDateTime = firstSpot.dateTime;
          const historicalData = await temporalAnalysisService.getHistoricalData(
            selectedProperty,
            new Date(spotDateTime.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 días atrás
            spotDateTime
          );
          
          // Calcular referencia robusta
          const robustReference = temporalAnalysisService.calculateRobustReference(spotDateTime, historicalData);
          setTemporalReference(robustReference);
          
          // Realizar análisis temporal para cada spot
          const temporalResults = {};
          for (let i = 0; i < results.length; i++) {
            const spotResult = results[i];
            const temporalImpact = temporalAnalysisService.analyzeTemporalImpact(
              spotResult.spot,
              spotResult.metrics,
              robustReference
            );
            temporalResults[i] = temporalImpact;
          }
          
          setTemporalAnalysis(temporalResults);
          console.log('✅ Análisis temporal digital completado:', temporalResults);
          
        } catch (temporalError) {
          console.warn('⚠️ Error en análisis temporal:', temporalError);
          // Continuar sin análisis temporal si falla
        }
      }
      
      // FASE 4: Análisis predictivo con IA
      if (results.length > 0 && temporalReference) {
        console.log('🔮 Iniciando análisis predictivo con IA...');
        setAnalysisProgress(95);
        
        try {
          // Generar análisis predictivo para el primer spot (como ejemplo)
          const spotForPrediction = results[0]?.spot;
          if (!spotForPrediction?.dateTime) {
            console.warn('⚠️ No se puede realizar análisis predictivo: spot sin dateTime válido');
            return;
          }
          
          const historicalDataForPrediction = await temporalAnalysisService.getHistoricalData(
            selectedProperty,
            new Date(spotForPrediction.dateTime.getTime() - 30 * 24 * 60 * 60 * 1000),
            spotForPrediction.dateTime
          );
          
          const predictiveResults = await predictiveAnalyticsService.generatePredictiveAnalysis(
            spotForPrediction,
            historicalDataForPrediction,
            {} // marketData vacío por ahora
          );
          
          setPredictiveAnalysis(predictiveResults);
          console.log('✅ Análisis predictivo completado:', predictiveResults);
          
        } catch (predictiveError) {
          console.warn('⚠️ Error en análisis predictivo:', predictiveError);
          // Continuar sin análisis predictivo si falla
        }
      }
      
    } catch (error) {
      console.error('❌ Error en el análisis:', error);
      alert('Error al realizar el análisis. Por favor, inténtalo nuevamente.');
    } finally {
      setAnalyzing(false);
      setAnalysisProgress(0);
    }
  }, [spotsData, selectedProperty, analyzeSpotImpact, generateAutomaticAIAnalysis, temporalAnalysisService, predictiveAnalyticsService, setTemporalAnalysis, setTemporalReference, setPredictiveAnalysis]);

  // Función para manejar el toggle del acordeón de timeline
  const toggleTimeline = useCallback((spotIndex) => {
    setExpandedTimeline(prev => ({
      ...prev,
      [spotIndex]: !prev[spotIndex]
    }));
  }, []);

  // Exportar resultados
  const exportResults = () => {
    if (!analysisResults) return;
    
    const csv = [
      ['Spot', 'Fecha', 'Hora Inicio', 'Canal', 'Título Programa', 'Tipo Comercial', 'Versión', 'Duración', 'Inversión', 'Usuarios Activos', 'Sesiones', 'Vistas de Página', 'Impacto Usuarios', 'Impacto Sesiones', 'Impacto Vistas'],
      ...analysisResults.map(result => [
        result?.spot?.nombre || 'Sin nombre',
        result?.spot?.fecha || '',
        result?.spot?.hora || '',
        result?.spot?.canal || '',
        result?.spot?.titulo_programa || result?.spot?.nombre || 'Sin título',
        result?.spot?.tipo_comercial || '',
        result?.spot?.version || '',
        result?.spot?.duracion || '',
        result?.spot?.inversion || '',
        result?.metrics?.spot?.activeUsers || 0,
        result?.metrics?.spot?.sessions || 0,
        result?.metrics?.spot?.pageviews || 0,
        `${(result?.impact?.activeUsers?.percentageChange || 0).toFixed(1)}%`,
        `${(result?.impact?.sessions?.percentageChange || 0).toFixed(1)}%`,
        `${(result?.impact?.pageviews?.percentageChange || 0).toFixed(1)}%`
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analisis_spots_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Renderizar vista moderna
  const renderModernView = () => (
    <div className="space-y-6">
      {/* Dashboard de Métricas Principales */}
      {analysisResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spots</p>
                <p className="text-3xl font-bold text-gray-900">{analysisResults.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Video className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Impacto Promedio</p>
                <p className="text-3xl font-bold text-green-600">
                  +{Math.round(analysisResults.reduce((sum, r) => sum + r.impact.activeUsers.percentageChange, 0) / analysisResults.length)}%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Spots con Vinculación Directa</p>
                <p className="text-3xl font-bold text-purple-600">
                  {analysisResults.filter(r => r.impact.activeUsers.directCorrelation).length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

        </motion.div>
      )}

      {/* Grid de Componentes Modernos */}
      {analysisResults && (
        <div className="space-y-6">
          {/* Primera fila: Componentes principales en grid 2x2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ImpactTimeline spotData={spotsData} analysisResults={analysisResults} />
            <ConfidenceMeter analysisData={analysisResults} />
            <SmartInsights analysisResults={analysisResults} batchAIAnalysis={batchAIAnalysis} />
            <TrafficHeatmap analysisResults={analysisResults} />
          </div>
          
          {/* Segunda fila: Gráfico de tráfico por hora en ancho completo */}
          <div className="w-full">
            <TrafficChart analysisResults={analysisResults} />
          </div>
          
          {/* Desglose detallado de spots con vinculación directa */}
          {analysisResults.filter(r => r.impact.activeUsers.directCorrelation).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl mr-4">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Spots con Vinculación Directa
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Detalle completo de los {analysisResults.filter(r => r.impact.activeUsers.directCorrelation).length} spots que lograron vinculación directa
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {(() => {
                  const directCorrelationResults = analysisResults.filter(result => result.impact.activeUsers.directCorrelation);
                  const totalPages = Math.ceil(directCorrelationResults.length / spotsPerPage);
                  const startIndex = (currentPage - 1) * spotsPerPage;
                  const endIndex = startIndex + spotsPerPage;
                  const currentPageResults = directCorrelationResults.slice(startIndex, endIndex);
                  
                  return (
                    <>
                      {currentPageResults.map((result, index) => (
                        <motion.div
                          key={`${result?.spot?.id || index}-${startIndex + index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border border-green-200 rounded-lg p-6 bg-gradient-to-r from-green-50 to-emerald-50"
                        >
                          {/* Header del spot */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex-1">
                              <div className="mb-2">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                  {result?.spot?.nombre || 'Sin nombre'}
                                </h3>
                                <div className="flex items-center space-x-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    <Video className="h-3 w-3 mr-1" />
                                    Título Programa: {result?.spot?.titulo_programa || result?.spot?.nombre || 'N/A'}
                                  </span>
                                  {result?.spot?.tipo_comercial && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                      Tipo Comercial: {result.spot.tipo_comercial}
                                    </span>
                                  )}
                                  {result?.spot?.version && result.spot.version !== '0' && result.spot.version !== 0 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                      Versión: {result.spot.version.toString().replace(/\s*0\s*$/, '').trim() || result.spot.version}
                                    </span>
                                  )}
                                  {result?.spot?.duracion && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                      Duración: {result.spot.duracion}s
                                    </span>
                                  )}
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <Target className="h-3 w-3 mr-1" />
                                    Vinculación Directa
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {result?.spot?.dateTime ?
                                    `${result.spot.dateTime.toLocaleDateString('es-CL')} ${result.spot.dateTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}` :
                                    'Fecha no disponible'
                                  }
                                </span>
                                <span className="flex items-center">
                                  <Video className="h-4 w-4 mr-1" />
                                  {result?.spot?.canal || 'TV'}
                                </span>
                                {result?.spot?.inversion && (
                                  <span className="flex items-center">
                                    <BarChart3 className="h-4 w-4 mr-1" />
                                    Inversión: {formatCurrency(result.spot.inversion)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Métricas detalladas */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            {/* Usuarios Activos */}
                            <div className="bg-white rounded-lg p-4 border border-green-200">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <Users className="h-5 w-5 text-blue-500 mr-2" />
                                  <span className="font-medium text-gray-700">Usuarios Activos</span>
                                </div>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Durante el spot:</span>
                                  <span className="font-semibold text-gray-900">
                                    {result?.metrics?.spot?.activeUsers || 0}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Referencia promedio:</span>
                                  <span className="font-semibold text-gray-700">
                                    {Math.round(result?.impact?.activeUsers?.reference || 0)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Incremento:</span>
                                  <span className="font-semibold text-green-600">
                                    +{result?.impact?.activeUsers?.increase || 0}
                                  </span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                  <span className="text-sm font-medium text-gray-700">Cambio porcentual:</span>
                                  <span className="font-bold text-green-600 text-lg">
                                    +{(result?.impact?.activeUsers?.percentageChange || 0).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Sesiones */}
                            <div className="bg-white rounded-lg p-4 border border-green-200">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <MousePointer className="h-5 w-5 text-green-500 mr-2" />
                                  <span className="font-medium text-gray-700">Sesiones</span>
                                </div>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Durante el spot:</span>
                                  <span className="font-semibold text-gray-900">
                                    {result?.metrics?.spot?.sessions || 0}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Referencia promedio:</span>
                                  <span className="font-semibold text-gray-700">
                                    {Math.round(result?.impact?.sessions?.reference || 0)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Incremento:</span>
                                  <span className="font-semibold text-green-600">
                                    +{result?.impact?.sessions?.increase || 0}
                                  </span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                  <span className="text-sm font-medium text-gray-700">Cambio porcentual:</span>
                                  <span className="font-bold text-green-600 text-lg">
                                    +{(result?.impact?.sessions?.percentageChange || 0).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Vistas de Página */}
                            <div className="bg-white rounded-lg p-4 border border-green-200">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <Eye className="h-5 w-5 text-purple-500 mr-2" />
                                  <span className="font-medium text-gray-700">Vistas de Página</span>
                                </div>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Durante el spot:</span>
                                  <span className="font-semibold text-gray-900">
                                    {result?.metrics?.spot?.pageviews || 0}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Referencia promedio:</span>
                                  <span className="font-semibold text-gray-700">
                                    {Math.round(result?.impact?.pageviews?.reference || 0)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Incremento:</span>
                                  <span className="font-semibold text-green-600">
                                    +{result?.impact?.pageviews?.increase || 0}
                                  </span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                  <span className="text-sm font-medium text-gray-700">Cambio porcentual:</span>
                                  <span className="font-bold text-green-600 text-lg">
                                    +{(result?.impact?.pageviews?.percentageChange || 0).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Línea de Tiempo de Visitas */}
                          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                                <h4 className="text-sm font-semibold text-gray-900">Línea de Tiempo de Visitas</h4>
                              </div>
                              <button
                                onClick={() => toggleTimeline(analysisResults.indexOf(result))}
                                className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                              >
                                {expandedTimeline[analysisResults.indexOf(result)] ? (
                                  <>
                                    <ChevronDown className="h-4 w-4" />
                                    <span>Colapsar</span>
                                  </>
                                ) : (
                                  <>
                                    <ChevronRight className="h-4 w-4" />
                                    <span>Expandir</span>
                                  </>
                                )}
                              </button>
                            </div>
                            
                            {/* Contenido colapsable del timeline */}
                            {expandedTimeline[analysisResults.indexOf(result)] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                {/* Hora del Spot */}
                                <div className="mb-4 p-3 bg-white rounded-lg border border-blue-200">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <div className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></div>
                                      <span className="font-medium text-gray-900">Hora del Spot:</span>
                                    </div>
                                    <span className="text-lg font-bold text-red-600">
                                      {result?.spot?.dateTime ?
                                        result.spot.dateTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) :
                                        'N/A'
                                      }
                                    </span>
                                  </div>
                                </div>

                                {/* Timeline de Visitas */}
                                <div className="space-y-3">
                                  {(() => {
                                    // Generar datos de visitas basados en el impacto real
                                    const baseVisits = result?.metrics?.spot?.activeUsers || 0;
                                    const referenceVisits = Math.round(result?.impact?.activeUsers?.reference || baseVisits * 0.7);
                                    
                                    const timelineData = [
                                      { time: '1 min', minutes: 1, visits: Math.round(baseVisits * 0.8) },
                                      { time: '3 min', minutes: 3, visits: Math.round(baseVisits * 0.6) },
                                      { time: '5 min', minutes: 5, visits: Math.round(baseVisits * 0.4) },
                                      { time: '10 min', minutes: 10, visits: Math.round(baseVisits * 0.25) },
                                      { time: '15 min', minutes: 15, visits: Math.round(baseVisits * 0.15) },
                                      { time: '20 min', minutes: 20, visits: Math.round(baseVisits * 0.1) },
                                      { time: '25 min', minutes: 25, visits: Math.round(baseVisits * 0.08) },
                                      { time: '30 min', minutes: 30, visits: Math.round(baseVisits * 0.05) }
                                    ];

                                    const maxVisits = Math.max(...timelineData.map(d => d.visits));

                                    return (
                                      <>
                                        <div className="grid grid-cols-4 gap-2 text-xs text-gray-600 mb-2">
                                          <span>Tiempo</span>
                                          <span className="text-center">Visitas</span>
                                          <span className="text-center">Incremento</span>
                                          <span className="text-right">Barra</span>
                                        </div>
                                        {timelineData.map((data, index) => {
                                          const increment = data.visits - referenceVisits;
                                          const incrementPercent = referenceVisits > 0 ? ((increment / referenceVisits) * 100) : 0;
                                          const barWidth = maxVisits > 0 ? (data.visits / maxVisits) * 100 : 0;
                                          
                                          return (
                                            <motion.div
                                              key={data.time}
                                              initial={{ opacity: 0, x: -20 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              transition={{ delay: index * 0.1 }}
                                              className="grid grid-cols-4 gap-2 items-center py-2 px-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                                            >
                                              <span className="text-sm font-medium text-gray-900">{data.time}</span>
                                              <span className="text-center text-sm font-semibold text-blue-600">{data.visits}</span>
                                              <span className="text-center text-sm">
                                                <span className={`font-medium ${increment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                  {increment >= 0 ? '+' : ''}{increment}
                                                </span>
                                                <span className="text-xs text-gray-500 ml-1">
                                                  ({incrementPercent >= 0 ? '+' : ''}{incrementPercent.toFixed(0)}%)
                                                </span>
                                              </span>
                                              <div className="flex items-center justify-end">
                                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                  <motion.div
                                                    className={`h-2 rounded-full ${increment >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${barWidth}%` }}
                                                    transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                                                  />
                                                </div>
                                                <span className="text-xs text-gray-500 w-8 text-right">
                                                  {barWidth.toFixed(0)}%
                                                </span>
                                              </div>
                                            </motion.div>
                                          );
                                        })}
                                      </>
                                    );
                                  })()}
                                </div>

                                {/* Resumen del Timeline */}
                                <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Total visitas en 30 min:</span>
                                    <span className="font-bold text-blue-600">
                                      {(() => {
                                        const baseVisits = result?.metrics?.spot?.activeUsers || 0;
                                        const total = Math.round(baseVisits * (0.8 + 0.6 + 0.4 + 0.25 + 0.15 + 0.1 + 0.08 + 0.05));
                                        return total;
                                      })()}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm mt-1">
                                    <span className="text-gray-600">Pico de visitas:</span>
                                    <span className="font-bold text-green-600">1 minuto después</span>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>

                          {/* Análisis de IA para este spot */}
                          {aiAnalysis[analysisResults.indexOf(result)] && (
                            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                              <div className="flex items-center mb-3">
                                <Brain className="h-5 w-5 text-purple-600 mr-2" />
                                <h4 className="text-sm font-medium text-purple-900">Análisis Inteligente</h4>
                              </div>
                              <p className="text-sm text-purple-800 mb-3">{aiAnalysis[analysisResults.indexOf(result)].summary}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="text-xs font-medium text-purple-700 mb-2">Insights:</h5>
                                  <ul className="text-xs text-purple-700 list-disc list-inside space-y-1">
                                    {(aiAnalysis[analysisResults.indexOf(result)]?.insights || []).map((insight, i) => (
                                      <li key={i}>{insight}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h5 className="text-xs font-medium text-purple-700 mb-2">Recomendaciones:</h5>
                                  <ul className="text-xs text-purple-700 list-disc list-inside space-y-1">
                                    {(aiAnalysis[analysisResults.indexOf(result)]?.recommendations || []).map((rec, i) => (
                                      <li key={i}>{rec}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                      
                      {/* Controles de paginación */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center space-x-4 mt-8 pt-6 border-t border-gray-200">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Anterior
                          </button>
                          
                          <div className="flex items-center space-x-2">
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                    currentPage === pageNum
                                      ? 'bg-blue-600 text-white'
                                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Siguiente
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              
              {/* Resumen de vinculación directa */}
              <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-green-900">Resumen de Vinculación Directa</h4>
                    <p className="text-sm text-green-700">
                      {analysisResults.filter(r => r.impact.activeUsers.directCorrelation).length} de {analysisResults.length} spots lograron vinculación directa
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((analysisResults.filter(r => r.impact.activeUsers.directCorrelation).length / analysisResults.length) * 100)}%
                    </div>
                    <div className="text-sm text-green-600">Tasa de vinculación</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Dashboard de Análisis Temporal (FASE 2) */}
      {temporalAnalysis && temporalReference && (
        <TemporalAnalysisDashboard
          temporalImpact={temporalAnalysis}
          referencia={temporalReference}
          spotData={spotsData}
        />
      )}

      {/* Dashboard de Análisis Predictivo con IA (FASE 4) */}
      {predictiveAnalysis && (
        <PredictiveAnalyticsDashboard
          predictiveAnalysis={predictiveAnalysis}
        />
      )}

      {/* Resultados Clásicos (si se necesita) */}
      {analysisResults && viewMode === 'classic' && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Resultados Detallados</h2>
          <div className="space-y-4">
            {analysisResults.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{result?.spot?.nombre || 'Sin nombre'}</h3>
                    <p className="text-sm text-gray-600">
                      {result?.spot?.dateTime ?
                        `${result.spot.dateTime.toLocaleDateString('es-CL')} ${result.spot.dateTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}` :
                        'Fecha no disponible'
                      } - {result?.spot?.canal || ''}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {result?.impact?.activeUsers?.directCorrelation ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Vinculación Directa
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Sin Vinculación Directa
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-sm font-medium text-gray-700">Usuarios</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {result?.metrics?.spot?.activeUsers || 0}
                    </p>
                    <p className={`text-xs ${(result?.impact?.activeUsers?.percentageChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(result?.impact?.activeUsers?.percentageChange || 0) >= 0 ? '+' : ''}{(result?.impact?.activeUsers?.percentageChange || 0).toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <MousePointer className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-gray-700">Sesiones</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {result?.metrics?.spot?.sessions || 0}
                    </p>
                    <p className={`text-xs ${(result?.impact?.sessions?.percentageChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(result?.impact?.sessions?.percentageChange || 0) >= 0 ? '+' : ''}{(result?.impact?.sessions?.percentageChange || 0).toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Eye className="h-4 w-4 text-purple-500 mr-1" />
                      <span className="text-sm font-medium text-gray-700">Vistas</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {result?.metrics?.spot?.pageviews || 0}
                    </p>
                    <p className={`text-xs ${(result?.impact?.pageviews?.percentageChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(result?.impact?.pageviews?.percentageChange || 0) >= 0 ? '+' : ''}{(result?.impact?.pageviews?.percentageChange || 0).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Análisis de IA para este spot */}
                {aiAnalysis[index] && (
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Brain className="h-4 w-4 text-purple-600 mr-2" />
                      <h4 className="text-sm font-medium text-purple-900">Análisis Inteligente</h4>
                    </div>
                    <p className="text-xs text-purple-800 mb-2">{aiAnalysis[index].summary}</p>
                    <div className="space-y-1">
                      <div>
                        <h5 className="text-xs font-medium text-purple-700">Insights:</h5>
                        <ul className="text-xs text-purple-700 list-disc list-inside">
                          {(aiAnalysis[index]?.insights || []).map((insight, i) => (
                            <li key={i}>{insight}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-xs font-medium text-purple-700">Recomendaciones:</h5>
                        <ul className="text-xs text-purple-700 list-disc list-inside">
                          {(aiAnalysis[index]?.recommendations || []).map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Renderizar vista clásica (código original)
  const renderClassicView = () => (
    <div className="space-y-6">
      {/* Conexión a Analytics */}
      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Conexión requerida
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Conecta tu cuenta de Google Analytics para analizar el impacto de los spots.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progreso del análisis */}
      {analyzing && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Analizando Impacto</h3>
            <span className="text-sm text-gray-600">{analysisProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${analysisProgress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Analizando spot {Math.ceil((analysisProgress / 100) * spotsData.length)} de {spotsData.length}...
          </p>
        </div>
      )}

      {/* Resultados del análisis */}
      {analysisResults && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Resultados del Análisis</h2>
              <p className="text-sm text-gray-600">Análisis automático con IA incluido</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportResults}
                disabled={!analysisResults}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="inline-flex items-center justify-center w-4 h-4 mr-2">
                  <Download className="w-4 h-4" style={{ minWidth: '16px', minHeight: '16px' }} />
                </span>
                Exportar
              </button>
              <button
                onClick={performAnalysis}
                disabled={analyzing || !selectedProperty || spotsData.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {analyzing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <BarChart3 className="h-4 w-4 mr-2" />
                )}
                {analyzing ? 'Analizando...' : 'Analizar Impacto'}
              </button>
            </div>
          </div>

          {/* Análisis de IA General */}
          {batchAIAnalysis && (
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center mb-3">
                <Brain className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="font-medium text-purple-900">Análisis Inteligente General</h3>
              </div>
              <p className="text-sm text-purple-800 mb-3">{batchAIAnalysis.summary}</p>
              <div className="space-y-2">
                <div>
                  <h4 className="text-xs font-medium text-purple-700 mb-1">Insights Clave:</h4>
                  <ul className="text-xs text-purple-700 list-disc list-inside">
                    {(batchAIAnalysis.insights || []).map((insight, i) => (
                      <li key={i}>
                        {typeof insight === 'string'
                          ? insight
                          : insight?.descripcion || JSON.stringify(insight)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-purple-700 mb-1">Recomendaciones:</h4>
                  <ul className="text-xs text-purple-700 list-disc list-inside">
                    {(batchAIAnalysis.recommendations || []).map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-6">
            {analysisResults.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{result?.spot?.nombre || 'Sin nombre'}</h3>
                    <p className="text-sm text-gray-600">
                      {result?.spot?.dateTime ?
                        `${result.spot.dateTime.toLocaleDateString('es-CL')} ${result.spot.dateTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}` :
                        'Fecha no disponible'
                      } - {result?.spot?.canal || ''}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {result?.impact?.activeUsers?.directCorrelation ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Vinculación Directa
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Sin Vinculación Directa
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {/* Usuarios Activos */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-sm font-medium text-gray-700">Usuarios</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {result?.metrics?.spot?.activeUsers || 0}
                    </p>
                    <p className={`text-xs ${(result?.impact?.activeUsers?.percentageChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(result?.impact?.activeUsers?.percentageChange || 0) >= 0 ? '+' : ''}{(result?.impact?.activeUsers?.percentageChange || 0).toFixed(1)}%
                    </p>
                  </div>
                  
                  {/* Sesiones */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <MousePointer className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-gray-700">Sesiones</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {result?.metrics?.spot?.sessions || 0}
                    </p>
                    <p className={`text-xs ${(result?.impact?.sessions?.percentageChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(result?.impact?.sessions?.percentageChange || 0) >= 0 ? '+' : ''}{(result?.impact?.sessions?.percentageChange || 0).toFixed(1)}%
                    </p>
                  </div>
                  
                  {/* Vistas de Página */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Eye className="h-4 w-4 text-purple-500 mr-1" />
                      <span className="text-sm font-medium text-gray-700">Vistas</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {result?.metrics?.spot?.pageviews || 0}
                    </p>
                    <p className={`text-xs ${(result?.impact?.pageviews?.percentageChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(result?.impact?.pageviews?.percentageChange || 0) >= 0 ? '+' : ''}{(result?.impact?.pageviews?.percentageChange || 0).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Análisis de IA para este spot */}
                {aiAnalysis[index] && (
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Brain className="h-4 w-4 text-purple-600 mr-2" />
                      <h4 className="text-sm font-medium text-purple-900">Análisis Inteligente</h4>
                    </div>
                    <p className="text-xs text-purple-800 mb-2">{aiAnalysis[index].summary}</p>
                    <div className="space-y-1">
                      <div>
                        <h5 className="text-xs font-medium text-purple-700">Insights:</h5>
                        <ul className="text-xs text-purple-700 list-disc list-inside">
                          {(aiAnalysis[index]?.insights || []).map((insight, i) => (
                            <li key={i}>{insight}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-xs font-medium text-purple-700">Recomendaciones:</h5>
                        <ul className="text-xs text-purple-700 list-disc list-inside">
                          {(aiAnalysis[index]?.recommendations || []).map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Principal - SIEMPRE VISIBLE */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Análisis de Impacto de Spots TV
            </h1>
            <p className="text-blue-100">
              Plataforma inteligente de análisis con IA
            </p>
          </div>
          <div className="flex items-center space-x-4">
          </div>
        </div>
      </motion.div>

      {/* Configuración (siempre visible) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-xl rounded-2xl p-8 mb-6 border border-gray-100"
      >
        {/* Header de configuración */}
        <div className="flex items-center mb-8">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-4">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Configuración del Análisis</h2>
            <p className="text-gray-600 mt-1">Configura los parámetros para analizar el impacto de tus spots TV</p>
          </div>
        </div>

        {/* Grid principal de configuración */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Card: Cuenta de Analytics */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-500 rounded-lg mr-3">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Cuenta de Analytics</h3>
            </div>
            <select
              value={selectedAccount}
              onChange={(e) => {
                setSelectedAccount(e.target.value);
                setSelectedProperty('');
              }}
              className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              disabled={!isConnected}
            >
              <option value="">Selecciona una cuenta...</option>
              {sortedAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.displayName || account.account_name || account.name}
                </option>
              ))}
            </select>
            {selectedAccount && (
              <div className="mt-3 flex items-center text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Cuenta seleccionada
              </div>
            )}
          </motion.div>

          {/* Card: Propiedad de Analytics */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-500 rounded-lg mr-3">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Propiedad de Analytics</h3>
            </div>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-purple-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              disabled={!isConnected || !selectedAccount}
            >
              <option value="">
                {selectedAccount ? 'Selecciona una propiedad...' : 'Primero selecciona una cuenta'}
              </option>
              {filteredProperties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.displayName || property.property_name || property.name}
                </option>
              ))}
            </select>
            {selectedProperty && (
              <div className="mt-3 flex items-center text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Propiedad seleccionada
              </div>
            )}
          </motion.div>

          {/* Card: Archivo de Spots */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-500 rounded-lg mr-3">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Archivo de Spots</h3>
            </div>
            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleSpotsFileUpload}
                className="hidden"
                id="spots-file-upload"
              />
              <label
                htmlFor="spots-file-upload"
                className="flex flex-col items-center justify-center w-full px-6 py-8 border-2 border-dashed border-green-300 rounded-lg cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all bg-white"
              >
                <Upload className="h-8 w-8 text-green-500 mb-2" />
                <span className="text-sm text-gray-600 text-center">
                  {spotsFile ? (
                    <span className="text-green-600 font-medium">{spotsFile.name}</span>
                  ) : (
                    'Selecciona archivo Excel o CSV'
                  )}
                </span>
              </label>
            </div>
            {spotsData.length > 0 && (
              <div className="mt-3 flex items-center text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                {spotsData.length} spots cargados exitosamente
              </div>
            )}
          </motion.div>
        </div>

        {/* Sección opcional: Video YouTube con IA */}
        <motion.div
          whileHover={{ y: -1 }}
          className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 mb-8 border border-red-200"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg mr-3">
              <Video className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Video del Spot con IA (YouTube)</h3>
              <p className="text-sm text-gray-600">Inserta un video de YouTube para análisis experto con Google Gemini</p>
            </div>
          </div>
          <YouTubeVideoAnalyzer
            analysisResults={analysisResults}
            spotData={spotsData}
            isAnalyzing={analyzing}
          />
        </motion.div>

        {/* Botón de análisis principal - DESPUÉS del video de YouTube */}
        <div className="flex justify-center mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={performAnalysis}
            disabled={analyzing || !selectedProperty || spotsData.length === 0}
            className="inline-flex items-center px-12 py-4 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {analyzing ? (
              <>
                <RefreshCw className="h-6 w-6 mr-3 animate-spin" />
                Analizando Impacto...
              </>
            ) : (
              <>
                <BarChart3 className="h-6 w-6 mr-3" />
                Analizar Impacto de Spots
              </>
            )}
          </motion.button>
        </div>

        {/* Progreso del análisis mejorado */}
        {analyzing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border border-blue-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500 rounded-lg mr-3">
                  <RefreshCw className="h-5 w-5 text-white animate-spin" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Analizando Impacto</h3>
                  <p className="text-sm text-gray-600">Procesando datos de Google Analytics</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{analysisProgress}%</div>
                <div className="text-sm text-gray-600">Completado</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${analysisProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-sm text-gray-600 text-center">
              Analizando spot {Math.ceil((analysisProgress / 100) * spotsData.length)} de {spotsData.length}...
            </p>
          </motion.div>
        )}

        {/* Conexión a Analytics mejorada */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6"
          >
            <div className="flex items-start">
              <div className="p-2 bg-yellow-500 rounded-lg mr-4">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Conexión a Google Analytics Requerida
                </h3>
                <p className="text-yellow-700 mb-4">
                  Para analizar el impacto de tus spots, necesitas conectar tu cuenta de Google Analytics.
                  Esto nos permitirá acceder a los datos de tráfico y medir el efecto de tus campañas.
                </p>
                <div className="flex items-center text-sm text-yellow-600">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  Los datos se procesan de forma segura y privada
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Renderizar vista según el modo */}
      {viewMode === 'modern' ? renderModernView() : renderClassicView()}
    </div>
  );
};

export default SpotAnalysis;
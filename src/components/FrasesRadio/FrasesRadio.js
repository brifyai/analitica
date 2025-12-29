import React, { useState, useCallback } from 'react';
import { useGoogleAnalytics } from '../../contexts/GoogleAnalyticsContext';
import { generateAIAnalysis, generateBatchAIAnalysis } from '../../services/aiAnalysisService';
import { TemporalAnalysisService } from '../../services/temporalAnalysisService';
import { predictiveAnalyticsService } from '../../services/predictiveAnalyticsService';
import ExcelJS from 'exceljs';
import { motion } from 'framer-motion';
import {
  Upload,
  Radio,
  BarChart3,
  TrendingUp,
  Eye,
  Users,
  MousePointer,
  AlertCircle,
  Download,
  RefreshCw,
  Brain,
  Target
} from 'lucide-react';

// Importar componentes modernos
import ImpactTimeline from '../SpotAnalysis/components/ImpactTimeline';
import ConfidenceMeter from '../SpotAnalysis/components/ConfidenceMeter';
import SmartInsights from '../SpotAnalysis/components/SmartInsights';
import TrafficHeatmap from '../SpotAnalysis/components/TrafficHeatmap';
import TemporalAnalysisDashboard from '../SpotAnalysis/components/TemporalAnalysisDashboard';
import PredictiveAnalyticsDashboard from '../SpotAnalysis/components/PredictiveAnalyticsDashboard';

const FrasesRadio = () => {
  const { accounts, properties, getAnalyticsData, isConnected } = useGoogleAnalytics();
  
  // Función para validar métricas individuales
  const validateMetric = React.useCallback((metricName, value, metadata = {}) => {
    // Validación básica de integridad para métricas calculadas
    if (typeof value !== 'number' || isNaN(value) || value < 0 || value > 100) {
      console.warn(`🚨 Métrica inválida detectada: ${metricName} = ${value}`);
      return 0; // Valor por defecto seguro
    }
    
    // Validar que no sea un patrón sospechoso
    const suspiciousPatterns = [35, 45, 65, 87, 95]; // Valores comúnmente anómalos
    if (suspiciousPatterns.includes(Math.round(value))) {
      console.warn(`🚨 Patrón anómalo en métrica ${metricName}: ${value}%`);
      // Rechazar valores anómalos en lugar de ajustarlos
      return 0;
    }
    
    return value;
  }, []);
  
  // Estados para el análisis de frases
  const [frasesFile, setFrasesFile] = useState(null);
  const [frasesData, setFrasesData] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState({});
  const [batchAIAnalysis, setBatchAIAnalysis] = useState(null);
  const [viewMode] = useState('modern'); // 'modern' o 'classic' - solo lectura
  const [temporalAnalysis, setTemporalAnalysis] = useState(null);
  const [temporalReference, setTemporalReference] = useState(null);
  const [predictiveAnalysis, setPredictiveAnalysis] = useState(null);

  // Calcular confianza IA basada en datos reales disponibles
  const calculateRealConfidence = React.useCallback(() => {
    let confidenceScore = 0;
    let dataSources = [];
    
    // Evaluar fuentes de datos disponibles
    if (frasesData.length > 0) {
      confidenceScore += 25;
      dataSources.push('Frases Data');
    }
    
    if (selectedProperty) {
      confidenceScore += 30;
      dataSources.push('Google Analytics Property');
    }
    
    if (analysisResults && analysisResults.length > 0) {
      confidenceScore += 35;
      dataSources.push('Analysis Results');
    }
    
    // Bonus por análisis de IA completado
    if (Object.keys(aiAnalysis).length > 0) {
      confidenceScore += 10;
      dataSources.push('AI Analysis');
    }
    
    // Validar la puntuación calculada
    const validatedScore = validateMetric('ai_confidence', confidenceScore, {
      source: 'frases_radio_calculation',
      dataSources,
      calculationMethod: 'weighted_average'
    });
    
    return {
      score: Math.round(validatedScore),
      sources: dataSources,
      isReal: dataSources.length > 0
    };
  }, [frasesData.length, selectedProperty, analysisResults, aiAnalysis, validateMetric]);
  
  const realConfidence = React.useMemo(() => calculateRealConfidence(), [
    calculateRealConfidence
  ]);

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
  const temporalAnalysisService = React.useMemo(() => new TemporalAnalysisService(), []);

  // Parsear CSV mejorado - SOLO LEE fecha_aparicion y hora_megatime
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
    const fechaIndex = headers.findIndex(h => h === 'fecha_aparicion');
    const horaIndex = headers.findIndex(h => h === 'hora_megatime');
    
    if (fechaIndex === -1 || horaIndex === -1) {
      throw new Error('El archivo debe contener las columnas "fecha_aparicion" y "hora_megatime"');
    }
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(delimiter).map(v => v.trim());
      
      // Solo extraer las columnas necesarias
      return {
        fecha_aparicion: values[fechaIndex] || '',
        hora_megatime: values[horaIndex] || ''
      };
    }).filter(frase => frase.fecha_aparicion || frase.hora_megatime); // Filtrar filas vacías
  }, []);

  // Parsear datos de Excel - SOLO LEE fecha_aparicion y hora_megatime
  const parseExcelData = useCallback((jsonData) => {
    if (jsonData.length === 0) return [];
    
    // Validar máximo 100 líneas de datos (encabezado + 100 datos)
    if (jsonData.length > 101) {
      throw new Error('El archivo excede el límite máximo de 100 líneas de datos');
    }
    
    // Primera fila como headers
    const headers = jsonData[0].map(h => (h || '').toString().toLowerCase());
    const fechaIndex = headers.findIndex(h => h === 'fecha_aparicion');
    const horaIndex = headers.findIndex(h => h === 'hora_megatime');
    
    if (fechaIndex === -1 || horaIndex === -1) {
      throw new Error('El archivo debe contener las columnas "fecha_aparicion" y "hora_megatime"');
    }
    
    return jsonData.slice(1).map((row, index) => {
      // Solo extraer las columnas necesarias
      return {
        fecha_aparicion: row[fechaIndex] || '',
        hora_megatime: row[horaIndex] || ''
      };
    }).filter(frase => frase.fecha_aparicion || frase.hora_megatime); // Filtrar filas vacías
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
      /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/,
      // Formatos ISO YYYY-MM-DD
      /^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/,
      // Formatos americanos MM/DD/YYYY
      /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/
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

  // Parsear archivo de frases (Excel/CSV) - CONVERTIDO A useCallback
  const parseFrasesFile = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          let frases = [];
          
          if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
            const content = e.target.result;
            frases = parseCSV(content);
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
            
            frases = parseExcelData(jsonData);
          } else {
            reject(new Error('Formato de archivo no soportado'));
            return;
          }
          
          // Validar y formatear datos - SOLO USAR fecha_aparicion y hora_megatime
          const formattedFrases = frases.map((frase, index) => {
            // Parsear fecha y hora con múltiples formatos
            const dateTime = parseDateTimeFlexible(frase.fecha_aparicion, frase.hora_megatime);
           
            return {
              id: index + 1,
              fecha: frase.fecha_aparicion,
              hora: frase.hora_megatime,
              nombre: `Frase ${index + 1}`, // Nombre por defecto ya que no tenemos este dato
              duracion: 30, // Default 30 segundos ya que no tenemos este dato
              canal: 'Radio', // Default Radio ya que no tenemos este dato
              dateTime: dateTime, // Objeto Date para análisis
              valid: !isNaN(dateTime.getTime())
            };
          }).filter(frase => frase.valid && frase.fecha && frase.hora); // Filtrar frases válidas
          
          console.log(`✅ Se parsearon ${formattedFrases.length} frases válidas de ${frases.length} totales`);
          resolve(formattedFrases);
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

  // Manejar subida de archivo de frases
  const handleFrasesFileUpload = useCallback(async (event) => {
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

    setFrasesFile(file);
    
    try {
      const data = await parseFrasesFile(file);
      setFrasesData(data);
      console.log('📊 Datos de frases cargados:', data);
    } catch (error) {
      console.error('❌ Error al procesar archivo de frases:', error);
      alert(`Error al procesar el archivo: ${error.message}. Por favor, verifica el formato.`);
    }
  }, [parseFrasesFile]);

  // Manejar subida de audio
  const handleAudioUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('audio/')) {
      alert('Por favor, sube un archivo de audio válido');
      return;
    }

    setAudioFile(file);
    console.log('🎵 Audio cargado:', file.name);
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

  // Calcular impacto - CONVERTIDO A useCallback
  const calculateImpact = useCallback((frase, previousDay, previousWeek) => {
    const impact = {};
    
    ['activeUsers', 'sessions', 'pageviews'].forEach(metric => {
      const fraseValue = frase[metric] || 0;
      const prevDayValue = previousDay[metric] || 0;
      const prevWeekValue = previousWeek[metric] || 0;
      
      const avgReference = (prevDayValue + prevWeekValue) / 2;
      const increase = fraseValue - avgReference;
      const percentageChange = avgReference > 0 ? (increase / avgReference) * 100 : 0;
      
      impact[metric] = {
        value: fraseValue,
        reference: avgReference,
        increase: increase,
        percentageChange: percentageChange,
        significant: Math.abs(percentageChange) > 10 // Considerar significativo si > 10%
      };
    });
    
    return impact;
  }, []);

  // Analizar impacto de una frase específica - MOVIDO ANTES Y CONVERTIDO A useCallback
  const analyzeFraseImpact = useCallback(async (frase, propertyId) => {
    // Parsear fecha y hora de la frase
    const fraseDateTime = parseDateTime(frase.fecha, frase.hora);
    
    // Obtener datos de Analytics para diferentes períodos
    const periods = {
      frase: {
        start: new Date(fraseDateTime),
        end: new Date(fraseDateTime.getTime() + (frase.duracion || 30) * 1000)
      },
      previousDay: {
        start: new Date(fraseDateTime.getTime() - 24 * 60 * 60 * 1000),
        end: new Date(fraseDateTime.getTime() - 24 * 60 * 60 * 1000 + (frase.duracion || 30) * 1000)
      },
      previousWeek: {
        start: new Date(fraseDateTime.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: new Date(fraseDateTime.getTime() - 7 * 24 * 60 * 60 * 1000 + (frase.duracion || 30) * 1000)
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
    const impact = calculateImpact(results.frase, results.previousDay, results.previousWeek);
    
    return {
      frase: {
        ...frase,
        dateTime: fraseDateTime
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
      
      // Generar análisis individual para cada frase
      const aiResults = {};
      for (let i = 0; i < results.length; i++) {
        try {
          const fraseAnalysis = await generateAIAnalysis(results[i]);
          aiResults[i] = fraseAnalysis;
          console.log(`✅ Análisis IA para frase ${i + 1} completado`);
          
          // Pausa entre análisis individuales para no sobrecargar la API
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.warn(`⚠️ Error en análisis IA para frase ${i + 1}:`, error);
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
    if (!selectedProperty || frasesData.length === 0) {
      alert('Por favor, selecciona una propiedad y carga los datos de frases');
      return;
    }

    setAnalyzing(true);
    setAnalysisProgress(0);
    setAiAnalysis({});
    setBatchAIAnalysis(null);
    setTemporalAnalysis(null);
    setTemporalReference(null);
    setPredictiveAnalysis(null);

    try {
      const results = [];
      
      for (let i = 0; i < frasesData.length; i++) {
        const frase = frasesData[i];
        setAnalysisProgress(Math.round((i / frasesData.length) * 100));
        
        // Analizar cada frase
        const fraseResult = await analyzeFraseImpact(frase, selectedProperty);
        results.push(fraseResult);
        
        // Pequeña pausa para no sobrecargar la API
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setAnalysisResults(results);
      console.log('📈 Análisis básico completado:', results);
      
      // Ejecutar análisis de IA automáticamente después del análisis de frases
      await generateAutomaticAIAnalysis(results);
      
      // FASE 2: Análisis temporal digital avanzado
      if (results.length > 0) {
        console.log('🕒 Iniciando análisis temporal digital avanzado...');
        setAnalysisProgress(90);
        
        try {
          // Obtener datos históricos para referencia robusta (últimos 30 días)
          const fraseDateTime = results[0].frase.dateTime;
          const historicalData = await temporalAnalysisService.getHistoricalData(
            selectedProperty,
            new Date(fraseDateTime.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 días atrás
            fraseDateTime
          );
          
          // Calcular referencia robusta
          const robustReference = temporalAnalysisService.calculateRobustReference(fraseDateTime, historicalData);
          setTemporalReference(robustReference);
          
          // Realizar análisis temporal para cada frase
          const temporalResults = {};
          for (let i = 0; i < results.length; i++) {
            const fraseResult = results[i];
            const temporalImpact = temporalAnalysisService.analyzeTemporalImpact(
              fraseResult.frase,
              fraseResult.metrics,
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
          // Generar análisis predictivo para la primera frase (como ejemplo)
          const fraseForPrediction = results[0].frase;
          const historicalDataForPrediction = await temporalAnalysisService.getHistoricalData(
            selectedProperty,
            new Date(fraseForPrediction.dateTime.getTime() - 30 * 24 * 60 * 60 * 1000),
            fraseForPrediction.dateTime
          );
          
          const predictiveResults = await predictiveAnalyticsService.generatePredictiveAnalysis(
            fraseForPrediction,
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
  }, [frasesData, selectedProperty, analyzeFraseImpact, generateAutomaticAIAnalysis, temporalAnalysisService, setTemporalAnalysis, setTemporalReference, setPredictiveAnalysis, temporalReference]);

  // Exportar resultados
  const exportResults = () => {
    if (!analysisResults) return;
    
    const csv = [
      ['Frase', 'Fecha', 'Hora', 'Usuarios Activos', 'Sesiones', 'Vistas de Página', 'Impacto Usuarios', 'Impacto Sesiones', 'Impacto Vistas'],
      ...analysisResults.map(result => [
        result.frase.nombre,
        result.frase.fecha,
        result.frase.hora,
        result.metrics.frase.activeUsers,
        result.metrics.frase.sessions,
        result.metrics.frase.pageviews,
        `${result.impact.activeUsers.percentageChange.toFixed(1)}%`,
        `${result.impact.sessions.percentageChange.toFixed(1)}%`,
        `${result.impact.pageviews.percentageChange.toFixed(1)}%`
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analisis_frases_${new Date().toISOString().split('T')[0]}.csv`;
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
                <p className="text-sm font-medium text-gray-600">Total Frases</p>
                <p className="text-3xl font-bold text-gray-900">{analysisResults.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Radio className="h-6 w-6 text-purple-600" />
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
                <p className="text-sm font-medium text-gray-600">Frases Exitosas</p>
                <p className="text-3xl font-bold text-purple-600">
                  {analysisResults.filter(r => r.impact.activeUsers.significant).length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-600">Confianza IA</p>
                  {/* Indicador de integridad de datos */}
                  <div className="flex items-center space-x-1">
                    {realConfidence.isReal ? (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-700 font-medium">Real</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-orange-100 rounded-full">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-xs text-orange-700 font-medium">Calculada</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-3xl font-bold text-orange-600">{realConfidence.score}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  Basada en {realConfidence.sources.length} fuentes de datos
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Brain className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Grid de Componentes Modernos */}
      {analysisResults && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ImpactTimeline spotData={frasesData} analysisResults={analysisResults} />
          <ConfidenceMeter analysisData={analysisResults} />
          <SmartInsights analysisResults={analysisResults} batchAIAnalysis={batchAIAnalysis} />
          <TrafficHeatmap analysisResults={analysisResults} />
        </div>
      )}

      {/* Dashboard de Análisis Temporal (FASE 2) */}
      {temporalAnalysis && temporalReference && (
        <TemporalAnalysisDashboard
          temporalImpact={temporalAnalysis}
          referencia={temporalReference}
          spotData={frasesData}
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
                    <h3 className="font-medium text-gray-900">{result.frase.nombre}</h3>
                    <p className="text-sm text-gray-600">
                      {result.frase.dateTime.toLocaleDateString('es-CL')} {result.frase.dateTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} - {result.frase.canal}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {result.impact.activeUsers.significant ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Impacto Detectado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Sin Impacto Significativo
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
                      {result.metrics.frase.activeUsers}
                    </p>
                    <p className={`text-xs ${result.impact.activeUsers.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.impact.activeUsers.percentageChange >= 0 ? '+' : ''}{result.impact.activeUsers.percentageChange.toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <MousePointer className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-gray-700">Sesiones</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {result.metrics.frase.sessions}
                    </p>
                    <p className={`text-xs ${result.impact.sessions.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.impact.sessions.percentageChange >= 0 ? '+' : ''}{result.impact.sessions.percentageChange.toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Eye className="h-4 w-4 text-purple-500 mr-1" />
                      <span className="text-sm font-medium text-gray-700">Vistas</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {result.metrics.frase.pageviews}
                    </p>
                    <p className={`text-xs ${result.impact.pageviews.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.impact.pageviews.percentageChange >= 0 ? '+' : ''}{result.impact.pageviews.percentageChange.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Análisis de IA para esta frase */}
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
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Análisis de Impacto de Frases Radio
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Mide el impacto de las frases de radio en las visitas a tu sitio web
            </p>
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
              disabled={analyzing || !selectedProperty || frasesData.length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
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
      </div>

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
                <p>Conecta tu cuenta de Google Analytics para analizar el impacto de las frases.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuración */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Configuración del Análisis</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Selección de cuenta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuenta de Analytics
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => {
                setSelectedAccount(e.target.value);
                setSelectedProperty(''); // Resetear propiedad al cambiar cuenta
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              disabled={!isConnected}
            >
              <option value="">Selecciona una cuenta...</option>
              {sortedAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.displayName || account.account_name || account.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selección de propiedad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Propiedad de Analytics
            </label>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
          </div>

          {/* Subida de archivo de frases */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo de Frases (Excel/CSV)
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFrasesFileUpload}
                className="hidden"
                id="frases-file-upload"
              />
              <label
                htmlFor="frases-file-upload"
                className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
              >
                <Upload className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">
                  {frasesFile ? frasesFile.name : 'Selecciona archivo Excel o CSV'}
                </span>
              </label>
            </div>
            {frasesData.length > 0 && (
              <p className="mt-2 text-sm text-green-600">
                ✓ {frasesData.length} frases cargadas
              </p>
            )}
          </div>
        </div>

        {/* Subida de audio (opcional) */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Audio de la Frase (Opcional)
          </label>
          <div className="relative">
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              className="hidden"
              id="audio-upload"
            />
            <label
              htmlFor="audio-upload"
              className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
            >
              <Radio className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">
                {audioFile ? audioFile.name : 'Selecciona audio de la frase'}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Progreso del análisis */}
      {analyzing && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Analizando Impacto</h3>
            <span className="text-sm text-gray-600">{analysisProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${analysisProgress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Analizando frase {Math.ceil((analysisProgress / 100) * frasesData.length)} de {frasesData.length}...
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
                      <li key={i}>{insight}</li>
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
                    <h3 className="font-medium text-gray-900">{result.frase.nombre}</h3>
                    <p className="text-sm text-gray-600">
                      {result.frase.dateTime.toLocaleDateString('es-CL')} {result.frase.dateTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} - {result.frase.canal}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {result.impact.activeUsers.significant ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Impacto Detectado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Sin Impacto Significativo
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
                      {result.metrics.frase.activeUsers}
                    </p>
                    <p className={`text-xs ${result.impact.activeUsers.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.impact.activeUsers.percentageChange >= 0 ? '+' : ''}{result.impact.activeUsers.percentageChange.toFixed(1)}%
                    </p>
                  </div>
                  
                  {/* Sesiones */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <MousePointer className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-gray-700">Sesiones</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {result.metrics.frase.sessions}
                    </p>
                    <p className={`text-xs ${result.impact.sessions.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.impact.sessions.percentageChange >= 0 ? '+' : ''}{result.impact.sessions.percentageChange.toFixed(1)}%
                    </p>
                  </div>
                  
                  {/* Vistas de Página */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Eye className="h-4 w-4 text-purple-500 mr-1" />
                      <span className="text-sm font-medium text-gray-700">Vistas</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {result.metrics.frase.pageviews}
                    </p>
                    <p className={`text-xs ${result.impact.pageviews.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.impact.pageviews.percentageChange >= 0 ? '+' : ''}{result.impact.pageviews.percentageChange.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Análisis de IA para esta frase */}
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
        className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Análisis de Impacto de Frases Radio
            </h1>
            <p className="text-purple-100">
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
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl mr-4">
            <Radio className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Configuración del Análisis</h2>
            <p className="text-gray-600 mt-1">Configura los parámetros para analizar el impacto de tus frases de radio</p>
          </div>
        </div>

        {/* Grid principal de configuración */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Card: Cuenta de Analytics */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-500 rounded-lg mr-3">
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
              className="w-full px-4 py-3 bg-white border border-purple-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
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
            className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-100"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-pink-500 rounded-lg mr-3">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Propiedad de Analytics</h3>
            </div>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-pink-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
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

          {/* Card: Archivo de Frases */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-500 rounded-lg mr-3">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Archivo de Frases</h3>
            </div>
            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFrasesFileUpload}
                className="hidden"
                id="frases-file-upload"
              />
              <label
                htmlFor="frases-file-upload"
                className="flex flex-col items-center justify-center w-full px-6 py-8 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all bg-white"
              >
                <Upload className="h-8 w-8 text-blue-500 mb-2" />
                <span className="text-sm text-gray-600 text-center">
                  {frasesFile ? (
                    <span className="text-blue-600 font-medium">{frasesFile.name}</span>
                  ) : (
                    'Selecciona archivo Excel o CSV'
                  )}
                </span>
              </label>
            </div>
            {frasesData.length > 0 && (
              <div className="mt-3 flex items-center text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                {frasesData.length} frases cargadas exitosamente
              </div>
            )}
          </motion.div>
        </div>

        {/* Sección opcional: Audio */}
        <motion.div
          whileHover={{ y: -1 }}
          className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 mb-8 border border-gray-200"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-gray-500 rounded-lg mr-3">
              <Radio className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Audio de la Frase (Opcional)</h3>
              <p className="text-sm text-gray-600">Sube el audio para análisis adicional</p>
            </div>
          </div>
          <div className="relative">
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              className="hidden"
              id="audio-upload"
            />
            <label
              htmlFor="audio-upload"
              className="flex items-center justify-center w-full px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all bg-white"
            >
              <Radio className="h-6 w-6 text-gray-400 mr-3" />
              <span className="text-sm text-gray-600">
                {audioFile ? (
                  <span className="text-blue-600 font-medium">{audioFile.name}</span>
                ) : (
                  'Selecciona audio de la frase'
                )}
              </span>
            </label>
          </div>
        </motion.div>

        {/* Botón de análisis principal */}
        <div className="flex justify-center mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={performAnalysis}
            disabled={analyzing || !selectedProperty || frasesData.length === 0}
            className="inline-flex items-center px-12 py-4 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-700 hover:via-pink-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {analyzing ? (
              <>
                <RefreshCw className="h-6 w-6 mr-3 animate-spin" />
                Analizando Impacto...
              </>
            ) : (
              <>
                <BarChart3 className="h-6 w-6 mr-3" />
                Analizar Impacto de Frases
              </>
            )}
          </motion.button>
        </div>

        {/* Progreso del análisis mejorado */}
        {analyzing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6 border border-purple-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-500 rounded-lg mr-3">
                  <RefreshCw className="h-5 w-5 text-white animate-spin" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Analizando Impacto</h3>
                  <p className="text-sm text-gray-600">Procesando datos de Google Analytics</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">{analysisProgress}%</div>
                <div className="text-sm text-gray-600">Completado</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-pink-600 h-4 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${analysisProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-sm text-gray-600 text-center">
              Analizando frase {Math.ceil((analysisProgress / 100) * frasesData.length)} de {frasesData.length}...
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
                  Para analizar el impacto de tus frases de radio, necesitas conectar tu cuenta de Google Analytics.
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

export default FrasesRadio;
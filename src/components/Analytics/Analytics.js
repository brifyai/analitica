import React, { useState, useEffect } from 'react';
// Versión forzada para romper caché - v2.0
import { useParams, Link } from 'react-router-dom';
import ErrorBoundary from '../ErrorBoundary';
import { useGoogleAnalytics } from '../../contexts/GoogleAnalyticsContext';
import LoadingSpinner from '../UI/LoadingSpinner';
import AnalyticsErrorDisplay from '../UI/AnalyticsErrorDisplay';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  Filter,
  Users,
  MousePointer,
  Eye,
  Clock,
  Globe,
  Activity,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Check,
  Settings,
  BarChart,
  PieChart,
  LineChart as LineChartIcon,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const Analytics = () => {
  const { propertyId } = useParams();
  const {
    properties,
    getAnalyticsData,
    loading,
    error,
    isConnected
  } = useGoogleAnalytics();

  // Add error state for this component
  const [componentError, setComponentError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Error handler for this component
  const handleError = (error, details = null) => {
    console.error('❌ ANALYTICS COMPONENT ERROR:', error);
    console.error('❌ ANALYTICS ERROR DETAILS:', details);
    setComponentError(error);
    setErrorDetails(details);
  };

  // Reset error handler
  const resetError = () => {
    setComponentError(null);
    setErrorDetails(null);
  };

  // Wrap async operations in try-catch
  const safeLoadAnalyticsData = async () => {
    try {
      resetError();
      setLoadingTimeout(false);
      await loadAnalyticsData();
    } catch (error) {
      handleError(error, {
        propertyId,
        isConnected,
        propertiesCount: properties.length,
        timestamp: new Date().toISOString()
      });
    }
  };

  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '30daysAgo',
    endDate: 'today'
  });
  const [selectedMetrics, setSelectedMetrics] = useState(['activeUsers', 'sessions']);
  const [selectedDimensions, setSelectedDimensions] = useState(['date']);
  const [chartType, setChartType] = useState('line');
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);
  const [showMetricSelector, setShowMetricSelector] = useState(false);
  const [showDimensionSelector, setShowDimensionSelector] = useState(false);
  const [searchMetric, setSearchMetric] = useState('');
  const [searchDimension, setSearchDimension] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Find the current property
  const currentProperty = properties.find(property => property.id === propertyId);
  
  // Debug logging
  useEffect(() => {
    console.log(`🔍 DEBUG: PropertyId desde URL: ${propertyId}`);
    console.log(`🔍 DEBUG: Total de propiedades disponibles: ${properties.length}`);
    console.log(`🔍 DEBUG: Propiedad encontrada:`, currentProperty);
    console.log(`🔍 DEBUG: Lista de IDs de propiedades:`, properties.map(p => p.id));
    console.log(`🔍 DEBUG: Estado de conexión: ${isConnected}`);
    console.log(`🔍 DEBUG: Estado de carga: ${loading}`);
    console.log(`🔍 DEBUG: Estado de carga de datos: ${loadingData}`);
    console.log(`🔍 DEBUG: Datos de analytics cargados:`, analyticsData);
    
    // Verificar si la propiedad existe en la lista
    const propertyExists = properties.some(property => property.id === propertyId);
    console.log(`🔍 DEBUG: ¿La propiedad ${propertyId} existe en la lista? ${propertyExists}`);
    
    if (!propertyExists && properties.length > 0) {
      console.log(`⚠️ ADVERTENCIA: La propiedad ${propertyId} no se encuentra en la lista de propiedades disponibles`);
      console.log(`🔍 DEBUG: Propiedades disponibles:`, properties.map(p => ({ id: p.id, name: p.name || p.displayName })));
    }
  }, [propertyId, properties, currentProperty, isConnected, loading, loadingData, analyticsData]);

  // Available metrics with categories
  const metricCategories = {
    'Tráfico y Usuarios': [
      { name: 'activeUsers', label: 'Usuarios Activos', description: 'Número de usuarios únicos activos', icon: Users },
      { name: 'sessions', label: 'Sesiones', description: 'Número total de sesiones', icon: MousePointer },
      { name: 'users', label: 'Usuarios Totales', description: 'Número total de usuarios', icon: Users },
      { name: 'newUsers', label: 'Nuevos Usuarios', description: 'Número de nuevos usuarios', icon: Users }
    ],
    'Contenido y Páginas': [
      { name: 'pageviews', label: 'Vistas de Página', description: 'Número de vistas de página', icon: Eye },
      { name: 'eventCount', label: 'Número de Eventos', description: 'Total de eventos registrados', icon: BarChart3 }
    ],
    'Compromiso y Comportamiento': [
      { name: 'bounceRate', label: 'Tasa de Rebote', description: 'Porcentaje de sesiones con rebote', icon: TrendingUp },
      { name: 'sessionDuration', label: 'Duración de Sesión', description: 'Duración promedio de sesión', icon: Clock },
      { name: 'engagementRate', label: 'Tasa de Compromiso', description: 'Porcentaje de sesiones comprometidas', icon: Activity },
      { name: 'engagedSessions', label: 'Sesiones Comprometidas', description: 'Número de sesiones comprometidas', icon: Activity },
      { name: 'engagementDuration', label: 'Duración de Compromiso', description: 'Tiempo total de compromiso', icon: Clock }
    ],
    'Conversiones': [
      { name: 'conversions', label: 'Conversiones', description: 'Número de conversiones', icon: Globe }
    ]
  };

  // Available dimensions with categories
  const dimensionCategories = {
    'Tiempo': [
      { name: 'date', label: 'Fecha', description: 'DD/MM/AAAA', icon: Calendar },
      { name: 'dateMinute', label: 'Fecha y Hora/minutos', description: 'DD/MM/AAAA HH:MM', icon: Clock },
      { name: 'minute', label: 'Minuto exacto', description: 'HH:MM', icon: Clock }
    ],
    'Geográficos': [
      { name: 'country', label: 'País', description: 'País del usuario', icon: Globe },
      { name: 'city', label: 'Ciudad', description: 'Ciudad del usuario', icon: Globe }
    ],
    'Dispositivo y Tecnología': [
      { name: 'deviceCategory', label: 'Categoría de Dispositivo', description: 'Tipo de dispositivo (móvil, desktop, tablet)', icon: Activity },
      { name: 'browser', label: 'Navegador', description: 'Navegador utilizado', icon: Activity },
      { name: 'operatingSystem', label: 'Sistema Operativo', description: 'Sistema operativo', icon: Activity }
    ],
    'Tráfico y Adquisición': [
      { name: 'source', label: 'Fuente', description: 'Fuente de tráfico', icon: TrendingUp },
      { name: 'medium', label: 'Medio', description: 'Medio de tráfico', icon: TrendingUp },
      { name: 'campaign', label: 'Campaña', description: 'Campaña de marketing', icon: TrendingUp },
      { name: 'sessionSource', label: 'Fuente de Sesión', description: 'Fuente original de la sesión', icon: TrendingUp },
      { name: 'sessionMedium', label: 'Medio de Sesión', description: 'Medio original de la sesión', icon: TrendingUp },
      { name: 'sessionCampaign', label: 'Campaña de Sesión', description: 'Campaña original de la sesión', icon: TrendingUp }
    ],
    'Contenido y Páginas': [
      { name: 'pagePath', label: 'Ruta de Página', description: 'Ruta de la página visitada', icon: Eye },
      { name: 'pageTitle', label: 'Título de Página', description: 'Título de la página', icon: Eye },
      { name: 'landingPage', label: 'Página de Entrada', description: 'Primera página de la sesión', icon: Eye },
      { name: 'exitPage', label: 'Página de Salida', description: 'Última página de la sesión', icon: Eye },
      { name: 'pageLocation', label: 'URL de Página', description: 'URL completa de la página', icon: Eye }
    ]
  };

  // Google Analytics API dimension names mapping
  const dimensionMapping = {
    'date': 'date',
    'dateMinute': 'nthMinute',  // Corregido: dateMinute no existe, usar nthMinute
    'minute': 'minute',
    'country': 'country',
    'city': 'city',
    'deviceCategory': 'deviceCategory',
    'browser': 'browser',
    'operatingSystem': 'operatingSystem',
    'source': 'source',
    'medium': 'medium',
    'campaign': 'campaign',
    'pagePath': 'pagePath',
    'pageTitle': 'pageTitle',
    'sessionSource': 'sessionSource',
    'sessionMedium': 'sessionMedium',
    'sessionCampaign': 'sessionCampaign',
    'landingPage': 'landingPagePlusQueryString',
    'exitPage': 'exitPagePath',
    'pageLocation': 'pageLocation'
  };

  // Predefined date ranges
  const dateRangePresets = [
    { label: 'Hoy', value: { startDate: 'today', endDate: 'today' } },
    { label: 'Ayer', value: { startDate: 'yesterday', endDate: 'yesterday' } },
    { label: 'Últimos 7 días', value: { startDate: '7daysAgo', endDate: 'today' } },
    { label: 'Últimos 30 días', value: { startDate: '30daysAgo', endDate: 'today' } },
    { label: 'Últimos 90 días', value: { startDate: '90daysAgo', endDate: 'today' } },
    { label: 'Este mes', value: { startDate: 'firstDayOfMonth', endDate: 'today' } },
    { label: 'Mes pasado', value: { startDate: 'firstDayOfLastMonth', endDate: 'lastDayOfLastMonth' } },
    { label: 'Este año', value: { startDate: 'firstDayOfYear', endDate: 'today' } },
    { label: 'Año pasado', value: { startDate: 'firstDayOfLastYear', endDate: 'lastDayOfLastYear' } }
  ];

  // Chart type options
  const chartTypeOptions = [
    { name: 'line', label: 'Línea', icon: LineChartIcon },
    { name: 'bar', label: 'Barras', icon: BarChart },
    { name: 'area', label: 'Área', icon: TrendingUp },
    { name: 'pie', label: 'Circular', icon: PieChart }
  ];

  function resolveRelativeDate(dateValue) {
    const today = new Date();
    
    switch (dateValue) {
      case 'today':
        return today;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday;
      case '7daysAgo':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return sevenDaysAgo;
      case '30daysAgo':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return thirtyDaysAgo;
      case '90daysAgo':
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        return ninetyDaysAgo;
      case 'firstDayOfMonth':
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return firstDayOfMonth;
      case 'lastDayOfLastMonth':
        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        return lastDayOfLastMonth;
      case 'firstDayOfLastMonth':
        const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        return firstDayOfLastMonth;
      case 'firstDayOfYear':
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        return firstDayOfYear;
      case 'lastDayOfLastYear':
        const lastDayOfLastYear = new Date(today.getFullYear() - 1, 11, 31);
        return lastDayOfLastYear;
      case 'firstDayOfLastYear':
        const firstDayOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
        return firstDayOfLastYear;
      default:
        // Si es una fecha específica en formato YYYY-MM-DD
        if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return new Date(dateValue);
        }
        // Para cualquier otro caso, devolver hoy
        return today;
    }
  }

  function formatDateForDisplay(dateValue) {
    try {
      const date = resolveRelativeDate(dateValue);
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        console.warn(`⚠️ Fecha inválida: ${dateValue}`);
        return dateValue; // Devolver el valor original si no se puede procesar
      }
      
      // Formato DD/MM/AAAA
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error(`❌ Error formateando fecha: ${dateValue}`, error);
      return dateValue; // Devolver el valor original si hay error
    }
  }

  // Función para formatear datos específicamente para la tabla
  const formatTableData = (dimension, value) => {
    if (!value) return value;
    
    try {
      if (dimension === 'date') {
        // Formato: DD/MM/AAAA
        let date;
        
        if (value.length === 8) {
          // Formato YYYYMMDD
          const year = value.substring(0, 4);
          const month = value.substring(4, 6);
          const day = value.substring(6, 8);
          date = new Date(`${year}-${month}-${day}`);
        } else if (value.length === 10) {
          // Formato YYYY-MM-DD
          date = new Date(value);
        } else {
          date = new Date(value);
        }
        
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        }
      } else if (dimension === 'dateMinute') {
        // Formato: DD/MM/AAAA HH:MM (usando nthMinute)
        
        // Para nthMinute, el valor debe estar entre 0-1439 (minutos del día)
        const minuteOfDay = parseInt(value);
        if (!isNaN(minuteOfDay) && minuteOfDay >= 0 && minuteOfDay <= 1439) {
          const hours = Math.floor(minuteOfDay / 60);
          const minutes = minuteOfDay % 60;
          const formattedHours = hours.toString().padStart(2, '0');
          const formattedMinutes = minutes.toString().padStart(2, '0');
          
          // Obtener la fecha actual para mostrarla
          const today = new Date();
          
          return today.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }) + ` ${formattedHours}:${formattedMinutes}`;
        } else {
          // Si el valor es numérico y está fuera del rango de nthMinute, probablemente es otro tipo de dato
          if (!isNaN(value) && value.length > 0) {
            console.warn(`⚠️ Valor numérico fuera de rango para nthMinute (${value}). Posiblemente es un timestamp o dateHour mal mapeado.`);
            // Si es un valor grande, probablemente es un timestamp - devolver sin procesar
            if (parseInt(value) > 1000000000) {
              return value;
            }
            // Si es un valor mediano, podría ser dateHour (0-23) - intentar formatear como hora
            const hourValue = parseInt(value);
            if (hourValue >= 0 && hourValue <= 23) {
              const today = new Date();
              return today.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }) + ` ${hourValue.toString().padStart(2, '0')}:00`;
            }
          }
          
          // Mantener compatibilidad con formatos antiguos
          let date;
          
          if (value.length === 12) {
            // Formato YYYYMMDDHHMM
            const year = value.substring(0, 4);
            const month = value.substring(4, 6);
            const day = value.substring(6, 8);
            const hour = value.substring(8, 10);
            const minute = value.substring(10, 12);
            date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
          } else if (value.length === 10) {
            // Formato YYYYMMDDHH (sin minutos)
            const year = value.substring(0, 4);
            const month = value.substring(4, 6);
            const day = value.substring(6, 8);
            const hour = value.substring(8, 10);
            date = new Date(`${year}-${month}-${day}T${hour}:00:00`);
          } else if (value.includes('T')) {
            // Formato ISO
            date = new Date(value);
          } else {
            // Último intento: parseo directo
            date = new Date(value);
          }
          
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }) + ' ' + date.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
          }
        }
      } else if (dimension === 'minute') {
        // Formato: HH:MM
        if (value.length === 5 && value.includes(':')) {
          return value;
        } else if (value.length === 2) {
          return `${value}:00`;
        } else if (value.length === 4) {
          // Formato HHMM (ej: 1430) -> HH:MM (ej: 14:30)
          const hours = value.substring(0, 2);
          const minutes = value.substring(2, 4);
          return `${hours}:${minutes}`;
        }
      }
    } catch (error) {
      console.warn(`⚠️ Error formateando dato para tabla: ${dimension} = ${value}`, error);
    }
    
    return value;
  };

  const loadAnalyticsData = async () => {
    if (!currentProperty || !isConnected) return;

    console.log(`🔍 DEBUG: Iniciando carga de datos para propiedad ${propertyId}`);
    console.log(`🔍 DEBUG: Métricas seleccionadas:`, selectedMetrics);
    console.log(`🔍 DEBUG: Dimensiones seleccionadas:`, selectedDimensions);
    console.log(`🔍 DEBUG: Rango de fechas:`, dateRange);
    console.log(`🔍 DEBUG: Propiedad actual:`, currentProperty);
    
    setLoadingData(true);
    try {
      // Mapear las dimensiones a los nombres correctos de la API
      const apiDimensions = selectedDimensions.map(dim => dimensionMapping[dim] || dim);
      
      console.log(`🔍 DEBUG: Dimensiones mapeadas para API:`, apiDimensions);
      
      const data = await getAnalyticsData(
        propertyId,
        selectedMetrics,
        apiDimensions,
        dateRange
      );
      console.log(`✅ DEBUG: Datos cargados exitosamente:`, data);
      console.log(`🔍 DEBUG: Estructura de datos:`, {
        rows: data?.rows,
        totals: data?.totals,
        rowCount: data?.rows?.length,
        totalCount: data?.totals?.length,
        maximums: data?.maximums,
        minimums: data?.minimums,
        rowCountTotal: data?.rowCountTotal,
        metadata: data?.metadata
      });
      
      // Verificar si los datos tienen la estructura esperada
      if (!data || (!data.rows && !data.totals)) {
        console.warn('⚠️ ADVERTENCIA: Los datos no tienen la estructura esperada:', data);
      }
      
      setAnalyticsData(data);
    } catch (err) {
      console.error('❌ ERROR loading analytics data:', err);
      console.error('❌ ERROR details:', err.response?.data || err.message);
      console.error('❌ ERROR stack:', err.stack);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (currentProperty && isConnected) {
      safeLoadAnalyticsData();
    }
  }, [currentProperty, isConnected, selectedMetrics, selectedDimensions, dateRange]);

  // Agregar un timeout para detectar si la página se queda cargando demasiado tiempo
  useEffect(() => {
    if (loadingData && !loadingTimeout && !componentError) {
      const timeout = setTimeout(() => {
        console.warn('⚠️ ADVERTENCIA: La página de analytics está cargando por demasiado tiempo');
        setLoadingTimeout(true);
        handleError(new Error('La carga de datos está tomando demasiado tiempo. Esto puede deberse a problemas de conexión o a que la propiedad tiene demasiados datos.'), {
          type: 'timeout',
          propertyId,
          loadingData,
          analyticsData: !!analyticsData,
          timestamp: new Date().toISOString()
        });
      }, 30000); // 30 segundos

      return () => clearTimeout(timeout);
    }
  }, [loadingData, loadingTimeout, componentError, propertyId, analyticsData]);

  const handleMetricToggle = (metric) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const handleDimensionToggle = (dimension) => {
    setSelectedDimensions(prev => 
      prev.includes(dimension) 
        ? prev.filter(d => d !== dimension)
        : [...prev, dimension]
    );
  };

  const handleDateRangePreset = (preset) => {
    console.log(`🔍 DEBUG: Aplicando preset: ${preset.label}`, preset.value);
    
    setDateRange(preset.value);
    setShowCustomDateRange(false);
    
    // Detectar si es un rango de un solo día (Hoy, Ayer)
    const isSingleDayRange = (
      preset.value.startDate === preset.value.endDate &&
      (preset.value.startDate === 'today' || preset.value.startDate === 'yesterday')
    );
    
    console.log(`🔍 DEBUG: ¿Es rango de un solo día? ${isSingleDayRange}`);
    console.log(`🔍 DEBUG: startDate: ${preset.value.startDate}, endDate: ${preset.value.endDate}`);
    
    if (isSingleDayRange) {
      // Si es un solo día, cambiar automáticamente a mostrar horas (24 horas)
      console.log(`🔍 DEBUG: Cambiando automáticamente a dimensión 'dateMinute' para mostrar 24 horas`);
      setSelectedDimensions(['dateMinute']);
    } else {
      // Para rangos múltiples, volver a vista por días
      console.log(`🔍 DEBUG: Cambiando a dimensión 'date' para rango de múltiples días`);
      setSelectedDimensions(['date']);
    }
  };

  const handleCustomDateRange = (startDate, endDate) => {
    console.log(`🔍 DEBUG: Aplicando rango personalizado: ${startDate} - ${endDate}`);
    
    setDateRange({ startDate, endDate });
    
    // Detectar si es un rango de un solo día (fechas personalizadas)
    const isSingleDayRange = startDate === endDate;
    
    console.log(`🔍 DEBUG: ¿Es rango de un solo día (personalizado)? ${isSingleDayRange}`);
    
    if (isSingleDayRange && startDate && endDate) {
      // Si es un solo día, cambiar automáticamente a mostrar horas (24 horas)
      console.log(`🔍 DEBUG: Cambiando automáticamente a dimensión 'dateMinute' para mostrar 24 horas`);
      setSelectedDimensions(['dateMinute']);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Función para ordenar datos
  const sortData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Manejar valores nulos o indefinidos
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Determinar si es numérico
      const aNum = parseFloat(aValue);
      const bNum = parseFloat(bValue);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        // Ordenamiento numérico
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      } else {
        // Ordenamiento de texto
        const aStr = aValue.toString().toLowerCase();
        const bStr = bValue.toString().toLowerCase();
        
        if (sortConfig.direction === 'asc') {
          return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
        } else {
          return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
        }
      }
    });
  };

  // Transform data for charts
  const transformDataForChart = (data) => {
    console.log(`🔍 DEBUG: Transformando datos para gráfico. Datos recibidos:`, data);
    
    // Verificar diferentes estructuras de datos posibles
    let rows = [];
    if (data?.rows) {
      rows = data.rows;
      console.log(`🔍 DEBUG: Usando data.rows, ${rows.length} filas encontradas`);
    } else if (data?.totals) {
      rows = data.totals;
      console.log(`🔍 DEBUG: Usando data.totals, ${rows.length} filas encontradas`);
    } else if (Array.isArray(data)) {
      rows = data;
      console.log(`🔍 DEBUG: Usando data como array, ${rows.length} filas encontradas`);
    } else {
      console.log(`🔍 DEBUG: No se encontraron filas en ninguna estructura conocida`);
      console.log(`🔍 DEBUG: Estructura completa de datos:`, JSON.stringify(data, null, 2));
      return [];
    }

    if (rows.length === 0) {
      console.log(`🔍 DEBUG: No hay datos para transformar`);
      return [];
    }

    console.log(`🔍 DEBUG: Procesando ${rows.length} filas`);
    console.log(`🔍 DEBUG: Métricas seleccionadas:`, selectedMetrics);
    console.log(`🔍 DEBUG: Dimensiones seleccionadas:`, selectedDimensions);
    console.log(`🔍 DEBUG: Primera fila de datos:`, rows[0]);

    const transformedData = rows.map((row, index) => {
      const chartData = {};
      
      // Procesar dimensiones - Google Analytics API usa dimensionValues y metricValues
      selectedDimensions.forEach((dim, dimIndex) => {
        // Intentar diferentes estructuras de datos
        let dimensionValue = row[dim]; // Estructura directa
        
        if (!dimensionValue && row.dimensionValues) {
          // Estructura de Google Analytics API
          dimensionValue = row.dimensionValues[dimIndex]?.value;
        }
        
        if (!dimensionValue && row[`dimensionValues[${dimIndex}]`]) {
          // Estructura alternativa
          dimensionValue = row[`dimensionValues[${dimIndex}]`];
        }
        
        // Formatear dimensiones de tiempo para mejor visualización
        if (dim === 'minute' && dimensionValue) {
          // Formatear minuto exacto como HH:MM
          if (dimensionValue.length === 5 && dimensionValue.includes(':')) {
            chartData[dim] = dimensionValue;
          } else if (dimensionValue.length === 2) {
            chartData[dim] = `${dimensionValue}:00`;
          } else if (dimensionValue.length === 4) {
            // Formato HHMM (ej: 1430) -> HH:MM (ej: 14:30)
            const hours = dimensionValue.substring(0, 2);
            const minutes = dimensionValue.substring(2, 4);
            chartData[dim] = `${hours}:${minutes}`;
          } else {
            chartData[dim] = dimensionValue;
          }
        } else if (dim === 'dateMinute' && dimensionValue) {
          // Formatear fecha y minuto (usando nthMinute)
          try {
            // Para nthMinute, el valor debe estar entre 0-1439 (minutos del día)
            const minuteOfDay = parseInt(dimensionValue);
            if (!isNaN(minuteOfDay) && minuteOfDay >= 0 && minuteOfDay <= 1439) {
              const hours = Math.floor(minuteOfDay / 60);
              const minutes = minuteOfDay % 60;
              const formattedHours = hours.toString().padStart(2, '0');
              const formattedMinutes = minutes.toString().padStart(2, '0');
              
              // Obtener la fecha actual para mostrarla
              const today = new Date();
              
              chartData[dim] = today.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }) + ` ${formattedHours}:${formattedMinutes}`;
            } else {
              // Si el valor es numérico y está fuera del rango de nthMinute, probablemente es otro tipo de dato
              if (!isNaN(dimensionValue) && dimensionValue.length > 0) {
                console.warn(`⚠️ Valor numérico fuera de rango para nthMinute en gráfico (${dimensionValue}). Posiblemente es un timestamp o dateHour mal mapeado.`);
                // Si es un valor grande, probablemente es un timestamp - devolver sin procesar
                if (parseInt(dimensionValue) > 1000000000) {
                  chartData[dim] = dimensionValue;
                  return chartData;
                }
                // Si es un valor mediano, podría ser dateHour (0-23) - intentar formatear como hora
                const hourValue = parseInt(dimensionValue);
                if (hourValue >= 0 && hourValue <= 23) {
                  const today = new Date();
                  chartData[dim] = today.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  }) + ` ${hourValue.toString().padStart(2, '0')}:00`;
                  return chartData;
                }
              }
              
              // Mantener compatibilidad con formatos antiguos
              let date;
              
              // Intentar diferentes formatos
              if (dimensionValue.length === 12) {
                // Formato YYYYMMDDHHMM
                const year = dimensionValue.substring(0, 4);
                const month = dimensionValue.substring(4, 6);
                const day = dimensionValue.substring(6, 8);
                const hour = dimensionValue.substring(8, 10);
                const minute = dimensionValue.substring(10, 12);
                date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
              } else if (dimensionValue.length === 10) {
                // Formato YYYYMMDDHH (sin minutos)
                const year = dimensionValue.substring(0, 4);
                const month = dimensionValue.substring(4, 6);
                const day = dimensionValue.substring(6, 8);
                const hour = dimensionValue.substring(8, 10);
                date = new Date(`${year}-${month}-${day}T${hour}:00:00`);
              } else if (dimensionValue.includes('T')) {
                // Formato ISO
                date = new Date(dimensionValue);
              } else {
                // Último intento: parseo directo
                date = new Date(dimensionValue);
              }
              
              if (!isNaN(date.getTime())) {
                chartData[dim] = date.toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }) + ' ' + date.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                });
              } else {
                chartData[dim] = dimensionValue;
              }
            }
          } catch {
            chartData[dim] = dimensionValue;
          }
        } else if (dim === 'date' && dimensionValue) {
          // Formatear fecha regular
          try {
            let date;
            
            if (dimensionValue.length === 8) {
              // Formato YYYYMMDD
              const year = dimensionValue.substring(0, 4);
              const month = dimensionValue.substring(4, 6);
              const day = dimensionValue.substring(6, 8);
              date = new Date(`${year}-${month}-${day}`);
            } else if (dimensionValue.length === 10) {
              // Formato YYYY-MM-DD
              date = new Date(dimensionValue);
            } else {
              date = new Date(dimensionValue);
            }
            
            if (!isNaN(date.getTime())) {
              chartData[dim] = date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });
            } else {
              chartData[dim] = dimensionValue;
            }
          } catch {
            chartData[dim] = dimensionValue;
          }
        } else {
          chartData[dim] = dimensionValue || `Dim ${index}`;
        }
      });
      
      // Procesar métricas
      selectedMetrics.forEach((metric, metricIndex) => {
        // Intentar diferentes estructuras de datos
        let metricValue = row[metric]; // Estructura directa
        
        if (!metricValue && row.metricValues) {
          // Estructura de Google Analytics API
          metricValue = row.metricValues[metricIndex]?.value;
        }
        
        if (!metricValue && row[`metricValues[${metricIndex}]`]) {
          // Estructura alternativa
          metricValue = row[`metricValues[${metricIndex}]`];
        }
        
        // Convertir a número si es posible
        const numValue = parseFloat(metricValue);
        chartData[metric] = isNaN(numValue) ? 0 : numValue;
      });
      
      return chartData;
    });
    
    console.log(`🔍 DEBUG: Datos transformados:`, transformedData);
    console.log(`🔍 DEBUG: Primer elemento transformado:`, transformedData[0]);
    return transformedData;
  };

  // Colors for charts
  const chartColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  // Filter metrics and dimensions based on search
  const filteredMetrics = Object.entries(metricCategories).reduce((acc, [category, metrics]) => {
    const filtered = metrics.filter(metric => 
      metric.label.toLowerCase().includes(searchMetric.toLowerCase()) ||
      metric.description.toLowerCase().includes(searchMetric.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {});

  const filteredDimensions = Object.entries(dimensionCategories).reduce((acc, [category, dimensions]) => {
    const filtered = dimensions.filter(dimension => 
      dimension.label.toLowerCase().includes(searchDimension.toLowerCase()) ||
      dimension.description.toLowerCase().includes(searchDimension.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {});

  // Show loading spinner while connecting or loading properties
  if (loading || (isConnected && properties.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-gray-500">
            {loading ? 'Conectando con Google Analytics...' : 'Cargando propiedades...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No hay conexión con Google Analytics
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Conecta tu cuenta de Google Analytics para ver los datos.
        </p>
      </div>
    );
  }

  // Show component error if exists
  if (componentError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 text-center mb-2">
            Error en Analytics
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Ha ocurrido un error al cargar los datos de Analytics para esta propiedad.
          </p>
          
          {process.env.NODE_ENV === 'development' && errorDetails && (
            <details className="mb-4 p-3 bg-gray-100 rounded text-sm">
              <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                Detalles del error (solo desarrollo)
              </summary>
              <pre className="whitespace-pre-wrap text-red-600 text-xs overflow-auto max-h-40">
                {componentError.toString()}
              </pre>
              <pre className="whitespace-pre-wrap text-gray-600 text-xs overflow-auto max-h-40 mt-2">
                {JSON.stringify(errorDetails, null, 2)}
              </pre>
            </details>
          )}
          
          <div className="space-y-3">
            <button
              onClick={safeLoadAnalyticsData}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar carga
            </button>
            <Link
              to="/accounts"
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a cuentas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Only show "property not found" if we have properties loaded and the specific property doesn't exist
  if (properties.length > 0 && !currentProperty) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Propiedad no encontrada
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          La propiedad especificada no existe o no tienes acceso a ella.
        </p>
        <div className="mt-6">
          <Link
            to="/accounts"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a cuentas
          </Link>
        </div>
      </div>
    );
  }

  const chartData = transformDataForChart(analyticsData);

  return (
    <ErrorBoundary reloadOnRetry={true}>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link
            to={`/properties/${currentProperty.accountId}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a propiedades
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Analytics - {currentProperty.displayName || currentProperty.name}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Análisis completo de datos de Google Analytics 4
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={safeLoadAnalyticsData}
            disabled={loadingData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loadingData ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <span className="inline-flex items-center justify-center w-4 h-4 mr-2">
              <Download className="w-4 h-4" style={{ minWidth: '16px', minHeight: '16px' }} />
            </span>
            Exportar
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <AnalyticsErrorDisplay
          error={error}
          errorType={error?.includes('permisos') ? 'permissions' : error?.includes('conexión') ? 'connection' : 'generic'}
          onRetry={safeLoadAnalyticsData}
          onReconnect={() => window.location.href = '/dashboard'}
          onSettings={() => window.location.href = '/settings'}
          isLoading={loadingData}
        />
      )}

      {/* Main Controls */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            
            {/* Date Range Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Calendar className="h-4 w-4 inline mr-2" />
                Rango de Fechas
              </label>
              
              {/* Quick Presets */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {dateRangePresets.slice(0, 6).map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handleDateRangePreset(preset)}
                    className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              
              {/* Custom Date Range */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowCustomDateRange(!showCustomDateRange)}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Personalizado
                  {showCustomDateRange ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                </button>
                <span className="text-sm text-gray-500">
                  {formatDateForDisplay(dateRange.startDate)} - {formatDateForDisplay(dateRange.endDate)}
                </span>
              </div>
              
              {showCustomDateRange && (
                <div className="mt-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={(() => {
                        const date = resolveRelativeDate(dateRange.startDate);
                        return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
                      })()}
                      onChange={(e) => handleCustomDateRange(e.target.value, dateRange.endDate)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    />
                    <span className="flex items-center text-gray-500">hasta</span>
                    <input
                      type="date"
                      value={(() => {
                        const date = resolveRelativeDate(dateRange.endDate);
                        return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
                      })()}
                      onChange={(e) => handleCustomDateRange(dateRange.startDate, e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Metrics Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <BarChart3 className="h-4 w-4 inline mr-2" />
                Métricas ({selectedMetrics.length})
              </label>
              <button
                onClick={() => setShowMetricSelector(!showMetricSelector)}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                <span>Seleccionar métricas</span>
                {showMetricSelector ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              
              {/* Selected Metrics Display */}
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedMetrics.map((metric) => {
                  const metricInfo = Object.values(metricCategories).flat().find(m => m.name === metric);
                  return (
                    <span key={metric} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {metricInfo?.label || metric}
                      <button
                        onClick={() => handleMetricToggle(metric)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Dimensions Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Filter className="h-4 w-4 inline mr-2" />
                Dimensiones ({selectedDimensions.length})
              </label>
              <button
                onClick={() => setShowDimensionSelector(!showDimensionSelector)}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                <span>Seleccionar dimensiones</span>
                {showDimensionSelector ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              
              {/* Selected Dimensions Display */}
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedDimensions.map((dimension) => {
                  const dimensionInfo = Object.values(dimensionCategories).flat().find(d => d.name === dimension);
                  return (
                    <span key={dimension} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {dimensionInfo?.label || dimension}
                      <button
                        onClick={() => handleDimensionToggle(dimension)}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chart Type Selector */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Visualización
            </label>
            <div className="flex space-x-2">
              {chartTypeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.name}
                    onClick={() => setChartType(option.name)}
                    className={`flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                      chartType === option.name
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Selector Modal */}
      {showMetricSelector && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowMetricSelector(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Seleccionar Métricas
                  </h3>
                  <button
                    onClick={() => setShowMetricSelector(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar métricas..."
                      value={searchMetric}
                      onChange={(e) => setSearchMetric(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                {/* Metrics Categories */}
                <div className="max-h-96 overflow-y-auto space-y-4">
                  {Object.entries(filteredMetrics).map(([category, metrics]) => (
                    <div key={category}>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">{category}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {metrics.map((metric) => {
                          const Icon = metric.icon;
                          const isSelected = selectedMetrics.includes(metric.name);
                          return (
                            <label
                              key={metric.name}
                              className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleMetricToggle(metric.name)}
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-3"
                              />
                              <Icon className="h-4 w-4 text-gray-500 mr-2" />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">{metric.label}</div>
                                <div className="text-xs text-gray-500">{metric.description}</div>
                              </div>
                              {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowMetricSelector(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dimensions Selector Modal */}
      {showDimensionSelector && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowDimensionSelector(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Seleccionar Dimensiones
                  </h3>
                  <button
                    onClick={() => setShowDimensionSelector(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar dimensiones..."
                      value={searchDimension}
                      onChange={(e) => setSearchDimension(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                {/* Dimensions Categories */}
                <div className="max-h-96 overflow-y-auto space-y-4">
                  {Object.entries(filteredDimensions).map(([category, dimensions]) => (
                    <div key={category}>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">{category}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {dimensions.map((dimension) => {
                          const Icon = dimension.icon;
                          const isSelected = selectedDimensions.includes(dimension.name);
                          return (
                            <label
                              key={dimension.name}
                              className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
                                isSelected
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleDimensionToggle(dimension.name)}
                                className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 mr-3"
                              />
                              <Icon className="h-4 w-4 text-gray-500 mr-2" />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">{dimension.label}</div>
                                <div className="text-xs text-gray-500">{dimension.description}</div>
                              </div>
                              {isSelected && <Check className="h-4 w-4 text-green-600" />}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowDimensionSelector(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Data Display */}
      {loadingData ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : analyticsData ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {selectedMetrics.map((metric, index) => {
                console.log(`🔍 DEBUG: Procesando métrica ${metric} para tarjeta de resumen`);
                console.log(`🔍 DEBUG: Estructura de analyticsData:`, analyticsData);
                
                // Intentar obtener el valor de diferentes estructuras posibles
                let total = 0;
                
                // Estructura de Google Analytics API v1beta
                if (analyticsData?.totals?.[0]?.metricValues) {
                  const metricIndex = selectedMetrics.indexOf(metric);
                  const metricValue = analyticsData.totals[0].metricValues[metricIndex]?.value;
                  if (metricValue) {
                    total = parseFloat(metricValue);
                    console.log(`🔍 DEBUG: Valor encontrado en totals[0].metricValues[${metricIndex}]:`, total);
                  }
                }
                
                // Estructura directa en totals
                if (total === 0 && analyticsData?.totals?.[0]?.[metric]) {
                  total = analyticsData.totals[0][metric];
                  console.log(`🔍 DEBUG: Valor encontrado en analyticsData.totals[0].${metric}:`, total);
                }
                
                // Estructura en maximums
                if (total === 0 && analyticsData?.maximums?.[0]?.metricValues) {
                  const metricIndex = selectedMetrics.indexOf(metric);
                  const metricValue = analyticsData.maximums[0].metricValues[metricIndex]?.value;
                  if (metricValue) {
                    total = parseFloat(metricValue);
                    console.log(`🔍 DEBUG: Valor encontrado en maximums[0].metricValues[${metricIndex}]:`, total);
                  }
                } else if (total === 0 && analyticsData?.maximums?.[0]?.[metric]) {
                  total = analyticsData.maximums[0][metric];
                  console.log(`🔍 DEBUG: Valor encontrado en analyticsData.maximums[0].${metric}:`, total);
                }
                
                // Estructura en minimums
                if (total === 0 && analyticsData?.minimums?.[0]?.metricValues) {
                  const metricIndex = selectedMetrics.indexOf(metric);
                  const metricValue = analyticsData.minimums[0].metricValues[metricIndex]?.value;
                  if (metricValue) {
                    total = parseFloat(metricValue);
                    console.log(`🔍 DEBUG: Valor encontrado en minimums[0].metricValues[${metricIndex}]:`, total);
                  }
                } else if (total === 0 && analyticsData?.minimums?.[0]?.[metric]) {
                  total = analyticsData.minimums[0][metric];
                  console.log(`🔍 DEBUG: Valor encontrado en analyticsData.minimums[0].${metric}:`, total);
                }
                
                // Estructura en rows (primera fila)
                if (total === 0 && analyticsData?.rows?.[0]?.metricValues) {
                  const metricIndex = selectedMetrics.indexOf(metric);
                  const metricValue = analyticsData.rows[0].metricValues[metricIndex]?.value;
                  if (metricValue) {
                    total = parseFloat(metricValue);
                    console.log(`🔍 DEBUG: Valor encontrado en rows[0].metricValues[${metricIndex}]:`, total);
                  }
                } else if (total === 0 && analyticsData?.rows?.[0]?.[metric]) {
                  total = analyticsData.rows[0][metric];
                  console.log(`🔍 DEBUG: Valor encontrado en analyticsData.rows[0].${metric}:`, total);
                }
                
                // Estructura directa
                if (total === 0 && analyticsData?.[metric]) {
                  total = analyticsData[metric];
                  console.log(`🔍 DEBUG: Valor encontrado en analyticsData.${metric}:`, total);
                }
                
                // Si todavía es 0, intentar sumar todas las filas
                if (total === 0 && analyticsData?.rows?.length > 0) {
                  const metricIndex = selectedMetrics.indexOf(metric);
                  total = analyticsData.rows.reduce((sum, row) => {
                    const value = row.metricValues?.[metricIndex]?.value || row[metric] || 0;
                    return sum + parseFloat(value || 0);
                  }, 0);
                  console.log(`🔍 DEBUG: Suma total de todas las filas para ${metric}:`, total);
                }
                
                // Asegurar que sea un número
                total = parseFloat(total) || 0;
                
                const metricInfo = Object.values(metricCategories).flat().find(m => m.name === metric);
                const Icon = metricInfo?.icon || BarChart3;
                console.log(`🔍 DEBUG: Tarjeta de resumen - Métrica: ${metric}, Valor: ${total}, Tipo: ${typeof total}`);
              
              return (
                <div key={metric} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`p-3 rounded-md`} style={{backgroundColor: `${chartColors[index]}20`}}>
                          <Icon className={`h-6 w-6`} style={{color: chartColors[index]}} />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {metricInfo?.label || metric}
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {typeof total === 'number' ? total.toLocaleString('es-ES') : total}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chart */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Visualización de Datos
              </h3>
              
              {chartData.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No hay datos disponibles
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No se encontraron datos para el rango de fechas y métricas seleccionadas.
                  </p>
                </div>
              ) : (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'line' && (
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={selectedDimensions[0]} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {selectedMetrics.map((metric, index) => (
                          <Line 
                            key={metric}
                            type="monotone" 
                            dataKey={metric} 
                            stroke={chartColors[index]} 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                        ))}
                      </LineChart>
                    )}
                    
                    {chartType === 'bar' && (
                      <RechartsBarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={selectedDimensions[0]} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {selectedMetrics.map((metric, index) => (
                          <Bar
                            key={metric}
                            dataKey={metric}
                            fill={chartColors[index]}
                          />
                        ))}
                      </RechartsBarChart>
                    )}
                    
                    {chartType === 'area' && (
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={selectedDimensions[0]} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {selectedMetrics.map((metric, index) => (
                          <Area 
                            key={metric}
                            type="monotone" 
                            dataKey={metric} 
                            stroke={chartColors[index]}
                            fill={chartColors[index]}
                            fillOpacity={0.6}
                          />
                        ))}
                      </AreaChart>
                    )}
                    
                    {chartType === 'pie' && selectedMetrics.length === 1 && (
                      <RechartsPieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey={selectedMetrics[0]}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Data Table */}
          {chartData.length > 0 && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Datos Detallados
                  </h3>
                  <div className="text-sm text-gray-500">
                    {sortConfig.key && (
                      <span className="inline-flex items-center">
                        Ordenado por: <span className="font-medium ml-1">
                          {[...selectedDimensions, ...selectedMetrics].find(key => key === sortConfig.key) || sortConfig.key}
                        </span>
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {selectedDimensions.map((dimension) => {
                          const dimensionInfo = Object.values(dimensionCategories).flat().find(d => d.name === dimension);
                          const isSorted = sortConfig.key === dimension;
                          return (
                            <th
                              key={dimension}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => handleSort(dimension)}
                            >
                              <div className="flex items-center space-x-1">
                                <span>{dimensionInfo?.label || dimension}</span>
                                <div className="flex flex-col">
                                  <ArrowUp
                                    className={`h-3 w-3 ${isSorted && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}`}
                                  />
                                  <ArrowDown
                                    className={`h-3 w-3 -mt-1 ${isSorted && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-400'}`}
                                  />
                                </div>
                              </div>
                            </th>
                          );
                        })}
                        {selectedMetrics.map((metric) => {
                          const metricInfo = Object.values(metricCategories).flat().find(m => m.name === metric);
                          const isSorted = sortConfig.key === metric;
                          return (
                            <th
                              key={metric}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => handleSort(metric)}
                            >
                              <div className="flex items-center space-x-1">
                                <span>{metricInfo?.label || metric}</span>
                                <div className="flex flex-col">
                                  <ArrowUp
                                    className={`h-3 w-3 ${isSorted && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}`}
                                  />
                                  <ArrowDown
                                    className={`h-3 w-3 -mt-1 ${isSorted && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-400'}`}
                                  />
                                </div>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortData(chartData).slice(0, 50).map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {selectedDimensions.map((dimension) => (
                            <td key={dimension} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatTableData(dimension, row[dimension])}
                            </td>
                          ))}
                          {selectedMetrics.map((metric) => (
                            <td key={metric} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {typeof row[metric] === 'number' ? row[metric].toLocaleString('es-ES') : row[metric]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    Mostrando los primeros 50 registros de {chartData.length} total
                  </p>
                  {sortConfig.key && (
                    <button
                      onClick={() => setSortConfig({ key: null, direction: 'asc' })}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Limpiar ordenamiento
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay datos para mostrar
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Selecciona métricas y dimensiones para ver los datos de Analytics.
          </p>
        </div>
      )}
      </div>
    </ErrorBoundary>
  );
};

export default Analytics;
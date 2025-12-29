import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  HelpCircle,
  Target,
  TrendingUp,
  Users,
  Zap,
  Brain,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Lightbulb,
  ArrowRight,
  Play,
  FileText,
  Settings
} from 'lucide-react';

const Help = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('metodologia');

  const sections = [
    {
      id: 'metodologia',
      title: 'Metodología',
      icon: Target,
      color: 'blue'
    },
    {
      id: 'uso',
      title: 'Cómo usar la App',
      icon: Play,
      color: 'green'
    },
    {
      id: 'metricas',
      title: 'Métricas y Criterios',
      icon: BarChart3,
      color: 'purple'
    },
    {
      id: 'interpretacion',
      title: 'Interpretación de Resultados',
      icon: Brain,
      color: 'orange'
    }
  ];

  const metodologiaContent = {
    title: 'Metodología de Análisis TV-Web',
    icon: Target,
    color: 'blue',
    content: (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">🎯 Objetivo Principal</h4>
          <p className="text-blue-800 text-sm">
            Medir y analizar el impacto directo de los spots de TV en el tráfico del sitio web, 
            estableciendo correlaciones temporales entre la transmisión televisiva y la respuesta digital.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            Proceso de Análisis
          </h4>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-blue-600">1</span>
              </div>
              <div>
                <h5 className="font-medium text-gray-900">Recolección de Datos</h5>
                <p className="text-sm text-gray-600">
                  Se obtienen métricas de Google Analytics durante el spot y en períodos de referencia 
                  (día anterior y semana anterior a la misma hora).
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-blue-600">2</span>
              </div>
              <div>
                <h5 className="font-medium text-gray-900">Cálculo de Impacto</h5>
                <p className="text-sm text-gray-600">
                  Se compara el tráfico durante el spot con el promedio de referencia para 
                  determinar el incremento porcentual y absoluto.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-blue-600">3</span>
              </div>
              <div>
                <h5 className="font-medium text-gray-900">Análisis de Correlación</h5>
                <p className="text-sm text-gray-600">
                  Se evalúa la significancia estadística y se determina si existe 
                  vinculación directa entre el spot y el aumento de tráfico.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-blue-600">4</span>
              </div>
              <div>
                <h5 className="font-medium text-gray-900">Generación de Insights</h5>
                <p className="text-sm text-gray-600">
                  La IA analiza los patrones y genera insights personalizados y 
                  recomendaciones para optimizar futuras campañas.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <Info className="h-5 w-5 text-blue-500 mr-2" />
            Ventajas del Método
          </h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Temporalidad precisa:</strong> Análisis minuto a minuto</li>
            <li>• <strong>Referencia robusta:</strong> Comparación con múltiples períodos</li>
            <li>• <strong>Correlación directa:</strong> Criterios estrictos para vinculación</li>
            <li>• <strong>Análisis inteligente:</strong> IA para insights automáticos</li>
          </ul>
        </div>
      </div>
    )
  };

  const usoContent = {
    title: 'Cómo usar la Aplicación',
    icon: Play,
    color: 'green',
    content: (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">🚀 Inicio Rápido</h4>
          <p className="text-green-800 text-sm">
            Sigue estos pasos para comenzar a analizar el impacto de tus spots de TV en el tráfico web.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Settings className="h-5 w-5 text-green-500 mr-2" />
            Paso 1: Configuración Inicial
          </h4>
          <div className="space-y-3">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h5 className="font-medium text-gray-900 mb-1">Conectar Google Analytics</h5>
              <p className="text-sm text-gray-600 mb-2">
                Ve a <strong>Cuentas</strong> y conecta tu cuenta de Google Analytics para acceder a los datos de tráfico.
              </p>
              <div className="flex items-center text-xs text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Requiere permisos de lectura en GA4
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h5 className="font-medium text-gray-900 mb-1">Seleccionar Propiedad</h5>
              <p className="text-sm text-gray-600">
                Elige la propiedad web que deseas analizar desde el menú de propiedades disponibles.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <FileText className="h-5 w-5 text-green-500 mr-2" />
            Paso 2: Preparar Datos de Spots
          </h4>
          <div className="space-y-3">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h5 className="font-medium text-gray-900 mb-1">Formato del Archivo</h5>
              <p className="text-sm text-gray-600 mb-2">
                Sube un archivo Excel (.xlsx) o CSV con las siguientes columnas:
              </p>
              <div className="bg-gray-50 rounded p-2 text-xs font-mono">
                fecha, hora inicio, canal, título programa, tipo comercial, versión, duración, inversión
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h5 className="font-medium text-gray-900 mb-1">Ejemplo de Datos</h5>
              <div className="bg-gray-50 rounded p-2 text-xs font-mono">
                15/12/2024, 20:30, Canal 13, Noticias Central, Informativo, 1, 30, 150000
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <BarChart3 className="h-5 w-5 text-green-500 mr-2" />
            Paso 3: Ejecutar Análisis
          </h4>
          <div className="space-y-3">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h5 className="font-medium text-gray-900 mb-1">Análisis Automático</h5>
              <p className="text-sm text-gray-600">
                Haz clic en <strong>"Analizar Impacto de Spots"</strong> y espera a que el sistema procese cada spot.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h5 className="font-medium text-gray-900 mb-1">Tiempo de Procesamiento</h5>
              <p className="text-sm text-gray-600">
                Aproximadamente 30-60 segundos por spot, dependiendo del número de spots y la conectividad.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2" />
            Consejos Importantes
          </h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Asegúrate de que los datos de fecha y hora sean precisos</li>
            <li>• Verifica que Google Analytics esté configurado correctamente</li>
            <li>• Los spots deben tener al menos 24 horas de antigüedad para análisis preciso</li>
            <li>• Considera factores externos (eventos, competencia) al interpretar resultados</li>
          </ul>
        </div>
      </div>
    )
  };

  const metricasContent = {
    title: 'Métricas y Criterios de Evaluación',
    icon: BarChart3,
    color: 'purple',
    content: (
      <div className="space-y-6">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-2">📊 Métricas Principales</h4>
          <p className="text-purple-800 text-sm">
            La aplicación analiza tres métricas clave de Google Analytics para medir el impacto de los spots.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Users className="h-5 w-5 text-blue-500 mr-2" />
              <h5 className="font-semibold text-gray-900">Usuarios Activos</h5>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Número de usuarios únicos que están activos en el sitio durante el spot.
            </p>
            <div className="text-xs text-gray-500">
              <strong>Primaria:</strong> Métrica principal para vinculación directa
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Zap className="h-5 w-5 text-green-500 mr-2" />
              <h5 className="font-semibold text-gray-900">Sesiones</h5>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Número total de sesiones iniciadas durante la transmisión del spot.
            </p>
            <div className="text-xs text-gray-500">
              <strong>Secundaria:</strong> Indica engagement y interés
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <BarChart3 className="h-5 w-5 text-purple-500 mr-2" />
              <h5 className="font-semibold text-gray-900">Vistas de Página</h5>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Total de páginas vistas durante el período del spot.
            </p>
            <div className="text-xs text-gray-500">
              <strong>Terciaria:</strong> Mide profundidad de navegación
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Target className="h-5 w-5 text-purple-500 mr-2" />
            Criterios de Evaluación
          </h4>
          
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-semibold text-green-900 mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Vinculación Directa (Criterio Estricto)
              </h5>
              <p className="text-sm text-green-800 mb-2">
                Un spot logra <strong>vinculación directa</strong> cuando cumple AMBOS criterios:
              </p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• <strong>Aumento {'>'} 15%</strong> en usuarios activos</li>
                <li>• <strong>Valor durante spot {'>'} 115%</strong> del valor de referencia promedio</li>
              </ul>
              <div className="mt-2 text-xs text-green-600 bg-green-100 rounded p-2">
                <strong>Fórmula:</strong> percentageChange {'>'} 15% AND spotValue {'>'} avgReference × 1.15
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h5 className="font-semibold text-orange-900 mb-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Impacto Significativo (Criterio Amplio)
              </h5>
              <p className="text-sm text-orange-800 mb-2">
                Un spot tiene <strong>impacto significativo</strong> cuando:
              </p>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• <strong>Cambio {'>'} 10%</strong> pero que NO cumple vinculación directa</li>
                <li>• Indica efecto notable pero potencialmente influenciado por otros factores</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Sin Impacto Significativo
              </h5>
              <p className="text-sm text-gray-700 mb-2">
                Cambios menores al 10% se consideran dentro de la variabilidad normal del tráfico.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Clock className="h-5 w-5 text-purple-500 mr-2" />
            Períodos de Referencia
          </h4>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-3">
              La <strong>referencia promedio</strong> se calcula como:
            </p>
            <div className="bg-gray-50 rounded p-3 text-sm font-mono">
              avgReference = (prevDayValue + prevWeekValue) / 2
            </div>
            <ul className="text-sm text-gray-600 mt-3 space-y-1">
              <li>• <strong>Día Anterior:</strong> Misma hora del día previo</li>
              <li>• <strong>Semana Anterior:</strong> Misma hora de la semana previa</li>
              <li>• <strong>Promedio:</strong> Mitiga variaciones diarias y semanales</li>
            </ul>
          </div>
        </div>
      </div>
    )
  };

  const interpretacionContent = {
    title: 'Interpretación de Resultados',
    icon: Brain,
    color: 'orange',
    content: (
      <div className="space-y-6">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-900 mb-2">🧠 Análisis Inteligente</h4>
          <p className="text-orange-800 text-sm">
            La aplicación utiliza IA para generar insights personalizados y recomendaciones basadas en los datos reales.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            Qué Significan los Resultados
          </h4>
          
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-semibold text-green-900 mb-2">✅ Vinculación Directa</h5>
              <p className="text-sm text-green-800 mb-2">
                <strong>Interpretación:</strong> Correlación fuerte y confiable entre el spot TV y el aumento de tráfico web.
              </p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• El spot generó un aumento medible e inmediato</li>
                <li>• La audiencia respondió directamente al llamado televisivo</li>
                <li>• Timing y contenido fueron efectivos</li>
              </ul>
              <div className="mt-2 text-xs text-green-600 bg-green-100 rounded p-2">
                <strong>Acción recomendada:</strong> Replicar elementos exitosos en futuras campañas
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h5 className="font-semibold text-orange-900 mb-2">⚠️ Impacto Significativo</h5>
              <p className="text-sm text-orange-800 mb-2">
                <strong>Interpretación:</strong> Efecto notable pero que podría deberse a otros factores además del spot.
              </p>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• El spot tuvo efecto pero no cumple criterios estrictos</li>
                <li>• Puede haber influencia de factores externos</li>
                <li>• Requiere análisis adicional para confirmar causalidad</li>
              </ul>
              <div className="mt-2 text-xs text-orange-600 bg-orange-100 rounded p-2">
                <strong>Acción recomendada:</strong> Optimizar contenido y timing, considerar factores externos
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-2">📊 Impacto Moderado</h5>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Interpretación:</strong> Cambios dentro de la variabilidad normal del tráfico web.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• El spot no generó un impacto medible significativo</li>
                <li>• Puede requerir optimización de contenido o timing</li>
                <li>• Considerar revisar la propuesta de valor del spot</li>
              </ul>
              <div className="mt-2 text-xs text-gray-600 bg-gray-100 rounded p-2">
                <strong>Acción recomendada:</strong> Rediseñar spot, cambiar horario, mejorar call-to-action
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Lightbulb className="h-5 w-5 text-orange-500 mr-2" />
            Insights de IA
          </h4>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">🤖 Análisis Automático</h5>
            <p className="text-sm text-gray-600 mb-3">
              La IA genera tres tipos de análisis para cada spot:
            </p>
            
            <div className="space-y-3">
              <div className="border-l-4 border-blue-400 pl-3">
                <h6 className="font-medium text-blue-900">Insights Clave</h6>
                <p className="text-sm text-blue-700">
                  Observaciones específicas sobre el rendimiento del spot basadas en datos reales.
                </p>
              </div>
              
              <div className="border-l-4 border-green-400 pl-3">
                <h6 className="font-medium text-green-900">Recomendaciones</h6>
                <p className="text-sm text-green-700">
                  Sugerencias accionables para mejorar futuros spots y campañas.
                </p>
              </div>
              
              <div className="border-l-4 border-purple-400 pl-3">
                <h6 className="font-medium text-purple-900">Resumen Ejecutivo</h6>
                <p className="text-sm text-purple-700">
                  Evaluación concisa del impacto y efectividad del spot.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
            Consideraciones Importantes
          </h4>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h5 className="font-semibold text-yellow-900 mb-2">⚡ Factores Externos</h5>
            <p className="text-sm text-yellow-800 mb-2">
              Al interpretar resultados, considera estos factores que pueden influir:
            </p>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• <strong>Eventos especiales:</strong> Noticias importantes, deportes, entretenimiento</li>
              <li>• <strong>Competencia:</strong> Spots de competidores en el mismo horario</li>
              <li>• <strong>Estacionalidad:</strong> Patrones normales por fecha u hora</li>
              <li>• <strong>Promociones:</strong> Ofertas o descuentos simultáneos</li>
              <li>• <strong>Condiciones climáticas:</strong> Que afecten hábitos de consumo</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">📈 Mejores Prácticas</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Análisis continuo:</strong> Monitorea múltiples spots para identificar patrones</li>
            <li>• <strong>Segmentación:</strong> Analiza por tipo de programa, horario, canal</li>
            <li>• <strong>Optimización iterativa:</strong> Aplica learnings de spots exitosos</li>
            <li>• <strong>Validación cruzada:</strong> Compara con otras métricas de negocio</li>
          </ul>
        </div>
      </div>
    )
  };

  const getContent = () => {
    switch (activeSection) {
      case 'metodologia':
        return metodologiaContent;
      case 'uso':
        return usoContent;
      case 'metricas':
        return metricasContent;
      case 'interpretacion':
        return interpretacionContent;
      default:
        return metodologiaContent;
    }
  };

  const currentContent = getContent();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
          
          <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-xl">
            <div className="flex h-full">
              {/* Sidebar de navegación */}
              <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                      <HelpCircle className="h-6 w-6 text-blue-600 mr-2" />
                      Centro de Ayuda
                    </h2>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                  
                  <nav className="space-y-2">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                            activeSection === section.id
                              ? `bg-${section.color}-100 text-${section.color}-900 border border-${section.color}-200`
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className={`h-5 w-5 mr-3 ${
                            activeSection === section.id ? `text-${section.color}-600` : 'text-gray-400'
                          }`} />
                          <span className="font-medium">{section.title}</span>
                          {activeSection === section.id && (
                            <ArrowRight className={`h-4 w-4 ml-auto text-${section.color}-600`} />
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>
              
              {/* Contenido principal */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center mb-6">
                      <currentContent.icon className={`h-8 w-8 text-${currentContent.color}-600 mr-3`} />
                      <h1 className="text-2xl font-bold text-gray-900">
                        {currentContent.title}
                      </h1>
                    </div>
                    
                    <div className="prose prose-blue max-w-none">
                      {currentContent.content}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Help;
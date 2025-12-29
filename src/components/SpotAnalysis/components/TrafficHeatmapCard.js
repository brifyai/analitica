import React from 'react';

const TrafficHeatmapCard = ({ data: propData }) => {
  // Días de la semana y horas del día
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  
  // Función para obtener el color según el nivel de tráfico
  const getTrafficColor = (value) => {
    if (value === 0) return 'bg-gray-100';
    if (value <= 30) return 'bg-green-200';
    if (value <= 60) return 'bg-yellow-300';
    return 'bg-red-400';
  };

  // Función para obtener el texto del nivel
  const getTrafficLevel = (value) => {
    if (value === 0) return 'Sin datos';
    if (value <= 30) return 'Bajo';
    if (value <= 60) return 'Medio';
    return 'Alto';
  };

  // Si no hay datos, mostrar mensaje de carga
  if (!propData || !propData.labels || !propData.datasets) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Patrones de tráfico por día y hora</h2>
        <p className="text-gray-600 mb-6">Mapa de Calor de Tráfico</p>
        
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500">Cargando datos de tráfico...</p>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>Los datos de tráfico aparecerán aquí después del análisis</p>
        </div>
      </div>
    );
  }

  // Generar datos del mapa de calor basados únicamente en datos reales
  const generateHeatmapData = () => {
    const heatmapData = [];
    
    // Solo usar datos reales del análisis temporal
    if (propData.impactAnalysis && propData.spotsData) {
      const temporalData = propData.impactAnalysis;
      const spotsData = propData.spotsData;
      
      // Calcular datos reales basados en los spots y análisis temporal
      days.forEach((day, dayIndex) => {
        hours.forEach((hour, hourIndex) => {
          let trafficValue = 0;
          
          // Contar spots reales transmitidos en este día y hora
          const spotsInThisSlot = spotsData.filter(spot => {
            if (!spot.fecha || !spot.hora) return false;
            
            const spotDate = new Date(spot.fecha);
            const spotHour = parseInt(spot.hora.split(':')[0]);
            const spotDayOfWeek = spotDate.getDay(); // 0 = Domingo, 1 = Lunes, etc.
            
            // Convertir día de la semana (0=Dom a 6=Sáb) a índice (0=Lun a 6=Dom)
            const dayIndexConverted = spotDayOfWeek === 0 ? 6 : spotDayOfWeek - 1;
            
            return dayIndexConverted === dayIndex &&
                   Math.abs(spotHour - (hourIndex * 2)) <= 1; // ±1 hora de tolerancia
          });
          
          // Calcular impacto real basado en spots y análisis temporal
          if (spotsInThisSlot.length > 0) {
            // Usar datos reales del análisis temporal
            const baseImpact = temporalData.immediate?.comparison?.activeUsers?.percentageChange || 0;
            const shortTermImpact = temporalData.shortTerm?.comparison?.activeUsers?.percentageChange || 0;
            const mediumTermImpact = temporalData.mediumTerm?.comparison?.activeUsers?.percentageChange || 0;
            const longTermImpact = temporalData.longTerm?.comparison?.activeUsers?.percentageChange || 0;
            
            // Promedio real de los impactos temporales
            const avgImpact = (baseImpact + shortTermImpact + mediumTermImpact + longTermImpact) / 4;
            
            // Ajustar por número de spots reales en este slot
            trafficValue = Math.max(0, Math.min(100,
              Math.abs(avgImpact) * spotsInThisSlot.length * 10
            ));
          }
          
          heatmapData.push({
            day: dayIndex,
            hour: hourIndex,
            value: Math.round(trafficValue),
            level: getTrafficLevel(trafficValue),
            spotsCount: spotsInThisSlot.length
          });
        });
      });
    } else {
      // Si no hay datos reales, mostrar matriz vacía
      days.forEach((day, dayIndex) => {
        hours.forEach((hour, hourIndex) => {
          heatmapData.push({
            day: dayIndex,
            hour: hourIndex,
            value: 0,
            level: 'Sin datos',
            spotsCount: 0
          });
        });
      });
    }
    
    return heatmapData;
  };

  const heatmapData = generateHeatmapData();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Patrones de tráfico por día y hora</h2>
      <p className="text-gray-600 mb-6">Mapa de Calor de Tráfico</p>
      
      {/* Leyenda */}
      <div className="mb-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">Nivel:</span>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-200 rounded"></div>
            <span className="text-gray-700">Bajo</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-300 rounded"></div>
            <span className="text-gray-700">Medio</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-400 rounded"></div>
            <span className="text-gray-700">Alto</span>
          </div>
        </div>
      </div>
      
      {/* Mapa de calor */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header con horas */}
          <div className="grid grid-cols-13 gap-1 mb-2">
            <div className="text-xs font-medium text-gray-600 text-center"></div>
            {hours.map((hour, index) => (
              <div key={index} className="text-xs font-medium text-gray-600 text-center">
                {hour}
              </div>
            ))}
          </div>
          
          {/* Filas con días y datos */}
          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="grid grid-cols-13 gap-1 mb-1">
              <div className="text-xs font-medium text-gray-700 text-right pr-2 flex items-center justify-end">
                {day}
              </div>
              {hours.map((hour, hourIndex) => {
                const dataPoint = heatmapData.find(d => d.day === dayIndex && d.hour === hourIndex);
                return (
                  <div
                    key={hourIndex}
                    className={`h-8 rounded text-xs flex items-center justify-center text-white font-medium ${getTrafficColor(dataPoint?.value || 0)}`}
                    title={`${day} ${hour}: ${dataPoint?.level || 'Sin datos'} (${dataPoint?.value || 0}%)`}
                  >
                    {dataPoint?.value > 0 ? `${dataPoint.value}%` : ''}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>📊 Los datos se actualizan automáticamente según el análisis</p>
      </div>
    </div>
  );
};

export default TrafficHeatmapCard;
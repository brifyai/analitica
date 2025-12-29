import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Clock } from 'lucide-react';

const TrafficChart4 = ({ data }) => {
  // Si no hay datos, mostrar mensaje
  if (!data || !data.hourlyTraffic) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Tráfico Nocturno</h3>
            <p className="text-sm text-gray-600">Actividad durante horarios nocturnos</p>
          </div>
          <div className="p-3 bg-orange-100 rounded-full">
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <p className="text-lg font-medium">No hay datos disponibles</p>
            <p className="text-sm">Los datos de tráfico aparecerán aquí después del análisis</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const trafficData = data.hourlyTraffic;
  const maxTraffic = Math.max(...trafficData.map(d => d.traffic));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Tráfico Nocturno</h3>
          <p className="text-sm text-gray-600">Actividad durante horarios nocturnos</p>
        </div>
        <div className="p-3 bg-orange-100 rounded-full">
          <Clock className="h-6 w-6 text-orange-600" />
        </div>
      </div>

      {/* Gráfico de barras - Ocupando todo el ancho */}
      <div className="w-full mb-6">
        <div className="flex items-end justify-between h-40 w-full px-2">
          {trafficData.slice(0, 12).map((data, index) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${(data.traffic / maxTraffic) * 100}%` }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              className={`flex-1 mx-0.5 rounded-t-lg ${
                data.isSpotTime ? 'bg-orange-500' : 'bg-amber-500'
              } relative group`}
              style={{ minHeight: '4px' }}
            >
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {data.hour}: {data.traffic} visitas
                {data.isSpotTime && <span className="block text-orange-300">⭐ Spot TV</span>}
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Etiquetas de horas */}
        <div className="flex justify-between px-2 mt-2">
          {trafficData.slice(0, 12).map((data, index) => (
            <div key={index} className="text-xs text-gray-500 text-center flex-1">
              {data.hour.split(':')[0]}
            </div>
          ))}
        </div>
      </div>

      {/* Estadísticas */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <p className="text-sm text-orange-600 mb-1">Hora Nocturna Pico</p>
          <p className="text-lg font-bold text-orange-700">
            {(() => {
              const nightHours = trafficData.filter(d => {
                const hour = parseInt(d.hour.split(':')[0]);
                return hour >= 18 || hour <= 6;
              });
              const peakHour = nightHours.reduce((max, current) =>
                current.traffic > max.traffic ? current : max
              );
              return peakHour.hour;
            })()}
          </p>
        </div>
        <div className="text-center p-3 bg-amber-50 rounded-lg">
          <p className="text-sm text-amber-600 mb-1">Promedio Nocturno</p>
          <p className="text-lg font-bold text-amber-700">
            {(() => {
              const nightHours = trafficData.filter(d => {
                const hour = parseInt(d.hour.split(':')[0]);
                return hour >= 18 || hour <= 6;
              });
              return Math.round(nightHours.reduce((sum, d) => sum + d.traffic, 0) / nightHours.length);
            })()}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TrafficChart4;
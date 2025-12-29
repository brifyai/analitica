import React from 'react';
import { AlertTriangle, Shield, Info } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * COMPONENTE DE ADVERTENCIA DE INTEGRIDAD DE DATOS
 * Muestra claramente al usuario cuando los datos no están disponibles o son inválidos
 */

const DataIntegrityWarning = ({ 
  type = 'no_data', // 'no_data' | 'simulated' | 'invalid' | 'partial'
  message = '',
  details = '',
  showIcon = true,
  className = '',
  onDismiss = null
}) => {
  const getWarningConfig = () => {
    switch (type) {
      case 'no_data':
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          title: 'Datos No Disponibles',
          defaultMessage: 'Los datos de análisis no están disponibles en este momento.',
          severity: 'info'
        };
      
      case 'simulated':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          title: 'Datos Anómalos Detectados',
          defaultMessage: 'Se han detectado datos anómalos. Estos datos no reflejan información real.',
          severity: 'warning'
        };
      
      case 'invalid':
        return {
          icon: Shield,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          title: 'Datos Inválidos',
          defaultMessage: 'Los datos contienen información inválida o corrupta.',
          severity: 'error'
        };
      
      case 'partial':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-800',
          iconColor: 'text-orange-600',
          title: 'Datos Parciales',
          defaultMessage: 'Solo se muestran datos parciales. Algunos análisis pueden estar incompletos.',
          severity: 'warning'
        };
      
      default:
        return {
          icon: Info,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600',
          title: 'Información',
          defaultMessage: 'Información sobre el estado de los datos.',
          severity: 'info'
        };
    }
  };

  const config = getWarningConfig();
  const IconComponent = config.icon;
  const displayMessage = message || config.defaultMessage;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        ${config.bgColor} 
        ${config.borderColor} 
        border 
        rounded-lg 
        p-4 
        ${className}
      `}
    >
      <div className="flex items-start space-x-3">
        {showIcon && (
          <div className={`${config.iconColor} mt-0.5`}>
            <IconComponent className="h-5 w-5" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium ${config.textColor} mb-1`}>
            {config.title}
          </h4>
          <p className={`text-sm ${config.textColor} opacity-90`}>
            {displayMessage}
          </p>
          
          {details && (
            <div className={`mt-2 text-xs ${config.textColor} opacity-75`}>
              <details className="cursor-pointer">
                <summary className="hover:opacity-100 transition-opacity">
                  Ver detalles técnicos
                </summary>
                <div className="mt-1 p-2 bg-white bg-opacity-50 rounded border">
                  {details}
                </div>
              </details>
            </div>
          )}
          
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                config.severity === 'error' ? 'bg-red-500' :
                config.severity === 'warning' ? 'bg-yellow-500' :
                'bg-blue-500'
              }`} />
              <span className={`text-xs ${config.textColor} opacity-75`}>
                Estado: {config.severity.toUpperCase()}
              </span>
            </div>
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className={`text-xs ${config.textColor} opacity-75 hover:opacity-100 transition-opacity`}
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * COMPONENTE PARA MOSTRAR DATOS NO DISPONIBLES
 */
export const NoDataAvailable = ({ 
  title = "Análisis No Disponible",
  description = "Los datos de análisis no están disponibles en este momento.",
  action = null,
  className = ""
}) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Info className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 max-w-sm mx-auto">{description}</p>
      {action && action}
    </div>
  );
};

/**
 * COMPONENTE PARA MOSTRAR DATOS ANÓMALOS
 */
export const InvalidDataWarning = ({
  onAccept = null,
  onCancel = null,
  className = ""
}) => {
  return (
    <DataIntegrityWarning
      type="invalid"
      message="Los datos mostrados contienen información anómala o inválida."
      details="Estos datos no reflejan información real de Google Analytics ni análisis de video reales."
      className={className}
    />
  );
};

/**
 * COMPONENTE PARA MOSTRAR DATOS PARCIALES
 */
export const PartialDataWarning = ({ 
  missingComponents = [],
  className = ""
}) => {
  const details = missingComponents.length > 0 ? (
    <div>
      <p className="mb-2">Componentes faltantes:</p>
      <ul className="list-disc list-inside space-y-1">
        {missingComponents.map((component, index) => (
          <li key={index} className="text-xs">{component}</li>
        ))}
      </ul>
    </div>
  ) : null;

  return (
    <DataIntegrityWarning
      type="partial"
      message="Solo se muestran datos parciales debido a limitaciones de acceso a fuentes de datos."
      details={details}
      className={className}
    />
  );
};

export default DataIntegrityWarning;
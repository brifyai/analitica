import React from 'react';
import { AlertCircle, RefreshCw, Settings, ExternalLink } from 'lucide-react';

const AnalyticsErrorDisplay = ({ 
  error, 
  errorType, 
  onRetry, 
  onReconnect, 
  onSettings,
  isLoading = false 
}) => {
  const getErrorConfig = (error, errorType) => {
    // Error específico de permisos de Google Analytics
    if (error?.includes('permisos') || error?.includes('403') || errorType === 'permissions') {
      return {
        title: 'Error de Permisos de Google Analytics',
        description: 'No tienes acceso a las cuentas de Google Analytics. Esto puede ocurrir por varias razones:',
        solutions: [
          'La aplicación no tiene los permisos necesarios en Google Cloud Console',
          'El usuario no tiene acceso a las cuentas de Google Analytics',
          'Los scopes de OAuth no están configurados correctamente',
          'El token de acceso ha expirado o es inválido'
        ],
        actions: [
          { label: 'Volver a Conectar', onClick: onReconnect, primary: true },
          { label: 'Reintentar', onClick: onRetry, primary: false },
          { label: 'Configuración', onClick: onSettings, primary: false }
        ],
        type: 'permissions'
      };
    }

    // Error de conexión al backend
    if (error?.includes('conexión') || error?.includes('servidor backend') || errorType === 'connection') {
      return {
        title: 'Error de Conexión',
        description: 'No se puede conectar con el servidor backend. Verifica que el servidor esté corriendo.',
        solutions: [
          'El servidor proxy de Google Analytics no está corriendo en el puerto 3001',
          'Hay problemas de red o firewall bloqueando la conexión',
          'El servidor está temporalmente fuera de servicio'
        ],
        actions: [
          { label: 'Reintentar', onClick: onRetry, primary: true },
          { label: 'Verificar Servidor', onClick: () => window.open(`${window.location.protocol}//${window.location.hostname}:3001/api/health`, '_blank'), primary: false }
        ],
        type: 'connection'
      };
    }

    // Error de sesión expirada
    if (errorType === 'session_expired' || error?.includes('expirado')) {
      return {
        title: 'Sesión Expirada',
        description: 'Tu sesión de Google Analytics ha expirado. Por favor, vuelve a conectar tu cuenta.',
        solutions: [
          'El token de acceso de Google ha expirado',
          'El refresh token ya no es válido',
          'Se requiere autorización nuevamente'
        ],
        actions: [
          { label: 'Volver a Conectar', onClick: onReconnect, primary: true },
          { label: 'Reintentar', onClick: onRetry, primary: false }
        ],
        type: 'session'
      };
    }

    // Error genérico
    return {
      title: 'Error de Google Analytics',
      description: 'Ha ocurrido un error al intentar acceder a Google Analytics.',
      solutions: [
        'Verifica tu conexión a internet',
        'Intenta recargar la página',
        'Revisa la configuración de tu cuenta de Google Analytics'
      ],
      actions: [
        { label: 'Reintentar', onClick: onRetry, primary: true },
        { label: 'Volver a Conectar', onClick: onReconnect, primary: false }
      ],
      type: 'generic'
    };
  };

  const config = getErrorConfig(error, errorType);

  const getTypeStyles = (type) => {
    switch (type) {
      case 'permissions':
        return 'border-red-200 bg-red-50';
      case 'connection':
        return 'border-orange-200 bg-orange-50';
      case 'session':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getIconStyles = (type) => {
    switch (type) {
      case 'permissions':
        return 'text-red-500';
      case 'connection':
        return 'text-orange-500';
      case 'session':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`rounded-lg border p-6 ${getTypeStyles(config.type)}`}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${getIconStyles(config.type)}`}>
          <AlertCircle className="h-6 w-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {config.title}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            {config.description}
          </p>

          {/* Soluciones sugeridas */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Posibles soluciones:
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {config.solutions.map((solution, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>{solution}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Acciones disponibles */}
          <div className="flex flex-wrap gap-2">
            {config.actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={isLoading}
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  action.primary
                    ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50'
                }`}
              >
                {isLoading && action.onClick === onRetry ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : action.label === 'Verificar Servidor' ? (
                  <ExternalLink className="h-4 w-4 mr-2" />
                ) : action.label === 'Configuración' ? (
                  <Settings className="h-4 w-4 mr-2" />
                ) : null}
                {action.label}
              </button>
            ))}
          </div>

          {/* Información técnica para depuración */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-4">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                Información técnica (desarrollo)
              </summary>
              <pre className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border overflow-auto">
                {JSON.stringify({ error, errorType }, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsErrorDisplay;
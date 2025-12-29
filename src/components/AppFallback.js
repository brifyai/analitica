import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

const AppFallback = ({ error, resetError }) => {
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 text-center mb-2">
          La aplicación no se pudo cargar
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Ha ocurrido un error crítico y la aplicación no puede continuar. Por favor, intenta recargar la página.
        </p>
        
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-4 p-3 bg-gray-100 rounded text-sm">
            <summary className="cursor-pointer font-medium text-gray-700 mb-2">
              Detalles del error (solo desarrollo)
            </summary>
            <pre className="whitespace-pre-wrap text-red-600 text-xs overflow-auto max-h-40">
              {error.toString()}
            </pre>
            {error.stack && (
              <pre className="whitespace-pre-wrap text-gray-600 text-xs overflow-auto max-h-40 mt-2">
                {error.stack}
              </pre>
            )}
          </details>
        )}
        
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleReload}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Recargar página
          </button>
          <button
            onClick={handleGoHome}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <Home className="h-4 w-4 mr-2" />
            Ir al inicio
          </button>
          {resetError && (
            <button
              onClick={resetError}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Reintentar cargar aplicación
            </button>
          )}
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Si el problema persiste, contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppFallback;
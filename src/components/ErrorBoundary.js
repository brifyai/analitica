import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Generar un ID único para este error
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return { 
      hasError: true,
      errorId
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // En modo desarrollo, mostrar más detalles
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 ErrorBoundary - Detalles del error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // Opcional: Enviar error a servicio de monitoreo
    // this.logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
    
    // Recargar la página para limpiar el estado
    if (this.props.reloadOnRetry) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 text-center mb-2">
              Error inesperado
            </h1>
            
            <p className="text-gray-600 text-center mb-4">
              Ha ocurrido un error inesperado al cargar esta página.
            </p>
            
            {this.state.errorId && (
              <p className="text-xs text-gray-500 text-center mb-4">
                ID del error: {this.state.errorId}
              </p>
            )}
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 p-3 bg-gray-100 rounded text-sm">
                <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                  Detalles del error (solo desarrollo)
                </summary>
                <div className="space-y-2">
                  <div>
                    <strong>Error:</strong>
                    <pre className="whitespace-pre-wrap text-red-600 text-xs overflow-auto max-h-40 mt-1">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  
                  {this.state.errorInfo && (
                    <div>
                      <strong>Stack Trace:</strong>
                      <pre className="whitespace-pre-wrap text-gray-600 text-xs overflow-auto max-h-40 mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
            
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {this.props.reloadOnRetry ? 'Recargar página' : 'Reintentar'}
              </button>
              
              <button
                onClick={() => window.location.href = '/accounts'}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a cuentas
              </button>
            </div>
            
            <div className="mt-4 text-xs text-gray-500 text-center">
              Si el problema persiste, contacta al soporte técnico.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
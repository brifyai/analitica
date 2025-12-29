import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ErrorMessage = ({ 
  error, 
  errorType, 
  onDismiss, 
  showDismiss = true,
  className = "" 
}) => {
  if (!error) return null;

  // Determinar el tipo de estilo según el error
  const getErrorStyles = () => {
    switch (errorType) {
      case 'session_expired':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          icon: 'text-orange-400',
          title: 'text-orange-800',
          message: 'text-orange-700',
          dismiss: 'bg-orange-100 hover:bg-orange-200 text-orange-800'
        };
      case 'connection':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-400',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          dismiss: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
        };
      default:
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-400',
          title: 'text-red-800',
          message: 'text-red-700',
          dismiss: 'bg-red-100 hover:bg-red-200 text-red-800'
        };
    }
  };

  const styles = getErrorStyles();

  return (
    <div className={`${styles.bg} ${styles.border} border rounded-md p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className={`h-5 w-5 ${styles.icon}`} />
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${styles.title}`}>
            {errorType === 'session_expired' ? 'Sesión Expirada' : 
             errorType === 'connection' ? 'Error de Conexión' : 'Error'}
          </h3>
          <div className={`mt-2 text-sm ${styles.message}`}>
            <p>{error}</p>
          </div>
        </div>
        {showDismiss && onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={onDismiss}
                className={`inline-flex rounded-md p-1.5 ${styles.dismiss} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${styles.bg.split('-')[1]}-50 focus:ring-${styles.icon.split('-')[1]}-500`}
              >
                <span className="sr-only">Descartar</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
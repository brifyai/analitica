import React from 'react';

const SimpleLoadingSpinner = ({ size = 'md', message = 'Cargando...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className={`animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}></div>
      <p className="mt-4 text-gray-600 text-sm">{message}</p>
    </div>
  );
};

export default SimpleLoadingSpinner;
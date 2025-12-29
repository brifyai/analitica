import React from 'react';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          ✅ Aplicación Funcionando
        </h1>
        <p className="text-gray-600 text-center">
          Esta es una versión simplificada para diagnosticar problemas.
        </p>
        <div className="mt-4 p-4 bg-green-100 rounded">
          <p className="text-green-800 text-sm">
            ✅ React está funcionando correctamente
          </p>
          <p className="text-green-800 text-sm">
            ✅ CSS está funcionando correctamente
          </p>
          <p className="text-green-800 text-sm">
            ✅ No hay errores de JavaScript críticos
          </p>
        </div>
        <div className="mt-4 p-4 bg-blue-100 rounded">
          <p className="text-blue-800 text-sm">
            🔍 Si ves este mensaje, el problema NO es de React ni de la configuración básica.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
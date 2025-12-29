import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleAnalytics } from '../../contexts/GoogleAnalyticsContext';
import LoadingSpinner from '../UI/LoadingSpinner';

const AnalyticsCallback = () => {
  const navigate = useNavigate();
  const { handleAnalyticsCallback } = useGoogleAnalytics();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Parsear los parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        if (error) {
          console.error('Error en callback de Google Analytics:', error);
          setError('Error en la conexión con Google Analytics: ' + error);
          setLoading(false);
          return;
        }

        if (!code) {
          setError('No se encontró código de autorización de Google Analytics');
          setLoading(false);
          return;
        }

        // Usar el contexto de Google Analytics para manejar el callback
        await handleAnalyticsCallback(code);
        
        // Redirigir al dashboard después de conexión exitosa
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('Error en callback de Analytics:', err);
        setError('Error conectando con Google Analytics: ' + err.message);
        setLoading(false);
      }
    };

    // Delay para asegurar que la página esté completamente cargada
    const timer = setTimeout(handleCallback, 100);
    return () => clearTimeout(timer);
  }, [navigate, handleAnalyticsCallback]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Conectando con Google Analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Error de Conexión</h3>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Volver al Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AnalyticsCallback;
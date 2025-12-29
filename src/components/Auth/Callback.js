import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase-new';
import { useGoogleAnalytics } from '../../contexts/GoogleAnalyticsContext';
import LoadingSpinner from '../UI/LoadingSpinner';

const Callback = () => {
  const navigate = useNavigate();
  const { handleAnalyticsCallback } = useGoogleAnalytics();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Parsear los parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        // CRITICAL: Detectar flujo de OAuth directo de Analytics usando sessionStorage
        const isAnalyticsFlow = sessionStorage.getItem('analytics_oauth_flow') === 'true';
        const originalUserEmail = sessionStorage.getItem('original_user_email');
        
        if (error) {
          console.error('Error en callback de autenticación:', error, errorDescription);
          setError(`Error en la autenticación: ${errorDescription || error}`);
          setLoading(false);
          return;
        }

        console.log('🔍 DEBUG Callback:');
        console.log('  - URL:', window.location.href);
        console.log('  - code:', code ? 'found' : 'not found');
        console.log('  - analytics param:', urlParams.get('analytics'));
        console.log('  - analytics flow:', isAnalyticsFlow);
        console.log('  - original user:', originalUserEmail);

        // CRITICAL: Si es callback de Google Analytics OAuth directo, preservar sesión original COMPLETAMENTE
        if (isAnalyticsFlow && code && originalUserEmail) {
          console.log('📊 CRITICAL: Procesando conexión de Google Analytics SIN modificar sesión principal...');
          try {
            // CRITICAL: Preservar la sesión actual ANTES de cualquier operación
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            
            if (!currentSession) {
              throw new Error('No hay sesión activa. Por favor, inicia sesión primero.');
            }
            
            console.log('🔒 CRITICAL: Sesión original preservada ANTES de procesar Analytics:', {
              id: currentSession.user.id,
              email: currentSession.user.email
            });
            
            // CRITICAL: Verificar que NO se use exchangeCodeForSession para Analytics
            // Esto evita que Supabase cree una nueva sesión con el usuario de Analytics
            console.log('🔒 CRITICAL: Evitando exchangeCodeForSession para preservar usuario original');
            
            // CRITICAL: Procesar Google Analytics usando exchangeCodeForTokens (NO exchangeCodeForSession)
            // Esto evita crear una nueva sesión de Supabase
            await handleAnalyticsCallback(code);
            console.log('✅ CRITICAL: Google Analytics conectado exitosamente SIN modificar sesión principal');
            
            // CRITICAL: Verificar que la sesión original se mantenga intacta DESPUÉS del procesamiento
            const { data: { session: verificationSession } } = await supabase.auth.getSession();
            
            if (verificationSession?.user?.email !== currentSession.user.email) {
              console.error('❌ CRITICAL: CAMBIO DE USUARIO DETECTADO DESPUÉS DE PROCESAR ANALYTICS');
              console.error('❌ Usuario esperado:', currentSession.user.email);
              console.error('❌ Usuario actual:', verificationSession?.user?.email);
              throw new Error(`Error crítico de seguridad: El usuario cambió de ${currentSession.user.email} a ${verificationSession?.user?.email}. Por favor, inicia sesión nuevamente.`);
            }
            
            console.log('✅ CRITICAL: Verificación exitosa - usuario original preservado:', verificationSession?.user?.email);
            
            // CRITICAL: Limpiar sessionStorage después del procesamiento exitoso
            sessionStorage.removeItem('original_user_id');
            sessionStorage.removeItem('original_user_email');
            sessionStorage.removeItem('analytics_oauth_flow');
            console.log('🧹 CRITICAL: SessionStorage limpiado exitosamente en Callback');
            
            // CRITICAL: Redirigir manteniendo la sesión original intacta
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 500);
            return;
          } catch (analyticsError) {
            console.error('❌ Error en handleAnalyticsCallback:', analyticsError);
            setError('Error conectando Google Analytics: ' + analyticsError.message);
            setLoading(false);
            return;
          }
        }

        // Flujo normal de autenticación (no Analytics)
        console.log('Procesando callback de autenticación normal...');
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error obteniendo sesión:', sessionError.message);
          setError('Error en la autenticación: ' + sessionError.message);
          setLoading(false);
          return;
        }

        if (data?.session) {
          console.log('✅ Sesión establecida:', data.session.user.email);
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 500);
        } else {
          console.log('⚠️getSession no encontró sesión, intentando exchangeCodeForSession...');
          if (code) {
            // CRITICAL: Solo usar exchangeCodeForSession si NO es callback de Analytics
            // Para Analytics ya se manejó arriba y debemos evitar crear nueva sesión
            const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);
            
            if (exchangeError) {
              console.error('Error intercambiando código por sesión:', exchangeError.message);
              setError('Error en la autenticación: ' + exchangeError.message);
              setLoading(false);
              return;
            }

            if (exchangeData?.session) {
              console.log('✅ Sesión establecida vía exchange:', exchangeData.session.user.email);
              setTimeout(() => {
                navigate('/dashboard', { replace: true });
              }, 500);
            } else {
              setError('No se pudo establecer la sesión');
              setLoading(false);
            }
          } else {
            setError('No se encontró código de autorización');
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('❌ Error inesperado en callback:', err);
        setError('Error inesperado durante la autenticación: ' + err.message);
        setLoading(false);
      }
    };

    // Delay para asegurar que la página esté completamente cargada
    const timer = setTimeout(handleAuthCallback, 100);
    return () => clearTimeout(timer);
  }, [navigate, handleAnalyticsCallback]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Completando autenticación...</p>
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
            <h3 className="mt-4 text-lg font-medium text-gray-900">Error de Autenticación</h3>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Volver al Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Callback;

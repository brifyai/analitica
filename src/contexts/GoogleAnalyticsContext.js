import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { googleAnalyticsService } from '../services/googleAnalyticsService';
import { supabase } from '../config/supabase-new';
import { getRedirectUri } from '../config/oauthConfig';

const GoogleAnalyticsContext = createContext();

export const useGoogleAnalytics = () => {
  const context = useContext(GoogleAnalyticsContext);
  if (!context) {
    throw new Error('useGoogleAnalytics must be used within a GoogleAnalyticsProvider');
  }
  return context;
};

export const GoogleAnalyticsProvider = ({ children }) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [properties, setProperties] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null); // Para diferenciar tipos de error
  
  // 🚨 NUEVO: Sistema de rate limiting para evitar bucles infinitos
  const [retryCount, setRetryCount] = useState(0);
  const [lastErrorTime, setLastErrorTime] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 30000; // 30 segundos

  // Check if user has Google Analytics connection
  useEffect(() => {
    if (user) {
      // Usar setTimeout para evitar bloqueos y agregar timeout
      const timeoutId = setTimeout(() => {
        checkGoogleConnection().catch(error => {
          console.warn('⚠️ Error en checkGoogleConnection (no bloquea UI):', error);
          // No establecer loading en false aquí para evitar conflictos
        });
      }, 100); // Pequeño delay para evitar conflictos
      
      return () => clearTimeout(timeoutId);
    }
  }, [user]);

  // Limpiar error cuando el componente se desmonta o el usuario cambia
  useEffect(() => {
    return () => {
      setError(null);
      setErrorType(null);
    };
  }, [user]);

  const checkGoogleConnection = async () => {
    try {
      // 🚨 RATE LIMITING: Verificar si hemos excedido el límite de reintentos
      const now = Date.now();
      if (now - lastErrorTime < RETRY_DELAY && retryCount >= MAX_RETRIES) {
        console.log('🚨 RATE LIMIT: Demasiados errores recientes, pausando intentos');
        setError('Demasiados errores de conexión. Por favor, intenta nuevamente en unos minutos.');
        setIsConnected(false);
        return;
      }

      setLoading(true);
      setError(null);

      // Check if user has Google provider token from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;

      if (session?.provider_token) {
        // User has Google provider token, check if it has GA4 access
        try {
          setIsConnected(true);
          await loadAccountsAndProperties(true); // Load accounts first, properties in background
          // ✅ ÉXITO: Resetear contadores de error
          setRetryCount(0);
          setLastErrorTime(0);
        } catch (gaError) {
          console.error('Error accessing GA4 with provider token:', gaError);
          // Token exists but doesn't have GA4 access
          setIsConnected(false);
          setError('El token de Google no tiene acceso a Google Analytics. Por favor, vuelve a conectar con los scopes correctos.');
          // 🚨 MANEJAR ERROR 403: Incrementar contador
          handleErrorIncrement(gaError);
        }
      } else {
        // Check legacy tokens in database for backward compatibility
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('google_access_token, google_refresh_token, google_token_expires_at')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (userProfile?.google_access_token) {
          // Check if token is still valid
          const tokenExpiry = new Date(userProfile.google_token_expires_at);
          const now = new Date();

          if (tokenExpiry > now) {
            setIsConnected(true);
            await loadAccountsAndProperties(true); // Load accounts first, properties in background
            // ✅ ÉXITO: Resetear contadores de error
            setRetryCount(0);
            setLastErrorTime(0);
          } else {
            // Try to refresh the token
            await refreshGoogleToken();
          }
        } else {
          // No tokens available, user needs to authenticate
          console.log('🔍 DEBUG: No Google tokens found, user needs to authenticate');
          setIsConnected(false);
          // setError('No hay conexión con Google Analytics. Por favor, conecta tu cuenta para ver los datos.'); // OCULTADO
          // ✅ NO HAY TOKEN: Resetear contadores (no es un error)
          setRetryCount(0);
          setLastErrorTime(0);
        }
      }
    } catch (err) {
      console.error('Error checking Google connection:', err);
      setError('Error verificando conexión con Google Analytics: ' + err.message);
      setIsConnected(false);
      // 🚨 MANEJAR ERROR: Incrementar contador
      handleErrorIncrement(err);
    } finally {
      setLoading(false);
    }
  };

  // 🚨 NUEVA FUNCIÓN: Manejar incremento de errores con rate limiting
  const handleErrorIncrement = (error) => {
    const now = Date.now();
    const newRetryCount = retryCount + 1;
    
    setRetryCount(newRetryCount);
    setLastErrorTime(now);
    
    console.log(`🚨 ERROR COUNT: ${newRetryCount}/${MAX_RETRIES} - Último error hace ${Math.round((now - lastErrorTime) / 1000)}s`);
    
    // Si es un error 403, ser más específico
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      console.log('🚨 ERROR 403 DETECTADO: Posibles causas - permisos insuficientes o token inválido');
      setErrorType('permission_denied');
    }
    
    // Si excedemos el límite, mostrar mensaje de rate limiting
    if (newRetryCount >= MAX_RETRIES) {
      console.log('🚨 RATE LIMIT EXCEEDED: Pausando intentos por', RETRY_DELAY / 1000, 'segundos');
      setError('Demasiados errores de conexión. Por favor, intenta nuevamente en unos minutos.');
    }
  };

  const refreshGoogleToken = async () => {
    // Evitar múltiples intentos simultáneos
    if (loading) {
      console.log('🔄 Refresh token ya en progreso, evitando duplicación');
      return;
    }

    try {
      setLoading(true);
      
      const { data: userProfile } = await supabase
        .from('users')
        .select('google_refresh_token')
        .eq('id', user.id)
        .single();

      if (!userProfile?.google_refresh_token) {
        console.warn('⚠️ No refresh token available, user needs to reauthenticate');
        setErrorType('session_expired');
        setIsConnected(false);
        return;
      }

      const newTokens = await googleAnalyticsService.refreshAccessToken(
        userProfile.google_refresh_token
      );

      // Update tokens in database
      await supabase
        .from('users')
        .update({
          google_access_token: newTokens.access_token,
          google_refresh_token: newTokens.refresh_token || userProfile.google_refresh_token,
          google_token_expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      // Limpiar cualquier error anterior
      setError(null);
      setErrorType(null);
      setIsConnected(true);
      await loadAccountsAndProperties(true); // Load accounts first, properties in background
      
      console.log('✅ Token refrescado exitosamente');
    } catch (err) {
      console.error('Error refreshing Google token:', err);
      setErrorType('session_expired');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const connectGoogleAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // CRITICAL: Verificar que hay una sesión activa antes de proceder
      const { supabase } = await import('../config/supabase-new');
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        throw new Error('Debes iniciar sesión antes de conectar Google Analytics');
      }

      console.log('🔒 CRITICAL: Iniciando OAuth de Analytics DIRECTO para usuario:', currentSession.user.email);
      console.log('🔒 CRITICAL: Sesión actual preservada ID:', currentSession.user.id);

      // SOLUCIÓN REAL: Usar OAuth directo de Google SIN Supabase signInWithOAuth
      // Esto evita completamente que Supabase cambie la sesión del usuario
      // Usamos el callback original que ya está configurado en Google Cloud Console
      const authUrl = googleAnalyticsService.generateAuthUrl(getRedirectUri());
      
      console.log('🔒 CRITICAL: Redirigiendo a OAuth directo de Google (sin Supabase)');
      
      // Almacenar información del usuario original en sessionStorage para recuperación
      sessionStorage.setItem('original_user_id', currentSession.user.id);
      sessionStorage.setItem('original_user_email', currentSession.user.email);
      sessionStorage.setItem('analytics_oauth_flow', 'true');
      
      // Redirigir directamente a Google OAuth (sin pasar por Supabase)
      window.location.href = authUrl;
      
      return { success: true };
    } catch (err) {
      console.error('Error initiating Google Analytics connection:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyticsCallback = async (code) => {
    try {
      setLoading(true);
      setError(null);

      // CRITICAL: Obtener sesión actual ANTES de cualquier operación
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        throw new Error('No hay sesión activa. Por favor, inicia sesión nuevamente.');
      }

      // CRITICAL: Verificar si el usuario actual coincide con el original
      const urlParams = new URLSearchParams(window.location.search);
      const originalUserId = urlParams.get('original_user_id') || currentSession.user.id;
      const originalUserEmail = urlParams.get('original_user_email') || currentSession.user.email;

      console.log('🔒 CRITICAL: Procesando callback de Analytics');
      console.log('🔒 CRITICAL: Usuario actual:', currentSession.user.email);
      console.log('🔒 CRITICAL: Usuario original esperado:', originalUserEmail);

      // 🔒🔒🔒 PROTECCIÓN CRÍTICA - NO MODIFICAR NUNCA 🔒🔒🔒
      // ESTA VALIDACIÓN PROTEGE LA SESIÓN ORIGINAL DEL USUARIO
      // Si hay un cambio de usuario, restaurar la sesión original
      if (currentSession.user.email !== originalUserEmail) {
        console.log('🔒 CRITICAL: Detectado cambio de usuario, restaurando sesión original...');
        console.log('🔒 SESIÓN ORIGINAL PROTEGIDA:', originalUserEmail);
        console.log('🔒 SESIÓN ACTUAL IGNORADA:', currentSession.user.email);
        
        // Intentar restaurar la sesión original
        try {
          // 🔒 ESTA ES UNA MEDIDA DE EMERGENCIA CRÍTICA - NO TOCAR
          console.warn('⚠️ ADVERTENCIA: Se detectó un cambio no autorizado de usuario');
          throw new Error(`Cambio de usuario detectado. Sesión original: ${originalUserEmail}, Sesión actual: ${currentSession.user.email}. Por favor, inicia sesión nuevamente.`);
        } catch (restoreError) {
          console.error('❌ Error crítico de seguridad - cambio de usuario detectado:', restoreError);
          throw restoreError;
        }
      }

      // Exchange authorization code for tokens WITHOUT affecting the main session
      const tokens = await googleAnalyticsService.exchangeCodeForTokens(code, getRedirectUri());

      // Get user info from Google (but don't use it to update user session)
      const userInfo = await googleAnalyticsService.getUserInfo(tokens.access_token);
      console.log('🔍 DEBUG: Info de Google obtenida (no se usará para sesión):', userInfo?.email);

      // CRITICAL: Store ONLY Google tokens, preserve original user session completely
      const { error: updateError } = await supabase
        .from('users')
        .update({
          google_access_token: tokens.access_token,
          google_refresh_token: tokens.refresh_token,
          google_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', currentSession.user.id); // Update by current user ID

      if (updateError) {
        console.error('❌ Error updating user profile:', updateError);
        throw updateError;
      }

      console.log('✅ CRITICAL: Tokens de Google Analytics almacenados exitosamente SIN modificar sesión principal');
      console.log('✅ CRITICAL: Usuario preservado correctamente:', currentSession.user.email);
      setIsConnected(true);
      
      // Load accounts and properties for the original user
      await loadAccountsAndProperties();
      
      console.log('✅ CRITICAL: Google Analytics vinculado exitosamente para usuario original');
    } catch (err) {
      console.error('❌ Error connecting Google Analytics:', err);
      
      // Manejo específico de errores 503 y otros errores comunes
      let userFriendlyMessage = err.message;
      
      if (err.message.includes('Servicio de Google temporalmente no disponible')) {
        userFriendlyMessage = 'El servicio de Google Analytics está temporalmente no disponible. Por favor, espera unos minutos e intenta nuevamente.';
      } else if (err.message.includes('Código de autorización inválido o expirado')) {
        userFriendlyMessage = 'El código de autorización ha expirado. Por favor, intenta conectar tu cuenta de Analytics nuevamente.';
      } else if (err.message.includes('La conexión está tardando demasiado')) {
        userFriendlyMessage = 'La conexión está tardando demasiado. Verifica tu conexión a internet e intenta nuevamente.';
      } else if (err.message.includes('Failed to exchange authorization code for tokens')) {
        userFriendlyMessage = 'Hubo un problema al conectar con Google Analytics. Por favor, intenta nuevamente.';
      }
      
      setError(userFriendlyMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const disconnectGoogleAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current session to access provider token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.warn('Error getting session for disconnect:', sessionError);
      }

      // Revoke Google token if available (both provider_token and stored tokens)
      if (session?.provider_token) {
        try {
          await googleAnalyticsService.revokeAccessToken(session.provider_token);
          console.log('✅ Provider token revoked successfully');
        } catch (revokeError) {
          console.warn('⚠️ Error revoking provider token:', revokeError);
          // Continue with disconnect even if revoke fails
        }
      }

      // Get stored tokens from database to revoke them too
      const { data: userProfile } = await supabase
        .from('users')
        .select('google_access_token')
        .eq('id', user.id)
        .single();

      if (userProfile?.google_access_token) {
        try {
          await googleAnalyticsService.revokeAccessToken(userProfile.google_access_token);
          console.log('✅ Stored access token revoked successfully');
        } catch (revokeError) {
          console.warn('⚠️ Error revoking stored access token:', revokeError);
          // Continue with disconnect even if revoke fails
        }
      }

      // Remove Google tokens from database
      const { error: dbError } = await supabase
        .from('users')
        .update({
          google_access_token: null,
          google_refresh_token: null,
          google_token_expires_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (dbError) {
        console.error('Error removing tokens from database:', dbError);
        throw dbError;
      }

      // Clear cached analytics data
      try {
        await supabase
          .from('analytics_cache')
          .delete()
          .eq('user_id', user.id);
        console.log('✅ Analytics cache cleared');
      } catch (cacheError) {
        console.warn('⚠️ Error clearing analytics cache:', cacheError);
        // Continue with disconnect even if cache clear fails
      }

      // Sign out from Supabase to completely clear the session and provider_token
      try {
        await supabase.auth.signOut();
        console.log('✅ User signed out successfully');
      } catch (signOutError) {
        console.warn('⚠️ Error signing out:', signOutError);
        // Continue with disconnect even if sign out fails
      }

      // Clear local state
      setAccounts([]);
      setProperties([]);
      setIsConnected(false);
      setError(null);
      setErrorType(null);

      console.log('✅ Google Analytics disconnected successfully');
    } catch (err) {
      console.error('Error disconnecting Google Analytics:', err);
      setError('Error desconectando Google Analytics: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadAccountsAndProperties = async (loadProperties = true) => {
    try {
      // 🚨 RATE LIMITING: Verificar si hemos excedido el límite de reintentos
      const now = Date.now();
      if (now - lastErrorTime < RETRY_DELAY && retryCount >= MAX_RETRIES) {
        console.log('🚨 RATE LIMIT: Demasiados errores recientes, pausando carga de cuentas');
        return;
      }

      setLoading(true);

      // Try to get Google provider token from Supabase first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      let accessToken;
      
      if (!sessionError && session?.provider_token) {
        // Use provider token from Supabase
        accessToken = session.provider_token;
      } else {
        // Fallback to legacy token from database
        const { data: userProfile } = await supabase
          .from('users')
          .select('google_access_token')
          .eq('id', user.id)
          .single();

        if (!userProfile?.google_access_token) {
          throw new Error('No Google access token available');
        }
        accessToken = userProfile.google_access_token;
      }

      // Load accounts first - this is fast
      const accountsData = await googleAnalyticsService.getAccounts(accessToken);
      
      // 🚨 VALIDACIÓN CRÍTICA: Asegurar que accountsData sea un array
      if (!accountsData || !Array.isArray(accountsData)) {
        console.error('❌ ERROR: accountsData no es un array válido:', accountsData);
        throw new Error('Error al obtener cuentas: datos inválidos recibidos');
      }
      
      // Procesar las cuentas para extraer el ID del campo name
      const processedAccounts = accountsData.map(account => {
        // Extraer el ID numérico del campo name (formato: "accounts/123456")
        const accountId = account.name ? account.name.split('/')[1] : account.id;
        return {
          ...account,
          id: accountId, // Agregar el campo id para compatibilidad
          displayName: account.displayName || account.name // Usar displayName si está disponible
        };
      });
      
      console.log(`🔍 DEBUG: Cuentas procesadas: ${processedAccounts.length}`);
      setAccounts(processedAccounts);

      // Store accounts in database immediately
      await storeAccounts(processedAccounts);

      // Load properties in background if requested
      if (loadProperties) {
        loadPropertiesInBackground(processedAccounts, accessToken);
      }

      // ✅ ÉXITO: Resetear contadores de error
      setRetryCount(0);
      setLastErrorTime(0);
    } catch (err) {
      console.error('Error loading accounts and properties:', err);
      
      // 🚨 NUEVO: Intentar refresh automático en caso de error 401
      if (err.message.includes('token de acceso ha expirado') ||
          err.message.includes('401') ||
          err.message.includes('Unauthorized')) {
        console.log('🔄 Detectado error 401, intentando refresh automático del token...');
        try {
          await refreshGoogleToken();
          // Si el refresh fue exitoso, intentar cargar las cuentas nuevamente
          if (isConnected) {
            console.log('✅ Token refrescado exitosamente, reintentando carga de cuentas...');
            await loadAccountsAndProperties(loadProperties);
            return; // Salir para evitar el setError
          }
        } catch (refreshError) {
          console.error('❌ Error en refresh automático:', refreshError);
          // Continuar con el manejo normal del error
        }
      }
      
      setError(err.message);
      // 🚨 MANEJAR ERROR: Incrementar contador
      handleErrorIncrement(err);
    } finally {
      setLoading(false);
    }
  };

  // Separate function to load properties in background
  const loadPropertiesInBackground = async (processedAccounts, accessToken) => {
    try {
      // Load properties for each account in parallel with concurrency limit
      const allProperties = [];
      const CONCURRENCY_LIMIT = 5; // Limit concurrent requests to avoid overwhelming the API
      const chunks = [];
      
      // Split accounts into chunks for concurrent processing
      for (let i = 0; i < processedAccounts.length; i += CONCURRENCY_LIMIT) {
        chunks.push(processedAccounts.slice(i, i + CONCURRENCY_LIMIT));
      }

      for (const chunk of chunks) {
        const chunkPromises = chunk.map(async (account) => {
          try {
            console.log(`🔍 DEBUG: Cargando propiedades para cuenta ${account.id} (${account.displayName})`);
            
            // Validar que account.id exista
            if (!account.id) {
              console.error(`❌ ERROR: Cuenta sin ID:`, account);
              return []; // Return empty array for invalid accounts
            }
            
            const propertiesData = await googleAnalyticsService.getProperties(
              accessToken,
              account.id
            );
            console.log(`✅ DEBUG: Propiedades cargadas para cuenta ${account.id}: ${propertiesData?.length || 0}`);
            
            // Agregar el accountId a cada propiedad para asegurar la asociación correcta
            const propertiesWithAccountId = propertiesData.map(property => {
              // Extraer el ID de propiedad del campo name (formato: "properties/123456")
              const propertyId = property.name ? property.name.split('/')[1] : property.id;
              
              return {
                ...property,
                id: propertyId, // Asegurar que cada propiedad tenga el ID correcto
                accountId: account.id  // Asegurar que cada propiedad tenga el accountId correcto
              };
            });
            
            return propertiesWithAccountId;
          } catch (error) {
            console.error(`❌ ERROR al cargar propiedades para cuenta ${account.id}:`, error);
            return []; // Return empty array for failed requests
          }
        });

        const chunkResults = await Promise.all(chunkPromises);
        allProperties.push(...chunkResults.flat());
      }
      
      console.log(`🔍 DEBUG: Total de propiedades cargadas: ${allProperties.length}`);
      console.log(`🔍 DEBUG: Muestra de propiedades:`, allProperties.slice(0, 3).map(p => ({ id: p.id, name: p.name, accountId: p.accountId })));
      setProperties(allProperties);

      // Store properties in database
      await storeProperties(allProperties);
    } catch (err) {
      console.error('Error loading properties in background:', err);
      // Don't set error here as it's background loading
    }
  };

  // Separate function to store accounts only
  const storeAccounts = async (accountsData) => {
    try {
      const accountsToStore = accountsData.map(account => {
        // Extraer el ID numérico del campo name (formato: "accounts/123456")
        const accountId = account.name ? account.name.split('/')[1] : account.id;
        return {
          user_id: user.id,
          account_id: accountId,
          account_name: account.displayName || account.name,
          updated_at: new Date().toISOString()
        };
      });

      console.log(`🔍 DEBUG: Guardando ${accountsToStore.length} cuentas en la base de datos`);
      
      // Filtrar cuentas con account_id nulo o inválido
      const validAccounts = accountsToStore.filter(account =>
        account.account_id && account.account_id !== 'undefined' && account.account_id !== null
      );
      
      if (validAccounts.length === 0) {
        console.error('❌ ERROR: No hay cuentas válidas para guardar');
        return;
      }
      
      const { data, error } = await supabase
        .from('ga4_accounts')
        .upsert(validAccounts, {
          onConflict: 'user_id,account_id'
        });
        
      if (error) {
        console.error('❌ ERROR al guardar cuentas:', error);
      } else {
        console.log('✅ DEBUG: Cuentas guardadas exitosamente');
      }
    } catch (error) {
      console.error('❌ ERROR en la operación de guardar cuentas:', error);
    }
  };

  // Separate function to store properties only
  const storeProperties = async (propertiesData) => {
    try {
      const propertiesToStore = propertiesData.map(property => ({
        user_id: user.id,
        account_id: property.accountId,
        property_id: property.id,
        property_name: property.displayName || property.name,
        property_type: property.type || 'WEB',
        updated_at: new Date().toISOString()
      }));

      console.log(`🔍 DEBUG: Guardando ${propertiesToStore.length} propiedades en la base de datos`);
      
      // Filtrar propiedades con account_id o property_id nulos o inválidos
      const validProperties = propertiesToStore.filter(property =>
        property.account_id &&
        property.account_id !== 'undefined' &&
        property.account_id !== null &&
        property.property_id &&
        property.property_id !== 'undefined' &&
        property.property_id !== null
      );
      
      if (validProperties.length > 0) {
        const { data, error } = await supabase
          .from('ga4_properties')
          .upsert(validProperties, {
            onConflict: 'user_id,property_id'
          });
           
        if (error) {
          console.error('❌ ERROR al guardar propiedades:', error);
        } else {
          console.log('✅ DEBUG: Propiedades guardadas exitosamente');
        }
      }
    } catch (err) {
      console.error('❌ ERROR storing properties:', err);
    }
  };

  const storeAccountsAndProperties = async (accountsData, propertiesData) => {
    try {
      // Store accounts
      const accountsToStore = accountsData.map(account => {
        // Extraer el ID numérico del campo name (formato: "accounts/123456")
        const accountId = account.name ? account.name.split('/')[1] : account.id;
        return {
          user_id: user.id,
          account_id: accountId,
          account_name: account.displayName || account.name,
          updated_at: new Date().toISOString()
        };
      });

      console.log(`🔍 DEBUG: Guardando ${accountsToStore.length} cuentas en la base de datos`);
      console.log(`🔍 DEBUG: Datos de cuentas a guardar:`, accountsToStore.slice(0, 3));
      console.log(`🔍 DEBUG: Estructura de cuenta original:`, accountsData[0]);
      console.log(`🔍 DEBUG: Estructura de cuenta procesada:`, accountsToStore[0]);
      
      // Filtrar cuentas con account_id nulo o inválido
      const validAccounts = accountsToStore.filter(account =>
        account.account_id && account.account_id !== 'undefined' && account.account_id !== null
      );
      
      console.log(`🔍 DEBUG: Cuentas válidas para guardar: ${validAccounts.length} de ${accountsToStore.length}`);
      
      if (validAccounts.length === 0) {
        console.error('❌ ERROR: No hay cuentas válidas para guardar');
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('ga4_accounts')
          .upsert(validAccounts, {
            onConflict: 'user_id,account_id'  // Constraint que existe según el error
          });
          
        if (error) {
          console.error('❌ ERROR al guardar cuentas:', error);
          // No lanzar el error para que continúe con las propiedades
          console.warn('⚠️ Continuando a pesar del error al guardar cuentas');
        } else {
          console.log('✅ DEBUG: Cuentas guardadas exitosamente');
        }
      } catch (error) {
        console.error('❌ ERROR en la operación de guardar cuentas:', error);
        // No lanzar el error para que continúe con las propiedades
        console.warn('⚠️ Continuando a pesar del error al guardar cuentas');
      }

      // Store properties
      const propertiesToStore = propertiesData.map(property => ({
        user_id: user.id,
        account_id: property.accountId,
        property_id: property.id,
        property_name: property.displayName || property.name,
        property_type: property.type || 'WEB',
        updated_at: new Date().toISOString()
      }));

      console.log(`🔍 DEBUG: Guardando ${propertiesToStore.length} propiedades en la base de datos`);
      console.log(`🔍 DEBUG: Datos de propiedades a guardar:`, propertiesToStore.slice(0, 3));
      
      // Filtrar propiedades con account_id o property_id nulos o inválidos
      const validProperties = propertiesToStore.filter(property =>
        property.account_id &&
        property.account_id !== 'undefined' &&
        property.account_id !== null &&
        property.property_id &&
        property.property_id !== 'undefined' &&
        property.property_id !== null
      );
      
      console.log(`🔍 DEBUG: Propiedades válidas para guardar: ${validProperties.length} de ${propertiesToStore.length}`);
      
      if (validProperties.length > 0) {
        try {
          const { data, error } = await supabase
            .from('ga4_properties')
            .upsert(validProperties, {
              onConflict: 'user_id,property_id'  // Constraint que existe según el error
            });
             
          if (error) {
            console.error('❌ ERROR al guardar propiedades:', error);
            // No lanzar el error para que continúe
            console.warn('⚠️ Continuando a pesar del error al guardar propiedades');
          } else {
            console.log('✅ DEBUG: Propiedades guardadas exitosamente');
          }
        } catch (error) {
          console.error('❌ ERROR en la operación de guardar propiedades:', error);
          // No lanzar el error para que continúe
          console.warn('⚠️ Continuando a pesar del error al guardar propiedades');
        }
      } else {
        console.log('⚠️ DEBUG: No hay propiedades válidas para guardar');
      }
      
      console.log('✅ DEBUG: Cuentas y propiedades guardadas exitosamente');
    } catch (err) {
      console.error('❌ ERROR storing accounts and properties:', err);
      // No lanzar el error para que no afecte la carga de datos
      console.warn('⚠️ Continuando a pesar de errores en el almacenamiento');
    }
  };

  const getAnalyticsData = async (propertyId, metrics, dimensions, dateRange) => {
    try {
      setLoading(true);

      // Try to get Google provider token from Supabase first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      let accessToken;
      
      if (!sessionError && session?.provider_token) {
        // Use provider token from Supabase
        accessToken = session.provider_token;
      } else {
        // Fallback to legacy token from database
        const { data: userProfile } = await supabase
          .from('users')
          .select('google_access_token')
          .eq('id', user.id)
          .single();

        if (!userProfile?.google_access_token) {
          throw new Error('No Google access token available');
        }
        accessToken = userProfile.google_access_token;
      }

      // Check cache first - simplificar la consulta para evitar errores 406
      const { data: cachedData, error: cacheError } = await supabase
        .from('analytics_cache')
        .select('cached_data')
        .eq('user_id', user.id)
        .eq('property_id', propertyId)
        .eq('date_range_start', dateRange.startDate)
        .eq('date_range_end', dateRange.endDate)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle(); // Usar maybeSingle en lugar de single para evitar errores si no hay datos
        
      if (cacheError) {
        console.warn('⚠️ Error al consultar caché:', cacheError);
        // Continuar sin caché si hay error
      }

      if (cachedData) {
        return cachedData.cached_data;
      }

      // Fetch fresh data from Google Analytics
      const analyticsData = await googleAnalyticsService.getAnalyticsData(
        accessToken,
        propertyId,
        metrics,
        dimensions,
        dateRange
      );

      // Cache the data
      const cacheData = {
        user_id: user.id,
        property_id: propertyId,
        date_range_start: dateRange.startDate,
        date_range_end: dateRange.endDate,
        cached_data: analyticsData,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
      };
      
      // Añadir métricas y dimensiones solo si existen
      if (metrics && metrics.length > 0) {
        cacheData.metrics = JSON.stringify(metrics);
      }
      if (dimensions && dimensions.length > 0) {
        cacheData.dimensions = JSON.stringify(dimensions);
      }
      
      // Primero intentar eliminar cualquier entrada existente para evitar conflictos
      await supabase
        .from('analytics_cache')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId)
        .eq('date_range_start', dateRange.startDate)
        .eq('date_range_end', dateRange.endDate);
        
      // Luego insertar los nuevos datos
      await supabase
        .from('analytics_cache')
        .insert(cacheData);

      return analyticsData;
    } catch (err) {
      console.error('Error getting analytics data:', err);
      
      // 🚨 NUEVO: Intentar refresh automático en caso de error 401
      if (err.message.includes('token de acceso ha expirado') ||
          err.message.includes('401') ||
          err.message.includes('Unauthorized')) {
        console.log('🔄 Detectado error 401 en getAnalyticsData, intentando refresh automático del token...');
        try {
          await refreshGoogleToken();
          // Si el refresh fue exitoso, reintentar la consulta
          if (isConnected) {
            console.log('✅ Token refrescado exitosamente, reintentando consulta de datos...');
            return await getAnalyticsData(propertyId, metrics, dimensions, dateRange);
          }
        } catch (refreshError) {
          console.error('❌ Error en refresh automático:', refreshError);
          // Continuar con el manejo normal del error
        }
      }
      
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    accounts,
    properties,
    isConnected,
    loading,
    error,
    errorType,
    connectGoogleAnalytics,
    disconnectGoogleAnalytics,
    loadAccountsAndProperties,
    getAnalyticsData,
    refreshGoogleToken,
    handleAnalyticsCallback, // CRITICAL: Exportar handleAnalyticsCallback
    clearError: () => {
      setError(null);
      setErrorType(null);
    }
  };

  return (
    <GoogleAnalyticsContext.Provider value={value}>
      {children}
    </GoogleAnalyticsContext.Provider>
  );
};

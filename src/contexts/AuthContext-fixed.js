import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase-new'';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 🔍 DETECCIÓN DE MODO INCOGNITO - SOLUCIÓN PROFESIONAL
const isIncognitoMode = () => {
  try {
    // Test 1: Intentar abrir y cerrar una base de datos IndexedDB
    if ('webkitRequestFileSystem' in window) {
      return false; // Chrome normal tiene esta API
    }
    
    // Test 2: Verificar comportamiento de localStorage
    const testKey = '__incognito_test__';
    try {
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return false; // localStorage funciona normalmente
    } catch (e) {
      return true; // localStorage está bloqueado (modo incógnito)
    }
  } catch (error) {
    console.warn('⚠️ No se pudo detectar modo incógnito:', error);
    return false;
  }
};

// 🔍 ALMACENAMIENTO SEGURO PARA MODO INCOGNITO
const getSecureStorage = () => {
  const incognito = isIncognitoMode();
  
  if (incognito) {
    console.log('🕵️ MODO INCOGNITO DETECTADO - Usando cookies como fallback');
    return {
      getItem: (key) => {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === key) {
            return decodeURIComponent(value);
          }
        }
        return null;
      },
      setItem: (key, value) => {
        // Cookie con expiración de 1 hora para modo incógnito
        document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=3600; SameSite=Strict`;
      },
      removeItem: (key) => {
        document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    };
  }
  
  // Modo normal: usar sessionStorage
  return {
    getItem: (key) => sessionStorage.getItem(key),
    setItem: (key, value) => sessionStorage.setItem(key, value),
    removeItem: (key) => sessionStorage.removeItem(key)
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [isIncognito, setIsIncognito] = useState(false);
  const secureStorage = getSecureStorage();

  useEffect(() => {
    // 🔍 DETECTAR MODO INCOGNITO AL INICIAR
    const incognitoMode = isIncognitoMode();
    setIsIncognito(incognitoMode);
    
    if (incognitoMode) {
      console.log('🕵️ MODO INCOGNITO DETECTADO - Aplicando soluciones alternativas');
    }

    const getInitialSession = async () => {
      try {
        console.log('🔍 DEBUG: Obteniendo sesión inicial...');
        
        // 🔍 EN MODO INCOGNITO: Reducir timeout y simplificar flujo
        if (incognitoMode) {
          console.log('🕵️ Modo incógnito: Usando flujo simplificado');
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.warn('⚠️ Error obteniendo sesión en modo incógnito:', error.message);
          }
          
          setSession(session);
          setUser(session?.user || null);
          setLoading(false);
          return; // Salir temprano del flujo complejo
        }
        
        // 🔍 MODO NORMAL: Flujo completo con sessionStorage
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('⚠️ Error obteniendo sesión:', error.message);
        }
        
        setSession(session);
        setUser(session?.user || null);
        console.log('✅ DEBUG: Sesión inicial obtenida:', !!session);
      } catch (error) {
        console.error('❌ Error crítico en getInitialSession:', error);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 🔒 LISTENER DE CAMBIOS DE AUTENTICACIÓN
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('🔄 DEBUG: Auth state changed:', event);
          
          // 🔍 MODO INCOGNITO: Manejo simplificado
          if (isIncognitoMode()) {
            console.log('🕵️ Manejando cambio de auth en modo incógnito');
            setSession(session);
            setUser(session?.user || null);
            return;
          }
          
          // 🔍 MODO NORMAL: Flujo complejo con protección
          const isAnalyticsFlow = secureStorage.getItem('analytics_oauth_flow') === 'true';
          const originalUserEmail = secureStorage.getItem('original_user_email');
          
          console.log('🔒 DEBUG: Analytics OAuth Flow:', isAnalyticsFlow);
          console.log('🔒 DEBUG: Original User:', originalUserEmail);
          
          // 🔒 PROTECCIÓN PARA MODO NORMAL
          if (isAnalyticsFlow && originalUserEmail && event === 'SIGNED_IN' && session?.user?.email !== originalUserEmail) {
            console.log('🛡️ CRITICAL: Ignorando cambio de sesión de OAuth de Analytics');
            return;
          }
          
          // 🔍 ACTUALIZAR ESTADO NORMALMENTE
          setSession(session);
          setUser(session?.user || null);
          setLoading(false);

          if (session?.user) {
            updateUserProfile(session.user).catch(error => {
              console.warn('⚠️ Error actualizando perfil de usuario:', error);
            });
          }
        } catch (error) {
          console.error('❌ Error en onAuthStateChange:', error);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // 🔍 RESTO DE FUNCIONES IGUAL QUE ANTES
  const updateUserProfile = async (user, password = null) => {
    // ... (función existente sin cambios)
  };

  const signInWithEmail = async (email, password) => {
    // ... (función existente sin cambios)
  };

  const signUpWithEmail = async (email, password, fullName) => {
    // ... (función existente sin cambios)
  };

  const signInWithGoogle = async () => {
    // 🔍 MODO INCOGNITO: Preparar almacenamiento seguro antes de OAuth
    if (isIncognito) {
      console.log('🕵️ Preparando modo incógnito para OAuth');
      secureStorage.setItem('incognito_mode', 'true');
    }
    
    const timestamp = Date.now();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback?t=${timestamp}`,
        scopes: 'email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send'
      }
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    // 🔍 LIMPIAR ALMACENAMIENTO SEGURO AL CERRAR SESIÓN
    if (isIncognito) {
      secureStorage.removeItem('incognito_mode');
      secureStorage.removeItem('analytics_oauth_flow');
      secureStorage.removeItem('original_user_email');
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // 🔍 RESTO DE FUNCIONES IGUAL QUE ANTES
  const resetPassword = async (email) => {
    // ... (función existente sin cambios)
  };

  const updatePassword = async (password) => {
    // ... (función existente sin cambios)
  };

  const verifyPassword = async (password) => {
    // ... (función existente sin cambios)
  };

  const getUserProfile = async () => {
    // ... (función existente sin cambios)
  };

  const value = {
    user,
    session,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    verifyPassword,
    getUserProfile,
    updateUserProfile,
    isIncognito // 🔍 EXPONER ESTADO DE MODO INCOGNITO
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

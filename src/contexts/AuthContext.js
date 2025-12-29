import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase-new';
import { getRedirectUri } from '../config/oauthConfig';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 DEBUG: Obteniendo sesión inicial...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('⚠️ Error obteniendo sesión:', error.message);
        }
        
        setSession(session);
        setUser(session?.user || null);
        console.log('✅ DEBUG: Sesión inicial obtenida:', !!session);
      } catch (error) {
        console.error('❌ Error crítico en getInitialSession:', error);
        // En caso de error, asumir que no hay sesión
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 🔒🔒🔒 PROTECCIÓN CRÍTICA - NO MODIFICAR NUNCA 🔒🔒🔒
    // Este listener previene que Supabase OAuth cambie la sesión del usuario principal
    // ESencial para el funcionamiento correcto del flujo de Google Analytics
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('🔄 DEBUG: Auth state changed:', event);
          console.log('🔍 DEBUG: Session user email:', session?.user?.email);
          
          // 🔒 CRITICAL: Verificar si estamos en flujo de OAuth de Analytics DIRECTO
          // ESTA LÍNEA ES VITAL PARA LA PROTECCIÓN DE SESIÓN - NO TOCAR
          const isAnalyticsFlow = sessionStorage.getItem('analytics_oauth_flow') === 'true';
          const originalUserId = sessionStorage.getItem('original_user_id');
          const originalUserEmail = sessionStorage.getItem('original_user_email');
          
          console.log('🔒 DEBUG: Analytics OAuth Flow:', isAnalyticsFlow);
          console.log('🔒 DEBUG: Original User from sessionStorage:', originalUserEmail);
          
          // 🔒 PROTECCIÓN VITAL: Si estamos en flujo de Analytics OAuth y hay sesión original, ignorar completamente
          // ESTA CONDICIÓN PROTEGE LA SESIÓN ORIGINAL - NUNCA MODIFICAR
          if (isAnalyticsFlow && originalUserEmail && event === 'SIGNED_IN' && session?.user?.email !== originalUserEmail) {
            console.log('🛡️ CRITICAL: Ignorando cambio de sesión de OAuth de Analytics');
            console.log('🛡️ Usuario original preservado:', originalUserEmail);
            console.log('🛡️ Usuario de Analytics ignorado:', session?.user?.email);
            
            // 🔒 NO actualizar el estado - mantener el usuario original
            setLoading(false);
            return;
          }
          
          // Detectar si es OAuth de Analytics por URL o metadata (método anterior como fallback)
          const urlParams = new URLSearchParams(window.location.search);
          const isAnalyticsCallback = urlParams.get('analytics') === 'true';
          const isAnalyticsOAuth = session?.user?.user_metadata?.analytics_oauth === 'true' ||
                                   session?.user?.app_metadata?.analytics_oauth === 'true' ||
                                   isAnalyticsCallback;
          
          // PRESERVAR USUARIO ORIGINAL: Si es OAuth de Analytics y ya hay una sesión activa
          if (isAnalyticsOAuth && event === 'SIGNED_IN' && user && user.email !== session?.user?.email) {
            console.log('🔒 CRITICAL: OAuth de Analytics detectado (fallback), preservando usuario original');
            console.log('🔒 Usuario original:', user.email);
            console.log('🔒 Usuario de Analytics (ignorado):', session?.user?.email);
            
            // CRITICAL: Restaurar la sesión original inmediatamente
            // Esto evita que se cambie el usuario actual
            try {
              const { data: { session: originalSession } } = await supabase.auth.getSession();
              if (originalSession?.user?.email === user.email) {
                console.log('✅ Sesión original restaurada correctamente');
                // No actualizar el estado, mantener el usuario original
                setLoading(false);
                return;
              }
            } catch (restoreError) {
              console.error('❌ Error restaurando sesión original:', restoreError);
            }
          }
          
          // Solo actualizar si no es OAuth de Analytics que intenta cambiar el usuario
          if (!isAnalyticsOAuth || !user || user.email === session?.user?.email) {
            setSession(session);
            setUser(session?.user || null);
            setLoading(false);

            // Update user profile in database (sin bloquear la UI)
            if (session?.user) {
              updateUserProfile(session.user).catch(error => {
                console.warn('⚠️ Error actualizando perfil de usuario:', error);
                // No lanzar el error para no interrumpir el flujo de autenticación
              });
            }
          } else {
            setLoading(false);
          }
        } catch (error) {
          console.error('❌ Error en onAuthStateChange:', error);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const updateUserProfile = async (user, password = null) => {
    try {
      const profileData = {
        id: user.id,
        email: user.email,
        full_name: user?.user_metadata?.full_name || user?.email,
        avatar_url: user?.user_metadata?.avatar_url || null,
        updated_at: new Date().toISOString()
      };

      // Add password hash if provided
      if (password) {
        const { data: hashData, error: hashError } = await supabase.rpc('hash_password', {
          password_text: password
        });
        
        if (!hashError && hashData) {
          profileData.password_hash = hashData;
        }
      }

      const { error } = await supabase
        .from('users')
        .upsert(profileData);

      if (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  };

  const signUpWithEmail = async (email, password, fullName) => {
    try {
      // First, create the user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;

      // If user was created successfully, update the profile with password hash
      if (data.user) {
        await updateUserProfile(data.user, password);
      }

      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    // OAuth with Gmail scopes for registration and login
    const timestamp = Date.now();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getRedirectUri(),
        scopes: 'email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send'
      }
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getRedirectUri().replace('/callback', '/reset-password')
    });

    if (error) throw error;
    return data;
  };

  const updatePassword = async (password) => {
    try {
      // Update password in Supabase Auth
      const { data, error } = await supabase.auth.updateUser({
        password
      });

      if (error) throw error;

      // Update password hash in users table
      if (user) {
        const { error: hashError } = await supabase.rpc('update_user_password', {
          user_id: user.id,
          new_password: password
        });

        if (hashError) {
          console.error('Error updating password hash:', hashError);
        }
      }

      return data;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  };

  const verifyPassword = async (password) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (!data?.password_hash) {
        throw new Error('No password hash found');
      }

      const { data: isValid, error: verifyError } = await supabase.rpc('verify_password', {
        password_text: password,
        hash_text: data.password_hash
      });

      if (verifyError) throw verifyError;

      return isValid;
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  };

  const getUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
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
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

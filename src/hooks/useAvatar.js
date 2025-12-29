import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import userSettingsService from '../services/userSettingsService';

const useAvatar = () => {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar avatar desde múltiples fuentes
  const loadAvatar = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Prioridad: user_settings > user_metadata > null
      const settings = await userSettingsService.getUserSettings();
      
      if (settings?.avatar_url) {
        setAvatarUrl(settings.avatar_url);
      } else if (user?.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url);
      } else {
        setAvatarUrl(null);
      }
    } catch (err) {
      console.error('Error loading avatar:', err);
      setError(err.message);
      // En caso de error, intentar usar el metadata del usuario
      if (user?.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url);
      } else {
        setAvatarUrl(null);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Actualizar avatar
  const updateAvatar = useCallback(async (newAvatarUrl) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Actualizar en user_settings
      await userSettingsService.updatePartialSettings({
        avatar_url: newAvatarUrl
      });

      // Actualizar en auth metadata
      const { supabase } = await import('../config/supabase-new');
      const { error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: newAvatarUrl }
      });

      if (authError) {
        console.warn('Error updating auth metadata:', authError);
      }

      setAvatarUrl(newAvatarUrl);
    } catch (err) {
      console.error('Error updating avatar:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Limpiar avatar
  const clearAvatar = useCallback(async () => {
    await updateAvatar(null);
  }, [updateAvatar]);

  // Validar URL de imagen
  const isValidImageUrl = useCallback((url) => {
    if (!url || typeof url !== 'string') return false;
    
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }, []);

  // Obtener fallback text
  const getFallbackText = useCallback(() => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?';
  }, [user]);

  // Cargar avatar cuando el usuario cambia
  useEffect(() => {
    loadAvatar();
  }, [loadAvatar]);

  return {
    avatarUrl,
    loading,
    error,
    updateAvatar,
    clearAvatar,
    loadAvatar,
    isValidImageUrl,
    getFallbackText,
    hasAvatar: !!avatarUrl
  };
};

export default useAvatar;
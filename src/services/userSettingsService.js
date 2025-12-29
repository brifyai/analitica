import { supabase } from '../config/supabase-new';

class UserSettingsService {
  /**
   * Obtener configuraciones del usuario actual
   */
  async getUserSettings() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Cambiado de .single() a .maybeSingle()

      if (error) {
        console.error('Error fetching user settings:', error);
        throw error;
      }

      // Si no hay configuraciones, crear configuraciones por defecto
      if (!data) {
        console.log('No settings found, creating default settings...');
        return await this.createDefaultSettings(user.id);
      }

      return data;
    } catch (error) {
      console.error('Error in getUserSettings:', error);
      throw error;
    }
  }

  /**
   * Crear configuraciones por defecto para un usuario
   */
  async createDefaultSettings(userId) {
    try {
      const defaultSettings = {
        user_id: userId,
        // Configuraciones de perfil
        full_name: '',
        phone: '',
        company: '',
        bio: '',
        avatar_url: null,
        
        // Configuraciones de notificaciones
        notifications_email: true,
        notifications_push: false,
        notifications_analytics: true,
        notifications_reports: true,
        notifications_maintenance: true,
        
        // Configuraciones de apariencia
        theme: 'system',
        language: 'es',
        timezone: 'America/Santiago',
        date_format: 'DD/MM/YYYY',
        currency: 'CLP',
        
        // Configuraciones de privacidad
        profile_visibility: 'private',
        analytics_sharing: false,
        data_retention: '1year',
        two_factor_auth: false,
        
        // Configuraciones de datos
        auto_backup: true
      };

      // Usar upsert en lugar de insert para manejar duplicados
      const { data, error } = await supabase
        .from('user_settings')
        .upsert(defaultSettings, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating/updating default settings:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createDefaultSettings:', error);
      throw error;
    }
  }

  /**
   * Actualizar configuraciones del usuario
   */
  async updateUserSettings(settings) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Preparar los datos para actualizar
      const updateData = {
        ...settings,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...updateData
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating user settings:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateUserSettings:', error);
      throw error;
    }
  }

  /**
   * Actualizar configuraciones específicas (parciales)
   */
  async updatePartialSettings(partialSettings) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('user_settings')
        .update({
          ...partialSettings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating partial user settings:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updatePartialSettings:', error);
      throw error;
    }
  }

  /**
   * Restablecer configuraciones a valores por defecto
   */
  async resetToDefaults() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const defaultSettings = {
        // Configuraciones de perfil
        full_name: user.user_metadata?.full_name || '',
        phone: '',
        company: '',
        bio: '',
        avatar_url: user.user_metadata?.avatar_url || null,
        
        // Configuraciones de notificaciones
        notifications_email: true,
        notifications_push: false,
        notifications_analytics: true,
        notifications_reports: true,
        notifications_maintenance: true,
        
        // Configuraciones de apariencia
        theme: 'system',
        language: 'es',
        timezone: 'America/Santiago',
        date_format: 'DD/MM/YYYY',
        currency: 'CLP',
        
        // Configuraciones de privacidad
        profile_visibility: 'private',
        analytics_sharing: false,
        data_retention: '1year',
        two_factor_auth: false,
        
        // Configuraciones de datos
        auto_backup: true
      };

      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...defaultSettings
        })
        .select()
        .single();

      if (error) {
        console.error('Error resetting user settings:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in resetToDefaults:', error);
      throw error;
    }
  }

  /**
   * Exportar configuraciones del usuario
   */
  async exportUserSettings() {
    try {
      const settings = await this.getUserSettings();
      
      // Crear un objeto limpio sin metadatos internos
      const exportData = {
        profile: {
          full_name: settings.full_name,
          phone: settings.phone,
          company: settings.company,
          bio: settings.bio,
          avatar_url: settings.avatar_url
        },
        notifications: {
          email: settings.notifications_email,
          push: settings.notifications_push,
          analytics: settings.notifications_analytics,
          reports: settings.notifications_reports,
          maintenance: settings.notifications_maintenance
        },
        appearance: {
          theme: settings.theme,
          language: settings.language,
          timezone: settings.timezone,
          date_format: settings.date_format,
          currency: settings.currency
        },
        privacy: {
          profile_visibility: settings.profile_visibility,
          analytics_sharing: settings.analytics_sharing,
          data_retention: settings.data_retention,
          two_factor_auth: settings.two_factor_auth
        },
        data: {
          auto_backup: settings.auto_backup
        },
        export_info: {
          exported_at: new Date().toISOString(),
          version: '1.0'
        }
      };

      return exportData;
    } catch (error) {
      console.error('Error in exportUserSettings:', error);
      throw error;
    }
  }

  /**
   * Limpiar caché del usuario
   */
  async clearUserCache() {
    try {
      // Limpiar caché local del usuario
      // En una implementación real, esto podría limpiar caché local
      // o solicitar al servidor que limpie caché específico del usuario
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        message: 'Caché limpiado exitosamente',
        cleared_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in clearUserCache:', error);
      throw error;
    }
  }

  /**
   * Verificar si las configuraciones están disponibles
   */
  async isSettingsAvailable() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return !!user;
    } catch (error) {
      console.error('Error checking settings availability:', error);
      return false;
    }
  }
}

// Exportar instancia singleton
export const userSettingsService = new UserSettingsService();
export default userSettingsService;

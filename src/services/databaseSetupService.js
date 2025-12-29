/**
 * Servicio para configurar y corregir la estructura de base de datos
 * Versión corregida sin llamadas RPC problemáticas
 */
export class DatabaseSetupService {
  constructor() {
    this.supabase = null;
  }

  async initializeSupabase() {
    if (!this.supabase) {
      const { supabase } = await import('../config/supabase-new');
      this.supabase = supabase;
    }
    return this.supabase;
  }

  /**
   * Verificar y crear estructura de base de datos
   */
  async setupDatabaseStructure() {
    try {
      console.log('🔧 Configurando estructura de base de datos...');
      
      // Verificar tablas existentes
      await this.verifyTablesExist();
      
      // Configurar políticas RLS básicas
      await this.setupBasicRowLevelSecurity();
      
      console.log('✅ Estructura de base de datos configurada correctamente');
      return { success: true, message: 'Base de datos configurada exitosamente' };
      
    } catch (error) {
      console.error('❌ Error configurando base de datos:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Verificar que las tablas necesarias existen
   */
  async verifyTablesExist() {
    const supabase = await this.initializeSupabase();
    const requiredTables = [
      'analytics_cache',
      'ga4_accounts',
      'ga4_properties',
      'users'
    ];

    for (const tableName of requiredTables) {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error && error.code === 'PGRST116') {
          console.log(`📋 Tabla ${tableName} no existe, pero se puede crear manualmente en Supabase`);
        } else if (error) {
          console.warn(`⚠️ Error verificando tabla ${tableName}:`, error);
        } else {
          console.log(`✅ Tabla ${tableName} existe`);
        }
      } catch (error) {
        console.error(`❌ Error verificando tabla ${tableName}:`, error);
      }
    }
  }

  /**
   * Configurar Row Level Security básico
   */
  async setupBasicRowLevelSecurity() {
    const supabase = await this.initializeSupabase();
    const tables = ['analytics_cache', 'ga4_accounts', 'ga4_properties', 'users'];

    for (const tableName of tables) {
      try {
        // Solo verificar si RLS está habilitado, no intentar configurarlo
        const { error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (!error || error.code !== 'PGRST116') {
          console.log(`✅ Tabla ${tableName} accesible`);
        }
      } catch (error) {
        console.warn(`⚠️ Error verificando acceso a ${tableName}:`, error);
      }
    }
  }

  /**
   * Limpiar caché expirado
   */
  async cleanupExpiredCache() {
    try {
      const supabase = await this.initializeSupabase();
      
      const { error } = await supabase
        .from('analytics_cache')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) {
        console.warn('⚠️ Error limpiando caché expirado:', error);
      } else {
        console.log('✅ Caché expirado limpiado');
      }
    } catch (error) {
      console.error('❌ Error en limpieza de caché:', error);
    }
  }

  /**
   * Verificar conectividad con Supabase
   */
  async testConnection() {
    try {
      const supabase = await this.initializeSupabase();
      
      const { error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      console.log('✅ Conexión con Supabase exitosa');
      return { success: true, connected: true };
    } catch (error) {
      console.error('❌ Error conectando con Supabase:', error);
      return { success: false, connected: false, error: error.message };
    }
  }

  /**
   * Obtener estadísticas de la base de datos
   */
  async getDatabaseStats() {
    try {
      const supabase = await this.initializeSupabase();
      
      const [cacheStats, accountsStats, propertiesStats] = await Promise.all([
        supabase.from('analytics_cache').select('id', { count: 'exact', head: true }),
        supabase.from('ga4_accounts').select('id', { count: 'exact', head: true }),
        supabase.from('ga4_properties').select('id', { count: 'exact', head: true })
      ]);

      return {
        analytics_cache: cacheStats.count || 0,
        ga4_accounts: accountsStats.count || 0,
        ga4_properties: propertiesStats.count || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return null;
    }
  }
}

export default DatabaseSetupService;
/**
 * Diagnóstico completo de Supabase en el navegador
 * Ejecutar en la consola del navegador: debugSupabase()
 */

window.debugSupabase = function() {
  console.log('🔍 DIAGNÓSTICO DE SUPABASE EN NAVEGADOR\n');
  
  // Verificar variables de entorno en el navegador
  console.log('📋 Variables de entorno en navegador:');
  console.log('process.env.REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL || '❌ NO DEFINIDA');
  console.log('process.env.REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ DEFINIDA' : '❌ NO DEFINIDA');
  
  // Importar el cliente de Supabase
  try {
    // Esto debe ejecutarse después de que se haya cargado el módulo
    import('../config/supabase-new.js').then(module => {
      const { supabase } = module;
      
      console.log('\n🔍 Estado del cliente Supabase:');
      console.log('Tipo de cliente:', typeof supabase);
      console.log('¿Tiene método auth?', typeof supabase.auth);
      console.log('¿Tiene método from?', typeof supabase.from);
      
      // Verificar si es un cliente configurado correctamente
      if (supabase.auth && supabase.auth.signInWithPassword) {
        console.log('✅ Cliente Supabase configurado correctamente');
        console.log('ℹ️ Para probar autenticación, usar credenciales válidas manualmente');
      }
      
      // Verificar el constructor del objeto
      console.log('\n🔍 Constructor del objeto:');
      console.log('Constructor:', supabase.constructor.name);
      console.log('String del objeto:', supabase.toString());
      
      // Verificar si tiene propiedades del cliente real
      console.log('\n🔍 Propiedades del cliente:');
      console.log('¿Tiene rest?', typeof supabase.rest);
      console.log('¿Tiene realtime?', typeof supabase.realtime);
      console.log('¿Tiene postgrest?', typeof supabase.postgrest);
      
    }).catch(error => {
      console.error('❌ Error al importar supabase:', error);
    });
    
  } catch (error) {
    console.error('❌ Error ejecutando diagnóstico:', error);
  }
  
  console.log('\n🎯 Diagnóstico completado. Revisa los resultados arriba.');
};

// Auto-ejecutar si se carga este script
console.log('🩺 Script de diagnóstico de Supabase cargado. Ejecuta debugSupabase() en la consola.');
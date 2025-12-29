// Diagnóstico completo de variables de entorno en React
console.log('🔍 DIAGNÓSTICO COMPLETO DE VARIABLES DE ENTORNO');
console.log('='.repeat(50));

// Verificar todas las variables REACT_APP_
console.log('📋 Variables REACT_APP_ disponibles:');
const reactAppVars = Object.keys(process.env).filter(key => key.startsWith('REACT_APP_'));
reactAppVars.forEach(key => {
  const value = process.env[key];
  const isValid = value && !value.includes('tu_') && !value.includes('example') && !value.includes('your-project');
  console.log(`  ${key}: ${isValid ? '✅' : '❌'} ${value ? 'DEFINIDA' : 'NO DEFINIDA'}`);
});

// Verificar específicamente Supabase
console.log('\n🔐 Variables de Supabase:');
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log(`  REACT_APP_SUPABASE_URL: ${supabaseUrl || '❌ NO DEFINIDA'}`);
console.log(`  REACT_APP_SUPABASE_ANON_KEY: ${supabaseKey ? '✅ DEFINIDA' : '❌ NO DEFINIDA'}`);

// Validación detallada
const urlValid = supabaseUrl && 
  !supabaseUrl.includes('tu_supabase_url_aqui') && 
  !supabaseUrl.includes('your-project') &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('supabase.co');

const keyValid = supabaseKey && 
  !supabaseKey.includes('tu_supabase_anon_key_aqui') && 
  !supabaseKey.includes('example-key') &&
  supabaseKey.length > 50;

console.log(`\n🎯 Validación de credenciales:`);
console.log(`  URL válida: ${urlValid ? '✅ SÍ' : '❌ NO'}`);
console.log(`  Key válida: ${keyValid ? '✅ SÍ' : '❌ NO'}`);

// Resultado final
const allValid = urlValid && keyValid;
console.log(`\n📊 Resultado final: ${allValid ? '✅ CLIENTE REAL' : '❌ CLIENTE NO CONFIGURADO'}`);

if (!allValid) {
  console.log('\n💡 Sugerencias:');
  console.log('  1. Verifica que el archivo .env esté en la raíz del proyecto');
  console.log('  2. Reinicia el servidor con npm start después de cambiar .env');
  console.log('  3. Asegúrate de que las variables tengan el prefijo REACT_APP_');
  console.log('  4. Verifica que no haya espacios en blanco alrededor del = en .env');
}

console.log('\n🧪 Información del entorno:');
console.log(`  NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`  Entorno de desarrollo: ${process.env.NODE_ENV === 'development' ? '✅ SÍ' : '❌ NO'}`);
console.log(`  Variables totales REACT_APP_: ${reactAppVars.length}`);

console.log('\n✅ Diagnóstico completado');
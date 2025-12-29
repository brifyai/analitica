#!/usr/bin/env node

/**
 * Script de diagnóstico para verificar configuración de Supabase
 * Ejecutar: node verificar-supabase-config.js
 */

console.log('🔍 DIAGNÓSTICO DE CONFIGURACIÓN DE SUPABASE\n');

// Verificar variables de entorno
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('📋 Variables de entorno detectadas:');
console.log('REACT_APP_SUPABASE_URL:', supabaseUrl || '❌ NO DEFINIDA');
console.log('REACT_APP_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ DEFINIDA (oculta por seguridad)' : '❌ NO DEFINIDA');

// Verificar condiciones de uso del mock
const useMockClient = !supabaseUrl || !supabaseAnonKey ||
  supabaseAnonKey.includes('example-key') ||
  supabaseUrl.includes('your-project');

console.log('\n🔍 Análisis de condiciones:');
console.log('¿URL está vacía o indefinida?', !supabaseUrl ? '✅ SÍ' : '❌ NO');
console.log('¿Anon Key está vacía o indefinida?', !supabaseAnonKey ? '✅ SÍ' : '❌ NO');
console.log('¿Anon Key contiene "example-key"?', supabaseAnonKey?.includes('example-key') ? '✅ SÍ' : '❌ NO');
console.log('¿URL contiene "your-project"?', supabaseUrl?.includes('your-project') ? '✅ SÍ' : '❌ NO');

console.log('\n📊 Resultado final:');
if (useMockClient) {
  console.log('⚠️ Usando MOCK CLIENT de Supabase');
  console.log('Razón: Una o más condiciones de arriba son verdaderas');
} else {
  console.log('✅ Usando CLIENTE REAL de Supabase');
}

// Verificar valores específicos
console.log('\n🔍 Detalles de los valores:');
if (supabaseUrl) {
  console.log('URL comienza con:', supabaseUrl.substring(0, 20) + '...');
  console.log('URL contiene "supabase.co":', supabaseUrl.includes('supabase.co') ? '✅ SÍ' : '❌ NO');
} else {
  console.log('URL: No definida');
}

if (supabaseAnonKey) {
  console.log('Anon Key longitud:', supabaseAnonKey.length);
  console.log('Anon Key parece válida:', supabaseAnonKey.length > 20 ? '✅ SÍ' : '❌ NO');
} else {
  console.log('Anon Key: No definida');
}

// Verificar archivo .env
const fs = require('fs');
const path = require('path');

console.log('\n📁 Verificación de archivos .env:');
const envFiles = ['.env', '.env.local', '.env.development', '.env.development.local'];

envFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} existe`);
    
    // Leer y verificar si contiene las variables
    const content = fs.readFileSync(filePath, 'utf8');
    const hasUrl = content.includes('REACT_APP_SUPABASE_URL');
    const hasKey = content.includes('REACT_APP_SUPABASE_ANON_KEY');
    
    console.log(`  - Contiene REACT_APP_SUPABASE_URL: ${hasUrl ? '✅ SÍ' : '❌ NO'}`);
    console.log(`  - Contiene REACT_APP_SUPABASE_ANON_KEY: ${hasKey ? '✅ SÍ' : '❌ NO'}`);
    
    if (hasUrl || hasKey) {
      const lines = content.split('\n');
      lines.forEach(line => {
        if (line.includes('REACT_APP_SUPABASE')) {
          const cleanLine = line.replace(/#.*/, '').trim();
          if (cleanLine) {
            console.log(`  - ${cleanLine.substring(0, 30)}...`);
          }
        }
      });
    }
  } else {
    console.log(`❌ ${file} no existe`);
  }
});

// Consejos para solución
console.log('\n💡 Consejos para solucionar:');
console.log('1. Crea un archivo .env en la raíz del proyecto');
console.log('2. Agrega estas líneas (con tus valores reales):');
console.log('');
console.log('REACT_APP_SUPABASE_URL=https://tuproyecto.supabase.co');
console.log('REACT_APP_SUPABASE_ANON_KEY=tu-clave-anonima-aqui');
console.log('');
console.log('3. Reinicia el servidor de desarrollo');
console.log('4. Ejecuta este script nuevamente para verificar');

console.log('\n🎯 Nota: Las variables deben comenzar con REACT_APP_ para que Create React App las incluya.');
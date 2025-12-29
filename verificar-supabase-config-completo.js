#!/usr/bin/env node

/**
 * Script completo de diagnóstico para Supabase que carga .env
 * Ejecutar: node verificar-supabase-config-completo.js
 */

// Cargar variables de entorno desde .env
require('dotenv').config();

console.log('🔍 DIAGNÓSTICO COMPLETO DE CONFIGURACIÓN DE SUPABASE\n');
console.log('📦 Cargando variables desde .env...\n');

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

// Verificar validez de la URL
if (supabaseUrl) {
  console.log('\n🔗 Validación de URL:');
  console.log('URL completa:', supabaseUrl);
  console.log('¿Es URL de Supabase?', supabaseUrl.includes('supabase.co') ? '✅ SÍ' : '❌ NO');
  console.log('¿Comienza con https?', supabaseUrl.startsWith('https://') ? '✅ SÍ' : '❌ NO');
}

// Verificar validez de la Anon Key
if (supabaseAnonKey) {
  console.log('\n🔑 Validación de Anon Key:');
  console.log('Longitud:', supabaseAnonKey.length);
  console.log('¿Parece JWT?', supabaseAnonKey.includes('.') ? '✅ SÍ' : '❌ NO');
  console.log('¿Contiene "anon"?', supabaseAnonKey.includes('anon') ? '✅ SÍ' : '❌ NO');
}

console.log('\n📊 Resultado final:');
if (useMockClient) {
  console.log('⚠️ Usando MOCK CLIENT de Supabase');
  console.log('Razón: Una o más condiciones de arriba son verdaderas');
  console.log('Esto significa que las credenciales NO están configuradas correctamente.');
} else {
  console.log('✅ Usando CLIENTE REAL de Supabase');
  console.log('🎉 Las credenciales están configuradas correctamente!');
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
          if (cleanLine && !cleanLine.includes('tu_')) {
            console.log(`  - ${cleanLine.substring(0, 50)}...`);
          }
        }
      });
    }
  } else {
    console.log(`❌ ${file} no existe`);
  }
});

// Consejos para solución
console.log('\n💡 Consejos:');
if (useMockClient) {
  console.log('1. Verifica que tu archivo .env tenga las credenciales reales');
  console.log('2. Asegúrate de que no digan "tu_supabase_url_aqui" o similar');
  console.log('3. Reinicia el servidor de desarrollo después de cambiar .env');
  console.log('4. Las credenciales deben ser de un proyecto real de Supabase');
} else {
  console.log('1. Reinicia el servidor de desarrollo para aplicar cambios');
  console.log('2. Verifica que todo funcione correctamente');
}

console.log('\n🎯 Nota: Si acabas de cambiar el .env, reinicia el servidor con: npm start');
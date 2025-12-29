#!/usr/bin/env node

/**
 * Script interactivo para configurar Supabase localmente
 * Ejecutar: node configurar-supabase-local.js
 */

const fs = require('fs');
const readline = require('readline');

console.log('🔧 CONFIGURADOR DE SUPABASE PARA DESARROLLO LOCAL\n');

// Crear interfaz de lectura
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para hacer preguntas
function pregunta(texto) {
  return new Promise(resolve => {
    rl.question(texto, resolve);
  });
}

async function configurarSupabase() {
  try {
    console.log('📝 Vamos a configurar tus credenciales de Supabase\n');

    // Leer configuración actual
    let envContent = '';
    if (fs.existsSync('.env')) {
      envContent = fs.readFileSync('.env', 'utf8');
      console.log('📋 Configuración actual encontrada en .env');
    }

    // Preguntar por la URL de Supabase
    console.log('\n📍 PASO 1: URL de Supabase');
    console.log('Ejemplo: https://tuproyecto.supabase.co');
    const supabaseUrl = await pregunta('Ingresa tu URL de Supabase: ');

    // Validar URL
    if (!supabaseUrl || !supabaseUrl.includes('supabase.co')) {
      console.log('❌ URL inválida. Debe ser una URL válida de Supabase.');
      rl.close();
      return;
    }

    // Preguntar por la Anon Key
    console.log('\n🔑 PASO 2: Anon Key de Supabase');
    console.log('Esta es tu clave pública (anon key)');
    const supabaseAnonKey = await pregunta('Ingresa tu Anon Key: ');

    // Validar Anon Key
    if (!supabaseAnonKey || supabaseAnonKey.length < 20) {
      console.log('❌ Anon Key inválida. Debe tener al menos 20 caracteres.');
      rl.close();
      return;
    }

    // Crear backup del archivo .env actual
    if (envContent) {
      const backupFile = `.env.backup.${Date.now()}`;
      fs.writeFileSync(backupFile, envContent);
      console.log(`💾 Backup creado: ${backupFile}`);
    }

    // Actualizar el archivo .env
    let newEnvContent = envContent;

    // Reemplazar o agregar REACT_APP_SUPABASE_URL
    if (newEnvContent.includes('REACT_APP_SUPABASE_URL=')) {
      newEnvContent = newEnvContent.replace(
        /REACT_APP_SUPABASE_URL=.*/g,
        `REACT_APP_SUPABASE_URL=${supabaseUrl}`
      );
    } else {
      newEnvContent += `\nREACT_APP_SUPABASE_URL=${supabaseUrl}`;
    }

    // Reemplazar o agregar REACT_APP_SUPABASE_ANON_KEY
    if (newEnvContent.includes('REACT_APP_SUPABASE_ANON_KEY=')) {
      newEnvContent = newEnvContent.replace(
        /REACT_APP_SUPABASE_ANON_KEY=.*/g,
        `REACT_APP_SUPABASE_ANON_KEY=${supabaseAnonKey}`
      );
    } else {
      newEnvContent += `\nREACT_APP_SUPABASE_ANON_KEY=${supabaseAnonKey}`;
    }

    // Guardar el archivo
    fs.writeFileSync('.env', newEnvContent);

    console.log('\n✅ Configuración actualizada exitosamente!');
    console.log('\n📋 Resumen de cambios:');
    console.log(`- REACT_APP_SUPABASE_URL=${supabaseUrl}`);
    console.log(`- REACT_APP_SUPABASE_ANON_KEY=${supabaseAnonKey.substring(0, 10)}...`);

    console.log('\n🔄 Próximos pasos:');
    console.log('1. Reinicia tu servidor de desarrollo: npm start');
    console.log('2. Verifica que los errores de Supabase desaparecieron');
    console.log('3. Ejecuta: node verificar-supabase-config.js');

  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
  } finally {
    rl.close();
  }
}

// Ejecutar configuración
configurarSupabase().catch(console.error);
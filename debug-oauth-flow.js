// Script para depurar el flujo OAuth de Google Analytics
const axios = require('axios');

// Configuración
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const REDIRECT_URI = 'http://localhost:3000/callback';

console.log('🔍 DEBUG: Verificando configuración OAuth...');
console.log('Client ID:', GOOGLE_CLIENT_ID ? 'Configurado' : 'NO CONFIGURADO');
console.log('Redirect URI:', REDIRECT_URI);

// Función para probar el endpoint de health del backend
async function testBackendHealth() {
  try {
    console.log('\n🔍 DEBUG: Probando conexión con backend...');
    const response = await axios.get('http://localhost:3001/api/health');
    console.log('✅ Backend response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Error conectando con backend:', error.message);
    return false;
  }
}

// Función para generar URL de OAuth
function generateOAuthURL() {
  if (!GOOGLE_CLIENT_ID) {
    console.error('❌ ERROR: REACT_APP_GOOGLE_CLIENT_ID no está configurado');
    return null;
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: [
      'email',
      'profile',
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/analytics.edit',
      'https://www.googleapis.com/auth/analytics.manage.users.readonly'
    ].join(' '),
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true'
  });

  const authUrl = `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;
  console.log('\n🔗 URL de OAuth generada:');
  console.log(authUrl);
  
  return authUrl;
}

// Función para verificar variables de entorno
function checkEnvironmentVariables() {
  console.log('\n🔍 DEBUG: Verificando variables de entorno...');
  
  const requiredVars = [
    'REACT_APP_GOOGLE_CLIENT_ID',
    'REACT_APP_GOOGLE_CLIENT_SECRET',
    'REACT_APP_SUPABASE_URL',
    'REACT_APP_SUPABASE_ANON_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Variables de entorno faltantes:');
    missingVars.forEach(varName => console.error(`  - ${varName}`));
    return false;
  } else {
    console.log('✅ Todas las variables de entorno requeridas están configuradas');
    return true;
  }
}

// Ejecutar pruebas
async function runDiagnostics() {
  console.log('🚀 Iniciando diagnóstico del flujo OAuth de Google Analytics...\n');
  
  // 1. Verificar variables de entorno
  const envOk = checkEnvironmentVariables();
  
  // 2. Probar conexión con backend
  const backendOk = await testBackendHealth();
  
  // 3. Generar URL de OAuth
  const oauthUrl = generateOAuthURL();
  
  // Resumen
  console.log('\n📊 RESUMEN DEL DIAGNÓSTICO:');
  console.log(`Variables de entorno: ${envOk ? '✅ OK' : '❌ ERROR'}`);
  console.log(`Conexión backend: ${backendOk ? '✅ OK' : '❌ ERROR'}`);
  console.log(`URL OAuth: ${oauthUrl ? '✅ OK' : '❌ ERROR'}`);
  
  if (envOk && backendOk && oauthUrl) {
    console.log('\n✅ DIAGNÓSTICO EXITOSO: El sistema está listo para OAuth');
    console.log('\n📋 PASOS SIGUIENTES:');
    console.log('1. Abre la URL de OAuth en tu navegador');
    console.log('2. Inicia sesión con tu cuenta de Google');
    console.log('3. Otorga los permisos solicitados');
    console.log('4. Serás redirigido al callback');
    console.log('5. El sistema procesará la conexión automáticamente');
  } else {
    console.log('\n❌ DIAGNÓSTICO FALLIDO: Hay problemas que deben resolverse');
  }
}

// Ejecutar diagnóstico
runDiagnostics().catch(console.error);
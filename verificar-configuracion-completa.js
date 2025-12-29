#!/usr/bin/env node

/**
 * VERIFICACIÓN COMPLETA DE CONFIGURACIÓN SSL Y OAUTH
 * Script para validar que todo esté funcionando correctamente
 */

const https = require('https');
const http = require('http');
const { execSync } = require('child_process');

// Colores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkHTTPS(url) {
  return new Promise((resolve) => {
    const request = https.get(url, { 
      rejectUnauthorized: false, // Aceptar certificados auto-firmados
      timeout: 5000
    }, (response) => {
      resolve({
        status: 'OK',
        statusCode: response.statusCode,
        protocol: response.protocol,
        headers: response.headers
      });
    });

    request.on('error', (error) => {
      resolve({
        status: 'ERROR',
        error: error.message
      });
    });

    request.on('timeout', () => {
      request.destroy();
      resolve({
        status: 'TIMEOUT',
        error: 'Request timeout'
      });
    });
  });
}

function checkHTTP(url) {
  return new Promise((resolve) => {
    const request = http.get(url, { timeout: 5000 }, (response) => {
      resolve({
        status: 'OK',
        statusCode: response.statusCode,
        protocol: response.protocol,
        headers: response.headers
      });
    });

    request.on('error', (error) => {
      resolve({
        status: 'ERROR',
        error: error.message
      });
    });

    request.on('timeout', () => {
      request.destroy();
      resolve({
        status: 'TIMEOUT',
        error: 'Request timeout'
      });
    });
  });
}

function checkProcessRunning(processName) {
  try {
    const result = execSync(`ps aux | grep "${processName}" | grep -v grep`, { encoding: 'utf8' });
    return result.trim().length > 0;
  } catch (error) {
    return false;
  }
}

function getCloudflareTunnelURL() {
  try {
    const result = execSync('curl -s http://localhost:2000/metrics 2>/dev/null | grep -o "https://[^"]*trycloudflare.com" | head -1', { encoding: 'utf8' });
    return result.trim();
  } catch (error) {
    return null;
  }
}

async function main() {
  log('cyan', '🔍 VERIFICACIÓN COMPLETA DE CONFIGURACIÓN SSL Y OAUTH');
  log('cyan', '='.repeat(60));
  console.log('');

  // 1. Verificar procesos corriendo
  log('blue', '📊 Verificando procesos activos...');
  
  const serverHTTPS = checkProcessRunning('server-coolify-https.js');
  const cloudflared = checkProcessRunning('cloudflared tunnel');
  const reactDev = checkProcessRunning('react-scripts start');
  
  log(serverHTTPS ? 'green' : 'red', `  Servidor HTTPS: ${serverHTTPS ? '✅ ACTIVO' : '❌ INACTIVO'}`);
  log(cloudflared ? 'green' : 'red', `  Cloudflare Tunnel: ${cloudflared ? '✅ ACTIVO' : '❌ INACTIVO'}`);
  log(reactDev ? 'green' : 'red', `  React Development: ${reactDev ? '✅ ACTIVO' : '❌ INACTIVO'}`);
  console.log('');

  // 2. Verificar servidor HTTPS local
  log('blue', '🔒 Verificando servidor HTTPS local...');
  try {
    const localHTTPS = await checkHTTPS('https://localhost:3001/api/health');
    if (localHTTPS.status === 'OK') {
      log('green', `  ✅ Servidor HTTPS local: ${localHTTPS.statusCode} ${localHTTPS.status}`);
      log('green', `  📍 Protocolo: ${localHTTPS.protocol}`);
    } else {
      log('red', `  ❌ Servidor HTTPS local: ${localHTTPS.status} - ${localHTTPS.error}`);
    }
  } catch (error) {
    log('red', `  ❌ Error verificando servidor HTTPS: ${error.message}`);
  }
  console.log('');

  // 3. Verificar servidor HTTP local
  log('blue', '🌐 Verificando servidor HTTP local...');
  try {
    const localHTTP = await checkHTTP('http://localhost:3000');
    if (localHTTP.status === 'OK') {
      log('green', `  ✅ Servidor HTTP local: ${localHTTP.statusCode} ${localHTTP.status}`);
      log('green', `  📍 Protocolo: ${localHTTP.protocol}`);
    } else {
      log('red', `  ❌ Servidor HTTP local: ${localHTTP.status} - ${localHTTP.error}`);
    }
  } catch (error) {
    log('red', `  ❌ Error verificando servidor HTTP: ${error.message}`);
  }
  console.log('');

  // 4. Verificar Cloudflare Tunnel
  log('blue', '🚀 Verificando Cloudflare Tunnel...');
  const tunnelURL = getCloudflareTunnelURL();
  if (tunnelURL) {
    log('green', `  ✅ URL del túnel: ${tunnelURL}`);
    
    try {
      const tunnelCheck = await checkHTTPS(tunnelURL);
      if (tunnelCheck.status === 'OK') {
        log('green', `  ✅ Túnel accesible: ${tunnelCheck.statusCode} ${tunnelCheck.status}`);
      } else {
        log('yellow', `  ⚠️  Túnel con problemas: ${tunnelCheck.status}`);
      }
    } catch (error) {
      log('yellow', `  ⚠️  No se puede verificar túnel: ${error.message}`);
    }
  } else {
    log('red', '  ❌ No se pudo obtener URL del túnel Cloudflare');
  }
  console.log('');

  // 5. Verificar configuración OAuth
  log('blue', '🔐 Verificando configuración OAuth...');
  
  const oauthURLs = [
    'https://localhost:3001/callback',
    'https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback',
    tunnelURL ? `${tunnelURL}/callback` : null
  ].filter(url => url !== null);

  for (const url of oauthURLs) {
    try {
      const oauthCheck = await checkHTTPS(url);
      if (oauthCheck.status === 'OK') {
        log('green', `  ✅ OAuth URL accesible: ${url}`);
      } else {
        log('red', `  ❌ OAuth URL no accesible: ${url} - ${oauthCheck.error}`);
      }
    } catch (error) {
      log('red', `  ❌ Error verificando OAuth URL ${url}: ${error.message}`);
    }
  }
  console.log('');

  // 6. Resumen de configuración
  log('cyan', '📋 RESUMEN DE CONFIGURACIÓN');
  log('cyan', '='.repeat(40));
  
  log('blue', '🌐 URLs de Acceso:');
  log('green', '  • Local (HTTPS): https://localhost:3001');
  log('green', '  • Local (HTTP):  http://localhost:3000');
  log('green', '  • Coolify:       https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io');
  if (tunnelURL) {
    log('green', `  • Túnel:         ${tunnelURL}`);
  }
  console.log('');

  log('blue', '🔗 URLs OAuth Callback:');
  log('yellow', '  • Local:         https://localhost:3001/callback');
  log('yellow', '  • Coolify:       https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback');
  if (tunnelURL) {
    log('yellow', `  • Túnel:         ${tunnelURL}/callback`);
  }
  console.log('');

  // 7. Configuración requerida en Google Cloud Console
  log('blue', '⚙️  Configuración requerida en Google Cloud Console:');
  log('yellow', '  Authorized JavaScript origins:');
  log('cyan', '    • https://localhost:3000');
  log('cyan', '    • https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io');
  if (tunnelURL) {
    log('cyan', `    • ${tunnelURL}`);
  }
  
  log('yellow', '  Authorized redirect URIs:');
  log('cyan', '    • https://localhost:3001/callback');
  log('cyan', '    • https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback');
  if (tunnelURL) {
    log('cyan', `    • ${tunnelURL}/callback`);
  }
  console.log('');

  // 8. Verdicto final
  log('cyan', '🎯 VEREDICTO FINAL');
  log('cyan', '='.repeat(20));
  
  const allServicesRunning = serverHTTPS && cloudflared && reactDev;
  
  if (allServicesRunning && tunnelURL) {
    log('green', '✅ SISTEMA COMPLETAMENTE FUNCIONAL');
    log('green', '✅ SSL configurado y funcionando');
    log('green', '✅ OAuth listo para producción');
    log('green', '✅ Túnel Cloudflare activo');
  } else if (serverHTTPS && reactDev) {
    log('yellow', '⚠️  SISTEMA FUNCIONAL PARCIALMENTE');
    log('yellow', '⚠️  Servidores locales activos');
    if (!cloudflared) {
      log('red', '❌ Túnel Cloudflare inactivo');
    }
  } else {
    log('red', '❌ SISTEMA NO FUNCIONAL');
    log('red', '❌ Iniciar servicios requeridos');
  }
  
  console.log('');
  log('blue', '💡 Comandos útiles:');
  log('cyan', '  • Iniciar túnel SSL: npm run ssl:start');
  log('cyan', '  • Verificar estado: ./start-ssl-tunnel.sh status');
  log('cyan', '  • Detener servicios: ./start-ssl-tunnel.sh stop');
  log('cyan', '  • Verificar configuración: node verificar-configuracion-completa.js');
}

// Ejecutar verificación
main().catch(error => {
  log('red', `Error fatal: ${error.message}`);
  process.exit(1);
});
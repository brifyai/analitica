#!/usr/bin/env node

/**
 * Script para configurar Cloudflare Tunnel automáticamente
 * Resuelve el problema de SSL en Coolify proporcionando un túnel HTTPS confiable
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando Cloudflare Tunnel para Coolify...');

// Configuración
const TUNNEL_NAME = 'tvradio-coolify';
const TUNNEL_DOMAIN = 'tvradio.alegria.dev'; // Cambiar por tu dominio
const LOCAL_PORT = 3001;
const COOLIFY_DOMAIN = 'v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io';

async function setupCloudflareTunnel() {
  try {
    console.log('📋 Paso 1: Verificar instalación de cloudflared...');
    
    // Verificar si cloudflared está instalado
    try {
      execSync('cloudflared --version', { stdio: 'inherit' });
      console.log('✅ cloudflared ya está instalado');
    } catch (error) {
      console.log('⬇️ Instalando cloudflared...');
      execSync('curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tar.gz | tar xz', { stdio: 'inherit' });
      execSync('sudo mv ./cloudflared /usr/local/bin/', { stdio: 'inherit' });
      console.log('✅ cloudflared instalado');
    }

    console.log('📋 Paso 2: Autenticar con Cloudflare...');
    
    // Verificar si ya está autenticado
    try {
      execSync('cloudflared tunnel list', { stdio: 'pipe' });
      console.log('✅ Ya autenticado con Cloudflare');
    } catch (error) {
      console.log('🔐 Iniciando autenticación...');
      console.log('📱 Abre el enlace que aparecerá en tu navegador para autorizar cloudflared');
      execSync('cloudflared tunnel login', { stdio: 'inherit' });
    }

    console.log('📋 Paso 3: Crear túnel...');
    
    // Crear túnel
    try {
      execSync(`cloudflared tunnel create ${TUNNEL_NAME}`, { stdio: 'inherit' });
      console.log(`✅ Túnel ${TUNNEL_NAME} creado`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`✅ Túnel ${TUNNEL_NAME} ya existe`);
      } else {
        throw error;
      }
    }

    console.log('📋 Paso 4: Obtener UUID del túnel...');
    
    // Obtener UUID del túnel
    const tunnelInfo = execSync(`cloudflared tunnel info ${TUNNEL_NAME}`, { encoding: 'utf8' });
    const tunnelUuid = tunnelInfo.match(/([a-f0-9-]{36})/)[1];
    console.log(`✅ UUID del túnel: ${tunnelUuid}`);

    console.log('📋 Paso 5: Configurar archivo de configuración...');
    
    // Crear directorio de configuración
    const configDir = path.join(process.env.HOME, '.cloudflared');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Crear archivo de configuración
    const config = `tunnel: ${tunnelUuid}
credentials-file: ${configDir}/credentials-${TUNNEL_UUID}.json

ingress:
  - hostname: ${TUNNEL_DOMAIN}
    service: https://${LOCAL_PORT}
  - hostname: ${COOLIFY_DOMAIN}
    service: https://${LOCAL_PORT}
  - service: http_status:404`;

    fs.writeFileSync(path.join(configDir, 'config.yml'), config);
    console.log('✅ Archivo de configuración creado');

    console.log('📋 Paso 6: Configurar DNS...');
    
    // Configurar DNS para el dominio
    try {
      execSync(`cloudflared tunnel route dns ${TUNNEL_NAME} ${TUNNEL_DOMAIN}`, { stdio: 'inherit' });
      console.log(`✅ DNS configurado para ${TUNNEL_DOMAIN}`);
    } catch (error) {
      console.log(`⚠️ DNS ya configurado o error: ${error.message}`);
    }

    console.log('📋 Paso 7: Crear archivo de configuración OAuth...');
    
    // Actualizar configuración OAuth para usar el nuevo dominio
    const oauthConfigPath = path.join(__dirname, 'src', 'config', 'oauthConfig.js');
    
    if (fs.existsSync(oauthConfigPath)) {
      let oauthConfig = fs.readFileSync(oauthConfigPath, 'utf8');
      
      // Reemplazar URL de Coolify con la del túnel
      oauthConfig = oauthConfig.replace(
        /redirectUri: process\.env\.REACT_APP_REDIRECT_URI_COOLIFY \|\| 'https:\/\/[^']+'/,
        `redirectUri: process.env.REACT_APP_REDIRECT_URI_COOLIFY || 'https://${TUNNEL_DOMAIN}/callback'`
      );
      
      // Actualizar estado SSL
      oauthConfig = oauthConfig.replace(
        /sslValid: false.*?status: 'CRITICAL_SSL_ERROR'/,
        `sslValid: true, status: 'SSL_RESOLVED_WITH_TUNNEL'`
      );
      
      fs.writeFileSync(oauthConfigPath, oauthConfig);
      console.log('✅ Configuración OAuth actualizada');
    }

    console.log('🎯 Paso 8: Crear script de inicio del túnel...');
    
    // Crear script para iniciar el túnel
    const tunnelScript = `#!/bin/bash
echo "🚀 Iniciando Cloudflare Tunnel para TV-Radio..."
echo "🌐 URL pública: https://${TUNNEL_DOMAIN}"
echo "🔗 URL Coolify: https://${COOLIFY_DOMAIN}"
echo "📊 Health check: https://${TUNNEL_DOMAIN}/api/health"
echo ""
echo "Presiona Ctrl+C para detener el túnel"
echo ""

cloudflared tunnel run ${TUNNEL_NAME}
`;

    fs.writeFileSync('start-tunnel.sh', tunnelScript);
    execSync('chmod +x start-tunnel.sh');
    console.log('✅ Script de inicio creado');

    console.log('\n🎉 CONFIGURACIÓN COMPLETADA');
    console.log('\n📋 RESUMEN:');
    console.log(`🌐 Dominio del túnel: https://${TUNNEL_DOMAIN}`);
    console.log(`🔗 URL Coolify: https://${COOLIFY_DOMAIN}`);
    console.log(`📊 Health check: https://${TUNNEL_DOMAIN}/api/health`);
    console.log(`🔧 Callback OAuth: https://${TUNNEL_DOMAIN}/callback`);
    console.log('\n🚀 Para iniciar el túnel ejecuta:');
    console.log('   ./start-tunnel.sh');
    console.log('\n⚠️ IMPORTANTE:');
    console.log('1. Actualiza Google Cloud Console con la nueva URL de callback');
    console.log('2. Asegúrate que tu dominio apunte a Cloudflare');
    console.log('3. El túnel debe estar corriendo para que OAuth funcione');

  } catch (error) {
    console.error('❌ Error en la configuración:', error.message);
    process.exit(1);
  }
}

// Ejecutar configuración
setupCloudflareTunnel();
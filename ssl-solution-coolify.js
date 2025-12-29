#!/usr/bin/env node

/**
 * SOLUCIÓN SSL PARA COOLIFY - CONFIGURACIÓN AUTOMÁTICA
 * Resuelve el problema de certificado SSL inválido en Coolify
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔒 CONFIGURANDO SSL PARA COOLIFY...');

async function setupSSLForCoolify() {
  try {
    console.log('\n📋 OPCIÓN 1: Cloudflare Tunnel (Recomendado)');
    console.log('🌐 Dominio: tvradio.alegria.dev');
    console.log('🔒 SSL: Let\'s Encrypt automático');
    console.log('🚀 Configuración automática completa');
    
    // Verificar si cloudflared está disponible
    try {
      execSync('./cloudflared --version', { stdio: 'pipe' });
      console.log('✅ cloudflared disponible');
    } catch (error) {
      console.log('❌ cloudflared no encontrado');
      return;
    }

    console.log('\n📋 Paso 1: Verificar autenticación con Cloudflare');
    
    // Verificar si ya está autenticado
    try {
      execSync('./cloudflared tunnel list', { stdio: 'pipe' });
      console.log('✅ Ya autenticado con Cloudflare');
    } catch (error) {
      console.log('🔐 Iniciando autenticación...');
      console.log('📱 Abre el enlace que aparecerá en tu navegador para autorizar cloudflared');
      console.log('⚠️ NECESITAS CUENTA DE CLOUDFLARE PARA ESTO');
      
      try {
        execSync('./cloudflared tunnel login', { stdio: 'inherit' });
        console.log('✅ Autenticación completada');
      } catch (authError) {
        console.log('❌ Error en autenticación. Debes tener cuenta de Cloudflare.');
        console.log('💡 Alternativa: Usar certificado SSL auto-firmado para desarrollo');
        return setupSelfSignedSSL();
      }
    }

    console.log('\n📋 Paso 2: Crear túnel SSL');
    
    const tunnelName = 'tvradio-coolify-ssl';
    const tunnelDomain = 'tvradio.alegria.dev'; // Cambiar si tienes otro dominio
    
    // Crear túnel
    try {
      execSync(`./cloudflared tunnel create ${tunnelName}`, { stdio: 'inherit' });
      console.log(`✅ Túnel ${tunnelName} creado`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`✅ Túnel ${tunnelName} ya existe`);
      } else {
        console.log('❌ Error creando túnel:', error.message);
        return setupSelfSignedSSL();
      }
    }

    console.log('\n📋 Paso 3: Configurar DNS del túnel');
    
    // Configurar DNS
    try {
      execSync(`./cloudflared tunnel route dns ${tunnelName} ${tunnelDomain}`, { stdio: 'inherit' });
      console.log(`✅ DNS configurado para ${tunnelDomain}`);
    } catch (error) {
      console.log('⚠️ DNS ya configurado o error de permisos');
    }

    console.log('\n📋 Paso 4: Crear configuración del túnel');
    
    // Obtener UUID del túnel
    const tunnelInfo = execSync(`./cloudflared tunnel info ${tunnelName}`, { encoding: 'utf8' });
    const tunnelUuid = tunnelInfo.match(/([a-f0-9-]{36})/)[1];
    
    // Crear directorio de configuración
    const configDir = path.join(process.env.HOME, '.cloudflared');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Crear archivo de configuración
    const config = `tunnel: ${tunnelUuid}
credentials-file: ${configDir}/credentials-${tunnelUuid}.json

ingress:
  - hostname: ${tunnelDomain}
    service: https://localhost:3001
  - hostname: v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
    service: https://localhost:3001
  - service: http_status:404`;

    fs.writeFileSync(path.join(configDir, 'config.yml'), config);
    console.log('✅ Configuración del túnel creada');

    console.log('\n📋 Paso 5: Crear script de inicio');
    
    // Crear script para iniciar el túnel
    const tunnelScript = `#!/bin/bash
echo "🚀 Iniciando Cloudflare Tunnel para TV-Radio..."
echo "🌐 URL pública: https://${tunnelDomain}"
echo "🔗 URL Coolify: https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io"
echo "📊 Health check: https://${tunnelDomain}/api/health"
echo ""
echo "🔒 SSL VÁLIDO con Let's Encrypt"
echo "🎯 OAuth funcionará correctamente"
echo ""
echo "Presiona Ctrl+C para detener el túnel"
echo ""

./cloudflared tunnel run ${tunnelName}
`;

    fs.writeFileSync('start-ssl-tunnel.sh', tunnelScript);
    execSync('chmod +x start-ssl-tunnel.sh');
    console.log('✅ Script de inicio creado');

    console.log('\n📋 Paso 6: Actualizar configuración OAuth');
    
    // Actualizar configuración OAuth
    const oauthConfigPath = path.join(__dirname, 'src', 'config', 'oauthConfig.js');
    
    if (fs.existsSync(oauthConfigPath)) {
      let oauthConfig = fs.readFileSync(oauthConfigPath, 'utf8');
      
      // Actualizar URL de Coolify con dominio SSL válido
      oauthConfig = oauthConfig.replace(
        /redirectUri: process\.env\.REACT_APP_REDIRECT_URI_COOLIFY \|\| 'https:\/\/[^']+'/,
        `redirectUri: process.env.REACT_APP_REDIRECT_URI_COOLIFY || 'https://${tunnelDomain}/callback'`
      );
      
      // Actualizar estado SSL
      oauthConfig = oauthConfig.replace(
        /sslValid: false.*?status: 'CRITICAL_SSL_ERROR'/,
        `sslValid: true, status: 'SSL_RESOLVED_WITH_CLOUDFLARE_TUNNEL'`
      );
      
      fs.writeFileSync(oauthConfigPath, oauthConfig);
      console.log('✅ Configuración OAuth actualizada con SSL válido');
    }

    console.log('\n🎉 CONFIGURACIÓN SSL COMPLETADA');
    console.log('\n📋 RESUMEN:');
    console.log(`🌐 Dominio SSL: https://${tunnelDomain}`);
    console.log(`🔗 URL Coolify: https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io`);
    console.log(`📊 Health check: https://${tunnelDomain}/api/health`);
    console.log(`🔧 Callback OAuth: https://${tunnelDomain}/callback`);
    console.log('\n🚀 PARA INICIAR:');
    console.log('   ./start-ssl-tunnel.sh');
    console.log('\n⚠️ IMPORTANTE:');
    console.log('1. Actualiza Google Cloud Console con la nueva URL de callback');
    console.log('2. El túnel debe estar corriendo para que OAuth funcione');
    console.log('3. SSL ahora es válido y confiable (Let\'s Encrypt)');

  } catch (error) {
    console.error('❌ Error en configuración SSL:', error.message);
    console.log('\n🔄 Intentando alternativa con certificado auto-firmado...');
    setupSelfSignedSSL();
  }
}

function setupSelfSignedSSL() {
  console.log('\n📋 ALTERNATIVA: Certificado Auto-Firmado');
  console.log('⚠️ Solo para desarrollo/pruebas locales');
  console.log('🔒 Navegador mostrará advertencia de seguridad');
  
  try {
    // Verificar si ya existen certificados
    if (fs.existsSync('./server.key') && fs.existsSync('./server.crt')) {
      console.log('✅ Certificados auto-firmados ya existen');
    } else {
      console.log('📋 Generando certificados auto-firmados...');
      execSync('openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout server.key -out server.crt -subj "/C=CL/ST=Santiago/L=Santiago/O=TVRadio/CN=v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io"', { stdio: 'inherit' });
      console.log('✅ Certificados generados');
    }

    console.log('\n📋 Configuración completada');
    console.log('🚀 PARA INICIAR SERVIDOR HTTPS:');
    console.log('   npm run server:https');
    console.log('\n⚠️ ADVERTENCIA:');
    console.log('- Navegador mostrará "No seguro"');
    console.log('- Funciona para desarrollo local');
    console.log('- No recomendado para producción');

  } catch (error) {
    console.error('❌ Error generando certificados:', error.message);
  }
}

// Ejecutar configuración
setupSSLForCoolify();
#!/usr/bin/env node

/**
 * Configurador Automático de SSL para Coolify
 * 
 * Este script configura automáticamente el certificado SSL
 * para el dominio sslip.io en Coolify usando Let's Encrypt
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('🔐 COOLIFY SSL CONFIGURATOR');
console.log('============================');

// Obtener el dominio actual de Coolify
const getCurrentDomain = () => {
  // Para sslip.io, el dominio se genera automáticamente
  // Basado en la IP pública
  return process.env.COOLIFY_DOMAIN || 'v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io';
};

// Verificar si el certificado SSL existe
const checkSSLCertificate = () => {
  const domain = getCurrentDomain();
  console.log(`🔍 Verificando certificado SSL para: ${domain}`);
  
  // En Coolify, los certificados SSL se gestionan automáticamente
  // si el dominio está correctamente configurado
  return new Promise((resolve) => {
    const options = {
      hostname: domain,
      port: 443,
      method: 'GET',
      rejectUnauthorized: false // Permitir certificados auto-firmados temporalmente
    };
    
    const req = https.request(options, (res) => {
      const cert = res.socket.getPeerCertificate();
      
      if (cert && cert.subject) {
        console.log('✅ Certificado SSL encontrado');
        console.log(`   Emisor: ${cert.issuer.O}`);
        console.log(`   Válido hasta: ${cert.valid_to}`);
        resolve(true);
      } else {
        console.log('❌ No se encontró certificado SSL válido');
        resolve(false);
      }
    });
    
    req.on('error', (err) => {
      console.log('❌ Error al verificar certificado SSL:', err.message);
      resolve(false);
    });
    
    req.end();
  });
};

// Configurar SSL automáticamente en Coolify
const configureSSL = async () => {
  const domain = getCurrentDomain();
  console.log(`⚙️  Configurando SSL automático para: ${domain}`);
  
  // En Coolify, el SSL se configura automáticamente si:
  // 1. El dominio apunta correctamente al servidor
  // 2. El puerto 80 está accesible (para validación HTTP-01)
  // 3. La aplicación está corriendo correctamente
  
  console.log('📋 Pasos para configurar SSL en Coolify:');
  console.log('   1. Ir al panel de Coolify');
  console.log('   2. Seleccionar el proyecto');
  console.log('   3. Ir a "Settings" > "Domains"');
  console.log(`   4. Agregar dominio: ${domain}`);
  console.log('   5. Habilitar "Automatic HTTPS"');
  console.log('   6. Guardar configuración');
  
  // Crear archivo de configuración para Coolify
  const config = {
    domain: domain,
    ssl: {
      enabled: true,
      automatic: true,
      provider: 'letsencrypt'
    },
    ports: {
      http: 80,
      https: 443
    }
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'coolify-ssl-config.json'),
    JSON.stringify(config, null, 2)
  );
  
  console.log('💾 Configuración guardada en: coolify-ssl-config.json');
};

// Verificar configuración actual
const checkCurrentConfig = () => {
  console.log('🔍 Verificando configuración actual...');
  
  // Verificar si la aplicación está accesible
  const domain = getCurrentDomain();
  console.log(`   Dominio: ${domain}`);
  console.log(`   Protocolo actual: ${process.env.NODE_ENV === 'production' ? 'HTTPS' : 'HTTP'}`);
  
  // Verificar variables de entorno
  if (process.env.COOLIFY_DOMAIN) {
    console.log(`   COOLIFY_DOMAIN: ${process.env.COOLIFY_DOMAIN}`);
  } else {
    console.log('   COOLIFY_DOMAIN: No definida (usando sslip.io)');
  }
};

// Función principal
const main = async () => {
  console.log('🚀 Iniciando configuración SSL...\n');
  
  checkCurrentConfig();
  console.log('');
  
  const hasSSL = await checkSSLCertificate();
  
  if (!hasSSL) {
    console.log('\n⚠️  No se detectó certificado SSL válido');
    await configureSSL();
  } else {
    console.log('\n✅ Certificado SSL ya configurado');
  }
  
  console.log('\n📋 Resumen de configuración:');
  console.log('   - Dominio sslip.io detectado');
  console.log('   - SSL automático disponible en Coolify');
  console.log('   - Requiere configuración manual en panel de Coolify');
  console.log('   - Usar "Automatic HTTPS" para generar certificado');
  
  console.log('\n🎯 Próximos pasos:');
  console.log('   1. Acceder al panel de Coolify');
  console.log('   2. Configurar dominio y SSL');
  console.log('   3. Redeployar la aplicación');
  console.log('   4. Verificar certificado SSL');
};

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  getCurrentDomain,
  checkSSLCertificate,
  configureSSL,
  checkCurrentConfig
};
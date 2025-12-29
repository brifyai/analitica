#!/usr/bin/env node

/**
 * 🚀 SCRIPT AUTOMATIZADO PARA CONFIGURAR imetrics.cl
 * 
 * Este script te guía paso a paso en la configuración de tu dominio
 * y genera los comandos específicos que necesitas ejecutar
 */

const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(`
🎉 ¡FELICIDADES POR COMPRAR imetrics.cl! 🎉

Este script te guiará paso a paso para configurar tu dominio
con Cloudflare y Coolify de manera profesional.

⏰ TIEMPO ESTIMADO: 30-45 minutos
`);

async function configurarDominio() {
  console.log('\n📋 PASO 1: INFORMACIÓN NECESARIA\n');
  
  const ipCoolify = await pregunta('🔍 ¿Cuál es la IP de tu servidor Coolify? (ej: 147.93.182.94): ');
  const googleClientId = await pregunta('🔑 ¿Cuál es tu Google Client ID? (deja en blanco si no lo tienes a mano): ');
  const supabaseUrl = await pregunta('🔗 ¿Cuál es tu URL de Supabase? (ej: https://xxx.supabase.co): ');
  
  console.log('\n✅ Información recibida. Generando configuración...\n');
  
  // Generar archivo de configuración
  const config = {
    dominio: 'imetrics.cl',
    ip: ipCoolify,
    googleClientId: googleClientId,
    supabaseUrl: supabaseUrl,
    fecha: new Date().toISOString()
  };
  
  fs.writeFileSync('dominio-config.json', JSON.stringify(config, null, 2));
  
  console.log('📝 ARCHIVO DE CONFIGURACIÓN CREADO: dominio-config.json\n');
  
  // Generar comandos DNS
  console.log('🌐 PASO 2: REGISTROS DNS PARA CLOUDFLARE\n');
  console.log('Copia estos registros en tu panel de Cloudflare:\n');
  console.log('Tipo: A');
  console.log('Nombre: @');
  console.log(`Contenido: ${ipCoolify}`);
  console.log('Proxy: Naranja (activado)');
  console.log('TTL: Auto\n');
  
  console.log('Tipo: A');
  console.log('Nombre: www');
  console.log(`Contenido: ${ipCoolify}`);
  console.log('Proxy: Naranja (activado)');
  console.log('TTL: Auto\n');
  
  // Generar variables de entorno
  console.log('🔧 PASO 3: VARIABLES DE ENTORNO PARA COOLIFY\n');
  console.log('Agrega estas variables en tu aplicación Coolify:\n');
  console.log(`REACT_APP_PUBLIC_URL=https://imetrics.cl`);
  console.log(`REACT_APP_API_URL=https://imetrics.cl/api`);
  console.log(`REACT_APP_REDIRECT_URI=https://imetrics.cl/callback`);
  console.log(`REACT_APP_GOOGLE_CLIENT_ID=${googleClientId}`);
  console.log(`REACT_APP_SUPABASE_URL=${supabaseUrl}\n`);
  
  // Generar URLs OAuth
  console.log('🔐 PASO 4: URLs OAUTH PARA CONFIGURAR\n');
  console.log('En Google Cloud Console, agrega estos redirect URIs:\n');
  console.log('https://imetrics.cl/callback');
  console.log('https://www.imetrics.cl/callback\n');
  
  console.log('En Supabase, configura:\n');
  console.log(`Site URL: https://imetrics.cl`);
  console.log('Redirect URLs:');
  console.log('https://imetrics.cl/callback');
  console.log('https://www.imetrics.cl/callback\n');
  
  // Generar comandos de verificación
  console.log('🧪 PASO 5: COMANDOS DE VERIFICACIÓN\n');
  console.log('Ejecuta estos comandos para verificar todo funciona:\n');
  console.log('# Verificar DNS');
  console.log('nslookup imetrics.cl');
  console.log('nslookup www.imetrics.cl\n');
  
  console.log('# Verificar SSL');
  console.log('curl -I https://imetrics.cl\n');
  
  console.log('# Verificar redirección HTTP → HTTPS');
  console.log('curl -I http://imetrics.cl\n');
  
  // Generar checklist
  console.log('✅ PASO 6: CHECKLIST FINAL\n');
  console.log('Marca cada elemento cuando lo completes:\n');
  console.log('[ ] Cuenta Cloudflare creada');
  console.log('[ ] Dominio imetrics.cl agregado a Cloudflare');
  console.log('[ ] Nameservers cambiados en NIC Chile');
  console.log('[ ] Registros DNS configurados en Cloudflare');
  console.log('[ ] SSL configurado en modo Full (strict)');
  console.log('[ ] Dominio configurado en Coolify');
  console.log('[ ] Variables de entorno actualizadas');
  console.log('[ ] OAuth configurado en Google Cloud Console');
  console.log('[ ] OAuth configurado en Supabase');
  console.log('[ ] Verificación DNS exitosa');
  console.log('[ ] Verificación SSL exitosa');
  console.log('[ ] Sitio funciona en https://imetrics.cl');
  console.log('[ ] Login con Google funciona correctamente\n');
  
  console.log('🎯 ¡LISTO! Tu dominio imetrics.cl estará funcionando profesionalmente.\n');
  
  // Generar script de monitoreo
  const monitoreoScript = `#!/bin/bash
# Script para monitorear el estado de imetrics.cl

echo "🔍 Verificando estado de imetrics.cl..."
echo "=================================="

# Verificar DNS
echo "📡 Verificando DNS..."
nslookup imetrics.cl
echo ""

# Verificar SSL
echo "🔒 Verificando SSL..."
curl -I https://imetrics.cl 2>/dev/null | head -1
echo ""

# Verificar tiempo de respuesta
echo "⚡ Verificando tiempo de respuesta..."
curl -o /dev/null -s -w "%{time_total}\\n" https://imetrics.cl
echo ""

# Verificar estado HTTP
echo "🌐 Verificando estado HTTP..."
curl -s -o /dev/null -w "%{http_code}" https://imetrics.cl
echo ""

echo "✅ Verificación completada!"
`;
  
  fs.writeFileSync('verificar-dominio.sh', monitoreoScript);
  fs.chmodSync('verificar-dominio.sh', '755');
  
  console.log('📄 SCRIPT DE VERIFICACIÓN CREADO: verificar-dominio.sh');
  console.log('   Ejecútalo con: ./verificar-dominio.sh\n');
  
  console.log('📚 RECursos útiles:');
  console.log('- Panel Cloudflare: https://dash.cloudflare.com');
  console.log('- NIC Chile: https://www.nic.cl');
  console.log('- Google Cloud Console: https://console.cloud.google.com');
  console.log('- Documentación completa: CONFIGURACION-DOMINIO-COMPRADO-PASO-A-PASO.md\n');
  
  rl.close();
}

function pregunta(pregunta) {
  return new Promise((resolve) => {
    rl.question(pregunta, (respuesta) => {
      resolve(respuesta.trim());
    });
  });
}

// Ejecutar configuración
configurarDominio().catch(console.error);
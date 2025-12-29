#!/usr/bin/env node

/**
 * 🔍 SCRIPT DE VERIFICACIÓN DNS PARA CLOUDFLARE
 * 
 * Este script verifica que tu configuración DNS sea correcta
 * y te guía si hay algún problema
 */

const dns = require('dns').promises;
const https = require('https');
const http = require('http');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const dominio = 'imetrics.cl';
const subdominios = ['@', 'www', 'api'];

console.log(`
🔍 VERIFICADOR DNS PARA imetrics.cl
====================================

Este script verificará que tu configuración DNS en Cloudflare
sea correcta y funcione como esperamos.
`);

async function verificarDNS() {
  console.log('\n📋 PASO 1: VERIFICANDO REGISTROS DNS\n');
  
  for (const subdominio of subdominios) {
    const nombreCompleto = subdominio === '@' ? dominio : `${subdominio}.${dominio}`;
    
    try {
      console.log(`🔍 Verificando ${nombreCompleto}...`);
      
      // Resolver DNS
      const direcciones = await dns.resolve4(nombreCompleto);
      console.log(`   ✅ IP encontrada: ${direcciones.join(', ')}`);
      
      // Verificar si es IP de Cloudflare (rangos comunes)
      const esCloudflare = direcciones.some(ip => 
        ip.startsWith('104.') || 
        ip.startsWith('172.') || 
        ip.startsWith('188.') ||
        ip.startsWith('190.')
      );
      
      if (esCloudflare) {
        console.log(`   ✅ Proxy Cloudflare detectado (IP de Cloudflare)`);
      } else {
        console.log(`   ⚠️  Posible proxy desactivado (IP no parece de Cloudflare)`);
      }
      
    } catch (error) {
      if (error.code === 'ENOTFOUND') {
        console.log(`   ❌ Dominio no encontrado o DNS no propagado`);
      } else {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    console.log('');
  }
  
  console.log('🌐 PASO 2: VERIFICANDO RESPUESTA HTTP\n');
  
  // Verificar respuesta HTTP
  const urls = [
    `http://${dominio}`,
    `https://${dominio}`,
    `http://www.${dominio}`,
    `https://www.${dominio}`
  ];
  
  for (const url of urls) {
    try {
      console.log(`🔍 Verificando ${url}...`);
      
      const respuesta = await verificarHTTP(url);
      console.log(`   ✅ Estado: ${respuesta.statusCode}`);
      console.log(`   ✅ Server: ${respuesta.server}`);
      
      if (respuesta.server && respuesta.server.includes('cloudflare')) {
        console.log(`   ✅ Cloudflare funcionando correctamente`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
  }
  
  console.log('🔍 PASO 3: VERIFICACIÓN DE PROPAGACIÓN GLOBAL\n');
  
  // Verificar con diferentes servidores DNS
  const servidoresDNS = [
    '8.8.8.8',     // Google
    '1.1.1.1',     // Cloudflare
    '208.67.222.222' // OpenDNS
  ];
  
  for (const servidor of servidoresDNS) {
    try {
      console.log(`🔍 Verificando con servidor ${servidor}...`);
      
      dns.setServers([servidor]);
      const direcciones = await dns.resolve4(dominio);
      
      console.log(`   ✅ Resuelve a: ${direcciones.join(', ')}`);
      
    } catch (error) {
      console.log(`   ❌ Error con servidor ${servidor}: ${error.message}`);
    }
    console.log('');
  }
  
  // Restaurar servidores DNS por defecto
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  
  console.log('📊 PASO 4: ANÁLISIS DE CONFIGURACIÓN\n');
  
  await analizarConfiguracion();
  
  console.log('\n✅ VERIFICACIÓN COMPLETADA\n');
  console.log('📋 RESUMEN:');
  console.log('- Si ves ✅ en todos los pasos, tu configuración es correcta');
  console.log('- Si ves ⚠️, hay advertencias que deberías revisar');
  console.log('- Si ves ❌, hay errores que necesitas corregir');
  console.log('\n📚 Recursos útiles:');
  console.log('- DNS Checker: https://dnschecker.org');
  console.log('- WhatsMyDNS: https://whatsmydns.net');
  console.log('- Guía completa: GUIA-DETALLADA-DNS-CLOUDFLARE.md');
  
  rl.close();
}

function verificarHTTP(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.request(url, { timeout: 10000 }, (res) => {
      const server = res.headers['server'] || 'Unknown';
      resolve({
        statusCode: res.statusCode,
        server: server.toLowerCase()
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Timeout')));
    req.end();
  });
}

async function analizarConfiguracion() {
  try {
    console.log('🔍 Analizando configuración actual...');
    
    // Verificar resolución DNS
    const direcciones = await dns.resolve4(dominio);
    const ip = direcciones[0];
    
    console.log(`📍 IP actual: ${ip}`);
    
    // Verificar si es IP de Cloudflare
    const rangosCloudflare = [
      /^104\./,
      /^172\./,
      /^188\./,
      /^190\./,
      /^141\./,
      /^108\./,
      /^173\./
    ];
    
    const esIPCloudflare = rangosCloudflare.some(rango => rango.test(ip));
    
    if (esIPCloudflare) {
      console.log('✅ Proxy Cloudflare: ACTIVADO');
      console.log('✅ CDN: Funcionando');
      console.log('✅ SSL: Configurado automáticamente');
    } else {
      console.log('⚠️  Proxy Cloudflare: DESACTIVADO');
      console.log('⚠️  CDN: No disponible');
      console.log('⚠️  SSL: Debes configurarlo manualmente');
      console.log('');
      console.log('💡 Recomendación: Activa el proxy naranja en Cloudflare');
    }
    
    // Verificar respuesta HTTPS
    try {
      const respuesta = await verificarHTTP(`https://${dominio}`);
      if (respuesta.statusCode === 200) {
        console.log('✅ HTTPS: Funcionando correctamente');
      } else {
        console.log(`⚠️  HTTPS: Responde con código ${respuesta.statusCode}`);
      }
    } catch (error) {
      console.log('❌ HTTPS: No disponible o con errores');
    }
    
    // Verificar redirección HTTP a HTTPS
    try {
      const respuestaHTTP = await verificarHTTP(`http://${dominio}`);
      const respuestaHTTPS = await verificarHTTP(`https://${dominio}`);
      
      if (respuestaHTTP.statusCode >= 300 && respuestaHTTP.statusCode < 400) {
        console.log('✅ Redirección HTTP→HTTPS: Configurada');
      } else {
        console.log('⚠️  Redirección HTTP→HTTPS: No configurada');
        console.log('💡 Recomendación: Activa "Always Use HTTPS" en Cloudflare');
      }
    } catch (error) {
      console.log('❌ Redirección HTTP→HTTPS: No se puede verificar');
    }
    
  } catch (error) {
    console.log(`❌ Error en análisis: ${error.message}`);
  }
}

// Ejecutar verificación
verificarDNS().catch(console.error);
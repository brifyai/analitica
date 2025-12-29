#!/usr/bin/env node

/**
 * Configuración Completa para Producción en Coolify
 * 
 * Este script configura todo lo necesario para que la aplicación
 * funcione correctamente en producción en Coolify
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 COOLIFY PRODUCTION SETUP');
console.log('=============================');

// Configurar variables de entorno para producción
const setupEnvironmentVariables = () => {
  console.log('⚙️  Configurando variables de entorno...');
  
  const envVars = {
    NODE_ENV: 'production',
    REACT_APP_ENVIRONMENT: 'production',
    PORT: 3000,
    SERVER_PORT: 3001,
    COOLIFY_DOMAIN: 'v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io',
    REACT_APP_API_URL: 'https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io',
    REACT_APP_OAUTH_REDIRECT_URI: 'https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback'
  };
  
  // Crear archivo .env.production
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync('.env.production', envContent);
  console.log('✅ Variables de entorno configuradas en .env.production');
};

// Configurar el servidor para producción
const setupProductionServer = () => {
  console.log('🖥️  Configurando servidor para producción...');
  
  // Modificar server.js para producción
  const serverContent = `
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// Middleware
app.use(cors({
  origin: ['https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Health check mejorado
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    server: 'Express production server',
    port: PORT,
    domain: process.env.COOLIFY_DOMAIN || 'localhost'
  });
});

// Endpoint de callback OAuth
app.post('/api/oauth/callback', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Código de autorización requerido' });
    }
    
    // Lógica para intercambiar el código por tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback'
    );
    
    const { tokens } = await oauth2Client.getToken(code);
    
    res.json({
      success: true,
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date
      }
    });
  } catch (error) {
    console.error('Error en OAuth callback:', error);
    res.status(500).json({ error: 'Error al procesar OAuth callback' });
  }
});

// Endpoints de Google Analytics API
app.get('/api/analytics/accounts', async (req, res) => {
  try {
    // Lógica para obtener cuentas de Analytics
    res.json({ accounts: [] });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener cuentas' });
  }
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`🚀 Servidor backend corriendo en puerto \${PORT}\`);
  console.log(\`🌐 Ambiente: \${process.env.NODE_ENV || 'development'}\`);
  console.log(\`🔗 Health check: http://localhost:\${PORT}/api/health\`);
});

module.exports = app;
`;
  
  fs.writeFileSync('server-production.js', serverContent);
  console.log('✅ Servidor de producción configurado');
};

// Actualizar package.json para producción
const updatePackageJson = () => {
  console.log('📦 Actualizando package.json...');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Agregar scripts de producción
  packageJson.scripts['start:production'] = 'concurrently "node server-production.js" "npx serve -s build -l 3000"';
  packageJson.scripts['build:production'] = 'npm run build && npm run start:production';
  
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ Scripts de producción agregados');
};

// Configurar Docker para producción
const setupDocker = () => {
  console.log('🐳 Configurando Docker para producción...');
  
  const dockerContent = `
FROM node:22-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Construir aplicación
RUN npm run build

# Exponer puertos
EXPOSE 3000 3001

# Comando de inicio
CMD ["npm", "run", "start:production"]
`;
  
  fs.writeFileSync('Dockerfile.production', dockerContent);
  console.log('✅ Dockerfile de producción creado');
};

// Crear guía de configuración
const createSetupGuide = () => {
  console.log('📋 Creando guía de configuración...');
  
  const guide = `
# GUÍA DE CONFIGURACIÓN PRODUCCIÓN COOLIFY

## Pasos para desplegar en producción:

### 1. Configurar Dominio y SSL en Coolify
1. Ir al panel de Coolify
2. Seleccionar el proyecto
3. Ir a "Settings" > "Domains"
4. Agregar dominio: v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
5. Habilitar "Automatic HTTPS"

### 2. Configurar Variables de Entorno
En el panel de Coolify, agregar las siguientes variables:
- NODE_ENV=production
- REACT_APP_ENVIRONMENT=production
- PORT=3000
- SERVER_PORT=3001
- COOLIFY_DOMAIN=v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io

### 3. Configurar Google OAuth
Ir a Google Cloud Console y actualizar:
- Authorized redirect URIs:
  - https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback

### 4. Deploy
1. Hacer push de los cambios
2. Coolify detectará automáticamente los cambios
3. Esperar a que el deploy complete
4. Verificar que ambos servicios estén corriendo

### 5. Verificación
- Frontend: https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
- Backend Health: https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/api/health

## Archivos creados/modificados:
- .env.production
- server-production.js
- Dockerfile.production
- package.json (scripts actualizados)
`;
  
  fs.writeFileSync('COOLIFY-PRODUCTION-GUIDE.md', guide);
  console.log('✅ Guía de configuración creada');
};

// Función principal
const main = () => {
  console.log('🚀 Iniciando configuración completa de producción...\n');
  
  setupEnvironmentVariables();
  setupProductionServer();
  updatePackageJson();
  setupDocker();
  createSetupGuide();
  
  console.log('\n✅ Configuración completa de producción finalizada');
  console.log('\n📋 Archivos creados:');
  console.log('   - .env.production');
  console.log('   - server-production.js');
  console.log('   - Dockerfile.production');
  console.log('   - COOLIFY-PRODUCTION-GUIDE.md');
  console.log('\n🎯 Siguientes pasos:');
  console.log('   1. Revisar COOLIFY-PRODUCTION-GUIDE.md');
  console.log('   2. Configurar variables de entorno en Coolify');
  console.log('   3. Hacer deploy de la aplicación');
  console.log('   4. Verificar funcionamiento en producción');
};

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = {
  setupEnvironmentVariables,
  setupProductionServer,
  updatePackageJson,
  setupDocker,
  createSetupGuide
};
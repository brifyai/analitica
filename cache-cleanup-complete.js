#!/usr/bin/env node

// Script completo para limpiar toda la cache del sistema
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 INICIANDO LIMPIEZA COMPLETA DE CACHE...\n');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.cyan);
}

// Función para ejecutar comandos de forma segura
function runCommand(command, description) {
  try {
    logInfo(`Ejecutando: ${description}`);
    execSync(command, { stdio: 'inherit' });
    logSuccess(`${description} completado`);
    return true;
  } catch (error) {
    logWarning(`${description} falló: ${error.message}`);
    return false;
  }
}

// Función para eliminar directorio de forma segura
function removeDirectory(dirPath, description) {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      logSuccess(`${description} eliminado: ${dirPath}`);
      return true;
    } else {
      logInfo(`${description} no existe: ${dirPath}`);
      return false;
    }
  } catch (error) {
    logError(`Error eliminando ${description}: ${error.message}`);
    return false;
  }
}

// Función para eliminar archivo de forma segura
function removeFile(filePath, description) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logSuccess(`${description} eliminado: ${filePath}`);
      return true;
    } else {
      logInfo(`${description} no existe: ${filePath}`);
      return false;
    }
  } catch (error) {
    logError(`Error eliminando ${description}: ${error.message}`);
    return false;
  }
}

async function cleanupCache() {
  try {
    log('\n🗂️  LIMPIEZA DE CACHE DE NPM', colors.bright + colors.magenta);
    log('================================\n');

    // Limpiar cache de npm
    runCommand('npm cache clean --force', 'Limpieza de cache de npm');
    
    // Verificar y reparar cache de npm
    runCommand('npm cache verify', 'Verificación de cache de npm');

    log('\n📦 LIMPIEZA DE DEPENDENCIAS', colors.bright + colors.blue);
    log('============================\n');

    // Eliminar node_modules
    removeDirectory('./node_modules', 'Directorio node_modules');
    
    // Eliminar package-lock.json
    removeFile('./package-lock.json', 'Archivo package-lock.json');

    log('\n🏗️  LIMPIEZA DE BUILD Y COMPILACIÓN', colors.bright + colors.yellow);
    log('====================================\n');

    // Eliminar directorio build
    removeDirectory('./build', 'Directorio build');
    
    // Eliminar directorio dist
    removeDirectory('./dist', 'Directorio dist');
    
    // Eliminar directorio .next
    removeDirectory('./.next', 'Directorio .next');
    
    // Eliminar directorio .cache
    removeDirectory('./.cache', 'Directorio .cache');
    
    // Eliminar directorio coverage
    removeDirectory('./coverage', 'Directorio coverage');

    log('\n🌐 LIMPIEZA DE CACHE DE WEBPACK Y DESARROLLO', colors.bright + colors.green);
    log('=============================================\n');

    // Eliminar cache de webpack
    removeDirectory('./node_modules/.cache', 'Cache de webpack');
    
    // Eliminar archivos .cache en src
    const srcCacheDir = './src/.cache';
    removeDirectory(srcCacheDir, 'Cache de src');

    log('\n📄 LIMPIEZA DE ARCHIVOS TEMPORALES', colors.bright + colors.cyan);
    log('==================================\n');

    // Eliminar archivos .log
    const logFiles = fs.readdirSync('./').filter(file => file.endsWith('.log'));
    logFiles.forEach(file => removeFile(`./${file}`, 'Archivo de log'));

    // Eliminar archivos .tmp
    const tmpFiles = fs.readdirSync('./').filter(file => file.endsWith('.tmp'));
    tmpFiles.forEach(file => removeFile(`./${file}`, 'Archivo temporal'));

    // Elimener archivos .DS_Store (macOS)
    const dsStoreFiles = fs.readdirSync('./').filter(file => file === '.DS_Store');
    dsStoreFiles.forEach(file => removeFile(`./${file}`, 'Archivo .DS_Store'));

    log('\n🗄️  LIMPIEZA DE CACHE DE SUPABASE', colors.bright + colors.magenta);
    log('==================================\n');

    // Eliminar cache de supabase si existe
    removeDirectory('./.supabase', 'Directorio .supabase');
    removeDirectory('./supabase/.cache', 'Cache de supabase');

    log('\n🔧 LIMPIEZA DE HERRAMIENTAS DE DESARROLLO', colors.bright + colors.red);
    log('==========================================\n');

    // Eliminar cache de TypeScript
    removeDirectory('./node_modules/.cache/ts-loader', 'Cache de TypeScript');
    
    // Eliminar cache de ESLint
    removeDirectory('./node_modules/.cache/eslint', 'Cache de ESLint');

    log('\n📱 LIMPIEZA DE PWA Y SERVICE WORKERS', colors.bright + colors.blue);
    log('=====================================\n');

    // Eliminar archivos de service worker
    const swFiles = fs.readdirSync('./public').filter(file => file.includes('sw'));
    swFiles.forEach(file => removeFile(`./public/${file}`, 'Service worker'));

    log('\n🧪 LIMPIEZA DE ARCHIVOS DE PRUEBA', colors.bright + colors.yellow);
    log('==================================\n');

    // Eliminar archivos de prueba generados
    const testFiles = fs.readdirSync('./').filter(file => file.startsWith('test-'));
    testFiles.forEach(file => removeFile(`./${file}`, 'Archivo de prueba'));

    log('\n📊 LIMPIEZA DE REPORTES Y ANÁLISIS', colors.bright + colors.green);
    log('===================================\n');

    // Eliminar reportes de cobertura si existen
    removeDirectory('./coverage', 'Directorio de cobertura');
    removeDirectory('./reports', 'Directorio de reportes');

    log('\n🔄 REINSTALACIÓN DE DEPENDENCIAS', colors.bright + colors.cyan);
    log('=================================\n');

    // Reinstalar dependencias
    logInfo('Reinstalando dependencias con npm install...');
    runCommand('npm install', 'Instalación de dependencias');

    log('\n🎉 LIMPIEZA COMPLETA FINALIZADA', colors.bright + colors.green);
    log('=================================\n');
    
    logSuccess('Toda la cache ha sido limpiada exitosamente');
    logInfo('El sistema está listo para funcionar con cache limpia');
    logInfo('Recomendación: Reinicia el servidor de desarrollo');

  } catch (error) {
    logError(`Error durante la limpieza: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar limpieza
cleanupCache();
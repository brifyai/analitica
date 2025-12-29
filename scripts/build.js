#!/usr/bin/env node

/**
 * Script de build cross-platform para React
 * Funciona en Windows, Linux y macOS
 * Ignora warnings de ESLint estableciendo CI=false
 */

const { execSync } = require('child_process');
const os = require('os');

console.log('🚀 Iniciando build cross-platform...');
console.log(`📍 Sistema operativo: ${os.platform()}`);

try {
  // Determinar el comando según el sistema operativo
  const isWindows = os.platform() === 'win32';
  const buildCommand = isWindows 
    ? 'set CI=false&&react-scripts build' 
    : 'CI=false react-scripts build';

  console.log(`🔧 Ejecutando: ${buildCommand}`);
  
  // Ejecutar el build
  execSync(buildCommand, { 
    stdio: 'inherit',
    shell: true 
  });

  console.log('✅ Build de React completado exitosamente');
  
  // Ejecutar generación de HTML
  console.log('📄 Generando archivos HTML optimizados...');
  execSync('node scripts/build-html.js', { 
    stdio: 'inherit',
    shell: true 
  });

  console.log('🎉 Build completo finalizado exitosamente');
  
} catch (error) {
  console.error('❌ Error durante el build:', error.message);
  process.exit(1);
}
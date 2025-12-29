// Script mejorado para forzar limpieza de caché en Netlify
// VERSIÓN PRODUCCIÓN - SOLUCIÓN DEFINITIVA
console.log('🧹 INICIANDO LIMPIEZA COMPLETA DE CACHÉ...');

const fs = require('fs');
const path = require('path');

// 1. Actualizar package.json con versión única
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const timestamp = new Date().getTime();
packageJson.version = `1.0.${timestamp}`;

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ Package.json actualizado:', packageJson.version);

// 2. Crear archivo de versión para cache busting
const versionFile = `// AUTO-GENERADO - Cache Busting
export const BUILD_VERSION = '${timestamp}';
export const BUILD_DATE = '${new Date().toISOString()}';
`;

fs.writeFileSync('src/config/buildVersion.js', versionFile);
console.log('✅ Archivo de versión creado');

// 3. Actualizar index.html con meta tags de cache busting
const indexPath = 'public/index.html';
if (fs.existsSync(indexPath)) {
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Agregar meta tags de cache busting
  const cacheBustMeta = `
  <!-- Cache Busting - ${timestamp} -->
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <meta name="build-timestamp" content="${timestamp}">
  `;
  
  indexContent = indexContent.replace('</head>', `${cacheBustMeta}</head>`);
  fs.writeFileSync(indexPath, indexContent);
  console.log('✅ Index.html actualizado con cache busting');
}

// 4. Crear script de limpieza para Netlify
const netlifyCacheScript = `#!/bin/bash
# Script de limpieza de cache para Netlify
echo "🧹 Limpiando cache de Netlify..."

# Limpiar directorio de build si existe
if [ -d "build" ]; then
  rm -rf build
  echo "✅ Directorio build eliminado"
fi

# Limpiar node_modules/.cache si existe
if [ -d "node_modules/.cache" ]; then
  rm -rf node_modules/.cache
  echo "✅ Cache de node_modules limpiado"
fi

echo "✅ Limpieza completada"
`;

fs.writeFileSync('clear-cache.sh', netlifyCacheScript);
console.log('✅ Script de limpieza creado');

// 5. Crear archivo de configuración para forzar rebuild
const rebuildTrigger = `# REBUILD TRIGGER - ${timestamp}
# Este archivo fuerza a Netlify a hacer un rebuild completo
`;

fs.writeFileSync('REBUILD_TRIGGER.txt', rebuildTrigger);
console.log('✅ Trigger de rebuild creado');

console.log('');
console.log('🎯 SOLUCIÓN DE CACHÉ IMPLEMENTADA:');
console.log('1. ✅ Version bumped:', packageJson.version);
console.log('2. ✅ Build version file created');
console.log('3. ✅ Cache busting meta tags added');
console.log('4. ✅ Cache cleanup script created');
console.log('5. ✅ Rebuild trigger file created');
console.log('');
console.log('🚀 PARA APLICAR LOS CAMBIOS:');
console.log('1. Ejecuta: npm run build');
console.log('2. Despliega a Netlify');
console.log('3. O espera el próximo deploy automático');
console.log('');
console.log('🔍 VERIFICACIÓN:');
console.log('- Los archivos tendrán timestamps únicos');
console.log('- Netlify detectará cambios automáticamente');
console.log('- El cache será completamente limpiado');
// Script para forzar limpieza de caché en Netlify
// Ejecutar: node cache-buster.js

console.log('🧹 Forzando limpieza de caché...');

// Agregar timestamp para evitar caché
const timestamp = new Date().getTime();

// Crear archivo de fuerza limpieza
const fs = require('fs');
const path = require('path');

// Actualizar package.json con versión nueva
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
packageJson.version = `1.0.${timestamp}`;
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

console.log('✅ Timestamp agregado:', timestamp);
console.log('📦 Nueva versión:', packageJson.version);
console.log('');
console.log('🔄 Para aplicar los cambios:');
console.log('1. Ejecuta: npm run build');
console.log('2. Despliega manualmente a Netlify');
console.log('3. O espera a que termine el despliegue actual');
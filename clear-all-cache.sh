#!/bin/bash

echo "🧹 LIMPIANDO TODA LA CACHE DEL PROYECTO"
echo "======================================"

# 1. Limpiar cache de npm
echo "1. Limpiando cache de npm..."
npm cache clean --force

# 2. Eliminar node_modules
echo "2. Eliminando node_modules..."
rm -rf node_modules/

# 3. Eliminar package-lock.json
echo "3. Eliminando package-lock.json..."
rm -f package-lock.json

# 4. Limpiar cache de build
echo "4. Limpiando cache de build..."
rm -rf build/
rm -rf dist/
rm -rf .next/
rm -rf out/

# 5. Limpiar cache de desarrollo
echo "5. Limpiando cache de desarrollo..."
rm -rf .cache/
rm -rf .parcel-cache/
rm -rf .vite/
rm -rf .rollup.cache/

# 6. Limpiar cache de Docker
echo "6. Limpiando cache de Docker..."
docker system prune -f --volumes

# 7. Limpiar cache de Git LFS
echo "7. Limpiando cache de Git LFS..."
git lfs prune

# 8. Limpiar archivos temporales
echo "8. Limpiando archivos temporales..."
find . -name "*.tmp" -delete
find . -name "*.log" -delete
find . -name ".DS_Store" -delete
find . -name "Thumbs.db" -delete

# 9. Limpiar cache de ESLint
echo "9. Limpiando cache de ESLint..."
rm -rf .eslintcache

# 10. Limpiar cache de TypeScript
echo "10. Limpiando cache de TypeScript..."
rm -rf tsconfig.tsbuildinfo

# 11. Limpiar cache de Webpack
echo "11. Limpiando cache de Webpack..."
rm -rf node_modules/.cache/

echo "✅ CACHE LIMPIADA COMPLETAMENTE"
echo "======================================"
echo "Ahora puedes ejecutar:"
echo "npm install"
echo "npm start"
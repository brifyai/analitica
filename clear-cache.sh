#!/bin/bash
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

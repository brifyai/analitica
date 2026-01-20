#!/bin/bash

# Script de deployment manual para iMetrics
# Usar cuando Easypanel no puede hacer el build

set -e  # Exit on error

echo "🚀 Iniciando deployment manual de iMetrics..."
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
PROJECT_DIR="/etc/easypanel/projects/imetrics/imetrics/code"
IMAGE_NAME="easypanel/imetrics/imetrics"
CONTAINER_NAME="imetrics-imetrics"

echo -e "${BLUE}📁 Directorio del proyecto:${NC} $PROJECT_DIR"
echo -e "${BLUE}🐳 Imagen Docker:${NC} $IMAGE_NAME"
echo -e "${BLUE}📦 Contenedor:${NC} $CONTAINER_NAME"
echo ""

# Paso 1: Ir al directorio del proyecto
echo -e "${YELLOW}[1/7]${NC} Navegando al directorio del proyecto..."
cd $PROJECT_DIR || { echo -e "${RED}❌ Error: No se puede acceder al directorio${NC}"; exit 1; }
echo -e "${GREEN}✓ En directorio: $(pwd)${NC}"
echo ""

# Paso 2: Pull del código más reciente
echo -e "${YELLOW}[2/7]${NC} Obteniendo código más reciente de Git..."
git fetch origin
git reset --hard origin/main
echo -e "${GREEN}✓ Código actualizado${NC}"
echo ""

# Paso 3: Verificar que el fix está aplicado
echo -e "${YELLOW}[3/7]${NC} Verificando que el fix de analytics-proxy está aplicado..."
if grep -q "app.all('/api/analytics-proxy/\*'" server/index.js; then
    echo -e "${GREEN}✓ Fix de analytics-proxy confirmado${NC}"
else
    echo -e "${RED}❌ ADVERTENCIA: El fix no está aplicado correctamente${NC}"
    echo "Contenido actual:"
    grep "analytics-proxy" server/index.js || echo "No se encontró la línea"
fi
echo ""

# Paso 4: Limpiar recursos de Docker
echo -e "${YELLOW}[4/7]${NC} Limpiando recursos de Docker..."
docker system prune -f > /dev/null 2>&1 || true
echo -e "${GREEN}✓ Recursos limpiados${NC}"
echo ""

# Paso 5: Build de la imagen Docker
echo -e "${YELLOW}[5/7]${NC} Construyendo imagen Docker (esto puede tardar 5-10 minutos)..."
echo -e "${BLUE}Usando Dockerfile.simple para build más rápido...${NC}"

docker build \
  -f Dockerfile.simple \
  -t $IMAGE_NAME \
  --build-arg NODE_ENV=production \
  --build-arg REACT_APP_ENVIRONMENT=production \
  --build-arg PORT=3000 \
  --build-arg SERVER_PORT=3001 \
  --build-arg REACT_APP_DOMAIN=v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io \
  --build-arg REACT_APP_API_URL=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io \
  --build-arg REACT_APP_OAUTH_REDIRECT_URI=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback \
  --build-arg REACT_APP_GOOGLE_CLIENT_ID=777409222994-977fdhkb9lfrq7v363hlndulq8k98lgk.apps.googleusercontent.com \
  --build-arg REACT_APP_SUPABASE_URL=https://imetrics-supabase-imetrics.dsb9vm.easypanel.host \
  --build-arg REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE \
  --build-arg REACT_APP_GEMINI_API_KEY=AIzaSyBK8AJWK61OAYjzLSyRz74LxFJRBlt1OFo \
  --build-arg REACT_APP_YOUTUBE_API_KEY= \
  --build-arg REACT_APP_MEASUREMENT_ID= \
  . || { echo -e "${RED}❌ Error en el build${NC}"; exit 1; }

echo -e "${GREEN}✓ Imagen construida exitosamente${NC}"
echo ""

# Paso 6: Detener y eliminar contenedor anterior
echo -e "${YELLOW}[6/7]${NC} Deteniendo contenedor anterior..."
docker stop $CONTAINER_NAME > /dev/null 2>&1 || true
docker rm $CONTAINER_NAME > /dev/null 2>&1 || true
echo -e "${GREEN}✓ Contenedor anterior eliminado${NC}"
echo ""

# Paso 7: Iniciar nuevo contenedor
echo -e "${YELLOW}[7/7]${NC} Iniciando nuevo contenedor..."
docker run -d \
  --name $CONTAINER_NAME \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e REACT_APP_ENVIRONMENT=production \
  -e PORT=3000 \
  -e SERVER_PORT=3001 \
  -e REACT_APP_DOMAIN=v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io \
  -e REACT_APP_API_URL=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io \
  -e REACT_APP_OAUTH_REDIRECT_URI=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback \
  -e REACT_APP_GOOGLE_CLIENT_ID=777409222994-977fdhkb9lfrq7v363hlndulq8k98lgk.apps.googleusercontent.com \
  -e REACT_APP_SUPABASE_URL=https://imetrics-supabase-imetrics.dsb9vm.easypanel.host \
  -e REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE \
  -e REACT_APP_GEMINI_API_KEY=AIzaSyBK8AJWK61OAYjzLSyRz74LxFJRBlt1OFo \
  $IMAGE_NAME || { echo -e "${RED}❌ Error al iniciar contenedor${NC}"; exit 1; }

echo -e "${GREEN}✓ Contenedor iniciado${NC}"
echo ""

# Esperar 5 segundos
echo -e "${BLUE}⏳ Esperando 5 segundos para que el servidor inicie...${NC}"
sleep 5
echo ""

# Verificar logs
echo -e "${YELLOW}📋 Logs del contenedor (últimas 20 líneas):${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker logs --tail 20 $CONTAINER_NAME
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar estado
echo -e "${YELLOW}🔍 Verificando estado del contenedor...${NC}"
if docker ps | grep -q $CONTAINER_NAME; then
    echo -e "${GREEN}✅ Contenedor corriendo correctamente${NC}"
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ DEPLOYMENT EXITOSO${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BLUE}🌐 URL de la aplicación:${NC}"
    echo "   https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io"
    echo ""
    echo -e "${BLUE}📊 Comandos útiles:${NC}"
    echo "   Ver logs:      docker logs -f $CONTAINER_NAME"
    echo "   Reiniciar:     docker restart $CONTAINER_NAME"
    echo "   Detener:       docker stop $CONTAINER_NAME"
    echo "   Estado:        docker ps | grep imetrics"
    echo ""
else
    echo -e "${RED}❌ ERROR: El contenedor no está corriendo${NC}"
    echo ""
    echo "Revisa los logs completos con:"
    echo "  docker logs $CONTAINER_NAME"
    exit 1
fi

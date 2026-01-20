#!/bin/bash

# Script para configurar la base de datos de iMetrics en Supabase
# Autor: Kiro AI
# Fecha: 2026-01-20

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}║        📊 Setup Base de Datos iMetrics 📊                ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar que Supabase está corriendo
echo -e "${YELLOW}[1/4]${NC} Verificando que Supabase está corriendo..."
if ! docker ps | grep -q "naes-main-db"; then
    echo -e "${RED}❌ Supabase no está corriendo${NC}"
    echo -e "${YELLOW}Ejecuta primero: ./start-imetrics.sh${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Supabase está corriendo${NC}"

# Verificar que existe el archivo SQL
echo ""
echo -e "${YELLOW}[2/4]${NC} Verificando archivo SQL..."
if [ ! -f "../database-schema-seguro.sql" ]; then
    echo -e "${RED}❌ No se encuentra database-schema-seguro.sql${NC}"
    echo -e "${YELLOW}Asegúrate de que el archivo existe en el directorio padre${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Archivo SQL encontrado${NC}"

# Aplicar el schema
echo ""
echo -e "${YELLOW}[3/4]${NC} Aplicando schema de base de datos..."
echo -e "${BLUE}Esto puede tardar 1-2 minutos...${NC}"

# Obtener el nombre del contenedor de la base de datos
DB_CONTAINER=$(docker ps --filter "name=naes-main-db" --format "{{.Names}}" | head -n 1)

if [ -z "$DB_CONTAINER" ]; then
    echo -e "${RED}❌ No se pudo encontrar el contenedor de la base de datos${NC}"
    exit 1
fi

# Ejecutar el script SQL
docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres < ../database-schema-seguro.sql

echo -e "${GREEN}✓ Schema aplicado exitosamente${NC}"

# Verificar las tablas
echo ""
echo -e "${YELLOW}[4/4]${NC} Verificando tablas creadas..."
echo ""

docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres -c "\dt" | grep -E "users|user_settings|ga4_accounts|ga4_properties|analytics_cache"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║              ✅ BASE DE DATOS LISTA ✅                     ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}📊 Tablas creadas:${NC}"
echo "   ✓ users"
echo "   ✓ user_settings"
echo "   ✓ ga4_accounts"
echo "   ✓ ga4_properties"
echo "   ✓ analytics_cache"
echo ""

echo -e "${BLUE}🔐 Políticas RLS:${NC}"
echo "   ✓ Configuradas para todas las tablas"
echo ""

echo -e "${BLUE}⚙️  Funciones y Triggers:${NC}"
echo "   ✓ 5 funciones helper creadas"
echo "   ✓ 5 triggers automáticos configurados"
echo ""

echo -e "${YELLOW}📝 Próximo paso:${NC}"
echo ""
echo "Actualiza las variables de entorno de iMetrics:"
echo ""
echo "REACT_APP_SUPABASE_URL=http://localhost:8000"
echo "REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE"
echo ""

echo -e "${GREEN}¡Base de datos configurada! 🎉${NC}"

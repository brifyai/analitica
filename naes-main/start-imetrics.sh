#!/bin/bash

# Script de inicio rápido para Supabase + iMetrics
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
echo -e "${BLUE}║        🚀 Supabase Self-Hosted para iMetrics 🚀          ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: No se encuentra docker-compose.yml${NC}"
    echo -e "${YELLOW}Asegúrate de estar en el directorio naes-main${NC}"
    exit 1
fi

# Verificar que existe .env
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: No se encuentra el archivo .env${NC}"
    echo -e "${YELLOW}Copia .env.example a .env y configúralo${NC}"
    exit 1
fi

echo -e "${YELLOW}[1/5]${NC} Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker instalado${NC}"

echo ""
echo -e "${YELLOW}[2/5]${NC} Verificando Docker Compose..."
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose instalado${NC}"

echo ""
echo -e "${YELLOW}[3/5]${NC} Iniciando servicios de Supabase..."
echo -e "${BLUE}Esto puede tardar 2-5 minutos la primera vez...${NC}"
docker compose up -d

echo ""
echo -e "${YELLOW}[4/5]${NC} Esperando a que los servicios estén listos..."
sleep 10

echo ""
echo -e "${YELLOW}[5/5]${NC} Verificando estado de los servicios..."
docker compose ps

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║                  ✅ ¡TODO LISTO! ✅                        ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}📊 Supabase Studio (Dashboard):${NC}"
echo "   URL:      http://localhost:3000"
echo "   Usuario:  admin_imetrics"
echo "   Password: iMetrics2026!Secure"
echo ""

echo -e "${BLUE}🔌 API Gateway:${NC}"
echo "   URL:      http://localhost:8000"
echo "   ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
echo ""

echo -e "${BLUE}🗄️  PostgreSQL:${NC}"
echo "   Host:     localhost"
echo "   Port:     5432"
echo "   Database: postgres"
echo "   User:     postgres"
echo ""

echo -e "${YELLOW}📝 Próximos pasos:${NC}"
echo ""
echo "1. Abre Supabase Studio: http://localhost:3000"
echo "2. Ve a SQL Editor"
echo "3. Ejecuta el script: ../database-schema-seguro.sql"
echo "4. Actualiza las variables de entorno de iMetrics:"
echo "   REACT_APP_SUPABASE_URL=http://localhost:8000"
echo ""

echo -e "${BLUE}🛠️  Comandos útiles:${NC}"
echo "   Ver logs:      docker compose logs -f"
echo "   Reiniciar:     docker compose restart"
echo "   Detener:       docker compose down"
echo "   Estado:        docker compose ps"
echo ""

echo -e "${GREEN}¡Supabase está corriendo! 🎉${NC}"

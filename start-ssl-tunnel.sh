#!/bin/bash

# =============================================================================
# INICIADOR SSL TUNNEL - SOLUCIÓN DEFINITIVA HTTPS
# =============================================================================

echo "🔒 INICIANDO TÚNEL SSL - SOLUCIÓN HTTPS DEFINITIVA"
echo "=================================================="

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar si cloudflared está instalado
if ! command -v ./cloudflared &> /dev/null; then
    echo -e "${RED}❌ cloudflared no encontrado. Instalando...${NC}"
    
    # Detectar arquitectura
    ARCH=$(uname -m)
    OS=$(uname -s)
    
    case $ARCH in
        x86_64)
            ARCH="amd64"
            ;;
        arm64)
            ARCH="arm64"
            ;;
        aarch64)
            ARCH="arm64"
            ;;
        *)
            echo -e "${RED}❌ Arquitectura no soportada: $ARCH${NC}"
            exit 1
            ;;
    esac
    
    case $OS in
        Darwin)
            OS="darwin"
            ;;
        Linux)
            OS="linux"
            ;;
        *)
            echo -e "${RED}❌ Sistema operativo no soportado: $OS${NC}"
            exit 1
            ;;
    esac
    
    # Descargar cloudflared
    CLOUDFLARED_VERSION="2025.11.1"
    CLOUDFLARED_URL="https://github.com/cloudflare/cloudflared/releases/download/${CLOUDFLARED_VERSION}/cloudflared-${OS}-${ARCH}"
    
    echo -e "${BLUE}📥 Descargando cloudflared para ${OS}-${ARCH}...${NC}"
    curl -L -o cloudflared "$CLOUDFLARED_URL"
    chmod +x cloudflared
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ cloudflared instalado correctamente${NC}"
    else
        echo -e "${RED}❌ Error instalando cloudflared${NC}"
        exit 1
    fi
fi

# Verificar archivo de configuración
CONFIG_FILE="cloudflare-tunnel-config.yml"
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${YELLOW}⚠️  Creando configuración de túnel...${NC}"
    
    cat > "$CONFIG_FILE" << EOF
tunnel: tv-radio-ssl
credentials-file: tunnel-credentials.json

ingress:
  - hostname: tvradio.alegria.dev
    service: http://localhost:3001
  - hostname: v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
    service: http://localhost:3001
  - service: http_status:404
EOF
    
    echo -e "${GREEN}✅ Configuración creada: $CONFIG_FILE${NC}"
fi

# Función para mostrar URLs de acceso
show_access_urls() {
    echo ""
    echo "🌐 URLs DE ACCESO SSL:"
    echo "======================"
    echo -e "${GREEN}✅ Principal (Producción):${NC} https://tvradio.alegria.dev"
    echo -e "${GREEN}✅ Coolify Directo:${NC}     https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io"
    echo -e "${GREEN}✅ Local (Desarrollo):${NC}   https://localhost:3001"
    echo ""
    echo "🔗 URLs OAuth Callback:"
    echo "======================="
    echo -e "${BLUE}📱 Producción:${NC} https://tvradio.alegria.dev/callback"
    echo -e "${BLUE}🔧 Coolify:${NC}     https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback"
    echo -e "${BLUE}💻 Local:${NC}       https://localhost:3001/callback"
    echo ""
}

# Función para verificar estado del servidor
check_server_status() {
    echo -e "${BLUE}🔍 Verificando estado del servidor...${NC}"
    
    # Verificar servidor HTTPS local
    if curl -k -s https://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Servidor HTTPS local funcionando${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Servidor HTTPS local no responde, iniciando...${NC}"
        npm run server:https &
        SERVER_PID=$!
        sleep 3
        
        if curl -k -s https://localhost:3001/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Servidor HTTPS local iniciado correctamente${NC}"
            return 0
        else
            echo -e "${RED}❌ Error iniciando servidor HTTPS local${NC}"
            return 1
        fi
    fi
}

# Función para iniciar túnel
start_tunnel() {
    echo -e "${BLUE}🚀 Iniciando túnel SSL Cloudflare...${NC}"
    
    # Verificar si ya existe un túnel corriendo
    if pgrep -f "cloudflared tunnel" > /dev/null; then
        echo -e "${YELLOW}⚠️  Deteniendo túneles existentes...${NC}"
        pkill -f "cloudflared tunnel"
        sleep 2
    fi
    
    # Iniciar túnel en modo quick
    echo -e "${BLUE}🔗 Conectando a Cloudflare...${NC}"
    
    # Iniciar túnel para localhost:3001
    ./cloudflared tunnel --url https://localhost:3001 &
    TUNNEL_PID=$!
    
    echo -e "${GREEN}✅ Túnel iniciado (PID: $TUNNEL_PID)${NC}"
    
    # Esperar a que el túnel esté listo
    echo -e "${BLUE}⏳ Esperando a que el túnel esté listo...${NC}"
    sleep 5
    
    # Obtener URL del túnel
    TUNNEL_URL=$(curl -s http://localhost:2000/metrics | grep -o 'https://[^"]*trycloudflare.com' | head -1)
    
    if [ ! -z "$TUNNEL_URL" ]; then
        echo -e "${GREEN}✅ Túnel SSL establecido:${NC}"
        echo -e "${GREEN}   URL: $TUNNEL_URL${NC}"
        echo ""
        echo -e "${YELLOW}📋 CONFIGURACIÓN GOOGLE CLOUD CONSOLE:${NC}"
        echo -e "${BLUE}   Añadir este URI de redirección:${NC}"
        echo -e "${GREEN}   $TUNNEL_URL/callback${NC}"
        echo ""
    else
        echo -e "${YELLOW}⚠️  No se pudo obtener la URL del túnel, pero el proceso continúa${NC}"
    fi
    
    return 0
}

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [opción]"
    echo ""
    echo "Opciones:"
    echo "  start     Iniciar túnel SSL (por defecto)"
    echo "  stop      Detener túneles activos"
    echo "  status    Ver estado de los túneles"
    echo "  urls      Mostrar URLs de acceso"
    echo "  help      Mostrar esta ayuda"
    echo ""
}

# Función para detener túneles
stop_tunnel() {
    echo -e "${YELLOW}🛑 Deteniendo túneles SSL...${NC}"
    
    if pgrep -f "cloudflared tunnel" > /dev/null; then
        pkill -f "cloudflared tunnel"
        echo -e "${GREEN}✅ Túneles detenidos${NC}"
    else
        echo -e "${BLUE}ℹ️  No hay túneles activos${NC}"
    fi
    
    # Detener servidor HTTPS si es necesario
    if pgrep -f "server-coolify-https.js" > /dev/null; then
        pkill -f "server-coolify-https.js"
        echo -e "${GREEN}✅ Servidor HTTPS detenido${NC}"
    fi
}

# Función para verificar estado
check_status() {
    echo -e "${BLUE}📊 Estado de los servicios:${NC}"
    echo ""
    
    # Verificar túneles
    if pgrep -f "cloudflared tunnel" > /dev/null; then
        echo -e "${GREEN}✅ Túnel Cloudflare: ACTIVO${NC}"
        pgrep -f "cloudflared tunnel" | while read pid; do
            echo -e "${GREEN}   PID: $pid${NC}"
        done
    else
        echo -e "${RED}❌ Túnel Cloudflare: INACTIVO${NC}"
    fi
    
    # Verificar servidor HTTPS
    if pgrep -f "server-coolify-https.js" > /dev/null; then
        echo -e "${GREEN}✅ Servidor HTTPS: ACTIVO${NC}"
    else
        echo -e "${RED}❌ Servidor HTTPS: INACTIVO${NC}"
    fi
    
    echo ""
    show_access_urls
}

# Main script logic
case "${1:-start}" in
    "start")
        echo -e "${GREEN}🚀 INICIANDO SOLUCIÓN SSL COMPLETA${NC}"
        echo ""
        
        # Verificar servidor
        if check_server_status; then
            # Iniciar túnel
            if start_tunnel; then
                show_access_urls
                
                echo -e "${GREEN}🎉 SOLUCIÓN SSL ACTIVA Y FUNCIONAL${NC}"
                echo ""
                echo -e "${BLUE}📝 Próximos pasos:${NC}"
                echo "1. Configura los URIs en Google Cloud Console"
                echo "2. Prueba el flujo OAuth con las URLs HTTPS"
                echo "3. Verifica que todo funcione correctamente"
                echo ""
                echo -e "${YELLOW}💡 Para detener: $0 stop${NC}"
                echo -e "${YELLOW}💡 Para estado: $0 status${NC}"
                
                # Mantener el script corriendo
                echo -e "${BLUE}⏳ Manteniendo túnel activo... (Ctrl+C para detener)${NC}"
                wait
            else
                echo -e "${RED}❌ Error iniciando túnel SSL${NC}"
                exit 1
            fi
        else
            echo -e "${RED}❌ Error verificando servidor${NC}"
            exit 1
        fi
        ;;
    "stop")
        stop_tunnel
        ;;
    "status")
        check_status
        ;;
    "urls")
        show_access_urls
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Opción no reconocida: $1${NC}"
        show_help
        exit 1
        ;;
esac
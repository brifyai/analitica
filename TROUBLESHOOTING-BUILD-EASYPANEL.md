# 🔧 Troubleshooting Build en Easypanel

## ❌ Error: "Command was canceled" o "This operation was aborted"

### Causas Comunes
1. **Timeout del build** - El build tarda demasiado
2. **Falta de memoria** - El servidor no tiene suficiente RAM
3. **Falta de espacio en disco** - El servidor está lleno
4. **Problemas de red** - npm no puede descargar paquetes
5. **Build cancelado manualmente** - Alguien canceló el build

---

## ✅ SOLUCIONES

### Solución 1: Usar Dockerfile Simplificado (Más Rápido)

1. En Easypanel, ve a tu servicio iMetrics
2. En "Build Settings" o "Configuration"
3. Cambia el Dockerfile de:
   ```
   Dockerfile
   ```
   a:
   ```
   Dockerfile.simple
   ```
4. Guarda y haz rebuild

**Ventaja:** Build más rápido (menos layers, menos pasos)

---

### Solución 2: Aumentar Timeout del Build

1. En Easypanel, ve a "Settings" del servicio
2. Busca "Build Timeout" o similar
3. Aumenta de 10 minutos a 20 minutos
4. Guarda y haz rebuild

---

### Solución 3: Limpiar Caché de Docker

1. En Easypanel, ve a "Advanced" o "Settings"
2. Busca "Clear Build Cache" o "Clean Docker Cache"
3. Haz clic en limpiar
4. Espera 1 minuto
5. Intenta rebuild de nuevo

**O por SSH:**
```bash
docker system prune -af
docker builder prune -af
```

---

### Solución 4: Verificar Recursos del Servidor

**Por SSH:**
```bash
# Ver memoria disponible
free -h

# Ver espacio en disco
df -h

# Ver procesos que consumen memoria
top
```

**Mínimo recomendado:**
- RAM: 2GB libre
- Disco: 5GB libre
- CPU: 2 cores

---

### Solución 5: Build Manual (Si todo falla)

Si Easypanel no puede hacer el build, hazlo manualmente:

```bash
# 1. Conectar por SSH al servidor
ssh usuario@tu-servidor

# 2. Ir al directorio del proyecto
cd /etc/easypanel/projects/imetrics/imetrics/code/

# 3. Pull del código más reciente
git pull origin main

# 4. Build manual
docker build -t easypanel/imetrics/imetrics -f Dockerfile.simple .

# 5. Reiniciar el contenedor
docker restart imetrics-imetrics
```

---

## 🚀 SOLUCIÓN RÁPIDA (Recomendada)

### Opción A: Deploy desde GitHub Actions (Automático)

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Easypanel

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Easypanel
        run: |
          curl -X POST ${{ secrets.EASYPANEL_WEBHOOK_URL }}
```

### Opción B: Webhook Manual

1. En Easypanel, copia el "Deploy Webhook URL"
2. Cada vez que hagas push a Git, llama al webhook:
   ```bash
   curl -X POST https://tu-easypanel.com/webhook/deploy/imetrics
   ```

---

## 📊 Verificar Estado del Build

### En Easypanel UI:
1. Ve a "Logs" del servicio
2. Busca errores específicos
3. Anota el paso donde falla

### Por SSH:
```bash
# Ver logs del build
docker logs easypanel-builder-imetrics

# Ver logs del contenedor
docker logs imetrics-imetrics

# Ver estado de contenedores
docker ps -a | grep imetrics
```

---

## 🔍 Errores Comunes y Soluciones

### Error: "npm ERR! network"
**Solución:** Problema de red, intenta de nuevo en 5 minutos

### Error: "ENOSPC: no space left on device"
**Solución:** Limpia espacio en disco
```bash
docker system prune -af
rm -rf /tmp/*
```

### Error: "Killed" durante npm install
**Solución:** Falta de memoria, aumenta RAM o usa swap
```bash
# Crear swap de 2GB
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Error: "Cannot find module"
**Solución:** Limpia node_modules y reinstala
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ Checklist Pre-Build

Antes de intentar rebuild, verifica:

- [ ] Git tiene los últimos cambios (commit 303da7d o superior)
- [ ] Hay al menos 2GB de RAM libre
- [ ] Hay al menos 5GB de disco libre
- [ ] El servidor tiene conexión a internet
- [ ] No hay otros builds corriendo
- [ ] Las variables de entorno están configuradas

---

## 🆘 Si Nada Funciona

### Plan B: Deploy en Otro Servicio

Si Easypanel sigue fallando, considera:

1. **Netlify** - Gratis, fácil, rápido
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

2. **Vercel** - Gratis, automático
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Railway** - Fácil, con Docker
   - Conecta tu repo de GitHub
   - Railway hace el build automáticamente

4. **Render** - Gratis, con Docker
   - Conecta tu repo de GitHub
   - Render hace el build automáticamente

---

## 📝 Información para Soporte

Si necesitas contactar soporte de Easypanel, proporciona:

1. **Logs del build** (copia completa)
2. **Comando que falló** (el que aparece en el error)
3. **Recursos del servidor:**
   ```bash
   free -h
   df -h
   docker info
   ```
4. **Versión de Docker:**
   ```bash
   docker --version
   ```

---

## 🎯 Resumen

**Problema:** Build cancelado en Easypanel
**Causa más probable:** Timeout o falta de recursos
**Solución más rápida:** Usar `Dockerfile.simple` y limpiar caché
**Tiempo estimado:** 5-10 minutos


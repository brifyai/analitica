# 🚀 Deployment Manual - Instrucciones

## ⚠️ CUÁNDO USAR ESTO

Usa este método cuando:
- ✅ Easypanel no puede completar el build (se cancela)
- ✅ Tienes acceso SSH al servidor
- ✅ Necesitas deployar AHORA (5-10 minutos)

---

## 📋 REQUISITOS

1. Acceso SSH al servidor de Easypanel
2. Permisos de root o sudo
3. Git instalado en el servidor
4. Docker instalado en el servidor

---

## 🚀 MÉTODO 1: Script Automático (Recomendado)

### Paso 1: Subir el script al servidor

Desde tu máquina local:

```bash
# Copiar el script al servidor
scp deploy-manual.sh usuario@tu-servidor:/tmp/

# O si prefieres, descargarlo directamente en el servidor:
ssh usuario@tu-servidor
cd /tmp
curl -O https://raw.githubusercontent.com/brifyai/analitica/main/deploy-manual.sh
```

### Paso 2: Ejecutar el script

```bash
# Conectar al servidor
ssh usuario@tu-servidor

# Dar permisos de ejecución
chmod +x /tmp/deploy-manual.sh

# Ejecutar el script
sudo /tmp/deploy-manual.sh
```

El script hará TODO automáticamente:
1. ✅ Pull del código más reciente
2. ✅ Verificar que el fix está aplicado
3. ✅ Limpiar recursos de Docker
4. ✅ Build de la imagen
5. ✅ Detener contenedor anterior
6. ✅ Iniciar nuevo contenedor
7. ✅ Verificar que funciona

**Tiempo estimado:** 5-10 minutos

---

## 🚀 MÉTODO 2: Comandos Manuales (Paso a Paso)

Si prefieres hacerlo manualmente:

### Paso 1: Conectar al servidor

```bash
ssh usuario@tu-servidor
```

### Paso 2: Ir al directorio del proyecto

```bash
cd /etc/easypanel/projects/imetrics/imetrics/code/
```

### Paso 3: Pull del código más reciente

```bash
git fetch origin
git reset --hard origin/main
```

### Paso 4: Verificar el fix

```bash
grep "analytics-proxy" server/index.js
# Debe mostrar: app.all('/api/analytics-proxy/*', ...
```

### Paso 5: Limpiar Docker

```bash
docker system prune -f
```

### Paso 6: Build de la imagen

```bash
docker build \
  -f Dockerfile.simple \
  -t easypanel/imetrics/imetrics \
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
  .
```

**Nota:** Este paso tarda 5-10 minutos. Verás el progreso del build.

### Paso 7: Detener contenedor anterior

```bash
docker stop imetrics-imetrics
docker rm imetrics-imetrics
```

### Paso 8: Iniciar nuevo contenedor

```bash
docker run -d \
  --name imetrics-imetrics \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e REACT_APP_ENVIRONMENT=production \
  -e PORT=3000 \
  easypanel/imetrics/imetrics
```

### Paso 9: Verificar logs

```bash
docker logs -f imetrics-imetrics
```

Debes ver:
```
✓ Servidor corriendo en puerto 3000
✓ Sin errores de PathError
```

Presiona `Ctrl+C` para salir de los logs.

---

## ✅ VERIFICACIÓN

### 1. Verificar que el contenedor está corriendo

```bash
docker ps | grep imetrics
```

Debe mostrar el contenedor corriendo.

### 2. Verificar que la app responde

```bash
curl http://localhost:3000/api/health
```

Debe responder: `{"status":"ok"}`

### 3. Verificar desde el navegador

Abre: https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io

La aplicación debe cargar sin errores.

---

## 🔍 TROUBLESHOOTING

### El build falla con "no space left on device"

```bash
# Limpiar más agresivamente
docker system prune -af --volumes
rm -rf /tmp/*
df -h  # Verificar espacio disponible
```

### El build falla con "Killed"

Falta de memoria. Crear swap:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### El contenedor no inicia

Ver logs completos:

```bash
docker logs imetrics-imetrics
```

### El contenedor inicia pero la app no responde

Verificar que el puerto está expuesto:

```bash
docker port imetrics-imetrics
netstat -tulpn | grep 3000
```

---

## 📊 COMANDOS ÚTILES POST-DEPLOY

```bash
# Ver logs en tiempo real
docker logs -f imetrics-imetrics

# Ver últimas 50 líneas de logs
docker logs --tail 50 imetrics-imetrics

# Reiniciar el contenedor
docker restart imetrics-imetrics

# Detener el contenedor
docker stop imetrics-imetrics

# Ver estado de todos los contenedores
docker ps -a

# Ver uso de recursos
docker stats imetrics-imetrics

# Entrar al contenedor (debug)
docker exec -it imetrics-imetrics sh
```

---

## 🎯 RESUMEN

**Método más rápido:** Usar el script `deploy-manual.sh`

**Tiempo total:** 5-10 minutos

**Ventajas:**
- ✅ No depende de Easypanel UI
- ✅ Control total del proceso
- ✅ Más rápido que esperar a que Easypanel funcione
- ✅ Puedes ver exactamente qué está pasando

**Desventajas:**
- ❌ Requiere acceso SSH
- ❌ Manual (no automático en cada push)

---

## 🔄 VOLVER A EASYPANEL DESPUÉS

Una vez que funcione, puedes:

1. Configurar Easypanel para usar `Dockerfile.simple`
2. Aumentar el timeout de build en Easypanel
3. Limpiar caché de build en Easypanel
4. Intentar rebuild desde Easypanel UI

Pero mientras tanto, este método te permite deployar AHORA.


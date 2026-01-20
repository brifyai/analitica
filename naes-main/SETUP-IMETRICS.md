# 🚀 Setup Supabase Self-Hosted para iMetrics

## 📋 Requisitos Previos

- Docker y Docker Compose instalados
- Al menos 4GB de RAM disponible
- Al menos 10GB de espacio en disco
- Puerto 8000 disponible (o cambiar en .env)

---

## 🔧 Instalación

### Paso 1: Verificar que estás en el directorio correcto

```bash
cd naes-main
ls -la
# Debes ver: docker-compose.yml, .env, README.md
```

### Paso 2: Iniciar Supabase

```bash
# Iniciar todos los servicios
docker compose up -d

# Ver logs
docker compose logs -f
```

**Tiempo estimado:** 2-5 minutos para descargar imágenes y iniciar servicios

### Paso 3: Verificar que los servicios están corriendo

```bash
docker compose ps
```

Debes ver todos los servicios en estado "Up":
- supabase-db
- supabase-auth
- supabase-rest
- supabase-realtime
- supabase-storage
- supabase-studio
- supabase-kong
- etc.

---

## 🌐 Acceder a los Servicios

### Supabase Studio (Dashboard)
- **URL:** http://localhost:3000
- **Usuario:** `admin_imetrics`
- **Password:** `iMetrics2026!Secure`

### API Gateway (Kong)
- **URL:** http://localhost:8000
- **ANON_KEY:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE`

### PostgreSQL Database
- **Host:** localhost
- **Port:** 5432
- **Database:** postgres
- **User:** postgres
- **Password:** `pF97/E2anWQwtWJxhKB7T3IbSBT3ooQspIT5CU1ww/VY=`

---

## 📊 Crear el Schema de iMetrics

### Opción 1: Desde Supabase Studio

1. Abre http://localhost:3000
2. Login con las credenciales
3. Ve a "SQL Editor"
4. Copia y pega el contenido de `../database-schema-seguro.sql`
5. Ejecuta el script

### Opción 2: Desde la línea de comandos

```bash
# Desde el directorio raíz del proyecto (no naes-main)
cd ..

# Ejecutar el script SQL
docker exec -i naes-main-db-1 psql -U postgres -d postgres < database-schema-seguro.sql

# Verificar que las tablas se crearon
docker exec -i naes-main-db-1 psql -U postgres -d postgres < verificar-base-de-datos-supabase.sql
```

---

## 🔄 Actualizar Variables de Entorno de iMetrics

Ahora que Supabase está corriendo localmente, actualiza las variables de entorno de tu aplicación iMetrics:

### En `.env` (desarrollo local)

```bash
REACT_APP_SUPABASE_URL=http://localhost:8000
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE
```

### En Easypanel (producción)

Si quieres usar este Supabase en producción, necesitas:

1. **Exponer Supabase a internet** (configurar reverse proxy con Nginx o Caddy)
2. **Actualizar las URLs** en `.env` de naes-main:
   ```
   SITE_URL=https://tu-dominio.com
   API_EXTERNAL_URL=https://supabase.tu-dominio.com
   SUPABASE_PUBLIC_URL=https://supabase.tu-dominio.com
   ```
3. **Actualizar variables en iMetrics:**
   ```
   REACT_APP_SUPABASE_URL=https://supabase.tu-dominio.com
   ```

---

## 🔍 Verificación

### 1. Verificar que la API responde

```bash
curl http://localhost:8000/rest/v1/
# Debe responder con información de la API
```

### 2. Verificar que Auth funciona

```bash
curl http://localhost:8000/auth/v1/health
# Debe responder: {"status":"ok"}
```

### 3. Verificar que las tablas existen

```bash
docker exec -i naes-main-db-1 psql -U postgres -d postgres -c "\dt"
# Debe mostrar: users, user_settings, ga4_accounts, ga4_properties, analytics_cache
```

---

## 🛠️ Comandos Útiles

### Ver logs de todos los servicios
```bash
docker compose logs -f
```

### Ver logs de un servicio específico
```bash
docker compose logs -f auth
docker compose logs -f db
docker compose logs -f studio
```

### Reiniciar todos los servicios
```bash
docker compose restart
```

### Detener todos los servicios
```bash
docker compose down
```

### Detener y eliminar volúmenes (CUIDADO: borra datos)
```bash
docker compose down -v
```

### Ver estado de los servicios
```bash
docker compose ps
```

### Entrar a la base de datos
```bash
docker exec -it naes-main-db-1 psql -U postgres -d postgres
```

---

## 🔐 Configurar Google OAuth

Para que Google OAuth funcione con este Supabase:

### 1. Actualizar Google Cloud Console

Ve a https://console.cloud.google.com/apis/credentials

Agrega estas URIs de redireccionamiento:

**Para desarrollo local:**
```
http://localhost:8000/auth/v1/callback
```

**Para producción (si expones a internet):**
```
https://supabase.tu-dominio.com/auth/v1/callback
```

### 2. Verificar configuración en .env

El archivo `.env` ya tiene configurado:
```
GOTRUE_EXTERNAL_GOOGLE_ENABLED=true
GOTRUE_EXTERNAL_GOOGLE_CLIENT_ID=[TU_GOOGLE_CLIENT_ID]
GOTRUE_EXTERNAL_GOOGLE_SECRET=[TU_GOOGLE_CLIENT_SECRET]
GOTRUE_EXTERNAL_GOOGLE_REDIRECT_URI=http://localhost:8000/auth/v1/callback
```

**Nota:** Los valores reales están en el archivo `.env` que no se sube a Git.

### 3. Reiniciar el servicio de Auth

```bash
docker compose restart auth
```

---

## 📈 Monitoreo

### Ver uso de recursos

```bash
docker stats
```

### Ver espacio usado

```bash
docker system df
```

### Backup de la base de datos

```bash
docker exec naes-main-db-1 pg_dump -U postgres postgres > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurar backup

```bash
docker exec -i naes-main-db-1 psql -U postgres postgres < backup_20260120_150000.sql
```

---

## 🚀 Deployment en Producción

### Opción 1: Mismo servidor que iMetrics

Si quieres correr Supabase en el mismo servidor de Easypanel:

1. Sube la carpeta `naes-main` al servidor
2. Actualiza las URLs en `.env`
3. Configura un reverse proxy (Nginx/Caddy)
4. Ejecuta `docker compose up -d`

### Opción 2: Servidor dedicado

1. Crea un servidor nuevo (DigitalOcean, Linode, etc.)
2. Instala Docker y Docker Compose
3. Sube la carpeta `naes-main`
4. Configura DNS para apuntar a este servidor
5. Configura SSL con Let's Encrypt
6. Ejecuta `docker compose up -d`

---

## 🆘 Troubleshooting

### Los servicios no inician

```bash
# Ver logs de error
docker compose logs

# Verificar puertos disponibles
netstat -tulpn | grep 8000
netstat -tulpn | grep 5432
```

### Error de memoria

Aumenta la memoria disponible para Docker o reduce servicios:

```bash
# Editar docker-compose.yml y comentar servicios no esenciales
# Por ejemplo: imgproxy, logflare, vector
```

### No puedo conectar a la base de datos

```bash
# Verificar que el contenedor está corriendo
docker ps | grep db

# Ver logs de la base de datos
docker compose logs db

# Verificar password
echo $POSTGRES_PASSWORD
```

---

## ✅ Ventajas de Self-Hosted

- ✅ Control total de tus datos
- ✅ Sin límites de API calls
- ✅ Sin costos por uso
- ✅ Personalización completa
- ✅ Mejor para cumplimiento (GDPR, etc.)

## ❌ Desventajas

- ❌ Requiere mantenimiento
- ❌ Necesitas gestionar backups
- ❌ Necesitas gestionar actualizaciones
- ❌ Requiere más recursos de servidor

---

## 📚 Recursos

- [Documentación oficial](https://supabase.com/docs/guides/self-hosting/docker)
- [GitHub de Supabase](https://github.com/supabase/supabase)
- [Discord de Supabase](https://discord.supabase.com)


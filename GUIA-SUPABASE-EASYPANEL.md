# 🚀 Guía de Configuración Supabase en Easypanel - iMetrics

## 📋 Resumen

Esta guía te ayudará a configurar correctamente Supabase en Easypanel para iMetrics.

---

## 🔐 Paso 1: Generar Secrets Seguros

Antes de configurar, necesitas generar contraseñas y secrets seguros.

### Opción A: Usando OpenSSL (Recomendado)

```bash
# Generar POSTGRES_PASSWORD
openssl rand -base64 32

# Generar JWT_SECRET
openssl rand -base64 32

# Generar SECRET_KEY_BASE
openssl rand -base64 32

# Generar VAULT_ENC_KEY
openssl rand -base64 32

# Generar PG_META_CRYPTO_KEY
openssl rand -base64 32
```

### Opción B: Generador Online

Usa: https://generate-secret.vercel.app/32

---

## ⚙️ Paso 2: Configurar Variables de Entorno en Easypanel

### 2.1 Acceder a tu Supabase en Easypanel

1. Ve a tu panel de Easypanel
2. Selecciona tu servicio de Supabase
3. Ve a la sección "Environment Variables" o "Variables de Entorno"

### 2.2 Variables CRÍTICAS (Cambiar obligatoriamente)

Copia estas variables y reemplaza los valores:

```env
# Secrets de Seguridad
POSTGRES_PASSWORD=PEGAR_AQUI_PASSWORD_GENERADO
JWT_SECRET=PEGAR_AQUI_JWT_SECRET_GENERADO
SECRET_KEY_BASE=PEGAR_AQUI_SECRET_KEY_BASE_GENERADO
VAULT_ENC_KEY=PEGAR_AQUI_VAULT_ENC_KEY_GENERADO
PG_META_CRYPTO_KEY=PEGAR_AQUI_PG_META_CRYPTO_KEY_GENERADO

# Dashboard
DASHBOARD_USERNAME=admin_imetrics
DASHBOARD_PASSWORD=PEGAR_AQUI_PASSWORD_DASHBOARD_SEGURO
```

### 2.3 Variables de URLs (Ajustar a tu dominio)

```env
# URL de tu aplicación iMetrics
SITE_URL=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io

# URLs de redirección permitidas
ADDITIONAL_REDIRECT_URLS=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback,http://localhost:3000/callback

# URL pública de Supabase
API_EXTERNAL_URL=https://imetrics-supabase-imetrics.dsb9vm.easypanel.host
SUPABASE_PUBLIC_URL=https://imetrics-supabase-imetrics.dsb9vm.easypanel.host

# Site URL para GoTrue
GOTRUE_SITE_URL=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io

# URLs permitidas (con wildcard)
GOTRUE_URI_ALLOW_LIST=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/**,http://localhost:3000/**
```

### 2.4 Variables de Google OAuth

```env
GOTRUE_EXTERNAL_GOOGLE_ENABLED=true
GOTRUE_EXTERNAL_GOOGLE_CLIENT_ID=TU_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOTRUE_EXTERNAL_GOOGLE_SECRET=TU_GOOGLE_CLIENT_SECRET
GOTRUE_EXTERNAL_GOOGLE_REDIRECT_URI=https://imetrics-supabase-imetrics.dsb9vm.easypanel.host/auth/v1/callback
```

**IMPORTANTE**: 
- Obtén Client ID y Secret de Google Cloud Console
- En Google Cloud, agrega esta redirect URI: `https://imetrics-supabase-imetrics.dsb9vm.easypanel.host/auth/v1/callback`

### 2.5 Variables de Email (SMTP)

Para que funcione el registro por email:

```env
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=false

# Configuración SMTP (ejemplo con Gmail)
SMTP_ADMIN_EMAIL=tu-email@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password-de-gmail
SMTP_SENDER_NAME=iMetrics
```

**Para Gmail:**
1. Ve a https://myaccount.google.com/apppasswords
2. Genera una "App Password"
3. Usa esa contraseña en `SMTP_PASS`

### 2.6 Variables que NO necesitas cambiar

Estas variables ya están correctas:

```env
# Database
POSTGRES_HOST=db
POSTGRES_DB=postgres
POSTGRES_PORT=5432

# Pooler
POOLER_PROXY_PORT_TRANSACTION=6543
POOLER_DEFAULT_POOL_SIZE=20
POOLER_MAX_CLIENT_CONN=100
POOLER_TENANT_ID=imetrics-tenant
POOLER_DB_POOL_SIZE=5

# Kong
KONG_HTTP_PORT=8000
KONG_HTTPS_PORT=8443

# PostgREST
PGRST_DB_SCHEMAS=public,storage,graphql_public

# Auth
JWT_EXPIRY=3600
DISABLE_SIGNUP=false

# Phone Auth (deshabilitado)
ENABLE_PHONE_SIGNUP=false
ENABLE_PHONE_AUTOCONFIRM=false

# Anonymous Users (deshabilitado)
ENABLE_ANONYMOUS_USERS=false

# Studio
STUDIO_DEFAULT_ORGANIZATION=iMetrics
STUDIO_DEFAULT_PROJECT=iMetrics Production
SUPABASE_URL=http://kong:8000
STUDIO_PG_META_URL=http://meta:8080
IMGPROXY_ENABLE_WEBP_DETECTION=true

# Functions
FUNCTIONS_VERIFY_JWT=false

# Docker
DOCKER_SOCKET_LOCATION=/var/run/docker.sock
```

---

## 🔑 Paso 3: Configurar Google OAuth en Google Cloud Console

### 3.1 Agregar Redirect URI en Google Cloud

1. Ve a https://console.cloud.google.com/apis/credentials
2. Selecciona tu OAuth 2.0 Client ID
3. En "URIs de redireccionamiento autorizados", agrega:

```
https://imetrics-supabase-imetrics.dsb9vm.easypanel.host/auth/v1/callback
```

4. Guarda los cambios

### 3.2 Copiar Credenciales

1. Copia el **Client ID**
2. Copia el **Client Secret**
3. Pégalos en las variables de entorno de Easypanel:
   - `GOTRUE_EXTERNAL_GOOGLE_CLIENT_ID`
   - `GOTRUE_EXTERNAL_GOOGLE_SECRET`

---

## 🔄 Paso 4: Reiniciar Supabase

Después de configurar todas las variables:

1. En Easypanel, ve a tu servicio de Supabase
2. Haz clic en "Restart" o "Redeploy"
3. Espera a que el servicio se reinicie (2-3 minutos)

---

## ✅ Paso 5: Verificar la Configuración

### 5.1 Verificar Dashboard de Supabase

1. Abre: `https://imetrics-supabase-imetrics.dsb9vm.easypanel.host`
2. Inicia sesión con:
   - Usuario: `admin_imetrics` (o el que configuraste)
   - Contraseña: La que configuraste en `DASHBOARD_PASSWORD`

### 5.2 Verificar Google OAuth

1. Ve a "Authentication" > "Providers" en el dashboard
2. Deberías ver "Google" habilitado
3. Verifica que el Client ID esté configurado

### 5.3 Probar desde tu App

1. Abre tu aplicación iMetrics
2. Intenta registrarte con Google
3. Debería funcionar correctamente

---

## 🆘 Solución de Problemas

### Error: "Invalid login credentials"

**Causa**: Contraseña del dashboard incorrecta

**Solución**:
1. Verifica `DASHBOARD_PASSWORD` en variables de entorno
2. Reinicia Supabase
3. Espera 2-3 minutos

### Error: "redirect_uri_mismatch" en Google OAuth

**Causa**: La redirect URI no está configurada en Google Cloud

**Solución**:
1. Ve a Google Cloud Console > Credenciales
2. Agrega exactamente: `https://imetrics-supabase-imetrics.dsb9vm.easypanel.host/auth/v1/callback`
3. Espera 5 minutos

### Error: "Email not confirmed"

**Causa**: SMTP no configurado o `ENABLE_EMAIL_AUTOCONFIRM=false`

**Solución A** (Desarrollo):
```env
ENABLE_EMAIL_AUTOCONFIRM=true
```

**Solución B** (Producción):
- Configura SMTP correctamente
- Los usuarios recibirán email de confirmación

### Error: "Invalid JWT"

**Causa**: JWT_SECRET no coincide con ANON_KEY

**Solución**:
1. Genera nuevos tokens en: https://supabase.com/docs/guides/self-hosting#api-keys
2. Actualiza `JWT_SECRET`, `ANON_KEY` y `SERVICE_ROLE_KEY`
3. Reinicia Supabase

---

## 📊 Resumen de URLs Importantes

```
Dashboard Supabase:
https://imetrics-supabase-imetrics.dsb9vm.easypanel.host

API URL (para tu app):
https://imetrics-supabase-imetrics.dsb9vm.easypanel.host

Auth Callback (Google OAuth):
https://imetrics-supabase-imetrics.dsb9vm.easypanel.host/auth/v1/callback

Tu App iMetrics:
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io

Callback de tu App:
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
```

---

## 🔐 Checklist de Seguridad

Antes de ir a producción:

- [ ] Cambiaste `POSTGRES_PASSWORD`
- [ ] Cambiaste `JWT_SECRET`
- [ ] Cambiaste `SECRET_KEY_BASE`
- [ ] Cambiaste `VAULT_ENC_KEY`
- [ ] Cambiaste `PG_META_CRYPTO_KEY`
- [ ] Cambiaste `DASHBOARD_PASSWORD`
- [ ] Configuraste SMTP con credenciales reales
- [ ] Configuraste Google OAuth con Client ID y Secret reales
- [ ] Agregaste redirect URI en Google Cloud Console
- [ ] Probaste el login con Google
- [ ] Probaste el registro por email

---

## 📝 Archivo de Referencia

Usa el archivo `supabase-easypanel-imetrics.env` como referencia completa de todas las variables.

---

**Última actualización**: Enero 2026  
**Versión**: 1.0

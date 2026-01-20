# 📝 Instrucciones para Configurar Variables de Supabase

## 🎯 Archivo: SUPABASE-VARIABLES-COMPLETAS.txt

Este archivo contiene TODAS las variables necesarias para Supabase en Easypanel.

---

## ⚠️ VALORES QUE DEBES CAMBIAR OBLIGATORIAMENTE

### 1. Secrets de Seguridad (Generar con OpenSSL)

Ejecuta estos comandos para generar valores seguros:

```bash
# Generar 5 secrets diferentes
openssl rand -base64 32
openssl rand -base64 32
openssl rand -base64 32
openssl rand -base64 32
openssl rand -base64 32
```

Luego reemplaza en el archivo:

```
POSTGRES_PASSWORD=PEGAR_PRIMER_SECRET_AQUI
JWT_SECRET=PEGAR_SEGUNDO_SECRET_AQUI
SECRET_KEY_BASE=PEGAR_TERCER_SECRET_AQUI
VAULT_ENC_KEY=PEGAR_CUARTO_SECRET_AQUI
PG_META_CRYPTO_KEY=PEGAR_QUINTO_SECRET_AQUI
```

### 2. Dashboard Password

Elige una contraseña segura para acceder al dashboard de Supabase:

```
DASHBOARD_PASSWORD=TU_PASSWORD_SEGURO_AQUI
```

### 3. Google OAuth (De Google Cloud Console)

Obtén estos valores de https://console.cloud.google.com/apis/credentials

```
GOTRUE_EXTERNAL_GOOGLE_CLIENT_ID=TU_CLIENT_ID.apps.googleusercontent.com
GOTRUE_EXTERNAL_GOOGLE_SECRET=TU_CLIENT_SECRET
```

### 4. SMTP (Para envío de emails)

Si usas Gmail:

```
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password-de-gmail
```

**Cómo obtener App Password de Gmail:**
1. Ve a https://myaccount.google.com/apppasswords
2. Genera una contraseña de aplicación
3. Úsala en `SMTP_PASS`

---

## ✅ VALORES QUE YA ESTÁN CORRECTOS

Estos valores NO necesitas cambiarlos:

```
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
POSTGRES_HOST=db
POSTGRES_DB=postgres
POSTGRES_PORT=5432
POOLER_PROXY_PORT_TRANSACTION=6543
POOLER_DEFAULT_POOL_SIZE=20
POOLER_MAX_CLIENT_CONN=100
POOLER_TENANT_ID=imetrics-tenant
POOLER_DB_POOL_SIZE=5
KONG_HTTP_PORT=8000
KONG_HTTPS_PORT=8443
PGRST_DB_SCHEMAS=public,storage,graphql_public
SITE_URL=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
ADDITIONAL_REDIRECT_URLS=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback,http://localhost:3000/callback
API_EXTERNAL_URL=https://imetrics-supabase-imetrics.dsb9vm.easypanel.host
JWT_EXPIRY=3600
DISABLE_SIGNUP=false
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=false
SMTP_ADMIN_EMAIL=admin@imetrics.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SENDER_NAME=iMetrics
MAILER_URLPATHS_CONFIRMATION=/auth/v1/verify
MAILER_URLPATHS_INVITE=/auth/v1/verify
MAILER_URLPATHS_RECOVERY=/auth/v1/verify
MAILER_URLPATHS_EMAIL_CHANGE=/auth/v1/verify
GOTRUE_EXTERNAL_GOOGLE_ENABLED=true
GOTRUE_EXTERNAL_GOOGLE_REDIRECT_URI=https://imetrics-supabase-imetrics.dsb9vm.easypanel.host/auth/v1/callback
GOTRUE_SITE_URL=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
GOTRUE_URI_ALLOW_LIST=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/**,http://localhost:3000/**
ENABLE_PHONE_SIGNUP=false
ENABLE_PHONE_AUTOCONFIRM=false
ENABLE_ANONYMOUS_USERS=false
STUDIO_DEFAULT_ORGANIZATION=iMetrics
STUDIO_DEFAULT_PROJECT=iMetrics Production
SUPABASE_PUBLIC_URL=https://imetrics-supabase-imetrics.dsb9vm.easypanel.host
SUPABASE_URL=http://kong:8000
STUDIO_PG_META_URL=http://meta:8080
IMGPROXY_ENABLE_WEBP_DETECTION=true
FUNCTIONS_VERIFY_JWT=false
DOCKER_SOCKET_LOCATION=/var/run/docker.sock
```

---

## 🚀 Pasos para Aplicar

### 1. Generar Secrets

```bash
# Ejecuta 5 veces y guarda cada resultado
openssl rand -base64 32
```

### 2. Editar el Archivo

1. Abre `SUPABASE-VARIABLES-COMPLETAS.txt`
2. Busca y reemplaza:
   - `CAMBIAR_POR_PASSWORD_SEGURO_MIN_32_CARACTERES`
   - `CAMBIAR_POR_JWT_SECRET_MIN_32_CARACTERES`
   - `CAMBIAR_POR_PASSWORD_DASHBOARD_SEGURO`
   - `CAMBIAR_POR_SECRET_KEY_BASE_32_CHARS_MIN`
   - `CAMBIAR_POR_ENCRYPTION_KEY_32_CHARS`
   - `CAMBIAR_POR_CRYPTO_KEY_32_CHARS_MIN`
   - `TU_GOOGLE_CLIENT_ID.apps.googleusercontent.com`
   - `TU_GOOGLE_CLIENT_SECRET`
   - `tu-email@gmail.com`
   - `tu-password-de-aplicacion-gmail`

### 3. Copiar a Easypanel

1. Selecciona TODO el contenido del archivo editado
2. Copia (Ctrl+A, Ctrl+C)
3. Ve a Easypanel > Tu Supabase > Environment Variables
4. Pega todo el contenido
5. Guarda

### 4. Configurar Google Cloud Console

Agrega esta URI en Google Cloud Console > Credenciales > Tu OAuth Client:

```
https://imetrics-supabase-imetrics.dsb9vm.easypanel.host/auth/v1/callback
```

### 5. Reiniciar Supabase

1. En Easypanel, reinicia el servicio de Supabase
2. Espera 2-3 minutos

---

## ✅ Verificación

### Verificar Dashboard

1. Abre: https://imetrics-supabase-imetrics.dsb9vm.easypanel.host
2. Login:
   - Usuario: `admin_imetrics`
   - Password: El que configuraste en `DASHBOARD_PASSWORD`

### Verificar Google OAuth

1. En el dashboard, ve a Authentication > Providers
2. Deberías ver Google habilitado

### Probar desde tu App

1. Abre tu app iMetrics
2. Intenta login con Google
3. Debería funcionar

---

## 📋 Checklist

- [ ] Generé 5 secrets con OpenSSL
- [ ] Reemplacé `POSTGRES_PASSWORD`
- [ ] Reemplacé `JWT_SECRET`
- [ ] Reemplacé `SECRET_KEY_BASE`
- [ ] Reemplacé `VAULT_ENC_KEY`
- [ ] Reemplacé `PG_META_CRYPTO_KEY`
- [ ] Reemplacé `DASHBOARD_PASSWORD`
- [ ] Reemplacé `GOTRUE_EXTERNAL_GOOGLE_CLIENT_ID`
- [ ] Reemplacé `GOTRUE_EXTERNAL_GOOGLE_SECRET`
- [ ] Reemplacé `SMTP_USER`
- [ ] Reemplacé `SMTP_PASS`
- [ ] Copié todo a Easypanel
- [ ] Agregué redirect URI en Google Cloud Console
- [ ] Reinicié Supabase
- [ ] Probé el login

---

## 🆘 Si algo no funciona

1. Verifica que todos los valores estén reemplazados (sin "CAMBIAR_POR" o "TU_")
2. Verifica que no haya espacios extra al inicio o final de las líneas
3. Verifica que la redirect URI en Google Cloud sea exacta
4. Espera 5 minutos después de cambios en Google Cloud
5. Reinicia Supabase en Easypanel

---

**Última actualización**: Enero 2026  
**Versión**: 1.0

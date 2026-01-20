# 🚀 Guía de Configuración para Deployment - iMetrics

## 📋 Índice

1. [Variables de Entorno](#variables-de-entorno)
2. [Configuración de Google Cloud Console](#configuración-de-google-cloud-console)
3. [Configuración de Supabase](#configuración-de-supabase)
4. [Deployment en Producción](#deployment-en-producción)
5. [Verificación](#verificación)

---

## 🔐 Variables de Entorno

### Variables Requeridas

Tu aplicación necesita estas variables de entorno:

```env
# Google OAuth (REQUERIDO)
REACT_APP_GOOGLE_CLIENT_ID=tu_client_id_de_google_cloud

# Google Analytics Measurement ID (OPCIONAL)
REACT_APP_MEASUREMENT_ID=G-XXXXXXXXXX

# Supabase (REQUERIDO)
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu_anon_key_de_supabase

# Google Gemini AI (OPCIONAL - para análisis con IA)
REACT_APP_GEMINI_API_KEY=tu_api_key_de_gemini

# YouTube Data API (OPCIONAL - para análisis de videos)
REACT_APP_YOUTUBE_API_KEY=tu_api_key_de_youtube

# Configuración de Entorno
REACT_APP_ENVIRONMENT=production
REACT_APP_API_URL=https://tu-dominio.com
```

### Archivo .env.production

Crea o actualiza tu archivo `.env.production`:

```env
# Entorno
NODE_ENV=production
REACT_APP_ENVIRONMENT=production

# Dominio de tu aplicación
REACT_APP_DOMAIN=tu-dominio.com
REACT_APP_API_URL=https://tu-dominio.com

# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=TU_CLIENT_ID_AQUI

# Supabase
REACT_APP_SUPABASE_URL=https://imetrics-supabase-imetrics.dsb9vm.easypanel.host
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE

# APIs Opcionales
REACT_APP_GEMINI_API_KEY=tu_gemini_api_key
REACT_APP_YOUTUBE_API_KEY=tu_youtube_api_key
REACT_APP_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 🔧 Configuración de Google Cloud Console

### Paso 1: Crear Proyecto en Google Cloud

1. **Ve a Google Cloud Console**
   ```
   https://console.cloud.google.com/
   ```

2. **Crea un nuevo proyecto**
   - Haz clic en el selector de proyectos (arriba)
   - Clic en "Nuevo Proyecto"
   - Nombre: `iMetrics` (o el que prefieras)
   - Clic en "Crear"

### Paso 2: Habilitar APIs Necesarias

1. **Ve a "APIs y Servicios" > "Biblioteca"**

2. **Habilita estas APIs:**
   - ✅ **Google Analytics Data API** (REQUERIDO)
   - ✅ **Google Analytics Admin API** (REQUERIDO)
   - ⚠️ **YouTube Data API v3** (OPCIONAL - solo si usarás análisis de videos)
   - ⚠️ **Generative Language API** (OPCIONAL - solo si usarás Gemini AI)
   
   **NOTA**: No necesitas habilitar Google+ API. La **People API** se habilita automáticamente al crear credenciales OAuth.

3. **Para cada API:**
   - Búscala en la biblioteca
   - Haz clic en la API
   - Clic en "Habilitar"

### Paso 3: Configurar Pantalla de Consentimiento OAuth

1. **Ve a "APIs y Servicios" > "Pantalla de consentimiento de OAuth"**

2. **Selecciona tipo de usuario:**
   - **Externo** (para usuarios públicos)
   - Clic en "Crear"

3. **Información de la aplicación:**
   ```
   Nombre de la aplicación: iMetrics
   Correo de asistencia: tu-email@dominio.com
   Logo: (opcional)
   ```

4. **Dominios autorizados:**
   ```
   Dominio de la aplicación: tu-dominio.com
   Página principal: https://tu-dominio.com
   Política de privacidad: https://tu-dominio.com/privacy
   Términos de servicio: https://tu-dominio.com/terms
   ```

5. **Ámbitos (Scopes):**
   
   Haz clic en "Agregar o quitar ámbitos" y selecciona:
   
   ```
   ✅ .../auth/userinfo.email
   ✅ .../auth/userinfo.profile
   ✅ openid
   ✅ .../auth/analytics.readonly
   ✅ .../auth/analytics
   ```

6. **Usuarios de prueba (si está en modo Testing):**
   - Agrega los emails de los usuarios que podrán probar la app
   - Puedes agregar hasta 100 usuarios de prueba

7. **Guardar y continuar**

### Paso 4: Crear Credenciales OAuth 2.0

1. **Ve a "APIs y Servicios" > "Credenciales"**

2. **Clic en "Crear credenciales" > "ID de cliente de OAuth 2.0"**

3. **Configuración:**
   ```
   Tipo de aplicación: Aplicación web
   Nombre: iMetrics Web Client
   ```

4. **Orígenes de JavaScript autorizados:**
   
   Agrega TODOS estos orígenes:
   ```
   http://localhost:3000
   https://tu-dominio.com
   https://www.tu-dominio.com
   ```

5. **URIs de redirección autorizados:**
   
   Agrega TODOS estos URIs:
   ```
   http://localhost:3000/callback
   https://tu-dominio.com/callback
   https://www.tu-dominio.com/callback
   ```

6. **Clic en "Crear"**

7. **Copiar credenciales:**
   - Se mostrará un modal con tu **Client ID** y **Client Secret**
   - **Copia el Client ID** - lo necesitarás para las variables de entorno
   - Guarda el Client Secret en un lugar seguro (aunque no lo usarás en el frontend)

### Paso 5: Obtener API Keys (Opcional)

#### YouTube Data API Key

1. **Ve a "APIs y Servicios" > "Credenciales"**
2. **Clic en "Crear credenciales" > "Clave de API"**
3. **Copia la API Key**
4. **Restringir la clave:**
   - Clic en la clave creada
   - "Restricciones de API" > Selecciona "YouTube Data API v3"
   - Guardar

#### Gemini AI API Key

1. **Ve a Google AI Studio:**
   ```
   https://makersuite.google.com/app/apikey
   ```
2. **Clic en "Create API Key"**
3. **Selecciona tu proyecto de Google Cloud**
4. **Copia la API Key**

---

## 🗄️ Configuración de Supabase

### Paso 1: Obtener Credenciales de Supabase

Ya tienes configurado Supabase en Easypanel. Las credenciales son:

```env
REACT_APP_SUPABASE_URL=https://imetrics-supabase-imetrics.dsb9vm.easypanel.host
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Paso 2: Configurar Google OAuth en Supabase

1. **Ve a tu panel de Supabase**
   ```
   https://imetrics-supabase-imetrics.dsb9vm.easypanel.host
   ```

2. **Ve a "Authentication" > "Providers"**

3. **Habilita Google:**
   - Busca "Google" en la lista
   - Activa el toggle
   - Pega tu **Client ID** de Google Cloud
   - Pega tu **Client Secret** de Google Cloud
   - Guarda

4. **Configurar Redirect URLs:**
   - En Supabase, ve a "Authentication" > "URL Configuration"
   - **Site URL**: `https://tu-dominio.com`
   - **Redirect URLs**: Agrega:
     ```
     http://localhost:3000/callback
     https://tu-dominio.com/callback
     ```

---

## 🚀 Deployment en Producción

### Opción 1: Netlify

#### 1. Conectar Repositorio

1. Ve a [Netlify](https://app.netlify.com/)
2. Clic en "Add new site" > "Import an existing project"
3. Conecta tu repositorio de GitHub/GitLab

#### 2. Configurar Build

```
Build command: npm run build
Publish directory: build
```

#### 3. Variables de Entorno

En Netlify Dashboard > Site settings > Environment variables:

```
REACT_APP_GOOGLE_CLIENT_ID=tu_client_id
REACT_APP_SUPABASE_URL=https://imetrics-supabase-imetrics.dsb9vm.easypanel.host
REACT_APP_SUPABASE_ANON_KEY=tu_anon_key
REACT_APP_ENVIRONMENT=production
REACT_APP_GEMINI_API_KEY=tu_gemini_key (opcional)
REACT_APP_YOUTUBE_API_KEY=tu_youtube_key (opcional)
REACT_APP_MEASUREMENT_ID=G-XXXXXXXXXX (opcional)
```

#### 4. Deploy

Clic en "Deploy site"

---

### Opción 2: Vercel

#### 1. Conectar Repositorio

1. Ve a [Vercel](https://vercel.com/)
2. Clic en "Add New" > "Project"
3. Importa tu repositorio

#### 2. Configurar Build

Vercel detecta automáticamente Create React App.

#### 3. Variables de Entorno

En Project Settings > Environment Variables:

```
REACT_APP_GOOGLE_CLIENT_ID=tu_client_id
REACT_APP_SUPABASE_URL=https://imetrics-supabase-imetrics.dsb9vm.easypanel.host
REACT_APP_SUPABASE_ANON_KEY=tu_anon_key
REACT_APP_ENVIRONMENT=production
REACT_APP_GEMINI_API_KEY=tu_gemini_key (opcional)
REACT_APP_YOUTUBE_API_KEY=tu_youtube_key (opcional)
REACT_APP_MEASUREMENT_ID=G-XXXXXXXXXX (opcional)
```

#### 4. Deploy

Clic en "Deploy"

---

### Opción 3: Coolify (Tu caso actual)

Ya tienes configurado Coolify. Actualiza las variables de entorno:

1. **Ve a tu panel de Coolify**

2. **Selecciona tu aplicación iMetrics**

3. **Ve a "Environment Variables"**

4. **Agrega/Actualiza:**

```env
NODE_ENV=production
REACT_APP_ENVIRONMENT=production
REACT_APP_GOOGLE_CLIENT_ID=TU_CLIENT_ID_DE_GOOGLE
REACT_APP_SUPABASE_URL=https://imetrics-supabase-imetrics.dsb9vm.easypanel.host
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REACT_APP_API_URL=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
REACT_APP_GEMINI_API_KEY=tu_gemini_key
REACT_APP_YOUTUBE_API_KEY=tu_youtube_key
REACT_APP_MEASUREMENT_ID=G-XXXXXXXXXX
```

5. **Redeploy la aplicación**

---

## ✅ Verificación

### Checklist de Configuración

- [ ] Proyecto creado en Google Cloud Console
- [ ] APIs habilitadas (Analytics Data API, Analytics Admin API)
- [ ] Pantalla de consentimiento OAuth configurada
- [ ] Credenciales OAuth 2.0 creadas
- [ ] Client ID copiado
- [ ] Orígenes JavaScript autorizados agregados
- [ ] URIs de redirección autorizados agregados
- [ ] Google OAuth habilitado en Supabase
- [ ] Variables de entorno configuradas en plataforma de deployment
- [ ] Aplicación deployada

### Probar la Configuración

1. **Abre tu aplicación en producción**
   ```
   https://tu-dominio.com
   ```

2. **Intenta registrarte/iniciar sesión con Google**
   - Debería abrir el popup de Google OAuth
   - Debería solicitar permisos
   - Debería redirigir correctamente

3. **Intenta conectar Google Analytics**
   - Ve a la sección de Analytics
   - Clic en "Conectar Google Analytics"
   - Debería solicitar permisos de Analytics
   - Debería cargar tus cuentas y propiedades

### Errores Comunes

#### Error: "redirect_uri_mismatch"

**Solución:**
1. Ve a Google Cloud Console > Credenciales
2. Edita tu OAuth Client ID
3. Verifica que la URI de redirección esté exactamente como:
   ```
   https://tu-dominio.com/callback
   ```
4. Guarda y espera 5 minutos

#### Error: "Access blocked: This app's request is invalid"

**Solución:**
1. Ve a Google Cloud Console > Pantalla de consentimiento OAuth
2. Verifica que el dominio esté autorizado
3. Verifica que los scopes estén correctos
4. Si está en modo "Testing", agrega tu email como usuario de prueba

#### Error: "Invalid Supabase URL"

**Solución:**
1. Verifica que `REACT_APP_SUPABASE_URL` esté correcta
2. Debe ser HTTPS
3. No debe tener barra final `/`

---

## 📝 Resumen de URLs Importantes

### Google Cloud Console
```
Consola principal: https://console.cloud.google.com/
APIs y Servicios: https://console.cloud.google.com/apis/
Credenciales: https://console.cloud.google.com/apis/credentials
```

### Supabase
```
Tu instancia: https://imetrics-supabase-imetrics.dsb9vm.easypanel.host
```

### Tu Aplicación
```
Desarrollo: http://localhost:3000
Producción: https://tu-dominio.com
Callback OAuth: https://tu-dominio.com/callback
```

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs de tu aplicación
2. Verifica las variables de entorno
3. Comprueba que las URLs de redirección coincidan exactamente
4. Espera 5-10 minutos después de cambios en Google Cloud Console

---

**Última actualización**: Enero 2026  
**Versión**: 1.0

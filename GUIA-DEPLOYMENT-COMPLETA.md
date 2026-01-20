# 🚀 Guía Completa de Deployment - iMetrics

## 📋 Variables de Entorno Listas

El archivo `VARIABLES-DEPLOYMENT-IMETRICS.txt` contiene todas las variables configuradas para deployment.

---

## ✅ VARIABLES CONFIGURADAS

### 🔧 Configuración de Entorno
```
NODE_ENV=production
REACT_APP_ENVIRONMENT=production
PORT=3000
SERVER_PORT=3001
```

### 🌐 URLs de la Aplicación
```
REACT_APP_DOMAIN=v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
REACT_APP_API_URL=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
REACT_APP_OAUTH_REDIRECT_URI=https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
```

### 🔐 Google OAuth
```
REACT_APP_GOOGLE_CLIENT_ID=[TU_GOOGLE_CLIENT_ID]
```

**Nota:** Obtén el valor real del archivo `VARIABLES-DEPLOYMENT-IMETRICS.txt`

### 🗄️ Supabase
```
REACT_APP_SUPABASE_URL=https://imetrics-supabase-imetrics.dsb9vm.easypanel.host
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 🤖 APIs Opcionales
```
REACT_APP_GEMINI_API_KEY=[TU_GEMINI_API_KEY]
REACT_APP_YOUTUBE_API_KEY= (vacío - opcional)
REACT_APP_MEASUREMENT_ID= (vacío - opcional)
```

**Nota:** El valor real del Gemini API Key está en `VARIABLES-DEPLOYMENT-IMETRICS.txt`

---

## 🎯 DEPLOYMENT EN COOLIFY

### Paso 1: Acceder a Coolify

1. Ve a tu panel de Coolify
2. Selecciona tu aplicación iMetrics

### Paso 2: Configurar Variables de Entorno

1. Ve a la sección "Environment Variables" o "Variables de Entorno"
2. Abre el archivo `VARIABLES-DEPLOYMENT-IMETRICS.txt`
3. Copia TODO el contenido (Ctrl+A, Ctrl+C)
4. Pega en el campo de variables de entorno (Ctrl+V)
5. Guarda

### Paso 3: Verificar Build Settings

Asegúrate de que estén configurados:

```
Build Command: npm run build
Start Command: npm start (o serve -s build)
Port: 3000
```

### Paso 4: Deploy

1. Haz clic en "Deploy" o "Redeploy"
2. Espera a que termine el build (2-5 minutos)
3. Verifica que no haya errores

---

## 🎯 DEPLOYMENT EN NETLIFY

### Paso 1: Conectar Repositorio

1. Ve a https://app.netlify.com/
2. Clic en "Add new site" > "Import an existing project"
3. Conecta tu repositorio de GitHub/GitLab

### Paso 2: Configurar Build

```
Build command: npm run build
Publish directory: build
```

### Paso 3: Variables de Entorno

1. Ve a "Site settings" > "Environment variables"
2. Agrega cada variable una por una:

```
REACT_APP_GOOGLE_CLIENT_ID=[TU_GOOGLE_CLIENT_ID]
REACT_APP_SUPABASE_URL=https://imetrics-supabase-imetrics.dsb9vm.easypanel.host
REACT_APP_SUPABASE_ANON_KEY=[TU_SUPABASE_ANON_KEY]
REACT_APP_ENVIRONMENT=production
REACT_APP_GEMINI_API_KEY=[TU_GEMINI_API_KEY]
```

**Nota:** Los valores reales están en `VARIABLES-DEPLOYMENT-IMETRICS.txt`

### Paso 4: Deploy

1. Clic en "Deploy site"
2. Espera a que termine (2-5 minutos)

### Paso 5: Actualizar URLs

Una vez deployado, Netlify te dará una URL (ej: `https://imetrics-abc123.netlify.app`)

Actualiza estas variables con tu nueva URL:
```
REACT_APP_DOMAIN=imetrics-abc123.netlify.app
REACT_APP_API_URL=https://imetrics-abc123.netlify.app
REACT_APP_OAUTH_REDIRECT_URI=https://imetrics-abc123.netlify.app/callback
```

Y actualiza en Google Cloud Console:
- Orígenes autorizados: `https://imetrics-abc123.netlify.app`
- URIs de redirección: `https://imetrics-abc123.netlify.app/callback`

---

## 🎯 DEPLOYMENT EN VERCEL

### Paso 1: Conectar Repositorio

1. Ve a https://vercel.com/
2. Clic en "Add New" > "Project"
3. Importa tu repositorio

### Paso 2: Configurar Build

Vercel detecta automáticamente Create React App.

### Paso 3: Variables de Entorno

1. Ve a "Project Settings" > "Environment Variables"
2. Agrega cada variable:

```
REACT_APP_GOOGLE_CLIENT_ID=[TU_GOOGLE_CLIENT_ID]
REACT_APP_SUPABASE_URL=https://imetrics-supabase-imetrics.dsb9vm.easypanel.host
REACT_APP_SUPABASE_ANON_KEY=[TU_SUPABASE_ANON_KEY]
REACT_APP_ENVIRONMENT=production
REACT_APP_GEMINI_API_KEY=[TU_GEMINI_API_KEY]
```

**Nota:** Los valores reales están en `VARIABLES-DEPLOYMENT-IMETRICS.txt`

### Paso 4: Deploy

1. Clic en "Deploy"
2. Espera a que termine

### Paso 5: Actualizar URLs

Similar a Netlify, actualiza las URLs con tu dominio de Vercel.

---

## 🔧 CONFIGURACIÓN POST-DEPLOYMENT

### 1. Actualizar Google Cloud Console

Después de deployar, agrega tu URL de producción:

**Orígenes autorizados de JavaScript:**
```
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io
https://tu-nuevo-dominio.com (si cambias)
```

**URIs de redireccionamiento autorizados:**
```
https://v8g48ggkk8wko4480s8kk4ok.147.93.182.94.sslip.io/callback
https://tu-nuevo-dominio.com/callback (si cambias)
```

### 2. Actualizar Supabase

En las variables de Supabase, actualiza:

```
SITE_URL=https://tu-dominio-de-produccion.com
ADDITIONAL_REDIRECT_URLS=https://tu-dominio-de-produccion.com/callback
GOTRUE_SITE_URL=https://tu-dominio-de-produccion.com
GOTRUE_URI_ALLOW_LIST=https://tu-dominio-de-produccion.com/**
```

---

## ✅ VERIFICACIÓN POST-DEPLOYMENT

### 1. Verificar que la App Carga

1. Abre tu URL de producción
2. Verifica que la página carga correctamente
3. Verifica que no hay errores en la consola del navegador (F12)

### 2. Probar Login con Google

1. Clic en "Iniciar sesión con Google"
2. Debería abrir el popup de Google
3. Debería solicitar permisos
4. Debería redirigir correctamente

### 3. Probar Conexión a Google Analytics

1. Una vez logueado, ve a la sección de Analytics
2. Clic en "Conectar Google Analytics"
3. Debería solicitar permisos de Analytics
4. Debería cargar tus cuentas y propiedades

### 4. Verificar Base de Datos

1. Registra un usuario de prueba
2. Ve a Supabase Dashboard
3. Verifica que se creó el usuario en la tabla `users`
4. Verifica que se crearon configuraciones en `user_settings`

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "redirect_uri_mismatch"

**Causa:** La URI de redirección no está configurada en Google Cloud

**Solución:**
1. Ve a Google Cloud Console > Credenciales
2. Agrega exactamente: `https://tu-dominio.com/callback`
3. Espera 5 minutos

### Error: "Invalid Supabase URL"

**Causa:** Variable de entorno mal configurada

**Solución:**
1. Verifica que `REACT_APP_SUPABASE_URL` sea correcta
2. Debe ser HTTPS
3. No debe tener `/` al final
4. Redeploy después de corregir

### Error: La app no carga

**Causa:** Error en el build

**Solución:**
1. Revisa los logs del deployment
2. Verifica que todas las variables estén configuradas
3. Verifica que el build command sea correcto: `npm run build`

### Error: "Network Error" al hacer login

**Causa:** CORS o URL incorrecta

**Solución:**
1. Verifica que `REACT_APP_API_URL` sea correcta
2. Verifica que las URLs en Google Cloud coincidan
3. Verifica que Supabase tenga las URLs correctas

---

## 📊 CHECKLIST DE DEPLOYMENT

### Pre-Deployment
- [ ] Base de datos Supabase configurada
- [ ] Variables de entorno preparadas
- [ ] Google OAuth configurado
- [ ] Código en repositorio actualizado

### Durante Deployment
- [ ] Variables de entorno copiadas a la plataforma
- [ ] Build settings configurados
- [ ] Deploy iniciado

### Post-Deployment
- [ ] App carga correctamente
- [ ] URLs actualizadas en Google Cloud Console
- [ ] URLs actualizadas en Supabase
- [ ] Login con Google funciona
- [ ] Conexión a Google Analytics funciona
- [ ] Base de datos guarda datos correctamente

---

## 🎉 ¡LISTO!

Si completaste todos los pasos, tu aplicación iMetrics está deployada y funcionando en producción.

---

**Última actualización**: Enero 2026  
**Versión**: 1.0

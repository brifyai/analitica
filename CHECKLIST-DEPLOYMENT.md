# ✅ Checklist de Deployment - iMetrics

## 🎯 Guía Rápida de 30 Minutos

Sigue estos pasos en orden para configurar y deployar tu aplicación.

---

## 📋 Parte 1: Google Cloud Console (15 min)

### Paso 1: Crear Proyecto (2 min)
- [ ] Ir a https://console.cloud.google.com/
- [ ] Crear nuevo proyecto "iMetrics"
- [ ] Anotar el Project ID

### Paso 2: Habilitar APIs (3 min)
- [ ] Ir a "APIs y Servicios" > "Biblioteca"
- [ ] Buscar y habilitar: **Google Analytics Data API**
- [ ] Buscar y habilitar: **Google Analytics Admin API**
- [ ] (Opcional) Habilitar: **YouTube Data API v3**
- [ ] (Opcional) Habilitar: **Generative Language API**

**NOTA**: La People API (para OAuth) se habilita automáticamente al crear credenciales OAuth.

### Paso 3: Pantalla de Consentimiento (5 min)
- [ ] Ir a "APIs y Servicios" > "Pantalla de consentimiento OAuth"
- [ ] Seleccionar "Externo"
- [ ] Completar información:
  - Nombre: `iMetrics`
  - Email de soporte: `tu-email@dominio.com`
  - Dominio: `tu-dominio.com`
- [ ] Agregar scopes:
  - `.../auth/userinfo.email`
  - `.../auth/userinfo.profile`
  - `openid`
  - `.../auth/analytics.readonly`
  - `.../auth/analytics`
- [ ] Agregar usuarios de prueba (si está en Testing)
- [ ] Guardar

### Paso 4: Crear Credenciales OAuth (5 min)
- [ ] Ir a "APIs y Servicios" > "Credenciales"
- [ ] Clic en "Crear credenciales" > "ID de cliente OAuth 2.0"
- [ ] Tipo: "Aplicación web"
- [ ] Nombre: `iMetrics Web Client`
- [ ] Orígenes JavaScript autorizados:
  ```
  http://localhost:3000
  https://tu-dominio.com
  ```
- [ ] URIs de redirección:
  ```
  http://localhost:3000/callback
  https://tu-dominio.com/callback
  ```
- [ ] Crear y **COPIAR EL CLIENT ID** ⭐

---

## 🗄️ Parte 2: Supabase (5 min)

### Paso 5: Configurar Google OAuth en Supabase
- [ ] Ir a tu panel de Supabase
- [ ] Ir a "Authentication" > "Providers"
- [ ] Habilitar "Google"
- [ ] Pegar Client ID de Google Cloud
- [ ] Pegar Client Secret de Google Cloud
- [ ] Guardar

### Paso 6: Configurar URLs en Supabase
- [ ] Ir a "Authentication" > "URL Configuration"
- [ ] Site URL: `https://tu-dominio.com`
- [ ] Redirect URLs: Agregar:
  ```
  http://localhost:3000/callback
  https://tu-dominio.com/callback
  ```
- [ ] Guardar

---

## 🚀 Parte 3: Deployment (10 min)

### Paso 7: Preparar Variables de Entorno

Copia el archivo `.env.production.template` y renómbralo a `.env.production`

Completa estas variables:

```env
# REQUERIDO
REACT_APP_GOOGLE_CLIENT_ID=TU_CLIENT_ID_AQUI
REACT_APP_SUPABASE_URL=https://imetrics-supabase-imetrics.dsb9vm.easypanel.host
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REACT_APP_DOMAIN=tu-dominio.com
REACT_APP_API_URL=https://tu-dominio.com

# OPCIONAL
REACT_APP_GEMINI_API_KEY=tu_gemini_key
REACT_APP_YOUTUBE_API_KEY=tu_youtube_key
REACT_APP_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Paso 8: Configurar en Plataforma de Deployment

#### Para Netlify:
- [ ] Conectar repositorio
- [ ] Build command: `npm run build`
- [ ] Publish directory: `build`
- [ ] Agregar variables de entorno en Site settings
- [ ] Deploy

#### Para Vercel:
- [ ] Importar proyecto
- [ ] Agregar variables de entorno en Project settings
- [ ] Deploy

#### Para Coolify (tu caso):
- [ ] Ir a tu aplicación en Coolify
- [ ] Ir a "Environment Variables"
- [ ] Agregar todas las variables de entorno
- [ ] Redeploy

---

## ✅ Parte 4: Verificación (5 min)

### Paso 9: Probar la Aplicación

- [ ] Abrir `https://tu-dominio.com`
- [ ] Verificar que carga correctamente
- [ ] Intentar registrarse con Google
  - [ ] Debería abrir popup de Google
  - [ ] Debería solicitar permisos
  - [ ] Debería redirigir correctamente
- [ ] Intentar conectar Google Analytics
  - [ ] Debería solicitar permisos de Analytics
  - [ ] Debería cargar cuentas y propiedades

### Paso 10: Verificar Base de Datos

- [ ] Ir a Supabase
- [ ] Ir a "Table Editor"
- [ ] Verificar que se creó un usuario en la tabla `users`
- [ ] Verificar que se crearon configuraciones en `user_settings`

---

## 🎊 ¡Completado!

Si todos los checkboxes están marcados, tu aplicación está lista para producción.

---

## 🆘 Problemas Comunes

### ❌ Error: "redirect_uri_mismatch"

**Solución:**
1. Ve a Google Cloud Console > Credenciales
2. Verifica que la URI sea exactamente: `https://tu-dominio.com/callback`
3. Espera 5 minutos y prueba de nuevo

### ❌ Error: "Access blocked"

**Solución:**
1. Ve a Pantalla de consentimiento OAuth
2. Verifica que tu dominio esté autorizado
3. Si está en "Testing", agrega tu email como usuario de prueba

### ❌ Error: "Invalid Supabase URL"

**Solución:**
1. Verifica que `REACT_APP_SUPABASE_URL` sea correcta
2. Debe ser HTTPS
3. No debe tener `/` al final

### ❌ La app no carga

**Solución:**
1. Revisa los logs de deployment
2. Verifica que todas las variables de entorno estén configuradas
3. Verifica que el build se completó sin errores

---

## 📊 Resumen de Tiempos

| Tarea | Tiempo Estimado |
|-------|-----------------|
| Google Cloud Console | 15 min |
| Supabase | 5 min |
| Deployment | 10 min |
| Verificación | 5 min |
| **TOTAL** | **35 min** |

---

## 📝 Información para Guardar

Guarda esta información en un lugar seguro:

```
Google Cloud Project ID: _______________
Google Client ID: _______________
Google Client Secret: _______________
Supabase URL: https://imetrics-supabase-imetrics.dsb9vm.easypanel.host
Supabase Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Dominio de Producción: _______________
```

---

## 🔗 Enlaces Útiles

- [Google Cloud Console](https://console.cloud.google.com/)
- [Supabase Dashboard](https://imetrics-supabase-imetrics.dsb9vm.easypanel.host)
- [Guía Completa](./GUIA-CONFIGURACION-DEPLOYMENT.md)
- [Variables de Entorno Template](./.env.production.template)

---

**Última actualización**: Enero 2026  
**Versión**: 1.0

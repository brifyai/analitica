# Guía de Diagnóstico - Network Error en Google Analytics API

## 🚨 Problema Actual:
```
Error loading accounts and properties: Error: Error al obtener cuentas de Google Analytics: Network Error
```

## 🔍 Análisis del Problema

El "Network Error" ocurre cuando la aplicación no puede conectar con Google Analytics API directamente. Las causas más comunes son:

### 1. **Problemas de CORS** (Más probable)
Google Analytics API requiere que tu dominio esté autorizado en Google Cloud Console.

### 2. **Bloqueadores de red**
Firewall, antivirus o bloqueadores de publicidad pueden bloquear las llamadas.

### 3. **Problemas de conexión**
Inestabilidad en la conexión a internet.

### 4. **Configuración de OAuth**
Tokens sin los permisos correctos o expirados.

## ✅ Pasos para Solucionar

### Paso 1: Verificar Configuración de CORS en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **Credentials**
4. Haz clic en tu **OAuth 2.0 Client ID**
5. En **Authorized JavaScript origins**, agrega:
   ```
   http://localhost:3000
   https://tu-dominio-en-netlify.netlify.app
   ```
6. En **Authorized redirect URIs**, agrega:
   ```
   http://localhost:3000/callback
   https://tu-dominio-en-netlify.netlify.app/callback
   ```

### Paso 2: Verificar Scopes en Supabase

Asegúrate de que en Supabase Dashboard → Authentication → Providers → Google tengas estos scopes exactos:

```
email
profile
https://www.googleapis.com/auth/analytics.readonly
https://www.googleapis.com/auth/analytics.edit
https://www.googleapis.com/auth/analytics.manage.users.readonly
```

### Paso 3: Diagnosticar con Herramientas de Desarrollador

1. Abre la aplicación en Chrome
2. Presiona **F12** para abrir DevTools
3. Ve a la pestaña **Console**
4. Intenta conectar con Google Analytics
5. Busca los mensajes de debug:
   ```
   🔍 DEBUG: Llamando a Google Analytics API para obtener cuentas
   🔍 DEBUG: Token válido: Sí/No
   🔍 DEBUG: URL: https://analyticsdata.googleapis.com/v1beta/accountSummaries:list
   ```

### Paso 4: Verificar en la Pestaña Network

1. En DevTools, ve a la pestaña **Network**
2. Filtra por `analyticsdata`
3. Busca la llamada a `accountSummaries:list`
4. Revisa el estado y la respuesta:

**Si ves (CORS) o (blocked):**
- Es problema de configuración de CORS en Google Cloud Console

**Si ves (pending) y luego falla:**
- Es problema de red o timeout

**Si ves 401 Unauthorized:**
- Es problema de token expirado

**Si ves 403 Forbidden:**
- Es problema de permisos

### Paso 5: Probar con Herramienta Externa

Para verificar si el problema es de la aplicación o de la configuración:

1. Obtén tu token de acceso:
   ```javascript
   // En la consola del navegador
   const { data } = await supabase.auth.getSession();
   console.log('Token:', data.session?.provider_token);
   ```

2. Prueba la API con curl:
   ```bash
   curl -H "Authorization: Bearer TU_TOKEN" \
        "https://analyticsdata.googleapis.com/v1beta/accountSummaries:list"
   ```

## 🔧 Soluciones Específicas

### Solución A: Configurar CORS Correctamente

En Google Cloud Console → Credentials → OAuth 2.0 Client ID:

**Authorized JavaScript origins:**
```
http://localhost:3000
https://tvradio2.netlify.app
```

**Authorized redirect URIs:**
```
http://localhost:3000/callback
https://tvradio2.netlify.app/callback
```

### Solución B: Deshabilitar Bloqueadores Temporalmente

1. Deshabilita AdBlock, uBlock Origin, etc.
2. Deshabilita el firewall del antivirus temporalmente
3. Prueba en modo incógnito de Chrome

### Solución C: Usar Proxy Temporal (Si nada funciona)

Si los problemas de CORS persisten, podemos crear un proxy simple:

```javascript
// En development, usa proxy
const proxyUrl = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001' 
  : '';

const response = await axios.get(`${proxyUrl}https://analyticsdata.googleapis.com/v1beta/accountSummaries:list`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

## 📋 Checklist de Verificación

- [ ] Dominios configurados en Google Cloud Console
- [ ] Scopes correctos en Supabase
- [ ] Google Analytics Data API habilitada
- [ ] Tokens válidos (no expirados)
- [ ] Sin bloqueadores de red activos
- [ ] Conexión a internet estable
- [ ] Probado en diferentes navegadores

## 🚀 Si Todo Falla - Plan B

Si no puedes resolver el problema de CORS, la alternativa es:

1. **Crear un proxy simple** (diferente al que eliminamos)
2. **Usar Netlify Edge Functions** para manejar CORS
3. **Configurar un backend personalizado**

## 📞 Información de Depuración

Cuando pidas ayuda, proporciona:

1. **Captura de pantalla** de la pestaña Network
2. **Mensajes de la consola** completos
3. **Configuración de CORS** de Google Cloud Console
4. **Scopes configurados** en Supabase

## 🎯 Próximos Pasos

1. **Prueba la solución CORS** (Paso 1)
2. **Verifica los scopes** (Paso 2)
3. **Usa DevTools** para diagnosticar (Paso 3-4)
4. **Si persiste**, considera el proxy temporal (Solución C)

El problema más común es la configuración de CORS en Google Cloud Console. Asegúrate de que tu dominio esté correctamente autorizado.
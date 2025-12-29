# Guía Completa de Configuración de Supabase

## Paso 1: Configurar Google OAuth en Supabase

### 1.1 Acceder al Dashboard de Supabase
1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto

### 1.2 Configurar el Provider de Google
1. En el menú lateral, ve a **Authentication** → **Providers**
2. Busca **Google** en la lista de providers
3. Haz clic en **Google** para expandir la configuración

### 1.3 Habilitar Google Provider
1. Activa el interruptor **Enable Google provider**
2. Configura los siguientes campos:

#### **Client ID**
- Obtén este valor desde [Google Cloud Console](https://console.cloud.google.com/)
- Ve a **APIs & Services** → **Credentials**
- Crea o selecciona un **OAuth 2.0 Client ID**
- Copia el **Client ID**

#### **Client Secret**
- En la misma página de Google Cloud Console
- Copia el **Client Secret**

#### **Redirect URL**
- Supabase te proporcionará una URL de redirección
- Copia esta URL y pégala en Google Cloud Console:
  - Ve a tu OAuth 2.0 Client ID
- En **Authorized redirect URIs**, agrega la URL que te dio Supabase

### 1.4 Configurar los Scopes (IMPORTANTE)

En el campo **Additional Scopes**, agrega los siguientes scopes (uno por línea):

```
email
profile
https://www.googleapis.com/auth/analytics.readonly
```

**Explicación de los scopes:**
- `email`: Permite acceder al correo del usuario
- `profile`: Permite acceder al perfil básico del usuario
- `https://www.googleapis.com/auth/analytics.readonly`: **ESencial para Google Analytics**

### 1.5 Guardar Configuración
1. Haz clic en **Save** para guardar los cambios
2. Espera unos segundos a que se aplique la configuración

## Paso 2: Configurar Google Cloud Console

### 2.1 Habilitar Google Analytics Data API
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **Library**
4. Busca **"Google Analytics Data API"**
5. Haz clic en ella y luego en **Enable**

### 2.2 Configurar OAuth Consent Screen
1. Ve a **APIs & Services** → **OAuth consent screen**
2. Configura el consent screen:
   - **User Type**: External
   - **App name**: GA4 Dashboard (o el nombre de tu app)
   - **User support email**: tu correo
   - **Developer contact information**: tu correo

### 2.3 Configurar Scopes en OAuth Consent Screen
1. En la sección **Scopes**, agrega:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `https://www.googleapis.com/auth/analytics.readonly`

### 2.4 Configurar Usuarios de Prueba
1. En la sección **Test users**, agrega tu correo electrónico
2. Esto te permitirá probar la app sin necesidad de verificación de Google

## Paso 3: Configurar Variables de Entorno

### 3.1 Archivo .env
Crea un archivo `.env` en la raíz del proyecto:

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu-clave-anonima-de-supabase
```

### 3.2 Obtener las Credenciales de Supabase
1. En Supabase Dashboard, ve a **Project Settings** → **API**
2. Copia el **Project URL**
3. Copia el **anon public key**

## Paso 4: Configurar Netlify (Producción)

### 4.1 Variables de Entorno en Netlify
1. Ve a tu sitio en Netlify
2. **Site settings** → **Build & deploy** → **Environment**
3. Agrega las variables:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`

## Paso 5: Verificar Configuración

### 5.1 Probar Localmente
1. Inicia la aplicación: `npm start`
2. Haz clic en "Continuar con Google"
3. Debería redirigirte a Google
4. Acepta los permisos (incluyendo Google Analytics)
5. Deberías volver a la app conectado

### 5.2 Verificar Tokens
1. Abre la consola del navegador
2. Ve a **Application** → **Local Storage**
3. Busca `supabase.auth.token`
4. Verifica que contenga `provider_token`

## Troubleshooting

### Error: "No Google access token available"
**Causa**: Los scopes no están configurados correctamente en Supabase
**Solución**: Verifica que hayas agregado `https://www.googleapis.com/auth/analytics.readonly` en los scopes de Supabase

### Error: "Access forbidden - insufficient permissions"
**Causa**: El token no tiene permisos para GA4
**Solución**: Asegúrate de que el OAuth consent screen incluya el scope de Analytics

### Error: "Invalid redirect URI"
**Causa**: La URL de redirección no coincide
**Solución**: Copia exactamente la URL que te da Supabase y pégala en Google Cloud Console

## Resumen de Configuración

1. **Supabase**: Configurar Google provider con los 3 scopes
2. **Google Cloud**: Habilitar Analytics Data API y configurar OAuth
3. **Variables de entorno**: Configurar URL y key de Supabase
4. **Probar**: Verificar que el flujo de OAuth funcione correctamente

## Checklist Final

- [ ] Google provider habilitado en Supabase
- [ ] Scopes configurados en Supabase (email, profile, analytics.readonly)
- [ ] Google Analytics Data API habilitada en Google Cloud
- [ ] OAuth consent screen configurado
- [ ] Usuario de prueba agregado
- [ ] Variables de entorno configuradas
- [ ] Flujo de OAuth funcionando
- [ ] Acceso a Google Analytics funcionando

Si sigues estos pasos paso a paso, el proxy debería funcionar correctamente sin errores 500.
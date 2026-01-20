# 🔌 APIs de Google Explicadas - iMetrics

## 📋 Resumen Rápido

Para que iMetrics funcione correctamente, necesitas habilitar **2 APIs obligatorias** en Google Cloud Console.

---

## ✅ APIs REQUERIDAS (Obligatorias)

### 1. Google Analytics Data API

**¿Qué hace?**
- Lee datos de Google Analytics 4
- Obtiene métricas (usuarios, sesiones, conversiones, etc.)
- Obtiene dimensiones (país, dispositivo, fuente, etc.)
- Genera reportes personalizados

**¿Por qué la necesitas?**
- Es el corazón de iMetrics
- Sin esta API, no puedes leer datos de GA4
- Permite crear dashboards y análisis

**Cómo habilitarla:**
1. Ve a https://console.cloud.google.com/apis/library
2. Busca: "Google Analytics Data API"
3. Clic en "Habilitar"

**Documentación oficial:**
https://developers.google.com/analytics/devguides/reporting/data/v1

---

### 2. Google Analytics Admin API

**¿Qué hace?**
- Lista las cuentas de Google Analytics del usuario
- Lista las propiedades (sitios web/apps) de cada cuenta
- Obtiene configuración de propiedades
- Gestiona accesos y permisos

**¿Por qué la necesitas?**
- Para mostrar al usuario sus cuentas y propiedades de GA4
- Para que el usuario pueda seleccionar qué propiedad analizar
- Sin esta API, el usuario no puede conectar sus cuentas

**Cómo habilitarla:**
1. Ve a https://console.cloud.google.com/apis/library
2. Busca: "Google Analytics Admin API"
3. Clic en "Habilitar"

**Documentación oficial:**
https://developers.google.com/analytics/devguides/config/admin/v1

---

## 🔐 API para OAuth (Automática)

### People API (antes Google+ API)

**¿Qué hace?**
- Obtiene información básica del perfil del usuario
- Nombre, email, foto de perfil
- Usado durante el login con Google

**¿Por qué la necesitas?**
- Para el login con Google ("Sign in with Google")
- Para mostrar el nombre y foto del usuario en la app

**¿Necesitas habilitarla manualmente?**
❌ **NO** - Se habilita automáticamente cuando creas credenciales OAuth 2.0

**Nota histórica:**
- Antes se llamaba "Google+ API"
- Google+ (la red social) cerró en 2019
- La API se renombró a "People API"
- Sigue funcionando para OAuth y perfiles

---

## ⚠️ APIs OPCIONALES (No obligatorias)

### 3. YouTube Data API v3

**¿Qué hace?**
- Obtiene información de videos de YouTube
- Estadísticas de videos (vistas, likes, comentarios)
- Información de canales

**¿Por qué podrías necesitarla?**
- Solo si quieres analizar videos de YouTube
- Para correlacionar datos de GA4 con videos
- Para análisis de contenido multimedia

**¿Es obligatoria?**
❌ NO - Solo si usas la funcionalidad de análisis de videos

**Cómo habilitarla:**
1. Ve a https://console.cloud.google.com/apis/library
2. Busca: "YouTube Data API v3"
3. Clic en "Habilitar"
4. Crea una API Key (no OAuth)
5. Restringe la key a YouTube Data API v3

**Documentación oficial:**
https://developers.google.com/youtube/v3

---

### 4. Generative Language API (Gemini AI)

**¿Qué hace?**
- Acceso a Google Gemini (IA generativa)
- Genera análisis con inteligencia artificial
- Crea insights automáticos
- Responde preguntas sobre los datos

**¿Por qué podrías necesitarla?**
- Para análisis avanzados con IA
- Para generar insights automáticos
- Para responder preguntas en lenguaje natural

**¿Es obligatoria?**
❌ NO - Solo si quieres funcionalidades de IA

**Cómo habilitarla:**
1. Ve a https://makersuite.google.com/app/apikey
2. Crea una API Key
3. Selecciona tu proyecto de Google Cloud

**Documentación oficial:**
https://ai.google.dev/docs

---

## 📊 Comparación de APIs

| API | Obligatoria | Función Principal | Tipo de Credencial |
|-----|-------------|-------------------|-------------------|
| **Analytics Data API** | ✅ Sí | Leer datos de GA4 | OAuth 2.0 |
| **Analytics Admin API** | ✅ Sí | Listar cuentas/propiedades | OAuth 2.0 |
| **People API** | ✅ Sí | Login con Google | OAuth 2.0 (automática) |
| **YouTube Data API** | ❌ No | Datos de videos | API Key |
| **Gemini AI** | ❌ No | Análisis con IA | API Key |

---

## 🔑 Tipos de Credenciales

### OAuth 2.0 (Client ID + Client Secret)

**Usado para:**
- Google Analytics Data API
- Google Analytics Admin API
- People API (login)

**Características:**
- El usuario debe autorizar el acceso
- Accede a datos privados del usuario
- Tokens de acceso con expiración
- Refresh tokens para renovar acceso

**Cómo obtenerlo:**
1. Google Cloud Console > APIs y Servicios > Credenciales
2. Crear credenciales > ID de cliente OAuth 2.0
3. Configurar pantalla de consentimiento
4. Agregar scopes necesarios

---

### API Key

**Usado para:**
- YouTube Data API
- Gemini AI API

**Características:**
- No requiere autorización del usuario
- Accede solo a datos públicos
- Sin expiración (pero se puede rotar)
- Más simple de usar

**Cómo obtenerlo:**
1. Google Cloud Console > APIs y Servicios > Credenciales
2. Crear credenciales > Clave de API
3. Restringir a APIs específicas
4. Restringir por dominio (opcional)

---

## 🎯 Scopes de OAuth

Cuando configures la pantalla de consentimiento OAuth, necesitas estos scopes:

### Scopes Básicos (Obligatorios)
```
https://www.googleapis.com/auth/userinfo.email
https://www.googleapis.com/auth/userinfo.profile
openid
```
**Función**: Login con Google, obtener nombre y email

### Scopes de Analytics (Obligatorios)
```
https://www.googleapis.com/auth/analytics.readonly
https://www.googleapis.com/auth/analytics
```
**Función**: Leer datos de Google Analytics 4

---

## 🔒 Seguridad y Límites

### Cuotas de APIs

Cada API tiene límites de uso:

**Google Analytics Data API:**
- 25,000 tokens por día (gratis)
- 1,250 tokens por 100 segundos
- Suficiente para uso normal

**Google Analytics Admin API:**
- 500 requests por día (gratis)
- Suficiente para listar cuentas/propiedades

**YouTube Data API:**
- 10,000 unidades por día (gratis)
- Cada request consume diferentes unidades

**Gemini AI:**
- Depende del plan
- Gratis: 60 requests por minuto

### Mejores Prácticas

1. **Usa caché**: No consultes la misma información repetidamente
2. **Batch requests**: Agrupa múltiples consultas cuando sea posible
3. **Maneja errores**: Implementa retry logic para errores temporales
4. **Monitorea uso**: Revisa las cuotas en Google Cloud Console

---

## 📝 Resumen para iMetrics

### Configuración Mínima (Solo lo esencial)

```
✅ Habilitar: Google Analytics Data API
✅ Habilitar: Google Analytics Admin API
✅ Crear: Credenciales OAuth 2.0
✅ Configurar: Pantalla de consentimiento
✅ Agregar: Scopes de Analytics
```

### Configuración Completa (Con funcionalidades opcionales)

```
✅ Todo lo anterior +
⚠️ Habilitar: YouTube Data API v3
⚠️ Crear: API Key para YouTube
⚠️ Habilitar: Generative Language API
⚠️ Crear: API Key para Gemini
```

---

## 🆘 Preguntas Frecuentes

### ¿Necesito Google+ API?

❌ **NO** - Google+ cerró en 2019. La funcionalidad de OAuth ahora usa People API, que se habilita automáticamente.

### ¿Cuánto cuesta usar estas APIs?

💰 **GRATIS** para uso normal. Las cuotas gratuitas son suficientes para la mayoría de aplicaciones.

### ¿Qué pasa si excedo las cuotas?

⚠️ La API devolverá errores 429 (Too Many Requests). Puedes:
- Esperar a que se renueve la cuota (diaria)
- Solicitar aumento de cuota (gratis en muchos casos)
- Implementar mejor caché

### ¿Puedo usar la app sin YouTube/Gemini APIs?

✅ **SÍ** - Son completamente opcionales. La funcionalidad core de Analytics funciona sin ellas.

---

## 🔗 Enlaces Útiles

- [Google Cloud Console](https://console.cloud.google.com/)
- [API Library](https://console.cloud.google.com/apis/library)
- [Credenciales](https://console.cloud.google.com/apis/credentials)
- [Cuotas y Límites](https://console.cloud.google.com/apis/dashboard)
- [Documentación de Analytics](https://developers.google.com/analytics)

---

**Última actualización**: Enero 2026  
**Versión**: 1.0

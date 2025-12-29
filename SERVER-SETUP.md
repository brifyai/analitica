# Configuración del Servidor Proxy para Google Analytics

## 📋 Resumen

Este proyecto ahora incluye un servidor proxy Node.js que permite acceder a las APIs de Google Analytics desde el frontend, evitando problemas de CORS y mejorando la seguridad.

## 🚀 Arquitectura de la Solución

```
Frontend (React) → Servidor Proxy (Node.js) → Google Analytics API
```

### Componentes:

1. **Frontend (React)**
   - Archivo: [`src/services/googleAnalyticsService.js`](src/services/googleAnalyticsService.js)
   - Se comunica con el servidor proxy en `http://localhost:3001`

2. **Servidor Proxy (Node.js)**
   - Archivo: [`server.js`](server.js)
   - Escucha en el puerto 3001
   - Maneja CORS y autenticación
   - Se comunica con Google Analytics API

## 📁 Archivos Creados

- `server.js` - Servidor proxy principal
- `server-package.json` - Dependencias del servidor
- `server.env` - Variables de entorno del servidor
- `start-server.js` - Script para iniciar el servidor
- `.env` - Actualizado con `REACT_APP_API_URL`

## 🔧 Configuración

### 1. Variables de Entorno del Frontend

El archivo `.env` ahora incluye:
```env
# Backend Proxy Configuration
REACT_APP_API_URL=http://localhost:3001
```

### 2. Variables de Entorno del Servidor

El archivo `server.env` contiene:
```env
# Configuración del servidor proxy
PORT=3001
NODE_ENV=development
```

## 🚀 Iniciar el Servidor

### Opción 1: Usar el script automatizado

```bash
node start-server.js
```

Este script:
1. Copia `server.env` a `.env`
2. Renombra `server-package.json` a `package.json`
3. Instala las dependencias
4. Inicia el servidor

### Opción 2: Inicio manual

```bash
# 1. Copiar archivo de entorno
copy server.env .env

# 2. Renombrar package.json
copy server-package.json package.json

# 3. Instalar dependencias
npm install

# 4. Iniciar servidor
npm start
```

## 📊 Endpoints del Servidor Proxy

### Obtener Cuentas de Google Analytics
```
GET /api/analytics/accounts
Headers: Authorization: Bearer <access_token>
```

### Obtener Propiedades de una Cuenta
```
GET /api/analytics/properties/:accountId
Headers: Authorization: Bearer <access_token>
```

### Obtener Datos de Analytics
```
POST /api/analytics/data/:propertyId
Headers: Authorization: Bearer <access_token>
Body: {
  metrics: ['sessions', 'users'],
  dimensions: ['date'],
  dateRange: {
    startDate: '30daysAgo',
    endDate: 'today'
  }
}
```

### Health Check
```
GET /api/health
```

## 🔍 Flujo de Autenticación

1. **Frontend** solicita OAuth a Google
2. **Google** redirige al frontend con el código de autorización
3. **Frontend** intercambia el código por tokens (directamente con Google)
4. **Frontend** envía el access token al servidor proxy
5. **Servidor Proxy** usa el token para llamar a Google Analytics API
6. **Google Analytics** responde al servidor proxy
7. **Servidor Proxy** reenvía la respuesta al frontend

## 🛡️ Características de Seguridad

- **Verificación de tokens**: El servidor verifica que cada solicitud incluya un token Bearer válido
- **CORS configurado**: Permite solicitudes desde el frontend
- **Logging**: Todas las solicitudes son registradas para debugging
- **Manejo de errores**: Respuestas de error detalladas y consistentes

## 🐛 Debugging

### Verificar que el servidor está funcionando:

```bash
# Health check
curl http://localhost:3001/api/health
```

### Logs del servidor:

El servidor muestra logs detallados:
- 📥 Solicitudes entrantes
- ✅ Operaciones exitosas
- ❌ Errores con detalles

### Problemas comunes:

1. **Error de conexión**: Verificar que el servidor esté corriendo en el puerto 3001
2. **Error 401**: Verificar que el token de acceso sea válido y esté incluido en los headers
3. **Error CORS**: Verificar la configuración de CORS en el servidor

## 🔄 Desarrollo

### Iniciar servidor en modo desarrollo:

```bash
npm run dev
```

Esto usará `nodemon` para recargar automáticamente el servidor cuando haya cambios.

## 📝 Notas

- El servidor proxy **no almacena** tokens de acceso ni credenciales de Google
- El servidor proxy **no necesita** las credenciales de Google, solo actúa como intermediario
- El frontend sigue manejando el flujo OAuth completo con Google
- La comunicación entre frontend y servidor proxy usa HTTPS en producción

## 🌐 Producción

Para despliegue en producción:

1. Cambiar `REACT_APP_API_URL` en `.env` a la URL del servidor de producción
2. Configurar variables de entorno del servidor para producción
3. Usar HTTPS en el servidor proxy
4. Configurar CORS para el dominio de producción

## 🎯 Beneficios

✅ **Soluciona problemas de CORS** con Google Analytics API  
✅ **Mejora la seguridad** al no exponer claves de API en el frontend  
✅ **Centraliza el logging** de todas las llamadas a Google Analytics  
✅ **Permite caching** y manejo de rate limiting en el futuro  
✅ **Facilita el debugging** con logs detallados  
✅ **Compatible** con el flujo OAuth existente
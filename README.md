# Analitica - TV Radio Dashboard

Esta aplicación es un dashboard de analítica diseñado para ser desplegado en cualquier entorno compatible con Docker (Easypanel, Coolify, VPS, etc.).

## Características

- **Frontend**: React.js
- **Backend**: Express.js unificado (sirve API y estáticos)
- **Despliegue**: Dockerizado (Multi-stage build)

## Configuración Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Iniciar en modo desarrollo (Frontend):
   ```bash
   npm start
   ```

3. Iniciar servidor de producción localmente:
   ```bash
   npm run build
   npm run serve
   ```

## Variables de Entorno

Crear un archivo `.env` basado en `.env.example`:

```env
REACT_APP_GOOGLE_CLIENT_ID=tu_client_id
PORT=3000
```

## Despliegue

Simplemente conecta este repositorio a tu plataforma de despliegue favorita (Coolify, Easypanel) y Docker se encargará del resto.

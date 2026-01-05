# 🚨 Reporte de Estado Actual y Errores Detectados

## 1. Problema de Despliegue en Netlify
- **Situación:** El proyecto usa un servidor backend `Express.js` (`server/index.js`).
- **Conflicto:** Netlify está diseñado para sitios estáticos y Functions, no para correr servidores Express persistentes.
- **Resultado Esperado:** Al desplegar en Netlify "tal cual", el frontend funcionará, pero todas las llamadas a Analytics (`/api/*`) fallarán con error 404 porque el servidor Express no se está ejecutando.

## 2. Estado "Desconectado" en Local
- **Síntoma:** En `localhost`, el dashboard muestra "Desconectado" para Google Analytics.
- **Causa:** Las credenciales de Google OAuth están configuradas para el dominio de producción (`imetrics.cl`), no para `localhost`.
- **Impacto:** Es un comportamiento normal y esperado en desarrollo local. No afecta la funcionalidad en producción.

## 3. Variables de Entorno Faltantes
- **Variable Critica:** `REACT_APP_CHUTES_API_KEY`
- **Detalle:** Esta variable es necesaria para el servicio de análisis de video de Chutes AI. Actualmente el código tiene una clave "quemada" (hardcoded) como fallback, lo cual es una mala práctica de seguridad.
- **Acción Requerida:** Agregar esta clave al archivo `.env` y al panel de configuración del servidor.

## 4. Configuración de Build (CI)
- **Error:** El build falla en Netlify por defecto.
- **Causa:** Netlify trata los "warnings" (advertencias) de React como errores fatales cuando `CI=true` (valor por defecto).
- **Solución:** Configurar la variable de entorno `CI = false` en Netlify.

# 🚀 Sistema de Automatización Coolify + Cloudflare

Este sistema proporciona scripts de automatización para integrar las APIs de Coolify y Cloudflare, permitiendo despliegues end-to-end automatizados.

## 📁 Archivos Incluidos

- `coolify-automation.js` - Script de automatización para Coolify API
- `cloudflare-automation.js` - Script de automatización para Cloudflare API  
- `integrated-automation.js` - Sistema integrado que combina ambas APIs

## 🔧 Configuración Inicial

### Variables de Entorno Requeridas

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```bash
# Coolify Configuration
COOLIFY_URL=https://tu-coolify-instance.com
COOLIFY_API_KEY=tu_api_key_de_coolify
COOLIFY_PROJECT_ID=tu_project_id

# Cloudflare Configuration
CLOUDFLARE_API_TOKEN=tu_api_token_de_cloudflare
CLOUDFLARE_EMAIL=tu_email@ejemplo.com
CLOUDFLARE_API_KEY=tu_api_key_global
CLOUDFLARE_ACCOUNT_ID=tu_account_id
CLOUDFLARE_ZONE_ID=tu_zone_id

# Domain Configuration
DOMAIN=tu-dominio.com
```

### Dependencias

Asegúrate de tener `axios` instalado:

```bash
npm install axios
```

## 🎯 Uso de los Scripts

### 1. Script de Coolify (`coolify-automation.js`)

#### Uso como Módulo

```javascript
const CoolifyAutomation = require('./scripts/coolify-automation');

const automation = new CoolifyAutomation({
    baseURL: 'https://tu-coolify.com',
    apiKey: 'tu_api_key',
    projectId: 'tu_project_id'
});

// Verificar conexión
await automation.checkConnection();

// Desplegar proyecto
const deployment = await automation.deployProject('project_id', {
    environment: 'production',
    branch: 'main',
    forceRebuild: false
});

// Configurar variables de entorno
await automation.setEnvironmentVariables('project_id', {
    NODE_ENV: 'production',
    REACT_APP_VERSION: '1.0.0'
});
```

#### Uso como Script

```bash
# Ejecutar con configuración por defecto
node scripts/coolify-automation.js

# Con variables de entorno
COOLIFY_URL=https://coolify.example.com \
COOLIFY_API_KEY=tu_key \
COOLIFY_PROJECT_ID=tu_project \
node scripts/coolify-automation.js
```

### 2. Script de Cloudflare (`cloudflare-automation.js`)

#### Uso como Módulo

```javascript
const CloudflareAutomation = require('./scripts/cloudflare-automation');

const automation = new CloudflareAutomation({
    apiToken: 'tu_cloudflare_token',
    accountId: 'tu_account_id',
    zoneId: 'tu_zone_id'
});

// Verificar conexión
await automation.checkConnection();

// Crear túnel
const tunnel = await automation.createTunnel({
    name: 'mi-tunel',
    secret: 'mi_secreto'
});

// Configurar DNS para túnel
await automation.setupTunnelDNS(tunnel.id, 'mi-dominio.com', {
    wildcard: true
});

// Configuración SSL
await automation.configureSSL('zone_id', {
    level: 'strict',
    alwaysUseHttps: 'on'
});
```

#### Uso como Script

```bash
# Ejecutar con configuración por defecto
node scripts/cloudflare-automation.js

# Con variables de entorno
CLOUDFLARE_API_TOKEN=tu_token \
CLOUDFLARE_ACCOUNT_ID=tu_account \
CLOUDFLARE_ZONE_ID=tu_zone \
DOMAIN=mi-dominio.com \
node scripts/cloudflare-automation.js
```

### 3. Sistema Integrado (`integrated-automation.js`)

#### Uso como Módulo

```javascript
const IntegratedAutomation = require('./scripts/integrated-automation');

const automation = new IntegratedAutomation({
    coolifyURL: 'https://coolify.example.com',
    coolifyAPIKey: 'tu_coolify_key',
    coolifyProjectId: 'tu_project',
    cloudflareToken: 'tu_cloudflare_token',
    cloudflareAccountId: 'tu_account',
    cloudflareZoneId: 'tu_zone'
});

// Despliegue completo automatizado
const result = await automation.fullDeployment({
    environmentVariables: {
        NODE_ENV: 'production',
        REACT_APP_VERSION: '1.0.0',
        API_BASE_URL: 'https://api.ejemplo.com'
    },
    coolifyDeploymentOptions: {
        branch: 'main',
        forceRebuild: false
    },
    cloudflareSetup: {
        tunnelName: 'mi-app-production',
        domain: 'mi-dominio.com',
        wildcard: true,
        sslConfig: {
            level: 'strict',
            alwaysUseHttps: 'on',
            minTlsVersion: '1.2'
        }
    },
    monitorCoolifyDeployment: true
});

if (result.success) {
    console.log('Despliegue exitoso:', result.deploymentId);
} else {
    console.error('Error en despliegue:', result.error);
}
```

#### Uso como Script

```bash
# Despliegue completo automatizado
node scripts/integrated-automation.js
```

## 📋 Configuración Avanzada

### Ejemplo de Configuración Completa

```javascript
const config = {
    // Variables de entorno para Coolify
    environmentVariables: {
        NODE_ENV: 'production',
        REACT_APP_VERSION: process.env.npm_package_version || '1.0.0',
        API_BASE_URL: 'https://api.ejemplo.com',
        DATABASE_URL: 'postgresql://user:pass@host:5432/db',
        REDIS_URL: 'redis://localhost:6379'
    },
    
    // Opciones de despliegue en Coolify
    coolifyDeploymentOptions: {
        branch: 'main',
        forceRebuild: false,
        environment: 'production'
    },
    
    // Configuración de Cloudflare
    cloudflareSetup: {
        tunnelName: 'mi-app-production',
        domain: 'mi-dominio.com',
        wildcard: true,
        sslConfig: {
            level: 'strict',           // off, flexible, full, strict
            alwaysUseHttps: 'on',      // on, off
            minTlsVersion: '1.2',      // 1.0, 1.1, 1.2, 1.3
            tls13: 'zrt',             // zrt, off
            autoHttpsRewrites: 'on',   // on, off
            opportunisticEncryption: 'on' // on, off
        }
    }
};
```

## 🔍 Funcionalidades Principales

### Coolify Automation

- ✅ Verificación de conexión
- ✅ Gestión de proyectos
- ✅ Despliegues automatizados
- ✅ Configuración de variables de entorno
- ✅ Monitoreo de despliegues
- ✅ Obtención de logs
- ✅ Control de estado (iniciar/detener/reiniciar)

### Cloudflare Automation

- ✅ Verificación de conexión
- ✅ Gestión de túneles
- ✅ Configuración DNS automática
- ✅ Configuración SSL/TLS
- ✅ Reglas de página
- ✅ Reglas de firewall
- ✅ Métricas de túneles

### Sistema Integrado

- ✅ Verificación de ambas conexiones
- ✅ Despliegue end-to-end
- ✅ Configuración automática completa
- ✅ Monitoreo en tiempo real
- ✅ Historial de despliegues
- ✅ Reportes detallados
- ✅ Manejo de errores robusto

## 🚨 Manejo de Errores

Todos los scripts incluyen manejo robusto de errores:

```javascript
try {
    const result = await automation.fullDeployment(config);
    
    if (result.success) {
        console.log('✅ Despliegue exitoso');
        console.log('ID:', result.deploymentId);
        console.log('Duración:', result.details.duration);
    } else {
        console.error('❌ Error:', result.error);
        console.log('Detalles:', result.details);
    }
} catch (error) {
    console.error('💥 Error crítico:', error.message);
}
```

## 📊 Monitoreo y Reportes

El sistema integrado proporciona reportes detallados:

```javascript
// Obtener historial de despliegues
const history = automation.getDeploymentHistory();

// Generar reporte específico
const report = automation.generateDeploymentReport(deploymentId);
console.log('Reporte:', report);
```

## 🔒 Seguridad

- Las API keys se manejan exclusivamente a través de variables de entorno
- No se almacenan credenciales en archivos de configuración
- Validación de conexiones antes de operaciones críticas
- Manejo seguro de errores sin exposición de información sensible

## 📝 Ejemplos de Uso

### Despliegue Básico

```bash
# Solo Coolify
node scripts/coolify-automation.js

# Solo Cloudflare
node scripts/cloudflare-automation.js

# Sistema completo
node scripts/integrated-automation.js
```

### Despliegue con Configuración Personalizada

```javascript
// deployment.js
const IntegratedAutomation = require('./scripts/integrated-automation');

async function deploy() {
    const automation = new IntegratedAutomation();
    
    const config = {
        environmentVariables: {
            NODE_ENV: 'production'
        },
        cloudflareSetup: {
            tunnelName: 'mi-app',
            domain: 'mi-dominio.com'
        }
    };
    
    const result = await automation.fullDeployment(config);
    process.exit(result.success ? 0 : 1);
}

deploy();
```

```bash
node deployment.js
```

## 🎯 Casos de Uso

1. **Despliegue de Desarrollo**: Automatización rápida para entornos de desarrollo
2. **Despliegue de Producción**: Proceso completo con todas las verificaciones
3. **Rollback Automático**: Reversión en caso de errores
4. **Monitoreo Continuo**: Verificación de salud post-despliegue
5. **Configuración Masiva**: Aplicar configuraciones a múltiples proyectos

## 📞 Soporte

Para problemas o mejoras:

1. Verificar variables de entorno
2. Comprobar conectividad de red
3. Validar permisos de API
4. Revisar logs de error detallados

---

**¡Automatiza tus despliegues con confianza! 🚀**

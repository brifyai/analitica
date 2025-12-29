/**
 * Configuración de URLs de redirección OAuth Estándar
 * Detecta automáticamente el dominio actual para configurar la callback URL.
 */

export const getOAuthConfig = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const origin = window.location.origin;
  
  // ... (lógica existente) ...
  
  console.log('🔍 Detectando entorno OAuth:', { hostname, protocol });

  // 🔧 Desarrollo Local
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
    // ...
    return {
      redirectUri: process.env.REACT_APP_REDIRECT_URI_LOCAL || 'http://localhost:3000/callback',
      clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      sslValid: false,
      environment: 'development'
    };
  }

  // 🚀 Producción
  // ...
  let redirectBase = origin;
  
  return {
    redirectUri: `${redirectBase}/callback`,
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    sslValid: protocol === 'https:',
    environment: 'production',
    domain: hostname
  };
};

/**
 * Helper para obtener solo la URI de redirección
 * Mantiene compatibilidad con código existente
 */
export const getRedirectUri = () => {
  return getOAuthConfig().redirectUri;
};

// Mantenemos la exportación antigua por compatibilidad si algo la importa directamente, 
// pero recomendamos usar getOAuthConfig()
export const OAUTH_CONFIG = {
  LOCAL: {
    redirectUri: 'http://localhost:3000/callback',
    environment: 'development'
  },
  PRODUCTION: {
    redirectUri: 'window.location.origin + /callback',
    environment: 'production'
  }
};

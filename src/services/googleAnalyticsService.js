import axios from 'axios';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;
const GOOGLE_AUTH_BASE_URL = 'https://accounts.google.com/o/oauth2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// URL del backend proxy - configuración dinámica
const getApiBaseUrl = () => {
  // Prioridad: variable de entorno > detección automática > fallback
  if (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL !== 'http://localhost:3001') {
    return process.env.REACT_APP_API_URL;
  }
  
  // Detección automática del dominio actual
  const currentOrigin = window.location.origin;
  const isLocalhost = currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1');
  
  if (isLocalhost) {
    return 'http://localhost:3001'; // Desarrollo local
  } else {
    // Producción: usar el mismo dominio pero puerto 3001 o el proxy
    const url = new URL(currentOrigin);
    return `${url.protocol}//${url.hostname}:3001`; // Producción con mismo dominio
  }
};

const API_BASE_URL = getApiBaseUrl();

const GOOGLE_SCOPES = [
  'email',
  'profile',
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/analytics.edit',
  'https://www.googleapis.com/auth/analytics.manage.users.readonly'
];

class GoogleAnalyticsService {
  constructor() {
    this.clientId = GOOGLE_CLIENT_ID;
    this.clientSecret = GOOGLE_CLIENT_SECRET;
    this.apiBaseUrl = API_BASE_URL;
    
    // Debug logging para verificar la URL configurado (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 DEBUG GoogleAnalyticsService constructor:');
      console.log('  - NODE_ENV:', process.env.NODE_ENV);
      console.log('  - REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
      console.log('  - API_BASE_URL final:', this.apiBaseUrl);
      console.log('  - Current origin:', window.location.origin);
    }
  }

  /**
   * Generate OAuth URL for Google authentication
   */
  generateAuthUrl(redirectUri) {
    const invalidClientIds = [
      '560729460022-rjim3hh4e47qkl5nmldpvo1n1iqcfggs.apps.googleusercontent.com',
      'your_google_client_id_here.apps.googleusercontent.com',
      'YOUR_CLIENT_ID.apps.googleusercontent.com'
    ];
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 DEBUG generateAuthUrl:');
      console.log('  - client_id:', this.clientId);
      console.log('  - redirect_uri:', redirectUri);
    }
    
    if (!this.clientId ||
        !this.clientId.includes('.apps.googleusercontent.com') ||
        invalidClientIds.includes(this.clientId)) {
      throw new Error('Google OAuth client_id inválido. Configure credenciales válidas en Google Cloud Console.');
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      scope: GOOGLE_SCOPES.join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true'
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 DEBUG: Parámetros OAuth generados:', params.toString());
      console.log('🔍 DEBUG: URL completa:', `${GOOGLE_AUTH_BASE_URL}?${params.toString()}`);
    }

    return `${GOOGLE_AUTH_BASE_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access and refresh tokens
   * OPTIMIZADO: Reducido timeout y mejor manejo de errores
   */
  async exchangeCodeForTokens(code, redirectUri) {
    console.log('🔄 DEBUG: Iniciando intercambio de código por tokens...');
    console.log('🔄 DEBUG: Código recibido (primeros 20 chars):', code.substring(0, 20) + '...');
    console.log('🔄 DEBUG: Redirect URI:', redirectUri);
    
    try {
      // 🚨 OPTIMIZACIÓN: Timeout reducido para evitar expiración de código
      const response = await axios.post(GOOGLE_TOKEN_URL, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 15000 // 🔧 REDUCIDO: 15 segundos en lugar de 30
      });

      console.log('✅ DEBUG: Tokens obtenidos exitosamente');
      console.log('✅ DEBUG: Access token length:', response.data.access_token?.length || 0);
      console.log('✅ DEBUG: Refresh token available:', !!response.data.refresh_token);
      console.log('✅ DEBUG: Expires in:', response.data.expires_in, 'seconds');
      
      return response.data;
    } catch (error) {
      console.error('❌ Error intercambiando código por tokens:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code
      });
      
      // 🔧 MANEJO MEJORADO de errores específicos
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        console.log('🔍 DEBUG: Error 400 details:', errorData);
        
        // Detectar específicamente códigos expirados
        if (errorData.error === 'invalid_grant' || 
            errorData.error_description?.includes('expired') ||
            errorData.error_description?.includes('invalid') ||
            error.message.includes('expired')) {
          throw new Error('Código de autorización expirado. Esto puede deberse a demoras en el procesamiento. Por favor, intenta conectar nuevamente de forma más rápida.');
        } else {
          throw new Error(`Código de autorización inválido: ${errorData.error_description || error.message}`);
        }
      } else if (error.response?.status === 503) {
        throw new Error('Servicio de Google temporalmente no disponible. Por favor, intenta nuevamente en unos minutos.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('La conexión está tardando demasiado. Por favor, verifica tu conexión e intenta nuevamente.');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('No se puede conectar con Google. Verifica tu conexión a internet.');
      } else {
        throw new Error(`Error al intercambiar código por tokens: ${error.response?.data?.error_description || error.message}`);
      }
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post(GOOGLE_TOKEN_URL, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error refreshing access token:', error.response?.data || error.message);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Get user information from Google
   */
  async getUserInfo(accessToken) {
    try {
      const response = await axios.get(GOOGLE_USERINFO_URL, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting user info:', error.response?.data || error.message);
      throw new Error('Failed to get user information');
    }
  }

  /**
   * Método auxiliar para reintentos automáticos
   */
  async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        const shouldRetry = error.code === 'ECONNABORTED' ||
                           error.response?.status >= 500 ||
                           error.response?.status === 429;
        
        if (isLastAttempt || !shouldRetry) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`🔄 Reintentando en ${delay}ms (intento ${attempt}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Get list of Analytics accounts
   * USANDO API ENDPOINT /api/accounts
   */
  async getAccounts(accessToken) {
    try {
      console.log('🔍 DEBUG: Solicitando cuentas a API propia /api/accounts');
      const response = await axios.get(`${this.apiBaseUrl}/api/accounts`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      console.log('✅ DEBUG: Cuentas obtenidas exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error getting accounts:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        throw new Error('Sesión expirada. Por favor, reconecta tu cuenta.');
      }
      throw new Error(error.response?.data?.error || 'Error al obtener cuentas de Analytics');
    }
  }

  /**
   * Get list of GA4 properties for an account
   * USANDO API ENDPOINT /api/properties/:accountId
   */
  async getProperties(accessToken, accountId) {
    try {
      // Extraer ID numérico si viene en formato accounts/XXXX
      const cleanAccountId = accountId.includes('/') ? accountId.split('/')[1] : accountId;
      
      console.log(`🔍 DEBUG: Solicitando propiedades para cuenta ${cleanAccountId}`);
      const response = await axios.get(`${this.apiBaseUrl}/api/properties/${cleanAccountId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      console.log('✅ DEBUG: Propiedades obtenidas exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error getting properties:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Error al obtener propiedades de Analytics');
    }
  }

  /**
   * Run a report on a GA4 property
   * USANDO API ENDPOINT /api/analytics-proxy
   */
  async runReport(accessToken, propertyId, requestBody) {
    try {
      // Extraer ID numérico si viene en formato properties/XXXX
      const cleanPropertyId = propertyId.includes('/') ? propertyId.split('/')[1] : propertyId;
      
      console.log(`🔍 DEBUG: Ejecutando reporte para propiedad ${cleanPropertyId}`);
      
      const response = await axios.post(
        `${this.apiBaseUrl}/api/analytics-proxy/v1beta/properties/${cleanPropertyId}:runReport`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('❌ Error running report:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || error.response?.data?.error || 'Error al ejecutar reporte de Analytics');
    }
  }

  /**
   * Validate if the access token is still valid
   */
  async validateAccessToken(accessToken) {
    try {
      await this.getUserInfo(accessToken);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Revoke access token
   */
  async revokeAccessToken(accessToken) {
    try {
      await axios.post(`https://oauth2.googleapis.com/revoke?token=${accessToken}`);
      return true;
    } catch (error) {
      console.error('Error revoking access token:', error);
      return false;
    }
  }
}

export const googleAnalyticsService = new GoogleAnalyticsService();
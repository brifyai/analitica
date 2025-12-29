import axios from 'axios';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;
const GOOGLE_AUTH_BASE_URL = 'https://accounts.google.com/oauth2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// URL del backend proxy - CAMBIAR EN PRODUCCIÓN
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

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
    
    console.log('🔍 DEBUG generateAuthUrl:');
    console.log('  - client_id:', this.clientId);
    console.log('  - redirect_uri:', redirectUri);
    
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

    return `${GOOGLE_AUTH_BASE_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access and refresh tokens
   */
  async exchangeCodeForTokens(code, redirectUri) {
    try {
      const response = await axios.post(GOOGLE_TOKEN_URL, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error.response?.data || error.message);
      throw new Error('Failed to exchange authorization code for tokens');
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
   * Get list of Google Analytics accounts - USA PROXY BACKEND
   */
  async getAccounts(accessToken) {
    try {
      console.log('🔍 DEBUG: Llamando al backend proxy para obtener cuentas');
      console.log('🔍 DEBUG: API URL:', `${this.apiBaseUrl}/api/analytics/accounts`);
      
      const response = await axios.get(`${this.apiBaseUrl}/api/analytics/accounts`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      console.log('✅ DEBUG: Respuesta exitosa del backend');
      console.log('✅ DEBUG: Cuentas encontradas:', response.data.length || 0);

      return response.data;
      
    } catch (error) {
      console.error('❌ ERROR DETALLADO al obtener cuentas:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        isNetworkError: !error.response,
        isTimeout: error.code === 'ECONNABORTED'
      });
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Error de timeout: La conexión tardó demasiado tiempo. Verifica tu conexión a internet.');
      } else if (!error.response) {
        throw new Error(`Error de conexión: No se puede conectar con el servidor backend en ${this.apiBaseUrl}. Verifica que el servidor esté corriendo.`);
      } else if (error.response?.status === 401) {
        throw new Error('Error de autenticación: el token de acceso ha expirado o es inválido. Por favor, vuelve a conectar tu cuenta de Google Analytics.');
      } else if (error.response?.status === 403) {
        throw new Error('Error de permisos: no tienes acceso a las cuentas de Google Analytics. Verifica los permisos de tu aplicación en Google Cloud Console.');
      } else if (error.response?.status === 429) {
        throw new Error('Límite de velocidad excedido: Google Analytics ha recibido demasiadas solicitudes. Por favor, espera unos minutos e intenta nuevamente.');
      } else if (error.response?.status >= 500) {
        throw new Error('Error del servidor: el servicio no está disponible temporalmente. Por favor, intenta más tarde.');
      } else {
        throw new Error(`Error al obtener cuentas: ${error.response?.data?.error || error.message}`);
      }
    }
  }

  /**
   * Get list of properties for a specific account - USA PROXY BACKEND
   */
  async getProperties(accessToken, accountId) {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/api/analytics/properties/${accountId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
      
    } catch (error) {
      console.error('Error getting properties:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error('Error de autenticación: el token de acceso ha expirado. Por favor, vuelve a conectar tu cuenta.');
      } else if (error.response?.status === 403) {
        throw new Error('Error de permisos: no tienes acceso a las propiedades de esta cuenta.');
      } else if (error.response?.status === 404) {
        throw new Error('Cuenta no encontrada: la cuenta especificada no existe o no tienes acceso a ella.');
      } else {
        throw new Error(`Error al obtener propiedades: ${error.response?.data?.error || error.message}`);
      }
    }
  }

  /**
   * Get analytics data for a specific property - USA PROXY BACKEND
   */
  async getAnalyticsData(accessToken, propertyId, metrics, dimensions, dateRange) {
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/api/analytics/data/${propertyId}`,
        {
          metrics,
          dimensions,
          dateRange
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
      
    } catch (error) {
      console.error('Error getting analytics data:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error('Error de autenticación: el token de acceso ha expirado o es inválido. Por favor, vuelve a conectar tu cuenta.');
      } else if (error.response?.status === 403) {
        throw new Error('Error de permisos: no tienes acceso a los datos de esta propiedad.');
      } else if (error.response?.status === 400) {
        throw new Error('Solicitud inválida: verifica las métricas, dimensiones y rango de fechas seleccionados.');
      } else if (error.response?.status === 429) {
        throw new Error('Límite de velocidad excedido: espera unos minutos e intenta nuevamente.');
      } else {
        throw new Error(`Error al obtener datos de analytics: ${error.response?.data?.error || error.message}`);
      }
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
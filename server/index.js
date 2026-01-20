const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const axios = require('axios');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de seguridad y middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"], 
      connectSrc: ["'self'", "https://api.supabase.co", "https://www.googleapis.com", "https://analyticsdata.googleapis.com", "https://analyticsadmin.googleapis.com"],
    },
  },
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logger básico
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Middleware de autenticación para API
const verifyAuthToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autorización no proporcionado o inválido' });
  }
  req.accessToken = authHeader.substring(7);
  next();
};

// --- API ROUTES ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), env: process.env.NODE_ENV });
});

// Get Accounts (Reemplaza netlify/functions/get-accounts.js)
app.get('/api/accounts', verifyAuthToken, async (req, res) => {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: req.accessToken });

    const response = await google.analyticsadmin('v1beta').accounts.list({ auth });
    res.json(response.data.accounts || []);
  } catch (error) {
    console.error('Error en /api/accounts:', error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// Get Properties (Reemplaza netlify/functions/get-properties.js)
app.get('/api/properties/:accountId', verifyAuthToken, async (req, res) => {
  try {
    const { accountId } = req.params;
    if (!accountId) return res.status(400).json({ error: 'accountId requerido' });

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: req.accessToken });

    const response = await google.analyticsadmin('v1beta').properties.list({
      filter: `parent:accounts/${accountId}`,
      auth
    });
    res.json(response.data.properties || []);
  } catch (error) {
    console.error('Error en /api/properties:', error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// Analytics Proxy (Reemplaza netlify/functions/analytics-proxy.js)
app.all('/api/analytics-proxy/*', verifyAuthToken, async (req, res) => {
  // Extraer el path relativo después de /api/analytics-proxy
  // Ejemplo: /api/analytics-proxy/v1beta/properties/X:runReport -> /v1beta/properties/X:runReport
  const match = req.path.match(/\/api\/analytics-proxy(.*)/);
  const targetPath = match ? match[1] : '';
  
  if (!targetPath) {
      // Si no hay path extra, intentamos ver si el usuario quería llamar a la raíz de la API (raro)
      // O quizás es un error.
      // Pero por compatibilidad, si targetPath está vacío, podríamos intentar usar la URL base.
  }

  const GOOGLE_ANALYTICS_API_BASE = 'https://analyticsdata.googleapis.com';
  const url = `${GOOGLE_ANALYTICS_API_BASE}${targetPath}`;
  
  try {
    const response = await axios({
      method: req.method,
      url: url,
      headers: {
        'Authorization': `Bearer ${req.accessToken}`,
        'Content-Type': 'application/json'
      },
      data: req.body,
      params: req.query
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`Error en proxy analytics (${url}):`, error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Error de conexión con Google Analytics' });
    }
  }
});

// --- FRONTEND SERVING ---

// Servir archivos estáticos del build de React
// Asumimos que el build se genera en ../build relativo a este archivo
const buildPath = path.join(__dirname, '..', 'build');
app.use(express.static(buildPath));

// Manejar SPA (cualquier ruta no capturada por API o estáticos devuelve index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
  console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
});

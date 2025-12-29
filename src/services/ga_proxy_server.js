// server.js - Backend proxy para Google Analytics
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar CORS para permitir requests desde tu frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Endpoint para obtener cuentas
app.get('/api/analytics/accounts', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const accessToken = authHeader.replace('Bearer ', '');
    
    console.log('📊 Obteniendo cuentas de Google Analytics...');
    
    const response = await axios.get(
      'https://analyticsdata.googleapis.com/v1beta/accountSummaries:list',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    // Transformar respuesta
    const accounts = response.data.accountSummaries?.map(account => ({
      id: account.account,
      name: account.displayName,
      propertySummaries: account.propertySummaries?.map(property => ({
        id: property.property,
        name: property.displayName,
        type: property.propertyType
      })) || []
    })) || [];

    console.log(`✅ ${accounts.length} cuentas encontradas`);
    res.json(accounts);

  } catch (error) {
    console.error('❌ Error al obtener cuentas:', error.response?.data || error.message);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Timeout al conectar con Google Analytics' });
    }
    
    if (!error.response) {
      return res.status(503).json({ error: 'No se puede conectar con Google Analytics' });
    }
    
    res.status(error.response.status || 500).json({
      error: error.response?.data?.error?.message || 'Error al obtener cuentas'
    });
  }
});

// Endpoint para obtener propiedades
app.get('/api/analytics/properties/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const accessToken = authHeader.replace('Bearer ', '');
    
    const response = await axios.get(
      'https://analyticsdata.googleapis.com/v1beta/accountSummaries',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const accountData = response.data.accountSummaries?.find(
      acc => acc.account === accountId
    );
    
    const properties = accountData?.propertySummaries?.map(property => ({
      id: property.property,
      name: property.displayName,
      type: property.propertyType,
      accountId: accountId
    })) || [];

    res.json(properties);

  } catch (error) {
    console.error('Error al obtener propiedades:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || 'Error al obtener propiedades'
    });
  }
});

// Endpoint para obtener datos de analytics
app.post('/api/analytics/data/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { metrics, dimensions, dateRange } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const accessToken = authHeader.replace('Bearer ', '');
    
    const requestBody = {
      metrics: metrics.map(metric => ({ name: metric })),
      dimensions: dimensions.map(dimension => ({ name: dimension })),
      dateRanges: [{
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }],
      orderBys: [{
        metric: { metricName: metrics[0] },
        desc: true
      }],
      limit: 1000,
      offset: 0
    };

    const response = await axios.post(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Transformar respuesta
    const transformedData = {
      rows: response.data.rows?.map(row => {
        const rowData = {};
        
        row.dimensionValues?.forEach((dimension, index) => {
          rowData[dimensions[index]] = dimension.value;
        });
        
        row.metricValues?.forEach((metric, index) => {
          rowData[metrics[index]] = parseFloat(metric.value) || 0;
        });
        
        return rowData;
      }) || [],
      
      totals: response.data.totals?.map(total => {
        const totalData = {};
        total.metricValues?.forEach((metric, index) => {
          totalData[metrics[index]] = parseFloat(metric.value) || 0;
        });
        return totalData;
      }) || [],
      
      metadata: {
        currencyCode: response.data.metadata?.currencyCode,
        timeZone: response.data.metadata?.timeZone,
        emptyReason: response.data.metadata?.emptyReason
      }
    };

    res.json(transformedData);

  } catch (error) {
    console.error('Error al obtener datos:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || 'Error al obtener datos'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server corriendo en http://localhost:${PORT}`);
});

module.exports = app;
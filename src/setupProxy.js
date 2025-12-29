const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API calls to Supabase during development
  app.use(
    '/supabase',
    createProxyMiddleware({
      target: process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co',
      changeOrigin: true,
      pathRewrite: {
        '^/supabase': '', // remove /supabase prefix when forwarding
      },
    })
  );

  // Proxy Google Analytics API calls to local server during development
  app.use(
    '/api/analytics',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      pathRewrite: {
        '^/api/analytics': '/api/analytics', // keep the same path
      },
      onProxyReq: (proxyReq, req, res) => {
        // Forward authorization header
        if (req.headers.authorization) {
          proxyReq.setHeader('Authorization', req.headers.authorization);
        }
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Proxy server error' });
      }
    })
  );

  // Proxy Google APIs during development
  app.use(
    '/google-api',
    createProxyMiddleware({
      target: 'https://www.googleapis.com',
      changeOrigin: true,
      pathRewrite: {
        '^/google-api': '', // remove /google-api prefix when forwarding
      },
      onProxyReq: (proxyReq, req, res) => {
        // Add any additional headers if needed
        proxyReq.setHeader('User-Agent', 'iMetrics/1.0');
      },
    })
  );
};
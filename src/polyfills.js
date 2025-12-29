// Polyfills para módulos de Node.js en el navegador
global.Buffer = require('buffer').Buffer;
global.process = require('process');

// Polyfills para módulos que pptxgenjs necesita
if (typeof window !== 'undefined') {
  // Polyfill for fs module
  window.require = window.require || function() { return {}; };
  
  // Polyfill for https module
  window.https = window.https || {};
  
  // Polyfill for http module
  window.http = window.http || {};
  
  // Polyfill for crypto module
  window.crypto = window.crypto || {
    randomBytes: () => Buffer.alloc(32),
    createHash: () => ({
      update: () => ({ digest: () => 'placeholder' })
    })
  };
}
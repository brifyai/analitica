import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

console.log('🚀 APP INIT: Starting simple application...');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('✅ APP INIT: Simple application rendered');
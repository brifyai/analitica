import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import AppFallback from './components/AppFallback';

// Add console logging to track app initialization
console.log('🚀 APP INIT: Starting application initialization...');

// Track if the app loads successfully
let appLoaded = false;
const APP_LOAD_TIMEOUT = 15000; // 15 seconds

// Set a timeout to detect if the app is taking too long to load
const loadTimeout = setTimeout(() => {
  if (!appLoaded) {
    console.error('❌ APP TIMEOUT: Application took too long to load');
    // Show fallback UI
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<AppFallback error={new Error('Application timeout: The app took too long to load')} />);
  }
}, APP_LOAD_TIMEOUT);

// Error boundary for the entire app
const renderApp = () => {
  try {
    console.log('🚀 APP INIT: Rendering App component...');
    
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // Mark app as loaded successfully
    appLoaded = true;
    clearTimeout(loadTimeout);
    console.log('✅ APP INIT: Application loaded successfully');
    
  } catch (error) {
    console.error('❌ APP INIT: Error rendering app:', error);
    clearTimeout(loadTimeout);
    
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<AppFallback error={error} />);
  }
};

// Handle uncaught errors at the root level
window.addEventListener('error', (event) => {
  console.error('❌ ROOT ERROR:', event.error);
  if (!appLoaded) {
    clearTimeout(loadTimeout);
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<AppFallback error={event.error} />);
  }
});

// Handle unhandled promise rejections at the root level
window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ ROOT UNHANDLED REJECTION:', event.reason);
  if (!appLoaded) {
    clearTimeout(loadTimeout);
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<AppFallback error={event.reason} />);
  }
});

// Start the app
renderApp();
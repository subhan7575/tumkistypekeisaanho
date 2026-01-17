import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Setup environment variables shim
if (typeof window !== 'undefined') {
  window.process = window.process || { env: {} };
  // Fallback for API_KEY if not injected
  window.process.env = window.process.env || {};
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Mounting point #root not found");
}

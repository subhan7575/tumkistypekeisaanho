
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Setup environment variables shim
if (typeof window !== 'undefined') {
  // Using 'any' cast for window to bypass strict NodeJS.Process type requirements for the shim.
  (window as any).process = (window as any).process || { env: {} };
  // Fallback for API_KEY if not injected
  (window as any).process.env = (window as any).process.env || {};
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

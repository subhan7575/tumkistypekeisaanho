import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Setup environment variables shim
if (typeof window !== 'undefined') {
  // Using 'any' cast for window to bypass strict NodeJS.Process type requirements
  const win = window as any;
  win.process = win.process || { env: {} };
  win.process.env = win.process.env || {};
  
  // If the environment is Vercel and variables are provided, they might be here
  // Note: For static deployments, this normally requires a build step.
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

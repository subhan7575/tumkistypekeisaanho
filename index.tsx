import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Setup environment variables shim
if (typeof window !== 'undefined') {
  const win = window as any;
  win.process = win.process || { env: {} };
  
  // Robust check for various injection points
  const injectedEnv = (window as any)._env_ || (window as any).env || {};
  win.process.env = {
    ...win.process.env,
    ...injectedEnv
  };
  
  // Note: For pure static Vercel deployments, variables aren't injected automatically 
  // into the browser unless using a framework. 
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

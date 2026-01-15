
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Shim process.env for the browser environment to ensure standard SDK access to keys
// Fix: Use type casting to check for non-standard window.process property to avoid TS error
if (typeof window !== 'undefined' && !(window as any).process) {
  (window as any).process = { env: {} };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

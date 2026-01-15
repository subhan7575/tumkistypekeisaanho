
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Shim process.env for the browser environment to ensure standard SDK access to keys
if (typeof window !== 'undefined' && !(window as any).process) {
  (window as any).process = { env: {} };
}

// Diagnostic check for API key presence (doesn't log the key itself)
if (typeof process !== 'undefined' && process.env) {
  if (process.env.API_KEY) {
    console.log("✅ Diagnostic: API_KEY detected in process.env");
  } else {
    console.warn("⚠️ Diagnostic: API_KEY is missing from process.env");
  }
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

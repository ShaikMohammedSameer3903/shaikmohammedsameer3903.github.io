import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ─── SRE: Global Promise & Error Safety ──────────────────────
window.addEventListener('unhandledrejection', (event) => {
  // Handle Supabase auth lock errors gracefully
  if (event.reason?.message?.includes('lock')) {
    console.warn('🔐 Auth lock detected, handling gracefully');
    event.preventDefault(); // Prevent unhandled rejection
    return;
  }
  
  console.error('🚨 UNHANDLED PROMISE:', event.reason);
  // Optional: Send to logging service
});

window.onerror = (message, source, lineno, colno, error) => {
  // Handle Supabase lock errors gracefully
  if (error?.message?.includes('lock')) {
    console.warn('🔐 Auth lock error, handling gracefully');
    return true; // Prevent default error handling
  }
  
  console.error('🚨 GLOBAL ERROR:', { message, source, lineno, colno, error });
  return false; // Let default browser handling continue
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

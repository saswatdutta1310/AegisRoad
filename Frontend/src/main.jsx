import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import App from './App.jsx';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <ToastContainer 
      position="top-right" 
      theme="light" 
      autoClose={3000}
      toastStyle={{ 
        background: '#F4F0E6', 
        color: '#072E24',
        border: '1px solid rgba(13,30,27,0.12)',
        borderRadius: '12px',
        fontFamily: 'Inter, sans-serif',
        fontSize: '13px',
        fontWeight: 600,
        boxShadow: '0 8px 24px rgba(7,46,36,0.12)'
      }}
    />
  </StrictMode>
);

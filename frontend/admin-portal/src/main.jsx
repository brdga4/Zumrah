import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@student/index.css';
import ToastProvider from '@student/Components/ToastProvider.jsx';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
);
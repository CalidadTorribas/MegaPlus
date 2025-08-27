/**
 * Main Entry Point - Mega+
 * 
 * Punto de entrada principal de la aplicación React
 * Configura providers y renderiza la aplicación
 */

import React from 'react';
import ReactDOM from 'react-dom/client';

// Importar estilos globales
import '@/styles/globals.css';

// Importar componente raíz de la aplicación
import App from './App';

// Crear root y renderizar aplicación
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
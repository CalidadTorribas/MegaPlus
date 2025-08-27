/**
 * AppWithFooterLayout.tsx - Layout para páginas normales sin header
 * Para: ProductosScreen y futuras páginas de la aplicación
 */

import React from 'react';

interface AppWithFooterLayoutProps {
  children: React.ReactNode;
  /** Título de la página que se muestra en el contenido */
  pageTitle?: string;
  /** Función para volver al hub */
  onBackToHub?: () => void;
  /** Función para salir de la aplicación */
  onExitApp?: () => void;
  /** Función personalizada para botón de retroceso (si no se quiere ir al hub) */
  onBack?: () => void;
  /** Mostrar botón de retroceso en lugar del botón hub */
  showBackButton?: boolean;
  /** Texto personalizado para el botón de retroceso */
  backButtonText?: string;
}

export const AppWithFooterLayout: React.FC<AppWithFooterLayoutProps> = ({
  children,
  pageTitle,
  onBackToHub,
  onExitApp,
  onBack,
  showBackButton = false,
  backButtonText = "Atrás"
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div 
          className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
          style={{ 
            height: '800px',
            minHeight: '800px',
            maxHeight: '800px'
          }}
        >
          {/* Contenido principal */}
          <div 
            className="flex-1 overflow-y-auto"
            style={{ 
              height: '736px', // 800px - 64px del footer
              minHeight: '736px',
              maxHeight: '736px'
            }}
          >
            {children}
          </div>

          {/* Footer minimalista fijo */}
          <div 
            className="bg-white border-t border-neutral-200 px-6 py-3 flex-shrink-0"
            style={{ 
              height: '64px',
              minHeight: '64px',
              maxHeight: '64px'
            }}
          >
            <div className="flex items-center justify-between h-full">
              {/* Botón izquierdo - Inicio o Back */}
              {showBackButton ? (
                <button
                  onClick={onBack}
                  className="flex items-center space-x-2 px-3 py-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>{backButtonText}</span>
                </button>
              ) : (
                <button
                  onClick={onBackToHub}
                  className="flex items-center space-x-2 px-3 py-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Inicio</span>
                </button>
              )}

              {/* Espacio central sin título */}
              <div className="flex-1"></div>

              {/* Botón derecho - Salir */}
              <button
                onClick={onExitApp}
                className="flex items-center space-x-2 px-3 py-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppWithFooterLayout;
/**
 * HubLayout.tsx - Layout especial solo para la página Hub
 * Header reducido (1/3 del tamaño) + Footer minimalista
 */

import React from 'react';
import { ConditionalMobileWrapper } from '@/components/wrappers/ConditionalMobileWrapper';

interface HubLayoutProps {
  children: React.ReactNode;
  /** Función para salir de la aplicación */
  onExitApp?: () => void;
}

export const HubLayout: React.FC<HubLayoutProps> = ({
  children,
  onExitApp
}) => {
  return (
    <ConditionalMobileWrapper>
          
          {/* Header reducido - ajustado para que quepa bien el contenido */}
          <div 
            className="logo-bg-primary px-6 py-3 text-center flex-shrink-0"
            style={{ 
              height: '100px',
              minHeight: '100px',
              maxHeight: '100px'
            }}
          >
            {/* Logo reducido - ajustado */}
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 flex items-center justify-center">
                <img 
                  src="/src/assets/images/logos/logo.svg" 
                  alt="Mega+ Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            {/* Nombre de la aplicación reducido - tamaño más adecuado */}
            <h1 
              className="text-lg text-white"
              style={{ 
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                letterSpacing: '-0.02em',
                fontWeight: '300'
              }}
            >
              Mega<sup className="text-xs font-normal">+</sup>
            </h1>
          </div>

          {/* Contenido principal - altura ajustada */}
          <div 
            className="px-6 py-4 flex-1 overflow-y-auto"
            style={{ 
              height: '636px', // 800px - 100px header - 64px footer
              minHeight: '636px',
              maxHeight: '636px'
            }}
          >
            {children}
          </div>

          {/* Footer minimalista */}
          <div 
            className="bg-white border-t border-neutral-200 px-6 py-3 flex-shrink-0"
            style={{ 
              height: '64px',
              minHeight: '64px',
              maxHeight: '64px'
            }}
          >
            <div className="flex items-center justify-center h-full">
              {/* Solo botón de salir centrado */}
              <button
                onClick={onExitApp}
                className="flex items-center space-x-2 px-4 py-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Salir de la aplicación</span>
              </button>
            </div>
          </div>
    </ConditionalMobileWrapper>
  );
};

export default HubLayout;
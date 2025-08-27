/**
 * Mobile Screen Layout Component - Mega+ (Corregido)
 * 
 * Layout universal que soporta headers de branding y funcionales
 * Mantiene dimensiones exactas (800px total) para transiciones perfectas
 */

import React from 'react';

export interface HeaderBranding {
  type: 'branding';
  showLogo?: boolean;
}

export interface HeaderFunctional {
  type: 'functional';
  title: string;
  subtitle?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  showBackButton?: boolean;
  onBackClick?: () => void;
  backButtonText?: string;
}

export interface MobileScreenLayoutProps {
  /** Contenido principal de la pantalla */
  children: React.ReactNode;
  /** Configuración del header */
  header: HeaderBranding | HeaderFunctional;
  /** Texto personalizado del footer (opcional) */
  footerText?: string;
  /** Elementos decorativos de fondo (opcional) */
  showBackgroundDecorations?: boolean;
  /** Si mostrar el footer (por defecto true) */
  showFooter?: boolean;
}

export const MobileScreenLayout: React.FC<MobileScreenLayoutProps> = ({
  children,
  header,
  footerText = "© 2025 Mega+. Sistema Empresarial.",
  showBackgroundDecorations = false,
  showFooter = true
}) => {
  const renderHeader = () => {
    if (header.type === 'branding') {
      return (
        <div 
          className="logo-bg-primary px-8 py-8 text-center flex-shrink-0"
          style={{ 
            height: '280px',
            minHeight: '280px',
            maxHeight: '280px'
          }}
        >
          {header.showLogo !== false && (
            <>
              <div className="flex justify-center mb-2">
                <div className="w-40 h-40 flex items-center justify-center">
                  <img 
                    src="/logo.svg"
                    alt="Mega+ Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              
              <h1 
                className="text-5xl text-white" 
                style={{ 
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                  fontWeight: '300',
                  letterSpacing: '-0.02em',
                  overflow: 'visible'
                }}
              >
                Mega<sup className="text-3xl font-normal">+</sup>
              </h1>
            </>
          )}
        </div>
      );
    }

    // Header funcional
    return (
      <div 
        className="bg-white border-b border-neutral-200 px-6 py-4 flex-shrink-0"
        style={{ 
          height: '280px',
          minHeight: '280px',
          maxHeight: '280px'
        }}
      >
        <div className="h-full flex flex-col justify-center">
          {/* Fila superior - Navegación */}
          <div className="flex items-center justify-between mb-8">
            {/* Lado izquierdo */}
            <div className="flex items-center space-x-3">
              {header.showBackButton && (
                <button
                  onClick={header.onBackClick}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-100 transition-colors group"
                  title={header.backButtonText || "Volver atrás"}
                >
                  <svg className="w-5 h-5 text-neutral-600 group-hover:text-neutral-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {header.backButtonText && (
                    <span className="text-sm text-neutral-600 group-hover:text-neutral-800 transition-colors">
                      {header.backButtonText}
                    </span>
                  )}
                </button>
              )}
              {header.leftAction}
            </div>

            {/* Logo pequeño en esquina */}
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                src="/logo.svg"
                alt="Mega+ Logo" 
                className="w-full h-full object-contain opacity-70 hover:opacity-90 transition-opacity"
              />
            </div>

            {/* Lado derecho */}
            <div className="flex items-center space-x-3">
              {header.rightAction}
            </div>
          </div>

          {/* Área central - Títulos */}
          <div className="text-center flex-1 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-neutral-800 mb-3 leading-tight">
              {header.title}
            </h1>
            {header.subtitle && (
              <p className="text-neutral-600 text-lg leading-relaxed">
                {header.subtitle}
              </p>
            )}
          </div>

          {/* Espaciador inferior */}
          <div className="h-8"></div>
        </div>
      </div>
    );
  };

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
          
          {/* Header dinámico */}
          {renderHeader()}

          {/* Contenido principal */}
          <div 
            className="px-8 py-8 flex-1 overflow-y-auto" 
            style={{ 
              height: showFooter ? '456px' : '520px',
              minHeight: showFooter ? '456px' : '520px',
              maxHeight: showFooter ? '456px' : '520px'
            }}
          >
            <div className="h-full flex flex-col">
              {children}
            </div>
          </div>

          {/* Footer */}
          {showFooter ? (
            <div 
              className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex-shrink-0"
              style={{ 
                height: '64px',
                minHeight: '64px',
                maxHeight: '64px'
              }}
            >
              <div className="flex items-center justify-center h-full">
                <p className="text-center text-sm text-neutral-600 leading-tight">
                  {footerText}
                </p>
              </div>
            </div>
          ) : (
            <div 
              className="flex-shrink-0"
              style={{ 
                height: '64px',
                minHeight: '64px',
                maxHeight: '64px'
              }}
            >
            </div>
          )}
        </div>
      </div>

      {/* Elementos decorativos de fondo */}
      {showBackgroundDecorations && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-secondary-100 rounded-full blur-3xl opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary-50/20 to-transparent" />
        </div>
      )}
    </div>
  );
};

export default MobileScreenLayout;
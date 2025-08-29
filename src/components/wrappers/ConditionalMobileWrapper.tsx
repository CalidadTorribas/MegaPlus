/**
 * ConditionalMobileWrapper - Wrapper condicional para simulación móvil
 * Muestra contenedor móvil en development+desktop, pantalla completa en el resto
 */

import React from 'react';
import { useDeviceAndEnvironment } from '@/hooks/useDeviceAndEnvironment';

interface ConditionalMobileWrapperProps {
  children: React.ReactNode;
  /** Clase CSS adicional para el contenedor interno */
  containerClassName?: string;
  /** Estilo adicional para el contenedor interno */
  containerStyle?: React.CSSProperties;
}

export const ConditionalMobileWrapper: React.FC<ConditionalMobileWrapperProps> = ({
  children,
  containerClassName = '',
  containerStyle = {}
}) => {
  const { shouldShowMobileSimulation } = useDeviceAndEnvironment();

  if (shouldShowMobileSimulation) {
    // MODO DESARROLLO + DESKTOP: Simulación móvil (como antes)
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div 
            className={`bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col ${containerClassName}`}
            style={{ 
              height: '800px',
              minHeight: '800px',
              maxHeight: '800px',
              ...containerStyle
            }}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }

  // MODO PRODUCCIÓN O MÓVIL REAL: Pantalla completa nativa
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div 
        className={`bg-white flex flex-col flex-1 ${containerClassName}`}
        style={{
          minHeight: '100vh',
          ...containerStyle
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ConditionalMobileWrapper;
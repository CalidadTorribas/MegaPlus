/**
 * Splash Screen Component - Mega+ (CORREGIDO - Idéntico a Login)
 * 
 * Pantalla de inicio IDÉNTICA al LoginScreen para transiciones perfectas
 * - Logo aparece inmediatamente
 * - Tipografía exactamente igual al LoginScreen  
 * - Header completamente idéntico
 * - Solo el contenido cambia (loader vs formulario)
 */

import React, { useEffect, useState } from 'react';
import { MobileScreenLayout } from '@/components/templates/MobileScreenLayout';

interface SplashScreenProps {
  /** Función que se ejecuta cuando termina la animación */
  onAnimationComplete?: () => void;
  /** Duración total del splash en milisegundos */
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onAnimationComplete,
  duration = 3000,
}) => {
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(true);

  // Animación de progreso suave
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min((elapsed / duration) * 100, 100);
      setProgress(progressPercent);

      if (progressPercent >= 100) {
        clearInterval(interval);
        // Pequeño delay antes de completar
        setTimeout(() => {
          onAnimationComplete?.();
        }, 200);
      }
    }, 50); // Update cada 50ms para progreso suave

    return () => clearInterval(interval);
  }, [duration, onAnimationComplete]);

  // Fade out en los últimos 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(false);
    }, duration - 500);

    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <MobileScreenLayout
      header={{ type: 'branding' }}
      showFooter={true}
      footerText="Inicializando sistema empresarial..."
      showBackgroundDecorations={true}
    >
      {/* Contenido con altura fija idéntica al LoginScreen */}
      <div className="h-full flex flex-col justify-center">
        <div 
          className={`
            space-y-8 transition-opacity duration-500 ease-out
            ${showContent ? 'opacity-100' : 'opacity-0'}
          `}
        >
          {/* Título del sistema - IDÉNTICA tipografía al LoginScreen */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-secondary-600">
              Sistema de gestión de calidad
            </h2>
          </div>

          {/* Mensaje de carga */}
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <p className="text-lg font-medium text-neutral-700">
                Cargando aplicación...
              </p>
              <p className="text-sm text-neutral-600">
                Inicializando módulos del sistema
              </p>
            </div>

            {/* Indicador de progreso profesional */}
            <div className="space-y-4">
              {/* Dots animados */}
              <div className="flex justify-center space-x-2">
                <div 
                  className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"
                  style={{ animationDelay: '0ms', animationDuration: '1.5s' }}
                />
                <div 
                  className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"
                  style={{ animationDelay: '200ms', animationDuration: '1.5s' }}
                />
                <div 
                  className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"
                  style={{ animationDelay: '400ms', animationDuration: '1.5s' }}
                />
              </div>

              {/* Barra de progreso */}
              <div className="w-full max-w-xs mx-auto">
                <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-100 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {/* Porcentaje */}
                <div className="text-center mt-2">
                  <span className="text-xs text-neutral-500 font-mono">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Estados de carga detallados */}
          <div className="text-center space-y-2">
            <p className="text-xs text-neutral-500">
              {progress < 30 && "Conectando con servidor..."}
              {progress >= 30 && progress < 60 && "Cargando configuración..."}
              {progress >= 60 && progress < 90 && "Inicializando interfaz..."}
              {progress >= 90 && "Preparando aplicación..."}
            </p>
            {/* Número de versión */}
            <p className="text-xs text-neutral-400 font-mono">
              v1.1.0
            </p>
          </div>
        </div>
      </div>
    </MobileScreenLayout>
  );
};

export default SplashScreen;
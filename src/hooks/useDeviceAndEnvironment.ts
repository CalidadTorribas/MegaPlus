/**
 * Hook para detectar entorno de desarrollo y tipo de dispositivo
 * Determina cuándo mostrar simulación móvil vs pantalla completa
 */

import { useState, useEffect } from 'react';

interface DeviceEnvironment {
  /** Si estamos en modo desarrollo */
  isDevelopment: boolean;
  /** Si estamos en un dispositivo móvil real (pantalla < 768px) */
  isMobileDevice: boolean;
  /** Si estamos en desktop con pantalla grande */
  isDesktopDevice: boolean;
  /** Si debemos mostrar el contenedor de simulación móvil */
  shouldShowMobileSimulation: boolean;
}

export const useDeviceAndEnvironment = (): DeviceEnvironment => {
  const [windowWidth, setWindowWidth] = useState<number>(0);

  useEffect(() => {
    // Establecer el ancho inicial
    setWindowWidth(window.innerWidth);

    // Listener para cambios de tamaño de ventana
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Detectar entorno de desarrollo
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Detectar dispositivo móvil real (< 768px)
  const isMobileDevice = windowWidth > 0 && windowWidth < 768;
  
  // Detectar desktop (>= 768px)
  const isDesktopDevice = windowWidth >= 768;
  
  // Lógica: Mostrar simulación móvil SOLO en development Y en desktop
  const shouldShowMobileSimulation = isDevelopment && isDesktopDevice;

  return {
    isDevelopment,
    isMobileDevice,
    isDesktopDevice,
    shouldShowMobileSimulation
  };
};
/** @type {import('tailwindcss').Config} */
import type { Config } from 'tailwindcss';

const config: Config = {
  // Archivos a procesar
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  
  // Modo oscuro basado en clase
  darkMode: 'class',
  
  theme: {
    extend: {
      // COLORES - Paleta base funcional
      colors: {
        // Colores primarios (basados en tu manifiesto)
        primary: {
          50: '#f0f9e8',
          100: '#d9f0c4',
          200: '#b8e397',
          300: '#94d465',
          400: '#75c63f',
          500: '#4c8b2c',  // Color principal verde
          600: '#3d7023',
          700: '#2f5519',
          800: '#213a11',
          900: '#131f08',
        },
        
        // Colores secundarios
        secondary: {
          50: '#f5f1f0',
          100: '#e8ddd9',
          200: '#d1b8af',
          300: '#b8937f',
          400: '#9e6e50',
          500: '#5e3326',  // Color principal marrón
          600: '#4d2a1f',
          700: '#3c2018',
          800: '#2b1611',
          900: '#1a0d0a',
        },
        
        // Colores neutrales mejorados
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        
        // Estados
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
        info: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
        },
      },
      
      // TIPOGRAFÍA
      fontFamily: {
        sans: ['"Inter"', '"SF Pro Display"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"SF Mono"', 'Monaco', 'Consolas', 'monospace'],
        display: ['"Inter"', '"SF Pro Display"', '-apple-system', 'sans-serif'],
      },
      
      // ANIMACIONES MEJORADAS
      animation: {
        // Animaciones para splash screen
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        
        // Animación personalizada para los dots del splash
        'pulse-custom': 'pulseCustom 1.5s ease-in-out infinite',
        
        // Animaciones para componentes
        'spin-slow': 'spin 2s linear infinite',
        'pulse-soft': 'pulse 2s ease-in-out infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(30px)' 
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)' 
          },
        },
        scaleIn: {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.8)' 
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)' 
          },
        },
        bounceIn: {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.3)' 
          },
          '50%': { 
            opacity: '1',
            transform: 'scale(1.05)' 
          },
          '70%': { 
            transform: 'scale(0.9)' 
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)' 
          },
        },
        // NUEVA: Animación personalizada para splash dots
        pulseCustom: {
          '0%, 100%': {
            opacity: '0.4',
            transform: 'scale(0.8)',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.2)',
          },
        },
      },
      
      // SOMBRAS para depth y elevación
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.12)',
        'strong': '0 8px 24px rgba(0, 0, 0, 0.16)',
        'inner-soft': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
      
      // BORDES REDONDEADOS
      borderRadius: {
        'none': '0',
        'sm': '0.25rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'full': '9999px',
      },
      
      // BACKDROP FILTERS para efectos modernos
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      
      // GRADIENTES personalizados
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #4c8b2c 0%, #5e3326 100%)',
        'gradient-brand-reverse': 'linear-gradient(135deg, #5e3326 0%, #4c8b2c 100%)',
        'gradient-primary': 'linear-gradient(135deg, #4c8b2c 0%, #6ba037 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #5e3326 0%, #8b5e47 100%)',
        'gradient-splash': 'linear-gradient(45deg, #4c8b2c 0%, #5e3326 50%, #3d6f23 100%)',
      },
      
      // Z-INDEX para layering
      zIndex: {
        'negative': '-1',
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        'modal': '1000',
        'popover': '1010',
        'overlay': '1020',
        'dropdown': '1030',
        'tooltip': '1040',
      },
    },
  },
  
  plugins: [
    // Plugin para forms (opcional, mejora estilos de formularios)
    // require('@tailwindcss/forms')({
    //   strategy: 'class',
    // }),
  ],
};

export default config;
/**
 * Button Component - Atomic Design
 * 
 * Componente básico de botón para Mega+
 * Utiliza CVA para gestión de variantes y design tokens
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/design-system/utils/cn';

// Variantes del botón usando CVA
const buttonVariants = cva(
  // Estilos base comunes a todas las variantes
  [
    // Layout y posicionamiento
    'inline-flex items-center justify-center gap-2',
    // Tipografía
    'font-medium text-sm leading-none',
    // Interactividad
    'cursor-pointer select-none',
    // Transiciones suaves
    'transition-all duration-200 ease-in-out',
    // Enfoque y accesibilidad
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    // Estados deshabilitado
    'disabled:pointer-events-none disabled:opacity-50',
    // Eliminamos outline por defecto
    'outline-none',
  ],
  {
    variants: {
      // Variantes de estilo/color
      variant: {
        // Botón primario con colores corporativos
        primary: [
          'bg-primary-500 text-white shadow-sm',
          'hover:bg-primary-600 hover:shadow-md',
          'active:bg-primary-700 active:scale-[0.98]',
          'focus-visible:ring-primary-500',
        ],
        
        // Botón secundario con colores corporativos  
        secondary: [
          'bg-secondary-500 text-white shadow-sm',
          'hover:bg-secondary-600 hover:shadow-md',
          'active:bg-secondary-700 active:scale-[0.98]',
          'focus-visible:ring-secondary-500',
        ],
        
        // Botón outline/borde
        outline: [
          'border-2 border-primary-500 text-primary-500 bg-transparent',
          'hover:bg-primary-50 hover:border-primary-600',
          'active:bg-primary-100',
          'focus-visible:ring-primary-500',
        ],
        
        // Botón ghost/fantasma
        ghost: [
          'text-primary-600 bg-transparent shadow-none',
          'hover:bg-primary-50 hover:text-primary-700',
          'active:bg-primary-100',
          'focus-visible:ring-primary-500',
        ],
        
        // Botón de link
        link: [
          'text-primary-600 bg-transparent shadow-none underline-offset-4',
          'hover:underline hover:text-primary-700',
          'active:text-primary-800',
          'focus-visible:ring-primary-500',
        ],
        
        // Botón destructivo
        destructive: [
          'bg-red-500 text-white shadow-sm',
          'hover:bg-red-600 hover:shadow-md',
          'active:bg-red-700 active:scale-[0.98]',
          'focus-visible:ring-red-500',
        ],
      },
      
      // Variantes de tamaño
      size: {
        sm: [
          'h-8 px-3 text-xs',
          'rounded-md',
        ],
        md: [
          'h-10 px-4 text-sm',
          'rounded-lg',
        ],
        lg: [
          'h-12 px-6 text-base',
          'rounded-lg',
        ],
        xl: [
          'h-14 px-8 text-lg',
          'rounded-xl',
        ],
        
        // Botón icono (cuadrado)
        icon: [
          'h-10 w-10 p-0',
          'rounded-lg',
        ],
      },
      
      // Variantes de ancho
      width: {
        auto: 'w-auto',
        full: 'w-full',
        fit: 'w-fit',
      },
    },
    
    // Combinaciones por defecto
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      width: 'auto',
    },
  }
);

// Tipos del componente
export interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  // Props específicas del componente
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

// Componente Button
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    width,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    return (
      <button
        className={cn(
          buttonVariants({ variant, size, width }),
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {/* Icono izquierdo */}
        {leftIcon && !loading && (
          <span className="inline-flex items-center justify-center">
            {leftIcon}
          </span>
        )}
        
        {/* Indicador de carga */}
        {loading && (
          <span className="inline-flex items-center justify-center">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}
        
        {/* Contenido del botón */}
        {children}
        
        {/* Icono derecho */}
        {rightIcon && !loading && (
          <span className="inline-flex items-center justify-center">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Exportación por defecto
export default Button;
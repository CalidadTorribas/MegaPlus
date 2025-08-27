/**
 * Button Types
 * 
 * Tipos TypeScript específicos para el componente Button
 * Incluye variantes, tamaños y props extendidas
 */

import React from 'react';

// Variantes de estilo disponibles
export type ButtonVariant = 
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'destructive';

// Tamaños disponibles
export type ButtonSize = 
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | 'icon';

// Anchos disponibles
export type ButtonWidth = 
  | 'auto'
  | 'full'
  | 'fit';

// Props específicas del botón (sin las props HTML nativas)
export interface ButtonSpecificProps {
  /** Variante visual del botón */
  variant?: ButtonVariant;
  
  /** Tamaño del botón */
  size?: ButtonSize;
  
  /** Ancho del botón */
  width?: ButtonWidth;
  
  /** Estado de carga - muestra spinner y deshabilita el botón */
  loading?: boolean;
  
  /** Icono a mostrar en el lado izquierdo */
  leftIcon?: React.ReactNode;
  
  /** Icono a mostrar en el lado derecho */
  rightIcon?: React.ReactNode;
  
  /** Renderizar como elemento hijo (para uso con routers) */
  asChild?: boolean;
}

// Props completas del botón (HTML + específicas)
export interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonSpecificProps {}

// Ref del botón
export type ButtonRef = React.ElementRef<'button'>;

// Configuración de variantes para uso externo
export interface ButtonVariantConfig {
  variant: ButtonVariant;
  size: ButtonSize;
  width?: ButtonWidth;
}

// Preset de configuraciones comunes
export const buttonPresets = {
  // Botones de acción principales
  primaryAction: {
    variant: 'primary' as const,
    size: 'md' as const,
    width: 'auto' as const,
  },
  
  // Botones secundarios
  secondaryAction: {
    variant: 'secondary' as const,
    size: 'md' as const,
    width: 'auto' as const,
  },
  
  // Botones de formulario
  formSubmit: {
    variant: 'primary' as const,
    size: 'lg' as const,
    width: 'full' as const,
  },
  
  // Botones pequeños para acciones menores
  smallAction: {
    variant: 'ghost' as const,
    size: 'sm' as const,
    width: 'auto' as const,
  },
  
  // Botones de icono
  iconButton: {
    variant: 'ghost' as const,
    size: 'icon' as const,
    width: 'auto' as const,
  },
  
  // Botones destructivos
  dangerAction: {
    variant: 'destructive' as const,
    size: 'md' as const,
    width: 'auto' as const,
  },
  
  // Enlaces como botones
  linkButton: {
    variant: 'link' as const,
    size: 'md' as const,
    width: 'auto' as const,
  },
} as const;

// Tipos para los presets
export type ButtonPreset = keyof typeof buttonPresets;

// Helper para obtener configuración de preset
export const getButtonPreset = (preset: ButtonPreset): ButtonVariantConfig => 
  buttonPresets[preset];

// Validadores de tipos
export const isValidButtonVariant = (variant: string): variant is ButtonVariant => {
  return ['primary', 'secondary', 'outline', 'ghost', 'link', 'destructive'].includes(variant);
};

export const isValidButtonSize = (size: string): size is ButtonSize => {
  return ['sm', 'md', 'lg', 'xl', 'icon'].includes(size);
};

export const isValidButtonWidth = (width: string): width is ButtonWidth => {
  return ['auto', 'full', 'fit'].includes(width);
};

// Tipos para eventos comunes del botón
export interface ButtonClickEvent extends React.MouseEvent<HTMLButtonElement> {
  currentTarget: HTMLButtonElement;
}

export interface ButtonKeyEvent extends React.KeyboardEvent<HTMLButtonElement> {
  currentTarget: HTMLButtonElement;
}

// Tipos para uso con forwardRef
export type ButtonComponent = React.ForwardRefExoticComponent<
  ButtonProps & React.RefAttributes<HTMLButtonElement>
>;
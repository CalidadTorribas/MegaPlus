/**
 * CN Utility - Class Name Helper
 * 
 * Utilidad para combinar clases CSS de forma inteligente
 * Combina clsx para concatenación condicional y tailwind-merge para resolver conflictos
 * 
 * Uso:
 * cn('px-4 py-2', 'bg-blue-500', { 'text-white': isActive })
 * cn('px-4', 'px-6') // Resultado: 'px-6' (tailwind-merge resuelve el conflicto)
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases CSS de forma inteligente
 * 
 * @param inputs - Clases CSS, objetos condicionales, arrays, etc.
 * @returns String con las clases combinadas y optimizadas
 * 
 * @example
 * // Uso básico
 * cn('px-4 py-2', 'bg-primary-500')
 * 
 * @example
 * // Con condicionales
 * cn('base-class', {
 *   'active-class': isActive,
 *   'disabled-class': isDisabled
 * })
 * 
 * @example
 * // Resolviendo conflictos de Tailwind
 * cn('px-4', 'px-6') // Resultado: 'px-6'
 * cn('text-red-500', 'text-blue-500') // Resultado: 'text-blue-500'
 * 
 * @example
 * // Con variantes de CVA
 * const buttonVariants = cva('base-button', {
 *   variants: {
 *     variant: {
 *       primary: 'bg-primary-500',
 *       secondary: 'bg-secondary-500'
 *     }
 *   }
 * })
 * 
 * cn(buttonVariants({ variant: 'primary' }), 'custom-class')
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Versión tipada para casos específicos donde necesitamos el tipo exacto
 */
export function cnTyped<T extends string>(...inputs: ClassValue[]): T {
  return cn(...inputs) as T;
}

/**
 * Utilidad para crear clases con prefijos específicos
 * Útil para componentes que necesitan un namespace
 */
export function cnWithPrefix(prefix: string) {
  return (...inputs: ClassValue[]): string => {
    const combined = cn(...inputs);
    return combined
      .split(' ')
      .map(cls => cls.startsWith(prefix) ? cls : `${prefix}-${cls}`)
      .join(' ');
  };
}

/**
 * Utilidad para clases responsivas
 * Facilita la aplicación de clases en diferentes breakpoints
 */
export function cnResponsive(config: {
  base?: ClassValue;
  sm?: ClassValue;
  md?: ClassValue;
  lg?: ClassValue;
  xl?: ClassValue;
  '2xl'?: ClassValue;
}): string {
  return cn(
    config.base,
    config.sm && `sm:${clsx(config.sm)}`.replace(/sm:sm:/g, 'sm:'),
    config.md && `md:${clsx(config.md)}`.replace(/md:md:/g, 'md:'),
    config.lg && `lg:${clsx(config.lg)}`.replace(/lg:lg:/g, 'lg:'),
    config.xl && `xl:${clsx(config.xl)}`.replace(/xl:xl:/g, 'xl:'),
    config['2xl'] && `2xl:${clsx(config['2xl'])}`.replace(/2xl:2xl:/g, '2xl:')
  );
}

/**
 * Utilidad para estados interactivos
 * Facilita la aplicación de clases hover, focus, active, etc.
 */
export function cnInteractive(config: {
  base?: ClassValue;
  hover?: ClassValue;
  focus?: ClassValue;
  active?: ClassValue;
  disabled?: ClassValue;
  groupHover?: ClassValue;
}): string {
  return cn(
    config.base,
    config.hover && `hover:${clsx(config.hover)}`.replace(/hover:hover:/g, 'hover:'),
    config.focus && `focus:${clsx(config.focus)}`.replace(/focus:focus:/g, 'focus:'),
    config.active && `active:${clsx(config.active)}`.replace(/active:active:/g, 'active:'),
    config.disabled && `disabled:${clsx(config.disabled)}`.replace(/disabled:disabled:/g, 'disabled:'),
    config.groupHover && `group-hover:${clsx(config.groupHover)}`.replace(/group-hover:group-hover:/g, 'group-hover:')
  );
}

/**
 * Utilidad para temas (light/dark)
 * Facilita la aplicación de clases para diferentes temas
 */
export function cnTheme(config: {
  base?: ClassValue;
  light?: ClassValue;
  dark?: ClassValue;
}): string {
  return cn(
    config.base,
    config.light && `${clsx(config.light)}`,
    config.dark && `dark:${clsx(config.dark)}`.replace(/dark:dark:/g, 'dark:')
  );
}

/**
 * Utilidad para validación de clases
 * Útil en desarrollo para debuggear clases aplicadas
 */
export function cnDebug(...inputs: ClassValue[]): { 
  classes: string; 
  individual: string[]; 
  conflicts: string[];
} {
  const classes = cn(...inputs);
  const individual = classes.split(' ').filter(Boolean);
  
  // Detectar posibles conflictos (simplificado)
  const conflicts: string[] = [];
  const properties = new Map<string, string[]>();
  
  individual.forEach(cls => {
    // Extraer propiedad base (ej: 'px-4' -> 'px', 'bg-red-500' -> 'bg')
    const match = cls.match(/^([\w-]+?)(?:-|$)/);
    if (match) {
      const prop = match[1];
      if (!properties.has(prop)) {
        properties.set(prop, []);
      }
      properties.get(prop)!.push(cls);
    }
  });
  
  // Reportar propiedades con múltiples valores
  properties.forEach((classes, prop) => {
    if (classes.length > 1) {
      conflicts.push(`${prop}: ${classes.join(', ')}`);
    }
  });
  
  return { classes, individual, conflicts };
}

// Exportación por defecto
export default cn;
/**
 * Button Component - Export Barrel
 * 
 * Punto de entrada limpio para el componente Button
 * Exporta todo lo necesario desde un solo lugar
 */

// Exportar el componente principal
export { Button, default } from './Button';

// Exportar todos los tipos
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  ButtonWidth,
  ButtonSpecificProps,
  ButtonRef,
  ButtonVariantConfig,
  ButtonPreset,
  ButtonClickEvent,
  ButtonKeyEvent,
  ButtonComponent,
} from './Button.types';

// Exportar utilidades y presets
export {
  buttonPresets,
  getButtonPreset,
  isValidButtonVariant,
  isValidButtonSize,
  isValidButtonWidth,
} from './Button.types';
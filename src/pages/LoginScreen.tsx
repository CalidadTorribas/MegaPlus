/**
 * Login Screen Component - Mega+ (Actualizada para nuevo layout)
 * 
 * Pantalla de autenticación usando el nuevo MobileScreenLayout
 * Mobile-first, minimalista y profesional
 */

import React, { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { MobileScreenLayout } from '@/components/templates/MobileScreenLayout';

interface LoginScreenProps {
  /** Función que se ejecuta al hacer login exitoso */
  onLoginSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Ref para enfocar los inputs
  const emailInputRef = React.useRef<HTMLInputElement>(null);
  const passwordInputRef = React.useRef<HTMLInputElement>(null);

  // Enfocar input de usuario al cargar la pantalla
  React.useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  // Login con credenciales fijas ampliadas (insensitive a mayúsculas)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Por favor, completa ambos campos');
      return;
    }
    setIsLoading(true);

    // Simular delay de autenticación
    setTimeout(() => {
      setIsLoading(false);
      
      // Verificar credenciales fijas (Jose y Sole) - insensitive a mayúsculas
      const normalizedEmail = email.toLowerCase().trim();
      if ((normalizedEmail === 'jose' && password === '2122') || 
          (normalizedEmail === 'sole' && password === '123')) {
        onLoginSuccess?.();
      } else {
        setError('Usuario o contraseña incorrectos');
        // Limpiar contraseña y enfocar en el campo de contraseña
        setPassword('');
        setTimeout(() => {
          if (passwordInputRef.current) {
            passwordInputRef.current.focus();
          }
        }, 100);
      }
    }, 1000);
  };

  return (
    <MobileScreenLayout
      header={{ type: 'branding' }}
      showFooter={true}
      footerText="¿Necesitas ayuda? Contactar soporte"
      showBackgroundDecorations={true}
    >
      {/* Contenido con altura fija para evitar cambios de dimensión */}
      <div className="h-full flex flex-col justify-center">
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Título del formulario */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-secondary-600">
              Iniciar Sesión
            </h2>
          </div>

          {/* Campo Usuario */}
          <div className="space-y-2">
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-neutral-700"
            >
              Usuario
            </label>
            <input
              ref={emailInputRef}
              id="email"
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (passwordInputRef.current) {
                    passwordInputRef.current.focus();
                  }
                }
              }}
              className="
                w-full px-4 py-3 border border-neutral-300 rounded-lg
                focus:outline-none focus:ring-1 focus:ring-secondary-700 focus:border-secondary-700
                transition-colors duration-200
                bg-white text-neutral-900 placeholder-neutral-500
                text-base
              "
              placeholder="Usuario"
              required
              autoComplete="username"
            />
          </div>

          {/* Campo Contraseña */}
          <div className="space-y-2">
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-neutral-700"
            >
              Contraseña
            </label>
            <input
              ref={passwordInputRef}
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              className="
                w-full px-4 py-3 border border-neutral-300 rounded-lg
                focus:outline-none focus:ring-1 focus:ring-secondary-700 focus:border-secondary-700
                transition-colors duration-200
                bg-white text-neutral-900 placeholder-neutral-500
                text-base
              "
              placeholder="Contraseña"
              required
              autoComplete="current-password"
            />
          </div>

          {/* Mensaje de error - altura fija para evitar cambios de layout */}
          <div
            className="text-center"
            style={{ minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-live="polite"
          >
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                {error}
              </p>
            )}
          </div>

          {/* Botón de login */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            width="full"
            loading={isLoading}
            className="mt-8"
            disabled={isLoading || !email.trim() || !password}
          >
            {isLoading ? 'Iniciando sesión...' : 'Entrar'}
          </Button>

          {/* Enlace de contraseña olvidada */}
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>
      </div>
    </MobileScreenLayout>
  );
};

export default LoginScreen;
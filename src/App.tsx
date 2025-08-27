/**
 * App.tsx - Mega+ (CON MATERIALSSCREEN)
 * 
 * Componente raíz de la aplicación con gestión completa de navegación
 * Incluye: Splash -> Login -> Hub -> Productos -> ProductDetail -> Materials
 */

import React, { useState, useEffect } from 'react';
import SplashScreen from '@/pages/SplashScreen';
import LoginScreen from '@/pages/LoginScreen';
import HubScreen from '@/pages/HubScreen';
import ProductosScreen from '@/pages/ProductosScreen';
import ProductDetailScreen from '@/pages/ProductDetailScreen';
import MaterialsScreen from '@/pages/MaterialsScreen';
import MaterialDetailScreen from '@/pages/MaterialDetailScreen';

// Tipos para las pantallas de la aplicación
type AppScreen = 
  | 'splash' 
  | 'login' 
  | 'hub' 
  | 'productos' 
  | 'product-detail'
  | 'materials'
  | 'material-detail'
  | 'etiqueta';

// Interfaz para el estado de navegación
interface NavigationState {
  currentScreen: AppScreen;
  selectedProductId?: number;
  selectedMaterialId?: number;
  previousScreen?: AppScreen;
}

function App() {
  // Estado de navegación centralizado
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentScreen: 'splash'
  });

  // Función para cambiar de pantalla con historial
  const navigateToScreen = (screen: AppScreen, options?: { productId?: number; materialId?: number }) => {
    setNavigationState(prev => ({
      previousScreen: prev.currentScreen,
      currentScreen: screen,
      selectedProductId: options?.productId || prev.selectedProductId,
      selectedMaterialId: options?.materialId || prev.selectedMaterialId
    }));
    
    const logMessage = `🧭 Navegando a: ${screen}`;
    const productInfo = options?.productId ? ` (Producto ID: ${options.productId})` : '';
    const materialInfo = options?.materialId ? ` (Material ID: ${options.materialId})` : '';
    console.log(logMessage + productInfo + materialInfo);
  };

  // Funciones específicas de navegación
  const handleSplashComplete = () => {
    navigateToScreen('login');
  };

  const handleLoginSuccess = () => {
    navigateToScreen('hub');
  };

  const handleNavigateToProductos = () => {
    navigateToScreen('productos');
  };

  const handleNavigateToHub = () => {
    navigateToScreen('hub');
  };

  const handleNavigateToProductDetail = (productId: number) => {
    navigateToScreen('product-detail', { productId });
  };

  const handleBackToProducts = () => {
    navigateToScreen('productos');
  };

  // NUEVAS: Funciones para los botones de la ficha de producto
  const handleNavigateToMaterials = () => {
    console.log('🧱 Navegación a Materiales del producto');
    navigateToScreen('materials');
  };

  const handleNavigateToMaterialDetail = (materialId: number) => {
    console.log('🔍 Navegación a Detalle de Material', materialId);
    navigateToScreen('material-detail', { materialId });
  };

  const handleNavigateToLabel = () => {
    console.log('🚧 Navegación a Etiqueta - Próximamente disponible');
    // Por ahora solo log, más adelante navegará a la pantalla de etiqueta
    navigateToScreen('etiqueta');
  };

  // Función para salir de la aplicación
  const handleExitApp = () => {
    console.log('👋 Saliendo de la aplicación...');
    // En un entorno real, aquí cerrarías la aplicación
    // Por ahora, volver al splash como demostración
    setNavigationState({
      currentScreen: 'splash'
    });
  };

  // Función genérica para volver atrás
  const handleGoBack = () => {
    if (navigationState.previousScreen) {
      navigateToScreen(navigationState.previousScreen);
    } else {
      navigateToScreen('hub'); // Fallback al hub
    }
  };

  // Render pantallas placeholder para Materiales y Etiqueta
  const renderPlaceholderScreen = (screenName: string) => (
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
          
          {/* Header */}
          <div 
            className="bg-white border-b border-neutral-200 px-6 py-4 flex-shrink-0"
            style={{ 
              height: '80px',
              minHeight: '80px',
              maxHeight: '80px'
            }}
          >
            <div className="flex items-center space-x-3 h-full">
              <button
                onClick={handleGoBack}
                className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-neutral-800">{screenName}</h1>
                <p className="text-sm text-neutral-600">Próximamente disponible</p>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div 
            className="flex-1 flex items-center justify-center p-6"
            style={{ 
              height: '656px',
              minHeight: '656px',
              maxHeight: '656px'
            }}
          >
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-neutral-800">{screenName}</h2>
                <p className="text-neutral-600">Esta funcionalidad estará disponible próximamente</p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleGoBack}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-xl transition-colors font-medium"
                >
                  Volver
                </button>
                
                <button
                  onClick={handleNavigateToHub}
                  className="w-full bg-neutral-200 hover:bg-neutral-300 text-neutral-700 py-3 px-4 rounded-xl transition-colors font-medium"
                >
                  Ir al Hub
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div 
            className="bg-white border-t border-neutral-200 px-6 py-3 flex-shrink-0"
            style={{ 
              height: '64px',
              minHeight: '64px',
              maxHeight: '64px'
            }}
          >
            <div className="flex items-center justify-center h-full">
              <button
                onClick={handleExitApp}
                className="flex items-center space-x-2 px-4 py-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Salir de la aplicación</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Log de estado actual para debugging
  useEffect(() => {
    console.log('📱 Estado actual de navegación:', navigationState);
  }, [navigationState]);

  // Render condicional basado en la pantalla actual
  const renderCurrentScreen = () => {
    switch (navigationState.currentScreen) {
      case 'splash':
        return (
          <SplashScreen 
            onAnimationComplete={handleSplashComplete}
            duration={3000}
          />
        );

      case 'login':
        return (
          <LoginScreen 
            onLoginSuccess={handleLoginSuccess}
          />
        );

      case 'hub':
        return (
          <HubScreen
            onExitApp={handleExitApp}
            onNavigateToProductos={handleNavigateToProductos}
          />
        );

      case 'productos':
        return (
          <ProductosScreen
            onBackToHub={handleNavigateToHub}
            onExitApp={handleExitApp}
            onNavigateToProductDetail={handleNavigateToProductDetail}
          />
        );

      case 'product-detail':
        return (
          <ProductDetailScreen
            productId={navigationState.selectedProductId!}
            onBackToProducts={handleBackToProducts}
            onExitApp={handleExitApp}
            onNavigateToMaterials={handleNavigateToMaterials}
            onNavigateToLabel={handleNavigateToLabel}
          />
        );

      case 'materials':
        return (
          <MaterialsScreen
            productId={navigationState.selectedProductId!}
            onBackToProductDetail={() => navigateToScreen('product-detail')}
            onNavigateToMaterialDetail={handleNavigateToMaterialDetail}
            onExitApp={handleExitApp}
          />
        );

      case 'material-detail':
        return (
          <MaterialDetailScreen
            materialId={navigationState.selectedMaterialId!}
            onBackToMaterials={() => navigateToScreen('materials')}
            onExitApp={handleExitApp}
          />
        );

      case 'etiqueta':
        return renderPlaceholderScreen('Etiqueta');

      default:
        console.error('❌ Pantalla no reconocida:', navigationState.currentScreen);
        return (
          <div className="min-h-screen flex items-center justify-center bg-red-50">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-red-600">Error de navegación</h1>
              <p className="text-red-600">Pantalla no encontrada: {navigationState.currentScreen}</p>
              <button
                onClick={() => navigateToScreen('hub')}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Volver al Hub
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="App">
      {renderCurrentScreen()}
    </div>
  );
}

export default App;
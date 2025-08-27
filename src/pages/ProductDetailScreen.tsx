/**
 * Product Detail Screen - Mega+ 
 * 
 * Ficha detallada de producto con diseño moderno y minimalista
 * Muestra información completa del producto seleccionado
 */

import React, { useState, useEffect } from 'react';
import { getProductById, Product } from '@/lib/supabase';
import { AppWithFooterLayout } from '@/components/templates/AppWithFooterLayout';
import { ProductImage } from '@/components/atoms/ProductImage';

interface ProductDetailScreenProps {
  /** ID del producto a mostrar */
  productId: number;
  /** Función para volver a la lista de productos */
  onBackToProducts?: () => void;
  /** Función para salir de la aplicación */
  onExitApp?: () => void;
  /** Función para navegar a materiales */
  onNavigateToMaterials?: () => void;
  /** Función para navegar a etiqueta */
  onNavigateToLabel?: () => void;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  productId,
  onBackToProducts,
  onExitApp,
  onNavigateToMaterials,
  onNavigateToLabel
}) => {
  // Estados
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Cargar datos del producto
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`🔄 Cargando producto ID: ${productId}`);
        const data = await getProductById(productId);
        if (data) {
          console.log('✅ Producto cargado:', data);
          setProduct(data);
        } else {
          setError('Producto no encontrado');
        }
      } catch (err) {
        console.error('⚠ Error al cargar producto:', err);
        setError('Error al cargar los datos del producto');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Render del contenido
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-neutral-600">Cargando ficha del producto...</p>
          </div>
        </div>
      );
    }

    if (error || !product) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-error-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-error-600 font-medium">{error}</p>
            <button
              onClick={onBackToProducts}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
            >
              Volver a productos
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col">
        {/* Header verde */}
        <div className="bg-primary-500 p-6 text-white">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToProducts}
              className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">{product.Name}</h1>
              <p className="text-white text-opacity-90 text-sm">
                ID: {product.id} • {product.Product}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido principal con scroll */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            
            {/* Sección imagen minimalista */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
              <div className="flex flex-col items-center space-y-6">
                
                {/* Imagen centrada */}
                <div className="relative group cursor-pointer" onClick={() => setShowImageModal(true)}>
                  <ProductImage
                    productId={product.id}
                    alt={product.Name}
                    size="detail"
                    className="w-48 h-48 transition-transform duration-300 group-hover:scale-105"
                    loading="eager"
                    showSkeleton={true}
                    onLoad={() => console.log(`✅ Imagen detail cargada: ${product.id}`)}
                    onError={() => console.log(`❌ Error cargando imagen detail: ${product.id}`)}
                  />
                  
                  {/* Overlay de zoom minimalista */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-2xl flex items-center justify-center">
                    <div className="bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Widget minimalista con datos clave */}
                <div className="bg-neutral-50 rounded-xl p-4 w-full max-w-md">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg text-neutral-800">
                        {product.Weight ? `${product.Weight} kg` : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-neutral-700 leading-tight">
                        {product.PrimaryPackaging || 'No especificado'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-mono text-neutral-600">
                        {product.Barcode || 'Sin código'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción destacada */}
            {product.Description && (
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                <h3 className="text-sm font-medium text-neutral-600 uppercase tracking-wide mb-4">Descripción</h3>
                <p className="text-neutral-700 leading-relaxed text-base">
                  {product.Description}
                </p>
              </div>
            )}

            {/* Características elegantes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Columna 1: Calidad */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                <h3 className="text-base font-medium text-neutral-700 mb-4 flex items-center">
                  <svg className="w-4 h-4 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Calidad y Características
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Categoría</div>
                    <div className="text-sm text-neutral-700 bg-neutral-50 px-3 py-2 rounded-lg">
                      {product.Category || 'Sin categoría'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Calidad Visual</div>
                    <div className="text-sm text-neutral-700 bg-neutral-50 px-3 py-2 rounded-lg">
                      {product.VisualQ || 'No especificada'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Tamaño</div>
                    <div className="text-sm text-neutral-700 bg-neutral-50 px-3 py-2 rounded-lg">
                      {product.Size || 'No especificado'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Certificación</div>
                    <div className="text-sm text-neutral-700 bg-neutral-50 px-3 py-2 rounded-lg">
                      {product.Certification || 'Sin certificación'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna 2: Logística */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                <h3 className="text-base font-medium text-neutral-700 mb-4 flex items-center">
                  <svg className="w-4 h-4 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Logística y Embalaje
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Caja</div>
                    <div className="text-sm text-neutral-700 bg-neutral-50 px-3 py-2 rounded-lg">
                      {product.Box || 'No especificado'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Pallet</div>
                    <div className="text-sm text-neutral-700 bg-neutral-50 px-3 py-2 rounded-lg">
                      {product.Pallet || 'No especificado'}
                      {(product.PalletBase || product.Palletheight) && (
                        <div className="text-xs text-neutral-500 mt-1">
                          Dimensiones: {product.PalletBase || '?'} x {product.Palletheight || '?'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="grid grid-cols-2 gap-4 pb-6">
              <button
                onClick={onNavigateToMaterials}
                className="flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white py-4 px-6 rounded-xl transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="font-medium">Materiales</span>
              </button>
              
              <button
                onClick={onNavigateToLabel}
                className="flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white py-4 px-6 rounded-xl transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="font-medium">Etiqueta</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <AppWithFooterLayout 
        onBackToHub={onBackToProducts}
        onExitApp={onExitApp}
        showBackButton={true}
        onBack={onBackToProducts}
        backButtonText="Productos"
      >
        {renderContent()}
      </AppWithFooterLayout>

      {/* Modal de imagen a pantalla completa */}
      {showImageModal && product && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
          onClick={() => setShowImageModal(false)}
        >
          {/* Botón cerrar fijo en esquina */}
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 z-20 bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3 hover:bg-opacity-30 transition-all duration-200"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Contenedor de imagen centrado - Con espacio para info inferior */}
          <div 
            className="relative w-full h-full flex items-center justify-center"
            style={{ paddingTop: '60px', paddingBottom: '120px', paddingLeft: '20px', paddingRight: '20px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Imagen ajustada al espacio disponible */}
            <ProductImage
              productId={product.id}
              alt={product.Name}
              size="zoom"
              className="max-w-full max-h-full object-contain"
              loading="eager"
              showSkeleton={true}
              onLoad={() => console.log(`✅ Imagen zoom cargada: ${product.id}`)}
              onError={() => console.log(`❌ Error cargando imagen zoom: ${product.id}`)}
            />
          </div>

          {/* Información del producto */}
          <div className="absolute bottom-6 left-6 right-6 bg-black bg-opacity-60 backdrop-blur-sm text-white p-4 rounded-xl">
            <h3 className="font-semibold text-xl mb-1">{product.Name}</h3>
            <p className="text-sm opacity-90">ID: {product.id} • {product.Product}</p>
            <p className="text-xs opacity-75 mt-2">Toca fuera de la imagen o el botón ✕ para cerrar</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetailScreen;
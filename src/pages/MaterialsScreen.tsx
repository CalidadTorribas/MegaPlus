/**
 * Materials Screen - Mega+
 * 
 * Pantalla que muestra todos los materiales asociados a un producto específico
 * Lista elegante con ID y descripción de cada material
 */

import React, { useState, useEffect } from 'react';
import { getMaterialsByProductId, getProductById, MaterialWithDetails, Product } from '@/lib/supabase';
import { AppWithFooterLayout } from '@/components/templates/AppWithFooterLayout';

interface MaterialsScreenProps {
  /** ID del producto para mostrar sus materiales */
  productId: number;
  /** Función para volver al detalle del producto */
  onBackToProductDetail?: () => void;
  /** Función para navegar al detalle de un material */
  onNavigateToMaterialDetail?: (materialId: number) => void;
  /** Función para salir de la aplicación */
  onExitApp?: () => void;
}

export const MaterialsScreen: React.FC<MaterialsScreenProps> = ({
  productId,
  onBackToProductDetail,
  onNavigateToMaterialDetail,
  onExitApp
}) => {
  // Estados
  const [materials, setMaterials] = useState<MaterialWithDetails[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del producto y sus materiales
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`🔄 Cargando materiales para producto ID: ${productId}`);
        
        // Cargar producto y materiales en paralelo
        const [productData, materialsData] = await Promise.all([
          getProductById(productId),
          getMaterialsByProductId(productId)
        ]);

        if (!productData) {
          setError('Producto no encontrado');
          return;
        }

        setProduct(productData);
        setMaterials(materialsData);
        
        console.log(`✅ Cargados ${materialsData.length} materiales para "${productData.Name}"`);
        
      } catch (err) {
        console.error('⚠ Error al cargar datos:', err);
        setError('Error al cargar los materiales del producto');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchData();
    }
  }, [productId]);

  // Render del contenido
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-neutral-600">Cargando materiales...</p>
            <p className="text-xs text-neutral-500">Consultando base de datos</p>
          </div>
        </div>
      );
    }

    if (error) {
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
              onClick={onBackToProductDetail}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
            >
              Volver al producto
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col p-6 space-y-4">
        {/* Header con navegación y título */}
        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={onBackToProductDetail}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-neutral-800">Materiales</h1>
            {product && (
              <p className="text-sm text-neutral-600">
                {product.Name} • ID: {product.id} • {materials.length} {materials.length === 1 ? 'material' : 'materiales'}
              </p>
            )}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 overflow-y-auto">
          {materials.length === 0 ? (
            
            /* Estado vacío */
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-neutral-800">Sin materiales</h3>
                  <p className="text-neutral-600">Este producto no tiene materiales asociados.</p>
                </div>
                <button
                  onClick={onBackToProductDetail}
                  className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-lg transition-colors text-sm"
                >
                  Volver al producto
                </button>
              </div>
            </div>

          ) : (
            
            /* Lista de materiales */
            <div className="space-y-3">
              
              {/* Header informativo */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-primary-800">
                      Materiales necesarios para la producción
                    </p>
                    <p className="text-xs text-primary-600">
                      Toca cualquier material para ver más detalles
                    </p>
                  </div>
                </div>
              </div>

              {/* Lista de cards de materiales */}
              {materials.map((material, index) => (
                <button 
                  key={material.id}
                  onClick={() => onNavigateToMaterialDetail?.(material.id)}
                  className="w-full bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md hover:border-primary-300 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center space-x-4">
                    
                    {/* Número de orden visual */}
                    <div className="w-8 h-8 bg-secondary-100 text-secondary-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium">
                        {index + 1}
                      </span>
                    </div>

                    {/* Información del material */}
                    <div className="flex-1 min-w-0">
                      
                      {/* ID del material */}
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                          Material ID
                        </span>
                        <span className="text-sm font-mono text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded">
                          {material.id}
                        </span>
                      </div>

                      {/* Descripción del material */}
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide block">
                          Descripción
                        </span>
                        <p className="text-sm text-neutral-800 leading-relaxed">
                          {material.description}
                        </p>
                      </div>
                    </div>

                    {/* Indicador visual con flecha */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <div className="w-2 h-8 bg-primary-200 rounded-full group-hover:bg-primary-400 transition-colors"></div>
                      <svg className="w-4 h-4 text-neutral-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}

              {/* Resumen final */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mt-6">
                <div className="text-center">
                  <p className="text-sm text-neutral-600">
                    Total de materiales: <span className="font-semibold text-neutral-800">{materials.length}</span>
                  </p>
                  {product && (
                    <p className="text-xs text-neutral-500 mt-1">
                      Para el producto: {product.Name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AppWithFooterLayout 
      onBackToHub={onBackToProductDetail}
      onExitApp={onExitApp}
      showBackButton={true}
      onBack={onBackToProductDetail}
      backButtonText="Producto"
    >
      {renderContent()}
    </AppWithFooterLayout>
  );
};

export default MaterialsScreen;
/**
 * MaterialDetailScreen - Mega+
 * 
 * Pantalla que muestra el detalle completo de un material específico
 * Ficha elegante con todos los campos organizados por secciones
 */

import React, { useState, useEffect } from 'react';
import { getMaterialById, Material, getTechnicalSheetExactUrl, checkTechnicalSheetExists, getTechnicalSheetDirectUrl } from '@/lib/supabase';
import { AppWithFooterLayout } from '@/components/templates/AppWithFooterLayout';

interface MaterialDetailScreenProps {
  /** ID del material para mostrar sus detalles */
  materialId: number;
  /** Función para volver a la lista de materiales */
  onBackToMaterials?: () => void;
  /** Función para salir de la aplicación */
  onExitApp?: () => void;
}

export const MaterialDetailScreen: React.FC<MaterialDetailScreenProps> = ({
  materialId,
  onBackToMaterials,
  onExitApp
}) => {
  // Estados
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [technicalSheetUrl, setTechnicalSheetUrl] = useState<string | null>(null);
  const [hasTechnicalSheet, setHasTechnicalSheet] = useState<boolean>(false);
  const [loadingTechnicalSheet, setLoadingTechnicalSheet] = useState<boolean>(false);

  // Cargar datos del material
  useEffect(() => {
    const fetchMaterial = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`🔄 Cargando detalles del material ID: ${materialId}`);
        
        const materialData = await getMaterialById(materialId);

        if (!materialData) {
          setError('Material no encontrado');
          return;
        }

        setMaterial(materialData);
        console.log(`✅ Material cargado: ${materialData.description}`);
        
        // Verificar si existe ficha técnica usando método directo
        if (materialData.FT_consumible) {
          console.log(`🔍 Verificando ficha técnica para código: ${materialData.FT_consumible}`);
          console.log(`🔧 Usando MÉTODO DIRECTO (omitiendo list() que no funciona)...`);
          
          // Ir directo al método que funciona
          const directUrl = await getTechnicalSheetDirectUrl(materialData.FT_consumible);
          if (directUrl) {
            setHasTechnicalSheet(true);
            setTechnicalSheetUrl(directUrl);
            console.log(`✅ ¡Éxito con acceso directo!`);
          } else {
            setHasTechnicalSheet(false);
            console.log(`❌ No se encontró PDF para ${materialData.FT_consumible}`);
          }
        }
        
      } catch (err) {
        console.error('⚠ Error al cargar material:', err);
        setError('Error al cargar los detalles del material');
      } finally {
        setLoading(false);
      }
    };

    if (materialId) {
      fetchMaterial();
    }
  }, [materialId]);

  // Función para formatear valores
  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return 'No especificado';
    }
    return String(value);
  };

  // Función para formatear precio
  const formatPrice = (price: number | null | undefined): string => {
    if (!price) return 'No especificado';
    return `${price.toLocaleString('es-ES', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} €`;
  };

  // Función para formatear peso
  const formatWeight = (weight: number | null | undefined, unit?: string): string => {
    if (!weight) return 'No especificado';
    return `${weight.toLocaleString('es-ES')} ${unit || 'g'}`;
  };

  // Función para abrir ficha técnica
  const handleOpenTechnicalSheet = async () => {
    if (!material?.FT_consumible) return;
    
    setLoadingTechnicalSheet(true);
    
    try {
      let url = technicalSheetUrl;
      
      // Si no tenemos la URL, obtenerla usando el método directo
      if (!url) {
        console.log('📄 Obteniendo URL de ficha técnica con método directo...');
        url = await getTechnicalSheetDirectUrl(material.FT_consumible);
        if (url) {
          setTechnicalSheetUrl(url);
          setHasTechnicalSheet(true); // Actualizamos el estado también
        }
      }
      
      if (url) {
        console.log('🚀 Abriendo ficha técnica:', url);
        // Abrir en nueva pestaña
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        console.error('❌ No se pudo obtener la URL de la ficha técnica');
        alert('No se pudo abrir la ficha técnica. El documento no está disponible.');
      }
      
    } catch (error) {
      console.error('Error al abrir ficha técnica:', error);
      alert('Error al abrir la ficha técnica.');
    } finally {
      setLoadingTechnicalSheet(false);
    }
  };

  // Render del contenido
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-neutral-600">Cargando detalles del material...</p>
            <p className="text-xs text-neutral-500">Consultando información completa</p>
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
              onClick={onBackToMaterials}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
            >
              Volver a materiales
            </button>
          </div>
        </div>
      );
    }

    if (!material) return null;

    return (
      <div className="h-full flex flex-col p-6 space-y-6">
        {/* Header con navegación y título */}
        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={onBackToMaterials}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-neutral-800">Detalle del Material</h1>
            <p className="text-sm text-neutral-600">
              ID: {material.id} • {material.description}
            </p>
          </div>
        </div>

        {/* Contenido principal - Scrolleable */}
        <div className="flex-1 overflow-y-auto space-y-6">
          
          {/* Información Básica */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-neutral-800">Información Básica</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">ID del Material</label>
                <p className="text-lg font-mono text-primary-600 bg-primary-50 px-3 py-2 rounded-lg">
                  {material.id}
                </p>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Descripción</label>
                <p className="text-neutral-800 bg-neutral-50 px-3 py-2 rounded-lg leading-relaxed">
                  {material.description}
                </p>
              </div>
              
              {material.ELEMENTO && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Elemento</label>
                  <p className="text-neutral-800 bg-secondary-50 px-3 py-2 rounded-lg">
                    {material.ELEMENTO}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Especificaciones Técnicas */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-neutral-800">Especificaciones Técnicas</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-3">
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Ficha Técnica</label>
                
                {material.FT_consumible ? (
                  hasTechnicalSheet ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-green-800 font-mono">
                            {material.FT_consumible}
                          </p>
                          <p className="text-xs text-green-600">
                            Documento técnico disponible
                          </p>
                        </div>
                        <button
                          onClick={handleOpenTechnicalSheet}
                          disabled={loadingTechnicalSheet}
                          className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                        >
                          {loadingTechnicalSheet ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Cargando...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>Abrir PDF</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-amber-800 font-mono mb-1">
                        {material.FT_consumible}
                      </p>
                      <p className="text-xs text-amber-600">
                        Documento PDF no disponible actualmente
                      </p>
                    </div>
                  )
                ) : (
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                    <p className="text-sm text-neutral-600">
                      No especificado
                    </p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Material Proveedor</label>
                  <p className="text-neutral-800 bg-neutral-50 px-3 py-2 rounded-lg">
                    {formatValue(material.Material_prov)}
                  </p>
                </div>

                {material['Peso nominal'] && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Peso Nominal</label>
                    <p className="text-neutral-800 bg-green-50 px-3 py-2 rounded-lg font-medium">
                      {formatWeight(material['Peso nominal'], material.Unidad)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* Información de Proveedor */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m14 0a2 2 0 002-2v-2M5 21a2 2 0 01-2-2v-2m16 0V9a2 2 0 00-2-2h-2M5 11V9a2 2 0 012-2h2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-neutral-800">Información del Proveedor</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Proveedor</label>
                <p className="text-neutral-800 bg-neutral-50 px-3 py-2 rounded-lg">
                  {formatValue(material.PROVEEDOR)}
                </p>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Referencia del Proveedor</label>
                <p className="text-neutral-800 bg-neutral-50 px-3 py-2 rounded-lg font-mono">
                  {formatValue(material.REF_PROVEEDOR)}
                </p>
              </div>
            </div>
          </div>

          {/* Información Económica */}
          {material.pmCoste && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-neutral-800">Información Económica</h2>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <label className="text-xs font-medium text-green-700 uppercase tracking-wide block mb-2">Precio Medio</label>
                <p className="text-2xl font-bold text-green-800">
                  {formatPrice(material.pmCoste)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Precio promedio del material
                </p>
              </div>
            </div>
          )}

          {/* Footer informativo */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-center">
            <p className="text-sm text-neutral-600">
              Material ID: <span className="font-semibold text-neutral-800">{material.id}</span>
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Información detallada del material
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppWithFooterLayout 
      onBackToHub={onBackToMaterials}
      onExitApp={onExitApp}
      showBackButton={true}
      onBack={onBackToMaterials}
      backButtonText="Materiales"
    >
      {renderContent()}
    </AppWithFooterLayout>
  );
};

export default MaterialDetailScreen;
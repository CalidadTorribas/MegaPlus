/**
 * ProductImage Component - Mega+
 * 
 * Componente optimizado para mostrar imágenes de productos desde Supabase Storage
 * con transformaciones on-the-fly para pantallas Retina/alta densidad
 * 
 * Sistema de 3 niveles:
 * - Thumbnail: 400x400px (para listas/grids)
 * - Detail: 1000x1000px (para pantallas de detalle)  
 * - Zoom: 2000x2000px (para pantalla completa)
 */

import React, { useState } from 'react';

// Configuración de Supabase Storage
const SUPABASE_URL = 'https://srsedippxqjpetcfcaae.supabase.co';
const STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public/product-images`;

// Tipos de transformaciones disponibles
type ImageSize = 'thumbnail' | 'detail' | 'zoom';

interface ProductImageProps {
  /** ID del producto */
  productId: number | string;
  /** Texto alternativo para la imagen */
  alt: string;
  /** Tamaño principal de la imagen */
  size?: ImageSize;
  /** Clases CSS adicionales */
  className?: string;
  /** Tipo de carga (lazy por defecto para rendimiento) */
  loading?: 'lazy' | 'eager';
  /** Función ejecutada al hacer click en la imagen */
  onClick?: () => void;
  /** Función ejecutada cuando la imagen se carga correctamente */
  onLoad?: () => void;
  /** Función ejecutada cuando hay error al cargar */
  onError?: () => void;
  /** Si mostrar skeleton durante la carga */
  showSkeleton?: boolean;
}

/**
 * Generar URLs de transformación para Supabase Storage
 */
const getProductImageUrl = (productId: number | string, size: ImageSize): string => {
  const transforms = {
    thumbnail: 'width=400&height=400&resize=contain&format=webp&quality=70',
    detail: 'width=1000&height=1000&resize=contain&format=webp&quality=80',
    zoom: 'width=2000&height=2000&resize=contain&format=webp&quality=90'
  };
  
  return `${STORAGE_URL}/originals/${productId}.png?${transforms[size]}`;
};

/**
 * Generar srcset completo para responsive images
 */
const getProductImageSrcSet = (productId: number | string): string => {
  return [
    `${getProductImageUrl(productId, 'thumbnail')} 400w`,
    `${getProductImageUrl(productId, 'detail')} 1000w`, 
    `${getProductImageUrl(productId, 'zoom')} 2000w`
  ].join(', ');
};

/**
 * Componente ProductImage
 */
export const ProductImage: React.FC<ProductImageProps> = ({
  productId,
  alt,
  size = 'thumbnail',
  className = '',
  loading = 'lazy',
  onClick,
  onLoad,
  onError,
  showSkeleton = true
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleImageError = () => {
    setImageError(true);
    onError?.();
  };

  // Renderizar icono de fallback cuando hay error
  if (imageError) {
    return (
      <div 
        className={`bg-neutral-100 flex items-center justify-center rounded-lg ${className}`}
        onClick={onClick}
      >
        <svg 
          className="w-8 h-8 text-neutral-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} onClick={onClick}>
      {/* Skeleton loading (se oculta cuando la imagen carga) */}
      {showSkeleton && !imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 animate-pulse rounded-lg" />
      )}
      
      {/* Imagen optimizada con srcset responsive */}
      <img
        src={getProductImageUrl(productId, size)}
        srcSet={getProductImageSrcSet(productId)}
        sizes="(max-width: 640px) 400px, (max-width: 1024px) 1000px, 2000px"
        alt={alt}
        className={`w-full h-full object-contain rounded-lg transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading={loading}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};

/**
 * Hook para obtener URLs de imágenes de productos
 * Útil para casos avanzados donde necesites las URLs directamente
 */
export const useProductImageUrls = (productId: number | string) => {
  return {
    thumbnail: getProductImageUrl(productId, 'thumbnail'),
    detail: getProductImageUrl(productId, 'detail'),
    zoom: getProductImageUrl(productId, 'zoom'),
    srcSet: getProductImageSrcSet(productId)
  };
};

export default ProductImage;
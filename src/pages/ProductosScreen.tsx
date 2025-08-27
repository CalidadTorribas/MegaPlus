/**
 * Productos Screen - Mega+ (Con navegación a detalle)
 * 
 * Pantalla de gestión de productos con filtros y ordenación
 * ACTUALIZADO: Ahora permite hacer clic en productos para ver detalle
 */

import React, { useState, useEffect, useMemo } from 'react';
import { getProducts, Product } from '@/lib/supabase';
import { AppWithFooterLayout } from '@/components/templates/AppWithFooterLayout';
import { ProductImage } from '@/components/atoms/ProductImage';
import ScannerModal from '@/components/scanner/ScannerModal';
import '@/styles/scanner.css';

// Tipos para filtros y ordenación
type SortField = 'id' | 'Product' | 'Name' | 'Barcode' | 'Weight';
type SortDirection = 'asc' | 'desc';

interface ProductosScreenProps {
  /** Función para volver al hub */
  onBackToHub?: () => void;
  /** Función para salir de la aplicación */
  onExitApp?: () => void;
  /** Función para navegar al detalle del producto */
  onNavigateToProductDetail?: (productId: number) => void;
}

export const ProductosScreen: React.FC<ProductosScreenProps> = ({
  onBackToHub,
  onExitApp,
  onNavigateToProductDetail
}) => {
  // Estados
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado del escáner
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerModulesLoaded, setScannerModulesLoaded] = useState(false);
  
  // Filtros - AÑADIDO Weight
  const [selectedProductType, setSelectedProductType] = useState<string>('');
  const [filters, setFilters] = useState({
    id: '',
    Product: '',
    Name: '',
    Barcode: '',
    Weight: ''  // NUEVO FILTRO
  });
  
  // Ordenación
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Tipos de productos para filtros (SIN boniato)
  const productTypes = ['patata', 'cebolla', 'ajo', 'otros'];

  // Cargar datos reales de Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('🔄 Cargando productos desde Supabase...');
        const data = await getProducts();
        console.log('✅ Productos cargados:', data.length, 'elementos');
        setProducts(data);
      } catch (err) {
        console.error('⚠ Error al cargar productos:', err);
        setError('Error al cargar productos desde la base de datos');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Cargar módulos del escáner al montar
  useEffect(() => {
    const loadScannerModules = async () => {
      try {
        // Cargar los módulos en orden específico
        await import('@/utils/scanner/scanner-interfaces.js');
        await import('@/utils/scanner/engines/barcode-detector-engine.js');
        await import('@/utils/scanner/engines/zxing-wasm-engine.js');
        await import('@/utils/scanner/engines/html5-qrcode-engine.js');
        await import('@/utils/scanner/scanner-factory.js');
        await import('@/utils/scanner/scanner-module.js');
        
        console.log('✅ Módulos del escáner cargados');
        setScannerModulesLoaded(true);
      } catch (error) {
        console.error('❌ Error cargando módulos del escáner:', error);
        setScannerModulesLoaded(false);
      }
    };
    
    loadScannerModules();
  }, []);

  // Productos filtrados y ordenados - SISTEMA ROBUSTO
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products]; // Copia para evitar mutaciones

    console.log(`🔍 Iniciando filtrado con ${filtered.length} productos`);

    // PASO 1: Filtro por tipo de producto (botones superiores)
    if (selectedProductType && selectedProductType !== '') {
      const initialCount = filtered.length;
      
      if (selectedProductType === 'otros') {
        // Otros incluye todo lo que NO sea patata, cebolla, ajo
        filtered = filtered.filter(product => {
          const productLower = product.Product?.toLowerCase() || '';
          return !['patata', 'cebolla', 'ajo'].some(type => 
            productLower.includes(type.toLowerCase())
          );
        });
      } else {
        // Filtro específico por tipo
        filtered = filtered.filter(product => {
          const productLower = product.Product?.toLowerCase() || '';
          return productLower.includes(selectedProductType.toLowerCase());
        });
      }
      
      console.log(`📊 Filtro por tipo "${selectedProductType}": ${initialCount} → ${filtered.length} productos`);
    }

    // PASO 2: Filtros por columnas (se aplican sobre el resultado anterior)
    const columnFiltersActive = Object.values(filters).some(filter => filter.trim() !== '');
    
    if (columnFiltersActive) {
      const beforeColumnFilters = filtered.length;
      
      filtered = filtered.filter(product => {
        // Filtro ID - exacto o parcial
        const idMatch = !filters.id || product.id.toString().includes(filters.id);
        
        // Filtro Product - parcial e insensitive
        const productMatch = !filters.Product || 
          (product.Product?.toLowerCase() || '').includes(filters.Product.toLowerCase());
        
        // Filtro Name - parcial e insensitive  
        const nameMatch = !filters.Name || 
          (product.Name?.toLowerCase() || '').includes(filters.Name.toLowerCase());
        
        // Filtro Barcode - parcial
        const barcodeMatch = !filters.Barcode || 
          (product.Barcode || '').includes(filters.Barcode);
        
        // Filtro Weight - EXACTO (corregido)
        const weightMatch = !filters.Weight || 
          (product.Weight !== null && product.Weight !== undefined && 
           product.Weight.toString() === filters.Weight.toString());

        return idMatch && productMatch && nameMatch && barcodeMatch && weightMatch;
      });
      
      console.log(`🔧 Filtros de columna aplicados: ${beforeColumnFilters} → ${filtered.length} productos`);
      console.log('   Filtros activos:', Object.entries(filters)
        .filter(([, value]) => value.trim() !== '')
        .map(([key, value]) => `${key}: "${value}"`)
        .join(', '));
    }

    // PASO 3: Ordenación (se aplica sobre el resultado filtrado)
    if (filtered.length > 0) {
      filtered.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        // Manejo especial para valores null/undefined
        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';
        
        let comparison = 0;
        
        // Comparación numérica para campos numéricos
        if (sortField === 'Weight' || sortField === 'id') {
          const aNum = Number(aValue);
          const bNum = Number(bValue);
          
          // Si no son números válidos, tratar como 0
          comparison = (isNaN(aNum) ? 0 : aNum) - (isNaN(bNum) ? 0 : bNum);
        } else {
          // Comparación alfabética para strings
          comparison = String(aValue).localeCompare(String(bValue), undefined, {
            numeric: true,
            caseFirst: 'lower'
          });
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
      });
      
      console.log(`📈 Ordenado por ${sortField} (${sortDirection}): ${filtered.length} productos`);
    }

    console.log(`✅ Filtrado completado: ${filtered.length} productos finales`);
    return filtered;
  }, [products, selectedProductType, filters, sortField, sortDirection]);

  // Función para cambiar ordenación
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Función para actualizar filtros
  const updateFilter = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Función para limpiar todos los filtros y ordenación
  const clearAllFilters = () => {
    console.log('🧹 Limpiando todos los filtros y ordenación');
    
    // Resetear filtros de columna
    setFilters({
      id: '',
      Product: '',
      Name: '',
      Barcode: '',
      Weight: ''
    });
    
    // Resetear filtro por tipo de producto
    setSelectedProductType('');
    
    // Resetear ordenación al estado inicial
    setSortField('id');
    setSortDirection('asc');
    
    console.log('✅ Filtros y ordenación reseteados al estado inicial');
  };

  // Función para verificar si hay algún filtro activo
  const hasActiveFilters = () => {
    const hasColumnFilters = Object.values(filters).some(filter => filter.trim() !== '');
    const hasTypeFilter = selectedProductType !== '';
    const hasCustomSort = sortField !== 'id' || sortDirection !== 'asc';
    
    return hasColumnFilters || hasTypeFilter || hasCustomSort;
  };

  // NUEVA: Función para manejar clic en producto
  const handleProductClick = (product: Product) => {
    console.log(`🖱️ Producto clickeado: ${product.Name} (ID: ${product.id})`);
    if (onNavigateToProductDetail) {
      onNavigateToProductDetail(product.id);
    }
  };

  // Funciones del escáner
  const handleScannerOpen = () => {
    if (scannerModulesLoaded) {
      setIsScannerOpen(true);
    } else {
      console.error('❌ Módulos del escáner no están cargados');
      alert('El escáner no está listo. Por favor, recarga la página.');
    }
  };

  const handleScannerClose = () => {
    setIsScannerOpen(false);
  };

  const handleScanSuccess = (code: string, result: any) => {
    console.log('🎯 Código escaneado:', code);
    console.log('📊 Detalles:', result);
    
    // Buscar producto por código de barras
    const foundProduct = products.find(product => 
      product.Barcode && product.Barcode.toString() === code.toString()
    );

    if (foundProduct) {
      console.log('✅ Producto encontrado:', foundProduct.Name);
      // Cerrar el modal del escáner primero
      setIsScannerOpen(false);
      // Navegar directamente al detalle del producto
      if (onNavigateToProductDetail) {
        onNavigateToProductDetail(foundProduct.id);
      }
    } else {
      console.log('❌ Producto no encontrado con código:', code);
      // Mostrar mensaje de producto no encontrado
      alert(`No se encontró ningún producto con el código: ${code}`);
      // Cerrar el modal del escáner
      setIsScannerOpen(false);
    }
  };

  const handleScanError = (error: Error, message: string) => {
    console.error('❌ Error del escáner:', message);
    // Mostrar error si es crítico
    if (message.toLowerCase().includes('error') || 
        message.toLowerCase().includes('denegado') || 
        message.toLowerCase().includes('bloqueado')) {
      alert(`Error del escáner: ${message}`);
    }
  };

  // Render del contenido
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-neutral-600">Cargando productos...</p>
            <p className="text-xs text-neutral-500">Conectando con Supabase</p>
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
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col space-y-4 p-6">
        {/* Header con flecha de retroceso */}
        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={onBackToHub}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-neutral-800">Productos</h1>
            <p className="text-sm text-neutral-600">{filteredAndSortedProducts.length} productos</p>
          </div>
        </div>

        {/* Filtros por tipo de producto + Botón Escáner */}
        <div className="flex items-center gap-1.5 mb-4 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedProductType('')}
            className={`px-2.5 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              selectedProductType === '' 
                ? 'bg-primary-500 text-white' 
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Todos
          </button>
          {productTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedProductType(type)}
              className={`px-2.5 py-1.5 rounded-full text-sm font-medium transition-colors capitalize whitespace-nowrap flex-shrink-0 ${
                selectedProductType === type 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {type}
            </button>
          ))}
          
          {/* Separador */}
          <div className="w-px h-6 bg-neutral-300 mx-0.5 flex-shrink-0"></div>
          
          {/* Botón del Escáner - Discreto */}
          <button
            onClick={handleScannerOpen}
            disabled={!scannerModulesLoaded}
            className={`px-2.5 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              !scannerModulesLoaded 
                ? 'opacity-50 cursor-not-allowed bg-neutral-100 text-neutral-400' 
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
            title={scannerModulesLoaded ? 'Escanear código de barras' : 'Escáner cargando...'}
          >
            |||
          </button>
        </div>

        {/* Filtros de cabecera por campos - GRID CON 4 COLUMNAS + BOTÓN LIMPIAR */}
        <div className="bg-white rounded-lg border border-neutral-200 p-3 mb-4">
          <div className="flex items-start justify-between gap-3">
            
            {/* Grid de filtros */}
            <div className="grid grid-cols-4 gap-3 flex-1">
              {/* ID - MÁS CORTO */}
              <div className="col-span-1">
                <button
                  onClick={() => handleSort('id')}
                  className="flex items-center space-x-1 text-xs font-medium text-neutral-700 hover:text-primary-600 transition-colors mb-1"
                >
                  <span>ID</span>
                  <div className="flex flex-col">
                    <svg className={`w-3 h-3 ${sortField === 'id' && sortDirection === 'asc' ? 'text-primary-600' : 'text-neutral-400'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" transform="rotate(180 10 10)" />
                    </svg>
                    <svg className={`w-3 h-3 ${sortField === 'id' && sortDirection === 'desc' ? 'text-primary-600' : 'text-neutral-400'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </button>
                <input
                  type="text"
                  placeholder="ID..."
                  value={filters.id}
                  onChange={(e) => updateFilter('id', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-neutral-200 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              {/* NOMBRE */}
              <div className="col-span-1">
                <button
                  onClick={() => handleSort('Name')}
                  className="flex items-center space-x-1 text-xs font-medium text-neutral-700 hover:text-primary-600 transition-colors mb-1"
                >
                  <span>Nombre</span>
                  <div className="flex flex-col">
                    <svg className={`w-3 h-3 ${sortField === 'Name' && sortDirection === 'asc' ? 'text-primary-600' : 'text-neutral-400'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" transform="rotate(180 10 10)" />
                    </svg>
                    <svg className={`w-3 h-3 ${sortField === 'Name' && sortDirection === 'desc' ? 'text-primary-600' : 'text-neutral-400'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </button>
                <input
                  type="text"
                  placeholder="Nombre..."
                  value={filters.Name}
                  onChange={(e) => updateFilter('Name', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-neutral-200 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              {/* CÓDIGO */}
              <div className="col-span-1">
                <button
                  onClick={() => handleSort('Barcode')}
                  className="flex items-center space-x-1 text-xs font-medium text-neutral-700 hover:text-primary-600 transition-colors mb-1"
                >
                  <span>Código</span>
                  <div className="flex flex-col">
                    <svg className={`w-3 h-3 ${sortField === 'Barcode' && sortDirection === 'asc' ? 'text-primary-600' : 'text-neutral-400'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" transform="rotate(180 10 10)" />
                    </svg>
                    <svg className={`w-3 h-3 ${sortField === 'Barcode' && sortDirection === 'desc' ? 'text-primary-600' : 'text-neutral-400'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </button>
                <input
                  type="text"
                  placeholder="Código..."
                  value={filters.Barcode}
                  onChange={(e) => updateFilter('Barcode', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-neutral-200 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              {/* PESO - NUEVO */}
              <div className="col-span-1">
                <button
                  onClick={() => handleSort('Weight')}
                  className="flex items-center space-x-1 text-xs font-medium text-neutral-700 hover:text-primary-600 transition-colors mb-1"
                >
                  <span>Peso</span>
                  <div className="flex flex-col">
                    <svg className={`w-3 h-3 ${sortField === 'Weight' && sortDirection === 'asc' ? 'text-primary-600' : 'text-neutral-400'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" transform="rotate(180 10 10)" />
                    </svg>
                    <svg className={`w-3 h-3 ${sortField === 'Weight' && sortDirection === 'desc' ? 'text-primary-600' : 'text-neutral-400'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </button>
                <input
                  type="number"
                  placeholder="Kg..."
                  value={filters.Weight}
                  onChange={(e) => updateFilter('Weight', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-neutral-200 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            {/* Botón limpiar filtros - Solo visible si hay filtros activos */}
            {hasActiveFilters() && (
              <div className="flex-shrink-0">
                <button
                  onClick={clearAllFilters}
                  className="flex items-center justify-center w-8 h-8 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                  title="Limpiar todos los filtros y ordenación"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lista de productos estilo cards - AHORA CLICKEABLE */}
        <div className="flex-1 overflow-hidden bg-white rounded-lg border border-neutral-200">
          <div className="h-full overflow-y-auto divide-y divide-neutral-100">
            {filteredAndSortedProducts.map((product) => (
              <div 
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="flex items-center py-3 px-3 bg-white transition-all cursor-pointer shadow-sm hover:shadow-md hover:bg-neutral-200 hover:shadow-[inset_4px_0_0_0_theme(colors.primary.400)] active:bg-neutral-100"
              >
                {/* Imagen del producto usando el nuevo componente optimizado */}
                <ProductImage
                  productId={product.id}
                  alt={product.Name}
                  size="thumbnail"
                  className="w-16 h-16 flex-shrink-0 mr-4"
                  loading="lazy"
                  onLoad={() => console.log(`✅ Imagen cargada: ${product.id}`)}
                  onError={() => console.log(`❌ Error cargando imagen: ${product.id}`)}
                  showSkeleton={true}
                />

                {/* Contenido principal */}
                <div className="flex-1 min-w-0">
                  {/* ID en gris arriba */}
                  <div className="text-xs text-neutral-500 font-mono mb-1">
                    {product.id}-{product.Product?.charAt(0)?.toUpperCase() || 'P'}
                  </div>
                  
                  {/* Nombre principal */}
                  <div className="text-sm font-medium text-neutral-800 truncate mb-1">
                    {product.Name}
                  </div>
                  
                  {/* Barcode debajo */}
                  <div className="text-sm text-neutral-600 font-mono">
                    {product.Barcode}
                  </div>
                </div>

                {/* Indicador visual de que es clickeable */}
                <div className="ml-2 opacity-40 group-hover:opacity-80 transition-opacity">
                  <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}

            {/* Mensaje si no hay resultados */}
            {filteredAndSortedProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2-2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8v4a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2h6a2 2 0 012 2z" />
                  </svg>
                </div>
                <p className="text-neutral-600 font-medium">No se encontraron productos</p>
                <p className="text-sm text-neutral-500 mt-1">Ajusta los filtros para ver más resultados</p>
              </div>
            )}
          </div>
        </div>

        {/* Información de resultados + tip para hacer clic */}
        <div className="text-center text-xs text-neutral-500 py-2 space-y-1">
          <p>Mostrando {filteredAndSortedProducts.length} de {products.length} productos</p>
          <p className="text-primary-600">💡 Haz clic en cualquier producto para ver su ficha</p>
        </div>
      </div>
    );
  };

  return (
    <AppWithFooterLayout 
      onBackToHub={onBackToHub}
      onExitApp={onExitApp}
    >
      {renderContent()}
      
      {/* Modal del Escáner */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={handleScannerClose}
        onScanSuccess={handleScanSuccess}
        onScanError={handleScanError}
        title="Escáner de Productos"
        description="Escanea el código de barras del producto que buscas"
      />
    </AppWithFooterLayout>
  );
};

export default ProductosScreen;
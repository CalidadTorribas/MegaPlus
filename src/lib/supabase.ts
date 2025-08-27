/**
 * Supabase Configuration - Mega+ (CON MATERIALES)
 * 
 * Cliente y configuración para interactuar con la base de datos
 * Incluye funciones para productos y materiales
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Variables de entorno con fallbacks para desarrollo
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://srsedippxqjpetcfcaae.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyc2VkaXBweHFqcGV0Y2ZjYWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjM0OTUsImV4cCI6MjA3MTA5OTQ5NX0.IoLvEbciO1u3UqEZcZhmgaSNYixlI8Thp75K_7CBGhw'

// Validar que las variables de entorno estén presentes
if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is required')
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is required')
}

// Cliente de Supabase con configuración optimizada
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// ===== TIPOS Y INTERFACES =====

/**
 * Interface para la tabla products (COMPLETA)
 */
export interface Product {
  id: number;
  Name: string;
  Barcode: string;
  Product: string;
  Description?: string;
  Status?: string;
  Category?: string;
  created_at?: string;
  
  // CAMPOS ADICIONALES
  Weight?: number;
  Box?: string;
  Pallet?: string;
  PrimaryPackaging?: string;
  Size?: string;
  VisualQ?: string;
  Certification?: string;
  Use?: string;
  PalletBase?: number;
  Palletheight?: number;
}

/**
 * Interface para la tabla materials
 */
export interface Material {
  id: number;
  description: string;
  ELEMENTO?: string;
  FT_consumible?: string;
  Material_prov?: string;
  REF_PROVEEDOR?: string;
  PROVEEDOR?: string;
  Unidad?: string;
  'Peso nominal'?: number;
  pmCoste?: number;
  OrdenELE?: number;
}

/**
 * Interface para la tabla product_materials (relación)
 */
export interface ProductMaterial {
  id: number;
  product_id: number;
  material_id: number;
  created_at?: string;
}

/**
 * Interface para material con información completa (JOIN)
 */
export interface MaterialWithDetails extends Material {
  // Campos adicionales que podrían venir del JOIN
  product_material_id?: number;
  associated_at?: string;
}

/**
 * Tipos para operaciones con productos
 */
export type ProductInsert = Omit<Product, 'id' | 'created_at'>
export type ProductUpdate = Partial<Omit<Product, 'id'>>

/**
 * Tipos para operaciones con materiales
 */
export type MaterialInsert = Omit<Material, 'id' | 'created_at'>
export type MaterialUpdate = Partial<Omit<Material, 'id'>>

// ===== FUNCIONES DE PRODUCTOS (EXISTENTES) =====

/**
 * Obtener todos los productos con TODOS los campos
 */
export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, Product, Name, Barcode, Description, Status, Category, created_at,
        Weight, Box, Pallet, PrimaryPackaging, Size, VisualQ, Certification, Use, 
        PalletBase, Palletheight
      `)
      .order('id', { ascending: true })

    if (error) {
      console.error('Error fetching products:', error)
      throw new Error(`Error al obtener productos: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error in getProducts:', error)
    throw error
  }
}

/**
 * Obtener un producto por ID con TODOS los campos
 */
export const getProductById = async (id: number): Promise<Product | null> => {
  try {
    if (!id || id <= 0) {
      throw new Error('ID de producto inválido')
    }

    console.log(`🔍 Buscando producto con ID: ${id}`);
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, Product, Name, Barcode, Description, Status, Category, created_at,
        Weight, Box, Pallet, PrimaryPackaging, Size, VisualQ, Certification, Use, 
        PalletBase, Palletheight
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`❌ Producto ID ${id} no encontrado`);
        return null
      }
      console.error('Error fetching product by ID:', error)
      throw new Error(`Error al obtener producto: ${error.message}`)
    }

    console.log(`✅ Producto ID ${id} encontrado:`, data.Name);
    return data
  } catch (error) {
    console.error('Unexpected error in getProductById:', error)
    throw error
  }
}

// ===== FUNCIONES DE MATERIALES (NUEVAS) =====

/**
 * Obtener todos los materiales de un producto específico
 */
export const getMaterialsByProductId = async (productId: number): Promise<MaterialWithDetails[]> => {
  try {
    if (!productId || productId <= 0) {
      throw new Error('ID de producto inválido')
    }

    console.log(`🔍 Buscando materiales para producto ID: ${productId}`);

    const { data, error } = await supabase
      .from('product_materials')
      .select(`
        id,
        product_id,
        material_id,
        created_at,
        materials (
          id,
          description,
          ELEMENTO,
          FT_consumible,
          Material_prov,
          REF_PROVEEDOR,
          PROVEEDOR,
          Unidad,
          "Peso nominal",
          pmCoste,
          OrdenELE
        )
      `)
      .eq('product_id', productId)
      .order('material_id', { ascending: true })

    if (error) {
      console.error('Error fetching materials for product:', error)
      throw new Error(`Error al obtener materiales: ${error.message}`)
    }

    // Transformar los datos para estructura plana
    const materials: MaterialWithDetails[] = (data || []).map(item => {
      // Verificar que materials existe y no es null
      if (!item.materials) {
        console.warn(`Material no encontrado para product_materials ID: ${item.id}`);
        return null;
      }

      // Acceder correctamente a las propiedades del material
      const material = Array.isArray(item.materials) ? item.materials[0] : item.materials;
      
      return {
        id: material.id,
        description: material.description,
        ELEMENTO: material.ELEMENTO,
        FT_consumible: material.FT_consumible,
        Material_prov: material.Material_prov,
        REF_PROVEEDOR: material.REF_PROVEEDOR,
        PROVEEDOR: material.PROVEEDOR,
        Unidad: material.Unidad,
        'Peso nominal': material['Peso nominal'],
        pmCoste: material.pmCoste,
        OrdenELE: material.OrdenELE,
        product_material_id: item.id,
        associated_at: item.created_at
      };
    }).filter(Boolean) as MaterialWithDetails[]; // Filtrar elementos null

    console.log(`✅ Encontrados ${materials.length} materiales para producto ${productId}`);
    return materials;

  } catch (error) {
    console.error('Unexpected error in getMaterialsByProductId:', error)
    throw error
  }
}

/**
 * Obtener todos los materiales disponibles
 */
export const getAllMaterials = async (): Promise<Material[]> => {
  try {
    console.log('🔍 Obteniendo todos los materiales disponibles');

    const { data, error } = await supabase
      .from('materials')
      .select(`
        id, 
        description, 
        ELEMENTO, 
        FT_consumible, 
        Material_prov, 
        REF_PROVEEDOR, 
        PROVEEDOR, 
        Unidad, 
        "Peso nominal", 
        pmCoste, 
        OrdenELE
      `)
      .order('id', { ascending: true })

    if (error) {
      console.error('Error fetching all materials:', error)
      throw new Error(`Error al obtener materiales: ${error.message}`)
    }

    console.log(`✅ Encontrados ${data?.length || 0} materiales totales`);
    return data || []

  } catch (error) {
    console.error('Unexpected error in getAllMaterials:', error)
    throw error
  }
}

/**
 * Obtener un material por ID
 */
export const getMaterialById = async (id: number): Promise<Material | null> => {
  try {
    if (!id || id <= 0) {
      throw new Error('ID de material inválido')
    }

    console.log(`🔍 Buscando material con ID: ${id}`);

    const { data, error } = await supabase
      .from('materials')
      .select(`
        id, 
        description, 
        ELEMENTO, 
        FT_consumible, 
        Material_prov, 
        REF_PROVEEDOR, 
        PROVEEDOR, 
        Unidad, 
        "Peso nominal", 
        pmCoste, 
        OrdenELE
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`❌ Material ID ${id} no encontrado`);
        return null
      }
      console.error('Error fetching material by ID:', error)
      throw new Error(`Error al obtener material: ${error.message}`)
    }

    console.log(`✅ Material ID ${id} encontrado:`, data.description);
    return data

  } catch (error) {
    console.error('Unexpected error in getMaterialById:', error)
    throw error
  }
}

/**
 * Obtener estadísticas de materiales para un producto
 */
export const getMaterialStatsForProduct = async (productId: number) => {
  try {
    if (!productId || productId <= 0) {
      throw new Error('ID de producto inválido')
    }

    const { count, error } = await supabase
      .from('product_materials')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)

    if (error) {
      throw new Error(`Error al obtener estadísticas de materiales: ${error.message}`)
    }

    return { totalMaterials: count || 0 }

  } catch (error) {
    console.error('Error getting material stats for product:', error)
    throw error
  }
}

// ===== UTILIDADES ADICIONALES (EXISTENTES) =====

/**
 * Verificar conexión con Supabase
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1)

    return !error
  } catch (error) {
    console.error('Error testing Supabase connection:', error)
    return false
  }
}

/**
 * Obtener estadísticas básicas de productos
 */
export const getProductStats = async () => {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    if (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`)
    }

    return { totalProducts: count || 0 }
  } catch (error) {
    console.error('Error getting product stats:', error)
    throw error
  }
}

// ===== FUNCIONES PARA FICHAS TÉCNICAS PDF =====

/**
 * Generar URL para acceder a ficha técnica PDF desde Supabase Storage
 */
export const getTechnicalSheetPDFUrl = (ftCode: string | null | undefined): string | null => {
  if (!ftCode) return null;
  
  try {
    // Extraer el código base (hasta el guión bajo si existe)
    const baseCode = ftCode.split('_')[0].trim();
    
    if (!baseCode) return null;
    
    // Generar nombre del archivo PDF
    const fileName = `${baseCode}_*.pdf`;
    
    // Construir la URL del PDF en Supabase Storage
    // Nota: Esta es la estructura típica, ajustar según tu configuración
    const { data } = supabase.storage
      .from('Document')
      .getPublicUrl(`FT/${baseCode}_ficha.pdf`); // Asumo un patrón genérico
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error generando URL de ficha técnica:', error);
    return null;
  }
};

/**
 * Verificar si existe una ficha técnica para un código dado
 */
export const checkTechnicalSheetExists = async (ftCode: string | null | undefined): Promise<boolean> => {
  if (!ftCode) return false;
  
  try {
    const baseCode = ftCode.split('_')[0].trim();
    if (!baseCode) return false;
    
    console.log(`🔍 INICIANDO BÚSQUEDA`);
    console.log(`📋 FT_consumible original: "${ftCode}"`);
    console.log(`📋 Código extraído (antes del _): "${baseCode}"`);
    console.log(`📋 Bucket: "Document", Directorio: "FT"`);
    console.log(`📋 Buscando archivos que empiecen con: "${baseCode}"`);
    
    // Listar todos los buckets disponibles
    console.log(`🗂️ Listando TODOS los buckets disponibles:`);
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error('❌ Error listando buckets:', bucketsError);
      } else {
        console.log(`📦 Buckets encontrados:`, buckets?.map(b => b.name) || []);
      }
    } catch (e) {
      console.error('❌ Error obteniendo buckets:', e);
    }
    
    // Ejemplo de lo que debería funcionar:
    // FT_consumible = "M68" → busca "M68_*.pdf"
    // Nombre archivo = "M68_FT 81551.pdf" → debería coincidir
    
    // Primer intento: Listar archivos con search
    console.log(`🔍 Intento 1: Búsqueda con parámetro search="${baseCode}"`);
    const { data: searchData, error: searchError } = await supabase.storage
      .from('Document')
      .list('FT', {
        limit: 50,
        search: baseCode
      });
    
    if (searchError) {
      console.error('❌ Error en búsqueda con search:', searchError);
      console.error('❌ Detalles del error:', JSON.stringify(searchError, null, 2));
    } else {
      console.log(`✅ Búsqueda con search exitosa`);
      console.log(`📁 Archivos encontrados con search (${baseCode}):`, searchData?.map(f => f.name) || []);
    }
    
    // Segundo intento: Listar TODOS los archivos del directorio FT
    // Intentemos diferentes rutas para encontrar los archivos
    console.log(`🔍 Intento 2a: Listando archivos en la raíz del bucket "Document"`);
    const { data: rootData, error: rootError } = await supabase.storage
      .from('Document')
      .list('', {
        limit: 100
      });
    
    if (rootError) {
      console.error('❌ Error listando raíz:', rootError);
    } else {
      console.log(`📁 Archivos en Document/ (raíz):`, rootData?.map(f => f.name) || []);
    }
    
    console.log(`🔍 Intento 2b: Listando archivos en Document/FT`);
    const { data: allData, error: allError } = await supabase.storage
      .from('Document')
      .list('FT', {
        limit: 100
      });
    
    if (allError) {
      console.error('❌ Error listando Document/FT:', allError);
      console.error('❌ Detalles del error:', JSON.stringify(allError, null, 2));
    } else {
      console.log(`📁 Archivos en Document/FT:`, allData?.map(f => f.name) || []);
    }
    
    console.log(`🔍 Intento 2c: Probando si existe el directorio sin FT`);
    const { data: directData, error: directError } = await supabase.storage
      .from('Document')
      .list('', {
        limit: 100,
        search: 'M68'
      });
    
    if (directError) {
      console.error('❌ Error buscando M68 en Document:', directError);
    } else {
      console.log(`📁 Archivos con M68 en Document:`, directData?.map(f => f.name) || []);
    }
    
    // Si no encontramos nada, intentamos otros nombres de bucket
    console.log(`🔍 Intento 2d: Probando bucket "Documents" (con s)`);
    const { data: documentsData, error: documentsError } = await supabase.storage
      .from('Documents')
      .list('FT', {
        limit: 100
      });
    
    if (documentsError) {
      console.error('❌ Error en Documents/FT:', documentsError);
    } else {
      console.log(`📁 Archivos en Documents/FT:`, documentsData?.map(f => f.name) || []);
    }
    
    // Usamos la data que tengamos disponible
    const finalData = allData?.length ? allData : (rootData?.length ? rootData : documentsData);
    console.log(`📊 Usando datos finales:`, finalData?.map(f => f.name) || []);
    
    // Si no encontramos archivos con list(), probemos acceso directo
    if (!finalData?.length) {
      console.log(`🔧 Como no encontramos archivos con list(), probando acceso directo...`);
      
      // Probar URL directa del archivo que sabemos que existe
      const testFileName = 'M68_FT 81551.pdf';
      console.log(`🔗 Probando URL directa para: ${testFileName}`);
      
      const { data: directUrlData } = supabase.storage
        .from('Document')
        .getPublicUrl(`FT/${testFileName}`);
      
      console.log(`🔗 URL directa generada: ${directUrlData.publicUrl}`);
      
      // Intentar descargar para ver si existe
      try {
        const response = await fetch(directUrlData.publicUrl, { method: 'HEAD' });
        console.log(`🌐 Test de acceso directo:`);
        console.log(`   - Status: ${response.status}`);
        console.log(`   - Status Text: ${response.statusText}`);
        console.log(`   - Headers:`, Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
          console.log(`✅ ¡El archivo SÍ es accesible directamente!`);
          // Si podemos acceder directamente, creamos un array simulado
          const simulatedData = [{ name: testFileName }];
          console.log(`📁 Usando datos simulados:`, simulatedData.map(f => f.name));
          return true; // El archivo existe y es accesible
        } else {
          console.log(`❌ El archivo no es accesible: ${response.status} ${response.statusText}`);
        }
      } catch (fetchError) {
        console.error('❌ Error probando acceso directo:', fetchError);
      }
    }
    
    // Verificar si hay algún archivo que empiece con el código
    console.log(`🔍 INICIANDO COMPARACIÓN con ${finalData?.length || 0} archivos`);
    const matchingFiles = finalData?.filter(file => {
      const fileName = file.name.toLowerCase();
      const baseCodeLower = baseCode.toLowerCase();
      
      // Buscar patrones: M68_*.pdf, M68 *.pdf, M68*.pdf
      const startsWithUnderscore = fileName.startsWith(baseCodeLower + '_');
      const startsWithSpace = fileName.startsWith(baseCodeLower + ' ');
      const startsDirectly = fileName.startsWith(baseCodeLower);
      const endsWithPdf = fileName.endsWith('.pdf');
      
      const matches = (startsWithUnderscore || startsWithSpace || startsDirectly) && endsWithPdf;
      
      console.log(`📄 ANÁLISIS DEL ARCHIVO: "${file.name}"`);
      console.log(`   - Nombre en minúsculas: "${fileName}"`);
      console.log(`   - Código a buscar: "${baseCodeLower}"`);
      console.log(`   - ¿Empieza con "${baseCodeLower}_"? ${startsWithUnderscore}`);
      console.log(`   - ¿Empieza con "${baseCodeLower} "? ${startsWithSpace}`);  
      console.log(`   - ¿Empieza con "${baseCodeLower}"? ${startsDirectly}`);
      console.log(`   - ¿Termina en .pdf? ${endsWithPdf}`);
      console.log(`   - ¿COINCIDE? ${matches}`);
      console.log(`   ---`);
      
      return matches;
    }) || [];
    
    const hasFile = matchingFiles.length > 0;
    
    console.log(`✅ Archivos que coinciden con ${baseCode}:`, matchingFiles.map(f => f.name));
    console.log(`🔍 Ficha técnica ${baseCode}: ${hasFile ? 'ENCONTRADA' : 'NO ENCONTRADA'}`);
    
    return hasFile;
    
  } catch (error) {
    console.error('Error verificando ficha técnica:', error);
    return false;
  }
};

/**
 * Obtener la URL exacta de la ficha técnica buscando el archivo real
 */
export const getTechnicalSheetExactUrl = async (ftCode: string | null | undefined): Promise<string | null> => {
  if (!ftCode) return null;
  
  try {
    const baseCode = ftCode.split('_')[0].trim();
    if (!baseCode) return null;
    
    console.log(`🔍 Obteniendo URL para código: "${baseCode}"`);
    
    // Listar archivos en el directorio FT
    const { data, error } = await supabase.storage
      .from('Document')
      .list('FT', {
        limit: 100
      });
    
    if (error) {
      console.error('Error buscando ficha técnica:', error);
      return null;
    }
    
    console.log(`📁 Archivos disponibles en FT:`, data?.map(f => f.name) || []);
    
    // Buscar archivo que empiece con el código
    const matchingFile = data?.find(file => {
      const fileName = file.name.toLowerCase();
      const baseCodeLower = baseCode.toLowerCase();
      
      // Buscar patrones: M68_*.pdf, M68 *.pdf, M68*.pdf
      const matches = (
        fileName.startsWith(baseCodeLower + '_') ||  // M68_FT 81551.pdf
        fileName.startsWith(baseCodeLower + ' ') ||  // M68 FT 81551.pdf
        fileName.startsWith(baseCodeLower)           // M68FT81551.pdf
      ) && fileName.endsWith('.pdf');
      
      console.log(`📄 Evaluando archivo: "${file.name}" para código "${baseCode}" = ${matches}`);
      return matches;
    });
    
    if (!matchingFile) {
      console.log(`❌ No se encontró ficha técnica para código: ${baseCode}`);
      console.log(`📁 Archivos evaluados:`, data?.map(f => f.name) || []);
      return null;
    }
    
    // Generar URL pública del archivo encontrado
    const { data: urlData } = supabase.storage
      .from('Document')
      .getPublicUrl(`FT/${matchingFile.name}`);
    
    // Test para verificar que la URL generada funciona
    console.log(`🔗 Probando URL generada: ${urlData.publicUrl}`);
    try {
      const testResponse = await fetch(urlData.publicUrl, { method: 'HEAD' });
      console.log(`🌐 Test URL generada: ${testResponse.status} ${testResponse.statusText}`);
    } catch (e) {
      console.log(`⚠️ Error probando URL generada:`, e.message);
    }
    
    console.log(`✅ Ficha técnica encontrada: ${matchingFile.name}`);
    console.log(`🔗 URL generada: ${urlData.publicUrl}`);
    
    return urlData.publicUrl;
    
  } catch (error) {
    console.error('Error obteniendo URL exacta de ficha técnica:', error);
    return null;
  }
};

/**
 * Función alternativa para acceso directo usando CORS para encontrar archivos
 */
export const getTechnicalSheetDirectUrl = async (ftCode: string | null | undefined): Promise<string | null> => {
  if (!ftCode) return null;
  
  try {
    const baseCode = ftCode.split('_')[0].trim();
    if (!baseCode) return null;
    
    console.log(`🔗 Buscando PDF para código: "${baseCode}"`);
    
    // Primero intentar usar list() para obtener TODOS los archivos
    console.log(`🔍 Listando todos los archivos en Document/FT...`);
    
    const { data: allFiles, error } = await supabase.storage
      .from('Document')
      .list('FT', {
        limit: 1000, // Obtener muchos archivos
        sortBy: { column: 'name', order: 'asc' }
      });
    
    if (error) {
      console.error('❌ Error listando archivos:', error);
      // Fallback: probar solo patrones conocidos específicos
      const storageBaseUrl = `https://srsedippxqjpetcfcaae.supabase.co/storage/v1/object/public/Document/FT`;
      const knownPatterns = [
        `${baseCode}_FT 81551.pdf`,           // M68
        `${baseCode}_000000000000081309.pdf`, // M66
      ];
      
      for (const fileName of knownPatterns) {
        const testUrl = `${storageBaseUrl}/${encodeURIComponent(fileName)}`;
        try {
          const response = await fetch(testUrl, { method: 'HEAD' });
          if (response.ok) {
            console.log(`✅ Encontrado con patrón conocido: ${fileName}`);
            return testUrl;
          }
        } catch (e) {
          // Continuar con el siguiente patrón
        }
      }
      return null;
    }
    
    if (!allFiles || allFiles.length === 0) {
      console.log('📁 No se encontraron archivos en Document/FT');
      return null;
    }
    
    console.log(`📁 Encontrados ${allFiles.length} archivos en Document/FT`);
    console.log(`📄 Primeros 10 archivos:`, allFiles.slice(0, 10).map(f => f.name));
    
    // Buscar archivos que empiecen con el código base
    const matchingFiles = allFiles.filter(file => {
      const fileName = file.name.toLowerCase();
      const baseCodeLower = baseCode.toLowerCase();
      
      return fileName.startsWith(baseCodeLower) && fileName.endsWith('.pdf');
    });
    
    if (matchingFiles.length === 0) {
      console.log(`❌ No se encontraron archivos que empiecen con "${baseCode}"`);
      return null;
    }
    
    console.log(`✅ Archivos encontrados:`, matchingFiles.map(f => f.name));
    
    // Tomar el primer archivo encontrado
    const selectedFile = matchingFiles[0];
    const { data } = supabase.storage
      .from('Document')
      .getPublicUrl(`FT/${selectedFile.name}`);
    
    console.log(`✅ URL generada: ${data.publicUrl}`);
    return data.publicUrl;
    
  } catch (error) {
    console.error('Error en acceso directo:', error);
    return null;
  }
};

export default supabase
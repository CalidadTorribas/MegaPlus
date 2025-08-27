// Nueva implementación eficiente
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
      return await tryKnownPatterns(baseCode);
    }
    
    if (!allFiles || allFiles.length === 0) {
      console.log('📁 No se encontraron archivos en Document/FT');
      return await tryKnownPatterns(baseCode);
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
    console.error('❌ Error en getTechnicalSheetDirectUrl:', error);
    return null;
  }
};

// Función auxiliar para probar solo patrones conocidos como fallback
const tryKnownPatterns = async (baseCode: string): Promise<string | null> => {
  console.log(`🔄 Fallback: probando solo patrones conocidos para ${baseCode}`);
  
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
};
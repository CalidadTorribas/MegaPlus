import { useState, useRef, useCallback, useEffect } from 'react';

interface ScanResult {
  code: string;
  result: any;
  timestamp: number;
}

interface ScannerStatus {
  isInitialized?: boolean;
  cameraPermissionStatus?: string;
  hasActiveReader?: boolean;
  hasRequestedPermissionBefore?: boolean;
  lastErrorMessage?: string | null;
  engine?: any;
  availableEngines?: string[];
}

declare global {
  interface Window {
    ScannerModule: any;
  }
}

export const useBarcodeScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [scannerStatus, setScannerStatus] = useState<ScannerStatus>({});
  const [status, setStatus] = useState<string>('');
  const [debugCallback, setDebugCallback] = useState<((msg: string) => void) | null>(null);
  const scannerRef = useRef<any>(null);

  const initializeScanner = useCallback(async (elementId: string) => {
    try {
      debugCallback?.('🔍 Verificando ScannerModule...');
      if (!window.ScannerModule) {
        throw new Error('ScannerModule no cargado');
      }

      debugCallback?.('🔧 Creando instancia de ScannerModule...');
      console.log('🔧 Creando instancia de ScannerModule...');
      scannerRef.current = new window.ScannerModule();
      
      scannerRef.current.setCallbacks({
        onScanSuccess: (code: string, result: any) => {
          console.log('✅ Escaneo exitoso:', code);
          setLastScan({ code, result, timestamp: Date.now() });
          setIsScanning(false);
          setError(null);
        },
        onScanError: (err: any, message: string) => {
          console.error('❌ Error en escaneo:', message);
          setError(message);
        },
        onStatusUpdate: (message: string) => {
          setStatus(message);
          console.log('📊 Scanner status:', message);
        },
        onPermissionChange: (status: string) => {
          console.log('🔄 Permission change:', status);
          setScannerStatus(prev => ({...prev, cameraPermissionStatus: status}));
        }
      });

      debugCallback?.('🔍 Verificando permisos persistentes...');
      console.log('🔍 Verificando permisos persistentes...');
      await scannerRef.current.checkPersistedPermissions();
      
      debugCallback?.('📹 Activando cámara...');
      console.log('📹 Activando cámara...');
      await scannerRef.current.activateCamera();
      
      debugCallback?.('🎯 Inicializando escáner...');
      console.log('🎯 Inicializando escáner con elemento:', elementId);
      
      // Verificar que el elemento existe y esperar un poco más
      const element = document.getElementById(elementId);
      if (!element) {
        console.warn(`⚠️ Elemento ${elementId} no encontrado, esperando...`);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const retryElement = document.getElementById(elementId);
        if (!retryElement) {
          throw new Error(`Elemento ${elementId} no encontrado después del reintento`);
        }
      }
      
      await scannerRef.current.initializeScanner(elementId);
      
      debugCallback?.('✅ Escáner inicializado correctamente');
      console.log('✅ Escáner inicializado correctamente');
      setIsScanning(true);
      setError(null);
      
      // Obtener estado si está disponible
      if (scannerRef.current.getStatus) {
        setScannerStatus(scannerRef.current.getStatus());
      }
      
    } catch (err: any) {
      debugCallback?.(`❌ Error: ${err.message}`);
      console.error('❌ Error inicializando escáner:', err);
      const errorMessage = scannerRef.current?.getErrorMessage(err) || err.message;
      setError(errorMessage);
      setIsScanning(false);
      
      // Si es un error de cámara no disponible, no es crítico
      if (errorMessage.includes('No se detectó cámara') || 
          errorMessage.includes('DESKTOP_NO_CAMERA')) {
        console.log('ℹ️ Error esperado en dispositivo sin cámara');
      }
    }
  }, []);

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      setIsScanning(false);
    }
  }, []);

  const cleanup = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setIsScanning(false);
    setError(null);
    setLastScan(null);
    setScannerStatus({});
    setStatus('');
  }, []);

  const getEngineInfo = useCallback(() => {
    return scannerRef.current?.getEngineInfo() || null;
  }, []);

  const resetScan = useCallback(() => {
    setLastScan(null);
    setError(null);
    setStatus('');
  }, []);

  // Cleanup en desmontaje
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const setDebugCallback = useCallback((callback: ((msg: string) => void) | null) => {
    setDebugCallback(callback);
  }, []);

  return {
    isScanning,
    error,
    lastScan,
    scannerStatus,
    status,
    initializeScanner,
    stopScanner,
    cleanup,
    getEngineInfo,
    resetScan,
    setDebugCallback
  };
};
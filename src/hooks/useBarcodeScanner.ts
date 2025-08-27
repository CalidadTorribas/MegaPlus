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
  const scannerRef = useRef<any>(null);

  const initializeScanner = useCallback(async (elementId: string) => {
    try {
      if (!window.ScannerModule) {
        throw new Error('ScannerModule no cargado');
      }

      scannerRef.current = new window.ScannerModule();
      
      scannerRef.current.setCallbacks({
        onScanSuccess: (code: string, result: any) => {
          setLastScan({ code, result, timestamp: Date.now() });
          setIsScanning(false);
          setError(null);
        },
        onScanError: (err: any, message: string) => {
          setError(message);
        },
        onStatusUpdate: (message: string) => {
          setStatus(message);
          console.log('Scanner status:', message);
        },
        onPermissionChange: (status: string) => {
          setScannerStatus(prev => ({...prev, cameraPermissionStatus: status}));
        }
      });

      // Verificar permisos persistentes
      await scannerRef.current.checkPersistedPermissions();
      
      // Activar cámara
      await scannerRef.current.activateCamera();
      
      // Inicializar escáner
      await scannerRef.current.initializeScanner(elementId);
      
      setIsScanning(true);
      setError(null);
      setScannerStatus(scannerRef.current.getStatus());
      
    } catch (err: any) {
      console.error('Error inicializando escáner:', err);
      setError(scannerRef.current?.getErrorMessage(err) || err.message);
      setIsScanning(false);
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
    resetScan
  };
};
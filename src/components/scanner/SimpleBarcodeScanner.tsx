import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    Html5Qrcode: any;
    Html5QrcodeScanType: any;
  }
}

interface SimpleScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (code: string, result: any) => void;
  onScanError?: (error: Error, message: string) => void;
  title?: string;
  description?: string;
}

export const SimpleBarcodeScanner: React.FC<SimpleScannerProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  onScanError,
  title = 'Escáner de Códigos',
  description = 'Coloca el código de barras dentro del área de escaneo'
}) => {
  const [scanner, setScanner] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const scannerRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-7), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    if (!isOpen) return;

    const initScanner = async () => {
      try {
        addLog('🚀 Iniciando scanner simple...');
        
        // Cargar html5-qrcode desde CDN
        if (!window.Html5Qrcode) {
          addLog('📦 Cargando html5-qrcode...');
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
          document.head.appendChild(script);
          
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load html5-qrcode'));
            setTimeout(() => reject(new Error('Timeout loading html5-qrcode')), 10000);
          });
          
          addLog('✅ html5-qrcode cargado');
        }

        addLog('🔧 Creando instancia scanner...');
        const html5QrCode = new window.Html5Qrcode("scanner-element");
        setScanner(html5QrCode);

        addLog('🎥 Solicitando permisos cámara...');
        
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          supportedScanTypes: [
            window.Html5QrcodeScanType?.SCAN_TYPE_CAMERA
          ].filter(Boolean)
        };

        await html5QrCode.start(
          { facingMode: "environment" }, // Cámara trasera
          config,
          (decodedText, decodedResult) => {
            addLog(`✅ Código detectado: ${decodedText}`);
            onScanSuccess(decodedText, {
              format: decodedResult.result?.format || 'UNKNOWN',
              engine: 'html5-qrcode-simple',
              confidence: 1.0
            });
          },
          (errorMessage) => {
            // Silenciar errores normales de escaneo
            if (!errorMessage.includes('QR code parse error') && 
                !errorMessage.includes('No MultiFormat Readers')) {
              console.warn('Scanner error:', errorMessage);
            }
          }
        );

        addLog('✅ Scanner iniciado correctamente');
        setIsScanning(true);
        setError(null);

      } catch (err: any) {
        const errorMsg = err.message || 'Error desconocido';
        addLog(`❌ Error: ${errorMsg}`);
        setError(errorMsg);
        
        if (onScanError) {
          onScanError(err, errorMsg);
        }
      }
    };

    initScanner();

    return () => {
      if (scanner) {
        scanner.stop().catch(console.error);
        setScanner(null);
      }
      setIsScanning(false);
      setError(null);
      setLogs([]);
    };
  }, [isOpen]);

  const handleClose = () => {
    if (scanner) {
      scanner.stop().catch(console.error);
      setScanner(null);
    }
    setIsScanning(false);
    setError(null);
    setLogs([]);
    setManualCode('');
    onClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScanSuccess(manualCode.trim(), {
        format: 'MANUAL',
        engine: 'manual',
        confidence: 1.0,
        manual: true
      });
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scanner Area */}
        <div className="p-4">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4" style={{ minHeight: '300px' }}>
            <div 
              id="scanner-element" 
              ref={scannerRef}
              className="w-full h-full"
            />
            
            {/* Overlay de estado */}
            {!isScanning && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Iniciando cámara...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                <div className="text-center p-4">
                  <div className="text-red-500 mb-2">❌</div>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Debug Logs */}
          {logs.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs font-semibold text-gray-700 mb-2">🔍 Debug:</div>
              {logs.map((log, index) => (
                <div key={index} className="text-xs text-gray-600 font-mono">
                  {log}
                </div>
              ))}
            </div>
          )}

          {/* Input Manual */}
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              O introduce el código manualmente:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Código de barras..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus={!!error}
              />
              <button 
                type="submit" 
                disabled={!manualCode.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buscar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
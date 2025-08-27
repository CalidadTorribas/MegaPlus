import React, { useRef, useEffect, useState } from 'react';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';

interface ScannerModalProps {
  /** Indica si el modal está abierto */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** Función llamada cuando se escanea un código exitosamente */
  onScanSuccess: (code: string, result: any) => void;
  /** Función llamada cuando ocurre un error */
  onScanError?: (error: Error, message: string) => void;
  /** Título del modal */
  title?: string;
  /** Descripción del modal */
  description?: string;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  onScanError,
  title = 'Escáner de Códigos',
  description = 'Coloca el código de barras dentro del área de escaneo'
}) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const [engineInfo, setEngineInfo] = useState<any>(null);
  const [manualCode, setManualCode] = useState('');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  const {
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
  } = useBarcodeScanner();

  // Efecto para manejar resultados de escaneo
  useEffect(() => {
    if (lastScan && isOpen) {
      onScanSuccess(lastScan.code, lastScan.result);
      setEngineInfo(getEngineInfo());
      // Cerrar modal después de escanear exitosamente
      setTimeout(() => {
        handleClose();
      }, 500);
    }
  }, [lastScan, onScanSuccess, getEngineInfo, isOpen]);

  // Efecto para manejar errores
  useEffect(() => {
    if (error && onScanError) {
      onScanError(new Error(error), error);
    }
  }, [error, onScanError]);

  // Función para agregar logs de debug
  const addDebugLog = (message: string) => {
    setDebugLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Configurar callback de debug al abrir
  useEffect(() => {
    if (isOpen) {
      setDebugCallback(addDebugLog);
      return () => setDebugCallback(null);
    }
  }, [isOpen, setDebugCallback]);

  // Efecto para inicializar escáner cuando se abre el modal
  useEffect(() => {
    if (isOpen && !isScanning && !error) {
      addDebugLog('🚀 Modal abierto, iniciando escáner...');
      const timer = setTimeout(async () => {
        try {
          addDebugLog('🔧 Llamando a initializeScanner...');
          console.log('🚀 Iniciando escáner en modal...');
          await initializeScanner('scanner-video');
          addDebugLog('✅ initializeScanner completado');
        } catch (err) {
          const errorMsg = (err as Error).message;
          addDebugLog(`❌ Error: ${errorMsg}`);
          console.error('❌ Error al iniciar escáner:', err);
          if (onScanError) {
            onScanError(err as Error, 'Error al inicializar el escáner');
          }
        }
      }, 500); // Mayor delay para Android
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, isScanning, error, initializeScanner, onScanError]);

  // Efecto para cleanup cuando se cierra
  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      cleanup();
      resetScan();
      setEngineInfo(null);
      setManualCode('');
      setDebugLogs([]);
    }
  }, [isOpen, stopScanner, cleanup, resetScan]);

  const handleClose = () => {
    stopScanner();
    cleanup();
    resetScan();
    setEngineInfo(null);
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

  const needsActivation = scannerStatus.cameraPermissionStatus !== 'granted' || 
                         !scannerStatus.hasRequestedPermissionBefore;
  
  const isDesktopNoCamera = scannerStatus.cameraPermissionStatus === 'desktop_no_camera' ||
                           (error && error.includes('No se detectó ninguna cámara'));

  if (!isOpen) return null;

  return (
    <div className="scanner-modal-overlay">
      <div className="scanner-modal">
        {/* Header */}
        <div className="scanner-modal-header">
          <div>
            <h3 className="scanner-modal-title">{title}</h3>
            <p className="scanner-modal-description">{description}</p>
          </div>
          <button 
            onClick={handleClose}
            className="scanner-modal-close"
            aria-label="Cerrar escáner"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scanner Container */}
        <div className="scanner-container">
          {/* Video Element */}
          <div 
            id="scanner-video" 
            ref={videoRef} 
            className={`scanner-video ${needsActivation ? 'hidden' : ''}`}
          />
          
          {/* Estado de Activación */}
          {needsActivation && (
            <div className="camera-activation">
              <div className="camera-activation-content">
                <div className="camera-activation-icon">
                  {isDesktopNoCamera ? '🖥️' : '📹'}
                </div>
                <h4 className="camera-activation-title">
                  {isDesktopNoCamera ? 'Sin Cámara Disponible' : 'Activar Cámara'}
                </h4>
                <p className="camera-activation-description">
                  {isDesktopNoCamera 
                    ? 'No se detectó ninguna cámara. Puedes introducir el código manualmente.'
                    : 'Para escanear códigos necesitamos acceso a tu cámara.'
                  }
                </p>
              </div>
            </div>
          )}
          
          {/* Target de Escaneo */}
          {isScanning && !needsActivation && (
            <div className="scanner-target">
              <div className="scanner-frame">
                <div className="scanner-corners"></div>
                <div className="scanner-line"></div>
              </div>
            </div>
          )}
          
          {/* Mensaje de Estado */}
          {status && (
            <div className="scanner-status">
              {status}
            </div>
          )}
          
          {/* Mensaje de Error */}
          {error && (
            <div className="scanner-error">
              {error}
            </div>
          )}
          
          {/* Información del Motor */}
          {engineInfo && (
            <div className="engine-info">
              <small>Motor: {engineInfo.name} ({engineInfo.type})</small>
            </div>
          )}

          {/* Debug Logs - Solo mostrar si hay logs */}
          {debugLogs.length > 0 && (
            <div className="debug-logs" style={{
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              padding: '8px',
              margin: '8px 0',
              fontSize: '12px',
              fontFamily: 'monospace',
              maxHeight: '120px',
              overflowY: 'auto'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#374151' }}>
                🔍 Debug (últimos 10):
              </div>
              {debugLogs.map((log, index) => (
                <div key={index} style={{ margin: '2px 0', color: '#6b7280' }}>
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Manual */}
        <div className="manual-input-section">
          <p className="manual-input-label">O introduce el código manualmente:</p>
          <form onSubmit={handleManualSubmit} className="manual-form">
            <div className="manual-input-group">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Introduce el código aquí..."
                className="manual-input-field"
                autoFocus={isDesktopNoCamera}
              />
              <button 
                type="submit" 
                className="manual-submit-btn"
                disabled={!manualCode.trim()}
              >
                Buscar
              </button>
            </div>
          </form>
        </div>

        {/* Footer con información */}
        <div className="scanner-modal-footer">
          <p className="scanner-help-text">
            💡 Mantén el código de barras centrado en el área de escaneo
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScannerModal;
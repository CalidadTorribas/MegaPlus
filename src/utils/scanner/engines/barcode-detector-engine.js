/**
 * BarcodeDetector Engine - Motor nativo (máximo rendimiento)
 * Versión Minimalista para React
 */

class BarcodeDetectorEngine extends IScannerEngine {
    constructor() {
        super();
        this.detector = null;
        this.videoElement = null;
        this.stream = null;
        this.animationFrame = null;
        this.isScanning = false;
        this.scanCallbacks = { onSuccess: null, onError: null };

        this.config = {
            preferredFormats: [
                'code_128', 'code_39', 'ean_13', 'ean_8', 
                'upc_a', 'upc_e', 'qr_code'
            ],
            scanInterval: 100,
            maxRetries: 3,
            errorThreshold: 5
        };

        this.stats = {
            scansPerformed: 0,
            consecutiveErrors: 0
        };
    }

    async isAvailable() {
        try {
            if (!('BarcodeDetector' in window)) {
                return false;
            }

            const supportedFormats = await BarcodeDetector.getSupportedFormats();
            const availableFormats = this.config.preferredFormats.filter(format => 
                supportedFormats.includes(format)
            );

            return availableFormats.length > 0;
        } catch (error) {
            return false;
        }
    }

    async initialize(elementId, config = {}) {
        try {
            if (!(await this.isAvailable())) {
                throw new Error('BarcodeDetector no está disponible');
            }

            const supportedFormats = await BarcodeDetector.getSupportedFormats();
            const formatsToUse = this.config.preferredFormats.filter(format => 
                supportedFormats.includes(format)
            );

            this.detector = new BarcodeDetector({ formats: formatsToUse });

            this.videoElement = document.getElementById(elementId);
            if (!this.videoElement) {
                throw new Error(`Elemento con ID '${elementId}' no encontrado`);
            }

            this.videoElement.style.width = '100%';
            this.videoElement.style.height = '100%';
            this.videoElement.style.objectFit = 'cover';
            this.videoElement.playsInline = true;
            this.videoElement.muted = true;

            return true;
        } catch (error) {
            throw error;
        }
    }

    async start(onSuccess, onError) {
        try {
            if (this.isScanning) {
                return true;
            }

            this.scanCallbacks.onSuccess = onSuccess;
            this.scanCallbacks.onError = onError;

            await this._setupCamera();
            this.isScanning = true;
            this._startScanLoop();

            return true;
        } catch (error) {
            this.isScanning = false;
            if (this.scanCallbacks.onError) {
                this.scanCallbacks.onError(error, this._getErrorMessage(error));
            }
            throw error;
        }
    }

    async _setupCamera() {
        try {
            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280, min: 640 },
                    height: { ideal: 720, min: 480 },
                    frameRate: { ideal: 30, min: 15 }
                }
            };

            try {
                this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            } catch (advancedError) {
                const basicConstraints = {
                    video: {
                        facingMode: 'environment',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                };
                this.stream = await navigator.mediaDevices.getUserMedia(basicConstraints);
            }

            this.videoElement.srcObject = this.stream;
            
            await new Promise((resolve, reject) => {
                this.videoElement.onloadedmetadata = () => {
                    this.videoElement.play().then(resolve).catch(reject);
                };
                this.videoElement.onerror = reject;
            });
        } catch (error) {
            throw error;
        }
    }

    _startScanLoop() {
        const scanFrame = async () => {
            if (!this.isScanning || !this.detector || !this.videoElement) {
                return;
            }

            try {
                const startTime = performance.now();
                const barcodes = await this.detector.detect(this.videoElement);
                const scanTime = performance.now() - startTime;

                this.stats.scansPerformed++;

                if (barcodes.length > 0) {
                    this.isScanning = false;
                    
                    if (this.scanCallbacks.onSuccess) {
                        this.scanCallbacks.onSuccess(
                            barcodes[0].rawValue, 
                            {
                                format: barcodes[0].format,
                                boundingBox: barcodes[0].boundingBox,
                                cornerPoints: barcodes[0].cornerPoints,
                                engine: 'native',
                                scanTime: scanTime,
                                confidence: 1.0
                            }
                        );
                    }
                    return;
                }

                this.stats.consecutiveErrors = 0;
            } catch (error) {
                this.stats.consecutiveErrors++;
                
                if (this.stats.consecutiveErrors >= this.config.errorThreshold) {
                    this.isScanning = false;
                    if (this.scanCallbacks.onError) {
                        this.scanCallbacks.onError(error, 'Demasiados errores en el escaneo');
                    }
                    return;
                }
            }

            if (this.isScanning) {
                this.animationFrame = setTimeout(scanFrame, this.config.scanInterval);
            }
        };

        scanFrame();
    }

    async stop() {
        try {
            this.isScanning = false;

            if (this.animationFrame) {
                clearTimeout(this.animationFrame);
                this.animationFrame = null;
            }

            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
                this.stream = null;
            }

            if (this.videoElement) {
                this.videoElement.srcObject = null;
            }
        } catch (error) {
            console.error('Error deteniendo escaneo:', error);
        }
    }

    async destroy() {
        await this.stop();
        this.detector = null;
        this.videoElement = null;
        this.scanCallbacks = { onSuccess: null, onError: null };
        this.stats = { scansPerformed: 0, consecutiveErrors: 0 };
    }

    getInfo() {
        return {
            name: 'BarcodeDetector (Nativo)',
            type: 'native',
            performance: 'maximum',
            formats: this.config.preferredFormats,
            isActive: this.isScanning,
            capabilities: {
                realTime: true,
                highAccuracy: true,
                lowLatency: true,
                hardwareAccelerated: true
            }
        };
    }

    _getErrorMessage(error) {
        if (error.name === 'NotAllowedError') {
            return 'Permisos de cámara denegados. Permite el acceso y recarga la página.';
        } else if (error.name === 'NotFoundError') {
            return 'No se encontró ninguna cámara en el dispositivo.';
        } else if (error.name === 'NotReadableError') {
            return 'La cámara está siendo usada por otra aplicación.';
        } else if (error.name === 'OverconstrainedError') {
            return 'La configuración de cámara no es compatible con el dispositivo.';
        }
        
        return `Error del motor nativo: ${error.message}`;
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BarcodeDetectorEngine;
} else if (typeof window !== 'undefined') {
    window.BarcodeDetectorEngine = BarcodeDetectorEngine;
}
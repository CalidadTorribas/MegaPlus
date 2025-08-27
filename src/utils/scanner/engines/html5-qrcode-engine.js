/**
 * HTML5-QRCode Engine - Motor JavaScript (compatibilidad universal)
 * Versión Minimalista para React
 */

class HTML5QRCodeEngine extends IScannerEngine {
    constructor() {
        super();
        this.html5QrCode = null;
        this.isScanning = false;
        this.isLibraryLoaded = false;
        this.loadingPromise = null;
        this.scanCallbacks = { onSuccess: null, onError: null };

        this.config = {
            cdnUrls: [
                'https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/minified/html5-qrcode.min.js',
                'https://unpkg.com/html5-qrcode@2.3.8/minified/html5-qrcode.min.js',
                'https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.7/minified/html5-qrcode.min.js',
                'https://unpkg.com/html5-qrcode@2.3.7/minified/html5-qrcode.min.js'
            ],
            loadingConfig: {
                timeout: 20000,
                retryDelay: 800,
                waitForAvailability: 30,
                availabilityDelay: 100
            },
            scannerConfig: {
                fps: 10,
                qrbox: { width: 320, height: 200 },
                aspectRatio: 1.6
            },
            cameraConstraints: {
                facingMode: "environment",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
    }

    async isAvailable() {
        try {
            if (!window.isSecureContext && !this._isLocalhost()) {
                console.log('Contexto seguro recomendado para html5-qrcode');
            }

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                return false;
            }

            return true;
        } catch (error) {
            return false;
        }
    }

    async initialize(elementId, config = {}) {
        try {
            if (!(await this.isAvailable())) {
                throw new Error('html5-qrcode no está disponible');
            }

            if (!this.isLibraryLoaded) {
                await this._loadHTML5QRCodeLibrary();
            }

            const targetElement = document.getElementById(elementId);
            if (!targetElement) {
                throw new Error(`Elemento con ID '${elementId}' no encontrado`);
            }

            await this._createQRCodeInstance(elementId);
            this._configureFormats();

            return true;
        } catch (error) {
            throw error;
        }
    }

    async _loadHTML5QRCodeLibrary() {
        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        this.loadingPromise = new Promise(async (resolve, reject) => {
            try {
                if (typeof Html5Qrcode !== 'undefined') {
                    this.isLibraryLoaded = true;
                    resolve();
                    return;
                }

                let loadedSuccessfully = false;

                for (const cdnUrl of this.config.cdnUrls) {
                    try {
                        await this._loadScriptFromCDN(cdnUrl, this.config.loadingConfig.timeout);
                        
                        const isAvailable = await this._waitForHTML5QRCode();
                        
                        if (isAvailable && typeof Html5Qrcode !== 'undefined') {
                            loadedSuccessfully = true;
                            break;
                        }
                    } catch (error) {
                        await this._delay(this.config.loadingConfig.retryDelay);
                        continue;
                    }
                }

                if (!loadedSuccessfully) {
                    throw new Error('No se pudo cargar html5-qrcode desde ningún CDN');
                }

                this.isLibraryLoaded = true;
                resolve();
                
            } catch (error) {
                reject(error);
            }
        });

        return this.loadingPromise;
    }

    _loadScriptFromCDN(url, timeout = 15000) {
        return new Promise((resolve, reject) => {
            const existingScript = document.querySelector(`script[src="${url}"]`);
            if (existingScript && typeof Html5Qrcode !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            script.crossOrigin = 'anonymous';
            
            let timeoutId;
            
            const cleanup = () => {
                if (timeoutId) clearTimeout(timeoutId);
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            };
            
            script.onload = () => {
                cleanup();
                setTimeout(resolve, 300);
            };
            
            script.onerror = (error) => {
                cleanup();
                reject(new Error(`Failed to load script from ${url}`));
            };
            
            timeoutId = setTimeout(() => {
                cleanup();
                reject(new Error(`Timeout loading script from ${url}`));
            }, timeout);
            
            document.head.appendChild(script);
        });
    }

    _waitForHTML5QRCode() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = this.config.loadingConfig.waitForAvailability;
            
            const checkAvailability = () => {
                attempts++;
                
                if (typeof Html5Qrcode !== 'undefined') {
                    resolve(true);
                } else if (attempts < maxAttempts) {
                    setTimeout(checkAvailability, this.config.loadingConfig.availabilityDelay);
                } else {
                    resolve(false);
                }
            };
            
            checkAvailability();
        });
    }

    async _createQRCodeInstance(elementId) {
        try {
            if (!Html5Qrcode) {
                throw new Error('Html5Qrcode no está disponible');
            }

            this.html5QrCode = new Html5Qrcode(elementId);
        } catch (error) {
            throw error;
        }
    }

    _configureFormats() {
        try {
            if (typeof Html5QrcodeSupportedFormats !== 'undefined') {
                this.config.scannerConfig.formatsToSupport = [
                    Html5QrcodeSupportedFormats.QR_CODE,
                    Html5QrcodeSupportedFormats.UPC_A,
                    Html5QrcodeSupportedFormats.UPC_E,
                    Html5QrcodeSupportedFormats.EAN_13,
                    Html5QrcodeSupportedFormats.EAN_8,
                    Html5QrcodeSupportedFormats.CODE_128,
                    Html5QrcodeSupportedFormats.CODE_39
                ];
            }
        } catch (error) {
            console.warn('Error configurando formatos:', error);
        }
    }

    async start(onSuccess, onError) {
        try {
            if (this.isScanning) {
                return true;
            }

            this.scanCallbacks.onSuccess = onSuccess;
            this.scanCallbacks.onError = onError;

            if (!this.html5QrCode) {
                throw new Error('Instancia Html5Qrcode no disponible');
            }

            const config = { ...this.config.scannerConfig };

            try {
                const cameras = await Html5Qrcode.getCameras();
                
                if (cameras && cameras.length > 0) {
                    const cameraId = cameras[cameras.length - 1].id;
                    
                    await this.html5QrCode.start(
                        cameraId,
                        config,
                        this._onScanSuccess.bind(this),
                        this._onScanFailure.bind(this)
                    );
                } else {
                    throw new Error('No se encontraron cámaras');
                }
                
            } catch (cameraError) {
                await this.html5QrCode.start(
                    this.config.cameraConstraints,
                    config,
                    this._onScanSuccess.bind(this),
                    this._onScanFailure.bind(this)
                );
            }

            this.isScanning = true;
            return true;
            
        } catch (error) {
            this.isScanning = false;
            
            if (this.scanCallbacks.onError) {
                this.scanCallbacks.onError(error, this._getErrorMessage(error));
            }
            
            throw error;
        }
    }

    _onScanSuccess(decodedText, decodedResult) {
        if (!this.isScanning) return;

        this.isScanning = false;
        
        if (this.scanCallbacks.onSuccess) {
            this.scanCallbacks.onSuccess(
                decodedText,
                {
                    format: decodedResult?.decodedText ? 'DETECTED' : 'UNKNOWN',
                    rawResult: decodedResult,
                    engine: 'javascript',
                    confidence: 0.8,
                    legacy: true
                }
            );
        }
    }

    _onScanFailure(error) {
        // Error silencioso durante escaneo - normal
    }

    async stop() {
        try {
            this.isScanning = false;

            if (this.html5QrCode) {
                try {
                    await this.html5QrCode.stop();
                } catch (stopError) {
                    console.warn('Error deteniendo html5-qrcode:', stopError);
                }

                try {
                    this.html5QrCode.clear();
                } catch (clearError) {
                    console.warn('Error limpiando html5-qrcode:', clearError);
                }
            }
        } catch (error) {
            console.error('Error deteniendo escaneo:', error);
        }
    }

    async destroy() {
        await this.stop();
        this.html5QrCode = null;
        this.scanCallbacks = { onSuccess: null, onError: null };
    }

    getInfo() {
        return {
            name: 'html5-qrcode (JavaScript)',
            type: 'javascript',
            performance: 'basic',
            formats: ['QR_CODE', 'CODE_128', 'EAN_13', 'UPC_A'],
            isActive: this.isScanning,
            isLibraryLoaded: this.isLibraryLoaded,
            capabilities: {
                realTime: true,
                highAccuracy: false,
                lowLatency: false,
                hardwareAccelerated: false,
                universalCompatibility: true,
                legacy: true
            }
        };
    }

    _getErrorMessage(error) {
        if (error.name === 'NotAllowedError') {
            return 'Permisos de cámara denegados. Permite el acceso y recarga.';
        } else if (error.name === 'NotFoundError') {
            return 'No se encontró ninguna cámara en el dispositivo.';
        } else if (error.name === 'NotSupportedError') {
            return 'El navegador no soporta acceso a la cámara.';
        } else if (error.name === 'NotReadableError') {
            return 'La cámara está siendo usada por otra aplicación.';
        } else if (error.name === 'OverconstrainedError') {
            return 'Las restricciones de cámara no pueden ser satisfechas.';
        } else if (error.message && error.message.includes('HTTPS')) {
            return 'HTTPS requerido para acceso a la cámara en móviles.';
        } else if (error.message && error.message.includes('CDN')) {
            return 'No se pudo cargar html5-qrcode desde CDNs. Puede ser debido a un adblocker. Desactívalo y recarga.';
        }
        
        return 'Error inesperado: ' + (error.message || 'Error desconocido');
    }

    _isLocalhost() {
        return location.hostname === 'localhost' || 
               location.hostname === '127.0.0.1' || 
               location.hostname === '::1';
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HTML5QRCodeEngine;
} else if (typeof window !== 'undefined') {
    window.HTML5QRCodeEngine = HTML5QRCodeEngine;
}
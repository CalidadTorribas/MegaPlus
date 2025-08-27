/**
 * ZXing WASM Engine - Motor WebAssembly (alto rendimiento)
 * Versión Minimalista para React
 */

class ZXingWASMEngine extends IScannerEngine {
    constructor() {
        super();
        this.codeReader = null;
        this.videoElement = null;
        this.isScanning = false;
        this.isLibraryLoaded = false;
        this.loadingPromise = null;
        this.scanCallbacks = { onSuccess: null, onError: null };

        this.config = {
            cdnUrls: [
                'https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.5/umd/zxing-browser.min.js',
                'https://unpkg.com/@zxing/browser@0.1.5/umd/zxing-browser.min.js',
                'https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.4/umd/zxing-browser.min.js',
                'https://unpkg.com/@zxing/browser@0.1.4/umd/zxing-browser.min.js'
            ],
            loadingConfig: {
                timeout: 15000,
                retryDelay: 500
            },
            formats: [
                'CODE_128', 'CODE_39', 'EAN_13', 'EAN_8',
                'UPC_A', 'UPC_E', 'QR_CODE', 'DATA_MATRIX'
            ]
        };
    }

    async isAvailable() {
        try {
            if (typeof WebAssembly !== 'object') {
                return false;
            }

            if (!window.isSecureContext && !this._isLocalhost()) {
                return false;
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
                throw new Error('ZXing WASM no está disponible');
            }

            if (!this.isLibraryLoaded) {
                await this._loadZXingLibrary();
            }

            this.videoElement = document.getElementById(elementId);
            if (!this.videoElement) {
                throw new Error(`Elemento con ID '${elementId}' no encontrado`);
            }

            this._setupVideoElement();
            await this._createCodeReader();

            return true;
        } catch (error) {
            throw error;
        }
    }

    async _loadZXingLibrary() {
        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        this.loadingPromise = new Promise(async (resolve, reject) => {
            try {
                if (typeof ZXing !== 'undefined' && ZXing.BrowserMultiFormatReader) {
                    this.isLibraryLoaded = true;
                    resolve();
                    return;
                }

                let loadedSuccessfully = false;

                for (const cdnUrl of this.config.cdnUrls) {
                    try {
                        await this._loadScriptFromCDN(cdnUrl, this.config.loadingConfig.timeout);
                        
                        if (typeof ZXing !== 'undefined' && ZXing.BrowserMultiFormatReader) {
                            loadedSuccessfully = true;
                            break;
                        }
                    } catch (error) {
                        await this._delay(this.config.loadingConfig.retryDelay);
                        continue;
                    }
                }

                if (!loadedSuccessfully) {
                    throw new Error('No se pudo cargar ZXing WASM desde ningún CDN');
                }

                this.isLibraryLoaded = true;
                resolve();
                
            } catch (error) {
                reject(error);
            }
        });

        return this.loadingPromise;
    }

    _loadScriptFromCDN(url, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const existingScript = document.querySelector(`script[src="${url}"]`);
            if (existingScript && typeof ZXing !== 'undefined') {
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
                setTimeout(resolve, 200);
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

    _setupVideoElement() {
        this.videoElement.style.width = '100%';
        this.videoElement.style.height = '100%';
        this.videoElement.style.objectFit = 'cover';
        this.videoElement.playsInline = true;
        this.videoElement.muted = true;
        this.videoElement.autoplay = true;
    }

    async _createCodeReader() {
        try {
            if (!ZXing || !ZXing.BrowserMultiFormatReader) {
                throw new Error('ZXing.BrowserMultiFormatReader no disponible');
            }

            this.codeReader = new ZXing.BrowserMultiFormatReader();
            
            if (this.codeReader.hints && ZXing.BarcodeFormat) {
                const hints = new Map();
                const formats = this.config.formats
                    .filter(format => ZXing.BarcodeFormat[format] !== undefined)
                    .map(format => ZXing.BarcodeFormat[format]);
                
                if (formats.length > 0) {
                    hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, formats);
                    hints.set(ZXing.DecodeHintType.TRY_HARDER, true);
                    this.codeReader.hints = hints;
                }
            }
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

            if (!this.codeReader) {
                await this._createCodeReader();
            }

            this.isScanning = true;
            
            await this.codeReader.decodeFromVideoDevice(
                null,
                this.videoElement,
                (result, error) => {
                    if (result) {
                        this._handleScanSuccess(result);
                    }
                    if (error && error.name !== 'NotFoundException') {
                        this._handleScanError(error);
                    }
                }
            );

            return true;
        } catch (error) {
            this.isScanning = false;
            if (this.scanCallbacks.onError) {
                this.scanCallbacks.onError(error, this._getErrorMessage(error));
            }
            throw error;
        }
    }

    _handleScanSuccess(result) {
        if (!this.isScanning) return;

        this.isScanning = false;
        
        if (this.scanCallbacks.onSuccess) {
            this.scanCallbacks.onSuccess(
                result.text,
                {
                    format: result.barcodeFormat ? result.barcodeFormat.toString() : 'UNKNOWN',
                    resultPoints: result.resultPoints,
                    engine: 'wasm',
                    confidence: 0.9,
                    rawResult: result
                }
            );
        }
    }

    _handleScanError(error) {
        if (error.name === 'NotFoundException') {
            return;
        }

        if (this.scanCallbacks.onError) {
            this.scanCallbacks.onError(error, this._getErrorMessage(error));
        }
    }

    async stop() {
        try {
            this.isScanning = false;

            if (this.codeReader) {
                try {
                    await this.codeReader.reset();
                } catch (resetError) {
                    console.warn('Error reseteando CodeReader:', resetError);
                }
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
        this.codeReader = null;
        this.videoElement = null;
        this.scanCallbacks = { onSuccess: null, onError: null };
    }

    getInfo() {
        return {
            name: 'ZXing (WebAssembly)',
            type: 'wasm',
            performance: 'high',
            formats: this.config.formats,
            isActive: this.isScanning,
            isLibraryLoaded: this.isLibraryLoaded,
            capabilities: {
                realTime: true,
                highAccuracy: true,
                lowLatency: false,
                hardwareAccelerated: false,
                crossPlatform: true
            }
        };
    }

    _getErrorMessage(error) {
        if (error.name === 'NotAllowedError') {
            return 'Permisos de cámara denegados para ZXing WASM.';
        } else if (error.name === 'NotFoundError') {
            return 'No se encontró cámara para ZXing WASM.';
        } else if (error.name === 'NotReadableError') {
            return 'La cámara está siendo usada por otra aplicación.';
        } else if (error.message && error.message.includes('WASM')) {
            return 'Error cargando WebAssembly. Verifica tu conexión.';
        } else if (error.message && error.message.includes('CDN')) {
            return 'Error cargando ZXing WASM desde CDNs. Verifica tu conexión.';
        }
        
        return `Error del motor WASM: ${error.message}`;
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
    module.exports = ZXingWASMEngine;
} else if (typeof window !== 'undefined') {
    window.ZXingWASMEngine = ZXingWASMEngine;
}
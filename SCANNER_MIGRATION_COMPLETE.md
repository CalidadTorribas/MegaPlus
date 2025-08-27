# Guía de Migración Completa del Escáner - Código Minimalista

## Información General del Proyecto

**Mega||Scan v3.1.0** - Aplicación de escaneo de códigos de barras con arquitectura híbrida de 3 motores optimizada para React.

## Código Completo Minimalista

A continuación se incluye todo el código necesario para migrar la funcionalidad de escáner, **sin analytics ni funcionalidades prescindibles**.

---

## 1. scanner-interfaces.js

```javascript
/**
 * Scanner Interfaces - Sistema unificado de detección y gestión de motores
 * Versión Minimalista para React
 */

/**
 * Interfaz común para todos los motores de escaneo
 */
class IScannerEngine {
    constructor() {
        if (this.constructor === IScannerEngine) {
            throw new Error('IScannerEngine es una interfaz abstracta');
        }
    }

    async isAvailable() {
        throw new Error('Método isAvailable debe ser implementado');
    }

    async initialize(elementId, config) {
        throw new Error('Método initialize debe ser implementado');
    }

    async start(onSuccess, onError) {
        throw new Error('Método start debe ser implementado');
    }

    async stop() {
        throw new Error('Método stop debe ser implementado');
    }

    async destroy() {
        throw new Error('Método destroy debe ser implementado');
    }

    getInfo() {
        throw new Error('Método getInfo debe ser implementado');
    }
}

/**
 * Detector de capacidades del navegador
 */
class ScannerCapabilityDetector {
    constructor() {
        this.capabilities = null;
        this.detectionPromise = null;
    }

    async detectCapabilities() {
        if (this.detectionPromise) {
            return this.detectionPromise;
        }

        this.detectionPromise = this._performDetection();
        return this.detectionPromise;
    }

    async _performDetection() {
        console.log('🔍 Detectando capacidades del navegador...');

        const capabilities = {
            browser: this._getBrowserInfo(),
            barcodeDetector: await this._checkBarcodeDetectorAPI(),
            webAssembly: this._checkWebAssemblySupport(),
            camera: await this._checkCameraCapabilities(),
            security: this._checkSecurityContext(),
            performance: this._estimatePerformance()
        };

        this.capabilities = capabilities;
        return capabilities;
    }

    _getBrowserInfo() {
        const ua = navigator.userAgent;
        return {
            isChrome: /Chrome/.test(ua) && !/Edge/.test(ua),
            isFirefox: /Firefox/.test(ua),
            isSafari: /Safari/.test(ua) && !/Chrome/.test(ua),
            isEdge: /Edge/.test(ua),
            isMobile: /Mobi|Android/i.test(ua),
            isIOS: /iPad|iPhone|iPod/.test(ua),
            isAndroid: /Android/.test(ua)
        };
    }

    async _checkBarcodeDetectorAPI() {
        try {
            if (!('BarcodeDetector' in window)) {
                return { available: false, reason: 'API no disponible' };
            }

            const supportedFormats = await BarcodeDetector.getSupportedFormats();
            const detector = new BarcodeDetector({
                formats: supportedFormats.filter(format => 
                    ['code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code'].includes(format)
                )
            });

            return {
                available: true,
                supportedFormats,
                performance: 'native'
            };
        } catch (error) {
            return { available: false, reason: error.message };
        }
    }

    _checkWebAssemblySupport() {
        try {
            if (typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function') {
                const module = new WebAssembly.Module(new Uint8Array([
                    0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00
                ]));
                
                return {
                    available: true,
                    streaming: 'instantiateStreaming' in WebAssembly,
                    performance: 'high'
                };
            }
        } catch (error) {
            if ('WebAssembly' in window) {
                return { available: true, streaming: false, performance: 'medium' };
            }
        }
        
        return { available: false, reason: 'WebAssembly no soportado' };
    }

    async _checkCameraCapabilities() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                return { available: false, reason: 'getUserMedia no disponible' };
            }

            let permissionStatus = 'unknown';
            if (navigator.permissions) {
                try {
                    const permission = await navigator.permissions.query({ name: 'camera' });
                    permissionStatus = permission.state;
                } catch (e) {
                    // Ignorar errores de permisos
                }
            }

            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');

            return {
                available: true,
                deviceCount: videoDevices.length,
                hasBackCamera: videoDevices.some(device => 
                    device.label.toLowerCase().includes('back') || 
                    device.label.toLowerCase().includes('rear')
                ),
                permissionStatus
            };
        } catch (error) {
            return { available: false, reason: error.message };
        }
    }

    _checkSecurityContext() {
        return {
            isSecureContext: window.isSecureContext,
            protocol: location.protocol,
            hostname: location.hostname,
            isLocalhost: location.hostname === 'localhost' || location.hostname === '127.0.0.1',
            httpsRequired: location.protocol !== 'https:' && !this._isLocalhost()
        };
    }

    _estimatePerformance() {
        const performance = {
            hardwareConcurrency: navigator.hardwareConcurrency || 1,
            deviceMemory: navigator.deviceMemory || 'unknown',
            estimated: 'medium'
        };

        if (performance.hardwareConcurrency >= 8 && performance.deviceMemory >= 4) {
            performance.estimated = 'high';
        } else if (performance.hardwareConcurrency >= 4 && performance.deviceMemory >= 2) {
            performance.estimated = 'medium';
        } else {
            performance.estimated = 'low';
        }

        return performance;
    }

    _isLocalhost() {
        return location.hostname === 'localhost' || 
               location.hostname === '127.0.0.1' || 
               location.hostname === '::1';
    }

    async getRecommendedEngine() {
        const capabilities = await this.detectCapabilities();

        if (capabilities.barcodeDetector.available) {
            return 'native';
        }

        if (capabilities.webAssembly.available && capabilities.performance.estimated !== 'low') {
            return 'wasm';
        }

        return 'javascript';
    }

    getCapabilities() {
        return this.capabilities;
    }

    async isEngineAvailable(engineType) {
        const capabilities = await this.detectCapabilities();
        
        switch (engineType) {
            case 'native':
                return capabilities.barcodeDetector.available;
            case 'wasm':
                return capabilities.webAssembly.available;
            case 'javascript':
                return true;
            default:
                return false;
        }
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { IScannerEngine, ScannerCapabilityDetector };
} else if (typeof window !== 'undefined') {
    window.IScannerEngine = IScannerEngine;
    window.ScannerCapabilityDetector = ScannerCapabilityDetector;
}
```

---

## 2. barcode-detector-engine.js

```javascript
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
```

---

## 3. zxing-wasm-engine.js

```javascript
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
```

---

## 4. html5-qrcode-engine.js

```javascript
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
```

---

## 5. scanner-factory.js (Minimalista)

```javascript
/**
 * Scanner Factory - Orquestador de motores (versión minimalista)
 * Sin analytics, solo funcionalidad esencial
 */

class ScannerFactory {
    constructor() {
        this.capabilityDetector = null;
        this.currentEngine = null;
        this.currentEngineType = null;
        this.isInitialized = false;
        this.engineInstances = new Map();
        
        this.config = {
            enginePriority: ['native', 'wasm', 'javascript'],
            fallbackEnabled: true,
            maxFallbackAttempts: 2,
            fallbackDelay: 1000
        };

        this.callbacks = {
            onEngineSelected: null,
            onFallbackUsed: null,
            onStatusUpdate: null
        };
    }

    async initialize() {
        try {
            console.log('🔧 Inicializando Scanner Factory...');

            this.capabilityDetector = new ScannerCapabilityDetector();
            await this.capabilityDetector.detectCapabilities();
            
            const recommendedEngine = await this.capabilityDetector.getRecommendedEngine();
            this.currentEngineType = recommendedEngine;

            this.isInitialized = true;
            console.log(`✅ Scanner Factory inicializada - Motor: ${this.currentEngineType}`);
            
            return true;
        } catch (error) {
            console.error('❌ Error inicializando Scanner Factory:', error);
            throw error;
        }
    }

    async getEngine(elementId, config = {}) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            console.log(`🔧 Obteniendo motor: ${this.currentEngineType}`);
            this._updateStatus(`Preparando motor ${this.currentEngineType}...`);

            let engine = await this._createEngine(this.currentEngineType);
            
            try {
                const success = await engine.initialize(elementId, config);
                if (success) {
                    this.currentEngine = engine;
                    
                    if (this.callbacks.onEngineSelected) {
                        this.callbacks.onEngineSelected(this.currentEngineType, engine.getInfo());
                    }
                    
                    console.log(`✅ Motor ${this.currentEngineType} listo`);
                    this._updateStatus(`Motor ${this.currentEngineType} listo`);
                    
                    return engine;
                }
            } catch (engineError) {
                console.warn(`⚠️ Error inicializando motor ${this.currentEngineType}:`, engineError);
                
                if (this.config.fallbackEnabled) {
                    return await this._attemptFallback(elementId, config, engineError);
                } else {
                    throw engineError;
                }
            }
            
        } catch (error) {
            console.error('❌ Error obteniendo motor:', error);
            throw error;
        }
    }

    async _createEngine(engineType) {
        if (this.engineInstances.has(engineType)) {
            const cachedEngine = this.engineInstances.get(engineType);
            console.log(`💾 Reutilizando instancia: ${engineType}`);
            return cachedEngine;
        }

        console.log(`🔨 Creando instancia: ${engineType}`);
        let engine = null;

        switch (engineType) {
            case 'native':
                if (typeof BarcodeDetectorEngine === 'undefined') {
                    throw new Error('BarcodeDetectorEngine no disponible');
                }
                engine = new BarcodeDetectorEngine();
                break;
                
            case 'wasm':
                if (typeof ZXingWASMEngine === 'undefined') {
                    throw new Error('ZXingWASMEngine no disponible');
                }
                engine = new ZXingWASMEngine();
                break;
                
            case 'javascript':
                if (typeof HTML5QRCodeEngine === 'undefined') {
                    throw new Error('HTML5QRCodeEngine no disponible');
                }
                engine = new HTML5QRCodeEngine();
                break;
                
            default:
                throw new Error(`Tipo de motor desconocido: ${engineType}`);
        }

        const isAvailable = await engine.isAvailable();
        if (!isAvailable) {
            throw new Error(`Motor ${engineType} no está disponible`);
        }

        this.engineInstances.set(engineType, engine);
        console.log(`✅ Motor ${engineType} creado y cacheado`);
        
        return engine;
    }

    async _attemptFallback(elementId, config, originalError) {
        console.log('🔄 Iniciando fallback...');
        
        if (this.callbacks.onFallbackUsed) {
            this.callbacks.onFallbackUsed(this.currentEngineType, originalError);
        }

        const currentIndex = this.config.enginePriority.indexOf(this.currentEngineType);
        const remainingEngines = this.config.enginePriority.slice(currentIndex + 1);

        for (const fallbackEngine of remainingEngines) {
            try {
                console.log(`🔄 Intentando fallback a: ${fallbackEngine}`);
                this._updateStatus(`Intentando motor alternativo: ${fallbackEngine}...`);
                
                if (!(await this._isEngineAvailable(fallbackEngine))) {
                    console.log(`⭕ Motor ${fallbackEngine} no disponible`);
                    continue;
                }

                if (this.config.fallbackDelay > 0) {
                    await this._delay(this.config.fallbackDelay);
                }

                const fallbackEngineInstance = await this._createEngine(fallbackEngine);
                const success = await fallbackEngineInstance.initialize(elementId, config);
                
                if (success) {
                    this.currentEngineType = fallbackEngine;
                    this.currentEngine = fallbackEngineInstance;
                    
                    console.log(`✅ Fallback exitoso: ${fallbackEngine}`);
                    this._updateStatus(`Motor alternativo ${fallbackEngine} listo`);
                    
                    if (this.callbacks.onEngineSelected) {
                        this.callbacks.onEngineSelected(fallbackEngine, fallbackEngineInstance.getInfo());
                    }
                    
                    return fallbackEngineInstance;
                }
                
            } catch (fallbackError) {
                console.warn(`⚠️ Fallback a ${fallbackEngine} falló:`, fallbackError);
                continue;
            }
        }

        const finalError = new Error(`Todos los motores fallaron. Error original: ${originalError.message}`);
        console.error('❌ Todos los fallbacks agotados');
        throw finalError;
    }

    async _isEngineAvailable(engineType) {
        try {
            const engine = await this._createEngine(engineType);
            return await engine.isAvailable();
        } catch (error) {
            return false;
        }
    }

    getCurrentEngineInfo() {
        if (!this.currentEngine) {
            return null;
        }
        
        return {
            ...this.currentEngine.getInfo(),
            isRecommended: this.currentEngineType === 'native',
            fallbacksAvailable: this._getAvailableFallbacks()
        };
    }

    _getAvailableFallbacks() {
        const currentIndex = this.config.enginePriority.indexOf(this.currentEngineType);
        return this.config.enginePriority.slice(currentIndex + 1);
    }

    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    async destroy() {
        try {
            console.log('🧹 Destruyendo Scanner Factory...');
            
            if (this.currentEngine) {
                await this.currentEngine.destroy();
            }
            
            for (const [engineType, engine] of this.engineInstances) {
                try {
                    await engine.destroy();
                    console.log(`🧹 Motor ${engineType} destruido`);
                } catch (error) {
                    console.warn(`⚠️ Error destruyendo motor ${engineType}:`, error);
                }
            }
            
            this.engineInstances.clear();
            this.currentEngine = null;
            this.currentEngineType = null;
            this.capabilityDetector = null;
            this.isInitialized = false;
            this.callbacks = {};
            
            console.log('✅ Scanner Factory destruida');
            
        } catch (error) {
            console.error('⚠️ Error destruyendo Scanner Factory:', error);
        }
    }

    _updateStatus(message) {
        console.log('📊 Factory Status:', message);
        
        if (this.callbacks.onStatusUpdate) {
            this.callbacks.onStatusUpdate(message);
        }
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getAvailableEngines() {
        const available = [];
        
        for (const engineType of this.config.enginePriority) {
            if (await this._isEngineAvailable(engineType)) {
                available.push(engineType);
            }
        }
        
        return available;
    }

    forceEngine(engineType) {
        if (!this.config.enginePriority.includes(engineType)) {
            throw new Error(`Motor desconocido: ${engineType}`);
        }
        
        const previousEngine = this.currentEngineType;
        this.currentEngineType = engineType;
        
        console.log(`🔧 Motor forzado de ${previousEngine} a: ${engineType}`);
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScannerFactory;
} else if (typeof window !== 'undefined') {
    window.ScannerFactory = ScannerFactory;
}
```

---

## 6. scanner-module.js (Minimalista)

```javascript
/**
 * Scanner Module - Módulo principal unificado (versión minimalista)
 * Sin analytics, solo funcionalidad esencial
 */

class ScannerModule {
    constructor() {
        this.scannerFactory = null;
        this.activeEngine = null;
        this.engineInfo = null;
        
        this.cameraPermissionStatus = 'unknown';
        this.isInitialized = false;
        this.hasRequestedPermissionBefore = false;
        this.lastErrorMessage = null;
        
        this.callbacks = {
            onScanSuccess: null,
            onScanError: null,
            onPermissionChange: null,
            onStatusUpdate: null
        };

        this.config = {
            fps: 10,
            qrbox: { width: 320, height: 200 },
            aspectRatio: 1.6,
            fallbackEnabled: true,
            autoSelectEngine: true,
            initTimeout: 15000,
            maxRetries: 3,
            retryDelay: 1000
        };

        this._initializeFactory();
    }

    async _initializeFactory() {
        try {
            console.log('🔧 Inicializando Scanner Factory...');
            
            if (typeof ScannerFactory === 'undefined') {
                throw new Error('ScannerFactory no disponible');
            }

            this.scannerFactory = new ScannerFactory();
            
            this.scannerFactory.setCallbacks({
                onEngineSelected: this._onEngineSelected.bind(this),
                onFallbackUsed: this._onFallbackUsed.bind(this),
                onStatusUpdate: this._onFactoryStatusUpdate.bind(this)
            });

            console.log('✅ Scanner Factory inicializada');
        } catch (error) {
            console.error('❌ Error inicializando Scanner Factory:', error);
            this.lastErrorMessage = `Error de inicialización: ${error.message}`;
        }
    }

    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    checkCompatibility() {
        try {
            const isSecureContext = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost';
            const hasMediaDevices = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
            
            if (!isSecureContext) {
                throw new Error('HTTPS requerido para acceso a la cámara');
            }
            
            if (!hasMediaDevices) {
                const deviceInfo = this._detectDeviceType();
                
                if (deviceInfo.isDesktop && !deviceInfo.likelyHasCamera) {
                    console.log('🖥️ Escritorio sin cámara detectado');
                    throw new Error('DESKTOP_NO_CAMERA');
                }
                throw new Error('Tu navegador no soporta acceso a la cámara');
            }
            
            return true;
        } catch (error) {
            this.lastErrorMessage = this.getErrorMessage(error);
            throw error;
        }
    }

    _detectDeviceType() {
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;
        const screen = window.screen;
        const touch = 'ontouchstart' in window;
        const maxTouchPoints = navigator.maxTouchPoints || 0;
        
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isTablet = /iPad|Android.*Tablet|PlayBook|Silk/i.test(userAgent) || 
                         (screen.width >= 768 && screen.height >= 1024);
        
        const isWindows = /Windows/i.test(platform);
        const isMac = /Mac/i.test(platform);
        const isLinux = /Linux/i.test(platform) && !isMobile;
        const isDesktopOS = isWindows || isMac || isLinux;
        
        const likelyHasCamera = 
            isMobile || 
            isTablet || 
            (touch && maxTouchPoints > 0) || 
            /Chrome OS/i.test(userAgent) || 
            (screen.width <= 1366 && screen.height <= 768);
        
        let deviceType = 'unknown';
        if (isMobile) deviceType = 'mobile';
        else if (isTablet) deviceType = 'tablet';
        else if (isDesktopOS && !touch) deviceType = 'desktop';
        else if (touch) deviceType = 'touchscreen';
        
        return {
            type: deviceType,
            isDesktop: deviceType === 'desktop',
            isMobile,
            isTablet,
            isDesktopOS,
            hasTouch: touch,
            touchPoints: maxTouchPoints,
            likelyHasCamera,
            screenSize: `${screen.width}x${screen.height}`,
            platform
        };
    }

    async checkPersistedPermissions() {
        try {
            if (navigator.permissions) {
                const permission = await navigator.permissions.query({ name: 'camera' });
                this.cameraPermissionStatus = permission.state;
                
                if (permission.state === 'granted') {
                    this.hasRequestedPermissionBefore = true;
                }
                
                console.log('🔍 Permisos verificados:', permission.state);
                
                permission.onchange = () => {
                    this.cameraPermissionStatus = permission.state;
                    console.log('🔄 Permisos cambiaron a:', permission.state);
                    
                    if (this.callbacks.onPermissionChange) {
                        this.callbacks.onPermissionChange(permission.state);
                    }
                };
            }
        } catch (error) {
            console.log('⚠️ Error verificando permisos:', error);
        }
    }

    async requestCameraPermission() {
        try {
            console.log('📹 Solicitando permisos...');
            
            this.checkCompatibility();
            
            const constraints = { 
                video: { 
                    facingMode: "environment",
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    focusMode: { ideal: "continuous" }
                } 
            };

            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia(constraints);
                console.log('✅ Permisos concedidos con configuración avanzada');
            } catch (advancedError) {
                console.log('⚠️ Usando configuración básica');
                
                if (advancedError.name === 'NotFoundError') {
                    const deviceInfo = this._detectDeviceType();
                    if (deviceInfo.isDesktop && !deviceInfo.likelyHasCamera) {
                        console.log('🖥️ Confirmado: Escritorio sin cámara');
                        throw new Error('DESKTOP_NO_CAMERA');
                    }
                }
                
                const basicConstraints = {
                    video: { 
                        facingMode: "environment",
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                };
                stream = await navigator.mediaDevices.getUserMedia(basicConstraints);
                console.log('✅ Permisos concedidos con configuración básica');
            }
            
            stream.getTracks().forEach(track => track.stop());
            this.cameraPermissionStatus = 'granted';
            this.hasRequestedPermissionBefore = true;
            
            return true;
        } catch (error) {
            console.error('❌ Error de permisos:', error);
            this.cameraPermissionStatus = 'denied';
            this.lastErrorMessage = this.getErrorMessage(error);
            throw error;
        }
    }

    async activateCamera() {
        try {
            console.log('🚀 Activando cámara...');
            
            if (this.cameraPermissionStatus === 'granted' && this.hasRequestedPermissionBefore) {
                console.log('✅ Permisos ya concedidos');
                this.updateStatus('Preparando motor de escaneo...');
                return true;
            }

            this.updateStatus('Verificando compatibilidad...');
            this.checkCompatibility();
            
            this.updateStatus('Solicitando permisos de cámara...');
            await this.requestCameraPermission();
            
            this.updateStatus('Cámara activada correctamente');
            return true;
            
        } catch (error) {
            console.error('Error activando cámara:', error);
            const errorMessage = this.getErrorMessage(error);
            this.lastErrorMessage = errorMessage;
            
            this.updateStatus(errorMessage);
            
            if (this.callbacks.onScanError) {
                this.callbacks.onScanError(error, errorMessage);
            }
            
            throw error;
        }
    }

    async initializeScanner(elementId = 'qr-reader') {
        if (this.cameraPermissionStatus !== 'granted') {
            console.log('Permisos no otorgados');
            return false;
        }

        try {
            this.updateStatus('Inicializando motor de escaneo...');
            
            if (!this.scannerFactory) {
                await this._initializeFactory();
            }
            
            console.log('🎯 Obteniendo motor óptimo...');
            this.activeEngine = await this.scannerFactory.getEngine(elementId, this.config);
            this.engineInfo = this.activeEngine.getInfo();
            
            this.updateStatus('Motor listo, iniciando escaneo...');
            console.log('✅ Motor configurado:', this.engineInfo.name);

            await this.activeEngine.start(
                this._onScanSuccess.bind(this),
                this._onScanError.bind(this)
            );

            this.updateStatus('Buscando código de barras...');
            this.isInitialized = true;
            return true;
            
        } catch (error) {
            console.error('Error inicializando escáner:', error);
            const errorMessage = this.getErrorMessage(error);
            this.lastErrorMessage = errorMessage;
            
            this.updateStatus(errorMessage);
            
            if (this.callbacks.onScanError) {
                this.callbacks.onScanError(error, errorMessage);
            }
            
            this.isInitialized = false;
            return false;
        }
    }

    _onScanSuccess(decodedText, decodedResult) {
        console.log('🎯 Código escaneado:', decodedText);
        console.log('📊 Detalles:', decodedResult);
        
        this.stop();
        
        if (this.callbacks.onScanSuccess) {
            this.callbacks.onScanSuccess(decodedText, decodedResult);
        }
    }

    _onScanError(error, message) {
        console.warn('⚠️ Error en escaneo:', error, message);
        
        const criticalMessages = ['error', 'denegado', 'bloqueado', 'adblocker', 'conexión', 'red'];
        const isCritical = criticalMessages.some(keyword => message.toLowerCase().includes(keyword));
        
        if (isCritical && this.callbacks.onScanError) {
            this.callbacks.onScanError(error, message);
        }
    }

    _onEngineSelected(engineType, engineInfo) {
        console.log(`🔧 Motor seleccionado: ${engineType}`);
        this.engineInfo = engineInfo;
        this.updateStatus(`Usando motor ${engineInfo.name}`);
    }

    _onFallbackUsed(originalEngine, error) {
        console.log(`🔄 Fallback desde ${originalEngine}:`, error);
        this.updateStatus(`Cambiando a motor alternativo...`);
    }

    _onFactoryStatusUpdate(message) {
        this.updateStatus(message);
    }

    stop() {
        if (this.activeEngine) {
            try {
                console.log('⏹️ Deteniendo motor...');
                this.activeEngine.stop().then(() => {
                    console.log('✅ Motor detenido');
                }).catch(err => {
                    console.error('Error deteniendo motor:', err);
                }).finally(() => {
                    this.isInitialized = false;
                });
            } catch (error) {
                console.error('Error deteniendo motor:', error);
                this.isInitialized = false;
            }
        }
    }

    updateStatus(message) {
        console.log('📊 Estado:', message);
        
        if (this.callbacks.onStatusUpdate) {
            this.callbacks.onStatusUpdate(message);
        }
    }

    getStatus() {
        const baseStatus = {
            isInitialized: this.isInitialized,
            cameraPermissionStatus: this.cameraPermissionStatus,
            hasActiveReader: !!this.activeEngine,
            hasRequestedPermissionBefore: this.hasRequestedPermissionBefore,
            lastErrorMessage: this.lastErrorMessage
        };

        if (this.engineInfo) {
            baseStatus.engine = this.engineInfo;
        }

        if (this.scannerFactory) {
            baseStatus.availableEngines = this.scannerFactory.getAvailableEngines();
        }

        return baseStatus;
    }

    getErrorMessage(error) {
        console.error('Detalle del error:', error);
        
        if (error.message === 'DESKTOP_NO_CAMERA') {
            const deviceInfo = this._detectDeviceType();
            const deviceName = deviceInfo.isDesktopOS ? 
                (deviceInfo.platform.includes('Mac') ? 'Mac' :
                 deviceInfo.platform.includes('Win') ? 'PC con Windows' : 'equipo de escritorio') :
                'dispositivo';
                
            return `No se detectó ninguna cámara en este ${deviceName}. Puedes introducir el código manualmente.`;
        } else if (error.name === 'NotAllowedError') {
            return 'Permisos de cámara denegados. Permite el acceso y recarga la página.';
        } else if (error.name === 'NotFoundError') {
            const deviceInfo = this._detectDeviceType();
            if (deviceInfo.isMobile) {
                return 'No se encontró cámara en tu dispositivo móvil. Verifica que no esté siendo usada por otra aplicación.';
            } else if (deviceInfo.isTablet) {
                return 'No se encontró cámara en tu tablet. Puedes introducir el código manualmente.';
            } else {
                return 'No se encontró ninguna cámara en el dispositivo.';
            }
        } else if (error.name === 'NotSupportedError') {
            return 'El navegador no soporta acceso a la cámara.';
        } else if (error.name === 'NotReadableError') {
            return 'La cámara está siendo usada por otra aplicación.';
        } else if (error.name === 'OverconstrainedError') {
            return 'Las restricciones de cámara no pueden ser satisfechas.';
        } else if (error.message && error.message.includes('HTTPS')) {
            return 'HTTPS requerido para acceso a la cámara en móviles.';
        } else if (error.message && (error.message.includes('librería') || error.message.includes('escáner') || error.message.includes('CDN') || error.message.includes('Factory'))) {
            return 'No se pudo cargar el escáner. Puede ser debido a un adblocker. Desactívalo y recarga la página.';
        }
        
        return 'Error inesperado: ' + (error.message || 'Error desconocido');
    }

    destroy() {
        this.stop();
        
        if (this.scannerFactory) {
            this.scannerFactory.destroy();
            this.scannerFactory = null;
        }
        
        this.activeEngine = null;
        this.engineInfo = null;
        this.callbacks = {};
        this.lastErrorMessage = null;
        
        console.log('🧹 Scanner Module destruido');
    }

    getEngineInfo() {
        if (this.scannerFactory) {
            return this.scannerFactory.getCurrentEngineInfo();
        }
        return this.engineInfo;
    }

    forceEngine(engineType) {
        if (this.scannerFactory) {
            this.scannerFactory.forceEngine(engineType);
            console.log(`🔧 Motor forzado a: ${engineType}`);
        } else {
            console.warn('⚠️ Factory no disponible');
        }
    }

    async isEngineAvailable(engineType) {
        if (this.scannerFactory) {
            return await this.scannerFactory._isEngineAvailable(engineType);
        }
        return false;
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScannerModule;
} else if (typeof window !== 'undefined') {
    window.ScannerModule = ScannerModule;
}
```

---

## Código React Completo

### Hook personalizado - useBarcodeScanner.js

```jsx
import { useState, useRef, useCallback, useEffect } from 'react';

export const useBarcodeScanner = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);
    const [lastScan, setLastScan] = useState(null);
    const [scannerStatus, setScannerStatus] = useState({});
    const scannerRef = useRef(null);

    const initializeScanner = useCallback(async (elementId) => {
        try {
            if (!window.ScannerModule) {
                throw new Error('ScannerModule no cargado');
            }

            scannerRef.current = new window.ScannerModule();
            
            scannerRef.current.setCallbacks({
                onScanSuccess: (code, result) => {
                    setLastScan({ code, result, timestamp: Date.now() });
                    setIsScanning(false);
                    setError(null);
                },
                onScanError: (err, message) => {
                    setError(message);
                },
                onStatusUpdate: (message) => {
                    console.log('Scanner status:', message);
                },
                onPermissionChange: (status) => {
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
            
        } catch (err) {
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
    }, []);

    const getEngineInfo = useCallback(() => {
        return scannerRef.current?.getEngineInfo() || null;
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
        initializeScanner,
        stopScanner,
        cleanup,
        getEngineInfo
    };
};
```

### Componente Scanner - ScannerComponent.jsx

```jsx
import React, { useRef, useEffect, useState } from 'react';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';

const ScannerComponent = ({ 
    onScanSuccess, 
    onScanError,
    className = '',
    showControls = true,
    showEngineInfo = false
}) => {
    const videoRef = useRef(null);
    const [engineInfo, setEngineInfo] = useState(null);
    const [manualCode, setManualCode] = useState('');
    
    const {
        isScanning,
        error,
        lastScan,
        scannerStatus,
        initializeScanner,
        stopScanner,
        cleanup,
        getEngineInfo
    } = useBarcodeScanner();

    // Efecto para manejar resultados de escaneo
    useEffect(() => {
        if (lastScan) {
            onScanSuccess?.(lastScan.code, lastScan.result);
            if (showEngineInfo) {
                setEngineInfo(getEngineInfo());
            }
        }
    }, [lastScan, onScanSuccess, getEngineInfo, showEngineInfo]);

    // Efecto para manejar errores
    useEffect(() => {
        if (error) {
            onScanError?.(new Error(error), error);
        }
    }, [error, onScanError]);

    const handleStartScan = async () => {
        try {
            await initializeScanner('scanner-video');
        } catch (err) {
            console.error('Error al iniciar escáner:', err);
        }
    };

    const handleStopScan = () => {
        stopScanner();
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualCode.trim()) {
            onScanSuccess?.(manualCode.trim(), {
                format: 'MANUAL',
                engine: 'manual',
                confidence: 1.0,
                manual: true
            });
            setManualCode('');
        }
    };

    const needsActivation = scannerStatus.cameraPermissionStatus !== 'granted' || 
                           !scannerStatus.hasRequestedPermissionBefore;
    
    const isDesktopNoCamera = scannerStatus.cameraPermissionStatus === 'desktop_no_camera' ||
                             (error && error.includes('No se detectó ninguna cámara'));

    return (
        <div className={`scanner-container ${className}`}>
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
                        <h3 className="camera-activation-title">
                            {isDesktopNoCamera ? 'Sin Cámara Disponible' : 'Activar Cámara'}
                        </h3>
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
            
            {/* Mensaje de Error */}
            {error && (
                <div className="scanner-error">
                    {error}
                </div>
            )}
            
            {/* Información del Motor */}
            {showEngineInfo && engineInfo && (
                <div className="engine-info">
                    <small>Motor: {engineInfo.name} ({engineInfo.type})</small>
                </div>
            )}
            
            {/* Controles */}
            {showControls && (
                <div className="scanner-controls">
                    {!isScanning ? (
                        <button 
                            onClick={handleStartScan} 
                            className="btn btn-primary"
                            disabled={isDesktopNoCamera && scannerStatus.cameraPermissionStatus === 'denied'}
                        >
                            {isDesktopNoCamera ? 'Cámara No Disponible' : 'Iniciar Escáner'}
                        </button>
                    ) : (
                        <button 
                            onClick={handleStopScan} 
                            className="btn btn-secondary"
                        >
                            Detener
                        </button>
                    )}
                </div>
            )}
            
            {/* Input Manual */}
            <div className="manual-input">
                <p>O introduce manualmente:</p>
                <form onSubmit={handleManualSubmit} className="manual-form">
                    <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="Introduce el código aquí"
                        className="manual-input-field"
                    />
                    <button type="submit" className="btn btn-primary">
                        Buscar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ScannerComponent;
```

### CSS Básico - scanner.css

```css
.scanner-container {
    position: relative;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    background: #f5f5f5;
    border-radius: 12px;
    overflow: hidden;
}

.scanner-video {
    width: 100%;
    height: 300px;
    background: #000;
    object-fit: cover;
}

.scanner-video.hidden {
    display: none;
}

.camera-activation {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 300px;
    background: #f8f9fa;
}

.camera-activation-content {
    text-align: center;
    padding: 20px;
}

.camera-activation-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.camera-activation-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #333;
}

.camera-activation-description {
    font-size: 14px;
    color: #666;
    line-height: 1.4;
    max-width: 280px;
    margin: 0 auto;
}

.scanner-target {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
}

.scanner-frame {
    position: relative;
    width: 250px;
    height: 150px;
    border: 2px solid #fff;
    border-radius: 8px;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.3);
}

.scanner-corners::before,
.scanner-corners::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border: 3px solid #4CAF50;
}

.scanner-corners::before {
    top: -3px;
    left: -3px;
    border-right: none;
    border-bottom: none;
}

.scanner-corners::after {
    bottom: -3px;
    right: -3px;
    border-left: none;
    border-top: none;
}

.scanner-line {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #4CAF50, transparent);
    animation: scanLine 2s infinite;
}

@keyframes scanLine {
    0% { transform: translateY(-75px); }
    100% { transform: translateY(75px); }
}

.scanner-error {
    background: #fee;
    color: #c33;
    padding: 12px;
    margin: 12px;
    border-radius: 6px;
    font-size: 14px;
    text-align: center;
}

.engine-info {
    padding: 8px 12px;
    background: #e3f2fd;
    font-size: 12px;
    color: #1565c0;
    text-align: center;
}

.scanner-controls {
    padding: 16px;
    text-align: center;
}

.manual-input {
    padding: 16px;
    border-top: 1px solid #ddd;
    background: #fff;
}

.manual-input p {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #666;
    text-align: center;
}

.manual-form {
    display: flex;
    gap: 8px;
}

.manual-input-field {
    flex: 1;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
}

.manual-input-field:focus {
    outline: none;
    border-color: #4CAF50;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-primary {
    background: #4CAF50;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #45a049;
}

.btn-secondary {
    background: #f44336;
    color: white;
}

.btn-secondary:hover:not(:disabled) {
    background: #da190b;
}
```

### Ejemplo de uso - App.jsx

```jsx
import React, { useEffect, useState } from 'react';
import ScannerComponent from './components/ScannerComponent';
import './scanner.css';

function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [scanResult, setScanResult] = useState(null);

    // Cargar módulos del escáner al montar
    useEffect(() => {
        const loadScannerModules = async () => {
            try {
                // Cargar los módulos en orden
                await import('./utils/scanner/scanner-interfaces.js');
                await import('./utils/scanner/barcode-detector-engine.js');
                await import('./utils/scanner/zxing-wasm-engine.js');
                await import('./utils/scanner/html5-qrcode-engine.js');
                await import('./utils/scanner/scanner-factory.js');
                await import('./utils/scanner/scanner-module.js');
                
                console.log('✅ Módulos del escáner cargados');
                setIsLoading(false);
            } catch (error) {
                console.error('❌ Error cargando módulos:', error);
                setIsLoading(false);
            }
        };
        
        loadScannerModules();
    }, []);

    const handleScanSuccess = (code, result) => {
        console.log('Código escaneado:', code);
        console.log('Detalles:', result);
        
        setScanResult({
            code,
            format: result.format,
            engine: result.engine,
            timestamp: Date.now()
        });
        
        // Aquí puedes hacer la llamada a tu API
        // searchProduct(code);
    };

    const handleScanError = (error, message) => {
        console.error('Error de escaneo:', message);
    };

    if (isLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <div>Cargando escáner...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
            <h1>Escáner de Códigos de Barras</h1>
            
            <ScannerComponent 
                onScanSuccess={handleScanSuccess}
                onScanError={handleScanError}
                showControls={true}
                showEngineInfo={true}
            />
            
            {scanResult && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '16px', 
                    background: '#e8f5e8', 
                    borderRadius: '8px' 
                }}>
                    <h3>Último Escaneo:</h3>
                    <p><strong>Código:</strong> {scanResult.code}</p>
                    <p><strong>Formato:</strong> {scanResult.format}</p>
                    <p><strong>Motor:</strong> {scanResult.engine}</p>
                    <p><strong>Tiempo:</strong> {new Date(scanResult.timestamp).toLocaleTimeString()}</p>
                </div>
            )}
        </div>
    );
}

export default App;
```

---

## Resumen del Código Minimalista

**Total de código:** ~35KB (sin analytics)

### Características mantenidas:
✅ **Arquitectura híbrida de 3 motores**
✅ **Detección automática de capacidades**
✅ **Selección inteligente de motores**
✅ **Fallbacks transparentes**
✅ **Gestión robusta de errores**
✅ **Carga optimizada desde CDNs**
✅ **Compatibilidad universal**
✅ **Detección de dispositivos sin cámara**

### Características removidas:
❌ Analytics detallados
❌ Métricas de rendimiento avanzadas
❌ Sistema de storage de métricas
❌ Callbacks de analytics
❌ Logs extensivos de debug

### Lista de archivos para copiar:
1. **scanner-interfaces.js** - Interfaces y detector de capacidades
2. **barcode-detector-engine.js** - Motor nativo (BarcodeDetector API)
3. **zxing-wasm-engine.js** - Motor WebAssembly (ZXing)
4. **html5-qrcode-engine.js** - Motor JavaScript (html5-qrcode)
5. **scanner-factory.js** - Orchestrador de motores (sin analytics)
6. **scanner-module.js** - Módulo principal unificado (sin analytics)
7. **useBarcodeScanner.js** - Hook personalizado para React
8. **ScannerComponent.jsx** - Componente React completo
9. **scanner.css** - Estilos básicos

Este código está **listo para producción** y mantiene toda la robustez del sistema original mientras elimina las funcionalidades prescindibles que solicitaste.
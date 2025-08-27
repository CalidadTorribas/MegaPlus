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
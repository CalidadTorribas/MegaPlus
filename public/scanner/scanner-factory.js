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
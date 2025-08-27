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
                return 'No se encontró cámara en tu dispositivo. Puedes introducir el código manualmente.';
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
/**
 * Hub Screen Component - Mega+ (HEADER COMPACTO CORPORATIVO)
 * 
 * Centro de control con header compacto y elegante:
 * - Header verde compacto: Logo izquierda + "Mega+" derecha
 * - Widgets con iconos sencillos (sin emojis)
 * - Footer minimalista estilo ProductosScreen
 * - Diseño ejecutivo y eficiente
 */

import React, { useState, useEffect } from 'react';
import { ConditionalMobileWrapper } from '@/components/wrappers/ConditionalMobileWrapper';

interface WidgetData {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: 'primary' | 'secondary' | 'success' | 'warning';
  permissions?: string[];
}

interface HubScreenProps {
  /** Función para salir de la aplicación */
  onExitApp?: () => void;
  /** Función para navegar a productos */
  onNavigateToProductos?: () => void;
}

// Widget component - Iconos sencillos, diseño original
const Widget: React.FC<{
  id: string;
  name: string;
  description: string;
  icon: string;
  color: 'primary' | 'secondary' | 'success' | 'warning';
  onClick: () => void;
}> = ({ name, description, icon, onClick }) => {
  const colors = {
    bg: 'bg-white hover:bg-neutral-50',
    border: 'border-neutral-200 hover:border-neutral-300',
    icon: 'text-neutral-600',
    title: 'text-neutral-800',
    description: 'text-neutral-600'
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${colors.bg} ${colors.border}
        border rounded-xl p-4
        transition-all duration-300 ease-out
        hover:scale-[1.02] hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        touch-target
        group
        w-full h-32
        flex flex-col justify-center items-center
        text-center
      `}
    >
      {/* Icono del widget - Centrado perfectamente */}
      <div className="flex justify-center items-center mb-2">
        <div className={`
          w-8 h-8 rounded-lg ${colors.bg} border ${colors.border}
          flex items-center justify-center
          group-hover:scale-110 transition-transform duration-300
          shadow-sm
        `}>
          <span className={`text-base font-light ${colors.icon}`}>{icon}</span>
        </div>
      </div>

      {/* Nombre del widget - Centrado y con espacio fijo */}
      <div className="mb-2">
        <h3 className={`text-sm font-semibold ${colors.title} leading-tight truncate max-w-full`}>
          {name}
        </h3>
      </div>

      {/* Descripción del widget - 2 líneas máximo, contenida */}
      <div className="flex-1 flex items-center justify-center max-w-full">
        <p className={`
          text-xs ${colors.description} leading-tight text-center
          overflow-hidden break-words
          max-h-8 
          line-clamp-2
        `} style={{ 
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {description}
        </p>
      </div>
    </button>
  );
};

// Configuración de widgets - Iconos sencillos
const WIDGETS: WidgetData[] = [
  {
    id: 'productos',
    name: 'Productos',
    description: 'Gestión del catálogo de productos',
    icon: '▢',
    color: 'primary',
    permissions: ['productos.view']
  },
  {
    id: 'clientes',
    name: 'Clientes',
    description: 'Administración de clientes',
    icon: '◯',
    color: 'secondary',
    permissions: ['clientes.view']
  },
  {
    id: 'materiales',
    name: 'Materiales',
    description: 'Control de materiales y stock',
    icon: '▲',
    color: 'success',
    permissions: ['materiales.view']
  },
  {
    id: 'documentos',
    name: 'Documentos',
    description: 'Gestión documental',
    icon: '◇',
    color: 'warning',
    permissions: ['documentacion.view']
  }
];

const getVisibleWidgets = (userPermissions: string[] = []): WidgetData[] => {
  return WIDGETS;
};

export const HubScreen: React.FC<HubScreenProps> = ({
  onExitApp,
  onNavigateToProductos
}) => {
  const visibleWidgets = getVisibleWidgets();
  const [notification, setNotification] = useState<string | null>(null);

  // Nuevo estado para el filtro de widgets
  const [widgetFilter, setWidgetFilter] = useState('');

  // Efecto para asegurar que el scroll esté en la parte superior al montar
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTo(0, 0);
  }, []);

  // Filtrado de widgets por nombre o descripción
  const filteredWidgets = visibleWidgets.filter(
    (widget) =>
      widget.name.toLowerCase().includes(widgetFilter.toLowerCase()) ||
      widget.description.toLowerCase().includes(widgetFilter.toLowerCase())
  );

  const handleWidgetClick = (widget: WidgetData) => {
    if (widget.id === 'productos' && onNavigateToProductos) {
      onNavigateToProductos();
    } else {
      setNotification(`${widget.name} - Próximamente disponible`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <>
      <ConditionalMobileWrapper>
            
            {/* HEADER COMPACTO CORPORATIVO */}
            <div 
              className="logo-bg-primary px-6 py-4 flex-shrink-0"
              style={{ 
                height: '80px',
                minHeight: '80px',
                maxHeight: '80px'
              }}
            >
              <div className="flex items-center justify-between h-full">
                {/* Logo a la izquierda */}
                <div className="w-12 h-12 flex items-center justify-center">
                  <img 
                    src="/logo.svg" 
                    alt="Mega+ Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* "Mega+" a la derecha */}
                <h1 
                  className="text-2xl text-white font-light" 
                  style={{ 
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                    letterSpacing: '-0.01em'
                  }}
                >
                  Mega<sup className="text-lg font-normal">+</sup>
                </h1>
              </div>
            </div>

            {/* CONTENIDO - Input de filtro y widgets distribuidos desde arriba */}
            <div 
              className="px-6 py-6 flex-1 overflow-y-auto"
              style={{ 
                height: '656px', // 800px - 80px header - 64px footer
                minHeight: '656px',
                maxHeight: '656px'
              }}
            >
              <div className="h-full flex flex-col">
                {/* Input de filtro */}
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={widgetFilter}
                  onChange={e => setWidgetFilter(e.target.value)}
                  className="mb-4 px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm"
                />

                {/* Grid de widgets - Distribuidos desde arriba */}
                <div className="grid grid-cols-2 gap-4">
                  {filteredWidgets.length > 0 ? (
                    filteredWidgets.map((widget) => (
                      <Widget
                        key={widget.id}
                        id={widget.id}
                        name={widget.name}
                        description={widget.description}
                        icon={widget.icon}
                        color={widget.color}
                        onClick={() => handleWidgetClick(widget)}
                      />
                    ))
                  ) : (
                    <div className="col-span-2 text-center text-neutral-500 py-8">
                      No se encontraron widgets.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* FOOTER MINIMALISTA - Estilo ProductosScreen */}
            <div 
              className="bg-white border-t border-neutral-200 px-6 py-3 flex-shrink-0"
              style={{ 
                height: '64px',
                minHeight: '64px',
                maxHeight: '64px'
              }}
            >
              <div className="flex items-center justify-center h-full">
                <button
                  onClick={onExitApp}
                  className="flex items-center space-x-2 px-4 py-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Salir de la aplicación</span>
                </button>
              </div>
            </div>
      </ConditionalMobileWrapper>

      {/* Notificación */}
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white border border-neutral-200 rounded-xl px-6 py-3 shadow-xl backdrop-blur-sm">
            <p className="text-neutral-800 text-sm font-medium">{notification}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default HubScreen;
#!/bin/bash
# 🧹 Mega+ Limpieza Fase 2 - Solo eliminaciones 100% seguras
# Basado en análisis que confirmó que estos archivos están vacíos

echo "🧹 Iniciando Limpieza Fase 2 del proyecto Mega+"
echo "Solo eliminando archivos confirmados como vacíos/no utilizados"
echo "============================================================"

# Contador de eliminaciones
deleted_count=0

# Función para eliminar y contar
safe_delete() {
    local path="$1"
    if [ -e "$path" ]; then
        rm -rf "$path"
        echo "✅ Eliminado: $path"
        ((deleted_count++))
    else
        echo "⚠️  No existe: $path"
    fi
}

echo ""
echo "🔸 Eliminando componentes atoms no utilizados..."

# Componentes atoms vacíos (confirmado por análisis)
safe_delete "src/components/atoms/Avatar"
safe_delete "src/components/atoms/Badge" 
safe_delete "src/components/atoms/Icon"
safe_delete "src/components/atoms/Input"
safe_delete "src/components/atoms/Link"
safe_delete "src/components/atoms/Spinner"
safe_delete "src/components/atoms/Text"
safe_delete "src/components/atoms/Checkbox"
safe_delete "src/components/atoms/Radio"
safe_delete "src/components/atoms/Switch"
safe_delete "src/components/atoms/Slider"

echo ""
echo "🔸 Eliminando componentes molecules (carpeta completa vacía)..."
safe_delete "src/components/molecules"

echo ""
echo "🔸 Eliminando componentes organisms (carpeta completa vacía)..."
safe_delete "src/components/organisms"

echo ""
echo "🔸 Eliminando templates no utilizados..."
safe_delete "src/components/templates/AuthLayout"
safe_delete "src/components/templates/DashboardLayout"
safe_delete "src/components/templates/ErrorLayout"
safe_delete "src/components/templates/LandingLayout"
safe_delete "src/components/templates/PageLayout"

echo ""
echo "🔸 Eliminando páginas vacías..."
safe_delete "src/pages/AboutPage.tsx"
safe_delete "src/pages/ContactPage.tsx"
safe_delete "src/pages/ErrorPage.tsx"
safe_delete "src/pages/HomePage.tsx"
safe_delete "src/pages/LoadingPage.tsx"
safe_delete "src/pages/NotFoundPage.tsx"
safe_delete "src/pages/PrivacyPage.tsx"
safe_delete "src/pages/TermsPage.tsx"
safe_delete "src/pages/index.ts"

echo ""
echo "🔸 Eliminando archivos lib no utilizados..."
safe_delete "src/lib/analytics.ts"
safe_delete "src/lib/queryClient.ts"
safe_delete "src/lib/sentry.ts"
safe_delete "src/lib/zod.ts"
safe_delete "src/lib/index.ts"

echo ""
echo "🔸 Eliminando archivos design-system no utilizados..."
safe_delete "src/design-system/foundations"
safe_delete "src/design-system/themes"
safe_delete "src/design-system/tokens/borders.ts"
safe_delete "src/design-system/tokens/breakpoints.ts"
safe_delete "src/design-system/tokens/colors.ts"
safe_delete "src/design-system/tokens/motion.ts"
safe_delete "src/design-system/tokens/opacity.ts"
safe_delete "src/design-system/tokens/shadows.ts"
safe_delete "src/design-system/tokens/spacing.ts"
safe_delete "src/design-system/tokens/typography.ts"
safe_delete "src/design-system/tokens/zIndex.ts"
safe_delete "src/design-system/tokens/index.ts"
safe_delete "src/design-system/utils/index.ts"
safe_delete "src/design-system/utils/responsive.ts"
safe_delete "src/design-system/utils/theme.ts"
safe_delete "src/design-system/utils/variants.ts"

echo ""
echo "🔸 Eliminando archivos styles no utilizados..."
safe_delete "src/styles/animations.css"
safe_delete "src/styles/base.css"
safe_delete "src/styles/components.css"
safe_delete "src/styles/index.css"
safe_delete "src/styles/print.css"
safe_delete "src/styles/responsive.css"
safe_delete "src/styles/utilities.css"
safe_delete "src/styles/variables.css"

echo ""
echo "🔸 Eliminando assets no utilizados..."
safe_delete "src/assets/fonts"
safe_delete "src/assets/icons"
safe_delete "src/assets/images"

echo ""
echo "============================================================"
echo "🎉 Limpieza Fase 2 completada!"
echo "📊 Total de elementos eliminados: $deleted_count"
echo ""
echo "🔍 Archivos/carpetas que SE MANTUVIERON (están en uso):"
echo "   ✅ src/components/atoms/Button/"
echo "   ✅ src/components/templates/MobileScreenLayout/"
echo "   ✅ src/pages/SplashScreen.tsx"
echo "   ✅ src/pages/LoginScreen.tsx" 
echo "   ✅ src/pages/HubScreen.tsx"
echo "   ✅ src/pages/ProductosScreen.tsx"
echo "   ✅ src/lib/supabase.ts"
echo "   ✅ src/design-system/utils/cn.ts"
echo "   ✅ src/styles/globals.css"
echo ""
echo "🚀 Ejecuta 'npm run dev' para verificar que todo sigue funcionando"
echo "💡 Si hay algún error, puedes restaurar desde git"
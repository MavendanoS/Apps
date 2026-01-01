#!/bin/bash

# Script de despliegue automático a Cloudflare Pages
echo "🚀 Iniciando despliegue a Cloudflare Pages..."
echo ""

# Verificar autenticación
echo "📋 Verificando autenticación..."
if ! npx wrangler whoami &>/dev/null; then
    echo "❌ No estás autenticado en Cloudflare"
    echo "🔑 Abriendo navegador para autenticación..."
    npx wrangler login
fi

# Hacer deploy
echo ""
echo "📦 Desplegando aplicación..."
npx wrangler pages deploy . \
    --project-name=mi-entrenamiento \
    --branch=main \
    --commit-dirty=true

echo ""
echo "✅ ¡Despliegue completado!"
echo "📱 Tu PWA estará disponible en: https://mi-entrenamiento.pages.dev"

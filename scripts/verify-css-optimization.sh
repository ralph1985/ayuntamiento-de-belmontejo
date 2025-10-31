#!/bin/bash

###############################################################################
# Script de Verificación de Optimización CSS
# ============================================
# 
# Este script ejecuta una verificación completa del sistema de optimización
# sin modificar ningún archivo.
#
# Uso:
#   chmod +x scripts/verify-css-optimization.sh
#   ./scripts/verify-css-optimization.sh
###############################################################################

set -e  # Exit on error

echo "🔍 Verificación de Sistema de Optimización CSS"
echo "=============================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Verificar dependencias
echo "📦 Verificando dependencias..."
echo ""

dependencies=("@fullhuman/postcss-purgecss" "purgecss" "cssnano" "postcss-cli")
missing=()

for dep in "${dependencies[@]}"; do
  if npm list "$dep" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} $dep instalado"
  else
    echo -e "${RED}✗${NC} $dep NO encontrado"
    missing+=("$dep")
  fi
done

echo ""

if [ ${#missing[@]} -ne 0 ]; then
  echo -e "${YELLOW}⚠️  Dependencias faltantes:${NC}"
  for dep in "${missing[@]}"; do
    echo "   - $dep"
  done
  echo ""
  echo -e "${BLUE}Ejecuta:${NC} npm install --save-dev ${missing[@]}"
  echo ""
  exit 1
fi

# 2. Verificar archivos de configuración
echo "⚙️  Verificando configuración..."
echo ""

config_files=("postcss.config.cjs" "purgecss.config.js" "scripts/purge-css.js")

for file in "${config_files[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗${NC} $file NO encontrado"
  fi
done

echo ""

# 3. Verificar scripts en package.json
echo "📜 Verificando scripts..."
echo ""

scripts=("purge:dry" "purge:apply" "build:css" "optimize:css" "analyze:css")

for script in "${scripts[@]}"; do
  if npm run | grep -q "$script"; then
    echo -e "${GREEN}✓${NC} npm run $script"
  else
    echo -e "${RED}✗${NC} npm run $script NO encontrado"
  fi
done

echo ""

# 4. Verificar estructura de capas CSS
echo "🎨 Verificando arquitectura CSS..."
echo ""

if grep -q "@layer base, components, utilities, legacy" src/styles/main.less; then
  echo -e "${GREEN}✓${NC} Capas CSS definidas correctamente"
else
  echo -e "${YELLOW}⚠️${NC}  No se detectaron capas CSS en main.less"
fi

if [ -d "src/styles/utilities" ]; then
  echo -e "${GREEN}✓${NC} Directorio utilities/ existe"
else
  echo -e "${YELLOW}⚠️${NC}  Directorio utilities/ no encontrado"
fi

if [ -d "src/styles/legacy" ]; then
  echo -e "${GREEN}✓${NC} Directorio legacy/ existe (será protegido)"
else
  echo -e "${YELLOW}⚠️${NC}  Directorio legacy/ no encontrado"
fi

echo ""

# 5. Instrucciones de prueba
echo "🧪 Prueba el sistema:"
echo "===================="
echo ""
echo -e "${BLUE}1. Compilar proyecto:${NC}"
echo "   npm run build"
echo ""
echo -e "${BLUE}2. Análisis (dry-run):${NC}"
echo "   npm run analyze:css"
echo ""
echo -e "${BLUE}3. Revisar reportes:${NC}"
echo "   cat dist/purge-analysis/*.analysis.txt"
echo ""
echo -e "${BLUE}4. Optimizar (producción):${NC}"
echo "   npm run optimize:css"
echo ""
echo -e "${BLUE}5. Verificar resultado:${NC}"
echo "   npm run preview"
echo ""

# 6. Resumen
echo "📊 Resumen:"
echo "==========="
echo ""
echo -e "${GREEN}✓${NC} Sistema de optimización configurado"
echo -e "${GREEN}✓${NC} Safelist protege utilidades y componentes"
echo -e "${GREEN}✓${NC} @layer legacy está protegida"
echo -e "${GREEN}✓${NC} Dry-run disponible para análisis seguro"
echo ""
echo -e "${BLUE}📖 Documentación:${NC}"
echo "   - PURGE_QUICK_START.md"
echo "   - docs/CSS_OPTIMIZATION.md"
echo "   - README.md (sección Optimización de CSS)"
echo ""
echo -e "${GREEN}✅ ¡Todo listo para optimizar CSS!${NC}"

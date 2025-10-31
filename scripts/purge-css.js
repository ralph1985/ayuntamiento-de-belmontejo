#!/usr/bin/env node

/* eslint-disable no-console */

/**
 * Purgador de CSS Selectivo
 * ==========================
 *
 * Este script purga CSS de forma selectiva, EXCLUYENDO @layer legacy.
 *
 * Uso:
 *   node scripts/purge-css.js --dry-run  # Ver qué se eliminaría
 *   node scripts/purge-css.js            # Aplicar purgado real
 */

import fs from 'node:fs';
import path from 'node:path';
import { PurgeCSS } from 'purgecss';

// Configuración
const CONFIG = {
  content: ['./src/**/*.{astro,tsx,jsx,ts,js,html}', './public/**/*.html'],

  safelist: {
    standard: [
      /^data-theme/,
      /^dark-mode$/,
      /^is-/,
      /^has-/,
      /^js-/,
      /^astro-/,
      /^active$/,
      /^current$/,
      /^open$/,
      /^expanded$/,
    ],
    deep: [
      /^u-/, // Utilidades
      /^c-/, // Componentes
      /^cs-/, // CodeStitch
    ],
    greedy: [/dark/, /theme/, /transition/, /cookie/],
  },

  defaultExtractor: content => {
    const broadMatches = content.match(/[\w-/:]+(?<!:)/g) || [];
    const classMatches =
      content.match(/class(?:Name)?=['"]([^'"]+)['"]/g) || [];
    const classes = classMatches
      .map(match => match.match(/['"]([^'"]+)['"]/)?.[1] || '')
      .join(' ')
      .split(/\s+/);
    const templateMatches = content.match(/`[^`]*\$\{[^}]*\}[^`]*`/g) || [];
    const templateClasses = templateMatches.flatMap(
      match => match.match(/[\w-]+/g) || []
    );

    return [...new Set([...broadMatches, ...classes, ...templateClasses])];
  },

  variables: true,
  keyframes: true,
  fontFace: true,
};

/**
 * Separa el CSS en capas
 * Retorna: { base, components, utilities, legacy }
 */
function splitCSSLayers(cssContent) {
  const layers = {
    base: '',
    components: '',
    utilities: '',
    legacy: '',
    other: '', // CSS fuera de layers
  };

  // Regex para detectar @layer blocks
  const layerRegex = /@layer\s+(base|components|utilities|legacy)\s*\{/g;

  let match;
  const layerBlocks = [];

  // Encontrar todos los @layer
  while ((match = layerRegex.exec(cssContent)) !== null) {
    const layerName = match[1];
    const startIndex = match.index;

    // Encontrar el cierre del bloque
    let braceCount = 0;
    let inLayer = false;
    let endIndex = startIndex;

    for (let i = startIndex; i < cssContent.length; i++) {
      if (cssContent[i] === '{') {
        braceCount++;
        inLayer = true;
      } else if (cssContent[i] === '}') {
        braceCount--;
        if (inLayer && braceCount === 0) {
          endIndex = i + 1;
          break;
        }
      }
    }

    layerBlocks.push({
      name: layerName,
      start: startIndex,
      end: endIndex,
      content: cssContent.substring(startIndex, endIndex),
    });
  }

  // Si no hay @layer (CSS ya compilado), intentar detectar por comentarios
  if (layerBlocks.length === 0) {
    console.warn(
      '⚠️  No se detectaron @layer blocks. El CSS podría estar ya compilado.'
    );
    console.warn(
      '   Aplicando purgado a todo el CSS excepto clases en safelist.'
    );
    return {
      base: '',
      components: '',
      utilities: '',
      legacy: '',
      other: cssContent,
    };
  }

  // Extraer contenido de cada capa
  for (const block of layerBlocks) {
    // Extraer solo el contenido interno (sin @layer {...})
    const innerContent = block.content
      .replace(/@layer\s+\w+\s*\{/, '')
      .replace(/\}$/, '');
    layers[block.name] = innerContent;
  }

  // Extraer CSS que no está en ninguna capa
  let lastEnd = 0;
  for (const block of layerBlocks) {
    if (block.start > lastEnd) {
      layers.other += cssContent.substring(lastEnd, block.start);
    }
    lastEnd = block.end;
  }
  if (lastEnd < cssContent.length) {
    layers.other += cssContent.substring(lastEnd);
  }

  return layers;
}

/**
 * Función principal de purgado
 */
async function purgeCSS(isDryRun = false) {
  console.log('🧹 Iniciando purgado selectivo de CSS...\n');

  // Buscar archivos CSS en dist
  const distDir = path.join(process.cwd(), 'dist/client');
  const astroDir = path.join(distDir, '_astro');

  if (!fs.existsSync(astroDir)) {
    console.error('❌ Error: No se encontró dist/_astro/');
    console.error('   Ejecuta "npm run build" primero.');
    process.exit(1);
  }

  const cssFiles = fs
    .readdirSync(astroDir)
    .filter(file => file.endsWith('.css') && !file.endsWith('.min.css'))
    .map(file => path.join(astroDir, file));

  if (cssFiles.length === 0) {
    console.error('❌ No se encontraron archivos CSS en dist/_astro/');
    process.exit(1);
  }

  console.log(`📁 Archivos CSS encontrados: ${cssFiles.length}`);
  for (const file of cssFiles) {
    console.log(`   - ${path.basename(file)}`);
  }
  console.log('');

  // Procesar cada archivo CSS
  for (const cssFile of cssFiles) {
    const fileName = path.basename(cssFile);
    const cssContent = fs.readFileSync(cssFile, 'utf-8');
    const originalSize = Buffer.byteLength(cssContent, 'utf-8');

    console.log(`📄 Procesando: ${fileName}`);
    console.log(`   Tamaño original: ${(originalSize / 1024).toFixed(2)} KB`);

    // Separar en capas
    const layers = splitCSSLayers(cssContent);

    console.log('   Capas detectadas:');
    console.log(`   - Base: ${layers.base ? '✓' : '✗'}`);
    console.log(`   - Components: ${layers.components ? '✓' : '✗'}`);
    console.log(`   - Utilities: ${layers.utilities ? '✓' : '✗'}`);
    console.log(`   - Legacy: ${layers.legacy ? '✓ (protegida)' : '✗'}`);

    // Construir CSS para purgar (todas las capas excepto legacy)
    const cssToPurge =
      layers.base + layers.components + layers.utilities + layers.other;

    if (!cssToPurge.trim()) {
      console.log('   ⚠️  No hay CSS para purgar (solo legacy o vacío)\n');
      continue;
    }

    // Ejecutar PurgeCSS
    try {
      const purgeCSSResult = await new PurgeCSS().purge({
        content: CONFIG.content,
        css: [{ raw: cssToPurge }],
        safelist: CONFIG.safelist,
        defaultExtractor: CONFIG.defaultExtractor,
        variables: CONFIG.variables,
        keyframes: CONFIG.keyframes,
        fontFace: CONFIG.fontFace,
      });

      const purgedCSS = purgeCSSResult[0].css;
      const purgedSize = Buffer.byteLength(purgedCSS, 'utf-8');
      const savedBytes = Buffer.byteLength(cssToPurge, 'utf-8') - purgedSize;
      const savedPercent = (
        (savedBytes / Buffer.byteLength(cssToPurge, 'utf-8')) *
        100
      ).toFixed(2);

      console.log(`   ✂️  CSS purgado: ${(purgedSize / 1024).toFixed(2)} KB`);
      console.log(
        `   💾 Ahorro: ${(savedBytes / 1024).toFixed(2)} KB (${savedPercent}%)`
      );

      // Reconstruir CSS: purged + legacy
      const finalCSS =
        purgedCSS +
        '\n\n' +
        (layers.legacy ? `@layer legacy {\n${layers.legacy}\n}` : '');
      const finalSize = Buffer.byteLength(finalCSS, 'utf-8');

      console.log(
        `   📦 Tamaño final (con legacy): ${(finalSize / 1024).toFixed(2)} KB`
      );

      if (isDryRun) {
        // Modo dry-run: guardar análisis
        const analysisDir = path.join(distDir, 'purge-analysis');
        if (!fs.existsSync(analysisDir)) {
          fs.mkdirSync(analysisDir, { recursive: true });
        }

        const analysisFile = path.join(
          analysisDir,
          fileName.replace('.css', '.analysis.txt')
        );
        const rejectedCSS = cssToPurge.replace(purgedCSS, '');

        fs.writeFileSync(
          analysisFile,
          `ANÁLISIS DE PURGADO - ${fileName}
===============================

Tamaño original: ${(originalSize / 1024).toFixed(2)} KB
CSS purgado: ${(purgedSize / 1024).toFixed(2)} KB
Tamaño final (con legacy): ${(finalSize / 1024).toFixed(2)} KB
Ahorro: ${(savedBytes / 1024).toFixed(2)} KB (${savedPercent}%)

CAPAS:
- Base: ${layers.base ? 'Detectada' : 'No detectada'}
- Components: ${layers.components ? 'Detectada' : 'No detectada'}
- Utilities: ${layers.utilities ? 'Detectada' : 'No detectada'}
- Legacy: ${layers.legacy ? 'Detectada y PROTEGIDA' : 'No detectada'}

CSS ELIMINADO (muestra):
${rejectedCSS.substring(0, 2000)}
${rejectedCSS.length > 2000 ? '\n... (truncado)' : ''}
`
        );

        console.log(
          `   📊 Análisis guardado: ${path.relative(process.cwd(), analysisFile)}`
        );
      } else {
        // Modo real: sobrescribir archivo
        fs.writeFileSync(cssFile, finalCSS, 'utf-8');
        console.log(`   ✅ Archivo actualizado`);
      }

      console.log('');
    } catch (error) {
      console.error(`   ❌ Error al purgar: ${error.message}\n`);
    }
  }

  console.log(
    isDryRun
      ? '✅ Análisis completado. Revisa dist/purge-analysis/ para ver qué se eliminaría.'
      : '✅ Purgado completado. Archivos CSS optimizados.'
  );
}

// CLI
const isDryRun =
  process.argv.includes('--dry-run') || process.argv.includes('-d');

try {
  await purgeCSS(isDryRun);
} catch (error) {
  console.error('❌ Error fatal:', error);
  process.exit(1);
}

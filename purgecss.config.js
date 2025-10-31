/**
 * PurgeCSS Configuration
 * ======================
 *
 * Configuración standalone para PurgeCSS.
 * Se usa con el comando `purge:dry` para dry-runs.
 *
 * IMPORTANTE: Este archivo NO purga @layer legacy
 */

module.exports = {
  // Archivos CSS a analizar
  // Astro compila main.less a dist/_astro/*.css
  content: ['./src/**/*.{astro,tsx,jsx,ts,js,html}', './public/**/*.html'],

  // Archivos CSS a purgar
  // Nota: Ajustar según el output de Astro build
  css: ['./dist/**/*.css'],

  // Directorio de salida
  output: './dist',

  // Safelist: Clases que NUNCA se eliminan
  safelist: {
    // Patrones estándar (clases exactas)
    standard: [
      /^data-theme/, // data-theme="dark"
      /^dark-mode$/, // body.dark-mode (legacy)
      /^is-/, // Estados: is-active, is-open
      /^has-/, // Estados: has-error
      /^js-/, // Hooks de JavaScript
      /^astro-/, // Clases generadas por Astro
      /^active$/, // Clases de estado comunes
      /^current$/,
      /^open$/,
      /^expanded$/,
    ],

    // Deep: Clases y todos sus descendientes
    deep: [
      /^u-/, // Todas las utilidades: u-flex, u-mt-sm, etc.
      /^c-/, // Componentes BEM: c-card, c-button
      /^cs-/, // CodeStitch: cs-topper, cs-title
    ],

    // Greedy: Búsqueda más agresiva (incluye variantes)
    greedy: [
      /dark/, // *dark* - protege dark mode
      /theme/, // *theme* - protege temas
      /transition/, // View transitions de Astro
      /cookie/, // Gestión de cookies
    ],
  },

  // Bloquear archivos específicos (NO purgar)
  blocklist: [],

  // Bloquear selectores específicos (NO eliminar)
  // Usamos esto para proteger @layer legacy
  skippedContentGlobs: [],

  // Custom extractor: Cómo encontrar clases en el contenido
  defaultExtractor: content => {
    // Patrón 1: Clases tradicionales con guiones y números
    const broadMatches = content.match(/[\w-/:]+(?<!:)/g) || [];

    // Patrón 2: Clases en atributos (class="...", className="...")
    const classMatches =
      content.match(/class(?:Name)?=['"]([^'"]+)['"]/g) || [];
    const classes = classMatches
      .map(match => match.match(/['"]([^'"]+)['"]/)?.[1] || '')
      .join(' ')
      .split(/\s+/);

    // Patrón 3: Clases dinámicas en template strings
    const templateMatches = content.match(/`[^`]*\$\{[^}]*\}[^`]*`/g) || [];
    const templateClasses = templateMatches.flatMap(
      match => match.match(/[\w-]+/g) || []
    );

    // Combinar todos los patrones
    return [...new Set([...broadMatches, ...classes, ...templateClasses])];
  },

  // Configuración adicional
  variables: true, // Mantener variables CSS
  keyframes: true, // Mantener @keyframes usados
  fontFace: true, // Mantener @font-face usados

  // Modo rejected: Genera archivo con CSS eliminado
  rejected: true,
  rejectedCss: './dist/rejected.css',
};

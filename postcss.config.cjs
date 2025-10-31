/**
 * PostCSS Configuration
 * =====================
 *
 * Pipeline de procesamiento CSS:
 * 1. PurgeCSS - Elimina clases no usadas (solo en producción)
 * 2. cssnano - Minifica el CSS
 * 3. autoprefixer - Añade prefijos de navegador
 */

const purgecss = require('@fullhuman/postcss-purgecss');
const cssnano = require('cssnano');

const isProduction = process.env.NODE_ENV === 'production';
const isPurgeEnabled = process.env.PURGE_CSS === 'true';

module.exports = {
  plugins: [
    // PurgeCSS: Elimina CSS no usado (solo si está habilitado)
    ...(isPurgeEnabled
      ? [
          purgecss({
            // Rutas donde buscar clases CSS usadas
            content: [
              './src/**/*.{astro,tsx,jsx,ts,js,html}',
              './public/**/*.html',
            ],

            // Safelist: Clases que NUNCA se deben eliminar
            safelist: {
              // Patrones de clases siempre protegidas
              standard: [/^data-theme/, /^dark-mode/, /^is-/, /^has-/, /^js-/],
              // Clases dinámicas generadas por JS o Astro
              deep: [
                /^u-/, // Utilidades
                /^c-/, // Componentes
                /^cs-/, // CodeStitch components
                /data-theme/, // Atributos de tema
              ],
              // Clases protegidas incluyendo sus descendientes
              greedy: [
                /dark/, // Protege clases relacionadas con dark mode
                /theme/, // Protege clases de tema
                /active/, // Estados activos
                /current/, // Estados actuales
                /open/, // Estados abiertos
                /expanded/, // Estados expandidos
              ],
            },

            // Eliminación selectiva por @layer
            // IMPORTANTE: NO purgamos @layer legacy
            rejected: true,
            rejectedCss: './dist/rejected.css', // Para debug

            // Custom extractor para mejor detección de clases
            defaultExtractor: content => {
              // Extrae clases de Astro, JSX y HTML
              const broadMatches =
                content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
              const innerMatches =
                content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];

              return broadMatches.concat(innerMatches);
            },

            // Excluir archivos específicos del purgado
            blocklist: [],

            // Variables CSS siempre se mantienen
            variables: true,

            // Keyframes siempre se mantienen si se usan
            keyframes: true,

            // Fuentes siempre se mantienen si se usan
            fontFace: true,
          }),
        ]
      : []),

    // cssnano: Minificación avanzada (solo en producción)
    ...(isProduction
      ? [
          cssnano({
            preset: [
              'default',
              {
                // Configuración de optimización
                discardComments: {
                  removeAll: true, // Elimina todos los comentarios
                },
                normalizeWhitespace: true,
                colormin: true, // Optimiza colores (#ffffff -> #fff)
                reduceIdents: false, // NO cambia nombres de @keyframes
                zindex: false, // NO modifica z-index
                discardUnused: {
                  keyframes: false, // NO elimina keyframes (PurgeCSS lo hace mejor)
                  fontFace: false, // NO elimina fuentes (PurgeCSS lo hace mejor)
                },
                mergeRules: true, // Combina reglas duplicadas
                minifySelectors: true, // Minifica selectores
                minifyParams: true, // Minifica @media params
                calc: {
                  precision: 5, // Precisión para cálculos
                },
              },
            ],
          }),
        ]
      : []),

    // autoprefixer: Siempre activo
    require('autoprefixer'),
  ],
};

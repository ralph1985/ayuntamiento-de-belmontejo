#!/usr/bin/env node

/**
 * Script de Migración de Clases CodeStitch (.cs-* → .c-*)
 *
 * Este script migra automáticamente todas las clases .cs-* a .c-* en:
 * 1. Archivos HTML/Astro (.astro)
 * 2. Archivos CSS/LESS (.less, .css)
 *
 * Uso:
 *   node scripts/migrate-cs-classes.js --dry-run    # Ver cambios sin aplicar
 *   node scripts/migrate-cs-classes.js              # Aplicar migración
 *   node scripts/migrate-cs-classes.js --verbose    # Modo verbose
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

// Configuración
const CONFIG = {
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  astroPattern: 'src/**/*.astro',
  cssPattern: 'src/styles/**/*.less',
  backupDir: '.migration-backup',
};

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Mapa de migración de clases CS a C
 * Generado por analyze-cs-classes.js
 */
const CS_TO_C_MAP = {
  'cs-arrow': 'c-arrow',
  'cs-bg-picture': 'c-bg-picture',
  'cs-block': 'c-block',
  'cs-box': 'c-box',
  'cs-button': 'c-button',
  'cs-button-solid': 'c-button',
  'cs-button-text': 'c-button-text',
  'cs-button-transparent': 'c-button--outline',
  'cs-card-group': 'c-card-group',
  'cs-contact': 'c-contact',
  'cs-container': 'c-container',
  'cs-content': 'c-content',
  'cs-content-flex': 'c-content-flex',
  'cs-date': 'c-date',
  'cs-desc': 'c-desc',
  'cs-drop-icon': 'c-drop-icon',
  'cs-drop-li': 'c-drop-li',
  'cs-drop-link': 'c-drop-link',
  'cs-drop-ul': 'c-drop-ul',
  'cs-faq-group': 'c-faq-group',
  'cs-faq-item': 'c-faq-item',
  'cs-flex': 'c-flex',
  'cs-flex-group': 'c-flex-group',
  'cs-flex-p': 'c-flex-p',
  'cs-form': 'c-form',
  'cs-h3': 'c-h3',
  'cs-header': 'c-heading',
  'cs-hide-on-desktop': 'c-hide-on-desktop',
  'cs-image-group': 'c-image-group',
  'cs-item': 'c-card',
  'cs-item-img': 'c-item-img',
  'cs-item-p': 'c-item-p',
  'cs-item-stars': 'c-item-stars',
  'cs-item-text': 'c-item-text',
  'cs-job': 'c-job',
  'cs-label-message': 'c-label-message',
  'cs-left': 'c-left',
  'cs-li': 'c-list__item',
  'cs-li-link': 'c-li-link',
  'cs-line': 'c-line',
  'cs-line1': 'c-line1',
  'cs-line2': 'c-line2',
  'cs-line3': 'c-line3',
  'cs-link': 'c-link',
  'cs-logo': 'c-logo',
  'cs-logo-text': 'c-logo-text',
  'cs-map': 'c-map',
  'cs-map-wrapper': 'c-map-wrapper',
  'cs-moon': 'c-moon',
  'cs-name': 'c-name',
  'cs-nav': 'c-nav',
  'cs-navigation': 'c-navigation',
  'cs-picture': 'c-picture',
  'cs-picture1': 'c-picture1',
  'cs-picture2': 'c-picture2',
  'cs-picture3': 'c-picture3',
  'cs-quote-icon': 'c-quote-icon',
  'cs-reviewer': 'c-reviewer',
  'cs-right': 'c-right',
  'cs-right-section': 'c-right-section',
  'cs-row': 'c-row',
  'cs-row-1': 'c-row-1',
  'cs-row-2': 'c-row-2',
  'cs-row-3': 'c-row-3',
  'cs-search-section': 'c-search-section',
  'cs-search-tips': 'c-search-tips',
  'cs-search-wrapper': 'c-search-wrapper',
  'cs-sun': 'c-sun',
  'cs-text': 'c-text',
  'cs-title': 'c-title',
  'cs-toc-link': 'c-toc-link',
  'cs-toc-list': 'c-toc-list',
  'cs-toggle': 'c-toggle',
  'cs-topper': 'c-topper',
  'cs-ul': 'c-list',
  'cs-ul-wrapper': 'c-ul-wrapper',
};

/**
 * Crea un regex para buscar una clase en HTML
 * Busca en atributos class="..." o class:list={[...]}
 */
function createHtmlClassRegex(csClass) {
  const escapedClass = csClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Buscar la clase en diferentes contextos:
  // 1. class="cs-class"
  // 2. class="other cs-class"
  // 3. class="cs-class other"
  // 4. class="other cs-class another"
  return new RegExp(
    `(class(?::list)?=(?:"|'|{\\[))([^"'}\\]]*\\b)(${escapedClass})(\\b[^"'}\\]]*)`,
    'g'
  );
}

/**
 * Crea un regex para buscar una clase en CSS
 * Busca selectores .cs-class y :where(.cs-class)
 */
function createCssClassRegex(csClass) {
  const escapedClass = csClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Buscar:
  // 1. .cs-class (selector directo)
  // 2. :where(.cs-class) (alias)
  return new RegExp(`(:where\\()?(\\.)(${escapedClass})(\\b)`, 'g');
}

/**
 * Migra clases en un archivo HTML/Astro
 */
function migrateHtmlFile(content, stats) {
  let modified = content;
  let fileChanges = 0;

  for (const [csClass, cClass] of Object.entries(CS_TO_C_MAP)) {
    const regex = createHtmlClassRegex(csClass);
    const matches = content.match(regex);

    if (matches) {
      // Reemplazar cada ocurrencia
      modified = modified.replace(
        regex,
        (match, prefix, beforeClass, className, afterClass) => {
          fileChanges++;
          stats.totalReplacements++;

          if (CONFIG.verbose) {
            console.log(
              `      ${colors.yellow}.${csClass}${colors.reset} → ${colors.green}.${cClass}${colors.reset}`
            );
          }

          return `${prefix}${beforeClass}${cClass}${afterClass}`;
        }
      );

      if (!stats.classesReplaced.has(csClass)) {
        stats.classesReplaced.set(csClass, 0);
      }
      stats.classesReplaced.set(
        csClass,
        stats.classesReplaced.get(csClass) + matches.length
      );
    }
  }

  return { modified, changes: fileChanges };
}

/**
 * Migra clases en un archivo CSS/LESS
 */
function migrateCssFile(content, stats) {
  let modified = content;
  let fileChanges = 0;

  for (const [csClass, cClass] of Object.entries(CS_TO_C_MAP)) {
    const regex = createCssClassRegex(csClass);
    const matches = content.match(regex);

    if (matches) {
      // Reemplazar cada ocurrencia
      modified = modified.replace(regex, (match, wherePrefix, dot) => {
        fileChanges++;
        stats.totalReplacements++;

        if (CONFIG.verbose) {
          const prefix = wherePrefix ? ':where(' : '';
          console.log(
            `      ${colors.yellow}${prefix}.${csClass}${colors.reset} → ${colors.green}${prefix}.${cClass}${colors.reset}`
          );
        }

        return `${wherePrefix || ''}${dot}${cClass}`;
      });

      if (!stats.classesReplaced.has(csClass)) {
        stats.classesReplaced.set(csClass, 0);
      }
      stats.classesReplaced.set(
        csClass,
        stats.classesReplaced.get(csClass) + matches.length
      );
    }
  }

  return { modified, changes: fileChanges };
}

/**
 * Procesa un archivo
 */
async function processFile(filePath, isHtml, stats) {
  const relativePath = path.relative(PROJECT_ROOT, filePath);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const { modified, changes } = isHtml
      ? migrateHtmlFile(content, stats)
      : migrateCssFile(content, stats);

    if (changes > 0) {
      stats.filesModified++;

      if (CONFIG.verbose) {
        console.log(`\n   ${colors.cyan}${relativePath}${colors.reset}`);
        console.log(
          `      ${colors.green}✓ ${changes} reemplazos${colors.reset}`
        );
      } else {
        console.log(
          `   ${colors.green}✓${colors.reset} ${relativePath} (${changes} reemplazos)`
        );
      }

      // Aplicar cambios si no es dry-run
      if (!CONFIG.dryRun) {
        await fs.writeFile(filePath, modified, 'utf-8');
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error(
      `${colors.red}   ✗ Error en ${relativePath}:${colors.reset}`,
      error.message
    );
    stats.errors++;
    return false;
  }
}

/**
 * Procesa todos los archivos de un patrón
 */
async function processFiles(pattern, isHtml, stats, label) {
  console.log(`\n${colors.cyan}${label}${colors.reset}`);

  const files = await glob(pattern, { cwd: PROJECT_ROOT });
  console.log(
    `${colors.blue}   Encontrados ${files.length} archivos${colors.reset}\n`
  );

  if (files.length === 0) {
    return;
  }

  for (const file of files) {
    const filePath = path.join(PROJECT_ROOT, file);
    await processFile(filePath, isHtml, stats);
  }
}

/**
 * Genera reporte de migración
 */
function printReport(stats) {
  console.log(
    `\n${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.cyan}  📊 REPORTE DE MIGRACIÓN${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`
  );

  if (CONFIG.dryRun) {
    console.log(
      `${colors.yellow}⚠️  MODO DRY-RUN - No se aplicaron cambios${colors.reset}\n`
    );
  }

  console.log(
    `${colors.green}✓ Archivos modificados:${colors.reset}       ${colors.bright}${stats.filesModified}${colors.reset}`
  );
  console.log(
    `${colors.green}✓ Total de reemplazos:${colors.reset}        ${colors.bright}${stats.totalReplacements}${colors.reset}`
  );
  console.log(
    `${colors.green}✓ Clases migradas:${colors.reset}            ${colors.bright}${stats.classesReplaced.size}${colors.reset} de ${Object.keys(CS_TO_C_MAP).length}`
  );

  if (stats.errors > 0) {
    console.log(
      `${colors.red}✗ Errores:${colors.reset}                    ${colors.bright}${stats.errors}${colors.reset}`
    );
  }

  // Top 10 clases más reemplazadas
  const topClasses = Array.from(stats.classesReplaced.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (topClasses.length > 0) {
    console.log(`\n${colors.magenta}Top 10 clases migradas:${colors.reset}`);
    for (const [csClass, count] of topClasses) {
      const cClass = CS_TO_C_MAP[csClass];
      console.log(
        `  ${colors.cyan}.${csClass}${colors.reset} → ${colors.green}.${cClass}${colors.reset} (${colors.bright}${count}${colors.reset} ocurrencias)`
      );
    }
  }

  // Clases no encontradas
  const notFound = Object.keys(CS_TO_C_MAP).filter(
    cls => !stats.classesReplaced.has(cls)
  );

  if (notFound.length > 0) {
    console.log(
      `\n${colors.yellow}ℹ️  Clases no encontradas en archivos (${notFound.length}):${colors.reset}`
    );
    console.log(
      `   ${notFound.slice(0, 10).join(', ')}${notFound.length > 10 ? '...' : ''}`
    );
  }

  console.log(
    `\n${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`
  );

  if (CONFIG.dryRun) {
    console.log(
      `${colors.yellow}💡 Ejecuta sin --dry-run para aplicar los cambios${colors.reset}`
    );
  } else {
    console.log(
      `${colors.green}✓ Migración completada exitosamente${colors.reset}`
    );
  }

  console.log(
    `${colors.blue}📄 Ver reporte de análisis: cs-classes-report.md${colors.reset}\n`
  );
}

/**
 * Genera script de actualización de aliases CSS
 */
async function generateAliasUpdateScript() {
  const script = `#!/usr/bin/env node

/**
 * Script para actualizar aliases en legacy/_id-aliases.less
 * 
 * Este script actualiza los aliases :where(.cs-*) a :where(.c-*)
 * después de la migración de clases.
 * 
 * Generado automáticamente por migrate-cs-classes.js
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

const ALIAS_FILE = 'src/styles/legacy/_id-aliases.less';

const CS_TO_C_MAP = ${JSON.stringify(CS_TO_C_MAP, null, 2)};

async function updateAliases() {
  const filePath = path.join(PROJECT_ROOT, ALIAS_FILE);
  let content = await fs.readFile(filePath, 'utf-8');
  let changes = 0;
  
  for (const [csClass, cClass] of Object.entries(CS_TO_C_MAP)) {
    const regex = new RegExp(\`:where\\\\(\\\\.${csClass}\\\\)\`, 'g');
    const matches = content.match(regex);
    
    if (matches) {
      content = content.replace(regex, \`:where(.${cClass})\`);
      changes += matches.length;
      console.log(\`✓ .${csClass} → .${cClass} (\${matches.length} alias)\`);
    }
  }
  
  if (changes > 0) {
    await fs.writeFile(filePath, content, 'utf-8');
    console.log(\`\\n✓ Actualizados \${changes} aliases en ${ALIAS_FILE}\`);
  } else {
    console.log('No se encontraron aliases para actualizar');
  }
}

updateAliases().catch(console.error);
`;

  const scriptPath = path.join(
    PROJECT_ROOT,
    'scripts',
    'update-css-aliases.js'
  );
  await fs.writeFile(scriptPath, script, 'utf-8');

  console.log(
    `${colors.blue}📝 Script generado: scripts/update-css-aliases.js${colors.reset}`
  );
  console.log(
    `${colors.blue}   Ejecutar después: node scripts/update-css-aliases.js${colors.reset}\n`
  );
}

/**
 * Main
 */
async function main() {
  console.log(
    `\n${colors.bright}${colors.magenta}═══════════════════════════════════════════${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.magenta}  🔄 MIGRACIÓN .cs-* → .c-*${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.magenta}═══════════════════════════════════════════${colors.reset}\n`
  );

  if (CONFIG.dryRun) {
    console.log(`${colors.yellow}⚠️  MODO DRY-RUN ACTIVADO${colors.reset}`);
    console.log(
      `${colors.yellow}   No se modificarán archivos${colors.reset}\n`
    );
  }

  const stats = {
    filesModified: 0,
    totalReplacements: 0,
    classesReplaced: new Map(),
    errors: 0,
  };

  try {
    // 1. Procesar archivos HTML/Astro
    await processFiles(
      CONFIG.astroPattern,
      true,
      stats,
      '🔍 Procesando archivos HTML/Astro...'
    );

    // 2. Procesar archivos CSS/LESS
    await processFiles(
      CONFIG.cssPattern,
      false,
      stats,
      '🎨 Procesando archivos CSS/LESS...'
    );

    // 3. Generar reporte
    printReport(stats);

    // 4. Generar script de actualización de aliases (solo si no es dry-run)
    if (!CONFIG.dryRun && stats.filesModified > 0) {
      await generateAliasUpdateScript(stats);
    }

    // Exit code
    process.exit(stats.errors > 0 ? 1 : 0);
  } catch (error) {
    console.error(`\n${colors.red}❌ Error fatal:${colors.reset}`, error);
    process.exit(1);
  }
}

// Ejecutar
main();

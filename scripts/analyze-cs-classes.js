#!/usr/bin/env node

/**
 * Script de Análisis de Clases CodeStitch (.cs-*)
 *
 * Este script analiza todos los archivos .astro del proyecto para:
 * 1. Identificar todas las clases .cs-* únicas
 * 2. Contar ocurrencias de cada clase
 * 3. Listar archivos que usan cada clase
 * 4. Verificar si existen estilos CSS para cada clase
 * 5. Generar un mapa de migración propuesto
 * 6. Crear un informe detallado
 *
 * Uso:
 *   node scripts/analyze-cs-classes.js
 *   node scripts/analyze-cs-classes.js --verbose
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

// Configuración
const CONFIG = {
  astroPattern: 'src/**/*.astro',
  cssPattern: 'src/styles/**/*.less',
  verbose: process.argv.includes('--verbose'),
  outputFile: 'cs-classes-analysis.json',
  reportFile: 'cs-classes-report.md',
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
 * Extrae todas las clases .cs-* de un contenido HTML/Astro
 */
function extractCsClasses(content) {
  const classRegex = /class=["']([^"']*)["']/g;
  const classes = new Set();

  let match;
  while ((match = classRegex.exec(content)) !== null) {
    const classString = match[1];
    // Separar múltiples clases y filtrar las que empiezan con cs-
    const csClasses = classString
      .split(/\s+/)
      .filter(cls => cls.startsWith('cs-') && cls.length > 3);

    csClasses.forEach(cls => classes.add(cls));
  }

  return Array.from(classes);
}

/**
 * Busca si una clase existe en archivos CSS
 */
async function findClassInCss(className, cssFiles) {
  const occurrences = [];

  for (const cssFile of cssFiles) {
    const content = await fs.readFile(cssFile, 'utf-8');

    // Buscar .cs-clase o :where(.cs-clase)
    const patterns = [
      new RegExp(`\\.${className}\\b`, 'g'),
      new RegExp(`:where\\(\\.${className}\\)`, 'g'),
    ];

    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        occurrences.push({
          file: path.relative(PROJECT_ROOT, cssFile),
          count: matches.length,
          type: pattern.toString().includes(':where') ? 'alias' : 'direct',
        });
      }
    }
  }

  return occurrences;
}

/**
 * Genera nombre de clase propuesto según nomenclatura BEM
 */
function proposeMigration(csClass) {
  // Mapeo de clases conocidas
  const knownMappings = {
    'cs-topper': 'c-topper',
    'cs-title': 'c-title',
    'cs-text': 'c-text',
    'cs-button-solid': 'c-button',
    'cs-button-transparent': 'c-button--outline',
    'cs-container': 'c-container',
    'cs-picture': 'c-picture',
    'cs-ul': 'c-list',
    'cs-li': 'c-list__item',
    'cs-link': 'c-link',
    'cs-icon': 'c-icon',
    'cs-card-group': 'c-card-group',
    'cs-item': 'c-card',
    'cs-header': 'c-heading',
  };

  // Si hay un mapeo conocido, usarlo
  if (knownMappings[csClass]) {
    return knownMappings[csClass];
  }

  // Si no, simplemente reemplazar cs- por c-
  return csClass.replace(/^cs-/, 'c-');
}

/**
 * Analiza todos los archivos Astro
 */
async function analyzeAstroFiles() {
  console.log(`${colors.cyan}🔍 Analizando archivos Astro...${colors.reset}`);

  const astroFiles = await glob(CONFIG.astroPattern, { cwd: PROJECT_ROOT });
  console.log(
    `${colors.blue}   Encontrados ${astroFiles.length} archivos .astro${colors.reset}\n`
  );

  const classData = new Map(); // className -> { count, files: [], proposed }

  for (const file of astroFiles) {
    const filePath = path.join(PROJECT_ROOT, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const classes = extractCsClasses(content);

    if (CONFIG.verbose && classes.length > 0) {
      console.log(
        `${colors.blue}   ${file}:${colors.reset} ${classes.length} clases`
      );
    }

    for (const className of classes) {
      if (!classData.has(className)) {
        classData.set(className, {
          count: 0,
          files: [],
          proposed: proposeMigration(className),
          cssOccurrences: [],
        });
      }

      const data = classData.get(className);
      data.count++;
      if (!data.files.includes(file)) {
        data.files.push(file);
      }
    }
  }

  return { classData, totalFiles: astroFiles.length };
}

/**
 * Busca estilos CSS para cada clase
 */
async function analyzeCssFiles(classData) {
  console.log(`\n${colors.cyan}🎨 Buscando estilos CSS...${colors.reset}`);

  const cssFiles = await glob(CONFIG.cssPattern, { cwd: PROJECT_ROOT });
  console.log(
    `${colors.blue}   Analizando ${cssFiles.length} archivos CSS/LESS${colors.reset}\n`
  );

  const cssFilePaths = cssFiles.map(f => path.join(PROJECT_ROOT, f));

  let processed = 0;
  const total = classData.size;

  for (const [className, data] of classData.entries()) {
    processed++;
    if (CONFIG.verbose && processed % 10 === 0) {
      console.log(
        `${colors.blue}   Procesadas ${processed}/${total} clases...${colors.reset}`
      );
    }

    data.cssOccurrences = await findClassInCss(className, cssFilePaths);
  }

  console.log(`${colors.green}   ✓ Análisis CSS completado${colors.reset}`);
}

/**
 * Genera estadísticas
 */
function generateStats(classData, totalFiles) {
  const stats = {
    totalClasses: classData.size,
    totalOccurrences: 0,
    totalFiles: totalFiles,
    classesWithCss: 0,
    classesWithoutCss: 0,
    classesWithAliases: 0,
    topClasses: [],
    orphanClasses: [],
    filesWithMostClasses: new Map(),
  };

  // Contar ocurrencias y clases con/sin CSS
  for (const [className, data] of classData.entries()) {
    stats.totalOccurrences += data.count;

    if (data.cssOccurrences.length > 0) {
      stats.classesWithCss++;

      const hasAlias = data.cssOccurrences.some(occ => occ.type === 'alias');
      if (hasAlias) {
        stats.classesWithAliases++;
      }
    } else {
      stats.classesWithoutCss++;
      stats.orphanClasses.push(className);
    }
  }

  // Top 10 clases más usadas
  stats.topClasses = Array.from(classData.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([className, data]) => ({
      className,
      count: data.count,
      files: data.files.length,
    }));

  return stats;
}

/**
 * Genera reporte en Markdown
 */
async function generateReport(classData, stats) {
  console.log(`\n${colors.cyan}📄 Generando reporte...${colors.reset}`);

  let report = `# Análisis de Clases CodeStitch (.cs-*)

**Fecha de análisis:** ${new Date().toLocaleString('es-ES')}

---

## 📊 Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| **Total de clases .cs-* únicas** | ${stats.totalClasses} |
| **Total de ocurrencias** | ${stats.totalOccurrences} |
| **Archivos Astro analizados** | ${stats.totalFiles} |
| **Clases con estilos CSS** | ${stats.classesWithCss} (${((stats.classesWithCss / stats.totalClasses) * 100).toFixed(1)}%) |
| **Clases sin estilos CSS** | ${stats.classesWithoutCss} |
| **Clases con aliases (:where)** | ${stats.classesWithAliases} |

---

## 🔝 Top 10 Clases Más Usadas

| Clase | Ocurrencias | Archivos | Propuesta Migración | CSS |
|-------|-------------|----------|---------------------|-----|
`;

  for (const item of stats.topClasses) {
    const data = classData.get(item.className);
    const hasCss = data.cssOccurrences.length > 0 ? '✅' : '❌';
    report += `| \`.${item.className}\` | ${item.count} | ${item.files} | \`.${data.proposed}\` | ${hasCss} |\n`;
  }

  report += `\n---

## 📋 Todas las Clases (Alfabético)

| Clase | Ocurrencias | Archivos | Propuesta | CSS Directo | CSS Alias |
|-------|-------------|----------|-----------|-------------|-----------|
`;

  const sortedClasses = Array.from(classData.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  for (const [className, data] of sortedClasses) {
    const directCss = data.cssOccurrences.filter(
      o => o.type === 'direct'
    ).length;
    const aliasCss = data.cssOccurrences.filter(o => o.type === 'alias').length;

    report += `| \`.${className}\` | ${data.count} | ${data.files.length} | \`.${data.proposed}\` | ${directCss > 0 ? '✅' : '❌'} | ${aliasCss > 0 ? '✅' : '❌'} |\n`;
  }

  if (stats.orphanClasses.length > 0) {
    report += `\n---

## ⚠️ Clases Sin Estilos CSS (${stats.orphanClasses.length})

Estas clases se usan en HTML pero no tienen estilos definidos:

`;
    for (const className of stats.orphanClasses) {
      const data = classData.get(className);
      report += `- \`.${className}\` (${data.count} ocurrencias en ${data.files.length} archivo(s))\n`;
      if (CONFIG.verbose) {
        report += `  - Archivos: ${data.files.join(', ')}\n`;
      }
    }
  }

  report += `\n---

## 🗺️ Mapa de Migración Propuesto

Reemplazos sugeridos para migración:

\`\`\`javascript
const CS_TO_C_MAP = {
`;

  for (const [className, data] of sortedClasses) {
    report += `  '${className}': '${data.proposed}',\n`;
  }

  report += `};
\`\`\`

---

## 📁 Archivos a Modificar

`;

  // Agrupar por archivo
  const fileMap = new Map();
  for (const [className, data] of classData.entries()) {
    for (const file of data.files) {
      if (!fileMap.has(file)) {
        fileMap.set(file, []);
      }
      fileMap.get(file).push(className);
    }
  }

  const sortedFiles = Array.from(fileMap.entries()).sort(
    (a, b) => b[1].length - a[1].length
  );

  for (const [file, classes] of sortedFiles) {
    report += `\n### \`${file}\` (${classes.length} clases)\n\n`;
    report += classes
      .map(c => `- \`.${c}\` → \`.${classData.get(c).proposed}\``)
      .join('\n');
    report += '\n';
  }

  report += `\n---

## 🚀 Recomendaciones

### Priorización de Migración

1. **Alta prioridad (componentes comunes):**
   ${stats.topClasses
     .slice(0, 5)
     .map(c => `\`${c.className}\``)
     .join(', ')}

2. **Media prioridad:** Clases con 5-10 ocurrencias

3. **Baja prioridad:** Clases con 1-4 ocurrencias

### Estrategia Sugerida

1. **Crear script de migración automatizada** (\`migrate-cs-classes.js\`)
2. **Migrar por archivos** (un archivo a la vez para control)
3. **Testing visual** después de cada archivo
4. **Actualizar aliases** en \`legacy/_id-aliases.less\`
5. **Eliminar aliases** una vez verificado todo

### Estimación de Esfuerzo

- **Total de reemplazos:** ~${stats.totalOccurrences} ocurrencias
- **Archivos a modificar:** ${stats.totalFiles} archivos
- **Tiempo estimado:** 3-4 horas (automatizado) o 1-2 días (manual)
- **Riesgo:** MEDIO - Requiere testing visual exhaustivo

---

**Generado por:** \`scripts/analyze-cs-classes.js\`  
**Fecha:** ${new Date().toISOString()}
`;

  const reportPath = path.join(PROJECT_ROOT, CONFIG.reportFile);
  await fs.writeFile(reportPath, report, 'utf-8');

  console.log(
    `${colors.green}   ✓ Reporte guardado en: ${CONFIG.reportFile}${colors.reset}`
  );

  return report;
}

/**
 * Guarda datos en JSON para uso posterior
 */
async function saveAnalysisData(classData, stats) {
  const data = {
    timestamp: new Date().toISOString(),
    stats,
    classes: Array.from(classData.entries()).map(([className, data]) => ({
      className,
      proposed: data.proposed,
      count: data.count,
      files: data.files,
      hasCss: data.cssOccurrences.length > 0,
      cssOccurrences: data.cssOccurrences,
    })),
  };

  const jsonPath = path.join(PROJECT_ROOT, CONFIG.outputFile);
  await fs.writeFile(jsonPath, JSON.stringify(data, null, 2), 'utf-8');

  console.log(
    `${colors.green}   ✓ Datos guardados en: ${CONFIG.outputFile}${colors.reset}`
  );
}

/**
 * Muestra resumen en consola
 */
function printSummary(stats) {
  console.log(
    `\n${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.cyan}  📊 RESUMEN DE ANÁLISIS${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`
  );

  console.log(
    `${colors.green}✓ Clases .cs-* únicas:${colors.reset}        ${colors.bright}${stats.totalClasses}${colors.reset}`
  );
  console.log(
    `${colors.green}✓ Total de ocurrencias:${colors.reset}       ${colors.bright}${stats.totalOccurrences}${colors.reset}`
  );
  console.log(
    `${colors.green}✓ Archivos analizados:${colors.reset}        ${colors.bright}${stats.totalFiles}${colors.reset}`
  );
  console.log(
    `${colors.yellow}⚠ Clases sin CSS:${colors.reset}             ${colors.bright}${stats.classesWithoutCss}${colors.reset}`
  );
  console.log(
    `${colors.blue}ℹ Clases con aliases:${colors.reset}         ${colors.bright}${stats.classesWithAliases}${colors.reset}`
  );

  console.log(`\n${colors.magenta}Top 5 clases más usadas:${colors.reset}`);
  stats.topClasses.slice(0, 5).forEach((item, i) => {
    console.log(
      `  ${i + 1}. ${colors.cyan}.${item.className}${colors.reset} - ${colors.bright}${item.count}${colors.reset} ocurrencias`
    );
  });

  console.log(
    `\n${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`
  );
  console.log(`${colors.green}✓ Análisis completado${colors.reset}`);
  console.log(
    `${colors.blue}📄 Ver reporte completo en: ${CONFIG.reportFile}${colors.reset}`
  );
  console.log(
    `${colors.blue}💾 Datos JSON en: ${CONFIG.outputFile}${colors.reset}\n`
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
    `${colors.bright}${colors.magenta}  🔍 ANÁLISIS DE CLASES CODESTITCH (.cs-*)${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.magenta}═══════════════════════════════════════════${colors.reset}\n`
  );

  try {
    // 1. Analizar archivos Astro
    const { classData, totalFiles } = await analyzeAstroFiles();

    // 2. Buscar estilos CSS
    await analyzeCssFiles(classData);

    // 3. Generar estadísticas
    const stats = generateStats(classData, totalFiles);

    // 4. Generar reporte
    await generateReport(classData, stats);

    // 5. Guardar datos JSON
    await saveAnalysisData(classData, stats);

    // 6. Mostrar resumen
    printSummary(stats);
  } catch (error) {
    console.error(
      `\n${colors.red}❌ Error durante el análisis:${colors.reset}`,
      error
    );
    process.exit(1);
  }
}

// Ejecutar
main();

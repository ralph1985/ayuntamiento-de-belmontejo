/**
 * Script para migrar selectores ID a clases en archivos LESS
 * Reemplaza #id por .class en todos los archivos CSS
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { glob } from 'glob';

// Mapeo de IDs a clases
const ID_TO_CLASS_MAP = {
  // Secciones de página
  '#hero': '.hero',
  '#services': '.services',
  '#sbs': '.sbs',
  '#sbs-r': '.sbs-r',
  '#gallery': '.gallery',
  '#reviews': '.reviews',
  '#featured-content': '.featured-content',
  '#social-media': '.social-media-section',

  // Componentes
  '#cs-contact': '.cs-contact',
  '#cs-form': '.cs-form',
  '#search-section': '.cs-search-section',
  '#int-hero': '.int-hero',
  '#home-h': '.home-h',
  '#google-map': '.google-map',
  '#faq-1741': '.faq-1741',
  '#cta': '.cta',
  '#noticias-1144': '.noticias-1144',
};

async function migrateFile(filePath) {
  console.log(`📝 Procesando: ${filePath}`);

  let content = readFileSync(filePath, 'utf-8');
  let changes = 0;

  // Reemplazar cada ID por su clase correspondiente
  for (const [id, className] of Object.entries(ID_TO_CLASS_MAP)) {
    // Escapar caracteres especiales para regex
    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Patrón para detectar el ID como selector (no en comentarios)
    const regex = new RegExp(
      `(?<!\\*\\s)${escapedId}(?=\\s*[\\{,:\\s]|$)`,
      'g'
    );

    const before = content;
    content = content.replace(regex, className);

    if (content !== before) {
      const count = (before.match(regex) || []).length;
      changes += count;
      console.log(`  ✓ ${id} → ${className} (${count} ocurrencias)`);
    }
  }

  if (changes > 0) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✅ ${changes} cambios guardados\n`);
    return changes;
  } else {
    console.log(`  ⏭️  Sin cambios\n`);
    return 0;
  }
}

async function main() {
  console.log('🚀 Iniciando migración de IDs a clases en archivos LESS\n');

  // Buscar todos los archivos LESS en src/styles
  const files = await glob('src/styles/**/*.less', {
    ignore: ['**/node_modules/**', '**/legacy/_id-aliases.less'],
  });

  console.log(`📂 Encontrados ${files.length} archivos LESS\n`);

  let totalChanges = 0;
  for (const file of files) {
    const changes = await migrateFile(file);
    totalChanges += changes;
  }

  console.log('═'.repeat(60));
  console.log(`✨ Migración completada:`);
  console.log(`   📁 Archivos procesados: ${files.length}`);
  console.log(`   ✏️  Total de cambios: ${totalChanges}`);
  console.log('═'.repeat(60));
}

main().catch(console.error);

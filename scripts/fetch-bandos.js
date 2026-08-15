/* eslint-disable no-console */
/* global AbortSignal */
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execFileAsync = promisify(execFile);
const exclusionsPath = path.join(__dirname, 'bandos-exclusions.json');

export async function fetchBandos() {
  const RSS_URL = 'https://www.bandomovil.com/rss.php?codigo=belmontejo';

  try {
    console.log('Fetching RSS from:', RSS_URL);
    const response = await fetch(RSS_URL, {
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();

    // Parse XML manually since we're in a Node.js environment
    const items = parseRSSItems(xmlText);
    const excludedBandoIds = getExcludedBandoIds();

    console.log(`Found ${items.length} bandos`);
    if (items.length === 0) {
      throw new Error('The RSS feed did not contain any bando items');
    }

    // Create content directory if it doesn't exist
    const contentDir = path.join(__dirname, '..', 'src', 'content', 'bandos');
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }

    const result = {
      created: 0,
      updated: 0,
      unchanged: 0,
      excluded: 0,
    };

    // Generate markdown files for each bando
    for (const item of items) {
      if (excludedBandoIds.has(getBandoId(item.guid))) {
        result.excluded += 1;
        continue;
      }

      const filename = generateFilename(item.title, item.guid);
      const filePath = path.join(contentDir, `${filename}.md`);
      const markdownContent = createBandoMarkdown(item);
      const previousContent = fs.existsSync(filePath)
        ? fs.readFileSync(filePath, 'utf8')
        : undefined;

      if (previousContent === markdownContent) {
        result.unchanged += 1;
        continue;
      }

      fs.writeFileSync(filePath, markdownContent, 'utf8');
      result[previousContent === undefined ? 'created' : 'updated'] += 1;
      console.log(
        `${previousContent === undefined ? 'Created' : 'Updated'}: ${filename}.md`
      );
    }

    if (result.created > 0 || result.updated > 0) {
      await runFormatter(contentDir);
    }

    console.log(
      `RSS import completed successfully: ${result.created} created, ${result.updated} updated, ${result.unchanged} unchanged, ${result.excluded} excluded.`
    );
    return result;
  } catch (error) {
    console.error('Error fetching bandos:', error);
    process.exit(1);
  }
}

export function getBandoId(guid) {
  return guid.match(/id=(\d+)/)?.[1] ?? '';
}

export function getExcludedBandoIds() {
  if (!fs.existsSync(exclusionsPath)) {
    return new Set();
  }

  const exclusions = JSON.parse(fs.readFileSync(exclusionsPath, 'utf8'));
  return new Set(exclusions.ids ?? []);
}

export function createBandoMarkdown(item) {
  const frontmatter = generateFrontmatter(item);
  const content = generateContent(item);

  return `---\n${frontmatter}\n---\n\n${content}\n`;
}

export function parseRSSItems(xmlText) {
  const items = [];

  // Extract items using regex (simple XML parsing)
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemXML = match[1];

    const item = {
      title: extractXMLContent(itemXML, 'title'),
      link: extractXMLContent(itemXML, 'link'),
      description: extractXMLContent(itemXML, 'description'),
      category: extractXMLContent(itemXML, 'category') || 'Info General',
      pubDate: extractXMLContent(itemXML, 'pubDate'),
      guid: extractXMLContent(itemXML, 'guid'),
    };

    items.push(item);
  }

  return items;
}

export function extractXMLContent(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = xml.match(regex);

  if (!match) return '';

  let content = match[1].trim();

  // Handle CDATA sections
  if (content.startsWith('<![CDATA[') && content.endsWith(']]>')) {
    content = content.slice(9, -3);
  }

  return content;
}

export function generateFilename(title, guid) {
  // Extract ID from guid if possible
  const guidMatch = guid.match(/id=(\d+)/);
  const id = guidMatch ? guidMatch[1] : '';

  // Create a slug from title
  let slug = title
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '') // Remove accents
    .replaceAll(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replaceAll(/\s+/g, '-') // Replace spaces with hyphens
    .replaceAll(/-+/g, '-') // Replace multiple hyphens with single
    .replaceAll(/(?:^-|-$)/g, ''); // Remove leading/trailing hyphens

  // Limit slug length
  if (slug.length > 50) {
    slug = slug.substring(0, 50).replace(/-[^-]*$/, '');
  }

  return id ? `${id}-${slug}` : slug;
}

export function generateFrontmatter(item) {
  const date = new Date(item.pubDate);
  const isoDate = date.toISOString();

  // Clean description for frontmatter
  let description = cleanHTML(item.description);
  if (description.length > 160) {
    description = description.substring(0, 157) + '...';
  }

  // Mark some bandos as featured based on keywords or recent date
  const featuredKeywords = ['Belmontejo', 'importante', 'urgente', 'aviso'];
  const isRecent = Date.now() - date.getTime() < 30 * 24 * 60 * 60 * 1000; // Last 30 days
  const hasKeyword = featuredKeywords.some(
    keyword =>
      item.title.toLowerCase().includes(keyword) ||
      description.toLowerCase().includes(keyword)
  );
  const isFeatured = isRecent || hasKeyword;

  return `title: '${escapeYaml(item.title)}'
description: '${escapeYaml(description)}'
author: 'Ayuntamiento de Belmontejo'
date: ${isoDate}
category: '${escapeYaml(item.category)}'
guid: '${escapeYaml(item.guid)}'
link: '${escapeYaml(item.link)}'
isFeatured: ${isFeatured}`;
}

export function generateContent(item) {
  // Convert HTML description to markdown-friendly format
  let content = item.description;

  // Basic HTML to markdown conversion
  content = content
    .replaceAll(/<br\s*\/?>/gi, '\n')
    .replaceAll(/<\/p>/gi, '\n\n')
    .replaceAll(/<p[^>]*>/gi, '')
    .replaceAll(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replaceAll(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replaceAll(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replaceAll(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replaceAll(/<u[^>]*>(.*?)<\/u>/gi, '*$1*') // Use * for underlined text
    .replaceAll(/<span[^>]*>(.*?)<\/span>/gi, '$1')
    .replaceAll(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
    .replaceAll(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
    .replaceAll(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
    .replaceAll(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n')
    .replaceAll(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n')
    .replaceAll(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n');

  // Handle images
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  content = content.replaceAll(imgRegex, (match, src) => {
    const altMatch = match.match(/alt=["']([^"']*)["']/i);
    const alt = altMatch ? altMatch[1] : 'Imagen';
    return `![${alt}](${src})`;
  });

  // Remove remaining HTML tags
  content = stripHtmlTags(content);

  // Decode HTML entities (e.g. &nbsp;)
  content = decodeHtmlEntities(content);

  // Clean up whitespace more carefully
  content = content
    .replaceAll(/\n\s*\n\s*\n/g, '\n\n') // Remove multiple blank lines
    .replaceAll(/\n[ \t]+/g, '\n') // Remove lines with only spaces/tabs
    .replaceAll(/[ \t]+$/gm, '') // Remove trailing spaces on lines without backtracking risk
    .replaceAll(/[ \t]+/g, ' ') // Replace multiple spaces with single space
    .trim();

  // Split into paragraphs and clean each one
  const paragraphs = content.split('\n\n');
  const cleanParagraphs = paragraphs
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0) // Remove empty paragraphs
    .filter(paragraph => !/^[ \t]*$/.test(paragraph)); // Remove whitespace-only paragraphs

  return cleanParagraphs.join('\n\n');
}

export function decodeHtmlEntities(text) {
  if (!text) return '';

  const named = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
  };

  let result = text;
  let previous;

  do {
    previous = result;
    result = result.replaceAll(
      /&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,
      (match, entity) => {
        if (entity[0] === '#') {
          const isHex = entity[1]?.toLowerCase() === 'x';
          const codePoint = Number.parseInt(
            isHex ? entity.slice(2) : entity.slice(1),
            isHex ? 16 : 10
          );
          if (!Number.isNaN(codePoint)) {
            return String.fromCodePoint(codePoint);
          }
          return match;
        }

        const replacement = named[entity.toLowerCase()];
        return typeof replacement === 'string' ? replacement : match;
      }
    );
  } while (result !== previous);

  return result.replaceAll('\u00a0', ' ');
}

export function cleanHTML(html) {
  if (!html) return '';

  const withoutTags = stripHtmlTags(html, ' ');

  return decodeHtmlEntities(withoutTags).replaceAll(/\s+/g, ' ').trim();
}

export function stripHtmlTags(value, replacement = '') {
  if (!value) return '';

  let result = '';
  let insideTag = false;

  for (const element of value) {
    const char = element;

    if (char === '<') {
      insideTag = true;
      if (
        replacement &&
        (result.length === 0 || result[result.length - 1] !== replacement)
      ) {
        result += replacement;
      }
      continue;
    }

    if (char === '>') {
      insideTag = false;
      continue;
    }

    if (!insideTag) {
      result += char;
    }
  }

  return result;
}

export async function runFormatter(contentDir) {
  const projectRoot = path.join(__dirname, '..');

  console.log('Running formatter for generated bandos...');

  try {
    const { stdout, stderr } = await execFileAsync(
      'pnpm',
      ['exec', 'prettier', '--write', path.relative(projectRoot, contentDir)],
      {
        cwd: projectRoot,
      }
    );

    if (stdout) console.log(stdout.trim());
    if (stderr) console.error(stderr.trim());
  } catch (error) {
    const details = error?.stderr || error;
    console.error('Formatter command failed:', details);
    throw error;
  }
}

export function escapeYaml(str) {
  if (!str) return '';
  return str
    .replaceAll('\\', '\\\\')
    .replaceAll("'", "''") // Escape single quotes for YAML
    .replaceAll('\n', String.raw`\n`)
    .replaceAll('\r', String.raw`\r`)
    .replaceAll('\t', String.raw`\t`);
}

const isCliInvocation =
  process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isCliInvocation) {
  await fetchBandos();
}

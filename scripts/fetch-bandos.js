import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchBandos() {
  const RSS_URL = 'https://www.bandomovil.com/rss.php?codigo=belmontejo';

  try {
    console.log('Fetching RSS from:', RSS_URL);
    const response = await fetch(RSS_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();

    // Parse XML manually since we're in a Node.js environment
    const items = parseRSSItems(xmlText);

    console.log(`Found ${items.length} bandos`);

    // Create content directory if it doesn't exist
    const contentDir = path.join(__dirname, '..', 'src', 'content', 'bandos');
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }

    // Generate markdown files for each bando
    for (const item of items) {
      const filename = generateFilename(item.title, item.guid);
      const filePath = path.join(contentDir, `${filename}.md`);

      const frontmatter = generateFrontmatter(item);
      const content = generateContent(item);

      const markdownContent = `---\n${frontmatter}\n---\n\n${content}`;

      fs.writeFileSync(filePath, markdownContent, 'utf8');
      console.log(`Created: ${filename}.md`);
    }

    console.log('RSS import completed successfully!');
  } catch (error) {
    console.error('Error fetching bandos:', error);
    process.exit(1);
  }
}

function parseRSSItems(xmlText) {
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

function extractXMLContent(xml, tag) {
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

function generateFilename(title, guid) {
  // Extract ID from guid if possible
  const guidMatch = guid.match(/id=(\d+)/);
  const id = guidMatch ? guidMatch[1] : '';

  // Create a slug from title
  let slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  // Limit slug length
  if (slug.length > 50) {
    slug = slug.substring(0, 50).replace(/-[^-]*$/, '');
  }

  return id ? `${id}-${slug}` : slug;
}

function generateFrontmatter(item) {
  const date = new Date(item.pubDate);
  const isoDate = date.toISOString();

  // Clean description for frontmatter
  let description = cleanHTML(item.description);
  if (description.length > 160) {
    description = description.substring(0, 157) + '...';
  }

  // Mark some bandos as featured based on keywords or recent date
  // TODO: definir criterios para destacados
  const featuredKeywords = [];
  const isRecent = Date.now() - date.getTime() < 30 * 24 * 60 * 60 * 1000; // Last 30 days
  const hasKeyword = featuredKeywords.some(
    keyword =>
      item.title.toLowerCase().includes(keyword) ||
      description.toLowerCase().includes(keyword)
  );
  const isFeatured = isRecent || hasKeyword;

  return `title: "${escapeYaml(item.title)}"
description: "${escapeYaml(description)}"
author: "Ayuntamiento de Belmontejo"
date: ${isoDate}
category: "${escapeYaml(item.category)}"
guid: "${escapeYaml(item.guid)}"
link: "${escapeYaml(item.link)}"
isFeatured: ${isFeatured}`;
}

function generateContent(item) {
  // Convert HTML description to markdown-friendly format
  let content = item.description;

  // Basic HTML to markdown conversion
  content = content
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<u[^>]*>(.*?)<\/u>/gi, '$1')
    .replace(/<span[^>]*>(.*?)<\/span>/gi, '$1')
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n');

  // Handle images
  const imgRegex = /<img[^>]+src=["\']([^"\']+)["\'][^>]*>/gi;
  content = content.replace(imgRegex, (match, src) => {
    const altMatch = match.match(/alt=["\']([^"\']*)["\']'/gi);
    const alt = altMatch ? altMatch[1] : 'Imagen';
    return `![${alt}](${src})`;
  });

  // Remove remaining HTML tags
  content = content.replace(/<[^>]+>/g, '');

  // Clean up extra whitespace
  content = content
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    .trim();

  return content;
}

function cleanHTML(html) {
  return html
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeYaml(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

// Run the script
fetchBandos();

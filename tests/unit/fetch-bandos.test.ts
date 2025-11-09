import {
  cleanHTML,
  decodeHtmlEntities,
  escapeYaml,
  generateContent,
  generateFilename,
  generateFrontmatter,
  parseRSSItems,
} from '../../scripts/fetch-bandos.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('parseRSSItems', () => {
  it('extracts RSS items and normalizes missing fields', () => {
    const xml = `
      <rss>
        <channel>
          <item>
            <title><![CDATA[Aviso Importante]]></title>
            <link>https://example.com/important</link>
            <description><![CDATA[<p>Contenido <strong>destacado</strong></p>]]></description>
            <category>Urgencia</category>
            <pubDate>Tue, 01 Oct 2024 10:00:00 GMT</pubDate>
            <guid>https://example.com/notice?id=123</guid>
          </item>
          <item>
            <title>Comunicado general</title>
            <link>https://example.com/general</link>
            <description>Mensaje sin categoría</description>
            <pubDate>Wed, 02 Oct 2024 12:00:00 GMT</pubDate>
            <guid>https://example.com/notice?id=456</guid>
          </item>
        </channel>
      </rss>
    `;

    const items = parseRSSItems(xml);

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      title: 'Aviso Importante',
      link: 'https://example.com/important',
      description: '<p>Contenido <strong>destacado</strong></p>',
      category: 'Urgencia',
      guid: 'https://example.com/notice?id=123',
    });
    expect(items[1].category).toBe('Info General');
  });
});

describe('generateFilename', () => {
  it('builds slug from title and guid id while stripping accents', () => {
    const filename = generateFilename(
      'Fiesta de Año Nuevo 2025!!!',
      'https://example.com/bando?id=456'
    );

    expect(filename).toBe('456-fiesta-de-ano-nuevo-2025');
  });

  it('trims very long titles to a safe slug length', () => {
    const title =
      'Evento municipal extraordinariamente largo con muchos detalles y descripciones';
    const filename = generateFilename(title, 'https://example.com/?id=789');

    expect(filename.length).toBeLessThanOrEqual(54); // id + hyphen + 50 chars
    expect(filename.startsWith('789-')).toBe(true);
  });
});

describe('generateContent', () => {
  it('converts HTML description into markdown friendly content', () => {
    const html =
      '<p>Hola&nbsp;Belmontejo</p><p><strong>Aviso</strong></p><img src="image.jpg" alt="Foto" />';

    const markdown = generateContent({
      description: html,
    });

    expect(markdown).toBe('Hola Belmontejo\n\n**Aviso**\n\n![Foto](image.jpg)');
  });
});

describe('generateFrontmatter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-10-10T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('builds YAML frontmatter with escaped fields and featured flag', () => {
    const frontmatter = generateFrontmatter({
      title: "Bando d'el año",
      description: "<p>Resumen con <em>detalles</em>' especiales</p>",
      category: 'Anuncios',
      pubDate: 'Tue, 01 Oct 2024 10:00:00 GMT',
      guid: 'https://example.com/?id=321',
      link: 'https://example.com/bando/321',
    });

    expect(frontmatter).toContain("title: 'Bando d''el año'");
    expect(frontmatter).toContain(
      "description: 'Resumen con detalles '' especiales'"
    );
    expect(frontmatter).toContain("category: 'Anuncios'");
    expect(frontmatter).toContain("guid: 'https://example.com/?id=321'");
    expect(frontmatter).toContain('isFeatured: true');
  });
});

describe('decodeHtmlEntities', () => {
  it('decodes named and numeric HTML entities', () => {
    const decoded = decodeHtmlEntities(
      'Precio&nbsp;:&nbsp;&#x20AC;100 &amp; más'
    );

    expect(decoded).toBe('Precio : €100 & más');
  });
});

describe('cleanHTML', () => {
  it('strips HTML tags and collapses whitespace', () => {
    const text = cleanHTML(
      '<p>Hola&nbsp; <strong>mundo</strong></p>\n\n<p>  </p>'
    );

    expect(text).toBe('Hola mundo');
  });
});

describe('escapeYaml', () => {
  it('escapes special characters for YAML compatibility', () => {
    const escaped = escapeYaml("Texto con 'comillas' \\ y saltos\nnuevos");

    expect(escaped).toBe(
      String.raw`Texto con ''comillas'' \\ y saltos\nnuevos`
    );
  });
});

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  getInstagramConfig,
  downloadInstagramImage,
  normalizeInstagramMedia,
  normalizeInstagramCaption,
  parseInstagramPublishedAt,
  syncInstagram,
} from '../../scripts/fetch-instagram.js';
import {
  buildInstagramCodexPrompt,
  parseInstagramClassification,
} from '../../scripts/codex-instagram-classifier.js';
import {
  buildNotificationHtml,
  buildNotificationText,
  escapeHtml,
} from '../../scripts/notify-instagram-sync.js';
import { describe, expect, it } from 'vitest';

describe('Instagram API helpers', () => {
  it('uses the public profile and bounded scrape settings by default', () => {
    expect(getInstagramConfig({})).toEqual({
      profileUrl: 'https://www.instagram.com/aytobelmontejo/',
      maxPosts: 24,
      navigationTimeoutMs: 45_000,
    });
  });

  it('normalizes and validates Instagram permalinks', () => {
    expect(
      normalizeInstagramMedia({
        id: '123',
        permalink: 'https://www.instagram.com/p/abc/?utm_source=embed',
        caption: 'Aviso municipal',
        media_type: 'IMAGE',
        timestamp: '2026-08-24T10:00:00+0000',
      })
    ).toMatchObject({
      id: '123',
      permalink: 'https://www.instagram.com/p/abc/',
      caption: 'Aviso municipal',
      mediaType: 'IMAGE',
    });

    expect(
      normalizeInstagramMedia({
        id: '456',
        permalink: 'https://www.instagram.com/p/def/',
        caption: 'Publicación con imagen',
        image_url: 'https://scontent.example/image.jpg',
        media_type: 'IMAGE',
      })
    ).toMatchObject({ imageUrl: 'https://scontent.example/image.jpg' });

    expect(
      normalizeInstagramMedia({
        id: '789',
        permalink: 'https://www.instagram.com/p/ghi/',
        caption: 'Publicación sin imagen',
        image_url: 'http://scontent.example/image.jpg',
        media_type: 'IMAGE',
      })
    ).toMatchObject({ imageUrl: null });

    expect(() =>
      normalizeInstagramMedia({
        id: '123',
        permalink: 'https://example.com/post/123',
      })
    ).toThrow('Permalink de Instagram no válido');
  });

  it('extracts the publication date from Instagram captions when metadata is absent', () => {
    expect(
      parseInstagramPublishedAt(
        '56 likes - aytobelmontejo el August 24, 2026: "Texto".'
      )
    ).toBe('2026-08-24T00:00:00.000Z');
    expect(parseInstagramPublishedAt('Caption sin fecha')).toBeNull();
  });

  it('removes dynamic Instagram engagement metadata from captions', () => {
    expect(
      normalizeInstagramCaption(
        '56 likes, 2 comments - aytobelmontejo el August 24, 2026: "Aviso municipal".'
      )
    ).toBe('"Aviso municipal".');
  });

  it('downloads allowed Instagram images as local webp assets', async () => {
    const destinationDir = '/tmp/belmontejo-instagram-test-assets';
    const image = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64'
    );
    const imagePath = await downloadInstagramImage(
      'https://scontent-mad1-1.cdninstagram.com/image.jpg',
      {
        id: 'test-image',
        destinationDir,
        fetchImpl: async () => ({
          ok: true,
          headers: { get: () => 'image/png' },
          arrayBuffer: async () => image,
        }),
      }
    );

    expect(imagePath).toBe('/assets/images/instagram/test-image.webp');
    expect(
      await import('node:fs/promises').then(fs =>
        fs.stat(`${destinationDir}/test-image.webp`)
      )
    ).toBeTruthy();
  });
});

describe('Instagram synchronization', () => {
  it('does not update or notify for changed engagement counters alone', async () => {
    const temporaryDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'belmontejo-instagram-sync-')
    );
    const filePath = path.join(temporaryDir, 'instagramPosts.json');
    const reportPath = path.join(temporaryDir, 'report.json');
    const previousCaption =
      '56 likes, 2 comments - aytobelmontejo el August 24, 2026: "Aviso municipal".';
    fs.writeFileSync(
      filePath,
      `${JSON.stringify([
        {
          id: '123',
          permalink: 'https://www.instagram.com/p/abc/',
          caption: previousCaption,
          publishedAt: '2026-08-24T00:00:00.000Z',
          mediaType: 'IMAGE',
          imageUrl: null,
          title: 'Aviso municipal',
          summary: 'Información municipal.',
          category: 'servicios',
          isRelevant: true,
          isPublished: true,
          featureOnHome: false,
          analysisSource: 'codex',
          analysisReason: 'Información municipal.',
        },
      ])}\n`,
      'utf8'
    );

    try {
      const report = await syncInstagram({
        filePath,
        reportPath,
        fetchMedia: async () => [
          normalizeInstagramMedia({
            id: '123',
            permalink: 'https://www.instagram.com/p/abc/',
            caption:
              '59 likes, 2 comments - aytobelmontejo el August 24, 2026: "Aviso municipal".',
            timestamp: '2026-08-24T00:00:00.000Z',
            media_type: 'IMAGE',
            image_url: null,
          }),
        ],
        classify: async () => {
          throw new Error(
            'No debería reclasificar una publicación sin cambios'
          );
        },
      });

      expect(report).toMatchObject({ created: 0, updated: 0, changed: false });
      expect(JSON.parse(fs.readFileSync(filePath, 'utf8'))[0].caption).toBe(
        previousCaption
      );
    } finally {
      fs.rmSync(temporaryDir, { recursive: true, force: true });
    }
  });
});

describe('Instagram Codex classifier', () => {
  const item = {
    id: '123',
    permalink: 'https://www.instagram.com/p/abc/',
    caption: 'Consulta el horario del Ayuntamiento.',
    publishedAt: '2026-08-24T10:00:00+0000',
    mediaType: 'IMAGE',
  };

  it('requests one strict decision per media id', () => {
    const prompt = buildInstagramCodexPrompt([item]);
    expect(prompt).toContain('mediaId');
    expect(prompt).toContain('JSON válido');
    expect(prompt).toContain('Consulta el horario');
    expect(prompt).toContain('trabajos realizados para el municipio');
  });

  it('accepts valid JSON and rejects incomplete coverage', () => {
    const output = JSON.stringify({
      decisions: [
        {
          mediaId: '123',
          title: 'Horario del Ayuntamiento',
          summary: 'Consulta el horario municipal.',
          category: 'servicios',
          isRelevant: true,
          featureOnHome: true,
          reason: 'Información práctica municipal.',
        },
      ],
    });

    expect(
      parseInstagramClassification(output, [item]).get('123')
    ).toMatchObject({
      title: 'Horario del Ayuntamiento',
      isRelevant: true,
      featureOnHome: true,
    });
    expect(() =>
      parseInstagramClassification('{"decisions":[]}', [item])
    ).toThrow('no clasificó todas');
  });
});

describe('Instagram notification', () => {
  const report = {
    created: 1,
    updated: 0,
    classificationFallback: 0,
    posts: [
      {
        title: 'Actividad municipal',
        summary: 'Información de la actividad.',
        permalink: 'https://www.instagram.com/p/abc/',
        isPublished: true,
      },
    ],
  };

  it('builds text and escaped HTML with direct links', () => {
    expect(
      buildNotificationText({
        commit: 'abc123',
        report,
        siteUrl: 'https://example.com',
      })
    ).toContain('Actividad municipal');
    expect(
      buildNotificationHtml({
        commit: 'abc123',
        report,
        siteUrl: 'https://example.com',
      })
    ).toContain('href="https://www.instagram.com/p/abc/"');
    expect(escapeHtml('A & B < C')).toBe('A &amp; B &lt; C');
  });
});

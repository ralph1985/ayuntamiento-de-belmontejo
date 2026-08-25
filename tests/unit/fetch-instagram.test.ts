import {
  getInstagramConfig,
  normalizeInstagramMedia,
  parseInstagramPublishedAt,
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

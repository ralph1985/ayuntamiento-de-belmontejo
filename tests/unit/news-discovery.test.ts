import { describe, expect, it } from 'vitest';
import {
  buildDiscoveryPrompt,
  decideFeatured,
  isAllowedDomain,
  minimumNewsDate,
  normalizeTitle,
  normalizeUrl,
  parseCodexOutput,
  validateCandidates,
} from '../../scripts/news-discovery.js';
import {
  buildNewsFailureNotificationHtml,
  buildNewsFailureNotificationText,
} from '../../scripts/notify-news-discovery.js';
import {
  formatWorkerError,
  isWorkerBranch,
  shouldRecoverStaleWorkerBranch,
} from '../../scripts/run-news-discovery.js';
import { isCurrentlyFeatured } from '../../src/data/featuredContent';

const allowedDomains = ['vocesdecuenca.com', 'eldigitaldecuenca.com'];

const candidate = {
  title: 'Una actividad nueva en Belmontejo',
  description: 'Una noticia comprobada sobre Belmontejo.',
  bodyMarkdown:
    'La actividad reunió a vecinos de Belmontejo.\n\nLa fuente aporta los detalles.',
  sourceName: 'Voces de Cuenca',
  sourceUrl: 'https://www.vocesdecuenca.com/provincia/actividad-belmontejo/',
  date: '2026-08-20',
  confidence: 'high',
};

describe('news discovery helpers', () => {
  it('recognizes recoverable worker branches without touching unrelated branches', () => {
    expect(isWorkerBranch('automation/news-discovery-2026-09-24')).toBe(true);
    expect(isWorkerBranch('automation/news-discovery-not-a-date')).toBe(false);
    expect(isWorkerBranch('fix/news-worker-cleanup')).toBe(false);
    expect(
      shouldRecoverStaleWorkerBranch('automation/news-discovery-2026-09-24', '')
    ).toBe(true);
    expect(
      shouldRecoverStaleWorkerBranch(
        'automation/news-discovery-2026-09-24',
        ' M src/content/noticias/pendiente.md'
      )
    ).toBe(false);
    expect(shouldRecoverStaleWorkerBranch('main', '')).toBe(false);
  });

  it('keeps the tail of long worker errors for actionable diagnostics', () => {
    const error = `Codex banner ${'x'.repeat(600)}\nreal failure: network timeout`;

    const formatted = formatWorkerError(new Error(error));

    expect(formatted.length).toBeLessThanOrEqual(500);
    expect(formatted).toContain('Codex banner');
    expect(formatted).toContain('real failure: network timeout');
  });

  it('normalizes URLs and titles for deduplication', () => {
    expect(
      normalizeUrl('https://www.vocesdecuenca.com/noticia/?utm_source=x#photo')
    ).toBe('https://www.vocesdecuenca.com/noticia');
    expect(normalizeTitle('Árboles y tradición')).toBe('arboles y tradicion');
  });

  it('allows configured media domains but rejects unrelated sites', () => {
    expect(
      isAllowedDomain('https://www.vocesdecuenca.com/noticia', allowedDomains)
    ).toBe(true);
    expect(isAllowedDomain('https://example.com/noticia', allowedDomains)).toBe(
      false
    );
  });

  it('parses JSON wrapped in a Codex code fence', () => {
    expect(parseCodexOutput('```json\n{"candidates":[]}\n```')).toEqual({
      candidates: [],
    });
  });

  it('accepts a valid candidate and preserves a low-confidence review flag', () => {
    const result = validateCandidates(
      {
        candidates: [
          {
            ...candidate,
            confidence: 'low',
            reviewReason: 'Comprobar la cifra.',
          },
        ],
      },
      { allowedDomains }
    );
    expect(result.rejected).toHaveLength(0);
    expect(result.candidates[0]).toMatchObject({
      title: candidate.title,
      confidence: 'low',
      reviewReason: 'Comprobar la cifra.',
    });
  });

  it('accepts news published on or after the minimum date', () => {
    const result = validateCandidates(
      {
        candidates: [
          {
            ...candidate,
            date: minimumNewsDate,
          },
          {
            ...candidate,
            title: 'Noticia posterior nueva',
            sourceUrl:
              'https://www.vocesdecuenca.com/provincia/noticia-posterior/',
            date: '2026-02-01',
          },
        ],
      },
      { allowedDomains }
    );

    expect(result.rejected).toHaveLength(0);
    expect(result.candidates).toHaveLength(2);
  });

  it('rejects news published before the minimum date', () => {
    const result = validateCandidates(
      {
        candidates: [
          {
            ...candidate,
            date: '2025-12-31',
          },
        ],
      },
      { allowedDomains }
    );

    expect(result.candidates).toHaveLength(0);
    expect(result.rejected).toMatchObject([
      {
        reason: `date debe ser igual o posterior a ${minimumNewsDate}.`,
      },
    ]);
  });

  it('only auto-features recent, direct, high-confidence recommendations', () => {
    expect(
      decideFeatured(
        {
          date: '2026-08-01T00:00:00.000Z',
          featureRecommendation: true,
          featureConfidence: 'high',
          localRelevance: 'direct',
          featureReason: 'Hecho local relevante.',
        },
        new Date('2026-08-22T00:00:00.000Z')
      )
    ).toMatchObject({ featured: true, featuredUntil: '2026-10-30' });

    expect(
      decideFeatured(
        {
          date: '2026-07-01T00:00:00.000Z',
          featureRecommendation: true,
          featureConfidence: 'high',
          localRelevance: 'direct',
        },
        new Date('2026-08-22T00:00:00.000Z')
      )
    ).toMatchObject({
      featured: false,
      reason: 'La noticia tiene más de 30 días.',
    });
  });

  it('expires legacy featured content without requiring a cleanup commit', () => {
    expect(
      isCurrentlyFeatured(
        {
          data: {
            date: new Date('2025-08-15T00:00:00.000Z'),
            isFeatured: true,
          },
        },
        new Date('2026-08-22T00:00:00.000Z')
      )
    ).toBe(false);
  });

  it('rejects bandos or sources outside the configured media set', () => {
    const result = validateCandidates(
      {
        candidates: [
          {
            ...candidate,
            sourceUrl: 'https://www.bandomovil.com/belmontejo/123',
          },
          {
            ...candidate,
            title: 'Otra noticia',
            sourceUrl: 'https://example.com/otra',
          },
        ],
      },
      { allowedDomains }
    );
    expect(result.candidates).toHaveLength(0);
    expect(result.rejected).toHaveLength(2);
  });

  it('rejects raw HTML and dangerous URL schemes in generated Markdown', () => {
    const result = validateCandidates(
      {
        candidates: [
          {
            ...candidate,
            bodyMarkdown: '<img src=x onerror=alert(1)>',
          },
          {
            ...candidate,
            title: 'Otra noticia peligrosa',
            sourceUrl: 'https://www.vocesdecuenca.com/provincia/otra',
            bodyMarkdown: '[enlace](javascript:alert(1))',
          },
        ],
      },
      { allowedDomains }
    );

    expect(result.candidates).toHaveLength(0);
    expect(result.rejected).toHaveLength(2);
  });

  it('rejects an existing source URL or title', () => {
    const result = validateCandidates(
      { candidates: [candidate, { ...candidate, title: 'Otra noticia' }] },
      {
        allowedDomains,
        existingNews: [
          { title: candidate.title, sourceUrl: candidate.sourceUrl },
        ],
      }
    );
    expect(result.candidates).toHaveLength(0);
    expect(
      result.rejected.every(item => item.reason.includes('ya existe'))
    ).toBe(true);
  });

  it('includes the existing titles and source policy in the prompt', async () => {
    const prompt = await buildDiscoveryPrompt(
      [{ title: 'Noticia previa', sourceUrl: candidate.sourceUrl }],
      allowedDomains
    );
    expect(prompt).toContain('Noticia previa');
    expect(prompt).toContain('vocesdecuenca.com');
    expect(prompt).toContain('Excluye bandos');
    expect(prompt).toContain(
      `publicadas desde el ${minimumNewsDate}, inclusive`
    );
  });

  it('builds a failure notification without exposing operational secrets', () => {
    const payload = {
      runId: '2026-09-19T13:00:00.000Z-1234',
      phase: 'discovery',
      error: 'Codex terminó con código 1.',
      durationMs: 4200,
    };

    expect(buildNewsFailureNotificationText(payload)).toContain(
      'Fase: discovery'
    );
    expect(buildNewsFailureNotificationHtml(payload)).toContain(
      'Fallo en el worker de noticias'
    );
    expect(buildNewsFailureNotificationText(payload)).not.toContain('PASSWORD');
    expect(
      buildNewsFailureNotificationText({
        ...payload,
        prUrl:
          'https://github.com/ralph1985/ayuntamiento-de-belmontejo/pull/123',
      })
    ).toContain('La PR ya creada debe revisarse manualmente');
  });
});

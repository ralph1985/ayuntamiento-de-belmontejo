import { describe, expect, it } from 'vitest';
import {
  buildBandosBranchName,
  findOpenBandosPullRequest,
  hasReportedChecks,
  isAllowedBandoPath,
  evaluateRequiredChecks,
} from '../../scripts/bandos-sync-policy.js';

describe('bandos sync publication policy', () => {
  it('builds a unique task branch name from the current UTC timestamp', () => {
    expect(buildBandosBranchName(new Date('2026-10-09T11:00:17.000Z'))).toBe(
      'chore/bandos-sync-20261009-110017'
    );
  });

  it('detects an existing open bandos pull request and avoids duplicates', () => {
    const pullRequest = findOpenBandosPullRequest([
      {
        number: 151,
        title: 'feat(news): revisar nuevas noticias de Belmontejo',
        headRefName: 'automation/news-discovery-2026-10-09',
        url: 'https://github.com/example/pull/150',
        state: 'OPEN',
      },
      {
        number: 152,
        title: 'chore: actualizar bandos',
        headRefName: 'chore/bandos-sync-20261009-110017',
        url: 'https://github.com/example/pull/152',
        state: 'OPEN',
      },
    ]);

    expect(pullRequest).toEqual({
      number: 152,
      title: 'chore: actualizar bandos',
      headRefName: 'chore/bandos-sync-20261009-110017',
      url: 'https://github.com/example/pull/152',
      state: 'OPEN',
    });
  });

  it('accepts only generated bando content paths', () => {
    expect(
      isAllowedBandoPath('src/content/bandos/1658067-suministro-de-agua.md')
    ).toBe(true);
    expect(isAllowedBandoPath('src/content/noticias/otra-noticia.md')).toBe(
      false
    );
    expect(isAllowedBandoPath('src/content/bandos/../../.env')).toBe(false);
  });

  it('distinguishes the PR race before checks are reported', () => {
    expect(hasReportedChecks([])).toBe(false);
    expect(hasReportedChecks([{ name: 'quality', state: 'IN_PROGRESS' }])).toBe(
      true
    );
  });

  it('evaluates required checks for the current PR head only', () => {
    expect(
      evaluateRequiredChecks(
        ['quality'],
        [{ name: 'quality', status: 'COMPLETED', conclusion: 'SUCCESS' }]
      )
    ).toEqual({ missing: [], pending: [], failed: [] });
    expect(
      evaluateRequiredChecks(
        ['quality'],
        [{ name: 'quality', status: 'IN_PROGRESS', conclusion: '' }]
      )
    ).toEqual({ missing: [], pending: ['quality'], failed: [] });
    expect(
      evaluateRequiredChecks(
        ['quality'],
        [{ name: 'quality', status: 'completed', conclusion: 'success' }]
      )
    ).toEqual({ missing: [], pending: [], failed: [] });
    expect(evaluateRequiredChecks(['quality'], [])).toEqual({
      missing: ['quality'],
      pending: [],
      failed: [],
    });
  });
});

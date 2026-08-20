import { describe, expect, it } from 'vitest';
import {
  escapeRegExp,
  getSearchTerms,
  matchesSearchQuery,
  normalizeSearch,
} from '../../src/components/ui/search.helpers';

describe('search helpers', () => {
  it('normalizes Spanish accents and whitespace', () => {
    expect(normalizeSearch('  Atención   MÉDICA ')).toBe('atencion medica');
  });

  it('requires every query term to match', () => {
    expect(
      matchesSearchQuery('Ayuntamiento cerrado por obras', 'cerrado obras')
    ).toBe(true);
    expect(
      matchesSearchQuery('Ayuntamiento cerrado por obras', 'cerrado farmacia')
    ).toBe(false);
  });

  it('returns safe regular-expression terms', () => {
    expect(escapeRegExp('[agua]')).toBe('\\[agua\\]');
    expect(getSearchTerms(' Agua   potable ')).toEqual(['agua', 'potable']);
  });
});

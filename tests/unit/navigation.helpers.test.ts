import { describe, expect, it } from 'vitest';
import {
  filterNavigationEntries,
  isActiveNavigationLink,
  type NavigationEntry,
} from '../../src/components/layout/navigation.helpers';

const baseEntries: NavigationEntry[] = [
  { key: 'Inicio', url: '/' },
  { key: 'Noticias', url: '/noticias/' },
  { key: 'Admin', url: '/admin', isAdmin: true },
];

describe('filterNavigationEntries', () => {
  it('removes admin entries when menu is disabled', () => {
    const result = filterNavigationEntries(baseEntries, false);

    expect(result.map(entry => entry.key)).toStrictEqual([
      'Inicio',
      'Noticias',
    ]);
  });

  it('keeps admin entries when menu is enabled', () => {
    const result = filterNavigationEntries(baseEntries, true);

    expect(result.map(entry => entry.key)).toStrictEqual([
      'Inicio',
      'Noticias',
      'Admin',
    ]);
  });
});

describe('isActiveNavigationLink', () => {
  it('returns true for root when on homepage', () => {
    expect(isActiveNavigationLink('/', '/')).toBe(true);
  });

  it('returns false for root when on another route', () => {
    expect(isActiveNavigationLink('/', '/noticias/')).toBe(false);
  });

  it('matches nested routes as active', () => {
    expect(isActiveNavigationLink('/noticias/', '/noticias/evento/')).toBe(
      true
    );
  });

  it('returns false when url is empty', () => {
    expect(isActiveNavigationLink(undefined, '/')).toBe(false);
  });
});

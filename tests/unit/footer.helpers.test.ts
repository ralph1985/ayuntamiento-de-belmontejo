import { describe, expect, it } from 'vitest';
import type { NavigationEntry } from '../../src/components/navigation.helpers';
import {
  filterFooterNavigationEntries,
  resolveFooterServiceLink,
  type FooterService,
} from '../../src/components/footer.helpers';

const navigationEntries: NavigationEntry[] = [
  { key: 'Inicio', url: '/' },
  { key: 'Noticias', url: '/noticias/' },
  { key: 'Admin', url: '/admin', isAdmin: true },
];

describe('filterFooterNavigationEntries', () => {
  it('removes admin entries when menu is disabled', () => {
    const result = filterFooterNavigationEntries(navigationEntries, false);

    expect(result.map(entry => entry.key)).toStrictEqual([
      'Inicio',
      'Noticias',
    ]);
  });

  it('keeps admin entries when menu is enabled', () => {
    const result = filterFooterNavigationEntries(navigationEntries, true);

    expect(result.map(entry => entry.key)).toStrictEqual([
      'Inicio',
      'Noticias',
      'Admin',
    ]);
  });
});

describe('resolveFooterServiceLink', () => {
  const baseService: FooterService = {
    title: 'Sede Electrónica',
    url: 'https://example.com',
    isActive: true,
  };

  it('marks active external services as links with external attributes', () => {
    const result = resolveFooterServiceLink({
      ...baseService,
      isExternal: true,
    });

    expect(result).toStrictEqual({
      isLink: true,
      target: '_blank',
      rel: 'noopener noreferrer',
    });
  });

  it('keeps internal links without external attributes', () => {
    const result = resolveFooterServiceLink({
      ...baseService,
      isExternal: false,
    });

    expect(result).toStrictEqual({ isLink: true });
  });

  it('treats inactive services as plain text', () => {
    const result = resolveFooterServiceLink({
      ...baseService,
      isActive: false,
    });

    expect(result).toStrictEqual({ isLink: false });
  });

  it('treats services without url as plain text', () => {
    const result = resolveFooterServiceLink({
      ...baseService,
      url: '',
    });

    expect(result).toStrictEqual({ isLink: false });
  });
});

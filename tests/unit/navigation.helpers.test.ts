import { describe, expect, it } from 'vitest';
import { isActiveNavigationLink } from '../../src/components/layout/navigation.helpers';

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

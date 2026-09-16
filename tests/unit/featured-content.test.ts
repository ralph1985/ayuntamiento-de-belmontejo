import {
  getDefaultFeaturedUntil,
  getFeaturedUntil,
  isCurrentlyFeatured,
} from '../../src/data/featuredContent';
import { describe, expect, it } from 'vitest';

describe('featured content helpers', () => {
  it('calculates the default expiration date from the post date', () => {
    expect(
      getDefaultFeaturedUntil(new Date('2026-09-01T10:00:00.000Z'), 30)
    ).toEqual(new Date('2026-10-01T10:00:00.000Z'));
  });

  it('prefers an explicit expiration date', () => {
    const explicitUntil = new Date('2026-12-31T00:00:00.000Z');

    expect(
      getFeaturedUntil({
        data: {
          date: new Date('2026-09-01T00:00:00.000Z'),
          featuredUntil: explicitUntil,
        },
      })
    ).toBe(explicitUntil);
  });

  it('only considers featured posts active until their expiration', () => {
    const post = {
      data: {
        date: new Date('2026-09-01T00:00:00.000Z'),
        isFeatured: true,
        featuredUntil: new Date('2026-09-10T00:00:00.000Z'),
      },
    };

    expect(
      isCurrentlyFeatured(post, new Date('2026-09-09T23:59:59.000Z'))
    ).toBe(true);
    expect(
      isCurrentlyFeatured(post, new Date('2026-09-10T00:00:01.000Z'))
    ).toBe(false);
    expect(
      isCurrentlyFeatured(
        { data: { ...post.data, isFeatured: false } },
        new Date('2026-09-09T00:00:00.000Z')
      )
    ).toBe(false);
  });
});

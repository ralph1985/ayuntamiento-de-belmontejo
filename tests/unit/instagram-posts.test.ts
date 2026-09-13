import { describe, expect, it } from 'vitest';
import {
  getInstagramArchive,
  getInstagramMonthPath,
  groupInstagramMonthsByYear,
  groupInstagramPostsByMonth,
  type InstagramPost,
} from '../../src/data/instagramPosts';

function makePost(id: string, publishedAt: string | null): InstagramPost {
  return {
    id,
    permalink: `https://www.instagram.com/p/${id}/`,
    caption: '',
    publishedAt,
    mediaType: 'IMAGE',
    imageUrl: null,
    title: id,
    summary: id,
    category: 'general',
    isRelevant: false,
    isPublished: true,
    featureOnHome: false,
    analysisSource: 'manual',
  };
}

describe('groupInstagramPostsByMonth', () => {
  it('groups months from newest to oldest without mixing years', () => {
    const groups = groupInstagramPostsByMonth([
      makePost('august-2023', '2023-08-23T00:00:00.000Z'),
      makePost('september-2026', '2026-09-12T00:00:00.000Z'),
      makePost('august-2026', '2026-08-31T00:00:00.000Z'),
    ]);

    expect(groups.map(group => [group.key, group.label])).toEqual([
      ['2026-09', 'Septiembre de 2026'],
      ['2026-08', 'Agosto de 2026'],
      ['2023-08', 'Agosto de 2023'],
    ]);
    expect(groups.map(group => group.posts.map(post => post.id))).toEqual([
      ['september-2026'],
      ['august-2026'],
      ['august-2023'],
    ]);
  });

  it('keeps posts without a valid date in a final group', () => {
    const groups = groupInstagramPostsByMonth([
      makePost('dated', '2026-09-12T00:00:00.000Z'),
      makePost('missing', null),
      makePost('invalid', 'not-a-date'),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[1]).toMatchObject({
      key: 'sin-fecha',
      label: 'Fecha no disponible',
      posts: [
        expect.objectContaining({ id: 'missing' }),
        expect.objectContaining({ id: 'invalid' }),
      ],
    });
  });

  it('keeps the current month on the main view and archives older months', () => {
    const posts = [
      makePost('current', '2026-09-12T00:00:00.000Z'),
      makePost('older', '2026-08-31T00:00:00.000Z'),
      makePost('oldest', '2023-08-23T00:00:00.000Z'),
    ];
    const archive = getInstagramArchive(
      new Date('2026-09-13T10:00:00.000Z'),
      posts
    );

    expect(archive.currentMonth?.key).toBe('2026-09');
    expect(archive.visibleMonth?.posts.map(post => post.id)).toEqual([
      'current',
    ]);
    expect(archive.historicalMonths.map(month => month.key)).toEqual([
      '2026-08',
      '2023-08',
    ]);
    expect(groupInstagramMonthsByYear(archive.historicalMonths)).toEqual([
      {
        year: 2026,
        months: [expect.objectContaining({ key: '2026-08' })],
      },
      {
        year: 2023,
        months: [expect.objectContaining({ key: '2023-08' })],
      },
    ]);
    expect(getInstagramMonthPath('2026-08')).toBe(
      '/instagram/archivo/2026/08/'
    );
  });

  it('falls back to the latest month when the current month is empty', () => {
    const archive = getInstagramArchive(new Date('2026-09-13T10:00:00.000Z'), [
      makePost('latest', '2026-08-31T00:00:00.000Z'),
      makePost('older', '2023-08-23T00:00:00.000Z'),
    ]);

    expect(archive.currentMonth).toBeNull();
    expect(archive.visibleMonth?.key).toBe('2026-08');
    expect(archive.visibleMonth?.posts.map(post => post.id)).toEqual([
      'latest',
    ]);
  });
});

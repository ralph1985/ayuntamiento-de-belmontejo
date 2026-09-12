import { describe, expect, it } from 'vitest';
import {
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
});

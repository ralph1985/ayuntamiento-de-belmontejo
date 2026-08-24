import postsData from './instagramPosts.json';

export interface InstagramPost {
  id: string;
  permalink: string;
  caption: string;
  publishedAt: string | null;
  mediaType: string;
  title: string;
  summary: string;
  category: string;
  isRelevant: boolean;
  isPublished: boolean;
  featureOnHome: boolean;
  analysisSource: 'codex' | 'fallback' | 'manual';
  analysisReason?: string;
}

export const instagramPosts = (postsData as InstagramPost[]).sort((a, b) => {
  const first = a.publishedAt ? Date.parse(a.publishedAt) : 0;
  const second = b.publishedAt ? Date.parse(b.publishedAt) : 0;
  return second - first;
});

export const publishedInstagramPosts = instagramPosts.filter(
  post => post.isPublished
);

export const featuredInstagramPosts = publishedInstagramPosts.filter(
  post => post.featureOnHome
);

import postsData from './instagramPosts.json';

export interface InstagramPost {
  id: string;
  permalink: string;
  caption: string;
  publishedAt: string | null;
  mediaType: string;
  imageUrl?: string | null;
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

export const INSTAGRAM_PAGE_SIZE = 9;

export interface InstagramPage {
  posts: InstagramPost[];
  currentPage: number;
  totalPages: number;
}

export function getInstagramPage(page = 1): InstagramPage {
  const totalPages = Math.max(
    1,
    Math.ceil(publishedInstagramPosts.length / INSTAGRAM_PAGE_SIZE)
  );
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * INSTAGRAM_PAGE_SIZE;

  return {
    posts: publishedInstagramPosts.slice(start, start + INSTAGRAM_PAGE_SIZE),
    currentPage,
    totalPages,
  };
}

export function getInstagramPageUrl(page: number) {
  return page === 1 ? '/instagram/' : `/instagram/page/${page}/`;
}

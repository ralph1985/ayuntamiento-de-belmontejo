import { readFileSync } from 'node:fs';
import path from 'node:path';
import postsData from './instagramPosts.json';

function loadInstagramPosts() {
  const postsBase = process.env.INSTAGRAM_POSTS_BASE;

  if (!postsBase) return postsData;

  return JSON.parse(
    readFileSync(path.resolve(postsBase, 'instagramPosts.json'), 'utf8')
  );
}

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

export const instagramPosts = (loadInstagramPosts() as InstagramPost[]).sort(
  (a, b) => {
    const first = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const second = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return second - first;
  }
);

export const publishedInstagramPosts = instagramPosts.filter(
  post => post.isPublished
);

export const featuredInstagramPosts = publishedInstagramPosts.filter(
  post => post.featureOnHome
);

export interface InstagramMonthGroup {
  key: string;
  label: string;
  posts: InstagramPost[];
}

function getInstagramMonthKey(publishedAt: string | null) {
  if (!publishedAt) return null;

  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return null;

  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${date.getUTCFullYear()}-${month}`;
}

function formatInstagramMonth(key: string) {
  const date = new Date(`${key}-01T00:00:00Z`);
  const label = new Intl.DateTimeFormat('es-ES', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);

  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function groupInstagramPostsByMonth(
  posts: InstagramPost[]
): InstagramMonthGroup[] {
  const datedGroups = new Map<string, InstagramPost[]>();
  const undatedPosts: InstagramPost[] = [];

  for (const post of posts) {
    const key = getInstagramMonthKey(post.publishedAt);

    if (!key) {
      undatedPosts.push(post);
      continue;
    }

    const group = datedGroups.get(key) ?? [];
    group.push(post);
    datedGroups.set(key, group);
  }

  const groups = [...datedGroups.entries()]
    .sort(([first], [second]) => second.localeCompare(first))
    .map(([key, posts]) => ({
      key,
      label: formatInstagramMonth(key),
      posts,
    }));

  if (undatedPosts.length > 0) {
    groups.push({
      key: 'sin-fecha',
      label: 'Fecha no disponible',
      posts: undatedPosts,
    });
  }

  return groups;
}

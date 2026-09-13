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

export const INSTAGRAM_TIME_ZONE = 'Europe/Madrid';

export interface InstagramMonthGroup {
  key: string;
  label: string;
  year: number;
  month: number;
  posts: InstagramPost[];
}

export interface InstagramYearGroup {
  year: number;
  months: InstagramMonthGroup[];
}

export interface InstagramArchive {
  currentMonthKey: string;
  currentMonth: InstagramMonthGroup | null;
  visibleMonth: InstagramMonthGroup | null;
  historicalMonths: InstagramMonthGroup[];
  years: InstagramYearGroup[];
}

function getDateMonthParts(value: Date, timeZone = INSTAGRAM_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(value);
  const year = Number(parts.find(part => part.type === 'year')?.value);
  const month = Number(parts.find(part => part.type === 'month')?.value);

  if (!Number.isInteger(year) || !Number.isInteger(month)) return null;

  return { year, month };
}

export function getInstagramMonthKey(
  value: Date | string | null,
  timeZone = INSTAGRAM_TIME_ZONE
) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const parts = getDateMonthParts(date, timeZone);
  if (!parts) return null;

  return `${parts.year}-${String(parts.month).padStart(2, '0')}`;
}

function getMonthPartsFromKey(key: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(key);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;

  return { year, month };
}

function formatInstagramMonth(key: string) {
  const parts = getMonthPartsFromKey(key);
  if (!parts) return 'Fecha no disponible';

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
    .map(([key, posts]) => {
      const parts = getMonthPartsFromKey(key);

      if (!parts) return null;

      return {
        key,
        label: formatInstagramMonth(key),
        year: parts.year,
        month: parts.month,
        posts,
      };
    })
    .filter((group): group is InstagramMonthGroup => group !== null);

  if (undatedPosts.length > 0) {
    groups.push({
      key: 'sin-fecha',
      label: 'Fecha no disponible',
      year: 0,
      month: 0,
      posts: undatedPosts,
    });
  }

  return groups;
}

export function groupInstagramMonthsByYear(
  months: InstagramMonthGroup[]
): InstagramYearGroup[] {
  const groups = new Map<number, InstagramMonthGroup[]>();

  for (const month of months) {
    const yearMonths = groups.get(month.year) ?? [];
    yearMonths.push(month);
    groups.set(month.year, yearMonths);
  }

  return [...groups.entries()]
    .sort(([first], [second]) => second - first)
    .map(([year, months]) => ({ year, months }));
}

export function getInstagramMonthPath(monthKey: string) {
  const parts = getMonthPartsFromKey(monthKey);
  if (!parts) return '/instagram/archivo/';

  return `/instagram/archivo/${parts.year}/${String(parts.month).padStart(2, '0')}/`;
}

export function getInstagramArchive(
  now = new Date(),
  posts = publishedInstagramPosts
): InstagramArchive {
  const currentMonthKey = getInstagramMonthKey(now) ?? '';
  const months = groupInstagramPostsByMonth(posts);
  const currentMonth =
    months.find(month => month.key === currentMonthKey) ?? null;
  const historicalMonths = months.filter(
    month => month.key !== currentMonthKey
  );

  return {
    currentMonthKey,
    currentMonth,
    visibleMonth: currentMonth ?? historicalMonths[0] ?? null,
    historicalMonths,
    years: groupInstagramMonthsByYear(historicalMonths),
  };
}

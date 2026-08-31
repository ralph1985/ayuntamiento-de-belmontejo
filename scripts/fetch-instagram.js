/* eslint-disable no-console */
/* global URL */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import {
  classifyInstagramWithCodex,
  fallbackInstagramDecision,
} from './codex-instagram-classifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const dataPath = path.join(projectRoot, 'src', 'data', 'instagramPosts.json');
const instagramImageDir = path.join(
  projectRoot,
  'public',
  'assets',
  'images',
  'instagram'
);
const defaultReportPath = path.join(
  process.env.TMPDIR ?? '/tmp',
  'ayuntamiento-belmontejo-instagram-result.json'
);

export function getInstagramConfig(env = process.env) {
  return {
    profileUrl:
      env.INSTAGRAM_PROFILE_URL ?? 'https://www.instagram.com/aytobelmontejo/',
    maxPosts: Number(env.INSTAGRAM_SCRAPE_LIMIT ?? '24'),
    navigationTimeoutMs: Number(env.INSTAGRAM_NAVIGATION_TIMEOUT_MS ?? '45000'),
  };
}

function normalizePermalink(value) {
  const url = new URL(value);
  if (
    url.protocol !== 'https:' ||
    !['www.instagram.com', 'instagram.com'].includes(url.hostname) ||
    !/\/(p|reel|tv)\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)
  ) {
    throw new Error(`Permalink de Instagram no válido: ${value}`);
  }

  const match = url.pathname.match(/\/(p|reel|tv)\/([A-Za-z0-9_-]+)\/?$/);
  return `https://www.instagram.com/${match[1]}/${match[2]}/`;
}

async function readMetaContent(page, selector) {
  return page
    .locator(selector)
    .first()
    .getAttribute('content', { timeout: 5_000 })
    .catch(() => null);
}

export function normalizeInstagramMedia(item) {
  if (
    !item ||
    typeof item.id !== 'string' ||
    typeof item.permalink !== 'string'
  ) {
    throw new Error('La API devolvió una publicación de Instagram incompleta.');
  }

  return {
    id: item.id,
    permalink: normalizePermalink(item.permalink),
    caption: normalizeInstagramCaption(item.caption),
    publishedAt: typeof item.timestamp === 'string' ? item.timestamp : null,
    mediaType:
      typeof item.media_type === 'string' ? item.media_type : 'UNKNOWN',
    imageUrl:
      typeof item.image_url === 'string' &&
      item.image_url.startsWith('https://')
        ? item.image_url
        : null,
  };
}

export function normalizeInstagramCaption(value) {
  if (typeof value !== 'string') return '';

  return value
    .replace(
      /^\s*[\d.,]+\s+likes?(?:,\s*[\d.,]+\s+comments?)?\s*-\s*.*?\s+\bel\s+[A-Za-z]+\s+\d{1,2},\s+\d{4}:\s*/i,
      ''
    )
    .trim();
}

export function parseInstagramPublishedAt(value) {
  if (typeof value !== 'string') return null;

  const match = value.match(/\bel\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})\b/i);
  if (!match) return null;

  const timestamp = Date.parse(`${match[1]} 00:00:00 UTC`);
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

function isAllowedInstagramImageUrl(value) {
  if (typeof value !== 'string' || !value.startsWith('https://')) return false;

  const hostname = new URL(value).hostname;
  return (
    hostname === 'cdninstagram.com' ||
    hostname.endsWith('.cdninstagram.com') ||
    hostname === 'fbcdn.net' ||
    hostname.endsWith('.fbcdn.net')
  );
}

export async function downloadInstagramImage(
  url,
  { id, destinationDir = instagramImageDir, fetchImpl = fetch } = {}
) {
  if (!id || !isAllowedInstagramImageUrl(url)) return null;

  const response = await fetchImpl(url, {
    headers: {
      'user-agent': 'Ayuntamiento-de-Belmontejo-InstagramSync/1.0',
      referer: 'https://www.instagram.com/',
    },
    redirect: 'follow',
  });

  if (!response.ok) throw new Error(`Imagen HTTP ${response.status}.`);

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.startsWith('image/')) {
    throw new Error('Instagram no devolvió una imagen válida.');
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > 10 * 1024 * 1024) {
    throw new Error('La imagen supera el tamaño máximo permitido.');
  }

  const outputPath = path.join(destinationDir, `${id}.webp`);
  const temporaryPath = `${outputPath}.tmp`;
  fs.mkdirSync(destinationDir, { recursive: true });
  fs.writeFileSync(
    temporaryPath,
    await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer()
  );
  fs.renameSync(temporaryPath, outputPath);

  return `/assets/images/instagram/${id}.webp`;
}

async function materializeInstagramImage(item, previous) {
  if (!item.imageUrl) {
    return {
      ...item,
      imageUrl: previous?.imageUrl?.startsWith('/assets/')
        ? previous.imageUrl
        : null,
    };
  }

  try {
    return {
      ...item,
      imageUrl:
        (await downloadInstagramImage(item.imageUrl, { id: item.id })) ??
        (previous?.imageUrl?.startsWith('/assets/') ? previous.imageUrl : null),
    };
  } catch (error) {
    console.warn(
      `Imagen de Instagram omitida para ${item.id}: ${error.message}`
    );
    return {
      ...item,
      imageUrl: previous?.imageUrl?.startsWith('/assets/')
        ? previous.imageUrl
        : null,
    };
  }
}

export async function fetchInstagramMedia({
  config = getInstagramConfig(),
  browserType = chromium,
} = {}) {
  const browser = await browserType.launch({ headless: true });
  const page = await browser.newPage({ locale: 'es-ES' });

  try {
    await page.goto(config.profileUrl, {
      waitUntil: 'domcontentloaded',
      timeout: config.navigationTimeoutMs,
    });
    await page.waitForTimeout(2_000);

    const linkLocator = page.locator(
      'a[href*="/p/"], a[href*="/reel/"], a[href*="/tv/"]'
    );
    const links = new Set();
    let previousCount = 0;

    for (
      let attempt = 0;
      attempt < 5 && links.size < config.maxPosts;
      attempt++
    ) {
      const visibleLinks = await linkLocator.evaluateAll(elements =>
        elements
          .map(element => element.getAttribute('href') ?? '')
          .filter(Boolean)
      );
      visibleLinks.forEach(link =>
        links.add(new URL(link, config.profileUrl).toString())
      );

      if (links.size === previousCount) break;
      previousCount = links.size;
      await page.mouse.wheel(0, 3_000);
      await page.waitForTimeout(1_000);
    }

    const uniqueLinks = [...links].slice(0, config.maxPosts);

    if (uniqueLinks.length === 0) {
      throw new Error(
        'Instagram no entregó publicaciones públicas; puede haber mostrado login, captcha o un cambio de interfaz.'
      );
    }

    const items = [];
    for (const permalink of uniqueLinks) {
      await page.goto(permalink, {
        waitUntil: 'domcontentloaded',
        timeout: config.navigationTimeoutMs,
      });
      const description = await readMetaContent(
        page,
        'meta[property="og:description"]'
      );
      const metadataTimestamp = await readMetaContent(
        page,
        'meta[property="article:published_time"]'
      );
      const imageUrl = await readMetaContent(page, 'meta[property="og:image"]');
      const timestamp =
        metadataTimestamp ?? parseInstagramPublishedAt(description);
      const mediaType = permalink.includes('/reel/')
        ? 'REELS'
        : permalink.includes('/tv/')
          ? 'VIDEO'
          : 'IMAGE';
      const id = new URL(permalink).pathname.split('/').filter(Boolean).pop();

      if (!description) {
        continue;
      }

      items.push(
        normalizeInstagramMedia({
          id,
          permalink,
          caption: description ?? '',
          timestamp,
          media_type: mediaType,
          image_url: imageUrl,
        })
      );
    }

    if (items.length === 0) {
      throw new Error(
        'Instagram no entregó publicaciones verificables de la cuenta configurada.'
      );
    }

    return items;
  } finally {
    await browser.close();
  }
}

export function readInstagramPosts(filePath = dataPath) {
  if (!fs.existsSync(filePath)) return [];
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!Array.isArray(parsed))
    throw new Error('Los datos de Instagram no son una lista.');
  return parsed;
}

export function writeInstagramPosts(posts, filePath = dataPath) {
  const temporaryPath = `${filePath}.tmp`;
  fs.writeFileSync(
    `${temporaryPath}`,
    `${JSON.stringify(posts, null, 2)}\n`,
    'utf8'
  );
  fs.renameSync(temporaryPath, filePath);
}

function buildFallbackPost(item) {
  return {
    ...item,
    ...fallbackInstagramDecision,
    isPublished: true,
    analysisSource: 'fallback',
    analysisReason: fallbackInstagramDecision.reason,
  };
}

function materializePost(item, decision, previous) {
  return {
    ...item,
    title: decision.title,
    summary: decision.summary,
    category: decision.category,
    isRelevant: decision.isRelevant,
    isPublished: true,
    featureOnHome: decision.featureOnHome,
    analysisSource: 'codex',
    analysisReason: decision.reason,
    ...(previous?.manualOverride
      ? { manualOverride: previous.manualOverride }
      : {}),
  };
}

export async function syncInstagram({
  config,
  filePath = dataPath,
  reportPath = process.env.INSTAGRAM_SYNC_REPORT ?? defaultReportPath,
  classify = classifyInstagramWithCodex,
  fetchMedia = fetchInstagramMedia,
} = {}) {
  const remoteItems = await fetchMedia({
    config: config ?? getInstagramConfig(),
  });
  const previousPosts = readInstagramPosts(filePath);
  const previousById = new Map(previousPosts.map(post => [post.id, post]));
  const findPrevious = item =>
    previousById.get(item.id) ??
    previousPosts.find(post => post.permalink === item.permalink);
  const mediaItems = await Promise.all(
    remoteItems.map(item => materializeInstagramImage(item, findPrevious(item)))
  );
  const pending = mediaItems.filter(item => {
    const previous = findPrevious(item);
    return (
      !previous ||
      normalizeInstagramCaption(previous.caption) !== item.caption ||
      previous.publishedAt !== item.publishedAt ||
      previous.permalink !== item.permalink ||
      previous.imageUrl !== item.imageUrl ||
      previous.isPublished === false ||
      previous.analysisSource === 'fallback'
    );
  });

  let decisions = new Map();
  let classificationFallback = 0;
  if (pending.length > 0) {
    try {
      decisions = await classify(pending, { projectRoot });
    } catch (error) {
      classificationFallback = pending.length;
      console.warn(`Codex no pudo analizar Instagram: ${error.message}`);
    }
  }

  const materialized = mediaItems.map(item => {
    const previous = findPrevious(item);
    if (!pending.some(candidate => candidate.id === item.id) && previous) {
      return previous;
    }

    const decision = decisions.get(item.id);
    return decision
      ? materializePost(item, decision, previous)
      : buildFallbackPost(item);
  });
  const isRemotePost = post =>
    mediaItems.some(
      item => item.id === post.id || item.permalink === post.permalink
    );
  const retainedHistorical = previousPosts.filter(post => !isRemotePost(post));
  const posts = [...materialized, ...retainedHistorical].sort((a, b) => {
    const first = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const second = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return second - first;
  });
  const changed = JSON.stringify(posts) !== JSON.stringify(previousPosts);
  if (changed) writeInstagramPosts(posts, filePath);

  const report = {
    fetched: remoteItems.length,
    created: materialized.filter(item => !findPrevious(item)).length,
    updated: materialized.filter(
      item =>
        Boolean(findPrevious(item)) &&
        pending.some(candidate => candidate.id === item.id)
    ).length,
    unchanged: mediaItems.length - pending.length,
    classifiedWithCodex: pending.length - classificationFallback,
    classificationFallback,
    retainedHistorical: retainedHistorical.length,
    changed,
    posts: materialized
      .filter(
        item =>
          !findPrevious(item) ||
          pending.some(candidate => candidate.id === item.id)
      )
      .map(item => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        permalink: item.permalink,
        isPublished: item.isPublished,
        analysisSource: item.analysisSource,
        analysisReason: item.analysisReason,
      })),
  };
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(
    `Instagram sync: ${report.created} created, ${report.updated} updated, ${report.unchanged} unchanged, ${report.classifiedWithCodex} analyzed, ${report.classificationFallback} fallback.`
  );
  return report;
}

if (process.argv[1]?.endsWith('fetch-instagram.js')) {
  await syncInstagram();
}

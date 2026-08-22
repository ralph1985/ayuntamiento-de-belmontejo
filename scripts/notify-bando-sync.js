/* eslint-disable no-console */
/* global URL */
import 'dotenv/config';
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import nodemailer from 'nodemailer';

const execFileAsync = promisify(execFile);
const defaultSiteUrl = 'https://ayuntamiento-de-belmontejo.vercel.app';

export function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function getBandoTitle(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^title:\s+'(.*)'$/m);

  if (!match) {
    return path.basename(filePath, path.extname(filePath));
  }

  return match[1].replaceAll("''", "'");
}

export function getBandoGuideDecision(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const isUsefulMatch = content.match(/^isUsefulForGuide:\s*(true|false)\s*$/m);
  const sourceMatch = content.match(
    /^guideDecisionSource:\s*(codex|fallback)\s*$/m
  );

  return {
    isUsefulForGuide: isUsefulMatch?.[1] === 'true',
    source: sourceMatch?.[1] ?? 'fallback',
  };
}

export function buildBandoUrl(filePath, siteUrl = defaultSiteUrl) {
  const slug = path.basename(filePath, path.extname(filePath));
  return new URL(`/bandos/${slug}/`, siteUrl).toString();
}

export function buildNotificationText({ commit, bandos, siteUrl }) {
  const count = bandos.length;
  const label = count === 1 ? 'bando nuevo' : 'bandos nuevos';
  const list = bandos
    .map(
      bando =>
        `- ${bando.title}\n  Guía práctica: ${bando.isUsefulForGuide ? 'sí' : 'no'}${bando.source === 'fallback' ? ' (clasificación no disponible)' : ''}\n  ${bando.url}`
    )
    .join('\n');

  return `Se han publicado ${count} ${label} en la web del Ayuntamiento de Belmontejo.\n\n${list}\n\nConsulta todos los bandos: ${siteUrl}/bandos/\n\nActualización automática · Commit ${commit}`;
}

export function buildNotificationHtml({ commit, bandos, siteUrl }) {
  const count = bandos.length;
  const label = count === 1 ? 'bando nuevo' : 'bandos nuevos';
  const rows = bandos
    .map(
      bando => `<li style="margin: 0 0 16px;">
  <a href="${escapeHtml(bando.url)}" style="color: #155e75; font-weight: 700; text-decoration: none;">${escapeHtml(bando.title)}</a>
  <br><span style="color: #52606d; font-size: 13px;">Guía práctica: ${bando.isUsefulForGuide ? 'sí' : 'no'}${bando.source === 'fallback' ? ' (clasificación no disponible)' : ''}</span>
</li>`
    )
    .join('\n');

  return `<!doctype html>
<html lang="es">
  <body style="margin: 0; padding: 24px; background: #f4f1ea; color: #1f2933; font-family: Arial, sans-serif;">
    <main style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
      <header style="padding: 28px 32px; background: #155e75; color: #ffffff;">
        <p style="margin: 0 0 8px; font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase;">Ayuntamiento de Belmontejo</p>
        <h1 style="margin: 0; font-size: 26px; line-height: 1.2;">${count} ${label} publicado${count === 1 ? '' : 's'}</h1>
      </header>
      <section style="padding: 28px 32px;">
        <p style="margin: 0 0 20px; line-height: 1.55;">La actualización automática ha publicado los siguientes avisos municipales:</p>
        <ul style="margin: 0 0 28px; padding-left: 20px; line-height: 1.5;">
${rows}
        </ul>
        <a href="${escapeHtml(`${siteUrl}/bandos/`)}" style="display: inline-block; padding: 12px 18px; background: #155e75; border-radius: 6px; color: #ffffff; font-weight: 700; text-decoration: none;">Ver todos los bandos</a>
      </section>
      <footer style="padding: 18px 32px; background: #f4f1ea; color: #52606d; font-size: 13px; line-height: 1.5;">Actualización automática del RSS oficial · Commit ${escapeHtml(commit)}</footer>
    </main>
  </body>
</html>`;
}

export async function getChangedBandoFiles(commit) {
  const { stdout } = await execFileAsync('git', [
    'diff-tree',
    '--no-commit-id',
    '--name-only',
    '-r',
    commit,
    '--',
    'src/content/bandos',
  ]);

  return stdout.split('\n').filter(Boolean);
}

export async function getChangedBandos(commit, siteUrl) {
  const files = await getChangedBandoFiles(commit);
  return files.map(file => ({
    title: getBandoTitle(file),
    url: buildBandoUrl(file, siteUrl),
    ...getBandoGuideDecision(file),
  }));
}

export async function notifyBandoSync(commit) {
  const required = [
    'BANDOS_SMTP_HOST',
    'BANDOS_SMTP_USER',
    'BANDOS_SMTP_PASSWORD',
    'BANDOS_NOTIFY_FROM',
    'BANDOS_NOTIFY_TO',
  ];
  const missing = required.filter(name => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `Missing bando notification configuration: ${missing.join(', ')}`
    );
  }

  const siteUrl = (process.env.BANDOS_SITE_URL ?? defaultSiteUrl).replace(
    /\/$/,
    ''
  );
  const bandos = await getChangedBandos(commit, siteUrl);
  if (bandos.length === 0) {
    throw new Error(`Commit ${commit} does not contain bando changes`);
  }

  const transporter = nodemailer.createTransport({
    host: process.env.BANDOS_SMTP_HOST,
    port: Number(process.env.BANDOS_SMTP_PORT ?? '587'),
    secure: process.env.BANDOS_SMTP_SECURE === 'true',
    requireTLS: true,
    auth: {
      user: process.env.BANDOS_SMTP_USER,
      pass: process.env.BANDOS_SMTP_PASSWORD,
    },
  });

  const text = buildNotificationText({ commit, bandos, siteUrl });
  const html = buildNotificationHtml({ commit, bandos, siteUrl });
  await transporter.sendMail({
    from: process.env.BANDOS_NOTIFY_FROM,
    to: process.env.BANDOS_NOTIFY_TO,
    subject: `Belmontejo: ${bandos.length} bando${bandos.length === 1 ? '' : 's'} publicado${bandos.length === 1 ? '' : 's'}`,
    text,
    html,
  });
}

const isCliInvocation = process.argv[1]?.endsWith('notify-bando-sync.js');
if (isCliInvocation) {
  const commit = process.env.BANDOS_SYNC_COMMIT ?? process.argv[2];
  if (!commit) {
    throw new Error('Provide BANDOS_SYNC_COMMIT or a commit SHA argument');
  }

  await notifyBandoSync(commit);
  console.log(`Bando synchronization notification sent for ${commit}.`);
}

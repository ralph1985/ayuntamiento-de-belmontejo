/* eslint-disable no-console */
import 'dotenv/config';
import fs from 'node:fs';
import nodemailer from 'nodemailer';

const defaultSiteUrl = 'https://ayuntamiento-de-belmontejo.vercel.app';

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function buildNotificationText({ commit, report, siteUrl }) {
  const posts = report.posts
    .map(
      post =>
        `- ${post.title}\n  Estado: ${post.isPublished ? 'publicada' : 'bloqueada'}\n  ${post.permalink}`
    )
    .join('\n');

  return `Sincronización de Instagram de Belmontejo\n\n${report.created} nuevas, ${report.updated} actualizadas y ${report.classificationFallback} con fallback de Codex.\n\n${posts || 'No hay publicaciones nuevas.'}\n\nConsulta la sección: ${siteUrl}/instagram/\nPerfil: https://www.instagram.com/aytobelmontejo/\n\nActualización automática · Commit ${commit}`;
}

export function buildNotificationHtml({ commit, report, siteUrl }) {
  const rows = report.posts
    .map(
      post => `<li style="margin: 0 0 16px;">
  <a href="${escapeHtml(post.permalink)}" style="color: #155e75; font-weight: 700; text-decoration: none;">${escapeHtml(post.title)}</a>
  <br><span style="color: #52606d; font-size: 13px;">Estado: ${post.isPublished ? 'publicada' : 'bloqueada'} · ${escapeHtml(post.summary)}</span>
</li>`
    )
    .join('\n');

  return `<!doctype html>
<html lang="es">
  <body style="margin: 0; padding: 24px; background: #f4f1ea; color: #1f2933; font-family: Arial, sans-serif;">
    <main style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
      <header style="padding: 28px 32px; background: #155e75; color: #ffffff;">
        <p style="margin: 0 0 8px; font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase;">Ayuntamiento de Belmontejo</p>
        <h1 style="margin: 0; font-size: 26px; line-height: 1.2;">Sincronización de Instagram</h1>
      </header>
      <section style="padding: 28px 32px;">
        <p style="margin: 0 0 20px; line-height: 1.55;">${report.created} nuevas, ${report.updated} actualizadas y ${report.classificationFallback} con fallback de Codex.</p>
        <ul style="margin: 0 0 28px; padding-left: 20px; line-height: 1.5;">${rows || '<li>No hay publicaciones nuevas.</li>'}</ul>
        <a href="${escapeHtml(`${siteUrl}/instagram/`)}" style="display: inline-block; padding: 12px 18px; background: #155e75; border-radius: 6px; color: #ffffff; font-weight: 700; text-decoration: none;">Ver Instagram en la web</a>
      </section>
      <footer style="padding: 18px 32px; background: #f4f1ea; color: #52606d; font-size: 13px; line-height: 1.5;">Actualización automática · Commit ${escapeHtml(commit)}</footer>
    </main>
  </body>
</html>`;
}

export async function notifyInstagramSync(
  commit,
  reportPath = process.env.INSTAGRAM_SYNC_REPORT ??
    '/tmp/ayuntamiento-belmontejo-instagram-result.json'
) {
  const required = [
    'INSTAGRAM_SMTP_HOST',
    'INSTAGRAM_SMTP_USER',
    'INSTAGRAM_SMTP_PASSWORD',
    'INSTAGRAM_NOTIFY_FROM',
    'INSTAGRAM_NOTIFY_TO',
  ];
  const missing = required.filter(name => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `Falta configuración de notificación de Instagram: ${missing.join(', ')}`
    );
  }
  if (!fs.existsSync(reportPath))
    throw new Error(`No existe el informe: ${reportPath}`);

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const siteUrl = (process.env.INSTAGRAM_SITE_URL ?? defaultSiteUrl).replace(
    /\/$/,
    ''
  );
  const transporter = nodemailer.createTransport({
    host: process.env.INSTAGRAM_SMTP_HOST,
    port: Number(process.env.INSTAGRAM_SMTP_PORT ?? '587'),
    secure: process.env.INSTAGRAM_SMTP_SECURE === 'true',
    requireTLS: true,
    auth: {
      user: process.env.INSTAGRAM_SMTP_USER,
      pass: process.env.INSTAGRAM_SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.INSTAGRAM_NOTIFY_FROM,
    to: process.env.INSTAGRAM_NOTIFY_TO,
    subject: `Belmontejo: ${report.created + report.updated} publicaciones de Instagram sincronizadas`,
    text: buildNotificationText({ commit, report, siteUrl }),
    html: buildNotificationHtml({ commit, report, siteUrl }),
  });
}

if (process.argv[1]?.endsWith('notify-instagram-sync.js')) {
  const commit = process.env.INSTAGRAM_SYNC_COMMIT ?? process.argv[2];
  if (!commit)
    throw new Error('Indica INSTAGRAM_SYNC_COMMIT o un SHA de commit.');
  await notifyInstagramSync(commit, process.argv[3]);
  console.log(`Notificación de Instagram enviada para ${commit}.`);
}

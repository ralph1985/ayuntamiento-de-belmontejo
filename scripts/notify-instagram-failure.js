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

function getReport(reportPath) {
  if (!reportPath || !fs.existsSync(reportPath)) return null;

  try {
    return JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  } catch {
    return null;
  }
}

function getPostSummary(report) {
  return (report?.posts ?? [])
    .map(post => `- ${post.title} · ${post.permalink}`)
    .join('\n');
}

export function buildFailureNotificationText({
  phase,
  error,
  branch,
  prUrl,
  report,
  siteUrl,
}) {
  const posts = getPostSummary(report);
  const links = [
    branch ? `Rama: ${branch}` : '',
    prUrl ? `Pull Request: ${prUrl}` : '',
    `Web: ${siteUrl}/instagram/`,
  ]
    .filter(Boolean)
    .join('\n');

  return `La sincronización automática de Instagram de Belmontejo ha fallado.

Fase: ${phase}
Error: ${error}
${links}
${posts ? `\nPublicaciones detectadas antes del fallo:\n${posts}` : ''}

Revisa el log de cron: /tmp/ayuntamiento-belmontejo-instagram.log`;
}

export function buildFailureNotificationHtml({
  phase,
  error,
  branch,
  prUrl,
  report,
  siteUrl,
}) {
  const posts = (report?.posts ?? [])
    .map(
      post =>
        `<li><a href="${escapeHtml(post.permalink)}">${escapeHtml(post.title)}</a></li>`
    )
    .join('');
  const links = [
    branch ? `<p>Rama: <code>${escapeHtml(branch)}</code></p>` : '',
    prUrl ? `<p><a href="${escapeHtml(prUrl)}">Ver Pull Request</a></p>` : '',
    `<p><a href="${escapeHtml(`${siteUrl}/instagram/`)}">Ver Instagram en la web</a></p>`,
  ].join('');

  return `<!doctype html>
<html lang="es">
  <body style="margin: 0; padding: 24px; background: #f4f1ea; color: #1f2933; font-family: Arial, sans-serif;">
    <main style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
      <header style="padding: 28px 32px; background: #9b2c2c; color: #ffffff;">
        <p style="margin: 0 0 8px; font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase;">Ayuntamiento de Belmontejo</p>
        <h1 style="margin: 0; font-size: 26px; line-height: 1.2;">Fallo en la sincronización de Instagram</h1>
      </header>
      <section style="padding: 28px 32px; line-height: 1.55;">
        <p><strong>Fase:</strong> ${escapeHtml(phase)}</p>
        <p><strong>Error:</strong> ${escapeHtml(error)}</p>
        ${links}
        ${posts ? `<h2 style="font-size: 18px;">Publicaciones detectadas</h2><ul>${posts}</ul>` : ''}
      </section>
      <footer style="padding: 18px 32px; background: #f4f1ea; color: #52606d; font-size: 13px;">Revisa /tmp/ayuntamiento-belmontejo-instagram.log</footer>
    </main>
  </body>
</html>`;
}

export async function notifyInstagramFailure({
  phase = process.env.INSTAGRAM_FAILURE_PHASE ?? 'desconocida',
  error = process.env.INSTAGRAM_FAILURE_ERROR ?? 'Error no especificado.',
  branch = process.env.INSTAGRAM_FAILURE_BRANCH ?? '',
  prUrl = process.env.INSTAGRAM_FAILURE_PR_URL ?? '',
  reportPath = process.env.INSTAGRAM_SYNC_REPORT ??
    '/tmp/ayuntamiento-belmontejo-instagram-result.json',
  env = process.env,
} = {}) {
  const smtp = {
    host: env.INSTAGRAM_SMTP_HOST ?? env.BANDOS_SMTP_HOST,
    port: env.INSTAGRAM_SMTP_PORT ?? env.BANDOS_SMTP_PORT ?? '587',
    secure: env.INSTAGRAM_SMTP_SECURE ?? env.BANDOS_SMTP_SECURE ?? 'false',
    user: env.INSTAGRAM_SMTP_USER ?? env.BANDOS_SMTP_USER,
    password: env.INSTAGRAM_SMTP_PASSWORD ?? env.BANDOS_SMTP_PASSWORD,
    from: env.INSTAGRAM_NOTIFY_FROM ?? env.BANDOS_NOTIFY_FROM,
    to: env.INSTAGRAM_NOTIFY_TO ?? env.BANDOS_NOTIFY_TO,
  };
  const missing = Object.entries(smtp)
    .filter(([, value]) => !value)
    .map(([name]) => name);
  if (missing.length > 0) {
    throw new Error(
      `Falta configuración SMTP para el aviso de Instagram: ${missing.join(', ')}`
    );
  }

  const siteUrl = (env.INSTAGRAM_SITE_URL ?? defaultSiteUrl).replace(/\/$/, '');
  const report = getReport(reportPath);
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: Number(smtp.port),
    secure: smtp.secure === 'true',
    requireTLS: true,
    auth: { user: smtp.user, pass: smtp.password },
  });

  await transporter.sendMail({
    from: smtp.from,
    to: smtp.to,
    subject: `Belmontejo: fallo en sincronización de Instagram · ${phase}`,
    text: buildFailureNotificationText({
      phase,
      error,
      branch,
      prUrl,
      report,
      siteUrl,
    }),
    html: buildFailureNotificationHtml({
      phase,
      error,
      branch,
      prUrl,
      report,
      siteUrl,
    }),
  });
}

if (process.argv[1]?.endsWith('notify-instagram-failure.js')) {
  await notifyInstagramFailure();
  console.log('Aviso de fallo de Instagram enviado.');
}

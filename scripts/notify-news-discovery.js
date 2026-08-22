import 'dotenv/config';
import nodemailer from 'nodemailer';

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function buildNewsNotificationText({
  prUrl,
  branch,
  created,
  rejected,
  warnings,
}) {
  const news = created
    .map(item => `- ${item.title}\n  ${item.sourceUrl}`)
    .join('\n');
  const review = created
    .filter(item => item.confidence === 'low')
    .map(
      item =>
        `- ${item.title}: ${item.reviewReason || 'requiere revisión editorial'}`
    )
    .join('\n');
  return [
    'Se ha creado una PR con propuestas de nuevas noticias para Belmontejo.',
    '',
    `PR: ${prUrl}`,
    `Rama: ${branch}`,
    '',
    `Noticias propuestas (${created.length}):`,
    news || '- Ninguna',
    review ? `\nRevisión editorial pendiente:\n${review}` : '',
    rejected.length
      ? `\nDescartadas:\n${rejected.map(item => `- ${item.title}: ${item.reason}`).join('\n')}`
      : '',
    warnings.length
      ? `\nAvisos:\n${warnings.map(item => `- ${item}`).join('\n')}`
      : '',
    '',
    'La PR no se ha publicado automáticamente; requiere revisión y merge manual.',
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildNewsNotificationHtml({
  prUrl,
  branch,
  created,
  rejected,
  warnings,
}) {
  const rows = created
    .map(
      item =>
        `<li style="margin:0 0 14px"><a href="${escapeHtml(item.sourceUrl)}" style="color:#155e75;font-weight:700">${escapeHtml(item.title)}</a>${item.confidence === 'low' ? '<br><span style="color:#9a3412">Revisión editorial pendiente</span>' : ''}</li>`
    )
    .join('');
  const extra = [
    ...rejected.map(item => `Descartada: ${item.title} — ${item.reason}`),
    ...warnings,
  ]
    .map(item => `<li>${escapeHtml(item)}</li>`)
    .join('');
  return `<!doctype html><html lang="es"><body style="margin:0;padding:24px;background:#f4f1ea;color:#1f2933;font-family:Arial,sans-serif"><main style="max-width:620px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden"><header style="padding:28px 32px;background:#155e75;color:#fff"><p style="margin:0 0 8px;font-size:14px;letter-spacing:.08em;text-transform:uppercase">Ayuntamiento de Belmontejo</p><h1 style="margin:0;font-size:25px">Nuevas noticias para revisar</h1></header><section style="padding:28px 32px"><p>La búsqueda diaria ha encontrado ${created.length} propuesta${created.length === 1 ? '' : 's'}.</p><ul>${rows || '<li>No hay propuestas nuevas.</li>'}</ul>${extra ? `<h2 style="font-size:17px">Avisos</h2><ul>${extra}</ul>` : ''}<a href="${escapeHtml(prUrl)}" style="display:inline-block;padding:12px 18px;background:#155e75;border-radius:6px;color:#fff;font-weight:700;text-decoration:none">Revisar PR</a><p style="margin-top:20px;color:#52606d;font-size:13px">Rama: ${escapeHtml(branch)}</p></section></main></body></html>`;
}

export async function notifyNewsDiscovery({
  prUrl,
  branch,
  created,
  rejected = [],
  warnings = [],
}) {
  const host = process.env.NEWS_SMTP_HOST ?? process.env.BANDOS_SMTP_HOST;
  const user = process.env.NEWS_SMTP_USER ?? process.env.BANDOS_SMTP_USER;
  const password =
    process.env.NEWS_SMTP_PASSWORD ?? process.env.BANDOS_SMTP_PASSWORD;
  const from = process.env.NEWS_NOTIFY_FROM ?? process.env.BANDOS_NOTIFY_FROM;
  const to = process.env.NEWS_NOTIFY_TO ?? process.env.BANDOS_NOTIFY_TO;
  const missing = Object.entries({
    NEWS_SMTP_HOST: host,
    NEWS_SMTP_USER: user,
    NEWS_SMTP_PASSWORD: password,
    NEWS_NOTIFY_FROM: from,
    NEWS_NOTIFY_TO: to,
  })
    .filter(([, value]) => !value)
    .map(([name]) => name);
  if (missing.length)
    throw new Error(`Falta configuración SMTP: ${missing.join(', ')}`);

  const transporter = nodemailer.createTransport({
    host,
    port: Number(
      process.env.NEWS_SMTP_PORT ?? process.env.BANDOS_SMTP_PORT ?? '587'
    ),
    secure:
      (process.env.NEWS_SMTP_SECURE ?? process.env.BANDOS_SMTP_SECURE) ===
      'true',
    requireTLS: true,
    auth: { user, pass: password },
  });
  await transporter.sendMail({
    from,
    to,
    subject: `Belmontejo: ${created.length} propuesta${created.length === 1 ? '' : 's'} de noticia para revisar`,
    text: buildNewsNotificationText({
      prUrl,
      branch,
      created,
      rejected,
      warnings,
    }),
    html: buildNewsNotificationHtml({
      prUrl,
      branch,
      created,
      rejected,
      warnings,
    }),
  });
}

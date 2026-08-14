/* eslint-disable no-console */
import 'dotenv/config';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import nodemailer from 'nodemailer';

const execFileAsync = promisify(execFile);

export function buildNotificationText({ commit, files }) {
  const count = files.length;
  const label = count === 1 ? 'bando nuevo' : 'bandos nuevos';
  const list = files.map(file => `- ${file}`).join('\n');

  return `Se han publicado ${count} ${label} en la web del Ayuntamiento de Belmontejo.\n\nCommit: ${commit}\n\nArchivos actualizados:\n${list}`;
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

  const files = await getChangedBandoFiles(commit);
  if (files.length === 0) {
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

  const text = buildNotificationText({ commit, files });
  await transporter.sendMail({
    from: process.env.BANDOS_NOTIFY_FROM,
    to: process.env.BANDOS_NOTIFY_TO,
    subject: `Belmontejo: ${files.length} bando${files.length === 1 ? '' : 's'} publicado${files.length === 1 ? '' : 's'}`,
    text,
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

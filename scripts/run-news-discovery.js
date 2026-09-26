/* eslint-disable no-console */
import 'dotenv/config';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { discoverAndMaterialize, projectRoot } from './news-discovery.js';
import {
  notifyNewsDiscovery,
  notifyNewsFailure,
} from './notify-news-discovery.js';

const execFileAsync = promisify(execFile);
const siteUrl = (
  process.env.NEWS_SITE_URL ?? 'https://ayuntamiento-de-belmontejo.vercel.app'
).replace(/\/$/, '');
const startedAt = Date.now();
const runId = `${new Date(startedAt).toISOString()}-${process.pid}`;
let phase = 'initialization';
let currentBranch = '';
let createdPrUrl = '';
let workerBranchCreated = false;

const workerBranchPattern = /^automation\/news-discovery-\d{4}-\d{2}-\d{2}$/;

export function isWorkerBranch(branch) {
  return workerBranchPattern.test(branch);
}

export function shouldRecoverStaleWorkerBranch(branch, status) {
  return isWorkerBranch(branch) && !status.trim();
}

function emit(event, fields = {}) {
  console.log(
    JSON.stringify({
      at: new Date().toISOString(),
      runId,
      event,
      ...fields,
    })
  );
}

function durationMs() {
  return Date.now() - startedAt;
}

export function formatWorkerError(error) {
  const message = String(
    error instanceof Error ? error.message : error
  ).replace(/\s+/g, ' ');
  if (message.length <= 500) return message;
  return `${message.slice(0, 178)} … ${message.slice(-319)}`;
}

async function getGithubToken() {
  const configuredToken =
    process.env.NEWS_GITHUB_TOKEN ??
    process.env.GH_TOKEN ??
    process.env.GITHUB_TOKEN;
  if (configuredToken) return configuredToken;
  try {
    const { stdout } = await execFileAsync('gh', [
      'auth',
      'token',
      '-h',
      'github.com',
    ]);
    if (stdout.trim()) return stdout.trim();
  } catch {
    // The cron can use an explicit token instead when gh is unavailable.
  }
  return '';
}

async function assertRuntimeConfiguration() {
  const token = await getGithubToken();
  const smtp = {
    host: process.env.NEWS_SMTP_HOST ?? process.env.BANDOS_SMTP_HOST,
    user: process.env.NEWS_SMTP_USER ?? process.env.BANDOS_SMTP_USER,
    password:
      process.env.NEWS_SMTP_PASSWORD ?? process.env.BANDOS_SMTP_PASSWORD,
    from: process.env.NEWS_NOTIFY_FROM ?? process.env.BANDOS_NOTIFY_FROM,
    to: process.env.NEWS_NOTIFY_TO ?? process.env.BANDOS_NOTIFY_TO,
  };
  if (!token)
    throw new Error('Falta NEWS_GITHUB_TOKEN, GH_TOKEN o GITHUB_TOKEN.');
  const missing = Object.entries(smtp)
    .filter(([, value]) => !value)
    .map(([name]) => name);
  if (missing.length) {
    throw new Error(`Falta configuración SMTP: ${missing.join(', ')}`);
  }
}

async function git(args, options = {}) {
  const { stdout } = await execFileAsync('git', args, {
    cwd: projectRoot,
    ...options,
  });
  return stdout.trim();
}

async function command(binary, args) {
  await execFileAsync(binary, args, { cwd: projectRoot, env: process.env });
}

function getBranchName() {
  return `automation/news-discovery-${new Date().toISOString().slice(0, 10)}`;
}

async function prepareRepository({ branch, dryRun }) {
  let checkedOut = await git(['branch', '--show-current']);
  const status = await git(['status', '--porcelain']);

  if (!dryRun && shouldRecoverStaleWorkerBranch(checkedOut, status)) {
    emit('repository-recovery', {
      status: 'switching-to-main',
      branch: checkedOut,
    });
    await git(['switch', 'main']);
    checkedOut = 'main';
  }

  if (!dryRun && checkedOut !== 'main')
    throw new Error('El repositorio no está en main.');
  if (!dryRun && status && checkedOut === 'main')
    throw new Error('El árbol de trabajo no está limpio.');
  if (dryRun) return true;

  phase = 'synchronize-main';
  await git(['fetch', 'origin', 'main']);
  await git(['merge', '--ff-only', 'origin/main']);
  const localBranch = await git(['branch', '--list', branch]);
  const remoteBranch = await execFileAsync(
    'git',
    ['ls-remote', '--heads', 'origin', branch],
    { cwd: projectRoot }
  );
  if (localBranch || remoteBranch.stdout.trim()) {
    emit('completed', {
      status: 'skipped',
      reason: 'duplicate-branch',
      durationMs: durationMs(),
      branch,
    });
    return false;
  }
  return true;
}

async function cleanupWorkerBranch() {
  if (!workerBranchCreated || !currentBranch) return;
  const checkedOut = await git(['branch', '--show-current']);
  if (checkedOut !== currentBranch) return;

  await git(['reset', '--hard']);
  await git(['clean', '-fd']);
  await git(['switch', 'main']);
  await git(['branch', '-D', currentBranch]);
  workerBranchCreated = false;
  currentBranch = '';
  emit('repository-recovery', { status: 'restored-main' });
}

function parseRepository(remote) {
  const match = remote.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/i);
  if (!match)
    throw new Error(`No se pudo interpretar el remoto GitHub: ${remote}`);
  return { owner: match[1], repo: match[2] };
}

async function createPullRequest({ branch, created, rejected, warnings }) {
  const token = await getGithubToken();
  if (!token)
    throw new Error('Falta NEWS_GITHUB_TOKEN, GH_TOKEN o GITHUB_TOKEN.');
  const { owner, repo } = parseRepository(
    await git(['remote', 'get-url', 'origin'])
  );
  const body = [
    '## Descubrimiento diario de noticias',
    '',
    'Propuestas encontradas automáticamente en medios fiables de Cuenca y Castilla-La Mancha.',
    '',
    ...created.map(
      item =>
        `- **${item.title}** — [fuente](${item.sourceUrl}) — Destacada: **${item.featured ? 'sí' : 'no'}**${item.featured ? ` hasta ${item.featuredUntil}` : ` (${item.reason})`}${item.confidence === 'low' ? ' — **requiere revisión editorial**' : ''}`
    ),
    ...(rejected.length
      ? [
          '',
          '### Descartadas',
          ...rejected.map(item => `- ${item.title}: ${item.reason}`),
        ]
      : []),
    ...(warnings.length
      ? ['', '### Avisos', ...warnings.map(item => `- ${item}`)]
      : []),
    '',
    `Generado por scripts/run-news-discovery.js. Sitio: ${siteUrl}`,
  ].join('\n');
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls`,
    {
      method: 'POST',
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${token}`,
        'user-agent': 'ayuntamiento-de-belmontejo-news-discovery',
        'x-github-api-version': '2022-11-28',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        title: 'feat(news): revisar nuevas noticias de Belmontejo',
        head: branch,
        base: 'main',
        body,
      }),
    }
  );
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      `GitHub no pudo crear la PR (${response.status}): ${data.message ?? 'respuesta desconocida'}`
    );
  return { url: data.html_url, body };
}

async function main() {
  const branch = getBranchName();
  const dryRun = process.env.NEWS_DRY_RUN === '1';
  emit('started', { status: 'running', dryRun });

  phase = 'runtime-configuration';
  if (!dryRun) await assertRuntimeConfiguration();

  phase = 'repository-preflight';
  if (!(await prepareRepository({ branch, dryRun }))) return;

  if (!dryRun) {
    await git(['switch', '-c', branch]);
    currentBranch = branch;
    workerBranchCreated = true;
  }
  phase = 'discovery';
  const result = await discoverAndMaterialize({
    materialize: !dryRun,
  });
  if (result.created.length === 0) {
    if (!dryRun) {
      await git(['switch', 'main']);
      await git(['branch', '-D', branch]);
      workerBranchCreated = false;
      currentBranch = '';
    }
    emit('completed', {
      status: 'no-news',
      dryRun,
      durationMs: durationMs(),
      created: 0,
      rejected: result.rejected.length,
      warnings: result.warnings.length,
    });
    return;
  }
  if (dryRun) {
    emit('completed', {
      status: 'dry-run',
      dryRun: true,
      durationMs: durationMs(),
      created: result.created.length,
      rejected: result.rejected.length,
      warnings: result.warnings.length,
    });
    return;
  }

  const files = result.created.flatMap(item => [
    item.file,
    ...(item.imageBaseName
      ? [
          `src/assets/images/noticias/${item.imageBaseName}.jpg`,
          `public/assets/images/noticias/${item.imageBaseName}-800.avif`,
          `public/assets/images/noticias/${item.imageBaseName}-800.webp`,
          `public/assets/images/noticias/${item.imageBaseName}-800.jpg`,
          `public/assets/images/noticias/${item.imageBaseName}-800-thumb.webp`,
        ]
      : []),
  ]);
  phase = 'format';
  await command('pnpm', [
    'exec',
    'prettier',
    '--write',
    '--',
    ...result.created.map(item => item.file),
  ]);
  phase = 'validation';
  await command('pnpm', ['run', 'format']);
  await command('pnpm', ['run', 'lint']);
  await command('pnpm', ['run', 'test:unit']);
  phase = 'build';
  await command('pnpm', ['run', 'build']);
  phase = 'commit';
  await git(['add', '--', ...files]);
  await git(['commit', '-m', 'feat(news): add discovered Belmontejo stories']);
  phase = 'push';
  await git(['push', '--set-upstream', 'origin', branch]);
  phase = 'pull-request';
  const pr = await createPullRequest({ branch, ...result });
  createdPrUrl = pr.url;
  phase = 'notification';
  await notifyNewsDiscovery({ prUrl: pr.url, branch, ...result });
  emit('completed', {
    status: 'pr-created',
    dryRun: false,
    durationMs: durationMs(),
    created: result.created.length,
    rejected: result.rejected.length,
    warnings: result.warnings.length,
    branch,
    prUrl: pr.url,
  });
  await git(['switch', 'main']);
  await git(['branch', '-D', branch]);
  workerBranchCreated = false;
  currentBranch = '';
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    await main();
  } catch (error) {
    const message = formatWorkerError(error);
    const failedBranch = currentBranch;
    try {
      await cleanupWorkerBranch();
    } catch (cleanupError) {
      emit('repository-recovery', {
        status: 'failed',
        error: formatWorkerError(cleanupError),
      });
    }
    emit('failed', {
      status: 'failed',
      durationMs: durationMs(),
      phase,
      error: message,
      ...(failedBranch ? { branch: failedBranch } : {}),
      ...(createdPrUrl ? { prUrl: createdPrUrl } : {}),
    });
    if (process.env.NEWS_DRY_RUN !== '1') {
      try {
        await notifyNewsFailure({
          runId,
          phase,
          error: message,
          durationMs: durationMs(),
          prUrl: createdPrUrl,
        });
        emit('failure-notification', { status: 'sent' });
      } catch (notificationError) {
        emit('failure-notification', {
          status: 'failed',
          error: formatWorkerError(notificationError),
        });
      }
    }
    process.exitCode = 1;
  }
}

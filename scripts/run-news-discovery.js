/* eslint-disable no-console */
import 'dotenv/config';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { discoverAndMaterialize, projectRoot } from './news-discovery.js';
import { notifyNewsDiscovery } from './notify-news-discovery.js';

const execFileAsync = promisify(execFile);
const siteUrl = (
  process.env.NEWS_SITE_URL ?? 'https://ayuntamiento-de-belmontejo.vercel.app'
).replace(/\/$/, '');

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
        `- **${item.title}** — [fuente](${item.sourceUrl})${item.confidence === 'low' ? ' — **requiere revisión editorial**' : ''}`
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
  if (!dryRun) await assertRuntimeConfiguration();
  if ((await git(['branch', '--show-current'])) !== 'main')
    throw new Error('El repositorio no está en main.');
  if (!dryRun && (await git(['status', '--porcelain'])))
    throw new Error('El árbol de trabajo no está limpio.');
  if (!dryRun) {
    await git(['fetch', 'origin', 'main']);
    await git(['merge', '--ff-only', 'origin/main']);
    const localBranch = await git(['branch', '--list', branch]);
    const remoteBranch = await execFileAsync(
      'git',
      ['ls-remote', '--heads', 'origin', branch],
      { cwd: projectRoot }
    );
    if (localBranch || remoteBranch.stdout.trim()) {
      console.log(
        `La ejecución de hoy ya tiene una rama (${branch}); no se crea otra PR.`
      );
      return;
    }
  }

  if (!dryRun) await git(['switch', '-c', branch]);
  const result = await discoverAndMaterialize({
    materialize: !dryRun,
  });
  if (result.created.length === 0) {
    if (!dryRun) {
      await git(['switch', 'main']);
      await git(['branch', '-D', branch]);
    }
    console.log(
      JSON.stringify(
        {
          status: 'no-news',
          rejected: result.rejected,
          warnings: result.warnings,
        },
        null,
        2
      )
    );
    return;
  }
  if (dryRun) {
    console.log(JSON.stringify({ status: 'dry-run', ...result }, null, 2));
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
  await command('pnpm', [
    'exec',
    'prettier',
    '--write',
    '--',
    ...result.created.map(item => item.file),
  ]);
  await command('pnpm', ['run', 'format']);
  await command('pnpm', ['run', 'lint']);
  await command('pnpm', ['run', 'test:unit']);
  await command('pnpm', ['run', 'build']);
  await git(['add', '--', ...files]);
  await git(['commit', '-m', 'feat(news): add discovered Belmontejo stories']);
  await git(['push', '--set-upstream', 'origin', branch]);
  const pr = await createPullRequest({ branch, ...result });
  await notifyNewsDiscovery({ prUrl: pr.url, branch, ...result });
  console.log(`News discovery PR created: ${pr.url}`);
  await git(['switch', 'main']);
}

main().catch(error => {
  console.error(`News discovery failed: ${error.stack ?? error}`);
  process.exitCode = 1;
});

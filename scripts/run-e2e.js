import { spawnSync } from 'node:child_process';
import { e2eGroups } from './e2e-groups.js';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const defaultFixtures = {
  bandos: 'tests/fixtures/bandos',
};
const env = {
  ...process.env,
  OAUTH_GITHUB_CLIENT_ID:
    process.env.OAUTH_GITHUB_CLIENT_ID ?? 'test-client-id',
  OAUTH_GITHUB_CLIENT_SECRET:
    process.env.OAUTH_GITHUB_CLIENT_SECRET ?? 'test-client-secret',
  ASTRO_DEV_TOOLBAR: process.env.ASTRO_DEV_TOOLBAR ?? 'false',
};

function fail(message) {
  // eslint-disable-next-line no-console
  console.error(`[e2e] ${message}`);
  process.exit(1);
}

function resolveGroupSpecs(name, stack = new Set()) {
  const definition = e2eGroups[name];

  if (!definition) {
    fail(`Grupo "${name}" no está definido en scripts/e2e-groups.js`);
  }

  if (stack.has(name)) {
    fail(
      `Referencia circular detectada al resolver el grupo "${name}": ${[
        ...stack,
        name,
      ].join(' -> ')}`
    );
  }

  stack.add(name);
  const specs = [];

  for (const entry of definition) {
    if (entry.startsWith('@')) {
      specs.push(...resolveGroupSpecs(entry.slice(1), stack));
    } else {
      specs.push(entry);
    }
  }

  stack.delete(name);
  return specs;
}

function collectGroupSpecs(groupNames) {
  const collected = new Set();

  for (const name of groupNames) {
    const specs = resolveGroupSpecs(name, new Set());

    for (const spec of specs) {
      collected.add(spec);
    }
  }

  return [...collected];
}

function parseCliArgs(rawArgs) {
  const args = [...rawArgs];
  const doubleDashIndex = args.indexOf('--');
  let manualSpecs = [];
  let cliArgs = args;
  let bandosFixture;

  if (doubleDashIndex !== -1) {
    manualSpecs = args.slice(doubleDashIndex + 1);
    cliArgs = args.slice(0, doubleDashIndex);
  }

  const forwardedArgs = [];
  const groupNames = [];

  for (let i = 0; i < cliArgs.length; i += 1) {
    const arg = cliArgs[i];

    if (arg === '--group') {
      const value = cliArgs[i + 1];
      if (!value) {
        fail('La opción --group requiere un valor');
      }
      groupNames.push(value);
      i += 1;
      continue;
    }

    if (arg.startsWith('--group=')) {
      const value = arg.slice('--group='.length);
      if (!value) {
        fail('La opción --group requiere un valor');
      }
      groupNames.push(value);
      continue;
    }

    forwardedArgs.push(arg);
  }

  return {
    forwardedArgs,
    groupNames,
    manualSpecs,
    bandosFixture,
  };
}

const { forwardedArgs, groupNames, manualSpecs, bandosFixture } = parseCliArgs(
  process.argv.slice(2)
);

let specArgs = manualSpecs;

if (specArgs.length === 0 && groupNames.length > 0) {
  specArgs = collectGroupSpecs(groupNames);
}

const argsText = [...groupNames, ...specArgs, ...manualSpecs, ...forwardedArgs]
  .filter(Boolean)
  .join(' ');
const targetsBandos =
  /bandos/i.test(argsText) ||
  specArgs.some(spec =>
    /pages\.(desktop|mobile)\.visual\.spec\.ts$/.test(spec)
  ) ||
  specArgs.some(spec => /navigation\.flow\.spec\.ts$/.test(spec));

if (targetsBandos) {
  env.BANDOS_CONTENT_BASE = bandosFixture ?? defaultFixtures.bandos;
}

const buildResult = spawnSync(npmCommand, ['run', 'build'], {
  env,
  stdio: 'inherit',
});

if (buildResult.status !== 0) {
  process.exit(buildResult.status ?? 1);
}

const playwrightArgs = ['playwright', 'test', ...forwardedArgs];
if (specArgs.length > 0) {
  playwrightArgs.push('--', ...specArgs);
}

const testResult = spawnSync(npxCommand, playwrightArgs, {
  env,
  stdio: 'inherit',
});

process.exit(testResult.status ?? 1);

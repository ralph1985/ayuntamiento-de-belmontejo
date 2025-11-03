import { spawnSync } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const env = {
  ...process.env,
  OAUTH_GITHUB_CLIENT_ID: process.env.OAUTH_GITHUB_CLIENT_ID ?? 'test-client-id',
  OAUTH_GITHUB_CLIENT_SECRET: process.env.OAUTH_GITHUB_CLIENT_SECRET ?? 'test-client-secret',
};

const buildResult = spawnSync(npmCommand, ['run', 'build'], {
  env,
  stdio: 'inherit',
});

if (buildResult.status !== 0) {
  process.exit(buildResult.status ?? 1);
}

const playwrightArgs = ['playwright', 'test', ...process.argv.slice(2)];
const testResult = spawnSync(npxCommand, playwrightArgs, {
  env,
  stdio: 'inherit',
});

process.exit(testResult.status ?? 1);

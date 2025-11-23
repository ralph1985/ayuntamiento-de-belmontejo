import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173';

const webServer = process.env.PLAYWRIGHT_BASE_URL
  ? undefined
  : {
      command: 'npm run preview -- --host 127.0.0.1 --port 4173',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
    };

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  snapshotPathTemplate:
    '{testDir}/__screenshots__/{projectName}/{testFilePath}/{arg}{ext}',
  timeout: 10 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  retries: 3,
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  workers: 3,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer,
});

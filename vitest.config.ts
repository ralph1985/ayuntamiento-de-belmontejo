import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    exclude: ['tests/e2e/**'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage/unit',
    },
  },
  resolve: {
    alias: {
      '@layouts': `${srcDir}/layouts`,
      '@assets': `${srcDir}/assets`,
      '@data': `${srcDir}/data`,
      '@styles': `${srcDir}/styles`,
      '@components': `${srcDir}/components`,
      '@js': `${srcDir}/js`,
    },
  },
});

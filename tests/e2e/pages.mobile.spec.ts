import { test, expect, devices } from '@playwright/test';
import { visualRoutes } from './routes';
import { acceptCookiesBeforeNavigation, stabilizeVisualFlakes } from './utils';

const mobileDevice = devices['iPhone 13 Pro'];

test.use({
  ...mobileDevice,
  viewport: mobileDevice.viewport,
});

for (const { path, name } of visualRoutes) {
  test.describe(`Página ${path} (móvil)`, () => {
    test(`captura visual estable en modo claro móvil (${path})`, async ({
      page,
    }) => {
      await acceptCookiesBeforeNavigation(page);
      await page.goto(path, { waitUntil: 'networkidle' });
      await stabilizeVisualFlakes(page);
      await expect(page).toHaveScreenshot(`${name}-mobile-light.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test(`captura visual estable en modo oscuro móvil (${path})`, async ({
      page,
    }) => {
      await acceptCookiesBeforeNavigation(page);
      await page.addInitScript(() => {
        window.localStorage.setItem('theme', 'dark');
      });
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.waitForFunction(() =>
        document.body.classList.contains('dark-mode')
      );
      await stabilizeVisualFlakes(page);
      await expect(page).toHaveScreenshot(`${name}-mobile-dark.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });
}

import { test, expect } from '@playwright/test';
import { visualRoutes } from './routes';
import { acceptCookiesBeforeNavigation, stabilizeVisualFlakes } from './utils';

for (const { path, name } of visualRoutes) {
  test.describe(`Página ${path}`, () => {
    test(`captura visual estable en modo claro (${path})`, async ({ page }) => {
      await acceptCookiesBeforeNavigation(page);
      await page.goto(path, { waitUntil: 'networkidle' });
      await stabilizeVisualFlakes(page);
      await expect(page).toHaveScreenshot(`${name}-light.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test(`captura visual estable en modo oscuro (${path})`, async ({
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
      await expect(page).toHaveScreenshot(`${name}-dark.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });
}

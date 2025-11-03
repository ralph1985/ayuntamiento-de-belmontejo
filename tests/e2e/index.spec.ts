import { test, expect } from '@playwright/test';

test.describe('Página de inicio', () => {
  test('captura visual estable en modo claro', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('captura visual estable en modo oscuro', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('theme', 'dark');
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.body.classList.contains('dark-mode'));

    await expect(page).toHaveScreenshot('homepage-dark.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

import { test, expect } from '@playwright/test';

test.describe('Página de inicio', () => {
  test('captura visual estable', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

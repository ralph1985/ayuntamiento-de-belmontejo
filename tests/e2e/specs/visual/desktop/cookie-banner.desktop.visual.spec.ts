import { expect, test } from '@playwright/test';

test.describe('Banner de cookies (desktop)', () => {
  test('mantiene estable la apariencia del banner', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const banner = page.locator('#cookie-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toHaveScreenshot('cookie-banner.png', {
      animations: 'disabled',
    });
  });
});

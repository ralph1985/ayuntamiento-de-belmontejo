import { expect, test, devices } from '@playwright/test';

const mobileDevice = devices['iPhone 13 Pro'];

test.use({
  ...mobileDevice,
  viewport: mobileDevice.viewport,
});

test.describe('Banner de cookies (móvil)', () => {
  test('mantiene estable la apariencia del banner', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const banner = page.locator('#cookie-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toHaveScreenshot('cookie-banner.png', {
      animations: 'disabled',
    });
  });
});

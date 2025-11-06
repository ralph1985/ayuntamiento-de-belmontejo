import { expect, test } from '@playwright/test';

const COOKIE_CONSENT_KEY = 'cookie-consent';
const ANALYTICS_CONSENT_KEY = 'analytics-consent';

test.describe('Gestión de cookies', () => {
  test('muestra el banner en la primera visita y permite aceptar todas', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const banner = page.locator('#cookie-banner');
    await expect(banner).toBeVisible();
    await expect(
      banner.getByRole('heading', { level: 3, name: /Gestión de Cookies/i })
    ).toBeVisible();

    await expect(
      banner.getByRole('button', { name: 'Aceptar todas', exact: true })
    ).toBeVisible();
    await expect(
      banner.getByRole('button', { name: 'Solo necesarias', exact: true })
    ).toBeVisible();
    await expect(
      banner.getByRole('button', { name: 'Configurar', exact: true })
    ).toBeVisible();

    const getLocalStorageValue = (storageKey: string) =>
      page.evaluate((key) => localStorage.getItem(key), storageKey);

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      banner.getByRole('button', { name: 'Aceptar todas', exact: true }).click(),
    ]);

    await expect(page).toHaveURL(/\/$/);

    await expect.poll(async () =>
      getLocalStorageValue(COOKIE_CONSENT_KEY)
    ).toBe('true');
    await expect.poll(async () =>
      getLocalStorageValue(ANALYTICS_CONSENT_KEY)
    ).toBe('true');

    await expect(page.locator('#cookie-banner')).toBeHidden();
    await expect(
      page.locator('#floating-cookie-manager', { hasText: '🍪' })
    ).toBeVisible();
  });

  test('permite cambiar preferencias desde la Política de Cookies', async ({
    page,
  }) => {
    await page.goto('/politica-de-cookies', { waitUntil: 'networkidle' });

    const getLocalStorageValue = (storageKey: string) =>
      page.evaluate((key) => localStorage.getItem(key), storageKey);

    const banner = page.locator('#cookie-banner');
    await expect(banner).toBeVisible();

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      banner
        .getByRole('button', { name: 'Solo necesarias', exact: true })
        .click(),
    ]);

    await expect(page).toHaveURL(/\/politica-de-cookies\/?$/);

    await expect.poll(async () =>
      getLocalStorageValue(COOKIE_CONSENT_KEY)
    ).toBe('true');
    await expect.poll(async () =>
      getLocalStorageValue(ANALYTICS_CONSENT_KEY)
    ).toBe('false');

    await expect(
      page.getByRole('heading', { level: 1, name: /Política de Cookies/i })
    ).toBeVisible();

    const openPolicySettings = page.getByRole('button', {
      name: /Configurar Cookies/i,
      exact: false,
    });
    await openPolicySettings.click();

    const modal = page.locator('#cookie-settings-modal');
    await expect(modal).toBeVisible();

    const analyticsCheckbox = modal.locator('#analytics-cookies');
    await expect(analyticsCheckbox).not.toBeChecked();
    await analyticsCheckbox.check();

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      modal
        .getByRole('button', { name: 'Guardar preferencias', exact: true })
        .click(),
    ]);

    await expect(page).toHaveURL(/\/politica-de-cookies\/?$/);

    await expect.poll(async () =>
      getLocalStorageValue(ANALYTICS_CONSENT_KEY)
    ).toBe('true');

    await expect(page.locator('#cookie-banner')).toBeHidden();

    await page.getByRole('button', { name: /Configurar Cookies/i }).click();
    await expect(page.locator('#cookie-settings-modal')).toBeVisible();
    await expect(page.locator('#analytics-cookies')).toBeChecked();
  });
});

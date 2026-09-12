import { test, expect } from '@playwright/test';

test.describe('Actualidad de Instagram', () => {
  test('muestra tarjetas propias y no depende del embed externo', async ({
    page,
  }) => {
    await page.goto('/instagram', { waitUntil: 'domcontentloaded' });

    await expect(
      page.getByRole('heading', {
        level: 2,
        name: 'Actualidad municipal en Instagram',
      })
    ).toBeVisible();
    await expect(page.locator('.instagram-card')).toHaveCount(10);
    await expect(
      page.getByRole('navigation', { name: 'Navegar por meses' })
    ).toBeVisible();
    await expect(page.locator('.instagram-month')).toHaveCount(1);
    await expect(page.locator('[data-instgrm-permalink]')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /siguiente/i })).toHaveCount(0);
  });

  test('redirige las rutas antiguas del archivo al índice mensual', async ({
    page,
  }) => {
    await page.goto('/instagram/page/2/', { waitUntil: 'domcontentloaded' });

    expect(new globalThis.URL(page.url()).pathname).toBe('/instagram/');
  });

  test('mantiene la selección editorial compacta en la home', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const feed = page.locator('.instagram-feed--home');
    await expect(feed).toBeVisible();
    await expect(feed.locator('.instagram-card')).toHaveCount(3);
    await expect(feed.locator('.instagram-card--featured')).toHaveCount(1);
    await expect(
      feed.getByRole('link', { name: 'Ver toda la actualidad' })
    ).toHaveAttribute('href', '/instagram/');
  });

  test('conserva controles y contenido en móvil', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/instagram', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('.instagram-card').first()).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Seguir en Instagram' })
    ).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Navegar por meses' })
    ).toBeVisible();
  });
});

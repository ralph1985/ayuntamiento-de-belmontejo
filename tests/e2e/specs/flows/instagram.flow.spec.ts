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
    await expect(page.locator('.instagram-card')).toHaveCount(9);
    await expect(page.locator('[data-instgrm-permalink]')).toHaveCount(0);
    await expect(
      page.getByRole('link', { name: /siguiente/i })
    ).toHaveAttribute('href', '/instagram/page/2/');
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
      page.getByRole('navigation', { name: /paginación/i })
    ).toBeVisible();
  });
});

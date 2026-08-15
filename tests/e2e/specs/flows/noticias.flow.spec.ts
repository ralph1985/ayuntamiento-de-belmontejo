import { test, expect } from '@playwright/test';

test.describe('Consulta de noticias', () => {
  test('muestra las noticias por bloques y permite cargar más', async ({
    page,
  }) => {
    await page.goto('/noticias', { waitUntil: 'domcontentloaded' });

    const summary = page.locator('[data-results-summary]');
    await expect(summary).toContainText(
      'Mostrando 8 de 10 noticias publicadas'
    );
    await expect(
      page.locator('[data-archive-result]:not([hidden])')
    ).toHaveCount(8);

    await page.getByRole('button', { name: 'Ver más' }).click();
    await expect(summary).toContainText('10 noticias publicadas');
    await expect(
      page.locator('[data-archive-result]:not([hidden])')
    ).toHaveCount(10);
    await expect(page.getByRole('button', { name: 'Ver más' })).toBeHidden();
  });

  test('filtra por texto y conserva el estado en la URL', async ({ page }) => {
    await page.goto('/noticias', { waitUntil: 'domcontentloaded' });

    await page.getByLabel('Buscar en las noticias').fill('vandalismo');

    await expect(page).toHaveURL(/\/noticias\?q=vandalismo$/);
    await expect(page.locator('[data-results-summary]')).toContainText(
      '1 noticia publicada'
    );
    await expect(
      page.locator('[data-archive-result]:not([hidden])')
    ).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Ver más' })).toBeHidden();
  });
});

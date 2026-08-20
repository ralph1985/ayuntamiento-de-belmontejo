import { test, expect } from '@playwright/test';

test.describe('Consulta de bandos', () => {
  test('filtra por texto, actualiza la URL y permite limpiar', async ({
    page,
  }) => {
    await page.goto('/bandos', { waitUntil: 'domcontentloaded' });

    const search = page.getByLabel('Buscar en los bandos');
    const summary = page.locator('[data-results-summary]');
    const results = page.locator('[data-bandos-result]');
    const visibleResults = page.locator('[data-bandos-result]:not([hidden])');
    const more = page.getByRole('button', { name: 'Ver más' });
    const totalResults = await results.count();

    await expect(summary).toContainText(
      `Mostrando 8 de ${totalResults} bandos`
    );
    await expect(visibleResults).toHaveCount(Math.min(8, totalResults));

    while (await more.isVisible()) {
      const visibleBefore = await visibleResults.count();
      await more.click();
      await expect(visibleResults).toHaveCount(
        Math.min(visibleBefore + 8, totalResults)
      );
    }

    await expect(visibleResults).toHaveCount(totalResults);
    await expect(summary).toHaveText(`${totalResults} bandos publicados`);
    await search.fill('ayuntamiento cerrado');

    await expect(page).toHaveURL(/\/bandos\?q=ayuntamiento\+cerrado$/);
    await expect(summary).toContainText('1 bando publicado');
    await expect(visibleResults).toHaveCount(1);
    await expect(more).toBeHidden();

    await page.getByRole('button', { name: 'Limpiar filtros' }).click();
    await expect(page).toHaveURL(/\/bandos\/?$/);
    await expect(summary).toContainText(
      `Mostrando 8 de ${totalResults} bandos`
    );
  });

  test('oculta el filtro de categoría único y muestra el estado vacío', async ({
    page,
  }) => {
    await page.goto('/bandos', { waitUntil: 'domcontentloaded' });

    await expect(page.getByLabel('Filtrar por categoría')).toBeHidden();

    await page.getByLabel('Buscar en los bandos').fill('no existe este aviso');
    await expect(page.locator('[data-bandos-empty]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ver más' })).toBeHidden();
    await expect(page.locator('[data-results-summary]')).toContainText(
      '0 bandos publicados'
    );
  });

  test('se adapta a móvil sin perder los controles', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/bandos', { waitUntil: 'domcontentloaded' });

    await expect(page.getByLabel('Buscar en los bandos')).toBeVisible();
    await expect(page.getByLabel('Filtrar por categoría')).toBeHidden();
    await expect(page.locator('.bandos-filters__clear')).toBeVisible();
  });
});

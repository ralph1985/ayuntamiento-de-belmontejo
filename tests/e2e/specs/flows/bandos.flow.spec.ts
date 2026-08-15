import { test, expect } from '@playwright/test';

test.describe('Consulta de bandos', () => {
  test('filtra por texto, actualiza la URL y permite limpiar', async ({
    page,
  }) => {
    await page.goto('/bandos', { waitUntil: 'domcontentloaded' });

    const search = page.getByLabel('Buscar en los bandos');
    const summary = page.locator('[data-results-summary]');

    await expect(summary).toContainText('44 bandos publicados');
    await search.fill('ayuntamiento cerrado');

    await expect(page).toHaveURL(/\/bandos\?q=ayuntamiento\+cerrado$/);
    await expect(summary).toContainText('de 44 bandos');
    await expect(
      page.locator('[data-bandos-result]:not([hidden])')
    ).toHaveCount(5);

    await page.getByRole('button', { name: 'Limpiar filtros' }).click();
    await expect(page).toHaveURL(/\/bandos\/?$/);
    await expect(summary).toContainText('44 bandos publicados');
  });

  test('combina categoría y búsqueda y muestra el estado vacío', async ({
    page,
  }) => {
    await page.goto('/bandos', { waitUntil: 'domcontentloaded' });

    await page.getByLabel('Filtrar por categoría').selectOption('Info General');
    await expect(page).toHaveURL(/categoria=Info\+General/);
    await expect(
      page.locator('[data-bandos-result]:not([hidden])')
    ).toHaveCount(44);

    await page.getByLabel('Buscar en los bandos').fill('no existe este aviso');
    await expect(page.locator('[data-bandos-empty]')).toBeVisible();
    await expect(page.locator('[data-results-summary]')).toContainText(
      '0 de 44 bandos'
    );
  });

  test('se adapta a móvil sin perder los controles', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/bandos', { waitUntil: 'domcontentloaded' });

    await expect(page.getByLabel('Buscar en los bandos')).toBeVisible();
    await expect(page.getByLabel('Filtrar por categoría')).toBeVisible();
    await expect(page.locator('.bandos-filters__clear')).toBeVisible();
  });
});

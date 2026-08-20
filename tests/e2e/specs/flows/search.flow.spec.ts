import { expect, test } from '@playwright/test';

const escapeRegex = (value: string) =>
  value.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');

test.describe('Buscador municipal', () => {
  test('permite buscar, navegar y conservar resultados', async ({ page }) => {
    await page.goto('/buscar', { waitUntil: 'networkidle' });

    const searchInput = page.getByPlaceholder('Buscar en noticias y bandos...');
    await searchInput.click();
    await searchInput.fill('vandalismo');

    const resultsLocator = page.locator('.search-result-item');

    await page.waitForFunction(() => {
      return document.querySelectorAll('.search-result-item').length > 0;
    });

    const firstResult = resultsLocator.first();
    await expect(firstResult).toBeVisible();
    await expect(firstResult).toContainText(/vandalismo/i);

    const targetPath = await firstResult.getAttribute('href');
    if (!targetPath) {
      throw new Error('No se pudo obtener la ruta de navegación del resultado');
    }

    await Promise.all([
      page.waitForURL(new RegExp(`${escapeRegex(targetPath)}\\/?$`)),
      firstResult.click(),
    ]);

    await expect(page).toHaveURL(new RegExp(`${escapeRegex(targetPath)}\\/?$`));
    await expect(
      page.getByRole('heading', { level: 1, name: /vandalismo/i })
    ).toBeVisible();

    await page.goBack({ waitUntil: 'commit' });
    await expect(page).toHaveURL(/\/buscar\/?\?q=vandalismo$/);
    await page.waitForFunction(() => {
      return document.querySelectorAll('.search-result-item').length > 0;
    });

    await expect(searchInput).toHaveValue('vandalismo');
    const restoredFirstResult = resultsLocator.first();
    await expect(restoredFirstResult).toBeVisible();
    await expect(restoredFirstResult).toContainText(/vandalismo/i);

    const restoredHref = await restoredFirstResult.getAttribute('href');
    if (restoredHref !== targetPath) {
      throw new Error('El resultado restaurado no coincide con el inicial');
    }
  });
});

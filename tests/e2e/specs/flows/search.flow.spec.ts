import { expect, test } from '@playwright/test';

const escapeRegex = (value: string) =>
  value.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');

test.describe('Buscador municipal', () => {
  test('permite buscar, navegar y conservar resultados', async ({ page }) => {
    await page.goto('/buscar', { waitUntil: 'domcontentloaded' });

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

    const onclickValue = await firstResult.getAttribute('onclick');
    if (!onclickValue) {
      throw new Error('No se pudo obtener la ruta de navegación del resultado');
    }

    const targetMatch = new RegExp(/'([^']+)'/).exec(onclickValue);
    if (!targetMatch?.[1]) {
      throw new Error(
        'No se pudo interpretar la ruta de navegación del resultado'
      );
    }

    const targetPath = targetMatch[1];

    await Promise.all([
      page.waitForURL(new RegExp(`${escapeRegex(targetPath)}\\/?$`)),
      firstResult.click(),
    ]);

    await expect(page).toHaveURL(new RegExp(`${escapeRegex(targetPath)}\\/?$`));
    await expect(
      page.getByRole('heading', { level: 1, name: /vandalismo/i })
    ).toBeVisible();

    await page.goBack();
    await page.waitForURL(/\/buscar\/?$/);
    await page.waitForFunction(() => {
      return document.querySelectorAll('.search-result-item').length > 0;
    });

    await expect(searchInput).toHaveValue('vandalismo');
    const restoredFirstResult = resultsLocator.first();
    await expect(restoredFirstResult).toBeVisible();
    await expect(restoredFirstResult).toContainText(/vandalismo/i);

    const restoredOnclick = await restoredFirstResult.getAttribute('onclick');
    if (restoredOnclick !== onclickValue) {
      throw new Error('El resultado restaurado no coincide con el inicial');
    }
  });
});

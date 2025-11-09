import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { URL } from 'node:url';
import {
  acceptCookiesBeforeNavigation,
  stabilizeVisualFlakes,
} from '../../../support/browser-helpers';

const SEARCH_QUERY = 'agua';

function waitForSearchData(page: Page) {
  return page.waitForResponse(response => {
    try {
      const url = new URL(response.url());
      return url.pathname.endsWith('/api/search-data.json') && response.ok();
    } catch {
      return false;
    }
  });
}

async function showSearchResults(page: Page) {
  const searchInput = page.getByPlaceholder('Buscar en noticias y bandos...');

  await searchInput.click();
  await searchInput.fill(SEARCH_QUERY);

  await page.waitForFunction(() => {
    const results = document.querySelectorAll('.search-result-item');
    return results.length > 0;
  });
}

test.describe('Buscador con resultados visibles', () => {
  test('captura visual modo claro con resultados', async ({ page }) => {
    await acceptCookiesBeforeNavigation(page);
    const searchDataResponse = waitForSearchData(page);
    await page.goto('/buscar', { waitUntil: 'networkidle' });
    await searchDataResponse;

    await showSearchResults(page);
    await stabilizeVisualFlakes(page, '/buscar');

    await expect(page).toHaveScreenshot('buscar-resultados-light.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('captura visual modo oscuro con resultados', async ({ page }) => {
    await acceptCookiesBeforeNavigation(page);
    await page.addInitScript(() => {
      window.localStorage.setItem('theme', 'dark');
    });

    const searchDataResponse = waitForSearchData(page);
    await page.goto('/buscar', { waitUntil: 'networkidle' });
    await page.waitForFunction(() =>
      document.body.classList.contains('dark-mode')
    );
    await searchDataResponse;

    await showSearchResults(page);
    await stabilizeVisualFlakes(page, '/buscar');

    await expect(page).toHaveScreenshot('buscar-resultados-dark.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

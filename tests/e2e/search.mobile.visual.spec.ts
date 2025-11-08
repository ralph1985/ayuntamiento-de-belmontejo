import { expect, test, devices, type Page } from '@playwright/test';
import { URL } from 'node:url';
import { acceptCookiesBeforeNavigation, stabilizeVisualFlakes } from './utils';

const mobileDevice = devices['iPhone 13 Pro'];
const SEARCH_QUERY = 'agua';

test.use({
  ...mobileDevice,
  viewport: mobileDevice.viewport,
});

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

test.describe('Buscador móvil con resultados visibles', () => {
  test('captura visual móvil en modo claro con resultados', async ({
    page,
  }) => {
    await acceptCookiesBeforeNavigation(page);
    const searchDataResponse = waitForSearchData(page);
    await page.goto('/buscar', { waitUntil: 'networkidle' });
    await searchDataResponse;

    await showSearchResults(page);
    await stabilizeVisualFlakes(page, '/buscar');

    await expect(page).toHaveScreenshot('buscar-resultados-mobile-light.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('captura visual móvil en modo oscuro con resultados', async ({
    page,
  }) => {
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

    await expect(page).toHaveScreenshot('buscar-resultados-mobile-dark.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

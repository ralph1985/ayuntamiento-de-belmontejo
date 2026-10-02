import { test, expect } from '@playwright/test';

test.describe('Contenido de Sobre el pueblo', () => {
  test('muestra el vídeo histórico de Belmontejo', async ({ page }) => {
    await page.route('https://www.youtube-nocookie.com/**', route =>
      route.abort()
    );

    await page.goto('/sobre-el-pueblo', { waitUntil: 'domcontentloaded' });

    const memorySection = page.locator('#memoria-local');
    const video = memorySection.locator('iframe');

    await expect(
      memorySection.getByRole('heading', {
        level: 2,
        name: 'Belmontejo, 1970–1980',
      })
    ).toBeVisible();
    await expect(video).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/TBU_F7SgD80?rel=0'
    );
    await expect(video).toHaveAttribute(
      'title',
      'Belmontejo entre 1970 y 1980'
    );
    await expect(page.locator('#vista-aerea iframe')).toHaveCount(1);
  });
});

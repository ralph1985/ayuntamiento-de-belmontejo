import { test, expect } from '@playwright/test';

const routes = [
  { path: '/sobre-el-pueblo', name: 'about' },
  { path: '/testimonios', name: 'testimonials' },
  { path: '/contacto', name: 'contact' },
  { path: '/buscar', name: 'search' },
  { path: '/politica-de-cookies', name: 'cookies' },
  { path: '/proyectos', name: 'projects' },
  { path: '/proyectos/proyecto-1', name: 'project-1' },
  { path: '/proyectos/proyecto-2', name: 'project-2' },
  { path: '/noticias', name: 'news' },
  { path: '/noticias/ayudas-despoblacion-cuenca', name: 'news-detail' },
  { path: '/bandos', name: 'bandos' },
  {
    path: '/bandos/1386492-uso-de-las-fuentes-del-parque-y-fronton',
    name: 'bandos-detail',
  },
];

for (const { path, name } of routes) {
  test.describe(`Página ${path}`, () => {
    test(`captura visual estable en modo claro (${path})`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      await expect(page).toHaveScreenshot(`${name}-light.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test(`captura visual estable en modo oscuro (${path})`, async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.setItem('theme', 'dark');
      });
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.waitForFunction(() =>
        document.body.classList.contains('dark-mode')
      );
      await expect(page).toHaveScreenshot(`${name}-dark.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });
}

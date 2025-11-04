import { test, expect } from '@playwright/test';

const routes = [
  { path: '/', name: 'inicio' },
  { path: '/sobre-el-pueblo', name: 'sobre-el-pueblo' },
  { path: '/contacto', name: 'contacto' },
  { path: '/noticias', name: 'noticias' },
  { path: '/noticias/ayudas-despoblacion-cuenca', name: 'noticias-detalle' },
  { path: '/bandos', name: 'bandos' },
  {
    path: '/bandos/1386492-uso-de-las-fuentes-del-parque-y-fronton',
    name: 'bandos-detalle',
  },
  { path: '/proyectos', name: 'proyectos' },
  { path: '/proyectos/proyecto-1', name: 'proyecto-1' },
  { path: '/proyectos/proyecto-2', name: 'proyecto-2' },
  { path: '/testimonios', name: 'testimonios' },
  { path: '/buscar', name: 'buscar' },
  { path: '/politica-de-cookies', name: 'politica-de-cookies' },
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

    test(`captura visual estable en modo oscuro (${path})`, async ({
      page,
    }) => {
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

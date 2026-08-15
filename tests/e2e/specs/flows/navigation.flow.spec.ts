import { test, expect } from '@playwright/test';

type NavigationScenario = {
  label: string;
  expectedPath: string;
  expectedHeading: RegExp;
  startPath?: string;
};

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const navigationScenarios: NavigationScenario[] = [
  {
    label: 'Inicio',
    expectedPath: '/',
    expectedHeading: /La vida del pueblo, cerca de ti/i,
    startPath: '/sobre-el-pueblo',
  },
  {
    label: 'Sobre el pueblo',
    expectedPath: '/sobre-el-pueblo',
    expectedHeading: /Sobre Belmontejo/i,
  },
  {
    label: 'Noticias',
    expectedPath: '/noticias',
    expectedHeading: /Noticias/i,
  },
  {
    label: 'Bandos',
    expectedPath: '/bandos',
    expectedHeading: /Bandos/i,
  },
  {
    label: 'Camping rural',
    expectedPath: '/proyectos/proyecto-1',
    expectedHeading: /Camping rural sostenible/i,
  },
  {
    label: 'Pista de pádel',
    expectedPath: '/proyectos/proyecto-2',
    expectedHeading: /Pista de pádel/i,
  },
  {
    label: 'Buscador',
    expectedPath: '/buscar',
    expectedHeading: /Buscador/i,
  },
];

test.describe('Navegación principal', () => {
  for (const scenario of navigationScenarios) {
    test(`permite acceder a ${scenario.label}`, async ({ page }) => {
      const startPath = scenario.startPath ?? '/';
      await page.goto(startPath, { waitUntil: 'domcontentloaded' });

      const navigation = page.locator('#cs-navigation').getByRole('navigation');

      await navigation.getByRole('button', { name: /menú/i }).click();

      await navigation
        .getByRole('link', { name: scenario.label, exact: true })
        .click();

      await expect(page).toHaveURL(
        new RegExp(`${escapeRegex(scenario.expectedPath)}\\/?$`)
      );
      await expect(
        page.getByRole('heading', { level: 1, name: scenario.expectedHeading })
      ).toBeVisible();
    });
  }
});

test.describe('Navegación interna de contenido', () => {
  test('el héroe enlaza con Sobre el pueblo y Contacto', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const hero = page.locator('#hero');

    await Promise.all([
      page.waitForURL(/\/sobre-el-pueblo\/?$/, {
        waitUntil: 'domcontentloaded',
      }),
      hero.getByRole('link', { name: 'Conoce el pueblo' }).click(),
    ]);
    await expect(
      page.getByRole('heading', { level: 1, name: /Sobre Belmontejo/i })
    ).toBeVisible();

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await Promise.all([
      page.waitForURL(/\/contacto\/?$/, { waitUntil: 'domcontentloaded' }),
      hero.getByRole('link', { name: 'Contactar' }).click(),
    ]);
    await expect(
      page.getByRole('heading', { level: 1, name: /Contacto/i })
    ).toBeVisible();
  });

  test('una noticia se puede abrir desde el listado', async ({ page }) => {
    await page.goto('/noticias', { waitUntil: 'domcontentloaded' });

    const firstArticle = page.locator('article.recent-articles').first();
    const articleTitle = (
      await firstArticle.getByRole('heading', { level: 2 }).innerText()
    ).trim();

    const newsLink = firstArticle.getByRole('link', {
      name: 'Continuar leyendo',
      exact: true,
    });
    const newsSlug = (await newsLink.getAttribute('href')) ?? '';
    const newsPath = newsSlug.startsWith('/')
      ? newsSlug
      : `/noticias/${newsSlug.replace(/^noticias\//, '')}`;

    await Promise.all([
      page.waitForURL(new RegExp(`${escapeRegex(newsPath)}\\/?$`), {
        waitUntil: 'domcontentloaded',
      }),
      newsLink.click(),
    ]);

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: new RegExp(`^${escapeRegex(articleTitle)}$`, 'i'),
      })
    ).toBeVisible();
  });

  test('un bando se puede abrir desde el listado', async ({ page }) => {
    await page.goto('/bandos', { waitUntil: 'domcontentloaded' });

    const firstBando = page.locator('article.recent-articles').first();
    const bandoTitle = (
      await firstBando.getByRole('heading', { level: 2 }).innerText()
    ).trim();

    const bandoLink = firstBando.getByRole('link', {
      name: 'Leer bando',
      exact: true,
    });
    const bandoSlug = (await bandoLink.getAttribute('href')) ?? '';
    const bandoPath = bandoSlug.startsWith('/')
      ? bandoSlug
      : `/bandos/${bandoSlug.replace(/^bandos\//, '')}`;

    await Promise.all([
      page.waitForURL(new RegExp(`${escapeRegex(bandoPath)}\\/?$`), {
        waitUntil: 'domcontentloaded',
      }),
      bandoLink.click(),
    ]);

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: new RegExp(`^${escapeRegex(bandoTitle)}$`, 'i'),
      })
    ).toBeVisible();
  });

  test('el pie incluye acceso a la Política de Privacidad', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const footer = page.getByRole('contentinfo');
    await Promise.all([
      page.waitForURL(/\/politica-de-privacidad\/?$/, {
        waitUntil: 'domcontentloaded',
      }),
      footer
        .getByRole('link', { name: 'Política de Privacidad', exact: true })
        .click(),
    ]);

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /política de privacidad/i,
      })
    ).toBeVisible();
  });
});

test.describe('Cabecera móvil y preferencias', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('abre y cierra el menú móvil con estados accesibles', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const header = page.locator('#cs-navigation');
    const menuToggle = page.locator('#mobile-menu-toggle');

    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
    await menuToggle.click();
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(menuToggle).toHaveAccessibleName('Cerrar menú de navegación');
    await expect(header).toHaveClass(/cs-active/);

    await page.keyboard.press('Escape');
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(header).not.toHaveClass(/cs-active/);
  });

  test('permite abrir el desplegable y cambiar el modo de color', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.locator('#mobile-menu-toggle').click();

    const menuToggle = page.getByRole('button', { name: /abrir menú/i });
    await menuToggle.click();
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(
      page.getByRole('heading', { name: 'Explora el sitio' })
    ).toBeVisible();

    const themeToggle = page.locator('#dark-mode-toggle');
    await expect(themeToggle).toHaveAccessibleName('Activar modo oscuro');
    await themeToggle.click();
    await expect(page.locator('body')).toHaveClass(/dark-mode/);
    await expect(themeToggle).toHaveAccessibleName('Activar modo claro');
  });
});

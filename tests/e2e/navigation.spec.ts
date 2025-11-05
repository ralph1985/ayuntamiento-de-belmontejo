import { test, expect } from '@playwright/test';

type NavigationScenario = {
  label: string;
  expectedPath: string;
  expectedHeading: RegExp;
  startPath?: string;
  parentLabel?: string;
};

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const navigationScenarios: NavigationScenario[] = [
  {
    label: 'Inicio',
    expectedPath: '/',
    expectedHeading: /Belmontejo, esencia de la Mancha conquense/i,
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
    label: 'Proyecto 1',
    expectedPath: '/proyectos/proyecto-1',
    expectedHeading: /Proyecto 1/i,
    parentLabel: 'Proyectos',
  },
  {
    label: 'Proyecto 2',
    expectedPath: '/proyectos/proyecto-2',
    expectedHeading: /Proyecto 2/i,
    parentLabel: 'Proyectos',
  },
  {
    label: 'Testimonios',
    expectedPath: '/testimonios',
    expectedHeading: /Testimonios/i,
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
      await page.goto(startPath);

      const navigation = page.locator('#cs-navigation').getByRole('navigation');

      if (scenario.parentLabel) {
        const dropdownButton = navigation.getByRole('button', {
          name: scenario.parentLabel,
          exact: true,
        });

        await dropdownButton.focus();
        await page.keyboard.press('Enter');
        await expect(dropdownButton).toHaveAttribute('aria-expanded', 'true');

        await navigation
          .getByRole('link', { name: scenario.label, exact: true })
          .click();
      } else {
        await navigation
          .getByRole('link', { name: scenario.label, exact: true })
          .click();
      }

      await page.waitForLoadState('networkidle');

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
    await page.goto('/');

    const hero = page.locator('#hero');

    await Promise.all([
      page.waitForURL(/\/sobre-el-pueblo\/?$/),
      hero.getByRole('link', { name: 'Descubre más' }).click(),
    ]);
    await expect(
      page.getByRole('heading', { level: 1, name: /Sobre Belmontejo/i })
    ).toBeVisible();

    await page.goto('/');
    await Promise.all([
      page.waitForURL(/\/contacto\/?$/),
      hero.getByRole('link', { name: 'Contactar' }).click(),
    ]);
    await expect(
      page.getByRole('heading', { level: 1, name: /Contacto/i })
    ).toBeVisible();
  });

  test('una noticia se puede abrir desde el listado', async ({ page }) => {
    await page.goto('/noticias');

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
      page.waitForURL(new RegExp(`${escapeRegex(newsPath)}\\/?$`)),
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
    await page.goto('/bandos');

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
      page.waitForURL(new RegExp(`${escapeRegex(bandoPath)}\\/?$`)),
      bandoLink.click(),
    ]);

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: new RegExp(`^${escapeRegex(bandoTitle)}$`, 'i'),
      })
    ).toBeVisible();
  });
});

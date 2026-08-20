import { test, expect, type Page } from '@playwright/test';
import { visualRoutes } from '../../support/routes';

type Geometry = {
  key: string;
  display: string;
  visibility: string;
  opacity: string;
  width: number;
  height: number;
  margin: string;
  padding: string;
  gap: string;
};

async function waitForPageInitialization(page: Page, path: string) {
  if (path === '/noticias' || path === '/bandos') {
    await page.locator('[data-archive-filters]').waitFor({ state: 'attached' });
    await expect(page.locator('[data-archive-filters]')).toHaveAttribute(
      'data-initialized',
      'true'
    );
  }

  await page.evaluate(() => document.fonts.ready);

  await page
    .waitForFunction(
      () =>
        [...document.querySelectorAll('pm-weather')].every(element => {
          const text = element.shadowRoot?.textContent ?? '';
          return Boolean(element.shadowRoot) && !text.includes('Cargando');
        }),
      undefined,
      { timeout: 5_000 }
    )
    .catch(() => undefined);

  await page.waitForTimeout(150);
}

async function captureGeometry(page: Page): Promise<Geometry[]> {
  return page
    .locator('header, main > :not(script), footer')
    .evaluateAll(nodes =>
      nodes.map((node, index) => {
        const element = node;
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return {
          key: element.id || `${element.tagName.toLowerCase()}-${index}`,
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          width: Math.round(rect.width * 10) / 10,
          height: Math.round(rect.height * 10) / 10,
          margin: style.margin,
          padding: style.padding,
          gap: style.gap,
        };
      })
    );
}

async function verifyThemeParity(page: Page, path: string) {
  await page.addInitScript(() => localStorage.setItem('theme', 'light'));
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await waitForPageInitialization(page, path);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const light = await captureGeometry(page);

  await page.locator('#dark-mode-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('body')).toHaveClass(/dark-mode/);
  await page.waitForTimeout(250);
  const dark = await captureGeometry(page);

  expect(dark.map(item => item.key)).toEqual(light.map(item => item.key));
  for (const [index, lightItem] of light.entries()) {
    const darkItem = dark[index];
    expect(darkItem.display, `${path}: display de ${lightItem.key}`).toBe(
      lightItem.display
    );
    expect(darkItem.visibility, `${path}: visibility de ${lightItem.key}`).toBe(
      lightItem.visibility
    );
    expect(darkItem.opacity, `${path}: opacity de ${lightItem.key}`).toBe(
      lightItem.opacity
    );
    expect(darkItem.margin, `${path}: margin de ${lightItem.key}`).toBe(
      lightItem.margin
    );
    expect(darkItem.padding, `${path}: padding de ${lightItem.key}`).toBe(
      lightItem.padding
    );
    expect(darkItem.gap, `${path}: gap de ${lightItem.key}`).toBe(
      lightItem.gap
    );
    expect(
      Math.abs(darkItem.width - lightItem.width),
      `${path}: ancho de ${lightItem.key}`
    ).toBeLessThanOrEqual(0.5);
    expect(
      Math.abs(darkItem.height - lightItem.height),
      `${path}: alto de ${lightItem.key}`
    ).toBeLessThanOrEqual(0.5);
  }
}

for (const viewport of [
  { name: 'escritorio', width: 1440, height: 1000 },
  { name: 'móvil', width: 390, height: 844 },
]) {
  test.describe(`Paridad de tema en ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const { path } of visualRoutes) {
      test(`${path} conserva su geometría`, async ({ page }) => {
        await verifyThemeParity(page, path);
      });
    }
  });
}

test.describe('Preferencia y persistencia del tema', () => {
  test('respeta la preferencia oscura del sistema sin selección guardada', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('body')).toHaveClass(/dark-mode/);
    await expect(page.locator('#dark-mode-toggle')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBeNull();
  });

  test('aplica el tema guardado antes de construir el body y lo conserva', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.goto('/contacto', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('body')).toHaveClass(/dark-mode/);
  });

  test('los pares semánticos de color alcanzan el contraste previsto', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'light'));
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    for (const theme of ['light', 'dark'] as const) {
      await page.evaluate(selectedTheme => {
        window.__applyMunicipalTheme?.(selectedTheme);
      }, theme);

      const ratios = await page.evaluate(() => {
        const rootStyle = window.getComputedStyle(document.documentElement);
        const luminance = (hex: string) => {
          const channels = hex
            .trim()
            .match(/[a-f\d]{2}/gi)
            ?.map(value => Number.parseInt(value, 16) / 255);
          if (!channels || channels.length !== 3) return 0;
          const [red, green, blue] = channels.map(value =>
            value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
          );
          return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
        };
        const ratio = (foreground: string, background: string) => {
          const light = Math.max(luminance(foreground), luminance(background));
          const dark = Math.min(luminance(foreground), luminance(background));
          return (light + 0.05) / (dark + 0.05);
        };
        const token = (name: string) => rootStyle.getPropertyValue(name).trim();

        return {
          body: ratio(token('--color-text-muted'), token('--color-bg')),
          heading: ratio(token('--color-text'), token('--color-bg')),
          link: ratio(token('--color-link'), token('--color-bg')),
          action: ratio(token('--color-on-action'), token('--color-action')),
          accent: ratio(token('--color-on-accent'), token('--color-accent')),
        };
      });

      expect(ratios.heading, `${theme}: titulares AAA`).toBeGreaterThanOrEqual(
        7
      );
      expect(ratios.body, `${theme}: cuerpo AAA`).toBeGreaterThanOrEqual(7);
      expect(ratios.link, `${theme}: enlaces AA`).toBeGreaterThanOrEqual(4.5);
      expect(ratios.action, `${theme}: botones AA`).toBeGreaterThanOrEqual(4.5);
      expect(ratios.accent, `${theme}: acento AA`).toBeGreaterThanOrEqual(4.5);
    }
  });
});

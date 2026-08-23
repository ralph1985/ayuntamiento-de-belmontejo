import { test, expect } from '@playwright/test';
import {
  acceptCookiesBeforeNavigation,
  stabilizeVisualFlakes,
} from '../../support/browser-helpers';

test.describe('FAQ accordion interactions', () => {
  test('permite abrir y cerrar preguntas en la home', async ({ page }) => {
    await acceptCookiesBeforeNavigation(page);
    await page.goto('/', { waitUntil: 'networkidle' });
    await stabilizeVisualFlakes(page, '/');

    const faqGroup = page.locator('#faq-home .cs-faq-group');
    await expect(faqGroup).toBeVisible();

    const faqItems = faqGroup.locator('.cs-faq-item');
    const firstItem = faqItems.first();
    const firstButton = firstItem.locator('.cs-button');
    const firstAnswer = firstItem.locator('.cs-item-text');

    await expect(firstItem).toHaveClass(/active/);
    await expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    await expect(firstButton).toHaveAttribute(
      'aria-controls',
      await firstAnswer.getAttribute('id')
    );
    await expect(firstAnswer).not.toHaveAttribute('hidden');
    await expect(firstAnswer).toHaveCSS('opacity', '1');

    await firstButton.click();
    await expect(firstItem).not.toHaveClass(/active/);
    await expect(firstButton).toHaveAttribute('aria-expanded', 'false');
    await expect(firstAnswer).toHaveAttribute('hidden', '');
    await expect(firstAnswer).toHaveCSS('opacity', '0');

    const secondItem = faqItems.nth(1);
    const secondButton = secondItem.locator('.cs-button');
    const secondAnswer = secondItem.locator('.cs-item-text');

    await secondButton.click();
    await expect(secondItem).toHaveClass(/active/);
    await expect(secondButton).toHaveAttribute('aria-expanded', 'true');
    await expect(secondAnswer).not.toHaveAttribute('hidden');
    await expect(secondAnswer).toHaveCSS('opacity', '1');

    await firstButton.click();
    await expect(firstItem).toHaveClass(/active/);
    await expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    await expect(firstAnswer).not.toHaveAttribute('hidden');
    await expect(firstAnswer).toHaveCSS('opacity', '1');
  });

  test('mantiene una instancia aislada en Sobre el pueblo', async ({
    page,
  }) => {
    await page.goto('/sobre-el-pueblo', { waitUntil: 'domcontentloaded' });

    const faqSection = page.locator('#faq-about');
    await expect(faqSection).toBeVisible();
    await expect(faqSection.locator('.cs-faq-item')).toHaveCount(8);
    await expect(page.locator('#faq-home')).toHaveCount(0);
  });
});

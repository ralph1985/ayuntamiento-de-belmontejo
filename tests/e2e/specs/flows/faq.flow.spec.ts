import { test, expect } from '@playwright/test';
import {
  acceptCookiesBeforeNavigation,
  stabilizeVisualFlakes,
} from '../../support/browser-helpers';

test.describe('FAQ accordion interactions', () => {
  test('permite abrir y cerrar preguntas en la home', async ({ page }) => {
    await acceptCookiesBeforeNavigation(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await stabilizeVisualFlakes(page, '/');

    const faqGroup = page.locator('#faq-1741 .cs-faq-group');
    await expect(faqGroup).toBeVisible();

    const faqItems = faqGroup.locator('.cs-faq-item');
    const firstItem = faqItems.first();
    const firstButton = firstItem.locator('.cs-button');
    const firstAnswer = firstItem.locator('.cs-item-text');

    await expect(firstItem).toHaveClass(/active/);
    await expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    await expect(firstAnswer).toHaveCSS('opacity', '1');

    await firstButton.click();
    await expect(firstItem).not.toHaveClass(/active/);
    await expect(firstButton).toHaveAttribute('aria-expanded', 'false');
    await expect(firstAnswer).toHaveCSS('opacity', '0');

    const secondItem = faqItems.nth(1);
    const secondButton = secondItem.locator('.cs-button');
    const secondAnswer = secondItem.locator('.cs-item-text');

    await secondButton.click();
    await expect(secondItem).toHaveClass(/active/);
    await expect(secondButton).toHaveAttribute('aria-expanded', 'true');
    await expect(secondAnswer).toHaveCSS('opacity', '1');

    await firstButton.click();
    await expect(firstItem).toHaveClass(/active/);
    await expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    await expect(firstAnswer).toHaveCSS('opacity', '1');
  });
});

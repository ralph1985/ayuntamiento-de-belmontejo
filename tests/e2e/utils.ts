import type { Page } from '@playwright/test';

const COOKIE_CONSENT_KEY = 'cookie-consent';
const ANALYTICS_CONSENT_KEY = 'analytics-consent';
const STABLE_VERSION = 'v0.0.0';
const COOKIE_BANNER_ID = 'cookie-banner';

export async function acceptCookiesBeforeNavigation(page: Page) {
  await page.addInitScript(
    ({ consentKey, analyticsKey }) => {
      window.localStorage.setItem(consentKey, 'true');
      window.localStorage.setItem(analyticsKey, 'true');
    },
    {
      consentKey: COOKIE_CONSENT_KEY,
      analyticsKey: ANALYTICS_CONSENT_KEY,
    }
  );
}

export async function stabilizeFooterVersion(page: Page) {
  await page.evaluate(
    ({ versionText }) => {
      const versionElement = document.querySelector('.copyright-version');

      if (!versionElement) {
        return;
      }

      const originalText = versionElement.textContent ?? '';
      const updatedText = originalText.replace(/v[^\s]+/g, versionText);

      if (updatedText !== originalText) {
        versionElement.textContent = updatedText;
      }
    },
    { versionText: STABLE_VERSION }
  );
}

export async function ensureCookieBannerHidden(page: Page) {
  await page.evaluate(
    ({ bannerId }) => {
      const banner = document.getElementById(bannerId);

      banner?.remove();
    },
    {
      bannerId: COOKIE_BANNER_ID,
    }
  );
}

export async function stabilizeVisualFlakes(page: Page) {
  await stabilizeFooterVersion(page);
  await ensureCookieBannerHidden(page);
}

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

const VIDEO_PLACEHOLDER_SRC = '/assets/images/vista_aerea.jpg';

async function replaceVideoWithPlaceholder(page: Page) {
  await page.evaluate(
    ({ placeholderSrc }) => {
      const wrapper = document.querySelector('.cs-video-wrapper');

      if (
        !wrapper ||
        wrapper.querySelector('[data-visual-placeholder="video"]')
      ) {
        return;
      }

      const iframe = wrapper.querySelector('iframe');

      if (iframe) {
        iframe.remove();
      }

      const placeholder = document.createElement('img');
      placeholder.src = placeholderSrc;
      placeholder.alt =
        iframe?.getAttribute('title') ?? 'Vista aérea de Belmontejo';
      placeholder.setAttribute('data-visual-placeholder', 'video');
      placeholder.style.width = '100%';
      placeholder.style.height = '100%';
      placeholder.style.objectFit = 'cover';
      placeholder.loading = 'lazy';

      wrapper.appendChild(placeholder);
    },
    { placeholderSrc: VIDEO_PLACEHOLDER_SRC }
  );
}

export async function stabilizeVisualFlakes(page: Page, routePath?: string) {
  await stabilizeFooterVersion(page);
  await ensureCookieBannerHidden(page);

  if (routePath === '/sobre-el-pueblo') {
    await replaceVideoWithPlaceholder(page);
  }
}

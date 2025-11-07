/* eslint-env browser */

const COOKIE_CONSENT_KEY = 'cookie-consent';
const ANALYTICS_CONSENT_KEY = 'analytics-consent';
const READY_EVENTS = [
  'DOMContentLoaded',
  'astro:page-load',
  'astro:after-swap',
];
const boundEvents = new WeakMap();

let storageListenerRegistered = false;
let consentCheckerExposed = false;

const handleAcceptAllCookies = () => setConsentAndReload(true);
const handleAcceptNecessaryCookies = () => setConsentAndReload(false);
const handleOpenSettings = () => showCookieModal();
const handleCloseModal = () => hideCookieModal();
const handleSavePreferences = () => {
  const analyticsCheckbox = document.getElementById('analytics-cookies');
  const analyticsConsent =
    analyticsCheckbox instanceof HTMLInputElement
      ? analyticsCheckbox.checked
      : false;

  hideCookieModal();
  hideCookieBanner();
  setConsentAndReload(analyticsConsent);
};
const handleModalBackdropClick = event => {
  if (event.target === event.currentTarget) {
    hideCookieModal();
  }
};
const handleFloatingButtonClick = () => showCookieModal();
const handlePolicyButtonClick = () => showCookieModal();

for (const eventName of READY_EVENTS) {
  document.addEventListener(eventName, initializeCookieFeatures);
}

if (document.readyState !== 'loading') {
  initializeCookieFeatures();
}

function initializeCookieFeatures() {
  initCookieBanner();
  initCookieModal();
  initFloatingCookieManager();
  initPolicyPageButton();
  registerStorageListener();
  exposeConsentChecker();
}

function initCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) {
    return;
  }

  updateBannerVisibility();

  bindEvent('accept-all-cookies', 'click', handleAcceptAllCookies);
  bindEvent('accept-necessary-only', 'click', handleAcceptNecessaryCookies);
  bindEvent('cookie-settings', 'click', handleOpenSettings);
}

function initCookieModal() {
  const modal = document.getElementById('cookie-settings-modal');
  if (!modal) {
    return;
  }

  syncAnalyticsCheckbox();

  bindEvent('close-cookie-modal', 'click', handleCloseModal);
  bindEvent('save-cookie-preferences', 'click', handleSavePreferences);
  bindEvent(modal, 'click', handleModalBackdropClick);
}

function initFloatingCookieManager() {
  const floatingBtn = document.getElementById('floating-cookie-manager');
  if (!floatingBtn) {
    return;
  }

  updateFloatingButtonVisibility();
  bindEvent(floatingBtn, 'click', handleFloatingButtonClick);
}

function initPolicyPageButton() {
  bindEvent('open-cookie-settings', 'click', handlePolicyButtonClick);
}

function registerStorageListener() {
  if (storageListenerRegistered) {
    return;
  }

  storageListenerRegistered = true;

  globalThis.addEventListener('storage', event => {
    if (event.key === COOKIE_CONSENT_KEY) {
      updateFloatingButtonVisibility();
      updateBannerVisibility();
    }

    if (event.key === ANALYTICS_CONSENT_KEY) {
      syncAnalyticsCheckbox();
    }
  });
}

function exposeConsentChecker() {
  if (consentCheckerExposed || typeof globalThis === 'undefined') {
    return;
  }

  consentCheckerExposed = true;
  globalThis.hasAnalyticsConsent = function () {
    return localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'true';
  };
}

function bindEvent(target, type, handler, options) {
  const element =
    typeof target === 'string' ? document.getElementById(target) : target;

  if (!element) {
    return;
  }

  let eventMap = boundEvents.get(element);
  if (!eventMap) {
    eventMap = new Map();
    boundEvents.set(element, eventMap);
  }

  let handlers = eventMap.get(type);
  if (!handlers) {
    handlers = new Set();
    eventMap.set(type, handlers);
  }

  if (handlers.has(handler)) {
    return;
  }

  element.addEventListener(type, handler, options);
  handlers.add(handler);
}

function showCookieModal() {
  const modal = document.getElementById('cookie-settings-modal');
  if (!modal) {
    return;
  }

  syncAnalyticsCheckbox();
  modal.style.display = 'flex';
}

function hideCookieModal() {
  const modal = document.getElementById('cookie-settings-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function hideCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  if (banner) {
    banner.style.display = 'none';
  }
}

function updateBannerVisibility() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) {
    return;
  }

  const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
  banner.style.display = consent ? 'none' : 'block';
}

function syncAnalyticsCheckbox() {
  const analyticsCheckbox = document.getElementById('analytics-cookies');
  if (analyticsCheckbox instanceof HTMLInputElement) {
    analyticsCheckbox.checked =
      localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'true';
  }
}

function setConsentAndReload(analyticsConsent) {
  localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
  localStorage.setItem(ANALYTICS_CONSENT_KEY, analyticsConsent.toString());
  updateFloatingButtonVisibility();
  globalThis.location.reload();
}

function updateFloatingButtonVisibility() {
  const floatingBtn = document.getElementById('floating-cookie-manager');
  if (!floatingBtn) {
    return;
  }

  const hasConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
  floatingBtn.style.display = hasConsent ? 'block' : 'none';
}

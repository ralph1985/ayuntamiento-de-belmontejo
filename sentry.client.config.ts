const toNumber = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getAnalyticsConsent = () => {
  if (typeof globalThis === 'undefined') {
    return false;
  }

  try {
    return globalThis.localStorage.getItem('analytics-consent') === 'true';
  } catch {
    return false;
  }
};

const registerSentry = async () => {
  const dsn = import.meta.env.PUBLIC_SENTRY_DSN;
  if (!dsn || !getAnalyticsConsent()) {
    return;
  }

  const { init } = await import('@sentry/astro');

  init({
    dsn,
    environment:
      import.meta.env.PUBLIC_SENTRY_ENVIRONMENT ?? import.meta.env.MODE,
    release:
      import.meta.env.PUBLIC_SENTRY_RELEASE ??
      import.meta.env.PUBLIC_APP_VERSION,
    tracesSampleRate: toNumber(
      import.meta.env.PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
      0.1
    ),
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', registerSentry, {
    once: true,
  });
} else {
  registerSentry();
}

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

let sentryInitPromise: Promise<void> | null = null;

const registerSentry = async () => {
  if (sentryInitPromise || !getAnalyticsConsent()) {
    return;
  }

  const dsn = import.meta.env.PUBLIC_SENTRY_DSN;
  if (!dsn) {
    return;
  }

  sentryInitPromise = (async () => {
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
  })();

  try {
    await sentryInitPromise;
  } catch (error) {
    sentryInitPromise = null;
    throw error;
  }
};

function scheduleSentryRegistration() {
  void registerSentry();
}

for (const eventName of ['astro:page-load', 'astro:after-swap']) {
  document.addEventListener(eventName, scheduleSentryRegistration);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleSentryRegistration, {
    once: true,
  });
} else {
  scheduleSentryRegistration();
}

globalThis.addEventListener('storage', event => {
  if (event.key === 'analytics-consent' && event.newValue === 'true') {
    scheduleSentryRegistration();
  }
});

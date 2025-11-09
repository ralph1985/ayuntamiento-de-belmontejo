import * as Sentry from '@sentry/astro';

const toNumber = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const dsn = import.meta.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.SENTRY_ENVIRONMENT ?? import.meta.env.MODE,
    release:
      import.meta.env.SENTRY_RELEASE ?? import.meta.env.PUBLIC_APP_VERSION,
    tracesSampleRate: toNumber(import.meta.env.SENTRY_TRACES_SAMPLE_RATE, 0.1),
  });
}

import 'dotenv/config';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import sentry from '@sentry/astro';
import icon from 'astro-icon';
import vercel from '@astrojs/vercel/serverless';
import pkg from './package.json' assert { type: 'json' };

import decapCmsOauth from 'astro-decap-cms-oauth';

// Check if admin should be enabled based on environment variable
const adminEnabled = process.env.PUBLIC_ADMIN_MENU === 'true';
const hasClientSentryDsn = Boolean(process.env.PUBLIC_SENTRY_DSN);
const hasServerSentryDsn = Boolean(process.env.SENTRY_DSN);
const serverSentryEnabled =
  hasServerSentryDsn && process.env.SENTRY_ENABLE_SERVER === 'true';
const appVersion = pkg?.version ?? '0.0.0';

export default defineConfig({
  site: 'https://ayuntamiento-de-belmontejo.vercel.app/',
  output: 'server',
  adapter: vercel(),
  integrations: [
    icon(),
    sentry({
      enabled: {
        client: hasClientSentryDsn,
        server: serverSentryEnabled,
      },
      sourcemaps: {
        disable: true,
      },
    }),
    sitemap({
      filter: page => !page.includes('/admin'),
      customPages: [
        'https://ayuntamiento-de-belmontejo.vercel.app/',
        'https://ayuntamiento-de-belmontejo.vercel.app/contacto/',
        'https://ayuntamiento-de-belmontejo.vercel.app/sobre-el-pueblo/',
        'https://ayuntamiento-de-belmontejo.vercel.app/noticias/',
        'https://ayuntamiento-de-belmontejo.vercel.app/bandos/',
        'https://ayuntamiento-de-belmontejo.vercel.app/proyectos/',
      ],
      serialize(item) {
        // Configurar prioridades y frecuencias según el tipo de página
        if (item.url === 'https://ayuntamiento-de-belmontejo.vercel.app/') {
          item.changefreq = 'daily';
          item.priority = 1;
        } else if (
          item.url.includes('/bandos/') &&
          !item.url.endsWith('/bandos/')
        ) {
          item.changefreq = 'monthly';
          item.priority = 0.9;
        } else if (
          item.url.includes('/noticias/') &&
          !item.url.endsWith('/noticias/')
        ) {
          item.changefreq = 'monthly';
          item.priority = 0.8;
        } else if (
          item.url.includes('/noticias/') ||
          item.url.includes('/bandos/')
        ) {
          item.changefreq = 'weekly';
          item.priority = 0.8;
        } else if (
          item.url.includes('/contacto/') ||
          item.url.includes('/sobre-el-pueblo/')
        ) {
          item.changefreq = 'monthly';
          item.priority = 0.7;
        } else if (item.url.includes('/proyectos/')) {
          item.changefreq = 'monthly';
          item.priority = 0.6;
        } else {
          item.changefreq = 'weekly';
          item.priority = 0.5;
        }
        return item;
      },
    }),
    decapCmsOauth({
      adminDisabled: !adminEnabled,
    }),
  ],
  vite: {
    define: {
      'import.meta.env.PUBLIC_APP_VERSION': JSON.stringify(appVersion),
    },
  },
});

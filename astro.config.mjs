import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import vercel from '@astrojs/vercel/serverless';

import decapCmsOauth from 'astro-decap-cms-oauth';

// Check if admin should be enabled based on environment variable
const adminEnabled = process.env.PUBLIC_ADMIN_MENU === 'true';

// TODO: meter "site" en una variable de entorno o un fichero de configuración para ponerlo sólo 1 vez
export default defineConfig({
  site: 'https://ayuntamiento-de-belmontejo.vercel.app/',
  output: 'server',
  adapter: vercel(),
  integrations: [
    icon(),
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
});

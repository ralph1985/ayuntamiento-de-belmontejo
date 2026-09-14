import 'dotenv/config';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import pkg from './package.json' assert { type: 'json' };

const appVersion = pkg?.version ?? '0.0.0';

export default defineConfig({
  site: 'https://belmontejo.conquense.dev/',
  output: 'server',
  devToolbar: {
    // Hide Astro dev toolbar during automated preview/tests (env default true)
    enabled: process.env.ASTRO_DEV_TOOLBAR !== 'false',
  },
  adapter: vercel(),
  integrations: [
    sitemap({
      customPages: [
        'https://belmontejo.conquense.dev/',
        'https://belmontejo.conquense.dev/contacto/',
        'https://belmontejo.conquense.dev/sobre-el-pueblo/',
        'https://belmontejo.conquense.dev/noticias/',
        'https://belmontejo.conquense.dev/bandos/',
        'https://belmontejo.conquense.dev/proyectos/',
        'https://belmontejo.conquense.dev/descubre-belmontejo/',
        'https://belmontejo.conquense.dev/instagram/',
      ],
      serialize(item) {
        // Configurar prioridades y frecuencias según el tipo de página
        if (item.url === 'https://belmontejo.conquense.dev/') {
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
  ],
  vite: {
    define: {
      'import.meta.env.PUBLIC_APP_VERSION': JSON.stringify(appVersion),
    },
  },
});

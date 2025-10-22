import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import vercel from "@astrojs/vercel/serverless";

import decapCmsOauth from "astro-decap-cms-oauth";

// TODO: meter "site" en una variable de entorno o un fichero de configuración para ponerlo sólo 1 vez
export default defineConfig({
  site: "https://develop-ayuntamiento-de-belmontejo.vercel.app/",
  output: "server",
  adapter: vercel(),
  integrations: [
    icon(),
    sitemap({
      filter: (page) => !page.includes("/admin"),
      changefreq: "weekly",
      priority: 0.7,
    }),
    decapCmsOauth(),
  ],
});

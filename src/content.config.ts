import { z, defineCollection } from "astro:content";
import { glob } from "astro/loaders";

// Every collection must reflect Decap's config.yml collection schema
// In order to be able to optimize images with Astro built-in compoments, like <Image />, we first must use this image helper
// Doc: https://docs.astro.build/en/guides/images/#images-in-content-collections

const newsCollection = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/noticias",
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      author: z.string(),
      date: z.date(),
      image: image(),
      imageAlt: z.string(),
      isFeatured: z.boolean().optional().default(false),
    }),
});

const bandosCollection = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/bandos",
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      author: z.string().optional().default("Ayuntamiento de Belmontejo"),
      date: z.date(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      category: z.string().optional().default("Info General"),
      guid: z.string(),
      link: z.string(),
      isFeatured: z.boolean().optional().default(false),
    }),
});

export const collections = {
  noticias: newsCollection,
  bandos: bandosCollection,
};

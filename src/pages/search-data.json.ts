import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import { getCollection } from 'astro:content';
import { projects } from '@data/projects';

// Generate search index at build time so it can be served as a static asset.
export const prerender = true;

export const GET: APIRoute = async () => {
  const noticias = await getCollection('noticias');
  const bandos = await getCollection('bandos');

  const searchData = [
    ...noticias.map(noticia => ({
      id: noticia.id,
      type: 'noticia',
      title: noticia.data.title,
      description: noticia.data.description,
      author: noticia.data.author,
      date: noticia.data.date.toISOString(),
      url: `/noticias/${noticia.id}`,
      content: noticia.body || '',
      tags: ['noticia'],
    })),
    ...bandos.map(bando => ({
      id: bando.id,
      type: 'bando',
      title: bando.data.title,
      description: bando.data.description,
      author: bando.data.author || 'Ayuntamiento de Belmontejo',
      date: bando.data.date.toISOString(),
      url: `/bandos/${bando.id}`,
      content: bando.body || '',
      category: bando.data.category || 'Info General',
      tags: ['bando', bando.data.category || 'Info General'],
    })),
    ...projects.map(project => ({
      id: project.slug,
      type: 'proyecto',
      title: project.title,
      description: project.pageDescription,
      author: 'Ayuntamiento de Belmontejo',
      date: new Date(project.date).toISOString(),
      url: `/proyectos/${project.slug}`,
      content: [
        project.landingIntro,
        project.summary,
        project.eyebrow,
        project.detailTitle,
        project.detailDescription,
        ...project.facts.flatMap(fact => [fact.label, fact.value]),
      ].join(' '),
      tags: ['proyecto', project.eyebrow],
    })),
  ];

  searchData.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const body = JSON.stringify(searchData);
  const etag = createHash('sha1').update(body).digest('hex');

  return new globalThis.Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=31536000, immutable',
      ETag: `"${etag}"`,
    },
  });
};

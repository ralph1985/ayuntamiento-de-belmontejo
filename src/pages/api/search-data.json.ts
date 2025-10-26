import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  // Obtener todas las noticias
  const noticias = await getCollection('noticias');
  const bandos = await getCollection('bandos');

  // Formatear los datos para la búsqueda
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
  ];

  // Ordenar por fecha (más recientes primero)
  searchData.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return new Response(JSON.stringify(searchData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
    },
  });
};

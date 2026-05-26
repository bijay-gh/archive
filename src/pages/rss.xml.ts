import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('posts'))
    .filter(p => !p.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const notes = (await getCollection('notes'))
    .filter(n => !n.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const reports = (await getCollection('reports'))
    .filter(r => !r.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const allItems = [
    ...posts.map(p => ({
      title: p.data.title,
      pubDate: p.data.pubDate,
      description: p.data.description,
      link: `/posts/${p.id}/`,
    })),
    ...notes.map(n => ({
      title: n.data.title,
      pubDate: n.data.pubDate,
      description: n.data.description,
      link: `/notes/${n.id}/`,
    })),
    ...reports.map(r => ({
      title: r.data.title,
      pubDate: r.data.pubDate,
      description: r.data.description,
      link: `/reports/${r.id}/`,
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: 'The Archive',
    description: 'A personal repository of knowledge & inquiry.',
    site: context.site!,
    items: allItems,
    customData: '<language>en-us</language>',
  });
}

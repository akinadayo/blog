import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ?? new URL('https://neu-dev.net');
  const [techPosts, diaryPosts] = await Promise.all([
    getCollection('tech', ({ data }) => !data.draft),
    getCollection('diary', ({ data }) => !data.draft),
  ]);

  const staticPages = ['/', '/about/', '/tech/', '/diary/'].map((path) => ({
    url: new URL(path, baseUrl).href,
  }));
  const postPages = [
    ...techPosts.map((post) => ({
      url: new URL(`/tech/${post.slug}/`, baseUrl).href,
      lastmod: (post.data.updatedDate ?? post.data.pubDate).toISOString(),
    })),
    ...diaryPosts.map((post) => ({
      url: new URL(`/diary/${post.data.permalink || post.slug}/`, baseUrl).href,
      lastmod: (post.data.updatedDate ?? post.data.pubDate).toISOString(),
    })),
  ];

  const entries = [...staticPages, ...postPages]
    .map(({ url, lastmod }) => [
      '  <url>',
      `    <loc>${escapeXml(url)}</loc>`,
      ...(lastmod ? [`    <lastmod>${escapeXml(lastmod)}</lastmod>`] : []),
      '  </url>',
    ].join('\n'))
    .join('\n');

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};

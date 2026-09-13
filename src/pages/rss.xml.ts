import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    throw new Error('rss feed needs `site` set in astro.config.mjs');
  }

  const posts = (await getCollection('writeups', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );

  const items = posts
    .map((post) => {
      const url = new URL(`writeups/${post.id}/`, site).href;
      return `    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.data.summary)}</description>
      <pubDate>${post.data.date.toUTCString()}</pubDate>
    </item>`;
    })
    .join('\n');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>varnan matela</title>
    <link>${site.href}</link>
    <atom:link href="${new URL('rss.xml', site).href}" rel="self" type="application/rss+xml" />
    <description>notes and writeups by varnan matela</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;

  return new Response(feed, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};

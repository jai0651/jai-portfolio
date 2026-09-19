import { SITE } from "@/lib/site";
import { getPublishedPosts, getPostBySlug } from "@/lib/blog";

export const revalidate = 3600;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
   .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/*
 * Full-text RSS, not summaries.
 *
 * A feed reader can live with excerpts. The things that increasingly matter
 * here (aggregators, and assistants that fetch a feed to answer a question)
 * cannot follow a link and re-parse a page nearly as reliably as they can read
 * the body you hand them, so the whole post goes in content:encoded.
 */
export async function GET() {
  const posts = await getPublishedPosts("recent");
  const full = await Promise.all(posts.map((p) => getPostBySlug(p.slug)));

  const items = full.filter(Boolean).map((p) => {
    const post = p!;
    const url = `${SITE.url}/blog/${post.slug}`;
    return `    <item>
      <title>${esc(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.publishedAt ?? new Date()).toUTCString()}</pubDate>
      <dc:creator>${esc(SITE.author.name)}</dc:creator>
${post.tags.map((t) => `      <category>${esc(t)}</category>`).join("\n")}
      <description>${esc(post.summary ?? "")}</description>
      <content:encoded><![CDATA[${post.html.replace(/]]>/g, "]]&gt;")}]]></content:encoded>
    </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.name)}</title>
    <link>${SITE.url}</link>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${esc(SITE.description)}</description>
    <language>en-gb</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

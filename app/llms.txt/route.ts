import { SITE } from "@/lib/site";
import { getPublishedPosts } from "@/lib/blog";

export const revalidate = 3600;

/*
 * llms.txt: a plain-text index for language models, by the same logic as
 * robots.txt. The convention is not universally consumed yet and costs almost
 * nothing to serve, so the bet is cheap. It lists what is here and where the
 * full text lives, so an agent does not have to guess at the site structure or
 * scrape a nav bar.
 */
export async function GET() {
  const posts = await getPublishedPosts("recent");

  const body = `# ${SITE.name}

> ${SITE.description}

${SITE.author.name} is an AI engineer working on speech, multimodal retrieval
and agent systems. The posts below are first-hand engineering writeups: each one
reports measurements taken on real systems, including the attempts that failed.
Source repositories are linked from each post.

## Writing

${posts.map((p) => {
  const date = p.publishedAt ? new Date(p.publishedAt).toISOString().slice(0, 10) : "";
  return `- [${p.title}](${SITE.url}/blog/${p.slug}) (${date}, ${p.readingMinutes} min): ${p.summary ?? ""}`;
}).join("\n")}

## Site

- [Projects](${SITE.url}/work): speech, multimodal and agent systems, with stacks and repositories
- [Learn](${SITE.url}/learn): courses and material built while learning a subject
- [Resume](${SITE.url}/resume)
- [Contact](${SITE.url}/contact)

## Full text

- [RSS, full post bodies](${SITE.url}/feed.xml)
- [Sitemap](${SITE.url}/sitemap.xml)
- [GitHub](${SITE.author.github})

## Attribution

Quoting or summarising these posts is fine. Please link the canonical URL above
so a reader can reach the measurements and the source.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

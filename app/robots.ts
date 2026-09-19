import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/*
 * Everything is open except the admin surface and the API.
 *
 * The AI crawlers are listed explicitly and allowed. Some of them read a
 * missing robots.txt as permissive and some read it as unknown, and being
 * quoted by an assistant is the point of writing these posts, so there is no
 * reason to leave it ambiguous.
 */
export default function robots(): MetadataRoute.Robots {
  const agents = [
    "*",
    "Googlebot", "Bingbot", "DuckDuckBot",
    "GPTBot", "OAI-SearchBot", "ChatGPT-User",
    "ClaudeBot", "Claude-Web", "anthropic-ai",
    "PerplexityBot", "Perplexity-User",
    "Google-Extended", "Applebot", "Applebot-Extended",
    "CCBot", "Amazonbot", "meta-externalagent", "Bytespider",
  ];

  return {
    rules: agents.map((userAgent) => ({
      userAgent,
      allow: "/",
      disallow: ["/admin", "/api/"],
    })),
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}

import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getPublishedPosts } from "@/lib/blog";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: SITE.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/work`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/learn`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/resume`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/services`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE.url}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];

  try {
    const posts = await getPublishedPosts("recent");
    return [
      ...pages,
      ...posts.map((p) => ({
        url: `${SITE.url}/blog/${p.slug}`,
        lastModified: p.publishedAt ?? now,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    // A database blip should degrade the sitemap, not remove it.
    return pages;
  }
}

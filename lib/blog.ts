import { cache } from "react";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * Postgres is the only source of truth for posts. `content/blog/` is just a
 * convenient place to keep source artifacts you might re-upload — it is not
 * read at runtime, because Vercel's filesystem is read-only and the admin
 * upload has to take effect without a rebuild.
 */
export type SortMode = "recent" | "popular";

export interface PostSummary {
  slug: string;
  title: string;
  summary: string | null;
  tags: string[];
  readingMinutes: number;
  publishedAt: Date | null;
  views: number;
  likes: number;
}

const LIST_FIELDS = {
  slug: true,
  title: true,
  summary: true,
  tags: true,
  readingMinutes: true,
  publishedAt: true,
  views: true,
  likes: true,
} as const;

const splitTags = (tags: string) =>
  tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

export async function getPublishedPosts(sort: SortMode = "recent"): Promise<PostSummary[]> {
  const rows = await prisma.blogPost.findMany({
    where: { published: true },
    select: LIST_FIELDS,
    orderBy:
      sort === "popular"
        ? [{ likes: "desc" }, { views: "desc" }, { publishedAt: "desc" }]
        : [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
  return rows.map((r) => ({ ...r, tags: splitTags(r.tags) }));
}

/*
 * Wrapped in React's cache() because generateMetadata and the page component
 * both need the post, and without this that is two identical round trips to
 * Postgres for every render.
 */
export const getPostBySlug = cache(async (slug: string) => {
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || !post.published) return null;
  return { ...post, tags: splitTags(post.tags) };
});

/** Slugs to prerender. Returning [] on failure keeps a build alive without a database. */
export async function getPublishedSlugs(): Promise<string[]> {
  try {
    const rows = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true },
    });
    return rows.map((r) => r.slug);
  } catch {
    return [];
  }
}

/** Neighbours for prev/next, in the same order as the recent listing. */
export const getAdjacentPosts = cache(async (slug: string) => {
  const all = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true, title: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
  const i = all.findIndex((p) => p.slug === slug);
  return {
    newer: i > 0 ? all[i - 1] : null,
    older: i >= 0 && i < all.length - 1 ? all[i + 1] : null,
  };
});

/**
 * A stable per-reader id that isn't personally identifying: salted hash of
 * ip + user-agent. Used only to make a like idempotent.
 */
export function visitorIdFrom(ip: string, userAgent: string): string {
  const salt = process.env.NEXTAUTH_SECRET ?? "blog";
  return createHash("sha256").update(`${salt}:${ip}:${userAgent}`).digest("hex").slice(0, 40);
}

export { formatDate } from "@/lib/blogHtml";

"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FiArrowUpRight, FiEye, FiHeart } from "react-icons/fi";
import SectionHeader from "@/components/SectionHeader";

/**
 * The list is a client component purely so that the page above it can stay
 * static. Reading ?sort= on the server marked /blog dynamic, which meant every
 * visit rendered from scratch and queried Postgres, including the default view
 * that almost everyone sees. The posts arrive already sorted by date; the
 * popular ordering is a reorder of data that is on the page either way.
 */
export interface BlogListPost {
  slug: string;
  title: string;
  summary: string | null;
  tags: string[];
  readingMinutes: number;
  dateLabel: string;
  views: number;
  likes: number;
}

const BlogList = ({ posts }: { posts: BlogListPost[] }) => {
  const mode = useSearchParams().get("sort") === "popular" ? "popular" : "recent";

  const ordered = useMemo(
    () =>
      mode === "popular"
        ? [...posts].sort((a, b) => b.likes - a.likes || b.views - a.views)
        : posts,
    [posts, mode]
  );

  return (
    <>
      <SectionHeader
        as="h1"
        cmd={`ls ~/blog ${mode === "popular" ? "--sort=likes" : "--sort=date"}`}
        title={
          <>
            Things I&apos;ve <span className="gradient-text">written down</span>
          </>
        }
        sub="Deep dives on voice AI, speech models built from scratch, and the protocol plumbing underneath them."
        meta={
          posts.length > 1 && (
            <div className="flex items-center gap-1 rounded-lg border border-line bg-surface-2/60 p-1 font-mono text-xs shadow-e1">
              {(
                [
                  ["recent", "recent"],
                  ["popular", "popular"],
                ] as const
              ).map(([value, label]) => (
                <Link
                  key={value}
                  href={value === "recent" ? "/blog" : "/blog?sort=popular"}
                  scroll={false}
                  aria-current={mode === value ? "true" : undefined}
                  className={`rounded-md px-3 py-1.5 transition-colors ${
                    mode === value
                      ? "bg-surface text-accent shadow-e1"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          )
        }
      />

      {ordered.length === 0 ? (
        <p className="font-mono text-sm text-muted">
          <span className="text-accent-dim">#</span> nothing published yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {ordered.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="card card-lift group flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:gap-6"
              >
                <div className="min-w-0 flex-1">
                  <h2 className="h3 flex items-start gap-2 text-ink transition-colors group-hover:text-accent">
                    <span className="min-w-0">{post.title}</span>
                    <FiArrowUpRight className="mt-1.5 shrink-0 text-faint transition-colors group-hover:text-accent" />
                  </h2>

                  {post.summary && (
                    <p className="prose-measure mt-2 text-[15px] leading-relaxed text-muted">
                      {post.summary}
                    </p>
                  )}

                  {post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {post.tags.map((t) => (
                        <span key={t} className="chip text-[10px] text-accent-dim">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="tnum shrink-0 font-mono text-xs text-faint sm:text-right">
                  {post.dateLabel && <p>{post.dateLabel}</p>}
                  <p className="mt-0.5">{post.readingMinutes} min read</p>
                  <p className="mt-2 flex items-center gap-3 sm:justify-end">
                    <span className="flex items-center gap-1">
                      <FiEye /> {post.views}
                    </span>
                    <span
                      className={`flex items-center gap-1 ${
                        post.likes > 0 ? "text-accent-dim" : ""
                      }`}
                    >
                      <FiHeart /> {post.likes}
                    </span>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default BlogList;

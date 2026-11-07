"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FiArrowRight, FiEye, FiHeart } from "react-icons/fi";
import PageHero from "@/components/PageHero";

/**
 * The list is a client component purely so that the page above it can stay
 * static. Reading ?sort= on the server marked /blog dynamic, which meant every
 * visit rendered from scratch and queried Postgres, including the default view
 * that almost everyone sees. The posts arrive already sorted by date; the
 * popular ordering is a reorder of data that is on the page either way.
 *
 * Layout: the first post in the current order is a large feature, the rest an
 * editorial list with a date column, the way a publication front page reads.
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

const Stats = ({ post }: { post: BlogListPost }) => (
  <span className="tnum inline-flex items-center gap-3 font-mono text-xs text-faint">
    <span className="inline-flex items-center gap-1" aria-label={`${post.views} views`}>
      <FiEye aria-hidden /> {post.views}
    </span>
    <span
      className={`inline-flex items-center gap-1 ${post.likes > 0 ? "text-accent-dim" : ""}`}
      aria-label={`${post.likes} likes`}
    >
      <FiHeart aria-hidden /> {post.likes}
    </span>
  </span>
);

const BlogList = ({ posts }: { posts: BlogListPost[] }) => {
  const mode = useSearchParams().get("sort") === "popular" ? "popular" : "recent";

  const ordered = useMemo(
    () =>
      mode === "popular"
        ? [...posts].sort((a, b) => b.likes - a.likes || b.views - a.views)
        : posts,
    [posts, mode]
  );

  const [featured, ...rest] = ordered;

  return (
    <>
      <PageHero
        cmd={`ls ~/blog ${mode === "popular" ? "--sort=likes" : "--sort=date"}`}
        title={
          <>
            Things I&apos;ve <span className="gradient-text">written down.</span>
          </>
        }
        sub="Build guides for speech recognition, text to speech, video search and local assistants, with numbers from real runs and the attempts that failed."
        meta={
          posts.length > 1 && (
            <nav
              aria-label="Sort posts"
              className="flex items-center gap-1 rounded-lg border border-line bg-surface-2/60 p-1 font-mono text-xs shadow-e1"
            >
              {(
                [
                  ["recent", "Newest"],
                  ["popular", "Most liked"],
                ] as const
              ).map(([value, label]) => (
                <Link
                  key={value}
                  href={value === "recent" ? "/blog" : "/blog?sort=popular"}
                  scroll={false}
                  aria-current={mode === value ? "true" : undefined}
                  className={`inline-flex min-h-10 items-center rounded-md px-3 transition-colors ${
                    mode === value
                      ? "bg-surface text-accent shadow-e1"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          )
        }
      />

      {!featured ? (
        <p className="font-mono text-sm text-muted">
          <span className="text-accent-dim">#</span> nothing published yet.
        </p>
      ) : (
        <>
          {/* ── Feature ───────────────────────────────────────── */}
          <Link
            href={`/blog/${featured.slug}`}
            className="card card-lift group grid grid-cols-1 gap-8 rounded-2xl p-7 sm:p-10 lg:grid-cols-12 lg:gap-12 xl:p-12"
          >
            <div className="lg:col-span-8">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-dim">
                {mode === "popular" ? "Most liked" : "Latest post"}
              </p>
              <h2 className="mt-4 text-balance font-sans text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-ink transition-colors group-hover:text-accent sm:text-4xl xl:text-5xl">
                {featured.title}
              </h2>
              {featured.summary && (
                <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-muted">
                  {featured.summary}
                </p>
              )}
              <span className="mt-8 inline-flex min-h-11 items-center gap-2 font-mono text-sm text-accent">
                Read the post
                <FiArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </div>

            <div className="flex flex-row items-end justify-between gap-6 border-t border-line pt-6 lg:col-span-4 lg:flex-col lg:items-end lg:justify-end lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0 lg:text-right">
              <p>
                <span className="tnum block font-sans text-6xl font-semibold tracking-[-0.05em] text-ink xl:text-7xl">
                  {featured.readingMinutes}
                </span>
                <span className="mt-1 block font-mono text-xs text-faint">minute read</span>
              </p>
              <div className="space-y-2 lg:mt-8">
                {featured.dateLabel && (
                  <p className="tnum font-mono text-xs text-faint">{featured.dateLabel}</p>
                )}
                <Stats post={featured} />
              </div>
            </div>
          </Link>

          {/* ── The rest ──────────────────────────────────────── */}
          {rest.length > 0 && (
            <section className="mt-20">
              <h2 className="mb-2 font-mono text-xs uppercase tracking-[0.28em] text-accent-dim">
                {mode === "popular" ? "Then" : "Earlier"}
              </h2>
              <ol className="border-t border-line">
                {rest.map((post) => (
                  <li key={post.slug} className="border-b border-line">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group grid grid-cols-1 gap-3 py-8 sm:grid-cols-[9rem_1fr] sm:gap-8 lg:grid-cols-[9rem_1fr_8rem]"
                    >
                      <p className="tnum pt-1.5 font-mono text-xs text-faint">{post.dateLabel}</p>

                      <div className="min-w-0">
                        <h3 className="text-balance text-2xl font-semibold leading-snug tracking-[-0.02em] text-ink transition-colors group-hover:text-accent">
                          {post.title}
                        </h3>
                        {post.summary && (
                          <p className="mt-2 max-w-[66ch] text-[15px] leading-relaxed text-muted">
                            {post.summary}
                          </p>
                        )}
                        {post.tags.length > 0 && (
                          <p className="mt-3 font-mono text-xs text-faint">
                            {post.tags.join(" · ")}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 sm:col-start-2 lg:col-start-auto lg:flex-col lg:items-end lg:gap-2 lg:pt-1.5">
                        <span className="tnum font-mono text-xs text-muted">
                          {post.readingMinutes} min
                        </span>
                        <Stats post={post} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </>
      )}
    </>
  );
};

export default BlogList;

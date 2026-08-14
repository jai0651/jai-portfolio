import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiArrowRight, FiEye } from "react-icons/fi";
import Section from "@/components/Section";
import LikeButton from "@/components/blog/LikeButton";
import ViewTracker from "@/components/blog/ViewTracker";
import { formatDate, getAdjacentPosts, getPostBySlug } from "@/lib/blog";

// Uploaded at runtime, so rendered per request rather than prerendered.
export const revalidate = 30;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Jai Shankar`,
    description: post.summary ?? undefined,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const { newer, older } = await getAdjacentPosts(slug);

  return (
    <>
      <ViewTracker slug={slug} />

      <Section tone="hero" space="md" innerClassName="max-w-[860px]">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 font-mono text-xs text-faint transition-colors hover:text-accent"
        >
          <FiArrowLeft /> cd ~/blog
        </Link>

        <h1 className="h2 mt-6 text-ink">{post.title}</h1>

        {post.summary && (
          <p className="mt-4 text-[17px] leading-relaxed text-muted">{post.summary}</p>
        )}

        <div className="tnum mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-5 font-mono text-xs text-faint">
          {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
          <span className="text-line-2">·</span>
          <span>{post.readingMinutes} min read</span>
          <span className="text-line-2">·</span>
          <span className="flex items-center gap-1">
            <FiEye /> {post.views}
          </span>
          {post.tags.length > 0 && (
            <>
              <span className="text-line-2">·</span>
              <span className="flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <span key={t} className="text-accent-dim">
                    {t}
                  </span>
                ))}
              </span>
            </>
          )}
        </div>
      </Section>

      <Section space="none" innerClassName="max-w-[860px]" className="pb-20">
        {/*
          Sanitized on upload by lib/blogHtml.ts — an allowlist covering
          exactly the vocabulary .tech-article styles, with script/iframe and
          all event handlers stripped.
        */}
        <article
          className="tech-article"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        <div className="mt-14 flex flex-col items-start gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-sm text-ink">Found this useful?</p>
            <p className="mt-0.5 text-[15px] text-muted">
              No sign-in — one like per reader, and you can take it back.
            </p>
          </div>
          <LikeButton slug={slug} initialLikes={post.likes} />
        </div>

        {(newer || older) && (
          <nav className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {older ? (
              <Link href={`/blog/${older.slug}`} className="card card-lift group p-5">
                <span className="flex items-center gap-2 font-mono text-xs text-faint">
                  <FiArrowLeft /> older
                </span>
                <span className="h4 mt-2 block text-ink group-hover:text-accent">
                  {older.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {newer && (
              <Link
                href={`/blog/${newer.slug}`}
                className="card card-lift group p-5 sm:text-right"
              >
                <span className="flex items-center gap-2 font-mono text-xs text-faint sm:justify-end">
                  newer <FiArrowRight />
                </span>
                <span className="h4 mt-2 block text-ink group-hover:text-accent">
                  {newer.title}
                </span>
              </Link>
            )}
          </nav>
        )}
      </Section>
    </>
  );
}

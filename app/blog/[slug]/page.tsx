import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import Section from "@/components/Section";
import { formatDate, getAllPosts, getPost } from "@/lib/blog";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Jai Shankar`,
    description: post.summary,
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  // Prev/next in the same reverse-chronological order as the index.
  const all = getAllPosts();
  const i = all.findIndex((p) => p.slug === post.slug);
  const newer = i > 0 ? all[i - 1] : null;
  const older = i >= 0 && i < all.length - 1 ? all[i + 1] : null;

  return (
    <>
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
          {post.date && <span>{formatDate(post.date)}</span>}
          <span className="text-line-2">·</span>
          <span>{post.readingMinutes} min read</span>
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
        {/* First-party content committed to this repo — see lib/blog.ts. */}
        <article
          className="tech-article"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        {(newer || older) && (
          <nav className="mt-16 grid grid-cols-1 gap-3 border-t border-line pt-8 sm:grid-cols-2">
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

import Link from "next/link";
import type { Metadata } from "next";
import { FiArrowUpRight } from "react-icons/fi";
import Section from "@/components/Section";
import SectionHeader from "@/components/SectionHeader";
import { formatDate, getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Jai Shankar",
  description:
    "Technical writeups on voice AI, speech models, LLM agents and the systems underneath them.",
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <Section space="md">
      <SectionHeader
        as="h1"
        cmd="ls ~/blog"
        title={
          <>
            Things I&apos;ve <span className="gradient-text">written down</span>
          </>
        }
        sub="Deep dives on voice AI, speech models built from scratch, and the protocol plumbing underneath them."
        meta={
          posts.length > 0 && (
            <span className="chip tnum">
              <span className="text-accent">{posts.length}</span>{" "}
              {posts.length === 1 ? "post" : "posts"}
            </span>
          )
        }
      />

      {posts.length === 0 ? (
        <p className="font-mono text-sm text-muted">
          <span className="text-accent-dim">#</span> nothing published yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="card card-lift group flex flex-col gap-3 p-6 sm:flex-row sm:items-start sm:gap-6"
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
                  {post.date && <p>{formatDate(post.date)}</p>}
                  <p className="mt-0.5">{post.readingMinutes} min read</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

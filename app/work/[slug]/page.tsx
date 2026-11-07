import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight, FiGithub } from "react-icons/fi";
import { prisma } from "@/lib/prisma";
import { DETAILS, POST_FOR_REPO, detailFor, isRetired, slugCategory } from "@/lib/projects";
import Section from "@/components/Section";
import { Button } from "@/components/ui/button";

/*
 * One page per project: what it is, how it works, what came out of it, and
 * the stack and links in a panel beside it. The prose lives in
 * lib/projects/details; the image, links and category come from the database
 * row so the admin panel stays the source of truth for those.
 */
export const revalidate = 3600;

export function generateStaticParams() {
  return DETAILS.map((d) => ({ slug: d.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const d = DETAILS.find((x) => x.slug === slug);
  if (!d) return {};
  return {
    title: d.title,
    description: d.oneLiner,
    alternates: { canonical: `/work/${slug}` },
    openGraph: { type: "article", url: `/work/${slug}`, title: d.title, description: d.oneLiner },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const detail = DETAILS.find((d) => d.slug === slug);
  if (!detail) notFound();

  const rows = await prisma.project
    .findMany({ where: { isActive: true }, orderBy: { order: "asc" } })
    .catch(() => []);

  // Prev / next follow the same order as the /work grid.
  const ordered = rows
    .filter((r) => !isRetired(r))
    .map((r) => ({ row: r, detail: detailFor(r) }))
    .filter((x): x is { row: (typeof rows)[number]; detail: NonNullable<typeof x.detail> } =>
      Boolean(x.detail)
    );
  const idx = ordered.findIndex((x) => x.detail.slug === slug);
  if (idx === -1 && rows.length > 0) notFound(); // hidden or retired in the admin panel
  const row = ordered[idx]?.row;
  const prev = idx > 0 ? ordered[idx - 1] : null;
  const next = idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null;

  const live = row?.live?.trim() || null;
  const github = row?.github?.trim() || detail.match.github || null;
  const post = (github && POST_FOR_REPO[github]) || null;

  const allLinks = [
    live && { label: "Live site", href: live },
    post && { label: "Write-up on the blog", href: post },
    github && { label: "Source code", href: github },
    ...(detail.links ?? []),
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <Section tone="hero" space="none" className="pb-14 pt-8 xl:pb-20">
        <Link
          href="/work"
          className="inline-flex min-h-11 items-center gap-2 font-mono text-sm text-faint transition-colors hover:text-accent"
        >
          <FiArrowLeft /> All projects
        </Link>

        <div className="mt-6 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            {row?.category && (
              <p className="font-mono text-xs text-accent-dim">{slugCategory(row.category)}</p>
            )}
            <h1 className="mt-3 text-balance font-sans text-[40px] font-semibold leading-[1.02] tracking-[-0.04em] text-ink sm:text-[56px] xl:text-[64px]">
              {detail.title}
            </h1>
            <p className="mt-5 max-w-[56ch] text-xl leading-relaxed text-ink/85">
              {detail.oneLiner}
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 font-mono text-xs text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {detail.status}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {live && (
                <Button asChild variant="cta" size="lg">
                  <a href={live} target="_blank" rel="noopener noreferrer">
                    Open the live site <FiArrowUpRight />
                  </a>
                </Button>
              )}
              {post && (
                <Button asChild variant={live ? "outline" : "cta"} size="lg">
                  <Link href={post}>
                    Read the write-up <FiArrowRight />
                  </Link>
                </Button>
              )}
              {github && (
                <Button asChild variant={live || post ? "ghost" : "cta"} size="lg">
                  <a href={github} target="_blank" rel="noopener noreferrer">
                    <FiGithub /> Source code
                  </a>
                </Button>
              )}
            </div>
          </div>

          {row?.image && (
            <div className="lg:col-span-5">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line bg-surface-2 shadow-e3">
                <Image
                  src={row.image}
                  alt={`${detail.title}: overview card`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover object-top"
                />
              </div>
            </div>
          )}
        </div>

        {detail.highlights.length > 0 && (
          <dl
            className={`mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line shadow-e1 sm:grid-cols-2 ${
              detail.highlights.length >= 4
                ? "lg:grid-cols-4"
                : detail.highlights.length === 3
                  ? "lg:grid-cols-3"
                  : ""
            }`}
          >
            {detail.highlights.map((h) => (
              <div key={h.label} className="bg-surface p-6">
                <dt className="sr-only">{h.label}</dt>
                <dd>
                  <span className="tnum block font-sans text-4xl font-semibold tracking-[-0.04em] text-accent xl:text-5xl">
                    {h.value}
                  </span>
                  <span className="mt-2 block text-sm leading-relaxed text-muted">{h.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        )}
      </Section>

      {/* ── Body ─────────────────────────────────────────────── */}
      <Section space="md">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
          {/* At a glance: first on a phone, pinned beside the text on desktop. */}
          <aside className="lg:order-2 lg:col-span-4">
            <div className="card space-y-7 p-6 lg:sticky lg:top-28">
              <div>
                <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
                  Tech stack
                </h2>
                <dl className="mt-4 space-y-4">
                  {detail.stack.map((g) => (
                    <div key={g.group}>
                      <dt className="text-sm font-medium text-ink">{g.group}</dt>
                      <dd className="mt-2 flex flex-wrap gap-1.5">
                        {g.items.map((it) => (
                          <span
                            key={it}
                            className="rounded border border-line bg-surface-2 px-2 py-0.5 font-mono text-xs text-muted"
                          >
                            {it}
                          </span>
                        ))}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {allLinks.length > 0 && (
                <div>
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
                    Links
                  </h2>
                  <ul className="mt-2">
                    {allLinks.map((l) => {
                      const ext = l.href.startsWith("http");
                      return (
                        <li key={l.href}>
                          <a
                            href={l.href}
                            {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            className="group flex min-h-11 items-center justify-between gap-3 border-b border-line text-[15px] text-ink transition-colors last:border-0 hover:text-accent"
                          >
                            {l.label}
                            {ext ? (
                              <FiArrowUpRight className="shrink-0 text-faint group-hover:text-accent" />
                            ) : (
                              <FiArrowRight className="shrink-0 text-faint group-hover:text-accent" />
                            )}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </aside>

          <article className="space-y-16 lg:order-1 lg:col-span-8">
            <section>
              <SectionLabel>What it is</SectionLabel>
              <div className="max-w-[66ch] space-y-5 text-lg leading-relaxed text-ink/85">
                {detail.overview.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>
            </section>

            {detail.how.length > 0 && (
              <section>
                <SectionLabel>How it works</SectionLabel>
                <ol className="relative max-w-[66ch]">
                  {detail.how.map((s, i) => (
                    <li key={s.title} className="relative grid grid-cols-[2.5rem_1fr] gap-4 pb-8 last:pb-0">
                      {/* the line joining the steps: a pipeline, top to bottom */}
                      {i < detail.how.length - 1 && (
                        <span
                          aria-hidden
                          className="absolute left-[1.25rem] top-10 h-[calc(100%-2.5rem)] w-px -translate-x-1/2 bg-line-2"
                        />
                      )}
                      <span className="tnum flex h-10 w-10 items-center justify-center rounded-full border border-accent/40 bg-accent/10 font-mono text-sm text-accent">
                        {i + 1}
                      </span>
                      <div className="pt-1.5">
                        <h3 className="text-lg font-semibold text-ink">{s.title}</h3>
                        <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{s.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {detail.decisions.length > 0 && (
              <section>
                <SectionLabel>Decisions and trade-offs</SectionLabel>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {detail.decisions.map((d) => (
                    <div key={d.title} className="card p-5">
                      <h3 className="text-base font-semibold text-ink">{d.title}</h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-muted">{d.body}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </article>
        </div>
      </Section>

      {/* ── Prev / next ──────────────────────────────────────── */}
      {(prev || next) && (
        <Section space="sm" className="border-t border-line">
          <nav aria-label="More projects" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/work/${prev.detail.slug}`}
                className="card card-lift group flex min-h-11 flex-col p-5"
              >
                <span className="inline-flex items-center gap-1.5 font-mono text-xs text-faint">
                  <FiArrowLeft /> Previous
                </span>
                <span className="mt-2 font-semibold text-ink group-hover:text-accent">
                  {prev.detail.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                href={`/work/${next.detail.slug}`}
                className="card card-lift group flex min-h-11 flex-col p-5 sm:items-end sm:text-right"
              >
                <span className="inline-flex items-center gap-1.5 font-mono text-xs text-faint">
                  Next <FiArrowRight />
                </span>
                <span className="mt-2 font-semibold text-ink group-hover:text-accent">
                  {next.detail.title}
                </span>
              </Link>
            )}
          </nav>
        </Section>
      )}
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-6 font-mono text-xs uppercase tracking-[0.28em] text-accent-dim">
      {children}
    </h2>
  );
}

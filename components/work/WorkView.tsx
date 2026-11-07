"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiArrowUpRight, FiGithub } from "react-icons/fi";
import Section from "@/components/Section";
import PageHero from "@/components/PageHero";
import GithubSection from "@/components/GithubSection";
import { Button } from "@/components/ui/button";
import { fadeUp, fadeUpNow, lead, step } from "@/lib/motion";
import { slugCategory } from "@/lib/projects";

export interface WorkProject {
  id: string;
  num: string;
  category: string;
  title: string;
  description: string;
  stack: string;
  image: string | null;
  live: string | null;
  github: string | null;
  post: string | null;
  /** Explainer page at /work/<slug>, when one exists. */
  slug: string | null;
  /** Sourced one-line summary from the explainer, when there is one. */
  summary: string | null;
  /** The explainer's first measured result, shown large on the tile. */
  highlight: { value: string; label: string } | null;
}

/** First full sentence of a paragraph, for projects without an explainer. */
const firstSentence = (text: string) => text.split(/(?<=[.!?])\s+(?=[A-Z])/)[0];

const blurb = (p: WorkProject) => p.summary ?? firstSentence(p.description);

/*
 * Layout, top to bottom: the live product as a wide feature, then everything
 * else as a two-column grid where each tile leads with one measured number.
 * A click anywhere on a tile opens the project's explainer; source, live site
 * and write-up stay reachable as separate links.
 */
export default function WorkView({ projects }: { projects: WorkProject[] }) {
  const featured = projects.find((p) => p.live) ?? projects[0];
  const rest = projects.filter((p) => p !== featured);

  return (
    <>
      <Section tone="hero" space="none" className="pb-8 pt-8">
        <motion.div {...fadeUpNow} transition={lead()}>
          <PageHero
            cmd="ls ~/work"
            title={
              <>
                Things I&apos;ve <span className="gradient-text">built.</span>
              </>
            }
            sub="Most of these are speech, vision and agent systems I wrote from scratch. Patronus is a live product. Every project opens into a one-page explainer with the stack, the numbers and the links."
            meta={
              projects.length > 0 && (
                <p className="font-mono text-sm text-faint">
                  <span className="tnum text-accent">{projects.length}</span> projects
                </p>
              )
            }
          />
        </motion.div>

        {featured && <FeaturedProject project={featured} />}
      </Section>

      {rest.length > 0 && (
        <Section space="md">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {rest.map((p, i) => (
              <ProjectTile
                key={p.id}
                project={p}
                index={i}
                // An odd one out at the end spans the row instead of leaving a hole.
                wide={rest.length % 2 === 1 && i === rest.length - 1}
              />
            ))}
          </div>
        </Section>
      )}

      <GithubSection />
    </>
  );
}

function FeaturedProject({ project: p }: { project: WorkProject }) {
  const explainer = p.slug ? `/work/${p.slug}` : null;
  return (
    <motion.article
      {...fadeUpNow}
      transition={lead(0.1)}
      className="card group relative grid grid-cols-1 overflow-hidden rounded-2xl lg:grid-cols-12"
    >
      <div className="relative aspect-[16/10] bg-surface-2 lg:col-span-7 lg:aspect-auto lg:min-h-[420px]">
        {p.image && (
          <Image
            src={p.image}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-cover object-left-top transition-transform duration-700 ease-out-quint group-hover:scale-[1.015]"
          />
        )}
      </div>

      <div className="flex flex-col justify-center p-7 lg:col-span-5 xl:p-10">
        <p className="font-mono text-xs text-accent-dim">
          {slugCategory(p.category)} · featured
        </p>
        <h2 className="mt-3 text-balance font-sans text-3xl font-semibold tracking-[-0.03em] text-ink xl:text-4xl">
          {p.title}
        </h2>
        <p className="mt-4 text-[17px] leading-relaxed text-muted">{blurb(p)}</p>

        {p.highlight && (
          <p className="mt-6">
            <span className="tnum block font-sans text-4xl font-semibold tracking-[-0.04em] text-accent">
              {p.highlight.value}
            </span>
            <span className="mt-1 block text-sm text-muted">{p.highlight.label}</span>
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {explainer && (
            <Button asChild variant="cta" size="lg">
              <Link href={explainer}>
                How it&apos;s built <FiArrowRight />
              </Link>
            </Button>
          )}
          {p.live && (
            <Button asChild variant="outline" size="lg">
              <a href={p.live} target="_blank" rel="noopener noreferrer">
                Live site <FiArrowUpRight />
              </a>
            </Button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function ProjectTile({
  project: p,
  index,
  wide,
}: {
  project: WorkProject;
  index: number;
  wide: boolean;
}) {
  const explainer = p.slug ? `/work/${p.slug}` : null;
  const primary = explainer || p.live || p.post || p.github;
  const stretched =
    "after:absolute after:inset-0 after:z-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-accent/60";

  const actions = [
    p.post && { href: p.post, label: "Write-up", icon: <FiArrowRight />, external: false },
    p.live && { href: p.live, label: "Live site", icon: <FiArrowUpRight />, external: true },
    p.github && { href: p.github, label: "Source", icon: <FiGithub />, external: true },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode; external: boolean }[];

  return (
    <motion.article
      {...fadeUp}
      transition={step(index % 2)}
      className={`card group relative flex flex-col overflow-hidden rounded-2xl ${
        primary ? "card-lift" : ""
      } ${wide ? "md:col-span-2 md:flex-row" : ""}`}
    >
      <div
        className={`relative overflow-hidden bg-surface-2 ${
          wide ? "aspect-[16/10] md:aspect-auto md:w-[55%] md:shrink-0" : "aspect-[16/9]"
        }`}
      >
        {p.image ? (
          <Image
            src={p.image}
            fill
            sizes={wide ? "(min-width: 768px) 55vw, 100vw" : "(min-width: 768px) 50vw, 100vw"}
            className="object-cover object-left-top transition-transform duration-700 ease-out-quint group-hover:scale-[1.02]"
            alt=""
          />
        ) : (
          <div className="grid-bg absolute inset-0" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-6 xl:p-7">
        <p className="font-mono text-xs text-accent-dim">{slugCategory(p.category || "project")}</p>
        <h2 className="mt-2 text-xl font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-accent">
          {primary && !primary.startsWith("http") ? (
            <Link href={primary} className={stretched}>
              {p.title}
            </Link>
          ) : primary ? (
            <a href={primary} target="_blank" rel="noopener noreferrer" className={stretched}>
              {p.title}
            </a>
          ) : (
            p.title
          )}
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{blurb(p)}</p>

        {p.highlight && (
          <p className="mt-5 border-t border-line pt-5">
            <span className="tnum block font-sans text-3xl font-semibold tracking-[-0.04em] text-accent">
              {p.highlight.value}
            </span>
            <span className="mt-1 block text-sm leading-relaxed text-muted">{p.highlight.label}</span>
          </p>
        )}

        <div className="relative z-10 mt-auto flex flex-wrap items-center gap-x-5 pt-4">
          {explainer && (
            <Link
              href={explainer}
              className="inline-flex min-h-11 items-center gap-1.5 font-mono text-xs text-accent transition-colors hover:text-accent-hover"
            >
              Read the explainer <FiArrowRight />
            </Link>
          )}
          {actions.map((a) =>
            a.external ? (
              <a
                key={a.label}
                href={a.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 font-mono text-xs text-faint transition-colors hover:text-accent"
              >
                {a.icon} {a.label}
              </a>
            ) : (
              <Link
                key={a.label}
                href={a.href}
                className="inline-flex min-h-11 items-center gap-1.5 font-mono text-xs text-faint transition-colors hover:text-accent"
              >
                {a.icon} {a.label}
              </Link>
            )
          )}
        </div>
      </div>
    </motion.article>
  );
}

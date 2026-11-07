import type { Metadata } from "next";
import { FiArrowUpRight, FiBookOpen, FiPlay } from "react-icons/fi";
import Section from "@/components/Section";
import PageHero from "@/components/PageHero";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Free courses I made while learning things properly: machine learning from the maths up, and how computers really run your code.",
  alternates: { canonical: "/learn" },
};

type Kind = "course" | "video";

interface Resource {
  title: string;
  blurb: string;
  href: string;
  kind: Kind;
  /** Short factual labels: length, section count, the stack it covers. */
  meta: string[];
}

interface Topic {
  slug: string;
  title: string;
  /** What someone gets out of this topic, not what it is about. */
  sub: string;
  resources: Resource[];
}

/*
 * Hand-maintained rather than database-backed. There are only a couple of topics
 * and the shape of the next few is not settled, so a typed constant beats a schema and
 * an admin screen until it stops being obvious what belongs here.
 */
const TOPICS: Topic[] = [
  {
    slug: "machine-learning",
    title: "Machine learning",
    sub: "The whole stack in one place, from the maths underneath to what shipped this year.",
    resources: [
      {
        title: "KnowML",
        blurb:
          "A searchable revision course covering modern ML and AI end to end, from the maths foundations through to the 2026 frontier. Every model is decomposed the same six ways, so the differences between them are the thing you actually see.",
        href: "https://knowml.vercel.app",
        kind: "course",
        meta: ["28 sections", "searchable", "free"],
      },
    ],
  },
  {
    slug: "systems",
    title: "Systems",
    sub: "What actually happens underneath your code, from the CPU up to distributed systems.",
    resources: [
      {
        title: "KnowSys",
        blurb:
          "A course on how computers really run your code: CPUs, memory, the Linux kernel, concurrency, storage engines and distributed systems, taught step by step with diagrams you walk through and numbers measured on real machines.",
        href: "https://knowsys.tech",
        kind: "course",
        meta: ["75 chapters", "8 labs", "free"],
      },
    ],
  },
];

const KIND_LABEL: Record<Kind, { icon: typeof FiBookOpen; text: string }> = {
  course: { icon: FiBookOpen, text: "Course" },
  video: { icon: FiPlay, text: "Video" },
};

/** "28 sections" → a big number; "free", "searchable" → plain labels. */
const splitMeta = (meta: string[]) => {
  const numbers: { value: string; label: string }[] = [];
  const labels: string[] = [];
  for (const m of meta) {
    const hit = m.match(/^(\d[\d,]*)\s+(.+)$/);
    if (hit) numbers.push({ value: hit[1], label: hit[2] });
    else labels.push(m);
  }
  return { numbers, labels };
};

/*
 * Each course gets a large panel of its own, in the homepage's type: the
 * subject as an eyebrow, the course name big, what you get out of it, and its
 * size as numbers. Topics with several resources would stack below.
 */
export default function LearnPage() {
  const resources = TOPICS.flatMap((t) => t.resources.map((r) => ({ topic: t, r })));

  return (
    <Section tone="hero" space="none" className="pb-20 pt-8 xl:pb-28">
      <PageHero
        cmd="ls ~/learn"
        title={
          <>
            Things I&apos;ve <span className="gradient-text">taught myself.</span>
          </>
        }
        sub="Courses I built while learning a subject properly, in the order that made it click. Everything here is free and stays up."
      />

      <ul className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {resources.map(({ topic, r }) => {
          const { icon: Icon, text } = KIND_LABEL[r.kind];
          const { numbers, labels } = splitMeta(r.meta);
          return (
            <li key={r.href} id={topic.slug} className="scroll-mt-28">
              <a
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className="card card-lift group flex h-full flex-col rounded-2xl p-7 sm:p-10"
              >
                <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-accent-dim">
                  <Icon aria-hidden /> {text} · {topic.title}
                </p>
                <h2 className="mt-5 font-sans text-5xl font-semibold tracking-[-0.045em] text-ink transition-colors group-hover:text-accent xl:text-6xl">
                  {r.title}
                </h2>
                <p className="mt-3 text-lg text-ink/85">{topic.sub}</p>
                <p className="mt-4 flex-1 text-[15px] leading-relaxed text-muted">{r.blurb}</p>

                {numbers.length > 0 && (
                  <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-6">
                    {numbers.map((n) => (
                      <div key={n.label}>
                        <dt className="sr-only">{n.label}</dt>
                        <dd>
                          <span className="tnum block font-sans text-4xl font-semibold tracking-[-0.04em] text-accent">
                            {n.value}
                          </span>
                          <span className="mt-1 block font-mono text-xs text-faint">{n.label}</span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                  <span className="inline-flex h-12 items-center gap-2 rounded-lg bg-accent px-6 font-mono text-[15px] font-medium text-primary shadow-glow transition-colors group-hover:bg-accent-hover">
                    Open {r.title} <FiArrowUpRight />
                  </span>
                  {labels.length > 0 && (
                    <span className="font-mono text-xs text-faint">{labels.join(" · ")}</span>
                  )}
                </div>
              </a>
            </li>
          );
        })}
      </ul>

      <p className="mt-16 max-w-[60ch] text-[15px] leading-relaxed text-muted">
        I also write build guides as I go, with the measurements from each run.{" "}
        <Link
          href="/blog"
          className="text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
        >
          Read the blog
        </Link>
        .
      </p>
    </Section>
  );
}

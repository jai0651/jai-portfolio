import type { Metadata } from "next";
import { FiArrowUpRight, FiBookOpen, FiPlay } from "react-icons/fi";
import Section from "@/components/Section";
import SectionHeader from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "Learn — Jai Shankar",
  description:
    "Courses, writeups and videos I have made while learning things properly: machine learning from first principles through to the current frontier.",
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
 * Hand-maintained rather than database-backed. There is one topic today and the
 * shape of the next few is not settled, so a typed constant beats a schema and
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
];

const KIND_LABEL: Record<Kind, { icon: typeof FiBookOpen; text: string }> = {
  course: { icon: FiBookOpen, text: "course" },
  video: { icon: FiPlay, text: "video" },
};

export default function LearnPage() {
  return (
    <Section space="md">
      <SectionHeader
        as="h1"
        cmd="ls ~/learn"
        title={
          <>
            Things I&apos;ve <span className="gradient-text">taught myself</span>
          </>
        }
        sub="Courses and videos I built while learning a subject properly, in the order that made it click. Everything here is free and stays up."
      />

      <div className="flex flex-col gap-12">
        {TOPICS.map((topic) => (
          <div key={topic.slug} id={topic.slug}>
            <div className="mb-4 border-b border-line pb-3">
              <h2 className="h3 text-ink">{topic.title}</h2>
              <p className="mt-1 text-[15px] text-muted">{topic.sub}</p>
            </div>

            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {topic.resources.map((r) => {
                const { icon: Icon, text } = KIND_LABEL[r.kind];
                return (
                  <li key={r.href}>
                    <a
                      href={r.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card card-lift group flex h-full flex-col p-6"
                    >
                      <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-accent-dim">
                        <Icon /> {text}
                      </span>

                      <h3 className="h3 mt-3 flex items-start gap-2 text-ink transition-colors group-hover:text-accent">
                        <span className="min-w-0">{r.title}</span>
                        <FiArrowUpRight className="mt-1.5 shrink-0 text-faint transition-colors group-hover:text-accent" />
                      </h3>

                      <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">
                        {r.blurb}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {r.meta.map((m) => (
                          <span key={m} className="chip text-[10px] text-accent-dim">
                            {m}
                          </span>
                        ))}
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

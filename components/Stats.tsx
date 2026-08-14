"use client";

import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { FaGithub } from "react-icons/fa";
import Section from "./Section";
import SectionHeader from "./SectionHeader";
import { Skeleton } from "./ui/skeleton";
import type { GithubData } from "@/lib/github";

/**
 * Every number here is derived at runtime — live GitHub data plus real row
 * counts — rather than typed into the admin panel.
 *
 * The hand-entered values this replaced were both stale and underselling: they
 * claimed 20 projects against 52 public repos, and 8 technologies against 6
 * shipped languages, alongside a commit count that couldn't be verified at all.
 * Exact counts also drop the "+" suffix, because 52 repos is 52, not "52+".
 */
interface Stat {
  key: string;
  num: number;
  text: string;
}

const Stats = () => {
  const [stats, setStats] = useState<Stat[] | null>(null);

  useEffect(() => {
    const load = async () => {
      const [ghRes, projRes] = await Promise.allSettled([
        fetch("/api/github").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/admin/projects").then((r) => (r.ok ? r.json() : null)),
      ]);

      const gh: GithubData | null =
        ghRes.status === "fulfilled" && ghRes.value?.profile ? ghRes.value : null;
      const projectCount =
        projRes.status === "fulfilled" ? (projRes.value?.projects?.length ?? 0) : 0;

      const next: Stat[] = [];
      if (gh) {
        next.push({ key: "repos", num: gh.stats.publicRepos, text: "public repos" });
        next.push({ key: "stars", num: gh.stats.totalStars, text: "stars earned" });
      }
      if (projectCount) {
        next.push({ key: "projects", num: projectCount, text: "projects shipped" });
      }
      if (gh?.stats.topLanguages.length) {
        next.push({
          key: "langs",
          num: gh.stats.topLanguages.length,
          text: "languages shipped in",
        });
      }

      // Nothing resolved — better to render nothing than invented numbers.
      setStats(next.length >= 2 ? next : []);
    };
    load();
  }, []);

  if (stats?.length === 0) return null;

  return (
    <Section space="md">
      <SectionHeader
        cmd="stat --summary --live"
        meta={
          stats && (
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-faint">
              <FaGithub className="text-accent-dim" /> live from GitHub
            </span>
          )
        }
      />

      {!stats ? (
        <Skeleton className="h-[124px] w-full xl:h-[132px]" />
      ) : (
        /* gap-px over a line-coloured background draws true hairline dividers
           without doubling borders at the seams. Column count follows however
           many stats actually resolved, so a partial fetch still looks right. */
        <div
          className={`grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line shadow-e1 ${
            stats.length >= 4
              ? "xl:grid-cols-4"
              : stats.length === 3
                ? "xl:grid-cols-3"
                : "xl:grid-cols-2"
          }`}
        >
          {stats.map((item) => (
            <div
              key={item.key}
              className="bg-surface p-6 transition-colors duration-300 ease-out-quint hover:bg-surface-2"
            >
              <div className="font-mono">
                <span className="tnum accent-text text-4xl font-semibold tracking-tight xl:text-5xl">
                  <CountUp end={item.num} duration={2.2} delay={0.3} />
                </span>
              </div>
              <p className="mt-2 text-sm text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
};

export default Stats;

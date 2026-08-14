"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import { FaGithub, FaStar } from "react-icons/fa";
import type { GithubData } from "@/lib/github";

interface Project {
  id: string;
  title: string;
  category: string;
  stack: string;
  live: string | null;
  github: string | null;
}

/**
 * Two scrolling bands showing the range of what I've shipped, replacing the
 * old skills ticker — tool names say little, output says a lot.
 *
 *   upper  live products      — projects with a reachable URL
 *   lower  GitHub repos       — pinned when a token is configured, else top-starred
 *
 * The rows run in opposite directions (counter-motion reads as range rather
 * than as a banner) and both pause on hover, without which a marquee carrying
 * links is unusable because the target moves out from under the cursor.
 */
const ShippedMarquee = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [gh, setGh] = useState<GithubData | null>(null);

  useEffect(() => {
    fetch("/api/admin/projects")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.projects && setProjects(d.projects))
      .catch(() => {});
    fetch("/api/github")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: GithubData | null) => d && setGh(d))
      .catch(() => {});
  }, []);

  // Only things a visitor can actually open count as a "live product".
  const live = projects.filter((p) => p.live?.trim());
  const repos = gh?.pinned ?? [];

  if (live.length === 0 && repos.length === 0) return null;

  const Band = ({
    label,
    reverse,
    children,
  }: {
    label: React.ReactNode;
    reverse?: boolean;
    children: React.ReactNode[];
  }) => {
    if (children.length === 0) return null;
    return (
      <div className="group/band">
        <p className="container mx-auto mb-3 px-4 font-mono text-xs text-faint">
          {label}
        </p>
        <div
          className="overflow-hidden"
          /* Mask rather than gradient overlays so the fade works over
             whatever tone this band sits on. */
          style={{
            maskImage:
              "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
          }}
        >
          <div
            className={`flex w-max gap-3 ${
              reverse ? "animate-marquee-reverse" : "animate-marquee"
            } group-hover/band:[animation-play-state:paused]`}
          >
            {children}
            {/* Duplicated for a seamless -50% loop. */}
            {children}
          </div>
        </div>
      </div>
    );
  };

  const chip =
    "group flex shrink-0 items-center gap-2.5 rounded-lg border border-line bg-surface/70 px-4 py-2.5 shadow-e1 transition-all duration-200 ease-out-quint hover:-translate-y-px hover:border-accent/45 hover:bg-surface-2/70";

  return (
    <div className="space-y-7 border-y border-line bg-deep/40 py-7">
      <Band
        label={
          <>
            <span className="text-accent-dim">$</span> ls ~/live --products
          </>
        }
      >
        {live.map((p) => {
          const tool = p.stack?.split(",")[0]?.trim();
          return (
            <Link
              key={p.id}
              href={p.live as string}
              target="_blank"
              rel="noopener noreferrer"
              className={chip}
            >
              {/* Live dot — this one is reachable right now. */}
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              <span className="whitespace-nowrap font-mono text-sm text-ink transition-colors group-hover:text-accent">
                {p.title}
              </span>
              {tool && (
                <span className="whitespace-nowrap rounded-sm border border-line bg-surface-2/70 px-1.5 py-0.5 font-mono text-[10px] text-faint">
                  {tool}
                </span>
              )}
              <FiArrowUpRight className="shrink-0 text-xs text-faint transition-colors group-hover:text-accent" />
            </Link>
          );
        })}
      </Band>

      <Band
        reverse
        label={
          <>
            <span className="text-accent-dim">$</span> gh repo list{" "}
            {gh?.pinnedSource === "pinned" ? "--pinned" : "--sort=stars"}
          </>
        }
      >
        {repos.map((r) => (
          <Link
            key={r.name}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className={chip}
          >
            <FaGithub className="shrink-0 text-sm text-faint transition-colors group-hover:text-accent" />
            <span className="whitespace-nowrap font-mono text-sm text-ink transition-colors group-hover:text-accent">
              {r.name}
            </span>
            {r.language && (
              <span className="whitespace-nowrap rounded-sm border border-line bg-surface-2/70 px-1.5 py-0.5 font-mono text-[10px] text-faint">
                {r.language}
              </span>
            )}
            {r.stars > 0 && (
              <span className="tnum flex shrink-0 items-center gap-1 font-mono text-[11px] text-faint">
                <FaStar className="text-amber" />
                {r.stars}
              </span>
            )}
          </Link>
        ))}
      </Band>
    </div>
  );
};

export default ShippedMarquee;

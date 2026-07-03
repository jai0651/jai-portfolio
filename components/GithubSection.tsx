"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaStar, FaCodeBranch, FaGithub } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import { Skeleton } from "@/components/ui/skeleton";
import type { GithubData } from "@/lib/github";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Dart: "#00B4AB",
  Jupyter: "#DA5B0B",
  "Jupyter Notebook": "#DA5B0B",
  Vue: "#41b883",
};

const langColor = (l: string | null) =>
  (l && LANG_COLORS[l]) || "#818cf8";

const MAX_REPOS = 6;

const GithubSection = () => {
  const [data, setData] = useState<GithubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/github")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: GithubData) => setData(d))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  // Stay invisible if GitHub isn't configured/available — no error noise.
  if (failed || (!loading && !data)) return null;

  return (
    <section className="container mx-auto px-4 pb-8">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 flex items-center gap-2 font-mono text-xs text-faint">
            <span className="text-accent-dim">$</span> gh repo list --sort=stars
          </p>
          <h2 className="h2">
            Open <span className="gradient-text">source</span>
          </h2>
        </div>
        {data?.profile && (
          <a
            href={data.profile.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 self-start rounded-md border border-line bg-surface-2/60 px-4 py-2 font-mono text-sm text-muted transition-colors hover:border-accent/50 hover:text-accent"
          >
            <FaGithub /> @{data.profile.login}
          </a>
        )}
      </div>

      {/* Stats strip */}
      {loading ? (
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : (
        data && (
          <div className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-4">
            {[
              { label: "repositories", value: data.stats.publicRepos },
              { label: "total stars", value: data.stats.totalStars },
              { label: "forks", value: data.stats.totalForks },
              { label: "followers", value: data.stats.followers },
            ].map((s) => (
              <div key={s.label} className="bg-surface p-5">
                <p className="accent-text font-mono text-3xl font-semibold">
                  {s.value}
                </p>
                <p className="mt-1 font-mono text-sm text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        )
      )}

      {/* Repo cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data?.repos.slice(0, MAX_REPOS).map((repo, i) => (
            <motion.a
              key={repo.name}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
              className="group flex flex-col rounded-lg border border-line bg-surface/70 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-accent/40"
            >
              <div className="flex items-start justify-between">
                <h3 className="flex items-center gap-2 font-mono font-semibold text-ink group-hover:text-accent">
                  <FaGithub className="text-faint group-hover:text-accent" />
                  {repo.name}
                </h3>
                <FiExternalLink className="text-faint transition-colors group-hover:text-accent" />
              </div>

              <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted">
                {repo.description || "No description provided."}
              </p>

              {repo.topics.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {repo.topics.slice(0, 3).map((t) => (
                    <span key={t} className="chip text-[10px]">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center gap-4 font-mono text-xs text-muted">
                {repo.language && (
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: langColor(repo.language) }}
                    />
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <FaStar className="text-amber" /> {repo.stars}
                </span>
                <span className="flex items-center gap-1">
                  <FaCodeBranch /> {repo.forks}
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </section>
  );
};

export default GithubSection;

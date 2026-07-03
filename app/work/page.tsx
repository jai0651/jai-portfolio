"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FiArrowUpRight, FiGithub } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import GithubSection from "@/components/GithubSection";

interface Project {
  id: string;
  num: string;
  category: string;
  title: string;
  description: string;
  stack: string;
  image: string | null;
  live: string | null;
  github: string | null;
}

const Work = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/admin/projects");
        if (res.ok) setProjects((await res.json()).projects);
      } catch (e) {
        console.error("Failed to fetch projects:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-14 xl:py-20">
        <div className="mb-12 space-y-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-72" />
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-line bg-surface/60">
              <Skeleton className="aspect-[16/10] w-full rounded-none border-0" />
              <div className="space-y-3 p-6">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-14 xl:py-20">
      <div className="mb-12">
        <p className="mb-3 font-mono text-xs text-faint">
          <span className="text-accent-dim">$</span> ls ~/work —{" "}
          <span className="text-accent">{projects.length}</span> items
        </p>
        <h2 className="h2">
          Things I&apos;ve <span className="gradient-text">built</span>
        </h2>
        <p className="mt-3 max-w-xl font-mono text-sm text-muted">
          Products and experiments across full-stack engineering, applied AI,
          and a bit of computational physics.
        </p>
      </div>

      {projects.length === 0 ? (
        <p className="font-mono text-sm text-muted">
          <span className="text-accent-dim">#</span> no projects found.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => {
            const stackArray = project.stack
              ? project.stack.split(",").map((s) => s.trim()).filter(Boolean)
              : [];
            return (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: (index % 3) * 0.06 }}
                className="group flex flex-col overflow-hidden rounded-lg border border-line bg-surface/70 transition-all duration-200 hover:border-accent/40 hover:shadow-[0_16px_40px_-20px_rgba(126,231,135,0.35)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
                  <Image
                    src={project.image || "/assets/work/thumb1.png"}
                    fill
                    className="object-cover object-top opacity-60 grayscale transition-all duration-500 group-hover:scale-[1.04] group-hover:opacity-100 group-hover:grayscale-0"
                    alt={project.title}
                  />
                  {/* green wash + readability gradient */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-accent/10 to-transparent transition-opacity duration-500 group-hover:opacity-0" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface via-surface/25 to-transparent" />

                  {/* filename tag */}
                  <span className="absolute left-2.5 top-2.5 rounded border border-line bg-primary/70 px-2 py-0.5 font-mono text-[10px] text-accent-dim backdrop-blur-sm">
                    {project.category?.toLowerCase().replace(/\s+/g, "-") || "project"}/
                    {project.num}
                  </span>

                  {/* action links */}
                  <span className="absolute right-2.5 top-2.5 flex gap-1.5">
                    {project.live && (
                      <Link
                        href={project.live}
                        target="_blank"
                        className="flex h-7 w-7 items-center justify-center rounded border border-line bg-primary/70 text-faint backdrop-blur-sm transition-colors hover:border-accent/50 hover:text-accent"
                        aria-label="Live project"
                      >
                        <FiArrowUpRight className="text-sm" />
                      </Link>
                    )}
                    {project.github && (
                      <Link
                        href={project.github}
                        target="_blank"
                        className="flex h-7 w-7 items-center justify-center rounded border border-line bg-primary/70 text-faint backdrop-blur-sm transition-colors hover:border-accent/50 hover:text-accent"
                        aria-label="GitHub repository"
                      >
                        <FiGithub className="text-sm" />
                      </Link>
                    )}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h3 className="flex items-center gap-1.5 font-mono text-sm font-semibold text-ink transition-colors duration-200 group-hover:text-accent">
                    <span className="text-accent-dim">▸</span>
                    <span className="truncate">{project.title}</span>
                  </h3>
                  <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted line-clamp-2">
                    {project.description}
                  </p>
                  {stackArray.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {stackArray.slice(0, 3).map((item, i) => (
                        <span key={i} className="chip text-[10px] text-accent-dim">
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      <div className="mt-20 border-t border-line pt-16">
        <GithubSection />
      </div>
    </section>
  );
};

export default Work;

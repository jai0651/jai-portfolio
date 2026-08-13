"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FiArrowUpRight, FiGithub } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import Section from "@/components/Section";
import SectionHeader from "@/components/SectionHeader";
import { Skeleton } from "@/components/ui/skeleton";
import GithubSection from "@/components/GithubSection";
import { fadeUp, step } from "@/lib/motion";

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
      <Section space="md">
        <div className="mb-14 space-y-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <Skeleton className="aspect-[16/10] w-full rounded-none border-0" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </Section>
    );
  }

  return (
    <>
      <Section space="md">
        <SectionHeader
          as="h1"
          cmd="ls ~/work"
          title={
            <>
              Things I&apos;ve <span className="gradient-text">built</span>
            </>
          }
          sub="Products and experiments across full-stack engineering, applied AI, and a bit of computational physics."
          meta={
            projects.length > 0 && (
              <span className="chip tnum">
                <span className="text-accent">{projects.length}</span> items
              </span>
            )
          }
        />

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
                  {...fadeUp}
                  transition={step(index % 3)}
                  className="card card-lift group flex flex-col overflow-hidden"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
                    <Image
                      src={project.image || "/assets/work/thumb1.png"}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="thumb-duotone object-cover object-top transition-all duration-500 ease-out-quint"
                      alt={project.title}
                    />
                    {/* green wash + readability gradient (hover-capable only) */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-accent/10 to-transparent opacity-0 transition-opacity duration-500 [@media(hover:hover)]:opacity-100 [@media(hover:hover)]:group-hover:opacity-0" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface via-surface/25 to-transparent" />

                    {/* filename tag */}
                    <span className="absolute left-2.5 top-2.5 rounded-sm border border-line bg-primary/70 px-2 py-0.5 font-mono text-[10px] text-accent-dim backdrop-blur-sm">
                      {project.category?.toLowerCase().replace(/\s+/g, "-") || "project"}/
                      {project.num}
                    </span>

                    {/* action links */}
                    <span className="absolute right-2.5 top-2.5 flex gap-1.5">
                      {project.live && (
                        <Link
                          href={project.live}
                          target="_blank"
                          className="flex h-7 w-7 items-center justify-center rounded-sm border border-line bg-primary/70 text-faint backdrop-blur-sm transition-colors hover:border-accent/50 hover:text-accent"
                          aria-label={`${project.title} — live site`}
                        >
                          <FiArrowUpRight className="text-sm" />
                        </Link>
                      )}
                      {project.github && (
                        <Link
                          href={project.github}
                          target="_blank"
                          className="flex h-7 w-7 items-center justify-center rounded-sm border border-line bg-primary/70 text-faint backdrop-blur-sm transition-colors hover:border-accent/50 hover:text-accent"
                          aria-label={`${project.title} — GitHub repository`}
                        >
                          <FiGithub className="text-sm" />
                        </Link>
                      )}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="h4 flex items-center gap-1.5 text-ink transition-colors duration-200 group-hover:text-accent">
                      <span className="text-accent-dim">▸</span>
                      <span className="truncate">{project.title}</span>
                    </h3>
                    <p className="mt-2 line-clamp-2 flex-1 text-[13px] leading-relaxed text-muted">
                      {project.description}
                    </p>
                    {stackArray.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
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
      </Section>

      <GithubSection />
    </>
  );
};

export default Work;

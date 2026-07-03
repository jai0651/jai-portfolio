"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Photo from "@/components/Photo";
import Social from "@/components/Social";
import Stats from "@/components/Stats";
import TerminalHero from "@/components/TerminalHero";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FiDownload, FiArrowUpRight, FiGithub } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

interface ProfileData {
  profile_name?: string;
  profile_title?: string;
  profile_description?: string;
  profile_photo?: string;
}

interface Skill {
  id: string;
  name: string;
}

const openChat = () => window.dispatchEvent(new Event("open-chat"));

const DEFAULT_BIO =
  "I build systems where software meets machine learning, maths and physics — from LLM agents in production to differentiable-physics research.";

// Curated, hand-picked highlights — read like a git log of recent work.
const HIGHLIGHTS = [
  {
    tag: "feat(prod)",
    title: "Support-debug AI agent",
    desc: "An LLM agent running in production that triages incoming support issues, reproduces them against logs, and root-causes bugs — cutting time-to-diagnosis for the team.",
    href: null as string | null,
  },
  {
    tag: "feat(ml)",
    title: "SMS classification",
    desc: "A text-classification pipeline that labels and routes SMS messages by intent — from raw data to a deployed, evaluated model.",
    href: null as string | null,
  },
  {
    tag: "research(iit-d)",
    title: "Reducing numerical errors with deep learning",
    desc: "My B.Tech thesis at IIT Delhi: embedding neural networks inside differentiable physics solvers so a cheap, low-fidelity simulation learns to correct its own numerical error toward high-fidelity ground truth.",
    href: "https://github.com/jai0651/Reducing-Numerical-errors-using-Deep-Learning",
  },
];

export default function Home() {
  const [profile, setProfile] = useState<ProfileData>({});
  const [skills, setSkills] = useState<Skill[]>([]);
  const [resumeUrl, setResumeUrl] = useState<string>("/JaiShankar_cv.pdf");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, resumeRes, skillsRes] = await Promise.all([
          fetch("/api/admin/settings"),
          fetch("/api/admin/resume"),
          fetch("/api/admin/skills"),
        ]);
        if (profileRes.ok) setProfile((await profileRes.json()).settings);
        if (resumeRes.ok) {
          const data = await resumeRes.json();
          if (data.resume) setResumeUrl(data.resume.url);
        }
        if (skillsRes.ok) setSkills((await skillsRes.json()).skills || []);
      } catch (e) {
        console.error("Failed to fetch data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4 pt-8 xl:pt-12">
        <div className="flex flex-col-reverse items-center gap-10 xl:flex-row xl:items-start xl:justify-between">
          <Skeleton className="h-[420px] w-full max-w-2xl rounded-lg" />
          <Skeleton className="h-[360px] w-[260px] shrink-0 rounded-lg xl:w-[380px]" />
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden">
      <div className="container mx-auto px-4 pt-8 xl:pt-12">
        <div className="flex flex-col-reverse items-center gap-10 xl:flex-row xl:items-start xl:justify-between">
          {/* ── Interactive terminal + actions ────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="w-full max-w-2xl space-y-5"
          >
            <TerminalHero
              name={profile.profile_name || "Jai Shankar"}
              bio={profile.profile_description || DEFAULT_BIO}
              skills={skills}
              resumeUrl={resumeUrl}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button onClick={openChat} size="lg" className="w-full sm:w-auto">
                <HiSparkles className="text-base" />
                chat with my AI
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/work">
                  view work
                  <FiArrowUpRight className="text-base" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto">
                <a href={resumeUrl} download>
                  <FiDownload className="text-base" />
                  cv
                </a>
              </Button>
            </div>

            <div className="flex items-center gap-3 font-mono text-sm">
              <span className="text-faint">find me</span>
              <Social
                containerStyles="flex gap-2"
                iconStyles="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface-2/60 text-muted transition-all duration-200 hover:border-accent/50 hover:text-accent hover:-translate-y-0.5"
              />
            </div>
          </motion.div>

          {/* ── Avatar ────────────────────────────────────────── */}
          <div className="shrink-0">
            <Photo src={profile.profile_photo} />
          </div>
        </div>
      </div>

      {/* ── Recent work — reads like a git log ──────────────────── */}
      <div className="container mx-auto px-4 py-16 xl:py-20">
        <p className="mb-6 font-mono text-xs text-faint">
          <span className="text-accent-dim">$</span> git log --oneline --recent
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {HIGHLIGHTS.map((h, i) => {
            const Wrapper = h.href ? "a" : "div";
            return (
              <motion.div
                key={h.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <Wrapper
                  {...(h.href
                    ? { href: h.href, target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="group flex h-full flex-col gap-3 rounded-lg border border-line bg-surface/70 p-5 transition-all duration-200 hover:border-accent/40 hover:bg-surface-2/60"
                >
                  <div className="flex items-center justify-between">
                    <span className="chip text-accent">{h.tag}</span>
                    {h.href && (
                      <FiGithub className="text-faint transition-colors group-hover:text-accent" />
                    )}
                  </div>
                  <h3 className="font-mono text-base font-semibold text-ink group-hover:text-accent">
                    {h.title}
                  </h3>
                  <p className="text-sm text-muted">{h.desc}</p>
                  {h.href && (
                    <span className="mt-auto inline-flex items-center gap-1 font-mono text-xs text-accent-dim group-hover:text-accent">
                      view source <FiArrowUpRight />
                    </span>
                  )}
                </Wrapper>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Skills ticker ───────────────────────────────────────── */}
      {skills.length > 0 && (
        <div className="relative my-4 overflow-hidden border-y border-line py-5">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-primary to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-primary to-transparent" />
          <div className="flex w-max animate-marquee gap-3">
            {[...skills, ...skills].map((skill, i) => (
              <span
                key={`${skill.id}-${i}`}
                className="flex items-center gap-2 whitespace-nowrap font-mono text-sm text-muted"
              >
                <span className="text-accent-dim">▹</span>
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="pt-16" />
      <Stats />
    </section>
  );
}

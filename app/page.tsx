"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Interests from "@/components/Interests";
import Photo from "@/components/Photo";
import Section from "@/components/Section";
import SectionHeader from "@/components/SectionHeader";
import Social from "@/components/Social";
import Stats from "@/components/Stats";
import TerminalHero from "@/components/TerminalHero";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fadeUp, fadeUpNow, lead, step } from "@/lib/motion";
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
// Ordered as a narrative: production work, then from-scratch ML, then research.
const HIGHLIGHTS = [
  {
    tag: "feat(prod)",
    title: "Support-debug AI agent",
    desc: "An LLM agent running in production that triages incoming support issues, reproduces them against logs, and root-causes bugs — cutting time-to-diagnosis for the team.",
    href: null as string | null,
  },
  {
    tag: "feat(voice)",
    title: "Voice agent from scratch",
    desc: "VAD, ASR, TTS and the real-time pipeline connecting them — built layer by layer in PyTorch rather than calling a pretrained black box. Swapping a BiGRU+CTC baseline for a Conformer halved word error on identical audio and ran 2.7× faster.",
    href: "https://github.com/jai0651/VAD-ASR",
  },
  {
    tag: "feat(local)",
    title: "Fully local voice notetaker",
    desc: "Talk to a Mac, get organised Obsidian notes. Whisper large-v3-turbo on MLX and a local Qwen through Ollama, so the audio and the notes never leave the machine.",
    href: "https://github.com/jai0651/Local-AI-voice-notemaker",
  },
  {
    tag: "feat(audio)",
    title: "Real-time call denoiser",
    desc: "DeepFilterNet3 sitting between the real microphone and a virtual audio device, so Zoom, Meet or a softphone only ever receive the clean signal.",
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
      <Section tone="hero" space="none" className="pb-16 pt-8 xl:pb-24 xl:pt-12">
        <div className="flex flex-col-reverse items-center gap-10 xl:flex-row xl:items-start xl:justify-between">
          <div className="w-full max-w-2xl space-y-5">
            <Skeleton className="h-[420px] w-full rounded-xl" />
            <div className="flex gap-3">
              <Skeleton className="h-12 w-44" />
              <Skeleton className="h-12 w-36" />
            </div>
          </div>
          <Skeleton className="h-[400px] w-[260px] shrink-0 rounded-xl xl:w-[380px]" />
        </div>
      </Section>
    );
  }

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <Section tone="hero" space="none" className="pb-16 pt-8 xl:pb-24 xl:pt-12">
        <div className="flex flex-col-reverse items-center gap-10 xl:flex-row xl:items-start xl:justify-between">
          {/* Interactive terminal + actions */}
          <motion.div
            {...fadeUpNow}
            transition={lead()}
            className="w-full max-w-2xl space-y-6"
          >
            <TerminalHero
              name={profile.profile_name || "Jai Shankar"}
              bio={profile.profile_description || DEFAULT_BIO}
              skills={skills}
              resumeUrl={resumeUrl}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                onClick={openChat}
                variant="cta"
                size="lg"
                className="w-full sm:w-auto"
              >
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

            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-faint">
                find me
              </span>
              <span className="h-px flex-1 bg-line sm:max-w-8" />
              <Social
                containerStyles="flex gap-2"
                iconStyles="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface-2/60 text-muted shadow-e1 transition-all duration-200 ease-out-quint hover:border-accent/50 hover:text-accent hover:-translate-y-0.5"
              />
            </div>
          </motion.div>

          {/* Avatar */}
          <div className="shrink-0">
            <Photo src={profile.profile_photo} />
          </div>
        </div>
      </Section>

      {/* ── Recent work — reads like a git log ───────────────────── */}
      <Section tone="alt" space="md">
        <SectionHeader
          cmd="git log --oneline --recent"
          title={
            <>
              Recently <span className="gradient-text">shipped</span>
            </>
          }
          sub="Production LLM agents, speech models built from the ground up, local-first AI tooling, and research code."
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {HIGHLIGHTS.map((h, i) => {
            const Wrapper = h.href ? "a" : "div";
            return (
              <motion.div key={h.title} {...fadeUp} transition={step(i)}>
                <Wrapper
                  {...(h.href
                    ? { href: h.href, target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="card card-lift group flex h-full flex-col gap-3 p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="chip text-accent">{h.tag}</span>
                    {h.href && (
                      <FiGithub className="text-faint transition-colors group-hover:text-accent" />
                    )}
                  </div>
                  <h3 className="h4 text-ink transition-colors group-hover:text-accent">
                    {h.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-muted">{h.desc}</p>
                  {h.href && (
                    <span className="mt-auto inline-flex items-center gap-1 pt-1 font-mono text-xs text-accent-dim transition-colors group-hover:text-accent">
                      view source <FiArrowUpRight />
                    </span>
                  )}
                </Wrapper>
              </motion.div>
            );
          })}
        </div>
      </Section>

      {/* ── Interests ───────────────────────────────────────────── */}
      <Interests />

      {/* ── Skills ticker ───────────────────────────────────────── */}
      {skills.length > 0 && (
        <div
          className="overflow-hidden border-b border-line py-5"
          /* Mask instead of gradient overlays so the fade works on any
             background tone rather than only over --color-primary. */
          style={{
            maskImage:
              "linear-gradient(to right, transparent, #000 7%, #000 93%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, #000 7%, #000 93%, transparent)",
          }}
        >
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

      <Stats />
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Interests from "@/components/Interests";
import Photo from "@/components/Photo";
import ShippedMarquee from "@/components/ShippedMarquee";
import Section from "@/components/Section";
import SectionHeader from "@/components/SectionHeader";
import Social from "@/components/Social";
import Stats from "@/components/Stats";
import TerminalHero from "@/components/TerminalHero";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fadeUp, fadeUpNow, lead, step } from "@/lib/motion";
import { FiDownload, FiArrowUpRight, FiGithub, FiMic } from "react-icons/fi";


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

// The hero CTA opens the voice UI; the terminal chip opens text chat.
const openVoice = () =>
  window.dispatchEvent(new CustomEvent("open-chat", { detail: { mode: "voice" } }));

// Mirrors the profile_description site setting; only shown if that fetch fails.
const DEFAULT_BIO =
  "I build things that listen. LLM agents in production by day; by night, systems built from the ground up: VAD, ASR, TTS and the real-time pipeline between them, a video retrieval stack, and an assistant that runs entirely on one machine. Same instinct as my IIT Delhi thesis, which taught a cheap simulation to correct its own numerical error: open the box, learn every layer, then make it fast.";

// Curated, hand-picked highlights — read like a git log of recent work.
// Ordered as a narrative: production work, then from-scratch ML, then research.
const HIGHLIGHTS = [
  {
    tag: "feat(prod)",
    title: "Support-debug AI agent",
    desc: "An LLM agent running in production that triages incoming support issues, reproduces them against logs, and root-causes bugs, cutting time-to-diagnosis for the team.",
    href: null as string | null,
  },
  {
    tag: "feat(agent)",
    title: "Vela, a resident local assistant",
    desc: "A process that keeps running after you close the window. She sees the room through the camera, hears you and answers out loud in about 2 seconds end to end, with everything except the language model on the machine: Silero VAD, whisper-base.en, Kokoro-82M at 13.2x realtime on Metal, and a three.js body.",
    href: "https://github.com/jai0651/Vela",
  },
  {
    tag: "feat(video)",
    title: "Video intelligence engine from scratch",
    desc: "Ask a two-hour video when backpropagation was explained and get the answer back with the timestamps and frames that prove it. A mini-CLIP, an ANN index, a shot detector and a spatiotemporal encoder all written explicitly, then benchmarked against the production alternative behind the same interface.",
    href: "https://github.com/jai0651/VLM",
  },
  {
    tag: "feat(voice)",
    title: "Voice agent from scratch",
    desc: "VAD, ASR, TTS and the real-time pipeline connecting them, built layer by layer in PyTorch. A Conformer with BPE and dynamic chunk streaming replaced the BiGRU+CTC baseline and halved word error on identical audio at 2.7x the speed, then an ISTFT vocoder, voice cloning and speaker embeddings on top.",
    href: "https://github.com/jai0651/VAD-ASR",
  },
  {
    tag: "feat(proto)",
    title: "Tonecall, an inter-agent voice handshake",
    desc: "Two AI agents on the same phone call detect each other with in-band DTMF and drop the speech-to-text to LLM to text-to-speech loop for a JSON side-channel, about 3 seconds against 4 to 6 per voice turn, while keeping the call open for a human.",
    href: "https://github.com/jai0651/tonecall",
  },
  {
    tag: "feat(local)",
    title: "Fully local voice notetaker",
    desc: "Talk to a Mac, get organised Obsidian notes. Whisper large-v3-turbo on MLX and a local Qwen through Ollama, so the audio and the notes never leave the machine.",
    href: "https://github.com/jai0651/Local-AI-voice-notemaker",
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
                onClick={openVoice}
                variant="cta"
                size="lg"
                className="w-full sm:w-auto"
              >
                <FiMic className="text-base" />
                talk to my AI
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

      {/* ── What I have shipped, scrolling ─────────────────────── */}
      <ShippedMarquee />

      <Stats />
    </>
  );
}

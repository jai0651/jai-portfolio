"use client";

import { motion } from "framer-motion";
import Section from "./Section";
import SectionHeader from "./SectionHeader";
import { fadeUp, step } from "@/lib/motion";

/**
 * Numbered editorial list rather than a grid of bordered cards — the same
 * pattern as the reference: index in gold mono, title in mono, prose in Inter.
 * No icons on purpose; the list works because it's typographic and tight, and
 * an icon per row would turn four specific thoughts into a feature matrix.
 */
const INTERESTS = [
  {
    num: "01",
    title: "Multimodal AI",
    body: "Models that read, see and listen at once. The interesting part is the seam — how a system grounds a sentence in a single frame, and the specific ways it fails when it can't.",
  },
  {
    num: "02",
    title: "Voice AI, end to end",
    body: "Speech in, speech out, under a latency budget. Endpointing and barge-in are where a voice agent stops feeling like a demo and starts feeling like a conversation.",
  },
  {
    num: "03",
    title: "Local & on-device models",
    body: "Apple Silicon is quietly fast enough. Running Whisper and a 9B model on a laptop means the private things never have to leave it.",
  },
  {
    num: "04",
    title: "Astronomy",
    body: "The oldest data problem there is. Light that left its source before the Earth existed, and instruments patient enough to make sense of it.",
  },
  {
    num: "05",
    title: "Systems & computers",
    body: "How the machine actually works — compiler, kernel, cache line. Abstractions get more useful once you've looked underneath them at least once.",
  },
  {
    num: "06",
    title: "Maths & physics",
    body: "Differentiable solvers and numerical error. My thesis taught a cheap simulation to correct its own drift toward the truth, and I've been hooked since.",
  },
];

const Interests = () => (
  <Section space="md">
    <SectionHeader
      cmd="cat ~/.interests"
      title={
        <>
          Things I keep <span className="gradient-text">thinking about</span>
        </>
      }
      sub="Outside the day job — the areas I read about, tinker with, and lose weekends to."
    />

    <div className="grid grid-cols-1 gap-x-12 gap-y-9 md:grid-cols-2">
      {INTERESTS.map((item, i) => (
        <motion.div
          key={item.num}
          {...fadeUp}
          transition={step(i)}
          className="group flex gap-4"
        >
          <span className="tnum shrink-0 pt-0.5 font-mono text-sm font-semibold text-accent">
            {item.num}
          </span>
          <div className="min-w-0">
            <h3 className="h4 text-ink transition-colors duration-200 group-hover:text-accent">
              {item.title}
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              {item.body}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  </Section>
);

export default Interests;

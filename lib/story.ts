/**
 * Content for the "Open the box" story page (/story, prototype).
 *
 * Every number here is taken from somewhere already public on the site: the
 * experience entries on /resume, the project descriptions on /work, or the
 * measurements in the blog posts. Nothing is rounded up or estimated.
 *
 * The page follows one object, a stack of five layers. Each chapter lights the
 * layers its work lives in, with a short note per lit layer, so by the end the
 * visitor has seen the whole range light up.
 */

export type LayerId = "product" | "agents" | "models" | "systems" | "silicon";

export const LAYERS: { id: LayerId; label: string }[] = [
  { id: "product", label: "Product" },
  { id: "agents", label: "Agents" },
  { id: "models", label: "Models" },
  { id: "systems", label: "Systems" },
  { id: "silicon", label: "Silicon" },
];

export interface Stat {
  value: string;
  label: string;
}

export interface Tile {
  area: string;
  value: string;
  title: string;
  caption: string;
  href: string;
  cta: string;
}

export interface Row {
  title: string;
  meta?: string;
  desc?: string;
  href: string;
}

export interface Chapter {
  id: string;
  num: string;
  eyebrow: string;
  title: string;
  body: string;
  /** Lit layers, each with the note shown beside it on the stack. */
  lit: Partial<Record<LayerId, string>>;
  /** One mono line of context: where, what role, when. */
  context?: string;
  stats?: Stat[];
  aside?: string;
  tiles?: Tile[];
  rows?: Row[];
  cards?: Row[];
  /** Short factual bullet points. */
  points?: string[];
  links?: { label: string; href: string }[];
}

export const HERO = {
  eyebrow: "Jai Shankar · Software / AI engineer",
  /** "I open the box, learn every layer, then make it ___" — flips through these. */
  makeIt: ["fast.", "reliable.", "secure.", "scale."],
  sub: "I work on voice and messaging infrastructure at Plivo. Outside work I build speech, vision and agent systems from scratch, and write up what I measure.",
};

export const CHAPTERS: Chapter[] = [
  {
    id: "origin",
    num: "01",
    eyebrow: "Where it started",
    title: "A simulation that learned to fix its own mistakes.",
    body: "Cheap physics simulations drift away from the truth. For my B.Tech thesis I put a neural network inside a differentiable solver and trained the cheap simulation to correct its own numerical error toward the expensive one. I've worked the same way since: take the thing apart until I understand each layer.",
    context: "IIT Delhi · B.Tech, Engineering & Computational Mechanics · 2020–2024",
    lit: { models: "a network inside a physics solver" },
    links: [
      {
        label: "Thesis code",
        href: "https://github.com/jai0651/Reducing-Numerical-errors-using-Deep-Learning",
      },
    ],
  },
  {
    id: "production",
    num: "02",
    eyebrow: "Day job",
    title: "At Plivo, I work on the systems behind phone calls and SMS.",
    body: "Two very different parts of it. One is an AI agent for support engineers that reads production logs, internal docs and code. The other is the media path that carries call audio, where small changes show up on the infrastructure bill.",
    context: "Plivo · Software Engineer · since Sep 2025",
    stats: [
      {
        value: "2×",
        label: "concurrent calls per machine, after tuning RTP handling, kernel sockets and the codec hot paths",
      },
      { value: "50%", label: "lower infrastructure cost across the fleet" },
      {
        value: "~50%",
        label: "less support work, once the agent took over triage",
      },
      { value: "70%", label: "less time spent validating staging and investigating production issues" },
    ],
    aside:
      "Before Plivo I was at Hyperbots for just over a year, where I built and ran five backend services handling 100K+ events a day. I owned them from the design doc through to on-call.",
    lit: {
      agents: "support agent over logs, docs, code",
      models: "sub-ms SMS classifier",
      systems: "RTP · kernel · sockets · codecs",
    },
  },
  {
    id: "from-scratch",
    num: "03",
    eyebrow: "From scratch",
    title: "Outside work, I build the models myself.",
    body: "I write them layer by layer in PyTorch instead of calling an API, then compare them with the production version of the same thing.",
    tiles: [
      {
        area: "Speech",
        value: "44%",
        title: "A speech recognizer, from scratch",
        caption:
          "fewer word errors after replacing a BiGRU+CTC baseline with a streaming Conformer, on the same 4.1 hours of audio, at 2.7× the speed.",
        href: "/blog/speech-recognition-from-scratch",
        cta: "read the post",
      },
      {
        area: "Generative · on-device",
        value: "9.9 s",
        title: "A headshot generator that runs on-device",
        caption: "per image on an M4, with all 3,057 UNet ops on the Neural Engine. The GPU took 18.5 s.",
        href: "https://github.com/jai0651/on-device-headshot-generator",
        cta: "source",
      },
      {
        area: "Vision",
        value: "84%",
        title: "Video search that cites its sources",
        caption: "of uniformly sampled frames were near-duplicates of another frame, so most of the encoding budget went on the same slide.",
        href: "/blog/video-search-from-scratch",
        cta: "read the post",
      },
      {
        area: "Local agents",
        value: "~2 s",
        title: "Vela, a voice assistant on my laptop",
        caption: "per spoken turn, with everything except the language model running on a MacBook Air.",
        href: "https://github.com/jai0651/Vela",
        cta: "source",
      },
      {
        area: "Protocols",
        value: "~3 s",
        title: "Tonecall",
        caption: "for two AI agents on the same call to swap a JSON message instead of talking. A spoken turn takes 4–6 s.",
        href: "/blog/tonecall-inter-agent-voice-handshake",
        cta: "read the post",
      },
    ],
    lit: {
      models: "ASR · TTS · CLIP · DDPM",
      systems: "an agent-to-agent call protocol",
      silicon: "Metal · MLX · Neural Engine",
    },
  },
  {
    id: "shipped",
    num: "04",
    eyebrow: "Live product",
    title: "Patronus is live at patronus.cv.",
    body: "It keeps a record of what you actually shipped, collected through chat on the web or Telegram. Then it turns that record into job-fit checks, tailored resumes, recruiter notes and review prep.",
    points: [
      "Every line it writes links back to evidence the user has confirmed, and a guard rejects any number that isn't in the source.",
      "All model calls go through one wrapper that handles validation, retries and cost logging.",
      "Background work runs on a Postgres job queue with per-user fan-out and unique dedupe keys, so a double-fired cron does nothing.",
    ],
    links: [
      { label: "Open patronus.cv", href: "https://www.patronus.cv" },
      { label: "How it's built", href: "/work/patronus" },
    ],
    lit: {
      product: "patronus.cv",
      agents: "resumes from confirmed evidence",
      systems: "a Postgres job queue",
    },
  },
  {
    id: "writing",
    num: "05",
    eyebrow: "Writing",
    title: "I write up what I measure, including the parts that didn't work.",
    body: "Long build guides with numbers from real runs. I also made two free courses while learning a subject properly.",
    rows: [
      {
        title: "How I built a speech recognizer from scratch, layer by layer",
        meta: "14 min",
        href: "/blog/speech-recognition-from-scratch",
      },
      {
        title: "How text to speech actually works: durations, attention, vocoders",
        meta: "12 min",
        href: "/blog/how-text-to-speech-works",
      },
      {
        title: "How to build a video search engine that cites its sources",
        meta: "10 min",
        href: "/blog/video-search-from-scratch",
      },
      {
        title: "How to build a local AI assistant that answers in two seconds",
        meta: "8 min",
        href: "/blog/local-ai-assistant-from-scratch",
      },
      {
        title: "Two AI agents on a phone call should stop talking",
        meta: "7 min",
        href: "/blog/tonecall-inter-agent-voice-handshake",
      },
    ],
    cards: [
      {
        title: "KnowML",
        meta: "course · 28 sections",
        desc: "Modern ML, starting from the maths and ending at what shipped in 2026.",
        href: "https://knowml.vercel.app",
      },
      {
        title: "KnowSys",
        meta: "course",
        desc: "How computers really run your code: CPUs, memory, the kernel, storage and distributed systems.",
        href: "https://knowsys.tech",
      },
    ],
    lit: {
      models: "ASR · TTS · retrieval guides",
      systems: "the KnowSys course",
      silicon: "a 2-second assistant on an M4",
    },
  },
  {
    id: "now",
    num: "06",
    eyebrow: "Right now",
    title: "Learning to fit image models onto a phone.",
    body: "I'm learning diffusion, LoRA fine-tuning and quantization by building the headshot generator, then converting it to Core ML and profiling it on the Neural Engine. I built the evaluation harness before training anything.",
    lit: {
      models: "diffusion · LoRA · quantization",
      silicon: "Core ML · Neural Engine",
    },
  },
  {
    id: "contact",
    num: "07",
    eyebrow: "Get in touch",
    title: "If your problem crosses a few of these layers, I'd like to hear about it.",
    body: "Those are the problems I enjoy most. The contact form comes straight to me, and the CV has the details.",
    lit: {
      product: "Patronus",
      agents: "the support agent at Plivo",
      models: "ASR, TTS, diffusion",
      systems: "the telephony media path",
      silicon: "Neural Engine, MLX",
    },
  },
];

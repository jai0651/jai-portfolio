import type { ProjectDetail } from "./types";
import callDenoiser from "./details/call-denoiser";
import headshotGenerator from "./details/headshot-generator";
import patronus from "./details/patronus";
import tonecall from "./details/tonecall";
import vela from "./details/vela";
import videoSearch from "./details/video-search";
import voiceAgent from "./details/voice-agent";
import voiceNotetaker from "./details/voice-notetaker";

export type { ProjectDetail };

/**
 * Explainers, in no particular order; /work orders them by the database's
 * `order` column. Add a file under ./details and import it here.
 */
export const DETAILS: ProjectDetail[] = [
  patronus,
  vela,
  videoSearch,
  headshotGenerator,
  voiceAgent,
  tonecall,
  voiceNotetaker,
  callDenoiser,
];

/**
 * Older projects kept in the database but no longer shown on the site.
 * Matched against the live URL and repository URL.
 *
 * Once these rows are switched off in the admin panel (isActive = false),
 * this list can go.
 */
const RETIRED = ["tripgennie", "trip-gennie", "ddos-attack-visualizer", "ddos.theweekendworld"];

interface ProjectRow {
  title: string;
  github: string | null;
  live: string | null;
}

export const isRetired = (p: ProjectRow) => {
  const haystack = `${p.github ?? ""} ${p.live ?? ""}`.toLowerCase();
  return RETIRED.some((r) => haystack.includes(r));
};

export const detailFor = (p: ProjectRow) =>
  DETAILS.find(
    (d) =>
      (d.match.github && d.match.github === p.github?.trim()) ||
      (d.match.title && d.match.title === p.title.trim())
  ) ?? null;

/**
 * Projects with a write-up on the blog, keyed by repository URL. The project
 * table has no column for this, and four entries don't justify one.
 */
export const POST_FOR_REPO: Record<string, string> = {
  "https://github.com/jai0651/VAD-ASR": "/blog/speech-recognition-from-scratch",
  "https://github.com/jai0651/VLM": "/blog/video-search-from-scratch",
  "https://github.com/jai0651/Vela": "/blog/local-ai-assistant-from-scratch",
  "https://github.com/jai0651/tonecall": "/blog/tonecall-inter-agent-voice-handshake",
};

/** "AI Product / Live" → "ai-product/live" */
export const slugCategory = (c: string) =>
  c.trim().toLowerCase().replace(/\s*\/\s*/g, "/").replace(/\s+/g, "-");

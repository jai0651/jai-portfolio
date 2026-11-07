/**
 * The one-page explainer behind each project card on /work.
 *
 * The goal is that someone who reads only this page understands what the
 * project is, why it exists, how it works and what came out of it, without
 * opening the repository. Every fact must come from a source listed in
 * `sources`; nothing is estimated or rounded up.
 */
export interface ProjectDetail {
  /** URL segment: /work/<slug> */
  slug: string;
  /** How to find the matching database row: repo URL, or exact title when there is no repo. */
  match: { github?: string; title?: string };
  /** Short display name, e.g. "Patronus". */
  title: string;
  /** One plain sentence saying what it is. Shown under the title. */
  oneLiner: string;
  /** One or two short paragraphs: the problem and the idea. Readable on its own. */
  overview: string[];
  /** Two to four measured results, each from a source. Empty if there are none. */
  highlights: { value: string; label: string }[];
  /** Three to six steps, in the order data flows through the system. */
  how: { title: string; body: string }[];
  /** Two to four design choices, trade-offs, or things that didn't work. */
  decisions: { title: string; body: string }[];
  /** Tech stack, grouped, e.g. { group: "Models", items: ["Whisper", "Kokoro-82M"] }. */
  stack: { group: string; items: string[] }[];
  /** Where it stands today, e.g. "Live at patronus.cv" or "Open source, runs on a Mac". */
  status: string;
  /** Extra links beyond live site, source and blog post (demo video, paper, etc.). */
  links?: { label: string; href: string }[];
  /** Where each fact came from. Not rendered; kept so the page can be audited. */
  sources: string[];
}

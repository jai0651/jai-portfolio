import fs from "node:fs";
import path from "node:path";

/**
 * File-based blog. The whole contract is: drop a self-contained `.html`
 * file into `content/blog/` and it ships as a post.
 *
 * Metadata comes from standard head tags, so a generated HTML doc already
 * carries most of it:
 *
 *   <title>            → title      (a " · suffix" is trimmed)
 *   <meta description> → summary
 *   <meta date>        → YYYY-MM-DD
 *   <meta tags>        → comma-separated
 *
 * The body is whatever is inside <main> — preferred, because these docs put
 * their own hero and prev/next footer outside it and this site supplies both
 * itself. Falls back to <body>, then the raw file.
 *
 * Content is first-party and committed to this repo, which is why rendering
 * it with dangerouslySetInnerHTML is fine. If this ever ingests third-party
 * or user-submitted HTML, it needs a sanitizer first.
 */
export interface Post {
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  readingMinutes: number;
  html: string;
}

const DIR = path.join(process.cwd(), "content", "blog");

function readMeta(name: string, src: string): string {
  // Attributes appear in either order depending on who generated the file.
  const forward = src.match(
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]*content=["']([^"']*)["']`, "i")
  );
  if (forward) return forward[1].trim();
  const reverse = src.match(
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*name=["']${name}["']`, "i")
  );
  return reverse?.[1]?.trim() ?? "";
}

function extractBody(src: string): string {
  const main = src.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  const inner =
    main ?? src.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? src;

  // Drop the artifact's own presentation so it can't fight the site theme.
  return inner
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<link[^>]*>/gi, "")
    .trim();
}

function parse(slug: string, src: string): Post {
  const rawTitle = src.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? slug;
  const html = extractBody(src);
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const tags = readMeta("tags", src);

  return {
    slug,
    // "2 · VAD Deep Dive — Voice Agent From Scratch" → "2 · VAD Deep Dive"
    title: rawTitle.split(/\s+[—|]\s+/)[0].trim(),
    summary: readMeta("description", src),
    date: readMeta("date", src),
    tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    readingMinutes: Math.max(1, Math.round(words / 200)),
    html,
  };
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".html"))
    .map((f) => parse(f.replace(/\.html$/, ""), fs.readFileSync(path.join(DIR, f), "utf8")))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | null {
  const file = path.join(DIR, `${slug}.html`);
  if (!fs.existsSync(file)) return null;
  return parse(slug, fs.readFileSync(file, "utf8"));
}

/** "2026-08-13" → "13 Aug 2026". Returns "" for missing dates. */
export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

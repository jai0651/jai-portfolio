import sanitizeHtml from "sanitize-html";

/**
 * Turns an uploaded self-contained .html file into a storable post.
 *
 * Metadata comes from standard head tags, so a generated doc already carries
 * most of it:
 *   <title>            → title (a " — suffix" is trimmed)
 *   <meta description> → summary
 *   <meta date>        → YYYY-MM-DD
 *   <meta tags>        → comma-separated
 *
 * The body is whatever sits inside <main> — preferred, because these docs put
 * their own hero and prev/next footer outside it and the site supplies both.
 * Falls back to <body>, then the whole file.
 *
 * Everything is then run through an allowlist sanitizer. This matters more
 * than it looks: HTML now arrives at runtime, and generated artifacts often
 * carry <script> for interactivity, which would break the page even setting
 * XSS aside. The allowlist is deliberately the same vocabulary that
 * .tech-article styles — anything outside it wouldn't have rendered correctly
 * anyway.
 */
export interface ParsedPost {
  title: string;
  summary: string;
  date: string;
  tags: string[];
  html: string;
  readingMinutes: number;
}

const TEXT_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "div", "span", "br", "hr",
  "ul", "ol", "li", "dl", "dt", "dd",
  "strong", "b", "em", "i", "u", "s", "sup", "sub", "mark", "small",
  "blockquote", "pre", "code", "kbd", "samp", "var",
  "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col",
  "details", "summary", "abbr", "time",
];

// Inline SVG is allowed so diagrams that aren't ASCII still work.
const SVG_TAGS = [
  "svg", "g", "defs", "marker", "path", "rect", "circle", "ellipse",
  "line", "polyline", "polygon", "text", "tspan", "title", "desc",
  "linearGradient", "radialGradient", "stop", "clipPath", "use",
];

const SVG_ATTRS = [
  "viewBox", "xmlns", "width", "height", "fill", "stroke", "stroke-width",
  "stroke-linecap", "stroke-linejoin", "stroke-dasharray", "d", "x", "y",
  "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry", "points", "transform",
  "opacity", "fill-opacity", "stroke-opacity", "text-anchor", "dominant-baseline",
  "font-size", "font-family", "font-weight", "offset", "stop-color",
  "gradientUnits", "markerWidth", "markerHeight", "refX", "refY", "orient",
  "preserveAspectRatio", "clip-path", "href",
];

export function sanitizePostHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [...TEXT_TAGS, ...SVG_TAGS],
    allowedAttributes: {
      "*": ["class", "id", "title", "aria-label", "aria-hidden", "role", "lang", "dir"],
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      td: ["colspan", "rowspan", "align"],
      th: ["colspan", "rowspan", "align", "scope"],
      col: ["span"],
      colgroup: ["span"],
      time: ["datetime"],
      ...Object.fromEntries(SVG_TAGS.map((t) => [t, SVG_ATTRS])),
    },
    allowedSchemes: ["http", "https", "mailto"],
    // camelCase SVG attributes (viewBox, gradientUnits) break if lowercased.
    parser: { lowerCaseAttributeNames: false },
    // Force external links to be safe regardless of what the file said.
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        const external = /^https?:\/\//i.test(href);
        return {
          tagName,
          attribs: external
            ? { ...attribs, target: "_blank", rel: "noopener noreferrer" }
            : attribs,
        };
      },
    },
    // <style> and <script> bodies are dropped entirely, not left as text.
    nonTextTags: ["style", "script", "textarea", "option", "noscript"],
  });
}

function readMeta(name: string, src: string): string {
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
  return (main ?? src.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? src).trim();
}

export function parseBlogHtml(raw: string): ParsedPost {
  const rawTitle = raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "";
  const html = sanitizePostHtml(extractBody(raw));
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const tags = readMeta("tags", raw);

  return {
    title: rawTitle.split(/\s+[—|·]\s+/)[0].trim() || "Untitled",
    summary: readMeta("description", raw),
    date: readMeta("date", raw),
    tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    html,
    readingMinutes: Math.max(1, Math.round(words / 200)),
  };
}

/** "My Post Title!.html" → "my-post-title" */
export function slugify(input: string): string {
  return input
    .replace(/\.html?$/i, "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "post";
}

/** "2026-08-14" → "14 Aug 2026". Empty for missing dates. */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(`${value}T00:00:00Z`) : value;
  if (Number.isNaN(d.getTime())) return typeof value === "string" ? value : "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

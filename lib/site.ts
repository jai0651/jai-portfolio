/**
 * One place for the values that have to agree across metadata, the sitemap,
 * the feed and the structured data. A canonical URL that disagrees with the
 * sitemap is worse than having neither.
 */
export const SITE = {
  url: "https://www.jaishankar.dev",
  name: "Jai Shankar",
  title: "Jai Shankar — Software Engineer",
  description:
    "Software engineer at Plivo. Outside work I build speech, vision and agent systems from scratch, and write up the measurements, including what failed.",
  author: {
    name: "Jai Shankar",
    url: "https://www.jaishankar.dev",
    github: "https://github.com/jai0651",
  },
  locale: "en_GB",
} as const;

export const absolute = (path: string) =>
  `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;

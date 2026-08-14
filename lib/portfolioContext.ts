import { prisma } from "@/lib/prisma";
import { getGithubData } from "@/lib/github";

/**
 * Aggregates all public portfolio content from the database into a single
 * plain-text knowledge base used to ground the AI assistant.
 * Cached briefly so the chat endpoint doesn't hammer the DB on every message.
 */

let cache: { text: string; name: string; expires: number } | null = null;
const TTL_MS = 60_000;

export interface PortfolioContext {
  name: string;
  knowledge: string;
}

export async function getPortfolioContext(): Promise<PortfolioContext> {
  if (cache && cache.expires > Date.now()) {
    return { name: cache.name, knowledge: cache.text };
  }

  const [
    settingsRows,
    experiences,
    education,
    skills,
    projects,
    achievements,
    services,
    socials,
    posts,
  ] = await Promise.all([
    prisma.siteContent.findMany(),
    prisma.experience.findMany({ orderBy: { order: "asc" } }),
    prisma.education.findMany({ orderBy: { order: "asc" } }),
    prisma.skill.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
    prisma.project.findMany({ orderBy: { order: "asc" } }),
    prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
    prisma.service.findMany({ orderBy: { order: "asc" } }),
    prisma.socialLink.findMany({ where: { isActive: true } }),
    prisma.blogPost.findMany({
      where: { published: true },
      select: { title: true, slug: true, summary: true, tags: true, html: true },
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  const settings: Record<string, string> = {};
  settingsRows.forEach((s) => (settings[s.key] = s.value));

  const name = settings.profile_name || "Jai Shankar";
  const lines: string[] = [];

  lines.push(`# Profile`);
  lines.push(`Name: ${name}`);
  if (settings.profile_title) lines.push(`Title: ${settings.profile_title}`);
  if (settings.profile_email) lines.push(`Email: ${settings.profile_email}`);
  if (settings.profile_description)
    lines.push(`Summary: ${settings.profile_description}`);

  if (settings.about_description) {
    lines.push(`\n# About`);
    lines.push(settings.about_description);
    if (settings.about_experience)
      lines.push(`Experience level: ${settings.about_experience}`);
    if (settings.about_languages)
      lines.push(`Languages: ${settings.about_languages}`);
    if (settings.about_freelance)
      lines.push(`Freelance availability: ${settings.about_freelance}`);
  }

  const statsParts: string[] = [];
  if (settings.stats_years) statsParts.push(`${settings.stats_years} years of experience`);
  if (settings.stats_projects) statsParts.push(`${settings.stats_projects}+ projects completed`);
  if (settings.stats_technologies) statsParts.push(`${settings.stats_technologies} technologies`);
  if (settings.stats_commits) statsParts.push(`${settings.stats_commits}+ code commits`);
  if (statsParts.length) {
    lines.push(`\n# Quick stats`);
    lines.push(statsParts.join(", "));
  }

  if (experiences.length) {
    lines.push(`\n# Work experience`);
    experiences.forEach((e) => {
      lines.push(
        `- ${e.position} at ${e.company}${e.location ? ` (${e.location})` : ""} — ${e.duration}${e.description ? `: ${e.description}` : ""}`
      );
    });
  }

  if (education.length) {
    lines.push(`\n# Education`);
    education.forEach((e) => {
      lines.push(`- ${e.degree} in ${e.major}, ${e.university} (${e.duration})`);
    });
  }

  if (skills.length) {
    lines.push(`\n# Skills`);
    lines.push(skills.map((s) => s.name).join(", "));
  }

  if (projects.length) {
    lines.push(`\n# Projects`);
    projects.forEach((p) => {
      const links = [
        p.live ? `live: ${p.live}` : null,
        p.github ? `github: ${p.github}` : null,
      ]
        .filter(Boolean)
        .join(", ");
      lines.push(
        `- ${p.title} (${p.category}) — ${p.description} [stack: ${p.stack}]${links ? ` (${links})` : ""}`
      );
    });
  }

  if (achievements.length) {
    lines.push(`\n# Achievements & certifications`);
    achievements.forEach((a) => {
      lines.push(
        `- ${a.title}${a.issuer ? ` by ${a.issuer}` : ""}${a.date ? ` (${a.date})` : ""}${a.description ? `: ${a.description}` : ""}`
      );
    });
  }

  if (services.length) {
    lines.push(`\n# Services offered`);
    services.forEach((s) => {
      lines.push(`- ${s.title}: ${s.description}`);
    });
  }

  if (socials.length) {
    lines.push(`\n# Social & professional links`);
    socials.forEach((s) => {
      lines.push(`- ${s.platform}: ${s.url}`);
    });
  }

  /*
   * Published writing. This is where the deep technical detail lives — the
   * DB's Project rows are one-liners, whereas a post explains the actual
   * engineering. Without this the assistant couldn't discuss the voice-agent
   * or protocol work at all, because none of it exists as a Project row.
   *
   * Each post contributes its summary plus a trimmed slice of body text; the
   * cap keeps a long post from crowding out the rest of the knowledge base.
   */
  if (posts.length) {
    lines.push(`\n# Writing (published technical posts)`);
    posts.forEach((p) => {
      const body = p.html
        .replace(/<[^>]+>/g, " ")
        .replace(/&[a-z]+;/gi, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 1800);
      lines.push(
        `\n## ${p.title} (/blog/${p.slug})${p.tags ? ` — tags: ${p.tags}` : ""}`
      );
      if (p.summary) lines.push(p.summary);
      if (body) lines.push(body);
    });
  }

  // Live GitHub data so the assistant can speak to real, up-to-date repositories.
  const github = await getGithubData().catch(() => null);
  if (github) {
    lines.push(`\n# GitHub (live data, @${github.profile.login})`);
    lines.push(
      `Profile: ${github.profile.url} — ${github.stats.publicRepos} public repos, ${github.stats.totalStars} total stars, ${github.stats.followers} followers.`
    );
    if (github.stats.topLanguages.length) {
      lines.push(
        `Most-used languages: ${github.stats.topLanguages.map((l) => l.name).join(", ")}.`
      );
    }
    github.repos.slice(0, 12).forEach((r) => {
      lines.push(
        `- ${r.name}${r.language ? ` [${r.language}]` : ""} — ${r.description || "no description"} (★${r.stars}) ${r.url}`
      );
    });
  }

  const knowledge = lines.join("\n");
  cache = { text: knowledge, name, expires: Date.now() + TTL_MS };
  return { name, knowledge };
}

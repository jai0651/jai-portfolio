import { prisma } from "@/lib/prisma";

export interface GithubRepo {
  name: string;
  description: string | null;
  url: string;
  homepage: string | null;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  pushedAt: string;
}

export interface GithubProfile {
  login: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  url: string;
  followers: number;
  following: number;
  publicRepos: number;
}

export interface GithubData {
  profile: GithubProfile;
  repos: GithubRepo[];
  stats: {
    totalStars: number;
    totalForks: number;
    followers: number;
    publicRepos: number;
    topLanguages: { name: string; count: number }[];
  };
}

interface RawRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
  pushed_at: string;
  fork: boolean;
  archived: boolean;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour → auto-refresh of GitHub data
let cache: { key: string; data: GithubData; expires: number } | null = null;

/**
 * Resolves the GitHub username from (in order): env override, a `github_username`
 * site setting, or the GitHub link configured in the admin Social Links.
 */
export async function resolveGithubUsername(): Promise<string | null> {
  if (process.env.GITHUB_USERNAME) return process.env.GITHUB_USERNAME.trim();

  try {
    const setting = await prisma.siteContent.findUnique({
      where: { key: "github_username" },
    });
    if (setting?.value?.trim()) return setting.value.trim();
  } catch {
    // ignore
  }

  try {
    const socials = await prisma.socialLink.findMany();
    for (const s of socials) {
      const match = s.url?.match(/github\.com\/([A-Za-z0-9-]+)/i);
      const handle = match?.[1];
      if (handle && !["sponsors", "orgs", "settings"].includes(handle.toLowerCase())) {
        return handle;
      }
    }
  } catch {
    // ignore
  }

  return null;
}

function ghHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-site",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

export async function getGithubData(): Promise<GithubData | null> {
  const username = await resolveGithubUsername();
  if (!username) return null;

  if (cache && cache.key === username && cache.expires > Date.now()) {
    return cache.data;
  }

  try {
    const [profileRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, {
        headers: ghHeaders(),
      }),
      fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed&type=owner`,
        { headers: ghHeaders() }
      ),
    ]);

    if (!profileRes.ok) return null;
    const p = await profileRes.json();
    const rawRepos: RawRepo[] = reposRes.ok ? await reposRes.json() : [];

    const usable = rawRepos.filter((r) => !r.fork && !r.archived);

    const repos: GithubRepo[] = usable
      .map((r) => ({
        name: r.name,
        description: r.description,
        url: r.html_url,
        homepage: r.homepage && r.homepage.trim() ? r.homepage : null,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language,
        topics: r.topics || [],
        pushedAt: r.pushed_at,
      }))
      // Highlight: most-starred first, then most recently pushed.
      .sort((a, b) => {
        if (b.stars !== a.stars) return b.stars - a.stars;
        return new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime();
      });

    const totalStars = repos.reduce((sum, r) => sum + r.stars, 0);
    const totalForks = repos.reduce((sum, r) => sum + r.forks, 0);

    const langCounts: Record<string, number> = {};
    repos.forEach((r) => {
      if (r.language) langCounts[r.language] = (langCounts[r.language] || 0) + 1;
    });
    const topLanguages = Object.entries(langCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const data: GithubData = {
      profile: {
        login: p.login,
        name: p.name,
        bio: p.bio,
        avatarUrl: p.avatar_url,
        url: p.html_url,
        followers: p.followers,
        following: p.following,
        publicRepos: p.public_repos,
      },
      repos,
      stats: {
        totalStars,
        totalForks,
        followers: p.followers,
        publicRepos: p.public_repos,
        topLanguages,
      },
    };

    cache = { key: username, data, expires: Date.now() + CACHE_TTL_MS };
    return data;
  } catch {
    return null;
  }
}

"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

interface Skill {
  id: string;
  name: string;
}
interface Project {
  id: string;
  title: string;
  category: string;
  live: string | null;
  github: string | null;
}
interface SocialLink {
  id: string;
  platform: string;
  url: string;
}
interface Post {
  slug: string;
  title: string;
  summary: string | null;
  tags: string[];
  readingMinutes: number;
  publishedAt: string | null;
  views: number;
  likes: number;
}
interface Experience {
  id: string;
  company: string;
  position: string;
  duration: string;
  location: string;
}
interface GithubStats {
  profile: { login: string; url: string };
  stats: { publicRepos: number; totalStars: number; followers: number };
  pinned: { name: string; language: string | null; stars: number; url: string }[];
}

interface TerminalHeroProps {
  name: string;
  bio: string;
  skills: Skill[];
  resumeUrl: string;
}

const ROLES = ["Software Engineer", "AI / LLM Engineer", "ML + physics tinkerer"];
const INTERESTS = [
  "multimodal AI",
  "voice AI",
  "local & on-device models",
  "astronomy",
  "systems & computers",
  "maths",
  "physics",
];

/** What I'm actually doing at the moment — the "now page" convention. */
const NOW = [
  "Building LLM agents that triage and root-cause production support issues.",
  "Training speech models from scratch — currently a streaming Conformer.",
  "Reading about multimodal grounding, and how systems fail across modalities.",
  "Running Whisper and a 9B model entirely on-device, because it's finally viable.",
];

const HELP_GROUPS: [string, [string, string][]][] = [
  [
    "about",
    [
      ["whoami", "who is this"],
      ["now", "what I'm doing lately"],
      ["interests", "what I read for fun"],
      ["neofetch", "the whole picture, fast"],
    ],
  ],
  [
    "work",
    [
      ["ls / work", "projects I've shipped"],
      ["exp", "roles and companies"],
      ["gh", "live GitHub stats"],
      ["skills", "the toolkit"],
    ],
  ],
  [
    "writing",
    [
      ["blog", "published posts"],
      ["read 1", "open post number 1"],
    ],
  ],
  [
    "reach me",
    [
      ["contact", "the form"],
      ["socials", "find me online"],
      ["cv", "download the resume"],
      ["voice", "talk to my AI out loud"],
      ["chat <q>", "ask my AI in text"],
    ],
  ],
];

/** `man <cmd>` entries — one line each, for the non-obvious commands. */
const MANUAL: Record<string, string> = {
  blog: "lists published posts newest-first, with reading time and likes. Use `read 1` to open one.",
  read: "opens a post by its number from `blog` (e.g. `read 1`), or by slug.",
  now: "a short list of what I'm actively working on and thinking about.",
  neofetch: "system-info-style summary: role, project count, live repo stats, focus areas.",
  gh: "live GitHub profile stats plus featured repositories, fetched at runtime.",
  exp: "work history — role, company, dates, location.",
  voice: "opens the voice assistant and starts listening. Pause to end your turn.",
  chat: "opens the text assistant. `chat <question>` sends it immediately.",
  cv: "downloads the current resume PDF.",
  skills: "the technologies I actually use, pulled from the live site data.",
  history: "the last dozen commands from this session.",
  sudo: "no.",
};

const COMMANDS = [
  "help",
  "whoami",
  "now",
  "neofetch",
  "ls",
  "work",
  "skills",
  "interests",
  "exp",
  "experience",
  "gh",
  "github",
  "blog",
  "posts",
  "read",
  "resume",
  "cv",
  "contact",
  "socials",
  "voice",
  "chat",
  "man",
  "history",
  "clear",
  "date",
  "pwd",
  "echo",
  "sudo",
  "coffee",
  "theme",
];

/** Levenshtein, for "did you mean" on a typo. */
function editDistance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return d[a.length][b.length];
}

function useTypewriter(words: string[], speed = 75, pause = 1500) {
  const [text, setText] = useState("");
  const [i, setI] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[i % words.length];
    if (!deleting && text === word) {
      const t = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(t);
    }
    if (deleting && text === "") {
      setDeleting(false);
      setI((n) => n + 1);
      return;
    }
    const t = setTimeout(
      () => setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1)),
      deleting ? speed / 2 : speed
    );
    return () => clearTimeout(t);
  }, [text, deleting, i, words, speed, pause]);

  return text;
}

interface Entry {
  id: number;
  cmd: string;
  out: ReactNode;
}

const OutLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
  >
    {children}
  </a>
);

const TerminalHero = ({ name, bio, skills, resumeUrl }: TerminalHeroProps) => {
  const router = useRouter();
  const role = useTypewriter(ROLES);
  const [projects, setProjects] = useState<Project[]>([]);
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [github, setGithub] = useState<GithubStats | null>(null);
  const [history, setHistory] = useState<Entry[]>([]);
  const [input, setInput] = useState("");
  const [cmdLog, setCmdLog] = useState<string[]>([]);
  const [logIdx, setLogIdx] = useState<number | null>(null);

  const idRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/projects")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.projects && setProjects(d.projects))
      .catch(() => {});
    fetch("/api/admin/social")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.socialLinks && setSocials(d.socialLinks))
      .catch(() => {});
    fetch("/api/blog")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.posts && setPosts(d.posts))
      .catch(() => {})
      // Tracked separately so `blog` can distinguish "still loading" from
      // "nothing published" — otherwise a slow fetch looks like an empty blog.
      .finally(() => setPostsLoaded(true));
    fetch("/api/admin/experience")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.experiences && setExperiences(d.experiences))
      .catch(() => {});
    // GitHub is optional — the commands that use it degrade to a notice.
    fetch("/api/github")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.profile && setGithub(d))
      .catch(() => {});
  }, []);

  // focus on desktop only (avoid popping the mobile keyboard on load)
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      inputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history]);

  const print = (cmd: string, out: ReactNode) =>
    setHistory((h) => [...h, { id: idRef.current++, cmd, out }]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) {
      print("", null);
      return;
    }
    setCmdLog((l) => [...l, cmd]);
    setLogIdx(null);

    const [name0, ...rest] = cmd.split(/\s+/);
    const name1 = name0.toLowerCase();
    const arg = rest.join(" ");

    switch (name1) {
      case "help":
      case "?":
        print(
          cmd,
          <div className="space-y-2.5">
            {HELP_GROUPS.map(([group, items]) => (
              <div key={group}>
                <p className="text-faint">{group}</p>
                <div className="mt-0.5 grid grid-cols-1 gap-x-6 gap-y-0.5 sm:grid-cols-2">
                  {items.map(([c, d]) => (
                    <span key={c}>
                      <span className="text-accent">{c.padEnd(14, " ")}</span>
                      <span className="text-faint">{d}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-faint">
              <span className="text-accent-dim">tip</span> ↑/↓ history · Tab completes ·
              Ctrl+L clears · <span className="text-accent">man &lt;cmd&gt;</span> for detail
            </p>
          </div>
        );
        break;

      case "man":
        print(
          cmd,
          arg ? (
            MANUAL[arg.toLowerCase()] ? (
              <div>
                <p className="text-ink">
                  <span className="text-accent">{arg.toLowerCase()}</span> —{" "}
                  {MANUAL[arg.toLowerCase()]}
                </p>
              </div>
            ) : (
              <span className="text-muted">
                no manual entry for <span className="text-amber">{arg}</span>
              </span>
            )
          ) : (
            <span className="text-muted">usage: man &lt;command&gt;</span>
          )
        );
        break;

      case "blog":
      case "posts":
      case "writing":
        print(
          cmd,
          posts.length ? (
            <div className="space-y-1">
              {posts.map((p, i) => (
                <div key={p.slug} className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-faint">{String(i + 1).padStart(2, "0")}</span>
                  <button
                    onClick={() => router.push(`/blog/${p.slug}`)}
                    className="text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
                  >
                    {p.title}
                  </button>
                  <span className="text-faint">
                    · {p.readingMinutes} min · ♥ {p.likes}
                  </span>
                </div>
              ))}
              <p className="pt-0.5 text-faint">
                <span className="text-accent-dim">#</span> read one with{" "}
                <span className="text-accent">read {posts.length > 0 ? 1 : "n"}</span>, or{" "}
                <button
                  onClick={() => router.push("/blog")}
                  className="text-accent-dim underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
                >
                  cd ~/blog →
                </button>
              </p>
            </div>
          ) : postsLoaded ? (
            <span className="text-muted">no posts published yet.</span>
          ) : (
            <span className="text-muted">loading posts… try again in a second.</span>
          )
        );
        break;

      case "read":
      case "open": {
        /*
         * Tolerant of how the help text reads: `read <n>` invites typing the
         * angle brackets, so strip everything that isn't a digit before
         * parsing. Falls back to matching a slug.
         */
        const idx = parseInt(arg.replace(/[^0-9]/g, ""), 10);
        const post =
          posts[idx - 1] ??
          posts.find(
            (p) =>
              p.slug === arg.toLowerCase().replace(/[<>]/g, "").trim().replace(/\s+/g, "-")
          );
        if (post) {
          print(cmd, <span className="text-muted">opening “{post.title}” …</span>);
          setTimeout(() => router.push(`/blog/${post.slug}`), 300);
        } else {
          print(
            cmd,
            <span className="text-muted">
              usage: <span className="text-accent">read 1</span>
              {posts.length
                ? ` (1–${posts.length}) — run `
                : !postsLoaded
                  ? " — posts still loading, run "
                  : " — run "}
              <span className="text-accent">blog</span> for the list
            </span>
          );
        }
        break;
      }

      case "exp":
      case "experience":
      case "work-history":
        print(
          cmd,
          experiences.length ? (
            <div className="space-y-1">
              {experiences.map((e) => (
                <div key={e.id} className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-accent">▸ {e.position}</span>
                  <span className="text-ink">@ {e.company}</span>
                  <span className="text-faint">
                    — {e.duration}
                    {e.location ? ` · ${e.location}` : ""}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-muted">loading experience…</span>
          )
        );
        break;

      case "gh":
      case "github":
        print(
          cmd,
          github ? (
            <div className="space-y-1">
              <p className="text-ink">
                <OutLink href={github.profile.url}>@{github.profile.login}</OutLink>{" "}
                <span className="text-faint">
                  — {github.stats.publicRepos} repos · ★ {github.stats.totalStars} ·{" "}
                  {github.stats.followers} followers
                </span>
              </p>
              {github.pinned.slice(0, 6).map((r) => (
                <div key={r.name} className="flex flex-wrap items-baseline gap-x-2">
                  <OutLink href={r.url}>{r.name}</OutLink>
                  <span className="text-faint">
                    {r.language ?? "—"} · ★ {r.stars}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-muted">github data unavailable right now.</span>
          )
        );
        break;

      case "now":
        print(
          cmd,
          <div className="space-y-0.5">
            {NOW.map((n) => (
              <p key={n}>
                <span className="text-accent-dim">▹</span>{" "}
                <span className="text-ink">{n}</span>
              </p>
            ))}
          </div>
        );
        break;

      case "voice":
      case "talk":
        print(
          cmd,
          <span className="text-muted">opening the voice assistant — just start talking.</span>
        );
        window.dispatchEvent(
          new CustomEvent("open-chat", { detail: { mode: "voice" } })
        );
        break;

      case "neofetch":
      case "about-system":
        print(
          cmd,
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <pre className="text-accent-dim leading-[1.15]">{`   .-.
  |o o|
  | ^ |
  |'-'|
   '-'`}</pre>
            <div className="space-y-0.5">
              {[
                ["user", "jai@shankar"],
                ["role", ROLES[0]],
                ["shell", "portfolio-zsh"],
                ["uptime", `${experiences.length || "—"} roles shipped`],
                ["projects", `${projects.length || "—"}`],
                ["posts", `${posts.length || "—"}`],
                [
                  "repos",
                  github ? `${github.stats.publicRepos} · ★ ${github.stats.totalStars}` : "—",
                ],
                ["focus", "voice AI · LLM agents · speech models"],
                ["theme", "gold on blue-black"],
              ].map(([k, v]) => (
                <p key={k}>
                  <span className="text-accent">{k.padEnd(10, " ")}</span>
                  <span className="text-ink">{v}</span>
                </p>
              ))}
            </div>
          </div>
        );
        break;

      case "history":
        print(
          cmd,
          cmdLog.length ? (
            <div className="space-y-0.5">
              {cmdLog.slice(-12).map((c, i) => (
                <p key={i}>
                  <span className="text-faint">
                    {String(cmdLog.length - Math.min(12, cmdLog.length) + i + 1).padStart(
                      3,
                      " "
                    )}
                  </span>{" "}
                  <span className="text-muted">{c}</span>
                </p>
              ))}
            </div>
          ) : (
            <span className="text-muted">no history yet.</span>
          )
        );
        break;

      case "whoami":
      case "about":
        print(
          cmd,
          <div>
            <p className="text-ink">{name} — {ROLES[0]}</p>
            <p className="mt-1 text-muted">{bio}</p>
          </div>
        );
        break;

      case "ls":
      case "work":
      case "projects":
        print(
          cmd,
          projects.length ? (
            <div className="space-y-1">
              {projects.slice(0, 8).map((p) => (
                <div key={p.id} className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-accent">▸ {p.title}</span>
                  <span className="text-faint">— {p.category}</span>
                  {p.live && <OutLink href={p.live}>[live]</OutLink>}
                  {p.github && <OutLink href={p.github}>[src]</OutLink>}
                </div>
              ))}
              <button
                onClick={() => router.push("/work")}
                className="mt-1 text-accent-dim underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
              >
                cd ~/work →
              </button>
            </div>
          ) : (
            <span className="text-muted">loading projects… try again in a second.</span>
          )
        );
        break;

      case "skills":
        print(
          cmd,
          skills.length ? (
            <p className="flex flex-wrap gap-x-2 gap-y-0.5">
              {skills.map((s, i) => (
                <span key={s.id}>
                  <span className="text-accent">{s.name}</span>
                  {i < skills.length - 1 && <span className="text-faint"> ·</span>}
                </span>
              ))}
            </p>
          ) : (
            <span className="text-muted">no skills loaded.</span>
          )
        );
        break;

      case "interests":
        print(
          cmd,
          <p className="flex flex-wrap gap-x-2">
            {INTERESTS.map((it, i) => (
              <span key={it}>
                <span className="text-accent">{it}</span>
                {i < INTERESTS.length - 1 && <span className="text-faint"> ·</span>}
              </span>
            ))}
          </p>
        );
        break;

      case "resume":
        print(cmd, <span className="text-muted">opening ~/resume …</span>);
        setTimeout(() => router.push("/resume"), 300);
        break;

      case "cv":
      case "download":
        print(
          cmd,
          <span className="text-muted">
            downloading cv → <OutLink href={resumeUrl}>{resumeUrl.split("/").pop()}</OutLink>
          </span>
        );
        window.open(resumeUrl, "_blank", "noopener,noreferrer");
        break;

      case "contact":
        print(cmd, <span className="text-muted">opening ~/contact …</span>);
        setTimeout(() => router.push("/contact"), 300);
        break;

      case "socials":
      case "links":
        print(
          cmd,
          socials.length ? (
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {socials.map((s) => (
                <OutLink key={s.id} href={s.url}>
                  {s.platform.toLowerCase()}
                </OutLink>
              ))}
            </div>
          ) : (
            <span className="text-muted">no links loaded.</span>
          )
        );
        break;

      case "chat":
      case "ai":
        if (arg) {
          print(cmd, <span className="text-muted">→ asking my AI: “{arg}”</span>);
          window.dispatchEvent(
            new CustomEvent("open-chat", { detail: { message: arg, mode: "text" } })
          );
        } else {
          print(cmd, <span className="text-muted">launching assistant… (or type: chat &lt;your question&gt;)</span>);
          window.dispatchEvent(
            new CustomEvent("open-chat", { detail: { mode: "text" } })
          );
        }
        break;

      case "clear":
        setHistory([]);
        return;

      case "date":
        print(cmd, <span className="text-muted">{new Date().toString()}</span>);
        break;

      case "pwd":
        print(cmd, <span className="text-muted">/home/jai</span>);
        break;

      case "echo":
        print(cmd, <span className="text-ink">{arg}</span>);
        break;

      case "sudo":
        print(cmd, <span className="text-amber">🔒 nice try. permission denied.</span>);
        break;

      case "coffee":
        print(cmd, <span className="text-muted">brewing… ☕ done. now we can talk.</span>);
        break;

      case "theme":
        print(cmd, <span className="text-muted">one theme here: warm gold on blue-black.</span>);
        break;

      default: {
        // Offer the nearest command rather than a flat "not found".
        const near = COMMANDS.map((c) => [c, editDistance(name1, c)] as const)
          .filter(([, d]) => d <= 2)
          .sort((a, b) => a[1] - b[1])[0]?.[0];
        print(
          cmd,
          <span className="text-muted">
            command not found: <span className="text-amber">{name1}</span>
            {near ? (
              <>
                {" — did you mean "}
                <button
                  onClick={() => {
                    run(near);
                    inputRef.current?.focus();
                  }}
                  className="text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
                >
                  {near}
                </button>
                {"?"}
              </>
            ) : (
              <>
                {" — type "}
                <span className="text-accent">help</span>
              </>
            )}
          </span>
        );
      }
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!cmdLog.length) return;
      const next = logIdx === null ? cmdLog.length - 1 : Math.max(0, logIdx - 1);
      setLogIdx(next);
      setInput(cmdLog[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (logIdx === null) return;
      const next = logIdx + 1;
      if (next >= cmdLog.length) {
        setLogIdx(null);
        setInput("");
      } else {
        setLogIdx(next);
        setInput(cmdLog[next]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (!input) return;
      const matches = COMMANDS.filter((c) => c.startsWith(input.toLowerCase()));
      if (matches.length === 1) {
        setInput(matches[0]);
      } else if (matches.length > 1) {
        // Complete as far as the shared prefix goes, then show the options —
        // which is what a real shell does, rather than silently picking one.
        let prefix = matches[0];
        for (const m of matches) {
          while (!m.startsWith(prefix)) prefix = prefix.slice(0, -1);
        }
        if (prefix.length > input.length) setInput(prefix);
        else
          print(
            input,
            <p className="flex flex-wrap gap-x-3">
              {matches.map((m) => (
                <span key={m} className="text-accent">
                  {m}
                </span>
              ))}
            </p>
          );
      }
    } else if (e.key === "l" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setHistory([]);
    } else if (e.key === "c" && e.ctrlKey) {
      e.preventDefault();
      print(`${input}^C`, null);
      setInput("");
      setLogIdx(null);
    }
  };

  // The terminal is the text-chat entry point; the floating mic owns voice.
  const suggestions = useMemo(
    () => ["help", "neofetch", "blog", "now", "text chat →"],
    []
  );

  return (
    <div className="term w-full">
      <div className="term-bar">
        {/* A real shell status line — cwd, user, shell — rather than fake
            window chrome. Same footprint, actual information. */}
        <span aria-hidden className="h-3.5 w-1 rounded-sm bg-accent shadow-[0_0_10px_rgba(240,180,41,0.7)]" />
        <span className="font-mono text-xs text-muted">jai@shankar</span>
        <span className="font-mono text-xs text-faint">:</span>
        <span className="font-mono text-xs text-accent-dim">~</span>
        <span className="hidden items-center gap-2 sm:flex">
          <span className="h-3 w-px bg-line-2" />
          <span className="font-mono text-[11px] text-faint">zsh</span>
        </span>
        <span className="ml-auto inline-flex items-center gap-2 font-mono text-xs text-accent-dim">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          <span className="hidden sm:inline">available for work</span>
        </span>
      </div>

      <div
        ref={scrollRef}
        onClick={() => inputRef.current?.focus()}
        className="max-h-[440px] min-h-[300px] cursor-text space-y-3 overflow-y-auto p-6 font-mono text-sm leading-relaxed xl:p-7"
      >
        {/* printed intro */}
        <div>
          <p className="text-muted">
            <span className="text-accent-dim">$</span> whoami
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink xl:text-[32px]">
            {name}
          </h1>
          <p className="text-base text-muted">
            <span className="text-accent">&gt;</span>{" "}
            <span className="gradient-text font-medium">{role}</span>
            <span className="cursor ml-0.5 animate-blink align-middle" />
          </p>
        </div>
        <div>
          <p className="text-muted">
            <span className="text-accent-dim">$</span> cat bio.txt
          </p>
          <p className="mt-1 max-w-xl text-ink/90">{bio}</p>
        </div>
        <p className="text-faint">
          <span className="text-accent-dim"># </span>this is a real shell — type{" "}
          <span className="text-accent">help</span> to explore.
        </p>

        {/* command history */}
        {history.map((e) => (
          <div key={e.id}>
            {e.cmd !== "" && (
              <p className="text-ink">
                <span className="text-accent-dim">$</span> {e.cmd}
              </p>
            )}
            {e.out && <div className="mt-0.5">{e.out}</div>}
          </div>
        ))}

        {/* live prompt */}
        <div className="flex items-center gap-2">
          <span className="text-accent-dim">$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal input"
            className="flex-1 bg-transparent font-mono text-sm text-ink caret-accent placeholder:text-faint focus:outline-none"
            placeholder="type a command…"
          />
        </div>
      </div>

      {/* suggestion chips */}
      <div className="flex flex-wrap gap-2 border-t border-line bg-surface-2/40 px-6 py-3">
        {suggestions.map((s) => {
          const isChat = s.startsWith("text chat");
          return (
            <button
              key={s}
              onClick={() => {
                if (isChat) {
                  window.dispatchEvent(
                    new CustomEvent("open-chat", { detail: { mode: "text" } })
                  );
                } else {
                  run(s);
                  inputRef.current?.focus();
                }
              }}
              className="rounded-md border border-line bg-surface px-2.5 py-1 font-mono text-xs text-muted shadow-e1 transition-all duration-200 ease-out-quint hover:-translate-y-px hover:border-accent/50 hover:text-accent"
            >
              {isChat ? s : `$ ${s}`}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TerminalHero;

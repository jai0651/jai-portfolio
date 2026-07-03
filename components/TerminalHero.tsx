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

interface TerminalHeroProps {
  name: string;
  bio: string;
  skills: Skill[];
  resumeUrl: string;
}

const ROLES = ["AI / LLM Engineer", "Software Engineer", "ML + physics tinkerer"];
const INTERESTS = ["software engineering", "maths", "machine learning", "physics", "science"];

const COMMANDS = [
  "help",
  "whoami",
  "ls",
  "work",
  "skills",
  "interests",
  "resume",
  "contact",
  "socials",
  "chat",
  "clear",
  "date",
  "pwd",
  "sudo",
  "coffee",
];

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
        print(
          cmd,
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
            {[
              ["whoami", "who is this"],
              ["ls / work", "my projects"],
              ["skills", "my toolkit"],
              ["interests", "what I love"],
              ["resume", "experience"],
              ["contact", "reach me"],
              ["socials", "find me online"],
              ["chat <q>", "ask my AI"],
              ["clear", "reset screen"],
            ].map(([c, d]) => (
              <span key={c}>
                <span className="text-accent">{c}</span>
                <span className="text-faint"> — {d}</span>
              </span>
            ))}
          </div>
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
      case "cv":
        print(cmd, <span className="text-muted">opening ~/resume …</span>);
        setTimeout(() => router.push("/resume"), 300);
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
          window.dispatchEvent(new CustomEvent("open-chat", { detail: { message: arg } }));
        } else {
          print(cmd, <span className="text-muted">launching assistant… (or type: chat &lt;your question&gt;)</span>);
          window.dispatchEvent(new Event("open-chat"));
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
        print(cmd, <span className="text-muted">one theme here: phosphor green on black.</span>);
        break;

      default:
        print(
          cmd,
          <span className="text-muted">
            command not found: <span className="text-amber">{name1}</span> — type{" "}
            <span className="text-accent">help</span>
          </span>
        );
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
      const match = COMMANDS.find((c) => c.startsWith(input.toLowerCase()) && input);
      if (match) setInput(match);
    }
  };

  const suggestions = useMemo(() => ["help", "ls", "skills", "chat with my AI →"], []);

  return (
    <div className="term w-full">
      <div className="term-bar">
        <span className="term-dot bg-[#ff5f56]/70" />
        <span className="term-dot bg-[#ffbd2e]/70" />
        <span className="term-dot bg-[#27c93f]/70" />
        <span className="ml-2 font-mono text-xs text-faint">jai@shankar: ~</span>
        <span className="ml-auto inline-flex items-center gap-2 font-mono text-xs text-accent-dim">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          available for work
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
          <h1 className="mt-1 text-2xl font-semibold text-ink xl:text-[32px]">{name}</h1>
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
          const isChat = s.startsWith("chat");
          return (
            <button
              key={s}
              onClick={() => {
                if (isChat) {
                  window.dispatchEvent(new Event("open-chat"));
                } else {
                  run(s);
                  inputRef.current?.focus();
                }
              }}
              className="rounded-md border border-line bg-surface px-2.5 py-1 font-mono text-xs text-muted transition-colors hover:border-accent/50 hover:text-accent"
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

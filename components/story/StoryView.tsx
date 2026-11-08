"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  FiArrowDown,
  FiArrowRight,
  FiArrowUpRight,
  FiDownload,
  FiGithub,
  FiTerminal,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import Photo from "@/components/Photo";
import TerminalHero from "@/components/TerminalHero";
import StackObject, { CLOSED, OPEN } from "@/components/story/StackObject";
import FlipWords from "@/components/story/FlipWords";
import { CHAPTERS, HERO, LAYERS, type Chapter, type LayerId } from "@/lib/story";
import { fadeUp, fadeUpNow, lead, step } from "@/lib/motion";
import { SITE } from "@/lib/site";

/*
 * "Open the box": the homepage told as one journey.
 *
 * Desktop: the hero pairs the headline with a large portrait. As it scrolls
 * away, the stack slides up into the right-hand column, opens (scrubbed), and
 * stays pinned while the chapters scroll past on the left. Each chapter lights
 * the layers its work lives in (state-driven, so it animates at its own pace
 * instead of jittering with the scrollbar).
 *
 * Mobile: nothing is pinned. The portrait follows the hero buttons, and every
 * chapter carries a row of layer chips that says the same thing as the stack.
 *
 * Reduced motion: the stack is drawn already open and nothing is scrubbed;
 * framer-motion's MotionConfig turns the entrances into plain fades.
 *
 * All copy is in the server-rendered HTML; only the motion needs JavaScript.
 *
 * The shell from the old homepage closes the page as an epilogue. It is
 * reachable from anywhere: the hero button, the rail under the stack, and the
 * "/" key, which jumps to it and puts the cursor in the prompt.
 */

interface StoryViewProps {
  resumeUrl: string;
  name: string;
  bio: string;
  photo?: string;
  skills: { id: string; name: string }[];
}

const isExternal = (href: string) => href.startsWith("http");
const linkProps = (href: string) =>
  isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {};

export default function StoryView({ resumeUrl, name, bio, photo, skills }: StoryViewProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  // The stack sits below the portrait and slides up into its pinned spot as
  // the hero scrolls away; it opens over the second half of that journey.
  const scrubbed = useTransform(scrollYProgress, [0.35, 0.95], [CLOSED, OPEN]);

  /*
   * One motion value whose source is chosen after mount. The server can't know
   * the visitor's motion preference, so both renders start closed; switching
   * the value (not the object) afterwards avoids a hydration mismatch.
   */
  const pitch = useMotionValue(CLOSED);
  useMotionValueEvent(scrubbed, "change", (v) => {
    if (!reduce) pitch.set(v);
  });
  useEffect(() => {
    pitch.set(reduce ? OPEN : scrubbed.get());
  }, [reduce, pitch, scrubbed]);

  // Whichever chapter crosses the middle of the viewport is the active one.
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-chapter]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number(e.target.getAttribute("data-chapter")));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const lit = active >= 0 ? CHAPTERS[active].lit : {};

  const openShell = useCallback(() => {
    document
      .getElementById("shell")
      ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    // Desktop only: on a phone, focusing would throw the keyboard up mid-scroll.
    // preventScroll keeps the focus from cutting the smooth scroll short.
    if (window.innerWidth >= 1024) {
      document.querySelector<HTMLInputElement>("#shell input")?.focus({ preventScroll: true });
    }
  }, [reduce]);

  // "/" anywhere on the page opens the shell, unless you're already typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))) {
        return;
      }
      e.preventDefault();
      openShell();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openShell]);

  return (
    <div className="container mx-auto px-4">
      <div className="lg:grid lg:grid-cols-12 lg:gap-10 xl:gap-16">
        {/* ── Story column ───────────────────────────────────── */}
        <div className="lg:col-span-7">
          <div
            ref={heroRef}
            data-chapter={-1}
            className="relative flex min-h-[calc(100svh-6rem)] flex-col justify-center pb-16 pt-6"
          >
            <motion.div
              {...fadeUpNow}
              transition={lead()}
              className="flex items-center gap-3"
            >
              {photo && (
                // Phones only: the full portrait is further down there. Decorative,
                // since the name sits right beside it.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  alt=""
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-full object-cover object-top ring-1 ring-line-2 lg:hidden"
                />
              )}
              <p className="mono-label">{HERO.eyebrow}</p>
            </motion.div>
            <motion.h1
              {...fadeUpNow}
              transition={lead(0.08)}
              className="mt-6 text-balance font-sans text-[44px] font-semibold leading-[0.98] tracking-[-0.045em] text-ink sm:text-[60px] xl:text-[80px]"
            >
              I open the box, learn every layer, then{" "}
              <span className="gradient-text">make it</span>{" "}
              <FlipWords words={HERO.makeIt} wordClassName="gradient-text" />
            </motion.h1>
            <motion.p
              {...fadeUpNow}
              transition={lead(0.16)}
              className="mt-8 max-w-[50ch] text-lg leading-relaxed text-muted xl:text-xl"
            >
              {HERO.sub}
            </motion.p>
            <motion.div
              {...fadeUpNow}
              transition={lead(0.24)}
              className="mt-10 flex flex-col gap-3 sm:flex-row"
            >
              <Button asChild variant="cta" size="lg">
                <a href="#origin">
                  Start reading
                  <FiArrowDown />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/work">
                  Skip to the work
                  <FiArrowUpRight />
                </Link>
              </Button>
              <Button variant="ghost" size="lg" onClick={openShell}>
                <FiTerminal />
                Open the shell
                <Kbd className="hidden lg:inline-flex">/</Kbd>
              </Button>
            </motion.div>

            {/* Phones have no right-hand column, so the portrait follows the buttons. */}
            <div className="mt-14 flex justify-center lg:hidden">
              <Photo src={photo} className="w-full max-w-[340px]" />
            </div>
          </div>

          {CHAPTERS.map((c, i) => (
            <ChapterBlock key={c.id} chapter={c} index={i} resumeUrl={resumeUrl} />
          ))}
        </div>

        {/* ── Pinned stack (desktop) ─────────────────────────── */}
        <aside className="hidden lg:col-span-5 lg:block" aria-label="Story progress">
          {/* The portrait owns the hero's right-hand side ... */}
          <div className="flex min-h-[calc(100svh-6rem)] items-center justify-center pb-16 pt-6">
            <Photo src={photo} className="w-full max-w-[420px]" />
          </div>

          {/* ... then the stack slides up into its place and stays pinned. */}
          <div className="sticky top-24 flex h-[calc(100svh-6rem)] flex-col justify-center pb-8">
            <StackObject pitch={pitch} lit={lit} className="h-auto max-h-[60svh] w-full" />

            <nav className="mt-6 pl-[6%]" aria-label="Chapters">
              <ol className="space-y-0.5 font-mono text-xs">
                {CHAPTERS.map((c, i) => {
                  const on = i === active;
                  return (
                    <li key={c.id}>
                      <a
                        href={`#${c.id}`}
                        aria-current={on ? "step" : undefined}
                        className={`group flex items-center gap-3 py-1.5 transition-colors duration-200 ${
                          on ? "text-accent" : "text-faint hover:text-ink"
                        }`}
                      >
                        <span
                          className={`h-px transition-all duration-300 ease-out-quint ${
                            on ? "w-8 bg-accent" : "w-4 bg-line-2 group-hover:w-6"
                          }`}
                        />
                        <span className="tnum">{c.num}</span>
                        <span>{c.eyebrow}</span>
                      </a>
                    </li>
                  );
                })}
              </ol>
              <a
                href="#shell"
                onClick={(e) => {
                  e.preventDefault();
                  openShell();
                }}
                className="group mt-4 flex items-center gap-3 py-1.5 font-mono text-xs text-accent-dim transition-colors hover:text-accent"
              >
                <span className="h-px w-4 bg-accent/50 transition-all duration-300 group-hover:w-6" />
                <FiTerminal />
                <span>or explore from a shell</span>
                <Kbd>/</Kbd>
              </a>
            </nav>
          </div>
        </aside>
      </div>

      {/* ── Epilogue: the shell ─────────────────────────────── */}
      <section id="shell" className="scroll-mt-24 border-t border-line py-24 xl:py-32">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <motion.p {...fadeUp} transition={step(0)} className="mono-label">
              $ ./shell
            </motion.p>
            <motion.h2
              {...fadeUp}
              transition={step(1)}
              className="mt-5 text-balance font-sans text-[36px] font-semibold leading-[1.03] tracking-[-0.04em] text-ink sm:text-[44px]"
            >
              Prefer a terminal? It&apos;s all in here too.
            </motion.h2>
            <motion.p
              {...fadeUp}
              transition={step(2)}
              className="mt-6 text-lg leading-relaxed text-muted"
            >
              It&apos;s a working shell over the same content. Type <Cmd>help</Cmd> to see the
              commands, or <Cmd>chat</Cmd> followed by a question to ask my AI.
            </motion.p>
          </div>
          <div className="lg:col-span-8">
            <TerminalHero
              name={name}
              bio={bio}
              skills={skills}
              resumeUrl={resumeUrl}
              autoFocus={false}
              nameAs="p"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Kbd({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={`inline-flex h-5 min-w-5 items-center justify-center rounded border border-line-2 bg-surface-2 px-1 font-mono text-[11px] leading-none text-faint ${className}`}
    >
      {children}
    </kbd>
  );
}

function Cmd({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.9em] text-accent">
      {children}
    </code>
  );
}

function ChapterBlock({
  chapter: c,
  index,
  resumeUrl,
}: {
  chapter: Chapter;
  index: number;
  resumeUrl: string;
}) {
  return (
    <section
      id={c.id}
      data-chapter={index}
      className="flex min-h-[100svh] scroll-mt-24 flex-col justify-center py-20"
    >
      <motion.p {...fadeUp} transition={step(0)} className="mono-label">
        <span className="tnum">{c.num}</span> · {c.eyebrow}
      </motion.p>
      <motion.h2
        {...fadeUp}
        transition={step(1)}
        className="mt-5 text-balance font-sans text-[36px] font-semibold leading-[1.03] tracking-[-0.04em] text-ink sm:text-[48px] xl:text-[60px]"
      >
        {c.title}
      </motion.h2>
      <motion.p
        {...fadeUp}
        transition={step(2)}
        className="mt-6 max-w-[58ch] text-lg leading-relaxed text-muted"
      >
        {c.body}
      </motion.p>

      <LayerChips lit={c.lit} />

      {c.context && (
        <motion.p
          {...fadeUp}
          transition={step(3)}
          className="mt-8 font-mono text-xs text-faint"
        >
          {c.context}
        </motion.p>
      )}

      {c.stats && (
        <div className="mt-5 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line shadow-e1 sm:grid-cols-2">
          {c.stats.map((s, i) => (
            <motion.div
              key={s.label}
              {...fadeUp}
              transition={step(i % 2)}
              className="bg-surface p-6 xl:p-7"
            >
              <div className="tnum font-sans text-5xl font-semibold tracking-[-0.045em] text-accent xl:text-6xl">
                {s.value}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {c.aside && (
        <motion.p
          {...fadeUp}
          transition={step(1)}
          className="mt-8 max-w-[58ch] border-l-2 border-accent/40 pl-4 text-[15px] leading-relaxed text-muted"
        >
          {c.aside}
        </motion.p>
      )}

      {c.tiles && (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {c.tiles.map((t, i) => (
            <motion.a
              key={t.title}
              href={t.href}
              {...linkProps(t.href)}
              {...fadeUp}
              transition={step(i % 2)}
              className={`card card-lift group flex flex-col p-6 ${i === 0 ? "sm:col-span-2" : ""}`}
            >
              <span className="mono-label text-[11px]">{t.area}</span>
              <span
                className={`tnum mt-4 font-sans font-semibold tracking-[-0.045em] text-accent ${
                  i === 0 ? "text-6xl xl:text-7xl" : "text-5xl"
                }`}
              >
                {t.value}
              </span>
              <span className="mt-3 text-base font-semibold text-ink">{t.title}</span>
              <span className="mt-1.5 text-sm leading-relaxed text-muted">{t.caption}</span>
              <span className="mt-auto inline-flex items-center gap-1 pt-5 font-mono text-xs text-accent-dim transition-colors group-hover:text-accent">
                {t.cta} <FiArrowUpRight />
              </span>
            </motion.a>
          ))}
        </div>
      )}

      {c.rows && (
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {c.rows.map((r, i) => (
            <motion.li key={r.title} {...fadeUp} transition={step(i)}>
              <a
                href={r.href}
                {...linkProps(r.href)}
                className="group flex items-start justify-between gap-6 py-5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-lg font-semibold text-ink transition-colors group-hover:text-accent">
                      {r.title}
                    </span>
                    {r.meta && (
                      <span className="font-mono text-xs text-faint">{r.meta}</span>
                    )}
                  </div>
                  {r.desc && (
                    <p className="mt-1.5 max-w-[62ch] text-[15px] leading-relaxed text-muted">
                      {r.desc}
                    </p>
                  )}
                </div>
                <FiArrowUpRight className="mt-1.5 shrink-0 text-faint transition-colors group-hover:text-accent" />
              </a>
            </motion.li>
          ))}
        </ul>
      )}

      {c.cards && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {c.cards.map((k, i) => (
            <motion.a
              key={k.title}
              href={k.href}
              {...linkProps(k.href)}
              {...fadeUp}
              transition={step(i)}
              className="card card-lift group flex flex-col p-5"
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-lg font-semibold text-ink transition-colors group-hover:text-accent">
                  {k.title}
                </span>
                <span className="font-mono text-[11px] text-faint">{k.meta}</span>
              </span>
              <span className="mt-1.5 text-sm leading-relaxed text-muted">{k.desc}</span>
            </motion.a>
          ))}
        </div>
      )}

      {c.points && (
        <ul className="mt-8 max-w-[62ch] space-y-3">
          {c.points.map((pt, i) => (
            <motion.li
              key={pt}
              {...fadeUp}
              transition={step(i)}
              className="relative pl-5 text-[15px] leading-relaxed text-muted before:absolute before:left-0 before:top-[0.7em] before:h-1 before:w-2.5 before:rounded-full before:bg-accent/60"
            >
              {pt}
            </motion.li>
          ))}
        </ul>
      )}

      {c.links && (
        <div className="mt-6 flex flex-wrap gap-x-6">
          {c.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              {...linkProps(l.href)}
              className="inline-flex min-h-11 items-center gap-1.5 font-mono text-sm text-accent-dim transition-colors hover:text-accent"
            >
              {l.href.includes("github.com") && <FiGithub />} {l.label}{" "}
              {isExternal(l.href) ? <FiArrowUpRight /> : <FiArrowRight />}
            </a>
          ))}
        </div>
      )}

      {c.id === "contact" && (
        <motion.div
          {...fadeUp}
          transition={step(3)}
          className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
        >
          <Button asChild variant="cta" size="lg">
            <Link href="/contact">
              Get in touch
              <FiArrowUpRight />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href={resumeUrl} download>
              <FiDownload />
              Download CV
            </a>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <a href={SITE.author.github} target="_blank" rel="noopener noreferrer">
              <FiGithub />
              GitHub
            </a>
          </Button>
        </motion.div>
      )}
    </section>
  );
}

/** Mobile stand-in for the pinned stack: the same information, as text. */
function LayerChips({ lit }: { lit: Partial<Record<LayerId, string>> }) {
  return (
    <ul className="mt-7 flex flex-wrap gap-1.5 lg:hidden" aria-label="Layers this chapter touches">
      {LAYERS.map((l) => {
        const on = l.id in lit;
        return (
          <li
            key={l.id}
            className={`rounded-full border px-2.5 py-1 font-mono text-[11px] ${
              on ? "border-accent/60 bg-accent/10 text-accent" : "border-line text-faint"
            }`}
          >
            {l.label}
          </li>
        );
      })}
    </ul>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * One word that flips to the next on a timer, like a drum rolling up: the old
 * word tips back over the top while the new one comes up from below.
 *
 * Every word is also laid out invisibly in the same grid cell, so the box is
 * always as wide as the widest word and the headline never reflows mid-flip.
 *
 * The first word is what the server renders and what screen readers hear; the
 * flipping copies are aria-hidden so nothing gets announced every few seconds.
 * The timer stops while the word is off-screen or the tab is hidden, and with
 * reduced motion the first word just stays put.
 */

interface FlipWordsProps {
  words: readonly string[];
  /** How long each word stays up, in ms. */
  interval?: number;
  /** Classes for each word (e.g. a gradient fill). */
  wordClassName?: string;
  className?: string;
}

export default function FlipWords({
  words,
  interval = 2400,
  wordClassName,
  className,
}: FlipWordsProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce || !inView || words.length < 2) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % words.length);
    }, interval);
    return () => window.clearInterval(id);
  }, [reduce, inView, words.length, interval]);

  // The words are cut by the grid cell's box, not the glyphs: with a tight
  // line-height a gradient fill (background-clip: text) would shave the tops
  // off tall letters. Padding grows the painted box; the matching negative
  // margin keeps the line box the same height.
  const cell = "col-start-1 row-start-1 -my-[0.12em] py-[0.12em] whitespace-nowrap";

  return (
    <span
      ref={ref}
      className={cn("relative inline-grid", className)}
      style={{ perspective: "800px" }}
    >
      <span className="sr-only">{words[0]}</span>

      {words.map((w) => (
        <span key={`size-${w}`} aria-hidden className={cn(cell, "invisible")}>
          {w}
        </span>
      ))}

      <AnimatePresence initial={false}>
        <motion.span
          key={words[index]}
          aria-hidden
          className={cn(cell, wordClassName)}
          style={{ transformOrigin: "50% 50% -0.45em", backfaceVisibility: "hidden" }}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

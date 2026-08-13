/**
 * Motion presets. Everything on the site animates through these so the whole
 * page shares one easing curve and one sense of weight — previously each
 * section picked its own duration between 0.4 and 0.6 with default easing,
 * which reads as sloppy even when you can't name why.
 *
 * framer-motion honours prefers-reduced-motion globally via the MotionConfig
 * in components/Providers.tsx, so these need no per-use guard.
 */

/** Matches --ease-out-quint in globals.css. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Entrance for content that scrolls into view. */
export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" } as const,
};

/** Entrance for above-the-fold content, which shouldn't wait for a scroll. */
export const fadeUpNow = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

/**
 * Per-item transition. Pass the item's index for a stagger; grid items should
 * stagger by column (`i % columns`) so rows don't cascade too slowly.
 */
export const step = (i = 0, base = 0.07) => ({
  duration: 0.5,
  delay: i * base,
  ease: EASE,
});

/** A single, slightly slower entrance — page headers, hero panels. */
export const lead = (delay = 0) => ({
  duration: 0.6,
  delay,
  ease: EASE,
});

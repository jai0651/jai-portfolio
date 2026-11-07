"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { LAYERS, type LayerId } from "@/lib/story";

/*
 * The one object the story page follows: five isometric slabs.
 *
 * `pitch` is the vertical distance between slab centres. At CLOSED it equals
 * the slab thickness, so the slabs sit flush and read as a single box; at OPEN
 * they separate into an exploded view with room for a label beside each one.
 * The page drives pitch from scroll, so the box opens as the hero scrolls away.
 *
 * Drawn in SVG rather than CSS 3D so the geometry is exact at every size and
 * there is no perspective distortion to fight.
 */

export const CLOSED = 14;
export const OPEN = 92;

const W = 250; // top-face width
const H = 125; // top-face height (2:1 isometric)
const T = CLOSED; // slab thickness
const CX = 150;
const CY = 262;

const pts = (p: [number, number][]) => p.map(([x, y]) => `${x},${y}`).join(" ");

const TOP = pts([
  [CX, CY - H / 2],
  [CX + W / 2, CY],
  [CX, CY + H / 2],
  [CX - W / 2, CY],
]);
const INSET = pts([
  [CX, CY - H * 0.31],
  [CX + W * 0.31, CY],
  [CX, CY + H * 0.31],
  [CX - W * 0.31, CY],
]);
const LEFT = pts([
  [CX - W / 2, CY],
  [CX, CY + H / 2],
  [CX, CY + H / 2 + T],
  [CX - W / 2, CY + T],
]);
const RIGHT = pts([
  [CX, CY + H / 2],
  [CX + W / 2, CY],
  [CX + W / 2, CY + T],
  [CX, CY + H / 2 + T],
]);

const GOLD = "#f0b429";
const EASE = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const };

interface StackObjectProps {
  pitch: MotionValue<number>;
  lit: Partial<Record<LayerId, string>>;
  className?: string;
}

export default function StackObject({ pitch, lit, className }: StackObjectProps) {
  const litNames = LAYERS.filter((l) => l.id in lit).map((l) => l.label);
  // Paint bottom-up so each slab overlaps the one beneath it when closed.
  const paintOrder = LAYERS.map((l, i) => ({ ...l, i })).reverse();

  return (
    <svg
      viewBox="0 0 560 540"
      className={className}
      role="img"
      aria-label={
        litNames.length
          ? `A stack of five layers, with ${litNames.join(", ")} lit`
          : "A stack of five layers: product, agents, models, systems, silicon"
      }
    >
      <defs>
        <filter id="slab-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>
      {paintOrder.map((l) => (
        <Slab
          key={l.id}
          index={l.i}
          label={l.label}
          note={lit[l.id]}
          on={l.id in lit}
          pitch={pitch}
        />
      ))}
    </svg>
  );
}

function Slab({
  index,
  label,
  note,
  on,
  pitch,
}: {
  index: number;
  label: string;
  note?: string;
  on: boolean;
  pitch: MotionValue<number>;
}) {
  const y = useTransform(pitch, (p) => (index - 2) * p);
  // Labels only make sense once there's air between the slabs.
  const labelOpacity = useTransform(pitch, [CLOSED + 16, OPEN - 8], [0, 1]);

  return (
    <motion.g style={{ y }}>
      {/* glow sits behind the slab, so it reads as light from underneath */}
      <motion.polygon
        points={TOP}
        fill={GOLD}
        filter="url(#slab-glow)"
        initial={false}
        animate={{ opacity: on ? 0.32 : 0 }}
        transition={EASE}
      />
      <motion.polygon
        points={LEFT}
        initial={false}
        animate={{
          fill: on ? "rgba(51,46,31,1)" : "rgba(15,20,29,1)",
          stroke: on ? "rgba(240,180,41,0.55)" : "rgba(46,58,77,1)",
        }}
        transition={EASE}
        strokeWidth={1}
        strokeLinejoin="round"
      />
      <motion.polygon
        points={RIGHT}
        initial={false}
        animate={{
          fill: on ? "rgba(31,31,26,1)" : "rgba(11,16,24,1)",
          stroke: on ? "rgba(240,180,41,0.55)" : "rgba(46,58,77,1)",
        }}
        transition={EASE}
        strokeWidth={1}
        strokeLinejoin="round"
      />
      <motion.polygon
        points={TOP}
        initial={false}
        animate={{
          fill: on ? "rgba(65,58,40,1)" : "rgba(21,28,40,1)",
          stroke: on ? "rgba(240,180,41,1)" : "rgba(46,58,77,1)",
        }}
        transition={EASE}
        strokeWidth={1.25}
        strokeLinejoin="round"
      />
      <motion.polygon
        points={INSET}
        fill="none"
        strokeDasharray="3 4"
        initial={false}
        animate={{ stroke: on ? "rgba(247,208,112,0.7)" : "rgba(46,58,77,0.9)" }}
        transition={EASE}
      />

      <motion.g style={{ opacity: labelOpacity }}>
        <motion.line
          x1={CX + W / 2 + 10}
          y1={CY}
          x2={CX + W / 2 + 32}
          y2={CY}
          strokeWidth={1}
          initial={false}
          animate={{ stroke: on ? GOLD : "rgba(46,58,77,1)" }}
          transition={EASE}
        />
        <motion.text
          x={CX + W / 2 + 42}
          y={note && on ? CY - 4 : CY + 4}
          className="font-mono"
          fontSize={12.5}
          letterSpacing={2.2}
          initial={false}
          animate={{ fill: on ? GOLD : "#76818f" }}
          transition={EASE}
        >
          {label.toUpperCase()}
        </motion.text>
        {note && on && (
          <motion.text
            key={note}
            x={CX + W / 2 + 42}
            y={CY + 16}
            fontSize={13}
            fill="#dde3ec"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={EASE}
          >
            {note}
          </motion.text>
        )}
      </motion.g>
    </motion.g>
  );
}

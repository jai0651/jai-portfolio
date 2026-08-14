"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type VoiceState = "idle" | "listening" | "thinking" | "speaking";

/**
 * The acoustic visual language for the voice UI, in one place so the launcher
 * and the panel can't drift apart.
 *
 * Sonar rings travel outward — the one metaphor everyone already reads as
 * "sound". Restraint is the point: idle just breathes, and only `listening`
 * reacts to the real microphone level, so motion always means something.
 */
interface AcousticOrbProps {
  state: VoiceState;
  /** Mic RMS 0–1. Only consulted while listening. */
  level?: number;
  size?: number;
  children?: ReactNode;
  className?: string;
}

const AcousticOrb = ({
  state,
  level = 0,
  size = 56,
  children,
  className,
}: AcousticOrbProps) => {
  const active = state === "listening";
  const speaking = state === "speaking";

  // Rings run always — the resting ripple is what makes the orb feel acoustic
  // rather than like a flat button. Idle is just much slower and fainter.
  const ringAnim = active
    ? "animate-sonar-fast"
    : state === "idle"
      ? "animate-sonar-slow"
      : "animate-sonar";
  const ringGap = active ? 0.5 : state === "idle" ? 1.6 : 1.05;

  // A gentle swell driven by real loudness, clamped so it never gets silly.
  const swell = active ? 1 + Math.min(0.18, level * 0.26) : 1;

  const isDark = state === "thinking";

  return (
    <span
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-full border",
            ringAnim,
            speaking ? "border-accent-2/60" : "border-accent/60"
          )}
          style={{ animationDelay: `${i * ringGap}s` }}
        />
      ))}

      {/* Soft bloom — present even at rest so the disc sits in light. */}
      <span
        aria-hidden
        className={cn(
          "absolute rounded-full blur-md transition-opacity duration-500",
          speaking ? "bg-accent-2/25" : "bg-accent/25",
          state === "idle" ? "opacity-60" : "opacity-100"
        )}
        style={{ inset: -6 }}
      />

      {/* Core */}
      <span
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-full transition-[transform,box-shadow] duration-200 ease-out-quint",
          state === "idle" && "animate-breathe shadow-glow",
          active && "shadow-glow-lg",
          speaking && "shadow-glow",
          isDark ? "text-accent ring-1 ring-accent/40" : "text-primary"
        )}
        style={{
          width: size,
          height: size,
          transform: `scale(${swell})`,
          /* A radial highlight instead of a flat fill — this is what stops it
             reading as a sticker and starts it reading as a physical object. */
          background: isDark
            ? "radial-gradient(120% 120% at 30% 22%, #1d2534 0%, #10151f 70%)"
            : speaking
              ? "radial-gradient(120% 120% at 30% 22%, #ffe6a8 0%, #f7d070 42%, #e0ae3c 100%)"
              : "radial-gradient(120% 120% at 30% 22%, #ffdf9b 0%, #f5bd42 40%, #d99a20 100%)",
          /* Inner rim: a bright top edge and a darker bottom edge. */
          boxShadow: isDark
            ? undefined
            : "inset 0 1.5px 1px rgba(255,255,255,0.55), inset 0 -2px 3px rgba(120,70,0,0.35)",
        }}
      >
        {/* Slow sheen sweep — subtle material movement, idle only. */}
        {state === "idle" && (
          <span
            aria-hidden
            className="animate-sheen absolute -inset-1/2 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.34)_28deg,transparent_66deg)]"
          />
        )}
        <span className="relative flex items-center justify-center">{children}</span>
      </span>
    </span>
  );
};

/**
 * Live waveform bars. Reads the actual RMS rather than looping a canned
 * animation, so a silent room genuinely looks silent.
 */
export const Waveform = ({
  level,
  bars = 9,
  className,
}: {
  level: number;
  bars?: number;
  className?: string;
}) => (
  <span aria-hidden className={cn("flex items-center gap-[3px]", className)}>
    {Array.from({ length: bars }, (_, i) => {
      // Centre bars respond hardest, edges stay calmer — reads as a voice
      // rather than a graphic equaliser.
      const weight = 1 - Math.abs(i - (bars - 1) / 2) / ((bars - 1) / 2 + 0.6);
      const h = 3 + Math.min(1, level * (0.5 + weight)) * 22;
      return (
        <span
          key={i}
          className="w-[3px] rounded-full bg-current transition-[height] duration-75"
          style={{ height: `${h}px` }}
        />
      );
    })}
  </span>
);

export default AcousticOrb;

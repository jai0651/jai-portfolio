import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Vertical rhythm + section tone in one place.
 *
 * `tone` is what gives the page visible chapters — previously every band was
 * the same flat colour top to bottom, so the eye had nothing to anchor to.
 * Alternate `plain` and `alt` down a page; reserve `glow` for a single CTA.
 */
type Tone = "plain" | "alt" | "glow" | "hero";
type Space = "none" | "sm" | "md" | "lg";

const TONE: Record<Tone, string> = {
  plain: "",
  alt: "band-alt",
  glow: "band-glow",
  hero: "band-hero",
};

const SPACE: Record<Space, string> = {
  none: "",
  sm: "py-12 xl:py-16",
  md: "py-16 xl:py-24",
  lg: "py-20 xl:py-28",
};

interface SectionProps {
  children: ReactNode;
  tone?: Tone;
  space?: Space;
  /** Drop the inner container when the section manages its own width. */
  bleed?: boolean;
  id?: string;
  className?: string;
  /** Extra classes for the inner container. */
  innerClassName?: string;
}

const Section = ({
  children,
  tone = "plain",
  space = "md",
  bleed = false,
  id,
  className,
  innerClassName,
}: SectionProps) => (
  <section id={id} className={cn(TONE[tone], SPACE[space], className)}>
    {bleed ? (
      children
    ) : (
      <div className={cn("container mx-auto px-4", innerClassName)}>
        {children}
      </div>
    )}
  </section>
);

export default Section;

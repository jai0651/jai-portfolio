import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The one way a section introduces itself: a shell prompt, a mono headline,
 * and an Inter sub-line. Every page used to hand-roll this with slightly
 * different markup and spacing — that drift is what read as unpolished.
 *
 * `cmd` is the prompt text without the leading "$".
 */
interface SectionHeaderProps {
  cmd: string;
  title?: ReactNode;
  sub?: ReactNode;
  /** Right-aligned slot — action links, counts, profile chips. */
  meta?: ReactNode;
  /** Headline level. Only the page's primary section should be h1. */
  as?: "h1" | "h2" | "h3";
  /** Headline visual size, independent of semantic level. */
  size?: "lg" | "md";
  className?: string;
}

const SectionHeader = ({
  cmd,
  title,
  sub,
  meta,
  as: Tag = "h2",
  size = "lg",
  className,
}: SectionHeaderProps) => (
  <div
    className={cn(
      "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
      title ? "mb-10 xl:mb-14" : "mb-5",
      className
    )}
  >
    <div className="min-w-0">
      <p className="font-mono text-xs text-faint">
        <span className="text-accent-dim">$</span> {cmd}
      </p>

      {title && (
        <Tag className={cn(size === "lg" ? "h2" : "h3", "mt-3 text-ink")}>
          {title}
        </Tag>
      )}

      {sub && (
        <p className="prose-measure mt-3 text-[15px] leading-relaxed text-muted">
          {sub}
        </p>
      )}
    </div>

    {meta && <div className="shrink-0 self-start sm:self-end">{meta}</div>}
  </div>
);

export default SectionHeader;

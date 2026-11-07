import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The top of every secondary page, in the homepage's type: a shell prompt as
 * the eyebrow, a large sans headline, and one plain line under it. Keeping
 * this in one place is what makes /work, /blog and /learn read as the same
 * site as the homepage.
 */
interface PageHeroProps {
  /** Prompt text without the leading "$". */
  cmd: string;
  title: ReactNode;
  sub?: ReactNode;
  /** Right-aligned slot on wide screens: a count, a toggle, a button. */
  meta?: ReactNode;
  className?: string;
}

export default function PageHero({ cmd, title, sub, meta, className }: PageHeroProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-8 pb-12 pt-6 lg:flex-row lg:items-end lg:justify-between xl:pb-16",
        className
      )}
    >
      <div className="min-w-0 max-w-4xl">
        <p className="font-mono text-xs text-faint">
          <span className="text-accent-dim">$</span> {cmd}
        </p>
        <h1 className="mt-5 text-balance font-sans text-[44px] font-semibold leading-[0.98] tracking-[-0.045em] text-ink sm:text-[64px] xl:text-[80px]">
          {title}
        </h1>
        {sub && (
          <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-muted xl:text-xl">
            {sub}
          </p>
        )}
      </div>
      {meta && <div className="shrink-0">{meta}</div>}
    </header>
  );
}

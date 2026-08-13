import { cn } from "@/lib/utils";

/**
 * A sweeping shimmer rather than a whole-block opacity pulse — it reads as
 * "loading" instead of "broken", and it doesn't flash the whole layout.
 */
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-line/60 bg-surface-2/50",
        "after:absolute after:inset-0 after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/[0.06] after:to-transparent after:bg-[length:200%_100%]",
        className
      )}
    />
  );
}

export { Skeleton };

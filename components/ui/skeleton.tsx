import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md border border-line/60 bg-surface-2/60",
        className
      )}
    />
  );
}

export { Skeleton };

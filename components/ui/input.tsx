import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-md border border-line bg-surface px-4 py-3 font-mono text-sm text-ink transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink placeholder:text-faint focus:border-accent/60 focus:bg-surface-2 focus:outline-none focus:ring-1 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };


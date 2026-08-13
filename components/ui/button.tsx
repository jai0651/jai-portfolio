import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-mono font-medium tracking-tight transition-all duration-200 ease-out-quint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-primary disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-primary shadow-[0_0_0_1px_rgba(240,180,41,0.35)] hover:bg-accent-hover hover:shadow-glow hover:-translate-y-px",
        /*
         * The page's single most important action. Carries a slow breathing
         * ring — deliberately limited to one instance per screen, because the
         * effect stops meaning "this one" the moment it repeats.
         */
        cta:
          "animate-pulse-ring bg-accent text-primary hover:bg-accent-hover hover:-translate-y-px",
        destructive: "bg-red-500/90 text-white hover:bg-red-500",
        outline:
          "border border-line bg-surface-2/50 text-ink shadow-e1 hover:border-accent/50 hover:bg-surface-2 hover:text-accent hover:-translate-y-px",
        secondary:
          "border border-line bg-surface-2 text-ink shadow-e1 hover:border-line-2 hover:text-white",
        ghost: "text-muted hover:bg-white/5 hover:text-ink",
        link: "text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent",
      },
      size: {
        default: "h-11 px-5 py-2.5 text-sm",
        sm: "h-9 rounded-md px-4 text-sm",
        lg: "h-12 px-6 text-[15px]",
        icon: "h-10 w-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

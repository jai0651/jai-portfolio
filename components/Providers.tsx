"use client";

import { SessionProvider } from "next-auth/react";
import { MotionConfig } from "framer-motion";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      {/*
        The CSS prefers-reduced-motion guard in globals.css can't reach
        framer-motion, which animates via JS. reducedMotion="user" makes every
        motion.* on the site honour the OS setting — transforms are dropped,
        opacity still cross-fades.
      */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </SessionProvider>
  );
}

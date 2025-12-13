"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Only track visits on the home page
    if (pathname !== "/") return;
    
    // Check if we've already tracked this session
    const sessionKey = "home_page_visited";
    if (typeof window !== "undefined" && sessionStorage.getItem(sessionKey)) {
      return;
    }

    const trackVisit = async () => {
      try {
        await fetch("/api/visitors/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: "/" }),
        });
        
        // Mark this session as tracked
        if (typeof window !== "undefined") {
          sessionStorage.setItem(sessionKey, "true");
        }
      } catch {
        // Silently fail - visitor tracking is not critical
      }
    };

    trackVisit();
  }, [pathname]);

  return null;
}


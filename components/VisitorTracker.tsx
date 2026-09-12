"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Records one visit per path per session.
 *
 * This used to fire only on "/", which meant the visitor table could say how
 * many people arrived but never which pages they read. The session guard is
 * per path so a reader moving through three posts counts as three page views
 * and one visitor, rather than three visitors.
 */
export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const key = `visit:${pathname}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    fetch("/api/visitors/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {
      // Tracking is not worth breaking a page over.
    });
  }, [pathname]);

  return null;
}

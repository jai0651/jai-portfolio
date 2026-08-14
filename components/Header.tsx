"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import Nav from "./Nav";
import MobileNav from "./MobileNav";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  // Contact isn't in the nav, so the CTA carries its own active state —
  // otherwise being on /contact shows no indicator anywhere.
  const onContact = pathname === "/contact";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div
        className={`transition-all duration-300 ease-out-quint ${
          scrolled ? "py-2" : "py-4"
        }`}
      >
        <div className="container mx-auto px-4">
          <div
            className={`flex h-14 items-center justify-between rounded-xl px-4 transition-all duration-300 ease-out-quint ${
              scrolled
                ? "glass-strong shadow-e3"
                : "border border-transparent bg-transparent"
            }`}
          >
            {/* window chrome + logo */}
            <Link
              href="/"
              className="group flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              {/* Block-cursor mark — one confident gold glyph instead of
                  three decorative window dots that did nothing. */}
              <span
                aria-hidden
                className="h-4 w-1.5 rounded-sm bg-accent shadow-[0_0_12px_rgba(240,180,41,0.6)] transition-transform duration-200 ease-out-quint group-hover:scale-y-110"
              />
              <span className="font-mono text-sm text-muted">
                <span className="text-accent">jai</span>
                <span className="text-faint">@</span>
                <span className="text-ink">shankar</span>
                <span className="text-faint transition-colors group-hover:text-muted">
                  {" "}
                  : ~
                </span>
              </span>
            </Link>

            <div className="hidden items-center gap-5 xl:flex">
              <Nav />
              <span className="h-5 w-px bg-line" />
              <Button asChild size="sm" variant={onContact ? "outline" : "default"}>
                <Link href="/contact" aria-current={onContact ? "page" : undefined}>
                  ./contact
                </Link>
              </Button>
            </div>

            <div className="xl:hidden">
              <MobileNav />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

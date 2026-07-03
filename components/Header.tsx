"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import Nav from "./Nav";
import MobileNav from "./MobileNav";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className={`transition-all duration-300 ${scrolled ? "py-2.5" : "py-4"}`}>
        <div className="container mx-auto px-4">
          <div
            className={`flex h-14 items-center justify-between rounded-lg px-4 transition-all duration-300 ${
              scrolled
                ? "glass-strong shadow-lg shadow-black/30"
                : "border border-transparent"
            }`}
          >
            {/* window chrome + logo */}
            <Link href="/" className="group flex items-center gap-3">
              <span className="hidden items-center gap-1.5 sm:flex">
                <span className="term-dot bg-[#ff5f56]/80" />
                <span className="term-dot bg-[#ffbd2e]/80" />
                <span className="term-dot bg-[#27c93f]/80" />
              </span>
              <span className="font-mono text-sm text-muted">
                <span className="text-accent">jai</span>
                <span className="text-faint">@</span>
                <span className="text-ink">shankar</span>
                <span className="text-faint group-hover:text-muted"> : ~</span>
              </span>
            </Link>

            <div className="hidden items-center gap-6 xl:flex">
              <Nav />
              <Button asChild size="sm">
                <Link href="/contact">./contact</Link>
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

"use client";

import Link from "next/link";
import Social from "./Social";

const navLinks = [
  { label: "~", path: "/" },
  { label: "~/work", path: "/work" },
  { label: "~/resume", path: "/resume" },
  { label: "~/contact", path: "/contact" },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-line">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href="/" className="font-mono text-sm">
              <span className="text-accent">jai</span>
              <span className="text-faint">@</span>
              <span className="text-ink">shankar</span>
              <span className="text-faint"> : ~</span>
            </Link>
            <p className="mt-3 max-w-xs font-mono text-sm text-muted">
              <span className="text-accent-dim">$</span> building at the
              intersection of software, ML &amp; physics.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="text-muted transition-colors hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Social
            containerStyles="flex gap-2.5"
            iconStyles="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-surface-2/60 text-muted transition-all duration-200 hover:border-accent/50 hover:text-accent hover:-translate-y-0.5"
          />
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line/70 pt-6 font-mono text-xs text-faint md:flex-row md:items-center md:justify-between">
          <p>
            <span className="text-accent-dim"># </span>© {year} Jai Shankar —
            all rights reserved.
          </p>
          <p>built with next.js · tailwind · a small llm</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

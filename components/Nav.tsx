"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const links = [
  { label: "~", path: "/" },
  { label: "~/work", path: "/work" },
  { label: "~/blog", path: "/blog" },
  { label: "~/resume", path: "/resume" },
  { label: "~/contact", path: "/contact" },
];

const Nav = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-0.5 font-mono text-sm">
      {links.map((link) => {
        const active = link.path === pathname;
        return (
          <Link
            key={link.path}
            href={link.path}
            aria-current={active ? "page" : undefined}
            className={`relative rounded-md px-3 py-1.5 transition-colors duration-200 ${
              active ? "text-accent" : "text-muted hover:text-ink"
            }`}
          >
            {/*
              A shared layoutId makes the active pill slide between items
              instead of blinking out and in — the cheapest possible upgrade
              in perceived quality for a nav.
            */}
            {active && (
              <motion.span
                layoutId="nav-active"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="absolute inset-0 rounded-md border border-line bg-surface-2/70"
              />
            )}
            <span className="relative">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default Nav;

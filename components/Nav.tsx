"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "~", path: "/" },
  { label: "~/work", path: "/work" },
  { label: "~/resume", path: "/resume" },
  { label: "~/contact", path: "/contact" },
];

const Nav = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 font-mono text-sm">
      {links.map((link) => {
        const active = link.path === pathname;
        return (
          <Link
            key={link.path}
            href={link.path}
            className={`relative rounded-md px-3 py-1.5 transition-colors duration-200 ${
              active ? "text-accent" : "text-muted hover:text-ink"
            }`}
          >
            {active && (
              <span className="absolute inset-0 rounded-md border border-line bg-surface-2/70" />
            )}
            <span className="relative">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default Nav;

"use client";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { CiMenuFries } from "react-icons/ci";

const links = [
  { label: "~", path: "/" },
  { label: "~/work", path: "/work" },
  { label: "~/blog", path: "/blog" },
  { label: "~/resume", path: "/resume" },
  { label: "~/contact", path: "/contact" },
];

const MobileNav = () => {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger
        aria-label="Open navigation menu"
        className="flex items-center justify-center rounded-md border border-line bg-surface-2/60 p-2.5 text-muted shadow-e1 transition-colors duration-200 hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
      >
        <CiMenuFries className="text-2xl" />
      </SheetTrigger>
      <SheetContent className="glass-strong flex flex-col border-l border-line">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="mb-10 mt-16 font-mono text-sm text-muted">
          <span className="text-accent">jai</span>
          <span className="text-faint">@</span>
          <span className="text-ink">shankar</span>
          <span className="cursor ml-1 animate-blink align-middle" />
        </div>
        <nav className="flex flex-col gap-1 font-mono">
          {links.map((link) => {
            const active = link.path === pathname;
            return (
              <SheetClose asChild key={link.path}>
                <Link
                  href={link.path}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-md px-3 py-2.5 text-xl transition-colors duration-200 ${
                    active
                      ? "border border-line bg-surface-2/70 text-accent"
                      : "border border-transparent text-muted hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              </SheetClose>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;

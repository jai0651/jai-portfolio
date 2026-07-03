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
  { label: "~/resume", path: "/resume" },
  { label: "~/contact", path: "/contact" },
];

const MobileNav = () => {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger className="flex items-center justify-center rounded-md border border-line bg-surface-2/60 p-2.5 text-muted transition-colors hover:border-accent/40 hover:text-accent">
        <CiMenuFries className="text-2xl" />
      </SheetTrigger>
      <SheetContent className="glass-strong flex flex-col border-l border-line">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="mt-16 mb-10 font-mono text-sm text-muted">
          <span className="text-accent">jai</span>
          <span className="text-faint">@</span>
          <span className="text-ink">shankar</span>
          <span className="cursor ml-1 animate-blink align-middle" />
        </div>
        <nav className="flex flex-col gap-4 font-mono">
          {links.map((link) => {
            const active = link.path === pathname;
            return (
              <SheetClose asChild key={link.path}>
                <Link
                  href={link.path}
                  className={`text-xl transition-colors duration-200 ${
                    active ? "text-accent" : "text-muted hover:text-ink"
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

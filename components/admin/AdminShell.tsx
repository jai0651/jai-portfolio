"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  FaTachometerAlt,
  FaEye,
  FaEnvelope,
  FaImages,
  FaBriefcase,
  FaCode,
  FaGraduationCap,
  FaTools,
  FaTrophy,
  FaProjectDiagram,
  FaFileAlt,
  FaShare,
  FaCog,
  FaSignOutAlt,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { HiBars3, HiXMark } from "react-icons/hi2";

const nav = [
  { label: "Dashboard", href: "/admin", icon: <FaTachometerAlt /> },
  { label: "Visitors", href: "/admin/visitors", icon: <FaEye /> },
  { label: "Messages", href: "/admin/messages", icon: <FaEnvelope /> },
  { label: "Media", href: "/admin/media", icon: <FaImages /> },
  { label: "Services", href: "/admin/services", icon: <FaBriefcase /> },
  { label: "Experience", href: "/admin/experience", icon: <FaCode /> },
  { label: "Education", href: "/admin/education", icon: <FaGraduationCap /> },
  { label: "Skills", href: "/admin/skills", icon: <FaTools /> },
  { label: "Achievements", href: "/admin/achievements", icon: <FaTrophy /> },
  { label: "Projects", href: "/admin/projects", icon: <FaProjectDiagram /> },
  { label: "Resume", href: "/admin/resume", icon: <FaFileAlt /> },
  { label: "Social Links", href: "/admin/social", icon: <FaShare /> },
  { label: "Settings", href: "/admin/settings", icon: <FaCog /> },
];

const AdminShell = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (!isLogin && status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, isLogin, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (isLogin) {
    return <div className="min-h-screen bg-primary">{children}</div>;
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary">
        <div className="flex items-center gap-3 text-white/60">
          <span className="h-3 w-3 animate-ping rounded-full bg-accent" />
          Loading…
        </div>
      </div>
    );
  }

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-6">
        <span className="text-2xl font-bold tracking-tight">
          Jai<span className="gradient-text">.</span>
          <span className="ml-1 font-mono text-xs font-medium text-white/40">
            admin
          </span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {nav.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-accent/20 to-accent-3/10 text-white ring-1 ring-accent/30"
                  : "text-white/55 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className={active ? "text-accent" : "text-white/40"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-white/10 p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/55 transition-colors hover:bg-white/5 hover:text-white"
        >
          <FaExternalLinkAlt className="text-white/40" />
          View site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400/80 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <FaSignOutAlt />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-primary">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-surface/60 backdrop-blur-xl lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-surface backdrop-blur-xl lg:hidden">
            {SidebarContent}
          </aside>
        </>
      )}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-primary/80 px-4 py-3 backdrop-blur-xl lg:hidden">
          <span className="text-lg font-bold">
            Jai<span className="gradient-text">.</span>
            <span className="ml-1 font-mono text-xs text-white/40">admin</span>
          </span>
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/80"
            aria-label="Open menu"
          >
            {mobileOpen ? <HiXMark className="text-xl" /> : <HiBars3 className="text-xl" />}
          </button>
        </header>

        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
};

export default AdminShell;

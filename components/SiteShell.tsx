"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuroraBackground from "@/components/AuroraBackground";

// Defer the chat widget (framer-motion + chat logic) so it never blocks the
// initial page render. It hydrates after the page is interactive.
const ChatWidget = dynamic(() => import("@/components/chat/ChatWidget"), {
  ssr: false,
});

const SiteShell = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <AuroraBackground />
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <main key={pathname} className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
      <ChatWidget />
    </>
  );
};

export default SiteShell;

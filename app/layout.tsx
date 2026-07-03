import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { VisitorTracker } from "@/components/VisitorTracker";
import SiteShell from "@/components/SiteShell";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jetbrainsMono",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Jai Shankar — AI / LLM Engineer",
  description:
    "AI/LLM engineer and software engineer working at the intersection of software, machine learning, maths and physics. LLM agents in production, ML systems, and differentiable-physics research (IIT Delhi).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <Providers>
          <VisitorTracker />
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}

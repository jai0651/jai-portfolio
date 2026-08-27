import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { VisitorTracker } from "@/components/VisitorTracker";
import SiteShell from "@/components/SiteShell";

// Mono carries the identity: headings, nav, labels, chips, numerals, shell
// output. Inter carries prose. Both swap so text is never invisible on load.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrainsMono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Jai Shankar — Software Engineer / AI & LLM Engineer",
  description:
    "Software engineer and AI/LLM engineer working at the intersection of software, machine learning, maths and physics. LLM agents in production, ML systems, and differentiable-physics research (IIT Delhi).",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon" }],
  },
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

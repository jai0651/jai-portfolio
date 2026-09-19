import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import { SITE } from "@/lib/site";
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

export const metadata: Metadata = {
  // Every relative URL in metadata resolves against this, including the
  // canonicals and the OG images. Without it Next emits relative og:url, which
  // several crawlers drop.
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: "%s — Jai Shankar",
  },
  description: SITE.description,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/feed.xml", title: `${SITE.name} — posts` }] },
  },
  authors: [{ name: SITE.author.name, url: SITE.author.url }],
  creator: SITE.author.name,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    url: SITE.url,
    title: SITE.title,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
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
        {/*
          Identity graph. Tells a search engine that the site, the person and
          the GitHub account are the same entity, which is what lets a result
          carry a name instead of a bare URL.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Person",
                  "@id": `${SITE.url}#person`,
                  name: SITE.author.name,
                  url: SITE.url,
                  jobTitle: "AI Engineer",
                  sameAs: [SITE.author.github],
                  knowsAbout: [
                    "Speech recognition", "Text to speech", "Voice AI",
                    "Multimodal retrieval", "LLM agents", "Machine learning systems",
                  ],
                },
                {
                  "@type": "WebSite",
                  "@id": `${SITE.url}#website`,
                  url: SITE.url,
                  name: SITE.name,
                  description: SITE.description,
                  publisher: { "@id": `${SITE.url}#person` },
                  inLanguage: "en-GB",
                },
              ],
            }),
          }}
        />
        <Providers>
          <VisitorTracker />
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}

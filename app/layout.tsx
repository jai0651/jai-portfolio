import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Providers } from "@/components/Providers";
import { VisitorTracker } from "@/components/VisitorTracker";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-jetbrainsMono",
});

export const metadata = {
  title: "Jai Shankar | Portfolio",
  description:
    "Full-Stack Developer specializing in React, Spring Boot, and AI Solutions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={jetbrainsMono.variable}>
        <Providers>
          <VisitorTracker />
          <Header />
          <PageTransition>{children}</PageTransition>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}


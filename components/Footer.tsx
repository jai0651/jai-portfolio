"use client";

import Link from "next/link";
import { FaHeart } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="py-6 border-t border-white/10">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-white/60 text-sm flex items-center gap-2">
            Made with <FaHeart className="text-accent" /> by{" "}
            <Link
              href="https://theweekendworld.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent/80 transition-colors"
            >
              theweekendworld
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


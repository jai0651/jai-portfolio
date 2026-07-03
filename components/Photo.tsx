"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FaUser } from "react-icons/fa";

interface PhotoProps {
  src?: string;
}

const Corner = ({ className }: { className: string }) => (
  <span
    className={`absolute h-4 w-4 border-accent/60 ${className}`}
  />
);

const Photo = ({ src }: PhotoProps) => {
  const hasPhoto = src && src.trim() !== "";
  const isExternalUrl = hasPhoto && src.startsWith("http");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-[260px] xl:w-[380px]"
    >
      {/* file caption */}
      <div className="mb-2 flex items-center justify-between font-mono text-xs text-faint">
        <span className="text-accent-dim">$ open ./avatar.png</span>
        <span className="hidden sm:inline">1 × 1</span>
      </div>

      <div className="term relative">
        <div className="term-bar">
          <span className="term-dot bg-[#ff5f56]/70" />
          <span className="term-dot bg-[#ffbd2e]/70" />
          <span className="term-dot bg-[#27c93f]/70" />
          <span className="ml-2 font-mono text-xs text-faint">avatar.png</span>
        </div>

        <div className="relative aspect-square overflow-hidden bg-surface-2">
          {/* subtle green tint + scanline glow */}
          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
          {hasPhoto ? (
            isExternalUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt="Jai Shankar"
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <Image
                src={src}
                priority
                quality={100}
                fill
                alt="Jai Shankar"
                className="object-cover object-center"
              />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <FaUser className="text-[120px] text-white/10 xl:text-[160px]" />
            </div>
          )}
        </div>
      </div>

      {/* corner ticks */}
      <Corner className="-left-1.5 -top-1.5 border-l-2 border-t-2" />
      <Corner className="-right-1.5 -top-1.5 border-r-2 border-t-2" />
      <Corner className="-bottom-1.5 -left-1.5 border-b-2 border-l-2" />
      <Corner className="-bottom-1.5 -right-1.5 border-b-2 border-r-2" />
    </motion.div>
  );
};

export default Photo;

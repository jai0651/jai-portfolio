"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FaUser } from "react-icons/fa";

interface PhotoProps {
  src?: string;
}

/*
 * Editorial author portrait, deliberately not a specimen record.
 *
 * Three things were making this read as a booking photo and all three are
 * gone: corner crop brackets (forensic framing), a `-rw-r--r--` permission
 * string under a face (catalogued evidence), and a 1:1 crop (passport ratio).
 *
 * What replaces them: a 4:5 editorial crop, and a warm rim glow *behind* the
 * panel. The subject wears black against a near-black ground, so without a
 * backlight the face floats free of the body — the glow is what a portrait
 * photographer would add to separate the two.
 */
const Photo = ({ src }: PhotoProps) => {
  const hasPhoto = src && src.trim() !== "";
  const isExternalUrl = hasPhoto && src.startsWith("http");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-[260px] xl:w-[360px]"
    >
      <p className="mb-3 font-mono text-xs text-faint">
        <span className="text-accent-dim">$</span> open ./avatar.png
      </p>

      <div className="relative">
        {/* Rim light — sits behind the panel and lifts the subject off the page. */}
        <div
          aria-hidden
          className="absolute -inset-8 -z-10 bg-[radial-gradient(58%_48%_at_50%_28%,rgba(240,180,41,0.18),transparent_72%)] blur-2xl"
        />

        <div className="relative overflow-hidden rounded-2xl border border-line bg-surface-2 shadow-e3">
          <div className="relative aspect-[4/5]">
            {hasPhoto ? (
              isExternalUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt="Jai Shankar"
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <Image
                  src={src}
                  priority
                  quality={100}
                  fill
                  sizes="(min-width: 1200px) 360px, 260px"
                  alt="Jai Shankar"
                  className="object-cover object-top"
                />
              )
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <FaUser className="text-[120px] text-line-2 xl:text-[150px]" />
              </div>
            )}

            {/* Light grounding fade only at the very bottom, so the torso
                settles into the frame instead of being erased by it. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-primary/55 to-transparent"
            />
          </div>

          {/* Hairline top highlight — the detail that makes a panel feel made. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Photo;

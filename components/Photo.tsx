"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FaUser } from "react-icons/fa";

interface PhotoProps {
  src?: string;
}

const Photo = ({ src }: PhotoProps) => {
  const hasPhoto = src && src.trim() !== "";
  const isExternalUrl = hasPhoto && src.startsWith("http");

  return (
    <div className="w-[300px] h-[300px] xl:w-[506px] xl:h-[506px] relative flex items-center justify-center">
      <div className="w-[280px] h-[280px] xl:w-[480px] xl:h-[480px] rounded-full overflow-hidden absolute flex items-center justify-center">
        {hasPhoto ? (
          isExternalUrl ? (
            <img
              src={src}
              alt="Profile Photo"
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <Image
              src={src}
              priority
              quality={100}
              fill
              alt="Profile Photo"
              className="object-cover object-center"
            />
          )
        ) : (
          <div className="w-full h-full bg-[#27272c] flex items-center justify-center">
            <FaUser className="text-white/20 text-[120px] xl:text-[180px]" />
          </div>
        )}
      </div>
      <motion.svg
        className="w-[300px] xl:w-[506px] h-[300px] xl:h-[506px] absolute"
        fill="transparent"
        viewBox="0 0 506 506"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.circle
          cx="253"
          cy="253"
          r="250"
          stroke="#00ff99"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ strokeDasharray: "24 10 0 0" }}
          animate={{
            strokeDasharray: ["15 120 25 25", "16 25 92 72", "4 250 22 22"],
            rotate: [120, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </motion.svg>
    </div>
  );
};

export default Photo;

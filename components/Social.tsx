"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaGithub,
  FaLinkedinIn,
  FaTwitter,
  FaYoutube,
  FaInstagram,
  FaFacebook,
  FaDribbble,
  FaBehance,
  FaMedium,
  FaDev,
} from "react-icons/fa";
import { SiCodeforces, SiLeetcode, SiHashnode } from "react-icons/si";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

const iconMap: Record<string, React.ReactNode> = {
  FaGithub: <FaGithub />,
  FaLinkedinIn: <FaLinkedinIn />,
  FaTwitter: <FaTwitter />,
  FaYoutube: <FaYoutube />,
  FaInstagram: <FaInstagram />,
  FaFacebook: <FaFacebook />,
  FaDribbble: <FaDribbble />,
  FaBehance: <FaBehance />,
  FaMedium: <FaMedium />,
  FaDev: <FaDev />,
  SiCodeforces: <SiCodeforces />,
  SiLeetcode: <SiLeetcode />,
  SiHashnode: <SiHashnode />,
};

interface SocialProps {
  containerStyles?: string;
  iconStyles?: string;
}

const Social = ({ containerStyles, iconStyles }: SocialProps) => {
  const [socials, setSocials] = useState<SocialLink[]>([]);

  useEffect(() => {
    const fetchSocials = async () => {
      try {
        const res = await fetch("/api/admin/social");
        if (res.ok) {
          const data = await res.json();
          setSocials(data.socialLinks);
        }
      } catch (e) {
        console.error("Failed to fetch social links:", e);
      }
    };
    fetchSocials();
  }, []);

  return (
    <div className={containerStyles}>
      {socials.map((item) => (
        <Link
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={iconStyles}
        >
          {iconMap[item.icon] || <FaGithub />}
        </Link>
      ))}
    </div>
  );
};

export default Social;

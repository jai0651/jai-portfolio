"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaBriefcase,
  FaCode,
  FaGraduationCap,
  FaCog,
  FaEnvelope,
  FaEye,
  FaSignOutAlt,
  FaProjectDiagram,
  FaShare,
  FaTools,
  FaTrophy,
  FaFileAlt,
  FaImages,
} from "react-icons/fa";

interface Visitor {
  id: string;
  path: string;
  city: string | null;
  country: string | null;
  ip: string | null;
  createdAt: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    visitors: 0,
    messages: 0,
  });
  const [recentVisitors, setRecentVisitors] = useState<Visitor[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      const visitorsRes = await fetch("/api/visitors?limit=10");
      if (visitorsRes.ok) {
        const data = await visitorsRes.json();
        setStats((prev) => ({ ...prev, visitors: data.pagination.total }));
        setRecentVisitors(data.visitors);
      }

      const messagesRes = await fetch("/api/admin/messages");
      if (messagesRes.ok) {
        const data = await messagesRes.json();
        setStats((prev) => ({ ...prev, messages: data.pagination?.total || 0 }));
      }
    } catch (e) {
      console.error("Failed to fetch stats:", e);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-accent text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  const menuItems = [
    { icon: <FaEye />, label: "Visitors", href: "/admin/visitors", count: stats.visitors },
    { icon: <FaEnvelope />, label: "Messages", href: "/admin/messages", count: stats.messages },
    { icon: <FaImages />, label: "Media Library", href: "/admin/media" },
    { icon: <FaBriefcase />, label: "Services", href: "/admin/services" },
    { icon: <FaCode />, label: "Experience", href: "/admin/experience" },
    { icon: <FaGraduationCap />, label: "Education", href: "/admin/education" },
    { icon: <FaTools />, label: "Skills", href: "/admin/skills" },
    { icon: <FaTrophy />, label: "Achievements", href: "/admin/achievements" },
    { icon: <FaProjectDiagram />, label: "Projects", href: "/admin/projects" },
    { icon: <FaFileAlt />, label: "Resume", href: "/admin/resume" },
    { icon: <FaShare />, label: "Social Links", href: "/admin/social" },
    { icon: <FaCog />, label: "Settings", href: "/admin/settings" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto py-8 px-4"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-accent">Admin Dashboard</h1>
          <p className="text-white/60">
            Welcome back, {session.user?.name || "Admin"}
          </p>
        </div>
        <Button
          onClick={() => signOut({ callbackUrl: "/" })}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FaSignOutAlt /> Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {menuItems.slice(0, 4).map((item, index) => (
          <Link key={index} href={item.href}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-[#27272c] rounded-xl p-6 hover:bg-[#323238] transition-colors cursor-pointer border border-white/5"
            >
              <div className="flex items-center justify-between">
                <div className="text-accent text-2xl">{item.icon}</div>
                {item.count !== undefined && (
                  <span className="text-2xl font-bold text-white">
                    {item.count}
                  </span>
                )}
              </div>
              <h3 className="text-white mt-4 font-medium">{item.label}</h3>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#27272c] rounded-xl p-6 border border-white/5">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {menuItems.slice(2).map((item, index) => (
              <Link key={index} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-3 p-3 bg-[#1e1e21] rounded-lg hover:bg-[#323238] transition-colors"
                >
                  <span className="text-accent">{item.icon}</span>
                  <span className="text-white/80">{item.label}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-[#27272c] rounded-xl p-6 border border-white/5">
          <h2 className="text-xl font-bold text-white mb-4">Recent Visitors</h2>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {recentVisitors.length === 0 ? (
              <p className="text-white/60">No visitors yet</p>
            ) : (
              recentVisitors.map((visitor) => (
                <div
                  key={visitor.id}
                  className="flex items-center justify-between p-3 bg-[#1e1e21] rounded-lg"
                >
                  <div>
                    <p className="text-white/80 text-sm">{visitor.path}</p>
                    <p className="text-white/40 text-xs">
                      {visitor.city && visitor.country
                        ? `${visitor.city}, ${visitor.country}`
                        : visitor.ip || "Unknown location"}
                    </p>
                  </div>
                  <span className="text-white/40 text-xs">
                    {new Date(visitor.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}


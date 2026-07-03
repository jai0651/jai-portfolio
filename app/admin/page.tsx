"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaEye,
  FaEnvelope,
  FaProjectDiagram,
  FaTools,
  FaArrowRight,
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
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    visitors: 0,
    messages: 0,
    projects: 0,
    skills: 0,
  });
  const [recentVisitors, setRecentVisitors] = useState<Visitor[]>([]);

  useEffect(() => {
    if (session) fetchStats();
  }, [session]);

  const fetchStats = async () => {
    try {
      const [visitorsRes, messagesRes, projectsRes, skillsRes] =
        await Promise.all([
          fetch("/api/visitors?limit=8"),
          fetch("/api/admin/messages"),
          fetch("/api/admin/projects"),
          fetch("/api/admin/skills"),
        ]);

      if (visitorsRes.ok) {
        const data = await visitorsRes.json();
        setStats((p) => ({ ...p, visitors: data.pagination.total }));
        setRecentVisitors(data.visitors);
      }
      if (messagesRes.ok) {
        const data = await messagesRes.json();
        setStats((p) => ({ ...p, messages: data.pagination?.total || 0 }));
      }
      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setStats((p) => ({ ...p, projects: data.projects?.length || 0 }));
      }
      if (skillsRes.ok) {
        const data = await skillsRes.json();
        setStats((p) => ({ ...p, skills: data.skills?.length || 0 }));
      }
    } catch (e) {
      console.error("Failed to fetch stats:", e);
    }
  };

  if (!session) return null;

  const cards = [
    { label: "Total Visitors", value: stats.visitors, icon: <FaEye />, href: "/admin/visitors" },
    { label: "Messages", value: stats.messages, icon: <FaEnvelope />, href: "/admin/messages" },
    { label: "Projects", value: stats.projects, icon: <FaProjectDiagram />, href: "/admin/projects" },
    { label: "Skills", value: stats.skills, icon: <FaTools />, href: "/admin/skills" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-6xl px-4 py-8 lg:px-8"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back,{" "}
          <span className="gradient-text">
            {session.user?.name || "Admin"}
          </span>
        </h1>
        <p className="mt-1 text-white/55">
          Here&apos;s what&apos;s happening with your portfolio.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent-3/20 text-accent">
                  {card.icon}
                </span>
                <FaArrowRight className="text-white/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent" />
              </div>
              <p className="mt-4 text-3xl font-bold">{card.value}</p>
              <p className="text-sm text-white/55">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Visitors</h2>
          <Link
            href="/admin/visitors"
            className="text-sm text-accent hover:text-accent-hover"
          >
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {recentVisitors.length === 0 ? (
            <p className="text-white/50">No visitors yet</p>
          ) : (
            recentVisitors.map((visitor) => (
              <div
                key={visitor.id}
                className="flex items-center justify-between rounded-xl bg-white/[0.02] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm text-white/80">
                    {visitor.path}
                  </p>
                  <p className="text-xs text-white/40">
                    {visitor.city && visitor.country
                      ? `${visitor.city}, ${visitor.country}`
                      : visitor.ip || "Unknown location"}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-white/40">
                  {new Date(visitor.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}

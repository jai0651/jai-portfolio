"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowLeft, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  order: number;
}

const iconOptions = [
  { value: "FaGithub", label: "GitHub" },
  { value: "FaLinkedinIn", label: "LinkedIn" },
  { value: "FaTwitter", label: "Twitter/X" },
  { value: "FaYoutube", label: "YouTube" },
  { value: "FaInstagram", label: "Instagram" },
  { value: "FaFacebook", label: "Facebook" },
  { value: "FaDribbble", label: "Dribbble" },
  { value: "FaBehance", label: "Behance" },
  { value: "FaMedium", label: "Medium" },
  { value: "FaDev", label: "Dev.to" },
  { value: "SiCodeforces", label: "Codeforces" },
  { value: "SiLeetcode", label: "LeetCode" },
  { value: "SiHashnode", label: "Hashnode" },
];

export default function SocialPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    platform: "",
    url: "",
    icon: "FaGithub",
    order: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
  }, [status, router]);

  useEffect(() => {
    if (session) fetchSocialLinks();
  }, [session]);

  const fetchSocialLinks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/social");
      if (res.ok) {
        const data = await res.json();
        setSocialLinks(data.socialLinks);
      }
    } catch (e) {
      console.error("Failed to fetch social links:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editing ? "PUT" : "POST";
      const body = editing ? { id: editing, ...formData } : formData;

      const res = await fetch("/api/admin/social", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        fetchSocialLinks();
        resetForm();
      }
    } catch (e) {
      console.error("Failed to save social link:", e);
    }
  };

  const handleEdit = (link: SocialLink) => {
    setEditing(link.id);
    setFormData({
      platform: link.platform,
      url: link.url,
      icon: link.icon,
      order: link.order,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this social link?")) return;
    try {
      await fetch(`/api/admin/social?id=${id}`, { method: "DELETE" });
      fetchSocialLinks();
    } catch (e) {
      console.error("Failed to delete social link:", e);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({ platform: "", url: "", icon: "FaGithub", order: 0 });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-accent text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto py-8 px-4"
    >
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin">
          <Button variant="outline" size="icon">
            <FaArrowLeft />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-accent">Social Links</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0f1422] rounded-xl p-6 border border-white/5">
          <h2 className="text-xl font-bold text-white mb-4">
            {editing ? "Edit" : "Add"} Social Link
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Platform (e.g., GitHub)"
              value={formData.platform}
              onChange={(e) =>
                setFormData({ ...formData, platform: e.target.value })
              }
              required
            />
            <Input
              placeholder="URL"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
            />
            <div>
              <label className="block text-white/80 mb-2 text-sm">Icon</label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full h-12 rounded-xl border-0 bg-white/5 px-4 py-3 text-base text-white ring-1 ring-white/10 transition-all duration-300 focus:bg-white/10 focus:ring-2 focus:ring-accent focus:outline-none"
              >
                {iconOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <Input
              type="number"
              placeholder="Order"
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
              }
            />
            <div className="flex gap-2">
              <Button type="submit" className="flex items-center gap-2">
                <FaSave /> {editing ? "Update" : "Add"}
              </Button>
              {editing && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  <FaTimes /> Cancel
                </Button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-[#0f1422] rounded-xl p-6 border border-white/5">
          <h2 className="text-xl font-bold text-white mb-4">
            Current Social Links
          </h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {socialLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 bg-[#0b0f19] rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{link.platform}</p>
                  <p className="text-accent text-sm truncate max-w-[200px]">
                    {link.url}
                  </p>
                  <p className="text-white/60 text-xs">Icon: {link.icon}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(link)}
                  >
                    <FaEdit className="text-accent" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(link.id)}
                  >
                    <FaTrash className="text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            {socialLinks.length === 0 && (
              <p className="text-white/60">No social links yet</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}


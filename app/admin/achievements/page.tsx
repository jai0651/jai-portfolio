"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { FaArrowLeft, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";

interface Achievement {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  issuer: string | null;
  proofUrl: string | null;
  certificateUrl: string | null;
  order: number;
}

export default function AchievementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    issuer: "",
    proofUrl: "",
    certificateUrl: "",
    order: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
  }, [status, router]);

  useEffect(() => {
    if (session) fetchAchievements();
  }, [session]);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/achievements");
      if (res.ok) {
        const data = await res.json();
        setAchievements(data.achievements);
      }
    } catch (e) {
      console.error("Failed to fetch achievements:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editing ? "PUT" : "POST";
      const body = editing ? { id: editing, ...formData } : formData;

      const res = await fetch("/api/admin/achievements", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        fetchAchievements();
        resetForm();
      }
    } catch (e) {
      console.error("Failed to save achievement:", e);
    }
  };

  const handleEdit = (achievement: Achievement) => {
    setEditing(achievement.id);
    setFormData({
      title: achievement.title,
      description: achievement.description || "",
      date: achievement.date || "",
      issuer: achievement.issuer || "",
      proofUrl: achievement.proofUrl || "",
      certificateUrl: achievement.certificateUrl || "",
      order: achievement.order,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this achievement?")) return;
    try {
      await fetch(`/api/admin/achievements?id=${id}`, { method: "DELETE" });
      fetchAchievements();
    } catch (e) {
      console.error("Failed to delete achievement:", e);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({
      title: "",
      description: "",
      date: "",
      issuer: "",
      proofUrl: "",
      certificateUrl: "",
      order: 0,
    });
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
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin">
          <Button variant="outline" size="icon">
            <FaArrowLeft />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-accent">Achievements</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0f1422] rounded-xl p-6 border border-white/5">
          <h2 className="text-xl font-bold text-white mb-4">
            {editing ? "Edit" : "Add"} Achievement
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
            <Input
              placeholder="Date (e.g., March 2024)"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <Input
              placeholder="Issuer/Organization"
              value={formData.issuer}
              onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
            />
            <Input
              placeholder="Proof URL (optional)"
              value={formData.proofUrl}
              onChange={(e) => setFormData({ ...formData, proofUrl: e.target.value })}
            />
            <Input
              placeholder="Certificate URL (optional)"
              value={formData.certificateUrl}
              onChange={(e) => setFormData({ ...formData, certificateUrl: e.target.value })}
            />
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
          <h2 className="text-xl font-bold text-white mb-4">Current Achievements</h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center justify-between p-3 bg-[#0b0f19] rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{achievement.title}</p>
                  {achievement.issuer && (
                    <p className="text-accent text-sm">{achievement.issuer}</p>
                  )}
                  {achievement.date && (
                    <p className="text-white/60 text-xs">{achievement.date}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(achievement)}>
                    <FaEdit className="text-accent" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(achievement.id)}
                  >
                    <FaTrash className="text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            {achievements.length === 0 && (
              <p className="text-white/60">No achievements yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


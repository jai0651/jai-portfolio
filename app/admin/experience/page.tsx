"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowLeft, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";

interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  duration: string;
  description: string | null;
  order: number;
}

export default function ExperiencePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    location: "",
    duration: "",
    description: "",
    order: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
  }, [status, router]);

  useEffect(() => {
    if (session) fetchExperiences();
  }, [session]);

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/experience");
      if (res.ok) {
        const data = await res.json();
        setExperiences(data.experiences);
      }
    } catch (e) {
      console.error("Failed to fetch experiences:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editing ? "PUT" : "POST";
      const body = editing ? { id: editing, ...formData } : formData;

      const res = await fetch("/api/admin/experience", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        fetchExperiences();
        resetForm();
      }
    } catch (e) {
      console.error("Failed to save experience:", e);
    }
  };

  const handleEdit = (exp: Experience) => {
    setEditing(exp.id);
    setFormData({
      company: exp.company,
      position: exp.position,
      location: exp.location,
      duration: exp.duration,
      description: exp.description || "",
      order: exp.order,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this experience?")) return;
    try {
      await fetch(`/api/admin/experience?id=${id}`, { method: "DELETE" });
      fetchExperiences();
    } catch (e) {
      console.error("Failed to delete experience:", e);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({ company: "", position: "", location: "", duration: "", description: "", order: 0 });
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
        <h1 className="text-3xl font-bold text-accent">Experience</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0f1422] rounded-xl p-6 border border-white/5">
          <h2 className="text-xl font-bold text-white mb-4">
            {editing ? "Edit" : "Add"} Experience
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              required
            />
            <Input
              placeholder="Position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              required
            />
            <Input
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
            <Input
              placeholder="Duration (e.g., Jan 2023 - Present)"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              required
            />
            <Textarea
              placeholder="Job Description (key responsibilities, achievements...)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
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
          <h2 className="text-xl font-bold text-white mb-4">Current Experience</h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between p-3 bg-[#0b0f19] rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{exp.position}</p>
                  <p className="text-accent text-sm">{exp.company}</p>
                  <p className="text-white/60 text-xs">{exp.duration}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(exp)}>
                    <FaEdit className="text-accent" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(exp.id)}
                  >
                    <FaTrash className="text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            {experiences.length === 0 && (
              <p className="text-white/60">No experience yet</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}


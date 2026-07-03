"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowLeft, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";

interface Education {
  id: string;
  university: string;
  degree: string;
  major: string;
  duration: string;
  order: number;
}

export default function EducationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    university: "",
    degree: "",
    major: "",
    duration: "",
    order: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
  }, [status, router]);

  useEffect(() => {
    if (session) fetchEducation();
  }, [session]);

  const fetchEducation = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/education");
      if (res.ok) {
        const data = await res.json();
        setEducation(data.education);
      }
    } catch (e) {
      console.error("Failed to fetch education:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editing ? "PUT" : "POST";
      const body = editing ? { id: editing, ...formData } : formData;

      const res = await fetch("/api/admin/education", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        fetchEducation();
        resetForm();
      }
    } catch (e) {
      console.error("Failed to save education:", e);
    }
  };

  const handleEdit = (edu: Education) => {
    setEditing(edu.id);
    setFormData({
      university: edu.university,
      degree: edu.degree,
      major: edu.major,
      duration: edu.duration,
      order: edu.order,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this education?")) return;
    try {
      await fetch(`/api/admin/education?id=${id}`, { method: "DELETE" });
      fetchEducation();
    } catch (e) {
      console.error("Failed to delete education:", e);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({ university: "", degree: "", major: "", duration: "", order: 0 });
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
        <h1 className="text-3xl font-bold text-accent">Education</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0f1422] rounded-xl p-6 border border-white/5">
          <h2 className="text-xl font-bold text-white mb-4">
            {editing ? "Edit" : "Add"} Education
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="University"
              value={formData.university}
              onChange={(e) =>
                setFormData({ ...formData, university: e.target.value })
              }
              required
            />
            <Input
              placeholder="Degree"
              value={formData.degree}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              required
            />
            <Input
              placeholder="Major"
              value={formData.major}
              onChange={(e) => setFormData({ ...formData, major: e.target.value })}
              required
            />
            <Input
              placeholder="Duration (e.g., 2020 - 2024)"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              required
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
          <h2 className="text-xl font-bold text-white mb-4">Current Education</h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {education.map((edu) => (
              <div
                key={edu.id}
                className="flex items-center justify-between p-3 bg-[#0b0f19] rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">
                    {edu.degree} in {edu.major}
                  </p>
                  <p className="text-accent text-sm">{edu.university}</p>
                  <p className="text-white/60 text-xs">{edu.duration}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(edu)}>
                    <FaEdit className="text-accent" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(edu.id)}
                  >
                    <FaTrash className="text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            {education.length === 0 && (
              <p className="text-white/60">No education yet</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}


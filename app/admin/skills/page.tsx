"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowLeft, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";

interface Skill {
  id: string;
  name: string;
  icon: string;
  order: number;
  isActive: boolean;
}

const ICON_OPTIONS = [
  { value: "FaReact", label: "React" },
  { value: "FaJava", label: "Java" },
  { value: "FaJs", label: "JavaScript" },
  { value: "FaNodeJs", label: "Node.js" },
  { value: "FaAws", label: "AWS" },
  { value: "FaDocker", label: "Docker" },
  { value: "FaPython", label: "Python" },
  { value: "FaGitAlt", label: "Git" },
  { value: "FaLinux", label: "Linux" },
  { value: "FaDatabase", label: "Database" },
  { value: "SiNextdotjs", label: "Next.js" },
  { value: "SiSpringboot", label: "Spring Boot" },
  { value: "SiTensorflow", label: "TensorFlow" },
  { value: "SiApachekafka", label: "Apache Kafka" },
  { value: "SiKubernetes", label: "Kubernetes" },
  { value: "SiPostgresql", label: "PostgreSQL" },
  { value: "SiMongodb", label: "MongoDB" },
  { value: "SiTypescript", label: "TypeScript" },
  { value: "SiTailwindcss", label: "Tailwind CSS" },
  { value: "SiPrisma", label: "Prisma" },
  { value: "SiGraphql", label: "GraphQL" },
  { value: "SiRedis", label: "Redis" },
  { value: "SiGooglecloud", label: "Google Cloud" },
  { value: "SiFirebase", label: "Firebase" },
];

export default function SkillsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    icon: "FaReact",
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
  }, [status, router]);

  useEffect(() => {
    if (session) fetchSkills();
  }, [session]);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/skills");
      if (res.ok) {
        const data = await res.json();
        setSkills(data.skills);
      }
    } catch (e) {
      console.error("Failed to fetch skills:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editing ? "PUT" : "POST";
      const body = editing ? { id: editing, ...formData } : formData;

      const res = await fetch("/api/admin/skills", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        fetchSkills();
        resetForm();
      }
    } catch (e) {
      console.error("Failed to save skill:", e);
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditing(skill.id);
    setFormData({
      name: skill.name,
      icon: skill.icon,
      order: skill.order,
      isActive: skill.isActive,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this skill?")) return;
    try {
      await fetch(`/api/admin/skills?id=${id}`, { method: "DELETE" });
      fetchSkills();
    } catch (e) {
      console.error("Failed to delete skill:", e);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({ name: "", icon: "FaReact", order: 0, isActive: true });
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
        <h1 className="text-3xl font-bold text-accent">Skills</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0f1422] rounded-xl p-6 border border-white/5">
          <h2 className="text-xl font-bold text-white mb-4">
            {editing ? "Edit" : "Add"} Skill
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Skill Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <div>
              <label className="block text-white/80 mb-2 text-sm">Icon</label>
              <select
                className="w-full h-10 px-3 rounded-md bg-[#0b0f19] border border-white/10 text-white"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Order"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                }
              />
              <label className="flex items-center gap-2 text-white/80">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                Active
              </label>
            </div>
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
          <h2 className="text-xl font-bold text-white mb-4">Current Skills</h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center justify-between p-3 bg-[#0b0f19] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-accent text-sm font-mono">{skill.icon}</span>
                  <span className="text-white">{skill.name}</span>
                  {!skill.isActive && (
                    <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(skill)}
                  >
                    <FaEdit className="text-accent" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(skill.id)}
                  >
                    <FaTrash className="text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            {skills.length === 0 && (
              <p className="text-white/60">No skills yet</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}




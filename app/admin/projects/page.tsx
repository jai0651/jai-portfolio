"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaUpload,
  FaImage,
} from "react-icons/fa";

interface Project {
  id: string;
  num: string;
  category: string;
  title: string;
  description: string;
  stack: string;
  image: string | null;
  live: string | null;
  github: string | null;
  order: number;
}

interface Media {
  id: string;
  filename: string;
  url: string;
  type: string;
  category: string;
}

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    num: "",
    category: "",
    title: "",
    description: "",
    stack: "",
    image: "",
    live: "",
    github: "",
    order: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchProjects();
      fetchMedia();
    }
  }, [session]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects);
      }
    } catch (e) {
      console.error("Failed to fetch projects:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedia = async () => {
    try {
      const res = await fetch("/api/admin/upload");
      if (res.ok) {
        const data = await res.json();
        setMedia((data.media || []).filter((m: Media) => m.type === "image"));
      }
    } catch (e) {
      console.error("Failed to fetch media:", e);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "projects");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, image: data.url }));
        fetchMedia();
      } else {
        alert("Failed to upload image");
      }
    } catch (e) {
      console.error("Failed to upload image:", e);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editing ? "PUT" : "POST";
      const body = editing ? { id: editing, ...formData } : formData;

      const res = await fetch("/api/admin/projects", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        fetchProjects();
        resetForm();
      }
    } catch (e) {
      console.error("Failed to save project:", e);
    }
  };

  const handleEdit = (project: Project) => {
    setEditing(project.id);
    setFormData({
      num: project.num,
      category: project.category,
      title: project.title,
      description: project.description,
      stack: project.stack,
      image: project.image || "",
      live: project.live || "",
      github: project.github || "",
      order: project.order,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    try {
      await fetch(`/api/admin/projects?id=${id}`, { method: "DELETE" });
      fetchProjects();
    } catch (e) {
      console.error("Failed to delete project:", e);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({
      num: "",
      category: "",
      title: "",
      description: "",
      stack: "",
      image: "",
      live: "",
      github: "",
      order: 0,
    });
  };

  const selectMediaImage = (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }));
    setShowMediaPicker(false);
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
        <h1 className="text-3xl font-bold text-accent">Projects</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#27272c] rounded-xl p-6 border border-white/5">
          <h2 className="text-xl font-bold text-white mb-4">
            {editing ? "Edit" : "Add"} Project
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Number (01)"
                value={formData.num}
                onChange={(e) => setFormData({ ...formData, num: e.target.value })}
                required
              />
              <Input
                placeholder="Category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
              />
            </div>
            <Input
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
            <Input
              placeholder="Stack (comma-separated: React, Node.js)"
              value={formData.stack}
              onChange={(e) => setFormData({ ...formData, stack: e.target.value })}
              required
            />

            <div className="space-y-2">
              <label className="text-white/80 text-sm">Project Image</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Image URL"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="flex-1"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  className="hidden"
                  id="project-image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <FaUpload className="mr-2" />
                  {uploading ? "..." : "Upload"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMediaPicker(!showMediaPicker)}
                >
                  <FaImage />
                </Button>
              </div>

              {formData.image && (
                <div className="mt-2 relative w-32 h-20 rounded-lg overflow-hidden bg-[#1e1e21]">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: "" })}
                    className="absolute top-1 right-1 bg-red-500/80 rounded-full p-1 hover:bg-red-500"
                  >
                    <FaTimes className="text-white text-xs" />
                  </button>
                </div>
              )}

              {showMediaPicker && (
                <div className="mt-2 bg-[#1e1e21] rounded-lg p-4 max-h-48 overflow-y-auto">
                  <p className="text-white/60 text-xs mb-2">Select from media library:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {media.map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => selectMediaImage(m.url)}
                        className="aspect-square rounded overflow-hidden hover:ring-2 ring-accent"
                      >
                        <img
                          src={m.url}
                          alt={m.filename}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                    {media.length === 0 && (
                      <p className="col-span-4 text-white/40 text-xs text-center py-4">
                        No images in library
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Live URL"
                value={formData.live}
                onChange={(e) => setFormData({ ...formData, live: e.target.value })}
              />
              <Input
                placeholder="GitHub URL"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              />
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

        <div className="bg-[#27272c] rounded-xl p-6 border border-white/5">
          <h2 className="text-xl font-bold text-white mb-4">Current Projects</h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 bg-[#1e1e21] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {project.image && (
                    <div className="w-12 h-12 rounded overflow-hidden bg-[#18181b] flex-shrink-0">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <span className="text-accent mr-2">{project.num}</span>
                    <span className="text-white">{project.title}</span>
                    <p className="text-white/60 text-xs">{project.category}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(project)}
                  >
                    <FaEdit className="text-accent" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(project.id)}
                  >
                    <FaTrash className="text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="text-white/60">No projects yet</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

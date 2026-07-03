"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaUpload,
  FaTrash,
  FaImage,
  FaFileAlt,
  FaCopy,
  FaCheck,
  FaFilter,
} from "react-icons/fa";

interface Media {
  id: string;
  filename: string;
  url: string;
  blobUrl: string;
  type: string;
  category: string;
  size: number;
  createdAt: string;
}

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "projects", label: "Projects" },
  { value: "profile", label: "Profile" },
  { value: "resume", label: "Resume" },
  { value: "icons", label: "Icons" },
];

export default function MediaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [filterCategory, setFilterCategory] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
  }, [status, router]);

  useEffect(() => {
    if (session) fetchMedia();
  }, [session]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/upload");
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media || []);
      }
    } catch (e) {
      console.error("Failed to fetch media:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", selectedCategory);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          alert(`Failed to upload ${file.name}`);
        }
      }
      fetchMedia();
    } catch (e) {
      console.error("Failed to upload files:", e);
      alert("Failed to upload files");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this file? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/upload?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchMedia();
      }
    } catch (e) {
      console.error("Failed to delete file:", e);
    }
  };

  const copyToClipboard = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredMedia =
    filterCategory === "all"
      ? media
      : media.filter((m) => m.category === filterCategory);

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
        <h1 className="text-3xl font-bold text-accent">Media Library</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#0f1422] rounded-xl p-6 border border-white/5">
          <h2 className="text-xl font-bold text-white mb-4">Upload Files</h2>
          <p className="text-white/60 mb-4 text-sm">
            Upload images or PDFs. Files are stored in Vercel Blob storage.
          </p>

          <div className="mb-4">
            <label className="text-white/80 text-sm mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedCategory === cat.value
                      ? "bg-accent text-primary"
                      : "bg-[#0b0f19] text-white/60 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleUpload}
            ref={fileInputRef}
            className="hidden"
            id="media-upload"
            multiple
          />

          <label htmlFor="media-upload" className="block">
            <div
              className={`border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-accent/50 transition-colors ${
                uploading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <FaUpload className="text-accent text-3xl mx-auto mb-3" />
              <p className="text-white/80">
                {uploading ? "Uploading..." : "Click or drag files here"}
              </p>
              <p className="text-white/40 text-xs mt-1">
                Images (PNG, JPG, WebP) or PDFs
              </p>
            </div>
          </label>
        </div>

        <div className="lg:col-span-2 bg-[#0f1422] rounded-xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">All Media</h2>
            <div className="flex items-center gap-2">
              <FaFilter className="text-white/40" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-[#0b0f19] text-white/80 rounded-lg px-3 py-1.5 text-sm border border-white/10"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
            {filteredMedia.length > 0 ? (
              filteredMedia.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#0b0f19] rounded-lg overflow-hidden group relative"
                >
                  <div className="aspect-square relative bg-[#18181b] flex items-center justify-center">
                    {item.type === "image" ? (
                      <img
                        src={item.url}
                        alt={item.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaFileAlt className="text-accent text-4xl" />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="bg-white/10 hover:bg-white/20"
                        onClick={() => copyToClipboard(item.url, item.id)}
                      >
                        {copiedId === item.id ? (
                          <FaCheck className="text-green-400" />
                        ) : (
                          <FaCopy className="text-white" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="bg-white/10 hover:bg-red-500/50"
                        onClick={() => handleDelete(item.id)}
                      >
                        <FaTrash className="text-red-400" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-white/80 text-xs truncate" title={item.filename}>
                      {item.filename}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-white/40 text-xs">
                        {formatSize(item.size)}
                      </span>
                      <span className="text-accent/60 text-xs capitalize">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <FaImage className="text-white/20 text-5xl mx-auto mb-3" />
                <p className="text-white/60">No media files uploaded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

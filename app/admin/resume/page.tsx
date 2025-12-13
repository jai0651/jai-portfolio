"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaArrowLeft, FaUpload, FaTrash, FaFileAlt, FaDownload } from "react-icons/fa";

interface Resume {
  id: string;
  filename: string;
  url: string;
  createdAt: string;
  isActive: boolean;
}

export default function ResumePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [activeResume, setActiveResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
  }, [status, router]);

  useEffect(() => {
    if (session) fetchResumes();
  }, [session]);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/resume");
      if (res.ok) {
        const data = await res.json();
        if (data.resume) {
          setActiveResume(data.resume);
        }
      }
      // Fetch all resumes for history
      const allRes = await fetch("/api/admin/resume/all");
      if (allRes.ok) {
        const data = await allRes.json();
        setResumes(data.resumes || []);
      }
    } catch (e) {
      console.error("Failed to fetch resumes:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".pdf")) {
      alert("Please upload a PDF file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/resume", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        fetchResumes();
      } else {
        alert("Failed to upload resume");
      }
    } catch (e) {
      console.error("Failed to upload resume:", e);
      alert("Failed to upload resume");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resume?")) return;
    try {
      const res = await fetch(`/api/admin/resume?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchResumes();
      }
    } catch (e) {
      console.error("Failed to delete resume:", e);
    }
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
        <h1 className="text-3xl font-bold text-accent">Resume Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#27272c] rounded-xl p-6 border border-white/5">
          <h2 className="text-xl font-bold text-white mb-4">Upload New Resume</h2>
          <p className="text-white/60 mb-4">
            Upload a new PDF resume. This will replace the current active resume used on the homepage download button.
          </p>
          
          <input
            type="file"
            accept=".pdf"
            onChange={handleUpload}
            ref={fileInputRef}
            className="hidden"
            id="resume-upload"
          />
          
          <label htmlFor="resume-upload">
            <Button
              asChild
              className="flex items-center gap-2 cursor-pointer"
              disabled={uploading}
            >
              <span>
                <FaUpload />
                {uploading ? "Uploading..." : "Upload PDF Resume"}
              </span>
            </Button>
          </label>

          {activeResume && (
            <div className="mt-6 p-4 bg-[#1e1e21] rounded-lg">
              <h3 className="text-white font-medium mb-2">Current Active Resume</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaFileAlt className="text-accent text-2xl" />
                  <div>
                    <p className="text-white">{activeResume.filename}</p>
                    <p className="text-white/40 text-xs">
                      Uploaded: {new Date(activeResume.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={activeResume.url} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="ghost">
                      <FaDownload className="text-accent" />
                    </Button>
                  </a>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(activeResume.id)}
                  >
                    <FaTrash className="text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#27272c] rounded-xl p-6 border border-white/5">
          <h2 className="text-xl font-bold text-white mb-4">Resume History</h2>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {resumes.length > 0 ? (
              resumes.map((resume) => (
                <div
                  key={resume.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    resume.isActive ? "bg-accent/10 border border-accent/20" : "bg-[#1e1e21]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FaFileAlt className={resume.isActive ? "text-accent" : "text-white/60"} />
                    <div>
                      <p className="text-white text-sm">{resume.filename}</p>
                      <p className="text-white/40 text-xs">
                        {new Date(resume.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {resume.isActive && (
                    <span className="text-accent text-xs bg-accent/20 px-2 py-1 rounded">
                      Active
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-white/60">No resumes uploaded yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


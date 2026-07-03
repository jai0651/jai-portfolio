"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowLeft, FaSave, FaUpload, FaUser } from "react-icons/fa";

interface Media {
  id: string;
  filename: string;
  url: string;
  type: string;
  category: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [media, setMedia] = useState<Media[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileData, setProfileData] = useState({
    profile_name: "",
    profile_title: "",
    profile_description: "",
    profile_email: "",
    profile_photo: "",
    about_title: "",
    about_description: "",
    about_freelance: "",
    about_languages: "",
    about_experience: "",
    stats_years: "",
    stats_projects: "",
    stats_technologies: "",
    stats_commits: "",
    cv_url: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchSettings();
      fetchMedia();
    }
  }, [session]);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setProfileData((prev) => ({ ...prev, ...data.settings }));
      }
    } catch (e) {
      console.error("Failed to fetch settings:", e);
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a PNG or WebP image. PNG with transparent background is recommended for best results.");
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "profile");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setProfileData((prev) => ({ ...prev, profile_photo: data.url }));
        fetchMedia();
      } else {
        alert("Failed to upload photo");
      }
    } catch (e) {
      console.error("Failed to upload photo:", e);
      alert("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) {
        photoInputRef.current.value = "";
      }
    }
  };

  const selectMediaImage = (url: string) => {
    setProfileData((prev) => ({ ...prev, profile_photo: url }));
    setShowMediaPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords don't match" });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Password updated successfully" });
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to update password" });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage({ type: "", text: "" });
    setSavingProfile(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (res.ok) {
        setProfileMessage({ type: "success", text: "Settings saved successfully" });
      } else {
        setProfileMessage({ type: "error", text: "Failed to save settings" });
      }
    } catch {
      setProfileMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setSavingProfile(false);
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
        <h1 className="text-3xl font-bold text-accent">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-[#0f1422] rounded-xl p-6 border border-white/5">
            <h2 className="text-xl font-bold text-white mb-6">Profile Photo</h2>
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-accent bg-primary flex items-center justify-center">
                  {profileData.profile_photo ? (
                    <img
                      src={profileData.profile_photo}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUser className="text-white/40 text-4xl" />
                  )}
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                  <p className="text-accent text-sm font-medium mb-2">📸 Photo Requirements:</p>
                  <ul className="text-white/60 text-xs space-y-1">
                    <li>• <strong>PNG with transparent background</strong> (recommended)</li>
                    <li>• Square aspect ratio (1:1) works best</li>
                    <li>• Minimum 500x500px for quality</li>
                    <li>• Face centered and clearly visible</li>
                    <li>• Professional headshot or upper body</li>
                  </ul>
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="file"
                    accept=".png,.webp"
                    onChange={handlePhotoUpload}
                    ref={photoInputRef}
                    className="hidden"
                    id="profile-photo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploadingPhoto}
                  >
                    <FaUpload className="mr-2" />
                    {uploadingPhoto ? "Uploading..." : "Upload PNG/WebP"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMediaPicker(!showMediaPicker)}
                  >
                    Select from Library
                  </Button>
                </div>

                {showMediaPicker && (
                  <div className="bg-[#0b0f19] rounded-lg p-4 max-h-48 overflow-y-auto">
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

                <Input
                  placeholder="Or paste image URL"
                  value={profileData.profile_photo}
                  onChange={(e) =>
                    setProfileData({ ...profileData, profile_photo: e.target.value })
                  }
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#0f1422] rounded-xl p-6 border border-white/5">
            <h2 className="text-xl font-bold text-white mb-6">Profile Info</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2 text-sm">Name</label>
                <Input
                  value={profileData.profile_name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, profile_name: e.target.value })
                  }
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2 text-sm">Title</label>
                <Input
                  value={profileData.profile_title}
                  onChange={(e) =>
                    setProfileData({ ...profileData, profile_title: e.target.value })
                  }
                  placeholder="Software Developer"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2 text-sm">Description</label>
                <Textarea
                  value={profileData.profile_description}
                  onChange={(e) =>
                    setProfileData({ ...profileData, profile_description: e.target.value })
                  }
                  placeholder="I am a passionate full-stack developer..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2 text-sm">Email</label>
                <Input
                  value={profileData.profile_email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, profile_email: e.target.value })
                  }
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2 text-sm">CV Download URL</label>
                <Input
                  value={profileData.cv_url}
                  onChange={(e) =>
                    setProfileData({ ...profileData, cv_url: e.target.value })
                  }
                  placeholder="Leave empty to use latest uploaded resume"
                />
                <p className="text-white/40 text-xs mt-1">
                  Leave empty to automatically use the active resume from Resume Management
                </p>
              </div>

              <hr className="border-white/10 my-4" />

              <h3 className="text-lg font-semibold text-white">About Section</h3>
              <div>
                <label className="block text-white/80 mb-2 text-sm">About Title</label>
                <Input
                  value={profileData.about_title}
                  onChange={(e) =>
                    setProfileData({ ...profileData, about_title: e.target.value })
                  }
                  placeholder="About me"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2 text-sm">About Description</label>
                <Textarea
                  value={profileData.about_description}
                  onChange={(e) =>
                    setProfileData({ ...profileData, about_description: e.target.value })
                  }
                  placeholder="Results-driven Software Engineer..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 mb-2 text-sm">Freelance Status</label>
                  <Input
                    value={profileData.about_freelance}
                    onChange={(e) =>
                      setProfileData({ ...profileData, about_freelance: e.target.value })
                    }
                    placeholder="Available"
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-2 text-sm">Languages</label>
                  <Input
                    value={profileData.about_languages}
                    onChange={(e) =>
                      setProfileData({ ...profileData, about_languages: e.target.value })
                    }
                    placeholder="English, Hindi"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/80 mb-2 text-sm">Experience</label>
                <Input
                  value={profileData.about_experience}
                  onChange={(e) =>
                    setProfileData({ ...profileData, about_experience: e.target.value })
                  }
                  placeholder="1+ years"
                />
              </div>

              <hr className="border-white/10 my-4" />

              <h3 className="text-lg font-semibold text-white">Stats Section</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 mb-2 text-sm">Years of Experience</label>
                  <Input
                    type="number"
                    value={profileData.stats_years}
                    onChange={(e) =>
                      setProfileData({ ...profileData, stats_years: e.target.value })
                    }
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-2 text-sm">Projects Completed</label>
                  <Input
                    type="number"
                    value={profileData.stats_projects}
                    onChange={(e) =>
                      setProfileData({ ...profileData, stats_projects: e.target.value })
                    }
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-2 text-sm">Technologies Mastered</label>
                  <Input
                    type="number"
                    value={profileData.stats_technologies}
                    onChange={(e) =>
                      setProfileData({ ...profileData, stats_technologies: e.target.value })
                    }
                    placeholder="8"
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-2 text-sm">Code Commits</label>
                  <Input
                    type="number"
                    value={profileData.stats_commits}
                    onChange={(e) =>
                      setProfileData({ ...profileData, stats_commits: e.target.value })
                    }
                    placeholder="200"
                  />
                </div>
              </div>

              {profileMessage.text && (
                <p
                  className={`text-sm p-3 rounded-lg ${
                    profileMessage.type === "error"
                      ? "text-red-500 bg-red-500/10"
                      : "text-green-500 bg-green-500/10"
                  }`}
                >
                  {profileMessage.text}
                </p>
              )}

              <Button
                type="submit"
                disabled={savingProfile}
                className="flex items-center gap-2"
              >
                <FaSave />
                {savingProfile ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          </div>
        </div>

        <div>
          <div className="bg-[#0f1422] rounded-xl p-6 border border-white/5">
            <h2 className="text-xl font-bold text-white mb-6">Change Password</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2 text-sm">
                  Current Password
                </label>
                <Input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, currentPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 text-sm">
                  New Password
                </label>
                <Input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 text-sm">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  required
                />
              </div>

              {message.text && (
                <p
                  className={`text-sm p-3 rounded-lg ${
                    message.type === "error"
                      ? "text-red-500 bg-red-500/10"
                      : "text-green-500 bg-green-500/10"
                  }`}
                >
                  {message.text}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <FaSave />
                {loading ? "Saving..." : "Update Password"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

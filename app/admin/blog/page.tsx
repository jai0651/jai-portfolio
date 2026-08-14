"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaUpload,
  FaTrash,
  FaEye,
  FaHeart,
  FaExternalLinkAlt,
  FaFileCode,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminPost {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  tags: string;
  readingMinutes: number;
  published: boolean;
  publishedAt: string | null;
  views: number;
  likes: number;
  sourceName: string | null;
  updatedAt: string;
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/blog");
      if (res.ok) setPosts((await res.json()).posts);
    } catch {
      setNotice({ ok: false, text: "Could not load posts." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const upload = async (file: File) => {
    setUploading(true);
    setNotice(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/blog", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      setNotice({
        ok: true,
        text: data.replaced
          ? `Updated “${data.post.title}” — metrics kept.`
          : `Published “${data.post.title}” at /blog/${data.post.slug}`,
      });
      await load();
    } catch (e) {
      setNotice({ ok: false, text: e instanceof Error ? e.message : "Upload failed" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  const togglePublish = async (post: AdminPost) => {
    setPosts((p) =>
      p.map((x) => (x.id === post.id ? { ...x, published: !x.published } : x))
    );
    try {
      await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id, published: !post.published }),
      });
    } finally {
      load();
    }
  };

  const remove = async (post: AdminPost) => {
    if (!confirm(`Delete “${post.title}”? This also removes its likes.`)) return;
    await fetch(`/api/admin/blog?id=${post.id}`, { method: "DELETE" });
    load();
  };

  const totals = posts.reduce(
    (a, p) => ({ views: a.views + p.views, likes: a.likes + p.likes }),
    { views: 0, likes: 0 }
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Blog</h1>
        <p className="mt-1 text-sm text-white/60">
          Drop a self-contained <code className="text-accent">.html</code> file and it
          publishes. Metadata is read from <code className="text-accent">&lt;title&gt;</code>{" "}
          and <code className="text-accent">&lt;meta&gt;</code>; the body is taken from{" "}
          <code className="text-accent">&lt;main&gt;</code> if present.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          dragging ? "border-accent bg-accent/5" : "border-line bg-surface/50"
        }`}
      >
        <FaFileCode className="mx-auto text-3xl text-faint" />
        <p className="mt-3 font-mono text-sm text-ink">
          {uploading ? "Parsing and publishing…" : "Drop an .html file here"}
        </p>
        <p className="mt-1 text-xs text-white/50">
          Re-uploading the same post updates it and keeps its views and likes.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".html,.htm,text/html"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
          }}
        />
        <Button
          className="mt-5"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <FaUpload /> {uploading ? "uploading…" : "choose file"}
        </Button>
      </div>

      {notice && (
        <p
          className={`rounded-md border p-3 font-mono text-sm ${
            notice.ok
              ? "border-accent/30 bg-accent/10 text-accent"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {notice.ok ? "✓" : "✗"} {notice.text}
        </p>
      )}

      {/* Totals */}
      {posts.length > 0 && (
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line">
          {[
            { k: "posts", v: posts.length },
            { k: "total views", v: totals.views },
            { k: "total likes", v: totals.likes },
          ].map((s) => (
            <div key={s.k} className="bg-surface p-4">
              <p className="tnum font-mono text-2xl font-semibold text-accent">{s.v}</p>
              <p className="mt-0.5 text-xs text-white/50">{s.k}</p>
            </div>
          ))}
        </div>
      )}

      {/* Posts */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="font-mono text-sm text-white/50">No posts yet.</p>
      ) : (
        <ul className="space-y-3">
          {posts
            .slice()
            .sort((a, b) => b.likes - a.likes || b.views - a.views)
            .map((post) => (
              <li
                key={post.id}
                className="flex flex-col gap-4 rounded-lg border border-line bg-surface/70 p-5 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[15px] font-semibold text-ink">
                      {post.title}
                    </span>
                    <span
                      className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                        post.published
                          ? "border-accent/40 bg-accent/10 text-accent"
                          : "border-line bg-surface-2 text-faint"
                      }`}
                    >
                      {post.published ? "live" : "draft"}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-faint">/blog/{post.slug}</p>
                  {post.sourceName && (
                    <p className="mt-0.5 font-mono text-[11px] text-white/40">
                      from {post.sourceName} · {post.readingMinutes} min read
                    </p>
                  )}
                </div>

                <div className="tnum flex items-center gap-4 font-mono text-sm text-muted">
                  <span className="flex items-center gap-1.5" title="views">
                    <FaEye className="text-faint" /> {post.views}
                  </span>
                  <span className="flex items-center gap-1.5" title="likes">
                    <FaHeart className={post.likes > 0 ? "text-accent" : "text-faint"} />{" "}
                    {post.likes}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => togglePublish(post)}>
                    {post.published ? "unpublish" : "publish"}
                  </Button>
                  <Button asChild variant="ghost" size="icon" title="View post">
                    <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
                      <FaExternalLinkAlt />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete"
                    onClick={() => remove(post)}
                    className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <FaTrash />
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

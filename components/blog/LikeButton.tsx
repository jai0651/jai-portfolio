"use client";

import { useEffect, useState } from "react";
import { FiHeart } from "react-icons/fi";

/**
 * Optimistic like toggle. The server dedupes by a salted hash of ip +
 * user-agent, so there's no sign-in and nothing identifying is stored — a
 * reader gets one like per post and can take it back.
 */
const LikeButton = ({ slug, initialLikes }: { slug: string; initialLikes: number }) => {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/blog/${slug}/like`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setLikes(d.likes);
        setLiked(d.liked);
      })
      .catch(() => {});
  }, [slug]);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);

    // Optimistic — reverted if the request fails.
    const prev = { likes, liked };
    setLiked(!liked);
    setLikes(likes + (liked ? -1 : 1));

    try {
      const res = await fetch(`/api/blog/${slug}/like`, { method: "POST" });
      if (!res.ok) throw new Error();
      const d = await res.json();
      setLikes(d.likes);
      setLiked(d.liked);
    } catch {
      setLikes(prev.likes);
      setLiked(prev.liked);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-pressed={liked}
      aria-label={liked ? "Remove your like" : "Like this post"}
      className={`group inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 font-mono text-sm shadow-e1 transition-all duration-200 ease-out-quint hover:-translate-y-px disabled:opacity-60 ${
        liked
          ? "border-accent/50 bg-accent/10 text-accent"
          : "border-line bg-surface-2/60 text-muted hover:border-accent/50 hover:text-accent"
      }`}
    >
      <FiHeart
        className={`transition-transform duration-200 group-hover:scale-110 ${
          liked ? "fill-current" : ""
        }`}
      />
      <span className="tnum">{likes}</span>
      <span className="text-faint">{likes === 1 ? "like" : "likes"}</span>
    </button>
  );
};

export default LikeButton;

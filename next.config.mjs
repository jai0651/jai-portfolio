/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "*.blob.vercel-storage.com" },
    ],
  },

  /*
   * Posts renamed when their titles were rewritten to say what they are about.
   * Permanent redirects so any link that already exists keeps working and the
   * ranking signal follows the post to its new URL.
   */
  async redirects() {
    const moved = {
      "voice-agent-recognition-path": "speech-recognition-from-scratch",
      "voice-agent-synthesis-path": "how-text-to-speech-works",
      "bugs-that-do-not-raise-exceptions": "video-search-from-scratch",
      "two-seconds-a-turn-on-one-laptop": "local-ai-assistant-from-scratch",
    };
    return Object.entries(moved).map(([from, to]) => ({
      source: `/blog/${from}`,
      destination: `/blog/${to}`,
      permanent: true,
    }));
  },
};

export default nextConfig;

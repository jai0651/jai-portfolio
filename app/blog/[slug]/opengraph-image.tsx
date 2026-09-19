import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Post on jaishankar.dev";

/*
 * A link with no preview image gets a smaller card everywhere it is shared,
 * so each post renders one from its own title and tags. Built with the site's
 * palette rather than a stock photograph, since the posts are about systems.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          background: "#0b0f17", padding: "72px 80px", position: "relative",
          fontFamily: "monospace",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 12, background: "#f0b429" }} />
        <div style={{ display: "flex", color: "#d99e2b", fontSize: 26, letterSpacing: 6 }}>
          JAISHANKAR.DEV
        </div>
        <div
          style={{
            display: "flex", flex: 1, alignItems: "center", color: "#dde3ec",
            fontSize: post && post.title.length > 46 ? 62 : 76,
            fontWeight: 700, lineHeight: 1.15, letterSpacing: -1,
          }}
        >
          {post?.title ?? "Jai Shankar"}
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", color: "#76818f", fontSize: 26 }}>
          {(post?.tags ?? []).slice(0, 4).map((t) => (
            <div key={t} style={{ display: "flex", border: "2px solid #212a39", borderRadius: 8, padding: "6px 16px" }}>
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}

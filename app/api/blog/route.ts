import { NextResponse } from "next/server";
import { getPublishedPosts, type SortMode } from "@/lib/blog";

// Public listing, used by the terminal's `blog` command and anything else that
// needs posts client-side. Short revalidate keeps it near-live but cheap.
export const revalidate = 30;

export async function GET(req: Request) {
  try {
    const sort = new URL(req.url).searchParams.get("sort");
    const mode: SortMode = sort === "popular" ? "popular" : "recent";
    const posts = await getPublishedPosts(mode);
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [] }, { status: 200 });
  }
}

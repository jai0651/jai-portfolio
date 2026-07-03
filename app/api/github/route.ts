import { NextResponse } from "next/server";
import { getGithubData } from "@/lib/github";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await getGithubData();
    if (!data) {
      return NextResponse.json(
        { error: "GitHub account not configured or unavailable." },
        { status: 404 }
      );
    }
    return NextResponse.json(data, {
      headers: {
        // Cached at the edge/browser; the lib also caches for 1h server-side.
        "Cache-Control":
          "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load GitHub data." },
      { status: 500 }
    );
  }
}

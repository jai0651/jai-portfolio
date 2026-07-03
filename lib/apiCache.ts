import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * JSON response helper for public, read-only portfolio content.
 *
 * - Anonymous visitors get a cacheable response: browsers cache it for
 *   `max-age` seconds (so navigating between pages that fetch the same data —
 *   settings, social, skills… — is instant) and CDNs serve stale-while-revalidate.
 * - Logged-in admins get `no-store`, so the CMS always reflects edits immediately.
 */
const PUBLIC_CACHE =
  "public, max-age=20, s-maxage=60, stale-while-revalidate=300";

export async function cachedJson(data: unknown) {
  let hasSession = false;
  try {
    const cookieStore = await cookies();
    hasSession = cookieStore
      .getAll()
      .some((c) => c.name.includes("next-auth.session-token") && c.value);
  } catch {
    // cookies() unavailable in some contexts — default to public cache
  }

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": hasSession ? "no-store" : PUBLIC_CACHE,
    },
  });
}

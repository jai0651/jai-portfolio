import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Fire-and-forget view counter, called once per mount from the client.
 *
 * Deliberately not deduped: a view is a weak signal and the point is relative
 * popularity, not analytics accuracy. Likes are the deduped metric.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await prisma.blogPost.updateMany({
      where: { slug, published: true },
      data: { views: { increment: 1 } },
    });
    return NextResponse.json({ ok: true });
  } catch {
    // Never let a metric failure surface to a reader.
    return NextResponse.json({ ok: false });
  }
}

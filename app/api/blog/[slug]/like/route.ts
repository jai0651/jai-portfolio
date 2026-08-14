import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { visitorIdFrom } from "@/lib/blog";

function visitorFor(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  return visitorIdFrom(ip, req.headers.get("user-agent") ?? "");
}

/** Current like count, and whether this reader has already liked. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, likes: true, published: true },
    });
    if (!post?.published) {
      return NextResponse.json({ likes: 0, liked: false });
    }
    const mine = await prisma.blogLike.findUnique({
      where: { postId_visitorId: { postId: post.id, visitorId: visitorFor(req) } },
      select: { id: true },
    });
    return NextResponse.json({ likes: post.likes, liked: !!mine });
  } catch {
    return NextResponse.json({ likes: 0, liked: false });
  }
}

/**
 * Toggle this reader's like.
 *
 * The BlogLike row is the truth; BlogPost.likes is a denormalized counter kept
 * in step inside the same transaction so the index can sort by popularity
 * without a join.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const visitorId = visitorFor(req);

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, published: true },
    });
    if (!post?.published) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const existing = await prisma.blogLike.findUnique({
      where: { postId_visitorId: { postId: post.id, visitorId } },
      select: { id: true },
    });

    const [, updated] = existing
      ? await prisma.$transaction([
          prisma.blogLike.delete({ where: { id: existing.id } }),
          prisma.blogPost.update({
            where: { id: post.id },
            data: { likes: { decrement: 1 } },
            select: { likes: true },
          }),
        ])
      : await prisma.$transaction([
          prisma.blogLike.create({ data: { postId: post.id, visitorId } }),
          prisma.blogPost.update({
            where: { id: post.id },
            data: { likes: { increment: 1 } },
            select: { likes: true },
          }),
        ]);

    return NextResponse.json({
      likes: Math.max(0, updated.likes),
      liked: !existing,
    });
  } catch {
    return NextResponse.json({ message: "Failed to record like" }, { status: 500 });
  }
}

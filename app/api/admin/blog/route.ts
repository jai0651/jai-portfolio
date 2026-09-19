import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { parseBlogHtml, slugify } from "@/lib/blogHtml";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB — a text doc, generously

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return !!session && (session.user as { role?: string }).role === "admin";
}

/*
 * The blog pages are cached for an hour, so a write has to say so explicitly.
 * Without this, publishing a post would appear to do nothing for up to that
 * long, which is exactly the trap a long revalidate window sets.
 */
function refreshBlogCache(slug?: string) {
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
  // The discovery surface is derived from the same posts, so it goes stale in
  // exactly the same moment. A sitemap that lags a publish by an hour is a
  // crawl budget spent on a 404.
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
  revalidatePath("/llms.txt");
}

/** Admin listing — includes drafts and metrics. */
export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const posts = await prisma.blogPost.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        tags: true,
        readingMinutes: true,
        published: true,
        publishedAt: true,
        views: true,
        likes: true,
        sourceName: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ message: "Failed to fetch posts" }, { status: 500 });
  }
}

/**
 * Upload a .html file and create (or replace) the post it describes.
 *
 * Re-uploading the same slug updates the existing post in place and keeps its
 * view and like counts — so fixing a typo in a doc and re-uploading doesn't
 * reset the metrics.
 */
export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    const isHtml =
      file.type === "text/html" ||
      file.type === "" ||
      /\.html?$/i.test(file.name);
    if (!isHtml) {
      return NextResponse.json(
        { message: "Only .html files are accepted" },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { message: `File is larger than ${MAX_BYTES / 1024 / 1024} MB` },
        { status: 400 }
      );
    }

    const raw = await file.text();
    const parsed = parseBlogHtml(raw);
    if (!parsed.html) {
      return NextResponse.json(
        { message: "No readable content found in that file" },
        { status: 400 }
      );
    }

    /*
     * Slug precedence: explicit > filename > title. Filenames are chosen
     * deliberately and stay short ("tonecall-inter-agent-voice-handshake"),
     * whereas titles are prose and would produce URLs like
     * "two-ai-agents-on-a-phone-call-should-stop-talking".
     */
    const requested = (form.get("slug") as string) || "";
    const slug = slugify(requested || file.name || parsed.title);
    const publish = form.get("published") !== "false";

    // Keep the raw upload so a post can be re-parsed if the pipeline changes.
    let sourceUrl: string | null = null;
    try {
      const blob = await put(`blog/${slug}.html`, raw, {
        access: "public",
        contentType: "text/html",
        addRandomSuffix: true,
      });
      sourceUrl = blob.url;
    } catch {
      // Blob is a convenience, not a requirement — the post still publishes.
    }

    const data = {
      title: parsed.title,
      summary: parsed.summary || null,
      html: parsed.html,
      tags: parsed.tags.join(", "),
      readingMinutes: parsed.readingMinutes,
      sourceName: file.name,
      ...(sourceUrl ? { sourceUrl } : {}),
    };

    const existing = await prisma.blogPost.findUnique({ where: { slug } });

    const post = existing
      ? await prisma.blogPost.update({
          where: { slug },
          data: {
            ...data,
            published: publish,
            // Set publishedAt the first time it goes live, then leave it.
            publishedAt:
              publish && !existing.publishedAt
                ? parsed.date
                  ? new Date(`${parsed.date}T00:00:00Z`)
                  : new Date()
                : existing.publishedAt,
          },
        })
      : await prisma.blogPost.create({
          data: {
            ...data,
            slug,
            published: publish,
            publishedAt: publish
              ? parsed.date
                ? new Date(`${parsed.date}T00:00:00Z`)
                : new Date()
              : null,
          },
        });

    refreshBlogCache(slug);
    return NextResponse.json({ post, replaced: !!existing });
  } catch (error) {
    console.error("Failed to upload post:", error);
    return NextResponse.json({ message: "Failed to upload post" }, { status: 500 });
  }
}

/** Edit metadata or toggle publish. */
export async function PUT(req: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id, title, summary, tags, published, slug } = await req.json();
    if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(summary !== undefined ? { summary } : {}),
        ...(tags !== undefined ? { tags } : {}),
        ...(slug !== undefined ? { slug: slugify(slug) } : {}),
        ...(published !== undefined
          ? {
              published,
              publishedAt:
                published && !existing.publishedAt ? new Date() : existing.publishedAt,
            }
          : {}),
      },
    });
    refreshBlogCache(post.slug);
    if (post.slug !== existing.slug) refreshBlogCache(existing.slug);
    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ message: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (post?.sourceUrl) {
      try {
        await del(post.sourceUrl);
      } catch {
        // Blob may already be gone; the row still goes.
      }
    }
    // BlogLike rows cascade via the relation.
    await prisma.blogPost.delete({ where: { id } });
    refreshBlogCache(post?.slug);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Failed to delete post" }, { status: 500 });
  }
}

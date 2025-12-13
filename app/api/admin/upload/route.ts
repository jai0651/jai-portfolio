import { NextRequest, NextResponse } from "next/server";
import { put, del, list } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const media = await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ media });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "general";

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    const isImage = file.type.startsWith("image/");
    const isPDF = file.type === "application/pdf";

    if (!isImage && !isPDF) {
      return NextResponse.json(
        { message: "Only images and PDFs are allowed" },
        { status: 400 }
      );
    }

    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });

    const media = await prisma.media.create({
      data: {
        filename: file.name,
        url: blob.url,
        blobUrl: blob.url,
        type: isPDF ? "pdf" : "image",
        category,
        size: file.size,
      },
    });

    return NextResponse.json({ media, url: blob.url });
  } catch (error) {
    console.error("Failed to upload file:", error);
    return NextResponse.json(
      { message: "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ID required" }, { status: 400 });
    }

    const media = await prisma.media.findUnique({ where: { id } });
    if (media) {
      try {
        await del(media.blobUrl);
      } catch {
        // Blob might not exist, continue
      }
      await prisma.media.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { message: "Failed to delete media" },
      { status: 500 }
    );
  }
}

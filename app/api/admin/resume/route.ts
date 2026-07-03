import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cachedJson } from "@/lib/apiCache";

export async function GET() {
  try {
    const resume = await prisma.resume.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return cachedJson({ resume });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch resume" },
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

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.endsWith(".pdf")) {
      return NextResponse.json({ message: "Only PDF files are allowed" }, { status: 400 });
    }

    const blob = await put(`resume/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    await prisma.resume.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    const resume = await prisma.resume.create({
      data: {
        filename: file.name,
        url: blob.url,
        blobUrl: blob.url,
        isActive: true,
      },
    });

    return NextResponse.json({ resume });
  } catch (error) {
    console.error("Failed to upload resume:", error);
    return NextResponse.json(
      { message: "Failed to upload resume" },
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

    const resume = await prisma.resume.findUnique({ where: { id } });
    if (resume) {
      if (resume.blobUrl) {
        try {
          await del(resume.blobUrl);
        } catch {
          // Blob might not exist, continue
        }
      }
      await prisma.resume.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { message: "Failed to delete resume" },
      { status: 500 }
    );
  }
}

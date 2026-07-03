import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cachedJson } from "@/lib/apiCache";

export async function GET() {
  try {
    const socialLinks = await prisma.socialLink.findMany({
      orderBy: { order: "asc" },
    });
    return cachedJson({ socialLinks });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch social links" },
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

    const data = await req.json();
    const socialLink = await prisma.socialLink.create({ data });
    return NextResponse.json({ socialLink });
  } catch {
    return NextResponse.json(
      { message: "Failed to create social link" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id, ...data } = await req.json();
    const socialLink = await prisma.socialLink.update({ where: { id }, data });
    return NextResponse.json({ socialLink });
  } catch {
    return NextResponse.json(
      { message: "Failed to update social link" },
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
    await prisma.socialLink.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { message: "Failed to delete social link" },
      { status: 500 }
    );
  }
}


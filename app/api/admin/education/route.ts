import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const education = await prisma.education.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ education });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch education" },
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
    const education = await prisma.education.create({ data });
    return NextResponse.json({ education });
  } catch {
    return NextResponse.json(
      { message: "Failed to create education" },
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
    const education = await prisma.education.update({ where: { id }, data });
    return NextResponse.json({ education });
  } catch {
    return NextResponse.json(
      { message: "Failed to update education" },
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
    await prisma.education.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { message: "Failed to delete education" },
      { status: 500 }
    );
  }
}


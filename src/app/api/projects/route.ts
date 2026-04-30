import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let projects;
  if (user.role === "ADMIN") {
    projects = await prisma.project.findMany({ include: { owner: true } });
  } else {
    projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { tasks: { some: { assignedToId: user.id } } }
        ]
      },
      include: { owner: true }
    });
  }

  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Only admins can create projects" }, { status: 403 });
  }

  try {
    const { name, description } = await request.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const project = await prisma.project.create({
      data: { name, description, ownerId: user.id },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

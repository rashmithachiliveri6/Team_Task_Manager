import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let projects;
  if (user.role === "ADMIN") {
    projects = await prisma.project.findMany({ 
      include: { owner: true, members: { include: { user: true } }, tasks: true } 
    });
  } else {
    projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } }
        ]
      },
      include: { owner: true, members: { include: { user: true } }, tasks: true }
    });
  }

  // Calculate project progress
  projects = projects.map(p => {
    const total = p.tasks.length;
    const completed = p.tasks.filter(t => t.status === "DONE").length;
    return { ...p, progress: total === 0 ? 0 : Math.round((completed / total) * 100) };
  });

  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { name, description, startDate, endDate, members } = await request.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const project = await prisma.project.create({
      data: { 
        name, 
        description, 
        ownerId: user.id,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        members: members?.length ? {
          create: members.map((id: string) => ({ userId: id }))
        } : undefined
      },
      include: { members: { include: { user: true } }, tasks: true }
    });

    return NextResponse.json({ project: { ...project, progress: 0 } }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

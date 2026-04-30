import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let tasks;
  if (user.role === "ADMIN") {
    tasks = await prisma.task.findMany({ include: { project: true, assignedTo: true } });
  } else {
    tasks = await prisma.task.findMany({
      where: {
        OR: [
          { assignedToId: user.id },
          { project: { ownerId: user.id } }
        ]
      },
      include: { project: true, assignedTo: true }
    });
  }

  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Only admins can create tasks" }, { status: 403 });
  }

  try {
    const { title, description, projectId, assignedToId, dueDate } = await request.json();
    if (!title || !projectId) return NextResponse.json({ error: "Title and projectId are required" }, { status: 400 });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        assignedToId,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

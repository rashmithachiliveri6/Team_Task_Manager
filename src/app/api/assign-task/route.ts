import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { title, description, assignedToId, projectId, priority, deadline } = await request.json();
    if (!title || !projectId) {
      return NextResponse.json({ error: "Title and Project ID are required" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        assignedToId,
        assignedById: user.id,
        priority: priority || "MEDIUM",
        deadline: deadline ? new Date(deadline) : null,
      },
      include: { project: true, assignedTo: true, assignedBy: true }
    });

    if (assignedToId) {
      await prisma.notification.create({
        data: {
          userId: assignedToId,
          message: `You have been assigned a new task: ${title} by ${user.name}`
        }
      });
    }

    return NextResponse.json({ task, message: "Task assigned successfully" }, { status: 201 });
  } catch (error) {
    console.error("Assign Task Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

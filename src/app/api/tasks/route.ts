import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");
  const priorityFilter = searchParams.get("priority");

  const filterConfig: any = {};
  if (statusFilter) filterConfig.status = statusFilter;
  if (priorityFilter) filterConfig.priority = priorityFilter;

  let tasks;
  if (user.role === "ADMIN") {
    tasks = await prisma.task.findMany({ 
      where: filterConfig,
      include: { project: true, assignedTo: true, comments: true } 
    });
  } else {
    tasks = await prisma.task.findMany({
      where: {
        AND: [
          filterConfig,
          {
            OR: [
              { assignedToId: user.id },
              { project: { members: { some: { userId: user.id } } } },
              { project: { ownerId: user.id } }
            ]
          }
        ]
      },
      include: { project: true, assignedTo: true, comments: true }
    });
  }
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { title, description, projectId, assignedToId, deadline, priority } = await request.json();
    if (!title || !projectId) return NextResponse.json({ error: "Required fields missing" }, { status: 400 });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        assignedToId,
        priority: priority || "MEDIUM",
        deadline: deadline ? new Date(deadline) : null,
      },
      include: { project: true, assignedTo: true }
    });

    if (assignedToId) {
      await prisma.notification.create({
        data: {
          userId: assignedToId,
          message: `You have been assigned a new task: ${title} in project ${task.project.name}`
        }
      });
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

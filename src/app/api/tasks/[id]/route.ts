import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  try {
    const { status, title, description, assignedToId, priority, deadline } = await request.json();
    const task = await prisma.task.findUnique({ where: { id }, include: { project: true } });
    if (!task) return NextResponse.json({ error: "Not Found" }, { status: 404 });

    if (user.role !== "ADMIN" && task.assignedToId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    
    if (user.role === "ADMIN") {
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (priority !== undefined) updateData.priority = priority;
      if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;
      
      if (assignedToId !== undefined && assignedToId !== task.assignedToId) {
        updateData.assignedToId = assignedToId;
        if (assignedToId) {
           await prisma.notification.create({
             data: {
               userId: assignedToId,
               message: `You have been newly assigned to the task: ${task.title}`
             }
           });
        }
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: { assignedTo: true, project: true }
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  
  const { id } = await context.params;
  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted" });
}

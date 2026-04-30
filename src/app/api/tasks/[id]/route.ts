import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  try {
    const { status, title, description, assignedToId, dueDate } = await request.json();
    
    // Check if task exists
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return NextResponse.json({ error: "Not Found" }, { status: 404 });

    // Members can only update status of tasks assigned to them
    if (user.role !== "ADMIN" && task.assignedToId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    
    // Only admins can change core details
    if (user.role === "ADMIN") {
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
      if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData
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

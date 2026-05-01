import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { status } = await request.json();
    const { id } = await context.params;

    if (!["TODO", "IN_PROGRESS", "DONE"].includes(status)) {
      return NextResponse.json({ error: "Invalid status string" }, { status: 400 });
    }

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    // Taskers can only update their own tasks, Admin can update any
    if (user.role !== "ADMIN" && task.assignedToId !== user.id) {
       return NextResponse.json({ error: "Forbidden: Not your task" }, { status: 403 });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ message: "Task status updated successfully", task: updatedTask }, { status: 200 });
  } catch (error) {
    console.error("Update Task Status Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

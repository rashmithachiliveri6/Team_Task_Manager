import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const comments = await prisma.comment.findMany({
    where: { taskId: id },
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ comments });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const { text } = await request.json();

  if (!text) return NextResponse.json({ error: "Empty comment" }, { status: 400 });

  try {
    const comment = await prisma.comment.create({
      data: { text, taskId: id, userId: user.id },
      include: { user: true }
    });
    
    // Notify task assignee if someone else comments
    const task = await prisma.task.findUnique({ where: { id } });
    if (task && task.assignedToId && task.assignedToId !== user.id) {
       await prisma.notification.create({
         data: {
           userId: task.assignedToId,
           message: `${user.name} commented on your task: ${task.title}`
         }
       });
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

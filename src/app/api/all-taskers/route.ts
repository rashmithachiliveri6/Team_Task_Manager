import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const taskers = await prisma.user.findMany({
      where: { role: "TASKER" },
      include: {
        tasksAssigned: true
      }
    });

    const now = new Date();
    const formattedTaskers = taskers.map(t => {
      const total = t.tasksAssigned.length;
      const completed = t.tasksAssigned.filter(task => task.status === "DONE").length;
      const pending = t.tasksAssigned.filter(task => task.status === "TODO" || task.status === "IN_PROGRESS").length;
      const overdue = t.tasksAssigned.filter(task => task.deadline && new Date(task.deadline) < now && task.status !== "DONE").length;
      const efficiency = total === 0 ? 0 : Math.round((completed / total) * 100);

      // Remove passwordHash before sending
      const { passwordHash, tasksAssigned, ...safeTasker } = t;

      return {
        ...safeTasker,
        assigned: total,
        completed,
        pending,
        overdue,
        efficiency
      };
    });

    return NextResponse.json({ taskers: formattedTaskers }, { status: 200 });
  } catch (error) {
    console.error("All taskers error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

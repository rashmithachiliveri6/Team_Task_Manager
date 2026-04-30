import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isMember = user.role !== "ADMIN";
  const baseWhere = isMember ? { assignedToId: user.id } : {};

  try {
    const totalTasks = await prisma.task.count({ where: baseWhere });
    
    const statusCounts = await prisma.task.groupBy({
      by: ['status'],
      where: baseWhere,
      _count: { status: true }
    });

    const now = new Date();
    const overdueTasks = await prisma.task.count({
      where: {
        ...baseWhere,
        deadline: { lt: now },
        status: { not: "DONE" }
      }
    });

    const formattedCounts = {
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0
    };
    statusCounts.forEach(s => {
      if(formattedCounts.hasOwnProperty(s.status)) {
         formattedCounts[s.status as keyof typeof formattedCounts] = s._count.status;
      }
    });

    return NextResponse.json({
      total: totalTasks,
      byStatus: formattedCounts,
      overdue: overdueTasks
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

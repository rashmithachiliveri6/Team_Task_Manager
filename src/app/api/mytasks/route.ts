import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const tasks = await prisma.task.findMany({
      where: { assignedToId: user.id },
      include: { project: true, comments: true, assignedBy: { select: { name: true, email: true } } },
      orderBy: { deadline: 'asc' }
    });

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error("My Tasks Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

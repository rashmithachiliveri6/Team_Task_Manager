import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { title, description, startDate, endDate, members } = await request.json();
    if (!title) return NextResponse.json({ error: "Project title is required" }, { status: 400 });

    const project = await prisma.project.create({
      data: { 
        name: title, // Using `name` in schema as `title` from request 
        description, 
        ownerId: user.id,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        members: members?.length ? {
          create: members.map((id: string) => ({ userId: id }))
        } : undefined
      },
      include: { members: { include: { user: true } } }
    });

    return NextResponse.json({ message: "Project created successfully", project }, { status: 201 });
  } catch (error) {
    console.error("Create Project Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

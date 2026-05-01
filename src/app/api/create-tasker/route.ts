import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { getCurrentUser } from "@/lib/session";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { name, email, password, department } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const tasker = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "TASKER",
        department: department || null
      }
    });

    return NextResponse.json({ message: "Tasker created successfully", tasker: { id: tasker.id, name: tasker.name, email: tasker.email } }, { status: 201 });
  } catch (error) {
    console.error("Create Tasker Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

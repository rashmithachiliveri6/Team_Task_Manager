import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, name, role: requestedRole } = await request.json();
    
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // If a role is requested, use it, otherwise default to TASKER
    const role = requestedRole || "TASKER";

    const user = await prisma.user.create({
      data: { email, passwordHash: hashedPassword, name, role },
    });

    const token = signToken({ userId: user.id, role: user.role });
    const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } }, { status: 201 });
    response.cookies.set("token", token, { httpOnly: true, path: "/", maxAge: 86400 });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

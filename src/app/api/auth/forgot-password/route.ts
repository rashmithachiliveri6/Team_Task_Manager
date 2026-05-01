import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "If that email exists, a reset link has been sent" }, { status: 200 });
    }

    const token = crypto.randomUUID();
    await prisma.user.update({
      where: { email },
      data: { forgotPasswordToken: token }
    });

    // Logging the token for debug purpose over real SMTP in demo
    console.log(`\n\n\n[Simulated Email] Reset URL for ${email}: http://localhost:3000/reset-password?token=${token}\n\n\n`);

    return NextResponse.json({ message: "If that email exists, a reset link has been sent" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

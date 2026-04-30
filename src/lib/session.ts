import { cookies } from "next/headers";
import { verifyToken } from "./auth";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  const decoded = verifyToken(token) as { userId: string; role: string } | null;
  if (!decoded) return null;

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  return user;
}

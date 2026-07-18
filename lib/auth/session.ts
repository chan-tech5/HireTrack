import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

export async function getSession() {
  return auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/dashboard");
  }
  return session;
}

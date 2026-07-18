"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function markAsRead(id: string) {
  const session = await requireAuth();

  await prisma.notification.update({
    where: { id, userId: session.user.id },
    data: { isRead: true },
  });

  revalidatePath("/notifications");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function markAllAsRead() {
  const session = await requireAuth();

  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/notifications");
  revalidatePath("/dashboard");
  return { success: true };
}

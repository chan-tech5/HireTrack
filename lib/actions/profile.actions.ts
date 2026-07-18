"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validations/auth.schema";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { name: string; image?: string }): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireAuth();

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        image: data.image || undefined,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update profile." };
  }
}

export async function changePassword(input: ChangePasswordInput) {
  const session = await requireAuth();

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || !user.hashedPassword) {
    return { error: "User account has invalid credentials configuration." };
  }

  const isPasswordCorrect = await bcrypt.compare(currentPassword, user.hashedPassword);
  if (!isPasswordCorrect) {
    return { error: "Current password is incorrect." };
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      hashedPassword: hashedNewPassword,
    },
  });

  return { success: true };
}

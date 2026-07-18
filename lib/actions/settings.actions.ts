"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateOrganization(data: {
  name: string;
  website?: string;
  industry?: string;
  size?: string;
}) {
  const session = await requireAuth();
  if (!hasPermission(session.user.role, "settings:edit")) {
    return { error: "You don't have permission to edit organization settings." };
  }

  await prisma.organization.update({
    where: { id: session.user.organizationId },
    data: {
      name: data.name,
      website: data.website || null,
      industry: data.industry || null,
      size: data.size || null,
    },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function updateMemberRole(userId: string, role: Role) {
  const session = await requireAuth();
  if (!hasPermission(session.user.role, "member:manage")) {
    return { error: "You don't have permission to manage team members." };
  }

  if (userId === session.user.id) {
    return { error: "You cannot change your own role." };
  }

  // Verify member belongs to organization
  const member = await prisma.user.findFirst({
    where: { id: userId, organizationId: session.user.organizationId },
  });
  if (!member) return { error: "Member not found in your organization." };

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function toggleMemberActive(userId: string, isActive: boolean) {
  const session = await requireAuth();
  if (!hasPermission(session.user.role, "member:manage")) {
    return { error: "You don't have permission to manage team members." };
  }

  if (userId === session.user.id) {
    return { error: "You cannot deactivate yourself." };
  }

  const member = await prisma.user.findFirst({
    where: { id: userId, organizationId: session.user.organizationId },
  });
  if (!member) return { error: "Member not found in your organization." };

  await prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });

  revalidatePath("/settings");
  return { success: true };
}

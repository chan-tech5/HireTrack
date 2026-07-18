"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { createJobSchema, updateJobSchema, type CreateJobInput, type UpdateJobInput } from "@/lib/validations/job.schema";
import { slugify } from "@/lib/utils/format";
import { revalidatePath } from "next/cache";

async function generateUniqueSlug(title: string): Promise<string> {
  let slug = slugify(title);
  const existing = await prisma.job.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;
  return slug;
}

export async function createJob(input: CreateJobInput) {
  const session = await requireAuth();
  if (!hasPermission(session.user.role, "job:create")) {
    return { error: "You don't have permission to create jobs." };
  }

  const parsed = createJobSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const slug = await generateUniqueSlug(parsed.data.title);

  await prisma.job.create({
    data: {
      ...parsed.data,
      slug,
      closingDate: parsed.data.closingDate ? new Date(parsed.data.closingDate) : null,
      organizationId: session.user.organizationId,
      createdById: session.user.id,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "created_job",
      entityType: "job",
      entityId: slug,
      userId: session.user.id,
    },
  });

  revalidatePath("/jobs");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateJob(id: string, input: UpdateJobInput) {
  const session = await requireAuth();
  if (!hasPermission(session.user.role, "job:edit")) {
    return { error: "You don't have permission to edit jobs." };
  }

  const job = await prisma.job.findFirst({
    where: { id, organizationId: session.user.organizationId, deletedAt: null },
  });
  if (!job) return { error: "Job not found." };

  const parsed = updateJobSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.job.update({
    where: { id },
    data: {
      ...parsed.data,
      closingDate: parsed.data.closingDate ? new Date(parsed.data.closingDate) : undefined,
    },
  });

  revalidatePath(`/jobs/${id}`);
  revalidatePath("/jobs");
  return { success: true };
}

export async function archiveJob(id: string) {
  const session = await requireAuth();
  if (!hasPermission(session.user.role, "job:edit")) {
    return { error: "You don't have permission to archive jobs." };
  }

  await prisma.job.update({
    where: { id, organizationId: session.user.organizationId },
    data: { status: "ARCHIVED", deletedAt: new Date() },
  });

  revalidatePath("/jobs");
  return { success: true };
}

export async function deleteJob(id: string) {
  const session = await requireAuth();
  if (!hasPermission(session.user.role, "job:delete")) {
    return { error: "Only admins can delete jobs." };
  }

  await prisma.job.update({
    where: { id, organizationId: session.user.organizationId },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/jobs");
  return { success: true };
}

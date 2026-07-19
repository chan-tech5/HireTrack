"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import {
  createCandidateSchema,
  updateCandidateSchema,
  moveCandidateStageSchema,
  createApplicationNoteSchema,
  type CreateCandidateInput,
  type UpdateCandidateInput,
  type MoveCandidateStageInput,
  type CreateApplicationNoteInput
} from "@/lib/validations/candidate.schema";
import { revalidatePath } from "next/cache";

export async function createCandidate(input: CreateCandidateInput) {
  try {
    const session = await requireAuth();
    if (!hasPermission(session.user.role, "candidate:create")) {
      return { error: "You don't have permission to create candidates." };
    }

    const parsed = createCandidateSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { jobId, ...candidateData } = parsed.data;

    if (!jobId) {
      return { error: "Please select a job for the candidate." };
    }

    // Verify email duplicate within candidates
    const existing = await prisma.candidate.findUnique({
      where: { email: candidateData.email },
    });
    if (existing) {
      // If candidate exists, check if they already have an application for this job
      const appExists = await prisma.application.findFirst({
        where: { candidateId: existing.id, jobId, deletedAt: null },
      });
      if (appExists) {
        return { error: "This candidate has already applied to this job." };
      }

      // Otherwise, create application for existing candidate
      const app = await prisma.application.create({
        data: {
          candidateId: existing.id,
          jobId,
          stage: "APPLIED",
        },
      });

      await prisma.stageHistory.create({
        data: {
          applicationId: app.id,
          toStage: "APPLIED",
          reason: "Manual addition",
        },
      });

      await prisma.activityLog.create({
        data: {
          action: "added_candidate",
          entityType: "candidate",
          entityId: existing.id,
          userId: session.user.id,
        },
      });

      revalidatePath("/candidates");
      revalidatePath(`/jobs/${jobId}`);
      return { success: true, candidateId: existing.id };
    }

    // Create new candidate + application
    const result = await prisma.$transaction(async (tx) => {
      const candidate = await tx.candidate.create({
        data: candidateData,
      });

      const app = await tx.application.create({
        data: {
          candidateId: candidate.id,
          jobId,
          stage: "APPLIED",
        },
      });

      await tx.stageHistory.create({
        data: {
          applicationId: app.id,
          toStage: "APPLIED",
          reason: "Manual creation",
        },
      });

      await tx.activityLog.create({
        data: {
          action: "added_candidate",
          entityType: "candidate",
          entityId: candidate.id,
          userId: session.user.id,
        },
      });

      return candidate;
    });

    revalidatePath("/candidates");
    revalidatePath(`/jobs/${jobId}`);
    return { success: true, candidateId: result.id };
  } catch (error: any) {
    console.error("createCandidate error:", error);
    return { error: error.message || "Failed to create candidate." };
  }
}

export async function updateCandidate(id: string, input: UpdateCandidateInput) {
  const session = await requireAuth();
  if (!hasPermission(session.user.role, "candidate:edit")) {
    return { error: "You don't have permission to edit candidates." };
  }

  const parsed = updateCandidateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.candidate.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath(`/candidates/${id}`);
  revalidatePath("/candidates");
  return { success: true };
}

export async function deleteCandidate(id: string) {
  const session = await requireAuth();
  if (!hasPermission(session.user.role, "candidate:delete")) {
    return { error: "Only admins can delete candidates." };
  }

  await prisma.candidate.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/candidates");
  return { success: true };
}

export async function moveCandidateStage(input: MoveCandidateStageInput) {
  const session = await requireAuth();
  if (!hasPermission(session.user.role, "application:move-stage")) {
    return { error: "You don't have permission to move candidate stages." };
  }

  const parsed = moveCandidateStageSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { applicationId, stage, reason } = parsed.data;

  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { candidate: true, job: true },
  });

  if (!app) return { error: "Application not found" };

  const fromStage = app.stage;

  await prisma.$transaction(async (tx) => {
    await tx.application.update({
      where: { id: applicationId },
      data: {
        stage,
        stageChangedAt: new Date(),
      },
    });

    await tx.stageHistory.create({
      data: {
        applicationId,
        fromStage,
        toStage: stage,
        reason,
      },
    });

    await tx.activityLog.create({
      data: {
        action: "moved_stage",
        entityType: "application",
        entityId: applicationId,
        userId: session.user.id,
        metadata: { fromStage, toStage: stage, reason },
      },
    });

    // Create notifications for other users in the org
    const users = await tx.user.findMany({
      where: {
        organizationId: session.user.organizationId,
        id: { not: session.user.id },
      },
    });

    const notificationsData = users.map((user) => ({
      userId: user.id,
      type: "STAGE_CHANGED" as const,
      title: "Candidate Stage Moved",
      message: `${app.candidate.firstName} ${app.candidate.lastName} moved to ${stage} for ${app.job.title}`,
      entityId: app.candidate.id,
      entityType: "candidate",
    }));

    if (notificationsData.length > 0) {
      await tx.notification.createMany({
        data: notificationsData,
      });
    }
  });

  revalidatePath("/candidates");
  revalidatePath(`/candidates/${app.candidateId}`);
  revalidatePath(`/jobs/${app.jobId}`);
  return { success: true };
}

export async function createApplicationNote(input: CreateApplicationNoteInput) {
  const session = await requireAuth();

  const parsed = createApplicationNoteSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { applicationId, content, isPrivate } = parsed.data;

  const app = await prisma.application.findUnique({
    where: { id: applicationId },
  });
  if (!app) return { error: "Application not found" };

  await prisma.applicationNote.create({
    data: {
      applicationId,
      content,
      isPrivate,
    },
  });

  revalidatePath(`/candidates/${app.candidateId}`);
  return { success: true };
}

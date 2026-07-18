"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import {
  scheduleInterviewSchema,
  updateInterviewSchema,
  submitScorecardSchema,
  type ScheduleInterviewInput,
  type UpdateInterviewInput,
  type SubmitScorecardInput
} from "@/lib/validations/interview.schema";
import { revalidatePath } from "next/cache";

export async function scheduleInterview(input: ScheduleInterviewInput) {
  const session = await requireAuth();
  if (!hasPermission(session.user.role, "interview:schedule")) {
    return { error: "You don't have permission to schedule interviews." };
  }

  const parsed = scheduleInterviewSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { applicationId, interviewerIds, scheduledAt, ...rest } = parsed.data;

  // Verify interviewers belong to organization
  const interviewers = await prisma.user.findMany({
    where: {
      id: { in: interviewerIds },
      organizationId: session.user.organizationId,
    },
  });

  if (interviewers.length !== interviewerIds.length) {
    return { error: "One or more selected interviewers are invalid." };
  }

  const interview = await prisma.$transaction(async (tx) => {
    const item = await tx.interview.create({
      data: {
        ...rest,
        applicationId,
        scheduledAt: new Date(scheduledAt),
        interviewers: {
          connect: interviewerIds.map((id) => ({ id })),
        },
      },
      include: {
        application: {
          include: { candidate: true },
        },
      },
    });

    await tx.activityLog.create({
      data: {
        action: "scheduled_interview",
        entityType: "interview",
        entityId: item.id,
        userId: session.user.id,
      },
    });

    // Create notifications for selected interviewers
    const notificationsData = interviewerIds.map((id) => ({
      userId: id,
      type: "INTERVIEW_SCHEDULED" as const,
      title: "New Interview Scheduled",
      message: `You have been assigned to interview ${item.application.candidate.firstName} ${item.application.candidate.lastName} on ${new Date(scheduledAt).toLocaleDateString()}`,
      entityId: item.id,
      entityType: "interview",
    }));

    if (notificationsData.length > 0) {
      await tx.notification.createMany({
        data: notificationsData,
      });
    }

    return item;
  });

  revalidatePath("/interviews");
  revalidatePath(`/candidates/${interview.application.candidateId}`);
  return { success: true, interviewId: interview.id };
}

export async function updateInterview(id: string, input: UpdateInterviewInput) {
  const session = await requireAuth();
  if (!hasPermission(session.user.role, "interview:schedule")) {
    return { error: "You don't have permission to update interviews." };
  }

  const parsed = updateInterviewSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { interviewerIds, scheduledAt, ...rest } = parsed.data;

  const interview = await prisma.interview.findFirst({
    where: { id, application: { job: { organizationId: session.user.organizationId } } },
  });
  if (!interview) return { error: "Interview not found." };

  await prisma.interview.update({
    where: { id },
    data: {
      ...rest,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      interviewers: interviewerIds
        ? {
            set: interviewerIds.map((id) => ({ id })),
          }
        : undefined,
    },
  });

  revalidatePath("/interviews");
  return { success: true };
}

export async function submitScorecard(input: SubmitScorecardInput) {
  const session = await requireAuth();
  if (!hasPermission(session.user.role, "scorecard:submit")) {
    return { error: "You don't have permission to submit scorecards." };
  }

  const parsed = submitScorecardSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { interviewId, overallRating, recommendation, criteria, summary } = parsed.data;

  const interview = await prisma.interview.findFirst({
    where: {
      id: interviewId,
      application: { job: { organizationId: session.user.organizationId } },
    },
    include: {
      application: true,
    },
  });

  if (!interview) return { error: "Interview not found." };

  await prisma.$transaction(async (tx) => {
    // Create scorecard
    await tx.scorecard.create({
      data: {
        interviewId,
        overallRating,
        recommendation,
        criteria,
        summary,
      },
    });

    // Mark interview as completed and update rating / feedback
    await tx.interview.update({
      where: { id: interviewId },
      data: {
        status: "COMPLETED",
        rating: overallRating,
        feedback: summary,
      },
    });

    await tx.activityLog.create({
      data: {
        action: "submitted_scorecard",
        entityType: "scorecard",
        entityId: interviewId,
        userId: session.user.id,
      },
    });
  });

  revalidatePath("/interviews");
  revalidatePath(`/candidates/${interview.application.candidateId}`);
  return { success: true };
}

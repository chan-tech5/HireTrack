import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Calendar as CalendarIcon, Clock, Users, User, ArrowUpRight, CheckSquare, History as HistoryIcon } from "lucide-react";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { InterviewStatusBadge } from "@/components/shared/status-badge";
import { formatFullName, formatDateTime, formatTime, formatDate } from "@/lib/utils/format";
import { INTERVIEW_TYPE_LABELS } from "@/lib/utils/constants";
import { hasPermission } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Interviews" };

export default async function InterviewsPage() {
  const session = await requireAuth();

  const interviews = await prisma.interview.findMany({
    where: {
      application: {
        job: { organizationId: session.user.organizationId },
      },
    },
    include: {
      application: {
        include: {
          candidate: { select: { firstName: true, lastName: true } },
          job: { select: { title: true } },
        },
      },
      interviewers: { select: { name: true, image: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  const upcomingInterviews = interviews.filter((i) => i.status === "SCHEDULED");
  const pastInterviews = interviews.filter((i) => i.status !== "SCHEDULED");
  const canSchedule = hasPermission(session.user.role, "interview:schedule");

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Interviews" description="Manage your team's upcoming candidate interviews.">
        {canSchedule && (
          <Link href="/interviews/new" className={cn(buttonVariants({ variant: "default" }))}>
            <Plus className="mr-2 h-4 w-4" />Schedule Interview
          </Link>
        )}
      </PageHeader>

      {interviews.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No interviews scheduled"
          description="Schedule interviews with your candidates to start evaluating them."
          action={
            canSchedule ? (
              <Link href="/interviews/new" className={cn(buttonVariants({ variant: "default" }))}>
                <Plus className="mr-2 h-4 w-4" />Schedule first interview
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Agenda view / Upcoming */}
          <div className="xl:col-span-2 space-y-4">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Upcoming Interviews ({upcomingInterviews.length})
            </h3>

            {upcomingInterviews.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No upcoming interviews scheduled.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {upcomingInterviews.map((interview) => {
                  const candidateName = formatFullName(
                    interview.application.candidate.firstName,
                    interview.application.candidate.lastName
                  );
                  return (
                    <Card key={interview.id} className="hover:border-primary/20 transition-all">
                      <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">
                              {interview.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({INTERVIEW_TYPE_LABELS[interview.type]})
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Candidate:{" "}
                            <Link
                              href={`/candidates/${interview.application.candidateId}`}
                              className="font-medium text-foreground hover:underline"
                            >
                              {candidateName}
                            </Link>{" "}
                            for{" "}
                            <span className="font-medium text-foreground">
                              {interview.application.job.title}
                            </span>
                          </p>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {formatDateTime(interview.scheduledAt)} ({interview.durationMinutes}m)
                            </span>
                            {interview.meetingLink && (
                              <a
                                href={interview.meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline"
                              >
                                <ArrowUpRight className="h-3.5 w-3.5" />
                                Join Call
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-center gap-3 shrink-0">
                          <InterviewStatusBadge status={interview.status} />
                          <Link
                            href={`/interviews/${interview.id}`}
                            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                          >
                            <CheckSquare className="mr-1.5 h-3.5 w-3.5" />Evaluate
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past / Completed History */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <HistoryIcon className="h-5 w-5 text-muted-foreground" />
              Past & Evaluations ({pastInterviews.length})
            </h3>

            {pastInterviews.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No completed interviews yet.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pastInterviews.map((interview) => {
                  const candidateName = formatFullName(
                    interview.application.candidate.firstName,
                    interview.application.candidate.lastName
                  );
                  return (
                    <Card key={interview.id} className="bg-muted/30">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="font-semibold text-xs text-foreground truncate">
                              {interview.title}
                            </h5>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {candidateName} · {interview.application.job.title}
                            </p>
                          </div>
                          <InterviewStatusBadge status={interview.status} />
                        </div>

                        <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                          <span>{formatDate(interview.scheduledAt)}</span>
                          {interview.rating !== null && (
                            <span className="font-semibold text-foreground">
                              Rating: {interview.rating}/5
                            </span>
                          )}
                        </div>
                        {interview.feedback && (
                          <p className="text-xs text-muted-foreground italic border-t border-border/60 pt-2 line-clamp-2">
                            "{interview.feedback}"
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

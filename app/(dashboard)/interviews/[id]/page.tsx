import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { ScorecardForm } from "@/components/interviews/scorecard-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InterviewStatusBadge } from "@/components/shared/status-badge";
import { formatFullName, formatDateTime } from "@/lib/utils/format";
import { INTERVIEW_TYPE_LABELS } from "@/lib/utils/constants";
import { buttonVariants } from "@/components/ui/button";
import { ChevronLeft, CheckCircle2, User, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Submit Evaluation" };

interface InterviewDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InterviewDetailPage({ params }: InterviewDetailPageProps) {
  const session = await requireAuth();
  const { id } = await params;

  const interview = await prisma.interview.findFirst({
    where: { id, application: { job: { organizationId: session.user.organizationId } } },
    include: {
      application: {
        include: {
          candidate: true,
          job: { select: { title: true } },
        },
      },
      interviewers: { select: { id: true, name: true } },
      scorecard: true,
    },
  });

  if (!interview) {
    notFound();
  }

  const candidateName = formatFullName(
    interview.application.candidate.firstName,
    interview.application.candidate.lastName
  );

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div>
        <Link href="/interviews" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-4 -ml-2")}>
          <ChevronLeft className="mr-1 h-4 w-4" />Back to Interviews
        </Link>
        <PageHeader title={interview.title} description={`${candidateName} · ${interview.application.job.title}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Info Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Session Info</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{INTERVIEW_TYPE_LABELS[interview.type]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="h-4 w-4" />Scheduled</span>
                <span className="font-medium text-right text-xs">{formatDateTime(interview.scheduledAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{interview.durationMinutes} minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <InterviewStatusBadge status={interview.status} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Evaluation Team</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {interview.interviewers.map((interviewer) => (
                <div key={interviewer.id} className="flex items-center gap-2 font-medium text-foreground py-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {interviewer.name}
                  {interviewer.id === session.user.id && (
                    <Badge variant="secondary" className="text-[9px] scale-90">You</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {interview.notes && (
            <Card>
              <CardHeader><CardTitle className="text-base">Preparation Notes</CardTitle></CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {interview.notes}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Evaluation Column */}
        <div className="lg:col-span-2 space-y-6">
          {interview.scorecard ? (
            <Card className="border-success/20 bg-success/5">
              <CardHeader>
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <CardTitle className="text-base">Evaluation Submitted</CardTitle>
                </div>
                <CardDescription>Structured feedback and metrics completed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-sm">
                <div className="grid grid-cols-2 gap-4 border-b border-border/60 pb-4">
                  <div>
                    <p className="text-muted-foreground text-xs">Recommendation</p>
                    <p className="text-base font-bold text-foreground mt-0.5">
                      {interview.scorecard.recommendation.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Overall Rating</p>
                    <p className="text-base font-bold text-foreground mt-0.5">
                      {interview.scorecard.overallRating} / 5
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Scorecard Criteria Ratings</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(interview.scorecard.criteria as Record<string, number>).map(([key, rating]) => (
                      <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/80">
                        <span className="font-medium text-xs text-muted-foreground uppercase tracking-wider">
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={cn(
                                "w-2.5 h-2.5 rounded-full",
                                i < rating ? "bg-success" : "bg-muted"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {interview.scorecard.summary && (
                  <div className="space-y-2 pt-2">
                    <h4 className="font-semibold text-foreground">Written Summary</h4>
                    <p className="p-4 rounded-xl bg-card border border-border/80 text-foreground leading-relaxed whitespace-pre-wrap">
                      {interview.scorecard.summary}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <ScorecardForm interviewId={interview.id} />
          )}
        </div>
      </div>
    </div>
  );
}

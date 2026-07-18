import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StageBadge, InterviewStatusBadge } from "@/components/shared/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { STAGE_LABELS, INTERVIEW_TYPE_LABELS } from "@/lib/utils/constants";
import { formatDate, formatDateTime, formatFullName, formatInitials } from "@/lib/utils/format";
import { moveCandidateStage, createApplicationNote } from "@/lib/actions/candidate.actions";
import { hasPermission } from "@/lib/auth/permissions";
import {
  ChevronLeft, Mail, Phone, MapPin, Globe,
  FileText, ExternalLink, MessageSquare, History, Plus,
  Calendar, CheckSquare, Pencil, User, Trash2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Candidate Profile" };

interface CandidateDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CandidateDetailPage({ params }: CandidateDetailPageProps) {
  const session = await requireAuth();
  const { id } = await params;

  const candidate = await prisma.candidate.findFirst({
    where: { id, deletedAt: null },
    include: {
      applications: {
        where: { deletedAt: null },
        include: {
          job: { select: { title: true, id: true } },
          notes: {
            orderBy: { createdAt: "desc" },
          },
          stageHistory: {
            orderBy: { changedAt: "desc" },
          },
          interviews: {
            orderBy: { scheduledAt: "desc" },
            include: {
              interviewers: { select: { name: true } },
              scorecard: true,
            },
          },
        },
      },
    },
  });

  if (!candidate) {
    notFound();
  }

  const activeApp = candidate.applications[0]; // Active application
  const fullName = formatFullName(candidate.firstName, candidate.lastName);
  const canEdit = hasPermission(session.user.role, "candidate:edit");

  // Move stage form handler
  async function handleMoveStage(formData: FormData) {
    "use server";
    const stage = formData.get("stage") as any;
    const reason = formData.get("reason") as string;
    if (!activeApp) return;

    await moveCandidateStage({
      applicationId: activeApp.id,
      stage,
      reason: reason || undefined,
    });
  }

  // Create note form handler
  async function handleCreateNote(formData: FormData) {
    "use server";
    const content = formData.get("content") as string;
    const isPrivate = formData.get("isPrivate") === "on";
    if (!activeApp || !content) return;

    await createApplicationNote({
      applicationId: activeApp.id,
      content,
      isPrivate,
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link href="/candidates" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-4 -ml-2")}>
          <ChevronLeft className="mr-1 h-4 w-4" />Back to Candidates
        </Link>
        <PageHeader title={fullName} description={candidate.currentTitle ?? "Candidate Profile"}>
          <div className="flex items-center gap-2">
            {canEdit && (
              <Link
                href={`/candidates/${candidate.id}/edit`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                <Pencil className="mr-2 h-4 w-4" />Edit Profile
              </Link>
            )}
          </div>
        </PageHeader>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Profile Info */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 mb-4 ring-4 ring-muted">
                <AvatarImage src={candidate.avatarUrl ?? undefined} alt={fullName} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
                  {formatInitials(fullName)}
                </AvatarFallback>
              </Avatar>
              <h2 className="font-bold text-lg text-foreground">{fullName}</h2>
              {candidate.currentTitle && (
                <p className="text-sm text-muted-foreground mt-0.5">{candidate.currentTitle}</p>
              )}
              {candidate.currentCompany && (
                <p className="text-xs text-muted-foreground mt-0.5">at {candidate.currentCompany}</p>
              )}

              {/* Social Links */}
              <div className="flex items-center gap-3 mt-4">
                {candidate.linkedinUrl && (
                  <a
                    href={candidate.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-full border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                )}
                {candidate.portfolioUrl && (
                  <a
                    href={candidate.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-full border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Globe className="h-4.5 w-4.5" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Contact Info</CardTitle></CardHeader>
            <CardContent className="space-y-3.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><Mail className="h-4 w-4" />Email</span>
                <span className="font-medium text-foreground select-all">{candidate.email}</span>
              </div>
              {candidate.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2"><Phone className="h-4 w-4" />Phone</span>
                  <span className="font-medium text-foreground">{candidate.phone}</span>
                </div>
              )}
              {candidate.currentLocation && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4" />Location</span>
                  <span className="font-medium text-foreground">{candidate.currentLocation}</span>
                </div>
              )}
              {candidate.source && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Source</span>
                  <span className="font-medium text-foreground">{candidate.source}</span>
                </div>
              )}
              {candidate.experienceYears !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="font-medium text-foreground">{candidate.experienceYears} Years</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resume Card */}
          <Card>
            <CardHeader><CardTitle className="text-base">Resume File</CardTitle></CardHeader>
            <CardContent>
              {candidate.resumeUrl ? (
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-success/20 bg-success/5 text-success hover:bg-success/10 transition-all group"
                >
                  <FileText className="h-5 w-5 text-success shrink-0" />
                  <span className="truncate flex-1 font-medium text-sm">
                    {candidate.resumeFileName || "Download Resume"}
                  </span>
                  <ExternalLink className="h-4.5 w-4.5 text-success/60 group-hover:text-success shrink-0" />
                </a>
              ) : (
                <div className="text-sm text-muted-foreground py-2 flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-muted-foreground/60" />
                  No resume file uploaded.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column — Job Applications and Details */}
        <div className="space-y-6 lg:col-span-2">
          {!activeApp ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  This candidate has no active job applications.
                </p>
                <Link
                  href={`/candidates/${candidate.id}/apply`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
                >
                  Apply to Job
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Active Application Header */}
              <Card className="border-primary/10">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-primary tracking-wider uppercase">Active Application</p>
                      <h3 className="font-bold text-lg text-foreground mt-0.5">{activeApp.job.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">Applied on {formatDate(activeApp.appliedAt)}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm text-muted-foreground">Stage:</span>
                      <StageBadge stage={activeApp.stage} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pipeline Actions: Move Stage */}
              {hasPermission(session.user.role, "application:move-stage") && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Hiring Stage Control</CardTitle>
                    <CardDescription>Advance or reject candidate in the pipeline</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form action={handleMoveStage} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                      <div className="space-y-2">
                        <Label htmlFor="stage-select">Move to Stage</Label>
                        <select
                          id="stage-select"
                          name="stage"
                          defaultValue={activeApp.stage}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          {Object.entries(STAGE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2 sm:col-span-2 flex gap-3 items-end">
                        <div className="flex-1 space-y-2">
                          <Label htmlFor="reason-input">Reason (Optional)</Label>
                          <Input id="reason-input" name="reason" placeholder="e.g. Cleared phone screening" />
                        </div>
                        <Button type="submit">Update Stage</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Tabs for Notes, History, Interviews */}
              <Tabs defaultValue="notes" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                  <TabsTrigger value="notes">Notes ({activeApp.notes.length})</TabsTrigger>
                  <TabsTrigger value="interviews">Interviews ({activeApp.interviews.length})</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* Notes Tab */}
                <TabsContent value="notes" className="space-y-4 pt-4">
                  {/* Create Note */}
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm">Add Feedback / Note</CardTitle></CardHeader>
                    <CardContent>
                      <form action={handleCreateNote} className="space-y-3">
                        <Textarea name="content" placeholder="Type internal feedback..." rows={3} required />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="isPrivate" name="isPrivate" className="rounded border-border text-primary" />
                            <Label htmlFor="isPrivate" className="text-xs text-muted-foreground select-none">Private Note (Admin only)</Label>
                          </div>
                          <Button type="submit" size="sm">Add Note</Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Notes Feed */}
                  <div className="space-y-3">
                    {activeApp.notes.map((note) => (
                      <Card key={note.id} className={cn(note.isPrivate && "border-warning/20 bg-warning/5")}>
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                              <User className="h-3.5 w-3.5" />
                              Recruitment Team
                            </span>
                            <span>{formatDate(note.createdAt)}</span>
                          </div>
                          <p className="text-sm text-foreground/85 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                          {note.isPrivate && (
                            <Badge variant="outline" className="border-amber-500/30 text-amber-600 bg-amber-500/10 text-[9px] uppercase tracking-wider px-1.5 py-0.5">Private</Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Interviews Tab */}
                <TabsContent value="interviews" className="space-y-4 pt-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold">Scheduled Interviews</h4>
                    <Link
                      href={`/interviews/new?candidateId=${candidate.id}&jobId=${activeApp.job.id}`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" />Schedule
                    </Link>
                  </div>

                  {activeApp.interviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No interviews scheduled yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {activeApp.interviews.map((interview) => (
                        <Card key={interview.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1.5">
                                <h5 className="font-semibold text-sm text-foreground">{interview.title}</h5>
                                <p className="text-xs text-muted-foreground">
                                  {INTERVIEW_TYPE_LABELS[interview.type]} · {formatDateTime(interview.scheduledAt)}
                                </p>
                                <div className="text-[11px] text-muted-foreground flex flex-wrap gap-1.5 items-center">
                                  <span className="font-medium text-foreground/80">Interviewers:</span>
                                  {interview.interviewers.map((i) => i.name).join(", ")}
                                </div>
                              </div>
                              <InterviewStatusBadge status={interview.status} />
                            </div>

                            {interview.scorecard ? (
                              <div className="mt-4 pt-3 border-t border-border/80">
                                <div className="flex items-center gap-2 text-xs">
                                  <Badge variant="outline" className="text-success border-success/20 bg-success/5 font-medium">
                                    Scorecard Submitted
                                  </Badge>
                                  <span className="text-muted-foreground">Rating:</span>
                                  <span className="font-bold">{interview.scorecard.overallRating} / 5</span>
                                </div>
                                {interview.scorecard.summary && (
                                  <p className="text-xs text-muted-foreground mt-1.5 italic">
                                    "{interview.scorecard.summary}"
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="mt-4 pt-3 border-t border-border/80 flex justify-end">
                                <Link
                                  href={`/interviews/${interview.id}`}
                                  className={cn(buttonVariants({ variant: "outline", size: "xs" }))}
                                >
                                  Submit Feedback
                                </Link>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-3 pt-4">
                  {activeApp.stageHistory.map((history) => (
                    <div key={history.id} className="flex gap-3 text-xs leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div>
                        <p className="text-foreground font-medium">
                          Moved to <span className="font-semibold">{STAGE_LABELS[history.toStage]}</span>
                          {history.fromStage && ` (from ${STAGE_LABELS[history.fromStage]})`}
                        </p>
                        {history.reason && (
                          <p className="text-muted-foreground mt-0.5">Reason: {history.reason}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                          {formatDateTime(history.changedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
import { JobStatusBadge, StageBadge } from "@/components/shared/status-badge";
import {
  JOB_TYPE_LABELS,
  WORK_MODE_LABELS,
  STAGE_LABELS,
  STAGE_ORDER
} from "@/lib/utils/constants";
import { formatDate, formatSalary, formatExperience, formatFullName } from "@/lib/utils/format";
import { hasPermission } from "@/lib/auth/permissions";
import { ChevronLeft, MapPin, Clock, Users, Calendar, Pencil, Archive, Building, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils/cn";

import { archiveJob } from "@/lib/actions/job.actions";
import { redirect } from "next/navigation";
import { JobKanbanBoard } from "@/components/jobs/job-kanban-board";

export const metadata: Metadata = { title: "Job Details" };

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const session = await requireAuth();
  const { id } = await params;

  const job = await prisma.job.findFirst({
    where: { id, organizationId: session.user.organizationId, deletedAt: null },
    include: {
      createdBy: { select: { name: true } },
      applications: {
        where: { deletedAt: null },
        include: {
          candidate: true,
        },
      },
    },
  });

  if (!job) {
    notFound();
  }

  const canEdit = hasPermission(session.user.role, "job:edit");
  const candidatesByStage = STAGE_ORDER.reduce((acc, stage) => {
    acc[stage] = job.applications.filter((app) => app.stage === stage);
    return acc;
  }, {} as Record<string, typeof job.applications>);

  async function handleArchive() {
    "use server";
    await archiveJob(id);
    redirect("/jobs");
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/jobs" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-4 -ml-2")}>
          <ChevronLeft className="mr-1 h-4 w-4" />Back to Jobs
        </Link>
        <PageHeader title={job.title} description={job.department ?? "No Department Specified"}>
          <div className="flex items-center gap-2">
            <JobStatusBadge status={job.status} />
            {canEdit && (
              <>
                <Link
                  href={`/jobs/${job.id}/edit`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  <Pencil className="mr-2 h-4 w-4" />Edit Job
                </Link>
                <form action={handleArchive}>
                  <Button variant="outline" size="sm" type="submit">
                    <Archive className="mr-2 h-4 w-4" />Archive
                  </Button>
                </form>
              </>
            )}
          </div>
        </PageHeader>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="pipeline" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-sm mb-4">
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="pipeline" className="space-y-4">
              {job.applications.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-base">No candidates yet</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mt-1">
                      Candidates who apply to this job will appear here.
                    </p>
                    <Link
                      href="/candidates/new"
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
                    >
                      Add Candidate Manually
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <JobKanbanBoard
                  initialApplications={job.applications}
                  jobId={job.id}
                  userRole={session.user.role}
                />
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Job Description</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-sm text-foreground/80 leading-relaxed">
                    {job.description}
                  </p>
                </CardContent>
              </Card>

              {job.requirements && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-sm text-foreground/80 leading-relaxed">
                      {job.requirements}
                    </p>
                  </CardContent>
                </Card>
              )}

              {job.responsibilities && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Responsibilities</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-sm text-foreground/80 leading-relaxed">
                      {job.responsibilities}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Job Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Building className="h-4 w-4" />Department
                </span>
                <span className="font-medium text-foreground">{job.department ?? "N/A"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />Location
                </span>
                <span className="font-medium text-foreground">{job.location ?? "N/A"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />Job Type
                </span>
                <span className="font-medium text-foreground">{JOB_TYPE_LABELS[job.type]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4" />Work Mode
                </span>
                <span className="font-medium text-foreground">{WORK_MODE_LABELS[job.workMode]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-4 w-4" />Openings
                </span>
                <span className="font-medium text-foreground">{job.openings}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Experience</span>
                <span className="font-medium text-foreground">
                  {job.experienceMin !== null || job.experienceMax !== null
                    ? `${job.experienceMin ?? 0}–${job.experienceMax ?? "5+"} yrs`
                    : "Not Specified"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Salary</span>
                <span className="font-medium text-foreground">
                  {formatSalary(job.salaryMin, job.salaryMax, job.currency ?? "USD")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />Closing Date
                </span>
                <span className="font-medium text-foreground">{formatDate(job.closingDate)}</span>
              </div>
              <Separator />
              <div className="text-[11px] text-muted-foreground space-y-1">
                <p>Created by {job.createdBy.name}</p>
                <p>Posted on {formatDate(job.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { MapPin, Clock, Users, MoreHorizontal, Archive, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { JobStatusBadge } from "@/components/shared/status-badge";
import { JOB_TYPE_LABELS, WORK_MODE_LABELS } from "@/lib/utils/constants";
import { formatDate, formatSalary } from "@/lib/utils/format";
import { hasPermission } from "@/lib/auth/permissions";
import type { Job, JobType, WorkMode, JobStatus } from "@prisma/client";
import type { Role } from "@prisma/client";

interface JobCardJob {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  workMode: WorkMode;
  type: JobType;
  status: JobStatus;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  closingDate: Date | null;
  createdAt: Date;
  createdBy: { name: string };
  _count: { applications: number };
}

export function JobCard({ job, userRole }: { job: JobCardJob; userRole: Role }) {
  const canEdit = hasPermission(userRole, "job:edit");

  return (
    <Card className="group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link
              href={`/jobs/${job.id}`}
              className="text-base font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
            >
              {job.title}
            </Link>
            {job.department && (
              <p className="text-xs text-muted-foreground mt-0.5">{job.department}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <JobStatusBadge status={job.status} />
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity")}>
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Job actions</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="p-0">
                    <Link href={`/jobs/${job.id}/edit`} className="flex w-full items-center gap-1.5 px-1.5 py-1">
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-muted-foreground">
                    <Archive className="mr-2 h-3.5 w-3.5" />
                    <span>Archive</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />{job.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />{JOB_TYPE_LABELS[job.type]}
          </span>
          <span>{WORK_MODE_LABELS[job.workMode]}</span>
        </div>

        {(job.salaryMin || job.salaryMax) && (
          <p className="text-xs font-medium text-foreground">
            {formatSalary(job.salaryMin, job.salaryMax, job.currency ?? "USD")}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>
              {job._count.applications} applicant{job._count.applications !== 1 ? "s" : ""}
            </span>
          </div>
          {job.closingDate && (
            <p className="text-xs text-muted-foreground">Closes {formatDate(job.closingDate)}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

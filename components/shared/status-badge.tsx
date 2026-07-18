import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import type { ApplicationStage, JobStatus, InterviewStatus } from "@prisma/client";

const JOB_STATUS_STYLES: Record<JobStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground border-border",
  OPEN: "bg-success/10 text-success border-success/20",
  PAUSED: "bg-warning/10 text-warning border-warning/20",
  CLOSED: "bg-muted text-muted-foreground border-border",
  ARCHIVED: "bg-muted/50 text-muted-foreground/60 border-border/50",
};

const STAGE_STYLES: Record<ApplicationStage, string> = {
  APPLIED: "bg-info/10 text-info border-info/20",
  SCREENING: "bg-warning/10 text-warning border-warning/20",
  INTERVIEW: "bg-primary/10 text-primary border-primary/20",
  OFFER: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  HIRED: "bg-success/10 text-success border-success/20",
  REJECTED: "bg-destructive/10 text-destructive border-destructive/20",
  WITHDRAWN: "bg-muted text-muted-foreground border-border",
};

const INTERVIEW_STATUS_STYLES: Record<InterviewStatus, string> = {
  SCHEDULED: "bg-primary/10 text-primary border-primary/20",
  COMPLETED: "bg-success/10 text-success border-success/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
  RESCHEDULED: "bg-warning/10 text-warning border-warning/20",
  NO_SHOW: "bg-muted text-muted-foreground border-border",
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const labels: Record<JobStatus, string> = {
    DRAFT: "Draft", OPEN: "Open", PAUSED: "Paused", CLOSED: "Closed", ARCHIVED: "Archived",
  };
  return (
    <Badge variant="outline" className={cn("font-medium text-xs", JOB_STATUS_STYLES[status])}>
      {labels[status]}
    </Badge>
  );
}

export function StageBadge({ stage }: { stage: ApplicationStage }) {
  const labels: Record<ApplicationStage, string> = {
    APPLIED: "Applied", SCREENING: "Screening", INTERVIEW: "Interview",
    OFFER: "Offer", HIRED: "Hired", REJECTED: "Rejected", WITHDRAWN: "Withdrawn",
  };
  return (
    <Badge variant="outline" className={cn("font-medium text-xs", STAGE_STYLES[stage])}>
      {labels[stage]}
    </Badge>
  );
}

export function InterviewStatusBadge({ status }: { status: InterviewStatus }) {
  const labels: Record<InterviewStatus, string> = {
    SCHEDULED: "Scheduled", COMPLETED: "Completed", CANCELLED: "Cancelled",
    RESCHEDULED: "Rescheduled", NO_SHOW: "No Show",
  };
  return (
    <Badge variant="outline" className={cn("font-medium text-xs", INTERVIEW_STATUS_STYLES[status])}>
      {labels[status]}
    </Badge>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { JobForm } from "@/components/jobs/job-form";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Edit Job Posting" };

interface EditJobPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const session = await requireRole(["ADMIN", "RECRUITER"]);
  const { id } = await params;

  const job = await prisma.job.findFirst({
    where: { id, organizationId: session.user.organizationId, deletedAt: null },
  });

  if (!job) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href={`/jobs/${id}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-4 -ml-2")}>
          <ChevronLeft className="mr-1 h-4 w-4" />Back to Job Details
        </Link>
        <PageHeader title={`Edit ${job.title}`} description="Update the job posting details." />
      </div>
      <JobForm job={job} />
    </div>
  );
}

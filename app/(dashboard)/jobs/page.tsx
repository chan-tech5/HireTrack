import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Briefcase } from "lucide-react";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { JobCard } from "@/components/jobs/job-card";
import { EmptyState } from "@/components/shared/empty-state";
import { hasPermission } from "@/lib/auth/permissions";

export const metadata: Metadata = { title: "Jobs" };

export default async function JobsPage() {
  const session = await requireAuth();

  const jobs = await prisma.job.findMany({
    where: { organizationId: session.user.organizationId, deletedAt: null },
    include: {
      createdBy: { select: { name: true } },
      _count: { select: { applications: { where: { deletedAt: null } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const canCreate = hasPermission(session.user.role, "job:create");

  return (
    <div className="space-y-6">
      <PageHeader title="Jobs" description={`${jobs.length} job posting${jobs.length !== 1 ? "s" : ""}`}>
        {canCreate && (
          <Link href="/jobs/new" className={buttonVariants({ variant: "default" })}>
            <Plus className="mr-2 h-4 w-4" />Post Job
          </Link>
        )}
      </PageHeader>

      {jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs yet"
          description="Post your first job opening to start receiving applications."
          action={
            canCreate ? (
              <Link href="/jobs/new" className={buttonVariants({ variant: "default" })}>
                <Plus className="mr-2 h-4 w-4" />Post your first job
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} userRole={session.user.role} />
          ))}
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { CandidateForm } from "@/components/candidates/candidate-form";
import { buttonVariants } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Add Candidate" };

export default async function NewCandidatePage() {
  const session = await requireRole(["ADMIN", "RECRUITER"]);

  // Fetch open jobs to link the candidate to
  const jobs = await prisma.job.findMany({
    where: { organizationId: session.user.organizationId, status: "OPEN", deletedAt: null },
    select: { id: true, title: true },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/candidates" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-4 -ml-2")}>
          <ChevronLeft className="mr-1 h-4 w-4" />Back to Candidates
        </Link>
        <PageHeader title="Add New Candidate" description="Create a candidate profile and link them to an open job." />
      </div>
      <CandidateForm jobs={jobs} />
    </div>
  );
}

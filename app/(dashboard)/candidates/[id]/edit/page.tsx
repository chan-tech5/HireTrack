import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { CandidateForm } from "@/components/candidates/candidate-form";
import { buttonVariants } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Edit Candidate Profile" };

interface EditCandidatePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCandidatePage({ params }: EditCandidatePageProps) {
  const session = await requireRole(["ADMIN", "RECRUITER"]);
  const { id } = await params;

  const candidate = await prisma.candidate.findFirst({
    where: { id, deletedAt: null },
  });

  if (!candidate) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href={`/candidates/${id}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-4 -ml-2")}>
          <ChevronLeft className="mr-1 h-4 w-4" />Back to Profile
        </Link>
        <PageHeader title={`Edit ${candidate.firstName}'s Profile`} description="Update candidate details." />
      </div>
      <CandidateForm candidate={candidate} />
    </div>
  );
}

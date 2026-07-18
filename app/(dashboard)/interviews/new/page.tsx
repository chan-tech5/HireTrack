import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { InterviewForm } from "@/components/interviews/interview-form";
import { buttonVariants } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Schedule Interview" };

export default async function NewInterviewPage() {
  const session = await requireRole(["ADMIN", "RECRUITER"]);

  // Fetch applications with candidate details
  const applications = await prisma.application.findMany({
    where: {
      deletedAt: null,
      stage: { notIn: ["HIRED", "REJECTED", "WITHDRAWN"] },
    },
    include: {
      candidate: { select: { firstName: true, lastName: true } },
      job: { select: { title: true } },
    },
  });

  // Fetch organization team members (potential interviewers)
  const interviewers = await prisma.user.findMany({
    where: {
      organizationId: session.user.organizationId,
      isActive: true,
      deletedAt: null,
    },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/interviews" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-4 -ml-2")}>
          <ChevronLeft className="mr-1 h-4 w-4" />Back to Interviews
        </Link>
        <PageHeader title="Schedule Interview" description="Link a candidate's application and select evaluation team." />
      </div>
      <InterviewForm applications={applications} interviewers={interviewers} />
    </div>
  );
}

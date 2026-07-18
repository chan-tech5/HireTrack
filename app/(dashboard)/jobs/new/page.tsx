import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/shared/page-header";
import { JobForm } from "@/components/jobs/job-form";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Post New Job" };

export default async function NewJobPage() {
  await requireRole(["ADMIN", "RECRUITER"]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/jobs" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-4 -ml-2")}>
          <ChevronLeft className="mr-1 h-4 w-4" />Back to Jobs
        </Link>
        <PageHeader title="Post New Job" description="Fill in the details to create a new job posting." />
      </div>
      <JobForm />
    </div>
  );
}

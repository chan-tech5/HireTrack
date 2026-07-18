import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Users, Search, MapPin, Mail, Phone, Briefcase } from "lucide-react";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { StageBadge } from "@/components/shared/status-badge";
import { formatFullName, formatDate } from "@/lib/utils/format";
import { hasPermission } from "@/lib/auth/permissions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatInitials } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Candidates" };

interface CandidatesPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function CandidatesPage({ searchParams }: CandidatesPageProps) {
  const session = await requireAuth();
  const { q } = await searchParams;

  const candidates = await prisma.candidate.findMany({
    where: {
      deletedAt: null,
      OR: q
        ? [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { currentTitle: { contains: q, mode: "insensitive" } },
          ]
        : undefined,
    },
    include: {
      applications: {
        where: { deletedAt: null },
        include: {
          job: { select: { title: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const canCreate = hasPermission(session.user.role, "candidate:create");

  return (
    <div className="space-y-6">
      <PageHeader title="Candidates" description={`${candidates.length} candidate profile${candidates.length !== 1 ? "s" : ""}`}>
        {canCreate && (
          <Link href="/candidates/new" className={cn(buttonVariants({ variant: "default" }))}>
            <Plus className="mr-2 h-4 w-4" />Add Candidate
          </Link>
        )}
      </PageHeader>

      {/* Search Bar */}
      <div className="flex items-center gap-2 max-w-sm">
        <form method="GET" className="relative w-full flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search candidates..."
            className="pl-9 pr-4 w-full"
          />
        </form>
      </div>

      {candidates.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidates found"
          description={q ? "No candidates match your search query." : "Add candidates to start tracking applicants."}
          action={
            canCreate && !q ? (
              <Link href="/candidates/new" className={cn(buttonVariants({ variant: "default" }))}>
                <Plus className="mr-2 h-4 w-4" />Add candidate
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidates.map((candidate) => {
            const latestApp = candidate.applications[0];
            const fullName = formatFullName(candidate.firstName, candidate.lastName);
            return (
              <Card key={candidate.id} className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarImage src={candidate.avatarUrl ?? undefined} alt={fullName} />
                      <AvatarFallback className="text-sm bg-primary/10 text-primary font-semibold">
                        {formatInitials(fullName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/candidates/${candidate.id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors text-base line-clamp-1"
                        >
                          {fullName}
                        </Link>
                        {latestApp && <StageBadge stage={latestApp.stage} />}
                      </div>

                      {candidate.currentTitle && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                          {candidate.currentTitle}
                          {candidate.currentCompany && ` at ${candidate.currentCompany}`}
                        </p>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5 truncate">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          {candidate.email}
                        </span>
                        {candidate.phone && (
                          <span className="flex items-center gap-1.5 truncate">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            {candidate.phone}
                          </span>
                        )}
                        {candidate.currentLocation && (
                          <span className="flex items-center gap-1.5 truncate">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            {candidate.currentLocation}
                          </span>
                        )}
                        {latestApp && (
                          <span className="flex items-center gap-1.5 truncate font-medium text-foreground/80">
                            <Briefcase className="h-3.5 w-3.5 shrink-0" />
                            Applied to {latestApp.job.title}
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-muted-foreground/60 mt-4 border-t border-border/60 pt-3">
                        Added on {formatDate(candidate.createdAt)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StageBadge } from "@/components/shared/status-badge";
import { ROLE_LABELS } from "@/lib/utils/constants";
import { ReportsCharts } from "@/components/reports/reports-charts";

export const metadata: Metadata = { title: "Reports & Analytics" };

export default async function ReportsPage() {
  const session = await requireAuth();
  const { organizationId } = session.user;

  // 1. Applications by Stage
  const stageCounts = await prisma.application.groupBy({
    by: ["stage"],
    where: { job: { organizationId }, deletedAt: null },
    _count: true,
  });

  // 2. Candidate Sources
  const sourceCounts = await prisma.candidate.groupBy({
    by: ["source"],
    where: { deletedAt: null },
    _count: true,
  });

  // 3. Recruiter Performance (active users in the organization)
  const recruiters = await prisma.user.findMany({
    where: { organizationId, deletedAt: null },
    select: {
      id: true,
      name: true,
      role: true,
      _count: {
        select: {
          createdJobs: { where: { deletedAt: null } },
          assignedInterviews: true,
        },
      },
    },
  });

  // Map database groupings to chart shapes
  const stageData = stageCounts.map((s) => ({
    stage: s.stage,
    count: s._count,
  }));

  const sourceData = sourceCounts.map((s) => ({
    source: s.source || "Unknown",
    count: s._count,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Reports & Analytics" description="Track key recruitment metrics and hiring performance." />

      {/* Recharts Visualizations (Client Component wrapper) */}
      <ReportsCharts stageData={stageData} sourceData={sourceData} />

      {/* Recruiter Activity Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Recruiting Team Performance</CardTitle>
          <CardDescription>Metrics showing activity logs and contributions per team member</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Jobs Created</TableHead>
                <TableHead className="text-right">Interviews Assigned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recruiters.map((recruiter) => (
                <TableRow key={recruiter.id}>
                  <TableCell className="font-semibold text-foreground">{recruiter.name}</TableCell>
                  <TableCell className="text-muted-foreground">{ROLE_LABELS[recruiter.role]}</TableCell>
                  <TableCell className="text-right font-medium">{recruiter._count.createdJobs}</TableCell>
                  <TableCell className="text-right font-medium">{recruiter._count.assignedInterviews}</TableCell>
                </TableRow>
              ))}
              {recruiters.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No recruiters found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

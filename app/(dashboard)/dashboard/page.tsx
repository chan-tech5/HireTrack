import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/session";
import { PageHeader } from "@/components/shared/page-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { HiringFunnelChart } from "@/components/dashboard/hiring-funnel-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { TimeToHireChart } from "@/components/dashboard/time-to-hire-chart";
import { prisma } from "@/lib/db/prisma";
import { subDays, startOfMonth } from "date-fns";

export const metadata: Metadata = { title: "Dashboard" };

async function getDashboardData(organizationId: string) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const thirtyDaysAgo = subDays(now, 30);

  const [openJobs, activeCandidates, scheduledInterviews, hiredThisMonth, applicationsByStage, recentActivity] =
    await Promise.all([
      prisma.job.count({
        where: { organizationId, status: "OPEN", deletedAt: null },
      }),
      prisma.candidate.count({
        where: {
          deletedAt: null,
          applications: {
            some: {
              deletedAt: null,
              stage: { notIn: ["HIRED", "REJECTED", "WITHDRAWN"] },
            },
          },
        },
      }),
      prisma.interview.count({
        where: {
          status: "SCHEDULED",
          scheduledAt: { gte: now },
          application: { job: { organizationId } },
        },
      }),
      prisma.application.count({
        where: {
          stage: "HIRED",
          updatedAt: { gte: monthStart },
          job: { organizationId },
        },
      }),
      prisma.application.groupBy({
        by: ["stage"],
        where: { job: { organizationId }, deletedAt: null },
        _count: true,
      }),
      prisma.activityLog.findMany({
        where: {
          user: { organizationId },
          createdAt: { gte: thirtyDaysAgo },
        },
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  return {
    openJobs,
    activeCandidates,
    scheduledInterviews,
    hiredThisMonth,
    applicationsByStage,
    recentActivity,
  };
}

export default async function DashboardPage() {
  const session = await requireAuth();
  const data = await getDashboardData(session.user.organizationId);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Good ${getGreeting()}, ${session.user.name.split(" ")[0]} 👋`}
        description="Here's what's happening with your hiring pipeline today."
      />

      <StatsCards
        openJobs={data.openJobs}
        activeCandidates={data.activeCandidates}
        scheduledInterviews={data.scheduledInterviews}
        hiredThisMonth={data.hiredThisMonth}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HiringFunnelChart data={data.applicationsByStage} />
        </div>
        <div>
          <TimeToHireChart />
        </div>
      </div>

      <RecentActivity activities={data.recentActivity} />
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

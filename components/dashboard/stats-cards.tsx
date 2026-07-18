import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface StatsCardsProps {
  openJobs: number;
  activeCandidates: number;
  scheduledInterviews: number;
  hiredThisMonth: number;
}

interface StatItem {
  key: "openJobs" | "activeCandidates" | "scheduledInterviews" | "hiredThisMonth";
  title: string;
  icon: any;
  color: string;
  bg: string;
  change: string;
  trend: "up" | "down" | "neutral";
}

const STATS: StatItem[] = [
  {
    key: "openJobs",
    title: "Open Jobs",
    icon: Briefcase,
    color: "text-primary",
    bg: "bg-primary/10",
    change: "+2 this week",
    trend: "up",
  },
  {
    key: "activeCandidates",
    title: "Active Candidates",
    icon: Users,
    color: "text-info",
    bg: "bg-info/10",
    change: "+12 this week",
    trend: "up",
  },
  {
    key: "scheduledInterviews",
    title: "Interviews Today",
    icon: Calendar,
    color: "text-warning",
    bg: "bg-warning/10",
    change: "3 upcoming",
    trend: "neutral",
  },
  {
    key: "hiredThisMonth",
    title: "Hired This Month",
    icon: TrendingUp,
    color: "text-success",
    bg: "bg-success/10",
    change: "+1 vs last month",
    trend: "up",
  },
];

export function StatsCards({
  openJobs,
  activeCandidates,
  scheduledInterviews,
  hiredThisMonth,
}: StatsCardsProps) {
  const values: Record<string, number> = {
    openJobs,
    activeCandidates,
    scheduledInterviews,
    hiredThisMonth,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map((stat) => {
        const Icon = stat.icon;
        const value = values[stat.key];
        return (
          <Card
            key={stat.key}
            className="relative overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <Icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">
                {value.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {stat.trend === "up" && (
                  <ArrowUpRight className="h-3 w-3 text-success" />
                )}
                {stat.trend === "down" && (
                  <ArrowDownRight className="h-3 w-3 text-destructive" />
                )}
                <span>{stat.change}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

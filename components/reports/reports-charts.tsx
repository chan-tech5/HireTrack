"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { STAGE_LABELS } from "@/lib/utils/constants";
import type { ApplicationStage } from "@prisma/client";

interface StageDataItem {
  stage: ApplicationStage;
  count: number;
}

interface SourceDataItem {
  source: string;
  count: number;
}

interface ReportsChartsProps {
  stageData: StageDataItem[];
  sourceData: SourceDataItem[];
}

const STAGE_COLORS: Record<ApplicationStage, string> = {
  APPLIED: "oklch(0.58 0.18 226)",
  SCREENING: "oklch(0.72 0.18 62)",
  INTERVIEW: "oklch(0.52 0.23 264)",
  OFFER: "oklch(0.62 0.22 320)",
  HIRED: "oklch(0.55 0.17 142)",
  REJECTED: "oklch(0.60 0.22 25)",
  WITHDRAWN: "oklch(0.52 0.02 250)",
};

const PIE_COLORS = [
  "oklch(0.52 0.23 264)", // Violet-blue
  "oklch(0.55 0.17 142)", // Green
  "oklch(0.58 0.18 226)", // Blue
  "oklch(0.72 0.18 62)",  // Orange
  "oklch(0.62 0.22 320)", // Pink
  "oklch(0.60 0.20 25)",  // Red
  "oklch(0.52 0.02 250)", // Gray
];

const STAGE_ORDER: ApplicationStage[] = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];

export function ReportsCharts({ stageData, sourceData }: ReportsChartsProps) {
  // Map funnel data
  const funnelChartData = STAGE_ORDER.map((stage) => ({
    stage,
    label: STAGE_LABELS[stage],
    count: stageData.find((d) => d.stage === stage)?.count ?? 0,
    fill: STAGE_COLORS[stage] ?? "hsl(var(--muted))",
  }));

  // Map source data
  const sourceChartData = sourceData.map((d, index) => ({
    name: d.source,
    value: d.count,
    fill: PIE_COLORS[index % PIE_COLORS.length],
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Funnel Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Recruitment Pipeline Funnel</CardTitle>
          <CardDescription>Visual distribution of candidates across stages</CardDescription>
        </CardHeader>
        <CardContent>
          {stageData.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
              No pipeline data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={funnelChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                  itemStyle={{ color: "hsl(var(--muted-foreground))" }}
                  cursor={{ fill: "hsl(var(--muted) / 40%)" }}
                />
                <Bar dataKey="count" name="Candidates" radius={[4, 4, 0, 0]}>
                  {funnelChartData.map((entry) => (
                    <Cell key={entry.stage} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Source Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Candidate Sourcing Channels</CardTitle>
          <CardDescription>Breakdown of candidate acquisition channels</CardDescription>
        </CardHeader>
        <CardContent>
          {sourceData.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
              No sourcing channel data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={sourceChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {sourceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

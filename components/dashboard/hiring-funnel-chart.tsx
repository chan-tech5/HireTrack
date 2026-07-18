"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { STAGE_LABELS } from "@/lib/utils/constants";
import type { ApplicationStage } from "@prisma/client";

interface FunnelData {
  stage: ApplicationStage;
  _count: number;
}

interface HiringFunnelChartProps {
  data: FunnelData[];
}

const STAGE_COLORS: Partial<Record<ApplicationStage, string>> = {
  APPLIED: "hsl(226, 70%, 60%)",
  SCREENING: "hsl(43, 90%, 58%)",
  INTERVIEW: "hsl(262, 70%, 60%)",
  OFFER: "hsl(320, 65%, 60%)",
  HIRED: "hsl(142, 55%, 48%)",
};

const STAGE_ORDER: ApplicationStage[] = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "HIRED",
];

export function HiringFunnelChart({ data }: HiringFunnelChartProps) {
  const chartData = STAGE_ORDER.map((stage) => ({
    stage,
    label: STAGE_LABELS[stage],
    count: data.find((d) => d.stage === stage)?._count ?? 0,
    fill: STAGE_COLORS[stage] ?? "#888",
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Hiring Funnel</CardTitle>
        <CardDescription>Active applications by pipeline stage</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "13px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              itemStyle={{ color: "hsl(var(--muted-foreground))" }}
              cursor={{ fill: "hsl(var(--muted) / 50%)" }}
            />
            <Bar dataKey="count" name="Candidates" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.stage} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

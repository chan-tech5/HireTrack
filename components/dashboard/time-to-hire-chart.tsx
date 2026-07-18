"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Static placeholder data — will be replaced with DB data in reports module
const PLACEHOLDER_DATA = [
  { week: "W1", avgDays: 18 },
  { week: "W2", avgDays: 14 },
  { week: "W3", avgDays: 21 },
  { week: "W4", avgDays: 12 },
  { week: "W5", avgDays: 16 },
  { week: "W6", avgDays: 9 },
];

export function TimeToHireChart() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Time to Hire</CardTitle>
        <CardDescription>Avg. days per week (last 6 weeks)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={PLACEHOLDER_DATA}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border"
              vertical={false}
            />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              unit="d"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "13px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              formatter={(val: any) => [`${val} days`, "Avg. Time"]}
              cursor={{ stroke: "hsl(var(--border))" }}
            />
            <Line
              type="monotone"
              dataKey="avgDays"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

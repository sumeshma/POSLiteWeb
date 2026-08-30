"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { chartColor } from "@/lib/chart-colors";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type { DailyProfitLossBreakdown, ExpenseCategoryBreakdown } from "@/types/report";

const tooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  color: "var(--popover-foreground)",
};

type ProfitLossChartsProps = {
  dailyBreakdown: DailyProfitLossBreakdown[];
  expenseBreakdown: ExpenseCategoryBreakdown[];
};

export function ProfitLossCharts({ dailyBreakdown, expenseBreakdown }: ProfitLossChartsProps) {
  const animate = !usePrefersReducedMotion();
  const trend = dailyBreakdown.map((row) => ({
    label: formatDate(row.date) || row.date,
    revenue: row.revenue,
    netProfit: row.netProfit,
  }));
  const expenses = expenseBreakdown.map((row) => ({
    name: row.category || "Uncategorized",
    value: row.totalAmount,
    count: row.count,
  }));

  if (trend.length === 0 && expenses.length === 0) {
    return null;
  }

  return (
    <div className={trend.length > 0 ? "grid gap-4 lg:grid-cols-5" : "grid gap-4"}>
      {trend.length > 0 ? (
        <section className="rounded-xl border border-border bg-card p-4 lg:col-span-3">
          <h2 className="mb-3 text-sm font-medium">Daily revenue and net profit</h2>
          <div className="h-64" role="img" aria-label="Daily revenue and net profit">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) => [
                    formatCurrency(Number(value)),
                    name === "revenue" ? "Revenue" : "Net profit",
                  ]}
                />
                <Bar dataKey="revenue" fill="var(--chart-1)" radius={[6, 6, 0, 0]} isAnimationActive={animate} />
                <Bar dataKey="netProfit" fill="var(--chart-2)" radius={[6, 6, 0, 0]} isAnimationActive={animate} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : null}
      {expenses.length > 0 ? (
        <section
          className={
            trend.length > 0
              ? "rounded-xl border border-border bg-card p-4 lg:col-span-2"
              : "rounded-xl border border-border bg-card p-4"
          }
        >
          <h2 className="mb-3 text-sm font-medium">Expenses by category</h2>
          <div className="flex items-center gap-3">
            <div className="h-36 w-36 shrink-0" role="img" aria-label="Expenses by category">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenses}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={36}
                    outerRadius={56}
                    paddingAngle={2}
                    isAnimationActive={animate}
                  >
                    {expenses.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColor(index)} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name) => [formatCurrency(Number(value)), String(name)]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="min-w-0 space-y-1 text-sm">
              {expenses.map((item, index) => (
                <li key={item.name} className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: chartColor(index) }}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.name}</span>
                  </span>
                  <span className="shrink-0 tabular-nums">{formatCurrency(item.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </div>
  );
}

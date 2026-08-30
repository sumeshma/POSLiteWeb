"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const tooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  color: "var(--popover-foreground)",
};

export type StockHealthPoint = {
  name: string;
  value: number;
  color: string;
};

type DashboardChartsProps = {
  stockHealth: StockHealthPoint[];
};

export function DashboardCharts({ stockHealth }: DashboardChartsProps) {
  const animate = !usePrefersReducedMotion();
  const stockData = stockHealth.filter((row) => row.value > 0);

  if (stockData.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-medium">Stock health</h2>
      <div className="flex items-center gap-4">
        <div className="h-44 w-44 shrink-0" role="img" aria-label="Stock health">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stockData}
                dataKey="value"
                nameKey="name"
                innerRadius={44}
                outerRadius={68}
                paddingAngle={2}
                isAnimationActive={animate}
              >
                {stockData.map((row) => (
                  <Cell key={row.name} fill={row.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="min-w-0 flex-1 space-y-2 text-sm">
          {stockHealth.map((row) => (
            <li key={row.name} className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: row.color }}
                  aria-hidden="true"
                />
                <span className="truncate">{row.name}</span>
              </span>
              <span className="shrink-0 tabular-nums">{row.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

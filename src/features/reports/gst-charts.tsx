"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyState } from "@/components/shared/empty-state";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { formatCurrency } from "@/lib/currency";
import type { GstRateBreakdown } from "@/types/report";

const tooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  color: "var(--popover-foreground)",
};

export function GstCharts({ rates }: { rates: GstRateBreakdown[] }) {
  const animate = !usePrefersReducedMotion();
  const data = rates.map((row) => ({
    label: `${row.taxRatePercent}%`,
    taxableAmount: row.taxableAmount,
    taxAmount: row.taxAmount,
  }));

  if (data.length === 0) {
    return (
      <EmptyState
        title="No GST rate breakdown"
        description="The backend did not return tax-rate totals for this range."
      />
    );
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-medium">Tax by GST rate</h2>
      <div className="h-64" role="img" aria-label="Tax by GST rate">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value, name) => [
                formatCurrency(Number(value)),
                name === "taxableAmount" ? "Taxable" : "Tax",
              ]}
            />
            <Bar dataKey="taxableAmount" fill="var(--chart-1)" radius={[6, 6, 0, 0]} isAnimationActive={animate} />
            <Bar dataKey="taxAmount" fill="var(--chart-2)" radius={[6, 6, 0, 0]} isAnimationActive={animate} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

"use client";

import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "@/components/shared/empty-state";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { chartColor } from "@/lib/chart-colors";
import { formatCurrency } from "@/lib/currency";
import type { OrderTypeBreakdown, PaymentBreakdown } from "@/types/report";

export type TrendPoint = {
  label: string;
  totalSales: number;
  orderCount: number;
};

type SalesChartsProps = {
  trend: TrendPoint[];
  trendTitle: string;
  trendHint?: string;
  payments: PaymentBreakdown[];
  orderTypes: OrderTypeBreakdown[];
};

const tooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  color: "var(--popover-foreground)",
};

export function SalesCharts({ trend, trendTitle, trendHint, payments, orderTypes }: SalesChartsProps) {
  const reduceMotion = usePrefersReducedMotion();
  const animate = !reduceMotion;
  const hasTrend = trend.length > 0;
  const paymentData = payments.map((item) => ({
    name: item.paymentMethod || "Unknown",
    value: item.totalAmount,
    count: item.orderCount,
  }));
  const typeData = orderTypes.map((item) => ({
    name: item.orderType || "Unknown",
    value: item.totalAmount,
    count: item.orderCount,
  }));

  const showDonuts = paymentData.length > 0 || typeData.length > 0;

  return (
    <div className={showDonuts ? "grid gap-4 lg:grid-cols-5" : "grid gap-4"}>
      <section
        className={
          showDonuts
            ? "rounded-xl border border-border bg-card p-4 lg:col-span-3"
            : "rounded-xl border border-border bg-card p-4"
        }
      >
        <h2 className="text-sm font-medium">{trendTitle}</h2>
        {trendHint ? <p className="mb-3 mt-1 text-xs text-muted-foreground">{trendHint}</p> : <div className="mb-3" />}
        {!hasTrend ? (
          <EmptyState
            className="py-8"
            title="No sales in this period"
            description="Totals come from the server. There is nothing to chart yet."
          />
        ) : (
          <div className="h-72" role="img" aria-label={trendTitle}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <YAxis
                  yAxisId="sales"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  tickFormatter={(value: number) =>
                    new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(
                      value,
                    )
                  }
                />
                <YAxis
                  yAxisId="orders"
                  orientation="right"
                  allowDecimals={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) =>
                    name === "totalSales"
                      ? [formatCurrency(Number(value)), "Sales"]
                      : [String(value), "Bills"]
                  }
                />
                <Legend
                  formatter={(value) => (value === "totalSales" ? "Sales" : "Bills")}
                  wrapperStyle={{ fontSize: "12px" }}
                />
                <Bar
                  yAxisId="sales"
                  dataKey="totalSales"
                  fill="var(--chart-1)"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={animate}
                />
                <Line
                  yAxisId="orders"
                  type="monotone"
                  dataKey="orderCount"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--chart-2)" }}
                  isAnimationActive={animate}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {showDonuts ? (
        <div className="grid gap-4 lg:col-span-2">
          <DonutCard title="Payment methods" data={paymentData} animate={animate} />
          <DonutCard title="Order types" data={typeData} animate={animate} />
        </div>
      ) : null}
    </div>
  );
}

function DonutCard({
  title,
  data,
  animate,
}: {
  title: string;
  data: { name: string; value: number; count: number }[];
  animate: boolean;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-medium">{title}</h2>
      {data.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No breakdown for this period.</p>
      ) : (
        <div className="flex items-center gap-3">
          <div className="h-36 w-36 shrink-0" role="img" aria-label={title}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={36}
                  outerRadius={56}
                  paddingAngle={2}
                  isAnimationActive={animate}
                >
                  {data.map((entry, index) => (
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
            {data.map((item, index) => (
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
      )}
    </section>
  );
}

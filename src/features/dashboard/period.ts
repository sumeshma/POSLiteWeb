import { endOfMonth, endOfYear, format, startOfMonth, startOfYear, subDays } from "date-fns";
import { toApiDate } from "@/lib/date";
import type { ReportPeriodKind } from "@/types/report";

export type DashboardPeriod = "today" | "yesterday" | "month" | "year";

export type ResolvedPeriod = {
  kind: ReportPeriodKind;
  date?: string;
  year?: number;
  month?: number;
  fromDate: string;
  toDate: string;
  label: string;
};

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function monthLabel(month: number): string {
  return MONTH_NAMES[month - 1] ?? String(month);
}

export function resolvePeriod(period: DashboardPeriod, now = new Date()): ResolvedPeriod {
  if (period === "today") {
    const date = toApiDate(now);
    return {
      kind: "daily",
      date,
      fromDate: date,
      toDate: date,
      label: `Today · ${format(now, "dd MMM yyyy")}`,
    };
  }

  if (period === "yesterday") {
    const yesterday = subDays(now, 1);
    const date = toApiDate(yesterday);
    return {
      kind: "daily",
      date,
      fromDate: date,
      toDate: date,
      label: `Yesterday · ${format(yesterday, "dd MMM yyyy")}`,
    };
  }

  if (period === "month") {
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    return {
      kind: "monthly",
      year,
      month,
      fromDate: toApiDate(startOfMonth(now)),
      toDate: toApiDate(endOfMonth(now)),
      label: format(now, "MMMM yyyy"),
    };
  }

  const year = now.getFullYear();
  return {
    kind: "yearly",
    year,
    fromDate: toApiDate(startOfYear(now)),
    toDate: toApiDate(endOfYear(now)),
    label: String(year),
  };
}

export const DASHBOARD_PERIODS: { id: DashboardPeriod; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "month", label: "This month" },
  { id: "year", label: "This year" },
];

export type GstRangePreset = "today" | "yesterday" | "last7" | "month" | "year" | "custom";

export const GST_RANGE_PRESETS: { id: GstRangePreset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last7", label: "Last 7 days" },
  { id: "month", label: "This month" },
  { id: "year", label: "This year" },
  { id: "custom", label: "Custom range" },
];

export function resolveGstRange(
  preset: GstRangePreset,
  customFrom: string,
  customTo: string,
  now = new Date(),
): { fromDate: string; toDate: string; label: string } {
  if (preset === "today") {
    const date = toApiDate(now);
    return { fromDate: date, toDate: date, label: `Today · ${format(now, "dd MMM yyyy")}` };
  }

  if (preset === "yesterday") {
    const yesterday = subDays(now, 1);
    const date = toApiDate(yesterday);
    return { fromDate: date, toDate: date, label: `Yesterday · ${format(yesterday, "dd MMM yyyy")}` };
  }

  if (preset === "last7") {
    const from = subDays(now, 6);
    return {
      fromDate: toApiDate(from),
      toDate: toApiDate(now),
      label: `${format(from, "dd MMM")} – ${format(now, "dd MMM yyyy")}`,
    };
  }

  if (preset === "month") {
    return {
      fromDate: toApiDate(startOfMonth(now)),
      toDate: toApiDate(endOfMonth(now)),
      label: format(now, "MMMM yyyy"),
    };
  }

  if (preset === "year") {
    return {
      fromDate: toApiDate(startOfYear(now)),
      toDate: toApiDate(endOfYear(now)),
      label: String(now.getFullYear()),
    };
  }

  return {
    fromDate: customFrom,
    toDate: customTo,
    label: customFrom && customTo ? `${customFrom} – ${customTo}` : "Custom range",
  };
}

"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DASHBOARD_PERIODS,
  type DashboardPeriod,
} from "@/features/dashboard/period";

type ReportPeriodToolbarProps = {
  period: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
  dailyDate?: string;
  onDailyDateChange?: (value: string) => void;
  showDailyDate?: boolean;
  allowMonthly?: boolean;
  id?: string;
};

function isDashboardPeriod(value: string | null): value is DashboardPeriod {
  return value === "today" || value === "yesterday" || value === "month" || value === "year";
}

export function ReportPeriodToolbar({
  period,
  onPeriodChange,
  dailyDate,
  onDailyDateChange,
  showDailyDate = false,
  allowMonthly = true,
  id = "report-period",
}: ReportPeriodToolbarProps) {
  const options = allowMonthly
    ? DASHBOARD_PERIODS
    : DASHBOARD_PERIODS.filter((item) => item.id === "today" || item.id === "yesterday");
  const isDaily = period === "today" || period === "yesterday";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={period}
        onValueChange={(value) => {
          if (isDashboardPeriod(value)) {
            onPeriodChange(value);
          }
        }}
      >
        <SelectTrigger className="w-40" id={id} aria-label="Report period">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showDailyDate && isDaily ? (
        <Input
          type="date"
          value={dailyDate || ""}
          aria-label="Report date"
          className="w-40"
          onChange={(event) => onDailyDateChange?.(event.target.value)}
        />
      ) : null}
    </div>
  );
}

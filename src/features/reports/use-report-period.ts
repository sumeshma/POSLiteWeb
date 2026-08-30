"use client";

import { useMemo, useState } from "react";
import { formatDate } from "@/lib/date";
import {
  resolvePeriod,
  type DashboardPeriod,
  type ResolvedPeriod,
} from "@/features/dashboard/period";

export function useReportPeriod(initial: DashboardPeriod = "today") {
  const [period, setPeriod] = useState<DashboardPeriod>(initial);
  const [dailyDate, setDailyDate] = useState("");

  const resolved: ResolvedPeriod = useMemo(() => {
    const base = resolvePeriod(period);
    if (base.kind === "daily" && dailyDate) {
      return {
        ...base,
        date: dailyDate,
        fromDate: dailyDate,
        toDate: dailyDate,
        label: formatDate(dailyDate) || dailyDate,
      };
    }
    return base;
  }, [dailyDate, period]);

  function changePeriod(next: DashboardPeriod) {
    setPeriod(next);
    setDailyDate("");
  }

  return {
    period,
    setPeriod: changePeriod,
    dailyDate,
    setDailyDate,
    resolved,
  };
}

import { apiClient } from "@/lib/api-client";
import { toSearchParams } from "@/lib/search-params";
import type {
  DailyProfitLossReport,
  DailySalesReport,
  GstReport,
  MonthlyProfitLossReport,
  MonthlySalesReport,
  YearlyProfitLossReport,
  YearlySalesReport,
} from "@/types/report";

export async function getDailySalesReport(
  date?: string,
  signal?: AbortSignal,
): Promise<DailySalesReport> {
  return apiClient.get<DailySalesReport>(
    `/api/reports/daily${toSearchParams({ date })}`,
    { signal },
  );
}

export async function getMonthlySalesReport(
  year?: number,
  month?: number,
  signal?: AbortSignal,
): Promise<MonthlySalesReport> {
  return apiClient.get<MonthlySalesReport>(
    `/api/reports/monthly${toSearchParams({ year, month })}`,
    { signal },
  );
}

export async function getYearlySalesReport(
  year?: number,
  signal?: AbortSignal,
): Promise<YearlySalesReport> {
  return apiClient.get<YearlySalesReport>(
    `/api/reports/yearly${toSearchParams({ year })}`,
    { signal },
  );
}

export async function getDailyProfitLossReport(
  date?: string,
  signal?: AbortSignal,
): Promise<DailyProfitLossReport> {
  return apiClient.get<DailyProfitLossReport>(
    `/api/reports/profit-loss/daily${toSearchParams({ date })}`,
    { signal },
  );
}

export async function getMonthlyProfitLossReport(
  year?: number,
  month?: number,
  signal?: AbortSignal,
): Promise<MonthlyProfitLossReport> {
  return apiClient.get<MonthlyProfitLossReport>(
    `/api/reports/profit-loss/monthly${toSearchParams({ year, month })}`,
    { signal },
  );
}

export async function getYearlyProfitLossReport(
  year?: number,
  signal?: AbortSignal,
): Promise<YearlyProfitLossReport> {
  return apiClient.get<YearlyProfitLossReport>(
    `/api/reports/profit-loss/yearly${toSearchParams({ year })}`,
    { signal },
  );
}

export async function getGstReport(
  fromDate: string,
  toDate: string,
  signal?: AbortSignal,
): Promise<GstReport> {
  return apiClient.get<GstReport>(
    `/api/reports/gst${toSearchParams({ fromDate, toDate })}`,
    { signal },
  );
}

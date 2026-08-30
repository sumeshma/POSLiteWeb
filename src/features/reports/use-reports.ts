"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import {
  getDailyProfitLossReport,
  getDailySalesReport,
  getGstReport,
  getMonthlyProfitLossReport,
  getMonthlySalesReport,
  getYearlyProfitLossReport,
  getYearlySalesReport,
} from "@/services/reports.service";

export function useDailySalesQuery(date: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.reports.dailySales(date),
    queryFn: ({ signal }) => getDailySalesReport(date, signal),
    enabled: options?.enabled ?? true,
  });
}

export function useMonthlySalesQuery(
  year: number | undefined,
  month: number | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.reports.monthlySales(year, month),
    queryFn: ({ signal }) => getMonthlySalesReport(year, month, signal),
    enabled: options?.enabled ?? true,
  });
}

export function useYearlySalesQuery(year: number | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.reports.yearlySales(year),
    queryFn: ({ signal }) => getYearlySalesReport(year, signal),
    enabled: options?.enabled ?? true,
  });
}

export function useDailyProfitLossQuery(date: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.reports.dailyProfit(date),
    queryFn: ({ signal }) => getDailyProfitLossReport(date, signal),
    enabled: options?.enabled ?? true,
  });
}

export function useMonthlyProfitLossQuery(
  year: number | undefined,
  month: number | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.reports.monthlyProfit(year, month),
    queryFn: ({ signal }) => getMonthlyProfitLossReport(year, month, signal),
    enabled: options?.enabled ?? true,
  });
}

export function useYearlyProfitLossQuery(year: number | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.reports.yearlyProfit(year),
    queryFn: ({ signal }) => getYearlyProfitLossReport(year, signal),
    enabled: options?.enabled ?? true,
  });
}

export function useGstReportQuery(
  fromDate: string,
  toDate: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.reports.gst(fromDate, toDate),
    queryFn: ({ signal }) => getGstReport(fromDate, toDate, signal),
    enabled: (options?.enabled ?? true) && Boolean(fromDate && toDate),
  });
}

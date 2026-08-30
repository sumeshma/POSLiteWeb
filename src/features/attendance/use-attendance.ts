"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import { getEmployeeDashboard, listAttendance } from "@/services/attendance.service";
import type { AttendanceFilters } from "@/types/attendance";

export function useAttendanceQuery(filters: AttendanceFilters) {
  return useQuery({
    queryKey: queryKeys.attendance.list(filters),
    queryFn: ({ signal }) => listAttendance(filters, signal),
  });
}

export function useEmployeeDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.attendance.dashboard(),
    queryFn: ({ signal }) => getEmployeeDashboard(signal),
  });
}

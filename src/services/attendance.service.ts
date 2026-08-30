import { apiClient } from "@/lib/api-client";
import { toSearchParams } from "@/lib/search-params";
import type {
  AttendanceFilters,
  AttendanceRecord,
  EmployeeDashboard,
} from "@/types/attendance";

export async function listAttendance(
  filters: AttendanceFilters,
  signal?: AbortSignal,
): Promise<AttendanceRecord[]> {
  return apiClient.get<AttendanceRecord[]>(
    `/api/attendance${toSearchParams({
      from: filters.from,
      to: filters.to,
      userId: filters.userId,
    })}`,
    { signal },
  );
}

export async function getEmployeeDashboard(signal?: AbortSignal): Promise<EmployeeDashboard> {
  return apiClient.get<EmployeeDashboard>("/api/employee-dashboard", { signal });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import { listActivityLogs } from "@/services/activity-logs.service";
import type { ActivityLogFilters } from "@/types/activity-log";

export function useActivityLogsQuery(filters: ActivityLogFilters) {
  return useQuery({
    queryKey: queryKeys.activityLogs.list(filters),
    queryFn: ({ signal }) => listActivityLogs(filters, signal),
  });
}

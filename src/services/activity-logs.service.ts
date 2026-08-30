import { apiClient } from "@/lib/api-client";
import { toSearchParams } from "@/lib/search-params";
import type { PagedResult } from "@/types/api";
import type { ActivityLog, ActivityLogFilters } from "@/types/activity-log";

export async function listActivityLogs(
  filters: ActivityLogFilters,
  signal?: AbortSignal,
): Promise<PagedResult<ActivityLog>> {
  return apiClient.get<PagedResult<ActivityLog>>(
    `/api/activitylogs${toSearchParams({
      search: filters.search,
      userId: filters.userId,
      module: filters.module,
      actionType: filters.actionType,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      page: filters.page,
      pageSize: filters.pageSize,
    })}`,
    { signal },
  );
}

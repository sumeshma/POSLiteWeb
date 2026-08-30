"use client";

import { useMemo, useState } from "react";
import { RequirePermission } from "@/components/auth/require-permission";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { permissions } from "@/config/permissions";
import { useUsersQuery } from "@/features/users/use-users";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePermission } from "@/hooks/use-permission";
import { formatDateTime, toEndOfDayIso, toStartOfDayIso } from "@/lib/date";
import { getErrorMessage } from "@/types/api";
import type { ActivityLog } from "@/types/activity-log";
import { getShopUserDisplayName } from "@/types/user";
import { ActivityLogDetailDialog } from "./activity-log-detail-dialog";
import { useActivityLogsQuery } from "./use-activity-logs";

const PAGE_SIZE = 20;
const ALL = "all";

export function ActivityLogsPage() {
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState(ALL);
  const [module, setModule] = useState("");
  const [actionType, setActionType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ActivityLog | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const canManageUsers = usePermission(permissions.usersManage);
  const usersQuery = useUsersQuery({ enabled: canManageUsers });

  const listQuery = useActivityLogsQuery({
    search: debouncedSearch || undefined,
    userId: userId === ALL ? undefined : userId,
    module: module.trim() || undefined,
    actionType: actionType.trim() || undefined,
    fromDate: toStartOfDayIso(fromDate),
    toDate: toEndOfDayIso(toDate),
    page,
    pageSize: PAGE_SIZE,
  });
  const pageResult = listQuery.data;
  const items = pageResult?.items ?? [];

  const columns = useMemo<DataTableColumn<ActivityLog>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "When",
        cell: ({ row }) => formatDateTime(row.original.createdAt) || "—",
      },
      {
        accessorKey: "userName",
        header: "User",
        cell: ({ row }) => row.original.userName || "—",
      },
      {
        accessorKey: "module",
        header: "Module",
        cell: ({ row }) => row.original.module || "—",
      },
      {
        accessorKey: "actionType",
        header: "Action",
        cell: ({ row }) => row.original.actionType || "—",
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <button
            type="button"
            className="max-w-md truncate text-left font-medium text-primary hover:underline"
            onClick={() => setSelected(row.original)}
          >
            {row.original.description || "View details"}
          </button>
        ),
      },
    ],
    [],
  );

  return (
    <RequirePermission permission={permissions.activityLogs}>
      <PageContainer>
        <PageHeader
          title="Activity logs"
          description="Searchable audit events from the backend. This list is not generated in the browser."
        />

        <div className="space-y-4">
            <ListToolbar
              search={search}
              onSearchChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              searchPlaceholder="Search activity"
              filters={
                <>
                  <Select
                    value={userId}
                    onValueChange={(value) => {
                      setUserId(value ?? ALL);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="All users" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>All users</SelectItem>
                      {(usersQuery.data ?? []).map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {getShopUserDisplayName(user)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={module}
                    placeholder="Module"
                    aria-label="Module"
                    className="w-36"
                    onChange={(event) => {
                      setModule(event.target.value);
                      setPage(1);
                    }}
                  />
                  <Input
                    value={actionType}
                    placeholder="Action"
                    aria-label="Action type"
                    className="w-36"
                    onChange={(event) => {
                      setActionType(event.target.value);
                      setPage(1);
                    }}
                  />
                  <Input
                    type="date"
                    value={fromDate}
                    aria-label="From date"
                    className="w-36"
                    onChange={(event) => {
                      setFromDate(event.target.value);
                      setPage(1);
                    }}
                  />
                  <Input
                    type="date"
                    value={toDate}
                    aria-label="To date"
                    className="w-36"
                    onChange={(event) => {
                      setToDate(event.target.value);
                      setPage(1);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSearch("");
                      setUserId(ALL);
                      setModule("");
                      setActionType("");
                      setFromDate("");
                      setToDate("");
                      setPage(1);
                    }}
                  >
                    Clear
                  </Button>
                </>
              }
            />
            <div className="overflow-x-auto">
              <DataTable
                columns={columns}
                data={items}
                isLoading={listQuery.isLoading}
                isError={listQuery.isError}
                errorMessage={getErrorMessage(listQuery.error)}
                onRetry={() => void listQuery.refetch()}
                emptyTitle="No activity found"
                emptyDescription="Try a different search, user, module, or date range."
                page={pageResult?.page ?? page}
                pageCount={Math.max(1, pageResult?.totalPages ?? 1)}
                onPageChange={setPage}
              />
            </div>
        </div>

        <ActivityLogDetailDialog log={selected} onOpenChange={(open) => !open && setSelected(null)} />
      </PageContainer>
    </RequirePermission>
  );
}

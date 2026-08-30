"use client";

import { useMemo, useState } from "react";
import { RequirePermission } from "@/components/auth/require-permission";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { usePermission } from "@/hooks/use-permission";
import { formatCurrency } from "@/lib/currency";
import { formatDateTime, toEndOfDayIso, toStartOfDayIso } from "@/lib/date";
import { getErrorMessage } from "@/types/api";
import type { AttendanceRecord } from "@/types/attendance";
import { getShopUserDisplayName } from "@/types/user";
import { useAttendanceQuery, useEmployeeDashboardQuery } from "./use-attendance";

const PAGE_SIZE = 20;
const ALL = "all";

export function AttendancePage() {
  const [userId, setUserId] = useState(ALL);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const canManageUsers = usePermission(permissions.usersManage);
  const usersQuery = useUsersQuery({ enabled: canManageUsers });
  const dashboardQuery = useEmployeeDashboardQuery();
  const listQuery = useAttendanceQuery({
    from: toStartOfDayIso(fromDate),
    to: toEndOfDayIso(toDate),
    userId: userId === ALL ? undefined : userId,
  });

  const records = listQuery.data ?? [];
  const pageCount = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const items = records.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const loggedIn = dashboardQuery.data?.currentlyLoggedIn ?? [];
  const recent = dashboardQuery.data?.recentActivity ?? [];

  const columns = useMemo<DataTableColumn<AttendanceRecord>[]>(
    () => [
      {
        accessorKey: "employeeName",
        header: "Employee",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.employeeName || "—"}</p>
            <p className="text-xs text-muted-foreground">{row.original.username || "—"}</p>
          </div>
        ),
      },
      {
        accessorKey: "loginTime",
        header: "Check-in",
        cell: ({ row }) => formatDateTime(row.original.loginTime) || "—",
      },
      {
        accessorKey: "logoutTime",
        header: "Check-out",
        cell: ({ row }) => formatDateTime(row.original.logoutTime) || "Open",
      },
      {
        accessorKey: "workedHours",
        header: "Hours",
        cell: ({ row }) =>
          row.original.workedHours === null || row.original.workedHours === undefined
            ? "—"
            : row.original.workedHours.toFixed(2),
      },
      {
        accessorKey: "loginDevice",
        header: "Device",
        cell: ({ row }) => row.original.loginDevice || "—",
      },
      {
        accessorKey: "isAutoLogout",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.logoutTime ? (
              <StatusBadge
                active={!row.original.isAutoLogout}
                activeLabel="Logged out"
                inactiveLabel="Auto logout"
              />
            ) : (
              <StatusBadge active activeLabel="In session" />
            )}
            {row.original.isOutsideShiftLogin ? (
              <StatusBadge active={false} inactiveLabel="Outside shift" />
            ) : null}
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <RequirePermission permission={permissions.usersManage}>
      <PageContainer>
        <PageHeader
          title="Attendance"
          description="Login and logout records from the backend. Check-in and check-out are created by authentication, not by a separate attendance mutation."
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Currently signed in</CardTitle>
              <CardDescription>From the employee dashboard API.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {dashboardQuery.isError ? (
                <p className="text-destructive">{getErrorMessage(dashboardQuery.error)}</p>
              ) : loggedIn.length === 0 ? (
                <p className="text-muted-foreground">No one is currently signed in.</p>
              ) : (
                loggedIn.map((item) => (
                  <div key={`${item.userId}-${item.loginTime}`} className="flex justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.employeeName || item.username || "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.roleName || "—"}
                        {item.loginDevice ? ` · ${item.loginDevice}` : ""}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDateTime(item.loginTime)}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Bills and sales totals returned by the backend.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {recent.length === 0 ? (
                <p className="text-muted-foreground">No recent employee activity.</p>
              ) : (
                recent.map((item) => (
                  <div key={item.userId} className="flex justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.employeeName || "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.billsCreated} bills · {formatCurrency(item.totalSales)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(item.lastLogin) || "—"}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
            <ListToolbar
              hideSearch
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
                      <SelectValue placeholder="All employees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>All employees</SelectItem>
                      {(usersQuery.data ?? []).map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {getShopUserDisplayName(user)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                emptyTitle="No attendance records"
                emptyDescription="Try a different employee or date range. Records are created when users sign in and out."
                page={currentPage}
                pageCount={pageCount}
                onPageChange={setPage}
              />
            </div>
        </div>
      </PageContainer>
    </RequirePermission>
  );
}
